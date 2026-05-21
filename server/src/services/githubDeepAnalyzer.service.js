/**
 * Deep GitHub analyzer for the Specialization Fit Checker.
 *
 * Goes beyond the simple ATS analyzer:
 * - inspects the repository tree to detect CI, Docker, Kubernetes, tests,
 *   deployment manifests, and frameworks
 * - extracts a truncated README excerpt with control characters stripped
 *   (prompt-injection mitigation happens both here and in the prompt builder)
 * - returns a compressed payload that the ML service expects
 *
 * Heavy use of best-effort parallelism with per-call short timeouts so a
 * single slow repo does not delay the whole pipeline.
 */
import axios from "axios";

const BASE_URL = "https://api.github.com";
const TIMEOUT = 12000;
const MAX_TOP_REPOS = 6;
const README_EXCERPT_CHARS = 1200;

const getHeaders = () => {
  const token = process.env.GITHUB_TOKEN;
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const safeGet = async (url, opts = {}) => {
  try {
    const { data } = await axios.get(url, {
      headers: getHeaders(),
      timeout: TIMEOUT,
      ...opts,
    });
    return data;
  } catch {
    return null;
  }
};

const decodeBase64 = (b64) => {
  try {
    return Buffer.from(b64, "base64").toString("utf-8");
  } catch {
    return "";
  }
};

// Strip control chars (except \n and \t) and tighten whitespace. Untrusted
// README content can otherwise smuggle invisible chars or huge runs of newlines.
// eslint-disable-next-line no-control-regex
const CONTROL_CHAR_RE = /[\x00-\x08\x0B-\x1F\x7F]/g;
const sanitizeText = (text) =>
  String(text || "")
    .replace(CONTROL_CHAR_RE, " ")
    .replace(/\r/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .replace(/[ \t]{3,}/g, "  ")
    .trim();

const truncate = (text, n) =>
  text.length > n ? `${text.slice(0, n).trimEnd()}…` : text;

// --- framework / signal detection -------------------------------------------

const FRAMEWORK_HINTS = {
  // node / web
  "react": ["react", "next", "vite"],
  "next.js": ["next"],
  "express": ["express"],
  "fastify": ["fastify"],
  "nestjs": ["@nestjs/"],
  "tailwind": ["tailwindcss"],
  "vue": ["vue"],
  "svelte": ["svelte"],
  // python
  "django": ["django"],
  "flask": ["flask"],
  "fastapi": ["fastapi"],
  "pytorch": ["torch"],
  "tensorflow": ["tensorflow"],
  "scikit-learn": ["scikit-learn", "sklearn"],
  "langchain": ["langchain"],
  "llama-index": ["llama-index", "llama_index"],
  // jvm
  "spring": ["spring-boot", "org.springframework"],
  // go/rust
  "gin": ["gin-gonic/gin"],
  "actix": ["actix-web"],
};

const detectFrameworksFromManifest = (filename, content) => {
  const lower = content.toLowerCase();
  const hits = new Set();
  for (const [name, needles] of Object.entries(FRAMEWORK_HINTS)) {
    if (needles.some((n) => lower.includes(n))) hits.add(name);
  }
  // manifest itself is a signal
  if (filename === "package.json") hits.add("node.js");
  if (filename === "requirements.txt" || filename === "pyproject.toml")
    hits.add("python");
  if (filename === "go.mod") hits.add("go");
  if (filename === "Cargo.toml") hits.add("rust");
  if (filename === "pom.xml" || filename === "build.gradle") hits.add("jvm");
  return [...hits];
};

const inspectTree = (tree) => {
  const signals = {
    has_ci: false,
    has_docker: false,
    has_kubernetes: false,
    has_tests: false,
    has_deployment: false,
    manifestFiles: [],
  };
  if (!Array.isArray(tree)) return signals;

  for (const node of tree) {
    if (!node || typeof node.path !== "string") continue;
    const p = node.path.toLowerCase();

    if (p.startsWith(".github/workflows/") || p === ".gitlab-ci.yml" || p === "circleci/config.yml" || p === ".circleci/config.yml") {
      signals.has_ci = true;
    }
    if (p === "dockerfile" || p.endsWith("/dockerfile") || p === "docker-compose.yml" || p.endsWith("/docker-compose.yml")) {
      signals.has_docker = true;
    }
    if (p.startsWith("k8s/") || p.startsWith("kubernetes/") || p.includes("helm/") || p.endsWith(".yaml") && p.includes("deployment")) {
      if (p.includes("k8s") || p.includes("kubernetes") || p.includes("helm")) {
        signals.has_kubernetes = true;
      }
    }
    if (
      p.startsWith("tests/") ||
      p.startsWith("test/") ||
      p.includes("__tests__/") ||
      p.endsWith(".test.js") ||
      p.endsWith(".test.ts") ||
      p.endsWith(".spec.js") ||
      p.endsWith(".spec.ts") ||
      p.endsWith("_test.go") ||
      p.endsWith("_test.py") ||
      p.startsWith("cypress/") ||
      p.startsWith("playwright/")
    ) {
      signals.has_tests = true;
    }
    if (
      p === "vercel.json" ||
      p === "netlify.toml" ||
      p === "render.yaml" ||
      p === "fly.toml" ||
      p === "app.yaml" ||
      p === "serverless.yml" ||
      p.endsWith("/terraform.tfstate") ||
      p === "main.tf"
    ) {
      signals.has_deployment = true;
    }

    const filename = p.split("/").pop();
    if (
      [
        "package.json",
        "requirements.txt",
        "pyproject.toml",
        "go.mod",
        "cargo.toml",
        "pom.xml",
        "build.gradle",
      ].includes(filename)
    ) {
      signals.manifestFiles.push(node.path);
    }
  }

  return signals;
};

// --- GitHub fetchers --------------------------------------------------------

const fetchRepoTree = async (owner, repo, defaultBranch) => {
  if (!defaultBranch) return null;
  const data = await safeGet(
    `${BASE_URL}/repos/${owner}/${repo}/git/trees/${encodeURIComponent(
      defaultBranch
    )}?recursive=1`
  );
  return data?.tree || null;
};

const fetchReadme = async (owner, repo) => {
  const data = await safeGet(`${BASE_URL}/repos/${owner}/${repo}/readme`);
  if (!data || !data.content) return { exists: false, excerpt: "" };
  const decoded = decodeBase64(data.content);
  return { exists: true, excerpt: truncate(sanitizeText(decoded), README_EXCERPT_CHARS) };
};

const fetchLanguages = async (owner, repo) => {
  const data = await safeGet(`${BASE_URL}/repos/${owner}/${repo}/languages`);
  return data || {};
};

const fetchCommitCount = async (owner, repo) => {
  const data = await safeGet(
    `${BASE_URL}/repos/${owner}/${repo}/commits?per_page=100`
  );
  return Array.isArray(data) ? data.length : 0;
};

const fetchManifestContent = async (owner, repo, path) => {
  const data = await safeGet(
    `${BASE_URL}/repos/${owner}/${repo}/contents/${encodeURIComponent(path)}`
  );
  if (!data || !data.content) return "";
  return decodeBase64(data.content);
};

// --- public API -------------------------------------------------------------

export const fetchProfile = async (username) => {
  const { data } = await axios.get(`${BASE_URL}/users/${username}`, {
    headers: getHeaders(),
    timeout: TIMEOUT,
  });
  return data;
};

export const fetchRepos = async (username) => {
  const { data } = await axios.get(
    `${BASE_URL}/users/${username}/repos?per_page=100&sort=updated`,
    { headers: getHeaders(), timeout: TIMEOUT }
  );
  return Array.isArray(data) ? data : [];
};

const summarizeRepo = async (repo, ownerLogin) => {
  const owner = repo.owner?.login || ownerLogin;
  const [readme, languages, commitCount, tree] = await Promise.all([
    fetchReadme(owner, repo.name),
    fetchLanguages(owner, repo.name),
    fetchCommitCount(owner, repo.name),
    fetchRepoTree(owner, repo.name, repo.default_branch),
  ]);

  const treeSignals = inspectTree(tree);

  // Pull at most 2 manifests so we get framework signal without exploding token usage.
  const manifestContents = await Promise.all(
    treeSignals.manifestFiles.slice(0, 2).map(async (path) => {
      const text = await fetchManifestContent(owner, repo.name, path);
      return { path, text };
    })
  );

  const detected = new Set();
  for (const { path, text } of manifestContents) {
    const filename = path.split("/").pop();
    detectFrameworksFromManifest(filename, text).forEach((f) =>
      detected.add(f)
    );
  }
  if (treeSignals.has_docker) detected.add("docker");
  if (treeSignals.has_kubernetes) detected.add("kubernetes");
  if (treeSignals.has_ci) detected.add("ci/cd");

  return {
    name: repo.name,
    description: sanitizeText(repo.description || ""),
    stars: repo.stargazers_count || 0,
    forks: repo.forks_count || 0,
    size_kb: repo.size || 0,
    primary_language: repo.language || null,
    languages: Object.keys(languages),
    topics: Array.isArray(repo.topics) ? repo.topics.slice(0, 10) : [],
    has_readme: readme.exists,
    readme_excerpt: readme.excerpt,
    commit_count: commitCount,
    last_pushed: repo.pushed_at || null,
    is_fork: !!repo.fork,
    is_archived: !!repo.archived,
    has_ci: treeSignals.has_ci,
    has_docker: treeSignals.has_docker,
    has_kubernetes: treeSignals.has_kubernetes,
    has_tests: treeSignals.has_tests,
    has_deployment: treeSignals.has_deployment,
    detected_frameworks: [...detected],
    license: repo.license?.spdx_id || null,
  };
};

const yearsBetween = (iso, now = new Date()) => {
  if (!iso) return 0;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return 0;
  return (now.getTime() - d.getTime()) / (365.25 * 24 * 3600 * 1000);
};

const aggregateLanguages = (repos) => {
  const totals = {};
  for (const repo of repos) {
    if (!repo.primary_language) continue;
    totals[repo.primary_language] =
      (totals[repo.primary_language] || 0) + (repo.size_kb || 1);
  }
  return totals;
};

const contributionSignal = (profile, repos) => {
  const recent = repos.filter((r) => {
    if (!r.last_pushed) return false;
    const days = (Date.now() - new Date(r.last_pushed).getTime()) / 86_400_000;
    return days < 180;
  });
  if (recent.length >= 5) return "high";
  if (recent.length >= 2) return "moderate";
  if (profile.public_repos > 0) return "low";
  return "low";
};

/**
 * Build the full payload the ML service expects: profile + top compressed repos.
 */
export const buildDeepAnalysis = async (username) => {
  const profile = await fetchProfile(username);
  const allRepos = await fetchRepos(username);

  // Prioritize non-fork, non-archived, recently active, well-starred repos.
  const ranked = allRepos
    .filter((r) => !r.fork && !r.archived)
    .sort((a, b) => {
      const starDiff = (b.stargazers_count || 0) - (a.stargazers_count || 0);
      if (starDiff !== 0) return starDiff;
      return (
        new Date(b.pushed_at || 0).getTime() -
        new Date(a.pushed_at || 0).getTime()
      );
    })
    .slice(0, MAX_TOP_REPOS);

  const summaries = await Promise.all(
    ranked.map((repo) => summarizeRepo(repo, profile.login))
  );

  const totalStars = summaries.reduce((s, r) => s + (r.stars || 0), 0);

  const profileSummary = {
    username: profile.login,
    name: profile.name || null,
    bio: sanitizeText(profile.bio || ""),
    public_repos: profile.public_repos || 0,
    followers: profile.followers || 0,
    following: profile.following || 0,
    account_age_years: yearsBetween(profile.created_at),
    total_stars: totalStars,
    languages_distribution: aggregateLanguages(summaries),
    contribution_signal: contributionSignal(profile, summaries),
  };

  return {
    profile: profileSummary,
    repos: summaries,
    raw: {
      avatar_url: profile.avatar_url,
      html_url: profile.html_url,
    },
  };
};

/**
 * Builds the per-candidate deep GitHub analysis payload that the ML service
 * expects for the Candidate Shortlist feature.
 *
 * Heavy lifting (GitHub fetches + tree inspection) is reused from
 * githubDeepAnalyzer.service.js. This file adds:
 *   - URL/username extraction from raw Excel rows
 *   - duplicate dedupe (case-insensitive on username)
 *   - bounded concurrency so a large sheet does not stampede the GitHub API
 *   - graceful per-candidate failure: a 404/private/rate-limited profile is
 *     dropped from the batch, not propagated as a 500
 */
import { extractUsername } from "../utils/extractUsername.js";
import { withCache } from "../utils/cache.js";
import { buildDeepAnalysis } from "./githubDeepAnalyzer.service.js";

const PROFILE_TTL = 10 * 60 * 1000;
const DEFAULT_CONCURRENCY = 4;

// Tiny p-limit-style runner — keeps the dep tree clean and is enough for our
// small (≤300) candidate batches.
const runWithConcurrency = async (items, limit, worker) => {
  const results = new Array(items.length);
  let cursor = 0;
  const runners = new Array(Math.min(limit, items.length))
    .fill(0)
    .map(async () => {
      while (true) {
        const index = cursor++;
        if (index >= items.length) return;
        results[index] = await worker(items[index], index);
      }
    });
  await Promise.all(runners);
  return results;
};

const dedupeCandidates = (rows) => {
  const seen = new Map();
  const skipped = [];
  for (const row of rows) {
    const username = extractUsername(row.github_url);
    if (!username) {
      skipped.push({ ...row, reason: "invalid_github_url" });
      continue;
    }
    const key = username.toLowerCase();
    if (seen.has(key)) {
      skipped.push({ ...row, reason: "duplicate" });
      continue;
    }
    seen.set(key, { ...row, github_username: username });
  }
  return { unique: [...seen.values()], skipped };
};

const fetchSingleCandidate = async (row) => {
  try {
    const analysis = await withCache(
      `gh:deep:${row.github_username.toLowerCase()}`,
      PROFILE_TTL,
      () => buildDeepAnalysis(row.github_username)
    );
    return {
      ok: true,
      payload: {
        github_url: row.github_url,
        name: row.name || null,
        email: row.email || null,
        college: row.college || null,
        resume_url: row.resume_url || null,
        linkedin_url: row.linkedin_url || null,
        profile: analysis.profile,
        repos: analysis.repos,
        _raw: analysis.raw,
      },
    };
  } catch (error) {
    const status = error.response?.status;
    let reason = "github_fetch_failed";
    if (status === 404) reason = "profile_not_found";
    else if (status === 403) reason = "github_rate_limited";
    return {
      ok: false,
      skipped: { ...row, reason },
    };
  }
};

export const buildShortlistBatch = async (rows, concurrency = DEFAULT_CONCURRENCY) => {
  const { unique, skipped } = dedupeCandidates(rows);

  const fetched = await runWithConcurrency(unique, concurrency, fetchSingleCandidate);

  const candidates = [];
  const allSkipped = [...skipped];
  for (const result of fetched) {
    if (result.ok) candidates.push(result.payload);
    else allSkipped.push(result.skipped);
  }

  return { candidates, skipped: allSkipped };
};

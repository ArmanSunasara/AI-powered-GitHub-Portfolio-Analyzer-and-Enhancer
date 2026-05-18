import {
  getRepoReadme,
  getRepoCommits,
  getRepoLanguages,
} from "./github.service.js";

export const analyzeRepos = async (repos, username) => {
  if (!Array.isArray(repos) || repos.length === 0) {
    return [];
  }

  const topRepos = [...repos]
    .filter((r) => !r.fork)
    .sort(
      (a, b) =>
        (b.stargazers_count || 0) - (a.stargazers_count || 0)
    )
    .slice(0, 5);

  const analysisPromises = topRepos.map(async (repo) => {
    const owner = repo.owner?.login || username;
    const [readme, commits, languages] = await Promise.all([
      getRepoReadme(owner, repo.name),
      getRepoCommits(owner, repo.name),
      getRepoLanguages(owner, repo.name),
    ]);

    return {
      name: repo.name,
      stars: repo.stargazers_count || 0,
      hasReadme: !!readme,
      commitCount: Array.isArray(commits) ? commits.length : 0,
      languages: Object.keys(languages || {}),
    };
  });

  return Promise.all(analysisPromises);
};

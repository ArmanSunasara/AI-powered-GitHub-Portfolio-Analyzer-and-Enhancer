import {
  getRepoReadme,
  getRepoCommits,
  getRepoLanguages,
} from "./github.service.js";

export const analyzeRepos = async (repos, username) => {
  if (!repos || repos.length === 0) {
    return [];
  }

  const owner = username;
  const topRepos = [...repos]
    .sort((a, b) => b.stargazers_count - a.stargazers_count)
    .slice(0, 5);

  const analysisPromises = topRepos.map(async (repo) => {
    const [readme, commits, languages] = await Promise.all([
      getRepoReadme(owner, repo.name),
      getRepoCommits(owner, repo.name),
      getRepoLanguages(owner, repo.name),
    ]);

    return {
      name: repo.name,
      stars: repo.stargazers_count,
      hasReadme: !!readme,
      commitCount: commits.length,
      languages: Object.keys(languages || {}),
    };
  });

  return Promise.all(analysisPromises);
};

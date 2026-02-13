import {
  getRepoReadme,
  getRepoCommits,
  getRepoLanguages,
} from "./github.service.js";

export const analyzeRepos = async (repos, username) => {

  // sort by stars (recruiter mindset)
  repos.sort((a, b) => b.stargazers_count - a.stargazers_count);

  let analyzed = [];

  for (const repo of repos.slice(0, 5)) {
    const readme = await getRepoReadme(username, repo.name);
    const commits = await getRepoCommits(username, repo.name);
    const languages = await getRepoLanguages(username, repo.name);

    analyzed.push({
      name: repo.name,
      stars: repo.stargazers_count,
      hasReadme: !!readme,
      commitCount: commits.length,
      languages: Object.keys(languages),
    });
  }

  return analyzed;
};

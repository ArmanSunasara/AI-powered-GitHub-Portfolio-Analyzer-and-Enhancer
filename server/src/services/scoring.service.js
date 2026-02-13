export const calculateScore = (repos) => {
  let score = 0;

  // Documentation score
  const withReadme = repos.filter(r => r.description);
  score += (withReadme.length / repos.length) * 20;

  // Project completeness
  const completeRepos = repos.filter(r => !r.fork);
  score += (completeRepos.length / repos.length) * 20;

  return Math.min(Math.round(score), 100);
};

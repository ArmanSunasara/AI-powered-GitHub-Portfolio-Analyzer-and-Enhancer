export const calculateAdvancedScore = (repoAnalysis) => {
  if (!Array.isArray(repoAnalysis) || repoAnalysis.length === 0) return 0;

  const total = repoAnalysis.length;

  const readmeScore =
    repoAnalysis.filter((r) => r.hasReadme).length / total;

  const commitScore =
    repoAnalysis.filter((r) => (r.commitCount || 0) > 5).length / total;

  const languageSet = new Set();
  repoAnalysis.forEach((r) => {
    if (Array.isArray(r.languages)) {
      r.languages.forEach((l) => languageSet.add(l));
    }
  });
  const languageScore = Math.min(languageSet.size / 4, 1);

  const totalStars = repoAnalysis.reduce(
    (sum, r) => sum + (r.stars || 0),
    0
  );
  const starScore = Math.min(totalStars / 50, 1);

  const avgCommits =
    repoAnalysis.reduce((sum, r) => sum + (r.commitCount || 0), 0) / total;
  const consistencyScore = Math.min(avgCommits / 20, 1);

  const score =
    readmeScore * 25 +
    commitScore * 25 +
    languageScore * 20 +
    starScore * 15 +
    consistencyScore * 15;

  return Math.min(Math.round(score), 100);
};

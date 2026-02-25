export const calculateAdvancedScore = (repoAnalysis) => {
  if (!repoAnalysis || repoAnalysis.length === 0) return 0;

  let score = 0;

  const readmeScore =
    repoAnalysis.filter((r) => r.hasReadme).length / repoAnalysis.length;

  const commitScore =
    repoAnalysis.filter((r) => r.commitCount > 5).length / repoAnalysis.length;

  const languageSet = new Set();
  repoAnalysis.forEach((r) =>
    r.languages.forEach((l) => languageSet.add(l))
  );

  const languageScore = Math.min(languageSet.size / 4, 1);

  const totalStars = repoAnalysis.reduce((sum, r) => sum + r.stars, 0);
  const starScore = Math.min(totalStars / 10, 1);

  const avgCommits =
    repoAnalysis.reduce((sum, r) => sum + r.commitCount, 0) / repoAnalysis.length;
  const consistencyScore = Math.min(avgCommits / 20, 1);

  score += readmeScore * 25;
  score += commitScore * 25;
  score += languageScore * 20;
  score += starScore * 15;
  score += consistencyScore * 15;

  return Math.min(Math.round(score), 100);
};

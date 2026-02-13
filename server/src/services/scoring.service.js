export const calculateAdvancedScore = (repoAnalysis) => {

  if (repoAnalysis.length === 0) return 0;

  let score = 0;

  const readmeScore =
    repoAnalysis.filter(r => r.hasReadme).length / repoAnalysis.length;

  const commitScore =
    repoAnalysis.filter(r => r.commitCount > 5).length /
    repoAnalysis.length;

  const languageSet = new Set();
  repoAnalysis.forEach(r => r.languages.forEach(l => languageSet.add(l)));

  const languageScore = languageSet.size > 3 ? 1 : 0.5;

  score += readmeScore * 30;
  score += commitScore * 30;
  score += languageScore * 20;

  return Math.round(score);
};

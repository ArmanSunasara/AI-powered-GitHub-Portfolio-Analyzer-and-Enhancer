import { extractUsername } from "../utils/extractUsername.js";
import { getUserProfile, getUserRepos } from "../services/github.service.js";
import { calculateScore } from "../services/scoring.service.js";

export const analyzeGithub = async (req, res) => {
  try {
    const { url } = req.body;

    const username = extractUsername(url);

    const profile = await getUserProfile(username);
    const repos = await getUserRepos(username);

    const score = calculateScore(repos);

    res.json({
      username: profile.login,
      publicRepos: profile.public_repos,
      score,
    });

  } catch (error) {
    res.status(500).json({ error: "Analysis failed" });
  }
};

import { extractUsername } from "../utils/extractUsername.js";
import { getUserProfile, getUserRepos } from "../services/github.service.js";
import { analyzeRepos } from "../services/repoAnalyzer.service.js";
import { calculateAdvancedScore } from "../services/scoring.service.js";
import axios from "axios";

export const analyzeGithub = async (req, res) => {
  try {
    const { url } = req.body;

    const username = extractUsername(url);

    const profile = await getUserProfile(username);
    const repos = await getUserRepos(username);

    const repoAnalysis = await analyzeRepos(repos, username);

    const score = calculateAdvancedScore(repoAnalysis);

    const aiResponse = await axios.post("http://localhost:8000/analyze", {
      score,
      repoAnalysis,
    });

    res.json({
      username: profile.login,
      publicRepos: profile.public_repos,
      score,
      repoAnalysis,
      aiFeedback: aiResponse.data,
    });

  } catch (error) {
    console.error("Analysis Error:", error.message);

    res.status(500).json({
      error: "Analysis failed",
    });
  }
};
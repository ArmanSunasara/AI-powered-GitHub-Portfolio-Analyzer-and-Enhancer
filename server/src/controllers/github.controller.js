import { extractUsername } from "../utils/extractUsername.js";
import { getUserProfile, getUserRepos } from "../services/github.service.js";
import { analyzeRepos } from "../services/repoAnalyzer.service.js";
import { calculateAdvancedScore } from "../services/scoring.service.js";
import axios from "axios";
import config from "../config/index.js";

export const analyzeGithub = async (req, res, next) => {
  try {
    const { url } = req.body;
    const username = extractUsername(url);

    if (!username) {
      return res.status(400).json({
        success: false,
        error: "Invalid GitHub URL format",
      });
    }

    const [profile, repos] = await Promise.all([
      getUserProfile(username),
      getUserRepos(username),
    ]);

    const repoAnalysis = await analyzeRepos(repos, username);
    const score = calculateAdvancedScore(repoAnalysis);

    let aiFeedback = null;
    try {
      const aiResponse = await axios.post(
        `${config.mlServiceUrl}/analyze`,
        {
          score,
          repoAnalysis,
          username: profile.login,
        },
        {
          timeout: 30000,
        }
      );
      aiFeedback = aiResponse.data?.data || aiResponse.data;
    } catch (aiError) {
      console.warn("AI service unavailable:", aiError.message);
    }

    res.json({
      success: true,
      username: profile.login,
      avatarUrl: profile.avatar_url,
      bio: profile.bio,
      publicRepos: profile.public_repos,
      followers: profile.followers,
      following: profile.following,
      createdAt: profile.created_at,
      score,
      repoAnalysis,
      aiFeedback,
    });
  } catch (error) {
    console.error("Analysis Error:", error.message);
    next(error);
  }
};

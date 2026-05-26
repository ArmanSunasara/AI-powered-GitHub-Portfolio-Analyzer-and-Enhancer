/**
 * Resume vs GitHub Match controller.
 *
 * Pipeline:
 *   1. Extract plain text from the uploaded resume (PDF / DOCX / TXT).
 *   2. Run the same GitHub deep-analysis the Specialization Fit Checker uses
 *      (cached per user) to get a compressed profile + top repos.
 *   3. Forward { resume_text, profile, repos } to the ML service, which parses
 *      the resume and scores it against the GitHub evidence in one LLM call.
 *
 * The resume text is never cached (it's per-upload and sensitive); only the
 * GitHub analysis is cached, since that's the expensive, reusable part.
 */
import axios from "axios";

import { extractUsername } from "../utils/extractUsername.js";
import { parseResume } from "../utils/parseResume.js";
import { buildDeepAnalysis } from "../services/githubDeepAnalyzer.service.js";
import { withCache } from "../utils/cache.js";

const ML_TIMEOUT = 90_000;
const PROFILE_TTL = 10 * 60 * 1000;

export const analyzeResumeMatch = async (req, res, next) => {
  try {
    const { url } = req.body;

    const username = extractUsername(url);
    if (!username) {
      return res
        .status(400)
        .json({ success: false, error: "Invalid GitHub URL or username" });
    }

    let resumeText;
    try {
      resumeText = await parseResume(
        req.file.buffer,
        req.file.originalname,
        req.file.mimetype
      );
    } catch (parseError) {
      return res.status(400).json({
        success: false,
        error: parseError.message || "Failed to read the resume file",
      });
    }

    const mlServiceUrl = process.env.ML_SERVICE_URL;
    if (!mlServiceUrl) {
      return res
        .status(503)
        .json({ success: false, error: "AI service is not configured" });
    }

    const analysis = await withCache(
      `gh:deep:${username.toLowerCase()}`,
      PROFILE_TTL,
      () => buildDeepAnalysis(username)
    );

    const { data: payload } = await axios.post(
      `${mlServiceUrl}/resume-match/analyze`,
      {
        resume_text: resumeText,
        profile: analysis.profile,
        repos: analysis.repos,
      },
      { timeout: ML_TIMEOUT }
    );

    if (!payload?.success) {
      throw new Error(payload?.detail || "AI service returned an error");
    }

    res.json({
      success: true,
      data: {
        report: payload.data,
        profile: analysis.profile,
        avatarUrl: analysis.raw.avatar_url,
        htmlUrl: analysis.raw.html_url,
        topRepoNames: analysis.repos.map((r) => r.name),
      },
    });
  } catch (error) {
    if (error.response?.status === 404) {
      return res
        .status(404)
        .json({ success: false, error: "GitHub user not found" });
    }
    if (error.response?.status === 403) {
      return res.status(429).json({
        success: false,
        error: "GitHub API rate limit reached. Please try again later.",
      });
    }
    if (error.code === "ECONNABORTED" || error.code === "ETIMEDOUT") {
      return res.status(504).json({
        success: false,
        error: "AI service timed out. Please try again.",
      });
    }
    next(error);
  }
};

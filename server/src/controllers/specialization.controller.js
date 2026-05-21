import axios from "axios";
import crypto from "node:crypto";

import { extractUsername } from "../utils/extractUsername.js";
import { buildDeepAnalysis } from "../services/githubDeepAnalyzer.service.js";
import { withCache } from "../utils/cache.js";
import { SPECIALIZATION_ROLES } from "../utils/specializationRoles.js";

const ML_TIMEOUT = 60_000;
const PROFILE_TTL = 10 * 60 * 1000;
const REPORT_TTL = 30 * 60 * 1000;

const hash = (input) =>
  crypto.createHash("sha256").update(input).digest("hex").slice(0, 16);

export const listRoles = async (_req, res) => {
  // Served directly from the Node side so the dropdown works even if the ML
  // service is briefly down. The ML side still validates the role_id by ID.
  res.json({ success: true, data: SPECIALIZATION_ROLES });
};

export const analyzeSpecializationFit = async (req, res, next) => {
  try {
    const { url, roleId, jobDescription } = req.body;

    const username = extractUsername(url);
    if (!username) {
      return res
        .status(400)
        .json({ success: false, error: "Invalid GitHub URL or username" });
    }

    const mlServiceUrl = process.env.ML_SERVICE_URL;
    if (!mlServiceUrl) {
      return res
        .status(503)
        .json({ success: false, error: "AI service is not configured" });
    }

    // Cache the deep GitHub analysis per user — the LLM call is cached
    // by the full (user, role, JD) tuple.
    const analysis = await withCache(
      `gh:deep:${username.toLowerCase()}`,
      PROFILE_TTL,
      () => buildDeepAnalysis(username)
    );

    const cacheKey = `fit:${username.toLowerCase()}:${roleId}:${hash(jobDescription)}`;

    const report = await withCache(cacheKey, REPORT_TTL, async () => {
      const { data: payload } = await axios.post(
        `${mlServiceUrl}/specialization/analyze`,
        {
          profile: analysis.profile,
          repos: analysis.repos,
          role_id: roleId,
          job_description: jobDescription,
        },
        { timeout: ML_TIMEOUT }
      );
      if (!payload?.success) {
        throw new Error(payload?.detail || "AI service returned an error");
      }
      return payload.data;
    });

    res.json({
      success: true,
      data: {
        report,
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

/**
 * GitHub Profile Compare controller.
 *
 * Pipeline:
 *   1. Validate two GitHub URLs / usernames.
 *   2. Run the same deep GitHub analysis the Specialization Fit Checker uses,
 *      in parallel, with per-user caching so repeat compares are cheap.
 *   3. Forward both compressed { profile, repos } payloads to the ml-service,
 *      which runs a single LLM call to score and compare them.
 *
 * If one user 404s we surface a clear which-side-failed error rather than a
 * generic 502.
 */
import axios from "axios";

import { buildDeepAnalysis } from "../services/githubDeepAnalyzer.service.js";
import { withCache } from "../utils/cache.js";

const ML_TIMEOUT = 120_000;
const PROFILE_TTL = 10 * 60 * 1000;

const fetchDeep = (username) =>
  withCache(`gh:deep:${username.toLowerCase()}`, PROFILE_TTL, () =>
    buildDeepAnalysis(username)
  );

export const compareGithubProfiles = async (req, res, next) => {
  try {
    const { usernameA, usernameB } = req.body;

    const mlServiceUrl = process.env.ML_SERVICE_URL;
    if (!mlServiceUrl) {
      return res
        .status(503)
        .json({ success: false, error: "AI service is not configured" });
    }

    // Run both analyses in parallel but settle independently so we can report
    // exactly which handle was the problem if one of them fails.
    const [resultA, resultB] = await Promise.allSettled([
      fetchDeep(usernameA),
      fetchDeep(usernameB),
    ]);

    const errFor = (label, settled) => {
      if (settled.status !== "rejected") return null;
      const status = settled.reason?.response?.status;
      if (status === 404) {
        return {
          status: 404,
          error: `${label} (${label === "Profile A" ? usernameA : usernameB}) was not found on GitHub`,
        };
      }
      if (status === 403) {
        return {
          status: 429,
          error: "GitHub API rate limit reached. Please try again later.",
        };
      }
      return null;
    };

    const errA = errFor("Profile A", resultA);
    if (errA) return res.status(errA.status).json({ success: false, error: errA.error });
    const errB = errFor("Profile B", resultB);
    if (errB) return res.status(errB.status).json({ success: false, error: errB.error });

    if (resultA.status === "rejected") throw resultA.reason;
    if (resultB.status === "rejected") throw resultB.reason;

    const analysisA = resultA.value;
    const analysisB = resultB.value;

    const { data: payload } = await axios.post(
      `${mlServiceUrl}/github-compare/analyze`,
      {
        candidate_a: { profile: analysisA.profile, repos: analysisA.repos },
        candidate_b: { profile: analysisB.profile, repos: analysisB.repos },
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
        candidates: {
          A: {
            profile: analysisA.profile,
            avatarUrl: analysisA.raw.avatar_url,
            htmlUrl: analysisA.raw.html_url,
            topRepoNames: analysisA.repos.map((r) => r.name),
          },
          B: {
            profile: analysisB.profile,
            avatarUrl: analysisB.raw.avatar_url,
            htmlUrl: analysisB.raw.html_url,
            topRepoNames: analysisB.repos.map((r) => r.name),
          },
        },
      },
    });
  } catch (error) {
    if (error.code === "ECONNABORTED" || error.code === "ETIMEDOUT") {
      return res.status(504).json({
        success: false,
        error: "AI service timed out. Please try again.",
      });
    }
    next(error);
  }
};

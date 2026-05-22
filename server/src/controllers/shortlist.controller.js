/**
 * Candidate Shortlist controller.
 *
 * Pipeline:
 *   1. Parse the uploaded Excel into roster rows.
 *   2. Fan out GitHub deep-analysis with bounded concurrency, dropping
 *      invalid / unreachable profiles into a "skipped" bucket.
 *   3. Forward the batch (plus JD + count) to the ML service for ranking.
 *   4. Echo the ranked top-N back to the client, annotated with avatar
 *      URLs from the GitHub fetch so the UI doesn't need a second hop.
 */
import axios from "axios";

import { parseShortlistExcel } from "../utils/parseShortlistExcel.js";
import { buildShortlistBatch } from "../services/shortlistAnalyzer.service.js";

const ML_TIMEOUT = 180_000;

export const analyzeShortlist = async (req, res, next) => {
  try {
    const { jobDescription, shortlistCount } = req.body;

    let rows;
    try {
      rows = await parseShortlistExcel(req.file.buffer);
    } catch (parseError) {
      return res.status(400).json({
        success: false,
        error: parseError.message || "Failed to parse Excel file",
      });
    }

    if (rows.length === 0) {
      return res.status(400).json({
        success: false,
        error: "No candidate rows found in the uploaded sheet",
      });
    }

    const mlServiceUrl = process.env.ML_SERVICE_URL;
    if (!mlServiceUrl) {
      return res
        .status(503)
        .json({ success: false, error: "AI service is not configured" });
    }

    const { candidates, skipped } = await buildShortlistBatch(rows);

    if (candidates.length === 0) {
      return res.status(400).json({
        success: false,
        error:
          "None of the GitHub profiles could be analyzed. Check the URLs and try again.",
        skipped,
      });
    }

    // Index by username so we can re-attach the avatar after the ML response.
    const rawByUsername = new Map();
    const mlPayload = candidates.map((c) => {
      rawByUsername.set(c.profile.username.toLowerCase(), c._raw);
      const { _raw, ...rest } = c;
      return rest;
    });

    const { data: payload } = await axios.post(
      `${mlServiceUrl}/shortlist/analyze`,
      {
        job_description: jobDescription,
        shortlist_count: shortlistCount,
        candidates: mlPayload,
      },
      { timeout: ML_TIMEOUT }
    );

    if (!payload?.success) {
      throw new Error(payload?.detail || "AI service returned an error");
    }

    const data = payload.data;
    const enriched = (data.shortlisted || []).map((entry) => {
      const raw = rawByUsername.get(entry.github_username?.toLowerCase());
      return {
        ...entry,
        avatar_url: raw?.avatar_url || entry.avatar_url || null,
        html_url: raw?.html_url || null,
      };
    });

    res.json({
      success: true,
      data: {
        total_candidates: data.total_candidates,
        shortlist_count: data.shortlist_count,
        jd_requirements: data.jd_requirements,
        shortlisted: enriched,
        skipped,
      },
    });
  } catch (error) {
    if (error.code === "ECONNABORTED" || error.code === "ETIMEDOUT") {
      return res.status(504).json({
        success: false,
        error: "AI service timed out. Please try again.",
      });
    }
    if (error.response?.status === 403) {
      return res.status(429).json({
        success: false,
        error: "GitHub API rate limit reached. Please try again later.",
      });
    }
    next(error);
  }
};

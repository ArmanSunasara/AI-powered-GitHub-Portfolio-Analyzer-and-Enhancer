/**
 * Validates a POST /api/github-compare/analyze request.
 *
 * - profileA / profileB: required GitHub URL or bare username, length-capped
 * - must not be the same handle (case-insensitive) — nothing to compare
 */
import { extractUsername } from "../utils/extractUsername.js";

const MAX_URL_LENGTH = 256;

const fail = (res, message, status = 400) =>
  res.status(status).json({ success: false, error: message });

export const validateGithubCompareRequest = (req, res, next) => {
  const { profileA, profileB } = req.body || {};

  for (const [key, value] of [
    ["profileA", profileA],
    ["profileB", profileB],
  ]) {
    if (typeof value !== "string" || !value.trim()) {
      return fail(res, `${key} is required`);
    }
    if (value.length > MAX_URL_LENGTH) {
      return fail(res, `${key} must be ${MAX_URL_LENGTH} characters or fewer`);
    }
  }

  const usernameA = extractUsername(profileA);
  const usernameB = extractUsername(profileB);

  if (!usernameA) return fail(res, "profileA is not a valid GitHub URL or username");
  if (!usernameB) return fail(res, "profileB is not a valid GitHub URL or username");

  if (usernameA.toLowerCase() === usernameB.toLowerCase()) {
    return fail(res, "Please enter two different GitHub profiles to compare");
  }

  req.body.usernameA = usernameA;
  req.body.usernameB = usernameB;
  next();
};

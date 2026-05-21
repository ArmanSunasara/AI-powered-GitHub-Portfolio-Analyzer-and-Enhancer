/**
 * Validates the inbound payload to /api/specialization/analyze.
 *
 * Defends against:
 * - missing or malformed fields
 * - URLs / JD that are too short or too long (DoS via large LLM input)
 * - role IDs that are not in the known registry (set in ALLOWED_ROLES below)
 */
const MAX_URL_LENGTH = 256;
const MIN_JD_LENGTH = 20;
const MAX_JD_LENGTH = 8000;
const MAX_ROLE_ID_LENGTH = 64;

// Mirrored from ml-service/specialization/roles.py — kept in sync by hand
// because the Node layer wants to fail fast before calling the ML service.
export const ALLOWED_ROLES = new Set([
  "sde_faang",
  "backend_engineer",
  "frontend_engineer",
  "fullstack_engineer",
  "devops_engineer",
  "mlops_engineer",
  "ml_engineer",
  "ai_engineer",
  "data_engineer",
  "cybersecurity_engineer",
  "cloud_engineer",
  "android_developer",
  "ios_developer",
  "blockchain_developer",
  "game_developer",
  "embedded_engineer",
  "sre",
  "platform_engineer",
  "qa_automation",
]);

const fail = (res, message, status = 400) =>
  res.status(status).json({ success: false, error: message });

export const validateSpecializationRequest = (req, res, next) => {
  const { url, roleId, jobDescription } = req.body || {};

  if (typeof url !== "string" || !url.trim()) {
    return fail(res, "GitHub URL is required");
  }
  if (url.length > MAX_URL_LENGTH) {
    return fail(res, `GitHub URL must be ${MAX_URL_LENGTH} characters or fewer`);
  }

  if (typeof roleId !== "string" || !roleId.trim()) {
    return fail(res, "Role is required");
  }
  if (roleId.length > MAX_ROLE_ID_LENGTH || !ALLOWED_ROLES.has(roleId)) {
    return fail(res, "Unknown or invalid role");
  }

  if (typeof jobDescription !== "string") {
    return fail(res, "Job description is required");
  }

  const trimmedJd = jobDescription.trim();
  if (trimmedJd.length < MIN_JD_LENGTH) {
    return fail(
      res,
      `Job description must be at least ${MIN_JD_LENGTH} characters`
    );
  }
  if (trimmedJd.length > MAX_JD_LENGTH) {
    return fail(
      res,
      `Job description must be ${MAX_JD_LENGTH} characters or fewer`
    );
  }

  req.body.url = url.trim();
  req.body.roleId = roleId.trim();
  req.body.jobDescription = trimmedJd;
  next();
};

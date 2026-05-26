/**
 * Validates a POST /api/resume-match/analyze multipart request.
 *
 * - url: required GitHub profile URL / username, length-capped
 * - resume: present, supported extension (pdf/docx/txt/md), under the multer
 *   size cap (enforced by the router; extension enforced here)
 */
const MAX_URL_LENGTH = 256;
const ACCEPTED_EXT = ["pdf", "docx", "txt", "md"];

const fail = (res, message, status = 400) =>
  res.status(status).json({ success: false, error: message });

export const validateResumeMatchRequest = (req, res, next) => {
  const { url } = req.body || {};

  if (typeof url !== "string" || !url.trim()) {
    return fail(res, "GitHub URL is required");
  }
  if (url.length > MAX_URL_LENGTH) {
    return fail(res, `GitHub URL must be ${MAX_URL_LENGTH} characters or fewer`);
  }

  if (!req.file) {
    return fail(res, "Resume file is required");
  }
  const ext = (req.file.originalname || "").split(".").pop()?.toLowerCase();
  if (!ACCEPTED_EXT.includes(ext)) {
    return fail(res, "Only PDF, DOCX, or TXT resumes are supported");
  }

  req.body.url = url.trim();
  next();
};

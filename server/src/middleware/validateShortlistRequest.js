/**
 * Validates a POST /api/shortlist/analyze multipart request.
 *
 * - jobDescription: 20–8000 chars (matches the ML-service Pydantic limits)
 * - shortlistCount: integer 1–100
 * - excel_file: present, parsable extension, under MAX_FILE_BYTES (multer
 *   already enforces the size cap; the controller enforces extension)
 */
const MIN_JD_LENGTH = 20;
const MAX_JD_LENGTH = 8000;
const MIN_COUNT = 1;
const MAX_COUNT = 100;

const fail = (res, message, status = 400) =>
  res.status(status).json({ success: false, error: message });

export const validateShortlistRequest = (req, res, next) => {
  const { jobDescription } = req.body || {};

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

  const rawCount = req.body?.shortlistCount ?? req.body?.shortlist_count;
  const count = Number.parseInt(rawCount, 10);
  if (!Number.isFinite(count) || count < MIN_COUNT || count > MAX_COUNT) {
    return fail(
      res,
      `Shortlist count must be an integer between ${MIN_COUNT} and ${MAX_COUNT}`
    );
  }

  if (!req.file) {
    return fail(res, "Excel file is required");
  }
  const filename = req.file.originalname || "";
  const ext = filename.split(".").pop()?.toLowerCase();
  if (!["xlsx", "xls", "xlsm"].includes(ext)) {
    return fail(res, "Only .xlsx, .xls, or .xlsm files are supported");
  }

  req.body.jobDescription = trimmedJd;
  req.body.shortlistCount = count;
  next();
};

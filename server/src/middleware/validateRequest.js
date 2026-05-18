const MAX_URL_LENGTH = 256;

export const validateAnalyzeRequest = (req, res, next) => {
  const { url } = req.body || {};

  if (typeof url !== "string") {
    return res.status(400).json({
      success: false,
      error: "GitHub URL is required",
    });
  }

  const trimmed = url.trim();

  if (!trimmed) {
    return res.status(400).json({
      success: false,
      error: "GitHub URL is required",
    });
  }

  if (trimmed.length > MAX_URL_LENGTH) {
    return res.status(400).json({
      success: false,
      error: `GitHub URL must be ${MAX_URL_LENGTH} characters or fewer`,
    });
  }

  req.body.url = trimmed;
  next();
};

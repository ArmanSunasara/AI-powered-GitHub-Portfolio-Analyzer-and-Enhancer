export const validateAnalyzeRequest = (req, res, next) => {
  const { url } = req.body;

  if (!url) {
    return res.status(400).json({
      success: false,
      error: "GitHub URL is required",
    });
  }

  if (typeof url !== "string") {
    return res.status(400).json({
      success: false,
      error: "GitHub URL must be a string",
    });
  }

  if (!url.includes("github.com")) {
    return res.status(400).json({
      success: false,
      error: "Invalid GitHub URL format",
    });
  }

  next();
};

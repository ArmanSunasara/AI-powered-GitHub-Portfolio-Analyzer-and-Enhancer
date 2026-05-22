export const errorHandler = (err, req, res, _next) => {
  console.error("Error:", err);

  if (err.response) {
    const status = err.response.status || 502;
    let message = err.response.data?.message || err.message || "External API error";

    if (status === 404) {
      message = "GitHub user not found";
    } else if (status === 403) {
      message = "GitHub API rate limit reached. Please try again later.";
    } else if (status >= 500) {
      message = "GitHub is currently unavailable. Please try again later.";
    }

    return res.status(status === 404 ? 404 : status >= 500 ? 502 : status).json({
      success: false,
      error: message,
    });
  }

  if (err.code === "ECONNABORTED" || err.code === "ETIMEDOUT") {
    return res.status(504).json({
      success: false,
      error: "Upstream request timed out. Please try again.",
    });
  }

  if (err.name === "ValidationError") {
    return res.status(400).json({
      success: false,
      error: err.message || "Validation error",
    });
  }

  // multer surfaces upload problems as MulterError with a stable .code
  if (err.name === "MulterError") {
    const status = err.code === "LIMIT_FILE_SIZE" ? 413 : 400;
    return res.status(status).json({
      success: false,
      error:
        err.code === "LIMIT_FILE_SIZE"
          ? "Uploaded file is too large"
          : err.message || "File upload failed",
    });
  }

  res.status(500).json({
    success: false,
    error: process.env.NODE_ENV === "production"
      ? "Internal server error"
      : err.message,
  });
};

export const notFoundHandler = (req, res) => {
  res.status(404).json({
    success: false,
    error: "Route not found",
  });
};

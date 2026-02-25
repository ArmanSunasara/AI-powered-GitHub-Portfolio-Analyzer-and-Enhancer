import config from "../config/index.js";

export const errorHandler = (err, req, res, _next) => {
  console.error("Error:", err);

  if (err.response) {
    const status = err.response.status || 500;
    const message = err.response.data?.message || err.message || "External API error";
    
    return res.status(status).json({
      success: false,
      error: message,
    });
  }

  if (err.name === "ValidationError") {
    return res.status(400).json({
      success: false,
      error: err.message || "Validation error",
    });
  }

  res.status(500).json({
    success: false,
    error: config.isProduction
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

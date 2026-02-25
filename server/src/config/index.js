import dotenv from "dotenv";

dotenv.config();

const config = {
  port: parseInt(process.env.PORT, 10) || 5000,
  nodeEnv: process.env.NODE_ENV || "development",
  githubToken: process.env.GITHUB_TOKEN || "",
  mlServiceUrl: process.env.ML_SERVICE_URL || "http://localhost:8000",
  frontendUrl: process.env.FRONTEND_URL || "http://localhost:5173",
  isProduction: process.env.NODE_ENV === "production",
};

export default config;

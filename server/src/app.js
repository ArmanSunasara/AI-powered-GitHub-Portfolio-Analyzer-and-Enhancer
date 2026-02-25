import express from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import rateLimit from "express-rate-limit";
import morgan from "morgan";
import config from "./config/index.js";
import githubRoutes from "./routes/github.routes.js";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler.js";

const app = express();

app.use(helmet());
app.use(compression());

if (!config.isProduction) {
  app.use(morgan("dev"));
} else {
  app.use(morgan("combined"));
}

const corsOptions = {
  origin: config.frontendUrl,
  credentials: true,
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: "Too many requests, please try again later.",
  },
});

app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    status: "healthy",
    service: "github-portfolio-analyzer",
    timestamp: new Date().toISOString(),
  });
});

app.use("/api", apiLimiter);

app.use("/api/github", githubRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;

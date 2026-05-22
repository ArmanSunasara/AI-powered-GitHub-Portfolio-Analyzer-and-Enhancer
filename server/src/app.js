import express from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import rateLimit from "express-rate-limit";
import morgan from "morgan";

import githubRoutes from "./routes/github.routes.js";
import shortlistRoutes from "./routes/shortlist.routes.js";
import specializationRoutes from "./routes/specialization.routes.js";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler.js";

const app = express();

app.use(helmet());
app.use(compression());

if (process.env.NODE_ENV !== "production") {
  app.use(morgan("dev"));
} else {
  app.use(morgan("combined"));
}

const allowedOrigins = (process.env.FRONTEND_URL || "http://localhost:5173")
  .split(",")
  .map((o) => o.trim())
  .filter(Boolean);

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error("Not allowed by CORS"));
  },
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
app.use("/api/specialization", specializationRoutes);
app.use("/api/shortlist", shortlistRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;

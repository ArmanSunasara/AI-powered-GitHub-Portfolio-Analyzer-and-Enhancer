import "dotenv/config";
import app from "./src/app.js";

const PORT = parseInt(process.env.PORT, 10) || 5000;
const SHUTDOWN_TIMEOUT_MS = 10000;

const server = app.listen(PORT, () => {
  console.log(
    `🚀 Server running on port ${PORT} [${process.env.NODE_ENV || "development"}]`
  );
});

const shutdown = (signal) => {
  console.log(`\n${signal} received. Shutting down gracefully...`);
  const forceExit = setTimeout(() => {
    console.warn("Forcing shutdown after timeout.");
    process.exit(1);
  }, SHUTDOWN_TIMEOUT_MS);
  forceExit.unref();

  server.close(() => {
    console.log("Server closed.");
    process.exit(0);
  });
};

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));

process.on("unhandledRejection", (reason) => {
  console.error("Unhandled Rejection:", reason);
});
process.on("uncaughtException", (err) => {
  console.error("Uncaught Exception:", err);
});

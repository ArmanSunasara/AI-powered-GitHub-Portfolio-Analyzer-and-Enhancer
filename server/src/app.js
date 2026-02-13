import express from "express";
import cors from "cors";
import githubRoutes from "./routes/github.routes.js";

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/github", githubRoutes);

export default app;

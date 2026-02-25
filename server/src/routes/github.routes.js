import express from "express";
import { analyzeGithub } from "../controllers/github.controller.js";
import { validateAnalyzeRequest } from "../middleware/validateRequest.js";

const router = express.Router();

router.post("/analyze", validateAnalyzeRequest, analyzeGithub);

export default router;

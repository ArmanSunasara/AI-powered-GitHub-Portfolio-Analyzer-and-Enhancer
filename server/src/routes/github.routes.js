import express from "express";
import { analyzeGithub } from "../controllers/github.controller.js";

const router = express.Router();

router.post("/analyze", analyzeGithub);

export default router;

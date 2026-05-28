import express from "express";

import { compareGithubProfiles } from "../controllers/githubCompare.controller.js";
import { validateGithubCompareRequest } from "../middleware/validateGithubCompareRequest.js";

const router = express.Router();

router.post("/analyze", validateGithubCompareRequest, compareGithubProfiles);

export default router;

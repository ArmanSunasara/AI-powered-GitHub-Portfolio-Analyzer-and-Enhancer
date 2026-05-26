import express from "express";
import multer from "multer";

import { analyzeResumeMatch } from "../controllers/resumeMatch.controller.js";
import { validateResumeMatchRequest } from "../middleware/validateResumeMatchRequest.js";

// 5 MB cap — generous for a resume but small enough that a hostile upload
// can't drown the process. multer keeps the file in memory and we hand the
// buffer straight to the resume parser (no temp file on disk).
const MAX_FILE_BYTES = 5 * 1024 * 1024;

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_FILE_BYTES, files: 1 },
});

const router = express.Router();

router.post(
  "/analyze",
  upload.single("resume"),
  validateResumeMatchRequest,
  analyzeResumeMatch
);

export default router;

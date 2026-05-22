import express from "express";
import multer from "multer";

import { analyzeShortlist } from "../controllers/shortlist.controller.js";
import { validateShortlistRequest } from "../middleware/validateShortlistRequest.js";

// 5 MB cap — comfortably above a 300-row roster but small enough that a
// hostile upload can't drown the process. multer keeps the file in memory
// (no temp file on disk) and we hand the buffer straight to ExcelJS.
const MAX_FILE_BYTES = 5 * 1024 * 1024;

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_FILE_BYTES, files: 1 },
});

const router = express.Router();

router.post(
  "/analyze",
  upload.single("excel_file"),
  validateShortlistRequest,
  analyzeShortlist
);

export default router;

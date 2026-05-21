import express from "express";

import {
  analyzeSpecializationFit,
  listRoles,
} from "../controllers/specialization.controller.js";
import { validateSpecializationRequest } from "../middleware/validateSpecializationRequest.js";

const router = express.Router();

router.get("/roles", listRoles);
router.post("/analyze", validateSpecializationRequest, analyzeSpecializationFit);

export default router;

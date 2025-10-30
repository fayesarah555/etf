import { Router } from "express";
import { asyncHandler } from "../utils/asyncHandler.js";
import { getPredictions } from "../controllers/predictionsController.js";

const router = Router();

router.get("/", asyncHandler(getPredictions));

export default router;

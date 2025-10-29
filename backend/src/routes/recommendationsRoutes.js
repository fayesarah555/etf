import { Router } from "express";
import { asyncHandler } from "../utils/asyncHandler.js";
import {
  listRecommendations,
  refreshRecommendations,
} from "../controllers/recommendationsController.js";

const router = Router({ mergeParams: true });

router.get("/", asyncHandler(listRecommendations));
router.post("/refresh", asyncHandler(refreshRecommendations));

export default router;

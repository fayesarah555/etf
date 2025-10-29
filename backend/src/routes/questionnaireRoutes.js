import { Router } from "express";
import { asyncHandler } from "../utils/asyncHandler.js";
import {
  listQuestions,
  saveAnswers,
} from "../controllers/questionnaireController.js";

const router = Router();

router.get("/", asyncHandler(listQuestions));
router.post("/answers", asyncHandler(saveAnswers));

export default router;

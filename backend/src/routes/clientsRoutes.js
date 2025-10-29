import { Router } from "express";
import { asyncHandler } from "../utils/asyncHandler.js";
import {
  createClientProfile,
  getClientProfile,
} from "../controllers/clientsController.js";

const router = Router();

router.post("/", asyncHandler(createClientProfile));
router.get("/:id", asyncHandler(getClientProfile));

export default router;

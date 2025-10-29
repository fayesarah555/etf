import { Router } from "express";
import { asyncHandler } from "../utils/asyncHandler.js";
import { listEtfs, getEtf } from "../controllers/etfsController.js";

const router = Router();

router.get("/", asyncHandler(listEtfs));
router.get("/:id", asyncHandler(getEtf));

export default router;

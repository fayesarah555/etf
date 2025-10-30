import { Router } from "express";
import clientsRoutes from "./clientsRoutes.js";
import etfsRoutes from "./etfsRoutes.js";
import questionnaireRoutes from "./questionnaireRoutes.js";
import recommendationsRoutes from "./recommendationsRoutes.js";
import predictionsRoutes from "./predictionsRoutes.js";

const router = Router();

router.use("/clients", clientsRoutes);
router.use("/etfs", etfsRoutes);
router.use("/questionnaire", questionnaireRoutes);
router.use("/clients/:id/recommendations", recommendationsRoutes);
router.use("/predictions", predictionsRoutes);

export default router;

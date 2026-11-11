
import { Router } from "express";

import {
  listarPlanos,
  buscarPlanoPorId,
} from "../controllers/planosController.js";

const router = Router();

router.get("/", listarPlanos);
router.get("/:id", buscarPlanoPorId);

export default router;

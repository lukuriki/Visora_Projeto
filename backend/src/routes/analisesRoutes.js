import { Router } from "express";

import { autenticarUsuario } from "../middlewares/authMiddleware.js";
import { identificarEmpresa } from "../middlewares/empresaMiddleware.js";
import { buscarAnalisesFinanceirasController } from "../controllers/analisesController.js";

const router = Router();

router.use(autenticarUsuario);
router.use(identificarEmpresa);
router.get("/", buscarAnalisesFinanceirasController);

export default router;
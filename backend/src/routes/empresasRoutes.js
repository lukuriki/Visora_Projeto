import { Router } from "express";

import { autenticarUsuario } from "../middlewares/authMiddleware.js";

import { consultarLimiteEmpresasController, cadastrarEmpresaController } from "../controllers/empresasController.js";

const router = Router();

router.use(autenticarUsuario);
router.get("/limite", consultarLimiteEmpresasController);
router.post("/", cadastrarEmpresaController);

export default router;
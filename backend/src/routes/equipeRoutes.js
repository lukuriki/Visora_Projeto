
import { Router } from "express";

import { listarEquipeController, listarMembrosEquipeController, convidarColaboradorController, consultarConviteController, ativarConviteController, cancelarConviteController, removerColaboradorController } from "../controllers/equipeController.js";
import { autenticarUsuario } from "../middlewares/authMiddleware.js";
import { verificarProprietario } from "../middlewares/proprietarioMiddleware.js";

const router = Router();

router.use(autenticarUsuario);
router.use(verificarProprietario);

router.get("/convites/:token", consultarConviteController);
router.post("/convites/ativar", ativarConviteController);
router.get("/membros", listarMembrosEquipeController);
router.get("/", listarEquipeController);
router.post("/convites", convidarColaboradorController);
router.patch("/convites/:id/cancelar", cancelarConviteController);
router.delete("/colaboradores/:id", removerColaboradorController);

export default router;


import { Router } from "express";

import { listarEquipeController, listarMembrosEquipeController, convidarColaboradorController, consultarConviteController, ativarConviteController, cancelarConviteController, removerColaboradorController, alterarStatusColaboradorController } from "../controllers/equipeController.js";

import { autenticarUsuario } from "../middlewares/authMiddleware.js";
import { verificarProprietario } from "../middlewares/proprietarioMiddleware.js";

const router = Router();

router.get("/convites/:token", consultarConviteController);
router.post("/convites/ativar", ativarConviteController);
router.use(autenticarUsuario);
router.get("/", listarEquipeController);
router.get("/membros", listarMembrosEquipeController);
router.post("/convites", verificarProprietario, convidarColaboradorController);
router.patch( "/convites/:id/cancelar", verificarProprietario, cancelarConviteController);
router.patch("/colaboradores/:id/status", verificarProprietario, alterarStatusColaboradorController);
router.delete( "/colaboradores/:id", verificarProprietario, removerColaboradorController);

export default router;

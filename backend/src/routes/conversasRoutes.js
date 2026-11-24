
import express from "express";

import { criarConversaController, listarConversasController, buscarConversaController, listarMensagensController, listarConversasUsuarioController, criarMensagemClienteController, responderConversaController, atualizarStatusConversaController } from "../controllers/conversasController.js";
import { autenticarUsuario, autenticarUsuarioOpcional } from "../middlewares/authMiddleware.js";
import { autenticarAdministrador } from "../middlewares/adminMiddleware.js";

const router = express.Router();

router.post("/", autenticarUsuarioOpcional, criarConversaController);
router.get("/minhas", autenticarUsuario, listarConversasUsuarioController);
router.post("/:id/mensagens", autenticarUsuario, criarMensagemClienteController);
router.get("/", autenticarAdministrador, listarConversasController);
router.get("/:id", autenticarAdministrador, buscarConversaController);
router.get("/:id/mensagens", autenticarAdministrador, listarMensagensController);
router.post("/:id/responder", autenticarAdministrador, responderConversaController);
router.patch("/:id/status", autenticarAdministrador, atualizarStatusConversaController);

export default router;

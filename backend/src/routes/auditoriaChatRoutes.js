
import { Router } from "express";

import { autenticarUsuario } from "../middlewares/authMiddleware.js";
import { enviarMensagemAuditoriaController } from "../controllers/auditoriaChatController.js";

const router = Router();

router.post("/chat", autenticarUsuario, enviarMensagemAuditoriaController);

export default router;

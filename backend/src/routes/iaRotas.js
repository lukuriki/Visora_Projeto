
import { Router } from "express";

import { enviarMensagem, buscarHistorico, listarConversas } from "../controllers/Chatcontroller.js";
import { analisarEmpresa } from "../controllers/analisecontroller.js";
import { autenticarUsuario } from "../middlewares/authMiddleware.js";
import { identificarEmpresa } from "../middlewares/empresaMiddleware.js";

const router = Router();

router.use(autenticarUsuario);
router.use(identificarEmpresa);

router.post("/chat/mensagem", enviarMensagem);
router.get("/chat/conversas", listarConversas);
router.get("/chat/historico/:sessao_id", buscarHistorico);
router.post("/analise/empresa", analisarEmpresa);

export default router;

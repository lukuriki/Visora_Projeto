import { Router } from "express";

import {
  enviarMensagem,
  buscarHistorico,
} from "../controllers/Chatcontroller.js";

import {
  analisarEmpresa,
} from "../controllers/analisecontroller.js";

import {
  autenticarUsuario,
} from "../middlewares/authMiddleware.js";

import {
  identificarEmpresa,
} from "../middlewares/empresaMiddleware.js";

const router = Router();

// ==========================================
// AUTENTICAÇÃO E EMPRESA
// ==========================================

router.use(autenticarUsuario);
router.use(identificarEmpresa);

// ==========================================
// VION - CHAT COM GEMINI
// ==========================================

router.post("/chat/mensagem", enviarMensagem);

router.get(
  "/chat/historico/:sessao_id",
  buscarHistorico
);

// ==========================================
// ANÁLISE DA EMPRESA
// ==========================================

router.post("/analise/empresa", analisarEmpresa);

export default router;
import express from "express";
import {
  carregarPaginaAuditoria,
  atualizarStatusApontamento,
} from "../controllers/auditoriacontroller.js";

const router = express.Router();

// Chamada automaticamente ao abrir a página de Auditoria
router.get("/auditoria/:usuario_id", carregarPaginaAuditoria);

// Chamada quando o usuário altera o status de um apontamento na interface
router.patch("/auditoria/:apontamento_id/status", atualizarStatusApontamento);

export default router;
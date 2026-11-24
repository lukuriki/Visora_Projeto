
import { Router } from "express";
import { rateLimit } from "express-rate-limit";

import { autenticarUsuario } from "../middlewares/authMiddleware.js";
import { autorizarAuditoria } from "../middlewares/auditoriaMiddleware.js";
import { listarAuditoriaController, resumoAuditoriaController, historicoAuditoriaController, atualizarStatusAuditoriaController, executarAuditoriaController } from "../controllers/auditoriacontroller.js";

const router = Router();

const limitarAlteracoes = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 30,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: {
    sucesso: false,
    mensagem: "Muitas alterações realizadas. Aguarde alguns minutos.",
  },
});

router.use("/auditoria", autenticarUsuario);
router.get("/auditoria/:empresaId", autorizarAuditoria, listarAuditoriaController);
router.get("/auditoria/:empresaId/resumo", autorizarAuditoria, resumoAuditoriaController);
router.get("/auditoria/:empresaId/historico", autorizarAuditoria, historicoAuditoriaController);
router.patch("/auditoria/:empresaId/apontamentos/:apontamentoId/status", autorizarAuditoria, limitarAlteracoes, atualizarStatusAuditoriaController);

const limitarExecucaoAuditoria = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 3,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: {
    sucesso: false,
    mensagem: "Limite de auditorias atingido. Aguarde 15 minutos.",
  },
});

router.post("/auditoria/:empresaId/executar", autorizarAuditoria, limitarExecucaoAuditoria, executarAuditoriaController);

export default router;
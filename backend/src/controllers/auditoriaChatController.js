
import { responderChatAuditoria } from "../services/auditoriaChatService.js";

export async function enviarMensagemAuditoriaController(req, res) {
  try {
    const usuarioId = Number(req.usuario?.id);

    if (!Number.isSafeInteger(usuarioId) || usuarioId <= 0) {
      return res.status(401).json({
        sucesso: false,
        mensagem: "Usuário não autenticado.",
      });
    }

    const {empresaId, apontamentoId = null, mensagem, historico = []} = req.body || {};
    const empresaIdNumero = Number(empresaId);

    if (!Number.isSafeInteger(empresaIdNumero) || empresaIdNumero <= 0) {
      return res.status(400).json({
        sucesso: false,
        mensagem: "Empresa inválida.",
      });
    }

    if (typeof mensagem !== "string" || !mensagem.trim() || mensagem.length > 2000) {
      return res.status(400).json({
        sucesso: false,
        mensagem: "Informe uma mensagem de até 2.000 caracteres.",
      });
    }

    if (apontamentoId !== null && apontamentoId !== undefined && (!Number.isSafeInteger(Number(apontamentoId)) || Number(apontamentoId) <= 0)) {
      return res.status(400).json({
        sucesso: false,
        mensagem: "Apontamento inválido.",
      });
    }

    if (!Array.isArray(historico) || historico.length > 20) {
      return res.status(400).json({
        sucesso: false,
        mensagem: "Histórico da conversa inválido.",
      });
    }

    const resultado = await responderChatAuditoria({
      usuarioId,
      empresaId: empresaIdNumero,
      apontamentoId: apontamentoId == null ? null : Number(apontamentoId),
      mensagem: mensagem.trim(),
      historico,
    });

    return res.status(200).json({
      sucesso: true,
      resposta: resultado.resposta,
    });

  } catch (error) {
    console.error("[Vion Auditoria] Erro ao responder mensagem:", error);

    const statusCode = Number.isInteger(error.statusCode) && error.statusCode >= 400 && error.statusCode <= 599 ? error.statusCode : 500;

    return res.status(statusCode).json({
      sucesso: false,
      mensagem: statusCode === 500 ? "Não foi possível processar sua mensagem. Tente novamente." : error.message,
    });
  }
}
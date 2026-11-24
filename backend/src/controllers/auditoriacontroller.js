
import { listarApontamentos, buscarResumoAuditoria, listarExecucoes, atualizarStatusApontamento } from "../services/auditoriaService.js";

function tratarErro(erro, next) {
  if (erro.statusCode) {
    return {
      status: erro.statusCode,
      mensagem: erro.message,
    };
  }

  next(erro);
  return null;
}


export async function listarAuditoriaController(req, res, next) {
  try {
    const empresaId = req.auditoria.empresaId;

    const resultado = await listarApontamentos({
      empresaId,
      status: req.query.status,
      gravidade: req.query.gravidade,
      tipo: req.query.tipo,
      pagina: req.query.pagina ?? 1,
      limite: req.query.limite ?? 20,
    });

    return res.status(200).json({
      sucesso: true,
      ...resultado,
    });
  } catch (erro) {
    const resposta = tratarErro(erro, next);

    if (resposta) {
      return res.status(resposta.status).json({
        sucesso: false,
        mensagem: resposta.mensagem,
      });
    }
  }
}

export async function resumoAuditoriaController(req, res, next) {
  try {
    const resumo = await buscarResumoAuditoria(req.auditoria.empresaId);

    return res.status(200).json({
      sucesso: true,
      resumo,
    });
  } catch (erro) {
    return next(erro);
  }
}

export async function historicoAuditoriaController(req, res, next) {
  try {
    const execucoes = await listarExecucoes(req.auditoria.empresaId);

    return res.status(200).json({
      sucesso: true,
      execucoes,
    });
  } catch (erro) {
    return next(erro);
  }
}

export async function atualizarStatusAuditoriaController(req, res, next) {
  try {
    const empresaId = req.auditoria.empresaId;
    const usuarioId = req.auditoria.usuarioId;

    const apontamentoId = Number(req.params.apontamentoId);

    if (!Number.isSafeInteger(apontamentoId) || apontamentoId <= 0) {
      return res.status(400).json({
        sucesso: false,
        mensagem: "ID do apontamento inválido.",
      });
    }

    const resultado = await atualizarStatusApontamento({
      empresaId,
      usuarioId,
      apontamentoId,
      status: req.body?.status,
      observacao: req.body?.observacao,
    });

    return res.status(200).json({
      sucesso: true,
      ...resultado,
    });
  } catch (erro) {
    const resposta = tratarErro(erro, next);

    if (resposta) {
      return res.status(resposta.status).json({
        sucesso: false,
        mensagem: resposta.mensagem,
      });
    }
  }
}


export async function executarAuditoriaController(req, res, next) {
  try {
    const { executarAuditoriaIA } = await import("../services/auditoriaIAService.js");

    const resultado = await executarAuditoriaIA({
      empresaId: req.auditoria.empresaId,
      usuarioId: req.auditoria.usuarioId,
    });

    return res.status(200).json({
      sucesso: true,
      mensagem: "Auditoria concluída com sucesso.",
      ...resultado,
    });
  } catch (erro) {
    if (erro.statusCode) {
      return res.status(erro.statusCode).json({
        sucesso: false,
        mensagem: erro.message,
      });
    }

    console.error("[auditoria] Erro ao executar:", erro);

    return res.status(503).json({
      sucesso: false,
      mensagem: "Não foi possível concluir a auditoria. Verifique a configuração do Gemini e tente novamente.",
    });
  }
}
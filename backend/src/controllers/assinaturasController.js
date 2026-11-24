import { AppError } from "../utils/AppError.js";

import { consultarAssinatura, listarPlanosDisponiveis, alterarPreferenciaPagamento, solicitarTrocaPlano, confirmarTrocaPlano } from "../services/assinaturasService.js";

export async function consultarAssinaturaController(req, res, next) {
  try {
    const usuarioId = req.usuario.id;
    const resultado = await consultarAssinatura(usuarioId);
    return res.status(200).json(resultado);
  } catch (erro) {
    next(erro);
  }
}

export async function listarPlanosDisponiveisController(req, res, next) {
  try {
    const planos = await listarPlanosDisponiveis();
    return res.status(200).json(planos);
  } catch (erro) {
    next(erro);
  }
}

export async function alterarPreferenciaPagamentoController(req, res, next) {
  try {
    const usuarioId = req.usuario.id;
    const { metodo } = req.body || {};

    if (!metodo) {
      throw new AppError("Selecione uma forma de pagamento.", 400);
    }

    const resultado = await alterarPreferenciaPagamento(usuarioId, metodo);
    return res.status(200).json(resultado);
  } catch (erro) {
    next(erro);
  }
}

export async function solicitarTrocaPlanoController(req, res, next) {
  try {
    const usuarioId = req.usuario.id;
    const { planoId, metodo } = req.body || {};

    if (!planoId) {
      throw new AppError("Selecione o novo plano.", 400);
    }

    if (!metodo) {
      throw new AppError("Selecione a forma de pagamento.", 400);
    }

    const resultado = await solicitarTrocaPlano(usuarioId, planoId, metodo);
    return res.status(201).json(resultado);
  } catch (erro) {
    next(erro);
  }
}

export async function consultarTrocaPlanoController(req, res, next) {
  try {
    const usuarioId = req.usuario.id;
    const { codigo } = req.params;

    if (!codigo) {
      throw new AppError("Código da transação não informado.", 400);
    }

    const assinatura = await consultarAssinatura(usuarioId);

    if (!assinatura.trocaPendente || assinatura.trocaPendente.codigo_transacao !== codigo) {
      throw new AppError("Troca de plano não encontrada para sua empresa.", 404);
    }

    const resultado = await confirmarTrocaPlano(codigo);

    return res.status(200).json(resultado);
  } catch (erro) {
    next(erro);
  }
}
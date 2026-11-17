
import { AppError } from "../utils/AppError.js";

import {
  consultarAssinatura,
  listarPlanosDisponiveis,
  alterarPreferenciaPagamento,
  solicitarTrocaPlano,
  confirmarTrocaPlano,
} from "../services/assinaturasService.js";

// ==========================================
// CONSULTAR ASSINATURA ATUAL
// ==========================================

export async function consultarAssinaturaController(req, res, next) {
  try {
    const usuarioId = req.usuario.id;

    const resultado = await consultarAssinatura(usuarioId);

    return res.status(200).json(resultado);
  } catch (erro) {
    next(erro);
  }
}

// ==========================================
// LISTAR PLANOS DISPONÍVEIS
// ==========================================

export async function listarPlanosDisponiveisController(req, res, next) {
  try {
    const planos = await listarPlanosDisponiveis();

    return res.status(200).json(planos);
  } catch (erro) {
    next(erro);
  }
}

// ==========================================
// ALTERAR PREFERÊNCIA DE PAGAMENTO
// ==========================================

export async function alterarPreferenciaPagamentoController(req, res, next) {
  try {
    const usuarioId = req.usuario.id;
    const { metodo } = req.body || {};

    if (!metodo) {
      throw new AppError(
        "Selecione uma forma de pagamento.",
        400
      );
    }

    const resultado = await alterarPreferenciaPagamento(
      usuarioId,
      metodo
    );

    return res.status(200).json(resultado);
  } catch (erro) {
    next(erro);
  }
}

// ==========================================
// SOLICITAR TROCA DE PLANO
// ==========================================

export async function solicitarTrocaPlanoController(req, res, next) {
  try {
    const usuarioId = req.usuario.id;

    const { planoId, metodo } = req.body || {};

    if (!planoId) {
      throw new AppError(
        "Selecione o novo plano.",
        400
      );
    }

    if (!metodo) {
      throw new AppError(
        "Selecione a forma de pagamento.",
        400
      );
    }

    const resultado = await solicitarTrocaPlano(
      usuarioId,
      planoId,
      metodo
    );

    return res.status(201).json(resultado);
  } catch (erro) {
    next(erro);
  }
}

// ==========================================
// CONSULTAR PAGAMENTO DA TROCA
// ==========================================

export async function consultarTrocaPlanoController(req, res, next) {
  try {
    const usuarioId = req.usuario.id;
    const { codigo } = req.params;

    if (!codigo) {
      throw new AppError(
        "Código da transação não informado.",
        400
      );
    }

    // Verifica se a cobrança pertence à empresa do usuário.
    // A confirmação só pode ser feita depois dessa validação.
    const assinatura = await consultarAssinatura(usuarioId);

    if (!assinatura.trocaPendente ||
        assinatura.trocaPendente.codigo_transacao !== codigo) {
      throw new AppError(
        "Troca de plano não encontrada para sua empresa.",
        404
      );
    }

    const resultado = await confirmarTrocaPlano(codigo);

    return res.status(200).json(resultado);
  } catch (erro) {
    next(erro);
  }
}

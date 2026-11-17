
import {
  // CONTAS BANCÁRIAS
  listarContasBancarias,
  buscarContaBancariaPorId,
  criarContaBancaria,
  atualizarContaBancaria,
  excluirContaBancaria,

  // MOVIMENTAÇÕES BANCÁRIAS
  listarMovimentacoesBancarias,
  buscarMovimentacaoBancariaPorId,
  criarMovimentacaoBancaria,
  atualizarMovimentacaoBancaria,
  excluirMovimentacaoBancaria,

  // SALDOS BANCÁRIOS
  buscarSaldosBancarios,
} from "../services/movimentacoesBancariasService.js";

// ==========================================
// CONTAS BANCÁRIAS
// ==========================================

// LISTAR CONTAS BANCÁRIAS
export async function listarContasBancariasController(
  req,
  res,
  next
) {
  try {
    const contas = await listarContasBancarias(
      req.usuario.id
    );

    return res.status(200).json({
      mensagem: "Contas bancárias consultadas com sucesso.",
      contas,
    });
  } catch (erro) {
    next(erro);
  }
}

// ==========================================
// BUSCAR CONTA BANCÁRIA POR ID
// ==========================================

export async function buscarContaBancariaPorIdController(
  req,
  res,
  next
) {
  try {
    const conta = await buscarContaBancariaPorId(
      req.usuario.id,
      req.params.id
    );

    return res.status(200).json({
      mensagem: "Conta bancária consultada com sucesso.",
      conta,
    });
  } catch (erro) {
    next(erro);
  }
}

// ==========================================
// CADASTRAR CONTA BANCÁRIA
// ==========================================

export async function criarContaBancariaController(
  req,
  res,
  next
) {
  try {
    const conta = await criarContaBancaria(
      req.usuario.id,
      req.body ?? {}
    );

    return res.status(201).json({
      mensagem: "Conta bancária cadastrada com sucesso.",
      conta,
    });
  } catch (erro) {
    next(erro);
  }
}

// ==========================================
// ATUALIZAR CONTA BANCÁRIA
// ==========================================

export async function atualizarContaBancariaController(
  req,
  res,
  next
) {
  try {
    const conta = await atualizarContaBancaria(
      req.usuario.id,
      req.params.id,
      req.body ?? {}
    );

    return res.status(200).json({
      mensagem: "Conta bancária atualizada com sucesso.",
      conta,
    });
  } catch (erro) {
    next(erro);
  }
}

// ==========================================
// EXCLUIR CONTA BANCÁRIA
// ==========================================

export async function excluirContaBancariaController(
  req,
  res,
  next
) {
  try {
    const resultado = await excluirContaBancaria(
      req.usuario.id,
      req.params.id
    );

    return res.status(200).json({
      ...resultado,
    });
  } catch (erro) {
    next(erro);
  }
}

// ==========================================
// MOVIMENTAÇÕES BANCÁRIAS
// ==========================================

// LISTAR MOVIMENTAÇÕES BANCÁRIAS
export async function listarMovimentacoesBancariasController(
  req,
  res,
  next
) {
  try {
    const movimentacoes =
      await listarMovimentacoesBancarias(
        req.usuario.id,
        req.query ?? {}
      );

    return res.status(200).json({
      mensagem: "Movimentações bancárias consultadas com sucesso.",
      movimentacoes,
    });
  } catch (erro) {
    next(erro);
  }
}

// ==========================================
// BUSCAR MOVIMENTAÇÃO BANCÁRIA POR ID
// ==========================================

export async function buscarMovimentacaoBancariaPorIdController(
  req,
  res,
  next
) {
  try {
    const movimentacao =
      await buscarMovimentacaoBancariaPorId(
        req.usuario.id,
        req.params.id
      );

    return res.status(200).json({
      mensagem: "Movimentação bancária consultada com sucesso.",
      movimentacao,
    });
  } catch (erro) {
    next(erro);
  }
}

// ==========================================
// CADASTRAR MOVIMENTAÇÃO BANCÁRIA
// ==========================================

export async function criarMovimentacaoBancariaController(
  req,
  res,
  next
) {
  try {
    const movimentacao =
      await criarMovimentacaoBancaria(
        req.usuario.id,
        req.body ?? {}
      );

    return res.status(201).json({
      mensagem: "Movimentação bancária cadastrada com sucesso.",
      movimentacao,
    });
  } catch (erro) {
    next(erro);
  }
}

// ==========================================
// ATUALIZAR MOVIMENTAÇÃO BANCÁRIA
// ==========================================

export async function atualizarMovimentacaoBancariaController(
  req,
  res,
  next
) {
  try {
    const movimentacao =
      await atualizarMovimentacaoBancaria(
        req.usuario.id,
        req.params.id,
        req.body ?? {}
      );

    return res.status(200).json({
      mensagem: "Movimentação bancária atualizada com sucesso.",
      movimentacao,
    });
  } catch (erro) {
    next(erro);
  }
}

// ==========================================
// EXCLUIR MOVIMENTAÇÃO BANCÁRIA
// ==========================================

export async function excluirMovimentacaoBancariaController(
  req,
  res,
  next
) {
  try {
    const resultado =
      await excluirMovimentacaoBancaria(
        req.usuario.id,
        req.params.id
      );

    return res.status(200).json({
      ...resultado,
    });
  } catch (erro) {
    next(erro);
  }
}

// ==========================================
// SALDOS BANCÁRIOS
// ==========================================

// CONSULTAR SALDOS DE TODAS AS CONTAS
export async function buscarSaldosBancariosController(
  req,
  res,
  next
) {
  try {
    const saldos = await buscarSaldosBancarios(
      req.usuario.id
    );

    return res.status(200).json({
      mensagem: "Saldos bancários consultados com sucesso.",
      saldos,
    });
  } catch (erro) {
    next(erro);
  }
}


import { listarContasBancarias, buscarContaBancariaPorId, criarContaBancaria, atualizarContaBancaria, excluirContaBancaria, listarMovimentacoesBancarias, buscarMovimentacaoBancariaPorId, criarMovimentacaoBancaria, atualizarMovimentacaoBancaria, excluirMovimentacaoBancaria, buscarSaldosBancarios } from "../services/movimentacoesBancariasService.js";

export async function listarContasBancariasController(req, res, next) {
  try {
    const contas = await listarContasBancarias(req.usuario.id, req.empresaId);

    return res.status(200).json({
      mensagem: "Contas bancárias consultadas com sucesso.",
      contas,
    });
  } catch (erro) {
    next(erro);
  }
}

export async function buscarContaBancariaPorIdController(req, res, next) {
  try {
    const conta = await buscarContaBancariaPorId(req.usuario.id, req.params.id, req.empresaId);

    return res.status(200).json({
      mensagem: "Conta bancária consultada com sucesso.",
      conta,
    });
  } catch (erro) {
    next(erro);
  }
}

export async function criarContaBancariaController(req, res, next) {
  try {
    const conta = await criarContaBancaria(req.usuario.id, req.body ?? {}, req.empresaId);

    return res.status(201).json({
      mensagem: "Conta bancária cadastrada com sucesso.",
      conta,
    });
  } catch (erro) {
    next(erro);
  }
}

export async function atualizarContaBancariaController(req, res, next) {
  try {
    const conta = await atualizarContaBancaria(req.usuario.id, req.params.id, req.body ?? {}, req.empresaId);

    return res.status(200).json({
      mensagem: "Conta bancária atualizada com sucesso.",
      conta,
    });
  } catch (erro) {
    next(erro);
  }
}

export async function excluirContaBancariaController(req, res, next) {
  try {
    const resultado = await excluirContaBancaria(req.usuario.id, req.params.id, req.empresaId);

    return res.status(200).json({
      ...resultado,
    });
  } catch (erro) {
    next(erro);
  }
}

export async function listarMovimentacoesBancariasController(req, res, next) {
  try {
    const movimentacoes = await listarMovimentacoesBancarias(req.usuario.id, req.query ?? {}, req.empresaId);

    return res.status(200).json({
      mensagem: "Movimentações bancárias consultadas com sucesso.",
      movimentacoes,
    });
  } catch (erro) {
    next(erro);
  }
}

export async function buscarMovimentacaoBancariaPorIdController(req, res, next) {
  try {
    const movimentacao = await buscarMovimentacaoBancariaPorId(req.usuario.id, req.params.id, req.empresaId);

    return res.status(200).json({
      mensagem: "Movimentação bancária consultada com sucesso.",
      movimentacao,
    });
  } catch (erro) {
    next(erro);
  }
}

export async function criarMovimentacaoBancariaController(req, res, next) {
  try {
    const movimentacao = await criarMovimentacaoBancaria(req.usuario.id, req.body ?? {}, req.empresaId);

    return res.status(201).json({
      mensagem: "Movimentação bancária cadastrada com sucesso.",
      movimentacao,
    });
  } catch (erro) {
    next(erro);
  }
}

export async function atualizarMovimentacaoBancariaController(req, res, next) {
  try {
    const movimentacao = await atualizarMovimentacaoBancaria(req.usuario.id, req.params.id, req.body ?? {}, req.empresaId);

    return res.status(200).json({
      mensagem: "Movimentação bancária atualizada com sucesso.",
      movimentacao,
    });
  } catch (erro) {
    next(erro);
  }
}

export async function excluirMovimentacaoBancariaController(req, res, next) {
  try {
    const resultado = await excluirMovimentacaoBancaria(req.usuario.id, req.params.id, req.empresaId);

    return res.status(200).json({
      ...resultado,
    });
  } catch (erro) {
    next(erro);
  }
}

export async function buscarSaldosBancariosController(req, res, next) {
  try {
    const saldos = await buscarSaldosBancarios(req.usuario.id, req.empresaId);

    return res.status(200).json({
      mensagem: "Saldos bancários consultados com sucesso.",
      saldos,
    });
  } catch (erro) {
    next(erro);
  }
}
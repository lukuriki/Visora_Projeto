
import { AppError } from "../utils/AppError.js";

import { listarInvestimentos, buscarInvestimentoPorId, criarInvestimento, atualizarInvestimento, excluirInvestimento, buscarResumoInvestimentos } from "../services/investimentosService.js";

function obterContexto(req) {
  const usuarioId = req.usuario?.id;
  const empresaId = req.empresaId;

  if (!usuarioId) {
    throw new AppError(
      "Usuário não autenticado.",
      401
    );
  }

  if (!empresaId) {
    throw new AppError(
      "Empresa não identificada.",
      400
    );
  }

  return {usuarioId,empresaId};
}

export async function listarInvestimentosController(req, res, next) {
  try {
    const contexto = obterContexto(req);
    const investimentos = await listarInvestimentos(contexto);

    return res.status(200).json({
      sucesso: true,
      total: investimentos.length,
      investimentos,
    });
  } catch (erro) {
    next(erro);
  }
}

export async function buscarResumoInvestimentosController(req, res, next) {
  try {
    const contexto = obterContexto(req);
    const resumo = await buscarResumoInvestimentos(contexto);

    return res.status(200).json({
      sucesso: true,
      resumo,
    });
  } catch (erro) {
    next(erro);
  }
}

export async function buscarInvestimentoController(req, res, next) {
  try {
    const contexto = obterContexto(req);
    const investimento = await buscarInvestimentoPorId({
      ...contexto,
      investimentoId: req.params.id,
    });

    return res.status(200).json({
      sucesso: true,
      investimento,
    });
  } catch (erro) {
    next(erro);
  }
}

export async function criarInvestimentoController(req, res, next) {
  try {
    const contexto = obterContexto(req);
    const investimento = await criarInvestimento({
      ...contexto,
      dados: req.body,
    });

    return res.status(201).json({
      sucesso: true,
      mensagem: "Investimento cadastrado com sucesso.",
      investimento,
    });
  } catch (erro) {
    next(erro);
  }
}

export async function atualizarInvestimentoController(req, res, next) {
  try {
    const contexto = obterContexto(req);

    const investimento = await atualizarInvestimento({
      ...contexto,
      investimentoId: req.params.id,
      dados: req.body,
    });

    return res.status(200).json({
      sucesso: true,
      mensagem: "Investimento atualizado com sucesso.",
      investimento,
    });
  } catch (erro) {
    next(erro);
  }
}

export async function excluirInvestimentoController(req, res, next) {
  try {
    const contexto = obterContexto(req);
    const resultado = await excluirInvestimento({
      ...contexto,
      investimentoId: req.params.id,
    });

    return res.status(200).json({
      sucesso: true,
      mensagem: resultado.mensagem,
    });
  } catch (erro) {
    next(erro);
  }
}
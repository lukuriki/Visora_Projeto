
import { AppError } from "../utils/AppError.js";

import {
  listarEmprestimos,
  buscarEmprestimoPorId,
  criarEmprestimo,
  atualizarEmprestimo,
  excluirEmprestimo,
  buscarResumoEmprestimos,
} from "../services/emprestimosService.js";

// ==========================================
// OBTER CONTEXTO DO USUÁRIO
// ==========================================

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

  return {
    usuarioId,
    empresaId,
  };
}

// ==========================================
// LISTAR EMPRÉSTIMOS E FINANCIAMENTOS
// GET /api/emprestimos
// ==========================================

export async function listarEmprestimosController(
  req,
  res,
  next
) {
  try {
    const contexto = obterContexto(req);

    const emprestimos = await listarEmprestimos(
      contexto
    );

    return res.status(200).json({
      sucesso: true,
      total: emprestimos.length,
      emprestimos,
    });
  } catch (erro) {
    next(erro);
  }
}

// ==========================================
// BUSCAR RESUMO DOS EMPRÉSTIMOS
// GET /api/emprestimos/resumo
// ==========================================

export async function buscarResumoEmprestimosController(
  req,
  res,
  next
) {
  try {
    const contexto = obterContexto(req);

    const resumo = await buscarResumoEmprestimos(
      contexto
    );

    return res.status(200).json({
      sucesso: true,
      resumo,
    });
  } catch (erro) {
    next(erro);
  }
}

// ==========================================
// BUSCAR EMPRÉSTIMO POR ID
// GET /api/emprestimos/:id
// ==========================================

export async function buscarEmprestimoController(
  req,
  res,
  next
) {
  try {
    const contexto = obterContexto(req);

    const emprestimo = await buscarEmprestimoPorId({
      ...contexto,
      emprestimoId: req.params.id,
    });

    return res.status(200).json({
      sucesso: true,
      emprestimo,
    });
  } catch (erro) {
    next(erro);
  }
}

// ==========================================
// CADASTRAR EMPRÉSTIMO
// POST /api/emprestimos
// ==========================================

export async function criarEmprestimoController(
  req,
  res,
  next
) {
  try {
    const contexto = obterContexto(req);

    const emprestimo = await criarEmprestimo({
      ...contexto,
      dados: req.body,
    });

    return res.status(201).json({
      sucesso: true,
      mensagem: "Empréstimo cadastrado com sucesso.",
      emprestimo,
    });
  } catch (erro) {
    next(erro);
  }
}

// ==========================================
// ATUALIZAR EMPRÉSTIMO
// PUT /api/emprestimos/:id
// ==========================================

export async function atualizarEmprestimoController(
  req,
  res,
  next
) {
  try {
    const contexto = obterContexto(req);

    const emprestimo = await atualizarEmprestimo({
      ...contexto,
      emprestimoId: req.params.id,
      dados: req.body,
    });

    return res.status(200).json({
      sucesso: true,
      mensagem: "Empréstimo atualizado com sucesso.",
      emprestimo,
    });
  } catch (erro) {
    next(erro);
  }
}

// ==========================================
// EXCLUIR EMPRÉSTIMO
// DELETE /api/emprestimos/:id
// ==========================================

export async function excluirEmprestimoController(
  req,
  res,
  next
) {
  try {
    const contexto = obterContexto(req);

    const resultado = await excluirEmprestimo({
      ...contexto,
      emprestimoId: req.params.id,
    });

    return res.status(200).json({
      sucesso: true,
      mensagem: resultado.mensagem,
    });
  } catch (erro) {
    next(erro);
  }
}

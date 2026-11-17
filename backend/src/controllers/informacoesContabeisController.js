
import {
  // EMPRESA
  consultarEmpresaContabil,
  atualizarEmpresaContabil,
  buscarIndicadoresContabeis,

  // CATEGORIAS
  listarCategoriasContabeis,
  criarCategoriaContabil,

  // MOVIMENTAÇÕES
  listarMovimentacoesContabeis,
  buscarMovimentacaoContabilPorId,
  criarMovimentacaoContabil,
  atualizarMovimentacaoContabil,
  excluirMovimentacaoContabil,

  // CLIENTES E FORNECEDORES
  listarPessoasContabeis,
  buscarPessoaContabilPorId,
  criarPessoaContabil,
  atualizarPessoaContabil,
  excluirPessoaContabil,
} from "../services/informacoescontabeisService.js";

// ==========================================
// CONSULTAR EMPRESA
// ==========================================

export async function consultarEmpresaContabilController(
  req,
  res,
  next
) {
  try {
    const resultado = await consultarEmpresaContabil(
      req.usuario.id
    );

    return res.status(200).json({
      mensagem: "Empresa consultada com sucesso.",
      ...resultado,
    });
  } catch (erro) {
    next(erro);
  }
}

// ==========================================
// ATUALIZAR EMPRESA
// ==========================================

export async function atualizarEmpresaContabilController(
  req,
  res,
  next
) {
  try {
    const resultado = await atualizarEmpresaContabil(
      req.usuario.id,
      req.body ?? {}
    );

    return res.status(200).json({
      mensagem: "Empresa atualizada com sucesso.",
      ...resultado,
    });
  } catch (erro) {
    next(erro);
  }
}

// ==========================================
// BUSCAR INDICADORES CONTÁBEIS
// ==========================================

export async function buscarIndicadoresContabeisController(
  req,
  res,
  next
) {
  try {
    const indicadores = await buscarIndicadoresContabeis(
      req.usuario.id
    );

    return res.status(200).json({
      mensagem: "Indicadores consultados com sucesso.",
      indicadores,
    });
  } catch (erro) {
    next(erro);
  }
}

// ==========================================
// LISTAR CATEGORIAS
// ==========================================

export async function listarCategoriasContabeisController(
  req,
  res,
  next
) {
  try {
    const categorias = await listarCategoriasContabeis(
      req.usuario.id
    );

    return res.status(200).json({
      mensagem: "Categorias consultadas com sucesso.",
      categorias,
    });
  } catch (erro) {
    next(erro);
  }
}

// ==========================================
// CRIAR CATEGORIA
// ==========================================

export async function criarCategoriaContabilController(
  req,
  res,
  next
) {
  try {
    const categoria = await criarCategoriaContabil(
      req.usuario.id,
      req.body ?? {}
    );

    return res.status(201).json({
      mensagem: "Categoria cadastrada com sucesso.",
      categoria,
    });
  } catch (erro) {
    next(erro);
  }
}

// ==========================================
// LISTAR MOVIMENTAÇÕES
// ==========================================

export async function listarMovimentacoesContabeisController(
  req,
  res,
  next
) {
  try {
    const movimentacoes = await listarMovimentacoesContabeis(
      req.usuario.id,
      req.query ?? {}
    );

    return res.status(200).json({
      mensagem: "Movimentações consultadas com sucesso.",
      movimentacoes,
    });
  } catch (erro) {
    next(erro);
  }
}

// ==========================================
// BUSCAR MOVIMENTAÇÃO POR ID
// ==========================================

export async function buscarMovimentacaoContabilPorIdController(
  req,
  res,
  next
) {
  try {
    const movimentacao = await buscarMovimentacaoContabilPorId(
      req.usuario.id,
      req.params.id
    );

    return res.status(200).json({
      mensagem: "Movimentação consultada com sucesso.",
      movimentacao,
    });
  } catch (erro) {
    next(erro);
  }
}

// ==========================================
// CRIAR MOVIMENTAÇÃO
// ==========================================

export async function criarMovimentacaoContabilController(
  req,
  res,
  next
) {
  try {
    const movimentacao = await criarMovimentacaoContabil(
      req.usuario.id,
      req.body ?? {}
    );

    return res.status(201).json({
      mensagem: "Movimentação cadastrada com sucesso.",
      movimentacao,
    });
  } catch (erro) {
    next(erro);
  }
}

// ==========================================
// ATUALIZAR MOVIMENTAÇÃO
// ==========================================

export async function atualizarMovimentacaoContabilController(
  req,
  res,
  next
) {
  try {
    const movimentacao = await atualizarMovimentacaoContabil(
      req.usuario.id,
      req.params.id,
      req.body ?? {}
    );

    return res.status(200).json({
      mensagem: "Movimentação atualizada com sucesso.",
      movimentacao,
    });
  } catch (erro) {
    next(erro);
  }
}

// ==========================================
// EXCLUIR MOVIMENTAÇÃO
// ==========================================

export async function excluirMovimentacaoContabilController(
  req,
  res,
  next
) {
  try {
    const resultado = await excluirMovimentacaoContabil(
      req.usuario.id,
      req.params.id
    );

    return res.status(200).json({
      mensagem: "Movimentação excluída com sucesso.",
      ...resultado,
    });
  } catch (erro) {
    next(erro);
  }
}

// ==========================================
// LISTAR CLIENTES E FORNECEDORES
// ==========================================

export async function listarPessoasContabeisController(
  req,
  res,
  next
) {
  try {
    const pessoas = await listarPessoasContabeis(
      req.usuario.id
    );

    return res.status(200).json({
      mensagem: "Clientes e fornecedores consultados com sucesso.",
      pessoas,
    });
  } catch (erro) {
    next(erro);
  }
}

// ==========================================
// BUSCAR CLIENTE OU FORNECEDOR POR ID
// ==========================================

export async function buscarPessoaContabilPorIdController(
  req,
  res,
  next
) {
  try {
    const pessoa = await buscarPessoaContabilPorId(
      req.usuario.id,
      req.params.id
    );

    return res.status(200).json({
      mensagem: "Cliente ou fornecedor consultado com sucesso.",
      pessoa,
    });
  } catch (erro) {
    next(erro);
  }
}

// ==========================================
// CADASTRAR CLIENTE OU FORNECEDOR
// ==========================================

export async function criarPessoaContabilController(
  req,
  res,
  next
) {
  try {
    const pessoa = await criarPessoaContabil(
      req.usuario.id,
      req.body ?? {}
    );

    return res.status(201).json({
      mensagem: "Cliente ou fornecedor cadastrado com sucesso.",
      pessoa,
    });
  } catch (erro) {
    next(erro);
  }
}

// ==========================================
// ATUALIZAR CLIENTE OU FORNECEDOR
// ==========================================

export async function atualizarPessoaContabilController(
  req,
  res,
  next
) {
  try {
    const pessoa = await atualizarPessoaContabil(
      req.usuario.id,
      req.params.id,
      req.body ?? {}
    );

    return res.status(200).json({
      mensagem: "Cliente ou fornecedor atualizado com sucesso.",
      pessoa,
    });
  } catch (erro) {
    next(erro);
  }
}

// ==========================================
// EXCLUIR CLIENTE OU FORNECEDOR
// ==========================================

export async function excluirPessoaContabilController(
  req,
  res,
  next
) {
  try {
    const resultado = await excluirPessoaContabil(
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

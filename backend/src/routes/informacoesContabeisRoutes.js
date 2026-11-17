
import { Router } from "express";

import {
  // EMPRESA
  consultarEmpresaContabilController,
  atualizarEmpresaContabilController,

  // INDICADORES
  buscarIndicadoresContabeisController,

  // CATEGORIAS
  listarCategoriasContabeisController,
  criarCategoriaContabilController,

  // MOVIMENTAÇÕES
  listarMovimentacoesContabeisController,
  buscarMovimentacaoContabilPorIdController,
  criarMovimentacaoContabilController,
  atualizarMovimentacaoContabilController,
  excluirMovimentacaoContabilController,

  // CLIENTES E FORNECEDORES
  listarPessoasContabeisController,
  buscarPessoaContabilPorIdController,
  criarPessoaContabilController,
  atualizarPessoaContabilController,
  excluirPessoaContabilController,
} from "../controllers/informacoesContabeisController.js";

import {
  autenticarUsuario,
} from "../middlewares/authMiddleware.js";

const router = Router();

// ==========================================
// AUTENTICAÇÃO
// ==========================================

// Todas as rotas exigem autenticação.
router.use(autenticarUsuario);

// ==========================================
// EMPRESA
// ==========================================

// Consultar informações da empresa.
router.get(
  "/empresa",
  consultarEmpresaContabilController
);

// Atualizar dados cadastrais da empresa.
// A permissão de proprietário é validada no service.
router.patch(
  "/empresa",
  atualizarEmpresaContabilController
);

// ==========================================
// INDICADORES FINANCEIROS
// ==========================================

// Consultar receitas, despesas, saldo
// e quantidade de registros.
router.get(
  "/indicadores",
  buscarIndicadoresContabeisController
);

// ==========================================
// CATEGORIAS
// ==========================================

// Listar categorias.
router.get(
  "/categorias",
  listarCategoriasContabeisController
);

// Cadastrar categoria.
router.post(
  "/categorias",
  criarCategoriaContabilController
);

// ==========================================
// MOVIMENTAÇÕES FINANCEIRAS
// ==========================================

// Listar movimentações.
// Aceita filtros por tipo e status.
router.get(
  "/movimentacoes",
  listarMovimentacoesContabeisController
);

// Buscar movimentação por ID.
router.get(
  "/movimentacoes/:id",
  buscarMovimentacaoContabilPorIdController
);

// Cadastrar movimentação.
router.post(
  "/movimentacoes",
  criarMovimentacaoContabilController
);

// Atualizar movimentação.
router.patch(
  "/movimentacoes/:id",
  atualizarMovimentacaoContabilController
);

// Excluir movimentação.
router.delete(
  "/movimentacoes/:id",
  excluirMovimentacaoContabilController
);

// ==========================================
// CLIENTES E FORNECEDORES
// ==========================================

// Listar clientes e fornecedores da empresa.
router.get(
  "/pessoas",
  listarPessoasContabeisController
);

// Buscar cliente ou fornecedor pelo ID.
router.get(
  "/pessoas/:id",
  buscarPessoaContabilPorIdController
);

// Cadastrar cliente ou fornecedor.
router.post(
  "/pessoas",
  criarPessoaContabilController
);

// Atualizar cliente ou fornecedor.
router.patch(
  "/pessoas/:id",
  atualizarPessoaContabilController
);

// Excluir cliente ou fornecedor.
// Cadastros com movimentações vinculadas
// não podem ser excluídos.
router.delete(
  "/pessoas/:id",
  excluirPessoaContabilController
);

export default router;

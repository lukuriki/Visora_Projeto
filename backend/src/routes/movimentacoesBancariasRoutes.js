
import { Router } from "express";

import {
  // CONTAS BANCÁRIAS
  listarContasBancariasController,
  buscarContaBancariaPorIdController,
  criarContaBancariaController,
  atualizarContaBancariaController,
  excluirContaBancariaController,

  // MOVIMENTAÇÕES BANCÁRIAS
  listarMovimentacoesBancariasController,
  buscarMovimentacaoBancariaPorIdController,
  criarMovimentacaoBancariaController,
  atualizarMovimentacaoBancariaController,
  excluirMovimentacaoBancariaController,

  // SALDOS BANCÁRIOS
  buscarSaldosBancariosController,
} from "../controllers/movimentacoesBancariasController.js";

import {
  autenticarUsuario,
} from "../middlewares/authMiddleware.js";

const router = Router();

// ==========================================
// AUTENTICAÇÃO
// ==========================================

// Todas as rotas deste módulo exigem
// um usuário autenticado com token JWT.
router.use(autenticarUsuario);

// ==========================================
// SALDOS BANCÁRIOS
// ==========================================

// Consultar o saldo total e os saldos
// individuais das contas da empresa.
router.get(
  "/saldos",
  buscarSaldosBancariosController
);

// ==========================================
// CONTAS BANCÁRIAS
// ==========================================

// Listar todas as contas bancárias da empresa.
router.get(
  "/contas",
  listarContasBancariasController
);

// Consultar uma conta bancária pelo ID.
router.get(
  "/contas/:id",
  buscarContaBancariaPorIdController
);

// Cadastrar uma nova conta bancária.
router.post(
  "/contas",
  criarContaBancariaController
);

// Atualizar os dados de uma conta bancária.
router.patch(
  "/contas/:id",
  atualizarContaBancariaController
);

// Excluir uma conta bancária.
// O service impede a exclusão de contas
// que possuem movimentações vinculadas.
router.delete(
  "/contas/:id",
  excluirContaBancariaController
);

// ==========================================
// MOVIMENTAÇÕES BANCÁRIAS
// ==========================================

// Listar movimentações bancárias.
// Permite filtros por:
// - conta_bancaria_id
// - tipo
// - data_inicio
// - data_fim
router.get(
  "/movimentacoes",
  listarMovimentacoesBancariasController
);

// Consultar uma movimentação bancária pelo ID.
router.get(
  "/movimentacoes/:id",
  buscarMovimentacaoBancariaPorIdController
);

// Registrar uma entrada ou saída bancária.
router.post(
  "/movimentacoes",
  criarMovimentacaoBancariaController
);

// Atualizar uma movimentação bancária.
router.patch(
  "/movimentacoes/:id",
  atualizarMovimentacaoBancariaController
);

// Excluir uma movimentação bancária.
router.delete(
  "/movimentacoes/:id",
  excluirMovimentacaoBancariaController
);

export default router;

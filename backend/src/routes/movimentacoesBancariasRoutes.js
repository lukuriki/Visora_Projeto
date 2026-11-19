
import { Router } from "express";

import { listarContasBancariasController, buscarContaBancariaPorIdController, criarContaBancariaController, atualizarContaBancariaController, excluirContaBancariaController, listarMovimentacoesBancariasController, buscarMovimentacaoBancariaPorIdController, criarMovimentacaoBancariaController, atualizarMovimentacaoBancariaController, excluirMovimentacaoBancariaController, buscarSaldosBancariosController } from "../controllers/movimentacoesBancariasController.js";
import { autenticarUsuario } from "../middlewares/authMiddleware.js";

const router = Router();

router.use(autenticarUsuario);

router.get("/saldos", buscarSaldosBancariosController);
router.get("/contas", listarContasBancariasController);
router.get("/contas/:id", buscarContaBancariaPorIdController);
router.post("/contas", criarContaBancariaController);
router.patch("/contas/:id", atualizarContaBancariaController);
router.delete("/contas/:id", excluirContaBancariaController);
router.get("/movimentacoes", listarMovimentacoesBancariasController);
router.get("/movimentacoes/:id", buscarMovimentacaoBancariaPorIdController);
router.post("/movimentacoes", criarMovimentacaoBancariaController);
router.patch("/movimentacoes/:id", atualizarMovimentacaoBancariaController);
router.delete("/movimentacoes/:id", excluirMovimentacaoBancariaController);

export default router;

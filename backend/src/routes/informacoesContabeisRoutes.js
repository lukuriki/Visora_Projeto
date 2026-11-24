
import { Router } from "express";

import { consultarEmpresaContabilController, atualizarEmpresaContabilController, buscarIndicadoresContabeisController, listarCategoriasContabeisController, criarCategoriaContabilController, listarMovimentacoesContabeisController, buscarMovimentacaoContabilPorIdController, criarMovimentacaoContabilController, atualizarMovimentacaoContabilController, excluirMovimentacaoContabilController, listarPessoasContabeisController, buscarPessoaContabilPorIdController, criarPessoaContabilController, atualizarPessoaContabilController, excluirPessoaContabilController } from "../controllers/informacoesContabeisController.js";
import { autenticarUsuario } from "../middlewares/authMiddleware.js";
import { identificarEmpresa } from "../middlewares/empresaMiddleware.js";

const router = Router();

router.use(autenticarUsuario);
router.use(identificarEmpresa);

router.get("/empresa", consultarEmpresaContabilController);
router.patch("/empresa", atualizarEmpresaContabilController);
router.get("/indicadores", buscarIndicadoresContabeisController);
router.get("/categorias", listarCategoriasContabeisController);
router.post("/categorias", criarCategoriaContabilController);
router.get("/movimentacoes", listarMovimentacoesContabeisController);
router.get("/movimentacoes/:id", buscarMovimentacaoContabilPorIdController);
router.post("/movimentacoes", criarMovimentacaoContabilController);
router.patch("/movimentacoes/:id", atualizarMovimentacaoContabilController);
router.delete("/movimentacoes/:id", excluirMovimentacaoContabilController);
router.get("/pessoas", listarPessoasContabeisController);
router.get("/pessoas/:id", buscarPessoaContabilPorIdController);
router.post("/pessoas", criarPessoaContabilController);
router.patch("/pessoas/:id", atualizarPessoaContabilController);
router.delete("/pessoas/:id", excluirPessoaContabilController);

export default router;
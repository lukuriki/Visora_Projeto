
import { Router } from "express";

import { ativar } from "../controllers/ativacaoController.js";
import { login, perfil, atualizarPerfil, alterarSenha, esqueceuUsuario, listarEmpresas } from "../controllers/authController.js";
import { solicitarRecuperacao, redefinirSenhaController } from "../controllers/recuperacaoSenhaController.js";
import { autenticarUsuario } from "../middlewares/authMiddleware.js";

const router = Router();

router.post("/ativar", ativar);
router.post("/login", login);
router.post("/esqueceu-usuario", esqueceuUsuario);
router.post("/esqueceu-senha", solicitarRecuperacao);
router.post("/redefinir-senha", redefinirSenhaController);
router.get("/perfil", autenticarUsuario, perfil);
router.put("/perfil", autenticarUsuario, atualizarPerfil);
router.patch("/senha", autenticarUsuario, alterarSenha);
router.get("/empresas", autenticarUsuario, listarEmpresas);

export default router;


import { Router } from "express";

import { ativar } from "../controllers/ativacaoController.js";
import {login, perfil, atualizarPerfil, alterarSenha} from "../controllers/authController.js";
import { autenticarUsuario } from "../middlewares/authMiddleware.js";

const router = Router();

router.post("/ativar", ativar);
router.post("/login", login);
router.get("/perfil", autenticarUsuario, perfil);
router.put("/perfil", autenticarUsuario, atualizarPerfil);
router.patch("/senha", autenticarUsuario, alterarSenha);

export default router;
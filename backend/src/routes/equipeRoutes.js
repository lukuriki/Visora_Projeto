
import { Router } from "express";

import {
  listarEquipeController,
  listarMembrosEquipeController,
  convidarColaboradorController,
  consultarConviteController,
  ativarConviteController,
  cancelarConviteController,
  removerColaboradorController,
} from "../controllers/equipeController.js";

import { autenticarUsuario } from "../middlewares/authMiddleware.js";

import { verificarProprietario } from "../middlewares/proprietarioMiddleware.js";

const router = Router();

// ==========================================
// ROTAS PÚBLICAS
// ==========================================

// Consultar convite recebido por e-mail.
router.get(
  "/convites/:token",
  consultarConviteController
);

// Ativar conta do colaborador.
router.post(
  "/convites/ativar",
  ativarConviteController
);

// ==========================================
// ROTAS PARA USUÁRIOS AUTENTICADOS
// ==========================================

// Exige que o usuário esteja autenticado.
router.use(autenticarUsuario);

// Proprietário e colaborador podem visualizar
// os membros da equipe.
router.get(
  "/membros",
  listarMembrosEquipeController
);

// ==========================================
// ROTAS EXCLUSIVAS DO PROPRIETÁRIO
// ==========================================

// A partir daqui, somente o proprietário
// pode acessar as rotas.
router.use(verificarProprietario);

// Listar colaboradores e convites.
router.get(
  "/",
  listarEquipeController
);

// Enviar convite para colaborador.
router.post(
  "/convites",
  convidarColaboradorController
);

// Cancelar convite pendente.
router.patch(
  "/convites/:id/cancelar",
  cancelarConviteController
);

// Remover colaborador da empresa.
router.delete(
  "/colaboradores/:id",
  removerColaboradorController
);

export default router;

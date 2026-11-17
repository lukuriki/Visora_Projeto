
import { Router } from "express";

import {
  consultarAssinaturaController,
  listarPlanosDisponiveisController,
  alterarPreferenciaPagamentoController,
  solicitarTrocaPlanoController,
  consultarTrocaPlanoController,
} from "../controllers/assinaturasController.js";

import {
  autenticarUsuario,
} from "../middlewares/authMiddleware.js";

const router = Router();

// Todas as rotas exigem autenticação.
router.use(autenticarUsuario);

// ==========================================
// CONSULTAR ASSINATURA ATUAL
// ==========================================

router.get("/", consultarAssinaturaController);

// ==========================================
// LISTAR PLANOS DISPONÍVEIS
// ==========================================

router.get("/planos", listarPlanosDisponiveisController);

// ==========================================
// ALTERAR PREFERÊNCIA DE PAGAMENTO
// ==========================================

router.patch(
  "/pagamento",
  alterarPreferenciaPagamentoController
);

// ==========================================
// SOLICITAR TROCA DE PLANO
// ==========================================

router.post(
  "/trocar-plano",
  solicitarTrocaPlanoController
);

// ==========================================
// CONSULTAR PAGAMENTO DA TROCA
// ==========================================

router.get(
  "/troca/:codigo",
  consultarTrocaPlanoController
);

export default router;

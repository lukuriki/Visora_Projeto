
import { Router } from "express";

import {consultarAssinaturaController, listarPlanosDisponiveisController, alterarPreferenciaPagamentoController, solicitarTrocaPlanoController, consultarTrocaPlanoController } from "../controllers/assinaturasController.js";

import { autenticarUsuario } from "../middlewares/authMiddleware.js";

const router = Router();

router.use(autenticarUsuario);

router.get("/", consultarAssinaturaController);
router.get("/planos", listarPlanosDisponiveisController);
router.patch("/pagamento", alterarPreferenciaPagamentoController);
router.post("/trocar-plano", solicitarTrocaPlanoController);
router.get("/troca/:codigo",consultarTrocaPlanoController);

export default router;

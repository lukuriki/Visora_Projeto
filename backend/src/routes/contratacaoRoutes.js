import { Router } from "express";

import {
  baixarRecibo,
  confirmarSimulado,
  consultarContratacao,
  iniciarContratacao,
  validarDisponibilidade,
} from "../controllers/contratacaoController.js";

const router = Router();

router.post("/validar", validarDisponibilidade);
router.post("/", iniciarContratacao);
router.get("/:codigo", consultarContratacao);
router.get("/:codigo/recibo", baixarRecibo);
router.post("/:codigo/confirmar-simulado", confirmarSimulado);

export default router;
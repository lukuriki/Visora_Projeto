import { Router } from "express";

import { ativar } from "../controllers/ativacaoController.js";

const router = Router();

router.post("/ativar", ativar);

export default router;
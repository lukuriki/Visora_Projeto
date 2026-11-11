import { Router } from "express";

import { ativar } from "../controllers/ativacaoController.js";
import { login } from "../controllers/authController.js";

const router = Router();

router.post("/ativar", ativar);
router.post("/login", login);

export default router;
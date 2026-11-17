
import { Router } from "express";

import { pool } from "../config/database.js";

import {
  autenticarUsuario,
} from "../middlewares/authMiddleware.js";

import {
  buscarAnalisesFinanceirasController,
} from "../controllers/analisesController.js";

const router = Router();

// ==========================================
// IDENTIFICAR EMPRESA DO USUÁRIO
// ==========================================

async function identificarEmpresa(req, res, next) {
  try {
    const usuarioId = req.usuario?.id;

    if (!usuarioId) {
      return res.status(401).json({
        sucesso: false,
        mensagem: "Usuário não autenticado.",
      });
    }

    const [vinculos] = await pool.execute(
      `SELECT empresa_id
       FROM usuario_empresa
       WHERE usuario_id = ?
       ORDER BY empresa_id ASC
       LIMIT 2`,
      [usuarioId]
    );

    if (!vinculos.length) {
      return res.status(403).json({
        sucesso: false,
        mensagem:
          "O usuário não está vinculado a nenhuma empresa.",
      });
    }

    if (vinculos.length > 1) {
      return res.status(409).json({
        sucesso: false,
        mensagem:
          "O usuário possui mais de uma empresa. Selecione uma empresa antes de acessar as análises financeiras.",
      });
    }

    req.empresaId = vinculos[0].empresa_id;

    return next();
  } catch (erro) {
    return next(erro);
  }
}

// ==========================================
// MIDDLEWARES DE SEGURANÇA
// ==========================================

// Exige autenticação JWT.
router.use(autenticarUsuario);

// Identifica a empresa vinculada ao usuário.
router.use(identificarEmpresa);

// ==========================================
// ROTAS DE ANÁLISES FINANCEIRAS
// ==========================================

// CONSULTAR ANÁLISES FINANCEIRAS
// GET /api/analises
router.get(
  "/",
  buscarAnalisesFinanceirasController
);

export default router;

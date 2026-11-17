
import { Router } from "express";

import { pool } from "../config/database.js";

import {
  autenticarUsuario,
} from "../middlewares/authMiddleware.js";

import {
  listarPatrimoniosController,
  buscarPatrimonioController,
  criarPatrimonioController,
  atualizarPatrimonioController,
  excluirPatrimonioController,
  buscarResumoPatrimonioController,
} from "../controllers/patrimonioController.js";

const router = Router();

// ==========================================
// IDENTIFICAR EMPRESA DO USUÁRIO
// ==========================================

async function identificarEmpresa(req, res, next) {
  try {
    const usuarioId = req.usuario?.id;

    if (!usuarioId) {
      return res.status(401).json({
        mensagem: "Usuário não autenticado.",
      });
    }

    const [vinculos] = await pool.execute(
      `SELECT empresa_id
       FROM usuario_empresa
       WHERE usuario_id = ?
       ORDER BY vinculado_em ASC
       LIMIT 2`,
      [usuarioId]
    );

    if (!vinculos.length) {
      return res.status(403).json({
        mensagem:
          "O usuário não está vinculado a nenhuma empresa.",
      });
    }

    if (vinculos.length > 1) {
      return res.status(409).json({
        mensagem:
          "O usuário possui mais de uma empresa. Selecione uma empresa antes de acessar o patrimônio.",
      });
    }

    req.empresaId = vinculos[0].empresa_id;

    next();
  } catch (erro) {
    next(erro);
  }
}

// ==========================================
// MIDDLEWARES
// ==========================================

router.use(autenticarUsuario);
router.use(identificarEmpresa);

// ==========================================
// ROTAS DE PATRIMÔNIO
// ==========================================

// Listar patrimônio e ativos
router.get("/", listarPatrimoniosController);

// Consultar indicadores patrimoniais
// Esta rota deve ficar antes de /:id
router.get("/resumo", buscarResumoPatrimonioController);

// Consultar patrimônio por ID
router.get("/:id", buscarPatrimonioController);

// Cadastrar patrimônio
router.post("/", criarPatrimonioController);

// Atualizar patrimônio
router.put("/:id", atualizarPatrimonioController);

// Excluir patrimônio
router.delete("/:id", excluirPatrimonioController);

export default router;

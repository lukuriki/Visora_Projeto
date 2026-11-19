
import { Router } from "express";

import { pool } from "../config/database.js";

import { autenticarUsuario } from "../middlewares/authMiddleware.js";

import { listarPatrimoniosController, buscarPatrimonioController, criarPatrimonioController, atualizarPatrimonioController, excluirPatrimonioController, buscarResumoPatrimonioController } from "../controllers/patrimonioController.js";

const router = Router();

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
        mensagem: "O usuário não está vinculado a nenhuma empresa.",
      });
    }

    if (vinculos.length > 1) {
      return res.status(409).json({
        mensagem: "O usuário possui mais de uma empresa. Selecione uma empresa antes de acessar o patrimônio.",
      });
    }

    req.empresaId = vinculos[0].empresa_id;

    next();
  } catch (erro) {
    next(erro);
  }
}

router.use(autenticarUsuario);
router.use(identificarEmpresa);

router.get("/", listarPatrimoniosController);
router.get("/resumo", buscarResumoPatrimonioController);
router.get("/:id", buscarPatrimonioController);
router.post("/", criarPatrimonioController);
router.put("/:id", atualizarPatrimonioController);
router.delete("/:id", excluirPatrimonioController);

export default router;

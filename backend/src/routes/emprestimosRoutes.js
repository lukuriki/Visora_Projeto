
import { Router } from "express";

import { pool } from "../config/database.js";

import { autenticarUsuario,} from "../middlewares/authMiddleware.js";
import { listarEmprestimosController, buscarEmprestimoController, criarEmprestimoController, atualizarEmprestimoController, excluirEmprestimoController, buscarResumoEmprestimosController} from "../controllers/emprestimosController.js";

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
       ORDER BY empresa_id ASC
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
        mensagem: "O usuário possui mais de uma empresa. Selecione uma empresa antes de acessar os empréstimos.",
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

router.get("/", listarEmprestimosController);
router.get("/resumo", buscarResumoEmprestimosController);
router.get("/:id", buscarEmprestimoController);
router.post("/", criarEmprestimoController);
router.put("/:id", atualizarEmprestimoController);
router.delete("/:id", excluirEmprestimoController);

export default router;

import { pool } from "../config/database.js";
import { AppError } from "../utils/AppError.js";

export async function verificarProprietario(req, res, next) {
  try {
    const usuarioId = req.usuario?.id;

    if (!usuarioId) {
      throw new AppError("Você precisa estar autenticado.", 401);
    }

    const [empresas] = await pool.execute(
      `SELECT
        e.id,
        e.razao_social,
        ue.perfil_acesso
       FROM usuario_empresa ue
       INNER JOIN empresas e
         ON e.id = ue.empresa_id
       INNER JOIN usuarios u
         ON u.id = ue.usuario_id
       WHERE ue.usuario_id = ?
         AND ue.perfil_acesso = 'proprietario'
         AND u.status_conta = 'ativo'
       ORDER BY ue.vinculado_em ASC
       LIMIT 1`,
      [usuarioId]
    );

    if (!empresas.length) {
      throw new AppError("Acesso negado. Apenas o proprietário pode gerenciar a equipe.", 403);
    }

    req.empresa = {
      id: empresas[0].id,
      razao_social: empresas[0].razao_social,
    };

    return next();
  } catch (erro) {
    return next(erro);
  }
}

import { pool } from "../config/database.js";

export async function autorizarAuditoria(req, res, next) {
  try {
    const usuarioId = req.usuario?.id;

    const empresaId = Number(req.params.empresaId || req.body?.empresa_id || req.query?.empresa_id);

    if (!usuarioId) {
      return res.status(401).json({
        sucesso: false,
        mensagem: "Usuário não autenticado.",
      });
    }

    if (!Number.isSafeInteger(empresaId) || empresaId <= 0) {
      return res.status(400).json({
        sucesso: false,
        mensagem: "Empresa inválida.",
      });
    }

    const [vinculos] = await pool.execute(
      `SELECT
          ue.empresa_id,
          ue.perfil_acesso
       FROM usuario_empresa ue
       INNER JOIN empresas e
         ON e.id = ue.empresa_id
       WHERE ue.usuario_id = ?
         AND ue.empresa_id = ?
         AND e.status = 'ativa'
       LIMIT 1`,
      [usuarioId, empresaId]
    );

    if (!vinculos.length) {
      return res.status(403).json({
        sucesso: false,
        mensagem: "Acesso não autorizado à empresa.",
      });
    }

    const perfil = vinculos[0].perfil_acesso;

    if (!["proprietario", "administrador"].includes(perfil)) {
      return res.status(403).json({
        sucesso: false,
        mensagem: "Você não possui permissão para acessar a auditoria.",
      });
    }

    req.auditoria = {empresaId, usuarioId, perfil};

    return next();
  } catch (erro) {
    return next(erro);
  }
}
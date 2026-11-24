
import bcrypt from "bcryptjs";

import { pool } from "../config/database.js";
import { AppError } from "../utils/AppError.js";
import { gerarSenha } from "../utils/credenciais.js";
import { hashToken, tokenComFormatoValido } from "../utils/tokens.js";

export async function ativarConta({ token }) {
  if (!tokenComFormatoValido(token)) {
    throw new AppError("Link inválido ou expirado.", 400);
  }

  const conexao = await pool.getConnection();

  try {
    await conexao.beginTransaction();

    const [rows] = await conexao.execute(
  `SELECT
      t.id AS token_id,
      u.id AS usuario_id,
      u.nome_usuario,
      ue.empresa_id
   FROM tokens_usuario t
   JOIN usuarios u
     ON u.id = t.usuario_id
   JOIN usuario_empresa ue
     ON ue.usuario_id = u.id
     AND ue.perfil_acesso = 'proprietario'
   WHERE t.token_hash = ?
     AND t.tipo = 'verificacao_email'
     AND t.usado_em IS NULL
     AND t.expira_em > NOW()
   ORDER BY ue.empresa_id ASC
   LIMIT 1
   FOR UPDATE`,
  [hashToken(token)]
);

    if (rows.length === 0) {
      throw new AppError("Link inválido, expirado ou já utilizado.", 400);
    }

    const usuario = rows[0];

    const senha = gerarSenha(10, usuario.empresa_id);

    const senhaHash = await bcrypt.hash(senha, 10);

    await conexao.execute(
      `UPDATE usuarios
       SET senha = ?, status_conta = 'ativo'
       WHERE id = ?`,
      [senhaHash, usuario.usuario_id],
    );

    await conexao.execute(
      "UPDATE tokens_usuario SET usado_em = NOW() WHERE id = ?",
      [usuario.token_id],
    );

    await conexao.commit();

    return {
      nomeUsuario: usuario.nome_usuario,
      senha,
    };
  } catch (error) {
    await conexao.rollback().catch(() => {});
    throw error;
  } finally {
    conexao.release();
  }
}

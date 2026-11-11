
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
          u.nome_usuario
       FROM tokens_usuario t
       JOIN usuarios u ON u.id = t.usuario_id
       WHERE t.token_hash = ?
         AND t.tipo = 'verificacao_email'
         AND t.usado_em IS NULL
         AND t.expira_em > NOW()
       FOR UPDATE`,
      [hashToken(token)],
    );

    if (rows.length === 0) {
      throw new AppError("Link inválido, expirado ou já utilizado.", 400);
    }

    const usuario = rows[0];

    // Gera uma senha aleatória de 16 caracteres.
    const senha = gerarSenha(16);

    // Armazena somente o hash da senha.
    const senhaHash = await bcrypt.hash(senha, 10);

    await conexao.execute(
      `UPDATE usuarios
       SET senha = ?, status_conta = 'ativo'
       WHERE id = ?`,
      [senhaHash, usuario.usuario_id],
    );

    // Impede que o mesmo link seja utilizado novamente.
    await conexao.execute(
      "UPDATE tokens_usuario SET usado_em = NOW() WHERE id = ?",
      [usuario.token_id],
    );

    await conexao.commit();

    // A senha original é retornada somente nesta resposta.
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

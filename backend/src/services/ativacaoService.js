import bcrypt from "bcryptjs";

import { pool } from "../config/database.js";
import { AppError } from "../utils/AppError.js";
import { hashToken, tokenComFormatoValido } from "../utils/tokens.js";

// Regras mínimas de senha (bcrypt só considera os primeiros 72 bytes).
export function validarSenha(senha) {
  if (typeof senha !== "string" || senha.length < 8) return "A senha precisa ter pelo menos 8 caracteres.";
  if (Buffer.byteLength(senha) > 72) return "A senha é longa demais (máximo de 72 caracteres).";
  if (!/[A-Za-z]/.test(senha) || !/\d/.test(senha)) return "A senha precisa ter letras e números.";
  return null;
}

// Usuário clicou no link do e-mail e escolheu a senha.
export async function ativarConta({ token, senha }) {
  const erroSenha = validarSenha(senha);
  if (erroSenha) throw new AppError(erroSenha, 400, { senha: erroSenha });
  if (!tokenComFormatoValido(token)) throw new AppError("Link inválido ou expirado.", 400);

  const conexao = await pool.getConnection();
  try {
    await conexao.beginTransaction();

    const [rows] = await conexao.execute(
      `SELECT t.id AS token_id, u.id AS usuario_id, u.nome_usuario
         FROM tokens_usuario t
         JOIN usuarios u ON u.id = t.usuario_id
        WHERE t.token_hash = ? AND t.tipo = 'verificacao_email'
          AND t.usado_em IS NULL AND t.expira_em > NOW()
        FOR UPDATE`,
      [hashToken(token)],
    );
    if (rows.length === 0) throw new AppError("Link inválido ou expirado.", 400);
    const t = rows[0];

    const hash = await bcrypt.hash(senha, 10);
    await conexao.execute("UPDATE usuarios SET senha = ?, status_conta = 'ativo' WHERE id = ?", [hash, t.usuario_id]);
    await conexao.execute("UPDATE tokens_usuario SET usado_em = NOW() WHERE id = ?", [t.token_id]);

    await conexao.commit();
    return { nomeUsuario: t.nome_usuario };
  } catch (error) {
    await conexao.rollback().catch(() => {});
    throw error;
  } finally {
    conexao.release();
  }
}
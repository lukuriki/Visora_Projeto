import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

import { pool } from "../config/database.js";
import { AppError } from "../utils/AppError.js";

export async function realizarLogin({ nomeUsuario, senha }) {
  if (!nomeUsuario || !senha) {
    throw new AppError("Informe seu usuário e sua senha.", 400);
  }

  const [usuarios] = await pool.execute(
    `SELECT
        id,
        nome_usuario,
        senha,
        status_conta
     FROM usuarios
     WHERE nome_usuario = ?
     LIMIT 1`,
    [nomeUsuario.trim()],
  );

  if (usuarios.length === 0) {
    throw new AppError("Usuário ou senha incorretos.", 401);
  }

  const usuario = usuarios[0];

  const senhaValida = await bcrypt.compare(senha, usuario.senha);

  if (!senhaValida) {
    throw new AppError("Usuário ou senha incorretos.", 401);
  }

  if (usuario.status_conta !== "ativo") {
    throw new AppError("Sua conta ainda não está ativada.", 403);
  }

  if (!process.env.JWT_SECRET) {
    throw new AppError("Configuração de autenticação indisponível.", 500);
  }

  const token = jwt.sign(
    {
      id: usuario.id,
      nomeUsuario: usuario.nome_usuario,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: "8h",
    },
  );

  return {
    token,
    usuario: {
      id: usuario.id,
      nomeUsuario: usuario.nome_usuario,
    },
  };
}
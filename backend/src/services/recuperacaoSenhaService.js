
import crypto from "node:crypto";
import bcrypt from "bcryptjs";

import { pool } from "../config/database.js";
import { AppError } from "../utils/AppError.js";
import { enviarEmailRecuperacaoSenha } from "./emailService.js";
import { gerarSenha } from "../utils/credenciais.js";



const TEMPO_EXPIRACAO_MINUTOS = 15;
const INTERVALO_SOLICITACAO_MINUTOS = 2;

const MENSAGEM_SOLICITACAO =
  "Se o e-mail estiver cadastrado, você receberá um link para redefinir sua senha.";



function gerarToken() {
  return crypto.randomBytes(32).toString("hex");
}

function gerarHashToken(token) {
  return crypto
    .createHash("sha256")
    .update(token)
    .digest("hex");
}

function obterURLFrontend() {
  const endereco =
    process.env.FRONTEND_URL || "http://localhost:3000";

  const url = new URL(endereco);

  if (
    url.protocol !== "https:" &&
    url.hostname !== "localhost"
  ) {
    throw new Error(
      "FRONTEND_URL precisa utilizar HTTPS."
    );
  }

  return url;
}


export async function solicitarRecuperacaoSenha(email) {
  if (typeof email !== "string" || !email.trim()) {
    throw new AppError(
      "Informe seu endereço de e-mail.",
      400
    );
  }

  const emailNormalizado = email.trim().toLowerCase();

  if (
    emailNormalizado.length > 100 ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailNormalizado)
  ) {
    throw new AppError(
      "Informe um endereço de e-mail válido.",
      400
    );
  }

  const [usuarios] = await pool.execute(
    `SELECT
        id,
        nome_completo,
        email,
        status_conta
     FROM usuarios
     WHERE email = ?
     LIMIT 1`,
    [emailNormalizado]
  );


  if (!usuarios.length) {
    return {
      sucesso: true,
      mensagem: MENSAGEM_SOLICITACAO,
    };
  }

  const usuario = usuarios[0];


  if (usuario.status_conta !== "ativo") {
    return {
      sucesso: true,
      mensagem: MENSAGEM_SOLICITACAO,
    };
  }


  const [solicitacoesRecentes] = await pool.execute(
    `SELECT id
     FROM tokens_usuario
     WHERE usuario_id = ?
       AND tipo = 'recuperacao_senha'
       AND criado_em > DATE_SUB(
         NOW(),
         INTERVAL 2 MINUTE
       )
     LIMIT 1`,
    [usuario.id]
  );

  if (solicitacoesRecentes.length) {
    return {
      sucesso: true,
      mensagem: MENSAGEM_SOLICITACAO,
    };
  }

  const token = gerarToken();
  const tokenHash = gerarHashToken(token);

  const [resultado] = await pool.execute(
    `INSERT INTO tokens_usuario (
        usuario_id,
        tipo,
        token_hash,
        expira_em
     )
     VALUES (
        ?,
        'recuperacao_senha',
        ?,
        DATE_ADD(
          NOW(),
          INTERVAL 15 MINUTE
        )
     )`,
    [usuario.id, tokenHash]
  );

  const url = new URL(
    "/areapublica_pagina_redefinir_senha",
    obterURLFrontend()
  );

  url.searchParams.set("token", token);


  try {
    await enviarEmailRecuperacaoSenha({
      para: usuario.email,
      nome: usuario.nome_completo,
      linkRecuperacao: url.toString(),
    });
  } catch (erro) {
    await pool.execute(
      `UPDATE tokens_usuario
       SET usado_em = NOW()
       WHERE id = ?
         AND usado_em IS NULL`,
      [resultado.insertId]
    );

    console.error(
      "Erro ao enviar e-mail de recuperação:",
      erro
    );

    throw new AppError(
      "Não foi possível processar a solicitação agora.",
      503
    );
  }

  return {
    sucesso: true,
    mensagem: MENSAGEM_SOLICITACAO,
  };
}


export async function redefinirSenha({ token }) {


  if (
    typeof token !== "string" ||
    !/^[a-f0-9]{64}$/i.test(token)
  ) {
    throw new AppError(
      "Link de recuperação inválido ou expirado.",
      400
    );
  }

  const tokenHash = gerarHashToken(token);
  const conexao = await pool.getConnection();

  try {
    await conexao.beginTransaction();
    const [tokens] = await conexao.execute(
      `SELECT
          id,
          usuario_id,
          expira_em,
          usado_em
       FROM tokens_usuario
       WHERE token_hash = ?
         AND tipo = 'recuperacao_senha'
       FOR UPDATE`,
      [tokenHash]
    );

    if (!tokens.length) {
      throw new AppError(
        "Link de recuperação inválido ou expirado.",
        400
      );
    }

    const registro = tokens[0];

    const [validade] = await conexao.execute(
      `SELECT
         CASE
           WHEN usado_em IS NULL
            AND expira_em > NOW()
           THEN 1
           ELSE 0
         END AS valido
       FROM tokens_usuario
       WHERE id = ?`,
      [registro.id]
    );

    if (Number(validade[0]?.valido) !== 1) {
      throw new AppError(
        "Link de recuperação inválido ou expirado.",
        400
      );
    }


    const [usuarios] = await conexao.execute(
      `SELECT
          u.id,
          u.nome_usuario,
          ue.empresa_id
      FROM usuarios u
      INNER JOIN usuario_empresa ue
        ON ue.usuario_id = u.id
      WHERE u.id = ?
        AND u.status_conta = 'ativo'
      ORDER BY ue.vinculado_em ASC
      LIMIT 1`,
      [registro.usuario_id]
    );

    if (!usuarios.length) {
      throw new AppError(
        "Não foi possível redefinir esta senha.",
        400
      );
    }

    const empresaId = usuarios[0].empresa_id;

    const novaSenha = gerarSenha(10, empresaId);


    const senhaCriptografada = await bcrypt.hash(
      novaSenha,
      12
    );


    await conexao.execute(
      `UPDATE usuarios
       SET senha = ?
       WHERE id = ?`,
      [
        senhaCriptografada,
        registro.usuario_id,
      ]
    );

    await conexao.execute(
      `UPDATE tokens_usuario
       SET usado_em = NOW()
       WHERE usuario_id = ?
         AND tipo = 'recuperacao_senha'
         AND usado_em IS NULL`,
      [registro.usuario_id]
    );



    await conexao.commit();

    return {
      sucesso: true,

      mensagem:
        "Nova senha gerada com sucesso! Salve suas credenciais antes de continuar.",

      nomeUsuario: usuarios[0].nome_usuario,

      novaSenha,
    };

  } catch (erro) {
    await conexao.rollback().catch(() => {});
    throw erro;

  } finally {
    conexao.release();
  }
}
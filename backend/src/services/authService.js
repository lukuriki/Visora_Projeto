
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

import { pool } from "../config/database.js";
import { AppError } from "../utils/AppError.js";

// ========================================
// CONFIGURAÇÕES DE AUTENTICAÇÃO
// ========================================

function gerarToken(dados) {
  if (!process.env.JWT_SECRET) {
    throw new AppError(
      "Configuração de autenticação indisponível.",
      500,
    );
  }

  return jwt.sign(dados, process.env.JWT_SECRET, {
    algorithm: "HS256",
    expiresIn: "8h",
  });
}

function normalizarIdentificador(valor) {
  return String(valor || "").trim();
}

// ========================================
// LOGIN UNIFICADO
// CLIENTE + ADMINISTRADOR
// ========================================

export async function realizarLogin({
  identificador,
  nomeUsuario,
  senha,
}) {
  // Compatibilidade com o login antigo
  const login = normalizarIdentificador(
    identificador || nomeUsuario,
  );

  if (!login || !senha) {
    throw new AppError(
      "Informe seu usuário ou e-mail e sua senha.",
      400,
    );
  }

  // ======================================
  // BUSCAR CLIENTE
  // ======================================

  const [usuarios] = await pool.execute(
    `SELECT
        u.id,
        u.nome_completo,
        u.nome_usuario,
        u.email,
        u.senha,
        u.status_conta,
        (
          SELECT ue.perfil_acesso
          FROM usuario_empresa ue
          WHERE ue.usuario_id = u.id
          ORDER BY ue.vinculado_em ASC
          LIMIT 1
        ) AS perfil_acesso
     FROM usuarios u
     WHERE u.nome_usuario = ?
        OR LOWER(u.email) = LOWER(?)
     LIMIT 2`,
    [login, login],
  );

  // ======================================
  // BUSCAR ADMINISTRADOR
  // ======================================

  const [administradores] = await pool.execute(
    `SELECT
        id,
        nome,
        email,
        senha,
        criado_em
     FROM administrador
     WHERE LOWER(email) = LOWER(?)
     LIMIT 1`,
    [login],
  );

  // ======================================
  // VALIDAR IDENTIFICADOR
  // ======================================

  const totalContas =
    usuarios.length + administradores.length;

  if (totalContas === 0) {
    throw new AppError(
      "Usuário ou senha incorretos.",
      401,
    );
  }

  // Evita selecionar uma conta arbitrariamente
  // quando o identificador pertence a mais
  // de uma conta.
  if (totalContas > 1) {
    throw new AppError(
      "Este identificador está associado a mais de uma conta. Entre em contato com o suporte.",
      409,
    );
  }

  // ======================================
  // LOGIN DO ADMINISTRADOR
  // ======================================

  if (administradores.length === 1) {
    const administrador = administradores[0];

    const senhaValida = await bcrypt.compare(
      senha,
      administrador.senha,
    );

    if (!senhaValida) {
      throw new AppError(
        "Usuário ou senha incorretos.",
        401,
      );
    }

    const token = gerarToken({
      id: administrador.id,
      tipo: "admin",
    });

    return {
      sucesso: true,
      tipo: "admin",
      token,

      administrador: {
        id: administrador.id,
        nome: administrador.nome,
        email: administrador.email,
        tipo: "admin",
        criadoEm: administrador.criado_em,
      },
    };
  }

  // ======================================
  // LOGIN DO CLIENTE
  // ======================================

  const usuario = usuarios[0];

  const senhaValida = await bcrypt.compare(
    senha,
    usuario.senha,
  );

  if (!senhaValida) {
    throw new AppError(
      "Usuário ou senha incorretos.",
      401,
    );
  }

  if (usuario.status_conta !== "ativo") {
    throw new AppError(
      "Sua conta ainda não está ativada.",
      403,
    );
  }

  const token = gerarToken({
    id: usuario.id,
    nomeUsuario: usuario.nome_usuario,
    tipo: usuario.perfil_acesso,
  });

  return {
    sucesso: true,
    tipo: "cliente",
    token,

    usuario: {
      id: usuario.id,
      nomeCompleto: usuario.nome_completo,
      nomeUsuario: usuario.nome_usuario,
      email: usuario.email,
      tipo: usuario.perfil_acesso,
    },
  };
}

// ========================================
// BUSCAR PERFIL COMPLETO DO CLIENTE
// ========================================

export async function buscarPerfilUsuario(usuarioId) {
  const [usuarios] = await pool.execute(
    `SELECT
        u.id,
        u.nome_completo,
        u.nome_usuario,
        u.email,
        u.telefone_usuario,

        ue.perfil_acesso,

        e.id AS empresa_id,
        e.razao_social,
        e.email_empresa,
        e.telefone_empresa,
        e.documento_identificacao,
        e.setor_atuacao,
        e.porte_empresa,
        e.status AS status_empresa,

        (
          SELECT p.tipo
          FROM assinaturas a
          INNER JOIN planos p
            ON p.id = a.plano_id
          WHERE a.empresa_id = e.id
            AND a.status = 'ativa'
          ORDER BY a.data_fim DESC
          LIMIT 1
        ) AS plano_tipo,

        (
          SELECT a.data_fim
          FROM assinaturas a
          WHERE a.empresa_id = e.id
            AND a.status = 'ativa'
          ORDER BY a.data_fim DESC
          LIMIT 1
        ) AS plano_data_fim,

        (
          SELECT a.status
          FROM assinaturas a
          WHERE a.empresa_id = e.id
            AND a.status = 'ativa'
          ORDER BY a.data_fim DESC
          LIMIT 1
        ) AS plano_status

     FROM usuarios u

     LEFT JOIN usuario_empresa ue
       ON ue.usuario_id = u.id

     LEFT JOIN empresas e
       ON e.id = ue.empresa_id

     WHERE u.id = ?

     ORDER BY ue.vinculado_em ASC

     LIMIT 1`,
    [usuarioId],
  );

  if (usuarios.length === 0) {
    throw new AppError(
      "Usuário não encontrado.",
      404,
    );
  }

  const usuario = usuarios[0];

  return {
    id: usuario.id,
    nomeCompleto: usuario.nome_completo,
    nomeUsuario: usuario.nome_usuario,
    email: usuario.email,
    telefone: usuario.telefone_usuario,
    tipo: usuario.perfil_acesso || "Usuário",

    empresa: usuario.empresa_id
      ? {
          id: usuario.empresa_id,
          nome: usuario.razao_social,
          email: usuario.email_empresa,
          telefone: usuario.telefone_empresa,
          documento: usuario.documento_identificacao,
          setor: usuario.setor_atuacao,
          porte: usuario.porte_empresa,
          status: usuario.status_empresa,
        }
      : null,

    plano: usuario.plano_tipo
      ? {
          nome: usuario.plano_tipo,
          dataFim: usuario.plano_data_fim,
          status: usuario.plano_status,
        }
      : null,
  };
}

// ========================================
// ATUALIZAR DADOS PESSOAIS
// ========================================

export async function atualizarPerfilUsuario(
  usuarioId,
  { nomeCompleto, email, telefone },
) {
  if (
    !nomeCompleto?.trim() ||
    !email?.trim() ||
    !telefone?.trim()
  ) {
    throw new AppError(
      "Preencha todos os campos do perfil.",
      400,
    );
  }

  const nome = nomeCompleto.trim();
  const emailFormatado = email.trim().toLowerCase();
  const telefoneFormatado = telefone.trim();

  const [usuarios] = await pool.execute(
    "SELECT id FROM usuarios WHERE id = ?",
    [usuarioId],
  );

  if (usuarios.length === 0) {
    throw new AppError(
      "Usuário não encontrado.",
      404,
    );
  }

  const [emails] = await pool.execute(
    `SELECT id
     FROM usuarios
     WHERE LOWER(email) = LOWER(?)
       AND id <> ?
     LIMIT 1`,
    [emailFormatado, usuarioId],
  );

  if (emails.length > 0) {
    throw new AppError(
      "Este e-mail já está sendo utilizado.",
      409,
    );
  }

  // Evitar conflito com administradores
  const [emailsAdmin] = await pool.execute(
    `SELECT id
     FROM administrador
     WHERE LOWER(email) = LOWER(?)
     LIMIT 1`,
    [emailFormatado],
  );

  if (emailsAdmin.length > 0) {
    throw new AppError(
      "Este e-mail não está disponível.",
      409,
    );
  }

  await pool.execute(
    `UPDATE usuarios
     SET
       nome_completo = ?,
       email = ?,
       telefone_usuario = ?
     WHERE id = ?`,
    [
      nome,
      emailFormatado,
      telefoneFormatado,
      usuarioId,
    ],
  );

  return buscarPerfilUsuario(usuarioId);
}

// ========================================
// ALTERAR SENHA DO CLIENTE
// ========================================

export async function alterarSenhaUsuario(
  usuarioId,
  { senhaAtual, novaSenha },
) {
  if (!senhaAtual || !novaSenha) {
    throw new AppError(
      "Preencha todos os campos de senha.",
      400,
    );
  }

  if (novaSenha.length < 8) {
    throw new AppError(
      "A nova senha deve ter pelo menos 8 caracteres.",
      400,
    );
  }

  if (senhaAtual === novaSenha) {
    throw new AppError(
      "A nova senha deve ser diferente da senha atual.",
      400,
    );
  }

  const [usuarios] = await pool.execute(
    `SELECT id, senha
     FROM usuarios
     WHERE id = ?
     LIMIT 1`,
    [usuarioId],
  );

  if (usuarios.length === 0) {
    throw new AppError(
      "Usuário não encontrado.",
      404,
    );
  }

  const usuario = usuarios[0];

  const senhaValida = await bcrypt.compare(
    senhaAtual,
    usuario.senha,
  );

  if (!senhaValida) {
    throw new AppError(
      "A senha atual está incorreta.",
      401,
    );
  }

  const senhaCriptografada = await bcrypt.hash(
    novaSenha,
    12,
  );

  await pool.execute(
    `UPDATE usuarios
     SET senha = ?
     WHERE id = ?`,
    [senhaCriptografada, usuarioId],
  );

  return {
    message: "Senha alterada com sucesso.",
  };
}

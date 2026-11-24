
import crypto from "node:crypto";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

import { pool } from "../config/database.js";
import { AppError } from "../utils/AppError.js";
import { enviarEmailRecuperacaoUsuario } from "./emailService.js";

function gerarToken(dados) {
  if (!process.env.JWT_SECRET) {
    throw new AppError(
      "Configuração de autenticação indisponível.",
      500
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

async function buscarVinculosAtivos(usuarioId) {
  const [vinculos] = await pool.execute(
    `SELECT
        ue.usuario_id,
        ue.empresa_id,
        ue.perfil_acesso,
        ue.status_vinculo,
        ue.vinculado_em,
        e.razao_social
     FROM usuario_empresa ue
     INNER JOIN empresas e
       ON e.id = ue.empresa_id
     WHERE ue.usuario_id = ?
       AND ue.status_vinculo = 'ativo'
     ORDER BY ue.vinculado_em ASC, ue.empresa_id ASC
     LIMIT 2`,
    [usuarioId]
  );

  return vinculos;
}

export async function realizarLogin({
  identificador,
  nomeUsuario,
  senha,
}) {
  const login = normalizarIdentificador(
    identificador || nomeUsuario
  );

  if (!login || !senha) {
    throw new AppError(
      "Informe seu usuário ou e-mail e sua senha.",
      400
    );
  }

  const [usuarios] = await pool.execute(
    `SELECT
        u.id,
        u.nome_completo,
        u.nome_usuario,
        u.email,
        u.senha,
        u.status_conta
     FROM usuarios u
     WHERE u.nome_usuario = ?
        OR LOWER(u.email) = LOWER(?)
     LIMIT 2`,
    [login, login]
  );


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
    [login]
  );

  const totalContas =
    usuarios.length + administradores.length;

  if (totalContas === 0) {
    throw new AppError(
      "Usuário ou senha incorretos.",
      401
    );
  }

  if (totalContas > 1) {
    throw new AppError(
      "Este identificador está associado a mais de uma conta. Entre em contato com o suporte.",
      409
    );
  }

  if (administradores.length === 1) {
    const administrador = administradores[0];

    const senhaValida = await bcrypt.compare(
      senha,
      administrador.senha
    );

    if (!senhaValida) {
      throw new AppError(
        "Usuário ou senha incorretos.",
        401
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

  const usuario = usuarios[0];

  const senhaValida = await bcrypt.compare(
    senha,
    usuario.senha
  );

  if (!senhaValida) {
    throw new AppError(
      "Usuário ou senha incorretos.",
      401
    );
  }

  if (usuario.status_conta !== "ativo") {
    throw new AppError(
      "Sua conta está inativa. Entre em contato com o responsável.",
      403
    );
  }

  const vinculos = await buscarVinculosAtivos(
    usuario.id
  );

  if (vinculos.length === 0) {
    throw new AppError(
      "Sua conta está ativa, mas você não possui acesso ativo a nenhuma empresa. Entre em contato com o proprietário.",
      403
    );
  }

  const vinculo = vinculos[0];

  const token = gerarToken({
    id: usuario.id,
    nomeUsuario: usuario.nome_usuario,
    tipo: vinculo.perfil_acesso,
    empresaId: vinculo.empresa_id,
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
      tipo: vinculo.perfil_acesso,
      empresaId: vinculo.empresa_id,
      statusConta: usuario.status_conta,
      statusVinculo: vinculo.status_vinculo,
    },
  };
}


export async function buscarPerfilUsuario(
  usuarioId,
  empresaId = null
) {
  const parametros = [usuarioId];

  let filtroEmpresa = "";

  if (empresaId !== null && empresaId !== undefined) {
    const idEmpresa = Number(empresaId);

    if (
      !Number.isSafeInteger(idEmpresa) ||
      idEmpresa <= 0
    ) {
      throw new AppError(
        "Empresa inválida.",
        400
      );
    }

    filtroEmpresa = "AND ue.empresa_id = ?";
    parametros.push(idEmpresa);
  }

  const [usuarios] = await pool.execute(
    `SELECT
        u.id,
        u.nome_completo,
        u.nome_usuario,
        u.email,
        u.telefone_usuario,
        u.status_conta,

        ue.perfil_acesso,
        ue.status_vinculo,

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

     INNER JOIN usuario_empresa ue
       ON ue.usuario_id = u.id
      AND ue.status_vinculo = 'ativo'

     INNER JOIN empresas e
       ON e.id = ue.empresa_id

     WHERE u.id = ?
       AND u.status_conta = 'ativo'
       ${filtroEmpresa}

     ORDER BY ue.vinculado_em ASC, ue.empresa_id ASC

     LIMIT 2`,
    parametros
  );

  if (usuarios.length === 0) {
    throw new AppError(
      "Usuário não encontrado ou sem acesso ativo à empresa.",
      403
    );
  }

  if (
    empresaId === null &&
    usuarios.length > 1
  ) {
    throw new AppError(
      "O usuário possui mais de uma empresa ativa. Informe a empresa para consultar o perfil.",
      409
    );
  }

  const usuario = usuarios[0];

  return {
    id: usuario.id,
    nomeCompleto: usuario.nome_completo,
    nomeUsuario: usuario.nome_usuario,
    email: usuario.email,
    telefone: usuario.telefone_usuario,
    tipo: usuario.perfil_acesso,
    statusConta: usuario.status_conta,
    statusVinculo: usuario.status_vinculo,

    empresa: {
      id: usuario.empresa_id,
      nome: usuario.razao_social,
      email: usuario.email_empresa,
      telefone: usuario.telefone_empresa,
      documento: usuario.documento_identificacao,
      setor: usuario.setor_atuacao,
      porte: usuario.porte_empresa,
      status: usuario.status_empresa,
    },

    plano: usuario.plano_tipo
      ? {
          nome: usuario.plano_tipo,
          dataFim: usuario.plano_data_fim,
          status: usuario.plano_status,
        }
      : null,
  };
}


export async function atualizarPerfilUsuario(
  usuarioId,
  { nomeCompleto, email, telefone }
) {
  if (
    !nomeCompleto?.trim() ||
    !email?.trim() ||
    !telefone?.trim()
  ) {
    throw new AppError(
      "Preencha todos os campos do perfil.",
      400
    );
  }

  const nome = nomeCompleto.trim();

  const emailFormatado = email
    .trim()
    .toLowerCase();

  const telefoneFormatado = telefone.trim();

  const [usuarios] = await pool.execute(
    `SELECT id, status_conta
     FROM usuarios
     WHERE id = ?
     LIMIT 1`,
    [usuarioId]
  );

  if (usuarios.length === 0) {
    throw new AppError(
      "Usuário não encontrado.",
      404
    );
  }

  if (usuarios[0].status_conta !== "ativo") {
    throw new AppError(
      "Sua conta não está ativa.",
      403
    );
  }

  const [emails] = await pool.execute(
    `SELECT id
     FROM usuarios
     WHERE LOWER(email) = LOWER(?)
       AND id <> ?
     LIMIT 1`,
    [emailFormatado, usuarioId]
  );

  if (emails.length > 0) {
    throw new AppError(
      "Este e-mail já está sendo utilizado.",
      409
    );
  }

  const [emailsAdmin] = await pool.execute(
    `SELECT id
     FROM administrador
     WHERE LOWER(email) = LOWER(?)
     LIMIT 1`,
    [emailFormatado]
  );

  if (emailsAdmin.length > 0) {
    throw new AppError(
      "Este e-mail não está disponível.",
      409
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
    ]
  );

  return buscarPerfilUsuario(usuarioId);
}


export async function alterarSenhaUsuario(
  usuarioId,
  { senhaAtual, novaSenha }
) {
  if (!senhaAtual || !novaSenha) {
    throw new AppError(
      "Preencha todos os campos de senha.",
      400
    );
  }

  if (novaSenha.length < 8) {
    throw new AppError(
      "A nova senha deve ter pelo menos 8 caracteres.",
      400
    );
  }

  if (senhaAtual === novaSenha) {
    throw new AppError(
      "A nova senha deve ser diferente da senha atual.",
      400
    );
  }

  const [usuarios] = await pool.execute(
    `SELECT
        id,
        senha,
        status_conta
     FROM usuarios
     WHERE id = ?
     LIMIT 1`,
    [usuarioId]
  );

  if (usuarios.length === 0) {
    throw new AppError(
      "Usuário não encontrado.",
      404
    );
  }

  const usuario = usuarios[0];

  if (usuario.status_conta !== "ativo") {
    throw new AppError(
      "Sua conta não está ativa.",
      403
    );
  }

  const senhaValida = await bcrypt.compare(
    senhaAtual,
    usuario.senha
  );

  if (!senhaValida) {
    throw new AppError(
      "A senha atual está incorreta.",
      401
    );
  }

  const senhaCriptografada = await bcrypt.hash(
    novaSenha,
    12
  );

  await pool.execute(
    `UPDATE usuarios
     SET senha = ?
     WHERE id = ?`,
    [senhaCriptografada, usuarioId]
  );

  return {
    message: "Senha alterada com sucesso.",
  };
}


const MENSAGEM_RECUPERACAO_USUARIO =
  "Se o e-mail estiver cadastrado, você receberá uma mensagem com seu nome de usuário.";

export async function recuperarNomeUsuario(email) {

  if (
    typeof email !== "string" ||
    !email.trim()
  ) {
    throw new AppError(
      "Informe seu endereço de e-mail.",
      400
    );
  }

  const emailNormalizado = email
    .trim()
    .toLowerCase();

  if (
    emailNormalizado.length > 100 ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
      emailNormalizado
    )
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
        nome_usuario,
        email,
        status_conta
     FROM usuarios
     WHERE LOWER(email) = LOWER(?)
     LIMIT 1`,
    [emailNormalizado]
  );

  if (!usuarios.length) {
    return {
      sucesso: true,
      mensagem: MENSAGEM_RECUPERACAO_USUARIO,
    };
  }

  const usuario = usuarios[0];

  if (usuario.status_conta !== "ativo") {
    return {
      sucesso: true,
      mensagem: MENSAGEM_RECUPERACAO_USUARIO,
    };
  }

  try {
    await enviarEmailRecuperacaoUsuario({
      para: usuario.email,
      nome: usuario.nome_completo,
      nomeUsuario: usuario.nome_usuario,
    });
  } catch (erro) {
    console.error(
      "Erro ao enviar recuperação de usuário:",
      erro
    );

    throw new AppError(
      "Não foi possível processar a solicitação agora.",
      503
    );
  }

  return {
    sucesso: true,
    mensagem: MENSAGEM_RECUPERACAO_USUARIO,
  };
}

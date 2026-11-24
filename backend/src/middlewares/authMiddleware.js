
import jwt from "jsonwebtoken";

import { pool } from "../config/database.js";

function criarErro(codigo) {
  const erro = new Error(codigo);
  erro.codigoAutenticacao = codigo;

  return erro;
}

function validarId(valor) {
  const id = Number(valor);

  if (!Number.isSafeInteger(id) || id <= 0) {
    throw criarErro("TOKEN_INVALIDO");
  }

  return id;
}

async function validarToken(req) {
  const authorization = req.headers.authorization;

  if (!authorization) {
    return null;
  }

  const partes = authorization.trim().split(/\s+/);

  if (partes.length !== 2 || partes[0].toLowerCase() !== "bearer" || !partes[1]) {
    throw criarErro("TOKEN_INVALIDO");
  }

  if (!process.env.JWT_SECRET) {
    throw criarErro("CONFIGURACAO_JWT");
  }


  const decoded = jwt.verify(partes[1], process.env.JWT_SECRET, {algorithms: ["HS256"]});

  if (!decoded || typeof decoded !== "object") {
    throw criarErro("TOKEN_INVALIDO");
  }

  const usuarioId = validarId(decoded.id);

  if (decoded.tipo === "admin") {
    const [administradores] =
      await pool.execute(
        `SELECT
            id,
            nome,
            email
         FROM administrador
         WHERE id = ?
         LIMIT 1`,
        [usuarioId]
      );

    if (!administradores.length) {
      throw criarErro("ADMIN_NAO_ENCONTRADO");
    }

    const administrador = administradores[0];

    return {
      id: administrador.id,
      tipo: "admin",
      empresaId: null,
      nome: administrador.nome,
      email: administrador.email,
    };
  }

  const perfisPermitidos = ["proprietario", "administrador", "colaborador",];

  if (!perfisPermitidos.includes(decoded.tipo)) {
    throw criarErro("TOKEN_INVALIDO");
  }

  const empresaId = validarId(decoded.empresaId);

  const [usuarios] = await pool.execute(
    `SELECT
        id,
        nome_completo,
        nome_usuario,
        email,
        status_conta
     FROM usuarios
     WHERE id = ?
     LIMIT 1`,
    [usuarioId]
  );

  if (!usuarios.length) {
    throw criarErro("USUARIO_NAO_ENCONTRADO");
  }

  const usuario = usuarios[0];

  if (usuario.status_conta !== "ativo") {
    throw criarErro("USUARIO_INATIVO");
  }

  const [vinculos] = await pool.execute(
    `SELECT
        ue.usuario_id,
        ue.empresa_id,
        ue.perfil_acesso,
        ue.status_vinculo
     FROM usuario_empresa ue
     WHERE ue.usuario_id = ?
       AND ue.empresa_id = ?
     LIMIT 1`,
    [usuarioId, empresaId]
  );

  if (!vinculos.length) {
    throw criarErro("ACESSO_REVOGADO");
  }

  const vinculo = vinculos[0];

  if (vinculo.status_vinculo !== "ativo") {
    throw criarErro("VINCULO_INATIVO");
  }

  if (vinculo.perfil_acesso !== decoded.tipo) {
    throw criarErro("PERMISSAO_ALTERADA");
  }

  return {
    id: usuario.id,
    tipo: vinculo.perfil_acesso,
    empresaId: vinculo.empresa_id,
    nomeUsuario: usuario.nome_usuario,
    nomeCompleto: usuario.nome_completo,
    email: usuario.email,
    statusConta: usuario.status_conta,
    statusVinculo: vinculo.status_vinculo,
  };
}

function tratarErroAutenticacao(erro, res, next) {

  if (erro.codigoAutenticacao === "CONFIGURACAO_JWT") {
    console.error("JWT_SECRET não configurado.");

    return res.status(500).json({
      sucesso: false,
      mensagem: "Erro interno de autenticação.",
    });
  }

  if (erro.code || erro.message?.includes("ECONN")) {
    return next(erro);
  }

  if (erro.codigoAutenticacao === "USUARIO_INATIVO") {
    return res.status(403).json({
      sucesso: false,
      codigo: "USUARIO_INATIVO",
      mensagem: "Sua conta está inativa. Entre em contato com o responsável.",
    });
  }

  if (erro.codigoAutenticacao === "VINCULO_INATIVO") {
    return res.status(403).json({
      sucesso: false,
      codigo: "VINCULO_INATIVO",
      mensagem: "Seu acesso a esta empresa foi inativado. Entre em contato com o proprietário.",
    });
  }

  if (erro.codigoAutenticacao === "ACESSO_REVOGADO") {
    return res.status(403).json({
      sucesso: false,
      codigo: "ACESSO_REVOGADO",
      mensagem: "Seu vínculo com esta empresa não está mais disponível.",
    });
  }

  if (erro.codigoAutenticacao === "PERMISSAO_ALTERADA") {
    return res.status(403).json({
      sucesso: false,
      codigo: "PERMISSAO_ALTERADA",
      mensagem: "Suas permissões foram alteradas. Faça login novamente.",
    });
  }

  return res.status(401).json({
    sucesso: false,
    codigo: "SESSAO_INVALIDA",
    mensagem: "Sessão inválida ou expirada.",
  });
}

export async function autenticarUsuario(req, res, next) {
  try {
    const usuario = await validarToken(req);

    if (!usuario) {
      return res.status(401).json({
        sucesso: false,
        mensagem: "Autenticação necessária.",
      });
    }

    req.usuario = usuario;

    return next();
  } catch (erro) {
    return tratarErroAutenticacao(erro, res, next);
  }
}

export async function autenticarUsuarioOpcional(req, res, next) {
  try {
    const usuario = await validarToken(req);

    req.usuario = usuario;

    return next();
  } catch (erro) {
    return tratarErroAutenticacao(erro, res, next);
  }
}
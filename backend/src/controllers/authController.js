
import {realizarLogin, buscarPerfilUsuario, atualizarPerfilUsuario, alterarSenhaUsuario, recuperarNomeUsuario} from "../services/authService.js";
import { pool } from "../config/database.js";

export async function login(request, response, next) {
  try {
    const { identificador, nomeUsuario, senha } = request.body ?? {};

    const resultado = await realizarLogin({
      identificador: identificador || nomeUsuario,
      senha,
    });

    response.status(200).json({
      message: "Login realizado com sucesso.",
      ...resultado,
    });
  } catch (error) {
    next(error);
  }
}

export async function perfil(request, response, next) {
  try {
    const usuarioId = request.usuario.id;

    const empresaIdInformada = request.headers["x-empresa-id"];

    const empresaId = empresaIdInformada !== undefined ? Number(empresaIdInformada) : null;

    if (empresaId !== null && (!Number.isSafeInteger(empresaId) || empresaId <= 0)) {
      return response.status(400).json({
        sucesso: false,
        message: "ID da empresa inválido.",
      });
    }

    const usuario = await buscarPerfilUsuario(usuarioId, empresaId);

    return response.status(200).json({
      sucesso: true,
      message: "Perfil encontrado com sucesso.",
      usuario,
    });
  } catch (error) {
    next(error);
  }
}

export async function atualizarPerfil(request, response, next) {
  try {
    const usuarioId = request.usuario.id;
    const {nomeCompleto,email,telefone} = request.body ?? {};

    const usuario = await atualizarPerfilUsuario(usuarioId, {nomeCompleto, email, telefone});

    response.status(200).json({
      sucesso: true,
      message: "Perfil atualizado com sucesso.",
      usuario,
    });
  } catch (error) {
    next(error);
  }
}

export async function alterarSenha(request, response, next) {
  try {
    const usuarioId = request.usuario.id;
    const {senhaAtual,novaSenha} = request.body ?? {};

    const resultado = await alterarSenhaUsuario( usuarioId, {senhaAtual, novaSenha});

    response.status(200).json({
      sucesso: true,
      ...resultado,
    });
  } catch (error) {
    next(error);
  }
}

export async function esqueceuUsuario(req, res, next) {
  try {
    const { email } = req.body ?? {};
    const resultado = await recuperarNomeUsuario(email);

    return res.status(200).json({
      sucesso: true,
      ...resultado,
    });
  } catch (error) {
    next(error);
  }
}

export async function listarEmpresas(request, response, next) {
  try {
    const usuarioId = request.usuario.id;

    const [empresas] = await pool.execute(
      `SELECT
         e.id,
         e.razao_social,
         e.status,
         ue.perfil_acesso
       FROM usuario_empresa ue
       INNER JOIN empresas e
         ON e.id = ue.empresa_id
       WHERE ue.usuario_id = ?
       ORDER BY ue.vinculado_em ASC, e.id ASC`,
      [usuarioId]
    );

    return response.status(200).json({
      sucesso: true,
      empresas: empresas.map((empresa) => ({
        id: empresa.id,
        nome: empresa.nome_fantasia || empresa.razao_social,
        razao_social: empresa.razao_social,
        nome_fantasia: empresa.nome_fantasia,
        status: empresa.status,
        perfil_acesso: empresa.perfil_acesso,
      })),
    });
  } catch (error) {
    next(error);
  }
}
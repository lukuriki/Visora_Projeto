
import {
  realizarLogin,
  buscarPerfilUsuario,
  atualizarPerfilUsuario,
  alterarSenhaUsuario,
} from "../services/authService.js";

// ========================================
// LOGIN
// ========================================

export async function login(request, response, next) {
  try {
    const { nomeUsuario, senha } = request.body ?? {};

    const resultado = await realizarLogin({
      nomeUsuario,
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

// ========================================
// BUSCAR PERFIL
// ========================================

export async function perfil(request, response, next) {
  try {
    const usuario = await buscarPerfilUsuario(request.usuario.id);

    response.status(200).json({
      usuario,
    });
  } catch (error) {
    next(error);
  }
}

// ========================================
// ATUALIZAR PERFIL
// ========================================

export async function atualizarPerfil(request, response, next) {
  try {
    const usuario = await atualizarPerfilUsuario(
      request.usuario.id,
      request.body ?? {},
    );

    response.status(200).json({
      message: "Perfil atualizado com sucesso.",
      usuario,
    });
  } catch (error) {
    next(error);
  }
}

// ========================================
// ALTERAR SENHA
// ========================================

export async function alterarSenha(request, response, next) {
  try {
    const resultado = await alterarSenhaUsuario(
      request.usuario.id,
      request.body ?? {},
    );

    response.status(200).json(resultado);
  } catch (error) {
    next(error);
  }
}

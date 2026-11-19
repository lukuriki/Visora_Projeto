
import { realizarLogin, buscarPerfilUsuario, atualizarPerfilUsuario, alterarSenhaUsuario } from "../services/authService.js";

export async function login(request, response, next) {
  try {
    const {identificador, nomeUsuario, senha} = request.body ?? {};

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
    const usuario = await buscarPerfilUsuario(usuarioId);

    response.status(200).json({
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

    const usuario = await atualizarPerfilUsuario(
      usuarioId,
      {
        nomeCompleto,
        email,
        telefone,
      },
    );

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

    const resultado = await alterarSenhaUsuario(
      usuarioId,
      {
        senhaAtual,
        novaSenha,
      },
    );

    response.status(200).json({
      sucesso: true,
      ...resultado,
    });
  } catch (error) {
    next(error);
  }
}
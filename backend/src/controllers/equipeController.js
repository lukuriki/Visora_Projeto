import { listarEquipe, listarMembrosEquipe, convidarColaborador, consultarConvite, ativarConvite, cancelarConvite, removerColaborador } from "../services/equipeService.js";

export async function listarEquipeController(req, res, next) {
  try {
    const proprietarioId = req.usuario.id;

    const resultado = await listarEquipe(proprietarioId);

    return res.status(200).json({
      mensagem: "Equipe consultada com sucesso.",
      ...resultado,
    });
  } catch (erro) {
    next(erro);
  }
}

export async function listarMembrosEquipeController(req, res, next) {
  try {
    const usuarioId = req.usuario.id;

    const resultado = await listarMembrosEquipe(usuarioId);

    return res.status(200).json({
      mensagem: "Membros da equipe consultados com sucesso.",
      ...resultado,
    });
  } catch (erro) {
    next(erro);
  }
}

export async function convidarColaboradorController(req, res, next) {
  try {
    const proprietarioId = req.usuario.id;
    const { email } = req.body;

    const resultado = await convidarColaborador(
      proprietarioId,
      email
    );

    return res.status(201).json(resultado);
  } catch (erro) {
    next(erro);
  }
}

export async function consultarConviteController(req, res, next) {
  try {
    const { token } = req.params;
    const resultado = await consultarConvite(token);

    return res.status(200).json(resultado);
  } catch (erro) {
    next(erro);
  }
}

export async function ativarConviteController(req, res, next) {
  try {
    const { token, nomeCompleto } = req.body;
    const resultado = await ativarConvite(token, nomeCompleto);

    return res.status(200).json(resultado);
  } catch (erro) {
    next(erro);
  }
}

export async function cancelarConviteController(req, res, next) {
  try {
    const proprietarioId = req.usuario.id;
    const { id } = req.params;

    const resultado = await cancelarConvite(
      proprietarioId,
      id
    );

    return res.status(200).json(resultado);
  } catch (erro) {
    next(erro);
  }
}

export async function removerColaboradorController(req, res, next) {
  try {
    const proprietarioId = req.usuario.id;
    const { id } = req.params;

    const resultado = await removerColaborador(
      proprietarioId,
      id
    );

    return res.status(200).json(resultado);
  } catch (erro) {
    next(erro);
  }
}
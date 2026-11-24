
import { listarEquipe, listarMembrosEquipe, convidarColaborador, consultarConvite, ativarConvite, cancelarConvite, removerColaborador, alterarStatusColaborador } from "../services/equipeService.js";

export async function listarEquipeController(req, res, next) {
  try {
    const usuarioId = req.usuario.id;
    const empresaId = req.headers["x-empresa-id"] ?? null;

    const resultado = await listarEquipe(usuarioId, empresaId);

    return res.status(200).json({
      sucesso: true,
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
    const empresaId = req.headers["x-empresa-id"] ?? null;

    const resultado = await listarMembrosEquipe(usuarioId, empresaId);

    return res.status(200).json({
      sucesso: true,
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

    const resultado = await convidarColaborador(proprietarioId, email);

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

    const resultado = await cancelarConvite(proprietarioId, id);

    return res.status(200).json(resultado);
  } catch (erro) {
    next(erro);
  }
}

export async function alterarStatusColaboradorController(req, res, next) {
  try {
    const proprietarioId = req.usuario.id;
    const { id } = req.params;
    const { status } = req.body || {};
    const resultado = await alterarStatusColaborador(proprietarioId, id, status);

    return res.status(200).json(resultado);
  } catch (erro) {
    next(erro);
  }
}

export async function removerColaboradorController(req, res, next) {
  try {
    const proprietarioId = req.usuario.id;
    const { id } = req.params;
    const resultado = await removerColaborador(proprietarioId, id);

    return res.status(200).json(resultado);
  } catch (erro) {
    next(erro);
  }
}
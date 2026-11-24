
import { solicitarRecuperacaoSenha, redefinirSenha } from "../services/recuperacaoSenhaService.js";

export async function solicitarRecuperacao( req, res, next) {
  try {
    const { email } = req.body ?? {};
    const resultado = await solicitarRecuperacaoSenha(email);

    return res.status(200).json({
      sucesso: true,
      ...resultado,
    });
  } catch (error) {
    next(error);
  }
}

export async function redefinirSenhaController(req, res, next) {
  try {
    const { token } = req.body ?? {};

    const resultado = await redefinirSenha({token,});

    res.set("Cache-Control", "no-store");

    return res.status(200).json({
      sucesso: true,
      ...resultado,
    });
  } catch (error) {
    next(error);
  }
}
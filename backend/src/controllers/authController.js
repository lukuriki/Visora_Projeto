import { realizarLogin } from "../services/authService.js";

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
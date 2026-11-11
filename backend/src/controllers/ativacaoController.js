
import { ativarConta } from "../services/ativacaoService.js";

export async function ativar(request, response, next) {
  try {
    const { token } = request.body ?? {};

    const resultado = await ativarConta({ token });

    response.json({
      message: "Conta ativada com sucesso.",
      ...resultado,
    });
  } catch (error) {
    next(error);
  }
}

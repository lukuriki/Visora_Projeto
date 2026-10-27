import { ativarConta } from "../services/ativacaoService.js";

// POST /api/contas/ativar   body: { token, senha }
export async function ativar(request, response, next) {
  try {
    const { token, senha } = request.body ?? {};
    const resultado = await ativarConta({ token, senha });
    response.json({ message: "Conta ativada com sucesso.", ...resultado });
  } catch (error) {
    next(error);
  }
}
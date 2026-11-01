import { AppError } from "../utils/AppError.js";

export function errorHandler(error, request, response, next) {
  if (error instanceof AppError) {
    return response.status(error.status).json({
      message: error.message,
      erros: error.detalhes ?? undefined,
    });
  }

  console.error(error);
  response.status(500).json({ message: "Erro interno no servidor" });
}
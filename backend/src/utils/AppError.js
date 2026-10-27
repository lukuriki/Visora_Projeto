// Erro "esperado" (validação / regra de negócio). O errorHandler usa o status.
export class AppError extends Error {
  constructor(message, status = 400, detalhes = null) {
    super(message);
    this.status = status;
    this.detalhes = detalhes;
  }
}
 
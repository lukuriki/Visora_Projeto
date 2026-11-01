export class AppError extends Error {
  constructor(message, status = 400, detalhes = null) {
    super(message);
    this.name = "AppError";
    this.status = status;
    this.detalhes = detalhes;
  }
}


import { pool } from "../config/database.js";

// Listar todos os planos
export async function listarPlanos(request, response, next) {
  try {
    const [planos] = await pool.query(
      "SELECT * FROM planos ORDER BY id ASC"
    );

    response.json(planos);
  } catch (error) {
    next(error);
  }
}

// Buscar um plano pelo ID
export async function buscarPlanoPorId(request, response, next) {
  try {
    const { id } = request.params;

    const [planos] = await pool.execute(
      "SELECT * FROM planos WHERE id = ?",
      [id]
    );

    if (planos.length === 0) {
      return response.status(404).json({
        mensagem: "Plano não encontrado.",
      });
    }

    response.json(planos[0]);
  } catch (error) {
    next(error);
  }
}

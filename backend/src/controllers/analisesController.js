
import { AppError } from "../utils/AppError.js";

import {buscarAnalisesFinanceiras,} from "../services/analisesService.js";

function obterContexto(req) {
  const usuarioId = req.usuario?.id;
  const empresaId = req.empresaId;

  if (!usuarioId) {
    throw new AppError("Usuário não autenticado.", 401);
  }

  if (!empresaId) {
    throw new AppError("Empresa não identificada.", 400);
  }

  return {usuarioId, empresaId,};
}

export async function buscarAnalisesFinanceirasController(req, res, next) {
  try {
    const contexto = obterContexto(req);
    const periodo = typeof req.query.periodo === "string" ? req.query.periodo : "Últimos 6 meses";

    const analises = await buscarAnalisesFinanceiras({
      ...contexto,
      periodo,
    });

    return res.status(200).json({
      sucesso: true,
      mensagem:"Análises financeiras consultadas com sucesso.",
      analises,
    });
  } catch (erro) {
    next(erro);
  }
}
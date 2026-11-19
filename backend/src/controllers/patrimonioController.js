
import { listarPatrimonios, buscarPatrimonioPorId, criarPatrimonio, atualizarPatrimonio, excluirPatrimonio, buscarResumoPatrimonio } from "../services/patrimonioService.js";
import { AppError } from "../utils/AppError.js";

function obterContexto(req) {
  const usuarioId = req.usuario?.id;
  const empresaId = req.empresaId;

  if (!usuarioId) {
    throw new AppError(
      "Usuário não autenticado.",
      401
    );
  }

  if (!empresaId) {
    throw new AppError(
      "Nenhuma empresa foi selecionada.",
      400
    );
  }

  return {usuarioId, empresaId};
}

export async function listarPatrimoniosController( req, res, next ) {
  try {
    const contexto = obterContexto(req);
    const patrimonios = await listarPatrimonios({
      ...contexto,
      tipo: req.query.tipo,
    });

    return res.status(200).json({
      sucesso: true,
      total: patrimonios.length,
      patrimonios,
    });
  } catch (erro) {
    next(erro);
  }
}

export async function buscarPatrimonioController(req, res, next) {
  try {
    const contexto = obterContexto(req);
    const patrimonio = await buscarPatrimonioPorId({
      ...contexto,
      patrimonioId: req.params.id,
    });

    return res.status(200).json({
      sucesso: true,
      patrimonio,
    });
  } catch (erro) {
    next(erro);
  }
}

export async function criarPatrimonioController(req, res, next) {
  try {
    const contexto = obterContexto(req);
    const patrimonio = await criarPatrimonio({
      ...contexto,
      dados: req.body,
    });

    return res.status(201).json({
      sucesso: true,
      mensagem: "Patrimônio cadastrado com sucesso.",
      patrimonio,
    });
  } catch (erro) {
    next(erro);
  }
}

export async function atualizarPatrimonioController(req, res, next) {
  try {
    const contexto = obterContexto(req);
    const patrimonio = await atualizarPatrimonio({
      ...contexto,
      patrimonioId: req.params.id,
      dados: req.body,
    });

    return res.status(200).json({
      sucesso: true,
      mensagem: "Patrimônio atualizado com sucesso.",
      patrimonio,
    });
  } catch (erro) {
    next(erro);
  }
}

export async function excluirPatrimonioController(req, res, next) {
  try {
    const contexto = obterContexto(req);
    const resultado = await excluirPatrimonio({
      ...contexto,
      patrimonioId: req.params.id,
    });

    return res.status(200).json({
      sucesso: true,
      mensagem: resultado.mensagem,
    });
  } catch (erro) {
    next(erro);
  }
}

export async function buscarResumoPatrimonioController(req, res, next) {
  try {
    const contexto = obterContexto(req);
    const resumo = await buscarResumoPatrimonio(contexto);

    return res.status(200).json({
      sucesso: true,
      resumo,
    });
  } catch (erro) {
    next(erro);
  }
}
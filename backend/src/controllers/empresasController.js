import { consultarLimiteEmpresas, cadastrarEmpresaAdicional } from "../services/empresasService.js";


export async function consultarLimiteEmpresasController(req, res, next) {
  try {
    const resultado = await consultarLimiteEmpresas(req.usuario.id);

    return res.status(200).json({
      sucesso: true,
      ...resultado,
    });
  } catch (erro) {
    next(erro);
  }
}

export async function cadastrarEmpresaController(req, res, next) {
  try {
    const resultado = await cadastrarEmpresaAdicional(req.usuario.id, req.body ?? {});

    return res.status(201).json({
      sucesso: true,
      mensagem: "Empresa cadastrada com sucesso.",
      ...resultado,
    });
  } catch (erro) {
    next(erro);
  }
}
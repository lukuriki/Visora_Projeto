
import { pool } from "../config/database.js";
import { AppError } from "../utils/AppError.js";

function validarEmpresaId(valor) {
  const id = Number(valor);

  if (!Number.isSafeInteger(id) || id <= 0) {
    throw new AppError("Empresa selecionada inválida.", 400);
  }

  return id;
}

export async function identificarEmpresa(req, res, next) {
  try {
    const usuarioId = req.usuario?.id;

    if (!usuarioId) {
      throw new AppError("Usuário não autenticado.", 401);
    }

    const empresaInformada = req.get("X-Empresa-Id");

    const [vinculos] = await pool.execute(
      `SELECT
         ue.empresa_id,
         ue.perfil_acesso,
         e.razao_social,
         e.status
       FROM usuario_empresa ue
       INNER JOIN empresas e
         ON e.id = ue.empresa_id
       WHERE ue.usuario_id = ?
       ORDER BY ue.vinculado_em ASC, ue.empresa_id ASC`,
      [usuarioId]
    );

    if (!vinculos.length) {
      throw new AppError("O usuário não está vinculado a nenhuma empresa.", 403);
    }

    let empresa;

    if (empresaInformada !== undefined && empresaInformada !== null && empresaInformada !== "") {
      const empresaId = validarEmpresaId(empresaInformada);

      empresa = vinculos.find((vinculo) => Number(vinculo.empresa_id) === empresaId);

      if (!empresa) {
        throw new AppError("Você não possui acesso à empresa selecionada.", 403);
      }
    } else {
      if (vinculos.length > 1) {
        throw new AppError("Selecione uma empresa para continuar.", 409);
      }
      empresa = vinculos[0];
    }

    if (empresa.status !== "ativa") {
      throw new AppError("A empresa selecionada não está ativa.", 403);
    }

    req.empresaId = Number(empresa.empresa_id);
    req.perfilAcessoEmpresa = empresa.perfil_acesso;

    req.empresa = {
      id: Number(empresa.empresa_id),
      razao_social: empresa.razao_social,
      perfil_acesso: empresa.perfil_acesso,
      status: empresa.status,
    };

    next();
  } catch (erro) {
    next(erro);
  }
}

export default identificarEmpresa;
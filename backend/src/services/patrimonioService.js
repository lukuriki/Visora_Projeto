
import { pool } from "../config/database.js";
import { AppError } from "../utils/AppError.js";



const TIPOS_PATRIMONIO = ["ativo", "patrimonio"];




function validarId(valor, campo = "ID") {
  const id = Number(valor);

  if (!Number.isSafeInteger(id) || id <= 0) {
    throw new AppError(`${campo} inválido.`, 400);
  }

  return id;
}

function validarValor(valor) {
  if (
    valor === undefined ||
    valor === null ||
    String(valor).trim() === ""
  ) {
    throw new AppError("Informe o valor do patrimônio.", 400);
  }

  const numero = Number(valor);

  if (!Number.isFinite(numero) || numero < 0) {
    throw new AppError(
      "O valor do patrimônio deve ser maior ou igual a zero.",
      400
    );
  }

  return Math.round((numero + Number.EPSILON) * 100) / 100;
}

function validarData(data) {
  if (
    typeof data !== "string" ||
    !/^\d{4}-\d{2}-\d{2}$/.test(data)
  ) {
    throw new AppError(
      "Informe a data no formato AAAA-MM-DD.",
      400
    );
  }

  const [ano, mes, dia] = data.split("-").map(Number);
  const verificacao = new Date(Date.UTC(ano, mes - 1, dia));

  if (
    verificacao.getUTCFullYear() !== ano ||
    verificacao.getUTCMonth() + 1 !== mes ||
    verificacao.getUTCDate() !== dia
  ) {
    throw new AppError("Data de registro inválida.", 400);
  }

  return data;
}

function validarDadosPatrimonio(dados) {
  if (!dados || typeof dados !== "object") {
    throw new AppError("Dados do patrimônio não informados.", 400);
  }

  const tipo = String(dados.tipo || "").trim().toLowerCase();
  const descricao = String(dados.descricao || "").trim();

  if (!TIPOS_PATRIMONIO.includes(tipo)) {
    throw new AppError(
      "O tipo deve ser 'ativo' ou 'patrimonio'.",
      400
    );
  }

  if (!descricao) {
    throw new AppError("Informe a descrição do patrimônio.", 400);
  }

  if (descricao.length > 255) {
    throw new AppError(
      "A descrição deve ter no máximo 255 caracteres.",
      400
    );
  }

  return {
    tipo,
    descricao,
    valor: validarValor(dados.valor),
    data_registro: validarData(dados.data_registro),
  };
}



async function verificarAcessoEmpresa(
  usuarioId,
  empresaId,
  exigirEdicao = false
) {
  const usuario = validarId(usuarioId, "Usuário");
  const empresa = validarId(empresaId, "Empresa");

  const [vinculos] = await pool.execute(
    `SELECT perfil_acesso
     FROM usuario_empresa
     WHERE usuario_id = ?
       AND empresa_id = ?
     LIMIT 1`,
    [usuario, empresa]
  );

  if (!vinculos.length) {
    throw new AppError(
      "Você não possui acesso a esta empresa.",
      403
    );
  }

  if (
    exigirEdicao &&
    !["proprietario", "administrador"].includes(
      vinculos[0].perfil_acesso
    )
  ) {
    throw new AppError(
      "Você não possui permissão para alterar o patrimônio.",
      403
    );
  }

  return vinculos[0].perfil_acesso;
}



async function buscarRegistro(empresaId, patrimonioId) {
  const [registros] = await pool.execute(
    `SELECT
        id,
        empresa_id,
        tipo,
        descricao,
        valor,
        data_registro,
        criado_em
     FROM patrimonio_investimentos
     WHERE id = ?
       AND empresa_id = ?
       AND tipo IN ('ativo', 'patrimonio')
     LIMIT 1`,
    [patrimonioId, empresaId]
  );

  if (!registros.length) {
    throw new AppError(
      "Registro patrimonial não encontrado.",
      404
    );
  }

  return registros[0];
}


export async function listarPatrimonios({
  usuarioId,
  empresaId,
  tipo,
}) {
  await verificarAcessoEmpresa(usuarioId, empresaId);

  const parametros = [Number(empresaId)];

  let filtroTipo = "";

  if (tipo !== undefined && tipo !== null && tipo !== "") {
    if (!TIPOS_PATRIMONIO.includes(tipo)) {
      throw new AppError("Filtro de tipo inválido.", 400);
    }

    filtroTipo = "AND tipo = ?";
    parametros.push(tipo);
  }

  const [registros] = await pool.execute(
    `SELECT
        id,
        empresa_id,
        tipo,
        descricao,
        valor,
        data_registro,
        criado_em
     FROM patrimonio_investimentos
     WHERE empresa_id = ?
       AND tipo IN ('ativo', 'patrimonio')
       ${filtroTipo}
     ORDER BY data_registro DESC, id DESC`,
    parametros
  );

  return registros;
}


export async function buscarPatrimonioPorId({
  usuarioId,
  empresaId,
  patrimonioId,
}) {
  await verificarAcessoEmpresa(usuarioId, empresaId);

  const id = validarId(patrimonioId, "Patrimônio");

  return buscarRegistro(Number(empresaId), id);
}


export async function criarPatrimonio({
  usuarioId,
  empresaId,
  dados,
}) {
  await verificarAcessoEmpresa(usuarioId, empresaId, true);

  const empresa = validarId(empresaId, "Empresa");
  const registro = validarDadosPatrimonio(dados);

  const [resultado] = await pool.execute(
    `INSERT INTO patrimonio_investimentos (
        empresa_id,
        tipo,
        descricao,
        valor,
        data_registro
     )
     VALUES (?, ?, ?, ?, ?)`,
    [
      empresa,
      registro.tipo,
      registro.descricao,
      registro.valor,
      registro.data_registro,
    ]
  );

  return buscarRegistro(empresa, resultado.insertId);
}


export async function atualizarPatrimonio({
  usuarioId,
  empresaId,
  patrimonioId,
  dados,
}) {
  await verificarAcessoEmpresa(usuarioId, empresaId, true);

  const empresa = validarId(empresaId, "Empresa");
  const id = validarId(patrimonioId, "Patrimônio");

  await buscarRegistro(empresa, id);

  const registro = validarDadosPatrimonio(dados);

  await pool.execute(
    `UPDATE patrimonio_investimentos
     SET
       tipo = ?,
       descricao = ?,
       valor = ?,
       data_registro = ?
     WHERE id = ?
       AND empresa_id = ?
       AND tipo IN ('ativo', 'patrimonio')`,
    [
      registro.tipo,
      registro.descricao,
      registro.valor,
      registro.data_registro,
      id,
      empresa,
    ]
  );

  return buscarRegistro(empresa, id);
}


export async function excluirPatrimonio({
  usuarioId,
  empresaId,
  patrimonioId,
}) {
  await verificarAcessoEmpresa(usuarioId, empresaId, true);

  const empresa = validarId(empresaId, "Empresa");
  const id = validarId(patrimonioId, "Patrimônio");

  const [resultado] = await pool.execute(
    `DELETE FROM patrimonio_investimentos
     WHERE id = ?
       AND empresa_id = ?
       AND tipo IN ('ativo', 'patrimonio')`,
    [id, empresa]
  );

  if (resultado.affectedRows === 0) {
    throw new AppError(
      "Registro patrimonial não encontrado.",
      404
    );
  }

  return {
    mensagem: "Registro patrimonial excluído com sucesso.",
  };
}



export async function buscarResumoPatrimonio({
  usuarioId,
  empresaId,
}) {
  await verificarAcessoEmpresa(usuarioId, empresaId);

  const [resultados] = await pool.execute(
    `SELECT
        COUNT(*) AS total_registros,

        COALESCE(SUM(
          CASE
            WHEN tipo = 'ativo' THEN valor
            ELSE 0
          END
        ), 0) AS total_ativos,

        COALESCE(SUM(
          CASE
            WHEN tipo = 'patrimonio' THEN valor
            ELSE 0
          END
        ), 0) AS total_patrimonio

     FROM patrimonio_investimentos

     WHERE empresa_id = ?
       AND tipo IN ('ativo', 'patrimonio')`,
    [validarId(empresaId, "Empresa")]
  );

  const resultado = resultados[0];

  const totalAtivos = Number(resultado.total_ativos || 0);
  const totalPatrimonio = Number(resultado.total_patrimonio || 0);

  return {
    total_registros: Number(resultado.total_registros || 0),
    total_ativos: totalAtivos,
    total_patrimonio: totalPatrimonio,
    valor_total: totalAtivos + totalPatrimonio,
  };
}

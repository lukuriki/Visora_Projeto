
import { pool } from "../config/database.js";
import { AppError } from "../utils/AppError.js";

// ==========================================
// FUNÇÕES AUXILIARES
// ==========================================

function validarId(valor, nome = "ID") {
  const id = Number(valor);

  if (!Number.isSafeInteger(id) || id <= 0) {
    throw new AppError(`${nome} inválido.`, 400);
  }

  return id;
}

// ==========================================
// VALIDAR DADOS DO INVESTIMENTO
// ==========================================

function validarDados(dados) {
  const descricao = String(dados?.descricao ?? "").trim();

  const valor = Number(dados?.valor);

  const taxaInformada =
    dados?.taxa_juros !== null &&
    dados?.taxa_juros !== undefined &&
    dados?.taxa_juros !== "";

  const taxaJuros = taxaInformada
    ? Number(dados.taxa_juros)
    : null;

  const dataRegistro = String(
    dados?.data_registro ?? ""
  ).trim();

  // DESCRIÇÃO
  if (!descricao) {
    throw new AppError(
      "Informe a descrição do investimento.",
      400
    );
  }

  if (descricao.length > 255) {
    throw new AppError(
      "A descrição deve ter no máximo 255 caracteres.",
      400
    );
  }

  // VALOR
  if (
    dados?.valor === "" ||
    dados?.valor === null ||
    dados?.valor === undefined ||
    !Number.isFinite(valor) ||
    valor <= 0 ||
    valor > 9999999999999.99
  ) {
    throw new AppError(
      "Informe um valor investido válido e maior que zero.",
      400
    );
  }

  // TAXA DE JUROS
  if (
    taxaJuros !== null &&
    (
      !Number.isFinite(taxaJuros) ||
      taxaJuros < 0 ||
      taxaJuros > 999.99
    )
  ) {
    throw new AppError(
      "Informe uma taxa de juros válida.",
      400
    );
  }

  // DATA DE REGISTRO
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dataRegistro)) {
    throw new AppError(
      "Informe a data no formato AAAA-MM-DD.",
      400
    );
  }

  const data = new Date(`${dataRegistro}T12:00:00Z`);

  if (
    Number.isNaN(data.getTime()) ||
    data.toISOString().slice(0, 10) !== dataRegistro
  ) {
    throw new AppError(
      "A data informada não é válida.",
      400
    );
  }

  return {
    descricao,
    valor,
    taxa_juros: taxaJuros,
    data_registro: dataRegistro,
  };
}

// ==========================================
// VERIFICAR ACESSO À EMPRESA
// ==========================================

async function verificarAcesso(
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

  const perfil = String(
    vinculos[0].perfil_acesso || ""
  ).toLowerCase();

  if (
    exigirEdicao &&
    !["proprietario", "administrador"].includes(perfil)
  ) {
    throw new AppError(
      "Você não possui permissão para alterar investimentos.",
      403
    );
  }

  return empresa;
}

// ==========================================
// LISTAR INVESTIMENTOS
// ==========================================

export async function listarInvestimentos({
  usuarioId,
  empresaId,
}) {
  const empresa = await verificarAcesso(
    usuarioId,
    empresaId
  );

  const [registros] = await pool.execute(
    `SELECT
       id,
       empresa_id,
       tipo,
       descricao,
       valor,
       taxa_juros,
       data_registro,
       criado_em
     FROM patrimonio_investimentos
     WHERE empresa_id = ?
       AND tipo = 'investimento'
     ORDER BY data_registro DESC, id DESC`,
    [empresa]
  );

  return registros;
}

// ==========================================
// BUSCAR INVESTIMENTO POR ID
// ==========================================

export async function buscarInvestimentoPorId({
  usuarioId,
  empresaId,
  investimentoId,
}) {
  const empresa = await verificarAcesso(
    usuarioId,
    empresaId
  );

  const id = validarId(investimentoId, "Investimento");

  const [registros] = await pool.execute(
    `SELECT
       id,
       empresa_id,
       tipo,
       descricao,
       valor,
       taxa_juros,
       data_registro,
       criado_em
     FROM patrimonio_investimentos
     WHERE id = ?
       AND empresa_id = ?
       AND tipo = 'investimento'
     LIMIT 1`,
    [id, empresa]
  );

  if (!registros.length) {
    throw new AppError(
      "Investimento não encontrado.",
      404
    );
  }

  return registros[0];
}

// ==========================================
// CADASTRAR INVESTIMENTO
// ==========================================

export async function criarInvestimento({
  usuarioId,
  empresaId,
  dados,
}) {
  const empresa = await verificarAcesso(
    usuarioId,
    empresaId,
    true
  );

  const valores = validarDados(dados);

  const [resultado] = await pool.execute(
    `INSERT INTO patrimonio_investimentos
       (
         empresa_id,
         tipo,
         descricao,
         valor,
         taxa_juros,
         data_registro
       )
     VALUES (?, 'investimento', ?, ?, ?, ?)`,
    [
      empresa,
      valores.descricao,
      valores.valor,
      valores.taxa_juros,
      valores.data_registro,
    ]
  );

  return buscarInvestimentoPorId({
    usuarioId,
    empresaId: empresa,
    investimentoId: resultado.insertId,
  });
}

// ==========================================
// ATUALIZAR INVESTIMENTO
// ==========================================

export async function atualizarInvestimento({
  usuarioId,
  empresaId,
  investimentoId,
  dados,
}) {
  const empresa = await verificarAcesso(
    usuarioId,
    empresaId,
    true
  );

  const id = validarId(investimentoId, "Investimento");

  await buscarInvestimentoPorId({
    usuarioId,
    empresaId: empresa,
    investimentoId: id,
  });

  const valores = validarDados(dados);

  await pool.execute(
    `UPDATE patrimonio_investimentos
     SET
       descricao = ?,
       valor = ?,
       taxa_juros = ?,
       data_registro = ?
     WHERE id = ?
       AND empresa_id = ?
       AND tipo = 'investimento'`,
    [
      valores.descricao,
      valores.valor,
      valores.taxa_juros,
      valores.data_registro,
      id,
      empresa,
    ]
  );

  return buscarInvestimentoPorId({
    usuarioId,
    empresaId: empresa,
    investimentoId: id,
  });
}

// ==========================================
// EXCLUIR INVESTIMENTO
// ==========================================

export async function excluirInvestimento({
  usuarioId,
  empresaId,
  investimentoId,
}) {
  const empresa = await verificarAcesso(
    usuarioId,
    empresaId,
    true
  );

  const id = validarId(investimentoId, "Investimento");

  const [resultado] = await pool.execute(
    `DELETE FROM patrimonio_investimentos
     WHERE id = ?
       AND empresa_id = ?
       AND tipo = 'investimento'`,
    [id, empresa]
  );

  if (!resultado.affectedRows) {
    throw new AppError(
      "Investimento não encontrado.",
      404
    );
  }

  return {
    mensagem: "Investimento excluído com sucesso.",
  };
}

// ==========================================
// RESUMO DOS INVESTIMENTOS
// ==========================================

export async function buscarResumoInvestimentos({
  usuarioId,
  empresaId,
}) {
  const empresa = await verificarAcesso(
    usuarioId,
    empresaId
  );

  const [registros] = await pool.execute(
    `SELECT
       COUNT(*) AS total_investimentos,
       COALESCE(SUM(valor), 0) AS total_investido,
       COALESCE(AVG(taxa_juros), 0) AS taxa_media_juros,
       COUNT(taxa_juros) AS investimentos_com_taxa,
       COALESCE(MAX(valor), 0) AS maior_investimento,
       COALESCE(MIN(valor), 0) AS menor_investimento
     FROM patrimonio_investimentos
     WHERE empresa_id = ?
       AND tipo = 'investimento'`,
    [empresa]
  );

  const resumo = registros[0];

  return {
    total_investimentos: Number(
      resumo.total_investimentos || 0
    ),
    total_investido: Number(
      resumo.total_investido || 0
    ),
    taxa_media_juros: Number(
      resumo.taxa_media_juros || 0
    ),
    investimentos_com_taxa: Number(
      resumo.investimentos_com_taxa || 0
    ),
    maior_investimento: Number(
      resumo.maior_investimento || 0
    ),
    menor_investimento: Number(
      resumo.menor_investimento || 0
    ),
  };
}

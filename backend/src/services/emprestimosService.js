
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

  if (!descricao) {
    throw new AppError(
      "Informe a descrição do empréstimo.",
      400
    );
  }

  if (descricao.length > 255) {
    throw new AppError(
      "A descrição deve ter no máximo 255 caracteres.",
      400
    );
  }

  if (!Number.isFinite(valor) || valor <= 0 || valor > 9999999999999.99) {
    throw new AppError(
      "Informe um valor contratado válido e maior que zero.",
      400
    );
  }

  if (
    taxaJuros !== null &&
    (!Number.isFinite(taxaJuros) ||
      taxaJuros < 0 ||
      taxaJuros > 999.99)
  ) {
    throw new AppError(
      "Informe uma taxa de juros válida.",
      400
    );
  }

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
      "Você não possui permissão para alterar empréstimos.",
      403
    );
  }

  return empresa;
}

// ==========================================
// LISTAR EMPRÉSTIMOS E FINANCIAMENTOS
// ==========================================

export async function listarEmprestimos({
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
       AND tipo = 'emprestimo'
     ORDER BY data_registro DESC, id DESC`,
    [empresa]
  );

  return registros;
}

// ==========================================
// BUSCAR EMPRÉSTIMO POR ID
// ==========================================

export async function buscarEmprestimoPorId({
  usuarioId,
  empresaId,
  emprestimoId,
}) {
  const empresa = await verificarAcesso(
    usuarioId,
    empresaId
  );

  const id = validarId(emprestimoId, "Empréstimo");

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
       AND tipo = 'emprestimo'
     LIMIT 1`,
    [id, empresa]
  );

  if (!registros.length) {
    throw new AppError(
      "Empréstimo não encontrado.",
      404
    );
  }

  return registros[0];
}

// ==========================================
// CADASTRAR EMPRÉSTIMO
// ==========================================

export async function criarEmprestimo({
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
     VALUES (?, 'emprestimo', ?, ?, ?, ?)`,
    [
      empresa,
      valores.descricao,
      valores.valor,
      valores.taxa_juros,
      valores.data_registro,
    ]
  );

  return buscarEmprestimoPorId({
    usuarioId,
    empresaId: empresa,
    emprestimoId: resultado.insertId,
  });
}

// ==========================================
// ATUALIZAR EMPRÉSTIMO
// ==========================================

export async function atualizarEmprestimo({
  usuarioId,
  empresaId,
  emprestimoId,
  dados,
}) {
  const empresa = await verificarAcesso(
    usuarioId,
    empresaId,
    true
  );

  const id = validarId(emprestimoId, "Empréstimo");

  await buscarEmprestimoPorId({
    usuarioId,
    empresaId: empresa,
    emprestimoId: id,
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
       AND tipo = 'emprestimo'`,
    [
      valores.descricao,
      valores.valor,
      valores.taxa_juros,
      valores.data_registro,
      id,
      empresa,
    ]
  );

  return buscarEmprestimoPorId({
    usuarioId,
    empresaId: empresa,
    emprestimoId: id,
  });
}

// ==========================================
// EXCLUIR EMPRÉSTIMO
// ==========================================

export async function excluirEmprestimo({
  usuarioId,
  empresaId,
  emprestimoId,
}) {
  const empresa = await verificarAcesso(
    usuarioId,
    empresaId,
    true
  );

  const id = validarId(emprestimoId, "Empréstimo");

  const [resultado] = await pool.execute(
    `DELETE FROM patrimonio_investimentos
     WHERE id = ?
       AND empresa_id = ?
       AND tipo = 'emprestimo'`,
    [id, empresa]
  );

  if (!resultado.affectedRows) {
    throw new AppError(
      "Empréstimo não encontrado.",
      404
    );
  }

  return {
    mensagem: "Empréstimo excluído com sucesso.",
  };
}

// ==========================================
// RESUMO DE EMPRÉSTIMOS
// ==========================================

export async function buscarResumoEmprestimos({
  usuarioId,
  empresaId,
}) {
  const empresa = await verificarAcesso(
    usuarioId,
    empresaId
  );

  const [registros] = await pool.execute(
    `SELECT
       COUNT(*) AS total_contratos,
       COALESCE(SUM(valor), 0) AS total_contratado,
       COALESCE(AVG(taxa_juros), 0) AS taxa_media_juros,
       COUNT(taxa_juros) AS contratos_com_taxa
     FROM patrimonio_investimentos
     WHERE empresa_id = ?
       AND tipo = 'emprestimo'`,
    [empresa]
  );

  const resumo = registros[0];

  return {
    total_contratos: Number(
      resumo.total_contratos || 0
    ),
    total_contratado: Number(
      resumo.total_contratado || 0
    ),
    taxa_media_juros: Number(
      resumo.taxa_media_juros || 0
    ),
    contratos_com_taxa: Number(
      resumo.contratos_com_taxa || 0
    ),
  };
}

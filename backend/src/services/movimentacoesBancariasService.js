
import { pool } from "../config/database.js";
import { AppError } from "../utils/AppError.js";

// ==========================================
// CONFIGURAÇÕES
// ==========================================

const TIPOS_CONTA = [
  "corrente",
  "poupanca",
  "caixa",
  "investimento",
];

const TIPOS_MOVIMENTACAO = [
  "entrada",
  "saida",
];

// ==========================================
// VALIDAÇÕES
// ==========================================

function validarId(valor, campo = "ID") {
  const id = Number(valor);

  if (!Number.isSafeInteger(id) || id <= 0) {
    throw new AppError(`${campo} inválido.`, 400);
  }

  return id;
}

function validarValor(valor, campo = "Valor") {
  if (
    valor === null ||
    valor === undefined ||
    valor === ""
  ) {
    throw new AppError(`${campo} é obrigatório.`, 400);
  }

  const numero = Number(valor);

  if (!Number.isFinite(numero) || numero < 0) {
    throw new AppError(`${campo} inválido.`, 400);
  }

  if (Math.round(numero * 100) / 100 !== numero) {
    throw new AppError(
      `${campo} deve ter no máximo duas casas decimais.`,
      400
    );
  }

  if (numero > 9999999999999.99) {
    throw new AppError(`${campo} excede o limite permitido.`, 400);
  }

  return numero;
}

function validarTexto(valor, campo, maximo = 255) {
  const texto = String(valor ?? "").trim();

  if (!texto) {
    throw new AppError(`${campo} é obrigatório.`, 400);
  }

  if (texto.length > maximo) {
    throw new AppError(
      `${campo} deve ter no máximo ${maximo} caracteres.`,
      400
    );
  }

  return texto;
}

function textoOpcional(valor, maximo = 255) {
  if (valor === null || valor === undefined || valor === "") {
    return null;
  }

  const texto = String(valor).trim();

  if (!texto) return null;

  if (texto.length > maximo) {
    throw new AppError(
      `O texto deve ter no máximo ${maximo} caracteres.`,
      400
    );
  }

  return texto;
}

function validarData(valor) {
  if (
    typeof valor !== "string" ||
    !/^\d{4}-\d{2}-\d{2}$/.test(valor)
  ) {
    throw new AppError(
      "Informe uma data no formato AAAA-MM-DD.",
      400
    );
  }

  const data = new Date(`${valor}T12:00:00Z`);

  if (
    Number.isNaN(data.getTime()) ||
    data.toISOString().slice(0, 10) !== valor
  ) {
    throw new AppError("Data inválida.", 400);
  }

  return valor;
}

function validarTipoConta(tipo) {
  if (!TIPOS_CONTA.includes(tipo)) {
    throw new AppError(
      "Tipo de conta inválido.",
      400
    );
  }

  return tipo;
}

function validarTipoMovimentacao(tipo) {
  if (!TIPOS_MOVIMENTACAO.includes(tipo)) {
    throw new AppError(
      "Tipo de movimentação inválido.",
      400
    );
  }

  return tipo;
}

// ==========================================
// IDENTIFICAR EMPRESA DO USUÁRIO
// ==========================================

async function obterEmpresaUsuario(
  usuarioId,
  conexao = pool
) {
  const id = validarId(usuarioId, "Usuário");

  const [usuarios] = await conexao.execute(
    `SELECT
       u.id AS usuario_id,
       ue.empresa_id,
       ue.perfil_acesso
     FROM usuarios u
     INNER JOIN usuario_empresa ue
       ON ue.usuario_id = u.id
     INNER JOIN empresas e
       ON e.id = ue.empresa_id
     WHERE u.id = ?
       AND u.status_conta = 'ativo'
       AND e.status = 'ativa'
     ORDER BY
       CASE ue.perfil_acesso
         WHEN 'proprietario' THEN 1
         WHEN 'administrador' THEN 2
         ELSE 3
       END
     LIMIT 1`,
    [id]
  );

  if (!usuarios.length) {
    throw new AppError(
      "Usuário sem vínculo com uma empresa ativa.",
      403
    );
  }

  return {
    empresaId: usuarios[0].empresa_id,
    perfilAcesso: usuarios[0].perfil_acesso,
  };
}

// ==========================================
// CONSULTAR CONTA BANCÁRIA
// ==========================================

async function obterContaBancaria(
  empresaId,
  contaId,
  conexao = pool
) {
  const id = validarId(contaId, "Conta bancária");

  const [contas] = await conexao.execute(
    `SELECT
       id,
       empresa_id,
       nome_banco,
       tipo_conta,
       saldo_inicial,
       criado_em
     FROM contas_bancarias
     WHERE id = ?
       AND empresa_id = ?
     LIMIT 1`,
    [id, empresaId]
  );

  if (!contas.length) {
    throw new AppError(
      "Conta bancária não encontrada.",
      404
    );
  }

  return contas[0];
}

// ==========================================
// CONSULTAR MOVIMENTAÇÃO BANCÁRIA
// ==========================================

async function obterMovimentacaoBancaria(
  empresaId,
  movimentacaoId,
  conexao = pool
) {
  const id = validarId(
    movimentacaoId,
    "Movimentação bancária"
  );

  const [movimentacoes] = await conexao.execute(
    `SELECT
       mb.id,
       mb.empresa_id,
       mb.conta_bancaria_id,
       cb.nome_banco,
       mb.tipo,
       mb.descricao,
       mb.valor,
       DATE_FORMAT(
         mb.data_movimentacao,
         '%Y-%m-%d'
       ) AS data_movimentacao,
       mb.categoria,
       mb.observacoes,
       mb.movimentacao_financeira_id,
       mb.criado_em,
       mb.atualizado_em
     FROM movimentacoes_bancarias mb
     INNER JOIN contas_bancarias cb
       ON cb.id = mb.conta_bancaria_id
       AND cb.empresa_id = mb.empresa_id
     WHERE mb.id = ?
       AND mb.empresa_id = ?
     LIMIT 1`,
    [id, empresaId]
  );

  if (!movimentacoes.length) {
    throw new AppError(
      "Movimentação bancária não encontrada.",
      404
    );
  }

  return movimentacoes[0];
}

// ==========================================
// VALIDAR MOVIMENTAÇÃO FINANCEIRA VINCULADA
// ==========================================

async function validarMovimentacaoFinanceira(
  empresaId,
  movimentacaoFinanceiraId,
  conexao = pool
) {
  if (
    movimentacaoFinanceiraId === null ||
    movimentacaoFinanceiraId === undefined ||
    movimentacaoFinanceiraId === ""
  ) {
    return null;
  }

  const id = validarId(
    movimentacaoFinanceiraId,
    "Movimentação financeira"
  );

  const [movimentacoes] = await conexao.execute(
    `SELECT
       id,
       status,
       conta_bancaria_id
     FROM movimentacoes
     WHERE id = ?
       AND empresa_id = ?
     LIMIT 1`,
    [id, empresaId]
  );

  if (!movimentacoes.length) {
    throw new AppError(
      "Movimentação financeira não encontrada nesta empresa.",
      404
    );
  }

  if (movimentacoes[0].status !== "pago") {
    throw new AppError(
      "Somente movimentações financeiras pagas ou recebidas podem ser vinculadas ao extrato.",
      400
    );
  }

  return id;
}

// ==========================================
// CALCULAR SALDO DE UMA CONTA
// ==========================================

async function calcularSaldoConta(
  empresaId,
  contaId,
  conexao = pool
) {
  const conta = await obterContaBancaria(
    empresaId,
    contaId,
    conexao
  );

  const [resultado] = await conexao.execute(
    `SELECT
       COALESCE(
         SUM(
           CASE
             WHEN tipo = 'entrada' THEN valor
             WHEN tipo = 'saida' THEN -valor
             ELSE 0
           END
         ),
         0
       ) AS movimentacao_liquida
     FROM movimentacoes_bancarias
     WHERE empresa_id = ?
       AND conta_bancaria_id = ?`,
    [empresaId, conta.id]
  );

  const saldo =
    Number(conta.saldo_inicial) +
    Number(resultado[0].movimentacao_liquida);

  return Number(saldo.toFixed(2));
}

// ==========================================
// LISTAR CONTAS BANCÁRIAS
// ==========================================

export async function listarContasBancarias(usuarioId) {
  const { empresaId } = await obterEmpresaUsuario(usuarioId);

  const [contas] = await pool.execute(
    `SELECT
       cb.id,
       cb.empresa_id,
       cb.nome_banco,
       cb.tipo_conta,
       cb.saldo_inicial,
       cb.criado_em,

       COALESCE(
         SUM(
           CASE
             WHEN mb.tipo = 'entrada' THEN mb.valor
             WHEN mb.tipo = 'saida' THEN -mb.valor
             ELSE 0
           END
         ),
         0
       ) AS movimentacao_liquida

     FROM contas_bancarias cb

     LEFT JOIN movimentacoes_bancarias mb
       ON mb.conta_bancaria_id = cb.id
       AND mb.empresa_id = cb.empresa_id

     WHERE cb.empresa_id = ?

     GROUP BY
       cb.id,
       cb.empresa_id,
       cb.nome_banco,
       cb.tipo_conta,
       cb.saldo_inicial,
       cb.criado_em

     ORDER BY cb.nome_banco ASC`,
    [empresaId]
  );

  return contas.map((conta) => ({
    ...conta,
    saldo_inicial: Number(conta.saldo_inicial),
    movimentacao_liquida: Number(conta.movimentacao_liquida),
    saldo_atual: Number(
      (
        Number(conta.saldo_inicial) +
        Number(conta.movimentacao_liquida)
      ).toFixed(2)
    ),
  }));
}

// ==========================================
// BUSCAR CONTA BANCÁRIA POR ID
// ==========================================

export async function buscarContaBancariaPorId(
  usuarioId,
  contaId
) {
  const { empresaId } = await obterEmpresaUsuario(usuarioId);

  const conta = await obterContaBancaria(
    empresaId,
    contaId
  );

  const saldo = await calcularSaldoConta(
    empresaId,
    conta.id
  );

  return {
    ...conta,
    saldo_inicial: Number(conta.saldo_inicial),
    saldo_atual: saldo,
  };
}

// ==========================================
// CADASTRAR CONTA BANCÁRIA
// ==========================================

export async function criarContaBancaria(
  usuarioId,
  dados
) {
  const { empresaId } = await obterEmpresaUsuario(usuarioId);

  const nomeBanco = validarTexto(
    dados?.nome_banco,
    "Nome do banco"
  );

  const tipoConta = validarTipoConta(
    dados?.tipo_conta
  );

  const saldoInicial = validarValor(
    dados?.saldo_inicial ?? 0,
    "Saldo inicial"
  );

  const [resultado] = await pool.execute(
    `INSERT INTO contas_bancarias (
       empresa_id,
       nome_banco,
       tipo_conta,
       saldo_inicial
     )
     VALUES (?, ?, ?, ?)`,
    [
      empresaId,
      nomeBanco,
      tipoConta,
      saldoInicial,
    ]
  );

  return buscarContaBancariaPorId(
    usuarioId,
    resultado.insertId
  );
}

// ==========================================
// ATUALIZAR CONTA BANCÁRIA
// ==========================================

export async function atualizarContaBancaria(
  usuarioId,
  contaId,
  dados
) {
  const { empresaId } = await obterEmpresaUsuario(usuarioId);

  const anterior = await obterContaBancaria(
    empresaId,
    contaId
  );

  const nomeBanco = validarTexto(
    dados?.nome_banco ?? anterior.nome_banco,
    "Nome do banco"
  );

  const tipoConta = validarTipoConta(
    dados?.tipo_conta ?? anterior.tipo_conta
  );

  const saldoInicial = validarValor(
    dados?.saldo_inicial ?? anterior.saldo_inicial,
    "Saldo inicial"
  );

  await pool.execute(
    `UPDATE contas_bancarias
     SET
       nome_banco = ?,
       tipo_conta = ?,
       saldo_inicial = ?
     WHERE id = ?
       AND empresa_id = ?`,
    [
      nomeBanco,
      tipoConta,
      saldoInicial,
      anterior.id,
      empresaId,
    ]
  );

  return buscarContaBancariaPorId(
    usuarioId,
    anterior.id
  );
}

// ==========================================
// EXCLUIR CONTA BANCÁRIA
// ==========================================

export async function excluirContaBancaria(
  usuarioId,
  contaId
) {
  const { empresaId } = await obterEmpresaUsuario(usuarioId);

  const conta = await obterContaBancaria(
    empresaId,
    contaId
  );

  const [vinculos] = await pool.execute(
    `SELECT
       (
         SELECT COUNT(*)
         FROM movimentacoes_bancarias
         WHERE empresa_id = ?
           AND conta_bancaria_id = ?
       ) AS total_bancarias,

       (
         SELECT COUNT(*)
         FROM movimentacoes
         WHERE empresa_id = ?
           AND conta_bancaria_id = ?
       ) AS total_financeiras`,
    [
      empresaId,
      conta.id,
      empresaId,
      conta.id,
    ]
  );

  if (
    Number(vinculos[0].total_bancarias) > 0 ||
    Number(vinculos[0].total_financeiras) > 0
  ) {
    throw new AppError(
      "Não é possível excluir uma conta que possui movimentações vinculadas.",
      409
    );
  }

  await pool.execute(
    `DELETE FROM contas_bancarias
     WHERE id = ?
       AND empresa_id = ?`,
    [conta.id, empresaId]
  );

  return {
    id: conta.id,
    mensagem: "Conta bancária excluída com sucesso.",
  };
}

// ==========================================
// LISTAR MOVIMENTAÇÕES BANCÁRIAS
// ==========================================

export async function listarMovimentacoesBancarias(
  usuarioId,
  filtros = {}
) {
  const { empresaId } = await obterEmpresaUsuario(usuarioId);

  const condicoes = ["mb.empresa_id = ?"];
  const parametros = [empresaId];

  if (filtros.conta_bancaria_id) {
    const contaId = validarId(
      filtros.conta_bancaria_id,
      "Conta bancária"
    );

    await obterContaBancaria(empresaId, contaId);

    condicoes.push("mb.conta_bancaria_id = ?");
    parametros.push(contaId);
  }

  if (filtros.tipo) {
    validarTipoMovimentacao(filtros.tipo);

    condicoes.push("mb.tipo = ?");
    parametros.push(filtros.tipo);
  }

  if (filtros.data_inicio) {
    condicoes.push("mb.data_movimentacao >= ?");
    parametros.push(validarData(filtros.data_inicio));
  }

  if (filtros.data_fim) {
    condicoes.push("mb.data_movimentacao <= ?");
    parametros.push(validarData(filtros.data_fim));
  }

  const [movimentacoes] = await pool.execute(
    `SELECT
       mb.id,
       mb.empresa_id,
       mb.conta_bancaria_id,
       cb.nome_banco,
       cb.tipo_conta,
       mb.tipo,
       mb.descricao,
       mb.valor,
       DATE_FORMAT(
         mb.data_movimentacao,
         '%Y-%m-%d'
       ) AS data_movimentacao,
       mb.categoria,
       mb.observacoes,
       mb.movimentacao_financeira_id,
       mb.criado_em,
       mb.atualizado_em

     FROM movimentacoes_bancarias mb

     INNER JOIN contas_bancarias cb
       ON cb.id = mb.conta_bancaria_id
       AND cb.empresa_id = mb.empresa_id

     WHERE ${condicoes.join(" AND ")}

     ORDER BY
       mb.data_movimentacao DESC,
       mb.id DESC`,
    parametros
  );

  return movimentacoes.map((item) => ({
    ...item,
    valor: Number(item.valor),
  }));
}

// ==========================================
// BUSCAR MOVIMENTAÇÃO BANCÁRIA POR ID
// ==========================================

export async function buscarMovimentacaoBancariaPorId(
  usuarioId,
  movimentacaoId
) {
  const { empresaId } = await obterEmpresaUsuario(usuarioId);

  const movimentacao = await obterMovimentacaoBancaria(
    empresaId,
    movimentacaoId
  );

  return {
    ...movimentacao,
    valor: Number(movimentacao.valor),
  };
}

// ==========================================
// CADASTRAR MOVIMENTAÇÃO BANCÁRIA
// ==========================================

export async function criarMovimentacaoBancaria(
  usuarioId,
  dados
) {
  const { empresaId } = await obterEmpresaUsuario(usuarioId);

  const contaId = validarId(
    dados?.conta_bancaria_id,
    "Conta bancária"
  );

  await obterContaBancaria(empresaId, contaId);

  const tipo = validarTipoMovimentacao(
    dados?.tipo
  );

  const descricao = validarTexto(
    dados?.descricao,
    "Descrição"
  );

  const valor = validarValor(
    dados?.valor,
    "Valor"
  );

  if (valor <= 0) {
    throw new AppError(
      "O valor da movimentação deve ser maior que zero.",
      400
    );
  }

  const data = validarData(
    dados?.data_movimentacao
  );

  const categoria = textoOpcional(
    dados?.categoria,
    100
  );

  const observacoes = textoOpcional(
    dados?.observacoes,
    10000
  );

  const movimentacaoFinanceiraId =
    await validarMovimentacaoFinanceira(
      empresaId,
      dados?.movimentacao_financeira_id
    );

  // Impede que uma movimentação financeira
  // seja vinculada a mais de um lançamento bancário.
  if (movimentacaoFinanceiraId !== null) {
    const [existentes] = await pool.execute(
      `SELECT id
       FROM movimentacoes_bancarias
       WHERE empresa_id = ?
         AND movimentacao_financeira_id = ?
       LIMIT 1`,
      [empresaId, movimentacaoFinanceiraId]
    );

    if (existentes.length) {
      throw new AppError(
        "Esta movimentação financeira já possui um lançamento bancário.",
        409
      );
    }
  }

  const [resultado] = await pool.execute(
    `INSERT INTO movimentacoes_bancarias (
       empresa_id,
       conta_bancaria_id,
       tipo,
       descricao,
       valor,
       data_movimentacao,
       categoria,
       observacoes,
       movimentacao_financeira_id
     )
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      empresaId,
      contaId,
      tipo,
      descricao,
      valor,
      data,
      categoria,
      observacoes,
      movimentacaoFinanceiraId,
    ]
  );

  return buscarMovimentacaoBancariaPorId(
    usuarioId,
    resultado.insertId
  );
}

// ==========================================
// ATUALIZAR MOVIMENTAÇÃO BANCÁRIA
// ==========================================

export async function atualizarMovimentacaoBancaria(
  usuarioId,
  movimentacaoId,
  dados
) {
  const { empresaId } = await obterEmpresaUsuario(usuarioId);

  const anterior = await obterMovimentacaoBancaria(
    empresaId,
    movimentacaoId
  );

  const contaId = validarId(
    dados?.conta_bancaria_id ??
      anterior.conta_bancaria_id,
    "Conta bancária"
  );

  await obterContaBancaria(empresaId, contaId);

  const tipo = validarTipoMovimentacao(
    dados?.tipo ?? anterior.tipo
  );

  const descricao = validarTexto(
    dados?.descricao ?? anterior.descricao,
    "Descrição"
  );

  const valor = validarValor(
    dados?.valor ?? anterior.valor,
    "Valor"
  );

  if (valor <= 0) {
    throw new AppError(
      "O valor da movimentação deve ser maior que zero.",
      400
    );
  }

  const data = validarData(
    dados?.data_movimentacao ??
      anterior.data_movimentacao
  );

  const categoria = textoOpcional(
    dados?.categoria !== undefined
      ? dados.categoria
      : anterior.categoria,
    100
  );

  const observacoes = textoOpcional(
    dados?.observacoes !== undefined
      ? dados.observacoes
      : anterior.observacoes,
    10000
  );

  const movimentacaoFinanceiraId =
    await validarMovimentacaoFinanceira(
      empresaId,
      dados?.movimentacao_financeira_id !== undefined
        ? dados.movimentacao_financeira_id
        : anterior.movimentacao_financeira_id
    );

  if (movimentacaoFinanceiraId !== null) {
    const [existentes] = await pool.execute(
      `SELECT id
       FROM movimentacoes_bancarias
       WHERE empresa_id = ?
         AND movimentacao_financeira_id = ?
         AND id <> ?
       LIMIT 1`,
      [
        empresaId,
        movimentacaoFinanceiraId,
        anterior.id,
      ]
    );

    if (existentes.length) {
      throw new AppError(
        "Esta movimentação financeira já está vinculada a outro lançamento bancário.",
        409
      );
    }
  }

  await pool.execute(
    `UPDATE movimentacoes_bancarias
     SET
       conta_bancaria_id = ?,
       tipo = ?,
       descricao = ?,
       valor = ?,
       data_movimentacao = ?,
       categoria = ?,
       observacoes = ?,
       movimentacao_financeira_id = ?
     WHERE id = ?
       AND empresa_id = ?`,
    [
      contaId,
      tipo,
      descricao,
      valor,
      data,
      categoria,
      observacoes,
      movimentacaoFinanceiraId,
      anterior.id,
      empresaId,
    ]
  );

  return buscarMovimentacaoBancariaPorId(
    usuarioId,
    anterior.id
  );
}

// ==========================================
// EXCLUIR MOVIMENTAÇÃO BANCÁRIA
// ==========================================

export async function excluirMovimentacaoBancaria(
  usuarioId,
  movimentacaoId
) {
  const { empresaId } = await obterEmpresaUsuario(usuarioId);

  const movimentacao = await obterMovimentacaoBancaria(
    empresaId,
    movimentacaoId
  );

  await pool.execute(
    `DELETE FROM movimentacoes_bancarias
     WHERE id = ?
       AND empresa_id = ?`,
    [movimentacao.id, empresaId]
  );

  return {
    id: movimentacao.id,
    mensagem: "Movimentação bancária excluída com sucesso.",
  };
}

// ==========================================
// CONSULTAR SALDOS BANCÁRIOS
// ==========================================

export async function buscarSaldosBancarios(usuarioId) {
  const contas = await listarContasBancarias(usuarioId);

  const saldoTotal = contas.reduce(
    (total, conta) => total + conta.saldo_atual,
    0
  );

  const totalEntradas = contas.reduce(
    (total, conta) =>
      total + Math.max(conta.movimentacao_liquida, 0),
    0
  );

  return {
    quantidade_contas: contas.length,
    saldo_total: Number(saldoTotal.toFixed(2)),
    contas,
  };
}

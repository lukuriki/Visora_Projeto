
import { pool } from "../config/database.js";
import { AppError } from "../utils/AppError.js";

// ==========================================
// CONSTANTES
// ==========================================

const TIPOS = ["receita", "despesa", "custo", "imposto"];
const STATUS = ["pendente", "pago", "cancelado"];
const NATUREZAS = ["fixo", "variavel"];

const CAMPOS_EMPRESA = {
  razao_social: 255,
  email_empresa: 100,
  telefone_empresa: 20,
};

const ENUMS_EMPRESA = {
  setor_atuacao: [
    "Comércio", "Serviços", "Indústria",
    "Tecnologia", "Varejo", "Saúde", "Outros",
  ],
  porte_empresa: [
    "Autônomo", "MEI", "ME", "EPP", "Média", "Grande",
  ],
  regime_tributario: [
    "Pessoa Física", "Simples Nacional",
    "Lucro Presumido", "Lucro Real",
  ],
  perfil_risco: [
    "Conservador", "Moderado", "Arrojado",
  ],
};

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

function validarValor(valor) {
  if (
    valor === null ||
    valor === undefined ||
    String(valor).trim() === ""
  ) {
    throw new AppError("Informe o valor.", 400);
  }

  const numero = Number(valor);

  if (!Number.isFinite(numero) || numero <= 0) {
    throw new AppError("O valor deve ser maior que zero.", 400);
  }

  if (Math.abs(numero * 100 - Math.round(numero * 100)) > 0.000001) {
    throw new AppError(
      "Informe um valor com até duas casas decimais.",
      400
    );
  }

  if (numero > 9999999999999.99) {
    throw new AppError("Valor acima do limite permitido.", 400);
  }

  return numero.toFixed(2);
}

function validarData(valor, campo) {
  if (
    typeof valor !== "string" ||
    !/^\d{4}-\d{2}-\d{2}$/.test(valor)
  ) {
    throw new AppError(
      `${campo} deve estar no formato AAAA-MM-DD.`,
      400
    );
  }

  const [ano, mes, dia] = valor.split("-").map(Number);

  const data = new Date(Date.UTC(ano, mes - 1, dia));

  if (
    data.getUTCFullYear() !== ano ||
    data.getUTCMonth() !== mes - 1 ||
    data.getUTCDate() !== dia
  ) {
    throw new AppError(`${campo} inválida.`, 400);
  }

  return valor;
}

function normalizarMovimentacao(registro) {
  return {
    ...registro,
    valor: Number(registro.valor),
  };
}

function validarObjeto(dados) {
  if (
    !dados ||
    typeof dados !== "object" ||
    Array.isArray(dados)
  ) {
    throw new AppError("Dados inválidos.", 400);
  }
}

// ==========================================
// IDENTIFICAR EMPRESA DO USUÁRIO
// ==========================================

async function obterEmpresaUsuario(
  conexao,
  usuarioId
) {
  const id = validarId(usuarioId, "Usuário");

  const [vinculos] = await conexao.execute(
    `SELECT
       e.id,
       e.status,
       ue.perfil_acesso
     FROM usuario_empresa ue
     INNER JOIN empresas e
       ON e.id = ue.empresa_id
     INNER JOIN usuarios u
       ON u.id = ue.usuario_id
     WHERE ue.usuario_id = ?
       AND u.status_conta = 'ativo'
       AND e.status = 'ativa'
       AND ue.perfil_acesso IN (
         'proprietario',
         'administrador',
         'colaborador'
       )
     ORDER BY ue.vinculado_em ASC
     LIMIT 1`,
    [id]
  );

  if (!vinculos.length) {
    throw new AppError(
      "Você não possui acesso a uma empresa ativa.",
      403
    );
  }

  return vinculos[0];
}

// ==========================================
// CONSULTAR EMPRESA
// ==========================================

export async function consultarEmpresaContabil(usuarioId) {
  const vinculo = await obterEmpresaUsuario(pool, usuarioId);

  const [empresas] = await pool.execute(
    `SELECT
       id,
       razao_social,
       email_empresa,
       telefone_empresa,
       tipo_documento,
       documento_identificacao,
       setor_atuacao,
       porte_empresa,
       regime_tributario,
       perfil_risco,
       capital_inicial,
       status,
       criado_em,
       atualizado_em
     FROM empresas
     WHERE id = ?
     LIMIT 1`,
    [vinculo.id]
  );

  if (!empresas.length) {
    throw new AppError("Empresa não encontrada.", 404);
  }

  return {
    empresa: empresas[0],
    perfil_acesso: vinculo.perfil_acesso,
    pode_editar: vinculo.perfil_acesso === "proprietario",
  };
}

// ==========================================
// ATUALIZAR EMPRESA
// ==========================================

export async function atualizarEmpresaContabil(
  usuarioId,
  dados
) {
  validarObjeto(dados);

  const conexao = await pool.getConnection();
  let transacaoIniciada = false;

  try {
    const vinculo = await obterEmpresaUsuario(
      conexao,
      usuarioId
    );

    if (vinculo.perfil_acesso !== "proprietario") {
      throw new AppError(
        "Somente o proprietário pode editar a empresa.",
        403
      );
    }

    const atualizacoes = [];
    const valores = [];

    for (const [campo, limite] of Object.entries(CAMPOS_EMPRESA)) {
      if (dados[campo] === undefined) continue;

      if (
        dados[campo] !== null &&
        typeof dados[campo] !== "string"
      ) {
        throw new AppError(
          `Valor inválido para ${campo}.`,
          400
        );
      }

      const valor = dados[campo]?.trim() || null;

      if (campo === "razao_social" && !valor) {
        throw new AppError(
          "A razão social é obrigatória.",
          400
        );
      }

      if (valor && valor.length > limite) {
        throw new AppError(
          `O campo ${campo} excede o limite permitido.`,
          400
        );
      }

      if (
        campo === "email_empresa" &&
        valor &&
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(valor)
      ) {
        throw new AppError("Informe um e-mail válido.", 400);
      }

      atualizacoes.push(`${campo} = ?`);
      valores.push(valor);
    }

    for (const [campo, opcoes] of Object.entries(ENUMS_EMPRESA)) {
      if (dados[campo] === undefined) continue;

      if (!opcoes.includes(dados[campo])) {
        throw new AppError(
          `Valor inválido para ${campo}.`,
          400
        );
      }

      atualizacoes.push(`${campo} = ?`);
      valores.push(dados[campo]);
    }

    if (dados.capital_inicial !== undefined) {
      const valor = String(dados.capital_inicial);

      if (!/^\d{1,13}(\.\d{1,2})?$/.test(valor)) {
        throw new AppError(
          "Informe um capital inicial válido.",
          400
        );
      }

      atualizacoes.push("capital_inicial = ?");
      valores.push(valor);
    }

    if (!atualizacoes.length) {
      throw new AppError(
        "Nenhuma informação válida foi enviada.",
        400
      );
    }

    await conexao.beginTransaction();
    transacaoIniciada = true;

    await conexao.execute(
      `UPDATE empresas
       SET ${atualizacoes.join(", ")}
       WHERE id = ?`,
      [...valores, vinculo.id]
    );

    await conexao.execute(
      `INSERT INTO logs_sistema (
         empresa_id,
         usuario_id,
         acao,
         entidade,
         entidade_id,
         descricao
       )
       VALUES (?, ?, 'alteracao', 'empresas', ?, ?)`,
      [
        vinculo.id,
        usuarioId,
        vinculo.id,
        "Atualizou as informações cadastrais da empresa.",
      ]
    );

    await conexao.commit();
    transacaoIniciada = false;

  } catch (erro) {
    if (transacaoIniciada) {
      await conexao.rollback();
    }

    throw erro;
  } finally {
    conexao.release();
  }

  return consultarEmpresaContabil(usuarioId);
}

// ==========================================
// LISTAR CATEGORIAS
// ==========================================

export async function listarCategoriasContabeis(usuarioId) {
  const vinculo = await obterEmpresaUsuario(pool, usuarioId);

  const [categorias] = await pool.execute(
    `SELECT
       id,
       empresa_id,
       nome,
       tipo,
       natureza
     FROM categorias
     WHERE empresa_id = ?
     ORDER BY tipo ASC, nome ASC`,
    [vinculo.id]
  );

  return categorias;
}

// ==========================================
// CRIAR CATEGORIA
// ==========================================

export async function criarCategoriaContabil(
  usuarioId,
  dados = {}
) {
  validarObjeto(dados);

  const vinculo = await obterEmpresaUsuario(pool, usuarioId);

  const nome = String(dados.nome ?? "").trim();
  const tipo = dados.tipo;
  const natureza = dados.natureza ?? "variavel";

  if (!nome || nome.length > 100) {
    throw new AppError(
      "Informe uma categoria de até 100 caracteres.",
      400
    );
  }

  if (!TIPOS.includes(tipo)) {
    throw new AppError("Tipo de categoria inválido.", 400);
  }

  if (!NATUREZAS.includes(natureza)) {
    throw new AppError("Natureza inválida.", 400);
  }

  const [existentes] = await pool.execute(
    `SELECT id
     FROM categorias
     WHERE empresa_id = ?
       AND nome = ?
       AND tipo = ?
     LIMIT 1`,
    [vinculo.id, nome, tipo]
  );

  if (existentes.length) {
    throw new AppError(
      "Essa categoria já está cadastrada.",
      409
    );
  }

  const [resultado] = await pool.execute(
    `INSERT INTO categorias (
       empresa_id,
       nome,
       tipo,
       natureza
     )
     VALUES (?, ?, ?, ?)`,
    [vinculo.id, nome, tipo, natureza]
  );

  return {
    id: resultado.insertId,
    empresa_id: vinculo.id,
    nome,
    tipo,
    natureza,
  };
}

// ==========================================
// VALIDAR CATEGORIA
// ==========================================

async function buscarCategoriaDaEmpresa(
  conexao,
  empresaId,
  categoriaId
) {
  const id = validarId(categoriaId, "Categoria");

  const [categorias] = await conexao.execute(
    `SELECT id, nome, tipo, natureza
     FROM categorias
     WHERE id = ?
       AND empresa_id = ?
     LIMIT 1`,
    [id, empresaId]
  );

  if (!categorias.length) {
    throw new AppError(
      "Categoria não encontrada nesta empresa.",
      404
    );
  }

  return categorias[0];
}

// ==========================================
// VALIDAR CONTA BANCÁRIA
// ==========================================

async function validarContaBancaria(
  conexao,
  empresaId,
  contaId
) {
  if (
    contaId === null ||
    contaId === undefined ||
    contaId === ""
  ) {
    return null;
  }

  const id = validarId(contaId, "Conta bancária");

  const [contas] = await conexao.execute(
    `SELECT id
     FROM contas_bancarias
     WHERE id = ?
       AND empresa_id = ?
     LIMIT 1`,
    [id, empresaId]
  );

  if (!contas.length) {
    throw new AppError(
      "Conta bancária não encontrada nesta empresa.",
      404
    );
  }

  return id;
}

// ==========================================
// VALIDAR CLIENTE OU FORNECEDOR
// ==========================================

async function validarClienteFornecedor(
  conexao,
  empresaId,
  pessoaId
) {
  if (
    pessoaId === null ||
    pessoaId === undefined ||
    pessoaId === ""
  ) {
    return null;
  }

  const id = validarId(pessoaId, "Cliente ou fornecedor");

  const [pessoas] = await conexao.execute(
    `SELECT id
     FROM clientes_fornecedores
     WHERE id = ?
       AND empresa_id = ?
     LIMIT 1`,
    [id, empresaId]
  );

  if (!pessoas.length) {
    throw new AppError(
      "Cliente ou fornecedor não encontrado nesta empresa.",
      404
    );
  }

  return id;
}

// ==========================================
// PREPARAR MOVIMENTAÇÃO
// ==========================================

async function prepararMovimentacao(
  conexao,
  empresaId,
  dados
) {
  validarObjeto(dados);

  const descricao = String(dados.descricao ?? "").trim();

  if (!descricao || descricao.length > 255) {
    throw new AppError(
      "Informe uma descrição de até 255 caracteres.",
      400
    );
  }

  const categoria = await buscarCategoriaDaEmpresa(
    conexao,
    empresaId,
    dados.categoria_id
  );

  const valor = validarValor(dados.valor);
  const status = dados.status ?? "pendente";

  if (!STATUS.includes(status)) {
    throw new AppError(
      "Status da movimentação inválido.",
      400
    );
  }

  const dataVencimento = validarData(
    dados.data_vencimento,
    "Data de vencimento"
  );

  let dataPagamento = null;

  if (status === "pago") {
    if (!dados.data_pagamento) {
      throw new AppError(
        "Informe a data do pagamento ou recebimento.",
        400
      );
    }

    dataPagamento = validarData(
      dados.data_pagamento,
      "Data de pagamento"
    );
  }

  const contaBancariaId = await validarContaBancaria(
    conexao,
    empresaId,
    dados.conta_bancaria_id
  );

  const clienteFornecedorId = await validarClienteFornecedor(
    conexao,
    empresaId,
    dados.cliente_fornecedor_id
  );

  return {
    categoria_id: categoria.id,
    descricao,
    valor,
    data_vencimento: dataVencimento,
    data_pagamento: dataPagamento,
    status,
    conta_bancaria_id: contaBancariaId,
    cliente_fornecedor_id: clienteFornecedorId,
  };
}

// ==========================================
// LISTAR MOVIMENTAÇÕES
// ==========================================

export async function listarMovimentacoesContabeis(
  usuarioId,
  filtros = {}
) {
  const vinculo = await obterEmpresaUsuario(pool, usuarioId);

  const condicoes = ["m.empresa_id = ?"];
  const parametros = [vinculo.id];

  if (filtros.tipo) {
    if (!TIPOS.includes(filtros.tipo)) {
      throw new AppError("Filtro de tipo inválido.", 400);
    }

    condicoes.push("c.tipo = ?");
    parametros.push(filtros.tipo);
  }

  if (filtros.status) {
    if (!STATUS.includes(filtros.status)) {
      throw new AppError("Filtro de status inválido.", 400);
    }

    condicoes.push("m.status = ?");
    parametros.push(filtros.status);
  }

  const [registros] = await pool.execute(
    `SELECT
       m.id,
       m.empresa_id,
       m.categoria_id,
       c.nome AS categoria_nome,
       c.tipo,
       c.natureza,
       m.conta_bancaria_id,
       cb.nome_banco,
       m.cliente_fornecedor_id,
       cf.nome_razao AS cliente_fornecedor_nome,
       m.descricao,
       m.valor,
       DATE_FORMAT(m.data_vencimento, '%Y-%m-%d')
         AS data_vencimento,
       DATE_FORMAT(m.data_pagamento, '%Y-%m-%d')
         AS data_pagamento,
       m.status,
       m.criado_em,
       m.atualizado_em
     FROM movimentacoes m
     INNER JOIN categorias c
       ON c.id = m.categoria_id
       AND c.empresa_id = m.empresa_id
     LEFT JOIN contas_bancarias cb
       ON cb.id = m.conta_bancaria_id
       AND cb.empresa_id = m.empresa_id
     LEFT JOIN clientes_fornecedores cf
       ON cf.id = m.cliente_fornecedor_id
       AND cf.empresa_id = m.empresa_id
     WHERE ${condicoes.join(" AND ")}
     ORDER BY m.data_vencimento DESC, m.id DESC`,
    parametros
  );

  return registros.map(normalizarMovimentacao);
}

// ==========================================
// BUSCAR MOVIMENTAÇÃO POR ID
// ==========================================

export async function buscarMovimentacaoContabilPorId(
  usuarioId,
  movimentacaoId
) {
  const vinculo = await obterEmpresaUsuario(pool, usuarioId);
  const id = validarId(movimentacaoId, "Movimentação");

  const [registros] = await pool.execute(
    `SELECT
       m.id,
       m.empresa_id,
       m.categoria_id,
       c.nome AS categoria_nome,
       c.tipo,
       c.natureza,
       m.conta_bancaria_id,
       m.cliente_fornecedor_id,
       m.descricao,
       m.valor,
       DATE_FORMAT(m.data_vencimento, '%Y-%m-%d')
         AS data_vencimento,
       DATE_FORMAT(m.data_pagamento, '%Y-%m-%d')
         AS data_pagamento,
       m.status,
       m.criado_em,
       m.atualizado_em
     FROM movimentacoes m
     INNER JOIN categorias c
       ON c.id = m.categoria_id
       AND c.empresa_id = m.empresa_id
     WHERE m.id = ?
       AND m.empresa_id = ?
     LIMIT 1`,
    [id, vinculo.id]
  );

  if (!registros.length) {
    throw new AppError(
      "Movimentação não encontrada.",
      404
    );
  }

  return normalizarMovimentacao(registros[0]);
}

// ==========================================
// CRIAR MOVIMENTAÇÃO
// ==========================================

export async function criarMovimentacaoContabil(
  usuarioId,
  dados = {}
) {
  const conexao = await pool.getConnection();
  let transacaoIniciada = false;
  let novoId;

  try {
    const vinculo = await obterEmpresaUsuario(
      conexao,
      usuarioId
    );

    await conexao.beginTransaction();
    transacaoIniciada = true;

    const movimento = await prepararMovimentacao(
      conexao,
      vinculo.id,
      dados
    );

    const [resultado] = await conexao.execute(
      `INSERT INTO movimentacoes (
         empresa_id,
         categoria_id,
         conta_bancaria_id,
         cliente_fornecedor_id,
         descricao,
         valor,
         data_vencimento,
         data_pagamento,
         status
       )
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        vinculo.id,
        movimento.categoria_id,
        movimento.conta_bancaria_id,
        movimento.cliente_fornecedor_id,
        movimento.descricao,
        movimento.valor,
        movimento.data_vencimento,
        movimento.data_pagamento,
        movimento.status,
      ]
    );

    novoId = resultado.insertId;

    await conexao.commit();
    transacaoIniciada = false;

  } catch (erro) {
    if (transacaoIniciada) {
      await conexao.rollback();
    }

    throw erro;
  } finally {
    conexao.release();
  }

  return buscarMovimentacaoContabilPorId(
    usuarioId,
    novoId
  );
}

// ==========================================
// ATUALIZAR MOVIMENTAÇÃO
// ==========================================

export async function atualizarMovimentacaoContabil(
  usuarioId,
  movimentacaoId,
  dados = {}
) {
  validarObjeto(dados);

  const conexao = await pool.getConnection();
  let transacaoIniciada = false;

  const id = validarId(
    movimentacaoId,
    "Movimentação"
  );

  try {
    const vinculo = await obterEmpresaUsuario(
      conexao,
      usuarioId
    );

    const camposPermitidos = [
      "categoria_id",
      "conta_bancaria_id",
      "cliente_fornecedor_id",
      "descricao",
      "valor",
      "data_vencimento",
      "data_pagamento",
      "status",
    ];

    const alteracoes = Object.fromEntries(
      Object.entries(dados).filter(
        ([campo]) => camposPermitidos.includes(campo)
      )
    );

    if (!Object.keys(alteracoes).length) {
      throw new AppError(
        "Nenhuma informação válida para atualizar.",
        400
      );
    }

    await conexao.beginTransaction();
    transacaoIniciada = true;

    const [existentes] = await conexao.execute(
      `SELECT
         categoria_id,
         conta_bancaria_id,
         cliente_fornecedor_id,
         descricao,
         valor,
         DATE_FORMAT(data_vencimento, '%Y-%m-%d')
           AS data_vencimento,
         DATE_FORMAT(data_pagamento, '%Y-%m-%d')
           AS data_pagamento,
         status
       FROM movimentacoes
       WHERE id = ?
         AND empresa_id = ?
       LIMIT 1
       FOR UPDATE`,
      [id, vinculo.id]
    );

    if (!existentes.length) {
      throw new AppError(
        "Movimentação não encontrada.",
        404
      );
    }

    const anterior = existentes[0];

    const mesclados = {
      ...anterior,
      ...alteracoes,
    };

    const movimento = await prepararMovimentacao(
      conexao,
      vinculo.id,
      mesclados
    );

    await conexao.execute(
      `UPDATE movimentacoes
       SET
         categoria_id = ?,
         conta_bancaria_id = ?,
         cliente_fornecedor_id = ?,
         descricao = ?,
         valor = ?,
         data_vencimento = ?,
         data_pagamento = ?,
         status = ?
       WHERE id = ?
         AND empresa_id = ?`,
      [
        movimento.categoria_id,
        movimento.conta_bancaria_id,
        movimento.cliente_fornecedor_id,
        movimento.descricao,
        movimento.valor,
        movimento.data_vencimento,
        movimento.data_pagamento,
        movimento.status,
        id,
        vinculo.id,
      ]
    );

    await conexao.commit();
    transacaoIniciada = false;

  } catch (erro) {
    if (transacaoIniciada) {
      await conexao.rollback();
    }

    throw erro;
  } finally {
    conexao.release();
  }

  return buscarMovimentacaoContabilPorId(
    usuarioId,
    id
  );
}

// ==========================================
// EXCLUIR MOVIMENTAÇÃO
// ==========================================

export async function excluirMovimentacaoContabil(
  usuarioId,
  movimentacaoId
) {
  const vinculo = await obterEmpresaUsuario(pool, usuarioId);

  const id = validarId(
    movimentacaoId,
    "Movimentação"
  );

  const [resultado] = await pool.execute(
    `DELETE FROM movimentacoes
     WHERE id = ?
       AND empresa_id = ?`,
    [id, vinculo.id]
  );

  if (!resultado.affectedRows) {
    throw new AppError(
      "Movimentação não encontrada.",
      404
    );
  }

  return { id };
}

// ==========================================
// INDICADORES FINANCEIROS
// ==========================================

export async function buscarIndicadoresContabeis(
  usuarioId
) {
  const vinculo = await obterEmpresaUsuario(pool, usuarioId);
  const empresaId = vinculo.id;

  const [totais] = await pool.execute(
    `SELECT
       COALESCE(SUM(
         CASE
           WHEN c.tipo = 'receita'
             AND m.status = 'pago'
           THEN m.valor
           ELSE 0
         END
       ), 0) AS total_receitas,

       COALESCE(SUM(
         CASE
           WHEN c.tipo IN ('despesa', 'custo', 'imposto')
             AND m.status = 'pago'
           THEN m.valor
           ELSE 0
         END
       ), 0) AS total_despesas,

       COUNT(m.id) AS total_movimentacoes

     FROM movimentacoes m
     INNER JOIN categorias c
       ON c.id = m.categoria_id
       AND c.empresa_id = m.empresa_id
     WHERE m.empresa_id = ?`,
    [empresaId]
  );

  const [contagens] = await pool.execute(
    `SELECT (
       (SELECT COUNT(*) FROM movimentacoes
        WHERE empresa_id = ?)
       +
       (SELECT COUNT(*) FROM contas_bancarias
        WHERE empresa_id = ?)
       +
       (SELECT COUNT(*) FROM clientes_fornecedores
        WHERE empresa_id = ?)
       +
       (SELECT COUNT(*) FROM patrimonio_investimentos
        WHERE empresa_id = ?)
     ) AS registros_cadastrados`,
    [
      empresaId,
      empresaId,
      empresaId,
      empresaId,
    ]
  );

  const totalReceitas = Number(
    totais[0].total_receitas
  );

  const totalDespesas = Number(
    totais[0].total_despesas
  );

  return {
    total_receitas: totalReceitas,
    total_despesas: totalDespesas,
    saldo_financeiro: totalReceitas - totalDespesas,
    total_movimentacoes: Number(
      totais[0].total_movimentacoes
    ),
    registros_cadastrados: Number(
      contagens[0].registros_cadastrados
    ),
  };
}



 
// ==========================================
// CLIENTES E FORNECEDORES
// ==========================================

const TIPOS_PESSOA = ["cliente", "fornecedor"];

function validarDadosPessoa(dados) {
  if (
    !dados ||
    typeof dados !== "object" ||
    Array.isArray(dados)
  ) {
    throw new AppError("Dados inválidos.", 400);
  }

  const tipo = dados.tipo;

  const nome = String(
    dados.nome_razao ?? ""
  ).trim();

  const documento = String(
    dados.documento ?? ""
  ).trim() || null;

  const email = String(
    dados.email ?? ""
  ).trim() || null;

  const telefone = String(
    dados.telefone ?? ""
  ).trim() || null;

  if (!TIPOS_PESSOA.includes(tipo)) {
    throw new AppError(
      "Selecione cliente ou fornecedor.",
      400
    );
  }

  if (!nome || nome.length > 255) {
    throw new AppError(
      "Informe um nome ou razão social válido.",
      400
    );
  }

  if (
    email &&
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  ) {
    throw new AppError(
      "Informe um e-mail válido.",
      400
    );
  }

  return {
    tipo,
    nome_razao: nome,
    documento,
    email,
    telefone,
  };
}

// ==========================================
// LISTAR CLIENTES E FORNECEDORES
// ==========================================

export async function listarPessoasContabeis(usuarioId) {
  const vinculo = await obterEmpresaUsuario(
    pool,
    usuarioId
  );

  const [pessoas] = await pool.execute(
    `SELECT
       id,
       empresa_id,
       tipo,
       nome_razao,
       documento,
       email,
       telefone,
       criado_em
     FROM clientes_fornecedores
     WHERE empresa_id = ?
     ORDER BY nome_razao ASC`,
    [vinculo.id]
  );

  return pessoas;
}

// ==========================================
// BUSCAR CLIENTE OU FORNECEDOR POR ID
// ==========================================

export async function buscarPessoaContabilPorId(
  usuarioId,
  pessoaId
) {
  const vinculo = await obterEmpresaUsuario(
    pool,
    usuarioId
  );

  const id = validarId(
    pessoaId,
    "Cliente ou fornecedor"
  );

  const [pessoas] = await pool.execute(
    `SELECT
       id,
       empresa_id,
       tipo,
       nome_razao,
       documento,
       email,
       telefone,
       criado_em
     FROM clientes_fornecedores
     WHERE id = ?
       AND empresa_id = ?
     LIMIT 1`,
    [id, vinculo.id]
  );

  if (!pessoas.length) {
    throw new AppError(
      "Cliente ou fornecedor não encontrado.",
      404
    );
  }

  return pessoas[0];
}

// ==========================================
// CADASTRAR CLIENTE OU FORNECEDOR
// ==========================================

export async function criarPessoaContabil(
  usuarioId,
  dados
) {
  const vinculo = await obterEmpresaUsuario(
    pool,
    usuarioId
  );

  const pessoa = validarDadosPessoa(dados);

  const [resultado] = await pool.execute(
    `INSERT INTO clientes_fornecedores (
       empresa_id,
       tipo,
       nome_razao,
       documento,
       email,
       telefone
     )
     VALUES (?, ?, ?, ?, ?, ?)`,
    [
      vinculo.id,
      pessoa.tipo,
      pessoa.nome_razao,
      pessoa.documento,
      pessoa.email,
      pessoa.telefone,
    ]
  );

  return buscarPessoaContabilPorId(
    usuarioId,
    resultado.insertId
  );
}

// ==========================================
// ATUALIZAR CLIENTE OU FORNECEDOR
// ==========================================

export async function atualizarPessoaContabil(
  usuarioId,
  pessoaId,
  dados
) {
  const vinculo = await obterEmpresaUsuario(
    pool,
    usuarioId
  );

  const id = validarId(
    pessoaId,
    "Cliente ou fornecedor"
  );

  const anterior = await buscarPessoaContabilPorId(
    usuarioId,
    id
  );

  const pessoa = validarDadosPessoa({
    ...anterior,
    ...dados,
  });

  await pool.execute(
    `UPDATE clientes_fornecedores
     SET
       tipo = ?,
       nome_razao = ?,
       documento = ?,
       email = ?,
       telefone = ?
     WHERE id = ?
       AND empresa_id = ?`,
    [
      pessoa.tipo,
      pessoa.nome_razao,
      pessoa.documento,
      pessoa.email,
      pessoa.telefone,
      id,
      vinculo.id,
    ]
  );

  return buscarPessoaContabilPorId(
    usuarioId,
    id
  );
}

// ==========================================
// EXCLUIR CLIENTE OU FORNECEDOR
// ==========================================

export async function excluirPessoaContabil(
  usuarioId,
  pessoaId
) {
  const vinculo = await obterEmpresaUsuario(
    pool,
    usuarioId
  );

  const id = validarId(
    pessoaId,
    "Cliente ou fornecedor"
  );

  const [vinculadas] = await pool.execute(
    `SELECT id
     FROM movimentacoes
     WHERE empresa_id = ?
       AND cliente_fornecedor_id = ?
     LIMIT 1`,
    [vinculo.id, id]
  );

  if (vinculadas.length) {
    throw new AppError(
      "Não é possível excluir este cadastro porque ele possui movimentações financeiras vinculadas.",
      409
    );
  }

  const [resultado] = await pool.execute(
    `DELETE FROM clientes_fornecedores
     WHERE id = ?
       AND empresa_id = ?`,
    [id, vinculo.id]
  );

  if (!resultado.affectedRows) {
    throw new AppError(
      "Cliente ou fornecedor não encontrado.",
      404
    );
  }

  return {
    id,
    mensagem: "Cadastro excluído com sucesso.",
  };
}


import { pool } from "../config/database.js";
import { AppError } from "../utils/AppError.js";

const PERIODOS = {
  "Últimos 30 dias": { dias: 30, grupos: 4 },
  "Últimos 3 meses": { meses: 3 },
  "Últimos 6 meses": { meses: 6 },
  "Últimos 12 meses": { meses: 12 },
};

function numero(valor) {
  const convertido = Number(valor);
  return Number.isFinite(convertido) ? convertido : 0;
}

function arredondar(valor) {
  return Number(numero(valor).toFixed(2));
}

function dataSQL(data) {
  const ano = data.getFullYear();
  const mes = String(data.getMonth() + 1).padStart(2, "0");
  const dia = String(data.getDate()).padStart(2, "0");

  return `${ano}-${mes}-${dia}`;
}

function adicionarDias(data, quantidade) {
  const resultado = new Date(data);
  resultado.setDate(resultado.getDate() + quantidade);
  return resultado;
}

function intervaloPeriodo(periodo) {
  const configuracao = PERIODOS[periodo];

  if (!configuracao) {
    throw new AppError("Período inválido.", 400);
  }

  const agora = new Date();

  const fim = new Date( agora.getFullYear(), agora.getMonth(), agora.getDate() + 1);

  let inicio;
  let anteriorInicio;

  if (configuracao.dias) {
    inicio = adicionarDias(fim, -configuracao.dias);
    anteriorInicio = adicionarDias(inicio, -configuracao.dias);
  } else {
    inicio = new Date(agora.getFullYear(), agora.getMonth() - configuracao.meses + 1, 1);

    anteriorInicio = new Date(inicio.getFullYear(), inicio.getMonth() - configuracao.meses, 1);
  }

  return {
    inicio: dataSQL(inicio),
    fim: dataSQL(fim),
    anteriorInicio: dataSQL(anteriorInicio),
    configuracao,
  };
}

async function validarEmpresa(usuarioId, empresaId) {
  const usuario = Number(usuarioId);
  const empresa = Number(empresaId);

  if (!Number.isSafeInteger(usuario) || usuario <= 0 || !Number.isSafeInteger(empresa) || empresa <= 0) {
    throw new AppError("Usuário ou empresa inválidos.", 400);
  }

  const [vinculos] = await pool.execute(
    `SELECT 1
     FROM usuario_empresa
     WHERE usuario_id = ?
       AND empresa_id = ?
     LIMIT 1`,
    [usuario, empresa]
  );

  if (!vinculos.length) {
    throw new AppError("Você não possui acesso a esta empresa.", 403);
  }

  return empresa;
}

function variacaoPercentual(atual, anterior) {
  const valorAtual = numero(atual);
  const valorAnterior = numero(anterior);

  if (valorAnterior === 0) {
    return valorAtual === 0 ? 0 : null;
  }

  return arredondar(((valorAtual - valorAnterior) / Math.abs(valorAnterior)) * 100);
}

function calcularResumo(lancamentos) {
  let receita = 0;
  let despesa = 0;

  for (const item of lancamentos) {
    const valor = numero(item.valor);

    if (item.tipo === "receita") {
      receita += valor;
    } else if (
      ["despesa", "custo", "imposto"].includes(item.tipo)
    ) {
      despesa += valor;
    }
  }

  const lucro = receita - despesa;

  return {
    receita: arredondar(receita),
    despesa: arredondar(despesa),
    lucro: arredondar(lucro),
    margem: receita > 0 ? arredondar((lucro / receita) * 100) : null,
  };
}

function construirGrafico(lancamentos, intervalo) {
  const { inicio, fim, configuracao } = intervalo;

  const inicioData = new Date(`${inicio}T12:00:00`);
  const grupos = [];

  if (configuracao.dias) {
    const quantidadeGrupos = configuracao.grupos;

    for (let i = 0; i < quantidadeGrupos; i++) {
      const diaInicial = Math.floor((i * configuracao.dias) / quantidadeGrupos);
      const diaFinal = Math.floor(((i + 1) * configuracao.dias) / quantidadeGrupos);
      const comeco = adicionarDias(inicioData, diaInicial);
      const termino = adicionarDias(inicioData, diaFinal);

      grupos.push({
        mes: `Período ${i + 1}`,
        inicio: dataSQL(comeco),
        fim: dataSQL(termino),
        receitas: 0,
        despesas: 0,
      });
    }
  } else {
    for (let i = 0; i < configuracao.meses; i++) {
      const data = new Date(inicioData.getFullYear(), inicioData.getMonth() + i, 1);

      const proximo = new Date(data.getFullYear(), data.getMonth() + 1, 1);

      grupos.push({
        mes: data.toLocaleDateString("pt-BR", { month: "short"}),
        inicio: dataSQL(data),
        fim: dataSQL(proximo),
        receitas: 0,
        despesas: 0,
      });
    }
  }

  for (const item of lancamentos) {
    const data = String(item.data_pagamento).slice( 0, 10);

    if (data < inicio || data >= fim) {
      continue;
    }

    const grupo = grupos.find((g) => data >= g.inicio && data < g.fim);

    if (!grupo) continue;

    if (item.tipo === "receita") {
      grupo.receitas += numero(item.valor);
    } else if (
      ["despesa", "custo", "imposto"].includes(item.tipo)
    ) {
      grupo.despesas += numero(item.valor);
    }
  }

  return grupos.map(
    ({ mes, receitas, despesas }) => ({
      mes,
      receitas: arredondar(receitas),
      despesas: arredondar(despesas),
    })
  );
}

function classificarConta(tipo) {
  if (tipo === "receita") return "receber";
  if (["despesa", "custo", "imposto"].includes(tipo)) return "pagar";
  return null;
}

function formatarConta(item) {
  return {
    id: item.id,
    nome: item.descricao,
    descricao: item.descricao,
    categoria: item.categoria,
    tipo: classificarConta(item.tipo),
    data: item.data,
    dataVencimento: item.data,
    valor: arredondar(item.valor),
    status: "pendente",
  };
}

function gerarAlertas(contas, hojeSQL) {
  const hoje = new Date(`${hojeSQL}T12:00:00`);
  const alertas = [];

  for (const conta of contas) {
    if (!conta.data || !conta.tipo) continue;

    const vencimento = new Date(`${conta.data}T12:00:00`);
    const dias = Math.round((vencimento - hoje) / 86400000);
    if (dias > 7) continue;

    const atrasado = dias < 0;
    const receber = conta.tipo === "receber";
    const situacao = atrasado
      ? `vencido há ${Math.abs(dias)} dia(s)`
      : dias === 0
        ? "vence hoje"
        : `vence em ${dias} dia(s)`;

    alertas.push({
      id: `vencimento-${conta.id}`,
      contaId: conta.id,
      titulo: atrasado
        ? (receber ? "Recebimento em atraso" : "Conta vencida")
        : (receber ? "Recebimento previsto" : "Conta próxima do vencimento"),
      descricao: `${conta.nome}: ${situacao}.`,
      tipo: atrasado ? "warning" : receber ? "success" : "info",
      data: conta.data,
      diasParaVencer: dias,
    });
  }

  return alertas.sort((a, b) => a.diasParaVencer - b.diasParaVencer).slice(0, 12);
}

async function buscarSaldoBancario(empresaId) {
  const [linhas] = await pool.execute(
    `SELECT
       COUNT(*) AS quantidade,
       COALESCE(SUM(cb.saldo_inicial + COALESCE(mb.movimentado, 0)), 0) AS saldo
     FROM contas_bancarias cb
     LEFT JOIN (
       SELECT conta_bancaria_id,
              SUM(CASE
                WHEN tipo = 'entrada' THEN valor
                WHEN tipo = 'saida' THEN -valor
                ELSE 0
              END) AS movimentado
       FROM movimentacoes_bancarias
       WHERE empresa_id = ?
       GROUP BY conta_bancaria_id
     ) mb ON mb.conta_bancaria_id = cb.id
     WHERE cb.empresa_id = ?`,
    [empresaId, empresaId]
  );

  return {
    quantidade: numero(linhas[0]?.quantidade),
    saldo: arredondar(linhas[0]?.saldo),
  };
}

export async function buscarAnalisesFinanceiras({usuarioId, empresaId, periodo = "Últimos 6 meses",}) {
  const empresa = await validarEmpresa(usuarioId, empresaId);
  const intervalo = intervaloPeriodo(periodo);

  const [
    [lancamentos],
    [categorias],
    [atividades],
    [patrimonio],
    [contas],
    [pendencias],
    [contasDetalhadasRows],
    [contasAlertaRows],
    saldoBancarioInfo,
    [empresasRows],
  ] = await Promise.all([

    pool.execute(
      `SELECT
         m.id,
         m.descricao,
         m.valor,
         DATE_FORMAT(
           m.data_pagamento,
           '%Y-%m-%d'
         ) AS data_pagamento,
         c.tipo
       FROM movimentacoes m
       INNER JOIN categorias c
         ON c.id = m.categoria_id
        AND c.empresa_id = m.empresa_id
       WHERE m.empresa_id = ?
         AND m.status = 'pago'
         AND m.data_pagamento >= ?
         AND m.data_pagamento < ?
       ORDER BY m.data_pagamento, m.id`,
      [
        empresa,
        intervalo.anteriorInicio,
        intervalo.fim,
      ]
    ),

    pool.execute(
      `SELECT
         c.nome,
         c.tipo,
         SUM(m.valor) AS valor
       FROM movimentacoes m
       INNER JOIN categorias c
         ON c.id = m.categoria_id
        AND c.empresa_id = m.empresa_id
       WHERE m.empresa_id = ?
         AND m.status = 'pago'
         AND m.data_pagamento >= ?
         AND m.data_pagamento < ?
         AND c.tipo IN (
           'despesa',
           'custo',
           'imposto'
         )
       GROUP BY c.id, c.nome, c.tipo
       ORDER BY valor DESC`,
      [
        empresa,
        intervalo.inicio,
        intervalo.fim,
      ]
    ),

    pool.execute(
      `SELECT
         m.id,
         m.descricao,
         m.valor,
         c.tipo,
         DATE_FORMAT(
           m.data_pagamento,
           '%Y-%m-%d'
         ) AS data,
         m.atualizado_em
       FROM movimentacoes m
       INNER JOIN categorias c
         ON c.id = m.categoria_id
        AND c.empresa_id = m.empresa_id
       WHERE m.empresa_id = ?
         AND m.status = 'pago'
         AND m.data_pagamento >= ?
         AND m.data_pagamento < ?
       ORDER BY
         m.atualizado_em DESC,
         m.id DESC
       LIMIT 8`,
      [
        empresa,
        intervalo.inicio,
        intervalo.fim,
      ]
    ),

    pool.execute(
      `SELECT
         tipo,
         COUNT(*) AS quantidade,
         COALESCE(SUM(valor), 0) AS total
       FROM patrimonio_investimentos
       WHERE empresa_id = ?
       GROUP BY tipo`,
      [empresa]
    ),

    pool.execute(
      `SELECT
         COUNT(*) AS quantidade,
         COALESCE(
           SUM(saldo_inicial),
           0
         ) AS saldo_inicial
       FROM contas_bancarias
       WHERE empresa_id = ?`,
      [empresa]
    ),

    pool.execute(
      `SELECT
         c.tipo,
         COUNT(*) AS quantidade,
         COALESCE(SUM(m.valor), 0) AS total
       FROM movimentacoes m
       INNER JOIN categorias c
         ON c.id = m.categoria_id
        AND c.empresa_id = m.empresa_id
       WHERE m.empresa_id = ?
         AND m.status = 'pendente'
         AND m.data_vencimento >= ?
         AND m.data_vencimento < ?
       GROUP BY c.tipo`,
      [
        empresa,
        intervalo.inicio,
        intervalo.fim,
      ]
    ),

    pool.execute(
      `SELECT m.id, m.descricao, m.valor,
              DATE_FORMAT(m.data_vencimento, '%Y-%m-%d') AS data,
              c.nome AS categoria, c.tipo
       FROM movimentacoes m
       INNER JOIN categorias c
         ON c.id = m.categoria_id AND c.empresa_id = m.empresa_id
       WHERE m.empresa_id = ? AND m.status = 'pendente'
         AND m.data_vencimento >= ? AND m.data_vencimento < ?
       ORDER BY m.data_vencimento ASC, m.id ASC
       LIMIT 100`,
      [empresa, intervalo.inicio, intervalo.fim]
    ),

    pool.execute(
      `SELECT m.id, m.descricao, m.valor,
              DATE_FORMAT(m.data_vencimento, '%Y-%m-%d') AS data,
              c.nome AS categoria, c.tipo
       FROM movimentacoes m
       INNER JOIN categorias c
         ON c.id = m.categoria_id AND c.empresa_id = m.empresa_id
       WHERE m.empresa_id = ? AND m.status = 'pendente'
         AND m.data_vencimento < ?
       ORDER BY m.data_vencimento ASC, m.id ASC
       LIMIT 200`,
      [empresa, dataSQL(adicionarDias(new Date(), 8))]
    ),

    buscarSaldoBancario(empresa),

    pool.execute(`SELECT * FROM empresas WHERE id = ? LIMIT 1`, [empresa]),
  ]);

  const atuais = lancamentos.filter(
    (item) =>
      item.data_pagamento >= intervalo.inicio &&
      item.data_pagamento < intervalo.fim
  );

  const anteriores = lancamentos.filter(
    (item) =>
      item.data_pagamento >=
        intervalo.anteriorInicio &&
      item.data_pagamento < intervalo.inicio
  );

  const resumo = calcularResumo(atuais);

  const resumoAnterior = calcularResumo(
    anteriores
  );

  const comparacao = {
    possuiHistoricoAnterior: anteriores.length > 0,
    quantidadeLancamentosAtual: atuais.length,
    quantidadeLancamentosAnterior:
      anteriores.length,
  };

  const variacao = {
    receita: variacaoPercentual(resumo.receita, resumoAnterior.receita),
    despesa: variacaoPercentual(resumo.despesa, resumoAnterior.despesa),
    lucro: variacaoPercentual(resumo.lucro, resumoAnterior.lucro),
    margem: resumo.margem === null || resumoAnterior.margem === null ? null : arredondar(resumo.margem - resumoAnterior.margem),
  };

  const dados = construirGrafico(atuais, intervalo);

  const desempenho = dados.map((item) => ({
    mes: item.mes,
    valor:
      item.receitas > 0
        ? arredondar(
            ((item.receitas - item.despesas) /
              item.receitas) *
              100
          )
        : null,
  }));

  const totalCategorias = categorias.reduce((total, item) => total + numero(item.valor), 0);

  const dadosCustos = categorias.map((item) => {
    const valor = numero(item.valor);

    return {
      nome: item.nome,
      tipo: item.tipo,
      valor: arredondar(valor),
      percentual:
        totalCategorias > 0
          ? arredondar(
              (valor / totalCategorias) * 100
            )
          : 0,
    };
  });

  const patrimonioPorTipo = Object.fromEntries(
    patrimonio.map((item) => [
      item.tipo,
      {
        quantidade: numero(item.quantidade),
        total: arredondar(item.total),
      },
    ])
  );

  const pendentes = {
    receber: 0,
    pagar: 0,
    quantidadeReceber: 0,
    quantidadePagar: 0,
  };

  for (const item of pendencias) {
    const valor = numero(item.total);
    const quantidade = numero(item.quantidade);

    if (item.tipo === "receita") {
      pendentes.receber += valor;
      pendentes.quantidadeReceber += quantidade;
    } else if (
      ["despesa", "custo", "imposto"].includes(
        item.tipo
      )
    ) {
      pendentes.pagar += valor;
      pendentes.quantidadePagar += quantidade;
    }
  }

  pendentes.receber = arredondar(pendentes.receber);
  pendentes.pagar = arredondar(pendentes.pagar);

  const atividadesFormatadas = atividades.map(
    (item) => ({
      id: item.id,
      tipo: "lancamento",

      titulo:
        item.tipo === "receita"
          ? "Receita registrada"
          : "Saída registrada",

      detalhe: item.descricao,
      valor: arredondar(item.valor),
      data: item.data,
    })
  );

  const contasDetalhadas = contasDetalhadasRows.map(formatarConta).filter((conta) => conta.tipo !== null);
  const contasParaAlertas = contasAlertaRows.map(formatarConta).filter((conta) => conta.tipo !== null);
  const alertas = gerarAlertas(contasParaAlertas, dataSQL(new Date()));

  const empresaRegistro = empresasRows[0] || {};
  const empresaInfo = { id: empresa, razaoSocial: empresaRegistro.razao_social || empresaRegistro.nome_empresa || empresaRegistro.nome_fantasia || empresaRegistro.nome || null };

  return {
    periodo,

    intervalo: {
      inicio: intervalo.inicio,
      fimExclusivo: intervalo.fim,
      anteriorInicio:
        intervalo.anteriorInicio,
    },

    resumo,
    resumoAnterior,
    comparacao,
    variacao,

    dados,
    desempenho,
    dadosCustos,

    atividades: atividadesFormatadas,

    patrimonio: patrimonioPorTipo,

    contas: {
      quantidade: numero(
        contas[0]?.quantidade
      ),
      saldoInicial: arredondar(
        contas[0]?.saldo_inicial
      ),
    },

    pendentes,
    contasDetalhadas,
    alertas,
    saldoBancario: saldoBancarioInfo.saldo,
    empresa: empresaInfo,
  };
}
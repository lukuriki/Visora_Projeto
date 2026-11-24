import db from "../config/database.js";

const num = (v) => Number(v ?? 0);
const arred = (v) => Number(v.toFixed(2));

export async function buscarDadosEmpresa(empresa_id) {
  const [empresa] = await db.execute(
    `SELECT setor_atuacao, porte_empresa, regime_tributario, perfil_risco, capital_inicial
     FROM empresas
     WHERE id = ?`,
    [empresa_id]
  );

  if (!empresa.length) return null;

  const [pagos] = await db.execute(
    `SELECT DATE_FORMAT(movimentacoes.data_vencimento, '%Y-%m') AS mes,
            movimentacoes.valor,
            categorias.tipo,
            categorias.natureza
     FROM movimentacoes
     JOIN categorias ON categorias.id = movimentacoes.categoria_id
     WHERE movimentacoes.empresa_id = ?
       AND movimentacoes.status = 'pago'
       AND movimentacoes.data_vencimento >= DATE_SUB(CURDATE(), INTERVAL 12 MONTH)
     ORDER BY mes`,
    [empresa_id]
  );

  const [pendentes] = await db.execute(
    `SELECT categorias.tipo,
            movimentacoes.valor
     FROM movimentacoes
     JOIN categorias ON categorias.id = movimentacoes.categoria_id
     WHERE movimentacoes.empresa_id = ?
       AND movimentacoes.status = 'pendente'`,
    [empresa_id]
  );

  const [contasBD] = await db.execute(
    `SELECT id, tipo_conta, saldo_inicial
     FROM contas_bancarias
     WHERE empresa_id = ?`,
    [empresa_id]
  );

  const [movimentosContas] = await db.execute(
    `SELECT movimentacoes.conta_bancaria_id,
            movimentacoes.valor,
            categorias.tipo
     FROM movimentacoes
     JOIN categorias ON categorias.id = movimentacoes.categoria_id
     WHERE movimentacoes.empresa_id = ?
       AND movimentacoes.status = 'pago'
       AND movimentacoes.conta_bancaria_id IS NOT NULL`,
    [empresa_id]
  );

  const [parceirosBD] = await db.execute(
    `SELECT clientes_fornecedores.id,
            clientes_fornecedores.tipo,
            clientes_fornecedores.nome_razao,
            movimentacoes.valor
     FROM movimentacoes
     JOIN clientes_fornecedores
       ON clientes_fornecedores.id = movimentacoes.cliente_fornecedor_id
     WHERE movimentacoes.empresa_id = ?
       AND movimentacoes.status = 'pago'
       AND movimentacoes.data_vencimento >= DATE_SUB(CURDATE(), INTERVAL 12 MONTH)`,
    [empresa_id]
  );

  const [patrimonio] = await db.execute(
    `SELECT tipo, descricao, valor, taxa_juros, data_registro
     FROM patrimonio_investimentos
     WHERE empresa_id = ?
     LIMIT 30`,
    [empresa_id]
  );

  const [simulacoesBD] = await db.execute(
    `SELECT nome_simulacao, valor_investimento, custo_por_unidade,
            preco_estimado_venda, producao_inicial
     FROM simulacoes_investimento
     WHERE empresa_id = ?
     LIMIT 10`,
    [empresa_id]
  );

  
  

  const [apontamentos] = await db.execute(
    `SELECT
        id,
        tipo,
        titulo,
        descricao,
        gravidade,
        gravidade AS nivel_severidade,
        recomendacao,
        status,
        criado_em
     FROM auditoria_apontamentos
     WHERE empresa_id = ?
       AND status IN ('pendente', 'em_analise')
     ORDER BY
       FIELD(
         gravidade,
         'critica',
         'alta',
         'media',
         'baixa'
       ),
       criado_em DESC
     LIMIT 20`,
    [empresa_id]
  );


  const porMes = {};
  for (const r of pagos) {
    if (!porMes[r.mes]) {
      porMes[r.mes] = {
        mes: r.mes, receita: 0, custo: 0, despesa: 0, imposto: 0,
        custo_fixo: 0, custo_variavel: 0,
      };
    }

    const m = porMes[r.mes];
    const valor = num(r.valor);
    m[r.tipo] += valor;

    if (r.tipo === "custo" || r.tipo === "despesa") {
      if (r.natureza === "fixo") m.custo_fixo += valor;
      else m.custo_variavel += valor;
    }
  }

  const meses = Object.values(porMes).map((m) => {
    const lucro = m.receita - m.custo - m.despesa - m.imposto;
    return {
      mes: m.mes,
      receita: arred(m.receita),
      custo: arred(m.custo),
      despesa: arred(m.despesa),
      imposto: arred(m.imposto),
      custo_fixo: arred(m.custo_fixo),
      custo_variavel: arred(m.custo_variavel),
      lucro: arred(lucro),
      margem_percentual: m.receita > 0 ? arred((lucro / m.receita) * 100) : 0,
    };
  });

  const soma = (campo) => meses.reduce((t, m) => t + m[campo], 0);
  const qtdMeses = meses.length;
  const divisor = qtdMeses || 1;

  const receitaTotal = soma("receita");
  const lucroTotal = soma("lucro");
  const fixoTotal = soma("custo_fixo");
  const variavelTotal = soma("custo_variavel") + soma("imposto");

  const resumo = {
    meses_analisados: qtdMeses,
    receita_total: arred(receitaTotal),
    lucro_total: arred(lucroTotal),
    receita_media_mensal: arred(receitaTotal / divisor),
    lucro_medio_mensal: arred(lucroTotal / divisor),
    margem_media_percentual: receitaTotal > 0 ? arred((lucroTotal / receitaTotal) * 100) : 0,
  };

  if (qtdMeses >= 4) {
    const meio = Math.floor(qtdMeses / 2);
    const media = (lista, campo) => lista.reduce((t, m) => t + m[campo], 0) / lista.length;
    const antes = meses.slice(0, meio);
    const depois = meses.slice(meio);
    const varPct = (a, b) => (a !== 0 ? arred(((b - a) / Math.abs(a)) * 100) : null);

    resumo.tendencia = {
      variacao_receita_percentual: varPct(media(antes, "receita"), media(depois, "receita")),
      variacao_lucro_percentual: varPct(media(antes, "lucro"), media(depois, "lucro")),
    };
  }

  const margemContribuicao = receitaTotal > 0 ? 1 - variavelTotal / receitaTotal : 0;
  resumo.ponto_equilibrio_mensal =
    margemContribuicao > 0 ? arred(fixoTotal / divisor / margemContribuicao) : null;

  const pend = {};
  for (const p of pendentes) {
    pend[p.tipo] = (pend[p.tipo] ?? 0) + num(p.valor);
  }

  let saldoAtual = contasBD.reduce((t, c) => t + num(c.saldo_inicial), 0);
  for (const mv of movimentosContas) {
    saldoAtual += mv.tipo === "receita" ? num(mv.valor) : -num(mv.valor);
  }

  const aPagar = (pend.custo ?? 0) + (pend.despesa ?? 0) + (pend.imposto ?? 0);
  const aReceber = pend.receita ?? 0;
  const saidaMensalMedia = (soma("custo") + soma("despesa")) / divisor;

  const fluxoCaixa = {
    saldo_atual_contas: arred(saldoAtual),
    a_receber: arred(aReceber),
    a_pagar: arred(aPagar),
    saldo_projetado: arred(saldoAtual + aReceber - aPagar),
    meses_de_caixa: saidaMensalMedia > 0 ? arred(saldoAtual / saidaMensalMedia) : null,
  };

  const somaParceiros = {};
  for (const p of parceirosBD) {
    if (!somaParceiros[p.id]) {
      somaParceiros[p.id] = { tipo: p.tipo, nome_razao: p.nome_razao, total: 0 };
    }
    somaParceiros[p.id].total += num(p.valor);
  }

  const parceiros = Object.values(somaParceiros)
    .sort((a, b) => b.total - a.total)
    .slice(0, 10);

  const concentracao = {};
  for (const tipo of ["cliente", "fornecedor"]) {
    const lista = parceiros.filter((p) => p.tipo === tipo);
    const totalTipo = lista.reduce((t, p) => t + p.total, 0);

    concentracao[tipo] = lista.slice(0, 5).map((p) => ({
      nome: p.nome_razao,
      total: arred(p.total),
      participacao_percentual: totalTipo > 0 ? arred((p.total / totalTipo) * 100) : 0,
    }));
  }

  const simulacoes = simulacoesBD.map((s) => {
    const investimento = num(s.valor_investimento);
    const custo = num(s.custo_por_unidade);
    const preco = num(s.preco_estimado_venda);
    const producao = num(s.producao_inicial);
    const lucroUnit = preco - custo;

    return {
      nome: s.nome_simulacao,
      valor_investimento: investimento,
      custo_por_unidade: custo,
      preco_estimado_venda: preco,
      producao_inicial: producao,
      lucro_unitario: arred(lucroUnit),
      margem_percentual: preco > 0 ? arred((lucroUnit / preco) * 100) : 0,
      lucro_se_vender_tudo: arred(lucroUnit * producao),
      roi_percentual:
        investimento > 0 ? arred(((lucroUnit * producao) / investimento) * 100) : null,
      ponto_equilibrio_unidades: lucroUnit > 0 ? Math.ceil(investimento / lucroUnit) : null,
    };
  });

  const patrimonioPorTipo = {};
  for (const p of patrimonio) {
    patrimonioPorTipo[p.tipo] = arred((patrimonioPorTipo[p.tipo] ?? 0) + num(p.valor));
  }

  return {
    empresa: empresa[0],
    resumo,
    historico_mensal: meses,
    fluxo_caixa: fluxoCaixa,
    concentracao,
    patrimonio_total_por_tipo: patrimonioPorTipo,
    patrimonio_detalhado: patrimonio,
    simulacoes,
    apontamentos_auditoria: apontamentos,
  };
}

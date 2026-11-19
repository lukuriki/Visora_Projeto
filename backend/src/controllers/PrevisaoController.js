import db from "../config/database.js";
import { buscarDadosEmpresa } from "../services/DadosEmpresaService.js";
import { gerarComRetry } from "../services/GeminiService.js";

const arred = (v) => Number(v.toFixed(2));
const lerJSON = (v) => (typeof v === "string" ? JSON.parse(v) : v);
const TIPOS = ["conservador", "esperado", "crescimento", "personalizado"];

// Confere se o usuário pertence à empresa (evita ver dados de outra empresa)
async function temAcesso(usuario_id, empresa_id) {
  const [rows] = await db.execute(
    `SELECT usuario_id
     FROM usuario_empresa
     WHERE usuario_id = ? AND empresa_id = ?`,
    [usuario_id, empresa_id]
  );
  return rows.length > 0;
}

// ───────── CÁLCULOS DA PREVISÃO ─────────

// Pega a base de partida: médias dos últimos 3 meses + crescimento histórico
function calcularBase(historico) {
  const ultimos = historico.slice(-3);
  const soma = (campo) => ultimos.reduce((t, m) => t + m[campo], 0);

  const receitaUltimos = soma("receita");
  const receitaBase = receitaUltimos / ultimos.length;
  const fixoBase = soma("custo_fixo") / ultimos.length;

  // proporção da receita que vai para custos variáveis e impostos
  const ratioVariavel =
    receitaUltimos > 0 ? (soma("custo_variavel") + soma("imposto")) / receitaUltimos : 0;

  // crescimento mensal da receita: reta de tendência (regressão linear) sobre o histórico
  let crescimento = 0;
  const n = historico.length;

  if (n >= 3) {
    const ys = historico.map((m) => m.receita);
    const mediaX = (n - 1) / 2;
    const mediaY = ys.reduce((a, b) => a + b, 0) / n;

    let numerador = 0;
    let denominador = 0;
    for (let i = 0; i < n; i++) {
      numerador += (i - mediaX) * (ys[i] - mediaY);
      denominador += (i - mediaX) ** 2;
    }

    const inclinacao = denominador > 0 ? numerador / denominador : 0;
    crescimento = mediaY > 0 ? inclinacao / mediaY : 0;
  }

  // limita para não projetar valores absurdos com poucos dados
  crescimento = Math.max(-0.05, Math.min(0.08, crescimento));

  return {
    receita_base_mensal: arred(receitaBase),
    custo_fixo_base_mensal: arred(fixoBase),
    proporcao_custos_variaveis: Number(ratioVariavel.toFixed(4)),
    crescimento_historico_mensal: Number(crescimento.toFixed(4)),
  };
}

// Define as premissas de cada tipo de cenário
function definirPremissas(tipo, crescimentoBase, custom) {
  if (tipo === "conservador") {
    return {
      crescimento_receita_mensal: crescimentoBase > 0 ? crescimentoBase * 0.5 : crescimentoBase * 1.5,
      variacao_custo_fixo_mensal: 0.006,
    };
  }

  if (tipo === "crescimento") {
    return {
      crescimento_receita_mensal: crescimentoBase > 0 ? crescimentoBase * 1.5 : 0.01,
      variacao_custo_fixo_mensal: 0.005,
    };
  }

  if (tipo === "personalizado") {
    const cresc = Number(custom?.crescimento_receita_mensal_percentual);
    const fixo = Number(custom?.variacao_custo_fixo_mensal_percentual);

    return {
      crescimento_receita_mensal: Number.isFinite(cresc) ? cresc / 100 : crescimentoBase,
      variacao_custo_fixo_mensal: Number.isFinite(fixo) ? fixo / 100 : 0.004,
    };
  }

  // esperado: segue a tendência histórica
  return {
    crescimento_receita_mensal: crescimentoBase,
    variacao_custo_fixo_mensal: 0.004,
  };
}

// "2026-03" + 2 meses = "2026-05"
function proximoMes(ultimoMes, k) {
  const [ano, mes] = ultimoMes.split("-").map(Number);
  const d = new Date(ano, mes - 1 + k, 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

// Gera a projeção mês a mês
function projetar(base, premissas, horizonte, ultimoMes, saldoInicial) {
  const g = premissas.crescimento_receita_mensal;
  const f = premissas.variacao_custo_fixo_mensal;

  const meses = [];
  let saldo = saldoInicial;
  let mesCaixaNegativo = null;

  for (let k = 1; k <= horizonte; k++) {
    const receita = base.receita_base_mensal * (1 + g) ** k;
    const fixo = base.custo_fixo_base_mensal * (1 + f) ** k;
    const variavel = receita * base.proporcao_custos_variaveis;
    const lucro = receita - fixo - variavel;
    saldo += lucro;

    const mes = proximoMes(ultimoMes, k);
    if (saldo < 0 && !mesCaixaNegativo) mesCaixaNegativo = mes;

    meses.push({
      mes,
      receita: arred(receita),
      custo_fixo: arred(fixo),
      custo_variavel: arred(variavel),
      lucro: arred(lucro),
      margem_percentual: receita > 0 ? arred((lucro / receita) * 100) : 0,
      saldo_caixa_estimado: arred(saldo),
    });
  }

  const lucroTotal = meses.reduce((t, m) => t + m.lucro, 0);
  const receitaTotal = meses.reduce((t, m) => t + m.receita, 0);
  const lucroBase =
    base.receita_base_mensal * (1 - base.proporcao_custos_variaveis) - base.custo_fixo_base_mensal;

  const resumo = {
    receita_total_projetada: arred(receitaTotal),
    lucro_total_projetado: arred(lucroTotal),
    lucro_medio_mensal: arred(lucroTotal / horizonte),
    margem_media_percentual: receitaTotal > 0 ? arred((lucroTotal / receitaTotal) * 100) : 0,
    saldo_final_estimado: meses[meses.length - 1].saldo_caixa_estimado,
    mes_caixa_negativo: mesCaixaNegativo,
    lucro_mensal_atual: arred(lucroBase),
    variacao_lucro_vs_atual_percentual:
      lucroBase !== 0
        ? arred(((lucroTotal / horizonte - lucroBase) / Math.abs(lucroBase)) * 100)
        : null,
  };

  return { meses, resumo };
}

// ───────── ROTAS ─────────

// POST /previsoes/gerar
export async function gerarPrevisao(req, res) {
  const {
    usuario_id,
    empresa_id,
    tipo_cenario = "esperado",
    horizonte_meses = 12,
    nome,
    parametros_personalizados,
    com_analise_ia = true,
  } = req.body ?? {};

  if (!usuario_id || !empresa_id) {
    return res.status(400).json({ erro: "usuario_id e empresa_id são obrigatórios." });
  }

  if (!TIPOS.includes(tipo_cenario)) {
    return res.status(400).json({ erro: `tipo_cenario deve ser: ${TIPOS.join(", ")}.` });
  }

  const horizonte = Number(horizonte_meses);
  if (!Number.isInteger(horizonte) || horizonte < 1 || horizonte > 60) {
    return res.status(400).json({ erro: "horizonte_meses deve ser um inteiro entre 1 e 60." });
  }

  try {
    if (!(await temAcesso(usuario_id, empresa_id))) {
      return res.status(403).json({ erro: "Usuário sem acesso a esta empresa." });
    }

    const dados = await buscarDadosEmpresa(empresa_id);
    if (!dados) {
      return res.status(404).json({ erro: "Empresa não encontrada." });
    }

    const historico = dados.historico_mensal;
    if (!historico.length) {
      return res.status(404).json({ erro: "Sem movimentações pagas para projetar." });
    }

    // 1. Cálculo da projeção (feito no código, não pela IA)
    const base = calcularBase(historico);
    const premissas = definirPremissas(
      tipo_cenario,
      base.crescimento_historico_mensal,
      parametros_personalizados
    );

    const ultimoMes = historico[historico.length - 1].mes;
    const saldoInicial = dados.fluxo_caixa.saldo_atual_contas;
    const projecao = projetar(base, premissas, horizonte, ultimoMes, saldoInicial);

    const avisos = [];
    if (historico.length < 3) {
      avisos.push("Histórico com menos de 3 meses: a previsão assume crescimento zero.");
    } else if (historico.length < 6) {
      avisos.push("Histórico com menos de 6 meses: a previsão é pouco confiável.");
    }

    // 2. Análise em texto pela IA (opcional; se falhar, a previsão ainda é salva)
    let analiseIA = null;

    if (com_analise_ia) {
      try {
        const prompt = `
Interprete a previsão financeira abaixo com base APENAS nos dados fornecidos.
Os números já foram calculados pelo sistema: use-os como estão, não recalcule.
Adapte a recomendação ao perfil_risco da empresa.

EMPRESA: ${JSON.stringify(dados.empresa)}
HISTÓRICO (resumo): ${JSON.stringify(dados.resumo)}
CENÁRIO: ${tipo_cenario}, ${horizonte} meses
BASE DE PARTIDA: ${JSON.stringify(base)}
PREMISSAS: ${JSON.stringify(premissas)}
RESULTADO DA PROJEÇÃO: ${JSON.stringify(projecao.resumo)}
PRIMEIROS MESES: ${JSON.stringify(projecao.meses.slice(0, 3))}
ÚLTIMOS MESES: ${JSON.stringify(projecao.meses.slice(-3))}
AVISOS: ${JSON.stringify(avisos)}

Responda em JSON:
{
  "resumo": "texto curto com o que a previsão mostra",
  "hipoteses": "texto explicando as premissas usadas",
  "riscos": ["risco 1", "risco 2"],
  "recomendacao": "texto"
}`;

        const response = await gerarComRetry({
          contents: [{ role: "user", parts: [{ text: prompt }] }],
          config: {
            responseMimeType: "application/json",
            temperature: 0.3,
            systemInstruction:
              "Você é um analista financeiro. Seja objetivo e deixe claro que são projeções, não garantias.",
          },
        });

        analiseIA = JSON.parse(response.text);
      } catch (erro) {
        console.error("Análise de IA da previsão falhou:", erro.message);
        avisos.push("A análise em texto não ficou disponível agora, mas a projeção foi calculada.");
      }
    }

    // 3. Salva no banco
    const nomeFinal = nome?.trim() || `Previsão ${tipo_cenario} - ${horizonte} meses`;
    const parametros = { base, premissas, avisos };
    const resultado = {
      resumo: projecao.resumo,
      projecao_mensal: projecao.meses,
      analise_ia: analiseIA,
    };

    const [inserido] = await db.execute(
      `INSERT INTO previsoes_cenarios
         (empresa_id, usuario_id, nome, tipo_cenario, horizonte_meses, parametros, resultado)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        empresa_id,
        usuario_id,
        nomeFinal,
        tipo_cenario,
        horizonte,
        JSON.stringify(parametros),
        JSON.stringify(resultado),
      ]
    );

    res.json({
      id: inserido.insertId,
      nome: nomeFinal,
      tipo_cenario,
      horizonte_meses: horizonte,
      parametros,
      resultado,
    });

  } catch (erro) {
    console.error("Erro ao gerar previsão:", erro);
    res.status(500).json({ erro: "Erro ao gerar a previsão." });
  }
}

// GET /previsoes/empresa/:empresa_id?usuario_id=1
export async function listarPrevisoes(req, res) {
  const { empresa_id } = req.params;
  const { usuario_id } = req.query;

  if (!usuario_id) {
    return res.status(400).json({ erro: "usuario_id é obrigatório." });
  }

  try {
    if (!(await temAcesso(usuario_id, empresa_id))) {
      return res.status(403).json({ erro: "Usuário sem acesso a esta empresa." });
    }

    const [rows] = await db.execute(
      `SELECT id, nome, tipo_cenario, horizonte_meses, resultado, criado_em
       FROM previsoes_cenarios
       WHERE empresa_id = ?
       ORDER BY criado_em DESC
       LIMIT 50`,
      [empresa_id]
    );

    const previsoes = rows.map((r) => ({
      id: r.id,
      nome: r.nome,
      tipo_cenario: r.tipo_cenario,
      horizonte_meses: r.horizonte_meses,
      criado_em: r.criado_em,
      // análises antigas (de outro formato) não têm resumo
      resumo: lerJSON(r.resultado)?.resumo ?? null,
    }));

    res.json({ previsoes });

  } catch (erro) {
    console.error("Erro ao listar previsões:", erro);
    res.status(500).json({ erro: "Erro ao listar as previsões." });
  }
}

// GET /previsoes/:id?usuario_id=1
export async function buscarPrevisao(req, res) {
  const { id } = req.params;
  const { usuario_id } = req.query;

  if (!usuario_id) {
    return res.status(400).json({ erro: "usuario_id é obrigatório." });
  }

  try {
    const [rows] = await db.execute(
      `SELECT id, empresa_id, nome, tipo_cenario, horizonte_meses, parametros, resultado, criado_em
       FROM previsoes_cenarios
       WHERE id = ?`,
      [id]
    );

    if (!rows.length) {
      return res.status(404).json({ erro: "Previsão não encontrada." });
    }

    const p = rows[0];

    if (!(await temAcesso(usuario_id, p.empresa_id))) {
      return res.status(403).json({ erro: "Usuário sem acesso a esta previsão." });
    }

    res.json({
      ...p,
      parametros: lerJSON(p.parametros),
      resultado: lerJSON(p.resultado),
    });

  } catch (erro) {
    console.error("Erro ao buscar previsão:", erro);
    res.status(500).json({ erro: "Erro ao buscar a previsão." });
  }
}

// DELETE /previsoes/:id?usuario_id=1
export async function excluirPrevisao(req, res) {
  const { id } = req.params;
  const { usuario_id } = req.query;

  if (!usuario_id) {
    return res.status(400).json({ erro: "usuario_id é obrigatório." });
  }

  try {
    const [rows] = await db.execute(
      `SELECT empresa_id FROM previsoes_cenarios WHERE id = ?`,
      [id]
    );

    if (!rows.length) {
      return res.status(404).json({ erro: "Previsão não encontrada." });
    }

    if (!(await temAcesso(usuario_id, rows[0].empresa_id))) {
      return res.status(403).json({ erro: "Usuário sem acesso a esta previsão." });
    }

    await db.execute(`DELETE FROM previsoes_cenarios WHERE id = ?`, [id]);

    res.json({ ok: true });

  } catch (erro) {
    console.error("Erro ao excluir previsão:", erro);
    res.status(500).json({ erro: "Erro ao excluir a previsão." });
  }
}

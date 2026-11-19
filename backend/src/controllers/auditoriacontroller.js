import { GoogleGenAI } from "@google/genai";
import db from "../config/database.js";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
const esperar = (ms) => new Promise((r) => setTimeout(r, ms));

const MODELOS = [
  process.env.GEMINI_MODEL || "gemini-2.5-flash",
  "gemini-3.5-flash-lite", // reserva, costuma ter mais folga
];

// Se o modelo principal continuar falhando, passa para o próximo da lista.
async function gerarComRetry(params, tentativas = 3) {
  let ultimoErro;

  for (const model of MODELOS) {
    for (let i = 1; i <= tentativas; i++) {
      try {
        return await ai.models.generateContent({ ...params, model });
      } catch (erro) {
        ultimoErro = erro;
        const temporario = erro.status === 503 || erro.status === 429;
        const modeloIndisponivel = erro.status === 404; // modelo removido ou inexistente

        if (modeloIndisponivel) break; // vai para o próximo modelo

        if (!temporario) throw erro;

        if (i < tentativas) await esperar(2000 * 2 ** (i - 1)); // 2s, 4s
      }
    }
    console.warn(`Modelo ${model} indisponível, tentando o próximo...`);
  }

  throw ultimoErro;
}

// Resolve empresa_id via usuario_empresa
async function obterEmpresaId(usuario_id) {
  const [vinculo] = await db.execute(
    `SELECT empresa_id FROM usuario_empresa WHERE usuario_id = ? LIMIT 1`,
    [usuario_id]
  );
  return vinculo.length ? vinculo[0].empresa_id : null;
}

// 1. CARREGAR PÁGINA DE AUDITORIA (Roda varredura + Análise da IA + Retorna lista)
export async function carregarPaginaAuditoria(req, res) {
  const { usuario_id } = req.params;
  const { status, severidade, tipo } = req.query;

  try {
    const empresa_id = await obterEmpresaId(usuario_id);
    if (!empresa_id) {
      return res.status(404).json({ erro: "Usuário ou empresa vinculada não encontrados." });
    }

    // ───────── PASSO A: COLETA DADOS RECENTES PARA A IA ANALISAR ─────────
    const [movimentacoes] = await db.execute(
      `SELECT m.id, m.descricao, m.valor, m.data_vencimento, m.data_pagamento, m.status,
              m.conta_bancaria_id, m.cliente_fornecedor_id,
              c.nome AS categoria, c.tipo AS tipo_categoria, c.natureza
       FROM movimentacoes m
       JOIN categorias c ON c.id = m.categoria_id
       WHERE m.empresa_id = ?
         AND m.data_vencimento >= DATE_SUB(CURDATE(), INTERVAL 60 DAY)
       ORDER BY m.data_vencimento DESC
       LIMIT 80`,
      [empresa_id]
    );

    const [logsRecentes] = await db.execute(
      `SELECT l.acao, l.entidade, l.entidade_id, l.descricao, l.criado_em, u.nome_completo AS usuario
       FROM logs_sistema l
       LEFT JOIN usuarios u ON u.id = l.usuario_id
       WHERE l.empresa_id = ?
         AND l.criado_em >= DATE_SUB(NOW(), INTERVAL 30 DAY)
       ORDER BY l.criado_em DESC
       LIMIT 40`,
      [empresa_id]
    );

    const [jaAbertos] = await db.execute(
      `SELECT tipo, descricao, nivel_severidade, status
       FROM auditoria_apontamentos
       WHERE empresa_id = ? AND status IN ('aberto', 'em_analise')`,
      [empresa_id]
    );

    // ───────── PASSO B: IA IDENTIFICA INCONSISTÊNCIAS E GERA PARECER ─────────
    let analiseIA = {
      resumo_geral: "Nenhuma movimentação recente encontrada para análise.",
      nivel_alerta_geral: "baixo",
      novos_apontamentos: [],
    };

    if (movimentacoes.length > 0 || logsRecentes.length > 0) {
      const prompt = `
Você é um auditor financeiro automatizado. Analise as movimentações e logs abaixo da empresa e identifique possíveis problemas.

Procure especificamente por:
1. "divergencia": lançamentos duplicados (mesmo valor, data próxima e categoria), valores quebrados estranhos ou pagamentos sem data.
2. "movimentacao_incomum": gastos muito acima do padrão das outras movimentações da mesma categoria.
3. "classificacao_inconsistente": descrição do lançamento não condiz com a categoria (ex: "Compra de farinha" em "Marketing"), ou lançamento pago sem conta_bancaria_id / cliente_fornecedor_id.
4. "alteracao_fora_padrao": exclusões, edições suspeitas ou ações realizadas fora do horário comercial (entre 22h e 06h) nos logs.

Apontamentos que JÁ existem em aberto (NÃO repita estes):
${JSON.stringify(jaAbertos, null, 2)}

Movimentações recentes:
${JSON.stringify(movimentacoes, null, 2)}

Logs recentes do sistema:
${JSON.stringify(logsRecentes, null, 2)}

Responda ESTRITAMENTE neste JSON:
{
  "resumo_geral": "Resumo curto de 2 frases sobre a situação da auditoria da empresa para exibir no topo da tela.",
  "nivel_alerta_geral": "baixo | medio | alto | critico",
  "novos_apontamentos": [
    {
      "movimentacao_id": 12,
      "tipo": "divergencia | movimentacao_incomum | classificacao_inconsistente | alteracao_fora_padrao",
      "descricao": "Explicação clara e objetiva do problema encontrado",
      "nivel_severidade": "baixo | medio | alto | critico"
    }
  ]
}`;

      const response = await gerarComRetry({
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        config: {
          responseMimeType: "application/json",
          temperature: 0.2,
          systemInstruction:
            "Você é um auditor financeiro rigoroso. Retorne apenas inconsistências reais baseadas nos dados fornecidos.",
        },
      });

      analiseIA = JSON.parse(response.text);

      // ───────── PASSO C: SALVA NOVOS APONTAMENTOS NO BANCO ─────────
      const tiposValidos = [
        "divergencia",
        "movimentacao_incomum",
        "classificacao_inconsistente",
        "alteracao_fora_padrao",
      ];
      const severidadesValidas = ["baixo", "medio", "alto", "critico"];

      let novosInseridos = 0;
      for (const item of analiseIA.novos_apontamentos ?? []) {
        if (!tiposValidos.includes(item.tipo) || !item.descricao) continue;
        const sev = severidadesValidas.includes(item.nivel_severidade)
          ? item.nivel_severidade
          : "medio";

        // Garante que movimentacao_id existe na lista consultada (evita erro de FK)
        const movExiste = movimentacoes.some((m) => m.id === item.movimentacao_id);
        const movId = movExiste ? item.movimentacao_id : null;

        const [duplicado] = await db.execute(
          `SELECT id FROM auditoria_apontamentos
           WHERE empresa_id = ? AND tipo = ? AND descricao = ? AND status IN ('aberto', 'em_analise')`,
          [empresa_id, item.tipo, item.descricao]
        );

        if (!duplicado.length) {
          await db.execute(
            `INSERT INTO auditoria_apontamentos (empresa_id, movimentacao_id, tipo, descricao, nivel_severidade, status)
             VALUES (?, ?, ?, ?, ?, 'aberto')`,
            [empresa_id, movId, item.tipo, item.descricao, sev]
          );
          novosInseridos++;
        }
      }

      if (novosInseridos > 0) {
        await db.execute(
          `INSERT INTO notificacoes (empresa_id, usuario_id, titulo, mensagem, tipo)
           VALUES (?, ?, 'Alertas de Auditoria IA', ?, 'auditoria')`,
          [
            empresa_id,
            usuario_id,
            `A IA identificou ${novosInseridos} nova(s) inconsistência(s) na auditoria.`,
          ]
        );
      }
    }

    // ───────── PASSO D: BUSCA LISTA COMPLETA ATUALIZADA PARA A TELA ─────────
    let sql = `
      SELECT 
        a.id,
        a.movimentacao_id,
        a.tipo,
        a.descricao,
        a.nivel_severidade,
        a.status,
        a.detectado_em,
        a.resolvido_em,
        u.nome_completo AS resolvido_por,
        m.descricao AS movimentacao_descricao,
        m.valor AS movimentacao_valor,
        m.data_vencimento AS movimentacao_vencimento
      FROM auditoria_apontamentos a
      LEFT JOIN movimentacoes m ON m.id = a.movimentacao_id
      LEFT JOIN usuarios u ON u.id = a.resolvido_por_usuario_id
      WHERE a.empresa_id = ?
    `;
    const params = [empresa_id];

    if (status) {
      sql += ` AND a.status = ?`;
      params.push(status);
    }
    if (severidade) {
      sql += ` AND a.nivel_severidade = ?`;
      params.push(severidade);
    }
    if (tipo) {
      sql += ` AND a.tipo = ?`;
      params.push(tipo);
    }

    sql += ` ORDER BY FIELD(a.nivel_severidade, 'critico', 'alto', 'medio', 'baixo'), a.detectado_em DESC`;

    const [apontamentos] = await db.execute(sql, params);

    const [todos] = await db.execute(
      `SELECT tipo, status, nivel_severidade FROM auditoria_apontamentos WHERE empresa_id = ?`,
      [empresa_id]
    );

    const resumo = {
      total: todos.length,
      abertos: todos.filter((a) => a.status === "aberto").length,
      em_analise: todos.filter((a) => a.status === "em_analise").length,
      resolvidos: todos.filter((a) => a.status === "resolvido").length,
      criticos_ou_altos: todos.filter(
        (a) =>
          (a.nivel_severidade === "critico" || a.nivel_severidade === "alto") &&
          a.status !== "resolvido"
      ).length,
      por_tipo: {
        divergencia: todos.filter((a) => a.tipo === "divergencia").length,
        movimentacao_incomum: todos.filter((a) => a.tipo === "movimentacao_incomum").length,
        classificacao_inconsistente: todos.filter((a) => a.tipo === "classificacao_inconsistente").length,
        alteracao_fora_padrao: todos.filter((a) => a.tipo === "alteracao_fora_padrao").length,
      },
    };

    return res.json({
      diagnostico_ia: {
        resumo_geral: analiseIA.resumo_geral,
        nivel_alerta_geral: analiseIA.nivel_alerta_geral,
      },
      resumo,
      apontamentos,
    });
  } catch (erro) {
    console.error("Erro ao carregar auditoria com IA:", erro);
    return res.status(500).json({ erro: "Erro ao realizar auditoria." });
  }
}

// 2. ATUALIZAR STATUS DO PROBLEMA (quando o usuário clica em Resolver / Ignorar na tela)
export async function atualizarStatusApontamento(req, res) {
  const { apontamento_id } = req.params;
  const { usuario_id, status } = req.body ?? {};

  const statusPermitidos = ["aberto", "em_analise", "resolvido", "ignorado"];
  if (!usuario_id || !statusPermitidos.includes(status)) {
    return res.status(400).json({
      erro: `usuario_id e status válido (${statusPermitidos.join(", ")}) são obrigatórios.`,
    });
  }

  try {
    const empresa_id = await obterEmpresaId(usuario_id);
    if (!empresa_id) {
      return res.status(404).json({ erro: "Usuário ou empresa vinculada não encontrados." });
    }

    const finalizado = status === "resolvido" || status === "ignorado";

    const [resultado] = await db.execute(
      `UPDATE auditoria_apontamentos
       SET status = ?,
           resolvido_em = ${finalizado ? "NOW()" : "NULL"},
           resolvido_por_usuario_id = ${finalizado ? "?" : "NULL"}
       WHERE id = ? AND empresa_id = ?`,
      finalizado ? [status, usuario_id, apontamento_id, empresa_id] : [status, apontamento_id, empresa_id]
    );

    if (resultado.affectedRows === 0) {
      return res.status(404).json({ erro: "Apontamento não encontrado para esta empresa." });
    }

    return res.json({ mensagem: `Status atualizado para '${status}'.` });
  } catch (erro) {
    console.error("Erro ao atualizar apontamento:", erro);
    return res.status(500).json({ erro: "Erro ao atualizar status do apontamento." });
  }
}
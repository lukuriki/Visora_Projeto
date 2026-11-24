import { GoogleGenAI } from "@google/genai";
import db from "../config/database.js";
import { buscarDadosEmpresa } from "../services/DadosEmpresaService.js";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const esperar = (ms) => new Promise((r) => setTimeout(r, ms));

const MODELOS = [process.env.GEMINI_MODEL || "gemini-2.5-flash","gemini-3.5-flash-lite"];

async function gerarComRetry(params, tentativas = 3) {
  let ultimoErro;

  for (const model of MODELOS) {
    for (let i = 1; i <= tentativas; i++) {
      try {
        return await ai.models.generateContent({ ...params, model });
      } catch (erro) {
        ultimoErro = erro;
        const temporario = erro.status === 503 || erro.status === 429;
        const modeloIndisponivel = erro.status === 404;
        if (modeloIndisponivel) break;
        if (!temporario) throw erro;
        if (i < tentativas) await esperar(2000 * 2 ** (i - 1));
      }
    }
    console.warn(`Modelo ${model} indisponível, tentando o próximo...`);
  }
  throw ultimoErro;
}

export async function analisarEmpresa(req, res) {
  const { usuario_id } = req.body ?? {};

  if (!usuario_id) {
    return res.status(400).json({ erro: "usuario_id é obrigatório." });
  }

  try {
    const [vinculo] = await db.execute(`SELECT empresa_id FROM usuario_empresa WHERE usuario_id = ? LIMIT 1`, [usuario_id]);

    if (!vinculo.length) {
      return res.status(404).json({ 
        erro: "Usuário ou empresa vinculada não encontrados." 
      });
    }

    const empresa_id = vinculo[0].empresa_id;

    const dados = await buscarDadosEmpresa(empresa_id);

    if (!dados) {
      return res.status(404).json({ 
        erro: "Empresa não encontrada." 
      });
    }

    if (!dados.historico_mensal.length) {
      return res.status(404).json({ 
        erro: "Sem movimentações pagas para analisar." 
      });
    }

    const prompt = `Analise a empresa abaixo com base APENAS nos dados fornecidos. Os cálculos (lucro, margem, ponto de equilíbrio, ROI, fluxo de caixa) já foram feitos pelo sistema: use esses valores como estão, não recalcule. Se o histórico for curto (menos de 6 meses), avise que a projeção é pouco confiável. Se faltar informação, diga isso. Adapte a recomendação ao perfil_risco da empresa.

    DADOS: ${JSON.stringify(dados, null, 2)}

    Responda em JSON:
    {
      "analise_lucro": "texto sobre evolução do lucro, margem e tendência",
      "analise_valorizacao": "texto sobre patrimônio e investimentos",
      "analise_produtos": "texto sobre as simulações de produto",
      "analise_fluxo_caixa": "texto sobre saldo, contas pendentes e meses de caixa",
      "analise_concentracao": "texto sobre dependência de clientes e fornecedores",
      "projecao_longo_prazo": "texto com cenários conservador, esperado e crescimento",
      "riscos": ["risco 1", "risco 2"],
      "recomendacao": "texto"
    }`;

    const response = await gerarComRetry({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      config: {
        responseMimeType: "application/json",
        temperature: 0.3,
        systemInstruction: "Você é um analista financeiro. Seja objetivo e deixe claro que são projeções, não garantias.",
      },
    });

    const analise = JSON.parse(response.text);

    await db.execute(`INSERT INTO previsoes_cenarios (empresa_id, nome, tipo_cenario, horizonte_meses, parametros, resultado) VALUES (?, 'Análise geral da empresa', 'esperado', 12, ?, ?)`, [empresa_id, JSON.stringify(dados), JSON.stringify(analise)]);

    return res.json({ dados, analise });
  } catch (erro) {
    console.error("Erro na análise:", erro);

    if (erro.status === 503 || erro.status === 429) {
      return res.status(503).json({
        erro: "O serviço de IA está com alta demanda. Tente novamente em alguns minutos.",
      });
    }

    return res.status(500).json({ 
      erro: "Erro ao analisar a empresa." 
    });
  }
}
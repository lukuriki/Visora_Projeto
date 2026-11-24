import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: { timeout: 30000 }, 
});


const MODELOS = (process.env.GEMINI_MODELS || process.env.GEMINI_MODEL || "gemini-3.8-flash")
  .split(",")
  .map((m) => m.trim())
  .filter(Boolean);

const esperar = (ms) => new Promise((r) => setTimeout(r, ms));

export async function gerarComRetry(params, tentativasPorModelo = 2) {
  let ultimoErro;

  for (const model of MODELOS) {
    for (let i = 1; i <= tentativasPorModelo; i++) {
      try {
        return await ai.models.generateContent({ ...params, model });
      } catch (erro) {
        ultimoErro = erro;

        if (erro.status === 404) break;

        const temporario =
          erro.status === 503 ||
          erro.status === 429 ||
          erro.cause?.code === "UND_ERR_HEADERS_TIMEOUT";

        if (!temporario) throw erro;

        if (i < tentativasPorModelo) await esperar(2000 * i);
      }
    }

    console.warn(`Modelo ${model} indisponível, tentando o próximo...`);
  }

  throw ultimoErro;
}

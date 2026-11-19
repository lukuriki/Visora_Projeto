import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: { timeout: 30000 }, // 30s para não ficar pendurado
});

// Lista de modelos no .env, separados por vírgula. O primeiro é o preferido.
// Ex.: GEMINI_MODELS=modelo_principal,modelo_reserva
const MODELOS = (process.env.GEMINI_MODELS || process.env.GEMINI_MODEL || "gemini-3.8-flash")
  .split(",")
  .map((m) => m.trim())
  .filter(Boolean);

const esperar = (ms) => new Promise((r) => setTimeout(r, ms));

// Tenta cada modelo; se um estiver sobrecarregado ou lento, passa para o próximo
export async function gerarComRetry(params, tentativasPorModelo = 2) {
  let ultimoErro;

  for (const model of MODELOS) {
    for (let i = 1; i <= tentativasPorModelo; i++) {
      try {
        return await ai.models.generateContent({ ...params, model });
      } catch (erro) {
        ultimoErro = erro;

        // modelo inexistente ou sem acesso: vai direto para o próximo
        if (erro.status === 404) break;

        const temporario =
          erro.status === 503 ||
          erro.status === 429 ||
          erro.cause?.code === "UND_ERR_HEADERS_TIMEOUT";

        // erro que não é temporário (ex.: chave inválida) não adianta repetir
        if (!temporario) throw erro;

        if (i < tentativasPorModelo) await esperar(2000 * i);
      }
    }

    console.warn(`Modelo ${model} indisponível, tentando o próximo...`);
  }

  throw ultimoErro;
}

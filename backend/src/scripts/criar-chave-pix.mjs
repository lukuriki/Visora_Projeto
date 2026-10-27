// Rode dentro da pasta backend:  node scripts/criar-chave-pix.mjs
// Cadastra uma chave Pix aleatória (EVP) na conta do Asaas SANDBOX, usando o ASAAS_API_KEY do .env.
import "dotenv/config";

const env = process.env;
const base = (env.ASAAS_API_URL || "https://sandbox.asaas.com/api/v3").replace(/\/+$/, "");

if (!env.ASAAS_API_KEY) {
  console.log("ERRO: ASAAS_API_KEY não está no backend/.env");
  process.exit(1);
}
if (/\/\/api\.asaas\.com/.test(base)) {
  console.log("Este script é só para o SANDBOX. Em produção, cadastre a chave pelo painel do Asaas.");
  process.exit(1);
}

async function chamar(metodo, caminho, corpo) {
  const r = await fetch(`${base}${caminho}`, {
    method: metodo,
    headers: { "Content-Type": "application/json", access_token: env.ASAAS_API_KEY, "User-Agent": "Visora/1.0" },
    body: corpo ? JSON.stringify(corpo) : undefined,
    signal: AbortSignal.timeout(15000),
  });
  return { ok: r.ok, status: r.status, corpo: await r.json().catch(() => null) };
}

const dica = `
Se o sandbox não permitir criar a chave por aqui:
  - tente pelo painel do sandbox (menu Pix -> chaves); ou
  - teste com Boleto ou Cartão (não exigem chave Pix); ou
  - use PAGAMENTO_MODO=simulado no .env para a apresentação.`;

try {
  const lista = await chamar("GET", "/pix/addressKeys");
  if (!lista.ok) {
    console.log(`ERRO ao listar chaves (${lista.status}): ${lista.corpo?.errors?.[0]?.description ?? "sem detalhe"}`);
    if (lista.status === 401) console.log("A chave de API foi recusada (inválida ou de outro ambiente).");
    process.exit(1);
  }

  const chaves = lista.corpo?.data ?? [];
  console.log(`Chaves Pix encontradas: ${chaves.length}`);
  chaves.forEach((k, i) => console.log(`  ${i + 1}. tipo=${k.type ?? "?"} status=${k.status ?? "?"}`));

  if (chaves.some((k) => k.status === "ACTIVE")) {
    console.log("\nJá existe uma chave ATIVA. Pode gerar cobranças PIX normalmente.");
    process.exit(0);
  }
  if (chaves.length > 0) {
    console.log("\nExiste chave cadastrada, mas ainda não está ATIVA. Aguarde 1 a 2 minutos e rode este script de novo.");
    process.exit(0);
  }

  const criada = await chamar("POST", "/pix/addressKeys", { type: "EVP" });
  if (!criada.ok) {
    console.log(`\nERRO ao criar a chave (${criada.status}): ${criada.corpo?.errors?.[0]?.description ?? "sem detalhe"}`);
    console.log(dica);
    process.exit(1);
  }
  console.log(`\nChave criada. Status: ${criada.corpo?.status ?? "?"}`);
  console.log("Aguarde 1 a 2 minutos e rode de novo para confirmar que ficou ATIVA.");
} catch (e) {
  console.log(`ERRO de rede: ${e.message}`);
  process.exit(1);
}

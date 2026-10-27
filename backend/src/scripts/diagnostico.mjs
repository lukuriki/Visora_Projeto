// Rode dentro da pasta backend:  node scripts/diagnostico.mjs
// Testa banco, Asaas e e-mail usando o SEU backend/.env. Nunca imprime senhas/chaves.
import "dotenv/config";
import mysql from "mysql2/promise";
import nodemailer from "nodemailer";

let problemas = 0;
const ok = (m) => console.log(`  OK     ${m}`);
const aviso = (m) => console.log(`  AVISO  ${m}`);
const erro = (m) => { problemas++; console.log(`  ERRO   ${m}`); };
const env = process.env;

const modo = env.PAGAMENTO_MODO || (env.PAGAMENTO_SIMULADO === "true" ? "simulado" : "asaas");

// ---------------------------------------------------------------- 1) .env
console.log("\n1) Variáveis do .env");
console.log(`   Modo de pagamento em uso: ${modo.toUpperCase()}`);
if (modo === "simulado") {
  aviso("Está SIMULADO: o Asaas NÃO será chamado (aparece o botão \"Simular pagamento\").");
  aviso("Para usar o Asaas: apague PAGAMENTO_SIMULADO (ou troque por PAGAMENTO_MODO=asaas) e preencha ASAAS_*.");
}
const obrigatorias = ["DB_HOST", "DB_USER", "DB_PASSWORD", "DB_NAME", "FRONTEND_URL", "SMTP_HOST", "SMTP_PORT", "SMTP_USER", "SMTP_PASSWORD", "EMAIL_FROM"];
if (modo === "asaas") obrigatorias.push("ASAAS_API_KEY", "ASAAS_WEBHOOK_TOKEN");
for (const v of obrigatorias) env[v] ? ok(`${v} definida`) : erro(`${v} está vazia ou ausente`);
if (env.EMAIL_FROM && !/<.+@.+>|^[^\s<>]+@[^\s<>]+$/.test(env.EMAIL_FROM.trim())) {
  erro('EMAIL_FROM mal formatada. Use:  EMAIL_FROM=Visora <seu-email@gmail.com>');
}
if (env.ASAAS_API_KEY) {
  const k = env.ASAAS_API_KEY;
  if (!k.startsWith("$aact_")) aviso("A chave do Asaas normalmente começa com $aact_ . Confira se copiou inteira (e entre aspas simples no .env).");
  if (/hmlg/.test(k) && /api\.asaas\.com/.test(env.ASAAS_API_URL ?? "")) erro("Chave de SANDBOX apontando para a URL de produção.");
}
if (env.FRONTEND_URL && !/^https:\/\/|^http:\/\/localhost/.test(env.FRONTEND_URL)) aviso("FRONTEND_URL: o e-mail só aceita links https:// ou http://localhost.");

// ---------------------------------------------------------------- 2) Banco
console.log("\n2) Banco de dados");
try {
  const conn = await mysql.createConnection({
    host: env.DB_HOST, port: Number(env.DB_PORT || 3306), user: env.DB_USER, password: env.DB_PASSWORD, database: env.DB_NAME,
  });
  ok(`conectou em ${env.DB_HOST}:${env.DB_PORT || 3306} / ${env.DB_NAME}`);

  const [tabelas] = await conn.query("SELECT table_name AS t FROM information_schema.tables WHERE table_schema = DATABASE()");
  const existentes = new Set(tabelas.map((r) => r.t.toLowerCase()));
  for (const t of ["planos", "usuarios", "empresas", "usuario_empresa", "assinaturas", "pagamentos", "tokens_usuario"]) {
    existentes.has(t) ? ok(`tabela ${t}`) : erro(`tabela ${t} NÃO existe`);
  }

  const [cols] = await conn.query("SELECT column_name AS c FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'pagamentos'");
  const colunas = new Set(cols.map((r) => r.c.toLowerCase()));
  for (const c of ["gateway_id", "gateway_url", "codigo_transacao"]) {
    colunas.has(c) ? ok(`pagamentos.${c}`) : erro(`pagamentos.${c} NÃO existe -> rode database/migrations/001_pagamentos_gateway.sql`);
  }

  if (existentes.has("planos")) {
    const [[{ n }]] = await conn.query("SELECT COUNT(*) AS n FROM planos WHERE ativo = TRUE");
    n > 0 ? ok(`${n} plano(s) ativo(s)`) : erro("nenhum plano ativo na tabela planos");
  }
  await conn.end();
} catch (e) {
  erro(`falha no banco: ${e.code ?? ""} ${e.message}`);
  if (e.code === "ER_ACCESS_DENIED_ERROR") aviso("Usuário/senha do banco incorretos (DB_USER / DB_PASSWORD).");
  if (e.code === "ECONNREFUSED") aviso("O MySQL não está rodando em DB_HOST:DB_PORT.");
  if (e.code === "ER_BAD_DB_ERROR") aviso("O banco DB_NAME não existe.");
}

// ---------------------------------------------------------------- 3) Asaas
console.log("\n3) Asaas");
if (modo !== "asaas") {
  aviso("pulado (modo simulado)");
} else if (!env.ASAAS_API_KEY) {
  erro("sem ASAAS_API_KEY");
} else {
  const base = (env.ASAAS_API_URL || "https://sandbox.asaas.com/api/v3").replace(/\/+$/, "");
  console.log(`   Endereço: ${base}`);
  try {
    const r = await fetch(`${base}/customers?limit=1`, {
      headers: { access_token: env.ASAAS_API_KEY, "User-Agent": "Visora/1.0" },
      signal: AbortSignal.timeout(15000),
    });
    const corpo = await r.json().catch(() => null);
    if (r.ok) {
      ok("a chave de API foi aceita");
      // PIX exige chave Pix ATIVA na conta do Asaas
      try {
        const rk = await fetch(`${base}/pix/addressKeys`, {
          headers: { access_token: env.ASAAS_API_KEY, "User-Agent": "Visora/1.0" },
          signal: AbortSignal.timeout(15000),
        });
        const kb = await rk.json().catch(() => null);
        if (rk.ok) {
          const ativas = (kb?.data ?? []).filter((k) => k.status === "ACTIVE");
          ativas.length
            ? ok(`${ativas.length} chave(s) Pix ATIVA(s) na conta`)
            : erro("nenhuma chave Pix ATIVA na conta -> o PIX vai falhar. Rode: node scripts/criar-chave-pix.mjs");
        } else {
          aviso(`não consegui listar as chaves Pix (${rk.status})`);
        }
      } catch (e) {
        aviso(`não consegui checar a chave Pix: ${e.message}`);
      }
    }
    else {
      erro(`Asaas respondeu ${r.status}: ${corpo?.errors?.[0]?.description ?? "sem detalhe"}`);
      if (r.status === 401) aviso("Chave inválida, incompleta ou de outro ambiente (sandbox x produção).");
    }
  } catch (e) {
    erro(`não consegui falar com o Asaas: ${e.message}`);
  }
}

// ---------------------------------------------------------------- 4) E-mail
console.log("\n4) E-mail (SMTP)");
if (!env.SMTP_HOST || !env.SMTP_USER || !env.SMTP_PASSWORD) {
  erro("SMTP incompleto");
} else {
  const porta = Number(env.SMTP_PORT || 587);
  try {
    await nodemailer.createTransport({
      host: env.SMTP_HOST, port: porta, secure: porta === 465, auth: { user: env.SMTP_USER, pass: env.SMTP_PASSWORD },
    }).verify();
    ok(`login SMTP aceito (${env.SMTP_HOST}:${porta}) como ${env.SMTP_USER}`);
  } catch (e) {
    erro(`SMTP recusou: ${e.code ?? ""} ${e.message}`);
    if (e.code === "EAUTH") aviso("Para Gmail use uma SENHA DE APP (16 letras, com verificação em 2 etapas), não a senha normal.");
  }
}

console.log(problemas === 0 ? "\nTudo certo nos itens acima.\n" : `\n${problemas} problema(s) encontrado(s). Corrija os itens marcados ERRO.\n`);
process.exit(problemas === 0 ? 0 : 1);

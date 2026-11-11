import { AppError } from "../utils/AppError.js";

// Status do Asaas que significam "dinheiro garantido".
const STATUS_PAGOS = new Set(["RECEIVED", "CONFIRMED", "RECEIVED_IN_CASH"]);
// Eventos de webhook que disparam a ativação da conta.
export const EVENTOS_PAGAMENTO = new Set(["PAYMENT_RECEIVED", "PAYMENT_CONFIRMED"]);

// Forma de pagamento do Visora -> tipo de cobrança do Asaas.
// Qualquer outra (débito, carteira) vira UNDEFINED: o cliente escolhe na fatura.
const TIPOS = { pix: "PIX", boleto: "BOLETO", cartao_credito: "CREDIT_CARD" };

// Padrão = SANDBOX. Só aponta para produção se você mudar ASAAS_API_URL de propósito.
const baseUrl = () => (process.env.ASAAS_API_URL || "https://sandbox.asaas.com/api/v3").replace(/\/+$/, "");

export const gatewayConfigurado = () => Boolean(process.env.ASAAS_API_KEY);
export const statusPago = (status) => STATUS_PAGOS.has(status);

const dataVencimento = (dias) => new Date(Date.now() + dias * 86_400_000).toISOString().slice(0, 10);

async function chamar(metodo, caminho, corpo) {
  let resposta;
  try {
    resposta = await fetch(`${baseUrl()}${caminho}`, {
      method: metodo,
      headers: {
        "Content-Type": "application/json",
        access_token: process.env.ASAAS_API_KEY,
        "User-Agent": "Visora/1.0",
      },
      body: corpo ? JSON.stringify(corpo) : undefined,
      signal: AbortSignal.timeout(15_000),
    });
  } catch (error) {
    console.error("[asaas] falha de rede:", error.message);
    throw new AppError("Não foi possível falar com o gateway de pagamento. Tente novamente.", 502);
  }

  const dados = await resposta.json().catch(() => null);
  if (!resposta.ok) {
    // O detalhe completo fica só no log do servidor (nunca a chave).
    console.error(`[asaas] ${metodo} ${caminho} -> ${resposta.status}`, JSON.stringify(dados));
    const motivo = dados?.errors?.[0]?.description;
    throw new AppError(motivo ? `Gateway de pagamento: ${motivo}` : "O gateway de pagamento recusou a requisição.", 502);
  }
  return dados;
}

// Cria cliente + cobrança (e o QR Code, se for PIX). Retorna { id, url, pix? }.
export async function criarCobranca({ codigo, valor, plano, metodo, usuario, empresa }) {
  const cliente = await chamar("POST", "/customers", {
    name: empresa.tipoDocumento === "CNPJ" ? empresa.razaoSocial : usuario.nome,
    cpfCnpj: empresa.documento,
    email: usuario.email,
    externalReference: codigo,
    notificationDisabled: true, // quem avisa o cliente é a Visora, não o Asaas
  });

  const cobranca = await chamar("POST", "/payments", {
    customer: cliente.id,
    billingType: TIPOS[metodo] ?? "UNDEFINED",
    value: Number(valor.toFixed(2)),
    dueDate: dataVencimento(3),
    description: `Visora - Plano ${plano}`.slice(0, 500),
    externalReference: codigo, // volta no webhook: é assim que achamos a contratação
  });

  const resultado = { id: cobranca.id, url: cobranca.invoiceUrl ?? cobranca.bankSlipUrl ?? null };

  if (metodo === "pix") {
    const qr = await chamar("GET", `/payments/${cobranca.id}/pixQrCode`);
    resultado.pix = { qrCodeBase64: qr.encodedImage, copiaECola: qr.payload, expiraEm: qr.expirationDate };
  }
  return resultado;
}

export async function consultarStatusCobranca(gatewayId) {
  const cobranca = await chamar("GET", `/payments/${encodeURIComponent(gatewayId)}`);
  return cobranca.status;
}
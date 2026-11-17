
import { AppError } from "../utils/AppError.js";

// ==========================================
// CONFIGURAÇÕES
// ==========================================

const STATUS_PAGOS = new Set([
  "RECEIVED",
  "CONFIRMED",
  "RECEIVED_IN_CASH",
]);

export const EVENTOS_PAGAMENTO = new Set([
  "PAYMENT_RECEIVED",
  "PAYMENT_CONFIRMED",
]);

const TIPOS = {
  pix: "PIX",
  boleto: "BOLETO",
  cartao_credito: "CREDIT_CARD",
};

const baseUrl = () =>
  (
    process.env.ASAAS_API_URL ||
    "https://sandbox.asaas.com/api/v3"
  ).replace(/\/+$/, "");

export const gatewayConfigurado = () =>
  Boolean(process.env.ASAAS_API_KEY);

export const statusPago = (status) =>
  STATUS_PAGOS.has(status);

function dataVencimento(dias) {
  const data = new Date();

  data.setDate(data.getDate() + dias);

  return data.toISOString().slice(0, 10);
}

// ==========================================
// COMUNICAÇÃO COM O ASAAS
// ==========================================

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
      signal: AbortSignal.timeout(15000),
    });
  } catch (erro) {
    console.error("[asaas] Erro de conexão:", erro.message);

    throw new AppError(
      "Não foi possível conectar ao Asaas.",
      502
    );
  }

  const dados = await resposta.json().catch(() => null);

  if (!resposta.ok) {
    console.error(
      `[asaas] ${metodo} ${caminho}:`,
      JSON.stringify(dados)
    );

    throw new AppError(
      dados?.errors?.[0]?.description ||
        "O Asaas recusou a requisição.",
      502
    );
  }

  return dados;
}

// ==========================================
// CRIAR CLIENTE
// ==========================================

export async function criarClienteAsaas({
  usuario,
  empresa,
}) {
  const cliente = await chamar("POST", "/customers", {
    name:
      empresa.tipoDocumento === "CNPJ"
        ? empresa.razaoSocial
        : usuario.nome,

    cpfCnpj: empresa.documento,
    email: usuario.email,
    notificationDisabled: true,
  });

  return cliente.id;
}

// ==========================================
// CONSULTAR CLIENTE
// ==========================================

export async function consultarClienteAsaas(clienteId) {
  return chamar(
    "GET",
    `/customers/${encodeURIComponent(clienteId)}`
  );
}

// ==========================================
// CONSULTAR DADOS DO PIX
// ==========================================

export async function consultarPix(gatewayId) {
  const qr = await chamar(
    "GET",
    `/payments/${encodeURIComponent(gatewayId)}/pixQrCode`
  );

  return {
    qrCodeBase64: qr.encodedImage,
    copiaECola: qr.payload,
    expiraEm: qr.expirationDate,
  };
}

// ==========================================
// CONSULTAR DADOS DO BOLETO
// ==========================================

export async function consultarBoleto(gatewayId) {
  const boleto = await chamar(
    "GET",
    `/payments/${encodeURIComponent(gatewayId)}/identificationField`
  );

  return {
    linhaDigitavel: boleto.identificationField,
    codigoBarras: boleto.barCode || null,
  };
}

// ==========================================
// CRIAR COBRANÇA
// ==========================================

export async function criarCobranca({
  codigo,
  valor,
  plano,
  metodo,
  usuario,
  empresa,
  clienteId = null,
}) {
  if (!TIPOS[metodo]) {
    throw new AppError(
      "Forma de pagamento inválida.",
      400
    );
  }

  // Reutiliza o cliente existente.
  const idCliente =
    clienteId ||
    (await criarClienteAsaas({ usuario, empresa }));

  // Cria a cobrança no Asaas.
  const cobranca = await chamar("POST", "/payments", {
    customer: idCliente,
    billingType: TIPOS[metodo],
    value: Number(Number(valor).toFixed(2)),
    dueDate: dataVencimento(3),
    description: `Visora - Plano ${plano}`.slice(0, 500),
    externalReference: codigo,
  });

  const resultado = {
    id: cobranca.id,
    url:
      cobranca.invoiceUrl ||
      cobranca.bankSlipUrl ||
      null,
    clienteId: idCliente,
    metodo,
    status: cobranca.status,
    vencimento: cobranca.dueDate,
  };

  // ========================================
  // PIX
  // ========================================

  if (metodo === "pix") {
    resultado.pix = await consultarPix(cobranca.id);
  }

  // ========================================
  // BOLETO
  // ========================================

  if (metodo === "boleto") {
    const boleto = await consultarBoleto(cobranca.id);

    resultado.boleto = {
      url:
        cobranca.bankSlipUrl ||
        cobranca.invoiceUrl ||
        null,
      linhaDigitavel: boleto.linhaDigitavel,
      codigoBarras: boleto.codigoBarras,
      vencimento: cobranca.dueDate,
    };
  }

  // ========================================
  // CARTÃO DE CRÉDITO
  // ========================================

  if (metodo === "cartao_credito") {
    resultado.cartao = {
      urlPagamento: cobranca.invoiceUrl || null,
      mensagem:
        "Abra a página segura do Asaas para informar os dados do cartão.",
    };
  }

  return resultado;
}

// ==========================================
// CONSULTAR STATUS DA COBRANÇA
// ==========================================

export async function consultarStatusCobranca(gatewayId) {
  const cobranca = await chamar(
    "GET",
    `/payments/${encodeURIComponent(gatewayId)}`
  );

  return cobranca.status;
}

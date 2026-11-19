import { createHash, timingSafeEqual } from "node:crypto";

import { AppError } from "../utils/AppError.js";
import { buscarGateway, confirmarPagamento } from "../services/contratacaoService.js";
import { EVENTOS_PAGAMENTO } from "../services/asaasService.js";

function tokensIguais(a, b) {
  const ha = createHash("sha256").update(String(a ?? "")).digest();
  const hb = createHash("sha256").update(String(b ?? "")).digest();
  return timingSafeEqual(ha, hb);
}

export async function receberWebhookAsaas(request, response) {
  const esperado = process.env.ASAAS_WEBHOOK_TOKEN;
  if (!esperado || !tokensIguais(request.get("asaas-access-token"), esperado)) {
    return response.status(401).json({ message: "Não autorizado." });
  }

  const { event, payment } = request.body ?? {};

  if (!EVENTOS_PAGAMENTO.has(event) || !payment?.externalReference || !payment?.id) {
    return response.status(200).json({ ignorado: true });
  }

  try {
    const gateway = await buscarGateway(payment.externalReference);
    if (!gateway || gateway.gatewayId !== payment.id) {
      console.warn("[webhook] cobrança desconhecida ou divergente:", payment.id);
      return response.status(200).json({ ignorado: true });
    }

    await confirmarPagamento(payment.externalReference);
    return response.status(200).json({ ok: true });
  } catch (error) {
    if (error instanceof AppError && error.status < 500) {
      console.warn("[webhook] não processado:", error.message);
      return response.status(200).json({ ignorado: true });
    }
    console.error("[webhook] erro ao processar:", error);
    return response.status(500).json({ message: "Erro ao processar o evento." });
  }
}
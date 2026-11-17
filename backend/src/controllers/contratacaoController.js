import { AppError } from "../utils/AppError.js";
import { apenasDigitos, emailValido, validarContratacao } from "../utils/documento.js";
import { buscarGateway, buscarResumo, confirmarPagamento, criarContratacao, verificarDisponibilidade } from "../services/contratacaoService.js";
import { consultarStatusCobranca, criarCobranca, gatewayConfigurado, statusPago } from "../services/asaasService.js";
import { gerarReciboPdf } from "../services/reciboService.js";

const modo = () => process.env.PAGAMENTO_MODO || (process.env.PAGAMENTO_SIMULADO === "true" ? "simulado" : "asaas");

const ultimaConsulta = new Map();
const INTERVALO_MS = 4_000;

export async function validarDisponibilidade(request, response, next) {
  try {
    const email = String(request.body?.email ?? "").trim().toLowerCase() || null;
    const documento = apenasDigitos(request.body?.documento) || null;
    if (email && !emailValido(email)) throw new AppError("E-mail inválido.", 400);

    response.json(await verificarDisponibilidade({ email, documento }));
  } catch (error) {
    next(error);
  }
}

export async function iniciarContratacao(request, response, next) {
  try {
    const { erros, dados } = validarContratacao(request.body);
    if (Object.keys(erros).length > 0) throw new AppError("Dados inválidos", 400, erros);

    const emAsaas = modo() === "asaas";
    if (emAsaas && !gatewayConfigurado()) {
      console.error("[pagamento] ASAAS_API_KEY não configurada.");
      throw new AppError("O pagamento está temporariamente indisponível.", 503);
    }

    const contratacao = await criarContratacao(dados, emAsaas ? criarCobranca : null);
    const resposta = {
      codigo: contratacao.codigo,
      metodo: contratacao.metodo,
      valor: contratacao.valor,
      plano: contratacao.plano,
      status: "pendente",
      modo: modo(),
    };

    
if (emAsaas) {
  const gateway = contratacao.gateway;

  resposta.urlPagamento = gateway.url;

  // PIX
  if (gateway.pix) {
    resposta.pix = gateway.pix;
  }

  // BOLETO
  if (gateway.boleto) {
    resposta.boleto = gateway.boleto;
  }

  // CARTÃO DE CRÉDITO
  if (gateway.cartao) {
    resposta.cartao = gateway.cartao;
  }
}
 else if (dados.metodo.startsWith("cartao")) {
      // Simulação: cartão aprova na hora.
      await confirmarPagamento(contratacao.codigo);
      resposta.status = "aprovado";
    } else if (dados.metodo === "pix") {
      resposta.pix = { copiaECola: `PIX-SIMULADO|${contratacao.codigo}|${contratacao.valor.toFixed(2)}` };
    }

    response.status(201).json(resposta);
  } catch (error) {
    next(error);
  }
}

export async function consultarContratacao(request, response, next) {
  try {
    const { codigo } = request.params;
    let resumo = await buscarResumo(codigo);

    if (resumo.pagamento.status === "pendente" && modo() === "asaas" && gatewayConfigurado()) {
      const agora = Date.now();
      if (agora - (ultimaConsulta.get(codigo) ?? 0) >= INTERVALO_MS) {
        ultimaConsulta.set(codigo, agora);
        try {
          const gateway = await buscarGateway(codigo);
          if (gateway?.gatewayId && statusPago(await consultarStatusCobranca(gateway.gatewayId))) {
            await confirmarPagamento(codigo);
            resumo = await buscarResumo(codigo);
          }
        } catch (error) {
          console.error("[pagamento] consulta ao gateway falhou:", error.message); // tenta de novo no próximo ciclo
        }
      }
    }

    response.json(resumo);
  } catch (error) {
    next(error);
  }
}

export async function confirmarSimulado(request, response, next) {
  try {
    if (modo() !== "simulado") throw new AppError("Rota indisponível.", 404);
    await confirmarPagamento(request.params.codigo);
    response.json(await buscarResumo(request.params.codigo));
  } catch (error) {
    next(error);
  }
}

export async function baixarRecibo(request, response, next) {
  try {
    const resumo = await buscarResumo(request.params.codigo);
    if (resumo.pagamento.status !== "aprovado") {
      throw new AppError("O recibo só fica disponível após a confirmação do pagamento.", 409);
    }
    response.setHeader("Content-Type", "application/pdf");
    response.setHeader("Content-Disposition", `attachment; filename="recibo-visora-${resumo.pagamento.codigo.slice(0, 8)}.pdf"`);
    gerarReciboPdf(resumo, response);
  } catch (error) {
    next(error);
  }
}
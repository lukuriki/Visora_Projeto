// AQUI VÃO PUXAR AS INFORMAÇÕES DO BACK PAR AO FRONT
const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api";

async function requisicao(endpoint, opcoes = {}) {
  const resposta = await fetch(`${API_URL}${endpoint}`, {
    ...opcoes,
    headers: {
      "Content-Type": "application/json",
      ...opcoes.headers,
    },
  });

  const dados = await resposta.json().catch(() => null);

  if (!resposta.ok) {
    // "erros" traz o motivo campo a campo (ex.: "CPF inválido.")
    const detalhes = dados?.erros ? ` ${Object.values(dados.erros).join(" ")}` : "";
    throw new Error(
      (dados?.message || dados?.erro || `Erro HTTP ${resposta.status}`) + detalhes
    );
  }

  return dados;
}

// Buscar todos os planos
export async function buscarPlanos() {
  return requisicao("/planos");
}

// Buscar um plano pelo ID
export async function buscarPlanoPorId(id) {
  return requisicao(`/planos/${id}`);
}

export async function cadastrarContratacao(dados) {
  return requisicao("/contratacoes", {
    method: "POST",
    body: JSON.stringify(dados),
  });
}

// Status do pagamento + dados para o recibo (usado de 4 em 4 s enquanto espera o PIX)
export async function consultarContratacao(codigo) {
  return requisicao(`/contratacoes/${encodeURIComponent(codigo)}`);
}

// Só funciona com o back em modo "simulado" (demonstração sem gateway)
export async function confirmarPagamentoSimulado(codigo) {
  return requisicao(`/contratacoes/${encodeURIComponent(codigo)}/confirmar-simulado`, {
    method: "POST",
  });
}

// Endereço do PDF do recibo (o navegador baixa direto)
export function urlReciboContratacao(codigo) {
  return `${API_URL}/contratacoes/${encodeURIComponent(codigo)}/recibo`;
}

// Define a senha a partir do link enviado por e-mail
export async function ativarConta({ token, senha }) {
  return requisicao("/contas/ativar", {
    method: "POST",
    body: JSON.stringify({ token, senha }),
  });
}
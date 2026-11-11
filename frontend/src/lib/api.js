
// ==========================================
// CONFIGURAÇÃO DA API
// ==========================================

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api";


// ==========================================
// FUNÇÃO PADRÃO DE REQUISIÇÃO
// ==========================================

async function requisicao(endpoint, opcoes = {}) {
  const { token, ...config } = opcoes;

  const resposta = await fetch(`${API_URL}${endpoint}`, {
    ...config,
    headers: {
      "Content-Type": "application/json",

      ...(token && {
        Authorization: `Bearer ${token}`,
      }),

      ...config.headers,
    },
  });

  const dados = await resposta.json().catch(() => null);

  if (!resposta.ok) {
    const detalhes = dados?.erros
      ? ` ${Object.values(dados.erros).join(" ")}`
      : "";

    throw new Error(
      (dados?.mensagem ||
        dados?.message ||
        dados?.erro ||
        `Erro HTTP ${resposta.status}`) + detalhes
    );
  }

  return dados;
}


// ==========================================
// PLANOS
// ==========================================

// Buscar todos os planos.
export async function buscarPlanos() {
  return requisicao("/planos");
}

// Buscar um plano pelo ID.
export async function buscarPlanoPorId(id) {
  return requisicao(`/planos/${id}`);
}


// ==========================================
// CONTRATAÇÕES E PAGAMENTOS
// ==========================================

// Cadastrar uma contratação.
export async function cadastrarContratacao(dados) {
  return requisicao("/contratacoes", {
    method: "POST",
    body: JSON.stringify(dados),
  });
}

// Consultar status do pagamento e dados do recibo.
export async function consultarContratacao(codigo) {
  return requisicao(
    `/contratacoes/${encodeURIComponent(codigo)}`
  );
}

// Confirmar pagamento simulado.
export async function confirmarPagamentoSimulado(codigo) {
  return requisicao(
    `/contratacoes/${encodeURIComponent(codigo)}/confirmar-simulado`,
    {
      method: "POST",
    }
  );
}

// Endereço do PDF do recibo.
export function urlReciboContratacao(codigo) {
  return `${API_URL}/contratacoes/${encodeURIComponent(codigo)}/recibo`;
}


// ==========================================
// CONTAS E AUTENTICAÇÃO
// ==========================================

// Ativar conta e receber as credenciais geradas pelo backend.
export async function ativarConta({ token }) {
  return requisicao("/contas/ativar", {
    method: "POST",
    body: JSON.stringify({ token }),
  });
}

// Realizar login do usuário.
export async function login({ nomeUsuario, senha }) {
  return requisicao("/contas/login", {
    method: "POST",
    body: JSON.stringify({
      nomeUsuario,
      senha,
    }),
  });
}


// ==========================================
// CONVERSAS - ÁREA PÚBLICA
// ==========================================

// Criar uma conversa pelo formulário de contato.
export async function criarConversaContato(dados) {
  return requisicao("/conversas", {
    method: "POST",
    body: JSON.stringify(dados),
  });
}


// ==========================================
// CONVERSAS - ÁREA DO USUÁRIO
// ==========================================

// Buscar conversas do usuário autenticado.
export async function buscarMinhasConversas(token) {
  return requisicao("/conversas/minhas", {
    token,
  });
}

// Enviar mensagem em uma conversa.
export async function enviarMensagem(conversaId, dados, token) {
  return requisicao(`/conversas/${conversaId}/mensagens`, {
    method: "POST",
    token,
    body: JSON.stringify(dados),
  });
}

// Buscar mensagens de uma conversa do usuário.
// Depende da criação da rota protegida para clientes.
export async function buscarMensagensUsuario(conversaId, token) {
  return requisicao(`/conversas/minhas/${conversaId}/mensagens`, {
    token,
  });
}


// ==========================================
// CONVERSAS - ÁREA ADMINISTRATIVA
// ==========================================

// Buscar todas as conversas.
export async function buscarConversas(token) {
  return requisicao("/conversas", {
    token,
  });
}

// Buscar uma conversa específica.
export async function buscarConversaPorId(conversaId, token) {
  return requisicao(`/conversas/${conversaId}`, {
    token,
  });
}

// Buscar todas as mensagens de uma conversa.
export async function buscarMensagens(conversaId, token) {
  return requisicao(`/conversas/${conversaId}/mensagens`, {
    token,
  });
}

// Responder uma conversa.
export async function responderConversa(conversaId, mensagem, token) {
  return requisicao(`/conversas/${conversaId}/responder`, {
    method: "POST",
    token,
    body: JSON.stringify({
      mensagem,
    }),
  });
}

// Atualizar o status de uma conversa.
export async function atualizarStatusConversa(conversaId, status, token) {
  return requisicao(`/conversas/${conversaId}/status`, {
    method: "PATCH",
    token,
    body: JSON.stringify({
      status,
    }),
  });
}

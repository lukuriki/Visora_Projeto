


const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api";




async function requisicao(endpoint, opcoes = {}) {
  const { token, ...config } = opcoes;

  const headers = new Headers(config.headers ?? {});

  if (!headers.has("Content-Type") && config.body != null) {
    headers.set("Content-Type", "application/json");
  }

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }


  const rotasEmpresariais = [
    "/assinaturas",
    "/equipe",
    "/informacoes-contabeis",
    "/movimentacoes-bancarias",
    "/patrimonio",
    "/emprestimos",
    "/investimentos",
    "/analises",
    "/chat",
    "/auditoria",
  ];

  const rotaEmpresarial = rotasEmpresariais.some(
    (rota) =>
      endpoint === rota ||
      endpoint.startsWith(`${rota}/`) ||
      endpoint.startsWith(`${rota}?`)
  );

  const autenticado = headers.has("Authorization");

  if (rotaEmpresarial && autenticado) {
    const empresaId = obterEmpresaAtivaId();

    if (empresaId && !headers.has("X-Empresa-Id")) {
      headers.set("X-Empresa-Id", String(empresaId));
    }
  }

  
  const resposta = await fetch(`${API_URL}${endpoint}`, {
    ...config,
    headers,
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

export async function buscarPlanos() {
  return requisicao("/planos");
}

export async function buscarPlanoPorId(id) {
  return requisicao(`/planos/${id}`);
}




export async function cadastrarContratacao(dados) {
  return requisicao("/contratacoes", {
    method: "POST",
    body: JSON.stringify(dados),
  });
}

export async function consultarContratacao(codigo) {
  return requisicao(
    `/contratacoes/${encodeURIComponent(codigo)}`
  );
}

export async function confirmarPagamentoSimulado(codigo) {
  return requisicao(
    `/contratacoes/${encodeURIComponent(codigo)}/confirmar-simulado`,
    {
      method: "POST",
    }
  );
}

export function urlReciboContratacao(codigo) {
  return `${API_URL}/contratacoes/${encodeURIComponent(codigo)}/recibo`;
}

export async function ativarConta({ token }) {
  return requisicao("/contas/ativar", {
    method: "POST",
    body: JSON.stringify({ token }),
  });
}

export async function login({ identificador, senha }) {
  return requisicao("/contas/login", {
    method: "POST",
    body: JSON.stringify({
      identificador: identificador.trim(),
      senha,
    }),
  });
}


export async function criarConversaContato(dados) {
  return requisicao("/conversas", {
    method: "POST",
    body: JSON.stringify(dados),
  });
}



export async function buscarMinhasConversas(token) {
  return requisicao("/conversas/minhas", {
    token,
  });
}

export async function enviarMensagem(conversaId, dados, token) {
  return requisicao(`/conversas/${conversaId}/mensagens`, {
    method: "POST",
    token,
    body: JSON.stringify(dados),
  });
}

export async function buscarMensagensUsuario(conversaId, token) {
  return requisicao(`/conversas/minhas/${conversaId}/mensagens`, {
    token,
  });
}



export async function buscarConversas(token) {
  return requisicao("/conversas", {
    token,
  });
}

export async function buscarConversaPorId(conversaId, token) {
  return requisicao(`/conversas/${conversaId}`, {
    token,
  });
}

export async function buscarMensagens(conversaId, token) {
  return requisicao(`/conversas/${conversaId}/mensagens`, {
    token,
  });
}

export async function responderConversa(conversaId, mensagem, token) {
  return requisicao(`/conversas/${conversaId}/responder`, {
    method: "POST",
    token,
    body: JSON.stringify({
      mensagem,
    }),
  });
}

export async function atualizarStatusConversa(conversaId, status, token) {
  return requisicao(`/conversas/${conversaId}/status`, {
    method: "PATCH",
    token,
    body: JSON.stringify({
      status,
    }),
  });
}


export async function buscarPerfilUsuario(token, empresaId = null) {
  empresaId = empresaId ?? obterEmpresaAtivaId();

  return requisicao("/contas/perfil", {
    token,
    headers: empresaId
      ? { "X-Empresa-Id": String(empresaId) }
      : {},
  });
}

export async function atualizarPerfilUsuario(token, dados) {
  return requisicao("/contas/perfil", {
    method: "PUT",
    token,
    body: JSON.stringify(dados),
  });
}

export async function alterarSenhaUsuario(token, dados) {
  return requisicao("/contas/senha", {
    method: "PATCH",
    token,
    body: JSON.stringify(dados),
  });
}


function validarEmpresaAssinatura(empresaId) {
  const id = Number(empresaId);

  if (!Number.isSafeInteger(id) || id <= 0) {
    throw new Error("Selecione uma empresa válida.");
  }

  return id;
}

export async function buscarAssinatura(token, empresaId = null) {
  const id = validarEmpresaAssinatura(
    empresaId ?? obterEmpresaAtivaId()
  );

  return requisicao(`/assinaturas?empresaId=${id}`, {
    method: "GET",
    token,
    headers: {
      "X-Empresa-Id": String(id),
    },
    cache: "no-store",
  });
}

export async function buscarPlanosAssinatura(token, empresaId = null) {
  const id = validarEmpresaAssinatura(
    empresaId ?? obterEmpresaAtivaId()
  );

  return requisicao(`/assinaturas/planos?empresaId=${id}`, {
    method: "GET",
    token,
    headers: {
      "X-Empresa-Id": String(id),
    },
    cache: "no-store",
  });
}

export async function alterarFormaPagamento(token, metodo, empresaId) {
  const id = validarEmpresaAssinatura(empresaId);

  return requisicao("/assinaturas/pagamento", {
    method: "PATCH",
    token,
    headers: {
      "X-Empresa-Id": String(id),
    },
    body: JSON.stringify({
      metodo,
      empresaId: id,
    }),
  });
}

export async function trocarPlano(token, planoId, metodo, empresaId) {
  const id = validarEmpresaAssinatura(empresaId);

  return requisicao("/assinaturas/trocar-plano", {
    method: "POST",
    token,
    headers: {
      "X-Empresa-Id": String(id),
    },
    body: JSON.stringify({
      planoId,
      metodo,
      empresaId: id,
    }),
  });
}

export async function consultarPagamentoTroca(token, codigo, empresaId) {
  const id = validarEmpresaAssinatura(empresaId);

  return requisicao(
    `/assinaturas/troca/${encodeURIComponent(codigo)}?empresaId=${id}`,
    {
      method: "GET",
      token,
      headers: {
        "X-Empresa-Id": String(id),
      },
      cache: "no-store",
    }
  );
}




export async function buscarEquipe(token) {
  return requisicao("/equipe", {
    method: "GET",
    token,
  });
}

export async function convidarColaborador(email, token) {
  return requisicao("/equipe/convites", {
    method: "POST",
    token,
    body: JSON.stringify({ email }),
  });
}

export async function cancelarConviteEquipe(conviteId, token) {
  return requisicao(
    `/equipe/convites/${encodeURIComponent(conviteId)}/cancelar`,
    {
      method: "PATCH",
      token,
    }
  );
}

export async function removerColaboradorEquipe(usuarioId, token) {
  return requisicao(
    `/equipe/colaboradores/${encodeURIComponent(usuarioId)}`,
    {
      method: "DELETE",
      token,
    }
  );
}


export async function buscarConviteEquipe(tokenConvite) {
  return requisicao(
    `/equipe/convites/${encodeURIComponent(tokenConvite)}`,
    { method: "GET" }
  );
}

export async function ativarConviteEquipe(tokenConvite, nomeCompleto) {
  return requisicao("/equipe/convites/ativar", {
    method: "POST",
    body: JSON.stringify({
      token: tokenConvite,
      nomeCompleto,
    }),
  });
}

export async function buscarMembrosEquipe(token) {
  return requisicao("/equipe/membros", {
    method: "GET",
    token,
  });
}



export async function buscarEmpresaContabil(token) {
  return requisicao("/informacoes-contabeis/empresa", {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

export async function salvarEmpresaContabil(dados, token) {
  return requisicao("/informacoes-contabeis/empresa", {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(dados),
  });
}

export async function buscarIndicadoresContabeis(token) {
  return requisicao("/informacoes-contabeis/indicadores", {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}




export async function listarCategoriasContabeis(token) {
  return requisicao("/informacoes-contabeis/categorias", {
    method: "GET",
    token,
  });
}

export async function criarCategoriaContabil(dados, token) {
  return requisicao("/informacoes-contabeis/categorias", {
    method: "POST",
    token,
    body: JSON.stringify(dados),
  });
}




export async function listarMovimentacoesContabeis(token, filtros = {}) {
  const parametros = new URLSearchParams();

  if (filtros.tipo) {
    parametros.set("tipo", filtros.tipo);
  }

  if (filtros.status) {
    parametros.set("status", filtros.status);
  }

  const query = parametros.toString();

  return requisicao(
    `/informacoes-contabeis/movimentacoes${
      query ? `?${query}` : ""
    }`,
    {
      method: "GET",
      token,
    }
  );
}

export async function buscarMovimentacaoContabilPorId(id, token) {
  return requisicao(
    `/informacoes-contabeis/movimentacoes/${encodeURIComponent(id)}`,
    {
      method: "GET",
      token,
    }
  );
}

export async function criarMovimentacaoContabil(dados, token) {
  return requisicao("/informacoes-contabeis/movimentacoes", {
    method: "POST",
    token,
    body: JSON.stringify(dados),
  });
}

export async function atualizarMovimentacaoContabil(id, dados, token) {
  return requisicao(
    `/informacoes-contabeis/movimentacoes/${encodeURIComponent(id)}`,
    {
      method: "PATCH",
      token,
      body: JSON.stringify(dados),
    }
  );
}

export async function excluirMovimentacaoContabil(id, token) {
  return requisicao(
    `/informacoes-contabeis/movimentacoes/${encodeURIComponent(id)}`,
    {
      method: "DELETE",
      token,
    }
  );
}



export async function listarPessoasContabeis(token) {
  return requisicao("/informacoes-contabeis/pessoas", {
    method: "GET",
    token,
  });
}

export async function buscarPessoaContabilPorId(id, token) {
  return requisicao(
    `/informacoes-contabeis/pessoas/${encodeURIComponent(id)}`,
    {
      method: "GET",
      token,
    }
  );
}

export async function criarPessoaContabil(dados, token) {
  return requisicao("/informacoes-contabeis/pessoas", {
    method: "POST",
    token,
    body: JSON.stringify(dados),
  });
}

export async function atualizarPessoaContabil(id, dados, token) {
  return requisicao(
    `/informacoes-contabeis/pessoas/${encodeURIComponent(id)}`,
    {
      method: "PATCH",
      token,
      body: JSON.stringify(dados),
    }
  );
}

export async function excluirPessoaContabil(id, token) {
  return requisicao(
    `/informacoes-contabeis/pessoas/${encodeURIComponent(id)}`,
    {
      method: "DELETE",
      token,
    }
  );
}



export async function listarContasBancarias(token) {
  return requisicao("/movimentacoes-bancarias/contas", {
    method: "GET",
    token,
  });
}

export async function buscarContaBancariaPorId(id, token) {
  return requisicao(
    `/movimentacoes-bancarias/contas/${encodeURIComponent(id)}`,
    {
      method: "GET",
      token,
    }
  );
}

export async function criarContaBancaria(dados, token) {
  return requisicao("/movimentacoes-bancarias/contas", {
    method: "POST",
    token,
    body: JSON.stringify(dados),
  });
}

export async function atualizarContaBancaria(id, dados, token) {
  return requisicao(
    `/movimentacoes-bancarias/contas/${encodeURIComponent(id)}`,
    {
      method: "PATCH",
      token,
      body: JSON.stringify(dados),
    }
  );
}

export async function excluirContaBancaria(id, token) {
  return requisicao(
    `/movimentacoes-bancarias/contas/${encodeURIComponent(id)}`,
    {
      method: "DELETE",
      token,
    }
  );
}



export async function listarMovimentacoesBancarias(
  token,
  filtros = {}
) {
  const parametros = new URLSearchParams();

  if (filtros.conta_bancaria_id) {
    parametros.set(
      "conta_bancaria_id",
      filtros.conta_bancaria_id
    );
  }

  if (filtros.tipo) {
    parametros.set("tipo", filtros.tipo);
  }

  if (filtros.data_inicio) {
    parametros.set("data_inicio", filtros.data_inicio);
  }

  if (filtros.data_fim) {
    parametros.set("data_fim", filtros.data_fim);
  }

  const query = parametros.toString();

  return requisicao(
    `/movimentacoes-bancarias/movimentacoes${
      query ? `?${query}` : ""
    }`,
    {
      method: "GET",
      token,
    }
  );
}

export async function buscarMovimentacaoBancariaPorId(id, token) {
  return requisicao(
    `/movimentacoes-bancarias/movimentacoes/${encodeURIComponent(id)}`,
    {
      method: "GET",
      token,
    }
  );
}

export async function criarMovimentacaoBancaria(dados, token) {
  return requisicao("/movimentacoes-bancarias/movimentacoes", {
    method: "POST",
    token,
    body: JSON.stringify(dados),
  });
}

export async function atualizarMovimentacaoBancaria(
  id,
  dados,
  token
) {
  return requisicao(
    `/movimentacoes-bancarias/movimentacoes/${encodeURIComponent(id)}`,
    {
      method: "PATCH",
      token,
      body: JSON.stringify(dados),
    }
  );
}

export async function excluirMovimentacaoBancaria(id, token) {
  return requisicao(
    `/movimentacoes-bancarias/movimentacoes/${encodeURIComponent(id)}`,
    {
      method: "DELETE",
      token,
    }
  );
}

export async function buscarSaldosBancarios(token) {
  return requisicao("/movimentacoes-bancarias/saldos", {
    method: "GET",
    token,
  });
}





export async function listarPatrimonios(token, filtros = {}) {
  const parametros = new URLSearchParams();

  if (filtros.tipo) {
    parametros.set("tipo", filtros.tipo);
  }

  const query = parametros.toString();

  return requisicao(
    `/patrimonio${query ? `?${query}` : ""}`,
    {
      method: "GET",
      token,
    }
  );
}

export async function buscarPatrimonioPorId(id, token) {
  return requisicao(
    `/patrimonio/${encodeURIComponent(id)}`,
    {
      method: "GET",
      token,
    }
  );
}

export async function criarPatrimonio(dados, token) {
  return requisicao("/patrimonio", {
    method: "POST",
    token,
    body: JSON.stringify(dados),
  });
}

export async function atualizarPatrimonio(id, dados, token) {
  return requisicao(
    `/patrimonio/${encodeURIComponent(id)}`,
    {
      method: "PUT",
      token,
      body: JSON.stringify(dados),
    }
  );
}

export async function excluirPatrimonio(id, token) {
  return requisicao(
    `/patrimonio/${encodeURIComponent(id)}`,
    {
      method: "DELETE",
      token,
    }
  );
}

export async function buscarResumoPatrimonio(token) {
  return requisicao("/patrimonio/resumo", {
    method: "GET",
    token,
  });
}




export async function listarEmprestimos(token) {
  return requisicao("/emprestimos", {
    method: "GET",
    token,
  });
}

export async function buscarEmprestimoPorId(id, token) {
  return requisicao(`/emprestimos/${encodeURIComponent(id)}`, {
    method: "GET",
    token,
  });
}

export async function criarEmprestimo(dados, token) {
  return requisicao("/emprestimos", {
    method: "POST",
    token,
    body: JSON.stringify(dados),
  });
}

export async function atualizarEmprestimo(id, dados, token) {
  return requisicao(`/emprestimos/${encodeURIComponent(id)}`, {
    method: "PUT",
    token,
    body: JSON.stringify(dados),
  });
}

export async function excluirEmprestimo(id, token) {
  return requisicao(`/emprestimos/${encodeURIComponent(id)}`, {
    method: "DELETE",
    token,
  });
}

export async function buscarResumoEmprestimos(token) {
  return requisicao("/emprestimos/resumo", {
    method: "GET",
    token,
  });
}



export async function listarInvestimentos(token) {
  return requisicao("/investimentos", {
    method: "GET",
    token,
  });
}

export async function buscarInvestimentoPorId(id, token) {
  return requisicao(`/investimentos/${encodeURIComponent(id)}`, {
    method: "GET",
    token,
  });
}

export async function criarInvestimento(dados, token) {
  return requisicao("/investimentos", {
    method: "POST",
    token,
    body: JSON.stringify(dados),
  });
}

export async function atualizarInvestimento(id, dados, token) {
  return requisicao(`/investimentos/${encodeURIComponent(id)}`, {
    method: "PUT",
    token,
    body: JSON.stringify(dados),
  });
}

export async function excluirInvestimento(id, token) {
  return requisicao(`/investimentos/${encodeURIComponent(id)}`, {
    method: "DELETE",
    token,
  });
}

export async function buscarResumoInvestimentos(token) {
  return requisicao("/investimentos/resumo", {
    method: "GET",
    token,
  });
}




export async function buscarAnalisesFinanceiras(
  token,
  periodo = "Últimos 6 meses"
) {
  const parametros = new URLSearchParams({ periodo });

  return requisicao(`/analises?${parametros.toString()}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}



export async function loginAdmin(email, senha) {
  return requisicao("/admin/login", {
    method: "POST",
    body: JSON.stringify({
      email,
      senha,
    }),
  });
}

export async function buscarPerfilAdmin(token) {
  return requisicao("/admin/perfil", {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}





export async function buscarDashboardAdmin(
  token,
  periodo = "Últimos 12 meses"
) {
  const parametros = new URLSearchParams({ periodo });

  return requisicao(
    `/admin/dashboard?${parametros.toString()}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
}




export async function enviarMensagemIA(
  mensagem,
  token,
  sessaoId = null
) {
  return requisicao("/chat/mensagem", {
    method: "POST",
    token,
    body: JSON.stringify({
      mensagem,
      ...(sessaoId ? { sessao_id: sessaoId } : {}),
    }),
  });
}

export async function buscarHistoricoIA(sessaoId, token) {
  return requisicao(
    `/chat/historico/${encodeURIComponent(sessaoId)}`,
    {
      method: "GET",
      token,
    }
  );
}

export async function listarConversasIA(token) {
  return requisicao("/chat/conversas", {
    method: "GET",
    token,
    cache: "no-store",
  });
}





export async function solicitarRecuperacaoSenha(email) {
  return requisicao("/contas/esqueceu-senha", {
    method: "POST",
    body: JSON.stringify({
      email: email.trim().toLowerCase(),
    }),
  });
}

export async function solicitarRecuperacaoUsuario(email) {
  return requisicao("/contas/esqueceu-usuario", {
    method: "POST",
    body: JSON.stringify({
      email: email.trim(),
    }),
  });
}

export async function redefinirSenha(token) {
  return requisicao("/contas/redefinir-senha", {
    method: "POST",
    body: JSON.stringify({ token }),
  });
}



function validarEmpresaAuditoria(empresaId) {
  const id = Number(empresaId);

  if (!Number.isSafeInteger(id) || id <= 0) {
    throw new Error("ID da empresa inválido.");
  }

  return id;
}

function validarTokenAuditoria(token) {
  if (typeof token !== "string" || !token.trim()) {
    throw new Error(
      "Sessão não encontrada. Faça login novamente."
    );
  }

  return token;
}




export async function buscarAuditoria(
  empresaId,
  token,
  filtros = {}
) {
  const id = validarEmpresaAuditoria(empresaId);
  validarTokenAuditoria(token);

  const parametros = new URLSearchParams();

  if (filtros.status) {
    parametros.set("status", filtros.status);
  }

  if (filtros.gravidade) {
    parametros.set("gravidade", filtros.gravidade);
  }

  if (filtros.tipo) {
    parametros.set("tipo", filtros.tipo);
  }

  if (filtros.pagina != null) {
    parametros.set("pagina", String(filtros.pagina));
  }

  if (filtros.limite != null) {
    parametros.set("limite", String(filtros.limite));
  }

  const query = parametros.toString();

  return requisicao(
    `/auditoria/${id}${query ? `?${query}` : ""}`,
    {
      method: "GET",
      token,
      cache: "no-store",
    }
  );
}



export async function buscarResumoAuditoria(empresaId, token) {
  const id = validarEmpresaAuditoria(empresaId);
  validarTokenAuditoria(token);

  return requisicao(`/auditoria/${id}/resumo`, {
    method: "GET",
    token,
    cache: "no-store",
  });
}



export async function buscarHistoricoAuditoria(empresaId, token) {
  const id = validarEmpresaAuditoria(empresaId);
  validarTokenAuditoria(token);

  return requisicao(`/auditoria/${id}/historico`, {
    method: "GET",
    token,
    cache: "no-store",
  });
}




export async function executarAuditoria(empresaId, token) {
  const id = validarEmpresaAuditoria(empresaId);
  validarTokenAuditoria(token);

  return requisicao(`/auditoria/${id}/executar`, {
    method: "POST",
    token,
    body: JSON.stringify({}),
  });
}




export async function atualizarStatusAuditoria(
  empresaId,
  apontamentoId,
  status,
  observacao,
  token
) {
  const id = validarEmpresaAuditoria(empresaId);
  validarTokenAuditoria(token);

  const idApontamento = Number(apontamentoId);

  if (
    !Number.isSafeInteger(idApontamento) ||
    idApontamento <= 0
  ) {
    throw new Error("ID do apontamento inválido.");
  }

  const statusPermitidos = [
    "pendente",
    "em_analise",
    "resolvido",
    "ignorado",
  ];

  if (!statusPermitidos.includes(status)) {
    throw new Error("Status da auditoria inválido.");
  }

  const observacaoLimpa =
    typeof observacao === "string"
      ? observacao.trim()
      : "";

  if (
    ["resolvido", "ignorado"].includes(status) &&
    !observacaoLimpa
  ) {
    throw new Error(
      "Informe uma justificativa para finalizar o apontamento."
    );
  }

  return requisicao(
    `/auditoria/${id}/apontamentos/${idApontamento}/status`,
    {
      method: "PATCH",
      token,
      body: JSON.stringify({
        status,
        observacao: observacaoLimpa,
      }),
    }
  );
}



export async function enviarMensagemAuditoria({
  empresaId,
  apontamentoId = null,
  mensagem,
  historico = [],
  token,
}) {
  const API_URL =
    process.env.NEXT_PUBLIC_API_URL ||
    "http://localhost:8080/api";

  if (!token) {
    throw new Error(
      "Sessão não encontrada. Faça login novamente."
    );
  }

  if (!empresaId) {
    throw new Error(
      "Não foi possível identificar a empresa."
    );
  }

  if (!mensagem?.trim()) {
    throw new Error("Digite uma mensagem.");
  }

  const response = await fetch(
    `${API_URL.replace(/\/+$/, "")}/auditoria/chat`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        empresaId,
        apontamentoId,
        mensagem: mensagem.trim(),
        historico,
      }),
    }
  );

  const dados = await response.json().catch(() => null);

  if (!response.ok || dados?.sucesso === false) {
    throw new Error(
      dados?.mensagem ||
      "Não foi possível enviar a mensagem ao Vion Auditoria."
    );
  }

  if (typeof dados?.resposta !== "string") {
    throw new Error(
      "O servidor retornou uma resposta inválida."
    );
  }

  return dados;
}



const CHAVE_EMPRESA_ATIVA = "visora-empresa-ativa";

export function obterEmpresaAtivaId() {
  if (typeof window === "undefined") {
    return null;
  }

  const valor = localStorage.getItem(CHAVE_EMPRESA_ATIVA);

  if (!valor) {
    return null;
  }

  const id = Number(valor);

  return Number.isSafeInteger(id) && id > 0
    ? id
    : null;
}

export function definirEmpresaAtivaId(empresaId) {
  if (typeof window === "undefined") {
    return;
  }

  const id = Number(empresaId);

  if (!Number.isSafeInteger(id) || id <= 0) {
    throw new Error("ID da empresa inválido.");
  }

  localStorage.setItem(CHAVE_EMPRESA_ATIVA, String(id));

  window.dispatchEvent(
    new CustomEvent("visora:empresa-alterada", {
      detail: { empresaId: id },
    })
  );
}

export function limparEmpresaAtiva() {
  if (typeof window === "undefined") {
    return;
  }

  localStorage.removeItem(CHAVE_EMPRESA_ATIVA);

  window.dispatchEvent(
    new CustomEvent("visora:empresa-alterada", {
      detail: { empresaId: null },
    })
  );
}




export async function buscarEmpresasUsuario(token) {
  return requisicao("/contas/empresas", {
    method: "GET",
    token,
    cache: "no-store",
  });
}



export async function pagarContratacaoComCartao(
  codigo,
  { creditCardToken, titular },
  autorizacao = null
) {
  if (!codigo || typeof codigo !== "string") {
    throw new Error("Código da contratação inválido.");
  }

  if (
    typeof creditCardToken !== "string" ||
    !creditCardToken.trim()
  ) {
    throw new Error("Token seguro do cartão não informado.");
  }

  if (
    !titular ||
    typeof titular !== "object" ||
    Array.isArray(titular)
  ) {
    throw new Error(
      "Informe os dados do titular do cartão."
    );
  }

  return requisicao(
    `/contratacoes/${encodeURIComponent(codigo)}/pagar-cartao`,
    {
      method: "POST",
      ...(autorizacao
        ? {
            headers: {
              "X-Contratacao-Token": autorizacao,
            },
          }
        : {}),
      body: JSON.stringify({
        creditCardToken: creditCardToken.trim(),
        titular,
      }),
      cache: "no-store",
    }
  );
}

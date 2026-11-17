
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

// Buscar os dados do usuário autenticado.
export async function buscarPerfilUsuario(token) {
  return requisicao("/contas/perfil", {
    token,
  });
}

// Buscar os dados do usuário autenticado.
export async function atualizarPerfilUsuario(token, dados) {
  return requisicao("/contas/perfil", {
    method: "PUT",
    token,
    body: JSON.stringify(dados),
  });
}

// Buscar os dados do usuário autenticado.
export async function alterarSenhaUsuario(token, dados) {
  return requisicao("/contas/senha", {
    method: "PATCH",
    token,
    body: JSON.stringify(dados),
  });
}



 
// ==========================================
// ASSINATURAS - VISORA
// ==========================================

// CONSULTAR ASSINATURA ATUAL
export async function buscarAssinatura(token) {
  return requisicao("/assinaturas", {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

// LISTAR PLANOS DISPONÍVEIS
export async function buscarPlanosAssinatura(token) {
  return requisicao("/assinaturas/planos", {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

// ALTERAR FORMA DE PAGAMENTO PREFERIDA
export async function alterarFormaPagamento(token, metodo) {
  return requisicao("/assinaturas/pagamento", {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      metodo,
    }),
  });
}

// SOLICITAR TROCA DE PLANO
export async function trocarPlano(token, planoId, metodo) {
  return requisicao("/assinaturas/trocar-plano", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      planoId,
      metodo,
    }),
  });
}

// CONSULTAR PAGAMENTO DA TROCA DE PLANO
export async function consultarPagamentoTroca(token, codigo) {
  return requisicao(
    `/assinaturas/troca/${encodeURIComponent(codigo)}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
}


 
// ==========================================
// GESTÃO DE EQUIPE - PROPRIETÁRIO
// ==========================================

// Listar colaboradores e convites da empresa.
export async function buscarEquipe(token) {
  return requisicao("/equipe", {
    method: "GET",
    token,
  });
}

// Enviar convite por e-mail para um colaborador.
export async function convidarColaborador(email, token) {
  return requisicao("/equipe/convites", {
    method: "POST",
    token,
    body: JSON.stringify({
      email,
    }),
  });
}

// Cancelar um convite pendente.
export async function cancelarConviteEquipe(conviteId, token) {
  return requisicao(
    `/equipe/convites/${encodeURIComponent(conviteId)}/cancelar`,
    {
      method: "PATCH",
      token,
    }
  );
}

// Remover um colaborador da empresa.
export async function removerColaboradorEquipe(usuarioId, token) {
  return requisicao(
    `/equipe/colaboradores/${encodeURIComponent(usuarioId)}`,
    {
      method: "DELETE",
      token,
    }
  );
}


// ==========================================
// CONVITES DE EQUIPE - ÁREA PÚBLICA
// ==========================================

// Consultar informações de um convite recebido por e-mail.
export async function buscarConviteEquipe(tokenConvite) {
  return requisicao(
    `/equipe/convites/${encodeURIComponent(tokenConvite)}`,
    {
      method: "GET",
    }
  );
}

// Ativar a conta do colaborador pelo convite.
export async function ativarConviteEquipe(tokenConvite, nomeCompleto) {
  return requisicao("/equipe/convites/ativar", {
    method: "POST",
    body: JSON.stringify({
      token: tokenConvite,
      nomeCompleto,
    }),
  });
}


// ==========================================
// EQUIPE - CONSULTAR MEMBROS
// ==========================================

 export async function buscarMembrosEquipe(token) {
   return requisicao("/equipe/membros", {
     method: "GET",
     token,
   });
 }


// ==========================================
// INFORMAÇÕES CONTÁBEIS - EMPRESA
// ==========================================

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


 
// ==========================================
// INFORMAÇÕES CONTÁBEIS - CATEGORIAS
// ==========================================

// LISTAR CATEGORIAS DA EMPRESA
export async function listarCategoriasContabeis(token) {
  return requisicao("/informacoes-contabeis/categorias", {
    method: "GET",
    token,
  });
}

// CADASTRAR NOVA CATEGORIA
export async function criarCategoriaContabil(dados, token) {
  return requisicao("/informacoes-contabeis/categorias", {
    method: "POST",
    token,
    body: JSON.stringify(dados),
  });
}


// ==========================================
// INFORMAÇÕES CONTÁBEIS - MOVIMENTAÇÕES
// ==========================================

// LISTAR MOVIMENTAÇÕES FINANCEIRAS
export async function listarMovimentacoesContabeis(
  token,
  filtros = {}
) {
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

// BUSCAR MOVIMENTAÇÃO PELO ID
export async function buscarMovimentacaoContabilPorId(
  id,
  token
) {
  return requisicao(
    `/informacoes-contabeis/movimentacoes/${encodeURIComponent(id)}`,
    {
      method: "GET",
      token,
    }
  );
}

// CADASTRAR NOVA MOVIMENTAÇÃO
export async function criarMovimentacaoContabil(
  dados,
  token
) {
  return requisicao("/informacoes-contabeis/movimentacoes", {
    method: "POST",
    token,
    body: JSON.stringify(dados),
  });
}

// ATUALIZAR MOVIMENTAÇÃO
export async function atualizarMovimentacaoContabil(
  id,
  dados,
  token
) {
  return requisicao(
    `/informacoes-contabeis/movimentacoes/${encodeURIComponent(id)}`,
    {
      method: "PATCH",
      token,
      body: JSON.stringify(dados),
    }
  );
}

// EXCLUIR MOVIMENTAÇÃO
export async function excluirMovimentacaoContabil(
  id,
  token
) {
  return requisicao(
    `/informacoes-contabeis/movimentacoes/${encodeURIComponent(id)}`,
    {
      method: "DELETE",
      token,
    }
  );
}



 
// ==========================================
// INFORMAÇÕES CONTÁBEIS - CLIENTES E FORNECEDORES
// ==========================================

// ==========================================
// LISTAR CLIENTES E FORNECEDORES
// ==========================================

export async function listarPessoasContabeis(token) {
  return requisicao("/informacoes-contabeis/pessoas", {
    method: "GET",
    token,
  });
}

// ==========================================
// BUSCAR CLIENTE OU FORNECEDOR POR ID
// ==========================================

export async function buscarPessoaContabilPorId(id, token) {
  return requisicao(
    `/informacoes-contabeis/pessoas/${encodeURIComponent(id)}`,
    {
      method: "GET",
      token,
    }
  );
}

// ==========================================
// CADASTRAR CLIENTE OU FORNECEDOR
// ==========================================

export async function criarPessoaContabil(dados, token) {
  return requisicao("/informacoes-contabeis/pessoas", {
    method: "POST",
    token,
    body: JSON.stringify(dados),
  });
}

// ==========================================
// ATUALIZAR CLIENTE OU FORNECEDOR
// ==========================================

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

// ==========================================
// EXCLUIR CLIENTE OU FORNECEDOR
// ==========================================

export async function excluirPessoaContabil(id, token) {
  return requisicao(
    `/informacoes-contabeis/pessoas/${encodeURIComponent(id)}`,
    {
      method: "DELETE",
      token,
    }
  );
}


 
// ==========================================
// MOVIMENTAÇÕES BANCÁRIAS - VISORA
// ==========================================

// ==========================================
// CONTAS BANCÁRIAS
// ==========================================

// LISTAR TODAS AS CONTAS BANCÁRIAS
export async function listarContasBancarias(token) {
  return requisicao("/movimentacoes-bancarias/contas", {
    method: "GET",
    token,
  });
}

// BUSCAR CONTA BANCÁRIA POR ID
export async function buscarContaBancariaPorId(id, token) {
  return requisicao(
    `/movimentacoes-bancarias/contas/${encodeURIComponent(id)}`,
    {
      method: "GET",
      token,
    }
  );
}

// CADASTRAR NOVA CONTA BANCÁRIA
export async function criarContaBancaria(dados, token) {
  return requisicao("/movimentacoes-bancarias/contas", {
    method: "POST",
    token,
    body: JSON.stringify(dados),
  });
}

// ATUALIZAR CONTA BANCÁRIA
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

// EXCLUIR CONTA BANCÁRIA
export async function excluirContaBancaria(id, token) {
  return requisicao(
    `/movimentacoes-bancarias/contas/${encodeURIComponent(id)}`,
    {
      method: "DELETE",
      token,
    }
  );
}

// ==========================================
// EXTRATO E MOVIMENTAÇÕES BANCÁRIAS
// ==========================================

// LISTAR MOVIMENTAÇÕES BANCÁRIAS COM FILTROS
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

// BUSCAR MOVIMENTAÇÃO BANCÁRIA POR ID
export async function buscarMovimentacaoBancariaPorId(
  id,
  token
) {
  return requisicao(
    `/movimentacoes-bancarias/movimentacoes/${encodeURIComponent(id)}`,
    {
      method: "GET",
      token,
    }
  );
}

// CADASTRAR ENTRADA OU SAÍDA BANCÁRIA
export async function criarMovimentacaoBancaria(
  dados,
  token
) {
  return requisicao(
    "/movimentacoes-bancarias/movimentacoes",
    {
      method: "POST",
      token,
      body: JSON.stringify(dados),
    }
  );
}

// ATUALIZAR MOVIMENTAÇÃO BANCÁRIA
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

// EXCLUIR MOVIMENTAÇÃO BANCÁRIA
export async function excluirMovimentacaoBancaria(
  id,
  token
) {
  return requisicao(
    `/movimentacoes-bancarias/movimentacoes/${encodeURIComponent(id)}`,
    {
      method: "DELETE",
      token,
    }
  );
}

// ==========================================
// SALDOS BANCÁRIOS
// ==========================================

// CONSULTAR SALDOS DE TODAS AS CONTAS
export async function buscarSaldosBancarios(token) {
  return requisicao("/movimentacoes-bancarias/saldos", {
    method: "GET",
    token,
  });
}



 
// ==========================================
// PATRIMÔNIO E ATIVOS - VISORA
// ==========================================

// ==========================================
// LISTAR PATRIMÔNIOS E ATIVOS
// ==========================================

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

// ==========================================
// BUSCAR PATRIMÔNIO POR ID
// ==========================================

export async function buscarPatrimonioPorId(id, token) {
  return requisicao(
    `/patrimonio/${encodeURIComponent(id)}`,
    {
      method: "GET",
      token,
    }
  );
}

// ==========================================
// CADASTRAR NOVO PATRIMÔNIO OU ATIVO
// ==========================================

export async function criarPatrimonio(dados, token) {
  return requisicao("/patrimonio", {
    method: "POST",
    token,
    body: JSON.stringify(dados),
  });
}

// ==========================================
// ATUALIZAR PATRIMÔNIO OU ATIVO
// ==========================================

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

// ==========================================
// EXCLUIR PATRIMÔNIO OU ATIVO
// ==========================================

export async function excluirPatrimonio(id, token) {
  return requisicao(
    `/patrimonio/${encodeURIComponent(id)}`,
    {
      method: "DELETE",
      token,
    }
  );
}

// ==========================================
// CONSULTAR RESUMO PATRIMONIAL
// ==========================================

export async function buscarResumoPatrimonio(token) {
  return requisicao("/patrimonio/resumo", {
    method: "GET",
    token,
  });
}



//
// ==========================================
// EMPRÉSTIMOS E FINANCIAMENTOS - VISORA
// ==========================================
//

// ==========================================
// LISTAR EMPRÉSTIMOS
// GET /api/emprestimos
// ==========================================

export async function listarEmprestimos(token) {
  return requisicao("/emprestimos", {
    method: "GET",
    token,
  });
}

// ==========================================
// BUSCAR EMPRÉSTIMO POR ID
// GET /api/emprestimos/:id
// ==========================================

export async function buscarEmprestimoPorId(id, token) {
  return requisicao(
    `/emprestimos/${encodeURIComponent(id)}`,
    {
      method: "GET",
      token,
    }
  );
}

// ==========================================
// CADASTRAR EMPRÉSTIMO
// POST /api/emprestimos
// ==========================================

export async function criarEmprestimo(dados, token) {
  return requisicao("/emprestimos", {
    method: "POST",
    token,
    body: JSON.stringify(dados),
  });
}

// ==========================================
// ATUALIZAR EMPRÉSTIMO
// PUT /api/emprestimos/:id
// ==========================================

export async function atualizarEmprestimo(
  id,
  dados,
  token
) {
  return requisicao(
    `/emprestimos/${encodeURIComponent(id)}`,
    {
      method: "PUT",
      token,
      body: JSON.stringify(dados),
    }
  );
}

// ==========================================
// EXCLUIR EMPRÉSTIMO
// DELETE /api/emprestimos/:id
// ==========================================

export async function excluirEmprestimo(id, token) {
  return requisicao(
    `/emprestimos/${encodeURIComponent(id)}`,
    {
      method: "DELETE",
      token,
    }
  );
}

// ==========================================
// BUSCAR RESUMO DOS EMPRÉSTIMOS
// GET /api/emprestimos/resumo
// ==========================================

export async function buscarResumoEmprestimos(token) {
  return requisicao("/emprestimos/resumo", {
    method: "GET",
    token,
  });
}



//
// ==========================================
// INVESTIMENTOS - VISORA
// ==========================================
//

// ==========================================
// LISTAR INVESTIMENTOS
// GET /api/investimentos
// ==========================================

export async function listarInvestimentos(token) {
  return requisicao("/investimentos", {
    method: "GET",
    token,
  });
}

// ==========================================
// BUSCAR INVESTIMENTO POR ID
// GET /api/investimentos/:id
// ==========================================

export async function buscarInvestimentoPorId(id, token) {
  return requisicao(
    `/investimentos/${encodeURIComponent(id)}`,
    {
      method: "GET",
      token,
    }
  );
}

// ==========================================
// CADASTRAR INVESTIMENTO
// POST /api/investimentos
// ==========================================

export async function criarInvestimento(dados, token) {
  return requisicao("/investimentos", {
    method: "POST",
    token,
    body: JSON.stringify(dados),
  });
}

// ==========================================
// ATUALIZAR INVESTIMENTO
// PUT /api/investimentos/:id
// ==========================================

export async function atualizarInvestimento(
  id,
  dados,
  token
) {
  return requisicao(
    `/investimentos/${encodeURIComponent(id)}`,
    {
      method: "PUT",
      token,
      body: JSON.stringify(dados),
    }
  );
}

// ==========================================
// EXCLUIR INVESTIMENTO
// DELETE /api/investimentos/:id
// ==========================================

export async function excluirInvestimento(id, token) {
  return requisicao(
    `/investimentos/${encodeURIComponent(id)}`,
    {
      method: "DELETE",
      token,
    }
  );
}

// ==========================================
// BUSCAR RESUMO DOS INVESTIMENTOS
// GET /api/investimentos/resumo
// ==========================================

export async function buscarResumoInvestimentos(token) {
  return requisicao("/investimentos/resumo", {
    method: "GET",
    token,
  });
}


//
// ==========================================
// ANÁLISES FINANCEIRAS - VISORA
// ==========================================
//

// ==========================================
// BUSCAR ANÁLISES FINANCEIRAS
// GET /api/analises
// ==========================================

export async function buscarAnalisesFinanceiras(
  token,
  periodo = "Últimos 6 meses"
) {
  const parametros = new URLSearchParams({
    periodo,
  });

  return requisicao(
    `/analises?${parametros.toString()}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
}

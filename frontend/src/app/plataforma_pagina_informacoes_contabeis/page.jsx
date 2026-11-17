
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Wallet, TrendingUp, TrendingDown, Receipt, Package, Landmark,
  Users, UsersRound, FileText, Building2, HandCoins,
  ChartNoAxesCombined, Search, Plus, Pencil, Trash2, X,
  ChevronRight, Save, CircleDollarSign, Filter, AlertCircle,
  CalendarClock, BarChart3, RefreshCw,
} from "lucide-react";

import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
} from "recharts";

import SidebarPlataforma from "@/components/SidebarPlataforma";

import {
  buscarEmpresaContabil,
  salvarEmpresaContabil,
  buscarIndicadoresContabeis,
  listarCategoriasContabeis,
  criarCategoriaContabil,
  listarMovimentacoesContabeis,
  criarMovimentacaoContabil,
  atualizarMovimentacaoContabil,
  excluirMovimentacaoContabil,
  listarPessoasContabeis,
  criarPessoaContabil,
  atualizarPessoaContabil,
  excluirPessoaContabil,

  // MOVIMENTAÇÕES BANCÁRIAS
  listarContasBancarias,
  criarContaBancaria,
  atualizarContaBancaria,
  excluirContaBancaria,
  listarMovimentacoesBancarias,
  criarMovimentacaoBancaria,
  atualizarMovimentacaoBancaria,
  excluirMovimentacaoBancaria,
  buscarSaldosBancarios,
  listarPatrimonios,
  criarPatrimonio,
  atualizarPatrimonio,
  excluirPatrimonio,
  buscarResumoPatrimonio,
  listarEmprestimos,
  criarEmprestimo,
  atualizarEmprestimo,
  excluirEmprestimo,
  buscarResumoEmprestimos,
  listarInvestimentos,
  criarInvestimento,
  atualizarInvestimento,
  excluirInvestimento,
  buscarResumoInvestimentos,
} from "@/lib/api";

// ==========================================
// CONFIGURAÇÕES
// ==========================================

const MODULOS = [
  { id: "receitas", nome: "Receitas e despesas", icon: Wallet },
  { id: "contas", nome: "Contas a pagar e receber", icon: Receipt },
  { id: "custos", nome: "Custos", icon: Package },
  { id: "bancos", nome: "Movimentações bancárias", icon: Landmark },
  { id: "pessoas", nome: "Fornecedores e clientes", icon: Users },
  { id: "folha", nome: "Folha de pagamento", icon: UsersRound },
  { id: "impostos", nome: "Impostos", icon: FileText },
  { id: "patrimonio", nome: "Patrimônio e ativos", icon: Building2 },
  { id: "emprestimos", nome: "Empréstimos e financiamentos", icon: HandCoins },
  { id: "investimentos", nome: "Investimentos", icon: ChartNoAxesCombined },
];

const TIPOS = [
  { valor: "receita", nome: "Receita" },
  { valor: "despesa", nome: "Despesa" },
  { valor: "custo", nome: "Custo" },
  { valor: "imposto", nome: "Imposto" },
];

const MODULOS_INTEGRADOS = [
  "receitas", "contas", "custos", "impostos", "pessoas", "bancos", "folha", "patrimonio", "emprestimos", "investimentos",
];

const FORM_PESSOA_VAZIO = {
  tipo: "cliente",
  nome_razao: "",
  documento: "",
  email: "",
  telefone: "",
};

const NOME_CATEGORIA_FOLHA = "Salários / Folha de Pagamento";

const FORM_CONTA_VAZIO = {
  nome_banco: "",
  tipo_conta: "corrente",
  saldo_inicial: "0",
};

const CLASSE_CAMPO =
  "w-full rounded-xl border border-[#DAD7CD] bg-[#FAFAF8] px-4 py-3 text-sm outline-none transition focus:border-[#7E9971] dark:border-[#34483A] dark:bg-[#17231B] dark:text-white disabled:opacity-60";

const CLASSE_CARTAO =
  "rounded-2xl border border-[#DAD7CD] bg-white shadow-sm dark:border-[#34483A] dark:bg-[#1C2920]";

const CLASSE_BOTAO =
  "inline-flex items-center justify-center gap-2 rounded-xl bg-[#344E41] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#588157] disabled:cursor-not-allowed disabled:opacity-50 dark:bg-[#588157] dark:hover:bg-[#6F9B6C]";

const CLASSE_BOTAO_SECUNDARIO =
  "inline-flex items-center justify-center gap-2 rounded-xl border border-[#DAD7CD] bg-white px-5 py-3 text-sm font-semibold transition hover:bg-[#F2F6EF] dark:border-[#34483A] dark:bg-[#1C2920] dark:hover:bg-[#26382B]";

const moeda = (valor) =>
  Number(valor || 0).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });

const dataBR = (data) =>
  data
    ? new Date(`${String(data).slice(0, 10)}T12:00:00`).toLocaleDateString("pt-BR")
    : "—";

const hojeISO = () => {
  const hoje = new Date();

  return [
    hoje.getFullYear(),
    String(hoje.getMonth() + 1).padStart(2, "0"),
    String(hoje.getDate()).padStart(2, "0"),
  ].join("-");
};

function obterToken() {
  if (typeof window === "undefined") return null;

  return (
    sessionStorage.getItem("visora-token") ||
    localStorage.getItem("visora-token") ||
    sessionStorage.getItem("token") ||
    localStorage.getItem("token")
  );
}

function formularioVazio(tipo = "receita") {
  return {
    tipo,
    categoria_id: "",
    descricao: "",
    valor: "",
    data_vencimento: hojeISO(),
    data_pagamento: "",
    status: "pendente",
    conta_bancaria_id: null,
    cliente_fornecedor_id: null,
  };
}

function formularioBancoVazio() {
  return {
    conta_bancaria_id: "",
    tipo: "entrada",
    descricao: "",
    valor: "",
    data_movimentacao: hojeISO(),
    categoria: "",
    observacoes: "",
    movimentacao_financeira_id: null,
  };
}

function normalizarEmpresa(dados = {}) {
  return {
    razao_social: dados.razao_social ?? "",
    email_empresa: dados.email_empresa ?? "",
    telefone_empresa: dados.telefone_empresa ?? "",
    tipo_documento: dados.tipo_documento ?? "CNPJ",
    documento_identificacao: dados.documento_identificacao ?? "",
    setor_atuacao: dados.setor_atuacao ?? "Outros",
    porte_empresa: dados.porte_empresa ?? "ME",
    regime_tributario: dados.regime_tributario ?? "Simples Nacional",
    perfil_risco: dados.perfil_risco ?? "Conservador",
    capital_inicial: dados.capital_inicial ?? 0,
    status: dados.status ?? "pendente",
  };
}

function rotuloStatus(item) {
  if (item.status === "cancelado") return "Cancelado";

  if (item.status === "pago") {
    return item.tipo === "receita" ? "Recebido" : "Pago";
  }

  if (item.data_vencimento < hojeISO()) return "Atrasado";

  return "Pendente";
}

function tituloTipo(tipo) {
  return TIPOS.find((item) => item.valor === tipo)?.nome || tipo;
}

// ==========================================
// COMPONENTES AUXILIARES
// ==========================================

function Campo({ label, children, className = "" }) {
  return (
    <label className={`block ${className}`}>
      <span className="mb-2 block text-sm font-semibold">{label}</span>
      {children}
    </label>
  );
}

function Modal({ titulo, subtitulo, fechar, children, maxWidth = "max-w-xl" }) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-black/50 p-4 backdrop-blur-[3px]">
      <div
        className={`my-auto w-full ${maxWidth} rounded-2xl border border-[#DAD7CD] bg-white p-6 shadow-2xl dark:border-[#34483A] dark:bg-[#1C2920] sm:p-7`}
      >
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold">{titulo}</h2>
            {subtitulo && (
              <p className="mt-1 text-sm text-[#89968B]">{subtitulo}</p>
            )}
          </div>

          <button
            type="button"
            onClick={fechar}
            className="rounded-lg p-2 transition hover:bg-[#EEF1EB] dark:hover:bg-[#2B3D30]"
            aria-label="Fechar"
          >
            <X size={20} />
          </button>
        </div>

        {children}
      </div>
    </div>
  );
}

function MensagemErro({ mensagem }) {
  if (!mensagem) return null;

  return (
    <p
      role="alert"
      className="mb-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/30 dark:text-red-300"
    >
      {mensagem}
    </p>
  );
}

// ==========================================
// PÁGINA PRINCIPAL
// ==========================================

export default function PlataformaInformacoesContabeis() {
  const [moduloAtivo, setModuloAtivo] = useState("receitas");

  // EMPRESA
  const [empresa, setEmpresa] = useState(null);
  const [perfilAcesso, setPerfilAcesso] = useState("");
  const [podeEditarEmpresa, setPodeEditarEmpresa] = useState(false);
  const [formEmpresa, setFormEmpresa] = useState(null);
  const [modalEmpresa, setModalEmpresa] = useState(false);
  const [salvandoEmpresa, setSalvandoEmpresa] = useState(false);
  const [erroEmpresa, setErroEmpresa] = useState("");

  // FINANCEIRO
  const [movimentacoes, setMovimentacoes] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [indicadores, setIndicadores] = useState({
    total_receitas: 0,
    total_despesas: 0,
    saldo_financeiro: 0,
    registros_cadastrados: 0,
  });

  const [modalRegistro, setModalRegistro] = useState(false);
  const [registroEditando, setRegistroEditando] = useState(null);
  const [form, setForm] = useState(formularioVazio);
  const [salvando, setSalvando] = useState(false);
  const [erroFormulario, setErroFormulario] = useState("");

  const [criandoCategoria, setCriandoCategoria] = useState(false);
  const [nomeCategoria, setNomeCategoria] = useState("");
  const [naturezaCategoria, setNaturezaCategoria] = useState("variavel");

  // FOLHA DE PAGAMENTO (REUTILIZA MOVIMENTAÇÕES E CATEGORIAS)
  const [modalFolha, setModalFolha] = useState(false);
  const [folhaEditando, setFolhaEditando] = useState(null);
  const [salvandoFolha, setSalvandoFolha] = useState(false);
  const [erroFolha, setErroFolha] = useState("");
  const [mesFolha, setMesFolha] = useState(hojeISO().slice(0, 7));
  const [situacaoFolha, setSituacaoFolha] = useState("Todos");
  const [formFolha, setFormFolha] = useState({
    competencia: hojeISO().slice(0, 7),
    descricao: "", valor: "", data_vencimento: hojeISO(),
    status: "pendente", data_pagamento: "",
  });

  // PATRIMÔNIO E ATIVOS
  const [patrimonios, setPatrimonios] = useState([]);
  const [resumoPatrimonio, setResumoPatrimonio] = useState(null);
  const [carregandoPatrimonio, setCarregandoPatrimonio] = useState(false);
  const [erroPatrimonio, setErroPatrimonio] = useState("");
  const [filtroTipoPatrimonio, setFiltroTipoPatrimonio] = useState("Todos");
  const [modalPatrimonio, setModalPatrimonio] = useState(false);
  const [patrimonioEditando, setPatrimonioEditando] = useState(null);
  const [salvandoPatrimonio, setSalvandoPatrimonio] = useState(false);
  const [erroFormularioPatrimonio, setErroFormularioPatrimonio] = useState("");
  const [formPatrimonio, setFormPatrimonio] = useState({
    tipo: "ativo", descricao: "", valor: "", data_registro: hojeISO(),
  });

  // EMPRÉSTIMOS E FINANCIAMENTOS
  const [emprestimos, setEmprestimos] = useState([]);
  const [resumoEmprestimos, setResumoEmprestimos] = useState(null);
  const [carregandoEmprestimos, setCarregandoEmprestimos] = useState(false);
  const [erroEmprestimos, setErroEmprestimos] = useState("");
  const [modalEmprestimo, setModalEmprestimo] = useState(false);
  const [emprestimoEditando, setEmprestimoEditando] = useState(null);
  const [salvandoEmprestimo, setSalvandoEmprestimo] = useState(false);
  const [erroFormularioEmprestimo, setErroFormularioEmprestimo] = useState("");
  const [formEmprestimo, setFormEmprestimo] = useState({
    descricao: "", valor: "", taxa_juros: "", data_registro: hojeISO(),
  });

  // INVESTIMENTOS
  const [investimentos, setInvestimentos] = useState([]);
  const [resumoInvestimentos, setResumoInvestimentos] = useState(null);
  const [carregandoInvestimentos, setCarregandoInvestimentos] = useState(false);
  const [erroInvestimentos, setErroInvestimentos] = useState("");
  const [modalInvestimento, setModalInvestimento] = useState(false);
  const [investimentoEditando, setInvestimentoEditando] = useState(null);
  const [salvandoInvestimento, setSalvandoInvestimento] = useState(false);
  const [erroFormularioInvestimento, setErroFormularioInvestimento] = useState("");
  const [formInvestimento, setFormInvestimento] = useState({
    descricao: "", valor: "", taxa_juros: "", data_registro: hojeISO(),
  });

  // CLIENTES E FORNECEDORES
  const [pessoas, setPessoas] = useState([]);
  const [modalPessoa, setModalPessoa] = useState(false);
  const [pessoaEditando, setPessoaEditando] = useState(null);
  const [formPessoa, setFormPessoa] = useState({ ...FORM_PESSOA_VAZIO });
  const [salvandoPessoa, setSalvandoPessoa] = useState(false);
  const [erroPessoa, setErroPessoa] = useState("");

  // BANCOS
  const [contasBancarias, setContasBancarias] = useState([]);
  const [movimentacoesBancarias, setMovimentacoesBancarias] = useState([]);
  const [saldosBancarios, setSaldosBancarios] = useState(null);

  const [carregandoBancos, setCarregandoBancos] = useState(false);
  const [erroBancos, setErroBancos] = useState("");

  const [modalContaBancaria, setModalContaBancaria] = useState(false);
  const [contaBancariaEditando, setContaBancariaEditando] = useState(null);
  const [formContaBancaria, setFormContaBancaria] = useState({
    ...FORM_CONTA_VAZIO,
  });

  const [modalMovimentacaoBancaria, setModalMovimentacaoBancaria] =
    useState(false);

  const [
    movimentacaoBancariaEditando,
    setMovimentacaoBancariaEditando,
  ] = useState(null);

  const [formMovimentacaoBancaria, setFormMovimentacaoBancaria] =
    useState(formularioBancoVazio);

  const [salvandoBanco, setSalvandoBanco] = useState(false);
  const [erroFormularioBanco, setErroFormularioBanco] = useState("");

  const [filtroContaBanco, setFiltroContaBanco] = useState("Todas");
  const [filtroTipoBanco, setFiltroTipoBanco] = useState("Todos");
  const [dataInicioBanco, setDataInicioBanco] = useState("");
  const [dataFimBanco, setDataFimBanco] = useState("");

  // ESTADOS GERAIS
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");
  const [aviso, setAviso] = useState("");
  const [busca, setBusca] = useState("");
  const [filtro, setFiltro] = useState("Todos");

  // ==========================================
  // CARREGAMENTO DOS DADOS
  // ==========================================

  const carregarDadosBancarios = useCallback(async () => {
    setCarregandoBancos(true);
    setErroBancos("");

    try {
      const token = obterToken();

      if (!token) {
        throw new Error("Sessão não encontrada. Faça login novamente.");
      }

      const [resContas, resMovimentacoes, resSaldos] = await Promise.all([
        listarContasBancarias(token),
        listarMovimentacoesBancarias(token),
        buscarSaldosBancarios(token),
      ]);

      setContasBancarias(resContas.contas || []);
      setMovimentacoesBancarias(resMovimentacoes.movimentacoes || []);
      setSaldosBancarios(resSaldos.saldos || null);
    } catch (e) {
      setErroBancos(
        e.message || "Não foi possível carregar os dados bancários."
      );
    } finally {
      setCarregandoBancos(false);
    }
  }, []);

  const carregarDadosPatrimonio = useCallback(async () => {
    setCarregandoPatrimonio(true);
    setErroPatrimonio("");
    try {
      const token = obterToken();
      if (!token) throw new Error("Sessão não encontrada. Faça login novamente.");
      const [lista, resumo] = await Promise.all([
        listarPatrimonios(token),
        buscarResumoPatrimonio(token),
      ]);
      setPatrimonios(Array.isArray(lista.patrimonios) ? lista.patrimonios : []);
      setResumoPatrimonio(resumo.resumo || null);
    } catch (e) {
      setErroPatrimonio(e.message || "Não foi possível carregar o patrimônio.");
    } finally {
      setCarregandoPatrimonio(false);
    }
  }, []);

  const carregarDadosEmprestimos = useCallback(async () => {
    setCarregandoEmprestimos(true);
    setErroEmprestimos("");
    try {
      const token = obterToken();
      if (!token) throw new Error("Sessão não encontrada. Faça login novamente.");
      const [lista, resumo] = await Promise.all([
        listarEmprestimos(token),
        buscarResumoEmprestimos(token),
      ]);
      setEmprestimos(Array.isArray(lista.emprestimos) ? lista.emprestimos : []);
      setResumoEmprestimos(resumo.resumo || null);
    } catch (e) {
      setErroEmprestimos(e.message || "Não foi possível carregar os empréstimos.");
    } finally {
      setCarregandoEmprestimos(false);
    }
  }, []);

  const carregarDadosInvestimentos = useCallback(async () => {
    setCarregandoInvestimentos(true);
    setErroInvestimentos("");
    try {
      const token = obterToken();
      if (!token) throw new Error("Sessão não encontrada. Faça login novamente.");
      const [lista, resumo] = await Promise.all([
        listarInvestimentos(token),
        buscarResumoInvestimentos(token),
      ]);
      setInvestimentos(Array.isArray(lista.investimentos) ? lista.investimentos : []);
      setResumoInvestimentos(resumo.resumo || null);
    } catch (e) {
      setErroInvestimentos(e.message || "Não foi possível carregar os investimentos.");
    } finally {
      setCarregandoInvestimentos(false);
    }
  }, []);

  const carregarDados = useCallback(async () => {
    setCarregando(true);
    setErro("");

    try {
      const token = obterToken();

      if (!token) {
        throw new Error("Sessão não encontrada. Faça login novamente.");
      }

      const [
        resEmpresa,
        resIndicadores,
        resCategorias,
        resMovimentacoes,
        resPessoas,
      ] = await Promise.all([
        buscarEmpresaContabil(token),
        buscarIndicadoresContabeis(token),
        listarCategoriasContabeis(token),
        listarMovimentacoesContabeis(token),
        listarPessoasContabeis(token),
      ]);

      setEmpresa(normalizarEmpresa(resEmpresa.empresa));
      setPerfilAcesso(resEmpresa.perfil_acesso || "");
      setPodeEditarEmpresa(Boolean(resEmpresa.pode_editar));
      setIndicadores(resIndicadores.indicadores || {});
      setCategorias(resCategorias.categorias || []);
      setMovimentacoes(resMovimentacoes.movimentacoes || []);
      setPessoas(resPessoas.pessoas || []);
    } catch (e) {
      setErro(
        e.message || "Não foi possível carregar os dados contábeis."
      );
    } finally {
      setCarregando(false);
    }
  }, []);

  const atualizarFinanceiro = useCallback(async () => {
    const token = obterToken();

    if (!token) throw new Error("Sessão não encontrada.");

    const [
      resIndicadores,
      resCategorias,
      resMovimentacoes,
      resPessoas,
    ] = await Promise.all([
      buscarIndicadoresContabeis(token),
      listarCategoriasContabeis(token),
      listarMovimentacoesContabeis(token),
      listarPessoasContabeis(token),
    ]);

    setIndicadores(resIndicadores.indicadores || {});
    setCategorias(resCategorias.categorias || []);
    setMovimentacoes(resMovimentacoes.movimentacoes || []);
    setPessoas(resPessoas.pessoas || []);
  }, []);

  useEffect(() => {
    carregarDados();
  }, [carregarDados]);

  useEffect(() => {
    if (moduloAtivo === "bancos") {
      carregarDadosBancarios();
    }
  }, [moduloAtivo, carregarDadosBancarios]);

  useEffect(() => {
    if (moduloAtivo === "patrimonio") carregarDadosPatrimonio();
  }, [moduloAtivo, carregarDadosPatrimonio]);

  useEffect(() => {
    if (moduloAtivo === "emprestimos") carregarDadosEmprestimos();
  }, [moduloAtivo, carregarDadosEmprestimos]);

  useEffect(() => {
    if (moduloAtivo === "investimentos") carregarDadosInvestimentos();
  }, [moduloAtivo, carregarDadosInvestimentos]);

  async function atualizarTudo() {
    await carregarDados();

    if (moduloAtivo === "bancos") {
      await carregarDadosBancarios();
    }
    if (moduloAtivo === "patrimonio") {
      await carregarDadosPatrimonio();
    }
    if (moduloAtivo === "emprestimos") {
      await carregarDadosEmprestimos();
    }
    if (moduloAtivo === "investimentos") {
      await carregarDadosInvestimentos();
    }
  }

  // ==========================================
  // DADOS DERIVADOS
  // ==========================================

  const modulo = MODULOS.find((item) => item.id === moduloAtivo);
  const IconeModulo = modulo.icon;
  const integrado = MODULOS_INTEGRADOS.includes(moduloAtivo);

  const registros = useMemo(() => {
    return movimentacoes.filter((item) => {
      if (moduloAtivo === "receitas") {
        return ["receita", "despesa"].includes(item.tipo);
      }

      if (moduloAtivo === "contas") {
        return item.status === "pendente";
      }

      if (moduloAtivo === "custos") return item.tipo === "custo";
      if (moduloAtivo === "impostos") return item.tipo === "imposto";

      return false;
    });
  }, [movimentacoes, moduloAtivo]);

  const registrosFiltrados = useMemo(() => {
    return registros.filter((item) => {
      const termo = busca.toLocaleLowerCase("pt-BR");

      const correspondeBusca =
        String(item.descricao || "").toLocaleLowerCase("pt-BR").includes(termo) ||
        String(item.categoria_nome || "").toLocaleLowerCase("pt-BR").includes(termo);

      return (
        correspondeBusca &&
        (filtro === "Todos" || rotuloStatus(item) === filtro)
      );
    });
  }, [registros, busca, filtro]);

  // A categoria de salários identifica os lançamentos sem criar tabelas.
  const categoriaFolha = categorias.find((item) =>
    item.tipo === "despesa" &&
    /sal[aá]rios|folha de pagamento/i.test(String(item.nome || ""))
  );

  const lancamentosFolha = useMemo(() => movimentacoes.filter((item) => {
    if (item.tipo !== "despesa") return false;
    return categorias.some((categoria) =>
      Number(categoria.id) === Number(item.categoria_id) &&
      categoria.tipo === "despesa" &&
      /sal[aá]rios|folha de pagamento/i.test(String(categoria.nome || ""))
    ) || /sal[aá]rios|folha de pagamento/i.test(String(item.categoria_nome || ""));
  }), [movimentacoes, categorias]);

  const folhasFiltradas = useMemo(() => lancamentosFolha.filter((item) => {
    const termo = busca.trim().toLocaleLowerCase("pt-BR");
    const dataCompetencia = String(item.data_vencimento || "").slice(0, 7);
    const texto = String(item.descricao || "").toLocaleLowerCase("pt-BR");
    const status = rotuloStatus(item);
    return (!mesFolha || dataCompetencia === mesFolha) &&
      (situacaoFolha === "Todos" || status === situacaoFolha) &&
      texto.includes(termo);
  }), [lancamentosFolha, busca, mesFolha, situacaoFolha]);

  const resumoFolha = useMemo(() => folhasFiltradas.reduce((acc, item) => {
    const valor = Number(item.valor || 0);
    if (item.status !== "cancelado") acc.previsto += valor;
    if (item.status === "pago") acc.pago += valor;
    if (item.status === "pendente") {
      acc.pendente += valor;
      if (String(item.data_vencimento).slice(0, 10) < hojeISO()) acc.atrasado += valor;
    }
    return acc;
  }, { previsto: 0, pago: 0, pendente: 0, atrasado: 0 }), [folhasFiltradas]);

  const patrimoniosFiltrados = useMemo(() => patrimonios.filter((item) => {
    const termo = busca.trim().toLocaleLowerCase("pt-BR");
    return (filtroTipoPatrimonio === "Todos" || item.tipo === filtroTipoPatrimonio) &&
      String(item.descricao || "").toLocaleLowerCase("pt-BR").includes(termo);
  }), [patrimonios, filtroTipoPatrimonio, busca]);

  const resumoPatrimonioFiltrado = useMemo(() => patrimoniosFiltrados.reduce((acc, item) => {
    const valor = Number(item.valor || 0);
    if (item.tipo === "ativo") acc.ativos += valor;
    if (item.tipo === "patrimonio") acc.outros += valor;
    acc.quantidade += 1;
    return acc;
  }, { ativos: 0, outros: 0, quantidade: 0 }), [patrimoniosFiltrados]);

  const emprestimosFiltrados = useMemo(() => {
    const termo = busca.trim().toLocaleLowerCase("pt-BR");
    return emprestimos.filter((item) =>
      String(item.descricao || "").toLocaleLowerCase("pt-BR").includes(termo)
    );
  }, [emprestimos, busca]);

  const totalEmprestimosFiltrados = useMemo(() =>
    emprestimosFiltrados.reduce((total, item) => total + Number(item.valor || 0), 0),
    [emprestimosFiltrados]
  );

  const investimentosFiltrados = useMemo(() => {
    const termo = busca.trim().toLocaleLowerCase("pt-BR");
    return investimentos.filter((item) =>
      String(item.descricao || "").toLocaleLowerCase("pt-BR").includes(termo)
    );
  }, [investimentos, busca]);

  const totalInvestimentosFiltrados = useMemo(() =>
    investimentosFiltrados.reduce((total, item) => total + Number(item.valor || 0), 0),
    [investimentosFiltrados]
  );

  const categoriasTipo = categorias.filter(
    (item) => item.tipo === form.tipo
  );

  const pessoasFiltradas = useMemo(() => {
    return pessoas.filter((pessoa) => {
      const termo = busca.trim().toLocaleLowerCase("pt-BR");

      const corresponde = [
        pessoa.nome_razao,
        pessoa.documento,
        pessoa.email,
        pessoa.telefone,
      ].some((valor) =>
        String(valor || "").toLocaleLowerCase("pt-BR").includes(termo)
      );

      return (
        corresponde &&
        (filtro === "Todos" || pessoa.tipo === filtro)
      );
    });
  }, [pessoas, busca, filtro]);

  const pessoasDaMovimentacao = pessoas.filter((pessoa) =>
    form.tipo === "receita"
      ? pessoa.tipo === "cliente"
      : pessoa.tipo === "fornecedor"
  );

  const extratoFiltrado = useMemo(() => {
    return movimentacoesBancarias.filter((item) => {
      const termo = busca.trim().toLocaleLowerCase("pt-BR");

      const conta = contasBancarias.find(
        (c) => Number(c.id) === Number(item.conta_bancaria_id)
      );

      const correspondeBusca = [
        item.descricao,
        item.nome_banco,
        conta?.nome_banco,
        item.categoria,
        item.observacoes,
      ].some((valor) =>
        String(valor || "").toLocaleLowerCase("pt-BR").includes(termo)
      );

      const correspondeConta =
        filtroContaBanco === "Todas" ||
        String(item.conta_bancaria_id) === filtroContaBanco;

      const correspondeTipo =
        filtroTipoBanco === "Todos" ||
        item.tipo === filtroTipoBanco;

      const data = String(item.data_movimentacao || "").slice(0, 10);

      const correspondeData =
        (!dataInicioBanco || data >= dataInicioBanco) &&
        (!dataFimBanco || data <= dataFimBanco);

      return (
        correspondeBusca &&
        correspondeConta &&
        correspondeTipo &&
        correspondeData
      );
    });
  }, [
    movimentacoesBancarias,
    contasBancarias,
    busca,
    filtroContaBanco,
    filtroTipoBanco,
    dataInicioBanco,
    dataFimBanco,
  ]);

  const resumoExtrato = useMemo(() => {
    return extratoFiltrado.reduce(
      (total, item) => {
        const valor = Number(item.valor || 0);

        if (item.tipo === "entrada") {
          total.entradas += valor;
        } else {
          total.saidas += valor;
        }

        return total;
      },
      { entradas: 0, saidas: 0 }
    );
  }, [extratoFiltrado]);

  const saldosPorConta = useMemo(() => {
    const lista = Array.isArray(saldosBancarios)
      ? saldosBancarios
      : saldosBancarios?.contas || saldosBancarios?.saldos || [];

    return Array.isArray(lista) ? lista : [];
  }, [saldosBancarios]);

  const saldoConta = useCallback(
    (conta) => {
      const saldo = saldosPorConta.find(
        (item) =>
          Number(item.conta_bancaria_id ?? item.id) === Number(conta.id)
      );

      if (saldo?.saldo_atual != null) {
        return Number(saldo.saldo_atual);
      }

      if (conta.saldo_atual != null) {
        return Number(conta.saldo_atual);
      }

      const movimentacoesConta = movimentacoesBancarias.filter(
        (item) => Number(item.conta_bancaria_id) === Number(conta.id)
      );

      return movimentacoesConta.reduce(
        (total, item) =>
          total +
          Number(item.valor || 0) * (item.tipo === "entrada" ? 1 : -1),
        Number(conta.saldo_inicial || 0)
      );
    },
    [saldosPorConta, movimentacoesBancarias]
  );

  const saldoTotalBancario = contasBancarias.reduce(
    (total, conta) => total + saldoConta(conta),
    0
  );

  // ==========================================
  // NAVEGAÇÃO
  // ==========================================

  function mudarModulo(id) {
    setModuloAtivo(id);
    setBusca("");
    setFiltro("Todos");
    setAviso("");
    setErro("");
    setErroBancos("");
    setErroPatrimonio("");
    setErroEmprestimos("");
    setErroInvestimentos("");
  }

  // ==========================================
  // MOVIMENTAÇÕES FINANCEIRAS
  // ==========================================

  function abrirNovoRegistro() {
    setRegistroEditando(null);

    setForm(
      formularioVazio(
        moduloAtivo === "custos"
          ? "custo"
          : moduloAtivo === "impostos"
            ? "imposto"
            : "receita"
      )
    );

    setErroFormulario("");
    setCriandoCategoria(false);
    setNomeCategoria("");
    setModalRegistro(true);
  }

  function abrirEdicao(item) {
    setRegistroEditando(item.id);

    setForm({
      tipo: item.tipo,
      categoria_id: String(item.categoria_id),
      descricao: item.descricao,
      valor: String(item.valor),
      data_vencimento: String(item.data_vencimento).slice(0, 10),
      data_pagamento: item.data_pagamento
        ? String(item.data_pagamento).slice(0, 10)
        : "",
      status: item.status,
      conta_bancaria_id: item.conta_bancaria_id || null,
      cliente_fornecedor_id: item.cliente_fornecedor_id || null,
    });

    setErroFormulario("");
    setCriandoCategoria(false);
    setModalRegistro(true);
  }

  async function cadastrarCategoria() {
    if (!nomeCategoria.trim()) {
      setErroFormulario("Informe o nome da categoria.");
      return;
    }

    setSalvando(true);
    setErroFormulario("");

    try {
      const resposta = await criarCategoriaContabil(
        {
          nome: nomeCategoria.trim(),
          tipo: form.tipo,
          natureza: naturezaCategoria,
        },
        obterToken()
      );

      const nova = resposta.categoria;

      setCategorias((anterior) => [...anterior, nova]);
      setForm((anterior) => ({
        ...anterior,
        categoria_id: String(nova.id),
      }));

      setCriandoCategoria(false);
      setNomeCategoria("");
    } catch (e) {
      setErroFormulario(
        e.message || "Erro ao cadastrar categoria."
      );
    } finally {
      setSalvando(false);
    }
  }

  async function salvarRegistro(evento) {
    evento.preventDefault();

    if (salvando) return;

    setSalvando(true);
    setErroFormulario("");

    try {
      if (!form.categoria_id) {
        throw new Error("Selecione ou cadastre uma categoria.");
      }

      const valor = Number(form.valor);

      if (!Number.isFinite(valor) || valor <= 0) {
        throw new Error("Informe um valor maior que zero.");
      }

      if (form.status === "pago" && !form.data_pagamento) {
        throw new Error("Informe a data do pagamento ou recebimento.");
      }

      const dados = {
        categoria_id: Number(form.categoria_id),
        descricao: form.descricao.trim(),
        valor,
        data_vencimento: form.data_vencimento,
        data_pagamento:
          form.status === "pago" ? form.data_pagamento : null,
        status: form.status,
        conta_bancaria_id: form.conta_bancaria_id,
        cliente_fornecedor_id: form.cliente_fornecedor_id,
      };

      if (registroEditando) {
        await atualizarMovimentacaoContabil(
          registroEditando,
          dados,
          obterToken()
        );
      } else {
        await criarMovimentacaoContabil(dados, obterToken());
      }

      await atualizarFinanceiro();

      setModalRegistro(false);
      setAviso(
        registroEditando
          ? "Registro atualizado com sucesso."
          : "Registro cadastrado com sucesso."
      );
    } catch (e) {
      setErroFormulario(
        e.message || "Não foi possível salvar o registro."
      );
    } finally {
      setSalvando(false);
    }
  }

  async function excluirRegistro(id) {
    if (!window.confirm("Deseja realmente excluir esta movimentação?")) {
      return;
    }

    setErro("");

    try {
      await excluirMovimentacaoContabil(id, obterToken());
      await atualizarFinanceiro();
      setAviso("Registro excluído com sucesso.");
    } catch (e) {
      setErro(
        e.message || "Não foi possível excluir o registro."
      );
    }
  }

  // ==========================================
  // FOLHA DE PAGAMENTO (CONTROLE FINANCEIRO)
  // ==========================================

  function abrirNovaFolha() {
    const competencia = mesFolha || hojeISO().slice(0, 7);
    setFolhaEditando(null);
    setFormFolha({
      competencia,
      descricao: `Folha de pagamento — ${competencia.slice(5)}/${competencia.slice(0, 4)}`,
      valor: "",
      data_vencimento: `${competencia}-01`,
      status: "pendente",
      data_pagamento: "",
    });
    setErroFolha("");
    setModalFolha(true);
  }

  function abrirEdicaoFolha(item) {
    const competencia = String(item.data_vencimento || hojeISO()).slice(0, 7);
    setFolhaEditando(item.id);
    setFormFolha({
      competencia,
      descricao: item.descricao || "",
      valor: String(item.valor ?? ""),
      data_vencimento: String(item.data_vencimento || "").slice(0, 10),
      status: item.status || "pendente",
      data_pagamento: item.data_pagamento ? String(item.data_pagamento).slice(0, 10) : "",
    });
    setErroFolha("");
    setModalFolha(true);
  }

  async function salvarFolha(evento) {
    evento.preventDefault();
    if (salvandoFolha) return;
    setSalvandoFolha(true);
    setErroFolha("");
    try {
      const token = obterToken();
      if (!token) throw new Error("Sessão não encontrada. Faça login novamente.");
      const valor = Number(formFolha.valor);
      if (!Number.isFinite(valor) || valor <= 0) throw new Error("Informe um valor maior que zero.");
      if (!formFolha.competencia || !/^\d{4}-\d{2}$/.test(formFolha.competencia)) {
        throw new Error("Informe a competência da folha.");
      }
      if (!formFolha.descricao.trim()) throw new Error("Informe a descrição da folha.");
      if (!formFolha.data_vencimento) throw new Error("Informe o vencimento.");
      if (formFolha.data_vencimento.slice(0, 7) !== formFolha.competencia) {
        throw new Error("O vencimento deve pertencer ao mês da competência selecionada.");
      }
      if (formFolha.status === "pago" && !formFolha.data_pagamento) {
        throw new Error("Informe a data do pagamento.");
      }

      let categoria = categoriaFolha;
      if (!categoria) {
        const resposta = await criarCategoriaContabil({
          nome: NOME_CATEGORIA_FOLHA,
          tipo: "despesa",
          natureza: "fixo",
        }, token);
        categoria = resposta.categoria;
        if (!categoria?.id) throw new Error("Não foi possível identificar a categoria da folha.");
      }

      const dados = {
        categoria_id: Number(categoria.id),
        descricao: formFolha.descricao.trim(),
        valor,
        data_vencimento: formFolha.data_vencimento,
        data_pagamento: formFolha.status === "pago" ? formFolha.data_pagamento : null,
        status: formFolha.status,
        conta_bancaria_id: null,
        cliente_fornecedor_id: null,
      };
      if (folhaEditando !== null) {
        await atualizarMovimentacaoContabil(folhaEditando, dados, token);
      } else {
        await criarMovimentacaoContabil(dados, token);
      }
      await atualizarFinanceiro();
      setModalFolha(false);
      setAviso(folhaEditando !== null ? "Folha atualizada com sucesso." : "Folha cadastrada com sucesso.");
    } catch (e) {
      setErroFolha(e.message || "Não foi possível salvar a folha de pagamento.");
    } finally {
      setSalvandoFolha(false);
    }
  }

  // ==========================================
  // PATRIMÔNIO E ATIVOS
  // ==========================================

  function abrirNovoPatrimonio() {
    setPatrimonioEditando(null);
    setFormPatrimonio({ tipo: "ativo", descricao: "", valor: "", data_registro: hojeISO() });
    setErroFormularioPatrimonio("");
    setModalPatrimonio(true);
  }

  function abrirEdicaoPatrimonio(item) {
    setPatrimonioEditando(item.id);
    setFormPatrimonio({
      tipo: item.tipo,
      descricao: item.descricao || "",
      valor: String(item.valor ?? ""),
      data_registro: String(item.data_registro || "").slice(0, 10),
    });
    setErroFormularioPatrimonio("");
    setModalPatrimonio(true);
  }

  async function salvarPatrimonio(evento) {
    evento.preventDefault();
    if (salvandoPatrimonio) return;
    setSalvandoPatrimonio(true);
    setErroFormularioPatrimonio("");
    try {
      const token = obterToken();
      if (!token) throw new Error("Sessão não encontrada. Faça login novamente.");
      const valor = Number(formPatrimonio.valor);
      if (!formPatrimonio.descricao.trim()) throw new Error("Informe a descrição do bem.");
      if (!Number.isFinite(valor) || valor < 0 || formPatrimonio.valor === "") {
        throw new Error("Informe um valor válido maior ou igual a zero.");
      }
      if (!formPatrimonio.data_registro) throw new Error("Informe a data de registro.");
      const dados = {
        tipo: formPatrimonio.tipo,
        descricao: formPatrimonio.descricao.trim(),
        valor,
        data_registro: formPatrimonio.data_registro,
      };
      if (patrimonioEditando !== null) {
        await atualizarPatrimonio(patrimonioEditando, dados, token);
      } else {
        await criarPatrimonio(dados, token);
      }
      await carregarDadosPatrimonio();
      setModalPatrimonio(false);
      setAviso(patrimonioEditando !== null ? "Patrimônio atualizado com sucesso." : "Patrimônio cadastrado com sucesso.");
    } catch (e) {
      setErroFormularioPatrimonio(e.message || "Não foi possível salvar o patrimônio.");
    } finally {
      setSalvandoPatrimonio(false);
    }
  }

  async function removerPatrimonio(id) {
    if (!window.confirm("Deseja realmente excluir este bem ou ativo?")) return;
    setErroPatrimonio("");
    try {
      await excluirPatrimonio(id, obterToken());
      await carregarDadosPatrimonio();
      setAviso("Patrimônio excluído com sucesso.");
    } catch (e) {
      setErroPatrimonio(e.message || "Não foi possível excluir o patrimônio.");
    }
  }

  // ==========================================
  // EMPRÉSTIMOS E FINANCIAMENTOS
  // ==========================================

  function abrirNovoEmprestimo() {
    setEmprestimoEditando(null);
    setFormEmprestimo({ descricao: "", valor: "", taxa_juros: "", data_registro: hojeISO() });
    setErroFormularioEmprestimo("");
    setModalEmprestimo(true);
  }

  function abrirEdicaoEmprestimo(item) {
    setEmprestimoEditando(item.id);
    setFormEmprestimo({
      descricao: item.descricao || "",
      valor: String(item.valor ?? ""),
      taxa_juros: item.taxa_juros == null ? "" : String(item.taxa_juros),
      data_registro: String(item.data_registro || "").slice(0, 10),
    });
    setErroFormularioEmprestimo("");
    setModalEmprestimo(true);
  }

  async function salvarEmprestimo(evento) {
    evento.preventDefault();
    if (salvandoEmprestimo) return;
    setSalvandoEmprestimo(true);
    setErroFormularioEmprestimo("");
    try {
      const token = obterToken();
      if (!token) throw new Error("Sessão não encontrada. Faça login novamente.");
      const valor = Number(formEmprestimo.valor);
      const taxa = formEmprestimo.taxa_juros === "" ? null : Number(formEmprestimo.taxa_juros);
      if (!formEmprestimo.descricao.trim()) throw new Error("Informe a descrição do contrato.");
      if (!Number.isFinite(valor) || valor <= 0 || formEmprestimo.valor === "") {
        throw new Error("Informe um valor contratado maior que zero.");
      }
      if (taxa !== null && (!Number.isFinite(taxa) || taxa < 0 || taxa > 999.99)) {
        throw new Error("Informe uma taxa de juros válida (0 a 999,99%).");
      }
      if (!formEmprestimo.data_registro) throw new Error("Informe a data de contratação.");
      const dados = {
        descricao: formEmprestimo.descricao.trim(),
        valor,
        taxa_juros: taxa,
        data_registro: formEmprestimo.data_registro,
      };
      if (emprestimoEditando !== null) {
        await atualizarEmprestimo(emprestimoEditando, dados, token);
      } else {
        await criarEmprestimo(dados, token);
      }
      setModalEmprestimo(false);
      setAviso(emprestimoEditando !== null
        ? "Contrato atualizado com sucesso."
        : "Contrato cadastrado com sucesso.");
      await carregarDadosEmprestimos();
    } catch (e) {
      setErroFormularioEmprestimo(e.message || "Não foi possível salvar o contrato.");
    } finally {
      setSalvandoEmprestimo(false);
    }
  }

  async function removerEmprestimo(id) {
    if (!window.confirm("Deseja realmente excluir este contrato de empréstimo ou financiamento?")) return;
    setErroEmprestimos("");
    try {
      await excluirEmprestimo(id, obterToken());
      setAviso("Contrato excluído com sucesso.");
      await carregarDadosEmprestimos();
    } catch (e) {
      setErroEmprestimos(e.message || "Não foi possível excluir o contrato.");
    }
  }

  // ==========================================
  // INVESTIMENTOS
  // ==========================================

  function abrirNovoInvestimento() {
    setInvestimentoEditando(null);
    setFormInvestimento({ descricao: "", valor: "", taxa_juros: "", data_registro: hojeISO() });
    setErroFormularioInvestimento("");
    setModalInvestimento(true);
  }

  function abrirEdicaoInvestimento(item) {
    setInvestimentoEditando(item.id);
    setFormInvestimento({
      descricao: item.descricao || "",
      valor: String(item.valor ?? ""),
      taxa_juros: item.taxa_juros == null ? "" : String(item.taxa_juros),
      data_registro: String(item.data_registro || "").slice(0, 10),
    });
    setErroFormularioInvestimento("");
    setModalInvestimento(true);
  }

  async function salvarInvestimento(evento) {
    evento.preventDefault();
    if (salvandoInvestimento) return;
    setSalvandoInvestimento(true);
    setErroFormularioInvestimento("");
    try {
      const token = obterToken();
      if (!token) throw new Error("Sessão não encontrada. Faça login novamente.");
      const valor = Number(formInvestimento.valor);
      const taxa = formInvestimento.taxa_juros === "" ? null : Number(formInvestimento.taxa_juros);
      if (!formInvestimento.descricao.trim()) throw new Error("Informe a descrição do investimento.");
      if (formInvestimento.descricao.trim().length > 255) throw new Error("A descrição deve ter no máximo 255 caracteres.");
      if (formInvestimento.valor === "" || !Number.isFinite(valor) || valor <= 0) {
        throw new Error("Informe um valor investido maior que zero.");
      }
      if (taxa !== null && (!Number.isFinite(taxa) || taxa < 0 || taxa > 999.99)) {
        throw new Error("Informe uma taxa válida (0 a 999,99%).");
      }
      if (!formInvestimento.data_registro) throw new Error("Informe a data do investimento.");
      const dados = {
        descricao: formInvestimento.descricao.trim(),
        valor,
        taxa_juros: taxa,
        data_registro: formInvestimento.data_registro,
      };
      if (investimentoEditando !== null) {
        await atualizarInvestimento(investimentoEditando, dados, token);
      } else {
        await criarInvestimento(dados, token);
      }
      setModalInvestimento(false);
      setAviso(investimentoEditando !== null
        ? "Investimento atualizado com sucesso."
        : "Investimento cadastrado com sucesso.");
      await carregarDadosInvestimentos();
    } catch (e) {
      setErroFormularioInvestimento(e.message || "Não foi possível salvar o investimento.");
    } finally {
      setSalvandoInvestimento(false);
    }
  }

  async function removerInvestimento(id) {
    if (!window.confirm("Deseja realmente excluir este investimento?")) return;
    setErroInvestimentos("");
    try {
      await excluirInvestimento(id, obterToken());
      setAviso("Investimento excluído com sucesso.");
      await carregarDadosInvestimentos();
    } catch (e) {
      setErroInvestimentos(e.message || "Não foi possível excluir o investimento.");
    }
  }

  // ==========================================
  // CLIENTES E FORNECEDORES
  // ==========================================

  function abrirNovaPessoa() {
    setPessoaEditando(null);
    setFormPessoa({ ...FORM_PESSOA_VAZIO });
    setErroPessoa("");
    setModalPessoa(true);
  }

  function abrirEdicaoPessoa(pessoa) {
    setPessoaEditando(pessoa.id);

    setFormPessoa({
      tipo: pessoa.tipo,
      nome_razao: pessoa.nome_razao || "",
      documento: pessoa.documento || "",
      email: pessoa.email || "",
      telefone: pessoa.telefone || "",
    });

    setErroPessoa("");
    setModalPessoa(true);
  }

  async function salvarPessoa(evento) {
    evento.preventDefault();

    if (salvandoPessoa) return;

    setSalvandoPessoa(true);
    setErroPessoa("");

    try {
      const dados = {
        tipo: formPessoa.tipo,
        nome_razao: formPessoa.nome_razao.trim(),
        documento: formPessoa.documento.trim(),
        email: formPessoa.email.trim(),
        telefone: formPessoa.telefone.trim(),
      };

      if (!dados.nome_razao) {
        throw new Error("Informe o nome ou razão social.");
      }

      if (pessoaEditando) {
        await atualizarPessoaContabil(
          pessoaEditando,
          dados,
          obterToken()
        );
      } else {
        await criarPessoaContabil(dados, obterToken());
      }

      const resposta = await listarPessoasContabeis(obterToken());

      setPessoas(resposta.pessoas || []);
      setModalPessoa(false);

      setAviso(
        pessoaEditando
          ? "Cadastro atualizado com sucesso."
          : "Cadastro realizado com sucesso."
      );
    } catch (e) {
      setErroPessoa(
        e.message || "Não foi possível salvar o cadastro."
      );
    } finally {
      setSalvandoPessoa(false);
    }
  }

  async function excluirPessoa(id) {
    if (
      !window.confirm(
        "Deseja realmente excluir este cliente ou fornecedor?"
      )
    ) {
      return;
    }

    setErro("");

    try {
      await excluirPessoaContabil(id, obterToken());

      const resposta = await listarPessoasContabeis(obterToken());

      setPessoas(resposta.pessoas || []);
      setAviso("Cadastro excluído com sucesso.");
    } catch (e) {
      setErro(
        e.message || "Não foi possível excluir o cadastro."
      );
    }
  }

  // ==========================================
  // CONTAS BANCÁRIAS
  // ==========================================

  function abrirNovaContaBancaria() {
    setContaBancariaEditando(null);
    setFormContaBancaria({ ...FORM_CONTA_VAZIO });
    setErroFormularioBanco("");
    setModalContaBancaria(true);
  }

  function abrirEdicaoContaBancaria(conta) {
    setContaBancariaEditando(conta.id);

    setFormContaBancaria({
      nome_banco: conta.nome_banco || "",
      tipo_conta: conta.tipo_conta || "corrente",
      saldo_inicial: String(conta.saldo_inicial ?? 0),
    });

    setErroFormularioBanco("");
    setModalContaBancaria(true);
  }

  async function salvarContaBancaria(evento) {
    evento.preventDefault();

    if (salvandoBanco) return;

    setSalvandoBanco(true);
    setErroFormularioBanco("");

    try {
      const dados = {
        nome_banco: formContaBancaria.nome_banco.trim(),
        tipo_conta: formContaBancaria.tipo_conta,
        saldo_inicial: Number(formContaBancaria.saldo_inicial),
      };

      if (!dados.nome_banco) {
        throw new Error("Informe o nome do banco.");
      }

      if (
        !Number.isFinite(dados.saldo_inicial) ||
        dados.saldo_inicial < 0
      ) {
        throw new Error("Informe um saldo inicial válido.");
      }

      if (contaBancariaEditando !== null) {
        await atualizarContaBancaria(
          contaBancariaEditando,
          dados,
          obterToken()
        );
      } else {
        await criarContaBancaria(dados, obterToken());
      }

      await carregarDadosBancarios();

      setModalContaBancaria(false);
      setAviso(
        contaBancariaEditando !== null
          ? "Conta bancária atualizada com sucesso."
          : "Conta bancária cadastrada com sucesso."
      );
    } catch (e) {
      setErroFormularioBanco(
        e.message || "Não foi possível salvar a conta bancária."
      );
    } finally {
      setSalvandoBanco(false);
    }
  }

  async function removerContaBancaria(id) {
    if (!window.confirm("Deseja realmente excluir esta conta bancária?")) {
      return;
    }

    setErroBancos("");

    try {
      await excluirContaBancaria(id, obterToken());
      await carregarDadosBancarios();
      setAviso("Conta bancária excluída com sucesso.");
    } catch (e) {
      setErroBancos(
        e.message || "Não foi possível excluir a conta bancária."
      );
    }
  }

  // ==========================================
  // MOVIMENTAÇÕES BANCÁRIAS
  // ==========================================

  function abrirNovaMovimentacaoBancaria() {
    if (!contasBancarias.length) {
      setErroBancos(
        "Cadastre uma conta bancária antes de registrar movimentações."
      );
      return;
    }

    setMovimentacaoBancariaEditando(null);

    setFormMovimentacaoBancaria({
      ...formularioBancoVazio(),
      conta_bancaria_id: String(contasBancarias[0].id),
    });

    setErroFormularioBanco("");
    setModalMovimentacaoBancaria(true);
  }

  function abrirEdicaoMovimentacaoBancaria(item) {
    setMovimentacaoBancariaEditando(item.id);

    setFormMovimentacaoBancaria({
      conta_bancaria_id: String(item.conta_bancaria_id),
      tipo: item.tipo,
      descricao: item.descricao || "",
      valor: String(item.valor),
      data_movimentacao: String(item.data_movimentacao).slice(0, 10),
      categoria: item.categoria || "",
      observacoes: item.observacoes || "",
      movimentacao_financeira_id:
        item.movimentacao_financeira_id ?? null,
    });

    setErroFormularioBanco("");
    setModalMovimentacaoBancaria(true);
  }

  async function salvarMovimentacaoBancaria(evento) {
    evento.preventDefault();

    if (salvandoBanco) return;

    setSalvandoBanco(true);
    setErroFormularioBanco("");

    try {
      const dados = {
        conta_bancaria_id: Number(
          formMovimentacaoBancaria.conta_bancaria_id
        ),
        tipo: formMovimentacaoBancaria.tipo,
        descricao: formMovimentacaoBancaria.descricao.trim(),
        valor: Number(formMovimentacaoBancaria.valor),
        data_movimentacao:
          formMovimentacaoBancaria.data_movimentacao,
        categoria:
          formMovimentacaoBancaria.categoria.trim() || null,
        observacoes:
          formMovimentacaoBancaria.observacoes.trim() || null,
        movimentacao_financeira_id:
          formMovimentacaoBancaria.movimentacao_financeira_id ?? null,
      };

      if (!dados.conta_bancaria_id) {
        throw new Error("Selecione uma conta bancária.");
      }

      if (!dados.descricao) {
        throw new Error("Informe a descrição.");
      }

      if (!Number.isFinite(dados.valor) || dados.valor <= 0) {
        throw new Error("Informe um valor maior que zero.");
      }

      if (!dados.data_movimentacao) {
        throw new Error("Informe a data da movimentação.");
      }

      if (movimentacaoBancariaEditando !== null) {
        await atualizarMovimentacaoBancaria(
          movimentacaoBancariaEditando,
          dados,
          obterToken()
        );
      } else {
        await criarMovimentacaoBancaria(dados, obterToken());
      }

      await carregarDadosBancarios();

      setModalMovimentacaoBancaria(false);
      setAviso(
        movimentacaoBancariaEditando !== null
          ? "Movimentação bancária atualizada com sucesso."
          : "Movimentação bancária cadastrada com sucesso."
      );
    } catch (e) {
      setErroFormularioBanco(
        e.message || "Não foi possível salvar a movimentação."
      );
    } finally {
      setSalvandoBanco(false);
    }
  }

  async function removerMovimentacaoBancaria(id) {
    if (
      !window.confirm(
        "Deseja realmente excluir esta movimentação bancária?"
      )
    ) {
      return;
    }

    setErroBancos("");

    try {
      await excluirMovimentacaoBancaria(id, obterToken());
      await carregarDadosBancarios();
      setAviso("Movimentação bancária excluída com sucesso.");
    } catch (e) {
      setErroBancos(
        e.message || "Não foi possível excluir a movimentação."
      );
    }
  }

  // ==========================================
  // EMPRESA
  // ==========================================

  function abrirModalEmpresa() {
    if (!empresa) return;

    setFormEmpresa({ ...empresa });
    setErroEmpresa("");
    setModalEmpresa(true);
  }

  async function salvarEmpresa(evento) {
    evento.preventDefault();

    if (!podeEditarEmpresa || salvandoEmpresa) return;

    setSalvandoEmpresa(true);
    setErroEmpresa("");

    try {
      const {
        razao_social,
        email_empresa,
        telefone_empresa,
        setor_atuacao,
        porte_empresa,
        regime_tributario,
        perfil_risco,
        capital_inicial,
      } = formEmpresa;

      const resposta = await salvarEmpresaContabil(
        {
          razao_social,
          email_empresa,
          telefone_empresa,
          setor_atuacao,
          porte_empresa,
          regime_tributario,
          perfil_risco,
          capital_inicial: String(capital_inicial),
        },
        obterToken()
      );

      setEmpresa(normalizarEmpresa(resposta.empresa));
      setModalEmpresa(false);
      setAviso("Dados da empresa atualizados com sucesso.");
    } catch (e) {
      setErroEmpresa(
        e.message || "Erro ao salvar os dados da empresa."
      );
    } finally {
      setSalvandoEmpresa(false);
    }
  }

  // ==========================================
  // INDICADORES E PROJEÇÃO
  // ==========================================

  const cards = [
    {
      titulo: "Total de receitas",
      valor: indicadores.total_receitas,
      detalhe: "Receitas recebidas",
      icon: TrendingUp,
      cor: "text-[#588157]",
    },
    {
      titulo: "Total de despesas",
      valor: indicadores.total_despesas,
      detalhe: "Despesas, custos e impostos pagos",
      icon: TrendingDown,
      cor: "text-[#B66B61]",
    },
    {
      titulo: "Saldo financeiro",
      valor: indicadores.saldo_financeiro,
      detalhe: "Receitas menos saídas pagas",
      icon: CircleDollarSign,
      cor: "text-[#588157]",
    },
    {
      titulo: "Registros cadastrados",
      valor: indicadores.registros_cadastrados,
      detalhe: "Movimentações e outros cadastros",
      icon: FileText,
      cor: "text-[#718A76]",
      inteiro: true,
    },
  ];

  const pendentes = useMemo(
    () =>
      movimentacoes
        .filter((item) => item.status === "pendente")
        .sort((a, b) =>
          String(a.data_vencimento).localeCompare(
            String(b.data_vencimento)
          )
        ),
    [movimentacoes]
  );

  const projecao = useMemo(() => {
    let saldo = Number(indicadores.saldo_financeiro || 0);

    return [
      { dia: "Hoje", saldo },
      ...pendentes.map((item) => {
        saldo +=
          Number(item.valor) *
          (item.tipo === "receita" ? 1 : -1);

        return {
          dia: dataBR(item.data_vencimento),
          saldo,
        };
      }),
    ];
  }, [indicadores.saldo_financeiro, pendentes]);

  const quantidadeModulo =
    moduloAtivo === "investimentos"
      ? investimentos.length
    : moduloAtivo === "emprestimos"
      ? emprestimos.length
      : moduloAtivo === "patrimonio"
      ? patrimonios.length
      : moduloAtivo === "folha"
      ? lancamentosFolha.length
      : moduloAtivo === "pessoas"
      ? pessoas.length
      : moduloAtivo === "bancos"
        ? movimentacoesBancarias.length
        : registros.length;

  // ==========================================
  // RENDERIZAÇÃO
  // ==========================================

  return (
    <div className="min-h-screen bg-[#F2F2F2] text-[#273B31] dark:bg-[#111A14] dark:text-[#E5EDE5]">
      <SidebarPlataforma />

      <main className="min-h-screen px-5 pb-12 pt-8 sm:px-8 lg:ml-[260px] lg:px-10">
        <div className="mx-auto max-w-[1500px]">

          {/* CABEÇALHO */}
          <header className="mb-8 flex flex-col justify-between gap-5 md:flex-row md:items-center">
            <div>
              <div className="mb-2 flex items-center gap-2 text-sm text-[#7E9971]">
                <span>Plataforma</span>
                <ChevronRight size={14} />
                <span>Informações Contábeis</span>
              </div>

              <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
                Informações{" "}
                <span className="text-[#588157]">Contábeis</span>
              </h1>

              <p className="mt-2 text-sm text-[#718075] dark:text-[#A1B0A3]">
                Organize, acompanhe e gerencie os dados financeiros da sua empresa.
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={atualizarTudo}
                disabled={carregando || carregandoBancos}
                className={CLASSE_BOTAO_SECUNDARIO}
              >
                <RefreshCw size={17} />
                Atualizar
              </button>

              <button
                type="button"
                onClick={abrirModalEmpresa}
                disabled={!empresa}
                className={CLASSE_BOTAO_SECUNDARIO}
              >
                <Building2 size={18} />
                {podeEditarEmpresa
                  ? "Editar empresa"
                  : "Visualizar empresa"}
              </button>
            </div>
          </header>

          <MensagemErro mensagem={erro} />

          {aviso && (
            <div
              role="status"
              className="mb-5 rounded-xl border border-[#A3B18A] bg-[#E9F1E7] p-4 text-sm text-[#344E41] dark:bg-[#26382B] dark:text-[#DDEADB]"
            >
              {aviso}
            </div>
          )}

          {/* DADOS DA EMPRESA */}
          <section className={`${CLASSE_CARTAO} mb-7 p-5 sm:p-6`}>
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#E9EFE7] text-[#48634D] dark:bg-[#2B3D30] dark:text-[#A3B18A]">
                  <Building2 size={27} />
                </div>

                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-lg font-bold">
                      {carregando
                        ? "Carregando empresa..."
                        : empresa?.razao_social || "Empresa não encontrada"}
                    </h2>

                    {empresa && (
                      <span className="rounded-full bg-[#E8F1E6] px-2.5 py-1 text-[10px] font-bold uppercase text-[#4D7651] dark:bg-[#2B4030] dark:text-[#A3B18A]">
                        {empresa.status === "ativa"
                          ? "Empresa ativa"
                          : empresa.status}
                      </span>
                    )}
                  </div>

                  <p className="mt-1 text-sm text-[#7A897D] dark:text-[#A1B0A3]">
                    {empresa?.tipo_documento || "Documento"}:{" "}
                    {empresa?.documento_identificacao || "—"} ·{" "}
                    {empresa?.setor_atuacao || "—"}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={abrirModalEmpresa}
                disabled={!empresa}
                className="flex items-center gap-2 text-sm font-semibold text-[#588157] disabled:opacity-50"
              >
                <Pencil size={15} />
                {podeEditarEmpresa ? "Editar dados" : "Ver dados"}
              </button>
            </div>
          </section>

          {/* INDICADORES */}
          <section className="mb-9 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {cards.map((card) => {
              const Icone = card.icon;

              return (
                <div
                  key={card.titulo}
                  className={`${CLASSE_CARTAO} p-5 transition hover:-translate-y-1 hover:shadow-md`}
                >
                  <div className="mb-5 flex items-center justify-between">
                    <span className="text-sm font-medium text-[#718075] dark:text-[#A1B0A3]">
                      {card.titulo}
                    </span>

                    <div className={`rounded-xl bg-[#E9F1E7] p-2.5 dark:bg-[#2B3D30] ${card.cor}`}>
                      <Icone size={20} />
                    </div>
                  </div>

                  <h3 className="text-2xl font-bold tabular-nums">
                    {carregando
                      ? "—"
                      : card.inteiro
                        ? Number(card.valor || 0)
                        : moeda(card.valor)}
                  </h3>

                  <p className="mt-2 text-xs text-[#89968B] dark:text-[#849489]">
                    {card.detalhe}
                  </p>
                </div>
              );
            })}
          </section>

          {/* GRÁFICO E COMPROMISSOS */}
          <section className="mb-9 grid grid-cols-1 gap-4 lg:grid-cols-3">
            <div className={`${CLASSE_CARTAO} p-5 sm:p-6 lg:col-span-2`}>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h3 className="flex items-center gap-2 font-bold">
                  <BarChart3 size={19} className="text-[#588157]" />
                  Projeção do saldo
                </h3>

                <span className="text-xs text-[#829085] dark:text-[#A1B0A3]">
                  Considerando movimentações pendentes
                </span>
              </div>

              <div className="mt-5 h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={projecao}
                    margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient
                        id="visoraSaldo"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="0%"
                          stopColor="#588157"
                          stopOpacity={0.4}
                        />
                        <stop
                          offset="100%"
                          stopColor="#588157"
                          stopOpacity={0.02}
                        />
                      </linearGradient>
                    </defs>

                    <XAxis
                      dataKey="dia"
                      tick={{ fontSize: 11, fill: "#849187" }}
                      axisLine={false}
                      tickLine={false}
                    />

                    <YAxis
                      tick={{ fontSize: 11, fill: "#849187" }}
                      tickFormatter={(v) => `${Math.round(v / 1000)} mil`}
                      axisLine={false}
                      tickLine={false}
                    />

                    <Tooltip
                      formatter={(v) => [moeda(v), "Saldo projetado"]}
                      contentStyle={{
                        borderRadius: 12,
                        border: "1px solid #DAD7CD",
                      }}
                    />

                    <Area
                      type="monotone"
                      dataKey="saldo"
                      stroke="#588157"
                      strokeWidth={2.5}
                      fill="url(#visoraSaldo)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className={`${CLASSE_CARTAO} p-5 sm:p-6`}>
              <h3 className="flex items-center gap-2 font-bold">
                <CalendarClock size={19} className="text-[#588157]" />
                Próximos compromissos
              </h3>

              <p className="mt-2 text-xs text-[#829085]">
                {pendentes.length} movimentação(ões) pendente(s)
              </p>

              <div className="mt-4 space-y-2">
                {pendentes.slice(0, 4).map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between gap-3 rounded-xl bg-[#F8F9F6] p-3 dark:bg-[#17231B]"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-xs font-semibold">
                        {item.descricao}
                      </p>

                      <p className="mt-1 text-[11px] text-[#849187]">
                        {dataBR(item.data_vencimento)}
                      </p>
                    </div>

                    <span
                      className={`shrink-0 text-xs font-bold ${
                        item.tipo === "receita"
                          ? "text-[#588157]"
                          : "text-[#B66B61]"
                      }`}
                    >
                      {item.tipo === "receita" ? "+" : "−"}
                      {moeda(item.valor)}
                    </span>
                  </div>
                ))}

                {!pendentes.length && (
                  <p className="rounded-xl bg-[#F8F9F6] p-3 text-xs text-[#829085] dark:bg-[#17231B]">
                    Nenhum compromisso pendente.
                  </p>
                )}
              </div>
            </div>
          </section>

          {/* NAVEGAÇÃO DOS MÓDULOS */}
          <section className="mb-9">
            <h2 className="text-xl font-bold">Gestão contábil</h2>

            <p className="mb-5 mt-1 text-sm text-[#829085] dark:text-[#A1B0A3]">
              Selecione uma categoria para visualizar e administrar seus dados.
            </p>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
              {MODULOS.map((item) => {
                const Icone = item.icon;
                const ativo = moduloAtivo === item.id;

                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => mudarModulo(item.id)}
                    className={`group flex min-h-[112px] flex-col items-start justify-between rounded-2xl border p-4 text-left transition hover:-translate-y-0.5 ${
                      ativo
                        ? "border-[#588157] bg-[#E9F0E6] dark:border-[#7E9971] dark:bg-[#26382B]"
                        : "border-[#DAD7CD] bg-white hover:border-[#A3B18A] dark:border-[#34483A] dark:bg-[#1C2920]"
                    }`}
                  >
                    <div
                      className={`rounded-xl p-2 ${
                        ativo
                          ? "bg-[#588157] text-white"
                          : "bg-[#EEF1EB] text-[#588157] dark:bg-[#2B3D30] dark:text-[#A3B18A]"
                      }`}
                    >
                      <Icone size={19} />
                    </div>

                    <div className="mt-4 flex w-full items-center justify-between gap-1">
                      <span className="text-xs font-semibold sm:text-sm">
                        {item.nome}
                      </span>

                      <ChevronRight
                        size={15}
                        className="shrink-0 text-[#8CA087] transition group-hover:translate-x-1"
                      />
                    </div>
                  </button>
                );
              })}
            </div>
          </section>

          {/* CONTEÚDO DO MÓDULO ATIVO */}
          <section className={`${CLASSE_CARTAO} overflow-hidden`}>
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#E7E5DE] p-5 dark:border-[#34483A] sm:p-6">
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-[#E9F0E6] p-3 text-[#588157] dark:bg-[#2B3D30]">
                  <IconeModulo size={21} />
                </div>

                <div>
                  <h2 className="font-bold">{modulo.nome}</h2>

                  <p className="mt-1 text-xs text-[#849187]">
                    {integrado
                      ? `${quantidadeModulo} registro(s) cadastrado(s)`
                      : "Módulo aguardando integração"}
                  </p>
                </div>
              </div>

              {integrado && (
                <button
                  type="button"
                  onClick={
                    moduloAtivo === "investimentos"
                       ? abrirNovoInvestimento
                    : moduloAtivo === "emprestimos"
                       ? abrirNovoEmprestimo
                    : moduloAtivo === "patrimonio"
                       ? abrirNovoPatrimonio
                    : moduloAtivo === "folha"
                       ? abrirNovaFolha
                       : moduloAtivo === "pessoas"
                       ? abrirNovaPessoa
                      : moduloAtivo === "bancos"
                        ? abrirNovaMovimentacaoBancaria
                        : abrirNovoRegistro
                  }
                  className={CLASSE_BOTAO}
                >
                  <Plus size={17} />
                  Novo registro
                </button>
              )}
            </div>

            {!integrado ? (
              <div className="p-10 text-center">
                <AlertCircle
                  size={28}
                  className="mx-auto mb-3 text-[#7E9971]"
                />

                <p className="font-semibold">
                  Este módulo ainda não está conectado ao MySQL.
                </p>

                <p className="mt-2 text-sm text-[#829085]">
                  Os registros demonstrativos foram removidos para evitar
                  confusão com informações reais.
                </p>
              </div>
            ) : moduloAtivo === "investimentos" ? (
              <div className="p-5 sm:p-6">
                <MensagemErro mensagem={erroInvestimentos} />
                <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h3 className="text-lg font-bold">Gestão de investimentos</h3>
                    <p className="mt-1 text-sm text-[#829085] dark:text-[#A1B0A3]">
                      Registre as aplicações financeiras da empresa e acompanhe os valores investidos. Rendimentos e saldos atualizados não são calculados automaticamente.
                    </p>
                  </div>
                  <button type="button" onClick={carregarDadosInvestimentos} disabled={carregandoInvestimentos}
                    className={CLASSE_BOTAO_SECUNDARIO}>
                    <RefreshCw size={16} /> {carregandoInvestimentos ? "Atualizando..." : "Atualizar"}
                  </button>
                </div>

                <div className="mb-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                  {[
                    { titulo: "Valor investido (filtro)", valor: totalInvestimentosFiltrados, icone: ChartNoAxesCombined },
                    { titulo: "Investimentos encontrados", valor: investimentosFiltrados.length, icone: FileText, inteiro: true },
                    { titulo: "Taxa média informada", valor: resumoInvestimentos?.taxa_media_juros, icone: TrendingUp, percentual: true },
                  ].map((card) => {
                    const Icone = card.icone;
                    return <div key={card.titulo} className="rounded-xl border border-[#DAD7CD] bg-[#F8F9F6] p-4 dark:border-[#34483A] dark:bg-[#17231B]">
                      <div className="flex items-center justify-between gap-2 text-xs text-[#829085]">
                        <span>{card.titulo}</span><Icone size={17} className="text-[#588157]" />
                      </div>
                      <p className="mt-3 text-xl font-bold tabular-nums">
                        {carregandoInvestimentos ? "—" : card.inteiro ? card.valor
                          : card.percentual ? (Number(resumoInvestimentos?.investimentos_com_taxa || 0) > 0
                            ? `${Number(card.valor || 0).toLocaleString("pt-BR", { maximumFractionDigits: 2 })}%` : "Não informada")
                          : moeda(card.valor)}
                      </p>
                    </div>;
                  })}
                </div>
                <p className="mb-5 text-xs text-[#829085]">
                  A taxa média considera apenas aplicações com taxa informada e não representa rentabilidade realizada.
                </p>

                <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                  <div className="relative min-w-[220px] flex-1">
                    <Search size={17} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#96A296]" />
                    <input className={`${CLASSE_CAMPO} pl-10`} placeholder="Buscar investimento..."
                      value={busca} onChange={(e) => setBusca(e.target.value)} />
                  </div>
                  <button type="button" className="text-xs font-semibold text-[#588157] hover:underline"
                    onClick={() => setBusca("")}>Limpar busca</button>
                </div>
                <div className="mb-3 text-xs text-[#829085]">
                  Exibindo {investimentosFiltrados.length} de {investimentos.length} investimento(s)
                </div>
                <div className="overflow-x-auto rounded-xl border border-[#DAD7CD] dark:border-[#34483A]">
                  <table className="w-full min-w-[720px] text-left">
                    <thead className="bg-[#F8F9F6] text-[11px] font-bold uppercase tracking-wider text-[#849187] dark:bg-[#17231B]">
                      <tr>
                        <th className="px-4 py-4">Descrição</th>
                        <th className="px-4 py-4">Data de registro</th>
                        <th className="px-4 py-4">Valor investido</th>
                        <th className="px-4 py-4">Taxa informada</th>
                        <th className="px-4 py-4 text-right">Ações</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#EEEDE7] dark:divide-[#34483A]">
                      {investimentosFiltrados.map((item) => (
                        <tr key={item.id} className="hover:bg-[#FAFBF8] dark:hover:bg-[#233328]">
                          <td className="px-4 py-4 text-sm font-semibold">{item.descricao}</td>
                          <td className="px-4 py-4 text-sm">{dataBR(item.data_registro)}</td>
                          <td className="px-4 py-4 text-sm font-bold">{moeda(item.valor)}</td>
                          <td className="px-4 py-4 text-sm">{item.taxa_juros == null ? "Não informada" : `${Number(item.taxa_juros).toLocaleString("pt-BR", { maximumFractionDigits: 2 })}%`}</td>
                          <td className="px-4 py-4">
                            <div className="flex justify-end gap-1">
                              <button type="button" title="Editar investimento" onClick={() => abrirEdicaoInvestimento(item)}
                                className="rounded-lg p-2 text-[#588157] hover:bg-[#E9F0E6] dark:hover:bg-[#2B3D30]"><Pencil size={16} /></button>
                              <button type="button" title="Excluir investimento" onClick={() => removerInvestimento(item.id)}
                                className="rounded-lg p-2 text-[#B66B61] hover:bg-[#F8E9E7] dark:hover:bg-[#3B2929]"><Trash2 size={16} /></button>
                            </div>
                          </td>
                        </tr>
                      ))}
                      {!investimentosFiltrados.length && (
                        <tr><td colSpan={5} className="px-4 py-14 text-center text-sm text-[#829085]">
                          {carregandoInvestimentos ? "Carregando investimentos..." : "Nenhum investimento encontrado. Utilize Novo registro para cadastrar."}
                        </td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
                {resumoInvestimentos && !busca && (
                  <p className="mt-4 text-xs text-[#829085]">
                    Total consolidado no MySQL: {moeda(resumoInvestimentos.total_investido)}
                  </p>
                )}
              </div>
            ) : moduloAtivo === "emprestimos" ? (
              <div className="p-5 sm:p-6">
                <MensagemErro mensagem={erroEmprestimos} />
                <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h3 className="text-lg font-bold">Gestão de empréstimos e financiamentos</h3>
                    <p className="mt-1 text-sm text-[#829085] dark:text-[#A1B0A3]">
                      Controle os valores contratados e as taxas informadas. Parcelas, quitação e saldo devedor ainda não são calculados automaticamente.
                    </p>
                  </div>
                  <button type="button" onClick={carregarDadosEmprestimos} disabled={carregandoEmprestimos}
                    className={CLASSE_BOTAO_SECUNDARIO}>
                    <RefreshCw size={16} /> {carregandoEmprestimos ? "Atualizando..." : "Atualizar"}
                  </button>
                </div>

                <div className="mb-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                  {[
                    { titulo: "Valor contratado (filtro)", valor: totalEmprestimosFiltrados, icone: HandCoins },
                    { titulo: "Contratos encontrados", valor: emprestimosFiltrados.length, icone: FileText, inteiro: true },
                    { titulo: "Taxa média informada", valor: resumoEmprestimos?.taxa_media_juros, icone: TrendingUp, percentual: true },
                  ].map((card) => {
                    const Icone = card.icone;
                    return <div key={card.titulo} className="rounded-xl border border-[#DAD7CD] bg-[#F8F9F6] p-4 dark:border-[#34483A] dark:bg-[#17231B]">
                      <div className="flex items-center justify-between gap-2 text-xs text-[#829085]">
                        <span>{card.titulo}</span><Icone size={17} className="text-[#588157]" />
                      </div>
                      <p className="mt-3 text-xl font-bold tabular-nums">
                        {carregandoEmprestimos ? "—" : card.inteiro ? card.valor
                          : card.percentual ? (Number(resumoEmprestimos?.contratos_com_taxa || 0) > 0
                            ? `${Number(card.valor || 0).toLocaleString("pt-BR", { maximumFractionDigits: 2 })}%` : "Não informada")
                          : moeda(card.valor)}
                      </p>
                    </div>;
                  })}
                </div>
                <p className="mb-5 text-xs text-[#829085]">
                  A taxa média considera apenas contratos com taxa informada; não representa juros acumulados.
                </p>

                <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                  <div className="relative min-w-[220px] flex-1">
                    <Search size={17} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#96A296]" />
                    <input className={`${CLASSE_CAMPO} pl-10`} placeholder="Buscar empréstimo ou financiamento..."
                      value={busca} onChange={(e) => setBusca(e.target.value)} />
                  </div>
                  <button type="button" className="text-xs font-semibold text-[#588157] hover:underline"
                    onClick={() => setBusca("")}>Limpar busca</button>
                </div>
                <div className="mb-3 text-xs text-[#829085]">
                  Exibindo {emprestimosFiltrados.length} de {emprestimos.length} contrato(s)
                </div>
                <div className="overflow-x-auto rounded-xl border border-[#DAD7CD] dark:border-[#34483A]">
                  <table className="w-full min-w-[720px] text-left">
                    <thead className="bg-[#F8F9F6] text-[11px] font-bold uppercase tracking-wider text-[#849187] dark:bg-[#17231B]">
                      <tr>
                        <th className="px-4 py-4">Descrição</th>
                        <th className="px-4 py-4">Contratação</th>
                        <th className="px-4 py-4">Valor contratado</th>
                        <th className="px-4 py-4">Taxa informada</th>
                        <th className="px-4 py-4 text-right">Ações</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#EEEDE7] dark:divide-[#34483A]">
                      {emprestimosFiltrados.map((item) => (
                        <tr key={item.id} className="hover:bg-[#FAFBF8] dark:hover:bg-[#233328]">
                          <td className="px-4 py-4 text-sm font-semibold">{item.descricao}</td>
                          <td className="px-4 py-4 text-sm">{dataBR(item.data_registro)}</td>
                          <td className="px-4 py-4 text-sm font-bold">{moeda(item.valor)}</td>
                          <td className="px-4 py-4 text-sm">{item.taxa_juros == null ? "Não informada" : `${Number(item.taxa_juros).toLocaleString("pt-BR", { maximumFractionDigits: 2 })}%`}</td>
                          <td className="px-4 py-4">
                            <div className="flex justify-end gap-1">
                              <button type="button" title="Editar contrato" onClick={() => abrirEdicaoEmprestimo(item)}
                                className="rounded-lg p-2 text-[#588157] hover:bg-[#E9F0E6] dark:hover:bg-[#2B3D30]"><Pencil size={16} /></button>
                              <button type="button" title="Excluir contrato" onClick={() => removerEmprestimo(item.id)}
                                className="rounded-lg p-2 text-[#B66B61] hover:bg-[#F8E9E7] dark:hover:bg-[#3B2929]"><Trash2 size={16} /></button>
                            </div>
                          </td>
                        </tr>
                      ))}
                      {!emprestimosFiltrados.length && (
                        <tr><td colSpan={5} className="px-4 py-14 text-center text-sm text-[#829085]">
                          {carregandoEmprestimos ? "Carregando contratos..." : "Nenhum contrato encontrado. Utilize Novo registro para cadastrar."}
                        </td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
                {resumoEmprestimos && !busca && (
                  <p className="mt-4 text-xs text-[#829085]">
                    Total consolidado no MySQL: {moeda(resumoEmprestimos.total_contratado)}
                  </p>
                )}
              </div>
            ) : moduloAtivo === "patrimonio" ? (
              <div className="p-5 sm:p-6">
                <MensagemErro mensagem={erroPatrimonio} />
                <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h3 className="text-lg font-bold">Gestão patrimonial</h3>
                    <p className="mt-1 text-sm text-[#829085] dark:text-[#A1B0A3]">
                      Cadastre e acompanhe os bens e ativos da empresa. Valores registrados, sem depreciação automática.
                    </p>
                  </div>
                  <button type="button" onClick={carregarDadosPatrimonio} disabled={carregandoPatrimonio}
                    className={CLASSE_BOTAO_SECUNDARIO}>
                    <RefreshCw size={16} /> {carregandoPatrimonio ? "Atualizando..." : "Atualizar"}
                  </button>
                </div>

                <div className="mb-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                  {[
                    { titulo: "Valor total", valor: resumoPatrimonioFiltrado.ativos + resumoPatrimonioFiltrado.outros, icone: Landmark },
                    { titulo: "Ativos", valor: resumoPatrimonioFiltrado.ativos, icone: Package },
                    { titulo: "Outros bens patrimoniais", valor: resumoPatrimonioFiltrado.outros, icone: Building2 },
                    { titulo: "Bens cadastrados", valor: resumoPatrimonioFiltrado.quantidade, icone: FileText, inteiro: true },
                  ].map((card) => {
                    const Icone = card.icone;
                    return <div key={card.titulo} className="rounded-xl border border-[#DAD7CD] bg-[#F8F9F6] p-4 dark:border-[#34483A] dark:bg-[#17231B]">
                      <div className="flex items-center justify-between gap-2 text-xs text-[#829085]">
                        <span>{card.titulo}</span><Icone size={17} className="text-[#588157]" />
                      </div>
                      <p className="mt-3 text-xl font-bold tabular-nums">{carregandoPatrimonio ? "—" : card.inteiro ? card.valor : moeda(card.valor)}</p>
                    </div>;
                  })}
                </div>

                <div className="mb-4 grid gap-3 sm:grid-cols-[1fr_200px]">
                  <div className="relative">
                    <Search size={17} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#96A296]" />
                    <input className={`${CLASSE_CAMPO} pl-10`} placeholder="Buscar patrimônio pela descrição..."
                      value={busca} onChange={(e) => setBusca(e.target.value)} />
                  </div>
                  <select className={CLASSE_CAMPO} value={filtroTipoPatrimonio}
                    onChange={(e) => setFiltroTipoPatrimonio(e.target.value)} aria-label="Filtrar tipo patrimonial">
                    <option value="Todos">Todos os tipos</option>
                    <option value="ativo">Ativos</option>
                    <option value="patrimonio">Outros bens patrimoniais</option>
                  </select>
                </div>
                <div className="mb-4 flex flex-wrap items-center justify-between gap-2 text-xs text-[#829085]">
                  <span>Exibindo {patrimoniosFiltrados.length} de {patrimonios.length} bem(ns)</span>
                  <button type="button" className="font-semibold text-[#588157] hover:underline"
                    onClick={() => { setBusca(""); setFiltroTipoPatrimonio("Todos"); }}>Limpar filtros</button>
                </div>
                <div className="overflow-x-auto rounded-xl border border-[#DAD7CD] dark:border-[#34483A]">
                  <table className="w-full min-w-[650px] text-left">
                    <thead className="bg-[#F8F9F6] text-[11px] font-bold uppercase tracking-wider text-[#849187] dark:bg-[#17231B]">
                      <tr>
                        <th className="px-4 py-4">Descrição</th>
                        <th className="px-4 py-4">Tipo</th>
                        <th className="px-4 py-4">Data de registro</th>
                        <th className="px-4 py-4">Valor</th>
                        <th className="px-4 py-4 text-right">Ações</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#EEEDE7] dark:divide-[#34483A]">
                      {patrimoniosFiltrados.map((item) => (
                        <tr key={item.id} className="hover:bg-[#FAFBF8] dark:hover:bg-[#233328]">
                          <td className="px-4 py-4 text-sm font-semibold">{item.descricao}</td>
                          <td className="px-4 py-4 text-sm">{item.tipo === "ativo" ? "Ativo" : "Bem patrimonial"}</td>
                          <td className="px-4 py-4 text-sm">{dataBR(item.data_registro)}</td>
                          <td className="px-4 py-4 text-sm font-bold">{moeda(item.valor)}</td>
                          <td className="px-4 py-4">
                            <div className="flex justify-end gap-1">
                              <button type="button" title="Editar patrimônio" onClick={() => abrirEdicaoPatrimonio(item)}
                                className="rounded-lg p-2 text-[#588157] hover:bg-[#E9F0E6] dark:hover:bg-[#2B3D30]"><Pencil size={16} /></button>
                              <button type="button" title="Excluir patrimônio" onClick={() => removerPatrimonio(item.id)}
                                className="rounded-lg p-2 text-[#B66B61] hover:bg-[#F8E9E7] dark:hover:bg-[#3B2929]"><Trash2 size={16} /></button>
                            </div>
                          </td>
                        </tr>
                      ))}
                      {!patrimoniosFiltrados.length && (
                        <tr><td colSpan={5} className="px-4 py-14 text-center text-sm text-[#829085]">
                          {carregandoPatrimonio ? "Carregando patrimônio..." : "Nenhum bem encontrado. Utilize Novo registro para cadastrar."}
                        </td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
                {resumoPatrimonio && !busca && filtroTipoPatrimonio === "Todos" && (
                  <p className="mt-4 text-xs text-[#829085]">Total consolidado no MySQL: {moeda(resumoPatrimonio.valor_total)}</p>
                )}
              </div>
            ) : moduloAtivo === "folha" ? (
              <div className="p-5 sm:p-6">
                <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h3 className="text-lg font-bold">Controle financeiro da folha</h3>
                    <p className="mt-1 text-sm text-[#829085] dark:text-[#A1B0A3]">
                      Lançamentos reais da categoria Salários / Folha de Pagamento.
                      Não inclui cálculo automático de encargos trabalhistas.
                    </p>
                  </div>
                  <span className="rounded-full bg-[#E9F0E6] px-3 py-2 text-xs font-semibold text-[#48634D] dark:bg-[#2B3D30] dark:text-[#A3B18A]">
                    {lancamentosFolha.length} lançamento(s)
                  </span>
                </div>

                <div className="mb-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                  {[
                    { titulo: "Total previsto", valor: resumoFolha.previsto, icone: Receipt },
                    { titulo: "Total pago", valor: resumoFolha.pago, icone: TrendingUp },
                    { titulo: "A pagar", valor: resumoFolha.pendente, icone: CalendarClock },
                    { titulo: "Em atraso", valor: resumoFolha.atrasado, icone: AlertCircle },
                  ].map((card) => {
                    const Icone = card.icone;
                    return (
                      <div key={card.titulo} className="rounded-xl border border-[#DAD7CD] bg-[#F8F9F6] p-4 dark:border-[#34483A] dark:bg-[#17231B]">
                        <div className="flex items-center justify-between gap-2 text-xs text-[#829085]">
                          <span>{card.titulo}</span><Icone size={17} className="text-[#588157]" />
                        </div>
                        <p className="mt-3 text-xl font-bold tabular-nums">{moeda(card.valor)}</p>
                      </div>
                    );
                  })}
                </div>

                <div className="mb-5 grid gap-3 md:grid-cols-[1fr_180px_180px]">
                  <div className="relative">
                    <Search size={17} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#96A296]" />
                    <input className={`${CLASSE_CAMPO} pl-10`} placeholder="Buscar folha pela descrição..."
                      value={busca} onChange={(e) => setBusca(e.target.value)} />
                  </div>
                  <input type="month" aria-label="Competência" className={CLASSE_CAMPO}
                    value={mesFolha} onChange={(e) => setMesFolha(e.target.value)} />
                  <select aria-label="Situação da folha" className={CLASSE_CAMPO}
                    value={situacaoFolha} onChange={(e) => setSituacaoFolha(e.target.value)}>
                    <option value="Todos">Todas as situações</option>
                    <option value="Pendente">Pendente</option>
                    <option value="Atrasado">Atrasado</option>
                    <option value="Pago">Pago</option>
                    <option value="Cancelado">Cancelado</option>
                  </select>
                </div>
                <div className="mb-4 flex items-center justify-between gap-3 text-xs text-[#829085]">
                  <span>Exibindo {folhasFiltradas.length} de {lancamentosFolha.length} lançamento(s)</span>
                  <button type="button" className="font-semibold text-[#588157] hover:underline"
                    onClick={() => { setMesFolha(""); setSituacaoFolha("Todos"); setBusca(""); }}>
                    Limpar filtros
                  </button>
                </div>
                <div className="overflow-x-auto rounded-xl border border-[#DAD7CD] dark:border-[#34483A]">
                  <table className="w-full min-w-[780px] text-left">
                    <thead className="bg-[#F8F9F6] text-[11px] font-bold uppercase tracking-wider text-[#849187] dark:bg-[#17231B]">
                      <tr>
                        <th className="px-4 py-4">Descrição</th>
                        <th className="px-4 py-4">Competência</th>
                        <th className="px-4 py-4">Vencimento</th>
                        <th className="px-4 py-4">Valor</th>
                        <th className="px-4 py-4">Situação</th>
                        <th className="px-4 py-4 text-right">Ações</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#EEEDE7] dark:divide-[#34483A]">
                      {folhasFiltradas.map((item) => (
                        <tr key={item.id} className="hover:bg-[#FAFBF8] dark:hover:bg-[#233328]">
                          <td className="px-4 py-4 text-sm font-semibold">{item.descricao}</td>
                          <td className="px-4 py-4 text-sm">{String(item.data_vencimento || "").slice(0, 7).split("-").reverse().join("/")}</td>
                          <td className="px-4 py-4 text-sm">{dataBR(item.data_vencimento)}</td>
                          <td className="px-4 py-4 text-sm font-bold">{moeda(item.valor)}</td>
                          <td className="px-4 py-4 text-sm">{rotuloStatus(item)}</td>
                          <td className="px-4 py-4">
                            <div className="flex justify-end gap-1">
                              <button type="button" title="Editar folha" onClick={() => abrirEdicaoFolha(item)}
                                className="rounded-lg p-2 text-[#588157] hover:bg-[#E9F0E6]"><Pencil size={16} /></button>
                              <button type="button" title="Excluir folha" onClick={() => excluirRegistro(item.id)}
                                className="rounded-lg p-2 text-[#B66B61] hover:bg-[#F8E9E7]"><Trash2 size={16} /></button>
                            </div>
                          </td>
                        </tr>
                      ))}
                      {!folhasFiltradas.length && (
                        <tr><td colSpan={6} className="px-4 py-14 text-center text-sm text-[#829085]">
                          Nenhuma folha encontrada para os filtros selecionados. Utilize Novo registro para cadastrar.
                        </td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : moduloAtivo === "bancos" ? (
              <>
                {/* ======================================
                    MOVIMENTAÇÕES BANCÁRIAS
                ====================================== */}

                <div className="p-5 sm:p-6">
                  <MensagemErro mensagem={erroBancos} />

                  <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
                    <div>
                      <h3 className="text-lg font-bold">
                        Gestão de contas bancárias
                      </h3>

                      <p className="mt-1 text-sm text-[#829085]">
                        Gerencie suas contas, saldos e movimentações.
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={carregarDadosBancarios}
                        disabled={carregandoBancos}
                        className={CLASSE_BOTAO_SECUNDARIO}
                      >
                        <RefreshCw size={16} />
                        Atualizar
                      </button>

                      <button
                        type="button"
                        onClick={abrirNovaContaBancaria}
                        className={CLASSE_BOTAO}
                      >
                        <Plus size={17} />
                        Nova conta
                      </button>
                    </div>
                  </div>

                  {/* SALDO TOTAL */}
                  <div className="relative mb-6 overflow-hidden rounded-2xl bg-[#344E41] p-6 text-white dark:bg-[#26382B] sm:p-8">
                    <div className="pointer-events-none absolute -right-12 -top-16 h-48 w-48 rounded-full bg-[#A3B18A]/15 blur-2xl" />

                    <div className="relative">
                      <div className="flex items-center gap-2 text-sm text-[#DAD7CD]">
                        <Wallet size={18} />
                        Saldo bancário total
                      </div>

                      <h3 className="mt-3 text-3xl font-bold tabular-nums sm:text-4xl">
                        {carregandoBancos
                          ? "Carregando..."
                          : moeda(saldoTotalBancario)}
                      </h3>

                      <p className="mt-3 text-xs text-[#DAD7CD]">
                        Saldo consolidado de {contasBancarias.length} conta(s)
                        bancária(s)
                      </p>
                    </div>
                  </div>

                  {/* RESUMO DAS MOVIMENTAÇÕES */}
                  <div className="mb-6 grid gap-4 sm:grid-cols-3">
                    <div className="rounded-xl border border-[#DAD7CD] bg-[#F8F9F6] p-5 dark:border-[#34483A] dark:bg-[#17231B]">
                      <div className="flex items-center gap-2 text-sm text-[#829085]">
                        <TrendingUp size={17} className="text-[#588157]" />
                        Entradas filtradas
                      </div>

                      <p className="mt-3 text-xl font-bold text-[#588157]">
                        {moeda(resumoExtrato.entradas)}
                      </p>
                    </div>

                    <div className="rounded-xl border border-[#DAD7CD] bg-[#F8F9F6] p-5 dark:border-[#34483A] dark:bg-[#17231B]">
                      <div className="flex items-center gap-2 text-sm text-[#829085]">
                        <TrendingDown size={17} className="text-[#B66B61]" />
                        Saídas filtradas
                      </div>

                      <p className="mt-3 text-xl font-bold text-[#B66B61]">
                        {moeda(resumoExtrato.saidas)}
                      </p>
                    </div>

                    <div className="rounded-xl border border-[#DAD7CD] bg-[#F8F9F6] p-5 dark:border-[#34483A] dark:bg-[#17231B]">
                      <div className="flex items-center gap-2 text-sm text-[#829085]">
                        <CircleDollarSign size={17} className="text-[#588157]" />
                        Resultado filtrado
                      </div>

                      <p className="mt-3 text-xl font-bold">
                        {moeda(
                          resumoExtrato.entradas - resumoExtrato.saidas
                        )}
                      </p>
                    </div>
                  </div>

                  {/* CONTAS BANCÁRIAS */}
                  <h3 className="mb-4 text-base font-bold">
                    Contas cadastradas
                  </h3>

                  <div className="mb-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                    {contasBancarias.map((conta) => (
                      <div
                        key={conta.id}
                        className="rounded-2xl border border-[#DAD7CD] bg-[#FAFAF8] p-5 transition hover:shadow-md dark:border-[#34483A] dark:bg-[#17231B]"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="rounded-xl bg-[#E9F0E6] p-3 text-[#588157] dark:bg-[#2B3D30]">
                            <Landmark size={23} />
                          </div>

                          <div className="flex gap-1">
                            <button
                              type="button"
                              onClick={() =>
                                abrirEdicaoContaBancaria(conta)
                              }
                              className="rounded-lg p-2 text-[#588157] hover:bg-[#E9F0E6] dark:hover:bg-[#2B3D30]"
                              title="Editar conta"
                            >
                              <Pencil size={16} />
                            </button>

                            <button
                              type="button"
                              onClick={() =>
                                removerContaBancaria(conta.id)
                              }
                              className="rounded-lg p-2 text-[#B66B61] hover:bg-[#F8E9E7] dark:hover:bg-[#3B2928]"
                              title="Excluir conta"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>

                        <h4 className="mt-4 font-bold">
                          {conta.nome_banco}
                        </h4>

                        <p className="mt-1 text-xs capitalize text-[#849187]">
                          {conta.tipo_conta}
                        </p>

                        <div className="mt-5 border-t border-[#DAD7CD] pt-4 dark:border-[#34483A]">
                          <p className="text-xs text-[#849187]">
                            Saldo disponível
                          </p>

                          <p className="mt-1 text-2xl font-bold tabular-nums text-[#588157]">
                            {moeda(saldoConta(conta))}
                          </p>

                          <p className="mt-2 text-xs text-[#849187]">
                            Saldo inicial: {moeda(conta.saldo_inicial)}
                          </p>
                        </div>
                      </div>
                    ))}

                    {!contasBancarias.length && !carregandoBancos && (
                      <div className="col-span-full rounded-xl border border-dashed border-[#DAD7CD] p-10 text-center dark:border-[#34483A]">
                        <Landmark
                          size={30}
                          className="mx-auto mb-3 text-[#588157]"
                        />

                        <p className="font-semibold">
                          Nenhuma conta bancária cadastrada
                        </p>

                        <p className="mt-2 text-sm text-[#829085]">
                          Clique em Nova conta para começar.
                        </p>
                      </div>
                    )}
                  </div>

                  {/* EXTRATO BANCÁRIO */}
                  <div className="border-t border-[#DAD7CD] pt-6 dark:border-[#34483A]">
                    <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <h3 className="text-lg font-bold">
                          Extrato bancário
                        </h3>

                        <p className="mt-1 text-sm text-[#829085]">
                          Consulte entradas e saídas registradas.
                        </p>
                      </div>

                      <span className="rounded-full bg-[#E9F0E6] px-3 py-1.5 text-xs font-semibold text-[#588157] dark:bg-[#2B3D30]">
                        {extratoFiltrado.length} movimentação(ões)
                      </span>
                    </div>

                    {/* FILTROS */}
                    <div className="mb-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
                      <div className="relative">
                        <Search
                          size={17}
                          className="absolute left-3 top-1/2 -translate-y-1/2 text-[#96A296]"
                        />

                        <input
                          value={busca}
                          onChange={(e) => setBusca(e.target.value)}
                          placeholder="Pesquisar..."
                          className={`${CLASSE_CAMPO} pl-10`}
                        />
                      </div>

                      <select
                        value={filtroContaBanco}
                        onChange={(e) =>
                          setFiltroContaBanco(e.target.value)
                        }
                        className={CLASSE_CAMPO}
                        aria-label="Filtrar por conta"
                      >
                        <option value="Todas">Todas as contas</option>

                        {contasBancarias.map((conta) => (
                          <option
                            key={conta.id}
                            value={String(conta.id)}
                          >
                            {conta.nome_banco}
                          </option>
                        ))}
                      </select>

                      <select
                        value={filtroTipoBanco}
                        onChange={(e) =>
                          setFiltroTipoBanco(e.target.value)
                        }
                        className={CLASSE_CAMPO}
                        aria-label="Filtrar por tipo"
                      >
                        <option value="Todos">Entradas e saídas</option>
                        <option value="entrada">Entradas</option>
                        <option value="saida">Saídas</option>
                      </select>

                      <input
                        type="date"
                        value={dataInicioBanco}
                        onChange={(e) =>
                          setDataInicioBanco(e.target.value)
                        }
                        className={CLASSE_CAMPO}
                        aria-label="Data inicial"
                      />

                      <input
                        type="date"
                        value={dataFimBanco}
                        min={dataInicioBanco || undefined}
                        onChange={(e) =>
                          setDataFimBanco(e.target.value)
                        }
                        className={CLASSE_CAMPO}
                        aria-label="Data final"
                      />
                    </div>

                    {/* TABELA DO EXTRATO */}
                    <div className="overflow-x-auto">
                      <table className="w-full min-w-[760px] text-left">
                        <thead className="bg-[#F8F9F6] text-[11px] font-bold uppercase tracking-wider text-[#849187] dark:bg-[#17231B]">
                          <tr>
                            <th className="px-4 py-4">Data</th>
                            <th className="px-4 py-4">Descrição</th>
                            <th className="px-4 py-4">Conta</th>
                            <th className="px-4 py-4">Tipo</th>
                            <th className="px-4 py-4">Valor</th>
                            <th className="px-4 py-4 text-right">
                              Ações
                            </th>
                          </tr>
                        </thead>

                        <tbody className="divide-y divide-[#EEEDE7] dark:divide-[#34483A]">
                          {extratoFiltrado.map((item) => {
                            const conta = contasBancarias.find(
                              (c) =>
                                Number(c.id) ===
                                Number(item.conta_bancaria_id)
                            );

                            return (
                              <tr
                                key={item.id}
                                className="transition hover:bg-[#FAFBF8] dark:hover:bg-[#233328]"
                              >
                                <td className="px-4 py-4 text-sm text-[#849187]">
                                  {dataBR(item.data_movimentacao)}
                                </td>

                                <td className="px-4 py-4">
                                  <p className="text-sm font-semibold">
                                    {item.descricao}
                                  </p>

                                  <p className="mt-1 text-xs text-[#849187]">
                                    {item.categoria || "Sem categoria"}
                                  </p>
                                </td>

                                <td className="px-4 py-4 text-sm">
                                  {item.nome_banco ||
                                    conta?.nome_banco ||
                                    "—"}
                                </td>

                                <td className="px-4 py-4">
                                  <span
                                    className={`rounded-lg px-2.5 py-1.5 text-xs font-semibold ${
                                      item.tipo === "entrada"
                                        ? "bg-[#E9F2E7] text-[#4F7851] dark:bg-[#2B4030] dark:text-[#A3B18A]"
                                        : "bg-[#F8E9E7] text-[#B65F55] dark:bg-[#3B2928] dark:text-[#E4A29B]"
                                    }`}
                                  >
                                    {item.tipo === "entrada"
                                      ? "Entrada"
                                      : "Saída"}
                                  </span>
                                </td>

                                <td
                                  className={`px-4 py-4 text-sm font-bold ${
                                    item.tipo === "entrada"
                                      ? "text-[#588157]"
                                      : "text-[#B66B61]"
                                  }`}
                                >
                                  {item.tipo === "entrada" ? "+" : "−"}
                                  {moeda(item.valor)}
                                </td>

                                <td className="px-4 py-4">
                                  <div className="flex justify-end gap-1">
                                    <button
                                      type="button"
                                      onClick={() =>
                                        abrirEdicaoMovimentacaoBancaria(item)
                                      }
                                      title="Editar movimentação"
                                      className="rounded-lg p-2 text-[#588157] hover:bg-[#E9F0E6]"
                                    >
                                      <Pencil size={16} />
                                    </button>

                                    <button
                                      type="button"
                                      onClick={() =>
                                        removerMovimentacaoBancaria(item.id)
                                      }
                                      title="Excluir movimentação"
                                      className="rounded-lg p-2 text-[#B66B61] hover:bg-[#F8E9E7]"
                                    >
                                      <Trash2 size={16} />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            );
                          })}

                          {!extratoFiltrado.length && (
                            <tr>
                              <td
                                colSpan={6}
                                className="px-4 py-14 text-center text-sm text-[#829085]"
                              >
                                {carregandoBancos
                                  ? "Carregando movimentações..."
                                  : "Nenhuma movimentação bancária encontrada."}
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </>
            ) : moduloAtivo === "pessoas" ? (
              <>
                {/* CLIENTES E FORNECEDORES */}
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#E7E5DE] p-5 dark:border-[#34483A]">
                  <div className="relative w-full sm:max-w-sm">
                    <Search
                      size={17}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-[#96A296]"
                    />

                    <input
                      value={busca}
                      onChange={(e) => setBusca(e.target.value)}
                      placeholder="Buscar nome, documento, e-mail ou telefone..."
                      className={`${CLASSE_CAMPO} pl-10`}
                    />
                  </div>

                  <select
                    value={filtro}
                    onChange={(e) => setFiltro(e.target.value)}
                    className={CLASSE_CAMPO}
                    aria-label="Filtrar pessoas"
                  >
                    <option value="Todos">Todos</option>
                    <option value="cliente">Clientes</option>
                    <option value="fornecedor">Fornecedores</option>
                  </select>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full min-w-[760px] text-left">
                    <thead className="bg-[#F8F9F6] text-[11px] font-bold uppercase tracking-wider text-[#849187] dark:bg-[#17231B]">
                      <tr>
                        <th className="px-6 py-4">Nome / Razão social</th>
                        <th className="px-6 py-4">Tipo</th>
                        <th className="px-6 py-4">Documento</th>
                        <th className="px-6 py-4">Contato</th>
                        <th className="px-6 py-4 text-right">Ações</th>
                      </tr>
                    </thead>

                    <tbody className="divide-y divide-[#EEEDE7] dark:divide-[#34483A]">
                      {pessoasFiltradas.map((pessoa) => (
                        <tr
                          key={pessoa.id}
                          className="transition hover:bg-[#FAFBF8] dark:hover:bg-[#233328]"
                        >
                          <td className="px-6 py-4 text-sm font-semibold">
                            {pessoa.nome_razao}
                          </td>

                          <td className="px-6 py-4">
                            <span className="rounded-lg bg-[#EEF1EB] px-2.5 py-1.5 text-xs font-semibold text-[#536C56] dark:bg-[#2B3D30] dark:text-[#C0D0B9]">
                              {pessoa.tipo === "cliente"
                                ? "Cliente"
                                : "Fornecedor"}
                            </span>
                          </td>

                          <td className="px-6 py-4 text-sm">
                            {pessoa.documento || "—"}
                          </td>

                          <td className="px-6 py-4 text-sm">
                            <div>{pessoa.email || "—"}</div>
                            <div className="mt-1 text-xs text-[#849187]">
                              {pessoa.telefone || "—"}
                            </div>
                          </td>

                          <td className="px-6 py-4">
                            <div className="flex justify-end gap-1">
                              <button
                                type="button"
                                onClick={() =>
                                  abrirEdicaoPessoa(pessoa)
                                }
                                title="Editar"
                                className="rounded-lg p-2 text-[#588157] hover:bg-[#E9F0E6]"
                              >
                                <Pencil size={16} />
                              </button>

                              <button
                                type="button"
                                onClick={() =>
                                  excluirPessoa(pessoa.id)
                                }
                                title="Excluir"
                                className="rounded-lg p-2 text-[#B66B61] hover:bg-[#F8E9E7]"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}

                      {!pessoasFiltradas.length && (
                        <tr>
                          <td
                            colSpan={5}
                            className="px-6 py-16 text-center text-sm text-[#829085]"
                          >
                            Nenhum cliente ou fornecedor encontrado.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                <div className="border-t border-[#E7E5DE] px-6 py-4 text-xs text-[#829085] dark:border-[#34483A]">
                  Exibindo {pessoasFiltradas.length} de {pessoas.length} cadastros
                  · Dados do MySQL
                </div>
              </>
            ) : (
              <>
                {/* MOVIMENTAÇÕES FINANCEIRAS */}
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#E7E5DE] p-5 dark:border-[#34483A]">
                  <div className="relative w-full sm:max-w-sm">
                    <Search
                      size={17}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-[#96A296]"
                    />

                    <input
                      value={busca}
                      onChange={(e) => setBusca(e.target.value)}
                      placeholder="Pesquisar registros..."
                      className={`${CLASSE_CAMPO} pl-10`}
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <Filter size={16} className="text-[#879488]" />

                    <select
                      value={filtro}
                      onChange={(e) => setFiltro(e.target.value)}
                      className={CLASSE_CAMPO}
                    >
                      <option>Todos</option>
                      <option>Pago</option>
                      <option>Recebido</option>
                      <option>Pendente</option>
                      <option>Atrasado</option>
                      <option>Cancelado</option>
                    </select>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full min-w-[680px] text-left">
                    <thead>
                      <tr className="bg-[#F8F9F6] text-[11px] font-bold uppercase tracking-wider text-[#849187] dark:bg-[#17231B]">
                        <th className="px-6 py-4">Descrição</th>
                        <th className="px-6 py-4">Categoria</th>
                        <th className="px-6 py-4">Valor</th>
                        <th className="px-6 py-4">Vencimento</th>
                        <th className="px-6 py-4">Status</th>
                        <th className="px-6 py-4 text-right">Ações</th>
                      </tr>
                    </thead>

                    <tbody className="divide-y divide-[#EEEDE7] dark:divide-[#34483A]">
                      {registrosFiltrados.map((item) => (
                        <tr
                          key={item.id}
                          className="transition hover:bg-[#FAFBF8] dark:hover:bg-[#233328]"
                        >
                          <td className="px-6 py-4 text-sm font-semibold">
                            {item.descricao}
                          </td>

                          <td className="px-6 py-4">
                            <span className="rounded-lg bg-[#EEF1EB] px-2.5 py-1.5 text-xs text-[#536C56] dark:bg-[#2B3D30] dark:text-[#C0D0B9]">
                              {item.categoria_nome} · {tituloTipo(item.tipo)}
                            </span>
                          </td>

                          <td className="px-6 py-4 text-sm font-semibold">
                            {moeda(item.valor)}
                          </td>

                          <td className="px-6 py-4 text-sm text-[#849187]">
                            {dataBR(item.data_vencimento)}
                          </td>

                          <td className="px-6 py-4">
                            <span
                              className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                                item.status === "pago"
                                  ? "bg-[#E9F2E7] text-[#4F7851]"
                                  : item.status === "cancelado" ||
                                      rotuloStatus(item) === "Atrasado"
                                    ? "bg-[#F8E9E7] text-[#B65F55]"
                                    : "bg-[#F5F0E4] text-[#A38345]"
                              }`}
                            >
                              {rotuloStatus(item)}
                            </span>
                          </td>

                          <td className="px-6 py-4">
                            <div className="flex justify-end gap-1">
                              <button
                                type="button"
                                onClick={() => abrirEdicao(item)}
                                title="Editar"
                                className="rounded-lg p-2 text-[#588157] hover:bg-[#E9F0E6]"
                              >
                                <Pencil size={16} />
                              </button>

                              <button
                                type="button"
                                onClick={() => excluirRegistro(item.id)}
                                title="Excluir"
                                className="rounded-lg p-2 text-[#B66B61] hover:bg-[#F8E9E7]"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}

                      {!registrosFiltrados.length && (
                        <tr>
                          <td
                            colSpan={6}
                            className="px-6 py-16 text-center text-sm text-[#829085]"
                          >
                            Nenhum registro encontrado. Clique em Novo registro
                            para cadastrar.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                <div className="flex justify-between border-t border-[#E7E5DE] px-6 py-4 text-xs text-[#829085] dark:border-[#34483A]">
                  <span>
                    Exibindo {registrosFiltrados.length} de {registros.length} registros
                  </span>
                  <span>Dados reais do MySQL</span>
                </div>
              </>
            )}
          </section>
        </div>
      </main>

      {/* ======================================
          MODAL - INVESTIMENTOS
      ====================================== */}
      {modalInvestimento && (
        <Modal
          titulo={investimentoEditando !== null ? "Editar investimento" : "Novo investimento"}
          subtitulo="Cadastro de aplicações financeiras da empresa"
          fechar={() => setModalInvestimento(false)}
        >
          <form onSubmit={salvarInvestimento}>
            <MensagemErro mensagem={erroFormularioInvestimento} />
            <div className="grid gap-4 sm:grid-cols-2">
              <Campo label="Valor investido (R$)">
                <input required type="number" min="0.01" step="0.01" className={CLASSE_CAMPO}
                  value={formInvestimento.valor}
                  onChange={(e) => setFormInvestimento({ ...formInvestimento, valor: e.target.value })} />
              </Campo>
              <Campo label="Taxa informada (%) — opcional">
                <input type="number" min="0" max="999.99" step="0.01" className={CLASSE_CAMPO}
                  value={formInvestimento.taxa_juros}
                  onChange={(e) => setFormInvestimento({ ...formInvestimento, taxa_juros: e.target.value })}
                  placeholder="Ex.: 1.20" />
              </Campo>
              <Campo label="Descrição do investimento" className="sm:col-span-2">
                <input required maxLength={255} className={CLASSE_CAMPO}
                  placeholder="Ex.: Aplicação em CDB"
                  value={formInvestimento.descricao}
                  onChange={(e) => setFormInvestimento({ ...formInvestimento, descricao: e.target.value })} />
              </Campo>
              <Campo label="Data do investimento" className="sm:col-span-2">
                <input required type="date" className={CLASSE_CAMPO}
                  value={formInvestimento.data_registro}
                  onChange={(e) => setFormInvestimento({ ...formInvestimento, data_registro: e.target.value })} />
              </Campo>
            </div>
            <p className="mt-4 text-xs text-[#829085]">
              A taxa é apenas informativa. O sistema não calcula rendimentos, resgates nem saldo atualizado automaticamente.
            </p>
            <div className="mt-7 flex flex-wrap justify-end gap-3">
              <button type="button" onClick={() => setModalInvestimento(false)} className={CLASSE_BOTAO_SECUNDARIO}>Cancelar</button>
              <button type="submit" disabled={salvandoInvestimento} className={CLASSE_BOTAO}>
                <Save size={16} /> {salvandoInvestimento ? "Salvando..." : "Salvar investimento"}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* ======================================
          MODAL - EMPRÉSTIMOS E FINANCIAMENTOS
      ====================================== */}
      {modalEmprestimo && (
        <Modal
          titulo={emprestimoEditando !== null ? "Editar contrato" : "Novo empréstimo ou financiamento"}
          subtitulo="Cadastro de contratos financeiros da empresa"
          fechar={() => setModalEmprestimo(false)}
        >
          <form onSubmit={salvarEmprestimo}>
            <MensagemErro mensagem={erroFormularioEmprestimo} />
            <div className="grid gap-4 sm:grid-cols-2">
              <Campo label="Valor contratado (R$)">
                <input required type="number" min="0.01" step="0.01" className={CLASSE_CAMPO}
                  value={formEmprestimo.valor}
                  onChange={(e) => setFormEmprestimo({ ...formEmprestimo, valor: e.target.value })} />
              </Campo>
              <Campo label="Taxa de juros (%) — opcional">
                <input type="number" min="0" max="999.99" step="0.01" className={CLASSE_CAMPO}
                  value={formEmprestimo.taxa_juros}
                  onChange={(e) => setFormEmprestimo({ ...formEmprestimo, taxa_juros: e.target.value })}
                  placeholder="Ex.: 1.50" />
              </Campo>
              <Campo label="Descrição do contrato" className="sm:col-span-2">
                <input required maxLength={255} className={CLASSE_CAMPO}
                  placeholder="Ex.: Financiamento de equipamentos"
                  value={formEmprestimo.descricao}
                  onChange={(e) => setFormEmprestimo({ ...formEmprestimo, descricao: e.target.value })} />
              </Campo>
              <Campo label="Data da contratação" className="sm:col-span-2">
                <input required type="date" className={CLASSE_CAMPO}
                  value={formEmprestimo.data_registro}
                  onChange={(e) => setFormEmprestimo({ ...formEmprestimo, data_registro: e.target.value })} />
              </Campo>
            </div>
            <p className="mt-4 text-xs text-[#829085]">
              A taxa deve ser informada conforme o contrato. O cadastro não gera parcelas nem calcula saldo devedor.
            </p>
            <div className="mt-7 flex flex-wrap justify-end gap-3">
              <button type="button" onClick={() => setModalEmprestimo(false)} className={CLASSE_BOTAO_SECUNDARIO}>Cancelar</button>
              <button type="submit" disabled={salvandoEmprestimo} className={CLASSE_BOTAO}>
                <Save size={16} /> {salvandoEmprestimo ? "Salvando..." : "Salvar contrato"}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* ======================================
          MODAL - PATRIMÔNIO E ATIVOS
      ====================================== */}
      {modalPatrimonio && (
        <Modal titulo={patrimonioEditando !== null ? "Editar patrimônio" : "Novo patrimônio ou ativo"}
          subtitulo="Registro de bens da empresa" fechar={() => setModalPatrimonio(false)}>
          <form onSubmit={salvarPatrimonio}>
            <MensagemErro mensagem={erroFormularioPatrimonio} />
            <div className="grid gap-4 sm:grid-cols-2">
              <Campo label="Tipo">
                <select required className={CLASSE_CAMPO} value={formPatrimonio.tipo}
                  onChange={(e) => setFormPatrimonio({ ...formPatrimonio, tipo: e.target.value })}>
                  <option value="ativo">Ativo</option>
                  <option value="patrimonio">Bem patrimonial</option>
                </select>
              </Campo>
              <Campo label="Valor (R$)">
                <input required type="number" min="0" step="0.01" className={CLASSE_CAMPO}
                  value={formPatrimonio.valor}
                  onChange={(e) => setFormPatrimonio({ ...formPatrimonio, valor: e.target.value })} />
              </Campo>
              <Campo label="Descrição" className="sm:col-span-2">
                <input required maxLength={255} className={CLASSE_CAMPO}
                  placeholder="Ex.: Computadores do escritório"
                  value={formPatrimonio.descricao}
                  onChange={(e) => setFormPatrimonio({ ...formPatrimonio, descricao: e.target.value })} />
              </Campo>
              <Campo label="Data de registro" className="sm:col-span-2">
                <input required type="date" className={CLASSE_CAMPO}
                  value={formPatrimonio.data_registro}
                  onChange={(e) => setFormPatrimonio({ ...formPatrimonio, data_registro: e.target.value })} />
              </Campo>
            </div>
            <div className="mt-7 flex flex-wrap justify-end gap-3">
              <button type="button" onClick={() => setModalPatrimonio(false)} className={CLASSE_BOTAO_SECUNDARIO}>Cancelar</button>
              <button type="submit" disabled={salvandoPatrimonio} className={CLASSE_BOTAO}>
                <Save size={16} /> {salvandoPatrimonio ? "Salvando..." : "Salvar patrimônio"}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* ======================================
          MODAL - FOLHA DE PAGAMENTO
      ====================================== */}
      {modalFolha && (
        <Modal titulo={folhaEditando !== null ? "Editar folha de pagamento" : "Nova folha de pagamento"}
          subtitulo="Controle financeiro por competência" fechar={() => setModalFolha(false)}>
          <form onSubmit={salvarFolha}>
            <MensagemErro mensagem={erroFolha} />
            <div className="grid gap-4 sm:grid-cols-2">
              <Campo label="Competência (mês/ano)">
                <input required type="month" className={CLASSE_CAMPO} value={formFolha.competencia}
                  onChange={(e) => setFormFolha((anterior) => ({
                    ...anterior, competencia: e.target.value,
                    data_vencimento: `${e.target.value}-01`,
                  }))} />
              </Campo>
              <Campo label="Valor total (R$)">
                <input required type="number" min="0.01" step="0.01" className={CLASSE_CAMPO}
                  value={formFolha.valor} onChange={(e) => setFormFolha({ ...formFolha, valor: e.target.value })} />
              </Campo>
              <Campo label="Descrição" className="sm:col-span-2">
                <input required maxLength={255} className={CLASSE_CAMPO} value={formFolha.descricao}
                  onChange={(e) => setFormFolha({ ...formFolha, descricao: e.target.value })}
                  placeholder="Ex.: Folha de pagamento — Novembro/2026" />
              </Campo>
              <Campo label="Data de vencimento">
                <input required type="date" className={CLASSE_CAMPO} value={formFolha.data_vencimento}
                  onChange={(e) => setFormFolha({ ...formFolha, data_vencimento: e.target.value })} />
              </Campo>
              <Campo label="Situação">
                <select className={CLASSE_CAMPO} value={formFolha.status}
                  onChange={(e) => setFormFolha({ ...formFolha, status: e.target.value,
                    data_pagamento: e.target.value === "pago" ? formFolha.data_pagamento || hojeISO() : "",
                  })}>
                  <option value="pendente">Pendente</option>
                  <option value="pago">Pago</option>
                  <option value="cancelado">Cancelado</option>
                </select>
              </Campo>
              {formFolha.status === "pago" && (
                <Campo label="Data do pagamento" className="sm:col-span-2">
                  <input required type="date" className={CLASSE_CAMPO} value={formFolha.data_pagamento}
                    onChange={(e) => setFormFolha({ ...formFolha, data_pagamento: e.target.value })} />
                </Campo>
              )}
            </div>
            <p className="mt-4 text-xs text-[#829085]">
              O registro será salvo como despesa na categoria Salários / Folha de Pagamento.
              A categoria será criada automaticamente caso ainda não exista.
            </p>
            <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button type="button" className={CLASSE_BOTAO_SECUNDARIO} onClick={() => setModalFolha(false)}>Cancelar</button>
              <button type="submit" className={CLASSE_BOTAO} disabled={salvandoFolha}>
                <Save size={16} />{salvandoFolha ? "Salvando..." : "Salvar folha"}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* ======================================
          MODAL - MOVIMENTAÇÃO FINANCEIRA
      ====================================== */}

      {modalRegistro && (
        <Modal
          titulo={
            registroEditando
              ? "Editar movimentação"
              : "Nova movimentação"
          }
          subtitulo={modulo.nome}
          fechar={() => setModalRegistro(false)}
        >
          <form onSubmit={salvarRegistro}>
            <MensagemErro mensagem={erroFormulario} />

            <div className="grid max-h-[65vh] grid-cols-1 gap-4 overflow-y-auto pr-1 sm:grid-cols-2">
              <Campo label="Tipo">
                <select
                  value={form.tipo}
                  disabled={Boolean(registroEditando)}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      tipo: e.target.value,
                      categoria_id: "",
                      cliente_fornecedor_id: null,
                    })
                  }
                  className={CLASSE_CAMPO}
                >
                  {TIPOS.map((item) => (
                    <option key={item.valor} value={item.valor}>
                      {item.nome}
                    </option>
                  ))}
                </select>
              </Campo>

              <Campo label="Categoria">
                <select
                  required
                  value={form.categoria_id}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      categoria_id: e.target.value,
                    })
                  }
                  className={CLASSE_CAMPO}
                >
                  <option value="">Selecione...</option>

                  {categoriasTipo.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.nome}
                    </option>
                  ))}
                </select>
              </Campo>

              <div className="sm:col-span-2">
                <button
                  type="button"
                  onClick={() =>
                    setCriandoCategoria((anterior) => !anterior)
                  }
                  className="flex items-center gap-1 text-xs font-semibold text-[#588157]"
                >
                  <Plus size={14} />
                  {criandoCategoria
                    ? "Fechar cadastro de categoria"
                    : "Cadastrar nova categoria"}
                </button>

                {criandoCategoria && (
                  <div className="mt-3 grid gap-2 rounded-xl bg-[#F2F6EF] p-3 dark:bg-[#26382B] sm:grid-cols-[1fr_auto_auto]">
                    <input
                      value={nomeCategoria}
                      onChange={(e) =>
                        setNomeCategoria(e.target.value)
                      }
                      placeholder="Nome da categoria"
                      className={CLASSE_CAMPO}
                    />

                    <select
                      value={naturezaCategoria}
                      onChange={(e) =>
                        setNaturezaCategoria(e.target.value)
                      }
                      className={CLASSE_CAMPO}
                    >
                      <option value="variavel">Variável</option>
                      <option value="fixo">Fixo</option>
                    </select>

                    <button
                      type="button"
                      disabled={salvando}
                      onClick={cadastrarCategoria}
                      className={CLASSE_BOTAO}
                    >
                      Criar
                    </button>
                  </div>
                )}
              </div>

              <Campo
                label={`${
                  form.tipo === "receita" ? "Cliente" : "Fornecedor"
                } vinculado (opcional)`}
                className="sm:col-span-2"
              >
                <select
                  value={form.cliente_fornecedor_id ?? ""}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      cliente_fornecedor_id: e.target.value
                        ? Number(e.target.value)
                        : null,
                    })
                  }
                  className={CLASSE_CAMPO}
                >
                  <option value="">Nenhum vínculo</option>

                  {pessoasDaMovimentacao.map((pessoa) => (
                    <option key={pessoa.id} value={pessoa.id}>
                      {pessoa.nome_razao}
                    </option>
                  ))}
                </select>

                <p className="mt-1 text-xs text-[#849187]">
                  Cadastre clientes e fornecedores no módulo correspondente.
                </p>
              </Campo>

              <Campo label="Descrição" className="sm:col-span-2">
                <input
                  required
                  maxLength={255}
                  value={form.descricao}
                  onChange={(e) =>
                    setForm({ ...form, descricao: e.target.value })
                  }
                  placeholder="Ex.: Venda de serviços, aluguel, imposto"
                  className={CLASSE_CAMPO}
                />
              </Campo>

              <Campo label="Valor (R$)">
                <input
                  required
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={form.valor}
                  onChange={(e) =>
                    setForm({ ...form, valor: e.target.value })
                  }
                  className={CLASSE_CAMPO}
                />
              </Campo>

              <Campo label="Data de vencimento">
                <input
                  required
                  type="date"
                  value={form.data_vencimento}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      data_vencimento: e.target.value,
                    })
                  }
                  className={CLASSE_CAMPO}
                />
              </Campo>

              <Campo label="Situação">
                <select
                  value={form.status}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      status: e.target.value,
                      data_pagamento:
                        e.target.value === "pago"
                          ? form.data_pagamento || hojeISO()
                          : "",
                    })
                  }
                  className={CLASSE_CAMPO}
                >
                  <option value="pendente">Pendente</option>
                  <option value="pago">
                    {form.tipo === "receita" ? "Recebido" : "Pago"}
                  </option>
                  <option value="cancelado">Cancelado</option>
                </select>
              </Campo>

              {form.status === "pago" && (
                <Campo
                  label={`Data do ${
                    form.tipo === "receita"
                      ? "recebimento"
                      : "pagamento"
                  }`}
                >
                  <input
                    required
                    type="date"
                    value={form.data_pagamento}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        data_pagamento: e.target.value,
                      })
                    }
                    className={CLASSE_CAMPO}
                  />
                </Campo>
              )}
            </div>

            <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => setModalRegistro(false)}
                className={CLASSE_BOTAO_SECUNDARIO}
              >
                Cancelar
              </button>

              <button
                type="submit"
                disabled={salvando}
                className={CLASSE_BOTAO}
              >
                <Save size={16} />
                {salvando ? "Salvando..." : "Salvar registro"}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* ======================================
          MODAL - CLIENTE / FORNECEDOR
      ====================================== */}

      {modalPessoa && (
        <Modal
          titulo={
            pessoaEditando
              ? "Editar cadastro"
              : "Novo cliente ou fornecedor"
          }
          subtitulo="Informações de contato da empresa"
          fechar={() => setModalPessoa(false)}
        >
          <form onSubmit={salvarPessoa}>
            <MensagemErro mensagem={erroPessoa} />

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Campo label="Tipo">
                <select
                  value={formPessoa.tipo}
                  onChange={(e) =>
                    setFormPessoa({
                      ...formPessoa,
                      tipo: e.target.value,
                    })
                  }
                  disabled={salvandoPessoa}
                  className={CLASSE_CAMPO}
                >
                  <option value="cliente">Cliente</option>
                  <option value="fornecedor">Fornecedor</option>
                </select>
              </Campo>

              <Campo label="Nome ou razão social *" className="sm:col-span-2">
                <input
                  required
                  maxLength={255}
                  value={formPessoa.nome_razao}
                  onChange={(e) =>
                    setFormPessoa({
                      ...formPessoa,
                      nome_razao: e.target.value,
                    })
                  }
                  disabled={salvandoPessoa}
                  className={CLASSE_CAMPO}
                />
              </Campo>

              <Campo label="CPF ou CNPJ">
                <input
                  maxLength={30}
                  value={formPessoa.documento}
                  onChange={(e) =>
                    setFormPessoa({
                      ...formPessoa,
                      documento: e.target.value,
                    })
                  }
                  disabled={salvandoPessoa}
                  className={CLASSE_CAMPO}
                />
              </Campo>

              <Campo label="Telefone">
                <input
                  type="tel"
                  maxLength={30}
                  value={formPessoa.telefone}
                  onChange={(e) =>
                    setFormPessoa({
                      ...formPessoa,
                      telefone: e.target.value,
                    })
                  }
                  disabled={salvandoPessoa}
                  className={CLASSE_CAMPO}
                />
              </Campo>

              <Campo label="E-mail" className="sm:col-span-2">
                <input
                  type="email"
                  maxLength={255}
                  value={formPessoa.email}
                  onChange={(e) =>
                    setFormPessoa({
                      ...formPessoa,
                      email: e.target.value,
                    })
                  }
                  disabled={salvandoPessoa}
                  className={CLASSE_CAMPO}
                />
              </Campo>
            </div>

            <div className="mt-7 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setModalPessoa(false)}
                className={CLASSE_BOTAO_SECUNDARIO}
              >
                Cancelar
              </button>

              <button
                type="submit"
                disabled={salvandoPessoa}
                className={CLASSE_BOTAO}
              >
                <Save size={16} />
                {salvandoPessoa ? "Salvando..." : "Salvar cadastro"}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* ======================================
          MODAL - CONTA BANCÁRIA
      ====================================== */}

      {modalContaBancaria && (
        <Modal
          titulo={
            contaBancariaEditando !== null
              ? "Editar conta bancária"
              : "Nova conta bancária"
          }
          subtitulo="Dados da conta financeira da empresa"
          fechar={() => setModalContaBancaria(false)}
        >
          <form onSubmit={salvarContaBancaria}>
            <MensagemErro mensagem={erroFormularioBanco} />

            <div className="space-y-4">
              <Campo label="Nome do banco">
                <input
                  required
                  maxLength={255}
                  value={formContaBancaria.nome_banco}
                  onChange={(e) =>
                    setFormContaBancaria({
                      ...formContaBancaria,
                      nome_banco: e.target.value,
                    })
                  }
                  placeholder="Ex.: Banco do Brasil, Nubank, Itaú"
                  className={CLASSE_CAMPO}
                />
              </Campo>

              <Campo label="Tipo de conta">
                <select
                  value={formContaBancaria.tipo_conta}
                  onChange={(e) =>
                    setFormContaBancaria({
                      ...formContaBancaria,
                      tipo_conta: e.target.value,
                    })
                  }
                  className={CLASSE_CAMPO}
                >
                  <option value="corrente">Conta corrente</option>
                  <option value="poupanca">Poupança</option>
                  <option value="caixa">Caixa</option>
                  <option value="investimento">Investimento</option>
                </select>
              </Campo>

              <Campo label="Saldo inicial (R$)">
                <input
                  required
                  type="number"
                  min="0"
                  step="0.01"
                  value={formContaBancaria.saldo_inicial}
                  onChange={(e) =>
                    setFormContaBancaria({
                      ...formContaBancaria,
                      saldo_inicial: e.target.value,
                    })
                  }
                  className={CLASSE_CAMPO}
                />
              </Campo>

              <p className="rounded-xl bg-[#F2F6EF] p-3 text-xs text-[#627567] dark:bg-[#26382B] dark:text-[#B4C7B1]">
                O saldo atual é calculado com base no saldo inicial
                mais as entradas e menos as saídas registradas.
              </p>
            </div>

            <div className="mt-7 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setModalContaBancaria(false)}
                className={CLASSE_BOTAO_SECUNDARIO}
              >
                Cancelar
              </button>

              <button
                type="submit"
                disabled={salvandoBanco}
                className={CLASSE_BOTAO}
              >
                <Save size={16} />
                {salvandoBanco ? "Salvando..." : "Salvar conta"}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* ======================================
          MODAL - MOVIMENTAÇÃO BANCÁRIA
      ====================================== */}

      {modalMovimentacaoBancaria && (
        <Modal
          titulo={
            movimentacaoBancariaEditando !== null
              ? "Editar movimentação bancária"
              : "Nova movimentação bancária"
          }
          subtitulo="Registre uma entrada ou saída da conta"
          fechar={() => setModalMovimentacaoBancaria(false)}
        >
          <form onSubmit={salvarMovimentacaoBancaria}>
            <MensagemErro mensagem={erroFormularioBanco} />

            <div className="grid max-h-[65vh] grid-cols-1 gap-4 overflow-y-auto pr-1 sm:grid-cols-2">
              <Campo label="Conta bancária" className="sm:col-span-2">
                <select
                  required
                  value={formMovimentacaoBancaria.conta_bancaria_id}
                  onChange={(e) =>
                    setFormMovimentacaoBancaria({
                      ...formMovimentacaoBancaria,
                      conta_bancaria_id: e.target.value,
                    })
                  }
                  className={CLASSE_CAMPO}
                >
                  <option value="">Selecione uma conta...</option>

                  {contasBancarias.map((conta) => (
                    <option key={conta.id} value={conta.id}>
                      {conta.nome_banco} — {conta.tipo_conta}
                    </option>
                  ))}
                </select>
              </Campo>

              <Campo label="Tipo de movimentação">
                <select
                  value={formMovimentacaoBancaria.tipo}
                  onChange={(e) =>
                    setFormMovimentacaoBancaria({
                      ...formMovimentacaoBancaria,
                      tipo: e.target.value,
                    })
                  }
                  className={CLASSE_CAMPO}
                >
                  <option value="entrada">Entrada</option>
                  <option value="saida">Saída</option>
                </select>
              </Campo>

              <Campo label="Valor (R$)">
                <input
                  required
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={formMovimentacaoBancaria.valor}
                  onChange={(e) =>
                    setFormMovimentacaoBancaria({
                      ...formMovimentacaoBancaria,
                      valor: e.target.value,
                    })
                  }
                  placeholder="0,00"
                  className={CLASSE_CAMPO}
                />
              </Campo>

              <Campo label="Descrição" className="sm:col-span-2">
                <input
                  required
                  maxLength={255}
                  value={formMovimentacaoBancaria.descricao}
                  onChange={(e) =>
                    setFormMovimentacaoBancaria({
                      ...formMovimentacaoBancaria,
                      descricao: e.target.value,
                    })
                  }
                  placeholder="Ex.: Pagamento recebido de cliente"
                  className={CLASSE_CAMPO}
                />
              </Campo>

              <Campo label="Data da movimentação">
                <input
                  required
                  type="date"
                  value={formMovimentacaoBancaria.data_movimentacao}
                  onChange={(e) =>
                    setFormMovimentacaoBancaria({
                      ...formMovimentacaoBancaria,
                      data_movimentacao: e.target.value,
                    })
                  }
                  className={CLASSE_CAMPO}
                />
              </Campo>

              <Campo label="Categoria (opcional)">
                <input
                  maxLength={100}
                  value={formMovimentacaoBancaria.categoria}
                  onChange={(e) =>
                    setFormMovimentacaoBancaria({
                      ...formMovimentacaoBancaria,
                      categoria: e.target.value,
                    })
                  }
                  placeholder="Ex.: Serviços"
                  className={CLASSE_CAMPO}
                />
              </Campo>

              <Campo label="Observações" className="sm:col-span-2">
                <textarea
                  rows={3}
                  value={formMovimentacaoBancaria.observacoes}
                  onChange={(e) =>
                    setFormMovimentacaoBancaria({
                      ...formMovimentacaoBancaria,
                      observacoes: e.target.value,
                    })
                  }
                  placeholder="Informações adicionais sobre a movimentação..."
                  className={CLASSE_CAMPO}
                />
              </Campo>

              <div className="sm:col-span-2 rounded-xl bg-[#F2F6EF] p-3 text-xs text-[#627567] dark:bg-[#26382B] dark:text-[#B4C7B1]">
                Esta operação será registrada no extrato bancário.
                Ela não cria automaticamente uma receita ou despesa
                no módulo financeiro.
              </div>
            </div>

            <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() =>
                  setModalMovimentacaoBancaria(false)
                }
                className={CLASSE_BOTAO_SECUNDARIO}
              >
                Cancelar
              </button>

              <button
                type="submit"
                disabled={salvandoBanco}
                className={CLASSE_BOTAO}
              >
                <Save size={16} />
                {salvandoBanco
                  ? "Salvando..."
                  : "Salvar movimentação"}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* ======================================
          MODAL - EMPRESA
      ====================================== */}

      {modalEmpresa && formEmpresa && (
        <Modal
          titulo="Informações da empresa"
          subtitulo={
            podeEditarEmpresa
              ? "Atualize as informações cadastrais."
              : "Visualização dos dados cadastrais."
          }
          fechar={() => setModalEmpresa(false)}
          maxWidth="max-w-2xl"
        >
          <form onSubmit={salvarEmpresa}>
            <MensagemErro mensagem={erroEmpresa} />

            <div className="grid max-h-[65vh] grid-cols-1 gap-4 overflow-y-auto pr-1 sm:grid-cols-2">
              {[
                {
                  campo: "razao_social",
                  label: "Razão social",
                  required: true,
                },
                {
                  campo: "documento_identificacao",
                  label: formEmpresa.tipo_documento || "Documento",
                  readonly: true,
                },
                {
                  campo: "email_empresa",
                  label: "E-mail",
                  type: "email",
                },
                {
                  campo: "telefone_empresa",
                  label: "Telefone",
                },
                {
                  campo: "capital_inicial",
                  label: "Capital inicial (R$)",
                  type: "number",
                  min: "0",
                  step: "0.01",
                },
              ].map((item) => (
                <Campo key={item.campo} label={item.label}>
                  <input
                    type={item.type || "text"}
                    min={item.min}
                    step={item.step}
                    required={item.required}
                    disabled={
                      !podeEditarEmpresa ||
                      item.readonly ||
                      salvandoEmpresa
                    }
                    value={formEmpresa[item.campo] ?? ""}
                    onChange={(e) =>
                      setFormEmpresa({
                        ...formEmpresa,
                        [item.campo]: e.target.value,
                      })
                    }
                    className={CLASSE_CAMPO}
                  />
                </Campo>
              ))}

              {[
                {
                  campo: "setor_atuacao",
                  label: "Setor de atuação",
                  opcoes: [
                    "Comércio",
                    "Serviços",
                    "Indústria",
                    "Tecnologia",
                    "Varejo",
                    "Saúde",
                    "Outros",
                  ],
                },
                {
                  campo: "porte_empresa",
                  label: "Porte da empresa",
                  opcoes: [
                    "Autônomo",
                    "MEI",
                    "ME",
                    "EPP",
                    "Média",
                    "Grande",
                  ],
                },
                {
                  campo: "regime_tributario",
                  label: "Regime tributário",
                  opcoes: [
                    "Pessoa Física",
                    "Simples Nacional",
                    "Lucro Presumido",
                    "Lucro Real",
                  ],
                },
                {
                  campo: "perfil_risco",
                  label: "Perfil de risco",
                  opcoes: [
                    "Conservador",
                    "Moderado",
                    "Arrojado",
                  ],
                },
              ].map((item) => (
                <Campo key={item.campo} label={item.label}>
                  <select
                    disabled={!podeEditarEmpresa || salvandoEmpresa}
                    value={formEmpresa[item.campo]}
                    onChange={(e) =>
                      setFormEmpresa({
                        ...formEmpresa,
                        [item.campo]: e.target.value,
                      })
                    }
                    className={CLASSE_CAMPO}
                  >
                    {item.opcoes.map((opcao) => (
                      <option key={opcao} value={opcao}>
                        {opcao}
                      </option>
                    ))}
                  </select>
                </Campo>
              ))}
            </div>

            <div className="mt-7 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setModalEmpresa(false)}
                className={CLASSE_BOTAO_SECUNDARIO}
              >
                Fechar
              </button>

              {podeEditarEmpresa && (
                <button
                  type="submit"
                  disabled={salvandoEmpresa}
                  className={CLASSE_BOTAO}
                >
                  <Save size={16} />
                  {salvandoEmpresa
                    ? "Salvando..."
                    : "Salvar empresa"}
                </button>
              )}
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
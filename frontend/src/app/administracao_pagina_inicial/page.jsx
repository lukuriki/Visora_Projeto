"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  AlertCircle, ArrowDownRight, ArrowUpRight, Building2, CalendarDays,
  ChartNoAxesCombined, ChevronDown, LogOut, ArrowRight, Settings2,
  Moon, ReceiptText, RefreshCw, Search, ShieldCheck, ShoppingBag,
  Sun, UserRound, Users, Wallet, X, Mail, MessageSquare, Send, LayoutDashboard, ChevronRight
} from "lucide-react";
import { buscarPerfilAdmin, buscarDashboardAdmin } from "@/lib/api";

const API_URL = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api").replace(/\/$/, "");

async function requisicaoAdmin(endpoint, token, options = {}) {
  const resposta = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...options.headers,
    },
    cache: "no-store",
  });
  const dados = await resposta.json().catch(() => null);
  if (!resposta.ok) {
    const erro = new Error(dados?.mensagem || `Erro HTTP ${resposta.status}`);
    erro.status = resposta.status;
    erro.dados = dados;
    throw erro;
  }
  return dados;
}

const statusConversaNome = (status) => ({
  aberta: "Aberta",
  respondida: "Respondida",
  encerrada: "Encerrada",
})[status] || status || "—";

const LOGIN_URL = "/areapublica_pagina_login";
const PERIODOS = ["Últimos 12 meses", "Últimos 6 meses", "Últimos 3 meses"];
const moeda = (n) => new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(Number(n) || 0);
const numero = (n) => new Intl.NumberFormat("pt-BR").format(Number(n) || 0);
const percentual = (n) => n == null ? "Sem histórico" : `${Number(n) > 0 ? "+" : ""}${Number(n).toFixed(1).replace(".", ",")}%`;
const dataBR = (v) => {
  if (!v) return "—";
  const s = String(v).slice(0, 10);
  return /^\d{4}-\d{2}-\d{2}$/.test(s) ? s.split("-").reverse().join("/") : s;
};
const statusNome = (s) => ({ aprovado: "Aprovado", pendente: "Pendente", recusado: "Recusado", estornado: "Estornado" })[s] || s || "Desconhecido";
const metodoNome = (s) => ({ pix: "Pix", cartao_credito: "Cartão de crédito", cartao_debito: "Cartão de débito", boleto: "Boleto", carteira_digital: "Carteira digital" })[s] || s || "—";
const tokenAdmin = () => sessionStorage.getItem("admin-token") || localStorage.getItem("admin-token");
const limparToken = () => { sessionStorage.removeItem("admin-token"); localStorage.removeItem("admin-token"); };
const erroAutorizacao = (e) => /\b(401|403)\b|sessão inválida|sessão expirada|token inválido|não autenticado/i.test(String(e?.message || "")) || [401, 403].includes(e?.status);

const classeStatusPagamento = (s) => `rounded-lg px-2.5 py-1 text-xs font-semibold ${s === "aprovado" ? "bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-300" : s === "pendente" ? "bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300" : "bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-300"}`;
const classeStatusConversa = (s) => `rounded-lg px-2.5 py-1 text-xs font-semibold ${s === "aberta" ? "bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300" : s === "respondida" ? "bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-300" : "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-200"}`;

function BotaoIcone({ children, title, onClick, disabled = false, className = "" }) {
  return <button type="button" title={title} aria-label={title} onClick={onClick} disabled={disabled}
    className={`inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[#DAD7CD] bg-white text-[#3A5A40] transition hover:border-[#588157] hover:bg-[#edf3eb] disabled:opacity-50 dark:border-[#34483A] dark:bg-[#1C2920] dark:text-[#C9DACB] dark:hover:border-[#7E9971] dark:hover:bg-[#273B31] ${className}`}>{children}</button>;
}

function Card({ children, className = "" }) {
  return <section className={`rounded-2xl border border-[#DAD7CD]/80 bg-white shadow-sm shadow-[#273B31]/[0.03] dark:border-[#34483A] dark:bg-[#1C2920] dark:shadow-black/10 ${className}`}>{children}</section>;
}

export default function PaginaInicialAdmin() {
  const router = useRouter();
  const [administrador, setAdministrador] = useState(null);
  const [dashboard, setDashboard] = useState(null);
  const [autenticando, setAutenticando] = useState(true);
  const [redirecionando, setRedirecionando] = useState(false);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");
  const [periodo, setPeriodo] = useState(PERIODOS[0]);
  const [busca, setBusca] = useState("");
  const [atualizacao, setAtualizacao] = useState(0);
  const [perfilAberto, setPerfilAberto] = useState(false);
  const [pagamentoSelecionado, setPagamentoSelecionado] = useState(null);
  const [escuro, setEscuro] = useState(false);
  const [temaPronto, setTemaPronto] = useState(false);
  const [conversas, setConversas] = useState([]);
  const [carregandoConversas, setCarregandoConversas] = useState(false);
  const [erroConversas, setErroConversas] = useState("");
  const [buscaConversa, setBuscaConversa] = useState("");
  const [conversaSelecionada, setConversaSelecionada] = useState(null);
  const [mensagensConversa, setMensagensConversa] = useState([]);
  const [carregandoMensagens, setCarregandoMensagens] = useState(false);
  const [resposta, setResposta] = useState("");
  const [enviandoResposta, setEnviandoResposta] = useState(false);
  const [avisoResposta, setAvisoResposta] = useState("");
  const [erroResposta, setErroResposta] = useState("");
  const [atualizacaoConversas, setAtualizacaoConversas] = useState(0);
  

  useEffect(() => {
    const html = document.documentElement;
    const temaGlobalEscuro = html.classList.contains("dark");
    const salvo = localStorage.getItem("visora-admin-theme");

    html.classList.remove("dark");
    setEscuro(salvo === "dark" || (salvo !== "light" && temaGlobalEscuro));
    setTemaPronto(true);

    return () => {
      html.classList.toggle("dark", temaGlobalEscuro);
    };
  }, []);

  function alternarTema() {
    const novoTema = !escuro;
    setEscuro(novoTema);
    localStorage.setItem("visora-admin-theme", novoTema ? "dark" : "light");
  }

  function sair() {
    limparToken();
    setAdministrador(null);
    setDashboard(null);
    setRedirecionando(true);
    router.replace(LOGIN_URL);
  }

  useEffect(() => {
    let ativo = true;
    async function verificar() {
      const token = tokenAdmin();
      if (!token) {
        setRedirecionando(true);
        router.replace(LOGIN_URL);
        return;
      }
      try {
        const r = await buscarPerfilAdmin(token);
        if (!ativo) return;
        if (!r?.administrador || r.administrador.tipo !== "admin") throw new Error("Sessão administrativa inválida.");
        setAdministrador(r.administrador);
      } catch (e) {
        if (!ativo) return;
        if (erroAutorizacao(e)) {
          limparToken();
          setRedirecionando(true);
          router.replace(LOGIN_URL);
        } else setErro(e?.message || "Não foi possível verificar sua sessão.");
      } finally { if (ativo) setAutenticando(false); }
    }
    verificar();
    return () => { ativo = false; };
  }, [router]);

  useEffect(() => {
    if (!administrador || redirecionando) return;
    let ativo = true;
    async function carregar() {
      setCarregando(true);
      setErro("");
      try {
        const token = tokenAdmin();
        if (!token) throw Object.assign(new Error("Sessão expirada"), { status: 401 });
        const r = await buscarDashboardAdmin(token, periodo);
        if (!ativo) return;
        if (!r?.dashboard) throw new Error(r?.mensagem || "Não foi possível carregar o dashboard.");
        setDashboard(r.dashboard);
      } catch (e) {
        if (!ativo) return;
        if (erroAutorizacao(e)) {
          limparToken();
          setRedirecionando(true);
          router.replace(LOGIN_URL);
        } else setErro(e?.message || "Erro ao buscar informações do servidor.");
      } finally { if (ativo) setCarregando(false); }
    }
    carregar();
    return () => { ativo = false; };
  }, [administrador, periodo, atualizacao, redirecionando, router]);

  useEffect(() => {
    if (!administrador || redirecionando) return;
    let ativo = true;
    async function carregarConversas() {
      setCarregandoConversas(true);
      setErroConversas("");
      try {
        const dados = await requisicaoAdmin("/conversas", tokenAdmin());
        if (ativo) setConversas(Array.isArray(dados) ? dados : dados?.conversas || []);
      } catch (e) {
        if (ativo) setErroConversas(e.message || "Não foi possível carregar as conversas.");
      } finally {
        if (ativo) setCarregandoConversas(false);
      }
    }
    carregarConversas();
    return () => { ativo = false; };
  }, [administrador, redirecionando, atualizacaoConversas]);

  const conversasFiltradas = useMemo(() => {
    const termo = buscaConversa.trim().toLowerCase();
    return conversas.filter((c) =>
      [c.id, c.nome_cliente, c.sobrenome_cliente, c.email, c.assunto, c.status]
        .join(" ").toLowerCase().includes(termo)
    );
  }, [conversas, buscaConversa]);

  async function abrirConversa(conversa) {
    setConversaSelecionada(conversa);
    setMensagensConversa([]);
    setResposta("");
    setAvisoResposta("");
    setErroResposta("");
    setCarregandoMensagens(true);
    try {
      const dados = await requisicaoAdmin(`/conversas/${conversa.id}/mensagens`, tokenAdmin());
      setMensagensConversa(Array.isArray(dados) ? dados : dados?.mensagens || []);
    } catch (e) {
      setErroResposta(e.message || "Não foi possível carregar o histórico.");
    } finally {
      setCarregandoMensagens(false);
    }
  }

  async function enviarResposta(e) {
    e.preventDefault();
    if (!conversaSelecionada || !resposta.trim() || enviandoResposta) return;
    setEnviandoResposta(true);
    setErroResposta("");
    setAvisoResposta("");
    try {
      const resultado = await requisicaoAdmin(
        `/conversas/${conversaSelecionada.id}/responder`,
        tokenAdmin(),
        { method: "POST", body: JSON.stringify({ mensagem: resposta.trim() }) }
      );
      if (resultado.emailEnviado === false) {
        setErroResposta("A resposta foi salva, mas o e-mail não foi enviado. Verifique o SMTP antes de tentar novamente.");
      } else {
        setAvisoResposta("Resposta enviada para o e-mail do cliente!");
        setResposta("");
      }
      const historico = await requisicaoAdmin(`/conversas/${conversaSelecionada.id}/mensagens`, tokenAdmin());
      setMensagensConversa(Array.isArray(historico) ? historico : historico?.mensagens || []);
      setAtualizacaoConversas((n) => n + 1);
    } catch (e) {
      setErroResposta(e?.dados?.emailEnviado === false
        ? "A resposta foi salva, mas o e-mail não foi enviado. Verifique o SMTP antes de tentar novamente."
        : e.message || "Não foi possível enviar a resposta.");
      try {
        const historico = await requisicaoAdmin(`/conversas/${conversaSelecionada.id}/mensagens`, tokenAdmin());
        setMensagensConversa(Array.isArray(historico) ? historico : historico?.mensagens || []);
        setAtualizacaoConversas((n) => n + 1);
      } catch {}
    } finally {
      setEnviandoResposta(false);
    }
  }

  useEffect(() => {
  const html = document.documentElement;

  const esquemaAnterior = html.style.colorScheme;

  html.style.colorScheme = escuro ? "dark" : "light";

  return () => {
    html.style.colorScheme = esquemaAnterior;
  };
}, [escuro]);

  const indicadores = useMemo(() => {
    const i = dashboard?.indicadores;
    if (!i) return [];
    return [
      { titulo: "Faturamento total", valor: moeda(i.faturamento?.valor), variacao: i.faturamento?.variacao, descricao: "em relação ao período anterior", Icone: Wallet },
      { titulo: "Empresas cadastradas", valor: numero(i.clientes?.valor), variacao: i.clientes?.variacao, descricao: `${numero(i.clientes?.novos)} novas empresas no período`, Icone: Users },
      { titulo: "Assinaturas contratadas", valor: numero(i.assinaturas?.valor), variacao: i.assinaturas?.variacao, descricao: `${numero(i.assinaturas?.novas)} novas assinaturas no período`, Icone: ShoppingBag },
      { titulo: "Crescimento", valor: percentual(i.crescimento?.valor), variacao: null, descricao: "variação do faturamento no período", Icone: ChartNoAxesCombined },
    ];
  }, [dashboard]);
  const movimentacoes = useMemo(() => dashboard?.pagamentos || [], [dashboard]);
  const pagamentosFiltrados = useMemo(() => movimentacoes.filter((p) =>
    [p.id, p.codigo, p.empresa, p.plano, p.metodo, p.status].join(" ").toLowerCase().includes(busca.trim().toLowerCase())
  ), [movimentacoes, busca]);
  const meses = dashboard?.grafico || [];
  const maiorValor = Math.max(1, ...meses.map((m) => Number(m.valor) || 0));
  const dist = dashboard?.distribuicao || {};
  const distribuicao = [
    { nome: "Ativas", valor: Number(dist.ativa) || 0, cor: "#588157" },
    { nome: "Pendentes", valor: Number(dist.pendente) || 0, cor: "#E5B567" },
    { nome: "Canceladas", valor: Number(dist.cancelada) || 0, cor: "#C8786C" },
    { nome: "Expiradas", valor: Number(dist.expirada) || 0, cor: "#9EADA1" },
  ];
  const totalAssinaturas = distribuicao.reduce((s, p) => s + p.valor, 0);
  let acumulado = 0;
  const gradiente = totalAssinaturas ? `conic-gradient(${distribuicao.map((p) => {
    const inicio = acumulado;
    acumulado += p.valor / totalAssinaturas * 100;
    return `${p.cor} ${inicio}% ${acumulado}%`;
  }).join(", ")})` : "conic-gradient(#DAD7CD 0 100%)";
  const dataAtual = new Date().toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long", year: "numeric" });

  if (!temaPronto || autenticando || redirecionando || !administrador) {
    return <div className={`${escuro ? "dark" : ""} min-h-screen`}><div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-[#F8F9F6] text-[#273B31] dark:bg-[#111A14] dark:text-[#E5EDE5]">
      <RefreshCw className="h-8 w-8 animate-spin text-[#588157]" />
      <p className="px-4 text-center text-sm">{redirecionando ? "Redirecionando para o login..." : "Verificando acesso administrativo..."}</p>
      {erro && !autenticando && <div className="max-w-md px-4 text-center text-sm text-red-600 dark:text-red-400"><p>{erro}</p><button onClick={() => window.location.reload()} className="mt-3 underline">Tentar novamente</button></div>}
    </div></div>;
  }

  

  return <div className={escuro ? "dark" : ""}>
    <div className="min-h-screen overflow-x-hidden bg-[#F8F9F6] text-[#273B31] transition-colors duration-300 dark:bg-[#111A14] dark:text-[#E5EDE5]">
      <div className="min-h-screen">
        <header className="sticky top-0 z-30 flex h-[68px] items-center justify-between gap-2 border-b border-[#DAD7CD] bg-white/90 px-3 backdrop-blur-xl dark:border-[#34483A] dark:bg-[#1C2920]/95 min-[400px]:px-4 sm:h-[76px] sm:gap-3 sm:px-8">
          <div className="flex min-w-0 items-center gap-2 sm:gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#E7EFE5] dark:bg-[#273B31] sm:h-11 sm:w-11"><img src="/logo_v_darkmode.png" alt="Visora" className="h-8 w-auto object-contain sm:h-9" /></div>
            <div className="min-w-0"><p className="truncate text-sm font-semibold sm:text-base">Visora <span className="text-[#92A092]">/</span> Administração</p><p className="hidden text-xs capitalize text-[#7B8C7D] dark:text-[#B4C5B5] md:block">{dataAtual}</p></div>
          </div>
          <div className="flex shrink-0 items-center gap-1.5 sm:gap-3">
            <BotaoIcone title={escuro ? "Ativar modo claro" : "Ativar modo escuro"} onClick={alternarTema}>{escuro ? <Sun size={19}/> : <Moon size={19}/>}</BotaoIcone>
            <BotaoIcone title="Atualizar indicadores" disabled={carregando} onClick={() => setAtualizacao((n) => n + 1)}><RefreshCw size={18} className={carregando ? "animate-spin" : ""}/></BotaoIcone>
            <div className="relative">
              <button type="button" onClick={() => setPerfilAberto((v) => !v)} aria-expanded={perfilAberto} className="flex items-center gap-2 rounded-xl border border-[#DAD7CD] bg-white px-2 py-1.5 transition hover:bg-[#EDF2EB] dark:border-[#34483A] dark:bg-[#273B31] dark:hover:bg-[#344E41] sm:px-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#E7EFE5] text-[#588157] dark:bg-[#344E41] dark:text-[#A3B18A]"><UserRound size={18}/></div>
                <div className="hidden max-w-36 text-left sm:block"><p className="truncate text-xs font-semibold">{administrador.nome}</p><p className="text-[11px] text-[#7B8C7D] dark:text-[#B4C5B5]">Administrador</p></div>
                <ChevronDown size={15} className="hidden text-[#7B8C7D] sm:block"/>
              </button>
              {perfilAberto && <div className="absolute right-0 top-full z-50 mt-2 w-[min(16rem,calc(100vw-1.5rem))] rounded-xl border border-[#DAD7CD] bg-white p-2 shadow-xl dark:border-[#34483A] dark:bg-[#1C2920]">
                <div className="border-b border-[#DAD7CD] px-3 py-3 dark:border-[#34483A]"><p className="flex items-center gap-2 text-xs font-semibold text-[#588157] dark:text-[#A3B18A]"><ShieldCheck size={16}/> Conta administrativa</p><p className="mt-2 truncate text-sm font-semibold">{administrador.nome}</p><p className="truncate text-xs text-[#7B8C7D] dark:text-[#B4C5B5]">{administrador.email}</p></div>
                <button type="button" onClick={sair} className="mt-2 flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/30"><LogOut size={17}/> Sair da conta</button>
              </div>}
            </div>
          </div>
        </header>

        <nav aria-label="Navegação administrativa" className="mx-auto flex max-w-[1600px] gap-2 overflow-x-auto px-4 py-3 sm:px-7 lg:px-10">
          <Link href="/administracao_pagina_inicial" aria-current="page" className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-[#3A5A40] px-4 py-2.5 text-sm font-semibold text-white dark:bg-[#588157]"><LayoutDashboard size={17}/> Visão geral</Link>
          <Link href="/admin_gerenciamento" className="inline-flex shrink-0 items-center gap-2 rounded-xl border border-[#DAD7CD] bg-white px-4 py-2.5 text-sm font-semibold text-[#3A5A40] transition hover:border-[#588157] hover:bg-[#EDF3EB] dark:border-[#34483A] dark:bg-[#1C2920] dark:text-[#C9DACB] dark:hover:bg-[#273B31]"><Settings2 size={17}/> Gerenciamento</Link>
        </nav>
        <main className="mx-auto max-w-[1600px] space-y-6 px-4 pb-12 pt-6 sm:space-y-7 sm:px-7 sm:pb-14 sm:pt-8 lg:px-10 lg:pt-10">
          <section className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
            <div className="min-w-0">
              <p className="mb-3 inline-flex flex-wrap items-center gap-2 text-[10px] font-bold uppercase tracking-[0.14em] text-[#588157] dark:text-[#A3B18A] sm:text-[11px] sm:tracking-[0.18em]"><span className="h-2 w-2 shrink-0 rounded-full bg-[#588157] dark:bg-[#A3B18A]" /> Painel administrativo <ChevronRight size={13} /> Visão Geral</p>
              <h1 className="break-words text-xl font-bold tracking-tight text-[#273B31] dark:text-[#E5EDE5] min-[400px]:text-2xl sm:text-3xl">Bem-vindo, {administrador.nome?.split(" ")[0] || "Administrador"}!</h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-[#667A69] dark:text-[#B4C5B5]">Acompanhe o desempenho da Visora, monitore empresas, assinaturas, pagamentos e resultados financeiros em um só lugar.</p>
            </div>
            <div className="flex w-full shrink-0 flex-col gap-3 sm:w-auto sm:flex-row sm:items-center md:flex-col md:items-stretch xl:flex-row xl:items-center">
              <div className="flex min-h-11 items-center justify-center gap-2 rounded-xl border border-[#DAD7CD] bg-white px-4 py-2.5 text-sm shadow-sm dark:border-[#34483A] dark:bg-[#1C2920]">
                <CalendarDays size={17} className="shrink-0 text-[#588157] dark:text-[#A3B18A]" />
                <select value={periodo} onChange={(e) => setPeriodo(e.target.value)} aria-label="Período dos indicadores" className="w-full cursor-pointer bg-transparent font-medium outline-none dark:bg-[#1C2920] sm:w-auto">
                  {PERIODOS.map((p) => <option key={p}>{p}</option>)}
                </select>
              </div>
            </div>
          </section>

          {carregando && <Card className="flex items-center gap-3 p-4 text-sm text-[#667A69] dark:text-[#B4C5B5] sm:p-5"><RefreshCw size={19} className="shrink-0 animate-spin text-[#588157]"/> Atualizando informações administrativas...</Card>}
          {erro && <div role="alert" className="flex gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/30 dark:text-red-300"><AlertCircle size={20} className="shrink-0"/><div className="min-w-0 break-words"><p className="font-semibold">Não foi possível carregar o painel.</p><p className="mt-1">{erro}</p><button type="button" onClick={() => setAtualizacao((v) => v + 1)} className="mt-2 font-semibold underline">Tentar novamente</button></div></div>}

          {dashboard && <>
            <section><div className="mb-4"><h2 className="font-semibold">Resumo da plataforma</h2><p className="mt-1 text-sm text-[#7B8C7D] dark:text-[#B4C5B5]">Confira os principais números da Visora.</p></div>
              <div className="grid gap-3 sm:grid-cols-2 sm:gap-4 xl:grid-cols-4">{indicadores.map((i) => {
                const Icone = i.Icone; const tem = i.variacao != null; const positivo = Number(i.variacao) >= 0; const Seta = positivo ? ArrowUpRight : ArrowDownRight;
                return <Card key={i.titulo} className="p-4 transition hover:-translate-y-0.5 hover:border-[#A3B18A] dark:hover:border-[#7E9971] sm:p-5">
                  <div className="flex items-start justify-between gap-2"><div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#E7EFE5] text-[#588157] dark:bg-[#344E41] dark:text-[#A3B18A]"><Icone size={21}/></div>{tem && <span className={`flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-semibold ${positivo ? "bg-green-50 text-green-700 dark:bg-green-900/25 dark:text-green-300" : "bg-red-50 text-red-700 dark:bg-red-900/25 dark:text-red-300"}`}><Seta size={14}/>{percentual(i.variacao)}</span>}</div>
                  <p className="mt-4 text-sm text-[#667A69] dark:text-[#B4C5B5] sm:mt-5">{i.titulo}</p><p className="mt-1 break-words text-xl font-bold tracking-tight sm:text-2xl">{i.valor}</p><p className="mt-2 text-xs text-[#7B8C7D] dark:text-[#9FB1A0]">{i.descricao}</p>
                </Card>;
              })}</div>
            </section>
            <section className="grid gap-4 sm:gap-5 xl:grid-cols-3">
              <Card className="min-w-0 p-4 sm:p-6 xl:col-span-2"><h3 className="font-semibold">Visão financeira</h3><p className="mt-1 text-sm text-[#7B8C7D] dark:text-[#B4C5B5]">Evolução dos pagamentos aprovados durante o período selecionado.</p>
                <div className="mt-5 flex items-center gap-2 text-xs text-[#667A69] dark:text-[#B4C5B5] sm:mt-6"><span className="h-2.5 w-2.5 rounded-sm bg-[#588157]"/> Faturamento</div>
                <div className="mt-5 flex h-52 min-w-0 sm:h-60"><div className="flex w-[4.5rem] shrink-0 flex-col justify-between pb-7 pr-2 text-right text-[9px] text-[#7B8C7D] dark:text-[#9FB1A0] min-[400px]:w-20 sm:w-32 sm:pr-3 sm:text-xs">{[4,3,2,1,0].map((n) => <span key={n} className="truncate">{moeda(maiorValor * n / 4)}</span>)}</div>
                  <div className="relative flex min-w-0 flex-1 items-end gap-0.5 overflow-hidden border-b border-[#DAD7CD] dark:border-[#34483A] sm:gap-1"><div className="pointer-events-none absolute inset-0 bottom-7 flex flex-col justify-between">{[1,2,3,4,5].map((n) => <div key={n} className="border-t border-dashed border-[#E7EDE5] dark:border-[#34483A]"/>)}</div>
                    {meses.length ? meses.map((m, idx) => <div key={m.chave || idx} className="relative z-10 flex h-full min-w-0 flex-1 flex-col items-center justify-end gap-2"><div title={`${m.mes}: ${moeda(m.valor)}`} className="w-full max-w-10 rounded-t-md bg-[#A3B18A] transition-colors hover:bg-[#588157] dark:bg-[#588157] dark:hover:bg-[#A3B18A]" style={{ height: `${Math.max(0, Math.min(85, (Number(m.valor) || 0) / maiorValor * 85))}%` }}/><span className="max-w-full truncate text-[9px] text-[#7B8C7D] dark:text-[#B4C5B5] sm:text-xs">{m.mes}</span></div>) : <div className="flex flex-1 items-center justify-center text-sm text-[#7B8C7D]">Sem dados no período</div>}
                  </div></div><p className="mt-4 text-xs text-[#7B8C7D] dark:text-[#9FB1A0]">Valores obtidos dos pagamentos aprovados registrados na plataforma.</p>
              </Card>
              <Card className="p-4 sm:p-6"><h3 className="font-semibold">Distribuição de assinaturas</h3><p className="mt-1 text-sm text-[#7B8C7D] dark:text-[#B4C5B5]">Situação atual das assinaturas cadastradas.</p>
                <div className="flex justify-center py-6 sm:py-7"><div className="flex h-40 w-40 items-center justify-center rounded-full sm:h-44 sm:w-44" style={{ background: gradiente }}><div className="flex h-28 w-28 flex-col items-center justify-center rounded-full bg-white dark:bg-[#1C2920] sm:h-32 sm:w-32"><span className="text-2xl font-bold sm:text-3xl">{numero(totalAssinaturas)}</span><span className="text-xs text-[#7B8C7D] dark:text-[#B4C5B5]">Assinaturas</span></div></div></div>
                <div className="space-y-3">{distribuicao.map((d) => <div key={d.nome} className="flex items-center justify-between gap-3 text-sm"><div className="flex items-center gap-2 text-[#667A69] dark:text-[#B4C5B5]"><span className="h-2.5 w-2.5 shrink-0 rounded-sm" style={{ background: d.cor }}/>{d.nome}</div><span className="text-right font-semibold">{numero(d.valor)} <span className="text-[#7B8C7D] dark:text-[#B4C5B5]">({(totalAssinaturas ? d.valor / totalAssinaturas * 100 : 0).toFixed(1).replace(".", ",")}%)</span></span></div>)}</div>
              </Card>
            </section>
            <Card className="overflow-hidden"><div className="flex flex-col justify-between gap-4 p-4 sm:flex-row sm:items-center sm:p-6"><div><h3 className="font-semibold">Últimas movimentações</h3><p className="mt-1 text-sm text-[#7B8C7D] dark:text-[#B4C5B5]">Pagamentos recentes dos clientes da Visora.</p></div><div className="relative w-full sm:max-w-xs"><Search size={17} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#7B8C7D]"/><input value={busca} onChange={(e) => setBusca(e.target.value)} placeholder="Buscar empresa ou transação..." className="w-full rounded-xl border border-[#DAD7CD] bg-[#F8F9F6] py-2.5 pl-9 pr-3 text-sm outline-none focus:border-[#588157] dark:border-[#34483A] dark:bg-[#111A14] dark:placeholder:text-[#8A998B]"/></div></div>

              {/* LISTA EM CARDS (celular) */}
              <div className="divide-y divide-[#E7EDE5] border-t border-[#DAD7CD] dark:divide-[#34483A] dark:border-[#34483A] md:hidden">
                {pagamentosFiltrados.map((p) => <div key={p.id} className="space-y-3 p-4">
                  <div className="flex items-start justify-between gap-3"><div className="min-w-0"><p className="break-all font-semibold text-[#588157] dark:text-[#A3B18A]">{p.codigo || `#${p.id}`}</p><p className="mt-0.5 break-words text-sm">{p.empresa}</p></div><span className={`shrink-0 ${classeStatusPagamento(p.status)}`}>{statusNome(p.status)}</span></div>
                  <div className="flex items-end justify-between gap-3"><div className="min-w-0 text-xs text-[#667A69] dark:text-[#B4C5B5]"><p className="break-words">{p.plano}</p><p className="mt-0.5">{dataBR(p.data)}</p></div><div className="flex shrink-0 items-center gap-3"><span className="font-semibold">{moeda(p.valor)}</span><BotaoIcone title={`Ver transação ${p.codigo || p.id}`} onClick={() => setPagamentoSelecionado(p)}><ReceiptText size={18}/></BotaoIcone></div></div>
                </div>)}
                {!pagamentosFiltrados.length && <p className="px-4 py-10 text-center text-sm text-[#7B8C7D] dark:text-[#B4C5B5]">Nenhum pagamento encontrado.</p>}
              </div>

              {/* TABELA (tablet e desktop) */}
              <div className="hidden overflow-x-auto md:block"><table className="w-full min-w-[780px] text-left text-sm"><thead><tr className="border-y border-[#DAD7CD] bg-[#F1F4EF] text-xs uppercase tracking-wide text-[#667A69] dark:border-[#34483A] dark:bg-[#273B31] dark:text-[#B4C5B5]">{["Transação", "Empresa", "Plano", "Data", "Valor", "Status", "Detalhes"].map((h) => <th key={h} className="px-4 py-4 font-semibold lg:px-5">{h}</th>)}</tr></thead>
                <tbody>{pagamentosFiltrados.map((p) => <tr key={p.id} className="border-b border-[#E7EDE5] transition hover:bg-[#F8F9F6] dark:border-[#34483A] dark:hover:bg-[#273B31]"><td className="px-4 py-4 font-semibold text-[#588157] dark:text-[#A3B18A] lg:px-5">{p.codigo || `#${p.id}`}</td><td className="px-4 py-4 lg:px-5">{p.empresa}</td><td className="px-4 py-4 lg:px-5">{p.plano}</td><td className="px-4 py-4 text-[#667A69] dark:text-[#B4C5B5] lg:px-5">{dataBR(p.data)}</td><td className="px-4 py-4 font-semibold lg:px-5">{moeda(p.valor)}</td><td className="px-4 py-4 lg:px-5"><span className={classeStatusPagamento(p.status)}>{statusNome(p.status)}</span></td><td className="px-4 py-4 lg:px-5"><BotaoIcone title={`Ver transação ${p.codigo || p.id}`} onClick={() => setPagamentoSelecionado(p)}><ReceiptText size={18}/></BotaoIcone></td></tr>)}
                  {!pagamentosFiltrados.length && <tr><td colSpan={7} className="px-5 py-10 text-center text-[#7B8C7D] dark:text-[#B4C5B5]">Nenhum pagamento encontrado.</td></tr>}
                </tbody></table></div><div className="flex flex-col justify-between gap-2 border-t border-[#DAD7CD] px-4 py-4 text-xs text-[#7B8C7D] dark:border-[#34483A] dark:text-[#B4C5B5] sm:flex-row sm:px-5"><span>Exibindo {pagamentosFiltrados.length} de {movimentacoes.length} transações recentes</span><span>Até 100 pagamentos mais recentes</span></div>
            </Card>

            {/* ATENDIMENTO AO CLIENTE */}
            <Card className="overflow-hidden">
              <div className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-6">
                <div className="min-w-0">
                  <h3 className="flex items-center gap-2 font-semibold"><MessageSquare size={19} className="shrink-0 text-[#588157] dark:text-[#A3B18A]"/> Mensagens dos clientes</h3>
                  <p className="mt-1 text-sm text-[#7B8C7D] dark:text-[#B4C5B5]">Leia as solicitações recebidas e responda por e-mail, mesmo quando o cliente não possui conta.</p>
                </div>
                <div className="flex w-full items-center gap-2 sm:w-auto">
                  <div className="relative flex-1 sm:w-64 sm:flex-none"><Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#7B8C7D]"/><input value={buscaConversa} onChange={(e) => setBuscaConversa(e.target.value)} placeholder="Buscar mensagem..." className="w-full rounded-xl border border-[#DAD7CD] bg-[#F8F9F6] py-2.5 pl-9 pr-3 text-sm outline-none focus:border-[#588157] dark:border-[#34483A] dark:bg-[#111A14]"/></div>
                  <BotaoIcone title="Atualizar mensagens" disabled={carregandoConversas} onClick={() => setAtualizacaoConversas((n) => n + 1)}><RefreshCw size={18} className={carregandoConversas ? "animate-spin" : ""}/></BotaoIcone>
                </div>
              </div>
              {erroConversas && <p role="alert" className="mx-4 mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700 dark:bg-red-950/30 dark:text-red-300 sm:mx-5">{erroConversas}</p>}

              {/* LISTA EM CARDS (celular) */}
              <div className="divide-y divide-[#E7EDE5] border-t border-[#DAD7CD] dark:divide-[#34483A] dark:border-[#34483A] md:hidden">
                {conversasFiltradas.map((c) => <div key={c.id} className="space-y-3 p-4">
                  <div className="flex items-start justify-between gap-3"><div className="min-w-0"><p className="break-words font-semibold">{c.nome_cliente} {c.sobrenome_cliente}</p><p className="break-all text-xs text-[#667A69] dark:text-[#B4C5B5]">{c.email}</p></div><span className={`shrink-0 ${classeStatusConversa(c.status)}`}>{statusConversaNome(c.status)}</span></div>
                  <p className="break-words text-sm">{c.assunto}</p>
                  <div className="flex items-center justify-between gap-3"><span className="text-xs text-[#667A69] dark:text-[#B4C5B5]">{dataBR(c.criado_em)}</span><button type="button" onClick={() => abrirConversa(c)} className="inline-flex items-center gap-2 rounded-xl bg-[#3A5A40] px-3 py-2 text-xs font-semibold text-white transition hover:bg-[#588157]"><Mail size={15}/> {c.status === "encerrada" ? "Visualizar" : "Responder"}</button></div>
                </div>)}
                {!conversasFiltradas.length && <p className="px-4 py-10 text-center text-sm text-[#7B8C7D]">{carregandoConversas ? "Carregando mensagens..." : "Nenhuma mensagem encontrada."}</p>}
              </div>

              {/* TABELA (tablet e desktop) */}
              <div className="hidden overflow-x-auto md:block">
                <table className="w-full min-w-[760px] text-left text-sm">
                  <thead><tr className="border-y border-[#DAD7CD] bg-[#F1F4EF] text-xs uppercase tracking-wide text-[#667A69] dark:border-[#34483A] dark:bg-[#273B31] dark:text-[#B4C5B5]">{["Cliente", "E-mail", "Assunto", "Data", "Status", "Atendimento"].map((h) => <th key={h} className="px-4 py-4 font-semibold lg:px-5">{h}</th>)}</tr></thead>
                  <tbody>
                    {conversasFiltradas.map((c) => <tr key={c.id} className="border-b border-[#E7EDE5] hover:bg-[#F8F9F6] dark:border-[#34483A] dark:hover:bg-[#273B31]">
                      <td className="px-4 py-4 font-semibold lg:px-5">{c.nome_cliente} {c.sobrenome_cliente}</td>
                      <td className="px-4 py-4 lg:px-5">{c.email}</td>
                      <td className="px-4 py-4 lg:px-5">{c.assunto}</td>
                      <td className="px-4 py-4 text-[#667A69] dark:text-[#B4C5B5] lg:px-5">{dataBR(c.criado_em)}</td>
                      <td className="px-4 py-4 lg:px-5"><span className={classeStatusConversa(c.status)}>{statusConversaNome(c.status)}</span></td>
                      <td className="px-4 py-4 lg:px-5"><button type="button" onClick={() => abrirConversa(c)} className="inline-flex items-center gap-2 rounded-xl bg-[#3A5A40] px-3 py-2 text-xs font-semibold text-white transition hover:bg-[#588157]"><Mail size={15}/> {c.status === "encerrada" ? "Visualizar" : "Responder"}</button></td>
                    </tr>)}
                    {!conversasFiltradas.length && <tr><td colSpan={6} className="px-5 py-10 text-center text-[#7B8C7D]">{carregandoConversas ? "Carregando mensagens..." : "Nenhuma mensagem encontrada."}</td></tr>}
                  </tbody>
                </table>
              </div>
              <div className="border-t border-[#DAD7CD] px-4 py-4 text-xs text-[#7B8C7D] dark:border-[#34483A] sm:px-5">{conversasFiltradas.length} conversa(s) encontrada(s)</div>
            </Card>
          </>}
        </main>
      </div>

      {/* POP-UP DE RESPOSTA AO CLIENTE */}
      {conversaSelecionada && (
        <div className="fixed inset-0 z-[80] flex items-end justify-center bg-black/65 p-0 sm:items-center sm:p-4" onMouseDown={(e) => { if (e.target === e.currentTarget && !enviandoResposta) setConversaSelecionada(null); }}>
          <section role="dialog" aria-modal="true" aria-labelledby="titulo-conversa" className="flex max-h-[92vh] w-full max-w-2xl flex-col overflow-hidden rounded-t-2xl border border-[#DAD7CD] bg-white shadow-2xl dark:border-[#34483A] dark:bg-[#1C2920] sm:max-h-[90vh] sm:rounded-2xl">
            <div className="flex items-start justify-between gap-3 border-b border-[#DAD7CD] p-4 dark:border-[#34483A] sm:gap-4 sm:p-5">
              <div className="min-w-0"><h2 id="titulo-conversa" className="flex items-center gap-2 text-base font-bold sm:text-lg"><Mail size={20} className="shrink-0 text-[#588157] dark:text-[#A3B18A]"/> Atendimento #{conversaSelecionada.id}</h2><p className="mt-2 break-words text-sm font-semibold">{conversaSelecionada.nome_cliente} {conversaSelecionada.sobrenome_cliente}</p><p className="break-all text-xs text-[#7B8C7D] dark:text-[#B4C5B5]">{conversaSelecionada.email}</p><p className="mt-1 break-words text-xs text-[#7B8C7D] dark:text-[#B4C5B5]">Assunto: {conversaSelecionada.assunto}</p></div>
              <BotaoIcone title="Fechar atendimento" disabled={enviandoResposta} onClick={() => setConversaSelecionada(null)}><X size={18}/></BotaoIcone>
            </div>
            <div className="min-h-0 flex-1 space-y-4 overflow-y-auto bg-[#F8F9F6] p-4 dark:bg-[#111A14] sm:p-5">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-[#7B8C7D]">Histórico da conversa</h3>
              {carregandoMensagens && <p className="text-sm text-[#7B8C7D]">Carregando histórico...</p>}
              {!carregandoMensagens && !mensagensConversa.length && <p className="text-sm text-[#7B8C7D]">Nenhuma mensagem encontrada.</p>}
              {mensagensConversa.map((m) => <div key={m.id} className={`max-w-[96%] rounded-2xl border p-3 text-sm shadow-sm sm:max-w-[92%] sm:p-4 ${m.autor === "admin" ? "ml-auto border-[#588157]/30 bg-[#E7EFE5] dark:bg-[#273B31]" : "mr-auto border-[#DAD7CD] bg-white dark:border-[#34483A] dark:bg-[#1C2920]"}`}>
                <div className="mb-2 flex flex-wrap items-center justify-between gap-2"><strong className="text-xs text-[#3A5A40] dark:text-[#A3B18A]">{m.autor === "admin" ? "Equipe Visora" : "Cliente"}</strong><span className="text-[11px] text-[#7B8C7D]">{m.criado_em ? new Date(m.criado_em).toLocaleString("pt-BR") : ""}</span></div>
                <p className="whitespace-pre-wrap break-words leading-relaxed">{m.mensagem}</p>
                {m.autor === "admin" && <p className="mt-2 text-[11px] text-[#7B8C7D]">{m.email_enviado ? "E-mail enviado" : "Envio por e-mail não confirmado"}</p>}
              </div>)}
            </div>
            <form onSubmit={enviarResposta} className="space-y-3 border-t border-[#DAD7CD] p-4 dark:border-[#34483A] sm:p-5">
              <label htmlFor="resposta-admin" className="block text-sm font-semibold">Responder por e-mail</label>
              <textarea id="resposta-admin" value={resposta} onChange={(e) => setResposta(e.target.value)} disabled={enviandoResposta || carregandoMensagens || conversaSelecionada.status === "encerrada"} rows={4} maxLength={10000} placeholder="Escreva a resposta que será enviada ao e-mail do cliente..." className="w-full resize-y rounded-xl border border-[#DAD7CD] bg-[#F8F9F6] p-3 text-sm outline-none focus:border-[#588157] focus:ring-2 focus:ring-[#588157]/20 disabled:opacity-60 dark:border-[#34483A] dark:bg-[#111A14]" required />
              {avisoResposta && <p role="status" className="rounded-lg bg-green-50 p-3 text-sm text-green-700 dark:bg-green-900/20 dark:text-green-300">{avisoResposta}</p>}
              {erroResposta && <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-700 dark:bg-red-950/30 dark:text-red-300">{erroResposta}</p>}
              <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end"><button type="button" disabled={enviandoResposta} onClick={() => setConversaSelecionada(null)} className="rounded-xl border border-[#DAD7CD] px-4 py-2.5 text-sm font-semibold dark:border-[#34483A]">Fechar</button><button type="submit" disabled={enviandoResposta || carregandoMensagens || !resposta.trim() || conversaSelecionada.status === "encerrada"} className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#3A5A40] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#588157] disabled:cursor-not-allowed disabled:opacity-50"><Send size={16}/>{enviandoResposta ? "Enviando..." : "Enviar resposta"}</button></div>
            </form>
          </section>
        </div>
      )}

      {pagamentoSelecionado && <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/60 p-4" onMouseDown={(e) => { if (e.target === e.currentTarget) setPagamentoSelecionado(null); }}><section role="dialog" aria-modal="true" aria-labelledby="titulo-pagamento" className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-2xl border border-[#DAD7CD] bg-white p-5 shadow-2xl dark:border-[#34483A] dark:bg-[#1C2920] sm:p-6"><div className="flex items-center justify-between gap-3"><h2 id="titulo-pagamento" className="flex items-center gap-2 font-semibold"><Building2 size={20} className="shrink-0 text-[#588157] dark:text-[#A3B18A]"/> Detalhes do pagamento</h2><BotaoIcone title="Fechar detalhes" onClick={() => setPagamentoSelecionado(null)}><X size={18}/></BotaoIcone></div>
        <div className="mt-5 space-y-3 sm:mt-6">{[["Transação", pagamentoSelecionado.codigo || `#${pagamentoSelecionado.id}`], ["Empresa", pagamentoSelecionado.empresa], ["Plano", pagamentoSelecionado.plano], ["Método", metodoNome(pagamentoSelecionado.metodo)], ["Data", dataBR(pagamentoSelecionado.data)], ["Valor", moeda(pagamentoSelecionado.valor)], ["Status", statusNome(pagamentoSelecionado.status)]].map(([rotulo, valor]) => <div key={rotulo} className="flex justify-between gap-4 border-b border-[#E7EDE5] pb-3 text-sm dark:border-[#34483A]"><span className="shrink-0 text-[#667A69] dark:text-[#B4C5B5]">{rotulo}</span><span className="break-all text-right font-semibold">{valor ?? "—"}</span></div>)}</div><button type="button" onClick={() => setPagamentoSelecionado(null)} className="mt-6 w-full rounded-xl bg-[#588157] py-3 text-sm font-semibold text-white hover:bg-[#3A5A40]">Fechar</button></section></div>}

    </div>
  </div>;
}
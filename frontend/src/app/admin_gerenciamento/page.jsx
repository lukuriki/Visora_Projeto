"use client";

import { useCallback, useEffect, useLayoutEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { buscarPerfilAdmin } from "@/lib/api";
import {
  ArrowLeft, ArrowRight, Building2, Users, CreditCard, ReceiptText,
  ScrollText, RefreshCw, Search, Pencil, Power, Trash2, X,
  Sun, Moon, ShieldCheck, CheckCircle2, AlertCircle,
  Save, CalendarDays, ChevronRight, LockKeyhole, SlidersHorizontal,
  UserRound, FileClock, Ban, Info, LayoutDashboard, Settings2, LogOut, ChevronDown,
} from "lucide-react";

const API = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api").replace(/\/+$/, "");
const token = () => sessionStorage.getItem("admin-token") || localStorage.getItem("admin-token");

async function api(path, options = {}) {
  const t = token();
  if (!t) throw Object.assign(new Error("Sessão administrativa não encontrada."), { status: 401 });
  const res = await fetch(`${API}/admin${path}`, {
    ...options,
    cache: "no-store",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${t}`, ...options.headers },
  });
  const dados = await res.json().catch(() => null);
  if (!res.ok) {
    const e = new Error(dados?.mensagem || dados?.message || `Erro HTTP ${res.status}`);
    e.status = res.status;
    throw e;
  }
  return dados?.resultado;
}

const camposUsuario = [
  ["nome_completo", "Nome completo"],
  ["nome_usuario", "Nome de usuário"],
  ["email", "E-mail"],
  ["telefone_usuario", "Telefone"],
];
const camposEmpresa = [
  ["razao_social", "Razão social"],
  ["email_empresa", "E-mail"],
  ["telefone_empresa", "Telefone"],
  ["setor_atuacao", "Setor de atuação"],
  ["porte_empresa", "Porte da empresa"],
  ["regime_tributario", "Regime tributário"],
  ["perfil_risco", "Perfil de risco"],
  ["capital_inicial", "Capital inicial"],
];
const opcoes = {
  setor_atuacao: ["Comércio", "Serviços", "Indústria", "Tecnologia", "Varejo", "Saúde", "Outros"],
  porte_empresa: ["Autônomo", "MEI", "ME", "EPP", "Média", "Grande"],
  regime_tributario: ["Pessoa Física", "Simples Nacional", "Lucro Presumido", "Lucro Real"],
  perfil_risco: ["Conservador", "Moderado", "Arrojado"],
};
const tabs = [
  { id: "usuarios", nome: "Usuários", Icon: Users, descricao: "Contas e permissões" },
  { id: "empresas", nome: "Empresas", Icon: Building2, descricao: "Cadastros e situação" },
  { id: "assinaturas", nome: "Assinaturas", Icon: CreditCard, descricao: "Planos contratados" },
  { id: "pagamentos", nome: "Pagamentos", Icon: ReceiptText, descricao: "Transações registradas" },
  { id: "logs", nome: "Auditoria", Icon: ScrollText, descricao: "Histórico de ações" },
];
const titulos = {
  usuarios: { titulo: "Gerenciamento de usuários", texto: "Consulte, atualize e gerencie o acesso às contas da plataforma." },
  empresas: { titulo: "Gerenciamento de empresas", texto: "Acompanhe os cadastros e a situação das empresas vinculadas." },
  assinaturas: { titulo: "Gerenciamento de assinaturas", texto: "Consulte os planos e administre cancelamentos quando permitidos." },
  pagamentos: { titulo: "Histórico de pagamentos", texto: "Acompanhe as transações e os respectivos estados de pagamento." },
  logs: { titulo: "Auditoria administrativa", texto: "Consulte as ações registradas para rastreabilidade e segurança." },
};
const cabecalhos = {
  usuarios: ["ID", "Usuário", "E-mail", "Conta geral", "Vínculo empresarial", "Empresas", "Ações"],
  empresas: ["ID", "Empresa", "Documento", "Status", "Usuários", "Ações"],
  assinaturas: ["ID", "Empresa", "Plano", "Valor", "Status", "Ações"],
  pagamentos: ["ID / Transação", "Empresa", "Método", "Valor", "Status", "Data"],
  logs: ["Data", "Administrador", "Ação", "Entidade", "Descrição"],
};
const moeda = (v) => new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(Number(v) || 0);
const numero = (v) => new Intl.NumberFormat("pt-BR").format(Number(v) || 0);
function formatarData(v) {
  if (!v) return "—";
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? String(v) : d.toLocaleDateString("pt-BR");
}
const campo = "w-full rounded-xl border border-[#DAD7CD] bg-[#FAFBF9] px-4 py-3 text-sm text-[#273B31] outline-none transition-all duration-200 placeholder:text-[#91A093] hover:border-[#A3B18A] focus:border-[#588157] focus:bg-white focus:ring-4 focus:ring-[#588157]/10 dark:border-[#34483A] dark:bg-[#111A14] dark:text-[#E5EDE5] dark:placeholder:text-[#809484] dark:hover:border-[#7E9971] dark:focus:border-[#A3B18A] dark:focus:bg-[#18231B]";
const botaoBase = "inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#588157]/20 disabled:cursor-not-allowed disabled:opacity-50";
const botaoNeutro = `${botaoBase} border border-[#DAD7CD] bg-white text-[#3A5A40] shadow-sm hover:-translate-y-0.5 hover:border-[#A3B18A] hover:bg-[#EDF3EB] hover:shadow-md dark:border-[#34483A] dark:bg-[#1C2920] dark:text-[#D8E7D8] dark:hover:border-[#7E9971] dark:hover:bg-[#273B31]`;
const botaoPrimario = `${botaoBase} bg-[#3A5A40] text-white shadow-sm shadow-[#3A5A40]/20 hover:-translate-y-0.5 hover:bg-[#588157] hover:shadow-lg hover:shadow-[#3A5A40]/20 dark:bg-[#588157] dark:hover:bg-[#70966F]`;
const botaoPerigo = `${botaoBase} bg-[#B94E4E] text-white hover:-translate-y-0.5 hover:bg-[#9E3939] hover:shadow-md dark:bg-[#B94E4E] dark:hover:bg-[#CF6060]`;

function Status({ valor }) {
  const s = String(valor ?? "").toLowerCase();
  const positivo = ["ativo", "ativa", "aprovado", "pago", "recebido"].includes(s);
  const alerta = ["pendente", "expirada"].includes(s);
  const negativo = ["inativo", "inativa", "cancelada", "cancelado", "recusado", "estornado"].includes(s);
  const cores = positivo
    ? "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800/60 dark:bg-emerald-900/20 dark:text-emerald-300"
    : alerta
      ? "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-800/60 dark:bg-amber-900/20 dark:text-amber-300"
      : negativo
        ? "border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-900/60 dark:bg-rose-950/25 dark:text-rose-300"
        : "border-[#DAD7CD] bg-[#F1F4EF] text-[#667A69] dark:border-[#34483A] dark:bg-[#273B31] dark:text-[#B4C5B5]";
  return <span className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border px-2.5 py-1 text-xs font-semibold capitalize ${cores}`}>
    <span className={`h-1.5 w-1.5 rounded-full ${positivo ? "bg-emerald-500" : alerta ? "bg-amber-500" : negativo ? "bg-rose-500" : "bg-[#91A093]"}`} />
    {s.replaceAll("_", " ") || "—"}
  </span>;
}
function Acao({ title, onClick, variant = "normal", children, disabled }) {
  const estilos = {
    normal: "border-[#DAD7CD] bg-[#F1F5EF] text-[#3A5A40] hover:border-[#A3B18A] hover:bg-[#E0EBDD] dark:border-[#34483A] dark:bg-[#273B31] dark:text-[#B9D2B8] dark:hover:bg-[#344E41]",
    aviso: "border-amber-200 bg-amber-50 text-amber-700 hover:border-amber-300 hover:bg-amber-100 dark:border-amber-900/50 dark:bg-amber-900/20 dark:text-amber-300 dark:hover:bg-amber-900/35",
    perigo: "border-rose-200 bg-rose-50 text-rose-700 hover:border-rose-300 hover:bg-rose-100 dark:border-rose-900/50 dark:bg-rose-950/25 dark:text-rose-300 dark:hover:bg-rose-900/40",
  };
  return <button type="button" title={title} aria-label={title} onClick={onClick} disabled={disabled}
    className={`inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border transition-all duration-200 hover:-translate-y-0.5 hover:shadow-sm focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#588157]/20 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:translate-y-0 ${estilos[variant]}`}>
    {children}
  </button>;
}
function Modal({ children, onClose, maxWidth = "max-w-xl", disabled = false }) {
  return <div className="fixed inset-0 z-[80] flex items-end justify-center bg-[#0A160E]/70 p-0 backdrop-blur-[5px] sm:items-center sm:p-5" onMouseDown={(e) => { if (e.target === e.currentTarget && !disabled) onClose(); }}>
    <section role="dialog" aria-modal="true" className={`max-h-[92vh] w-full ${maxWidth} overflow-y-auto rounded-t-[24px] border border-[#DAD7CD] bg-white shadow-2xl shadow-black/20 dark:border-[#34483A] dark:bg-[#1C2920] dark:shadow-black/50 sm:rounded-[24px]`}>
      {children}
    </section>
  </div>;
}

function BotaoIcone({ children, title, onClick, disabled = false, className = "" }) {
  return <button type="button" title={title} aria-label={title} onClick={onClick} disabled={disabled}
    className={`inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[#DAD7CD] bg-white text-[#3A5A40] transition hover:border-[#588157] hover:bg-[#edf3eb] disabled:opacity-50 dark:border-[#34483A] dark:bg-[#1C2920] dark:text-[#C9DACB] dark:hover:border-[#7E9971] dark:hover:bg-[#273B31] ${className}`}>{children}</button>;
}

export default function AdminGerenciamento() {
  const router = useRouter();
  const [aba, setAba] = useState("usuarios");
  const [dados, setDados] = useState([]);
  const [busca, setBusca] = useState("");
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState("");
  const [aviso, setAviso] = useState("");
  const [edicao, setEdicao] = useState(null);
  const [form, setForm] = useState({});
  const [exclusao, setExclusao] = useState(null);
  const [mudancaStatus, setMudancaStatus] = useState(null);
  const [confirmacao, setConfirmacao] = useState("");
  const [salvando, setSalvando] = useState(false);
  const [escuro, setEscuro] = useState(false);
  const [temaPronto, setTemaPronto] = useState(false);
  const [autorizado, setAutorizado] = useState(false);
  const [verificando, setVerificando] = useState(true);
  const [administrador, setAdministrador] = useState(null);
  const [perfilAberto, setPerfilAberto] = useState(false);

  useLayoutEffect(() => {
    const salvo = localStorage.getItem("visora-admin-theme");
    const novo = salvo === "dark" || (salvo !== "light" && document.documentElement.classList.contains("dark"));
    document.documentElement.classList.toggle("dark", novo);
    setEscuro(novo);
    setTemaPronto(true);
  }, []);

  function alternarTema() {
    const novo = !escuro;
    document.documentElement.classList.toggle("dark", novo);
    localStorage.setItem("visora-admin-theme", novo ? "dark" : "light");
    setEscuro(novo);
  }

  useEffect(() => {
    let ativo = true;
    async function verificarAcesso() {
      try {
        const t = token();
        if (!t) throw Object.assign(new Error("Sessão não encontrada."), { status: 401 });
        const resultado = await buscarPerfilAdmin(t);
        if (!resultado?.administrador || resultado.administrador.tipo !== "admin") {
          throw Object.assign(new Error("Acesso administrativo não autorizado."), { status: 403 });
        }
        if (ativo) { setAdministrador(resultado.administrador); setAutorizado(true); }
      } catch (e) {
        if (!ativo) return;
        if ([401, 403].includes(e.status) || /sessão|autorizad/i.test(e.message)) {
          sessionStorage.removeItem("admin-token");
          localStorage.removeItem("admin-token");
          router.replace("/areapublica_pagina_login");
        } else setErro(e.message);
      } finally { if (ativo) setVerificando(false); }
    }
    verificarAcesso();
    return () => { ativo = false; };
  }, [router]);

  function sair() {
    sessionStorage.removeItem("admin-token");
    localStorage.removeItem("admin-token");
    router.replace("/areapublica_pagina_login");
  }

  const carregar = useCallback(async () => {
    if (!autorizado) return;
    setCarregando(true);
    setErro("");
    try {
      const resultado = await api(`/${aba}`);
      setDados(Array.isArray(resultado) ? resultado : []);
    } catch (e) {
      setErro(e.message);
      if (e.status === 401) router.replace("/areapublica_pagina_login");
    } finally {
      setCarregando(false);
    }
  }, [aba, router, autorizado]);

  useEffect(() => { carregar(); }, [carregar]);
  const filtrados = useMemo(() => {
    const termo = busca.trim().toLowerCase();
    if (!termo) return dados;
    return dados.filter((item) => Object.values(item).some((v) => String(v ?? "").toLowerCase().includes(termo)));
  }, [dados, busca]);

  async function executar(fn) {
    setSalvando(true);
    setErro("");
    setAviso("");
    try {
      await fn();
      setAviso("Operação realizada com sucesso.");
      setEdicao(null);
      setExclusao(null);
      setConfirmacao("");
      await carregar();
      return true;
    } catch (e) {
      setErro(e.message);
      return false;
    } finally {
      setSalvando(false);
    }
  }
  function abrirEdicao(item) { setForm({ ...item }); setEdicao(item); }
  function editar() {
    if (!edicao) return;
    const campos = aba === "usuarios" ? camposUsuario : camposEmpresa;
    const payload = Object.fromEntries(campos.map(([k]) => [k, form[k] ?? null]));
    executar(() => api(`/${aba}/${edicao.id}`, { method: "PATCH", body: JSON.stringify(payload) }));
  }
  function alterarStatus(item) {
    const atual = aba === "usuarios" ? item.status_conta : item.status;
    const proximo = aba === "usuarios"
      ? (atual === "ativo" ? "inativo" : "ativo")
      : (atual === "ativa" ? "inativa" : "ativa");
    setErro("");
    setMudancaStatus({ item, tipo: aba, proximo });
  }
  function confirmarMudancaStatus() {
    if (!mudancaStatus) return;
    const { item, tipo, proximo } = mudancaStatus;
    executar(() => api(`/${tipo}/${item.id}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status: proximo }),
    })).then((sucesso) => { if (sucesso) setMudancaStatus(null); });
  }
  function cancelarAssinatura(item) {
    if (!window.confirm(`Cancelar a assinatura #${item.id}? Esta ação não pode ser desfeita pelo painel.`)) return;
    executar(() => api(`/assinaturas/${item.id}/cancelar`, { method: "PATCH" }));
  }
  function trocarAba(id) {
    setAba(id);
    setBusca("");
    setErro("");
    setAviso("");
    setEdicao(null);
    setExclusao(null);
    setMudancaStatus(null);
  }

  useEffect(() => {
  const html = document.documentElement;

  const esquemaAnterior = html.style.colorScheme;

  html.style.colorScheme = escuro ? "dark" : "light";

  return () => {
    html.style.colorScheme = esquemaAnterior;
  };
}, [escuro]);

  const tabAtual = tabs.find((t) => t.id === aba) || tabs[0];
  const IconeAtual = tabAtual.Icon;
  const info = titulos[aba];
  const td = "px-4 py-4 align-middle lg:px-5";
  const muted = "text-[#718573] dark:text-[#A7B9A8]";
  const dataAtual = new Date().toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long", year: "numeric" });


  const acoesUsuario = (item) => <div className="flex items-center gap-2"><Acao title="Editar usuário" onClick={() => abrirEdicao(item)}><Pencil size={16} /></Acao><Acao title={item.status_conta === "ativo" ? "Desativar usuário" : "Reativar usuário"} variant="aviso" onClick={() => alterarStatus(item)}><Power size={16} /></Acao><Acao title="Excluir permanentemente" variant="perigo" onClick={() => { setExclusao(item); setConfirmacao(""); }}><Trash2 size={16} /></Acao></div>;
  const acoesEmpresa = (item) => <div className="flex items-center gap-2"><Acao title="Editar empresa" onClick={() => abrirEdicao(item)}><Pencil size={16} /></Acao><Acao title={item.status === "ativa" ? "Desativar empresa" : "Reativar empresa"} variant="aviso" onClick={() => alterarStatus(item)}><Power size={16} /></Acao></div>;
  const botaoCancelar = (item) => <button type="button" disabled={!['ativa', 'pendente'].includes(item.status) || salvando} onClick={() => cancelarAssinatura(item)} className={`${botaoBase} !px-3 !py-2 border border-rose-200 bg-rose-50 text-xs text-rose-700 hover:border-rose-300 hover:bg-rose-100 dark:border-rose-900/60 dark:bg-rose-950/25 dark:text-rose-300 dark:hover:bg-rose-900/30`}><Ban size={15} /> Cancelar</button>;
  const linhaCard = (rotulo, valor) => <div className="flex items-start justify-between gap-4 text-sm"><span className={`shrink-0 text-xs ${muted}`}>{rotulo}</span><span className="min-w-0 break-words text-right font-medium">{valor}</span></div>;

  function cartaoMobile(item) {
    if (aba === "usuarios") return <div key={item.id} className="space-y-3 p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3"><div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#E7EFE5] text-[#588157] dark:bg-[#344E41] dark:text-[#A3B18A]"><UserRound size={17} /></div><div className="min-w-0"><p className="break-words font-semibold">{item.nome_completo || "—"}</p><p className={`text-xs ${muted}`}>@{item.nome_usuario || "—"} · #{item.id}</p></div></div>
        <Status valor={item.status_conta} />
      </div>
      <p className={`break-all text-xs ${muted}`}>{item.email || "—"}</p>
      <div className="flex flex-wrap items-center gap-2"><Status valor={item.status_vinculo ?? "sem_vinculo"} /><span className="inline-flex min-w-8 items-center justify-center rounded-lg bg-[#F1F4EF] px-2.5 py-1 text-xs font-semibold dark:bg-[#344E41]">{numero(item.total_empresas)} empresa(s)</span></div>
      {(Number(item.empresas_ativas) > 0 || Number(item.empresas_inativas) > 0) && <p className={`text-[11px] ${muted}`}>{Number(item.empresas_ativas) > 0 && `${numero(item.empresas_ativas)} vínculo(s) ativo(s)`}{Number(item.empresas_ativas) > 0 && Number(item.empresas_inativas) > 0 && " • "}{Number(item.empresas_inativas) > 0 && `${numero(item.empresas_inativas)} vínculo(s) inativo(s)`}</p>}
      {item.nomes_empresas_ativas && <p className={`break-words text-[11px] ${muted}`}>Ativas: {item.nomes_empresas_ativas}</p>}
      {item.nomes_empresas_inativas && <p className={`break-words text-[11px] ${muted}`}>Inativas: {item.nomes_empresas_inativas}</p>}
      {acoesUsuario(item)}
    </div>;
    if (aba === "empresas") return <div key={item.id} className="space-y-3 p-4">
      <div className="flex items-start justify-between gap-3"><div className="min-w-0"><p className="break-words font-semibold">{item.razao_social || "—"}</p><p className={`text-xs ${muted}`}>#{item.id} · {item.documento_identificacao || "—"}</p></div><Status valor={item.status} /></div>
      {linhaCard("Usuários", numero(item.total_usuarios))}
      {acoesEmpresa(item)}
    </div>;
    if (aba === "assinaturas") return <div key={item.id} className="space-y-3 p-4">
      <div className="flex items-start justify-between gap-3"><div className="min-w-0"><p className="break-words font-semibold">{item.empresa || "—"}</p><p className={`text-xs ${muted}`}>#{item.id} · {item.plano || "—"}</p></div><Status valor={item.status} /></div>
      {linhaCard("Valor", moeda(item.valor_contratado))}
      {botaoCancelar(item)}
    </div>;
    if (aba === "pagamentos") return <div key={item.id} className="space-y-3 p-4">
      <div className="flex items-start justify-between gap-3"><div className="min-w-0"><p className="break-words font-semibold">{item.empresa || "—"}</p><p className={`break-all text-xs ${muted}`}>#{item.id} · {item.codigo_transacao || "—"}</p></div><Status valor={item.status} /></div>
      {linhaCard("Valor", moeda(item.valor))}
      {linhaCard("Método", <span className="capitalize">{String(item.metodo || "—").replaceAll("_", " ")}</span>)}
      {linhaCard("Data", formatarData(item.criado_em))}
    </div>;
    return <div key={item.id} className="space-y-3 p-4">
      <div className="flex items-start justify-between gap-3"><div className="min-w-0"><p className="font-semibold">{formatarData(item.criado_em)}</p><p className={`inline-flex items-center gap-1.5 text-xs ${muted}`}><ShieldCheck size={13} className="text-[#588157] dark:text-[#A3B18A]" /> Administrador #{item.admin_id ?? "—"}</p></div><Status valor={item.acao} /></div>
      {linhaCard("Entidade", <>{item.entidade || "—"} <span className={muted}>#{item.entidade_id ?? "—"}</span></>)}
      <p className={`break-words text-sm ${muted}`}>{item.descricao || "—"}</p>
    </div>;
  }

  if (!temaPronto || verificando || !autorizado) return <div className="flex min-h-screen items-center justify-center bg-[#F8F9F6] text-[#588157] dark:bg-[#111A14] dark:text-[#A3B18A]"><RefreshCw className="animate-spin" size={28} /></div>;


  return <div className={escuro ? "dark" : ""}>
    <div className="relative min-h-screen overflow-hidden bg-[#F8F9F6] font-sans text-[#273B31] transition-colors duration-300 dark:bg-[#111A14] dark:text-[#E5EDE5]">
      <div className="pointer-events-none absolute left-[-15%] top-20 h-[480px] w-[480px] rounded-full bg-[#A3B18A]/10 blur-[100px] dark:bg-[#588157]/10" />
      <div className="pointer-events-none absolute right-[-12%] top-[430px] h-[440px] w-[440px] rounded-full bg-[#588157]/[0.06] blur-[100px]" />

        <header className="sticky top-0 z-30 flex h-[68px] items-center justify-between gap-2 border-b border-[#DAD7CD] bg-white/90 px-3 backdrop-blur-xl dark:border-[#34483A] dark:bg-[#1C2920]/95 min-[400px]:px-4 sm:h-[76px] sm:gap-3 sm:px-8">
          <div className="flex min-w-0 items-center gap-2 sm:gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#E7EFE5] dark:bg-[#273B31] sm:h-11 sm:w-11"><img src="/logo_v_darkmode.png" alt="Visora" className="h-8 w-auto object-contain sm:h-9" /></div>
            <div className="min-w-0"><p className="truncate text-sm font-semibold sm:text-base">Visora <span className="text-[#92A092]">/</span> Administração</p><p className="hidden text-xs capitalize text-[#7B8C7D] dark:text-[#B4C5B5] md:block">{dataAtual}</p></div>
          </div>
          <div className="flex shrink-0 items-center gap-1.5 sm:gap-3">
            <BotaoIcone title={escuro ? "Ativar modo claro" : "Ativar modo escuro"} onClick={alternarTema}>{escuro ? <Sun size={19}/> : <Moon size={19}/>}</BotaoIcone>
            <BotaoIcone title="Atualizar dados" disabled={carregando} onClick={carregar}><RefreshCw size={18} className={carregando ? "animate-spin" : ""}/></BotaoIcone>
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
          <Link href="/administracao_pagina_inicial" className="inline-flex shrink-0 items-center gap-2 rounded-xl border border-[#DAD7CD] bg-white px-4 py-2.5 text-sm font-semibold text-[#3A5A40] transition hover:border-[#588157] hover:bg-[#EDF3EB] dark:border-[#34483A] dark:bg-[#1C2920] dark:text-[#C9DACB] dark:hover:bg-[#273B31]"><LayoutDashboard size={17}/> Visão geral</Link>
          <Link href="/admin_gerenciamento" aria-current="page" className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-[#3A5A40] px-4 py-2.5 text-sm font-semibold text-white dark:bg-[#588157]"><Settings2 size={17}/> Gerenciamento</Link>
        </nav>
      <main className="relative z-10 mx-auto max-w-[1600px] space-y-6 px-4 pb-12 pt-6 sm:space-y-7 sm:px-7 sm:pb-14 sm:pt-8 lg:px-10 lg:pt-10">
        <section className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
          <div className="min-w-0">
            <p className="mb-3 inline-flex flex-wrap items-center gap-2 text-[10px] font-bold uppercase tracking-[0.14em] text-[#588157] dark:text-[#A3B18A] sm:text-[11px] sm:tracking-[0.18em]"><span className="h-2 w-2 shrink-0 rounded-full bg-[#588157] dark:bg-[#A3B18A]" /> Painel administrativo <ChevronRight size={13} /> Gerenciamento</p>
            <h1 className="text-xl font-bold tracking-tight min-[400px]:text-2xl sm:text-3xl lg:text-[34px]">Gestão da plataforma</h1>
            <p className={`mt-2 max-w-2xl text-sm leading-6 ${muted}`}>Controle os usuários, empresas, assinaturas e pagamentos da Visora com segurança e organização.</p>
          </div>
        </section>

        <section aria-label="Seções de gerenciamento" className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {tabs.map(({ id, nome, Icon, descricao }, indice) => {
            const ativo = aba === id;
            return <button key={id} type="button" onClick={() => trocarAba(id)} aria-current={ativo ? "page" : undefined}
              className={`group relative flex min-h-[96px] flex-col items-start justify-between overflow-hidden rounded-2xl border p-3.5 text-left transition-all duration-300 hover:-translate-y-1 hover:shadow-lg focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#588157]/20 sm:min-h-[105px] sm:p-4 ${indice === tabs.length - 1 ? "col-span-2 sm:col-span-1" : ""} ${ativo ? "border-[#3A5A40] bg-[#3A5A40] text-white shadow-lg shadow-[#3A5A40]/15 dark:border-[#588157] dark:bg-[#344E41]" : "border-[#DAD7CD] bg-white text-[#273B31] shadow-sm hover:border-[#A3B18A] hover:bg-[#F3F7F1] dark:border-[#34483A] dark:bg-[#1C2920] dark:text-[#E5EDE5] dark:hover:border-[#7E9971] dark:hover:bg-[#273B31]"}`}>
              <div className="flex w-full items-center justify-between gap-2">
                <span className={`flex h-9 w-9 items-center justify-center rounded-xl ${ativo ? "bg-white/15 text-white" : "bg-[#E7EFE5] text-[#588157] dark:bg-[#344E41] dark:text-[#A3B18A]"}`}><Icon size={19} /></span>
                <ArrowRight size={16} className={`transition-all duration-200 group-hover:translate-x-1 ${ativo ? "text-white/80" : "text-[#9BAC9C]"}`} />
              </div>
              <div className="mt-3"><p className="text-sm font-bold">{nome}</p><p className={`mt-0.5 hidden text-[11px] sm:block ${ativo ? "text-white/70" : muted}`}>{descricao}</p></div>
              {ativo && <span className="absolute inset-x-4 bottom-0 h-[3px] rounded-t-full bg-[#A3B18A]" />}
            </button>;
          })}
        </section>

        <section className="overflow-hidden rounded-[22px] border border-[#DAD7CD]/90 bg-white shadow-sm shadow-[#273B31]/[0.04] dark:border-[#34483A] dark:bg-[#1C2920] dark:shadow-black/10">
          <div className="flex flex-col justify-between gap-5 border-b border-[#E4EAE1] p-4 dark:border-[#34483A] sm:p-6 lg:flex-row lg:items-center">
            <div className="flex min-w-0 items-start gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#E7EFE5] text-[#588157] dark:bg-[#344E41] dark:text-[#A3B18A]"><IconeAtual size={22} /></div>
              <div className="min-w-0"><h2 className="text-base font-bold tracking-tight sm:text-lg">{info.titulo}</h2><p className={`mt-1 max-w-xl text-xs leading-5 sm:text-sm ${muted}`}>{info.texto}</p></div>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <div className="relative min-w-0 sm:w-64 lg:w-72"><Search size={17} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[#7B8C7D]" />
                <input value={busca} onChange={(e) => setBusca(e.target.value)} placeholder="Pesquisar registros..." aria-label="Pesquisar registros" className={`${campo} !py-2.5 !pl-10`} />
                {busca && <button type="button" title="Limpar pesquisa" aria-label="Limpar pesquisa" onClick={() => setBusca("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#7B8C7D] hover:text-[#3A5A40]"><X size={15} /></button>}
              </div>
              <button type="button" onClick={carregar} disabled={carregando} className={`${botaoNeutro} w-full sm:w-auto`}><RefreshCw size={16} className={carregando ? "animate-spin" : ""} /> Atualizar</button>
            </div>
          </div>

          {(erro || aviso) && <div className="space-y-2 px-4 pt-5 sm:px-6">
            {erro && <div role="alert" className="flex items-start gap-3 rounded-xl border border-rose-200 bg-rose-50 p-3.5 text-sm text-rose-700 dark:border-rose-900/60 dark:bg-rose-950/25 dark:text-rose-300"><AlertCircle size={18} className="mt-0.5 shrink-0" /><span className="min-w-0 flex-1 break-words">{erro}</span><button type="button" onClick={() => setErro("")} title="Dispensar aviso"><X size={16} /></button></div>}
            {aviso && <div role="status" className="flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-3.5 text-sm text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-950/20 dark:text-emerald-300"><CheckCircle2 size={18} className="mt-0.5 shrink-0" /><span className="min-w-0 flex-1">{aviso}</span><button type="button" onClick={() => setAviso("")} title="Dispensar aviso"><X size={16} /></button></div>}
          </div>}

          {/* LISTA EM CARDS (celular) */}
          <div className="divide-y divide-[#E8EDE5] md:hidden dark:divide-[#34483A]">
            {filtrados.map((item) => cartaoMobile(item))}
            {!filtrados.length && <div className="flex flex-col items-center gap-3 px-6 py-14 text-center"><div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#EDF2EB] text-[#7E9971] dark:bg-[#273B31]"><Search size={24} /></div><p className="font-semibold">{carregando ? "Carregando registros..." : "Nenhum registro encontrado"}</p><p className={`max-w-sm text-xs ${muted}`}>{carregando ? "Consultando as informações da plataforma." : busca ? "Tente pesquisar usando outro nome, ID ou termo." : "Ainda não há registros disponíveis nesta seção."}</p></div>}
          </div>

          {/* TABELA (tablet e desktop) */}
          <div className="hidden overflow-x-auto md:block">
            <table className="w-full min-w-[780px] text-left text-sm">
              <thead><tr className="border-b border-[#DAD7CD] bg-[#F1F4EF] text-[11px] uppercase tracking-[0.08em] text-[#657968] dark:border-[#34483A] dark:bg-[#273B31] dark:text-[#B4C5B5]">
                {cabecalhos[aba].map((h) => <th key={h} scope="col" className="whitespace-nowrap px-4 py-4 font-bold lg:px-5">{h}</th>)}
              </tr></thead>
              <tbody>
                {filtrados.map((item) => <tr key={item.id} className="border-b border-[#E8EDE5] transition-colors duration-150 last:border-b-0 hover:bg-[#F6F9F4] dark:border-[#34483A] dark:hover:bg-[#273B31]/70">
                  {aba === "usuarios" ? <>
                    <td className={`${td} font-semibold ${muted}`}>#{item.id}</td>
                    <td className={td}><div className="flex items-center gap-3"><div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#E7EFE5] text-[#588157] dark:bg-[#344E41] dark:text-[#A3B18A]"><UserRound size={17} /></div><div className="min-w-0"><p className="max-w-[210px] truncate font-semibold">{item.nome_completo || "—"}</p><p className={`mt-0.5 text-xs ${muted}`}>@{item.nome_usuario || "—"}</p></div></div></td>
                    <td className={`${td} ${muted}`}>{item.email || "—"}</td>
                    <td className={td}><Status valor={item.status_conta} /></td>
                    <td className={td}>
                      <div className="flex flex-col items-start gap-1.5">
                        <Status valor={item.status_vinculo ?? "sem_vinculo"} />
                        {Number(item.empresas_ativas) > 0 && <span className={`text-[11px] ${muted}`}>{numero(item.empresas_ativas)} vínculo(s) ativo(s)</span>}
                        {Number(item.empresas_inativas) > 0 && <span className={`text-[11px] ${muted}`}>{numero(item.empresas_inativas)} vínculo(s) inativo(s)</span>}
                        {item.nomes_empresas_ativas && <span className={`max-w-[220px] truncate text-[11px] ${muted}`} title={item.nomes_empresas_ativas}>Ativas: {item.nomes_empresas_ativas}</span>}
                        {item.nomes_empresas_inativas && <span className={`max-w-[220px] truncate text-[11px] ${muted}`} title={item.nomes_empresas_inativas}>Inativas: {item.nomes_empresas_inativas}</span>}
                      </div>
                    </td>
                    <td className={td}><span className="inline-flex min-w-8 items-center justify-center rounded-lg bg-[#F1F4EF] px-2.5 py-1 text-xs font-semibold dark:bg-[#344E41]">{numero(item.total_empresas)}</span></td>
                    <td className={td}>{acoesUsuario(item)}</td>
                  </> : aba === "empresas" ? <>
                    <td className={`${td} font-semibold ${muted}`}>#{item.id}</td>
                    <td className={`${td} font-semibold`}>{item.razao_social || "—"}</td>
                    <td className={`${td} ${muted}`}>{item.documento_identificacao || "—"}</td>
                    <td className={td}><Status valor={item.status} /></td>
                    <td className={td}><span className="inline-flex min-w-8 items-center justify-center rounded-lg bg-[#F1F4EF] px-2.5 py-1 text-xs font-semibold dark:bg-[#344E41]">{numero(item.total_usuarios)}</span></td>
                    <td className={td}>{acoesEmpresa(item)}</td>
                  </> : aba === "assinaturas" ? <>
                    <td className={`${td} font-semibold ${muted}`}>#{item.id}</td>
                    <td className={`${td} font-semibold`}>{item.empresa || "—"}</td>
                    <td className={td}>{item.plano || "—"}</td>
                    <td className={`${td} whitespace-nowrap font-semibold`}>{moeda(item.valor_contratado)}</td>
                    <td className={td}><Status valor={item.status} /></td>
                    <td className={td}>{botaoCancelar(item)}</td>
                  </> : aba === "pagamentos" ? <>
                    <td className={td}><p className="font-semibold">#{item.id}</p><p className={`mt-0.5 max-w-[160px] truncate text-xs ${muted}`} title={item.codigo_transacao || ""}>{item.codigo_transacao || "—"}</p></td>
                    <td className={`${td} font-medium`}>{item.empresa || "—"}</td>
                    <td className={`${td} capitalize ${muted}`}>{String(item.metodo || "—").replaceAll("_", " ")}</td>
                    <td className={`${td} whitespace-nowrap font-semibold`}>{moeda(item.valor)}</td>
                    <td className={td}><Status valor={item.status} /></td>
                    <td className={`${td} whitespace-nowrap ${muted}`}>{formatarData(item.criado_em)}</td>
                  </> : <>
                    <td className={`${td} whitespace-nowrap ${muted}`}>{formatarData(item.criado_em)}</td>
                    <td className={td}><span className="inline-flex items-center gap-1.5 font-semibold"><ShieldCheck size={15} className="text-[#588157] dark:text-[#A3B18A]" /> #{item.admin_id ?? "—"}</span></td>
                    <td className={td}><Status valor={item.acao} /></td>
                    <td className={`${td} whitespace-nowrap font-medium`}>{item.entidade || "—"} <span className={muted}>#{item.entidade_id ?? "—"}</span></td>
                    <td className={`${td} min-w-[240px] ${muted}`}>{item.descricao || "—"}</td>
                  </>}
                </tr>)}
                {!filtrados.length && <tr><td colSpan={cabecalhos[aba].length} className="px-6 py-16 text-center"><div className="flex flex-col items-center gap-3"><div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#EDF2EB] text-[#7E9971] dark:bg-[#273B31]"><Search size={24} /></div><p className="font-semibold">{carregando ? "Carregando registros..." : "Nenhum registro encontrado"}</p><p className={`max-w-sm text-xs ${muted}`}>{carregando ? "Consultando as informações da plataforma." : busca ? "Tente pesquisar usando outro nome, ID ou termo." : "Ainda não há registros disponíveis nesta seção."}</p></div></td></tr>}
              </tbody>
            </table>
          </div>
          <div className="flex flex-col gap-2 border-t border-[#E4EAE1] bg-[#FCFDFC] px-4 py-4 text-xs text-[#718573] dark:border-[#34483A] dark:bg-[#18231B] dark:text-[#A7B9A8] sm:flex-row sm:items-center sm:justify-between sm:px-6">
            <span className="inline-flex items-center gap-2"><SlidersHorizontal size={14} className="shrink-0" /> Exibindo <strong className="text-[#3A5A40] dark:text-[#E5EDE5]">{numero(filtrados.length)}</strong> de {numero(dados.length)} registros</span>
            <span className="inline-flex items-center gap-2"><FileClock size={14} className="shrink-0" /> Listagem limitada aos 300 registros mais recentes</span>
          </div>
        </section>
        <p className={`flex items-center justify-center gap-2 text-center text-xs ${muted}`}><LockKeyhole size={14} className="shrink-0" /> Área restrita à administração da Visora</p>
      </main>

      {mudancaStatus && <Modal onClose={() => setMudancaStatus(null)} maxWidth="max-w-md" disabled={salvando}>
        <div className="flex items-start justify-between gap-3 border-b border-[#DAD7CD] p-5 dark:border-[#34483A] sm:p-6">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#E7EFE5] text-[#588157] dark:bg-[#344E41] dark:text-[#A3B18A]"><Power size={22} /></div>
            <div><h2 className="text-lg font-bold">{["inativo", "inativa"].includes(mudancaStatus.proximo) ? "Confirmar inativação" : "Confirmar reativação"}</h2><p className={`mt-1 text-xs ${muted}`}>Gerenciamento administrativo</p></div>
          </div>
          <Acao title="Fechar" onClick={() => setMudancaStatus(null)} disabled={salvando}><X size={18} /></Acao>
        </div>
        <div className="space-y-4 p-5 sm:p-6">
          <p className="break-words text-sm leading-6">Deseja {['inativo', 'inativa'].includes(mudancaStatus.proximo) ? 'inativar' : 'reativar'} <strong>{mudancaStatus.tipo === 'usuarios' ? mudancaStatus.item.nome_completo : mudancaStatus.item.razao_social}</strong>?</p>
          {mudancaStatus.tipo === 'usuarios' && <div className="flex gap-2.5 rounded-xl border border-[#DAD7CD] bg-[#F8F9F6] p-3 text-xs leading-5 text-[#536B57] dark:border-[#34483A] dark:bg-[#111A14] dark:text-[#C4D5C4]"><Info size={17} className="mt-0.5 shrink-0" /><span>Esta ação altera somente a conta geral. Os vínculos empresariais permanecem como estão. Para acessar uma empresa, tanto a conta quanto o vínculo precisam estar ativos.</span></div>}
          {erro && <p role="alert" className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700 dark:border-rose-900/60 dark:bg-rose-950/25 dark:text-rose-300">{erro}</p>}
          <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end">
            <button type="button" disabled={salvando} onClick={() => setMudancaStatus(null)} className={botaoNeutro}>Cancelar</button>
            <button type="button" disabled={salvando} onClick={confirmarMudancaStatus} className={['inativo', 'inativa'].includes(mudancaStatus.proximo) ? botaoPerigo : botaoPrimario}>{salvando ? <RefreshCw size={16} className="animate-spin" /> : <Power size={16} />}{salvando ? 'Processando...' : 'Confirmar'}</button>
          </div>
        </div>
      </Modal>}

      {edicao && <Modal onClose={() => setEdicao(null)} disabled={salvando}>
        <div className="flex items-start justify-between gap-3 border-b border-[#E4EAE1] p-5 dark:border-[#34483A] sm:p-6">
          <div className="flex items-center gap-3"><div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#E7EFE5] text-[#588157] dark:bg-[#344E41] dark:text-[#A3B18A]"><Pencil size={20} /></div><div><h2 className="text-lg font-bold">Editar {aba === "usuarios" ? "usuário" : "empresa"}</h2><p className={`mt-0.5 text-xs ${muted}`}>Registro #{edicao.id} • Atualize os campos necessários</p></div></div>
          <Acao title="Fechar edição" onClick={() => setEdicao(null)} disabled={salvando}><X size={18} /></Acao>
        </div>
        <form onSubmit={(e) => { e.preventDefault(); editar(); }} className="p-5 sm:p-6">
          {erro && <p role="alert" className="mb-4 rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700 dark:border-rose-900/60 dark:bg-rose-950/25 dark:text-rose-300">{erro}</p>}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {(aba === "usuarios" ? camposUsuario : camposEmpresa).map(([k, nome]) => <label key={k} className={`block text-sm ${["nome_completo", "razao_social"].includes(k) ? "sm:col-span-2" : ""}`}>
              <span className="mb-2 block text-xs font-semibold text-[#536B57] dark:text-[#C4D5C4]">{nome}</span>
              {opcoes[k] ? <select className={campo} value={form[k] ?? ""} onChange={(e) => setForm((f) => ({ ...f, [k]: e.target.value }))}>
                {!form[k] && <option value="">Selecione...</option>}
                {opcoes[k].map((v) => <option key={v} value={v}>{v}</option>)}
              </select> : <input className={campo} type={k.includes("email") ? "email" : "text"} value={form[k] ?? ""} onChange={(e) => setForm((f) => ({ ...f, [k]: e.target.value }))} required={["nome_completo", "nome_usuario", "razao_social"].includes(k)} />}
            </label>)}
          </div>
          <div className="mt-6 flex flex-col-reverse gap-2 border-t border-[#E4EAE1] pt-5 dark:border-[#34483A] sm:flex-row sm:justify-end">
            <button type="button" disabled={salvando} onClick={() => setEdicao(null)} className={botaoNeutro}>Cancelar</button>
            <button type="submit" disabled={salvando} className={botaoPrimario}>{salvando ? <RefreshCw size={17} className="animate-spin" /> : <Save size={17} />}{salvando ? "Salvando..." : "Salvar alterações"}</button>
          </div>
        </form>
      </Modal>}

      {exclusao && <Modal onClose={() => setExclusao(null)} maxWidth="max-w-md" disabled={salvando}>
        <div className="border-b border-rose-100 bg-rose-50/70 p-5 dark:border-rose-900/40 dark:bg-rose-950/20 sm:p-6">
          <div className="flex items-start justify-between gap-3"><div className="flex h-12 w-12 items-center justify-center rounded-xl bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300"><Trash2 size={23} /></div><Acao title="Fechar confirmação" onClick={() => setExclusao(null)} disabled={salvando}><X size={18} /></Acao></div>
          <h2 className="mt-4 text-lg font-bold text-rose-800 dark:text-rose-300 sm:text-xl">Excluir usuário permanentemente?</h2>
          <p className="mt-2 text-sm leading-6 text-rose-800/80 dark:text-rose-200/80">Esta ação é irreversível e exige confirmação.</p>
        </div>
        <div className="space-y-5 p-5 sm:p-6">
          {erro && <p role="alert" className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700 dark:border-rose-900/60 dark:bg-rose-950/25 dark:text-rose-300">{erro}</p>}
          <div className="rounded-xl border border-[#DAD7CD] bg-[#F8F9F6] p-4 dark:border-[#34483A] dark:bg-[#111A14]"><p className={`text-xs ${muted}`}>Usuário selecionado</p><p className="mt-1 break-words text-sm font-bold">{exclusao.nome_completo}</p><p className={`mt-1 break-all text-xs ${muted}`}>{exclusao.email}</p><div className="mt-3"><Status valor={exclusao.status_conta} /></div></div>
          <div className="flex items-start gap-2.5 rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs leading-5 text-amber-800 dark:border-amber-900/50 dark:bg-amber-900/15 dark:text-amber-200"><Info size={17} className="mt-0.5 shrink-0" /> A conta precisa estar desativada e não pode possuir vínculos ou histórico protegido. Se houver impedimentos, o servidor bloqueará a exclusão.</div>
          <label className="block text-sm"><span className="mb-2 block font-semibold">Digite <strong className="text-rose-700 dark:text-rose-300">EXCLUIR</strong> para confirmar</span><input autoComplete="off" spellCheck={false} className={campo} placeholder="EXCLUIR" value={confirmacao} onChange={(e) => setConfirmacao(e.target.value)} /></label>
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end"><button type="button" disabled={salvando} onClick={() => setExclusao(null)} className={botaoNeutro}>Voltar</button><button type="button" disabled={confirmacao !== "EXCLUIR" || salvando} onClick={() => executar(() => api(`/usuarios/${exclusao.id}`, { method: "DELETE", body: JSON.stringify({ confirmacao }) }))} className={botaoPerigo}>{salvando ? <RefreshCw size={16} className="animate-spin" /> : <Trash2 size={16} />}{salvando ? "Excluindo..." : "Excluir definitivamente"}</button></div>
        </div>
      </Modal>}
    </div>
  </div>;
}
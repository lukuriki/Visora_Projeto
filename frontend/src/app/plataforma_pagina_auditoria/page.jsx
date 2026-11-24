"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Activity,
  AlertTriangle,
  Bot,
  CalendarDays,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  Clock3,
  Eye,
  FileSearch,
  Filter,
  History,
  Loader2,
  RefreshCw,
  Search,
  ShieldCheck,
  Sparkles,
  Tags,
  X,
} from "lucide-react";

import SidebarPlataforma from "@/components/SidebarPlataforma";
import FooterPlataforma from "@/components/FooterPlataforma";
import AuditoriaChatWidget from "@/components/AuditoriaChatWidget";

import {
  buscarAuditoria,
  buscarResumoAuditoria,
  buscarHistoricoAuditoria,
  executarAuditoria,
  atualizarStatusAuditoria,
  buscarEmpresaContabil,
} from "@/lib/api";




const TIPOS = {
  duplicidade: "Possível duplicidade",
  valor_incomum: "Valor incomum",
  classificacao_incorreta: "Classificação inconsistente",
  divergencia: "Divergência",
  alteracao_suspeita: "Alteração suspeita",
  outro: "Outra inconsistência",
};

const STATUS = {
  pendente: "Pendente",
  em_analise: "Em análise",
  resolvido: "Resolvido",
  ignorado: "Ignorado",
};

const GRAVIDADES = {
  baixa: "Baixa",
  media: "Média",
  alta: "Alta",
  critica: "Crítica",
};

const card =
  "rounded-2xl border border-[#DAD7CD] bg-white shadow-sm " +
  "dark:border-[#34483A] dark:bg-[#1C2920]";

const botao =
  "inline-flex items-center justify-center gap-2 rounded-xl " +
  "bg-[#588157] px-4 py-2.5 text-sm font-semibold text-white " +
  "transition hover:bg-[#3A5A40] disabled:cursor-not-allowed " +
  "disabled:opacity-50";

const botaoSecundario =
  "inline-flex items-center justify-center gap-2 rounded-xl " +
  "border border-[#DAD7CD] bg-white px-4 py-2.5 " +
  "text-sm font-medium text-[#344E41] transition " +
  "hover:bg-[#EDF2EA] disabled:opacity-50 " +
  "dark:border-[#34483A] dark:bg-[#273B31] " +
  "dark:text-[#E5EDE5] dark:hover:bg-[#34483A]";

const campo =
  "w-full rounded-xl border border-[#DAD7CD] bg-white " +
  "px-3 py-2.5 text-sm text-[#273B31] outline-none " +
  "focus:border-[#588157] dark:border-[#34483A] " +
  "dark:bg-[#1C2920] dark:text-[#E5EDE5]";

function dataFormatada(valor) {
  if (!valor) return "Não informado";

  const data = new Date(valor);

  if (Number.isNaN(data.getTime())) {
    return "Data inválida";
  }

  return data.toLocaleString("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  });
}

function numero(valor) {
  return Number(valor || 0).toLocaleString("pt-BR");
}

function corGravidade(gravidade) {
  if (gravidade === "critica") {
    return "border-red-300 bg-red-100 text-red-800 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300";
  }

  if (gravidade === "alta") {
    return "border-orange-300 bg-orange-100 text-orange-800 dark:border-orange-900 dark:bg-orange-950/40 dark:text-orange-300";
  }

  if (gravidade === "media") {
    return "border-amber-300 bg-amber-100 text-amber-800 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-300";
  }

  return "border-[#DAD7CD] bg-[#EDF2EA] text-[#3A5A40] dark:border-[#455C48] dark:bg-[#273B31] dark:text-[#B9CDAE]";
}

function corStatus(status) {
  if (status === "resolvido") {
    return "bg-[#E0EBDD] text-[#344E41] dark:bg-[#344E41] dark:text-[#D6E8CD]";
  }

  if (status === "em_analise") {
    return "bg-blue-100 text-blue-800 dark:bg-blue-950/40 dark:text-blue-300";
  }

  if (status === "ignorado") {
    return "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300";
  }

  return "bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300";
}

function Etiqueta({ children, className = "" }) {
  return (
    <span
      className={
        "inline-flex items-center rounded-lg px-2.5 py-1 " +
        "text-xs font-semibold " +
        className
      }
    >
      {children}
    </span>
  );
}

function obterToken() {
  if (typeof window === "undefined") {
    return "";
  }

  return (
    sessionStorage.getItem("visora-token") ||
    localStorage.getItem("visora-token") ||
    ""
  );
}

function extrairEmpresaId(resposta) {

  const candidatos = [
    resposta?.empresa?.id,
    resposta?.empresa?.empresa_id,
    resposta?.dados?.empresa?.id,
    resposta?.dados?.empresa?.empresa_id,
    resposta?.dados?.id,
    resposta?.dados?.empresa_id,
    resposta?.id,
    resposta?.empresa_id,
  ];

  for (const candidato of candidatos) {
    const id = Number(candidato);

    if (Number.isSafeInteger(id) && id > 0) {
      return id;
    }
  }

  return null;
}



export default function Page() {

  const [collapsed, setCollapsed] = useState(false);
  const [sidebarSincronizada, setSidebarSincronizada] = useState(false);
  const [animarMargemAoClicar, setAnimarMargemAoClicar] = useState(false);

  useEffect(() => {
    const ativarAnimacao = () => setAnimarMargemAoClicar(true);
    window.addEventListener("visora-sidebar-alterada", ativarAnimacao);
    return () => window.removeEventListener("visora-sidebar-alterada", ativarAnimacao);
  }, []);

  useEffect(() => {
    const sincronizarSidebar = () => {
      const atual = localStorage.getItem("visora-sidebar-collapsed");
      const antigo = localStorage.getItem("visora-sidebar-recolhida");
      const valor = atual !== null ? atual : antigo;
      setCollapsed(window.innerWidth < 768 ? true : valor !== null ? valor === "true" : false);
      setSidebarSincronizada(true);
    };

    sincronizarSidebar();
    window.addEventListener("storage", sincronizarSidebar);
    window.addEventListener("visora-sidebar-alterada", sincronizarSidebar);
    window.addEventListener("visora-sidebar-change", sincronizarSidebar);
    return () => {
      window.removeEventListener("storage", sincronizarSidebar);
      window.removeEventListener("visora-sidebar-alterada", sincronizarSidebar);
      window.removeEventListener("visora-sidebar-change", sincronizarSidebar);
    };
  }, []);

  const alterarSidebar = useCallback((valor) => {
    setCollapsed((anterior) => {
      const proximo = typeof valor === "function" ? valor(anterior) : valor;
      if (typeof window !== "undefined" && window.innerWidth >= 768) {
        localStorage.setItem("visora-sidebar-collapsed", String(proximo));
        localStorage.setItem("visora-sidebar-recolhida", String(proximo));
      }
      return proximo;
    });
  }, []);


  const [token, setToken] = useState("");
  const [empresaId, setEmpresaId] = useState(null);

  const [carregandoInicial, setCarregandoInicial] =
    useState(true);

  const [carregandoDados, setCarregandoDados] =
    useState(false);

  const [executando, setExecutando] = useState(false);
  const [salvando, setSalvando] = useState(false);

  const [erro, setErro] = useState("");
  const [aviso, setAviso] = useState("");

  const [apontamentos, setApontamentos] = useState([]);
  const [historico, setHistorico] = useState([]);

  const [resumo, setResumo] = useState({
    total: 0,
    pendentes: 0,
    emAnalise: 0,
    resolvidos: 0,
    ignorados: 0,
    alertasImportantes: 0,
  });

  const [paginacao, setPaginacao] = useState({
    pagina: 1,
    limite: 20,
    total: 0,
    totalPaginas: 0,
  });

  const [busca, setBusca] = useState("");
  const [filtroTipo, setFiltroTipo] = useState("");
  const [filtroStatus, setFiltroStatus] = useState("");
  const [filtroGravidade, setFiltroGravidade] =
    useState("");

  const [pagina, setPagina] = useState(1);

  const [selecionado, setSelecionado] = useState(null);
  const [chatAberto, setChatAberto] = useState(false);
  const [apontamentoChat, setApontamentoChat] = useState(null);
  const [novoStatus, setNovoStatus] = useState("");
  const [observacao, setObservacao] = useState("");

  const [mostrarHistorico, setMostrarHistorico] =
    useState(false);

  
  

  useEffect(() => {
    let ativo = true;

    async function inicializar() {
      setCarregandoInicial(true);
      setErro("");

      try {
        const tokenAtual = obterToken();

        if (!tokenAtual) {
          throw new Error(
            "Sessão não encontrada. Faça login novamente."
          );
        }

        const respostaEmpresa =
          await buscarEmpresaContabil(tokenAtual);

        const id = extrairEmpresaId(respostaEmpresa);

        if (!id) {
          throw new Error(
            "Não foi possível identificar a empresa. " +
            "Verifique o formato retornado por " +
            "buscarEmpresaContabil()."
          );
        }

        if (!ativo) return;

        setToken(tokenAtual);
        setEmpresaId(id);
      } catch (error) {
        if (ativo) {
          setErro(error.message);
        }
      } finally {
        if (ativo) {
          setCarregandoInicial(false);
        }
      }
    }

    inicializar();

    return () => {
      ativo = false;
    };
  }, []);

  

  const carregarDados = useCallback(
    async (mostrarCarregamento = true) => {
      if (!token || !empresaId) return;

      if (mostrarCarregamento) {
        setCarregandoDados(true);
      }

      setErro("");

      try {
        const filtros = {
          pagina,
          limite: 20,
          ...(filtroTipo
            ? { tipo: filtroTipo }
            : {}),
          ...(filtroStatus
            ? { status: filtroStatus }
            : {}),
          ...(filtroGravidade
            ? { gravidade: filtroGravidade }
            : {}),
        };

        const [
          respostaLista,
          respostaResumo,
          respostaHistorico,
        ] = await Promise.all([
          buscarAuditoria(empresaId, token, filtros),
          buscarResumoAuditoria(empresaId, token),
          buscarHistoricoAuditoria(empresaId, token),
        ]);

        setApontamentos(
          Array.isArray(respostaLista?.apontamentos)
            ? respostaLista.apontamentos
            : []
        );

        setPaginacao(
          respostaLista?.paginacao || {
            pagina: 1,
            limite: 20,
            total: 0,
            totalPaginas: 0,
          }
        );

        setResumo(
          respostaResumo?.resumo || {
            total: 0,
            pendentes: 0,
            emAnalise: 0,
            resolvidos: 0,
            ignorados: 0,
            alertasImportantes: 0,
          }
        );

        setHistorico(
          Array.isArray(respostaHistorico?.execucoes)
            ? respostaHistorico.execucoes
            : []
        );
      } catch (error) {
        setErro(
          error.message ||
          "Não foi possível carregar a auditoria."
        );
      } finally {
        if (mostrarCarregamento) {
          setCarregandoDados(false);
        }
      }
    },
    [
      token,
      empresaId,
      pagina,
      filtroTipo,
      filtroStatus,
      filtroGravidade,
    ]
  );

  useEffect(() => {
    carregarDados();
  }, [carregarDados]);


  async function iniciarAuditoria() {
    if (!empresaId || !token || executando) return;

    setExecutando(true);
    setErro("");
    setAviso("");

    try {
      const resultado = await executarAuditoria(
        empresaId,
        token
      );

      setAviso(
        `Auditoria concluída. ` +
        `${numero(resultado.totalAnalisadas)} movimentações analisadas e ` +
        `${numero(resultado.novosApontamentos)} novos apontamentos.`
      );

      await carregarDados(false);
    } catch (error) {
      setErro(
        error.message ||
        "Não foi possível executar a auditoria."
      );
    } finally {
      setExecutando(false);
    }
  }

  

  function abrirDetalhes(item) {
    setSelecionado(item);
    setNovoStatus(item.status);
    setObservacao(
      item.observacao_resolucao || ""
    );
    setErro("");
  }

  function perguntarAoVion() {
    if (!selecionado) return;
    setApontamentoChat(selecionado);
    setSelecionado(null);
    setChatAberto(true);
  }

  function fecharDetalhes() {
    if (salvando) return;

    setSelecionado(null);
    setObservacao("");
  }

  async function salvarStatus() {
    if (!selecionado || salvando) return;

    if (novoStatus === selecionado.status) {
      fecharDetalhes();
      return;
    }

    if (
      ["resolvido", "ignorado"].includes(novoStatus) &&
      !observacao.trim()
    ) {
      setErro(
        "Informe uma justificativa para finalizar o apontamento."
      );
      return;
    }

    setSalvando(true);
    setErro("");
    setAviso("");

    try {
      await atualizarStatusAuditoria(
        empresaId,
        selecionado.id,
        novoStatus,
        observacao,
        token
      );

      setSelecionado(null);
      setObservacao("");

      setAviso(
        "Status do apontamento atualizado com sucesso."
      );

      await carregarDados(false);
    } catch (error) {
      setErro(
        error.message ||
        "Não foi possível atualizar o status."
      );
    } finally {
      setSalvando(false);
    }
  }

  

  function alterarTipo(tipo) {
    setFiltroTipo((atual) =>
      atual === tipo ? "" : tipo
    );
    setPagina(1);
  }

  function limparFiltros() {
    setBusca("");
    setFiltroTipo("");
    setFiltroStatus("");
    setFiltroGravidade("");
    setPagina(1);
  }

  const apontamentosFiltrados = useMemo(() => {
    const termo = busca.trim().toLowerCase();

    if (!termo) return apontamentos;

    return apontamentos.filter((item) => {
      const conteudo = [
        item.id,
        item.movimentacao_id,
        item.titulo,
        item.descricao,
        item.tipo,
        TIPOS[item.tipo],
      ]
        .filter((valor) => valor != null)
        .join(" ")
        .toLowerCase();

      return conteudo.includes(termo);
    });
  }, [apontamentos, busca]);

  const finalizado = selecionado
    ? ["resolvido", "ignorado"].includes(
        selecionado.status
      )
    : false;

  const indicadores = [
    {
      titulo: "Total de apontamentos",
      valor: resumo.total,
      descricao: "Inconsistências registradas",
      icone: ClipboardList,
      tipo: "",
    },
    {
      titulo: "Pendentes",
      valor: resumo.pendentes,
      descricao: "Aguardando verificação",
      icone: Clock3,
      tipo: "pendente",
    },
    {
      titulo: "Em análise",
      valor: resumo.emAnalise,
      descricao: "Em processo de revisão",
      icone: Activity,
      tipo: "em_analise",
    },
    {
      titulo: "Alertas importantes",
      valor: resumo.alertasImportantes,
      descricao: "Alta ou crítica, ainda em aberto",
      icone: AlertTriangle,
      tipo: "alertas",
    },
    {
      titulo: "Resolvidos",
      valor: resumo.resolvidos,
      descricao: "Apontamentos finalizados",
      icone: CheckCircle2,
      tipo: "resolvido",
    },
  ];

  function clicarIndicador(tipo) {
    setFiltroTipo("");
    setPagina(1);

    if (tipo === "alertas") {
      setFiltroStatus("");
      setFiltroGravidade("alta");
      return;
    }

    setFiltroGravidade("");
    setFiltroStatus(tipo);
  }


  return (
    <>
      <SidebarPlataforma
        collapsed={collapsed}
        setCollapsed={alterarSidebar}
      />

      <main
        style={{ visibility: sidebarSincronizada ? "visible" : "hidden" }}
        className={`
          relative isolate min-h-screen min-w-0
          overflow-x-clip
          bg-[#F8F9F6] text-[#273B31]
          ${animarMargemAoClicar ? "transition-[margin] duration-300" : "transition-none"}
          dark:bg-[#111A14] dark:text-[#E5EDE5]
          ml-[70px] w-[calc(100%-70px)]
          ${
            collapsed
              ? "md:ml-[82px] md:w-[calc(100%-82px)]"
              : "md:ml-[270px] md:w-[calc(100%-270px)]"
          }
        `}
      >
        {/* FUNDO */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
        >
          <div className="absolute inset-0 bg-[linear-gradient(135deg,#F8F9F6_0%,#EFF4EB_48%,#F8F9F6_100%)] dark:bg-[linear-gradient(135deg,#111A14_0%,#17271B_52%,#111A14_100%)]" />

          <div
            className="absolute inset-0 opacity-[0.12] dark:opacity-[0.06]"
            style={{
              backgroundImage:
                "linear-gradient(to right, #7E9971 1px, transparent 1px), linear-gradient(to bottom, #7E9971 1px, transparent 1px)",
              backgroundSize: "52px 52px",
              maskImage:
                "linear-gradient(to bottom, black, transparent 85%)",
            }}
          />

          <div className="absolute -right-40 -top-32 h-[500px] w-[500px] rounded-full bg-[#A3B18A]/30 blur-[110px] dark:bg-[#588157]/15" />
        </div>

        {/* CABEÇALHO */}
        <header className="border-b border-[#DAD7CD] bg-white/90 px-4 py-7 dark:border-[#34483A] dark:bg-[#1C2920]/90 sm:px-6 lg:px-8">
          <div className="flex flex-col justify-between gap-5 xl:flex-row xl:items-end">
            <div>
              <div className="mb-3 flex items-center gap-2 text-sm font-medium text-[#588157] dark:text-[#A3B18A]">
                <span>Plataforma</span>
                <ChevronRight size={15} />
                <span>Auditoria</span>
              </div>

              <h1 className="text-2xl font-bold tracking-tight sm:text-3xl lg:text-4xl">
                Auditoria de{" "}
                <span className="text-[#588157] dark:text-[#A3B18A]">
                  Registros
                </span>
              </h1>

              <p className="mt-3 max-w-2xl text-sm leading-relaxed text-[#6A7C70] dark:text-[#A3B18A]">
                Identifique possíveis inconsistências
                financeiras, acompanhe apontamentos e
                revise os resultados das análises com IA.
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                onClick={() =>
                  setMostrarHistorico((atual) => !atual)
                }
                className={botaoSecundario}
              >
                <History size={17} />
                Histórico
              </button>

              <button
                onClick={() => carregarDados()}
                disabled={
                  carregandoDados ||
                  carregandoInicial ||
                  !empresaId
                }
                className={botaoSecundario}
              >
                <RefreshCw
                  size={17}
                  className={
                    carregandoDados ? "animate-spin" : ""
                  }
                />
                Atualizar
              </button>

              <button
                onClick={iniciarAuditoria}
                disabled={
                  executando ||
                  carregandoInicial ||
                  !empresaId
                }
                className={botao}
              >
                {executando ? (
                  <Loader2
                    size={17}
                    className="animate-spin"
                  />
                ) : (
                  <Sparkles size={17} />
                )}

                {executando
                  ? "Analisando..."
                  : "Executar auditoria"}
              </button>
            </div>
          </div>
        </header>

        <div className="space-y-6 px-3 py-6 sm:px-5 lg:px-6">
          {/* MENSAGENS */}
          {erro && (
            <div
              role="alert"
              className="flex items-start justify-between gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800 dark:border-red-900 dark:bg-red-950/30 dark:text-red-300"
            >
              <div className="flex items-start gap-2">
                <AlertTriangle
                  size={18}
                  className="mt-0.5 shrink-0"
                />
                <span>{erro}</span>
              </div>

              <button
                onClick={() => setErro("")}
                aria-label="Fechar erro"
              >
                <X size={17} />
              </button>
            </div>
          )}

          {aviso && (
            <div
              role="status"
              className="flex items-start justify-between gap-3 rounded-xl border border-[#A3B18A] bg-[#EDF2EA] p-4 text-sm text-[#344E41] dark:border-[#455C48] dark:bg-[#273B31] dark:text-[#D6E8CD]"
            >
              <div className="flex items-start gap-2">
                <CheckCircle2
                  size={18}
                  className="mt-0.5 shrink-0"
                />
                <span>{aviso}</span>
              </div>

              <button
                onClick={() => setAviso("")}
                aria-label="Fechar aviso"
              >
                <X size={17} />
              </button>
            </div>
          )}

          {/* EXECUÇÃO */}
          {executando && (
            <div className={`${card} p-5`}>
              <div className="flex items-start gap-3">
                <Loader2
                  size={22}
                  className="shrink-0 animate-spin text-[#588157]"
                />

                <div>
                  <h2 className="font-semibold">
                    Auditoria em andamento
                  </h2>

                  <p className="mt-1 text-sm text-[#6A7C70] dark:text-[#A3B18A]">
                    O backend está analisando os registros
                    financeiros com Gemini. Aguarde a
                    conclusão antes de iniciar outra análise.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* INDICADORES */}
          <section>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-bold">
                Visão geral
              </h2>

              {carregandoDados && (
                <span className="flex items-center gap-2 text-xs text-[#6A7C70]">
                  <Loader2
                    size={14}
                    className="animate-spin"
                  />
                  Atualizando
                </span>
              )}
            </div>

            <div
              className="grid gap-4"
              style={{
                gridTemplateColumns:
                  "repeat(auto-fit, minmax(min(100%, 210px), 1fr))",
              }}
            >
              {indicadores.map((item) => {
                const Icone = item.icone;

                return (
                  <button
                    key={item.titulo}
                    onClick={() =>
                      clicarIndicador(item.tipo)
                    }
                    className={`${card} p-5 text-left transition hover:-translate-y-1 hover:border-[#588157] hover:shadow-lg`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#EDF2EA] text-[#588157] dark:bg-[#273B31] dark:text-[#A3B18A]">
                        <Icone size={22} />
                      </div>

                      <ChevronRight
                        size={17}
                        className="text-[#A3B18A]"
                      />
                    </div>

                    <p className="mt-4 text-sm font-medium text-[#6A7C70] dark:text-[#A3B18A]">
                      {item.titulo}
                    </p>

                    <p className="mt-1 text-3xl font-bold">
                      {carregandoInicial
                        ? "..."
                        : numero(item.valor)}
                    </p>

                    <p className="mt-2 text-xs text-[#859488] dark:text-[#91A696]">
                      {item.descricao}
                    </p>
                  </button>
                );
              })}
            </div>
          </section>

          {/* HISTÓRICO */}
          {mostrarHistorico && (
            <section className={`${card} overflow-hidden`}>
              <div className="flex items-center justify-between border-b border-[#DAD7CD] p-5 dark:border-[#34483A]">
                <div>
                  <h2 className="flex items-center gap-2 font-bold">
                    <History
                      size={19}
                      className="text-[#588157]"
                    />
                    Histórico de auditorias
                  </h2>

                  <p className="mt-1 text-xs text-[#6A7C70] dark:text-[#A3B18A]">
                    Últimas 30 execuções registradas.
                  </p>
                </div>

                <button
                  onClick={() => setMostrarHistorico(false)}
                  aria-label="Fechar histórico"
                >
                  <X size={19} />
                </button>
              </div>

              {historico.length === 0 ? (
                <p className="p-6 text-sm text-[#6A7C70] dark:text-[#A3B18A]">
                  Nenhuma execução registrada.
                </p>
              ) : (
                <div className="divide-y divide-[#DAD7CD] dark:divide-[#34483A]">
                  {historico.map((item) => (
                    <div
                      key={item.id}
                      className="flex flex-col justify-between gap-3 p-4 sm:flex-row sm:items-center"
                    >
                      <div>
                        <p className="font-semibold">
                          Auditoria #{item.id}
                        </p>

                        <p className="mt-1 text-xs text-[#6A7C70] dark:text-[#A3B18A]">
                          {dataFormatada(
                            item.iniciada_em ||
                              item.criado_em
                          )}
                        </p>

                        <p className="mt-1 text-xs text-[#6A7C70] dark:text-[#A3B18A]">
                          {numero(item.total_analisadas)}{" "}
                          movimentações analisadas ·{" "}
                          {numero(item.total_apontamentos)}{" "}
                          novos apontamentos
                        </p>

                        {item.erro_resumo && (
                          <p className="mt-1 text-xs text-red-600">
                            {item.erro_resumo}
                          </p>
                        )}
                      </div>

                      <Etiqueta
                        className={
                          "self-start sm:self-auto " +
                          (item.status === "concluida"
                            ? corStatus("resolvido")
                            : item.status === "erro"
                            ? "bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-300"
                            : corStatus("em_analise"))
                        }
                      >
                        {item.status === "concluida"
                          ? "Concluída"
                          : item.status === "executando"
                          ? "Executando"
                          : item.status === "pendente"
                          ? "Pendente"
                          : "Erro"}
                      </Etiqueta>
                    </div>
                  ))}
                </div>
              )}
            </section>
          )}

          {/* TABELA / LISTA */}
          <section>
            <div className="mb-4 flex flex-col justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold">
                  Problemas identificados
                </h2>

                <p className="mt-1 text-sm text-[#6A7C70] dark:text-[#A3B18A]">
                  Apontamentos reais identificados pelas
                  análises financeiras.
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                <div className="relative">
                  <Search
                    size={17}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-[#859488]"
                  />

                  <input
                    value={busca}
                    onChange={(e) =>
                      setBusca(e.target.value)
                    }
                    placeholder="Buscar nesta página..."
                    className={`${campo} pl-10`}
                  />
                </div>

                <select
                  value={filtroTipo}
                  onChange={(e) => {
                    setFiltroTipo(e.target.value);
                    setPagina(1);
                  }}
                  className={campo}
                >
                  <option value="">Todos os tipos</option>

                  {Object.entries(TIPOS).map(
                    ([valor, nome]) => (
                      <option
                        key={valor}
                        value={valor}
                      >
                        {nome}
                      </option>
                    )
                  )}
                </select>

                <select
                  value={filtroStatus}
                  onChange={(e) => {
                    setFiltroStatus(e.target.value);
                    setPagina(1);
                  }}
                  className={campo}
                >
                  <option value="">Todos os status</option>

                  {Object.entries(STATUS).map(
                    ([valor, nome]) => (
                      <option
                        key={valor}
                        value={valor}
                      >
                        {nome}
                      </option>
                    )
                  )}
                </select>

                <select
                  value={filtroGravidade}
                  onChange={(e) => {
                    setFiltroGravidade(e.target.value);
                    setPagina(1);
                  }}
                  className={campo}
                >
                  <option value="">
                    Todas as gravidades
                  </option>

                  {Object.entries(GRAVIDADES).map(
                    ([valor, nome]) => (
                      <option
                        key={valor}
                        value={valor}
                      >
                        {nome}
                      </option>
                    )
                  )}
                </select>
              </div>

              <div className="flex items-center justify-between gap-3">
                <span className="flex items-center gap-2 text-xs text-[#6A7C70] dark:text-[#A3B18A]">
                  <Filter size={14} />
                  Filtros aplicados à auditoria
                </span>

                <button
                  onClick={limparFiltros}
                  className="text-xs font-semibold text-[#588157] hover:underline dark:text-[#A3B18A]"
                >
                  Limpar filtros
                </button>
              </div>
            </div>

            <div className={`${card} overflow-hidden`}>
              {/* CARREGANDO */}
              {carregandoDados && (
                <div className="px-5 py-12 text-center">
                  <Loader2
                    size={25}
                    className="mx-auto animate-spin text-[#588157]"
                  />

                  <p className="mt-3 text-sm text-[#6A7C70]">
                    Carregando apontamentos...
                  </p>
                </div>
              )}

              {/* VAZIO */}
              {!carregandoDados &&
                apontamentosFiltrados.length === 0 && (
                  <div className="px-5 py-14 text-center">
                    <FileSearch
                      size={36}
                      className="mx-auto mb-3 text-[#A3B18A]"
                    />

                    <p className="font-semibold">
                      Nenhum apontamento encontrado
                    </p>

                    <p className="mx-auto mt-2 max-w-sm text-sm text-[#6A7C70] dark:text-[#A3B18A]">
                      Execute uma auditoria ou ajuste os
                      filtros para consultar outros
                      registros.
                    </p>
                  </div>
                )}

              {/* LISTA (MOBILE / TABLET) */}
              {!carregandoDados &&
                apontamentosFiltrados.length > 0 && (
                  <ul className="divide-y divide-[#E5E9E1] dark:divide-[#34483A] lg:hidden">
                    {apontamentosFiltrados.map((item) => (
                      <li
                        key={item.id}
                        className="space-y-3 p-4"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className="break-words font-semibold leading-snug">
                              {item.titulo}
                            </p>

                            <p className="mt-1 text-xs text-[#6A7C70] dark:text-[#A3B18A]">
                              {TIPOS[item.tipo] ||
                                item.tipo}
                            </p>
                          </div>

                          <span className="shrink-0 rounded-lg bg-[#EDF2EA] px-2.5 py-1 font-mono text-xs dark:bg-[#273B31]">
                            #{item.id}
                          </span>
                        </div>

                        {item.descricao && (
                          <p className="line-clamp-3 break-words text-xs leading-relaxed text-[#859488] dark:text-[#91A696]">
                            {item.descricao}
                          </p>
                        )}

                        <div className="flex flex-wrap items-center gap-2">
                          <Etiqueta
                            className={`border ${corGravidade(
                              item.gravidade
                            )}`}
                          >
                            {GRAVIDADES[
                              item.gravidade
                            ] || item.gravidade}
                          </Etiqueta>

                          <Etiqueta
                            className={corStatus(
                              item.status
                            )}
                          >
                            {STATUS[item.status] ||
                              item.status}
                          </Etiqueta>
                        </div>

                        <div className="flex items-center justify-between gap-3">
                          <span className="flex items-center gap-1.5 text-xs text-[#6A7C70] dark:text-[#A3B18A]">
                            <CalendarDays size={14} />
                            {dataFormatada(
                              item.criado_em
                            )}
                          </span>

                          <button
                            onClick={() =>
                              abrirDetalhes(item)
                            }
                            className={`${botaoSecundario} !px-3 !py-2`}
                          >
                            <Eye size={15} />
                            Detalhes
                          </button>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}

              {/* TABELA (DESKTOP) */}
              {!carregandoDados &&
                apontamentosFiltrados.length > 0 && (
                  <div className="hidden w-full overflow-x-auto lg:block">
                    <table className="w-full min-w-[850px] text-left text-sm">
                      <thead className="border-b border-[#DAD7CD] bg-[#F2F2F2] text-xs uppercase text-[#6A7C70] dark:border-[#34483A] dark:bg-[#18251C] dark:text-[#A3B18A]">
                        <tr>
                          <th className="px-5 py-4">
                            Ocorrência
                          </th>
                          <th className="px-5 py-4">
                            Registro
                          </th>
                          <th className="px-5 py-4">
                            Gravidade
                          </th>
                          <th className="px-5 py-4">
                            Status
                          </th>
                          <th className="px-5 py-4">
                            Identificado em
                          </th>
                          <th className="px-5 py-4 text-right">
                            Ação
                          </th>
                        </tr>
                      </thead>

                      <tbody className="divide-y divide-[#E5E9E1] dark:divide-[#34483A]">
                        {apontamentosFiltrados.map(
                          (item) => (
                            <tr
                              key={item.id}
                              className="transition hover:bg-[#EDF2EA] dark:hover:bg-[#273B31]"
                            >
                              <td className="max-w-[330px] px-5 py-4">
                                <p className="font-semibold">
                                  {item.titulo}
                                </p>

                                <p className="mt-1 text-xs text-[#6A7C70] dark:text-[#A3B18A]">
                                  {TIPOS[item.tipo] ||
                                    item.tipo}
                                </p>

                                <p className="mt-1 line-clamp-2 text-xs text-[#859488] dark:text-[#91A696]">
                                  {item.descricao}
                                </p>
                              </td>

                              <td className="px-5 py-4">
                                <span className="rounded-lg bg-[#EDF2EA] px-2.5 py-1 font-mono text-xs dark:bg-[#273B31]">
                                  #{item.id}
                                </span>
                              </td>

                              <td className="px-5 py-4">
                                <Etiqueta
                                  className={`border ${corGravidade(
                                    item.gravidade
                                  )}`}
                                >
                                  {GRAVIDADES[
                                    item.gravidade
                                  ] || item.gravidade}
                                </Etiqueta>
                              </td>

                              <td className="px-5 py-4">
                                <Etiqueta
                                  className={corStatus(
                                    item.status
                                  )}
                                >
                                  {STATUS[item.status] ||
                                    item.status}
                                </Etiqueta>
                              </td>

                              <td className="whitespace-nowrap px-5 py-4 text-xs text-[#6A7C70] dark:text-[#A3B18A]">
                                {dataFormatada(
                                  item.criado_em
                                )}
                              </td>

                              <td className="px-5 py-4 text-right">
                                <button
                                  onClick={() =>
                                    abrirDetalhes(item)
                                  }
                                  className={botaoSecundario}
                                >
                                  <Eye size={15} />
                                  Detalhes
                                </button>
                              </td>
                            </tr>
                          )
                        )}
                      </tbody>
                    </table>
                  </div>
                )}

              {/* PAGINAÇÃO */}
              <div className="flex flex-col justify-between gap-3 border-t border-[#DAD7CD] bg-[#F2F2F2]/60 px-5 py-4 dark:border-[#34483A] dark:bg-[#18251C]/70 sm:flex-row sm:items-center">
                <p className="text-xs text-[#6A7C70] dark:text-[#A3B18A]">
                  {numero(
                    apontamentosFiltrados.length
                  )}{" "}
                  exibidos nesta página ·{" "}
                  {numero(paginacao.total)}{" "}
                  registros com os filtros selecionados
                </p>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() =>
                      setPagina((atual) =>
                        Math.max(1, atual - 1)
                      )
                    }
                    disabled={
                      pagina <= 1 ||
                      carregandoDados
                    }
                    className={botaoSecundario}
                    aria-label="Página anterior"
                  >
                    <ChevronLeft size={17} />
                  </button>

                  <span className="text-xs font-medium">
                    {pagina} de{" "}
                    {Math.max(
                      1,
                      paginacao.totalPaginas
                    )}
                  </span>

                  <button
                    onClick={() =>
                      setPagina((atual) =>
                        atual + 1
                      )
                    }
                    disabled={
                      pagina >=
                        paginacao.totalPaginas ||
                      carregandoDados
                    }
                    className={botaoSecundario}
                    aria-label="Próxima página"
                  >
                    <ChevronRight size={17} />
                  </button>
                </div>
              </div>
            </div>
          </section>

          {/* INFORMAÇÕES */}
          <div className={`${card} p-5`}>
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#EDF2EA] text-[#588157] dark:bg-[#273B31]">
                <ShieldCheck size={20} />
              </div>

              <div>
                <h3 className="font-semibold">
                  Sobre a auditoria inteligente
                </h3>

                <p className="mt-1 text-sm leading-relaxed text-[#6A7C70] dark:text-[#A3B18A]">
                  A Visora utiliza inteligência artificial
                  para sinalizar possíveis inconsistências
                  financeiras. Os apontamentos são
                  sugestões de investigação e precisam
                  ser verificados antes de qualquer
                  decisão. A análise atual considera um
                  conjunto limitado de registros recentes.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* MODAL DE DETALHES */}
        {selecionado && (
          <div
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-3 backdrop-blur-sm"
            onMouseDown={(e) => {
              if (e.target === e.currentTarget) {
                fecharDetalhes();
              }
            }}
          >
            <div
              role="dialog"
              aria-modal="true"
              aria-labelledby="titulo-apontamento"
              className="flex max-h-[95dvh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-[#DAD7CD] bg-white shadow-2xl dark:border-[#34483A] dark:bg-[#1C2920]"
            >
              {/* CABEÇALHO DO MODAL */}
              <div className="flex items-start justify-between gap-3 border-b border-[#DAD7CD] p-5 dark:border-[#34483A]">
                <div className="min-w-0">
                  <p className="text-xs font-semibold uppercase tracking-wider text-[#588157]">
                    Apontamento #{selecionado.id}
                  </p>

                  <h2
                    id="titulo-apontamento"
                    className="mt-2 break-words text-xl font-bold"
                  >
                    {selecionado.titulo}
                  </h2>

                  <p className="mt-1 text-sm text-[#6A7C70] dark:text-[#A3B18A]">
                    {TIPOS[selecionado.tipo] ||
                      selecionado.tipo}
                  </p>
                </div>

                <button
                  onClick={fecharDetalhes}
                  disabled={salvando}
                  aria-label="Fechar detalhes"
                  className="shrink-0 rounded-lg p-2 hover:bg-[#EDF2EA] dark:hover:bg-[#273B31]"
                >
                  <X size={20} />
                </button>
              </div>

              {/* CONTEÚDO */}
              <div className="min-h-0 flex-1 space-y-5 overflow-y-auto p-5">
                <div className="flex flex-wrap gap-2">
                  <Etiqueta
                    className={`border ${corGravidade(
                      selecionado.gravidade
                    )}`}
                  >
                    Gravidade:{" "}
                    {GRAVIDADES[
                      selecionado.gravidade
                    ]}
                  </Etiqueta>

                  <Etiqueta
                    className={corStatus(
                      selecionado.status
                    )}
                  >
                    {STATUS[selecionado.status]}
                  </Etiqueta>

                  <Etiqueta className="bg-[#EDF2EA] text-[#3A5A40] dark:bg-[#273B31] dark:text-[#A3B18A]">
                    {selecionado.origem === "ia"
                      ? "Inteligência artificial"
                      : "Regra de auditoria"}
                  </Etiqueta>
                </div>

                <div>
                  <h3 className="text-xs font-semibold uppercase tracking-wide text-[#859488]">
                    Descrição da inconsistência
                  </h3>

                  <p className="mt-2 whitespace-pre-line break-words text-sm leading-relaxed">
                    {selecionado.descricao}
                  </p>
                </div>

                <div className="rounded-xl border border-[#A3B18A] bg-[#EDF2EA] p-4 dark:border-[#455C48] dark:bg-[#273B31]">
                  <div className="flex items-center gap-2 font-semibold text-[#3A5A40] dark:text-[#A3B18A]">
                    <Bot size={19} />
                    Recomendação da auditoria
                  </div>

                  <p className="mt-2 whitespace-pre-line break-words text-sm leading-relaxed text-[#53665A] dark:text-[#D6E8CD]">
                    {selecionado.recomendacao ||
                      "Nenhuma recomendação específica foi registrada."}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={perguntarAoVion}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#588157] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#3A5A40] sm:w-auto"
                >
                  <Bot size={18} />
                  Perguntar ao Vion sobre este apontamento
                </button>

                <div className="grid gap-4 rounded-xl border border-[#DAD7CD] p-4 text-sm dark:border-[#34483A] sm:grid-cols-2">
                  <div>
                    <p className="text-xs text-[#859488]">
                      Movimentação vinculada
                    </p>

                    <p className="mt-1 font-semibold">
                      {selecionado.movimentacao_id
                        ? `#${selecionado.movimentacao_id}`
                        : "Não vinculada"}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-[#859488]">
                      Execução da auditoria
                    </p>

                    <p className="mt-1 font-semibold">
                      {selecionado.execucao_id
                        ? `#${selecionado.execucao_id}`
                        : "Não informada"}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-[#859488]">
                      Identificado em
                    </p>

                    <p className="mt-1 font-semibold">
                      {dataFormatada(
                        selecionado.criado_em
                      )}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-[#859488]">
                      Responsável pela resolução
                    </p>

                    <p className="mt-1 font-semibold">
                      {selecionado.responsavel_nome ||
                        "Não atribuído"}
                    </p>
                  </div>
                </div>

                {/* ATUALIZAÇÃO DE STATUS */}
                <div className="border-t border-[#DAD7CD] pt-5 dark:border-[#34483A]">
                  <h3 className="font-bold">
                    Gerenciar apontamento
                  </h3>

                  {finalizado ? (
                    <div className="mt-3 rounded-xl bg-[#EDF2EA] p-4 text-sm dark:bg-[#273B31]">
                      <p className="font-semibold">
                        Apontamento finalizado
                      </p>

                      <p className="mt-1 text-[#6A7C70] dark:text-[#A3B18A]">
                        Este apontamento não pode ser
                        reaberto por esta operação.
                      </p>

                      {selecionado.observacao_resolucao && (
                        <p className="mt-3 whitespace-pre-line break-words">
                          {selecionado.observacao_resolucao}
                        </p>
                      )}
                    </div>
                  ) : (
                    <div className="mt-4 space-y-4">
                      <div>
                        <label
                          htmlFor="status-auditoria"
                          className="mb-2 block text-sm font-semibold"
                        >
                          Novo status
                        </label>

                        <select
                          id="status-auditoria"
                          value={novoStatus}
                          onChange={(e) =>
                            setNovoStatus(
                              e.target.value
                            )
                          }
                          className={campo}
                        >
                          <option value="pendente">
                            Pendente
                          </option>

                          <option value="em_analise">
                            Em análise
                          </option>

                          <option value="resolvido">
                            Resolvido
                          </option>

                          <option value="ignorado">
                            Ignorado
                          </option>
                        </select>
                      </div>

                      <div>
                        <label
                          htmlFor="observacao-auditoria"
                          className="mb-2 block text-sm font-semibold"
                        >
                          Justificativa
                          {["resolvido", "ignorado"].includes(
                            novoStatus
                          ) && " *"}
                        </label>

                        <textarea
                          id="observacao-auditoria"
                          rows={4}
                          maxLength={2000}
                          value={observacao}
                          onChange={(e) =>
                            setObservacao(
                              e.target.value
                            )
                          }
                          placeholder="Descreva o resultado da verificação..."
                          className={`${campo} resize-y`}
                        />

                        <p className="mt-1 text-right text-xs text-[#859488]">
                          {observacao.length}/2000
                        </p>
                      </div>

                      <p className="text-xs text-[#6A7C70] dark:text-[#A3B18A]">
                        A alteração será registrada no
                        histórico do sistema.
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* RODAPÉ */}
              <div className="flex flex-wrap justify-end gap-3 border-t border-[#DAD7CD] bg-[#F2F2F2] p-4 dark:border-[#34483A] dark:bg-[#18251C]">
                <button
                  onClick={fecharDetalhes}
                  disabled={salvando}
                  className={botaoSecundario}
                >
                  Fechar
                </button>

                {!finalizado && (
                  <button
                    onClick={salvarStatus}
                    disabled={
                      salvando ||
                      novoStatus ===
                        selecionado.status
                    }
                    className={botao}
                  >
                    {salvando ? (
                      <Loader2
                        size={17}
                        className="animate-spin"
                      />
                    ) : (
                      <CheckCircle2 size={17} />
                    )}

                    {salvando
                      ? "Salvando..."
                      : "Salvar alterações"}
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        <FooterPlataforma />
        <AuditoriaChatWidget token={token} empresaId={empresaId} apontamento={apontamentoChat} aberto={chatAberto} setAberto={setChatAberto} />
      </main>
    </>
  );
}

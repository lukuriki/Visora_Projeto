
"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";

import SidebarPlataforma from "@/components/SidebarPlataforma";
import FooterPlataforma from "@/components/FooterPlataforma";
import { buscarAnalisesFinanceiras } from "@/lib/api";

import {
  ResponsiveContainer,
  AreaChart,
  Area,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  BarChart,
  Bar,
} from "recharts";

import {
  Wallet,
  TrendingUp,
  TrendingDown,
  CircleDollarSign,
  ArrowUpRight,
  ArrowDownRight,
  CreditCard,
  Receipt,
  Clock,
  AlertTriangle,
  CheckCircle2,
  CalendarDays,
  ChevronDown,
  ArrowRight,
  Bell,
  Building2,
  Sparkles,
  Activity,
  RefreshCw,
  Landmark,
} from "lucide-react";

// ==========================================
// CONFIGURAÇÕES
// ==========================================

const PERIODOS = [
  "Últimos 30 dias",
  "Últimos 3 meses",
  "Últimos 6 meses",
  "Últimos 12 meses",
];

const moeda = (valor) =>
  new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(Number(valor) || 0);

const numero = (valor) => {
  const resultado = Number(valor);
  return Number.isFinite(resultado) ? resultado : 0;
};

const porcentagem = (valor, pontos = false) => {
  if (valor == null || !Number.isFinite(Number(valor))) {
    return "Sem histórico para comparação";
  }

  const valorNumerico = Number(valor);
  const sinal = valorNumerico > 0 ? "+" : "";

  return `${sinal}${valorNumerico
    .toFixed(1)
    .replace(".", ",")}${pontos ? " p.p." : "%"}`;
};

const dataBR = (data) => {
  if (!data) return "Não informado";

  const dataTexto = String(data).slice(0, 10);
  const partes = dataTexto.split("-");

  if (partes.length !== 3) return dataTexto;

  return `${partes[2]}/${partes[1]}/${partes[0]}`;
};

const formatarPercentual = (valor) =>
  valor == null
    ? "Não calculável"
    : `${numero(valor).toFixed(1).replace(".", ",")}%`;

const estiloCard =
  "rounded-2xl border border-[#DAD7CD]/80 bg-white/85 " +
  "p-5 shadow-sm backdrop-blur-md " +
  "dark:border-[#344438] dark:bg-[#1C2920]/85";

function obterToken() {
  return (
    sessionStorage.getItem("visora-token") ||
    localStorage.getItem("visora-token") ||
    sessionStorage.getItem("token") ||
    localStorage.getItem("token")
  );
}

// ==========================================
// COMPONENTE PRINCIPAL
// ==========================================

export default function PlataformaPaginaInicial() {
  const [periodo, setPeriodo] = useState("Últimos 6 meses");
  const [abaContas, setAbaContas] = useState("Pagar");

  const [analises, setAnalises] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");

  const [collapsed, setCollapsed] = useState(false);
  const [atualizacao, setAtualizacao] = useState(0);

  const alertasRef = useRef(null);

  // ==========================================
  // BUSCAR INFORMAÇÕES REAIS
  // ==========================================

  useEffect(() => {
    let ativo = true;

    async function carregarDashboard() {
      try {
        setCarregando(true);
        setErro("");

        const token = obterToken();

        if (!token) {
          throw new Error(
            "Sessão não encontrada. Faça login novamente."
          );
        }

        const resposta = await buscarAnalisesFinanceiras(
          token,
          periodo
        );

        if (!resposta?.sucesso || !resposta?.analises) {
          throw new Error(
            resposta?.mensagem ||
              "Não foi possível carregar as informações financeiras."
          );
        }

        if (ativo) {
          setAnalises(resposta.analises);
        }
      } catch (error) {
        if (ativo) {
          setAnalises(null);
          setErro(
            error?.message ||
              "Erro ao consultar as informações financeiras."
          );
        }
      } finally {
        if (ativo) {
          setCarregando(false);
        }
      }
    }

    carregarDashboard();

    return () => {
      ativo = false;
    };
  }, [periodo, atualizacao]);

  // ==========================================
  // INFORMAÇÕES DO BACKEND
  // ==========================================

  const resumo = analises?.resumo || {};
  const variacao = analises?.variacao || {};
  const pendentes = analises?.pendentes || {};

  const nomeEmpresa =
    analises?.empresa?.razaoSocial || "Sua empresa";

  const saldoBancario = analises?.saldoBancario;

  const dadosFluxo = useMemo(
    () =>
      (analises?.dados || []).map((item) => ({
        periodo: item.mes,
        receitas: numero(item.receitas),
        despesas: numero(item.despesas),
      })),
    [analises]
  );

  const categorias = useMemo(
    () =>
      (analises?.dadosCustos || []).map((item) => ({
        nome: item.nome,
        valor: numero(item.valor),
        percentual: numero(item.percentual),
      })),
    [analises]
  );

  // ==========================================
  // CARDS FINANCEIROS
  // ==========================================

  const cards = [
    {
      titulo: "Receitas realizadas",
      valor: moeda(resumo.receita),
      variacao: variacao.receita,
      icon: TrendingUp,
      positivo: numero(variacao.receita) >= 0,
      cor:
        "bg-emerald-500/10 text-emerald-600 " +
        "dark:text-emerald-400",
    },
    {
      titulo: "Despesas realizadas",
      valor: moeda(resumo.despesa),
      variacao: variacao.despesa,
      icon: TrendingDown,
      positivo: numero(variacao.despesa) <= 0,
      cor: "bg-rose-500/10 text-rose-500",
    },
    {
      titulo: "Resultado financeiro",
      valor: moeda(resumo.lucro),
      variacao: variacao.lucro,
      icon: CircleDollarSign,
      positivo: numero(variacao.lucro) >= 0,
      cor:
        "bg-[#588157]/10 text-[#588157] " +
        "dark:text-[#A3B18A]",
    },
    {
      titulo: "Saldo bancário registrado",
      valor:
        saldoBancario == null
          ? "Indisponível"
          : moeda(saldoBancario),
      variacao: null,
      icon: Wallet,
      positivo: true,
      cor: "bg-blue-500/10 text-blue-500",
      observacao: "Saldo registrado no sistema",
    },
  ];

  // ==========================================
  // CONTAS A PAGAR E RECEBER
  // ==========================================

  const contas = useMemo(() => {
    const lista = analises?.contasDetalhadas || [];

    return lista
      .filter((conta) =>
        abaContas === "Pagar"
          ? conta.tipo === "pagar"
          : conta.tipo === "receber"
      )
      .map((conta) => ({
        id: conta.id,
        nome: conta.nome || conta.descricao,
        categoria: conta.categoria || "Sem categoria",
        data: dataBR(conta.dataVencimento || conta.data),
        valor: numero(conta.valor),
        status: conta.status || "pendente",
      }));
  }, [analises, abaContas]);

  // ==========================================
  // ALERTAS REAIS
  // ==========================================

  const alertas = useMemo(
    () =>
      (analises?.alertas || []).map((alerta) => ({
        ...alerta,
        icone:
          alerta.tipo === "warning"
            ? AlertTriangle
            : alerta.tipo === "success"
              ? CheckCircle2
              : Clock,
      })),
    [analises]
  );

  // ==========================================
  // VISÃO FINANCEIRA AUTOMÁTICA
  // ==========================================

  const visaoFinanceira = useMemo(() => {
    const receber = numero(pendentes.receber);
    const pagar = numero(pendentes.pagar);

    if (!receber && !pagar) {
      return "Não há valores pendentes registrados no período selecionado.";
    }

    if (receber > pagar) {
      return (
        "Os recebimentos pendentes do período superam " +
        "os pagamentos pendentes. Acompanhe os vencimentos " +
        "para manter o planejamento financeiro."
      );
    }

    if (pagar > receber) {
      return (
        "Os pagamentos pendentes do período superam " +
        "os recebimentos previstos. Acompanhe o fluxo " +
        "financeiro e os próximos vencimentos."
      );
    }

    return (
      "Os valores pendentes a receber e a pagar " +
      "estão equilibrados no período selecionado."
    );
  }, [pendentes.receber, pendentes.pagar]);

  const totalDespesasCategorias = categorias.reduce(
    (total, item) => total + item.valor,
    0
  );

  const mesAtual = new Date().toLocaleDateString("pt-BR", {
    month: "long",
    year: "numeric",
  });

  // ==========================================
  // RENDERIZAÇÃO
  // ==========================================

  return (
    <>
      <SidebarPlataforma
        collapsed={collapsed}
        setCollapsed={setCollapsed}
      />

      <main
        className={`
          relative isolate min-h-screen overflow-hidden
          bg-[#F2F2F2] px-5 py-8 text-[#273B31]
          transition-all duration-300
          dark:bg-[#111A14] dark:text-[#E5EDE5]
          md:px-8 lg:px-10
          ${
            collapsed
              ? "md:ml-[82px]"
              : "md:ml-[270px]"
          }
        `}
      >
        {/* ======================================
            FUNDO DECORATIVO
        ====================================== */}

        <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
          <div className="absolute -top-40 left-[15%] h-[420px] w-[420px] rounded-full bg-[#A3B18A]/20 blur-[100px] dark:bg-[#588157]/10" />

          <div className="absolute right-[-180px] top-[450px] h-[450px] w-[450px] rounded-full bg-[#588157]/10 blur-[110px]" />

          <div className="absolute bottom-[-100px] left-[-100px] h-[400px] w-[400px] rounded-full bg-[#A3B18A]/15 blur-[100px] dark:bg-[#344E41]/20" />

          <div
            className="absolute inset-0 opacity-[0.12] dark:opacity-[0.07]"
            style={{
              backgroundImage: `
                linear-gradient(to right, #588157 1px, transparent 1px),
                linear-gradient(to bottom, #588157 1px, transparent 1px)
              `,
              backgroundSize: "65px 65px",
              maskImage:
                "linear-gradient(to bottom, black, transparent 85%)",
            }}
          />

          <div className="absolute right-[8%] top-[120px] h-64 w-64 rounded-full border border-[#588157]/15" />

          <div className="absolute right-[11%] top-[150px] h-48 w-48 rounded-full border border-[#588157]/10" />

          <div className="absolute bottom-[15%] left-[5%] h-40 w-40 rounded-full border border-[#588157]/10" />

          <div className="absolute -right-24 top-24 h-[520px] w-[520px] rounded-full border border-[#588157]/10" />

          <div className="absolute -right-12 top-36 h-[420px] w-[420px] rounded-full border border-dashed border-[#588157]/10" />

          <div className="absolute left-[38%] top-[18%] h-72 w-72 rounded-full bg-[#7E9971]/[0.06] blur-3xl" />

          <div
            className="absolute inset-x-0 top-[34%] h-px opacity-30"
            style={{
              background:
                "linear-gradient(90deg, transparent, #7E9971, transparent)",
            }}
          />
        </div>

        {/* ======================================
            CONTEÚDO PRINCIPAL
        ====================================== */}

        <div className="relative z-10">

          {/* CABEÇALHO */}

          <header className="mb-8 flex flex-wrap items-center justify-between gap-5">
            <div>
              <h1
                className="v-entra v-brilho flex flex-wrap items-baseline gap-x-3 text-4xl font-bold leading-[1.05] tracking-tight text-[#263D32] dark:text-[#E5EDE5] sm:text-5xl lg:text-6xl"
                style={{ "--atraso": "150ms" }}
              >
                <span>Página</span>

                <span className="bg-gradient-to-r from-[#A3B18A] to-[#588157] bg-clip-text text-transparent">
                  Inicial
                </span>
              </h1>

              <p className="mt-2 text-sm text-[#758078] dark:text-[#A1AEA3]">
                Bem-vinda à Visora. Transforme dados em visão.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2 rounded-xl border border-[#DAD7CD] bg-white/80 px-4 py-3 text-sm capitalize shadow-sm backdrop-blur-md dark:border-[#344438] dark:bg-[#1C2920]/80">
                <CalendarDays
                  size={17}
                  className="text-[#588157]"
                />
                {mesAtual}
              </div>

              <button
                type="button"
                onClick={() =>
                  setAtualizacao((valor) => valor + 1)
                }
                disabled={carregando}
                className="flex items-center gap-2 rounded-xl border border-[#DAD7CD] bg-white/80 px-4 py-3 text-sm font-semibold transition hover:bg-[#EAF0E8] disabled:opacity-60 dark:border-[#344438] dark:bg-[#1C2920]/80 dark:hover:bg-[#293D2D]"
              >
                <RefreshCw
                  size={17}
                  className={carregando ? "animate-spin" : ""}
                />
                Atualizar
              </button>

              <button
                type="button"
                onClick={() =>
                  alertasRef.current?.scrollIntoView({
                    behavior: "smooth",
                    block: "start",
                  })
                }
                className="flex items-center gap-2 rounded-xl bg-[#344E41] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#3A5A40] dark:bg-[#588157]"
              >
                <Bell size={17} />
                Notificações
                {alertas.length > 0 && (
                  <span className="rounded-full bg-white/20 px-2 py-0.5 text-xs">
                    {alertas.length}
                  </span>
                )}
              </button>
            </div>
          </header>

          {/* ERROS E CARREGAMENTO */}

          {carregando && (
            <div
              role="status"
              className={`${estiloCard} mb-6 flex items-center gap-3`}
            >
              <RefreshCw
                size={18}
                className="animate-spin text-[#588157]"
              />
              <span className="text-sm">
                Consultando as informações financeiras...
              </span>
            </div>
          )}

          {erro && (
            <div
              role="alert"
              className="mb-6 rounded-xl border border-red-300 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/30 dark:text-red-200"
            >
              {erro}
            </div>
          )}

          {analises && (
            <>
              {/* ======================================
                  EMPRESA
              ====================================== */}

              <section className={`${estiloCard} mb-7 flex flex-wrap items-center justify-between gap-4`}>
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#344E41] text-white dark:bg-[#588157]">
                    <Building2 size={23} />
                  </div>

                  <div>
                    <h2 className="font-bold">
                      {nomeEmpresa}
                    </h2>

                    <p className="mt-1 text-xs text-[#829087] dark:text-[#A1AEA3]">
                      Painel de acompanhamento financeiro
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 rounded-full bg-[#EAF0E8] px-3 py-2 text-xs font-semibold text-[#476A49] dark:bg-[#293D2D] dark:text-[#A3B18A]">
                  <span className="h-2 w-2 rounded-full bg-emerald-500" />
                  Dados consultados
                </div>
              </section>

              {/* ======================================
                  CARDS FINANCEIROS
              ====================================== */}

              <section className="mb-8">
                <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                  <h2 className="text-lg font-bold">
                    Resumo financeiro
                  </h2>

                  <span className="text-xs text-[#849087] dark:text-[#A1AEA3]">
                    {periodo}
                  </span>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                  {cards.map((card) => {
                    const Icon = card.icon;

                    const temVariacao =
                      card.variacao != null &&
                      Number.isFinite(Number(card.variacao));

                    return (
                      <article
                        key={card.titulo}
                        className={`${estiloCard} transition duration-300 hover:-translate-y-1 hover:shadow-lg`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-sm font-medium text-[#758078] dark:text-[#A1AEA3]">
                            {card.titulo}
                          </span>

                          <div
                            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${card.cor}`}
                          >
                            <Icon size={20} />
                          </div>
                        </div>

                        <h3 className="mt-5 break-words text-2xl font-bold tracking-tight">
                          {card.valor}
                        </h3>

                        <div className="mt-3 flex flex-wrap items-center gap-2">
                          {card.observacao ? (
                            <span className="text-xs text-[#929B94]">
                              {card.observacao}
                            </span>
                          ) : (
                            <>
                              <span
                                className={`flex items-center gap-1 text-xs font-bold ${
                                  !temVariacao
                                    ? "text-[#929B94]"
                                    : card.positivo
                                      ? "text-emerald-600 dark:text-emerald-400"
                                      : "text-rose-500"
                                }`}
                              >
                                {temVariacao &&
                                  (Number(card.variacao) >= 0 ? (
                                    <ArrowUpRight size={15} />
                                  ) : (
                                    <ArrowDownRight size={15} />
                                  ))}

                                {porcentagem(card.variacao)}
                              </span>

                              {temVariacao && (
                                <span className="text-[11px] text-[#929B94]">
                                  vs. período anterior
                                </span>
                              )}
                            </>
                          )}
                        </div>
                      </article>
                    );
                  })}
                </div>
              </section>

              {/* ======================================
                  GRÁFICOS
              ====================================== */}

              <section className="mb-8 grid grid-cols-1 gap-5 xl:grid-cols-3">

                {/* FLUXO FINANCEIRO */}

                <article className={`${estiloCard} xl:col-span-2`}>
                  <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <h2 className="text-lg font-bold">
                        Fluxo financeiro
                      </h2>

                      <p className="mt-1 text-xs text-[#849087] dark:text-[#A1AEA3]">
                        Receitas e despesas realizadas por data de pagamento
                      </p>
                    </div>

                    <div className="relative">
                      <select
                        value={periodo}
                        onChange={(e) =>
                          setPeriodo(e.target.value)
                        }
                        className="appearance-none rounded-lg border border-[#DAD7CD] bg-[#F8F9F6] py-2 pl-3 pr-9 text-xs font-semibold outline-none dark:border-[#344438] dark:bg-[#17231B]"
                      >
                        {PERIODOS.map((opcao) => (
                          <option key={opcao} value={opcao}>
                            {opcao}
                          </option>
                        ))}
                      </select>

                      <ChevronDown
                        size={14}
                        className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2"
                      />
                    </div>
                  </div>

                  <div className="mb-5 flex gap-5 text-xs">
                    <span className="flex items-center gap-2">
                      <span className="h-2.5 w-2.5 rounded-full bg-[#588157]" />
                      Receitas
                    </span>

                    <span className="flex items-center gap-2">
                      <span className="h-2.5 w-2.5 rounded-full bg-[#B8955A]" />
                      Despesas
                    </span>
                  </div>

                  {dadosFluxo.length > 0 ? (
                    <div className="h-[280px] w-full">
                      <ResponsiveContainer
                        width="100%"
                        height="100%"
                      >
                        <AreaChart data={dadosFluxo}>
                          <defs>
                            <linearGradient
                              id="gradReceitas"
                              x1="0"
                              y1="0"
                              x2="0"
                              y2="1"
                            >
                              <stop
                                offset="0%"
                                stopColor="#588157"
                                stopOpacity={0.25}
                              />
                              <stop
                                offset="100%"
                                stopColor="#588157"
                                stopOpacity={0}
                              />
                            </linearGradient>

                            <linearGradient
                              id="gradDespesas"
                              x1="0"
                              y1="0"
                              x2="0"
                              y2="1"
                            >
                              <stop
                                offset="0%"
                                stopColor="#B8955A"
                                stopOpacity={0.2}
                              />
                              <stop
                                offset="100%"
                                stopColor="#B8955A"
                                stopOpacity={0}
                              />
                            </linearGradient>
                          </defs>

                          <CartesianGrid
                            strokeDasharray="3 5"
                            vertical={false}
                            stroke="#8C9B8C"
                            opacity={0.2}
                          />

                          <XAxis
                            dataKey="periodo"
                            axisLine={false}
                            tickLine={false}
                            tick={{
                              fill: "#849087",
                              fontSize: 11,
                            }}
                          />

                          <YAxis
                            axisLine={false}
                            tickLine={false}
                            tick={{
                              fill: "#849087",
                              fontSize: 10,
                            }}
                            tickFormatter={(valor) =>
                              `R$${(valor / 1000).toFixed(0)}k`
                            }
                            width={48}
                          />

                          <Tooltip
                            formatter={(valor) => moeda(valor)}
                            contentStyle={{
                              backgroundColor: "#1C2920",
                              border: "1px solid #344438",
                              borderRadius: "12px",
                              color: "#fff",
                              fontSize: "12px",
                            }}
                            labelStyle={{ color: "#E5EDE5" }}
                          />

                          <Area
                            type="monotone"
                            dataKey="receitas"
                            name="Receitas"
                            stroke="#588157"
                            strokeWidth={3}
                            fill="url(#gradReceitas)"
                          />

                          <Area
                            type="monotone"
                            dataKey="despesas"
                            name="Despesas"
                            stroke="#B8955A"
                            strokeWidth={3}
                            fill="url(#gradDespesas)"
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  ) : (
                    <p className="py-16 text-center text-sm text-[#849087]">
                      Nenhum dado disponível para o gráfico.
                    </p>
                  )}
                </article>

                {/* DESPESAS POR CATEGORIA */}

                <article className={estiloCard}>
                  <h2 className="text-lg font-bold">
                    Despesas por categoria
                  </h2>

                  <p className="mt-1 text-xs text-[#849087] dark:text-[#A1AEA3]">
                    Distribuição dos gastos realizados
                  </p>

                  {categorias.length > 0 ? (
                    <div className="mt-5 h-[250px]">
                      <ResponsiveContainer
                        width="100%"
                        height="100%"
                      >
                        <BarChart
                          data={categorias}
                          layout="vertical"
                          margin={{ left: 5, right: 15 }}
                        >
                          <CartesianGrid
                            strokeDasharray="3 5"
                            horizontal={false}
                            stroke="#8C9B8C"
                            opacity={0.2}
                          />

                          <XAxis type="number" hide />

                          <YAxis
                            type="category"
                            dataKey="nome"
                            axisLine={false}
                            tickLine={false}
                            width={105}
                            tick={{
                              fill: "#849087",
                              fontSize: 10,
                            }}
                          />

                          <Tooltip
                            formatter={(valor) => moeda(valor)}
                            contentStyle={{
                              backgroundColor: "#1C2920",
                              border: "1px solid #344438",
                              borderRadius: "10px",
                              color: "#fff",
                              fontSize: "12px",
                            }}
                            labelStyle={{ color: "#E5EDE5" }}
                          />

                          <Bar
                            dataKey="valor"
                            name="Despesas"
                            fill="#588157"
                            radius={[0, 6, 6, 0]}
                            barSize={17}
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  ) : (
                    <div className="flex h-[250px] items-center justify-center">
                      <p className="text-center text-sm text-[#849087]">
                        Nenhuma despesa registrada no período.
                      </p>
                    </div>
                  )}

                  <div className="mt-4 border-t border-[#E8E9E3] pt-4 dark:border-[#344438]">
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-xs text-[#849087] dark:text-[#A1AEA3]">
                        Total de despesas
                      </span>

                      <strong>
                        {moeda(totalDespesasCategorias)}
                      </strong>
                    </div>
                  </div>
                </article>
              </section>

              {/* ======================================
                  MOVIMENTAÇÕES E INDICADORES
              ====================================== */}

              <section className="mb-8 grid grid-cols-1 gap-5 xl:grid-cols-3">

                {/* CONTAS A PAGAR E RECEBER */}

                <article className={`${estiloCard} xl:col-span-2`}>
                  <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <h2 className="text-lg font-bold">
                        Movimentações financeiras
                      </h2>

                      <p className="mt-1 text-xs text-[#849087] dark:text-[#A1AEA3]">
                        Compromissos pendentes no período selecionado
                      </p>
                    </div>

                    <Link
                      href="/plataforma_pagina_analises"
                      className="flex items-center gap-2 text-xs font-semibold text-[#588157] transition hover:underline dark:text-[#A3B18A]"
                    >
                      Ver análises
                      <ArrowRight size={15} />
                    </Link>
                  </div>

                  <div className="mb-5 flex gap-5 border-b border-[#E8E9E3] dark:border-[#344438]">
                    {["Pagar", "Receber"].map((aba) => (
                      <button
                        key={aba}
                        type="button"
                        onClick={() => setAbaContas(aba)}
                        className={`border-b-2 px-1 pb-3 text-sm font-semibold transition ${
                          abaContas === aba
                            ? "border-[#588157] text-[#344E41] dark:text-[#A3B18A]"
                            : "border-transparent text-[#929B94]"
                        }`}
                      >
                        Contas a {aba.toLowerCase()}
                      </button>
                    ))}
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[500px] text-left text-sm">
                      <thead>
                        <tr className="text-[11px] uppercase tracking-wider text-[#929B94]">
                          <th className="pb-4 font-semibold">
                            Descrição
                          </th>

                          <th className="pb-4 font-semibold">
                            Vencimento
                          </th>

                          <th className="pb-4 font-semibold">
                            Valor
                          </th>

                          <th className="pb-4 font-semibold">
                            Status
                          </th>
                        </tr>
                      </thead>

                      <tbody>
                        {contas.length === 0 ? (
                          <tr>
                            <td
                              colSpan={4}
                              className="py-8 text-center text-sm text-[#849087]"
                            >
                              Nenhuma conta a{" "}
                              {abaContas.toLowerCase()} encontrada
                              neste período.
                            </td>
                          </tr>
                        ) : (
                          contas.map((conta) => (
                            <tr
                              key={conta.id}
                              className="border-t border-[#E8E9E3] dark:border-[#344438]"
                            >
                              <td className="py-4">
                                <p className="font-semibold">
                                  {conta.nome}
                                </p>

                                <p className="mt-1 text-[11px] text-[#929B94]">
                                  {conta.categoria}
                                </p>
                              </td>

                              <td className="py-4 text-xs text-[#758078] dark:text-[#A1AEA3]">
                                {conta.data}
                              </td>

                              <td className="py-4 font-semibold">
                                {moeda(conta.valor)}
                              </td>

                              <td className="py-4">
                                <span className="rounded-full bg-amber-100 px-3 py-1.5 text-[10px] font-bold text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
                                  Pendente
                                </span>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>

                  {contas.length > 0 && (
                    <p className="mt-4 text-xs text-[#849087]">
                      Exibindo {contas.length} conta(s) a{" "}
                      {abaContas.toLowerCase()}.
                    </p>
                  )}
                </article>

                {/* INDICADORES FINANCEIROS */}

                <article className={estiloCard}>
                  <h2 className="text-lg font-bold">
                    Indicadores financeiros
                  </h2>

                  <p className="mt-1 text-xs text-[#849087] dark:text-[#A1AEA3]">
                    Resumo dos compromissos do período
                  </p>

                  <div className="mt-6 space-y-5">

                    {/* CONTAS A PAGAR */}

                    <div className="flex items-center gap-4">
                      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-rose-500/10 text-rose-500">
                        <CreditCard size={21} />
                      </div>

                      <div className="flex-1">
                        <p className="text-xs text-[#849087] dark:text-[#A1AEA3]">
                          Contas a pagar
                        </p>

                        <p className="mt-1 text-lg font-bold">
                          {moeda(pendentes.pagar)}
                        </p>

                        <p className="mt-1 text-[11px] text-[#929B94]">
                          {numero(pendentes.quantidadePagar)} pendente(s)
                        </p>
                      </div>

                      <ArrowUpRight
                        size={17}
                        className="text-rose-500"
                      />
                    </div>

                    <div className="h-px bg-[#E8E9E3] dark:bg-[#344438]" />

                    {/* CONTAS A RECEBER */}

                    <div className="flex items-center gap-4">
                      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                        <Receipt size={21} />
                      </div>

                      <div className="flex-1">
                        <p className="text-xs text-[#849087] dark:text-[#A1AEA3]">
                          Contas a receber
                        </p>

                        <p className="mt-1 text-lg font-bold">
                          {moeda(pendentes.receber)}
                        </p>

                        <p className="mt-1 text-[11px] text-[#929B94]">
                          {numero(pendentes.quantidadeReceber)} pendente(s)
                        </p>
                      </div>

                      <ArrowUpRight
                        size={17}
                        className="text-emerald-500"
                      />
                    </div>

                    <div className="h-px bg-[#E8E9E3] dark:bg-[#344438]" />

                    {/* MARGEM FINANCEIRA */}

                    <div className="flex items-center gap-4">
                      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#588157]/10 text-[#588157] dark:text-[#A3B18A]">
                        <Activity size={21} />
                      </div>

                      <div className="flex-1">
                        <p className="text-xs text-[#849087] dark:text-[#A1AEA3]">
                          Margem financeira
                        </p>

                        <p className="mt-1 text-lg font-bold">
                          {formatarPercentual(resumo.margem)}
                        </p>
                      </div>
                    </div>

                    <div className="h-px bg-[#E8E9E3] dark:bg-[#344438]" />

                    {/* SALDO BANCÁRIO */}

                    <div className="flex items-center gap-4">
                      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-500/10 text-blue-500">
                        <Landmark size={21} />
                      </div>

                      <div className="flex-1">
                        <p className="text-xs text-[#849087] dark:text-[#A1AEA3]">
                          Saldo bancário registrado
                        </p>

                        <p className="mt-1 text-lg font-bold">
                          {saldoBancario == null
                            ? "Indisponível"
                            : moeda(saldoBancario)}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* VISÃO FINANCEIRA */}

                  <div className="mt-7 rounded-xl bg-[#F0F3ED] p-4 dark:bg-[#24352A]">
                    <div className="flex items-center gap-2 text-[#588157] dark:text-[#A3B18A]">
                      <Sparkles size={17} />

                      <span className="text-xs font-bold">
                        Visão financeira
                      </span>
                    </div>

                    <p className="mt-2 text-xs leading-relaxed text-[#617267] dark:text-[#BCC8BD]">
                      {visaoFinanceira}
                    </p>
                  </div>
                </article>
              </section>

              {/* ======================================
                  ALERTAS E NOTIFICAÇÕES
              ====================================== */}

              <section
                ref={alertasRef}
                className={`${estiloCard} mb-8 scroll-mt-8`}
              >
                <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <Bell
                        size={19}
                        className="text-[#588157] dark:text-[#A3B18A]"
                      />

                      <h2 className="text-lg font-bold">
                        Alertas e notificações
                      </h2>
                    </div>

                    <p className="mt-1 text-xs text-[#849087] dark:text-[#A1AEA3]">
                      Vencimentos e compromissos financeiros
                    </p>
                  </div>

                  <span className="rounded-full bg-amber-100 px-3 py-1 text-[10px] font-bold text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
                    {alertas.length} alerta(s)
                  </span>
                </div>

                {alertas.length === 0 ? (
                  <div className="flex items-center gap-3 rounded-xl border border-[#E8E9E3] bg-[#F8F9F6] p-5 dark:border-[#344438] dark:bg-[#17231B]">
                    <CheckCircle2
                      size={21}
                      className="text-[#588157]"
                    />

                    <p className="text-sm text-[#849087] dark:text-[#A1AEA3]">
                      Nenhum alerta de vencimento encontrado.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-3 lg:grid-cols-3">
                    {alertas.map((alerta) => {
                      const Icon = alerta.icone;

                      return (
                        <div
                          key={alerta.id}
                          className="flex items-start gap-3 rounded-xl border border-[#E8E9E3] bg-white/50 p-4 transition hover:border-[#A3B18A] hover:shadow-sm dark:border-[#344438] dark:bg-[#17231B]/40 dark:hover:border-[#588157]"
                        >
                          <div
                            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                              alerta.tipo === "warning"
                                ? "bg-amber-500/10 text-amber-600"
                                : alerta.tipo === "success"
                                  ? "bg-emerald-500/10 text-emerald-600"
                                  : "bg-blue-500/10 text-blue-500"
                            }`}
                          >
                            <Icon size={19} />
                          </div>

                          <div>
                            <h3 className="text-sm font-semibold">
                              {alerta.titulo}
                            </h3>

                            <p className="mt-1 text-xs leading-relaxed text-[#849087] dark:text-[#A1AEA3]">
                              {alerta.descricao}
                            </p>

                            {alerta.data && (
                              <p className="mt-2 text-[11px] text-[#929B94]">
                                Vencimento: {dataBR(alerta.data)}
                              </p>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </section>
            </>
          )}
        </div>

        {/* ======================================
            RODAPÉ
        ====================================== */}

        <FooterPlataforma />
      </main>
    </>
  );
}
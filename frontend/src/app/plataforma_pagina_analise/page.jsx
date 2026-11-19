"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import SidebarPlataforma from "@/components/SidebarPlataforma";
import { buscarAnalisesFinanceiras } from "@/lib/api";
import "../../styles/plataforma_pagina_analise.css";
import {
  Wallet,
  TrendingUp,
  ChartNoAxesCombined,
  FileText,
  ArrowUpRight,
  ArrowDownRight,
  ChevronDown,
  Sparkles,
  CalendarDays,
  Download,
  CircleDollarSign,
  Landmark,
  ReceiptText,
  Activity,
  Clock3,
  ArrowRight,
  Eye,
  X,
  Loader2,
  CheckCircle2,
} from "lucide-react";

import {
  ResponsiveContainer,
  AreaChart,
  Area,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
} from "recharts";

/* ------------------------------------------------------------------ */
/* Hooks                                                               */
/* ------------------------------------------------------------------ */

// Detecta quando o elemento entra na tela (dispara uma única vez)
function useRevelar(limite = 0.15) {
  const ref = useRef(null);
  const [visivel, setVisivel] = useState(false);

  useEffect(() => {
    const elemento = ref.current;
    if (!elemento) return;

    if (typeof IntersectionObserver === "undefined") {
      setVisivel(true);
      return;
    }

    const observador = new IntersectionObserver(
      ([entrada]) => {
        if (entrada.isIntersecting) {
          setVisivel(true);
          observador.disconnect();
        }
      },
      { threshold: limite }
    );

    observador.observe(elemento);
    return () => observador.disconnect();
  }, [limite]);

  return [ref, visivel];
}

// Contador animado (números "subindo" até o valor final)
function useContador(alvo, ativo, duracao = 1400) {
  const [valor, setValor] = useState(0);
  const anterior = useRef(0);

  useEffect(() => {
    if (!ativo) return;

    const reduzir =
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

    if (reduzir) {
      setValor(alvo);
      anterior.current = alvo;
      return;
    }

    const de = anterior.current;
    let inicio = null;
    let quadro;

    const passo = (agora) => {
      if (inicio === null) inicio = agora;
      const progresso = Math.min((agora - inicio) / duracao, 1);
      const suave = 1 - Math.pow(1 - progresso, 3);
      const atual = de + (alvo - de) * suave;

      setValor(atual);
      anterior.current = atual;

      if (progresso < 1) quadro = requestAnimationFrame(passo);
    };

    quadro = requestAnimationFrame(passo);
    return () => cancelAnimationFrame(quadro);
  }, [alvo, ativo, duracao]);

  return valor;
}

/* ------------------------------------------------------------------ */
/* Componentes auxiliares                                              */
/* ------------------------------------------------------------------ */

// Atualiza --mx/--my para o holofote seguir o cursor
function acompanharMouse(evento) {
  const alvo = evento.currentTarget;
  const caixa = alvo.getBoundingClientRect();
  alvo.style.setProperty("--mx", `${evento.clientX - caixa.left}px`);
  alvo.style.setProperty("--my", `${evento.clientY - caixa.top}px`);
}

// Onda que nasce no ponto do clique
function criarOndulacao(evento) {
  const botao = evento.currentTarget;
  const caixa = botao.getBoundingClientRect();
  const tamanho = Math.max(caixa.width, caixa.height);
  const onda = document.createElement("span");
  onda.className = "v-onda";
  onda.style.width = onda.style.height = `${tamanho}px`;
  onda.style.left = `${evento.clientX - caixa.left - tamanho / 2}px`;
  onda.style.top = `${evento.clientY - caixa.top - tamanho / 2}px`;
  botao.appendChild(onda);
  setTimeout(() => onda.remove(), 700);
}

// Meta mensal com anel de progresso animado
function MetaMensal({ atingido, meta, formatarMoeda }) {
  const [ref, visivel] = useRevelar();
  const percentual = meta > 0 ? Math.min((atingido / meta) * 100, 100) : 0;
  const animado = useContador(percentual, visivel, 1800);

  const raio = 54;
  const circunferencia = 2 * Math.PI * raio;
  const marcos = [25, 50, 75, 100];

  return (
    <article
      ref={ref}
      onMouseMove={acompanharMouse}
      className="v-spot v-card-brilho transform-gpu rounded-2xl border border-[#DAD7CD]/80 bg-white/85 p-5 shadow-sm transition-[opacity,transform] duration-700 ease-out dark:border-[#344E41]/80 dark:bg-[#1C2920]/90 sm:p-6"
      style={{ opacity: visivel ? 1 : 0, transform: visivel ? "translateY(0)" : "translateY(24px)" }}
    >
      <h2 className="text-base font-semibold text-[#273B31] dark:text-[#E5EDE5]">
        Meta de receita
      </h2>
      <p className="mt-1 text-sm text-[#788579] dark:text-[#B1BEB2]">
        Progresso do mês atual
      </p>

      <div className="relative mx-auto mt-5 h-40 w-40">
        <svg viewBox="0 0 128 128" className="h-full w-full -rotate-90" aria-hidden="true">
          <circle
            cx="64"
            cy="64"
            r={raio}
            fill="none"
            strokeWidth="10"
            className="stroke-[#E8EDE4] dark:stroke-[#293B2E]"
          />
          <circle
            cx="64"
            cy="64"
            r={raio}
            fill="none"
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={circunferencia}
            strokeDashoffset={circunferencia * (1 - animado / 100)}
            className="v-anel-brilho stroke-[#588157] dark:stroke-[#A3B18A]"
          />
        </svg>

        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-semibold tabular-nums text-[#273B31] dark:text-[#E5EDE5]">
            {Math.round(animado)}%
          </span>
          <span className="text-xs text-[#788579] dark:text-[#B1BEB2]">da meta</span>
        </div>
      </div>

      <div className="mt-5 flex justify-between gap-2">
        {marcos.map((marco) => {
          const atingiu = animado >= marco - 0.5;
          return (
            <span
              key={marco}
              className={`rounded-full px-2.5 py-1 text-xs font-medium transition-colors duration-300 ${
                atingiu
                  ? "v-marco-ativo bg-[#E6F0E4] text-[#3D7145] dark:bg-[#293F2D] dark:text-[#A3D19B]"
                  : "bg-[#F2F4EF] text-[#89958B] dark:bg-[#233229] dark:text-[#91A093]"
              }`}
            >
              {marco}%
            </span>
          );
        })}
      </div>

      <div className="mt-5 space-y-1.5 border-t border-[#DAD7CD]/70 pt-4 text-sm dark:border-[#344E41]">
        <div className="flex justify-between text-[#66756A] dark:text-[#B1BEB2]">
          <span>Realizado</span>
          <span className="font-semibold tabular-nums text-[#273B31] dark:text-[#E5EDE5]">
            {formatarMoeda(atingido)}
          </span>
        </div>
        <div className="flex justify-between text-[#66756A] dark:text-[#B1BEB2]">
          <span>Falta para a meta</span>
          <span className="font-semibold tabular-nums text-[#273B31] dark:text-[#E5EDE5]">
            {formatarMoeda(Math.max(meta - atingido, 0))}
          </span>
        </div>
      </div>
    </article>
  );
}

// Linha do tempo com filtros animados
function AtividadeRecente({ atividades = [] }) {
  const [filtro, setFiltro] = useState("todas");

  const filtros = [
    { id: "todas", rotulo: "Todas" },
    { id: "relatorio", rotulo: "Relatórios" },
    { id: "lancamento", rotulo: "Lançamentos" },
  ];

  const lista = atividades.filter((a) => filtro === "todas" || a.tipo === filtro);

  return (
    <article onMouseMove={acompanharMouse} className="v-spot v-card-brilho transition-all duration-700 ease-out hover:-translate-y-1 hover:shadow-lg hover:shadow-[#344E41]/5 h-full rounded-2xl border border-[#DAD7CD]/80 bg-white/85 p-5 shadow-sm dark:border-[#344E41]/80 dark:bg-[#1C2920]/90 sm:p-6">
      <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold text-[#273B31] dark:text-[#E5EDE5]">
            Atividade recente
          </h2>
          <p className="mt-1 text-sm text-[#788579] dark:text-[#B1BEB2]">
            O que a plataforma atualizou na sua empresa
          </p>
        </div>

        <div className="flex gap-1.5 rounded-xl bg-[#F2F4EF] p-1 dark:bg-[#233229]">
          {filtros.map((item) => (
            <button
              key={item.id}
              onClick={() => setFiltro(item.id)}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-all duration-300 ${
                filtro === item.id
                  ? "bg-white text-[#344E41] shadow-sm dark:bg-[#344E41] dark:text-[#E5EDE5]"
                  : "text-[#788579] hover:text-[#344E41] dark:text-[#B1BEB2] dark:hover:text-[#E5EDE5]"
              }`}
            >
              {item.rotulo}
            </button>
          ))}
        </div>
      </div>

      <ol key={filtro} className="relative space-y-5">
        <span className="absolute bottom-2 left-[19px] top-2 w-px bg-[#DAD7CD] dark:bg-[#344E41]" />

        {lista.length === 0 && <li className="relative text-sm text-[#788579] dark:text-[#B1BEB2]">Nenhuma atividade encontrada no período.</li>}
        {lista.map((item, i) => {
          const IconeItem = item.tipo === "relatorio" ? FileText : item.titulo?.toLowerCase().includes("receita") ? ArrowUpRight : ArrowDownRight;
          return (
            <li
              key={`${item.id ?? i}-${item.titulo}`}
              className="v-troca relative flex items-start gap-4"
              style={{ animationDelay: `${i * 90}ms` }}
            >
              <span className="relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[#DAD7CD] bg-white text-[#588157] dark:border-[#344E41] dark:bg-[#1C2920] dark:text-[#A3B18A]">
                <IconeItem size={17} />
                {i === 0 && (
                  <span className="v-ping absolute right-0 top-0 h-2.5 w-2.5 rounded-full bg-[#588157]" />
                )}
              </span>

              <div className="min-w-0 flex-1 pt-0.5">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-semibold text-[#273B31] dark:text-[#E5EDE5]">
                    {item.titulo}
                  </p>
                  <span className="shrink-0 text-xs text-[#89958B] dark:text-[#91A093]">
                    {item.data ? new Date(`${item.data}T12:00:00`).toLocaleDateString("pt-BR") : "—"}
                  </span>
                </div>
                <p className="mt-0.5 text-sm text-[#66756A] dark:text-[#B1BEB2]">
                  {item.detalhe}
                </p>
              </div>
            </li>
          );
        })}
      </ol>
    </article>
  );
}

// Envolve uma seção e anima a entrada quando ela aparece na tela.
// Aceita função como filho para saber se já está visível.
function Revelar({ children, atraso = 0, className = "", id }) {
  const [ref, visivel] = useRevelar();

  return (
    <div
      ref={ref}
      id={id}
      className={`transform-gpu transition-[opacity,transform] duration-700 ease-out ${className}`}
      style={{ "--atraso": `${atraso}ms`, transitionDelay: `${atraso}ms`, opacity: visivel ? 1 : 0, transform: visivel ? "translateY(0)" : "translateY(24px)" }}
    >
      {typeof children === "function" ? children(visivel) : children}
    </div>
  );
}

// Mini gráfico de linha usado dentro dos cards de indicador
function Sparkline({ valores, atraso }) {
  if (!valores?.length) return null;
  const maximo = Math.max(...valores);
  const minimo = Math.min(...valores);
  const faixa = maximo - minimo || 1;

  const pontos = valores.map((v, i) => {
    const x = valores.length === 1 ? 50 : (i / (valores.length - 1)) * 100;
    const y = 24 - ((v - minimo) / faixa) * 20;
    return [x, y];
  });

  const linha = pontos.map(([x, y], i) => `${i === 0 ? "M" : "L"}${x} ${y}`).join(" ");
  const area = `${linha} L100 28 L0 28 Z`;

  return (
    <svg
      viewBox="0 0 100 28"
      preserveAspectRatio="none"
      className="mt-4 h-8 w-full"
      aria-hidden="true"
    >
      <path
        d={area}
        className="v-spark-area fill-[#588157]/10 dark:fill-[#A3B18A]/10"
        style={{ "--atraso": `${atraso}ms`, transitionDelay: `${atraso}ms` }}
      />
      <path
        d={linha}
        pathLength="1"
        fill="none"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
        className="v-spark stroke-[#588157] dark:stroke-[#A3B18A]"
        style={{ "--atraso": `${atraso}ms`, transitionDelay: `${atraso}ms` }}
      />
    </svg>
  );
}

// Card de indicador com contador animado
function CartaoIndicador({ item, indice, formatarMoeda }) {
  const [ref, visivel] = useRevelar();
  const Icone = item.icone;
  const atraso = indice * 110;

  const animado = useContador(item.numero, visivel);

  const texto =
    item.tipo === "moeda"
      ? formatarMoeda(animado)
      : item.numero === null ? "—" : `${animado.toFixed(1).replace(".", ",")}%`;

  return (
    <article
      ref={ref}
      onMouseMove={acompanharMouse}
      className="v-spot v-card-brilho transform-gpu transition-[opacity,transform,box-shadow,border-color] duration-700 ease-out group relative rounded-2xl border border-[#DAD7CD]/80 bg-white/80 p-5 shadow-sm hover:border-[#A3B18A] hover:shadow-lg hover:shadow-[#344E41]/5 dark:border-[#344E41]/80 dark:bg-[#1C2920]/90 dark:hover:border-[#588157]"
      style={{ "--atraso": `${atraso}ms`, transitionDelay: `${atraso}ms`, opacity: visivel ? 1 : 0, transform: visivel ? "translateY(0)" : "translateY(24px)" }}
    >
      <div className="absolute bottom-0 left-0 h-1 w-full origin-left scale-x-0 bg-gradient-to-r from-[#344E41] via-[#588157] to-[#A3B18A] transition-transform duration-300 group-hover:scale-x-100" />

      <div className="mb-5 flex items-start justify-between">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#E8EDE4] text-[#344E41] transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-6 dark:bg-[#293B2E] dark:text-[#A3B18A]">
          <Icone size={21} strokeWidth={1.8} />
        </div>

        <span
          className={`flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${
            item.positivo
              ? "bg-[#E6F0E4] text-[#3D7145] dark:bg-[#293F2D] dark:text-[#A3D19B]"
              : "bg-[#F5E9DF] text-[#A45B35] dark:bg-[#453126] dark:text-[#E6B18F]"
          }`}
        >
          {item.positivo ? (
            <ArrowUpRight
              size={14}
              className="transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
            />
          ) : (
            <ArrowDownRight
              size={14}
              className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:translate-y-0.5"
            />
          )}
          {item.variacao}
        </span>
      </div>

      <p className="text-sm font-medium text-[#66756A] dark:text-[#B1BEB2]">
        {item.titulo}
      </p>

      <p className="mt-2 text-2xl font-semibold tabular-nums tracking-tight text-[#273B31] dark:text-[#E5EDE5] sm:text-3xl">
        {texto}
      </p>

      <p className="mt-2 text-xs leading-5 text-[#89958B] dark:text-[#91A093]">
        {item.descricao}
      </p>

      <Sparkline valores={item.serie} atraso={atraso + 400} />
    </article>
  );
}

/* ------------------------------------------------------------------ */
/* Configuração e transformação dos dados reais                        */
/* ------------------------------------------------------------------ */
const OPCOES_PERIODOS = ["Últimos 30 dias", "Últimos 3 meses", "Últimos 6 meses", "Últimos 12 meses"];
const coresCustos = ["#344E41", "#588157", "#7E9971", "#A3B18A", "#C8D5B9"];
const numero = (valor) => Number(valor) || 0;

function obterToken() {
  if (typeof window === "undefined") return null;
  return sessionStorage.getItem("visora-token") || localStorage.getItem("visora-token") ||
    sessionStorage.getItem("token") || localStorage.getItem("token");
}

function percentualVariacao(valor, pontos = false) {
  if (valor === null || valor === undefined || !Number.isFinite(Number(valor))) return "Sem histórico para comparação";
  const n = Number(valor);
  return `${n > 0 ? "+" : ""}${n.toFixed(1).replace(".", ",")}${pontos ? " p.p." : "%"}`;
}

function criarInsights(analises) {
  if (!analises) return [{ titulo: "Aguardando dados financeiros", texto: "Seus resultados financeiros aparecerão aqui assim que estiverem disponíveis." }];
  const r = analises.resumo || {};
  const custos = analises.dadosCustos || [];
  const principal = custos[0];
  const pendentes = analises.pendentes || {};
  return [
    {
      titulo: numero(r.receita) > 0 ? "Receitas registradas no período" : "Nenhuma receita realizada no período",
      texto: numero(r.receita) > 0 ? `Foram registrados R$ ${numero(r.receita).toLocaleString("pt-BR", { minimumFractionDigits: 2 })} em receitas realizadas.` : "Registre recebimentos para acompanhar os resultados financeiros.",
    },
    {
      titulo: numero(r.lucro) >= 0 ? "Resultado do período não negativo" : "Atenção ao resultado do período",
      texto: `O resultado financeiro realizado foi de R$ ${numero(r.lucro).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}.`,
    },
    {
      titulo: principal ? `Maior categoria: ${principal.nome}` : "Sem distribuição de despesas",
      texto: principal ? `Esta categoria representa ${numero(principal.percentual).toFixed(1).replace(".", ",")}% das despesas categorizadas no período.` : "Não há despesas realizadas categorizadas para este período.",
    },
    {
      titulo: "Compromissos financeiros do período",
      texto: `Há R$ ${numero(pendentes.receber).toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} a receber e R$ ${numero(pendentes.pagar).toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} a pagar, considerando os vencimentos do período selecionado.`,
    },
  ];
}

function criarRelatorios(analises, formatarMoeda) {
  const r = analises?.resumo || {};
  const v = analises?.variacao || {};
  const custos = analises?.dadosCustos || [];
  const patrimonio = analises?.patrimonio || {};
  const contas = analises?.contas || {};
  const pendentes = analises?.pendentes || {};
  const comparacao = analises?.comparacao || {};
  const atividades = analises?.atividades || [];
  const linha = (rotulo, valor, destaque = false) => ({ rotulo, valor, destaque });
  const valorTipo = (tipo) => numero(patrimonio[tipo]?.total);
  const ativos = valorTipo("ativo");
  const bens = valorTipo("patrimonio");
  const investimentos = valorTipo("investimento");
  const emprestimos = valorTipo("emprestimo");
  const totalBens = ativos + bens + investimentos;
  const lucro = numero(r.lucro);
  const margem = r.margem == null ? "Não calculável" : `${numero(r.margem).toFixed(1).replace(".", ",")}%`;
  const categorias = custos.length
    ? custos.map((c) => linha(`${c.nome} (${numero(c.percentual).toFixed(1).replace(".", ",")}%)`, formatarMoeda(numero(c.valor))))
    : [linha("Categorias com despesas", "Nenhuma no período")];

  return [
    {
      titulo: "Resumo de resultado",
      descricao: "Receitas e despesas realizadas (não é DRE contábil)",
      detalhe: "Resultado do período selecionado",
      atualizado: "Período selecionado", icone: FileText,
      linhas: [
        linha("Receitas realizadas", formatarMoeda(numero(r.receita))),
        linha("(-) Despesas realizadas", formatarMoeda(numero(r.despesa))),
        linha("(=) Resultado financeiro", formatarMoeda(lucro), true),
        linha("Margem do resultado", margem),
        linha("Receitas a receber no período", formatarMoeda(numero(pendentes.receber))),
        linha("Despesas a pagar no período", formatarMoeda(numero(pendentes.pagar))),
      ],
    },
    {
      titulo: "Posição patrimonial cadastrada",
      descricao: "Bens, investimentos e empréstimos (não é balanço contábil)",
      detalhe: "Registros patrimoniais da empresa",
      atualizado: "Período selecionado", icone: Landmark,
      linhas: [
        linha("Ativos cadastrados", formatarMoeda(ativos)),
        linha("Patrimônio cadastrado", formatarMoeda(bens)),
        linha("Investimentos cadastrados", formatarMoeda(investimentos)),
        linha("Total de bens e aplicações", formatarMoeda(totalBens), true),
        linha("Empréstimos registrados", formatarMoeda(emprestimos)),
      ],
    },
    {
      titulo: "Fluxo financeiro realizado",
      descricao: "Recebimentos e pagamentos registrados",
      detalhe: "Movimentações do período",
      atualizado: "Período selecionado", icone: Wallet,
      linhas: [
        linha("Entradas realizadas", formatarMoeda(numero(r.receita))),
        linha("Saídas realizadas", formatarMoeda(numero(r.despesa))),
        linha("Resultado do período", formatarMoeda(lucro), true),
        linha("Recebimentos pendentes", formatarMoeda(numero(pendentes.receber))),
        linha("Pagamentos pendentes", formatarMoeda(numero(pendentes.pagar))),
      ],
    },
    {
      titulo: "Resumo de registros",
      descricao: "Contas e lançamentos (não é balancete contábil)",
      detalhe: "Registros financeiros da empresa",
      atualizado: "Período selecionado", icone: ReceiptText,
      linhas: [
        linha("Contas bancárias cadastradas", String(numero(contas.quantidade))),
        linha("Soma dos saldos iniciais", formatarMoeda(numero(contas.saldoInicial))),
        linha("Atividades recentes retornadas", String(atividades.length)),
        linha("Categorias com saídas no período", String(custos.length), true),
        linha("Lançamentos realizados no período", String(numero(comparacao.quantidadeLancamentosAtual))),
        linha("Lançamentos no período anterior", String(numero(comparacao.quantidadeLancamentosAnterior))),
      ],
    },
    {
      titulo: "Demonstrativo de despesas",
      descricao: "Distribuição por categoria",
      detalhe: "Categorias de saídas realizadas",
      atualizado: "Período selecionado", icone: CircleDollarSign,
      linhas: [...categorias, linha("Total de despesas realizadas", formatarMoeda(numero(r.despesa)), true)],
    },
    {
      titulo: "Indicadores financeiros",
      descricao: "Métricas calculadas com dados realizados",
      detalhe: "Resultado e crescimento",
      atualizado: "Período selecionado", icone: Activity,
      linhas: [
        linha("Margem do período", margem, true),
        linha("Variação da receita", percentualVariacao(v.receita)),
        linha("Variação das despesas", percentualVariacao(v.despesa)),
        linha("Variação do resultado", percentualVariacao(v.lucro)),
        linha("Variação da margem", percentualVariacao(v.margem, true)),
        linha("Histórico do período anterior", comparacao.possuiHistoricoAnterior ? "Com lançamentos registrados" : "Sem lançamentos registrados"),
      ],
    },
  ];
}

/* ------------------------------------------------------------------ */
/* Página                                                              */
/* ------------------------------------------------------------------ */
export default function PlataformaPaginaAnalise() {
  const [collapsed, setCollapsed] = useState(false);
  const [periodo, setPeriodo] = useState("Últimos 6 meses");
  const [exportando, setExportando] = useState(false);
  const [relatorioAberto, setRelatorioAberto] = useState(null);
  const [custoAtivo, setCustoAtivo] = useState(null);
  const [insightAtual, setInsightAtual] = useState(0);
  const [carregando, setCarregando] = useState(true);
  const [toast, setToast] = useState(null);

  const [analises, setAnalises] = useState(null);
  const [erroAnalises, setErroAnalises] = useState("");

  useEffect(() => {
    let ativo = true;
    async function carregar() {
      setCarregando(true);
      setErroAnalises("");
      setAnalises(null);
      try {
        const token = obterToken();
        if (!token) throw new Error("Sessão não encontrada. Faça login novamente.");
        const resposta = await buscarAnalisesFinanceiras(token, periodo);
        if (!ativo) return;
        if (!resposta?.sucesso || !resposta?.analises) throw new Error(resposta?.mensagem || "Não foi possível carregar as análises.");
        setAnalises(resposta.analises);
      } catch (erro) {
        if (ativo) setErroAnalises(erro?.message || "Falha ao consultar os dados financeiros.");
      } finally {
        if (ativo) setCarregando(false);
      }
    }
    carregar();
    return () => { ativo = false; };
  }, [periodo]);

  const trocarPeriodo = (novo) => { setRelatorioAberto(null); setPeriodo(novo); };

  const formatarMoeda = (valor) => new Intl.NumberFormat("pt-BR", {
    style: "currency", currency: "BRL", minimumFractionDigits: 2,
  }).format(numero(valor));

  const dados = analises?.dados || [];
  const desempenho = analises?.desempenho || [];
  const variacao = analises?.variacao || {};
  const dadosCustos = analises?.dadosCustos || [];
  const atividades = analises?.atividades || [];
  const pendentes = analises?.pendentes || {};
  const comparacao = analises?.comparacao || {};
  const insights = useMemo(() => criarInsights(analises), [analises]);
  const relatorios = criarRelatorios(analises, formatarMoeda);

  const resumo = useMemo(() => {
    const r = analises?.resumo || {};
    const melhor = dados.length ? [...dados].sort((a, b) => (numero(b.receitas) - numero(b.despesas)) - (numero(a.receitas) - numero(a.despesas)))[0] : null;
    const valoresDesempenho = desempenho.map((d) => d.valor).filter((v) => v != null && Number.isFinite(Number(v)));
    return {
      receita: numero(r.receita), despesa: numero(r.despesa), lucro: numero(r.lucro),
      margem: r.margem == null ? null : numero(r.margem),
      melhorMes: melhor ? melhor.mes : "—",
      mediaMensal: dados.length ? numero(r.lucro) / dados.length : 0,
      ganhoDesempenho: valoresDesempenho.length > 1 ? valoresDesempenho.at(-1) - valoresDesempenho[0] : null,
    };
  }, [analises, dados, desempenho]);

  const indicadores = [
    { titulo: "Receita total", numero: resumo.receita, tipo: "moeda", variacao: percentualVariacao(variacao.receita), descricao: "em relação ao período anterior", positivo: variacao.receita == null ? true : numero(variacao.receita) >= 0, icone: Wallet, serie: dados.map((d) => numero(d.receitas)) },
    { titulo: "Despesas totais", numero: resumo.despesa, tipo: "moeda", variacao: percentualVariacao(variacao.despesa), descricao: "em relação ao período anterior", positivo: variacao.despesa == null ? true : numero(variacao.despesa) <= 0, icone: ReceiptText, serie: dados.map((d) => numero(d.despesas)) },
    { titulo: "Resultado financeiro", numero: resumo.lucro, tipo: "moeda", variacao: percentualVariacao(variacao.lucro), descricao: "receitas menos despesas realizadas", positivo: variacao.lucro == null ? true : numero(variacao.lucro) >= 0, icone: TrendingUp, serie: dados.map((d) => numero(d.receitas) - numero(d.despesas)) },
    { titulo: "Margem financeira", numero: resumo.margem, tipo: "percentual", variacao: percentualVariacao(variacao.margem, true), descricao: "resultado sobre receitas realizadas", positivo: variacao.margem == null ? true : numero(variacao.margem) >= 0, icone: ChartNoAxesCombined, serie: dados.map((d) => numero(d.receitas) ? ((numero(d.receitas) - numero(d.despesas)) / numero(d.receitas)) * 100 : 0) },
  ];

  // Troca automática dos insights
  useEffect(() => {
    const intervalo = setInterval(() => {
      setInsightAtual((atual) => (atual + 1) % insights.length);
    }, 6000);
    return () => clearInterval(intervalo);
  }, []);

  // Fecha o modal com ESC e trava a rolagem da página enquanto ele está aberto
  useEffect(() => {
    if (!relatorioAberto) return;

    const aoPressionar = (evento) => {
      if (evento.key === "Escape") setRelatorioAberto(null);
    };

    const overflowAnterior = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", aoPressionar);

    return () => {
      document.body.style.overflow = overflowAnterior;
      window.removeEventListener("keydown", aoPressionar);
    };
  }, [relatorioAberto]);

  const exportar = () => {
    if (exportando || carregando || erroAnalises || !analises) return;
    setExportando(true);
    setTimeout(() => {
      setExportando(false);
      setToast("Preparando impressão do relatório");
      setTimeout(() => setToast(null), 3500);
      window.print();
    }, 900);
  };

  const estiloTooltip = {
    borderRadius: "12px",
    border: "1px solid var(--v-tip-borda)",
    backgroundColor: "var(--v-tip-bg)",
    color: "var(--v-tip-texto)",
    fontSize: "12px",
  };

  const insight = insights[insightAtual % insights.length];

  return (
    <div className="v-pagina-analise relative min-h-screen overflow-hidden bg-[#F2F2F2] text-[#273B31] transition-colors duration-300 dark:bg-[#111A14] dark:text-[#E5EDE5] v-fundo-animado">
      {/* Textura pontilhada e detalhes decorativos do fundo */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-0 opacity-[0.18] [background-image:radial-gradient(#7E9971_0.8px,transparent_0.8px)] [background-size:26px_26px] [mask-image:linear-gradient(to_bottom,black,transparent_82%)] dark:opacity-[0.12]" />
      <div aria-hidden="true" className="pointer-events-none absolute -right-28 top-[900px] h-80 w-80 rounded-full border border-[#7E9971]/20 dark:border-[#A3B18A]/15" />
      <div aria-hidden="true" className="pointer-events-none absolute -left-24 top-[1450px] h-64 w-64 rounded-full border border-[#588157]/15 dark:border-[#A3B18A]/10" />
      <div aria-hidden="true" className="pointer-events-none absolute right-[8%] top-[350px] h-28 w-28 rounded-full border border-dashed border-[#7E9971]/20 animate-[spin_55s_linear_infinite] dark:border-[#A3B18A]/15" />
      <div aria-hidden="true" className="pointer-events-none absolute left-[12%] top-[1120px] h-3 w-3 rounded-full bg-[#7E9971]/35 shadow-[0_0_0_9px_rgba(126,153,113,0.06)] animate-pulse" />
      <div aria-hidden="true" className="pointer-events-none absolute right-[18%] top-[1680px] h-2 w-2 rounded-full bg-[#588157]/35 shadow-[0_0_0_8px_rgba(88,129,87,0.06)] animate-pulse [animation-delay:900ms]" />
      <div aria-hidden="true" className="pointer-events-none absolute left-[42%] top-[2200px] h-40 w-40 rounded-full border border-[#A3B18A]/15 animate-[pulse_8s_ease-in-out_infinite]" />

      {/* Auras decorativas */}
      <div className="v-flutuar pointer-events-none absolute -top-40 left-[20%] h-[430px] w-[430px] rounded-full bg-[#A3B18A]/20 blur-[110px] dark:bg-[#588157]/15" />

      <div className="v-flutuar-2 pointer-events-none absolute right-[-140px] top-[480px] h-[380px] w-[380px] rounded-full bg-[#588157]/10 blur-[100px] dark:bg-[#588157]/10" />

      <div className="v-flutuar pointer-events-none absolute bottom-[-150px] left-[25%] h-[400px] w-[400px] rounded-full bg-[#A3B18A]/15 blur-[120px] dark:bg-[#7E9971]/10" />

      {/* Linhas curvas decorativas (desenhadas ao carregar) */}
      <svg
        className="pointer-events-none absolute right-0 top-0 hidden h-[1800px] w-[650px] opacity-40 lg:block"
        viewBox="0 0 650 1800"
        fill="none"
        aria-hidden="true"
      >
        <path
          d="M650 30C500 30 500 170 350 170S200 310 50 310"
          pathLength="1"
          stroke="#7E9971"
          strokeWidth="1"
          className="v-linha"
          style={{ "--atraso": "200ms" }}
        />
        <path
          d="M650 70C520 70 520 210 370 210S220 350 70 350"
          pathLength="1"
          stroke="#A3B18A"
          strokeWidth="1"
          className="v-linha"
          style={{ "--atraso": "450ms" }}
        />
        <path
          d="M650 110C540 110 540 250 390 250S240 390 90 390"
          pathLength="1"
          stroke="#588157"
          strokeWidth="1"
          className="v-linha"
          style={{ "--atraso": "700ms" }}
        />
        <path d="M650 560C510 560 510 700 365 700S220 840 65 840" pathLength="1" stroke="#7E9971" strokeWidth="1" className="v-linha" style={{ "--atraso": "900ms" }} />
        <path d="M650 610C530 610 530 750 385 750S240 890 85 890" pathLength="1" stroke="#A3B18A" strokeWidth="0.9" className="v-linha" style={{ "--atraso": "1100ms" }} />
        <path d="M650 1040C520 1040 520 1180 375 1180S230 1320 75 1320" pathLength="1" stroke="#588157" strokeWidth="1" className="v-linha" style={{ "--atraso": "1300ms" }} />
        <path d="M650 1090C540 1090 540 1230 395 1230S250 1370 95 1370" pathLength="1" stroke="#A3B18A" strokeWidth="0.9" className="v-linha" style={{ "--atraso": "1500ms" }} />
        <circle cx="365" cy="700" r="4" fill="#7E9971" className="v-ponto" style={{ "--atraso": "1700ms" }} />
        <circle cx="385" cy="750" r="3" fill="#A3B18A" className="v-ponto" style={{ "--atraso": "1900ms" }} />
        <circle cx="375" cy="1180" r="4" fill="#588157" className="v-ponto" style={{ "--atraso": "2100ms" }} />
        <circle cx="395" cy="1230" r="3" fill="#A3B18A" className="v-ponto" style={{ "--atraso": "2300ms" }} />
        <circle cx="350" cy="170" r="4" fill="#588157" className="v-ponto" style={{ "--atraso": "1400ms" }} />
        <circle cx="370" cy="210" r="3" fill="#A3B18A" className="v-ponto" style={{ "--atraso": "1650ms" }} />
        <circle cx="390" cy="250" r="4" fill="#7E9971" className="v-ponto" style={{ "--atraso": "1900ms" }} />
        <path d="M640 390C500 390 500 500 360 500S220 610 80 610" pathLength="1" stroke="#A3B18A" strokeWidth="0.8" className="v-linha" style={{ "--atraso": "1750ms" }} />
        <path d="M650 430C520 430 520 540 380 540S240 650 100 650" pathLength="1" stroke="#588157" strokeWidth="0.8" className="v-linha" style={{ "--atraso": "1950ms" }} />
        <path d="M650 880C510 880 510 990 370 990S230 1100 90 1100" pathLength="1" stroke="#7E9971" strokeWidth="0.9" className="v-linha" style={{ "--atraso": "2150ms" }} />
        <path d="M650 930C530 930 530 1040 390 1040S250 1150 110 1150" pathLength="1" stroke="#A3B18A" strokeWidth="0.8" className="v-linha" style={{ "--atraso": "2350ms" }} />
        <circle cx="360" cy="500" r="3.5" fill="#A3B18A" className="v-ponto" style={{ "--atraso": "2450ms" }} />
        <circle cx="380" cy="540" r="3" fill="#588157" className="v-ponto" style={{ "--atraso": "2600ms" }} />
        <circle cx="370" cy="990" r="3.5" fill="#7E9971" className="v-ponto" style={{ "--atraso": "2750ms" }} />
        <circle cx="390" cy="1040" r="3" fill="#A3B18A" className="v-ponto" style={{ "--atraso": "2900ms" }} />
        <circle cx="520" cy="1510" r="34" stroke="#7E9971" strokeOpacity="0.22" strokeWidth="1" />
        <circle cx="520" cy="1510" r="20" stroke="#A3B18A" strokeOpacity="0.28" strokeWidth="1" />
        <circle cx="520" cy="1510" r="3" fill="#588157" className="v-ponto" style={{ "--atraso": "3100ms" }} />
      </svg>

      <SidebarPlataforma collapsed={collapsed} setCollapsed={setCollapsed} />

      <div className="v-barra-scroll" aria-hidden="true" />

      <main className={`relative z-10 min-w-0 px-5 pb-12 pt-8 sm:px-8 lg:px-10 transition-[margin-left] duration-300 ease-in-out ${collapsed ? "lg:ml-[82px]" : "lg:ml-[270px]"}`}>
        <div className="mx-auto max-w-[1600px]">
          {/* Cabeçalho */}
          <header className="mb-9 flex flex-col justify-between gap-5 xl:flex-row xl:items-center">
            <div>
              <div
                className="v-entrada mb-3 flex items-center gap-2 text-sm font-medium text-[#588157] dark:text-[#A3B18A]"
                style={{ "--atraso": "50ms" }}
              >
                <ChartNoAxesCombined size={17} />
                <span>VISORA / ANÁLISES</span>
              </div>

            <h1
              className="!border-0 !border-l-0 before:!hidden after:!hidden relative flex flex-wrap items-baseline gap-x-3 text-4xl font-bold leading-[1.05] tracking-tight text-[#263D32] dark:text-[#E5EDE5] sm:text-5xl lg:text-6xl"
              style={{
                "--atraso": "150ms",
                borderLeft: "none",
                outline: "none",
                boxShadow: "none",
              }}
            >
              <span>Análises</span>
              <span className="bg-gradient-to-r from-[#A3B18A] to-[#588157] bg-clip-text text-transparent">
                financeiras
              </span>
            </h1>

              <p
                className="v-entrada mt-2 max-w-xl text-sm leading-6 text-[#66756A] dark:text-[#B1BEB2] sm:text-base"
                style={{ "--atraso": "280ms" }}
              >
                Acompanhe seus resultados e transforme dados em decisões mais
                inteligentes.
              </p>
            </div>

            <div
              className="v-entrada flex flex-wrap items-center gap-3"
              style={{ "--atraso": "380ms" }}
            >
              <div className="relative">
                <CalendarDays
                  size={17}
                  className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[#588157] dark:text-[#A3B18A]"
                />

                <select
                  value={periodo}
                  onChange={(evento) => trocarPeriodo(evento.target.value)}
                  className="min-h-11 appearance-none rounded-xl border border-[#DAD7CD] bg-white/80 py-2.5 pl-10 pr-10 text-sm font-medium text-[#344E41] outline-none transition hover:border-[#A3B18A] focus:border-[#588157] dark:border-[#344E41] dark:bg-[#1C2920] dark:text-[#E5EDE5]"
                >
                  {OPCOES_PERIODOS.map((opcao) => (
                    <option key={opcao}>{opcao}</option>
                  ))}
                </select>

                <ChevronDown
                  size={15}
                  className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#588157] dark:text-[#A3B18A]"
                />
              </div>

              <button
                onClick={exportar}
                onMouseDown={criarOndulacao}
                disabled={exportando || carregando || !analises}
                className="v-ondulacao group flex min-h-11 min-w-[130px] items-center justify-center gap-2 rounded-xl bg-[#344E41] px-4 py-2.5 text-sm font-medium text-white transition hover:bg-[#273B31] active:scale-95 disabled:opacity-80 dark:bg-[#588157] dark:hover:bg-[#6B9469]"
              >
                {exportando ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Preparando...
                  </>
                ) : (
                  <>
                    <Download
                      size={16}
                      className="transition-transform duration-300 group-hover:translate-y-0.5"
                    />
                    Imprimir
                  </>
                )}
              </button>
            </div>
          </header>

          {erroAnalises && (
            <div role="alert" className="mb-6 rounded-xl border border-red-300 bg-red-50 p-4 text-sm text-red-800 dark:border-red-900 dark:bg-red-950/30 dark:text-red-200">
              Não foi possível carregar as informações financeiras: {erroAnalises}
            </div>
          )}
          {carregando && <p role="status" className="mb-5 text-sm text-[#66756A] dark:text-[#B1BEB2]">Atualizando suas informações financeiras...</p>}
          {!carregando && !erroAnalises && analises && dados.every((d) => numero(d.receitas) === 0 && numero(d.despesas) === 0) && (
            <p className="mb-5 rounded-xl border border-[#DAD7CD] p-4 text-sm dark:border-[#344E41]">Nenhuma receita ou despesa realizada encontrada neste período.</p>
          )}
          {analises && (<>
          {/* Indicadores */}
          <section className="mb-10">
            <Revelar className="mb-4 flex items-center justify-between gap-3">
              <div>
                <h2 className="text-3xl  font-semibold text-[#273B31] dark:text-[#E5EDE5]">
                  Visão geral
                </h2>
                <p className="mt-1 text-sm text-[#788579] dark:text-[#B1BEB2]">
                  Seus principais indicadores financeiros
                </p>
              </div>

              <span className="hidden items-center gap-2 rounded-full border border-[#DAD7CD] bg-white/60 px-3 py-1.5 text-xs text-[#66756A] dark:border-[#344E41] dark:bg-[#1C2920] dark:text-[#B1BEB2] sm:flex">
                <span className="v-ping relative h-2 w-2 rounded-full bg-[#588157]" />
                Informações da sua empresa
              </span>
            </Revelar>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 2xl:grid-cols-4">
              {indicadores.map((item, indice) => (
                <CartaoIndicador
                  key={item.titulo}
                  item={item}
                  indice={indice}
                  formatarMoeda={formatarMoeda}
                />
              ))}
            </div>
          </section>

          {/* Compromissos com vencimento no período (não somados ao realizado) */}
          <Revelar className="mb-10">
            <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
              <div>
                <h2 className="text-xl font-semibold text-[#273B31] dark:text-[#E5EDE5]">Contas pendentes</h2>
                <p className="mt-1 text-sm text-[#788579] dark:text-[#B1BEB2]">
                  Valores com vencimento no período selecionado, separados dos pagamentos realizados.
                </p>
              </div>
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {[
                { titulo: "A receber", valor: pendentes.receber, quantidade: pendentes.quantidadeReceber, Icone: ArrowUpRight },
                { titulo: "A pagar", valor: pendentes.pagar, quantidade: pendentes.quantidadePagar, Icone: ArrowDownRight },
              ].map(({ titulo, valor, quantidade, Icone }) => (
                <article key={titulo} className="rounded-2xl border border-[#DAD7CD]/80 bg-white/85 p-5 shadow-sm dark:border-[#344E41]/80 dark:bg-[#1C2920]/90 sm:p-6">
                  <div className="flex items-center gap-2 text-sm font-medium text-[#66756A] dark:text-[#B1BEB2]">
                    <Icone size={18} className="text-[#588157] dark:text-[#A3B18A]" />
                    {titulo}
                  </div>
                  <p className="mt-3 text-2xl font-semibold tabular-nums text-[#273B31] dark:text-[#E5EDE5]">
                    {formatarMoeda(valor)}
                  </p>
                  <p className="mt-2 text-xs text-[#788579] dark:text-[#B1BEB2]">
                    {numero(quantidade)} {numero(quantidade) === 1 ? "lançamento pendente" : "lançamentos pendentes"}
                  </p>
                </article>
              ))}
            </div>
            {!comparacao.possuiHistoricoAnterior && (
              <p className="mt-3 text-xs text-[#788579] dark:text-[#B1BEB2]">
                Ainda não há lançamentos realizados no período anterior para algumas comparações.
              </p>
            )}
          </Revelar>

          {/* Receitas x despesas e distribuição de custos */}
          <section className="mb-6 grid grid-cols-1 gap-6 xl:grid-cols-3">
            <Revelar className="xl:col-span-2">
              {(visivel) => (
                <article onMouseMove={acompanharMouse} className="v-spot v-card-brilho transition-all duration-700 ease-out h-full rounded-2xl border border-[#DAD7CD]/80 bg-white/85 p-5 shadow-sm dark:border-[#344E41]/80 dark:bg-[#1C2920]/90 sm:p-6">
                  <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <h2 className=" font-semibold text-3xl text-[#273B31] dark:text-[#E5EDE5]">
                        Receitas x despesas
                      </h2>
                      <p className="mt-1 text-sm text-[#788579] dark:text-[#B1BEB2]">
                        Evolução financeira ao longo do período
                      </p>
                    </div>

                    <span
                      key={periodo}
                      className="v-troca rounded-lg bg-[#E8EDE4] px-3 py-1.5 text-xs font-medium text-[#344E41] dark:bg-[#293B2E] dark:text-[#A3B18A]"
                    >
                      {periodo}
                    </span>
                  </div>

                  <div className="mb-5 flex flex-wrap gap-5 text-xs text-[#66756A] dark:text-[#B1BEB2]">
                    <span className="flex items-center gap-2">
                      <span className="h-2.5 w-2.5 rounded-full bg-[#588157]" />
                      Receitas
                    </span>

                    <span className="flex items-center gap-2">
                      <span className="h-2.5 w-2.5 rounded-full bg-[#A3B18A]" />
                      Despesas
                    </span>
                  </div>

                  <div key={`${periodo}-receitas`} className="v-troca-chart h-[280px] w-full">
                    {carregando && <div className="v-esqueleto h-full w-full rounded-xl" />}
{!carregando && visivel && (
<ResponsiveContainer width="100%" height="100%">
<AreaChart
                          key={periodo}
                          data={dados}
                          margin={{ top: 8, right: 8, left: -18, bottom: 0 }}
                        >
                          <defs>
                            <linearGradient id="gradienteReceitasVisora" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor="#588157" stopOpacity={0.25} />
                              <stop offset="100%" stopColor="#588157" stopOpacity={0} />
                            </linearGradient>

                            <linearGradient id="gradienteDespesasVisora" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor="#A3B18A" stopOpacity={0.2} />
                              <stop offset="100%" stopColor="#A3B18A" stopOpacity={0} />
                            </linearGradient>
                          </defs>

                          <CartesianGrid
                            strokeDasharray="3 5"
                            vertical={false}
                            stroke="#DAD7CD"
                            opacity={0.5}
                          />

                          <XAxis
                            dataKey="mes"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: "#89958B", fontSize: 12 }}
                            dy={10}
                          />

                          <YAxis
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: "#89958B", fontSize: 11 }}
                            tickFormatter={(valor) => `${Math.round(valor / 1000)} mil`}
                          />

                          <Tooltip
                            formatter={(valor, nome) => [
                              formatarMoeda(Number(valor)),
                              nome === "receitas" ? "Receitas" : "Despesas",
                            ]}
                            contentStyle={estiloTooltip}
                            labelStyle={{ color: "var(--v-tip-texto)" }}
                          />

                          <Area
                            type="monotone"
                            dataKey="receitas"
                            name="receitas"
                            stroke="#588157"
                            strokeWidth={2.5}
                            fill="url(#gradienteReceitasVisora)"
                            activeDot={{ r: 5, fill: "#588157" }}
                            animationBegin={150}
                            animationDuration={1500}
                            animationEasing="ease-out"
                          />

                          <Area
                            type="monotone"
                            dataKey="despesas"
                            name="despesas"
                            stroke="#A3B18A"
                            strokeWidth={2.5}
                            fill="url(#gradienteDespesasVisora)"
                            activeDot={{ r: 5, fill: "#A3B18A" }}
                            animationBegin={450}
                            animationDuration={1500}
                            animationEasing="ease-out"
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    )}
                  </div>

                  {/* Resumo do período */}
                  <div className="mt-5 grid grid-cols-1 gap-3 border-t border-[#DAD7CD]/70 pt-5 dark:border-[#344E41] sm:grid-cols-3">
                    {[
                      { rotulo: "Melhor resultado", valor: resumo.melhorMes },
                      { rotulo: "Resultado médio por período", valor: formatarMoeda(resumo.mediaMensal) },
                      { rotulo: "Resultado acumulado", valor: formatarMoeda(resumo.lucro) },
                    ].map((info, i) => (
                      <div
                        key={`${periodo}-${info.rotulo}`}
                        className="v-troca rounded-xl bg-[#F2F4EF] px-4 py-3 dark:bg-[#233229]"
                        style={{ animationDelay: `${i * 90}ms` }}
                      >
                        <p className="text-xs text-[#788579] dark:text-[#B1BEB2]">{info.rotulo}</p>
                        <p className="mt-1 text-sm font-semibold tabular-nums text-[#273B31] dark:text-[#E5EDE5]">
                          {info.valor}
                        </p>
                      </div>
                    ))}
                  </div>
                </article>
              )}
            </Revelar>

            {/* Distribuição de custos */}
            <Revelar atraso={120}>
              {(visivel) => (
                <article onMouseMove={acompanharMouse} className="v-spot v-card-brilho transition-all duration-700 ease-out h-full rounded-2xl border border-[#DAD7CD]/80 bg-white/85 p-5 shadow-sm dark:border-[#344E41]/80 dark:bg-[#1C2920]/90 sm:p-6">
                  <div className="mb-2">
                    <h2 className="text-base font-semibold text-[#273B31] dark:text-[#E5EDE5]">
                      Distribuição de custos
                    </h2>
                    <p className="mt-1 text-sm text-[#788579] dark:text-[#B1BEB2]">
                      Participação por categoria
                    </p>
                  </div>

                  <div className="relative mx-auto h-[225px] max-w-[280px]">
                    {visivel && (
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={dadosCustos}
                            dataKey="valor"
                            nameKey="nome"
                            cx="50%"
                            cy="50%"
                            innerRadius={62}
                            outerRadius={88}
                            paddingAngle={4}
                            stroke="none"
                            animationBegin={200}
                            animationDuration={1300}
                            onMouseEnter={(_, indice) => setCustoAtivo(indice)}
                            onMouseLeave={() => setCustoAtivo(null)}
                          >
                            {dadosCustos.map((item, indice) => (
                              <Cell
                                key={item.nome}
                                fill={coresCustos[indice % coresCustos.length]}
                                fillOpacity={
                                  custoAtivo === null || custoAtivo === indice ? 1 : 0.35
                                }
                                style={{ transition: "fill-opacity 0.25s ease", outline: "none" }}
                              />
                            ))}
                          </Pie>

                        </PieChart>
                      </ResponsiveContainer>
                    )}

                    <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-xs text-[#788579] dark:text-[#B1BEB2]">
                        Distribuição
                      </span>
                      <span className="mt-1 text-2xl font-semibold tabular-nums text-[#273B31] dark:text-[#E5EDE5]">
                        {dadosCustos.length ? "100%" : "0%"}
                      </span>
                    </div>
                  </div>

                  <div className="mt-2 space-y-3">
                    {dadosCustos.map((item, indice) => (
                      <div
                        key={item.nome}
                        onMouseEnter={() => setCustoAtivo(indice)}
                        onMouseLeave={() => setCustoAtivo(null)}
                        className={`cursor-default rounded-lg px-2 py-1.5 transition-all duration-300 ${
                          custoAtivo === null || custoAtivo === indice
                            ? "opacity-100"
                            : "opacity-40"
                        } ${custoAtivo === indice ? "bg-[#F2F4EF] dark:bg-[#233229]" : ""}`}
                      >
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex items-center gap-2.5">
                            <span
                              className="h-2.5 w-2.5 rounded-full"
                              style={{ backgroundColor: coresCustos[indice % coresCustos.length] }}
                            />
                            <span className="text-sm text-[#66756A] dark:text-[#B1BEB2]">
                              {item.nome}
                            </span>
                          </div>

                          <span className="text-sm font-semibold text-[#344E41] dark:text-[#E5EDE5]">
                            {numero(item.percentual).toFixed(1).replace(".", ",")}%
                          </span>
                        </div>

                        <div className="mt-2 h-1 w-full overflow-hidden rounded-full bg-[#E8EDE4] dark:bg-[#293B2E]">
                          <div
                            className="h-full rounded-full transition-[width] duration-[1200ms] ease-out"
                            style={{
                              width: visivel ? `${numero(item.percentual)}%` : "0%",
                              backgroundColor: coresCustos[indice % coresCustos.length],
                              transitionDelay: `${300 + indice * 120}ms`,
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </article>
              )}
            </Revelar>
          </section>

          {/* Desempenho */}
          <Revelar className="mb-10">
            {(visivel) => (
              <article onMouseMove={acompanharMouse} className="v-spot v-card-brilho transition-all duration-700 ease-out rounded-2xl border border-[#DAD7CD]/80 bg-white/85 p-5 shadow-sm dark:border-[#344E41]/80 dark:bg-[#1C2920]/90 sm:p-6">
                <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h2 className="text-base font-semibold text-[#273B31] dark:text-[#E5EDE5]">
                      Índice de desempenho
                    </h2>
                    <p className="mt-1 text-sm text-[#788579] dark:text-[#B1BEB2]">
                      Acompanhamento dos resultados no período
                    </p>
                  </div>

                  <div
                    key={`${periodo}-ganho`}
                    className="v-troca flex items-center gap-2 rounded-xl bg-[#E8EDE4] px-3 py-2 dark:bg-[#293B2E]"
                  >
                    <TrendingUp size={17} className="text-[#588157] dark:text-[#A3B18A]" />
                    <span className="text-sm font-semibold text-[#344E41] dark:text-[#A3B18A]">
                      {resumo.ganhoDesempenho == null ? "Sem comparação" : `${resumo.ganhoDesempenho > 0 ? "+" : ""}${resumo.ganhoDesempenho.toFixed(1).replace(".", ",")} p.p.`}
                    </span>
                  </div>
                </div>

                <div key={`${periodo}-desempenho`} className="v-troca-chart h-[250px] w-full">
                  {carregando && <div className="v-esqueleto h-full w-full rounded-xl" />}
{!carregando && visivel && (
<ResponsiveContainer width="100%" height="100%">
<BarChart
                        key={periodo}
                        data={desempenho}
                        margin={{ top: 8, right: 8, left: -18, bottom: 0 }}
                      >
                        <CartesianGrid
                          strokeDasharray="3 5"
                          vertical={false}
                          stroke="#DAD7CD"
                          opacity={0.5}
                        />

                        <XAxis
                          dataKey="mes"
                          axisLine={false}
                          tickLine={false}
                          tick={{ fill: "#89958B", fontSize: 12 }}
                          dy={10}
                        />

                        <YAxis
                          axisLine={false}
                          tickLine={false}
                          tick={{ fill: "#89958B", fontSize: 11 }}
                          domain={[0, 100]}
                        />

                        <Tooltip
                          formatter={(valor) => [`${valor} pontos`, "Desempenho"]}
                          contentStyle={estiloTooltip}
                          cursor={{ fill: "#A3B18A", fillOpacity: 0.12 }}
                        />

                        <Bar
                          dataKey="valor"
                          name="Desempenho"
                          fill="#588157"
                          radius={[7, 7, 0, 0]}
                          maxBarSize={42}
                          animationBegin={150}
                          animationDuration={1100}
                          animationEasing="ease-out"
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </article>
            )}
          </Revelar>

          {/* Meta e atividade */}
          <section className="mb-10 grid grid-cols-1 gap-6 xl:grid-cols-3">
            <article className="rounded-2xl border border-[#DAD7CD]/80 bg-white/85 p-6 dark:border-[#344E41]/80 dark:bg-[#1C2920]/90">
              <h2 className="text-base font-semibold">Meta de receita</h2>
              <p className="mt-3 text-sm text-[#788579] dark:text-[#B1BEB2]">Meta não configurada. Não é possível calcular o progresso sem um valor de meta cadastrado.</p>
              <p className="mt-6 text-sm">Receita realizada no período</p>
              <p className="mt-2 text-2xl font-semibold">{formatarMoeda(resumo.receita)}</p>
            </article>

            <Revelar className="xl:col-span-2" atraso={120}>
              <AtividadeRecente atividades={atividades} />
            </Revelar>
          </section>

          {/* Relatórios */}
          <section id="relatorios-visora" className="mb-10 scroll-mt-8">
            <Revelar className="mb-5 flex flex-col justify-between gap-2 sm:flex-row sm:items-end">
              <div>
                <h2 className="text-xl font-semibold text-[#273B31] dark:text-[#E5EDE5]">
                  Relatórios financeiros
                </h2>
                <p className="mt-1 text-sm text-[#788579] dark:text-[#B1BEB2]">
                  Gerados automaticamente a partir dos dados da sua empresa.
                </p>
              </div>

              <span className="flex items-center gap-2 text-sm text-[#788579] dark:text-[#B1BEB2]">
                <span className="v-ping relative h-2 w-2 rounded-full bg-[#588157]" />
                {relatorios.length} relatórios financeiros
              </span>
            </Revelar>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 2xl:grid-cols-3">
              {analises && relatorios.map((relatorio, indice) => {
                const Icone = relatorio.icone;

                return (
                  <Revelar key={relatorio.titulo} atraso={(indice % 3) * 100}>
                    <button
                      onClick={() => setRelatorioAberto(relatorio)}
                      onMouseMove={acompanharMouse}
                      className="v-spot group relative h-full w-full overflow-hidden rounded-2xl border border-[#DAD7CD]/80 bg-white/80 p-5 text-left transition duration-300 hover:-translate-y-1 hover:border-[#7E9971] hover:shadow-lg hover:shadow-[#344E41]/5 active:scale-[0.98] dark:border-[#344E41]/80 dark:bg-[#1C2920]/90 dark:hover:border-[#588157]"
                    >
                      <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-[#A3B18A]/10 transition-transform duration-500 group-hover:scale-150 dark:bg-[#588157]/10" />

                      <div className="relative flex items-start justify-between gap-3">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#E8EDE4] text-[#344E41] transition-all duration-300 group-hover:-rotate-6 group-hover:bg-[#344E41] group-hover:text-white dark:bg-[#293B2E] dark:text-[#A3B18A] dark:group-hover:bg-[#588157]">
                          <Icone size={22} strokeWidth={1.8} />
                        </div>

                        <span className="flex h-9 w-9 items-center justify-center rounded-full border border-[#DAD7CD] text-[#788579] transition-all duration-300 group-hover:rotate-12 group-hover:border-[#588157] group-hover:bg-[#E8EDE4] group-hover:text-[#344E41] dark:border-[#344E41] dark:text-[#B1BEB2] dark:group-hover:bg-[#293B2E] dark:group-hover:text-[#A3B18A]">
                          <ArrowUpRight size={17} />
                        </span>
                      </div>

                      <div className="relative mt-5">
                        <h3 className="font-semibold text-[#273B31] dark:text-[#E5EDE5]">
                          {relatorio.titulo}
                        </h3>

                        <p className="mt-1 text-sm text-[#66756A] dark:text-[#B1BEB2]">
                          {relatorio.descricao}
                        </p>

                        <div className="mt-4 flex items-center justify-between gap-2 border-t border-[#DAD7CD]/70 pt-3 text-xs text-[#89958B] dark:border-[#344E41] dark:text-[#91A093]">
                          <span className="flex items-center gap-2">
                            <Eye size={14} />
                            {relatorio.detalhe}
                          </span>

                          <span className="flex items-center gap-1.5">
                            <Clock3 size={12} />
                            {relatorio.atualizado}
                          </span>
                        </div>
                      </div>
                    </button>
                  </Revelar>
                );
              })}
            </div>
          </section>

          {/* Insights */}
          <Revelar className="mb-8">
            <section className="v-insight-painel transition-all duration-700 ease-out relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#273B31] via-[#344E41] to-[#588157] p-6 text-white shadow-lg shadow-[#344E41]/10 sm:p-8">
              <div className="v-flutuar pointer-events-none absolute -right-12 -top-20 h-64 w-64 rounded-full border border-white/10" />
              <div className="v-flutuar-2 pointer-events-none absolute -right-2 -top-10 h-44 w-44 rounded-full border border-white/10" />
              <div className="pointer-events-none absolute bottom-[-70px] right-[30%] h-48 w-48 rounded-full bg-[#A3B18A]/15 blur-3xl" />

              <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-white/15 bg-white/10">
                    <Sparkles size={23} className="animate-pulse" />
                  </div>

                  <div className="min-h-[120px]">
                    <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-[#C8D5B9]">
                      Visão inteligente
                    </p>

                    <div key={insightAtual} className="v-troca">
                      <h2 className="text-xl font-semibold sm:text-2xl">{insight.titulo}</h2>
                      <p className="mt-2 max-w-2xl text-sm leading-6 text-white/75">
                        {insight.texto}
                      </p>
                    </div>

                    <div className="mt-4 flex items-center gap-2">
                      {insights.map((_, i) => (
                        <button
                          key={i}
                          onClick={() => setInsightAtual(i)}
                          aria-label={`Ver insight ${i + 1}`}
                          className="h-1.5 w-10 overflow-hidden rounded-full bg-white/20"
                        >
                          {i === insightAtual && (
                            <span
                              key={insightAtual}
                              className="v-progresso block h-full w-full rounded-full bg-white/80"
                            />
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <button
                  onClick={() =>
                    document
                      .getElementById("relatorios-visora")
                      ?.scrollIntoView({ behavior: "smooth" })
                  }
                  onMouseDown={criarOndulacao}
                  className="v-ondulacao group flex shrink-0 items-center justify-center gap-2 self-start rounded-xl border border-white/25 bg-white/10 px-5 py-3 text-sm font-medium transition hover:bg-white/20 active:scale-95 lg:self-center"
                >
                  Explorar relatórios
                  <ArrowRight
                    size={17}
                    className="transition-transform duration-300 group-hover:translate-x-1"
                  />
                </button>
              </div>
            </section>
          </Revelar>

          {/* Rodapé */}
          <footer className="flex flex-col gap-2 border-t border-[#DAD7CD]/80 py-5 text-xs text-[#89958B] dark:border-[#344E41]/80 dark:text-[#91A093] sm:flex-row sm:items-center sm:justify-between">
            <p>Visora · Transforme dados em visão.</p>

            <p className="flex items-center gap-2">
              <Clock3 size={14} />
              Informações financeiras da sua empresa
            </p>
          </footer>
          </>)}
        </div>
      </main>

      {toast && (
        <div
          role="status"
          className="v-toast fixed bottom-6 right-6 z-[60] flex items-center gap-3 rounded-xl border border-[#DAD7CD] bg-white px-4 py-3 text-sm font-medium text-[#273B31] shadow-xl dark:border-[#344E41] dark:bg-[#1C2920] dark:text-[#E5EDE5]"
        >
          <CheckCircle2 size={18} className="text-[#588157] dark:text-[#A3B18A]" />
          {toast}
        </div>
      )}

      {/* Modal de prévia do relatório */}
      {relatorioAberto && (
        <div
          className="v-fundo fixed inset-0 z-50 flex items-center justify-center bg-[#111A14]/50 p-4 backdrop-blur-sm"
          onClick={() => setRelatorioAberto(null)}
          role="dialog"
          aria-modal="true"
          aria-label={`Prévia do relatório ${relatorioAberto.titulo}`}
        >
          <div
            className="v-painel relative w-full max-w-lg overflow-hidden rounded-2xl border border-[#DAD7CD] bg-white p-6 shadow-2xl dark:border-[#344E41] dark:bg-[#1C2920]"
            onClick={(evento) => evento.stopPropagation()}
          >
            <div className="pointer-events-none absolute -right-10 -top-10 h-36 w-36 rounded-full bg-[#A3B18A]/20 blur-2xl dark:bg-[#588157]/20" />

            <div className="relative flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#E8EDE4] text-[#344E41] dark:bg-[#293B2E] dark:text-[#A3B18A]">
                  {(() => {
                    const IconeModal = relatorioAberto.icone;
                    return <IconeModal size={22} strokeWidth={1.8} />;
                  })()}
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-[#273B31] dark:text-[#E5EDE5]">
                    {relatorioAberto.titulo}
                  </h3>
                  <p className="text-sm text-[#66756A] dark:text-[#B1BEB2]">
                    {relatorioAberto.descricao}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setRelatorioAberto(null)}
                aria-label="Fechar"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-[#DAD7CD] text-[#788579] transition hover:rotate-90 hover:bg-[#E8EDE4] dark:border-[#344E41] dark:text-[#B1BEB2] dark:hover:bg-[#293B2E]"
              >
                <X size={16} />
              </button>
            </div>

            <div className="relative mt-6 divide-y divide-[#DAD7CD]/70 dark:divide-[#344E41]">
              {relatorioAberto.linhas.map((linha, i) => (
                <div
                  key={linha.rotulo}
                  className={`v-linha-item flex items-center justify-between gap-4 py-3 ${
                    linha.destaque
                      ? "font-semibold text-[#273B31] dark:text-[#E5EDE5]"
                      : "text-[#66756A] dark:text-[#B1BEB2]"
                  }`}
                  style={{ "--atraso": `${150 + i * 90}ms` }}
                >
                  <span className="text-sm">{linha.rotulo}</span>
                  <span className="text-sm tabular-nums">{linha.valor}</span>
                </div>
              ))}
            </div>

            <div className="relative mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <span className="flex items-center gap-2 text-xs text-[#788579] dark:text-[#91A093]">
                <CheckCircle2 size={14} className="text-[#588157] dark:text-[#A3B18A]" />
                Referência: {periodo}
              </span>

              <button
                onClick={() => window.print()}
                className="flex items-center justify-center gap-2 rounded-xl bg-[#344E41] px-4 py-2.5 text-sm font-medium text-white transition hover:bg-[#273B31] active:scale-95 dark:bg-[#588157] dark:hover:bg-[#6B9469]"
              >
                <Download size={15} />
                Imprimir relatório
              </button>
            </div>

            <p className="relative mt-4 text-xs text-[#89958B] dark:text-[#91A093]">
              Este relatório considera os registros financeiros da sua empresa no período selecionado.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
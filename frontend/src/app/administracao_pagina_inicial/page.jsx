"use client";

import { useState } from "react";
import {
  LayoutDashboard,
  Users,
  ShoppingBag,
  ChartNoAxesCombined,
  Wallet,
  Bell,
  Search,
  Menu,
  X,
  ArrowUpRight,
  ArrowDownRight,
  ReceiptText,
  Package,
  Settings,
  Leaf,
  ChevronDown,
  CalendarDays,
  CircleHelp,
} from "lucide-react";


const indicadores = [
  {
    titulo: "Faturamento total",
    valor: "R$ 48.250,00",
    variacao: "+12,8%",
    descricao: "em relação ao mês anterior",
    positivo: true,
    Icone: Wallet,
  },
  {
    titulo: "Total de clientes",
    valor: "1.284",
    variacao: "+8,2%",
    descricao: "em relação ao mês anterior",
    positivo: true,
    Icone: Users,
  },
  {
    titulo: "Pedidos realizados",
    valor: "356",
    variacao: "+5,4%",
    descricao: "em relação ao mês anterior",
    positivo: true,
    Icone: ShoppingBag,
  },
  {
    titulo: "Crescimento",
    valor: "18,5%",
    variacao: "-2,1%",
    descricao: "em relação ao mês anterior",
    positivo: false,
    Icone: ChartNoAxesCombined,
  },
];

const meses = [
  { mes: "Jan", valor: 35 },
  { mes: "Fev", valor: 48 },
  { mes: "Mar", valor: 40 },
  { mes: "Abr", valor: 60 },
  { mes: "Mai", valor: 52 },
  { mes: "Jun", valor: 72 },
  { mes: "Jul", valor: 64 },
  { mes: "Ago", valor: 84 },
  { mes: "Set", valor: 70 },
  { mes: "Out", valor: 95 },
  { mes: "Nov", valor: 78 },
  { mes: "Dez", valor: 100 },
];

const movimentacoes = [
  {
    pedido: "#1024",
    cliente: "Mariana Costa",
    data: "29/10/2026",
    valor: "R$ 850,00",
    status: "Concluído",
  },
  {
    pedido: "#1023",
    cliente: "Pedro Almeida",
    data: "28/10/2026",
    valor: "R$ 420,00",
    status: "Pendente",
  },
  {
    pedido: "#1022",
    cliente: "Ana Oliveira",
    data: "28/10/2026",
    valor: "R$ 1.200,00",
    status: "Concluído",
  },
  {
    pedido: "#1021",
    cliente: "Lucas Santos",
    data: "27/10/2026",
    valor: "R$ 630,00",
    status: "Cancelado",
  },
  {
    pedido: "#1020",
    cliente: "Camila Souza",
    data: "26/10/2026",
    valor: "R$ 975,00",
    status: "Concluído",
  },
];

const menu = [
  { nome: "Visão geral", Icone: LayoutDashboard },
  { nome: "Clientes", Icone: Users },
  { nome: "Pedidos", Icone: ShoppingBag },
  { nome: "Produtos", Icone: Package },
  { nome: "Relatórios", Icone: ChartNoAxesCombined },
];

export default function PaginaInicial() {
  const [menuAberto, setMenuAberto] = useState(false);
  const [paginaAtiva, setPaginaAtiva] = useState("Visão geral");
  const [periodo, setPeriodo] = useState("Este ano");
  const [busca, setBusca] = useState("");

  const pedidosFiltrados = movimentacoes.filter((item) =>
    `${item.pedido} ${item.cliente} ${item.status}`
      .toLowerCase()
      .includes(busca.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#f5f8f5] text-[#24372b]">
      {/* Menu lateral */}

      {/* Conteúdo principal */}
      <div className="min-h-screen lg:pl-64">
        {/* Barra superior */}
        <header className="sticky top-0 z-30 flex h-[76px] items-center justify-between border-b border-[#e4ebe4] bg-white/95 px-4 backdrop-blur sm:px-8">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMenuAberto(true)}
              className="rounded-lg p-2 hover:bg-[#f1f5f1] lg:hidden"
              aria-label="Abrir menu"
            >
              <Menu size={22} />
            </button>

            <div>
              <p className="text-sm font-semibold">{paginaAtiva}</p>
              <p className="hidden text-xs text-[#89958b] sm:block">
                Quinta-feira, 29 de outubro de 2026
              </p>
            </div>
          </div>

        </header>

        <main className="mx-auto max-w-[1600px] space-y-7 p-4 sm:p-8">
          {/* Introdução */}
          <section className="flex flex-col justify-between gap-5 md:flex-row md:items-center">
            <div>
              <p className="mb-2 flex items-center gap-2 text-sm font-medium text-[#176b45]">
                <span className="h-2 w-2 rounded-full bg-[#36a66a]" />
                PAINEL GERAL / VISÃO GERAL
              </p>

              <h2 className="text-2xl font-bold tracking-tight text-[#183d2b] sm:text-3xl">
                Bem-vindo, Léo!
              </h2>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-[#748176] sm:text-base">
                Acompanhe o desempenho da sua empresa e tome decisões com mais
                inteligência. Confira os principais indicadores do seu negócio
                em um só lugar.
              </p>
            </div>

            <button className="flex w-fit items-center gap-2 rounded-lg border border-[#dce5dc] bg-white px-4 py-2.5 text-sm font-medium text-[#526356] transition hover:border-[#176b45]">
              <CalendarDays size={17} />
              Outubro de 2026
              <ChevronDown size={16} />
            </button>
          </section>

          {/* Informações rápidas */}
          <section>
            <div className="mb-4">
              <h3 className="font-semibold text-[#24372b]">
                Resumo da empresa
              </h3>
              <p className="mt-1 text-sm text-[#89958b]">
                Confira os principais números do seu negócio.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {indicadores.map((item) => {
                const Icone = item.Icone;
                const VariacaoIcone = item.positivo
                  ? ArrowUpRight
                  : ArrowDownRight;

                return (
                  <article
                    key={item.titulo}
                    className="rounded-xl border border-[#e5ebe5] bg-white p-5 transition hover:border-[#c5dac9]"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-[#edf5ee] text-[#176b45]">
                        <Icone size={21} strokeWidth={1.8} />
                      </div>

                      <span
                        className={`flex items-center gap-1 rounded-md px-2 py-1 text-xs font-semibold ${
                          item.positivo
                            ? "bg-[#edf8ef] text-[#21834b]"
                            : "bg-[#fff1ed] text-[#c25d45]"
                        }`}
                      >
                        <VariacaoIcone size={14} />
                        {item.variacao}
                      </span>
                    </div>

                    <p className="mt-5 text-sm text-[#748176]">
                      {item.titulo}
                    </p>

                    <h3 className="mt-1 text-2xl font-bold tracking-tight text-[#24372b]">
                      {item.valor}
                    </h3>

                    <p className="mt-2 text-xs text-[#98a198]">
                      {item.descricao}
                    </p>
                  </article>
                );
              })}
            </div>
          </section>

          {/* Gráficos */}
          <section className="grid grid-cols-1 gap-5 xl:grid-cols-3">
            {/* Gráfico de barras */}
            <article className="rounded-xl border border-[#e5ebe5] bg-white p-5 sm:p-6 xl:col-span-2">
              <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
                <div>
                  <h3 className="font-semibold text-[#24372b]">
                    Visão financeira
                  </h3>
                  <p className="mt-1 text-sm text-[#89958b]">
                    Evolução do faturamento ao longo do ano.
                  </p>
                </div>

                <select
                  value={periodo}
                  onChange={(e) => setPeriodo(e.target.value)}
                  className="rounded-lg border border-[#e1e9e1] bg-white px-3 py-2 text-sm text-[#526356] outline-none focus:border-[#176b45]"
                  aria-label="Período do gráfico"
                >
                  <option>Este ano</option>
                  <option>Últimos 6 meses</option>
                  <option>Últimos 3 meses</option>
                </select>
              </div>

              <div className="mt-7 flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-sm bg-[#218653]" />
                <span className="text-xs text-[#748176]">Faturamento</span>
              </div>

              <div className="mt-5 flex h-56">
                <div className="flex flex-col justify-between pb-7 pr-3 text-right text-[10px] text-[#98a198] sm:text-xs">
                  <span>R$ 50 mil</span>
                  <span>R$ 40 mil</span>
                  <span>R$ 30 mil</span>
                  <span>R$ 20 mil</span>
                  <span>R$ 10 mil</span>
                </div>

                <div className="relative flex flex-1 items-end justify-between gap-1 border-b border-[#e7eee7] pb-0">
                  <div className="pointer-events-none absolute inset-0 bottom-7 flex flex-col justify-between">
                    {[1, 2, 3, 4, 5].map((linha) => (
                      <div
                        key={linha}
                        className="w-full border-t border-dashed border-[#edf1ed]"
                      />
                    ))}
                  </div>

                  {meses.map((item) => (
                    <div
                      key={item.mes}
                      className="relative z-10 flex h-full min-w-0 flex-1 flex-col items-center justify-end gap-2"
                    >
                      <div
                        title={`${item.mes}: ${item.valor}% da escala`}
                        className={`w-full max-w-8 rounded-t-sm transition-colors hover:bg-[#176b45] ${
                          item.mes === "Out"
                            ? "bg-[#176b45]"
                            : "bg-[#b7d8bf]"
                        }`}
                        style={{ height: `${item.valor * 0.85}%` }}
                      />
                      <span className="text-[9px] text-[#89958b] sm:text-xs">
                        {item.mes}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <p className="mt-4 text-xs text-[#98a198]">
                Dados ilustrativos para demonstração da interface.
              </p>
            </article>

            {/* Gráfico de distribuição */}
            <article className="rounded-xl border border-[#e5ebe5] bg-white p-5 sm:p-6">
              <h3 className="font-semibold text-[#24372b]">
                Distribuição de pedidos
              </h3>
              <p className="mt-1 text-sm text-[#89958b]">
                Situação dos pedidos cadastrados.
              </p>

              <div className="flex justify-center py-7">
                <div
                  className="relative flex h-40 w-40 items-center justify-center rounded-full"
                  style={{
                    background:
                      "conic-gradient(#218653 0% 65%, #e9b45e 65% 85%, #d9e5da 85% 100%)",
                  }}
                >
                  <div className="flex h-28 w-28 flex-col items-center justify-center rounded-full bg-white">
                    <span className="text-3xl font-bold text-[#24372b]">
                      356
                    </span>
                    <span className="text-xs text-[#89958b]">
                      Total de pedidos
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                {[
                  {
                    nome: "Concluídos",
                    quantidade: "65%",
                    cor: "bg-[#218653]",
                  },
                  {
                    nome: "Pendentes",
                    quantidade: "20%",
                    cor: "bg-[#e9b45e]",
                  },
                  {
                    nome: "Cancelados",
                    quantidade: "15%",
                    cor: "bg-[#d9e5da]",
                  },
                ].map((item) => (
                  <div
                    key={item.nome}
                    className="flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className={`h-2.5 w-2.5 rounded-sm ${item.cor}`}
                      />
                      <span className="text-sm text-[#647568]">
                        {item.nome}
                      </span>
                    </div>
                    <span className="text-sm font-semibold text-[#24372b]">
                      {item.quantidade}
                    </span>
                  </div>
                ))}
              </div>
            </article>
          </section>

          {/* Tabela de movimentações */}
          <section className="overflow-hidden rounded-xl border border-[#e5ebe5] bg-white">
            <div className="flex flex-col justify-between gap-4 p-5 sm:flex-row sm:items-center sm:p-6">
              <div>
                <h3 className="font-semibold text-[#24372b]">
                  Últimas movimentações
                </h3>
                <p className="mt-1 text-sm text-[#89958b]">
                  Acompanhe os pedidos recentes da empresa.
                </p>
              </div>

              <div className="relative w-full sm:max-w-xs">
                <Search
                  size={17}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-[#98a198]"
                />
                <input
                  value={busca}
                  onChange={(e) => setBusca(e.target.value)}
                  placeholder="Buscar pedido ou cliente..."
                  className="w-full rounded-lg border border-[#e1e9e1] py-2.5 pl-9 pr-3 text-sm outline-none transition placeholder:text-[#a1aaa2] focus:border-[#176b45]"
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[700px] border-collapse text-left">
                <thead>
                  <tr className="border-y border-[#edf1ed] bg-[#f8faf8] text-xs font-medium uppercase tracking-wide text-[#89958b]">
                    <th className="px-6 py-4">Pedido</th>
                    <th className="px-6 py-4">Cliente</th>
                    <th className="px-6 py-4">Data</th>
                    <th className="px-6 py-4">Valor</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4">Detalhes</th>
                  </tr>
                </thead>

                <tbody>
                  {pedidosFiltrados.map((item) => (
                    <tr
                      key={item.pedido}
                      className="border-b border-[#edf1ed] last:border-b-0 hover:bg-[#fafcf9]"
                    >
                      <td className="px-6 py-4 text-sm font-semibold text-[#176b45]">
                        {item.pedido}
                      </td>
                      <td className="px-6 py-4 text-sm text-[#526356]">
                        {item.cliente}
                      </td>
                      <td className="px-6 py-4 text-sm text-[#748176]">
                        {item.data}
                      </td>
                      <td className="px-6 py-4 text-sm font-semibold text-[#24372b]">
                        {item.valor}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex rounded-md px-2.5 py-1 text-xs font-medium ${
                            item.status === "Concluído"
                              ? "bg-[#edf8ef] text-[#21834b]"
                              : item.status === "Pendente"
                                ? "bg-[#fff5e5] text-[#a66c13]"
                                : "bg-[#fff0ed] text-[#bd5945]"
                          }`}
                        >
                          {item.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() =>
                            alert(
                              `Pedido ${item.pedido}\nCliente: ${item.cliente}\nValor: ${item.valor}\nStatus: ${item.status}`
                            )
                          }
                          className="rounded-md p-2 text-[#748176] hover:bg-[#edf5ee] hover:text-[#176b45]"
                          aria-label={`Ver pedido ${item.pedido}`}
                        >
                          <ReceiptText size={18} />
                        </button>
                      </td>
                    </tr>
                  ))}

                  {pedidosFiltrados.length === 0 && (
                    <tr>
                      <td
                        colSpan={6}
                        className="px-6 py-10 text-center text-sm text-[#89958b]"
                      >
                        Nenhum pedido encontrado.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="flex flex-col justify-between gap-2 border-t border-[#edf1ed] px-6 py-4 sm:flex-row sm:items-center">
              <p className="text-xs text-[#89958b]">
                Exibindo {pedidosFiltrados.length} de {movimentacoes.length}{" "}
                pedidos fictícios
              </p>

              <button className="flex items-center gap-2 text-sm font-semibold text-[#176b45] hover:underline">
                Ver todos os pedidos
                <ArrowUpRight size={16} />
              </button>
            </div>
          </section>

        </main>
      </div>

      

      {/* Fundo do menu no celular */}
      {menuAberto && (
        <button
          onClick={() => setMenuAberto(false)}
          className="fixed inset-0 z-40 bg-black/30 lg:hidden"
          aria-label="Fechar menu lateral"
        />
      )}
    </div>
  );
}
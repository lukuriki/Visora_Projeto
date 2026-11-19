"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import SidebarPlataforma from "@/components/SidebarPlataforma";
import FooterPlataforma from "@/components/FooterPlataforma";

import {
  X,
  Send,
  ChevronRight,
  GitCompareArrows,
  Activity,
  Tags,
  TrendingUp,
  ClipboardList,
  Search,
  Filter,
  Eye,
  MessageCircle,
  Sparkles,
  CheckCircle2,
  Clock,
  AlertTriangle,
  FileText,
  ArrowRight,
  Calendar,
  User,
  ShieldAlert,
  Bot,
} from "lucide-react";

export default function Page() {
  const [collapsed, setCollapsed] = useState(false);
  const reduzirMovimento = useReducedMotion();
  const entrada = (atraso = 0) => reduzirMovimento ? {} : { initial: { opacity: 0, y: 18 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true, amount: 0.12 }, transition: { duration: 0.55, delay: atraso, ease: "easeOut" } };
  const [chatAberto, setChatAberto] = useState(false);
  const [mensagem, setMensagem] = useState("");
  const [mensagensChat, setMensagensChat] = useState([
    {
      id: 1,
      remetente: "ia",
      texto:
        "Olá! Sou a Visora AI. Selecione qualquer ocorrência na tabela e clique em 'Analisar com Visora AI', ou digite sua dúvida abaixo.",
      hora: "Agora",
    },
  ]);

  const [busca, setBusca] = useState("");
  const [filtro, setFiltro] = useState("Todos");
  const [ocorrenciaSelecionada, setOcorrenciaSelecionada] = useState(null);

  const [ocorrencias, setOcorrencias] = useState([
    {
      tipo: "Divergência",
      registro: "#REG-1024",
      descricao: "Valor registrado diferente do documento original.",
      gravidade: "Alta",
      status: "Pendente",
      dataHora: "19/11/2026 às 09:42",
      responsavel: "Carlos Mendes",
      valorRegistrado: "R$ 14.850,00",
      valorEsperado: "R$ 12.400,00 (NF-e #8821)",
      contextoTecnico:
        "Diferença de R$ 2.450,00 entre o lançamento no ERP e o XML da NF-e vinculada.",
    },
    {
      tipo: "Movimentação incomum",
      registro: "#REG-1038",
      descricao: "Movimentação realizada fora do horário habitual.",
      gravidade: "Alta",
      status: "Em análise",
      dataHora: "19/11/2026 às 02:17",
      responsavel: "Sistema / API Integração",
      valorRegistrado: "Transferência de 450 itens",
      valorEsperado: "Operações entre 08:00 e 19:00",
      contextoTecnico:
        "Baixa de estoque executada de madrugada sem histórico semelhante nos últimos 6 meses.",
    },
    {
      tipo: "Classificação inconsistente",
      registro: "#REG-1052",
      descricao: "Categoria atribuída não corresponde ao conteúdo.",
      gravidade: "Média",
      status: "Resolvido",
      dataHora: "18/11/2026 às 16:10",
      responsavel: "Mariana Costa",
      valorRegistrado: "Material de Escritório (Cat. 102)",
      valorEsperado: "Equipamentos de TI (Cat. 405)",
      contextoTecnico:
        "Item descrito como 'Monitores LED 27 pol.' alocado no centro de custos de papelaria.",
    },
    {
      tipo: "Alteração fora do padrão",
      registro: "#REG-1061",
      descricao: "Modificação incompatível com o histórico do registro.",
      gravidade: "Média",
      status: "Pendente",
      dataHora: "18/11/2026 às 14:35",
      responsavel: "Roberto Almeida",
      valorRegistrado: "Desconto aplicado: 38%",
      valorEsperado: "Limite histórico: até 15%",
      contextoTecnico:
        "Desconto concedido supera em 23% a média aprovada sem registro de alçada superior.",
    },
    {
      tipo: "Divergência",
      registro: "#REG-1070",
      descricao: "Informações inconsistentes entre dois documentos.",
      gravidade: "Alta",
      status: "Em análise",
      dataHora: "18/11/2026 às 11:20",
      responsavel: "Fernanda Lima",
      valorRegistrado: "CNPJ: 12.345.678/0001-90",
      valorEsperado: "CNPJ Contrato: 12.345.678/0002-71",
      contextoTecnico:
        "Faturamento emitido contra filial 0002, porém o contrato vigente pertence à matriz (0001).",
    },
    {
      tipo: "Movimentação incomum",
      registro: "#REG-1084",
      descricao: "Volume de movimentações acima da média registrada.",
      gravidade: "Média",
      status: "Pendente",
      dataHora: "17/11/2026 às 17:50",
      responsavel: "Lucas Ferreira",
      valorRegistrado: "18 lançamentos seguidos",
      valorEsperado: "Média de 3 lançamentos/hora",
      contextoTecnico:
        "Pico de 600% na frequência de edições em 12 minutos pelo mesmo usuário.",
    },
  ]);

  const ocorrenciasFiltradas = ocorrencias.filter((item) => {
    const correspondeBusca =
      item.tipo.toLowerCase().includes(busca.toLowerCase()) ||
      item.registro.toLowerCase().includes(busca.toLowerCase()) ||
      item.descricao.toLowerCase().includes(busca.toLowerCase());

    const correspondeFiltro = filtro === "Todos" || item.tipo === filtro;

    return correspondeBusca && correspondeFiltro;
  });

  const atualizarStatus = (registro, novoStatus) => {
    setOcorrencias((prev) =>
      prev.map((item) =>
        item.registro === registro ? { ...item, status: novoStatus } : item
      )
    );
    if (ocorrenciaSelecionada && ocorrenciaSelecionada.registro === registro) {
      setOcorrenciaSelecionada({
        ...ocorrenciaSelecionada,
        status: novoStatus,
      });
    }
  };

  // Função central de envio para o Chat (onde vocês conectarão o Gemini)
  const enviarMensagem = (textoCustomizado) => {
    const textoParaEnviar =
      typeof textoCustomizado === "string" ? textoCustomizado : mensagem;

    if (!textoParaEnviar.trim()) return;

    const horaAtual = new Date().toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
    });

    const novaMsgUsuario = {
      id: Date.now(),
      remetente: "usuario",
      texto: textoParaEnviar,
      hora: horaAtual,
    };

    setMensagensChat((prev) => [...prev, novaMsgUsuario]);

    if (typeof textoCustomizado !== "string") {
      setMensagem("");
    }

    // 👉 AQUI VOCÊS CHAMAM A FUNÇÃO DO GEMINI DE VOCÊS PASSANDO `textoParaEnviar`
  };

  // Abre o chat e já envia o contexto completo da ocorrência selecionada para o Gemini
  const analisarOcorrenciaNoChat = (ocorrencia) => {
    const promptContexto = `Analise a ocorrência ${ocorrencia.registro} (${ocorrencia.tipo} - Gravidade ${ocorrencia.gravidade}):
• Problema: ${ocorrencia.descricao}
• Encontrado: ${ocorrencia.valorRegistrado}
• Esperado: ${ocorrencia.valorEsperado}
• Detalhes: ${ocorrencia.contextoTecnico}

Quais são as possíveis causas e o que devo verificar para resolver?`;

    setOcorrenciaSelecionada(null);
    setChatAberto(true);
    enviarMensagem(promptContexto);
  };

  const toggleFiltroCard = (tipoCard) => {
    setFiltro((prev) => (prev === tipoCard ? "Todos" : tipoCard));
  };

  return (
    <>
      <SidebarPlataforma collapsed={collapsed} setCollapsed={setCollapsed} />

      <main className={`relative isolate min-h-screen min-w-0 overflow-hidden bg-[#F8F9F6] text-[#273B31] transition-[margin] duration-300 dark:bg-[#111A14] dark:text-[#E5EDE5] ${collapsed ? "ml-[82px]" : "ml-[270px]"}`}>
        {/* Fundo atmosférico: auroras suaves + grade discreta */}
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute inset-0 bg-[linear-gradient(135deg,#F8F9F6_0%,#EFF4EB_48%,#F8F9F6_100%)] dark:bg-[linear-gradient(135deg,#111A14_0%,#17271B_52%,#111A14_100%)]" />
          <div className="absolute inset-0 opacity-[0.16] dark:opacity-[0.09]" style={{ backgroundImage: "linear-gradient(to right, #7E9971 1px, transparent 1px), linear-gradient(to bottom, #7E9971 1px, transparent 1px)", backgroundSize: "52px 52px", maskImage: "linear-gradient(to bottom, black, transparent 85%)" }} />
          <div className="visora-aura-a absolute -top-32 -right-36 h-[560px] w-[560px] rounded-full bg-[#A3B18A]/35 blur-[100px] dark:bg-[#588157]/20" />
          <div className="visora-aura-b absolute top-[440px] -left-44 h-[500px] w-[500px] rounded-full bg-[#7E9971]/20 blur-[110px] dark:bg-[#3A5A40]/25" />
          <div className="visora-aura-a absolute bottom-16 right-0 h-[460px] w-[460px] rounded-full bg-[#A3B18A]/20 blur-[110px] dark:bg-[#588157]/15" />
        </div>
        {/* ================= MODAL DE DETALHES DA OCORRÊNCIA ================= */}
        {ocorrenciaSelecionada && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/50 p-4 backdrop-blur-xs"
            onClick={() => setOcorrenciaSelecionada(null)}
          >
            <div
              className="w-full max-w-2xl overflow-hidden rounded-2xl border border-[#DAD7CD] dark:border-[#34483A] bg-white dark:bg-[#1C2920] shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Cabeçalho do Modal */}
              <div className="flex items-start justify-between border-b border-[#E5E9E1] dark:border-[#34483A] bg-[#F2F2F2]/80 dark:bg-[#18251C]/90 px-6 py-5">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-[#DAD7CD] bg-[#EDF2EA] text-[#3A5A40] dark:border-[#34483A] dark:bg-[#273B31] dark:text-[#A3B18A]">
                    {ocorrenciaSelecionada.tipo === "Divergência" ? <GitCompareArrows size={22} /> : ocorrenciaSelecionada.tipo === "Movimentação incomum" ? <Activity size={22} /> : ocorrenciaSelecionada.tipo === "Classificação inconsistente" ? <Tags size={22} /> : <TrendingUp size={22} />}
                  </div>
                  <div>
                    <div className="flex items-center gap-2.5">
                      <span className="text-lg font-bold text-[#273B31] dark:text-[#E5EDE5]">
                        {ocorrenciaSelecionada.registro}
                      </span>
                      <span
                        className={`rounded-lg px-2.5 py-0.5 text-xs font-semibold ${
                          ocorrenciaSelecionada.gravidade === "Alta"
                            ? "border border-[#D6B7A8] bg-[#F8EEE9] text-[#87513E] dark:border-[#80594A] dark:bg-[#3B2B25] dark:text-[#E6B6A0]"
                            : "border border-[#DAD7CD] bg-[#EDF2EA] text-[#526E51] dark:border-[#455C48] dark:bg-[#273B31] dark:text-[#B9CDAE]"
                        }`}
                      >
                        Gravidade {ocorrenciaSelecionada.gravidade}
                      </span>
                    </div>
                    <p className="text-sm font-medium text-[#6A7C70] dark:text-[#A3B18A]">
                      {ocorrenciaSelecionada.tipo}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setOcorrenciaSelecionada(null)}
                  className="rounded-lg p-2 text-[#859488] dark:text-[#91A696] transition hover:bg-[#E8EDE5]/70 dark:hover:bg-[#34483A] hover:text-[#344E41] dark:text-[#DAD7CD]"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Corpo do Modal */}
              <div className="max-h-[75vh] space-y-6 overflow-y-auto p-6">
                {/* Resumo da Falha */}
                <div>
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-[#859488] dark:text-[#91A696]">
                    Resumo da Inconsistência
                  </h3>
                  <p className="mt-1.5 text-base font-medium text-[#273B31] dark:text-[#E5EDE5]">
                    {ocorrenciaSelecionada.descricao}
                  </p>
                  <p className="mt-1 text-sm text-[#6A7C70] dark:text-[#A3B18A]">
                    {ocorrenciaSelecionada.contextoTecnico}
                  </p>
                </div>

                {/* Comparativo Visual (Encontrado vs Esperado) */}
                <div className="grid grid-cols-1 gap-3 rounded-xl border border-[#DAD7CD] dark:border-[#34483A] bg-[#F2F2F2]/70 dark:bg-[#18251C]/80 p-4 sm:grid-cols-[1fr_auto_1fr] sm:items-center">
                  <div className="rounded-lg border border-red-200 bg-white dark:bg-[#1C2920] p-3.5 shadow-2xs">
                    <span className="flex items-center gap-1.5 text-xs font-semibold text-red-600">
                      <AlertTriangle size={14} />
                      Identificado no Sistema
                    </span>
                    <p className="mt-1.5 text-sm font-semibold text-[#273B31] dark:text-[#E5EDE5]">
                      {ocorrenciaSelecionada.valorRegistrado}
                    </p>
                  </div>

                  <div className="flex rotate-90 justify-center text-[#859488] dark:text-[#91A696] sm:rotate-0">
                    <ArrowRight size={20} />
                  </div>

                  <div className="rounded-lg border border-[#A3B18A] dark:border-[#588157] bg-white dark:bg-[#1C2920] p-3.5 shadow-2xs">
                    <span className="flex items-center gap-1.5 text-xs font-semibold text-[#588157]">
                      <CheckCircle2 size={14} />
                      Padrão / Documento Base
                    </span>
                    <p className="mt-1.5 text-sm font-semibold text-[#273B31] dark:text-[#E5EDE5]">
                      {ocorrenciaSelecionada.valorEsperado}
                    </p>
                  </div>
                </div>

                {/* Chamada para Análise no Chat Visora AI (Gemini) */}
                <div className="flex flex-col justify-between gap-4 rounded-xl border border-[#A3B18A] dark:border-[#588157] bg-gradient-to-r from-[#E5EDE5]/90 dark:from-[#273B31] to-[#A3B18A]/20 dark:to-[#1C2920] p-4 sm:flex-row sm:items-center">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-sm font-bold text-[#588157]">
                      <Bot size={18} />
                      <span>Investigar com a Visora AI</span>
                    </div>
                    <p className="text-xs leading-relaxed text-[#53665A] dark:text-[#B7C9B8]">
                      Envie os dados deste registro para o chat e peça causas prováveis ou passos de correção.
                    </p>
                  </div>

                  <button
                    onClick={() =>
                      analisarOcorrenciaNoChat(ocorrenciaSelecionada)
                    }
                    className="flex shrink-0 items-center justify-center gap-2 rounded-xl bg-[#588157] px-4 py-2.5 text-xs font-semibold text-white shadow-sm transition hover:bg-[#344E41]"
                  >
                    <Sparkles size={15} />
                    Analisar no Chat
                  </button>
                </div>

                {/* Metadados */}
                <div className="grid grid-cols-1 gap-4 border-t border-[#E5E9E1] dark:border-[#34483A] pt-4 text-sm sm:grid-cols-2">
                  <div className="flex items-center gap-2.5 text-[#53665A] dark:text-[#B7C9B8]">
                    <Calendar size={16} className="text-[#859488] dark:text-[#91A696]" />
                    <span>
                      <strong className="font-medium text-[#273B31] dark:text-[#E5EDE5]">Data:</strong>{" "}
                      {ocorrenciaSelecionada.dataHora}
                    </span>
                  </div>
                  <div className="flex items-center gap-2.5 text-[#53665A] dark:text-[#B7C9B8]">
                    <User size={16} className="text-[#859488] dark:text-[#91A696]" />
                    <span>
                      <strong className="font-medium text-[#273B31] dark:text-[#E5EDE5]">
                        Origem:
                      </strong>{" "}
                      {ocorrenciaSelecionada.responsavel}
                    </span>
                  </div>
                </div>
              </div>

              {/* Rodapé com Ações de Status */}
              <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#E5E9E1] dark:border-[#34483A] bg-[#F2F2F2] dark:bg-[#18251C] px-6 py-4">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-[#6A7C70] dark:text-[#A3B18A]">
                    Status:
                  </span>
                  <div className="flex rounded-lg border border-[#DAD7CD] dark:border-[#34483A] bg-white dark:bg-[#1C2920] p-1">
                    {["Pendente", "Em análise", "Resolvido"].map((st) => (
                      <button
                        key={st}
                        onClick={() =>
                          atualizarStatus(ocorrenciaSelecionada.registro, st)
                        }
                        className={`rounded-md px-2.5 py-1 text-xs font-medium transition ${
                          ocorrenciaSelecionada.status === st
                            ? st === "Resolvido"
                              ? "bg-[#588157] text-white dark:bg-[#3A5A40]"
                              : st === "Em análise"
                              ? "bg-[#3A5A40] text-white"
                              : "bg-[#7E9971] text-[#111A14]"
                            : "text-[#53665A] dark:text-[#B7C9B8] hover:bg-[#E8EDE5] dark:hover:bg-[#34483A]"
                        }`}
                      >
                        {st}
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  onClick={() => setOcorrenciaSelecionada(null)}
                  className="rounded-xl border border-[#DAD7CD] dark:border-[#34483A] bg-white dark:bg-[#1C2920] px-4 py-2 text-sm font-medium text-[#344E41] dark:text-[#DAD7CD] transition hover:bg-[#E8EDE5] dark:hover:bg-[#34483A]"
                >
                  Fechar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ================= CHAT VISORA AI ================= */}
        {!chatAberto && (
          <button
            onClick={() => setChatAberto(true)}
            className="fixed bottom-4 right-4 z-40 flex h-14 items-center gap-2.5 rounded-2xl bg-[#588157] px-5 text-white shadow-lg shadow-green-950/25 transition-all duration-300 hover:scale-105 hover:bg-[#344E41]"
            title="Abrir Visora AI"
          >
            <MessageCircle size={23} />
            <span className="text-sm font-medium">Visora AI</span>
          </button>
        )}

        {chatAberto && (
          <div className="fixed bottom-4 right-4 z-50 flex h-[min(540px,calc(100dvh-32px))] w-[410px] max-w-[calc(100vw-32px)] flex-col overflow-hidden rounded-2xl border border-[#DAD7CD] dark:border-[#34483A] bg-white dark:bg-[#1C2920] shadow-2xl shadow-gray-900/20">
            <div className="flex items-center justify-between bg-gradient-to-r from-[#588157] to-[#344E41] px-5 py-4">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/15 text-white">
                  <Sparkles size={19} />
                </div>
                <div>
                  <h2 className="font-semibold text-white">Visora AI</h2>
                  <p className="flex items-center gap-1.5 text-xs text-green-100">
                    <Sparkles size={12} />
                    Assistente de Auditoria • Integração pendente
                  </p>
                </div>
              </div>

              <button
                onClick={() => setChatAberto(false)}
                className="rounded-lg p-2 text-white/80 transition hover:bg-white/15 hover:text-white"
              >
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 space-y-4 overflow-y-auto bg-[#F2F2F2]/80 dark:bg-[#18251C]/90 p-4">
              {mensagensChat.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex flex-col ${
                    msg.remetente === "usuario" ? "items-end" : "items-start"
                  }`}
                >
                  <div
                    className={`max-w-[88%] whitespace-pre-line rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-2xs ${
                      msg.remetente === "usuario"
                        ? "rounded-tr-xs bg-[#588157] text-white dark:bg-[#3A5A40]"
                        : "rounded-tl-xs border border-[#DAD7CD] dark:border-[#34483A] bg-white dark:bg-[#1C2920] text-[#344E41] dark:text-[#DAD7CD]"
                    }`}
                  >
                    {msg.texto}
                  </div>
                  <span className="mt-1 px-1 text-[11px] text-[#859488] dark:text-[#91A696]">
                    {msg.hora}
                  </span>
                </div>
              ))}
            </div>

            <div className="border-t border-[#E5E9E1] dark:border-[#34483A] bg-white dark:bg-[#1C2920] p-3.5">
              <div className="flex items-center gap-2 rounded-xl border border-[#DAD7CD] dark:border-[#34483A] bg-[#F2F2F2] dark:bg-[#18251C] p-1.5 transition focus-within:border-[#588157] focus-within:bg-white dark:bg-[#1C2920]">
                <input
                  type="text"
                  value={mensagem}
                  onChange={(e) => setMensagem(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") enviarMensagem();
                  }}
                  placeholder="Pergunte sobre um registro..."
                  className="h-9 min-w-0 flex-1 bg-transparent px-2.5 text-sm text-[#344E41] dark:text-[#DAD7CD] outline-none placeholder:text-[#859488] dark:text-[#91A696]"
                />

                <button
                  onClick={() => enviarMensagem()}
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#588157] text-white dark:bg-[#3A5A40] transition hover:bg-[#344E41]"
                  title="Enviar mensagem"
                >
                  <Send size={16} />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ================= CABEÇALHO ================= */}
        <motion.header {...entrada(0)} className="relative overflow-hidden border-b border-[#DAD7CD]/70 bg-white px-6 py-8 dark:border-[#34483A] dark:bg-[#1C2920] sm:px-8">
          <div className="pointer-events-none absolute inset-y-0 right-0 w-2/3 bg-gradient-to-l from-[#A3B18A]/20 via-[#A3B18A]/5 to-transparent dark:from-[#588157]/20 dark:via-[#588157]/5" />
          <div className="relative flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <div className="mb-3 flex items-center gap-2 text-sm font-medium text-[#7E9971] dark:text-[#A3B18A]">
                <span>Plataforma</span>
                <ChevronRight size={14} />
                <span>Auditoria</span>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-3xl font-bold tracking-tight text-[#273B31] dark:text-[#E5EDE5] sm:text-4xl lg:text-5xl">
                  Auditoria de <span className="bg-gradient-to-r from-[#588157] via-[#3A5A40] to-[#344E41] bg-clip-text text-transparent dark:from-[#A3B18A] dark:via-[#7E9971] dark:to-[#588157]">Registros</span>
                </h1>
              
              </div>
              <p className="mt-3 max-w-2xl text-sm leading-relaxed text-[#6A7C70] dark:text-[#A3B18A]">
                Acompanhe inconsistências, anomalias e atividades identificadas pela auditoria inteligente.
              </p>
            </div>
            {filtro !== "Todos" && (
              <button onClick={() => setFiltro("Todos")} className="flex shrink-0 items-center gap-2 self-start rounded-xl border border-[#DAD7CD] bg-white/80 px-3 py-2 text-xs font-medium text-[#53665A] transition hover:bg-[#E8EDE5] dark:border-[#34483A] dark:bg-[#273B31] dark:text-[#B7C9B8] dark:hover:bg-[#34483A]">
                Filtro: {filtro} <X size={14} />
              </button>
            )}
          </div>
        </motion.header>

        {/* ================= CARDS DE INFORMAÇÕES (INTERATIVOS) ================= */}
        <motion.div {...entrada(0.08)} className="grid grid-cols-1 gap-4 p-6 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-5">
          {/* DIVERGÊNCIAS */}
          <button
            onClick={() => toggleFiltroCard("Divergência")}
            className={`rounded-xl border bg-white dark:bg-[#1C2920] p-5 text-left shadow-2xs transition-all hover:-translate-y-1 hover:shadow-[0_16px_32px_-22px_rgba(52,78,65,0.55)] active:scale-[0.99] duration-300 ${
              filtro === "Divergência"
                ? "border-[#588157] ring-2 ring-[#588157]/15"
                : "border-[#DAD7CD]/90 dark:border-[#34483A]"
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-[#DAD7CD] bg-[#EDF2EA] text-[#3A5A40] dark:border-[#34483A] dark:bg-[#273B31] dark:text-[#A3B18A]">
                <GitCompareArrows size={22} />
              </div>
              <span className="rounded-lg border border-[#DAD7CD] bg-[#EDF2EA] px-2.5 py-0.5 text-xs font-semibold text-[#3A5A40] dark:border-[#34483A] dark:bg-[#273B31] dark:text-[#A3B18A]">
                Atenção
              </span>
            </div>
            <h2 className="mt-4 text-sm font-medium text-[#6A7C70] dark:text-[#A3B18A]">
              Divergências
            </h2>
            <p className="mt-1 text-3xl font-bold text-[#273B31] dark:text-[#E5EDE5]">{String(ocorrencias.filter((o) => o.tipo === "Divergência").length).padStart(2, "0")}</p>
            <p className="mt-1.5 text-xs text-[#859488] dark:text-[#91A696]">
              Diferenças identificadas nos registros
            </p>
          </button>

          {/* MOVIMENTAÇÕES INCOMUNS */}
          <button
            onClick={() => toggleFiltroCard("Movimentação incomum")}
            className={`rounded-xl border bg-white dark:bg-[#1C2920] p-5 text-left shadow-2xs transition-all hover:-translate-y-1 hover:shadow-[0_16px_32px_-22px_rgba(52,78,65,0.55)] active:scale-[0.99] duration-300 ${
              filtro === "Movimentação incomum"
                ? "border-[#588157] ring-2 ring-[#588157]/15"
                : "border-[#DAD7CD]/90 dark:border-[#34483A]"
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-[#DAD7CD] bg-[#EDF2EA] text-[#3A5A40] dark:border-[#34483A] dark:bg-[#273B31] dark:text-[#A3B18A]">
                <Activity size={22} />
              </div>
              <span className="rounded-lg border border-[#DAD7CD] bg-[#EDF2EA] px-2.5 py-0.5 text-xs font-semibold text-[#3A5A40] dark:border-[#34483A] dark:bg-[#273B31] dark:text-[#A3B18A]">
                Alerta
              </span>
            </div>
            <h2 className="mt-4 text-sm font-medium text-[#6A7C70] dark:text-[#A3B18A]">
              Movimentações incomuns
            </h2>
            <p className="mt-1 text-3xl font-bold text-[#273B31] dark:text-[#E5EDE5]">{String(ocorrencias.filter((o) => o.tipo === "Movimentação incomum").length).padStart(2, "0")}</p>
            <p className="mt-1.5 text-xs text-[#859488] dark:text-[#91A696]">
              Atividades fora do comportamento esperado
            </p>
          </button>

          {/* CLASSIFICAÇÕES */}
          <button
            onClick={() => toggleFiltroCard("Classificação inconsistente")}
            className={`rounded-xl border bg-white dark:bg-[#1C2920] p-5 text-left shadow-2xs transition-all hover:-translate-y-1 hover:shadow-[0_16px_32px_-22px_rgba(52,78,65,0.55)] active:scale-[0.99] duration-300 ${
              filtro === "Classificação inconsistente"
                ? "border-[#588157] ring-2 ring-[#588157]/15"
                : "border-[#DAD7CD]/90 dark:border-[#34483A]"
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-[#DAD7CD] bg-[#EDF2EA] text-[#3A5A40] dark:border-[#34483A] dark:bg-[#273B31] dark:text-[#A3B18A]">
                <Tags size={22} />
              </div>
              <span className="rounded-lg border border-[#DAD7CD] bg-[#EDF2EA] px-2.5 py-0.5 text-xs font-semibold text-[#3A5A40] dark:border-[#34483A] dark:bg-[#273B31] dark:text-[#A3B18A]">
                Verificar
              </span>
            </div>
            <h2 className="mt-4 text-sm font-medium text-[#6A7C70] dark:text-[#A3B18A]">
              Classificações inconsistentes
            </h2>
            <p className="mt-1 text-3xl font-bold text-[#273B31] dark:text-[#E5EDE5]">{String(ocorrencias.filter((o) => o.tipo === "Classificação inconsistente").length).padStart(2, "0")}</p>
            <p className="mt-1.5 text-xs text-[#859488] dark:text-[#91A696]">
              Categorias que precisam de revisão
            </p>
          </button>

          {/* ALTERAÇÕES FORA DO PADRÃO */}
          <button
            onClick={() => toggleFiltroCard("Alteração fora do padrão")}
            className={`rounded-xl border bg-white dark:bg-[#1C2920] p-5 text-left shadow-2xs transition-all hover:-translate-y-1 hover:shadow-[0_16px_32px_-22px_rgba(52,78,65,0.55)] active:scale-[0.99] duration-300 ${
              filtro === "Alteração fora do padrão"
                ? "border-[#588157] ring-2 ring-[#588157]/15"
                : "border-[#DAD7CD]/90 dark:border-[#34483A]"
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-[#DAD7CD] bg-[#EDF2EA] text-[#3A5A40] dark:border-[#34483A] dark:bg-[#273B31] dark:text-[#A3B18A]">
                <TrendingUp size={22} />
              </div>
              <span className="rounded-lg border border-[#DAD7CD] bg-[#EDF2EA] px-2.5 py-0.5 text-xs font-semibold text-[#3A5A40] dark:border-[#34483A] dark:bg-[#273B31] dark:text-[#A3B18A]">
                Analisar
              </span>
            </div>
            <h2 className="mt-4 text-sm font-medium text-[#6A7C70] dark:text-[#A3B18A]">
              Alterações fora do padrão
            </h2>
            <p className="mt-1 text-3xl font-bold text-[#273B31] dark:text-[#E5EDE5]">{String(ocorrencias.filter((o) => o.tipo === "Alteração fora do padrão").length).padStart(2, "0")}</p>
            <p className="mt-1.5 text-xs text-[#859488] dark:text-[#91A696]">
              Mudanças que fogem do histórico
            </p>
          </button>

          {/* PROBLEMAS ENCONTRADOS */}
          <button
            onClick={() => setFiltro("Todos")}
            className={`rounded-xl border bg-white dark:bg-[#1C2920] p-5 text-left shadow-2xs transition-all hover:-translate-y-1 hover:shadow-[0_16px_32px_-22px_rgba(52,78,65,0.55)] active:scale-[0.99] duration-300 ${
              filtro === "Todos"
                ? "border-[#588157]/50"
                : "border-[#DAD7CD]/90 dark:border-[#34483A]"
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#A3B18A]/20 dark:bg-[#344E41]/40 text-[#588157]">
                <ClipboardList size={22} />
              </div>
              <span className="rounded-lg bg-[#A3B18A]/20 dark:bg-[#344E41]/40 px-2.5 py-0.5 text-xs font-semibold text-[#588157]">
                Total
              </span>
            </div>
            <h2 className="mt-4 text-sm font-medium text-[#6A7C70] dark:text-[#A3B18A]">
              Problemas encontrados
            </h2>
            <p className="mt-1 text-3xl font-bold text-[#273B31] dark:text-[#E5EDE5]">
              {String(ocorrencias.length).padStart(2, "0")}
            </p>
            <p className="mt-1.5 text-xs text-[#859488] dark:text-[#91A696]">
              Exibir todos os registros listados
            </p>
          </button>
        </motion.div>

        {/* ================= TABELA DE OCORRÊNCIAS ================= */}
        <motion.div {...entrada(0.05)} className="px-6 pb-10">
          <div className="mb-4 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
            <div>
              <h2 className="text-lg font-bold text-[#273B31] dark:text-[#E5EDE5]">
                Problemas identificados
              </h2>
              <p className="text-sm text-[#6A7C70] dark:text-[#A3B18A]">
                Clique em{" "}
                <strong className="font-medium text-[#344E41] dark:text-[#DAD7CD]">Detalhes</strong>{" "}
                para visualizar os dados da falha ou enviá-la para a Visora AI.
              </p>
            </div>

            <div className="flex flex-col gap-2.5 sm:flex-row">
              {/* BUSCA */}
              <div className="flex items-center gap-2 rounded-xl border border-[#DAD7CD] dark:border-[#34483A] bg-white dark:bg-[#1C2920] px-3.5 py-2 shadow-2xs focus-within:border-[#588157]">
                <Search size={16} className="text-[#859488] dark:text-[#91A696]" />
                <input
                  type="text"
                  value={busca}
                  onChange={(e) => setBusca(e.target.value)}
                  placeholder="Buscar por ID ou descrição..."
                  className="w-full bg-transparent text-sm text-[#344E41] dark:text-[#DAD7CD] outline-none placeholder:text-[#859488] dark:text-[#91A696] sm:w-52"
                />
              </div>

              {/* FILTRO */}
              <div className="flex items-center gap-2 rounded-xl border border-[#DAD7CD] dark:border-[#34483A] bg-white dark:bg-[#1C2920] px-3.5 py-2 shadow-2xs">
                <Filter size={16} className="text-[#859488] dark:text-[#91A696]" />
                <select
                  value={filtro}
                  onChange={(e) => setFiltro(e.target.value)}
                  className="bg-transparent text-sm font-medium text-[#53665A] dark:text-[#B7C9B8] outline-none"
                >
                  <option value="Todos">Todos os tipos</option>
                  <option value="Divergência">Divergências</option>
                  <option value="Movimentação incomum">
                    Movimentações incomuns
                  </option>
                  <option value="Classificação inconsistente">
                    Classificações
                  </option>
                  <option value="Alteração fora do padrão">Alterações</option>
                </select>
              </div>
            </div>
          </div>

          {/* CONTEÚDO DA TABELA */}
          <div className="overflow-hidden rounded-2xl border border-[#DAD7CD]/90 dark:border-[#34483A] bg-white dark:bg-[#1C2920] shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[850px] text-left text-sm">
                <thead className="border-b border-[#DAD7CD] dark:border-[#34483A] bg-[#F2F2F2]/80 dark:bg-[#18251C]/90 text-xs font-semibold uppercase tracking-wider text-[#6A7C70] dark:text-[#A3B18A]">
                  <tr>
                    <th className="px-5 py-4">Tipo de ocorrência</th>
                    <th className="px-5 py-4">Registro</th>
                    <th className="px-5 py-4">Descrição</th>
                    <th className="px-5 py-4">Gravidade</th>
                    <th className="px-5 py-4">Status</th>
                    <th className="px-5 py-4 text-right">Ação</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-100">
                  {ocorrenciasFiltradas.map((item) => (
                    <tr
                      key={item.registro}
                      onClick={() => setOcorrenciaSelecionada(item)}
                      className="cursor-pointer transition hover:bg-[#A3B18A]/15 dark:hover:bg-[#34483A]/40"
                    >
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-[#DAD7CD] bg-[#EDF2EA] text-[#3A5A40] dark:border-[#34483A] dark:bg-[#273B31] dark:text-[#A3B18A]">
                            {item.tipo === "Divergência" ? <GitCompareArrows size={17} strokeWidth={1.9} /> : item.tipo === "Movimentação incomum" ? <Activity size={17} strokeWidth={1.9} /> : item.tipo === "Classificação inconsistente" ? <Tags size={17} strokeWidth={1.9} /> : <TrendingUp size={17} strokeWidth={1.9} />}
                          </span>
                          <span className="font-semibold text-[#273B31] dark:text-[#E5EDE5]">
                            {item.tipo}
                          </span>
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <span className="rounded-md bg-[#E8EDE5] dark:bg-[#273B31] px-2.5 py-1 font-mono text-xs font-semibold text-[#344E41] dark:text-[#DAD7CD]">
                          {item.registro}
                        </span>
                      </td>

                      <td className="max-w-[320px] truncate px-5 py-4 text-[#53665A] dark:text-[#B7C9B8]">
                        {item.descricao}
                      </td>

                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex min-w-[68px] justify-center items-center rounded-lg px-2.5 py-1 text-xs font-semibold ${
                            item.gravidade === "Alta"
                              ? "border border-[#D6B7A8] bg-[#F8EEE9] text-[#87513E] dark:border-[#80594A] dark:bg-[#3B2B25] dark:text-[#E6B6A0]"
                              : "border border-[#DAD7CD] bg-[#EDF2EA] text-[#526E51] dark:border-[#455C48] dark:bg-[#273B31] dark:text-[#B9CDAE]"
                          }`}
                        >
                          {item.gravidade}
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex min-w-[105px] justify-center items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-semibold ${
                            item.status === "Resolvido"
                              ? "border border-[#B7CDB0] bg-[#E0EBDD] text-[#344E41] dark:border-[#53745A] dark:bg-[#344E41] dark:text-[#D6E8CD]"
                              : item.status === "Em análise"
                              ? "border border-[#C7D6C2] bg-[#E8F0E5] text-[#3A5A40] dark:border-[#4A6850] dark:bg-[#294033] dark:text-[#C4D9BA]"
                              : "border border-[#DAD7CD] bg-[#F2F2F2] text-[#647765] dark:border-[#455C48] dark:bg-[#273B31] dark:text-[#B9CDAE]"
                          }`}
                        >
                          {item.status === "Resolvido" && (
                            <CheckCircle2 size={12} />
                          )}
                          {item.status === "Em análise" && <Clock size={12} />}
                          {item.status === "Pendente" && (
                            <AlertTriangle size={12} />
                          )}
                          {item.status}
                        </span>
                      </td>

                      <td
                        className="px-5 py-4 text-right"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            onClick={() => analisarOcorrenciaNoChat(item)}
                            title="Analisar direto no chat com Visora AI"
                            className="inline-flex items-center gap-1 rounded-lg border border-[#A3B18A] dark:border-[#588157] bg-[#A3B18A]/20 dark:bg-[#344E41]/40 px-2.5 py-1.5 text-xs font-semibold text-[#588157] dark:text-[#A3B18A] transition hover:bg-[#588157] hover:text-white"
                          >
                            <Sparkles size={13} />
                            IA
                          </button>

                          <button
                            onClick={() => setOcorrenciaSelecionada(item)}
                            className="inline-flex items-center gap-1.5 rounded-lg border border-[#DAD7CD] dark:border-[#34483A] bg-white dark:bg-[#1C2920] px-3 py-1.5 text-xs font-semibold text-[#344E41] dark:text-[#DAD7CD] shadow-2xs transition hover:border-[#588157] hover:text-[#588157]"
                          >
                            <Eye size={14} />
                            Detalhes
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}

                  {ocorrenciasFiltradas.length === 0 && (
                    <tr>
                      <td
                        colSpan={6}
                        className="px-5 py-14 text-center text-[#859488] dark:text-[#91A696]"
                      >
                        <FileText
                          size={32}
                          className="mx-auto mb-2 text-[#A3B18A] dark:text-[#7E9971]"
                        />
                        <p className="text-sm font-medium text-[#6A7C70] dark:text-[#A3B18A]">
                          Nenhuma ocorrência encontrada
                        </p>
                        <p className="text-xs text-[#859488] dark:text-[#91A696]">
                          Tente limpar os filtros ou buscar por outro termo.
                        </p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* RODAPÉ DA TABELA */}
            <div className="flex items-center justify-between border-t border-[#E5E9E1] dark:border-[#34483A] bg-[#F2F2F2]/50 dark:bg-[#18251C]/70 px-5 py-3.5">
              <p className="text-xs text-[#6A7C70] dark:text-[#A3B18A]">
                Exibindo{" "}
                <strong className="font-semibold text-[#344E41] dark:text-[#DAD7CD]">
                  {ocorrenciasFiltradas.length}
                </strong>{" "}
                de{" "}
                <strong className="font-semibold text-[#344E41] dark:text-[#DAD7CD]">
                  {ocorrencias.length}
                </strong>{" "}
                ocorrências
              </p>

              <span className="flex items-center gap-1.5 text-xs font-semibold text-[#588157]">
                <Sparkles size={13} />
                Auditoria inteligente
              </span>
            </div>
          </div>
        </motion.div>
        <style jsx global>{`
          @keyframes visoraAuraA { 0%,100% { transform: translate3d(0,0,0) scale(1); } 50% { transform: translate3d(-35px,35px,0) scale(1.1); } }
          @keyframes visoraAuraB { 0%,100% { transform: translate3d(0,0,0) scale(1); } 50% { transform: translate3d(45px,-25px,0) scale(1.08); } }
          .visora-aura-a { animation: visoraAuraA 16s ease-in-out infinite; }
          .visora-aura-b { animation: visoraAuraB 20s ease-in-out infinite; }
          @media (prefers-reduced-motion: reduce) { .visora-aura-a,.visora-aura-b { animation: none !important; } }
        `}</style>
        <FooterPlataforma />
      </main>
    </>
  );
}
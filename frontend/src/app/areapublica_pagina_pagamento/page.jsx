"use client";

import { Suspense, useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { CircleUserRound, Building2,
  CreditCard,
  ClipboardList,
  BanknoteArrowUp,
  ArrowLeft,
  CreditCardReader , FileSpreadsheet 
} from "lucide-react";

import {
  buscarPlanoPorId,
  cadastrarContratacao,
  confirmarPagamentoSimulado,
  consultarContratacao,
  urlReciboContratacao,
} from "@/lib/api";

const camposIniciais = {
  nomeCompleto: "",
  emailPessoal: "",
  telefonePessoal: "",
  nomeEmpresa: "",
  emailEmpresa: "",
  telefoneEmpresa: "",
  tipoDocumento: "CNPJ",
  documento: "",
  areaAtuacao: "",
  aceitouTermos: false,
};

const formasPagamento = [
  {
    nome: "Pix",
    valor: "pix",
    icone: BanknoteArrowUp,
    desc: "Aprovação em segundos",
  },
  {
    nome: "Cartão de crédito",
    valor: "cartao_credito",
    icone: CreditCard,
    desc: "Pague com seu cartão",
  },
  {
    nome: "Boleto",
    valor: "boleto",
    icone: ClipboardList,
    desc: "Compensa em até 3 dias úteis",
  },
];

const etapas = [
  "Plano",
  "Pessoal",
  "Empresa",
  "Pagamento",
  "Resumo",
  "Finalizar",
];

const camposPessoais = [
  ["nomeCompleto", "Nome completo", "text", "name", "Digite seu nome"],
  ["emailPessoal", "E-mail pessoal", "email", "email", "seuemail@email.com"],
  ["telefonePessoal", "Telefone pessoal", "tel", "tel", "(00) 00000-0000"],
];

const camposEmpresa = [
  ["nomeEmpresa", "Nome da empresa", "text", "organization", "Digite o nome da empresa"],
  ["emailEmpresa", "E-mail da empresa", "email", "off", "empresa@email.com"],
  ["telefoneEmpresa", "Telefone da empresa", "tel", "off", "(00) 0000-0000"],
];

const areas = [
  "Comércio",
  "Serviços",
  "Indústria",
  "Tecnologia",
  "Varejo",
  "Saúde",
  "Outros",
];

const beneficios = [
  "Acesso à plataforma",
  "Gestão de materiais",
  "Indicadores e relatórios",
  "Controle de estoque",
  "Suporte especializado",
  "Atualizações da plataforma",
];

const formatarMoeda = (valor) =>
  Number(valor).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });

const formatarData = (valor) =>
  valor ? new Date(valor).toLocaleDateString("pt-BR") : "-";

/* ---------- estilos reutilizáveis ---------- */

const classeInput =
  "w-full rounded-xl border border-[#A3B18A]/70 bg-[#F2F2F2]/80 px-4 py-3 text-[#273B31] outline-none transition duration-200 placeholder:text-[#6B7569] hover:border-[#588157] focus:border-[#588157] focus:bg-white focus:shadow-[0_0_0_4px_rgba(88,129,87,0.18)] dark:border-white/10 dark:bg-[#1F2923]/70 dark:text-[#F2F2F2] dark:placeholder:text-[#8A9486] dark:focus:bg-[#1F2923]";

const classeLabel =
  "mb-1.5 block text-sm font-medium text-[#3A5A40] dark:text-[#A3B18A]";

const botaoPrimario =
  "group relative overflow-hidden rounded-xl bg-gradient-to-br from-[#588157] to-[#3A5A40] px-7 py-3 font-semibold text-white shadow-lg shadow-[#588157]/30 transition duration-200 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-[#588157]/40 active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0";

const botaoSecundario =
  "rounded-xl border border-[#A3B18A]/60 bg-white/60 px-6 py-3 font-medium text-[#273B31] backdrop-blur transition duration-200 hover:bg-white disabled:cursor-not-allowed disabled:opacity-40 dark:border-white/10 dark:bg-white/5 dark:text-[#F2F2F2] dark:hover:bg-white/10";

const textoSuave = "text-[#6B7569] dark:text-[#BFC4AC]";

const css = `
@keyframes aura-a { 0%,100% { transform: translate3d(0,0,0) scale(1); } 50% { transform: translate3d(12vw,8vh,0) scale(1.25); } }
@keyframes aura-b { 0%,100% { transform: translate3d(0,0,0) scale(1.1); } 50% { transform: translate3d(-14vw,-6vh,0) scale(0.9); } }
@keyframes aura-c { 0%,100% { transform: translate3d(0,0,0) scale(1); } 50% { transform: translate3d(-6vw,12vh,0) scale(1.2); } }
@keyframes etapa-in { from { opacity: 0; transform: translateY(14px) scale(.985); filter: blur(6px); } to { opacity: 1; transform: none; filter: blur(0); } }
@keyframes brilho { from { transform: translateX(-120%) skewX(-20deg); } to { transform: translateX(320%) skewX(-20deg); } }
@keyframes anel { 0% { transform: scale(1); opacity: .55; } 100% { transform: scale(1.9); opacity: 0; } }
@keyframes desenhar { to { stroke-dashoffset: 0; } }
@keyframes pop { 0% { transform: scale(.4); opacity: 0; } 70% { transform: scale(1.08); } 100% { transform: scale(1); opacity: 1; } }
@keyframes girar { to { transform: rotate(360deg); } }

.aura-a { animation: aura-a 22s ease-in-out infinite; }
.aura-b { animation: aura-b 28s ease-in-out infinite; }
.aura-c { animation: aura-c 25s ease-in-out infinite; }
.etapa-in { animation: etapa-in .5s cubic-bezier(.2,.8,.2,1) both; }
.brilho::after { content:""; position:absolute; inset:0; width:35%; background:linear-gradient(90deg,transparent,rgba(255,255,255,.28),transparent); animation: brilho 4.5s ease-in-out infinite; }
.anel { animation: anel 1.8s ease-out infinite; }
.check { stroke-dasharray: 48; stroke-dashoffset: 48; animation: desenhar .6s .35s ease-out forwards; }
.pop { animation: pop .55s cubic-bezier(.2,.9,.3,1.2) both; }
.girar { animation: girar .8s linear infinite; }

@media (prefers-reduced-motion: reduce) {
  .aura-a,.aura-b,.aura-c,.etapa-in,.brilho::after,.anel,.pop,.girar { animation: none !important; }
  .check { animation: none !important; stroke-dashoffset: 0; }
}
`;

function Fundo() {
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-[#F2F2F2] dark:bg-[#1F2923]"
    >
      <div className="aura-a absolute -left-[10%] -top-[15%] h-[55vmax] w-[55vmax] rounded-full bg-[#588157]/30 blur-[120px] dark:bg-[#588157]/25" />
      <div className="aura-b absolute -right-[15%] top-[20%] h-[45vmax] w-[45vmax] rounded-full bg-[#A3B18A]/45 blur-[120px] dark:bg-[#3A5A40]/50" />
      <div className="aura-c absolute -bottom-[20%] left-[20%] h-[50vmax] w-[50vmax] rounded-full bg-[#DAD7CD]/70 blur-[130px] dark:bg-[#588157]/15" />
    </div>
  );
}

function Campo({ nome, rotulo, tipo, auto, placeholder, dados, onChange }) {
  return (
    <div>
      <label htmlFor={nome} className={classeLabel}>
        {rotulo}
      </label>

      <input
        id={nome}
        name={nome}
        type={tipo}
        value={dados[nome]}
        onChange={onChange}
        autoComplete={auto}
        placeholder={placeholder}
        className={classeInput}
      />
    </div>
  );
}

/* ---------- título padronizado ---------- */

function Titulo({ titulo, texto, Icone }) {
  return (
    <div>
      <div className="flex items-center gap-3">
        {Icone && (
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#588157]/10 text-[#588157] sm:h-12 sm:w-12 dark:bg-[#588157]/20 dark:text-[#A3B18A]">
            <Icone size={25} strokeWidth={1.8} className="h-5 w-5 sm:h-[25px] sm:w-[25px]" />
          </div>
        )}

        <h1 className="text-xl font-bold tracking-tight text-[#273B31] dark:text-[#F2F2F2] sm:text-2xl md:text-3xl">
          {titulo}
        </h1>
      </div>

      <p className={`mt-3 text-sm sm:text-base ${textoSuave}`}>
        {texto}
      </p>
    </div>
  );
}

/* ---------- indicador de etapas ---------- */

function Stepper({ etapaAtual }) {
  return (
    <nav
      aria-label="Etapas da contratação"
      className="mx-auto flex max-w-3xl items-start pb-12 sm:pb-14"
    >
      {etapas.map((etapa, i) => {
        const numero = i + 1;
        const atual = etapaAtual === numero;
        const concluida = etapaAtual > numero;

        return (
          <div
            key={etapa}
            className={`flex items-start ${i < etapas.length - 1 ? "flex-1" : ""}`}
          >
            <div className="relative flex flex-col items-center">
              {atual && (
                <span className="anel absolute h-8 w-8 rounded-full bg-[#588157] sm:h-10 sm:w-10" />
              )}

              <div
                aria-current={atual ? "step" : undefined}
                className={`relative flex h-8 w-8 items-center justify-center rounded-full border-2 text-xs font-semibold transition-all duration-500 sm:h-10 sm:w-10 sm:text-sm ${
                  atual
                    ? "scale-110 border-[#588157] bg-[#588157] text-white shadow-lg shadow-[#588157]/40"
                    : concluida
                      ? "border-[#588157] bg-[#588157] text-white"
                      : "border-[#A3B18A] bg-white/60 text-[#588157] dark:border-white/15 dark:bg-white/5 dark:text-[#A3B18A]"
                }`}
              >
                {concluida ? "✓" : numero}
              </div>

              <span
                className={`absolute top-10 w-16 text-center text-[11px] sm:top-12 sm:w-20 sm:text-xs transition-colors ${
                  atual
                    ? "font-semibold text-[#3A5A40] dark:text-[#F2F2F2]"
                    : `hidden sm:block ${textoSuave}`
                }`}
              >
                {etapa}
              </span>
            </div>

            {i < etapas.length - 1 && (
              <div className="mx-1 mt-4 h-0.5 flex-1 overflow-hidden rounded-full bg-[#DAD7CD] sm:mx-2 sm:mt-5 dark:bg-white/10">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-[#588157] to-[#A3B18A] transition-all duration-700 ease-out"
                  style={{ width: concluida ? "100%" : "0%" }}
                />
              </div>
            )}
          </div>
        );
      })}
    </nav>
  );
}

/* ---------- página de contratação ---------- */

function ConteudoPagamento() {
  const [etapaAtual, setEtapaAtual] = useState(1);

  const searchParams = useSearchParams();
  const planoId = searchParams.get("planoId");

  const [plano, setPlano] = useState(null);
  const [carregandoPlano, setCarregandoPlano] = useState(true);
  const [erroPlano, setErroPlano] = useState("");

  const [dadosCadastro, setDadosCadastro] = useState(camposIniciais);
  const [formaPagamento, setFormaPagamento] = useState("");
  const [confirmacao, setConfirmacao] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [erroCadastro, setErroCadastro] = useState("");
  const [sucessoCadastro, setSucessoCadastro] = useState(false);

  const [contratacao, setContratacao] = useState(null);
  const [resumoFinal, setResumoFinal] = useState(null);
  const [copiado, setCopiado] = useState("");
  const [simulando, setSimulando] = useState(false);


  useEffect(() => {
    if (!contratacao?.codigo || resumoFinal) return;

    let ativo = true;
    let verificando = false;

    async function verificar() {
      if (!ativo || verificando) return;
      verificando = true;
      try {
        const resumo = await consultarContratacao(contratacao.codigo);

        if (ativo && resumo?.pagamento?.status === "aprovado") {
          setResumoFinal(resumo);
        }
      } catch (error) {
        console.warn("Não foi possível consultar o pagamento:", error.message);
      } finally {
        verificando = false;
      }
    }

    verificar();

    const intervalo = setInterval(verificar, 4000);

    return () => {
      ativo = false;
      clearInterval(intervalo);
    };
  }, [contratacao?.codigo, resumoFinal]);

  useEffect(() => {
    async function carregarPlano() {
      if (!planoId) {
        setErroPlano("Nenhum plano foi selecionado.");
        setCarregandoPlano(false);
        return;
      }

      try {
        setCarregandoPlano(true);
        setErroPlano("");

        const dados = await buscarPlanoPorId(planoId);
        const planoEncontrado = dados?.plano ?? dados;

        if (!planoEncontrado?.id) {
          throw new Error("Plano não encontrado.");
        }

        setPlano(planoEncontrado);
      } catch (error) {
        setErroPlano(error.message || "Não foi possível carregar o plano.");
      } finally {
        setCarregandoPlano(false);
      }
    }

    carregarPlano();
  }, [planoId]);

  const nomePlano =
    plano?.tipo ??
    plano?.nome ??
    plano?.nome_plano ??
    plano?.titulo ??
    "Plano selecionado";

  const precoPlano = plano?.valor ?? plano?.preco ?? plano?.preco_mensal;

  const precoFormatado =
    precoPlano !== undefined &&
    precoPlano !== null &&
    precoPlano !== "" &&
    !Number.isNaN(Number(precoPlano))
      ? formatarMoeda(precoPlano)
      : "Preço não informado";

  function atualizarCampo(event) {
    const { name, value, type, checked } = event.target;

    setConfirmacao(false);
    setDadosCadastro((dados) => ({
      ...dados,
      [name]: type === "checkbox" ? checked : value,
    }));
  }

  function validarEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  function validarEtapa() {
    setErroCadastro("");

    if (etapaAtual === 2) {
      const { nomeCompleto, emailPessoal, telefonePessoal } = dadosCadastro;

      if (
        !nomeCompleto.trim() ||
        !emailPessoal.trim() ||
        !telefonePessoal.trim()
      ) {
        setErroCadastro("Preencha todos os dados pessoais.");
        return false;
      }

      if (!validarEmail(emailPessoal)) {
        setErroCadastro("Informe um e-mail pessoal válido.");
        return false;
      }
    }

    if (etapaAtual === 3) {
      const {
        nomeEmpresa,
        emailEmpresa,
        telefoneEmpresa,
        tipoDocumento,
        documento,
        areaAtuacao,
        aceitouTermos,
      } = dadosCadastro;

      if (
        !nomeEmpresa.trim() ||
        !emailEmpresa.trim() ||
        !telefoneEmpresa.trim() ||
        !documento.trim() ||
        !areaAtuacao.trim()
      ) {
        setErroCadastro("Preencha todos os dados da empresa.");
        return false;
      }

      if (!validarEmail(emailEmpresa)) {
        setErroCadastro("Informe um e-mail empresarial válido.");
        return false;
      }

      if (!["CNPJ", "CPF"].includes(tipoDocumento)) {
        setErroCadastro("Selecione CPF ou CNPJ.");
        return false;
      }

      if (!aceitouTermos) {
        setErroCadastro("Aceite os termos para continuar.");
        return false;
      }
    }

    if (etapaAtual === 4 && !formaPagamento) {
      setErroCadastro("Selecione uma forma de pagamento.");
      return false;
    }

    if (etapaAtual === 5 && !confirmacao) {
      setErroCadastro("Confirme que revisou os dados.");
      return false;
    }

    return true;
  }

  function avancarEtapa() {
    if (!validarEtapa()) return;

    setEtapaAtual((atual) => Math.min(6, atual + 1));
  }

  function voltarEtapa() {
    setErroCadastro("");
    setEtapaAtual((atual) => Math.max(1, atual - 1));
  }

  async function enviarContratacao() {
    if (enviando || sucessoCadastro || !validarEtapa()) return;

    if (!plano?.id) {
      setErroCadastro("O plano selecionado não é válido.");
      return;
    }

    setEnviando(true);
    setErroCadastro("");

    try {
      const resposta = await cadastrarContratacao({
        ...dadosCadastro,
        planoId: Number(plano.id),
        formaPagamento,
      });

      setContratacao(resposta);
      setSucessoCadastro(true);
      setEtapaAtual(6);
    } catch (error) {
      setErroCadastro(
        error.message || "Não foi possível enviar a solicitação. Tente novamente."
      );
    } finally {
      setEnviando(false);
    }
  }

  async function copiarCodigo(texto, tipo) {
    if (!texto) return;

    try {
      await navigator.clipboard.writeText(texto);
      setCopiado(tipo);
      setErroCadastro("");
      setTimeout(() => setCopiado(""), 2000);
    } catch {
      setErroCadastro(
        "Não foi possível copiar. Selecione o código e copie manualmente."
      );
    }
  }

  async function simularPagamento() {
    setSimulando(true);
    setErroCadastro("");

    try {
      setResumoFinal(
        await confirmarPagamentoSimulado(contratacao.codigo)
      );
    } catch (error) {
      setErroCadastro(
        error.message || "Não foi possível simular o pagamento."
      );
    } finally {
      setSimulando(false);
    }
  }

  const nomeForma = (valor) =>
    formasPagamento.find((f) => f.valor === valor)?.nome ?? valor;


  if (carregandoPlano) {
    return (
      <div className="flex min-h-screen items-center justify-center p-6 text-[#273B31] dark:text-[#F2F2F2]">
        <style>{css}</style>
        <Fundo />

        <div className="flex items-center gap-3">
          <span className="girar h-5 w-5 rounded-full border-2 border-[#588157] border-t-transparent" />
          Carregando plano...
        </div>
      </div>
    );
  }

  if (erroPlano || !plano) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-5 p-6 text-center text-[#273B31] dark:text-[#F2F2F2]">
        <style>{css}</style>
        <Fundo />

        <p>{erroPlano || "Plano não encontrado."}</p>

        <button
          onClick={() => { window.location.href = "/areapublica_pagina_planos"; }}
          className={botaoPrimario}
        >
          Voltar para os planos
        </button>
      </div>
    );
  }

  const resumo = [
    ["Plano", nomePlano],
    ["Valor do plano", precoFormatado],
    ["Nome", dadosCadastro.nomeCompleto],
    ["E-mail pessoal", dadosCadastro.emailPessoal],
    ["Empresa", dadosCadastro.nomeEmpresa],
    ["E-mail empresarial", dadosCadastro.emailEmpresa],
    ["Documento", `${dadosCadastro.tipoDocumento}: ${dadosCadastro.documento}`],
    ["Forma de pagamento", nomeForma(formaPagamento)],
  ];

  return (
    <main className="relative min-h-screen px-4 py-6 text-[#273B31] dark:text-[#F2F2F2] sm:px-8 sm:py-10 lg:px-10 lg:py-14">
  <style>{css}</style>
  <Fundo />

  <div className="mx-auto mb-6 max-w-3xl sm:mb-8 xl:mb-0">
    <button
      type="button"
      onClick={() => {
        window.location.href = "/areapublica_pagina_planos";
      }}
      className="group inline-flex items-center gap-2 rounded-xl border border-[#A3B18A]/50 bg-white/80 px-3.5 py-2 text-sm font-semibold text-[#3A5A40] shadow-sm backdrop-blur transition-all duration-300 hover:-translate-y-0.5 hover:border-[#588157] hover:bg-[#588157] hover:text-white hover:shadow-md active:translate-y-0 sm:px-4 sm:py-2.5 xl:absolute xl:left-10 xl:top-7 xl:z-20 dark:border-white/10 dark:bg-[#273B31]/80 dark:text-[#A3B18A] dark:hover:border-[#A3B18A] dark:hover:bg-[#3A5A40] dark:hover:text-white"
    >
      <ArrowLeft
        size={18}
        className="transition-transform duration-300 group-hover:-translate-x-1"
      />
      Voltar aos planos
    </button>
  </div>

  <Stepper etapaAtual={etapaAtual} />

      <div className="mx-auto max-w-3xl rounded-3xl border border-white/70 bg-white/70 p-4 shadow-xl shadow-[#273B31]/10 backdrop-blur-xl dark:border-white/10 dark:bg-[#273B31]/70 dark:shadow-black/30 min-[400px]:p-5 sm:p-7 md:p-9">
        <div key={etapaAtual} className="etapa-in">


          {etapaAtual === 1 && (
            <section>
              <Titulo
                titulo="Plano escolhido"
                texto="Confira o plano que deseja contratar."
              />

              <div className="brilho relative mt-6 overflow-hidden rounded-3xl bg-gradient-to-br from-[#588157] via-[#3A5A40] to-[#273B31] p-5 text-white shadow-2xl shadow-[#3A5A40]/30 sm:p-8">
                <span className="rounded-full border border-white/20 bg-white/15 px-3 py-1 text-xs backdrop-blur sm:text-sm">
                  Plano selecionado
                </span>

                <h2 className="mt-5 break-words text-2xl font-bold tracking-tight sm:text-3xl md:text-4xl">
                  {nomePlano}
                </h2>

                <p className="mt-2 max-w-md text-sm text-white/75 sm:text-base">
                  A solução para gerenciar sua empresa de forma simples e eficiente.
                </p>

                <div className="mt-6 rounded-2xl bg-[#F2F2F2] p-4 text-[#273B31] sm:mt-7 sm:p-5">
                  <p className="text-sm font-medium text-[#3A5A40]">
                    Valor total do plano
                  </p>

                  <p className="mt-1 text-3xl font-bold tracking-tight sm:text-4xl">
                    {precoFormatado}
                  </p>

                  <p className="mt-2 text-sm text-[#588157]">
                    Valor referente ao período do plano selecionado.
                  </p>
                </div>

                <h3 className="mt-6 text-base font-semibold sm:mt-7 sm:text-lg">
                  O que está incluso
                </h3>

                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  {beneficios.map((b) => (
                    <div
                      key={b}
                      className="flex items-center gap-3 rounded-xl bg-white/10 p-3 text-sm backdrop-blur transition hover:bg-white/20 sm:text-base"
                    >
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white/20 text-xs">
                        ✓
                      </span>
                      {b}
                    </div>
                  ))}
                </div>

                <p className="mt-6 rounded-xl bg-white/10 p-4 text-sm text-white/80 sm:mt-7">
                  Confira as condições do plano antes de continuar.
                </p>
              </div>
            </section>
          )}

          {etapaAtual === 2 && (
            <section>
              <Titulo
                Icone={CircleUserRound}
                titulo="Dados pessoais"
                texto="Informe seus dados pessoais para continuar com sua contratação."
              />

              <div className="mt-6 space-y-4">
                {camposPessoais.map(([nome, rotulo, tipo, auto, ph]) => (
                  <Campo
                    key={nome}
                    nome={nome}
                    rotulo={rotulo}
                    tipo={tipo}
                    auto={auto}
                    placeholder={ph}
                    dados={dadosCadastro}
                    onChange={atualizarCampo}
                  />
                ))}
              </div>
            </section>
          )}


          {etapaAtual === 3 && (
            <section>
              <Titulo
                Icone={Building2}
                titulo="Dados da empresa"
                texto="Informe os dados da empresa que utilizará a plataforma."
              />

              <div className="mt-6 space-y-4">
                {camposEmpresa.map(([nome, rotulo, tipo, auto, ph]) => (
                  <Campo
                    key={nome}
                    nome={nome}
                    rotulo={rotulo}
                    tipo={tipo}
                    auto={auto}
                    placeholder={ph}
                    dados={dadosCadastro}
                    onChange={atualizarCampo}
                  />
                ))}
                
                <div className="grid gap-4 sm:grid-cols-[10rem_1fr]">
                  <div>
                    <label
                      htmlFor="tipoDocumento"
                      className={classeLabel}
                    >
                      Tipo de documento
                    </label>

                    <select
                      id="tipoDocumento"
                      name="tipoDocumento"
                      value={dadosCadastro.tipoDocumento}
                      onChange={atualizarCampo}
                      className={classeInput}
                    >
                      <option value="CNPJ">CNPJ</option>
                      <option value="CPF">CPF</option>
                    </select>
                  </div>

                  <Campo
                    nome="documento"
                    rotulo="CNPJ ou CPF"
                    tipo="text"
                    auto="off"
                    placeholder="Digite o documento"
                    dados={dadosCadastro}
                    onChange={atualizarCampo}
                  />
                </div>

                <div>
                  <label htmlFor="areaAtuacao" className={classeLabel}>
                    Área de atuação
                  </label>

                  <select
                    id="areaAtuacao"
                    name="areaAtuacao"
                    value={dadosCadastro.areaAtuacao}
                    onChange={atualizarCampo}
                    className={classeInput}
                  >
                    <option value="">Selecione...</option>

                    {areas.map((a) => (
                      <option key={a} value={a}>
                        {a}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-start gap-3 rounded-xl border border-[#A3B18A]/50 p-3 text-sm transition hover:border-[#588157] sm:p-4 dark:border-white/10">

                  <input
                    id="aceitouTermos"
                    type="checkbox"
                    name="aceitouTermos"
                    checked={dadosCadastro.aceitouTermos}
                    onChange={atualizarCampo}
                    className="mt-0.5 h-4 w-4 shrink-0 cursor-pointer accent-[#588157]"
                  />

                  <div className="leading-relaxed text-[#273B31] dark:text-[#E5EDE5]">

                    <label
                      htmlFor="aceitouTermos"
                      className="cursor-pointer"
                    >
                      Declaro que li e aceito os{" "}
                    </label>

                    <a
                      href="/termos_de_uso.pdf"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-semibold text-[#588157] underline underline-offset-4 transition-colors hover:text-[#3A5A40] dark:text-[#A3B18A] dark:hover:text-white"
                    >
                      Termos de Uso
                    </a>

                    {" "}e a{" "}

                    <a
                      href="/politica_de_privacidade.pdf"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-semibold text-[#588157] underline underline-offset-4 transition-colors hover:text-[#3A5A40] dark:text-[#A3B18A] dark:hover:text-white"
                    >
                      Política de Privacidade
                    </a>.

                  </div>
                </div>

              </div>
            </section>
          )}


          {etapaAtual === 4 && (
            <section>
              <Titulo
                Icone={CreditCardReader}
                titulo="Forma de pagamento"
                texto="Escolha como deseja realizar o pagamento."
              />

              <div className="mt-6 space-y-3">
                {formasPagamento.map((forma) => {
                  const ativa = formaPagamento === forma.valor;
                  const Icone = forma.icone;

                  return (
                    <label
                      key={forma.valor}
                      className={`flex cursor-pointer items-center gap-3 rounded-2xl border p-3 transition duration-200 hover:-translate-y-0.5 sm:gap-4 sm:p-4 ${
                        ativa
                          ? "border-[#588157] bg-[#588157]/10 shadow-lg shadow-[#588157]/15 ring-2 ring-[#588157]/30"
                          : "border-[#A3B18A]/60 bg-white/50 hover:border-[#588157] dark:border-white/10 dark:bg-white/5"
                      }`}
                    >
                      <input
                        type="radio"
                        name="pagamento"
                        value={forma.valor}
                        checked={ativa}
                        onChange={() => { setFormaPagamento(forma.valor); setConfirmacao(false); }}
                        className="sr-only"
                      />

                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#588157]/15 text-[#588157] sm:h-11 sm:w-11 dark:text-[#A3B18A]">
                        <Icone size={23} strokeWidth={1.8} />
                      </span>

                      <span className="min-w-0 flex-1">
                        <span className="block font-semibold">
                          {forma.nome}
                        </span>

                        <span className={`text-sm ${textoSuave}`}>
                          {forma.desc}
                        </span>
                      </span>

                      <span
                        className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 text-xs text-white transition ${
                          ativa
                            ? "pop border-[#588157] bg-[#588157]"
                            : "border-[#A3B18A]"
                        }`}
                      >
                        {ativa && "✓"}
                      </span>
                    </label>
                  );
                })}
              </div>
            </section>
          )}


          {etapaAtual === 5 && (
            <section>
              <Titulo
                Icone={FileSpreadsheet}
                titulo="Resumo da compra"
                texto="Confira as informações antes de finalizar a contratação."
              />

              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                {resumo.map(([titulo, valor]) => (
                  <div
                    key={titulo}
                    className="min-w-0 rounded-2xl bg-[#E6E5E0]/80 p-3 sm:p-4 dark:bg-[#344E41]/80"
                  >
                    <p className={`text-sm ${textoSuave}`}>
                      {titulo}
                    </p>

                    <p className="break-words font-semibold [overflow-wrap:anywhere]">
                      {valor}
                    </p>
                  </div>
                ))}
              </div>

              <label className="mt-4 flex cursor-pointer items-start gap-3 rounded-xl border border-[#A3B18A]/50 p-3 text-sm transition hover:border-[#588157] sm:p-4 dark:border-white/10">
                <input
                  type="checkbox"
                  checked={confirmacao}
                  onChange={(event) => setConfirmacao(event.target.checked)}
                  className="mt-0.5 h-4 w-4 shrink-0 accent-[#588157]"
                />

                <span>
                  Confirmo que revisei os dados da contratação.
                </span>
              </label>

              <p className={`mt-4 text-sm ${textoSuave}`}>
                Ao finalizar, mostraremos como pagar. Sua conta é liberada assim que o pagamento for confirmado.
              </p>
            </section>
          )}

          {etapaAtual === 6 && contratacao && (
            <section className="text-center">
              {resumoFinal ? (
                <>
                  <div className="relative mx-auto h-20 w-20">
                    <span className="anel absolute inset-0 rounded-full bg-[#588157]" />

                    <div className="pop relative flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-[#588157] to-[#3A5A40] shadow-xl shadow-[#588157]/40">
                      <svg
                        viewBox="0 0 24 24"
                        className="h-10 w-10"
                        fill="none"
                        stroke="white"
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path
                          className="check"
                          d="M5 12.5l4.5 4.5L19 7.5"
                        />
                      </svg>
                    </div>
                  </div>

                  <h1 className="mt-6 text-xl font-bold tracking-tight sm:text-2xl md:text-3xl">
                    Pagamento confirmado!
                  </h1>

                  <p className={`mt-3 text-sm sm:text-base ${textoSuave}`}>
                    Enviamos um e-mail para{" "}
                    <strong className="break-all">{resumoFinal.usuario.email}</strong> com o seu nome de
                    usuário e o link para criar a senha e ativar a conta. O link vale por 48 horas.
                  </p>

                  <div className="mt-6 space-y-2 rounded-2xl bg-[#E6E5E0]/80 p-4 text-left text-sm sm:p-5 dark:bg-[#344E41]/80">
                    <p className="text-base font-semibold">
                      Resumo da compra
                    </p>

                    <p>Plano: {resumoFinal.plano.tipo}</p>

                    <p>
                      Valor pago: {formatarMoeda(resumoFinal.pagamento.valor)}
                    </p>

                    <p>
                      Forma de pagamento: {nomeForma(resumoFinal.pagamento.metodo)}
                    </p>

                    <p>
                      Vigência: {formatarData(resumoFinal.assinatura.dataInicio)} a{" "}
                      {formatarData(resumoFinal.assinatura.dataFim)}
                    </p>

                    <p className="break-all">
                      Código da transação: {resumoFinal.pagamento.codigo}
                    </p>
                  </div>

                  <a
                    href={urlReciboContratacao(contratacao.codigo)}
                    className={`${botaoPrimario} mt-6 block w-full text-center sm:inline-block sm:w-auto`}
                  >
                    Baixar recibo (PDF)
                  </a>

                  <p className={`mt-4 text-sm ${textoSuave}`}>
                    Não recebeu o e-mail? Confira a caixa de spam.
                  </p>
                </>
              ) : (
                <>
                  <div className="relative mx-auto h-16 w-16">
                    <span className="anel absolute inset-0 rounded-full bg-[#588157]" />

                    <span className="girar absolute inset-0 rounded-full border-4 border-[#A3B18A]/40 border-t-[#588157]" />
                  </div>

                  <h1 className="mt-6 text-xl font-bold tracking-tight sm:text-2xl md:text-3xl">
                    Aguardando pagamento
                  </h1>

                  <p className={`mt-3 text-sm sm:text-base ${textoSuave}`}>
                    Valor:{" "}
                    <strong className="text-[#273B31] dark:text-[#F2F2F2]">
                      {formatarMoeda(contratacao.valor)}
                    </strong>
                    . Esta página atualiza sozinha assim que o pagamento for confirmado.
                  </p>

                  {contratacao.pix && (
                    <div className="mt-6 rounded-2xl bg-[#E6E5E0]/80 p-4 sm:p-5 dark:bg-[#344E41]/80">
                      <p className="font-semibold">Pague com Pix</p>

                      {contratacao.pix.qrCodeBase64 && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={`data:image/png;base64,${contratacao.pix.qrCodeBase64}`}
                          alt="QR Code do Pix"
                          className="pop mx-auto mt-4 h-48 w-48 rounded-2xl bg-white p-3 shadow-lg sm:h-56 sm:w-56"
                        />
                      )}

                      <p className={`mt-4 text-sm ${textoSuave}`}>
                        Ou copie o código Pix:
                      </p>

                      <textarea
                        readOnly
                        value={contratacao.pix.copiaECola}
                        rows={3}
                        onFocus={(event) => event.target.select()}
                        className={`${classeInput} mt-2 text-xs`}
                      />

                      <button
                        type="button"
                        onClick={() => copiarCodigo(contratacao.pix.copiaECola, "pix")}
                        className={`${botaoPrimario} mt-3 w-full sm:w-auto`}
                      >
                        {copiado === "pix" ? "Copiado!" : "Copiar código Pix"}
                      </button>
                    </div>
                  )}


{contratacao.boleto && (
  <div className="mt-6 rounded-2xl bg-[#E6E5E0]/80 p-4 text-left sm:p-5 dark:bg-[#344E41]/80">

    <h3 className="text-center text-base font-semibold sm:text-lg">
      Pagamento por boleto bancário
    </h3>

    <p className={`mt-2 text-center text-sm ${textoSuave}`}>
      Utilize a linha digitável ou abra o boleto
      para realizar o pagamento.
    </p>

    {contratacao.boleto.linhaDigitavel && (
      <div className="mt-5">

        <label className={classeLabel}>
          Linha digitável
        </label>

        <textarea
          readOnly
          rows={2}
          value={contratacao.boleto.linhaDigitavel}
          onFocus={(event) => event.target.select()}
          className={`${classeInput} text-sm`}
        />

        <button
          type="button"
          onClick={() => copiarCodigo(
            contratacao.boleto.linhaDigitavel,
            "boleto"
          )}
          className={`${botaoPrimario} mt-3 w-full`}
        >
          {copiado === "boleto" ? "Código copiado!" : "Copiar linha digitável"}
        </button>

      </div>
    )}

    {contratacao.boleto.codigoBarras && (
      <div className="mt-5">

        <label className={classeLabel}>
          Código de barras
        </label>

        <input
          readOnly
          value={contratacao.boleto.codigoBarras}
          onFocus={(event) => event.target.select()}
          className={`${classeInput} text-sm`}
        />

      </div>
    )}

    {contratacao.boleto.vencimento && (
      <p className={`mt-4 text-center text-sm ${textoSuave}`}>
        Vencimento: {formatarData(
          `${contratacao.boleto.vencimento}T12:00:00`
        )}
      </p>
    )}

    {(contratacao.boleto.url || contratacao.urlPagamento) && (
      <a
        href={contratacao.boleto.url || contratacao.urlPagamento}
        target="_blank"
        rel="noopener noreferrer"
        className={`${botaoSecundario} mt-5 block text-center`}
      >
        Visualizar boleto
      </a>
    )}

  </div>
)}


{contratacao.cartao && (
  <div className="mt-6 rounded-2xl bg-[#E6E5E0]/80 p-4 sm:p-5 dark:bg-[#344E41]/80">

    <CreditCard
      size={40}
      className="mx-auto text-[#588157]"
    />

    <h3 className="mt-4 text-base font-semibold sm:text-lg">
      Pagamento com cartão de crédito
    </h3>

    <p className={`mt-2 text-sm ${textoSuave}`}>
      Informe os dados do cartão na página segura
      de pagamento do Asaas.
    </p>

    {(contratacao.cartao.urlPagamento || contratacao.urlPagamento) && (
      <a
        href={contratacao.cartao.urlPagamento || contratacao.urlPagamento}
        target="_blank"
        rel="noopener noreferrer"
        className={`${botaoPrimario} mt-5 block w-full text-center sm:inline-block sm:w-auto`}
      >
        Pagar com cartão
      </a>
    )}

  </div>
)}



                  {contratacao.modo === "simulado" && (
                    <div className="mt-6 rounded-2xl border border-dashed border-[#A3B18A] p-4">
                      <p className={`text-sm ${textoSuave}`}>
                        Modo de demonstração: nenhum pagamento real é processado.
                      </p>

                      <button
                        type="button"
                        onClick={simularPagamento}
                        disabled={simulando}
                        className={`${botaoPrimario} mt-3 w-full sm:w-auto`}
                      >
                        {simulando ? "Simulando..." : "Simular pagamento"}
                      </button>
                    </div>
                  )}

                  <p className={`mt-6 animate-pulse text-sm ${textoSuave}`}>
                    Verificando pagamento...
                  </p>
                </>
              )}
            </section>
          )}
        </div>


        {erroCadastro && (
          <p
            role="alert"
            className="etapa-in mt-6 rounded-xl border border-red-300 bg-red-50 p-3 text-sm text-red-700 dark:border-red-400/30 dark:bg-red-950/40 dark:text-red-300"
          >
            {erroCadastro}
          </p>
        )}
      </div>


      <div className="mx-auto mt-6 flex max-w-3xl flex-col-reverse gap-3 sm:mt-8 sm:max-w-none sm:flex-row sm:flex-wrap sm:justify-center sm:gap-4">
        <button
          onClick={voltarEtapa}
          disabled={etapaAtual === 1 || enviando || sucessoCadastro}
          className={`${botaoSecundario} w-full sm:w-auto`}
        >
          Voltar
        </button>

        {etapaAtual < 5 && (
          <button
            onClick={avancarEtapa}
            className={`${botaoPrimario} w-full sm:w-auto`}
          >
            Continuar
          </button>
        )}

        {etapaAtual === 5 && (
          <button
            onClick={enviarContratacao}
            disabled={enviando || sucessoCadastro}
            className={`${botaoPrimario} w-full sm:w-auto`}
          >
            {enviando ? "Processando..." : "Finalizar compra"}
          </button>
        )}

        {etapaAtual === 6 && (
          <button
            onClick={() => {
              window.location.href = "/areapublica_pagina_planos";
            }}
            className={`${botaoPrimario} w-full sm:w-auto`}
          >
            Voltar aos planos
          </button>
        )}
      </div>
    </main>
  );
}

export default function PaginaPagamento() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-[#F2F2F2] p-6 text-[#273B31] dark:bg-[#1F2923] dark:text-[#F2F2F2]">
          Carregando...
        </div>
      }
    >
      <ConteudoPagamento />
    </Suspense>
  );
}
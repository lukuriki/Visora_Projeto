"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";

import { useRouter } from "next/navigation";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "../../components/sidebar";

import {
  enviarMensagemIA,
  buscarHistoricoIA,
  listarConversasIA,
} from "@/lib/api";

import {
  ArrowLeft,
  Paperclip,
  Mic,
  ArrowUp,
  Sparkles,
  ShieldCheck,
  Leaf,
  Loader2,
  AlertCircle,
} from "lucide-react";

function MensagemFormatada({ conteudo }) {
  return (
    <div className="min-w-0 break-words text-sm leading-relaxed text-[#273B31] dark:text-[#E5EDE5]">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({ children }) => (
            <h1 className="mb-3 mt-4 text-xl font-bold text-[#344E41] first:mt-0 dark:text-[#A3B18A]">
              {children}
            </h1>
          ),

          h2: ({ children }) => (
            <h2 className="mb-3 mt-4 text-lg font-bold text-[#344E41] first:mt-0 dark:text-[#A3B18A]">
              {children}
            </h2>
          ),

          h3: ({ children }) => (
            <h3 className="mb-2 mt-3 text-base font-semibold text-[#344E41] first:mt-0 dark:text-[#A3B18A]">
              {children}
            </h3>
          ),

          p: ({ children }) => (
            <p className="mb-3 last:mb-0">
              {children}
            </p>
          ),

          strong: ({ children }) => (
            <strong className="font-bold text-[#344E41] dark:text-[#A3B18A]">
              {children}
            </strong>
          ),

          ul: ({ children }) => (
            <ul className="mb-3 list-disc space-y-1 pl-5">
              {children}
            </ul>
          ),

          ol: ({ children }) => (
            <ol className="mb-3 list-decimal space-y-1 pl-5">
              {children}
            </ol>
          ),

          li: ({ children }) => (
            <li className="pl-1">
              {children}
            </li>
          ),

          hr: () => (
            <hr className="my-4 border-[#DAD7CD] dark:border-[#34483A]" />
          ),

          blockquote: ({ children }) => (
            <blockquote className="my-3 border-l-4 border-[#588157] bg-[#588157]/5 py-2 pl-3 italic dark:bg-[#588157]/10">
              {children}
            </blockquote>
          ),

          a: ({ href, children }) => (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-[#588157] underline hover:text-[#344E41] dark:text-[#A3B18A]"
            >
              {children}
            </a>
          ),

          table: ({ children }) => (
            <div className="my-3 overflow-x-auto">
              <table className="w-full border-collapse text-left text-sm">
                {children}
              </table>
            </div>
          ),

          th: ({ children }) => (
            <th className="border border-[#DAD7CD] bg-[#588157]/10 p-2 font-semibold dark:border-[#34483A]">
              {children}
            </th>
          ),

          td: ({ children }) => (
            <td className="border border-[#DAD7CD] p-2 dark:border-[#34483A]">
              {children}
            </td>
          ),
        }}
      >
        {conteudo || ""}
      </ReactMarkdown>
    </div>
  );
}




export default function PlataformaPaginaPrevisao() {
  
  

  const [mensagem, setMensagem] = useState("");
  const [mensagens, setMensagens] = useState([]);

  const router = useRouter();

  const [sessaoId, setSessaoId] = useState(null);
  const [conversas, setConversas] = useState([]);
  const [carregandoConversas, setCarregandoConversas] = useState(false);
  const [token, setToken] = useState("");

  const [carregando, setCarregando] = useState(false);
  const [carregandoPerfil, setCarregandoPerfil] = useState(true);
  const [carregandoHistorico, setCarregandoHistorico] = useState(false);

  const [erro, setErro] = useState("");

  const finalChatRef = useRef(null);
  const sessaoAtualRef = useRef(null);
  const enviandoRef = useRef(false);
  const sessaoSelecaoRef = useRef(0);

  useEffect(() => {
    let ativo = true;

    function verificarAutenticacao() {

      const tokenSalvo =
        sessionStorage.getItem("visora-token") ||
        localStorage.getItem("visora-token") ||
        sessionStorage.getItem("token") ||
        localStorage.getItem("token");

      if (!ativo) return;

      if (!tokenSalvo) {
        setCarregandoPerfil(false);
        router.replace("/areapublica_pagina_login");
        return;
      }

      setToken(tokenSalvo);

      const sessaoSalva = sessionStorage.getItem("vion_sessao_id");
      if (sessaoSalva) {
        sessaoAtualRef.current = sessaoSalva;
        setSessaoId(sessaoSalva);
        setCarregandoHistorico(true);
      }

      setCarregandoPerfil(false);
    }

    verificarAutenticacao();
    return () => {
      ativo = false;
    };
  }, [router]);


  

  useEffect(() => {
    if (!token) return;
    let ativo = true;
    setCarregandoConversas(true);
    listarConversasIA(token)
      .then((dados) => {
        if (ativo) setConversas(Array.isArray(dados?.conversas) ? dados.conversas : []);
      })
      .catch((error) => {
        if (ativo) setErro(error.message || "Não foi possível listar conversas.");
      })
      .finally(() => {
        if (ativo) setCarregandoConversas(false);
      });
    return () => { ativo = false; };
  }, [token]);

  async function atualizarConversas() {
    if (!token) return;
    try {
      const dados = await listarConversasIA(token);
      setConversas(Array.isArray(dados?.conversas) ? dados.conversas : []);
    } catch (error) {
      console.error("[VION] Falha ao atualizar lista:", error);
    }
  }

  function novaConversa() {
    if (enviandoRef.current || carregandoHistorico) return;
    sessaoSelecaoRef.current += 1;
    sessaoAtualRef.current = null;
    sessionStorage.removeItem("vion_sessao_id");
    setSessaoId(null);
    setMensagens([]);
    setMensagem("");
    setErro("");
  }

  function selecionarConversa(id) {
    if (enviandoRef.current || carregandoHistorico) return;
    const selecionada = String(id);
    if (selecionada === String(sessaoAtualRef.current)) return;
    sessaoSelecaoRef.current += 1;
    sessaoAtualRef.current = selecionada;
    sessionStorage.setItem("vion_sessao_id", selecionada);
    setMensagens([]);
    setMensagem("");
    setErro("");
    setSessaoId(selecionada);
  }

  

  useEffect(() => {
    if (!sessaoId || !token) return;

    let ativo = true;

    setCarregandoHistorico(true);

    async function carregarHistorico() {
      try {
        const dados = await buscarHistoricoIA(sessaoId, token);

        if (!ativo) return;

        const historico = Array.isArray(dados?.mensagens)
          ? dados.mensagens
          : [];

        setMensagens(
          historico.map((item, indice) => ({
            id: item.id ?? `historico-${sessaoId}-${indice}`,
            texto: item.conteudo_texto,
            remetente: item.remetente,
          }))
        );
      } catch (error) {
        if (!ativo) return;

        sessionStorage.removeItem("vion_sessao_id");

        sessaoAtualRef.current = null;

        setSessaoId(null);
        setMensagens([]);

        setErro(
          error.message || "Não foi possível carregar o histórico."
        );
      } finally {
        if (ativo) {
          setCarregandoHistorico(false);
        }
      }
    }

    carregarHistorico();

    return () => {
      ativo = false;
    };
  }, [sessaoId, token]);

  
  

  useEffect(() => {
    finalChatRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "end",
    });
  }, [mensagens, carregando]);

  

  async function enviarMensagem(e) {
    e?.preventDefault();

    const texto = mensagem.trim();

    if (
      !texto ||
      enviandoRef.current ||
      carregandoPerfil ||
      carregandoHistorico
    ) {
      return;
    }

    if (!token) {
      setErro(
        "Não foi possível identificar sua conta. Faça login novamente."
      );
      return;
    }

    enviandoRef.current = true;

    setCarregando(true);
    setErro("");
    setMensagem("");

    const mensagemUsuario = {
      id: crypto.randomUUID(),
      texto,
      remetente: "usuario",
    };

    setMensagens((anterior) => [
      ...anterior,
      mensagemUsuario,
    ]);

    try {
      const dados = await enviarMensagemIA(
        texto,
        token,
        sessaoAtualRef.current
      );

      if (!dados?.resposta) {
        throw new Error("O Vion não retornou uma resposta válida.");
      }

      if (dados.sessao_id) {
        const novaSessao = String(dados.sessao_id);

        sessaoAtualRef.current = novaSessao;

        sessionStorage.setItem(
          "vion_sessao_id",
          novaSessao
        );
        setSessaoId(novaSessao);
      }

      setMensagens((anterior) => [
        ...anterior,
        {
          id: crypto.randomUUID(),
          texto: dados.resposta,
          remetente: "ia",
        },
      ]);
      await atualizarConversas();
    } catch (error) {
      setErro(
        error.message || "Não foi possível enviar sua mensagem."
      );
    } finally {
      enviandoRef.current = false;
      setCarregando(false);
    }
  }

  
  

  const bloqueado =
    carregando ||
    carregandoPerfil ||
    carregandoHistorico;

  

if (carregandoPerfil || !token) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#F8F9F6] dark:bg-[#111A14]">
      <Loader2 className="h-8 w-8 animate-spin text-[#588157]" />
    </div>
  );
}

  return (
    <SidebarProvider
      defaultOpen={true}
      className="!min-h-0 h-dvh w-full overflow-hidden"
    >
      {/* =====================================
          SIDEBAR
      ===================================== */}

      <AppSidebar
        conversas={conversas}
        sessaoAtiva={sessaoId}
        onNovaConversa={novaConversa}
        onSelecionarConversa={selecionarConversa}
        carregandoConversas={carregandoConversas}
        bloqueado={carregando || carregandoHistorico}
      />

      {/* =====================================
          CONTEÚDO PRINCIPAL
      ===================================== */}

      <main
        className="
          relative isolate
          flex h-dvh min-h-0
          min-w-0 flex-1
          flex-col overflow-hidden
          bg-[#F8F9F6]
          text-[#273B31]
          dark:bg-[#111A14]
          dark:text-[#E5EDE5]
        "
      >
        {/* =====================================
            FUNDO VISORA
        ===================================== */}

        <div
          aria-hidden="true"
          className="
            pointer-events-none
            absolute inset-0 -z-10
            bg-gradient-to-br
            from-[#F8F9F6]
            via-[#F1F5EF]
            to-[#E7EEE3]
            dark:from-[#111A14]
            dark:via-[#17231A]
            dark:to-[#1C2920]
          "
        />

        {/* GRADE DECORATIVA */}

        <div
          aria-hidden="true"
          className="
            pointer-events-none
            absolute inset-0 -z-10
            opacity-40
            dark:opacity-20
          "
          style={{
            backgroundImage: `
              linear-gradient(to right, #58815712 1px, transparent 1px),
              linear-gradient(to bottom, #58815712 1px, transparent 1px)
            `,
            backgroundSize: "48px 48px",
            maskImage:
              "radial-gradient(ellipse at center, black 10%, transparent 78%)",
          }}
        />

        {/* LUZ CENTRAL */}

        <div
          aria-hidden="true"
          className="
            pointer-events-none
            absolute left-1/2 top-[20%] -z-10
            h-[550px] w-[750px]
            -translate-x-1/2 rounded-full
            bg-[#A3B18A]/25
            blur-[120px]
            dark:bg-[#588157]/15
          "
        />

        {/* LUZ SUPERIOR */}

        <div
          aria-hidden="true"
          className="
            pointer-events-none
            absolute -right-40 -top-40 -z-10
            h-[500px] w-[500px]
            rounded-full
            bg-[#588157]/10
            blur-[110px]
            dark:bg-[#3A5A40]/20
          "
        />

        {/* LUZ INFERIOR */}

        <div
          aria-hidden="true"
          className="
            pointer-events-none
            absolute -bottom-60 -left-40 -z-10
            h-[500px] w-[500px]
            rounded-full
            bg-[#A3B18A]/20
            blur-[120px]
            dark:bg-[#344E41]/20
          "
        />

        {/* =====================================
            HEADER
        ===================================== */}

        <header
          className="
            relative z-20
            flex h-[76px] shrink-0
            items-center justify-between
            gap-3
            border-b border-[#DAD7CD]/60
            bg-[#F8F9F6]/75
            px-4 backdrop-blur-xl
            sm:px-6 lg:px-10
            dark:border-[#34483A]/60
            dark:bg-[#111A14]/75
          "
        >
          {/* LADO ESQUERDO */}

          <div className="flex min-w-0 items-center gap-3">

            {/* BOTÃO VOLTAR */}

            <Link
              href="/plataforma_pagina_inicial"
              title="Voltar para a plataforma"
              aria-label="Voltar para a plataforma"
              className="
                flex h-10 w-10 shrink-0
                items-center justify-center
                rounded-xl
                border border-[#DAD7CD]
                bg-white/70
                text-[#588157]
                transition-all duration-200
                hover:border-[#588157]
                hover:bg-[#E1EADD]
                hover:text-[#344E41]
                active:scale-95
                dark:border-[#34483A]
                dark:bg-[#1C2920]
                dark:text-[#A3B18A]
                dark:hover:bg-[#273B31]
              "
            >
              <ArrowLeft size={19} />
            </Link>

            {/* SEPARADOR */}

            <div
              className="
                mx-1 hidden h-8 w-px
                bg-[#DAD7CD]
                sm:block
                dark:bg-[#34483A]
              "
            />

            {/* LOGO */}

            <div
              className="
                flex h-10 w-10 shrink-0
                items-center justify-center
                rounded-xl
                border border-[#DAD7CD]
                bg-white/70 shadow-sm
                dark:border-[#34483A]
                dark:bg-[#1C2920]
              "
            >
              <Image
                src="/logo_v_darkmode.png"
                alt="Visora"
                width={27}
                height={27}
                className="h-7 w-7 object-contain"
              />
            </div>

            {/* IDENTIFICAÇÃO */}

            <div className="min-w-0">
              <h2
                className="
                  text-sm font-bold
                  tracking-tight
                  text-[#344E41]
                  dark:text-[#E5EDE5]
                "
              >
                Vion
              </h2>

              <p
                className="
                  truncate text-[10px]
                  font-medium
                  tracking-[0.1em]
                  text-[#7E9971]
                "
              >
                INTELIGÊNCIA VISORA
              </p>
            </div>
          </div>

          {/* STATUS */}

          <div
            className="
              flex shrink-0 items-center
              gap-2 rounded-full
              border border-[#DAD7CD]/80
              bg-white/60 px-3 py-2
              text-[11px] font-medium
              text-[#588157]
              backdrop-blur-xl
              dark:border-[#34483A]
              dark:bg-[#1C2920]/70
              dark:text-[#A3B18A]
            "
          >
            {carregando ? (
              <Loader2
                size={14}
                className="animate-spin"
              />
            ) : (
              <span
                className="
                  h-2 w-2 rounded-full
                  bg-[#588157]
                  shadow-[0_0_8px_#58815780]
                "
              />
            )}

            <span className="hidden sm:inline">
              {carregando
                ? "Vion está respondendo"
                : "Assistente Visora"}
            </span>

            <span className="sm:hidden">
              {carregando ? "Respondendo" : "Online"}
            </span>
          </div>
        </header>

        {/* =====================================
            ÁREA DE CONTEÚDO
        ===================================== */}

        <div
          className="
            flex min-h-0 flex-1 flex-col
            px-4 sm:px-6 lg:px-10
          "
        >
          {/* =====================================
              TELA INICIAL
          ===================================== */}

          {mensagens.length === 0 ? (
            <section
              className="
                flex min-h-0 flex-1
                flex-col items-center
                justify-center
                overflow-y-auto
                pb-8 text-center
              "
            >
              {/* LOGO PRINCIPAL */}

              <div className="relative mb-9">
                <div
                  className="
                    absolute -inset-8
                    rounded-full
                    bg-[#A3B18A]/25
                    blur-3xl
                    dark:bg-[#588157]/25
                  "
                />

                <div
                  className="
                    absolute -inset-4
                    rounded-[34px]
                    border border-[#A3B18A]/30
                    dark:border-[#588157]/20
                  "
                />

                <div
                  className="
                    relative flex h-24 w-24
                    items-center justify-center
                    rounded-[28px]
                    border border-white/40
                    bg-gradient-to-br
                    from-[#7E9971]
                    via-[#588157]
                    to-[#344E41]
                    shadow-[0_18px_50px_#58815740]
                    sm:h-28 sm:w-28
                  "
                >
                  <Image
                    src="/logo_v_darkmode.png"
                    alt="Logo da Visora"
                    width={75}
                    height={75}
                    priority
                    className="
                      h-[70%] w-[70%]
                      object-contain
                    "
                  />
                </div>

                <div
                  className="
                    absolute -bottom-3 -right-3
                    flex h-10 w-10
                    items-center justify-center
                    rounded-2xl
                    border border-[#DAD7CD]
                    bg-[#F8F9F6]
                    shadow-lg
                    dark:border-[#34483A]
                    dark:bg-[#1C2920]
                  "
                >
                  <Sparkles
                    size={19}
                    className="text-[#588157]"
                  />
                </div>
              </div>

              {/* IDENTIFICAÇÃO */}

              <div
                className="
                  mb-5 flex items-center gap-3
                  text-[10px] font-bold
                  uppercase tracking-[0.28em]
                  text-[#588157]
                  dark:text-[#A3B18A]
                "
              >
                <span className="h-px w-7 bg-[#A3B18A]" />

                Seu assistente inteligente

                <span className="h-px w-7 bg-[#A3B18A]" />
              </div>

              {/* TÍTULO */}

              <h1
                className="
                  max-w-3xl
                  text-3xl font-semibold
                  tracking-[-0.045em]
                  text-[#273B31]
                  sm:text-4xl lg:text-5xl
                  dark:text-[#E5EDE5]
                "
              >
                Olá, eu sou o{" "}
                <span
                  className="
                    bg-gradient-to-r
                    from-[#344E41]
                    via-[#588157]
                    to-[#7E9971]
                    bg-clip-text
                    text-transparent
                    dark:from-[#A3B18A]
                    dark:via-[#7E9971]
                    dark:to-[#DAD7CD]
                  "
                >
                  Vion
                </span>
              </h1>

              {/* DESCRIÇÃO */}

              <p
                className="
                  mt-6 max-w-[520px]
                  px-3 text-sm leading-7
                  text-[#738276]
                  sm:text-base
                  dark:text-[#A3B18A]
                "
              >
                Inteligência que transforma dados em
                possibilidades. Estou aqui para ajudar
                você a explorar, compreender e tomar
                decisões com mais confiança.
              </p>

              {/* SELO */}

              <div
                className="
                  mt-9 inline-flex
                  items-center gap-2
                  rounded-full
                  border border-[#DAD7CD]/80
                  bg-white/45
                  px-4 py-2.5
                  text-xs font-medium
                  text-[#588157]
                  backdrop-blur-md
                  dark:border-[#34483A]
                  dark:bg-[#1C2920]/50
                  dark:text-[#A3B18A]
                "
              >
                <Leaf size={14} />

                Tecnologia inteligente, decisões melhores.
              </div>

              {/* CARREGAMENTO DO PERFIL */}

              {carregandoPerfil && (
                <div
                  className="
                    mt-6 flex items-center gap-2
                    text-sm text-[#588157]
                    dark:text-[#A3B18A]
                  "
                >
                  <Loader2
                    size={16}
                    className="animate-spin"
                  />

                  Carregando sua conta...
                </div>
              )}

              {/* CARREGAMENTO DO HISTÓRICO */}

              {carregandoHistorico && (
                <div
                  className="
                    mt-6 flex items-center gap-2
                    text-sm text-[#588157]
                    dark:text-[#A3B18A]
                  "
                >
                  <Loader2
                    size={16}
                    className="animate-spin"
                  />

                  Carregando conversa...
                </div>
              )}
            </section>
          ) : (
            /* =====================================
                MENSAGENS
            ===================================== */

            <section
              aria-label="Mensagens da conversa"
              aria-live="polite"
              className="
                mx-auto flex w-full
                max-w-[900px]
                min-h-0 flex-1
                flex-col gap-6
                overflow-y-auto
                overscroll-contain
                px-1 py-6
                sm:px-3 sm:py-8
                [scrollbar-width:thin]
                [scrollbar-color:#A3B18A_transparent]
              "
            >
              {mensagens.map((msg) => {
                const usuario = msg.remetente === "usuario";

                return (
                  <div
                    key={msg.id}
                    className={`flex w-full ${
                      usuario
                        ? "justify-end"
                        : "justify-start"
                    }`}
                  >
                    <div
                      className={`
                        max-w-[90%]
                        rounded-[22px]
                        px-5 py-4
                        text-sm leading-7
                        shadow-sm
                        sm:max-w-[75%]
                        ${
                          usuario
                            ? `
                              rounded-br-md
                              border border-[#A3B18A]/40
                              bg-[#E5EDE2]/90
                              text-[#273B31]
                              dark:border-[#588157]/30
                              dark:bg-[#273B31]
                              dark:text-[#E5EDE5]
                            `
                            : `
                              rounded-bl-md
                              border border-[#DAD7CD]
                              bg-white/85
                              text-[#273B31]
                              backdrop-blur-xl
                              dark:border-[#34483A]
                              dark:bg-[#1C2920]
                              dark:text-[#E5EDE5]
                            `
                        }
                      `}
                    >
                      {/* IDENTIFICAÇÃO DA IA */}

                      {!usuario && (
                        <div
                          className="
                            mb-3 flex items-center gap-2
                          "
                        >
                          <div
                            className="
                              flex h-7 w-7
                              items-center justify-center
                              rounded-lg
                              bg-[#588157]
                            "
                          >
                            <Image
                              src="/logo_v_darkmode.png"
                              alt="Vion"
                              width={18}
                              height={18}
                            />
                          </div>

                          <span
                            className="
                              text-xs font-bold
                              text-[#588157]
                              dark:text-[#A3B18A]
                            "
                          >
                            Vion
                          </span>
                        </div>
                      )}

                      {/* TEXTO */}

                      {usuario ? (
                        <p className="whitespace-pre-wrap break-words">
                          {msg.texto}
                        </p>
                      ) : (
                        <MensagemFormatada conteudo={msg.texto} />
                      )}
                    </div>
                  </div>
                );
              })}

              {/* =====================================
                  INDICADOR DE RESPOSTA
              ===================================== */}

              {carregando && (
                <div className="flex justify-start">
                  <div
                    role="status"
                    className="
                      flex items-center gap-3
                      rounded-2xl
                      border border-[#DAD7CD]
                      bg-white/85
                      px-5 py-4
                      text-sm text-[#588157]
                      shadow-sm
                      dark:border-[#34483A]
                      dark:bg-[#1C2920]
                      dark:text-[#A3B18A]
                    "
                  >
                    <div
                      className="
                        flex h-8 w-8
                        items-center justify-center
                        rounded-lg
                        bg-[#E5EDE2]
                        dark:bg-[#273B31]
                      "
                    >
                      <Loader2
                        size={18}
                        className="animate-spin"
                      />
                    </div>

                    <div>
                      <p className="font-semibold">
                        Vion está pensando...
                      </p>

                      <p
                        className="
                          text-xs font-normal
                          text-[#738276]
                          dark:text-[#7E9971]
                        "
                      >
                        Analisando sua pergunta e preparando a resposta.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div ref={finalChatRef} />
            </section>
          )}

          {/* =====================================
              CAMPO DE MENSAGEM
          ===================================== */}

          <div
            className="
              relative z-10
              w-full shrink-0
              pb-4 pt-3
              sm:pb-6 sm:pt-4
            "
          >
            {/* ERRO */}

            {erro && (
              <div
                role="alert"
                className="
                  mx-auto mb-4
                  flex max-w-[900px]
                  items-start gap-3
                  rounded-xl
                  border border-red-200
                  bg-red-50
                  px-4 py-3
                  text-sm text-red-700
                  dark:border-red-900/50
                  dark:bg-red-950/30
                  dark:text-red-300
                "
              >
                <AlertCircle
                  size={18}
                  className="mt-0.5 shrink-0"
                />

                <span>{erro}</span>
              </div>
            )}

            {/* FORMULÁRIO */}

            <form
              onSubmit={enviarMensagem}
              className="
                group mx-auto
                w-full max-w-[900px]
                rounded-[24px]
                border border-[#C9D6C4]
                bg-white/85
                p-3
                shadow-[0_12px_45px_#344E4112]
                backdrop-blur-2xl
                transition-all duration-300
                focus-within:border-[#588157]
                focus-within:shadow-[0_15px_50px_#58815720]
                sm:p-4
                dark:border-[#34483A]
                dark:bg-[#1C2920]/90
                dark:focus-within:border-[#7E9971]
              "
            >
              {/* TEXTAREA */}

              <textarea
                value={mensagem}
                onChange={(e) => setMensagem(e.target.value)}
                onKeyDown={(e) => {
                  if (
                    e.key === "Enter" &&
                    !e.shiftKey &&
                    !e.nativeEvent.isComposing
                  ) {
                    e.preventDefault();
                    enviarMensagem(e);
                  }
                }}
                placeholder="Pergunte alguma coisa ao Vion..."
                rows={2}
                disabled={bloqueado}
                className="
                  min-h-[65px] w-full
                  resize-none
                  bg-transparent
                  px-2 py-2
                  text-[14px] leading-6
                  text-[#273B31]
                  outline-none
                  placeholder:text-[#98A59A]
                  disabled:opacity-60
                  sm:text-[15px]
                  dark:text-[#E5EDE5]
                  dark:placeholder:text-[#7E9971]
                "
              />

              {/* DIVISÓRIA */}

              <div
                className="
                  my-2 h-px w-full
                  bg-[#DAD7CD]/70
                  dark:bg-[#34483A]
                "
              />

              {/* AÇÕES */}

              <div
                className="
                  flex items-center
                  justify-between gap-3
                  px-1 pt-1
                "
              >
                {/* ANEXO E MICROFONE */}

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    disabled
                    title="Anexos ainda não disponíveis"
                    aria-label="Anexar arquivo"
                    className="
                      flex h-10 w-10
                      cursor-not-allowed
                      items-center justify-center
                      rounded-xl
                      text-[#738276]
                      opacity-50
                      dark:text-[#A3B18A]
                    "
                  >
                    <Paperclip size={19} />
                  </button>

                  <button
                    type="button"
                    disabled
                    title="Microfone ainda não disponível"
                    aria-label="Microfone"
                    className="
                      flex h-10 w-10
                      cursor-not-allowed
                      items-center justify-center
                      rounded-xl
                      text-[#738276]
                      opacity-50
                      dark:text-[#A3B18A]
                    "
                  >
                    <Mic size={19} />
                  </button>
                </div>

                {/* BOTÃO ENVIAR */}

                <button
                  type="submit"
                  disabled={!mensagem.trim() || bloqueado}
                  className="
                    flex items-center
                    justify-center gap-2
                    rounded-xl
                    bg-[#588157]
                    px-5 py-2.5
                    text-sm font-semibold
                    text-white
                    shadow-[0_5px_15px_#58815730]
                    transition-all duration-200
                    hover:bg-[#3A5A40]
                    hover:shadow-[0_7px_20px_#58815740]
                    active:scale-95
                    disabled:cursor-not-allowed
                    disabled:opacity-40
                    disabled:shadow-none
                  "
                >
                  {carregando ? (
                    <>
                      <Loader2
                        size={17}
                        className="animate-spin"
                      />

                      Enviando...
                    </>
                  ) : (
                    <>
                      Enviar

                      <ArrowUp size={17} />
                    </>
                  )}
                </button>
              </div>
            </form>

            {/* AVISO */}

            <div
              className="
                mt-4 flex items-center
                justify-center gap-2
                text-center text-[11px]
                text-[#8A998B]
                dark:text-[#7E9971]
              "
            >
              <ShieldCheck size={13} />

              <span>
                O Vion pode cometer erros.
                Verifique informações importantes.
              </span>
            </div>
          </div>
        </div>
      </main>
    </SidebarProvider>
  );
}
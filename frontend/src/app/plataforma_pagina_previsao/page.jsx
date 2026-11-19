
"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";

import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "../../components/sidebar";

import {
  enviarMensagemIA,
  buscarHistoricoIA,
} from "@/lib/api";

import {
  Paperclip,
  Mic,
  ArrowUp,
  Sparkles,
  ShieldCheck,
  Leaf,
  Loader2,
  AlertCircle,
} from "lucide-react";

export default function Teste() {
  // ==========================================
  // ESTADOS
  // ==========================================

  const [mensagem, setMensagem] = useState("");
  const [mensagens, setMensagens] = useState([]);

  const [sessaoId, setSessaoId] = useState(null);
  const [token, setToken] = useState("");

  const [carregando, setCarregando] = useState(false);
  const [carregandoPerfil, setCarregandoPerfil] =
    useState(true);

  const [carregandoHistorico, setCarregandoHistorico] =
    useState(false);

  const [erro, setErro] = useState("");

  const finalChatRef = useRef(null);
  const sessaoAtualRef = useRef(null);
  const enviandoRef = useRef(false);

  // ==========================================
  // RECUPERAR LOGIN EXISTENTE DA VISORA
  // ==========================================

  useEffect(() => {
    const tokenSalvo =
      sessionStorage.getItem("visora-token") ||
      localStorage.getItem("visora-token") ||
      sessionStorage.getItem("token") ||
      localStorage.getItem("token") ||
      "";

    if (!tokenSalvo) {
      setErro("Você precisa fazer login para utilizar o Vion.");
      setCarregandoPerfil(false);
      return;
    }

    setToken(tokenSalvo);

    // A sessão fica disponível nesta aba do navegador.
    // O backend valida se pertence ao usuário e à empresa atual.
    const sessaoSalva = sessionStorage.getItem("vion_sessao_id");

    if (sessaoSalva) {
      sessaoAtualRef.current = sessaoSalva;
      setSessaoId(sessaoSalva);
      setCarregandoHistorico(true);
    }

    setCarregandoPerfil(false);
  }, []);

  // ==========================================
  // CARREGAR HISTÓRICO DA CONVERSA
  // ==========================================

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

        // Se o login mudou ou a sessão não existe mais,
        // não reutilizar o identificador antigo.
        sessionStorage.removeItem("vion_sessao_id");
        sessaoAtualRef.current = null;
        setSessaoId(null);
        setMensagens([]);
        setErro(
          error.message || "Não foi possível carregar o histórico."
        );
      } finally {
        if (ativo) setCarregandoHistorico(false);
      }
    }

    carregarHistorico();

    return () => {
      ativo = false;
    };
  }, [sessaoId, token]);

  // ==========================================
  // ROLAGEM AUTOMÁTICA
  // ==========================================

  useEffect(() => {
    finalChatRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "end",
    });
  }, [mensagens, carregando]);

  // ==========================================
  // ENVIAR MENSAGEM AO GEMINI
  // ==========================================

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
        throw new Error(
          "O Vion não retornou uma resposta válida."
        );
      }

      if (dados.sessao_id) {
        const novaSessao = String(dados.sessao_id);

        sessaoAtualRef.current = novaSessao;

        sessionStorage.setItem(
          "vion_sessao_id",
          novaSessao
        );

        // Não atualizamos sessaoId aqui para evitar
        // recarregar o histórico sobre as mensagens
        // que acabaram de chegar.
      }

      setMensagens((anterior) => [
        ...anterior,
        {
          id: crypto.randomUUID(),
          texto: dados.resposta,
          remetente: "ia",
        },
      ]);
    } catch (error) {
      setErro(
        error.message ||
          "Não foi possível enviar sua mensagem."
      );

      // Se o backend criou uma sessão antes da falha,
      // guardar seu ID para não perder a referência.
      // A mensagem permanece visível para identificar o envio que falhou.
    } finally {
      enviandoRef.current = false;
      setCarregando(false);
    }
  }

  // ==========================================
  // INTERFACE
  // ==========================================

  const bloqueado =
    carregando ||
    carregandoPerfil ||
    carregandoHistorico;

  return (
    <SidebarProvider>
      <div
        className="
          flex min-h-screen w-full
          bg-[#F8F9F6] text-[#273B31]
          dark:bg-[#111A14]
          dark:text-[#E5EDE5]
        "
      >
        <AppSidebar />

        <main
          className="
            relative isolate flex h-screen
            min-w-0 flex-1 flex-col
            overflow-hidden
          "
        >
          {/* =====================================
              FUNDO VISORA
          ===================================== */}

          <div
            aria-hidden="true"
            className="
              pointer-events-none absolute inset-0 -z-10
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
              pointer-events-none absolute inset-0 -z-10
              opacity-40 dark:opacity-20
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
              pointer-events-none absolute
              left-1/2 top-[20%] -z-10
              h-[550px] w-[750px]
              -translate-x-1/2 rounded-full
              bg-[#A3B18A]/25 blur-[120px]
              dark:bg-[#588157]/15
            "
          />

          {/* LUZ SUPERIOR DIREITA */}
          <div
            aria-hidden="true"
            className="
              pointer-events-none absolute
              -right-40 -top-40 -z-10
              h-[500px] w-[500px]
              rounded-full bg-[#588157]/10
              blur-[110px]
              dark:bg-[#3A5A40]/20
            "
          />

          {/* LUZ INFERIOR ESQUERDA */}
          <div
            aria-hidden="true"
            className="
              pointer-events-none absolute
              -bottom-60 -left-40 -z-10
              h-[500px] w-[500px]
              rounded-full bg-[#A3B18A]/20
              blur-[120px]
              dark:bg-[#344E41]/20
            "
          />

          {/* =====================================
              HEADER
          ===================================== */}

          <header
            className="
              flex h-[80px] shrink-0
              items-center justify-between
              px-5 sm:px-8 lg:px-12
            "
          >
            <div className="flex items-center gap-3">
              <div
                className="
                  flex h-9 w-9 items-center
                  justify-center rounded-xl
                  border border-[#DAD7CD]
                  bg-white/70 shadow-sm
                  dark:border-[#34483A]
                  dark:bg-[#1C2920]
                "
              >
                <Image
                  src="/logo_v_darkmode.png"
                  alt="Visora"
                  width={25}
                  height={25}
                  className="h-6 w-6 object-contain"
                />
              </div>

              <div>
                <p
                  className="
                    text-sm font-bold tracking-tight
                    text-[#344E41]
                    dark:text-[#E5EDE5]
                  "
                >
                  Vion
                </p>

                <p
                  className="
                    text-[10px] font-medium
                    tracking-[0.12em]
                    text-[#7E9971]
                  "
                >
                  INTELIGÊNCIA VISORA
                </p>
              </div>
            </div>

            <div
              className="
                flex items-center gap-2
                rounded-full border
                border-[#DAD7CD]/80
                bg-white/60 px-3 py-2
                text-[11px] font-medium
                text-[#588157]
                backdrop-blur-xl
                dark:border-[#34483A]
                dark:bg-[#1C2920]/70
                dark:text-[#A3B18A]
              "
            >
              <span
                className="
                  h-2 w-2 rounded-full
                  bg-[#588157]
                  shadow-[0_0_8px_#58815780]
                "
              />

              <span className="hidden sm:inline">
                Assistente Visora
              </span>

              <span className="sm:hidden">
                Online
              </span>
            </div>
          </header>

          {/* =====================================
              CONTEÚDO
          ===================================== */}

          <div
            className="
              flex min-h-0 flex-1 flex-col
              px-4 sm:px-6 lg:px-10
            "
          >
            {mensagens.length === 0 ? (
              <section
                className="
                  flex flex-1 flex-col
                  items-center justify-center
                  overflow-y-auto pb-8 text-center
                "
              >
                {/* LOGO PRINCIPAL */}
                <div className="relative mb-9">
                  <div
                    className="
                      absolute -inset-8
                      rounded-full bg-[#A3B18A]/25
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
                      flex h-10 w-10 items-center
                      justify-center rounded-2xl
                      border border-[#DAD7CD]
                      bg-[#F8F9F6] shadow-lg
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
                    max-w-3xl text-3xl
                    font-semibold tracking-[-0.045em]
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
                      bg-clip-text text-transparent
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

                {/* SELO VISORA */}
                <div
                  className="
                    mt-9 inline-flex items-center gap-2
                    rounded-full border
                    border-[#DAD7CD]/80
                    bg-white/45 px-4 py-2.5
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
                  mx-auto flex w-full max-w-[900px]
                  flex-1 flex-col gap-6
                  overflow-y-auto py-8
                "
              >
                {mensagens.map((msg) => {
                  const usuario =
                    msg.remetente === "usuario";

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
                          max-w-[85%] rounded-[22px]
                          px-5 py-4 text-sm leading-7
                          shadow-sm sm:max-w-[75%]
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
                        {!usuario && (
                          <div
                            className="
                              mb-3 flex items-center gap-2
                            "
                          >
                            <div
                              className="
                                flex h-7 w-7 items-center
                                justify-center rounded-lg
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

                        <p
                          className="
                            whitespace-pre-wrap break-words
                          "
                        >
                          {msg.texto}
                        </p>
                      </div>
                    </div>
                  );
                })}

                {carregando && (
                  <div className="flex justify-start">
                    <div
                      className="
                        flex items-center gap-3
                        rounded-2xl
                        border border-[#DAD7CD]
                        bg-white/85 px-5 py-4
                        text-sm text-[#588157]
                        shadow-sm
                        dark:border-[#34483A]
                        dark:bg-[#1C2920]
                        dark:text-[#A3B18A]
                      "
                    >
                      <Loader2
                        size={18}
                        className="animate-spin"
                      />
                      Vion está analisando sua pergunta...
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
                relative z-10 shrink-0
                w-full pb-5 pt-4
                sm:pb-7
              "
            >
              {erro && (
                <div
                  role="alert"
                  className="
                    mx-auto mb-4 flex max-w-[900px]
                    items-start gap-3
                    rounded-xl border border-red-200
                    bg-red-50 px-4 py-3
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

              <form
                onSubmit={enviarMensagem}
                className="
                  group mx-auto w-full
                  max-w-[900px]
                  rounded-[24px]
                  border border-[#C9D6C4]
                  bg-white/85 p-3
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
                <textarea
                  value={mensagem}
                  onChange={(e) =>
                    setMensagem(e.target.value)
                  }
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
                    resize-none bg-transparent
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

                <div
                  className="
                    my-2 h-px w-full
                    bg-[#DAD7CD]/70
                    dark:bg-[#34483A]
                  "
                />

                <div
                  className="
                    flex items-center
                    justify-between gap-3
                    px-1 pt-1
                  "
                >
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      disabled
                      title="Anexos ainda não disponíveis"
                      aria-label="Anexar arquivo"
                      className="
                        flex h-10 w-10
                        items-center justify-center
                        rounded-xl
                        text-[#738276]
                        opacity-50
                        cursor-not-allowed
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
                        items-center justify-center
                        rounded-xl
                        text-[#738276]
                        opacity-50
                        cursor-not-allowed
                        dark:text-[#A3B18A]
                      "
                    >
                      <Mic size={19} />
                    </button>
                  </div>

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

                O Vion pode cometer erros.
                Verifique informações importantes.
              </div>
            </div>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}

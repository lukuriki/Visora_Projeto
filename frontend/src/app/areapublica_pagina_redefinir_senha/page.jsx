
"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import HeaderAreaPublica from "@/components/HeaderAreaPublica";
import FooterAreaPublica from "@/components/FooterAreaPublica";

import { redefinirSenha } from "@/lib/api";

import { motion, useReducedMotion } from "framer-motion";

import {
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  Copy,
  Eye,
  EyeOff,
  KeyRound,
  Loader2,
  ShieldCheck,
  AlertCircle,
  UserRound,
} from "lucide-react";

const ROTA_LOGIN = "/areapublica_pagina_login";

function Conteudo() {
  const router = useRouter();
  const params = useSearchParams();
  const reduzir = useReducedMotion();

  const token = params.get("token") || "";
  const tokenValido = /^[a-f0-9]{64}$/i.test(token);

  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState("");
  const [credenciais, setCredenciais] = useState(null);

  const [visivel, setVisivel] = useState(false);
  const [copiado, setCopiado] = useState("");
  const [salvou, setSalvou] = useState(false);

  
  

  async function gerarSenha() {
    if (carregando || credenciais) return;

    if (!tokenValido) {
      setErro("Link de recuperação inválido.");
      return;
    }

    setErro("");
    setCarregando(true);

    try {
      const resposta = await redefinirSenha(token);

      const dados = resposta?.dados ?? resposta;

      if (dados?.sucesso === false) {
        throw new Error(
          dados?.mensagem ||
            "Não foi possível redefinir sua senha."
        );
      }

      const senhaGerada = dados?.novaSenha;

      if (
        typeof senhaGerada !== "string" ||
        !senhaGerada
      ) {
        throw new Error(
          "O servidor não retornou a nova senha. Verifique a atualização do backend."
        );
      }

      setCredenciais({
        senha: senhaGerada,
        nomeUsuario: dados?.nomeUsuario || null,
      });

      setVisivel(false);
      setSalvou(false);

    } catch (error) {
      setErro(
        error?.message ||
          "Não foi possível gerar uma nova senha."
      );

    } finally {
      setCarregando(false);
    }
  }
  

  async function copiarTexto(texto, campo) {
    if (!texto) return;

    try {
      await navigator.clipboard.writeText(texto);

      setCopiado(campo);

      setTimeout(() => {
        setCopiado((atual) =>
          atual === campo ? "" : atual
        );
      }, 2000);

    } catch {
      setErro(
        "Não foi possível copiar automaticamente. Selecione e copie a informação manualmente."
      );
    }
  }

  
  INTERFACE
  

  return (
    <>
      <HeaderAreaPublica />

      <main className="relative isolate flex min-h-[calc(100vh-160px)] items-center justify-center overflow-hidden bg-gradient-to-b from-[#F5F8F5] via-white to-[#EDF3EC] px-4 py-40 text-[#273B31] dark:from-[#102D20] dark:via-[#111A14] dark:to-[#17271C] dark:text-[#E5EDE5]">

        {/* ELEMENTOS DECORATIVOS */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-24 -top-24 h-80 w-80 rounded-full bg-[#A3B18A]/25 blur-3xl dark:bg-[#588157]/15"
        />

        <div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-24 -left-24 h-80 w-80 rounded-full bg-[#588157]/10 blur-3xl dark:bg-[#3A5A40]/15"
        />

        <motion.div
          initial={
            reduzir
              ? false
              : { opacity: 0, y: 20 }
          }
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="relative z-10 w-full max-w-[510px]"
        >

          {/* ÍCONE SUPERIOR */}
          <div className="mb-7 flex flex-col items-center text-center">

            <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl border border-[#A3B18A]/40 bg-[#E4EDE1] dark:border-[#588157]/30 dark:bg-[#1C2920]">
              {credenciais ? (
                <CheckCircle2 className="h-8 w-8 text-[#588157] dark:text-[#A3B18A]" />
              ) : (
                <KeyRound className="h-8 w-8 text-[#588157] dark:text-[#A3B18A]" />
              )}
            </div>

            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[#588157] dark:text-[#A3B18A]">
              Segurança da conta
            </p>

          </div>

          {/* CARD PRINCIPAL */}
          <section className="overflow-hidden rounded-2xl border border-[#DAD7CD] bg-white/95 shadow-xl dark:border-[#34483A] dark:bg-[#17231B]/95">

            {/* CABEÇALHO */}
            <div className="px-6 pb-5 pt-8 text-center sm:px-9">

              <h1 className="text-3xl font-bold tracking-tight">
                {credenciais
                  ? "Nova senha gerada!"
                  : !tokenValido
                  ? "Link inválido"
                  : "Recuperar senha"}
              </h1>

              <p className="mt-3 text-sm leading-6 text-[#738075] dark:text-[#BFC4AC]">
                {credenciais
                  ? "A Visora gerou sua nova senha. Salve suas credenciais antes de sair desta página."
                  : !tokenValido
                  ? "O link de recuperação está incompleto ou inválido."
                  : "Por segurança, a Visora irá gerar automaticamente uma nova senha para sua conta."}
              </p>

            </div>

            {/* CONTEÚDO */}
            <div className="space-y-5 px-6 pb-8 sm:px-9">

              {/* ERROS */}
              {erro && (
                <div
                  role="alert"
                  className="flex gap-2 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/20 dark:text-red-300"
                >
                  <AlertCircle className="h-5 w-5 shrink-0" />
                  <p>{erro}</p>
                </div>
              )}

              {/* ==================================
                  CREDENCIAIS GERADAS
              ================================== */}
              {credenciais ? (
                <>

                  {/* AVISO */}
                  <div className="rounded-xl border border-[#A3B18A]/50 bg-[#EAF3E7] p-4 text-sm text-[#344E41] dark:border-[#588157]/30 dark:bg-[#1C2920] dark:text-[#C8E1C7]">

                    <div className="flex items-center gap-2 font-semibold">
                      <ShieldCheck size={19} />
                      Salve suas credenciais
                    </div>

                    <p className="mt-2 leading-6">
                      Sua nova senha será exibida somente nesta etapa.
                      Copie e guarde as informações em um local seguro.
                    </p>

                  </div>

                  {/* NOME DE USUÁRIO */}
                  {credenciais.nomeUsuario && (
                    <div>

                      <label className="mb-2 flex items-center gap-2 text-sm font-semibold">
                        <UserRound size={17} />
                        Nome de usuário
                      </label>

                      <div className="flex items-center gap-2 rounded-xl border border-[#DAD7CD] bg-[#F5F8F5] p-3 dark:border-[#34483A] dark:bg-[#111A14]">

                        <span className="min-w-0 flex-1 break-all text-sm font-semibold">
                          {credenciais.nomeUsuario}
                        </span>

                        <button
                          type="button"
                          onClick={() =>
                            copiarTexto(
                              credenciais.nomeUsuario,
                              "usuario"
                            )
                          }
                          aria-label="Copiar nome de usuário"
                          className="shrink-0 rounded-lg p-2 text-[#588157] transition hover:bg-[#588157]/10"
                        >
                          {copiado === "usuario" ? (
                            <Check size={19} />
                          ) : (
                            <Copy size={19} />
                          )}
                        </button>

                      </div>

                    </div>
                  )}

                  {/* NOVA SENHA */}
                  <div>

                    <label className="mb-2 flex items-center gap-2 text-sm font-semibold">
                      <KeyRound size={17} />
                      Nova senha
                    </label>

                    <div className="flex items-center gap-2 rounded-xl border border-[#DAD7CD] bg-[#F5F8F5] p-3 dark:border-[#34483A] dark:bg-[#111A14]">

                      <span className="min-w-0 flex-1 break-all font-mono text-sm font-semibold">
                        {visivel
                          ? credenciais.senha
                          : "••••••••••••••••"}
                      </span>

                      {/* VISUALIZAR */}
                      <button
                        type="button"
                        onClick={() =>
                          setVisivel((atual) => !atual)
                        }
                        aria-label={
                          visivel
                            ? "Ocultar senha"
                            : "Mostrar senha"
                        }
                        aria-pressed={visivel}
                        className="shrink-0 rounded-lg p-2 text-[#588157] transition hover:bg-[#588157]/10"
                      >
                        {visivel ? (
                          <EyeOff size={19} />
                        ) : (
                          <Eye size={19} />
                        )}
                      </button>

                      {/* COPIAR */}
                      <button
                        type="button"
                        onClick={() =>
                          copiarTexto(
                            credenciais.senha,
                            "senha"
                          )
                        }
                        aria-label="Copiar nova senha"
                        className="shrink-0 rounded-lg p-2 text-[#588157] transition hover:bg-[#588157]/10"
                      >
                        {copiado === "senha" ? (
                          <Check size={19} />
                        ) : (
                          <Copy size={19} />
                        )}
                      </button>

                    </div>

                    <p className="mt-2 text-xs leading-5 text-[#738075] dark:text-[#BFC4AC]">
                      Esta senha substituiu sua senha anterior.
                      Ela não poderá ser consultada novamente após sair desta página.
                    </p>

                  </div>

                  {/* CONFIRMAÇÃO */}
                  <label className="flex cursor-pointer items-start gap-3 text-sm leading-6 text-[#738075] dark:text-[#BFC4AC]">

                    <input
                      type="checkbox"
                      checked={salvou}
                      onChange={(event) =>
                        setSalvou(event.target.checked)
                      }
                      className="mt-1 h-4 w-4 shrink-0 accent-[#588157]"
                    />

                    Já salvei meu nome de usuário e minha nova senha em um local seguro.

                  </label>

                  {/* LOGIN */}
                  <button
                    type="button"
                    disabled={!salvou}
                    onClick={() =>
                      router.replace(ROTA_LOGIN)
                    }
                    className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#588157] font-semibold text-white transition hover:bg-[#3A5A40] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Ir para o login
                    <ArrowRight size={18} />
                  </button>

                </>

              ) : tokenValido ? (

                /* ==================================
                    GERAR SENHA
                ================================== */
                <>

                  <div className="flex gap-3 rounded-xl border border-[#DAD7CD] bg-[#F5F8F5] p-4 text-sm leading-6 text-[#536B56] dark:border-[#34483A] dark:bg-[#1C2920] dark:text-[#BFC4AC]">

                    <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-[#588157]" />

                    <p>
                      Sua senha atual será substituída por uma nova
                      senha gerada automaticamente pela Visora.
                      Você poderá visualizá-la e copiá-la após a confirmação.
                    </p>

                  </div>

                  <button
                    type="button"
                    disabled={carregando}
                    onClick={gerarSenha}
                    className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#588157] font-semibold text-white transition hover:bg-[#3A5A40] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {carregando ? (
                      <>
                        <Loader2
                          size={18}
                          className="animate-spin"
                        />
                        Gerando senha...
                      </>
                    ) : (
                      <>
                        <KeyRound size={18} />
                        Gerar nova senha
                        <ArrowRight size={18} />
                      </>
                    )}
                  </button>

                </>

              ) : (

                /* LINK INVÁLIDO */
                <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-center text-sm text-red-700 dark:border-red-900 dark:bg-red-950/20 dark:text-red-300">
                  Solicite um novo link de recuperação na página de login.
                </div>

              )}

            </div>

            {/* RODAPÉ DO CARD */}
            <div className="border-t border-[#DAD7CD] bg-[#F5F8F5] px-6 py-4 dark:border-[#34483A] dark:bg-[#102D20]/50">

              <button
                type="button"
                onClick={() =>
                  router.push(ROTA_LOGIN)
                }
                className="mx-auto flex items-center gap-2 text-sm font-medium text-[#588157] transition-colors hover:text-[#344E41] dark:text-[#A3B18A] dark:hover:text-white"
              >
                <ArrowLeft size={17} />
                Voltar para o login
              </button>

            </div>

          </section>

          {/* SEGURANÇA */}
          <p className="mt-6 flex items-center justify-center gap-2 text-center text-xs text-[#7E9971] dark:text-[#A3B18A]">
            <ShieldCheck size={15} />
            Acesso seguro | Privacidade | Proteção de dados
          </p>

        </motion.div>

      </main>

      <FooterAreaPublica />
    </>
  );
}

export default function RedefinirSenhaPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-[#F5F8F5] dark:bg-[#111A14]">
          <Loader2 className="h-8 w-8 animate-spin text-[#588157]" />
        </div>
      }
    >
      <Conteudo />
    </Suspense>
  );
}


"use client";

import { Suspense, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  LockKeyhole,
  ShieldCheck,
  ArrowRight,
  LoaderCircle,
  CircleAlert,
  Copy,
  Check,
  Eye,
  EyeOff,
  KeyRound,
  UserRound,
} from "lucide-react";

import { ativarConta } from "@/lib/api";

function ConteudoAtivacao() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const token = searchParams.get("token");

  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState("");
  const [credenciais, setCredenciais] = useState(null);
  const [senhaVisivel, setSenhaVisivel] = useState(false);
  const [copiado, setCopiado] = useState("");
  const [confirmouSalvamento, setConfirmouSalvamento] = useState(false);

  async function handleAtivacao() {
    setErro("");

    if (!token) {
      setErro("Link de ativação inválido ou incompleto.");
      return;
    }

    try {
      setCarregando(true);

      const resultado = await ativarConta({ token });

      setCredenciais({
        nomeUsuario: resultado.nomeUsuario,
        senha: resultado.senha,
      });
    } catch (error) {
      setErro(error.message || "Não foi possível ativar sua conta.");
    } finally {
      setCarregando(false);
    }
  }

  async function copiarTexto(texto, campo) {
    try {
      await navigator.clipboard.writeText(texto);
      setCopiado(campo);
      setTimeout(() => setCopiado(""), 2000);
    } catch {
      setErro("Não foi possível copiar automaticamente. Selecione e copie a informação.");
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#F2F2F2] px-5 py-12 dark:bg-[#1F2923]">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <a href="/" className="inline-block">
            <img
              src="/logo_horizontal_lightmode.png"
              alt="Visora"
              className="mx-auto h-10 w-auto object-contain dark:hidden"
            />
            <img
              src="/logo_horizontal_darkmode.png"
              alt="Visora"
              className="mx-auto hidden h-10 w-auto object-contain dark:block"
            />
          </a>

          <p className="mt-5 text-sm text-[#647067] dark:text-[#BFC4AC]">
            Sua gestão, mais clara. Seus resultados, mais próximos.
          </p>
        </div>

        <section className="rounded-3xl border border-[#DAD7CD] bg-white p-7 shadow-xl sm:p-9 dark:border-white/10 dark:bg-[#273B31]">
          {!credenciais ? (
            <>
              <div className="mb-7">
                <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#588157]/15 text-[#588157] dark:text-[#A3B18A]">
                  <LockKeyhole size={24} />
                </div>

                <h1 className="text-2xl font-bold tracking-tight text-[#273B31] dark:text-white">
                  Ative sua conta
                </h1>

                <p className="mt-2 text-sm leading-6 text-[#647067] dark:text-[#BFC4AC]">
                  Está quase tudo pronto! Confirme a ativação para que a
                  Visora gere suas credenciais de acesso.
                </p>
              </div>

              {!token ? (
                <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-400/20 dark:bg-red-400/10 dark:text-red-300">
                  <div className="flex items-center gap-2 font-semibold">
                    <CircleAlert size={18} />
                    Link de ativação inválido
                  </div>
                  <p className="mt-2 leading-5">
                    Não encontramos o token de ativação neste endereço.
                    Verifique se você abriu o link enviado por e-mail.
                  </p>
                </div>
              ) : (
                <>
                  <div className="mb-6 rounded-xl bg-[#F2F2F2] p-4 dark:bg-[#1F2923]">
                    <div className="flex items-start gap-3">
                      <ShieldCheck
                        size={21}
                        className="mt-0.5 shrink-0 text-[#588157] dark:text-[#A3B18A]"
                      />
                      <p className="text-sm leading-6 text-[#647067] dark:text-[#BFC4AC]">
                        Seu usuário e sua senha serão criados automaticamente
                        pela plataforma. Você poderá consultar essas
                        informações após a ativação.
                      </p>
                    </div>
                  </div>

                  {erro && (
                    <div className="mb-5 flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-400/20 dark:bg-red-400/10 dark:text-red-300">
                      <CircleAlert size={18} className="mt-0.5 shrink-0" />
                      <p>{erro}</p>
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={handleAtivacao}
                    disabled={carregando}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#588157] px-5 py-3.5 text-sm font-semibold text-white shadow-md shadow-[#588157]/15 transition hover:-translate-y-0.5 hover:bg-[#3A5A40] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {carregando ? (
                      <>
                        <LoaderCircle size={18} className="animate-spin" />
                        Ativando conta...
                      </>
                    ) : (
                      <>
                        Ativar conta e gerar credenciais
                        <ArrowRight size={18} />
                      </>
                    )}
                  </button>
                </>
              )}
            </>
          ) : (
            <>
              <div className="mb-7 text-center">
                <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#588157]/15 text-[#588157] dark:text-[#A3B18A]">
                  <ShieldCheck size={30} />
                </div>

                <h1 className="text-2xl font-bold tracking-tight text-[#273B31] dark:text-white">
                  Conta ativada!
                </h1>

                <p className="mt-2 text-sm leading-6 text-[#647067] dark:text-[#BFC4AC]">
                  Suas credenciais foram geradas. Guarde essas informações
                  para acessar a Visora.
                </p>
              </div>

              <div className="mb-6 rounded-xl border border-[#588157]/30 bg-[#588157]/10 p-4">
                <div className="mb-2 flex items-center gap-2 text-[#3A5A40] dark:text-[#A3B18A]">
                  <CircleAlert size={19} />
                  <span className="text-xs font-bold uppercase tracking-wide">
                    Atenção: salve suas credenciais
                  </span>
                </div>

                <p className="text-sm font-semibold leading-6 text-[#273B31] dark:text-white">
                  USUÁRIO E SENHA FORNECIDOS PELA PLATAFORMA. SALVE ESSAS
                  INFORMAÇÕES EM UM LOCAL SEGURO.
                </p>

                <p className="mt-2 text-xs leading-5 text-[#647067] dark:text-[#BFC4AC]">
                  A senha será exibida somente nesta etapa. Copie e guarde
                  antes de sair desta página.
                </p>
              </div>

              <div className="mb-4">
                <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-[#273B31] dark:text-white">
                  <UserRound size={17} />
                  Nome de usuário
                </label>

                <div className="flex items-center gap-2 rounded-xl border border-[#DAD7CD] bg-[#F2F2F2] p-3 dark:border-white/10 dark:bg-[#1F2923]">
                  <span className="min-w-0 flex-1 break-all text-sm font-semibold text-[#273B31] dark:text-white">
                    {credenciais.nomeUsuario}
                  </span>

                  <button
                    type="button"
                    onClick={() =>
                      copiarTexto(credenciais.nomeUsuario, "usuario")
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

              <div className="mb-6">
                <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-[#273B31] dark:text-white">
                  <KeyRound size={17} />
                  Senha gerada
                </label>

                <div className="flex items-center gap-2 rounded-xl border border-[#DAD7CD] bg-[#F2F2F2] p-3 dark:border-white/10 dark:bg-[#1F2923]">
                  <span className="min-w-0 flex-1 break-all font-mono text-sm font-semibold text-[#273B31] dark:text-white">
                    {senhaVisivel ? credenciais.senha : "••••••••••••••••"}
                  </span>

                  <button
                    type="button"
                    onClick={() => setSenhaVisivel(!senhaVisivel)}
                    aria-label={senhaVisivel ? "Ocultar senha" : "Mostrar senha"}
                    className="shrink-0 rounded-lg p-2 text-[#588157] transition hover:bg-[#588157]/10"
                  >
                    {senhaVisivel ? <EyeOff size={19} /> : <Eye size={19} />}
                  </button>

                  <button
                    type="button"
                    onClick={() => copiarTexto(credenciais.senha, "senha")}
                    aria-label="Copiar senha"
                    className="shrink-0 rounded-lg p-2 text-[#588157] transition hover:bg-[#588157]/10"
                  >
                    {copiado === "senha" ? (
                      <Check size={19} />
                    ) : (
                      <Copy size={19} />
                    )}
                  </button>
                </div>
              </div>

              <label className="mb-6 flex cursor-pointer items-start gap-3 text-sm leading-5 text-[#647067] dark:text-[#BFC4AC]">
                <input
                  type="checkbox"
                  checked={confirmouSalvamento}
                  onChange={(e) => setConfirmouSalvamento(e.target.checked)}
                  className="mt-1 h-4 w-4 shrink-0 accent-[#588157]"
                />
                Já salvei meu nome de usuário e minha senha em um local seguro.
              </label>

              <button
                type="button"
                disabled={!confirmouSalvamento}
                onClick={() => router.push("/areapublica_pagina_login")}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#588157] px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-[#3A5A40] disabled:cursor-not-allowed disabled:opacity-50"
              >
                Ir para o login
                <ArrowRight size={18} />
              </button>
            </>
          )}
        </section>

        <p className="mt-6 text-center text-xs text-[#879087] dark:text-[#89988C]">
          © {new Date().getFullYear()} Visora. Todos os direitos reservados.
        </p>
      </div>
    </main>
  );
}

export default function AtivarContaPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-[#F2F2F2] dark:bg-[#1F2923]">
          <LoaderCircle
            size={30}
            className="animate-spin text-[#588157]"
          />
        </div>
      }
    >
      <ConteudoAtivacao />
    </Suspense>
  );
}

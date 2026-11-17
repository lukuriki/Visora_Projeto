
"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";

import {
  Mail,
  UserRound,
  Building2,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ArrowRight,
  Clock3,
  LockKeyhole,
} from "lucide-react";

import {
  buscarConviteEquipe,
  ativarConviteEquipe,
} from "@/lib/api";

// ==========================================
// CONTEÚDO DA ATIVAÇÃO
// ==========================================

function ConteudoAtivacao() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const tokenConvite = searchParams.get("token");

  const [carregando, setCarregando] = useState(true);
  const [ativando, setAtivando] = useState(false);

  const [convite, setConvite] = useState(null);
  const [nomeCompleto, setNomeCompleto] = useState("");

  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState(null);

  // ==========================================
  // CONSULTAR CONVITE
  // ==========================================

  useEffect(() => {
    async function carregarConvite() {
      if (!tokenConvite) {
        setErro("O link do convite é inválido.");
        setCarregando(false);
        return;
      }

      try {
        setCarregando(true);
        setErro("");

        const dados = await buscarConviteEquipe(tokenConvite);

        setConvite(dados);
      } catch (erro) {
        setErro(
          erro.message ||
          "Não foi possível consultar este convite."
        );
      } finally {
        setCarregando(false);
      }
    }

    carregarConvite();
  }, [tokenConvite]);

  // ==========================================
  // ATIVAR CONTA
  // ==========================================

  async function ativarConta(evento) {
    evento.preventDefault();

    if (nomeCompleto.trim().length < 3) {
      setErro("Informe seu nome completo.");
      return;
    }

    try {
      setAtivando(true);
      setErro("");

      const resultado = await ativarConviteEquipe(
        tokenConvite,
        nomeCompleto.trim()
      );

      setSucesso(resultado);
    } catch (erro) {
      setErro(
        erro.message ||
        "Não foi possível ativar sua conta."
      );
    } finally {
      setAtivando(false);
    }
  }

  // ==========================================
  // CARREGAMENTO
  // ==========================================

  if (carregando) {
    return (
      <div className="flex flex-col items-center gap-4 py-14">
        <Loader2 className="h-9 w-9 animate-spin text-[#588157]" />

        <p className="text-sm text-[#738075] dark:text-[#A3B18A]">
          Verificando seu convite...
        </p>
      </div>
    );
  }

  // ==========================================
  // CONTA ATIVADA
  // ==========================================

  if (sucesso) {
    return (
      <div className="py-4 text-center">

        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-[#EAF0E6] dark:bg-[#273B31]">
          <CheckCircle2
            size={42}
            className="text-[#588157] dark:text-[#A3B18A]"
          />
        </div>

        <h1 className="text-2xl font-semibold text-[#273B31] dark:text-white">
          Conta ativada!
        </h1>

        <p className="mx-auto mt-4 max-w-sm text-sm leading-7 text-[#738075] dark:text-[#A3B18A]">
          {sucesso.mensagem ||
            "Sua conta foi ativada com sucesso."}
        </p>

        <div className="mt-7 rounded-xl border border-[#DAD7CD] bg-[#F8F9F6] p-5 text-left dark:border-[#34483A] dark:bg-[#273B31]">
          <div className="flex items-center gap-3">
            <Mail
              size={21}
              className="shrink-0 text-[#588157] dark:text-[#A3B18A]"
            />

            <div>
              <p className="text-sm font-medium text-[#273B31] dark:text-white">
                E-mail cadastrado
              </p>

              <p className="mt-1 break-all text-sm text-[#738075] dark:text-[#BFC4AC]">
                {sucesso.email || convite?.email}
              </p>
            </div>
          </div>
        </div>

        {sucesso.emailEnviado && (
          <p className="mt-5 text-sm leading-6 text-[#738075] dark:text-[#A3B18A]">
            Verifique sua caixa de entrada e a pasta de spam
            para encontrar suas credenciais de acesso.
          </p>
        )}

        <Link
          href="/areapublica_pagina_login"
          className="mt-8 flex w-full items-center justify-center gap-2 rounded-xl bg-[#3A5A40] px-5 py-3.5 text-sm font-medium text-white transition hover:bg-[#273B31]"
        >
          Ir para o login
          <ArrowRight size={18} />
        </Link>
      </div>
    );
  }

  // ==========================================
  // CONVITE INVÁLIDO OU EXPIRADO
  // ==========================================

  if (!convite) {
    return (
      <div className="py-5 text-center">

        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-red-50 dark:bg-red-950/30">
          <AlertCircle size={40} className="text-red-500" />
        </div>

        <h1 className="text-2xl font-semibold text-[#273B31] dark:text-white">
          Convite indisponível
        </h1>

        <p className="mt-4 text-sm leading-7 text-[#738075] dark:text-[#A3B18A]">
          {erro || "Este convite não está mais disponível."}
        </p>

        <p className="mt-3 text-sm text-[#738075] dark:text-[#A3B18A]">
          Solicite um novo convite ao proprietário da empresa.
        </p>

        <Link
          href="/"
          className="mt-8 inline-flex items-center gap-2 rounded-xl bg-[#3A5A40] px-6 py-3 text-sm font-medium text-white transition hover:bg-[#273B31]"
        >
          Voltar ao início
          <ArrowRight size={17} />
        </Link>
      </div>
    );
  }

  // ==========================================
  // FORMULÁRIO DE ATIVAÇÃO
  // ==========================================

  return (
    <>
      <div className="mb-7 flex items-center gap-2 text-sm font-medium text-[#588157] dark:text-[#A3B18A]">
        <ShieldCheck size={18} />
        Convite de colaborador
      </div>

      <h1 className="text-3xl font-semibold tracking-tight text-[#273B31] dark:text-white">
        Faça parte da equipe
      </h1>

      <p className="mt-4 text-sm leading-7 text-[#738075] dark:text-[#A3B18A]">
        Você recebeu um convite para acessar a plataforma
        Visora como colaborador. Confirme suas informações
        para ativar sua conta.
      </p>

      {/* INFORMAÇÕES DA EMPRESA */}
      <div className="mt-7 space-y-4 rounded-xl border border-[#DAD7CD] bg-[#F8F9F6] p-5 dark:border-[#34483A] dark:bg-[#273B31]">

        <div className="flex items-center gap-3">
          <Building2
            size={20}
            className="shrink-0 text-[#588157] dark:text-[#A3B18A]"
          />

          <div>
            <p className="text-xs text-[#738075] dark:text-[#BFC4AC]">
              Empresa
            </p>

            <p className="mt-1 text-sm font-medium text-[#273B31] dark:text-white">
              {convite.empresa}
            </p>
          </div>
        </div>

        <div className="border-t border-[#DAD7CD] dark:border-[#445B49]" />

        <div className="flex items-center gap-3">
          <Mail
            size={20}
            className="shrink-0 text-[#588157] dark:text-[#A3B18A]"
          />

          <div className="min-w-0">
            <p className="text-xs text-[#738075] dark:text-[#BFC4AC]">
              E-mail convidado
            </p>

            <p className="mt-1 break-all text-sm font-medium text-[#273B31] dark:text-white">
              {convite.email}
            </p>
          </div>
        </div>

        <div className="border-t border-[#DAD7CD] dark:border-[#445B49]" />

        <div className="flex items-center gap-3">
          <Clock3
            size={20}
            className="shrink-0 text-[#588157] dark:text-[#A3B18A]"
          />

          <div>
            <p className="text-xs text-[#738075] dark:text-[#BFC4AC]">
              Validade do convite
            </p>

            <p className="mt-1 text-sm font-medium text-[#273B31] dark:text-white">
              {new Date(convite.expiraEm).toLocaleString("pt-BR")}
            </p>
          </div>
        </div>
      </div>

      {/* FORMULÁRIO */}
      <form onSubmit={ativarConta} className="mt-8">

        <label
          htmlFor="nome-completo"
          className="mb-2 block text-sm font-medium text-[#273B31] dark:text-white"
        >
          Nome completo
        </label>

        <div className="flex items-center gap-3 rounded-xl border border-[#DAD7CD] px-4 py-3 focus-within:border-[#588157] dark:border-[#34483A]">
          <UserRound
            size={19}
            className="shrink-0 text-[#738075] dark:text-[#A3B18A]"
          />

          <input
            id="nome-completo"
            type="text"
            required
            minLength={3}
            maxLength={100}
            autoComplete="name"
            placeholder="Digite seu nome completo"
            value={nomeCompleto}
            onChange={(evento) =>
              setNomeCompleto(evento.target.value)
            }
            className="w-full bg-transparent text-sm text-[#273B31] outline-none placeholder:text-[#9CA69C] dark:text-white"
          />
        </div>

        {/* ERRO */}
        {erro && (
          <div
            role="alert"
            className="mt-5 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/30 dark:text-red-300"
          >
            <AlertCircle size={19} className="shrink-0" />
            <p>{erro}</p>
          </div>
        )}

        <div className="mt-6 flex items-start gap-3 rounded-xl bg-[#EAF0E6] p-4 dark:bg-[#273B31]">
          <LockKeyhole
            size={20}
            className="shrink-0 text-[#588157] dark:text-[#A3B18A]"
          />

          <p className="text-xs leading-6 text-[#536B56] dark:text-[#BFC4AC]">
            Após a ativação, a Visora enviará seu nome de usuário
            e senha inicial para o e-mail convidado, caso você
            ainda não tenha uma conta. Não será necessário
            alterar a senha no primeiro acesso.
          </p>
        </div>

        <button
          type="submit"
          disabled={ativando}
          className="mt-7 flex w-full items-center justify-center gap-2 rounded-xl bg-[#3A5A40] px-5 py-3.5 text-sm font-medium text-white transition hover:bg-[#273B31] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {ativando ? (
            <>
              <Loader2 size={19} className="animate-spin" />
              Ativando conta...
            </>
          ) : (
            <>
              <CheckCircle2 size={19} />
              Ativar minha conta
            </>
          )}
        </button>
      </form>
    </>
  );
}

// ==========================================
// PÁGINA PRINCIPAL
// ==========================================

export default function PaginaAtivarConvite() {
  return (
    <div className="flex min-h-screen flex-col bg-[#F8F9F6] text-[#273B31] dark:bg-[#111A14] dark:text-[#E5EDE5]">

      {/* LOGO */}
      <header className="mx-auto flex w-full max-w-7xl items-center px-6 py-7 lg:px-12">
        <Link href="/" aria-label="Visora - Página inicial">
          <Image
            src="/logo_horizontal_lightmode.png"
            alt="Visora"
            width={190}
            height={60}
            className="h-auto w-[180px] dark:hidden"
            priority
          />

          <Image
            src="/logo_horizontal_darkmode.png"
            alt="Visora"
            width={190}
            height={60}
            className="hidden h-auto w-[180px] dark:block"
            priority
          />
        </Link>
      </header>

      {/* CONTEÚDO */}
      <main className="flex flex-1 items-center justify-center px-5 py-10">
        <div className="w-full max-w-lg rounded-2xl border border-[#DAD7CD] bg-white p-7 shadow-sm sm:p-10 dark:border-[#34483A] dark:bg-[#1B281E]">

          <Suspense
            fallback={
              <div className="flex justify-center py-14">
                <Loader2 className="h-9 w-9 animate-spin text-[#588157]" />
              </div>
            }
          >
            <ConteudoAtivacao />
          </Suspense>

        </div>
      </main>

      {/* RODAPÉ */}
      <footer className="py-7 text-center text-xs text-[#738075] dark:text-[#A3B18A]">
        © {new Date().getFullYear()} Visora. Todos os direitos reservados.
      </footer>
    </div>
  );
}

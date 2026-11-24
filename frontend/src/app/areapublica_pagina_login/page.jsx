"use client";

import FooterAreaPublica from "@/components/FooterAreaPublica";
import HeaderAreaPublica from "@/components/HeaderAreaPublica";
import { solicitarRecuperacaoSenha, solicitarRecuperacaoUsuario } from "@/lib/api";

import {
  AnimatePresence,
  motion,
  useReducedMotion,
  useScroll,
  useSpring,
} from "framer-motion";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { login } from "@/lib/api";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import {
  ArrowLeftIcon,
  ArrowRightIcon,
  CheckIcon,
  ClockIcon,
  CreditCardIcon,
  Eye,
  EyeOff,
  LockIcon,
  ShieldCheckIcon,
  SparklesIcon,
  TrendingUpIcon,
} from "lucide-react";

const ROTA_DASHBOARD_ADMIN = "/administracao_pagina_inicial";
const ROTA_DASHBOARD_CLIENTE = "/plataforma_pagina_inicial";


const container = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.09,
      delayChildren: 0.1,
    },
  },
};

const item = {
  hidden: {
    opacity: 0,
    y: 18,
    filter: "blur(6px)",
  },
  show: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: {
      duration: 0.6,
      ease: [0.22, 1, 0.36, 1],
    },
  },
};



function PainelAnimado({ reduzir }) {
  const barras = [38, 56, 44, 72, 63, 88, 100];

  return (
    <div className="relative mx-auto w-full max-w-md lg:mx-0">
      <motion.div
        initial={{ opacity: 0, y: 30, rotateX: 12 }}
        animate={{ opacity: 1, y: 0, rotateX: 0 }}
        transition={{ duration: 0.9, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
        style={{ transformPerspective: 900 }}
        className="rounded-2xl border bg-white/80 p-5 shadow-xl backdrop-blur dark:bg-[#1C2920]/60"
      >
        <div className="mb-4 flex items-center justify-between">
          <div>
            <p className="text-muted-foreground text-xs">Resultado do mês</p>
            <p className="text-2xl font-bold text-[#3A5A40] dark:text-[#A3B18A]">
              R$ 48.920
            </p>
          </div>
          <span className="flex items-center gap-1 rounded-full bg-[#E7EFE5] px-2.5 py-1 text-xs font-medium text-[#3A5A40] dark:bg-[#1C2920] dark:text-[#A3B18A]">
            <TrendingUpIcon className="h-3 w-3" />
            +18%
          </span>
        </div>

        <div className="flex h-28 items-end gap-2">
          {barras.map((altura, indice) => (
            <motion.div
              key={indice}
              initial={{ height: 0 }}
              animate={{ height: `${altura}%` }}
              transition={{
                duration: 0.8,
                delay: 0.9 + indice * 0.08,
                ease: [0.22, 1, 0.36, 1],
              }}
              className={`flex-1 rounded-t-md ${
                indice === barras.length - 1
                  ? "bg-[#3A5A40]"
                  : "bg-[#A3B18A]/60 dark:bg-[#A3B18A]/30"
              }`}
            />
          ))}
        </div>

        <svg viewBox="0 0 300 40" className="mt-4 h-10 w-full" fill="none">
          <motion.path
            d="M0 32 C 40 30, 60 12, 100 18 S 170 34, 210 16 S 270 6, 300 4"
            stroke="#588157"
            strokeWidth="2.5"
            strokeLinecap="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1.6, delay: 1.4, ease: "easeInOut" }}
          />
        </svg>
      </motion.div>

      {/* NOTIFICAÇÃO SUPERIOR */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={
          reduzir ? { opacity: 1, scale: 1 } : { opacity: 1, scale: 1, y: [0, -8, 0] }
        }
        transition={{
          opacity: { delay: 1.8, duration: 0.4 },
          scale: { delay: 1.8, type: "spring" },
          y: { delay: 2.2, duration: 5, repeat: Infinity, ease: "easeInOut" },
        }}
        className="absolute -top-4 -right-2 flex items-center gap-2 rounded-xl border bg-white px-3 py-2 text-xs shadow-lg dark:bg-[#111A14] md:-right-6"
      >
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#A3B18A] opacity-75" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-[#3A5A40]" />
        </span>
        3 novos pedidos
      </motion.div>

      {/* NOTIFICAÇÃO INFERIOR */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={
          reduzir ? { opacity: 1, scale: 1 } : { opacity: 1, scale: 1, y: [0, 8, 0] }
        }
        transition={{
          opacity: { delay: 2.1, duration: 0.4 },
          scale: { delay: 2.1, type: "spring" },
          y: { delay: 2.5, duration: 6, repeat: Infinity, ease: "easeInOut" },
        }}
        className="absolute -bottom-5 -left-2 flex items-center gap-2 rounded-xl border bg-white px-3 py-2 text-xs shadow-lg dark:bg-[#111A14] md:-left-6"
      >
        <CheckIcon className="h-4 w-4 text-[#3A5A40] dark:text-[#A3B18A]" />
        Meta semanal atingida
      </motion.div>
    </div>
  );
}

const features = [
  {
    icon: SparklesIcon,
    title: "Gestão completa",
    text: "Organize e acompanhe todos os processos do seu negócio em um só lugar.",
  },
  {
    icon: ClockIcon,
    title: "Fácil de usar",
    text: "Uma plataforma intuitiva: encontre o que precisa em poucos cliques.",
  },
  {
    icon: CreditCardIcon,
    title: "Decisões mais seguras",
    text: "Acompanhe os números da empresa e decida com mais confiança.",
  },
];



export default function Login() {
  const reduzir = useReducedMotion();
  const router = useRouter();
  const { scrollYProgress } = useScroll();
  const progresso = useSpring(scrollYProgress, { stiffness: 120, damping: 25 });
  const [view, setView] = useState("login"); "login" | "recuperar" | "recuperarUsuario"
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [formData, setFormData] = useState({ identificador: "", senha: "" });
  const [loadingLogin, setLoadingLogin] = useState(false);
  const [erroLogin, setErroLogin] = useState("");
  const [emailRecuperacao, setEmailRecuperacao] = useState("");
  const [loadingRecuperacao, setLoadingRecuperacao] = useState(false);
  const [statusRecuperacao, setStatusRecuperacao] = useState({ tipo: "", mensagem: "" });
  const [emailRecuperacaoUsuario, setEmailRecuperacaoUsuario] = useState("");
  const [loadingRecuperacaoUsuario, setLoadingRecuperacaoUsuario] = useState(false);
  const [statusRecuperacaoUsuario, setStatusRecuperacaoUsuario] = useState({ tipo: "", mensagem: "" });
  function handleChange(e) {
    const { name, value } = e.target;
    setFormData((anterior) => ({ ...anterior, [name]: value }));
    if (erroLogin) setErroLogin("");
  }

  async function handleLoginSubmit(e) {
    e.preventDefault();
    if (loadingLogin) return;
    setErroLogin("");
    setLoadingLogin(true);

    try {
      const resultado = await login({
        identificador: formData.identificador.trim(),
        senha: formData.senha,
      });

      if (!resultado?.token) {
        throw new Error(resultado?.mensagem || "Não foi possível realizar o login.");
      }

      const tipo = resultado.tipo || resultado.usuario?.tipo || resultado.administrador?.tipo;
      const admin = tipo === "admin" || tipo === "administrador";
      const cliente = tipo === "cliente" || tipo === "usuario";

      if (!admin && !cliente) {
        throw new Error("O servidor não informou o tipo da conta autenticada.");
      }

      ["admin-token", "visora-token", "visora-usuario"].forEach((chave) => {
        sessionStorage.removeItem(chave);
        localStorage.removeItem(chave);
      });

      if (admin) {
        if (!resultado.administrador) throw new Error("Perfil não retornado.");
        sessionStorage.setItem("admin-token", resultado.token);
        router.replace(ROTA_DASHBOARD_ADMIN);
      } else {
        if (!resultado.usuario) throw new Error("Perfil não retornado.");
        sessionStorage.setItem("visora-token", resultado.token);
        sessionStorage.setItem("visora-usuario", JSON.stringify(resultado.usuario));
        router.replace(ROTA_DASHBOARD_CLIENTE);
      }
    } catch (error) {
      setErroLogin(error?.message || "Não foi possível realizar o login.");
    } finally {
      setLoadingLogin(false);
    }
  }


  async function handleRecuperarSubmit(e) {
    e.preventDefault();
    if (loadingRecuperacao) return;
    
    setLoadingRecuperacao(true);
    setStatusRecuperacao({ tipo: "", mensagem: "" });

    try {

      const resultado = await solicitarRecuperacaoSenha(emailRecuperacao.trim());

      setStatusRecuperacao({
        tipo: "sucesso",
        mensagem: resultado?.mensagem || "Instruções enviadas! Verifique a caixa de entrada do seu e-mail.",
      });
      setEmailRecuperacao(""); 
    } catch (error) {
      setStatusRecuperacao({
        tipo: "erro",
        mensagem: error?.message || "Não foi possível enviar o e-mail. Tente novamente.",
      });
    } finally {
      setLoadingRecuperacao(false);
    }
  }

  async function handleRecuperarUsuarioSubmit(e) {
    e.preventDefault();
    if (loadingRecuperacaoUsuario) return;

    setLoadingRecuperacaoUsuario(true);
    setStatusRecuperacaoUsuario({ tipo: "", mensagem: "" });

    try {
      const resultado = await solicitarRecuperacaoUsuario(emailRecuperacaoUsuario.trim());
      setStatusRecuperacaoUsuario({
        tipo: "sucesso",
        mensagem: resultado?.mensagem || "Se o e-mail estiver cadastrado, você receberá seu nome de usuário.",
      });
      setEmailRecuperacaoUsuario("");
    } catch (error) {
      setStatusRecuperacaoUsuario({
        tipo: "erro",
        mensagem: error?.message || "Não foi possível processar a solicitação. Tente novamente.",
      });
    } finally {
      setLoadingRecuperacaoUsuario(false);
    }
  }

  const desabilitadoLogin = loadingLogin || !formData.identificador.trim() || !formData.senha;
  const desabilitadoRecuperacao = loadingRecuperacao || !emailRecuperacao.trim();
  const desabilitadoRecuperacaoUsuario = loadingRecuperacaoUsuario || !emailRecuperacaoUsuario.trim();

  return (
    <>
      <HeaderAreaPublica />

      <motion.div
        style={{ scaleX: progresso }}
        className="fixed inset-x-0 top-0 z-[60] h-1 origin-left bg-gradient-to-r from-[#588157] via-[#A3B18A] to-[#588157]"
      />

      <div className="relative overflow-hidden bg-gradient-to-b from-[#F2F2F2] via-[#F8F9F6] to-white py-12 text-[#273B31] dark:from-[#111A14] dark:via-[#1C2920] dark:to-[#111A14] dark:text-[#E5EDE5] lg:py-20">
        <div className="bg-grid-slate-200 dark:bg-grid-slate-800/20 absolute inset-0 bg-[size:24px_24px] opacity-10" />
        <div className="absolute top-0 right-0 left-0 h-1 bg-gradient-to-r from-[#A3B18A] via-[#3A5A40] to-[#344E41]" />

        <motion.div
          aria-hidden
          animate={reduzir ? {} : { x: [0, 40, 0], y: [0, 30, 0] }}
          transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -top-40 -right-40 h-96 w-96 rounded-full bg-[#A3B18A] opacity-30 blur-3xl dark:bg-[#1C2920]"
        />

        <motion.div
          aria-hidden
          animate={reduzir ? {} : { x: [0, -40, 0], y: [0, -30, 0] }}
          transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -bottom-40 -left-40 h-96 w-96 rounded-full bg-[#A3B18A] opacity-25 blur-3xl dark:bg-[#1C2920]"
        />

        <div className="relative z-10 container mx-auto px-4 py-16 md:px-6 lg:py-24 2xl:max-w-[1400px]">
          <div className="mx-auto grid max-w-6xl items-center gap-14 lg:grid-cols-2">
            
            <motion.div variants={container} initial="hidden" animate="show" className="text-center lg:text-left">
              <motion.h1 variants={item} className="mb-6 text-4xl font-bold tracking-tight lg:text-6xl">
                Transforme a sua empresa com{" "}
                <span className="bg-gradient-to-r from-[#3A5A40] via-[#588157] to-[#3A5A40] bg-[length:200%_auto] bg-clip-text text-transparent dark:from-[#A3B18A] dark:via-[#A3B18A] dark:to-[#A3B18A] motion-safe:animate-[shimmer_6s_linear_infinite]">
                  a Visora
                </span>
              </motion.h1>

              <motion.p variants={item} className="text-muted-foreground mx-auto mb-10 max-w-lg text-lg lg:mx-0 lg:text-xl">
                Controle seus processos, acompanhe resultados e otimize a rotina da empresa em uma única plataforma.
              </motion.p>

              <motion.div variants={item} className="mb-12">
                <PainelAnimado reduzir={reduzir} />
              </motion.div>

              <div className="grid gap-5">
                {features.map(({ icon: Icon, title, text }) => (
                  <motion.div
                    key={title}
                    variants={item}
                    whileHover={reduzir ? undefined : { x: 6 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                    className="flex items-start text-left"
                  >
                    <div className="mr-4 flex-shrink-0 rounded-full bg-[#E7EFE5] p-2 dark:bg-[#1C2920]/50">
                      <Icon className="h-5 w-5 text-[#3A5A40] dark:text-[#A3B18A]" />
                    </div>
                    <div>
                      <h3 className="text-base font-semibold">{title}</h3>
                      <p className="text-muted-foreground text-sm">{text}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="relative"
            >
              <div aria-hidden className="absolute -inset-1 rounded-2xl bg-gradient-to-br from-[#A3B18A] via-[#3A5A40] to-[#A3B18A] opacity-30 blur-xl" />

              <Card className="relative flex min-h-[500px] flex-col overflow-hidden rounded-[24px] border border-[#DAD7CD] bg-white pb-0 text-[#273B31] shadow-xl shadow-[#273B31]/10 dark:border-[#34483A] dark:bg-[#1C2920] dark:text-[#E5EDE5] dark:shadow-black/20">
                <CardHeader className="space-y-1 px-6 pb-5 pt-7 sm:px-8">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={view}
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      transition={{ duration: 0.2 }}
                    >
                      <CardTitle className="text-2xl font-bold tracking-tight text-[#273B31] dark:text-[#E5EDE5] sm:text-3xl">
                        {view === "login" ? "Entre na sua conta" : view === "recuperar" ? "Recuperar senha" : "Recuperar usuário"}
                      </CardTitle>
                      <CardDescription className="mt-2 leading-6 text-[#718573] dark:text-[#B4C5B5]">
                        {view === "login"
                          ? "Acesse sua conta Visora com seu usuário e senha."
                          : view === "recuperar"
                            ? "Informe o e-mail cadastrado para receber um link de redefinição de senha."
                            : "Informe o e-mail cadastrado para receber seu nome de usuário."}
                      </CardDescription>
                    </motion.div>
                  </AnimatePresence>
                </CardHeader>

                <CardContent className="relative flex-1 px-6 pb-7 sm:px-8">
                  <AnimatePresence mode="wait">
                    
                    {view === "login" && (
                      <motion.form
                        key="form-login"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.3 }}
                        onSubmit={handleLoginSubmit}
                        className="space-y-5"
                      >
                        <div className="space-y-1">
                          <Label htmlFor="identificador" className="text-[18px] font-semibold text-[#273B31] dark:text-[#E5EDE5]">
                            Usuário
                          </Label>
                          <Input
                            id="identificador"
                            name="identificador"
                            type="text"
                            placeholder="Insira seu usuário"
                            value={formData.identificador}
                            onChange={handleChange}
                            autoComplete="username"
                            required
                            disabled={loadingLogin}
                            className="h-12 rounded-xl border-[#DAD7CD] bg-[#FAFBF9] px-4 text-[#273B31] placeholder:text-[#91A093] focus-visible:border-[#588157] focus-visible:ring-[#588157]/20 dark:border-[#34483A] dark:bg-[#111A14] dark:text-[#E5EDE5] dark:placeholder:text-[#809484]"
                          />
                          <div className="flex justify-end pt-1">
                            <button type="button" onClick={() => setView("recuperarUsuario")} className="text-sm font-semibold text-[#3A5A40] underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#588157] dark:text-[#A3B18A]">
                              Esqueceu o usuário?
                            </button>
                          </div>
                        </div>

                        <div className="space-y-1">
                          <Label htmlFor="senha" className="text-[18px] font-semibold text-[#273B31] dark:text-[#E5EDE5]">Senha</Label>

                          <div className="relative">
                            <Input
                              id="senha"
                              name="senha"
                              type={mostrarSenha ? "text" : "password"}
                              placeholder="Insira sua senha"
                              className="h-12 rounded-xl border-[#DAD7CD] bg-[#FAFBF9] px-4 pr-12 text-[#273B31] placeholder:text-[#91A093] focus-visible:border-[#588157] focus-visible:ring-[#588157]/20 dark:border-[#34483A] dark:bg-[#111A14] dark:text-[#E5EDE5]"
                              value={formData.senha}
                              onChange={handleChange}
                              autoComplete="current-password"
                              required
                              disabled={loadingLogin}
                            />
                            <button
                              type="button"
                              onClick={() => setMostrarSenha(!mostrarSenha)}
                              className="text-muted-foreground hover:text-foreground absolute inset-y-0 right-3 flex items-center focus:outline-none"
                              aria-label={mostrarSenha ? "Esconder senha" : "Mostrar senha"}
                            >
                              {mostrarSenha ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                          </div>
                          <div className="flex justify-end pt-1">
                            <button type="button" onClick={() => setView("recuperar")} className="text-sm font-semibold text-[#3A5A40] underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#588157] dark:text-[#A3B18A]">
                              Esqueceu a senha?
                            </button>
                          </div>
                        </div>

                        <AnimatePresence>
                          {erroLogin && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: "auto" }}
                              exit={{ opacity: 0, height: 0 }}
                              className="overflow-hidden"
                            >
                              <div className="mt-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/30 dark:text-red-300" role="alert">
                                {erroLogin}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>

                        <motion.div whileHover={desabilitadoLogin || reduzir ? undefined : { scale: 1.02 }} whileTap={desabilitadoLogin || reduzir ? undefined : { scale: 0.97 }} className="pt-2">
                          <Button type="submit" className="group relative h-12 w-full overflow-hidden rounded-xl bg-[#3A5A40] font-semibold text-white shadow-sm hover:bg-[#588157] dark:bg-[#588157] dark:hover:bg-[#70966F]" disabled={desabilitadoLogin}>
                            {loadingLogin ? (
                              <span className="flex items-center gap-2">
                                <svg className="h-5 w-5 animate-spin text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                </svg>
                                Entrando...
                              </span>
                            ) : (
                              <span className="flex items-center gap-2">
                                Entrar
                                <ArrowRightIcon className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                              </span>
                            )}
                          </Button>
                        </motion.div>
                      </motion.form>
                    )}

                    {view === "recuperar" && (
                      <motion.form
                        key="form-recuperar"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        transition={{ duration: 0.3 }}
                        onSubmit={handleRecuperarSubmit}
                        className="space-y-5"
                      >
                        <div className="space-y-2">
                          <Label htmlFor="emailRecuperacao" className="text-[18px] font-semibold text-[#273B31] dark:text-[#E5EDE5]">
                            E-mail cadastrado
                          </Label>
                          <Input
                            id="emailRecuperacao"
                            type="email"
                            autoComplete="email"
                            placeholder="exemplo@email.com"
                            value={emailRecuperacao}
                            onChange={(e) => {
                              setEmailRecuperacao(e.target.value);
                              setStatusRecuperacao({ tipo: "", mensagem: "" });
                            }}
                            required
                            disabled={loadingRecuperacao}
                            className="h-12 rounded-xl border-[#DAD7CD] bg-[#FAFBF9] px-4 text-[#273B31] placeholder:text-[#91A093] focus-visible:border-[#588157] focus-visible:ring-[#588157]/20 dark:border-[#34483A] dark:bg-[#111A14] dark:text-[#E5EDE5] dark:placeholder:text-[#809484]"
                          />
                        </div>

                        <AnimatePresence>
                          {statusRecuperacao.mensagem && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: "auto" }}
                              exit={{ opacity: 0, height: 0 }}
                              className="overflow-hidden"
                            >
                              <div
                                className={`mt-2 rounded-lg border px-4 py-3 text-sm ${
                                  statusRecuperacao.tipo === "sucesso"
                                    ? "border-green-200 bg-green-50 text-green-700 dark:border-green-900/50 dark:bg-green-900/20 dark:text-green-400"
                                    : "border-red-200 bg-red-50 text-red-700 dark:border-red-900 dark:bg-red-950/30 dark:text-red-300"
                                }`}
                                role="alert"
                              >
                                {statusRecuperacao.mensagem}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>

                        <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-[#718573] dark:text-[#B4C5B5]">
                          <span>Não lembra o nome de usuário?</span>
                          <button type="button" onClick={() => setView("recuperarUsuario")} className="font-semibold text-[#3A5A40] hover:underline dark:text-[#A3B18A]">Recuperar usuário</button>
                        </div>

                        <div className="pt-2 flex flex-col gap-3">
                          <motion.div whileHover={desabilitadoRecuperacao || reduzir ? undefined : { scale: 1.02 }} whileTap={desabilitadoRecuperacao || reduzir ? undefined : { scale: 0.97 }}>
                            <Button type="submit" className="h-12 w-full rounded-xl bg-[#3A5A40] font-semibold text-white shadow-sm hover:bg-[#588157] dark:bg-[#588157] dark:hover:bg-[#70966F]" disabled={desabilitadoRecuperacao}>
                              {loadingRecuperacao ? (
                                <span className="flex items-center gap-2">
                                  <svg className="h-5 w-5 animate-spin text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                  </svg>
                                  Enviando...
                                </span>
                              ) : (
                                "Enviar instruções"
                              )}
                            </Button>
                          </motion.div>


                          <Button
                            type="button"
                            variant="ghost"
                            onClick={() => {
                              setView("login");
                              setStatusRecuperacao({ tipo: "", mensagem: "" });
                              setEmailRecuperacao("");
                            }}
                            className="h-12 w-full rounded-xl border border-[#DAD7CD] text-[#3A5A40] hover:bg-[#EDF3EB] dark:border-[#34483A] dark:text-[#D8E7D8] dark:hover:bg-[#273B31]"
                          >
                            <ArrowLeftIcon className="mr-2 h-4 w-4" />
                            Voltar para o login
                          </Button>
                        </div>
                      </motion.form>
                    )}

                    {view === "recuperarUsuario" && (
                      <motion.form
                        key="form-recuperar-usuario"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        transition={{ duration: 0.3 }}
                        onSubmit={handleRecuperarUsuarioSubmit}
                        className="space-y-5"
                      >
                        <div className="space-y-2">
                          <Label htmlFor="emailRecuperacaoUsuario" className="text-[18px] font-semibold text-[#273B31] dark:text-[#E5EDE5]">
                            E-mail cadastrado
                          </Label>
                          <Input
                            id="emailRecuperacaoUsuario"
                            type="email"
                            autoComplete="email"
                            placeholder="exemplo@email.com"
                            value={emailRecuperacaoUsuario}
                            onChange={(e) => {
                              setEmailRecuperacaoUsuario(e.target.value);
                              setStatusRecuperacaoUsuario({ tipo: "", mensagem: "" });
                            }}
                            required
                            disabled={loadingRecuperacaoUsuario}
                            className="h-12 rounded-xl border-[#DAD7CD] bg-[#FAFBF9] px-4 text-[#273B31] placeholder:text-[#91A093] focus-visible:border-[#588157] focus-visible:ring-[#588157]/20 dark:border-[#34483A] dark:bg-[#111A14] dark:text-[#E5EDE5] dark:placeholder:text-[#809484]"
                          />
                        </div>

                        <AnimatePresence>
                          {statusRecuperacaoUsuario.mensagem && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: "auto" }}
                              exit={{ opacity: 0, height: 0 }}
                              className="overflow-hidden"
                            >
                              <div
                                className={`mt-2 rounded-lg border px-4 py-3 text-sm ${
                                  statusRecuperacaoUsuario.tipo === "sucesso"
                                    ? "border-green-200 bg-green-50 text-green-700 dark:border-green-900/50 dark:bg-green-900/20 dark:text-green-400"
                                    : "border-red-200 bg-red-50 text-red-700 dark:border-red-900 dark:bg-red-950/30 dark:text-red-300"
                                }`}
                                role="alert"
                              >
                                {statusRecuperacaoUsuario.mensagem}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>

                        <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-[#718573] dark:text-[#B4C5B5]">
                          <span>Esqueceu sua senha também?</span>
                          <button type="button" onClick={() => setView("recuperar")} className="font-semibold text-[#3A5A40] hover:underline dark:text-[#A3B18A]">Recuperar senha</button>
                        </div>

                        <div className="flex flex-col gap-3 pt-2">
                          <motion.div
                            whileHover={desabilitadoRecuperacaoUsuario || reduzir ? undefined : { scale: 1.02 }}
                            whileTap={desabilitadoRecuperacaoUsuario || reduzir ? undefined : { scale: 0.97 }}
                          >
                            <Button
                              type="submit"
                              className="h-12 w-full rounded-xl bg-[#3A5A40] font-semibold text-white shadow-sm hover:bg-[#588157] dark:bg-[#588157] dark:hover:bg-[#70966F]"
                              disabled={desabilitadoRecuperacaoUsuario}
                            >
                              {loadingRecuperacaoUsuario ? "Enviando..." : "Recuperar meu usuário"}
                            </Button>
                          </motion.div>
                          <Button
                            type="button"
                            variant="ghost"
                            onClick={() => {
                              setView("login");
                              setStatusRecuperacaoUsuario({ tipo: "", mensagem: "" });
                              setEmailRecuperacaoUsuario("");
                            }}
                            className="h-12 w-full rounded-xl border border-[#DAD7CD] text-[#3A5A40] hover:bg-[#EDF3EB] dark:border-[#34483A] dark:text-[#D8E7D8] dark:hover:bg-[#273B31]"
                          >
                            <ArrowLeftIcon className="mr-2 h-4 w-4" />
                            Voltar para o login
                          </Button>
                        </div>
                      </motion.form>
                    )}
                  </AnimatePresence>
                </CardContent>


                <div className="mt-auto border-t border-[#DAD7CD] bg-[#F1F4EF] px-6 py-4 dark:border-[#34483A] dark:bg-[#111A14]/60">
                  <div className="text-muted-foreground flex items-center justify-center gap-2 text-sm">
                    <LockIcon className="h-4 w-4 shrink-0" />
                    <span>Seus dados estão protegidos e sua privacidade é nossa prioridade.</span>
                  </div>
                </div>
              </Card>

   
              <div className="mt-6 flex items-center justify-center gap-2">
                <ShieldCheckIcon className="text-muted-foreground h-4 w-4" />
                <p className="text-muted-foreground text-xs">
                  Acesso seguro | Privacidade | Proteção de dados
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      <FooterAreaPublica />
    </>
  );
}
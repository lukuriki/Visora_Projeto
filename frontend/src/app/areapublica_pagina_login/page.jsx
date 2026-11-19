
"use client";

import FooterAreaPublica from "@/components/FooterAreaPublica";
import HeaderAreaPublica from "@/components/HeaderAreaPublica";

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

// ==========================================
// CONFIGURAÇÕES
// ==========================================

// Altere somente se o dashboard administrativo
// utilizar outro caminho no seu projeto.
const ROTA_DASHBOARD_ADMIN = "/administracao_pagina_inicial";

const ROTA_DASHBOARD_CLIENTE =
  "/plataforma_pagina_inicial";

// ==========================================
// VARIANTES DE ANIMAÇÃO
// ==========================================

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

// ==========================================
// BENEFÍCIOS DA PLATAFORMA
// ==========================================

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

// ==========================================
// MOCKUP ANIMADO DO PAINEL
// ==========================================

function PainelAnimado({ reduzir }) {
  const barras = [38, 56, 44, 72, 63, 88, 100];

  return (
    <div className="relative mx-auto w-full max-w-md lg:mx-0">
      <motion.div
        initial={{
          opacity: 0,
          y: 30,
          rotateX: 12,
        }}
        animate={{
          opacity: 1,
          y: 0,
          rotateX: 0,
        }}
        transition={{
          duration: 0.9,
          delay: 0.5,
          ease: [0.22, 1, 0.36, 1],
        }}
        style={{
          transformPerspective: 900,
        }}
        className="rounded-2xl border bg-white/80 p-5 shadow-xl backdrop-blur dark:bg-[#173d2b]/60"
      >
        <div className="mb-4 flex items-center justify-between">
          <div>
            <p className="text-muted-foreground text-xs">
              Resultado do mês
            </p>

            <p className="text-2xl font-bold text-[#176B45] dark:text-[#6fbf91]">
              R$ 48.920
            </p>
          </div>

          <span className="flex items-center gap-1 rounded-full bg-[#e2f0e5] px-2.5 py-1 text-xs font-medium text-[#176B45] dark:bg-[#173d2b] dark:text-[#6fbf91]">
            <TrendingUpIcon className="h-3 w-3" />
            +18%
          </span>
        </div>

        <div className="flex h-28 items-end gap-2">
          {barras.map((altura, indice) => (
            <motion.div
              key={indice}
              initial={{ height: 0 }}
              animate={{
                height: `${altura}%`,
              }}
              transition={{
                duration: 0.8,
                delay: 0.9 + indice * 0.08,
                ease: [0.22, 1, 0.36, 1],
              }}
              className={`flex-1 rounded-t-md ${
                indice === barras.length - 1
                  ? "bg-[#176B45]"
                  : "bg-[#A3B18A]/60 dark:bg-[#6fbf91]/30"
              }`}
            />
          ))}
        </div>

        <svg
          viewBox="0 0 300 40"
          className="mt-4 h-10 w-full"
          fill="none"
        >
          <motion.path
            d="M0 32 C 40 30, 60 12, 100 18 S 170 34, 210 16 S 270 6, 300 4"
            stroke="#588157"
            strokeWidth="2.5"
            strokeLinecap="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{
              duration: 1.6,
              delay: 1.4,
              ease: "easeInOut",
            }}
          />
        </svg>
      </motion.div>

      {/* NOTIFICAÇÃO SUPERIOR */}

      <motion.div
        initial={{
          opacity: 0,
          scale: 0.8,
        }}
        animate={
          reduzir
            ? {
                opacity: 1,
                scale: 1,
              }
            : {
                opacity: 1,
                scale: 1,
                y: [0, -8, 0],
              }
        }
        transition={{
          opacity: {
            delay: 1.8,
            duration: 0.4,
          },
          scale: {
            delay: 1.8,
            type: "spring",
          },
          y: {
            delay: 2.2,
            duration: 5,
            repeat: Infinity,
            ease: "easeInOut",
          },
        }}
        className="absolute -top-4 -right-2 flex items-center gap-2 rounded-xl border bg-white px-3 py-2 text-xs shadow-lg dark:bg-[#102d20] md:-right-6"
      >
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#6fbf91] opacity-75" />

          <span className="relative inline-flex h-2 w-2 rounded-full bg-[#176B45]" />
        </span>

        3 novos pedidos
      </motion.div>

      {/* NOTIFICAÇÃO INFERIOR */}

      <motion.div
        initial={{
          opacity: 0,
          scale: 0.8,
        }}
        animate={
          reduzir
            ? {
                opacity: 1,
                scale: 1,
              }
            : {
                opacity: 1,
                scale: 1,
                y: [0, 8, 0],
              }
        }
        transition={{
          opacity: {
            delay: 2.1,
            duration: 0.4,
          },
          scale: {
            delay: 2.1,
            type: "spring",
          },
          y: {
            delay: 2.5,
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut",
          },
        }}
        className="absolute -bottom-5 -left-2 flex items-center gap-2 rounded-xl border bg-white px-3 py-2 text-xs shadow-lg dark:bg-[#102d20] md:-left-6"
      >
        <CheckIcon className="h-4 w-4 text-[#176B45] dark:text-[#6fbf91]" />

        Meta semanal atingida
      </motion.div>
    </div>
  );
}

// ==========================================
// PÁGINA DE LOGIN
// ==========================================

export default function Login() {
  const reduzir = useReducedMotion();
  const router = useRouter();

  const { scrollYProgress } = useScroll();

  const progresso = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 25,
  });

  // ======================================
  // ESTADOS
  // ======================================

  const [mostrarSenha, setMostrarSenha] =
    useState(false);

  const [formData, setFormData] = useState({
    identificador: "",
    senha: "",
  });

  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState("");

  // ======================================
  // ALTERAR CAMPOS
  // ======================================

  function handleChange(e) {
    const { name, value } = e.target;

    setFormData((anterior) => ({
      ...anterior,
      [name]: value,
    }));

    if (erro) {
      setErro("");
    }
  }

  // ======================================
  // LOGIN
  // ======================================

  async function handleSubmit(e) {
    e.preventDefault();
    if (loading) return;

    setErro("");
    setLoading(true);

    try {
      // Endpoint único: o backend autentica e informa o tipo da conta.
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

      // Não deixar sessões antigas de outros perfis no navegador.
      ["admin-token", "visora-token", "visora-usuario"].forEach((chave) => {
        sessionStorage.removeItem(chave);
        localStorage.removeItem(chave);
      });

      if (admin) {
        if (!resultado.administrador) {
          throw new Error("O servidor não retornou o perfil administrativo.");
        }
        sessionStorage.setItem("admin-token", resultado.token);
        router.replace(ROTA_DASHBOARD_ADMIN);
      } else {
        if (!resultado.usuario) {
          throw new Error("O servidor não retornou o perfil do cliente.");
        }
        sessionStorage.setItem("visora-token", resultado.token);
        sessionStorage.setItem("visora-usuario", JSON.stringify(resultado.usuario));
        router.replace(ROTA_DASHBOARD_CLIENTE);
      }
    } catch (error) {
      setErro(error?.message || "Não foi possível realizar o login.");
    } finally {
      setLoading(false);
    }
  }

  // ======================================
  // VALIDAÇÃO
  // ======================================

  const desabilitado = loading || !formData.identificador.trim() || !formData.senha;

  // ======================================
  // INTERFACE
  // ======================================

  return (
    <>
      <HeaderAreaPublica />

      {/* BARRA DE PROGRESSO */}

      <motion.div
        style={{ scaleX: progresso }}
        className="fixed inset-x-0 top-0 z-[60] h-1 origin-left bg-gradient-to-r from-[#588157] via-[#A3B18A] to-[#588157]"
      />

      {/* ======================================
          HERO
      ====================================== */}

      <div className="relative overflow-hidden bg-gradient-to-b from-[#f5f8f5] to-white py-20 dark:from-[#102d20] dark:to-[#111c15]">
        <div className="bg-grid-slate-200 dark:bg-grid-slate-800/20 absolute inset-0 bg-[size:24px_24px] opacity-10" />

        <div className="absolute top-0 right-0 left-0 h-1 bg-gradient-to-r from-[#6fbf91] via-[#176B45] to-[#125538]" />

        {/* AURAS */}

        <motion.div
          aria-hidden
          animate={
            reduzir
              ? {}
              : {
                  x: [0, 40, 0],
                  y: [0, 30, 0],
                }
          }
          transition={{
            duration: 18,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute -top-40 -right-40 h-96 w-96 rounded-full bg-[#9fd3b3] opacity-30 blur-3xl dark:bg-[#173d2b]"
        />

        <motion.div
          aria-hidden
          animate={
            reduzir
              ? {}
              : {
                  x: [0, -40, 0],
                  y: [0, -30, 0],
                }
          }
          transition={{
            duration: 22,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute -bottom-40 -left-40 h-96 w-96 rounded-full bg-[#A3B18A] opacity-25 blur-3xl dark:bg-[#173d2b]"
        />

        {/* CONTEÚDO */}

        <div className="relative z-10 container mx-auto px-4 py-16 md:px-6 lg:py-24 2xl:max-w-[1400px]">
          <div className="mx-auto grid max-w-6xl items-center gap-14 lg:grid-cols-2">
            {/* ==================================
                COLUNA ESQUERDA
            ================================== */}

            <motion.div
              variants={container}
              initial="hidden"
              animate="show"
              className="text-center lg:text-left"
            >
              <motion.h1
                variants={item}
                className="mb-6 text-4xl font-bold tracking-tight lg:text-6xl"
              >
                Transforme a sua empresa com{" "}
                <span className="bg-gradient-to-r from-[#176B45] via-[#588157] to-[#176B45] bg-[length:200%_auto] bg-clip-text text-transparent dark:from-[#6fbf91] dark:via-[#A3B18A] dark:to-[#6fbf91] motion-safe:animate-[shimmer_6s_linear_infinite]">
                  a Visora
                </span>
              </motion.h1>

              <motion.p
                variants={item}
                className="text-muted-foreground mx-auto mb-10 max-w-lg text-lg lg:mx-0 lg:text-xl"
              >
                Controle seus processos, acompanhe
                resultados e otimize a rotina da empresa
                em uma única plataforma.
              </motion.p>

              <motion.div
                variants={item}
                className="mb-12"
              >
                <PainelAnimado reduzir={reduzir} />
              </motion.div>

              {/* BENEFÍCIOS */}

              <div className="grid gap-5">
                {features.map(
                  ({
                    icon: Icon,
                    title,
                    text,
                  }) => (
                    <motion.div
                      key={title}
                      variants={item}
                      whileHover={
                        reduzir
                          ? undefined
                          : { x: 6 }
                      }
                      transition={{
                        type: "spring",
                        stiffness: 300,
                        damping: 20,
                      }}
                      className="flex items-start text-left"
                    >
                      <div className="mr-4 flex-shrink-0 rounded-full bg-[#e2f0e5] p-2 dark:bg-[#173d2b]/50">
                        <Icon className="h-5 w-5 text-[#176B45] dark:text-[#6fbf91]" />
                      </div>

                      <div>
                        <h3 className="text-base font-semibold">
                          {title}
                        </h3>

                        <p className="text-muted-foreground text-sm">
                          {text}
                        </p>
                      </div>
                    </motion.div>
                  )
                )}
              </div>
            </motion.div>

            {/* ==================================
                COLUNA DIREITA
            ================================== */}

            <motion.div
              initial={{
                opacity: 0,
                x: 40,
              }}
              animate={{
                opacity: 1,
                x: 0,
              }}
              transition={{
                duration: 0.8,
                delay: 0.3,
                ease: [0.22, 1, 0.36, 1],
              }}
              className="relative"
            >
              {/* BRILHO DO CARD */}

              <div
                aria-hidden
                className="absolute -inset-1 rounded-2xl bg-gradient-to-br from-[#6fbf91] via-[#176B45] to-[#A3B18A] opacity-30 blur-xl"
              />

              <Card className="relative overflow-hidden border pb-0 shadow-xl dark:shadow-[#173d2b]/10">
                <CardHeader className="space-y-1 pb-4">
                  <CardTitle className="text-4xl font-bold">
                    Entre na sua conta
                  </CardTitle>

                  <CardDescription>
                    Acesse sua conta Visora com seu usuário e senha.
                  </CardDescription>
                </CardHeader>

                <CardContent>
                  <form
                    onSubmit={handleSubmit}
                    className="space-y-5"
                  >
                    {/* ==========================
                        IDENTIFICAÇÃO ÚNICA
                    ========================== */}
                    <div className="space-y-2">
                      <Label htmlFor="identificador" className="text-lg">
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
                        disabled={loading}
                        className="h-10"
                      />
                    </div>

                    {/* ==========================
                        SENHA
                    ========================== */}

                    <div className="space-y-2">
                      <Label
                        htmlFor="senha"
                        className="text-lg"
                      >
                        Senha
                      </Label>

                      <div className="relative">
                        <Input
                          id="senha"
                          name="senha"
                          type={
                            mostrarSenha
                              ? "text"
                              : "password"
                          }
                          placeholder="Insira sua senha"
                          className="h-10 pr-10"
                          value={formData.senha}
                          onChange={handleChange}
                          autoComplete="current-password"
                          required
                          disabled={loading}
                        />

                        <button
                          type="button"
                          onClick={() =>
                            setMostrarSenha(
                              !mostrarSenha
                            )
                          }
                          className="text-muted-foreground hover:text-foreground absolute inset-y-0 right-3 flex items-center"
                          aria-label={
                            mostrarSenha
                              ? "Esconder senha"
                              : "Mostrar senha"
                          }
                        >
                          {mostrarSenha ? (
                            <EyeOff size={18} />
                          ) : (
                            <Eye size={18} />
                          )}
                        </button>
                      </div>
                    </div>

                    {/* ==========================
                        MENSAGEM DE ERRO
                    ========================== */}

                    <AnimatePresence>
                      {erro && (
                        <motion.div
                          initial={{
                            opacity: 0,
                            y: -8,
                          }}
                          animate={{
                            opacity: 1,
                            y: 0,
                          }}
                          exit={{
                            opacity: 0,
                            y: -8,
                          }}
                          className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/30 dark:text-red-300"
                          role="alert"
                        >
                          {erro}
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* ==========================
                        BOTÃO DE LOGIN
                    ========================== */}

                    <motion.div
                      whileHover={
                        desabilitado || reduzir
                          ? undefined
                          : { scale: 1.02 }
                      }
                      whileTap={
                        desabilitado || reduzir
                          ? undefined
                          : { scale: 0.97 }
                      }
                    >
                      <Button
                        type="submit"
                        className="group relative h-11 w-full overflow-hidden bg-[#176B45] text-white hover:bg-[#125538]"
                        disabled={desabilitado}
                      >
                        {loading ? (
                          <span className="flex items-center gap-2">
                            <svg
                              className="h-5 w-5 animate-spin text-white"
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              viewBox="0 0 24 24"
                            >
                              <circle
                                className="opacity-25"
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                strokeWidth="4"
                              />

                              <path
                                className="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                              />
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
                  </form>
                </CardContent>

                {/* ==========================
                    RODAPÉ DO CARD
                ========================== */}

                <div className="mt-6 border-t bg-[#f5f8f5] px-6 py-4 dark:bg-[#102d20]/50">
                  <div className="text-muted-foreground flex items-center justify-center gap-2 text-sm">
                    <LockIcon className="h-4 w-4 shrink-0" />

                    <span>
                      Seus dados estão protegidos e sua
                      privacidade é nossa prioridade.
                    </span>
                  </div>
                </div>
              </Card>

              {/* SELOS DE CONFIANÇA */}

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

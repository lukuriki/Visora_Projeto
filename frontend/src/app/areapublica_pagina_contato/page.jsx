"use client";

import FooterAreaPublica from "@/components/FooterAreaPublica";
import HeaderAreaPublica from "@/components/HeaderAreaPublica";

import { useEffect, useRef, useState } from "react";

import { criarConversaContato } from "@/lib/api";

import {
  motion,
  MotionConfig,
  useMotionTemplate,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
} from "framer-motion";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Mail, MapPin, Phone, Send } from "lucide-react";


const CORES_PARTICULAS = {
  claro: { ponto: "58,90,64", linha: "88,129,87", alpha: 0.48 },
  escuro: { ponto: "163,177,138", linha: "163,177,138", alpha: 0.3 },
};

const DISTANCIA_LIGACAO = 130;
const RAIO_MOUSE = 140;

function FundoParticulas({ className = "" }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");

    const reduzir = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    let largura = 0;
    let altura = 0;
    let pontos = [];
    let raf = 0;

    const mouse = { x: -9999, y: -9999 };

    const temaEscuro = () =>
      document.documentElement.classList.contains("dark");

    function criarPontos() {
      const quantidade = Math.min(
        110,
        Math.floor((largura * altura) / 14000)
      );

      pontos = Array.from({ length: quantidade }, () => ({
        x: Math.random() * largura,
        y: Math.random() * altura,
        vx: (Math.random() - 0.5) * 0.35,
        vy: (Math.random() - 0.5) * 0.35,
        r: Math.random() * 1.6 + 1,
      }));
    }

    function redimensionar() {
      const pai = canvas.parentElement;
      if (!pai) return;

      const dpr = Math.min(window.devicePixelRatio || 1, 2);

      largura = pai.clientWidth;
      altura = pai.clientHeight;

      canvas.width = largura * dpr;
      canvas.height = altura * dpr;

      canvas.style.width = `${largura}px`;
      canvas.style.height = `${altura}px`;

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      criarPontos();
      desenhar();
    }

    function atualizar() {
      for (const p of pontos) {
        const dx = p.x - mouse.x;
        const dy = p.y - mouse.y;
        const dist = Math.hypot(dx, dy);

        if (dist < RAIO_MOUSE && dist > 0) {
          const forca = (1 - dist / RAIO_MOUSE) * 0.6;

          p.x += (dx / dist) * forca;
          p.y += (dy / dist) * forca;
        }

        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0 || p.x > largura) p.vx *= -1;
        if (p.y < 0 || p.y > altura) p.vy *= -1;
      }
    }

    function desenhar() {
      const cor = temaEscuro()
        ? CORES_PARTICULAS.escuro
        : CORES_PARTICULAS.claro;

      ctx.clearRect(0, 0, largura, altura);

      for (let i = 0; i < pontos.length; i++) {
        const a = pontos[i];

        for (let j = i + 1; j < pontos.length; j++) {
          const b = pontos[j];
          const d = Math.hypot(a.x - b.x, a.y - b.y);

          if (d < DISTANCIA_LIGACAO) {
            const opacidade =
              (1 - d / DISTANCIA_LIGACAO) * cor.alpha;

            ctx.strokeStyle = `rgba(${cor.linha},${opacidade})`;
            ctx.lineWidth = 1;

            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }

        ctx.fillStyle = `rgba(${cor.ponto},0.7)`;

        ctx.beginPath();
        ctx.arc(a.x, a.y, a.r, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    function loop() {
      atualizar();
      desenhar();
      raf = requestAnimationFrame(loop);
    }

    function aoMoverMouse(e) {
      const caixa = canvas.getBoundingClientRect();

      mouse.x = e.clientX - caixa.left;
      mouse.y = e.clientY - caixa.top;
    }

    function aoSairMouse() {
      mouse.x = -9999;
      mouse.y = -9999;
    }

    redimensionar();

    if (!reduzir) loop();

    const observador = new MutationObserver(desenhar);

    observador.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    window.addEventListener("resize", redimensionar);
    window.addEventListener("mousemove", aoMoverMouse);
    window.addEventListener("mouseout", aoSairMouse);

    return () => {
      cancelAnimationFrame(raf);
      observador.disconnect();

      window.removeEventListener("resize", redimensionar);
      window.removeEventListener("mousemove", aoMoverMouse);
      window.removeEventListener("mouseout", aoSairMouse);
    };
  }, []);

  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none absolute inset-0 -z-10 overflow-hidden bg-[#E8EDE3] dark:bg-[#1B2820] ${className}`}
    >
      <canvas ref={canvasRef} className="absolute inset-0" />

      <div className="absolute inset-0 bg-gradient-to-b from-[#E8EDE3]/95 via-[#E8EDE3]/25 to-[#E8EDE3]/95 dark:from-[#1B2820] dark:via-transparent dark:to-[#1B2820]" />
    </div>
  );
}

const TAMANHOS_TITULO = {
  grande: {
    texto: "text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight",
    aura: "h-40 w-[85%] sm:h-48",
    linha: "mt-5 h-1 w-28",
    sub: "mt-5 text-base sm:text-lg",
  },

  medio: {
    texto: "text-xl sm:text-2xl font-bold tracking-tight",
    aura: "h-20 w-[90%]",
    linha: "mt-3 h-0.5 w-14",
    sub: "mt-3 text-sm",
  },
};

const paiTitulo = {
  oculto: {},

  visivel: {
    transition: {
      staggerChildren: 0.09,
      delayChildren: 0.1,
    },
  },
};

const palavraVar = {
  oculto: {
    opacity: 0,
    y: 28,
    filter: "blur(14px)",
  },

  visivel: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: {
      type: "spring",
      stiffness: 90,
      damping: 16,
    },
  },
};

function TituloAurora({
  children,
  as = "h1",
  tamanho = "grande",
  subtitulo,
  alinhamento = "centro",
  className = "",
}) {
  const reduzir = useReducedMotion();

  const t = TAMANHOS_TITULO[tamanho] ?? TAMANHOS_TITULO.grande;
  const Tag = motion[as] ?? motion.h1;

  const palavras = String(children).split(" ");
  const centro = alinhamento === "centro";

  return (
    <motion.div
      className={`relative isolate ${centro ? "mx-auto text-center" : ""} ${className}`}
      initial="oculto"
      whileInView="visivel"
      viewport={{ once: true, amount: 0.4 }}
      variants={paiTitulo}
    >
      <div
        aria-hidden="true"
        className={`pointer-events-none absolute top-1/2 -z-10 -translate-y-1/2 ${
          centro ? "left-1/2 -translate-x-1/2" : "left-0"
        } ${t.aura}`}
      >
        <motion.div
          className="h-full w-full rounded-full bg-gradient-to-r from-[#588157]/35 via-[#A3B18A]/45 to-[#588157]/35 blur-3xl dark:from-[#588157]/30 dark:via-[#A3B18A]/25 dark:to-[#588157]/30"
          animate={
            reduzir
              ? undefined
              : {
                  scale: [1, 1.15, 1],
                  opacity: [0.65, 1, 0.65],
                }
          }
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </div>

      <Tag className={`${t.texto} leading-[1.1]`}>
        {palavras.map((palavra, i) => (
          <motion.span
            key={`${palavra}-${i}`}
            variants={palavraVar}
            className={`inline-block pb-1 ${
              i < palavras.length - 1 ? "mr-[0.28em]" : ""
            }`}
          >
            <motion.span
              className="inline-block bg-gradient-to-r from-[#273B31] via-[#588157] to-[#273B31] bg-[length:200%_auto] bg-clip-text text-transparent dark:from-[#F1F3EC] dark:via-[#A3B18A] dark:to-[#F1F3EC]"
              animate={
                reduzir
                  ? undefined
                  : {
                      backgroundPosition: [
                        "0% center",
                        "200% center",
                      ],
                    }
              }
              transition={{
                duration: 7,
                repeat: Infinity,
                ease: "linear",
                delay: i * 0.25,
              }}
            >
              {palavra}
            </motion.span>
          </motion.span>
        ))}
      </Tag>

      <motion.span
        aria-hidden="true"
        className={`block rounded-full bg-gradient-to-r from-transparent via-[#588157] to-transparent dark:via-[#A3B18A] ${t.linha} ${
          centro ? "mx-auto" : ""
        }`}
        style={{ originX: centro ? 0.5 : 0 }}
        variants={{
          oculto: {
            scaleX: 0,
            opacity: 0,
          },

          visivel: {
            scaleX: 1,
            opacity: 1,
            transition: {
              duration: 0.8,
              ease: "easeOut",
              delay: 0.5,
            },
          },
        }}
      />

      {subtitulo && (
        <motion.p
          className={`text-muted-foreground ${t.sub} ${
            centro ? "mx-auto max-w-xl" : "max-w-xl"
          }`}
          variants={{
            oculto: {
              opacity: 0,
              y: 12,
              filter: "blur(6px)",
            },

            visivel: {
              opacity: 1,
              y: 0,
              filter: "blur(0px)",
              transition: {
                duration: 0.7,
                delay: 0.7,
              },
            },
          }}
        >
          {subtitulo}
        </motion.p>
      )}
    </motion.div>
  );
}


function Revelar({
  children,
  de = "baixo",
  delay = 0,
  className = "",
}) {
  const deslocamento = {
    baixo: { y: 40 },
    cima: { y: -40 },
    esquerda: { x: -60 },
    direita: { x: 60 },
  }[de];

  return (
    <motion.div
      className={className}
      initial={{
        opacity: 0,
        filter: "blur(8px)",
        ...deslocamento,
      }}
      whileInView={{
        opacity: 1,
        x: 0,
        y: 0,
        filter: "blur(0px)",
      }}
      viewport={{
        once: true,
        amount: 0.15,
      }}
      transition={{
        duration: 0.9,
        ease: [0.22, 1, 0.36, 1],
        delay,
      }}
    >
      {children}
    </motion.div>
  );
}

function CartaoHolofote({ children, className = "" }) {
  const x = useMotionValue(-500);
  const y = useMotionValue(-500);

  const holofote = useMotionTemplate`
    radial-gradient(380px circle at ${x}px ${y}px, rgba(88,129,87,0.18), transparent 70%)
  `;

  function mover(e) {
    const caixa = e.currentTarget.getBoundingClientRect();

    x.set(e.clientX - caixa.left);
    y.set(e.clientY - caixa.top);
  }

  return (
    <div
      onMouseMove={mover}
      className={`group relative ${className}`}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -inset-px rounded-xl bg-gradient-to-r from-[#588157]/0 via-[#A3B18A]/60 to-[#588157]/0 opacity-0 blur-md transition-opacity duration-500 group-hover:opacity-100"
      />

      <div className="relative">{children}</div>

      <motion.div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 rounded-xl opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{
          background: holofote,
        }}
      />
    </div>
  );
}

const listaVar = {
  oculto: {},

  visivel: {
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.35,
    },
  },
};

const itemVar = {
  oculto: {
    opacity: 0,
    y: 22,
    filter: "blur(6px)",
  },

  visivel: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: {
      duration: 0.6,
      ease: [0.22, 1, 0.36, 1],
    },
  },
};

function IconeOrbita({ children }) {
  return (
    <div className="relative mx-auto mb-5 flex h-14 w-14 items-center justify-center">
      {[0, 1].map((i) => (
        <motion.span
          key={i}
          aria-hidden="true"
          className="absolute inset-0 rounded-2xl border border-[#588157]/50 dark:border-[#A3B18A]/50"
          animate={{
            scale: [1, 1.9],
            opacity: [0.6, 0],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeOut",
            delay: i * 1.5,
          }}
        />
      ))}

      <motion.div
        className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-[#588157]/15 backdrop-blur-sm"
        animate={{
          y: [0, -7, 0],
          rotate: [0, 4, -4, 0],
        }}
        transition={{
          duration: 5,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      >
        {children}
      </motion.div>
    </div>
  );
}

function ItemContato({ icone: Icone, titulo, children }) {
  return (
    <motion.div
      variants={itemVar}
      whileHover={{ x: 8 }}
      transition={{
        type: "spring",
        stiffness: 300,
        damping: 20,
      }}
      className="group flex items-start gap-4 rounded-xl border border-[#C8D5C2]/80 bg-[#F3F6EF]/80 p-4 text-[#273B31] shadow-sm dark:border-white/10 dark:bg-[#24352A]/70 dark:text-[#F1F3EC]"
    >
      <motion.div
        whileHover={{
          scale: 1.2,
          rotate: [0, -12, 12, 0],
        }}
        transition={{ duration: 0.5 }}
        className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#588157]/10 transition-colors group-hover:bg-[#588157]/20"
      >
        <Icone className="h-5 w-5 text-[#588157] dark:text-[#A3B18A]" />
      </motion.div>

      <div>
        <h3 className="font-semibold">{titulo}</h3>
        {children}
      </div>
    </motion.div>
  );
}


export default function AreaPublicaPaginaContato() {
  const { scrollYProgress } = useScroll();

  const progresso = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 25,
  });

  const [nome, setNome] = useState("");
  const [sobrenome, setSobrenome] = useState("");
  const [email, setEmail] = useState("");
  const [assunto, setAssunto] = useState("");
  const [mensagemInicial, setMensagemInicial] = useState("");
  const [aviso, setAviso] = useState("");

  const [enviando, setEnviando] = useState(false);

  const focoCampo =
    "h-12 border-[#B9C9B5] bg-[#F5F8F1] text-[#273B31] placeholder:text-[#7D8D7A] shadow-none transition-all duration-300 focus-visible:border-[#3A5A40] focus-visible:ring-2 focus-visible:ring-[#588157]/25 dark:border-white/10 dark:bg-[#1B2820] dark:text-[#F1F3EC] dark:placeholder:text-[#879487]";

  async function enviarFormulario(e) {
    e.preventDefault();
    setAviso("");

    if (
      !nome.trim() ||
      !sobrenome.trim() ||
      !email.trim() ||
      !assunto ||
      !mensagemInicial.trim()
    ) {
      setAviso("Preencha todos os campos antes de enviar.");
      return;
    }

    setEnviando(true);

    try {
      await criarConversaContato({
        nome: nome.trim(),
        sobrenome: sobrenome.trim(),
        email: email.trim(),
        assunto: assunto,
        mensagem: mensagemInicial.trim(),
      });

      setAviso(
        "Mensagem enviada com sucesso! Nossa equipe entrará em contato pelo e-mail informado."
      );

      setNome("");
      setSobrenome("");
      setEmail("");
      setAssunto("");
      setMensagemInicial("");
    } catch (erro) {
      console.error("Erro ao enviar formulário:", erro);

      setAviso(
        erro.message ||
          "Não foi possível enviar sua mensagem. Tente novamente."
      );
    } finally {
      setEnviando(false);
    }
  }

  return (
    <MotionConfig reducedMotion="user">
      <HeaderAreaPublica />

      <motion.div
        style={{ scaleX: progresso }}
        className="fixed inset-x-0 top-0 z-[60] h-1 origin-left bg-gradient-to-r from-[#588157] via-[#A3B18A] to-[#588157]"
      />

      <div className="relative isolate overflow-hidden py-10">
        <FundoParticulas />

        <div className="container mx-auto px-4 py-24 md:px-6 lg:py-32 2xl:max-w-[1400px]">
          <div className="mx-auto max-w-2xl lg:max-w-5xl">
            <div className="mx-auto mb-12 max-w-2xl text-center">
              <span className="mb-5 inline-flex rounded-full border border-[#588157]/30 bg-[#588157]/15 px-4 py-1.5 text-sm font-semibold text-[#3A5A40] dark:border-[#7E9971]/30 dark:text-[#A3B18A]">
                CONTATO
              </span>

              <h1 className="text-4xl font-bold tracking-tight text-[#273B31] dark:text-[#F1F3EC] sm:text-5xl">
                Fale conosco,
                <span className="block bg-gradient-to-r from-[#A3B18A] via-[#588157] to-[#3A5A40] bg-clip-text text-transparent">
                  estamos à sua disposição
                </span>
              </h1>

              <div className="mx-auto mt-6 h-1 w-14 rounded-full bg-[#588157] dark:bg-[#A3B18A]" />

              <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-[#526454] dark:text-muted-foreground sm:text-lg">
                Tem alguma dúvida ou deseja saber mais sobre a Visora? Entre
                em contato com nossa equipe.
              </p>
            </div>

            <div className="mt-12 grid gap-8 lg:grid-cols-2">
              {/* FORMULÁRIO */}

              <Revelar de="esquerda" delay={0.2}>
                <CartaoHolofote>
                  <Card className="border-[#C8D5C2] bg-[#F8FAF5] p-0 text-[#273B31] shadow-[0_12px_40px_rgba(39,59,49,0.10)] dark:border-white/10 dark:bg-[#24352A] dark:text-[#F1F3EC]">
                    <CardContent className="p-6">
                      <motion.form
                        onSubmit={enviarFormulario}
                        variants={listaVar}
                        initial="oculto"
                        whileInView="visivel"
                        viewport={{
                          once: true,
                          amount: 0.2,
                        }}
                      >
                        <div className="grid gap-5">
                          <div className="grid gap-4 sm:grid-cols-2">
                            <motion.div
                              variants={itemVar}
                              className="space-y-2"
                            >
                              <Label
                                htmlFor="first-name"
                                className="text-base font-semibold text-[#354A3B] dark:text-[#E5EADF]"
                              >
                                Nome
                              </Label>

                              <Input
                                id="first-name"
                                value={nome}
                                onChange={(e) => setNome(e.target.value)}
                                placeholder="Seu nome"
                                className={focoCampo}
                                required
                              />
                            </motion.div>

                            <motion.div
                              variants={itemVar}
                              className="space-y-2"
                            >
                              <Label
                                htmlFor="last-name"
                                className="text-base font-semibold text-[#354A3B] dark:text-[#E5EADF]"
                              >
                                Sobrenome
                              </Label>

                              <Input
                                id="last-name"
                                value={sobrenome}
                                onChange={(e) => setSobrenome(e.target.value)}
                                placeholder="Seu sobrenome"
                                className={focoCampo}
                                required
                              />
                            </motion.div>
                          </div>

                          <motion.div
                            variants={itemVar}
                            className="space-y-2"
                          >
                            <Label
                              htmlFor="email"
                              className="text-base font-semibold text-[#354A3B] dark:text-[#E5EADF]"
                            >
                              E-mail
                            </Label>

                            <Input
                              id="email"
                              type="email"
                              value={email}
                              onChange={(e) => setEmail(e.target.value)}
                              placeholder="seuemail@exemplo.com"
                              className={focoCampo}
                              required
                            />
                          </motion.div>

                          <motion.div
                            variants={itemVar}
                            className="space-y-2"
                          >
                            <Label
                              htmlFor="subject"
                              className="text-base font-semibold text-[#354A3B] dark:text-[#E5EADF]"
                            >
                              Assunto
                            </Label>

                            <Select
                              value={assunto}
                              onValueChange={setAssunto}
                              required
                            >
                              <SelectTrigger
                                id="subject"
                                className="!h-12 w-full border-[#B9C9B5] bg-[#F5F8F1] text-[#273B31] transition-all duration-300 focus-visible:border-[#3A5A40] focus-visible:ring-2 focus-visible:ring-[#588157]/25 data-[placeholder]:text-[#7D8D7A] dark:border-white/10 dark:bg-[#1B2820] dark:text-[#F1F3EC]"
                              >
                                <SelectValue placeholder="Selecione o assunto" />
                              </SelectTrigger>

                              <SelectContent className="border-[#C8D5C2] bg-[#F8FAF5] text-[#273B31] dark:border-white/10 dark:bg-[#24352A] dark:text-[#F1F3EC]">
                                <SelectItem
                                  className="focus:bg-[#E0E9DA] focus:text-[#273B31] dark:focus:bg-[#344E41] dark:focus:text-white"
                                  value="Selecione o assunto"
                                  disabled
                                >
                                  Selecione o assunto
                                </SelectItem>

                                <SelectItem
                                  className="focus:bg-[#E0E9DA] focus:text-[#273B31] dark:focus:bg-[#344E41] dark:focus:text-white"
                                  value="Dúvidas sobre a plataforma"
                                >
                                  Dúvidas sobre a plataforma
                                </SelectItem>

                                <SelectItem
                                  className="focus:bg-[#E0E9DA] focus:text-[#273B31] dark:focus:bg-[#344E41] dark:focus:text-white"
                                  value="Planos e assinaturas"
                                >
                                  Planos e assinaturas
                                </SelectItem>

                                <SelectItem
                                  className="focus:bg-[#E0E9DA] focus:text-[#273B31] dark:focus:bg-[#344E41] dark:focus:text-white"
                                  value="Pagamentos e cobranças"
                                >
                                  Pagamentos e cobranças
                                </SelectItem>

                                <SelectItem
                                  className="focus:bg-[#E0E9DA] focus:text-[#273B31] dark:focus:bg-[#344E41] dark:focus:text-white"
                                  value="Problemas técnicos"
                                >
                                  Problemas técnicos
                                </SelectItem>

                                <SelectItem
                                  className="focus:bg-[#E0E9DA] focus:text-[#273B31] dark:focus:bg-[#344E41] dark:focus:text-white"
                                  value="Funcionalidades e recursos"
                                >
                                  Funcionalidades e recursos
                                </SelectItem>

                                <SelectItem
                                  className="focus:bg-[#E0E9DA] focus:text-[#273B31] dark:focus:bg-[#344E41] dark:focus:text-white"
                                  value="Sugestões de melhoria"
                                >
                                  Sugestões de melhoria
                                </SelectItem>

                                <SelectItem
                                  className="focus:bg-[#E0E9DA] focus:text-[#273B31] dark:focus:bg-[#344E41] dark:focus:text-white"
                                  value="Parcerias e negócios"
                                >
                                  Parcerias e negócios
                                </SelectItem>

                                <SelectItem
                                  className="focus:bg-[#E0E9DA] focus:text-[#273B31] dark:focus:bg-[#344E41] dark:focus:text-white"
                                  value="Outros assuntos"
                                >
                                  Outros assuntos
                                </SelectItem>
                              </SelectContent>
                            </Select>
                          </motion.div>

                          <motion.div
                            variants={itemVar}
                            className="space-y-2"
                          >
                            <Label
                              htmlFor="message"
                              className="text-base font-semibold text-[#354A3B] dark:text-[#E5EADF]"
                            >
                              Mensagem
                            </Label>

                            <Textarea
                              id="message"
                              value={mensagemInicial}
                              onChange={(e) =>
                                setMensagemInicial(e.target.value)
                              }
                              placeholder="Conte um pouco sobre sua dúvida, sugestão ou necessidade..."
                              className="min-h-[250px] border-[#B9C9B5] bg-[#F5F8F1] text-base text-[#273B31] placeholder:text-[#7D8D7A] shadow-none transition-all duration-300 focus-visible:border-[#3A5A40] focus-visible:ring-2 focus-visible:ring-[#588157]/25 dark:border-white/10 dark:bg-[#1B2820] dark:text-[#F1F3EC] dark:placeholder:text-[#879487]"
                              rows={10}
                              required
                            />
                          </motion.div>

                          {aviso && (
                            <p
                              role="status"
                              className="rounded-xl border border-[#A3B18A]/40 bg-[#588157]/10 p-3 text-sm text-[#3A5A40] dark:text-[#A3B18A]"
                            >
                              {aviso}
                            </p>
                          )}

                          <motion.div variants={itemVar}>
                            <motion.div
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.97 }}
                              transition={{
                                type: "spring",
                                stiffness: 400,
                                damping: 18,
                              }}
                              className="inline-block"
                            >
                              <Button
                                type="submit"
                                disabled={enviando}
                                className="group relative h-12 cursor-pointer overflow-hidden border-0 bg-[#3A5A40] px-6 text-base text-white transition-all duration-300 hover:bg-[#273B31] hover:shadow-lg hover:shadow-[#588157]/25 dark:bg-[#588157] dark:hover:bg-[#7E9971]"
                              >
                                <motion.span
                                  aria-hidden="true"
                                  className="pointer-events-none absolute inset-y-0 left-0 w-1/3 -skew-x-12 bg-gradient-to-r from-transparent via-white/35 to-transparent"
                                  initial={{ x: "-150%" }}
                                  animate={{ x: "450%" }}
                                  transition={{
                                    duration: 1.4,
                                    repeat: Infinity,
                                    repeatDelay: 3,
                                    ease: "easeInOut",
                                  }}
                                />

                                <span className="relative">
                                  {enviando
                                    ? "Enviando..."
                                    : "Enviar mensagem"}
                                </span>

                                <Send className="relative h-4 w-4 transition-transform duration-300" />
                              </Button>
                            </motion.div>
                          </motion.div>
                        </div>
                      </motion.form>
                    </CardContent>
                  </Card>
                </CartaoHolofote>
              </Revelar>

              {/* INFORMAÇÕES DE CONTATO */}

              <Revelar de="direita" delay={0.35}>
                <div className="space-y-6">
                  <CartaoHolofote>
                    <div className="relative flex min-h-[280px] w-full items-center justify-center overflow-hidden rounded-2xl border border-[#B9C9B5] bg-gradient-to-br from-[#DCE8D5] via-[#E8EDE3] to-[#C5D6BC] p-8 shadow-[0_12px_35px_rgba(39,59,49,0.10)] dark:border-white/10 dark:from-[#293B2F] dark:via-[#24352A] dark:to-[#1B2820]">
                      <div className="max-w-sm text-center">
                        <IconeOrbita>
                          <MapPin className="h-7 w-7 text-[#588157] dark:text-[#A3B18A]" />
                        </IconeOrbita>

                        <TituloAurora as="h2" tamanho="medio">
                          Conecte-se com a Visora
                        </TituloAurora>

                        <p className="mt-4 text-base leading-relaxed text-[#526454] dark:text-muted-foreground">
                          Estamos disponíveis para conversar sobre sua
                          empresa, apresentar nossa plataforma e esclarecer
                          suas dúvidas.
                        </p>
                      </div>
                    </div>
                  </CartaoHolofote>

                  <motion.div
                    className="space-y-4"
                    variants={listaVar}
                    initial="oculto"
                    whileInView="visivel"
                    viewport={{
                      once: true,
                      amount: 0.3,
                    }}
                  >
                    <ItemContato icone={Mail} titulo="E-mail">
                      <p className="text-base leading-relaxed text-[#526454] dark:text-muted-foreground">
                        Entre em contato diretamente com nossa equipe.
                      </p>

                      <a
                        href="mailto:visora.plataforma@gmail.com"
                        className="text-base font-semibold text-[#3A5A40] underline-offset-4 hover:text-[#588157] hover:underline dark:text-[#A3B18A]"
                      >
                        visora.plataforma@gmail.com
                      </a>
                    </ItemContato>

                    <ItemContato icone={MapPin} titulo="Sobre a Visora">
                      <p className="text-base leading-relaxed text-[#526454] dark:text-muted-foreground">
                        Uma plataforma desenvolvida para facilitar a gestão
                        empresarial por meio de dados, indicadores e análises.
                      </p>
                    </ItemContato>

                    <ItemContato icone={Phone} titulo="Atendimento">
                      <p className="text-base leading-relaxed text-[#526454] dark:text-muted-foreground">
                        Tem alguma dúvida sobre planos, funcionalidades ou
                        utilização da plataforma? Envie sua mensagem.
                      </p>
                    </ItemContato>
                  </motion.div>
                </div>
              </Revelar>
            </div>
          </div>
        </div>
      </div>

      <FooterAreaPublica />
    </MotionConfig>
  );
}
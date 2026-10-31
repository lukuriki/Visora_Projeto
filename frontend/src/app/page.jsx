"use client";

import "@/styles/animacoes.css";

import Link from "next/link";


import { useEffect, useRef, useState } from "react";

import Image from "next/image";
import { motion, AnimatePresence, animate, useInView, useMotionValue, useReducedMotion, useScroll, useSpring, useTransform } from "framer-motion";

import { ArrowRight, BarChart3, Brain, Eye, Sparkles, TrendingUp, Zap, CircleHelp, Plus, Database, LineChart, Target, Bell, Minus } from "lucide-react";

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

import { faq } from "../app/JSON/faq";
import { testemunhos } from "../app/JSON/testemunhos";

const duplicatedTestemunhos = [...testemunhos, ...testemunhos];

const palavras = ["decisões", "resultados", "oportunidades", "crescimento"];

const faixa = ["Dashboards em tempo real", "Indicadores", "Relatórios automáticos", "Insights", "Metas", "Previsões", "Visão centralizada"];

const estatisticas = [
  { to: 500, prefix: "+", label: "empresas atendidas" },
  { to: 99.9, suffix: "%", decimals: 1, label: "de disponibilidade" },
  { to: 3, suffix: "x", label: "mais rapidez nas decisões" },
  { to: 10, prefix: "+", suffix: " mil", label: "relatórios gerados por mês" },
];


/* AURA */
function Aura({ className = "", deriva = false }) {
  return <div aria-hidden="true" className={`pointer-events-none absolute h-[420px] w-[420px] rounded-full blur-[120px] ${deriva ? "deriva" : ""} ${className}`} />;
}

/* ENTRADA AO ROLAR */
function Reveal({ children, delay = 0, className = "" }) {
  return <motion.div initial={{ opacity: 0, y: 32 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.2 }} transition={{ duration: 0.7, delay, ease: "easeOut" }} className={className}>{children}</motion.div>;
}

/* TÍTULO DE SEÇÃO */
function TituloSecao({ id, label, title, text }) {
  return(
    <Reveal className="mx-auto mb-16 max-w-2xl text-center"> 
      <p className="inline-flex rounded-full border border-[#588157]/25 bg-[#588157]/10 px-4 py-1.5 text-sm font-semibold text-[#3A5A40] dark:border-[#7E9971]/30 dark:text-[#A3B18A]">{label}</p>
      <h2 id={id} className="mt-5 text-3xl font-bold tracking-tight sm:text-5xl">{title}</h2>
      <p className="mt-4 text-lg leading-8 text-[#3A5A40]/80 dark:text-[#C1CEC2]/80">{text}</p>
    </Reveal>
  );
}

/* ÍCONE DOS DIFERENCIAIS */
function Icone({ children }) {
  return <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#588157]/10 text-[#588157] transition-colors group-hover:bg-[#588157] group-hover:text-white dark:text-[#A3B18A]">{children}</span>;
}

/* CARD COM BRILHO QUE SEGUE O MOUSE */
function Spot({ children, className = "" }) {
  function acompanharMouse(e) {
    const area = e.currentTarget.getBoundingClientRect();
    e.currentTarget.style.setProperty("--mx", `${e.clientX - area.left}px`);
    e.currentTarget.style.setProperty("--my", `${e.clientY - area.top}px`);
  }

  return (
    <motion.div onMouseMove={acompanharMouse} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.2 }} transition={{ duration: 0.6 }} className={`group relative overflow-hidden p-8 transition-colors hover:border-[#588157] dark:hover:border-[#7E9971] rounded-3xl border border-[#DAD7CD] bg-white dark:border-[#34483A] dark:bg-[#1C2920] ${className}`}>
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100" style={{ background: "radial-gradient(340px circle at var(--mx) var(--my), rgba(88,129,87,0.22), transparent 70%)" }} />
      <div className="relative">{children}</div>
    </motion.div>
  );
}

/* INCLINAÇÃO 3D */
function Tilt({ children }) {
  const reduceMotion = useReducedMotion();
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useSpring(useTransform(y, [-0.5, 0.5], [7, -7]), { stiffness: 150, damping: 18 });
  const rotateY = useSpring(useTransform(x, [-0.5, 0.5], [-7, 7]), { stiffness: 150, damping: 18 });

  function mover(e) {
    if (reduceMotion) return;
    const area = e.currentTarget.getBoundingClientRect();
    x.set((e.clientX - area.left) / area.width - 0.5);
    y.set((e.clientY - area.top) / area.height - 0.5);
  }

  function resetar() {
    x.set(0);
    y.set(0);
  }

  return <motion.div onMouseMove={mover} onMouseLeave={resetar} style={{ rotateX, rotateY, transformPerspective: 1100 }}>{children}</motion.div>;
}

/* CONTADOR ANIMADO */
function Contador({ to, prefix = "", suffix = "", decimals = 0 }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });
  const reduceMotion = useReducedMotion();
  const [valor, setValor] = useState(0);

  useEffect(() => {
    if (!inView) return;
    if (reduceMotion) {
      setValor(to);
      return;
    }
    const controle = animate(0, to, { duration: 1.8, ease: "easeOut", onUpdate: setValor });
    return () => controle.stop();
  }, [inView, to, reduceMotion]);

  return <span ref={ref}>{prefix}{valor.toFixed(decimals).replace(".", ",")}{suffix}</span>;
}

/* CARD DO DASHBOARD */
function CardMini({ icon, title, ...contador }) {
  return (
    <div className="group rounded-2xl border border-[#DAD7CD] p-4 transition-colors hover:border-[#7E9971] dark:border-[#34483A]">
      <span className="mb-4 flex h-9 w-9 items-center justify-center rounded-xl bg-[#588157]/10 text-[#588157] transition-colors group-hover:bg-[#588157] group-hover:text-white dark:text-[#A3B18A]">{icon}</span>
      <p className="text-xs text-[#588157] dark:text-[#A3B18A]">{title}</p>
      <p className="mt-1 text-2xl font-bold"><Contador {...contador} /></p>
    </div>
  );
}

export default function AreaPublicaHome() {
  const [darkMode, setDarkMode] = useState(false);
  const [themeLoaded, setThemeLoaded] = useState(false);
  const [indicePalavra, setIndicePalavra] = useState(0);
  const [openValue, setOpenValue] = useState("");


  const sobreRef = useRef(null);
  const reduceMotion = useReducedMotion();

  const { scrollYProgress } = useScroll();
  const progresso = useSpring(scrollYProgress, { stiffness: 120, damping: 25 });

  const { scrollYProgress: sobreProgress } = useScroll({ target: sobreRef, offset: ["start end", "end start"] });
  const imagemY = useTransform(sobreProgress, [0, 1], reduceMotion ? [0, 0] : [50, -50]);

  useEffect(() => {
    const savedTheme = localStorage.getItem("visora-theme");
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    setDarkMode(savedTheme ? savedTheme === "dark" : prefersDark);
    setThemeLoaded(true);
  }, []);

  useEffect(() => {
    if (!themeLoaded) return;
    localStorage.setItem("visora-theme", darkMode ? "dark" : "light");
  }, [darkMode, themeLoaded]);

  useEffect(() => {
    const intervalo = setInterval(() => setIndicePalavra((atual) => (atual + 1) % palavras.length), 2400);
    return () => clearInterval(intervalo);
  }, []);

  return (<>
    <div className={`overflow-x-clip bg-[#F2F2F2] text-[#273B31] transition-colors duration-500 dark:bg-[#111A14] dark:text-[#E5EDE5] ${darkMode ? "dark" : ""}`} style={{ scrollBehavior: "smooth" }}>
      {/* BARRA DE PROGRESSO */}
      <motion.div style={{ scaleX: progresso }} className="fixed inset-x-0 top-0 z-[60] h-1 origin-left bg-gradient-to-r from-[#588157] via-[#A3B18A] to-[#588157]" />
      {/* HERO */}
      <section id="inicio" className="relative flex min-h-screen items-center overflow-hidden px-6 pb-20 pt-32 lg:px-12">

        {/* GRADE E AURAS */}
        <div aria-hidden="true" className="absolute inset-0 opacity-60 [background-image:linear-gradient(rgba(88,129,87,.12)_1px,transparent_1px),linear-gradient(90deg,rgba(88,129,87,.12)_1px,transparent_1px)] [background-size:56px_56px] [mask-image:radial-gradient(ellipse_at_center,black_30%,transparent_75%)]" />
        <Aura className="-left-40 -top-40 h-[560px] w-[560px] bg-[#588157]/30" deriva />
        <Aura className="-right-32 top-10 h-[480px] w-[480px] bg-[#A3B18A]/40 dark:bg-[#7E9971]/25" deriva />

        <div className="relative z-10 mx-auto grid w-full max-w-7xl items-center gap-16 lg:grid-cols-2">

          {/* TEXTO LADO ESQUERDO */}
          <div>
            <motion.p initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#A3B18A] bg-white/60 px-4 py-2 text-sm font-semibold text-[#3A5A40] backdrop-blur dark:border-[#7E9971]/40 dark:bg-[#1C2920]/60 dark:text-[#C9D5B8]">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#588157] opacity-75" />
                <span className="relative h-2 w-2 rounded-full bg-[#588157]" />
              </span>
              Inteligência para decisões estratégicas
            </motion.p>

            <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.1 }} className="text-4xl font-bold leading-[1.08] tracking-tight sm:text-5xl lg:text-7xl">Transforme dados 
              <span className="relative mt-1 block h-[1.15em] overflow-hidden">em
                <AnimatePresence mode="wait">
                  <motion.span key={palavras[indicePalavra]} initial={{ y: "100%", opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: "-100%", opacity: 0 }} transition={{ duration: 0.4 }} className={`absolute left-29 bg-gradient-to-r from-[#344E41] via-[#588157] to-[#7E9971] bg-clip-text text-transparent dark:from-[#C9D5B8] dark:via-[#8FB58B] dark:to-[#588157]`}>
                    {palavras[indicePalavra]}
                  </motion.span>
                </AnimatePresence>
              </span>
            </motion.h1>

            <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.3 }} className="mt-6 max-w-xl text-lg leading-8 text-[#3A5A40]/90 dark:text-[#C1CEC2]/90">A Visora reúne informações, indicadores e insights em uma plataforma inteligente para ajudar sua empresa a enxergar oportunidades e tomar decisões melhores.</motion.p>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.45 }} className="mt-10 flex flex-wrap gap-4">
              <motion.a href="#contato" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }} className={`relative inline-flex items-center justify-center gap-2 rounded-full px-7 py-4 font-semibold transition-all focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#588157] overflow-hidden bg-[#3A5A40] text-white shadow-xl shadow-[#3A5A40]/30 dark:bg-[#588157]`}>Conheça a Visora <ArrowRight size={18} /></motion.a>

              <a href="#como-funciona" className={`relative inline-flex items-center justify-center gap-2 rounded-full px-7 py-4 font-semibold transition-all focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#588157] border border-[#A3B18A] bg-white/50 text-[#344E41] backdrop-blur hover:bg-white dark:border-[#7E9971]/50 dark:bg-[#1C2920]/60 dark:text-[#E5EDE5] dark:hover:bg-[#2D4234] dark:hover:border-[#8FB58B]`}>Ver como funciona</a>
            </motion.div>
          </div>

          {/* DASHBOARD */}
          <motion.div initial={{ opacity: 0, scale: 0.92 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.9, delay: 0.3 }} className="relative">
            <Tilt>
              <div className={`rounded-3xl border border-[#DAD7CD] bg-white dark:border-[#34483A] dark:bg-[#1C2920] relative p-4 shadow-[0_40px_90px_rgba(52,78,65,0.22)] dark:shadow-[0_40px_90px_rgba(0,0,0,0.4)]`}>
                <div className="mb-4 flex items-center justify-between rounded-2xl bg-[#F2F2F2] p-4 dark:bg-[#111A14]">
                  <div>
                    <p className="text-xs text-[#588157]">Visora</p>
                    <p className="font-semibold">Visão geral</p>
                  </div>
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#588157] text-white"><BarChart3 size={19} /></span>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <CardMini icon={<TrendingUp size={18} />} title="Performance" to={24.8} prefix="+" suffix="%" decimals={1} />
                  <CardMini icon={<Brain size={18} />} title="Insights" to={128} />
                </div>

                {/* GRÁFICO */}
                <div className="mt-4 rounded-2xl border border-[#DAD7CD] p-5 dark:border-[#34483A]">
                  <div className="mb-3 flex items-center justify-between">
                    <p className="font-semibold">Indicadores</p>
                    <span className="rounded-lg bg-[#588157]/10 px-3 py-1 text-xs font-semibold text-[#3A5A40] dark:text-[#A3B18A]">+18%</span>
                  </div>

                  <svg viewBox="0 0 300 120" className="h-32 w-full" role="img" aria-label="Gráfico de linha ilustrativo em crescimento">
                    <defs>
                      <linearGradient id="areaGrafico" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#588157" stopOpacity="0.35" />
                        <stop offset="100%" stopColor="#588157" stopOpacity="0" />
                      </linearGradient>
                    </defs>
                    <motion.path initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.2, duration: 0.8 }} d="M0 100 C30 90,50 95,80 70 S130 60,160 45 S220 50,250 20 S290 15,300 8 L300 120 L0 120Z" fill="url(#areaGrafico)" />
                    <motion.path initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1.8, delay: 0.6, ease: "easeInOut" }} d="M0 100 C30 90,50 95,80 70 S130 60,160 45 S220 50,250 20 S290 15,300 8" fill="none" stroke="#588157" strokeWidth="3" strokeLinecap="round" />
                  </svg>
                </div>
              </div>
            </Tilt>

            {/* CHIPS FLUTUANTES */}
            <div className="flutuar absolute -bottom-8 -left-4 z-20 flex items-center gap-3 rounded-2xl border border-[#A3B18A] bg-white/90 px-4 py-3 shadow-xl backdrop-blur-xl dark:border-[#34483A] dark:bg-[#1C2920]/95 sm:-left-8">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#588157] text-white"><Zap size={17} /></span>
              <div>
                <p className="text-xs text-[#588157] dark:text-[#A3B18A]">Novo insight</p>
                <p className="text-sm font-semibold">Oportunidade identificada</p>
              </div>
            </div>

            <div className="flutuar-inverso absolute -right-3 -top-6 z-20 flex items-center gap-2 rounded-full border border-[#A3B18A] bg-white/90 px-4 py-2.5 text-sm font-semibold shadow-xl backdrop-blur-xl dark:border-[#34483A] dark:bg-[#1C2920]/95 sm:-right-6">
              <Bell size={15} className="text-[#588157]" /> Meta batida
            </div>
          </motion.div>
        </div>
      </section>

      {/* FAIXA ROLANTE */}
      <div aria-hidden="true" className="overflow-hidden border-y border-[#A3B18A]/50 bg-[#344E41] py-5 text-[#E0E7DC] dark:border-[#7E9971]/20 dark:bg-[#17271D]">
        <ul className="marquee-rapido flex w-max gap-10 pr-10">
          {[...faixa, ...faixa, ...faixa, ...faixa].map((item, index) => (
            <li key={index} className="flex items-center gap-10 whitespace-nowrap text-lg font-semibold">
              <span>{item}</span>
              <Sparkles size={16} className="text-[#A3B18A]" />
            </li>
          ))}
        </ul>
      </div>

      {/* NÚMEROS */}
      <section aria-label="Números da Visora" className="px-6 py-20 lg:px-12">
        <dl className="mx-auto grid max-w-6xl grid-cols-2 gap-10 lg:grid-cols-4">
          {estatisticas.map((item, index) => (
            <Reveal key={item.label} delay={index * 0.1} className="text-center">
              <dt className={`text-5xl font-bold tracking-tight sm:text-6xl bg-gradient-to-r from-[#344E41] via-[#588157] to-[#7E9971] bg-clip-text text-transparent dark:from-[#C9D5B8] dark:via-[#8FB58B] dark:to-[#588157]`}><Contador {...item} /></dt>
              <dd className="mt-3 text-sm text-[#3A5A40]/80 dark:text-[#C1CEC2]/80">{item.label}</dd>
            </Reveal>
          ))}
        </dl>
      </section>

      {/* COMO FUNCIONA */}
      <section id="como-funciona" aria-labelledby="titulo-como" className="relative overflow-hidden px-6 py-28 scroll-mt-10 lg:px-12">
        <Aura className="left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#588157]/15" />

        <div className="relative z-10 mx-auto max-w-6xl">
          <TituloSecao id="titulo-como" label="COMO FUNCIONA?" title="Do dado bruto à decisão em três passos" text="Conecte suas fontes e a Visora organiza o resto." />

          <ol className="relative grid gap-12 md:grid-cols-3 md:gap-8">
            <motion.div aria-hidden="true" initial={{ scaleX: 0 }} whileInView={{ scaleX: 1 }} viewport={{ once: true, amount: 0.6 }} transition={{ duration: 1.4, ease: "easeInOut" }} className="absolute left-[16%] right-[16%] top-8 hidden h-0.5 origin-left bg-gradient-to-r from-[#588157] via-[#A3B18A] to-[#588157] md:block" />

            <Reveal className="relative text-center">
              <span className="pulso relative z-10 mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#588157] text-white shadow-xl shadow-[#588157]/30"><Database size={26} /></span>
              <p className="mt-5 text-sm font-semibold text-[#588157] dark:text-[#A3B18A]">Passo 1</p>
              <h3 className="mt-1 text-xl font-bold text-[#344E41] dark:text-[#E5EDE5]">Conecte seus dados</h3>
              <p className="mx-auto mt-3 max-w-xs text-sm leading-6 text-[#3A5A40]/80 dark:text-[#C1CEC2]/80">Reúna planilhas, sistemas e bases em um único ambiente.</p>
            </Reveal>

            <Reveal delay={0.2} className="relative text-center">
              <span className="pulso relative z-10 mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#588157] text-white shadow-xl shadow-[#588157]/30"><LineChart size={26} /></span>
              <p className="mt-5 text-sm font-semibold text-[#588157] dark:text-[#A3B18A]">Passo 2</p>
              <h3 className="mt-1 text-xl font-bold text-[#344E41] dark:text-[#E5EDE5]">Visualize os resultados</h3>
              <p className="mx-auto mt-3 max-w-xs text-sm leading-6 text-[#3A5A40]/80 dark:text-[#C1CEC2]/80">Acompanhe indicadores em painéis fáceis de ler.</p>
            </Reveal>

            <Reveal delay={0.4} className="relative text-center">
              <span className="pulso relative z-10 mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#588157] text-white shadow-xl shadow-[#588157]/30"><Target size={26} /></span>
              <p className="mt-5 text-sm font-semibold text-[#588157] dark:text-[#A3B18A]">Passo 3</p>
              <h3 className="mt-1 text-xl font-bold text-[#344E41] dark:text-[#E5EDE5]">Decida com confiança</h3>
              <p className="mx-auto mt-3 max-w-xs text-sm leading-6 text-[#3A5A40]/80 dark:text-[#C1CEC2]/80">Receba insights sobre tendências e oportunidades.</p>
            </Reveal>
          </ol>
        </div>
      </section>

      {/* DIFERENCIAIS */}
      <section id="diferenciais" aria-labelledby="titulo-diferenciais" className="relative overflow-hidden px-6 py-28 scroll-mt-10 lg:px-12">
        <div className="relative z-10 mx-auto max-w-6xl">
          <TituloSecao id="titulo-diferenciais" label="DIFERENCIAIS" title="Tudo para enxergar melhor" text="Informação complexa transformada em decisão simples, rápida e estratégica."/>

          <div className="grid gap-5 md:grid-cols-3">
            <Spot className="md:col-span-2">
              <div className="flex">
                <Icone><Eye size={22} /></Icone>

                <Link href="/areapublica_pagina_plano" className="ml-auto text-sm text-[#588157] hover:text-[#3A5A40] hover:underline underline-offset-4 dark:text-[#A3B18A] dark:hover:text-[#C1CEC2]">Saiba mais</Link>
              </div>
              <h3 className="mt-5 text-2xl font-bold text-[#344E41] dark:text-[#E5EDE5]">Visão centralizada</h3>
              <p className="mt-2 max-w-lg text-sm leading-6 text-[#3A5A40]/80 dark:text-[#C1CEC2]/80">Tenha os principais dados da sua operação reunidos em um único ambiente.</p>

              <div className="mt-8 flex h-28 items-end gap-2" aria-hidden="true">
                {[35, 55, 40, 70, 58, 85, 66, 95, 78, 100].map((altura, index) => (
                  <motion.div key={index} initial={{ height: 0 }} whileInView={{ height: `${altura}%` }} viewport={{ once: true }} transition={{ duration: 0.7, delay: index * 0.06 }} className="flex-1 rounded-t-md bg-gradient-to-t from-[#3A5A40] to-[#A3B18A]" />
                ))}
              </div>
            </Spot>

            <Spot>
              <Icone><Brain size={22} /></Icone> 
              <h3 className="mt-5 text-2xl font-bold text-[#344E41] dark:text-[#E5EDE5]">Insights inteligentes</h3>
              <p className="mt-2 text-sm leading-6 text-[#3A5A40]/80 dark:text-[#C1CEC2]/80">Identifique padrões, oportunidades e informações relevantes com mais facilidade.</p>

              <div className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#588157]/10 px-3 py-1.5 text-xs font-semibold text-[#3A5A40] dark:text-[#A3B18A]">
                <span className="h-2 w-2 animate-pulse rounded-full bg-[#588157]" />Nova oportunidade detectada
              </div>

              <motion.a href="/areapublica_pagina_plano" whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }} className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#3A5A40] px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-[#3A5A40]/20 transition-all hover:bg-[#588157] dark:bg-[#588157] dark:hover:bg-[#7E9971]">Saiba mais <ArrowRight size={16} /></motion.a>
            </Spot>

            <Spot>
              <Icone><BarChart3 size={22} /></Icone>
              <h3 className="mt-5 text-2xl font-bold text-[#344E41] dark:text-[#E5EDE5]">Dados visuais</h3>
              <p className="mt-2 text-sm leading-6 text-[#3A5A40]/80 dark:text-[#C1CEC2]/80">Números complexos em gráficos fáceis de interpretar.</p>
              <motion.a href="/areapublica_pagina_plano" whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }} className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#3A5A40] px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-[#3A5A40]/20 transition-all hover:bg-[#588157] dark:bg-[#588157] dark:hover:bg-[#7E9971]">Saiba mais <ArrowRight size={16} /></motion.a>
            </Spot>

            <Spot className="md:col-span-2">
              <div className="flex">
                <Icone><Zap size={22} /></Icone>
                <Link href="/areapublica_pagina_plano" className="ml-auto text-sm text-[#588157] hover:text-[#3A5A40] hover:underline underline-offset-4 dark:text-[#A3B18A] dark:hover:text-[#C1CEC2]">Saiba mais</Link>
              </div>
              <h3 className="mt-5 text-2xl font-bold text-[#344E41] dark:text-[#E5EDE5]">Decisões mais rápidas</h3>
              <p className="mt-2 max-w-lg text-sm leading-6 text-[#3A5A40]/80 dark:text-[#C1CEC2]/80">A informação certa no momento certo para agir com confiança.</p>

              <div className="mt-6 space-y-3" aria-hidden="true">
                {[{ nome: "Receita", valor: 85 }, { nome: "Margem", valor: 68 }, { nome: "Metas", valor: 92 }].map((item, index) => (
                  <div key={item.nome} className="flex items-center gap-3 text-xs text-[#3A5A40] dark:text-[#C1CEC2]">
                    <span className="w-14">{item.nome}</span>
                    <div className="h-2 flex-1 overflow-hidden rounded-full bg-[#588157]/15">
                      <motion.div initial={{ width: 0 }} whileInView={{ width: `${item.valor}%` }} viewport={{ once: true }} transition={{ duration: 1.1, delay: index * 0.15 }} className="h-full rounded-full bg-gradient-to-r from-[#588157] to-[#A3B18A]" />
                    </div>
                    <span className="w-8 text-right font-semibold">{item.valor}%</span>
                  </div>
                ))}
              </div>
            </Spot>
          </div>
        </div>
      </section>

      {/* SOBRE A VISORA */}
      <section ref={sobreRef} id="sobre" aria-labelledby="titulo-sobre" className={`relative overflow-hidden px-6 py-28 scroll-mt-10 lg:px-12 bg-[#344E41] text-[#F2F2F2] dark:bg-[#17271D] lg:py-36`}>
        <Aura className="-left-32 top-10 h-[420px] w-[420px] bg-[#A3B18A]/25" deriva />
        <Aura className="-right-32 bottom-0 h-[460px] w-[460px] bg-[#7E9971]/30" deriva />

        <div className="relative z-10 mx-auto grid max-w-7xl items-center gap-16 lg:grid-cols-2 lg:gap-24">

          {/* IMAGEM */}
          <motion.div style={{ y: imagemY }} className="relative">
            <div className="overflow-hidden rounded-[2rem] border border-[#A3B18A]/25 bg-[#273B31] p-2 shadow-[0_30px_80px_rgba(0,0,0,0.35)]">
              <Image src="/areapublica_home_imagem_sobre_nos.png" alt="Profissionais conversando em frente a um computador" width={900} height={600} className="h-[360px] w-full rounded-[1.6rem] object-cover sm:h-[440px] lg:h-[520px]" />
            </div>

            <div className="flutuar absolute -bottom-6 -right-3 flex items-center gap-3 rounded-2xl border border-[#A3B18A]/30 bg-[#273B31]/95 p-4 shadow-2xl backdrop-blur-xl sm:-right-8">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#A3B18A]/15 text-[#C9D5B8]"><Brain size={22} /></span>
              <div>
                <p className="text-xs text-[#A3B18A]">Inteligência aplicada</p>
                <p className="text-sm font-bold text-white">Dados que fazem sentido</p>
              </div>
            </div>
          </motion.div>

          {/* TEXTO */}
          <Reveal>
            <h2 id="titulo-sobre" className="max-w-xl text-4xl font-bold leading-tight tracking-tight text-white lg:text-6xl">
              Mais clareza para <span className="bg-gradient-to-r from-[#DCE6D1] via-[#A3B18A] to-[#7E9971] bg-clip-text text-transparent">enxergar o futuro</span>
            </h2>

            <p className="mt-6 max-w-xl text-lg leading-8 text-[#E0E7DC]/90">A Visora transforma dados em informações visuais e insights relevantes, conectando tecnologia e estratégia para facilitar a compreensão dos resultados da sua empresa.</p>

            <p className="mt-3 max-w-xl text-lg leading-8 text-[#E0E7DC]/90">Acreditamos que decisões melhores começam com uma visão mais clara. Por isso, reunimos informações importantes em uma experiência intuitiva, organizada e inteligente.</p>

            <ul className="mt-8 space-y-5">
              <motion.li initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }} className="flex items-start gap-3">
                <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#A3B18A]/15 text-[#C9D5B8]"><Eye size={16} /></span>
                <div>
                  <p className="font-semibold text-white">Informações em um só lugar</p>
                  <p className="mt-1 text-sm leading-6 text-[#D0DCCB]/80">Visualize os indicadores mais importantes com facilidade.</p>
                </div>
              </motion.li>

              <motion.li initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.15 }} className="flex items-start gap-3">
                <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#A3B18A]/15 text-[#C9D5B8]"><TrendingUp size={16} /></span>
                <div>
                  <p className="font-semibold text-white">Estratégia baseada em dados</p>
                  <p className="mt-1 text-sm leading-6 text-[#D0DCCB]/80">Identifique tendências e oportunidades para sua empresa.</p>
                </div>
              </motion.li>

              <motion.li initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.3 }} className="flex items-start gap-3">
                <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#A3B18A]/15 text-[#C9D5B8]"><Zap size={16} /></span>
                <div>
                  <p className="font-semibold text-white">Mais agilidade nas decisões</p>
                  <p className="mt-1 text-sm leading-6 text-[#D0DCCB]/80">Transforme informações complexas em ações claras.</p>
                </div>
              </motion.li>
            </ul>
          </Reveal>
        </div>
      </section>

      {/* TESTEMUNHOS */}
      <section id="depoimentos" aria-labelledby="titulo-depoimentos" className={`relative overflow-hidden px-6 py-28 scroll-mt-10 lg:px-12 px-0 lg:px-0 border-t border-b  border-[#A3B18A]/25 dark:border-[#7E9971]/25`}>
        <Aura className="bottom-0 left-0 bg-[#588157]/25" />
        <Aura className="bottom-0 right-0 bg-[#7E9971]/25" />

        <div className="px-6">
          <TituloSecao id="titulo-depoimentos" label="DEPOIMENTOS" title="Quem usa, recomenda!" text="Veja como outras equipes ganharam clareza no dia a dia." />
        </div>

        {/* CARROSSEL */}
        <div className="relative z-10 overflow-hidden">
          <ul className="marquee flex w-max gap-5 pr-5 pt-5">
            {duplicatedTestemunhos.map((testemunho, index) => (
              <li key={`${testemunho.author}-${index}`} aria-hidden={index >= testemunhos.length} className={`rounded-3xl border border-[#DAD7CD] bg-white dark:border-[#34483A] dark:bg-[#1C2920] flex min-h-[320px] w-[300px] shrink-0 flex-col p-7 transition-transform duration-300 hover:-translate-y-2 md:w-[330px]`}>
                <div className="mb-4 text-xl tracking-wide text-[#D9B445]" aria-label="5 de 5 estrelas">★★★★★</div>

                <h3 className="mb-3 text-lg font-bold leading-snug">{testemunho.title}</h3>

                <p className="flex-1 text-sm leading-6 text-[#555B56] dark:text-[#C1CEC2]/85">{testemunho.text}</p>

                {/* AUTOR */}
                <div className="mt-6 flex items-center gap-3 border-t border-[#E9EDE7] pt-5 dark:border-[#34483A]">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#588157] to-[#A3B18A] text-sm font-bold text-white">{testemunho.author.split(" ").map((nome) => nome[0]).slice(0, 2).join("").toUpperCase()}</span>

                  <div>
                    <p className="font-bold">{testemunho.author}</p>
                    <p className="text-xs text-[#3A5A40] dark:text-[#A3B18A]">{testemunho.role ?? "Cliente Visora"}</p>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section id="faq" aria-labelledby="titulo-faq" className="relative overflow-hidden px-6 py-28 scroll-mt-10 lg:px-12">
        <div className="relative z-10 mx-auto max-w-3xl">
          <TituloSecao id="titulo-faq" label="FAQ" title="Ficou com alguma dúvida?" text="As respostas para as perguntas mais comuns sobre a Visora."/>

          <Accordion type="single" collapsible value={openValue} onValueChange={setOpenValue} className="w-full">
            {faq.map((item, index) => {
              const itemValue = `item-${index + 1}`;

              return (
                <AccordionItem key={index} value={itemValue} className="group border-b border-[#273B31]/10 dark:border-[#E5EDE5]/10">
                  <AccordionTrigger className="gap-4 py-5 text-left text-sm font-semibold leading-6 transition-colors hover:text-[#588157] hover:no-underline dark:hover:text-[#A3B18A] sm:text-base cursor-pointer">
                    <span className="flex min-w-0 flex-1 items-center gap-4">
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#588157]/10 text-[#588157] transition-transform duration-300 group-hover:scale-110 group-data-open:scale-110 dark:text-[#A3B18A]">
                        <CircleHelp size={20} strokeWidth={1.7} />
                      </span>
                      <span className="flex-1">{item.question}</span>
                    </span>

                    <span className="relative flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-[#273B31]/10 transition-all duration-500 ease-out group-data-open:border-[#588157] group-data-open:text-[#588157] dark:border-[#E5EDE5]/15 dark:group-data-open:border-[#A3B18A] dark:group-data-open:text-[#A3B18A]">
                      <Plus size={18} className="absolute transition-all duration-500 ease-out group-data-open:rotate-90 group-data-open:scale-50 group-data-open:opacity-0"/>
                      
                      <Minus size={18} className="absolute -rotate-90 scale-50 opacity-0 transition-all duration-500 ease-out group-data-open:rotate-0 group-data-open:scale-100 group-data-open:opacity-100" />
                    </span>
                  </AccordionTrigger>

                  <AccordionContent className="pb-5 pl-[56px] pr-2 text-sm leading-7 text-[#555B56] dark:text-[#C1CEC2]/85">
                    {item.answer}
                  </AccordionContent>
                </AccordionItem>
              );
            })}
          </Accordion>
        </div>
      </section>
    </div>
  </>);
}


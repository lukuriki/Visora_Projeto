"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, BarChart3, Brain, Eye, Sparkles, TrendingUp, Zap, Moon, Sun, CircleHelp, Plus, MessageCircle } from "lucide-react";

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

import { faq } from "../app/JSON/faq";
import { testemunhos } from "../app/JSON/testemunhos";
  
const duplicatedTestemunhos = [...testemunhos,...testemunhos,];

export default function AreaPublicaHome() {
  const [darkMode, setDarkMode] = useState(false);
  const [themeLoaded, setThemeLoaded] = useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem("visora-theme");
    setDarkMode(savedTheme === "dark");
    setThemeLoaded(true);
  }, []);

  useEffect(() => {
    if (!themeLoaded) return;
    localStorage.setItem("visora-theme", darkMode ? "dark" : "light");
  }, [darkMode, themeLoaded]);

  return (<>
    <div className={darkMode ? "dark" : ""}>
      <main className="h-full overflow-hidden bg-[#F2F2F2] text-[#273B31] transition-colors duration-500 dark:bg-[#111A14] dark:text-[#E5EDE5]">

        {/* BOTÃO DE TEMA */}
        <button type="button" onClick={() => setDarkMode((current) => !current)} aria-label={darkMode ? "Ativar modo claro" : "Ativar modo escuro"} title={darkMode ? "Modo claro" : "Modo escuro"} className="fixed right-5 top-5 z-[100] flex h-12 w-12 items-center justify-center rounded-full border border-[#A3B18A]/40 bg-white/90 text-[#344E41] shadow-lg backdrop-blur-xl transition-colors duration-300 dark:border-[#7E9971]/40 dark:bg-[#1C2920]/95 dark:text-[#C9D5B8] dark:hover:bg-[#293A2D]">
          {darkMode ? <Sun size={21} /> : <Moon size={21} />}
        </button>

        <section className="relative flex h-[780px] items-center overflow-hidden bg-[#F2F2F2] px-6 py-20 transition-colors duration-500 dark:bg-[#111A14] lg:px-40 border-b-[1px] border-[#A3B18A]/80 dark:border-[#7E9971]/20">

          {/* AURAS */}
          <motion.div animate={{x: [0, 35, 0], y: [0, 25, 0], scale: [1, 1.08, 1]}} transition={{duration: 10, repeat: Infinity, ease: "easeInOut"}} className="pointer-events-none absolute -left-40 -top-40 h-[620px] w-[620px] rounded-full bg-[#588157]/35 blur-[150px] dark:bg-[#588157]/25"/>

          <motion.div animate={{x: [0, -30, 0], y: [0, 30, 0], scale: [1, 1.12, 1]}} transition={{duration: 12, repeat: Infinity, ease: "easeInOut"}} className="pointer-events-none absolute -right-32 -top-20 h-[560px] w-[560px] rounded-full bg-[#7E9971]/45 blur-[140px] dark:bg-[#7E9971]/35"/>

            {/* GRID */}
            <div
              className="pointer-events-none absolute inset-0 opacity-[0.35] dark:opacity-[0.15]"
              style={{
                backgroundImage:
                  "linear-gradient(#58815715 1px, transparent 1px), linear-gradient(90deg, #58815715 1px, transparent 1px)",
                backgroundSize: "70px 70px",
                maskImage:
                  "linear-gradient(to bottom, black, transparent 80%)",
              }}
            />

            <div className="relative mx-auto grid w-full items-center justify-between gap-16 lg:grid-cols-2">

              {/* TEXTO */}
              <motion.div initial={{ opacity: 0, x: -40 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8 }}>
                <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#A3B18A] bg-white/40 px-4 py-2 text-sm font-semibold text-[#3A5A40] backdrop-blur-md dark:border-[#7E9971]/40 dark:bg-[#1C2920]/60 dark:text-[#C9D5B8]">
                  <Sparkles size={15}/>Inteligência para decisões mais estratégicas
                </div>

                <h1 className="max-w-3xl text-5xl font-bold leading-[1.05] tracking-tight text-[#273B31] dark:text-[#E5EDE5] md:text-6xl lg:text-7xl">Transforme dados em <span className="bg-gradient-to-r from-[#344E41] via-[#588157] to-[#7E9971] bg-clip-text text-transparent text-7xl dark:from-[#C9D5B8] dark:via-[#8FB58B] dark:to-[#588157]">visão</span></h1>

                <p className="mt-7 max-w-xl text-lg text-[#3A5A40]/90 dark:text-[#C1CEC2]/90">A Visora reúne informações, indicadores e insights em uma plataforma inteligente para ajudar sua empresa a enxergar oportunidades e tomar decisões melhores.</p>

                <div className="mt-9 flex flex-wrap gap-4">
                  <motion.a href="#sobre"  whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }} className="group flex items-center gap-3 rounded-xl bg-[#3A5A40] px-5 font-semibold text-white shadow-[0_12px_35px_rgba(58,90,64,0.28)] transition-colors hover:bg-[#344E41] dark:bg-[#588157] dark:hover:bg-[#6C966B]">
                    Conheça a Visora <ArrowRight size={18} className="transition-transform group-hover:translate-x-1"/>
                  </motion.a>

                  <motion.a href="#diferenciais" whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }} className="rounded-xl border border-[#A3B18A] bg-white/60 px-6 py-3.5 font-semibold text-[#344E41] backdrop-blur-md transition-all hover:border-[#588157] hover:bg-white dark:border-[#7E9971]/50 dark:bg-[#1C2920]/70 dark:text-[#E5EDE5] dark:hover:bg-[#293A2D]">
                    Ver diferenciais
                  </motion.a>
                </div>

                {/* ESTATÍSTICAS */}
                <div className="mt-12 grid max-w-xl grid-cols-3 gap-5">
                  <div>
                    <p className="text-2xl font-bold text-[#344E41] dark:text-[#C9D5B8]">01</p>
                    <p className="mt-1 text-sm text-[#588157] dark:text-[#A3B18A]">Plataforma integrada</p>
                  </div>

                  <div>
                    <p className="text-2xl font-bold text-[#344E41] dark:text-[#C9D5B8]">24/7</p>
                    <p className="mt-1 text-sm text-[#588157] dark:text-[#A3B18A]">Dados acessíveis</p>
                  </div>

                  <div>
                    <p className="text-2xl font-bold text-[#344E41] dark:text-[#C9D5B8]">100%</p>
                    <p className="mt-1 text-sm text-[#588157] dark:text-[#A3B18A]">Visão centralizada</p>
                  </div>
                </div>
              </motion.div>

              {/* DASHBOARD */}
              <motion.div initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.9, delay: 0.15 }} className="relative">
                <div className="pointer-events-none absolute left-1/2 top-1/2 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#588157] blur-[110px] dark:bg-[#588157]/30"/>

                <motion.div animate={{ y: [0, -8, 0] }} transition={{duration: 6, repeat: Infinity, ease: "easeInOut"}} className="relative z-10 rounded-[28px] border border-[#588157]/70 bg-[#C1D0B5]/85 p-4 shadow-[0_30px_80px_rgba(52,78,65,0.18)] backdrop-blur-xl dark:border-[#34483A] dark:bg-[#18241C]/90 dark:shadow-[0_30px_80px_rgba(0,0,0,0.25)]">
                  <div className="mb-4 flex items-center justify-between rounded-2xl bg-[#F2F2F2] p-4 dark:bg-[#111A14]">
                    <div>
                      <p className="text-xs text-[#588157]">VISORA</p>
                      <h3 className="font-semibold text-[#344E41] dark:text-[#E5EDE5]">Visão geral</h3>
                    </div>

                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#588157] text-white shadow-lg shadow-[#588157]/25">
                      <BarChart3 size={19} />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <DashboardCard icon={<TrendingUp size={18} />} title="Performance" value="+24,8%"/>
                    <DashboardCard icon={<Brain size={18} />} title="Insights" value="128"/>
                  </div>

                  {/* GRÁFICO */}
                  <div className="mt-4 rounded-2xl border border-[#DAD7CD] bg-white p-5 dark:border-[#34483A] dark:bg-[#17231B]">
                    <div className="mb-5 flex items-center justify-between">
                      <div>
                        <p className="text-xs text-[#7E9971]">DESEMPENHO</p>
                        <p className="font-semibold text-[#344E41] dark:text-[#E5EDE5]">Indicadores</p>
                      </div>

                      <div className="rounded-lg bg-[#588157]/10 px-3 py-1.5 text-xs font-semibold text-[#588157] dark:bg-[#588157]/20 dark:text-[#A3B18A]">+18%</div>
                    </div>

                    <div className="flex h-36 items-end gap-3">
                      {[45, 62, 52, 78, 67, 92, 82, 100].map(
                        (height, index) => (
                          <motion.div key={index} initial={{ height: 0 }} animate={{ height: `${height}%` }} transition={{duration: 0.8, delay: index * 0.08}} className="flex-1 rounded-t-lg bg-gradient-to-t from-[#3A5A40] to-[#7E9971] dark:from-[#588157] dark:to-[#A3B18A]"/>
                        )
                      )}
                    </div>
                  </div>

                  <div className="mt-4 grid grid-cols-3 gap-3">
                    <SmallStat title="Projetos" value="42" />
                    <SmallStat title="Dados" value="8.4k" />
                    <SmallStat title="Insights" value="128" />
                  </div>
                </motion.div>

                {/* NOTIFICAÇÃO FLUTUANTE */}
                <motion.div
                  animate={{ y: [0, -10, 0] }}
                  transition={{duration: 4, repeat: Infinity, ease: "easeInOut"}} className="absolute -bottom-12 -left-3 z-20 flex items-center gap-3 rounded-2xl border border-[#A3B18A] bg-white/90 px-4 py-3 shadow-[0_15px_40px_rgba(58,90,64,0.18)] backdrop-blur-xl dark:border-[#34483A] dark:bg-[#1C2920]/95 dark:shadow-[0_15px_40px_rgba(0,0,0,0.25)] sm:-left-7">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#588157] text-white">
                    <Zap size={17} />
                  </div>

                  <div>
                    <p className="text-xs text-[#7E9971] dark:text-[#A3B18A]">Novo insight</p>
                    <p className="text-sm font-semibold text-[#344E41] dark:text-[#E5EDE5]">Oportunidade identificada</p>
                  </div>
                </motion.div>
              </motion.div>
            </div>
          </section>

          {/* ================= DIFERENCIAIS ================= */}
          <section id="diferenciais" className="relative overflow-hidden bg-[#F2F2F2] px-6 py-28 transition-colors duration-500 dark:bg-[#111A14] lg:px-12 border-b-[1px] border-[#A3B18A]/80 dark:border-[#7E9971]/20"
          >
            <div className="pointer-events-none absolute left-1/2 top-1/2 h-[500px] w-[700px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#588157]/10 blur-[140px] dark:bg-[#588157]/10" />

            <div className="relative z-10 mx-auto max-w-7xl">
              <motion.div initial={{ opacity: 0, y: 25 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }} className="mx-auto mb-16 max-w-2xl text-center">
                <span className="rounded-full border border-[#588157]/20 bg-[#588157]/10 px-5 py-2 text-sm font-semibold uppercase tracking-[0.2em] text-[#588157] dark:border-[#7E9971]/30 dark:bg-[#588157]/15 dark:text-[#A3B18A]">Diferenciais</span>

                <h2 className="mt-6 text-4xl font-bold tracking-tight text-[#273B31] dark:text-[#E5EDE5] md:text-5xl">Tudo o que você precisa para{" "} <span className="text-[#588157] dark:text-[#A3B18A]">enxergar melhor</span></h2>

                <p className="mt-5 leading-7 text-[#3A5A40]/70 dark:text-[#C1CEC2]/75">Uma experiência criada para transformar informações complexas em decisões mais simples, rápidas e estratégicas.</p>
              </motion.div>

              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                <FeatureCard
                  icon={<Eye size={23} />}
                  number="01"
                  title="Visão centralizada"
                  description="Tenha os principais dados da sua operação reunidos em um único ambiente."
                />

                <FeatureCard
                  icon={<Brain size={23} />}
                  number="02"
                  title="Insights inteligentes"
                  description="Identifique padrões, oportunidades e informações relevantes com mais facilidade."
                />

                <FeatureCard
                  icon={<BarChart3 size={23} />}
                  number="03"
                  title="Dados visuais"
                  description="Transforme números complexos em gráficos e indicadores fáceis de interpretar."
                />

                <FeatureCard
                  icon={<Zap size={23} />}
                  number="04"
                  title="Decisões mais rápidas"
                  description="Acesse as informações certas no momento certo para agir com confiança."
                />
              </div>
            </div>
          </section>

          {/* ================= SOBRE A VISORA ================= */}
          <section
            id="sobre"
            className="relative overflow-hidden bg-[#344E41] px-6 py-24 text-[#F2F2F2] transition-colors duration-500 dark:bg-[#17271D] lg:px-12 lg:py-32"
          >
            <motion.div
              animate={{
                x: [0, 25, 0],
                y: [0, -20, 0],
                scale: [1, 1.08, 1],
              }}
              transition={{
                duration: 10,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="pointer-events-none absolute -left-40 top-10 h-[450px] w-[450px] rounded-full bg-[#A3B18A]/25 blur-[80px]"
            />

            <motion.div
              animate={{
                x: [0, -20, 0],
                y: [0, 25, 0],
                scale: [1, 1.1, 1],
              }}
              transition={{
                duration: 12,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="pointer-events-none absolute -right-32 bottom-0 h-[500px] w-[500px] rounded-full bg-[#7E9971]/30 blur-[140px]"
            />

            <motion.div
              animate={{
                opacity: [0.1, 0.22, 0.1],
                scale: [1, 1.1, 1],
              }}
              transition={{
                duration: 9,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="pointer-events-none absolute left-[40%] top-[25%] h-[400px] w-[400px] rounded-full bg-[#588157]/25 blur-[130px]"
            />

            <div className="relative z-10 mx-auto grid max-w-7xl items-center gap-14 lg:grid-cols-2 lg:gap-20">

              {/* IMAGEM */}
              <motion.div
                initial={{ opacity: 0, x: -35 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.8 }}
                className="relative"
              >
                <div className="pointer-events-none absolute -inset-5 rounded-[36px] bg-[#A3B18A]/20 blur-2xl" />

                <div className="relative overflow-hidden rounded-[28px] border border-[#A3B18A]/20 bg-[#273B31] p-2 shadow-[0_25px_70px_rgba(0,0,0,0.25)] dark:bg-[#111A14]">
                  <img
                    src="/areapublica_home_imagem_sobre_nos.png"
                    alt="Profissionais conversando em frente a um computador"
                    className="h-[360px] w-full rounded-[22px] object-cover object-center sm:h-[440px] lg:h-[500px]"
                  />

                  <div className="pointer-events-none absolute inset-x-2 bottom-2 h-32 rounded-b-[22px] bg-gradient-to-t from-[#1B3327]/90 to-transparent" />

                  <div className="absolute bottom-7 left-7 flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/30 bg-white/15 text-white backdrop-blur-md">
                      <Eye size={22} />
                    </div>

                    <div>
                      <p className="text-sm font-bold tracking-wider text-white">
                        VISORA
                      </p>
                      <p className="text-xs text-[#E1E8D8]">
                        Enxergue novas possibilidades
                      </p>
                    </div>
                  </div>
                </div>

                {/* CARD FLUTUANTE */}
                <motion.div
                  animate={{ y: [0, -7, 0] }}
                  transition={{
                    duration: 4,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                  className="absolute -bottom-6 -right-3 flex items-center gap-3 rounded-2xl border border-[#A3B18A]/30 bg-[#273B31]/95 p-4 shadow-[0_15px_40px_rgba(0,0,0,0.25)] backdrop-blur-xl dark:bg-[#111A14]/95 sm:-right-6"
                >
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#A3B18A]/15 text-[#C9D5B8]">
                    <Brain size={22} />
                  </div>

                  <div>
                    <p className="text-xs text-[#A3B18A]">
                      Inteligência aplicada
                    </p>
                    <p className="text-sm font-bold text-white">
                      Dados que fazem sentido
                    </p>
                  </div>
                </motion.div>
              </motion.div>

              {/* TEXTO */}
              <motion.div
                initial={{ opacity: 0, x: 35 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.8, delay: 0.1 }}
                className="pt-4 lg:pt-0"
              >
                <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#A3B18A]/35 bg-[#A3B18A]/10 px-4 py-2 text-sm font-semibold text-[#C9D5B8] backdrop-blur-md">
                  <Sparkles size={16} />
                  Conheça a Visora
                </div>

                <h2 className="max-w-xl text-4xl font-bold leading-tight tracking-tight text-white sm:text-5xl lg:text-6xl">
                  Mais clareza para
                  <span className="mt-1 block bg-gradient-to-r from-[#DCE6D1] via-[#A3B18A] to-[#7E9971] bg-clip-text text-transparent">
                    enxergar o futuro.
                  </span>
                </h2>

                <p className="mt-7 max-w-xl text-base leading-8 text-[#E0E7DC]/90 sm:text-lg">
                  A Visora transforma dados em informações visuais e insights
                  relevantes, conectando tecnologia e estratégia para facilitar
                  a compreensão dos resultados da sua empresa.
                </p>

                <p className="mt-4 max-w-xl text-base leading-8 text-[#D0DCCB]/80">
                  Acreditamos que decisões melhores começam com uma visão mais
                  clara. Por isso, reunimos informações importantes em uma
                  experiência intuitiva, organizada e inteligente.
                </p>

                <div className="mt-8 space-y-5">
                  <AboutItem
                    icon={<Eye size={16} />}
                    title="Informações em um só lugar"
                    description="Visualize os indicadores mais importantes com facilidade."
                  />

                  <AboutItem
                    icon={<TrendingUp size={16} />}
                    title="Estratégia baseada em dados"
                    description="Identifique tendências e oportunidades para sua empresa."
                  />

                  <AboutItem
                    icon={<Zap size={16} />}
                    title="Mais agilidade nas decisões"
                    description="Transforme informações complexas em ações mais claras."
                  />
                </div>

                <motion.a
                  href="#diferenciais"
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.98 }}
                  className="group mt-9 inline-flex items-center gap-3 rounded-xl bg-[#A3B18A] px-6 py-3.5 font-semibold text-[#273B31] shadow-[0_12px_30px_rgba(0,0,0,0.15)] transition-colors hover:bg-[#C9D5B8]"
                >
                  Descubra mais sobre nós
                  <ArrowRight
                    size={18}
                    className="transition-transform group-hover:translate-x-1"
                  />
                </motion.a>
              </motion.div>
            </div>
          </section>

          {/* ================= TESTEMUNHOS ================= */}
          <section className="relative isolate overflow-hidden bg-[#F2F2F2] py-16 transition-colors duration-500 dark:bg-[#111A14]">
          
                {/* AURA VERDE INFERIOR ESQUERDA */}
                <div aria-hidden="true" className="pointer-events-none absolute bottom-0 left-0 z-0 h-[450px] w-[550px] rounded-full bg-[#588157]/30 blur-[90px] dark:bg-[#588157]/20"/>
          
                {/* AURA VERDE INFERIOR DIREITA */}
                <div aria-hidden="true" className="pointer-events-none absolute bottom-0 right-0 z-0 h-[450px] w-[550px] rounded-full bg-[#7E9971]/40 blur-[90px] dark:bg-[#7E9971]/15"/>
          
                {/* AURA CENTRAL */}
                <div aria-hidden="true" className="pointer-events-none absolute left-1/2 top-1/2 z-0 h-[350px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#588157]/20 blur-[120px] dark:bg-[#588157]/20"/>
          
                {/* CABEÇALHO */}
                <motion.div initial={{ opacity: 0, y: 25 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }} className="relative z-10 mx-auto mb-16 max-w-3xl px-5 text-center">
                  <span className="inline-flex rounded-full border border-[#588157]/20 bg-[#588157]/10 px-5 py-2 text-sm font-semibold uppercase tracking-wider text-[#588157] dark:border-[#7E9971]/30 dark:bg-[#588157]/15 dark:text-[#A3B18A]">Testemunhos</span>
          
                  <h2 className="mt-8 p-2 text-4xl font-bold tracking-[0.02em] text-[#273B31] transition-colors duration-300 dark:text-[#E5EDE5] md:text-5xl">A opinião de quem já conhece <span className="text-[#588157] dark:text-[#A3B18A]">a Visora</span></h2>
          
                  <p className="mt-5 leading-7 text-[#3A5A40]/75 dark:text-[#C1CEC2]/80">Descubra como a Visora está transformando a maneira de organizar as finanças, trazendo mais clareza, controle e segurança para as decisões do dia a dia.</p>
                </motion.div>
          
                {/* CARROSSEL DE TESTEMUNHOS */}
                <div className="relative z-10 overflow-hidden">
                  <motion.div className="flex w-max gap-5" animate={{ x: ["0%", "-50%"] }} transition={{duration: 35, ease: "linear", repeat: Infinity}}>
                    {duplicatedTestemunhos.map((testemunho, index) => (
                      <article key={`${testemunho.author}-${index}`} className="flex min-h-[340px] w-[300px] shrink-0 flex-col rounded-2xl border border-[#E5EAE3] bg-[#FFFDF9] p-7 shadow-sm transition-all duration-300 hover:border-[#A3B18A] hover:shadow-[0_15px_40px_rgba(58,90,64,0.10)] dark:border-[#34483A] dark:bg-[#1C2920] dark:hover:border-[#7E9971] dark:hover:shadow-[0_15px_40px_rgba(0,0,0,0.20)] md:w-[330px]">
                        <h3 className="mb-3 text-lg font-bold leading-snug text-[#273B31] transition-colors duration-300 dark:text-[#E5EDE5]">{testemunho.title}</h3>
          
                        {/* AVALIAÇÃO */}
                        <div className="mb-4 text-xl tracking-wide text-[#D9B445]" aria-label="5 de 5 estrelas">★★★★★</div>
          
                        {/* DEPOIMENTO */}
                        <p className="flex-1 text-sm leading-6 text-[#666666] transition-colors duration-300 dark:text-[#C1CEC2]/80">{testemunho.text}</p>
          
                        {/* AUTORES */}
                        <div className="mt-7 flex items-center gap-3 border-t border-[#E9EDE7] pt-5 transition-colors duration-300 dark:border-[#34483A]">
                          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#DDEBDD] text-sm font-bold text-[#3A5A40] dark:bg-[#344E41] dark:text-[#D5E3CE]">
                            {testemunho.author.split(" ").map((nome) => nome[0]).slice(0, 2).join("").toUpperCase()}
                          </div>
          
                          <div>
                            <p className="font-bold text-[#273B31] transition-colors duration-300 dark:text-[#E5EDE5]">{testemunho.author}</p>
                            <p className="mt-0.5 text-xs text-[#588157] dark:text-[#A3B18A]">Cliente Visora</p>
                          </div>
                        </div>
                      </article>
                    ))}
                  </motion.div>
                </div>
              </section>

          {/* ================= FAQ ================= */}
          <section className="relative isolate overflow-hidden bg-[#F2F2F2] py-16 transition-colors duration-500 dark:bg-[#111A14] sm:py-20 lg:py-24">
        {/* Auras verdes */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -left-40 top-20 -z-10 h-[400px] w-[400px] rounded-full bg-[#588157]/15 blur-[120px] dark:bg-[#588157]/20"
        />

        <div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-32 -right-32 -z-10 h-[450px] w-[450px] rounded-full bg-[#7E9971]/20 blur-[130px] dark:bg-[#7E9971]/15"
        />

        <div className="mx-auto max-w-4xl px-5 sm:px-8">
          {/* Cabeçalho */}
          <motion.div
            initial={{ opacity: 0, y: 25 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="mx-auto mb-12 max-w-3xl space-y-4 text-center sm:mb-14"
          >
            <span className="inline-flex items-center rounded-full border border-[#588157]/20 bg-[#588157]/10 px-5 py-2 text-sm font-semibold uppercase tracking-[0.18em] text-[#588157] dark:border-[#7E9971]/30 dark:bg-[#588157]/15 dark:text-[#A3B18A]">
              FAQ
            </span>

            <h2 className="text-3xl font-bold leading-tight tracking-tight text-[#273B31] transition-colors duration-300 dark:text-[#E5EDE5] sm:text-4xl lg:text-5xl">
              Ficou com alguma dúvida?
              <br />
              <span className="text-[#588157] dark:text-[#A3B18A]">
                Nós temos as respostas.
              </span>
            </h2>

            <p className="mx-auto max-w-2xl text-base leading-7 text-[#3A5A40]/75 transition-colors duration-300 dark:text-[#C1CEC2]/80 sm:text-lg">
              Descubra como a Visora pode ajudar você a organizar suas finanças,
              acompanhar seus resultados e tomar decisões com mais clareza
              e segurança.
            </p>
          </motion.div>

          {/* Perguntas */}
          <motion.div
            initial={{ opacity: 0, y: 25 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="mx-auto max-w-3xl"
          >
            <Accordion className="w-full">
              {faq.map((item, index) => (
                <AccordionItem
                  key={index}
                  value={`item-${index + 1}`}
                  className="group border-b border-[#273B31]/10 py-1 transition-colors duration-300 dark:border-[#E5EDE5]/10"
                >
                  <AccordionTrigger className="gap-4 py-5 text-left text-sm font-semibold leading-6 text-[#273B31] transition-colors hover:text-[#588157] hover:no-underline dark:text-[#E5EDE5] dark:hover:text-[#A3B18A] sm:gap-5 sm:py-6 sm:text-base [&>svg]:hidden">
                    <span className="flex min-w-0 flex-1 items-center gap-3 sm:gap-4">
                      {/* Ícone da pergunta */}
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[#588157]/15 bg-[#588157]/10 text-[#588157] transition-all duration-300 group-hover:border-[#588157]/30 group-hover:bg-[#588157]/15 dark:border-[#7E9971]/20 dark:bg-[#588157]/15 dark:text-[#A3B18A] dark:group-hover:bg-[#588157]/25 sm:h-11 sm:w-11">
                        <CircleHelp size={21} strokeWidth={1.7} />
                      </span>

                      <span className="flex-1">
                        {item.question}
                      </span>
                    </span>

                    {/* Ícone de expansão */}
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-[#273B31]/10 text-[#273B31]/60 transition-all duration-300 group-hover:border-[#588157]/30 group-hover:bg-[#588157]/10 group-hover:text-[#588157] group-data-[state=open]:rotate-45 group-data-[state=open]:border-[#588157]/30 group-data-[state=open]:text-[#588157] dark:border-[#E5EDE5]/15 dark:text-[#C1CEC2]/70 dark:group-hover:border-[#7E9971]/40 dark:group-hover:bg-[#588157]/15 dark:group-hover:text-[#A3B18A] dark:group-data-[state=open]:border-[#7E9971]/40 dark:group-data-[state=open]:text-[#A3B18A]">
                      <Plus size={18} strokeWidth={1.8} />
                    </span>
                  </AccordionTrigger>

                  <AccordionContent className="pb-5 pl-[52px] pr-2 text-sm leading-7 text-[#626A63] transition-colors duration-300 dark:text-[#C1CEC2]/80 sm:pb-6 sm:pl-[60px] sm:text-[15px]">
                    {item.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </motion.div>

          {/* Rodapé */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mt-10 flex items-center justify-center gap-3 text-center sm:mt-12"
          >
            <MessageCircle
              size={20}
              strokeWidth={1.7}
              className="shrink-0 text-[#588157] dark:text-[#A3B18A]"
            />

            <p className="text-sm leading-6 text-[#626A63] transition-colors duration-300 dark:text-[#C1CEC2]/80 sm:text-base">
              Estamos aqui para ajudar você a ter mais clareza sobre suas finanças.
            </p>
          </motion.div>
        </div>
      </section>

        </main>
      </div>
    </>);
  }

  /* ================= CARD DO DASHBOARD ================= */
  function DashboardCard({ icon, title, value }) {
    return (
      <motion.div
        whileHover={{ y: -4 }}
        className="group rounded-2xl border border-[#DAD7CD] bg-white p-4 transition-all duration-300 hover:border-[#7E9971] hover:shadow-[0_15px_35px_rgba(88,129,87,0.15)] dark:border-[#34483A] dark:bg-[#1C2920] dark:hover:border-[#7E9971]"
      >
        <div className="mb-4 flex items-center justify-between">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#588157]/10 text-[#588157] transition-all duration-300 group-hover:bg-[#588157] group-hover:text-white">
            {icon}
          </div>

          <TrendingUp size={15} className="text-[#A3B18A]" />
        </div>

        <p className="text-xs text-[#7E9971] dark:text-[#A3B18A]">
          {title}
        </p>

        <p className="mt-1 text-2xl font-bold text-[#344E41] dark:text-[#E5EDE5]">
          {value}
        </p>
      </motion.div>
    );
  }

  /* ================= ESTATÍSTICAS ================= */
  function SmallStat({ title, value }) {
    return (
      <div className="rounded-xl bg-[#F2F2F2] p-3 dark:bg-[#111A14]">
        <p className="text-[10px] uppercase tracking-wide text-[#7E9971] dark:text-[#A3B18A]">
          {title}
        </p>

        <p className="mt-1 font-bold text-[#344E41] dark:text-[#E5EDE5]">
          {value}
        </p>
      </div>
    );
  }

  /* ================= CARDS DE DIFERENCIAIS ================= */
  function FeatureCard({ icon, number, title, description }) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        whileHover={{ y: -10, transition: { duration: 0.25 } }}
        className="group relative overflow-hidden rounded-[28px] border border-[#DAD7CD] bg-white p-7 shadow-sm transition-all duration-500 hover:border-[#588157] hover:shadow-[0_25px_60px_rgba(58,90,64,0.16)] dark:border-[#34483A] dark:bg-[#1C2920] dark:hover:border-[#7E9971]"
      >
        <div className="pointer-events-none absolute -right-20 -top-20 h-48 w-48 rounded-full bg-[#588157]/0 blur-[70px] transition-all duration-700 group-hover:bg-[#588157]/25" />

        <div className="absolute left-0 top-0 h-full w-1 bg-gradient-to-b from-[#7E9971] via-[#588157] to-[#3A5A40] opacity-0 transition-all duration-500 group-hover:opacity-100" />

        <div className="relative z-10 flex items-center justify-between">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#588157]/10 text-[#588157] transition-all duration-500 group-hover:bg-[#588157] group-hover:text-white group-hover:shadow-[0_10px_25px_rgba(88,129,87,0.3)] dark:bg-[#588157]/20 dark:text-[#A3B18A] dark:group-hover:text-white">
            {icon}
          </div>

          <span className="text-sm font-semibold text-[#A3B18A] transition-colors group-hover:text-[#588157] dark:group-hover:text-[#C9D5B8]">
            {number}
          </span>
        </div>

        <div className="relative z-10 mt-7">
          <h3 className="text-xl font-bold text-[#344E41] dark:text-[#E5EDE5]">
            {title}
          </h3>

          <p className="mt-3 text-sm leading-6 text-[#3A5A40]/70 dark:text-[#C1CEC2]/80">
            {description}
          </p>
        </div>

        <div className="relative z-10 mt-7 flex items-center gap-2 text-sm font-semibold text-[#588157] opacity-0 transition-all duration-500 group-hover:translate-x-1 group-hover:opacity-100 dark:text-[#A3B18A]">
          Explorar
          <ArrowRight size={16} />
        </div>
      </motion.div>
    );
  }

  /* ================= ITENS DA APRESENTAÇÃO ================= */
  function AboutItem({ icon, title, description }) {
    return (
      <div className="flex items-start gap-3">
        <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-[#A3B18A]/20 bg-[#A3B18A]/15 text-[#C9D5B8]">
          {icon}
        </div>

        <div>
          <p className="font-semibold text-white">{title}</p>

          <p className="mt-1 text-sm leading-6 text-[#D0DCCB]/80">
            {description}
          </p>
        </div>
      </div>
    );
  }


"use client";

import { useState, useEffect } from "react";
import { Sun, Moon, Eye, Target, Lightbulb, ShieldCheck } from "lucide-react";
import Process from "@/components/blocks/timeline-component-07";
import Footer from "@/components/FooterAreaPublica";
import HeroSobre from "@/components/areapublica_pagina_sobre_nos_hero/page";

const aboutSteps = [
  {
    id: "01",
    logo: Eye,
    company: "Quem somos",
    role: "Dados que geram clareza",
    period: "Sobre a Visora",
    stack: ["Tecnologia", "Análise de dados", "Inteligência empresarial"],
    achievement: "Transformamos dados em informações claras e relevantes.",
    description:
      "A Visora é uma plataforma desenvolvida para facilitar a organização, a visualização e a interpretação de dados empresariais. Acreditamos que compreender informações é essencial para o crescimento de qualquer negócio. Por isso, buscamos tornar dados complexos mais acessíveis e fáceis de interpretar. Nossa proposta é ajudar empresas a visualizar seus resultados, identificar padrões e reconhecer oportunidades. Assim, conectamos informações a possibilidades reais de melhoria.",
  },
  {
    id: "02",
    logo: Target,
    company: "Nossa missão",
    role: "Decisões mais inteligentes",
    period: "Nosso propósito",
    stack: ["Clareza", "Eficiência", "Estratégia"],
    achievement: "Simplificar a análise de dados para apoiar melhores decisões.",
    description:
      "Nossa missão é tornar a análise de dados mais simples, intuitiva e útil para as empresas. Queremos facilitar a compreensão de indicadores e resultados, reduzindo as dificuldades de interpretação das informações. Por meio de uma experiência organizada e acessível, buscamos ajudar os usuários a identificar desafios e oportunidades. Acreditamos que decisões bem fundamentadas começam com informações compreensíveis. Dessa forma, contribuímos para uma gestão mais consciente, eficiente e estratégica.",
  },
  {
    id: "03",
    logo: Lightbulb,
    company: "Nossa visão",
    role: "Inovação que gera valor",
    period: "Nosso futuro",
    stack: ["Inovação", "Tecnologia", "Evolução contínua"],
    achievement: "Tornar os dados cada vez mais acessíveis e estratégicos.",
    description:
      "Nossa visão é tornar a Visora uma solução cada vez mais útil para empresas que desejam compreender melhor seus dados. Enxergamos a tecnologia como uma ferramenta capaz de simplificar processos e ampliar possibilidades. Por isso, valorizamos a inovação e a busca constante por melhorias. Queremos tornar a análise de informações parte natural do planejamento empresarial. Nosso objetivo é contribuir para que mais negócios utilizem seus dados para evoluir, reconhecer oportunidades e aprimorar seus resultados.",
  },
  {
    id: "04",
    logo: ShieldCheck,
    company: "Nossos valores",
    role: "Princípios que nos orientam",
    period: "O que nos guia",
    stack: ["Transparência", "Confiabilidade", "Usabilidade"],
    achievement: "Priorizar clareza, confiança e praticidade em cada experiência.",
    description:
      "Os valores da Visora refletem nosso compromisso com uma experiência clara, confiável e acessível. Valorizamos a transparência na apresentação das informações e a inovação na busca por soluções melhores. Também priorizamos a usabilidade, para que a interação com os dados seja simples e intuitiva. Acreditamos que a confiabilidade é essencial para apoiar decisões conscientes. Esses princípios orientam o desenvolvimento da plataforma e nossa busca contínua por melhorias que atendam às necessidades dos usuários.",
  },
];

export default function Sobrenos() {
  const [darkMode, setDarkMode] = useState(false);
  const [themeLoaded, setThemeLoaded] = useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem("visora-theme");

    const initialDark =
      savedTheme === "dark" ||
      (!savedTheme &&
        document.documentElement.classList.contains("dark"));

    setDarkMode(initialDark);
    document.documentElement.classList.toggle("dark", initialDark);
    setThemeLoaded(true);
  }, []);

  useEffect(() => {
    if (!themeLoaded) return;

    document.documentElement.classList.toggle("dark", darkMode);
    localStorage.setItem("visora-theme", darkMode ? "dark" : "light");
  }, [darkMode, themeLoaded]);

  return (
    <>
      <button
        type="button"
        onClick={() => setDarkMode((current) => !current)}
        aria-label={darkMode ? "Ativar modo claro" : "Ativar modo escuro"}
        title={darkMode ? "Modo claro" : "Modo escuro"}
        className="fixed right-5 top-5 z-[100] flex h-12 w-12
          items-center justify-center rounded-full
          border border-[#A3B18A]/40 bg-white/90 text-[#344E41]
          shadow-lg backdrop-blur-xl transition-all duration-300
          hover:scale-105 dark:border-[#7E9971]/40
          dark:bg-[#1C2920]/95 dark:text-[#C9D5B8]
          dark:hover:bg-[#293A2D]"
      >
        {darkMode ? <Sun size={21} /> : <Moon size={21} />}
      </button>

      <main className="relative isolate min-h-screen overflow-hidden
        bg-[#F2F2F2] text-[#273B31]
        transition-colors duration-500 dark:bg-[#111A14]
        dark:text-[#E5EDE5]">

        {/* Auras únicas nas extremidades */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0
            z-[-1] overflow-hidden"
        >
          <div className="absolute -left-48 top-0 size-[420px]
            rounded-full bg-[#588157]/20 blur-[120px]
            dark:bg-[#588157]/30" />

          <div className="absolute -right-48 top-[22%]
            size-[420px] rounded-full bg-[#A3B18A]/25
            blur-[130px] dark:bg-[#3A5A40]/35" />

          <div className="absolute -left-48 top-[58%]
            size-[440px] rounded-full bg-[#3A5A40]/20
            blur-[130px] dark:bg-[#588157]/25" />

          <div className="absolute -right-48 bottom-0
            size-[440px] rounded-full bg-[#A3B18A]/20
            blur-[130px] dark:bg-[#344E41]/40" />

          <div className="absolute inset-0
            bg-[radial-gradient(#344E41_0.7px,transparent_0.7px)]
            [background-size:26px_26px] opacity-[0.045]
            dark:bg-[radial-gradient(#A3B18A_0.7px,transparent_0.7px)]
            dark:opacity-[0.07]" />
        </div>

        <HeroSobre />

        <div
          className="
            [&_h2]:!text-[#344E41]
            dark:[&_h2]:!text-[#A3B18A]
            [&_h3]:!text-[#3A5A40]
            dark:[&_h3]:!text-[#A3B18A]
            [&_.text-primary]:!text-[#588157]
            dark:[&_.text-primary]:!text-[#A3B18A]
            [&_.text-muted-foreground]:!text-[#64756A]
            dark:[&_.text-muted-foreground]:!text-[#B1BEB2]
            [&_[data-slot=badge]]:!border-[#588157]/20
            [&_[data-slot=badge]]:!bg-[#A3B18A]/20
            [&_[data-slot=badge]]:!text-[#344E41]
            dark:[&_[data-slot=badge]]:!border-[#A3B18A]/20
            dark:[&_[data-slot=badge]]:!bg-[#588157]/20
            dark:[&_[data-slot=badge]]:!text-[#E5EDE5]
          "
        >
          <div id="essencia-visora">
            <Process data={aboutSteps} />
          </div>
        </div>

        <Footer />
      </main>
    </>
  );
}

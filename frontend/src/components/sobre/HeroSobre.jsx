"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import {ArrowRightIcon} from "lucide-react";

import DadosEmClareza from "./DadosEmClareza";

const EASE = [0.22, 1, 0.36, 1];

const linhas = [
  { texto: "Por trás da Visora,", classe: "font-light" },
  { texto: "existe um propósito", classe: "font-semibold text-(--sb-brand)" },
];

// Cada palavra sobe de dentro de uma "máscara", uma depois da outra
function LinhaRevelada({ texto, classe, atraso, reduzir }) {
  return (
    <span className={`block ${classe}`}>
      {texto.split(" ").map((palavra, i) => (
        <span key={i} className="mr-[0.25em] -mb-[0.14em] inline-block overflow-hidden pb-[0.14em] align-bottom">
          <motion.span className="inline-block" initial={reduzir ? false : { y: "115%" }} animate={{ y: 0 }} transition={{ duration: 0.9, delay: atraso + i * 0.08, ease: EASE }}>
            {palavra}
          </motion.span>
        </span>
      ))}
    </span>
  );
}

export default function HeroSobre() {
  const reduzir = !!useReducedMotion();

  const entrada = (atraso) => ({
    initial: reduzir ? false : { opacity: 0, y: 16 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.8, delay: atraso, ease: EASE },
  });

  return (
    <section className="relative isolate flex min-h-[92svh] items-center overflow-hidden px-6 pb-20 pt-32 lg:px-12 lg:pt-36">
      <div aria-hidden="true" className="sb-luz pointer-events-none absolute inset-0 -z-10" />

      <div className="mx-auto grid max-w-8xl items-center gap-24 lg:grid-cols-[1.05fr_0.95fr] lg:gap-20">
        <div>
          <h1 className="text-[length:clamp(2.5rem,6.2vw,4.25rem)] leading-[1.04] tracking-tight">
            <span aria-hidden="true">
              {linhas.map((linha, i) => (
                <LinhaRevelada key={linha.texto} {...linha} atraso={0.15 + i * 0.35} reduzir={reduzir} />
              ))}
            </span>
          </h1>

          <motion.p {...entrada(0.95)} className="mt-7 max-w-xl text-base leading-8 text-(--sb-muted) sm:text-lg text-justify">Somos movidos pela curiosidade, pela colaboração e pelo desejo de transformar informações em possibilidades. Acreditamos que a tecnologia faz sentido quando gera impacto real.
          </motion.p>

          <motion.div {...entrada(1.1)} className="mt-9 flex flex-wrap items-center gap-3">
            <a href="#essencia" className="group inline-flex w-full items-center justify-center gap-2.5 rounded-full bg-[#456746] px-7 py-3.5 text-sm font-semibold text-white shadow-lg shadow-[#456746]/25 transition-all duration-300 hover:scale-[1.02] hover:bg-[#344E41] hover:shadow-xl hover:shadow-[#344E41]/30 active:scale-[0.98] dark:bg-[#A3B18A] dark:text-[#17231B] dark:shadow-[#A3B18A]/15 dark:hover:bg-[#C5D2B5] dark:hover:shadow-[#C5D2B5]/25 sm:w-auto">Conheça nossa essência <ArrowRightIcon className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" /></a>
            
            <Link href="/areapublica_pagina_planos" className="group inline-flex w-full items-center justify-center gap-2.5 rounded-full border border-[#17231B]/50 bg-transparent px-7 py-3.5 text-sm font-semibold text-[#17231B] transition-all duration-300 hover:scale-[1.02] hover:bg-[#17231B]/5 active:scale-[0.98] dark:border-[#F2F2F2]/15 dark:text-[#F2F2F2] dark:hover:bg-[#F2F2F2]/10 sm:w-auto">Ver planos</Link>
          </motion.div>
        </div>

        <motion.div initial={reduzir ? false : { opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.9, delay: 0.3, ease: EASE }}>
          <DadosEmClareza />
        </motion.div>
      </div>
    </section>
  );
}
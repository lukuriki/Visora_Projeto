"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, MessageCircle } from "lucide-react";

export default function CtaSobre() {
  const reduceMotion = useReducedMotion();

  return (
    <section className="px-6 py-16 sm:px-10 lg:px-12">
      <div className="mx-auto w-full max-w-7xl">
        {/* Card do CTA */}
        <div className="relative isolate overflow-hidden rounded-[2rem] border border-[#17231B]/5 bg-gradient-to-br from-[#F2F2F2] to-[#E5E5E5] px-6 pt-12 pb-12 shadow-xl dark:border-[#F2F2F2]/5 dark:from-[#111A14] dark:to-[#16221A] sm:px-16 sm:pt-16 lg:grid lg:grid-cols-2 lg:gap-x-12 lg:px-20 lg:py-20">
          
          {/* Luz de fundo interna do card */}
          {!reduceMotion && (
            <motion.div aria-hidden="true" animate={{ opacity: [0.15, 0.35, 0.15] }} transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }} className="pointer-events-none absolute -left-20 -top-20 -z-10 h-72 w-72 rounded-full bg-[#A3B18A]/40 blur-[70px]"/>
          )}

          {/* Coluna de Texto */}
          <div className="relative z-10 mx-auto max-w-lg text-center lg:mx-0 lg:max-w-xl lg:flex lg:flex-col lg:items-start lg:justify-center lg:text-left">
            <h2 className="text-3xl font-semibold tracking-tight text-[#17231B] dark:text-[#F2F2F2] sm:text-4xl lg:text-5xl lg:leading-[1.1]">Pronto para ver seus dados com clareza?</h2>

            <p className="mt-5 text-base leading-relaxed text-[#465348] dark:text-[#DADFD7]/85">Escolha um plano e comece hoje, ou fale com a nossa equipe para tirar suas dúvidas.</p>

            {/* Container dos Botões usando o novo padrão do Next.js e escala via Tailwind */}
            <div className="mt-8 flex w-full flex-col items-center justify-center gap-4 sm:w-auto sm:flex-row lg:justify-start">
              
              {/* Botão Primário */}
              <Link href="/areapublica_pagina_planos" className="group inline-flex w-full items-center justify-center gap-2.5 rounded-full bg-[#456746] px-7 py-3.5 text-sm font-semibold text-white shadow-lg shadow-[#456746]/25 transition-all duration-300 hover:scale-[1.02] hover:bg-[#344E41] hover:shadow-xl hover:shadow-[#344E41]/30 active:scale-[0.98] dark:bg-[#A3B18A] dark:text-[#17231B] dark:shadow-[#A3B18A]/15 dark:hover:bg-[#C5D2B5] dark:hover:shadow-[#C5D2B5]/25 sm:w-auto">
                Ver planos <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
              </Link>

              {/* Botão Secundário */}
              <Link href="/areapublica_pagina_contato" className="group inline-flex w-full items-center justify-center gap-2.5 rounded-full border border-[#17231B]/10 bg-transparent px-7 py-3.5 text-sm font-semibold text-[#17231B] transition-all duration-300 hover:scale-[1.02] hover:bg-[#17231B]/5 active:scale-[0.98] dark:border-[#F2F2F2]/15 dark:text-[#F2F2F2] dark:hover:bg-[#F2F2F2]/10 sm:w-auto"
              >
                <MessageCircle className="h-4 w-4 opacity-70 transition-opacity group-hover:opacity-100" />
                Falar com a equipe
              </Link>
              
            </div>
          </div>

          {/* Coluna da Imagem */}
          <div className="relative mt-16 h-64 overflow-hidden rounded-2xl sm:h-80 lg:mt-0 lg:h-auto lg:overflow-visible">
            <motion.div
              className="absolute inset-0 flex items-center justify-center lg:left-8 lg:justify-start"
              animate={reduceMotion ? {} : { y: [0, -10, 0] }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            >
              <img
                src="/areapublica_pagina_sobre_nos_computador.png"
                alt="Plataforma Visora"
                className="h-full w-auto object-contain object-center lg:absolute lg:top-1/2 lg:w-[850px] lg:-translate-y-1/2"
              />
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
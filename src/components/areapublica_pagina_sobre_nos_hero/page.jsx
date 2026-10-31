"use client";

import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight } from "lucide-react";

export default function HeroSobre() {
  const reduceMotion = useReducedMotion();

  return (
    <section className="relative isolate overflow-hidden">
      {/* Imagem de fundo */}
      <motion.div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-20"
        animate={
          reduceMotion
            ? {}
            : {
                scale: [1, 1.02, 1],
                x: [0, 5, 0],
              }
        }
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      >
        <img
          src="/areapublica_pagina_sobre_nos_computador.png"
          alt=""
          className="absolute left-[68%] top-0
            h-full w-[1150px] max-w-none
            -translate-x-1/2 object-contain object-center"
        />
      </motion.div>

      {/* Gradiente integrado ao fundo */}
      <div
        className="pointer-events-none absolute inset-0 -z-10
          bg-gradient-to-r
          from-[#F2F2F2] from-0%
          via-[#F2F2F2]/95 via-35%
          to-[#F2F2F2]/15 to-100%
          dark:from-[#111A14]
          dark:via-[#111A14]/90
          dark:to-[#111A14]/20"
      />

      {/* Luz animada */}
      {!reduceMotion && (
        <motion.div
          aria-hidden="true"
          animate={{
            x: ["-30%", "100%"],
            opacity: [0, 0.25, 0],
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="pointer-events-none absolute -z-10
            left-0 top-1/3 h-32 w-1/2
            rounded-full bg-[#A3B18A]/40 blur-[80px]"
        />
      )}

      {/* Conteúdo principal */}
      <div
        className="mx-auto grid min-h-[520px] w-full
          max-w-[1710px] grid-cols-1 items-center
          px-6 py-16 sm:px-10
          lg:min-h-[600px]
          lg:grid-cols-2 lg:gap-12
          lg:px-0 lg:pl-12"
      >
        {/* Primeira coluna: texto */}
        <div className="relative z-10 w-full max-w-[600px]">
          <motion.p
            initial={reduceMotion ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="mb-5 text-xs font-semibold uppercase
              tracking-[0.22em] text-[#456746]
              dark:text-[#A3B18A]"
          >
            Sobre nós
          </motion.p>

          <motion.h1
            initial={reduceMotion ? false : { opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.8 }}
            className="text-4xl font-medium leading-tight
              tracking-tight text-[#17231B]
              sm:text-5xl lg:text-6xl
              dark:text-[#F2F2F2]"
          >
            Por trás da Visora,

            <span
              className="mt-2 block font-semibold
                text-[#456746] dark:text-[#A3B18A]"
            >
              existe um propósito.
            </span>
          </motion.h1>

          <motion.p
            initial={reduceMotion ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="mt-5 max-w-md text-sm leading-7
              text-[#465348] sm:text-base
              dark:text-[#DADFD7]/85"
          >
            Somos movidos pela curiosidade, pela colaboração
            e pelo desejo de transformar informações em
            possibilidades. Acreditamos que a tecnologia
            faz sentido quando gera impacto real.
          </motion.p>

          <motion.a
            href="#essencia-visora"
            initial={reduceMotion ? false : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45, duration: 0.7 }}
            whileHover={reduceMotion ? {} : { scale: 1.03 }}
            whileTap={reduceMotion ? {} : { scale: 0.97 }}
            className="group mt-7 inline-flex items-center gap-3
              rounded-full bg-[#344E41] px-6 py-3.5
              text-sm font-medium text-white
              transition-colors hover:bg-[#456746]
              dark:bg-[#A3B18A] dark:text-[#17231B]
              dark:hover:bg-[#C5D2B5]"
          >
            Conheça nossa essência

         
          </motion.a>
        </div>

        {/* Segunda coluna: espaço para a imagem */}
        <div
          aria-hidden="true"
          className="hidden h-full min-h-[400px] lg:block"
        />
      </div>
    </section>
  );
}
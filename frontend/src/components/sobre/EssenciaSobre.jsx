"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";

import { passosSobre } from "../../app/JSON/sobre";

import LinhasEssencia from "./LinhasEssencia";

export default function EssenciaSobre() {
  const [ativo, setAtivo] = useState(passosSobre[0].id);
  const artigos = useRef({});

  useEffect(() => {
    const observador = new IntersectionObserver(
      (entradas) => {
        entradas.forEach((e) => {
          if (e.isIntersecting) setAtivo(e.target.dataset.id);
        });
      },
      { rootMargin: "-45% 0px -45% 0px" },
    );

    Object.values(artigos.current).forEach((el) => el && observador.observe(el));
    return () => observador.disconnect();
  }, []);

  return (
    <section id="essencia" className="relative isolate scroll-mt-24 px-6 py-24 lg:px-12 lg:py-32">
      <LinhasEssencia />
      <div className="mx-auto grid max-w-6xl gap-14 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] lg:gap-24">
        {/* Coluna fixa: título + índice */}
        <div className="lg:sticky lg:top-32 lg:self-start">
          <div className="flex flex-col gap-2">
            <p className="text-lg font-medium italic text-[#456746] sm:text-xl dark:text-[#A3B18A]">Descubra o que nos move</p>
            <h2 className="text-2xl font-semibold tracking-tight text-[#243B2E] sm:text-3xl lg:text-4xl dark:text-[#A3B18A]">Conheça a essência da Visora</h2>
            <div aria-hidden="true" className="h-1 w-16 rounded-full bg-gradient-to-r from-[#456746] to-[#A3B18A] dark:from-[#A3B18A] dark:to-[#A3B18A]/50"/>
          </div>

          <p className="mt-4 max-w-sm leading-8 text-(--sb-muted)">Quatro ideias orientam a Visora e tudo o que construímos na plataforma.</p>

          <ul className="mt-10 hidden border-l border-(--sb-line) lg:block">
            {passosSobre.map((passo) => {
              const selecionado = ativo === passo.id;
              return (
                <li key={passo.id} className="relative">
                  {selecionado && (
                    <motion.span
                      layoutId="indice-ativo"
                      aria-hidden="true"
                      className="absolute inset-y-0 -left-px w-0.5 bg-(--sb-accent-text)"
                      transition={{ type: "spring", bounce: 0.15, duration: 0.5 }}
                    />
                  )}
                  <a
                    href={`#${passo.id}`}
                    aria-current={selecionado ? "true" : undefined}
                    className={`block py-3 pl-5 text-sm transition-colors ${
                      selecionado
                        ? "font-semibold text-(--sb-fg)"
                        : "font-medium text-(--sb-muted) hover:text-(--sb-fg)"
                    }`}
                  >
                    {passo.rotulo}
                  </a>
                </li>
              );
            })}
          </ul>
        </div>

        {/* Tópicos */}
        <div className="space-y-20 lg:space-y-0">
          {passosSobre.map((passo) => {
            const Icone = passo.icone;
            const selecionado = ativo === passo.id;

            return (
              <article
                key={passo.id}
                id={passo.id}
                data-id={passo.id}
                ref={(el) => {
                  artigos.current[passo.id] = el;
                }}
                className={`scroll-mt-32 border-t border-(--sb-line) pt-10 transition-opacity duration-500 lg:flex lg:min-h-[72vh] lg:flex-col lg:justify-center lg:border-t-0 lg:pt-0 ${
                  selecionado ? "lg:opacity-100" : "lg:opacity-[0.55]"
                }`}
              >
                <div className="flex items-center gap-4">
                  <motion.span
                    animate={{ scale: selecionado ? 1 : 0.92, rotate: selecionado ? 0 : -8 }}
                    transition={{ type: "spring", bounce: 0.35, duration: 0.6 }}
                    className="grid size-12 place-items-center rounded-2xl border border-(--sb-line) bg-(--sb-panel) text-(--sb-accent-text)"
                  >
                    <Icone size={22} aria-hidden="true" />
                  </motion.span>
                  <p className="text-sm font-medium text-(--sb-muted)">{passo.rotulo}</p>
                </div>

                <h3 className="mt-6 text-3xl font-semibold tracking-tight sm:text-4xl">
                  {passo.titulo}
                </h3>

                <p className="mt-6 border-l-2 border-(--sb-accent) pl-4 text-lg font-medium leading-snug">
                  {passo.destaque}
                </p>

                <p className="mt-6 max-w-[62ch] leading-8 text-(--sb-muted)">{passo.texto}</p>

                <ul className="mt-7 flex flex-wrap gap-2">
                  {passo.temas.map((tema) => (
                    <li
                      key={tema}
                      className="rounded-full border border-(--sb-line) px-3.5 py-1.5 text-xs font-medium text-(--sb-muted)"
                    >
                      {tema}
                    </li>
                  ))}
                </ul>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
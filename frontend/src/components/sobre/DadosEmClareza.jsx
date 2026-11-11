"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

const X0 = 56;
const X1 = 480;
const BASE = 330;
const TOPO = 70;
const N = 18;

const arred = (n) => Math.round(n * 10) / 10;

function tendencia(t) {
  const s = t * 0.5 + t ** 2.2 * 0.5;
  return arred(BASE - 24 - s * (BASE - TOPO - 24));
}

function criarAleatorio(semente) {
  let a = semente;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const aleatorio = criarAleatorio(7);

const pontos = Array.from({ length: N }, (_, i) => {
  const t = i / (N - 1);
  return {
    fx: arred(X0 + t * (X1 - X0)),
    fy: tendencia(t),
    sx: Math.round(34 + aleatorio() * 452),
    sy: Math.round(54 + aleatorio() * 290),
  };
});

const AMOSTRAS = 48;
const linha = Array.from({ length: AMOSTRAS + 1 }, (_, i) => {
  const t = i / AMOSTRAS;
  return `${i ? "L" : "M"}${arred(X0 + t * (X1 - X0))} ${tendencia(t)}`;
}).join(" ");
const area = `${linha} L${X1} ${BASE} L${X0} ${BASE} Z`;
const ultimo = pontos[pontos.length - 1];

const EASE = [0.22, 1, 0.36, 1];

export default function DadosEmClareza() {
  const reduzir = !!useReducedMotion();
  const ciclo = useState(0);
  const [claro, setClaro] = useState(false);

  useEffect(() => {
    setClaro(reduzir);
    if (reduzir) return;
    const id = setTimeout(() => setClaro(true), 2900);
    return () => clearTimeout(id);
  }, [ciclo, reduzir]);

  return (
    <div className="relative rounded-[28px] border border-(--sb-line) bg-(--sb-panel) p-5 shadow-[0_30px_80px_-40px_rgba(52,78,65,0.55)] backdrop-blur-xl sm:p-6">
      <div className="mb-2 flex items-center justify-between gap-4">
        <div className="flex items-center gap-2.5 text-sm font-medium">
          <span aria-hidden="true" className={`size-2 rounded-full transition-colors duration-500 ${ claro ? "bg-(--sb-accent)" : "bg-(--sb-muted)"}`}/>
          <AnimatePresence mode="wait" initial={false}>
            <motion.span key={claro ? "claro" : "solto"} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.25 }} className={claro ? "text-(--sb-fg)" : "text-(--sb-muted)"}>
              {claro ? "Visão clara" : "Dados soltos"}
            </motion.span>
          </AnimatePresence>
        </div>
      </div>

      <svg viewBox="0 0 520 400" role="img" aria-label="Pontos de dados soltos que se organizam em uma linha de crescimento" className="h-auto w-full">
        <defs>
          <linearGradient id="sb-area" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" style={{ stopColor: "var(--sb-accent)", stopOpacity: 0.32 }} />
            <stop offset="100%" style={{ stopColor: "var(--sb-accent)", stopOpacity: 0 }} />
          </linearGradient>
        </defs>

        {[0, 1, 2, 3].map((i) => (
          <line key={i} x1={X0 - 16} x2={X1 + 16} y1={BASE - i * 80} y2={BASE - i * 80} strokeDasharray={i ? "3 7" : undefined} className="stroke-(--sb-line)"/>
        ))}

        <g key={ciclo}>
          <motion.path d={area} fill="url(#sb-area)" initial={{ opacity: reduzir ? 1 : 0 }} animate={{ opacity: 1 }} transition={{ delay: reduzir ? 0 : 2.5, duration: 0.9 }}/>

          {/* Linha de tendência */}
          <motion.path d={linha} fill="none" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" className="stroke-(--sb-accent)" initial={reduzir ? false : { pathLength: 0, opacity: 0 }} animate={{ pathLength: 1, opacity: 1 }} transition={{ delay: reduzir ? 0 : 2.1, duration: 1.1, ease: "easeInOut" }}/>

          {pontos.map((p, i) => (
            <motion.circle key={i} r={5} className="fill-(--sb-brand)" initial={reduzir ? { cx: p.fx, cy: p.fy, opacity: 1 } : { cx: p.sx, cy: p.sy, opacity: 0.55 }}
              animate={{ cx: p.fx, cy: p.fy, opacity: 1 }} transition={reduzir ? { duration: 0 } : { delay: 0.7 + i * 0.04, duration: 1.1, ease: EASE }}/>
          ))}

          {!reduzir && (
            <motion.circle cx={ultimo.fx} cy={ultimo.fy} fill="none" strokeWidth={2} className="stroke-(--sb-accent)" initial={{ r: 7, opacity: 0 }} animate={{ r: [7, 22], opacity: [0.7, 0] }} transition={{ delay: 3.2, duration: 1.4, repeat: 2, ease: "easeOut" }}/>
          )}
        </g>
      </svg>
    </div>
  );
}
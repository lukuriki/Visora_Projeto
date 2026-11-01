"use client";

import { motion, useReducedMotion } from "framer-motion";

/* Fundo da seção "O que nos move": várias linhas onduladas em movimento constante.
   - Cada linha ondula devagar, o tempo todo (não depende da rolagem).
   - Em algumas, um feixe de luz percorre a linha de ponta a ponta.
   O desenho é calculado por código (sem Math.random), então servidor e navegador
   geram exatamente o mesmo SVG. */

const QUANTIDADE = 12;
const LARGURA = 1440;
const ALTURA = 3200;
const PONTOS_X = [-50, 250, 550, 850, 1150, 1490]; 
const FASES = [0, 2.1, 4.2]; 

function montarCurva(i, fase) {
  const base = 120 + (i * (ALTURA - 240)) / (QUANTIDADE - 1);
  const A = 90 + 50 * Math.sin(i * 1.7); // Amplitude da onda
  
  const w = 0.0035; // Frequência da onda (controla a largura das curvas)
  const phi = i * 0.9 + fase; // Fase (deslocamento)

  // Usamos funções matemáticas para pegar a posição Y e a inclinação (derivada) reais
  const getY = (x) => base + A * Math.sin(w * x + phi);
  const getSlope = (x) => A * w * Math.cos(w * x + phi);

  let d = "";

  for (let k = 0; k < PONTOS_X.length - 1; k++) {
    const x0 = PONTOS_X[k];
    const x1 = PONTOS_X[k + 1];
    
    const y0 = getY(x0);
    const y1 = getY(x1);
    
    // Inicia o path
    if (k === 0) {
      d += `M ${x0.toFixed(2)} ${y0.toFixed(2)}`;
    }
    
    // Calcula as alças (Control Points) da Curva Bezier usando a inclinação exata da onda
    const dx = (x1 - x0) / 3;
    const cp1x = x0 + dx;
    const cp1y = y0 + dx * getSlope(x0);
    
    const cp2x = x1 - dx;
    const cp2y = y1 - dx * getSlope(x1);
    
    // Usamos .toFixed(2) em vez de Math.round para a interpolação ser perfeitamente fluida
    d += ` C ${cp1x.toFixed(2)} ${cp1y.toFixed(2)}, ${cp2x.toFixed(2)} ${cp2y.toFixed(2)}, ${x1.toFixed(2)} ${y1.toFixed(2)}`;
  }
  
  return d;
}

// O array calculado fora do componente mantém a performance impecável
const curvas = Array.from({ length: QUANTIDADE }, (_, i) => {
  const formas = FASES.map((fase) => montarCurva(i, fase));
  return {
    formas: [...formas, formas[0]], 
    duracao: 16 + (i % 5) * 3, 
    largura: i % 3 === 0 ? 1.6 : 1.1,
    opacidade: 0.15 + (i % 4) * 0.05,
    fluxo: i % 2 === 0 ? 14 + (i % 4) * 3 : null,
  };
});

function Fio({ curva, reduzir }) {
  const inicial = curva.formas[0];

  const movimento = reduzir
    ? {}
    : {
        initial: { d: inicial },
        animate: { d: curva.formas },
        transition: { duration: curva.duracao, ease: "easeInOut", repeat: Infinity },
      };

  return (
    <g>
      <motion.path
        d={inicial}
        fill="none"
        stroke="url(#sb-fio-essencia)"
        strokeWidth={curva.largura}
        strokeOpacity={curva.opacidade}
        strokeLinecap="round"
        {...movimento}
      />

      {!reduzir && curva.fluxo && (
        <motion.path
          d={inicial}
          fill="none"
          stroke="url(#sb-fio-brilho)"
          strokeWidth={curva.largura + 0.9}
          strokeOpacity={0.95}
          strokeLinecap="round"
          className="sb-fluxo"
          style={{ "--dur": `${curva.fluxo}s` }}
          {...movimento}
        />
      )}
    </g>
  );
}

function Fade({ id, cor }) {
  return (
    <linearGradient id={id} gradientUnits="userSpaceOnUse" x1="0" y1="0" x2={LARGURA} y2="0">
      {/* Atributos nativos do SVG evitam a sobrecarga de injetar styles inline */}
      <stop offset="0" stopColor={cor} stopOpacity={0} />
      <stop offset="0.25" stopColor={cor} stopOpacity={1} />
      <stop offset="0.75" stopColor={cor} stopOpacity={1} />
      <stop offset="1" stopColor={cor} stopOpacity={0} />
    </linearGradient>
  );
}

export default function LinhasEssencia() {
  const reduzir = !!useReducedMotion();

  return (
    <div aria-hidden="true" className="sb-linhas-essencia pointer-events-none absolute inset-0 -z-10">
      <svg
        viewBox={`0 0 ${LARGURA} ${ALTURA}`}
        preserveAspectRatio="none"
        fill="none"
        className="absolute inset-0 h-full w-full"
      >
        <defs>
          <Fade id="sb-fio-essencia" cor="var(--sb-accent)" />
        </defs>

        {curvas.map((curva, index) => (
          // O index do loop é mais leve e seguro para o DOM do que a string de curva.formas[0]
          <Fio key={index} curva={curva} reduzir={reduzir} />
        ))}
      </svg>
    </div>
  );
}
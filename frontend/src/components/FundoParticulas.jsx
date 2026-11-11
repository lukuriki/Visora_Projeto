"use client";

import { useEffect, useRef } from "react";

/**
 * Fundo de rede de pontos conectados (estilo "dados conectados").
 * Os pontos flutuam, se ligam quando ficam próximos e reagem ao mouse.
 * Acompanha o modo claro/escuro (classe "dark" no <html>) e respeita "reduzir movimento".
 *
 * Uso: coloque dentro de um container com `relative` e `overflow-hidden`.
 */

const CORES = {
  claro: { ponto: "88,129,87", linha: "88,129,87", alpha: 0.35 },
  escuro: { ponto: "163,177,138", linha: "163,177,138", alpha: 0.3 },
};

const DISTANCIA_LIGACAO = 130;
const RAIO_MOUSE = 140;

export default function FundoParticulas({ className = "" }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    const reduzir = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let largura = 0;
    let altura = 0;
    let pontos = [];
    let raf = 0;
    const mouse = { x: -9999, y: -9999 };

    const temaEscuro = () => document.documentElement.classList.contains("dark");

    function criarPontos() {
      const quantidade = Math.min(110, Math.floor((largura * altura) / 14000));
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
        // Afasta suavemente do mouse
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
      const cor = temaEscuro() ? CORES.escuro : CORES.claro;
      ctx.clearRect(0, 0, largura, altura);

      for (let i = 0; i < pontos.length; i++) {
        const a = pontos[i];

        for (let j = i + 1; j < pontos.length; j++) {
          const b = pontos[j];
          const d = Math.hypot(a.x - b.x, a.y - b.y);
          if (d < DISTANCIA_LIGACAO) {
            const opacidade = (1 - d / DISTANCIA_LIGACAO) * cor.alpha;
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

    // Redesenha ao trocar claro/escuro (útil quando a animação está parada)
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
      className={`pointer-events-none absolute inset-0 -z-10 overflow-hidden bg-[#F4F5EF] dark:bg-[#1B2820] ${className}`}
    >
      <canvas ref={canvasRef} className="absolute inset-0" />

      {/* Esmaece as bordas para o fundo se misturar com o resto da página */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#F4F5EF] via-transparent to-[#F4F5EF] dark:from-[#1B2820] dark:to-[#1B2820]" />
    </div>
  );
}

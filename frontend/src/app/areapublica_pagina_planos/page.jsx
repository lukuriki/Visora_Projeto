"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { animate, motion, useInView, useReducedMotion, useScroll, useSpring } from "framer-motion";
import { ArrowRight, Check, CreditCard, Mail, Receipt, ShieldCheck, Sparkles, TrendingUp, BarChart3  } from "lucide-react";

import "@/styles/areapublica_pagina_planos.css";

import FooterAreaPublica from "@/components/FooterAreaPublica";
import HeaderAreaPublica from "@/components/HeaderAreaPublica";
import { buscarPlanos } from "@/lib/api";

/* Preço com centavos menores. */
function Preco({ valor }) {
  const [inteiro, centavos] = Number(valor).toFixed(2).split(".");

  return (
    <p className="flex items-start gap-1 leading-none">
      <span className="mt-1.5 text-lg font-semibold opacity-70">R$</span>
      <span className="text-5xl font-bold tracking-tight">
        {Number(inteiro).toLocaleString("pt-BR")}
      </span>
      <span className="mt-1.5 text-xl font-semibold opacity-70">
        ,{centavos}
      </span>
    </p>
  );
}

/* Anima o número quando ele aparece na tela. */
function NumeroAnimado({ valor, sufixo = "" }) {
  const referencia = useRef(null);
  const visivel = useInView(referencia, { once: true, margin: "-80px" });
  const reduzirMovimento = useReducedMotion();
  const [atual, setAtual] = useState(0);

  useEffect(() => {
    if (!visivel || reduzirMovimento) return;

    const controles = animate(0, valor, {
      duration: 1.4,
      ease: "easeOut",
      onUpdate: (passo) => setAtual(Math.round(passo)),
    });

    return () => controles.stop();
  }, [visivel, valor, reduzirMovimento]);

  return (
    <span ref={referencia}>
      {reduzirMovimento ? valor : atual}
      {sufixo}
    </span>
  );
}

export default function PaginaPublicaPaginaPlanos() {
  const router = useRouter();

  const { scrollYProgress } = useScroll();
  const progresso = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 25,
  });

  const reduzirMovimento = useReducedMotion();

  const [planos, setPlanos] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");

  useEffect(() => {
    let ativo = true;

    async function carregarPlanos() {
      try {
        const dados = await buscarPlanos();

        if (ativo && Array.isArray(dados)) {
          setPlanos(dados);
        } else if (ativo) {
          setErro("Não foi possível carregar os planos.");
        }
      } catch (error) {
        if (ativo) {
          setErro(error.message || "Não foi possível carregar os planos.");
        }
      } finally {
        if (ativo) {
          setCarregando(false);
        }
      }
    }

    carregarPlanos();

    return () => {
      ativo = false;
    };
  }, []);

  function formatarValor(valor) {
    return Number(valor).toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  }

  function formatarPeriodo(meses) {
    return Number(meses) === 1 ? "1 mês" : `${meses} meses`;
  }

  function selecionarPlano(plano) {
    router.push(
      `/areapublica_pagina_pagamento?planoId=${encodeURIComponent(plano.id)}`
    );
  }

  const planosCalculados = useMemo(() => {
    const lista = planos.map((plano) => ({
      ...plano,
      meses: Number(plano.duracao_meses),
      valor: Number(plano.valor),
      porMes:
        Number(plano.valor) / Math.max(1, Number(plano.duracao_meses)),
    }));

    const planoMensal = lista.find((plano) => plano.meses === 1);
    const valorMensal = planoMensal?.valor || 0;

    return lista.map((plano) => ({
      ...plano,
      economia:
        plano.meses > 1 && valorMensal > 0
          ? Math.max(
              0,
              Math.round(
                (1 - plano.valor / (valorMensal * plano.meses)) * 100
              )
            )
          : 0,
    }));
  }, [planos]);

  const maiorPorMes = Math.max(1, ...planosCalculados.map((plano) => plano.porMes));

  const planoAnual = planosCalculados.find((plano) => plano.meses === 12);

  const refPassos = useRef(null);

  const [elementoPronto, setElementoPronto] = useState(false);

  useEffect(() => {
    if (refPassos.current) {
      setElementoPronto(true);
    }
  }, []);

  const { scrollYProgress: progressoPassos } = useScroll({
    target: elementoPronto ? refPassos : undefined,
    offset: ["start 70%", "end 55%"],
  });

  const preenchimentoLinha = useSpring(progressoPassos, {
    stiffness: 100,
    damping: 30,
  });

  function acompanharMouse(evento) {
    const caixa = evento.currentTarget.getBoundingClientRect();

    evento.currentTarget.style.setProperty("--mx", `${evento.clientX - caixa.left}px`);
    evento.currentTarget.style.setProperty("--my", `${evento.clientY - caixa.top}px`);
  }

  if (carregando) {
    return (<>
      <HeaderAreaPublica />
      <main className="min-h-[60vh] bg-[#F2F2F2] px-6 py-32 text-center text-[#273B31] dark:bg-[#111A14] dark:text-[#E5EDE5]">
        Carregando planos...
      </main>
      <FooterAreaPublica />
    </>);
  }

  if (erro) {
    return (<>
      <HeaderAreaPublica />
      <main className="min-h-[60vh] bg-[#F2F2F2] px-6 py-32 text-center text-red-600 dark:bg-[#111A14]">
        {erro}
      </main>
      <FooterAreaPublica />
    </>);
  }

  if (planosCalculados.length === 0) {
    return (<>
      <HeaderAreaPublica />
      <main className="min-h-[60vh] bg-[#F2F2F2] px-6 py-32 text-center text-[#273B31] dark:bg-[#111A14] dark:text-[#E5EDE5]">
        Nenhum plano disponível no momento.
      </main>
      <FooterAreaPublica />
    </>);
  }

  return (<>
    <HeaderAreaPublica />

    <motion.div style={{ scaleX: progresso }} className="fixed inset-x-0 top-0 z-[60] h-1 origin-left bg-gradient-to-r from-[#588157] via-[#A3B18A] to-[#588157]"/>

    <main className="relative overflow-hidden bg-[#F2F2F2] text-[#273B31] selection:bg-[#588157]/30 transition-colors duration-500 dark:bg-[#111A14] dark:text-[#E5EDE5]">
      
      {/* HERO */}
      <section id="planos"  className="relative px-6 pb-16 pt-40 lg:px-10">
        <motion.div animate={reduzirMovimento ? undefined : {x: [0, 35, 0], y: [0, 25, 0], scale: [1, 1.08, 1]}} transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }} className="pointer-events-none absolute -left-40 -top-40 h-[560px] w-[560px] rounded-full bg-[#588157]/35 blur-[150px] dark:bg-[#588157]/25"/>

        <motion.div animate={reduzirMovimento ? undefined : {x: [0, -30, 0], y: [0, 30, 0], scale: [1, 1.12, 1]}} transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }} className="pointer-events-none absolute -right-32 -top-20 h-[520px] w-[520px] rounded-full bg-[#7E9971]/45 blur-[140px] dark:bg-[#7E9971]/35"/>

        <div className="pointer-events-none absolute inset-0 opacity-[0.35] dark:opacity-[0.15]" style={{backgroundImage:"linear-gradient(#58815715 1px, transparent 1px), linear-gradient(90deg, #58815715 1px, transparent 1px)", backgroundSize: "70px 70px", maskImage: "linear-gradient(to bottom, black, transparent 80%)"}}/>

        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }} className="relative mx-auto max-w-3xl text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#A3B18A] bg-white/40 px-4 py-2 text-sm font-semibold text-[#3A5A40] backdrop-blur-md dark:border-[#7E9971]/40 dark:bg-[#1C2920]/60 dark:text-[#C9D5B8]">
            <Sparkles size={16} /> VISORA
          </div>

          <h1 className="text-balance text-4xl font-bold leading-[1.1] tracking-tight md:text-6xl">Escolha o plano <span className="bg-gradient-to-r from-[#344E41] via-[#588157] to-[#7E9971] bg-clip-text text-transparent dark:from-[#C9D5B8] dark:via-[#8FB58B] dark:to-[#588157]">ideal</span> para você</h1>

          <p className="mx-auto mt-6 max-w-xl text-base leading-7 text-[#6B7569] md:text-lg dark:text-[#BFC4AC]">Tenha mais controle sobre suas finanças com as ferramentas da Visora. Escolha o período que melhor atende às suas necessidades.</p>
        </motion.div>
      </section>

      {/* PLANOS */}
      <section className="relative scroll-mt-24 px-6 pb-24 lg:px-10">
        <div className="pointer-events-none absolute left-1/2 top-1/3 h-[500px] w-[800px] -translate-x-1/2 rounded-full bg-[#588157]/10 blur-[140px]" />

        <div className="relative mx-auto grid max-w-7xl grid-cols-1 items-stretch gap-6 sm:grid-cols-2 xl:grid-cols-4">
          {planosCalculados.map((plano, indice) => {
            
            const destaque = plano.meses === 12;

            return (
              <motion.article key={plano.id} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: indice * 0.08 }} whileHover={reduzirMovimento ? undefined : { y: -8 }} onMouseMove={acompanharMouse} className={`group/card relative flex flex-col overflow-hidden rounded-3xl border p-7 backdrop-blur-xl transition-colors duration-300 ${destaque ? "border-[#588157] bg-gradient-to-b from-[#344E41] to-[#273B31] text-white shadow-[0_30px_80px_rgba(58,90,64,0.35)] dark:border-[#7E9971]/60 dark:from-[#2B4A36] dark:to-[#1B3327]" : "border-[#A3B18A]/60 bg-white/80 shadow-[0_20px_60px_rgba(52,78,65,0.10)] hover:border-[#588157] dark:border-[#34483A] dark:bg-[#17231B]/90 dark:shadow-[0_20px_60px_rgba(0,0,0,0.25)] dark:hover:border-[#7E9971]/60"}`}>
                <div aria-hidden="true" className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover/card:opacity-100"
                  style={{background: `radial-gradient(380px circle at var(--mx, 50%) var(--my, 0%), ${destaque ? "rgba(163,177,138,0.20)" : "rgba(88,129,87,0.13)"}, transparent 65%)`}}/>

                {destaque && (<div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-[#7E9971]/40 blur-[70px]" />)}

                {/* IDENTIFICAÇÃO DOS PLANOS */}
                <div className="relative mb-5 flex min-h-[28px] items-center">
                  {destaque ? (
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-[#A3B18A]/40 bg-[#A3B18A]/20 px-3 py-1 text-xs font-bold text-[#DCE6D1]"> <Sparkles size={13} /> Melhor custo-benefício</span>
                  ) : plano.meses === 1 ? (
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-[#A3B18A]/50 bg-[#588157]/10 px-3 py-1 text-xs font-bold text-[#3A5A40] dark:border-[#7E9971]/40 dark:bg-[#588157]/20 dark:text-[#C9D5B8]"> <Sparkles size={13} /> Ideal para começar</span>
                  ) : plano.economia > 0 ? (
                    <span className="inline-flex items-center rounded-full bg-[#A3B18A]/20 px-3 py-1 text-xs font-bold text-[#3A5A40] dark:text-[#C9D5B8]">Economize {plano.economia}%</span>
                  ) : null}
                </div>

                <h2 className={`relative text-xl font-bold ${destaque ? "text-white" : ""}`}> {plano.tipo}</h2>

                <p className={`relative mt-1 text-sm ${destaque ? "text-[#C9D5B8]" : "text-[#6B7569] dark:text-[#BFC4AC]"}`}>Plano de {formatarPeriodo(plano.meses)}</p>

                <div className="relative mt-6">
                  <Preco valor={plano.valor} />

                  <p className={`mt-2 min-h-[20px] text-xs ${destaque ? "text-[#C9D5B8]" : "text-[#6B7569] dark:text-[#BFC4AC]"}`}>
                    {plano.meses > 1 ? `Equivale a aproximadamente ${formatarValor(plano.porMes)}/mês` : "Valor referente ao período de 1 mês de acesso."}
                  </p>
                </div>

                <p className={`relative mt-5 min-h-[72px] text-sm leading-6 ${destaque ? "text-[#E5EDE5]" : "text-[#6B7569] dark:text-[#BFC4AC]"}`}>{plano.descricao}</p>

                <hr className={`relative my-5 ${destaque ? "border-white/15" : "border-[#A3B18A]/50 dark:border-[#34483A]"}`}/>

                <h3 className={`relative mb-4 text-sm font-semibold ${destaque ? "text-white" : ""}`}>O que está incluído:</h3>

                <ul className="relative flex flex-col gap-3.5 text-sm">
                  <li className="flex items-center gap-3">
                    <span className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${destaque ? "bg-[#A3B18A]/25 text-[#DCE6D1]" : "bg-[#588157]/15 text-[#3A5A40] dark:bg-[#588157]/25 dark:text-[#A3B18A]"}`}><Check size={13} strokeWidth={3} /></span>
                    <span className={destaque ? "text-[#E5EDE5]" : "text-[#344E41] dark:text-[#E5EDE5]"}>Acesso completo à Visora</span>
                  </li>

                  <li className="flex items-center gap-3">
                    <span className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${destaque ? "bg-[#A3B18A]/25 text-[#DCE6D1]" : "bg-[#588157]/15 text-[#3A5A40] dark:bg-[#588157]/25 dark:text-[#A3B18A]"}`}><Check size={13} strokeWidth={3} /></span>
                    <span className={destaque ? "text-[#E5EDE5]" : "text-[#344E41] dark:text-[#E5EDE5]"}>Ferramentas financeiras</span>
                  </li>

                  <li className="flex items-center gap-3">
                    <span className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${destaque ? "bg-[#A3B18A]/25 text-[#DCE6D1]" : "bg-[#588157]/15 text-[#3A5A40] dark:bg-[#588157]/25 dark:text-[#A3B18A]"}`}><Check size={13} strokeWidth={3} /></span>
                    <span className={destaque ? "text-[#E5EDE5]" : "text-[#344E41] dark:text-[#E5EDE5]"}>Controle financeiro</span>
                  </li>

                  <li className="flex items-center gap-3">
                    <span className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${destaque ? "bg-[#A3B18A]/25 text-[#DCE6D1]" : "bg-[#588157]/15 text-[#3A5A40] dark:bg-[#588157]/25 dark:text-[#A3B18A]"}`}><Check size={13} strokeWidth={3} /></span>
                    <span className={destaque ? "text-[#E5EDE5]" : "text-[#344E41] dark:text-[#E5EDE5]"}>Relatórios financeiros</span>
                  </li>

                  <li className="flex items-center gap-3">
                    <span className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${destaque ? "bg-[#A3B18A]/25 text-[#DCE6D1]" : "bg-[#588157]/15 text-[#3A5A40] dark:bg-[#588157]/25 dark:text-[#A3B18A]"}`}><Check size={13} strokeWidth={3} /></span>
                    <span className={destaque ? "text-[#E5EDE5]" : "text-[#344E41] dark:text-[#E5EDE5]"}>Acesso durante {formatarPeriodo(plano.meses)}</span>
                  </li>
                </ul>

                <div className="relative mt-auto pt-8">
                  <button type="button" onClick={() => selecionarPlano(plano)} className={`group flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3.5 text-sm font-semibold transition-all duration-300 hover:scale-[1.03] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#588157] active:scale-[0.97] cursor-pointer ${destaque ? "bg-white text-[#273B31] shadow-[0_12px_35px_rgba(0,0,0,0.25)] hover:bg-[#E5EDE5]" : "bg-[#3A5A40] text-white shadow-[0_12px_35px_rgba(58,90,64,0.28)] hover:bg-[#344E41] dark:bg-[#588157] dark:hover:bg-[#6C966B]"}`}>
                    Contratar plano <ArrowRight size={17} className="transition-transform duration-300 group-hover:translate-x-1"/>
                  </button>
                </div>
              </motion.article>
            );
          })}
        </div>

        <p className="relative mx-auto mt-10 max-w-2xl text-center text-sm leading-6 text-[#6B7569] dark:text-[#BFC4AC]">Compare os períodos, os valores e os recursos de cada opção antes de escolher seu plano Visora.</p>
      </section>

      <div className="mx-auto h-px max-w-5xl bg-gradient-to-r from-transparent via-[#A3B18A] to-transparent dark:via-[#7E9971]/40" />

      {/* COMPARATIVO */}
      <section className="relative px-6 py-24 lg:px-10">
        <div className="pointer-events-none absolute -left-32 top-10 h-[420px] w-[420px] rounded-full bg-[#A3B18A]/25 blur-[110px] dark:bg-[#588157]/10" />

        <div className="relative mx-auto grid max-w-6xl items-center gap-14 lg:grid-cols-2">
          <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#A3B18A] bg-white/40 px-4 py-2 text-sm font-semibold text-[#3A5A40] backdrop-blur-md dark:border-[#7E9971]/40 dark:bg-[#1C2920]/60 dark:text-[#C9D5B8]">
              <TrendingUp size={16} /> COMPARATIVO
            </div>

            <h2 className="text-3xl font-bold leading-tight md:text-5xl">O valor por mês de <span className="bg-gradient-to-r from-[#344E41] via-[#588157] to-[#7E9971] bg-clip-text text-transparent dark:from-[#C9D5B8] dark:via-[#8FB58B] dark:to-[#588157]">cada plano</span></h2>

            <p className="mt-5 max-w-lg text-base leading-7 text-[#6B7569] dark:text-[#BFC4AC]">Todos os planos têm os mesmos recursos. O que muda é o período de acesso e quanto você paga por mês.</p>

            {planoAnual && planoAnual.economia > 0 && (
              <div className="mt-8 flex items-center gap-5">
                <span className="bg-gradient-to-r from-[#344E41] via-[#588157] to-[#7E9971] bg-clip-text text-6xl font-bold text-transparent dark:from-[#C9D5B8] dark:via-[#8FB58B] dark:to-[#588157]">
                  <NumeroAnimado valor={planoAnual.economia} sufixo="%"/>
                </span>

                <p className="max-w-[220px] text-sm leading-6 text-[#6B7569] dark:text-[#BFC4AC]">de economia no Plano Anual em comparação com pagar mês a mês.</p>
              </div>
            )}
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }} className="rounded-[28px] border border-[#588157]/70 bg-[#C1D0B5]/85 p-4 shadow-[0_30px_80px_rgba(52,78,65,0.18)] backdrop-blur-xl dark:border-[#34483A] dark:bg-[#18241C]/90 dark:shadow-[0_30px_80px_rgba(0,0,0,0.25)]">
            <div className="rounded-2xl border border-[#DAD7CD] bg-white p-5 dark:border-[#34483A] dark:bg-[#17231B]">
              <p className="text-sm font-semibold">Custo mensal equivalente</p>

              <p className="mt-1 text-xs text-[#6B7569] dark:text-[#BFC4AC]">Preço total de cada plano dividido pelo período.</p>

              <div className="mt-6 flex h-60 items-end gap-3 sm:gap-5">
                {planosCalculados.map((plano, indice) => (
                  <div key={plano.id} className="flex h-full flex-1 flex-col justify-end">
                    <motion.div initial={{ height: 0 }} whileInView={{height: `${(plano.porMes / maiorPorMes) * 100}%`}} viewport={{ once: true }} transition={{duration: 0.8, delay: indice * 0.1}} className={`flex items-start justify-center overflow-hidden rounded-t-xl pt-3 ${plano.meses === 12 ? "bg-gradient-to-t from-[#344E41] to-[#588157] dark:from-[#588157] dark:to-[#A3B18A]" : "bg-gradient-to-t from-[#3A5A40]/70 to-[#7E9971]/80 dark:from-[#588157]/60 dark:to-[#A3B18A]/70"}`}>
                      <span className="text-[11px] font-bold text-white sm:text-xs">{formatarValor(plano.porMes)}</span>
                    </motion.div>
                  </div>
                ))}
              </div>

              <div className="mt-3 flex gap-3 border-t border-[#DAD7CD] pt-3 dark:border-[#34483A] sm:gap-5">
                {planosCalculados.map((plano) => (
                  <div key={plano.id} className="flex-1 text-center text-xs font-semibold text-[#6B7569] dark:text-[#BFC4AC]">
                    {plano.tipo}
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* COMO FUNCIONA */}
      <section className="relative overflow-hidden bg-[#273B31] px-6 py-28 text-white transition-colors duration-500 dark:bg-[#0B120E] lg:px-10">
        <div className="pointer-events-none absolute -right-32 top-0 h-[480px] w-[480px] rounded-full bg-[#588157]/30 blur-[130px]" />
        <div className="pointer-events-none absolute -left-32 bottom-0 h-[420px] w-[420px] rounded-full bg-[#7E9971]/20 blur-[130px]" />

        <div className="relative mx-auto grid max-w-6xl gap-16 lg:grid-cols-[0.9fr_1.1fr]">
          <motion.div initial={{ opacity: 0, y: 25 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }} className="self-start lg:sticky lg:top-32">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#A3B18A]/35 bg-[#A3B18A]/10 px-4 py-2 text-sm font-semibold text-[#C9D5B8] backdrop-blur-md">
              COMO FUNCIONA?
            </div>

            <h2 className="text-3xl font-bold leading-tight md:text-5xl">Da escolha ao acesso, <span className="mt-1 block bg-gradient-to-r from-[#DCE6D1] via-[#A3B18A] to-[#7E9971] bg-clip-text text-transparent">sem complicação</span></h2>

            <ul className="mt-8 flex flex-col gap-4 text-[#C9D5B8]">
              <li className="flex items-center gap-3"><ShieldCheck size={20} className="text-[#A3B18A]" /> Pagamento seguro</li>
              <li className="flex items-center gap-3"><Receipt size={20} className="text-[#A3B18A]" /> Recibo em PDF</li>
              <li className="flex items-center gap-3"><Mail size={20} className="text-[#A3B18A]" /> Acesso liberado por e-mail</li>
            </ul>

            <a href="#planos" className="group mt-10 inline-flex items-center gap-2 rounded-xl border border-[#A3B18A]/40 bg-white/5 px-5 py-3 text-sm font-semibold text-white backdrop-blur-md transition-colors hover:bg-white/10">Ver planos <ArrowRight size={17} className="-rotate-90 transition-transform duration-300 group-hover:-translate-y-1"/></a>
          </motion.div>

          <div ref={refPassos} className="relative pl-16">
            <div className="absolute left-[21px] top-6 bottom-8 w-0.5 rounded-full bg-white/15" />

            <motion.div style={{ scaleY: preenchimentoLinha }} className="absolute left-[21px] top-6 bottom-8 w-0.5 origin-top rounded-full bg-gradient-to-b from-[#A3B18A] to-[#588157]"/>

            <motion.div initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true, margin: "-80px" }} transition={{ duration: 0.6 }} className="relative pb-16">
              <div className="absolute -left-16 top-0 flex h-11 w-11 items-center justify-center rounded-full border border-[#A3B18A]/60 bg-[#344E41] text-[#DCE6D1] ring-[6px] ring-[#273B31] dark:ring-[#0B120E]"><Sparkles size={20} /></div>

              <span className="text-xs font-semibold uppercase tracking-widest text-[#A3B18A]">Passo 1</span>
              <h3 className="mt-2 text-2xl font-bold">Escolha seu plano</h3>
              <p className="mt-2 max-w-md leading-7 text-[#C9D5B8]">Compare os períodos e selecione o que melhor atende às suas necessidades.</p>

              <div className="mt-4 flex flex-wrap gap-2">
                <span className="rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-medium text-[#DCE6D1]">Mensal</span>
                <span className="rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-medium text-[#DCE6D1]">Trimestral</span>
                <span className="rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-medium text-[#DCE6D1]">Semestral</span>
                <span className="rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-medium text-[#DCE6D1]">Anual</span>
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true, margin: "-80px" }} transition={{ duration: 0.6 }} className="relative pb-16">
              <div className="absolute -left-16 top-0 flex h-11 w-11 items-center justify-center rounded-full border border-[#A3B18A]/60 bg-[#344E41] text-[#DCE6D1] ring-[6px] ring-[#273B31] dark:ring-[#0B120E]"><CreditCard size={20} /></div>

              <span className="text-xs font-semibold uppercase tracking-widest text-[#A3B18A]">Passo 2</span>
              <h3 className="mt-2 text-2xl font-bold">Faça o pagamento</h3>
              <p className="mt-2 max-w-md leading-7 text-[#C9D5B8]">Preencha seus dados e pague com Pix, boleto ou cartão de crédito.</p>

              <div className="mt-4 flex flex-wrap gap-2">
                <span className="rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-medium text-[#DCE6D1]">Pix</span>
                <span className="rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-medium text-[#DCE6D1]">Boleto</span>
                <span className="rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-medium text-[#DCE6D1]">Cartão de crédito</span>
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true, margin: "-80px" }} transition={{ duration: 0.6 }} className="relative pb-0">
              <div className="absolute -left-16 top-0 flex h-11 w-11 items-center justify-center rounded-full border border-[#A3B18A]/60 bg-[#344E41] text-[#DCE6D1] ring-[6px] ring-[#273B31] dark:ring-[#0B120E]"><Mail size={20} /></div>

              <span className="text-xs font-semibold uppercase tracking-widest text-[#A3B18A]">Passo 3</span>
              <h3 className="mt-2 text-2xl font-bold">Ative sua conta</h3>
              <p className="mt-2 max-w-md leading-7 text-[#C9D5B8]">Você recebe um e-mail com o link para criar sua senha e começar a usar.</p>

              <div className="mt-4 flex flex-wrap gap-2">
                <span className="rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-medium text-[#DCE6D1]">Link por e-mail</span>
                <span className="rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-medium text-[#DCE6D1]">Recibo em PDF</span>
              </div>
            </motion.div>
          </div>
        </div>
      </section>


{/* CONTATO */}
<motion.div

  className="relative flex min-h-[650px] w-full items-center overflow-hidden bg-[#172B22] px-8 py-20 text-white md:px-12 lg:px-16 xl:px-20"
>
  {/* LUZES DE FUNDO */}
  <motion.div
    animate={reduzirMovimento ? undefined : {
      x: [0, 50, 0],
      y: [0, -30, 0],
      scale: [1, 1.2, 1],
    }}
    transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
    className="pointer-events-none absolute -right-20 -top-40 z-0 h-[450px] w-[450px] rounded-full bg-[#588157]/30 blur-[100px]"
  />

  <motion.div
    animate={reduzirMovimento ? undefined : {
      x: [0, -40, 0],
      y: [0, 30, 0],
    }}
    transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
    className="pointer-events-none absolute -bottom-48 -left-20 z-0 h-[400px] w-[400px] rounded-full bg-[#A3B18A]/15 blur-[100px]"
  />

  {/* LINHAS DECORATIVAS */}
  <div
    className="pointer-events-none absolute inset-0 z-0 opacity-[0.07]"
    style={{
      backgroundImage:
        "linear-gradient(rgba(255,255,255,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.3) 1px, transparent 1px)",
      backgroundSize: "45px 45px",
    }}
  />

  {/* IMAGEM OCUPANDO TODA A ALTURA À DIREITA */}
  <div className="pointer-events-none absolute inset-y-0 right-[-50px] w-[40%]">

    {/* AURA */}
    <motion.div
      animate={
        reduzirMovimento
          ? undefined
          : {
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.55, 0.3],
            }
      }
      transition={{
        duration: 7,
        repeat: Infinity,
        ease: "easeInOut",
      }}
      className="absolute right-0 top-1/2 h-[full] w-[500px] -translate-y-1/2 rounded-full bg-[#588157]/40 blur-[110px]"
    />

    {/* IMAGEM */}
    <motion.div
      initial={{ opacity: 0, x: 50 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 1.2 }}
      className="absolute inset-0"
      
    >
      <Image
  src="/areapublica_pagina_planos_contato.png"
  alt="Visualização da plataforma Visora"
  fill
  priority
  sizes="(max-width: 768px) 100vw, 50vw"
  className="object-cover object-right opacity-100"
/>
    </motion.div>

    {/* DEGRADÊ HORIZONTAL */}
    <div className="absolute inset-0 bg-gradient-to-r from-[#172B22] via-[#172B22]/25 to-transparent" />

    {/* DEGRADÊ VERTICAL */}
    <div className="absolute inset-0 bg-gradient-to-t from-[#172B22]/0 via-transparent to-[#172B22]/25" />

  </div>

  {/* CONTEÚDO PRINCIPAL */}
  <div className="relative z-10 mx-auto grid w-full max-w-[1600px] items-center gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:pr-[25%] xl:gap-8">

    {/* 1. TEXTO */}
    <div className="relative z-10">
      <motion.div
          initial={{ opacity: 0, x: -50 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 1.2 }}
        className="mb-8 inline-flex items-center gap-3 rounded-full border border-[#A3B18A]/30 bg-white/[0.06] px-4 py-2"
      >
        <span className="relative flex h-2.5 w-2.5">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#A3B18A] opacity-75" />
          <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-[#A3B18A]" />
        </span>

        <span className="text-xs font-semibold tracking-[0.18em] text-[#C5D2B5]">
          VAMOS CONVERSAR?
        </span>
      </motion.div>

      <motion.div    initial={{ opacity: 0, x: -50 }}
  whileInView={{ opacity: 1, x: 0 }}
  viewport={{ once: true }}
  transition={{ duration: 0.8 }}>
      <h2 className="text-4xl font-bold leading-[1.12] tracking-tight md:text-5xl xl:text-6xl">
        Sua próxima grande
        <span className="mt-2 block text-[#A3B18A]">
          decisão começa aqui.
        </span>
      </h2>

      <p className="mt-7 max-w-xl text-base leading-8 text-[#DAD7CD]/75">
        Transforme informações em oportunidades. Descubra como a Visora
        pode tornar sua gestão mais inteligente, estratégica e eficiente.
      </p>
</motion.div>
      <motion.div    initial={{ opacity: 0, x: -50 }}
  whileInView={{ opacity: 1, x: 0 }}
  viewport={{ once: true }}
  transition={{ duration: 0.8 }} className="mt-10 flex flex-wrap items-center gap-5">
        <Link 
          href="/areapublica_pagina_contato"
          className="group relative inline-flex items-center gap-3 overflow-hidden rounded-xl bg-[#A3B18A] px-7 py-4 font-bold text-[#172B22] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_15px_40px_rgba(163,177,138,0.25)]"
        >
          <span className="absolute inset-0 -translate-x-full bg-white/30 transition-transform duration-700 group-hover:translate-x-full" />

          <span className="relative">Entre em contato</span>

          <ArrowRight
            size={19}
            className="relative transition-transform duration-300 group-hover:translate-x-2"
          />
        </Link>
      </motion.div>
    </div>

    {/* 2. PAINEL DE INDICADORES */}
    <motion.div
  initial={{ opacity: 0, y: 60 }}
  whileInView={{ opacity: 1, y: 0 }}
  viewport={{ once: true, amount: 0.3 }}
  transition={{ duration: 0.8, ease: "easeOut" }}
  className="relative flex h-[360px] w-full max-w-[350px] items-center justify-center"
>

      {/* CÍRCULOS ORBITAIS */}
      <motion.div 
      
        animate={reduzirMovimento ? undefined : { rotate: 360 }}
        transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
        className="absolute h-[300px] w-[300px] rounded-full border border-dashed border-[#A3B18A]/30"
      />

      <motion.div
        animate={reduzirMovimento ? undefined : { rotate: -360 }}
        transition={{ duration: 22, repeat: Infinity, ease: "linear" }}
        className="absolute h-[235px] w-[235px] rounded-full border border-[#A3B18A]/20"
      >
        <span className="absolute -top-2 left-1/2 h-4 w-4 rounded-full bg-[#A3B18A] shadow-[0_0_20px_#A3B18A]" />

        <span className="absolute -bottom-2 right-10 h-3 w-3 rounded-full bg-[#588157] shadow-[0_0_18px_#588157]" />
      </motion.div>

      {/* PAINEL CENTRAL */}
      <motion.div
        animate={reduzirMovimento ? undefined : { y: [0, -12, 0] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
        className="relative z-10 flex h-48 w-56 flex-col justify-between rounded-2xl border border-[#A3B18A]/30 bg-[#273B31]/90 p-5 shadow-[0_25px_80px_rgba(0,0,0,0.35)] backdrop-blur-xl"
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold tracking-wider text-[#C5D2B5]">
            VISORA INSIGHTS
          </span>

          <span className="h-2 w-2 rounded-full bg-[#A3B18A] shadow-[0_0_10px_#A3B18A]" />
        </div>

        <div>
          <span className="text-xs text-white/50">
            Visão estratégica
          </span>

          <div className="mt-1 text-3xl font-bold text-white">
            +32,8%
          </div>
        </div>

        <div className="flex h-22 items-end gap-2">
          {[25, 42, 32, 60, 45, 75, 58, 95, 70, 100].map((altura, i) => (
            <motion.div
              key={i}
              initial={{ height: "10%" }}
              whileInView={{ height: `${altura}%` }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.3 + i * 0.08 }}
              className="flex-1 rounded-t-sm bg-gradient-to-t from-[#588157] to-[#A3B18A]"
            />
          ))}
        </div>
      </motion.div>

      {/* CARD FLUTUANTE SUPERIOR */}
      <motion.div
        animate={reduzirMovimento ? undefined : { y: [0, -10, 0], x: [0, 5, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        className="absolute -right-2 top-5 z-20 flex items-center gap-3 rounded-xl border border-white/10 bg-[#30483A]/95 px-3 py-3 shadow-xl backdrop-blur-lg"
      >
        <div className="rounded-lg bg-[#A3B18A]/15 p-2 text-[#A3B18A]">
          <TrendingUp size={20} />
        </div>

        <div>
          <p className="text-[10px] text-white/50">Desempenho</p>
          <p className="text-sm font-bold text-white">Em evolução</p>
        </div>
      </motion.div>

      {/* CARD FLUTUANTE INFERIOR */}
      <motion.div
        animate={reduzirMovimento ? undefined : { y: [0, 10, 0], x: [0, -5, 0] }}
        transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }}
        className="absolute -bottom-1 -left-2 z-20 flex items-center gap-3 rounded-xl border border-white/10 bg-[#30483A]/95 px-3 py-3 shadow-xl backdrop-blur-lg"
      >
        <div className="rounded-lg bg-[#A3B18A]/15 p-2 text-[#A3B18A]">
          <BarChart3 size={20} />
        </div>

        <div>
          <p className="text-[10px] text-white/50">Inteligência</p>
          <p className="text-sm font-bold text-white">Dados conectados</p>
        </div>
      </motion.div>

    </motion.div>
  </div>
</motion.div>




    </main>

    <FooterAreaPublica />
  </>);
}
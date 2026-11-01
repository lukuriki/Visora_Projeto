"use client";

import "@/styles/sobre.css";

import FooterAreaPublica from "@/components/FooterAreaPublica";
import HeaderAreaPublica from "@/components/HeaderAreaPublica";
import CtaSobre from "@/components/sobre/CtaSobre";
import EssenciaSobre from "@/components/sobre/EssenciaSobre";
import HeroSobre from "@/components/sobre/HeroSobre";

import { motion, useScroll, useSpring } from "framer-motion";



export default function SobreNosAreaPublica() {
  const { scrollYProgress } = useScroll();
  const progresso = useSpring(scrollYProgress, { stiffness: 120, damping: 25 });

  return (
    <div className="sobre relative isolate min-h-screen overflow-x-clip">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -left-48 top-0 size-[420px] rounded-full bg-[#588157]/20 blur-[120px] dark:bg-[#588157]/30" />
        <div className="absolute -right-48 top-[22%] size-[420px] rounded-full bg-[#A3B18A]/25 blur-[130px] dark:bg-[#3A5A40]/35" />
        <div className="absolute -left-48 top-[58%] size-[440px] rounded-full bg-[#3A5A40]/20 blur-[130px] dark:bg-[#588157]/25" />
        <div className="absolute -right-48 bottom-0 size-[440px] rounded-full bg-[#A3B18A]/20 blur-[130px] dark:bg-[#344E41]/40" />

        <div className="absolute inset-0 bg-[radial-gradient(#344E41_0.7px,transparent_0.7px)] [background-size:26px_26px] opacity-[0.045] dark:bg-[radial-gradient(#A3B18A_0.7px,transparent_0.7px)] dark:opacity-[0.07]" />
      </div>

      <HeaderAreaPublica />

      {/* BARRA DE PROGRESSO */}
        <motion.div style={{ scaleX: progresso }} className="fixed inset-x-0 top-0 z-[60] h-1 origin-left bg-gradient-to-r from-[#588157] via-[#A3B18A] to-[#588157]"/>

      <main>
        <HeroSobre />
        <EssenciaSobre />
        <CtaSobre />
      </main>

      <FooterAreaPublica />
    </div>
  );
}
"use client";

import { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "./ThemeProvider";
import { Sun, Moon, Menu, X, Sparkles, ArrowUpRight, LogIn } from "lucide-react";

const logoClara = "/logo_horizontal_lightmode.png";
const logoEscura = "/logo_horizontal_darkmode.png";

const navLinks = [
  { name: "Página inicial", href: "/" },
  { name: "Sobre nós", href: "/areapublica_pagina_sobre_nos" },
  { name: "Planos", href: "/areapublica_pagina_planos" },
  { name: "Contato", href: "/areapublica_pagina_contato" },
];

const focoVisivel ="focus:outline-none focus-visible:ring-2 focus-visible:ring-[#588157]";

export default function HeaderAreaPublica() {
  const { darkMode, toggleTheme } = useTheme();

  const [rolou, setRolou] = useState(false);
  const [menuAberto, setMenuAberto] = useState(false);

  const aoRolar = useCallback(() => {
    setRolou(window.scrollY > 10);
  }, []);

  useEffect(() => {
    aoRolar();

    window.addEventListener("scroll", aoRolar, { passive: true });

    return () => {
      window.removeEventListener("scroll", aoRolar);
    };
  }, [aoRolar]);

  useEffect(() => {
    if (!menuAberto) {
      document.body.style.overflow = "";
      return;
    }

    document.body.style.overflow = "hidden";

    const aoTeclar = (e) => {
      if (e.key === "Escape") {
        setMenuAberto(false);
      }
    };

    window.addEventListener("keydown", aoTeclar);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", aoTeclar);
    };
  }, [menuAberto]);

  const comFundo = rolou || menuAberto;

  return (<>
    <header className={`fixed inset-x-0 top-0 z-50 border-b p-4 transition-all duration-300 ${comFundo ? "border-[#A3B18A]/40 bg-[#F2F2F2]/90 shadow-lg shadow-[#344E41]/5 backdrop-blur-xl dark:border-[#7E9971]/20 dark:bg-[#111A14]/90" : "border-transparent bg-transparent"}`}>
      <div className={`mx-auto flex items-center justify-between gap-6 px-5 transition-all duration-300 sm:px-8 ${ rolou ? "h-16" : "h-20"}`}>
          
        {/* LOGO */}
        <Link href="/" className={`shrink-0 rounded-md transition-transform duration-300 hover:scale-105 ${focoVisivel}`}>
          <Image src={logoClara} alt="Logo Visora" width={140} height={40} priority className="h-25 w-auto dark:hidden"/>
          <Image src={logoEscura} alt="Logo Visora" width={140} height={40} priority className="hidden h-25 w-auto dark:block"/>
        </Link>

        {/* LINKS DESKTOP */}
        <nav aria-label="Principal" className="hidden lg:block">
          <ul className="flex items-center gap-18">
            {navLinks.map((link) => (
              <li key={link.name}>
                <Link href={link.href} className={`group relative rounded-sm text-[18px] font-semibold text-[#3A5A40] transition-colors hover:text-[#588157] dark:text-[#C1CEC2] dark:hover:text-white ${focoVisivel}`}>
                  {link.name}
                  <span className="absolute -bottom-1 left-0 h-0.5 w-full origin-left scale-x-0 rounded-full bg-[#588157] transition-transform duration-300 group-hover:scale-x-100 dark:bg-[#A3B18A]"/>
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* AÇÕES */}
        <div className="flex items-center gap-3">
          {/* TROCA DE TEMA */}
          <button type="button" role="switch" aria-checked={darkMode} onClick={toggleTheme} className={`relative flex h-12 w-[88px] shrink-0 items-center rounded-full border border-[#A3B18A]/60 bg-white/60 px-1.5 backdrop-blur transition-colors dark:border-[#7E9971]/40 dark:bg-[#1C2920]/70 ${focoVisivel}`}>
            <Sun size={19} className="absolute left-3 text-[#588157] dark:text-[#A3B18A]/60"/>
            <Moon size={19} className="absolute right-3 text-[#3A5A40]/50 dark:text-[#C9D5B8]"/>

            <motion.span animate={{ x: darkMode ? 40 : 0 }} transition={{type: "spring", stiffness: 420, damping: 28}} className="relative z-10 flex h-9 w-9 items-center justify-center rounded-full bg-[#3A5A40] text-white shadow-md dark:bg-[#588157]">
              <AnimatePresence mode="wait" initial={false}>
                <motion.span key={darkMode ? "lua" : "sol"} initial={{ rotate: -90, scale: 0.4, opacity: 0 }} animate={{ rotate: 0, scale: 1, opacity: 1 }} exit={{ rotate: 90, scale: 0.4, opacity: 0 }} transition={{ duration: 0.18 }}>
                  {darkMode ? <Moon size={19} /> : <Sun size={19} />}
                </motion.span>
              </AnimatePresence>
            </motion.span>
          </button>

          {/* ENTRAR */}
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.96 }} className="hidden sm:block">
            <Link href="/areapubliaca_pagina_planos" className={`group relative inline-flex items-center gap-2 overflow-hidden rounded-full bg-gradient-to-r from-[#3A5A40] to-[#588157] px-6 py-2.5 text-[16px] font-semibold text-white shadow-lg shadow-[#3A5A40]/25 transition-shadow hover:shadow-xl hover:shadow-[#588157]/40 ${focoVisivel}`}>
              <Sparkles size={19} className="transition-transform duration-500 group-hover:rotate-[180deg]"/> ENTRAR

              <ArrowUpRight size={19} className="-ml-0.5 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"/>

              <span aria-hidden="true" className="pointer-events-none absolute inset-y-0 -left-full w-1/2 -skew-x-12 bg-white/30 transition-transform duration-700 group-hover:translate-x-[400%]"/>
            </Link>
          </motion.div>
        </div>
      </div>
    </header>
  </>);
}
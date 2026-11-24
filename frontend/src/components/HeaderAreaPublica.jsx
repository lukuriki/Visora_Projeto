"use client";

import { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";

import { motion, AnimatePresence } from "framer-motion";

import { useTheme } from "./ThemeProvider";

import {
  Sun,
  Moon,
  Sparkles,
  ArrowUpRight,
  Menu,
  X,
} from "lucide-react";

const logoClara = "/logo_horizontal_lightmode.png";
const logoEscura = "/logo_horizontal_darkmode.png";

const navLinks = [
  { name: "Página inicial", href: "/" },
  {
    name: "Sobre nós",
    href: "/areapublica_pagina_sobre_nos",
  },
  {
    name: "Planos",
    href: "/areapublica_pagina_planos",
  },
  {
    name: "Contato",
    href: "/areapublica_pagina_contato",
  },
];

const focoVisivel =
  "focus:outline-none focus-visible:ring-2 focus-visible:ring-[#588157]";

export default function HeaderAreaPublica() {
  const { darkMode, toggleTheme } = useTheme();

  const [rolou, setRolou] = useState(false);
  const [menuAberto, setMenuAberto] = useState(false);


  

  const aoRolar = useCallback(() => {
    setRolou(window.scrollY > 10);
  }, []);

  useEffect(() => {
    aoRolar();

    window.addEventListener("scroll", aoRolar, {
      passive: true,
    });

    return () => {
      window.removeEventListener("scroll", aoRolar);
    };
  }, [aoRolar]);

  

  useEffect(() => {
    if (!menuAberto) return;

    function aoTeclar(e) {
      if (e.key === "Escape") setMenuAberto(false);
    }

    window.addEventListener("keydown", aoTeclar);

    return () => {
      window.removeEventListener("keydown", aoTeclar);
    };
  }, [menuAberto]);

  
  

  function alternarTema() {
    toggleTheme();
  }

  return (
    <header
      className={`
        fixed inset-x-0 top-0 z-50
        border-b p-2 sm:p-4
        transition-all duration-300
        ${
          rolou || menuAberto
            ? `
              border-[#A3B18A]/40
              bg-[#dbe6d1]
              shadow-lg shadow-[#344E41]/5
              backdrop-blur-xl
              dark:border-[#7E9971]/20
              dark:bg-[#111A14]/90
            `
            : "border-transparent bg-transparent"
        }
      `}
    >
      <div
        className={`
          mx-auto flex items-center
          justify-between gap-3 px-3
          transition-all duration-300
          min-[400px]:px-5 sm:gap-6 sm:px-8
          ${rolou ? "h-16" : "h-20"}
        `}
      >
        {/* ====================================
            LOGO
        ==================================== */}

        <Link
          href="/"
          onClick={() => setMenuAberto(false)}
          className={`
            shrink-0 rounded-md
            transition-transform duration-300
            hover:scale-105
            ${focoVisivel}
          `}
        >
          <Image
            src={logoClara}
            alt="Logo Visora"
            width={140}
            height={40}
            priority
            className="h-10 w-auto min-[400px]:h-12 sm:h-14 lg:h-20 2xl:h-25 dark:hidden"
          />

          <Image
            src={logoEscura}
            alt="Logo Visora"
            width={140}
            height={40}
            priority
            className="hidden h-10 w-auto min-[400px]:h-12 sm:h-14 lg:h-20 2xl:h-25 dark:block"
          />
        </Link>

        {/* ====================================
            LINKS DESKTOP
        ==================================== */}

        <nav
          aria-label="Principal"
          className="hidden lg:block"
        >
          <ul className="flex items-center gap-8 xl:gap-12 2xl:gap-18">
            {navLinks.map((link) => (
              <li key={link.name}>
                <Link
                  href={link.href}
                  className={`
                    group relative rounded-sm
                    text-[16px] font-semibold xl:text-[18px]
                    text-[#3A5A40]
                    transition-colors
                    hover:text-[#588157]
                    dark:text-[#C1CEC2]
                    dark:hover:text-white
                    ${focoVisivel}
                  `}
                >
                  {link.name}

                  <span
                    className="
                      absolute -bottom-1 left-0
                      h-0.5 w-full origin-left
                      scale-x-0 rounded-full
                      bg-[#588157]
                      transition-transform duration-300
                      group-hover:scale-x-100
                      dark:bg-[#A3B18A]
                    "
                  />
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* ====================================
            AÇÕES
        ==================================== */}

        <div className="flex items-center gap-2 sm:gap-3">
          {/* BOTÃO DE TEMA */}

          <button
            type="button"
            role="switch"
            aria-label={
              darkMode
                ? "Ativar modo claro"
                : "Ativar modo escuro"
            }
            aria-checked={darkMode}
            onClick={alternarTema}
            className={`
              relative flex h-12 w-[88px]
              shrink-0 items-center
              rounded-full border
              border-[#A3B18A]/60
              bg-white/60 px-1.5
              backdrop-blur
              transition-colors duration-300
              dark:border-[#7E9971]/40
              dark:bg-[#1C2920]/70
              ${focoVisivel}
            `}
          >
            <Sun
              size={19}
              className="
                absolute left-3
                text-[#588157]
                dark:text-[#A3B18A]/60
              "
            />

            <Moon
              size={19}
              className="
                absolute right-3
                text-[#3A5A40]/50
                dark:text-[#C9D5B8]
              "
            />

            {/* INDICADOR ANIMADO */}

            <motion.span
              initial={false}
              animate={{
                x: darkMode ? 40 : 0,
              }}
              transition={{
                type: "spring",
                stiffness: 420,
                damping: 28,
              }}
              className="
                relative z-10 flex
                h-9 w-9 items-center
                justify-center rounded-full
                bg-[#3A5A40]
                text-white shadow-md
                dark:bg-[#588157]
              "
            >
              <AnimatePresence
                mode="wait"
                initial={false}
              >
                <motion.span
                  key={darkMode ? "lua" : "sol"}
                  initial={{
                    rotate: -90,
                    scale: 0.4,
                    opacity: 0,
                  }}
                  animate={{
                    rotate: 0,
                    scale: 1,
                    opacity: 1,
                  }}
                  exit={{
                    rotate: 90,
                    scale: 0.4,
                    opacity: 0,
                  }}
                  transition={{
                    duration: 0.18,
                  }}
                >
                  {darkMode ? (
                    <Moon size={19} />
                  ) : (
                    <Sun size={19} />
                  )}
                </motion.span>
              </AnimatePresence>
            </motion.span>
          </button>

          {/* ====================================
              ENTRAR
          ==================================== */}

          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.96 }}
            className="hidden sm:block"
          >
            <Link
              href="/areapublica_pagina_login"
              className={`
                group relative inline-flex
                items-center gap-2
                overflow-hidden rounded-full
                bg-gradient-to-r
                from-[#3A5A40] to-[#588157]
                px-5 py-2.5 lg:px-6
                text-[15px] font-semibold lg:text-[16px]
                text-white
                shadow-lg shadow-[#3A5A40]/25
                transition-shadow
                hover:shadow-xl
                hover:shadow-[#588157]/40
                ${focoVisivel}
              `}
            >
              <Sparkles
                size={19}
                className="
                  transition-transform duration-500
                  group-hover:rotate-[180deg]
                "
              />

              ENTRAR

              <ArrowUpRight
                size={19}
                className="
                  -ml-0.5
                  transition-transform duration-300
                  group-hover:-translate-y-0.5
                  group-hover:translate-x-0.5
                "
              />

              <span
                aria-hidden="true"
                className="
                  pointer-events-none absolute
                  inset-y-0 -left-full
                  w-1/2 -skew-x-12
                  bg-white/30
                  transition-transform duration-700
                  group-hover:translate-x-[400%]
                "
              />
            </Link>
          </motion.div>

          {/* ====================================
              BOTÃO MENU (CELULAR E TABLET)
          ==================================== */}

          <button
            type="button"
            aria-label={
              menuAberto ? "Fechar menu" : "Abrir menu"
            }
            aria-expanded={menuAberto}
            aria-controls="menu-mobile"
            onClick={() => setMenuAberto((atual) => !atual)}
            className={`
              flex h-11 w-11 shrink-0
              items-center justify-center
              rounded-full border
              border-[#A3B18A]/60
              bg-white/60
              text-[#3A5A40]
              backdrop-blur
              transition-colors
              hover:text-[#588157]
              sm:h-12 sm:w-12
              lg:hidden
              dark:border-[#7E9971]/40
              dark:bg-[#1C2920]/70
              dark:text-[#C9D5B8]
              ${focoVisivel}
            `}
          >
            {menuAberto ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* ====================================
          MENU MOBILE
      ==================================== */}

      <AnimatePresence>
        {menuAberto && (
          <motion.nav
            id="menu-mobile"
            aria-label="Principal"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="
              absolute inset-x-0 top-full
              max-h-[calc(100vh-100%)] overflow-y-auto
              border-b border-[#A3B18A]/40
              bg-[#dbe6d1] px-5 pb-6 pt-2
              shadow-lg shadow-[#344E41]/10
              sm:px-8
              lg:hidden
              dark:border-[#7E9971]/20
              dark:bg-[#111A14]
            "
          >
            <ul className="flex flex-col">
              {navLinks.map((link) => (
                <li
                  key={link.name}
                  className="border-b border-[#A3B18A]/30 last:border-b-0 dark:border-[#7E9971]/20"
                >
                  <Link
                    href={link.href}
                    onClick={() => setMenuAberto(false)}
                    className={`
                      block rounded-sm py-4
                      text-lg font-semibold
                      text-[#3A5A40]
                      transition-colors
                      hover:text-[#588157]
                      dark:text-[#C1CEC2]
                      dark:hover:text-white
                      ${focoVisivel}
                    `}
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>

            {/* ENTRAR (só no celular, no tablet já aparece no topo) */}

            <Link
              href="/areapublica_pagina_login"
              onClick={() => setMenuAberto(false)}
              className={`
                group mt-4 flex w-full
                items-center justify-center gap-2
                rounded-full
                bg-gradient-to-r
                from-[#3A5A40] to-[#588157]
                px-6 py-3
                text-[16px] font-semibold
                text-white
                shadow-lg shadow-[#3A5A40]/25
                sm:hidden
                ${focoVisivel}
              `}
            >
              <Sparkles size={19} />
              ENTRAR
              <ArrowUpRight size={19} className="-ml-0.5" />
            </Link>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}
"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Moon, Sun } from "lucide-react";

import { useTheme } from "@/components/themeProvider";

export default function ThemeToggle() {
  const { darkMode: escuro, toggleTheme } = useTheme();

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-pressed={escuro}
      aria-label={escuro ? "Ativar modo claro" : "Ativar modo escuro"}
      title={escuro ? "Modo claro" : "Modo escuro"}
      className="grid size-10 shrink-0 place-items-center rounded-full border border-(--sb-line) text-(--sb-fg) transition-colors hover:bg-(--sb-hover)"
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={escuro ? "sol" : "lua"}
          initial={{ opacity: 0, rotate: -70, scale: 0.6 }}
          animate={{ opacity: 1, rotate: 0, scale: 1 }}
          exit={{ opacity: 0, rotate: 70, scale: 0.6 }}
          transition={{ duration: 0.22 }}
          className="grid place-items-center"
        >
          {escuro ? <Sun size={18} aria-hidden="true" /> : <Moon size={18} aria-hidden="true" />}
        </motion.span>
      </AnimatePresence>
    </button>
  );
}
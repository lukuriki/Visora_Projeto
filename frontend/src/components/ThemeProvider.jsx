
"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  const [darkMode, setDarkMode] = useState(false);
  const [carregado, setCarregado] = useState(false);

  useEffect(() => {
    const temaSalvo = localStorage.getItem("visora-theme");

    const temaInicial =
      temaSalvo === "dark" ||
      (!temaSalvo &&
        window.matchMedia("(prefers-color-scheme: dark)").matches);

    setDarkMode(temaInicial);

    document.documentElement.classList.toggle("dark", temaInicial);

    setCarregado(true);
  }, []);

  const toggleTheme = useCallback(() => {
    setDarkMode((atual) => {
      const novoTema = !atual;

      document.documentElement.classList.toggle("dark", novoTema);

      localStorage.setItem(
        "visora-theme",
        novoTema ? "dark" : "light"
      );

      return novoTema;
    });
  }, []);

  if (!carregado) return null;

  return (
    <ThemeContext.Provider value={{ darkMode, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const contexto = useContext(ThemeContext);

  if (!contexto) {
    throw new Error(
      "useTheme precisa estar dentro de ThemeProvider."
    );
  }

  return contexto;
}

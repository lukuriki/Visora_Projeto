
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
    const root = document.documentElement;

    const temaSalvo = localStorage.getItem("visora-theme");

    const prefereEscuro = window.matchMedia(
      "(prefers-color-scheme: dark)"
    ).matches;

    const temaInicial =
      temaSalvo === "dark" ||
      (!temaSalvo && prefereEscuro);

    root.classList.toggle("dark", temaInicial);

    setDarkMode(temaInicial);
    setCarregado(true);
  }, []);

  

  const toggleTheme = useCallback(() => {
    const root = document.documentElement;


    const novoTema = !root.classList.contains("dark");

    root.classList.toggle("dark", novoTema);


    localStorage.setItem(
      "visora-theme",
      novoTema ? "dark" : "light"
    );

    setDarkMode(novoTema);
  }, []);

  

  useEffect(() => {
    if (!carregado) return;

    const root = document.documentElement;

    const observer = new MutationObserver(() => {
      const temaAtual = root.classList.contains("dark");

      setDarkMode((anterior) =>
        anterior === temaAtual ? anterior : temaAtual
      );
    });

    observer.observe(root, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => observer.disconnect();
  }, [carregado])

  if (!carregado) {
    return null;
  }


  return (
    <ThemeContext.Provider
      value={{
        darkMode,
        toggleTheme,
      }}
    >
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

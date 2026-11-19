
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

  // ==========================================
  // CARREGAR TEMA INICIAL
  // ==========================================

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

  // ==========================================
  // ALTERNAR TEMA COM UM CLIQUE
  // ==========================================

  const toggleTheme = useCallback(() => {
    const root = document.documentElement;

    // Consulta o tema realmente aplicado no HTML.
    const novoTema = !root.classList.contains("dark");

    // Atualiza o HTML imediatamente.
    root.classList.toggle("dark", novoTema);

    // Salva a preferência do usuário.
    localStorage.setItem(
      "visora-theme",
      novoTema ? "dark" : "light"
    );

    // Atualiza o estado do React.
    setDarkMode(novoTema);
  }, []);

  // ==========================================
  // SINCRONIZAR ALTERAÇÕES EXTERNAS
  // ==========================================

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
  }, [carregado]);

  // ==========================================
  // AGUARDAR CARREGAMENTO
  // ==========================================

  if (!carregado) {
    return null;
  }

  // ==========================================
  // PROVIDER
  // ==========================================

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

// ==========================================
// HOOK PARA UTILIZAR O TEMA
// ==========================================

export function useTheme() {
  const contexto = useContext(ThemeContext);

  if (!contexto) {
    throw new Error(
      "useTheme precisa estar dentro de ThemeProvider."
    );
  }

  return contexto;
}

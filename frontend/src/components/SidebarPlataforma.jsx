
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

import { buscarPerfilUsuario } from "@/lib/api";

import {
  LayoutDashboard,
  FileText,
  ChartNoAxesCombined,
  ShieldCheck,
  TrendingUp,
  UserRound,
  Sun,
  Moon,
  LogOut,
  PanelLeftClose,
  PanelLeftOpen,
  UserGroup 
} from "lucide-react";

export default function SidebarPlataforma({ collapsed, setCollapsed }) {
  const [darkMode, setDarkMode] = useState(false);
  const [recolhidoInterno, setRecolhidoInterno] = useState(false);
  const [usuario, setUsuario] = useState(null);

  const pathname = usePathname();
  const router = useRouter();

  const menuRecolhido = collapsed ?? recolhidoInterno;

  // Carregar dados do usuário e acompanhar atualizações do perfil.
  useEffect(() => {
    function atualizarUsuario() {
      const usuarioSalvo = sessionStorage.getItem("visora-usuario");

      if (usuarioSalvo) {
        try {
          setUsuario(JSON.parse(usuarioSalvo));
        } catch (error) {
          console.error("Erro ao ler usuário salvo:", error);
        }
      }
    }

    async function carregarPerfil() {
      try {
        const token = sessionStorage.getItem("visora-token");

        if (!token) {
          router.replace("/areapublica_pagina_login");
          return;
        }

        atualizarUsuario();

        const resultado = await buscarPerfilUsuario(token);

        if (resultado?.usuario) {
          setUsuario(resultado.usuario);

          sessionStorage.setItem(
            "visora-usuario",
            JSON.stringify(resultado.usuario)
          );
        }
      } catch (error) {
        console.error("Erro ao carregar perfil:", error);
      }
    }

    carregarPerfil();

    // Escuta as alterações feitas na página de perfil.
    window.addEventListener(
      "visora-perfil-atualizado",
      atualizarUsuario
    );

    return () => {
      window.removeEventListener(
        "visora-perfil-atualizado",
        atualizarUsuario
      );
    };
  }, [router]);

  // Alternar recolhimento do menu.
  function alternarSidebar() {
    if (typeof setCollapsed === "function") {
      setCollapsed(!menuRecolhido);
    } else {
      setRecolhidoInterno(!menuRecolhido);
    }
  }

  // Encerrar sessão.
  function sairDaConta() {
    sessionStorage.removeItem("visora-token");
    sessionStorage.removeItem("visora-usuario");

    router.push("/areapublica_pagina_login");
  }

  // Traduzir perfil de acesso.
  function obterNomePerfil(tipo) {
    const perfis = {
      proprietario: "Proprietário",
      administrador: "Administrador",
      colaborador: "Colaborador",
    };

    return perfis[tipo] || "Usuário";
  }

  const nomeUsuario =
    usuario?.nomeCompleto ||
    usuario?.nome_completo ||
    usuario?.nomeUsuario ||
    "Carregando...";

  const inicialUsuario = nomeUsuario.trim().charAt(0).toUpperCase();

  const perfilUsuario = obterNomePerfil(
    usuario?.tipo || usuario?.perfilAcesso || usuario?.perfil_acesso
  );

  const menuItems = [
    {
      nome: "Página Inicial",
      href: "/plataforma_pagina_inicial",
      icon: LayoutDashboard,
    },
    {
      nome: "Informações Contábeis",
      href: "/plataforma_pagina_informacoes_contabeis",
      icon: FileText,
    },
    {
      nome: "Análises",
      href: "/plataforma_pagina_analise",
      icon: ChartNoAxesCombined,
    },
    {
      nome: "Auditoria",
      href: "/plataforma_pagina_auditoria",
      icon: ShieldCheck,
    },
    {
      nome: "Previsões",
      href: "/plataforma_pagina_previsao",
      icon: TrendingUp,
    },
    {
      nome: "Perfil",
      href: "/plataforma_pagina_perfil",
      icon: UserRound,
    },
    {
      nome: "Equipe",
      href: "/plataforma_pagina_equipe",
      icon: UserGroup,
    },
  ];

  return (
    <aside
      className={`
        fixed left-0 top-0 z-50
        flex h-screen flex-col
        border-r border-[#DAD7CD]
        bg-[#F8F9F6] text-[#273B31]
        transition-all duration-300
        dark:border-[#34483A]
        dark:bg-[#111A14]
        dark:text-[#E5EDE5]
        ${menuRecolhido ? "w-[82px]" : "w-[270px]"}
      `}
    >
      {/* LOGO */}
      <div
        className={`flex h-[88px] shrink-0 items-center border-b border-[#DAD7CD] dark:border-[#34483A] ${
          menuRecolhido ? "justify-center" : "px-5"
        }`}
      >
        <Link
          href="/plataforma_pagina_inicial"
          className="flex items-center justify-center"
        >
          {!menuRecolhido && (
            <>
              <img
                src="/logo_horizontal_lightmode.png"
                alt="Visora"
                className="h-auto w-[190px] object-contain dark:hidden"
              />

              <img
                src="/logo_horizontal_darkmode.png"
                alt="Visora"
                className="hidden h-auto w-[190px] object-contain dark:block"
              />
            </>
          )}

          {menuRecolhido && (
            <>
              <img
                src="/logo_v_lightmode.png"
                alt="Visora"
                className="h-10 w-10 object-contain dark:hidden"
              />

              <img
                src="/logo_v_darkmode.png"
                alt="Visora"
                className="hidden h-10 w-10 object-contain dark:block"
              />
            </>
          )}
        </Link>
      </div>

      {/* USUÁRIO */}
      <div
        className={`mx-3 mt-5 rounded-2xl border border-[#DAD7CD] bg-white/70 p-3 dark:border-[#34483A] dark:bg-[#1C2920] ${
          menuRecolhido ? "flex justify-center" : ""
        }`}
      >
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#DCE7D7] font-bold text-[#344E41] dark:bg-[#344E41] dark:text-white">
            <p>{inicialUsuario}</p>
          </div>

          {!menuRecolhido && (
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold">
                {nomeUsuario}
              </p>

              <p className="text-xs text-[#7B887D] dark:text-[#AAB8AC]">
                {perfilUsuario}
              </p>
            </div>
          )}
        </div>
      </div>

      {!menuRecolhido && (
        <p className="px-6 pb-2 pt-7 text-[10px] font-semibold uppercase tracking-[1.8px] text-[#89958A]">
          Menu principal
        </p>
      )}

      {/* MENU */}
      <nav className="flex-1 space-y-1 overflow-y-auto px-3 pb-4 pt-5">
        {menuItems.map((item) => {
          const selecionado = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              title={menuRecolhido ? item.nome : ""}
              aria-current={selecionado ? "page" : undefined}
              className={`
                flex min-h-[46px] items-center gap-3 rounded-xl px-3
                text-[13px] font-medium transition
                ${menuRecolhido ? "justify-center" : ""}
                ${
                  selecionado
                    ? "bg-[#344E41] text-white shadow-sm hover:bg-[#3A5A40]"
                    : "text-[#68776B] hover:bg-[#E8EDE5] dark:text-[#B1BEB2] dark:hover:bg-[#1C2920]"
                }
              `}
            >
              <Icon size={19} />

              {!menuRecolhido && <span>{item.nome}</span>}
            </Link>
          );
        })}
      </nav>

      {/* RODAPÉ */}
      <div className="space-y-2 border-t border-[#DAD7CD] p-3 dark:border-[#34483A]">
        {/* TEMA */}
        <button
          onClick={() => {
            setDarkMode(!darkMode);
            document.documentElement.classList.toggle("dark", !darkMode);
          }}
          title={menuRecolhido ? "Alternar tema" : ""}
          className={`flex min-h-[46px] w-full items-center gap-3 rounded-xl px-3 text-[13px] font-medium text-[#68776B] transition hover:bg-[#E8EDE5] dark:text-[#B1BEB2] dark:hover:bg-[#1C2920] ${
            menuRecolhido ? "justify-center" : ""
          }`}
        >
          {darkMode ? <Sun size={19} /> : <Moon size={19} />}

          {!menuRecolhido && (
            <>
              <span className="flex-1 text-left">
                {darkMode ? "Modo claro" : "Modo escuro"}
              </span>

              <span
                className={`relative h-5 w-9 rounded-full transition ${
                  darkMode ? "bg-[#588157]" : "bg-[#D0D8CD]"
                }`}
              >
                <span
                  className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-all ${
                    darkMode ? "left-[18px]" : "left-0.5"
                  }`}
                />
              </span>
            </>
          )}
        </button>

        {/* RECOLHER MENU */}
        <button
          onClick={alternarSidebar}
          title={menuRecolhido ? "Expandir menu" : "Recolher menu"}
          className={`flex min-h-[42px] w-full items-center gap-3 rounded-xl px-3 text-xs text-[#89958A] transition hover:bg-[#E8EDE5] dark:text-[#AAB8AC] dark:hover:bg-[#1C2920] ${
            menuRecolhido ? "justify-center" : ""
          }`}
        >
          {menuRecolhido ? (
            <PanelLeftOpen size={18} />
          ) : (
            <PanelLeftClose size={18} />
          )}

          {!menuRecolhido && <span>Recolher menu</span>}
        </button>

        {/* SAIR */}
        <button
          onClick={sairDaConta}
          title={menuRecolhido ? "Sair da conta" : ""}
          className={`flex min-h-[46px] w-full items-center gap-3 rounded-xl px-3 text-[13px] font-medium text-[#A14E4E] transition hover:bg-[#F7E9E7] dark:text-[#E6A09A] dark:hover:bg-[#382321] ${
            menuRecolhido ? "justify-center" : ""
          }`}
        >
          <LogOut size={19} />

          {!menuRecolhido && <span>Sair da conta</span>}
        </button>

        {!menuRecolhido && (
          <div className="px-3 pb-1 pt-2">
            <p className="text-[10px] text-[#9AA49A] dark:text-[#758578]">
              Visora © 2026
            </p>

            <p className="mt-1 text-[10px] text-[#9AA49A] dark:text-[#758578]">
              Transforme dados em visão.
            </p>
          </div>
        )}
      </div>
    </aside>
  );
}

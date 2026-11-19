"use client";

import Image from "next/image";
import Link from "next/link";

import {
  Plus,
  MessageSquare,
  Sparkles,
  ChevronRight,
  PanelLeftClose,
  PanelLeftOpen,
  Leaf,
} from "lucide-react";

import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";

// ==========================================
// CONVERSAS DE EXEMPLO
// ==========================================

const conversas = [
  { id: 1, titulo: "Matemática" },
  { id: 2, titulo: "Português" },
];

// ==========================================
// ESTILO DOS ÍCONES
// ==========================================

const botaoIcone = `
  flex h-11 w-11 shrink-0
  items-center justify-center
  rounded-xl
  text-[#588157]
  transition-all duration-200
  hover:bg-[#E1EADD]
  hover:text-[#344E41]
  dark:text-[#A3B18A]
  dark:hover:bg-[#273B31]
  dark:hover:text-white
`;

// ==========================================
// SIDEBAR VION
// ==========================================

export function AppSidebar() {
  const {
    open,
    setOpen,
    isMobile,
    openMobile,
    setOpenMobile,
  } = useSidebar();

  const compacto = !isMobile && !open;

  const alternar = () => {
    if (isMobile) {
      setOpenMobile(!openMobile);
    } else {
      setOpen(!open);
    }
  };

  return (
    <Sidebar
      collapsible="icon"
      style={{
        "--sidebar-width-icon": "82px",
      }}
      className="
        border-r border-[#DAD7CD]/80
        bg-[#F4F7F1]
        text-[#273B31]
        dark:border-[#34483A]
        dark:bg-[#111A14]
        dark:text-[#E5EDE5]
        [&_[data-sidebar=sidebar]]:bg-[#F4F7F1]
        dark:[&_[data-sidebar=sidebar]]:bg-[#111A14]
      "
    >
      {/* ======================================
          HEADER
      ====================================== */}

      <SidebarHeader
        className={`
          relative
          border-b border-[#DAD7CD]/60
          bg-gradient-to-b
          from-[#EDF3E9]
          to-[#F4F7F1]
          dark:border-[#34483A]
          dark:from-[#1C2920]
          dark:to-[#111A14]
          ${
            compacto
              ? "items-center px-1 py-5"
              : "px-4 pb-5 pt-5"
          }
        `}
      >
        {compacto ? (
          // ==================================
          // SIDEBAR RECOLHIDA
          // ==================================

          <div className="flex w-full flex-col items-center gap-4">

            {/* LOGO ORIGINAL */}
            <Link
              href="/teste"
              title="Vion"
              aria-label="Vion - Página inicial"
              className="
                flex h-12 w-12
                items-center justify-center
                rounded-xl
                transition-all duration-300
                hover:bg-[#E1EADD]
                dark:hover:bg-[#273B31]
              "
            >
              <Image
                src="/logo_v_darkmode.png"
                alt="Logo Vion"
                width={42}
                height={42}
                className="h-10 w-10 object-contain"
              />
            </Link>

            {/* BOTÃO EXPANDIR */}
            <button
              type="button"
              onClick={alternar}
              title="Expandir menu"
              aria-label="Expandir menu"
              className={botaoIcone}
            >
              <PanelLeftOpen
                size={20}
                strokeWidth={1.8}
              />
            </button>

          </div>
        ) : (
          // ==================================
          // SIDEBAR EXPANDIDA
          // ==================================

          <>
            {/* LOGO + NOME */}
            <div className="flex items-center justify-between gap-2">

              <Link
                href="/teste"
                className="
                  flex min-w-0
                  items-center gap-3
                  rounded-xl py-2
                "
              >
                <span
                  className="
                    flex h-12 w-12
                    shrink-0 items-center justify-center
                    rounded-2xl
                    bg-gradient-to-br
                    from-[#7E9971]
                    via-[#588157]
                    to-[#344E41]
                    shadow-[0_6px_20px_#58815730]
                  "
                >
                  <Image
                    src="/logo_v_darkmode.png"
                    alt="Logo Vion"
                    width={34}
                    height={34}
                    className="h-8 w-8 object-contain"
                  />
                </span>

                <span className="min-w-0">
                  <span
                    className="
                      block text-[19px]
                      font-bold tracking-tight
                      text-[#273B31]
                      dark:text-[#E5EDE5]
                    "
                  >
                    Vion
                  </span>

                  <span
                    className="
                      block text-[10px]
                      font-semibold uppercase
                      tracking-[0.13em]
                      text-[#7E9971]
                    "
                  >
                    Inteligência Visora
                  </span>
                </span>
              </Link>

              {/* BOTÃO RECOLHER */}
              <button
                type="button"
                onClick={alternar}
                title="Recolher menu"
                aria-label="Recolher menu"
                className="
                  flex h-9 w-9
                  shrink-0 items-center justify-center
                  rounded-lg
                  text-[#7E9971]
                  transition-all duration-200
                  hover:bg-[#E1EADD]
                  dark:hover:bg-[#344E41]
                "
              >
                <PanelLeftClose size={19} />
              </button>

            </div>

            {/* NOVA CONVERSA */}
            <button
              type="button"
              className="
                mt-5 flex h-12 w-full
                items-center justify-between
                rounded-xl
                bg-[#588157]
                px-4 text-sm font-semibold
                text-white shadow-sm
                transition-all duration-300
                hover:bg-[#3A5A40]
                active:scale-[0.98]
              "
            >
              <span className="flex items-center gap-3">
                <Plus size={19} />
                Nova conversa
              </span>

              <ChevronRight size={17} />
            </button>

            {/* HISTÓRICO */}
            <div
              className="
                mt-7 flex items-center
                justify-between px-2
              "
            >
              <span
                className="
                  flex items-center gap-2
                  text-[10px] font-bold
                  uppercase tracking-[0.18em]
                  text-[#7E9971]
                "
              >
                <span
                  className="
                    h-1.5 w-1.5
                    rounded-full bg-[#588157]
                  "
                />

                Histórico
              </span>

              <span
                className="
                  rounded-md
                  bg-[#E1EADD]
                  px-2 py-0.5
                  text-[10px] font-semibold
                  text-[#588157]
                  dark:bg-[#273B31]
                  dark:text-[#A3B18A]
                "
              >
                {conversas.length}
              </span>
            </div>
          </>
        )}
      </SidebarHeader>

      {/* ======================================
          CONTEÚDO
      ====================================== */}

      <SidebarContent
        className={`
          bg-[#F4F7F1]
          dark:bg-[#111A14]
          ${
            compacto
              ? "px-1 py-4"
              : "px-3 py-4"
          }
        `}
      >
        {compacto ? (
          // ==================================
          // HISTÓRICO RECOLHIDO
          // ==================================

          <div
            className="
              flex w-full flex-col
              items-center gap-3 pt-2
            "
          >
            {/* NOVA CONVERSA */}
            <button
              type="button"
              title="Nova conversa"
              aria-label="Nova conversa"
              className={botaoIcone}
            >
              <Plus
                size={21}
                strokeWidth={1.8}
              />
            </button>

            {/* SEPARADOR */}
            <div
              className="
                my-1 h-px w-12
                bg-[#DAD7CD]/70
                dark:bg-[#34483A]
              "
            />

            {/* CONVERSAS */}
            {conversas.map((conversa) => (
              <button
                key={conversa.id}
                type="button"
                title={conversa.titulo}
                aria-label={`Conversa: ${conversa.titulo}`}
                className={botaoIcone}
              >
                <MessageSquare
                  size={19}
                  strokeWidth={1.8}
                />
              </button>
            ))}
          </div>
        ) : (
          // ==================================
          // HISTÓRICO EXPANDIDO
          // ==================================

          <div className="flex flex-col gap-1.5">
            {conversas.map((conversa) => (
              <button
                key={conversa.id}
                type="button"
                className="
                  group flex w-full
                  items-center gap-3
                  rounded-xl
                  border border-transparent
                  px-3 py-3
                  text-left text-[13px]
                  font-medium
                  text-[#738276]
                  transition-all duration-200
                  hover:border-[#DAD7CD]/60
                  hover:bg-[#E5EDE2]
                  hover:text-[#344E41]
                  dark:text-[#A3B18A]
                  dark:hover:border-[#34483A]
                  dark:hover:bg-[#1C2920]
                  dark:hover:text-[#E5EDE5]
                "
              >
                <MessageSquare
                  size={17}
                  strokeWidth={1.8}
                  className="shrink-0"
                />

                <span className="flex-1 truncate">
                  {conversa.titulo}
                </span>

                <ChevronRight
                  size={14}
                  className="
                    opacity-0
                    transition-all duration-200
                    group-hover:opacity-60
                  "
                />
              </button>
            ))}
          </div>
        )}
      </SidebarContent>

      {/* ======================================
          FOOTER
          SEM CONFIGURAÇÕES
      ====================================== */}

      {!compacto && (
        <SidebarFooter
          className="
            border-t border-[#DAD7CD]/70
            bg-[#F0F5ED]
            p-3
            dark:border-[#34483A]
            dark:bg-[#17231A]
          "
        >
          {/* IDENTIDADE VISORA */}
          <div
            className="
              flex items-center gap-3
              rounded-xl
              border border-[#DAD7CD]/60
              bg-white/50
              px-3 py-3
              dark:border-[#34483A]
              dark:bg-[#1C2920]/70
            "
          >
            <span
              className="
                flex h-9 w-9 shrink-0
                items-center justify-center
                rounded-xl
                bg-[#E1EADD]
                dark:bg-[#344E41]
              "
            >
              <Leaf
                size={17}
                className="
                  text-[#588157]
                  dark:text-[#A3B18A]
                "
              />
            </span>

            <span className="min-w-0 flex-1">
              <span
                className="
                  block text-xs font-bold
                  text-[#344E41]
                  dark:text-[#E5EDE5]
                "
              >
                Visora
              </span>

              <span
                className="
                  block text-[10px]
                  text-[#7E9971]
                  dark:text-[#A3B18A]
                "
              >
                Inteligência que transforma
              </span>
            </span>

            <Sparkles
              size={15}
              className="text-[#A3B18A]"
            />
          </div>
        </SidebarFooter>
      )}
    </Sidebar>
  );
}
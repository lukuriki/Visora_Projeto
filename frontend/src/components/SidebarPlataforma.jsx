
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

import { buscarPerfilUsuario, buscarEmpresasUsuario, obterEmpresaAtivaId, definirEmpresaAtivaId, limparEmpresaAtiva } from "@/lib/api";

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
  UsersRound,
  Building2,
  ChevronDown,
  Plus,
  Loader2,
  X,
  CheckCircle2,
} from "lucide-react";

const SIDEBAR_KEY = "visora-sidebar-collapsed";
const LEGACY_KEY = "visora-sidebar-recolhida";

function lerEstadoSidebar() {
  if (typeof window === "undefined") return false;
  const salvo = localStorage.getItem(SIDEBAR_KEY);
  if (salvo !== null) return salvo === "true";
  const antigo = localStorage.getItem(LEGACY_KEY);
  return antigo !== null ? antigo === "true" : false;
}

export default function SidebarPlataforma({ collapsed, setCollapsed }) {
  const [recolhidoInterno, setRecolhidoInterno] = useState(false);
  const [sidebarPronta, setSidebarPronta] = useState(false);
  const [animarSidebar, setAnimarSidebar] = useState(false);
  const [mobile, setMobile] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [usuario, setUsuario] = useState(null);
  const [empresas, setEmpresas] = useState([]);
  const [empresaAtiva, setEmpresaAtiva] = useState(null);
  const [menuEmpresasAberto, setMenuEmpresasAberto] = useState(false);
  const [carregandoEmpresas, setCarregandoEmpresas] = useState(false);
  const [avisoEmpresas, setAvisoEmpresas] = useState("");
  const [modalEmpresaAberto, setModalEmpresaAberto] = useState(false);
  const [salvandoEmpresa, setSalvandoEmpresa] = useState(false);
  const [erroCadastroEmpresa, setErroCadastroEmpresa] = useState("");
  const [limiteEmpresas, setLimiteEmpresas] = useState(null);
  const [carregandoLimite, setCarregandoLimite] = useState(false);
  const [formEmpresa, setFormEmpresa] = useState({
    nomeEmpresa: "",
    emailEmpresa: "",
    telefoneEmpresa: "",
    tipoDocumento: "CNPJ",
    documento: "",
    areaAtuacao: "Tecnologia",
  });

  const pathname = usePathname();
  const router = useRouter();
  const menuRecolhido = recolhidoInterno;
  const abertoMobile = mobile && !menuRecolhido;


  useEffect(() => {

    if (!sidebarPronta) return;
    if (typeof setCollapsed === "function") {
      setCollapsed(menuRecolhido);
    }
  }, [sidebarPronta, menuRecolhido, setCollapsed]);


  useEffect(() => {
    const ajustar = () => {
      const pequeno = window.innerWidth < 768;
      setMobile(pequeno);
      setRecolhidoInterno(pequeno ? true : lerEstadoSidebar());
    };

    ajustar();
    setSidebarPronta(true);
    window.addEventListener("resize", ajustar);
    return () => window.removeEventListener("resize", ajustar);
  }, []);

  useEffect(() => {
    const sincronizar = () => {
      if (window.innerWidth >= 768) {
        setRecolhidoInterno(lerEstadoSidebar());
      }
    };
    const aoStorage = (evento) => {
      if (evento.key === SIDEBAR_KEY || evento.key === LEGACY_KEY) sincronizar();
    };
    window.addEventListener("storage", aoStorage);
    window.addEventListener("visora-sidebar-alterada", sincronizar);
    return () => {
      window.removeEventListener("storage", aoStorage);
      window.removeEventListener("visora-sidebar-alterada", sincronizar);
    };
  }, []);

  useEffect(() => {
    if (window.innerWidth < 768) setRecolhidoInterno(true);
  }, [pathname]);

  function alternarSidebar() {
    const novoEstado = !menuRecolhido;
    setRecolhidoInterno(novoEstado);
    setAnimarSidebar(true);
    if (window.innerWidth >= 768) {
      localStorage.setItem(SIDEBAR_KEY, String(novoEstado));
      localStorage.setItem(LEGACY_KEY, String(novoEstado));
      window.dispatchEvent(new Event("visora-sidebar-alterada"));
    }
  }


  useEffect(() => {
    const atualizarTema = () => {
      setDarkMode(
        document.documentElement.classList.contains("dark")
      );
    };

    atualizarTema();

    const observer = new MutationObserver(atualizarTema);

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => observer.disconnect();
  }, []);

  function alternarTema() {
    const novoTema = !darkMode;

    document.documentElement.classList.toggle(
      "dark",
      novoTema
    );

    localStorage.setItem(
      "visora-theme",
      novoTema ? "dark" : "light"
    );

    setDarkMode(novoTema);
  }

  
  

  useEffect(() => {
    let ativo = true;

    function atualizarUsuario() {
      const usuarioSalvo =
        sessionStorage.getItem("visora-usuario");

      if (usuarioSalvo) {
        try {
          const dados = JSON.parse(usuarioSalvo);

          if (ativo) {
            setUsuario(dados);
          }
        } catch (error) {
          console.error(
            "Erro ao ler usuário salvo:",
            error
          );
        }
      }
    }

    async function carregarPerfil() {
      try {
        const token =
          sessionStorage.getItem("visora-token");

        if (!token) {
          router.replace("/areapublica_pagina_login");
          return;
        }

        atualizarUsuario();

        const resultado =
          await buscarPerfilUsuario(token);

        if (!ativo) return;

        if (resultado?.usuario) {
          setUsuario(resultado.usuario);
          sessionStorage.setItem(
            "visora-usuario",
            JSON.stringify(resultado.usuario)
          );
        }
      } catch (error) {
        console.error(
          "Erro ao carregar perfil:",
          error
        );
      }
    }

    carregarPerfil();

    window.addEventListener(
      "visora-perfil-atualizado",
      atualizarUsuario
    );

    return () => {
      ativo = false;

      window.removeEventListener(
        "visora-perfil-atualizado",
        atualizarUsuario
      );
    };
  }, [router]);

  
  useEffect(() => {
    let ativo = true;

    async function carregarEmpresas() {
      const token = sessionStorage.getItem("visora-token");
      if (!token) return;

      setCarregandoEmpresas(true);
      setAvisoEmpresas("");

      try {
        const dados = await buscarEmpresasUsuario(token);
        if (!ativo) return;

        const lista = Array.isArray(dados?.empresas) ? dados.empresas : [];
        const normalizadas = lista
          .map((item) => ({
            id: Number(item.id),
            nome: item.razao_social || item.nome || "Empresa",
            perfil: item.perfil_acesso || "",
            status: item.status,
          }))
          .filter((item) => Number.isSafeInteger(item.id) && item.id > 0);

        setEmpresas(normalizadas);

        const salva = obterEmpresaAtivaId();
        const selecionada =
          normalizadas.find((item) => item.id === salva) ||
          normalizadas[0];

        if (selecionada) {
  setEmpresaAtiva(selecionada.id);

  if (salva !== selecionada.id) {
    definirEmpresaAtivaId(selecionada.id);
  }
} else {
          setEmpresaAtiva(null);
          limparEmpresaAtiva();
        }
      } catch (erro) {
        if (ativo) {
          console.error("Erro ao listar empresas:", erro);
          setAvisoEmpresas("Não foi possível carregar as empresas.");
        }
      } finally {
        if (ativo) setCarregandoEmpresas(false);
      }
    }

    carregarEmpresas();
    return () => { ativo = false; };
  }, []);

  function selecionarEmpresa(id) {
    if (empresaAtiva === id || !empresas.some((item) => item.id === id)) return;
    setEmpresaAtiva(id);
    definirEmpresaAtivaId(id);
    setMenuEmpresasAberto(false);
    window.location.reload();
  }

  
  function atualizarCampoEmpresa(campo, valor) {
    setFormEmpresa((atual) => ({ ...atual, [campo]: valor }));
  }

  async function abrirCadastroEmpresa() {
  setErroCadastroEmpresa("");
  setMenuEmpresasAberto(false);
  setModalEmpresaAberto(true);
  setLimiteEmpresas(null);
  setCarregandoLimite(true);

  try {
    const token = sessionStorage.getItem("visora-token");

    if (!token) {
      throw new Error("Sua sessão expirou. Faça login novamente.");
    }

    const empresaId = Number(
      obterEmpresaAtivaId() ?? empresaAtiva
    );

    if (!Number.isSafeInteger(empresaId) || empresaId <= 0) {
      throw new Error("Selecione uma empresa válida.");
    }

    const base = (
      process.env.NEXT_PUBLIC_API_URL ||
      "http://localhost:8080/api"
    ).replace(/\/+$/, "");

    const resposta = await fetch(`${base}/empresas/limite`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "X-Empresa-Id": String(empresaId),
      },
      cache: "no-store",
    });

    const dados = await resposta.json().catch(() => ({}));

    if (!resposta.ok) {
      console.error("ERRO AO CONSULTAR LIMITE:", {
        status: resposta.status,
        resposta: dados,
      });

      throw new Error(
        dados.mensagem ||
        dados.message ||
        dados.erro ||
        `Falha ao consultar plano (HTTP ${resposta.status}).`
      );
    }

    setLimiteEmpresas(dados);

  } catch (erro) {
    setErroCadastroEmpresa(
      erro.message || "Não foi possível consultar seu plano."
    );
  } finally {
    setCarregandoLimite(false);
  }
}

  async function cadastrarNovaEmpresa(evento) {
  evento.preventDefault();

  if (
    salvandoEmpresa ||
    carregandoLimite ||
    !limiteEmpresas?.podeAdicionar
  ) {
    return;
  }

  setErroCadastroEmpresa("");

  const token = sessionStorage.getItem("visora-token");

  if (!token) {
    setErroCadastroEmpresa(
      "Sua sessão expirou. Faça login novamente."
    );
    return;
  }

  setSalvandoEmpresa(true);

  try {
    const empresaId = Number(
      obterEmpresaAtivaId() ?? empresaAtiva
    );

    if (!Number.isSafeInteger(empresaId) || empresaId <= 0) {
      throw new Error("Selecione uma empresa válida.");
    }

    const base = (
      process.env.NEXT_PUBLIC_API_URL ||
      "http://localhost:8080/api"
    ).replace(/\/+$/, "");

    const resposta = await fetch(`${base}/empresas`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        "X-Empresa-Id": String(empresaId),
      },
      body: JSON.stringify(formEmpresa),
    });

    const dados = await resposta.json().catch(() => ({}));

    if (!resposta.ok) {
      console.error("ERRO POST /api/empresas:", {
        status: resposta.status,
        dados,
      });

      throw new Error(
        dados.mensagem ||
        dados.message ||
        dados.erro ||
        dados.error ||
        `Falha ao cadastrar empresa (HTTP ${resposta.status}).`
      );
    }

    const novaEmpresaId = Number(
      dados.empresa?.id ??
      dados.empresa_id ??
      dados.id
    );

    if (
      !Number.isSafeInteger(novaEmpresaId) ||
      novaEmpresaId <= 0
    ) {
      throw new Error(
        "Empresa cadastrada, mas o backend não retornou seu ID. Atualize a página para conferir."
      );
    }
    

    const resultado = await buscarEmpresasUsuario(token);

    const lista = (
      Array.isArray(resultado?.empresas)
        ? resultado.empresas
        : []
    )
      .map((item) => ({
        id: Number(item.id),
        nome: item.razao_social || item.nome || "Empresa",
        perfil: item.perfil_acesso || "",
        status: item.status,
      }))
      .filter(
        (item) =>
          Number.isSafeInteger(item.id) &&
          item.id > 0
      );

    setEmpresas(lista);

    if (!lista.some((item) => item.id === novaEmpresaId)) {
      throw new Error(
        "Empresa cadastrada, mas ainda não consta entre seus vínculos. Atualize a página para conferir."
      );
    }

    definirEmpresaAtivaId(novaEmpresaId);
    setEmpresaAtiva(novaEmpresaId);

    setModalEmpresaAberto(false);
    setMenuEmpresasAberto(false);

    window.location.reload();

  } catch (erro) {
    setErroCadastroEmpresa(
      erro.message || "Não foi possível cadastrar a empresa."
    );
  } finally {
    setSalvandoEmpresa(false);
  }
}
  

  function sairDaConta() {
    sessionStorage.removeItem("visora-token");
    sessionStorage.removeItem("visora-usuario");
    limparEmpresaAtiva();

    router.push("/areapublica_pagina_login");
  }


  function obterNomePerfil(tipo) {
    const perfis = {
      proprietario: "Proprietário",
      administrador: "Administrador",
      colaborador: "Colaborador",
    };

    return (
      perfis[String(tipo || "").toLowerCase()] ||
      "Usuário"
    );
  }

  const nomeUsuario =
    usuario?.nomeCompleto ||
    usuario?.nome_completo ||
    usuario?.nomeUsuario ||
    "Carregando...";

  const inicialUsuario =
    nomeUsuario.trim().charAt(0).toUpperCase();

  const perfilUsuario = obterNomePerfil(
    usuario?.tipo ||
    usuario?.perfilAcesso ||
    usuario?.perfil_acesso
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
      icon: UsersRound,
    },
  ];


  return (
    <>
      {abertoMobile && (
        <button
          type="button"
          aria-label="Fechar menu"
          onClick={alternarSidebar}
          className="fixed inset-0 z-40 bg-black/55 backdrop-blur-[2px] md:hidden"
        />
      )}
    <aside
      className={`
        fixed left-0 top-0 z-50
        flex h-screen flex-col
        overflow-hidden
        border-r border-[#DAD7CD]
        bg-[#F8F9F6] text-[#273B31]
        ${sidebarPronta ? "visible" : "invisible"}
        ${animarSidebar ? "transition-[width] duration-300 ease-in-out" : "transition-none"}
        dark:border-[#34483A]
        dark:bg-[#111A14]
        dark:text-[#E5EDE5]
        ${
          menuRecolhido
            ? "w-[70px] md:w-[82px]"
            : "w-[min(270px,calc(100vw-48px))] md:w-[270px]"
        }
      `}
    >
      {abertoMobile && (
        <button type="button" onClick={alternarSidebar} aria-label="Fechar menu" className="absolute right-2 top-2 z-10 rounded-lg bg-[#E8EDE5] p-2 text-[#344E41] dark:bg-[#273B31] dark:text-white md:hidden">
          <PanelLeftClose size={18} />
        </button>
      )}


      <div
        className={`
          flex h-[88px] shrink-0 items-center
          border-b border-[#DAD7CD]
          dark:border-[#34483A]
          ${
            menuRecolhido
              ? "justify-center"
              : "px-5"
          }
        `}
      >
        <Link
          href="/plataforma_pagina_inicial"
          className="flex items-center justify-center"
          aria-label="Visora - Página inicial"
        >
          {!menuRecolhido ? (
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
          ) : (
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

      <div
        className={`
          mx-2 mt-5 rounded-2xl
          border border-[#DAD7CD]
          bg-white/70 p-3
          dark:border-[#34483A]
          dark:bg-[#1C2920]
          ${
            menuRecolhido
              ? "flex justify-center p-2"
              : ""
          }
        `}
      >
        <div className="flex items-center gap-3">
          <div
            className="
              flex h-10 w-10 shrink-0
              items-center justify-center
              rounded-full bg-[#DCE7D7]
              font-bold text-[#344E41]
              dark:bg-[#344E41]
              dark:text-white
            "
          >
            <span>{inicialUsuario}</span>
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
      <div className="relative mx-2 mt-3 shrink-0">
        <button
          type="button"
          onClick={() => {
            if (menuRecolhido) {
              alternarSidebar();
              setMenuEmpresasAberto(true);
            } else {
              setMenuEmpresasAberto((valor) => !valor);
            }
          }}
          title={menuRecolhido ? "Selecionar empresa" : undefined}
          aria-expanded={menuEmpresasAberto}
          className={`flex w-full items-center gap-3 rounded-xl border border-[#DAD7CD] bg-[#E8EDE5] p-3 text-left transition hover:bg-[#DCE7D7] dark:border-[#34483A] dark:bg-[#1C2920] dark:hover:bg-[#273B31] ${menuRecolhido ? "justify-center" : ""}`}
        >
          <Building2 size={20} className="shrink-0 text-[#588157] dark:text-[#A3B18A]" />
          {!menuRecolhido && (
            <>
              <div className="min-w-0 flex-1">
                <p className="text-[10px] text-[#89958A]">Empresa selecionada</p>
                <p className="truncate text-xs font-semibold">
                  {empresas.find((item) => item.id === empresaAtiva)?.nome || "Nenhuma empresa"}
                </p>
              </div>
              {carregandoEmpresas ? <Loader2 size={16} className="animate-spin" /> : <ChevronDown size={16} />}
            </>
          )}
        </button>
        {menuEmpresasAberto && !menuRecolhido && (
          <div className="mt-2 max-h-56 overflow-y-auto rounded-xl border border-[#DAD7CD] bg-white p-1 shadow-lg dark:border-[#34483A] dark:bg-[#1C2920]">
            {empresas.map((empresa) => (
              <button
                type="button"
                key={empresa.id}
                onClick={() => selecionarEmpresa(empresa.id)}
                className={`w-full rounded-lg px-3 py-2 text-left text-xs transition hover:bg-[#E8EDE5] dark:hover:bg-[#273B31] ${empresaAtiva === empresa.id ? "bg-[#DCE7D7] font-semibold text-[#344E41] dark:bg-[#344E41] dark:text-white" : ""}`}
              >
                <span className="block truncate">{empresa.nome}</span>
                {empresa.perfil && <span className="text-[10px] opacity-70">{obterNomePerfil(empresa.perfil)}</span>}
              </button>
            ))}
            {!empresas.length && <p className="px-3 py-2 text-xs text-[#89958A]">Nenhuma empresa disponível.</p>}
            <div className="my-1 border-t border-[#DAD7CD] dark:border-[#34483A]" />
            <button
              type="button"
              onClick={abrirCadastroEmpresa}
              className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-xs font-semibold text-[#588157] hover:bg-[#E8EDE5] dark:text-[#A3B18A] dark:hover:bg-[#273B31]"
            >
              <Plus size={16} /> Adicionar empresa
            </button>
            {avisoEmpresas && <p role="status" className="px-3 pb-2 text-[11px] text-[#89958A]">{avisoEmpresas}</p>}
          </div>
        )}
      </div>


      {!menuRecolhido && (
        <p
          className="
            px-6 pb-2 pt-7
            text-[10px] font-semibold
            uppercase tracking-[1.8px]
            text-[#89958A]
          "
        >
          Menu principal
        </p>
      )}

      {/* ======================================
          NAVEGAÇÃO
      ====================================== */}

      <nav
        className="
          flex-1 space-y-1
          overflow-y-auto overflow-x-hidden
          px-2 md:px-3 pb-4 pt-5
        "
      >
        {menuItems.map((item) => {
          const selecionado =
            pathname === item.href;

          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              title={
                menuRecolhido
                  ? item.nome
                  : undefined
              }
              aria-current={
                selecionado
                  ? "page"
                  : undefined
              }
              className={`
                flex min-h-[46px] items-center
                gap-3 rounded-xl px-3
                text-[13px] font-medium
                transition-colors duration-200
                ${
                  menuRecolhido
                    ? "justify-center"
                    : ""
                }
                ${
                  selecionado
                    ? `
                      bg-[#344E41] text-white
                      shadow-sm
                      hover:bg-[#3A5A40]
                    `
                    : `
                      text-[#68776B]
                      hover:bg-[#E8EDE5]
                      dark:text-[#B1BEB2]
                      dark:hover:bg-[#1C2920]
                    `
                }
              `}
            >
              <Icon
                size={19}
                className="shrink-0"
              />

              {!menuRecolhido && (
                <span className="whitespace-nowrap">
                  {item.nome}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* ======================================
          RODAPÉ DA SIDEBAR
      ====================================== */}

      <div
        className="
          shrink-0 space-y-2
          border-t border-[#DAD7CD]
          p-2 md:p-3
          dark:border-[#34483A]
        "
      >
        {/* ALTERNAR TEMA */}

        <button
          type="button"
          onClick={alternarTema}
          title={
            menuRecolhido
              ? "Alternar tema"
              : undefined
          }
          className={`
            flex min-h-[46px] w-full
            items-center gap-3 rounded-xl
            px-3 text-[13px] font-medium
            text-[#68776B]
            transition-colors duration-200
            hover:bg-[#E8EDE5]
            dark:text-[#B1BEB2]
            dark:hover:bg-[#1C2920]
            ${
              menuRecolhido
                ? "justify-center"
                : ""
            }
          `}
        >
          {darkMode ? (
            <Sun size={19} className="shrink-0" />
          ) : (
            <Moon size={19} className="shrink-0" />
          )}

          {!menuRecolhido && (
            <>
              <span className="flex-1 text-left">
                {darkMode
                  ? "Modo claro"
                  : "Modo escuro"}
              </span>

              <span
                className={`
                  relative h-5 w-9
                  shrink-0 rounded-full
                  transition-colors duration-200
                  ${
                    darkMode
                      ? "bg-[#588157]"
                      : "bg-[#D0D8CD]"
                  }
                `}
              >
                <span
                  className={`
                    absolute top-0.5
                    h-4 w-4 rounded-full
                    bg-white shadow
                    transition-all duration-200
                    ${
                      darkMode
                        ? "left-[18px]"
                        : "left-0.5"
                    }
                  `}
                />
              </span>
            </>
          )}
        </button>

        {/* ====================================
            RECOLHER / EXPANDIR MENU
        ==================================== */}

        <button
          type="button"
          onClick={alternarSidebar}
          title={
            menuRecolhido
              ? "Expandir menu"
              : "Recolher menu"
          }
          aria-label={
            menuRecolhido
              ? "Expandir menu"
              : "Recolher menu"
          }
          aria-expanded={!menuRecolhido}
          className={`
            flex min-h-[42px] w-full
            items-center gap-3 rounded-xl
            px-3 text-xs text-[#89958A]
            transition-colors duration-200
            hover:bg-[#E8EDE5]
            dark:text-[#AAB8AC]
            dark:hover:bg-[#1C2920]
            ${
              menuRecolhido
                ? "justify-center"
                : ""
            }
          `}
        >
          {menuRecolhido ? (
            <PanelLeftOpen
              size={18}
              className="shrink-0"
            />
          ) : (
            <PanelLeftClose
              size={18}
              className="shrink-0"
            />
          )}

          {!menuRecolhido && (
            <span className="whitespace-nowrap">
              Recolher menu
            </span>
          )}
        </button>

        {/* ====================================
            SAIR DA CONTA
        ==================================== */}

        <button
          type="button"
          onClick={sairDaConta}
          title={
            menuRecolhido
              ? "Sair da conta"
              : undefined
          }
          className={`
            flex min-h-[46px] w-full
            items-center gap-3 rounded-xl
            px-3 text-[13px] font-medium
            text-[#A14E4E]
            transition-colors duration-200
            hover:bg-[#F7E9E7]
            dark:text-[#E6A09A]
            dark:hover:bg-[#382321]
            ${
              menuRecolhido
                ? "justify-center"
                : ""
            }
          `}
        >
          <LogOut
            size={19}
            className="shrink-0"
          />

          {!menuRecolhido && (
            <span className="whitespace-nowrap">
              Sair da conta
            </span>
          )}
        </button>

        {/* ====================================
            COPYRIGHT
        ==================================== */}

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

    {modalEmpresaAberto && (
      <div
        className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
        onMouseDown={(e) => {
          if (e.target === e.currentTarget && !salvandoEmpresa) setModalEmpresaAberto(false);
        }}
      >
        <section
          role="dialog"
          aria-modal="true"
          aria-labelledby="titulo-nova-empresa"
          className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-[#DAD7CD] bg-[#F8F9F6] p-5 shadow-2xl dark:border-[#34483A] dark:bg-[#111A14] sm:p-7"
        >
          <div className="mb-6 flex items-start justify-between gap-4">
            <div>
              <div className="mb-2 flex items-center gap-2 text-[#588157] dark:text-[#A3B18A]">
                <Building2 size={20} />
                <span className="text-xs font-semibold uppercase tracking-widest">Visora</span>
              </div>
              <h2 id="titulo-nova-empresa" className="text-xl font-bold text-[#273B31] dark:text-[#E5EDE5]">
                Adicionar empresa
              </h2>
              <p className="mt-1 text-sm text-[#68776B] dark:text-[#B1BEB2]">
                Cadastre uma nova empresa vinculada à sua assinatura atual.
              </p>
            </div>
            <button type="button" disabled={salvandoEmpresa} onClick={() => setModalEmpresaAberto(false)} aria-label="Fechar cadastro" className="rounded-lg p-2 hover:bg-[#E8EDE5] dark:hover:bg-[#273B31]">
              <X size={20} />
            </button>
          </div>

          {carregandoLimite ? (
            <p className="mb-5 flex items-center gap-2 text-sm text-[#68776B] dark:text-[#B1BEB2]">
              <Loader2 size={17} className="animate-spin" /> Consultando seu plano...
            </p>
          ) : limiteEmpresas && (
            <div className="mb-5 rounded-xl border border-[#DAD7CD] bg-[#E8EDE5] p-4 text-sm text-[#273B31] dark:border-[#34483A] dark:bg-[#1C2920] dark:text-[#E5EDE5]">
              <p className="font-semibold">Plano {limiteEmpresas.plano}</p>
              <p className="mt-1">Empresas cadastradas: {limiteEmpresas.utilizadas} de {limiteEmpresas.limite}</p>
              <p className="mt-1">Vagas disponíveis: {limiteEmpresas.disponiveis}</p>
              {!limiteEmpresas.podeAdicionar && (
                <p className="mt-2 font-medium text-[#A14E4E] dark:text-[#E6A09A]">O limite de empresas do seu plano foi atingido.</p>
              )}
            </div>
          )}

          <form onSubmit={cadastrarNovaEmpresa} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              {[
                { campo: "nomeEmpresa", titulo: "Nome da empresa", span: true, max: 255 },
                { campo: "emailEmpresa", titulo: "E-mail da empresa", type: "email", max: 255 },
                { campo: "telefoneEmpresa", titulo: "Telefone da empresa", type: "tel", max: 20 },
                { campo: "documento", titulo: formEmpresa.tipoDocumento, max: 18 },
              ].map((item) => (
                <label key={item.campo} className={`block text-xs font-semibold text-[#273B31] dark:text-[#E5EDE5] ${item.span ? "sm:col-span-2" : ""}`}>
                  {item.titulo}
                  <input
                    required
                    type={item.type || "text"}
                    maxLength={item.max}
                    value={formEmpresa[item.campo]}
                    onChange={(e) => atualizarCampoEmpresa(item.campo, e.target.value)}
                    className="mt-1.5 w-full rounded-xl border border-[#DAD7CD] bg-white px-3 py-2.5 text-sm text-[#273B31] outline-none transition focus:border-[#588157] focus:ring-2 focus:ring-[#588157]/20 dark:border-[#34483A] dark:bg-[#1C2920] dark:text-white"
                  />
                </label>
              ))}
              {[
                { campo: "tipoDocumento", titulo: "Tipo de documento", opcoes: ["CNPJ", "CPF"] },
                { campo: "areaAtuacao", titulo: "Área de atuação", opcoes: ["Comércio", "Serviços", "Indústria", "Tecnologia", "Varejo", "Saúde", "Outros"] },
              ].map((item) => (
                <label key={item.campo} className="block text-xs font-semibold text-[#273B31] dark:text-[#E5EDE5]">
                  {item.titulo}
                  <select
                    value={formEmpresa[item.campo]}
                    onChange={(e) => atualizarCampoEmpresa(item.campo, e.target.value)}
                    className="mt-1.5 w-full rounded-xl border border-[#DAD7CD] bg-white px-3 py-2.5 text-sm text-[#273B31] outline-none focus:border-[#588157] dark:border-[#34483A] dark:bg-[#1C2920] dark:text-white"
                  >
                    {item.opcoes.map((opcao) => <option key={opcao} value={opcao}>{opcao}</option>)}
                  </select>
                </label>
              ))}
            </div>

            {erroCadastroEmpresa && (
              <p role="alert" className="rounded-xl border border-red-300 bg-red-50 p-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300">
                {erroCadastroEmpresa}
              </p>
            )}
            <div className="flex flex-wrap justify-end gap-3 border-t border-[#DAD7CD] pt-5 dark:border-[#34483A]">
              <button type="button" disabled={salvandoEmpresa} onClick={() => setModalEmpresaAberto(false)} className="rounded-xl border border-[#DAD7CD] px-5 py-2.5 text-sm font-semibold hover:bg-[#E8EDE5] disabled:opacity-50 dark:border-[#34483A] dark:hover:bg-[#273B31]">
                Cancelar
              </button>
              <button
                type="submit"
                disabled={salvandoEmpresa || carregandoLimite || !limiteEmpresas?.podeAdicionar}
                className="flex items-center gap-2 rounded-xl bg-[#588157] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#3A5A40] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {salvandoEmpresa ? <Loader2 size={17} className="animate-spin" /> : <CheckCircle2 size={17} />}
                {salvandoEmpresa ? "Cadastrando..." : "Cadastrar empresa"}
              </button>
            </div>
          </form>
        </section>
      </div>
    )}
    </>
  );
}

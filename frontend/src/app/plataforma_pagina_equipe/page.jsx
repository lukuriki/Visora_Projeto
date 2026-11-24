
"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import {
  UsersRound,
  UserRoundCheck,
  UserRoundX,
  Mail,
  Plus,
  Search,
  Trash2,
  X,
  Send,
  Loader2,
  ShieldCheck,
  Clock3,
  AlertCircle,
  CheckCircle2,
  RefreshCw,
  UserRound,
  Eye,
  History,
} from "lucide-react";

import SidebarPlataforma from "@/components/SidebarPlataforma";
import FooterPlataforma from "@/components/FooterPlataforma";

import {
  buscarEquipe,
  buscarMembrosEquipe,
  convidarColaborador,
  cancelarConviteEquipe,
  removerColaboradorEquipe,
} from "@/lib/api";



const API_URL = (
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:8080/api"
).replace(/\/+$/, "");

const CARD =
  "rounded-2xl border border-[#DAD7CD] bg-white dark:border-[#34483A] dark:bg-[#1B281E]";

const TEXTO_SECUNDARIO =
  "text-[#738075] dark:text-[#A3B18A]";



function formatarData(data) {
  if (!data) return "—";

  const valor = new Date(data);

  return Number.isNaN(valor.getTime())
    ? "—"
    : valor.toLocaleDateString("pt-BR");
}

function formatarDataHora(data) {
  if (!data) return "—";

  const valor = new Date(data);

  if (Number.isNaN(valor.getTime())) {
    return "—";
  }

  return valor.toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatarPerfil(perfil) {
  const perfis = {
    proprietario: "Proprietário",
    administrador: "Administrador",
    colaborador: "Colaborador",
  };

  return perfis[perfil] || perfil || "—";
}

function obterStatus(usuario) {
  if (usuario.status_conta === "pendente") {
    return "pendente";
  }

  if (usuario.status_conta !== "ativo") {
    return "inativo";
  }

  if (usuario.status_vinculo === "inativo") {
    return "inativo";
  }

  return "ativo";
}



const CONFIGURACAO_MODAL = {
  inativar: {
    titulo: "Inativar colaborador?",
    descricao:
      "O colaborador perderá o acesso à empresa, mas continuará cadastrado na equipe. Você poderá reativá-lo posteriormente.",
    botao: "Inativar colaborador",
    Icone: UserRoundX,
    corIcone:
      "bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400",
    corBotao:
      "bg-amber-600 text-white hover:bg-amber-700",
  },

  reativar: {
    titulo: "Reativar colaborador?",
    descricao:
      "O colaborador voltará a ter acesso à empresa com as permissões do seu perfil.",
    botao: "Reativar colaborador",
    Icone: UserRoundCheck,
    corIcone:
      "bg-[#EAF0E6] text-[#588157] dark:bg-[#273B31] dark:text-[#A3B18A]",
    corBotao:
      "bg-[#3A5A40] text-white hover:bg-[#273B31]",
  },

  excluir: {
    titulo: "Excluir colaborador?",
    descricao:
      "O colaborador será removido da equipe e perderá seu vínculo com a empresa. Para adicioná-lo novamente, será necessário enviar um novo convite.",
    botao: "Excluir da equipe",
    Icone: Trash2,
    corIcone:
      "bg-red-50 text-red-600 dark:bg-red-950/40 dark:text-red-400",
    corBotao:
      "bg-red-600 text-white hover:bg-red-700",
  },
};



function ModalAcaoColaborador({
  tipo,
  usuario,
  processando,
  erro,
  onFechar,
  onConfirmar,
}) {
  const config = CONFIGURACAO_MODAL[tipo];

  useEffect(() => {
    if (!config) return;

    function aoPressionarTecla(evento) {
      if (
        evento.key === "Escape" &&
        !processando
      ) {
        onFechar();
      }
    }

    document.addEventListener(
      "keydown",
      aoPressionarTecla
    );

    return () => {
      document.removeEventListener(
        "keydown",
        aoPressionarTecla
      );
    };
  }, [config, processando, onFechar]);

  if (!config || !usuario) return null;

  const Icone = config.Icone;

  return (
    <div
      className="fixed inset-0 z-[110] flex items-center justify-center bg-[#111A14]/65 px-4 py-6 backdrop-blur-[5px] animate-in fade-in duration-200"
      onMouseDown={(evento) => {
        if (
          evento.target === evento.currentTarget &&
          !processando
        ) {
          onFechar();
        }
      }}
    >
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="titulo-modal-acao"
        aria-describedby="descricao-modal-acao"
        className="max-h-[calc(100dvh-3rem)] w-full max-w-[440px] overflow-y-auto rounded-[24px] border border-[#DAD7CD] bg-white p-6 shadow-2xl animate-in zoom-in-95 duration-200 sm:p-8 dark:border-[#34483A] dark:bg-[#1B281E]"
      >
        {/* ÍCONE E FECHAR */}

        <div className="mb-6 flex items-start justify-between">
          <div
            className={`flex h-14 w-14 items-center justify-center rounded-2xl ${config.corIcone}`}
          >
            <Icone
              size={27}
              strokeWidth={1.8}
            />
          </div>

          <button
            type="button"
            onClick={onFechar}
            disabled={processando}
            aria-label="Fechar janela"
            className="rounded-xl p-2 text-[#738075] transition hover:bg-[#F0F3ED] disabled:opacity-40 dark:text-[#A3B18A] dark:hover:bg-[#273B31]"
          >
            <X size={20} />
          </button>
        </div>

        {/* TÍTULO */}

        <h2
          id="titulo-modal-acao"
          className="text-[22px] font-semibold tracking-tight text-[#273B31] dark:text-[#E5EDE5]"
        >
          {config.titulo}
        </h2>

        {/* DESCRIÇÃO */}

        <p
          id="descricao-modal-acao"
          className="mt-3 text-sm leading-6 text-[#738075] dark:text-[#A3B18A]"
        >
          {config.descricao}
        </p>

        {/* DADOS DO COLABORADOR */}

        <div className="mt-6 flex items-center gap-3 rounded-2xl border border-[#E5E7E1] bg-[#F8F9F6] p-4 dark:border-[#34483A] dark:bg-[#111A14]">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#EAF0E6] dark:bg-[#273B31]">
            <UserRound
              size={20}
              className="text-[#588157] dark:text-[#A3B18A]"
            />
          </div>

          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-[#273B31] dark:text-[#E5EDE5]">
              {usuario.nome_completo}
            </p>

            <p className="mt-1 truncate text-xs text-[#738075] dark:text-[#A3B18A]">
              {usuario.email}
            </p>
          </div>
        </div>

        {/* ALERTA DE EXCLUSÃO */}

        {tipo === "excluir" && (
          <div className="mt-4 flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 p-3.5 text-xs leading-5 text-red-700 dark:border-red-900/60 dark:bg-red-950/20 dark:text-red-300">
            <AlertCircle
              size={17}
              className="mt-0.5 shrink-0"
            />

            <span>
              Esta ação remove o vínculo com a
              empresa. Não será possível reativar
              diretamente o colaborador após a exclusão.
            </span>
          </div>
        )}

        {/* ERRO DA OPERAÇÃO */}

        {erro && (
          <div
            role="alert"
            className="mt-4 flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-xs leading-5 text-red-700 dark:border-red-900 dark:bg-red-950/30 dark:text-red-300"
          >
            <AlertCircle
              size={17}
              className="shrink-0"
            />

            <span>{erro}</span>
          </div>
        )}

        {/* BOTÕES */}

        <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row">
          <button
            type="button"
            onClick={onFechar}
            disabled={processando}
            className="flex flex-1 items-center justify-center rounded-xl border border-[#DAD7CD] px-4 py-3 text-sm font-medium text-[#273B31] transition hover:bg-[#F0F3ED] disabled:opacity-50 dark:border-[#34483A] dark:text-[#E5EDE5] dark:hover:bg-[#273B31]"
          >
            Cancelar
          </button>

          <button
            type="button"
            onClick={onConfirmar}
            disabled={processando}
            className={`flex flex-1 items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-60 ${config.corBotao}`}
          >
            {processando ? (
              <>
                <Loader2
                  size={17}
                  className="animate-spin"
                />
                Processando...
              </>
            ) : (
              <>
                <Icone size={17} />
                {config.botao}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}



export default function PaginaEquipe() {
  const router = useRouter();



  const [collapsed, setCollapsed] = useState(true);

  const [carregando, setCarregando] = useState(true);
  const [atualizando, setAtualizando] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [processandoId, setProcessandoId] =
    useState(null);

  const [empresa, setEmpresa] = useState(null);
  const [perfil, setPerfil] = useState("");

  const [colaboradores, setColaboradores] =
    useState([]);

  const [convites, setConvites] = useState([]);

  const [ultimaAtividade, setUltimaAtividade] =
    useState(null);

  const [busca, setBusca] = useState("");

  const [modalConvite, setModalConvite] =
    useState(false);

  const [emailConvite, setEmailConvite] =
    useState("");

  const [modalAcao, setModalAcao] =
    useState(null);

  const [
    colaboradorSelecionado,
    setColaboradorSelecionado,
  ] = useState(null);

  const [erroModal, setErroModal] = useState("");

  const [mensagem, setMensagem] = useState("");
  const [tipoMensagem, setTipoMensagem] =
    useState("sucesso");

  const [acessoNegado, setAcessoNegado] =
    useState(false);

  const ehProprietario =
    perfil === "proprietario";

  

  useEffect(() => {
    function sincronizarSidebar() {
      const salvo = localStorage.getItem(
        "visora-sidebar-recolhida"
      );

      if (salvo !== null) {
        setCollapsed(salvo === "true");
      }
    }

    sincronizarSidebar();

    window.addEventListener(
      "storage",
      sincronizarSidebar
    );

    return () => {
      window.removeEventListener(
        "storage",
        sincronizarSidebar
      );
    };
  }, []);

  function atualizarSidebar(valor) {
    setCollapsed((anterior) => {
      const proximo =
        typeof valor === "function"
          ? valor(anterior)
          : valor;

      localStorage.setItem(
        "visora-sidebar-recolhida",
        String(proximo)
      );

      return proximo;
    });
  }


  const mostrarMensagem = useCallback(
    (texto, tipo = "sucesso") => {
      setMensagem(texto);
      setTipoMensagem(tipo);
    },
    []
  );


  const carregarEquipe = useCallback(
    async (atualizacao = false) => {
      const token = sessionStorage.getItem(
        "visora-token"
      );

      if (!token) {
        router.replace(
          "/areapublica_pagina_login"
        );
        return;
      }

      try {
        if (atualizacao) {
          setAtualizando(true);
        } else {
          setCarregando(true);
        }

        setAcessoNegado(false);

        const dadosMembros =
          await buscarMembrosEquipe(token);

        const perfilUsuario =
          dadosMembros.perfil_acesso;

        if (
          perfilUsuario !== "proprietario" &&
          perfilUsuario !== "colaborador"
        ) {
          setAcessoNegado(true);
          return;
        }

        setPerfil(perfilUsuario);

        setEmpresa(
          dadosMembros.empresa || null
        );

        setColaboradores(
          dadosMembros.colaboradores || []
        );

        setUltimaAtividade(
          dadosMembros.ultimaAtividade || null
        );

        if (perfilUsuario === "proprietario") {
          const dadosEquipe =
            await buscarEquipe(token);

          setConvites(
            dadosEquipe.convites || []
          );
        } else {
          setConvites([]);
          setModalConvite(false);
        }
      } catch (erro) {
        const texto =
          erro.message ||
          "Erro ao carregar equipe.";

        if (
          /acesso|403|401|não autorizado|permissão/i.test(
            texto
          )
        ) {
          setAcessoNegado(true);
        } else {
          mostrarMensagem(texto, "erro");
        }
      } finally {
        setCarregando(false);
        setAtualizando(false);
      }
    },
    [router, mostrarMensagem]
  );

  useEffect(() => {
    carregarEquipe();
  }, [carregarEquipe]);

  

  function abrirModalAcao(tipo, usuario) {
    if (
      !ehProprietario ||
      processandoId ||
      !CONFIGURACAO_MODAL[tipo]
    ) {
      return;
    }

    setColaboradorSelecionado(usuario);
    setModalAcao(tipo);
    setErroModal("");
  }

  

  const fecharModalAcao = useCallback(() => {
    if (processandoId) return;

    setModalAcao(null);
    setColaboradorSelecionado(null);
    setErroModal("");
  }, [processandoId]);

  

  async function enviarConvite(evento) {
    evento.preventDefault();

    if (!ehProprietario || enviando) {
      return;
    }

    const email = emailConvite.trim();

    if (!email) {
      mostrarMensagem(
        "Informe o e-mail do colaborador.",
        "erro"
      );
      return;
    }

    try {
      setEnviando(true);

      const token = sessionStorage.getItem(
        "visora-token"
      );

      const resultado =
        await convidarColaborador(
          email,
          token
        );

      setModalConvite(false);
      setEmailConvite("");

      mostrarMensagem(
        resultado.mensagem ||
          "Convite enviado com sucesso."
      );

      await carregarEquipe(true);
    } catch (erro) {
      mostrarMensagem(
        erro.message ||
          "Erro ao enviar convite.",
        "erro"
      );
    } finally {
      setEnviando(false);
    }
  }

  

  async function cancelarConvite(id) {
    if (
      !ehProprietario ||
      processandoId
    ) {
      return;
    }

    const confirmou = window.confirm(
      "Deseja cancelar este convite?"
    );

    if (!confirmou) return;

    try {
      setProcessandoId(`convite-${id}`);

      const token = sessionStorage.getItem(
        "visora-token"
      );

      await cancelarConviteEquipe(
        id,
        token
      );

      mostrarMensagem(
        "Convite cancelado com sucesso."
      );

      await carregarEquipe(true);
    } catch (erro) {
      mostrarMensagem(
        erro.message ||
          "Erro ao cancelar convite.",
        "erro"
      );
    } finally {
      setProcessandoId(null);
    }
  }


  async function alternarStatusColaborador(
    usuario,
    novoStatus
  ) {
    if (
      !ehProprietario ||
      processandoId
    ) {
      return;
    }

    try {
      setErroModal("");
      setProcessandoId(
        `status-${usuario.id}`
      );

      const token = sessionStorage.getItem(
        "visora-token"
      );

      if (!token) {
        throw new Error(
          "Sua sessão expirou. Faça login novamente."
        );
      }

      const resposta = await fetch(
        `${API_URL}/equipe/colaboradores/${usuario.id}/status`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            status: novoStatus,
          }),
        }
      );

      const resultado = await resposta
        .json()
        .catch(() => ({}));

      if (!resposta.ok) {
        throw new Error(
          resultado.mensagem ||
            "Não foi possível alterar o status."
        );
      }

      setModalAcao(null);
      setColaboradorSelecionado(null);

      mostrarMensagem(
        resultado.mensagem ||
          `Colaborador ${
            novoStatus === "ativo"
              ? "reativado"
              : "inativado"
          } com sucesso.`
      );

      await carregarEquipe(true);
    } catch (erro) {
      setErroModal(
        erro.message ||
          "Erro ao alterar o status."
      );
    } finally {
      setProcessandoId(null);
    }
  }

  async function removerColaborador(usuario) {
    if (
      !ehProprietario ||
      processandoId
    ) {
      return;
    }

    try {
      setErroModal("");
      setProcessandoId(
        `usuario-${usuario.id}`
      );

      const token = sessionStorage.getItem(
        "visora-token"
      );

      if (!token) {
        throw new Error(
          "Sua sessão expirou. Faça login novamente."
        );
      }

      await removerColaboradorEquipe(
        usuario.id,
        token
      );

      setModalAcao(null);
      setColaboradorSelecionado(null);

      mostrarMensagem(
        "Colaborador excluído da equipe com sucesso."
      );

      await carregarEquipe(true);
    } catch (erro) {
      setErroModal(
        erro.message ||
          "Erro ao excluir colaborador."
      );
    } finally {
      setProcessandoId(null);
    }
  }

  
  

  async function confirmarAcaoColaborador() {
    if (
      !colaboradorSelecionado ||
      !modalAcao ||
      processandoId
    ) {
      return;
    }

    if (modalAcao === "excluir") {
      await removerColaborador(
        colaboradorSelecionado
      );
      return;
    }

    if (modalAcao === "inativar") {
      await alternarStatusColaborador(
        colaboradorSelecionado,
        "inativo"
      );
      return;
    }

    if (modalAcao === "reativar") {
      await alternarStatusColaborador(
        colaboradorSelecionado,
        "ativo"
      );
    }
  }

  
  const colaboradoresFiltrados =
    colaboradores.filter((usuario) => {
      const pesquisa = busca
        .trim()
        .toLowerCase();

      return (
        usuario.nome_completo
          ?.toLowerCase()
          .includes(pesquisa) ||
        usuario.email
          ?.toLowerCase()
          .includes(pesquisa) ||
        usuario.nome_usuario
          ?.toLowerCase()
          .includes(pesquisa)
      );
    });


  const totalMembros =
    colaboradores.length;

  const totalColaboradores =
    colaboradores.filter(
      (usuario) =>
        usuario.perfil_acesso ===
        "colaborador"
    ).length;

  const colaboradoresAtivos =
    colaboradores.filter(
      (usuario) =>
        usuario.perfil_acesso ===
          "colaborador" &&
        obterStatus(usuario) === "ativo"
    ).length;

  const membrosAtivos =
    colaboradores.filter(
      (usuario) =>
        obterStatus(usuario) === "ativo"
    ).length;

  const indicadores = ehProprietario
    ? [
        {
          titulo: "Colaboradores",
          valor: totalColaboradores,
          icone: UsersRound,
        },
        {
          titulo: "Colaboradores ativos",
          valor: colaboradoresAtivos,
          icone: UserRoundCheck,
        },
        {
          titulo: "Convites pendentes",
          valor: convites.length,
          icone: Mail,
        },
      ]
    : [
        {
          titulo: "Membros da equipe",
          valor: totalMembros,
          icone: UsersRound,
        },
        {
          titulo: "Membros ativos",
          valor: membrosAtivos,
          icone: UserRoundCheck,
        },
        {
          titulo: "Última atividade na equipe",
          valor:
            ultimaAtividade?.responsavel ||
            "Nenhuma atividade",
          descricao:
            ultimaAtividade?.descricao ||
            "Ainda não há alterações registradas.",
          data:
            ultimaAtividade?.criado_em ||
            null,
          icone: History,
        },
      ];



  if (carregando) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F8F9F6] dark:bg-[#111A14]">
        <Loader2 className="h-9 w-9 animate-spin text-[#588157]" />
      </div>
    );
  }

  

  if (acessoNegado) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-5 bg-[#F8F9F6] px-6 text-center dark:bg-[#111A14]">
        <ShieldCheck className="h-14 w-14 text-[#588157]" />

        <h1 className="text-2xl font-semibold text-[#273B31] dark:text-white">
          Acesso restrito
        </h1>

        <p className="max-w-md text-[#738075] dark:text-[#A3B18A]">
          Você não possui permissão para
          visualizar esta equipe.
        </p>

        <button
          type="button"
          onClick={() =>
            router.push(
              "/plataforma_pagina_inicial"
            )
          }
          className="rounded-xl bg-[#3A5A40] px-6 py-3 text-white transition hover:bg-[#273B31]"
        >
          Voltar para a plataforma
        </button>
      </div>
    );
  }


  return (
    <div className="min-h-screen bg-[#F8F9F6] text-[#273B31] dark:bg-[#111A14] dark:text-[#E5EDE5]">

      {/* SIDEBAR */}

      <SidebarPlataforma
        collapsed={collapsed}
        setCollapsed={atualizarSidebar}
      />

      <div
        className={`ml-[82px] min-h-screen min-w-0 overflow-x-clip transition-[margin-left] duration-300 ease-in-out ${
          collapsed
            ? "lg:ml-[82px]"
            : "lg:ml-[270px]"
        }`}
      >
        <main className="@container mx-auto w-full min-w-0 max-w-7xl px-3 py-6 sm:px-5 lg:px-10 lg:py-10">

          {/* ==================================
              CABEÇALHO
          ================================== */}

          <div className="mb-10 flex min-w-0 flex-col justify-between gap-5 @min-[680px]:flex-row @min-[680px]:items-center">

            <div>
              <div className="mb-3 flex items-center gap-2 text-sm text-[#588157]">
                <UsersRound size={17} />
                Equipe
              </div>

              <h1 className="text-3xl font-semibold tracking-tight">
                {ehProprietario
                  ? "Sua equipe"
                  : "Membros da equipe"}
              </h1>

              <p className={`mt-2 text-sm ${TEXTO_SECUNDARIO}`}>
                {ehProprietario
                  ? "Gerencie os colaboradores e os acessos da sua empresa."
                  : "Conheça os membros que fazem parte da sua empresa."}
              </p>

              {empresa && (
                <p className="mt-2 text-sm font-medium text-[#3A5A40] dark:text-[#A3B18A]">
                  {empresa.razao_social}
                </p>
              )}
            </div>

            {ehProprietario ? (
              <button
                type="button"
                onClick={() => {
                  setMensagem("");
                  setModalConvite(true);
                }}
                className="flex items-center justify-center gap-2 rounded-xl bg-[#3A5A40] px-5 py-3 text-sm font-medium text-white transition hover:bg-[#273B31]"
              >
                <Plus size={18} />
                Convidar colaborador
              </button>
            ) : (
              <div className="flex items-center gap-2 rounded-xl border border-[#DAD7CD] bg-white px-4 py-3 text-sm text-[#588157] dark:border-[#34483A] dark:bg-[#1B281E] dark:text-[#A3B18A]">
                <Eye size={18} />
                Somente visualização
              </div>
            )}
          </div>

          {/* ==================================
              MENSAGENS
          ================================== */}

          {mensagem && (
            <div
              role="alert"
              className={`mb-7 flex items-center justify-between gap-4 rounded-xl border px-4 py-3 text-sm ${
                tipoMensagem === "erro"
                  ? "border-red-200 bg-red-50 text-red-700 dark:border-red-900 dark:bg-red-950/30 dark:text-red-300"
                  : "border-[#A3B18A] bg-[#EDF3E8] text-[#3A5A40] dark:border-[#34483A] dark:bg-[#203326] dark:text-[#C6D9C2]"
              }`}
            >
              <div className="flex items-center gap-2">
                {tipoMensagem === "erro" ? (
                  <AlertCircle
                    size={18}
                    className="shrink-0"
                  />
                ) : (
                  <CheckCircle2
                    size={18}
                    className="shrink-0"
                  />
                )}

                <span>{mensagem}</span>
              </div>

              <button
                type="button"
                onClick={() =>
                  setMensagem("")
                }
                aria-label="Fechar mensagem"
              >
                <X size={17} />
              </button>
            </div>
          )}

          {/* ==================================
              INDICADORES
          ================================== */}

          <div className="mb-9 grid min-w-0 grid-cols-1 gap-4 @min-[500px]:grid-cols-2 @min-[900px]:grid-cols-3">

            {indicadores.map((item) => {
              const Icone = item.icone;

              return (
                <div
                  key={item.titulo}
                  className={`${CARD} p-6`}
                >
                  <div className="flex items-center justify-between gap-3">

                    <p className={`text-sm ${TEXTO_SECUNDARIO}`}>
                      {item.titulo}
                    </p>

                    <div className="rounded-xl bg-[#EAF0E6] p-3 dark:bg-[#273B31]">
                      <Icone
                        size={20}
                        className="text-[#588157] dark:text-[#A3B18A]"
                      />
                    </div>
                  </div>

                  <p
                    className={
                      item.descricao
                        ? "mt-5 break-words text-lg font-semibold"
                        : "mt-5 text-4xl font-semibold"
                    }
                  >
                    {item.valor}
                  </p>

                  {item.descricao && (
                    <>
                      <p className={`mt-2 break-words text-sm ${TEXTO_SECUNDARIO}`}>
                        {item.descricao}
                      </p>

                      {item.data && (
                        <p className={`mt-3 flex items-center gap-1.5 text-xs ${TEXTO_SECUNDARIO}`}>
                          <Clock3 size={13} />
                          {formatarDataHora(
                            item.data
                          )}
                        </p>
                      )}
                    </>
                  )}
                </div>
              );
            })}
          </div>

          {/* ==================================
              MEMBROS DA EQUIPE
          ================================== */}

          <section className={`${CARD} mb-9 overflow-hidden`}>

            <div className="flex min-w-0 flex-col justify-between gap-5 border-b border-[#E5E7E1] p-4 @min-[700px]:flex-row @min-[700px]:items-center @min-[700px]:p-6 dark:border-[#34483A]">

              <div>
                <h2 className="text-lg font-semibold">
                  Membros da equipe
                </h2>

                <p className={`mt-1 text-sm ${TEXTO_SECUNDARIO}`}>
                  Visualize os membros e seus acessos à empresa.
                </p>
              </div>

              <div className="flex min-w-0 items-center gap-3">

                {/* BUSCA */}

                <div className="flex min-w-0 flex-1 items-center gap-2 rounded-xl border border-[#DAD7CD] px-3 py-2 @min-[700px]:flex-none dark:border-[#34483A]">
                  <Search
                    size={17}
                    className="shrink-0 text-[#738075]"
                  />

                  <input
                    type="text"
                    placeholder="Buscar membro..."
                    value={busca}
                    onChange={(evento) =>
                      setBusca(
                        evento.target.value
                      )
                    }
                    className="w-full min-w-0 bg-transparent text-sm outline-none placeholder:text-[#9CA69C] @min-[700px]:w-48"
                  />
                </div>

                {/* ATUALIZAR */}

                <button
                  type="button"
                  onClick={() =>
                    carregarEquipe(true)
                  }
                  disabled={
                    atualizando ||
                    !!processandoId
                  }
                  title="Atualizar equipe"
                  aria-label="Atualizar equipe"
                  className="rounded-xl border border-[#DAD7CD] p-2.5 transition hover:bg-[#F0F3ED] disabled:opacity-50 dark:border-[#34483A] dark:hover:bg-[#273B31]"
                >
                  <RefreshCw
                    size={18}
                    className={
                      atualizando
                        ? "animate-spin"
                        : ""
                    }
                  />
                </button>
              </div>
            </div>

            {/* TABELA */}

            <div className="overflow-x-auto">
              <table className="w-full min-w-[780px] text-left text-sm">

                <thead className="bg-[#F8F9F6] text-[#738075] dark:bg-[#202E23] dark:text-[#A3B18A]">
                  <tr>
                    <th className="px-6 py-4 font-medium">
                      Membro
                    </th>

                    <th className="px-6 py-4 font-medium">
                      Perfil
                    </th>

                    <th className="px-6 py-4 font-medium">
                      Status
                    </th>

                    <th className="px-6 py-4 font-medium">
                      Entrada
                    </th>

                    {ehProprietario && (
                      <th className="px-6 py-4 text-right font-medium">
                        Ações
                      </th>
                    )}
                  </tr>
                </thead>

                <tbody className="divide-y divide-[#E5E7E1] dark:divide-[#34483A]">

                  {colaboradoresFiltrados.map(
                    (usuario) => {
                      const status =
                        obterStatus(usuario);

                      const vinculoInativo =
                        usuario.status_vinculo ===
                        "inativo";

                      const contaAtiva =
                        usuario.status_conta ===
                        "ativo";

                      const podeAlterar =
                        usuario.perfil_acesso ===
                        "colaborador";

                      return (
                        <tr
                          key={usuario.id}
                          className="transition hover:bg-[#F8F9F6] dark:hover:bg-[#202E23]"
                        >

                          {/* MEMBRO */}

                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">

                              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#EAF0E6] dark:bg-[#273B31]">
                                <UserRound
                                  size={19}
                                  className="text-[#588157] dark:text-[#A3B18A]"
                                />
                              </div>

                              <div className="min-w-0">
                                <p className="font-medium">
                                  {usuario.nome_completo}
                                </p>

                                <p className={`mt-1 break-all text-xs ${TEXTO_SECUNDARIO}`}>
                                  {usuario.email}
                                </p>

                                {usuario.nome_usuario && (
                                  <p className="mt-1 break-all text-xs text-[#9CA69C]">
                                    {usuario.nome_usuario}
                                  </p>
                                )}
                              </div>
                            </div>
                          </td>

                          {/* PERFIL */}

                          <td className="px-6 py-4">
                            <span className="inline-flex rounded-lg bg-[#EAF0E6] px-3 py-1.5 text-xs font-medium text-[#3A5A40] dark:bg-[#273B31] dark:text-[#C6D9C2]">
                              {formatarPerfil(
                                usuario.perfil_acesso
                              )}
                            </span>
                          </td>

                          {/* STATUS */}

                          <td className="px-6 py-4">
                            <span
                              className={`inline-flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-medium ${
                                status === "ativo"
                                  ? "bg-green-50 text-green-700 dark:bg-green-950/30 dark:text-green-300"
                                  : status === "pendente"
                                    ? "bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-300"
                                    : "bg-red-50 text-red-700 dark:bg-red-950/30 dark:text-red-300"
                              }`}
                            >
                              <span
                                className={`h-2 w-2 rounded-full ${
                                  status === "ativo"
                                    ? "bg-green-500"
                                    : status === "pendente"
                                      ? "bg-amber-500"
                                      : "bg-red-500"
                                }`}
                              />

                              {status === "ativo"
                                ? "Ativo"
                                : status ===
                                    "pendente"
                                  ? "Pendente"
                                  : "Inativo"}
                            </span>
                          </td>

                          {/* ENTRADA */}

                          <td className={`px-6 py-4 ${TEXTO_SECUNDARIO}`}>
                            {formatarData(
                              usuario.vinculado_em
                            )}
                          </td>

                          {/* AÇÕES */}

                          {ehProprietario && (
                            <td className="px-6 py-4 text-right">

                              {podeAlterar ? (
                                <div className="flex items-center justify-end gap-2">

                                  {/* INATIVAR / REATIVAR */}

                                  <button
                                    type="button"
                                    onClick={() =>
                                      abrirModalAcao(
                                        vinculoInativo
                                          ? "reativar"
                                          : "inativar",
                                        usuario
                                      )
                                    }
                                    disabled={
                                      processandoId !==
                                        null ||
                                      (vinculoInativo &&
                                        !contaAtiva)
                                    }
                                    title={
                                      vinculoInativo
                                        ? contaAtiva
                                          ? "Reativar colaborador"
                                          : "A conta está inativa e não pode ser reativada por esta ação"
                                        : "Inativar colaborador"
                                    }
                                    className={`inline-flex min-w-[106px] items-center justify-center gap-2 rounded-lg border px-3 py-2 text-xs font-medium transition disabled:cursor-not-allowed disabled:opacity-50 ${
                                      vinculoInativo
                                        ? "border-[#A3B18A] bg-[#EAF0E6] text-[#3A5A40] hover:bg-[#DDE9D8] dark:border-[#34483A] dark:bg-[#273B31] dark:text-[#C6D9C2] dark:hover:bg-[#344E41]"
                                        : "border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-300 dark:hover:bg-amber-950/50"
                                    }`}
                                  >
                                    {processandoId ===
                                    `status-${usuario.id}` ? (
                                      <Loader2
                                        size={16}
                                        className="animate-spin"
                                      />
                                    ) : vinculoInativo ? (
                                      <UserRoundCheck
                                        size={16}
                                      />
                                    ) : (
                                      <UserRoundX
                                        size={16}
                                      />
                                    )}

                                    {vinculoInativo
                                      ? "Reativar"
                                      : "Inativar"}
                                  </button>

                                  {/* EXCLUIR */}

                                  <button
                                    type="button"
                                    onClick={() =>
                                      abrirModalAcao(
                                        "excluir",
                                        usuario
                                      )
                                    }
                                    disabled={
                                      processandoId !==
                                      null
                                    }
                                    title="Excluir da equipe"
                                    className="inline-flex min-w-[92px] items-center justify-center gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-medium text-red-700 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-red-900 dark:bg-red-950/30 dark:text-red-300 dark:hover:bg-red-950/50"
                                  >
                                    {processandoId ===
                                    `usuario-${usuario.id}` ? (
                                      <Loader2
                                        size={16}
                                        className="animate-spin"
                                      />
                                    ) : (
                                      <Trash2
                                        size={16}
                                      />
                                    )}

                                    Excluir
                                  </button>
                                </div>
                              ) : (
                                <span className="text-xs text-[#9CA69C]">
                                  —
                                </span>
                              )}
                            </td>
                          )}
                        </tr>
                      );
                    }
                  )}

                  {/* NENHUM RESULTADO */}

                  {colaboradoresFiltrados.length ===
                    0 && (
                    <tr>
                      <td
                        colSpan={
                          ehProprietario ? 5 : 4
                        }
                        className="px-6 py-14 text-center"
                      >
                        <UsersRound
                          size={32}
                          className="mx-auto mb-3 text-[#A3B18A]"
                        />

                        <p className={`text-sm ${TEXTO_SECUNDARIO}`}>
                          Nenhum membro encontrado.
                        </p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>

          {/* ==================================
              CONVITES PENDENTES
          ================================== */}

          {ehProprietario && (
            <section className={`${CARD} overflow-hidden`}>

              <div className="border-b border-[#E5E7E1] p-6 dark:border-[#34483A]">
                <h2 className="text-lg font-semibold">
                  Convites pendentes
                </h2>

                <p className={`mt-1 text-sm ${TEXTO_SECUNDARIO}`}>
                  Convites enviados que ainda não foram aceitos.
                </p>
              </div>

              {convites.length === 0 ? (
                <div className="flex flex-col items-center px-6 py-14 text-center">

                  <Mail
                    size={34}
                    className="mb-4 text-[#A3B18A]"
                  />

                  <p className="font-medium">
                    Nenhum convite pendente
                  </p>

                  <p className={`mt-2 text-sm ${TEXTO_SECUNDARIO}`}>
                    Os convites enviados aparecerão aqui.
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-[#E5E7E1] dark:divide-[#34483A]">

                  {convites.map((convite) => (
                    <div
                      key={convite.id}
                      className="flex flex-col justify-between gap-4 p-6 sm:flex-row sm:items-center"
                    >
                      <div className="flex items-center gap-4">

                        <div className="rounded-xl bg-[#EAF0E6] p-3 dark:bg-[#273B31]">
                          <Mail
                            size={20}
                            className="text-[#588157] dark:text-[#A3B18A]"
                          />
                        </div>

                        <div>
                          <p className="break-all text-sm font-medium">
                            {convite.email_convidado}
                          </p>

                          <p className={`mt-1 flex items-center gap-2 text-xs ${TEXTO_SECUNDARIO}`}>
                            <Clock3 size={13} />
                            Expira em{" "}
                            {formatarData(
                              convite.expira_em
                            )}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-4">

                        <span className="rounded-lg bg-amber-50 px-3 py-1.5 text-xs font-medium text-amber-700 dark:bg-amber-950/30 dark:text-amber-300">
                          Pendente
                        </span>

                        <button
                          type="button"
                          onClick={() =>
                            cancelarConvite(
                              convite.id
                            )
                          }
                          disabled={
                            processandoId !== null
                          }
                          title="Cancelar convite"
                          aria-label="Cancelar convite"
                          className="rounded-lg p-2 text-[#8C9890] transition hover:bg-red-50 hover:text-red-600 disabled:opacity-50 dark:hover:bg-red-950/30"
                        >
                          {processandoId ===
                          `convite-${convite.id}` ? (
                            <Loader2
                              size={18}
                              className="animate-spin"
                            />
                          ) : (
                            <X size={19} />
                          )}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          )}
        </main>

        <FooterPlataforma />
      </div>

      {/* ==================================
          MODAL CONVIDAR COLABORADOR
      ================================== */}

      {ehProprietario && modalConvite && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 px-3 py-4 sm:px-4 sm:py-8"
          onMouseDown={(evento) => {
            if (
              evento.target ===
                evento.currentTarget &&
              !enviando
            ) {
              setModalConvite(false);
            }
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="titulo-convite"
            className="max-h-[calc(100dvh-2rem)] w-full max-w-md overflow-y-auto rounded-2xl border border-[#DAD7CD] bg-white p-5 shadow-2xl sm:p-7 dark:border-[#34483A] dark:bg-[#1B281E]"
          >

            <div className="mb-6 flex items-start justify-between">

              <div className="rounded-xl bg-[#EAF0E6] p-3 dark:bg-[#273B31]">
                <Mail
                  size={23}
                  className="text-[#588157] dark:text-[#A3B18A]"
                />
              </div>

              <button
                type="button"
                onClick={() =>
                  setModalConvite(false)
                }
                disabled={enviando}
                aria-label="Fechar convite"
                className="rounded-lg p-2 text-[#738075] transition hover:bg-[#F0F3ED] dark:hover:bg-[#273B31]"
              >
                <X size={20} />
              </button>
            </div>

            <h2
              id="titulo-convite"
              className="text-xl font-semibold"
            >
              Convidar colaborador
            </h2>

            <p className={`mt-2 text-sm leading-relaxed ${TEXTO_SECUNDARIO}`}>
              Envie um convite para que uma pessoa
              tenha acesso à plataforma Visora como
              colaborador da sua empresa.
            </p>

            <form
              onSubmit={enviarConvite}
              className="mt-7"
            >
              <label
                htmlFor="email-colaborador"
                className="mb-2 block text-sm font-medium"
              >
                E-mail do colaborador
              </label>

              <div className="flex items-center gap-3 rounded-xl border border-[#DAD7CD] px-4 py-3 focus-within:border-[#588157] dark:border-[#34483A]">

                <Mail
                  size={18}
                  className="shrink-0 text-[#738075]"
                />

                <input
                  id="email-colaborador"
                  type="email"
                  required
                  maxLength={100}
                  autoFocus
                  value={emailConvite}
                  onChange={(evento) =>
                    setEmailConvite(
                      evento.target.value
                    )
                  }
                  placeholder="colaborador@empresa.com"
                  className="w-full min-w-0 bg-transparent text-sm outline-none placeholder:text-[#9CA69C]"
                />
              </div>

              <div className="mt-5 rounded-xl bg-[#F0F3ED] p-4 dark:bg-[#273B31]">

                <div className="flex items-center gap-2">
                  <ShieldCheck
                    size={17}
                    className="text-[#588157] dark:text-[#A3B18A]"
                  />

                  <p className="text-sm font-medium">
                    Perfil de colaborador
                  </p>
                </div>

                <p className="mt-2 text-xs leading-relaxed text-[#738075] dark:text-[#BFC4AC]">
                  O convidado receberá um link para
                  ativar sua conta. Após a ativação,
                  as credenciais de uma conta nova
                  serão apresentadas diretamente
                  na tela.
                </p>
              </div>

              <div className="mt-7 flex gap-3">

                <button
                  type="button"
                  onClick={() =>
                    setModalConvite(false)
                  }
                  disabled={enviando}
                  className="flex-1 rounded-xl border border-[#DAD7CD] px-4 py-3 text-sm font-medium transition hover:bg-[#F0F3ED] dark:border-[#34483A] dark:hover:bg-[#273B31]"
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  disabled={enviando}
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#3A5A40] px-4 py-3 text-sm font-medium text-white transition hover:bg-[#273B31] disabled:opacity-60"
                >
                  {enviando ? (
                    <>
                      <Loader2
                        size={17}
                        className="animate-spin"
                      />
                      Enviando...
                    </>
                  ) : (
                    <>
                      <Send size={17} />
                      Enviar convite
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================================
          POP-UP DE INATIVAÇÃO,
          REATIVAÇÃO E EXCLUSÃO
      ================================== */}

      {modalAcao &&
        colaboradorSelecionado && (
          <ModalAcaoColaborador
            tipo={modalAcao}
            usuario={colaboradorSelecionado}
            processando={
              processandoId !== null
            }
            erro={erroModal}
            onFechar={fecharModalAcao}
            onConfirmar={
              confirmarAcaoColaborador
            }
          />
        )}
    </div>
  );
}

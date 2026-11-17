
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import {
  UsersRound,
  UserRoundCheck,
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

// ==========================================
// FUNÇÕES AUXILIARES
// ==========================================

function formatarData(data) {
  if (!data) return "—";

  const dataFormatada = new Date(data);

  if (Number.isNaN(dataFormatada.getTime())) {
    return "—";
  }

  return dataFormatada.toLocaleDateString("pt-BR");
}

function formatarDataHora(data) {
  if (!data) return "—";

  const dataFormatada = new Date(data);

  if (Number.isNaN(dataFormatada.getTime())) return "—";

  return dataFormatada.toLocaleString("pt-BR", {
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

// ==========================================
// PÁGINA DE EQUIPE
// ==========================================

export default function PaginaEquipe() {
  const router = useRouter();

  const [collapsed, setCollapsed] = useState(false);

  const [carregando, setCarregando] = useState(true);
  const [atualizando, setAtualizando] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [processandoId, setProcessandoId] = useState(null);

  const [empresa, setEmpresa] = useState(null);
  const [perfil, setPerfil] = useState("");
  const [colaboradores, setColaboradores] = useState([]);
  const [convites, setConvites] = useState([]);
  const [ultimaAtividade, setUltimaAtividade] = useState(null);

  const [busca, setBusca] = useState("");
  const [modalConvite, setModalConvite] = useState(false);
  const [emailConvite, setEmailConvite] = useState("");

  const [mensagem, setMensagem] = useState("");
  const [tipoMensagem, setTipoMensagem] = useState("sucesso");

  const [acessoNegado, setAcessoNegado] = useState(false);

  const ehProprietario = perfil === "proprietario";

  // ==========================================
  // CARREGAR MEMBROS E PERMISSÕES
  // ==========================================

  async function carregarEquipe(atualizacao = false) {
    const token = sessionStorage.getItem("visora-token");

    if (!token) {
      router.replace("/areapublica_pagina_login");
      return;
    }

    try {
      if (atualizacao) {
        setAtualizando(true);
      } else {
        setCarregando(true);
      }

      setAcessoNegado(false);

      // Disponível para proprietário e colaborador.
      const dadosMembros = await buscarMembrosEquipe(token);

      const perfilUsuario = dadosMembros.perfil_acesso;

      if (
        perfilUsuario !== "proprietario" &&
        perfilUsuario !== "colaborador"
      ) {
        setAcessoNegado(true);
        return;
      }

      setPerfil(perfilUsuario);
      setEmpresa(dadosMembros.empresa || null);
      setColaboradores(dadosMembros.colaboradores || []);
      setUltimaAtividade(dadosMembros.ultimaAtividade || null);

      // Somente o proprietário consulta os convites.
      if (perfilUsuario === "proprietario") {
        const dadosEquipe = await buscarEquipe(token);

        setConvites(dadosEquipe.convites || []);
      } else {
        setConvites([]);
        setModalConvite(false);
      }
    } catch (erro) {
      const texto = erro.message || "Erro ao carregar equipe.";

      if (
        texto.includes("acesso") ||
        texto.includes("Acesso") ||
        texto.includes("403") ||
        texto.includes("401")
      ) {
        setAcessoNegado(true);
      } else {
        mostrarMensagem(texto, "erro");
      }
    } finally {
      setCarregando(false);
      setAtualizando(false);
    }
  }

  useEffect(() => {
    carregarEquipe();
  }, []);

  // ==========================================
  // MENSAGENS
  // ==========================================

  function mostrarMensagem(texto, tipo = "sucesso") {
    setMensagem(texto);
    setTipoMensagem(tipo);
  }

  // ==========================================
  // ENVIAR CONVITE
  // ==========================================

  async function enviarConvite(evento) {
    evento.preventDefault();

    if (!ehProprietario) return;

    const email = emailConvite.trim();

    if (!email) {
      mostrarMensagem("Informe o e-mail do colaborador.", "erro");
      return;
    }

    try {
      setEnviando(true);

      const token = sessionStorage.getItem("visora-token");

      const resultado = await convidarColaborador(email, token);

      setModalConvite(false);
      setEmailConvite("");

      mostrarMensagem(
        resultado.mensagem || "Convite enviado com sucesso."
      );

      await carregarEquipe(true);
    } catch (erro) {
      mostrarMensagem(erro.message, "erro");
    } finally {
      setEnviando(false);
    }
  }

  // ==========================================
  // CANCELAR CONVITE
  // ==========================================

  async function cancelarConvite(id) {
    if (!ehProprietario) return;

    const confirmou = window.confirm(
      "Deseja cancelar este convite?"
    );

    if (!confirmou) return;

    try {
      setProcessandoId(`convite-${id}`);

      const token = sessionStorage.getItem("visora-token");

      await cancelarConviteEquipe(id, token);

      mostrarMensagem("Convite cancelado com sucesso.");

      await carregarEquipe(true);
    } catch (erro) {
      mostrarMensagem(erro.message, "erro");
    } finally {
      setProcessandoId(null);
    }
  }

  // ==========================================
  // REMOVER COLABORADOR
  // ==========================================

  async function removerColaborador(usuario) {
    if (!ehProprietario) return;

    const confirmou = window.confirm(
      `Deseja remover ${usuario.nome_completo} da equipe?`
    );

    if (!confirmou) return;

    try {
      setProcessandoId(`usuario-${usuario.id}`);

      const token = sessionStorage.getItem("visora-token");

      await removerColaboradorEquipe(usuario.id, token);

      mostrarMensagem("Colaborador removido com sucesso.");

      await carregarEquipe(true);
    } catch (erro) {
      mostrarMensagem(erro.message, "erro");
    } finally {
      setProcessandoId(null);
    }
  }

  // ==========================================
  // FILTROS E CONTADORES
  // ==========================================

  const colaboradoresFiltrados = colaboradores.filter((usuario) => {
    const pesquisa = busca.trim().toLowerCase();

    return (
      usuario.nome_completo?.toLowerCase().includes(pesquisa) ||
      usuario.email?.toLowerCase().includes(pesquisa) ||
      usuario.nome_usuario?.toLowerCase().includes(pesquisa)
    );
  });

  const totalMembros = colaboradores.length;

  const totalColaboradores = colaboradores.filter(
    (usuario) => usuario.perfil_acesso === "colaborador"
  ).length;

  const colaboradoresAtivos = colaboradores.filter(
    (usuario) =>
      usuario.perfil_acesso === "colaborador" &&
      usuario.status_conta === "ativo"
  ).length;

  const membrosAtivos = colaboradores.filter(
    (usuario) => usuario.status_conta === "ativo"
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
          valor: ultimaAtividade?.responsavel || "Nenhuma atividade",
          descricao: ultimaAtividade?.descricao || "Ainda não há alterações registradas.",
          data: ultimaAtividade?.criado_em || null,
          icone: History,
        },
      ];

  // ==========================================
  // CARREGAMENTO
  // ==========================================

  if (carregando) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F8F9F6] dark:bg-[#111A14]">
        <Loader2 className="h-9 w-9 animate-spin text-[#588157]" />
      </div>
    );
  }

  // ==========================================
  // ACESSO NEGADO
  // ==========================================

  if (acessoNegado) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-5 bg-[#F8F9F6] px-6 text-center dark:bg-[#111A14]">
        <ShieldCheck className="h-14 w-14 text-[#588157]" />

        <h1 className="text-2xl font-semibold text-[#273B31] dark:text-white">
          Acesso restrito
        </h1>

        <p className="max-w-md text-[#6B756D] dark:text-[#A3B18A]">
          Você não possui permissão para visualizar esta equipe.
        </p>

        <button
          onClick={() => router.push("/plataforma_pagina_inicial")}
          className="rounded-xl bg-[#3A5A40] px-6 py-3 font-medium text-white transition hover:bg-[#273B31]"
        >
          Voltar para a plataforma
        </button>
      </div>
    );
  }

  // ==========================================
  // CONTEÚDO PRINCIPAL
  // ==========================================

  return (
    <div className="min-h-screen bg-[#F8F9F6] text-[#273B31] dark:bg-[#111A14] dark:text-[#E5EDE5]">

      <SidebarPlataforma
        collapsed={collapsed}
        setCollapsed={setCollapsed}
      />

      <div
        className={`min-h-screen transition-all duration-300 ${
          collapsed ? "lg:ml-[82px]" : "lg:ml-[270px]"
        }`}
      >
        <main className="mx-auto max-w-7xl px-6 py-10 lg:px-10">

          {/* CABEÇALHO */}
          <div className="mb-10 flex flex-col justify-between gap-5 sm:flex-row sm:items-center">

            <div>
              <div className="mb-3 flex items-center gap-2 text-sm text-[#588157]">
                <UsersRound size={17} />
                Equipe
              </div>

              <h1 className="text-3xl font-semibold tracking-tight">
                {ehProprietario ? "Sua equipe" : "Membros da equipe"}
              </h1>

              <p className="mt-2 text-sm text-[#738075] dark:text-[#A3B18A]">
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

          {/* MENSAGENS */}
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
                  <AlertCircle size={18} />
                ) : (
                  <CheckCircle2 size={18} />
                )}

                <span>{mensagem}</span>
              </div>

              <button
                onClick={() => setMensagem("")}
                aria-label="Fechar mensagem"
              >
                <X size={17} />
              </button>
            </div>
          )}

          {/* INDICADORES */}
          <div className="mb-9 grid grid-cols-1 gap-5 sm:grid-cols-3">

            {indicadores.map((item) => {
              const Icone = item.icone;

              return (
                <div
                  key={item.titulo}
                  className="rounded-2xl border border-[#DAD7CD] bg-white p-6 dark:border-[#34483A] dark:bg-[#1B281E]"
                >
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-[#738075] dark:text-[#A3B18A]">
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
                        ? "break-words text-lg font-semibold"
                        : "mt-5 text-4xl font-semibold"
                    }
                  >
                    {item.valor}
                  </p>

                  {item.descricao && (
                    <>
                      <p className="mt-2 break-words text-sm text-[#738075] dark:text-[#A3B18A]">
                        {item.descricao}
                      </p>
                      {item.data && (
                        <p className="mt-3 flex items-center gap-1.5 text-xs text-[#738075] dark:text-[#A3B18A]">
                          <Clock3 size={13} />
                          {formatarDataHora(item.data)}
                        </p>
                      )}
                    </>
                  )}
                </div>
              );
            })}
          </div>

          {/* LISTAGEM DOS MEMBROS */}
          <section className="mb-9 overflow-hidden rounded-2xl border border-[#DAD7CD] bg-white dark:border-[#34483A] dark:bg-[#1B281E]">

            <div className="flex flex-col justify-between gap-5 border-b border-[#E5E7E1] p-6 sm:flex-row sm:items-center dark:border-[#34483A]">

              <div>
                <h2 className="text-lg font-semibold">
                  Membros da equipe
                </h2>

                <p className="mt-1 text-sm text-[#738075] dark:text-[#A3B18A]">
                  Pessoas que possuem acesso à sua empresa.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 rounded-xl border border-[#DAD7CD] px-3 py-2 dark:border-[#34483A]">
                  <Search size={17} className="text-[#738075]" />

                  <input
                    type="text"
                    placeholder="Buscar membro..."
                    value={busca}
                    onChange={(evento) => setBusca(evento.target.value)}
                    className="w-40 bg-transparent text-sm outline-none placeholder:text-[#9CA69C] sm:w-48"
                  />
                </div>

                <button
                  onClick={() => carregarEquipe(true)}
                  disabled={atualizando}
                  title="Atualizar equipe"
                  className="rounded-xl border border-[#DAD7CD] p-2.5 transition hover:bg-[#F0F3ED] disabled:opacity-50 dark:border-[#34483A] dark:hover:bg-[#273B31]"
                >
                  <RefreshCw
                    size={18}
                    className={atualizando ? "animate-spin" : ""}
                  />
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">

                <thead className="bg-[#F8F9F6] text-[#738075] dark:bg-[#202E23] dark:text-[#A3B18A]">
                  <tr>
                    <th className="px-6 py-4 font-medium">Membro</th>
                    <th className="px-6 py-4 font-medium">Perfil</th>
                    <th className="px-6 py-4 font-medium">Status</th>
                    <th className="px-6 py-4 font-medium">Entrada</th>

                    {ehProprietario && (
                      <th className="px-6 py-4 text-right font-medium">
                        Ações
                      </th>
                    )}
                  </tr>
                </thead>

                <tbody className="divide-y divide-[#E5E7E1] dark:divide-[#34483A]">

                  {colaboradoresFiltrados.map((usuario) => (
                    <tr
                      key={usuario.id}
                      className="transition hover:bg-[#F8F9F6] dark:hover:bg-[#202E23]"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">

                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#EAF0E6] dark:bg-[#273B31]">
                            <UserRound
                              size={19}
                              className="text-[#588157] dark:text-[#A3B18A]"
                            />
                          </div>

                          <div>
                            <p className="font-medium">
                              {usuario.nome_completo}
                            </p>

                            <p className="mt-1 text-xs text-[#738075] dark:text-[#A3B18A]">
                              {usuario.email}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <span className="rounded-lg bg-[#EAF0E6] px-3 py-1.5 text-xs font-medium text-[#3A5A40] dark:bg-[#273B31] dark:text-[#C6D9C2]">
                          {formatarPerfil(usuario.perfil_acesso)}
                        </span>
                      </td>

                      <td className="px-6 py-4">
                        <span className="inline-flex items-center gap-2 text-xs">
                          <span
                            className={`h-2 w-2 rounded-full ${
                              usuario.status_conta === "ativo"
                                ? "bg-green-500"
                                : "bg-amber-500"
                            }`}
                          />

                          {usuario.status_conta === "ativo"
                            ? "Ativo"
                            : usuario.status_conta === "pendente"
                              ? "Pendente"
                              : "Inativo"}
                        </span>
                      </td>

                      <td className="px-6 py-4 text-[#738075] dark:text-[#A3B18A]">
                        {formatarData(usuario.vinculado_em)}
                      </td>

                      {ehProprietario && (
                        <td className="px-6 py-4 text-right">
                          {usuario.perfil_acesso === "colaborador" ? (
                            <button
                              onClick={() => removerColaborador(usuario)}
                              disabled={
                                processandoId === `usuario-${usuario.id}`
                              }
                              title="Remover colaborador"
                              className="rounded-lg p-2 text-[#8C9890] transition hover:bg-red-50 hover:text-red-600 disabled:opacity-50 dark:hover:bg-red-950/30"
                            >
                              {processandoId === `usuario-${usuario.id}` ? (
                                <Loader2 size={18} className="animate-spin" />
                              ) : (
                                <Trash2 size={18} />
                              )}
                            </button>
                          ) : (
                            <span className="text-xs text-[#9CA69C]">
                              —
                            </span>
                          )}
                        </td>
                      )}
                    </tr>
                  ))}

                  {colaboradoresFiltrados.length === 0 && (
                    <tr>
                      <td
                        colSpan={ehProprietario ? 5 : 4}
                        className="px-6 py-14 text-center"
                      >
                        <UsersRound
                          size={32}
                          className="mx-auto mb-3 text-[#A3B18A]"
                        />

                        <p className="text-sm text-[#738075] dark:text-[#A3B18A]">
                          Nenhum membro encontrado.
                        </p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>

          {/* CONVITES - SOMENTE PROPRIETÁRIO */}
          {ehProprietario && (
            <section className="overflow-hidden rounded-2xl border border-[#DAD7CD] bg-white dark:border-[#34483A] dark:bg-[#1B281E]">

              <div className="border-b border-[#E5E7E1] p-6 dark:border-[#34483A]">
                <h2 className="text-lg font-semibold">
                  Convites pendentes
                </h2>

                <p className="mt-1 text-sm text-[#738075] dark:text-[#A3B18A]">
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

                  <p className="mt-2 text-sm text-[#738075] dark:text-[#A3B18A]">
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
                          <p className="text-sm font-medium">
                            {convite.email_convidado}
                          </p>

                          <p className="mt-1 flex items-center gap-2 text-xs text-[#738075] dark:text-[#A3B18A]">
                            <Clock3 size={13} />
                            Expira em {formatarData(convite.expira_em)}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        <span className="rounded-lg bg-amber-50 px-3 py-1.5 text-xs font-medium text-amber-700 dark:bg-amber-950/30 dark:text-amber-300">
                          Pendente
                        </span>

                        <button
                          onClick={() => cancelarConvite(convite.id)}
                          disabled={
                            processandoId === `convite-${convite.id}`
                          }
                          className="rounded-lg p-2 text-[#8C9890] transition hover:bg-red-50 hover:text-red-600 disabled:opacity-50 dark:hover:bg-red-950/30"
                          title="Cancelar convite"
                        >
                          {processandoId === `convite-${convite.id}` ? (
                            <Loader2 size={18} className="animate-spin" />
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

      {/* MODAL - SOMENTE PROPRIETÁRIO */}
      {ehProprietario && modalConvite && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 px-4 py-8"
          onMouseDown={(evento) => {
            if (
              evento.target === evento.currentTarget &&
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
            className="w-full max-w-md rounded-2xl border border-[#DAD7CD] bg-white p-7 shadow-2xl dark:border-[#34483A] dark:bg-[#1B281E]"
          >

            <div className="mb-6 flex items-start justify-between">
              <div className="rounded-xl bg-[#EAF0E6] p-3 dark:bg-[#273B31]">
                <Mail
                  size={23}
                  className="text-[#588157] dark:text-[#A3B18A]"
                />
              </div>

              <button
                onClick={() => setModalConvite(false)}
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

            <p className="mt-2 text-sm leading-relaxed text-[#738075] dark:text-[#A3B18A]">
              Envie um convite para que uma pessoa tenha acesso
              à plataforma Visora como colaborador da sua empresa.
            </p>

            <form onSubmit={enviarConvite} className="mt-7">

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
                    setEmailConvite(evento.target.value)
                  }
                  placeholder="colaborador@empresa.com"
                  className="w-full bg-transparent text-sm outline-none placeholder:text-[#9CA69C]"
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
                  O convidado receberá um link para ativar sua conta.
                  Após a ativação, a Visora fornecerá suas credenciais
                  de acesso por e-mail, caso seja uma conta nova.
                </p>
              </div>

              <div className="mt-7 flex gap-3">
                <button
                  type="button"
                  onClick={() => setModalConvite(false)}
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
                      <Loader2 size={17} className="animate-spin" />
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
    </div>
  );
}

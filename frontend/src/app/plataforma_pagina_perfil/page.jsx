
"use client";

import Link from "next/link";

import { useState, useEffect } from "react";

import SidebarPlataforma from "@/components/SidebarPlataforma";
import FooterPlataforma from "@/components/FooterPlataforma";

import {
  buscarPerfilUsuario,
  atualizarPerfilUsuario,
  alterarSenhaUsuario,
  buscarAssinatura,
  buscarPlanosAssinatura,
  alterarFormaPagamento,
  trocarPlano,
  consultarPagamentoTroca,
} from "@/lib/api";

import {
  UserRound,
  Building2,
  Medal,
  CalendarDays,
  Mail,
  Phone,
  ShieldCheck,
  Pencil,
  LockKeyhole,
  CircleCheck,
  X,
  Save,
  CreditCard,
  QrCode,
  Barcode,
  ArrowRightLeft,
  ExternalLink,
  RefreshCw,
  Eye,
  EyeOff, Info, ArrowRight 
} from "lucide-react";

export default function PlataformaPaginaPerfil() {
  const [collapsed, setCollapsed] = useState(false);
  const [animarMargemAoClicar, setAnimarMargemAoClicar] = useState(false);

  useEffect(() => {
    const ativarAnimacao = () => setAnimarMargemAoClicar(true);
    window.addEventListener("visora-sidebar-alterada", ativarAnimacao);
    return () => window.removeEventListener("visora-sidebar-alterada", ativarAnimacao);
  }, []);

  const [modalPerfil, setModalPerfil] = useState(false);
  const [modalSenha, setModalSenha] = useState(false);
  const [modalPlano, setModalPlano] = useState(false);
  const [modalPagamento, setModalPagamento] = useState(false);
  const [assinatura, setAssinatura] = useState(null);
  const [trocaPendente, setTrocaPendente] = useState(null);
  const [planosDisponiveis, setPlanosDisponiveis] = useState([]);
  const [metodoPreferido, setMetodoPreferido] = useState(null);
  const [metodoUtilizado, setMetodoUtilizado] = useState(null);
  const [metodoEdicao, setMetodoEdicao] = useState("");
  const [novoPlanoId, setNovoPlanoId] = useState("");
  const [metodoTroca, setMetodoTroca] = useState("");
  const [salvandoAssinatura, setSalvandoAssinatura] = useState(false);
  const [erroAssinatura, setErroAssinatura] = useState("");
  const [avisoAssinatura, setAvisoAssinatura] = useState("");

  const metodosValidos = ["pix", "cartao_credito", "boleto"];

  function normalizarMetodoPagamento(valor) {
    const metodo = String(valor ?? "").trim().toLowerCase();
    const equivalencias = {
      pix: "pix",
      boleto: "boleto",
      credit_card: "cartao_credito",
      cartao_credito: "cartao_credito",
    };
    return equivalencias[metodo] || null;
  }

  function aplicarMetodoPagamento(resultado) {
    const metodo = normalizarMetodoPagamento(resultado?.metodoPagamento);
    setMetodoPreferido(metodo);
    setMetodoTroca(metodo || "");
  }


  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);

  const [erroPerfil, setErroPerfil] = useState("");
  const [erroEdicao, setErroEdicao] = useState("");
  const [sucesso, setSucesso] = useState("");


  const [empresa, setEmpresa] = useState(null);
  const [plano, setPlano] = useState(null);

  const [dados, setDados] = useState({
    nome: "",
    email: "",
    telefone: "",
    tipo: "",
  });

  const [formPerfil, setFormPerfil] = useState({
    nome: "",
    email: "",
    telefone: "",
  });

  const [formSenha, setFormSenha] = useState({
    senhaAtual: "",
    novaSenha: "",
    confirmarSenha: "",
  });

  const [erroSenha, setErroSenha] = useState("");
  const [sucessoSenha, setSucessoSenha] = useState("");
  const [mostrarSenhas, setMostrarSenhas] = useState(false);

  function obterToken() {
    return sessionStorage.getItem("visora-token");
  }

  

  function formatarData(data) {
    if (!data) return "Não disponível";

    const dataFormatada = new Date(
      `${String(data).slice(0, 10)}T12:00:00`
    );

    if (Number.isNaN(dataFormatada.getTime())) {
      return "Não disponível";
    }

    return dataFormatada.toLocaleDateString("pt-BR");
  }

  

  async function carregarPerfil() {
    try {
      setCarregando(true);
      setErroPerfil("");

      const token = obterToken();

      if (!token) {
        throw new Error(
          "Sessão não encontrada. Faça login novamente."
        );
      }

      const resposta = await buscarPerfilUsuario(token);
      const usuario = resposta.usuario;

      if (!usuario) {
        throw new Error("Não foi possível carregar seu perfil.");
      }

      const dadosUsuario = {
        nome: usuario.nomeCompleto || "",
        email: usuario.email || "",
        telefone: usuario.telefone || "",
        tipo: usuario.tipo || "Usuário",
      };

      setDados(dadosUsuario);

      setFormPerfil({
        nome: dadosUsuario.nome,
        email: dadosUsuario.email,
        telefone: dadosUsuario.telefone,
      });


      setEmpresa(usuario.empresa || null);


      setPlano(usuario.plano || null);

      try {
        const resultado = await buscarAssinatura(token);
        setAssinatura(resultado.assinatura || null);

        setMetodoUtilizado(
          resultado.metodoPagamentoUtilizado || null
        );

        setTrocaPendente(resultado.trocaPendente || null);
        aplicarMetodoPagamento(resultado);
        setErroAssinatura("");
      } catch (erro) {
        setErroAssinatura(erro.message || "Não foi possível consultar sua assinatura.");
      }

    } catch (error) {
      setErroPerfil(
        error.message || "Erro ao carregar os dados do perfil."
      );
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    carregarPerfil();
  }, []);

  
  

  async function atualizarAssinatura() {
    const token = obterToken();
    if (!token) throw new Error("Sessão expirada. Faça login novamente.");
    const resposta = await buscarAssinatura(token);
    setAssinatura(resposta.assinatura || null);
    setMetodoUtilizado(
      resposta.metodoPagamentoUtilizado || null
    );
    setTrocaPendente(resposta.trocaPendente || null);
    aplicarMetodoPagamento(resposta);
    return resposta;
  }

  async function abrirModalPlano() {
    setErroAssinatura("");
    setAvisoAssinatura("");
    try {
      setSalvandoAssinatura(true);
      const token = obterToken();
      if (!token) throw new Error("Sessão expirada. Faça login novamente.");
      const [lista] = await Promise.all([
        buscarPlanosAssinatura(token),
        atualizarAssinatura(),
      ]);
      setPlanosDisponiveis(Array.isArray(lista) ? lista : lista.planos || []);
      setNovoPlanoId("");
      setModalPlano(true);
    } catch (erro) {
      setErroAssinatura(erro.message || "Não foi possível carregar os planos.");
    } finally {
      setSalvandoAssinatura(false);
    }
  }

  function abrirModalPagamento() {
    setErroAssinatura("");
    setAvisoAssinatura("");
    setMetodoEdicao(metodoPreferido || "");
    setModalPagamento(true);
  }

  async function salvarMetodoPagamento(e) {
    e.preventDefault();
    try {
      setSalvandoAssinatura(true);
      setErroAssinatura("");
      const token = obterToken();
      if (!token) throw new Error("Sessão expirada. Faça login novamente.");
      if (!metodosValidos.includes(metodoEdicao)) {
        throw new Error("Selecione uma forma de pagamento válida.");
      }
      await alterarFormaPagamento(token, metodoEdicao);
      await atualizarAssinatura();
      setMetodoTroca(metodoEdicao);
      setModalPagamento(false);
      setAvisoAssinatura("Preferência de pagamento atualizada para futuras cobranças.");
    } catch (erro) {
      setErroAssinatura(erro.message || "Não foi possível salvar a preferência.");
    } finally {
      setSalvandoAssinatura(false);
    }
  }

  async function solicitarNovoPlano(e) {
    e.preventDefault();
    if (!novoPlanoId) {
      setErroAssinatura("Selecione um plano.");
      return;
    }
    if (!metodosValidos.includes(metodoTroca)) {
      setErroAssinatura("Selecione uma forma de pagamento para a troca de plano.");
      return;
    }
    try {
      setSalvandoAssinatura(true);
      setErroAssinatura("");
      const token = obterToken();
      if (!token) throw new Error("Sessão expirada. Faça login novamente.");
      const resposta = await trocarPlano(token, Number(novoPlanoId), metodoTroca);
      await atualizarAssinatura();
      setModalPlano(false);
      setAvisoAssinatura(
        resposta.gateway?.url
          ? "Cobrança criada. Abra o link de pagamento abaixo para concluir a troca."
          : "Solicitação criada. O plano atual permanece ativo até a confirmação do pagamento."
      );
    } catch (erro) {
      setErroAssinatura(erro.message || "Não foi possível solicitar a troca.");
    } finally {
      setSalvandoAssinatura(false);
    }
  }

  async function verificarPagamentoTroca() {
    try {
      setSalvandoAssinatura(true);
      setErroAssinatura("");
      const token = obterToken();
      if (!token) throw new Error("Sessão expirada. Faça login novamente.");
      if (!trocaPendente?.codigo_transacao) {
        await atualizarAssinatura();
        return;
      }
      try {
        await consultarPagamentoTroca(token, trocaPendente.codigo_transacao);
        setAvisoAssinatura("Pagamento confirmado! Seu novo plano foi ativado.");
      } catch (erro) {
        setAvisoAssinatura("");
        setErroAssinatura(erro.message || "Pagamento ainda não confirmado.");
      }
      await atualizarAssinatura();
    } catch (erro) {
      setErroAssinatura(erro.message || "Não foi possível atualizar o pagamento.");
    } finally {
      setSalvandoAssinatura(false);
    }
  }

  

  function abrirModalPerfil() {
    setFormPerfil({
      nome: dados.nome,
      email: dados.email,
      telefone: dados.telefone,
    });

    setErroEdicao("");
    setSucesso("");
    setModalPerfil(true);
  }

  

  
async function salvarPerfil(e) {
  e.preventDefault();

  try {
    setSalvando(true);
    setErroEdicao("");
    setSucesso("");

    const token = obterToken();

    if (!token) {
      throw new Error("Sessão expirada. Faça login novamente.");
    }

    const resposta = await atualizarPerfilUsuario(token, {
      nomeCompleto: formPerfil.nome.trim(),
      email: formPerfil.email.trim(),
      telefone: formPerfil.telefone,
    });

    const usuarioAtualizado = resposta.usuario;

    if (!usuarioAtualizado) {
      throw new Error("Não foi possível atualizar seu perfil.");
    }

    const novosDados = {
      nome: usuarioAtualizado.nomeCompleto || formPerfil.nome,
      email: usuarioAtualizado.email || formPerfil.email,
      telefone: usuarioAtualizado.telefone || formPerfil.telefone,
      tipo: usuarioAtualizado.tipo || dados.tipo,
    };

    setDados(novosDados);

    const usuarioSalvo = JSON.parse(
      sessionStorage.getItem("visora-usuario") || "{}"
    );

    const usuarioCompleto = {
      ...usuarioSalvo,
      ...usuarioAtualizado,
      nomeCompleto: novosDados.nome,
      email: novosDados.email,
      telefone: novosDados.telefone,
    };

    sessionStorage.setItem(
      "visora-usuario",
      JSON.stringify(usuarioCompleto)
    );

    window.dispatchEvent(
      new Event("visora-perfil-atualizado")
    );

    setModalPerfil(false);
    setSucesso("Seus dados foram atualizados com sucesso.");

  } catch (error) {
    setErroEdicao(
      error.message || "Erro ao atualizar seu perfil."
    );
  } finally {
    setSalvando(false);
  }
}

  

  function abrirModalSenha() {
    setMostrarSenhas(false);
    setErroSenha("");
    setSucessoSenha("");

    setFormSenha({
      senhaAtual: "",
      novaSenha: "",
      confirmarSenha: "",
    });

    setModalSenha(true);
  }


  async function salvarSenha(e) {
    e.preventDefault();

    setErroSenha("");
    setSucessoSenha("");

    if (formSenha.novaSenha !== formSenha.confirmarSenha) {
      setErroSenha("As senhas não coincidem.");
      return;
    }

    if (formSenha.novaSenha.length < 8) {
      setErroSenha(
        "A nova senha deve ter pelo menos 8 caracteres."
      );
      return;
    }

    if (new TextEncoder().encode(formSenha.novaSenha).length > 72) {
      setErroSenha("A nova senha deve ter no máximo 72 bytes.");
      return;
    }

    if (!formSenha.senhaAtual) {
      setErroSenha("Informe sua senha atual.");
      return;
    }

    if (formSenha.senhaAtual === formSenha.novaSenha) {
      setErroSenha(
        "A nova senha deve ser diferente da senha atual."
      );
      return;
    }

    try {
      setSalvando(true);

      const token = obterToken();

      if (!token) {
        throw new Error("Sessão expirada. Faça login novamente.");
      }

      const resposta = await alterarSenhaUsuario(token, {
        senhaAtual: formSenha.senhaAtual,
        novaSenha: formSenha.novaSenha,
      });

      if (resposta?.sucesso === false) {
        throw new Error(resposta?.mensagem || "Não foi possível alterar sua senha.");
      }

      setFormSenha({
        senhaAtual: "",
        novaSenha: "",
        confirmarSenha: "",
      });

      setSucessoSenha("Senha alterada com sucesso!");

      setTimeout(() => {
        setModalSenha(false);
        setSucessoSenha("");
      }, 1200);

    } catch (error) {
      setErroSenha(
        error.message || "Não foi possível alterar sua senha."
      );
    } finally {
      setSalvando(false);
    }
  }
  

  function fecharModais() {
    if (salvando || salvandoAssinatura) return;

    setModalPerfil(false);
    setModalSenha(false);
    setModalPlano(false);
    setModalPagamento(false);

    setErroEdicao("");
    setErroSenha("");
    setSucessoSenha("");
  }

  

  const dadosPessoais = [
    {
      titulo: "Nome completo",
      valor: dados.nome,
      icon: UserRound,
    },
    {
      titulo: "E-mail",
      valor: dados.email,
      icon: Mail,
    },
    {
      titulo: "Telefone pessoal",
      valor: dados.telefone || "Não informado",
      icon: Phone,
    },
    {
      titulo: "Tipo de conta",
      valor: dados.tipo
        ? dados.tipo.charAt(0).toUpperCase() + dados.tipo.slice(1).toLowerCase()
        : "Não informado",
      icon: ShieldCheck,
    },
  ];


  const dadosEmpresa = [
    {
      titulo: "Nome da empresa",
      valor: empresa?.nome || "Não disponível",
    },
    {
      titulo: "Telefone comercial",
      valor: empresa?.telefone || "Não disponível",
    },
    {
      titulo: "Documento (CNPJ/CPF)",
      valor: empresa?.documento || "Não disponível",
    },
    {
      titulo: "E-mail da empresa",
      valor: empresa?.email || "Não disponível",
    },
    {
      titulo: "Área de atuação",
      valor: empresa?.setor || "Não disponível",
    },
    {
      titulo: "Porte da empresa",
      valor: empresa?.porte || "Não disponível",
    },
  ];

  return (
    <div className="min-h-screen bg-[#F8F9F6] text-[#273B31] transition-colors duration-300 dark:bg-[#111A14] dark:text-[#E5EDE5]">


      <SidebarPlataforma
        collapsed={collapsed}
        setCollapsed={setCollapsed}
      />

      <main
        className={`
          min-h-screen ${animarMargemAoClicar ? "transition-[margin-left] duration-300" : "transition-none"}
          ${collapsed ? "ml-[82px]" : "ml-[270px]"}
        `}
      >
        <div className="mx-auto w-full max-w-[1500px] px-6 py-8 sm:px-8 lg:px-10">

          <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center">

            <div>
              <div className="mb-2 flex items-center gap-2 text-xs font-medium text-[#89958A] dark:text-[#AAB8AC]">
                <span>Plataforma</span>
                <span>/</span>
                <span className="text-[#588157] dark:text-[#A3B18A]">
                  Perfil
                </span>
              </div>

              <h1 className="text-3xl font-bold tracking-tight text-[#273B31] dark:text-white">
                Meu perfil
              </h1>

              <p className="mt-2 text-sm text-[#89958A] dark:text-[#AAB8AC]">
                Gerencie suas informações pessoais e configurações da conta.
              </p>
            </div>

            <button
              type="button"
              onClick={abrirModalPerfil}
              disabled={carregando || !!erroPerfil}
              className="flex w-fit items-center gap-2 rounded-xl bg-[#344E41] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#3A5A40] disabled:cursor-not-allowed disabled:opacity-50 dark:bg-[#588157] dark:hover:bg-[#466B4B]"
            >
              <Pencil size={16} />
              Editar perfil
            </button>

          </div>

          {/* MENSAGENS */}
          {erroPerfil && (
            <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600 dark:border-red-900 dark:bg-red-950/30 dark:text-red-400">
              {erroPerfil}

              <button
                type="button"
                onClick={carregarPerfil}
                className="ml-2 font-bold underline"
              >
                Tentar novamente
              </button>
            </div>
          )}

          {sucesso && (
            <div className="mt-6 flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/30 dark:text-emerald-400">
              <CircleCheck size={17} />
              {sucesso}
            </div>
          )}

          {/* CARREGAMENTO */}
          {carregando ? (
            <div className="mt-8 flex min-h-[300px] items-center justify-center">
              <div className="flex items-center gap-3 text-sm text-[#89958A] dark:text-[#AAB8AC]">
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-[#DAD7CD] border-t-[#588157]" />
                Carregando informações do perfil...
              </div>
            </div>
          ) : !erroPerfil && (
            <>
              {/* DADOS PESSOAIS */}
              <section className="mt-8 overflow-hidden rounded-2xl border border-[#DAD7CD] bg-white shadow-sm dark:border-[#34483A] dark:bg-[#18251C]">

                <div className="border-b border-[#E8EDE5] p-6 dark:border-[#34483A] sm:p-7">

                  <div className="flex flex-col gap-5 sm:flex-row sm:items-center">

                    <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full border-4 border-[#E8EDE5] bg-[#DCE7D7] text-[#344E41] dark:border-[#34483A] dark:bg-[#344E41] dark:text-white">
                      <UserRound size={34} />
                    </div>

                    <div>
                      <h2 className="text-xl font-bold text-[#273B31] dark:text-white">
                        Dados pessoais
                      </h2>

                      <p className="mt-1 text-sm text-[#89958A] dark:text-[#AAB8AC]">
                        Suas informações de perfil e conta.
                      </p>

                      <div className="mt-3 flex items-center gap-2">
                        <CircleCheck size={15} className="text-emerald-500" />
                        <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                          Perfil ativo
                        </span>
                      </div>
                    </div>

                  </div>
                </div>

                {/* INFORMAÇÕES */}
                <div className="grid gap-x-10 gap-y-7 p-6 sm:grid-cols-2 sm:p-7">

                  {dadosPessoais.map((item) => {
                    const Icon = item.icon;

                    return (
                      <div key={item.titulo} className="min-w-0">

                        <div className="mb-2 flex items-center gap-2 text-[#89958A] dark:text-[#AAB8AC]">
                          <Icon size={16} />
                          <p className="text-xs font-medium">
                            {item.titulo}
                          </p>
                        </div>

                        <p className="truncate text-sm font-semibold text-[#273B31] dark:text-[#E5EDE5]">
                          {item.valor || "Não informado"}
                        </p>

                      </div>
                    );
                  })}

                  {/* SEGURANÇA */}
                  <div className="sm:col-span-2">
                    <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-[#E8EDE5] bg-[#F8F9F6] p-4 dark:border-[#34483A] dark:bg-[#1C2920]">

                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#E8EDE5] text-[#588157] dark:bg-[#34483A] dark:text-[#A3B18A]">
                          <LockKeyhole size={19} />
                        </div>

                        <div>
                          <p className="text-sm font-semibold">
                            Segurança da conta
                          </p>

                          <p className="mt-1 text-xs text-[#89958A] dark:text-[#AAB8AC]">
                            Mantenha sua senha sempre atualizada.
                          </p>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={abrirModalSenha}
                        className="rounded-lg border border-[#588157] px-4 py-2 text-xs font-semibold text-[#588157] transition hover:bg-[#588157] hover:text-white dark:border-[#A3B18A] dark:text-[#A3B18A] dark:hover:bg-[#588157] dark:hover:text-white"
                      >
                        Alterar senha
                      </button>

                    </div>
                  </div>

                </div>
              </section>

              {/* DADOS DA EMPRESA */}
              <section className="mt-7 overflow-hidden rounded-2xl border border-[#DAD7CD] bg-white shadow-sm dark:border-[#34483A] dark:bg-[#18251C]">

  {/* CABEÇALHO */}
  <div className="border-b border-[#E8EDE5] p-6 dark:border-[#34483A] sm:p-7">

    <div className="flex items-center gap-4">

      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#E8EDE5] text-[#588157] dark:bg-[#34483A] dark:text-[#A3B18A]">
        <Building2 size={23} />
      </div>

      <div>
        <h2 className="text-xl font-bold text-[#273B31] dark:text-white">
          Dados da empresa
        </h2>

        <p className="mt-1 text-sm text-[#89958A] dark:text-[#AAB8AC]">
          Informações da empresa selecionada.
        </p>
      </div>

    </div>

  </div>

  {/* INFORMAÇÕES DA EMPRESA */}
  <div className="grid gap-x-10 gap-y-7 p-6 sm:grid-cols-2 lg:grid-cols-3 sm:p-7">

    {dadosEmpresa.map((item) => (
      <div key={item.titulo} className="min-w-0">

        <p className="mb-2 text-xs font-medium text-[#89958A] dark:text-[#AAB8AC]">
          {item.titulo}
        </p>

        <p className="truncate text-sm font-semibold text-[#273B31] dark:text-[#E5EDE5]">
          {item.valor}
        </p>

      </div>
    ))}

    {/* AVISO DE EXCLUSÃO DE EMPRESA */}
    {/* AVISO DE EXCLUSÃO DE EMPRESA */}
<div className="col-span-full flex items-start gap-3 rounded-xl border border-[#E8EDE5] bg-[#F8F9F6] p-4 dark:border-[#34483A] dark:bg-[#1C2920]">

  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#E8EDE5] text-[#588157] dark:bg-[#34483A] dark:text-[#A3B18A]">
    <Info size={20} />
  </div>

  <div className="min-w-0 flex-1">

    <p className="text-sm font-semibold text-[#273B31] dark:text-[#E5EDE5]">
      Exclusão de empresa
    </p>

    <p className="mt-1 text-xs leading-relaxed text-[#68776B] dark:text-[#B1BEB2]">
      Caso deseje excluir uma empresa cadastrada, entre em
      contato com a administração da Visora para solicitar
      a exclusão.
    </p>

    <Link
      href="/areapublica_pagina_contato"
      className="group mt-3 inline-flex items-center gap-2 text-xs font-semibold text-[#588157] transition-colors hover:text-[#344E41] dark:text-[#A3B18A] dark:hover:text-white"
    >
      <span className="underline-offset-4 group-hover:underline">
        Entrar em contato
      </span>

      <ArrowRight
        size={14}
        className="transition-transform duration-200 group-hover:translate-x-1"
      />
    </Link>

  </div>

</div>

  </div>

</section>

              {/* PLANO CONTRATADO */}
              <section className="mt-7 overflow-hidden rounded-2xl border border-[#DAD7CD] bg-white shadow-sm dark:border-[#34483A] dark:bg-[#18251C]">

                <div className="border-b border-[#E8EDE5] p-6 dark:border-[#34483A] sm:p-7">

                  <div className="flex items-center gap-4">

                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#E8EDE5] text-[#588157] dark:bg-[#34483A] dark:text-[#A3B18A]">
                      <Medal size={23} />
                    </div>

                    <div>
                      <h2 className="text-xl font-bold text-[#273B31] dark:text-white">
                        Plano contratado
                      </h2>

                      <p className="mt-1 text-sm text-[#89958A] dark:text-[#AAB8AC]">
                        Confira os detalhes da assinatura da sua empresa.
                      </p>
                    </div>

                  </div>
                </div>

                <div className="p-6 sm:p-7">

                  <div className="rounded-2xl border border-[#DCE7D7] bg-[#F1F6EF] p-6 dark:border-[#34483A] dark:bg-[#1C3325]">

                    <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center">

                      <div>
                        <p className="text-sm font-medium text-[#588157] dark:text-[#A3B18A]">
                          Seu plano atual
                        </p>

                        <h3 className="mt-2 text-3xl font-bold text-[#273B31] dark:text-white">
                          {assinatura?.nome_plano || plano?.nome || "Nenhum plano ativo"}
                        </h3>

                        <p className="mt-2 text-sm text-[#68776B] dark:text-[#B1BEB2]">
                          {plano
                            ? "Plano atualmente vinculado à sua empresa."
                            : "Sua empresa não possui uma assinatura ativa no momento."}
                        </p>
                      </div>

                      <div className="flex items-center gap-3 rounded-xl border border-[#DCE7D7] bg-white/70 px-4 py-3 dark:border-[#405B46] dark:bg-[#18251C]/70">

                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#E8EDE5] text-[#588157] dark:bg-[#34483A] dark:text-[#A3B18A]">
                          <CalendarDays size={21} />
                        </div>

                        <div>
                          <p className="text-xs text-[#89958A] dark:text-[#AAB8AC]">
                            Próxima renovação
                          </p>

                          <p className="mt-1 text-sm font-semibold text-[#273B31] dark:text-white">
                            {formatarData(assinatura?.data_fim || plano?.dataFim)}
                          </p>
                        </div>

                      </div>

                    </div>

                  </div>


                  {/* FORMA DE PAGAMENTO UTILIZADA */}
                  <div className="mt-5 flex items-center gap-3 rounded-xl border border-[#E8EDE5] bg-[#F8F9F6] p-4 dark:border-[#34483A] dark:bg-[#1C2920]">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-[#E8EDE5] text-[#588157] dark:bg-[#34483A] dark:text-[#A3B18A]">
                      {["cartao_credito", "cartao_debito"].includes(metodoUtilizado) ? (
                        <CreditCard size={21} />
                      ) : metodoUtilizado === "boleto" ? (
                        <Barcode size={21} />
                      ) : (
                        <QrCode size={21} />
                      )}
                    </div>

                    <div>
                      <p className="text-xs text-[#89958A] dark:text-[#AAB8AC]">
                        Forma de pagamento utilizada
                      </p>

                      <p className="mt-1 text-sm font-semibold">
                        {metodoUtilizado === "cartao_credito"
                          ? "Cartão de crédito"
                          : metodoUtilizado === "cartao_debito"
                          ? "Cartão de débito"
                          : metodoUtilizado === "boleto"
                          ? "Boleto bancário"
                          : metodoUtilizado === "pix"
                          ? "Pix"
                          : metodoUtilizado === "carteira_digital"
                          ? "Carteira digital"
                          : "Não informado"}
                      </p>
                    </div>
                  </div>


                  {/* AÇÕES DA ASSINATURA */}
                  <div className="mt-5 flex flex-wrap gap-3">
                    <button type="button" onClick={abrirModalPlano}
                      disabled={salvandoAssinatura || !!trocaPendente}
                      className="flex items-center gap-2 rounded-xl bg-[#344E41] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#3A5A40] disabled:cursor-not-allowed disabled:opacity-50 dark:bg-[#588157] dark:hover:bg-[#466B4B]">
                      <ArrowRightLeft size={17} /> Alterar plano
                    </button>
                    <button type="button" onClick={abrirModalPagamento}
                      className="flex items-center gap-2 rounded-xl border border-[#588157] px-5 py-3 text-sm font-semibold text-[#3A5A40] transition hover:bg-[#E8EDE5] dark:border-[#A3B18A] dark:text-[#A3B18A] dark:hover:bg-[#34483A]">
                      <CreditCard size={17} /> Alterar forma de pagamento
                    </button>
                  </div>

                  {trocaPendente && (
                    <div className="mt-5 rounded-xl border border-[#DAD7CD] p-4 dark:border-[#405B46]">
                      <p className="font-semibold">Troca pendente: {trocaPendente.nome_plano}</p>
                      <p className="mt-1 text-sm text-[#68776B] dark:text-[#B1BEB2]">Seu plano atual permanece ativo até a confirmação do pagamento.</p>
                      <div className="mt-3 flex flex-wrap gap-3">
                        {trocaPendente.gateway_url && (
                          <a href={trocaPendente.gateway_url} target="_blank" rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 rounded-lg bg-[#588157] px-4 py-2 text-sm font-semibold text-white hover:bg-[#466B4B]">
                            Abrir pagamento <ExternalLink size={15} />
                          </a>
                        )}
                        <button type="button" onClick={verificarPagamentoTroca} disabled={salvandoAssinatura}
                          className="inline-flex items-center gap-2 rounded-lg border border-[#DAD7CD] px-4 py-2 text-sm font-semibold disabled:opacity-50 dark:border-[#405B46]">
                          <RefreshCw size={15} /> {salvandoAssinatura ? "Verificando..." : "Verificar pagamento"}
                        </button>
                      </div>
                    </div>
                  )}
                  {avisoAssinatura && <p className="mt-4 text-sm font-medium text-[#3A5A40] dark:text-[#A3B18A]">{avisoAssinatura}</p>}
                  {erroAssinatura && <p className="mt-4 text-sm font-medium text-red-600 dark:text-red-400">{erroAssinatura}</p>}

                </div>
              </section>

              {/* RODAPÉ */}
              <div className="mt-10">
                <FooterPlataforma />
              </div>
            </>
          )}

        </div>
      </main>

      {/* ================================== */}
      {/* MODAL EDITAR PERFIL */}
      {/* ================================== */}

      {modalPerfil && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 px-4 py-6 backdrop-blur-sm"
          onClick={fecharModais}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-[500px] rounded-2xl border border-[#DAD7CD] bg-white p-6 shadow-2xl dark:border-[#405B46] dark:bg-[#1C2920] sm:p-7"
          >

            {/* CABEÇALHO */}
            <div className="mb-6 flex items-start justify-between">

              <div>
                <h2 className="text-xl font-bold text-[#273B31] dark:text-white">
                  Editar perfil
                </h2>

                <p className="mt-1 text-sm text-[#89958A] dark:text-[#AAB8AC]">
                  Atualize suas informações pessoais.
                </p>
              </div>

              <button
                type="button"
                onClick={fecharModais}
                disabled={salvando}
                className="rounded-lg p-2 text-[#89958A] transition hover:bg-[#F1F3EF] hover:text-[#273B31] dark:hover:bg-[#34483A] dark:hover:text-white"
              >
                <X size={20} />
              </button>

            </div>

            {/* FORMULÁRIO */}
            <form onSubmit={salvarPerfil} className="space-y-5">

              <div>
                <label className="mb-2 block text-sm font-semibold text-[#273B31] dark:text-[#E5EDE5]">
                  Nome completo
                </label>

                <input
                  type="text"
                  required
                  value={formPerfil.nome}
                  onChange={(e) =>
                    setFormPerfil({
                      ...formPerfil,
                      nome: e.target.value,
                    })
                  }
                  className="w-full rounded-xl border border-[#DAD7CD] bg-[#F8F9F6] px-4 py-3 text-sm text-[#273B31] outline-none transition focus:border-[#588157] focus:ring-2 focus:ring-[#588157]/20 dark:border-[#405B46] dark:bg-[#152019] dark:text-white"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-[#273B31] dark:text-[#E5EDE5]">
                  E-mail
                </label>

                <input
                  type="email"
                  required
                  value={formPerfil.email}
                  onChange={(e) =>
                    setFormPerfil({
                      ...formPerfil,
                      email: e.target.value,
                    })
                  }
                  className="w-full rounded-xl border border-[#DAD7CD] bg-[#F8F9F6] px-4 py-3 text-sm text-[#273B31] outline-none transition focus:border-[#588157] focus:ring-2 focus:ring-[#588157]/20 dark:border-[#405B46] dark:bg-[#152019] dark:text-white"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-[#273B31] dark:text-[#E5EDE5]">
                  Telefone pessoal
                </label>

                <input
                  type="tel"
                  value={formPerfil.telefone}
                  onChange={(e) =>
                    setFormPerfil({
                      ...formPerfil,
                      telefone: e.target.value,
                    })
                  }
                  placeholder="(11) 99999-9999"
                  className="w-full rounded-xl border border-[#DAD7CD] bg-[#F8F9F6] px-4 py-3 text-sm text-[#273B31] outline-none transition focus:border-[#588157] focus:ring-2 focus:ring-[#588157]/20 dark:border-[#405B46] dark:bg-[#152019] dark:text-white"
                />
              </div>

              {erroEdicao && (
                <p className="text-sm font-medium text-red-500">
                  {erroEdicao}
                </p>
              )}

              {/* BOTÕES */}
              <div className="flex flex-col-reverse gap-3 pt-3 sm:flex-row sm:justify-end">

                <button
                  type="button"
                  onClick={fecharModais}
                  disabled={salvando}
                  className="rounded-xl border border-[#DAD7CD] px-5 py-3 text-sm font-semibold text-[#68776B] transition hover:bg-[#F1F3EF] disabled:opacity-50 dark:border-[#405B46] dark:text-[#C2CDC3] dark:hover:bg-[#34483A]"
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  disabled={salvando}
                  className="flex items-center justify-center gap-2 rounded-xl bg-[#588157] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#466B4B] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <Save size={16} />
                  {salvando ? "Salvando..." : "Salvar alterações"}
                </button>

              </div>

            </form>

          </div>
        </div>
      )}

      {/* ================================== */}
      {/* MODAL ALTERAR SENHA */}
      {/* ================================== */}

      {modalSenha && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 px-4 py-6 backdrop-blur-sm"
          onClick={fecharModais}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-[500px] rounded-2xl border border-[#DAD7CD] bg-white p-6 shadow-2xl dark:border-[#405B46] dark:bg-[#1C2920] sm:p-7"
          >

            {/* CABEÇALHO */}
            <div className="mb-6 flex items-start justify-between">

              <div>
                <h2 className="text-xl font-bold text-[#273B31] dark:text-white">
                  Alterar senha
                </h2>

                <p className="mt-1 text-sm text-[#89958A] dark:text-[#AAB8AC]">
                  Atualize a senha de acesso à sua conta.
                </p>
              </div>

              <button
                type="button"
                onClick={fecharModais}
                disabled={salvando}
                className="rounded-lg p-2 text-[#89958A] transition hover:bg-[#F1F3EF] hover:text-[#273B31] dark:hover:bg-[#34483A] dark:hover:text-white"
              >
                <X size={20} />
              </button>

            </div>

            {/* FORMULÁRIO */}
            <form onSubmit={salvarSenha} className="space-y-5">
              <button
                type="button"
                onClick={() => setMostrarSenhas((valor) => !valor)}
                className="flex items-center gap-2 text-sm font-medium text-[#588157] hover:underline dark:text-[#A3B18A]"
                aria-pressed={mostrarSenhas}
              >
                {mostrarSenhas ? <EyeOff size={17} /> : <Eye size={17} />}
                {mostrarSenhas ? "Ocultar senhas" : "Mostrar senhas"}
              </button>

              <div>
                <label className="mb-2 block text-sm font-semibold text-[#273B31] dark:text-[#E5EDE5]">
                  Senha atual
                </label>

                <input
                  type={mostrarSenhas ? "text" : "password"}
                  required
                  value={formSenha.senhaAtual}
                  onChange={(e) => {
                    setFormSenha({
                      ...formSenha,
                      senhaAtual: e.target.value,
                    });
                    setErroSenha("");
                  }}
                  placeholder="Digite sua senha atual"
                  className="w-full rounded-xl border border-[#DAD7CD] bg-[#F8F9F6] px-4 py-3 text-sm outline-none transition focus:border-[#588157] focus:ring-2 focus:ring-[#588157]/20 dark:border-[#405B46] dark:bg-[#152019] dark:text-white"
                />
                
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-[#273B31] dark:text-[#E5EDE5]">
                  Nova senha
                </label>

                <input
                  type={mostrarSenhas ? "text" : "password"}
                  required
                  minLength={8}
                  value={formSenha.novaSenha}
                  onChange={(e) => {
                    setFormSenha({
                      ...formSenha,
                      novaSenha: e.target.value,
                    });
                    setErroSenha("");
                  }}
                  placeholder="Digite sua nova senha"
                  className="w-full rounded-xl border border-[#DAD7CD] bg-[#F8F9F6] px-4 py-3 text-sm outline-none transition focus:border-[#588157] focus:ring-2 focus:ring-[#588157]/20 dark:border-[#405B46] dark:bg-[#152019] dark:text-white"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-[#273B31] dark:text-[#E5EDE5]">
                  Confirmar nova senha
                </label>

                <input
                  type={mostrarSenhas ? "text" : "password"}
                  required
                  minLength={8}
                  value={formSenha.confirmarSenha}
                  onChange={(e) => {
                    setFormSenha({
                      ...formSenha,
                      confirmarSenha: e.target.value,
                    });
                    setErroSenha("");
                  }}
                  placeholder="Digite novamente sua nova senha"
                  className="w-full rounded-xl border border-[#DAD7CD] bg-[#F8F9F6] px-4 py-3 text-sm outline-none transition focus:border-[#588157] focus:ring-2 focus:ring-[#588157]/20 dark:border-[#405B46] dark:bg-[#152019] dark:text-white"
                />
              </div>

              <p className="text-xs text-[#68776B] dark:text-[#B1BEB2]">
                A nova senha deve ter pelo menos 8 caracteres e no máximo 72 bytes.
              </p>

              {erroSenha && (
                <p className="text-sm font-medium text-red-500">
                  {erroSenha}
                </p>
              )}

              {sucessoSenha && (
                <p className="flex items-center gap-2 text-sm font-medium text-emerald-600 dark:text-emerald-400">
                  <CircleCheck size={16} />
                  {sucessoSenha}
                </p>
              )}

              {/* BOTÕES */}
              <div className="flex flex-col-reverse gap-3 pt-3 sm:flex-row sm:justify-end">

                <button
                  type="button"
                  onClick={fecharModais}
                  disabled={salvando}
                  className="rounded-xl border border-[#DAD7CD] px-5 py-3 text-sm font-semibold text-[#68776B] transition hover:bg-[#F1F3EF] disabled:opacity-50 dark:border-[#405B46] dark:text-[#C2CDC3] dark:hover:bg-[#34483A]"
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  disabled={salvando}
                  className="flex items-center justify-center gap-2 rounded-xl bg-[#588157] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#466B4B] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <LockKeyhole size={16} />
                  {salvando ? "Atualizando..." : "Atualizar senha"}
                </button>

              </div>

            </form>

          </div>
        </div>
      )}

      {/* MODAL ALTERAR PLANO */}
      {modalPlano && (
        
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 px-4 py-6 backdrop-blur-sm" onClick={fecharModais}>
          <div onClick={(e) => e.stopPropagation()} className="max-h-[90vh] w-full max-w-[560px] overflow-y-auto rounded-2xl border border-[#DAD7CD] bg-white p-6 shadow-2xl dark:border-[#405B46] dark:bg-[#1C2920] sm:p-7">
            <div className="mb-5 flex items-start justify-between gap-4">
              <div><h2 className="text-xl font-bold">Alterar plano</h2><p className="mt-1 text-sm text-[#89958A] dark:text-[#AAB8AC]">O novo plano começa após a confirmação do pagamento.</p></div>
              <button type="button" onClick={fecharModais} disabled={salvandoAssinatura} aria-label="Fechar" className="rounded-lg p-2 hover:bg-[#F1F3EF] dark:hover:bg-[#34483A]"><X size={20} /></button>
            </div>
            <form onSubmit={solicitarNovoPlano} className="space-y-5">
              <div className="space-y-2">
                {planosDisponiveis.filter((item) => item.id !== assinatura?.plano_id).map((item) => (
                  <label key={item.id} className={`flex cursor-pointer items-center justify-between gap-3 rounded-xl border p-4 transition ${String(novoPlanoId) === String(item.id) ? "border-[#588157] bg-[#F1F6EF] dark:bg-[#1C3325]" : "border-[#DAD7CD] dark:border-[#405B46]"}`}>
                    <span><span className="block text-sm font-bold">{item.tipo}</span><span className="text-xs text-[#89958A] dark:text-[#AAB8AC]">{item.duracao_meses} {item.duracao_meses === 1 ? "mês" : "meses"} · R$ {Number(item.valor).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</span></span>
                    <input type="radio" name="novoPlano" value={item.id} checked={String(novoPlanoId) === String(item.id)} onChange={(e) => setNovoPlanoId(e.target.value)} className="accent-[#588157]" required />
                  </label>
                ))}
              </div>
              <div><label className="mb-2 block text-sm font-semibold">Forma de pagamento</label>
                <select value={metodoTroca} onChange={(e) => setMetodoTroca(e.target.value)} className="w-full rounded-xl border border-[#DAD7CD] bg-[#F8F9F6] px-4 py-3 text-sm outline-none dark:border-[#405B46] dark:bg-[#152019] dark:text-white">
                  <option value="" disabled>Selecione a forma de pagamento</option><option value="pix">Pix</option><option value="cartao_credito">Cartão de crédito</option><option value="boleto">Boleto</option>
                </select>
              </div>
              <p className="text-xs text-[#68776B] dark:text-[#B1BEB2]">O valor integral do novo plano será cobrado. O plano anterior só será cancelado após a confirmação do pagamento.</p>
              {erroAssinatura && <p className="text-sm text-red-600 dark:text-red-400">{erroAssinatura}</p>}
              <div className="flex justify-end gap-3"><button type="button" onClick={fecharModais} disabled={salvandoAssinatura} className="rounded-xl border border-[#DAD7CD] px-5 py-3 text-sm font-semibold dark:border-[#405B46]">Cancelar</button>
                <button type="submit" disabled={salvandoAssinatura || !novoPlanoId || !metodosValidos.includes(metodoTroca) || !!trocaPendente} className="rounded-xl bg-[#588157] px-5 py-3 text-sm font-semibold text-white hover:bg-[#466B4B] disabled:opacity-50">{salvandoAssinatura ? "Aguarde..." : "Continuar para pagamento"}</button></div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL ALTERAR FORMA DE PAGAMENTO */}
       {modalPagamento && (
         <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 px-4 py-6 backdrop-blur-sm" onClick={fecharModais}>
           <div onClick={(e) => e.stopPropagation()} className="max-h-[90vh] w-full max-w-[500px] overflow-y-auto rounded-2xl border border-[#DAD7CD] bg-white p-6 shadow-2xl dark:border-[#405B46] dark:bg-[#1C2920] sm:p-7">
             <div className="mb-6 flex items-start justify-between gap-4">
               <div>
                 <h2 className="text-xl font-bold text-[#273B31] dark:text-white">Alterar forma de pagamento</h2>
                 <p className="mt-1 text-sm text-[#89958A] dark:text-[#AAB8AC]">Escolha a preferência para as próximas cobranças.</p>
               </div>
               <button type="button" onClick={fecharModais} disabled={salvandoAssinatura} aria-label="Fechar" className="rounded-lg p-2 hover:bg-[#F1F3EF] disabled:opacity-50 dark:hover:bg-[#34483A]"><X size={20} /></button>
             </div>

             <form onSubmit={salvarMetodoPagamento} className="space-y-5">
               <div className="space-y-3">
                 {[
                   { valor: "pix", titulo: "Pix", descricao: "QR Code e Pix Copia e Cola na próxima cobrança.", Icone: QrCode },
                   { valor: "cartao_credito", titulo: "Cartão de crédito", descricao: "Pagamento seguro pelo Asaas, sem salvar dados do cartão na Visora.", Icone: CreditCard },
                   { valor: "boleto", titulo: "Boleto bancário", descricao: "Boleto com linha digitável e código de barras.", Icone: Barcode },
                 ].map(({ valor, titulo, descricao, Icone }) => (
                   <label key={valor} className={`flex cursor-pointer items-center gap-3 rounded-xl border p-4 transition ${metodoEdicao === valor ? "border-[#588157] bg-[#F1F6EF] dark:border-[#A3B18A] dark:bg-[#1C3325]" : "border-[#DAD7CD] hover:border-[#A3B18A] dark:border-[#405B46]"}`}>
                     <input type="radio" name="metodoPagamento" value={valor} checked={metodoEdicao === valor} onChange={() => setMetodoEdicao(valor)} disabled={salvandoAssinatura} className="accent-[#588157]" />
                     <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white text-[#588157] dark:bg-[#34483A] dark:text-[#A3B18A]"><Icone size={20} /></span>
                     <span className="min-w-0 flex-1">
                       <span className="block text-sm font-semibold">{titulo}</span>
                       <span className="mt-1 block text-xs leading-relaxed text-[#68776B] dark:text-[#B1BEB2]">{descricao}</span>
                     </span>
                     {metodoEdicao === valor && <CircleCheck size={19} className="shrink-0 text-[#588157] dark:text-[#A3B18A]" />}
                   </label>
                 ))}
               </div>

               <p className="text-xs leading-relaxed text-[#68776B] dark:text-[#B1BEB2]">Esta alteração vale para novas cobranças. Não altera pagamentos já emitidos nem gera uma cobrança agora.</p>
               {erroAssinatura && <p role="alert" className="text-sm text-red-600 dark:text-red-400">{erroAssinatura}</p>}
               <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
                 <button type="button" onClick={fecharModais} disabled={salvandoAssinatura} className="rounded-xl border border-[#DAD7CD] px-5 py-3 text-sm font-semibold disabled:opacity-50 dark:border-[#405B46]">Cancelar</button>
                 <button type="submit" disabled={salvandoAssinatura || !metodosValidos.includes(metodoEdicao) || metodoEdicao === metodoPreferido} className="flex items-center justify-center gap-2 rounded-xl bg-[#588157] px-5 py-3 text-sm font-semibold text-white hover:bg-[#466B4B] disabled:cursor-not-allowed disabled:opacity-50">
                   <Save size={16} /> {salvandoAssinatura ? "Salvando..." : "Salvar preferência"}
                 </button>
               </div>
             </form>
           </div>
         </div>
       )}

    </div>
  );
}


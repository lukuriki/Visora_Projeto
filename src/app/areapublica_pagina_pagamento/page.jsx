"use client";

import { Suspense, useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import {
  buscarPlanoPorId,
  cadastrarContratacao,
  confirmarPagamentoSimulado,
  consultarContratacao,
  urlReciboContratacao,
} from "@/lib/api";

const camposIniciais = {
  nomeCompleto: "",
  emailPessoal: "",
  telefonePessoal: "",
  nomeEmpresa: "",
  emailEmpresa: "",
  telefoneEmpresa: "",
  tipoDocumento: "CNPJ",
  documento: "",
  areaAtuacao: "",
  aceitouTermos: false,
};

const formasPagamento = [
  { nome: "Pix", valor: "pix" },
  { nome: "Cartão de crédito", valor: "cartao_credito" },
  { nome: "Boleto", valor: "boleto" },
];

const formatarMoeda = (valor) =>
  Number(valor).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

const formatarData = (valor) =>
  valor ? new Date(valor).toLocaleDateString("pt-BR") : "-";

function ConteudoPagamento() {
  const [etapaAtual, setEtapaAtual] = useState(1);
  const [dark, setDark] = useState(false);

  const searchParams = useSearchParams();
  const planoId = searchParams.get("planoId");

  const [plano, setPlano] = useState(null);
  const [carregandoPlano, setCarregandoPlano] = useState(true);
  const [erroPlano, setErroPlano] = useState("");

  const [dadosCadastro, setDadosCadastro] = useState(camposIniciais);
  const [formaPagamento, setFormaPagamento] = useState("");
  const [confirmacao, setConfirmacao] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [erroCadastro, setErroCadastro] = useState("");
  const [sucessoCadastro, setSucessoCadastro] = useState(false);

  // Resposta do back ao finalizar: { codigo, status, valor, pix, urlPagamento, modo }
  const [contratacao, setContratacao] = useState(null);
  const [resumoFinal, setResumoFinal] = useState(null); // preenchido quando o pagamento é aprovado
  const [copiado, setCopiado] = useState(false);
  const [simulando, setSimulando] = useState(false);

  const etapas = [
    "Plano Escolhido",
    "Dados Pessoais",
    "Dados da Empresa",
    "Forma de Pagamento",
    "Resumo da Compra",
    "Pagamento",
  ];

  useEffect(() => {
    const temaSalvo = localStorage.getItem("tema");
    const modoEscuro = temaSalvo === "dark";

    setDark(modoEscuro);
    document.documentElement.classList.toggle("dark", modoEscuro);
  }, []);

  // Enquanto o pagamento não for aprovado, pergunta ao back de 4 em 4 segundos.
  useEffect(() => {
    if (!contratacao?.codigo || resumoFinal) return;

    let ativo = true;

    async function verificar() {
      try {
        const resumo = await consultarContratacao(contratacao.codigo);
        if (ativo && resumo?.pagamento?.status === "aprovado") {
          setResumoFinal(resumo);
        }
      } catch {
        // falha momentânea de rede: tenta de novo no próximo ciclo
      }
    }

    verificar();
    const intervalo = setInterval(verificar, 4000);

    return () => {
      ativo = false;
      clearInterval(intervalo);
    };
  }, [contratacao?.codigo, resumoFinal]);

  useEffect(() => {
    async function carregarPlano() {
      if (!planoId) {
        setErroPlano("Nenhum plano foi selecionado.");
        setCarregandoPlano(false);
        return;
      }

      try {
        setCarregandoPlano(true);
        setErroPlano("");

        const dados = await buscarPlanoPorId(planoId);
        const planoEncontrado = dados?.plano ?? dados;

        if (!planoEncontrado?.id) {
          throw new Error("Plano não encontrado.");
        }

        setPlano(planoEncontrado);
      } catch (error) {
        setErroPlano(
          error.message || "Não foi possível carregar o plano."
        );
      } finally {
        setCarregandoPlano(false);
      }
    }

    carregarPlano();
  }, [planoId]);

  const nomePlano =
    plano?.tipo ??
    plano?.nome ??
    plano?.nome_plano ??
    plano?.titulo ??
    "Plano selecionado";

  const precoPlano =
    plano?.valor ?? plano?.preco ?? plano?.preco_mensal;

  const precoFormatado =
    precoPlano !== undefined &&
    precoPlano !== null &&
    precoPlano !== "" &&
    !Number.isNaN(Number(precoPlano))
      ? Number(precoPlano).toLocaleString("pt-BR", {
          style: "currency",
          currency: "BRL",
        })
      : "Preço não informado";

  function alternarTema() {
    const novoTema = !dark;

    setDark(novoTema);
    document.documentElement.classList.toggle("dark", novoTema);
    localStorage.setItem("tema", novoTema ? "dark" : "light");
  }

  function atualizarCampo(event) {
    const { name, value, type, checked } = event.target;

    setDadosCadastro((dados) => ({
      ...dados,
      [name]: type === "checkbox" ? checked : value,
    }));
  }

  function validarEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  function validarEtapa() {
    setErroCadastro("");

    if (etapaAtual === 2) {
      const { nomeCompleto, emailPessoal, telefonePessoal } =
        dadosCadastro;

      if (!nomeCompleto.trim() || !emailPessoal.trim() ||
          !telefonePessoal.trim()) {
        setErroCadastro("Preencha todos os dados pessoais.");
        return false;
      }

      if (!validarEmail(emailPessoal)) {
        setErroCadastro("Informe um e-mail pessoal válido.");
        return false;
      }
    }

    if (etapaAtual === 3) {
      const {
        nomeEmpresa,
        emailEmpresa,
        telefoneEmpresa,
        tipoDocumento,
        documento,
        areaAtuacao,
        aceitouTermos,
      } = dadosCadastro;

      if (
        !nomeEmpresa.trim() ||
        !emailEmpresa.trim() ||
        !telefoneEmpresa.trim() ||
        !documento.trim() ||
        !areaAtuacao.trim()
      ) {
        setErroCadastro("Preencha todos os dados da empresa.");
        return false;
      }

      if (!validarEmail(emailEmpresa)) {
        setErroCadastro("Informe um e-mail empresarial válido.");
        return false;
      }

      if (!["CNPJ", "CPF"].includes(tipoDocumento)) {
        setErroCadastro("Selecione CPF ou CNPJ.");
        return false;
      }

      if (!aceitouTermos) {
        setErroCadastro("Aceite os termos para continuar.");
        return false;
      }
    }

    if (etapaAtual === 4 && !formaPagamento) {
      setErroCadastro("Selecione uma forma de pagamento.");
      return false;
    }

    if (etapaAtual === 5 && !confirmacao) {
      setErroCadastro("Confirme que revisou os dados.");
      return false;
    }

    return true;
  }

  function avancarEtapa() {
    if (!validarEtapa()) return;

    setEtapaAtual((atual) => Math.min(6, atual + 1));
  }

  function voltarEtapa() {
    setErroCadastro("");
    setEtapaAtual((atual) => Math.max(1, atual - 1));
  }

  async function enviarContratacao() {
    if (!validarEtapa()) return;

    if (!plano?.id) {
      setErroCadastro("O plano selecionado não é válido.");
      return;
    }

    setEnviando(true);
    setErroCadastro("");

    try {
      const resposta = await cadastrarContratacao({
        ...dadosCadastro,
        planoId: Number(plano.id),
        formaPagamento,
      });

      setContratacao(resposta);
      setSucessoCadastro(true);
      setEtapaAtual(6);
    } catch (error) {
      setErroCadastro(
        error.message ||
          "Não foi possível enviar a solicitação. Tente novamente."
      );
    } finally {
      setEnviando(false);
    }
  }

  async function copiarCodigoPix() {
    try {
      await navigator.clipboard.writeText(contratacao.pix.copiaECola);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2000);
    } catch {
      setErroCadastro("Não foi possível copiar. Selecione o código e copie manualmente.");
    }
  }

  async function simularPagamento() {
    setSimulando(true);
    setErroCadastro("");

    try {
      setResumoFinal(await confirmarPagamentoSimulado(contratacao.codigo));
    } catch (error) {
      setErroCadastro(error.message || "Não foi possível simular o pagamento.");
    } finally {
      setSimulando(false);
    }
  }

  const classeInput =
    "w-full rounded-lg border border-[#A3B18A] bg-[#F2F2F2] p-3 text-[#273B31] outline-none placeholder:text-[#6B7569] focus:border-[#588157] focus:ring-2 focus:ring-[#588157]/20 dark:bg-[#1F2923] dark:text-[#F2F2F2]";

  const classeLabel = "mb-1 block font-medium";

  if (carregandoPlano) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F2F2F2] p-6 text-[#273B31] dark:bg-[#1F2923] dark:text-[#F2F2F2]">
        Carregando plano...
      </div>
    );
  }

  if (erroPlano || !plano) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-[#F2F2F2] p-6 text-center text-[#273B31] dark:bg-[#1F2923] dark:text-[#F2F2F2]">
        <p>{erroPlano || "Plano não encontrado."}</p>
        <button
          onClick={() => window.history.back()}
          className="rounded-lg bg-[#588157] px-5 py-2 text-white hover:bg-[#3A5A40]"
        >
          Voltar para os planos
        </button>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[#F2F2F2] p-5 text-[#273B31] dark:bg-[#1F2923] dark:text-[#F2F2F2] sm:p-10">
      {/* ETAPAS */}
      <div className="flex flex-wrap items-start justify-center gap-y-5">
        {etapas.map((etapa, index) => {
          const numero = index + 1;
          const atual = etapaAtual === numero;
          const concluida = etapaAtual > numero;

          return (
            <div key={numero} className="flex items-start text-[#A3B18A]">
              <div className="flex flex-col items-center">
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-full border-2 font-semibold transition-all ${
                    atual
                      ? "scale-110 border-[#588157] bg-[#588157] text-white shadow-lg"
                      : concluida
                        ? "border-[#588157] bg-[#588157] text-white"
                        : "border-[#A3B18A] text-[#588157]"
                  }`}
                >
                  {concluida ? "✓" : numero}
                </div>

                <span
                  className={`mt-2 max-w-24 text-center text-xs sm:text-sm ${
                    atual || concluida
                      ? "font-semibold text-[#588157]"
                      : "text-[#6B7569] dark:text-[#BFC4AC]"
                  }`}
                >
                  {etapa}
                </span>
              </div>

              {index < etapas.length - 1 && (
                <div className="relative mx-2 mt-5 hidden h-[2px] w-8 overflow-hidden bg-[#DAD7CD] sm:block md:w-12 lg:w-16">
                  <div
                    className={`absolute left-0 top-0 h-full bg-[#588157] transition-all ${
                      etapaAtual > numero ? "w-full" : "w-0"
                    }`}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* TEMA */}
      <div className="mt-8 flex justify-end">
        <button
          onClick={alternarTema}
          className="rounded-lg border border-[#A3B18A] bg-white px-4 py-2 text-[#273B31] hover:bg-[#DAD7CD] dark:bg-[#273B31] dark:text-white"
        >
          {dark ? "☀️ Light Mode" : "🌙 Dark Mode"}
        </button>
      </div>

      <div className="mx-auto mt-8 max-w-3xl rounded-xl border border-[#A3B18A] bg-white p-5 shadow-sm dark:bg-[#273B31] dark:text-[#F2F2F2] sm:p-8">
        {/* ETAPA 1 */}
        {etapaAtual === 1 && (
          <section>
            <h1 className="text-2xl font-bold">Plano escolhido</h1>
            <p className="mt-2 text-[#6B7569] dark:text-[#BFC4AC]">
              Confira o plano que deseja contratar.
            </p>

            <div className="mt-6 rounded-3xl bg-gradient-to-br from-[#588157] via-[#3A5A40] to-[#273B31] p-5 text-white sm:p-6">
              <span className="rounded-full border border-white/20 bg-white/15 px-3 py-1 text-sm">
                Plano selecionado
              </span>

              <h2 className="mt-4 text-3xl font-bold">{nomePlano}</h2>

              <p className="mt-2 text-white/75">
                A solução para gerenciar sua empresa de forma simples e eficiente.
              </p>

              <div className="mt-7 rounded-2xl bg-[#F2F2F2] p-5 text-[#273B31]">
                <p className="text-sm font-medium text-[#3A5A40]">
                  Investimento mensal
                </p>
                <p className="mt-1 text-3xl font-bold">{precoFormatado}</p>
                <p className="mt-2 text-sm text-[#588157]">
                  Cobrança mensal, conforme as condições do plano.
                </p>
              </div>

              <h3 className="mt-7 text-xl font-semibold">O que está incluso:</h3>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {[
                  "Acesso à plataforma",
                  "Gestão de materiais",
                  "Indicadores e relatórios",
                  "Controle de estoque",
                  "Suporte especializado",
                  "Atualizações da plataforma",
                ].map((beneficio) => (
                  <div key={beneficio} className="rounded-xl bg-white/10 p-3">
                    ✓ {beneficio}
                  </div>
                ))}
              </div>

              <p className="mt-7 rounded-xl bg-white/10 p-4 text-sm">
                A cobrança real depende da integração com um serviço de pagamento.
              </p>
            </div>
          </section>
        )}

        {/* ETAPA 2 */}
        {etapaAtual === 2 && (
          <section>
            <h1 className="text-2xl font-bold">Dados pessoais</h1>
            <p className="mt-2 text-[#6B7569] dark:text-[#BFC4AC]">
              Informe seus dados pessoais.
            </p>

            <div className="mt-6 space-y-4">
              <div>
                <label className={classeLabel}>Nome completo</label>
                <input
                  name="nomeCompleto"
                  value={dadosCadastro.nomeCompleto}
                  onChange={atualizarCampo}
                  autoComplete="name"
                  placeholder="Digite seu nome"
                  className={classeInput}
                />
              </div>

              <div>
                <label className={classeLabel}>E-mail pessoal</label>
                <input
                  type="email"
                  name="emailPessoal"
                  value={dadosCadastro.emailPessoal}
                  onChange={atualizarCampo}
                  autoComplete="email"
                  placeholder="seuemail@email.com"
                  className={classeInput}
                />
              </div>

              <div>
                <label className={classeLabel}>Telefone pessoal</label>
                <input
                  type="tel"
                  name="telefonePessoal"
                  value={dadosCadastro.telefonePessoal}
                  onChange={atualizarCampo}
                  autoComplete="tel"
                  placeholder="(00) 00000-0000"
                  className={classeInput}
                />
              </div>
            </div>
          </section>
        )}

        {/* ETAPA 3 */}
        {etapaAtual === 3 && (
          <section>
            <h1 className="text-2xl font-bold">Dados da empresa</h1>
            <p className="mt-2 text-[#6B7569] dark:text-[#BFC4AC]">
              Informe os dados da empresa.
            </p>

            <div className="mt-6 space-y-4">
              <div>
                <label className={classeLabel}>Nome da empresa</label>
                <input
                  name="nomeEmpresa"
                  value={dadosCadastro.nomeEmpresa}
                  onChange={atualizarCampo}
                  autoComplete="organization"
                  placeholder="Digite o nome da empresa"
                  className={classeInput}
                />
              </div>

              <div>
                <label className={classeLabel}>E-mail da empresa</label>
                <input
                  type="email"
                  name="emailEmpresa"
                  value={dadosCadastro.emailEmpresa}
                  onChange={atualizarCampo}
                  placeholder="empresa@email.com"
                  className={classeInput}
                />
              </div>

              <div>
                <label className={classeLabel}>Telefone da empresa</label>
                <input
                  type="tel"
                  name="telefoneEmpresa"
                  value={dadosCadastro.telefoneEmpresa}
                  onChange={atualizarCampo}
                  placeholder="(00) 0000-0000"
                  className={classeInput}
                />
              </div>

              <div>
                <label className={classeLabel}>Tipo de documento</label>
                <select
                  name="tipoDocumento"
                  value={dadosCadastro.tipoDocumento}
                  onChange={atualizarCampo}
                  className={classeInput}
                >
                  <option value="CNPJ">CNPJ</option>
                  <option value="CPF">CPF</option>
                </select>
              </div>

              <div>
                <label className={classeLabel}>CNPJ ou CPF</label>
                <input
                  name="documento"
                  value={dadosCadastro.documento}
                  onChange={atualizarCampo}
                  placeholder="Digite o documento"
                  className={classeInput}
                />
              </div>

              <div>
                <label className={classeLabel}>Área de atuação</label>
                <select name="areaAtuacao" value={dadosCadastro.areaAtuacao} onChange={atualizarCampo} className={classeInput}>

                  <option value="">Selecione...</option> 
                  <option value="Comércio">Comércio</option> 
                  <option value="Serviços">Serviços</option> 
                  <option value="Indústria">Indústria</option> 
                  <option value="Tecnologia">Tecnologia</option> 
                  <option value="Varejo">Varejo</option> 
                  <option value="Saúde">Saúde</option> 
                  <option value="Outros">Outros</option> 
                </select>
              </div>

              <label className="flex items-start gap-3 text-sm">
                <input
                  type="checkbox"
                  name="aceitouTermos"
                  checked={dadosCadastro.aceitouTermos}
                  onChange={atualizarCampo}
                  className="mt-1 accent-[#588157]"
                />
                <span>
                  Declaro que li e aceito os Termos de Uso e a Política de Privacidade.
                </span>
              </label>
            </div>
          </section>
        )}

        {/* ETAPA 4 */}
        {etapaAtual === 4 && (
          <section>
            <h1 className="text-2xl font-bold">Forma de pagamento</h1>
            <p className="mt-2 text-[#6B7569] dark:text-[#BFC4AC]">
              Escolha como deseja realizar o pagamento.
            </p>

            <div className="mt-6 space-y-4">
              {formasPagamento.map((forma) => (
                <label
                  key={forma.valor}
                  className={`flex cursor-pointer items-center gap-3 rounded-lg border p-4 transition hover:border-[#588157] ${
                    formaPagamento === forma.valor
                      ? "border-[#588157] bg-[#588157]/10"
                      : "border-[#A3B18A] bg-white dark:bg-[#273B31]"
                  }`}
                >
                  <input
                    type="radio"
                    name="pagamento"
                    value={forma.valor}
                    checked={formaPagamento === forma.valor}
                    onChange={() => setFormaPagamento(forma.valor)}
                    className="accent-[#588157]"
                  />
                  <span>{forma.nome}</span>
                </label>
              ))}
            </div>
          </section>
        )}

        {/* ETAPA 5 */}
        {etapaAtual === 5 && (
          <section>
            <h1 className="text-2xl font-bold">Resumo da compra</h1>
            <p className="mt-2 text-[#6B7569] dark:text-[#BFC4AC]">
              Confira as informações antes de finalizar a compra.
            </p>

            <div className="mt-6 space-y-4">
              {[
                ["Plano", nomePlano],
                ["Valor mensal", `${precoFormatado} / mês`],
                ["Nome", dadosCadastro.nomeCompleto],
                ["E-mail pessoal", dadosCadastro.emailPessoal],
                ["Empresa", dadosCadastro.nomeEmpresa],
                ["E-mail empresarial", dadosCadastro.emailEmpresa],
                ["Documento", `${dadosCadastro.tipoDocumento}: ${dadosCadastro.documento}`],
                [
                  "Forma de pagamento",
                  formasPagamento.find((forma) => forma.valor === formaPagamento)?.nome || "",
                ],
              ].map(([titulo, valor]) => (
                <div key={titulo} className="rounded-lg bg-[#E6E5E0] p-4 dark:bg-[#344E41]">
                  <p className="text-sm text-[#6B7569] dark:text-[#BFC4AC]">
                    {titulo}
                  </p>
                  <p className="font-semibold">{valor}</p>
                </div>
              ))}

              <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-[#A3B18A] p-4 text-sm">
                <input
                  type="checkbox"
                  checked={confirmacao}
                  onChange={(event) => setConfirmacao(event.target.checked)}
                  className="mt-1 accent-[#588157]"
                />
                <span>
                  Confirmo que revisei os dados da contratação.
                </span>
              </label>

              <p className="text-sm text-[#6B7569] dark:text-[#BFC4AC]">
                Ao finalizar, mostraremos como pagar. Sua conta é liberada assim que o pagamento for confirmado.
              </p>
            </div>
          </section>
        )}

        {/* ETAPA 6 */}
        {etapaAtual === 6 && contratacao && (
          <section className="text-center">
            {resumoFinal ? (
              <>
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#588157] text-3xl text-white">
                  ✓
                </div>

                <h1 className="mt-5 text-2xl font-bold">Pagamento confirmado!</h1>

                <p className="mt-3 text-[#6B7569] dark:text-[#BFC4AC]">
                  Enviamos um e-mail para <strong>{resumoFinal.usuario.email}</strong>{" "}
                  com o seu nome de usuário e o link para criar a senha e ativar a
                  conta. O link vale por 48 horas.
                </p>

                <div className="mt-6 rounded-lg bg-[#E6E5E0] p-5 text-left dark:bg-[#344E41]">
                  <p className="font-semibold">Resumo da compra</p>
                  <p className="mt-3 text-sm">Plano: {resumoFinal.plano.tipo}</p>
                  <p className="mt-2 text-sm">
                    Valor pago: {formatarMoeda(resumoFinal.pagamento.valor)}
                  </p>
                  <p className="mt-2 text-sm">
                    Forma de pagamento:{" "}
                    {formasPagamento.find((forma) => forma.valor === resumoFinal.pagamento.metodo)?.nome ??
                      resumoFinal.pagamento.metodo}
                  </p>
                  <p className="mt-2 text-sm">
                    Vigência: {formatarData(resumoFinal.assinatura.dataInicio)} a{" "}
                    {formatarData(resumoFinal.assinatura.dataFim)}
                  </p>
                  <p className="mt-2 break-all text-sm">
                    Código da transação: {resumoFinal.pagamento.codigo}
                  </p>
                </div>

                <a
                  href={urlReciboContratacao(contratacao.codigo)}
                  className="mt-6 inline-block rounded-lg bg-[#588157] px-5 py-2 text-white hover:bg-[#3A5A40]"
                >
                  Baixar recibo (PDF)
                </a>

                <p className="mt-4 text-sm text-[#6B7569] dark:text-[#BFC4AC]">
                  Não recebeu o e-mail? Confira a caixa de spam.
                </p>
              </>
            ) : (
              <>
                <h1 className="text-2xl font-bold">Aguardando pagamento</h1>

                <p className="mt-3 text-[#6B7569] dark:text-[#BFC4AC]">
                  Valor: <strong>{formatarMoeda(contratacao.valor)}</strong>. Esta
                  página atualiza sozinha assim que o pagamento for confirmado.
                </p>

                {contratacao.pix && (
                  <div className="mt-6 rounded-lg bg-[#E6E5E0] p-5 dark:bg-[#344E41]">
                    <p className="font-semibold">Pague com Pix</p>

                    {contratacao.pix.qrCodeBase64 && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={`data:image/png;base64,${contratacao.pix.qrCodeBase64}`}
                        alt="QR Code do Pix"
                        className="mx-auto mt-4 h-56 w-56 rounded-lg bg-white p-2"
                      />
                    )}

                    <p className="mt-4 text-sm text-[#6B7569] dark:text-[#BFC4AC]">
                      Ou copie o código Pix:
                    </p>

                    <textarea
                      readOnly
                      value={contratacao.pix.copiaECola}
                      rows={3}
                      onFocus={(event) => event.target.select()}
                      className={`${classeInput} mt-2 text-xs`}
                    />

                    <button
                      type="button"
                      onClick={copiarCodigoPix}
                      className="mt-3 rounded-lg bg-[#588157] px-5 py-2 text-white hover:bg-[#3A5A40]"
                    >
                      {copiado ? "Copiado!" : "Copiar código Pix"}
                    </button>
                  </div>
                )}

                {contratacao.urlPagamento && (
                  <a
                    href={contratacao.urlPagamento}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-6 inline-block rounded-lg bg-[#588157] px-5 py-2 text-white hover:bg-[#3A5A40]"
                  >
                    {contratacao.metodo === "boleto"
                      ? "Ver boleto"
                      : contratacao.metodo === "pix"
                        ? "Abrir fatura"
                        : "Pagar com cartão"}
                  </a>
                )}

                {contratacao.modo === "simulado" && (
                  <div className="mt-6 rounded-lg border border-dashed border-[#A3B18A] p-4">
                    <p className="text-sm text-[#6B7569] dark:text-[#BFC4AC]">
                      Modo de demonstração: nenhum pagamento real é processado.
                    </p>
                    <button
                      type="button"
                      onClick={simularPagamento}
                      disabled={simulando}
                      className="mt-3 rounded-lg bg-[#588157] px-5 py-2 text-white hover:bg-[#3A5A40] disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {simulando ? "Simulando..." : "Simular pagamento"}
                    </button>
                  </div>
                )}

                <p className="mt-6 animate-pulse text-sm text-[#6B7569] dark:text-[#BFC4AC]">
                  Verificando pagamento...
                </p>
              </>
            )}
          </section>
        )}

        {/* ERROS */}
        {erroCadastro && (
          <p
            role="alert"
            className="mt-6 rounded-lg border border-red-300 bg-red-50 p-3 text-sm text-red-700"
          >
            {erroCadastro}
          </p>
        )}
      </div>

      {/* NAVEGAÇÃO */}
      <div className="mt-8 flex flex-wrap justify-center gap-4">
        <button
          onClick={voltarEtapa}
          disabled={etapaAtual === 1 || enviando || sucessoCadastro}
          className="rounded-lg bg-[#E6E5E0] px-5 py-2 transition hover:bg-[#DAD7CD] disabled:cursor-not-allowed disabled:opacity-40 dark:bg-[#344E41]"
        >
          Voltar
        </button>

        {etapaAtual < 5 && (
          <button
            onClick={avancarEtapa}
            className="rounded-lg bg-[#588157] px-5 py-2 text-white transition hover:bg-[#3A5A40]"
          >
            Continuar
          </button>
        )}

        {etapaAtual === 5 && (
          <button
            onClick={enviarContratacao}
            disabled={enviando || sucessoCadastro}
            className="rounded-lg bg-[#588157] px-5 py-2 text-white transition hover:bg-[#3A5A40] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {enviando ? "Processando..." : "Finalizar compra"}
          </button>
        )}

        {etapaAtual === 6 && (
          <button
            onClick={() => {
              window.location.href = "/areapublica_pagina_planos";
            }}
            className="rounded-lg bg-[#588157] px-5 py-2 text-white hover:bg-[#3A5A40]"
          >
            Voltar aos planos
          </button>
        )}
      </div>
    </main>
  );
}

export default function PaginaPagamento() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-[#F2F2F2] p-6 text-[#273B31] dark:bg-[#1F2923] dark:text-[#F2F2F2]">
          Carregando...
        </div>
      }
    >
      <ConteudoPagamento />
    </Suspense>
  );
}
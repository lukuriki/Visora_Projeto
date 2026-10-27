"use client";

import { useState, useEffect } from "react";

export default function PaginaPagamento() {
  const [etapaAtual, setEtapaAtual] = useState(1);
  const [dark, setDark] = useState(false);

  useEffect(() => {
    const temaSalvo = localStorage.getItem("tema");
    const modoEscuro = temaSalvo === "dark";

    setDark(modoEscuro);
    document.documentElement.classList.toggle("dark", modoEscuro);
  }, []);

  function alternarTema() {
    const novoTema = !dark;

    setDark(novoTema);
    document.documentElement.classList.toggle("dark", novoTema);
    localStorage.setItem("tema", novoTema ? "dark" : "light");
  }

  const etapas = [
    "Plano Escolhido",
    "Dados Pessoais",
    "Dados da Empresa",
    "Forma de Pagamento",
    "Resumo da Compra",
    "Pagamento Concluido",
  ];

  return (<>
    <div className="min-h-screen bg-[#F2F2F2] p-10 text-[#273B31] dark:bg-[#1F2923] dark:text-[#F2F2F2]">

      {/* ETAPAS */}
      <div className="flex flex-wrap items-center justify-center">
        {etapas.map((etapa, index) => {
          const numero = index + 1;
          const atual = etapaAtual === numero;
          const concluida = etapaAtual > numero;

          return (
            <div key={numero} className="flex items-center text-[#A3B18A]">

              <div className="flex flex-col items-center">

                <div className={`flex h-10 w-10 items-center justify-center rounded-full border-2 font-semibold transition-all duration-500 ease-in-out ${atual ? "border-[#588157] bg-[#588157] text-white scale-110 shadow-lg shadow-[#588157]/30" : concluida ? "border-[#588157] bg-[#588157] text-white" : "border-[#A3B18A] text-[#588157]"}`}>
                  {concluida ? "✓" : numero}
                </div>

                <span className={`mt-2 text-sm whitespace-nowrap transition-all duration-500 ${atual ? "font-semibold text-[#588157] scale-105" : concluida ? "text-[#588157]" : "text-[#6B7569] dark:text-[#BFC4AC]"}`}>
                  {etapa}
                </span>

              </div>

              {index < etapas.length - 1 && (
                <div className="relative mx-3 h-[2px] w-16 bg-[#DAD7CD] overflow-hidden">
                  <div className={`absolute left-0 top-0 h-full bg-[#588157] transition-all duration-700 ease-in-out ${etapaAtual > numero ? "w-full" : "w-0"}`}/>
                </div>
              )}
            </div>
          );
        })}
      </div>

      
      
<button
  onClick={alternarTema}
  className="mb-4 rounded-lg border border-[#A3B18A] bg-white dark:bg-[#273B31] px-4 py-2 text-[#273B31] dark:text-[#F2F2F2] transition-colors hover:bg-[#DAD7CD] dark:hover:bg-[#3A5A40]"
>
  {dark ? "☀️ Light Mode" : "🌙 Dark Mode"}
</button>

      

      <div className="mx-auto mt-12 max-w-3xl rounded-xl border border-[#A3B18A] bg-white dark:bg-[#273B31] p-8 text-[#273B31] dark:text-[#F2F2F2] shadow-sm">

        {/* ETAPA 1 */}
        {etapaAtual === 1 && (
          <div>
            <h1 className="text-2xl font-bold">Plano escolhido</h1>
            <p className="mt-2 text-[#6B7569] dark:text-[#BFC4AC]">Confira o plano que você deseja contratar.</p>

            <div className="mt-6 overflow-hidden rounded-3xl border border-[#A3B18A]/40 bg-gradient-to-br from-[#588157] via-[#3A5A40] to-[#273B31] p-6 shadow-2xl">

              {/* Cabeçalho */}
              <div className="flex items-start justify-between gap-6">

                <div>
                  <span className="inline-flex rounded-full border border-white/20 bg-white/15 px-3 py-1 text-sm font-semibold text-white backdrop-blur-sm">
                    Plano selecionado
                  </span>

                  <h2 className="mt-4 text-3xl font-bold text-white">
                    Plano Premium
                  </h2>

                  <p className="mt-2 max-w-xl text-white/75">
                    A solução completa para gerenciar sua empresa
                    de forma simples e eficiente.
                  </p>
                </div>
              </div>


              {/* Preço */}
              <div className="mt-7 rounded-2xl border border-white/20 bg-gradient-to-br from-[#F2F2F2] to-[#DAD7CD] p-5 shadow-lg">

                <p className="text-sm font-medium text-[#3A5A40]">
                  Investimento mensal
                </p>

                <div className="mt-1 flex items-end gap-2">
                  <span className="text-4xl font-bold text-[#273B31]">
                    R$ 99,90
                  </span>

                  <span className="mb-1 text-sm text-[#3A5A40]">
                    / mês
                  </span>
                </div>

                <p className="mt-2 text-sm text-[#588157]">
                  Cobrança mensal • Cancele quando quiser
                </p>

              </div>


              {/* Benefícios */}
              <div className="mt-7">

                <h3 className="text-xl font-semibold text-white">
                  O que está incluso:
                </h3>

                <div className="mt-4 grid gap-3 sm:grid-cols-2">

                  {[
                    "Acesso completo à plataforma",
                    "Gestão de materiais",
                    "Indicadores e relatórios",
                    "Controle de estoque",
                    "Suporte especializado",
                    "Atualizações da plataforma",
                  ].map((beneficio) => (
                    <div
                      key={beneficio}
                      className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/10 p-3 backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:bg-white/15"
                    >
                      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#BFC4AC] to-[#7E9971] font-bold text-[#273B31] shadow-md">
                        ✓
                      </span>

                      <span className="text-sm text-white/90">
                        {beneficio}
                      </span>
                    </div>
                  ))}

                </div>

              </div>


              {/* Atenção */}
              <div className="mt-7 rounded-2xl border border-[#BFC4AC]/40 bg-gradient-to-r from-[#DAD7CD] via-[#E6E5E0] to-[#BFC4AC] p-4 shadow-lg">

                <div className="flex gap-3">

                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#3A5A40] text-lg">
                    ⚠️
                  </div>

                  <div>
                    <h3 className="font-semibold text-[#273B31]">
                      Atenção antes de continuar
                    </h3>

                    <p className="mt-1 text-sm leading-relaxed text-[#344E41]">
                      Confira se este é o plano que você deseja contratar.
                      O valor será cobrado mensalmente conforme a forma
                      de pagamento escolhida.
                    </p>
                  </div>

                </div>

              </div>


              {/* Informações */}
              <div className="mt-7 border-t border-white/20 pt-5">

                <h3 className="font-semibold text-white">
                  Informações do plano
                </h3>

                <div className="mt-4 grid gap-3 sm:grid-cols-3">

                  <div className="rounded-xl bg-white/10 p-3 backdrop-blur-sm">
                    <p className="text-xs text-white/60">
                      Periodicidade
                    </p>
                    <p className="mt-1 font-semibold text-white">
                      Mensal
                    </p>
                  </div>

                  <div className="rounded-xl bg-white/10 p-3 backdrop-blur-sm">
                    <p className="text-xs text-white/60">
                      Valor
                    </p>
                    <p className="mt-1 font-semibold text-white">
                      R$ 99,90
                    </p>
                  </div>

                  <div className="rounded-xl bg-white/10 p-3 backdrop-blur-sm">
                    <p className="text-xs text-white/60">
                      Suporte
                    </p>
                    <p className="mt-1 font-semibold text-white">
                      Incluso
                    </p>
                  </div>

                </div>

              </div>

            </div>




          </div>
        )}


        {/* ETAPA 2 */}
        {etapaAtual === 2 && (
          <div>
            <h1 className="text-2xl font-bold">
              Dados pessoais
            </h1>

            <p className="mt-2 text-[#6B7569] dark:text-[#BFC4AC]">
              Informe seus dados pessoais.
            </p>

            <div className="mt-6 space-y-4">

              <div>
                <label className="mb-1 block font-medium">
                  Nome completo
                </label>

                <input
                  type="text"
                  placeholder="Digite seu nome"
                  className="w-full rounded-lg border border-[#A3B18A] bg-[#F2F2F2] dark:bg-[#1F2923] p-3 text-[#273B31] dark:text-[#F2F2F2] outline-none placeholder:text-[#6B7569] dark:text-[#BFC4AC] focus:border-[#588157] focus:ring-2 focus:ring-[#588157]/20"
                />
              </div>

              <div>
                <label className="mb-1 block font-medium">
                  E-mail pessoal
                </label>

                <input
                  type="email"
                  placeholder="seuemail@email.com"
                  className="w-full rounded-lg border border-[#A3B18A] bg-[#F2F2F2] dark:bg-[#1F2923] p-3 text-[#273B31] dark:text-[#F2F2F2] outline-none placeholder:text-[#6B7569] dark:text-[#BFC4AC] focus:border-[#588157] focus:ring-2 focus:ring-[#588157]/20"
                />
              </div>

              <div>
                <label className="mb-1 block font-medium">
                  Telefone pessoal
                </label>

                <input
                  type="tel"
                  placeholder="(00) 00000-0000"
                  className="w-full rounded-lg border border-[#A3B18A] bg-[#F2F2F2] dark:bg-[#1F2923] p-3 text-[#273B31] dark:text-[#F2F2F2] outline-none placeholder:text-[#6B7569] dark:text-[#BFC4AC] focus:border-[#588157] focus:ring-2 focus:ring-[#588157]/20"
                />
              </div>

            </div>
          </div>
        )}


        {/* ETAPA 3 */}
        {etapaAtual === 3 && (
          <div>
            <h1 className="text-2xl font-bold">
              Dados da empresa
            </h1>

            <p className="mt-2 text-[#6B7569] dark:text-[#BFC4AC]">
              Informe os dados da empresa.
            </p>

            <div className="mt-6 space-y-4">

              <div>
                <label className="mb-1 block font-medium">
                  Nome da empresa
                </label>

                <input
                  type="text"
                  placeholder="Digite o nome da empresa"
                  className="w-full rounded-lg border border-[#A3B18A] bg-[#F2F2F2] dark:bg-[#1F2923] p-3 text-[#273B31] dark:text-[#F2F2F2] outline-none placeholder:text-[#6B7569] dark:text-[#BFC4AC] focus:border-[#588157] focus:ring-2 focus:ring-[#588157]/20"
                />
              </div>

              <div>
                <label className="mb-1 block font-medium">
                  E-mail da empresa
                </label>

                <input
                  type="email"
                  placeholder="empresa@email.com"
                  className="w-full rounded-lg border border-[#A3B18A] bg-[#F2F2F2] dark:bg-[#1F2923] p-3 text-[#273B31] dark:text-[#F2F2F2] outline-none placeholder:text-[#6B7569] dark:text-[#BFC4AC] focus:border-[#588157] focus:ring-2 focus:ring-[#588157]/20"
                />
              </div>

              <div>
                <label className="mb-1 block font-medium">
                  Telefone da empresa
                </label>

                <input
                  type="tel"
                  placeholder="(00) 0000-0000"
                  className="w-full rounded-lg border border-[#A3B18A] bg-[#F2F2F2] dark:bg-[#1F2923] p-3 text-[#273B31] dark:text-[#F2F2F2] outline-none placeholder:text-[#6B7569] dark:text-[#BFC4AC] focus:border-[#588157] focus:ring-2 focus:ring-[#588157]/20"
                />
              </div>

              <div>
                <label className="mb-1 block font-medium">
                  CNPJ ou CPF
                </label>

                <input
                  type="email"
                  placeholder="empresa@email.com"
                  className="w-full rounded-lg border border-[#A3B18A] bg-[#F2F2F2] dark:bg-[#1F2923] p-3 text-[#273B31] dark:text-[#F2F2F2] outline-none placeholder:text-[#6B7569] dark:text-[#BFC4AC] focus:border-[#588157] focus:ring-2 focus:ring-[#588157]/20"
                />
              </div>

              <div>
                <label className="mb-1 block font-medium">
                  Área da Empresa
                </label>

                <input
                  type="email"
                  placeholder="empresa@email.com"
                  className="w-full rounded-lg border border-[#A3B18A] bg-[#F2F2F2] dark:bg-[#1F2923] p-3 text-[#273B31] dark:text-[#F2F2F2] outline-none placeholder:text-[#6B7569] dark:text-[#BFC4AC] focus:border-[#588157] focus:ring-2 focus:ring-[#588157]/20"
                />
              </div>

              <div>
                <label className="mb-1 block font-medium">
                  Área da Empresa
                </label>

                <input
                  type="email"
                  placeholder="empresa@email.com"
                  className="w-full rounded-lg border border-[#A3B18A] bg-[#F2F2F2] dark:bg-[#1F2923] p-3 text-[#273B31] dark:text-[#F2F2F2] outline-none placeholder:text-[#6B7569] dark:text-[#BFC4AC] focus:border-[#588157] focus:ring-2 focus:ring-[#588157]/20"
                />
              </div>

              <a>Declaro que lido e aceitado os Termos de Política e Uso</a>

            </div>
          </div>
        )}


        {/* ETAPA 4 */}
        {etapaAtual === 4 && (
          <div>
            <h1 className="text-2xl font-bold">
              Forma de pagamento
            </h1>

            <p className="mt-2 text-[#6B7569] dark:text-[#BFC4AC]">
              Escolha como deseja realizar o pagamento.
            </p>

            <div className="mt-6 space-y-4">

              <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-[#A3B18A] bg-white dark:bg-[#273B31] p-4 hover:border-[#588157]">
                <input type="radio" name="pagamento" />
                <span>Pix</span>
              </label>

              <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-[#A3B18A] bg-white dark:bg-[#273B31] p-4 hover:border-[#588157]">
                <input type="radio" name="pagamento" />
                <span>Cartão de crédito</span>
              </label>

              <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-[#A3B18A] bg-white dark:bg-[#273B31] p-4 hover:border-[#588157]">
                <input type="radio" name="pagamento" />
                <span>Cartão de débito</span>
              </label>

              <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-[#A3B18A] bg-white dark:bg-[#273B31] p-4 hover:border-[#588157]">
                <input type="radio" name="pagamento" />
                <span>Boleto</span>
              </label>

              <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-[#A3B18A] bg-white dark:bg-[#273B31] p-4 hover:border-[#588157]">
                <input type="radio" name="pagamento" />
                <span>Carteira Digital</span>
              </label>

            </div>
          </div>
        )}


        {/* ETAPA 5 */}
        {etapaAtual === 5 && (
          <div>
            <h1 className="text-2xl font-bold">
              Resumo da compra
            </h1>

            <p className="mt-2 text-[#6B7569] dark:text-[#BFC4AC]">
              Confira as informações antes de finalizar.
            </p>

            <div className="mt-6 space-y-4">

              <div className="rounded-lg bg-[#E6E5E0] dark:bg-[#344E41] p-4">
                <p className="text-sm text-[#6B7569] dark:text-[#BFC4AC]">
                  Plano
                </p>

                <p className="font-semibold">
                  Plano Premium
                </p>
              </div>

              <div className="rounded-lg bg-[#E6E5E0] dark:bg-[#344E41] p-4">
                <p className="text-sm text-[#6B7569] dark:text-[#BFC4AC]">
                  Valor
                </p>

                <p className="font-semibold">
                  R$ 99,90 / mês
                </p>
              </div>

              <div className="rounded-lg bg-[#E6E5E0] dark:bg-[#344E41] p-4">
                <p className="text-sm text-[#6B7569] dark:text-[#BFC4AC]">
                  Forma de pagamento
                </p>

                <p className="font-semibold">
                  Pix
                </p>
              </div>

            </div>
          </div>
        )}


        {/* ETAPA 6 */}
        {etapaAtual === 6 && (
          <div className="text-center">

            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#588157] text-3xl text-white">
              ✓
            </div>

            <h1 className="mt-5 text-2xl font-bold">
              Pagamento concluído!
            </h1>

            <p className="mt-2 text-[#6B7569] dark:text-[#BFC4AC]">
              Seu pagamento foi realizado com sucesso.
            </p>

            <div className="mt-6 rounded-lg bg-[#E6E5E0] dark:bg-[#344E41] p-5 text-left">
              <p className="font-semibold">
                Recibo
              </p>

              <p className="mt-2 text-sm text-[#6B7569] dark:text-[#BFC4AC]">
                O recibo do pagamento será disponibilizado aqui.
              </p>
            </div>

            <div className="mt-4 rounded-lg bg-[#E6E5E0] dark:bg-[#344E41] p-5 text-left">
              <p className="font-semibold">
                Credenciais de acesso
              </p>

              <p className="mt-2 text-sm text-[#6B7569] dark:text-[#BFC4AC]">
                Seu usuário e senha serão gerados pela plataforma.
              </p>
            </div>

          </div>
        )}

      </div>


      {/* BOTÕES */}
      <div className="mt-10 flex justify-center gap-4">

        <button
          onClick={() => setEtapaAtual(etapaAtual - 1)}
          disabled={etapaAtual === 1}
          className="rounded-lg bg-[#E6E5E0] dark:bg-[#344E41] px-5 py-2 transition-all duration-300 hover:bg-[#DAD7CD] dark:hover:bg-[#3A5A40] hover:-translate-x-1 active:scale-95 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Voltar
        </button>

        <button
          onClick={() => setEtapaAtual(etapaAtual + 1)}
          disabled={etapaAtual === etapas.length}
          className="rounded-lg bg-[#588157] px-5 py-2 text-white hover:bg-[#3A5A40] transition-all duration-300 hover:scale-105 hover:shadow-lg active:scale-95 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {etapaAtual === etapas.length
            ? "Finalizado"
            : "Continuar"}
        </button>

      </div>

    </div>
  </>);
}
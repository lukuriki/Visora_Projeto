
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { buscarPlanos } from "@/lib/api";

export default function PaginaPlanos() {
  const router = useRouter();

  const [planos, setPlanos] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");

  useEffect(() => {
    async function carregarPlanos() {
      try {
        const dados = await buscarPlanos();
        setPlanos(dados);
      } catch (error) {
        setErro(error.message || "Não foi possível carregar os planos.");
      } finally {
        setCarregando(false);
      }
    }

    carregarPlanos();
  }, []);

  function formatarValor(valor) {
    return Number(valor).toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  }

  function selecionarPlano(plano) {
    router.push(`/areapublica_pagina_pagamento?planoId=${encodeURIComponent(plano.id)}`);
  }

  if (carregando) {
    return <p className="p-6">Carregando planos...</p>;
  }

  if (erro) {
    return <p className="p-6 text-red-500">{erro}</p>;
  }

  if (planos.length === 0) {
    return <p className="p-6">Nenhum plano disponível no momento.</p>;
  }

  return (
    <main className="min-h-screen p-8">
      <h1 className="mb-2 text-3xl font-bold">
        Nossos planos
      </h1>

      <p className="mb-8 text-gray-500">
        Escolha o plano ideal para você.
      </p>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {planos.map((plano) => (
          <article
            key={plano.id}
            className="flex flex-col rounded-xl border p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
          >
            <h2 className="text-xl font-semibold">
              {plano.tipo}
            </h2>

            <p className="my-4 text-3xl font-bold">
              {formatarValor(plano.valor)}
            </p>

            <p className="mb-6 flex-1 text-gray-600">
              {plano.descricao}
            </p>

            <button
              type="button"
              onClick={() => selecionarPlano(plano)}
              className="w-full rounded-lg bg-[#588157] px-4 py-3 font-semibold text-white transition hover:bg-[#466746] focus:outline-none focus:ring-2 focus:ring-[#588157] focus:ring-offset-2"
            >
              Selecionar plano
            </button>
          </article>
        ))}
      </div>
    </main>
  );
}


"use client";

import Image from "next/image";
import Link from "next/link";
import {
  MoveRight,
  Mail,
  UsersRound,
  Phone,
} from "lucide-react";

const linksNavegacao = [
  { nome: "Página Inicial", href: "/plataforma_pagina_inicial" },
  { nome: "Informações Contábeis", href: "/plataforma_pagina_informacoes_contabeis" },
  { nome: "Análises", href: "/plataforma_pagina_analises" },
  { nome: "Auditoria", href: "/plataforma_pagina_auditoria" },
  { nome: "Previsões", href: "/plataforma_pagina_previsoes" },
  { nome: "Perfil", href: "/plataforma_pagina_perfil" },
];

export default function FooterPlataforma() {
  return (
    <footer className="w-full min-w-0 overflow-hidden border-t border-[#DAD7CD] bg-[#F8F9F6] text-[#273B31] dark:border-[#34483A] dark:bg-[#111A14] dark:text-[#E5EDE5]">

      {/* CONTEÚDO PRINCIPAL */}
      <div className="@container mx-auto w-full max-w-[1600px] min-w-0 px-5 py-10 sm:px-7 lg:px-10">

        <div className="grid min-w-0 grid-cols-1 gap-x-8 gap-y-10 @min-[560px]:grid-cols-2 @min-[1050px]:grid-cols-[1.2fr_1fr_1.2fr] @min-[1050px]:gap-x-12">

          {/* LOGO E DESCRIÇÃO */}
          <div className="min-w-0">
            <Link
              href="/plataforma_pagina_inicial"
              aria-label="Visora - Página inicial"
              className="inline-block max-w-full"
            >
              <Image
                src="/logo_horizontal_lightmode.png"
                alt="Visora"
                width={230}
                height={70}
                className="h-auto w-[190px] max-w-full dark:hidden"
              />

              <Image
                src="/logo_horizontal_darkmode.png"
                alt="Visora"
                width={230}
                height={70}
                className="hidden h-auto w-[190px] max-w-full dark:block"
              />
            </Link>

            <p className="mt-4 max-w-[340px] text-sm leading-7 text-[#68766A] dark:text-[#C1CEC2]/80">
              Sua empresa merece uma gestão mais inteligente.
              Transforme dados em decisões e resultados com a Visora.
            </p>
          </div>

          {/* NAVEGAÇÃO */}
          <nav aria-label="Navegação do rodapé" className="min-w-0">
            <h3 className="mb-5 text-base font-bold text-[#344E41] dark:text-[#A3B18A]">
              Navegação
            </h3>

            <ul className="grid grid-cols-1 gap-x-5 gap-y-3 @min-[380px]:grid-cols-2">
              {linksNavegacao.map((item) => (
                <li key={item.href} className="min-w-0">
                  <Link
                    href={item.href}
                    className="block text-sm leading-6 text-[#68766A] transition-colors duration-200 hover:text-[#588157] dark:text-[#C1CEC2]/75 dark:hover:text-[#A3B18A]"
                  >
                    {item.nome}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* FALE CONOSCO */}
          <div className="min-w-0 @min-[560px]:col-span-2 @min-[1050px]:col-span-1">
            <h3 className="mb-5 text-base font-bold text-[#344E41] dark:text-[#A3B18A]">
              Fale Conosco
            </h3>

            <ul className="space-y-4">
              <li>
                <a
                  href="mailto:visora.plataforma@gmail.com"
                  className="flex min-w-0 items-start gap-3 text-sm leading-6 text-[#68766A] transition-colors hover:text-[#588157] dark:text-[#C1CEC2]/75 dark:hover:text-[#A3B18A]"
                >
                  <Mail className="mt-1 h-4 w-4 shrink-0" />
                  <span className="min-w-0 break-all">
                    visora.plataforma@gmail.com
                  </span>
                </a>
              </li>

              <li>
                <div className="flex items-start gap-3 text-sm leading-6 text-[#68766A] dark:text-[#C1CEC2]/75">
                  <Phone className="mt-1 h-4 w-4 shrink-0" />
                  <span>Telefone: (11) 99999-9999</span>
                </div>
              </li>

              <li>
                <Link
                  href="/areapublica_pagina_contato"
                  className="group inline-flex items-center gap-3 text-sm leading-6 text-[#68766A] transition-colors hover:text-[#588157] dark:text-[#C1CEC2]/75 dark:hover:text-[#A3B18A]"
                >
                  <UsersRound className="h-4 w-4 shrink-0" />
                  <span>Entre em contato</span>
                  <MoveRight className="h-4 w-4 shrink-0 transition-transform duration-200 group-hover:translate-x-1" />
                </Link>
              </li>
            </ul>
          </div>

        </div>
      </div>

      {/* RODAPÉ INFERIOR */}
      <div className="border-t border-[#DAD7CD] dark:border-[#34483A]">
        <div className="mx-auto max-w-[1600px] px-5 py-5 text-center sm:px-7 lg:px-10">
          <p className="text-xs leading-5 text-[#68766A] dark:text-[#C1CEC2]/70">
            © 2026 Visora. Todos os direitos reservados.
          </p>
        </div>
      </div>

    </footer>
  );
}

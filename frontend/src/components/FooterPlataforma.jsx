
"use client";

import Image from "next/image";
import Link from "next/link";
import { MoveRight, Mail, UserRoundGroup, PhoneLog  } from "lucide-react";

export default function FooterPlataforma() {
  return (
    <footer className="w-full border-t border-[#DAD7CD] dark:border-[#34483A]">
      {/* CONTEÚDO CENTRAL */}
      <div className="mx-auto flex items-center justify-between md:flex-row md:gap-16 lg:gap-24 xl:gap-32  px-15 py-[7.5px]">

        {/* LOGO E DESCRIÇÃO */}
        <div className="text-left w-120">
          <Link href="/plataforma_pagina_inicial" aria-label="Visora - Página inicial">
            <Image src="/logo_horizontal_lightmode.png" alt="Visora" width={190} height={60} className="h-auto w-[230px] dark:hidden"/>
            <Image src="/logo_horizontal_darkmode.png" alt="Visora" width={190} height={60} className="hidden h-auto w-[230px] dark:block"/>
          </Link>

          <p className="max-w-90 text-sm leading-6 text-[#68766A] dark:text-[#C1CEC2]/80 text-justify">Sua empresa merece uma gestão mais inteligente. Transforme dados em decisões e resultados com a Visora.</p>
        </div>

        {/* LINKS */}
        <div className="text-center w-100">

            <div className="space-y-4">
              <h3 className="text-lg font-bold text-[#344E41] dark:text-[#A3B18A]">Navegação</h3>

              <ul className="grid grid-cols-2 gap-3">
                <li>
                  <Link href="/plataforma_pagina_inicial" className="text-sm text-[#68766A] transition-colors hover:text-[#588157] dark:text-[#C1CEC2]/75 dark:hover:text-[#A3B18A]">Página Inicial</Link>
                </li>

                <li>
                  <Link href="/plataforma_pagina_informacoes_contabeis" className="text-sm text-[#68766A] transition-colors hover:text-[#588157] dark:text-[#C1CEC2]/75 dark:hover:text-[#A3B18A]">Informações Contábeis</Link>
                </li>

                <li>
                  <Link href="/plataforma_pagina_analises" className="text-sm text-[#68766A] transition-colors hover:text-[#588157] dark:text-[#C1CEC2]/75 dark:hover:text-[#A3B18A]">Análises</Link>
                </li>

                <li>
                  <Link href="/plataforma_pagina_auditoria" className="text-sm text-[#68766A] transition-colors hover:text-[#588157] dark:text-[#C1CEC2]/75 dark:hover:text-[#A3B18A]">Auditoria</Link>
                </li>

                <li>
                  <Link href="/plataforma_pagina_previsoes" className="text-sm text-[#68766A] transition-colors hover:text-[#588157] dark:text-[#C1CEC2]/75 dark:hover:text-[#A3B18A]">Previsões</Link>
                </li>

                <li>
                  <Link href="/plataforma_pagina_perfil" className="text-sm text-[#68766A] transition-colors hover:text-[#588157] dark:text-[#C1CEC2]/75 dark:hover:text-[#A3B18A]">Perfil</Link>
                </li>
              </ul>
            </div>

        </div>

        {/* LINKS */}
        <div className="gap-8 text-left w-120">

            <div className="space-y-4">
              <h3 className="text-lg font-bold text-[#344E41] dark:text-[#A3B18A]">Fale Conosco</h3>

              <ul className="space-y-3">

                  <li>
                    <Link href="/link" className="flex align-center text-sm text-[#68766A] transition-colors hover:text-[#588157] dark:text-[#C1CEC2]/75 dark:hover:text-[#A3B18A]">
                      <p className="flex items-center justify-center gap-2">
                        <Mail className="h-4 w-4" /> <span>Email: visora.plataforma@gmail.com</span> 
                      </p>
                    </Link>
                  </li>

                  <li>
                    <Link href="/link" className="flex align-center text-sm text-[#68766A] transition-colors hover:text-[#588157] dark:text-[#C1CEC2]/75 dark:hover:text-[#A3B18A]">
                      <p className="flex items-center justify-center gap-2">
                        <PhoneLog className="h-4 w-4" /> <span>Telefone: (11) 99999-9999</span> 
                      </p>
                    </Link>
                  </li>

                  <li>
                    <Link href="/link" className="flex align-center text-sm text-[#68766A] transition-colors hover:text-[#588157] dark:text-[#C1CEC2]/75 dark:hover:text-[#A3B18A]">
                      <p className="flex items-center justify-center gap-2">
                        <UserRoundGroup className="h-4 w-4" /> <span>Entre em contato</span> <MoveRight className="h-4 w-4" />
                      </p>
                    </Link>
                  </li>

              </ul>
            </div>

        </div>


          
        </div>

        {/* RODAPÉ INFERIOR */}
        <div className="p-4 items-center justify-center border-t border-[#DAD7CD] dark:border-[#34483A] sm:flex-row sm:justify-between">
          <p className="text-center text-xs text-[#68766A] dark:text-[#C1CEC2]/70 sm:text-[12px]">© 2026 Visora. Todos os direitos reservados.</p>
        </div>

    </footer>
  );
}

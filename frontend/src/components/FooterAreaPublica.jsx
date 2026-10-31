"use client";

import Link from "next/link";

const navigation = [
  { label: "Página Inicial", href: "/" },
  { label: "Sobre Nós", href: "/sobre" },
  { label: "Planos", href: "/planos" },
  { label: "Contato", href: "/contato" },
];

export default function FooterAreaPublica() {
  return (
    <footer className="relative isolate overflow-hidden
      bg-[#E9EDE5] text-[#273B31]
      transition-colors duration-300
      dark:bg-[#17231B] dark:text-[#F2F2F2]">

      {/* Aura decorativa */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-24 -top-24
          -z-10 size-72 rounded-full bg-[#588157]/15
          blur-3xl dark:bg-[#A3B18A]/10"
      />

      <div className="relative mx-auto max-w-7xl
        px-6 py-10 md:px-10 md:py-12">

        <div className="grid gap-10 sm:grid-cols-2
          lg:grid-cols-[1.4fr_0.8fr_1fr] lg:gap-16">

          {/* Logo e slogan */}
          <div className="max-w-sm">
            <Link
              href="/"
              aria-label="Visora - Página inicial"
              className="mb-4 inline-flex items-center"
            >
              <img
                className="ml-[-20px] block w-72 dark:hidden"
                src="/logo_horizontal_lightmode.png"
                alt="Logo Visora"
              />

              <img
                className="ml-[-20px] hidden w-72 dark:block"
                src="/logo_horizontal_darkmode.png"
                alt="Logo Visora"
              />
            </Link>

            <p className="max-w-xs text-sm leading-7
              text-[#536258] dark:text-[#C4CEC5]">
              Transforme dados em visão. Tome decisões com confiança.
            </p>

            <p className="mt-4 text-xs font-semibold tracking-wide
              text-[#588157] dark:text-[#A3B18A]">
              DADOS • ESTRATÉGIA • RESULTADOS
            </p>
          </div>

          {/* Navegação */}
          <div>
            <h3 className="mb-4 text-sm font-semibold">
              Navegação
            </h3>

            <ul className="space-y-3">
              {navigation.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-sm text-[#536258]
                      transition-colors hover:text-[#344E41]
                      dark:text-[#C4CEC5]
                      dark:hover:text-[#A3B18A]"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Redes sociais */}
          <div>
            <h3 className="mb-4 text-sm font-semibold">
              Vamos nos conectar?
            </h3>

            <p className="mb-5 max-w-xs text-sm leading-6
              text-[#536258] dark:text-[#C4CEC5]">
              Acompanhe as novidades e descubra novas possibilidades
              com a Visora.
            </p>

            <div className="flex items-center gap-3">
              <a
                href="https://www.instagram.com/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="flex size-10 items-center justify-center
                  rounded-xl border border-[#DAD7CD] bg-white
                  text-[#344E41] transition hover:-translate-y-1
                  hover:border-[#588157] dark:border-[#435449]
                  dark:bg-[#26362D] dark:text-white
                  dark:hover:border-[#A3B18A]"
              >
                <svg viewBox="0 0 24 24" width="20" height="20"
                  fill="none" stroke="currentColor" strokeWidth="1.8"
                  strokeLinecap="round" strokeLinejoin="round"
                  aria-hidden="true">
                  <rect x="3" y="3" width="18" height="18" rx="5" />
                  <circle cx="12" cy="12" r="4" />
                  <circle cx="17.5" cy="6.5" r="0.8"
                    fill="currentColor" stroke="none" />
                </svg>
              </a>

              <a
                href="https://www.linkedin.com/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="LinkedIn"
                className="flex size-10 items-center justify-center
                  rounded-xl border border-[#DAD7CD] bg-white
                  text-[#344E41] transition hover:-translate-y-1
                  hover:border-[#588157] dark:border-[#435449]
                  dark:bg-[#26362D] dark:text-white
                  dark:hover:border-[#A3B18A]"
              >
                <svg viewBox="0 0 24 24" width="20" height="20"
                  fill="currentColor" aria-hidden="true">
                  <path d="M5.2 3a2.2 2.2 0 1 0 0 4.4 2.2 2.2 0 0 0 0-4.4ZM3.3 9h3.8v12H3.3V9Zm6.1 0H13v1.6h.1A4.1 4.1 0 0 1 16.8 8c4 0 4.7 2.6 4.7 6V21h-3.8v-6.2c0-1.5 0-3.4-2.1-3.4s-2.4 1.6-2.4 3.3V21H9.4V9Z" />
                </svg>
              </a>

              <a
                href="mailto:contato@visora.com.br"
                aria-label="Enviar e-mail"
                className="flex size-10 items-center justify-center
                  rounded-xl border border-[#DAD7CD] bg-white
                  text-[#344E41] transition hover:-translate-y-1
                  hover:border-[#588157] dark:border-[#435449]
                  dark:bg-[#26362D] dark:text-white
                  dark:hover:border-[#A3B18A]"
              >
                <svg viewBox="0 0 24 24" width="20" height="20"
                  fill="none" stroke="currentColor" strokeWidth="1.8"
                  strokeLinecap="round" strokeLinejoin="round"
                  aria-hidden="true">
                  <rect x="3" y="5" width="18" height="14" rx="2" />
                  <path d="m3 7 9 6 9-6" />
                </svg>
              </a>
            </div>
          </div>
        </div>

        {/* Informações finais sem linha divisória */}
        <div className="mt-8 flex flex-col items-center
          justify-between gap-3 sm:flex-row">
          <p className="text-center text-xs text-[#68766C]
            dark:text-[#C4CEC5] sm:text-left">
            © {new Date().getFullYear()} Visora. Todos os direitos reservados.
          </p>

          <Link
            href="/"
            className="text-xs font-medium text-[#536258]
              transition-colors hover:text-[#344E41]
              dark:text-[#C4CEC5] dark:hover:text-[#A3B18A]"
          >
            Feito para transformar dados em decisões.
          </Link>
        </div>
      </div>
    </footer>
  );
}
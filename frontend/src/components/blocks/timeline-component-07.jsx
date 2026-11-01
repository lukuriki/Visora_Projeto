"use client";

import { Badge } from "@/components/ui/badge";
import { TimelineAnimate } from "@/components/ui/timeline-animate";
import { cn } from "@/lib/utils";

const ExperienceCard = ({
  logo,
  company,
  role,
  period,
  status,
  stack = [],
  achievement,
  description,
}) => {
  return (
    <div
      className="relative isolate space-y-4 rounded-2xl
        border border-[#718B68]/20
        bg-[#F2F2F2]/95 p-5
        shadow-[0_8px_35px_rgba(52,78,65,0.05)]
        backdrop-blur-sm
        transition-all duration-300
        hover:border-[#718B68]/35
        hover:shadow-[0_12px_40px_rgba(52,78,65,0.09)]
        dark:border-[#A3B18A]/20
        dark:bg-[#141D16]/95
        dark:shadow-none
        dark:hover:border-[#A3B18A]/40
        sm:p-6"
    >
      {/* Linha decorativa no topo do card */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-6
          right-6 top-0 -z-10 h-px
          bg-gradient-to-r from-transparent
          via-[#718B68]/30 to-transparent
          dark:via-[#A3B18A]/35"
      />

      {/* Logo e identificação */}
      <div className="mb-2 flex gap-3 sm:items-center">
        <div
          className="flex size-12 shrink-0 items-center
            justify-center rounded-xl
            border border-[#718B68]/20
            bg-[#E8EDE5] sm:size-13.5
            dark:border-[#A3B18A]/25
            dark:bg-[#A3B18A]/10"
        >
          <img
            src="/logo_v_lightmode.png"
            alt="Logo Visora"
            loading="lazy"
            className="size-8 dark:hidden sm:size-9"
          />

          <img
            src="/logo_v_darkmode.png"
            alt="Logo Visora"
            loading="lazy"
            className="hidden size-8 dark:block sm:size-9"
          />
        </div>

        <div>
          <p className="text-sm text-muted-foreground">
            {company}
          </p>

          <h3 className="text-lg font-semibold sm:text-2xl">
            {role}
          </h3>
        </div>
      </div>

      {/* Informações */}
      <div className="space-y-3 text-sm sm:text-base">
        <p>
          {period}

          {status && (
            <span
              className={cn(
                "ml-1 font-medium",
                status.tone === "positive"
                  ? "text-green-600 dark:text-green-400"
                  : "text-amber-600 dark:text-amber-400"
              )}
            >
              {status.text}
            </span>
          )}
        </p>

        {/* Tecnologias */}
        <div className="flex flex-wrap items-center gap-2">
          {stack.map((tech) => (
            <Badge
              key={tech}
              variant="secondary"
              className="h-5.5 rounded-full
                border border-[#718B68]/15
                bg-[#E8EDE5] text-[#344E41]
                dark:border-[#A3B18A]/25
                dark:bg-[#A3B18A]/10
                dark:text-[#DADFD7]"
            >
              {tech}
            </Badge>
          ))}
        </div>

        <p className="text-base font-medium">
          {achievement}
        </p>
      </div>

      {/* Descrição */}
      <p className="max-w-145 text-muted-foreground">
        {description}
      </p>
    </div>
  );
};

export default function Process({ data = [] }) {
  return (
    <section
      className="relative isolate mt-0 mb-0
        overflow-hidden bg-[#F2F2F2]
        py-14 sm:py-16 lg:py-20
        dark:bg-[#111A14]"
    >
      {/* Aura verde superior esquerda */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute
          -left-40 top-20 -z-10
          size-[400px] rounded-full
          bg-[#718B68]/[0.07] blur-[120px]
          dark:bg-[#A3B18A]/[0.08]"
      />

      {/* Aura verde superior direita */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute
          -right-40 top-40 -z-10
          size-[450px] rounded-full
          bg-[#718B68]/[0.06] blur-[130px]
          dark:bg-[#A3B18A]/[0.07]"
      />

      {/* Aura verde inferior */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute
          -bottom-48 left-1/3 -z-10
          h-[450px] w-[600px] rounded-full
          bg-[#718B68]/[0.05] blur-[140px]
          dark:bg-[#A3B18A]/[0.06]"
      />

      {/* Linha horizontal superior */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute
          left-0 right-0 top-0 z-0 h-px
          bg-gradient-to-r from-transparent
          via-[#718B68]/30 to-transparent
          dark:via-[#A3B18A]/45"
      />

      {/* Linha horizontal inferior */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute
          bottom-0 left-0 right-0 z-0 h-px
          bg-gradient-to-r from-transparent
          via-[#718B68]/30 to-transparent
          dark:via-[#A3B18A]/45"
      />

      {/* Linhas curvas decorativas */}
      <svg
        aria-hidden="true"
        viewBox="0 0 1440 900"
        preserveAspectRatio="none"
        className="pointer-events-none absolute
          inset-0 -z-10 h-full w-full
          opacity-70 dark:opacity-100"
      >
        <path
          d="M -100 400 C 150 220, 260 650, 520 480 S 900 180, 1540 500"
          fill="none"
          stroke="#718B68"
          strokeWidth="1.5"
          strokeOpacity="0.4"
          className="dark:[stroke:#A3B18A]"
          style={{
            strokeOpacity: undefined,
          }}
        />

        <path
          d="M -100 450 C 150 270, 280 700, 540 530 S 950 230, 1540 550"
          fill="none"
          stroke="#8A9D79"
          strokeWidth="1.5"
          strokeOpacity="0.35"
          className="dark:[stroke:#A3B18A]"
        />

        <path
          d="M 1100 -100 C 950 150, 1200 350, 1050 550 S 1200 750, 1500 850"
          fill="none"
          stroke="#718B68"
          strokeWidth="1.5"
          strokeOpacity="0.3"
          className="dark:[stroke:#A3B18A]"
        />
      </svg>

      {/* Pontos de luz */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute
          left-[12%] top-[22%] -z-10
          size-2 rounded-full
          bg-[#718B68]/50
          shadow-[0_0_20px_6px_rgba(113,139,104,0.15)]
          dark:bg-[#A3B18A]/80
          dark:shadow-[0_0_20px_6px_rgba(163,177,138,0.2)]"
      />

      <div
        aria-hidden="true"
        className="pointer-events-none absolute
          right-[16%] top-[38%] -z-10
          size-1.5 rounded-full
          bg-[#718B68]/60
          shadow-[0_0_18px_5px_rgba(113,139,104,0.15)]
          dark:bg-[#A3B18A]/80
          dark:shadow-[0_0_18px_5px_rgba(163,177,138,0.2)]"
      />

      {/* Conteúdo acima das linhas */}
      <div
        className="relative z-10 mx-auto max-w-3xl
          space-y-8 px-4
          sm:space-y-10 sm:px-6
          lg:space-y-12 lg:px-8"
      >
        {/* Cabeçalho */}
        <div id="essencia-titulo" className="space-y-3">
          <p
            className="text-lg font-medium italic
              text-[#456746] sm:text-xl
              dark:text-[#A3B18A]"
          >
            Descubra o que nos move
          </p>

          <h2
            className="text-2xl font-semibold
              tracking-tight text-[#243B2E]
              sm:text-3xl lg:text-4xl
              dark:text-[#A3B18A]"
          >
            Conheça a essência da Visora.
          </h2>

          {/* Detalhe abaixo do título */}
          <div
            aria-hidden="true"
            className="h-1 w-16 rounded-full
              bg-gradient-to-r
              from-[#456746] to-[#A3B18A]
              dark:from-[#A3B18A]
              dark:to-[#A3B18A]/50"
          />
        </div>

        {/* Timeline */}
        <div className="relative">
          <TimelineAnimate
            data={data.map(({ id, ...step }) => ({
              index: id,
              content: <ExperienceCard {...step} />,
            }))}
          />
        </div>
      </div>
    </section>
  );
}
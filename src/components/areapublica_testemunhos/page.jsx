
"use client";

import { motion } from "framer-motion";

const testemunhos = [
  {
    title: "Finalmente, tenho controle das minhas finanças!",
    text: "Antes, eu tinha dificuldade para entender exatamente para onde meu dinheiro estava indo. Com a plataforma, consegui organizar meus gastos, acompanhar minhas despesas e ter muito mais clareza para tomar decisões financeiras melhores. Fez toda a diferença na minha rotina!",
    author: "Ana Oliveira",
  },
  {
    title: "Organização financeira sem complicação",
    text: "Sempre procurei uma maneira prática de manter minhas finanças organizadas, mas acabava me perdendo em planilhas e anotações. Agora, consigo visualizar tudo em um só lugar, acompanhar minhas informações com facilidade e planejar meus próximos passos com muito mais segurança.",
    author: "Lucas Martins",
  },
  {
    title: "Mais clareza para tomar decisões melhores",
    text: "A plataforma me ajudou a enxergar minha situação financeira de uma forma muito mais completa. Consigo acompanhar meus gastos, identificar onde posso melhorar e pensar no futuro com mais planejamento. É incrível como ter as informações organizadas pode facilitar tantas decisões do dia a dia!",
    author: "Eduardo Santos",
  },
  {
    title: "Uma experiência simples, intuitiva e eficiente",
    text: "O que mais me chamou a atenção foi a facilidade de usar a plataforma. Tudo é bem organizado, as informações são fáceis de encontrar e consigo acompanhar minha rotina financeira sem perder tempo. É uma solução prática para quem quer ter mais organização e tranquilidade no dia a dia.",
    author: "Mariana Costa",
  },
  {
    title: "Pequenas mudanças que fazem uma grande diferença",
    text: "Eu precisava de uma solução que tornasse o controle financeiro mais simples e eficiente. Com a plataforma, passei a acompanhar melhor minhas despesas, organizar minhas prioridades e planejar meus objetivos com mais consciência. Hoje, sinto que tenho muito mais controle sobre minhas escolhas financeiras.",
    author: "Gabriel Souza",
  },
];

const duplicatedTestemunhos = [
  ...testemunhos,
  ...testemunhos,
];

export default function Testemunhos() {
  return (
    <section className="relative isolate overflow-hidden bg-[#F2F2F2] py-16 transition-colors duration-500 dark:bg-[#111A14]">

      {/* AURA VERDE INFERIOR ESQUERDA */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute bottom-0 left-0 z-0 h-[450px] w-[550px] rounded-full bg-[#588157]/30 blur-[90px] dark:bg-[#588157]/20"
      />

      {/* AURA VERDE INFERIOR DIREITA */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute bottom-0 right-0 z-0 h-[450px] w-[550px] rounded-full bg-[#7E9971]/30 blur-[90px] dark:bg-[#7E9971]/15"
      />

      {/* AURA CENTRAL */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-1/2 z-0 h-[350px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#588157]/10 blur-[120px] dark:bg-[#588157]/10"
      />

      {/* CABEÇALHO */}
      <motion.div
        initial={{ opacity: 0, y: 25 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="relative z-10 mx-auto mb-16 max-w-3xl px-5 text-center"
      >
        <span className="inline-flex rounded-full border border-[#588157]/20 bg-[#588157]/10 px-5 py-2 text-sm font-semibold uppercase tracking-wider text-[#588157] dark:border-[#7E9971]/30 dark:bg-[#588157]/15 dark:text-[#A3B18A]">
          Testemunhos
        </span>

        <h2 className="mt-8 p-2 text-4xl font-bold tracking-[0.02em] text-[#273B31] transition-colors duration-300 dark:text-[#E5EDE5] md:text-5xl">
          A opinião de quem já conhece{" "}
          <span className="text-[#588157] dark:text-[#A3B18A]">
            a Visora
          </span>
        </h2>

        <p className="mt-5 leading-7 text-[#3A5A40]/75 dark:text-[#C1CEC2]/80">
          Descubra como a Visora está transformando a maneira de organizar
          as finanças, trazendo mais clareza, controle e segurança para as
          decisões do dia a dia.
        </p>
      </motion.div>

      {/* CARROSSEL DE TESTEMUNHOS */}
      <div className="relative z-10 overflow-hidden">
        <motion.div
          className="flex w-max gap-5"
          animate={{ x: ["0%", "-50%"] }}
          transition={{
            duration: 35,
            ease: "linear",
            repeat: Infinity,
          }}
        >
          {duplicatedTestemunhos.map((testemunho, index) => (
            <article
              key={`${testemunho.author}-${index}`}
              className="flex min-h-[340px] w-[300px] shrink-0 flex-col rounded-2xl border border-[#E5EAE3] bg-[#FFFDF9] p-7 shadow-sm transition-all duration-300 hover:border-[#A3B18A] hover:shadow-[0_15px_40px_rgba(58,90,64,0.10)] dark:border-[#34483A] dark:bg-[#1C2920] dark:hover:border-[#7E9971] dark:hover:shadow-[0_15px_40px_rgba(0,0,0,0.20)] md:w-[330px]"
            >
              <h3 className="mb-3 text-lg font-bold leading-snug text-[#273B31] transition-colors duration-300 dark:text-[#E5EDE5]">
                {testemunho.title}
              </h3>

              {/* AVALIAÇÃO */}
              <div
                className="mb-4 text-xl tracking-wide text-[#D9B445]"
                aria-label="5 de 5 estrelas"
              >
                ★★★★★
              </div>

              {/* DEPOIMENTO */}
              <p className="flex-1 text-sm leading-6 text-[#666666] transition-colors duration-300 dark:text-[#C1CEC2]/80">
                {testemunho.text}
              </p>

              {/* AUTOR */}
              <div className="mt-7 flex items-center gap-3 border-t border-[#E9EDE7] pt-5 transition-colors duration-300 dark:border-[#34483A]">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#DDEBDD] text-sm font-bold text-[#3A5A40] dark:bg-[#344E41] dark:text-[#D5E3CE]">
                  {testemunho.author
                    .split(" ")
                    .map((nome) => nome[0])
                    .slice(0, 2)
                    .join("")
                    .toUpperCase()}
                </div>

                <div>
                  <p className="font-bold text-[#273B31] transition-colors duration-300 dark:text-[#E5EDE5]">
                    {testemunho.author}
                  </p>

                  <p className="mt-0.5 text-xs text-[#588157] dark:text-[#A3B18A]">
                    Cliente Visora
                  </p>
                </div>
              </div>
            </article>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

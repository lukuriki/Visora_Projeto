
"use client";

import { motion } from "framer-motion";
import { CircleHelp, Plus, MessageCircle } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqItems = [
  {
    question: "O que é a Visora e qual é o seu principal objetivo?",
    answer:
      "A Visora é uma plataforma desenvolvida para tornar a análise e a organização de informações financeiras mais simples e acessíveis. Seu propósito é transformar dados em informações claras e úteis, ajudando você a compreender melhor sua situação financeira, acompanhar resultados e tomar decisões com mais segurança. Com uma visualização organizada das informações, fica mais fácil identificar padrões, avaliar possibilidades e planejar os próximos passos.",
  },
  {
    question: "Como a Visora pode me ajudar a organizar e compreender melhor minhas finanças?",
    answer:
      "A Visora busca reunir e apresentar informações financeiras de maneira estruturada, facilitando a compreensão dos dados e a visualização de aspectos importantes da sua organização financeira. Com informações mais claras, você pode acompanhar seus resultados, observar mudanças ao longo do tempo e identificar pontos que merecem atenção. Dessa forma, a plataforma contribui para uma visão mais ampla das suas finanças e para decisões mais conscientes no dia a dia.",
  },
  {
    question: "A Visora é fácil de usar mesmo para quem não tem experiência com finanças?",
    answer:
      "Sim! A Visora foi pensada para oferecer uma experiência intuitiva, com uma interface organizada e informações apresentadas de maneira compreensível. Você não precisa ser especialista em finanças para começar a entender seus dados e acompanhar seus resultados. A proposta é reduzir a complexidade das informações, facilitando a navegação e permitindo que você desenvolva gradualmente uma visão mais clara sobre sua organização financeira.",
  },
  {
    question: "Quais informações financeiras posso acompanhar utilizando a Visora?",
    answer:
      "A Visora tem como proposta facilitar a visualização e a análise de informações financeiras relevantes para a organização e o acompanhamento de resultados. Dependendo dos recursos disponíveis na plataforma, essas informações podem ajudar você a compreender melhor sua situação financeira, observar tendências e comparar resultados de diferentes períodos. A apresentação organizada dos dados permite identificar aspectos importantes e compreender melhor como eles se relacionam com seus objetivos financeiros.",
  },
  {
    question: "Como a Visora pode contribuir para que eu tome decisões financeiras melhores?",
    answer:
      "Tomar decisões financeiras conscientes exige compreender as informações disponíveis e avaliar diferentes possibilidades. A Visora busca facilitar esse processo ao transformar dados em informações mais claras, ajudando você a identificar padrões, acompanhar resultados e perceber pontos que precisam de atenção. Com uma visão mais organizada, você pode avaliar suas alternativas com maior cuidado, estabelecer prioridades e planejar suas ações com base em informações, em vez de depender apenas de impressões.",
  },
  {
    question: "Meus dados e minhas informações financeiras ficam seguros na Visora?",
    answer:
      "A proteção das informações financeiras é um aspecto importante em qualquer plataforma que trabalhe com dados pessoais. As medidas de segurança da Visora dependem dos mecanismos efetivamente implementados no sistema, como controles de acesso, proteção de dados e políticas de privacidade. Recomendamos consultar as informações oficiais da plataforma para conhecer as medidas adotadas e entender como seus dados são tratados, armazenados e protegidos.",
  },
  {
    question: "Preciso ter conhecimentos avançados ou experiência na área financeira para utilizar a Visora?",
    answer:
      "Não é necessário ter conhecimentos avançados em finanças para compreender a proposta da Visora. A plataforma busca apresentar informações de maneira organizada e acessível, tornando a análise dos dados menos complexa para diferentes perfis de usuários. Mesmo que você esteja começando a desenvolver hábitos de organização financeira, uma visualização clara das informações pode ajudar a compreender sua situação atual, reconhecer oportunidades de melhoria e construir uma relação mais consciente com suas decisões financeiras.",
  },
  {
    question: "A Visora pode me ajudar a identificar oportunidades de melhoria na minha organização financeira?",
    answer:
      "Uma análise organizada das informações financeiras pode ajudar a perceber padrões, variações e aspectos que merecem atenção. A proposta da Visora é facilitar essa visualização, permitindo que você compreenda melhor os dados disponíveis e avalie onde pode aprimorar sua organização. A partir dessas informações, você pode estabelecer prioridades, acompanhar sua evolução e planejar mudanças de maneira mais consciente. Os resultados, naturalmente, dependem dos dados utilizados e dos recursos disponíveis na plataforma.",
  },
];

export default function FAQ() {
  return (
    <section className="relative isolate overflow-hidden bg-[#F2F2F2] py-16 transition-colors duration-500 dark:bg-[#111A14] sm:py-20 lg:py-24">
      {/* Auras verdes */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-40 top-20 -z-10 h-[400px] w-[400px] rounded-full bg-[#588157]/15 blur-[120px] dark:bg-[#588157]/20"
      />

      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-32 -right-32 -z-10 h-[450px] w-[450px] rounded-full bg-[#7E9971]/20 blur-[130px] dark:bg-[#7E9971]/15"
      />

      <div className="mx-auto max-w-4xl px-5 sm:px-8">
        {/* Cabeçalho */}
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mx-auto mb-12 max-w-3xl space-y-4 text-center sm:mb-14"
        >
          <span className="inline-flex items-center rounded-full border border-[#588157]/20 bg-[#588157]/10 px-5 py-2 text-sm font-semibold uppercase tracking-[0.18em] text-[#588157] dark:border-[#7E9971]/30 dark:bg-[#588157]/15 dark:text-[#A3B18A]">
            FAQ
          </span>

          <h2 className="text-3xl font-bold leading-tight tracking-tight text-[#273B31] transition-colors duration-300 dark:text-[#E5EDE5] sm:text-4xl lg:text-5xl">
            Ficou com alguma dúvida?
            <br />
            <span className="text-[#588157] dark:text-[#A3B18A]">
              Nós temos as respostas.
            </span>
          </h2>

          <p className="mx-auto max-w-2xl text-base leading-7 text-[#3A5A40]/75 transition-colors duration-300 dark:text-[#C1CEC2]/80 sm:text-lg">
            Descubra como a Visora pode ajudar você a organizar suas finanças,
            acompanhar seus resultados e tomar decisões com mais clareza
            e segurança.
          </p>
        </motion.div>

        {/* Perguntas */}
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="mx-auto max-w-3xl"
        >
          <Accordion className="w-full">
            {faqItems.map((item, index) => (
              <AccordionItem
                key={index}
                value={`item-${index + 1}`}
                className="group border-b border-[#273B31]/10 py-1 transition-colors duration-300 dark:border-[#E5EDE5]/10"
              >
                <AccordionTrigger className="gap-4 py-5 text-left text-sm font-semibold leading-6 text-[#273B31] transition-colors hover:text-[#588157] hover:no-underline dark:text-[#E5EDE5] dark:hover:text-[#A3B18A] sm:gap-5 sm:py-6 sm:text-base [&>svg]:hidden">
                  <span className="flex min-w-0 flex-1 items-center gap-3 sm:gap-4">
                    {/* Ícone da pergunta */}
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[#588157]/15 bg-[#588157]/10 text-[#588157] transition-all duration-300 group-hover:border-[#588157]/30 group-hover:bg-[#588157]/15 dark:border-[#7E9971]/20 dark:bg-[#588157]/15 dark:text-[#A3B18A] dark:group-hover:bg-[#588157]/25 sm:h-11 sm:w-11">
                      <CircleHelp size={21} strokeWidth={1.7} />
                    </span>

                    <span className="flex-1">
                      {item.question}
                    </span>
                  </span>

                  {/* Ícone de expansão */}
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-[#273B31]/10 text-[#273B31]/60 transition-all duration-300 group-hover:border-[#588157]/30 group-hover:bg-[#588157]/10 group-hover:text-[#588157] group-data-[state=open]:rotate-45 group-data-[state=open]:border-[#588157]/30 group-data-[state=open]:text-[#588157] dark:border-[#E5EDE5]/15 dark:text-[#C1CEC2]/70 dark:group-hover:border-[#7E9971]/40 dark:group-hover:bg-[#588157]/15 dark:group-hover:text-[#A3B18A] dark:group-data-[state=open]:border-[#7E9971]/40 dark:group-data-[state=open]:text-[#A3B18A]">
                    <Plus size={18} strokeWidth={1.8} />
                  </span>
                </AccordionTrigger>

                <AccordionContent className="pb-5 pl-[52px] pr-2 text-sm leading-7 text-[#626A63] transition-colors duration-300 dark:text-[#C1CEC2]/80 sm:pb-6 sm:pl-[60px] sm:text-[15px]">
                  {item.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </motion.div>

        {/* Rodapé */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mt-10 flex items-center justify-center gap-3 text-center sm:mt-12"
        >
          <MessageCircle
            size={20}
            strokeWidth={1.7}
            className="shrink-0 text-[#588157] dark:text-[#A3B18A]"
          />

          <p className="text-sm leading-6 text-[#626A63] transition-colors duration-300 dark:text-[#C1CEC2]/80 sm:text-base">
            Estamos aqui para ajudar você a ter mais clareza sobre suas finanças.
          </p>
        </motion.div>
      </div>
    </section>
  );
}

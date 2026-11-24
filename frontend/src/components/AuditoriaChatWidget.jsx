"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import { useEffect, useRef, useState } from "react";
import { Bot, MessageCircle, X, Send, Loader2, ShieldCheck, AlertCircle } from "lucide-react";

const SUGESTOES = [
  "Explique os principais riscos da auditoria.",
  "Como posso investigar um apontamento?",
  "O que devo verificar antes de resolver um alerta?",
];

function MensagemFormatada({ conteudo }) {
    return (
      <div className="min-w-0 break-words text-sm leading-relaxed text-[#273B31] dark:text-[#E5EDE5]">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={{
            h1: ({ children }) => (
              <h1 className="mb-3 mt-4 text-lg font-bold text-[#344E41] first:mt-0 dark:text-[#A3B18A]">
                {children}
              </h1>
            ),

            h2: ({ children }) => (
              <h2 className="mb-2 mt-4 text-base font-bold text-[#344E41] first:mt-0 dark:text-[#A3B18A]">
                {children}
              </h2>
            ),

            h3: ({ children }) => (
              <h3 className="mb-2 mt-3 text-sm font-bold text-[#344E41] first:mt-0 dark:text-[#A3B18A]">
                {children}
              </h3>
            ),

            p: ({ children }) => (
              <p className="mb-3 last:mb-0">
                {children}
              </p>
            ),

            strong: ({ children }) => (
              <strong className="font-bold text-[#344E41] dark:text-[#A3B18A]">
                {children}
              </strong>
            ),

            ul: ({ children }) => (
              <ul className="mb-3 list-disc space-y-1 pl-5">
                {children}
              </ul>
            ),

            ol: ({ children }) => (
              <ol className="mb-3 list-decimal space-y-1 pl-5">
                {children}
              </ol>
            ),

            li: ({ children }) => (
              <li className="pl-1">
                {children}
              </li>
            ),

            hr: () => (
              <hr className="my-4 border-[#DAD7CD] dark:border-[#34483A]" />
            ),

            blockquote: ({ children }) => (
              <blockquote className="my-3 border-l-4 border-[#588157] bg-[#588157]/5 py-2 pl-3 italic dark:bg-[#588157]/10">
                {children}
              </blockquote>
            ),

            code: ({ children, className }) => (
              <code
                className={`${className || ""} rounded bg-[#E5EDE5] px-1 py-0.5 text-xs dark:bg-[#34483A]`}
              >
                {children}
              </code>
            ),

            pre: ({ children }) => (
              <pre className="my-3 overflow-x-auto rounded-lg bg-[#E5EDE5] p-3 text-xs dark:bg-[#1C2920]">
                {children}
              </pre>
            ),

            table: ({ children }) => (
              <div className="my-3 overflow-x-auto">
                <table className="w-full border-collapse text-left text-xs">
                  {children}
                </table>
              </div>
            ),

            th: ({ children }) => (
              <th className="border border-[#DAD7CD] bg-[#588157]/10 p-2 font-semibold dark:border-[#34483A]">
                {children}
              </th>
            ),

            td: ({ children }) => (
              <td className="border border-[#DAD7CD] p-2 dark:border-[#34483A]">
                {children}
              </td>
            ),
          }}
        >
          {conteudo || ""}
        </ReactMarkdown>
      </div>
    );
  }

export default function AuditoriaChatWidget({ token, empresaId, apontamento, aberto, setAberto }) {
  const [mensagens, setMensagens] = useState([]);
  const [texto, setTexto] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState("");
  const fimRef = useRef(null);
  const requisicaoRef = useRef(null);
  const contextoRef = useRef(null);

  useEffect(() => {
    fimRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [mensagens, enviando, aberto]);

  useEffect(() => {
    const novoId = apontamento?.id ?? null;
    if (contextoRef.current !== novoId) {
      requisicaoRef.current?.abort();
      contextoRef.current = novoId;
      setMensagens([]);
      setErro("");
      setTexto("");
      setEnviando(false);
    }
  }, [apontamento?.id]);

  useEffect(() => () => requisicaoRef.current?.abort(), []);

  async function enviar(evento, sugestao) {
    evento?.preventDefault();
    const mensagem = (sugestao ?? texto).trim();
    if (!mensagem || enviando || !token || !empresaId) return;

    const historico = mensagens.map(({ papel, conteudo }) => ({ papel, conteudo }));
    setMensagens((anterior) => [...anterior, { papel: "usuario", conteudo: mensagem }]);
    setTexto("");
    setErro("");
    setEnviando(true);

    const controller = new AbortController();
    requisicaoRef.current = controller;
    try {
      const base = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api").replace(/\/+$/, "");
      const resposta = await fetch(`${base}/auditoria/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ empresaId, apontamentoId: apontamento?.id ?? null, mensagem, historico }),
        signal: controller.signal,
      });
      const dados = await resposta.json().catch(() => ({}));
      if (!resposta.ok) throw new Error(dados.mensagem || dados.erro || `Erro HTTP ${resposta.status}`);
      const conteudo = dados.resposta ?? dados.mensagemIA ?? dados.dados?.resposta;
      if (typeof conteudo !== "string" || !conteudo.trim()) throw new Error("A API não retornou uma resposta válida.");
      setMensagens((anterior) => [...anterior, { papel: "assistente", conteudo }]);
    } catch (e) {
      if (e.name !== "AbortError") {
        setErro(e.message === "Failed to fetch" ? "Não foi possível conectar ao backend. Verifique a rota POST /api/auditoria/chat." : e.message);
      }
    } finally {
      if (requisicaoRef.current === controller) {
        requisicaoRef.current = null;
        setEnviando(false);
      }
    }
  }


  return (
    <div className="fixed bottom-5 right-4 z-[110] sm:bottom-6 sm:right-6">
      {aberto && (
        <section role="dialog" aria-label="Vion Auditoria" className="mb-3 flex h-[min(570px,calc(100dvh-110px))] w-[calc(100vw-32px)] max-w-[390px] flex-col overflow-hidden rounded-2xl border border-[#DAD7CD] bg-white text-[#273B31] shadow-2xl dark:border-[#34483A] dark:bg-[#1C2920] dark:text-[#E5EDE5]">
          <header className="flex items-center gap-3 bg-[#344E41] px-4 py-3 text-white">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/15"><Bot size={22} /></span>
            <div className="min-w-0 flex-1"><h2 className="font-semibold">Vion Auditoria</h2><p className="text-xs text-white/75">Assistente especializado em auditoria</p></div>
            <button type="button" onClick={() => setAberto(false)} aria-label="Fechar chat" className="rounded-lg p-2 hover:bg-white/15"><X size={19}/></button>
          </header>

          {apontamento && (
            <div className="border-b border-[#DAD7CD] bg-[#EDF2EA] px-4 py-2 text-xs dark:border-[#34483A] dark:bg-[#273B31]">
              <p className="font-semibold">Analisando apontamento #{apontamento.id}</p>
              <p className="truncate opacity-80">{apontamento.titulo || apontamento.descricao}</p>
            </div>
          )}

          <div aria-live="polite" className="min-h-0 flex-1 space-y-3 overflow-y-auto p-4">
            {mensagens.length === 0 && (
              <div className="space-y-4">
                <div className="flex gap-2"><ShieldCheck className="mt-0.5 shrink-0 text-[#588157]" size={20}/><p className="text-sm leading-relaxed">Olá! Posso ajudar a interpretar os apontamentos da auditoria e sugerir verificações. As respostas precisam ser conferidas antes de decisões financeiras.</p></div>
                <p className="text-xs font-semibold text-[#6A7C70] dark:text-[#A3B18A]">Perguntas sugeridas</p>
                {(apontamento ? ["Por que este apontamento foi gerado?", "Qual é o risco deste apontamento?", "Como posso verificar esta inconsistência?"] : SUGESTOES).map((s) => (
                  <button key={s} type="button" onClick={() => enviar(null, s)} disabled={enviando || !token || !empresaId} className="block w-full rounded-xl border border-[#DAD7CD] px-3 py-2 text-left text-xs transition hover:bg-[#EDF2EA] disabled:opacity-50 dark:border-[#34483A] dark:hover:bg-[#273B31]">{s}</button>
                ))}
              </div>
            )}
            {mensagens.map((m, i) => (
              <div key={i} className={`flex ${m.papel === "usuario" ? "justify-end" : "justify-start"}`}>
                <div className={`min-w-0 max-w-[88%] break-words rounded-2xl px-3 py-2 text-sm leading-relaxed ${m.papel === "usuario" ? "bg-[#588157] text-white" : "bg-[#EDF2EA] text-[#273B31] dark:bg-[#273B31] dark:text-[#E5EDE5]"}`}>
                  {m.papel === "assistente" ? (
                    <MensagemFormatada conteudo={m.conteudo} />
                  ) : (
                    <p className="whitespace-pre-wrap break-words">{m.conteudo}</p>
                  )}
                </div>
              </div>
            ))}
            {enviando && <p className="flex items-center gap-2 text-xs text-[#6A7C70] dark:text-[#A3B18A]"><Loader2 size={15} className="animate-spin"/> Vion está analisando...</p>}
            {erro && <p role="alert" className="flex items-start gap-2 rounded-lg bg-red-50 p-2 text-xs text-red-700 dark:bg-red-950/30 dark:text-red-300"><AlertCircle size={16} className="shrink-0"/>{erro}</p>}
            <div ref={fimRef}/>
          </div>

          <form onSubmit={enviar} className="flex items-end gap-2 border-t border-[#DAD7CD] p-3 dark:border-[#34483A]">
            <textarea aria-label="Mensagem para Vion Auditoria" rows={2} maxLength={2000} value={texto} onChange={(e) => setTexto(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) { e.preventDefault(); enviar(); } }} placeholder="Pergunte sobre a auditoria..." className="max-h-28 min-h-11 flex-1 resize-none rounded-xl border border-[#DAD7CD] bg-white px-3 py-2 text-sm outline-none focus:border-[#588157] dark:border-[#34483A] dark:bg-[#111A14]"/>
            <button type="submit" aria-label="Enviar mensagem" disabled={!texto.trim() || enviando || !token || !empresaId} className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#588157] text-white hover:bg-[#3A5A40] disabled:opacity-50"><Send size={18}/></button>
          </form>
        </section>
      )}
      <div className="flex justify-end"><button type="button" onClick={() => setAberto(!aberto)} aria-label={aberto ? "Fechar Vion Auditoria" : "Abrir Vion Auditoria"} className="flex h-14 w-14 items-center justify-center rounded-full bg-[#588157] text-white shadow-xl transition hover:scale-105 hover:bg-[#3A5A40]">{aberto ? <X size={24}/> : <MessageCircle size={25}/>}</button></div>
    </div>
  );
}

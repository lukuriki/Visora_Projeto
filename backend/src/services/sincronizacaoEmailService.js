
import { ImapFlow } from "imapflow";
import { simpleParser } from "mailparser";

import db from "../config/database.js";

// ==========================================
// CONFIGURAÇÃO DO IMAP
// ==========================================

function criarClienteIMAP() {
  const {
    IMAP_HOST,
    IMAP_PORT,
    IMAP_USER,
    IMAP_PASSWORD,
  } = process.env;

  if (
    !IMAP_HOST ||
    !IMAP_PORT ||
    !IMAP_USER ||
    !IMAP_PASSWORD
  ) {
    throw new Error(
      "As configurações IMAP não foram definidas."
    );
  }

  return new ImapFlow({
    host: IMAP_HOST,
    port: Number(IMAP_PORT),
    secure: true,
    auth: {
      user: IMAP_USER,
      pass: IMAP_PASSWORD,
    },
    logger: false,
  });
}

// ==========================================
// IDENTIFICAR CONVERSA PELO ASSUNTO
// ==========================================

function identificarConversa(assunto = "") {
  const resultado = assunto.match(/\[VISORA-(\d+)\]/i);

  if (!resultado) {
    return null;
  }

  const conversaId = Number(resultado[1]);

  if (!Number.isSafeInteger(conversaId) || conversaId <= 0) {
    return null;
  }

  return conversaId;
}

// ==========================================
// NORMALIZAR ENDEREÇO DE E-MAIL
// ==========================================

function normalizarEmail(email = "") {
  return String(email).trim().toLowerCase();
}


// ==========================================
// LIMPAR RESPOSTAS RECEBIDAS DO GMAIL
// ==========================================


function limparRespostaEmail(texto = "") {
  if (!texto) return "";

  const linhas = String(texto)
    .replace(/\r\n/g, "\n")
    .split("\n");

  const linhasLimpas = [];

  for (const linha of linhas) {
    const conteudo = linha.trim();

    // Detecta o cabeçalho de resposta do Gmail.
    // Exemplo:
    // Em ter., 17 de nov. de 2026 às 17:58, Visora <email>
    // escreveu:
    const cabecalhoGmail = conteudo.match(
      /^Em\s+.+?,\s*(.+?)\s*,\s*.+?(?:<[^>]+>)?\s*$/i
    );

    if (
      /^Em .+escreveu:\s*$/i.test(conteudo) ||
      /^On .+wrote:\s*$/i.test(conteudo) ||
      /^-----Original Message-----/i.test(conteudo)
    ) {
      break;
    }

    if (cabecalhoGmail && /às\s+\d{1,2}:\d{2}/i.test(conteudo)) {
      // Extrai apenas a data e o horário.
      const data = conteudo.match(
        /(\d{1,2}\s+de\s+\w+\.?\s+de\s+\d{4}\s+às\s+\d{1,2}:\d{2})/i
      );

      if (data) {
        linhasLimpas.push(data[1]);
      }

      break;
    }

    if (/^escreveu:\s*$/i.test(conteudo)) {
      break;
    }

    if (conteudo.startsWith(">")) {
      continue;
    }

    linhasLimpas.push(linha);
  }

  return linhasLimpas.join("\n").trim();
}



// ==========================================
// VERIFICAR SE O E-MAIL JÁ FOI IMPORTADO
// ==========================================

async function emailJaImportado(messageId) {
  const [resultado] = await db.execute(
    `SELECT id
     FROM mensagens_email_recebidos
     WHERE message_id = ?
     LIMIT 1`,
    [messageId]
  );

  return resultado.length > 0;
}

// ==========================================
// SALVAR RESPOSTA RECEBIDA
// ==========================================

async function salvarRespostaRecebida({
  conversaId,
  messageId,
  remetente,
  mensagem,
}) {
  const conexao = await db.getConnection();

  try {
    await conexao.beginTransaction();

    const [conversas] = await conexao.execute(
      `SELECT id, email
       FROM conversas
       WHERE id = ?
       FOR UPDATE`,
      [conversaId]
    );

    if (conversas.length === 0) {
      await conexao.rollback();
      return false;
    }

    const conversa = conversas[0];

    // Impede que outro remetente utilize
    // o código de uma conversa diferente.
    if (
      normalizarEmail(conversa.email) !==
      normalizarEmail(remetente)
    ) {
      await conexao.rollback();
      return false;
    }

    // Reserva o identificador do e-mail.
    // A restrição UNIQUE evita duplicações.
    const [registro] = await conexao.execute(
      `INSERT IGNORE INTO mensagens_email_recebidos
       (message_id, conversa_id)
       VALUES (?, ?)`,
      [messageId, conversaId]
    );

    if (registro.affectedRows === 0) {
      await conexao.rollback();
      return false;
    }

    const [resultadoMensagem] = await conexao.execute(
      `INSERT INTO mensagens
       (conversa_id, autor, mensagem)
       VALUES (?, 'cliente', ?)`,
      [conversaId, mensagem]
    );

    await conexao.execute(
      `UPDATE mensagens_email_recebidos
       SET mensagem_id = ?
       WHERE message_id = ?`,
      [resultadoMensagem.insertId, messageId]
    );

    await conexao.execute(
      `UPDATE conversas
       SET status = 'aberta',
           atualizado_em = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [conversaId]
    );

    await conexao.commit();

    return true;

  } catch (erro) {
    await conexao.rollback();
    throw erro;

  } finally {
    conexao.release();
  }
}

// ==========================================
// SINCRONIZAR RESPOSTAS DO GMAIL
// ==========================================

export async function sincronizarRespostasEmail() {
  const cliente = criarClienteIMAP();

  let conectado = false;
  let bloqueio = null;
  let importadas = 0;

  try {
    await cliente.connect();
    conectado = true;

    bloqueio = await cliente.getMailboxLock("INBOX");

    // Busca somente mensagens ainda não lidas.
    const uids = await cliente.search(
      { seen: false },
      { uid: true }
    );

    for (const uid of uids) {
      try {
        const email = await cliente.fetchOne(
          uid,
          {
            envelope: true,
            source: true,
          },
          { uid: true }
        );

        if (!email?.source) {
          continue;
        }

        const assunto = email.envelope?.subject || "";
        const conversaId = identificarConversa(assunto);

        if (!conversaId) {
          continue;
        }

        const parsed = await simpleParser(email.source);

        const messageId = String(
          parsed.messageId || ""
        ).trim();

        const remetente =
          parsed.from?.value?.[0]?.address || "";

        const mensagem = limparRespostaEmail(
          parsed.text || ""
        ).trim();

        if (!messageId || !remetente || !mensagem) {
          continue;
        }

        if (await emailJaImportado(messageId)) {
          continue;
        }

        const salva = await salvarRespostaRecebida({
          conversaId,
          messageId,
          remetente,
          mensagem,
        });

        if (salva) {
          importadas++;

          console.log(
            `Resposta recebida para a conversa #${conversaId}`
          );
        }

      } catch (erro) {
        console.error(
          `Erro ao processar e-mail UID ${uid}:`,
          erro
        );
      }
    }

    return {
      sucesso: true,
      importadas,
    };

  } catch (erro) {
    console.error(
      "Erro ao sincronizar respostas por e-mail:",
      erro
    );

    throw erro;

  } finally {
    if (bloqueio) {
      bloqueio.release();
    }

    if (conectado) {
      await cliente.logout().catch(() => {});
    }
  }
}


import db from "../config/database.js";
import nodemailer from "nodemailer";

// ==========================================
// CONFIGURAÇÃO DO NODEMAILER
// ==========================================

function criarTransportador() {
  const porta = Number(process.env.SMTP_PORT);

  if (
    !process.env.SMTP_HOST ||
    !porta ||
    !process.env.SMTP_USER ||
    !process.env.SMTP_PASSWORD ||
    !process.env.EMAIL_FROM
  ) {
    throw new Error("As configurações SMTP não foram definidas corretamente.");
  }

  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: porta,
    secure: porta === 465,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASSWORD,
    },
  });
}

// ==========================================
// PROTEÇÃO DO CONTEÚDO HTML
// ==========================================

function escaparHTML(texto = "") {
  return String(texto)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

// ==========================================
// 1. CRIAR UMA CONVERSA
// ==========================================

export async function criarConversa(dados) {
  const conexao = await db.getConnection();

  try {
    await conexao.beginTransaction();

    const [resultadoConversa] = await conexao.execute(
      `INSERT INTO conversas
      (usuario_id, nome_cliente, sobrenome_cliente, email, empresa, assunto)
      VALUES (?, ?, ?, ?, ?, ?)`,
      [
        dados.usuarioId || null,
        dados.nome,
        dados.sobrenome,
        dados.email,
        dados.empresa || null,
        dados.assunto,
      ]
    );

    const conversaId = resultadoConversa.insertId;

    await conexao.execute(
      `INSERT INTO mensagens
      (conversa_id, autor, mensagem)
      VALUES (?, 'cliente', ?)`,
      [conversaId, dados.mensagem]
    );

    await conexao.commit();

    return {
      id: conversaId,
      mensagem: "Conversa criada com sucesso.",
    };
  } catch (erro) {
    await conexao.rollback();
    throw erro;
  } finally {
    conexao.release();
  }
}

// ==========================================
// 2. LISTAR TODAS AS CONVERSAS
// ==========================================

export async function listarConversas() {
  const [resultado] = await db.execute(
    `SELECT
      c.id,
      c.usuario_id,
      c.nome_cliente,
      c.sobrenome_cliente,
      c.email,
      c.empresa,
      c.assunto,
      c.status,
      c.criado_em,
      c.atualizado_em,

      (
        SELECT m.mensagem
        FROM mensagens m
        WHERE m.conversa_id = c.id
        ORDER BY m.criado_em DESC, m.id DESC
        LIMIT 1
      ) AS ultima_mensagem

    FROM conversas c
    ORDER BY c.atualizado_em DESC`
  );

  return resultado;
}

// ==========================================
// 3. BUSCAR UMA CONVERSA
// ==========================================

export async function buscarConversaPorId(id) {
  const [resultado] = await db.execute(
    `SELECT *
     FROM conversas
     WHERE id = ?`,
    [id]
  );

  return resultado[0] || null;
}

// ==========================================
// 4. LISTAR MENSAGENS DA CONVERSA
// ==========================================

export async function listarMensagens(conversaId) {
  const [resultado] = await db.execute(
    `SELECT *
     FROM mensagens
     WHERE conversa_id = ?
     ORDER BY criado_em ASC, id ASC`,
    [conversaId]
  );

  return resultado;
}

// ==========================================
// 5. LISTAR CONVERSAS DO USUÁRIO
// ==========================================

export async function listarConversasPorUsuario(usuarioId) {
  const [resultado] = await db.execute(
    `SELECT
      id,
      nome_cliente,
      sobrenome_cliente,
      email,
      assunto,
      status,
      criado_em,
      atualizado_em
     FROM conversas
     WHERE usuario_id = ?
     ORDER BY atualizado_em DESC`,
    [usuarioId]
  );

  return resultado;
}

// ==========================================
// 6. CLIENTE ENVIAR NOVA MENSAGEM
// ==========================================

export async function criarMensagemCliente(conversaId, mensagem) {
  if (!mensagem || !mensagem.trim()) {
    throw new Error("A mensagem não pode estar vazia.");
  }

  const conexao = await db.getConnection();

  try {
    await conexao.beginTransaction();

    const [resultadoConversa] = await conexao.execute(
      `SELECT id
       FROM conversas
       WHERE id = ?
       FOR UPDATE`,
      [conversaId]
    );

    if (resultadoConversa.length === 0) {
      throw new Error("Conversa não encontrada.");
    }

    const [resultado] = await conexao.execute(
      `INSERT INTO mensagens
      (conversa_id, autor, mensagem)
      VALUES (?, 'cliente', ?)`,
      [conversaId, mensagem.trim()]
    );

    await conexao.execute(
      `UPDATE conversas
       SET status = 'aberta',
           atualizado_em = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [conversaId]
    );

    await conexao.commit();

    return {
      id: resultado.insertId,
      mensagem: "Mensagem enviada com sucesso.",
    };
  } catch (erro) {
    await conexao.rollback();
    throw erro;
  } finally {
    conexao.release();
  }
}

// ==========================================
// 7. ENVIAR RESPOSTA POR E-MAIL
// ==========================================

async function enviarEmailResposta(conversa, mensagem) {
  const transportador = criarTransportador();

  const nomeCliente = escaparHTML(
    `${conversa.nome_cliente} ${conversa.sobrenome_cliente}`
  );

  const assunto = escaparHTML(conversa.assunto);
  const mensagemHTML = escaparHTML(mensagem).replace(/\n/g, "<br>");

  await transportador.sendMail({
    from: {
      name: "Visora",
      address: process.env.EMAIL_FROM,
    },

    to: conversa.email,

    subject: `Resposta da Visora: ${conversa.assunto}`,

    text: `Olá, ${conversa.nome_cliente}!

Recebemos sua mensagem sobre: ${conversa.assunto}

${mensagem}

Atenciosamente,
Equipe Visora`,

    html: `
      <div style="
        font-family: Arial, sans-serif;
        color: #333;
        max-width: 600px;
        margin: auto;
        padding: 24px;
      ">

        <h2 style="color: #3A5A40;">Visora</h2>

        <p>Olá, ${nomeCliente}!</p>

        <p>
          Recebemos sua mensagem sobre:
          <strong>${assunto}</strong>
        </p>

        <div style="
          padding: 16px;
          background-color: #f4f4f4;
          border-radius: 8px;
          margin: 20px 0;
          line-height: 1.6;
        ">
          ${mensagemHTML}
        </div>

        <p>
          Atenciosamente,<br>
          <strong>Equipe Visora</strong>
        </p>

      </div>
    `,
  });
}

// ==========================================
// 8. ADMINISTRADOR RESPONDER CONVERSA
// ==========================================

export async function responderConversa(conversaId, mensagem) {
  if (!mensagem || !mensagem.trim()) {
    throw new Error("A resposta não pode estar vazia.");
  }

  const conversa = await buscarConversaPorId(conversaId);

  if (!conversa) {
    throw new Error("Conversa não encontrada.");
  }

  if (!conversa.email) {
    throw new Error("A conversa não possui um e-mail de destinatário.");
  }

  // Salva a resposta no banco de dados.
  const [resultado] = await db.execute(
    `INSERT INTO mensagens
    (conversa_id, autor, mensagem)
    VALUES (?, 'admin', ?)`,
    [conversaId, mensagem.trim()]
  );

  const mensagemId = resultado.insertId;

  // Atualiza a data da conversa.
  await db.execute(
    `UPDATE conversas
     SET atualizado_em = CURRENT_TIMESTAMP
     WHERE id = ?`,
    [conversaId]
  );

  // Tenta enviar a resposta por e-mail.
  try {
    await enviarEmailResposta(conversa, mensagem.trim());

    // Marca o e-mail como enviado.
    await db.execute(
      `UPDATE mensagens
       SET email_enviado = TRUE,
           email_enviado_em = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [mensagemId]
    );

    // Atualiza o status da conversa.
    await db.execute(
      `UPDATE conversas
       SET status = 'respondida',
           atualizado_em = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [conversaId]
    );

    return {
      id: mensagemId,
      emailEnviado: true,
      mensagem: "Resposta enviada com sucesso.",
    };

  } catch (erro) {
    console.error("Erro ao enviar e-mail:", erro);

    return {
      id: mensagemId,
      emailEnviado: false,
      mensagem: "Resposta salva, mas não foi possível enviar o e-mail.",
    };
  }
}

// ==========================================
// 9. ATUALIZAR STATUS DA CONVERSA
// ==========================================

export async function atualizarStatus(conversaId, status) {
  const statusPermitidos = [
    "aberta",
    "respondida",
    "encerrada",
  ];

  if (!statusPermitidos.includes(status)) {
    throw new Error("Status inválido.");
  }

  const [resultado] = await db.execute(
    `UPDATE conversas
     SET status = ?,
         atualizado_em = CURRENT_TIMESTAMP
     WHERE id = ?`,
    [status, conversaId]
  );

  return resultado.affectedRows > 0;
}

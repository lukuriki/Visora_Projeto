
import db from "../config/database.js";
import nodemailer from "nodemailer";



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


function escaparHTML(texto = "") {
  return String(texto)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}


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


export async function buscarConversaPorId(id) {
  const [resultado] = await db.execute(
    `SELECT *
     FROM conversas
     WHERE id = ?`,
    [id]
  );

  return resultado[0] || null;
}


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




async function enviarEmailResposta(conversa, mensagem) {
  const transportador = criarTransportador();

  const nomeCliente = escaparHTML(
    `${conversa.nome_cliente} ${conversa.sobrenome_cliente}`
  );

  const assunto = escaparHTML(conversa.assunto);
  const mensagemHTML = escaparHTML(mensagem).replace(/\n/g, "<br>");

  const codigoConversa = `[VISORA-${conversa.id}]`;

  const assuntoEmail = `Re: ${codigoConversa} ${conversa.assunto}`;

  const emailRemetente = process.env.SMTP_USER;

  const resultado = await transportador.sendMail({
    from: {
      name: "Visora",
      address: emailRemetente,
    },

    to: conversa.email,

    replyTo: emailRemetente,

    subject: assuntoEmail,

    text: `Olá, ${conversa.nome_cliente}!

Sua solicitação está registrada sob o código ${codigoConversa}.

${mensagem}

Caso tenha outras dúvidas, basta responder diretamente a este e-mail.

Atenciosamente,
Equipe Visora`,

    html: `
      <div style="
        font-family: Arial, sans-serif;
        color: #273B31;
        max-width: 600px;
        margin: auto;
        padding: 32px 24px;
      ">

        <h2 style="
          color: #3A5A40;
          margin-bottom: 24px;
        ">
          Visora
        </h2>

        <p>Olá, ${nomeCliente}!</p>

        <p>
          Estamos respondendo à sua solicitação:
          <strong>${assunto}</strong>
        </p>

        <div style="
          padding: 20px;
          background-color: #F2F5F0;
          border-left: 4px solid #588157;
          border-radius: 8px;
          margin: 24px 0;
          line-height: 1.7;
        ">
          ${mensagemHTML}
        </div>

        <p>
          Ficou com alguma dúvida?
          <strong>Responda diretamente a este e-mail.</strong>
          Nossa equipe receberá sua mensagem.
        </p>

        <p style="
          margin-top: 32px;
          line-height: 1.7;
        ">
          Atenciosamente,<br>
          <strong>Equipe Visora</strong>
        </p>

        <hr style="
          border: none;
          border-top: 1px solid #DAD7CD;
          margin: 28px 0;
        ">

        <p style="
          font-size: 12px;
          color: #7E9971;
        ">
          Protocolo de atendimento: ${codigoConversa}
        </p>

      </div>
    `,
  });

  return {
    messageId: resultado.messageId,
    codigoConversa,
  };
}




export async function responderConversa(conversaId, mensagem) {
  const texto = typeof mensagem === "string"
    ? mensagem.trim()
    : "";

  if (!texto) {
    throw new Error("A resposta não pode estar vazia.");
  }

  const conversa = await buscarConversaPorId(conversaId);

  if (!conversa) {
    throw new Error("Conversa não encontrada.");
  }

  if (conversa.status === "encerrada") {
    throw new Error(
      "Não é possível responder uma conversa encerrada."
    );
  }

  if (!conversa.email) {
    throw new Error(
      "A conversa não possui um e-mail de destinatário."
    );
  }


  const [resultado] = await db.execute(
    `INSERT INTO mensagens
      (conversa_id, autor, mensagem, email_enviado)
     VALUES (?, 'admin', ?, FALSE)`,
    [conversaId, texto]
  );

  const mensagemId = resultado.insertId;

  await db.execute(
    `UPDATE conversas
     SET atualizado_em = CURRENT_TIMESTAMP
     WHERE id = ?`,
    [conversaId]
  );

  try {

    await enviarEmailResposta(conversa, texto);


    await db.execute(
      `UPDATE mensagens
       SET email_enviado = TRUE,
           email_enviado_em = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [mensagemId]
    );


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
      mensagem: "Resposta enviada ao e-mail do cliente.",
    };

  } catch (erro) {
    console.error("Erro ao enviar e-mail:", erro);

    return {
      id: mensagemId,
      emailEnviado: false,
      mensagem:
        "A resposta foi salva, mas não foi possível confirmar o envio do e-mail.",
    };
  }
}



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

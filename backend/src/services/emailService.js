
import nodemailer from "nodemailer";

let transporter = null;

function obterTransporter() {
  const {
    SMTP_HOST,
    SMTP_PORT,
    SMTP_USER,
    SMTP_PASSWORD,
    EMAIL_FROM,
  } = process.env;

  if (!SMTP_HOST || !SMTP_PORT || !SMTP_USER || !SMTP_PASSWORD || !EMAIL_FROM) {
    throw new Error(
      "Configurações de e-mail incompletas. Verifique as variáveis SMTP no arquivo .env."
    );
  }

  if (!transporter) {
    const porta = Number(SMTP_PORT);

    if (!Number.isInteger(porta) || porta <= 0) {
      throw new Error("A porta SMTP configurada é inválida.");
    }

    transporter = nodemailer.createTransport({
      host: SMTP_HOST,
      port: porta,
      secure: porta === 465,
      auth: {
        user: SMTP_USER,
        pass: SMTP_PASSWORD,
      },
    });
  }

  return transporter;
}

function escaparHTML(valor = "") {
  return String(valor).replace(/[&<>"']/g, (caractere) => {
    const caracteres = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    };

    return caracteres[caractere];
  });
}

export async function enviarCredenciais({
  para,
  nome,
  nomeUsuario,
  linkAtivacao,
}) {
  if (!para || !nome || !nomeUsuario || !linkAtivacao) {
    throw new Error(
      "Informe o destinatário, o nome, o usuário e o link de ativação."
    );
  }

  const url = new URL(linkAtivacao);

  if (url.protocol !== "https:" && url.hostname !== "localhost") {
    throw new Error("O link de ativação precisa utilizar HTTPS.");
  }

  const transport = obterTransporter();

  const nomeSeguro = escaparHTML(nome);
  const usuarioSeguro = escaparHTML(nomeUsuario);
  const linkSeguro = escaparHTML(url.toString());

  const assunto = "Ative sua conta na Visora";

  const texto = [
    `Olá, ${nome}!`,
    "",
    "Sua contratação foi confirmada e sua conta na Visora está pronta para ser ativada.",
    "",
    `Nome de usuário: ${nomeUsuario}`,
    "",
    "Para definir sua senha e acessar a plataforma, utilize o link abaixo:",
    url.toString(),
    "",
    "Por segurança, não compartilhe seu link de ativação.",
    "Se você não reconhece esta solicitação, entre em contato com o suporte da Visora.",
    "",
    "Atenciosamente,",
    "Equipe Visora",
  ].join("\n");

  const html = `
    <!DOCTYPE html>
    <html lang="pt-BR">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Ative sua conta na Visora</title>
      </head>
      <body style="margin:0;padding:0;background-color:#F2F2F2;font-family:Arial,Helvetica,sans-serif;color:#273B31;">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color:#F2F2F2;padding:32px 12px;">
          <tr>
            <td align="center">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:600px;background-color:#FFFFFF;border-radius:12px;overflow:hidden;">
                <tr>
                  <td style="background-color:#273B31;padding:28px 32px;text-align:center;">
                    <h1 style="margin:0;color:#FFFFFF;font-size:28px;letter-spacing:1px;">VISORA</h1>
                    <p style="margin:8px 0 0;color:#DDE7D8;font-size:14px;">Gestão inteligente para sua empresa</p>
                  </td>
                </tr>

                <tr>
                  <td style="padding:36px 32px;">
                    <h2 style="margin:0 0 20px;font-size:22px;color:#273B31;">
                      Bem-vindo(a) à Visora!
                    </h2>

                    <p style="font-size:15px;line-height:1.7;margin:0 0 16px;">
                      Olá, <strong>${nomeSeguro}</strong>!
                    </p>

                    <p style="font-size:15px;line-height:1.7;margin:0 0 20px;">
                      Sua contratação foi confirmada. Agora, você pode ativar
                      sua conta e preparar seu acesso à plataforma.
                    </p>

                    <div style="background-color:#F2F2F2;border-radius:8px;padding:16px 20px;margin:0 0 24px;">
                      <p style="margin:0 0 6px;font-size:13px;color:#526456;">
                        SEU NOME DE USUÁRIO
                      </p>
                      <p style="margin:0;font-size:16px;font-weight:bold;overflow-wrap:anywhere;">
                        ${usuarioSeguro}
                      </p>
                    </div>

                    <p style="font-size:15px;line-height:1.7;margin:0 0 24px;">
                      Clique no botão abaixo para definir sua senha e concluir
                      a ativação da conta.
                    </p>

                    <table role="presentation" cellspacing="0" cellpadding="0" style="margin:0 auto 24px;">
                      <tr>
                        <td align="center" bgcolor="#588157" style="border-radius:8px;">
                          <a href="${linkSeguro}" style="display:inline-block;padding:15px 28px;color:#FFFFFF;text-decoration:none;font-size:15px;font-weight:bold;">
                            Ativar minha conta
                          </a>
                        </td>
                      </tr>
                    </table>

                    <p style="font-size:13px;line-height:1.7;color:#626B64;margin:0 0 12px;">
                      Por segurança, não compartilhe seu link de ativação.
                      Se o botão não funcionar, copie e cole este endereço no navegador:
                    </p>

                    <p style="font-size:12px;line-height:1.7;overflow-wrap:anywhere;margin:0 0 24px;">
                      <a href="${linkSeguro}" style="color:#3A5A40;">${linkSeguro}</a>
                    </p>

                    <p style="font-size:13px;line-height:1.7;color:#626B64;margin:0;">
                      Se você não reconhece esta solicitação, entre em contato
                      com o suporte da Visora.
                    </p>

                    <p style="font-size:15px;line-height:1.7;margin:28px 0 0;">
                      Atenciosamente,<br />
                      <strong>Equipe Visora</strong>
                    </p>
                  </td>
                </tr>

                <tr>
                  <td style="background-color:#F2F2F2;padding:20px 32px;text-align:center;">
                    <p style="font-size:12px;line-height:1.6;color:#626B64;margin:0;">
                      Esta é uma mensagem automática. Por favor, não responda diretamente a este e-mail.
                    </p>
                    <p style="font-size:12px;color:#626B64;margin:8px 0 0;">
                      © ${new Date().getFullYear()} Visora. Todos os direitos reservados.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
    </html>
  `;

  const resultado = await transport.sendMail({
    from: process.env.EMAIL_FROM,
    to: para,
    subject: assunto,
    text: texto,
    html,
  });

  return {
    messageId: resultado.messageId,
  };
}

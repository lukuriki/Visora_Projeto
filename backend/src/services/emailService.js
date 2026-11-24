import path from "node:path";
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
  const linkSeguro = escaparHTML(url.toString());

  const assunto = "Sua conta está pronta para ativação | Visora";

  const texto = [
    `Olá, ${nome}!`,
    "",
    "Sua contratação foi confirmada e sua conta na Visora está pronta para ativação.",
    "",
    "Acesse o link abaixo para ativar sua conta e consultar suas credenciais de acesso, geradas automaticamente pela Visora.",
    "",
    url.toString(),
    "",
    "Após a ativação, salve seu nome de usuário e sua senha em um local seguro.",
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
                  <td style="background-color:#FFFFFF;padding:28px 32px;text-align:center;">
                    <img
                      src="cid:logo-visora"
                      alt="Visora"
                      width="380"
                      style="display:block;width:100%;max-width:380px;height:auto;margin:0 auto;"
                    />

                    <p style="margin:12px 0 0;color:#526456;font-size:14px;">
                      Gestão inteligente para sua empresa
                    </p>
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
                      Sua contratação foi confirmada! Estamos muito felizes
                      em ter você conosco.
                    </p>

                    <p style="font-size:15px;line-height:1.7;margin:0 0 24px;">
                      Para concluir seu cadastro, acesse o botão abaixo.
                      A Visora irá gerar automaticamente seu nome de usuário
                      e sua senha de acesso.
                    </p>

                    <table role="presentation" cellspacing="0" cellpadding="0" style="margin:0 auto 24px;">
                      <tr>
                        <td align="center" bgcolor="#588157" style="border-radius:8px;">
                          <a
                            href="${linkSeguro}"
                            style="display:inline-block;padding:15px 28px;color:#FFFFFF;text-decoration:none;font-size:15px;font-weight:bold;"
                          >
                            Ativar minha conta
                          </a>
                        </td>
                      </tr>
                    </table>

                    <p style="font-size:13px;line-height:1.7;color:#626B64;margin:0 0 12px;">
                      Após a ativação, suas credenciais serão apresentadas
                      na tela. Salve essas informações em um local seguro.
                    </p>

                    <p style="font-size:13px;line-height:1.7;color:#626B64;margin:0 0 12px;">
                      Por segurança, não compartilhe seu link de ativação.
                      Ele possui validade de 48 horas e só pode ser utilizado uma vez.
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
    attachments: [
      {
        filename: "logo_horizontal_lightmode.png",
        path: path.join(
          process.cwd(),
          "src",
          "assets",
          "logo_horizontal_lightmode.png"
        ),
        cid: "logo-visora",
        contentDisposition: "inline",
      },
    ],
  });

  return {
    messageId: resultado.messageId,
  };
}

export async function enviarEmailRecuperacaoSenha({
  para,
  nome,
  linkRecuperacao,
}) {
  if (!para || !nome || !linkRecuperacao) {
    throw new Error(
      "Informe o destinatário, o nome e o link de recuperação."
    );
  }

  const url = new URL(linkRecuperacao);

  if (url.protocol !== "https:" && url.hostname !== "localhost") {
    throw new Error("O link de recuperação precisa utilizar HTTPS.");
  }

  const transport = obterTransporter();

  const nomeSeguro = escaparHTML(nome);
  const linkSeguro = escaparHTML(url.toString());

  const assunto = "Recuperação de Senha | Visora";

  const texto = [
    `Olá, ${nome}!`,
    "",
    "Recebemos uma solicitação para redefinir a senha da sua conta na Visora.",
    "",
    "Este link é válido por 1 hora.",
    "Se você não solicitou a redefinição, pode ignorar este e-mail com segurança. Sua senha não será alterada.",
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
        <title>Recuperação de Senha Visora</title>
      </head>

      <body style="margin:0;padding:0;background-color:#F2F2F2;font-family:Arial,Helvetica,sans-serif;color:#273B31;">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color:#F2F2F2;padding:32px 12px;">
          <tr>
            <td align="center">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:600px;background-color:#FFFFFF;border-radius:12px;overflow:hidden;">

                <tr>
                  <td style="background-color:#FFFFFF;padding:28px 32px;text-align:center;">
                    <img
                      src="cid:logo-visora"
                      alt="Visora"
                      width="380"
                      style="display:block;width:100%;max-width:380px;height:auto;margin:0 auto;"
                    />
                  </td>
                </tr>

                <tr>
                  <td style="padding:36px 32px;">
                    <h2 style="margin:0 0 20px;font-size:22px;color:#273B31;">
                      Recuperação de Senha
                    </h2>

                    <p style="font-size:15px;line-height:1.7;margin:0 0 16px;">
                      Olá, <strong>${nomeSeguro}</strong>!
                    </p>

                    <p style="font-size:15px;line-height:1.7;margin:0 0 24px;">
                      Recebemos uma solicitação para redefinir a senha da sua conta.
                      Clique no botão abaixo para criar uma nova senha:
                    </p>

                    <table role="presentation" cellspacing="0" cellpadding="0" style="margin:0 auto 24px;">
                      <tr>
                        <td align="center" bgcolor="#588157" style="border-radius:8px;">
                          <a
                            href="${linkSeguro}"
                            style="display:inline-block;padding:15px 28px;color:#FFFFFF;text-decoration:none;font-size:15px;font-weight:bold;"
                          >
                            Redefinir minha senha
                          </a>
                        </td>
                      </tr>
                    </table>

                    <p style="font-size:13px;line-height:1.7;color:#626B64;margin:0 0 12px;">
                      Este link é válido por <strong>1 hora</strong>.
                    </p>

                    <p style="font-size:13px;line-height:1.7;color:#626B64;margin:0;">
                      Se você não solicitou a redefinição de senha, por favor, ignore
                      este e-mail. Nenhuma alteração será feita na sua conta.
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
    attachments: [
      {
        filename: "logo_horizontal_lightmode.png",
        path: path.join(
          process.cwd(),
          "src",
          "assets",
          "logo_horizontal_lightmode.png"
        ),
        cid: "logo-visora",
        contentDisposition: "inline",
      },
    ],
  });

  return {
    messageId: resultado.messageId,
  };
}


export async function enviarEmailRecuperacaoUsuario({
  para,
  nome,
  nomeUsuario,
}) {
  if (!para || !nome || !nomeUsuario) {
    throw new Error(
      "Informe o destinatário, o nome e o usuário."
    );
  }

  const transport = obterTransporter();

  const nomeSeguro = escaparHTML(nome);
  const usuarioSeguro = escaparHTML(nomeUsuario);

  const assunto = "Recuperação de Usuário | Visora";

  

  const texto = [
    `Olá, ${nome}!`,
    "",
    "Recebemos uma solicitação para recuperar seu nome de usuário da Visora.",
    "",
    `Seu nome de usuário é: ${nomeUsuario}`,
    "",
    "Você já pode acessar sua conta utilizando seu nome de usuário ou e-mail e sua senha.",
    "",
    "Se você não solicitou esta informação, pode ignorar esta mensagem.",
    "",
    "Atenciosamente,",
    "Equipe Visora",
  ].join("\n");


  const html = `
    <!DOCTYPE html>
    <html lang="pt-BR">
      <head>
        <meta charset="UTF-8" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1.0"
        />
        <title>Recuperação de Usuário | Visora</title>
      </head>

      <body style="
        margin:0;
        padding:0;
        background-color:#F2F2F2;
        font-family:Arial,Helvetica,sans-serif;
        color:#273B31;
      ">
        <table
          role="presentation"
          width="100%"
          cellspacing="0"
          cellpadding="0"
          style="background-color:#F2F2F2;padding:32px 12px;"
        >
          <tr>
            <td align="center">
              <table
                role="presentation"
                width="100%"
                cellspacing="0"
                cellpadding="0"
                style="
                  max-width:600px;
                  background-color:#FFFFFF;
                  border-radius:12px;
                  overflow:hidden;
                "
              >
                <!-- LOGO -->
                <tr>
                  <td style="
                    padding:28px 32px;
                    text-align:center;
                  ">
                    <img
                      src="cid:logo-visora"
                      alt="Visora"
                      width="380"
                      style="
                        display:block;
                        width:100%;
                        max-width:380px;
                        height:auto;
                        margin:0 auto;
                      "
                    />
                  </td>
                </tr>

                <!-- CONTEÚDO -->
                <tr>
                  <td style="padding:36px 32px;">

                    <h2 style="
                      margin:0 0 20px;
                      font-size:22px;
                      color:#273B31;
                    ">
                      Recuperação de Usuário
                    </h2>

                    <p style="
                      font-size:15px;
                      line-height:1.7;
                      margin:0 0 16px;
                    ">
                      Olá, <strong>${nomeSeguro}</strong>!
                    </p>

                    <p style="
                      font-size:15px;
                      line-height:1.7;
                      margin:0 0 24px;
                    ">
                      Recebemos uma solicitação para recuperar
                      seu nome de usuário da Visora.
                    </p>

                    <p style="
                      font-size:14px;
                      color:#626B64;
                      text-align:center;
                    ">
                      Seu nome de usuário é:
                    </p>

                    <div style="
                      padding:18px;
                      margin:12px 0 24px;
                      border-radius:8px;
                      background-color:#F2F6F0;
                      border:1px solid #DAD7CD;
                      text-align:center;
                    ">
                      <strong style="
                        font-size:22px;
                        color:#344E41;
                        overflow-wrap:anywhere;
                      ">
                        ${usuarioSeguro}
                      </strong>
                    </div>

                    <p style="
                      font-size:14px;
                      line-height:1.7;
                      color:#626B64;
                    ">
                      Agora você pode acessar sua conta utilizando
                      seu nome de usuário ou e-mail e sua senha.
                    </p>

                    <p style="
                      font-size:13px;
                      line-height:1.7;
                      color:#626B64;
                      margin-top:24px;
                    ">
                      Se você não solicitou esta informação,
                      pode ignorar este e-mail.
                    </p>

                    <p style="
                      font-size:15px;
                      line-height:1.7;
                      margin-top:28px;
                    ">
                      Atenciosamente,<br />
                      <strong>Equipe Visora</strong>
                    </p>
                  </td>
                </tr>

                <!-- RODAPÉ -->
                <tr>
                  <td style="
                    background-color:#F2F2F2;
                    padding:20px 32px;
                    text-align:center;
                  ">
                    <p style="
                      font-size:12px;
                      line-height:1.6;
                      color:#626B64;
                      margin:0;
                    ">
                      Esta é uma mensagem automática.
                      Por favor, não responda diretamente a este e-mail.
                    </p>

                    <p style="
                      font-size:12px;
                      color:#626B64;
                      margin:8px 0 0;
                    ">
                      © ${new Date().getFullYear()} Visora.
                      Todos os direitos reservados.
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

    attachments: [
      {
        filename: "logo_horizontal_lightmode.png",
        path: path.join(
          process.cwd(),
          "src",
          "assets",
          "logo_horizontal_lightmode.png"
        ),
        cid: "logo-visora",
        contentDisposition: "inline",
      },
    ],
  });

  return {
    messageId: resultado.messageId,
  };
}

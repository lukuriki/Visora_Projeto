
import crypto from "node:crypto";
import path from "node:path";
import bcrypt from "bcryptjs";
import nodemailer from "nodemailer";

import { pool } from "../config/database.js";
import { AppError } from "../utils/AppError.js";
import {
  gerarSenha,
  gerarNomeUsuarioUnico,
} from "../utils/credenciais.js";

const FRONTEND_URL = (
  process.env.FRONTEND_URL || "http://localhost:3000"
).replace(/\/$/, "");

const PRAZO_CONVITE_HORAS = 48;


function gerarToken() {
  return crypto.randomBytes(32).toString("hex");
}

function hashToken(token) {
  return crypto
    .createHash("sha256")
    .update(token)
    .digest("hex");
}

function escaparHtml(valor) {
  return String(valor).replace(/[&<>"']/g, (caractere) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  })[caractere]);
}




function criarTransportador() {
  const porta = Number(process.env.SMTP_PORT || 587);

  if (
    !process.env.SMTP_HOST ||
    !process.env.SMTP_USER ||
    !process.env.SMTP_PASSWORD ||
    !process.env.EMAIL_FROM
  ) {
    throw new AppError(
      "O envio de e-mails não está configurado.",
      500
    );
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

async function enviarEmail({
  para,
  assunto,
  html,
  texto,
  attachments = [],
}) {
  await criarTransportador().sendMail({
    from: process.env.EMAIL_FROM,
    to: para,
    subject: assunto,
    text: texto,
    html,
    attachments,
  });
}



function criarEmailConvite({ empresa, url }) {
  const empresaSegura = escaparHtml(empresa);
  const urlSegura = escaparHtml(url);

  const texto = [
    "Você recebeu um convite!",
    "",
    `Você foi convidado(a) para fazer parte da equipe ${empresa} na plataforma Visora.`,
    "",
    "Para concluir seu cadastro, acesse o link abaixo.",
    "A Visora irá gerar automaticamente seu nome de usuário e sua senha de acesso.",
    "",
    url,
    "",
    "Após a ativação, suas credenciais serão apresentadas na tela.",
    "Salve essas informações em um local seguro.",
    "",
    `Este convite é válido por ${PRAZO_CONVITE_HORAS} horas e só pode ser utilizado uma vez.`,
    "Por segurança, não compartilhe seu link de ativação.",
    "",
    "Se você não reconhece este convite, entre em contato com o suporte da Visora.",
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
        <title>Convite para a equipe | Visora</title>
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
          style="
            background-color:#F2F2F2;
            padding:32px 12px;
          "
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
                    background-color:#FFFFFF;
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

                    <p style="
                      margin:12px 0 0;
                      color:#526456;
                      font-size:14px;
                    ">
                      Gestão inteligente para sua empresa
                    </p>

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
                      Você recebeu um convite!
                    </h2>

                    <p style="
                      font-size:15px;
                      line-height:1.7;
                      margin:0 0 16px;
                    ">
                      Você foi convidado(a) para fazer
                      parte da equipe
                      <strong>${empresaSegura}</strong>
                      na plataforma Visora.
                    </p>

                    <p style="
                      font-size:15px;
                      line-height:1.7;
                      margin:0 0 24px;
                    ">
                      Para concluir seu cadastro, acesse
                      o botão abaixo. A Visora irá gerar
                      automaticamente seu nome de usuário
                      e sua senha de acesso.
                    </p>

                    <!-- BOTÃO -->
                    <table
                      role="presentation"
                      cellspacing="0"
                      cellpadding="0"
                      style="margin:0 auto 24px;"
                    >
                      <tr>
                        <td
                          align="center"
                          bgcolor="#588157"
                          style="border-radius:8px;"
                        >
                          <a
                            href="${urlSegura}"
                            style="
                              display:inline-block;
                              padding:15px 28px;
                              color:#FFFFFF;
                              text-decoration:none;
                              font-size:15px;
                              font-weight:bold;
                            "
                          >
                            Ativar minha conta
                          </a>
                        </td>
                      </tr>
                    </table>

                    <p style="
                      font-size:13px;
                      line-height:1.7;
                      color:#626B64;
                      margin:0 0 12px;
                    ">
                      Após a ativação, suas credenciais
                      serão apresentadas na tela.
                      Salve essas informações em um
                      local seguro.
                    </p>

                    <p style="
                      font-size:13px;
                      line-height:1.7;
                      color:#626B64;
                      margin:0 0 12px;
                    ">
                      Por segurança, não compartilhe
                      seu link de ativação. Ele possui
                      validade de
                      <strong>${PRAZO_CONVITE_HORAS} horas</strong>
                      e só pode ser utilizado uma vez.
                    </p>

                    <p style="
                      font-size:13px;
                      line-height:1.7;
                      color:#626B64;
                      margin:0;
                    ">
                      Se você não reconhece este convite,
                      entre em contato com o suporte
                      da Visora.
                    </p>

                    <p style="
                      font-size:15px;
                      line-height:1.7;
                      margin:28px 0 0;
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
                      Por favor, não responda diretamente
                      a este e-mail.
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

  return {
    texto,
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
  };
}



async function obterEmpresaDoProprietario(
  conexao,
  proprietarioId
) {
  const [linhas] = await conexao.execute(
    `SELECT
       e.id,
       e.razao_social
     FROM usuario_empresa ue
     JOIN empresas e
       ON e.id = ue.empresa_id
     JOIN usuarios u
       ON u.id = ue.usuario_id
     WHERE ue.usuario_id = ?
      AND ue.perfil_acesso = 'proprietario'
      AND ue.status_vinculo = 'ativo'
      AND u.status_conta = 'ativo'
     ORDER BY ue.vinculado_em ASC
     LIMIT 1`,
    [proprietarioId]
  );

  if (!linhas.length) {
    throw new AppError(
      "Somente o proprietário pode gerenciar a equipe.",
      403
    );
  }

  return linhas[0];
}



async function registrarAtividadeEquipe(
  conexao,
  { empresaId, usuarioId, acao, entidadeId, descricao }
) {
  await conexao.execute(
    `INSERT INTO logs_sistema (
       empresa_id,
       usuario_id,
       acao,
       entidade,
       entidade_id,
       descricao
     )
     VALUES (?, ?, ?, 'equipe', ?, ?)`,
    [
      empresaId,
      usuarioId,
      acao,
      entidadeId,
      descricao,
    ]
  );
}



async function buscarUltimaAtividadeEquipe(
  conexao,
  empresaId
) {
  const [atividades] = await conexao.execute(
    `SELECT
       l.id,
       l.acao,
       l.descricao,
       l.criado_em,
       COALESCE(
         u.nome_completo,
         'Usuário não disponível'
       ) AS responsavel
     FROM logs_sistema l
     LEFT JOIN usuarios u
       ON u.id = l.usuario_id
     WHERE l.empresa_id = ?
       AND l.entidade = 'equipe'
     ORDER BY l.criado_em DESC, l.id DESC
     LIMIT 1`,
    [empresaId]
  );

  return atividades[0] || null;
}



export async function listarEquipe(usuarioId, empresaId = null) {
  const conexao = await pool.getConnection();

  try {
    const empresa = await obterEmpresaDaEquipe(
      conexao,
      usuarioId,
      empresaId
    );

    const [colaboradores] = await conexao.execute(
      `SELECT
         u.id,
         u.nome_completo,
         u.email,
         u.nome_usuario,
         u.status_conta,
         ue.status_vinculo,
         ue.perfil_acesso,
         ue.vinculado_em
       FROM usuario_empresa ue
       INNER JOIN usuarios u
         ON u.id = ue.usuario_id
       WHERE ue.empresa_id = ?
       ORDER BY
         FIELD(
           ue.perfil_acesso,
           'proprietario',
           'administrador',
           'colaborador'
         ),
         u.nome_completo ASC`,
      [empresa.id]
    );

    let convites = [];

    if (empresa.perfil_acesso === "proprietario") {
      const [resultados] = await conexao.execute(
        `SELECT
           id,
           email_convidado,
           perfil_acesso,
           status_convite,
           criado_em,
           expira_em,
           aceito_em
         FROM convites_equipe
         WHERE empresa_id = ?
           AND status_convite = 'pendente'
           AND expira_em > NOW()
         ORDER BY criado_em DESC`,
        [empresa.id]
      );

      convites = resultados;
    }

    return {
      empresa: {
        id: empresa.id,
        razao_social: empresa.razao_social,
      },
      perfil_acesso: empresa.perfil_acesso,
      colaboradores,
      convites,
    };
  } finally {
    conexao.release();
  }
}




export async function listarMembrosEquipe(usuarioId, empresaId = null) {
  const conexao = await pool.getConnection();

  try {
    const empresa = await obterEmpresaDaEquipe(
      conexao,
      usuarioId,
      empresaId
    );

    const [colaboradores] = await conexao.execute(
      `SELECT
         u.id,
         u.nome_completo,
         u.email,
         u.nome_usuario,
         u.status_conta,
         ue.perfil_acesso,
         ue.status_vinculo,
         ue.vinculado_em
       FROM usuario_empresa ue
       INNER JOIN usuarios u
         ON u.id = ue.usuario_id
       WHERE ue.empresa_id = ?
       ORDER BY
         FIELD(
           ue.perfil_acesso,
           'proprietario',
           'administrador',
           'colaborador'
         ),
         u.nome_completo ASC`,
      [empresa.id]
    );

    const ultimaAtividade =
      await buscarUltimaAtividadeEquipe(
        conexao,
        empresa.id
      );

    return {
      empresa: {
        id: empresa.id,
        razao_social: empresa.razao_social,
      },
      perfil_acesso: empresa.perfil_acesso,
      colaboradores,
      ultimaAtividade,
    };
  } finally {
    conexao.release();
  }
}





export async function convidarColaborador(
  proprietarioId,
  email
) {
  const emailNormalizado = String(email || "")
    .trim()
    .toLowerCase();

  if (
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailNormalizado) ||
    emailNormalizado.length > 100
  ) {
    throw new AppError(
      "Informe um e-mail válido.",
      400
    );
  }

  const conexao = await pool.getConnection();

  let conviteId;
  let empresa;
  let token;

  try {
    await conexao.beginTransaction();

    empresa = await obterEmpresaDoProprietario(
      conexao,
      proprietarioId
    );

    const [existentes] = await conexao.execute(
      `SELECT u.id
       FROM usuarios u
       JOIN usuario_empresa ue
         ON ue.usuario_id = u.id
       WHERE ue.empresa_id = ?
         AND u.email = ?
       LIMIT 1`,
      [empresa.id, emailNormalizado]
    );

    if (existentes.length) {
      throw new AppError(
        "Este e-mail já pertence à equipe.",
        409
      );
    }

    const [pendentes] = await conexao.execute(
      `SELECT id
       FROM convites_equipe
       WHERE empresa_id = ?
         AND email_convidado = ?
         AND status_convite = 'pendente'
         AND expira_em > NOW()
       LIMIT 1`,
      [empresa.id, emailNormalizado]
    );

    if (pendentes.length) {
      throw new AppError(
        "Já existe um convite válido para este e-mail.",
        409
      );
    }

    token = gerarToken();

    const [resultado] = await conexao.execute(
      `INSERT INTO convites_equipe (
         empresa_id,
         convidado_por,
         email_convidado,
         perfil_acesso,
         token_hash,
         status_convite,
         expira_em
       )
       VALUES (
         ?, ?, ?, 'colaborador', ?,
         'pendente',
         DATE_ADD(NOW(), INTERVAL 48 HOUR)
       )`,
      [
        empresa.id,
        proprietarioId,
        emailNormalizado,
        hashToken(token),
      ]
    );

    conviteId = resultado.insertId;

    await conexao.commit();
  } catch (erro) {
    await conexao.rollback();
    throw erro;
  } finally {
    conexao.release();
  }

  const url =
    `${FRONTEND_URL}/plataforma_ativar_convite?token=` +
    encodeURIComponent(token);

  
  try {
    const emailConvite = criarEmailConvite({
      empresa: empresa.razao_social,
      url,
    });

    await enviarEmail({
      para: emailNormalizado,
      assunto:
        `Convite para a equipe ${empresa.razao_social} | Visora`,
      texto: emailConvite.texto,
      html: emailConvite.html,
      attachments: emailConvite.attachments,
    });
  } catch (erro) {
    try {
      await pool.execute(
        `UPDATE convites_equipe
         SET status_convite = 'cancelado'
         WHERE id = ?
           AND status_convite = 'pendente'`,
        [conviteId]
      );
    } catch (erroBanco) {
      console.error(
        "Erro ao cancelar convite após falha no e-mail:",
        erroBanco
      );
    }

    throw new AppError(
      "Não foi possível enviar o convite por e-mail. Tente novamente.",
      502
    );
  }

  try {
    await registrarAtividadeEquipe(pool, {
      empresaId: empresa.id,
      usuarioId: proprietarioId,
      acao: "criacao",
      entidadeId: conviteId,
      descricao:
        `Enviou um convite para ${emailNormalizado}`,
    });
  } catch (erro) {
    console.error(
      "Erro ao registrar atividade do convite:",
      erro
    );
  }

  return {
    mensagem: "Convite enviado com sucesso.",
    conviteId,
    email: emailNormalizado,
  };
}

export async function consultarConvite(token) {
  if (
    !token ||
    !/^[a-f0-9]{64}$/i.test(String(token))
  ) {
    throw new AppError(
      "Convite inválido.",
      400
    );
  }

  const [linhas] = await pool.execute(
    `SELECT
       c.id,
       c.email_convidado,
       c.expira_em,
       e.razao_social
     FROM convites_equipe c
     JOIN empresas e
       ON e.id = c.empresa_id
     WHERE c.token_hash = ?
       AND c.status_convite = 'pendente'
       AND c.expira_em > NOW()
     LIMIT 1`,
    [hashToken(token)]
  );

  if (!linhas.length) {
    throw new AppError(
      "Convite inválido ou expirado.",
      410
    );
  }

  return {
    email: linhas[0].email_convidado,
    empresa: linhas[0].razao_social,
    expiraEm: linhas[0].expira_em,
  };
}


export async function ativarConvite(
  token,
  nomeCompleto
) {
  const nome = String(nomeCompleto || "").trim();

  if (nome.length < 3 || nome.length > 100) {
    throw new AppError(
      "Informe seu nome completo.",
      400
    );
  }

  if (
    !token ||
    !/^[a-f0-9]{64}$/i.test(String(token))
  ) {
    throw new AppError(
      "Convite inválido.",
      400
    );
  }

  const conexao = await pool.getConnection();

  let email;
  let usuarioGerado;
  let senhaGerada;

  try {
    await conexao.beginTransaction();

    const [convites] = await conexao.execute(
      `SELECT
         id,
         empresa_id,
         email_convidado
       FROM convites_equipe
       WHERE token_hash = ?
         AND status_convite = 'pendente'
         AND expira_em > NOW()
       LIMIT 1
       FOR UPDATE`,
      [hashToken(token)]
    );

    if (!convites.length) {
      throw new AppError(
        "Convite inválido ou expirado.",
        410
      );
    }

    const convite = convites[0];
    email = convite.email_convidado;

    const [usuarios] = await conexao.execute(
      `SELECT id
       FROM usuarios
       WHERE email = ?
       LIMIT 1`,
      [email]
    );

    let usuarioId;

    if (usuarios.length) {
      usuarioId = usuarios[0].id;

      const [vinculos] = await conexao.execute(
        `SELECT usuario_id
         FROM usuario_empresa
         WHERE usuario_id = ?
           AND empresa_id = ?
         LIMIT 1`,
        [usuarioId, convite.empresa_id]
      );

      if (vinculos.length) {
        throw new AppError(
          "Você já faz parte desta empresa.",
          409
        );
      }
    } else {
      senhaGerada = gerarSenha(
        10,
        convite.empresa_id
      );

      const senhaHash = await bcrypt.hash(
        senhaGerada,
        12
      );

      usuarioGerado =
        await gerarNomeUsuarioUnico(
          conexao,
          nome,
          convite.empresa_id
        );

      const [resultado] = await conexao.execute(
        `INSERT INTO usuarios (
           nome_completo,
           email,
           nome_usuario,
           senha,
           status_conta
         )
         VALUES (?, ?, ?, ?, 'ativo')`,
        [
          nome,
          email,
          usuarioGerado,
          senhaHash,
        ]
      );

      usuarioId = resultado.insertId;
    }

    await conexao.execute(
      `INSERT INTO usuario_empresa (
         usuario_id,
         empresa_id,
         perfil_acesso
       )
       VALUES (?, ?, 'colaborador')`,
      [usuarioId, convite.empresa_id]
    );


    await conexao.execute(
      `UPDATE convites_equipe
       SET
         status_convite = 'aceito',
         aceito_em = NOW()
       WHERE id = ?`,
      [convite.id]
    );

    await registrarAtividadeEquipe(conexao, {
      empresaId: convite.empresa_id,
      usuarioId,
      acao: "criacao",
      entidadeId: usuarioId,
      descricao:
        "Entrou para a equipe como colaborador",
    });

    await conexao.commit();
  } catch (erro) {
    await conexao.rollback();
    throw erro;
  } finally {
    conexao.release();
  }


  if (senhaGerada) {
    return {
      sucesso: true,
      mensagem:
        "Conta ativada com sucesso! Salve suas credenciais antes de continuar.",
      email,
      contaNova: true,
      nomeUsuario: usuarioGerado,
      senha: senhaGerada,
    };
  }


  return {
    sucesso: true,
    mensagem:
      "Convite aceito com sucesso! Utilize suas credenciais existentes para entrar.",
    email,
    contaNova: false,
    nomeUsuario: null,
    senha: null,
  };
}


export async function cancelarConvite(
  proprietarioId,
  conviteId
) {
  const conexao = await pool.getConnection();

  try {
    await conexao.beginTransaction();

    const empresa = await obterEmpresaDoProprietario(
      conexao,
      proprietarioId
    );

    const [convites] = await conexao.execute(
      `SELECT email_convidado
       FROM convites_equipe
       WHERE id = ?
         AND empresa_id = ?
         AND status_convite = 'pendente'
       LIMIT 1
       FOR UPDATE`,
      [conviteId, empresa.id]
    );

    if (!convites.length) {
      throw new AppError(
        "Convite pendente não encontrado.",
        404
      );
    }

    const emailConvidado =
      convites[0].email_convidado;

    await conexao.execute(
      `UPDATE convites_equipe
       SET status_convite = 'cancelado'
       WHERE id = ?
         AND empresa_id = ?
         AND status_convite = 'pendente'`,
      [conviteId, empresa.id]
    );

    await registrarAtividadeEquipe(conexao, {
      empresaId: empresa.id,
      usuarioId: proprietarioId,
      acao: "exclusao",
      entidadeId: Number(conviteId),
      descricao:
        `Cancelou o convite para ${emailConvidado}`,
    });

    await conexao.commit();

    return {
      mensagem: "Convite cancelado.",
    };
  } catch (erro) {
    await conexao.rollback();
    throw erro;
  } finally {
    conexao.release();
  }
}


export async function removerColaborador(
  proprietarioId,
  usuarioId
) {
  const conexao = await pool.getConnection();

  try {
    await conexao.beginTransaction();

    const empresa = await obterEmpresaDoProprietario(
      conexao,
      proprietarioId
    );

    const [colaboradores] = await conexao.execute(
      `SELECT
         u.id,
         u.nome_completo,
         u.status_conta
       FROM usuario_empresa ue
       INNER JOIN usuarios u
         ON u.id = ue.usuario_id
       WHERE ue.empresa_id = ?
         AND ue.usuario_id = ?
         AND ue.perfil_acesso = 'colaborador'
       LIMIT 1
       FOR UPDATE`,
      [empresa.id, usuarioId]
    );

    if (!colaboradores.length) {
      throw new AppError(
        "Colaborador não encontrado nesta empresa.",
        404
      );
    }

    const nomeColaborador =
      colaboradores[0].nome_completo;

    const [resultado] = await conexao.execute(
      `DELETE FROM usuario_empresa
       WHERE empresa_id = ?
         AND usuario_id = ?
         AND perfil_acesso = 'colaborador'`,
      [empresa.id, usuarioId]
    );

    if (!resultado.affectedRows) {
      throw new AppError(
        "Não foi possível remover o colaborador.",
        404
      );
    }

    const [vinculos] = await conexao.execute(
      `SELECT COUNT(*) AS total
       FROM usuario_empresa
       WHERE usuario_id = ?`,
      [usuarioId]
    );

    const possuiOutrasEmpresas =
      Number(vinculos[0].total) > 0;


    if (!possuiOutrasEmpresas) {
      await conexao.execute(
        `UPDATE usuarios
         SET status_conta = 'inativo'
         WHERE id = ?`,
        [usuarioId]
      );
    }

    await registrarAtividadeEquipe(conexao, {
      empresaId: empresa.id,
      usuarioId: proprietarioId,
      acao: "exclusao",
      entidadeId: Number(usuarioId),
      descricao:
        `Removeu ${nomeColaborador} da equipe`,
    });


    await conexao.commit();

    return {
      sucesso: true,
      mensagem: possuiOutrasEmpresas
        ? "Colaborador removido da empresa. Sua conta permanece ativa em outras empresas."
        : "Colaborador removido e conta desativada com sucesso.",
      contaDesativada: !possuiOutrasEmpresas,
    };

  } catch (erro) {
    await conexao.rollback();
    throw erro;

  } finally {
    conexao.release();
  }
}

 


export async function alterarStatusColaborador(
  proprietarioId,
  usuarioId,
  status
) {
  const id = Number(usuarioId);

  if (!Number.isSafeInteger(id) || id <= 0) {
    throw new AppError(
      "Identificador do colaborador inválido.",
      400
    );
  }

  if (!["ativo", "inativo"].includes(status)) {
    throw new AppError(
      "O status deve ser ativo ou inativo.",
      400
    );
  }

  const conexao = await pool.getConnection();

  try {
    await conexao.beginTransaction();


    

    const empresa = await obterEmpresaDoProprietario(
      conexao,
      proprietarioId
    );
    

    const [colaboradores] = await conexao.execute(
      `SELECT
         u.id,
         u.nome_completo,
         u.status_conta,
         ue.empresa_id,
         ue.perfil_acesso,
         ue.status_vinculo
       FROM usuario_empresa ue
       INNER JOIN usuarios u
         ON u.id = ue.usuario_id
       WHERE ue.empresa_id = ?
         AND ue.usuario_id = ?
         AND ue.perfil_acesso = 'colaborador'
       LIMIT 1
       FOR UPDATE`,
      [empresa.id, id]
    );

    if (!colaboradores.length) {
      throw new AppError(
        "Colaborador não encontrado nesta empresa.",
        404
      );
    }

    const colaborador = colaboradores[0];

    
    if (
      status === "ativo" &&
      colaborador.status_conta !== "ativo"
    ) {
      throw new AppError(
        "A conta geral deste colaborador está inativa. O administrador da plataforma precisa reativá-la antes.",
        409
      );
    }

    

    if (colaborador.status_vinculo === status) {
      throw new AppError(
        status === "ativo"
          ? "Este colaborador já está ativo nesta empresa."
          : "Este colaborador já está inativo nesta empresa.",
        409
      );
    }

    const [resultado] = await conexao.execute(
      `UPDATE usuario_empresa
       SET status_vinculo = ?
       WHERE usuario_id = ?
         AND empresa_id = ?
         AND perfil_acesso = 'colaborador'
         AND status_vinculo <> ?`,
      [
        status,
        id,
        empresa.id,
        status,
      ]
    );

    if (resultado.affectedRows !== 1) {
      throw new AppError(
        "Não foi possível atualizar o vínculo do colaborador.",
        409
      );
    }

    

    await registrarAtividadeEquipe(conexao, {
      empresaId: empresa.id,
      usuarioId: proprietarioId,
      acao: "atualizacao",
      entidadeId: id,
      descricao:
        status === "ativo"
          ? `Reativou ${colaborador.nome_completo} na equipe`
          : `Inativou ${colaborador.nome_completo} na equipe`,
    });

    await conexao.commit();

    return {
      sucesso: true,
      mensagem:
        status === "ativo"
          ? "Colaborador reativado com sucesso."
          : "Colaborador inativado com sucesso.",
      colaborador: {
        id,
        nome_completo: colaborador.nome_completo,
        empresa_id: empresa.id,
        status_conta: colaborador.status_conta,
        status_vinculo: status,
      },
    };
  } catch (erro) {
    await conexao.rollback();
    throw erro;
  } finally {
    conexao.release();
  }
}



async function obterEmpresaDaEquipe(conexao, usuarioId, empresaId = null) {
  const parametros = [usuarioId];
  let filtroEmpresa = "";

  if (empresaId !== null && empresaId !== undefined && empresaId !== "") {
    const id = Number(empresaId);

    if (!Number.isSafeInteger(id) || id <= 0) {
      throw new AppError("Empresa inválida.", 400);
    }

    filtroEmpresa = "AND ue.empresa_id = ?";
    parametros.push(id);
  }

  const [empresas] = await conexao.execute(
    `SELECT
       e.id,
       e.razao_social,
       ue.perfil_acesso,
       ue.status_vinculo
     FROM usuario_empresa ue
     INNER JOIN empresas e
       ON e.id = ue.empresa_id
     INNER JOIN usuarios u
       ON u.id = ue.usuario_id
     WHERE ue.usuario_id = ?
       AND u.status_conta = 'ativo'
       AND ue.status_vinculo = 'ativo'
       AND ue.perfil_acesso IN (
         'proprietario',
         'administrador',
         'colaborador'
       )
       ${filtroEmpresa}
     ORDER BY ue.vinculado_em ASC, e.id ASC
     LIMIT 2`,
    parametros
  );

  if (!empresas.length) {
    throw new AppError(
      "Você não possui permissão para visualizar esta equipe.",
      403
    );
  }

  if (
    (empresaId === null ||
      empresaId === undefined ||
      empresaId === "") &&
    empresas.length > 1
  ) {
    throw new AppError(
      "Selecione uma empresa antes de visualizar a equipe.",
      409
    );
  }

  return empresas[0];
}

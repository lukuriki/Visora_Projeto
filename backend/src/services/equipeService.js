
import crypto from "node:crypto";
import bcrypt from "bcryptjs";
import nodemailer from "nodemailer";

import { pool } from "../config/database.js";
import { AppError } from "../utils/AppError.js";

const FRONTEND_URL = (
  process.env.FRONTEND_URL || "http://localhost:3000"
).replace(/\/$/, "");

const PRAZO_CONVITE_HORAS = 48;

// ==========================================
// GERAR TOKEN DO CONVITE
// ==========================================

function gerarToken() {
  return crypto.randomBytes(32).toString("hex");
}

function hashToken(token) {
  return crypto
    .createHash("sha256")
    .update(token)
    .digest("hex");
}

// ==========================================
// GERAR SENHA DO COLABORADOR
// ==========================================

function gerarSenha() {
  return crypto.randomBytes(18).toString("base64url");
}

// ==========================================
// PROTEGER CONTEÚDO DO E-MAIL
// ==========================================

function escaparHtml(valor) {
  return String(valor).replace(/[&<>"']/g, (caractere) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  })[caractere]);
}

// ==========================================
// CONFIGURAR NODEMAILER
// ==========================================

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

async function enviarEmail({ para, assunto, html, texto }) {
  await criarTransportador().sendMail({
    from: process.env.EMAIL_FROM,
    to: para,
    subject: assunto,
    text: texto,
    html,
  });
}

// ==========================================
// VERIFICAR SE É PROPRIETÁRIO
// ==========================================

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

// ==========================================
// REGISTRAR ATIVIDADE DA EQUIPE
// ==========================================

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

// ==========================================
// CONSULTAR ÚLTIMA ATIVIDADE DA EQUIPE
// ==========================================

async function buscarUltimaAtividadeEquipe(conexao, empresaId) {
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

// ==========================================
// LISTAR EQUIPE - PROPRIETÁRIO
// ==========================================

export async function listarEquipe(proprietarioId) {
  const conexao = await pool.getConnection();

  try {
    const empresa = await obterEmpresaDoProprietario(
      conexao,
      proprietarioId
    );

    const [colaboradores] = await conexao.execute(
      `SELECT
        u.id,
        u.nome_completo,
        u.email,
        u.nome_usuario,
        u.status_conta,
        ue.perfil_acesso,
        ue.vinculado_em
       FROM usuario_empresa ue
       JOIN usuarios u
         ON u.id = ue.usuario_id
       WHERE ue.empresa_id = ?
       ORDER BY
         FIELD(
           ue.perfil_acesso,
           'proprietario',
           'administrador',
           'colaborador'
         ),
         u.nome_completo`,
      [empresa.id]
    );

    const [convites] = await conexao.execute(
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

    return {
      empresa,
      colaboradores,
      convites,
    };
  } finally {
    conexao.release();
  }
}

// ==========================================
// LISTAR MEMBROS - PROPRIETÁRIO E COLABORADOR
// ==========================================

export async function listarMembrosEquipe(usuarioId) {
  const conexao = await pool.getConnection();

  try {
    const [empresas] = await conexao.execute(
      `SELECT
        e.id,
        e.razao_social,
        ue.perfil_acesso
       FROM usuario_empresa ue
       INNER JOIN empresas e
         ON e.id = ue.empresa_id
       INNER JOIN usuarios u
         ON u.id = ue.usuario_id
       WHERE ue.usuario_id = ?
         AND u.status_conta = 'ativo'
         AND ue.perfil_acesso IN (
           'proprietario',
           'colaborador'
         )
       ORDER BY ue.vinculado_em ASC
       LIMIT 1`,
      [usuarioId]
    );

    if (!empresas.length) {
      throw new AppError(
        "Você não possui acesso aos membros desta equipe.",
        403
      );
    }

    const empresa = empresas[0];

    const [colaboradores] = await conexao.execute(
      `SELECT
        u.id,
        u.nome_completo,
        u.email,
        u.nome_usuario,
        u.status_conta,
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
         u.nome_completo`,
      [empresa.id]
    );

    const ultimaAtividade = await buscarUltimaAtividadeEquipe(
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

// ==========================================
// CONVIDAR COLABORADOR
// ==========================================

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

    // Verifica se já pertence à equipe.
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

    // Verifica se já existe convite válido.
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

  // Envia o convite por e-mail.
  try {
    await enviarEmail({
      para: emailNormalizado,
      assunto:
        `Convite para a equipe ${empresa.razao_social} | Visora`,

      texto:
        `Você foi convidado para a equipe ` +
        `${empresa.razao_social} na Visora.\n\n` +
        `Ative sua conta em até ${PRAZO_CONVITE_HORAS} horas:\n` +
        url,

      html: `
        <h2>Você recebeu um convite!</h2>

        <p>
          Você foi convidado para fazer parte da equipe
          <strong>${escaparHtml(empresa.razao_social)}</strong>
          na plataforma Visora.
        </p>

        <p>
          Clique no link abaixo para ativar sua conta
          de colaborador.
        </p>

        <p>
          <a href="${url}">Ativar minha conta</a>
        </p>

        <p>
          Este convite é válido por
          ${PRAZO_CONVITE_HORAS} horas.
        </p>

        <p>
          Se não esperava este convite,
          ignore este e-mail.
        </p>
      `,
    });
  } catch (erro) {
    // Cancela o convite caso o e-mail falhe.
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

  // Registra o envio após o e-mail ser enviado.
  try {
    await registrarAtividadeEquipe(pool, {
      empresaId: empresa.id,
      usuarioId: proprietarioId,
      acao: "criacao",
      entidadeId: conviteId,
      descricao: `Enviou um convite para ${emailNormalizado}`,
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

// ==========================================
// CONSULTAR CONVITE
// ==========================================

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

// ==========================================
// ATIVAR CONTA DO COLABORADOR
// ==========================================

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

    // Busca o convite e impede sua utilização duplicada.
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

    // Verifica se o e-mail já possui conta Visora.
    const [usuarios] = await conexao.execute(
      `SELECT id
       FROM usuarios
       WHERE email = ?
       LIMIT 1`,
      [email]
    );

    let usuarioId;

    if (usuarios.length) {
      // Não altera a senha de contas existentes.
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
      // Cria uma conta para o novo colaborador.
      senhaGerada = gerarSenha();

      const senhaHash = await bcrypt.hash(
        senhaGerada,
        12
      );

      usuarioGerado =
        `visora_${crypto.randomBytes(8).toString("hex")}`;

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

    // Vincula o colaborador à empresa.
    await conexao.execute(
      `INSERT INTO usuario_empresa (
        usuario_id,
        empresa_id,
        perfil_acesso
       )
       VALUES (?, ?, 'colaborador')`,
      [usuarioId, convite.empresa_id]
    );

    // Marca o convite como aceito.
    await conexao.execute(
      `UPDATE convites_equipe
       SET
         status_convite = 'aceito',
         aceito_em = NOW()
       WHERE id = ?`,
      [convite.id]
    );

    // Registra a entrada do colaborador.
    await registrarAtividadeEquipe(conexao, {
      empresaId: convite.empresa_id,
      usuarioId,
      acao: "criacao",
      entidadeId: usuarioId,
      descricao: "Entrou para a equipe como colaborador",
    });

    await conexao.commit();
  } catch (erro) {
    await conexao.rollback();
    throw erro;
  } finally {
    conexao.release();
  }

  // Envia credenciais somente para contas novas.
  if (senhaGerada) {
    try {
      await enviarEmail({
        para: email,
        assunto:
          "Sua conta de colaborador Visora foi ativada",

        texto:
          `Sua conta foi ativada.\n\n` +
          `Usuário: ${usuarioGerado}\n` +
          `Senha inicial: ${senhaGerada}\n\n` +
          `Acesse: ${FRONTEND_URL}/login\n\n` +
          `Guarde suas credenciais com segurança. ` +
          `Se esquecer a senha, use a recuperação de acesso.`,

        html: `
          <h2>Bem-vindo à Visora!</h2>

          <p>
            Sua conta de colaborador foi ativada.
          </p>

          <p>
            <strong>Usuário:</strong>
            ${escaparHtml(usuarioGerado)}
          </p>

          <p>
            <strong>Senha inicial:</strong>
            ${escaparHtml(senhaGerada)}
          </p>

          <p>
            Guarde suas credenciais com segurança.
          </p>

          <p>
            Caso esqueça sua senha,
            utilize a recuperação de acesso.
          </p>
        `,
      });
    } catch (erro) {
      // A conta permanece ativa mesmo se o e-mail falhar.
      return {
        mensagem:
          "Conta ativada, mas não foi possível enviar as credenciais. Use a recuperação de senha.",
        email,
        emailEnviado: false,
      };
    }
  }

  return {
    mensagem: senhaGerada
      ? "Conta ativada! Suas credenciais foram enviadas por e-mail."
      : "Convite aceito! Entre com sua conta Visora existente.",

    email,
    emailEnviado: Boolean(senhaGerada),
  };
}

// ==========================================
// CANCELAR CONVITE
// ==========================================

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

    // Busca o e-mail antes de cancelar o convite.
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

    const emailConvidado = convites[0].email_convidado;

    await conexao.execute(
      `UPDATE convites_equipe
       SET status_convite = 'cancelado'
       WHERE id = ?
         AND empresa_id = ?
         AND status_convite = 'pendente'`,
      [conviteId, empresa.id]
    );

    // Registra quem cancelou e qual convite.
    await registrarAtividadeEquipe(conexao, {
      empresaId: empresa.id,
      usuarioId: proprietarioId,
      acao: "exclusao",
      entidadeId: Number(conviteId),
      descricao: `Cancelou o convite para ${emailConvidado}`,
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

// ==========================================
// REMOVER COLABORADOR
// ==========================================

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

    // Busca o nome antes de remover o vínculo.
    const [colaboradores] = await conexao.execute(
      `SELECT u.nome_completo
       FROM usuario_empresa ue
       JOIN usuarios u
         ON u.id = ue.usuario_id
       WHERE ue.empresa_id = ?
         AND ue.usuario_id = ?
         AND ue.perfil_acesso = 'colaborador'
       LIMIT 1`,
      [empresa.id, usuarioId]
    );

    if (!colaboradores.length) {
      throw new AppError(
        "Colaborador não encontrado nesta empresa.",
        404
      );
    }

    const nomeColaborador = colaboradores[0].nome_completo;

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

    // Registra quem removeu e qual colaborador.
    await registrarAtividadeEquipe(conexao, {
      empresaId: empresa.id,
      usuarioId: proprietarioId,
      acao: "exclusao",
      entidadeId: Number(usuarioId),
      descricao: `Removeu ${nomeColaborador} da equipe`,
    });

    await conexao.commit();

    return {
      mensagem: "Colaborador removido da empresa.",
    };
  } catch (erro) {
    await conexao.rollback();
    throw erro;
  } finally {
    conexao.release();
  }
}

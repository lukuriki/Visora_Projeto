import { randomInt, randomUUID } from "node:crypto";
import bcrypt from "bcryptjs";

import { pool } from "../config/database.js";
import { AppError } from "../utils/AppError.js";
import { gerarNomeUsuarioBase } from "../utils/credenciais.js";
import { gerarToken } from "../utils/tokens.js";
import { enviarCredenciais } from "./emailService.js";

// Traduz erro de UNIQUE do MySQL para mensagem amigável (chaves = campos do front).
function traduzirErro(error) {
  if (error.code !== "ER_DUP_ENTRY") return error;
  const msg = error.sqlMessage ?? "";
  if (msg.includes("email")) return new AppError("Este e-mail já está cadastrado.", 409, { emailPessoal: "E-mail já cadastrado." });
  if (msg.includes("documento_identificacao")) return new AppError("Este CPF/CNPJ já está cadastrado.", 409, { documento: "Documento já cadastrado." });
  return new AppError("Dados já cadastrados.", 409);
}

// nome_usuario único: "joao", senão "joao4821"...
async function gerarNomeUsuarioUnico(conexao, nomeCompleto) {
  const base = gerarNomeUsuarioBase(nomeCompleto);
  let candidato = base;
  for (let i = 0; i < 15; i++) {
    const [rows] = await conexao.execute("SELECT 1 FROM usuarios WHERE nome_usuario = ? LIMIT 1", [candidato]);
    if (rows.length === 0) return candidato;
    candidato = `${base}${randomInt(100, 9999)}`;
  }
  throw new Error("Não foi possível gerar um nome de usuário único.");
}

// Passos 2-3: e-mail / documento já existem?
export async function verificarDisponibilidade({ email, documento }) {
  const conflitos = {};
  if (email) {
    const [r] = await pool.execute("SELECT 1 FROM usuarios WHERE email = ? LIMIT 1", [email]);
    if (r.length) conflitos.emailPessoal = "E-mail já cadastrado.";
  }
  if (documento) {
    const [r] = await pool.execute("SELECT 1 FROM empresas WHERE documento_identificacao = ? LIMIT 1", [documento]);
    if (r.length) conflitos.documento = "Documento já cadastrado.";
  }
  return { disponivel: Object.keys(conflitos).length === 0, conflitos };
}

// "Finalizar compra": cria tudo como PENDENTE, numa transação.
// criarCobranca (opcional): função do gateway, executada ANTES do commit.
// Se o gateway falhar, nada fica gravado e o usuário pode tentar de novo.
export async function criarContratacao({ planoId, metodo, usuario, empresa }, criarCobranca = null) {
  const conexao = await pool.getConnection();
  try {
    await conexao.beginTransaction();

    // O valor vem SEMPRE do banco, nunca do front.
    const [planos] = await conexao.execute(
      "SELECT id, tipo, valor FROM planos WHERE id = ? AND ativo = TRUE",
      [planoId],
    );
    if (planos.length === 0) throw new AppError("Plano não encontrado ou indisponível.", 404);
    const plano = planos[0];

    // nome_usuario e senha são NOT NULL, mas só são gerados quando o pagamento
    // é confirmado. Até lá: valores provisórios.
    const provisorio = `pend_${randomUUID().slice(0, 12)}`;
    const senhaProvisoria = await bcrypt.hash(randomUUID(), 10);

    const [u] = await conexao.execute(
      `INSERT INTO usuarios (nome_completo, email, telefone_usuario, nome_usuario, senha, termos_aceitos_em, status_conta)
       VALUES (?, ?, ?, ?, ?, NOW(), 'pendente')`,
      [usuario.nome, usuario.email, usuario.telefone, provisorio, senhaProvisoria],
    );

    const [e] = await conexao.execute(
      `INSERT INTO empresas (razao_social, email_empresa, telefone_empresa, tipo_documento, documento_identificacao, setor_atuacao, status)
       VALUES (?, ?, ?, ?, ?, ?, 'pendente')`,
      [empresa.razaoSocial, empresa.email, empresa.telefone, empresa.tipoDocumento, empresa.documento, empresa.setor],
    );

    await conexao.execute(
      "INSERT INTO usuario_empresa (usuario_id, empresa_id, perfil_acesso) VALUES (?, ?, 'proprietario')",
      [u.insertId, e.insertId],
    );

    const [a] = await conexao.execute(
      "INSERT INTO assinaturas (empresa_id, plano_id, status, valor_contratado) VALUES (?, ?, 'pendente', ?)",
      [e.insertId, plano.id, plano.valor],
    );

    // UUID aleatório: é ele (e não o id numérico) que o front usa para consultar
    // o status e baixar o recibo, então ninguém consegue "adivinhar".
    const codigo = randomUUID();
    await conexao.execute(
      "INSERT INTO pagamentos (assinatura_id, valor, metodo, status, codigo_transacao) VALUES (?, ?, ?, 'pendente', ?)",
      [a.insertId, plano.valor, metodo, codigo],
    );

    let gateway = null;
    if (criarCobranca) {
      gateway = await criarCobranca({ codigo, valor: Number(plano.valor), plano: plano.tipo, metodo, usuario, empresa });
      await conexao.execute(
        "UPDATE pagamentos SET gateway_id = ?, gateway_url = ? WHERE codigo_transacao = ?",
        [gateway.id, gateway.url ?? null, codigo],
      );
    }

    await conexao.commit();
    return { codigo, metodo, valor: Number(plano.valor), plano: plano.tipo, gateway };
  } catch (error) {
    await conexao.rollback().catch(() => {});
    throw traduzirErro(error);
  } finally {
    conexao.release();
  }
}

// Pagamento confirmado: ativa tudo, cria o link de ativação e envia o e-mail.
// (chamado pelo webhook do gateway OU pela confirmação simulada)
export async function confirmarPagamento(codigo) {
  const conexao = await pool.getConnection();
  let credenciais;
  try {
    await conexao.beginTransaction();

    // FOR UPDATE: webhook repetido ao mesmo tempo espera o primeiro terminar.
    const [rows] = await conexao.execute(
      `SELECT p.id AS pagamento_id, p.status AS pagamento_status,
              a.id AS assinatura_id, a.empresa_id, pl.duracao_meses,
              u.id AS usuario_id, u.nome_completo, u.email
         FROM pagamentos p
         JOIN assinaturas a ON a.id = p.assinatura_id
         JOIN planos pl ON pl.id = a.plano_id
         JOIN usuario_empresa ue ON ue.empresa_id = a.empresa_id AND ue.perfil_acesso = 'proprietario'
         JOIN usuarios u ON u.id = ue.usuario_id
        WHERE p.codigo_transacao = ?
        FOR UPDATE`,
      [codigo],
    );
    if (rows.length === 0) throw new AppError("Pagamento não encontrado.", 404);
    const c = rows[0];

    // Idempotente: confirmar de novo não gera outra senha nem outro e-mail.
    if (c.pagamento_status === "aprovado") {
      await conexao.rollback();
      return { jaConfirmado: true };
    }
    if (c.pagamento_status !== "pendente") throw new AppError("Este pagamento não pode ser confirmado.", 409);

    const nomeUsuario = await gerarNomeUsuarioUnico(conexao, c.nome_completo);
    const { token, hash: tokenHash } = gerarToken();

    await conexao.execute("UPDATE pagamentos SET status = 'aprovado', pago_em = NOW() WHERE id = ?", [c.pagamento_id]);
    await conexao.execute(
      "UPDATE assinaturas SET status = 'ativa', data_inicio = CURDATE(), data_fim = DATE_ADD(CURDATE(), INTERVAL ? MONTH) WHERE id = ?",
      [c.duracao_meses, c.assinatura_id],
    );
    await conexao.execute("UPDATE empresas SET status = 'ativa' WHERE id = ?", [c.empresa_id]);

    // A conta do usuário só vira 'ativo' quando ele definir a senha pelo link do e-mail.
    await conexao.execute("UPDATE usuarios SET nome_usuario = ? WHERE id = ?", [nomeUsuario, c.usuario_id]);
    await conexao.execute(
      "INSERT INTO tokens_usuario (usuario_id, tipo, token_hash, expira_em) VALUES (?, 'verificacao_email', ?, DATE_ADD(NOW(), INTERVAL 48 HOUR))",
      [c.usuario_id, tokenHash],
    );

    await conexao.commit();

    const base = (process.env.FRONTEND_URL || "http://localhost:3000").replace(/\/+$/, "");
    credenciais = {
      para: c.email,
      nome: c.nome_completo,
      nomeUsuario,
      linkAtivacao: `${base}/areapublica_pagina_ativar_conta?token=${token}`,
    };
  } catch (error) {
    await conexao.rollback().catch(() => {});
    throw error;
  } finally {
    conexao.release();
  }

  // E-mail FORA da transação: se o SMTP falhar, o pagamento continua confirmado.
  try {
    await enviarCredenciais(credenciais);
  } catch (error) {
    console.error("Falha ao enviar e-mail de ativação:", error);
  }
  return { jaConfirmado: false };
}

// Dados da tela final e do recibo (no formato que o reciboService espera).
// NUNCA devolve a senha.
export async function buscarResumo(codigo) {
  const [rows] = await pool.execute(
    `SELECT p.id AS pagamento_id, p.codigo_transacao, p.metodo, p.status AS pagamento_status, p.valor, p.pago_em,
            pl.tipo AS plano_tipo, pl.duracao_meses,
            a.data_inicio, a.data_fim,
            e.razao_social, e.tipo_documento, e.documento_identificacao, e.setor_atuacao,
            u.nome_completo, u.email
       FROM pagamentos p
       JOIN assinaturas a ON a.id = p.assinatura_id
       JOIN planos pl ON pl.id = a.plano_id
       JOIN empresas e ON e.id = a.empresa_id
       JOIN usuario_empresa ue ON ue.empresa_id = e.id AND ue.perfil_acesso = 'proprietario'
       JOIN usuarios u ON u.id = ue.usuario_id
      WHERE p.codigo_transacao = ?`,
    [codigo],
  );
  if (rows.length === 0) throw new AppError("Contratação não encontrada.", 404);
  const r = rows[0];

  return {
    pagamento: { id: r.pagamento_id, codigo: r.codigo_transacao, metodo: r.metodo, status: r.pagamento_status, valor: Number(r.valor), pagoEm: r.pago_em },
    plano: { tipo: r.plano_tipo, duracaoMeses: r.duracao_meses },
    assinatura: { dataInicio: r.data_inicio, dataFim: r.data_fim },
    usuario: { nome: r.nome_completo, email: r.email },
    empresa: { razaoSocial: r.razao_social, tipoDocumento: r.tipo_documento, documento: r.documento_identificacao, setorAtuacao: r.setor_atuacao },
  };
}
// Dados do gateway de uma contratação (uso interno: webhook e consulta de status).
export async function buscarGateway(codigo) {
  const [rows] = await pool.execute(
    "SELECT gateway_id, gateway_url, metodo, status FROM pagamentos WHERE codigo_transacao = ?",
    [codigo],
  );
  if (rows.length === 0) return null;
  return { gatewayId: rows[0].gateway_id, gatewayUrl: rows[0].gateway_url, metodo: rows[0].metodo, status: rows[0].status };
}
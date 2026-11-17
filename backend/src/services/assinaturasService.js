
import { randomUUID } from "node:crypto";

import { pool } from "../config/database.js";
import { AppError } from "../utils/AppError.js";

import {
  criarCobranca,
  gatewayConfigurado,
  consultarStatusCobranca,
  statusPago,
} from "./asaasService.js";

// ==========================================
// CONFIGURAÇÕES
// ==========================================

const METODOS = ["pix", "cartao_credito", "boleto"];

const modoPagamento = () =>
  process.env.PAGAMENTO_MODO ||
  (process.env.PAGAMENTO_SIMULADO === "true"
    ? "simulado"
    : "asaas");

function verificarMetodo(metodo) {
  if (!METODOS.includes(metodo)) {
    throw new AppError(
      "Forma de pagamento inválida.",
      400
    );
  }
}

// ==========================================
// BUSCAR EMPRESA AUTORIZADA
// ==========================================

async function buscarEmpresaAutorizada(conexao, usuarioId) {
  const [empresas] = await conexao.execute(
    `SELECT
        ue.empresa_id,
        ue.perfil_acesso
     FROM usuario_empresa ue
     INNER JOIN empresas e
       ON e.id = ue.empresa_id
     WHERE ue.usuario_id = ?
       AND ue.perfil_acesso IN ('proprietario', 'administrador')
       AND e.status = 'ativa'
     ORDER BY ue.empresa_id
     LIMIT 1`,
    [usuarioId]
  );

  if (!empresas.length) {
    throw new AppError(
      "Você não possui permissão para gerenciar a assinatura.",
      403
    );
  }

  return empresas[0].empresa_id;
}

// ==========================================
// CONSULTAR ASSINATURA ATUAL
// ==========================================

export async function consultarAssinatura(usuarioId) {
  const conexao = await pool.getConnection();

  try {
    const empresaId = await buscarEmpresaAutorizada(
      conexao,
      usuarioId
    );

    const [assinaturas] = await conexao.execute(
      `SELECT
          a.id,
          a.empresa_id,
          a.plano_id,
          a.status,
          a.valor_contratado,
          a.data_inicio,
          a.data_fim,
          p.tipo AS nome_plano,
          p.duracao_meses,
          p.descricao
       FROM assinaturas a
       INNER JOIN planos p
         ON p.id = a.plano_id
       WHERE a.empresa_id = ?
         AND a.status = 'ativa'
       ORDER BY a.id DESC
       LIMIT 1`,
      [empresaId]
    );

    const [preferencias] = await conexao.execute(
      `SELECT metodo_preferido
       FROM preferencias_pagamento
       WHERE empresa_id = ?`,
      [empresaId]
    );

    const [pendentes] = await conexao.execute(
      `SELECT
          a.id,
          a.plano_id,
          p.tipo AS nome_plano,
          a.valor_contratado,
          pg.codigo_transacao,
          pg.metodo,
          pg.gateway_url
       FROM assinaturas a
       INNER JOIN planos p
         ON p.id = a.plano_id
       INNER JOIN pagamentos pg
         ON pg.assinatura_id = a.id
       WHERE a.empresa_id = ?
         AND a.status = 'pendente'
         AND a.assinatura_anterior_id IS NOT NULL
         AND pg.tipo_operacao = 'troca_plano'
         AND pg.status = 'pendente'
       ORDER BY a.id DESC
       LIMIT 1`,
      [empresaId]
    );

    return {
      assinatura: assinaturas[0] || null,
      metodoPagamento:
        preferencias[0]?.metodo_preferido || null,
      trocaPendente: pendentes[0] || null,
    };
  } finally {
    conexao.release();
  }
}

// ==========================================
// LISTAR PLANOS DISPONÍVEIS
// ==========================================

export async function listarPlanosDisponiveis() {
  const [planos] = await pool.execute(
    `SELECT
        id,
        tipo,
        duracao_meses,
        valor,
        descricao
     FROM planos
     WHERE ativo = TRUE
     ORDER BY duracao_meses ASC`
  );

  return planos;
}

// ==========================================
// ALTERAR PREFERÊNCIA DE PAGAMENTO
// ==========================================

export async function alterarPreferenciaPagamento(
  usuarioId,
  metodo
) {
  verificarMetodo(metodo);

  const conexao = await pool.getConnection();

  try {
    const empresaId = await buscarEmpresaAutorizada(
      conexao,
      usuarioId
    );

    await conexao.execute(
      `INSERT INTO preferencias_pagamento
         (empresa_id, metodo_preferido)
       VALUES (?, ?)
       ON DUPLICATE KEY UPDATE
         metodo_preferido = VALUES(metodo_preferido)`,
      [empresaId, metodo]
    );

    return {
      mensagem: "Forma de pagamento preferida atualizada.",
      metodoPagamento: metodo,
    };
  } finally {
    conexao.release();
  }
}

// ==========================================
// SOLICITAR TROCA DE PLANO
// ==========================================

export async function solicitarTrocaPlano(
  usuarioId,
  planoId,
  metodo
) {
  const idPlano = Number(planoId);

  if (!Number.isInteger(idPlano) || idPlano <= 0) {
    throw new AppError("Plano inválido.", 400);
  }

  verificarMetodo(metodo);

  const modo = modoPagamento();

  if (!["asaas", "simulado"].includes(modo)) {
    throw new AppError(
      "Modo de pagamento inválido.",
      500
    );
  }

  if (modo === "asaas" && !gatewayConfigurado()) {
    throw new AppError(
      "O Asaas não está configurado.",
      503
    );
  }

  const conexao = await pool.getConnection();

  let transacaoAberta = false;
  let dadosCobranca = null;

  try {
    // PRIMEIRA ETAPA:
    // Registrar a solicitação no banco.

    const empresaId = await buscarEmpresaAutorizada(
      conexao,
      usuarioId
    );

    await conexao.beginTransaction();
    transacaoAberta = true;

    const [empresas] = await conexao.execute(
      `SELECT
          id,
          razao_social,
          tipo_documento,
          documento_identificacao,
          asaas_cliente_id
       FROM empresas
       WHERE id = ?
         AND status = 'ativa'
       FOR UPDATE`,
      [empresaId]
    );

    if (!empresas.length) {
      throw new AppError(
        "Empresa não encontrada.",
        404
      );
    }

    const empresa = empresas[0];

    const [usuarios] = await conexao.execute(
      `SELECT nome_completo, email
       FROM usuarios
       WHERE id = ?`,
      [usuarioId]
    );

    if (!usuarios.length) {
      throw new AppError(
        "Usuário não encontrado.",
        404
      );
    }

    const usuario = usuarios[0];

    const [planos] = await conexao.execute(
      `SELECT
          id,
          tipo,
          valor,
          duracao_meses
       FROM planos
       WHERE id = ?
         AND ativo = TRUE`,
      [idPlano]
    );

    if (!planos.length) {
      throw new AppError(
        "Plano não encontrado ou indisponível.",
        404
      );
    }

    const plano = planos[0];

    const [atuais] = await conexao.execute(
      `SELECT id, plano_id
       FROM assinaturas
       WHERE empresa_id = ?
         AND status = 'ativa'
       ORDER BY id DESC
       LIMIT 1
       FOR UPDATE`,
      [empresaId]
    );

    if (!atuais.length) {
      throw new AppError(
        "Nenhuma assinatura ativa encontrada.",
        404
      );
    }

    const assinaturaAtual = atuais[0];

    if (assinaturaAtual.plano_id === idPlano) {
      throw new AppError(
        "Este já é o seu plano atual.",
        400
      );
    }

    const [pendentes] = await conexao.execute(
      `SELECT id
       FROM assinaturas
       WHERE empresa_id = ?
         AND status = 'pendente'
         AND assinatura_anterior_id IS NOT NULL
       LIMIT 1`,
      [empresaId]
    );

    if (pendentes.length) {
      throw new AppError(
        "Já existe uma troca de plano pendente.",
        409
      );
    }

    const codigo = randomUUID();
    const valor = Number(plano.valor);

    const [novaAssinatura] = await conexao.execute(
      `INSERT INTO assinaturas
         (
           empresa_id,
           plano_id,
           assinatura_anterior_id,
           status,
           valor_contratado
         )
       VALUES (?, ?, ?, 'pendente', ?)`,
      [
        empresaId,
        idPlano,
        assinaturaAtual.id,
        valor,
      ]
    );

    await conexao.execute(
      `INSERT INTO pagamentos
         (
           assinatura_id,
           tipo_operacao,
           valor,
           metodo,
           status,
           codigo_transacao
         )
       VALUES (
         ?,
         'troca_plano',
         ?,
         ?,
         'pendente',
         ?
       )`,
      [
        novaAssinatura.insertId,
        valor,
        metodo,
        codigo,
      ]
    );

    await conexao.commit();
    transacaoAberta = false;

    dadosCobranca = {
      codigo,
      empresaId,
      assinaturaId: novaAssinatura.insertId,
      valor,
      metodo,
      plano: plano.tipo,
      clienteId: empresa.asaas_cliente_id,
      usuario: {
        nome: usuario.nome_completo,
        email: usuario.email,
      },
      empresa: {
        razaoSocial: empresa.razao_social,
        tipoDocumento: empresa.tipo_documento,
        documento: empresa.documento_identificacao,
      },
    };
  } catch (erro) {
    if (transacaoAberta) {
      await conexao.rollback();
    }

    throw erro;
  } finally {
    conexao.release();
  }

  // SEGUNDA ETAPA:
  // Criar a cobrança fora da transação MySQL.

  let gateway = null;

  if (modo === "asaas") {
    gateway = await criarCobranca({
      codigo: dadosCobranca.codigo,
      valor: dadosCobranca.valor,
      plano: dadosCobranca.plano,
      metodo: dadosCobranca.metodo,
      clienteId: dadosCobranca.clienteId,
      usuario: dadosCobranca.usuario,
      empresa: dadosCobranca.empresa,
    });

    const conexaoAtualizacao = await pool.getConnection();

    try {
      await conexaoAtualizacao.beginTransaction();

      // Atualiza primeiro a empresa.
      await conexaoAtualizacao.execute(
        `SELECT id
         FROM empresas
         WHERE id = ?
         FOR UPDATE`,
        [dadosCobranca.empresaId]
      );

      if (gateway.clienteId) {
        await conexaoAtualizacao.execute(
          `UPDATE empresas
           SET asaas_cliente_id = ?
           WHERE id = ?
             AND asaas_cliente_id IS NULL`,
          [
            gateway.clienteId,
            dadosCobranca.empresaId,
          ]
        );
      }

      await conexaoAtualizacao.execute(
        `UPDATE pagamentos
         SET
           gateway_id = ?,
           gateway_url = ?
         WHERE codigo_transacao = ?
           AND status = 'pendente'`,
        [
          gateway.id,
          gateway.url,
          dadosCobranca.codigo,
        ]
      );

      await conexaoAtualizacao.commit();
    } catch (erro) {
      await conexaoAtualizacao.rollback();
      throw erro;
    } finally {
      conexaoAtualizacao.release();
    }
  }

  return {
    mensagem: "Solicitação de troca de plano criada.",
    codigo: dadosCobranca.codigo,
    assinaturaId: dadosCobranca.assinaturaId,
    plano: dadosCobranca.plano,
    valor: dadosCobranca.valor,
    metodo: dadosCobranca.metodo,
    gateway,
  };
}

// ==========================================
// CONFIRMAR TROCA DE PLANO
// ==========================================

export async function confirmarTrocaPlano(codigo) {
  if (!codigo) {
    throw new AppError(
      "Código da transação não informado.",
      400
    );
  }

  // Consulta inicial para localizar a cobrança.
  const [registros] = await pool.execute(
    `SELECT
        pg.gateway_id,
        pg.status,
        a.empresa_id
     FROM pagamentos pg
     INNER JOIN assinaturas a
       ON a.id = pg.assinatura_id
     WHERE pg.codigo_transacao = ?
       AND pg.tipo_operacao = 'troca_plano'
     LIMIT 1`,
    [codigo]
  );

  if (!registros.length) {
    throw new AppError(
      "Troca de plano não encontrada.",
      404
    );
  }

  const registro = registros[0];

  if (registro.status === "aprovado") {
    return {
      mensagem: "Plano já ativado.",
      confirmado: true,
    };
  }

  if (registro.status !== "pendente") {
    throw new AppError(
      "O pagamento não está pendente.",
      409
    );
  }

  // Confirma o pagamento antes de alterar o banco.
  if (modoPagamento() === "asaas") {
    if (!registro.gateway_id) {
      throw new AppError(
        "Cobrança do Asaas não encontrada.",
        409
      );
    }

    const status = await consultarStatusCobranca(
      registro.gateway_id
    );

    if (!statusPago(status)) {
      throw new AppError(
        "O pagamento ainda não foi confirmado.",
        409
      );
    }
  } else {
    throw new AppError(
      "Confirmação simulada não habilitada neste serviço.",
      403
    );
  }

  const conexao = await pool.getConnection();
  let transacaoAberta = false;

  try {
    await conexao.beginTransaction();
    transacaoAberta = true;

    // Bloqueia a empresa para impedir trocas simultâneas.
    const [empresas] = await conexao.execute(
      `SELECT id
       FROM empresas
       WHERE id = ?
       FOR UPDATE`,
      [registro.empresa_id]
    );

    if (!empresas.length) {
      throw new AppError(
        "Empresa não encontrada.",
        404
      );
    }

    const [pagamentos] = await conexao.execute(
      `SELECT
          pg.id AS pagamento_id,
          pg.status AS pagamento_status,
          pg.gateway_id,
          a.id AS assinatura_id,
          a.empresa_id,
          a.assinatura_anterior_id,
          a.status AS assinatura_status,
          p.duracao_meses
       FROM pagamentos pg
       INNER JOIN assinaturas a
         ON a.id = pg.assinatura_id
       INNER JOIN planos p
         ON p.id = a.plano_id
       WHERE pg.codigo_transacao = ?
         AND pg.tipo_operacao = 'troca_plano'
       LIMIT 1
       FOR UPDATE`,
      [codigo]
    );

    if (!pagamentos.length) {
      throw new AppError(
        "Pagamento não encontrado.",
        404
      );
    }

    const pagamento = pagamentos[0];

    // Impede processar o mesmo pagamento duas vezes.
    if (
      pagamento.pagamento_status === "aprovado" &&
      pagamento.assinatura_status === "ativa"
    ) {
      await conexao.commit();
      transacaoAberta = false;

      return {
        mensagem: "Plano já ativado.",
        confirmado: true,
      };
    }

    if (
      pagamento.pagamento_status !== "pendente" ||
      pagamento.assinatura_status !== "pendente"
    ) {
      throw new AppError(
        "Esta troca de plano não está pendente.",
        409
      );
    }

    if (
      pagamento.empresa_id !== registro.empresa_id ||
      pagamento.gateway_id !== registro.gateway_id
    ) {
      throw new AppError(
        "Os dados da cobrança foram alterados.",
        409
      );
    }

    const [anteriores] = await conexao.execute(
      `SELECT id, status
       FROM assinaturas
       WHERE id = ?
         AND empresa_id = ?
       FOR UPDATE`,
      [
        pagamento.assinatura_anterior_id,
        pagamento.empresa_id,
      ]
    );

    if (
      !anteriores.length ||
      anteriores[0].status !== "ativa"
    ) {
      throw new AppError(
        "A assinatura anterior não está ativa.",
        409
      );
    }

    // Cancela a assinatura antiga.
    await conexao.execute(
      `UPDATE assinaturas
       SET status = 'cancelada'
       WHERE id = ?
         AND status = 'ativa'`,
      [pagamento.assinatura_anterior_id]
    );

    // Ativa a nova assinatura imediatamente.
    await conexao.execute(
      `UPDATE assinaturas
       SET
         status = 'ativa',
         data_inicio = CURDATE(),
         data_fim = DATE_ADD(
           CURDATE(),
           INTERVAL ? MONTH
         )
       WHERE id = ?
         AND status = 'pendente'`,
      [
        pagamento.duracao_meses,
        pagamento.assinatura_id,
      ]
    );

    // Aprova o pagamento.
    await conexao.execute(
      `UPDATE pagamentos
       SET
         status = 'aprovado',
         pago_em = NOW()
       WHERE id = ?
         AND status = 'pendente'`,
      [pagamento.pagamento_id]
    );

    await conexao.commit();
    transacaoAberta = false;

    return {
      mensagem: "Novo plano ativado com sucesso.",
      confirmado: true,
    };
  } catch (erro) {
    if (transacaoAberta) {
      await conexao.rollback();
    }

    throw erro;
  } finally {
    conexao.release();
  }
}

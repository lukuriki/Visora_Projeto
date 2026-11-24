
import { pool } from "../config/database.js";

const STATUS_VALIDOS = [
  "pendente",
  "em_analise",
  "resolvido",
  "ignorado",
];

const GRAVIDADES_VALIDAS = [
  "baixa",
  "media",
  "alta",
  "critica",
];

const TIPOS_VALIDOS = [
  "duplicidade",
  "valor_incomum",
  "classificacao_incorreta",
  "divergencia",
  "alteracao_suspeita",
  "outro",
];

function criarErro(mensagem, statusCode = 400) {
  const erro = new Error(mensagem);
  erro.statusCode = statusCode;
  return erro;
}

export async function listarApontamentos({
  empresaId,
  status,
  gravidade,
  tipo,
  pagina = 1,
  limite = 20,
}) {
  const filtros = ["a.empresa_id = ?"];
  const parametros = [empresaId];

  if (status) {
    if (!STATUS_VALIDOS.includes(status)) {
      throw criarErro("Status inválido.");
    }

    filtros.push("a.status = ?");
    parametros.push(status);
  }

  if (gravidade) {
    if (!GRAVIDADES_VALIDAS.includes(gravidade)) {
      throw criarErro("Gravidade inválida.");
    }

    filtros.push("a.gravidade = ?");
    parametros.push(gravidade);
  }

  if (tipo) {
    if (!TIPOS_VALIDOS.includes(tipo)) {
      throw criarErro("Tipo de apontamento inválido.");
    }

    filtros.push("a.tipo = ?");
    parametros.push(tipo);
  }

  const paginaNumero = Number(pagina);
  const limiteNumero = Number(limite);

  if (
    !Number.isSafeInteger(paginaNumero) ||
    paginaNumero < 1 ||
    !Number.isSafeInteger(limiteNumero) ||
    limiteNumero < 1 ||
    limiteNumero > 100
  ) {
    throw criarErro("Paginação inválida.");
  }

  const offset = (paginaNumero - 1) * limiteNumero;

  if (!Number.isSafeInteger(offset)) {
    throw criarErro("Paginação inválida.");
  }

  const where = filtros.join(" AND ");

  const [totalRows] = await pool.execute(
    `SELECT COUNT(*) AS total
     FROM auditoria_apontamentos a
     WHERE ${where}`,
    parametros
  );

  const [apontamentos] = await pool.execute(
    `SELECT
        a.id,
        a.empresa_id,
        a.execucao_id,
        a.movimentacao_id,
        a.tipo,
        a.gravidade,
        a.titulo,
        a.descricao,
        a.recomendacao,
        a.status,
        a.origem,
        a.resolvido_por,
        a.resolvido_em,
        a.observacao_resolucao,
        a.criado_em,
        a.atualizado_em,
        u.nome_completo AS responsavel_nome
     FROM auditoria_apontamentos a
     LEFT JOIN usuarios u
       ON u.id = a.resolvido_por
     WHERE ${where}
     ORDER BY
       FIELD(
         a.gravidade,
         'critica',
         'alta',
         'media',
         'baixa'
       ),
       a.criado_em DESC,
       a.id DESC
     LIMIT ${limiteNumero}
     OFFSET ${offset}`,
    parametros
  );

  const total = Number(totalRows[0].total);

  return {
    apontamentos,
    paginacao: {
      pagina: paginaNumero,
      limite: limiteNumero,
      total,
      totalPaginas: Math.ceil(total / limiteNumero),
    },
  };
}


export async function buscarResumoAuditoria(empresaId) {
  const [resumo] = await pool.execute(
    `SELECT
        COUNT(*) AS total,
        SUM(status = 'pendente') AS pendentes,
        SUM(status = 'em_analise') AS em_analise,
        SUM(status = 'resolvido') AS resolvidos,
        SUM(status = 'ignorado') AS ignorados,
        SUM(
          gravidade IN ('alta', 'critica')
          AND status IN ('pendente', 'em_analise')
        ) AS alertas_importantes
     FROM auditoria_apontamentos
     WHERE empresa_id = ?`,
    [empresaId]
  );

  const dados = resumo[0];

  return {
    total: Number(dados.total || 0),
    pendentes: Number(dados.pendentes || 0),
    emAnalise: Number(dados.em_analise || 0),
    resolvidos: Number(dados.resolvidos || 0),
    ignorados: Number(dados.ignorados || 0),
    alertasImportantes: Number(
      dados.alertas_importantes || 0
    ),
  };
}

export async function listarExecucoes(empresaId) {
  const [execucoes] = await pool.execute(
    `SELECT
        ae.id,
        ae.status,
        ae.origem,
        ae.total_analisadas,
        ae.total_apontamentos,
        ae.iniciada_em,
        ae.finalizada_em,
        ae.criado_em,
        ae.erro_resumo,
        u.nome_completo AS executado_por
     FROM auditoria_execucoes ae
     LEFT JOIN usuarios u
       ON u.id = ae.usuario_id
     WHERE ae.empresa_id = ?
     ORDER BY ae.criado_em DESC, ae.id DESC
     LIMIT 30`,
    [empresaId]
  );

  return execucoes;
}

export async function atualizarStatusApontamento({
  empresaId,
  usuarioId,
  apontamentoId,
  status,
  observacao,
}) {
  if (!STATUS_VALIDOS.includes(status)) {
    throw criarErro("Status inválido.");
  }

  if (
    observacao !== undefined &&
    observacao !== null &&
    typeof observacao !== "string"
  ) {
    throw criarErro("Observação inválida.");
  }

  const observacaoLimpa =
    typeof observacao === "string"
      ? observacao.trim()
      : "";

  if (observacaoLimpa.length > 2000) {
    throw criarErro(
      "A observação deve ter até 2000 caracteres."
    );
  }

  if (
    ["resolvido", "ignorado"].includes(status) &&
    !observacaoLimpa
  ) {
    throw criarErro(
      "Informe uma justificativa para finalizar o apontamento."
    );
  }

  const conexao = await pool.getConnection();

  try {
    await conexao.beginTransaction();

    const [registros] = await conexao.execute(
      `SELECT
          id,
          empresa_id,
          status,
          resolvido_por,
          resolvido_em,
          observacao_resolucao
       FROM auditoria_apontamentos
       WHERE id = ?
         AND empresa_id = ?
       LIMIT 1
       FOR UPDATE`,
      [apontamentoId, empresaId]
    );

    if (!registros.length) {
      throw criarErro(
        "Apontamento não encontrado.",
        404
      );
    }

    const anterior = registros[0];

    if (
      ["resolvido", "ignorado"].includes(anterior.status)
    ) {
      throw criarErro(
        "O apontamento já foi finalizado e não pode ser reaberto por esta operação.",
        409
      );
    }

    if (anterior.status === status) {
      throw criarErro(
        "O apontamento já possui esse status.",
        409
      );
    }

    const finalizado = [
      "resolvido",
      "ignorado",
    ].includes(status);

    await conexao.execute(
      `UPDATE auditoria_apontamentos
       SET
         status = ?,
         resolvido_por = ?,
         resolvido_em = ?,
         observacao_resolucao = ?
       WHERE id = ?
         AND empresa_id = ?`,
      [
        status,
        finalizado ? usuarioId : null,
        finalizado ? new Date() : null,
        finalizado ? observacaoLimpa : null,
        apontamentoId,
        empresaId,
      ]
    );

    await conexao.execute(
      `INSERT INTO logs_sistema (
        empresa_id,
        usuario_id,
        entidade,
        entidade_id,
        acao,
        dados_anteriores,
        dados_novos,
        descricao
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        empresaId,
        usuarioId,
        "auditoria_apontamentos",
        apontamentoId,
        "alteracao_status",
        JSON.stringify({
          status: anterior.status,
        }),
        JSON.stringify({
          status,
          observacao: observacaoLimpa || null,
        }),
        "Alteração de status de apontamento de auditoria",
      ]
    );

    await conexao.commit();

    return {
      id: apontamentoId,
      status,
      mensagem: "Status atualizado com sucesso.",
    };
  } catch (erro) {
    await conexao.rollback();
    throw erro;
  } finally {
    conexao.release();
  }
}

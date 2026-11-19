
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

import { pool } from "../config/database.js";
import { AppError } from "../utils/AppError.js";


function numero(valor) {
  return Number(valor) || 0;
}

function arredondar(valor) {
  return Math.round(numero(valor) * 100) / 100;
}

function dataSQL(data) {
  const ano = data.getFullYear();
  const mes = String(data.getMonth() + 1).padStart(2, "0");
  const dia = String(data.getDate()).padStart(2, "0");

  return `${ano}-${mes}-${dia}`;
}

function calcularVariacao(atual, anterior) {
  const valorAtual = numero(atual);
  const valorAnterior = numero(anterior);

  if (valorAnterior === 0) {
    return valorAtual === 0 ? 0 : null;
  }

  return arredondar(
    ((valorAtual - valorAnterior) / valorAnterior) * 100
  );
}

function obterLimitesPeriodo(periodo) {
  const periodos = {
    "Últimos 3 meses": 3,
    "Últimos 6 meses": 6,
    "Últimos 12 meses": 12,
  };

  const quantidade = periodos[periodo];

  if (!quantidade) {
    throw new AppError(
      "Período inválido. Utilize Últimos 3 meses, Últimos 6 meses ou Últimos 12 meses.",
      400
    );
  }

  const hoje = new Date();

  const inicioAtual = new Date(
    hoje.getFullYear(),
    hoje.getMonth() - quantidade + 1,
    1
  );

  const fimAtual = new Date(
    hoje.getFullYear(),
    hoje.getMonth() + 1,
    1
  );

  const inicioAnterior = new Date(
    inicioAtual.getFullYear(),
    inicioAtual.getMonth() - quantidade,
    1
  );

  return {
    quantidade,
    inicioAtual: dataSQL(inicioAtual),
    fimAtual: dataSQL(fimAtual),
    inicioAnterior: dataSQL(inicioAnterior),
  };
}

// ==========================================
// 1. LOGIN ADMINISTRATIVO
// ==========================================

export async function realizarLoginAdmin({
  email,
  senha,
}) {
  // ======================================
  // VALIDAR CAMPOS
  // ======================================

  if (
    typeof email !== "string" ||
    typeof senha !== "string" ||
    !email.trim() ||
    !senha
  ) {
    throw new AppError(
      "Informe seu e-mail e sua senha.",
      400
    );
  }

  // ======================================
  // BUSCAR ADMINISTRADOR
  // ======================================

  const [administradores] = await pool.execute(
    `SELECT
        id,
        nome,
        email,
        senha,
        criado_em
     FROM administrador
     WHERE email = ?
     LIMIT 1`,
    [email.trim().toLowerCase()]
  );

  const admin = administradores[0];

  if (!admin) {
    throw new AppError(
      "E-mail ou senha inválidos.",
      401
    );
  }

  // ======================================
  // COMPARAR SENHA COM BCRYPT
  // ======================================

  const senhaValida = await bcrypt.compare(
    senha,
    admin.senha
  );

  if (!senhaValida) {
    throw new AppError(
      "E-mail ou senha inválidos.",
      401
    );
  }

  // ======================================
  // GERAR TOKEN ADMINISTRATIVO
  // ======================================

  if (!process.env.JWT_SECRET) {
    throw new Error(
      "JWT_SECRET não configurado no servidor."
    );
  }

  const token = jwt.sign(
    {
      id: admin.id,
      tipo: "admin",
    },
    process.env.JWT_SECRET,
    {
      algorithm: "HS256",
      expiresIn: "8h",
    }
  );

  // ======================================
  // RETORNAR LOGIN
  // ======================================

  return {
    token,
    administrador: {
      id: admin.id,
      nome: admin.nome,
      email: admin.email,
      tipo: "admin",
      criadoEm: admin.criado_em,
    },
  };
}

// ==========================================
// 2. BUSCAR PERFIL DO ADMINISTRADOR
// ==========================================

export async function buscarPerfilAdmin(adminId) {
  const id = Number(adminId);

  if (!Number.isSafeInteger(id) || id <= 0) {
    throw new AppError(
      "Administrador inválido.",
      400
    );
  }

  const [administradores] = await pool.execute(
    `SELECT
        id,
        nome,
        email,
        criado_em
     FROM administrador
     WHERE id = ?
     LIMIT 1`,
    [id]
  );

  if (administradores.length === 0) {
    throw new AppError(
      "Administrador não encontrado.",
      404
    );
  }

  const admin = administradores[0];

  return {
    id: admin.id,
    nome: admin.nome,
    email: admin.email,
    tipo: "admin",
    criadoEm: admin.criado_em,
  };
}

// ==========================================
// 3. DASHBOARD ADMINISTRATIVO
// ==========================================

export async function buscarDashboardAdmin({
  periodo = "Últimos 12 meses",
} = {}) {
  // ======================================
  // DEFINIR PERÍODO
  // ======================================

  const {
    quantidade,
    inicioAtual,
    fimAtual,
    inicioAnterior,
  } = obterLimitesPeriodo(periodo);

  // ======================================
  // CONSULTAS AO BANCO
  // ======================================

  const [
    [resultadoFaturamento],
    [resultadoEmpresas],
    [resultadoAssinaturas],
    [resultadoDistribuicao],
    [resultadoGrafico],
    [resultadoPagamentos],
  ] = await Promise.all([
    // ======================================
    // FATURAMENTO
    // ======================================

    pool.execute(
      `SELECT
          COALESCE(
            SUM(
              CASE
                WHEN pago_em >= ?
                 AND pago_em < ?
                THEN valor
                ELSE 0
              END
            ),
            0
          ) AS atual,

          COALESCE(
            SUM(
              CASE
                WHEN pago_em >= ?
                 AND pago_em < ?
                THEN valor
                ELSE 0
              END
            ),
            0
          ) AS anterior

       FROM pagamentos
       WHERE status = 'aprovado'`,
      [
        inicioAtual,
        fimAtual,
        inicioAnterior,
        inicioAtual,
      ]
    ),

    // ======================================
    // EMPRESAS CADASTRADAS
    // ======================================

    pool.execute(
      `SELECT
          COUNT(*) AS total,

          SUM(
            CASE
              WHEN criado_em >= ?
               AND criado_em < ?
              THEN 1
              ELSE 0
            END
          ) AS novos_atual,

          SUM(
            CASE
              WHEN criado_em >= ?
               AND criado_em < ?
              THEN 1
              ELSE 0
            END
          ) AS novos_anterior

       FROM empresas`,
      [
        inicioAtual,
        fimAtual,
        inicioAnterior,
        inicioAtual,
      ]
    ),

    // ======================================
    // ASSINATURAS
    // ======================================

    pool.execute(
      `SELECT
          COUNT(*) AS total,

          SUM(
            CASE
              WHEN criado_em >= ?
               AND criado_em < ?
              THEN 1
              ELSE 0
            END
          ) AS novas_atual,

          SUM(
            CASE
              WHEN criado_em >= ?
               AND criado_em < ?
              THEN 1
              ELSE 0
            END
          ) AS novas_anterior

       FROM assinaturas`,
      [
        inicioAtual,
        fimAtual,
        inicioAnterior,
        inicioAtual,
      ]
    ),

    // ======================================
    // DISTRIBUIÇÃO DE ASSINATURAS
    // ======================================

    pool.execute(
      `SELECT
          status,
          COUNT(*) AS quantidade
       FROM assinaturas
       GROUP BY status`
    ),

    // ======================================
    // GRÁFICO DE FATURAMENTO MENSAL
    // ======================================

    pool.execute(
      `SELECT
          DATE_FORMAT(
            pago_em,
            '%Y-%m'
          ) AS mes,

          COALESCE(
            SUM(valor),
            0
          ) AS total

       FROM pagamentos

       WHERE status = 'aprovado'
         AND pago_em >= ?
         AND pago_em < ?

       GROUP BY DATE_FORMAT(
         pago_em,
         '%Y-%m'
       )

       ORDER BY mes ASC`,
      [inicioAtual, fimAtual]
    ),

    // ======================================
    // PAGAMENTOS RECENTES
    // ======================================

    pool.execute(
      `SELECT
          p.id,
          p.codigo_transacao,
          p.valor,
          p.status,
          p.metodo,

          DATE_FORMAT(
            p.criado_em,
            '%Y-%m-%d'
          ) AS data,

          e.razao_social AS empresa,
          pl.tipo AS plano

       FROM pagamentos p

       INNER JOIN assinaturas a
         ON a.id = p.assinatura_id

       INNER JOIN empresas e
         ON e.id = a.empresa_id

       INNER JOIN planos pl
         ON pl.id = a.plano_id

       ORDER BY p.criado_em DESC, p.id DESC

       LIMIT 100`
    ),
  ]);

  // ======================================
  // 4. PROCESSAR FATURAMENTO
  // ======================================

  const faturamento = resultadoFaturamento[0] || {};

  const faturamentoAtual = numero(
    faturamento.atual
  );

  const faturamentoAnterior = numero(
    faturamento.anterior
  );

  const crescimentoFaturamento = calcularVariacao(
    faturamentoAtual,
    faturamentoAnterior
  );

  // ======================================
  // 5. PROCESSAR EMPRESAS
  // ======================================

  const empresas = resultadoEmpresas[0] || {};

  const totalEmpresas = numero(empresas.total);

  const novasEmpresas = numero(
    empresas.novos_atual
  );

  const novasEmpresasAnterior = numero(
    empresas.novos_anterior
  );

  // ======================================
  // 6. PROCESSAR ASSINATURAS
  // ======================================

  const assinaturas = resultadoAssinaturas[0] || {};

  const totalAssinaturas = numero(
    assinaturas.total
  );

  const novasAssinaturas = numero(
    assinaturas.novas_atual
  );

  const novasAssinaturasAnterior = numero(
    assinaturas.novas_anterior
  );

  // ======================================
  // 7. DISTRIBUIÇÃO DE ASSINATURAS
  // ======================================

  const distribuicao = {
    ativa: 0,
    pendente: 0,
    cancelada: 0,
    expirada: 0,
  };

  for (const item of resultadoDistribuicao) {
    if (
      Object.prototype.hasOwnProperty.call(
        distribuicao,
        item.status
      )
    ) {
      distribuicao[item.status] = numero(
        item.quantidade
      );
    }
  }

  // ======================================
  // 8. ORGANIZAR GRÁFICO MENSAL
  // ======================================

  const valoresPorMes = new Map();

  for (const item of resultadoGrafico) {
    valoresPorMes.set(
      item.mes,
      numero(item.total)
    );
  }

  const grafico = [];

  const inicioGrafico = new Date(
    `${inicioAtual}T12:00:00`
  );

  for (let i = 0; i < quantidade; i++) {
    const data = new Date(
      inicioGrafico.getFullYear(),
      inicioGrafico.getMonth() + i,
      1
    );

    const chave = `${data.getFullYear()}-${String(
      data.getMonth() + 1
    ).padStart(2, "0")}`;

    const mes = data.toLocaleDateString(
      "pt-BR",
      {
        month: "short",
        year: "2-digit",
      }
    );

    grafico.push({
      chave,
      mes,
      valor: arredondar(
        valoresPorMes.get(chave) || 0
      ),
    });
  }

  // ======================================
  // 9. ORGANIZAR PAGAMENTOS
  // ======================================

  const pagamentos = resultadoPagamentos.map(
    (item) => ({
      id: item.id,

      codigo:
        item.codigo_transacao ||
        `#${item.id}`,

      empresa:
        item.empresa ||
        "Empresa não identificada",

      plano:
        item.plano ||
        "Plano não identificado",

      metodo: item.metodo,

      data: item.data,

      valor: arredondar(item.valor),

      status: item.status,
    })
  );

  // ======================================
  // 10. RETORNAR DASHBOARD
  // ======================================

  return {
    periodo,

    indicadores: {
      faturamento: {
        valor: arredondar(
          faturamentoAtual
        ),

        variacao: crescimentoFaturamento,
      },

      clientes: {
        valor: totalEmpresas,

        variacao: calcularVariacao(
          novasEmpresas,
          novasEmpresasAnterior
        ),

        novos: novasEmpresas,
      },

      assinaturas: {
        valor: totalAssinaturas,

        variacao: calcularVariacao(
          novasAssinaturas,
          novasAssinaturasAnterior
        ),

        novas: novasAssinaturas,
      },

      crescimento: {
        valor: crescimentoFaturamento,
      },
    },

    grafico,

    distribuicao,

    pagamentos,
  };
}

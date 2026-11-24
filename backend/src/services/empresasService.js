
import { pool } from "../config/database.js";
import { AppError } from "../utils/AppError.js";



const AREAS_PERMITIDAS = new Set([
  "Comércio",
  "Serviços",
  "Indústria",
  "Tecnologia",
  "Varejo",
  "Saúde",
  "Outros",
]);

function somenteNumeros(valor) {
  return String(valor ?? "").replace(/\D/g, "");
}

function texto(valor) {
  return typeof valor === "string" ? valor.trim() : "";
}


function cpfValido(valor) {
  const cpf = somenteNumeros(valor);

  if (cpf.length !== 11 || /^(\d)\1+$/.test(cpf)) {
    return false;
  }

  for (let posicao = 9; posicao <= 10; posicao++) {
    let soma = 0;

    for (let i = 0; i < posicao; i++) {
      soma += Number(cpf[i]) * (posicao + 1 - i);
    }

    const resto = (soma * 10) % 11;
    const digito = resto === 10 ? 0 : resto;

    if (digito !== Number(cpf[posicao])) {
      return false;
    }
  }

  return true;
}


function cnpjValido(valor) {
  const cnpj = somenteNumeros(valor);

  if (cnpj.length !== 14 || /^(\d)\1+$/.test(cnpj)) {
    return false;
  }

  const calcularDigito = (base, pesos) => {
    const soma = pesos.reduce(
      (total, peso, indice) =>
        total + Number(base[indice]) * peso,
      0
    );

    const resto = soma % 11;

    return resto < 2 ? 0 : 11 - resto;
  };

  const primeiro = calcularDigito(
    cnpj.slice(0, 12),
    [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]
  );

  const segundo = calcularDigito(
    cnpj.slice(0, 12) + primeiro,
    [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]
  );

  return (
    Number(cnpj[12]) === primeiro &&
    Number(cnpj[13]) === segundo
  );
}

function validarDadosEmpresa(dados) {
  const nomeEmpresa = texto(dados?.nomeEmpresa);
  const emailEmpresa = texto(dados?.emailEmpresa).toLowerCase();
  const telefoneEmpresa = somenteNumeros(dados?.telefoneEmpresa);

  const tipoDocumento = texto(dados?.tipoDocumento).toUpperCase();
  const documento = somenteNumeros(dados?.documento);
  const areaAtuacao = texto(dados?.areaAtuacao);

  if (
    !nomeEmpresa ||
    !emailEmpresa ||
    !telefoneEmpresa ||
    !tipoDocumento ||
    !documento ||
    !areaAtuacao
  ) {
    throw new AppError(
      "Preencha todos os campos obrigatórios.",
      400
    );
  }

  if (nomeEmpresa.length > 255) {
    throw new AppError(
      "O nome da empresa é muito longo.",
      400
    );
  }

  if (
    emailEmpresa.length > 255 ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailEmpresa)
  ) {
    throw new AppError(
      "Informe um e-mail válido.",
      400
    );
  }

  if (
    telefoneEmpresa.length < 10 ||
    telefoneEmpresa.length > 11
  ) {
    throw new AppError(
      "Informe um telefone válido.",
      400
    );
  }

  if (!["CPF", "CNPJ"].includes(tipoDocumento)) {
    throw new AppError(
      "Tipo de documento inválido.",
      400
    );
  }

  if (
    (tipoDocumento === "CPF" && !cpfValido(documento)) ||
    (tipoDocumento === "CNPJ" && !cnpjValido(documento))
  ) {
    throw new AppError(
      `${tipoDocumento} inválido.`,
      400
    );
  }

  if (!AREAS_PERMITIDAS.has(areaAtuacao)) {
    throw new AppError(
      "Área de atuação inválida.",
      400
    );
  }

  return {
    nomeEmpresa,
    emailEmpresa,
    telefoneEmpresa,
    tipoDocumento,
    documento,
    areaAtuacao,
  };
}


async function buscarAssinatura(
  conexao,
  usuarioId,
  bloquear = false
) {
  const [assinaturas] = await conexao.execute(
    `SELECT
       a.id,
       a.empresa_id,
       a.plano_id,
       p.tipo AS nome_plano,
       p.limite_empresas
     FROM assinaturas a
     INNER JOIN planos p
       ON p.id = a.plano_id
     INNER JOIN usuario_empresa ue
       ON ue.empresa_id = a.empresa_id
     WHERE ue.usuario_id = ?
       AND ue.perfil_acesso = 'proprietario'
       AND a.status = 'ativa'
       AND (
         a.data_inicio IS NULL
         OR a.data_inicio <= CURDATE()
       )
       AND (
         a.data_fim IS NULL
         OR a.data_fim >= CURDATE()
       )
     ORDER BY a.id DESC
     LIMIT 2
     ${bloquear ? "FOR UPDATE" : ""}`,
    [usuarioId]
  );

  if (!assinaturas.length) {
    throw new AppError(
      "Nenhuma assinatura ativa foi encontrada para este proprietário.",
      403
    );
  }

  if (assinaturas.length > 1) {
    throw new AppError(
      "Há mais de uma assinatura ativa. É necessário identificar qual assinatura será utilizada.",
      409
    );
  }

  return assinaturas[0];
}

async function contarEmpresas(conexao, usuarioId) {
  const [[resultado]] = await conexao.execute(
    `SELECT COUNT(DISTINCT ue.empresa_id) AS total
     FROM usuario_empresa ue
     INNER JOIN empresas e
       ON e.id = ue.empresa_id
     WHERE ue.usuario_id = ?
       AND ue.perfil_acesso = 'proprietario'
       AND e.status = 'ativa'`,
    [usuarioId]
  );

  return Number(resultado.total);
}



export async function consultarLimiteEmpresas(usuarioId) {
  const conexao = await pool.getConnection();

  try {
    const assinatura = await buscarAssinatura(
      conexao,
      usuarioId
    );

    const total = await contarEmpresas(
      conexao,
      usuarioId
    );

    const limite = Number(assinatura.limite_empresas);

    return {
      assinaturaId: assinatura.id,
      plano: assinatura.nome_plano,
      limite,
      utilizadas: total,
      disponiveis: Math.max(0, limite - total),
      podeAdicionar: total < limite,
    };

  } finally {
    conexao.release();
  }
}


export async function cadastrarEmpresaAdicional(
  usuarioId,
  dados
) {
  const empresa = validarDadosEmpresa(dados);

  const conexao = await pool.getConnection();

  try {
    await conexao.beginTransaction();

    const assinatura = await buscarAssinatura(
      conexao,
      usuarioId,
      true
    );

    const total = await contarEmpresas(
  conexao,
  usuarioId
);

    const limite = Number(assinatura.limite_empresas);

    if (total >= limite) {
      throw new AppError(
        `O plano ${assinatura.nome_plano} permite até ${limite} empresas.`,
        403
      );
    }

    const [resultadoEmpresa] = await conexao.execute(
      `INSERT INTO empresas (
         razao_social,
         email_empresa,
         telefone_empresa,
         tipo_documento,
         documento_identificacao,
         setor_atuacao,
         status
       )
       VALUES (?, ?, ?, ?, ?, ?, 'ativa')`,
      [
        empresa.nomeEmpresa,
        empresa.emailEmpresa,
        empresa.telefoneEmpresa,
        empresa.tipoDocumento,
        empresa.documento,
        empresa.areaAtuacao,
      ]
    );

    const empresaId = resultadoEmpresa.insertId;

    await conexao.execute(
      `INSERT INTO usuario_empresa (
         usuario_id,
         empresa_id,
         perfil_acesso
       )
       VALUES (?, ?, 'proprietario')`,
      [usuarioId, empresaId]
    );

    await conexao.execute(
      `INSERT INTO assinatura_empresas (
         assinatura_id,
         empresa_id
       )
       VALUES (?, ?)`,
      [assinatura.id, empresaId]
    );

    await conexao.commit();

    return {
      empresa: {
        id: empresaId,
        nome: empresa.nomeEmpresa,
        razao_social: empresa.nomeEmpresa,
        email_empresa: empresa.emailEmpresa,
        telefone_empresa: empresa.telefoneEmpresa,
        tipo_documento: empresa.tipoDocumento,
        setor_atuacao: empresa.areaAtuacao,
        status: "ativa",
        perfil_acesso: "proprietario",
      },

      assinatura: {
        id: assinatura.id,
        plano: assinatura.nome_plano,
        limite,
        utilizadas: total + 1,
        disponiveis: Math.max(0, limite - total - 1),
      },
    };
  } catch (erro) {
    try {
      await conexao.rollback();
    } catch (erroRollback) {
      console.error(
        "Erro ao desfazer cadastro de empresa:",
        erroRollback
      );
    }

    if (erro.code === "ER_DUP_ENTRY") {
      const indice = String(
        erro.sqlMessage || erro.message || ""
      );

      if (indice.includes("uk_empresas_nome")) {
        throw new AppError(
          "Já existe uma empresa cadastrada com este nome.",
          409
        );
      }

      if (indice.includes("uk_empresas_email")) {
        throw new AppError(
          "Este e-mail já está sendo utilizado por outra empresa.",
          409
        );
      }

      if (indice.includes("uk_empresas_telefone")) {
        throw new AppError(
          "Este telefone já está sendo utilizado por outra empresa.",
          409
        );
      }

      if (indice.includes("uk_empresas_cnpj")) {
        throw new AppError(
          "Este CNPJ já está cadastrado na plataforma.",
          409
        );
      }

      throw new AppError(
        "Já existe um cadastro com uma informação que precisa ser única.",
        409
      );
    }

    throw erro;
  } finally {
    conexao.release();
  }
}

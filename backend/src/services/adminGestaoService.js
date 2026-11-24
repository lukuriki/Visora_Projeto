import { pool } from '../config/database.js';
import { AppError } from '../utils/AppError.js';

const idValido = (valor) => {
  const id = Number(valor);
  if (!Number.isSafeInteger(id) || id <= 0) throw new AppError('ID inválido.', 400);
  return id;
};
const texto = (valor, max, obrigatorio = false) => {
  if (valor === null && !obrigatorio) return null;
  if (typeof valor !== 'string') throw new AppError('Campo de texto inválido.', 400);
  const v = valor.trim();
  if ((obrigatorio && !v) || v.length > max) throw new AppError(`Campo inválido (máximo ${max} caracteres).`, 400);
  return v || null;
};
const validarEmail = (valor) => {
  const email = texto(valor, 100);
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new AppError('E-mail inválido.', 400);
  return email;
};
const log = async (db, adminId, acao, entidade, entidadeId, descricao, empresaId = null, anterior = null, novo = null) => {
  await db.execute(`INSERT INTO logs_sistema
    (admin_id, empresa_id, acao, entidade, entidade_id, descricao, dados_anteriores, dados_novos)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [adminId, empresaId, acao, entidade, entidadeId, descricao,
      anterior ? JSON.stringify(anterior) : null, novo ? JSON.stringify(novo) : null]);
};
const transacao = async (fn) => {
  const db = await pool.getConnection();
  try { await db.beginTransaction(); const result = await fn(db); await db.commit(); return result; }
  catch (e) { await db.rollback(); if (e.code === 'ER_DUP_ENTRY') throw new AppError('E-mail, usuário ou documento já cadastrado.', 409); if (e.code === 'ER_ROW_IS_REFERENCED_2') throw new AppError('Existem dados vinculados. Desative em vez de excluir.', 409); throw e; }
  finally { db.release(); }
};


export async function listarUsuariosAdmin(busca = "") {
  const q = `%${String(busca).trim().slice(0, 100)}%`;

  const [rows] = await pool.execute(
    `SELECT
       u.id,
       u.nome_completo,
       u.nome_usuario,
       u.email,
       u.telefone_usuario,
       u.status_conta,
       u.criado_em,

       COUNT(ue.empresa_id) AS total_empresas,

       SUM(
         CASE
           WHEN ue.status_vinculo = 'ativo'
           THEN 1
           ELSE 0
         END
       ) AS empresas_ativas,

       SUM(
         CASE
           WHEN ue.status_vinculo = 'inativo'
           THEN 1
           ELSE 0
         END
       ) AS empresas_inativas,

       GROUP_CONCAT(
         DISTINCT CASE
           WHEN ue.status_vinculo = 'ativo'
           THEN e.razao_social
         END
         SEPARATOR ', '
       ) AS nomes_empresas_ativas,

       GROUP_CONCAT(
         DISTINCT CASE
           WHEN ue.status_vinculo = 'inativo'
           THEN e.razao_social
         END
         SEPARATOR ', '
       ) AS nomes_empresas_inativas,

       CASE
         WHEN COUNT(ue.empresa_id) = 0
           THEN 'sem_vinculo'

         WHEN SUM(
           CASE
             WHEN ue.status_vinculo = 'ativo'
             THEN 1 ELSE 0
           END
         ) > 0
           THEN 'ativo'

         ELSE 'inativo'
       END AS status_vinculo

     FROM usuarios u

     LEFT JOIN usuario_empresa ue
       ON ue.usuario_id = u.id

     LEFT JOIN empresas e
       ON e.id = ue.empresa_id

     WHERE
       u.nome_completo LIKE ?
       OR u.email LIKE ?
       OR u.nome_usuario LIKE ?

     GROUP BY
       u.id,
       u.nome_completo,
       u.nome_usuario,
       u.email,
       u.telefone_usuario,
       u.status_conta,
       u.criado_em

     ORDER BY u.id DESC
     LIMIT 300`,
    [q, q, q]
  );

  return rows.map((usuario) => ({
    ...usuario,
    total_empresas: Number(usuario.total_empresas),
    empresas_ativas: Number(usuario.empresas_ativas),
    empresas_inativas: Number(usuario.empresas_inativas),
  }));
}

export async function editarUsuarioAdmin(adminId, usuarioId, dados) {
  const id = idValido(usuarioId);
  const campos = {};
  if (dados.nome_completo !== undefined) campos.nome_completo = texto(dados.nome_completo, 255, true);
  if (dados.nome_usuario !== undefined) campos.nome_usuario = texto(dados.nome_usuario, 100, true);
  if (dados.email !== undefined) campos.email = validarEmail(dados.email);
  if (dados.telefone_usuario !== undefined) campos.telefone_usuario = texto(dados.telefone_usuario, 20);
  if (!Object.keys(campos).length) throw new AppError('Nenhum campo para atualizar.', 400);
  return transacao(async db => {
    const [rows] = await db.execute('SELECT id,nome_completo,nome_usuario,email,telefone_usuario,status_conta FROM usuarios WHERE id=? FOR UPDATE', [id]);
    if (!rows.length) throw new AppError('Usuário não encontrado.', 404);
    const anterior = rows[0];
    await db.execute(`UPDATE usuarios SET ${Object.keys(campos).map(c=>`${c}=?`).join(',')} WHERE id=?`, [...Object.values(campos),id]);
    await log(db,adminId,'alteracao','usuarios',id,'Editou o cadastro do usuário.',null,anterior,{...anterior,...campos});
    return {id, ...campos};
  });
}
export async function mudarStatusUsuarioAdmin(adminId, usuarioId, status) {
  if (!['ativo','inativo'].includes(status)) throw new AppError('Status inválido.',400);
  const id = idValido(usuarioId);
  return transacao(async db => {
    const [rows] = await db.execute('SELECT id,status_conta FROM usuarios WHERE id=? FOR UPDATE',[id]);
    if (!rows.length) throw new AppError('Usuário não encontrado.',404);
    await db.execute('UPDATE usuarios SET status_conta=? WHERE id=?',[status,id]);
    await log(db,adminId,'alteracao','usuarios',id,`${status==='ativo'?'Reativou':'Desativou'} a conta do usuário.`,null,{status_conta:rows[0].status_conta},{status_conta:status});
    return {id,status_conta:status};
  });
}

export async function excluirUsuarioAdmin(adminId, usuarioId, confirmacao) {
  const id = idValido(usuarioId);

  if (confirmacao !== "EXCLUIR") {
    throw new AppError("Confirmação EXCLUIR obrigatória.", 400);
  }

  return transacao(async (db) => {
    const [usuarios] = await db.execute(
      `SELECT
         id,
         nome_completo,
         nome_usuario,
         email,
         status_conta
       FROM usuarios
       WHERE id = ?
       FOR UPDATE`,
      [id]
    );

    if (!usuarios.length) {
      throw new AppError("Usuário não encontrado.", 404);
    }

    const usuario = usuarios[0];

    if (usuario.status_conta !== "inativo") {
      throw new AppError("Desative o usuário antes da exclusão permanente.", 409);
    }

    const [conversas] = await db.execute(
      `SELECT 1
       FROM conversas
       WHERE usuario_id = ?
       LIMIT 1`,
      [id]
    );

    if (conversas.length) {
      throw new AppError("O usuário possui conversas vinculadas. A exclusão foi bloqueada para preservar o histórico.", 409);
    }

    const [resultado] = await db.execute(
      `DELETE FROM usuarios WHERE id = ?`, [id]
    );

    if (resultado.affectedRows !== 1) {
      throw new AppError("Não foi possível excluir o usuário.", 409);
    }

    await log(
      db,
      adminId,
      "exclusao",
      "usuarios",
      id,
      `Excluiu permanentemente o usuário #${id} (${usuario.nome_completo}).`,
      null,
      {
        id: usuario.id,
        excluido: true,
        nome_usuario: usuario.nome_usuario
      }
    );
    return {
      sucesso: true,
      mensagem: "Usuário excluído permanentemente com sucesso.",
      id,
      excluido: true
    };
  });
}

export async function listarEmpresasAdmin(busca = '') {
  const q = `%${String(busca).trim().slice(0,100)}%`;
  const [rows] = await pool.execute(`SELECT e.id,e.razao_social,e.email_empresa,e.telefone_empresa,e.tipo_documento,
    e.documento_identificacao,e.setor_atuacao,e.porte_empresa,e.regime_tributario,e.perfil_risco,
    e.capital_inicial,e.status,e.criado_em,COUNT(ue.usuario_id) AS total_usuarios
    FROM empresas e LEFT JOIN usuario_empresa ue ON ue.empresa_id=e.id
    WHERE e.razao_social LIKE ? OR e.documento_identificacao LIKE ? OR e.email_empresa LIKE ?
    GROUP BY e.id ORDER BY e.id DESC LIMIT 300`,[q,q,q]);
  return rows;
}
const enums = {
  setor_atuacao:['Comércio','Serviços','Indústria','Tecnologia','Varejo','Saúde','Outros'],
  porte_empresa:['Autônomo','MEI','ME','EPP','Média','Grande'],
  regime_tributario:['Pessoa Física','Simples Nacional','Lucro Presumido','Lucro Real'],
  perfil_risco:['Conservador','Moderado','Arrojado']
};
export async function editarEmpresaAdmin(adminId, empresaId, dados) {
  const id=idValido(empresaId); const campos={};
  for (const [campo,limite] of Object.entries({razao_social:255,email_empresa:100,telefone_empresa:20})) {
    if (dados[campo] === undefined) continue;
    campos[campo]=campo==='email_empresa'?validarEmail(dados[campo]):texto(dados[campo],limite,campo==='razao_social');
  }
  for (const [campo,opcoes] of Object.entries(enums)) {
    if (dados[campo] === undefined) continue;
    if (!opcoes.includes(dados[campo])) throw new AppError(`Valor inválido para ${campo}.`,400);
    campos[campo]=dados[campo];
  }
  if (dados.capital_inicial !== undefined) {
    const valor=String(dados.capital_inicial);
    if (!/^\d{1,13}(\.\d{1,2})?$/.test(valor)) throw new AppError('Capital inicial inválido.',400);
    campos.capital_inicial=valor;
  }
  if (!Object.keys(campos).length) throw new AppError('Nenhum campo para atualizar.',400);
  return transacao(async db=>{
    const [rows]=await db.execute('SELECT id,razao_social,email_empresa,telefone_empresa,setor_atuacao,porte_empresa,regime_tributario,perfil_risco,capital_inicial,status FROM empresas WHERE id=? FOR UPDATE',[id]);
    if (!rows.length) throw new AppError('Empresa não encontrada.',404);
    await db.execute(`UPDATE empresas SET ${Object.keys(campos).map(c=>`${c}=?`).join(',')} WHERE id=?`,[...Object.values(campos),id]);
    await log(db,adminId,'alteracao','empresas',id,'Editou os dados cadastrais da empresa.',id,rows[0],{...rows[0],...campos});
    return {id,...campos};
  });
}
export async function mudarStatusEmpresaAdmin(adminId,empresaId,status) {
  if (!['ativa','inativa'].includes(status)) throw new AppError('Status inválido.',400);
  const id=idValido(empresaId);
  return transacao(async db=>{
    const [rows]=await db.execute('SELECT id,status FROM empresas WHERE id=? FOR UPDATE',[id]);
    if (!rows.length) throw new AppError('Empresa não encontrada.',404);
    await db.execute('UPDATE empresas SET status=? WHERE id=?',[status,id]);
    await log(db,adminId,'alteracao','empresas',id,`${status==='ativa'?'Reativou':'Desativou'} a empresa.`,id,{status:rows[0].status},{status});
    return {id,status};
  });
}
export async function listarAssinaturasAdmin() {
  const [rows]=await pool.execute(`SELECT a.id,a.empresa_id,e.razao_social AS empresa,p.tipo AS plano,
    a.status,a.valor_contratado,a.data_inicio,a.data_fim,a.criado_em
    FROM assinaturas a JOIN empresas e ON e.id=a.empresa_id JOIN planos p ON p.id=a.plano_id
    ORDER BY a.id DESC LIMIT 300`);
  return rows;
}
export async function cancelarAssinaturaAdmin(adminId,assinaturaId) {
  const id=idValido(assinaturaId);
  return transacao(async db=>{
    const [rows]=await db.execute('SELECT id,empresa_id,status FROM assinaturas WHERE id=? FOR UPDATE',[id]);
    if (!rows.length) throw new AppError('Assinatura não encontrada.',404);
    const a=rows[0];
    if (!['ativa','pendente'].includes(a.status)) throw new AppError('Assinatura já finalizada.',409);
    const [trocas]=await db.execute("SELECT id FROM assinaturas WHERE assinatura_anterior_id=? AND status='pendente' FOR UPDATE",[id]);
    if (trocas.length) throw new AppError('Existe troca de plano pendente. Resolva essa cobrança antes de cancelar.',409);
    const [pagamentos]=await db.execute("SELECT id FROM pagamentos WHERE assinatura_id=? AND status='pendente' LIMIT 1",[id]);
    if (pagamentos.length) throw new AppError('Há pagamento pendente no gateway. Cancele a cobrança no Asaas antes de cancelar a assinatura.',409);
    await db.execute("UPDATE assinaturas SET status='cancelada',data_fim=CURDATE() WHERE id=?",[id]);
    await log(db,adminId,'alteracao','assinaturas',id,'Cancelou a assinatura administrativamente.',a.empresa_id,{status:a.status},{status:'cancelada'});
    return {id,status:'cancelada'};
  });
}
export async function listarPagamentosAdmin() {
  const [rows]=await pool.execute(`SELECT pg.id,pg.assinatura_id,pg.tipo_operacao,pg.valor,pg.metodo,pg.status,
    pg.codigo_transacao,pg.gateway_id,pg.pago_em,pg.criado_em,e.razao_social AS empresa
    FROM pagamentos pg JOIN assinaturas a ON a.id=pg.assinatura_id JOIN empresas e ON e.id=a.empresa_id
    ORDER BY pg.id DESC LIMIT 300`);
  return rows;
}
export async function listarLogsAdmin() {
  const [rows]=await pool.execute(`SELECT id,admin_id,empresa_id,usuario_id,acao,entidade,entidade_id,descricao,criado_em
    FROM logs_sistema WHERE admin_id IS NOT NULL ORDER BY id DESC LIMIT 300`);
  return rows;
}
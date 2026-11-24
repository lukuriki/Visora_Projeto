
import { randomInt } from "node:crypto";

const MINUSCULAS = "abcdefghijkmnopqrstuvwxyz";
const MAIUSCULAS = "ABCDEFGHJKLMNPQRSTUVWXYZ";
const NUMEROS = "23456789";
const SIMBOLOS_USUARIO = "$@#&";

const sortear = (caracteres) =>
  caracteres[randomInt(caracteres.length)];

function embaralhar(caracteres) {
  for (let i = caracteres.length - 1; i > 0; i--) {
    const j = randomInt(i + 1);
    [caracteres[i], caracteres[j]] = [
      caracteres[j],
      caracteres[i],
    ];
  }

  return caracteres.join("");
}

export function gerarCodigoEmpresa(empresaId) {
  const id = Number(empresaId);

  if (!Number.isSafeInteger(id) || id <= 0) {
    throw new Error("Identificador da empresa inválido.");
  }

  return String(id).padStart(4, "0");
}

export function gerarSenha(
  tamanho = 10,
  empresaId = null
) {
  if (!Number.isInteger(tamanho) || tamanho < 3) {
    throw new Error("Tamanho de senha inválido.");
  }

  const todos = MINUSCULAS + MAIUSCULAS + NUMEROS;

  const caracteres = [
    sortear(MINUSCULAS),
    sortear(MAIUSCULAS),
    sortear(NUMEROS),
  ];

  while (caracteres.length < tamanho) {
    caracteres.push(sortear(todos));
  }

  const parteAleatoria = embaralhar(caracteres);

  if (empresaId === null || empresaId === undefined) {
    return parteAleatoria;
  }

  return (
    `${parteAleatoria}@${gerarCodigoEmpresa(empresaId)}`
  );
}

export function gerarNomeUsuarioBase(nomeCompleto) {
  const partes = String(nomeCompleto || "")
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .split(/\s+/)
    .map((parte) => parte.replace(/[^a-z0-9]/g, ""))
    .filter(Boolean);

  if (!partes.length) {
    return "usuario";
  }

  const primeiro = partes[0];
  const ultimo = partes.length > 1
    ? partes[partes.length - 1]
    : "";

  return `${primeiro}${ultimo}`.slice(0, 30);
}

export async function gerarNomeUsuarioUnico(
  conexao,
  nomeCompleto,
  empresaId
) {
  const base = gerarNomeUsuarioBase(nomeCompleto);
  const codigo = gerarCodigoEmpresa(empresaId);

  for (let tentativa = 0; tentativa < 50; tentativa++) {
    const numeros = randomInt(10, 100);
    const simbolo = sortear(SIMBOLOS_USUARIO);

    const candidato =
      `${base}${numeros}${simbolo}.VSR${codigo}`;

    const [existentes] = await conexao.execute(
      `SELECT id
       FROM usuarios
       WHERE nome_usuario = ?
       LIMIT 1`,
      [candidato]
    );

    if (!existentes.length) {
      return candidato;
    }
  }

  throw new Error(
    "Não foi possível gerar um nome de usuário único."
  );
}
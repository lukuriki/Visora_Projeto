import { randomInt } from "node:crypto";

const MINUSCULAS = "abcdefghijkmnopqrstuvwxyz";
const MAIUSCULAS = "ABCDEFGHJKLMNPQRSTUVWXYZ";
const NUMEROS = "23456789";
const SIMBOLOS = "!@#$%&*";

const sortear = (texto) => texto[randomInt(texto.length)];

// Senha aleatória segura (crypto), com pelo menos 1 de cada tipo.
export function gerarSenha(tamanho = 12) {
  const todos = MINUSCULAS + MAIUSCULAS + NUMEROS + SIMBOLOS;
  const caracteres = [
    sortear(MINUSCULAS),
    sortear(MAIUSCULAS),
    sortear(NUMEROS),
    sortear(SIMBOLOS),
  ];

  while (caracteres.length < tamanho) caracteres.push(sortear(todos));

  // embaralha (Fisher-Yates) para os 4 primeiros não ficarem sempre no começo
  for (let i = caracteres.length - 1; i > 0; i--) {
    const j = randomInt(i + 1);
    [caracteres[i], caracteres[j]] = [caracteres[j], caracteres[i]];
  }

  return caracteres.join("");
}

// "João da Silva" -> "joao"
export function gerarNomeUsuarioBase(nomeCompleto) {
  const base = nomeCompleto
    .trim()
    .split(/\s+/)[0]
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");

  return (base || "usuario").slice(0, 30);
}
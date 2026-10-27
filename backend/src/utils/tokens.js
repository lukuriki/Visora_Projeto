import { createHash, randomBytes } from "node:crypto";

// O token vai no link do e-mail; no banco guardamos só o HASH (SHA-256).
// Assim, quem ler o banco não consegue usar os links.
export function gerarToken() {
  const token = randomBytes(32).toString("hex"); // 64 caracteres
  return { token, hash: hashToken(token) };
}

export const hashToken = (token) => createHash("sha256").update(String(token)).digest("hex");
export const tokenComFormatoValido = (token) => /^[a-f0-9]{64}$/.test(String(token ?? ""));
import { createHash, randomBytes } from "node:crypto";


export function gerarToken() {
  const token = randomBytes(32).toString("hex"); 
  return { token, hash: hashToken(token) };
}

export const hashToken = (token) => createHash("sha256").update(String(token)).digest("hex");
export const tokenComFormatoValido = (token) => /^[a-f0-9]{64}$/.test(String(token ?? ""));
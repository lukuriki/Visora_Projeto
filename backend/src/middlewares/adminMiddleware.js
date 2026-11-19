
import jwt from "jsonwebtoken";

import { pool } from "../config/database.js";

export async function autenticarAdministrador(req, res, next) {
  try {
    const authorization = req.headers.authorization;

    if (!authorization) {
      return res.status(401).json({
        mensagem: "Autenticação necessária.",
      });
    }

    const [tipo, token] = authorization.split(" ");

    if (tipo !== "Bearer" || !token) {
      return res.status(401).json({
        mensagem: "Token de autenticação inválido.",
      });
    }

    if (!process.env.JWT_SECRET) {
      throw new Error("JWT_SECRET não configurado.");
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET,
      {
        algorithms: ["HS256"],
      }
    );

    if (!decoded || typeof decoded !== "object" || decoded.tipo !== "admin") {
      return res.status(403).json({
        mensagem: "Acesso permitido somente para administradores.",
      });
    }

    const adminId = Number(decoded.id);

    if (!Number.isSafeInteger(adminId) || adminId <= 0) {
      return res.status(401).json({
        mensagem: "Identificação administrativa inválida.",
      });
    }

    const [administradores] = await pool.execute(
      `SELECT id, nome, email FROM administrador WHERE id = ? LIMIT 1`, [adminId]
    );

    if (administradores.length === 0) {
      return res.status(403).json({
        mensagem: "Administrador não encontrado ou sem autorização.",
      });
    }

    const admin = administradores[0];

    req.admin = {
      id: admin.id,
      nome: admin.nome,
      email: admin.email,
      tipo: "admin",
    };

    return next();
  } catch (erro) {
    if (erro.name === "JsonWebTokenError" || erro.name === "TokenExpiredError" || erro.name === "NotBeforeError") {
      return res.status(401).json({
        mensagem: "Sessão inválida ou expirada.",
      });
    }

    return next(erro);
  }
}
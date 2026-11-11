
import jwt from "jsonwebtoken";

export function autenticarAdministrador(req, res, next) {
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

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (decoded.tipo !== "admin") {
      return res.status(403).json({
        mensagem: "Acesso permitido somente para administradores.",
      });
    }

    req.admin = {
      id: decoded.id,
      tipo: decoded.tipo,
    };

    next();
  } catch (erro) {
    return res.status(401).json({
      mensagem: "Sessão inválida ou expirada.",
    });
  }
}

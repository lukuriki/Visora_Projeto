
import jwt from "jsonwebtoken";

export function autenticarUsuario(req, res, next) {
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

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    req.usuario = {
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


export function autenticarUsuarioOpcional(req, res, next) {
  try {
    const authorization = req.headers.authorization;

    // Se não houver token, continua como visitante.
    if (!authorization) {
      req.usuario = null;
      return next();
    }

    const [tipo, token] = authorization.split(" ");

    if (tipo !== "Bearer" || !token) {
      return res.status(401).json({
        mensagem: "Token de autenticação inválido.",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.usuario = {
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


import { realizarLoginAdmin, buscarPerfilAdmin, buscarDashboardAdmin } from "../services/adminService.js";

export async function loginAdmin(req, res, next) {
  try {
    const { email, senha } = req.body || {};
    const resultado = await realizarLoginAdmin({ email, senha });

    return res.status(200).json({
      sucesso: true,
      mensagem: "Login realizado com sucesso.",
      token: resultado.token,
      administrador: resultado.administrador,
    });
  } catch (erro) {
    next(erro);
  }
}

export async function perfilAdmin(req, res, next) {
  try {
    const adminId = req.admin?.id;

    if (!adminId) {
      return res.status(401).json({
        sucesso: false,
        mensagem: "Administrador não autenticado.",
      });
    }

    const administrador = await buscarPerfilAdmin(
      adminId
    );

    return res.status(200).json({
      sucesso: true,
      mensagem:"Perfil administrativo carregado com sucesso.",
      administrador,
    });
  } catch (erro) {
    next(erro);
  }
}

export async function obterDashboardAdmin(req, res, next) {
  try {
    const periodo = req.query.periodo || "Últimos 12 meses";
    const dashboard = await buscarDashboardAdmin({periodo});

    return res.status(200).json({
      sucesso: true,
      mensagem: "Dados do painel administrativo carregados com sucesso.",
      dashboard,
    });
  } catch (erro) {
    next(erro);
  }
}

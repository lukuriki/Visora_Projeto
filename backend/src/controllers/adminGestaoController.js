
import * as s from '../services/adminGestaoService.js';

const tratar = fn => async (req,res,next) => { 
    try { 
        res.json({
            sucesso:true,
            resultado: await fn(req)
        }); 
    } catch(e) { 
        next(e); 
    } 
};

const admin = req => req.admin.id;

export const listarUsuariosAdmin = tratar(req => 
    s.listarUsuariosAdmin(
        req.query.busca
    )
);

export const editarUsuarioAdmin = tratar(req => 
    s.editarUsuarioAdmin(
        admin(req), 
        req.params.id, 
        req.body??{}
    )
);

export const mudarStatusUsuarioAdmin = tratar(req => 
    s.mudarStatusUsuarioAdmin(
        admin(req), 
        req.params.id, 
        req.body?.status
    )
);

export const excluirUsuarioAdmin = tratar(req => 
    s.excluirUsuarioAdmin(
        admin(req), 
        req.params.id, 
        req.body?.confirmacao
    )
);

export const listarEmpresasAdmin = tratar(req => 
    s.listarEmpresasAdmin(
        req.query.busca
    )
);

export const editarEmpresaAdmin = tratar(req =>
    s.editarEmpresaAdmin(
        admin(req), 
        req.params.id, 
        req.body??{}
    )
);

export const mudarStatusEmpresaAdmin = tratar(req => 
    s.mudarStatusEmpresaAdmin(
        admin(req), 
        req.params.id, 
        req.body?.status
    )
);

export const listarAssinaturasAdmin = tratar(() => 
    s.listarAssinaturasAdmin()
);

export const cancelarAssinaturaAdmin = tratar(req => 
    s.cancelarAssinaturaAdmin(
        admin(req),
        req.params.id
    )
);

export const listarPagamentosAdmin = tratar(() => 
    s.listarPagamentosAdmin()
);

export const listarLogsAdmin = tratar(() => 
    s.listarLogsAdmin()
);
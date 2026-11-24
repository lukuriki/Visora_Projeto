import { Router } from 'express';

import { loginAdmin, perfilAdmin, obterDashboardAdmin } from '../controllers/adminController.js';
import { autenticarAdministrador } from '../middlewares/adminMiddleware.js';

import * as gestao from '../controllers/adminGestaoController.js';

const router=Router();

router.post('/login',loginAdmin);
router.use(autenticarAdministrador);
router.get('/perfil',perfilAdmin);
router.get('/dashboard',obterDashboardAdmin);
router.get('/usuarios',gestao.listarUsuariosAdmin);
router.patch('/usuarios/:id',gestao.editarUsuarioAdmin);
router.patch('/usuarios/:id/status',gestao.mudarStatusUsuarioAdmin);
router.delete('/usuarios/:id',gestao.excluirUsuarioAdmin);
router.get('/empresas',gestao.listarEmpresasAdmin);
router.patch('/empresas/:id',gestao.editarEmpresaAdmin);
router.patch('/empresas/:id/status',gestao.mudarStatusEmpresaAdmin);
router.get('/assinaturas',gestao.listarAssinaturasAdmin);
router.patch('/assinaturas/:id/cancelar',gestao.cancelarAssinaturaAdmin);
router.get('/pagamentos',gestao.listarPagamentosAdmin);
router.get('/logs',gestao.listarLogsAdmin);

export default router;

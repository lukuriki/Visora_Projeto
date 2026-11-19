
import { Router } from "express";

import { loginAdmin, perfilAdmin, obterDashboardAdmin } from "../controllers/adminController.js";
import { autenticarAdministrador } from "../middlewares/adminMiddleware.js";

const router = Router();

router.post("/login", loginAdmin);
router.get( "/perfil", autenticarAdministrador, perfilAdmin);
router.get("/dashboard", autenticarAdministrador, obterDashboardAdmin);

export default router;

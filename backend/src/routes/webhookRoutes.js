import { Router } from "express";

import { receberWebhookAsaas } from "../controllers/webhookController.js";

const router = Router();

router.post("/asaas", receberWebhookAsaas);

export default router;
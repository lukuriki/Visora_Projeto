import cors from "cors";
import express from "express";
import helmet from "helmet";

import { errorHandler } from "./middlewares/errorHandler.js";
import healthRoutes from "./routes/healthRoutes.js";

import planosRoutes from "./routes/planosRoutes.js";
import contratacaoRoutes from "./routes/contratacaoRoutes.js";
import contasRoutes from "./routes/contasRoutes.js";
import webhookRoutes from "./routes/webhookRoutes.js";

const app = express();

app.use(helmet());
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
  }),
);
app.use(express.json());

app.get("/", (request, response) => {
  response.json({
    message: "API do projeto base",
  });
});

app.use("/api/health", healthRoutes);
app.use("/api/planos", planosRoutes);
app.use("/api/contratacoes", contratacaoRoutes);
app.use("/api/contas", contasRoutes);
app.use("/api/webhooks", webhookRoutes);

app.use(errorHandler);

export default app;
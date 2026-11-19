import cors from "cors";
import express from "express";
import helmet from "helmet";

import { errorHandler } from "./middlewares/errorHandler.js";
import healthRoutes from "./routes/healthRoutes.js";

import planosRoutes from "./routes/planosRoutes.js";
import contratacaoRoutes from "./routes/contratacaoRoutes.js";
import contasRoutes from "./routes/contasRoutes.js";
import webhookRoutes from "./routes/webhookRoutes.js";
import conversasRoutes from "./routes/conversasRoutes.js";
import assinaturasRoutes from "./routes/assinaturasRoutes.js";
import equipeRoutes from "./routes/equipeRoutes.js";
import informacoesContabeisRoutes from "./routes/informacoesContabeisRoutes.js";
import movimentacoesBancariasRoutes from "./routes/movimentacoesBancariasRoutes.js";
import patrimonioRoutes from "./routes/patrimonioRoutes.js";
import emprestimosRoutes from "./routes/emprestimosRoutes.js";
import investimentosRoutes from "./routes/investimentosRoutes.js";
import analisesRoutes from "./routes/analisesRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import iaRotas from "./routes/iaRotas.js";
import auditoriaRotas from "./routes/auditoriaRotas.js";

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
app.use("/api/conversas", conversasRoutes);
app.use("/api/assinaturas", assinaturasRoutes);
app.use("/api/equipe", equipeRoutes);
app.use("/api/informacoes-contabeis",informacoesContabeisRoutes);
app.use("/api/movimentacoes-bancarias", movimentacoesBancariasRoutes);
app.use("/api/patrimonio", patrimonioRoutes);
app.use("/api/emprestimos", emprestimosRoutes);
app.use("/api/investimentos", investimentosRoutes);
app.use("/api/analises", analisesRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api", iaRotas);
app.use("/api", auditoriaRotas);


app.use(errorHandler);

export default app;
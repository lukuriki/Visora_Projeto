
import "dotenv/config";

import app from "./app.js";
import { seedAdministradores } from "./config/seedAdministradores.js";
import { iniciarSincronizacaoEmail } from "./iniciarSincronizacaoEmail.js";

const port = Number(process.env.PORT || 8080);

// ==========================================
// MOSTRAR CONFIGURAÇÕES DO SERVIDOR
// ==========================================

function mostrarConfiguracao() {
  const situacao = (valor) => (valor ? "ok" : "AUSENTE");

  const modo =
    process.env.PAGAMENTO_MODO ||
    (process.env.PAGAMENTO_SIMULADO === "true"
      ? "simulado"
      : "asaas");

  if (modo === "asaas") {
    console.log(
      `[config] pagamento: modo=asaas | ASAAS_API_KEY=${situacao(process.env.ASAAS_API_KEY)}` +
        ` | ASAAS_WEBHOOK_TOKEN=${situacao(process.env.ASAAS_WEBHOOK_TOKEN)}` +
        ` | url=${process.env.ASAAS_API_URL || "sandbox (padrão)"}`
    );
  } else {
    console.log(`[config] pagamento: modo=${modo}`);
  }

  console.log(
    `[config] e-mail: SMTP_HOST=${situacao(process.env.SMTP_HOST)} | SMTP_USER=${situacao(process.env.SMTP_USER)}` +
      ` | SMTP_PASSWORD=${situacao(process.env.SMTP_PASSWORD)} | EMAIL_FROM=${situacao(process.env.EMAIL_FROM)}`
  );
}

// ==========================================
// INICIALIZAR SERVIDOR
// ==========================================

async function iniciarServidor() {
  try {
    console.log("[server] Iniciando Visora...");

    // ======================================
    // CADASTRAR ADMINISTRADORES
    // ======================================

    console.log("[admin] Verificando administradores...");

    await seedAdministradores();

    console.log("[admin] Verificação concluída.");

    // ======================================
    // INICIAR API
    // ======================================

    app.listen(port, () => {
      console.log(`API running on port ${port}`);

      mostrarConfiguracao();
      iniciarSincronizacaoEmail();

      console.log("[server] Visora iniciada com sucesso.");
    });
  } catch (error) {
    console.error(
      "[server] Erro ao inicializar a Visora:",
      error
    );

    process.exit(1);
  }
}

iniciarServidor();

import "dotenv/config";

import app from "./app.js";

const port = Number(process.env.PORT || 8080);

// Mostra no log se as variáveis importantes chegaram (nunca imprime valores secretos).
function mostrarConfiguracao() {
  const situacao = (valor) => (valor ? "ok" : "AUSENTE");
  const modo = process.env.PAGAMENTO_MODO || (process.env.PAGAMENTO_SIMULADO === "true" ? "simulado" : "asaas");

  if (modo === "asaas") {
    console.log(
      `[config] pagamento: modo=asaas | ASAAS_API_KEY=${situacao(process.env.ASAAS_API_KEY)}` +
        ` | ASAAS_WEBHOOK_TOKEN=${situacao(process.env.ASAAS_WEBHOOK_TOKEN)}` +
        ` | url=${process.env.ASAAS_API_URL || "sandbox (padrão)"}`,
    );
  } else {
    console.log(`[config] pagamento: modo=${modo}`);
  }

  console.log(
    `[config] e-mail: SMTP_HOST=${situacao(process.env.SMTP_HOST)} | SMTP_USER=${situacao(process.env.SMTP_USER)}` +
      ` | SMTP_PASSWORD=${situacao(process.env.SMTP_PASSWORD)} | EMAIL_FROM=${situacao(process.env.EMAIL_FROM)}`,
  );
}

app.listen(port, () => {
  console.log(`API running on port ${port}`);
  mostrarConfiguracao();
});

import { sincronizarRespostasEmail } from "./services/sincronizacaoEmailService.js";

// ==========================================
// CONFIGURAÇÃO DA SINCRONIZAÇÃO
// ==========================================

// Verifica novas respostas a cada 60 segundos.
const INTERVALO_SINCRONIZACAO = 60 * 1000;

let sincronizacaoEmAndamento = false;
let intervaloAtivo = null;

// ==========================================
// EXECUTAR SINCRONIZAÇÃO
// ==========================================

async function executarSincronizacao() {
  // Evita executar duas sincronizações simultâneas.
  if (sincronizacaoEmAndamento) {
    return;
  }

  sincronizacaoEmAndamento = true;

  try {
    const resultado = await sincronizarRespostasEmail();

    if (resultado.importadas > 0) {
      console.log(
        `[VISORA] ${resultado.importadas} nova(s) resposta(s) recebida(s).`
      );
    }

  } catch (erro) {
    console.error(
      "[VISORA] Erro na sincronização de e-mails:",
      erro.message
    );

  } finally {
    sincronizacaoEmAndamento = false;
  }
}

// ==========================================
// INICIAR SINCRONIZAÇÃO AUTOMÁTICA
// ==========================================


export function iniciarSincronizacaoEmail() {
  if (intervaloAtivo) {
    console.log(
      "[VISORA] A sincronização já está ativa."
    );
    return;
  }

  const configuracoes = [
    "IMAP_HOST",
    "IMAP_PORT",
    "IMAP_USER",
    "IMAP_PASSWORD",
  ];

  const ausentes = configuracoes.filter(
    (variavel) => !process.env[variavel]
  );

  if (ausentes.length > 0) {
    console.warn(
      `[VISORA] Sincronização desativada. Configurações ausentes: ${ausentes.join(", ")}`
    );
    return;
  }

  console.log(
    "[VISORA] Sincronização de e-mails iniciada."
  );

  console.log(
    "[VISORA] Verificando respostas a cada 60 segundos."
  );

  void executarSincronizacao();

  intervaloAtivo = setInterval(() => {
    void executarSincronizacao();
  }, INTERVALO_SINCRONIZACAO);
}

// ==========================================
// ENCERRAR SINCRONIZAÇÃO
// ==========================================

export function pararSincronizacaoEmail() {
  if (intervaloAtivo) {
    clearInterval(intervaloAtivo);
    intervaloAtivo = null;

    console.log(
      "[VISORA] Sincronização de e-mails encerrada."
    );
  }
}

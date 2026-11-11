
import PDFDocument from "pdfkit";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { existsSync } from "node:fs";

import { formatarDocumento } from "../utils/documento.js";

// ======================================================
// 1. CAMINHOS DOS ARQUIVOS
// ======================================================

const DIRETORIO_ASSETS = fileURLToPath(
  new URL("../assets/", import.meta.url)
);

const LOGO = path.join(
  DIRETORIO_ASSETS,
  "logo_horizontal_lightmode.png"
);

const ASSINATURA = path.join(
  DIRETORIO_ASSETS,
  "assinatura_visora.png"
);

const FONTES = {
  regular: path.join(DIRETORIO_ASSETS, "fonts", "Montserrat-Regular.ttf"),
  semibold: path.join(DIRETORIO_ASSETS, "fonts", "Montserrat-SemiBold.ttf"),
  bold: path.join(DIRETORIO_ASSETS, "fonts", "Montserrat-Bold.ttf"),
};

// ======================================================
// 2. CORES
// ======================================================

const CORES = {
  principal: "#273B31",
  escuro: "#344E41",
  verde: "#588157",
  claro: "#A3B18A",
  fundo: "#F2F4EF",
  linha: "#DAD7CD",
  texto: "#333B35",
  secundario: "#788078",
  branco: "#FFFFFF",
};

// ======================================================
// 3. FORMATAÇÃO
// ======================================================

const NOMES_METODO = {
  pix: "PIX",
  cartao_credito: "Cartão de crédito",
  cartao_debito: "Cartão de débito",
  boleto: "Boleto",
  carteira_digital: "Carteira digital",
};

const moeda = (valor) =>
  Number(valor).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });

const dataBR = (valor) => {
  if (!valor) return "Não informado";

  return new Date(valor).toLocaleDateString("pt-BR", {
    timeZone: "UTC",
  });
};

// ======================================================
// 4. GERAÇÃO DO RECIBO
// ======================================================

export function gerarReciboPdf(dados, saida) {
  const {
    pagamento,
    plano,
    assinatura,
    usuario,
    empresa,
  } = dados;

  // Validação das fontes.
  for (const fonte of Object.values(FONTES)) {
    if (!existsSync(fonte)) {
      throw new Error(`Arquivo de fonte não encontrado: ${fonte}`);
    }
  }

  // Criação do documento A4.
  const doc = new PDFDocument({
    size: "A4",
    margin: 42,
  });

  doc.pipe(saida);

  // Registro das fontes.
  doc.registerFont("Montserrat", FONTES.regular);
  doc.registerFont("Montserrat-SemiBold", FONTES.semibold);
  doc.registerFont("Montserrat-Bold", FONTES.bold);

  const largura = doc.page.width;
  const altura = doc.page.height;

  const margem = 42;
  const larguraConteudo = largura - margem * 2;

  // ====================================================
  // 5. CABEÇALHO
  // ====================================================

  if (existsSync(LOGO)) {
    doc.image(LOGO, margem, 35, {
      fit: [200, 75],
      align: "center",
      valign: "center",
    });
  }

  doc
    .font("Montserrat-Bold")
    .fontSize(20)
    .fillColor(CORES.principal)
    .text("RECIBO DE", 310, 53, {
      width: 235,
      align: "right",
    });

  doc
    .font("Montserrat-Bold")
    .fontSize(20)
    .fillColor(CORES.principal)
    .text("PAGAMENTO", 310, 77, {
      width: 235,
      align: "right",
    });

  doc
    .font("Montserrat")
    .fontSize(8.5)
    .fillColor(CORES.secundario)
    .text("COMPROVANTE DE CONTRATAÇÃO", 310, 104, {
      width: 235,
      align: "right",
      characterSpacing: 1,
    });

  doc
    .moveTo(margem, 130)
    .lineTo(largura - margem, 130)
    .lineWidth(0.8)
    .strokeColor(CORES.claro)
    .stroke();

  // ====================================================
  // 6. DESTAQUE DO VALOR
  // ====================================================

  const caixaY = 142;
  const caixaAltura = 82;

  doc
    .roundedRect(
      margem,
      caixaY,
      larguraConteudo,
      caixaAltura,
      9
    )
    .fillColor(CORES.fundo)
    .fill();

  doc
    .font("Montserrat-SemiBold")
    .fontSize(9)
    .fillColor(CORES.secundario)
    .text("VALOR TOTAL PAGO", margem + 20, caixaY + 11);

  doc
    .font("Montserrat-Bold")
    .fontSize(27)
    .fillColor(CORES.principal)
    .text(moeda(pagamento.valor), margem + 20, caixaY + 29);

  // Confirmação do pagamento.
  doc
    .circle(margem + 23, caixaY + 68, 3)
    .fillColor(CORES.verde)
    .fill();

  doc
    .font("Montserrat-SemiBold")
    .fontSize(8.5)
    .fillColor(CORES.verde)
    .text("Pagamento confirmado", margem + 33, caixaY + 63);

  // ====================================================
  // 7. SEÇÕES DO RECIBO
  // ====================================================

  doc.y = 250;

  // Títulos das seções.
  function secao(titulo) {
    doc.moveDown(0.35);

    doc
      .font("Montserrat-Bold")
      .fontSize(11)
      .fillColor(CORES.principal)
      .text(titulo.toUpperCase(), margem, doc.y);

    const y = doc.y + 3;

    doc
      .moveTo(margem, y)
      .lineTo(largura - margem, y)
      .lineWidth(0.5)
      .strokeColor(CORES.linha)
      .stroke();

    doc.y = y + 7;
  }

  // Informações organizadas em duas colunas.
  function linha(rotulo, valor) {
    const textoValor = String(valor ?? "Não informado");
    const y = doc.y;

    const larguraRotulo = 135;
    const inicioValor = margem + larguraRotulo;
    const larguraValor = larguraConteudo - larguraRotulo;

    // Mede a altura dos textos.
    doc
      .font("Montserrat-SemiBold")
      .fontSize(9);

    const alturaRotulo = doc.heightOfString(rotulo, {
      width: larguraRotulo,
    });

    doc
      .font("Montserrat")
      .fontSize(9);

    const alturaValor = doc.heightOfString(textoValor, {
      width: larguraValor,
    });

    // Rótulo.
    doc
      .font("Montserrat-SemiBold")
      .fontSize(9)
      .fillColor(CORES.secundario)
      .text(rotulo, margem, y, {
        width: larguraRotulo,
        align: "left",
      });

    // Valor.
    doc
      .font("Montserrat")
      .fontSize(9)
      .fillColor(CORES.texto)
      .text(textoValor, inicioValor, y, {
        width: larguraValor,
        align: "left",
      });

    // Espaçamento entre os campos.
    doc.y = y + Math.max(alturaRotulo, alturaValor) + 5;
  }

  // ====================================================
  // 8. DETALHES DA TRANSAÇÃO
  // ====================================================

  secao("Detalhes da transação");

  linha(
    "Número do recibo:",
    String(pagamento.id).padStart(6, "0")
  );

  linha("Código da transação:", pagamento.codigo);

  linha("Data do pagamento:", dataBR(pagamento.pagoEm));

  linha(
    "Forma de pagamento:",
    NOMES_METODO[pagamento.metodo] ?? pagamento.metodo
  );

  // ====================================================
  // 9. PLANO CONTRATADO
  // ====================================================

  secao("Plano contratado");

  linha("Plano:", plano.tipo);

  linha("Duração:", `${plano.duracaoMeses} mês(es)`);

  linha(
    "Período de vigência:",
    `${dataBR(assinatura.dataInicio)} a ${dataBR(assinatura.dataFim)}`
  );

  // ====================================================
  // 10. DADOS DO CONTRATANTE
  // ====================================================

  secao("Dados do contratante");

  linha("Nome completo:", usuario.nome);

  linha("E-mail:", usuario.email);

  // ====================================================
  // 11. DADOS DA EMPRESA
  // ====================================================

  secao("Dados da empresa");

  linha("Razão social:", empresa.razaoSocial);

  linha(
    empresa.tipoDocumento + ":",
    formatarDocumento(
      empresa.tipoDocumento,
      empresa.documento
    )
  );

  linha("Setor de atuação:", empresa.setorAtuacao);

  // ====================================================
  // 12. ASSINATURA INSTITUCIONAL
  // ====================================================

  const assinaturaLargura = 200;
  const assinaturaAltura =85;

  const assinaturaX = (largura - assinaturaLargura) / 2;

  const rodapeY = altura - 67;
  const assinaturaY = rodapeY - 155;

  // Imagem da assinatura.
  if (existsSync(ASSINATURA)) {
    doc.image(ASSINATURA, assinaturaX, assinaturaY, {
      fit: [assinaturaLargura, assinaturaAltura],
      align: "center",
      valign: "center",
    });
  }

  // Linha de assinatura.
  const linhaAssinaturaY = assinaturaY + assinaturaAltura - 2;

  doc
    .moveTo(largura / 2 - 85, linhaAssinaturaY)
    .lineTo(largura / 2 + 85, linhaAssinaturaY)
    .lineWidth(0.7)
    .strokeColor(CORES.secundario)
    .stroke();

  // Identificação da assinatura.
  doc
    .font("Montserrat-SemiBold")
    .fontSize(8.5)
    .fillColor(CORES.secundario)
    .text(
      "ASSINATURA",
      margem,
      linhaAssinaturaY + 5,
      {
        width: larguraConteudo,
        align: "center",
        characterSpacing: 2,
      }
    );

  doc
    .font("Montserrat-Bold")
    .fontSize(9.5)
    .fillColor(CORES.principal)
    .text(
      "Equipe Visora",
      margem,
      linhaAssinaturaY + 19,
      {
        width: larguraConteudo,
        align: "center",
      }
    );

  // ====================================================
  // 13. RODAPÉ
  // ====================================================

  doc
    .moveTo(margem, rodapeY - 10)
    .lineTo(largura - margem, rodapeY - 10)
    .lineWidth(0.5)
    .strokeColor(CORES.linha)
    .stroke();

  doc
    .font("Montserrat")
    .fontSize(8)
    .fillColor(CORES.secundario)
    .text(
      "Este documento comprova o registro do pagamento referente à contratação descrita acima.",
      margem,
      rodapeY - 5,
      {
        width: larguraConteudo,
        align: "center",
      }
    );

  doc
    .font("Montserrat-SemiBold")
    .fontSize(8)
    .fillColor(CORES.verde)
    .text(
      `© ${new Date().getFullYear()} Visora. Todos os direitos reservados.`,
      margem,
      rodapeY + 9,
      {
        width: larguraConteudo,
        align: "center",
      }
    );

  // ====================================================
  // 14. FINALIZAÇÃO
  // ====================================================

  doc.end();
}

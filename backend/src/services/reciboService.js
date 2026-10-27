import PDFDocument from "pdfkit";

import { formatarDocumento } from "../utils/documento.js";

const NOMES_METODO = {
  pix: "PIX",
  cartao_credito: "Cartão de crédito",
  cartao_debito: "Cartão de débito",
  boleto: "Boleto",
  carteira_digital: "Carteira digital",
};

const moeda = (valor) =>
  Number(valor).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

const dataBR = (valor) => new Date(valor).toLocaleDateString("pt-BR");

// Escreve o PDF direto no stream de saída (a resposta HTTP).
export function gerarReciboPdf(dados, saida) {
  const { pagamento, plano, assinatura, usuario, empresa } = dados;
  const doc = new PDFDocument({ size: "A4", margin: 50 });
  doc.pipe(saida);

  const linha = (rotulo, valor) => {
    doc.font("Helvetica-Bold").fontSize(10).fillColor("#344E41").text(rotulo, { continued: true });
    doc.font("Helvetica").fillColor("#222222").text(`  ${valor}`);
  };

  const secao = (titulo) => {
    doc.moveDown(1.2);
    doc.font("Helvetica-Bold").fontSize(12).fillColor("#588157").text(titulo);
    doc.moveDown(0.3);
  };

  doc.font("Helvetica-Bold").fontSize(26).fillColor("#344E41").text("Visora");
  doc.font("Helvetica").fontSize(11).fillColor("#666666").text("Recibo de pagamento");

  secao("Recibo");
  linha("Número:", String(pagamento.id).padStart(6, "0"));
  linha("Código da transação:", pagamento.codigo);
  linha("Data do pagamento:", dataBR(pagamento.pagoEm));
  linha("Forma de pagamento:", NOMES_METODO[pagamento.metodo] ?? pagamento.metodo);

  secao("Plano contratado");
  linha("Plano:", plano.tipo);
  linha("Duração:", `${plano.duracaoMeses} mês(es)`);
  linha("Vigência:", `${dataBR(assinatura.dataInicio)} a ${dataBR(assinatura.dataFim)}`);

  secao("Contratante");
  linha("Nome:", usuario.nome);
  linha("E-mail:", usuario.email);

  secao("Empresa");
  linha("Razão social:", empresa.razaoSocial);
  linha(`${empresa.tipoDocumento}:`, formatarDocumento(empresa.tipoDocumento, empresa.documento));
  linha("Setor de atuação:", empresa.setorAtuacao);

  doc.moveDown(2);
  doc.font("Helvetica-Bold").fontSize(16).fillColor("#344E41").text(`Valor pago: ${moeda(pagamento.valor)}`);

  doc.moveDown(3);
  doc.font("Helvetica").fontSize(9).fillColor("#888888").text(
    "Documento gerado eletronicamente pela Visora. Guarde este recibo para seus registros.",
    { align: "center" },
  );

  doc.end();
}
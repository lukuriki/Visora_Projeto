export const SETORES = ["Comércio", "Serviços", "Indústria", "Tecnologia", "Varejo", "Saúde", "Outros"];
export const METODOS = ["pix", "cartao_credito", "cartao_debito", "boleto", "carteira_digital"];

export const apenasDigitos = (valor) => String(valor ?? "").replace(/\D/g, "");

export function emailValido(email) {
  return typeof email === "string" && email.length <= 100 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function cpfValido(valor) {
  const cpf = apenasDigitos(valor);
  if (cpf.length !== 11 || /^(\d)\1+$/.test(cpf)) return false;
  for (const tamanho of [9, 10]) {
    let soma = 0;
    for (let i = 0; i < tamanho; i++) soma += Number(cpf[i]) * (tamanho + 1 - i);
    const digito = ((soma * 10) % 11) % 10;
    if (digito !== Number(cpf[tamanho])) return false;
  }
  return true;
}

export function cnpjValido(valor) {
  const cnpj = apenasDigitos(valor);
  if (cnpj.length !== 14 || /^(\d)\1+$/.test(cnpj)) return false;
  for (const tamanho of [12, 13]) {
    const pesos = tamanho === 12 ? [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2] : [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
    let soma = 0;
    for (let i = 0; i < tamanho; i++) soma += Number(cnpj[i]) * pesos[i];
    const resto = soma % 11;
    const digito = resto < 2 ? 0 : 11 - resto;
    if (digito !== Number(cnpj[tamanho])) return false;
  }
  return true;
}

// Usado no recibo: 52998224725 -> 529.982.247-25
export function formatarDocumento(tipo, valor) {
  const d = apenasDigitos(valor);
  if (tipo === "CPF" && d.length === 11) return d.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
  if (tipo === "CNPJ" && d.length === 14) return d.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, "$1.$2.$3/$4-$5");
  return valor;
}

// Valida o corpo enviado pela página de pagamento (payload plano, igual ao do front).
// Retorna { erros, dados }. As chaves de "erros" são os mesmos nomes dos campos do front.
export function validarContratacao(body = {}) {
  const erros = {};

  const planoId = Number(body.planoId);
  if (!Number.isInteger(planoId) || planoId <= 0) erros.planoId = "Plano inválido.";

  const nome = String(body.nomeCompleto ?? "").trim();
  if (nome.length < 3 || nome.length > 100) erros.nomeCompleto = "Informe o nome completo.";

  const emailPessoal = String(body.emailPessoal ?? "").trim().toLowerCase();
  if (!emailValido(emailPessoal)) erros.emailPessoal = "E-mail inválido.";

  const telefone = apenasDigitos(body.telefonePessoal);
  if (telefone.length < 10 || telefone.length > 13) erros.telefonePessoal = "Telefone inválido.";

  const nomeEmpresa = String(body.nomeEmpresa ?? "").trim();
  if (nomeEmpresa.length < 2 || nomeEmpresa.length > 150) erros.nomeEmpresa = "Informe o nome da empresa.";

  const emailEmpresa = String(body.emailEmpresa ?? "").trim().toLowerCase();
  if (!emailValido(emailEmpresa)) erros.emailEmpresa = "E-mail da empresa inválido.";

  const telEmpresa = apenasDigitos(body.telefoneEmpresa); // opcional
  if (telEmpresa && (telEmpresa.length < 10 || telEmpresa.length > 13)) erros.telefoneEmpresa = "Telefone da empresa inválido.";

  const tipoDocumento = body.tipoDocumento;
  const documento = apenasDigitos(body.documento);
  if (!["CPF", "CNPJ"].includes(tipoDocumento)) erros.tipoDocumento = "Escolha CPF ou CNPJ.";
  else if (tipoDocumento === "CPF" ? !cpfValido(documento) : !cnpjValido(documento)) erros.documento = `${tipoDocumento} inválido.`;

  if (!SETORES.includes(body.areaAtuacao)) erros.areaAtuacao = "Escolha uma área de atuação.";
  if (body.aceitouTermos !== true) erros.aceitouTermos = "É necessário aceitar os termos de uso e a política de privacidade.";
  if (!METODOS.includes(body.formaPagamento)) erros.formaPagamento = "Forma de pagamento inválida.";

  return {
    erros,
    dados: {
      planoId,
      metodo: body.formaPagamento,
      usuario: { nome, email: emailPessoal, telefone },
      empresa: {
        razaoSocial: nomeEmpresa,
        email: emailEmpresa,
        telefone: telEmpresa || null,
        tipoDocumento,
        documento,
        setor: body.areaAtuacao,
      },
    },
  };
}
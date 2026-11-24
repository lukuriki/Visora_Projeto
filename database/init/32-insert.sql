use visora_db;

-- Dados iniciais: planos
INSERT INTO planos (tipo,duracao_meses,valor,descricao,limite_empresas) VALUES
 ('Mensal',1,89.90,'Acesso completo a todas as ferramentas financeiras da Visora com cobrança mês a mês.',2),
 ('Trimestral',3,249.90,'Acesso completo por 3 meses. Mais prático e com desconto para o trimestre.',3),
 ('Semestral',6,479.90,'Acesso por 6 meses garantindo estabilidade e excelente custo-benefício.',5),
 ('Anual',12,899.00,'Acesso completo com maior desconto. Equivalente a R$ 74,92 por mês cobrado anualmente.',10)
ON DUPLICATE KEY UPDATE
 duracao_meses=VALUES(duracao_meses), valor=VALUES(valor),
 descricao=VALUES(descricao), limite_empresas=VALUES(limite_empresas);

-- Dados iniciais: categorias
INSERT IGNORE INTO categorias_padrao (nome,tipo,natureza) VALUES
 ('Venda de produtos','receita','variavel'),
 ('Prestação de serviços','receita','variavel'),
 ('Mensalidades recebidas','receita','fixo'),
 ('Assinaturas recebidas','receita','fixo'),
 ('Comissões recebidas','receita','variavel'),
 ('Rendimentos financeiros','receita','variavel'),
 ('Aluguéis recebidos','receita','fixo'),
 ('Outras receitas','receita','variavel'),
 ('Aluguel','despesa','fixo'),
 ('Energia elétrica','despesa','variavel'),
 ('Água e saneamento','despesa','variavel'),
 ('Internet e telefonia','despesa','fixo'),
 ('Marketing e publicidade','despesa','variavel'),
 ('Materiais de escritório','despesa','variavel'),
 ('Software e assinaturas','despesa','fixo'),
 ('Manutenção e reparos','despesa','variavel'),
 ('Serviços terceirizados','despesa','variavel'),
 ('Despesas administrativas','despesa','variavel'),
 ('Tarifas bancárias','despesa','variavel'),
 ('Outras despesas','despesa','variavel'),
 ('Salários / Folha de Pagamento','despesa','fixo'),
 ('Matéria-prima','custo','variavel'),
 ('Mercadorias para revenda','custo','variavel'),
 ('Embalagens','custo','variavel'),
 ('Frete e transporte','custo','variavel'),
 ('Produção','custo','variavel'),
 ('Mão de obra direta','custo','variavel'),
 ('Equipamentos de produção','custo','fixo'),
 ('Armazenamento','custo','fixo'),
 ('Logística','custo','variavel'),
 ('Outros custos','custo','variavel'),
 ('DAS - Simples Nacional','imposto','variavel'),
 ('ISS','imposto','variavel'),
 ('ICMS','imposto','variavel'),
 ('IRPJ','imposto','variavel'),
 ('CSLL','imposto','variavel'),
 ('PIS','imposto','variavel'),
 ('COFINS','imposto','variavel'),
 ('INSS patronal','imposto','variavel'),
 ('IPTU','imposto','fixo'),
 ('IPVA','imposto','fixo'),
 ('Outros tributos','imposto','variavel');

-- Para instalações em que já existam empresas/assinaturas:
INSERT INTO categorias (empresa_id,nome,tipo,natureza)
SELECT e.id,cp.nome,cp.tipo,cp.natureza FROM empresas e
CROSS JOIN categorias_padrao cp
WHERE NOT EXISTS (
 SELECT 1 FROM categorias c WHERE c.empresa_id=e.id AND c.nome=cp.nome AND c.tipo=cp.tipo
);

INSERT IGNORE INTO assinatura_empresas (assinatura_id,empresa_id)
SELECT id,empresa_id FROM assinaturas;

-- Trigger criada ao final, depois de inserir todas as categorias padrão.
-- DROP TRIGGER evita erro ao executar novamente o arquivo.
DROP TRIGGER IF EXISTS trg_visora_empresa_categorias_padrao;
DELIMITER $$
CREATE TRIGGER trg_visora_empresa_categorias_padrao
AFTER INSERT ON empresas
FOR EACH ROW
BEGIN
 INSERT INTO categorias (empresa_id,nome,tipo,natureza)
 SELECT NEW.id,cp.nome,cp.tipo,cp.natureza FROM categorias_padrao cp;
END$$
DELIMITER ;
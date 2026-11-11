use visora_db;

CREATE TABLE IF NOT EXISTS categorias_padrao (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    tipo ENUM('receita', 'despesa', 'custo', 'imposto') NOT NULL,
    natureza ENUM('fixo', 'variavel') NULL,

    UNIQUE KEY uq_categoria_padrao (nome, tipo)
);

INSERT IGNORE INTO categorias_padrao (nome, tipo, natureza) VALUES
('Vendas de Produtos', 'receita', NULL),
('Prestação de Serviços', 'receita', NULL),
('Aluguel', 'despesa', 'fixo'),
('Energia', 'despesa', 'variavel'),
('Salários / Folha de Pagamento', 'despesa', 'fixo'),
('Marketing', 'despesa', 'variavel'),
('Matéria-prima', 'custo', 'variavel'),
('Embalagens', 'custo', 'variavel'),
('Produção', 'custo', 'variavel'),
('Impostos e Taxas', 'imposto', NULL);

use visora_db;

CREATE TABLE IF NOT EXISTS planos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    tipo VARCHAR(100) NOT NULL UNIQUE,
    duracao_meses INT NOT NULL,
    valor DECIMAL(10, 2) NOT NULL,
    descricao TEXT NOT NULL,
    ativo BOOLEAN NOT NULL DEFAULT TRUE,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT chk_planos_valor CHECK (valor >= 0),
    CONSTRAINT chk_planos_duracao CHECK (duracao_meses > 0)
);

INSERT INTO planos (tipo, duracao_meses, valor, descricao) VALUES
('Mensal', 1, 89.90,'Acesso completo a todas as ferramentas financeiras da Visora com cobrança mês a mês.'),
('Trimestral', 3, 249.90,'Acesso completo por 3 meses. Mais prático e com desconto para o trimestre.'),
('Semestral', 6, 479.90,'Acesso por 6 meses garantindo estabilidade e excelente custo-benefício.'),
('Anual', 12, 899.00,'Acesso completo com maior desconto. Equivalente a R$ 74,92 por mês cobrado anualmente.')
ON DUPLICATE KEY UPDATE duracao_meses = VALUES(duracao_meses), valor = VALUES(valor), descricao = VALUES(descricao);
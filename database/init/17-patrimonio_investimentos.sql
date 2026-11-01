use visora_db;

CREATE TABLE IF NOT EXISTS patrimonio_investimentos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    empresa_id INT NOT NULL,

    tipo ENUM('ativo', 'patrimonio', 'emprestimo', 'investimento') NOT NULL,

    descricao VARCHAR(255) NOT NULL,
    valor DECIMAL(15, 2) NOT NULL,
    taxa_juros DECIMAL(5, 2) NULL,
    data_registro DATE NOT NULL,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_patrimonio_empresa
        FOREIGN KEY (empresa_id)
        REFERENCES empresas(id)
        ON DELETE CASCADE,

    INDEX idx_patrimonio_empresa_tipo (empresa_id, tipo)
);
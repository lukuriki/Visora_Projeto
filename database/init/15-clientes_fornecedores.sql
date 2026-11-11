use visora_db;

CREATE TABLE IF NOT EXISTS clientes_fornecedores (
    id INT AUTO_INCREMENT PRIMARY KEY,
    empresa_id INT NOT NULL,
    tipo ENUM('cliente', 'fornecedor') NOT NULL,
    nome_razao VARCHAR(150) NOT NULL,
    documento VARCHAR(20),
    email VARCHAR(100),
    telefone VARCHAR(20),
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_parceiros_empresa
        FOREIGN KEY (empresa_id)
        REFERENCES empresas(id)
        ON DELETE CASCADE,

    UNIQUE KEY uq_parceiro_documento (empresa_id, tipo, documento),
    INDEX idx_parceiros_empresa_tipo (empresa_id, tipo)
);
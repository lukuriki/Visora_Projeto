use visora_db;

CREATE TABLE IF NOT EXISTS contas_bancarias (
    id INT AUTO_INCREMENT PRIMARY KEY,
    empresa_id INT NOT NULL,
    nome_banco VARCHAR(100) NOT NULL,

    tipo_conta ENUM('corrente', 'poupanca', 'caixa', 'investimento') NOT NULL DEFAULT 'corrente',

    saldo_inicial DECIMAL(15, 2) NOT NULL DEFAULT 0.00,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_contas_empresa
        FOREIGN KEY (empresa_id)
        REFERENCES empresas(id)
        ON DELETE CASCADE
);

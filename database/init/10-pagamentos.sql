use visora_db;

CREATE TABLE IF NOT EXISTS pagamentos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    assinatura_id INT NOT NULL,
    valor DECIMAL(10, 2) NOT NULL,

    metodo ENUM('pix', 'cartao_credito', 'cartao_debito', 'boleto', 'carteira_digital') NOT NULL,
    status ENUM('pendente', 'aprovado', 'recusado', 'estornado') NOT NULL DEFAULT 'pendente',

    codigo_transacao VARCHAR(100) NULL,
    gateway_id VARCHAR(100) NULL,
    gateway_url VARCHAR(500) NULL,
    pago_em DATETIME NULL,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    

    CONSTRAINT fk_pagamentos_assinatura
        FOREIGN KEY (assinatura_id)
        REFERENCES assinaturas(id)
        ON DELETE RESTRICT,

    CONSTRAINT chk_pagamentos_valor CHECK (valor > 0),

    INDEX idx_pagamentos_assinatura (assinatura_id, status),
    UNIQUE INDEX uq_pagamentos_codigo (codigo_transacao),
    INDEX idx_pagamentos_gateway (gateway_id)
);
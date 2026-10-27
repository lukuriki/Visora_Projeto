use visora_db;

CREATE TABLE IF NOT EXISTS movimentacoes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    empresa_id INT NOT NULL,
    categoria_id INT NOT NULL,
    conta_bancaria_id INT NULL,
    cliente_fornecedor_id INT NULL,

    descricao VARCHAR(255) NOT NULL,
    valor DECIMAL(15, 2) NOT NULL,

    data_vencimento DATE NOT NULL,
    data_pagamento DATE NULL,

    status ENUM('pendente', 'pago', 'cancelado') NOT NULL DEFAULT 'pendente',

    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_movimentacoes_empresa
        FOREIGN KEY (empresa_id)
        REFERENCES empresas(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_movimentacoes_categoria
        FOREIGN KEY (categoria_id)
        REFERENCES categorias(id)
        ON DELETE RESTRICT,

    CONSTRAINT fk_movimentacoes_conta
        FOREIGN KEY (conta_bancaria_id)
        REFERENCES contas_bancarias(id)
        ON DELETE SET NULL,

    CONSTRAINT fk_movimentacoes_parceiro
        FOREIGN KEY (cliente_fornecedor_id)
        REFERENCES clientes_fornecedores(id)
        ON DELETE SET NULL,

    CONSTRAINT chk_movimentacoes_valor CHECK (valor > 0),
    CONSTRAINT chk_movimentacoes_pago
        CHECK (status <> 'pago' OR data_pagamento IS NOT NULL),

    INDEX idx_movimentacoes_empresa_vencimento (empresa_id, data_vencimento),
    INDEX idx_movimentacoes_empresa_status (empresa_id, status)
);
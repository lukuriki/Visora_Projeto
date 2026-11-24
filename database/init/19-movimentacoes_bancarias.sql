use visora_db;

CREATE TABLE IF NOT EXISTS movimentacoes_bancarias (
    id INT AUTO_INCREMENT PRIMARY KEY, 
    empresa_id INT NOT NULL,
    conta_bancaria_id INT NOT NULL, 
    tipo ENUM('entrada','saida') NOT NULL,
    descricao VARCHAR(255) NOT NULL, 
    valor DECIMAL(15,2) NOT NULL,
    data_movimentacao DATE NOT NULL, 
    categoria VARCHAR(100) DEFAULT NULL,
    observacoes TEXT DEFAULT NULL, 
    movimentacao_financeira_id INT DEFAULT NULL,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_mov_banc_empresa FOREIGN KEY (empresa_id) REFERENCES empresas(id),
    CONSTRAINT fk_mov_banc_conta FOREIGN KEY (conta_bancaria_id) REFERENCES contas_bancarias(id),
    CONSTRAINT fk_mov_banc_financeira FOREIGN KEY (movimentacao_financeira_id) REFERENCES movimentacoes(id),
    CONSTRAINT chk_mov_banc_valor CHECK (valor > 0),
    INDEX idx_mov_banc_empresa (empresa_id),
    INDEX idx_mov_banc_conta (conta_bancaria_id),
    INDEX idx_mov_banc_data (data_movimentacao)
) ENGINE=InnoDB;
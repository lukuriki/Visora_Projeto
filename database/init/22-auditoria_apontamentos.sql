use visora_db;

CREATE TABLE IF NOT EXISTS auditoria_apontamentos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    empresa_id INT NOT NULL,
    movimentacao_id INT NULL,

    tipo ENUM('divergencia','movimentacao_incomum','classificacao_inconsistente','alteracao_fora_padrao') NOT NULL,
    descricao TEXT NOT NULL,
    nivel_severidade ENUM('baixo', 'medio', 'alto', 'critico') NOT NULL DEFAULT 'medio',
    status ENUM('aberto', 'em_analise', 'resolvido', 'ignorado') NOT NULL DEFAULT 'aberto',

    detectado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    resolvido_em DATETIME NULL,
    resolvido_por_usuario_id INT NULL,

    CONSTRAINT fk_apontamentos_empresa
        FOREIGN KEY (empresa_id)
        REFERENCES empresas(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_apontamentos_movimentacao
        FOREIGN KEY (movimentacao_id)
        REFERENCES movimentacoes(id)
        ON DELETE SET NULL,

    CONSTRAINT fk_apontamentos_usuario
        FOREIGN KEY (resolvido_por_usuario_id)
        REFERENCES usuarios(id)
        ON DELETE SET NULL,

    INDEX idx_apontamentos_empresa_status (empresa_id, status, nivel_severidade)
);

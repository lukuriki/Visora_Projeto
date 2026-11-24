use visora_db;

CREATE TABLE IF NOT EXISTS auditoria_apontamentos (
    id INT AUTO_INCREMENT PRIMARY KEY, 
    empresa_id INT NOT NULL,
    execucao_id INT NULL, 
    movimentacao_id INT NULL,
    tipo ENUM('duplicidade','valor_incomum','classificacao_incorreta','divergencia','alteracao_suspeita','outro') NOT NULL,
    gravidade ENUM('baixa','media','alta','critica') NOT NULL DEFAULT 'media',
    titulo VARCHAR(255) NOT NULL, 
    descricao TEXT NOT NULL,
    recomendacao TEXT NULL,
    status ENUM('pendente','em_analise','resolvido','ignorado') NOT NULL DEFAULT 'pendente',
    origem VARCHAR(30) NOT NULL DEFAULT 'regra',
    fingerprint VARCHAR(64) NULL,
    resolvido_por INT NULL, 
    resolvido_em DATETIME NULL,
    observacao_resolucao TEXT NULL,
    criado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    atualizado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_apontamentos_empresa FOREIGN KEY (empresa_id) REFERENCES empresas(id) ON DELETE CASCADE,
    CONSTRAINT fk_apontamentos_execucao FOREIGN KEY (execucao_id) REFERENCES auditoria_execucoes(id) ON DELETE SET NULL,
    CONSTRAINT fk_apontamentos_movimentacao FOREIGN KEY (movimentacao_id) REFERENCES movimentacoes(id) ON DELETE SET NULL,
    CONSTRAINT fk_apontamentos_usuario FOREIGN KEY (resolvido_por) REFERENCES usuarios(id) ON DELETE SET NULL,
    INDEX idx_apontamentos_empresa_status (empresa_id,status,gravidade),
    INDEX idx_apontamentos_execucao (execucao_id),
    INDEX idx_apontamentos_empresa_criado (empresa_id,criado_em),
    INDEX idx_apontamentos_empresa_fingerprint (empresa_id,fingerprint)
) ENGINE=InnoDB;
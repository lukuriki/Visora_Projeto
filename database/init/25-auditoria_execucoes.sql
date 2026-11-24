use visora_db;

CREATE TABLE IF NOT EXISTS auditoria_execucoes (
    id INT AUTO_INCREMENT PRIMARY KEY, 
    empresa_id INT NOT NULL,
    usuario_id INT DEFAULT NULL,
    status ENUM('pendente','executando','concluida','erro') NOT NULL DEFAULT 'pendente',
    origem ENUM('manual','automatica') NOT NULL DEFAULT 'manual',
    total_analisadas INT NOT NULL DEFAULT 0,
    total_apontamentos INT NOT NULL DEFAULT 0,
    iniciada_em DATETIME DEFAULT NULL, 
    finalizada_em DATETIME DEFAULT NULL,
    criado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    erro_resumo VARCHAR(255) DEFAULT NULL,
    INDEX idx_aud_exec_empresa_status (empresa_id,status),
    INDEX idx_aud_exec_empresa_data (empresa_id,criado_em),
    CONSTRAINT fk_aud_exec_empresa FOREIGN KEY (empresa_id) REFERENCES empresas(id) ON DELETE CASCADE,
    CONSTRAINT fk_aud_exec_usuario FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE SET NULL,
    CONSTRAINT chk_aud_exec_totais CHECK (total_analisadas >= 0 AND total_apontamentos >= 0)
) ENGINE=InnoDB;

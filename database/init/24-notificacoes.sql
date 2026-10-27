use visora_db;

CREATE TABLE IF NOT EXISTS notificacoes (
    id INT AUTO_INCREMENT PRIMARY KEY,

    empresa_id INT NULL,
    usuario_id INT NULL,
    admin_id INT NULL,

    titulo VARCHAR(150) NOT NULL,
    mensagem TEXT NOT NULL,

    tipo ENUM('alerta','vencimento','sistema','mensagem_contato','financeiro','auditoria') NOT NULL DEFAULT 'alerta',

    lida BOOLEAN NOT NULL DEFAULT FALSE,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_notificacoes_empresa
        FOREIGN KEY (empresa_id)
        REFERENCES empresas(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_notificacoes_usuario
        FOREIGN KEY (usuario_id)
        REFERENCES usuarios(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_notificacoes_admin
        FOREIGN KEY (admin_id)
        REFERENCES administrador(id)
        ON DELETE CASCADE,

    INDEX idx_notificacoes_usuario_lida (usuario_id, lida),
    INDEX idx_notificacoes_admin_lida (admin_id, lida),
    INDEX idx_notificacoes_empresa_data (empresa_id, criado_em)
);

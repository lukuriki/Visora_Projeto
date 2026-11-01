use visora_db;

CREATE TABLE IF NOT EXISTS logs_sistema (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,

    empresa_id INT NULL,
    usuario_id INT NULL,
    admin_id INT NULL,

    acao ENUM('acesso', 'criacao', 'alteracao', 'exclusao', 'sistema') NOT NULL,

    entidade VARCHAR(50) NULL,
    entidade_id INT NULL,
    descricao VARCHAR(255) NULL,

    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_logs_empresa
        FOREIGN KEY (empresa_id)
        REFERENCES empresas(id)
        ON DELETE SET NULL,

    CONSTRAINT fk_logs_usuario
        FOREIGN KEY (usuario_id)
        REFERENCES usuarios(id)
        ON DELETE SET NULL,

    CONSTRAINT fk_logs_admin
        FOREIGN KEY (admin_id)
        REFERENCES administrador(id)
        ON DELETE SET NULL,

    INDEX idx_logs_empresa_data (empresa_id, criado_em),
    INDEX idx_logs_usuario_data (usuario_id, criado_em)
);
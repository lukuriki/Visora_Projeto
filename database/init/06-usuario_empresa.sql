USE visora_db;

CREATE TABLE IF NOT EXISTS usuario_empresa (
    usuario_id INT NOT NULL,
    empresa_id INT NOT NULL,

    perfil_acesso ENUM('proprietario', 'administrador', 'colaborador') NOT NULL DEFAULT 'colaborador',

    vinculado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (usuario_id, empresa_id),

    CONSTRAINT fk_usuario_empresa_usuario
        FOREIGN KEY (usuario_id)
        REFERENCES usuarios(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_usuario_empresa_empresa
        FOREIGN KEY (empresa_id)
        REFERENCES empresas(id)
        ON DELETE CASCADE
);
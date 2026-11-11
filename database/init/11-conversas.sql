use visora_db;

CREATE TABLE IF NOT EXISTS conversas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT NULL,
    nome_cliente VARCHAR(100) NOT NULL,
    sobrenome_cliente VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL,
    empresa VARCHAR(150) NULL,
    assunto VARCHAR(150) NOT NULL,

    status ENUM('aberta', 'respondida', 'encerrada')
        NOT NULL DEFAULT 'aberta',

    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_conversas_usuario
        FOREIGN KEY (usuario_id)
        REFERENCES usuarios(id)
        ON DELETE SET NULL,

    INDEX idx_conversas_usuario (usuario_id),
    INDEX idx_conversas_email (email),
    INDEX idx_conversas_status (status),
    INDEX idx_conversas_atualizado (atualizado_em)
);
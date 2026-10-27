use visora_db;

CREATE TABLE IF NOT EXISTS mensagens_contato (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome_usuario VARCHAR(100) NOT NULL,
    empresa VARCHAR(150),
    email VARCHAR(100) NOT NULL,
    assunto VARCHAR(150) NOT NULL,
    conteudo TEXT NOT NULL,

    status_mensagem ENUM('nao_lida', 'lida', 'respondida') NOT NULL DEFAULT 'nao_lida',

    resposta TEXT NULL,
    admin_id INT NULL,

    data_envio TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    data_resposta TIMESTAMP NULL,

    CONSTRAINT fk_mensagens_administrador
        FOREIGN KEY (admin_id)
        REFERENCES administrador(id)
        ON DELETE SET NULL,

    INDEX idx_mensagens_status_data (status_mensagem, data_envio)
);

use visora_db;

CREATE TABLE IF NOT EXISTS chat_sessoes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT NOT NULL,
    empresa_id INT NOT NULL,

    contexto ENUM('inteligencia_financeira', 'previsao') NOT NULL DEFAULT 'inteligencia_financeira',

    titulo_conversa VARCHAR(150) DEFAULT 'Nova Conversa',
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_chat_sessoes_usuario
        FOREIGN KEY (usuario_id)
        REFERENCES usuarios(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_chat_sessoes_empresa
        FOREIGN KEY (empresa_id)
        REFERENCES empresas(id)
        ON DELETE CASCADE,

    INDEX idx_chat_usuario_empresa (usuario_id, empresa_id, contexto)
);
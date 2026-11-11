use visora_db;

CREATE TABLE IF NOT EXISTS mensagens (
    id INT AUTO_INCREMENT PRIMARY KEY,
    conversa_id INT NOT NULL,
    autor ENUM('cliente', 'admin') NOT NULL,
    mensagem TEXT NOT NULL,
    email_enviado BOOLEAN NOT NULL DEFAULT FALSE,
    email_enviado_em DATETIME NULL,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_mensagens_conversa
        FOREIGN KEY (conversa_id)
        REFERENCES conversas(id)
        ON DELETE CASCADE,

    INDEX idx_mensagens_conversa_data (conversa_id, criado_em)
);
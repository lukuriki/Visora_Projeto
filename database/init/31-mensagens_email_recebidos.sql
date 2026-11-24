CREATE TABLE IF NOT EXISTS mensagens_email_recebidos (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    message_id VARCHAR(512) NOT NULL,
    conversa_id INT NOT NULL, 
    mensagem_id INT NULL,
    recebido_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uq_email_message_id (message_id),
    CONSTRAINT fk_email_conversa FOREIGN KEY (conversa_id) REFERENCES conversas(id) ON DELETE CASCADE,
    CONSTRAINT fk_email_mensagem FOREIGN KEY (mensagem_id) REFERENCES mensagens(id) ON DELETE SET NULL
) ENGINE=InnoDB;
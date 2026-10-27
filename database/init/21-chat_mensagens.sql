use visora_db;

CREATE TABLE IF NOT EXISTS chat_mensagens (
    id INT AUTO_INCREMENT PRIMARY KEY,
    sessao_id INT NOT NULL,

    remetente ENUM('usuario', 'ia') NOT NULL,
    conteudo_texto TEXT NOT NULL,

    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_chat_mensagens_sessao
        FOREIGN KEY (sessao_id)
        REFERENCES chat_sessoes(id)
        ON DELETE CASCADE,

    INDEX idx_chat_mensagens_sessao_data (sessao_id, criado_em)
);
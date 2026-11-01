use visora_db;

CREATE TABLE IF NOT EXISTS previsoes_cenarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    empresa_id INT NOT NULL,
    usuario_id INT NULL,

    nome VARCHAR(150) NOT NULL,

    tipo_cenario ENUM('conservador', 'esperado', 'crescimento', 'personalizado') NOT NULL DEFAULT 'personalizado',

    horizonte_meses INT NOT NULL DEFAULT 6,
    parametros JSON NOT NULL,
    resultado JSON NULL,

    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_previsoes_empresa
        FOREIGN KEY (empresa_id)
        REFERENCES empresas(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_previsoes_usuario
        FOREIGN KEY (usuario_id)
        REFERENCES usuarios(id)
        ON DELETE SET NULL,

    INDEX idx_previsoes_empresa_data (empresa_id, criado_em)
);
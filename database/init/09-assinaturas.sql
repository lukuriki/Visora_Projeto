use visora_db;

CREATE TABLE IF NOT EXISTS assinaturas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    empresa_id INT NOT NULL,
    plano_id INT NOT NULL,

    status ENUM(
        'pendente', 'ativa', 'cancelada', 'expirada'
    ) NOT NULL DEFAULT 'pendente',

    valor_contratado DECIMAL(10, 2) NOT NULL,
    data_inicio DATE NULL,
    data_fim DATE NULL,

    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_assinaturas_empresa
        FOREIGN KEY (empresa_id)
        REFERENCES empresas(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_assinaturas_plano
        FOREIGN KEY (plano_id)
        REFERENCES planos(id)
        ON DELETE RESTRICT,

    INDEX idx_assinaturas_empresa_status (empresa_id, status)
);
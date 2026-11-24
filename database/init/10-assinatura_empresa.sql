use visora_db;

CREATE TABLE IF NOT EXISTS assinatura_empresas (
    assinatura_id INT NOT NULL, 
    empresa_id INT NOT NULL,
    vinculada_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (assinatura_id,empresa_id),
    CONSTRAINT fk_assinatura_empresas_assinatura FOREIGN KEY (assinatura_id) REFERENCES assinaturas(id) ON DELETE CASCADE,
    CONSTRAINT fk_assinatura_empresas_empresa FOREIGN KEY (empresa_id) REFERENCES empresas(id) ON DELETE CASCADE,
    INDEX idx_assinatura_empresas_empresa (empresa_id)
) ENGINE=InnoDB;
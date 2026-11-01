use visora_db;

CREATE TABLE IF NOT EXISTS simulacoes_investimento (
    id INT AUTO_INCREMENT PRIMARY KEY,
    empresa_id INT NOT NULL,
    usuario_id INT NULL,

    nome_simulacao VARCHAR(150) NOT NULL,
    valor_investimento DECIMAL(15, 2) NOT NULL,
    custo_por_unidade DECIMAL(10, 2) NOT NULL,
    preco_estimado_venda DECIMAL(10, 2) NOT NULL,
    producao_inicial INT NOT NULL,

    resultado_lucro_projetado DECIMAL(15, 2) NULL,
    resultado_detalhado JSON NULL,

    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_simulacoes_empresa
        FOREIGN KEY (empresa_id)
        REFERENCES empresas(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_simulacoes_usuario
        FOREIGN KEY (usuario_id)
        REFERENCES usuarios(id)
        ON DELETE SET NULL,

    INDEX idx_simulacoes_empresa_data (empresa_id, criado_em)
);
use visora_db;

CREATE TABLE IF NOT EXISTS planos (
    id INT AUTO_INCREMENT PRIMARY KEY, 
    tipo VARCHAR(100) NOT NULL UNIQUE,
    duracao_meses INT NOT NULL, 
    valor DECIMAL(10,2) NOT NULL,
    descricao TEXT NOT NULL, 
    limite_empresas INT NOT NULL DEFAULT 1,
    ativo BOOLEAN NOT NULL DEFAULT TRUE, 
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT chk_planos_valor CHECK (valor >= 0),
    CONSTRAINT chk_planos_duracao CHECK (duracao_meses > 0),
    CONSTRAINT chk_planos_limite CHECK (limite_empresas > 0)
) ENGINE=InnoDB;
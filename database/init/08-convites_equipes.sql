use visora_db;

CREATE TABLE IF NOT EXISTS convites_equipe (
    id INT AUTO_INCREMENT PRIMARY KEY,
    empresa_id INT NOT NULL,
    email_convidado VARCHAR(100) NOT NULL,
    perfil_acesso ENUM('administrador', 'colaborador') NOT NULL,

    token_hash CHAR(64) NOT NULL UNIQUE,
    status_convite ENUM('pendente', 'aceito', 'expirado', 'cancelado') NOT NULL DEFAULT 'pendente',

    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expira_em DATETIME NOT NULL,

    CONSTRAINT fk_convites_empresa
        FOREIGN KEY (empresa_id)
        REFERENCES empresas(id)
        ON DELETE CASCADE
);
USE visora_db;

CREATE TABLE IF NOT EXISTS empresas (
    id INT AUTO_INCREMENT PRIMARY KEY, 
    razao_social VARCHAR(150) NOT NULL,
    email_empresa VARCHAR(100) NULL, 
    telefone_empresa VARCHAR(20) NULL,
    tipo_documento ENUM('CPF','CNPJ') NOT NULL,
    documento_identificacao VARCHAR(18) NOT NULL,
    cnpj_unico VARCHAR(18) GENERATED ALWAYS AS (CASE WHEN tipo_documento = 'CNPJ' THEN documento_identificacao ELSE NULL END) STORED,
    asaas_cliente_id VARCHAR(100) NULL,
    setor_atuacao ENUM('Comércio','Serviços','Indústria','Tecnologia','Varejo','Saúde','Outros') NOT NULL DEFAULT 'Outros',
    porte_empresa ENUM('Autônomo','MEI','ME','EPP','Média','Grande') NOT NULL DEFAULT 'ME',
    regime_tributario ENUM('Pessoa Física','Simples Nacional','Lucro Presumido','Lucro Real') NOT NULL DEFAULT 'Simples Nacional',
    perfil_risco ENUM('Conservador','Moderado','Arrojado') DEFAULT 'Conservador',
    capital_inicial DECIMAL(15,2) DEFAULT 0.00,
    status ENUM('pendente','ativa','inativa') NOT NULL DEFAULT 'pendente',
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uk_empresas_nome (razao_social),
    UNIQUE KEY uk_empresas_email (email_empresa),
    UNIQUE KEY uk_empresas_telefone (telefone_empresa),
    UNIQUE KEY uk_empresas_cnpj (cnpj_unico)
) ENGINE=InnoDB;
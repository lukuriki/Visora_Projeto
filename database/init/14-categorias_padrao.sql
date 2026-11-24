use visora_db;

CREATE TABLE IF NOT EXISTS categorias_padrao (
    id INT AUTO_INCREMENT PRIMARY KEY, 
    nome VARCHAR(100) NOT NULL,
    tipo ENUM('receita','despesa','custo','imposto') NOT NULL,
    natureza ENUM('fixo','variavel') NULL,
    UNIQUE KEY uq_categoria_padrao (nome,tipo)
) ENGINE=InnoDB;
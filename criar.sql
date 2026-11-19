
CREATE TABLE IF NOT EXISTS publicacoes (
    id VARCHAR(100) PRIMARY KEY,
    userId VARCHAR(100) NOT NULL,
    tipo VARCHAR(20) NOT NULL,
    texto TEXT,
    esporte VARCHAR(50),
    metric VARCHAR(20),
    distanciaMetros DOUBLE DEFAULT 0,
    pontos INT DEFAULT 0,
    tempo VARCHAR(20),
    localizacao VARCHAR(140),
    latitude DECIMAL(10,7),
    longitude DECIMAL(10,7),
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (userId) REFERENCES usuarios(id)
);

CREATE TABLE IF NOT EXISTS publicacao_imagens (
    id INT AUTO_INCREMENT PRIMARY KEY,
    postId VARCHAR(100) NOT NULL,
    imagem LONGTEXT NOT NULL,

    FOREIGN KEY (postId) REFERENCES publicacoes(id)
    ON DELETE CASCADE
);
CREATE TABLE IF NOT EXISTS curtidas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    postId VARCHAR(100) NOT NULL,
    userId VARCHAR(100) NOT NULL,

    FOREIGN KEY (postId) REFERENCES publicacoes(id)
    ON DELETE CASCADE,

    FOREIGN KEY (userId) REFERENCES usuarios(id),

    UNIQUE (postId, userId)
);
CREATE INDEX idx_publicacoes_usuario
ON publicacoes (userId);

CREATE INDEX idx_publicacoes_data
ON publicacoes (createdAt);

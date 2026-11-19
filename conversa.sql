
CREATE TABLE IF NOT EXISTS conversas (
    id VARCHAR(100) PRIMARY KEY,
    usuario1Id VARCHAR(100) NOT NULL,
    usuario2Id VARCHAR(100) NOT NULL,
    dataCriacao DATETIME DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (usuario1Id) REFERENCES usuarios(id),
    FOREIGN KEY (usuario2Id) REFERENCES usuarios(id)
);

CREATE TABLE IF NOT EXISTS mensagens (
    id VARCHAR(100) PRIMARY KEY,
    conversaId VARCHAR(100) NOT NULL,
    remetenteId VARCHAR(100) NOT NULL,
    texto TEXT NOT NULL,
    dataEnvio DATETIME DEFAULT CURRENT_TIMESTAMP,
    lida BOOLEAN DEFAULT FALSE,

    FOREIGN KEY (conversaId) REFERENCES conversas(id),
    FOREIGN KEY (remetenteId) REFERENCES usuarios(id)
);
CREATE INDEX idx_mensagens_conversa
ON mensagens (conversaId);

CREATE INDEX idx_mensagens_remetente
ON mensagens (remetenteId);


CREATE TABLE IF NOT EXISTS comentarios (
    id VARCHAR(100) PRIMARY KEY,
    postId VARCHAR(100) NOT NULL,
    userId VARCHAR(100) NOT NULL,
    texto TEXT NOT NULL,
    dataComentario DATETIME DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_comentarios_post

ON comentarios (postId);
CREATE INDEX idx_comentarios_usuario
ON comentarios (userId);
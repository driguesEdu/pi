CREATE TABLE IF NOT EXISTS esportes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(50) NOT NULL UNIQUE,
    icon VARCHAR(50),
    metric VARCHAR(20)
);

INSERT IGNORE INTO esportes (nome, icon, metric) VALUES
('Corrida', 'run', 'distancia'),
('Caminhada', 'footprints', 'distancia'),
('Ciclismo', 'bike', 'distancia'),
('Natação', 'waves', 'distancia'),
('Musculação', 'dumbbell', ''),
('Futebol', 'activity', 'pontos'),
('Basquete', 'basketball', 'pontos'),
('Tênis', 'activity', 'pontos');

CREATE INDEX idx_esportes_nome
ON esportes (nome);

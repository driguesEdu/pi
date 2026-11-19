
SELECT
    p.id,
    p.userId,
    u.nome,
    u.username,
    u.fotoPerfil,
    p.tipo,
    p.texto,
    p.esporte,
    p.metric,
    p.distanciaMetros,
    p.pontos,
    p.tempo,
    p.localizacao,
    p.latitude,
    p.longitude,
    p.createdAt
FROM publicacoes p
INNER JOIN usuarios u ON p.userId = u.id
ORDER BY p.createdAt DESC;


SELECT
    postId,
    imagem
FROM publicacao_imagens
WHERE postId = ?;


SELECT
    postId,
    COUNT(*) AS totalCurtidas
FROM curtidas
WHERE postId = ?
GROUP BY postId;


SELECT
    c.id,
    c.postId,
    c.userId,
    u.nome,
    u.username,
    c.texto,
    c.dataComentario
FROM comentarios c
INNER JOIN usuarios u ON c.userId = u.id
WHERE c.postId = ?
ORDER BY c.dataComentario ASC;


SELECT *
FROM publicacoes
WHERE userId = ?
ORDER BY createdAt DESC;

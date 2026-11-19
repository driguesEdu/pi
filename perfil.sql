SELECT
    id,
    nome,
    username,
    email,
    bio,
    fotoPerfil,
    dataCadastro
FROM usuarios
WHERE id = ?;


SELECT *
FROM publicacoes
WHERE userId = ?
ORDER BY createdAt DESC;


SELECT COUNT(*) AS totalPublicacoes
FROM publicacoes
WHERE userId = ?;


SELECT COUNT(*) AS totalSeguidores
FROM usuarios
WHERE JSON_CONTAINS(seguindo, JSON_QUOTE(?));


SELECT COUNT(*) AS totalSeguindo
FROM usuarios
WHERE id = ?;


SELECT
    COUNT(*) AS totalAtividades,
    SUM(distanciaMetros) AS distanciaTotal,
    SUM(pontos) AS pontosTotais
FROM publicacoes
WHERE userId = ?;

UPDATE usuarios
SET
    nome = ?,
    username = ?,
    bio = ?,
    fotoPerfil = ?
WHERE id = ?;

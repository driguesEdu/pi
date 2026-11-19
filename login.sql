
SELECT
    id,
    nome,
    username,
    email,
    senhaHash,
    salt,
    fotoPerfil
FROM usuarios
WHERE email = ?;

SELECT
    id,
    nome,
    username,
    email,
    senhaHash,
    salt,
    fotoPerfil
FROM usuarios
WHERE username = ?;

UPDATE usuarios
SET email = ?
WHERE id = ?;

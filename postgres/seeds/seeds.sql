BEGIN TRANSACTION;

INSERT INTO users (fullname, username, joined) VALUES ('Juan Perez', 'jperez', '2019-02-15');
INSERT INTO login (hash, username) VALUES ('$2a$10$Wsxdi/QHKHhN.btUVwtPgOsIIKpaalqs3wA/pkpCbrT/wRjPIki5.', 'jperez');

COMMIT;
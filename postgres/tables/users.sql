BEGIN TRANSACTION;

CREATE TABLE users (
    id serial PRIMARY KEY,
    fullName VARCHAR(100),
    username text UNIQUE NOT NULL,
    entries BIGINT DEFAULT 0,
    joined TIMESTAMP NOT NULL,
    age smallint DEFAULT 0,
    rating smallint DEFAULT 0,
    favouriteDetectionType text
);

COMMIT;
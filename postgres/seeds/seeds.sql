BEGIN TRANSACTION;

INSERT INTO users (fullname, username, joined, favouriteDetectionType, age, rating) VALUES ('Juan Perez', 'jperez', '2019-02-15', 'face', 30, 3);
INSERT INTO login (hash, username) VALUES ('$2a$10$HLLXBhYkxZfbJpdTE3t46e1lXMroiDx4/xrAEampqiMSq7eT7UlNW', 'jperez');

COMMIT;
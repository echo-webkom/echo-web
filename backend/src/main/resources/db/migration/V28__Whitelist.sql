CREATE TABLE IF NOT EXISTS whitelist
(
    email      TEXT PRIMARY KEY,
    expires_at TIMESTAMP NOT NULL
);

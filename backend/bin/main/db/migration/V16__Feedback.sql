CREATE TABLE IF NOT EXISTS "feedback"
(
    id      SERIAL PRIMARY KEY,
    email   TEXT,
    name    TEXT,
    message TEXT                                  NOT NULL,
    sent    TIMESTAMP DEFAULT (CURRENT_TIMESTAMP) NOT NULL
);

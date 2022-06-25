CREATE TABLE IF NOT EXISTS feedback (
    id SERIAL PRIMARY KEY,
    email TEXT NOT NULL,
    name TEXT NOT NULL,
    message TEXT NOT NULL,
);
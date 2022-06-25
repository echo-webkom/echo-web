CREATE TABLE IF NOT EXISTS "user"
(
    email       TEXT NOT NULL,
    degreeYear  INT NOT NULL,
    degree      TEXT NOT NULL,
    CONSTRAINT pk_email PRIMARY KEY (email)
);

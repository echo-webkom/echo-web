ALTER TABLE "user"
    ADD COLUMN name TEXT NOT NULL default "placeholder :)",
    ALTER COLUMN degree DROP NOT NULL,
    ALTER COLUMN degree_year DROP NOT NULL;

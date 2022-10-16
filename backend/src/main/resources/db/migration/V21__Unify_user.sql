ALTER TABLE "user"
    ADD COLUMN name TEXT NOT NULL default 'placeholder :)';

ALTER TABLE "user"
    ALTER COLUMN degree DROP NOT NULL;

ALTER TABLE "user"
    ALTER COLUMN degree_year DROP NOT NULL;

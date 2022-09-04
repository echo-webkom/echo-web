ALTER TABLE "feedback"
    ADD COLUMN is_read BOOLEAN DEFAULT FALSE;

ALTER TABLE "feedback"
    RENAME COLUMN sent TO sent_at;

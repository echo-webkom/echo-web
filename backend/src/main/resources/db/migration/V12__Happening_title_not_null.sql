UPDATE happening
SET title = slug
WHERE title IS NULL;

ALTER TABLE happening
ALTER COLUMN title
SET NOT NULL;

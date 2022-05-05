ALTER TABLE happening
ADD COLUMN happening_date TIMESTAMP WITHOUT TIME ZONE;

UPDATE happening
SET happening_date = registration_date + interval '3 weeks'
WHERE happening_date IS NULL;

ALTER TABLE happening
ALTER COLUMN happening_date
SET NOT NULL;

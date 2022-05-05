UPDATE happening
SET organizer_email = 'webkom@echo.uib.no'
WHERE organizer_email IS NULL;

ALTER TABLE happening
ALTER COLUMN organizer_email
SET NOT NULL;

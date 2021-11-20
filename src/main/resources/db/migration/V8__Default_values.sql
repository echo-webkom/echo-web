ALTER TABLE happening
ALTER COLUMN organizer_email
SET DEFAULT 'webkom@echo.uib.no';

ALTER TABLE happening
ALTER COLUMN organizer_email
SET NOT NULL;

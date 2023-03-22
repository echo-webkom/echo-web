ALTER TABLE "registration"
ADD COLUMN IF NOT EXISTS registration_status varchar(32);
ADD COLUMN IF NOT EXISTS reason TEXT;
ADD COLUMN IF NOT EXISTS deregistration_date TIMESTAMP;

UPDATE "registration"
SET registration_status = 'REGISTERED'
WHERE wait_list = FALSE;

UPDATE "registration"
SET registration_status = 'WAITLIST'
WHERE wait_list = TRUE;

ALTER TABLE "registration"
    ALTER COLUMN registration_status
        SET NOT NULL;

ALTER TABLE "registration"
DROP COLUMN wait_list;
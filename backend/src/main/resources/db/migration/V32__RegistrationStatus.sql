ALTER TABLE "registration"
ADD COLUMN IF NOT EXISTS registration_status varchar(32);

ALTER TABLE "registration"
ADD COLUMN IF NOT EXISTS reason TEXT;

ALTER TABLE "registration"
ADD COLUMN IF NOT EXISTS deregistration_date TIMESTAMP;

ALTER TABLE "registration"
ADD COLUMN IF NOT EXISTS wait_list boolean;

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
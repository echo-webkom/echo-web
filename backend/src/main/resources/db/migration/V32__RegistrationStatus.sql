ALTER TABLE "registration"
ADD COLUMN registration_status varchar(32);

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
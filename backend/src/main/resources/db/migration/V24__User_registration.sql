DELETE FROM answer
WHERE happening_slug = 'julebord-2021'
  AND registration_email = 'Veje1997@gmail.com';

DELETE FROM registration
    WHERE (happening_slug = 'julebord-2021' OR happening_slug = 'kraesjkurs-inf234-med-gnist')
    AND email = 'Veje1997@gmail.com';

ALTER TABLE answer
DROP CONSTRAINT fk_answer_happening_slug_registration_email__happening_slug_ema;

ALTER TABLE answer
ADD CONSTRAINT fk_answer_happening_slug_registration_email__happening_slug_ema
FOREIGN KEY (happening_slug, registration_email) REFERENCES registration (happening_slug, email)
    ON UPDATE CASCADE
    ON DELETE RESTRICT;

UPDATE registration
SET email = lower(email);

ALTER TABLE answer
    DROP CONSTRAINT fk_answer_happening_slug_registration_email__happening_slug_ema;

ALTER TABLE answer
    ADD CONSTRAINT fk_answer_happening_slug_registration_email__happening_slug_ema
        FOREIGN KEY (happening_slug, registration_email) REFERENCES registration (happening_slug, email)
            ON UPDATE RESTRICT
            ON DELETE RESTRICT;

INSERT INTO "user" (email, name)
    SELECT DISTINCT lower(r.email), concat(r.first_name, ' ', r.last_name)
        FROM registration AS r
    LEFT JOIN "user" AS u
        ON u.email = r.email
ON CONFLICT DO NOTHING;

ALTER TABLE registration
    DROP COLUMN first_name,
    DROP COLUMN last_name,
    DROP COLUMN terms;

ALTER TABLE registration
    RENAME COLUMN email TO user_email;

ALTER TABLE registration
    ADD CONSTRAINT fk_user_user_email_email
        FOREIGN KEY (user_email) REFERENCES "user" (email)
            ON UPDATE RESTRICT
            ON DELETE RESTRICT;

ALTER TABLE happening
    DROP COLUMN reg_verify_token;

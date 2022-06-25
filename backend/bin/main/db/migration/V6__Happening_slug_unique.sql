-- Dropping FK's and PK's
ALTER TABLE answer DROP CONSTRAINT fk_answer_happening_slug_happening_type_registration_email__hap;
ALTER TABLE registration DROP CONSTRAINT fk_registration_happening_slug_happening_type__slug_happening_t;
ALTER TABLE registration DROP CONSTRAINT pk_reg_email_slug_type;
ALTER TABLE spotrange DROP CONSTRAINT fk_spotrange_happening_slug_happening_type__slug_happening_type;
ALTER TABLE happening DROP CONSTRAINT pk_hap_slug_type;

-- Drop previous FK columns
ALTER TABLE answer DROP COLUMN happening_type;
ALTER TABLE registration DROP COLUMN happening_type;
ALTER table spotrange DROP COLUMN happening_type;

-- Add back FK's and PK's
ALTER TABLE happening ADD PRIMARY KEY (slug);
ALTER TABLE happening ADD CONSTRAINT happening_slug_unique
    UNIQUE (slug);

ALTER TABLE registration ADD PRIMARY KEY (email, happening_slug);
ALTER TABLE registration ADD CONSTRAINT fk_registration_happening_slug_slug
    FOREIGN KEY (happening_slug) REFERENCES happening (slug)
        ON UPDATE RESTRICT
        ON DELETE RESTRICT;

ALTER TABLE answer ADD CONSTRAINT fk_answer_happening_slug_registration_email__happening_slug_ema
    FOREIGN KEY (happening_slug, registration_email) REFERENCES registration (happening_slug, email)
        ON UPDATE RESTRICT
        ON DELETE RESTRICT;

ALTER TABLE spotrange ADD CONSTRAINT fk_spotrange_happening_slug_slug
    FOREIGN KEY (happening_slug) REFERENCES happening (slug)
        ON UPDATE RESTRICT
        ON DELETE RESTRICT;

-- Add unique and auto-increment PK for SpotRange
ALTER TABLE spotrange ADD COLUMN id SERIAL PRIMARY KEY;
ALTER TABLE spotrange ADD CONSTRAINT spotrange_id_unique UNIQUE (id);

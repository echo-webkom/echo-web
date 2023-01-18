ALTER TABLE happening
ADD COLUMN student_group_registration_date TIMESTAMP WITHOUT TIME ZONE;

ALTER TABLE happening
ADD COLUMN only_for_student_groups BOOLEAN DEFAULT false;

UPDATE happening
SET only_for_student_groups = false;

ALTER TABLE happening
ALTER COLUMN only_for_student_groups
SET NOT NULL;

CREATE TABLE IF NOT EXISTS student_group_happening_registration
(
    student_group_name TEXT,
    happening_slug     TEXT,

    CONSTRAINT pk_student_group_happening_registration
        PRIMARY KEY (student_group_name, happening_slug),

    CONSTRAINT fk_student_group_happening_registration_student_group_name__gro
        FOREIGN KEY (student_group_name)
        REFERENCES student_group (name)
        ON DELETE RESTRICT
        ON UPDATE RESTRICT,

    CONSTRAINT fk_student_group_happening_registration_happening_slug__slug
        FOREIGN KEY (happening_slug)
        REFERENCES happening (slug)
        ON DELETE RESTRICT
        ON UPDATE RESTRICT
);

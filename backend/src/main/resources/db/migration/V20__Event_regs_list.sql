ALTER TABLE happening
    ADD COLUMN student_group_name TEXT;

ALTER TABLE happening
    ADD CONSTRAINT fk_happening_student_group_name__group_name
        FOREIGN KEY (student_group_name) REFERENCES student_group (name);

ALTER TABLE happening
    DROP COLUMN registrations_link;

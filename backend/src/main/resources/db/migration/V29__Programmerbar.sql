ALTER TABLE student_group
DROP CONSTRAINT valid_student_group;

ALTER TABLE student_group
    ADD CONSTRAINT valid_student_group
        CHECK ("name" IN ('webkom', 'bedkom', 'gnist', 'tilde', 'hovedstyret', 'hyggkom', 'esc', 'makerspace', 'programmerbar'));

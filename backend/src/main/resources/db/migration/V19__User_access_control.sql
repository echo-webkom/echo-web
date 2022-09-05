CREATE TABLE IF NOT EXISTS student_group
(
    "name" TEXT PRIMARY KEY,

    CONSTRAINT valid_student_group
        CHECK ("name" IN ('webkom', 'bedkom', 'gnist', 'tilde', 'hovedstyret'))
);

INSERT INTO student_group
VALUES ('webkom'),
       ('bedkom'),
       ('gnist'),
       ('tilde'),
       ('hovedstyret');

CREATE TABLE IF NOT EXISTS student_group_membership
(
    user_email         TEXT NOT NULL,
    student_group_name TEXT NOT NULL,

    CONSTRAINT pk_student_group_membership PRIMARY KEY (user_email, student_group_name),
    CONSTRAINT fk_studentgroupmembership_user_email__email FOREIGN KEY (user_email) REFERENCES "user" (email)
        ON DELETE RESTRICT
        ON UPDATE RESTRICT,
    CONSTRAINT fk_studentgroupmembership_student_group_name__name FOREIGN KEY (student_group_name) REFERENCES student_group ("name")
        ON DELETE RESTRICT
        ON UPDATE RESTRICT
);

INSERT INTO student_group_membership
VALUES ('andreas.bakseter@echo.uib.no', 'webkom'),
       ('ole.m.johnsen@student.uib.no', 'webkom'),
       ('thea.kolnes@student.uib.no', 'webkom'),
       ('felix.kaasa@student.uib.no', 'webkom'),
       ('bo.aanes@student.uib.no', 'webkom'),
       ('alvar.honsi@student.uib.no', 'webkom'),
       ('nikolaus.engh@student.uib.no', 'webkom');

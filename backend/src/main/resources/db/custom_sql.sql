

DELETE FROM "user";
DELETE FROM "student_group_membership";
DELETE FROM "registration";
INSERT INTO "user" VALUES
                       ('nikolaus.engh@student.uib.no','nikolaus engh',null, 3, 'DVIT'),
                       ('a@student.uib.no','a',null,2,'DTEK'),
                       ('b@student.uib.no','b',null,2,'DTEK'),
                       ('c@student.uib.no','c',null,2,'DTEK');

INSERT INTO "student_group_membership" VALUES
    ('nikolaus.engh@student.uib.no', 'webkom');

INSERT INTO "registration" ("user_email", "happening_slug", "degree", "degree_year", "registration_status") VALUES
                                                                                                      ('a@student.uib.no','felixs-amazing-party','DTEK',2,0),
                                                                                                      ('b@student.uib.no','felixs-amazing-party','DTEK',2,0),
                                                                                                      ('c@student.uib.no','felixs-amazing-party','DTEK',2,0);

SELECT * FROM "user";
SELECT * FROM "student_group_membership";
SELECT * FROM "registration";


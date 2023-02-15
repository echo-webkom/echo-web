

DELETE FROM "user";
DELETE FROM "student_group_membership";
DELETE FROM "registration";
INSERT INTO "user" VALUES
    ('felix.kaasa@student.uib.no','felix kaasa','mrKaasa@protonmail.com', 2, 'DTEK'),
    ('a@student.uib.no','a',null,2,'DTEK'),
    ('b@student.uib.no','b',null,2,'DTEK'),
    ('c@student.uib.no','c',null,2,'DTEK');

INSERT INTO "student_group_membership" VALUES
    ('felix.kaasa@student.uib.no', 'webkom');

INSERT INTO "registration" ("user_email", "happening_slug", "degree", "degree_year", "wait_list") VALUES
    ('a@student.uib.no','felixs-amazing-party','DTEK',2,false),
    ('b@student.uib.no','felixs-amazing-party','DTEK',2,false),
    ('c@student.uib.no','felixs-amazing-party','DTEK',2,false);

SELECT * FROM "user";
SELECT * FROM "student_group_membership";
SELECT * FROM "registration";


CREATE TABLE IF NOT EXISTS happening
(
    slug              TEXT,
    happening_type    TEXT,
    registration_date TIMESTAMP NOT NULL,
    CONSTRAINT pk_hap_slug_type PRIMARY KEY (slug, happening_type)
);

CREATE TABLE IF NOT EXISTS registration
(
    email          TEXT,
    first_name     TEXT                                  NOT NULL,
    last_name      TEXT                                  NOT NULL,
    "degree"       TEXT                                  NOT NULL,
    degree_year    INT                                   NOT NULL,
    happening_slug TEXT,
    happening_type TEXT,
    terms          BOOLEAN                               NOT NULL,
    submit_date    TIMESTAMP DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
    wait_list      BOOLEAN                               NOT NULL,
    CONSTRAINT pk_reg_email_slug_type PRIMARY KEY (email, happening_slug, happening_type)
);

CREATE TABLE IF NOT EXISTS answer
(
    id                 SERIAL PRIMARY KEY,
    question           TEXT NOT NULL,
    answer             TEXT NOT NULL,
    registration_email TEXT,
    happening_slug     TEXT,
    happening_type     TEXT
);

CREATE TABLE IF NOT EXISTS spotrange
(
    spots           INT  NOT NULL,
    min_degree_year INT  NOT NULL,
    max_degree_year INT  NOT NULL,
    happening_slug  TEXT NOT NULL,
    happening_type  TEXT NOT NULL
);

ALTER TABLE answer ADD CONSTRAINT answer_id_unique UNIQUE (id);

ALTER TABLE answer
    ADD CONSTRAINT fk_answer_happening_slug_happening_type_registration_email__hap
        FOREIGN KEY ("happening_slug", "happening_type", "registration_email")
            REFERENCES registration("happening_slug" ,"happening_type", "email")
            ON DELETE RESTRICT
            ON UPDATE RESTRICT;

ALTER TABLE spotrange
    ADD CONSTRAINT fk_spotrange_happening_slug_happening_type__slug_happening_type
        FOREIGN KEY ("happening_slug", "happening_type") REFERENCES happening("slug","happening_type")
            ON DELETE RESTRICT
            ON UPDATE RESTRICT;

ALTER TABLE registration
    ADD CONSTRAINT fk_registration_happening_slug_happening_type__slug_happening_t
        FOREIGN KEY ("happening_slug","happening_type")
            REFERENCES happening("slug","happening_type")
            ON DELETE RESTRICT
            ON UPDATE RESTRICT;

INSERT INTO happening (slug, happening_type, registration_date)
SELECT bedpres.slug, 'BEDPRES', bedpres.registration_date
FROM bedpres;

INSERT INTO happening (slug, happening_type, registration_date)
SELECT event.slug, 'EVENT', event.registration_date
FROM event;

INSERT INTO registration (email, first_name, last_name, degree, degree_year, happening_slug, happening_type, terms, submit_date, wait_list)
SELECT bedpresregistration.email,
       bedpresregistration.first_name,
       bedpresregistration.last_name,
       bedpresregistration.degree,
       bedpresregistration.degree_year,
       bedpresregistration.bedpres_slug,
       'BEDPRES',
       bedpresregistration.terms,
       bedpresregistration.submit_date,
       bedpresregistration.wait_list
FROM bedpresregistration;

INSERT INTO registration (email, first_name, last_name, degree, degree_year, happening_slug, happening_type, terms, submit_date, wait_list)
SELECT eventregistration.email,
       eventregistration.first_name,
       eventregistration.last_name,
       eventregistration.degree,
       eventregistration.degree_year,
       eventregistration.event_slug,
       'EVENT',
       eventregistration.terms,
       eventregistration.submit_date,
       eventregistration.wait_list
FROM eventregistration;

INSERT INTO spotrange (spots, min_degree_year, max_degree_year, happening_slug, happening_type)
SELECT bedpres.spots, bedpres.min_degree_year, bedpres.max_degree_year, bedpres.slug, 'BEDPRES'
FROM bedpres;

INSERT INTO spotrange (spots, min_degree_year, max_degree_year, happening_slug, happening_type)
SELECT event.spots, event.min_degree_year, event.max_degree_year, event.slug, 'EVENT'
FROM event;

INSERT INTO answer (registration_email, question, answer, happening_slug, happening_type)
SELECT bedpresanswer.registration_email, bedpresanswer.question, bedpresanswer."answer", bedpresanswer.bedpres_slug, 'BEDPRES'
FROM bedpresanswer;

INSERT INTO answer (registration_email, question, answer, happening_slug, happening_type)
SELECT eventanswer.registration_email, eventanswer.question, eventanswer.answer, eventanswer.event_slug, 'EVENT'
FROM eventanswer;

DROP TABLE bedpresanswer;
DROP TABLE eventanswer;
DROP TABLE bedpresregistration;
DROP TABLE eventregistration;
DROP TABLE bedpres;
DROP TABLE event;

CREATE TABLE IF NOT EXISTS deregistration
(
    id                 SERIAL NOT NULL,
    submit_time        TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    user_email         TEXT NOT NULL,
    happening_slug     TEXT NOT NULL,
    reason           TEXT NOT NULL,

    CONSTRAINT pk_ PRIMARY KEY (id),
    CONSTRAINT fk_deregistration_user_email__email FOREIGN KEY (user_email) REFERENCES "user" (email)
    ON DELETE RESTRICT
    ON UPDATE RESTRICT,
    CONSTRAINT fk_deregistration_happening_slug__slug FOREIGN KEY (happening_slug) REFERENCES happening (slug)
    ON DELETE RESTRICT
    ON UPDATE RESTRICT
    );


CREATE TABLE IF NOT EXISTS reaction
(
    id                 SERIAL NOT NULL,
    user_email         TEXT NOT NULL,
    happening_slug     TEXT NOT NULL,
    reaction           TEXT NOT NULL,

    CONSTRAINT pk_reaction PRIMARY KEY (id),
    CONSTRAINT fk_reaction_user_email__email FOREIGN KEY (user_email) REFERENCES "user" (email)
    ON DELETE RESTRICT
    ON UPDATE RESTRICT,
    CONSTRAINT fk_reaction_happening_slug__slug FOREIGN KEY (happening_slug) REFERENCES happening (slug)
    ON DELETE RESTRICT
    ON UPDATE RESTRICT
    );


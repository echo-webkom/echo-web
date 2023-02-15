CREATE TABLE IF NOT EXISTS waiting_list_uuid (
    uuid TEXT PRIMARY KEY,
    user_email TEXT NOT NULL,
    happening_slug TEXT NOT NULL,
    "last_notified" TIMESTAMP DEFAULT '1970-01-01 00:00:00.000000' NOT NULL,
    CONSTRAINT fk_waiting_list_uuid_user_email__email FOREIGN KEY (user_email) REFERENCES "user"(email) ON DELETE RESTRICT ON UPDATE RESTRICT,
    CONSTRAINT fk_waiting_list_uuid_happening_slug__slug FOREIGN KEY (happening_slug) REFERENCES happening(slug) ON DELETE RESTRICT ON UPDATE RESTRICT
);

ALTER TABLE waiting_list_uuid ADD CONSTRAINT waiting_list_uuid_uuid_unique UNIQUE (uuid);
ALTER TABLE waiting_list_uuid ADD CONSTRAINT waiting_list_uuid_user_email_happening_slug_unique UNIQUE (user_email, happening_slug);

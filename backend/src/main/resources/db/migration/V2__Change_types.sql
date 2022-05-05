ALTER TABLE registration
    ALTER email TYPE text,
    ALTER first_name TYPE text,
    ALTER last_name TYPE text,
    ALTER degree TYPE text,
    ALTER bedpres_slug TYPE text;

ALTER TABLE answer
    ALTER question TYPE text,
    ALTER answer TYPE text,
    ALTER bedpres_slug TYPE text,
    ALTER registration_email TYPE text;

ALTER TABLE bedpres
    ALTER slug TYPE text;

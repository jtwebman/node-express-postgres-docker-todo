/* Updated At Trigger Function */

CREATE OR REPLACE FUNCTION trigger_updated_at_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

/* Users Table */

CREATE OR REPLACE FUNCTION track_user_versions() RETURNS trigger AS
$$
  BEGIN
    INSERT INTO user_versions (user_id, first_name, last_name, archived)
    VALUES (NEW.id, NEW.first_name, NEW.last_name, NEW.archived);
    RETURN NEW;
  END;
$$
LANGUAGE plpgsql;

CREATE TABLE IF NOT EXISTS users (
  id BIGSERIAL NOT NULL PRIMARY KEY, 
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  archived BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS user_versions (
  id BIGSERIAL NOT NULL PRIMARY KEY, 
  user_id BIGINT NOT NULL REFERENCES users (id),
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  archived BOOLEAN NOT NULL DEFAULT false,
  version_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TRIGGER user_verioning
AFTER INSERT OR UPDATE ON users
FOR EACH ROW EXECUTE PROCEDURE track_user_versions();

CREATE TRIGGER set_timestamp
BEFORE UPDATE ON todos
FOR EACH ROW EXECUTE PROCEDURE trigger_updated_at_timestamp();

/* Emails Table */
CREATE OR REPLACE FUNCTION track_email_versions() RETURNS trigger AS
$$
  BEGIN
    INSERT INTO email_versions (email_id, user_id, email, archived)
    VALUES (NEW.id, NEW.user_id, NEW.email, NEW.archived);
    RETURN NEW;
  END;
$$
LANGUAGE plpgsql;

CREATE TABLE IF NOT EXISTS emails (
  id BIGSERIAL NOT NULL PRIMARY KEY,
  user_id BIGINT NOT NULL REFERENCES users (id),
  email TEXT NOT NULL,
  verified BOOLEAN NOT NULL DEFAULT false,
  archived BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS email_versions (
  id BIGSERIAL NOT NULL PRIMARY KEY,
  email_id BIGINT NOT NULL REFERENCES emails (id),
  user_id BIGINT NOT NULL REFERENCES users (id),
  email TEXT NOT NULL,
  verified BOOLEAN NOT NULL DEFAULT false,
  archived BOOLEAN NOT NULL DEFAULT false,
  version_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TRIGGER email_verioning
AFTER INSERT OR UPDATE ON emails
FOR EACH ROW EXECUTE PROCEDURE track_email_versions();
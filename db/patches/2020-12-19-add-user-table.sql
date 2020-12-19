CREATE OR REPLACE FUNCTION track_user_versions() RETURNS trigger AS
$$
  BEGIN
    INSERT INTO user_versions (user_id, first_name, last_name, archived)
    VALUES (NEW.user_id, NEW.first_name, NEW.last_name, NEW.archived);
    RETURN NEW;
  END;
$$
LANGUAGE plpgsql;

CREATE TABLE IF NOT EXISTS users (
  user_id BIGSERIAL NOT NULL PRIMARY KEY, 
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  archived BOOLEAN NOT NULL DEFAULT false
);

CREATE TABLE IF NOT EXISTS user_versions (
  id BIGSERIAL NOT NULL PRIMARY KEY, 
  user_id BIGINT NOT NULL REFERENCES users (user_id),
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  archived BOOLEAN NOT NULL DEFAULT false,
  version_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TRIGGER user_verioning
AFTER INSERT OR UPDATE ON users
FOR EACH ROW EXECUTE PROCEDURE track_user_versions();
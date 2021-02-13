/* Updated At Trigger Function */

CREATE OR REPLACE FUNCTION trigger_updated_at_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

/* Users Table */

CREATE TABLE users (
  id SERIAL NOT NULL PRIMARY KEY, 
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  email_verified BOOLEAN NOT NULL DEFAULT false,
  username TEXT NOT NULL,
  password TEXT NOT NULL,
  archived_at TIMESTAMP WITH TIME ZONE NULL,
  banned_at TIMESTAMP WITH TIME ZONE NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TRIGGER set_timestamp
BEFORE UPDATE ON users
FOR EACH ROW EXECUTE PROCEDURE trigger_updated_at_timestamp();
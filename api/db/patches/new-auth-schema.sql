/* Updated At Trigger Function */

CREATE OR REPLACE FUNCTION trigger_updated_at_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

/* Data Objects Table */
CREATE TABLE IF NOT EXISTS data_objects(
  id SERIAL NOT NULL PRIMARY KEY, 
  name TEXT NOT NULL
);

/* Data Objects Data */

INSERT INTO data_objects (id, name)
VALUES (1, 'Work Order'),
       (2, 'Work Request'),
       (3, 'Location'),
       (4, 'Asset'),
       (5, 'Part'),
       (6, 'Meter'),
       (7, 'Purchase Order'),
       (8, 'People'),
       (9, 'Team'),
       (10, 'Vendor'),
       (11, 'Customer'),
       (12, 'Category'),
       (13, 'File'),
       (14, 'Request Portal'),
       (15, 'Setting'),
       (16, 'Checklist'),
       (17, 'Automated Workflow')
ON CONFLICT DO NOTHING;

/* Actions Table */

CREATE TABLE IF NOT EXISTS actions(
  id SERIAL NOT NULL PRIMARY KEY, 
  name TEXT NOT NULL
);

/* Actions Data */

INSERT INTO actions (id, name)
VALUES (1, 'View'),
       (2, 'Create'),
       (3, 'Edit'),
       (4, 'Delete'),
       (5, 'Assign'),
       (6, 'Share'),
       (7, 'Approve'),
       (8, 'Decline'),
       (9, 'Work')
ON CONFLICT DO NOTHING;

/* Data Object Actions Table */

CREATE TABLE IF NOT EXISTS data_object_actions(
  id SERIAL NOT NULL PRIMARY KEY,
  data_object_id INT NOT NULL REFERENCES data_objects (id),
  action_id INT NOT NULL REFERENCES actions (id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_data_object_action ON data_object_actions (data_object_id, action_id);

/* Data Object Actions Data (We need to add them all this is just for example) */

INSERT INTO data_object_actions (data_object_id, action_id)
VALUES (1, 1), -- Work Order - View
       (1, 2), -- Work Order - Create
       (1, 3), -- Work Order - Edit
       (1, 4), -- Work Order - Delete
       (1, 5), -- Work Order - Assign
       (1, 6), -- Work Order - Share
       (1, 7), -- Work Order - Approve
       (1, 8), -- Work Order - Decline
       (1, 9) -- Work Order - Work
ON CONFLICT DO NOTHING;

/* Companies Table */

CREATE TABLE IF NOT EXISTS companies (
  id SERIAL NOT NULL PRIMARY KEY, 
  name TEXT NOT NULL,
  external_id TEXT,
  address1 TEXT,
  address2 TEXT,
  city TEXT,
  region TEXT,
  postal_code TEXT,
  phone TEXT,
  website TEXT,
  logo_url TEXT,
  timezone_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

DROP TRIGGER IF EXISTS set_timestamp on companies;
CREATE TRIGGER set_timestamp BEFORE UPDATE ON companies FOR EACH ROW EXECUTE PROCEDURE trigger_updated_at_timestamp();

/* Users Table */

CREATE TABLE IF NOT EXISTS  users (
  id SERIAL NOT NULL PRIMARY KEY, 
  external_id TEXT,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  email_verified BOOLEAN NOT NULL DEFAULT false,
  username TEXT NOT NULL,
  password TEXT NOT NULL,
  archived_at TIMESTAMP WITH TIME ZONE NULL,
  banned_at TIMESTAMP WITH TIME ZONE NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

DROP TRIGGER IF EXISTS set_timestamp on users;
CREATE TRIGGER set_timestamp BEFORE UPDATE ON users FOR EACH ROW EXECUTE PROCEDURE trigger_updated_at_timestamp();

/* Sites Table */

CREATE TABLE IF NOT EXISTS sites (
  id SERIAL NOT NULL PRIMARY KEY,
  company_id INT NOT NULL REFERENCES companies (id),
  name TEXT NOT NULL,
  address1 TEXT,
  address2 TEXT,
  city TEXT,
  region TEXT,
  postal_code TEXT,
  phone TEXT,
  timezone_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

DROP TRIGGER IF EXISTS set_timestamp on sites;
CREATE TRIGGER set_timestamp BEFORE UPDATE ON sites FOR EACH ROW EXECUTE PROCEDURE trigger_updated_at_timestamp();

/* Groups Table */

CREATE TABLE IF NOT EXISTS groups (
  id SERIAL NOT NULL PRIMARY KEY, 
  company_id INT NOT NULL REFERENCES companies (id),
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

DROP TRIGGER IF EXISTS set_timestamp on groups;
CREATE TRIGGER set_timestamp BEFORE UPDATE ON groups FOR EACH ROW EXECUTE PROCEDURE trigger_updated_at_timestamp();

/* User Group Site Table */

CREATE TABLE IF NOT EXISTS user_group_sites (
  id SERIAL NOT NULL PRIMARY KEY, 
  user_id INT NOT NULL REFERENCES users (id),
  group_id INT NOT NULL REFERENCES groups (id),
  site_id INT NOT NULL REFERENCES sites (id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_user_group_site ON user_group_sites (user_id, group_id, site_id);

/* Permission Levels Table */

CREATE TABLE IF NOT EXISTS permission_levels(
  id SERIAL NOT NULL PRIMARY KEY, 
  name TEXT NOT NULL
);

/* Permission Levels  Data */

INSERT INTO permission_levels (id, name)
VALUES (1, 'All'),
       (2, 'Assigned/Owned'),
       (3, 'Assigned'),
       (4, 'Owned'),
       (5, 'None')
ON CONFLICT DO NOTHING;

/* Permissions Table */

CREATE TABLE IF NOT EXISTS permissions (
  id SERIAL NOT NULL PRIMARY KEY, 
  group_id INT NOT NULL REFERENCES groups (id),
  data_object_action_id INT NOT NULL REFERENCES data_object_actions (id),
  permission_level_id INT NOT NULL REFERENCES permission_levels (id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_permissions_group_data_object_action ON permissions (group_id, data_object_action_id);

/* Filter Types Table */

CREATE TABLE IF NOT EXISTS filter_types(
  id SERIAL NOT NULL PRIMARY KEY, 
  name TEXT NOT NULL
);

/* Filter Types Data */

INSERT INTO filter_types (id, name)
VALUES (1, 'View'),
       (2, 'Create'),
       (3, 'Edit')
ON CONFLICT DO NOTHING;

/* Data Object Fields Table */

CREATE TABLE IF NOT EXISTS data_object_fields (
  id SERIAL NOT NULL PRIMARY KEY, 
  data_object_id INT NOT NULL REFERENCES data_objects (id),
  field_name TEXT NOT NULL,
  field_path TEXT NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_data_object_field ON data_object_fields (data_object_id, field_path);

/* Data Object Filters Table */

CREATE TABLE IF NOT EXISTS data_object_filters (
  id SERIAL NOT NULL PRIMARY KEY, 
  group_id INT NOT NULL REFERENCES groups (id),
  data_object_field_id INT NOT NULL REFERENCES data_object_fields (id),
  filter_type_id INT NOT NULL REFERENCES filter_types (id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_data_object_filters ON data_object_filters (group_id, data_object_field_id);

CREATE TABLE lists (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT, admin INTEGER, created TIMESTAMP NOT NULL DEFAULT current_timestamp);

CREATE TABLE users (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT, created TIMESTAMP NOT NULL DEFAULT current_timestamp, deactivated TIMESTAMP, email TEXT, password TEXT, description TEXT, comments TEXT);

CREATE TABLE shopitems (id INTEGER PRIMARY KEY AUTOINCREMENT, list INTEGER, created TIMESTAMP NOT NULL DEFAULT current_timestamp, created_by INTEGER, completed TIMESTAMP, completed_by INTEGER, shop_where TEXT, notes TEXT);

CREATE TABLE listusers (list_id INTEGER, user_id INTEGER, assigned TIMESTAMP NOT NULL DEFAULT current_timestamp, assigned_by INTEGER, role INTEGER, comments TEXT);




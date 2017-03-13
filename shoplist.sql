
CREATE TABLE lists (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT, admin INTEGER, created TIMESTAMP NOT NULL DEFAULT current_timestamp);

CREATE TABLE users (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT, created TIMESTAMP NOT NULL DEFAULT current_timestamp, deactivated TIMESTAMP, email TEXT, password TEXT, description TEXT, comments TEXT);

CREATE TABLE shopitems (id INTEGER PRIMARY KEY AUTOINCREMENT, list INTEGER, created TIMESTAMP NOT NULL DEFAULT current_timestamp, created_by INTEGER, completed TIMESTAMP, completed_by INTEGER, shop_where TEXT, notes TEXT);

CREATE TABLE listusers (list_id INTEGER, user_id INTEGER, assigned TIMESTAMP NOT NULL DEFAULT current_timestamp, assigned_by INTEGER, role INTEGER, comments TEXT);


SELECT 
  u.id AS id, 
  u.name AS name, 
  json_group_array(json_object("listid",l.id,"listname",l.name)) AS lists 
  FROM users u, lists l, listusers lu 
  WHERE u.id=1 AND u.id=lu.user_id AND l.id=lu.list_id 
  GROUP BY u.id;
  

SELECT u.name AS user,
       json_group_array(l.name) AS lists
  FROM users u, lists l, listusers lu 
  WHERE u.id=1 AND u.id=lu.user_id AND l.id=lu.list_id 
  GROUP BY u.id;  

SELECT l.name AS list, json_group_array (i.name) AS items 
  FROM lists l, shopitems i
  WHERE l.id=i.list_id
  GROUP BY l.id;
  
SELECT u.name AS user,
       json_group_array(l.name) AS lists       
  FROM users u, lists l, listusers lu, 
    ( SELECT sl.id AS id, sl.name AS name, json_group_array(si.name) AS items 
        FROM lists sl, shopitems si
        WHERE sl.id=si.list_id
        GROUP BY sl.id
    ) li
  WHERE u.id=1 AND u.id=lu.user_id AND l.id=lu.list_id AND l.id=li.id
  GROUP BY u.id;  


  




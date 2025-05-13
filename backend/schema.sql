-- pets database
 -- columns: id, name, type, size, energy_level, maintenance_level, budget
DROP TABLE IF EXISTS pets;
CREATE TABLE pets (
    id      INTEGER PRIMARY KEY AUTOINCREMENT,
    name    TEXT NOT NULL,
    type    TEXT NOT NULL, 
    size    TEXT NOT NULL,
    activity_level    TEXT NOT NULL,
    maintenance_level    TEXT NOT NULL,
    budget    TEXT NOT NULL
);

 -- user database
 -- columns: username, password, email
DROP TABLE IF EXISTS users;
CREATE TABLE users (
    id      INTEGER PRIMARY KEY AUTOINCREMENT,
    username    TEXT NOT NULL,
    password    TEXT NOT NULL
);
 
 -- questonnaire_answers database
 -- columns: username, living_space, activity_level, time_commitment, budget, pet_type
DROP TABLE IF EXISTS questionnaire_answers;
CREATE TABLE questionnaire_answers (
    id      INTEGER PRIMARY KEY AUTOINCREMENT,
    username    TEXT NOT NULL,
    living_space    TEXT NOT NULL,
    activity_level    TEXT NOT NULL,
    maintenance_level    TEXT NOT NULL,
    budget    TEXT NOT NULL,
    pet_type    TEXT NOT NULL,
    status    TEXT NOT NULL DEFAULT 'PENDING'
);

DROP TABLE IF EXISTS admins;
CREATE TABLE admins (
    id      INTEGER PRIMARY KEY AUTOINCREMENT,
    username    TEXT NOT NULL,
    password    TEXT NOT NULL
);

DROP TABLE IF EXISTS approved_pets;
CREATE TABLE approved_pets (
    id      INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    pet_id INTEGER NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (pet_id) REFERENCES pets(id)
);

-- TABLE: adoptions (store user adoption requests)
DROP TABLE IF EXISTS adoptions;
CREATE TABLE adoptions (
    request_id INTEGER PRIMARY KEY AUTOINCREMENT,
    pet_id INTEGER NOT NULL,
    username TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'PENDING',
    pet_name TEXT NOT NULL,
    FOREIGN KEY (pet_id) REFERENCES pets(id)
);

INSERT INTO admins (username, password) VALUES ('admin', 'admin123');
INSERT INTO users (username, password) VALUES ('testuser', 'password123');

-- Up

CREATE TABLE IF NOT EXISTS classes (id INTEGER PRIMARY KEY, attack INTEGER NOT NULL, defense INTEGER NOT NULL, speed INTEGER NOT NULL, health INTEGER NOT NULL, fightPoint INTEGER NOT NULL, fr TEXT NOT NULL, en TEXT NOT NULL, updatedAt DATETIME, createdAt DATETIME);

-- Down


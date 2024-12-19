-- Drop existing table if needed
DROP TABLE IF EXISTS todos;

-- Create new table with all columns
CREATE TABLE todos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    summary TEXT NOT NULL,
    imageId TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
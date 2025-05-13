import sqlite3
import os

DATABASE = 'backend/pets.db'   # Now using pets.db for both reads and writes.

def get_db_connection():
    """Get a database connection."""
    conn = sqlite3.connect(DATABASE)
    conn.row_factory = sqlite3.Row
    print("DEBUG: Connection open with database file:", DATABASE)
    return conn

def init_db(db_path=None):
    """Initialize the database with schema.
    
    Args:
        db_path (str, optional): Path to the database file. If None, uses default path.
    
    Returns:
        sqlite3.Connection: The database connection
    """
    backend_dir = os.path.dirname(os.path.abspath(__file__))
    if db_path is None:
        # Use the same filename as DATABASE
        db_path = os.path.join(backend_dir, DATABASE)
    if os.path.exists(db_path):
        os.remove(db_path)
    with open(os.path.join(backend_dir, 'schema.sql'), 'r', encoding='utf-8') as f:
        schema = f.read()
    db_conn = sqlite3.connect(db_path)
    db_conn.executescript(schema)
    return db_conn

if __name__ == '__main__':
    connection = init_db()
    connection.close()

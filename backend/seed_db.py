# pylint: disable=C0114,C0116
import os
import sqlite3

def seed_db():
    """Seed the database with initial data.
    ---
    tags:
      - database
    description: Populates the database with sample data for testing and development
    responses:
        200:
            description: Database seeded successfully
        500:
            description: Error seeding database
    """
    backend_dir = os.path.dirname(os.path.abspath(__file__))
    db_path = os.path.join(backend_dir, 'pets.db')
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    # Insert sample users
    cursor.execute("""
        INSERT INTO users (username, password)
        VALUES ('testuser', 'password123')
    """)
    # Insert sample admins
    cursor.execute("""
        INSERT INTO admins (username, password)
        VALUES ('admin', 'admin123')
    """)
    # Insert sample pets
    cursor.execute("""
    INSERT INTO pets (name, type, size, activity_level, maintenance_level, budget)
    VALUES ('Max', 'dog', 'medium', 'high', 'medium', 'high')
    """)
    cursor.execute("""
    INSERT INTO pets (name, type, size, activity_level, maintenance_level, budget)
    VALUES ('Bella', 'cat', 'small', 'low', 'low', 'medium')
""")
    cursor.execute("""
    INSERT INTO pets (name, type, size, activity_level, maintenance_level, budget)
    VALUES ('Charlie', 'dog', 'large', 'medium', 'high', 'high')
""")
    cursor.execute("""
    INSERT INTO pets (name, type, size, activity_level, maintenance_level, budget)
    VALUES ('Lucy', 'dog', 'small', 'medium', 'medium', 'low')
""")
    cursor.execute("""
    INSERT INTO pets (name, type, size, activity_level, maintenance_level, budget)
    VALUES ('Milo', 'cat', 'medium', 'low', 'low', 'medium')
""")
    conn.commit()
    conn.close()
    print("Database seeded successfully!")

if __name__ == '__main__':
    seed_db()
 
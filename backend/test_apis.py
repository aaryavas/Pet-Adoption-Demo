# pylint: disable=C0114,C0115,C0116,C0301,C0303,C0304
import unittest
import os
import sqlite3
from main import app
from init_db import init_db
from seed_db import seed_db

class TestAPI(unittest.TestCase):
    """Test suite for API endpoints.
    ---
    tags:
      - tests
    """
    @classmethod
    def setUpClass(cls):
        """Initialize test environment.
        ---
        tags:
          - tests
        description: Set up test database, seed initial data and ensure required tables exist
        """
        init_db()
        seed_db()
        backend_dir = os.path.dirname(os.path.abspath(__file__))
        db_path = os.path.join(backend_dir, 'pets.db')
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        # Ensure admins table exists and seed admin credentials
        cursor.execute("""CREATE TABLE IF NOT EXISTS admins (
                            id INTEGER PRIMARY KEY AUTOINCREMENT,
                            username TEXT UNIQUE NOT NULL,
                            password TEXT NOT NULL
                          )""")
        cursor.execute("SELECT * FROM admins WHERE username = 'admin'")
        if cursor.fetchone() is None:
            cursor.execute("INSERT INTO admins (username, password) VALUES ('admin', 'admin123')")
            conn.commit()
        # Ensure questionnaire_answers table exists
        cursor.execute("""CREATE TABLE IF NOT EXISTS questionnaire_answers (
                            id INTEGER PRIMARY KEY AUTOINCREMENT,
                            username TEXT,
                            living_space TEXT,
                            activity_level TEXT,
                            maintenance_level TEXT,
                            budget TEXT,
                            pet_type TEXT,
                            status TEXT
                          )""")
        conn.commit()
        conn.close()

    def setUp(self):
        """Set up test client.
        ---
        tags:
          - tests
        description: Create a test client for each test
        """
        self.app = app.test_client()
        self.app.testing = True
        backend_dir = os.path.dirname(os.path.abspath(__file__))
        self.db_path = os.path.join(backend_dir, 'pets.db')
        # Reinitialize and seed the database
        conn = init_db(self.db_path)
        conn.close()
        seed_db()

    def tearDown(self):
        """Clean up test database."""
        if os.path.exists(self.db_path):
            os.remove(self.db_path)

    def test_register(self):
        """Test user registration endpoint.
        ---
        tags:
          - tests
        description: Test successful user registration
        responses:
            201:
                description: User registered successfully
        """
        response = self.app.post('/api/register', json={
            'username': 'newuser123',
            'password': 'password123',
        })
        self.assertEqual(response.status_code, 201)

    def test_login(self):
        """Test user login endpoint.
        ---
        tags:
          - tests
        description: Test successful user login
        responses:
            200:
                description: Login successful
        """
        # Register the user first since the test relies on a registered account
        self.app.post('/api/register', json={
            'username': 'testuser',
            'password': 'password123'
        })
        response = self.app.post('/api/login', json={
            'username': 'testuser',
            'password': 'password123'
        })
        self.assertEqual(response.status_code, 200)

    def test_get_pets(self):
        """Test get all pets endpoint.
        ---
        tags:
          - tests
        description: Test retrieving all pets
        responses:
            200:
                description: List of pets retrieved successfully
        """
        response = self.app.get('/api/pets')
        self.assertEqual(response.status_code, 200)

    def test_questionnaire(self):
        """Test complete questionnaire flow.
        ---
        tags:
          - tests
        description: Test the complete questionnaire submission and approval flow
        responses:
            200:
                description: Questionnaire flow completed successfully
        """
        # First register
        self.app.post('/api/register', json={
            'username': 'testuser',
            'password': 'testpass',
        })
        # Then submit questionnaire with updated key "maintenance_level"
        response = self.app.post('/api/questionnaire', json={
            'username': 'testuser',
            'answers': {
                'living_space': 'apartment',
                'activity_level': 'high',
                'maintenance_level': 'medium',  # updated key to match API expectation
                'budget': 'high',
                'pet_type': 'dog'
            }
        })
        self.assertEqual(response.status_code, 200)

    def test_admin_login(self):
        """Test admin login endpoint.
        ---
        tags:
          - tests
        description: Test successful admin login
        responses:
            200:
                description: Admin login successful
        """
        response = self.app.post('/api/admin/login', json={
            'username': 'admin',
            'password': 'admin123'
        })
        self.assertEqual(response.status_code, 200)

if __name__ == '__main__':
    unittest.main()

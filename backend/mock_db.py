# pylint: disable=C0114,C0115,R0903,C0303,C0304
class MockDB:
    """Mock database for testing purposes.
    ---
    tags:
      - mock
    description: A mock database implementation that simulates the real database for testing
    """
    def __init__(self):
        """Initialize mock database with sample data.
        ---
        tags:
          - mock
        description: Creates a mock database with sample users, pets, and questionnaire data
        """
        # Mock users table
        self.users = {}
        # Mock pets table with some sample data
        self.pets = {
            1: {
                "id": 1,
                "name": "Buddy",
                "type": "dog",
                "size": "medium",
                "energy_level": "high",
                "maintenance_level": "medium",
                "budget": 1500
            },
            2: {
                "id": 2,
                "name": "Whiskers",
                "type": "cat",
                "size": "small",
                "energy_level": "low",
                "maintenance_level": "low",
                "budget": 1000
            },
            3: {
                "id": 3,
                "name": "Goldie",
                "type": "fish",
                "size": "small",
                "energy_level": "low",
                "maintenance_level": "medium",
                "budget": 500
            }
        }
        # Mock questionnaire answers table
        self.questionnaire_answers = {}

    def get_user(self, username):
        """Get user by username."""
        return self.users.get(username)

    def get_pet(self, pet_id):
        """Get pet by ID."""
        return self.pets.get(pet_id)

    def get_all_pets(self):
        """Get all pets."""
        return list(self.pets.values())

# Create a single instance to be used across the application
mock_db = MockDB()

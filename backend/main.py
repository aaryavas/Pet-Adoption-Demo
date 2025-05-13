import sqlite3  # Add this line
from flask import Flask, request, jsonify
from flasgger import Swagger
from flask_cors import CORS
from login import login_user
from register import register_user
from pets import get_pets, get_pet
from questionaire import get_pet_recommendations, get_user_recommendations
from admin import (
    admin_login,
    get_pending_questionnaires,
    approve_questionnaire,
    reject_questionnaire,
    get_all_adoption_requests_from_db,
    create_adoption_request_in_db
)
from init_db import get_db_connection

app = Flask(__name__)
swagger = Swagger(app)
CORS(app)

@app.route('/api/login', methods=['POST'])
def login():
    """Login endpoint.
    ---
    tags:
      - auth
    parameters:
      - name: body
        in: body
        required: true
        schema:
          type: object
          required:
            - username
            - password
          properties:
            username:
              type: string
              description: Username
            password:
              type: string
              description: Password
    responses:
        200:
            description: Login successful
        401:
            description: Invalid credentials
        404:
            description: User not found
        500:
            description: Internal Server Error
    """
    data = request.get_json()
    return login_user(data['username'], data['password'])

@app.route('/api/register', methods=['POST'])
def register():
    """Register endpoint.
    ---
    tags:
      - auth
    parameters:
      - name: body
        in: body
        required: true
        schema:
          type: object
          required:
            - username
            - password
          properties:
            username:
              type: string
              description: Username
            password:
              type: string
              description: Password
    responses:
        201:
            description: User registered successfully
        409:
            description: Username already exists
        500:
            description: Internal Server Error
    """
    data = request.get_json()
    return register_user(data['username'], data['password'])

@app.route('/api/admin/login', methods=['POST'])
def admin_login_route():
    """Admin login endpoint.
    ---
    tags:
      - admin
    parameters:
      - name: body
        in: body
        required: true
        schema:
          type: object
          required:
            - username
            - password
          properties:
            username:
              type: string
              description: Admin username
            password:
              type: string
              description: Admin password
    responses:
        200:
            description: Admin login successful
        401:
            description: Invalid admin credentials
        500:
            description: Server error
    """
    data = request.get_json()
    user = data['username']
    password = data['password']
    return admin_login(user, password)

@app.route('/api/admin/questionnaires', methods=['GET'])
def get_pending_questionnaires_route():
    """Get all pending questionnaires.
    ---
    tags:
      - admin
    responses:
        200:
            description: List of pending questionnaires
        500:
            description: Internal Server Error
    """
    return get_pending_questionnaires()

@app.route(
    '/api/admin/questionnaires/<int:questionnaire_id>/approve',
    methods=['POST']
)
def approve_questionnaire_route(questionnaire_id):
    data = request.get_json()
    pet_ids = data.get('pet_ids', [])
    if not pet_ids:
        return jsonify({'error': 'Pet IDs are required for approval'}), 400
    return approve_questionnaire(questionnaire_id, pet_ids)

@app.route(
    '/api/admin/questionnaires/<int:questionnaire_id>/reject',
    methods=['POST']
)
def reject_questionnaire_route(questionnaire_id):
    return reject_questionnaire(questionnaire_id)

@app.route('/api/pets', methods=['GET'])
def pets():
    return get_pets()

@app.route('/api/pets/<int:pet_id>', methods=['GET'])
def pet_detail(pet_id):
    return get_pet(pet_id)

@app.route('/api/questionnaire', methods=['POST'])
def questionnaire():
    print("\n=== QUESTIONNAIRE ENDPOINT ===")
    print(f"Request method: {request.method}")
    print(f"Request headers: {dict(request.headers)}")
    # Get and validate request data
    data = request.get_json()
    print(f"Request data: {data}")
    if not data:
        print("ERROR: No JSON data received")
        return jsonify({'error': 'No data provided'}), 400
    if 'username' not in data:
        print("ERROR: Missing username in request data")
        return jsonify({'error': 'Username is required'}), 400
    if 'answers' not in data:
        print("ERROR: Missing answers in request data")
        return jsonify({'error': 'Questionnaire answers are required'}), 40
    # Process the questionnaire
    print(f"Processing questionnaire for user: {data['username']}")
    return get_pet_recommendations(data['username'], data['answers'])

@app.route('/api/questionnaire/<username>', methods=['GET'])
def get_user_questionnaire(username):
    return get_user_recommendations(username)

@app.route('/api/test', methods=['GET'])
def test_endpoint():
    """Test endpoint to check if the API is running.
    ---
    tags:
      - test
    responses:
        200:
            description: API is running
    """
    return jsonify({
        'message': 'API is running',
        'status': 'OK'
    })

@app.route('/api/admin/adoptions', methods=['POST'])
def create_adoption_request():
    data = request.get_json()
    print("DEBUG: Received adoption request data:", data)
    if not data:
        return jsonify({'error': 'No data provided'}), 400
    new_request, error_message = create_adoption_request_in_db(data)
    if new_request is None:
        return jsonify({'error': error_message or 'Failed to create adoption request'}), 500
    print("DEBUG: Created adoption request:", new_request)
    return jsonify(new_request), 201

@app.route('/api/adoptions/<username>', methods=['GET'])
def get_adoptions_for_user(username):
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("SELECT * FROM adoptions WHERE username = ?", (username,))
        rows = cursor.fetchall()
        adoption_requests = [dict(row) for row in rows]
        print("DEBUG: Returning adoption requests for user", username, adoption_requests)
        return jsonify(adoption_requests), 200
    except sqlite3.Error as e:
        print("DEBUG: SQLite error in get_adoptions_for_user:", e)
        return jsonify({'error': str(e)}), 500
    finally:
        conn.close()

@app.route('/api/admin/adoptions', methods=['GET'])
def get_all_adoption_requests():
    print("DEBUG: Received GET request for /api/admin/adoptions")
    adoption_requests = get_all_adoption_requests_from_db()
    if adoption_requests is None:
        print("DEBUG: get_all_adoption_requests_from_db returned None")
        return jsonify({'error': 'Internal Server Error'}), 500
    print("DEBUG: Returning adoption requests to client:", adoption_requests)
    return jsonify(adoption_requests), 200


@app.route('/api/admin/adoptions/<int:request_id>/<action>', methods=['OPTIONS', 'POST'])
def update_adoption_request(request_id, action):
    print("DEBUG: update_adoption_request called with request_id:", request_id, "action:", action)
    action = action.upper()
    if action not in ['APPROVE', 'REJECT']:
        print("DEBUG: Invalid action provided:", action)
        return jsonify({'error': 'Invalid action'}), 400
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("UPDATE adoptions SET status = ? WHERE request_id = ?", (action, request_id))
        conn.commit()
        print("DEBUG: Adoption request", request_id, "updated to", action)
        # Optionally, retrieve updated row:
        cursor.execute("SELECT * FROM adoptions WHERE request_id = ?", (request_id,))
        updated = cursor.fetchone()
        return jsonify(dict(updated)), 200
    except sqlite3.Error as e:
        print("DEBUG: SQLite error in update_adoption_request:", e)
        return jsonify({'error': str(e)}), 500
    finally:
        conn.close()

if __name__ == '__main__':
    print("DEBUG: Starting Flask server ...")
    app.run(host='0.0.0.0', port=5000, debug=True)

import sqlite3
from flask import jsonify, request
from init_db import get_db_connection

def admin_login(_user, password):
    """Authenticate an admin user.
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
            schema:
                type: object
                properties:
                    message:
                        type: string
                    admin:
                        type: object
                        properties:
                            username:
                                type: string
        401:
            description: Invalid admin credentials
        500:
            description: Server error
    """
    data = request.get_json()
    print("DEBUG: admin_login received payload:", data)
    if not data or 'username' not in data or 'password' not in data:
        return jsonify({'error': 'Missing username or password'}), 400

    username = data['username']
    password = data['password']
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute(
            'SELECT * FROM admins WHERE username = ? AND password = ?',
            (username, password)
        )
        admin = cursor.fetchone()
        conn.close()

        if admin:
            print("DEBUG: admin_login successful for user:", admin['username'])
            return jsonify({
                'message': 'Admin login successful',
                'admin': {'username': admin['username']}
            })
        print("DEBUG: admin_login invalid credentials for:", username)
        return jsonify({'error': 'Invalid admin credentials'}), 401
    except (sqlite3.Error, ValueError) as e:
        print("DEBUG: admin_login exception:", e)
        return jsonify({'error': str(e)}), 500

def get_pending_questionnaires():
    """Get all pending questionnaires.
    ---
    tags:
      - admin
    responses:
        200:
            description: List of pending questionnaires
            schema:
                type: array
                items:
                    type: object
                    properties:
                        id:
                            type: integer
                        username:
                            type: string
                        living_space:
                            type: string
                        activity_level:
                            type: string
                        time_commitment:
                            type: string
                        budget:
                            type: string
                        pet_type:
                            type: string
                        status:
                            type: string
        500:
            description: Internal Server Error
    """
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("""
            SELECT q.*, u.username 
            FROM questionnaire_answers q
            JOIN users u ON q.username = u.username
            WHERE q.status = 'PENDING'
        """)
        questionnaires = cursor.fetchall()
        print("DEBUG: Retrieved pending questionnaires:", [dict(row) for row in questionnaires])
        return jsonify([dict(row) for row in questionnaires]), 200
    except sqlite3.Error as e:
        print("DEBUG: get_pending_questionnaires exception:", e)
        return jsonify({'error': 'Internal Server Error'}), 500
    finally:
        conn.close()

def approve_questionnaire(questionnaire_id, pet_ids):
    print(f"DEBUG: Approve questionnaire called for ID: {questionnaire_id} with pet_ids: {pet_ids}")
    # If needed, additionally print the incoming request JSON payload:
    data = request.get_json()
    print("DEBUG: Received request JSON payload:", data)

    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("""
            SELECT username FROM questionnaire_answers 
            WHERE id = ? AND status = 'PENDING'
        """, (questionnaire_id,))
        questionnaire = cursor.fetchone()
        if questionnaire is None:
            print("DEBUG: Questionnaire not found or already processed for ID:", questionnaire_id)
            return jsonify({'error': 'Questionnaire not found or already processed'}), 404

        cursor.execute("""
            UPDATE questionnaire_answers 
            SET status = 'APPROVED' 
            WHERE id = ?
        """, (questionnaire_id,))
        cursor.execute("SELECT id FROM users WHERE username = ?", (questionnaire['username'],))
        user = cursor.fetchone()
        if user is None:
            print("DEBUG: User not found for username:", questionnaire['username'])
            return jsonify({'error': 'User not found'}), 404

        for pet_id in pet_ids:
            cursor.execute("""
                INSERT INTO approved_pets (user_id, pet_id)
                VALUES (?, ?)
            """, (user['id'], pet_id))
        conn.commit()
        print("DEBUG: Questionnaire approved. Approved pet IDs:", pet_ids)
        return jsonify({
            'message': 'Questionnaire approved successfully',
            'approved_pets': pet_ids
        }), 200
    except sqlite3.Error as e:
        print("DEBUG: approve_questionnaire exception:", e)
        return jsonify({'error': 'Internal Server Error'}), 500
    finally:
        conn.close()

def reject_questionnaire(questionnaire_id):
    """Reject a questionnaire.
    ---
    tags:
      - admin
    parameters:
      - name: questionnaire_id
        in: path
        type: integer
        required: true
        description: ID of the questionnaire to reject
    responses:
        200:
            description: Questionnaire rejected successfully
            schema:
                type: object
                properties:
                    message:
                        type: string
        404:
            description: Questionnaire not found
        500:
            description: Internal Server Error
    """
    print(f"DEBUG: Reject questionnaire called with id: {questionnaire_id}")
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("""
            UPDATE questionnaire_answers 
            SET status = 'REJECTED' 
            WHERE id = ?
        """, (questionnaire_id,))
        if cursor.rowcount == 0:
            print("DEBUG: Questionnaire not found for id:", questionnaire_id)
            return jsonify({'error': 'Questionnaire not found'}), 404
        conn.commit()
        print("DEBUG: Questionnaire rejected for id:", questionnaire_id)
        return jsonify({'message': 'Questionnaire rejected successfully'}), 200
    except sqlite3.Error as e:
        print("DEBUG: reject_questionnaire exception:", e)
        return jsonify({'error': 'Internal Server Error'}), 500
    finally:
        conn.close()

def get_all_adoption_requests_from_db():
    print("DEBUG: Starting get_all_adoption_requests_from_db() query")
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("SELECT * FROM adoptions")
        rows = cursor.fetchall()
        adoption_requests = [dict(row) for row in rows]
        print("DEBUG: Retrieved adoption requests:", adoption_requests)
        return adoption_requests
    except sqlite3.Error as e:
        print("DEBUG: Exception in get_all_adoption_requests_from_db:", e)
        return None
    finally:
        conn.close()
        print("DEBUG: Database connection closed in get_all_adoption_requests_from_db")

def create_adoption_request_in_db(data):
    pet_id = data.get('pet_id')
    username = data.get('username')
    if pet_id is None or not username:
        print("DEBUG: Missing pet_id or username in data", data)
        return None, "pet_id and username are required"
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        # Find the pet_name from the pets table
        cursor.execute("SELECT name FROM pets WHERE id = ?", (pet_id,))
        pet_row = cursor.fetchone()
        if pet_row is None:
            print("DEBUG: Pet not found for pet_id", pet_id)
            return None, "Pet not found"
        pet_name = pet_row["name"]
        print("DEBUG: Found pet_name:", pet_name)

        query = """
            INSERT INTO adoptions (pet_id, username, status, pet_name)
            VALUES (?, ?, 'PENDING', ?)
        """
        cursor.execute(query, (pet_id, username, pet_name))
        conn.commit()
        new_id = cursor.lastrowid
        print("DEBUG: New adoption request id:", new_id)
        # Retrieve the newly inserted adoption request
        cursor.execute("SELECT * FROM adoptions WHERE request_id = ?", (new_id,))
        request_row = cursor.fetchone()
        conn.commit()
        print("DEBUG: Retrieved new adoption request row:", request_row)
        return dict(request_row), None
    except sqlite3.Error as e:
        print("DEBUG: SQLite error in create_adoption_request_in_db:", e)
        return None, str(e)
    finally:
        conn.close()

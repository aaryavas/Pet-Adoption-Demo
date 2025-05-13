import sqlite3
import json
from flask import jsonify
from init_db import get_db_connection

def save_qanswers(username, answers):
    """Save questionnaire answers for a user.
    ---
    tags:
      - questionnaire
    parameters:
      - name: username
        in: body
        type: string
        required: true
        description: Username of the user submitting the questionnaire
      - name: answers
        in: body
        type: object
        required: true
        description: Questionnaire answers
        properties:
            living_space:
                type: string
                description: User's living space type
            activity_level:
                type: string
                description: User's activity level
            maintenance_level:
                type: string
                description: User's available time commitment
            budget:
                type: string
                description: User's budget range
            pet_type:
                type: string
                description: Preferred pet type
    responses:
        200:
            description: Answers saved successfully
        500:
            description: Internal Server Error
    """
    # Check if all required fields are present
    required_fields = ['living_space', 'activity_level', 'maintenance_level', 'budget', 'pet_type']
    missing_fields = [field for field in required_fields if field not in answers]
    if missing_fields:
        return False

    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        # Check if user exists
        cursor.execute("SELECT id FROM users WHERE username = ?", (username,))
        user = cursor.fetchone()
        if not user:
            cursor.execute(
                "INSERT INTO users (username, password) VALUES (?, ?)",
                (username, 'temp_password')
            )
            conn.commit()
            cursor.execute("SELECT id FROM users WHERE username = ?", (username,))
            user = cursor.fetchone()
            if not user:
                return False
        cursor.execute("""
            INSERT INTO questionnaire_answers 
            (username, living_space, activity_level, maintenance_level, budget, pet_type, status)
            VALUES (?, ?, ?, ?, ?, ?, 'PENDING')
        """, (
            username,
            answers['living_space'],
            answers['activity_level'],
            answers['maintenance_level'],
            answers['budget'],
            answers['pet_type']
        ))
        conn.commit()
        return True
    except sqlite3.Error:
        return False
    finally:
        conn.close()

def get_pet_recommendations(username, answers):
    """Get pet recommendations based on questionnaire answers.
    ---
    tags:
      - questionnaire
    parameters:
      - name: username
        in: body
        type: string
        required: true
        description: Username of the user
      - name: answers
        in: body
        type: object
        required: true
        description: Questionnaire answers
        properties:
            living_space:
                type: string
                description: User's living space type
            activity_level:
                type: string
                description: User's activity level
            maintenance_level:
                type: string
                description: User's available time commitment
            budget:
                type: string
                description: User's budget range
            pet_type:
                type: string
                description: Preferred pet type
    responses:
        200:
            description: Questionnaire submitted successfully
            schema:
                type: object
                properties:
                    message:
                        type: string
                    status:
                        type: string
                        enum: [PENDING]
        500:
            description: Internal Server Error
    """
    if not username:
        return jsonify({'error': 'Username is required'}), 400
    if not answers:
        return jsonify({'error': 'Questionnaire answers are required'}), 400
    if not save_qanswers(username, answers):
        return jsonify({'error': 'Failed to save questionnaire answers'}), 500

    response = {
        'message': json.dumps(answers, indent=2) if answers else 'None',
        'status': 'PENDING'
    }
    return jsonify(response), 200

def get_user_recommendations(username):
    """Get previously saved recommendations for a user.
    ---
    tags:
      - questionnaire
    parameters:
      - name: username
        in: path
        type: string
        required: true
        description: Username to get recommendations for
    responses:
        200:
            description: User's recommendations
            schema:
                oneOf:
                  - type: object
                    properties:
                        message:
                            type: string
                        status:
                            type: string
                            enum: [PENDING]
                  - type: object
                    properties:
                        message:
                            type: string
                        status:
                            type: string
                            enum: [REJECTED]
                  - type: object
                    properties:
                        recommendations:
                            type: array
                            items:
                                $ref: '#/definitions/Pet'
                        count:
                            type: integer
                        status:
                            type: string
                            enum: [APPROVED]
        404:
            description: No questionnaire answers found
        500:
            description: Internal Server Error
    """
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("""
            SELECT q.*, u.id as user_id
            FROM questionnaire_answers q
            JOIN users u ON q.username = u.username
            WHERE q.username = ? 
            ORDER BY q.id DESC 
            LIMIT 1
        """, (username,))
        questionnaire = cursor.fetchone()
        if not questionnaire:
            return jsonify({'error': 'No questionnaire answers found for user'}), 404
        answers = {
            'living_space': questionnaire['living_space'],
            'activity_level': questionnaire['activity_level'],
            'maintenance_level': questionnaire['maintenance_level'],
            'budget': questionnaire['budget'],
            'pet_type': questionnaire['pet_type']
        }
        if questionnaire['status'] == 'PENDING':
            return jsonify({
                'message': 'Questionnaire is pending admin approval',
                'status': 'PENDING',
                'answers': answers
            }), 200
        if questionnaire['status'] == 'REJECTED':
            return jsonify({
                'message': 'Questionnaire was rejected by admin',
                'status': 'REJECTED'
            }), 200
        cursor.execute("""
            SELECT p.* 
            FROM pets p
            JOIN approved_pets ap ON p.id = ap.pet_id
            WHERE ap.user_id = ?
        """, (questionnaire['user_id'],))
        approved_pets = [dict(row) for row in cursor.fetchall()]
        return jsonify({
            'recommendations': approved_pets,
            'count': len(approved_pets),
            'status': 'APPROVED'
        }), 200
    except sqlite3.Error as e:
        return jsonify({'error': str(e)}), 500
    finally:
        conn.close()

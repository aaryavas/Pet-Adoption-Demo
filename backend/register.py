#if no user login found lets register
import sqlite3
from flask import jsonify
from init_db import get_db_connection

def register_user(username, password):
    """Register a new user.
    ---
    tags:
      - auth
    parameters:
      - name: username
        in: body
        type: string
        required: true
        description: Desired username
      - name: password
        in: body
        type: string
        required: true
        description: Desired password
      - name: email
        in: body
        type: string
        required: true
        description: Desired email
    responses:
        201:
            description: User registered successfully
            schema:
                type: object
                properties:
                    message:
                        type: string
                    user:
                        type: object
                        properties:
                            username:
                                type: string
        409:
            description: Username already exists
        500:
            description: Internal Server Error
    """
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("SELECT * FROM users WHERE username = ?", (username,))
        if cursor.fetchone():
            return jsonify({'error': 'Username already exists'}), 409
        cursor.execute(
            "INSERT INTO users (username, password) VALUES (?, ?)",
            (username, password)
        )
        conn.commit()
        return jsonify({
            'message': 'User registered successfully',
            'user': {'username': username}
        }), 201
    except sqlite3.Error:
        return jsonify({'error': 'Internal Server Error'}), 500
    finally:
        conn.close()

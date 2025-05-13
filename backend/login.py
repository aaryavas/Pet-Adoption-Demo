import sqlite3
from flask import jsonify
from init_db import get_db_connection

def login_user(username, password):
    """Authenticate a user by username and password."""
    # 1) basic validation
    if not username or not password:
        return jsonify({'error': 'Username and password are required'}), 400

    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        # 2) look up user row (row_factory gives dict‐style access)
        cursor.execute("SELECT * FROM users WHERE username = ?", (username,))
        user = cursor.fetchone()
        if user is None:
            return jsonify({'error': 'User not found'}), 404

        # 3) verify password
        if user['password'] != password:
            return jsonify({'error': 'Invalid password'}), 401

        # 4) success
        return jsonify({
            'message': 'Login successful',
            'user': {'username': username}
        }), 200

    except sqlite3.Error:
        return jsonify({'error': 'Internal Server Error'}), 500

    finally:
        conn.close()

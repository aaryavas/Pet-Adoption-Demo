import sqlite3
from flask import jsonify
from init_db import get_db_connection

def get_pets():
    """Get all pets.
    ---
    tags:
      - pets
    responses:
        200:
            description: List of pets
        500:
            description: Internal Server Error
    """
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("SELECT * FROM pets")
        pets = cursor.fetchall()
        return jsonify([dict(pet) for pet in pets]), 200
    except sqlite3.Error:
        return jsonify({'error': 'Internal Server Error'}), 500
    finally:
        conn.close()

def get_pet(pet_id):
    """Get a specific pet by ID.
    ---
    tags:
      - pets
    parameters:
      - name: pet_id
        in: path
        type: integer
        required: true
        description: ID of the pet to retrieve
    responses:
        200:
            description: Pet details
        404:
            description: Pet not found
        500:
            description: Internal Server Error
    """
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("SELECT * FROM pets WHERE id = ?", (pet_id,))
        pet = cursor.fetchone()
        if not pet:
            return jsonify({'error': 'Pet not found'}), 404
        return jsonify(dict(pet)), 200
    except sqlite3.Error:
        return jsonify({'error': 'Internal Server Error'}), 500
    finally:
        conn.close()

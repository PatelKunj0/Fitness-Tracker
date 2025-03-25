from flask import Flask, request, jsonify
import mysql.connector
import bcrypt

# Not working
app = Flask(__name__)
db_config = {
    'host': 'sql3.freesqldatabase.com',
    'user': 'sql3769195',
    'password': 'kv2d2CyilQ',
    'database': 'sql3769195',
    'port': 3306
}

"""
db = mysql.connector.connect(
    host = "sql3.freesqldatabase.com",
    port = 3306,
    user= "root",
    password= "root",
    database= "SELECTION_DB"
)
"""

@app.route('/signup', methods=['POST'])
def signup():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')
    print("Received signup request for:", username)

    if not username or not password:
        print("Missing username or password")
        return jsonify({'error': 'Missing username or password'}), 400

    try:
        salt = bcrypt.gensalt()
        password_hash = bcrypt.hashpw(password.encode('utf-8'), salt)
        print("Password hashed successfully")

    except Exception as e:
        print("Error hashing password:", e)
        return jsonify({'error': 'Internal error hashing password'}), 500

    try:
        conn = mysql.connector.connect(**db_config)
        print("Connected to database successfully")

    except mysql.connector.Error as err:
        print("Database connection error:", err)
        return jsonify({'error': 'Database connection error: ' + str(err)}), 500

    try:
        cursor = conn.cursor()
        insert_query = """
            INSERT INTO users (username, password_hash)
            VALUES (%s, %s)
        """
        cursor.execute(insert_query, (username, password_hash))
        conn.commit()
        print("User created successfully in database")
        return jsonify({'message': 'User created successfully'}), 201

    except mysql.connector.Error as err:
        print("Database error on insert:", err)
        return jsonify({'error': 'Database insert error: ' + str(err)}), 400

    except Exception as e:
        print("Unexpected error:", e)
        return jsonify({'error': 'Unexpected server error'}), 500

    finally:
        if 'cursor' in locals():
            cursor.close()
        if 'conn' in locals():
            conn.close()


if __name__ == '__main__':
    app.run(debug=True, port=5000)

from flask import Flask, request, jsonify
import csv
import os

app = Flask(__name__)
CSV_FILE = 'users.csv'

@app.route('/signup', methods=['POST'])
def signup():
    data = request.get_json()
    username = data.get("username")
    password = data.get("password")
    
    if not username or not password:
        return jsonify({"error": "Missing username or password"}), 400
    
    if user_exists(username):
        return jsonify({"error": "User already exists"}), 400
    
    fieldnames = ["username", "password"]
    file_exists = os.path.exists(CSV_FILE)
    
    with open(CSV_FILE, 'a', newline='') as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        if not file_exists:
            writer.writeheader()
        writer.writerow({"username": username, "password": password})
    
    return jsonify({"message": "User created successfully"}), 201

if __name__ == '__main__':
    app.run(debug=True)

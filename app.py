from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import csv, os
from werkzeug.security import generate_password_hash, check_password_hash

app = Flask(__name__, static_folder="HTML", static_url_path="")
CORS(app)

CSV_FILE = "users.csv"

def user_exists(username):
    if not os.path.exists(CSV_FILE):
        return False
    with open(CSV_FILE, newline="") as f:
        reader = csv.DictReader(f)
        return any(row["username"] == username for row in reader)

def write_user(username, hashed_pw):
    file_exists = os.path.exists(CSV_FILE)
    with open(CSV_FILE, "a", newline="") as f:
        writer = csv.DictWriter(f, fieldnames=["username","password"])
        if not file_exists:
            writer.writeheader()
        writer.writerow({"username": username, "password": hashed_pw})


@app.route("/signup", methods=["POST"])
def signup():
    data = request.get_json(force=True)
    username = data.get("username","").strip()
    password = data.get("password","").strip()
    if not username or not password:
        return jsonify({"error":"Missing username or password"}), 400
    if user_exists(username):
        return jsonify({"error":"User already exists"}), 400

    hashed = generate_password_hash(password)
    write_user(username, hashed)
    return jsonify({"message":"User created successfully"}), 201

@app.route("/login", methods=["POST"])
def login():
    data = request.get_json(force=True)
    username = data.get("username","").strip()
    password = data.get("password","").strip()
    if not username or not password:
        return jsonify({"error":"Missing username or password"}), 400

    if not os.path.exists(CSV_FILE):
        return jsonify({"error":"No users found"}), 404

    with open(CSV_FILE, newline="") as f:
        reader = csv.DictReader(f)
        for row in reader:
            if row["username"] == username and check_password_hash(row["password"], password):
                return jsonify({"message":"Login OK"}), 200

    return jsonify({"error":"Invalid credentials"}), 401

@app.route("/CSS/<path:fn>")
def css(fn):
    return send_from_directory("CSS", fn)

@app.route("/JS/<path:fn>")
def js(fn):
    return send_from_directory("JS", fn)

# serve your HTML/CSS/JS as static files:
@app.route("/", defaults={"path":""})
@app.route("/<path:path>")
def static_proxy(path):
    if path and os.path.exists(os.path.join(app.static_folder, path)):
        return send_from_directory(app.static_folder, path)
    # default: serve index.html
    return send_from_directory(app.static_folder, "welcome.html")

if __name__ == "__main__":
    app.run(debug=True)

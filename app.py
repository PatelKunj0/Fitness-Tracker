from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import csv, os
import json

app = Flask(__name__, static_folder="HTML", static_url_path="")
CORS(app)

CSV_FILE = "users.csv"
TEMPLATES_FILE = "templates.csv"

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

    write_user(username, password)
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
            if row["username"] == username and row["password"] == password:
                return jsonify({"message":"Login OK"}), 200

    return jsonify({"error":"Invalid credentials"}), 401


@app.route("/CSS/<path:fn>")
def css(fn):
    return send_from_directory("CSS", fn)


@app.route("/JS/<path:fn>")
def js(fn):
    return send_from_directory("JS", fn)


@app.route("/", defaults={"path":""})
@app.route("/<path:path>")
def static_proxy(path):
    if path and os.path.exists(os.path.join(app.static_folder, path)):
        return send_from_directory(app.static_folder, path)

    return send_from_directory(app.static_folder, "welcome.html")


#-----------Saving templets-----------#
def load_templates(username):
    if not os.path.exists(TEMPLATES_FILE):
        return []

    with open(TEMPLATES_FILE, newline="") as f:
        reader = csv.DictReader(f)
        return [
            {"name": row["template_name"], "exercises": json.loads(row["exercises_json"])}
            for row in reader
            if row["username"] == username
        ]


def save_templates(username, templates):
    # Removing the old entries for this user
    rows = []

    if os.path.exists(TEMPLATES_FILE):
        with open(TEMPLATES_FILE, newline="") as f:
            rows = [r for r in csv.DictReader(f) if r["username"] != username]

    # Appending
    for tpl in templates:
        rows.append({
            "username": username,
            "template_name": tpl["name"],
            "exercises_json": json.dumps(tpl["exercises"])
        })

    with open(TEMPLATES_FILE, "w", newline="") as f:
        writer = csv.DictWriter(f, fieldnames=["username","template_name","exercises_json"])
        writer.writeheader()
        writer.writerows(rows)


@app.route("/templates", methods=["GET"])
def get_templates():
    user = request.args.get("username","").strip()
    if not user: return jsonify([]), 400
    return jsonify(load_templates(user)), 200


@app.route("/templates", methods=["POST"])
def post_templates():
    data = request.get_json(force=True)
    user = data.get("username","").strip()
    templates = data.get("templates",[])

    if not user: return jsonify({"error":"Missing username"}), 400

    save_templates(user, templates)
    return jsonify({"message":"Templates saved"}), 200


if __name__ == "__main__":
    app.run(debug=True)

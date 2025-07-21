from flask import Flask, request, jsonify
import joblib
import pandas as pd
import csv
import os
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

# ✅ Load the model using absolute path
model_path = os.path.join(os.path.dirname(__file__), "churn_model.pkl")
model = joblib.load(model_path)

# --- Route 1: ML Prediction ---
@app.route('/predict', methods=['POST'])
def predict():
    data = request.json

    # Convert to DataFrame
    df = pd.DataFrame([data])
    df = pd.get_dummies(df)

    # Align with model's expected columns
    model_columns = model.feature_names_in_
    df = df.reindex(columns=model_columns, fill_value=0)

    # Make prediction
    prediction = model.predict(df)[0]
    confidence = model.predict_proba(df).max()

    return jsonify({
        'churn': int(prediction),
        'confidence': round(float(confidence), 2)
    })

# --- Route 2: Save Login Info ---
@app.route('/api/login', methods=['POST'])
def save_login():
    data = request.get_json()
    name = data.get("name")
    email = data.get("email")

    if not name or not email:
        return jsonify({"message": "❌ Name and Email required"}), 400

    # ✅ Save to local CSV file safely
    path = os.path.join(os.path.dirname(__file__), "logins.csv")
    file_exists = os.path.isfile(path)

    with open(path, mode='a', newline='') as f:
        writer = csv.writer(f)
        if not file_exists:
            writer.writerow(["Name", "Email"])
        writer.writerow([name, email])

    return jsonify({"message": "✅ Login saved successfully"}), 200

# ✅ Run server on correct host/port for Render
if __name__ == "__main__":
    app.run(host="0.0.0.0", port=10000)

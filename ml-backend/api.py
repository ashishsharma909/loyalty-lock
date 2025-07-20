from flask import Flask, request, jsonify
import joblib
import pandas as pd
import csv
import os
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

# Load trained model
model = joblib.load('churn_model.pkl')

# --- Route 1: ML Prediction ---
@app.route('/predict', methods=['POST'])
def predict():
    data = request.json

    df = pd.DataFrame([data])
    df = pd.get_dummies(df)

    # Align with model's expected input columns
    model_columns = model.feature_names_in_
    df = df.reindex(columns=model_columns, fill_value=0)

    prediction = model.predict(df)[0]
    confidence = model.predict_proba(df).max()

    return jsonify({
        'churn': int(prediction),
        'confidence': round(float(confidence), 2)
    })

# --- Route 2: Save login info ---
@app.route('/api/login', methods=['POST'])
def save_login():
    data = request.get_json()
    name = data.get("name")
    email = data.get("email")

    if not name or not email:
        return jsonify({"message": "❌ Name and Email required"}), 400

    path = "logins.csv"
    file_exists = os.path.isfile(path)

    with open(path, mode='a', newline='') as f:
        writer = csv.writer(f)
        if not file_exists:
            writer.writerow(["Name", "Email"])
        writer.writerow([name, email])

    return jsonify({"message": "✅ Login saved successfully"}), 200

if __name__ == "__main__":
    app.run(debug=True)

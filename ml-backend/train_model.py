import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
import joblib

# Load dataset
data = pd.read_csv("data/telco.csv")

# Convert TotalCharges to numeric (handle non-numeric entries)
data['TotalCharges'] = pd.to_numeric(data['TotalCharges'], errors='coerce')
data.dropna(inplace=True)  # drop rows with NaN

# Convert target column to binary
data['Churn'] = data['Churn'].apply(lambda x: 1 if x == 'Yes' else 0)

# Feature selection
X = data[['gender', 'SeniorCitizen', 'Partner', 'Dependents', 'tenure', 'MonthlyCharges', 'TotalCharges']]
X = pd.get_dummies(X)

y = data['Churn']

# Train/test split
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# Train model
model = RandomForestClassifier()
model.fit(X_train, y_train)

# Save model
joblib.dump(model, 'churn_model.pkl')
print("✅ Model trained and saved as churn_model.pkl")


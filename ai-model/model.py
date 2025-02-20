import firebase_admin
from firebase_admin import credentials, firestore
import pandas as pd
import numpy as np
from sklearn.preprocessing import StandardScaler
import joblib

cred = credentials.Certificate("agrisense.json")
firebase_admin.initialize_app(cred)
db = firestore.client()

rf_model = joblib.load("PlantHealth.pkl")
scaler = joblib.load("scaler.pkl")

def fetch_real_time_data():
    sensor_ref = db.collection("sensor_logs").order_by("timestamp", direction=firestore.Query.DESCENDING).limit(1)
    docs = sensor_ref.stream()
    for doc in docs:
        return doc.to_dict()
    return None

def predict_real_time_health():
    data = fetch_real_time_data()
    if not data:
        print("No real-time data available.")
        return
    
    features = ["temperature", "humidity", "soil_moisture", "mq135_ppm"]
    input_data = np.array([[data[feature] for feature in features]])
    input_data = scaler.transform(input_data)
    
    predicted_score = rf_model.predict(input_data)[0]
    print(f"Real-time Predicted Health Score: {predicted_score:.2f}")

predict_real_time_health()

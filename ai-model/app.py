import firebase_admin
from firebase_admin import credentials, firestore
import numpy as np
import joblib
from flask import Flask, jsonify
from flask_cors import CORS
from sklearn.preprocessing import StandardScaler

# Initialize Flask app
app = Flask(__name__)

# Enable CORS to allow your frontend to communicate with the Flask backend
CORS(app)

# Firebase initialization
cred = credentials.Certificate("agrisense.json")
firebase_admin.initialize_app(cred)
db = firestore.client()

# Load the pre-trained model and scaler
rf_model = joblib.load("PlantHealth.pkl")
scaler = joblib.load("scaler.pkl")

# Define ideal ranges for features to calculate health score
ideal_ranges = {
    "temperature": (25, 33),       
    "humidity": (60, 70),          
    "soil_moisture": (70, 95),     
    "mq135_ppm": (0.01, 2)         
}

def fetch_real_time_data():
    """Fetch real-time data from Firebase Firestore"""
    sensor_ref = db.collection("sensor_logs").order_by("timestamp", direction=firestore.Query.DESCENDING).limit(1)
    docs = sensor_ref.stream()
    for doc in docs:
        return doc.to_dict()
    return None

def calculate_health_score(data):
    """Calculate health score based on ideal feature ranges"""
    score = 100
    
    for feature, (min_val, max_val) in ideal_ranges.items():
        value = data[feature]
        
        if value < min_val:
            deviation = min_val - value
        elif value > max_val:
            deviation = value - max_val
        else:
            deviation = 0 
        
        penalty_factor = 1
        score -= penalty_factor * deviation
    
    return max(0, min(100, score))

@app.route('/predict', methods=['GET'])
def predict_health():
    """Flask API endpoint to predict plant health"""
    # Fetch real-time data
    data = fetch_real_time_data()
    if not data:
        return jsonify({"error": "No real-time data available."}), 400

    # Calculate health score based on the ideal range
    health_score = calculate_health_score(data)

    # Prepare input data for the model prediction
    features = ["temperature", "humidity", "soil_moisture", "mq135_ppm"]
    input_data = np.array([[data[feature] for feature in features]])

    # Scale input data using the scaler
    input_data = scaler.transform(input_data)

    # Predict health score using the RandomForest model
    predicted_score = rf_model.predict(input_data)[0]

    return jsonify({
        "predicted_health_score": predicted_score,
        "calculated_health_score": health_score
    })

if __name__ == '__main__':
    app.run(debug=True)

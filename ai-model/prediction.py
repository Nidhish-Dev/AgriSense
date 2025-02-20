import firebase_admin
from firebase_admin import credentials, firestore
import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import mean_squared_error, r2_score
import joblib

cred = credentials.Certificate("agrisense.json")
firebase_admin.initialize_app(cred)
db = firestore.client()

def fetch_data():
    sensor_ref = db.collection("sensor_logs")
    docs = sensor_ref.stream()
    
    data = []
    for doc in docs:
        data.append(doc.to_dict())
    
    return pd.DataFrame(data)

df = fetch_data()

ideal_ranges = {
    "temperature": (25, 33),       
    "humidity": (60, 70),          
    "soil_moisture": (70, 95),     
    "mq135_ppm": (0.01, 2)         
}

def calculate_health_score(row):
    score = 100
    
    for feature, (min_val, max_val) in ideal_ranges.items():
        value = row[feature]
        
        if value < min_val:
            deviation = min_val - value
        elif value > max_val:
            deviation = value - max_val
        else:
            deviation = 0 
        
        penalty_factor = 1  
        score -= penalty_factor * deviation
    
    score = max(0, min(100, score))
    return score

df["health_score"] = df.apply(calculate_health_score, axis=1)

features = ["temperature", "humidity", "soil_moisture", "mq135_ppm"]
X = df[features].values
y = df["health_score"].values

X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

scaler = StandardScaler()
X_train = scaler.fit_transform(X_train)
X_test = scaler.transform(X_test)

rf_model = RandomForestRegressor(n_estimators=100, random_state=42)
rf_model.fit(X_train, y_train)

y_pred = rf_model.predict(X_test)
mse = mean_squared_error(y_test, y_pred)
r2 = r2_score(y_test, y_pred)
print(f"Mean Squared Error: {mse:.2f}")
print(f"R^2 Score: {r2:.2f}")

average_health_score = np.mean(y_pred)
print(f"Predicted Health Score: {average_health_score:.2f}")

joblib.dump(rf_model, "PlantHealth.pkl")
joblib.dump(scaler, "scaler.pkl")

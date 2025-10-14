import requests
import json

# Test the Flask API
url = "http://127.0.0.1:5000/predict"

# Sample data for Heart Disease
test_data = {
    "Age": 45,
    "Gender": "Male",
    "Cholesterol": 200,
    "Blood_Pressure_Systolic": 120,
    "BMI": 25.5,
    "Chest_Pain_Type": 1,
    "Troponin": 0.1,
    "EKG_Abnormality": 0,
    "disease": "Heart Disease"
}

try:
    response = requests.post(url, json=test_data)
    print(f"Status Code: {response.status_code}")
    print(f"Response: {response.text}")
except requests.exceptions.ConnectionError:
    print("Connection Error: Flask server is not running")
except Exception as e:
    print(f"Error: {e}")
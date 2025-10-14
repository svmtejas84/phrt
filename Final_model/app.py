from flask import Flask, request, jsonify
from flask_cors import CORS
import joblib
import pandas as pd
import numpy as np
import os

# Initialize the Flask application
app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# --- LOAD MODELS AND PREPROCESSING OBJECTS ---
# This is done once when the server starts for efficiency
MODEL_DIR = 'models'
try:
    model = joblib.load(os.path.join(MODEL_DIR, 'disease_predictor_model.joblib'))
    label_encoder = joblib.load(os.path.join(MODEL_DIR, 'label_encoder.joblib'))
    model_columns = joblib.load(os.path.join(MODEL_DIR, 'model_columns.joblib'))
    print("--- Models and objects loaded successfully ---")
except FileNotFoundError as e:
    print(f"Error loading model files: {e}")
    print("Please ensure the 'models' directory and its contents are in the correct location.")
    # Exit if models can't be loaded, as the app is useless without them.
    exit()

# --- DEFINE THE PREDICTION API ENDPOINT ---
# The route decorator tells Flask what URL should trigger our function.
# 'methods=['POST']' allows this endpoint to receive data.
@app.route('/predict', methods=['POST'])
def predict():
    """
    Receives patient data in JSON format, preprocesses it,
    predicts the disease, and returns the result as JSON.
    """
    # 1. Get the data from the incoming request's JSON body
    data = request.get_json()
    print(f"Received data: {data}")  # Debug print
    
    if not data:
        return jsonify({"error": "No input data provided"}), 400

    try:
        # Remove 'disease' field from data before processing
        data_copy = data.copy()
        if 'disease' in data_copy:
            del data_copy['disease']
            
        # 2. Convert the JSON data into a pandas DataFrame
        # The [data] makes it a single-row DataFrame
        input_df = pd.DataFrame([data_copy])
        print(f"Input DataFrame columns: {input_df.columns.tolist()}")  # Debug print

        # 3. Preprocess the input data EXACTLY as done during training
        # a) One-hot encode the 'Gender' column
        input_df = pd.get_dummies(input_df, columns=['Gender'], drop_first=True)
        
        # b) Align columns with the training data
        # This is a CRITICAL step to ensure the model receives the expected features.
        processed_df = input_df.reindex(columns=model_columns, fill_value=0)
        
        # 4. Make predictions
        prediction_encoded = model.predict(processed_df)
        prediction_proba = model.predict_proba(processed_df)
        
        # 5. Decode the prediction and get confidence
        predicted_disease = label_encoder.inverse_transform(prediction_encoded)[0]
        confidence = np.max(prediction_proba) * 100
        
        # 6. (Optional but Recommended) Add severity/next step logic
        patient_data = processed_df.iloc[0]
        severity = 'Mild'
        if patient_data.get('Oxygen_Saturation', 100) < 92 or patient_data.get('Troponin', 0) > 0.4 or patient_data.get('Blood_Pressure_Systolic', 0) > 180:
            severity = 'Severe'
        elif predicted_disease in ["Alzheimer's", 'Pneumonia', 'Kidney Disease'] or patient_data.get('HbA1c', 0) > 9:
            severity = 'Moderate'
        elif predicted_disease == 'No Disease':
            severity = 'None'
        
        step_map = {'Severe': 'Emergency Care Needed', 'Moderate': 'Consult Specialist', 'Mild': 'Routine Checkup', 'None': 'Routine Checkup'}
        next_step = step_map.get(severity, 'Routine Checkup')

        # 7. Construct the response JSON
        response = {
            'predicted_disease': predicted_disease,
            'confidence': f"{confidence:.2f}%",
            'calculated_severity': severity,
            'recommended_next_step': next_step
        }
        
        return jsonify(response)

    except Exception as e:
        # Return a detailed error message for debugging
        print(f"Prediction error: {str(e)}")  # Debug print
        import traceback
        traceback.print_exc()  # Print full traceback
        return jsonify({"error": f"An error occurred during prediction: {str(e)}"}), 500


# This block allows you to run the app directly from the command line
if __name__ == '__main__':
    # 'debug=True' will automatically restart the server when you save changes.
    # 'port=5000' is the default, but you can change it.
    app.run(debug=True, port=5000)
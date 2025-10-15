import pandas as pd
import joblib
import numpy as np

# --- 1. LOAD THE TRAINED MODEL AND SUPPORTING FILES ---
print("Loading the trained model and required files...")
try:
    model = joblib.load('disease_predictor_model.joblib')
    le = joblib.load('label_encoder.joblib')
    model_columns = joblib.load('model_columns.joblib')
    print("Model and files loaded successfully.")
except FileNotFoundError:
    print("Error: Model files not found. Please run 'train_disease_model.py' first.")
    exit()

# --- 2. DEFINE NEW PATIENT DATA FOR PREDICTION ---
# Here, we create a few sample "patient" profiles as dictionaries.
# In a real app, this data would come from a user filling out a form.
new_patients_data = [
    # Patient 1: A 72-year-old male with classic symptoms of severe Pneumonia
    {
        'Age': 72, 'Gender': 'Male', 'BMI': 28.5, 'Blood_Pressure_Systolic': 135,
        'Fever': 1, 'Cough_Severity': 9, 'Fatigue_Level': 10, 'Shortness_of_Breath': 1,
        'Oxygen_Saturation': 91, 'White_Blood_Cell_Count': 18500
    },
    # Patient 2: A 45-year-old female with strong indicators for Diabetes
    {
        'Age': 45, 'Gender': 'Female', 'BMI': 34.2, 'Blood_Sugar': 180, 'HbA1c': 7.8,
        'Polyuria': 1, 'Polydipsia': 1, 'Family_History_Diabetes': 1
    },
    # Patient 3: A 30-year-old male who is generally healthy
    {
        'Age': 30, 'Gender': 'Male', 'BMI': 22.1, 'Cholesterol': 180, 'Blood_Pressure_Systolic': 115,
        'Blood_Sugar': 85, 'Fever': 0, 'Cough_Severity': 1, 'Fatigue_Level': 2
    },
    # Patient 4: A 58-year-old female with high blood pressure and related symptoms
    {
        'Age': 58, 'Gender': 'Female', 'BMI': 29.0, 'Blood_Pressure_Systolic': 165,
        'Blood_Pressure_Diastolic': 98, 'Headache_Severity': 7, 'Dizziness': 1,
        'Sodium_Intake_Level': 9
    }
]

# --- 3. PREPARE THE NEW DATA FOR THE MODEL ---
print("\nPreparing new patient data for prediction...")
# Convert the list of dictionaries into a pandas DataFrame
new_df = pd.DataFrame(new_patients_data)

# Preprocess the new data in the EXACT SAME WAY as the training data
# a) One-hot encode the 'Gender' column
new_df = pd.get_dummies(new_df, columns=['Gender'], drop_first=True)

# b) CRITICAL STEP: Align the columns of the new data with the training data
# This ensures the new data has the exact same columns in the same order as the model expects.
# 'reindex' will add any missing columns and fill them with 0.
processed_df = new_df.reindex(columns=model_columns, fill_value=0)
print("Data preparation complete.")

# --- 4. MAKE PREDICTIONS ---
print("\n--- Making Predictions ---")
# Predict the disease class (as a number)
predictions_encoded = model.predict(processed_df)

# Predict the probability for each possible disease
predictions_proba = model.predict_proba(processed_df)

# Convert the numerical prediction back to the original disease name
predictions_labels = le.inverse_transform(predictions_encoded)

# --- 5. DISPLAY THE RESULTS ---
for i, prediction in enumerate(predictions_labels):
    # Find the confidence of the top prediction
    confidence = np.max(predictions_proba[i]) * 100
    
    # Simple rule-based logic to determine severity and next steps
    patient_data = processed_df.iloc[i]
    severity = 'Mild'
    if patient_data['Oxygen_Saturation'] < 92 or patient_data['Troponin'] > 0.4 or patient_data['Blood_Pressure_Systolic'] > 180:
        severity = 'Severe'
    elif prediction in ["Alzheimer's", 'Pneumonia', 'Kidney Disease'] or patient_data['HbA1c'] > 9:
        severity = 'Moderate'
    elif prediction == 'No Disease':
        severity = 'None'
    
    step_map = {'Severe': 'Emergency Care Needed', 'Moderate': 'Consult Specialist', 'Mild': 'Routine Checkup', 'None': 'Routine Checkup'}
    next_step = step_map.get(severity, 'Routine Checkup')

    print(f"\n--- Result for Patient {i+1} ---")
    print(f"  Predicted Disease: {prediction}")
    print(f"  Confidence: {confidence:.2f}%")
    print(f"  Calculated Severity: {severity}")
    print(f"  Recommended Next Step: {next_step}")
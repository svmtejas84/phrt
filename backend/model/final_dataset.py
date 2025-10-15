import pandas as pd
import numpy as np
import time

start_time = time.time()

# --- 1. SETUP PARAMETERS ---
num_entries = 10000
diseases = [
    'Heart Disease', 'Diabetes', 'Hypertension', "Alzheimer's", 'Influenza',
    'Pneumonia', 'Kidney Disease', 'Gastroenteritis', 'Depression', 'No Disease'
]
all_columns = [
    'Age', 'Gender', 'BMI', 'Cholesterol', 'Blood_Pressure_Systolic', 'Blood_Pressure_Diastolic', 'Blood_Sugar',
    'HbA1c', 'Creatinine', 'GFR', 'Troponin', 'Oxygen_Saturation', 'White_Blood_Cell_Count',
    'Family_History_Diabetes', 'Family_History_Alzheimers', 'History_of_Hypertension', 'History_of_Diabetes',
    'Chest_Pain_Type', 'EKG_Abnormality', 'Polyuria', 'Polydipsia', 'Headache_Severity', 'Dizziness',
    'Sodium_Intake_Level', 'Cognitive_Test_Score', 'Memory_Lapse_Severity', 'Disorientation_Level',
    'Behavioral_Changes', 'Fever', 'Cough_Severity', 'Fatigue_Level', 'Body_Aches', 'Sore_Throat',
    'Shortness_of_Breath', 'Swelling_in_Legs', 'Proteinuria_Level', 'Vomiting_Frequency',
    'Diarrhea_Severity', 'Abdominal_Pain_Level', 'Dehydration_Level', 'Anxiety_Score', 'Sadness_Score',
    'Loss_of_Interest_Score', 'Sleep_Disturbance_Score', 'Appetite_Change_Score',
    'Disease', 'Severity', 'Recommended_Next_Step'
]

# --- 2. EFFICIENT DATA GENERATION ---
print("Generating final, challenging dataset with deliberate ambiguity...")
data_list = []
for _ in range(num_entries):
    # Start with a healthy baseline
    row = {col: 0 for col in all_columns}
    # ... (healthy baseline generation is the same as before) ...
    row['Age'] = np.random.randint(18, 91); row['Gender'] = np.random.choice(['Male', 'Female'])
    row['BMI'] = np.round(np.random.uniform(18.5, 24.9), 1); row['Cholesterol'] = np.random.randint(150, 200)
    row['Blood_Pressure_Systolic'] = np.random.randint(90, 120); row['Blood_Pressure_Diastolic'] = np.random.randint(60, 80)
    row['Blood_Sugar'] = np.random.randint(70, 100); row['HbA1c'] = np.round(np.random.uniform(4.0, 5.6), 1)
    row['Creatinine'] = np.round(np.random.uniform(0.6, 1.2), 2); row['GFR'] = np.random.randint(90, 120)
    row['Troponin'] = np.round(np.random.uniform(0.0, 0.01), 3); row['Oxygen_Saturation'] = np.random.randint(97, 101)
    row['White_Blood_Cell_Count'] = np.random.randint(4500, 10000); row['Cognitive_Test_Score'] = np.random.randint(28, 31)
    for col in row:
        if 'Score' in col or 'Level' in col or 'Severity' in col: row[col] = np.random.randint(0, 3)

    assigned_disease = np.random.choice(diseases, p=[0.09]*9 + [0.19])

    # --- Apply the disease profile (using the previous 'noisy' logic) ---
    if assigned_disease == 'Heart Disease':
        row['Age'] = np.random.randint(50, 90); row['Blood_Pressure_Systolic'] += np.random.randint(20, 70); row['BMI'] += np.random.uniform(5, 15)
        row['Chest_Pain_Type'] = np.random.choice([1, 2, 3]);
        if np.random.rand() < 0.80: row['Cholesterol'] += np.random.randint(80, 200)
    elif assigned_disease == 'Diabetes':
        row['BMI'] += np.random.uniform(5, 20); row['Blood_Sugar'] += np.random.randint(50, 200)
        row['HbA1c'] += np.random.uniform(1.5, 5.0)
        if np.random.rand() < 0.75: row['Polyuria'] = 1; row['Polydipsia'] = 1
        row['Fatigue_Level'] += np.random.randint(4, 7)
    elif assigned_disease == 'Hypertension':
        row['Blood_Pressure_Systolic'] += np.random.randint(30, 80); row['Blood_Pressure_Diastolic'] += np.random.randint(15, 40)
        row['Headache_Severity'] = np.random.randint(3, 9)
    # ... (all other disease generation logic remains the same as the last version) ...
    elif assigned_disease == "Alzheimer's":
        row['Age'] = np.random.randint(65, 95); row['Family_History_Alzheimers'] = 1; row['Cognitive_Test_Score'] = np.random.randint(10, 26) - np.random.randint(0, 5)
    elif assigned_disease == 'Influenza':
        if np.random.rand() < 0.85: row['Fever'] = 1; row['Cough_Severity'] = np.random.randint(5, 10); row['Fatigue_Level'] = np.random.randint(7, 11)
        row['Body_Aches'] = 1; row['Sore_Throat'] = 1; row['White_Blood_Cell_Count'] += np.random.randint(1000, 8000)
    elif assigned_disease == 'Pneumonia':
        row['Age'] = np.random.randint(50, 95); row['Fever'] = 1; row['Cough_Severity'] = np.random.randint(7, 11); row['Fatigue_Level'] = np.random.randint(8, 11)
        row['Oxygen_Saturation'] = np.random.randint(88, 95) - np.random.uniform(0, 2); row['White_Blood_Cell_Count'] += np.random.randint(7000, 15000); row['Shortness_of_Breath'] = 1
    elif assigned_disease == 'Kidney Disease':
        if np.random.rand() < 0.7: row['History_of_Hypertension'] = 1; row['Creatinine'] += np.random.uniform(0.5, 4.0); row['GFR'] -= np.random.randint(40, 70)
    elif assigned_disease == 'Gastroenteritis':
        row['Vomiting_Frequency'] = np.random.randint(3, 10); row['Diarrhea_Severity'] = np.random.randint(5, 11)
    elif assigned_disease == 'Depression':
        row['Fatigue_Level'] = np.random.randint(8, 11)


    # --- AMBIGUITY INJECTION: Deliberately mislabel a small percentage of cases ---
    # This is the key step to force the accuracy below 100%
    chance_of_mislabel = np.random.rand()
    if chance_of_mislabel < 0.07: # 7% chance to mislabel
        if assigned_disease == 'Influenza':
            assigned_disease = 'Pneumonia' # A common real-world diagnostic challenge
        elif assigned_disease == 'Hypertension':
            assigned_disease = 'Kidney Disease' # Conditions are strongly linked
        elif assigned_disease == 'Diabetes':
            assigned_disease = 'Heart Disease' # Strong comorbidity
        elif assigned_disease == 'Pneumonia':
            assigned_disease = 'Influenza'

    row['Disease'] = assigned_disease
    data_list.append(row)

# --- 3. CREATE DATAFRAME and SAVE ---
df = pd.DataFrame(data_list)
df = df.fillna(0)
cols_to_convert = {col: int for col in df.columns if ('Score' in col or df[col].nunique() < 5) and df[col].dtype != 'object'}
df = df.astype(cols_to_convert)

end_time = time.time()
print(f"Final challenging dataset generated in {end_time - start_time:.2f} seconds.")
df.to_csv('enhanced_hackathon_dataset.csv', index=False)
print("\nDataset saved to 'enhanced_hackathon_dataset.csv'")
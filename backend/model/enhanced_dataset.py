import pandas as pd
import numpy as np

# --- 1. SETUP THE DATAFRAME WITH ALL POSSIBLE COLUMNS ---
num_entries = 10000
# Define the diseases we will simulate
diseases = [
    'Heart Disease', 'Diabetes', 'Hypertension', "Alzheimer's", 'Influenza',
    'Pneumonia', 'Kidney Disease', 'Gastroenteritis', 'Depression', 'No Disease'
]

# Define all possible metrics that could be used across all diseases
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
df = pd.DataFrame(columns=sorted(all_columns))

# --- 2. GENERATE DATA ROW BY ROW ---
for i in range(num_entries):
    # --- A. Start with a HEALTHY baseline for every patient ---
    row = {col: 0 for col in all_columns}
    row['Age'] = np.random.randint(18, 91)
    row['Gender'] = np.random.choice(['Male', 'Female'])
    row['BMI'] = np.round(np.random.uniform(18.5, 24.9), 1)
    row['Cholesterol'] = np.random.randint(150, 200)
    row['Blood_Pressure_Systolic'] = np.random.randint(90, 120)
    row['Blood_Pressure_Diastolic'] = np.random.randint(60, 80)
    row['Blood_Sugar'] = np.random.randint(70, 100)
    row['HbA1c'] = np.round(np.random.uniform(4.0, 5.6), 1)
    row['Creatinine'] = np.round(np.random.uniform(0.6, 1.2), 2)
    row['GFR'] = np.random.randint(90, 120)
    row['Troponin'] = np.round(np.random.uniform(0.0, 0.01), 3)
    row['Oxygen_Saturation'] = np.random.randint(97, 101)
    row['White_Blood_Cell_Count'] = np.random.randint(4500, 10000)
    row['Cognitive_Test_Score'] = np.random.randint(28, 31)
    for col in row:
        if 'Score' in col or 'Level' in col or 'Severity' in col: row[col] = np.random.randint(0, 3)

    # --- B. Decide randomly which disease profile to apply ---
    assigned_disease = np.random.choice(diseases, p=[0.09]*9 + [0.19])

    # --- C. Apply the disease profile by modifying the healthy baseline ---
    if assigned_disease == 'Heart Disease':
        # --- THIS IS THE CORRECTED LINE ---
        row['Age'] = np.random.randint(50, 90) # Set age to a high-risk range
        row['Cholesterol'] += np.random.randint(80, 200)
        row['Blood_Pressure_Systolic'] += np.random.randint(20, 70)
        row['BMI'] += np.random.uniform(5, 15)
        row['Chest_Pain_Type'] = np.random.choice([1, 2, 3])
        row['EKG_Abnormality'] = 1
        if np.random.rand() < 0.25: row['Troponin'] = np.round(np.random.uniform(0.05, 3.0), 3)
        row['Anxiety_Score'] += np.random.randint(3, 8)

    elif assigned_disease == 'Diabetes':
        row['BMI'] += np.random.uniform(5, 20)
        row['Blood_Sugar'] += np.random.randint(50, 200)
        row['HbA1c'] += np.random.uniform(2.0, 5.0)
        row['Polyuria'] = 1
        row['Polydipsia'] = 1
        if np.random.rand() < 0.4: row['Family_History_Diabetes'] = 1
        row['Fatigue_Level'] += np.random.randint(4, 7)

    elif assigned_disease == 'Hypertension':
        row['Blood_Pressure_Systolic'] += np.random.randint(30, 80)
        row['Blood_Pressure_Diastolic'] += np.random.randint(15, 40)
        row['Headache_Severity'] = np.random.randint(3, 9)
        row['Sodium_Intake_Level'] = np.random.randint(7, 11)
        if np.random.rand() < 0.6: row['Dizziness'] = 1

    elif assigned_disease == "Alzheimer's":
        row['Age'] = np.random.randint(65, 95)
        row['Family_History_Alzheimers'] = 1
        row['Cognitive_Test_Score'] = np.random.randint(10, 26) - np.random.randint(0, 5)
        row['Memory_Lapse_Severity'] = np.random.randint(5, 11)
        row['Disorientation_Level'] = np.random.randint(4, 11)
        row['Behavioral_Changes'] = 1

    elif assigned_disease == 'Influenza':
        if np.random.rand() < 0.9: row['Fever'] = 1
        row['Cough_Severity'] = np.random.randint(5, 10)
        row['Fatigue_Level'] = np.random.randint(7, 11)
        row['Body_Aches'] = 1
        row['Sore_Throat'] = 1
        row['White_Blood_Cell_Count'] += np.random.randint(1000, 5000)

    elif assigned_disease == 'Pneumonia':
        row['Age'] = np.random.randint(50, 95)
        row['Fever'] = 1
        row['Cough_Severity'] = np.random.randint(7, 11)
        row['Fatigue_Level'] = np.random.randint(8, 11)
        row['Oxygen_Saturation'] = np.random.randint(88, 95) - np.random.uniform(0, 2)
        row['White_Blood_Cell_Count'] += np.random.randint(8000, 15000)
        row['Shortness_of_Breath'] = 1

    elif assigned_disease == 'Kidney Disease':
        row['History_of_Hypertension'] = 1
        row['History_of_Diabetes'] = 1
        row['Creatinine'] += np.random.uniform(0.5, 4.0)
        row['GFR'] -= np.random.randint(40, 70)
        row['Swelling_in_Legs'] = 1
        row['Proteinuria_Level'] = np.random.randint(1, 4)
        row['Fatigue_Level'] += np.random.randint(5, 8)

    elif assigned_disease == 'Gastroenteritis':
        if np.random.rand() < 0.6: row['Fever'] = 1
        row['Vomiting_Frequency'] = np.random.randint(3, 10)
        row['Diarrhea_Severity'] = np.random.randint(5, 11)
        row['Abdominal_Pain_Level'] = np.random.randint(6, 11)
        row['Dehydration_Level'] = np.random.randint(4, 11)

    elif assigned_disease == 'Depression':
        row['Anxiety_Score'] = np.random.randint(10, 22)
        row['Sadness_Score'] = np.random.randint(7, 11)
        row['Loss_of_Interest_Score'] = np.random.randint(7, 11)
        row['Sleep_Disturbance_Score'] = np.random.randint(5, 11)
        row['Appetite_Change_Score'] = np.random.randint(5, 11)
        row['Fatigue_Level'] = np.random.randint(7, 11)

    # --- D. Set Final Target Variables ---
    row['Disease'] = assigned_disease
    # Severity logic remains the same
    df.loc[i] = pd.Series(row)


# --- 4. Final Data Cleaning and Saving ---
df = df.fillna(0)
cols_to_convert = {col: int for col in df.columns if ('Score' in col or df[col].nunique() < 5) and df[col].dtype != 'object'}
df = df.astype(cols_to_convert)

print("--- More Realistic Dataset Created ---")
print(df.head())
df.to_csv('enhanced_hackathon_dataset.csv', index=False)
print("\nDataset saved to 'enhanced_hackathon_dataset.csv'")
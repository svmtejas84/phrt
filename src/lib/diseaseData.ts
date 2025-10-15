export interface DiseaseInfo {
  name: string;
  id: string;
  symptomSummary: string;
  fields: string[];
}

export const diseases: DiseaseInfo[] = [
  {
    name: "Heart Disease",
    id: "heart-disease",
    symptomSummary: "Chest pain, high BP, shortness of breath",
    fields: ["Age", "Gender", "Cholesterol", "Blood_Pressure_Systolic", "BMI", "Chest_Pain_Type", "Troponin", "EKG_Abnormality"]
  },
  {
    name: "Diabetes",
    id: "diabetes",
    symptomSummary: "Fatigue, excessive thirst, frequent urination",
    fields: ["Age", "BMI", "Blood_Sugar", "HbA1c", "Polyuria", "Polydipsia", "Family_History_Diabetes"]
  },
  {
    name: "Hypertension",
    id: "hypertension",
    symptomSummary: "Headaches, dizziness, blurred vision",
    fields: ["Age", "BMI", "Blood_Pressure_Systolic", "Blood_Pressure_Diastolic", "Headache_Severity", "Dizziness", "Sodium_Intake_Level"]
  },
  {
    name: "Alzheimer's",
    id: "alzheimers",
    symptomSummary: "Memory loss, confusion, behavioral changes",
    fields: ["Age", "Family_History_Alzheimers", "Cognitive_Test_Score", "Memory_Lapse_Severity", "Disorientation_Level", "Behavioral_Changes"]
  },
  {
    name: "Influenza",
    id: "influenza",
    symptomSummary: "Fever, cough, body aches, fatigue",
    fields: ["Fever", "Cough_Severity", "Fatigue_Level", "Body_Aches", "Sore_Throat", "Oxygen_Saturation", "White_Blood_Cell_Count"]
  },
  {
    name: "Pneumonia",
    id: "pneumonia",
    symptomSummary: "Cough, fever, shortness of breath",
    fields: ["Age", "Fever", "Cough_Severity", "Fatigue_Level", "Oxygen_Saturation", "White_Blood_Cell_Count", "Shortness_of_Breath"]
  },
  {
    name: "Kidney Disease",
    id: "kidney-disease",
    symptomSummary: "Swelling, fatigue, high creatinine levels",
    fields: ["Age", "History_of_Hypertension", "History_of_Diabetes", "Creatinine", "GFR", "Swelling_in_Legs", "Proteinuria_Level"]
  },
  {
    name: "Gastroenteritis",
    id: "gastroenteritis",
    symptomSummary: "Diarrhea, vomiting, stomach cramps",
    fields: ["Fever", "Vomiting_Frequency", "Diarrhea_Severity", "Abdominal_Pain_Level", "Dehydration_Level"]
  },
  {
    name: "Depression",
    id: "depression",
    symptomSummary: "Low mood, sleep disturbance, loss of interest",
    fields: ["Anxiety_Score", "Sadness_Score", "Loss_of_Interest_Score", "Sleep_Disturbance_Score", "Appetite_Change_Score", "Fatigue_Level"]
  }
];
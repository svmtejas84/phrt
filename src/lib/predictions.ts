// Mock prediction algorithms for patient dataset

export interface PatientFormData {
  age: string;
  gender: string;
  bmi: string;
  systolicBp: string;
  diastolicBp: string;
  fastingGlucose: string;
  totalCholesterol: string;
  smokingStatus: string;
  physicalActivity: string;
  familyHistory: string;
}

export interface InstitutionFormData {
  age: string;
  gender: string;
  bmi: string;
  smokingStatus: string;
  systolicBp: string;
  diastolicBp: string;
  glucoseLevel: string;
  hasDiabetes: string;
  hasPneumonia: string;
}

const calculateRiskCategory = (score: number): 'No Risk' | 'Low' | 'Medium' | 'High' => {
  if (score < 20) return 'No Risk';
  if (score < 40) return 'Low';
  if (score < 60) return 'Medium';
  return 'High';
};

// Synchronous version for backward compatibility (uses mock calculations)
export const calculatePatientRisks = (data: any) => {
  return calculatePatientRisksMock(data);
};

// Helper to map form field names to model column names
function mapFormDataToModelFormat(formData: any): any {
  const mapped: any = {
    Age: Number(formData.age || formData.Age || 0),
    Gender: (formData.gender || formData.Gender || 'Male').charAt(0).toUpperCase() + (formData.gender || formData.Gender || 'Male').slice(1).toLowerCase(),
    BMI: Number(formData.bmi || formData.BMI || 0),
    Blood_Pressure_Systolic: Number(formData.systolicBp || formData.Blood_Pressure_Systolic || 0),
    Blood_Pressure_Diastolic: Number(formData.diastolicBp || formData.Blood_Pressure_Diastolic || 0),
    Blood_Sugar: Number(formData.fastingGlucose || formData.Blood_Sugar || 0),
    Cholesterol: Number(formData.totalCholesterol || formData.Cholesterol || 0),
    
    // Default values for fields not in preventive screening form
    HbA1c: 0,
    Creatinine: 0,
    GFR: 0,
    Troponin: 0,
    Oxygen_Saturation: 98,
    White_Blood_Cell_Count: 7000,
    Heart_Rate: 70,
    Exercise_Hours_Per_Week: Number(formData.physicalActivity === 'high' ? 5 : formData.physicalActivity === 'moderate' ? 2.5 : 1),
    
    // Family history and risk factors
    Family_History_Diabetes: formData.familyHistory === 'yes' ? 1 : 0,
    Family_History_Alzheimers: 0,
    History_of_Hypertension: 0,
    History_of_Diabetes: 0,
    
    // Cardiac markers
    Chest_Pain_Type: 0,
    EKG_Abnormality: 0,
    
    // Diabetes symptoms
    Polyuria: 0,
    Polydipsia: 0,
    
    // Hypertension symptoms
    Headache_Severity: 0,
    Dizziness: 0,
    Sodium_Intake_Level: formData.smokingStatus === 'current' ? 5 : 0,
    
    // Alzheimer's markers
    Cognitive_Test_Score: 25,
    Memory_Lapse_Severity: 0,
    Disorientation_Level: 0,
    Behavioral_Changes: 0,
    
    // Flu/respiratory symptoms
    Fever: 0,
    Cough_Severity: 0,
    Fatigue_Level: 0,
    Body_Aches: 0,
    Sore_Throat: 0,
    Shortness_of_Breath: 0,
    
    // Kidney disease markers
    Swelling_in_Legs: 0,
    Proteinuria_Level: 0,
    
    // GI symptoms
    Vomiting_Frequency: 0,
    Diarrhea_Severity: 0,
    Abdominal_Pain_Level: 0,
    Dehydration_Level: 0,
    
    // Mental health
    Anxiety_Score: 0,
    Sadness_Score: 0,
    Loss_of_Interest_Score: 0,
    Sleep_Disturbance_Score: 0,
    Appetite_Change_Score: 0,
  };
  
  return mapped;
}

// Async API-based prediction using the ML model
// Returns probability scores for ALL disease classes
export const calculatePatientRisksAsync = async (data: any) => {
  try {
    // Prepare data for API - convert form fields to model format
    let inputData = Array.isArray(data) ? data[0] : data;
    inputData = mapFormDataToModelFormat(inputData);
    
    console.log('Sending ML model prediction request:', inputData);
    
    // Call the prediction API
    const response = await fetch('/api/predict', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ data: inputData }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Prediction API failed: ${response.status} - ${errorText}`);
    }

    const result = await response.json();
    console.log('ML Model API response:', result);
    
    // New format: result.results is an array where each element is an array of all disease predictions
    // For single input: result.results[0] contains all diseases with their probabilities
    if (result.results && Array.isArray(result.results) && result.results.length > 0) {
      const allDiseases = result.results[0]; // Get first (and only) sample's predictions
      
      if (Array.isArray(allDiseases)) {
        // Transform to our format with recommendations
        return allDiseases.map((item: any) => {
          const confidence = item.confidence || 0;
          const disease = item.label || 'Unknown';
          
          return {
            disease,
            riskScore: Math.round(confidence),
            riskCategory: calculateRiskCategory(confidence),
            featureImportance: [],
            recommendations: getRecommendations(disease),
          };
        });
      }
    }
    
    // If response doesn't match expected format, use fallback
    throw new Error('Unexpected API response format');
  } catch (error) {
    console.error('ML Model prediction error, falling back to mock calculations:', error);
    // Fallback to mock calculations if API fails
    return calculatePatientRisksMock(data);
  }
};

// Helper function to get recommendations based on disease
function getRecommendations(disease: string): string[] {
  const recommendations: Record<string, string[]> = {
    'Heart Disease': ['Monitor blood pressure regularly', 'Maintain healthy cholesterol levels', 'Exercise regularly'],
    'Diabetes': ['Monitor blood glucose levels', 'Maintain healthy weight', 'Follow diabetic diet'],
    'Hypertension': ['Reduce sodium intake', 'Exercise regularly', 'Monitor blood pressure'],
    "Alzheimer's": ['Regular cognitive exercises', 'Social engagement', 'Healthy lifestyle'],
    'Influenza': ['Get flu vaccination', 'Rest and hydration', 'Seek medical care if severe'],
    'Pneumonia': ['Monitor oxygen levels', 'Complete antibiotic course', 'Rest and recovery'],
    'Kidney Disease': ['Monitor kidney function', 'Control blood pressure', 'Manage diabetes'],
    'Gastroenteritis': ['Stay hydrated', 'BRAT diet', 'Seek medical care if severe'],
    'Depression': ['Seek professional help', 'Regular exercise', 'Social support'],
    'No Disease': ['Maintain healthy lifestyle', 'Regular checkups', 'Stay active'],
  };
  return recommendations[disease] || ['Consult with healthcare provider', 'Regular monitoring'];
}

// Backup mock function for when API is unavailable
const calculatePatientRisksMock = (data: any) => {
  // Heart Disease - More aggressive
  const heartDiseaseScore = (() => {
    const age = Number(data.Age || 0);
    const gender = (data.Gender || '').toLowerCase();
    const cholesterol = Number(data.Cholesterol || 0);
    const systolic = Number(data.Blood_Pressure_Systolic || 0);
    const bmi = Number(data.BMI || 0);
    const chestPain = Number(data.Chest_Pain_Type || 0);
    const troponin = Number(data.Troponin || 0);
    const ekg = Number(data.EKG_Abnormality || 0);
    
    let score = 0;
    score += Math.min(35, Math.max(0, (age - 35) * 1.0)); // Age factor (starts at 35)
    score += (gender === 'male' ? 15 : 8); // Gender factor (higher baseline)
    score += Math.min(30, Math.max(0, (cholesterol - 180) * 0.2)); // Cholesterol (starts at 180)
    score += Math.min(35, Math.max(0, (systolic - 110) * 0.5)); // BP (starts at 110)
    score += Math.min(25, Math.max(0, (bmi - 24) * 2)); // BMI (starts at 24)
    score += chestPain * 15; // Chest pain
    score += troponin * 200; // Troponin (extremely high impact)
    score += ekg * 15; // EKG abnormality
    
    // Add base cardiovascular risk for adults
    if (age > 40) score += 20;
    if (age > 55) score += 15;
    
    return Math.min(100, Math.max(0, score));
  })();

  // Diabetes - Made much more aggressive and common
  const diabetesScore = (() => {
    const age = Number(data.Age || 0);
    const bmi = Number(data.BMI || 0);
    const sugar = Number(data.Blood_Sugar || 0);
    const hba1c = Number(data.HbA1c || 0);
    const polyuria = Number(data.Polyuria || 0);
    const polydipsia = Number(data.Polydipsia || 0);
    const family = Number(data.Family_History_Diabetes || 0);
    
    let score = 0;
    
    // Much more aggressive scoring - start risk earlier
    score += Math.min(25, Math.max(0, (age - 25) * 0.8)); // Age factor (starts at 25)
    score += Math.min(40, Math.max(0, (bmi - 23) * 3)); // BMI (starts at 23, very aggressive)
    score += Math.min(50, Math.max(0, (sugar - 85) * 0.4)); // Blood sugar (starts at 85, very sensitive)
    score += Math.min(40, Math.max(0, (hba1c - 5.0) * 12)); // HbA1c (starts at 5.0, very aggressive)
    score += polyuria * 12; // Polyuria (higher impact)
    score += polydipsia * 12; // Polydipsia (higher impact)
    score += family * 20; // Family history (very high impact)
    
    // Add base risk for everyone over 30
    if (age > 30) score += 15;
    
    // Add extra risk for common scenarios
    if (bmi > 27) score += 20; // Overweight penalty
    if (sugar > 110) score += 25; // Elevated glucose penalty
    
    return Math.min(100, Math.max(0, score));
  })();

  // Hypertension - More aggressive
  const hypertensionScore = (() => {
    const age = Number(data.Age || 0);
    const bmi = Number(data.BMI || 0);
    const systolic = Number(data.Blood_Pressure_Systolic || 0);
    const diastolic = Number(data.Blood_Pressure_Diastolic || 0);
    const headache = Number(data.Headache_Severity || 0);
    const dizziness = Number(data.Dizziness || 0);
    const sodium = Number(data.Sodium_Intake_Level || 0);
    
    let score = 0;
    score += Math.min(30, Math.max(0, (age - 30) * 0.8)); // Age factor (starts at 30)
    score += Math.min(25, Math.max(0, (bmi - 24) * 1.5)); // BMI (starts at 24)
    score += Math.min(45, Math.max(0, (systolic - 120) * 0.6)); // Systolic BP (starts at 120)
    score += Math.min(30, Math.max(0, (diastolic - 75) * 0.8)); // Diastolic BP (starts at 75)
    score += headache * 8; // Headache severity
    score += dizziness * 8; // Dizziness
    score += sodium * 5; // Sodium intake
    
    // Add base risk for common BP ranges
    if (systolic >= 100) score += 10;
    if (systolic >= 110) score += 15;
    if (age > 45) score += 18;
    
    return Math.min(100, Math.max(0, score));
  })();

  // Alzheimer's
  const alzheimersScore = (() => {
    const age = Number(data.Age || 0);
    const family = Number(data.Family_History_Alzheimers || 0);
    const cognitive = Number(data.Cognitive_Test_Score || 0);
    const memory = Number(data.Memory_Lapse_Severity || 0);
    const disorientation = Number(data.Disorientation_Level || 0);
    const behavior = Number(data.Behavioral_Changes || 0);
    
    let score = 0;
    score += Math.min(40, Math.max(0, (age - 50) * 0.8)); // Age factor (0-40, starts at 50)
    score += family * 15; // Family history
    score += Math.min(20, Math.max(0, (30 - cognitive) * 1)); // Cognitive score (lower is worse)
    score += memory * 3; // Memory issues
    score += disorientation * 3; // Disorientation
    score += behavior * 2; // Behavioral changes
    
    return Math.min(100, Math.max(0, score));
  })();

  // Influenza
  const influenzaScore = (() => {
    const fever = Number(data.Fever || 0);
    const cough = Number(data.Cough_Severity || 0);
    const fatigue = Number(data.Fatigue_Level || 0);
    const aches = Number(data.Body_Aches || 0);
    const throat = Number(data.Sore_Throat || 0);
    const oxygen = Number(data.Oxygen_Saturation || 100);
    const wbc = Number(data.White_Blood_Cell_Count || 0);
    
    let score = 0;
    score += fever * 15; // Fever presence
    score += cough * 3; // Cough severity
    score += fatigue * 3; // Fatigue level
    score += aches * 3; // Body aches
    score += throat * 3; // Sore throat
    score += Math.min(20, Math.max(0, (100 - oxygen) * 2)); // Oxygen saturation (0-20)
    score += (wbc > 10000 ? 10 : 0); // Elevated WBC
    
    return Math.min(100, Math.max(0, score));
  })();

  // Pneumonia
  const pneumoniaScore = (() => {
    const age = Number(data.Age || 0);
    const fever = Number(data.Fever || 0);
    const cough = Number(data.Cough_Severity || 0);
    const fatigue = Number(data.Fatigue_Level || 0);
    const oxygen = Number(data.Oxygen_Saturation || 100);
    const wbc = Number(data.White_Blood_Cell_Count || 0);
    const breath = Number(data.Shortness_of_Breath || 0);
    
    let score = 0;
    score += Math.min(15, Math.max(0, (age - 40) * 0.3)); // Age factor (0-15)
    score += fever * 20; // Fever presence
    score += cough * 4; // Cough severity
    score += fatigue * 3; // Fatigue level
    score += Math.min(30, Math.max(0, (100 - oxygen) * 3)); // Oxygen saturation (0-30)
    score += (wbc > 10000 ? 15 : 0); // Elevated WBC
    score += breath * 15; // Shortness of breath
    
    return Math.min(100, Math.max(0, score));
  })();

  // Kidney Disease
  const kidneyScore = (() => {
    const age = Number(data.Age || 0);
    const htn = Number(data.History_of_Hypertension || 0);
    const diabetes = Number(data.History_of_Diabetes || 0);
    const creatinine = Number(data.Creatinine || 0);
    const gfr = Number(data.GFR || 0);
    const swelling = Number(data.Swelling_in_Legs || 0);
    const proteinuria = Number(data.Proteinuria_Level || 0);
    
    let score = 0;
    score += Math.min(15, Math.max(0, (age - 40) * 0.3)); // Age factor (0-15)
    score += htn * 20; // History of hypertension
    score += diabetes * 20; // History of diabetes
    score += Math.min(25, Math.max(0, (creatinine - 0.5) * 20)); // Creatinine (0-25)
    score += Math.min(20, Math.max(0, (120 - gfr) * 0.2)); // GFR (0-20)
    score += swelling * 10; // Swelling in legs
    score += proteinuria * 3; // Proteinuria level
    
    return Math.min(100, Math.max(0, score));
  })();

  // Gastroenteritis
  const gastroScore = (() => {
    const fever = Number(data.Fever || 0);
    const vomiting = Number(data.Vomiting_Frequency || 0);
    const diarrhea = Number(data.Diarrhea_Severity || 0);
    const pain = Number(data.Abdominal_Pain_Level || 0);
    const dehydration = Number(data.Dehydration_Level || 0);
    
    let score = 0;
    score += fever * 15; // Fever presence
    score += vomiting * 4; // Vomiting frequency
    score += diarrhea * 4; // Diarrhea severity
    score += pain * 3; // Abdominal pain level
    score += dehydration * 5; // Dehydration level
    
    return Math.min(100, Math.max(0, score));
  })();

  // Depression
  const depressionScore = (() => {
    const anxiety = Number(data.Anxiety_Score || 0);
    const sadness = Number(data.Sadness_Score || 0);
    const interest = Number(data.Loss_of_Interest_Score || 0);
    const sleep = Number(data.Sleep_Disturbance_Score || 0);
    const appetite = Number(data.Appetite_Change_Score || 0);
    const fatigue = Number(data.Fatigue_Level || 0);
    
    let score = 0;
    score += anxiety * 4; // Anxiety score
    score += sadness * 4; // Sadness score
    score += interest * 4; // Loss of interest
    score += sleep * 3; // Sleep disturbance
    score += appetite * 3; // Appetite changes
    score += fatigue * 3; // Fatigue level
    
    return Math.min(100, Math.max(0, score));
  })();

  // Return results
  return [
    { 
      disease: 'Heart Disease', 
      riskScore: Math.round(heartDiseaseScore), 
      riskCategory: calculateRiskCategory(heartDiseaseScore),
      featureImportance: [
        { feature: 'Age', importance: 20 },
        { feature: 'Cholesterol', importance: 25 },
        { feature: 'Blood Pressure', importance: 30 },
        { feature: 'BMI', importance: 15 },
        { feature: 'Troponin', importance: 10 }
      ],
      recommendations: ['Monitor blood pressure regularly', 'Maintain healthy cholesterol levels', 'Exercise regularly']
    },
    { 
      disease: 'Diabetes', 
      riskScore: Math.round(diabetesScore), 
      riskCategory: calculateRiskCategory(diabetesScore),
      featureImportance: [
        { feature: 'Blood Sugar', importance: 35 },
        { feature: 'BMI', importance: 25 },
        { feature: 'HbA1c', importance: 20 },
        { feature: 'Family History', importance: 15 },
        { feature: 'Age', importance: 5 }
      ],
      recommendations: ['Monitor blood glucose levels', 'Maintain healthy weight', 'Follow diabetic diet']
    },
    { 
      disease: 'Hypertension', 
      riskScore: Math.round(hypertensionScore), 
      riskCategory: calculateRiskCategory(hypertensionScore),
      featureImportance: [
        { feature: 'Blood Pressure', importance: 40 },
        { feature: 'BMI', importance: 25 },
        { feature: 'Age', importance: 20 },
        { feature: 'Sodium Intake', importance: 15 }
      ],
      recommendations: ['Reduce sodium intake', 'Exercise regularly', 'Monitor blood pressure']
    },
    { 
      disease: "Alzheimer's", 
      riskScore: Math.round(alzheimersScore), 
      riskCategory: calculateRiskCategory(alzheimersScore),
      featureImportance: [
        { feature: 'Age', importance: 35 },
        { feature: 'Family History', importance: 25 },
        { feature: 'Cognitive Test Score', importance: 20 },
        { feature: 'Memory Issues', importance: 20 }
      ],
      recommendations: ['Regular cognitive exercises', 'Social engagement', 'Healthy lifestyle']
    },
    { 
      disease: 'Influenza', 
      riskScore: Math.round(influenzaScore), 
      riskCategory: calculateRiskCategory(influenzaScore),
      featureImportance: [
        { feature: 'Fever', importance: 30 },
        { feature: 'Cough', importance: 25 },
        { feature: 'Fatigue', importance: 20 },
        { feature: 'Body Aches', importance: 15 },
        { feature: 'Oxygen Saturation', importance: 10 }
      ],
      recommendations: ['Get flu vaccination', 'Rest and hydration', 'Seek medical care if severe']
    },
    { 
      disease: 'Pneumonia', 
      riskScore: Math.round(pneumoniaScore), 
      riskCategory: calculateRiskCategory(pneumoniaScore),
      featureImportance: [
        { feature: 'Oxygen Saturation', importance: 30 },
        { feature: 'Fever', importance: 25 },
        { feature: 'Cough', importance: 20 },
        { feature: 'Age', importance: 15 },
        { feature: 'Shortness of Breath', importance: 10 }
      ],
      recommendations: ['Monitor oxygen levels', 'Complete antibiotic course', 'Rest and recovery']
    },
    { 
      disease: 'Kidney Disease', 
      riskScore: Math.round(kidneyScore), 
      riskCategory: calculateRiskCategory(kidneyScore),
      featureImportance: [
        { feature: 'GFR', importance: 30 },
        { feature: 'Creatinine', importance: 25 },
        { feature: 'History of Diabetes', importance: 20 },
        { feature: 'History of Hypertension', importance: 15 },
        { feature: 'Age', importance: 10 }
      ],
      recommendations: ['Monitor kidney function', 'Control blood pressure', 'Manage diabetes']
    },
    { 
      disease: 'Gastroenteritis', 
      riskScore: Math.round(gastroScore), 
      riskCategory: calculateRiskCategory(gastroScore),
      featureImportance: [
        { feature: 'Vomiting', importance: 25 },
        { feature: 'Diarrhea', importance: 25 },
        { feature: 'Dehydration', importance: 25 },
        { feature: 'Abdominal Pain', importance: 15 },
        { feature: 'Fever', importance: 10 }
      ],
      recommendations: ['Stay hydrated', 'BRAT diet', 'Seek medical care if severe']
    },
    { 
      disease: 'Depression', 
      riskScore: Math.round(depressionScore), 
      riskCategory: calculateRiskCategory(depressionScore),
      featureImportance: [
        { feature: 'Sadness Score', importance: 25 },
        { feature: 'Loss of Interest', importance: 25 },
        { feature: 'Sleep Disturbance', importance: 20 },
        { feature: 'Anxiety Score', importance: 15 },
        { feature: 'Fatigue Level', importance: 15 }
      ],
      recommendations: ['Seek professional help', 'Regular exercise', 'Social support']
    },
  ];
};

export const calculateInstitutionRisks = (data: InstitutionFormData) => {
  const age = parseFloat(data.age);
  const bmi = parseFloat(data.bmi);
  const systolicBp = parseFloat(data.systolicBp);
  const glucose = parseFloat(data.glucoseLevel);

  const smokingFactor = data.smokingStatus === 'current' ? 1.5 : data.smokingStatus === 'former' ? 1.2 : 1.0;
  const diabetesFactor = data.hasDiabetes === 'yes' ? 1.4 : 1.0;
  const pneumoniaFactor = data.hasPneumonia === 'yes' ? 1.3 : 1.0;

  const diseases = [
    {
      disease: 'Type 2 Diabetes',
      riskScore: Math.round(
        Math.min(100, ((glucose - 70) / 130) * 45 + ((bmi - 18) / 22) * 30 + ((age - 20) / 60) * 25)
      ),
    },
    {
      disease: 'Cardiovascular Disease',
      riskScore: Math.round(
        Math.min(
          100,
          ((systolicBp - 90) / 90) * 40 +
            ((age - 20) / 60) * 25 +
            (smokingFactor - 1) * 50 +
            (diabetesFactor - 1) * 40
        )
      ),
    },
    {
      disease: 'Hypertension',
      riskScore: Math.round(Math.min(100, ((systolicBp - 90) / 90) * 55 + ((bmi - 18) / 22) * 30 + ((age - 20) / 60) * 15)),
    },
    {
      disease: 'Pulmonary Risk',
      riskScore: Math.round(
        Math.min(100, (smokingFactor - 1) * 60 + (pneumoniaFactor - 1) * 50 + ((age - 20) / 60) * 20)
      ),
    },
    {
      disease: 'Mortality Risk',
      riskScore: Math.round(
        Math.min(
          100,
          ((age - 20) / 60) * 40 +
            (diabetesFactor - 1) * 50 +
            (pneumoniaFactor - 1) * 45 +
            (smokingFactor - 1) * 30
        )
      ),
    },
  ];

  return diseases.map((d) => ({
    ...d,
    riskCategory: calculateRiskCategory(d.riskScore),
  }));
};

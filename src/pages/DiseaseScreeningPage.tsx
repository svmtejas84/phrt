import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import RiskGauge from '../components/RiskGauge';
import { calculatePatientRisksAsync, type PatientFormData } from '../lib/predictions';
import { generatePatientReport } from '../lib/pdfGenerator';

const diseaseFields: Record<string, Array<{ key: string; label: string; type?: string; min?: number; max?: number; step?: number }>> = {
  'Heart Disease': [
    { key: 'Age', label: 'Age', type: 'number', min: 1, max: 120 },
    { key: 'Gender', label: 'Gender', type: 'text' },
    { key: 'Cholesterol', label: 'Cholesterol', type: 'number', min: 100, max: 400 },
    { key: 'Blood_Pressure_Systolic', label: 'Systolic BP', type: 'number', min: 70, max: 200 },
    { key: 'BMI', label: 'BMI', type: 'number', min: 10, max: 60, step: 0.1 },
    { key: 'Chest_Pain_Type', label: 'Chest Pain Type', type: 'text' },
    { key: 'Troponin', label: 'Troponin', type: 'number', min: 0, max: 10, step: 0.001 },
    { key: 'EKG_Abnormality', label: 'EKG Abnormality', type: 'text' },
  ],
  'Diabetes': [
    { key: 'Age', label: 'Age', type: 'number', min: 1, max: 120 },
    { key: 'BMI', label: 'BMI', type: 'number', min: 10, max: 60, step: 0.1 },
    { key: 'Blood_Sugar', label: 'Blood Sugar', type: 'number', min: 50, max: 300 },
    { key: 'HbA1c', label: 'HbA1c', type: 'number', min: 4, max: 15, step: 0.01 },
    { key: 'Polyuria', label: 'Polyuria', type: 'number', min: 0, max: 1 },
    { key: 'Polydipsia', label: 'Polydipsia', type: 'number', min: 0, max: 1 },
    { key: 'Family_History_Diabetes', label: 'Family History Diabetes', type: 'number', min: 0, max: 1 },
  ],
  'Hypertension': [
    { key: 'Age', label: 'Age', type: 'number', min: 1, max: 120 },
    { key: 'BMI', label: 'BMI', type: 'number', min: 10, max: 60, step: 0.1 },
    { key: 'Blood_Pressure_Systolic', label: 'Systolic BP', type: 'number', min: 70, max: 200 },
    { key: 'Blood_Pressure_Diastolic', label: 'Diastolic BP', type: 'number', min: 40, max: 130 },
    { key: 'Headache_Severity', label: 'Headache Severity', type: 'number', min: 0, max: 10 },
    { key: 'Dizziness', label: 'Dizziness', type: 'number', min: 0, max: 10 },
    { key: 'Sodium_Intake_Level', label: 'Sodium Intake Level', type: 'number', min: 0, max: 10 },
  ],
  "Alzheimer's": [
    { key: 'Age', label: 'Age', type: 'number', min: 1, max: 120 },
    { key: 'Family_History_Alzheimers', label: 'Family History Alzheimers', type: 'number', min: 0, max: 1 },
    { key: 'Cognitive_Test_Score', label: 'Cognitive Test Score', type: 'number', min: 0, max: 30 },
    { key: 'Memory_Lapse_Severity', label: 'Memory Lapse Severity', type: 'number', min: 0, max: 10 },
    { key: 'Disorientation_Level', label: 'Disorientation Level', type: 'number', min: 0, max: 10 },
    { key: 'Behavioral_Changes', label: 'Behavioral Changes', type: 'number', min: 0, max: 10 },
  ],
  'Influenza': [
    { key: 'Fever', label: 'Fever', type: 'number', min: 0, max: 1 },
    { key: 'Cough_Severity', label: 'Cough Severity', type: 'number', min: 0, max: 10 },
    { key: 'Fatigue_Level', label: 'Fatigue Level', type: 'number', min: 0, max: 10 },
    { key: 'Body_Aches', label: 'Body Aches', type: 'number', min: 0, max: 10 },
    { key: 'Sore_Throat', label: 'Sore Throat', type: 'number', min: 0, max: 10 },
    { key: 'Oxygen_Saturation', label: 'Oxygen Saturation', type: 'number', min: 80, max: 100 },
    { key: 'White_Blood_Cell_Count', label: 'White Blood Cell Count', type: 'number', min: 4000, max: 12000 },
  ],
  'Pneumonia': [
    { key: 'Age', label: 'Age', type: 'number', min: 1, max: 120 },
    { key: 'Fever', label: 'Fever', type: 'number', min: 0, max: 1 },
    { key: 'Cough_Severity', label: 'Cough Severity', type: 'number', min: 0, max: 10 },
    { key: 'Fatigue_Level', label: 'Fatigue Level', type: 'number', min: 0, max: 10 },
    { key: 'Oxygen_Saturation', label: 'Oxygen Saturation', type: 'number', min: 80, max: 100 },
    { key: 'White_Blood_Cell_Count', label: 'White Blood Cell Count', type: 'number', min: 4000, max: 12000 },
    { key: 'Shortness_of_Breath', label: 'Shortness of Breath', type: 'number', min: 0, max: 1 },
  ],
  'Kidney Disease': [
    { key: 'Age', label: 'Age', type: 'number', min: 1, max: 120 },
    { key: 'History_of_Hypertension', label: 'History of Hypertension', type: 'number', min: 0, max: 1 },
    { key: 'History_of_Diabetes', label: 'History of Diabetes', type: 'number', min: 0, max: 1 },
    { key: 'Creatinine', label: 'Creatinine', type: 'number', min: 0.5, max: 10, step: 0.01 },
    { key: 'GFR', label: 'GFR', type: 'number', min: 0, max: 120 },
    { key: 'Swelling_in_Legs', label: 'Swelling in Legs', type: 'number', min: 0, max: 1 },
    { key: 'Proteinuria_Level', label: 'Proteinuria Level', type: 'number', min: 0, max: 10 },
  ],
  'Gastroenteritis': [
    { key: 'Fever', label: 'Fever', type: 'number', min: 0, max: 1 },
    { key: 'Vomiting_Frequency', label: 'Vomiting Frequency', type: 'number', min: 0, max: 10 },
    { key: 'Diarrhea_Severity', label: 'Diarrhea Severity', type: 'number', min: 0, max: 10 },
    { key: 'Abdominal_Pain_Level', label: 'Abdominal Pain Level', type: 'number', min: 0, max: 10 },
    { key: 'Dehydration_Level', label: 'Dehydration Level', type: 'number', min: 0, max: 10 },
  ],
  'Depression': [
    { key: 'Anxiety_Score', label: 'Anxiety Score', type: 'number', min: 0, max: 10 },
    { key: 'Sadness_Score', label: 'Sadness Score', type: 'number', min: 0, max: 10 },
    { key: 'Loss_of_Interest_Score', label: 'Loss of Interest Score', type: 'number', min: 0, max: 10 },
    { key: 'Sleep_Disturbance_Score', label: 'Sleep Disturbance Score', type: 'number', min: 0, max: 10 },
    { key: 'Appetite_Change_Score', label: 'Appetite Change Score', type: 'number', min: 0, max: 10 },
    { key: 'Fatigue_Level', label: 'Fatigue Level', type: 'number', min: 0, max: 10 },
  ],
};

export default function DiseaseScreeningPage() {
  const { disease } = useParams();
  const diseaseName = decodeURIComponent(disease || '');
  const fields = diseaseFields[diseaseName] || [];
  const [formData, setFormData] = useState<Partial<PatientFormData>>({});
  const [result, setResult] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (key: string, value: string) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const risks = await calculatePatientRisksAsync(formData as any);
      const diseaseResult = risks.find((r: any) => r.disease === diseaseName);
      setResult(diseaseResult);
    } catch (error) {
      console.error('Prediction failed:', error);
      setResult({ disease: diseaseName, riskScore: 0, riskCategory: 'Error', error: 'Failed to predict. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownloadReport = () => {
    if (result) {
      generatePatientReport(formData, [result]);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-5xl mx-auto px-4 py-10">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            {/* Logo and Title */}
            <div className="rounded-full bg-primary/10 w-12 h-12 flex items-center justify-center font-bold text-xl text-primary">OC</div>
            <h1 className="text-3xl font-bold text-primary">One Care</h1>
          </div>
          <div className="rounded-full w-12 h-12 bg-muted flex items-center justify-center">
            {/* Profile icon placeholder */}
            <span className="text-lg font-bold text-muted-foreground">P</span>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Form Section */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="text-2xl">{diseaseName}</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {fields.map(field => (
                  <div key={field.key} className="space-y-1">
                    <Label htmlFor={field.key}>{field.label}</Label>
                    <Input
                      id={field.key}
                      type={field.type || 'text'}
                      value={formData[field.key] || ''}
                      onChange={e => handleInputChange(field.key, e.target.value)}
                      min={field.min}
                      max={field.max}
                      step={field.step}
                      required
                    />
                  </div>
                ))}
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? 'Predicting...' : 'Predict'}
                </Button>
              </form>
            </CardContent>
          </Card>
          {/* Result Section */}
          <Card className="shadow-lg flex flex-col justify-between">
            <CardHeader>
              <CardTitle className="text-2xl">Result</CardTitle>
            </CardHeader>
            <CardContent>
              {result ? (
                <div className="flex flex-col items-center gap-4">
                  <RiskGauge value={result.riskScore} size={120} />
                  <div className="text-lg font-bold">{result.riskScore}% Risk</div>
                  <div className="text-sm text-muted-foreground">{result.riskCategory} Risk</div>
                  <Button className="mt-4" onClick={handleDownloadReport}>
                    Generate PDF
                  </Button>
                </div>
              ) : (
                <div className="text-muted-foreground text-center">Fill the form and click Predict to see your risk result.</div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

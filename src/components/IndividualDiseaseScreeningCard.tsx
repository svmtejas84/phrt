import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import RiskGauge from './RiskGauge';
import { calculatePatientRisks, type PatientFormData } from '../lib/predictions';

const diseaseFields: Record<string, Array<{ key: keyof PatientFormData; label: string; type?: string; min?: number; max?: number; step?: number }>> = {
  'Type 2 Diabetes': [
    { key: 'age', label: 'Age', type: 'number', min: 1, max: 120 },
    { key: 'bmi', label: 'BMI', type: 'number', min: 10, max: 60, step: 0.1 },
    { key: 'fastingGlucose', label: 'Fasting Glucose', type: 'number', min: 50, max: 300 },
    { key: 'familyHistory', label: 'Family History', type: 'text' },
  ],
  'Heart Disease': [
    { key: 'age', label: 'Age', type: 'number', min: 1, max: 120 },
    { key: 'systolicBp', label: 'Systolic BP', type: 'number', min: 70, max: 200 },
    { key: 'totalCholesterol', label: 'Total Cholesterol', type: 'number', min: 100, max: 400 },
    { key: 'smokingStatus', label: 'Smoking Status', type: 'text' },
    { key: 'physicalActivity', label: 'Physical Activity', type: 'text' },
  ],
  'Hypertension': [
    { key: 'age', label: 'Age', type: 'number', min: 1, max: 120 },
    { key: 'bmi', label: 'BMI', type: 'number', min: 10, max: 60, step: 0.1 },
    { key: 'systolicBp', label: 'Systolic BP', type: 'number', min: 70, max: 200 },
    { key: 'smokingStatus', label: 'Smoking Status', type: 'text' },
  ],
  'Metabolic Syndrome': [
    { key: 'bmi', label: 'BMI', type: 'number', min: 10, max: 60, step: 0.1 },
    { key: 'fastingGlucose', label: 'Fasting Glucose', type: 'number', min: 50, max: 300 },
    { key: 'totalCholesterol', label: 'Total Cholesterol', type: 'number', min: 100, max: 400 },
    { key: 'physicalActivity', label: 'Physical Activity', type: 'text' },
  ],
  'Stroke': [
    { key: 'age', label: 'Age', type: 'number', min: 1, max: 120 },
    { key: 'systolicBp', label: 'Systolic BP', type: 'number', min: 70, max: 200 },
    { key: 'totalCholesterol', label: 'Total Cholesterol', type: 'number', min: 100, max: 400 },
    { key: 'smokingStatus', label: 'Smoking Status', type: 'text' },
  ],
};

const defaultFieldValue = (key: keyof PatientFormData, patient: any) => {
  return patient[key] || '';
};

export default function IndividualDiseaseScreeningCard({ disease, patient, index }: { disease: string; patient: any; index: number }) {
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState<Partial<PatientFormData>>(() => {
    const fields = diseaseFields[disease] || [];
    const initial: Partial<PatientFormData> = {};
    fields.forEach(f => { initial[f.key] = defaultFieldValue(f.key, patient); });
    return initial;
  });
  const [result, setResult] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (key: keyof PatientFormData, value: string) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      const fullData = { ...patient, ...formData };
      const risks = calculatePatientRisks(fullData as any);
      const diseaseResult = risks.find((r: any) => r.disease === disease);
      setResult(diseaseResult);
      setIsLoading(false);
    }, 400);
  };

  return (
    <>
      <Card className="h-full animate-fade-in" style={{ animationDelay: `${index * 0.1}s` }}>
        <CardHeader>
          <CardTitle className="text-lg">{disease}</CardTitle>
        </CardHeader>
        <CardContent>
          <Button className="w-full" onClick={() => setIsOpen(true)}>
            Check Risk
          </Button>
        </CardContent>
      </Card>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Preventive Screening: {disease}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            {(diseaseFields[disease] || []).map(field => (
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
              {isLoading ? 'Calculating...' : 'Calculate Risk'}
            </Button>
          </form>
          {result && (
            <div className="mt-6 text-center">
              <RiskGauge value={result.riskScore} size={120} />
              <div className="mt-2 text-lg font-bold">{result.riskScore}% Risk</div>
              <div className="mt-1 text-sm text-muted-foreground">{result.riskCategory} Risk</div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Download } from 'lucide-react';
import { calculateInstitutionRisks, InstitutionFormData } from '@/lib/predictions';
import { generateInstitutionReport } from '@/lib/pdfGenerator';
import RiskGauge from './RiskGauge';
import { Badge } from './ui/badge';
import toast from 'react-hot-toast';

interface NewPatientModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const initialFormData: InstitutionFormData = {
  age: '',
  gender: '',
  bmi: '',
  smokingStatus: '',
  systolicBp: '',
  diastolicBp: '',
  glucoseLevel: '',
  hasDiabetes: '',
  hasPneumonia: '',
};

export default function NewPatientModal({ isOpen, onClose }: NewPatientModalProps) {
  const [formData, setFormData] = useState<InstitutionFormData>(initialFormData);
  const [results, setResults] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (field: keyof InstitutionFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const requiredFields = Object.entries(formData);
    const emptyFields = requiredFields.filter(([_, value]) => !value);

    if (emptyFields.length > 0) {
      toast.error('Please fill in all fields');
      return;
    }

    setIsLoading(true);

    try {
      await new Promise((resolve) => setTimeout(resolve, 1200));
      const riskResults = calculateInstitutionRisks(formData);
      setResults(riskResults);
      toast.success('Patient assessment complete!');
    } catch (error) {
      toast.error('Failed to calculate risks');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownloadReport = () => {
    if (results) {
      generateInstitutionReport(formData, results);
      toast.success('Report downloaded!');
    }
  };

  const handleClose = () => {
    setFormData(initialFormData);
    setResults(null);
    onClose();
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      'No Risk': '#10B981',
      'Low': '#22C55E',
      'Medium': '#F59E0B',
      'High': '#EF4444',
    };
    return colors[category] || '#6B7280';
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">New Patient Risk Screening</DialogTitle>
          <DialogDescription>
            Enter patient information for institutional risk assessment
          </DialogDescription>
        </DialogHeader>

        {!results ? (
          <form onSubmit={handleSubmit} className="space-y-6 mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="age">Age *</Label>
                <Input
                  id="age"
                  type="number"
                  value={formData.age}
                  onChange={(e) => handleInputChange('age', e.target.value)}
                  placeholder="e.g., 45"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="gender">Gender *</Label>
                <Select value={formData.gender} onValueChange={(value) => handleInputChange('gender', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="bmi">BMI *</Label>
                <Input
                  id="bmi"
                  type="number"
                  step="0.1"
                  value={formData.bmi}
                  onChange={(e) => handleInputChange('bmi', e.target.value)}
                  placeholder="e.g., 24.5"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="smokingStatus">Smoking Status *</Label>
                <Select value={formData.smokingStatus} onValueChange={(value) => handleInputChange('smokingStatus', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="never">Never Smoked</SelectItem>
                    <SelectItem value="former">Former Smoker</SelectItem>
                    <SelectItem value="current">Current Smoker</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="systolicBp">Systolic Blood Pressure (mmHg) *</Label>
                <Input
                  id="systolicBp"
                  type="number"
                  value={formData.systolicBp}
                  onChange={(e) => handleInputChange('systolicBp', e.target.value)}
                  placeholder="e.g., 120"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="diastolicBp">Diastolic Blood Pressure (mmHg) *</Label>
                <Input
                  id="diastolicBp"
                  type="number"
                  value={formData.diastolicBp}
                  onChange={(e) => handleInputChange('diastolicBp', e.target.value)}
                  placeholder="e.g., 80"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="glucoseLevel">Glucose Level (mg/dL) *</Label>
                <Input
                  id="glucoseLevel"
                  type="number"
                  value={formData.glucoseLevel}
                  onChange={(e) => handleInputChange('glucoseLevel', e.target.value)}
                  placeholder="e.g., 95"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="hasDiabetes">Pre-existing Diabetes *</Label>
                <Select value={formData.hasDiabetes} onValueChange={(value) => handleInputChange('hasDiabetes', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select option" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="no">No</SelectItem>
                    <SelectItem value="yes">Yes</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="hasPneumonia">Pre-existing Pneumonia *</Label>
                <Select value={formData.hasPneumonia} onValueChange={(value) => handleInputChange('hasPneumonia', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select option" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="no">No</SelectItem>
                    <SelectItem value="yes">Yes</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex gap-4 pt-4">
              <Button type="button" variant="outline" onClick={handleClose} className="flex-1">
                Cancel
              </Button>
              <Button type="submit" className="flex-1" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  'Calculate Risk Assessment'
                )}
              </Button>
            </div>
          </form>
        ) : (
          <div className="space-y-6 mt-4">
            <div className="flex justify-end gap-4">
              <Button variant="outline" onClick={() => setResults(null)}>
                New Screening
              </Button>
              <Button onClick={handleDownloadReport} className="gap-2">
                <Download className="w-4 h-4" />
                Download Report
              </Button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {results.map((result: any, index: number) => (
                <div
                  key={result.disease}
                  className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="font-semibold text-sm">{result.disease}</h3>
                    <Badge style={{ backgroundColor: getCategoryColor(result.riskCategory), color: 'white' }}>
                      {result.riskCategory}
                    </Badge>
                  </div>
                  <div className="flex justify-center mb-2">
                    <RiskGauge value={result.riskScore} size={100} />
                  </div>
                  <p className="text-center text-sm text-muted-foreground">{result.riskScore}% Risk</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

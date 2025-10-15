import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Download, Edit, Loader2 } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import RiskResultCard from '@/components/RiskResultCard';
import { calculatePatientRisksAsync } from '@/lib/predictions';
import { generatePatientReport } from '@/lib/pdfGenerator';
import toast from 'react-hot-toast';

interface FormData {
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

const initialFormData: FormData = {
  age: '',
  gender: '',
  bmi: '',
  systolicBp: '',
  diastolicBp: '',
  fastingGlucose: '',
  totalCholesterol: '',
  smokingStatus: '',
  physicalActivity: '',
  familyHistory: '',
};

const presetProfiles = {
  low: {
    age: '25',
    gender: 'female',
    bmi: '22',
    systolicBp: '110',
    diastolicBp: '70',
    fastingGlucose: '85',
    totalCholesterol: '160',
    smokingStatus: 'never',
    physicalActivity: 'high',
    familyHistory: 'no',
  },
  medium: {
    age: '45',
    gender: 'male',
    bmi: '27',
    systolicBp: '130',
    diastolicBp: '85',
    fastingGlucose: '105',
    totalCholesterol: '210',
    smokingStatus: 'former',
    physicalActivity: 'moderate',
    familyHistory: 'yes',
  },
  high: {
    age: '60',
    gender: 'male',
    bmi: '32',
    systolicBp: '150',
    diastolicBp: '95',
    fastingGlucose: '125',
    totalCholesterol: '250',
    smokingStatus: 'current',
    physicalActivity: 'low',
    familyHistory: 'yes',
  },
};

export default function PatientScreening() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [results, setResults] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const loadPreset = (profile: keyof typeof presetProfiles) => {
    setFormData(presetProfiles[profile]);
    toast.success(`Loaded ${profile} risk profile`);
  };

  const resetForm = () => {
    setFormData(initialFormData);
    setResults(null);
    toast.success('Form reset');
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
      const riskResults = await calculatePatientRisksAsync(formData as any);
      setResults(riskResults);
      toast.success('Risk assessment complete!');
    } catch (error) {
      console.error('Failed to calculate predictions:', error);
      toast.error('Failed to calculate risks');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownloadReport = () => {
    if (results) {
      generatePatientReport(formData, results);
      toast.success('Report downloaded!');
    }
  };

  const handleEditForm = () => {
    setResults(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-background">
      <TooltipProvider>
        {/* Modern OneCare Branding Header */}
        <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Button variant="ghost" size="icon" className="rounded-full" onClick={() => navigate('/dashboard')}> <ArrowLeft className="h-5 w-5" /> </Button>
                <div className="rounded-full gradient-primary p-1">
                  <div className="rounded-full w-10 h-10 overflow-hidden flex items-center justify-center bg-black">
                    <video
                      src="/assests/6.mp4"
                      className="w-full h-full object-cover"
                      autoPlay
                      loop
                      muted
                    />
                  </div>
                </div>
                <span className="text-2xl font-bold text-foreground">OneCare</span>
              </div>
              <h1 className="text-xl font-bold text-primary">Preventive Health Screening</h1>
              <div className="w-32" />
            </div>
          </div>
        </header>

        <div className="container mx-auto px-4 py-8">
          <AnimatePresence mode="wait">
            {!results ? (
              <motion.div
                key="form"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4 }}
              >
                <Card className="max-w-4xl mx-auto shadow-lg border-0 bg-gradient-card">
                  <CardHeader>
                    <CardTitle className="text-3xl font-bold text-primary">Health Risk Assessment Form</CardTitle>
                    <CardDescription className="text-base text-muted-foreground">
                      Complete all fields for an accurate multi-disease risk prediction
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {/* Preset Buttons */}
                    <div className="mb-6 flex gap-2 flex-wrap">
                      <Button type="button" variant="outline" className="rounded-full border-primary text-primary hover:bg-primary/10" size="sm" onClick={() => loadPreset('low')}>Low Risk Profile</Button>
                      <Button type="button" variant="outline" className="rounded-full border-primary text-primary hover:bg-primary/10" size="sm" onClick={() => loadPreset('medium')}>Medium Risk Profile</Button>
                      <Button type="button" variant="outline" className="rounded-full border-primary text-primary hover:bg-primary/10" size="sm" onClick={() => loadPreset('high')}>High Risk Profile</Button>
                      <Button type="button" variant="outline" className="rounded-full border-secondary text-secondary hover:bg-secondary/10" size="sm" onClick={resetForm}>Reset Form</Button>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Age */}
                        <div className="space-y-2">
                          <Label htmlFor="age">
                            Age <span className="text-destructive">*</span>
                          </Label>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Input
                                id="age"
                                type="number"
                                value={formData.age}
                                onChange={(e) => handleInputChange('age', e.target.value)}
                                placeholder="e.g., 45"
                                min="1"
                                max="120"
                              />
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Enter age in years (1-120)</p>
                            </TooltipContent>
                          </Tooltip>
                        </div>

                        {/* Gender */}
                        <div className="space-y-2">
                          <Label htmlFor="gender">
                            Gender <span className="text-destructive">*</span>
                          </Label>
                          <Select
                            value={formData.gender}
                            onValueChange={(value) => handleInputChange('gender', value)}
                          >
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

                        {/* BMI */}
                        <div className="space-y-2">
                          <Label htmlFor="bmi">
                            BMI <span className="text-destructive">*</span>
                          </Label>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Input
                                id="bmi"
                                type="number"
                                step="0.1"
                                value={formData.bmi}
                                onChange={(e) => handleInputChange('bmi', e.target.value)}
                                placeholder="e.g., 24.5"
                                min="10"
                                max="60"
                              />
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Body Mass Index (Normal: 18.5-24.9)</p>
                            </TooltipContent>
                          </Tooltip>
                        </div>

                        {/* Systolic BP */}
                        <div className="space-y-2">
                          <Label htmlFor="systolicBp">
                            Systolic Blood Pressure <span className="text-destructive">*</span>
                          </Label>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Input
                                id="systolicBp"
                                type="number"
                                value={formData.systolicBp}
                                onChange={(e) => handleInputChange('systolicBp', e.target.value)}
                                placeholder="e.g., 120"
                                min="70"
                                max="200"
                              />
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>mmHg (Normal: &lt;120)</p>
                            </TooltipContent>
                          </Tooltip>
                        </div>

                        {/* Diastolic BP */}
                        <div className="space-y-2">
                          <Label htmlFor="diastolicBp">
                            Diastolic Blood Pressure <span className="text-destructive">*</span>
                          </Label>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Input
                                id="diastolicBp"
                                type="number"
                                value={formData.diastolicBp}
                                onChange={(e) => handleInputChange('diastolicBp', e.target.value)}
                                placeholder="e.g., 80"
                                min="40"
                                max="130"
                              />
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>mmHg (Normal: &lt;80)</p>
                            </TooltipContent>
                          </Tooltip>
                        </div>

                        {/* Fasting Glucose */}
                        <div className="space-y-2">
                          <Label htmlFor="fastingGlucose">
                            Fasting Glucose <span className="text-destructive">*</span>
                          </Label>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Input
                                id="fastingGlucose"
                                type="number"
                                value={formData.fastingGlucose}
                                onChange={(e) => handleInputChange('fastingGlucose', e.target.value)}
                                placeholder="e.g., 95"
                                min="50"
                                max="300"
                              />
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>mg/dL (Normal: 70-100)</p>
                            </TooltipContent>
                          </Tooltip>
                        </div>

                        {/* Total Cholesterol */}
                        <div className="space-y-2">
                          <Label htmlFor="totalCholesterol">
                            Total Cholesterol <span className="text-destructive">*</span>
                          </Label>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Input
                                id="totalCholesterol"
                                type="number"
                                value={formData.totalCholesterol}
                                onChange={(e) => handleInputChange('totalCholesterol', e.target.value)}
                                placeholder="e.g., 180"
                                min="100"
                                max="400"
                              />
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>mg/dL (Desirable: &lt;200)</p>
                            </TooltipContent>
                          </Tooltip>
                        </div>

                        {/* Smoking Status */}
                        <div className="space-y-2">
                          <Label htmlFor="smokingStatus">
                            Smoking Status <span className="text-destructive">*</span>
                          </Label>
                          <Select
                            value={formData.smokingStatus}
                            onValueChange={(value) => handleInputChange('smokingStatus', value)}
                          >
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

                        {/* Physical Activity */}
                        <div className="space-y-2">
                          <Label htmlFor="physicalActivity">
                            Physical Activity Level <span className="text-destructive">*</span>
                          </Label>
                          <Select
                            value={formData.physicalActivity}
                            onValueChange={(value) => handleInputChange('physicalActivity', value)}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select level" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="low">Low (Sedentary)</SelectItem>
                              <SelectItem value="moderate">Moderate (1-3 days/week)</SelectItem>
                              <SelectItem value="high">High (4+ days/week)</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        {/* Family History */}
                        <div className="space-y-2">
                          <Label htmlFor="familyHistory">
                            Family History of Chronic Diseases <span className="text-destructive">*</span>
                          </Label>
                          <Select
                            value={formData.familyHistory}
                            onValueChange={(value) => handleInputChange('familyHistory', value)}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select option" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="no">No Known History</SelectItem>
                              <SelectItem value="yes">Yes, Has History</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="flex gap-4 pt-4">
                        <Button type="submit" size="lg" className="flex-1 gradient-primary rounded-full text-primary-foreground font-semibold hover:opacity-90" disabled={isLoading}>
                          {isLoading ? (<><Loader2 className="w-4 h-4 mr-2 animate-spin" />Analyzing...</>) : ('Calculate Risk Assessment')}
                        </Button>
                      </div>
                    </form>
                  </CardContent>
                </Card>
              </motion.div>
            ) : (
              <motion.div
                key="results"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4 }}
                className="space-y-6"
              >
                {/* Action Buttons */}
                <div className="flex gap-4 justify-end">
                  <Button
                    variant="outline"
                    onClick={handleEditForm}
                    className="gap-2"
                  >
                    <Edit className="w-4 h-4" />
                    Edit & Re-run
                  </Button>
                </div>

                {/* Results Header */}
                <Card className="shadow-lg border-0 bg-gradient-card">
                  <CardHeader>
                    <CardTitle className="text-3xl font-bold text-primary">Your Health Risk Assessment</CardTitle>
                    <CardDescription className="text-base text-muted-foreground">
                      Based on the information provided, here are your predicted risks for multiple conditions
                    </CardDescription>
                  </CardHeader>
                </Card>

                {/* Disease Risk Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {results
                    .filter((result: any) => result.disease !== 'No Disease' && result.riskScore > 0)
                    .map((result: any, index: number) => (
                      <RiskResultCard
                        key={result.disease}
                        disease={result.disease}
                        riskScore={result.riskScore}
                        riskCategory={result.riskCategory}
                        featureImportance={result.featureImportance}
                        recommendations={result.recommendations}
                        index={index}
                        originalPatientData={formData}
                      />
                    ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </TooltipProvider>
    </div>
  );
}

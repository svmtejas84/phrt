import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertCircle, Activity, Info, TrendingUp, Download } from 'lucide-react';
import RiskGauge from './RiskGauge';
import { generateSingleDiseaseReport } from '@/lib/pdfGenerator';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Cell } from 'recharts';
import { calculatePatientRisks, type PatientFormData } from '../lib/predictions';

interface RiskResultCardProps {
  disease: string;
  riskScore: number;
  riskCategory: 'No Risk' | 'Low' | 'Medium' | 'High';
  featureImportance: Array<{ feature: string; importance: number }>;
  recommendations: string[];
  index: number;
  originalPatientData?: PatientFormData;
}

const categoryColors = {
  'No Risk': '#10B981',
  'Low': '#22C55E',
  'Medium': '#F59E0B',
  'High': '#EF4444',
};

export default function RiskResultCard({
  disease,
  riskScore,
  riskCategory,
  featureImportance,
  recommendations,
  index,
  originalPatientData,
}: RiskResultCardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Simulator state
  const [simulatorValues, setSimulatorValues] = useState({
    bmi: parseFloat(originalPatientData?.bmi || '25'),
    physicalActivity: originalPatientData?.physicalActivity === 'high' ? 5 : 
                     originalPatientData?.physicalActivity === 'moderate' ? 3 : 1,
    systolicBp: parseFloat(originalPatientData?.systolicBp || '120'),
    fastingGlucose: parseFloat(originalPatientData?.fastingGlucose || '95'),
  });
  
  const [simulatedRisk, setSimulatedRisk] = useState(riskScore);
  const [simulatedCategory, setSimulatedCategory] = useState(riskCategory);

  // Helper function to convert activity days to activity level string
  const getActivityLevel = (days: number): 'low' | 'moderate' | 'high' => {
    if (days >= 4) return 'high';
    if (days >= 2) return 'moderate';
    return 'low';
  };

  // Helper function to calculate risk category
  const calculateRiskCategory = (score: number): 'No Risk' | 'Low' | 'Medium' | 'High' => {
    if (score < 20) return 'No Risk';
    if (score < 40) return 'Low';
    if (score < 60) return 'Medium';
    return 'High';
  };

  // Recalculate risk when simulator values change
  useEffect(() => {
    if (!originalPatientData) return;

    const simulatedPatientData: PatientFormData = {
      ...originalPatientData,
      bmi: simulatorValues.bmi.toString(),
      physicalActivity: getActivityLevel(simulatorValues.physicalActivity),
      systolicBp: simulatorValues.systolicBp.toString(),
      fastingGlucose: simulatorValues.fastingGlucose.toString(),
    };

    const results = calculatePatientRisks(simulatedPatientData);
    const targetDisease = results.find(r => r.disease === disease);
    
    if (targetDisease) {
      setSimulatedRisk(targetDisease.riskScore);
      setSimulatedCategory(targetDisease.riskCategory as any);
    }
  }, [simulatorValues, originalPatientData, disease]);

  const updateSimulatorValue = (key: keyof typeof simulatorValues, value: number) => {
    setSimulatorValues(prev => ({ ...prev, [key]: value }));
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: index * 0.1 }}
      >
        <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer" onClick={() => setIsModalOpen(true)}>
          <CardHeader>
            <div className="flex items-start justify-between">
              <CardTitle className="text-xl">{disease}</CardTitle>
              <Badge
                style={{
                  backgroundColor: categoryColors[riskCategory],
                  color: 'white',
                }}
              >
                {riskCategory}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex justify-center mb-4">
              <RiskGauge value={riskScore} size={120} />
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-foreground">{riskScore}%</p>
              <p className="text-sm text-muted-foreground mt-1">Risk Probability</p>
            </div>
            <div className="grid grid-cols-2 gap-2 mt-4">
              <Button
                variant="outline"
                className="gap-2"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsModalOpen(true);
                }}
              >
                <Info className="w-4 h-4" />
                Details
              </Button>
              <Button
                variant="secondary"
                className="gap-2"
                onClick={(e) => {
                  e.stopPropagation();
                  generateSingleDiseaseReport(originalPatientData || {}, { disease, riskScore, riskCategory, featureImportance, recommendations });
                }}
              >
                <Download className="w-4 h-4" />
                PDF
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl">{disease} - Detailed Analysis</DialogTitle>
            <DialogDescription>
              Explore feature importance, adjust scenarios, and view personalized recommendations
            </DialogDescription>
          </DialogHeader>

          <Tabs defaultValue="importance" className="mt-4">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="importance">Feature Importance</TabsTrigger>
              <TabsTrigger value="simulator">Scenario Simulator</TabsTrigger>
              <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
            </TabsList>

            <TabsContent value="importance" className="space-y-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <TrendingUp className="w-4 h-4" />
                <p>Factors contributing most to your {disease.toLowerCase()} risk</p>
              </div>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={featureImportance}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="feature" angle={-45} textAnchor="end" height={100} />
                  <YAxis />
                  <RechartsTooltip />
                  <Bar dataKey="importance" fill="#0066CC">
                    {featureImportance.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={index < 3 ? '#EF4444' : '#0066CC'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </TabsContent>

            <TabsContent value="simulator" className="space-y-6">
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                <Activity className="w-4 h-4" />
                <p>Adjust factors to see how they affect your risk in real-time</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <Label>BMI: {simulatorValues.bmi.toFixed(1)}</Label>
                  <Slider 
                    value={[simulatorValues.bmi]} 
                    onValueChange={(value) => updateSimulatorValue('bmi', value[0])}
                    min={15} 
                    max={45} 
                    step={0.5}
                    className="w-full"
                  />
                  <div className="text-xs text-muted-foreground">
                    Normal: 18.5-24.9 | Overweight: 25-29.9 | Obese: 30+
                  </div>
                </div>
                <div className="space-y-3">
                  <Label>Physical Activity: {simulatorValues.physicalActivity} days/week</Label>
                  <Slider 
                    value={[simulatorValues.physicalActivity]} 
                    onValueChange={(value) => updateSimulatorValue('physicalActivity', value[0])}
                    min={0} 
                    max={7} 
                    step={1}
                    className="w-full"
                  />
                  <div className="text-xs text-muted-foreground">
                    Low: 0-1 | Moderate: 2-3 | High: 4-7 days
                  </div>
                </div>
                <div className="space-y-3">
                  <Label>Systolic Blood Pressure: {simulatorValues.systolicBp} mmHg</Label>
                  <Slider 
                    value={[simulatorValues.systolicBp]} 
                    onValueChange={(value) => updateSimulatorValue('systolicBp', value[0])}
                    min={90} 
                    max={180} 
                    step={5}
                    className="w-full"
                  />
                  <div className="text-xs text-muted-foreground">
                    Normal: &lt;120 | Elevated: 120-129 | High: 130+
                  </div>
                </div>
                <div className="space-y-3">
                  <Label>Fasting Glucose: {simulatorValues.fastingGlucose} mg/dL</Label>
                  <Slider 
                    value={[simulatorValues.fastingGlucose]} 
                    onValueChange={(value) => updateSimulatorValue('fastingGlucose', value[0])}
                    min={70} 
                    max={200} 
                    step={5}
                    className="w-full"
                  />
                  <div className="text-xs text-muted-foreground">
                    Normal: 70-100 | Prediabetes: 100-125 | Diabetes: 126+
                  </div>
                </div>
              </div>
              <div className="pt-6 space-y-4">
                <div className="flex justify-center">
                  <RiskGauge value={simulatedRisk} size={180} />
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center gap-4">
                    <div>
                      <p className="text-2xl font-bold">{simulatedRisk}%</p>
                      <p className="text-sm text-muted-foreground">Current Risk</p>
                    </div>
                    <div className="text-muted-foreground">→</div>
                    <Badge
                      style={{
                        backgroundColor: categoryColors[simulatedCategory],
                        color: 'white',
                      }}
                      className="text-sm"
                    >
                      {simulatedCategory}
                    </Badge>
                  </div>
                </div>
                <p className="text-center text-sm text-muted-foreground">
                  Risk updates automatically as you adjust the sliders above
                </p>
              </div>
            </TabsContent>

            <TabsContent value="recommendations" className="space-y-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                <AlertCircle className="w-4 h-4" />
                <p>Personalized recommendations based on your risk factors</p>
              </div>
              <div className="space-y-3">
                {recommendations.map((rec, idx) => (
                  <Card key={idx}>
                    <CardContent className="pt-6">
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-semibold">
                          {idx + 1}
                        </div>
                        <p className="text-sm leading-relaxed">{rec}</p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>
    </>
  );
}

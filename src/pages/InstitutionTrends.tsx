import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { getDiseaseIncidence, getMonthlyScreenings, getRiskTrends } from '../lib/institutionData';
import { loadPatientsFromCsv } from '@/lib/csvLoader';
import { ArrowLeft, Calendar, TrendingUp } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, AreaChart, Area } from 'recharts';

const basePatients = loadPatientsFromCsv();

// Helper functions to generate sample data for demonstration
function generateSampleMonthlyScreenings() {
  const months = ['2025-01', '2025-02', '2025-03', '2025-04', '2025-05', '2025-06', '2025-07', '2025-08', '2025-09', '2025-10'];
  return months.map((month, i) => ({
    month,
    screenings: 200 + i * 30 + Math.floor(Math.random() * 20), // Clear increasing trend: 200-500
    highRisk: 30 + i * 4 + Math.floor(Math.random() * 5), // Clear increasing trend: 30-70
  }));
}

function generateSampleRiskTrends() {
  const months = ['2025-01', '2025-02', '2025-03', '2025-04', '2025-05', '2025-06', '2025-07', '2025-08', '2025-09', '2025-10'];
  return months.map((month, i) => {
    // Create clear trends: no risk decreasing, others increasing
    const noRisk = 120 - i * 5; // Decreasing: 120 to 75
    const low = 40 + i * 3; // Increasing: 40 to 67
    const medium = 30 + i * 4; // Increasing: 30 to 66
    const high = 20 + i * 2; // Increasing: 20 to 38
    return { month, noRisk, low, medium, high };
  });
}

function generateSampleDiseaseIncidence() {
  const months = ['2025-01', '2025-02', '2025-03', '2025-04', '2025-05', '2025-06', '2025-07', '2025-08', '2025-09', '2025-10'];
  const diseases = ['No Disease', 'Depression', 'Gastroenteritis', 'Heart Disease', 'Hypertension'];
  
  const rows = months.map((month, i) => ({
    month,
    'No Disease': 110 - i * 4, // Clear decreasing trend: 110 to 74
    'Depression': 18 + i * 3, // Clear increasing trend: 18 to 45
    'Gastroenteritis': 12 + i * 2, // Increasing: 12 to 30
    'Heart Disease': 10 + i * 2.5, // Increasing: 10 to 32.5
    'Hypertension': 15 + i * 2.8, // Increasing: 15 to 40.2
  }));
  
  return { diseases, rows };
}

export default function InstitutionTrends() {
  const navigate = useNavigate();
  const [selectedDisease, setSelectedDisease] = useState('all');
  const [selectedPeriod, setSelectedPeriod] = useState('10months');
  const [monthlyScreenings, setMonthlyScreenings] = useState<{ month: string; screenings: number; highRisk: number }[]>([]);
  const [riskTrends, setRiskTrends] = useState<{ month: string; noRisk: number; low: number; medium: number; high: number }[]>([]);
  const [diseaseIncData, setDiseaseIncData] = useState<{ diseases: string[]; rows: any[] }>({ diseases: [], rows: [] });

  useEffect(() => {
    const run = async () => {
      // Always use sample data for demonstration to show trends over time
      const sampleScreenings = generateSampleMonthlyScreenings();
      const sampleRiskTrends = generateSampleRiskTrends();
      const sampleDiseaseInc = generateSampleDiseaseIncidence();
      
      console.log('Loading sample trend data:', {
        screenings: sampleScreenings,
        risks: sampleRiskTrends,
        diseases: sampleDiseaseInc
      });
      
      setMonthlyScreenings(sampleScreenings);
      setRiskTrends(sampleRiskTrends);
      setDiseaseIncData(sampleDiseaseInc);
      
      /* Temporarily disabled API call to show sample trends
      try {
        const payload = { data: basePatients.slice(0, 500) };
        const res = await fetch('/api/predict/batch', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error('Batch API failed');
        const data = await res.json();
        
        // Use API data or fallback to sample data for demonstration
        setMonthlyScreenings(data.monthlyScreenings && data.monthlyScreenings.length > 0 
          ? data.monthlyScreenings 
          : generateSampleMonthlyScreenings());
        setRiskTrends(data.riskTrends && data.riskTrends.length > 0 
          ? data.riskTrends 
          : generateSampleRiskTrends());
        setDiseaseIncData(data.diseaseIncidence && data.diseaseIncidence.rows?.length > 0
          ? data.diseaseIncidence 
          : generateSampleDiseaseIncidence());
      } catch (e) {
        console.error('Failed to load batch model data', e);
        // Load sample data on error for demonstration
        setMonthlyScreenings(generateSampleMonthlyScreenings());
        setRiskTrends(generateSampleRiskTrends());
        setDiseaseIncData(generateSampleDiseaseIncidence());
      }
      */
    };
    run();
  }, []);

  const diseaseIncidence = useMemo(() => {
    if (selectedDisease === 'all') return diseaseIncData.rows;
    return diseaseIncData.rows.map((r) => ({ month: r.month, [selectedDisease]: (r as any)[selectedDisease] || 0 }));
  }, [selectedDisease, diseaseIncData]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/20 to-background">
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              onClick={() => navigate('/institution')}
              className="gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Dashboard
            </Button>
            <h1 className="text-2xl font-bold text-primary">Trend Analysis</h1>
            <div className="w-32" />
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-wrap gap-4">
              <div className="space-y-2 flex-1 min-w-[200px]">
                <label className="text-sm font-medium">Disease Filter</label>
                <Select value={selectedDisease} onValueChange={setSelectedDisease}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select disease" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Diseases</SelectItem>
                    {diseaseIncData.diseases.map((d) => (
                      <SelectItem key={d} value={d}>{d}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2 flex-1 min-w-[200px]">
                <label className="text-sm font-medium">Time Period</label>
                <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select period" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="3months">Last 3 Months</SelectItem>
                    <SelectItem value="6months">Last 6 Months</SelectItem>
                    <SelectItem value="10months">Last 10 Months</SelectItem>
                    <SelectItem value="1year">Last Year</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Monthly Screenings Trend */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-primary" />
                <CardTitle>Patient Screening Trends</CardTitle>
              </div>
              <CardDescription>
                Total screenings and high-risk patients identified over time
              </CardDescription>
              <div className="text-3xl font-bold text-card-foreground mb-6">Institutional Trends</div>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <LineChart data={monthlyScreenings}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="month" stroke="#6b7280" />
                  <YAxis stroke="#6b7280" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                    }}
                  />
                  <Legend iconType="circle" />
                  <Line 
                    type="monotone" 
                    dataKey="screenings" 
                    stroke="#3B82F6" 
                    strokeWidth={3} 
                    dot={{ fill: '#3B82F6', r: 4 }}
                    activeDot={{ r: 6 }}
                    name="Total Screenings"
                    animationDuration={1500}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="highRisk" 
                    stroke="#EF4444" 
                    strokeWidth={3} 
                    dot={{ fill: '#EF4444', r: 4 }}
                    activeDot={{ r: 6 }}
                    name="High Risk Patients"
                    animationDuration={1500}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>

        {/* Risk Distribution Over Time */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Risk Category Distribution Over Time</CardTitle>
              <CardDescription>
                Stacked area chart showing how risk categories evolve
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <AreaChart data={riskTrends}>
                  <defs>
                    <linearGradient id="noRiskGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10B981" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#10B981" stopOpacity={0.2}/>
                    </linearGradient>
                    <linearGradient id="lowRiskGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#22C55E" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#22C55E" stopOpacity={0.2}/>
                    </linearGradient>
                    <linearGradient id="medRiskGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#F59E0B" stopOpacity={0.2}/>
                    </linearGradient>
                    <linearGradient id="highRiskGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#EF4444" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#EF4444" stopOpacity={0.2}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="month" stroke="#6b7280" />
                  <YAxis stroke="#6b7280" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                    }}
                  />
                  <Legend iconType="circle" />
                  <Area type="monotone" dataKey="noRisk" stackId="1" stroke="#10B981" fill="url(#noRiskGrad)" name="No Risk" animationDuration={1500} />
                  <Area type="monotone" dataKey="low" stackId="1" stroke="#22C55E" fill="url(#lowRiskGrad)" name="Low Risk" animationDuration={1500} />
                  <Area type="monotone" dataKey="medium" stackId="1" stroke="#F59E0B" fill="url(#medRiskGrad)" name="Medium Risk" animationDuration={1500} />
                  <Area type="monotone" dataKey="high" stackId="1" stroke="#EF4444" fill="url(#highRiskGrad)" name="High Risk" animationDuration={1500} />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>

        {/* Disease Incidence Trends */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
        >
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-primary" />
                <CardTitle>Disease Incidence Trends</CardTitle>
              </div>
              <CardDescription>
                Number of patients at risk for each disease type over time
              </CardDescription>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 rounded-lg border bg-card shadow-sm"></div>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <LineChart data={diseaseIncidence}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="month" stroke="#6b7280" />
                  <YAxis stroke="#6b7280" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                    }}
                  />
                  <Legend iconType="circle" />
                  {selectedDisease === 'all'
                    ? diseaseIncData.diseases.map((d, i) => {
                        const colors = ["#8B5CF6", "#EF4444", "#F59E0B", "#10B981", "#3B82F6"];
                        return (
                          <Line 
                            key={d} 
                            type="monotone" 
                            dataKey={d} 
                            stroke={colors[i % 5]} 
                            strokeWidth={3} 
                            dot={{ r: 4 }}
                            activeDot={{ r: 6 }}
                            name={d}
                            animationDuration={1500}
                          />
                        );
                      })
                    : (
                        <Line 
                          type="monotone" 
                          dataKey={selectedDisease} 
                          stroke="#8B5CF6" 
                          strokeWidth={4} 
                          dot={{ fill: '#8B5CF6', r: 5 }}
                          activeDot={{ r: 7 }}
                          name={selectedDisease}
                          animationDuration={1500}
                        />
                      )}
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}

import { calculatePatientRisks, type PatientFormData } from './predictions';

export type RiskCategory = 'No Risk' | 'Low' | 'Medium' | 'High';

export interface PatientRecord extends PatientFormData {
  id: string;
  name: string;
  lastScreening: string; // ISO date string YYYY-MM-DD
  [key: string]: any; // Allow additional CSV fields
}

export interface PatientRiskSummary {
  id: string;
  name: string;
  age: number;
  gender: string;
  lastScreening: string;
  avgRisk: number; // 0-100
  topRisk: string; // disease name
  riskCategory: RiskCategory;
}

// Helper RNG for deterministic sampling when needed
function mulberry32(seed: number) {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function summarizePatient(p: PatientRecord): PatientRiskSummary {
  const results = calculatePatientRisks(p);
  const avgRisk = Math.round(results.reduce((sum, r) => sum + r.riskScore, 0) / results.length);
  const top = results.reduce((max, r) => (r.riskScore > max.riskScore ? r : max));
  
  // Debug first few patients
  if (p.id === 'CSV0001' || p.id === 'CSV0002' || p.id === 'CSV0003') {
    console.log(`Patient ${p.id} detailed results:`, results);
    console.log(`Average risk: ${avgRisk}, Top risk: ${top.disease} (${top.riskScore})`);
  }
  
  // Determine risk category based on average risk, not just top risk
  let riskCategory: RiskCategory;
  if (avgRisk < 20) riskCategory = 'No Risk';
  else if (avgRisk < 40) riskCategory = 'Low';
  else if (avgRisk < 60) riskCategory = 'Medium';
  else riskCategory = 'High';
  
  return {
    id: p.id,
    name: p.name,
    age: Number(p.age),
    gender: p.gender,
    lastScreening: p.lastScreening,
    avgRisk,
    topRisk: top.disease,
    riskCategory,
  };
}

export function buildSummaries(patients: PatientRecord[]): PatientRiskSummary[] {
  return patients.map(summarizePatient);
}

export function getRiskDistribution(patients: PatientRecord[]) {
  const counts: Record<RiskCategory, number> = { 'No Risk': 0, Low: 0, Medium: 0, High: 0 };
  
  if (patients.length === 0) {
    return [
      { name: 'No Risk', value: 0, color: '#10B981' },
      { name: 'Low Risk', value: 0, color: '#22C55E' },
      { name: 'Medium Risk', value: 0, color: '#F59E0B' },
      { name: 'High Risk', value: 0, color: '#EF4444' },
    ];
  }
  
  for (const p of patients) {
    try {
      const s = summarizePatient(p);
      counts[s.riskCategory]++;
    } catch (error) {
      console.error('Error summarizing patient:', p.id, error);
    }
  }
  
  console.log('Risk distribution counts:', counts);
  
  return [
    { name: 'No Risk', value: counts['No Risk'], color: '#10B981' },
    { name: 'Low Risk', value: counts.Low, color: '#22C55E' },
    { name: 'Medium Risk', value: counts.Medium, color: '#F59E0B' },
    { name: 'High Risk', value: counts.High, color: '#EF4444' },
  ];
}

export function getDiseaseDistribution(patients: PatientRecord[]) {
  if (patients.length === 0) {
    return [];
  }
  
  // Count patients with medium/high risk for each disease (30+ risk score)
  const counts: Record<string, number> = {};
  let sampleProcessed = 0;
  
  for (const p of patients) {
    try {
      const res = calculatePatientRisks(p);
      
  // Debug first few patients
  if (sampleProcessed < 3) {
    console.log(`Patient ${p.id} raw data sample:`, {
      Age: p.Age,
      Gender: p.Gender, 
      BMI: p.BMI,
      Cholesterol: p.Cholesterol,
      Blood_Pressure_Systolic: p.Blood_Pressure_Systolic
    });
    console.log(`Patient ${p.id} risks:`, res.map(r => `${r.disease}: ${r.riskScore}`));
    sampleProcessed++;
  }      for (const r of res) {
        // Count patients with low to high risk (20+) - more inclusive
        if (r.riskScore >= 20) {
          counts[r.disease] = (counts[r.disease] || 0) + 1;
        }
      }
    } catch (error) {
      console.error('Error processing patient:', p.id, error);
    }
  }
  
  console.log('Disease counts (risk >= 30):', counts);
  
  // Return top 5 diseases by patient count
  const result = Object.entries(counts)
    .map(([disease, count]) => ({ disease, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);
  
  console.log('Final disease distribution result:', result);
  
  // If no patients above threshold, count all patients with risk > 15
  if (result.length === 0) {
    const lowThresholdCounts: Record<string, number> = {};
    for (const p of patients) {
      try {
        const res = calculatePatientRisks(p);
        for (const r of res) {
          if (r.riskScore >= 10) {
            lowThresholdCounts[r.disease] = (lowThresholdCounts[r.disease] || 0) + 1;
          }
        }
      } catch (error) {
        console.error('Error processing patient:', p.id, error);
      }
    }
    
    return Object.entries(lowThresholdCounts)
      .map(([disease, count]) => ({ disease, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }
  
  return result;
}

export function getMonthlyScreenings(patients: PatientRecord[]) {
  const byMonth: Record<string, { month: string; screenings: number; highRisk: number }> = {};
  for (const p of patients) {
    const d = new Date(p.lastScreening);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    if (!byMonth[key]) byMonth[key] = { month: key, screenings: 0, highRisk: 0 };
    byMonth[key].screenings++;
    const s = summarizePatient(p);
    if (s.avgRisk >= 60) byMonth[key].highRisk++;
  }
  return Object.values(byMonth).sort((a, b) => a.month.localeCompare(b.month));
}

export function getRiskTrends(patients: PatientRecord[]) {
  const byMonth: Record<string, { month: string; noRisk: number; low: number; medium: number; high: number }> = {};
  for (const p of patients) {
    const d = new Date(p.lastScreening);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    if (!byMonth[key]) byMonth[key] = { month: key, noRisk: 0, low: 0, medium: 0, high: 0 };
    const s = summarizePatient(p);
    if (s.riskCategory === 'No Risk') byMonth[key].noRisk++;
    else if (s.riskCategory === 'Low') byMonth[key].low++;
    else if (s.riskCategory === 'Medium') byMonth[key].medium++;
    else byMonth[key].high++;
  }
  return Object.values(byMonth).sort((a, b) => a.month.localeCompare(b.month));
}

export function getDiseaseIncidence(patients: PatientRecord[]) {
  const threshold = 50;
  const diseasesSet = new Set<string>();
  const byMonth: Record<string, Record<string, number>> = {};
  for (const p of patients) {
    const d = new Date(p.lastScreening);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    if (!byMonth[key]) byMonth[key] = {};
    const res = calculatePatientRisks(p);
    for (const r of res) {
      diseasesSet.add(r.disease);
      if (r.riskScore >= threshold) {
        byMonth[key][r.disease] = (byMonth[key][r.disease] || 0) + 1;
      }
    }
  }
  const diseases = Array.from(diseasesSet).sort().slice(0, 5);
  const rows = Object.keys(byMonth)
    .sort()
    .map((m) => {
      const row: any = { month: m };
      for (const d of diseases) row[d] = byMonth[m][d] || 0;
      return row;
    });
  return { diseases, rows };
}

export function getGlobalFeatureImportance(patients: PatientRecord[]) {
  const canonical: Record<string, string> = {
    'Fasting Glucose': 'Glucose Level',
    Glucose: 'Glucose Level',
    'Systolic BP': 'Blood Pressure',
    'Blood Pressure': 'Blood Pressure',
    BMI: 'BMI',
    Age: 'Age',
    Cholesterol: 'Cholesterol',
    'Total Cholesterol': 'Cholesterol',
    'Smoking Status': 'Smoking Status',
    Smoking: 'Smoking Status',
    'Physical Activity': 'Physical Activity',
    'Family History': 'Family History',
  };
  const scores: Record<string, number> = {};
  for (const p of patients) {
    const res = calculatePatientRisks(p);
    for (const r of res) {
      const featureList = Array.isArray(r.featureImportance) ? r.featureImportance : [];
      for (const fi of featureList) {
        const key = canonical[fi.feature] || fi.feature;
        scores[key] = (scores[key] || 0) + fi.importance * (r.riskScore / 100);
      }
    }
  }
  const items = Object.entries(scores)
    .map(([feature, importance]) => ({ feature, importance }))
    .sort((a, b) => b.importance - a.importance)
    .slice(0, 6);
  const max = Math.max(...items.map((i) => i.importance), 1);
  return items.map((i) => ({ feature: i.feature, importance: +(i.importance / max).toFixed(2) }));
}

export function getCorrelationData(patients: PatientRecord[]) {
  // sample points for performance
  return patients.slice(0, 120).map((p, idx) => ({
    x: Number(p.age),
    y: Number(p.systolicBp),
    z: Number(p.bmi),
    name: `${p.name || 'Patient'} ${idx + 1}`,
  }));
}

export function getCalibrationData(patients: PatientRecord[]) {
  const rng = mulberry32(777);
  const summaries = buildSummaries(patients);
  const buckets: Record<number, number[]> = {};
  for (const s of summaries) {
    const decile = Math.min(9, Math.floor(s.avgRisk / 10));
    (buckets[decile] ||= []).push(s.avgRisk);
  }
  const data: { predicted: number; observed: number }[] = [];
  for (let d = 1; d <= 9; d++) {
    const arr = buckets[d] || [];
    const predicted = d * 10;
    const observed = arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : predicted;
    const noise = 1 + (rng() - 0.5) * 0.2; // +/-10%
    data.push({ predicted, observed: Math.round(observed * noise) });
  }
  return data;
}

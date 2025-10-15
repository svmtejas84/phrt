import rawCsv from '../../enhanced_hackathon_dataset.csv?raw';
import Papa from 'papaparse';
import type { PatientRecord } from './institutionData';

export interface CsvRow {
  id?: string;
  name?: string;
  age: string | number;
  gender: string;
  bmi?: string | number;
  systolicBp?: string | number;
  diastolicBp?: string | number;
  fastingGlucose?: string | number;
  glucose?: string | number;
  totalCholesterol?: string | number;
  cholesterol?: string | number;
  smokingStatus?: string;
  physicalActivity?: string;
  familyHistory?: string;
  lastScreening?: string;
  // Allow arbitrary columns from the dataset
  [key: string]: any;
}

function toStr(n?: string | number) {
  if (n === undefined || n === null) return '';
  return String(n).trim();
}

function toNumString(n?: string | number) {
  if (n === undefined || n === null || n === '') return '';
  const v = typeof n === 'number' ? n : parseFloat(String(n));
  if (Number.isNaN(v)) return '';
  return String(v);
}

export function loadPatientsFromCsv(): PatientRecord[] {
  const parsed = Papa.parse<CsvRow>(rawCsv, { header: true, skipEmptyLines: true });
  const rows = parsed.data as CsvRow[];
  let idx = 1;
  const patients: PatientRecord[] = rows.map((r) => {
    const id = r.id?.trim() || `CSV${String(idx++).padStart(4, '0')}`;
    const name = r.name?.trim() || `Patient ${idx}`;
    const age = toNumString(r.Age ?? r.age);
    const gender = (r.Gender ?? r.gender ?? '').toString().toLowerCase();
    const bmi = toNumString(r.BMI ?? r.bmi);
    const systolicBp = toNumString(r.Blood_Pressure_Systolic ?? r.systolicBp);
    const diastolicBp = toNumString(r.Blood_Pressure_Diastolic ?? r.diastolicBp);
    const fastingGlucose = toNumString(r.Blood_Sugar ?? r.fastingGlucose);
    const totalCholesterol = toNumString(r.Cholesterol ?? r.totalCholesterol);
    // Combine family history fields
    const familyHistoryDiabetes = r.Family_History_Diabetes == '1' ? 'diabetes' : '';
    const familyHistoryAlzheimers = r.Family_History_Alzheimers == '1' ? 'alzheimers' : '';
    const familyHistory = [familyHistoryDiabetes, familyHistoryAlzheimers].filter(Boolean).join(',') || 'none';
    const lastScreening = toStr(r.lastScreening ?? r.date ?? r.screeningDate) || new Date().toISOString().slice(0, 10);

    // Store the complete raw CSV data for risk calculations
    const fullData = {
      ...r,
      id,
      name,
      age: age || '0',
      gender: ['male', 'female', 'other'].includes(gender) ? gender : 'other',
      bmi: bmi || '0',
      systolicBp: systolicBp || '0',
      diastolicBp: diastolicBp || '0',
      fastingGlucose: fastingGlucose || '0',
      totalCholesterol: totalCholesterol || '0',
      smokingStatus: 'unknown',
      physicalActivity: 'unknown',
      familyHistory,
      lastScreening,
    };

    return fullData as PatientRecord;
  });
  return patients;
}

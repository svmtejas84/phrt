import { calculatePatientRisks, PatientFormData } from './predictions';

interface Report {
  id: string;
  date: string;
  formData: PatientFormData;
  results: ReturnType<typeof calculatePatientRisks>;
}

const lowRiskProfile: PatientFormData = {
  age: '35',
  gender: 'female',
  bmi: '22',
  systolicBp: '115',
  diastolicBp: '75',
  fastingGlucose: '90',
  totalCholesterol: '180',
  smokingStatus: 'never',
  physicalActivity: 'high',
  familyHistory: 'no',
};

const mediumRiskProfile: PatientFormData = {
  age: '52',
  gender: 'male',
  bmi: '28',
  systolicBp: '135',
  diastolicBp: '88',
  fastingGlucose: '110',
  totalCholesterol: '215',
  smokingStatus: 'former',
  physicalActivity: 'moderate',
  familyHistory: 'yes',
};

const highRiskProfile: PatientFormData = {
  age: '68',
  gender: 'male',
  bmi: '33',
  systolicBp: '155',
  diastolicBp: '96',
  fastingGlucose: '128',
  totalCholesterol: '250',
  smokingStatus: 'current',
  physicalActivity: 'low',
  familyHistory: 'yes',
};

export const mockReports: Report[] = [
  {
    id: 'report-1',
    date: '2025-09-15',
    formData: highRiskProfile,
    results: calculatePatientRisks(highRiskProfile),
  },
  {
    id: 'report-2',
    date: '2024-11-20',
    formData: mediumRiskProfile,
    results: calculatePatientRisks(mediumRiskProfile),
  },
  {
    id: 'report-3',
    date: '2023-05-10',
    formData: lowRiskProfile,
    results: calculatePatientRisks(lowRiskProfile),
  },
];
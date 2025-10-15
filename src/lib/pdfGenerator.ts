import { jsPDF } from "jspdf";
import "jspdf-autotable";
import { InstitutionFormData, PatientFormData } from "./predictions"; // Assuming this is the correct path

// Extend jsPDF with the autoTable plugin
interface jsPDFWithAutoTable extends jsPDF {
  autoTable: (options: any) => jsPDF;
}

export const generateInstitutionReport = (
  formData: InstitutionFormData,
  results: any[]
) => {
  const doc = new jsPDF() as jsPDFWithAutoTable;

  // Title
  doc.setFontSize(20);
  doc.text("Institutional Risk Assessment Report", 10, 20);

  // Patient Information
  doc.setFontSize(12);
  doc.text("Patient Information", 10, 30);

  const patientData = [
    ["Age", formData.age],
    ["Gender", formData.gender],
    ["BMI", formData.bmi],
    ["Smoking Status", formData.smokingStatus],
    ["Systolic BP", formData.systolicBp],
    ["Diastolic BP", formData.diastolicBp],
    ["Glucose Level", formData.glucoseLevel],
    ["Has Diabetes", formData.hasDiabetes],
    ["Has Pneumonia", formData.hasPneumonia],
  ];

  doc.autoTable({
    startY: 35,
    head: [["Field", "Value"]],
    body: patientData,
  });

  // Risk Assessment Results
  doc.text("Risk Assessment Results", 10, (doc as any).lastAutoTable.finalY + 10);

  const resultsData = results.map((result) => [
    result.disease,
    `${result.riskScore.toFixed(2)}%`,
    result.riskCategory,
  ]);

  doc.autoTable({
    startY: (doc as any).lastAutoTable.finalY + 15,
    head: [["Condition", "Risk Score", "Risk Category"]],
    body: resultsData,
  });

  doc.save("institutional-risk-report.pdf");
};

export const generatePatientReport = (formData: any, results: any[]) => {
  const doc = new jsPDF() as jsPDFWithAutoTable;

  // Title
  doc.setFontSize(20);
  doc.text("Health Risk Assessment Report", 10, 20);

  // Patient Information
  doc.setFontSize(12);
  doc.text("Patient Information", 10, 30);

  const patientData = [
    ["Age", formData.age],
    ["Gender", formData.gender],
    ["BMI", formData.bmi],
    ["Systolic BP", formData.systolicBp],
    ["Diastolic BP", formData.diastolicBp],
    ["Fasting Glucose", formData.fastingGlucose],
    ["Total Cholesterol", formData.totalCholesterol],
    ["Smoking Status", formData.smokingStatus],
    ["Physical Activity", formData.physicalActivity],
    ["Family History", formData.familyHistory],
  ];

  doc.autoTable({
    startY: 35,
    head: [["Field", "Value"]],
    body: patientData,
  });

  // Risk Assessment Results
  doc.text("Risk Assessment Results", 10, (doc as any).lastAutoTable.finalY + 10);

  const resultsData = results.map((result) => [
    result.disease,
    `${result.riskScore.toFixed(2)}%`,
    result.riskCategory,
  ]);

  doc.autoTable({
    startY: (doc as any).lastAutoTable.finalY + 15,
    head: [["Condition", "Risk Score", "Risk Category"]],
    body: resultsData,
  });

  doc.save("patient-health-report.pdf");
};

// Generate a focused report for a single disease result from the patient multi-disease assessment
export const generateSingleDiseaseReport = (
  patientData: PatientFormData | any,
  diseaseResult: {
    disease: string;
    riskScore: number;
    riskCategory: string;
    featureImportance?: Array<{ feature: string; importance: number }>;
    recommendations?: string[];
  }
) => {
  if (!diseaseResult) return;

  const doc = new jsPDF() as jsPDFWithAutoTable;

  // Title
  doc.setFontSize(18);
  doc.text(`${diseaseResult.disease} Risk Report`, 10, 16);
  doc.setFontSize(11);
  doc.text(`Generated: ${new Date().toLocaleString()}` , 10, 24);

  // Patient snapshot
  doc.setFontSize(13);
  doc.text("Patient Snapshot", 10, 34);
  const snapshot = [
    ["Age", patientData.age],
    ["Gender", patientData.gender],
    ["BMI", patientData.bmi],
    ["Systolic BP", patientData.systolicBp],
    ["Diastolic BP", patientData.diastolicBp],
    ["Fasting Glucose", patientData.fastingGlucose],
    ["Total Cholesterol", patientData.totalCholesterol],
    ["Smoking Status", patientData.smokingStatus],
    ["Physical Activity", patientData.physicalActivity],
    ["Family History", patientData.familyHistory],
  ];
  doc.autoTable({
    startY: 38,
    head: [["Field", "Value"]],
    body: snapshot,
    styles: { fontSize: 10 },
    headStyles: { fillColor: [0,102,204] },
  });

  const afterSnapshotY = (doc as any).lastAutoTable.finalY + 8;

  // Disease result summary
  doc.setFontSize(13);
  doc.text("Risk Summary", 10, afterSnapshotY);
  doc.autoTable({
    startY: afterSnapshotY + 4,
    head: [["Disease", "Risk Score", "Risk Category"]],
    body: [[
      diseaseResult.disease,
      `${diseaseResult.riskScore.toFixed(0)}%`,
      diseaseResult.riskCategory,
    ]],
    styles: { fontSize: 11 },
    headStyles: { fillColor: [0,102,204] },
  });

  let y = (doc as any).lastAutoTable.finalY + 8;

  // Feature importance
  if (diseaseResult.featureImportance && diseaseResult.featureImportance.length) {
    doc.setFontSize(13);
    doc.text("Key Contributing Factors", 10, y);
    doc.autoTable({
      startY: y + 4,
      head: [["Feature", "Importance"]],
      body: diseaseResult.featureImportance.map(fi => [fi.feature, fi.importance.toString()]),
      styles: { fontSize: 10 },
      headStyles: { fillColor: [0,102,204] },
    });
    y = (doc as any).lastAutoTable.finalY + 8;
  }

  // Recommendations
  if (diseaseResult.recommendations && diseaseResult.recommendations.length) {
    doc.setFontSize(13);
    doc.text("Recommendations", 10, y);
    doc.setFontSize(11);
    let recY = y + 6;
    diseaseResult.recommendations.forEach((rec, idx) => {
      const split = doc.splitTextToSize(`${idx + 1}. ${rec}`, 180);
      doc.text(split, 10, recY);
      recY += split.length * 6;
      if (recY > 270) {
        doc.addPage();
        recY = 20;
      }
    });
  }

  const safeName = diseaseResult.disease.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  doc.save(`${safeName}-risk-report.pdf`);
};
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { useMemo } from "react";

interface PatientRecord {
  Disease: string;
  [key: string]: any;
}

interface DiseaseDetailModalProps {
  disease: string | null;
  patientData: PatientRecord[];
  onClose: () => void;
}

export function DiseaseDetailModal({ disease, patientData, onClose }: DiseaseDetailModalProps) {
  const modalData = useMemo(() => {
    if (!disease) return null;

    const filteredData = patientData.filter(p => p.Disease === disease);

    const symptomCounts: { [symptom: string]: number } = {};
    filteredData.forEach(patient => {
      Object.keys(patient).forEach(key => {
        // Count only if the key is a symptom (value is 1)
        if (key !== 'Disease' && patient[key] === 1) {
          symptomCounts[key] = (symptomCounts[key] || 0) + 1;
        }
      });
    });

    const topSymptoms = Object.entries(symptomCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 7) // Get the top 7 most common symptoms
      .map(([name, count]) => ({ name, count }));
    
    return {
        totalCases: filteredData.length,
        topSymptoms
    };
  }, [disease, patientData]);

  if (!disease || !modalData) return null;

  return (
    <Dialog open={!!disease} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[625px]">
        <DialogHeader>
          <DialogTitle>Detailed Insights for: {disease}</DialogTitle>
          <DialogDescription>
            Analysis based on {modalData.totalCases} diagnosed patient records.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <Card>
            <CardHeader>
              <CardTitle>Most Common Co-occurring Symptoms</CardTitle>
            </CardHeader>
            <CardContent>
              {modalData.topSymptoms.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={modalData.topSymptoms} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis type="number" allowDecimals={false} />
                        <YAxis type="category" dataKey="name" width={120} />
                        <RechartsTooltip cursor={{ fill: 'rgba(206, 212, 218, 0.3)' }} />
                        <Bar dataKey="count" fill="#8884d8" barSize={30} />
                    </BarChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-center text-muted-foreground">Not enough data to determine common symptoms for this disease.</p>
              )}
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}
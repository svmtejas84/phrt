import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Download, FileText } from 'lucide-react';
import { mockReports } from '@/lib/mockReports';
import { generatePatientReport } from '@/lib/pdfGenerator';
import toast from 'react-hot-toast';

export default function ReportsPage() {
  const navigate = useNavigate();

  const handleDownload = (report: (typeof mockReports)[0]) => {
    generatePatientReport(report.formData, report.results);
    toast.success('Report download started!');
  };

  const getOverallRisk = (results: any[]) => {
    const riskScores = { 'No Risk': 0, 'Low': 1, 'Medium': 2, 'High': 3 };
    const highestRisk = results.reduce((max, r) => {
      return riskScores[r.riskCategory] > riskScores[max.riskCategory] ? r : max;
    });
    return highestRisk.riskCategory;
  };

  const getRiskBadgeVariant = (risk: string) => {
    if (risk === 'High') return 'destructive';
    if (risk === 'Medium') return 'secondary';
    return 'default';
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Button variant="ghost" onClick={() => navigate('/dashboard')} className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              Back to Dashboard
            </Button>
            <h1 className="text-2xl font-bold text-primary">Your Reports</h1>
            <div className="w-48" /> {/* Spacer */}
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          <div className="flex items-start gap-4 bg-white p-6 rounded-lg border">
            <FileText className="w-8 h-8 text-primary flex-shrink-0 mt-1" />
            <div>
              <h2 className="text-xl font-semibold">Your Health Report History</h2>
              <p className="text-muted-foreground mt-1">
                Here is a list of your previous health risk assessments. You can download a detailed PDF for each report to review or share with your healthcare provider.
              </p>
            </div>
          </div>

          {mockReports.map((report) => {
            const overallRisk = getOverallRisk(report.results);
            return (
              <Card key={report.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle>Health Assessment - {report.date}</CardTitle>
                      <CardDescription>
                        Screening performed on {new Date(report.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                      </CardDescription>
                    </div>
                    <Badge variant={getRiskBadgeVariant(overallRisk)} className="capitalize">
                      {overallRisk} Overall Risk
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    This report includes a detailed analysis of your risk for conditions such as Cardiovascular Disease, Type 2 Diabetes, and Hypertension based on the data provided at the time.
                  </p>
                </CardContent>
                <CardFooter>
                  <Button onClick={() => handleDownload(report)} className="gap-2 ml-auto">
                    <Download className="w-4 h-4" />
                    Download PDF
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      </main>
    </div>
  );
}
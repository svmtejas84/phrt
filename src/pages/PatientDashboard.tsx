import React, { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import PatientInfoCard from "@/components/PatientInfoCard";
import RiskResultCard from "@/components/RiskResultCard";
import { loadPatientsFromCsv } from "../lib/csvLoader";
import { calculatePatientRisks } from "../lib/predictions";

// A reusable Dropdown Menu component for the user profile
function DropdownMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Effect to handle clicks outside the dropdown to close it
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    // Bind the event listener
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      // Unbind the event listener on clean up
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownRef]);

  // Handles the logout action
  const handleLogout = () => {
    localStorage.clear(); // Clear user session/token
    window.location.href = '/signin'; // Redirect to sign-in page
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <Button
        className="rounded-full gradient-primary text-primary-foreground font-semibold hover:opacity-90 px-4 py-2 h-10 flex items-center gap-2"
        onClick={() => setIsOpen(!isOpen)}
        type="button"
        aria-haspopup="true"
        aria-expanded={isOpen}
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-user h-4 w-4"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
        Profile
      </Button>
      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-card border border-border rounded-lg shadow-lg z-50 py-1">
          <Link to="/profile" className="block px-4 py-2 text-sm text-foreground hover:bg-muted" onClick={() => setIsOpen(false)}>
            Edit Profile
          </Link>
          <Link to="/settings" className="block px-4 py-2 text-sm text-foreground hover:bg-muted" onClick={() => setIsOpen(false)}>
            Settings
          </Link>
          <button
            onClick={handleLogout}
            className="block w-full text-left px-4 py-2 text-sm text-destructive hover:bg-muted"
          >
            Logout
          </button>
        </div>
      )}
    </div>
  );
}


const PatientDashboard = () => {
  // Load first patient from CSV dataset
  const patients = loadPatientsFromCsv();
  const patient = patients[0];
  const riskResults = calculatePatientRisks(patient);

  return (
    <div className="min-h-screen bg-background">
      {/* Modern OneCare Branding Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="rounded-full gradient-primary p-1">
                <div className="rounded-full bg-card w-10 h-10 flex items-center justify-center">
                  <span className="text-xl font-bold text-primary-foreground">O</span>
                </div>
              </div>
              <span className="text-2xl font-bold text-foreground">OneCare</span>
            </div>
            <div className="flex gap-2 items-center">
              <Button asChild className="rounded-full border-primary text-primary hover:bg-primary/10" title="Start Preventive Screening">
                <Link to="/screening" className="flex items-center gap-2">Start Preventive Screening</Link>
              </Button>
              <Button asChild className="rounded-full border-secondary text-secondary hover:bg-secondary/10" title="Reports">
                <Link to="/reports" className="flex items-center gap-2">Reports</Link>
              </Button>
              {/* Profile Dropdown Menu */}
              <DropdownMenu />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12">
        <PatientInfoCard name={patient.name} age={Number(patient.age)} gender={patient.gender} />

        <div className="mb-6">
          <h2 className="text-2xl font-bold text-foreground mb-2">Disease Risk Analysis</h2>
          <p className="text-muted-foreground">AI-powered predictive health insights based on medical parameters</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {riskResults.map((result: any, index: number) => (
            <RiskResultCard
              key={result.disease}
              disease={result.disease}
              riskScore={result.riskScore}
              riskCategory={result.riskCategory}
              featureImportance={result.featureImportance}
              recommendations={result.recommendations}
              index={index}
              originalPatientData={patient}
            />
          ))}
        </div>

        {/* Individual Disease Screening Section */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold text-foreground mb-4">Check Individual Disease Risk</h2>
          <p className="text-muted-foreground mb-6">Select a disease below to run a focused preventive screening for that condition.</p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {riskResults.map((result: any, index: number) => (
              <Card key={result.disease} className="h-full animate-fade-in bg-gradient-card border-0 shadow-lg" style={{ animationDelay: `${index * 0.1}s` }}>
                <CardHeader>
                  <CardTitle className="text-lg text-primary font-bold">{result.disease}</CardTitle>
                </CardHeader>
                <CardContent>
                  <Button className="w-full rounded-full gradient-primary text-primary-foreground font-semibold hover:opacity-90" asChild>
                    <Link to={`/screening/${encodeURIComponent(result.disease)}`}>
                      Go to Screening
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default PatientDashboard;
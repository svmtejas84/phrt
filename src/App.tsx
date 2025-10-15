import { Toaster } from "@/components/ui/toaster";
import CustomCursor from "./components/CustomCursor";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./App.css";
import Index from "./pages/Index";
import PatientDashboard from "./pages/PatientDashboard";
import NotFound from "./pages/NotFound";
import PatientScreening from "./pages/PatientScreening";
import InstitutionDashboard from "./pages/InstitutionDashboard";
import InstitutionInsights from "./pages/InstitutionInsights";
import InstitutionTrends from "./pages/InstitutionTrends";
// --- Import the new ReportsPage ---
import ReportsPage from "./pages/ReportsPage";
// --- Import DiseaseScreeningPage for individual disease screening ---
import DiseaseScreeningPage from "./pages/DiseaseScreeningPage";
// --- Import new Dashboard and PredictDisease components ---
import Dashboard from "./pages/Dashboard";
import PredictDisease from "./pages/PredictDisease";
import SignIn from "./pages/SignIn";
import SignUp from "./pages/SignUp";
import Profile from "./pages/Profile";
// --- Import Loading and Page Loading Hook ---
import Loading from "./components/Loading";
import { usePageLoading } from "./hooks/usePageLoading";

const queryClient = new QueryClient();

const AppContent = () => {
  const isLoading = usePageLoading(800); // 800ms loading delay

  return (
    <>
      <CustomCursor />
      {isLoading && <Loading fullScreen message="Loading page..." />}
      <Routes>
        <Route path="/" element={<Index />} />
          
          {/* New modern dashboard for patient disease screening */}
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/predict/:diseaseId" element={<PredictDisease />} />
          <Route path="/signin" element={<SignIn />} />
          <Route path="/signup" element={<SignUp />} />
          
          {/* Legacy patient dashboard */}
          <Route path="/patient" element={<PatientDashboard />} />
          <Route path="/profile" element={<Profile />} />
          
          {/* --- Add route for the new ReportsPage --- */}
          <Route path="/reports" element={<ReportsPage />} />

          <Route path="/screening" element={<PatientScreening />} />
          <Route path="/screening/:disease" element={<DiseaseScreeningPage />} />
          <Route path="/institution" element={<InstitutionDashboard />} />
          <Route path="/institution/insights" element={<InstitutionInsights />} />
          <Route path="/institution/trends" element={<InstitutionTrends />} />

          <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
import { Link } from "react-router-dom";
import { Heart, Activity, Brain, Wind, Droplets, Stethoscope, Pill, Thermometer, CloudRain, LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

type RiskLevel = "low" | "medium" | "high";

interface DiseaseCardProps {
  name: string;
  id: string;
  symptomSummary: string;
  icon?: LucideIcon;
  parameters?: string[];
  riskLevel?: RiskLevel;
  riskScore?: number;
  description?: string;
  symptoms?: string[];
  image?: string;
}

const iconMap: Record<string, any> = {
  "heart-disease": Heart,
  "diabetes": Droplets,
  "hypertension": Activity,
  "alzheimers": Brain,
  "influenza": Wind,
  "pneumonia": Stethoscope,
  "kidney-disease": Pill,
  "gastroenteritis": Thermometer,
  "depression": CloudRain
};

export const DiseaseCard = ({ name, id, symptomSummary, icon, parameters, riskLevel, riskScore, description, symptoms, image }: DiseaseCardProps) => {
  // New card style for dashboard
  if (id && symptomSummary) {
    const Icon = iconMap[id] || Heart;
    return (
      <Card className="group relative overflow-hidden rounded-3xl border-border p-6 shadow-soft transition-smooth hover:shadow-hover hover:scale-105 animate-fade-in">
        {id === 'pneumonia' && (
          <div className="absolute inset-0 opacity-50 bg-[url('/src/assets/lungs.jpeg')] bg-cover bg-center z-0" />
        )}
        {id === 'alzheimers' && (
          <div className="absolute inset-0 opacity-50 bg-[url('/src/assets/alz.jpeg')] bg-cover bg-center z-0" />
        )}
        {id === 'heart-disease' && (
          <div className="absolute inset-0 opacity-50 bg-[url('/src/assets/heart-disease.jpg')] bg-cover bg-center z-0" />
        )}
        {id === 'diabetes' && (
          <div className="absolute inset-0 opacity-50 bg-[url('/src/assets/diabetes.jpg')] bg-cover bg-center z-0" />
        )}
        {id === 'hypertension' && (
          <div className="absolute inset-0 opacity-50 bg-[url('/src/assets/hypertension.jpg')] bg-cover bg-center z-0" />
        )}
        {id === 'depression' && (
          <div className="absolute inset-0 opacity-50 bg-[url('/src/assets/depression.jpeg')] bg-cover bg-center z-0" />
        )}
        {id === 'gastroenteritis' && (
          <div className="absolute inset-0 opacity-50 bg-[url('/src/assets/gas.jpeg')] bg-cover bg-center z-0" />
        )}
        {id === 'influenza' && (
          <div className="absolute inset-0 opacity-50 bg-[url('/src/assets/influenza.jpg')] bg-cover bg-center z-0" />
        )}
        {id === 'kidney-disease' && (
          <div className="absolute inset-0 opacity-50 bg-[url('/src/assets/kidney.jpeg')] bg-cover bg-center z-0" />
        )}
        <div className="relative z-10 flex flex-col items-start space-y-4">
          <div className="rounded-2xl bg-primary/20 p-3">
            <Icon className="h-8 w-8 text-primary-foreground" />
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-bold text-foreground mb-2">{name}</h3>
            <p className="text-sm text-muted-foreground">{symptomSummary}</p>
          </div>
          <Link to={`/predict/${id}`} className="self-end">
            <Button className={`rounded-full px-6 font-semibold transition-smooth ${id === 'influenza' ? 'bg-transparent text-foreground border border-border' : 'bg-[rgba(81,112,255,0.8)] text-primary-foreground hover:opacity-90'}`}>
              Predict Now
            </Button>
          </Link>
        </div>
      </Card>
    );
  }

  // Original card style for existing functionality
  const Icon = icon || Heart;
  const getRiskColor = (level: RiskLevel) => {
    switch (level) {
      case "low":
        return "bg-success text-success-foreground";
      case "medium":
        return "bg-warning text-warning-foreground";
      case "high":
        return "bg-destructive text-destructive-foreground";
    }
  };

  const getRiskText = (level: RiskLevel) => {
    switch (level) {
      case "low":
        return "Low Risk";
      case "medium":
        return "Medium Risk";
      case "high":
        return "High Risk";
    }
  };

  return (
    <div className="group bg-gradient-card rounded-xl overflow-hidden shadow-card hover:shadow-card-hover transition-all duration-300 hover:-translate-y-1 cursor-pointer border border-border/50 flex flex-col">
      <div className="relative h-48 overflow-hidden">
        <img src={image} alt={name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" />
        <div className="absolute top-4 right-4 w-12 h-12 rounded-lg bg-gradient-primary flex items-center justify-center shadow-md">
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
      
      <div className="p-6 flex flex-col flex-grow">
        <h3 className="text-xl font-bold text-foreground mb-3">{name}</h3>
      
      <div className="flex flex-wrap gap-2 mb-3">
        {parameters.map((param, index) => (
          <span
            key={index}
            className="px-2.5 py-1 bg-accent/50 text-accent-foreground text-xs rounded-full font-medium border border-primary/10"
          >
            {param}
          </span>
        ))}
      </div>

        <p className="text-sm text-muted-foreground mb-4">{description}</p>

        <div className="mb-4">
          <h4 className="text-sm font-semibold text-foreground mb-2">Common Symptoms:</h4>
          <ul className="space-y-1">
            {symptoms.map((symptom, index) => (
              <li key={index} className="text-sm text-muted-foreground flex items-start">
                <span className="text-primary mr-2">•</span>
                {symptom}
              </li>
            ))}
          </ul>
        </div>

        <div className="flex justify-end mt-auto pt-4">
          <button className="px-4 py-2 text-white rounded-lg text-sm font-medium hover:shadow-lg transition-all duration-300 hover:scale-105 bg-[linear-gradient(90deg,#5170ff,#ff66c4)]">
            Predict Now
          </button>
        </div>
      </div>
    </div>
  );
};

export default DiseaseCard;

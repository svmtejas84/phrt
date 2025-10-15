import { User } from "lucide-react";

interface PatientInfoCardProps {
  name: string;
  age: number;
  gender: string;
}

const PatientInfoCard = ({ name, age, gender }: PatientInfoCardProps) => {
  return (
    <div className="bg-gradient-soft rounded-2xl p-8 shadow-card mb-8 animate-fade-in">
      <div className="flex items-center gap-6">
        <div className="w-20 h-20 rounded-full bg-gradient-primary flex items-center justify-center shadow-lg">
          <User className="w-10 h-10 text-white" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">{name}</h1>
          <div className="flex gap-6 text-muted-foreground">
            <div>
              <span className="text-sm font-medium">Age:</span>
              <span className="ml-2 text-lg font-semibold text-foreground">{age}</span>
            </div>
            <div className="h-6 w-px bg-border" />
            <div>
              <span className="text-sm font-medium">Gender:</span>
              <span className="ml-2 text-lg font-semibold text-foreground">{gender}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientInfoCard;

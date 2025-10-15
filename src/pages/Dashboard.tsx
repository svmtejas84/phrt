import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { DiseaseCard } from "@/components/DiseaseCard";
import { diseases } from "@/lib/diseaseData";
import { FileText, User, Activity, LogOut, Edit, Loader2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

interface ProfileData {
  name?: string;
  age?: number;
  gender?: string;
}

const Dashboard = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return; // Not logged in
    const controller = new AbortController();
    const fetchProfile = async () => {
      try {
        setLoadingProfile(true);
        const base = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";
        const res = await fetch(`${base}/api/profile`, {
          headers: { Authorization: `Bearer ${token}` },
          signal: controller.signal,
        });
        if (!res.ok) throw new Error("Profile fetch failed");
        const data = await res.json();
        setProfile(data.profile || {});
      } catch (e) {
        // Silently fail; could add toast if desired
        console.warn("Profile load error", e);
      } finally {
        setLoadingProfile(false);
      }
    };
    fetchProfile();
    return () => controller.abort();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header Section */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="rounded-full gradient-primary p-1">
                <div className="rounded-full w-12 h-12 overflow-hidden flex items-center justify-center bg-black">
                  <video
                    src="/assests/6.mp4"
                    className="w-full h-full object-cover"
                    autoPlay
                    loop
                    muted
                  />
                </div>
              </div>
              <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-[linear-gradient(90deg,#5170ff,#ff66c4)]">OneCare</h1>
            </div>
            <div className="flex space-x-3">
              <Link to="/screening">
                <Button variant="outline" className="rounded-full border-primary text-primary hover:bg-primary/10">
                  <Activity className="mr-2 h-4 w-4" />
                  Start Preventive Screening
                </Button>
              </Link>
              <Link to="/reports">
              </Link>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button className="rounded-full text-primary-foreground font-semibold hover:opacity-90 bg-[linear-gradient(90deg,#5170ff,#ff66c4)]">
                    {loadingProfile ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <User className="mr-2 h-4 w-4" />
                    )}
                    {profile?.name ? profile.name.split(" ")[0] : "Profile"}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>
                    <div className="flex flex-col">
                      <span className="font-semibold text-sm">
                        {profile?.name || "Unnamed User"}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {profile?.age ? `Age: ${profile.age}` : "Age: -"} {" "}
                        {profile?.gender ? `| ${profile.gender}` : ""}
                      </span>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onSelect={(e) => { e.preventDefault(); navigate('/profile'); }}>
                    <Edit className="mr-2 h-4 w-4" /> Edit Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem onSelect={(e) => { e.preventDefault(); navigate('/'); }} className="text-destructive focus:text-destructive">
                    <LogOut className="mr-2 h-4 w-4" /> Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </header>

      {/* Welcome Section */}
      <section className="container mx-auto px-4 py-12">
        <div className="text-center mb-12 animate-fade-in">
          <h2 className="text-4xl font-bold mb-2 bg-clip-text text-transparent bg-[linear-gradient(90deg,#5170ff,#ff66c4)]">
            {profile?.name ? `Welcome, ${profile.name}` : "Welcome"}
          </h2>
        </div>

        {/* Disease Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
          {diseases.map((disease, index) => (
            <div key={disease.id} className={`[animation-delay:${index * 100}ms]`}>
              <DiseaseCard {...disease} />
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border mt-20 py-8">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          <p>© 2025 OneCare | AI-Powered Health Prediction System</p>
        </div>
      </footer>
    </div>
  );
};

export default Dashboard;
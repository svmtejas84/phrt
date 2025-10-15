import ProfileHeader from "@/components/ProfileHeader";
import ProfileCard from "@/components/ProfileCard";
import HealthSummary from "@/components/HealthSummary";
import { useEffect, useState } from "react";

const Profile = () => {
  // Example: fetch profile from backend
  const [profile, setProfile] = useState<any>(null);
  useEffect(() => {
    const token = localStorage.getItem('token');
    const base = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
    fetch(`${base}/api/profile`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => setProfile(data.profile))
      .catch(() => setProfile(null));
  }, []);

  // TODO: Add update logic and pass profile data to ProfileHeader/ProfileCard
  return (
    <div className="min-h-screen bg-[image:var(--gradient-care)] relative overflow-hidden">
      <main className="relative container max-w-4xl mx-auto px-4 py-8 md:py-12">
        <ProfileHeader />
        <ProfileCard />
        <HealthSummary />
      </main>
    </div>
  );
};

export default Profile;

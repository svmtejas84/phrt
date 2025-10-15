import { Heart } from "lucide-react";

const ProfileHeader = () => {
  return (
    <div className="text-center mb-8 animate-fade-in">
      <h1 className="text-3xl md:text-4xl font-semibold text-foreground mb-2">
        Hi! Welcome to One Care{" "}
        <Heart className="inline-block text-primary fill-primary w-7 h-7" />
      </h1>
      <p className="text-muted-foreground text-sm md:text-base">
        Your personal digital health assistant
      </p>
    </div>
  );
};

export default ProfileHeader;

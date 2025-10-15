import heroImage from "@/assets/hero-healthcare-professional.png";
import { Button } from "./ui/button";
import { useNavigate } from "react-router-dom";

const HeroSection = () => {
  const navigate = useNavigate();
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden p-0 m-0">
      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        data-bg="hero"
        style={{ backgroundImage: `url(${heroImage})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-background/95 via-background/70 to-transparent" />
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-2xl py-16 md:py-24">
          <p className="text-primary text-lg md:text-xl font-semibold mb-6 animate-fade-in">
            Medical And Health
          </p>
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-foreground mb-6 leading-tight animate-fade-in">
            A professional and friendly care provider.
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground font-medium animate-fade-in mb-8">
            Where One Prediction Can Save a Life...
          </p>
          {/* Call to Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 animate-fade-in">
            <Button
              onClick={() => navigate('/signup')}
              size="lg"
              className="text-white px-8 py-4 text-lg font-semibold rounded-full shadow-lg hover:shadow-xl transition-all duration-300"
              style={{ background: 'linear-gradient(90deg, #5170ff, #ff66c4)' }}
            >
              Get Started
            </Button>
            <Button
              onClick={() => navigate('/signin')}
              variant="outline"
              size="lg"
              className="border-2 border-primary text-primary hover:bg-primary hover:text-white px-8 py-4 text-lg font-semibold rounded-full transition-all duration-300"
            >
              Sign In
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;

import { Button } from "./ui/button";
// Heart icon SVG inline to avoid import issues
import { useNavigate } from "react-router-dom";

const Navigation = () => {
  const navigate = useNavigate();
  return (
    <nav className="relative bg-white shadow-sm">
      <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-transparent to-secondary/10 pointer-events-none" />
      <div className="container mx-auto px-4 relative">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}> 
            <div className="w-12 h-12 rounded-full overflow-hidden flex items-center justify-center shadow-lg bg-black">
              <video
                src="/assests/6.mp4"
                className="w-full h-full object-cover"
                autoPlay
                loop
                muted
              />
            </div>
            <span className="text-2xl font-bold gradient-text">
              OneCare
            </span>
          </div>

          {/* Login Button */}
          <Button
            variant="secondary"
            onClick={() => navigate('/signin')}
            className="text-white hover:shadow-glow px-8 py-6 rounded-full font-semibold"
            style={{ background: 'linear-gradient(90deg, #5170ff, #ff66c4)' }}
          >
            Login/Sign up
          </Button>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;

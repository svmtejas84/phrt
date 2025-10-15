import { MapPin, Mail, Phone } from "lucide-react";

const TopBar = () => {
  return (
    <div className="bg-gradient-to-r from-background via-muted to-background border-b border-border py-0">
      <div className="w-full flex flex-wrap justify-center md:justify-between items-center gap-4 text-sm m-0 p-0">
        <div className="flex items-center gap-2 text-muted-foreground">
          <MapPin className="w-4 h-4 text-primary" />
          <span>Banaaluru Karnataka</span>
        </div>
        <div className="flex items-center gap-2 text-muted-foreground">
          <Mail className="w-4 h-4 text-primary" />
          <a href="mailto:Onecare@email.com" className="hover:text-primary transition-colors">
            Onecare@email.com
          </a>
        </div>
        <div className="flex items-center gap-2 text-muted-foreground">
          <Phone className="w-4 h-4 text-primary" />
          <a href="tel:+885648674687" className="hover:text-primary transition-colors">
            +88 564 867 4687
          </a>
        </div>
      </div>
    </div>
  );
};

export default TopBar;

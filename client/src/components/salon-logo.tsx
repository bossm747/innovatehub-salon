import { useQuery } from "@tanstack/react-query";
import { Sparkles, Heart } from "lucide-react";

interface SalonLogoProps {
  className?: string;
  showSubtext?: boolean;
  size?: "sm" | "md" | "lg";
  showImage?: boolean;
}

export default function SalonLogo({ 
  className = "", 
  showSubtext = false, 
  size = "md",
  showImage = true 
}: SalonLogoProps) {
  const { data: profileData } = useQuery({
    queryKey: ["/api/settings/profile"],
  });

  const businessName = (profileData as any)?.businessName || "JustPause";
  const businessType = (profileData as any)?.businessType || "both";

  const getSubtext = () => {
    switch (businessType) {
      case "spa":
        return "Wellness & Beauty";
      case "salon":
        return "Hair & Beauty";
      case "both":
        return "Salon & Spa";
      default:
        return "Beauty & Wellness";
    }
  };

  const getSizeClasses = () => {
    switch (size) {
      case "sm":
        return {
          image: "h-12 w-auto",
          text: "text-2xl",
          subtext: "text-xs"
        };
      case "lg":
        return {
          image: "h-24 md:h-32 w-auto",
          text: "text-4xl md:text-5xl",
          subtext: "text-sm"
        };
      default:
        return {
          image: "h-16 md:h-20 w-auto",
          text: "text-3xl md:text-4xl",
          subtext: "text-xs"
        };
    }
  };

  const sizeClasses = getSizeClasses();

  return (
    <div className={`relative flex items-center justify-center gap-4 ${className}`}>
      {/* Logo Image */}
      <div>
        <img 
          src="/justpause-logo.png" 
          alt="JustPause Salon & Spa" 
          className={sizeClasses.image}
        />
      </div>
      
      {/* Handwritten Text Title */}
      <div className="flex flex-col">
        <h1 
          className={`text-slate-800 font-normal leading-tight ${sizeClasses.text}`}
          style={{
            fontFamily: "'Great Vibes', 'Dancing Script', cursive",
            textShadow: "0 1px 2px rgba(0,0,0,0.1)",
          }}
        >
          JustPause Salon & Spa
        </h1>
        
        {/* Subtext - Only show if explicitly requested */}
        {showSubtext && (
          <p className={`text-slate-500 mt-1 font-medium tracking-wider uppercase ${sizeClasses.subtext}`}>
            {getSubtext()}
          </p>
        )}
      </div>
    </div>
  );
}
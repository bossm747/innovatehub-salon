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
          image: "h-8 w-auto",
          text: "text-lg",
          subtext: "text-xs"
        };
      case "lg":
        return {
          image: "h-16 md:h-20 w-auto",
          text: "text-3xl md:text-4xl",
          subtext: "text-sm"
        };
      default:
        return {
          image: "h-10 md:h-12 w-auto",
          text: "text-xl md:text-2xl",
          subtext: "text-xs"
        };
    }
  };

  const sizeClasses = getSizeClasses();

  return (
    <div className={`relative flex flex-col items-center ${className}`}>
      {/* Decorative elements */}
      <div className="absolute -top-2 -left-2 text-pink-300 opacity-60 animate-pulse">
        <Heart className="h-3 w-3" />
      </div>
      <div className="absolute -top-1 -right-2 text-purple-300 opacity-60 animate-pulse delay-300">
        <Sparkles className="h-3 w-3" />
      </div>
      
      {/* Logo Image */}
      {showImage && (
        <div className="mb-2">
          <img 
            src="/attached_assets/Justpause_1755592468640.png" 
            alt="JustPause Salon & Spa" 
            className={sizeClasses.image}
          />
        </div>
      )}
      
      {/* Main logo text */}
      <div className="relative">
        <h1 
          className={`handwritten-logo text-center bg-gradient-to-r from-slate-800 via-slate-600 to-slate-500 bg-clip-text text-transparent font-light tracking-widest ${sizeClasses.text}`}
          style={{
            fontFamily: "'Inter', 'Helvetica Neue', sans-serif",
            letterSpacing: "0.15em",
            textShadow: "0 1px 2px rgba(0,0,0,0.05)",
          }}
        >
          {businessName.toUpperCase()}
        </h1>
        
        {/* Subtle underline decoration */}
        <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-3/4 h-0.5 bg-gradient-to-r from-transparent via-pink-300 to-transparent opacity-70"></div>
      </div>
      
      {/* Subtext */}
      {showSubtext && (
        <p className={`text-slate-500 mt-1 font-medium tracking-wider uppercase ${sizeClasses.subtext}`}>
          {getSubtext()}
        </p>
      )}
      
      {/* Bottom decorative elements */}
      <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 text-pink-200 opacity-40">
        <Sparkles className="h-2 w-2" />
      </div>
    </div>
  );
}
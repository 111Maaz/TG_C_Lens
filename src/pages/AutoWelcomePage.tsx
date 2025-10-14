import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import SplashCursor from '@/components/ui/SplashCursor';

const AutoWelcomePage: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Auto-redirect after 3 seconds
    const timer = setTimeout(() => {
      navigate('/dashboard');
    }, 3000);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-background/90 flex items-center justify-center relative overflow-hidden">
      {/* Background grid pattern */}
      <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
      
      {/* Fluid cursor effect */}
      <SplashCursor />
      
      {/* Content */}
      <div className="text-center z-10 relative">
        <h1 className="text-4xl md:text-6xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary animate-pulse">
          T•G Crime Lens
        </h1>
        <p className="text-lg md:text-xl text-muted-foreground animate-fade-in">
          Telangana State Crime Analytics Dashboard
        </p>
      </div>
    </div>
  );
};

export default AutoWelcomePage; 
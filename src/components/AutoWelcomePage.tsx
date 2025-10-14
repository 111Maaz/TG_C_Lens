import React, { useEffect, useState } from 'react';
import { Shield } from 'lucide-react';
import SplashCursor from './ui/SplashCursor';

// Define keyframes as a string constant
const keyframesStyles = `
  @keyframes gradientAnimation {
    0% { background-position: 0% 50% }
    50% { background-position: 100% 50% }
    100% { background-position: 0% 50% }
  }

  @keyframes glassReveal {
    0% {
      opacity: 0;
      backdrop-filter: blur(0px);
    }
    100% {
      opacity: 1;
      backdrop-filter: blur(12px);
    }
  }

  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }

  @keyframes slideUp {
    from { transform: translateY(20px); opacity: 0; }
    to { transform: translateY(0); opacity: 1; }
  }

  @keyframes pulse {
    0% { transform: scale(1); }
    50% { transform: scale(1.05); }
    100% { transform: scale(1); }
  }
`;

export const AutoWelcomePage: React.FC = () => {
  // Add the keyframes to the document
  useEffect(() => {
    const styleSheet = document.createElement("style");
    styleSheet.textContent = keyframesStyles;
    document.head.appendChild(styleSheet);
    return () => styleSheet.remove();
  }, []);

  return (
    <div className="relative min-h-screen overflow-hidden bg-black">
      <SplashCursor />
      <div className="relative z-[1] min-h-screen flex items-center justify-center p-6 font-sans">
        <div className="max-w-4xl w-full text-center">
          {/* Main Title */}
          <h1 
            className="text-5xl lg:text-6xl font-bold text-white mb-6"
            style={{ 
              background: 'linear-gradient(45deg, #3b82f6, #8b5cf6)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundSize: '200% 200%',
              animation: 'gradientAnimation 3s ease infinite, fadeIn 0.8s ease-out, pulse 2s infinite'
            }}
          >
            TG Crime Lens
          </h1>
          
          {/* Subtitle with fade-in animation */}
          <p 
            className="text-xl text-gray-300 mb-8"
            style={{ 
              animation: 'slideUp 0.8s ease-out 0.3s both',
              opacity: 0
            }}
          >
            Helping Telangana citizens, journalists, and authorities understand crime trends.
          </p>

          {/* Loading Animation */}
          <div className="flex justify-center">
            <div 
              className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full"
              style={{ animation: 'spin 1s linear infinite' }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

import React, { useEffect, useState } from 'react';
import { Shield, Users, BarChart3, Search } from 'lucide-react';

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

  @keyframes orbit {
    from { 
      transform: translate(-50%, -50%) rotate(0deg) translateX(134px) rotate(0deg);
    }
    to { 
      transform: translate(-50%, -50%) rotate(360deg) translateX(134px) rotate(-360deg);
    }
  }

  @keyframes orbit-lg {
    from { 
      transform: translate(-50%, -50%) rotate(0deg) translateX(150px) rotate(0deg);
    }
    to { 
      transform: translate(-50%, -50%) rotate(360deg) translateX(150px) rotate(-360deg);
    }
  }

  @keyframes glowTrail {
    0%, 100% {
      opacity: 0.6;
      filter: blur(3px);
    }
    50% {
      opacity: 0.3;
      filter: blur(5px);
    }
  }
`;

export const AutoWelcomePage: React.FC = () => {
  const [currentStage, setCurrentStage] = useState(1);
  const [typewriterText, setTypewriterText] = useState('');
  const [progress, setProgress] = useState(0);

  const targetText = 'Developer';

  // Add the keyframes to the document
  useEffect(() => {
    const styleSheet = document.createElement("style");
    styleSheet.textContent = keyframesStyles;
    document.head.appendChild(styleSheet);
    return () => styleSheet.remove();
  }, []);

  useEffect(() => {
    // Typewriter effect for "Developer"
    let index = 0;
    const typewriterInterval = setInterval(() => {
      if (index < targetText.length) {
        setTypewriterText(targetText.slice(0, index + 1));
        index++;
      } else {
        clearInterval(typewriterInterval);
      }
    }, 200);

    // Progress bar
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        return prev + 2; // 50 updates over 5 seconds (100ms each)
      });
    }, 100);

    // Stage transitions
    const stageTimer = setTimeout(() => {
      setCurrentStage(2);
    }, 5000);

    return () => {
      clearInterval(typewriterInterval);
      clearInterval(progressInterval);
      clearTimeout(stageTimer);
    };
  }, []);

  const stageOneCards = [
    {
      icon: <Users className="h-8 w-8 text-blue-600" />,
      title: "For Journalists",
      description: "Access comprehensive crime data for investigative reporting and data-driven stories."
    },
    {
      icon: <BarChart3 className="h-8 w-8 text-green-600" />,
      title: "For Analysts",
      description: "Leverage detailed statistics and trends for policy research and analysis."
    },
    {
      icon: <Search className="h-8 w-8 text-purple-600" />,
      title: "For Citizens",
      description: "Stay informed about safety trends and crime patterns in your area."
    }
  ];

  if (currentStage === 1) {
    return (
      <div className="min-h-screen relative overflow-hidden flex items-center justify-center p-6 animate-fade-in font-mono">
        {/* Animated gradient background */}
        <div 
          className="absolute inset-0 z-0"
          style={{
            background: 'linear-gradient(-45deg, #ee7752, #e73c7e, #23a6d5, #23d5ab)',
            backgroundSize: '400% 400%',
            animation: 'gradientAnimation 15s ease infinite',
            opacity: 0.1
          } as React.CSSProperties}
        />
        
        <div className="max-w-6xl w-full backdrop-blur-sm bg-white/30 p-8 rounded-2xl shadow-xl transition-all duration-500 relative z-10" 
             style={{ animation: 'glassReveal 1s ease-out forwards' } as React.CSSProperties}>
          <div className="flex flex-col lg:flex-row items-center justify-between gap-12">
            {/* Left side content */}
            <div className="flex-1 text-center lg:text-left backdrop-blur-md bg-white/40 p-6 rounded-xl">
              {/* Typewriter text */}
              <div className="text-2xl lg:text-3xl text-gray-600 mb-4 font-mono h-12">
                {typewriterText}
                <span className="animate-pulse">|</span>
              </div>
              
              {/* Main name */}
              <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-8 animate-scale-in font-sans">
                I'm <span className="text-blue-600">Mohammed Maaz Ali</span>
              </h1>


              {/* Progress indicator */}
              <div className="mt-8">
                <div className="bg-gray-200/50 backdrop-blur-sm rounded-full h-2 w-full max-w-md mx-auto lg:mx-0">
                  <div 
                    className="bg-gradient-to-r from-blue-400 to-purple-500 h-2 rounded-full transition-all duration-100 ease-out"
                    style={{ width: `${progress}%` } as React.CSSProperties}
                  ></div>
                </div>
                <p className="text-sm text-gray-500 mt-2">
                  Loading dashboard... {Math.round(progress/20)}s
                </p>
              </div>
            </div>
            
            {/* Right side - Profile image with orbiting ball */}
            <div className="flex-shrink-0">
              <div className="relative backdrop-blur-xl bg-white/50 p-8 rounded-2xl shadow-2xl">
                {/* Orbit container - Matches exact image dimensions */}
                <div className="absolute w-64 h-64 lg:w-72 lg:h-72" style={{ top: '32px', left: '32px' }}>
                  {/* Orbiting ball with gradient trail */}
                  <div 
                    className="absolute w-4 h-4 rounded-full bg-gradient-to-r from-blue-400 to-purple-500"
                    style={{
                      left: '50%',
                      top: '50%',
                      transformOrigin: '50% 50%',
                      animation: 'orbit 4s linear infinite',
                      [`@media (min-width: 1024px)`]: {
                        animation: 'orbit-lg 4s linear infinite'
                      },
                      filter: 'drop-shadow(0 0 6px rgba(99, 102, 241, 0.6))',
                      zIndex: 10
                    } as React.CSSProperties}
                  >
                    {/* Gradient trail effect */}
                    <div 
                      className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-400/40 to-purple-500/40"
                      style={{
                        transform: 'scale(2)',
                        animation: 'glowTrail 2s linear infinite'
                      } as React.CSSProperties}
                    />
                  </div>
                </div>

                {/* Static image container */}
                <div className="relative w-64 h-64 lg:w-72 lg:h-72 rounded-full backdrop-blur-md bg-white/90 p-2 shadow-xl transition-all duration-500">
                  <div className="w-full h-full rounded-full overflow-hidden">
                    <img 
                      src="/Maaz1.jpg" 
                      alt="Mohammed Maaz Ali" 
                      className="w-full h-full rounded-full object-cover"
                      onError={(e) => {
                        const target = e.currentTarget;
                        target.style.display = 'none';
                        const fallback = target.parentElement?.querySelector('div');
                        if (fallback) {
                          fallback.className = "flex items-center justify-center w-full h-full bg-gradient-to-br from-blue-400 to-purple-500 rounded-full";
                        }
                      }}
                    />
                    <div className="hidden">
                      <span className="text-3xl font-bold text-white">MA</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Footer with ID */}
          <div className="text-center mt-12">
            <div className="text-xl text-gray-800 font-mono backdrop-blur-sm bg-white/30 inline-block px-6 py-3 rounded-full">
              Student ID: <span className="font-mono">1604-22-737-</span>
              <span className="bg-yellow-400 px-2 py-1 rounded font-bold text-gray-900 animate-pulse-soft">101</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-100 flex items-center justify-center p-6 animate-fade-in font-sans">
      <div className="max-w-4xl w-full">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            <span className="text-blue-600">T•S Crime Lens</span>
          </h1>
          <p className="text-xl text-gray-600">
            Comprehensive Crime Analytics Dashboard for Telangana State
          </p>
          <div className="flex items-center justify-center gap-4 mt-4">
            <Shield className="h-8 w-8 text-blue-600 animate-float" />
            <span className="text-lg text-gray-700">Empowering Data-Driven Insights</span>
          </div>
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {stageOneCards.map((card, index) => (
            <div 
              key={index} 
              className="bg-white/70 backdrop-blur-sm border border-white/30 p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 animate-fade-in text-center"
              style={{ animationDelay: `${index * 0.2}s` }}
            >
              <div className="flex justify-center mb-4">
                {card.icon}
              </div>
              <h3 className="font-bold text-gray-900 mb-3 text-lg">
                {card.title}
              </h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                {card.description}
              </p>
            </div>
          ))}
        </div>

        {/* How to Use Section */}
        <div className="bg-white/80 backdrop-blur-sm border border-white/30 rounded-2xl p-6 shadow-lg text-center">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">How to Use</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold mt-1">1</div>
              <p className="text-gray-700"><strong>Explore the Map:</strong> View crime intensity across Telangana districts with color-coded markers.</p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold mt-1">2</div>
              <p className="text-gray-700"><strong>Analyze Trends:</strong> Use the analytics dashboard to understand crime patterns over time.</p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold mt-1">3</div>
              <p className="text-gray-700"><strong>Filter Data:</strong> Customize your view by crime type, year, or specific regions.</p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold mt-1">4</div>
              <p className="text-gray-700"><strong>Get Insights:</strong> Click on districts for detailed crime breakdowns and statistics.</p>
            </div>
          </div>
        </div>

        {/* Loading indicator */}
        <div className="text-center mt-8">
          <p className="text-gray-500">Redirecting to dashboard...</p>
          <div className="mt-2 flex justify-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

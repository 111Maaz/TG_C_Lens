import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Users, FileText, Building2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface WelcomeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const userRoles = [
  {
    icon: <FileText className="h-8 w-8 text-blue-500" />,
    title: "Journalists",
    description: "Access comprehensive crime data for investigative reporting and data-driven stories."
  },
  {
    icon: <Users className="h-8 w-8 text-green-500" />,
    title: "Citizens",
    description: "Stay informed about safety trends and crime patterns in your area."
  },
  {
    icon: <Building2 className="h-8 w-8 text-purple-500" />,
    title: "Government",
    description: "Leverage detailed statistics and trends for policy research and analysis."
  }
];

export const WelcomeModal: React.FC<WelcomeModalProps> = ({ isOpen, onClose }) => {
  const [currentRole, setCurrentRole] = useState(0);
  const [isTouch, setIsTouch] = useState(false);
  const [direction, setDirection] = useState(1); // 1 for next, -1 for prev
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);

  useEffect(() => {
    // Detect if device is touch
    const checkTouch = () => setIsTouch('ontouchstart' in window || navigator.maxTouchPoints > 0);
    checkTouch();
    window.addEventListener('resize', checkTouch);
    return () => window.removeEventListener('resize', checkTouch);
  }, []);

  useEffect(() => {
    if (isOpen) {
      const interval = setInterval(() => {
        setCurrentRole((prev) => (prev + 1) % userRoles.length);
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [isOpen]);

  // Touch handlers for swipe navigation
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };
  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.touches[0].clientX;
  };
  const handleTouchEnd = () => {
    if (touchStartX.current !== null && touchEndX.current !== null) {
      const deltaX = touchEndX.current - touchStartX.current;
      if (Math.abs(deltaX) > 50) {
        if (deltaX > 0) {
          // Swipe right (previous)
          setDirection(-1);
          setCurrentRole((prev) => (prev - 1 + userRoles.length) % userRoles.length);
        } else {
          // Swipe left (next)
          setDirection(1);
          setCurrentRole((prev) => (prev + 1) % userRoles.length);
        }
      }
    }
    touchStartX.current = null;
    touchEndX.current = null;
  };

  // Desktop navigation handlers
  const goLeft = () => {
    setDirection(-1);
    setCurrentRole((prev) => (prev - 1 + userRoles.length) % userRoles.length);
  };
  const goRight = () => {
    setDirection(1);
    setCurrentRole((prev) => (prev + 1) % userRoles.length);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            onClick={onClose}
          />
          {/* Modal Wrapper for perfect centering */}
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ type: "spring", duration: 0.8 }}
              className="w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 flex flex-col justify-center"
            >
              <div className="relative bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 shadow-2xl overflow-hidden">
                {/* Gradient Border Effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-pink-500/20 animate-gradient-x" />
                <div className="relative p-8">
                  {/* Header */}
                  <div className="flex items-center gap-4 mb-8">
                    <div className="bg-blue-500/20 p-3 rounded-xl">
                      <Shield className="h-8 w-8 text-blue-500" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-white">Welcome to T•G Crime Lens</h2>
                      <p className="text-gray-300">Helping Telangana citizens, journalists, and authorities understand crime trends.</p>
                    </div>
                  </div>
                  {/* Carousel */}
                  <div
                    className="relative h-48 mb-8 overflow-hidden flex items-center"
                    onTouchStart={isTouch ? handleTouchStart : undefined}
                    onTouchMove={isTouch ? handleTouchMove : undefined}
                    onTouchEnd={isTouch ? handleTouchEnd : undefined}
                  >
                    {/* Left Arrow (desktop only) */}
                    {!isTouch && (
                      <button
                        aria-label="Previous"
                        onClick={goLeft}
                        className="absolute left-0 z-10 h-10 w-10 flex items-center justify-center bg-black/30 hover:bg-black/50 text-white rounded-full transition-all duration-200"
                        style={{ top: '50%', transform: 'translateY(-50%)' }}
                      >
                        <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6" /></svg>
                      </button>
                    )}
                    <div className="flex-1 flex justify-center items-center relative h-full w-full">
                      <AnimatePresence mode="wait">
                        <motion.div
                          key={currentRole}
                          initial={{ opacity: 0, x: direction === 1 ? 100 : -100 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: direction === 1 ? -100 : 100 }}
                          transition={{ type: "spring", duration: 0.8 }}
                          className="absolute inset-0"
                        >
                          <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
                            <div className="flex items-center gap-4 mb-4">
                              {userRoles[currentRole].icon}
                              <h3 className="text-xl font-semibold text-white">{userRoles[currentRole].title}</h3>
                            </div>
                            <p className="text-gray-300">{userRoles[currentRole].description}</p>
                          </div>
                        </motion.div>
                      </AnimatePresence>
                    </div>
                    {/* Right Arrow (desktop only) */}
                    {!isTouch && (
                      <button
                        aria-label="Next"
                        onClick={goRight}
                        className="absolute right-0 z-10 h-10 w-10 flex items-center justify-center bg-black/30 hover:bg-black/50 text-white rounded-full transition-all duration-200"
                        style={{ top: '50%', transform: 'translateY(-50%)' }}
                      >
                        <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6" /></svg>
                      </button>
                    )}
                  </div>
                  {/* Navigation Dots */}
                  <div className="flex justify-center gap-2 mb-8">
                    {userRoles.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentRole(index)}
                        className={`w-2 h-2 rounded-full transition-all duration-300 ${
                          currentRole === index ? 'bg-blue-500 w-4' : 'bg-white/30'
                        }`}
                      />
                    ))}
                  </div>
                  {/* Action Button */}
                  <div className="flex justify-center">
                    <Button
                      onClick={onClose}
                      className="bg-blue-500 hover:bg-blue-600 text-white px-8 py-2 rounded-xl shadow-lg hover:shadow-blue-500/25 transition-all duration-300"
                    >
                      Got it
                    </Button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}; 
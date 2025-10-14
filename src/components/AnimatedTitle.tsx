import React, { useEffect, useState } from 'react';

interface AnimatedTitleProps {
  text: string;
  className?: string;
}

export const AnimatedTitle: React.FC<AnimatedTitleProps> = ({ text, className = '' }) => {
  const [key, setKey] = useState(0); // Add key to force re-render and restart animation
  
  useEffect(() => {
    // Set up interval to change key and trigger re-render
    const interval = setInterval(() => {
      setKey(prevKey => prevKey + 1);
    }, 5000);
    
    return () => clearInterval(interval);
  }, []);
  
  return (
    <h1 className={`animated-title ${className}`}>
      {text.split('').map((char, index) => (
        <span
          key={`${key}-${index}`} // Use combination of key and index to ensure proper re-render
          className="animated-letter"
          style={{
            display: 'inline-block',
            opacity: 0,
            transform: 'translateY(10px)',
            animation: 'letter-fade-in 0.5s forwards',
            animationDelay: `${index * 0.05}s`,
          }}
        >
          {char === ' ' ? '\u00A0' : char}
        </span>
      ))}
    </h1>
  );
};

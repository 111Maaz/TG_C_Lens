import React from 'react';
import { Phone, Ambulance, ShieldAlert, Shield } from 'lucide-react';

interface EmergencyContact {
  name: string;
  number: string;
  icon: React.ReactNode;
  bgColor: string;
  hoverColor: string;
  pulseColor: string;
}

const emergencyContacts: EmergencyContact[] = [
  {
    name: 'Police',
    number: '100',
    icon: <ShieldAlert className="h-5 w-5" />,
    bgColor: 'bg-blue-500/10',
    hoverColor: 'hover:bg-blue-600',
    pulseColor: 'before:bg-blue-500',
  },
  {
    name: 'Women',
    number: '1091',
    icon: <Shield className="h-5 w-5" />,
    bgColor: 'bg-purple-500/10',
    hoverColor: 'hover:bg-purple-600',
    pulseColor: 'before:bg-purple-500',
  },
  {
    name: 'Ambulance',
    number: '108',
    icon: <Ambulance className="h-5 w-5" />,
    bgColor: 'bg-red-500/10',
    hoverColor: 'hover:bg-red-600',
    pulseColor: 'before:bg-red-500',
  },
  {
    name: 'Child',
    number: '1098',
    icon: <Phone className="h-5 w-5" />,
    bgColor: 'bg-green-500/10',
    hoverColor: 'hover:bg-green-600',
    pulseColor: 'before:bg-green-500',
  },
];

export const EmergencyNumbers = () => {
  const handleCall = (number: string) => {
    window.location.href = `tel:${number}`;
  };

  return (
    <div className="flex flex-wrap gap-3 justify-center items-center">
      {emergencyContacts.map((contact, index) => (
        <button
          key={contact.number}
          onClick={() => handleCall(contact.number)}
          className={`
            group relative overflow-hidden
            flex items-center gap-2 px-4 py-2.5 rounded-xl
            transition-all duration-300 ease-out
            border border-border/50
            ${contact.bgColor}
            hover:scale-105
            hover:shadow-lg
            hover:border-transparent
            ${contact.hoverColor} hover:text-white
            animate-fade-in
          `}
          style={{
            animationDelay: `${index * 150}ms`,
          }}
        >
          {/* Animated background gradient */}
          <div className={`
            absolute inset-0 opacity-0 group-hover:opacity-100
            transition-opacity duration-300 ease-out
            bg-gradient-to-r from-white/10 via-white/5 to-transparent
          `} />

          {/* Pulse effect */}
          <div className={`
            absolute inset-0 
            before:absolute before:inset-0 
            before:rounded-xl ${contact.pulseColor} 
            before:opacity-0 
            before:animate-ping
            group-hover:before:opacity-20
          `} />

          {/* Icon container with bounce effect */}
          <div className={`
            relative flex items-center justify-center
            w-8 h-8 rounded-full
            ${contact.bgColor} group-hover:bg-white/20
            transition-all duration-300
            group-hover:scale-110 group-hover:rotate-12
          `}>
            <div className="group-hover:animate-bounce">
              {contact.icon}
            </div>
          </div>

          {/* Text content */}
          <div className="relative flex flex-col items-start">
            <span className="text-xs font-medium opacity-80 group-hover:opacity-90">
              {contact.name}
            </span>
            <span className="text-base font-bold tracking-wider group-hover:scale-105 transition-transform">
              {contact.number}
            </span>
          </div>

          {/* Call indicator */}
          <div className={`
            absolute right-2 w-2 h-2 rounded-full
            bg-current opacity-0
            group-hover:opacity-100
            group-hover:animate-ping
            transition-opacity duration-300
          `} />
        </button>
      ))}
    </div>
  );
}; 
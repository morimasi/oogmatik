
import React from 'react';

const DyslexiaLogo: React.FC<{ className?: string }> = ({ className }) => {
  const text = "Bursa Disleksi";
  return (
    <svg width="250" height="50" viewBox="0 0 250 50" xmlns="http://www.w3.org/2000/svg" className={className}>
      <defs>
        <linearGradient id="grad1" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#A78BFA" />
          <stop offset="100%" stopColor="#4F46E5" />
        </linearGradient>
        <style>
          {`
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(5px); }
            to { opacity: 1; transform: translateY(0); }
          }
          @keyframes pulse {
            0%, 100% {
              filter: drop-shadow(0 0 2px rgba(167, 139, 250, 0.6));
            }
            50% {
              filter: drop-shadow(0 0 8px rgba(79, 70, 229, 0.8));
            }
          }
          .logo-letter, .pulsing {
            opacity: 0;
            animation-name: fadeIn;
            animation-duration: 0.5s;
            animation-fill-mode: forwards;
          }
          .pulsing {
            animation-name: fadeIn, pulse;
            animation-duration: 0.5s, 2.5s;
            animation-timing-function: ease-out, ease-in-out;
            animation-iteration-count: 1, infinite;
          }
          `}
        </style>
      </defs>
      <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle" fontSize="32" fontWeight="bold" fill="url(#grad1)">
        {text.split('').map((char, index) => {
          const isPulsing = index === 0 || index === 8; // 'B' or 'd'
          // The entire word fade-in takes about 1.3s + 0.5s = 1.8s. Start pulse at 2s.
          const pulseDelay = 2.0; 
          return (
            <tspan
              key={index}
              className={isPulsing ? "pulsing" : "logo-letter"}
              style={{ 
                animationDelay: isPulsing 
                  ? `${index * 0.1}s, ${pulseDelay}s` 
                  : `${index * 0.1}s` 
              }}
            >
              {char === ' ' ? '\u00A0' : char}
            </tspan>
          );
        })}
      </text>
    </svg>
  );
};

export default DyslexiaLogo;

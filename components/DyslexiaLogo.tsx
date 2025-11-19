
import React from 'react';

const DyslexiaLogo: React.FC<{ className?: string }> = ({ className }) => (
  <svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <defs>
      <linearGradient id="grad1" x1="0" y1="0" x2="64" y2="64" gradientUnits="userSpaceOnUse">
        <stop stopColor="#A78BFA"/>
        <stop offset="1" stopColor="#4F46E5"/>
      </linearGradient>
      <linearGradient id="grad2" x1="12" y1="8" x2="52" y2="56" gradientUnits="userSpaceOnUse">
        <stop stopColor="#C4B5FD"/>
        <stop offset="1" stopColor="#7C3AED"/>
      </linearGradient>
      <style>
        {`
        @keyframes fadeB {
          0%, 20% { opacity: 1; transform: scale(1); }
          25% { opacity: 0; transform: scale(0.95); }
          100% { opacity: 0; }
        }
        @keyframes fadeD {
          0%, 25% { opacity: 0; }
          30%, 50% { opacity: 1; transform: scale(1); }
          55% { opacity: 0; transform: scale(0.95); }
          100% { opacity: 0; }
        }
        @keyframes fadeText {
          0%, 55% { opacity: 0; transform: scale(0.95); }
          60%, 95% { opacity: 1; transform: scale(1); }
          100% { opacity: 0; transform: scale(0.95); }
        }
        .anim-b { animation: fadeB 6s infinite ease-in-out; }
        .anim-d { animation: fadeD 6s infinite ease-in-out; }
        .anim-text { animation: fadeText 6s infinite ease-in-out; }
        `}
      </style>
    </defs>
    
    <g className="anim-b" style={{ transformOrigin: 'center center' }}>
       <path d="M16 8V56H32C42.4772 56 51 47.4772 51 37C51 26.5228 42.4772 18 32 18H16V8Z" fill="url(#grad2)" />
    </g>

    <g className="anim-d" style={{ transformOrigin: 'center center' }}>
       <path d="M48 8V56H32C21.5228 56 13 47.4772 13 37C13 26.5228 21.5228 18 32 18H48V8Z" fill="url(#grad2)" />
    </g>

    <g className="anim-text" style={{ transformOrigin: 'center center' }}>
      <text x="32" y="34" textAnchor="middle" dominantBaseline="middle" fontSize="11" fontWeight="bold" fill="url(#grad1)">
        Bursa Disleksi
      </text>
    </g>
  </svg>
);

export default DyslexiaLogo;

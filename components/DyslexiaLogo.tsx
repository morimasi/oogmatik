
import React, { CSSProperties, useRef, useState, useEffect } from 'react';

const DyslexiaLogo: React.FC<{ className?: string }> = ({ className }) => {
  const text = "Bursa Disleksi";
  const textRef = useRef<SVGTextElement>(null);
  const [letterData, setLetterData] = useState<{ char: string; x: number; y: number }[]>([]);

  // Effect to measure character positions on mount
  useEffect(() => {
    if (textRef.current && letterData.length === 0) {
      const positions = [];
      const textEl = textRef.current;

      for (let i = 0; i < text.length; i++) {
        const startPos = textEl.getStartPositionOfChar(i);
        const endPos = textEl.getEndPositionOfChar(i);
        positions.push({
          char: text[i],
          x: (startPos.x + endPos.x) / 2, // Horizontal center
          y: startPos.y, // Y position
        });
      }
      setLetterData(positions);
    }
  }, []);

  return (
    <svg 
      viewBox="0 0 360 50" 
      xmlns="http://www.w3.org/2000/svg" 
      className={`${className} group cursor-default`}
      style={{ perspective: '800px' }}
    >
      <style>
        {`
          @keyframes mixedFlip {
            0% { transform: rotateY(0deg); fill: currentColor; }
            15% { transform: rotateY(180deg); fill: #f59e0b; /* Amber 500 */ }
            45% { transform: rotateY(180deg); fill: #f59e0b; }
            60% { transform: rotateY(360deg); fill: #d97706; /* Amber 600 */ }
            100% { transform: rotateY(360deg); fill: currentColor; }
          }

          .logo-letter {
            animation-name: mixedFlip;
            animation-iteration-count: infinite;
            animation-timing-function: ease-in-out;
            transform-box: fill-box; 
            transform-origin: center; 
          }
        `}
      </style>
      
      {/* 1. Hidden Text for Measurement */}
      <text
        ref={textRef}
        x="40%" /* Slightly Left Aligned */
        y="65%" 
        dominantBaseline="middle"
        textAnchor="middle"
        fontSize="42" /* Larger Font Size */
        fontWeight="800"
        fontFamily="OpenDyslexic, sans-serif"
        visibility="hidden"
        aria-hidden="true"
      >
        {text}
      </text>

      {/* 2. Visible Letters */}
      <g style={{ opacity: letterData.length > 0 ? 1 : 0, transition: 'opacity 0.3s' }}>
        {letterData.map(({ char, x, y }, index) => {
          if (char === ' ') return null;
          
          const isVowel = 'aeıioöuü'.includes(char.toLowerCase());
          const style: CSSProperties = isVowel ? {
            animationDuration: `${6 + Math.random() * 6}s`,
            animationDelay: `-${Math.random() * 5}s`,
          } : {};

          return (
            <text
              key={index}
              x={x}
              y={y}
              dominantBaseline="middle"
              textAnchor="middle"
              fontSize="42" /* Match hidden text size */
              fontWeight="800"
              className={`fill-zinc-200 dark:fill-zinc-100 drop-shadow-[0_2px_3px_rgba(0,0,0,0.8)] ${isVowel ? 'logo-letter' : ''}`}
              fontFamily="OpenDyslexic, sans-serif"
              style={style}
            >
              {char}
            </text>
          );
        })}
      </g>
    </svg>
  );
};

export default DyslexiaLogo;

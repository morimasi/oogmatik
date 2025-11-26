
import React, { CSSProperties, useRef, useState, useEffect } from 'react';

const DyslexiaLogo: React.FC<{ className?: string }> = ({ className }) => {
  const text = "Bursa Disleksi";
  const textRef = useRef<SVGTextElement>(null);
  const [letterData, setLetterData] = useState<{ char: string; x: number; y: number }[]>([]);

  // Effect to measure character positions on mount
  useEffect(() => {
    // Check if the ref is ready and we haven't already calculated positions
    if (textRef.current && letterData.length === 0) {
      const positions = [];
      const textEl = textRef.current;

      for (let i = 0; i < text.length; i++) {
        const startPos = textEl.getStartPositionOfChar(i);
        const endPos = textEl.getEndPositionOfChar(i);
        positions.push({
          char: text[i],
          x: (startPos.x + endPos.x) / 2, // Calculate the horizontal center of the character
          y: startPos.y, // Y position is consistent across the line
        });
      }
      setLetterData(positions);
    }
  }, []); // Empty dependency array ensures this runs only once on mount

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
            0% {
              transform: rotateY(0deg);
              fill: currentColor;
            }
            15% {
              transform: rotateY(180deg);
              fill: #4338CA; /* Lacivert (Indigo-700) - Ters Dönüş */
            }
            45% {
              transform: rotateY(180deg);
              fill: #4338CA;
            }
            60% {
              transform: rotateY(360deg);
              fill: #D97706; /* Koyu Sarı/Altın (Amber-600) - Düz Dönüş */
            }
            100% {
              transform: rotateY(360deg);
              fill: currentColor;
            }
          }

          .logo-letter {
            animation-name: mixedFlip;
            animation-iteration-count: infinite;
            animation-timing-function: ease-in-out;
            transform-box: fill-box; /* Use the character's geometry as the reference */
            transform-origin: center; /* Rotate around the center of that geometry */
          }
        `}
      </style>
      
      {/* 1. Hidden text for measurement. It's rendered once, measured, then we render the real letters. */}
      <text
        ref={textRef}
        x="50%"
        y="50%"
        dominantBaseline="middle"
        textAnchor="middle"
        fontSize="32"
        fontWeight="bold"
        fontFamily="OpenDyslexic, sans-serif"
        visibility="hidden"
        aria-hidden="true"
      >
        {text}
      </text>

      {/* 2. Visible, individually animated letters. Wrapped in a <g> to fade in after measurement. */}
      <g style={{ opacity: letterData.length > 0 ? 1 : 0, transition: 'opacity 0.3s' }}>
        {letterData.map(({ char, x, y }, index) => {
          if (char === ' ') {
            return null; // Skip rendering spaces
          }
          
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
              textAnchor="middle" // Anchor the text at its calculated center (x)
              fontSize="32"
              fontWeight="bold"
              /* 
                 Base Color Logic:
                 - Light Theme: fill-amber-500 (Warm Gold/Yellow) for visibility against white.
                 - Dark Theme: fill-amber-200 (Light Cream/Yellow) for visibility against dark gray.
                 - Drop Shadow: Added for extra contrast on all backgrounds.
              */
              className={`fill-amber-500 dark:fill-amber-200 drop-shadow-[0_1px_2px_rgba(0,0,0,0.5)] ${isVowel ? 'logo-letter' : ''}`}
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

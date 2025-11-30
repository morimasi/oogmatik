import React, { CSSProperties, useRef, useState, useLayoutEffect } from 'react';

const DyslexiaLogo: React.FC<{ className?: string }> = ({ className }) => {
  const text = "Bursa Disleksi";
  const textRef = useRef<SVGTextElement>(null);
  const [letterData, setLetterData] = useState<{ char: string; x: number; y: number }[]>([]);

  // Effect to measure character positions on mount
  useLayoutEffect(() => {
    const measure = () => {
      if (!textRef.current) return;

      const textEl = textRef.current;
      const positions = [];
      
      try {
        // Sanity check: if element has no dimensions, it's not ready.
        if (textEl.getComputedTextLength() === 0) {
          // Font or layout might not be ready, retry.
          setTimeout(measure, 100); 
          return;
        }

        for (let i = 0; i < text.length; i++) {
          const startPos = textEl.getStartPositionOfChar(i);
          const endPos = textEl.getEndPositionOfChar(i);
          // Another check: if startPos is (0,0) for characters after the first one, something is wrong.
          if (startPos.x === 0 && endPos.x === 0 && i > 0) {
             throw new Error("Measurement returned invalid coordinates, font likely not ready.");
          }
          positions.push({
            char: text[i],
            x: (startPos.x + endPos.x) / 2, // Horizontal center
            y: startPos.y, // Y position
          });
        }
        setLetterData(positions);
      } catch (e) {
        // Fallback for environments where getStartPositionOfChar might fail
        console.warn("Text measurement failed, using fallback positioning.");
      }
    };

    // Use document.fonts.ready to wait for custom font loading.
    document.fonts.ready.then(() => {
        // A small timeout ensures layout is stable after fonts are loaded.
        setTimeout(measure, 50);
    });
    // This effect should only run once on mount.
  }, []);

  return (
    <svg 
      // Updated viewBox: Adjusted to start at 0 and cover the text width more tightly
      viewBox="0 0 350 55" 
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
      
      {/* 1. Hidden Text for Measurement - Aligned left (start) at x=0 */}
      <text
        ref={textRef}
        x="0"
        y="35" 
        dominantBaseline="middle"
        textAnchor="start"
        fontSize="42" 
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
              fontSize="42" 
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
      
      {/* Fallback if JS measurement fails or hasn't run yet */}
      {letterData.length === 0 && (
          <text
            x="0"
            y="35" 
            dominantBaseline="middle"
            textAnchor="start"
            fontSize="42" 
            fontWeight="800"
            className="fill-zinc-200 dark:fill-zinc-100 drop-shadow-[0_2px_3px_rgba(0,0,0,0.8)]"
            fontFamily="OpenDyslexic, sans-serif"
          >
            {text}
          </text>
      )}
    </svg>
  );
};

export default DyslexiaLogo;
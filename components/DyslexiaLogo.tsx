// @ts-nocheck
import React, { CSSProperties, useRef, useState, useLayoutEffect } from 'react';

const DyslexiaLogo: React.FC<{ className?: string }> = ({ className }) => {
  const text = "Bursa Disleksi";
  const textRef = useRef<SVGTextElement>(null);
  const [letterData, setLetterData] = useState<{ char: string; x: number; y: number }[]>([]);

  useLayoutEffect(() => {
    const measure = () => {
      if (!textRef.current) return;
      const textEl = textRef.current;
      const positions = [];
      try {
        if (textEl.getComputedTextLength() === 0) {
          setTimeout(measure, 100);
          return;
        }
        for (let i = 0; i < text.length; i++) {
          const startPos = textEl.getStartPositionOfChar(i);
          const endPos = textEl.getEndPositionOfChar(i);
          if (startPos.x === 0 && endPos.x === 0 && i > 0) {
            throw new Error("Measurement returned invalid coordinates");
          }
          positions.push({
            char: text[i],
            x: (startPos.x + endPos.x) / 2,
            y: startPos.y,
          });
        }
        setLetterData(positions);
      } catch (e) {
        console.warn("Text measurement failed.");
      }
    };
    document.fonts.ready.then(() => {
      setTimeout(measure, 50);
    });
  }, []);

  return (
    <div className={`flex items-center gap-4 ${className}`}>
      {/* 0. Görsel Logo */}
      <img
        src="/assets/logo.png"
        alt="Bursa Disleksi Logo"
        className="h-10 w-auto object-contain shrink-0"
      />

      {/* 1. Metin Logo (SVG Animasyonlu) */}
      <svg
        viewBox="0 0 320 55"
        xmlns="http://www.w3.org/2000/svg"
        className="h-12 w-auto shrink-0 group cursor-default"
        style={{ perspective: '800px' }}
      >
        <style>
          {`
            @keyframes mixedFlip {
              0% { transform: rotateY(0deg); fill: currentColor; }
              15% { transform: rotateY(180deg); fill: #f59e0b; }
              45% { transform: rotateY(180deg); fill: #f59e0b; }
              60% { transform: rotateY(360deg); fill: #d97706; }
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
        <text ref={textRef} x="0" y="35" dominantBaseline="middle" textAnchor="start" fontSize="42" fontWeight="800" fontFamily="OpenDyslexic, sans-serif" visibility="hidden" aria-hidden="true">{text}</text>
        <g style={{ opacity: letterData.length > 0 ? 1 : 0, transition: 'opacity 0.3s' }}>
          {letterData.map(({ char, x, y }, index) => {
            if (char === ' ') return null;
            const isVowel = 'aeıioöuü'.includes(char.toLowerCase());
            const style = isVowel ? { animationDuration: `${6 + Math.random() * 6}s`, animationDelay: `-${Math.random() * 5}s` } : {};
            return (
              <text key={index} x={x} y={y} dominantBaseline="middle" textAnchor="middle" fontSize="42" fontWeight="800" className={`fill-zinc-800 dark:fill-zinc-50 ${isVowel ? 'logo-letter' : ''}`} fontFamily="OpenDyslexic, sans-serif" style={style as any}>{char}</text>
            );
          })}
        </g>
        {letterData.length === 0 && (
          <text x="0" y="35" dominantBaseline="middle" textAnchor="start" fontSize="42" fontWeight="800" className="fill-zinc-800 dark:fill-zinc-50" fontFamily="OpenDyslexic, sans-serif">{text}</text>
        )}
      </svg>
    </div>
  );
};

export default DyslexiaLogo;
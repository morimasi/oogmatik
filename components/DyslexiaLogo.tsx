
import React, { CSSProperties } from 'react';

const DyslexiaLogo: React.FC<{ className?: string }> = ({ className }) => {
  const text = "Bursa Disleksi";
  const animationDuration = "1.5s"; // Süre biraz uzatıldı, akıcılık için
  const delayIncrement = 0.05; // Harfler arası gecikme

  return (
    <svg viewBox="0 0 360 50" xmlns="http://www.w3.org/2000/svg" className={`${className} group cursor-default`}>
      <style>
        {`
          @keyframes fluidReveal {
            0% {
              opacity: 0;
              transform: translate3d(var(--randX), var(--randY), 0) rotate(var(--randRot)) scale(1.5);
              filter: blur(8px);
            }
            40% {
              opacity: 0.6;
              filter: blur(2px);
            }
            100% {
              opacity: 1;
              transform: translate3d(0, 0, 0) rotate(0deg) scale(1);
              filter: blur(0px);
            }
          }

          @keyframes gentleFloat {
            0%, 100% {
              transform: translateY(0);
            }
            50% {
              transform: translateY(-3px);
            }
          }

          /* Hover durumunda harflerin hafifçe oynaması için */
          .logo-letter {
            transition: fill 0.3s ease;
          }
          .group:hover .logo-letter {
             animation: gentleFloat 2s ease-in-out infinite;
             animation-delay: var(--delay); 
          }
        `}
      </style>
      <text
        x="50%"
        y="50%"
        dominantBaseline="middle"
        textAnchor="middle"
        fontSize="32"
        fontWeight="bold"
        className="fill-zinc-800 dark:fill-zinc-100"
        fontFamily="OpenDyslexic, sans-serif"
      >
        {text.split('').map((char, index) => {
          if (char === ' ') {
            return <tspan key={index}>{char}</tspan>;
          }

          // Daha kontrollü rastgelelik
          const randX = Math.random() * 60 - 30; // -30px ile 30px arası
          const randY = Math.random() * 40 - 20; // -20px ile 20px arası
          const randRot = Math.random() * 60 - 30; // -30deg ile 30deg arası

          const style: CSSProperties & {
            '--randX': string;
            '--randY': string;
            '--randRot': string;
            '--delay': string;
          } = {
            display: 'inline-block',
            transformOrigin: 'center', // Dönüş merkezi harfin ortası
            '--randX': `${randX}px`,
            '--randY': `${randY}px`,
            '--randRot': `${randRot}deg`,
            '--delay': `${index * 0.1}s`, // Hover animasyonu için gecikme
            
            animationName: 'fluidReveal',
            animationDuration: animationDuration,
            animationFillMode: 'both',
            // "Spring" etkisi veren özel bezier eğrisi (hafifçe hedefini geçip geri gelir)
            animationTimingFunction: 'cubic-bezier(0.34, 1.56, 0.64, 1)', 
            animationDelay: `${index * delayIncrement}s`,
          };

          return (
            <tspan key={index} style={style} className="logo-letter">
              {char}
            </tspan>
          );
        })}
      </text>
    </svg>
  );
};

export default DyslexiaLogo;

import React, { CSSProperties } from 'react';

const DyslexiaLogo: React.FC<{ className?: string }> = ({ className }) => {
  const text = "Bursa Disleksi";
  const animationDuration = "1.2s";
  const delayIncrement = 0.06;

  return (
    <svg viewBox="0 0 360 50" xmlns="http://www.w3.org/2000/svg" className={className}>
      <style>
        {`
          @keyframes unscramble {
            0% {
              transform: translate(var(--randX), var(--randY)) rotate(var(--randRot));
              opacity: 0;
            }
            30% {
              opacity: 0.8;
            }
            100% {
              transform: translate(0, 0) rotate(0deg);
              opacity: 1;
            }
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
        className="fill-zinc-900 dark:fill-zinc-100"
        fontFamily="OpenDyslexic, sans-serif"
      >
        {text.split('').map((char, index) => {
          if (char === ' ') {
            return <tspan key={index}>{char}</tspan>;
          }

          // CSS Değişkenlerini kullanarak her harf için rastgele başlangıç değerleri atama
          const style: CSSProperties & {
            '--randX': string;
            '--randY': string;
            '--randRot': string;
          } = {
            display: 'inline-block', // transform özelliğinin düzgün çalışması için gerekli
            '--randX': `${Math.random() * 40 - 20}px`,
            '--randY': `${Math.random() * 30 - 15}px`,
            '--randRot': `${Math.random() * 90 - 45}deg`,
            animationName: 'unscramble',
            animationDuration: animationDuration,
            animationFillMode: 'forwards', // Animasyon bittiğinde son durumda kal
            animationTimingFunction: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
            animationDelay: `${index * delayIncrement}s`,
            opacity: 0, // Animasyon başlamadan önce gizli
          };

          return (
            <tspan key={index} style={style}>
              {char}
            </tspan>
          );
        })}
      </text>
    </svg>
  );
};

export default DyslexiaLogo;
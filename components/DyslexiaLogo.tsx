
import React, { CSSProperties } from 'react';

const DyslexiaLogo: React.FC<{ className?: string }> = ({ className }) => {
  const text = "Bursa Disleksi";

  return (
    <svg 
      viewBox="0 0 360 50" 
      xmlns="http://www.w3.org/2000/svg" 
      className={`${className} group cursor-default`}
      style={{ perspective: '800px' }} // 3D derinlik etkisi için
    >
      <style>
        {`
          @keyframes mixedFlip {
            0% {
              transform: rotateY(0deg);
            }
            15% {
              transform: rotateY(180deg); /* Ters dön */
            }
            45% {
              transform: rotateY(180deg); /* Ters bekle */
            }
            60% {
              transform: rotateY(360deg); /* Düz dön */
            }
            100% {
              transform: rotateY(360deg); /* Düz bekle */
            }
          }

          .logo-letter {
            transform-box: fill-box; /* Harfin kendi merkezinde dönmesi için kritik */
            transform-origin: center;
            display: inline-block; /* Transformların çalışması için */
            
            animation-name: mixedFlip;
            animation-iteration-count: infinite;
            animation-timing-function: ease-in-out;
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
            return <tspan key={index} dx="10"> </tspan>;
          }

          // Her harf için rastgele süre ve gecikme oluşturuyoruz
          // Süre: 5s ile 10s arasında (yavaş ve sakin döngü, disleksi dostu)
          const duration = 5 + Math.random() * 5; 
          // Gecikme: -5s ile 0s arasında (animasyonun ortasından başlamış gibi görünmesi için negatif delay)
          // Bu sayede sayfa açıldığında hepsi aynı anda başlamaz, karışık görünür.
          const delay = -(Math.random() * 5);

          const style: CSSProperties = {
            animationDuration: `${duration}s`,
            animationDelay: `${delay}s`,
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

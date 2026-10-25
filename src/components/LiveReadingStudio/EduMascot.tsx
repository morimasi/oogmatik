import React from 'react';
import { motion, Variants } from 'framer-motion';

export type MascotType = 'baykus' | 'kedi' | 'robot';
export type MascotState = 'idle' | 'listening' | 'speaking' | 'celebrating' | 'hinting';

interface EduMascotProps {
  type?: MascotType;
  state?: MascotState;
  size?: number;
  className?: string;
}

export const EduMascot: React.FC<EduMascotProps> = ({
  type = 'baykus',
  state = 'idle',
  size = 140,
  className = '',
}) => {
  // Animasyon varyantları (Framer Motion tipiyle tam uyumlu)
  const bounceVariants: Variants = {
    idle: { y: [0, -4, 0], transition: { repeat: Infinity, duration: 3 } },
    listening: { scale: [1, 1.04, 1], y: [0, -2, 0], transition: { repeat: Infinity, duration: 1.5 } },
    speaking: { y: [0, -6, 0], rotate: [-2, 2, -2], transition: { repeat: Infinity, duration: 0.6 } },
    celebrating: { y: [0, -18, 0], rotate: [-5, 5, -5], scale: [1, 1.15, 1], transition: { repeat: Infinity, duration: 0.8 } },
    hinting: { rotate: [0, 6, 0], transition: { duration: 1, repeat: Infinity } },
  };

  const mouthVariants: Variants = {
    idle: { scaleY: 1 },
    listening: { scaleY: 1.1 },
    speaking: { scaleY: [1, 2.2, 0.8, 1.8, 1], transition: { repeat: Infinity, duration: 0.4 } },
    celebrating: { scaleY: 2.2, scaleX: 1.2 },
    hinting: { scaleY: 1 },
  };

  if (type === 'baykus') {
    return (
      <motion.div
        className={`relative inline-flex items-center justify-center select-none ${className}`}
        style={{ width: size, height: size }}
        variants={bounceVariants}
        animate={state}
      >
        {/* Canlı Dinleme Halkası (Pulse Halo) */}
        {state === 'listening' && (
          <motion.div
            className="absolute inset-0 rounded-full bg-emerald-500/20 blur-xl"
            animate={{ scale: [1, 1.4, 1], opacity: [0.3, 0.8, 0.3] }}
            transition={{ repeat: Infinity, duration: 1.2 }}
          />
        )}
        {state === 'celebrating' && (
          <motion.div
            className="absolute inset-0 rounded-full bg-amber-400/30 blur-2xl"
            animate={{ scale: [1, 1.6, 1], opacity: [0.5, 1, 0.5] }}
            transition={{ repeat: Infinity, duration: 0.8 }}
          />
        )}

        <svg viewBox="0 0 160 160" width={size} height={size} className="overflow-visible drop-shadow-xl">
          <defs>
            <linearGradient id="owlBody" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#4F46E5" />
              <stop offset="100%" stopColor="#312E81" />
            </linearGradient>
            <linearGradient id="owlBelly" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#EEF2FF" />
              <stop offset="100%" stopColor="#C7D2FE" />
            </linearGradient>
            <linearGradient id="owlBeak" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#F59E0B" />
              <stop offset="100%" stopColor="#D97706" />
            </linearGradient>
          </defs>

          {/* Kulaklar */}
          <polygon points="35,45 20,15 60,32" fill="#3730A3" />
          <polygon points="125,45 140,15 100,32" fill="#3730A3" />

          {/* Gövde */}
          <ellipse cx="80" cy="90" rx="58" ry="60" fill="url(#owlBody)" />

          {/* Karın */}
          <ellipse cx="80" cy="104" rx="38" ry="42" fill="url(#owlBelly)" />

          {/* Kanatlar */}
          <motion.path
            d="M 24 85 Q 12 110 32 125 Q 36 95 24 85"
            fill="#3730A3"
            animate={state === 'hinting' ? { rotate: [0, -25, 0], originX: '30px', originY: '85px' } : {}}
            transition={{ repeat: Infinity, duration: 1.5 }}
          />
          <path d="M 136 85 Q 148 110 128 125 Q 124 95 136 85" fill="#3730A3" />

          {/* Bilge Gözlükleri Çerçevesi */}
          <circle cx="56" cy="65" r="24" fill="#FFFFFF" stroke="#FBBF24" strokeWidth="4" />
          <circle cx="104" cy="65" r="24" fill="#FFFFFF" stroke="#FBBF24" strokeWidth="4" />
          <line x1="80" y1="65" x2="80" y2="65" stroke="#FBBF24" strokeWidth="5" />
          <line x1="76" y1="65" x2="84" y2="65" stroke="#FBBF24" strokeWidth="4" />

          {/* Göz Bebekleri */}
          <motion.circle
            cx={state === 'hinting' ? 58 : 56}
            cy="65"
            r="11"
            fill="#1E1B4B"
            animate={state === 'celebrating' ? { scale: [1, 1.25, 1] } : {}}
            transition={{ repeat: Infinity, duration: 0.8 }}
          />
          <motion.circle
            cx={state === 'hinting' ? 106 : 104}
            cy="65"
            r="11"
            fill="#1E1B4B"
            animate={state === 'celebrating' ? { scale: [1, 1.25, 1] } : {}}
            transition={{ repeat: Infinity, duration: 0.8 }}
          />
          {/* Işıltılar */}
          <circle cx="53" cy="62" r="4" fill="#FFFFFF" />
          <circle cx="101" cy="62" r="4" fill="#FFFFFF" />

          {/* Gaga */}
          <motion.polygon
            points="80,74 72,88 88,88"
            fill="url(#owlBeak)"
            variants={mouthVariants}
            animate={state}
            style={{ originX: '80px', originY: '74px' }}
          />

          {/* Mezuniyet Püskülü / Bilgelik Şapkası */}
          <polygon points="80,18 45,30 80,40 115,30" fill="#1E1B4B" />
          <line x1="80" y1="30" x2="115" y2="44" stroke="#F59E0B" strokeWidth="2.5" />
          <circle cx="115" cy="46" r="3" fill="#F59E0B" />

          {/* Ayaklar */}
          <ellipse cx="65" cy="150" rx="8" ry="4" fill="#F59E0B" />
          <ellipse cx="95" cy="150" rx="8" ry="4" fill="#F59E0B" />
        </svg>
      </motion.div>
    );
  }

  // Neşeli Kedi Maskotu
  if (type === 'kedi') {
    return (
      <motion.div
        className={`relative inline-flex items-center justify-center select-none ${className}`}
        style={{ width: size, height: size }}
        variants={bounceVariants}
        animate={state}
      >
        <svg viewBox="0 0 160 160" width={size} height={size} className="overflow-visible drop-shadow-xl">
          <defs>
            <linearGradient id="catBody" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#F97316" />
              <stop offset="100%" stopColor="#EA580C" />
            </linearGradient>
          </defs>
          {/* Kulaklar */}
          <polygon points="35,50 20,18 62,35" fill="#C2410C" />
          <polygon points="125,50 140,18 98,35" fill="#C2410C" />
          <polygon points="37,45 27,24 57,36" fill="#FDBA74" />
          <polygon points="123,45 133,24 103,36" fill="#FDBA74" />

          {/* Kafa */}
          <circle cx="80" cy="85" r="54" fill="url(#catBody)" />

          {/* Gözler */}
          <ellipse cx="58" cy="78" rx="10" ry="12" fill="#1E293B" />
          <ellipse cx="102" cy="78" rx="10" ry="12" fill="#1E293B" />
          <circle cx="55" cy="74" r="4" fill="#FFFFFF" />
          <circle cx="99" cy="74" r="4" fill="#FFFFFF" />

          {/* Burun & Ağız */}
          <polygon points="80,92 74,99 86,99" fill="#FDA4AF" />
          <motion.path
            d="M 74 102 Q 80 110 86 102"
            fill="none"
            stroke="#1E293B"
            strokeWidth="3"
            strokeLinecap="round"
            variants={mouthVariants}
            animate={state}
          />

          {/* Bıyıklar */}
          <line x1="28" y1="88" x2="65" y2="92" stroke="#FED7AA" strokeWidth="2.5" />
          <line x1="26" y1="98" x2="65" y2="96" stroke="#FED7AA" strokeWidth="2.5" />
          <line x1="132" y1="88" x2="95" y2="92" stroke="#FED7AA" strokeWidth="2.5" />
          <line x1="134" y1="98" x2="95" y2="96" stroke="#FED7AA" strokeWidth="2.5" />
        </svg>
      </motion.div>
    );
  }

  // Robot Can Maskotu
  return (
    <motion.div
      className={`relative inline-flex items-center justify-center select-none ${className}`}
      style={{ width: size, height: size }}
      variants={bounceVariants}
      animate={state}
    >
      <svg viewBox="0 0 160 160" width={size} height={size} className="overflow-visible drop-shadow-xl">
        <defs>
          <linearGradient id="robotBody" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#06B6D4" />
            <stop offset="100%" stopColor="#0891B2" />
          </linearGradient>
        </defs>

        {/* Anten */}
        <line x1="80" y1="36" x2="80" y2="16" stroke="#67E8F9" strokeWidth="4" />
        <motion.circle
          cx="80"
          cy="14"
          r="7"
          fill="#F43F5E"
          animate={{ scale: [1, 1.3, 1] }}
          transition={{ repeat: Infinity, duration: 1 }}
        />

        {/* Kafa */}
        <rect x="32" y="36" width="96" height="84" rx="20" fill="url(#robotBody)" />
        <rect x="42" y="46" width="76" height="46" rx="12" fill="#0F172A" />

        {/* Dijital Gözler */}
        <circle cx="60" cy="68" r="9" fill="#38BDF8" />
        <circle cx="100" cy="68" r="9" fill="#38BDF8" />
        <circle cx="58" cy="66" r="3" fill="#FFFFFF" />
        <circle cx="98" cy="66" r="3" fill="#FFFFFF" />

        {/* Ağız Göstergesi */}
        <motion.rect
          x="62"
          y="102"
          width="36"
          height="8"
          rx="4"
          fill="#22C55E"
          variants={mouthVariants}
          animate={state}
        />
      </svg>
    </motion.div>
  );
};

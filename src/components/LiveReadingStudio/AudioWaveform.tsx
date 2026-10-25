import React, { useMemo } from 'react';
import { motion } from 'framer-motion';

interface AudioWaveformProps {
  volume?: number; // 0 to 1
  isActive?: boolean;
  barCount?: number;
  className?: string;
}

export const AudioWaveform: React.FC<AudioWaveformProps> = ({
  volume = 0,
  isActive = false,
  barCount = 14,
  className = '',
}) => {
  const bars = useMemo(() => Array.from({ length: barCount }, (_, i) => i), [barCount]);

  return (
    <div className={`flex items-center justify-center gap-1.5 h-10 px-3 py-1 bg-zinc-900/40 backdrop-blur-md rounded-full border border-white/10 ${className}`}>
      {bars.map((index) => {
        // Orta barlar daha yüksek, kenarlar daha alçak bir simetrik dalga oluşturur
        const distanceToCenter = Math.abs(index - (barCount - 1) / 2) / ((barCount - 1) / 2);
        const factor = Math.max(0.15, 1 - distanceToCenter * 0.7);

        // Dinamik yükseklik (min: 4px, max: 32px)
        const targetHeight = isActive
          ? Math.max(6, Math.min(32, 6 + volume * 55 * factor + (Math.sin(index + Date.now() / 200) * 4)))
          : 5;

        return (
          <motion.div
            key={index}
            className="w-1.5 rounded-full bg-gradient-to-t from-indigo-500 to-teal-400"
            animate={{
              height: targetHeight,
              opacity: isActive ? 0.7 + volume * 0.3 : 0.3,
            }}
            transition={{ type: 'spring', stiffness: 350, damping: 25 }}
          />
        );
      })}
    </div>
  );
};

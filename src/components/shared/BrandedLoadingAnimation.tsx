import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const DEFAULT_MESSAGES = [
  "Bilişsel Yük Filtreleniyor...",
  "Pedagojik Katmanlar Oluşturuluyor...",
  "Sinaptik Bağlantılar İnşa Ediliyor...",
  "Öğrenme Hedefleri Analiz Ediliyor...",
  "Görsel Öğeler Optimize Ediliyor...",
  "İçerikler Dokunuyor...",
  "Disleksi Dostu Format Uygulanıyor...",
  "ZPD Seviyesi Ayarlanıyor...",
];

export type BrandedLoadingSize = 'small' | 'medium' | 'large' | 'fullpage';

interface BrandedLoadingAnimationProps {
  title?: string;
  messages?: string[];
  size?: BrandedLoadingSize;
  className?: string;
}

const SIZE_CONFIG = {
  small: {
    logoSize: 'h-10 w-auto',
    ringOuter: 'w-16 h-16 border-[3px]',
    ringInner: 'w-11 h-11 border-[2px]',
    titleSize: 'text-base',
    messageSize: 'text-xs',
    progressWidth: 'w-32',
    containerClass: 'py-6 gap-5',
  },
  medium: {
    logoSize: 'h-12 w-auto',
    ringOuter: 'w-20 h-20 border-[3px]',
    ringInner: 'w-14 h-14 border-[2.5px]',
    titleSize: 'text-lg',
    messageSize: 'text-xs',
    progressWidth: 'w-40',
    containerClass: 'py-8 gap-6',
  },
  large: {
    logoSize: 'h-16 w-auto',
    ringOuter: 'w-28 h-28 border-[4px]',
    ringInner: 'w-20 h-20 border-[3px]',
    titleSize: 'text-2xl',
    messageSize: 'text-sm',
    progressWidth: 'w-48',
    containerClass: 'py-10 gap-8',
  },
  fullpage: {
    logoSize: 'h-16 w-auto',
    ringOuter: 'w-28 h-28 border-[4px]',
    ringInner: 'w-20 h-20 border-[3px]',
    titleSize: 'text-2xl',
    messageSize: 'text-sm',
    progressWidth: 'w-48',
    containerClass: 'py-10 gap-8',
  },
};

export const BrandedLoadingAnimation: React.FC<BrandedLoadingAnimationProps> = ({
  title = 'İçerikler Üretiliyor',
  messages = DEFAULT_MESSAGES,
  size = 'medium',
  className = '',
}) => {
  const [msgIndex, setMsgIndex] = useState(0);
  const config = SIZE_CONFIG[size];

  useEffect(() => {
    const interval = setInterval(() => {
      setMsgIndex((prev) => (prev + 1) % messages.length);
    }, 3500);
    return () => clearInterval(interval);
  }, [messages.length]);

  return (
    <div
      className={`relative flex flex-col items-center justify-center ${config.containerClass} ${className}`}
    >
      <motion.div
        className="relative z-10 flex flex-col items-center gap-10"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
      >
        {/* Logo + Spinner */}
        <motion.div
          className="relative"
          animate={{ scale: [1, 1.03, 1] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        >
          {/* Dış dönen halka */}
          <div className={`${config.ringOuter} rounded-full`} style={{ borderColor: 'var(--border-color)' }}></div>
          <div
            className={`${config.ringOuter} rounded-full border-transparent animate-spin absolute inset-0`}
            style={{
              borderTopColor: 'var(--accent-color)',
              borderRightColor: 'var(--accent-hover)',
              filter: 'drop-shadow(0 0 6px hsla(var(--accent-h), var(--accent-s), var(--accent-l), 0.3))',
              animationDuration: '2s',
            }}
          ></div>

          {/* İç dönen halka (ters yön) */}
          <div
            className={`${config.ringInner} rounded-full border-transparent animate-spin absolute inset-0 m-auto`}
            style={{
              borderBottomColor: 'var(--accent-muted)',
              borderLeftColor: 'var(--accent-color)',
              animationDirection: 'reverse',
              animationDuration: '1.2s',
              filter: 'drop-shadow(0 0 8px hsla(var(--accent-h), var(--accent-s), var(--accent-l), 0.2))',
            }}
          ></div>

          {/* Logo */}
          <div className="absolute inset-0 flex items-center justify-center">
            <motion.img
              src="/assets/logo.png"
              alt="Bursa Disleksi"
              className={`${config.logoSize} object-contain`}
              animate={{ opacity: [0.85, 1, 0.85] }}
              transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
            />
          </div>
        </motion.div>

        {/* Metin alanı */}
        <div className="text-center space-y-2">
          <p
            className={`font-black ${config.titleSize} tracking-tight`}
            style={{ color: 'var(--text-primary)' }}
          >
            {title}
          </p>

          {/* Döngülü mesaj */}
          <div className="h-5 overflow-hidden">
            <AnimatePresence mode="wait">
              <motion.p
                key={msgIndex}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -16 }}
                transition={{ duration: 0.35, ease: 'easeOut' }}
                className={`font-semibold tracking-wide ${config.messageSize}`}
                style={{ color: 'var(--text-secondary)' }}
              >
                {messages[msgIndex]}
              </motion.p>
            </AnimatePresence>
          </div>
        </div>

        {/* İlerleme göstergesi */}
        <div
          className={`${config.progressWidth} h-1 rounded-full overflow-hidden`}
          style={{ backgroundColor: 'var(--border-color)' }}
        >
          <motion.div
            className="h-full rounded-full"
            animate={{ x: ['-100%', '200%'] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
            style={{
              background: 'linear-gradient(to right, var(--accent-color), var(--accent-hover))',
              filter: 'drop-shadow(0 0 4px hsla(var(--accent-h), var(--accent-s), var(--accent-l), 0.35))',
            }}
          />
        </div>
      </motion.div>
    </div>
  );
};

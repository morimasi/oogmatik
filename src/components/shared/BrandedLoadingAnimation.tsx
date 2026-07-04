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
    ringOuter: 'w-16 h-16 border-2',
    ringInner: 'w-12 h-12 border-[1.5px]',
    titleSize: 'text-base',
    messageSize: 'text-xs',
    progressWidth: 'w-32',
    containerClass: 'py-6 gap-6',
  },
  medium: {
    logoSize: 'h-12 w-auto',
    ringOuter: 'w-20 h-20 border-[2.5px]',
    ringInner: 'w-14 h-14 border-2',
    titleSize: 'text-lg',
    messageSize: 'text-xs',
    progressWidth: 'w-40',
    containerClass: 'py-8 gap-8',
  },
  large: {
    logoSize: 'h-14 w-auto',
    ringOuter: 'w-28 h-28 border-[3px]',
    ringInner: 'w-20 h-20 border-2',
    titleSize: 'text-2xl',
    messageSize: 'text-sm',
    progressWidth: 'w-48',
    containerClass: 'py-10 gap-10',
  },
  fullpage: {
    logoSize: 'h-14 w-auto',
    ringOuter: 'w-28 h-28 border-[3px]',
    ringInner: 'w-20 h-20 border-2',
    titleSize: 'text-2xl',
    messageSize: 'text-sm',
    progressWidth: 'w-48',
    containerClass: 'py-10 gap-10',
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
    }, 3000);
    return () => clearInterval(interval);
  }, [messages.length]);

  return (
    <div
      className={`relative flex flex-col items-center justify-center ${config.containerClass} ${className}`}
    >
      {/* Dönen halka katmanları */}
      <div className="relative z-10 flex flex-col items-center gap-10">
        {/* Logo + Spinner */}
        <div className="relative">
          {/* Dış dönen halka */}
          <div className={`${config.ringOuter} rounded-full border-teal-500/20`}></div>
          <div className={`${config.ringOuter} rounded-full border-transparent border-t-teal-400 border-r-indigo-400 animate-spin absolute inset-0`}></div>

          {/* İç dönen halka (ters yön) */}
          <div
            className={`${config.ringInner} rounded-full border-transparent border-b-cyan-400 border-l-emerald-400 animate-spin absolute inset-0 m-auto`}
            style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}
          ></div>

          {/* Logo */}
          <div className="absolute inset-0 flex items-center justify-center">
            <img
              src="/assets/logo.png"
              alt="Bursa Disleksi"
              className={`${config.logoSize} object-contain animate-breathing-logo`}
            />
          </div>
        </div>

        {/* Metin alanı */}
        <div className="text-center space-y-3">
          <p className={`text-teal-400 font-bold ${config.titleSize} tracking-tight`}>
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
                transition={{ duration: 0.3 }}
                className={`text-slate-400 ${config.messageSize} font-medium`}
              >
                {messages[msgIndex]}
              </motion.p>
            </AnimatePresence>
          </div>
        </div>

        {/* İlerleme göstergesi */}
        <div className={`${config.progressWidth} h-0.5 bg-slate-800 rounded-full overflow-hidden`}>
          <motion.div
            className="h-full bg-gradient-to-r from-teal-400 via-emerald-400 to-indigo-400"
            animate={{ x: ['-100%', '200%'] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
          />
        </div>
      </div>
    </div>
  );
};

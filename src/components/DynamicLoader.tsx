/**
 * BDMIND - Dynamic Loading Messages
 * AI üretim sürecinde dinamik, terminal benzeri loading mesajları
 * "Dr. Ahmet Kaya hedefleri doğruluyor...", "Bilişsel zorluk seviyesi ayarlanıyor..."
 */

import React, { useEffect, useState, useCallback } from 'react';

/**
 * Dinamik yükleme mesajları havuzu
 * Her mesaj belirli bir süre gösterilir, sonra bir sonrakine geçilir
 */
const LOADING_MESSAGES: string[] = [
  '🧠 Nöro-pedagojik bağlam analiz ediliyor...',
  '📚 Dr. Ahmet Kaya: MEB kazanım hedefleri doğrulanıyor...',
  '🎯 Bilişsel zorluk seviyesi ayarlanıyor...',
  '🔍 Elif Yıldız: ZPD uyumluluğu kontrol ediliyor...',
  '🛡️ Selin Arslan: AI güvenlik filtresi aktif...',
  '✨ Premium içerik kalitesi optimize ediliyor...',
  '📝 Disleksi dostu format uygulanıyor...',
  '🧩 Çeldirici stratejisi klinik derinlikte hazırlanıyor...',
  '⚡ Son kontroller yapılıyor...',
];

/**
 * Dinamik Yükleme Ekranı Bileşeni
 * AI üretim sürecinde skeleton loader + dinamik mesajlar gösterir
 */
export const DynamicLoader: React.FC<{
  isVisible: boolean;
  messages?: string[];
  messageIntervalMs?: number;
}> = ({
  isVisible,
  messages = LOADING_MESSAGES,
  messageIntervalMs = 2000,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [dots, setDots] = useState('');

  const nextMessage = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % messages.length);
  }, [messages.length]);

  useEffect(() => {
    if (!isVisible) return;

    // Mesaj değiştirme
    const messageTimer = setInterval(nextMessage, messageIntervalMs);

    // Animasyonlu noktalar
    const dotsTimer = setInterval(() => {
      setDots((prev) => (prev.length >= 3 ? '' : prev + '.'));
    }, 500);

    return () => {
      clearInterval(messageTimer);
      clearInterval(dotsTimer);
    };
  }, [isVisible, messageIntervalMs, nextMessage]);

  if (!isVisible) return null;

  return (
    <div className="flex flex-col items-center justify-center gap-4 p-6" role="status" aria-live="polite">
      {/* Skeleton Loader — Modern Animasyonlu */}
      <div className="w-full max-w-md space-y-3">
        <div className="h-4 rounded-full bg-gradient-to-r from-transparent via-indigo-500/20 to-transparent animate-shimmer" />
        <div className="h-3 w-3/4 rounded-full bg-gradient-to-r from-transparent via-indigo-500/15 to-transparent animate-shimmer" style={{ animationDelay: '0.2s' }} />
        <div className="h-3 w-1/2 rounded-full bg-gradient-to-r from-transparent via-indigo-500/10 to-transparent animate-shimmer" style={{ animationDelay: '0.4s' }} />
      </div>

      {/* Dinamik Mesaj */}
      <div className="glass-card px-4 py-3 text-center">
        <p className="text-sm text-zinc-300 font-mono">
          {messages[currentIndex]}
          <span className="inline-block w-8 text-left">{dots}</span>
        </p>
      </div>

      {/* Progress Indicator */}
      <div className="flex gap-1">
        {messages.map((_, idx) => (
          <div
            key={idx}
            className={`h-1 w-4 rounded-full transition-all duration-300 ${
              idx === currentIndex
                ? 'bg-indigo-500'
                : idx < currentIndex
                ? 'bg-indigo-500/40'
                : 'bg-zinc-700'
            }`}
          />
        ))}
      </div>

      <span className="sr-only">Yükleniyor...</span>
    </div>
  );
};

/**
 * Terminal Benzeri Loading Log
 * Üretim sürecindeki adımları terminal benzeri bir arayüzde gösterir
 */
export const TerminalLoader: React.FC<{
  isVisible: boolean;
  steps?: string[];
  currentStep?: number;
}> = ({
  isVisible,
  steps = LOADING_MESSAGES,
  currentStep = 0,
}) => {
  if (!isVisible) return null;

  return (
    <div className="glass-panel p-4 font-mono text-xs" role="status" aria-live="polite">
      <div className="flex items-center gap-2 mb-3 text-zinc-400">
        <div className="h-2 w-2 rounded-full bg-red-500" />
        <div className="h-2 w-2 rounded-full bg-yellow-500" />
        <div className="h-2 w-2 rounded-full bg-green-500" />
        <span className="ml-2">bdmind AI Pipeline</span>
      </div>
      <div className="space-y-1">
        {steps.map((step, idx) => (
          <div
            key={idx}
            className={`flex items-center gap-2 transition-all duration-300 ${
              idx < currentStep
                ? 'text-emerald-400'
                : idx === currentStep
                ? 'text-indigo-400'
                : 'text-zinc-600'
            }`}
          >
            <span className="w-4 text-center">
              {idx < currentStep ? '✓' : idx === currentStep ? '▸' : '○'}
            </span>
            <span>{step}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

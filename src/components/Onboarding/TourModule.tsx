import React, { useState } from 'react';
import { X, Play, SkipForward, ArrowRight, ArrowLeft, CheckCircle, Circle, Rocket } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const TourModule: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  const tourSteps = [
    {
      title: 'Hoş Geldiniz!',
      description: 'Oogmatik platformuna tur başlatıyoruz. 5 adımda platformu keşfedin.',
      highlight: 'Merkez',
      icon: Rocket
    },
    {
      title: 'Panel Kontrolü',
      description: 'Ana paneliniz. Tüm etkinlikler, istatistikler ve hızlı erişim burada.',
      highlight: 'Dashboard',
      icon: Play
    },
    {
      title: 'Akıllı Üretim',
      description: 'AI destekli etkinlik oluşturma aracı. Saniyeler içinde kişiselleştirilmiş içerik.',
      highlight: 'Studio',
      icon: Rocket
    },
    {
      title: 'Gelişmiş Yönetim',
      description: 'Öğrenci profilleri, ilerleme takibi ve bireysel raporlama alanı.',
      highlight: 'Öğrenciler',
      icon: CheckCircle
    },
    {
      title: 'Premium Güçler',
      description: 'AI asistan, gelişmiş analitik ve özel şablonlar ile tanışın.',
      highlight: 'Premium',
      icon: Rocket
    }
  ];

  const nextStep = () => {
    if (currentStep < tourSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onClose();
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const startTour = () => {
    setIsPlaying(true);
    setCurrentStep(1);
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-xl z-[110] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 40 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="bg-[var(--bg-paper)] rounded-[3rem] shadow-2xl w-full max-w-lg overflow-hidden border border-[var(--border-color)] flex flex-col font-['Lexend'] relative"
      >
        {/* Progress Bar - Ultra Compact Premium */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-[var(--bg-secondary)] overflow-hidden">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${((currentStep + 1) / tourSteps.length) * 100}%` }}
            className="h-full bg-gradient-to-r from-[var(--accent-color)] to-purple-500 shadow-[0_0_10px_rgba(99,102,241,0.5)]"
          />
        </div>

        {/* Content Area */}
        <div className="p-10 pt-12">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="text-center"
            >
              <div className="w-20 h-20 bg-gradient-to-br from-[var(--accent-color)] to-purple-600 rounded-[2rem] flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-[var(--accent-muted)] rotate-3">
                {React.createElement(tourSteps[currentStep].icon, { className: "w-10 h-10 text-white" })}
              </div>

              <h3 className="text-2xl font-black text-[var(--text-primary)] mb-3 tracking-tighter uppercase italic">
                {tourSteps[currentStep].title}
              </h3>
              <p className="text-sm font-medium text-[var(--text-secondary)] leading-relaxed mb-8 px-4 opacity-80">
                {tourSteps[currentStep].description}
              </p>

              {isPlaying && (
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--accent-muted)] rounded-full border border-[var(--accent-color)]/20 mb-8">
                  <span className="w-2 h-2 rounded-full bg-[var(--accent-color)] animate-pulse" />
                  <span className="text-[10px] font-black text-[var(--accent-color)] uppercase tracking-widest">
                    {tourSteps[currentStep].highlight} İnceleniyor
                  </span>
                </div>
              )}

              {/* Step Dots */}
              <div className="flex items-center justify-center gap-2 mb-2">
                {tourSteps.map((_, index) => (
                  <motion.div
                    key={index}
                    animate={{ 
                      width: index === currentStep ? 24 : 6,
                      backgroundColor: index === currentStep ? 'var(--accent-color)' : 'rgba(var(--text-muted-rgb), 0.2)',
                      opacity: index === currentStep ? 1 : 0.4
                    }}
                    className="h-1.5 rounded-full transition-colors"
                  />
                ))}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Footer Actions */}
        <div className="px-10 py-8 border-t border-[var(--border-color)] bg-[var(--surface-glass)] flex items-center justify-between">
          <div className="flex items-center gap-4">
            {currentStep > 0 ? (
              <button
                onClick={prevStep}
                className="w-12 h-12 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border-color)] hover:bg-[var(--surface-glass)] flex items-center justify-center transition-all active:scale-90 text-[var(--text-primary)]"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
            ) : (
              <button
                onClick={onClose}
                className="text-[10px] font-black text-[var(--text-muted)] hover:text-[var(--text-primary)] uppercase tracking-[0.2em] transition-colors"
              >
                Turu Atla
              </button>
            )}
          </div>

          <div className="flex items-center gap-3">
            {currentStep === 0 && !isPlaying ? (
              <button
                onClick={startTour}
                className="px-8 py-4 bg-[var(--accent-color)] hover:bg-[var(--accent-hover)] text-white text-xs font-black uppercase tracking-[0.2em] rounded-2xl shadow-xl shadow-[var(--accent-muted)] transition-all active:scale-95 flex items-center gap-3 group"
              >
                Turu Başlat
                <Play className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            ) : (
              <button
                onClick={nextStep}
                className="px-8 py-4 bg-[var(--accent-color)] hover:bg-[var(--accent-hover)] text-white text-xs font-black uppercase tracking-[0.2em] rounded-2xl shadow-xl shadow-[var(--accent-muted)] transition-all active:scale-95 flex items-center gap-3 group"
              >
                {currentStep === tourSteps.length - 1 ? 'Tamamla' : 'Sonraki'}
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            )}
          </div>
        </div>

        <button
          onClick={onClose}
          className="absolute top-6 right-6 w-8 h-8 rounded-full hover:bg-[var(--bg-secondary)] flex items-center justify-center text-[var(--text-muted)] transition-all active:scale-90"
        >
          <X className="w-5 h-5" />
        </button>
      </motion.div>
    </div>
  );
};

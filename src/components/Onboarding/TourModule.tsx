import React, { useState } from 'react';
import { X, Play, SkipForward, ArrowRight, ArrowLeft, CheckCircle, Circle } from 'lucide-react';

export const TourModule: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  const tourSteps = [
    {
      title: 'Hoş Geldiniz!',
      description: 'Oogmatik platformuna tur başlatıyoruz. 5 adımda platformu keşfedin.',
      highlight: 'dashboard',
      position: 'center'
    },
    {
      title: 'Dashboard',
      description: 'Ana paneliniz. Tüm etkinlikler, istatistikler ve hızlı erişim burada.',
      highlight: 'dashboard',
      position: 'left'
    },
    {
      title: 'Etkinlik Oluşturma',
      description: 'AI destekli etkinlik oluşturma aracı. Saniyeler içinde kişiselleştirilmiş içerik.',
      highlight: 'studio',
      position: 'right'
    },
    {
      title: 'Öğrenci Yönetimi',
      description: 'Öğrenci profilleri, ilerleme takibi ve bireysel raporlama.',
      highlight: 'students',
      position: 'bottom'
    },
    {
      title: 'Premium Özellikler',
      description: 'AI asistan, gelişmiş analitik ve özel şablonlar ile tanışın.',
      highlight: 'premium',
      position: 'top'
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

  const skipTour = () => {
    onClose();
  };

  const startTour = () => {
    setIsPlaying(true);
    setCurrentStep(1);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden border border-zinc-200">
        {/* Progress Bar - Ultra Compact */}
        <div className="h-1 bg-zinc-200">
          <div 
            className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 transition-all duration-300"
            style={{ width: `${((currentStep + 1) / tourSteps.length) * 100}%` }}
          />
        </div>

        {/* Header */}
        <div className="p-4 border-b border-zinc-100">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-bold text-zinc-900">
              {tourSteps[currentStep].title}
            </h3>
            <button
              onClick={onClose}
              className="w-6 h-6 rounded-lg bg-zinc-100 hover:bg-zinc-200 flex items-center justify-center transition-colors"
            >
              <X className="w-3 h-3 text-zinc-600" />
            </button>
          </div>
          <p className="text-sm text-zinc-600">
            {tourSteps[currentStep].description}
          </p>
        </div>

        {/* Content */}
        <div className="p-4">
          {/* Welcome Screen */}
          {currentStep === 0 && !isPlaying && (
            <div className="text-center py-6">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                <Play className="w-8 h-8 text-white" />
              </div>
              <h4 className="text-lg font-bold text-zinc-900 mb-2">Platform Turu</h4>
              <p className="text-sm text-zinc-600 mb-6">
                5 dakikalık hızlı tur ile Oogmatik'i keşfedin
              </p>
              <div className="flex items-center justify-center gap-2 mb-6">
                {tourSteps.map((_, index) => (
                  <div
                    key={index}
                    className={`w-2 h-2 rounded-full ${
                      index === 0 ? 'bg-blue-600' : 'bg-zinc-300'
                    }`}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Tour Steps */}
          {(isPlaying || currentStep > 0) && (
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                  <span className="text-white text-sm font-bold">{currentStep}</span>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-zinc-900">
                    Adım {currentStep} / {tourSteps.length - 1}
                  </p>
                  <p className="text-xs text-zinc-600">
                    {tourSteps[currentStep].highlight} özelliğini inceliyoruz
                  </p>
                </div>
              </div>

              {/* Step Indicators */}
              <div className="flex items-center justify-center gap-1">
                {tourSteps.slice(1).map((_, index) => (
                  <div key={index}>
                    {index + 1 === currentStep ? (
                      <CheckCircle className="w-4 h-4 text-blue-600" />
                    ) : index + 1 < currentStep ? (
                      <CheckCircle className="w-4 h-4 text-green-500" />
                    ) : (
                      <Circle className="w-4 h-4 text-zinc-300" />
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer - Compact Actions */}
        <div className="p-4 border-t border-zinc-100 bg-zinc-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {currentStep > 0 && (
                <button
                  onClick={prevStep}
                  className="w-8 h-8 rounded-lg bg-white border border-zinc-200 hover:bg-zinc-50 flex items-center justify-center transition-colors"
                >
                  <ArrowLeft className="w-4 h-4 text-zinc-600" />
                </button>
              )}
              <button
                onClick={skipTour}
                className="text-xs text-zinc-500 hover:text-zinc-700 transition-colors"
              >
                Atla
              </button>
            </div>

            <div className="flex items-center gap-2">
              {currentStep === 0 && !isPlaying ? (
                <button
                  onClick={startTour}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors flex items-center gap-2"
                >
                  <Play className="w-4 h-4" />
                  Turu Başlat
                </button>
              ) : (
                <button
                  onClick={nextStep}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors flex items-center gap-2"
                >
                  {currentStep === tourSteps.length - 1 ? 'Bitir' : 'Sonraki'}
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

'use client';
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RefreshCw, CheckCircle2, AlertTriangle, Lightbulb } from 'lucide-react';
import { DyslexicText } from '../../atoms/DyslexicText';

interface AbsurdityItem {
  id: string;
  imageUrl?: string;
  description: string;
  isAbsurd: boolean; // Mantıksız mı?
  explanation: string; // Neden mantıksız/mantıklı
}

interface LogicAbsurdityProps {
  title: string;
  instruction: string;
  items: AbsurdityItem[];
  onComplete?: (score: number) => void;
}

export const LogicAbsurdity: React.FC<LogicAbsurdityProps> = ({
  title,
  instruction,
  items,
  onComplete,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showExplanation, setShowExplanation] = useState(false);
  const [flipped, setFlipped] = useState(false);
  const [score, setScore] = useState(0);
  const [isFinished, setIsFinished] = useState(false);

  const currentItem = items[currentIndex];

  const handleChoice = (userSaysAbsurd: boolean) => {
    const isCorrect = userSaysAbsurd === currentItem.isAbsurd;
    if (isCorrect) setScore((s) => s + 1);

    setShowExplanation(true);

    // Eğer görsel mantıksızsa ve kullanıcı doğru bildiyse, görseli "düzeltme" animasyonu yap
    if (currentItem.isAbsurd && isCorrect) {
      setFlipped(true); // Ters duran objeyi düzeltme simülasyonu
    }
  };

  const handleNext = () => {
    setShowExplanation(false);
    setFlipped(false);
    if (currentIndex < items.length - 1) {
      setCurrentIndex((i) => i + 1);
    } else {
      setIsFinished(true);
      if (onComplete) onComplete(score);
    }
  };

  if (isFinished) {
    return (
      <div className="bg-white rounded-3xl p-8 text-center shadow-sm border-2 border-rose-100">
        <div className="w-24 h-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 size={48} />
        </div>
        <h3 className="text-3xl font-bold text-gray-800 mb-4">Harika İş!</h3>
        <p className="text-xl text-gray-600 mb-8">
          Mantık bulmacasını tamamladın. {items.length} sorudan {score} tanesini doğru bildin.
        </p>
        <button
          onClick={() => {
            setCurrentIndex(0);
            setScore(0);
            setIsFinished(false);
            setFlipped(false);
            setShowExplanation(false);
          }}
          className="px-8 py-4 bg-rose-500 text-white rounded-2xl font-bold text-xl hover:bg-rose-600 transition-colors"
        >
          Tekrar Oyna
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl p-6 md:p-10 shadow-sm border-2 border-rose-50 overflow-hidden relative">
      <div className="flex justify-between items-center mb-8 border-b-2 border-gray-50 pb-4">
        <div>
          <span className="inline-block px-3 py-1 bg-rose-100 text-rose-800 rounded-full text-sm font-bold mb-3">
            Mantıksızlık Bulma
          </span>
          <h2 className="text-2xl font-bold text-gray-800">{title}</h2>
        </div>
        <div className="text-rose-500 font-bold text-xl bg-rose-50 px-4 py-2 rounded-xl border border-rose-100">
          {currentIndex + 1} / {items.length}
        </div>
      </div>

      <p className="text-xl text-gray-600 mb-8 font-medium">
        <DyslexicText text={instruction} />
      </p>

      <div className="flex flex-col md:flex-row gap-8 items-center mb-8">
        {/* Placeholder for Image - Animates based on 'flipped' state */}
        <motion.div
          className="w-full md:w-1/2 aspect-square bg-gray-100 rounded-3xl border-4 border-dashed border-gray-300 flex flex-col items-center justify-center text-gray-400 p-6 relative overflow-hidden"
          animate={{ rotate: flipped ? 180 : 0 }}
          transition={{ type: 'spring', stiffness: 100, damping: 15 }}
        >
          {currentItem.imageUrl ? (
            <img
              src={currentItem.imageUrl}
              alt="Mantık Görseli"
              className="w-full h-full object-contain"
            />
          ) : (
            <>
              <RefreshCw size={64} className="mb-4 opacity-50" />
              <p className="text-center font-medium">
                Görsel Alanı
                <br />
                (AI tarafından üretilecek)
              </p>
            </>
          )}

          {/* Overlay to show correction effect */}
          <AnimatePresence>
            {flipped && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="absolute inset-0 bg-green-500/20 backdrop-blur-sm flex items-center justify-center"
              >
                <div className="bg-white px-6 py-3 rounded-full text-green-700 font-bold text-xl shadow-lg border-2 border-green-200">
                  Düzeltildi!
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        <div className="w-full md:w-1/2 flex flex-col gap-6">
          <div className="p-6 bg-rose-50 rounded-2xl border-2 border-rose-100 text-2xl font-medium text-gray-800 text-center leading-relaxed">
            <DyslexicText text={currentItem.description} />
          </div>

          {!showExplanation ? (
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => handleChoice(true)}
                className="py-5 bg-rose-100 text-rose-800 rounded-2xl border-2 border-rose-300 font-bold text-xl hover:bg-rose-200 hover:scale-[1.02] transition-all flex flex-col items-center gap-2"
              >
                <AlertTriangle size={28} />
                Mantıksız!
              </button>
              <button
                onClick={() => handleChoice(false)}
                className="py-5 bg-emerald-100 text-emerald-800 rounded-2xl border-2 border-emerald-300 font-bold text-xl hover:bg-emerald-200 hover:scale-[1.02] transition-all flex flex-col items-center gap-2"
              >
                <CheckCircle2 size={28} />
                Mantıklı
              </button>
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-6 bg-blue-50 rounded-2xl border-2 border-blue-200"
            >
              <div className="flex items-center gap-3 text-blue-800 font-bold text-xl mb-3">
                <Lightbulb size={24} className="text-yellow-500 fill-yellow-500" />
                Açıklama:
              </div>
              <p className="text-lg text-blue-900 font-medium leading-relaxed">
                {currentItem.explanation}
              </p>

              <button
                onClick={handleNext}
                className="mt-6 w-full py-4 bg-blue-600 text-white rounded-xl font-bold text-lg hover:bg-blue-700 transition-colors shadow-sm"
              >
                Sonraki Soru
              </button>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};

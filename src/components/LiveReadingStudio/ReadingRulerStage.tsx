import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { ReadingPassage } from './sampleStories';

interface ReadingRulerStageProps {
  passage: ReadingPassage;
  currentWordIndex: number;
  highlightedSyllable: string | null;
  fontSize: number;
  isRulerActive: boolean;
  isSyllableColoringActive: boolean;
  onWordClick?: (index: number) => void;
}

export const ReadingRulerStage: React.FC<ReadingRulerStageProps> = ({
  passage,
  currentWordIndex,
  highlightedSyllable,
  fontSize,
  isRulerActive,
  isSyllableColoringActive,
  onWordClick,
}) => {
  // Cümle veya satır bazında kelimeleri grupla
  const words = passage.words;

  return (
    <div className="relative w-full max-w-4xl mx-auto rounded-[2.5rem] bg-zinc-950/70 border border-white/10 p-8 sm:p-12 shadow-2xl backdrop-blur-2xl transition-all duration-300">
      {/* Başlık */}
      <div className="flex items-center justify-between pb-6 mb-6 border-b border-white/10">
        <div>
          <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 mb-2">
            {passage.targetSkill}
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight font-lexend">
            {passage.title}
          </h2>
        </div>
        <div className="text-right">
          <span className="text-xs text-zinc-400 font-medium block">Zorluk Derecesi</span>
          <div className="flex items-center gap-1 mt-1 justify-end">
            {[1, 2, 3].map((star) => (
              <span
                key={star}
                className={`text-sm ${star <= passage.difficultyRating ? 'text-amber-400' : 'text-zinc-600'}`}
              >
                ★
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Metin Alanı (Okuma Sahnesi) */}
      <div
        className="flex flex-wrap items-center gap-x-3 gap-y-4 font-lexend leading-relaxed select-none transition-all duration-200"
        style={{ fontSize: `${fontSize}px` }}
      >
        {words.map((word, index) => {
          const isRead = index < currentWordIndex;
          const isActive = index === currentWordIndex;
          const isPending = index > currentWordIndex;

          // Okuma cetveli aktifken aktif kelimeden çok uzaktaki kelimeleri yarı saydam karart
          const isFarFromActive = isRulerActive && Math.abs(index - currentWordIndex) > 8;

          // Heceli kelime parçaları
          const syllables = passage.syllabifiedWords[index] || [word];

          return (
            <motion.span
              key={`${word}-${index}`}
              onClick={() => onWordClick?.(index)}
              className={`relative cursor-pointer rounded-2xl px-2.5 py-1.5 transition-all duration-200 ${
                isActive
                  ? 'bg-amber-400/20 border-2 border-amber-400 text-amber-200 shadow-lg shadow-amber-500/20 scale-105 font-bold z-10'
                  : isRead
                  ? 'text-emerald-400 font-medium'
                  : isFarFromActive
                  ? 'text-zinc-600 opacity-40 blur-[0.3px]'
                  : 'text-zinc-200 hover:text-white hover:bg-white/5'
              }`}
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.95 }}
            >
              {/* Aktif Kelime İpuçlu Hece Vurgusu */}
              {isActive && highlightedSyllable && (
                <span className="absolute -top-7 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full bg-rose-500 text-white text-xs font-bold shadow-md animate-bounce whitespace-nowrap">
                  İpucu: {highlightedSyllable}-...
                </span>
              )}

              {/* Kelime Gövdesi */}
              {isSyllableColoringActive ? (
                <span>
                  {syllables.map((syl, sIdx) => (
                    <span
                      key={sIdx}
                      className={
                        isActive
                          ? 'text-amber-300'
                          : isRead
                          ? 'text-emerald-400'
                          : sIdx % 2 === 0
                          ? 'text-indigo-300'
                          : 'text-rose-300'
                      }
                    >
                      {syl}
                    </span>
                  ))}
                  {/* Noktalama işareti varsa koru */}
                  {word.slice(syllables.join('').length)}
                </span>
              ) : (
                <span>{word}</span>
              )}

              {/* Okunmuş Kelime Alt Çizgisi */}
              {isRead && (
                <span className="absolute bottom-0 left-2 right-2 h-0.5 bg-emerald-500/40 rounded-full" />
              )}
            </motion.span>
          );
        })}
      </div>

      {/* İlerleme Çubuğu */}
      <div className="mt-10 pt-6 border-t border-white/10 flex items-center justify-between text-xs text-zinc-400 font-medium">
        <span>
          İlerleme: {currentWordIndex} / {words.length} kelime
        </span>
        <div className="w-48 h-2 bg-zinc-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-300"
            style={{ width: `${Math.min(100, Math.round((currentWordIndex / words.length) * 100))}%` }}
          />
        </div>
        <span>%{Math.min(100, Math.round((currentWordIndex / words.length) * 100))}</span>
      </div>
    </div>
  );
};

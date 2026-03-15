'use client';
import React, { useState, useCallback, useMemo, useRef } from 'react';
import * as Popover from '@radix-ui/react-popover';
import { ReadingRuler } from '../atoms/ReadingRuler';
import { TextPassage as TextPassageType } from '../../types/schemas';
import { BookA, Eye, Volume2, Loader2, VolumeX, Sparkles } from 'lucide-react';
import { ttsService } from '../../ai/textToSpeech';
import { generateCreativeMultimodal } from '../../../../../services/geminiClient';
import { motion } from 'framer-motion';

interface TextPassageProps {
  passage: TextPassageType;
  enableRuler?: boolean;
}

// FAZ C — C2: In-session kelime tanımı cache (Map)
const definitionCache = new Map<string, string>();

// FAZ C — C3: prefers-reduced-motion kontrolü
const prefersReducedMotion =
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export const TextPassage: React.FC<TextPassageProps> = ({ passage, enableRuler = false }) => {
  const [rulerActive, setRulerActive] = useState(enableRuler);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [selectedWord, setSelectedWord] = useState<{ word: string; definition: string; isLoading: boolean } | null>(null);

  // FAZ C — C2: debounce ref (500ms)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // FAZ E — E1: useMemo kelime listesi (her render'da split etme)
  const words = useMemo(() => passage.content.split(' '), [passage.content]);

  // FAZ C — C2: Debounce + cache ile Gemini bağlamsal sözlük
  const fetchWordDefinition = useCallback(
    (word: string) => {
      const cleanWord = word.replace(/[.,!?'"';:()]/g, '').trim();
      if (!cleanWord || cleanWord.length < 2) return;

      // Cache kontrolü
      if (definitionCache.has(cleanWord)) {
        setSelectedWord({ word: cleanWord, definition: definitionCache.get(cleanWord)!, isLoading: false });
        return;
      }

      setSelectedWord({ word: cleanWord, definition: '', isLoading: true });

      // Mevcut debounce'u iptal et
      if (debounceRef.current) clearTimeout(debounceRef.current);

      debounceRef.current = setTimeout(async () => {
        try {
          const prompt = `Bir öğretmen olarak, "${cleanWord}" kelimesinin aşağıdaki metindeki bağlamsal anlamını disleksili bir 2. sınıf öğrencisine açıkla.\n\nMETİN BAĞLAMI: "${passage.content.substring(0, 300)}"\n\nSadece 1-2 kısa, anlaşılır cümle döndür.`;
          const result = await generateCreativeMultimodal({ prompt, temperature: 0.5 });
          const definition =
            typeof result === 'string'
              ? result
              : result?.definition || result?.text || result?.content || String(result);
          const cleaned = String(definition).replace(/^["']|["']$/g, '').trim();

          // Cache'e ekle
          definitionCache.set(cleanWord, cleaned);
          setSelectedWord({ word: cleanWord, definition: cleaned, isLoading: false });
        } catch {
          const fallback = `"${cleanWord}" kelimesi bu metinde önemli bir anlam taşımaktadır.`;
          definitionCache.set(cleanWord, fallback);
          setSelectedWord({ word: cleanWord, definition: fallback, isLoading: false });
        }
      }, 500); // 500ms debounce
    },
    [passage.content]
  );

  const handleSpeak = () => {
    if (isSpeaking) {
      ttsService.stopNative();
      setIsSpeaking(false);
      return;
    }
    setIsSpeaking(true);
    ttsService.speakNative(
      { text: passage.content, speed: 0.85 },
      () => setIsSpeaking(true),
      () => setIsSpeaking(false)
    );
  };

  // FAZ E — E1: words useMemo'dan geliyor, yeniden split edilmiyor
  const renderClickableWords = () => {
    return words.map((word, idx) => (
      <Popover.Root key={idx} onOpenChange={(open) => open && fetchWordDefinition(word)}>
        <Popover.Trigger asChild>
          <motion.button
            // FAZ C — C3: reduced-motion desteği
            whileHover={prefersReducedMotion ? {} : { backgroundColor: '#fef08a', scale: 1.02 }}
            className="inline rounded px-0.5 transition-colors outline-none cursor-pointer mr-[0.2em] mb-1"
            aria-label={`${word} kelimesinin anlamını gör`}
          >
            {word}
          </motion.button>
        </Popover.Trigger>
        <Popover.Portal>
          <Popover.Content
            className="z-[60] max-w-sm p-5 bg-white rounded-2xl shadow-xl border-2 border-indigo-100 text-gray-800"
            sideOffset={5}
            align="center"
          >
            <motion.div
              initial={prefersReducedMotion ? {} : { opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col gap-3"
            >
              <div className="flex items-center gap-2 text-indigo-700 font-bold border-b-2 border-indigo-50 pb-2">
                <BookA size={22} />
                <span className="text-xl">{selectedWord?.word}</span>
                {selectedWord?.isLoading ? (
                  <Loader2 size={16} className="animate-spin text-indigo-400 ml-auto" />
                ) : (
                  <Sparkles size={14} className="text-indigo-400 ml-auto" />
                )}
              </div>
              <p className="text-lg leading-relaxed font-medium min-h-[3rem]">
                {selectedWord?.isLoading ? (
                  <span className="text-gray-400 italic">AI açıklama arıyor...</span>
                ) : (
                  selectedWord?.definition
                )}
              </p>
            </motion.div>
            <Popover.Arrow className="fill-indigo-100 w-4 h-2" />
          </Popover.Content>
        </Popover.Portal>
      </Popover.Root>
    ));
  };

  return (
    <div className="bg-white rounded-[2rem] p-6 md:p-10 shadow-sm border-2 border-gray-100 relative overflow-hidden">
      <ReadingRuler isActive={rulerActive} />

      <div className="flex justify-between items-center mb-8 border-b-2 border-gray-50 pb-6 relative z-10">
        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 tracking-tight">
          {passage.title}
        </h2>
        <div className="flex items-center gap-3 shrink-0 ml-4">
          <motion.button
            whileHover={prefersReducedMotion ? {} : { scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setRulerActive(!rulerActive)}
            className={`p-4 rounded-2xl transition-all flex items-center justify-center shadow-sm border-2 ${rulerActive ? 'bg-indigo-100 border-indigo-300 text-indigo-700' : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
              }`}
            title="Okuma Çubuğunu Aç/Kapat"
            aria-pressed={rulerActive}
          >
            <Eye size={24} />
          </motion.button>
          <motion.button
            whileHover={prefersReducedMotion ? {} : { scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleSpeak}
            className={`p-4 rounded-2xl border-2 transition-all shadow-sm flex items-center justify-center gap-2 ${isSpeaking
                ? 'bg-blue-100 border-blue-300 text-blue-700'
                : 'bg-blue-50 border-blue-200 text-blue-600 hover:bg-blue-100'
              }`}
            title={isSpeaking ? 'Durdur' : 'Sesli Oku'}
          >
            {isSpeaking ? (
              <><VolumeX size={22} /><span className="text-sm font-bold hidden sm:inline">Durdur</span></>
            ) : (
              <><Volume2 size={22} /><span className="text-sm font-bold hidden sm:inline">Sesli Oku</span></>
            )}
          </motion.button>
        </div>
      </div>

      <div
        className="text-xl md:text-2xl text-gray-800 font-medium relative z-10 leading-relaxed"
        style={{ fontFamily: 'var(--dyslexia-font-family)', lineHeight: 'var(--dyslexia-line-height, 1.8)' }}
      >
        {renderClickableWords()}
      </div>

      <p className="mt-6 text-sm font-medium text-gray-400 relative z-10 flex items-center gap-1.5">
        <BookA size={14} />
        Herhangi bir kelimeye tıklayarak anlamını öğrenebilirsin.
      </p>
    </div>
  );
};

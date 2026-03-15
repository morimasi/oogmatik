'use client';
import React, { useState, useCallback } from 'react';
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

interface WordDefinition {
  word: string;
  definition: string;
  isLoading: boolean;
}

export const TextPassage: React.FC<TextPassageProps> = ({ passage, enableRuler = false }) => {
  const [rulerActive, setRulerActive] = useState(enableRuler);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [selectedWord, setSelectedWord] = useState<WordDefinition | null>(null);

  // Gemini ile bağlamsal sözlük
  const fetchWordDefinition = useCallback(
    async (word: string) => {
      const cleanWord = word.replace(/[.,!?"';:()]/g, '');
      if (!cleanWord) return;

      setSelectedWord({ word: cleanWord, definition: '', isLoading: true });

      try {
        const prompt = `
Bir öğretmen olarak, "${cleanWord}" kelimesinin aşağıdaki metindeki bağlamsal anlamını
disleksili bir 2. sınıf öğrencisine açıkla.

**METİN BAĞLAMI:**
"${passage.content.substring(0, 300)}"

Sadece 1-2 kısa, anlaşılır cümle döndür. Teknik terim kullanma.
`;
        const result = await generateCreativeMultimodal({ prompt, temperature: 0.5 });
        const definition =
          typeof result === 'string'
            ? result
            : result?.definition || result?.text || result?.content || String(result);

        setSelectedWord({
          word: cleanWord,
          definition: String(definition).replace(/^["']|["']$/g, '').trim(),
          isLoading: false,
        });
      } catch {
        setSelectedWord({
          word: cleanWord,
          definition: `"${cleanWord}" kelimesi bu metinde bağlamsal bir anlam taşımaktadır.`,
          isLoading: false,
        });
      }
    },
    [passage.content]
  );

  // TTS: Metni sesli oku
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

  const renderClickableWords = (text: string) => {
    const words = text.split(' ');
    return words.map((word, idx) => (
      <Popover.Root key={idx} onOpenChange={(open) => open && fetchWordDefinition(word)}>
        <Popover.Trigger asChild>
          <motion.button
            whileHover={{ backgroundColor: '#fef08a', scale: 1.02 }}
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
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col gap-3"
            >
              <div className="flex items-center gap-2 text-indigo-700 font-bold border-b-2 border-indigo-50 pb-2">
                <BookA size={22} />
                <span className="text-xl">{selectedWord?.word}</span>
                {selectedWord?.isLoading && (
                  <Loader2 size={16} className="animate-spin text-indigo-400 ml-auto" />
                )}
                {!selectedWord?.isLoading && (
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
          {/* Reading Ruler Toggle */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setRulerActive(!rulerActive)}
            className={`p-4 rounded-2xl transition-all flex items-center justify-center shadow-sm border-2 ${rulerActive ? 'bg-indigo-100 border-indigo-300 text-indigo-700' : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'}`}
            title="Okuma Çubuğunu Aç/Kapat"
            aria-pressed={rulerActive}
          >
            <Eye size={24} />
          </motion.button>

          {/* TTS Button — always visible, uses native browser TTS */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleSpeak}
            className={`p-4 rounded-2xl border-2 transition-all shadow-sm flex items-center justify-center gap-2 ${isSpeaking ? 'bg-blue-100 border-blue-300 text-blue-700' : 'bg-blue-50 border-blue-200 text-blue-600 hover:bg-blue-100 hover:border-blue-300'}`}
            title={isSpeaking ? 'Durdur' : 'Sesli Oku'}
            aria-label={isSpeaking ? 'Sesli okumayı durdur' : 'Metni sesli oku'}
          >
            {isSpeaking ? (
              <>
                <VolumeX size={22} />
                <span className="text-sm font-bold hidden sm:inline">Durdur</span>
              </>
            ) : (
              <>
                <Volume2 size={22} />
                <span className="text-sm font-bold hidden sm:inline">Sesli Oku</span>
              </>
            )}
          </motion.button>
        </div>
      </div>

      <div
        className="text-xl md:text-2xl text-gray-800 font-medium relative z-10 leading-relaxed"
        style={{ fontFamily: 'var(--dyslexia-font-family)', lineHeight: 'var(--dyslexia-line-height, 1.8)' }}
      >
        {renderClickableWords(passage.content)}
      </div>

      {/* Helper tip */}
      <p className="mt-6 text-sm font-medium text-gray-400 relative z-10 flex items-center gap-1.5">
        <BookA size={14} />
        Herhangi bir kelimeye tıklayarak anlamını öğrenebilirsin.
      </p>
    </div>
  );
};

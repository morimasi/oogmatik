'use client';
import React, { useState } from 'react';
import * as Popover from '@radix-ui/react-popover';
import { ReadingRuler } from '../atoms/ReadingRuler';
import { TextPassage as TextPassageType } from '../../types/schemas';
import { BookA, Eye, Volume2 } from 'lucide-react';

interface TextPassageProps {
  passage: TextPassageType;
  enableRuler?: boolean;
}

export const TextPassage: React.FC<TextPassageProps> = ({ passage, enableRuler = false }) => {
  const [rulerActive, setRulerActive] = useState(enableRuler);
  const [selectedWord, setSelectedWord] = useState<string | null>(null);

  // Simplified dictionary lookup logic (Mock AI Dictionary)
  const getDefinition = (word: string) => {
    // In a real application, this would call an API with the text context
    const cleanWord = word.replace(/[.,!?";:()]/g, '');
    return `"${cleanWord}" kelimesi bu metinde: "Örnek bağlamsal açıklama veya görsel betimleme" anlamında kullanılmıştır.`;
  };

  const renderClickableWords = (text: string) => {
    const words = text.split(' ');
    return words.map((word, idx) => (
      <Popover.Root key={idx}>
        <Popover.Trigger asChild>
          <button
            className="inline hover:bg-yellow-200 focus:bg-yellow-300 rounded px-1 transition-colors outline-none cursor-pointer mr-[0.2em] mb-1"
            onClick={() => setSelectedWord(word)}
            aria-label={`${word} kelimesinin anlamını gör`}
          >
            {word}
          </button>
        </Popover.Trigger>
        <Popover.Portal>
          <Popover.Content
            className="z-[60] max-w-sm p-5 bg-white rounded-2xl shadow-xl border-4 border-indigo-100 text-gray-800 animate-in fade-in zoom-in duration-200"
            sideOffset={5}
            align="center"
          >
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-2 text-indigo-700 font-bold border-b-2 border-indigo-50 pb-2">
                <BookA size={24} />
                <span className="text-xl">{selectedWord?.replace(/[.,!?";:()]/g, '')}</span>
              </div>
              <p className="text-lg leading-relaxed font-medium">
                {selectedWord ? getDefinition(selectedWord) : ''}
              </p>
            </div>
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
          <button
            onClick={() => setRulerActive(!rulerActive)}
            className={`p-4 rounded-2xl transition-all flex items-center justify-center shadow-sm border-2 ${rulerActive ? 'bg-indigo-100 border-indigo-300 text-indigo-700' : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'}`}
            title="Okuma Çubuğunu Aç/Kapat"
            aria-pressed={rulerActive}
          >
            <Eye size={28} />
          </button>

          {passage.assets?.audioUrl && (
            <button
              className="p-4 rounded-2xl bg-blue-50 border-2 border-blue-200 text-blue-700 hover:bg-blue-100 hover:border-blue-300 transition-all shadow-sm flex items-center justify-center"
              title="Sesli Oku"
              aria-label="Metni Sesli Oku"
            >
              <Volume2 size={28} />
            </button>
          )}
        </div>
      </div>

      <div className="text-xl md:text-2xl text-gray-800 font-medium relative z-10">
        {renderClickableWords(passage.content)}
      </div>
    </div>
  );
};

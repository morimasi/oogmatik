'use client';
import React, { useState, useRef, useEffect } from 'react';
import { DyslexicText } from '../../atoms/DyslexicText';
import { CheckCircle2, XCircle, Type, RotateCcw } from 'lucide-react';

interface ErrorToken {
  id: string;
  originalText: string;
  correctText: string;
  isPunctuationError: boolean;
  type: 'spelling' | 'punctuation';
  indexInText: number;
}

interface InlineTextEditorProps {
  instruction: string;
  textParts: string[]; // ["Ali ", "giti", " eve"]
  errors: ErrorToken[]; // The objects matching the wrong parts
  onComplete?: (score: number) => void;
}

export const InlineTextEditor: React.FC<InlineTextEditorProps> = ({
  instruction,
  textParts,
  errors,
  onComplete,
}) => {
  const [userEdits, setUserEdits] = useState<Record<string, string>>({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [results, setResults] = useState<Record<string, boolean>>({});

  // Track which error token is currently being edited
  const [activeEditId, setActiveEditId] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (activeEditId && inputRef.current) {
      inputRef.current.focus();
    }
  }, [activeEditId]);

  const handleEditChange = (val: string) => {
    if (activeEditId) {
      setUserEdits((prev) => ({ ...prev, [activeEditId]: val }));
    }
  };

  const handleBlur = () => {
    setActiveEditId(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      setActiveEditId(null);
    }
  };

  const handleSubmit = () => {
    const newResults: Record<string, boolean> = {};
    let correctCount = 0;

    errors.forEach((err) => {
      // If user hasn't edited, consider it wrong since it's an error token
      const userVal =
        userEdits[err.id]?.trim().toLowerCase() || err.originalText.trim().toLowerCase();
      const isCorrect = userVal === err.correctText.trim().toLowerCase();
      newResults[err.id] = isCorrect;
      if (isCorrect) correctCount++;
    });

    setResults(newResults);
    setIsSubmitted(true);
    if (onComplete) onComplete(correctCount);
  };

  const resetActivity = () => {
    setUserEdits({});
    setResults({});
    setIsSubmitted(false);
    setActiveEditId(null);
  };

  return (
    <div className="bg-white rounded-3xl p-6 shadow-sm border-2 border-amber-50 relative overflow-hidden">
      <div className="flex justify-between items-start mb-6">
        <div>
          <span className="inline-block px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-sm font-bold mb-3 flex items-center gap-2">
            <Type size={16} /> Yazım & Noktalama Editörü
          </span>
          <h3 className="text-2xl font-bold text-gray-800 mb-2">
            <DyslexicText text={instruction} />
          </h3>
        </div>
      </div>

      <div className="bg-gray-50 rounded-2xl p-8 mb-8 border-2 border-gray-100 leading-[3rem] text-2xl font-medium text-gray-800 shadow-inner">
        {textParts.map((part, idx) => {
          // Check if this part corresponds to an error token (based on index)
          const errorToken = errors.find((e) => e.indexInText === idx);

          if (errorToken) {
            const isEditing = activeEditId === errorToken.id;
            const currentValue =
              userEdits[errorToken.id] !== undefined
                ? userEdits[errorToken.id]
                : errorToken.originalText;

            if (isSubmitted) {
              const isCorrect = results[errorToken.id];
              return (
                <span
                  key={idx}
                  className={`relative inline-block mx-1 px-2 rounded-lg border-b-4 font-bold ${isCorrect ? 'bg-green-100 border-green-500 text-green-800' : 'bg-red-100 border-red-500 text-red-800 line-through'}`}
                >
                  {currentValue}
                  {isCorrect && (
                    <CheckCircle2
                      size={16}
                      className="absolute -top-2 -right-2 text-green-600 bg-white rounded-full"
                    />
                  )}
                  {!isCorrect && (
                    <XCircle
                      size={16}
                      className="absolute -top-2 -right-2 text-red-600 bg-white rounded-full"
                    />
                  )}
                </span>
              );
            }

            if (isEditing) {
              return (
                <input
                  key={idx}
                  ref={inputRef}
                  type="text"
                  value={currentValue}
                  onChange={(e) => handleEditChange(e.target.value)}
                  onBlur={handleBlur}
                  onKeyDown={handleKeyDown}
                  className="mx-1 px-2 py-1 bg-yellow-100 text-yellow-900 border-b-4 border-yellow-400 font-bold focus:outline-none w-32 text-center rounded-t-xl shadow-md transition-all"
                />
              );
            }

            return (
              <button
                key={idx}
                onClick={() => setActiveEditId(errorToken.id)}
                className="mx-1 px-2 py-1 bg-white text-indigo-700 border-b-4 border-dashed border-indigo-300 font-bold hover:bg-indigo-50 hover:border-indigo-500 transition-colors rounded-t-xl cursor-text relative group"
                title="Düzeltmek için tıkla"
              >
                {currentValue}
                <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                  Düzelt
                </span>
              </button>
            );
          }

          // Normal text part
          return <span key={idx}>{part}</span>;
        })}
      </div>

      <div className="flex gap-4">
        {!isSubmitted ? (
          <button
            onClick={handleSubmit}
            className="flex-1 py-4 rounded-2xl bg-amber-500 text-white text-xl font-bold hover:bg-amber-600 transition-colors shadow-sm"
          >
            Metni Kontrol Et
          </button>
        ) : (
          <>
            <div
              className={`flex-1 p-4 rounded-2xl border-2 flex items-center gap-4 ${Object.values(results).every((v) => v) ? 'bg-green-50 border-green-200' : 'bg-orange-50 border-orange-200'}`}
            >
              <span className="text-xl font-bold text-gray-800">
                {errors.length} hatadan {Object.values(results).filter((v) => v).length} tanesini
                düzelttin.
              </span>
            </div>
            <button
              onClick={resetActivity}
              className="px-6 py-4 rounded-2xl bg-gray-100 text-gray-700 font-bold hover:bg-gray-200 transition-colors flex items-center gap-2 border-2 border-gray-200"
            >
              <RotateCcw size={24} />
              Tekrar Dene
            </button>
          </>
        )}
      </div>
    </div>
  );
};

'use client';
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { DyslexicText } from '../../atoms/DyslexicText';
import { Sparkles, RefreshCcw } from 'lucide-react';

export interface CardItem {
  id: string;
  type: 'word' | 'meaning' | 'synonym' | 'antonym';
  content: string;
  matchId: string; // The ID of the card it matches with
  imageUrl?: string;
}

interface FlipCardGameProps {
  instruction: string;
  cards: CardItem[];
  onComplete?: (moves: number) => void;
}

export const FlipCardGame: React.FC<FlipCardGameProps> = ({
  instruction,
  cards: initialCards,
  onComplete,
}) => {
  const [cards, setCards] = useState<CardItem[]>([]);
  const [flippedIds, setFlippedIds] = useState<string[]>([]);
  const [matchedIds, setMatchedIds] = useState<string[]>([]);
  const [moves, setMoves] = useState(0);
  const [isFinished, setIsFinished] = useState(false);

  useEffect(() => {
    // Shuffle cards on mount
    const shuffled = [...initialCards].sort(() => Math.random() - 0.5);
    setCards(shuffled);
  }, [initialCards]);

  useEffect(() => {
    if (flippedIds.length === 2) {
      const [firstId, secondId] = flippedIds;
      const firstCard = cards.find((c) => c.id === firstId);
      const secondCard = cards.find((c) => c.id === secondId);

      if (firstCard && secondCard && firstCard.matchId === secondCard.id) {
        // Match found
        setMatchedIds((prev) => [...prev, firstId, secondId]);
        setFlippedIds([]);

        // Check if game is over
        if (matchedIds.length + 2 === cards.length) {
          setIsFinished(true);
          if (onComplete) onComplete(moves + 1);
        }
      } else {
        // No match, unflip after delay
        const timer = setTimeout(() => {
          setFlippedIds([]);
        }, 1000);
        return () => clearTimeout(timer);
      }
      setMoves((m) => m + 1);
    }
  }, [flippedIds, cards, matchedIds.length, moves, onComplete]);

  const handleCardClick = (id: string) => {
    if (flippedIds.length === 2) return; // Prevent flipping more than 2
    if (flippedIds.includes(id) || matchedIds.includes(id)) return; // Prevent clicking already flipped/matched

    setFlippedIds((prev) => [...prev, id]);
  };

  const restartGame = () => {
    setCards([...initialCards].sort(() => Math.random() - 0.5));
    setFlippedIds([]);
    setMatchedIds([]);
    setMoves(0);
    setIsFinished(false);
  };

  return (
    <div className="bg-white rounded-3xl p-6 md:p-10 shadow-sm border-2 border-emerald-50">
      <div className="flex justify-between items-center mb-8 border-b-2 border-gray-50 pb-4">
        <div>
          <span className="inline-block px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full text-sm font-bold mb-3 flex items-center gap-2">
            <Sparkles size={16} /> Hafıza Kartları
          </span>
          <h2 className="text-2xl font-bold text-gray-800">
            <DyslexicText text={instruction} />
          </h2>
        </div>
        <div className="text-emerald-600 font-bold text-xl bg-emerald-50 px-4 py-2 rounded-xl border border-emerald-100 flex flex-col items-center">
          <span className="text-xs uppercase tracking-wider text-emerald-500">Hamle</span>
          {moves}
        </div>
      </div>

      {isFinished ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-6">🏆</div>
          <h3 className="text-3xl font-bold text-gray-800 mb-4">Tebrikler!</h3>
          <p className="text-xl text-gray-600 mb-8 font-medium">
            Tüm kartları {moves} hamlede eşleştirdin.
          </p>
          <button
            onClick={restartGame}
            className="px-8 py-4 bg-emerald-500 text-white rounded-2xl font-bold text-xl hover:bg-emerald-600 transition-colors shadow-sm inline-flex items-center gap-3"
          >
            <RefreshCcw size={24} />
            Yeniden Oyna
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {cards.map((card) => {
            const isFlipped = flippedIds.includes(card.id) || matchedIds.includes(card.id);
            const isMatched = matchedIds.includes(card.id);

            return (
              <div
                key={card.id}
                className="perspective-1000 w-full aspect-[3/4] cursor-pointer"
                onClick={() => handleCardClick(card.id)}
              >
                <motion.div
                  className="w-full h-full relative preserve-3d"
                  animate={{ rotateY: isFlipped ? 180 : 0 }}
                  transition={{ type: 'spring', stiffness: 260, damping: 20 }}
                >
                  {/* Front of card (Hidden state) */}
                  <div
                    className={`absolute inset-0 backface-hidden bg-gradient-to-br from-emerald-400 to-teal-500 rounded-2xl border-4 border-emerald-200 shadow-md flex items-center justify-center hover:scale-105 transition-transform ${isFlipped ? 'pointer-events-none' : ''}`}
                  >
                    <Sparkles className="text-white opacity-50" size={48} />
                  </div>

                  {/* Back of card (Revealed state) */}
                  <div
                    className={`absolute inset-0 backface-hidden rotate-y-180 bg-white rounded-2xl border-4 shadow-md flex flex-col items-center justify-center p-4 ${isMatched ? 'border-emerald-400 bg-emerald-50' : 'border-emerald-200'}`}
                  >
                    {card.imageUrl && (
                      <img src={card.imageUrl} alt="" className="w-16 h-16 object-contain mb-4" />
                    )}
                    <span className="text-xl md:text-2xl font-bold text-gray-800 text-center break-words w-full">
                      <DyslexicText text={card.content} />
                    </span>
                    {isMatched && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute -top-3 -right-3 bg-emerald-500 text-white p-1 rounded-full border-2 border-white shadow-sm"
                      >
                        <CheckCircle2 size={20} />
                      </motion.div>
                    )}
                  </div>
                </motion.div>
              </div>
            );
          })}
        </div>
      )}

      {/* Tailwind specific classes for 3D flip effect not included by default in Tailwind UI */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
        .perspective-1000 { perspective: 1000px; }
        .preserve-3d { transform-style: preserve-3d; }
        .backface-hidden { backface-visibility: hidden; }
        .rotate-y-180 { transform: rotateY(180deg); }
      `,
        }}
      />
    </div>
  );
};

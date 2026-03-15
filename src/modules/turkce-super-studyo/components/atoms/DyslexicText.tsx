import React from 'react';

interface DyslexicTextProps {
  text: string;
  syllabify?: boolean;
  className?: string;
}

const syllabifyText = (text: string) => {
  // A simplified placeholder for Turkish syllabification logic.
  // In a real application, an NLP logic or dictionary would break down words into syllables.
  // This is a naive demo: colors first half red, second half blue if word length > 4
  const words = text.split(' ');

  return words.map((word, wIdx) => {
    // Strip punctuation for pure text processing (optional, keeping it simple here)
    if (word.length > 4) {
      const mid = Math.floor(word.length / 2);
      return (
        <span key={wIdx} className="mr-[0.3em] inline-block">
          <span className="text-red-600 font-bold">{word.slice(0, mid)}</span>
          <span className="text-blue-600 font-bold">{word.slice(mid)}</span>
        </span>
      );
    }
    return (
      <span key={wIdx} className="mr-[0.3em] inline-block">
        {word}
      </span>
    );
  });
};

export const DyslexicText: React.FC<DyslexicTextProps> = ({
  text,
  syllabify = false,
  className = '',
}) => {
  return (
    <div className={`text-inherit leading-relaxed ${className}`}>
      {syllabify ? syllabifyText(text) : text}
    </div>
  );
};

import React, { useMemo } from 'react';

interface SyllableHighlighterProps {
  text: string;
  level?: 1 | 2 | 3; // Disleksi düzeyi
  enabled?: boolean;
}

/**
 * OOGMATIK - DYNAMIC SYLLABLE ENGINE (v3 Premium)
 * Metni hecelerine ayırır ve disleksi dostu renk paletleriyle vurgular.
 */
export const SyllableHighlighter: React.FC<SyllableHighlighterProps> = ({ 
  text, 
  level = 1, 
  enabled = true 
}) => {
  const colors = [
    'text-indigo-600 dark:text-indigo-400',
    'text-emerald-600 dark:text-emerald-400',
    'text-amber-600 dark:text-amber-400',
    'text-rose-600 dark:text-rose-400'
  ];

  const syllables = useMemo(() => {
    if (!enabled) return [text];
    
    // Basit Türkçe heceleme kuralı (Gerçekte daha karmaşık bir kütüphane veya AI gerekir)
    // Bu bir placeholder implementasyondur.
    return text.split(/([aeıioöuü])/gi).filter(Boolean);
  }, [text, enabled]);

  if (!enabled) return <>{text}</>;

  return (
    <span className="syllable-wrapper leading-relaxed">
      {syllables.map((syllable, index) => (
        <span 
          key={index} 
          className={`${colors[index % colors.length]} font-lexend font-medium transition-colors duration-300`}
          style={{ 
            letterSpacing: level === 3 ? '0.1em' : 'normal',
            filter: level > 1 ? 'drop-shadow(0 1px 1px rgba(0,0,0,0.1))' : 'none'
          }}
        >
          {syllable}
        </span>
      ))}
    </span>
  );
};

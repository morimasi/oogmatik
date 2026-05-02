import { SENTENCE_5W1H_LIBRARY } from './data/sentence5W1HLibrary';
import { GeneratorOptions } from '../../types/core';
import { Sentence5W1HData, Sentence5W1HItem } from '../../types/verbal';

/**
 * Cümlede 5N1K etkinliği için çevrimdışı (offline) içerik üreticisi.
 * Kütüphanedeki pedagojik cümleleri kullanır.
 */
export const generateOfflineSentenceFiveWOneH = async (
  options: GeneratorOptions
): Promise<Sentence5W1HData> => {
  const { itemCount = 5, difficulty = 'Orta', ageGroup = '8-10' } = options;
  const targetDifficulty = difficulty.toLowerCase();

  // Filtreleme (Önce zorluk ve yaş grubuna göre, bulamazsa sadece yaş grubuna göre)
  let filteredItems = SENTENCE_5W1H_LIBRARY.filter(
    (item: Sentence5W1HItem) => item.difficulty === targetDifficulty && item.ageGroup === ageGroup
  );

  if (filteredItems.length < 5) {
    filteredItems = SENTENCE_5W1H_LIBRARY.filter((item: Sentence5W1HItem) => item.ageGroup === ageGroup);
  }

  if (filteredItems.length === 0) {
    filteredItems = [...SENTENCE_5W1H_LIBRARY];
  }

  // Rastgele cümleleri seç ve olduğu gibi döndür
  const selectedSentences = [...filteredItems]
    .sort(() => 0.5 - Math.random())
    .slice(0, Math.min(itemCount, filteredItems.length));

  const items: Sentence5W1HItem[] = selectedSentences.map((s, idx) => ({
    ...s,
    id: `offline-${idx}`,
    // Kütüphanedeki mevcut soruları (questions) koruyoruz, 
    // UI tarafında sadece bu sorular gösterilecek.
  }));

  return {
    type: 'SENTENCE_5W1H',
    title: 'Cümlede 5N1K Çalışması (Hızlı)',
    instruction: 'Aşağıdaki cümleleri okuyunuz ve ilgili 5N1K sorularını cevaplayınız.',
    items,
    settings: {
      difficulty: difficulty as any,
      topic: options.topic || 'Genel',
      itemCount,
      showIcons: options.useIcons !== false,
      showPredicate: options.showPredicate === true
    },
    metadata: {
      difficulty,
      ageGroup,
      generatedAt: new Date().toISOString(),
      isAiGenerated: false
    }
  };
};

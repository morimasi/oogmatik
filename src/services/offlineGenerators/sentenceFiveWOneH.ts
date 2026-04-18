import { GeneratorOptions } from '../../types/core';
import { Sentence5W1HData, Sentence5W1HItem } from '../../types/verbal';
import { SENTENCE_5W1H_LIBRARY } from './data/sentence5W1HLibrary';
import { AppError } from '../../utils/AppError';

/**
 * Cümlede 5N1K etkinliği için çevrimdışı (kütüphane tabanlı) içerik üreticisi.
 */
export const generateOfflineSentenceFiveWOneH = (
  options: GeneratorOptions
): Sentence5W1HData => {
  const { count = 10, difficulty = 'orta', ageGroup = '8-10' } = options;

  // Filtreleme
  let filteredItems = SENTENCE_5W1H_LIBRARY.filter(
    (item: Sentence5W1HItem) => item.difficulty === difficulty && item.ageGroup === ageGroup
  );

  // Eğer filtreleme sonucunda yeterli öğe yoksa, sadece yaş grubuna bak
  if (filteredItems.length < 5) {
    filteredItems = SENTENCE_5W1H_LIBRARY.filter((item: Sentence5W1HItem) => item.ageGroup === ageGroup);
  }

  // Eğer hala yeterli değilse (teorik olarak imkansız ama güvenli kod), tüm kütüphaneyi al
  if (filteredItems.length === 0) {
    filteredItems = [...SENTENCE_5W1H_LIBRARY];
  }

  // Karıştır (Fisher-Yates)
  const shuffled = [...filteredItems].sort(() => 0.5 - Math.random());
  
  // Seç
  const selectedItems = shuffled.slice(0, count);

  if (selectedItems.length === 0) {
    throw new AppError(
      'Kütüphanede uygun cümle bulunamadı.',
      'OFFLINE_GENERATION_FAILED',
      500
    );
  }

  return {
    type: 'SENTENCE_5W1H',
    title: 'Cümlede 5N1K Çalışması (Hızlı Mod)',
    instruction: 'Aşağıdaki cümleleri okuyunuz ve ilgili 5N1K sorularını cevaplayınız.',
    items: selectedItems,
    pedagogicalNote: 'Kütüphaneden seçilen bu cümleler, öğrencinin seviyesine uygun olarak okuduğunu anlama becerilerini desteklemek için yapılandırılmıştır.',
    metadata: {
      difficulty,
      ageGroup,
      generatedAt: new Date().toISOString(),
      isAiGenerated: false
    }
  };
};

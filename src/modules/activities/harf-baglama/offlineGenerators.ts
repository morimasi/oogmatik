import { GeneratorOptions } from '../../../types';
import { ActivityType } from '../../../types/activity';
import { HarfBaglamaDataItem } from './types';

/**
 * Harf Bağlama Etkinliği — Premium Offline Üretici
 */
function shuffle<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export const generateOfflineHARF_BAGLAMA = async (options: GeneratorOptions) => {
  const difficulty = options.difficulty || 'Orta';
  const count = Number((options as any).count || (options as any).itemCount) || 10;

  const alphabet = 'ABCDEFGHIJKLMNOPRSTUVYZXWQ';
  const lowerAlphabet = 'abcdefghijklmnoprstuvyzxwq';

  // Zorluk seviyesine göre harf havuzu seçimi
  let poolSize = count;
  if (difficulty === 'Kolay') poolSize = Math.min(count, 5);
  else if (difficulty === 'Zor') poolSize = Math.max(count, 12);

  // Havuz oluştur
  const selectedIndices: number[] = [];
  while (selectedIndices.length < poolSize) {
    const rand = Math.floor(Math.random() * alphabet.length);
    if (!selectedIndices.includes(rand)) {
      selectedIndices.push(rand);
    }
  }

  const leftItems = selectedIndices.map(i => alphabet[i]);
  const rightItems = selectedIndices.map(i => lowerAlphabet[i]);

  // Sağ sütunu karıştırarak eşleşmeleri boz
  const shuffledRight = shuffle(rightItems);

  const items: HarfBaglamaDataItem[] = leftItems.map((leftItem, idx) => ({
    id: `item-${idx + 1}`,
    leftItem,
    rightItem: shuffledRight[idx],
  }));

  return {
    type: ActivityType.HARF_BAGLAMA,
    title: 'Harf Bağlama Etkinliği',
    instruction: 'Noktaları birleştirerek büyük harfleri küçük harflerle eşleştirin.',
    items,
    pedagogicalNote: 'Görsel tarama, el-göz koordinasyonu ve büyük-küçük harf algısını eşzamanlı geliştiren disleksi standartlarına uygun olarak tasarlanmıştır.',
    difficulty,
    totalItems: items.length,
  };
};

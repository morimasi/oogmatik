import { GeneratorOptions } from '../../../types';
import { ActivityType } from '../../../types/activity';
import { HarfBaglamaDataItem, HarfBaglamaMode, HarfBaglamaCategory, HarfBaglamaDifficulty } from './types';

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
  const difficulty = (options.difficulty as HarfBaglamaDifficulty) || 'Orta';
  const itemCount = Number((options as any).itemCount) || 10;
  const activityMode = ((options as any).activityMode as HarfBaglamaMode) || 'standard';
  const category = (options.category as HarfBaglamaCategory) || 'genel';
  const fontSize = Number((options as any).fontSize) || 10;
  const primaryColor = (options.primaryColor as string) || '#4f46e5';
  const secondaryColor = (options.secondaryColor as string) || '#ec4899';

  const alphabet = 'ABCDEFGHIJKLMNOPRSTUVYZXWQ';
  const lowerAlphabet = 'abcdefghijklmnoprstuvyzxwq';

  // Zorluk seviyesine göre harf havuzu seçimi
  let poolSize = itemCount;
  if (difficulty === 'Kolay') poolSize = Math.min(itemCount, 10);
  else if (difficulty === 'Zor') poolSize = Math.max(itemCount, 12);

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

  const isGirlMode = activityMode === 'girl';
  const instruction = isGirlMode
    ? 'Prenseslik dünyasında büyük harfleri küçük harflerle sihirli çizgilerle birleştir!'
    : 'Noktaları birleştirerek büyük harfleri küçük harflerle eşleştirin.';
  const title = isGirlMode ? 'Prenses Harf Bağlama' : 'Harf Bağlama Etkinliği';

  return {
    type: ActivityType.HARF_BAGLAMA,
    title,
    instruction,
    items,
    difficulty,
    activityMode,
    category,
    itemCount,
    fontSize,
    primaryColor,
    secondaryColor,
    totalItems: items.length,
  };
};

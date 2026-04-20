import { GeneratorOptions } from '../../types';
import { ActivityType } from '../../types/activity';

interface EsAnlamliKelimelerData {
  id: string;
  activityType: ActivityType;
  title: string;
  instruction: string;
  pairs: { word: string; synonyms: string[] }[];
  settings: GeneratorOptions;
}

export const generateOfflineEsAnlamliKelimeler = async (
  options: GeneratorOptions
): Promise<EsAnlamliKelimelerData[]> => {
  const opts = options;
  const { worksheetCount = 1, wordCount = 5, difficulty = 'Orta', wordCategory = 'all' } = opts;

  const allWords = {
    nouns: ['ev', 'araba', 'kitap', 'masa', 'kalem', 'çanta', 'ağaç', 'göz', 'el', 'yemek'],
    verbs: ['gelmek', 'görmek', 'almak', 'yazmak', 'okumak', 'konuşmak', 'duymak', 'sevinmek'],
    adjectives: ['büyük', 'küçük', 'güzel', 'iyi', 'yeni', 'eski', 'hızlı', 'yavaş'],
  };
  const words =
    wordCategory === 'all'
      ? [...allWords.nouns, ...allWords.verbs, ...allWords.adjectives].slice(0, wordCount)
      : (allWords as Record<string, string[]>)[wordCategory as string]?.slice(0, wordCount) || [];

  const pages: EsAnlamliKelimelerData[] = [];
  for (let i = 0; i < worksheetCount; i++) {
    const pairs = words.map((w) => ({ word: w, synonyms: ['eş1', 'eş2'] }));
    pages.push({
      id: `esanlamli_${Date.now()}_${i}`,
      activityType: ActivityType.SYNONYM_ANTONYM_MATCH,
      title: 'Eş Anlamlı Kelimeler',
      instruction: 'Her kelimenin eş anlamlılarını yaz.',
      pairs,
      settings: opts,
    });
  }
  return pages;
};

export default generateOfflineEsAnlamliKelimeler;

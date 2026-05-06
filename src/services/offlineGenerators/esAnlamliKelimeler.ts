import { ActivityType } from '../../types/activity';
import { GeneratorOptions } from '../../types/core';

export const generateOfflineEsAnlamliKelimeler = async (
  options: GeneratorOptions
): Promise<any[]> => {
  const { worksheetCount = 1, difficulty = 'Orta' } = options;
  const opts = options as Record<string, unknown>;
  const itemCount = (opts.itemCount as number) || (opts.wordCount as number) || 8;

  // Gerçek Türkçe Eş Anlamlı Kelimeler Veritabanı
  const database = [
    { word: 'Cevap', synonym: 'Yanıt' },
    { word: 'Soru', synonym: 'Sual' },
    { word: 'Hediye', synonym: 'Armağan' },
    { word: 'Okul', synonym: 'Mektep' },
    { word: 'Öğrenci', synonym: 'Talebe' },
    { word: 'Öğretmen', synonym: 'Muallim' },
    { word: 'Misafir', synonym: 'Konuk' },
    { word: 'Zaman', synonym: 'Vakit' },
    { word: 'Güçlü', synonym: 'Kuvvetli' },
    { word: 'Akıllı', synonym: 'Zeki' },
    { word: 'Yaşlı', synonym: 'İhtiyar' },
    { word: 'Genç', synonym: 'Taze' },
    { word: 'Doktor', synonym: 'Hekim' },
    { word: 'Doğa', synonym: 'Tabiat' },
    { word: 'Büyük', synonym: 'İri' },
    { word: 'Hızlı', synonym: 'Süratli' },
    { word: 'Uzak', synonym: 'Irak' },
    { word: 'Yıl', synonym: 'Sene' },
    { word: 'Düş', synonym: 'Rüya' },
    { word: 'Anı', synonym: 'Hatıra' },
    { word: 'Barış', synonym: 'Sulh' },
    { word: 'Kırmızı', synonym: 'Al' },
    { word: 'Beyaz', synonym: 'Ak' },
    { word: 'Siyah', synonym: 'Kara' }
  ];

  const results: any[] = [];

  for (let i = 0; i < worksheetCount; i++) {
    // Rastgele kelimeleri seç
    const shuffled = [...database].sort(() => 0.5 - Math.random());
    const selectedPairs = shuffled.slice(0, itemCount);

    results.push({
      id: `esanlamli_${Date.now()}_${i}`,
      activityType: ActivityType.ES_ANLAMLI_KELIMELER,
      title: 'Eş Anlamlı Kelimeler: Kelime Bağlama',
      instruction: 'Aşağıdaki kelimeleri eş anlamlıları ile eşleştirin veya kutucuklara yazın.',
      pedagogicalNote: 'Bu çalışma, öğrencinin kelime hazinesini zenginleştirerek okuma ve anlama becerilerini (verbal fluency) geliştirmeyi hedefler.',
      settings: {
        ...options,
        layoutType: opts.layoutType || 'match_columns'
      },
      content: {
        pairs: selectedPairs,
        title: 'Kelime Bağlama Oyunu'
      }
    });
  }

  return results;
};

export default generateOfflineEsAnlamliKelimeler;

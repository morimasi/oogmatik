import { ActivityType } from '../../types/activity';
import { GeneratorOptions } from '../../types/core';
import { shuffle } from './helpers';

export const generateOfflineEsAnlamliKelimeler = async (
  options: GeneratorOptions
): Promise<any[]> => {
  const { difficulty = 'Orta' } = options;
  const opts = options as Record<string, unknown>;

  // Config'den gelen parametreleri karşıla
  const itemCount = (opts.itemCount as number) || (opts.wordCount as number) || 10;
  const topic = (opts.topic as string) || '';
  const includeExamples = (opts.includeExamples as boolean) !== false;

  const dictionary = [
    { w: 'Cevap', s: 'Yanıt' }, { w: 'Soru', s: 'Sual' }, { w: 'Hediye', s: 'Armağan' },
    { w: 'Okul', s: 'Mektep' }, { w: 'Öğrenci', s: 'Talebe' }, { w: 'Öğretmen', s: 'Muallim' },
    { w: 'Misafir', s: 'Konuk' }, { w: 'Zaman', s: 'Vakit' }, { w: 'Güçlü', s: 'Kuvvetli' },
    { w: 'Akıllı', s: 'Zeki' }, { w: 'Yaşlı', s: 'İhtiyar' }, { w: 'Doktor', s: 'Hekim' },
    { w: 'Doğa', s: 'Tabiat' }, { w: 'Büyük', s: 'İri' }, { w: 'Hızlı', s: 'Süratli' },
    { w: 'Uzak', s: 'Irak' }, { w: 'Yıl', s: 'Sene' }, { w: 'Düş', s: 'Rüya' },
    { w: 'Anı', s: 'Hatıra' }, { w: 'Yoksul', s: 'Fakir' }, { w: 'Islak', s: 'Yaş' },
    { w: 'Yüzyıl', s: 'Asır' }, { w: 'Şehir', s: 'Kent' }, { w: 'Umut', s: 'Ümit' }
  ];

  const shuffled = shuffle([...dictionary]);
  const selectedPairs = shuffled.slice(0, itemCount);

  const sentences = [
    { sentence: "Ona unutamayacağı bir ........... aldı.", answer: "armağan" },
    { sentence: "Bu ........... her yer çok kalabalık olur.", answer: "vakit" },
    { sentence: "Sınıfa yeni gelen ........... çok heyecanlıydı.", answer: "konuk" },
    { sentence: "En büyük ........... pilot olmaktı.", answer: "hayali" }
  ];

  return [{
    id: `esanlamli_v2_${Date.now()}`,
    activityType: ActivityType.ES_ANLAMLI_KELIMELER,
    title: topic ? `EŞ ANLAMLI KELİMELER: ${topic.toUpperCase()}` : 'EŞ ANLAMLI KELİMELER',
    instruction: 'Kelimeleri eşleştir ve cümlelerdeki boşlukları uygun kavramlarla tamamla.',
    settings: { ...options }, // Config'den gelen her şeyi pasla
    content: {
      pairs: selectedPairs.map(p => ({ word: p.w, synonym: p.s })),
      fillInTheBlanks: includeExamples ? shuffle(sentences).slice(0, 4) : [],
      insight: {
          title: "BİLİYOR MUSUN?",
          text: "Türkçede eş anlamlı kelimelerin birçoğu farklı dillerden geçmiştir. Örneğin 'Yanıt' Türkçe kökenliyken, 'Cevap' Arapça kökenlidir."
      }
    }
  }];
};

export default generateOfflineEsAnlamliKelimeler;

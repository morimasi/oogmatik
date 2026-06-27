import { ActivityType } from '../../types/activity';
import { GeneratorOptions } from '../../types/core';
import { shuffle } from './helpers';

export const generateOfflineEsAnlamliKelimeler = async (
  options: GeneratorOptions
): Promise<any[]> => {
  const { difficulty = 'Orta', itemCount = 12 } = options;
  const opts = options as Record<string, unknown>;

  const dictionary = [
    { w: 'Cevap', s: 'Yanıt' }, { w: 'Soru', s: 'Sual' }, { w: 'Hediye', s: 'Armağan' },
    { w: 'Okul', s: 'Mektep' }, { w: 'Öğrenci', s: 'Talebe' }, { w: 'Öğretmen', s: 'Muallim' },
    { w: 'Misafir', s: 'Konuk' }, { w: 'Zaman', s: 'Vakit' }, { w: 'Güçlü', s: 'Kuvvetli' },
    { w: 'Akıllı', s: 'Zeki' }, { w: 'Yaşlı', s: 'İhtiyar' }, { w: 'Doktor', s: 'Hekim' },
    { w: 'Doğa', synonym: 'Tabiat' }, { w: 'Büyük', s: 'İri' }, { w: 'Hızlı', s: 'Süratli' },
    { w: 'Uzak', s: 'Irak' }, { w: 'Yıl', s: 'Sene' }, { w: 'Düş', s: 'Rüya' },
    { w: 'Anı', s: 'Hatıra' }, { w: 'Barış', s: 'Sulh' }, { w: 'Kırmızı', s: 'Al' },
    { w: 'Beyaz', s: 'Ak' }, { w: 'Siyah', s: 'Kara' }, { w: 'Yoksul', s: 'Fakir' },
    { w: 'Zengin', s: 'Varlıklı' }, { w: 'Islak', s: 'Yaş' }, { w: 'Kelim', s: 'Sözcük' },
    { w: 'Cümle', s: 'Tümce' }, { w: 'Hikaye', s: 'Öykü' }, { w: 'Olay', s: 'Vaka' }
  ];

  const shuffled = shuffle([...dictionary]);
  const pairs = shuffled.slice(0, itemCount).map(p => ({ word: p.w, synonym: p.s || (p as any).synonym }));

  return [{
    id: `synonym_v2_${Date.now()}`,
    activityType: ActivityType.ES_ANLAMLI_KELIMELER,
    title: 'KAVRAM VE ANLAM İSTASYONU',
    instruction: 'Kelimeleri eş anlamlıları ile eşleştir ve alt bölümdeki anlam yolculuğunu tamamla.',
    pedagogicalNote: 'Semantik akıcılık ve kelime haznesi derinliği hedeflenmektedir. Bu etkinlik A4 sayfasını maksimum yoğunlukta doldurur.',
    settings: { ...options, premiumGrid: true },
    content: {
      pairs: shuffle([...pairs]),
      leftColumn: shuffle(pairs.map(p => p.word)),
      rightColumn: shuffle(pairs.map(p => p.synonym)),
      fillInTheBlanks: [
        { sentence: "Ona çok güzel bir ........... (hediye) aldım.", answer: "armağan" },
        { sentence: "Bu ........... (vakit) dışarı çıkmak tehlikeli.", answer: "zaman" },
        { sentence: "Sınavdaki tüm ........... (yanıt) doğruydu.", answer: "cevaplar" }
      ],
      insight: {
          title: "Biliyor musun?",
          text: "'Sözcük' kelimesi Türkçe kökenliyken, 'Kelime' kelimesi Arapçadan dilimize geçmiştir ancak her ikisi de tam olarak aynı anlamı taşır."
      }
    }
  }];
};

export default generateOfflineEsAnlamliKelimeler;

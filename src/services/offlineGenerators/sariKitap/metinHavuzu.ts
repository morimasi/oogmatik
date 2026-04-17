import type { SariKitapDifficulty } from '../../../types/sariKitap';
import type { AgeGroup } from '../../../types/creativeStudio';
import { SARI_KITAP_SOURCES } from '../../../kaynak/sari/sariKitapData';

// Modüler veri kaynaklarını içe aktar
import { UZAY_DATA } from '../../../kaynak/sari/uzayData';
import { BILIM_DATA } from '../../../kaynak/sari/bilimData';
import { TARIH_DATA } from '../../../kaynak/sari/tarihData';
import { EDEBIYAT_DATA } from '../../../kaynak/sari/edebiyatData';
import { AKADEMIK_DATA } from '../../../kaynak/sari/akademikData';

// ─── Metin Havuzu Yapısı ─────────────────────────────────────────

interface MetinEntry {
  baslik: string;
  metin: string;
}

// constants.ts ile senkronize konu listesi
type Konu = 
  | 'Kaynak Kitap' | 'Uzay & Astronomi' | 'Bilim & Teknoloji' | 'Türk Tarihi' 
  | 'Doğa & Çevre' | 'LGS Hazırlık' | 'Edebiyat' | 'Macera' | 'Meslekler' 
  | 'Hayvanlar Alemi' | 'Sanat & Kültür' | 'Matematik Dünyası';

const METIN_HAVUZU: Record<Konu, Record<SariKitapDifficulty, MetinEntry[]>> = {
  'Kaynak Kitap': {
    'Başlangıç': [
      ...SARI_KITAP_SOURCES.pencere.filter(s => s.difficulty === 'Başlangıç').map(s => ({ baslik: s.title, metin: s.text })),
      ...SARI_KITAP_SOURCES.nokta.filter(s => s.difficulty === 'Başlangıç').map(s => ({ baslik: s.title, metin: s.text })),
      ...SARI_KITAP_SOURCES.kopru.filter(s => s.difficulty === 'Başlangıç').map(s => ({ baslik: s.title, metin: s.text }))
    ],
    'Orta': [
      ...SARI_KITAP_SOURCES.pencere.filter(s => s.difficulty === 'Orta').map(s => ({ baslik: s.title, metin: s.text })),
      ...SARI_KITAP_SOURCES.nokta.filter(s => s.difficulty === 'Orta').map(s => ({ baslik: s.title, metin: s.text }))
    ],
    'İleri': [
      ...SARI_KITAP_SOURCES.kopru.filter(s => s.difficulty === 'İleri').map(s => ({ baslik: s.title, metin: s.text })),
      ...SARI_KITAP_SOURCES.cift_metin.filter(s => s.difficulty === 'İleri').map(s => ({ baslik: s.title, metin: s.text }))
    ],
    'Uzman': [
      ...SARI_KITAP_SOURCES.pencere.filter(s => s.difficulty === 'Uzman').map(s => ({ baslik: s.title, metin: s.text })),
      ...SARI_KITAP_SOURCES.cift_metin.filter(s => s.difficulty === 'Uzman').map(s => ({ baslik: s.title, metin: s.text }))
    ]
  },
  'Uzay & Astronomi': {
    'Başlangıç': [
      { baslik: 'Ay', metin: 'Ay gümüş gibi parlar. Geceyi aydınlatır. Gökyüzünde süzülür. Yıldızlar ona eşlik eder.' }
    ],
    'Orta': UZAY_DATA.filter(d => d.difficulty === 'Orta').map(d => ({ baslik: d.title!, metin: d.content! })),
    'İleri': UZAY_DATA.filter(d => d.difficulty === 'İleri').map(d => ({ baslik: d.title!, metin: d.content! })),
    'Uzman': UZAY_DATA.filter(d => d.difficulty === 'Uzman').map(d => ({ baslik: d.title!, metin: d.content! }))
  },
  'Bilim & Teknoloji': {
    'Başlangıç': [
      { baslik: 'Robot', metin: 'Robot kolunu salladı. Gözleri ışık saçtı. Bize selam verdi. Çok hızlı hareket etti.' }
    ],
    'Orta': BILIM_DATA.filter(d => d.difficulty === 'Orta').map(d => ({ baslik: d.title!, metin: d.content! })),
    'İleri': BILIM_DATA.filter(d => d.difficulty === 'İleri').map(d => ({ baslik: d.title!, metin: d.content! })),
    'Uzman': BILIM_DATA.filter(d => d.difficulty === 'Uzman').map(d => ({ baslik: d.title!, metin: d.content! }))
  },
  'Türk Tarihi': {
    'Başlangıç': [
      { baslik: 'Eski Kağan', metin: 'Büyük kağan yola çıktı. Atını hızlı sürdü. Milleti onu sevdi. Hep birlikte güçlendiler.' }
    ],
    'Orta': TARIH_DATA.filter(d => d.difficulty === 'Orta').map(d => ({ baslik: d.title!, metin: d.content! })),
    'İleri': TARIH_DATA.filter(d => d.difficulty === 'İleri').map(d => ({ baslik: d.title!, metin: d.content! })),
    'Uzman': TARIH_DATA.filter(d => d.difficulty === 'Uzman').map(d => ({ baslik: d.title!, metin: d.content! }))
  },
  'Edebiyat': {
    'Başlangıç': [
      { baslik: 'Masal Kuşu', metin: 'Zümrüdü anka kuşu uçtu. Kaf dağını aştı. Gökkuşağına kondu. Şarkılar söyledi.' }
    ],
    'Orta': EDEBIYAT_DATA.filter(d => d.difficulty === 'Orta').map(d => ({ baslik: d.title!, metin: d.content! })),
    'İleri': EDEBIYAT_DATA.filter(d => d.difficulty === 'İleri').map(d => ({ baslik: d.title!, metin: d.content! })),
    'Uzman': EDEBIYAT_DATA.filter(d => d.difficulty === 'Uzman').map(d => ({ baslik: d.title!, metin: d.content! }))
  },
  'LGS Hazırlık': {
    'Başlangıç': [],
    'Orta': AKADEMIK_DATA.filter(d => d.difficulty === 'Orta').map(d => ({ baslik: d.title!, metin: d.content! })),
    'İleri': AKADEMIK_DATA.filter(d => d.difficulty === 'İleri').map(d => ({ baslik: d.title!, metin: d.content! })),
    'Uzman': AKADEMIK_DATA.filter(d => d.difficulty === 'Uzman').map(d => ({ baslik: d.title!, metin: d.content! }))
  },
  'Doğa & Çevre': {
    'Başlangıç': [
      { baslik: 'Yeşil Orman', metin: 'Orman çok derin. Ağaçlar göğe uzanır. Dereler şırıl şırıl akar. Her yer huzur dolu.' }
    ],
    'Orta': [
      { baslik: 'Ekosistem Dengesi', metin: 'Doğadaki her canlı birbirine bağlıdır. Arılar çiçekleri döllerken, kuşlar tohumları yayar. Bu denge bozulursa yaşam tehlikeye girer.' }
    ],
    'İleri': AKADEMIK_DATA.filter(d => d.tags?.includes('Ekoloji')).map(d => ({ baslik: d.title!, metin: d.content! })),
    'Uzman': AKADEMIK_DATA.filter(d => d.tags?.includes('Çevre')).map(d => ({ baslik: d.title!, metin: d.content! }))
  },
  'Macera': {
    'Başlangıç': [
      { baslik: 'Gizemli Ada', metin: 'Kıyıya yanaştık. Kumlar altın gibiydi. Bir sandık bulduk. İçinden harita çıktı.' }
    ],
    'Orta': [
      { baslik: 'Kayıp Şehir', metin: 'Tapınağın içine girdik. Duvarlarda eski yazılar vardı. Meşalemiz sönerken bir kapı açıldı. Karşımızda kayıp şehir duruyordu.' }
    ],
    'İleri': [],
    'Uzman': []
  },
  'Meslekler': {
    'Başlangıç': [{ baslik: 'Doktor', metin: 'Doktor amca geldi. Bizi muayene etti. İlaç verdi. Çabuk iyileştik.' }],
    'Orta': [],
    'İleri': [],
    'Uzman': []
  },
  'Hayvanlar Alemi': {
    'Başlangıç': [{ baslik: 'Aslan', metin: 'Aslan kükredi. Orman korktu. Kuyruğunu salladı. Gururla yürüdü.' }],
    'Orta': [],
    'İleri': [],
    'Uzman': []
  },
  'Sanat & Kültür': {
    'Başlangıç': [{ baslik: 'Resim', metin: 'Boyaları aldım. Kağıdı boyadım. Bir ev çizdim. Çok güzel oldu.' }],
    'Orta': [],
    'İleri': [],
    'Uzman': []
  },
  'Matematik Dünyası': {
    'Başlangıç': [{ baslik: 'Sayılar', metin: 'Bir iki üç. Sayıları saydım. On tane elma. Sepete koydum.' }],
    'Orta': [],
    'İleri': [],
    'Uzman': []
  }
};

// ─── Çift Metin Çiftleri ─────────────────────────────────────────

export interface CiftMetinCifti {
  a: { baslik: string; metin: string };
  b: { baslik: string; metin: string };
}

export const CIFT_METIN_CIFTLERI: CiftMetinCifti[] = [
  {
    a: { baslik: 'Cici Kuş', metin: 'Cici kuş ağaçta oturuyordu sabahtan beri. Kanatlarını açıp güneşe baktı. Sonra uçarak gökyüzüne yükseldi.' },
    b: { baslik: 'Leziz Kek', metin: 'Kek hamuru karıştırıldı kasenin içinde. Fırına konuldu dikkatli bir şekilde. Güzel bir koku yayıldı mutfağa.' },
  },
  {
    a: { baslik: 'Yapay Zeka', metin: 'Algoritmalar veriyi hızla işledi. Karmaşık desenleri analiz etti. Karar verme süreci saniyeler sürdü.' },
    b: { baslik: 'Uzay Yolculuğu', metin: 'Roket motorları ateşlendi büyük bir gürültüyle. Atmosfer aşıldı sessizce. Dünya uzaktan mavi bir bilye gibi göründü.' },
  }
];

// ─── Metin Erişim Fonksiyonları ──────────────────────────────────

const YAS_KELIME_LIMITI: Record<AgeGroup, number> = {
  '5-7': 12,
  '8-10': 25,
  '11-13': 50,
  '14+': 999,
};

const ZORLUK_UZUNLUK_ARALIGI: Record<SariKitapDifficulty, { min: number; max: number }> = {
  'Başlangıç': { min: 0, max: 120 },
  'Orta': { min: 100, max: 400 },
  'İleri': { min: 350, max: 900 },
  'Uzman': { min: 800, max: 15000 },
};

export function getMetinByAgeAndDifficulty(
  ageGroup: AgeGroup,
  difficulty: SariKitapDifficulty,
  konu?: Konu
): MetinEntry {
  const konular = konu ? [konu] : (['Kaynak Kitap', ...Object.keys(METIN_HAVUZU).filter(k => k !== 'Kaynak Kitap')] as Konu[]);
  
  const yasLimit = YAS_KELIME_LIMITI[ageGroup];
  const uzunlukSiniri = ZORLUK_UZUNLUK_ARALIGI[difficulty];

  for (const k of konular) {
    const entries = METIN_HAVUZU[k]?.[difficulty];
    if (entries && entries.length > 0) {
      const tamUygun = entries.filter((e) => {
        const wordCount = e.metin.split(/\s+/).filter(w => w.length > 0).length;
        const cumleler = e.metin.split(/[.!?]+/).filter((c) => c.trim());
        const cumleYapisiUygun = cumleler.every((c) => c.trim().split(/\s+/).length <= yasLimit);
        const uzunlukUygun = wordCount >= uzunlukSiniri.min && wordCount <= uzunlukSiniri.max;
        return cumleYapisiUygun && uzunlukUygun;
      });

      if (tamUygun.length > 0) {
        return tamUygun[Math.floor(Math.random() * tamUygun.length)];
      }

      const yasUygun = entries.filter((e) => {
        const cumleler = e.metin.split(/[.!?]+/).filter((c) => c.trim());
        return cumleler.every((c) => c.trim().split(/\s+/).length <= yasLimit);
      });

      if (yasUygun.length > 0) {
        return yasUygun[Math.floor(Math.random() * yasUygun.length)];
      }

      return entries[Math.floor(Math.random() * entries.length)];
    }
  }

  return { baslik: 'Metin', metin: 'Güzel bir gün. Güneş parlıyor. Kuşlar ötüyor. Her yer çok sakin.' };
}

export function getCiftMetinCifti(): CiftMetinCifti {
  return CIFT_METIN_CIFTLERI[Math.floor(Math.random() * CIFT_METIN_CIFTLERI.length)];
}

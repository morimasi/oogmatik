import { ActivityType } from '../../../types';
import { PromptTemplate } from './readingPrompts';

export const VISUAL_PROMPTS: Partial<Record<ActivityType, PromptTemplate>> = {
  [ActivityType.GRID_DRAWING]: {
    systemPromptSuffix: `
Görevin: "Kare Kopyalama (Grid Drawing)" çalışma kağıdı üret.
YAPI:
- Sol tarafta: örnek desen dolu 8×8 ızgara (basit geometrik şekil).
- Sağ tarafta: boş 8×8 ızgara (öğrenci kopyalayacak).
- 3 farklı zorlukta desen (kolay→zor).
- AltBölüm: "Kendi desenini tasarla" boş ızgara.
Her karenin koordinatı (A1, B2 gibi) belirtilmiş olsun.
BİLİŞSEL HEDEF: Görsel-mekansal kopya ve el-göz koordinasyonu.`,
    userPromptSuffix: 'Izgaralı desen kopyalama etkinliği üret.',
    drillCount: 3,
    layoutHint: 'grid'
  },

  [ActivityType.SYMMETRY_DRAWING]: {
    systemPromptSuffix: `
Görevin: "Simetri Tamamlama" çalışma kağıdı üret.
YAPI:
- 4 adet simetri çalışması:
  1-2: Yatay simetri ekseni (sol yarısı dolu → sağ yarısını tamamla).
  3: Dikey simetri ekseni (üst yarısı dolu).
  4: Çapraz simetri (ileri seviye).
- Her çalışma 10×10 ızgarada.
- Simetri ekseni kalın çizgiyle belirtilmiş.
BİLİŞSEL HEDEF: Uzamsal akıl yürütme ve simetri algısı.`,
    userPromptSuffix: 'Farklı eksenlerde simetri tamamlama etkinliği üret.',
    drillCount: 4,
    layoutHint: 'grid'
  },

  [ActivityType.WORD_SEARCH]: {
    systemPromptSuffix: `
Görevin: "Kelime Bulmaca (Word Search)" çalışma kağıdı üret.
YAPI:
- Tema seçilmiş (hayvanlar/meyveler/meslekler vb.) bir kelime bulmaca.
- Grid boyutu: zorluk bazlı (Kolay: 8×8, Orta: 10×10, Zor: 12×12).
- Gizlenen kelimeler: 8-12 adet, yatay ve dikey (zorda çapraz da).
- Kelime listesi grid'in altında verilmiş.
- Bonus: "Kalan harflerden gizli mesajı bul" bölümü.
BİLİŞSEL HEDEF: Görsel tarama, harf dizisi tanıma ve seçici dikkat.`,
    userPromptSuffix: 'Tematik Türkçe kelime bulmaca grid\'i üret.',
    drillCount: 1,
    layoutHint: 'grid'
  },

  [ActivityType.DIRECTIONAL_TRACKING]: {
    systemPromptSuffix: `
Görevin: "Yönsel İz Sürme (Kod Çözme)" çalışma kağıdı üret.
YAPI:
- 8×8 harf ızgarası + başlangıç noktası.
- Yön komutları dizisi (→↓→→↑← gibi) ile ızgarada ilerle.
- Topladığın harfler gizli kelimeyi oluşturur.
- 3 farklı zorlukta iz sürme (kısa→uzun komut dizisi).
- Bonus: Öğrenci kendi yön kodunu yazsın.
BİLİŞSEL HEDEF: Yön tayini, ardışık işlem ve çalışma belleği.`,
    userPromptSuffix: 'Ok yönlerini takip ederek gizli kelime bulma etkinliği üret.',
    drillCount: 3,
    layoutHint: 'grid'
  },

  [ActivityType.VISUAL_TRACKING_LINES]: {
    systemPromptSuffix: `
Görevin: "Görsel Takip Çizgileri" çalışma kağıdı üret.
YAPI:
- Sol tarafta: harfler (A, B, C, D, E).
- Sağ tarafta: rakamlar (1, 2, 3, 4, 5).
- Arada: birbirine geçmiş 5 eğri çizgi — her harf bir rakama gider.
- Öğrenci sadece gözüyle takip edip eşleştirmeyi yazacak.
- İkinci set: 7 çizgi (daha karmaşık).
BİLİŞSEL HEDEF: Oküler motor kontrol ve sürdürülebilir görsel dikkat.`,
    userPromptSuffix: 'Karmaşık çizgi takip ve eşleştirme etkinliği üret.',
    drillCount: 2,
    layoutHint: 'svg'
  },

  [ActivityType.ATTENTION_TO_QUESTION]: {
    systemPromptSuffix: `
Görevin: "Dikkat ve Sorular" çalışma kağıdı üret.
YAPI:
- Bölüm 1: Harf eleme — 10 satır harfler, hedef harfi bul ve say.
- Bölüm 2: Sözcük eleme — paragrafta belirli kelimeyi bul.
- Bölüm 3: Sayı eleme — sayı matrisinde çift sayıları işaretle.
- Her bölümde doğrulama kutusu: "Toplam bulduğum: ___".
BİLİŞSEL HEDEF: Seçici dikkat, sürdürülebilir dikkat ve hız.`,
    userPromptSuffix: 'Çok bölümlü harf/kelime/sayı eleme etkinliği üret.',
    drillCount: 3,
    layoutHint: 'grid'
  },
};

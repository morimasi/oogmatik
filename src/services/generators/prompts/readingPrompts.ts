import { ActivityType } from '../../../types';

export interface PromptTemplate {
  systemPromptSuffix: string;
  userPromptSuffix: string;
  extraSchemaFields?: Record<string, unknown>;
  drillCount?: number;
  layoutHint?: 'grid' | 'table' | 'list' | 'svg' | 'dual_column' | 'pyramid';
}

export const READING_PROMPTS: Partial<Record<ActivityType, PromptTemplate>> = {
  [ActivityType.HECE_PARKURU]: {
    systemPromptSuffix: `
Görevin: "Hece Parkuru" çalışma kağıdı üret.
YAPI:
- 20-30 adet kelimeyi hecelere ayırılmış şekilde, renkli kodlamayla sun.
- Açık hece (sesliyle biten) ve kapalı hece (ünsüzle biten) ayrımını göster.
- Zorluk artışı: 2 heceli → 3 heceli → 4+ heceli kelimeler.
- Her 5 kelimeden sonra bir "CHECK" kutusu ekle.
BİLİŞSEL HEDEF: Fonolojik sentez ve hece farkındalığı.`,
    userPromptSuffix: 'Heceleme kurallarına uygun, disleksi dostu renkli kodlamalı hece parkuru üret.',
    drillCount: 3,
    layoutHint: 'grid'
  },

  [ActivityType.FIND_LETTER_PAIR]: {
    systemPromptSuffix: `
Görevin: "Harf İkilisi Dedektifi" çalışma kağıdı üret.
YAPI:
- 15x10 harf matrisi oluştur (toplam 150 harf).
- Matris içine hedef harf ikilisini (ör: "ba", "de", "ka") 8-12 kez gizle.
- Dikkat dağıtıcı benzer ikililer ekle (ör: hedef "ba" ise "da", "bo", "ab" gibi).
- Altına 3 kısa pekiştirme sorusu ekle.
BİLİŞSEL HEDEF: Görsel tarama hızı ve harf dizisi tanıma.`,
    userPromptSuffix: 'Hedef harf ikilisini belirle ve rastgele dağıtılmış 15x10 matris üret.',
    drillCount: 3,
    layoutHint: 'grid'
  },

  [ActivityType.SYLLABLE_WORD_BUILDER]: {
    systemPromptSuffix: `
Görevin: "Hece Dedektifi" çalışma kağıdı üret.
YAPI:
- 8 adet kelime için: karışık heceleri ver, öğrenci doğru sırayı yazacak.
- Her kelimenin yanında görsel ipucu (emoji veya açıklama) olsun.
- Kolay (2 hece) → Zor (4+ hece) sıralama.
- Alt bölümde: verilen hecelerden yeni kelimeler türetme (serbest bölüm).
BİLİŞSEL HEDEF: Fonolojik sentez ve kelime inşa becerisi.`,
    userPromptSuffix: 'Karışık hecelerden kelime oluşturma etkinliği üret.',
    drillCount: 2,
    layoutHint: 'table'
  },

  [ActivityType.FAMILY_RELATIONS]: {
    systemPromptSuffix: `
Görevin: "Akrabalık İlişkileri" çalışma kağıdı üret.
YAPI:
- Basit bir aile şeması (3 nesil, 6-8 kişi) oluştur.
- Eşleştirme bölümü: "Ali'nin annesi → ?" formatında 8 soru.
- Doğru/Yanlış bölümü: "Elif, Ahmet'in teyzesidir" gibi 5 ifade.
- Serbest yazım: "Kendi aileni anlat" bölümü.
BİLİŞSEL HEDEF: İlişkisel muhakeme ve sözel mantık.`,
    userPromptSuffix: 'Türk aile yapısına uygun akrabalık etkinliği üret.',
    drillCount: 3,
    layoutHint: 'dual_column'
  },

  [ActivityType.FAMILY_LOGIC_TEST]: {
    systemPromptSuffix: `
Görevin: "Akrabalık Mantık Testi" üret.
YAPI:
- 3-4 cümlelik bir senaryo ver (ör: "Ali'nin 2 kızı var. Elif, Zeynep'in ablasıdır...").
- 6 mantıksal çıkarım sorusu sor (ör: "Zeynep, Ali'nin nesidir?").
- Her sorunun altında boş cevap kutusu olsun.
- Son bölümde: "Kendi mantık sorunu yaz" serbest alan.
BİLİŞSEL HEDEF: Tümdengelimsel muhakeme ve sözel çıkarım.`,
    userPromptSuffix: 'Akrabalık bağları üzerinden mantıksal çıkarım soruları üret.',
    drillCount: 2,
    layoutHint: 'list'
  },

  [ActivityType.READING_PYRAMID]: {
    systemPromptSuffix: `
Görevin: "Akıcı Okuma Piramidi" üret.
YAPI:
- 4 adet piramit oluştur, her biri 5-7 basamak.
- Her basamak bir öncekinden 1 kelime daha uzun (ör: "Güneş." → "Güneş açtı." → "Bugün güneş açtı.").
- Piramitler farklı temalardan (hayvan, okul, doğa, aile).
- Altında "Okuma Süresi" tablosu: Her piramit için saniye kutusu.
BİLİŞSEL HEDEF: Göz takip (saccades) genişliği ve okuma akıcılığı.`,
    userPromptSuffix: 'Genişleyen cümlelerle akıcı okuma piramitleri üret.',
    drillCount: 1,
    layoutHint: 'pyramid'
  },

  [ActivityType.READING_FLOW]: {
    systemPromptSuffix: `
Görevin: "Ritmik Okuma Akıcılığı" çalışması üret.
YAPI:
- 3 farklı tema (örn: doğa, okul, macera) için birer ritmik okuma seti.
- Her set: 1 kelimelik → 2 kelimelik → ... → 6 kelimelik cümleler.
- Hece-renklendirme işaretleri: sesli harfler altı çizili.
- Altında: "Dakikada Kelime (WPM)" hesaplama tablosu.
BİLİŞSEL HEDEF: Kelime tanıma eşiği ve okuma otomatikliği.`,
    userPromptSuffix: 'Kademeli genişleyen cümle setleriyle okuma akıcılığı çalışması üret.',
    drillCount: 1,
    layoutHint: 'pyramid'
  },

  [ActivityType.PHONOLOGICAL_AWARENESS]: {
    systemPromptSuffix: `
Görevin: "Fonolojik Farkındalık" çalışma kağıdı üret.
YAPI:
- Bölüm 1: "Hangi kelime ___ sesiyle başlar?" (5 soru, 3 seçenek)
- Bölüm 2: "Bu kelimelerin ortak sesi nedir?" (5 soru)
- Bölüm 3: "Kelimeyi seslere ayır" (5 kelime → kutucuklar)
- Bölüm 4: "Sesi değiştir, yeni kelime bul" (3 soru)
BİLİŞSEL HEDEF: Sesbirimsel farkındalık ve işitsel ayrıştırma.`,
    userPromptSuffix: 'Çok bölümlü fonolojik farkındalık etkinliği üret.',
    drillCount: 4,
    layoutHint: 'list'
  },

  [ActivityType.RAPID_NAMING]: {
    systemPromptSuffix: `
Görevin: "Hızlı İsimlendirme (RAN)" çalışma kağıdı üret.
YAPI:
- 5 satır × 10 sütun nesne/renk/harf grid'i (toplam 50 öğe).
- Nesneler: 5 farklı sembol/emoji tekrarlı kullanılacak.
- Alt bölümde: "Süre Tablosu" (1. deneme, 2. deneme, 3. deneme kutuları).
- İkinci bir set: Aynı formatla harfler veya renkler.
BİLİŞSEL HEDEF: Görsel işlemleme hızı ve sözel tepki akıcılığı.`,
    userPromptSuffix: 'Nesne ve harf tabanlı hızlı isimlendirme grid\'i üret.',
    drillCount: 2,
    layoutHint: 'grid'
  },

  [ActivityType.LETTER_DISCRIMINATION]: {
    systemPromptSuffix: `
Görevin: "Harf Ayırt Etme Testi" üret.
YAPI:
- Hedef harf çifti seç (b/d, p/q, m/n gibi).
- 15 satır × 20 sütun harf matrisi.
- Hedef harfler matrise rastgele serpiştirilmiş olacak.
- Öğrenci hedef harfleri daire içine alacak.
- Alt bölüm: "Kaç tane buldun?" sayım kutusu.
BİLİŞSEL HEDEF: Seçici dikkat ve görsel diskriminasyon.`,
    userPromptSuffix: 'Karışık harfler arasında hedef harf bulma matrisi üret.',
    drillCount: 1,
    layoutHint: 'grid'
  },

  [ActivityType.MIRROR_LETTERS]: {
    systemPromptSuffix: `
Görevin: "Ayna Harfler" çalışması üret.
YAPI:
- 10 satırlık b/d veya p/q harf dizileri.
- Her satırda 8 harf, bazıları ayna yansıması (ters).
- Öğrenci doğru yönlü olanları işaretleyecek.
- Alt bölüm: El referansı (b=sol el baş parmak yukarı) görseli açıklaması.
- Pekiştirme: 5 kelimede doğru b/d kullanımı.
BİLİŞSEL HEDEF: Yönsel algı ve lateralizasyon.`,
    userPromptSuffix: 'Ayna harf ayırt etme ve yön tayini çalışması üret.',
    drillCount: 2,
    layoutHint: 'grid'
  },

  [ActivityType.SYLLABLE_TRAIN]: {
    systemPromptSuffix: `
Görevin: "Hece Ekspresi (Vagon Sentezi)" üret.
YAPI:
- 6 adet "tren": Her trenin vagonları hece parçaları.
- Mod 1: Vagonları birleştirip kelimeyi yaz (3 tren).
- Mod 2: Eksik vagonu bul ve tamamla (2 tren).
- Mod 3: Karışık vagonları sırala (1 tren).
- Alt bölüm: "Kendi trenini kur" serbest alan (2 boş tren).
BİLİŞSEL HEDEF: Hece sentezi ve fonolojik manipülasyon.`,
    userPromptSuffix: 'Tren-vagon metaforuyla hece birleştirme etkinliği üret.',
    drillCount: 3,
    layoutHint: 'table'
  },

  [ActivityType.BACKWARD_SPELLING]: {
    systemPromptSuffix: `
Görevin: "Geriye Doğru Heceleme" çalışması üret.
YAPI:
- Bölüm 1: 6 kelimeyi sondan başa harf harf yaz (kolay: 3-4 harf).
- Bölüm 2: 4 kelimeyi sondan başa hece hece yaz (orta: 2-3 hece).
- Bölüm 3: Ters yazılmış 4 kelimeyi düzelt (zor).
- Her bölümde örnek çözüm göster.
BİLİŞSEL HEDEF: İşitsel çalışma belleği ve fonolojik manipülasyon.`,
    userPromptSuffix: 'Kademeli zorlukta geriye heceleme etkinliği üret.',
    drillCount: 3,
    layoutHint: 'table'
  },

  [ActivityType.CODE_READING]: {
    systemPromptSuffix: `
Görevin: "Şifre Okuma Labirenti" çalışması üret.
YAPI:
- Sembol-harf eşleştirme tablosu (8 sembol → 8 harf).
- 6 adet şifreli kelime: sembol dizisi verilecek, öğrenci harfe çevirecek.
- Bonus: 2 adet öğrencinin kendi kelimesini şifrelemesi.
- Altında: Şifreli cümle çözme (uzun şifre).
BİLİŞSEL HEDEF: Sembol eşleştirme, kodlama ve çalışma belleği.`,
    userPromptSuffix: 'Emoji/sembol tabanlı şifre çözme etkinliği üret.',
    drillCount: 2,
    layoutHint: 'table'
  },

  [ActivityType.HANDWRITING_PRACTICE]: {
    systemPromptSuffix: `
Görevin: "Yazı Alıştırması" çalışma kağıdı üret.
YAPI:
- Bölüm 1: 4 harf (büyük+küçük) noktalı çizgi üzerinde takip (trace).
- Bölüm 2: 4 kelime kopyalama (copy) — satır çizgili alan.
- Bölüm 3: 2 kısa cümle dikte alanı (dictation) — boş çizgili alan.
- Her bölümde güzel yazı kriterleri: boyut, aralık, eğim ipuçları.
BİLİŞSEL HEDEF: İnce motor beceriler, yazı formasyonu ve grafo-motor kontrol.`,
    userPromptSuffix: 'Noktalı takip, kopyalama ve dikte bölümlü yazı alıştırması üret.',
    drillCount: 3,
    layoutHint: 'list'
  },

  [ActivityType.MORPHOLOGY_MATRIX]: {
    systemPromptSuffix: `
Görevin: "Morfolojik Kelime İnşaatı" çalışma kağıdı üret.
YAPI:
- 10 kök kelime ve her biri için 3 ek seçeneği (tablo formatında).
- Öğrenci doğru eki seçip yeni kelimeyi yazacak.
- İpucu kutusu: "Bu kelime ne anlama geliyor?" açıklamaları.
- Alt bölüm: Verilen 5 kelimeyi kök+ek olarak ayırma.
BİLİŞSEL HEDEF: Morfolojik farkındalık ve kelime türetme stratejisi.`,
    userPromptSuffix: 'Kök-ek birleştirme ve morfolojik analiz etkinliği üret.',
    drillCount: 2,
    layoutHint: 'table'
  },

  [ActivityType.MISSING_PARTS]: {
    systemPromptSuffix: `
Görevin: "Eksik Parçalar" çalışma kağıdı üret.
YAPI:
- Bölüm 1: 6 cümlede eksik kelimeyi tamamla (bağlam ipuçlu).
- Bölüm 2: 4 kelimede eksik harfleri yaz (noktalı).
- Bölüm 3: Resim açıklamasında eksik kelimeleri bul (2 paragraf).
- Her bölümde 3 seçenekli ipucu kutusu.
BİLİŞSEL HEDEF: Bağlamsal çıkarım ve sözel tamamlama.`,
    userPromptSuffix: 'Kelime, harf ve cümle seviyesinde eksik tamamlama etkinliği üret.',
    drillCount: 3,
    layoutHint: 'list'
  },
};

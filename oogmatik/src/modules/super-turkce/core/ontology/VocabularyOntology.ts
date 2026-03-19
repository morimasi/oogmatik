/**
 * MEB Müfredat Ontolojisi - Tier-2 ve Tier-3 Kelime Listeleri
 * 
 * Bu modül, 4-8. sınıflar arası akademik kelime gelişimini desteklemek için
 * özel olarak hazırlanmış kelime listelerini içerir.
 * 
 * Tier-2: Akademik başarı için kritik yüksek frekanslı kelimeler
 * Tier-3: Alana özgü, düşük frekanslı teknik kelimeler
 */

import { GradeLevel } from '../types';

export interface VocabularyWord {
  word: string;
  partOfSpeech?: string; // isim, fiil, sıfat, zarf
  definition?: string;
  exampleSentence?: string;
  synonyms?: string[];
  antonyms?: string[];
  difficulty: 'kolay' | 'orta' | 'zor';
}

export interface GradeVocabulary {
  grade: GradeLevel;
  tier2Words: VocabularyWord[];
  tier3Words: VocabularyWord[];
}

/**
 * Genişletilmiş Tier-2/3 Kelime Listesi (4-8. Sınıflar)
 * MEB Türkçe Dersi Öğretim Programı'na uygun olarak hazırlanmıştır.
 */
export const VOCABULARY_ONTOLOGY: Record<GradeLevel, GradeVocabulary> = {
  4: {
    grade: 4,
    tier2Words: [
      { word: 'analiz', partOfSpeech: 'isim', definition: 'Bir bütünü parçalarına ayırarak inceleme', difficulty: 'orta' },
      { word: 'karşılaştırmak', partOfSpeech: 'fiil', definition: 'İki veya daha fazla şey arasındaki benzerlik ve farklılıkları bulma', difficulty: 'orta' },
      { word: 'özet', partOfSpeech: 'isim', definition: 'Bir konunun ana noktalarını içeren kısa anlatım', difficulty: 'kolay' },
      { word: 'tahmin', partOfSpeech: 'isim', definition: 'Bir sonuç hakkında önceden fikir yürütme', difficulty: 'kolay' },
      { word: 'kanıt', partOfSpeech: 'isim', definition: 'Bir iddianın doğruluğunu gösteren belge veya bilgi', difficulty: 'orta' },
      { word: 'yorum', partOfSpeech: 'isim', definition: 'Bir söz veya davranışdan sonuç çıkarma', difficulty: 'kolay' },
      { word: 'değerlendirmek', partOfSpeech: 'fiil', definition: 'Bir konu hakkında görüş bildirme, hüküm verme', difficulty: 'orta' },
      { word: 'açıklamak', partOfSpeech: 'fiil', definition: 'Anlaşılır hale getirme, izah etme', difficulty: 'kolay' },
      { word: 'sınıflandırmak', partOfSpeech: 'fiil', definition: 'Benzer özelliklere göre gruplara ayırma', difficulty: 'orta' },
      { word: 'sonuç', partOfSpeech: 'isim', definition: 'Bir işin veya olayın sonunda elde edilen sonuç', difficulty: 'kolay' },
    ],
    tier3Words: [
      { word: 'eş anlamlı', partOfSpeech: 'sıfat', definition: 'Aynı anlamı taşıyan kelimeler', difficulty: 'kolay' },
      { word: 'zıt anlamlı', partOfSpeech: 'sıfat', definition: 'Karşıt anlam taşıyan kelimeler', difficulty: 'kolay' },
      { word: 'mecaz', partOfSpeech: 'sıfat', definition: 'Kelimenin gerçek anlamından uzaklaşarak kazandığı yeni anlam', difficulty: 'orta' },
      { word: 'hece', partOfSpeech: 'isim', definition: 'Bir veya birkaç sesle oluşan tek heceli ses birimi', difficulty: 'kolay' },
      { word: 'noktalama işareti', partOfSpeech: 'isim', definition: 'Yazının anlaşılmasını kolaylaştıran işaretler', difficulty: 'kolay' },
      { word: 'başlık', partOfSpeech: 'isim', definition: 'Yazının veya konuşmanın konusu', difficulty: 'kolay' },
      { word: 'paragraf', partOfSpeech: 'isim', definition: 'Bir düşünceyi oluşturan cümle grubu', difficulty: 'orta' },
      { word: 'ana fikir', partOfSpeech: 'isim', definition: 'Metinde verilmek istenen temel mesaj', difficulty: 'orta' },
    ]
  },
  
  5: {
    grade: 5,
    tier2Words: [
      { word: 'çıkarım', partOfSpeech: 'isim', definition: 'Verilen bilgilerden yeni sonuçlar elde etme', difficulty: 'orta' },
      { word: 'sebep-sonuç', partOfSpeech: 'isim', definition: 'Bir olayın neden ve sonuç ilişkisi', difficulty: 'orta' },
      { word: 'amaç', partOfSpeech: 'isim', definition: 'Bir şeyi yapma nedeni veya hedef', difficulty: 'kolay' },
      { word: 'koşul', partOfSpeech: 'isim', definition: 'Bir sonucun gerçekleşmesi için gereken durum', difficulty: 'orta' },
      { word: 'ilişki', partOfSpeech: 'isim', definition: 'İki veya daha fazla şey arasındaki bağlantı', difficulty: 'kolay' },
      { word: 'özellik', partOfSpeech: 'isim', definition: 'Bir varlığı diğerlerinden ayıran nitelik', difficulty: 'kolay' },
      { word: 'benzerlik', partOfSpeech: 'isim', definition: 'İki şey arasındaki ortak yönler', difficulty: 'kolay' },
      { word: 'farklılık', partOfSpeech: 'isim', definition: 'İki şey arasındaki ayrımlık', difficulty: 'kolay' },
      { word: 'kategori', partOfSpeech: 'isim', definition: 'Benzer özelliklere sahip şeylerin grubu', difficulty: 'orta' },
      { word: 'örnek', partOfSpeech: 'isim', definition: 'Bir kuralı veya durumu açıklayan somut durum', difficulty: 'kolay' },
    ],
    tier3Words: [
      { word: 'eş sesli', partOfSpeech: 'sıfat', definition: 'Yazılışları aynı, anlamları farklı kelimeler', difficulty: 'orta' },
      { word: 'sesteş', partOfSpeech: 'sıfat', definition: 'Eş sesli kelimelerin diğer adı', difficulty: 'orta' },
      { word: 'deyim', partOfSpeech: 'isim', definition: 'En az iki kelimeden oluşan, kalıplaşmış söz grubu', difficulty: 'kolay' },
      { word: 'atasözü', partOfSpeech: 'isim', definition: 'Uzun deneyimlerden得出的 öğüt verici söz', difficulty: 'kolay' },
      { word: 'giriş', partOfSpeech: 'isim', definition: 'Paragrafın ilk cümle(ler)i', difficulty: 'kolay' },
      { word: 'gelişme', partOfSpeech: 'isim', definition: 'Paragrafın ana düşünceyi destekleyen kısmı', difficulty: 'kolay' },
      { word: 'nesnel', partOfSpeech: 'sıfat', definition: 'Kişiden kişiye değişmeyen, kanıtlanabilir', difficulty: 'orta' },
      { word: 'öznel', partOfSpeech: 'sıfat', definition: 'Kişisel görüş bildiren, yorum içeren', difficulty: 'orta' },
    ]
  },
  
  6: {
    grade: 6,
    tier2Words: [
      { word: 'nitelik', partOfSpeech: 'isim', definition: 'Bir varlığın belirgin özelliği', difficulty: 'orta' },
      { word: 'nicelik', partOfSpeech: 'isim', definition: 'Sayı ile ifade edilebilen özellik', difficulty: 'orta' },
      { word: 'yöntem', partOfSpeech: 'isim', definition: 'Bir amaca ulaşmak için izlenen yol', difficulty: 'orta' },
      { word: 'strateji', partOfSpeech: 'isim', definition: 'Hedefe ulaşmak için planlanan yaklaşım', difficulty: 'zor' },
      { word: 'perspektif', partOfSpeech: 'isim', definition: 'Olaylara bakış açısı', difficulty: 'zor' },
      { word: 'bağlam', partOfSpeech: 'isim', definition: 'Bir ifadenin içinde geçtiği ortam', difficulty: 'zor' },
      { word: 'vurgu', partOfSpeech: 'isim', definition: 'Önem verilen nokta', difficulty: 'orta' },
      { word: 'ton', partOfSpeech: 'isim', definition: 'Anlatımın duygu durumu', difficulty: 'orta' },
      { word: 'ima', partOfSpeech: 'isim', definition: 'Doğrudan söylemeden anlatma', difficulty: 'zor' },
      { word: 'temel', partOfSpeech: 'sıfat', definition: 'En önemli, esas', difficulty: 'kolay' },
    ],
    tier3Words: [
      { word: 'isim', partOfSpeech: 'isim', definition: 'Varlıkları karşılayan kelimeler', difficulty: 'kolay' },
      { word: 'sıfat', partOfSpeech: 'isim', definition: 'İsimlerin özelliklerini belirten kelime', difficulty: 'kolay' },
      { word: 'zamir', partOfSpeech: 'isim', definition: 'İsimlerin yerine kullanılan kelime', difficulty: 'orta' },
      { word: 'edat', partOfSpeech: 'isim', definition: 'Kelimeler arasında ilişki kuran kelime', difficulty: 'orta' },
      { word: 'bağlaç', partOfSpeech: 'isim', definition: 'Kelimeleri veya cümleleri bağlayan kelime', difficulty: 'orta' },
      { word: 'kök', partOfSpeech: 'isim', definition: 'Kelimenin anlamını taşıyan en küçük parçası', difficulty: 'orta' },
      { word: 'ek', partOfSpeech: 'isim', definition: 'Kökün anlamını veya görevini değiştiren parça', difficulty: 'kolay' },
      { word: 'yapım eki', partOfSpeech: 'isim', definition: 'Yeni kelime türeten ek', difficulty: 'orta' },
      { word: 'çekim eki', partOfSpeech: 'isim', definition: 'Kelimenin görevini belirten ek', difficulty: 'orta' },
    ]
  },
  
  7: {
    grade: 7,
    tier2Words: [
      { word: 'hipotez', partOfSpeech: 'isim', definition: 'Geçici olarak doğru kabul edilen açıklama', difficulty: 'zor' },
      { word: 'teori', partOfSpeech: 'isim', definition: 'Kanıtlanmış hipotez', difficulty: 'zor' },
      { word: 'metodoloji', partOfSpeech: 'isim', definition: 'Bilimsel yöntemlerin bütünü', difficulty: 'zor' },
      { word: 'parametre', partOfSpeech: 'isim', definition: 'Sistemi tanımlayan ölçüt', difficulty: 'zor' },
      { word: 'değişken', partOfSpeech: 'isim', definition: 'Değişebilen faktör', difficulty: 'orta' },
      { word: 'etkileşim', partOfSpeech: 'isim', definition: 'Karşılıklı etki', difficulty: 'orta' },
      { word: 'dinamik', partOfSpeech: 'sıfat', definition: 'Hareketli, değişken', difficulty: 'orta' },
      { word: 'statik', partOfSpeech: 'sıfat', definition: 'Durağan, değişmez', difficulty: 'orta' },
      { word: 'optimum', partOfSpeech: 'sıfat', definition: 'En uygun, en elverişli', difficulty: 'zor' },
      { word: 'kritik', partOfSpeech: 'sıfat', definition: 'Çok önemli, tehlikeli', difficulty: 'orta' },
    ],
    tier3Words: [
      { word: 'fiil', partOfSpeech: 'isim', definition: 'İş, oluş, hareket bildiren kelime', difficulty: 'kolay' },
      { word: 'kip', partOfSpeech: 'isim', definition: 'Fiillerde zaman ve dilek bildiren ek', difficulty: 'orta' },
      { word: 'haber kipi', partOfSpeech: 'isim', definition: 'Gerçekleşmiş veya gerçekleşecek işleri bildiren kip', difficulty: 'orta' },
      { word: 'dilek kipi', partOfSpeech: 'isim', definition: 'Dilek, şart, emir bildiren kip', difficulty: 'orta' },
      { word: 'kişileştirme', partOfSpeech: 'isim', definition: 'İnsan dışı varlıklara insan özelliği verme', difficulty: 'orta' },
      { word: 'konuşturma', partOfSpeech: 'isim', definition: 'İnsan dışı varlıkları konuşturma sanatı', difficulty: 'orta' },
      { word: 'karşıtlık', partOfSpeech: 'isim', definition: 'Zıt kavramları bir arada kullanma', difficulty: 'orta' },
      { word: 'benzetme', partOfSpeech: 'isim', definition: 'İki varlık arasında ortak özellik kurma', difficulty: 'kolay' },
    ]
  },
  
  8: {
    grade: 8,
    tier2Words: [
      { word: 'sentetik', partOfSpeech: 'sıfat', definition: 'Yapay, sonradan oluşturulmuş', difficulty: 'zor' },
      { word: 'analitik', partOfSpeech: 'sıfat', definition: 'Analiz yöntemiyle ilgili', difficulty: 'zor' },
      { word: 'pragmatik', partOfSpeech: 'sıfat', definition: 'Faydacı, pratik', difficulty: 'zor' },
      { word: 'objektif', partOfSpeech: 'sıfat', definition: 'Nesnel, tarafsız', difficulty: 'orta' },
      { word: 'subjektif', partOfSpeech: 'sıfat', definition: 'Öznel, kişisel', difficulty: 'orta' },
      { word: 'implikasyon', partOfSpeech: 'isim', definition: 'Dolaylı sonuç, ima', difficulty: 'zor' },
      { word: 'entegrasyon', partOfSpeech: 'isim', definition: 'Bütünleştirme, uyum', difficulty: 'zor' },
      { word: 'transformasyon', partOfSpeech: 'isim', definition: 'Dönüşüm, başkalaşım', difficulty: 'zor' },
      { word: 'manipülasyon', partOfSpeech: 'isim', definition: 'Yönlendirme, etkileme', difficulty: 'zor' },
      { word: 'validasyon', partOfSpeech: 'isim', definition: 'Geçerlilik kontrolü', difficulty: 'zor' },
    ],
    tier3Words: [
      { word: 'fiilimsi', partOfSpeech: 'isim', definition: 'Fiilden türeyen isim, sıfat veya zarf', difficulty: 'zor' },
      { word: 'isim-fiil', partOfSpeech: 'isim', definition: '-ma/-me, -mak/-mek ekleriyle türeyen fiilimsi', difficulty: 'orta' },
      { word: 'sıfat-fiil', partOfSpeech: 'isim', definition: '-an/-en, -dik/-acak ekleriyle türeyen fiilimsi', difficulty: 'orta' },
      { word: 'zarf-fiil', partOfSpeech: 'isim', definition: '-ıp/-erek/-ince ekleriyle türeyen fiilimsi', difficulty: 'orta' },
      { word: 'cümle ögesi', partOfSpeech: 'isim', definition: 'Cümlenin anlamını oluşturan parçalar', difficulty: 'orta' },
      { word: 'özne', partOfSpeech: 'isim', definition: 'İşteki doyum veren cümle ögesi', difficulty: 'kolay' },
      { word: 'yüklem', partOfSpeech: 'isim', definition: 'Cümlenin yargısını bildiren öge', difficulty: 'kolay' },
      { word: 'nesne', partOfSpeech: 'isim', definition: 'İşten etkilenen cümle ögesi', difficulty: 'orta' },
      { word: 'dolaylı tümleç', partOfSpeech: 'isim', definition: 'Yer, yön, zaman bildiren cümle ögesi', difficulty: 'orta' },
      { word: 'infografik', partOfSpeech: 'isim', definition: 'Bilgi görselleştirme', difficulty: 'orta' },
    ]
  }
};

/**
 * Belirli sınıf seviyesi için Tier-2 kelimelerini döndürür
 */
export function getTier2Words(grade: GradeLevel): VocabularyWord[] {
  return VOCABULARY_ONTOLOGY[grade].tier2Words;
}

/**
 * Belirli sınıf seviyesi için Tier-3 kelimelerini döndürür
 */
export function getTier3Words(grade: GradeLevel): VocabularyWord[] {
  return VOCABULARY_ONTOLOGY[grade].tier3Words;
}

/**
 * Tüm sınıf seviyeleri için kelime sayısını döndürür
 */
export function getVocabularyStats(): Record<GradeLevel, { tier2Count: number; tier3Count: number }> {
  const stats: any = {};
  const grades: GradeLevel[] = [4, 5, 6, 7, 8];
  grades.forEach(grade => {
    stats[grade] = {
      tier2Count: VOCABULARY_ONTOLOGY[grade].tier2Words.length,
      tier3Count: VOCABULARY_ONTOLOGY[grade].tier3Words.length
    };
  });
  return stats;
}

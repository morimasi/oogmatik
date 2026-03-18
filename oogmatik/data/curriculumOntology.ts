// ==========================================
// MÜFREDAT VE BİLİŞSEL ONTOLOJİ VERİTABANI
// ==========================================

export type GradeLevel = '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8';
export type BloomLevel = 'remember' | 'understand' | 'apply' | 'analyze' | 'evaluate' | 'create';

export interface CurriculumObjective {
  code: string;
  description: string;
  keywords: string[];
  neuroConstraint: string; // Disleksi/DEHB dostu çevirisi
}

export const curriculumOntology: Record<GradeLevel, Record<string, CurriculumObjective[]>> = {
  '1': {
    turkce_okuma: [
      {
        code: 'T.1.3.1',
        description: 'Görsellerden hareketle okuyacağı metnin konusunu tahmin eder.',
        keywords: ['resim', 'tahmin', 'olay', 'karakter'],
        neuroConstraint:
          'Metni tek ve büyük bir görsel ile tam eşleşecek şekilde çok kısa (en fazla 3 cümle) yaz.',
      },
      {
        code: 'T.1.3.2',
        description: 'Okuduğu metinle ilgili soruları cevaplar.',
        keywords: ['kim', 'ne', 'nerede'],
        neuroConstraint:
          'Metin 10-15 kelimeyi geçmemeli. 5N1K yerine sadece "Kim" ve "Ne" sorulmalı.',
      },
    ],
  },
  '2': {
    turkce_okuma: [
      {
        code: 'T.2.3.1',
        description: 'Görsellerle ilgili soruları cevaplar.',
        keywords: ['görsel', 'soru', 'detay'],
        neuroConstraint: 'Somut nesneler kullan. Cümle başına en fazla 5 kelime.',
      },
      {
        code: 'T.2.3.4',
        description: 'Okuduğu metnin içeriğine uygun başlık belirler.',
        keywords: ['başlık', 'konu', 'isim'],
        neuroConstraint:
          'Çok kısa (en fazla 30 kelime) ve tek odaklı bir hikaye anlat. Başlık seçenekleri somut ve kısa olsun.',
      },
    ],
  },
  '3': {
    turkce_okuma: [
      {
        code: 'T.3.3.18',
        description: 'Okuduğu metindeki gerçek ve kurgusal ögeleri ayırt eder.',
        keywords: ['gerçek', 'hayal', 'masal', 'kurgu', 'olay'],
        neuroConstraint:
          'Soyut zaman ve mekan kavramlarını çok kısa tut. Olayları somut görsellerle destekleyerek sor.',
      },
      {
        code: 'T.3.3.15',
        description: 'Metnin ana fikrini/ana duygusunu belirler.',
        keywords: ['ana fikir', 'mesaj', 'duygu', 'ders', 'öğüt'],
        neuroConstraint:
          'Karmaşık edebi sanatlar kullanma. Sadece tek ve net bir mesaj içeren, açık ve direkt hikayeler kurgula.',
      },
    ],
  },
  '4': {
    turkce_okuma: [
      {
        code: 'T.4.3.18',
        description: 'Okuduğu metindeki gerçek ve kurgusal ögeleri ayırt eder.',
        keywords: ['gerçek', 'kurgu', 'olağanüstü', 'zaman', 'mekan'],
        neuroConstraint:
          'Metin içindeki olağanüstü ögeleri kısa ve çok somut tasvirlerle ver. Metafor veya deyim kullanma.',
      },
      {
        code: 'T.4.3.20',
        description: 'Okuduğu metindeki hikâye unsurlarını belirler.',
        keywords: ['şahıs', 'varlık kadrosu', 'mekân', 'zaman', 'olay örgüsü'],
        neuroConstraint:
          'Zaman ve mekanı metnin en başında net olarak ver. Dolaylı çıkarım yaptırma.',
      },
    ],
  },
  '5': {
    turkce_okuma: [
      {
        code: 'T.5.3.11',
        description: 'Okudukları ile ilgili çıkarımlarda bulunur.',
        keywords: ['sebep', 'sonuç', 'amaç', 'koşul'],
        neuroConstraint:
          'Metindeki sebep ve sonuç kısımlarını yan yana ver. Uzun cümlelerle olayı koparma.',
      },
      {
        code: 'T.5.3.13',
        description: 'Metindeki söz sanatlarını tespit eder.',
        keywords: ['benzetme', 'kişileştirme', 'abartma'],
        neuroConstraint:
          'Söz sanatını metinde kalın harflerle veya farklı renkle vurgulayarak sor.',
      },
    ],
  },
  '6': {
    turkce_okuma: [
      {
        code: 'T.6.3.17',
        description: 'Metinle ilgili soruları cevaplar.',
        keywords: ['öznel', 'nesnel', 'gerçek', 'kurgu'],
        neuroConstraint: 'Metinler makale tarzındaysa maddeler (bullet points) halinde böl.',
      },
      {
        code: 'T.6.3.21',
        description: 'Metindeki hikâye unsurlarını belirler.',
        keywords: ['olay örgüsü', 'zaman', 'mekân', 'kişiler', 'anlatıcı'],
        neuroConstraint: 'Anlatıcıyı buldurmak için şahıs eklerini (ben/o) vurgulayarak ipucu ver.',
      },
    ],
  },
  '7': {
    turkce_okuma: [
      {
        code: 'T.7.3.19',
        description: 'Metinler arasında karşılaştırma yapar.',
        keywords: ['bakış açısı', 'mesaj', 'biçim'],
        neuroConstraint:
          'Karşılaştırılacak metinleri çok kısa tut ve yan yana (iki kolon) olarak ver.',
      },
      {
        code: 'T.7.3.22',
        description: 'Metindeki anlatım biçimlerini belirler.',
        keywords: ['açıklama', 'tartışma', 'betimleme', 'öyküleme'],
        neuroConstraint: 'Betimlemeleri çok somut (renk, boyut) üzerinden ver.',
      },
    ],
  },
  '8': {
    turkce_okuma: [
      {
        code: 'T.8.3.13',
        description: 'Okudukları ile ilgili çıkarımlarda bulunur. (LGS Mantığı)',
        keywords: ['neden-sonuç', 'amaç-sonuç', 'koşul', 'karşılaştırma', 'çıkarım'],
        neuroConstraint:
          'Sorunun kökünü çok net, etken çatıyla sor. LGS mantığındaki çeldiricileri çok benzeyen (b-d) harflerle değil, net kavram farklılıklarıyla oluştur.',
      },
      {
        code: 'T.8.3.18',
        description: 'Metindeki yardımcı fikirleri belirler.',
        keywords: ['değinilmemiştir', 'çıkarılamaz', 'yardımcı fikir'],
        neuroConstraint:
          'Soru kökünde olumsuz (değinilmemiştir) ifadesi varsa, şıkların metindeki karşılıklarını numaralandırarak ipucu sağla.',
      },
    ],
  },
};

// Bilişsel Seviye Stratejileri (Bloom's Taxonomy -> Disleksi Adaptasyonu)
export const bloomStrategies: Record<BloomLevel, string> = {
  remember:
    'Sadece daha önce verdiğin bilgiyi geri çağırmasını iste. Eşleştirme veya basit D/Y kullan.',
  understand:
    'Kavramı kendi cümleleriyle değil, senin verdiğin doğru/yanlış örnekleri ayırt ederek göstermesini bekle.',
  apply:
    'Öğrendiği kuralı, tıpatıp aynı formattaki yeni bir senaryoda uygulamasını iste. Soru kökleri eylemsel olmalı.',
  analyze:
    'Bir bütünü parçalara ayırmasını iste (Örn: Olayı adımlara sıralat). Karmaşık ağaç yapıları çizdirme.',
  evaluate:
    'İki somut durumu karşılaştırmasını iste. Seçenekler zıt olmalı (siyah/beyaz gibi net farklar).',
  create:
    'Baştan bir şey yaratmasını (yazmasını) değil, senin verdiğin ipuçlarını (sentence starters) birleştirerek yeni bir fikir oluşturmasını bekle.',
};

export const tier2Words: Record<GradeLevel, string[]> = {
  '1': ['büyük', 'küçük', 'renkli', 'hızlı', 'yavaş'],
  '2': ['hemen', 'önce', 'sonra', 'farklı', 'aynı', 'mutlu'],
  '3': ['benzer', 'neden', 'çünkü', 'sonuç', 'özellik', 'davranış'],
  '4': ['sebep', 'etki', 'avantaj', 'dezavantaj', 'kavram', 'çevre'],
  '5': ['açıklama', 'kanıt', 'yöntem', 'süreç', 'değişim', 'fayda'],
  '6': ['analiz', 'yaklaşım', 'gösterge', 'işlev', 'yapı', 'çeşitli'],
  '7': ['perspektif', 'varsayım', 'etkileşim', 'kritik', 'kriter', 'bağlam'],
  '8': ['sentez', 'strateji', 'argüman', 'hipotez', 'değerlendirme', 'ilke'],
};

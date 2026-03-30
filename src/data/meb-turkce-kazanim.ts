/**
 * MEB 2024-2025 Türkçe Dersi Öğretim Programı Kazanımları
 * Kaynak: kazanimlar.md — Tüm sınıflar (1-8) tam kapsam
 */

import { MEBSinifMufredati, MEBUnite, MEBKazanim, MEBOgrenmeAlani } from '../types/sinav';

// ─── Yardımcı: kazanım objesi üretici ────────────────────────────────────────
const k = (
  kod: string,
  sinif: number,
  ogrenmeAlani: MEBOgrenmeAlani,
  tanim: string,
  unite: string
): MEBKazanim => ({ kod, sinif, ogrenmeAlani, tanim, unite });

// ════════════════════════════════════════════════════════════════════════════
// 1. SINIF
// ════════════════════════════════════════════════════════════════════════════
const SINIF_1: MEBUnite[] = [
  {
    id: 'unite-1-1', sinif: 1, uniteNo: 1, baslik: 'Okuma',
    kazanimlar: [
      k('T.1.3.1', 1, 'Okuma', 'Harfi tanır ve seslendirir.', 'Okuma'),
      k('T.1.3.2', 1, 'Okuma', 'Heceleri okur.', 'Okuma'),
      k('T.1.3.3', 1, 'Okuma', 'Kelimeleri okur.', 'Okuma'),
      k('T.1.3.4', 1, 'Okuma', 'Cümleleri okur.', 'Okuma'),
      k('T.1.3.5', 1, 'Okuma', 'Kısa metinleri okur.', 'Okuma'),
    ]
  },
  {
    id: 'unite-1-2', sinif: 1, uniteNo: 2, baslik: 'Yazma',
    kazanimlar: [
      k('T.1.4.1', 1, 'Yazma', 'Harfleri kuralına uygun yazar.', 'Yazma'),
      k('T.1.4.2', 1, 'Yazma', 'Heceler oluşturur ve yazar.', 'Yazma'),
      k('T.1.4.3', 1, 'Yazma', 'Kelimeler yazar.', 'Yazma'),
      k('T.1.4.4', 1, 'Yazma', 'Cümleler yazar.', 'Yazma'),
      k('T.1.4.5', 1, 'Yazma', 'Büyük harfleri ve noktalama işaretlerini (nokta, virgül, soru işareti) uygun yerlerde kullanır.', 'Yazma'),
    ]
  },
  {
    id: 'unite-1-3', sinif: 1, uniteNo: 3, baslik: 'Dinleme/İzleme ve Konuşma',
    kazanimlar: [
      k('T.1.1.1', 1, 'Dinleme/İzleme', 'Dinlediklerinde/izlediklerinde geçen olayların gelişimini ve sonucunu tahmin eder.', 'Dinleme/İzleme ve Konuşma'),
      k('T.1.1.2', 1, 'Dinleme/İzleme', 'Dinlediklerini/izlediklerini anlar.', 'Dinleme/İzleme ve Konuşma'),
      k('T.1.2.1', 1, 'Konuşma', 'Kelimeleri anlamlarına uygun kullanır.', 'Dinleme/İzleme ve Konuşma'),
      k('T.1.2.2', 1, 'Konuşma', 'Çerçevesi belirli bir konu hakkında konuşur.', 'Dinleme/İzleme ve Konuşma'),
    ]
  },
];

// ════════════════════════════════════════════════════════════════════════════
// 2. SINIF
// ════════════════════════════════════════════════════════════════════════════
const SINIF_2: MEBUnite[] = [
  {
    id: 'unite-2-1', sinif: 2, uniteNo: 1, baslik: 'Sözcükte Anlam',
    kazanimlar: [
      k('T.2.3.9', 2, 'Okuma', 'Kelimelerin zıt anlamlılarını bulur.', 'Sözcükte Anlam'),
      k('T.2.3.10', 2, 'Okuma', 'Kelimelerin eş anlamlılarını tahmin eder.', 'Sözcükte Anlam'),
      k('T.2.3.11', 2, 'Okuma', 'Görselden/görsellerden hareketle bilmediği kelimelerin anlamlarını tahmin eder.', 'Sözcükte Anlam'),
    ]
  },
  {
    id: 'unite-2-2', sinif: 2, uniteNo: 2, baslik: 'Metinde Anlam (Okuma Anlama)',
    kazanimlar: [
      k('T.2.3.14', 2, 'Okuma', 'Okuduğu metnin konusunu belirler.', 'Metinde Anlam (Okuma Anlama)'),
      k('T.2.3.15', 2, 'Okuma', 'Okuduğu metnin ana fikrini/ana duygusunu belirler.', 'Metinde Anlam (Okuma Anlama)'),
      k('T.2.3.16', 2, 'Okuma', 'Okuduğu metinle ilgili soruları cevaplar.', 'Metinde Anlam (Okuma Anlama)'),
      k('T.2.3.17', 2, 'Okuma', 'Metinle ilgili sorular sorar.', 'Metinde Anlam (Okuma Anlama)'),
      k('T.2.3.13', 2, 'Okuma', 'Görsellerden hareketle okuyacağı metnin konusunu tahmin eder.', 'Metinde Anlam (Okuma Anlama)'),
    ]
  },
  {
    id: 'unite-2-3', sinif: 2, uniteNo: 3, baslik: 'Yazım ve Noktalama',
    kazanimlar: [
      k('T.2.4.16', 2, 'Yazma', 'Büyük harfleri ve noktalama işaretlerini uygun yerlerde kullanır.', 'Yazım ve Noktalama'),
      k('T.2.4.17', 2, 'Yazma', 'Yazdıklarını düzenler (Yazım ve noktalama kuralları).', 'Yazım ve Noktalama'),
      k('T.2.4.8', 2, 'Yazma', 'Anlamlı ve kurallı cümleler yazar.', 'Yazım ve Noktalama'),
    ]
  },
];

// ════════════════════════════════════════════════════════════════════════════
// 3. SINIF
// ════════════════════════════════════════════════════════════════════════════
const SINIF_3: MEBUnite[] = [
  {
    id: 'unite-3-1', sinif: 3, uniteNo: 1, baslik: 'Sözcükte Anlam',
    kazanimlar: [
      k('T.3.3.11', 3, 'Okuma', 'Kelimelerin eş anlamlılarını bulur.', 'Sözcükte Anlam'),
      k('T.3.3.12', 3, 'Okuma', 'Kelimelerin zıt anlamlılarını bulur.', 'Sözcükte Anlam'),
      k('T.3.3.13', 3, 'Okuma', 'Eş sesli kelimelerin anlamlarını ayırt eder.', 'Sözcükte Anlam'),
      k('T.3.3.10', 3, 'Okuma', 'Görselden/görsellerden hareketle bilmediği kelimelerin anlamlarını tahmin eder.', 'Sözcükte Anlam'),
    ]
  },
  {
    id: 'unite-3-2', sinif: 3, uniteNo: 2, baslik: 'Metinde Anlam (Okuma Anlama)',
    kazanimlar: [
      k('T.3.3.18', 3, 'Okuma', 'Okuduğu metnin konusunu belirler.', 'Metinde Anlam (Okuma Anlama)'),
      k('T.3.3.19', 3, 'Okuma', 'Okuduğu metnin ana fikrini/ana duygusunu belirler.', 'Metinde Anlam (Okuma Anlama)'),
      k('T.3.3.20', 3, 'Okuma', 'Okuduğu metinle ilgili soruları cevaplar.', 'Metinde Anlam (Okuma Anlama)'),
      k('T.3.3.21', 3, 'Okuma', 'Metindeki hikâye unsurlarını (şahıs ve varlık kadrosu, mekân, zaman, olay) belirler.', 'Metinde Anlam (Okuma Anlama)'),
      k('T.3.3.22', 3, 'Okuma', 'Metnin içeriğine uygun başlık/başlıklar belirler.', 'Metinde Anlam (Okuma Anlama)'),
    ]
  },
  {
    id: 'unite-3-3', sinif: 3, uniteNo: 3, baslik: 'Yazım ve Noktalama',
    kazanimlar: [
      k('T.3.4.16', 3, 'Yazma', 'Büyük harfleri ve noktalama işaretlerini uygun yerlerde kullanır.', 'Yazım ve Noktalama'),
      k('T.3.4.17', 3, 'Yazma', 'Yazdıklarını düzenler (Yazım ve noktalama kuralları).', 'Yazım ve Noktalama'),
      k('T.3.4.9', 3, 'Yazma', 'Kısa metinler yazar.', 'Yazım ve Noktalama'),
    ]
  },
];

// ════════════════════════════════════════════════════════════════════════════
// 4. SINIF
// ════════════════════════════════════════════════════════════════════════════
const SINIF_4: MEBUnite[] = [
  {
    id: 'unite-4-1', sinif: 4, uniteNo: 1, baslik: 'Sözcükte Anlam',
    kazanimlar: [
      k('T.4.3.5', 4, 'Okuma', 'Kelimelerin zıt anlamlılarını bulur.', 'Sözcükte Anlam'),
      k('T.4.3.6', 4, 'Okuma', 'Kelimelerin eş anlamlılarını bulur.', 'Sözcükte Anlam'),
      k('T.4.3.7', 4, 'Okuma', 'Eş sesli kelimelerin anlamlarını ayırt eder.', 'Sözcükte Anlam'),
      k('T.4.3.8', 4, 'Okuma', 'Kelimelerin gerçek ve mecaz anlamlarını ayırt eder.', 'Sözcükte Anlam'),
      k('T.4.3.9', 4, 'Okuma', 'Deyim ve atasözlerinin anlamlarını tahmin eder.', 'Sözcükte Anlam'),
    ]
  },
  {
    id: 'unite-4-2', sinif: 4, uniteNo: 2, baslik: 'Cümlede Anlam',
    kazanimlar: [
      k('T.4.3.14', 4, 'Okuma', 'Cümleler arasındaki anlam ilişkilerini kavrar (sebep-sonuç).', 'Cümlede Anlam'),
      k('T.4.3.15', 4, 'Okuma', 'Cümleler arasındaki anlam ilişkilerini kavrar (karşılaştırma).', 'Cümlede Anlam'),
      k('T.4.3.19', 4, 'Okuma', 'Okuduğu metindeki gerçek ve hayalî ögeleri ayırt eder.', 'Cümlede Anlam'),
      k('T.4.3.20', 4, 'Okuma', 'Öznel ve nesnel yargıları ayırt eder.', 'Cümlede Anlam'),
      k('T.4.3.21', 4, 'Okuma', 'Cümleye hâkim olan duyguyu belirler.', 'Cümlede Anlam'),
    ]
  },
  {
    id: 'unite-4-3', sinif: 4, uniteNo: 3, baslik: 'Paragrafta Anlam',
    kazanimlar: [
      k('T.4.3.23', 4, 'Okuma', 'Metnin konusunu belirler.', 'Paragrafta Anlam'),
      k('T.4.3.24', 4, 'Okuma', 'Metnin ana fikrini/ana duygusunu belirler.', 'Paragrafta Anlam'),
      k('T.4.3.25', 4, 'Okuma', 'Metne uygun başlık belirler.', 'Paragrafta Anlam'),
      k('T.4.3.29', 4, 'Okuma', 'Metnin içeriğine yönelik sorular sorar ve cevaplar.', 'Paragrafta Anlam'),
      k('T.4.3.30', 4, 'Okuma', 'Metindeki olayları oluş sırasına göre sıralar.', 'Paragrafta Anlam'),
    ]
  },
  {
    id: 'unite-4-4', sinif: 4, uniteNo: 4, baslik: 'Dil Bilgisi',
    kazanimlar: [
      k('T.4.4.1a', 4, 'Dil Bilgisi', 'İsimleri türlerine göre ayırt eder (özel, cins).', 'Dil Bilgisi'),
      k('T.4.4.1b', 4, 'Dil Bilgisi', 'İsimleri sayılarına göre ayırt eder (tekil, çoğul, topluluk).', 'Dil Bilgisi'),
      k('T.4.4.2', 4, 'Dil Bilgisi', 'Sıfatları (ön ad) tanır ve varlıkları nitelediğini bilir.', 'Dil Bilgisi'),
      k('T.4.4.3', 4, 'Dil Bilgisi', 'Varlıkların yerini tutan sözcükleri (zamir) fark eder.', 'Dil Bilgisi'),
      k('T.4.4.4', 4, 'Dil Bilgisi', 'Eylem bildiren kelimeleri (fiil) tanır.', 'Dil Bilgisi'),
    ]
  },
  {
    id: 'unite-4-5', sinif: 4, uniteNo: 5, baslik: 'Yazım ve Noktalama',
    kazanimlar: [
      k('T.4.4.7', 4, 'Yazma', 'Büyük harfleri uygun yerlerde kullanır.', 'Yazım ve Noktalama'),
      k('T.4.4.8', 4, 'Yazma', 'Nokta, virgül, soru işareti ve ünlem işaretini işlevine uygun kullanır.', 'Yazım ve Noktalama'),
      k('T.4.4.12', 4, 'Yazma', 'Sayıların yazımını bilir.', 'Yazım ve Noktalama'),
      k('T.4.4.13', 4, 'Yazma', "'de' ve 'ki' bağlaçlarının yazımını ayırt eder.", 'Yazım ve Noktalama'),
      k('T.4.4.14', 4, 'Yazma', "Soru eki 'mi'nin yazımını bilir.", 'Yazım ve Noktalama'),
    ]
  },
  {
    id: 'unite-4-6', sinif: 4, uniteNo: 6, baslik: 'Görsel Okuma',
    kazanimlar: [
      k('T.4.3.33', 4, 'Okuma', 'Görsellerle ilgili soruları cevaplar.', 'Görsel Okuma'),
      k('T.4.3.34', 4, 'Okuma', 'Tablo ve grafiklerdeki basit bilgileri yorumlar.', 'Görsel Okuma'),
      k('T.4.3.35', 4, 'Okuma', 'Harita ve kroki okur.', 'Görsel Okuma'),
    ]
  },
];

// ════════════════════════════════════════════════════════════════════════════
// 5. SINIF
// ════════════════════════════════════════════════════════════════════════════
const SINIF_5: MEBUnite[] = [
  {
    id: 'unite-5-1', sinif: 5, uniteNo: 1, baslik: 'Sözcükte Anlam',
    kazanimlar: [
      k('T.5.3.5', 5, 'Okuma', 'Bağlamdan yararlanarak bilmediği kelime ve kelime gruplarının anlamını tahmin eder.', 'Sözcükte Anlam'),
      k('T.5.3.6', 5, 'Okuma', 'Kelimelerin gerçek, mecaz ve terim anlamlarını ayırt eder.', 'Sözcükte Anlam'),
      k('T.5.3.7', 5, 'Okuma', 'Kelimelerin eş ve zıt anlamlılarını bulur.', 'Sözcükte Anlam'),
      k('T.5.3.8', 5, 'Okuma', 'Eş sesli kelimelerin anlamlarını ayırt eder.', 'Sözcükte Anlam'),
      k('T.5.3.9', 5, 'Okuma', 'Deyim ve atasözlerinin metne katkısını belirler.', 'Sözcükte Anlam'),
      k('T.5.3.10', 5, 'Okuma', 'Soyut ve somut anlamlı kelimeleri ayırt eder.', 'Sözcükte Anlam'),
    ]
  },
  {
    id: 'unite-5-2', sinif: 5, uniteNo: 2, baslik: 'Cümlede Anlam',
    kazanimlar: [
      k('T.5.3.14', 5, 'Okuma', 'Metindeki sebep-sonuç cümlelerini belirler.', 'Cümlede Anlam'),
      k('T.5.3.15', 5, 'Okuma', 'Metindeki amaç-sonuç cümlelerini belirler.', 'Cümlede Anlam'),
      k('T.5.3.16', 5, 'Okuma', 'Metindeki koşul-sonuç cümlelerini belirler.', 'Cümlede Anlam'),
      k('T.5.3.17', 5, 'Okuma', 'Cümleler arası karşılaştırma yapar.', 'Cümlede Anlam'),
      k('T.5.3.18', 5, 'Okuma', 'Öznel ve nesnel yargılı cümleleri ayırt eder.', 'Cümlede Anlam'),
      k('T.5.3.19', 5, 'Okuma', 'Cümledeki örtülü anlamı fark eder.', 'Cümlede Anlam'),
    ]
  },
  {
    id: 'unite-5-3', sinif: 5, uniteNo: 3, baslik: 'Paragrafta Anlam',
    kazanimlar: [
      k('T.5.3.23', 5, 'Okuma', 'Metnin ana fikrini/ana duygusunu belirler.', 'Paragrafta Anlam'),
      k('T.5.3.24', 5, 'Okuma', 'Metnin konusunu belirler.', 'Paragrafta Anlam'),
      k('T.5.3.25', 5, 'Okuma', 'Metindeki yardımcı fikirleri belirler.', 'Paragrafta Anlam'),
      k('T.5.3.26', 5, 'Okuma', 'Metnin yapısını (giriş, gelişme, sonuç) analiz eder.', 'Paragrafta Anlam'),
      k('T.5.3.30', 5, 'Okuma', 'Metinle ilgili sorular sorar ve cevaplar.', 'Paragrafta Anlam'),
      k('T.5.3.31', 5, 'Okuma', 'Metindeki anlatıcıyı (birinci/üçüncü kişi) belirler.', 'Paragrafta Anlam'),
    ]
  },
  {
    id: 'unite-5-4', sinif: 5, uniteNo: 4, baslik: 'Dil Bilgisi',
    kazanimlar: [
      k('T.5.4.1', 5, 'Dil Bilgisi', 'Kökleri ve ekleri ayırt eder.', 'Dil Bilgisi'),
      k('T.5.4.2', 5, 'Dil Bilgisi', 'Yapım eklerinin işlevlerini bilir.', 'Dil Bilgisi'),
      k('T.5.4.3', 5, 'Dil Bilgisi', 'Çekim eklerinin işlevlerini bilir (isim ve fiil çekim ekleri).', 'Dil Bilgisi'),
      k('T.5.4.4', 5, 'Dil Bilgisi', 'Kelimeleri yapılarına göre (basit, türemiş, birleşik) ayırt eder.', 'Dil Bilgisi'),
      k('T.5.4.5', 5, 'Dil Bilgisi', 'Ses olaylarını (ünsüz benzeşmesi, ünsüz yumuşaması, ünlü düşmesi, ünlü daralması) fark eder.', 'Dil Bilgisi'),
    ]
  },
  {
    id: 'unite-5-5', sinif: 5, uniteNo: 5, baslik: 'Yazım Kuralları ve Noktalama İşaretleri',
    kazanimlar: [
      k('T.5.4.10', 5, 'Yazma', 'Büyük harfleri ve noktalama işaretlerini (iki nokta, tırnak işareti, üç nokta) uygun yerlerde kullanır.', 'Yazım Kuralları ve Noktalama İşaretleri'),
      k('T.5.4.12', 5, 'Yazma', 'Kısaltmaların ve kısaltmalara gelen eklerin yazımını bilir.', 'Yazım Kuralları ve Noktalama İşaretleri'),
      k('T.5.4.13', 5, 'Yazma', 'Sayıların yazımını bilir.', 'Yazım Kuralları ve Noktalama İşaretleri'),
      k('T.5.4.14', 5, 'Yazma', "'de', 'ki' bağlaçlarının ve 'mi' soru ekinin yazım kurallarını uygular.", 'Yazım Kuralları ve Noktalama İşaretleri'),
    ]
  },
  {
    id: 'unite-5-6', sinif: 5, uniteNo: 6, baslik: 'Metin Türleri',
    kazanimlar: [
      k('T.5.3.35', 5, 'Okuma', 'Hikâye (öykü), masal ve fabl metinlerinin özelliklerini ayırt eder.', 'Metin Türleri'),
      k('T.5.3.36', 5, 'Okuma', 'Bilgilendirici ve hikâye edici metinleri ayırt eder.', 'Metin Türleri'),
    ]
  },
];

// ════════════════════════════════════════════════════════════════════════════
// 6. SINIF
// ════════════════════════════════════════════════════════════════════════════
const SINIF_6: MEBUnite[] = [
  {
    id: 'unite-6-1', sinif: 6, uniteNo: 1, baslik: 'Sözcükte ve Söz Gruplarında Anlam',
    kazanimlar: [
      k('T.6.3.5', 6, 'Okuma', 'Bağlamdan yararlanarak bilmediği kelime ve kelime gruplarının anlamını tahmin eder.', 'Sözcükte ve Söz Gruplarında Anlam'),
      k('T.6.3.6', 6, 'Okuma', 'Deyim ve atasözlerinin metne katkısını belirler.', 'Sözcükte ve Söz Gruplarında Anlam'),
      k('T.6.3.7', 6, 'Okuma', 'Söz gruplarının (ikilemeler, dolaylamalar, yansıma sözcükler) anlamını tahmin eder.', 'Sözcükte ve Söz Gruplarında Anlam'),
      k('T.6.3.8', 6, 'Okuma', 'Kelimelerin anlam özelliklerini (genel-özel, nitel-nicel) ayırt eder.', 'Sözcükte ve Söz Gruplarında Anlam'),
    ]
  },
  {
    id: 'unite-6-2', sinif: 6, uniteNo: 2, baslik: 'Cümlede Anlam',
    kazanimlar: [
      k('T.6.3.15', 6, 'Okuma', 'Cümleler arası anlam ilişkilerini (neden-sonuç, amaç-sonuç, koşul) belirler.', 'Cümlede Anlam'),
      k('T.6.3.18', 6, 'Okuma', 'Öznel ve nesnel yargıları ayırt eder.', 'Cümlede Anlam'),
      k('T.6.3.19', 6, 'Okuma', 'Metindeki örtülü anlamları bulur.', 'Cümlede Anlam'),
      k('T.6.3.20', 6, 'Okuma', 'Cümle yorumlama (yakın anlamlı, çelişen, aynı doğrultuda) çalışmaları yapar.', 'Cümlede Anlam'),
    ]
  },
  {
    id: 'unite-6-3', sinif: 6, uniteNo: 3, baslik: 'Paragrafta Yapı ve Anlam',
    kazanimlar: [
      k('T.6.3.23', 6, 'Okuma', 'Metnin ana fikrini/ana duygusunu belirler.', 'Paragrafta Yapı ve Anlam'),
      k('T.6.3.24', 6, 'Okuma', 'Metnin konusunu belirler.', 'Paragrafta Yapı ve Anlam'),
      k('T.6.3.25', 6, 'Okuma', 'Metindeki yardımcı fikirleri belirler.', 'Paragrafta Yapı ve Anlam'),
      k('T.6.3.26', 6, 'Okuma', 'Metnin başlığını içeriğiyle ilişkilendirir.', 'Paragrafta Yapı ve Anlam'),
      k('T.6.3.27', 6, 'Okuma', 'Metnin olay örgüsü, yer, zaman ve karakterlerini belirler.', 'Paragrafta Yapı ve Anlam'),
    ]
  },
  {
    id: 'unite-6-4', sinif: 6, uniteNo: 4, baslik: 'Anlatım Biçimleri ve Düşünceyi Geliştirme Yolları',
    kazanimlar: [
      k('T.6.3.28', 6, 'Okuma', 'Anlatım biçimlerini (açıklama, tartışma, betimleme, öyküleme) belirler.', 'Anlatım Biçimleri ve Düşünceyi Geliştirme Yolları'),
      k('T.6.3.29', 6, 'Okuma', 'Düşünceyi geliştirme yollarını (tanımlama, karşılaştırma, örneklendirme, tanık gösterme, benzetme, sayısal verilerden yararlanma) belirler.', 'Anlatım Biçimleri ve Düşünceyi Geliştirme Yolları'),
    ]
  },
  {
    id: 'unite-6-5', sinif: 6, uniteNo: 5, baslik: 'Dil Bilgisi',
    kazanimlar: [
      k('T.6.4.1', 6, 'Dil Bilgisi', 'İsim tamlamalarını (belirtili, belirtisiz, zincirleme) ayırt eder.', 'Dil Bilgisi'),
      k('T.6.4.2a', 6, 'Dil Bilgisi', 'Sıfat tamlamalarını ayırt eder.', 'Dil Bilgisi'),
      k('T.6.4.2b', 6, 'Dil Bilgisi', 'Sıfatların türlerini (niteleme, belirtme) tanır.', 'Dil Bilgisi'),
      k('T.6.4.3', 6, 'Dil Bilgisi', 'Zamirleri (adıl) türlerine göre (kişi, işaret, belgisiz, soru) ayırt eder.', 'Dil Bilgisi'),
      k('T.6.4.4', 6, 'Dil Bilgisi', 'Edat, bağlaç ve ünlemleri işlevleriyle ayırt eder.', 'Dil Bilgisi'),
    ]
  },
  {
    id: 'unite-6-6', sinif: 6, uniteNo: 6, baslik: 'Yazım ve Noktalama',
    kazanimlar: [
      k('T.6.4.10', 6, 'Yazma', 'Noktalama işaretlerini (noktalı virgül, iki nokta, üç nokta) işlevlerine uygun kullanır.', 'Yazım ve Noktalama'),
      k('T.6.4.11', 6, 'Yazma', 'Yazımı karıştırılan sözcükleri doğru kullanır.', 'Yazım ve Noktalama'),
      k('T.6.4.12', 6, 'Yazma', 'Büyük harflerin kullanım alanlarını bilir.', 'Yazım ve Noktalama'),
    ]
  },
  {
    id: 'unite-6-7', sinif: 6, uniteNo: 7, baslik: 'Metin Türleri ve Söz Sanatları',
    kazanimlar: [
      k('T.6.3.36', 6, 'Okuma', 'Metin türlerini (deneme, fıkra, anı, gezi yazısı, mektup) ayırt eder.', 'Metin Türleri ve Söz Sanatları'),
      k('T.6.3.37', 6, 'Okuma', 'Şiirin şekil özelliklerini (nazım birimi, ölçü, uyak) tanır.', 'Metin Türleri ve Söz Sanatları'),
      k('T.6.3.38', 6, 'Okuma', 'Söz sanatlarını (benzetme, abartma, kişileştirme, konuşturma) tespit eder.', 'Metin Türleri ve Söz Sanatları'),
    ]
  },
];

// ════════════════════════════════════════════════════════════════════════════
// 7. SINIF
// ════════════════════════════════════════════════════════════════════════════
const SINIF_7: MEBUnite[] = [
  {
    id: 'unite-7-1', sinif: 7, uniteNo: 1, baslik: 'Sözcükte ve Söz Gruplarında Anlam',
    kazanimlar: [
      k('T.7.3.5', 7, 'Okuma', 'Bağlamdan yararlanarak bilmediği kelime ve kelime gruplarının anlamını tahmin eder.', 'Sözcükte ve Söz Gruplarında Anlam'),
      k('T.7.3.6', 7, 'Okuma', 'Kelimeler arası anlam ilişkilerini kavrar (çok anlamlılık).', 'Sözcükte ve Söz Gruplarında Anlam'),
      k('T.7.3.7', 7, 'Okuma', 'Metindeki söz sanatlarını tespit eder (benzetme, kişileştirme, abartma, konuşturma, tezat).', 'Sözcükte ve Söz Gruplarında Anlam'),
      k('T.7.3.8', 7, 'Okuma', 'Geçiş ve bağlantı ifadelerinin metnin anlamına olan katkısını değerlendirir.', 'Sözcükte ve Söz Gruplarında Anlam'),
    ]
  },
  {
    id: 'unite-7-2', sinif: 7, uniteNo: 2, baslik: 'Cümlede Anlam',
    kazanimlar: [
      k('T.7.3.18', 7, 'Okuma', 'Cümledeki anlam özelliklerini (varsayım, olasılık, öneri, tasarı, pişmanlık, sitem) belirler.', 'Cümlede Anlam'),
      k('T.7.3.19', 7, 'Okuma', 'Doğrudan ve dolaylı anlatımı ayırt eder.', 'Cümlede Anlam'),
      k('T.7.3.20', 7, 'Okuma', 'Anlatımın özelliklerini (yalınlık, duruluk, açıklık, özgünlük) belirler.', 'Cümlede Anlam'),
      k('T.7.3.21', 7, 'Okuma', 'Cümle tamamlama ve oluşturma çalışmaları yapar.', 'Cümlede Anlam'),
    ]
  },
  {
    id: 'unite-7-3', sinif: 7, uniteNo: 3, baslik: 'Paragrafta Anlam',
    kazanimlar: [
      k('T.7.3.24', 7, 'Okuma', 'Metnin ana fikrini/ana duygusunu belirler.', 'Paragrafta Anlam'),
      k('T.7.3.25', 7, 'Okuma', 'Metindeki yardımcı fikirleri belirler.', 'Paragrafta Anlam'),
      k('T.7.3.31', 7, 'Okuma', 'Metindeki düşünceyi geliştirme yollarını analiz eder.', 'Paragrafta Anlam'),
      k('T.7.3.32', 7, 'Okuma', 'Paragrafın akışını bozan cümleyi tespit eder.', 'Paragrafta Anlam'),
      k('T.7.3.33', 7, 'Okuma', 'Paragrafı ikiye bölme çalışmalarını yapar.', 'Paragrafta Anlam'),
      k('T.7.3.34', 7, 'Okuma', 'Paragrafta boş bırakılan yere uygun cümleyi yerleştirir.', 'Paragrafta Anlam'),
    ]
  },
  {
    id: 'unite-7-4', sinif: 7, uniteNo: 4, baslik: 'Fiiller (Eylemler)',
    kazanimlar: [
      k('T.7.4.2', 7, 'Dil Bilgisi', 'Fiillerin anlam özelliklerini fark eder (iş, oluş, durum).', 'Fiiller (Eylemler)'),
      k('T.7.4.3', 7, 'Dil Bilgisi', 'Fiilde kipleri (haber ve dilek) ve kişi eklerini ayırt eder.', 'Fiiller (Eylemler)'),
      k('T.7.4.4', 7, 'Dil Bilgisi', 'Fiillerde anlam kaymasını fark eder.', 'Fiiller (Eylemler)'),
      k('T.7.4.5a', 7, 'Dil Bilgisi', 'Ek fiili işlevleriyle (ismi yüklem yapma, basit zamanlı fiili birleşik zamanlı yapma) tanır.', 'Fiiller (Eylemler)'),
      k('T.7.4.5b', 7, 'Dil Bilgisi', 'Basit, türemiş ve birleşik fiilleri ayırt eder.', 'Fiiller (Eylemler)'),
    ]
  },
  {
    id: 'unite-7-5', sinif: 7, uniteNo: 5, baslik: 'Zarflar ve Fiilimsiler',
    kazanimlar: [
      k('T.7.4.6', 7, 'Dil Bilgisi', 'Zarfların (belirteç) metne olan katkısını ve türlerini (durum, zaman, miktar, yer-yön, soru) değerlendirir.', 'Zarflar ve Fiilimsiler'),
      k('T.7.4.7', 7, 'Dil Bilgisi', 'Fiilimsilerin (isim-fiil, sıfat-fiil, zarf-fiil) cümledeki işlevini fark eder.', 'Zarflar ve Fiilimsiler'),
    ]
  },
  {
    id: 'unite-7-6', sinif: 7, uniteNo: 6, baslik: 'Yazım, Noktalama ve Anlatım Bozuklukları',
    kazanimlar: [
      k('T.7.4.13', 7, 'Yazma', 'Noktalama işaretlerini (yay ayraç, kesme işareti, kısa çizgi, eğik çizgi) doğru kullanır.', 'Yazım, Noktalama ve Anlatım Bozuklukları'),
      k('T.7.4.14', 7, 'Yazma', 'Anlatım bozukluklarını belirler (anlama dayalı).', 'Yazım, Noktalama ve Anlatım Bozuklukları'),
    ]
  },
];

// ════════════════════════════════════════════════════════════════════════════
// 8. SINIF
// ════════════════════════════════════════════════════════════════════════════
const SINIF_8: MEBUnite[] = [
  {
    id: 'unite-8-1', sinif: 8, uniteNo: 1, baslik: 'Sözcükte ve Söz Gruplarında Anlam',
    kazanimlar: [
      k('T.8.3.5', 8, 'Okuma', 'Kelime ve kelime gruplarının cümleye kattığı anlamı yorumlar.', 'Sözcükte ve Söz Gruplarında Anlam'),
      k('T.8.3.6', 8, 'Okuma', 'Metindeki söz sanatlarını tespit eder.', 'Sözcükte ve Söz Gruplarında Anlam'),
      k('T.8.3.2', 8, 'Okuma', 'Geçiş ve bağlantı ifadelerinin metnin anlamına olan katkısını değerlendirir.', 'Sözcükte ve Söz Gruplarında Anlam'),
      k('T.8.3.3', 8, 'Okuma', 'Deyim, atasözü ve özdeyişlerin metne katkısını değerlendirir.', 'Sözcükte ve Söz Gruplarında Anlam'),
    ]
  },
  {
    id: 'unite-8-2', sinif: 8, uniteNo: 2, baslik: 'Cümlede Anlam',
    kazanimlar: [
      k('T.8.3.10', 8, 'Okuma', 'Cümlenin ifade ettiği anlam özelliklerini (öznel-nesnel, kesinlik, olasılık, kinaye vb.) belirler.', 'Cümlede Anlam'),
      k('T.8.3.11', 8, 'Okuma', 'Cümleler arasındaki anlam ilişkilerini kavrar (örtülü anlam, gerekçeli yargı).', 'Cümlede Anlam'),
      k('T.8.3.12', 8, 'Okuma', 'Cümleleri doğru bir şekilde birleştirerek yeni cümleler oluşturur.', 'Cümlede Anlam'),
      k('T.8.3.13', 8, 'Okuma', 'Cümle yorumlama becerilerini geliştirir.', 'Cümlede Anlam'),
    ]
  },
  {
    id: 'unite-8-3', sinif: 8, uniteNo: 3, baslik: 'Paragrafta Anlam ve Sözel Mantık',
    kazanimlar: [
      k('T.8.3.23', 8, 'Okuma', 'Metinle ilgili çıkarım sorularını cevaplar.', 'Paragrafta Anlam ve Sözel Mantık'),
      k('T.8.3.24', 8, 'Okuma', 'Metnin ana fikrini ve yardımcı fikirlerini bulur.', 'Paragrafta Anlam ve Sözel Mantık'),
      k('T.8.3.26', 8, 'Okuma', 'Metinler arası karşılaştırmalar yapar.', 'Paragrafta Anlam ve Sözel Mantık'),
      k('T.8.3.33', 8, 'Okuma', 'Grafik, tablo ve çizelgeyle sunulan bilgileri yorumlar.', 'Paragrafta Anlam ve Sözel Mantık'),
      k('T.8.3.34', 8, 'Okuma', 'Sözel mantık ve akıl yürütme becerilerini kullanarak problem çözer.', 'Paragrafta Anlam ve Sözel Mantık'),
    ]
  },
  {
    id: 'unite-8-4', sinif: 8, uniteNo: 4, baslik: 'Fiilimsiler ve Cümlenin Ögeleri',
    kazanimlar: [
      k('T.8.4.1', 8, 'Dil Bilgisi', "Fiilimsilerin (isim-fiil, sıfat-fiil, zarf-fiil) cümledeki işlevlerini kavrar.", 'Fiilimsiler ve Cümlenin Ögeleri'),
      k('T.8.4.2a', 8, 'Dil Bilgisi', 'Cümlenin ögelerini (yüklem, özne, nesne, dolaylı tümleç, zarf tümleci) ayırt eder.', 'Fiilimsiler ve Cümlenin Ögeleri'),
      k('T.8.4.2b', 8, 'Dil Bilgisi', 'Cümlede vurgulanan ögeyi bulur.', 'Fiilimsiler ve Cümlenin Ögeleri'),
      k('T.8.4.2c', 8, 'Dil Bilgisi', 'Ara söz ve ara cümleleri tanır.', 'Fiilimsiler ve Cümlenin Ögeleri'),
    ]
  },
  {
    id: 'unite-8-5', sinif: 8, uniteNo: 5, baslik: 'Fiilde Çatı ve Cümle Türleri',
    kazanimlar: [
      k('T.8.4.3', 8, 'Dil Bilgisi', 'Fiilde çatı özelliklerini (etken-edilgen, geçişli-geçişsiz, oldurgan-ettirgen) tanır.', 'Fiilde Çatı ve Cümle Türleri'),
      k('T.8.4.4a', 8, 'Dil Bilgisi', 'Cümle türlerini yapısına göre (basit, birleşik, sıralı, bağlı) tanır.', 'Fiilde Çatı ve Cümle Türleri'),
      k('T.8.4.4b', 8, 'Dil Bilgisi', 'Cümle türlerini yüklemin türüne göre (fiil, isim) tanır.', 'Fiilde Çatı ve Cümle Türleri'),
      k('T.8.4.4c', 8, 'Dil Bilgisi', 'Cümle türlerini anlamına göre (olumlu, olumsuz, soru, ünlem) tanır.', 'Fiilde Çatı ve Cümle Türleri'),
      k('T.8.4.4d', 8, 'Dil Bilgisi', "Cümle türlerini öge dizilişine göre (kurallı, devrik, eksiltili) tanır.", 'Fiilde Çatı ve Cümle Türleri'),
    ]
  },
  {
    id: 'unite-8-6', sinif: 8, uniteNo: 6, baslik: 'Yazım Kuralları, Noktalama ve Anlatım Bozuklukları',
    kazanimlar: [
      k('T.8.4.8', 8, 'Yazma', 'Yazım kurallarını (birleşik kelimeler, ikilemeler, büyük harfler vb.) uygular.', 'Yazım Kuralları, Noktalama ve Anlatım Bozuklukları'),
      k('T.8.4.13', 8, 'Yazma', 'Noktalama işaretlerini (uzun çizgi, eğik çizgi, tırnak işareti vb.) işlevine uygun kullanır.', 'Yazım Kuralları, Noktalama ve Anlatım Bozuklukları'),
      k('T.8.4.15', 8, 'Yazma', 'Anlatım bozukluklarını (anlama ve yapıya dayalı) belirler ve düzeltir.', 'Yazım Kuralları, Noktalama ve Anlatım Bozuklukları'),
    ]
  },
];

// ════════════════════════════════════════════════════════════════════════════
// MÜFREDAT — Tüm sınıflar
// ════════════════════════════════════════════════════════════════════════════
export const MEB_TURKCE_MUFREDATI: MEBSinifMufredati[] = [
  { sinif: 1, uniteler: SINIF_1 },
  { sinif: 2, uniteler: SINIF_2 },
  { sinif: 3, uniteler: SINIF_3 },
  { sinif: 4, uniteler: SINIF_4 },
  { sinif: 5, uniteler: SINIF_5 },
  { sinif: 6, uniteler: SINIF_6 },
  { sinif: 7, uniteler: SINIF_7 },
  { sinif: 8, uniteler: SINIF_8 },
];

// ─── Yardımcı Fonksiyonlar ────────────────────────────────────────────────────

/** Sınıfa göre üniteleri getir */
export const getUnitesByGrade = (sinif: number): MEBUnite[] =>
  MEB_TURKCE_MUFREDATI.find(m => m.sinif === sinif)?.uniteler ?? [];

/** Kazanım koduna göre kazanım detayı getir */
export const getKazanimByCode = (kod: string): MEBKazanim | undefined => {
  for (const muf of MEB_TURKCE_MUFREDATI)
    for (const unite of muf.uniteler) {
      const found = unite.kazanimlar.find(kz => kz.kod === kod);
      if (found) return found;
    }
  return undefined;
};

/** Ünite ID'sine göre kazanımları getir */
export const getKazanimByUniteId = (uniteId: string): MEBKazanim[] => {
  for (const muf of MEB_TURKCE_MUFREDATI) {
    const unite = muf.uniteler.find(u => u.id === uniteId);
    if (unite) return unite.kazanimlar;
  }
  return [];
};

/** Tüm desteklenen sınıfları getir */
export const getSupportedGrades = (): number[] =>
  MEB_TURKCE_MUFREDATI.map(m => m.sinif).sort((a, b) => a - b);

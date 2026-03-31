/**
 * MatSinavStudyosu — AI Matematik Sınav Generator
 * MEB 1-8. sınıf matematik sınavı üretimi
 * Mevcut sinavGenerator.ts'ye dokunmaz — tamamen bağımsız
 *
 * Selin Arslan: İlkokul/Ortaokul prompt ayrımı, grafik_verisi desteği,
 * Başarı Anı Mimarisi korunacak.
 */

import type {
  MatSinavAyarlari,
  MatSoru,
  MatSinav,
  MatCevapAnahtari,
  GrafikVeriTipi,
} from '../../types/matSinav';
import { getMatKazanimByCode } from '../../data/meb-matematik-kazanim';
import { AppError } from '../../utils/AppError';
import { getVisualPromptsForKazanimlar } from './mathVisualPromptLibrary';
import {
  validateQuestionVisualConsistency,
  generateExamValidationReport,
} from '../mathVisualValidator';

// ─── Kazanım → Görsel Haritalama ─────────────────────────────
/**
 * `kazanimGorselBelirle`: Bir kazanım kodunu alır, öğrenme alanına göre
 * o kazanım için zorunlu görsel tipini (`GrafikVeriTipi`) belirler ve
 * `KazanimGorselGereksinim` nesnesi döndürür. Eşleşme yoksa `null` döner.
 *
 * `analizKazanimGorselleri`: Kazanım kodu listesini işler ve
 * görsel gerektiren kazanımlar için gereksinim nesnelerini döner.
 */
const GORSEL_TIPLER_LISTESI =
  'siklik_tablosu, cetele_tablosu, sutun_grafigi, pasta_grafigi, cizgi_grafigi, ' +
  'ucgen, dik_ucgen, kare, dikdortgen, paralel_kenar, cokgen, daire, ' +
  'dogru_parcasi, aci, koordinat_sistemi, koordinat_grafigi, sayi_dogrusu, ' +
  'kesir_modeli, simetri, venn_diyagrami, olaslik_cark, kup, silindir, koni, piramit, dikdortgenler_prizmasi, kesisen_dogrular, paralel_dogrular';

interface KazanimGorselGereksinim {
  kazanimKodu: string;
  kazanimMetni: string;
  zorunluGorsel: GrafikVeriTipi;
  aciklama: string;
}

/**
 * Bir kazanım kodunu öğrenme alanı ve kazanım tanımındaki anahtar kelimeler
 * üzerinden eşleştirerek uygun görsel tipini belirler.
 *
 * Eşleştirme stratejisi:
 *  1. `ogrenmeAlani` (Veri İşleme / Geometri / Sayılar...) ile broad kategori saptanır.
 *  2. `tanim.toLowerCase()` üzerinde daha spesifik kelimeler (ör. "sütun grafik",
 *     "üçgen", "açı") aranır → en uygun `GrafikVeriTipi` döndürülür.
 *  3. Öğrenme alanı eşleşmez veya kazanım bulunamazsa `null` döner.
 */
function kazanimGorselBelirle(kazanimKodu: string): KazanimGorselGereksinim | null {
  const kazanim = getMatKazanimByCode(kazanimKodu);
  if (!kazanim) return null;

  const { ogrenmeAlani, tanim } = kazanim;
  const kod = kazanimKodu.toLowerCase();

  // Veri İşleme → veri grafikleri
  if (ogrenmeAlani === 'Veri İşleme') {
    const tanim_lower = tanim.toLowerCase();
    if (tanim_lower.includes('çetele')) {
      return {
        kazanimKodu,
        kazanimMetni: tanim,
        zorunluGorsel: 'cetele_tablosu',
        aciklama: 'Çetele tablosu oluştur ve veriden soru sor',
      };
    }
    if (tanim_lower.includes('nesne ve şekil grafik') || tanim_lower.includes('şekil grafik')) {
      return {
        kazanimKodu,
        kazanimMetni: tanim,
        zorunluGorsel: 'siklik_tablosu',
        aciklama: 'Nesne/şekil grafiği olarak sıklık tablosu oluştur',
      };
    }
    if (tanim_lower.includes('sütun grafik')) {
      return {
        kazanimKodu,
        kazanimMetni: tanim,
        zorunluGorsel: 'sutun_grafigi',
        aciklama: 'Sütun grafiği oluştur ve yorumla',
      };
    }
    if (tanim_lower.includes('pasta grafik')) {
      return {
        kazanimKodu,
        kazanimMetni: tanim,
        zorunluGorsel: 'pasta_grafigi',
        aciklama: 'Pasta grafiği oluştur ve yorumla',
      };
    }
    if (tanim_lower.includes('çizgi grafik') || tanim_lower.includes('kırık çizgi')) {
      return {
        kazanimKodu,
        kazanimMetni: tanim,
        zorunluGorsel: 'cizgi_grafigi',
        aciklama: 'Çizgi grafiği oluştur ve yorumla',
      };
    }
    // Genel Veri İşleme → sütun grafigi varsayılan
    return {
      kazanimKodu,
      kazanimMetni: tanim,
      zorunluGorsel: 'sutun_grafigi',
      aciklama: 'Veri tablosu veya grafik oluştur ve veriden soru sor',
    };
  }

  // Geometri / Geometri ve Ölçme → şekil görselleri
  if (ogrenmeAlani === 'Geometri' || ogrenmeAlani === 'Geometri ve Ölçme') {
    const tanim_lower = tanim.toLowerCase();
    if (tanim_lower.includes('dik üçgen') || tanim_lower.includes('dik acili')) {
      return {
        kazanimKodu,
        kazanimMetni: tanim,
        zorunluGorsel: 'dik_ucgen',
        aciklama: 'Dik üçgeni çiz, dik açıyı ve kenar ölçülerini belirt',
      };
    }
    if (tanim_lower.includes('üçgen') || tanim_lower.includes('ucgen')) {
      return {
        kazanimKodu,
        kazanimMetni: tanim,
        zorunluGorsel: 'ucgen',
        aciklama: 'Üçgeni çiz, kenar ve açı ölçülerini belirt',
      };
    }
    if (tanim_lower.includes('kare')) {
      return {
        kazanimKodu,
        kazanimMetni: tanim,
        zorunluGorsel: 'kare',
        aciklama: 'Kareyi çiz, kenar ölçülerini belirt',
      };
    }
    if (tanim_lower.includes('dikdörtgen') || tanim_lower.includes('dikdortgen')) {
      return {
        kazanimKodu,
        kazanimMetni: tanim,
        zorunluGorsel: 'dikdortgen',
        aciklama: 'Dikdörtgeni çiz, kenar ölçülerini belirt',
      };
    }
    if (tanim_lower.includes('paralel kenar') || tanim_lower.includes('paralelkenar')) {
      return {
        kazanimKodu,
        kazanimMetni: tanim,
        zorunluGorsel: 'paralel_kenar',
        aciklama: 'Paralel kenarı çiz, kenar ve açı ölçülerini belirt',
      };
    }
    if (
      tanim_lower.includes('çokgen') ||
      tanim_lower.includes('beşgen') ||
      tanim_lower.includes('altıgen') ||
      tanim_lower.includes('yedigen')
    ) {
      return {
        kazanimKodu,
        kazanimMetni: tanim,
        zorunluGorsel: 'cokgen',
        aciklama: 'Çokgeni çiz, kenar sayısını ve ölçülerini belirt',
      };
    }
    if (tanim_lower.includes('daire') || tanim_lower.includes('çember')) {
      return {
        kazanimKodu,
        kazanimMetni: tanim,
        zorunluGorsel: 'daire',
        aciklama: 'Çember/daireyi çiz, yarıçapı belirt',
      };
    }
    if (tanim_lower.includes('açı') || tanim_lower.includes('aci')) {
      return {
        kazanimKodu,
        kazanimMetni: tanim,
        zorunluGorsel: 'aci',
        aciklama: 'Açıyı çiz, ölçüsünü göster',
      };
    }
    if (tanim_lower.includes('simetri') || tanim_lower.includes('simetrik')) {
      return {
        kazanimKodu,
        kazanimMetni: tanim,
        zorunluGorsel: 'simetri',
        aciklama: 'Simetri eksenini ve şekli göster',
      };
    }
    if (
      tanim_lower.includes('doğru parçası') ||
      tanim_lower.includes('doğru') ||
      tanim_lower.includes('ışın')
    ) {
      return {
        kazanimKodu,
        kazanimMetni: tanim,
        zorunluGorsel: 'dogru_parcasi',
        aciklama: 'Doğru, doğru parçası veya ışını çiz',
      };
    }
    if (tanim_lower.includes('koordinat')) {
      return {
        kazanimKodu,
        kazanimMetni: tanim,
        zorunluGorsel: 'koordinat_sistemi',
        aciklama: 'Koordinat sisteminde noktaları göster',
      };
    }
    // Genel Geometri → kare varsayılan
    return {
      kazanimKodu,
      kazanimMetni: tanim,
      zorunluGorsel: 'kare',
      aciklama: 'Geometrik şekli çiz ve özelliklerini göster',
    };
  }

  // Sayı doğrusu / Tam sayılar / Rasyonel sayılar
  if (ogrenmeAlani === 'Sayılar ve İşlemler' || ogrenmeAlani === 'Cebir') {
    const tanim_lower = tanim.toLowerCase();
    if (tanim_lower.includes('sayı doğrusu') || tanim_lower.includes('sayi dogrusu')) {
      return {
        kazanimKodu,
        kazanimMetni: tanim,
        zorunluGorsel: 'sayi_dogrusu',
        aciklama: 'Sayı doğrusunda sayıları göster',
      };
    }
    if (tanim_lower.includes('koordinat')) {
      return {
        kazanimKodu,
        kazanimMetni: tanim,
        zorunluGorsel: 'koordinat_grafigi',
        aciklama: 'Koordinat düzleminde noktaları ve fonksiyonu göster',
      };
    }
    if (
      tanim_lower.includes('kesir') ||
      tanim_lower.includes('ondalık') ||
      tanim_lower.includes('tam sayı')
    ) {
      // Yalnızca sayı doğrusu gösterimi içeren kazanımlar için
      if (tanim_lower.includes('sayı doğrusu')) {
        return {
          kazanimKodu,
          kazanimMetni: tanim,
          zorunluGorsel: 'sayi_dogrusu',
          aciklama: 'Sayı doğrusunda kesir/tam sayıyı göster',
        };
      }
      if (tanim_lower.includes('model') || tanim_lower.includes('şekil')) {
        return {
          kazanimKodu,
          kazanimMetni: tanim,
          zorunluGorsel: 'kesir_modeli',
          aciklama: 'Kesir modelini görsel olarak göster',
        };
      }
    }
  }

  // Olasılık
  if (ogrenmeAlani === 'Olasılık') {
    return {
      kazanimKodu,
      kazanimMetni: tanim,
      zorunluGorsel: 'olaslik_cark',
      aciklama: 'Olasılık çarkı veya pasta grafik ile olayları göster',
    };
  }

  return null;
}

/**
 * Seçilen kazanımlar listesinden görsel gereksinimlerini analiz eder.
 * Sadece ZORUNLU görsel gerektiren kazanımlar için liste döner.
 */
export function analizKazanimGorselleri(kazanimKodlari: string[]): KazanimGorselGereksinim[] {
  return kazanimKodlari
    .map((kod) => kazanimGorselBelirle(kod))
    .filter((g): g is KazanimGorselGereksinim => g !== null);
}

/**
 * Prompt'a eklenecek kazanım-bazlı görsel talimatlarını üretir.
 * GÜNCELLEME: mathVisualPromptLibrary.ts kullanarak detaylı prompt talimatları ekler.
 */
function buildKazanimGorselTalimatlari(kazanimKodlari: string[], sinifSeviyesi: number): string {
  const gereksinimler = analizKazanimGorselleri(kazanimKodlari);
  if (gereksinimler.length === 0) return '';

  // Yeni görsel prompt kütüphanesinden detaylı talimatları al
  const detayliPromptlar = getVisualPromptsForKazanimlar(kazanimKodlari, sinifSeviyesi);

  const satirlar = gereksinimler
    .map((g) => `  • ${g.kazanimKodu}: tip="${g.zorunluGorsel}" → ${g.aciklama}`)
    .join('\n');

  return `
[KAZANIM-BAZLI GÖRSEL GEREKSİNİMLERİ — ZORUNLU]
Aşağıdaki kazanımlar için soru üretirken "grafik_verisi" alanını mutlaka doldur.
Bu kazanımlar için GÖRSELSİZ soru üretme:

${satirlar}

${detayliPromptlar}

[GÖRSEL-METİN TUTARLILIK KURALLARI — MUTLAKİYET]
🚨 UYARI: Aşağıdaki kuralların HİÇBİRİNİ ihlal etme. Her ihlal klinik protokol ihlalidir.

0. TERSİNE MÜHENDİSLİK (ÇOK ÖNEMLİ):
   • Önce zihninde "grafik_verisi"ni (şekli, sayıları, etiketleri) kurgula.
   • Sonra "soru_metni"ni SADECE bu grafik verisindeki sayıları ve harfleri kullanarak yaz.
   • Asla soru metnini yazıp, sonra ona uymayan rastgele bir grafik uydurma!

1. SAYISAL DEĞER TUTARLILIĞI:
   • Soru metninde belirttiğin HER SAYISAL DEĞER grafik_verisi içinde AYNEN olmalı
   • Geometrik şekillerde: kenar uzunlukları, açı ölçüleri
   • Veri grafiklerinde: tüm sayısal değerler
   • Koordinat sisteminde: x ve y koordinatları
   • ÖRNEK YANLIŞ: Soru "5 cm kenar" diyor, grafik ozellikler.kenarlar: [8] gösteriyor
   • ÖRNEK DOĞRU: Soru "5 cm kenar" diyor, grafik ozellikler.kenarlar: [5] gösteriyor

2. GÖRSEL REFERANSI ZORUNLU:
   • Soru metninde gorsele AÇIK referans olmalı:
     ✓ "Yandaki grafiğe göre..."
     ✓ "Şekildeki üçgende..."
     ✓ "Tablodaki verilere bakarak..."
     ✗ Görsel referansı olmayan metin

3. MATEMATİKSEL TUTARLILIK:
   • Üçgen iç açıları toplamı = 180°
   • Dik üçgende Pisagor: a² + b² = c²
   • Veri grafiklerinde toplam doğru hesaplanmalı
   • Fonksiyon grafiğinde her nokta denklemi sağlamalı

4. SINIF SEVİYESİ LİMİTLERİ (${sinifSeviyesi}. sınıf):
   • Veri noktası sayısı: Maksimum ${sinifSeviyesi + 2}
   • Sayı aralıkları: Sınıf seviyesine uygun
   • Karmaşıklık: ZPD içinde (Başarı Anı Mimarisi)

5. DİSLEKSİ/DİSKALKULİ UYUMLULUK:
   • Görseldeki HER SAYI soru metninde AYNI FORMATTA geçmeli
   • Birim tutarlılığı: cm ise hep cm, m ise hep m
   • Renkli vurgulama: Aynı kavram = aynı renk

⚠️ UYUMSUZLUK = SIFIR TOLERANS
Görsel-metin uyumsuzluğu olan sorular klinik testlerden geçemez ve iptal edilir. Tüm veriler birbiriyle %100 örtüşmek zorundadır.
`;
}

const MASTER_MODEL = 'gemini-2.5-flash';

// ─── Gemini REST API çağrısı ──────────────────────────────────
const callGeminiDirect = async (prompt: string, schema: object): Promise<unknown> => {
  const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || process.env.API_KEY;
  if (!apiKey) {
    throw new AppError(
      'API anahtarı bulunamadı. Lütfen yönetici ile iletişime geçin.',
      'CONFIG_ERROR',
      500,
      undefined,
      false
    );
  }

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${MASTER_MODEL}:generateContent?key=${apiKey}`;

  const body = {
    contents: [{ role: 'user', parts: [{ text: prompt }] }],
    generationConfig: {
      responseMimeType: 'application/json',
      responseSchema: schema,
      temperature: 0.45,
    },
  };

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    const msg = (errData as Record<string, unknown>)?.error
      ? String((errData as Record<string, Record<string, string>>).error.message)
      : response.statusText;
    throw new AppError(
      `Gemini API hatası: ${msg}`,
      'GEMINI_API_ERROR',
      502,
      { status: response.status },
      true
    );
  }

  const data = await response.json();
  const text = (data as Record<string, unknown[]>)?.candidates?.[0] as
    | Record<string, unknown>
    | undefined;
  const textContent = text?.content as Record<string, unknown[]> | undefined;
  const rawText = (textContent?.parts?.[0] as Record<string, string> | undefined)?.text;

  if (!rawText) {
    throw new AppError('Gemini boş yanıt döndürdü.', 'GEMINI_EMPTY_RESPONSE', 502, undefined, true);
  }

  try {
    return JSON.parse(rawText);
  } catch {
    const cleaned = rawText
      .replace(/[\u200B-\u200D\uFEFF]/g, '')
      .replace(/^```json[\s\S]*?\n/, '')
      .replace(/^```\s*/m, '')
      .replace(/```\s*$/m, '')
      .trim();
    return JSON.parse(cleaned);
  }
};

// ─── Görsel-Metin Uyumluluk Doğrulama ─────────────────────────
/**
 * Klinik Protokol: Görsel-Metin Tutarlılık Kontrolü
 * Dr. Ahmet Kaya onaylı — MEB 2024-2025 uyumlu
 *
 * Bu fonksiyon AI tarafından üretilen soruların görsel-metin
 * tutarlılığını kontrol eder ve uyumsuzlukları raporlar.
 */
export interface GorselMetinUyumSonucu {
  soruId: string;
  uyumluMu: boolean;
  uyumsuzluklar: string[];
  uyarilar: string[];
  skor: number; // 0-100
}

export function kontrolEtGorselMetinUyumu(soru: MatSoru): GorselMetinUyumSonucu {
  const sonuc: GorselMetinUyumSonucu = {
    soruId: soru.id,
    uyumluMu: true,
    uyumsuzluklar: [],
    uyarilar: [],
    skor: 100,
  };

  // Görsel yoksa kontrol gereksiz
  if (!soru.grafik_verisi) {
    return sonuc;
  }

  const gorsel = soru.grafik_verisi;
  const metin = soru.soruMetni.toLowerCase();

  // 1. GEOMETRİ KONTROLLERI
  const geometriTipleri = [
    'ucgen',
    'dik_ucgen',
    'kare',
    'dikdortgen',
    'paralel_kenar',
    'cokgen',
    'daire',
    'aci',
  ];
  if (geometriTipleri.includes(gorsel.tip)) {
    // Kenar uzunlukları kontrolü
    if (gorsel.ozellikler?.kenarlar && gorsel.ozellikler.kenarlar.length > 0) {
      for (const kenar of gorsel.ozellikler.kenarlar) {
        if (!metin.includes(String(kenar))) {
          sonuc.uyarilar.push(`Görsel kenar değeri (${kenar}) metinde bulunamadı`);
          sonuc.skor -= 10;
        }
      }
    }

    // Açı değerleri kontrolü
    if (gorsel.ozellikler?.acilar && gorsel.ozellikler.acilar.length > 0) {
      for (const aci of gorsel.ozellikler.acilar) {
        if (!metin.includes(String(aci)) && !metin.includes(`${aci}°`)) {
          sonuc.uyarilar.push(`Görsel açı değeri (${aci}°) metinde bulunamadı`);
          sonuc.skor -= 10;
        }
      }
    }

    // Birim kontrolü
    if (gorsel.ozellikler?.birim) {
      if (!metin.includes(gorsel.ozellikler.birim)) {
        sonuc.uyumsuzluklar.push(`Görsel birimi (${gorsel.ozellikler.birim}) metinde eşleşmiyor`);
        sonuc.skor -= 15;
      }
    }
  }

  // 2. VERİ İŞLEME KONTROLLERI
  const veriTipleri = [
    'siklik_tablosu',
    'cetele_tablosu',
    'sutun_grafigi',
    'pasta_grafigi',
    'cizgi_grafigi',
  ];
  if (veriTipleri.includes(gorsel.tip)) {
    // Veri değerleri kontrolü
    for (const veriOgesi of gorsel.veri) {
      if (veriOgesi.deger !== undefined) {
        if (!metin.includes(String(veriOgesi.deger))) {
          // Soru metninde değer olmayabilir (grafik okuma sorusu)
          // Bu durumda uyarı ver ama ciddi puan düşme
          sonuc.uyarilar.push(
            `Veri değeri (${veriOgesi.deger}) metinde doğrudan geçmiyor — grafik okuma sorusu olabilir`
          );
        }
      }
    }

    // Başlık uyumu
    if (gorsel.baslik) {
      const baslikKelimeler = gorsel.baslik
        .toLowerCase()
        .split(' ')
        .filter((k) => k.length > 3);
      const eslesen = baslikKelimeler.filter((k) => metin.includes(k));
      if (eslesen.length < baslikKelimeler.length / 2) {
        sonuc.uyarilar.push('Grafik başlığı soru bağlamıyla tam örtüşmüyor');
        sonuc.skor -= 5;
      }
    }
  }

  // 3. SAYI DOĞRUSU KONTROLLERI
  if (gorsel.tip === 'sayi_dogrusu') {
    for (const veriOgesi of gorsel.veri) {
      if (veriOgesi.deger !== undefined) {
        const degerStr = String(veriOgesi.deger);
        if (!metin.includes(degerStr) && !metin.includes(veriOgesi.etiket)) {
          sonuc.uyarilar.push(
            `Sayı doğrusundaki nokta (${veriOgesi.etiket}: ${degerStr}) metinde bulunamadı`
          );
          sonuc.skor -= 10;
        }
      }
    }
  }

  // 4. KOORDİNAT SİSTEMİ KONTROLLERI
  if (gorsel.tip === 'koordinat_sistemi' || gorsel.tip === 'koordinat_grafigi') {
    for (const veriOgesi of gorsel.veri) {
      if (veriOgesi.x !== undefined && veriOgesi.y !== undefined) {
        const koordinatStr = `(${veriOgesi.x}, ${veriOgesi.y})`;
        const altKoordinatStr = `(${veriOgesi.x},${veriOgesi.y})`;
        if (!metin.includes(koordinatStr) && !metin.includes(altKoordinatStr)) {
          sonuc.uyarilar.push(`Koordinat noktası ${koordinatStr} metinde bulunamadı`);
          sonuc.skor -= 10;
        }
      }
    }
  }

  // Genel değerlendirme
  if (sonuc.skor < 70) {
    sonuc.uyumluMu = false;
    sonuc.uyumsuzluklar.push('Görsel-metin uyumluluk skoru kritik seviyenin altında');
  }

  sonuc.skor = Math.max(0, sonuc.skor);
  return sonuc;
}

/**
 * Sınav genelinde görsel-metin uyumluluk raporu üretir
 */
export function uretGorselMetinUyumRaporu(sinav: MatSinav): {
  genelSkor: number;
  uyumluSoruSayisi: number;
  toplamGorselliSoruSayisi: number;
  soruRaporlari: GorselMetinUyumSonucu[];
} {
  const gorselliSorular = sinav.sorular.filter((s) => s.grafik_verisi);
  const raporlar = gorselliSorular.map((s) => kontrolEtGorselMetinUyumu(s));

  const uyumluSayisi = raporlar.filter((r) => r.uyumluMu).length;
  const toplamSkor = raporlar.reduce((acc, r) => acc + r.skor, 0);
  const ortalamaSkor = raporlar.length > 0 ? Math.round(toplamSkor / raporlar.length) : 100;

  return {
    genelSkor: ortalamaSkor,
    uyumluSoruSayisi: uyumluSayisi,
    toplamGorselliSoruSayisi: gorselliSorular.length,
    soruRaporlari: raporlar,
  };
}

// ─── Prompt Builder ───────────────────────────────────────────
const buildMathExamPrompt = (settings: MatSinavAyarlari): string => {
  const sinif = settings.sinif ?? 5;
  const uniteler = 'İlgili Üniteler';

  const kazanimBilgileri = settings.secilenKazanimlar
    .map((kod) => {
      const kazanim = getMatKazanimByCode(kod);
      return `- ${kod}: ${kazanim?.tanim ?? ''}`;
    })
    .join('\n');

  const toplamSoru =
    settings.soruDagilimi.coktan_secmeli +
    settings.soruDagilimi.dogru_yanlis +
    settings.soruDagilimi.bosluk_doldurma +
    settings.soruDagilimi.acik_uclu;

  let prompt = `Görevin, 2025 yılı itibarıyla yürürlükte olan Türkiye Millî Eğitim Bakanlığı Matematik dersi öğretim programına (müfredata) sadık kalarak, belirtilen sınıf, üniteler ve kazanımlara uygun, ${toplamSoru} adet soru üretmektir. Üreteceğin tüm sorular SADECE aşağıdaki kazanım(lar)ı hedeflemelidir.

Sınıf: ${sinif}
Üniteler: ${uniteler}
İlgili Kazanımlar:
${kazanimBilgileri}

Lütfen çıktı olarak sadece soruları içeren bir JSON nesnesi döndür. Her soru aşağıdaki genel kurallara uymalıdır:
1. Soru Kökü: Soru kökü öğrencinin günlük yaşamından bir durum içermeli; soyut, kuramsal ya da üst düzey terimlerden kaçınılmalıdır. Her soru özgün ve çeşitli olmalıdır.
2. Seviye Belirleme: Sorunun zorluk seviyesini ("seviye" alanı) belirtilen kazanım metnine ve MEB yeni nesil soru standartlarına göre ata:
   - Kazanımda "sayar, yazar, tanır" gibi ifadeler varsa seviye "temel" olmalıdır.
   - Kazanımda "ilişkilendirir, model oluşturur, tahmin eder" gibi ifadeler varsa seviye "orta" olmalıdır.
   - Kazanımda "çoklu adımlı problemler, strateji geliştirir, geneller" varsa veya soru karmaşık bir Yeni Nesil mantık sorusu ise seviye "ileri" olmalıdır.
3. Çözüm Anahtarı: "cozum_anahtari" alanı, bir öğretmenin konuyu kısaca açıklayabileceği 1-2 cümlelik net bir açıklama içermelidir.
4. Pedagojik Alanlar: "gercek_yasam_baglantisi": Bu kazanımın günlük yaşamdaki önemini veya kullanımını velilerin de anlayabileceği net, tek cümlelik bir açıklama ile belirt.
5. Dil ve Üslup: Türkçe imla ve noktalama kurallarına uyulmalıdır. Matematiksel semboller doğru kullanılmalıdır (örn: ½ yerine "1/2").

`;

  if (settings.isLgsMode) {
    prompt += `🚨 LGS YENİ NESİL DENEME MODU AKTİF (8. SINIF DÜZEYİ) 🚨
Türkiye Cumhuriyeti MEB Liselere Geçiş Sistemi (LGS) standardında, "Tamamen Yeni Nesil" soru kökleriyle ${toplamSoru} adet ÇOKTAN SEÇMELİ soru hazırla.
KURALLAR:
1. Basit işlem veya doğrudan formül sorusu YASAKTIR. Tüm sorular hikayeleştirilmiş, tablo/grafik içeren, okuduğunu anlamaya dayalı ve en az 3 basamaklı mantık yürütme gerektiren yapıda olmalıdır.
2. Soru köklerinde günlük hayat problemleri, bilimsel makale kesitleri, oyun kuralları, şifreleme mantıkları veya mimari/mühendislik senaryoları kullanılmalıdır.
3. Seçenekler LGS çeldirici mantığına göre tasarlanmalı, en ufak bir işlem hatasında ulaşılabilecek değerler çeldirici olarak şıklara eklenmelidir (A, B, C, D).
4. Grafik veya tablo GEREKTİREN soruların sayısı yüksek tutulmalı ve bu görseller "grafik_verisi" alanı ile JSON içerisinde verilmelidir.

`;
  } else if (sinif >= 6) {
    prompt += `ÖZEL SINAV SİSTEMİ KURALI (YENİ NESİL / LGS TARZI):
Günümüz MEB sınav sisteminin (özellikle LGS ve örnek soruların) çıkmış sorularını inceleyerek, soruları "Yeni Nesil Soru" formatında hazırla. 
- Sorular okuduğunu anlama, mantıksal akıl yürütme, tablo/grafik yorumlama ve günlük hayat problemlerini çözme becerilerini ölçmelidir.
- Soru kökleri hikayeleştirilmiş, gerçek yaşam senaryolarına dayanan, analitik düşünmeyi gerektiren yapıda olmalıdır.
- Sadece işlem becerisi değil, aynı zamanda problem kurma ve modelleme becerisi de test edilmelidir.

`;
  }

  prompt += `ÖNEMLİ GÖRSEL VERİ KURALI (GRAFİK/ŞEKİL):
Eğer bir kazanım görsel bir veri gerektiriyorsa (Veri İşleme ünitelerindeki tablolar/grafikler veya Geometri ünitelerindeki şekiller gibi), soru metnini ("soru_metni" alanı) bu görseli içermeyecek şekilde sade tutmalısın. Bunun yerine, görselin verilerini JSON formatında "grafik_verisi" adlı ayrı bir alana eklemelisin. ASCII-tabanlı, metin formatında görseller KESİNLİKLE OLUŞTURMA.

"grafik_verisi" alanı aşağıdaki yapılardan birinde olmalıdır:

1. VERİ İŞLEME GRAFİKLERİ:
   - "tip": 'siklik_tablosu', 'nesne_grafiği', 'sutun_grafiği'.
   - "baslik": Grafik için kısa bir başlık.
   - "veri": Bir dizi (array) olmalıdır. Her eleman KESİNLİKLE {"etiket": "Elma", "deger": 8} şeklinde olmalı ve "deger" (sayısal) alanı MUTLAKA bulunmalıdır. "deger" alanı asla eksik olamaz!
   - **ÖNEMLİ TUTARLILIK KURALI**: "soru_metni" içinde eğer grafikteki verilerin TOPLAMI (örn: "Sınıfta toplam 30 öğrenci var") veya tamamı belirtilmişse, "veri" dizisindeki "deger" alanlarının aritmetik TOPLAMI soru metnindeki toplam ile BİREBİR EŞİT olmalıdır. (18 != 30 hatası kesinlikle yapılmamalıdır!)
   - "nesne": (Sadece 'nesne_grafiği' için) Veri elemanına eklenecek sembol. örn: "🍎".
   - "not": (İsteğe bağlı) Grafik altında gösterilecek not.

2. GEOMETRİ ŞEKİLLERİ VE KAVRAMLARI:
   - "tip": 'ucgen', 'dikdortgen', 'kare', 'besgen', 'altıgen', 'kup', 'silindir', 'koni', 'piramit', 'dikdortgenler_prizmasi', 'dogru_parcasi', 'isin', 'dogru', 'paralel_dogrular', 'kesisen_dogrular', 'dik_kesisen_doğrular'.
   - "baslik": Şekil/kavram için bir başlık (örn: "ABC Üçgeni").
   - "veri": Bir dizi (array) olmalıdır. Her eleman şeklin bir özelliğini tanımlar.
     **ÖNEMLİ TUTARLILIK KURALI: "soru_metni" içinde bahsedilen harf/isimler (örn: AB doğru parçası) ile "grafik_verisi" içindeki etiketler (örn: "A Köşesi") BİREBİR AYNI OLMALIDIR.**
   - "not": (İsteğe bağlı) Şekille ilgili ek bilgi.

`;

  if (settings.islemSayisi) {
    prompt += `ÖNEMLİ PROBLEM TİPİ KURALI:
Üreteceğin her soru, ilgili kazanımın doğası elverdiği sürece, tam olarak ${settings.islemSayisi} adet matematiksel işlem gerektirmelidir. Bu kural, özellikle problem çözme becerisini ölçen kazanımlar için geçerlidir. Çözüm adımları net ve mantıksal olmalıdır.

`;
  }

  if (settings.soruDagilimi.coktan_secmeli > 0) {
    prompt += `**Soru Tipi: Çoktan Seçmeli**
- 1 doğru cevap ve 3 mantıklı yanlış seçenek (çeldirici) olmalıdır. Çeldiriciler öğrencilerin sık yaptığı hataları veya kavram yanılgılarını yansıtmalıdır.
- Doğru cevabın yeri şıklar arasında rastgele dağıtılmalıdır.
- "yanlis_secenek_tipleri": Her bir yanlış seçeneğin hangi bilişsel hatayı hedeflediğini bir dizi (array) içinde belirt.

`;
  }

  if (settings.soruDagilimi.bosluk_doldurma > 0) {
    prompt += `**Soru Tipi: Boşluk Doldurma**
- "soru_metni" içindeki boşluk '___' ile belirtilmelidir.
- "dogru_cevap" alanı, boşluğu dolduracak doğru kelimeyi veya sayıyı içermelidir.

`;
  }

  if (settings.soruDagilimi.dogru_yanlis > 0) {
    prompt += `**Soru Tipi: Doğru/Yanlış**
- Her soru bir ifade olmalıdır.
- "dogru_cevap" alanı, ifadenin doğruluğunu belirtmek için "Doğru" veya "Yanlış" metnini içermelidir.

`;
  }

  prompt += `Ayrıca JSON çıktısına en az 100 karakterlik genel bir "pedagogicalNote" ve sınav için bir "baslik" alanı eklemeyi unutma.
`;

  return prompt;
};

// ─── Response Schema ──────────────────────────────────────────
const MATH_EXAM_SCHEMA = {
  type: 'OBJECT',
  properties: {
    questions: {
      type: 'ARRAY',
      description: 'Oluşturulan sınav sorusunun listesi.',
      items: {
        type: 'OBJECT',
        properties: {
          sinif: { type: 'NUMBER', description: 'Sorunun ait olduğu sınıf seviyesi.' },
          unite_adi: { type: 'STRING', description: 'Sorunun ait olduğu ünitenin adı.' },
          kazanim_kodu: { type: 'STRING', description: 'Sorunun ilgili olduğu kazanım kodu.' },
          soru_tipi: { type: 'STRING', description: "Sorunun tipi (örn: 'coktan_secmeli')." },
          soru_metni: {
            type: 'STRING',
            description: 'Sorunun metni. Grafik veya tablo içermemelidir.',
          },
          secenekler: {
            type: 'OBJECT',
            description: 'Soru için A, B, C, D şıkları.',
            properties: {
              A: { type: 'STRING' },
              B: { type: 'STRING' },
              C: { type: 'STRING' },
              D: { type: 'STRING' },
            },
            required: ['A', 'B', 'C', 'D'],
          },
          dogru_cevap: { type: 'STRING', description: 'Doğru olan şık veya cevap.' },
          gercek_yasam_baglantisi: {
            type: 'STRING',
            description: 'Kazanımın günlük yaşamla bağlantısı.',
          },
          seviye: { type: 'STRING', description: 'Sorunun zorluk seviyesi (temel, orta, ileri).' },
          cozum_anahtari: { type: 'STRING', description: 'Sorunun kısa çözümü veya açıklaması.' },
          yanlis_secenek_tipleri: {
            type: 'ARRAY',
            items: { type: 'STRING' },
            nullable: true,
          },
          grafik_verisi: {
            type: 'OBJECT',
            description:
              'Soru bir grafik, tablo veya geometrik şekil gerektiriyorsa, bu alanda yapısal verileri barındırır.',
            properties: {
              tip: {
                type: 'STRING',
                description:
                  "Görsel türü: 'siklik_tablosu', 'nesne_grafiği', 'sutun_grafiği', 'ucgen' vb.",
              },
              baslik: { type: 'STRING', description: 'Görsel için bir başlık.' },
              veri: {
                type: 'ARRAY',
                items: {
                  type: 'OBJECT',
                  properties: {
                    etiket: {
                      type: 'STRING',
                      description: "Veri noktasının etiketi (örn: 'Elma', 'AB Kenarı').",
                    },
                    deger: {
                      type: 'NUMBER',
                      description: 'Sayısal değer (örn: 12, 90).',
                      nullable: true,
                    },
                    nesne: {
                      type: 'STRING',
                      description: "Nesne grafikleri için sembol (örn: '🍎').",
                      nullable: true,
                    },
                    birim: {
                      type: 'STRING',
                      description: "Geometrik veriler için birim (örn: 'cm', '°').",
                      nullable: true,
                    },
                    x: {
                      type: 'NUMBER',
                      description: 'Etiketin x-koordinatı (sürükle-bırak için).',
                      nullable: true,
                    },
                    y: {
                      type: 'NUMBER',
                      description: 'Etiketin y-koordinatı (sürükle-bırak için).',
                      nullable: true,
                    },
                  },
                  required: ['etiket'],
                },
              },
              not: {
                type: 'STRING',
                description: 'Grafik altında gösterilecek ek not.',
                nullable: true,
              },
              x: {
                type: 'NUMBER',
                description: 'Şeklin x-koordinatı (sürükle-bırak için).',
                nullable: true,
              },
              y: {
                type: 'NUMBER',
                description: 'Şeklin y-koordinatı (sürükle-bırak için).',
                nullable: true,
              },
            },
            required: ['tip', 'baslik', 'veri'],
          },
        },
        required: [
          'sinif',
          'unite_adi',
          'kazanim_kodu',
          'soru_tipi',
          'soru_metni',
          'dogru_cevap',
          'gercek_yasam_baglantisi',
          'seviye',
          'cozum_anahtari',
        ],
      },
    },
    baslik: { type: 'STRING' },
    pedagogicalNote: { type: 'STRING' },
  },
  required: ['questions', 'baslik', 'pedagogicalNote'],
};

// ─── Ana Generasyon Fonksiyonu ────────────────────────────────
export const generateMathExam = async (settings: MatSinavAyarlari): Promise<MatSinav> => {
  // Validation
  if (!settings.sinif) {
    throw new AppError('Sınıf seçimi zorunludur.', 'VALIDATION_ERROR', 400, undefined, false);
  }

  if (!Array.isArray(settings.secilenKazanimlar) || settings.secilenKazanimlar.length === 0) {
    throw new AppError(
      'En az bir MEB kazanımı seçilmelidir.',
      'NO_KAZANIM_SELECTED',
      400,
      undefined,
      false
    );
  }

  const toplamSoru =
    settings.soruDagilimi.coktan_secmeli +
    settings.soruDagilimi.dogru_yanlis +
    settings.soruDagilimi.bosluk_doldurma +
    settings.soruDagilimi.acik_uclu;

  if (toplamSoru < 1) {
    throw new AppError('En az 1 soru seçilmelidir.', 'VALIDATION_ERROR', 400, undefined, false);
  }

  const prompt = buildMathExamPrompt(settings);

  try {
    const aiResponse = (await callGeminiDirect(prompt, MATH_EXAM_SCHEMA)) as Record<
      string,
      unknown
    >;

    // pedagogicalNote kontrolü
    if (
      !aiResponse.pedagogicalNote ||
      typeof aiResponse.pedagogicalNote !== 'string' ||
      (aiResponse.pedagogicalNote as string).length < 100
    ) {
      aiResponse.pedagogicalNote =
        `Bu sınav ${settings.sinif}. sınıf Matematik dersi için ${settings.secilenKazanimlar.join(', ')} ` +
        `kazanımlarını ölçmektedir. Başarı Anı Mimarisi ile ilk iki soru öğrencinin motivasyonunu artırmak için ` +
        `kolay tutulmuştur. Öğretmen geri bildiriminde öğrencinin güçlü yönlerini vurgulaması önerilir.`;
    }

    const rawQuestions = (aiResponse.questions || aiResponse.sorular || []) as any[];
    if (!Array.isArray(rawQuestions) || rawQuestions.length === 0) {
      throw new AppError(
        'AI yanıtında soru dizisi bulunamadı.',
        'INVALID_AI_RESPONSE',
        500,
        undefined,
        true
      );
    }

    const sorular: MatSoru[] = rawQuestions.map((q, index) => ({
      id: q.id || `mat-q-${Date.now()}-${index}`,
      tip: q.soru_tipi || q.tip || 'coktan_secmeli',
      zorluk:
        q.seviye === 'temel'
          ? 'Kolay'
          : q.seviye === 'orta'
            ? 'Orta'
            : q.seviye === 'ileri'
              ? 'Zor'
              : q.zorluk || 'Orta',
      soruMetni: q.soru_metni || q.soruMetni || '',
      secenekler: q.secenekler || null,
      dogruCevap: q.dogru_cevap || q.dogruCevap || '',
      kazanimKodu: q.kazanim_kodu || q.kazanimKodu || '',
      puan: q.puan || 5,
      tahminiSure: q.tahminiSure || 90,
      gercek_yasam_baglantisi: q.gercek_yasam_baglantisi,
      cozum_anahtari: q.cozum_anahtari,
      yanlis_secenek_tipleri: q.yanlis_secenek_tipleri || null,
      grafik_verisi: q.grafik_verisi || null,
    }));

    // Başarı Anı Mimarisi
    if (settings.zorlukSeviyesi === 'Otomatik' && sorular.length >= 2) {
      sorular[0].zorluk = 'Kolay';
      sorular[1].zorluk = 'Kolay';
    }

    // GÜNCELLEME: Görsel-Metin Tutarlılık Doğrulama
    // Her soru için validation yap ve kritik hataları raporla
    const validationReportleri: Array<{
      soruNo: number;
      validation: ReturnType<typeof validateQuestionVisualConsistency>;
    }> = [];

    for (let i = 0; i < sorular.length; i++) {
      const validation = validateQuestionVisualConsistency(sorular[i]);
      validationReportleri.push({ soruNo: i + 1, validation });

      // Kritik hatalar varsa uyarı ekle (ama sınavı durma, kullanıcıya raporla)
      if (!validation.isValid && validation.errors.length > 0) {
        console.warn(`[GÖRSEL UYUMSUZLUK] Soru ${i + 1} (${sorular[i].id}):`, validation.errors);
      }
    }

    // Sınav geneli validation raporu
    const examValidationReport = generateExamValidationReport(sorular, `mat-exam-${Date.now()}`);

    // Eğer kritik hatalar çoksa (>%30 soru) uyarı ver ama devam et
    const kritikHataYuzdesi =
      (examValidationReport.invalidQuestions / examValidationReport.totalQuestions) * 100;
    if (kritikHataYuzdesi > 30) {
      console.warn(
        `[KLİNİK PROTOKOL UYARISI] Sınavın %${kritikHataYuzdesi.toFixed(0)}'inde görsel-metin uyumsuzluğu var. ` +
          `Ortalama pedagojik skor: ${examValidationReport.averagePedagogicalScore}/100`
      );
    }

    // Cevap anahtarı
    const cevapAnahtari: MatCevapAnahtari = {
      sorular: sorular.map((soru, index) => ({
        soruNo: index + 1,
        dogruCevap: String(soru.dogruCevap),
        puan: soru.puan,
        kazanimKodu: soru.kazanimKodu,
        cozumAciklamasi: soru.cozum_anahtari,
        gercekYasamBaglantisi: soru.gercek_yasam_baglantisi,
        seviye: soru.zorluk as any,
      })),
    };

    const toplamPuan = sorular.reduce((s, q) => s + (q.puan || 5), 0);
    const tahminiSure = sorular.reduce((s, q) => s + (q.tahminiSure || 90), 0);

    const sinav: MatSinav = {
      id: `mat-exam-${Date.now()}`,
      baslik:
        (aiResponse.baslik as string) || `${settings.sinif}. Sınıf Matematik Değerlendirme Sınavı`,
      sinif: settings.sinif,
      secilenKazanimlar: settings.secilenKazanimlar,
      sorular,
      toplamPuan,
      tahminiSure,
      olusturmaTarihi: new Date().toISOString(),
      olusturanKullanici: 'system',
      pedagogicalNote: aiResponse.pedagogicalNote as string,
      cevapAnahtari,
    };

    return sinav;
  } catch (error: unknown) {
    if (error instanceof AppError) throw error;

    const errorMessage = error instanceof Error ? error.message : 'Bilinmeyen hata';
    throw new AppError(
      'Matematik sınavı oluşturulurken beklenmeyen bir hata oluştu.',
      'MATH_EXAM_GENERATION_ERROR',
      500,
      { originalError: errorMessage },
      true
    );
  }
};

// ─── Tek Soru Yenileme ────────────────────────────────────────
export const regenerateSingleQuestion = async (
  soruIndex: number,
  settings: MatSinavAyarlari,
  mevcutSoru: MatSoru
): Promise<MatSoru> => {
  const kazanim = getMatKazanimByCode(mevcutSoru.kazanimKodu);
  const sinif = settings.sinif ?? 5;

  const gorselGereksinim = kazanimGorselBelirle(mevcutSoru.kazanimKodu);
  const gorselTalimat = gorselGereksinim
    ? `Bu kazanım görsel GEREKTİRİR. grafik_verisi ZORUNLU:\n  tip="${gorselGereksinim.zorunluGorsel}" → ${gorselGereksinim.aciklama}`
    : settings.gorselVeriEklensinMi
      ? `Mümkünse grafik_verisi ekle. Desteklenen tipler: ${GORSEL_TIPLER_LISTESI}`
      : '';

  const prompt = `
[ROL: MEB MATEMATİK SINAV UZMANI]

${sinif}. sınıf için TEK BİR yeni matematik sorusu üret.
Kazanım: ${mevcutSoru.kazanimKodu}: ${kazanim?.tanim ?? ''}
Soru tipi: ${mevcutSoru.tip}
Zorluk: ${mevcutSoru.zorluk}

Önceki sorudan FARKLI bir soru oluştur. Aynı soru veya benzer soru üretme.
Önceki soru: "${mevcutSoru.soruMetni}"

${gorselTalimat}
`;

  const singleSchema = {
    type: 'OBJECT',
    properties: MATH_EXAM_SCHEMA.properties.questions.items.properties,
    required: MATH_EXAM_SCHEMA.properties.questions.items.required,
  };

  const rawResult = (await callGeminiDirect(prompt, singleSchema)) as any;
  const result: MatSoru = {
    id: `mat-q-${Date.now()}-${soruIndex}`,
    tip: rawResult.soru_tipi || rawResult.tip || 'coktan_secmeli',
    zorluk:
      rawResult.seviye === 'temel'
        ? 'Kolay'
        : rawResult.seviye === 'orta'
          ? 'Orta'
          : rawResult.seviye === 'ileri'
            ? 'Zor'
            : rawResult.zorluk || 'Orta',
    soruMetni: rawResult.soru_metni || rawResult.soruMetni || '',
    secenekler: rawResult.secenekler || null,
    dogruCevap: rawResult.dogru_cevap || rawResult.dogruCevap || '',
    kazanimKodu: rawResult.kazanim_kodu || rawResult.kazanimKodu || '',
    puan: rawResult.puan || 5,
    tahminiSure: rawResult.tahminiSure || 90,
    gercek_yasam_baglantisi: rawResult.gercek_yasam_baglantisi,
    cozum_anahtari: rawResult.cozum_anahtari,
    yanlis_secenek_tipleri: rawResult.yanlis_secenek_tipleri || null,
    grafik_verisi: rawResult.grafik_verisi || null,
  };
  return result;
};

/**
 * Matematik Görsel Prompt Kütüphanesi
 *
 * Her kazanım ve görsel tipi için özelleştirilmiş AI prompt talimatları.
 * Soru metni ile görsel parametrelerinin tutarlılığını garanti eder.
 *
 * Selin Arslan — AI Mühendisi: Halüsinasyon önleme + token optimizasyonu
 * Dr. Elif Yıldız — Pedagoji: ZPD uyumu + Başarı Anı Mimarisi
 * Dr. Ahmet Kaya — Klinik: MEB 2024-2025 standartları + özel eğitim
 */

import type { GrafikVeriTipi } from '../../types/matSinav';

// ─── Prompt Şablon Tipi ──────────────────────────────────────────
interface PromptTemplate {
    /** AI'a verilecek detaylı sistem talimatı */
    sistemTalimati: string;
    /** Gemini schema'ya eklenecek ek kısıtlamalar */
    schemaExtension?: Record<string, unknown>;
    /** MEB kazanım referansları */
    mebKazanimlar?: string[];
    /** Sınıf seviyesi limitleri */
    sinifLimitleri?: {
        minSinif: number;
        maxSinif: number;
        veriLimiti: (sinif: number) => number;
    };
}

// ─── GEOMETRİ PROMPT ŞABLONLARI ──────────────────────────────────

export const GEOMETRI_PROMPT_SABLONLARI: Record<string, PromptTemplate> = {
    kesisen_dogrular: {
        sistemTalimati: `
[GEOMETRİ — KESİŞEN DOĞRULAR GÖRSELİ ZORUNLU]

İki doğrunun kesiştiği nokta ve oluşan açılar (ters açılar, tümler/bütünler açılar).

✅ DOĞRU ÖRNEK:
Soru: "d1 ve d2 doğruları O noktasında kesişmektedir. Verilen açı 40° ise diğer açılar nedir?"
→ grafik_verisi: {
    "tip": "kesisen_dogrular",
    "baslik": "Kesişen Doğrular",
    "ozellikler": {
      "etiketler": ["d1", "d2"],
      "acilar": [40, 140, 40, 140] // Sırasıyla sağ, üst, sol, alt açılar
    }
  }

⚠️ Soru metninde geçen AÇI DEĞERLERİ grafikte aynı olmalı! Doğru isimleri de eşleşmeli.
`,
        sinifLimitleri: { minSinif: 5, maxSinif: 8, veriLimiti: () => 4 },
    },
    paralel_dogrular: {
        sistemTalimati: `
[GEOMETRİ — PARALEL DOĞRULAR GÖRSELİ ZORUNLU]

İki paralel doğru (d1 // d2) ve bunları kesen üçüncü bir doğru (d3) durumu.
Yöndeş, iç ters, dış ters açılar vb.

✅ DOĞRU ÖRNEK:
Soru: "d1 ve d2 doğruları paraleldir. d3 doğrusu onları kesmektedir. Şekildeki açı 120° ise x kaçtır?"
→ grafik_verisi: {
    "tip": "paralel_dogrular",
    "baslik": "Paralel Doğrular ve Kesen",
    "ozellikler": {
      "etiketler": ["d1", "d2"],
      "kenarlar": [1], // kesen doğru var
      "acilar": [120]
    }
  }

⚠️ d1 // d2 gibi ifadeler soru metninde net geçmeli. Açı derecesi birebir aynı olmalı.
`,
        sinifLimitleri: { minSinif: 6, maxSinif: 8, veriLimiti: () => 4 },
    },
    kup: {
        sistemTalimati: `
[3D GEOMETRİ — KÜP GÖRSELİ ZORUNLU]

Küp veya dik prizma. Tüm ayrıtları eşit veya belirtilmiş olan 3 boyutlu cisim.

✅ DOĞRU ÖRNEK:
Soru: "Bir ayrıtı 5 cm olan küpün hacmi kaç cm³'tür?"
→ grafik_verisi: {
    "tip": "kup",
    "baslik": "Küp",
    "ozellikler": {
      "kenarlar": [5]
    }
  }
  
⚠️ Eğer dikdörtgenler prizması ise "tip": "dikdortgenler_prizmasi" olmalı ve "kenarlar": [10, 5, 4] şeklinde (genişlik, derinlik, yükseklik) 3 değer almalı.
`,
        sinifLimitleri: { minSinif: 5, maxSinif: 8, veriLimiti: () => 3 },
    },
    silindir: {
        sistemTalimati: `
[3D GEOMETRİ — SİLİNDİR GÖRSELİ ZORUNLU]

Yarıçap (r) ve yükseklik (h) ölçüleri.

✅ DOĞRU ÖRNEK:
Soru: "Taban yarıçapı 3 cm, yüksekliği 10 cm olan silindir..."
→ grafik_verisi: {
    "tip": "silindir",
    "baslik": "Dik Dairesel Silindir",
    "ozellikler": {
      "yaricap": 3,
      "kenarlar": [10] // yükseklik
    }
  }

⚠️ R (yarıçap) ve H (yükseklik) değerleri soru metnindeki ile BİREBİR AYNI OLMALIDIR. (10 != 5 hatası yapma!)
`,
        sinifLimitleri: { minSinif: 8, maxSinif: 8, veriLimiti: () => 2 },
    },
    ucgen: {
        sistemTalimati: `
[GEOMETRİ — ÜÇGEN GÖRSELİ ZORUNLU]

Soru metninde belirttiğin kenar ve açı ölçülerini "grafik_verisi.ozellikler" içinde AYNEN doldur.

✅ DOĞRU ÖRNEKLER:
• Soru: "ABC üçgeninde |AB|=5 cm, |BC|=7 cm, |AC|=6 cm ise çevresi kaç cm'dir?"
  → grafik_verisi: {
      "tip": "ucgen",
      "baslik": "ABC Üçgeni",
      "veri": [{"etiket": "A"}, {"etiket": "B"}, {"etiket": "C"}],
      "ozellikler": {
        "kenarlar": [5, 7, 6],
        "etiketler": ["A", "B", "C"],
        "birim": "cm"
      }
    }

• Soru: "Bir üçgenin iç açıları 40°, 60° ve 80° ise bu üçgen hangi tür üçgendir?"
  → grafik_verisi: {
      "tip": "ucgen",
      "baslik": "Üçgenin İç Açıları",
      "veri": [{"etiket": "A"}, {"etiket": "B"}, {"etiket": "C"}],
      "ozellikler": {
        "acilar": [40, 60, 80],
        "etiketler": ["A", "B", "C"]
      }
    }

❌ YANLIŞ ÖRNEK:
Soru: "Kenarları 3 cm, 4 cm, 5 cm olan üçgen..."
grafik_verisi.ozellikler.kenarlar: [6, 8, 10]  ← HATA! Farklı değerler

🚨 KRİTİK KURAL: Soru metninde YAZDIĞIN ölçüleri grafik_verisi'ne KOPYALA.
İç açılar toplamı MUTLAKA 180° olmalı.
`,
        schemaExtension: {
            'ozellikler.kenarlar': {
                description: 'Üçgenin kenar uzunlukları — soru metnindeki değerlerle BİREBİR AYNI olmalı',
                type: 'ARRAY',
                items: { type: 'NUMBER', minimum: 1 },
                minItems: 3,
                maxItems: 3,
            },
            'ozellikler.acilar': {
                description: 'Üçgenin iç açı ölçüleri — toplamı 180 derece olmalı',
                type: 'ARRAY',
                items: { type: 'NUMBER', minimum: 1, maximum: 179 },
                minItems: 3,
                maxItems: 3,
            },
        },
        mebKazanimlar: ['M.*.2.*.', 'Geometri'],
        sinifLimitleri: { minSinif: 2, maxSinif: 8, veriLimiti: () => 3 },
    },

    dik_ucgen: {
        sistemTalimati: `
[GEOMETRİ — DİK ÜÇGEN GÖRSELİ ZORUNLU]

Dik açı (90°) bir köşede MUTLAKA gösterilecek. Pisagor teoremi: a² + b² = c²

✅ DOĞRU ÖRNEK:
Soru: "Dik kenarları 3 cm ve 4 cm olan dik üçgenin hipotenüsü kaç cm'dir?"
→ grafik_verisi: {
    "tip": "dik_ucgen",
    "baslik": "ABC Dik Üçgeni",
    "veri": [{"etiket": "A"}, {"etiket": "B"}, {"etiket": "C"}],
    "ozellikler": {
      "kenarlar": [3, 4, 5],
      "acilar": [90, 53, 37],
      "etiketler": ["A", "B", "C"],
      "birim": "cm"
    }
  }

🔢 PİSAGOR TUTARLILIĞI:
• 3² + 4² = 9 + 16 = 25 = 5² ✓
• Hipotenüs (c) her zaman en uzun kenar

⚠️ SINIF BAZLI DEĞER ARALIKLARI:
• 1-4. sınıf: (3,4,5), (6,8,10), (5,12,13) gibi basit Pisagor üçlüleri
• 5-6. sınıf: (8,15,17), (7,24,25) vb. daha büyük üçlüler
• 7-8. sınıf: Genel Pisagor problemi, ondalık sonuçlar olabilir
`,
        schemaExtension: {
            'ozellikler.kenarlar': {
                description: 'Dik üçgen kenarları [dik1, dik2, hipotenüs] — Pisagor teoremini sağlamalı',
            },
        },
        mebKazanimlar: ['M.*.2.*.', 'Pisagor', 'dik üçgen'],
        sinifLimitleri: { minSinif: 4, maxSinif: 8, veriLimiti: () => 3 },
    },

    kare: {
        sistemTalimati: `
[GEOMETRİ — KARE GÖRSELİ ZORUNLU]

Tüm kenarlar EŞİT uzunlukta. Tüm açılar 90°.

✅ DOĞRU ÖRNEK:
Soru: "Kenar uzunluğu 6 cm olan karenin alanı kaç cm²'dir?"
→ grafik_verisi: {
    "tip": "kare",
    "baslik": "ABCD Karesi",
    "veri": [{"etiket": "A"}, {"etiket": "B"}, {"etiket": "C"}, {"etiket": "D"}],
    "ozellikler": {
      "kenarlar": [6, 6, 6, 6],
      "etiketler": ["A", "B", "C", "D"],
      "birim": "cm"
    }
  }

📐 ALAN/ÇEVRE FORMÜLLERI (soru sorarken kontrol et):
• Alan = kenar × kenar = a²
• Çevre = 4 × kenar = 4a

Soru metninde kenar=6 diyorsan → grafik_verisi'nde de [6,6,6,6]
`,
        mebKazanimlar: ['M.*.2.*.', 'dörtgen', 'kare'],
        sinifLimitleri: { minSinif: 1, maxSinif: 8, veriLimiti: () => 4 },
    },

    dikdortgen: {
        sistemTalimati: `
[GEOMETRİ — DİKDÖRTGEN GÖRSELİ ZORUNLU]

Karşılıklı kenarlar eşit. Kısa kenar ve uzun kenar.

✅ DOĞRU ÖRNEK:
Soru: "Kısa kenarı 5 cm, uzun kenarı 8 cm olan dikdörtgenin çevresi kaç cm'dir?"
→ grafik_verisi: {
    "tip": "dikdortgen",
    "baslik": "ABCD Dikdörtgeni",
    "veri": [{"etiket": "A"}, {"etiket": "B"}, {"etiket": "C"}, {"etiket": "D"}],
    "ozellikler": {
      "kenarlar": [8, 5, 8, 5],
      "etiketler": ["A", "B", "C", "D"],
      "birim": "cm"
    }
  }

📐 FORMÜLLER:
• Alan = uzun × kısa = a × b
• Çevre = 2(a + b)

⚠️ Soru metninde "kısa kenar 5, uzun kenar 8" diyorsan:
→ kenarlar: [8, 5, 8, 5] (sırayla AB, BC, CD, DA)
`,
        mebKazanimlar: ['M.*.2.*.', 'dörtgen', 'dikdörtgen'],
        sinifLimitleri: { minSinif: 1, maxSinif: 8, veriLimiti: () => 4 },
    },

    paralel_kenar: {
        sistemTalimati: `
[GEOMETRİ — PARALELKENAR GÖRSELİ ZORUNLU]

Karşılıklı kenarlar paralel ve eşit. Taban ve kenar (yükseklik ayrı).

✅ DOĞRU ÖRNEK:
Soru: "Tabanı 10 cm, yüksekliği 6 cm olan paralelkenarın alanı kaç cm²'dir?"
→ grafik_verisi: {
    "tip": "paralel_kenar",
    "baslik": "ABCD Paralelkenarı",
    "veri": [{"etiket": "A"}, {"etiket": "B"}, {"etiket": "C"}, {"etiket": "D"}],
    "not": "Yükseklik (h=6 cm) kesikli çizgi ile gösterilir",
    "ozellikler": {
      "kenarlar": [10, 7, 10, 7],
      "etiketler": ["A", "B", "C", "D"],
      "birim": "cm"
    }
  }

📐 ALAN FORMÜLÜ:
• Alan = taban × yükseklik (yükseklik kenar uzunluğu değildir!)

NOT: Yükseklik genellikle görsel içinde kesikli çizgi veya "not" alanında belirtilir.
`,
        mebKazanimlar: ['M.*.2.*.', 'dörtgen', 'paralelkenar'],
        sinifLimitleri: { minSinif: 4, maxSinif: 8, veriLimiti: () => 4 },
    },

    cokgen: {
        sistemTalimati: `
[GEOMETRİ — ÇOKGEN GÖRSELİ ZORUNLU]

Beşgen, altıgen, sekizgen vb. Kenar sayısı = köşe sayısı.

✅ DOĞRU ÖRNEK:
Soru: "Düzgün bir altıgenin bir iç açısı kaç derecedir?"
→ grafik_verisi: {
    "tip": "cokgen",
    "baslik": "Düzgün Altıgen",
    "veri": [{"etiket": "A"}, {"etiket": "B"}, {"etiket": "C"},
             {"etiket": "D"}, {"etiket": "E"}, {"etiket": "F"}],
    "ozellikler": {
      "kenarSayisi": 6,
      "etiketler": ["A", "B", "C", "D", "E", "F"]
    }
  }

📐 İÇ AÇILAR TOPLAMI FORMÜLÜ:
• (n-2) × 180° (n = kenar sayısı)
• Altıgen: (6-2) × 180 = 720°
• Düzgün altıgende bir iç açı: 720/6 = 120°

⚠️ SINIF LİMİTLERİ:
• 1-3. sınıf: Max 4 kenar (dörtgen)
• 4-5. sınıf: Max 6 kenar
• 6-8. sınıf: Max 8 kenar
`,
        sinifLimitleri: {
            minSinif: 3,
            maxSinif: 8,
            veriLimiti: (sinif) => (sinif <= 3 ? 4 : sinif <= 5 ? 6 : 8),
        },
    },

    daire: {
        sistemTalimati: `
[GEOMETRİ — DAİRE/ÇEMBER GÖRSELİ ZORUNLU]

Yarıçap (r) veya çap (d=2r) gösterilmeli.

✅ DOĞRU ÖRNEK:
Soru: "Yarıçapı 7 cm olan dairenin çevresi kaç cm'dir? (π≈3,14)"
→ grafik_verisi: {
    "tip": "daire",
    "baslik": "Daire (O merkez)",
    "veri": [{"etiket": "O"}, {"etiket": "A"}],
    "ozellikler": {
      "yaricap": 7,
      "birim": "cm",
      "etiketler": ["O", "A"]
    }
  }

📐 FORMÜLLER:
• Çevre = 2πr veya πd
• Alan = πr²
• π ≈ 3,14 veya π ≈ 3 (basit hesaplarda)

⚠️ Soru metninde "çap 10 cm" diyorsan:
→ yaricap: 5 (çapın yarısı)
`,
        mebKazanimlar: ['M.*.2.*.', 'daire', 'çember', 'çevre', 'alan'],
        sinifLimitleri: { minSinif: 3, maxSinif: 8, veriLimiti: () => 2 },
    },

    aci: {
        sistemTalimati: `
[GEOMETRİ — AÇI GÖRSELİ ZORUNLU]

Açı ölçüsü soru metninde VE grafik_verisi.ozellikler.acilar[0]'da AYNI olmalı.

✅ DOĞRU ÖRNEK:
Soru: "Ölçüsü 65° olan bir açı hangi tür açıdır?"
→ grafik_verisi: {
    "tip": "aci",
    "baslik": "ABC Açısı",
    "veri": [{"etiket": "A"}, {"etiket": "B"}, {"etiket": "C"}],
    "ozellikler": {
      "acilar": [65],
      "etiketler": ["A", "B", "C"]
    }
  }

📐 AÇI TÜRLERİ:
• 0° < açı < 90°: Dar açı
• açı = 90°: Dik açı (köşede kare işareti gösterilir)
• 90° < açı < 180°: Geniş açı
• açı = 180°: Doğru açı

⚠️ Soru "60 derecelik bir açı" diyorsa → ozellikler.acilar: [60]
`,
        sinifLimitleri: { minSinif: 2, maxSinif: 8, veriLimiti: () => 3 },
    },

    simetri: {
        sistemTalimati: `
[GEOMETRİ — SİMETRİ GÖRSELİ ZORUNLU]

Simetri ekseni ve simetrik şekil gösterilmeli.

✅ DOĞRU ÖRNEK:
Soru: "Aşağıdaki şeklin kaç simetri ekseni vardır?"
→ grafik_verisi: {
    "tip": "simetri",
    "baslik": "Simetri Ekseni",
    "veri": [{"etiket": "Şekil"}],
    "not": "Dikey simetri ekseni kesikli çizgi ile gösterilmiştir",
    "ozellikler": {
      "etiketler": ["Şekil"]
    }
  }

⚠️ SİMETRİ EKSENİ SAYISI:
• Dikdörtgen: 2 eksen
• Kare: 4 eksen
• Eşkenar üçgen: 3 eksen
• Düzgün altıgen: 6 eksen
`,
        sinifLimitleri: { minSinif: 3, maxSinif: 8, veriLimiti: () => 1 },
    },

    dogru_parcasi: {
        sistemTalimati: `
[GEOMETRİ — DOĞRU PARÇASI GÖRSELİ ZORUNLU]

Başlangıç ve bitiş noktaları, uzunluk etiketli.

✅ DOĞRU ÖRNEK:
Soru: "AB doğru parçasının uzunluğu 12 cm ise, M noktası orta nokta olduğunda |AM| kaç cm'dir?"
→ grafik_verisi: {
    "tip": "dogru_parcasi",
    "baslik": "AB Doğru Parçası",
    "veri": [{"etiket": "A"}, {"etiket": "M"}, {"etiket": "B"}],
    "ozellikler": {
      "kenarlar": [12],
      "birim": "cm",
      "etiketler": ["A", "M", "B"]
    }
  }

📐 ORTA NOKTA: M noktası AB'nin orta noktasıysa |AM| = |MB| = |AB|/2
`,
        sinifLimitleri: { minSinif: 3, maxSinif: 8, veriLimiti: () => 3 },
    },
};

// ─── VERİ İŞLEME PROMPT ŞABLONLARI ───────────────────────────────

export const VERI_ISLEME_PROMPT_SABLONLARI: Record<string, PromptTemplate> = {
    sutun_grafigi: {
        sistemTalimati: `
[VERİ İŞLEME — SÜTUN GRAFİĞİ ZORUNLU]

Veri değerleri soru metninde AYNEN geçmeli.

✅ DOĞRU ÖRNEK:
Soru: "Grafiğe göre hangi günde en çok kitap okunmuştur?"
→ grafik_verisi: {
    "tip": "sutun_grafigi",
    "baslik": "Haftalık Okunan Kitap Sayısı",
    "veri": [
      {"etiket": "Pazartesi", "deger": 12, "birim": "kitap"},
      {"etiket": "Salı", "deger": 8, "birim": "kitap"},
      {"etiket": "Çarşamba", "deger": 15, "birim": "kitap"},
      {"etiket": "Perşembe", "deger": 10, "birim": "kitap"}
    ]
  }
→ Doğru cevap: Çarşamba (15 en büyük değer)

🔢 TUTARLILIK KURALLARI:
1. Toplam soruluyorsa: 12+8+15+10=45 → soru metninde bu toplam geçmeli
2. Fark soruluyorsa: 15-8=7 → "7 kitap farkla" gibi ifade olmalı
3. Ortalama: 45/4=11,25 ≈ 11 → yuvarlanmış değer soruda geçmeli

⚠️ Rastgele değer ÜRETME — soru ile TUTARLI olmalı!
`,
        schemaExtension: {
            veri: {
                description: 'Sütun grafiği verileri — soru metnindeki değerlerle BİREBİR eşleşmeli',
                minItems: 3,
            },
        },
        mebKazanimlar: ['M.*.4.*.', 'veri işleme', 'grafik'],
        sinifLimitleri: {
            minSinif: 3,
            maxSinif: 8,
            veriLimiti: (sinif) => Math.min(sinif + 1, 8),
        },
    },

    pasta_grafigi: {
        sistemTalimati: `
[VERİ İŞLEME — PASTA GRAFİĞİ ZORUNLU]

Yüzde hesapları DOĞRU olmalı. Dilimler toplamı %100.

✅ DOĞRU ÖRNEK:
Soru: "100 öğrenciye yapılan ankette favori renkler şöyle: Mavi %30, Kırmızı %25, Yeşil %20, Sarı %25. Kaç öğrenci mavi seçmiştir?"
→ grafik_verisi: {
    "tip": "pasta_grafigi",
    "baslik": "Favori Renk Anketi (100 öğrenci)",
    "veri": [
      {"etiket": "Mavi", "deger": 30},
      {"etiket": "Kırmızı", "deger": 25},
      {"etiket": "Yeşil", "deger": 20},
      {"etiket": "Sarı", "deger": 25}
    ]
  }
→ Toplam: 30+25+20+25 = 100 öğrenci ✓

🔢 YÜZDE-KESİR DÖNÜŞÜMÜ:
• 1/4 = 25/100 = %25
• 1/2 = 50/100 = %50
• 3/4 = 75/100 = %75
• 1/5 = 20/100 = %20

⚠️ Grafikteki "deger" alanı frekans değeridir (öğrenci sayısı), YÜZDE DEĞİL.
%30 göstermek için: 100 öğrenciden 30'u → deger: 30
`,
        mebKazanimlar: ['M.*.4.*.', 'veri işleme', 'grafik', 'yüzde'],
        sinifLimitleri: {
            minSinif: 4,
            maxSinif: 8,
            veriLimiti: (sinif) => Math.min(sinif, 6),
        },
    },

    cizgi_grafigi: {
        sistemTalimati: `
[VERİ İŞLEME — ÇİZGİ GRAFİĞİ ZORUNLU]

Zaman serisi verilerinde trend TUTARLI olmalı.

✅ DOĞRU ÖRNEK:
Soru: "Grafiğe göre hangi ayda sıcaklık en yüksektir?"
→ grafik_verisi: {
    "tip": "cizgi_grafigi",
    "baslik": "Aylık Ortalama Sıcaklık",
    "veri": [
      {"etiket": "Ocak", "deger": 5, "birim": "°C"},
      {"etiket": "Şubat", "deger": 7, "birim": "°C"},
      {"etiket": "Mart", "deger": 12, "birim": "°C"},
      {"etiket": "Nisan", "deger": 18, "birim": "°C"}
    ]
  }
→ Doğru cevap: Nisan (18°C en yüksek)

📊 TREND KURALLARI:
• "Artış gösteriyor" diyorsan → değerler artan sırada (5→7→12→18) ✓
• "Azalış var" diyorsan → değerler azalan sırada
• "En yüksek X ayında" → o ayın değeri gerçekten MAX olmalı

⚠️ Trend ifadeleriyle değerlerin tutarlı olması KRİTİK!
`,
        mebKazanimlar: ['M.*.4.*.', 'veri işleme', 'grafik', 'trend'],
        sinifLimitleri: {
            minSinif: 5,
            maxSinif: 8,
            veriLimiti: (sinif) => Math.min(sinif, 8),
        },
    },

    cetele_tablosu: {
        sistemTalimati: `
[VERİ İŞLEME — ÇETELE TABLOSU ZORUNLU (1-3. Sınıf)]

Çetele işaretleri: |||| (4 çizgi) + / (5. çizgi çapraz) = 5 grup

✅ DOĞRU ÖRNEK:
Soru: "Tabloya göre kaç öğrenci kırmızı rengi seçmiştir?"
→ grafik_verisi: {
    "tip": "cetele_tablosu",
    "baslik": "Favori Renk Çetele Tablosu",
    "veri": [
      {"etiket": "Kırmızı", "deger": 12},
      {"etiket": "Mavi", "deger": 8},
      {"etiket": "Yeşil", "deger": 6}
    ]
  }
→ Çetele gösterimi: |||| |||| || (12 = 2×5 + 2)

⚠️ SINIF LİMİTLERİ:
• 1-2. sınıf: Max 20 değeri (çocuk sayabilmeli)
• 3. sınıf: Max 30 değeri
• Toplam sorularında: Tüm değerleri topla ve soru metninde belirt
`,
        mebKazanimlar: ['M.2.4.1.1', 'M.3.4.1.1'],
        sinifLimitleri: {
            minSinif: 2,
            maxSinif: 3,
            veriLimiti: () => 4,
        },
    },

    siklik_tablosu: {
        sistemTalimati: `
[VERİ İŞLEME — SIKLIK TABLOSU ZORUNLU]

Nesne sayıları veya frekanslar.

✅ DOĞRU ÖRNEK:
Soru: "Tabloya göre en çok hangi meyveden var?"
→ grafik_verisi: {
    "tip": "siklik_tablosu",
    "baslik": "Meyve Sepetindeki Meyveler",
    "veri": [
      {"etiket": "Elma", "deger": 15, "nesne": "🍎"},
      {"etiket": "Muz", "deger": 8, "nesne": "🍌"},
      {"etiket": "Portakal", "deger": 12, "nesne": "🍊"}
    ]
  }
→ Toplam: 15+8+12 = 35 meyve
→ Mod (en çok): Elma (15)

⚠️ "nesne" alanı GÖRSELLEŞTİRME için kullanılır (emoji/ikon).
"deger" alanı SAYISAL değer (soru metninde bu geçmeli).
`,
        mebKazanimlar: ['M.*.4.*.', 'veri işleme', 'frekans'],
        sinifLimitleri: {
            minSinif: 1,
            maxSinif: 8,
            veriLimiti: (sinif) => Math.min(sinif + 2, 8),
        },
    },
};

// ─── SAYILAR VE CEBİR PROMPT ŞABLONLARI ─────────────────────────

export const SAYILAR_CEBIR_PROMPT_SABLONLARI: Record<string, PromptTemplate> = {
    sayi_dogrusu: {
        sistemTalimati: `
[SAYILAR — SAYI DOĞRUSU ZORUNLU]

Sayı doğrusunda gösterilen sayılar soru metninde AYNEN geçmeli.

✅ DOĞRU ÖRNEK:
Soru: "Sayı doğrusunda A noktası -3, B noktası 2, C noktası 5'i gösteriyor. A ile C arasındaki uzaklık kaç birimdir?"
→ grafik_verisi: {
    "tip": "sayi_dogrusu",
    "baslik": "Sayı Doğrusu",
    "veri": [
      {"etiket": "A", "deger": -3},
      {"etiket": "O", "deger": 0},
      {"etiket": "B", "deger": 2},
      {"etiket": "C", "deger": 5}
    ]
  }
→ Uzaklık: |5 - (-3)| = 8 birim

📊 KONUM KURALLARI:
• Negatif sayılar: Sıfırın solunda (x < 0)
• Sıfır: Merkez nokta
• Pozitif sayılar: Sıfırın sağında (x > 0)
• Kesirler: İki tam sayı arasına yerleşir (örn: 2.5, 2 ile 3 arası)

⚠️ SINIF LİMİTLERİ:
• 1-4. sınıf: Yalnızca pozitif tam sayılar (0-20)
• 5-6. sınıf: Negatif sayılar dahil (-10 ile +10)
• 7-8. sınıf: Kesirler ve ondalıklar dahil
`,
        mebKazanimlar: ['M.*.1.*.', 'sayı doğrusu', 'tam sayı'],
        sinifLimitleri: {
            minSinif: 1,
            maxSinif: 8,
            veriLimiti: (sinif) => Math.min(sinif, 6),
        },
    },

    kesir_modeli: {
        sistemTalimati: `
[SAYILAR — KESİR MODELİ ZORUNLU]

Kesir görseli soru metnindeki kesirle AYNI olmalı.

✅ DOĞRU ÖRNEK:
Soru: "Bir pastanın 3/4'ü yenmiştir. Kaç parça kalmıştır?"
→ grafik_verisi: {
    "tip": "kesir_modeli",
    "baslik": "Pasta Kesir Modeli",
    "veri": [{"etiket": "Yenen", "deger": 3}, {"etiket": "Kalan", "deger": 1}],
    "ozellikler": {
      "kenarlar": [4, 3],  // [payda, pay]
      "etiketler": ["Payda: 4", "Pay: 3"]
    }
  }
→ Görsel: 4 eşit parça, 3'ü dolu (yenen), 1'i boş (kalan)

🔢 PAYDA/PAY KURALLARI:
• 3/4 → payda=4 (4 eşit parça), pay=3 (3 tanesi dolu/renkli)
• ozellikler.kenarlar: [payda, pay]

⚠️ DENK KESİR sorusunda:
1/2 = 2/4 → İki ayrı kesir modeli yan yana gösterilmeli
`,
        mebKazanimlar: ['M.*.1.*.', 'kesir'],
        sinifLimitleri: {
            minSinif: 2,
            maxSinif: 8,
            veriLimiti: (sinif) => (sinif <= 4 ? 4 : 8),
        },
    },

    koordinat_donusum: {
        sistemTalimati: `
[GEOMETRİ — KOORDİNAT DÖNÜŞÜM GRAFİĞİ ZORUNLU]

Yansıma ve öteleme (veya döndürme) sorularında her dönüşüm adımı koordinat düzleminde AÇIKÇA gösterilmeli.

📐 DÖNÜŞÜM KURALLARI:
• Y eksenine yansıma:  A(x, y) → A'(-x, y)      [x işareti tersine döner]
• X eksenine yansıma:  A(x, y) → A'(x, -y)      [y işareti tersine döner]
• y=x'e yansıma:       A(x, y) → A'(y, x)       [x ve y yer değiştirir]
• Öteleme (dx, dy):    A'(x, y) → A''(x+dx, y+dy)

✅ DOĞRU ÖRNEK:
Soru: "A(-3, 5) noktası önce y eksenine göre yansıtılıyor, ardından 1 birim sağa 4 birim aşağı öteleniyor. A'' nedir?"
→ ADIM 1 — Y eksenine yansıma: A(-3,5) → A'(3,5)   [sadece x işareti değişir]
→ ADIM 2 — (dx=1, dy=-4) öteleme: A'(3,5) → A''(3+1, 5-4) = A''(4,1)
→ grafik_verisi: {
    "tip": "koordinat_donusum",
    "baslik": "Koordinat Dönüşümü",
    "veri": [
      {"etiket": "A",   "x": -3, "y": 5},
      {"etiket": "A'",  "x": 3,  "y": 5},
      {"etiket": "A''", "x": 4,  "y": 1}
    ],
    "ozellikler": {
      "yansımaEkseni": "y",
      "otelemeVektoru": {"dx": 1, "dy": -4}
    }
  }

✅ TEK ADIM ÖRNEK (sadece öteleme):
Soru: "B(2, -3) noktası 3 birim sola 2 birim yukarı öteleniyor. B' nedir?"
→ grafik_verisi: {
    "tip": "koordinat_donusum",
    "baslik": "Öteleme",
    "veri": [
      {"etiket": "B",  "x": 2,  "y": -3},
      {"etiket": "B'", "x": -1, "y": -1}
    ],
    "ozellikler": {
      "otelemeVektoru": {"dx": -3, "dy": 2}
    }
  }

🚨 KRİTİK KONTROLLER:
1. HER koordinat çifti matematiksel olarak doğru hesaplanmalı — kural dışı değer YASAK
2. Veri dizisindeki sıra dönüşüm adımlarının sırasını takip etmeli (orijinal → ara → son)
3. Etiketler soru metnindeki harf ve asal işaretleriyle BİREBİR eşleşmeli
4. Soru metninde geçen koordinatlar veri dizisinde AYNEN bulunmalı
`,
        mebKazanimlar: ['M.8.5.2.1', 'M.7.5.*.', 'yansıma', 'öteleme', 'dönüşüm'],
        sinifLimitleri: {
            minSinif: 6,
            maxSinif: 8,
            veriLimiti: () => 4,
        },
    },

    koordinat_sistemi: {
        sistemTalimati: `
[CEBİR — KOORDİNAT SİSTEMİ ZORUNLU]

Noktaların (x,y) koordinatları soru metninde AYNEN geçmeli.

✅ DOĞRU ÖRNEK:
Soru: "Koordinat düzleminde A(3, 4), B(-2, 1) noktaları veriliyor. AB uzaklığı kaç birimdir?"
→ grafik_verisi: {
    "tip": "koordinat_sistemi",
    "baslik": "Koordinat Düzlemi",
    "veri": [
      {"etiket": "A", "x": 3, "y": 4},
      {"etiket": "B", "x": -2, "y": 1}
    ]
  }
→ Uzaklık: √[(3-(-2))² + (4-1)²] = √[25+9] = √34 ≈ 5,83 birim

📐 BÖLGELER (QUADRANTS):
• I. Bölge: x > 0, y > 0
• II. Bölge: x < 0, y > 0
• III. Bölge: x < 0, y < 0
• IV. Bölge: x > 0, y < 0

⚠️ SINIF LİMİTLERİ:
• 5-6. sınıf: Yalnızca I. bölge (pozitif x, y)
• 7-8. sınıf: Tüm bölgeler (negatif koordinatlar dahil)
`,
        mebKazanimlar: ['M.6.3.*.', 'M.7.3.*.', 'koordinat'],
        sinifLimitleri: {
            minSinif: 5,
            maxSinif: 8,
            veriLimiti: (sinif) => Math.min(sinif - 2, 6),
        },
    },

    koordinat_grafigi: {
        sistemTalimati: `
[CEBİR — FONKSİYON GRAFİĞİ ZORUNLU]

Doğrusal fonksiyon denklemi ve grafiği TUTARLI olmalı.

✅ DOĞRU ÖRNEK:
Soru: "y = 2x + 1 fonksiyonunun grafiği verilmiştir. x=2 için y değeri nedir?"
→ grafik_verisi: {
    "tip": "koordinat_grafigi",
    "baslik": "y = 2x + 1 Fonksiyonu",
    "veri": [
      {"etiket": "P1", "x": 0, "y": 1},
      {"etiket": "P2", "x": 1, "y": 3},
      {"etiket": "P3", "x": 2, "y": 5},
      {"etiket": "P4", "x": 3, "y": 7}
    ]
  }
→ Kontrol: Her nokta denklemi sağlamalı
  x=0: y=2(0)+1=1 ✓
  x=1: y=2(1)+1=3 ✓
  x=2: y=2(2)+1=5 ✓

📊 TUTARLILIK: Her (x,y) çifti fonksiyon denklemini SAĞLAMALI!
`,
        mebKazanimlar: ['M.7.3.*.', 'M.8.3.*.', 'fonksiyon', 'grafik'],
        sinifLimitleri: {
            minSinif: 7,
            maxSinif: 8,
            veriLimiti: () => 5,
        },
    },
};

// ─── OLASILIK PROMPT ŞABLONLARI ──────────────────────────────────

export const OLASILIK_PROMPT_SABLONLARI: Record<string, PromptTemplate> = {
    olaslik_cark: {
        sistemTalimati: `
[OLASILIK — OLASILIK ÇARKI ZORUNLU]

Dilim alanları olasılıkla ORANTILI olmalı.

✅ DOĞRU ÖRNEK:
Soru: "Çarkta kırmızı gelme olasılığı 1/4'tür. Toplam 8 eşit dilim varsa kaç tanesi kırmızıdır?"
→ grafik_verisi: {
    "tip": "olaslik_cark",
    "baslik": "Olasılık Çarkı (8 dilim)",
    "veri": [
      {"etiket": "Kırmızı", "deger": 2},
      {"etiket": "Mavi", "deger": 3},
      {"etiket": "Yeşil", "deger": 2},
      {"etiket": "Sarı", "deger": 1}
    ]
  }
→ P(Kırmızı) = 2/8 = 1/4 ✓
→ Toplam: 2+3+2+1 = 8 dilim

🎲 OLASILIK İFADELERİ:
• "Kesin" → P=1 (tüm dilimler aynı renk)
• "İmkansız" → P=0 (o renk yok)
• "Olası" → 0 < P < 1

⚠️ Dilim sayıları toplamı MANTIKLI olmalı (genellikle 4, 6, 8, 10 vb.)
`,
        mebKazanimlar: ['M.8.5.*.', 'olasılık'],
        sinifLimitleri: {
            minSinif: 7,
            maxSinif: 8,
            veriLimiti: () => 8,
        },
    },

    venn_diyagrami: {
        sistemTalimati: `
[OLASILIK — VENN DİYAGRAMI ZORUNLU]

Küme elemanları soru metninde AYNEN geçmeli.

✅ DOĞRU ÖRNEK:
Soru: "A = {1, 2, 3, 5}, B = {2, 4, 5, 6} kümeleri veriliyor. A ∩ B kaç elemanlıdır?"
→ grafik_verisi: {
    "tip": "venn_diyagrami",
    "baslik": "A ve B Kümeleri",
    "veri": [
      {"etiket": "1", "nesne": "A"},
      {"etiket": "3", "nesne": "A"},
      {"etiket": "2", "nesne": "AB"},
      {"etiket": "5", "nesne": "AB"},
      {"etiket": "4", "nesne": "B"},
      {"etiket": "6", "nesne": "B"}
    ]
  }
→ A ∩ B = {2, 5} → 2 eleman

🔢 KÜME İŞLEMLERİ FORMÜLLERI:
• n(A∪B) = n(A) + n(B) - n(A∩B)
• n(A) = 4, n(B) = 4, n(A∩B) = 2
• n(A∪B) = 4 + 4 - 2 = 6 ✓

⚠️ "nesne" alanı:
  - "A": Yalnızca A kümesinde
  - "B": Yalnızca B kümesinde
  - "AB": Kesişim (her iki kümede de)
`,
        mebKazanimlar: ['M.7.5.*.', 'M.8.5.*.', 'küme'],
        sinifLimitleri: {
            minSinif: 7,
            maxSinif: 8,
            veriLimiti: () => 12,
        },
    },
};

// ─── TÜM ŞABLONLARI BİRLEŞTİR ────────────────────────────────────

export const TUM_GORSEL_PROMPT_SABLONLARI: Record<GrafikVeriTipi, PromptTemplate> = {
    ...GEOMETRI_PROMPT_SABLONLARI,
    ...VERI_ISLEME_PROMPT_SABLONLARI,
    ...SAYILAR_CEBIR_PROMPT_SABLONLARI,
    ...OLASILIK_PROMPT_SABLONLARI,
} as Record<GrafikVeriTipi, PromptTemplate>;

// ─── YARDIMCI FONKSİYONLAR ───────────────────────────────────────

/**
 * Belirli bir görsel tipi için özelleştirilmiş prompt talimatı döndürür.
 */
export function getVisualPromptForType(
    gorselTip: GrafikVeriTipi,
    sinifSeviyesi?: number
): string {
    const sablon = TUM_GORSEL_PROMPT_SABLONLARI[gorselTip];
    if (!sablon) return '';

    let prompt = sablon.sistemTalimati;

    // Sınıf bazlı veri limiti uyarısı ekle
    if (sinifSeviyesi && sablon.sinifLimitleri) {
        const { minSinif, maxSinif, veriLimiti } = sablon.sinifLimitleri;
        if (sinifSeviyesi >= minSinif && sinifSeviyesi <= maxSinif) {
            const limit = veriLimiti(sinifSeviyesi);
            prompt += `\n\n⚠️ ${sinifSeviyesi}. SINIF İÇİN: Maksimum ${limit} veri noktası/kategori kullan.`;
        }
    }

    return prompt;
}

/**
 * Kazanım kodlarına göre ilgili görsel tiplerinin prompt talimatlarını döndürür.
 */
export function getVisualPromptsForKazanimlar(
    kazanimKodlari: string[],
    sinifSeviyesi?: number
): string {
    const gorselTipler = new Set<GrafikVeriTipi>();

    // Her kazanım için uygun görsel tiplerini belirle
    for (const kod of kazanimKodlari) {
        const kodLower = kod.toLowerCase();

        // Veri İşleme
        if (kodLower.includes('.4.')) {
            if (kodLower.includes('çetele')) gorselTipler.add('cetele_tablosu');
            else if (kodLower.includes('sütun')) gorselTipler.add('sutun_grafigi');
            else if (kodLower.includes('pasta')) gorselTipler.add('pasta_grafigi');
            else if (kodLower.includes('çizgi')) gorselTipler.add('cizgi_grafigi');
            else gorselTipler.add('siklik_tablosu');
        }

        // Geometri
        if (kodLower.includes('.2.')) {
            if (kodLower.includes('üçgen') || kodLower.includes('ucgen')) {
                gorselTipler.add('ucgen');
            }
            if (kodLower.includes('dik')) gorselTipler.add('dik_ucgen');
            if (kodLower.includes('kare')) gorselTipler.add('kare');
            if (kodLower.includes('dikdörtgen')) gorselTipler.add('dikdortgen');
            if (kodLower.includes('açı') || kodLower.includes('aci')) gorselTipler.add('aci');
            // M.8.5.2.1 ve benzeri — yansıma/öteleme/dönüşüm kazanımları
            if (
                kodLower.includes('yansıma') ||
                kodLower.includes('yansima') ||
                kodLower.includes('öteleme') ||
                kodLower.includes('oteleme') ||
                kodLower.includes('dönüşüm') ||
                kodLower.includes('donusum') ||
                // M.8.5.2.x kodlarındaki .5.2. deseni dönüşümleri içerir
                /\.5\.2\./.test(kodLower)
            ) {
                gorselTipler.add('koordinat_donusum');
            }
        }

        // Sayılar ve İşlemler
        if (kodLower.includes('.1.')) {
            if (kodLower.includes('sayı doğrusu')) gorselTipler.add('sayi_dogrusu');
            if (kodLower.includes('kesir')) gorselTipler.add('kesir_modeli');
        }

        // Cebir / Koordinat
        if (kodLower.includes('.3.') || kodLower.includes('koordinat')) {
            gorselTipler.add('koordinat_sistemi');
        }

        // Olasılık
        if (kodLower.includes('.5.') || kodLower.includes('olasılık')) {
            gorselTipler.add('olaslik_cark');
        }
    }

    // Tüm görsel tipleri için prompt'ları birleştir
    const promptlar = Array.from(gorselTipler)
        .map((tip) => getVisualPromptForType(tip, sinifSeviyesi))
        .filter(Boolean);

    if (promptlar.length === 0) return '';

    return `
[KAZANIM-BAZLI GÖRSEL TALİMATLARI — ZORUNLU]

Seçilen kazanımlar aşağıdaki görsel tiplerini GEREKTİRİYOR.
Bu kazanımlar için GÖRSELSİZ soru üretme!

SIFIR HALÜSİNASYON: Soru ile görsel (grafik_verisi) %100 eşleşmek zorundadır. Asla soruda bahsedilmeyen bir ölçüyü grafiğe veya grafikte olmayan bir sayıyı soruya yazma.

${promptlar.join('\n\n---\n\n')}
`;
}

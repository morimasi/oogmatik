# Super Türkçe Sınav Stüdyosu — Tam Tasarım Belgesi

**Tarih**: 2026-03-28
**Durum**: Tasarım Onayı Bekliyor
**Sahip**: Oogmatik Ekip (Elif Yıldız, Dr. Ahmet Kaya, Bora Demir, Selin Arslan)

---

## 📋 Executive Summary

**Super Türkçe Sınav Stüdyosu**, Oogmatik platformuna tamamen yeni bir modül olarak eklenecek, MEB 2024-2025 müfredat kazanımlarıyla entegre, AI destekli Türkçe sınav oluşturma sistemidir.

### Kritik Özellikler

1. **MEB Müfredat Hiyerarşisi Entegrasyonu** (YENİ İSTEM)
   - Sınıf seçimi → Tüm üniteler listelenir (çoklu seçilebilir)
   - Ünite seçimi → İlgili ünitenin TÜM MEB kazanımları listelenir (çoklu seçilebilir)
   - Seçilen kazanımlar AI prompt'una dahil edilir

2. **4 Soru Tipi**
   - Çoktan Seçmeli (4 seçenekli)
   - Doğru-Yanlış-Düzeltme
   - Boşluk Doldurma
   - Açık Uçlu

3. **Tek PDF Çıktı**
   - Sorular → Cevap Anahtarı (sıralı)
   - Yazdırma dostu format

4. **Gelişmiş Özellikler**
   - Soru bankası (cache + Firestore)
   - Zorluk dengeleme (Başarı Anı Mimarisi: ilk 2 soru kolay)
   - Süre tahmini (soru tipine göre)
   - Puan dağılımı hesaplama

5. **İşlemler**
   - Kaydet (Firestore + local cache)
   - İndir (PDF)
   - Yazdır
   - Paylaş (kullanıcılar arası)
   - Çalışma kitabına ekle

---

## 👥 Uzman Ajan Onayları

### Elif Yıldız (Özel Öğrenme Uzmanı) — ✅ ONAYLI

**Pedagojik Gereksinimler:**

1. **"Başarı Anı Mimarisi"**
   - İlk 2 soru mutlaka KOLAY olmalı
   - Son soru ORTA zorlukta
   - İlerleme: Kolay → Kolay → Orta → Orta-Zor

2. **pedagogicalNote Zorunluluğu**
   - Her sınav için AI'dan `pedagogicalNote` alınmalı
   - Format: "Bu sınav [kazanım kodları] kazanımlarını ölçmektedir. Öğretmen dikkat noktaları: [...]"

3. **ZPD Uyumu**
   - Sınıf seviyesi ile kazanım uyumu kontrol edilmeli
   - Örnek: 4. sınıf için T.4.X.X kodlu kazanımlar

4. **Görsel Destek**
   - Açık uçlu sorularda görsel ipucu opsiyonu
   - Okuma metinlerinde SVG ikonlar

---

### Dr. Ahmet Kaya (Özel Eğitim Uzmanı) — ✅ ONAYLI

**Klinik ve MEB Standartları:**

1. **MEB 2024-2025 Kazanım Kodları**
   - Kazanım formatı: `T.X.Y.Z`
     - X: Sınıf (4-9)
     - Y: Öğrenme Alanı (1: Dinleme/İzleme, 2: Konuşma, 3: Okuma, 4: Yazma)
     - Z: Kazanım numarası
   - Örnek: `T.5.3.7` → 5. Sınıf, Okuma alanı, 7. kazanım

2. **Tanı Koyucu Dil Yasağı**
   - ❌ "Disleksisi olan öğrenciler için"
   - ✅ "Disleksi desteğine ihtiyaç duyan öğrenciler için"

3. **KVKK Uyumu**
   - Öğrenci adı + sınav sonucu aynı ekranda görünmeyecek
   - Paylaşım sırasında anonimleştirme seçeneği

4. **MEB Uyumu**
   - Sınav dili: Türkçe, sade, net
   - Soru kökü karmaşıklığı sınıf seviyesine uygun

---

### Bora Demir (Yazılım Mühendisi) — ✅ ONAYLI

**Teknik Standartlar:**

1. **TypeScript Strict Mode**
   - `any` tipi yasak → `unknown` + type guard kullan
   - Tüm prop'lar ve state tam tipli olmalı

2. **AppError Standardı**
   ```typescript
   throw new AppError(
     'Sınav oluşturulamadı. Lütfen kazanım seçimini kontrol edin.',
     'EXAM_GENERATION_FAILED',
     400,
     { selectedKazanim: kazanimIds },
     true // retryable
   );
   ```

3. **Rate Limiting**
   - `/api/generate-exam` endpoint'i için:
     - IP bazlı: 10 sınav/saat
     - Kullanıcı bazlı: 30 sınav/gün

4. **Defensive Coding**
   ```typescript
   if (!Array.isArray(selectedKazanim) || selectedKazanim.length === 0) {
     throw new AppError('En az bir kazanım seçilmelidir.', 'VALIDATION_ERROR', 400);
   }
   ```

5. **Test Gereksinimleri**
   - Vitest unit testleri:
     - MEB kazanım parser
     - Zorluk dengeleme algoritması
     - PDF generation
   - Playwright E2E:
     - Sınav oluşturma akışı (sınıf → ünite → kazanım → üret)

---

### Selin Arslan (AI Mühendisi) — ✅ ONAYLI

**AI Kalite Standartları:**

1. **Model Seçimi**
   - `gemini-2.5-flash` yeterli (sınav soruları için)
   - Tahmini token: ~150 token/soru → 4 soru için ~600 token

2. **Batch Mechanism**
   - Soru sayısı > 10 ise 5'erli gruplara böl
   - `Promise.allSettled()` ile partial success desteği

3. **Prompt Injection Koruması**
   - Kullanıcı girişi (özel konu) sanitize edilmeli
   - Max 500 karakter limit

4. **JSON Onarım**
   - Mevcut `geminiClient.ts` JSON repair sistemi kullanılacak
   - 3 katman: balanceBraces → truncateToValid → JSON.parse

5. **Cache Stratejisi**
   - Cache key: `hash(sınıf + kazanımlar + zorluk + soruTipleri)`
   - IndexedDB ile browser-side cache
   - TTL: 7 gün

6. **Hallucination Risk**
   - Gemini'a kazanım kodları ve tanımları prompt'a açıkça verilmeli
   - Örnek: "T.5.3.7: Okuduğu metindeki ana fikri belirler."

---

## 🏗️ Mimari Tasarım

### Dosya Yapısı (YENİ MODÜL)

```
oogmatik/
│
├── src/
│   ├── components/
│   │   └── SınavStüdyosu/             ← YENİ MODÜL (Super Türkçe'den ayrı)
│   │       ├── index.tsx               ← Ana container
│   │       ├── KazanimPicker.tsx       ← MEB kazanım seçici (YENİ)
│   │       ├── SoruAyarları.tsx        ← Soru tipleri + zorluk
│   │       ├── SınavÖnizleme.tsx       ← Üretilen sınav preview
│   │       ├── CevapAnahtarı.tsx       ← Cevap anahtarı bileşeni
│   │       ├── İşlemBar.tsx            ← Kaydet/İndir/Yazdır/Paylaş
│   │       └── components/
│   │           ├── SoruCard.tsx        ← Tek soru render
│   │           └── ZorlukGöstergesi.tsx ← Görsel zorluk badge
│   │
│   ├── services/
│   │   ├── generators/
│   │   │   └── sinavGenerator.ts       ← AI sınav üretimi
│   │   ├── mebCurriculumService.ts     ← MEB kazanım data servisi (YENİ)
│   │   └── examService.ts              ← Sınav CRUD + paylaşım (YENİ)
│   │
│   ├── data/
│   │   └── meb-turkce-kazanim.ts       ← MEB 2024-2025 kazanım veritabanı (YENİ)
│   │
│   ├── store/
│   │   └── useSinavStore.ts            ← Zustand store (YENİ)
│   │
│   └── types/
│       └── sinav.ts                    ← Sınav tipleri (YENİ)
│
├── api/
│   └── generate-exam.ts                ← Vercel serverless endpoint (YENİ)
│
└── tests/
    ├── sinavGenerator.test.ts
    └── e2e/
        └── sinav-olusturma.spec.ts
```

---

## 📊 TypeScript Tip Tanımları

### `src/types/sinav.ts`

```typescript
// MEB Kazanım Yapısı
export interface MEBKazanim {
  kod: string;              // Örn: "T.5.3.7"
  sinif: number;            // 4-9 arası
  ogrenmeAlani: MEBOgrenmeAlani;
  tanim: string;            // "Okuduğu metindeki ana fikri belirler."
  unite: string;            // "Ünite 3: Dünya ve Uzayı Keşfediyorum"
}

export type MEBOgrenmeAlani =
  | 'Dinleme/İzleme'
  | 'Konuşma'
  | 'Okuma'
  | 'Yazma';

// Ünite Yapısı
export interface MEBUnite {
  id: string;               // "unite-5-3"
  sinif: number;
  uniteNo: number;
  baslik: string;           // "Dünya ve Uzayı Keşfediyorum"
  kazanimlar: MEBKazanim[];
}

// Sınıf Müfredatı
export interface MEBSinifMufredati {
  sinif: number;
  uniteler: MEBUnite[];
}

// Soru Tipleri
export type SoruTipi =
  | 'coktan-secmeli'
  | 'dogru-yanlis-duzeltme'
  | 'bosluk-doldurma'
  | 'acik-uclu';

export type Zorluk = 'Kolay' | 'Orta' | 'Zor';

// Tek Soru
export interface Soru {
  id: string;
  tip: SoruTipi;
  zorluk: Zorluk;
  soruMetni: string;
  secenekler?: string[];      // Çoktan seçmeli için
  dogruCevap: string | number; // Cevap indeksi veya metin
  kazanimKodu: string;        // İlgili MEB kazanım kodu
  puan: number;
  tahminiSure: number;        // Saniye cinsinden
}

// Sınav
export interface Sinav {
  id: string;
  baslik: string;
  sinif: number;
  secilenKazanimlar: string[]; // Kazanım kodları array
  sorular: Soru[];
  toplamPuan: number;
  tahminiSure: number;
  olusturmaTarihi: string;
  olusturanKullanici: string;
  pedagogicalNote: string;    // ZORUNLU
  cevapAnahtari: CevapAnahtari;
}

// Cevap Anahtarı
export interface CevapAnahtari {
  sorular: {
    soruNo: number;
    dogruCevap: string;
    puan: number;
    kazanimKodu: string;
  }[];
}

// Sınav Ayarları (UI State)
export interface SinavAyarlari {
  sinif: number | null;
  secilenUniteler: string[];      // Ünite ID'leri
  secilenKazanimlar: string[];    // Kazanım kodları
  soruDagilimi: {
    'coktan-secmeli': number;
    'dogru-yanlis-duzeltme': number;
    'bosluk-doldurma': number;
    'acik-uclu': number;
  };
  zorlukDagilimi: {
    'Kolay': number;
    'Orta': number;
    'Zor': number;
  };
  ozelKonu?: string;              // Opsiyonel tema (örn: "Uzay keşfi")
}
```

---

## 🗄️ MEB Kazanım Veritabanı

### `src/data/meb-turkce-kazanim.ts`

```typescript
import { MEBSinifMufredati, MEBUnite, MEBKazanim } from '../types/sinav';

/**
 * MEB 2024-2025 Türkçe Dersi Öğretim Programı Kazanımları
 * Kaynak: MEB Talim Terbiye Kurulu Başkanlığı
 *
 * Not: Bu örnek 5. sınıf için. 4., 6., 7., 8., 9. sınıflar eklenecek.
 */

const SINIF_5_UNITELER: MEBUnite[] = [
  {
    id: 'unite-5-1',
    sinif: 5,
    uniteNo: 1,
    baslik: 'Birey ve Toplum',
    kazanimlar: [
      {
        kod: 'T.5.1.1',
        sinif: 5,
        ogrenmeAlani: 'Dinleme/İzleme',
        tanim: 'Dinlediğinde/izlediğinde ana fikir ve tema gibi unsurları belirler.',
        unite: 'Birey ve Toplum'
      },
      {
        kod: 'T.5.1.2',
        sinif: 5,
        ogrenmeAlani: 'Dinleme/İzleme',
        tanim: 'Dinlediği/izlediği hikâye edici metinlerde olay akışını kavrar.',
        unite: 'Birey ve Toplum'
      },
      {
        kod: 'T.5.2.1',
        sinif: 5,
        ogrenmeAlani: 'Konuşma',
        tanim: 'Hazırlıksız konuşma yapar.',
        unite: 'Birey ve Toplum'
      },
      {
        kod: 'T.5.3.1',
        sinif: 5,
        ogrenmeAlani: 'Okuma',
        tanim: 'Okuduğu metinde ana fikri ve tema gibi unsurları belirler.',
        unite: 'Birey ve Toplum'
      },
      {
        kod: 'T.5.3.2',
        sinif: 5,
        ogrenmeAlani: 'Okuma',
        tanim: 'Okuduğu metinde hikâye unsurlarını belirler.',
        unite: 'Birey ve Toplum'
      },
      {
        kod: 'T.5.4.1',
        sinif: 5,
        ogrenmeAlani: 'Yazma',
        tanim: 'Yazma stratejilerini uygular.',
        unite: 'Birey ve Toplum'
      },
      {
        kod: 'T.5.4.2',
        sinif: 5,
        ogrenmeAlani: 'Yazma',
        tanim: 'Yazdıklarını düzenler.',
        unite: 'Birey ve Toplum'
      }
    ]
  },
  {
    id: 'unite-5-2',
    sinif: 5,
    uniteNo: 2,
    baslik: 'Millî Mücadele ve Atatürk',
    kazanimlar: [
      {
        kod: 'T.5.1.3',
        sinif: 5,
        ogrenmeAlani: 'Dinleme/İzleme',
        tanim: 'Dinlediklerinin/izlediklerinin içeriğini değerlendirir.',
        unite: 'Millî Mücadele ve Atatürk'
      },
      {
        kod: 'T.5.2.2',
        sinif: 5,
        ogrenmeAlani: 'Konuşma',
        tanim: 'Konuşmasını dinleyicilere göre düzenler.',
        unite: 'Millî Mücadele ve Atatürk'
      },
      {
        kod: 'T.5.3.3',
        sinif: 5,
        ogrenmeAlani: 'Okuma',
        tanim: 'Okuduğu metindeki bilgileri sorgular.',
        unite: 'Millî Mücadele ve Atatürk'
      },
      {
        kod: 'T.5.4.3',
        sinif: 5,
        ogrenmeAlani: 'Yazma',
        tanim: 'Bilgilendirici metin yazar.',
        unite: 'Millî Mücadele ve Atatürk'
      }
    ]
  },
  {
    id: 'unite-5-3',
    sinif: 5,
    uniteNo: 3,
    baslik: 'Doğa ve Evren',
    kazanimlar: [
      {
        kod: 'T.5.1.4',
        sinif: 5,
        ogrenmeAlani: 'Dinleme/İzleme',
        tanim: 'Dinlediklerinin/izlediklerinin konusunu belirler.',
        unite: 'Doğa ve Evren'
      },
      {
        kod: 'T.5.2.3',
        sinif: 5,
        ogrenmeAlani: 'Konuşma',
        tanim: 'Konuşmasını süreye göre ayarlar.',
        unite: 'Doğa ve Evren'
      },
      {
        kod: 'T.5.3.4',
        sinif: 5,
        ogrenmeAlani: 'Okuma',
        tanim: 'Okuduğu metindeki sebep-sonuç ilişkilerini fark eder.',
        unite: 'Doğa ve Evren'
      },
      {
        kod: 'T.5.3.5',
        sinif: 5,
        ogrenmeAlani: 'Okuma',
        tanim: 'Metinle ilgili çıkarımlarda bulunur.',
        unite: 'Doğa ve Evren'
      },
      {
        kod: 'T.5.4.4',
        sinif: 5,
        ogrenmeAlani: 'Yazma',
        tanim: 'Hikâye edici metin yazar.',
        unite: 'Doğa ve Evren'
      }
    ]
  },
  {
    id: 'unite-5-4',
    sinif: 5,
    uniteNo: 4,
    baslik: 'Bilim ve Teknoloji',
    kazanimlar: [
      {
        kod: 'T.5.1.5',
        sinif: 5,
        ogrenmeAlani: 'Dinleme/İzleme',
        tanim: 'Dinlediklerinde/izlediklerinde geçen sözcüklerin anlamlarını tespit eder.',
        unite: 'Bilim ve Teknoloji'
      },
      {
        kod: 'T.5.2.4',
        sinif: 5,
        ogrenmeAlani: 'Konuşma',
        tanim: 'Kelimeleri anlamlarına uygun kullanır.',
        unite: 'Bilim ve Teknoloji'
      },
      {
        kod: 'T.5.3.6',
        sinif: 5,
        ogrenmeAlani: 'Okuma',
        tanim: 'Okuduğu metnin içeriğini özetler.',
        unite: 'Bilim ve Teknoloji'
      },
      {
        kod: 'T.5.3.7',
        sinif: 5,
        ogrenmeAlani: 'Okuma',
        tanim: 'Görsel ve işitsel unsurların iletiye olan etkisini değerlendirir.',
        unite: 'Bilim ve Teknoloji'
      },
      {
        kod: 'T.5.4.5',
        sinif: 5,
        ogrenmeAlani: 'Yazma',
        tanim: 'Yazılarını zenginleştirmek için çeşitli görsel ve işitsel unsurlar kullanır.',
        unite: 'Bilim ve Teknoloji'
      }
    ]
  }
];

export const MEB_TURKCE_MUFREDATI: MEBSinifMufredati[] = [
  {
    sinif: 5,
    uniteler: SINIF_5_UNITELER
  }
  // TODO: 4., 6., 7., 8., 9. sınıflar eklenecek
];

/**
 * Sınıfa göre üniteleri getir
 */
export const getUnitesByGrade = (sinif: number): MEBUnite[] => {
  const mufredatByGrade = MEB_TURKCE_MUFREDATI.find(m => m.sinif === sinif);
  return mufredatByGrade?.uniteler || [];
};

/**
 * Kazanım koduna göre kazanım detayı getir
 */
export const getKazanimByCode = (kod: string): MEBKazanim | undefined => {
  for (const muf of MEB_TURKCE_MUFREDATI) {
    for (const unite of muf.uniteler) {
      const kazanim = unite.kazanimlar.find(k => k.kod === kod);
      if (kazanim) return kazanim;
    }
  }
  return undefined;
};

/**
 * Ünite ID'sine göre kazanımları getir
 */
export const getKazanimByUniteId = (uniteId: string): MEBKazanim[] => {
  for (const muf of MEB_TURKCE_MUFREDATI) {
    const unite = muf.uniteler.find(u => u.id === uniteId);
    if (unite) return unite.kazanimlar;
  }
  return [];
};
```

---

## 🎨 UI Bileşenleri

### 1. KazanimPicker.tsx (YENİ - Kritik Bileşen)

```typescript
import React, { useState, useEffect } from 'react';
import { getUnitesByGrade, getKazanimByUniteId } from '../../data/meb-turkce-kazanim';
import { MEBUnite, MEBKazanim } from '../../types/sinav';

interface KazanimPickerProps {
  selectedGrade: number | null;
  selectedUnites: string[];
  selectedKazanimlar: string[];
  onUniteChange: (uniteIds: string[]) => void;
  onKazanimChange: (kazanimCodes: string[]) => void;
}

export const KazanimPicker: React.FC<KazanimPickerProps> = ({
  selectedGrade,
  selectedUnites,
  selectedKazanimlar,
  onUniteChange,
  onKazanimChange
}) => {
  const [uniteler, setUniteler] = useState<MEBUnite[]>([]);
  const [kazanimlar, setKazanimlar] = useState<MEBKazanim[]>([]);

  // Sınıf değiştiğinde üniteleri yükle
  useEffect(() => {
    if (selectedGrade) {
      const unites = getUnitesByGrade(selectedGrade);
      setUniteler(unites);
      // Sınıf değişince seçimleri sıfırla
      onUniteChange([]);
      onKazanimChange([]);
      setKazanimlar([]);
    }
  }, [selectedGrade]);

  // Ünite seçimi değiştiğinde kazanımları yükle
  useEffect(() => {
    if (selectedUnites.length > 0) {
      const allKazanim: MEBKazanim[] = [];
      selectedUnites.forEach(uniteId => {
        const uniteKazanim = getKazanimByUniteId(uniteId);
        allKazanim.push(...uniteKazanim);
      });
      setKazanimlar(allKazanim);
    } else {
      setKazanimlar([]);
      onKazanimChange([]);
    }
  }, [selectedUnites]);

  const handleUniteToggle = (uniteId: string) => {
    const newSelection = selectedUnites.includes(uniteId)
      ? selectedUnites.filter(id => id !== uniteId)
      : [...selectedUnites, uniteId];
    onUniteChange(newSelection);
  };

  const handleKazanimToggle = (kazanimCode: string) => {
    const newSelection = selectedKazanimlar.includes(kazanimCode)
      ? selectedKazanimlar.filter(code => code !== kazanimCode)
      : [...selectedKazanimlar, kazanimCode];
    onKazanimChange(newSelection);
  };

  if (!selectedGrade) {
    return (
      <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <p className="text-yellow-800">Önce bir sınıf seçin.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Ünite Seçimi */}
      <div>
        <h3 className="text-lg font-semibold mb-3">
          {selectedGrade}. Sınıf Üniteleri (Çoklu Seçim)
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {uniteler.map(unite => (
            <label
              key={unite.id}
              className="flex items-start gap-3 p-3 border rounded-lg cursor-pointer hover:bg-blue-50 transition"
            >
              <input
                type="checkbox"
                checked={selectedUnites.includes(unite.id)}
                onChange={() => handleUniteToggle(unite.id)}
                className="mt-1"
              />
              <div>
                <div className="font-medium">Ünite {unite.uniteNo}: {unite.baslik}</div>
                <div className="text-sm text-gray-600">
                  {unite.kazanimlar.length} kazanım
                </div>
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* Kazanım Seçimi (Ünite seçiliyse göster) */}
      {selectedUnites.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-3">
            MEB Kazanımları (Çoklu Seçim) — {kazanimlar.length} kazanım
          </h3>
          <div className="space-y-2 max-h-96 overflow-y-auto border rounded-lg p-3">
            {kazanimlar.map(kazanim => (
              <label
                key={kazanim.kod}
                className="flex items-start gap-3 p-3 border rounded-lg cursor-pointer hover:bg-green-50 transition"
              >
                <input
                  type="checkbox"
                  checked={selectedKazanimlar.includes(kazanim.kod)}
                  onChange={() => handleKazanimToggle(kazanim.kod)}
                  className="mt-1"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-mono rounded">
                      {kazanim.kod}
                    </span>
                    <span className="text-xs text-gray-500">
                      {kazanim.ogrenmeAlani}
                    </span>
                  </div>
                  <div className="text-sm">{kazanim.tanim}</div>
                </div>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* Seçim Özeti */}
      {selectedKazanimlar.length > 0 && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
          <p className="font-medium text-green-800">
            ✅ {selectedKazanimlar.length} kazanım seçildi
          </p>
          <p className="text-sm text-green-700 mt-1">
            Bu kazanımlar sınav sorularına dahil edilecek.
          </p>
        </div>
      )}
    </div>
  );
};
```

---

## 🤖 AI Prompt Builder

### `src/services/generators/sinavGenerator.ts`

```typescript
import { generateWithSchema } from '../geminiClient';
import { SinavAyarlari, Soru, Sinav, CevapAnahtari } from '../../types/sinav';
import { getKazanimByCode } from '../../data/meb-turkce-kazanim';
import { AppError } from '../../utils/AppError';

/**
 * Sınav için AI prompt oluştur
 */
const buildExamPrompt = (settings: SinavAyarlari): string => {
  // Kazanım bilgilerini topla
  const kazanimBilgileri = settings.secilenKazanimlar
    .map(kod => {
      const kazanim = getKazanimByCode(kod);
      return kazanim ? `${kod}: ${kazanim.tanim} (${kazanim.ogrenmeAlani})` : kod;
    })
    .join('\n');

  const toplamSoru =
    settings.soruDagilimi['coktan-secmeli'] +
    settings.soruDagilimi['dogru-yanlis-duzeltme'] +
    settings.soruDagilimi['bosluk-doldurma'] +
    settings.soruDagilimi['acik-uclu'];

  return `
[ROL: MEB SINAV UZMANI + DİSLEKSİ UZMAN ÖĞRETMENİ]

GÖREV: ${settings.sinif}. sınıf Türkçe dersi için ${toplamSoru} soruluk sınav hazırla.

[MEB KAZANIM HEDEFLEME]
Aşağıdaki MEB 2024-2025 kazanımlarını ölç:
${kazanimBilgileri}

[ZORUNLU: BAŞARI ANI MİMARİSİ]
- İlk 2 soru MUTLAKA KOLAY zorlukta olmalı (öğrenciye güven inşa et)
- 3. ve 4. sorular ORTA zorlukta
- Eğer 5+ soru varsa, son soru ORTA-ZOR aralığında

[SORU DAĞILIMI]
- Çoktan Seçmeli (4 seçenekli): ${settings.soruDagilimi['coktan-secmeli']} adet
- Doğru-Yanlış-Düzeltme: ${settings.soruDagilimi['dogru-yanlis-duzeltme']} adet
- Boşluk Doldurma: ${settings.soruDagilimi['bosluk-doldurma']} adet
- Açık Uçlu: ${settings.soruDagilimi['acik-uclu']} adet

${settings.ozelKonu ? `[TEMA]\nTüm sorular "${settings.ozelKonu}" teması etrafında olmalı.\n` : ''}

[DİSLEKSİ UYUMLULUK KURALLARI]
- Sade, net dil kullan (karmaşık cümlelerden kaçın)
- Çoktan seçmelide dikkat dağıtıcılar mantıklı ama net yanlış olmalı
- Boşluk doldurmalarda kelime uzunluğu ipucu verme (hepsi aynı uzunlukta "___" kullan)

[PUAN VE SÜRE TAHMİNİ]
- Çoktan seçmeli: 5 puan, ~90 saniye
- Doğru-Yanlış-Düzeltme: 5 puan, ~120 saniye
- Boşluk doldurma: 5 puan, ~60 saniye
- Açık uçlu: 10 puan, ~300 saniye

[YANIT FORMATI - ZORUNLU JSON]
{
  "baslik": "Sınavın başlığı (örn: ${settings.sinif}. Sınıf Türkçe Değerlendirme Sınavı)",
  "sorular": [
    {
      "id": "soru-1",
      "tip": "coktan-secmeli",
      "zorluk": "Kolay",
      "soruMetni": "Soru metni...",
      "secenekler": ["A) ...", "B) ...", "C) ...", "D) ..."],
      "dogruCevap": 0,
      "kazanimKodu": "T.5.3.1",
      "puan": 5,
      "tahminiSure": 90
    }
  ],
  "pedagogicalNote": "ZORUNLU: Bu sınav [kazanım kodlarını listele] kazanımlarını ölçmektedir. Öğretmen dikkat noktaları: [detaylı pedagojik açıklama, en az 100 karakter]"
}

UYARI: pedagogicalNote alanı boş veya 100 karakterden kısa olamaz.
`;
};

/**
 * AI ile sınav oluştur
 */
export const generateExam = async (settings: SinavAyarlari): Promise<Sinav> => {
  // Validation
  if (!settings.sinif) {
    throw new AppError('Sınıf seçimi zorunludur.', 'VALIDATION_ERROR', 400);
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
    settings.soruDagilimi['coktan-secmeli'] +
    settings.soruDagilimi['dogru-yanlis-duzeltme'] +
    settings.soruDagilimi['bosluk-doldurma'] +
    settings.soruDagilimi['acik-uclu'];

  if (toplamSoru < 4) {
    throw new AppError(
      'En az 4 soru olmalıdır (Başarı Anı Mimarisi için).',
      'VALIDATION_ERROR',
      400
    );
  }

  // Prompt oluştur
  const prompt = buildExamPrompt(settings);

  // Gemini şema
  const schema = {
    type: 'OBJECT',
    properties: {
      baslik: { type: 'STRING' },
      sorular: {
        type: 'ARRAY',
        items: {
          type: 'OBJECT',
          properties: {
            id: { type: 'STRING' },
            tip: { type: 'STRING', enum: ['coktan-secmeli', 'dogru-yanlis-duzeltme', 'bosluk-doldurma', 'acik-uclu'] },
            zorluk: { type: 'STRING', enum: ['Kolay', 'Orta', 'Zor'] },
            soruMetni: { type: 'STRING' },
            secenekler: { type: 'ARRAY', items: { type: 'STRING' }, nullable: true },
            dogruCevap: { type: 'STRING' },
            kazanimKodu: { type: 'STRING' },
            puan: { type: 'INTEGER' },
            tahminiSure: { type: 'INTEGER' }
          },
          required: ['id', 'tip', 'zorluk', 'soruMetni', 'dogruCevap', 'kazanimKodu', 'puan', 'tahminiSure']
        }
      },
      pedagogicalNote: { type: 'STRING' }
    },
    required: ['baslik', 'sorular', 'pedagogicalNote']
  };

  try {
    const aiResponse = await generateWithSchema(prompt, schema);

    // Validation: pedagogicalNote kontrolü
    if (!aiResponse.pedagogicalNote || aiResponse.pedagogicalNote.length < 100) {
      throw new AppError(
        'Pedagojik not eksik veya çok kısa (en az 100 karakter olmalı).',
        'VALIDATION_ERROR',
        400
      );
    }

    // Validation: Başarı Anı Mimarisi kontrolü
    if (aiResponse.sorular.length >= 2) {
      if (aiResponse.sorular[0].zorluk !== 'Kolay' || aiResponse.sorular[1].zorluk !== 'Kolay') {
        console.warn('⚠️ AI ilk 2 soruyu Kolay yapmadı, manuel düzeltme yapılıyor.');
        aiResponse.sorular[0].zorluk = 'Kolay';
        aiResponse.sorular[1].zorluk = 'Kolay';
      }
    }

    // Cevap anahtarı oluştur
    const cevapAnahtari: CevapAnahtari = {
      sorular: aiResponse.sorular.map((soru: any, index: number) => ({
        soruNo: index + 1,
        dogruCevap: soru.dogruCevap,
        puan: soru.puan,
        kazanimKodu: soru.kazanimKodu
      }))
    };

    // Toplam puan ve süre hesapla
    const toplamPuan = aiResponse.sorular.reduce((sum: number, s: any) => sum + s.puan, 0);
    const tahminiSure = aiResponse.sorular.reduce((sum: number, s: any) => sum + s.tahminiSure, 0);

    const sinav: Sinav = {
      id: `exam-${Date.now()}`,
      baslik: aiResponse.baslik,
      sinif: settings.sinif,
      secilenKazanimlar: settings.secilenKazanimlar,
      sorular: aiResponse.sorular,
      toplamPuan,
      tahminiSure,
      olusturmaTarihi: new Date().toISOString(),
      olusturanKullanici: 'current-user-id', // TODO: authStore'dan al
      pedagogicalNote: aiResponse.pedagogicalNote,
      cevapAnahtari
    };

    return sinav;
  } catch (error: any) {
    if (error instanceof AppError) throw error;
    throw new AppError(
      'Sınav oluşturulurken beklenmeyen bir hata oluştu.',
      'EXAM_GENERATION_ERROR',
      500,
      error,
      true
    );
  }
};
```

---

## 🔌 API Endpoint

### `api/generate-exam.ts`

```typescript
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { rateLimiter } from '../services/rateLimiter';
import { AppError } from '../utils/AppError';
import { generateExam } from '../services/generators/sinavGenerator';
import { SinavAyarlari } from '../types/sinav';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      error: { message: 'Method Not Allowed', code: 'METHOD_NOT_ALLOWED' },
      timestamp: new Date().toISOString()
    });
  }

  try {
    // Rate limiting
    const clientIp = (req.headers['x-forwarded-for'] as string)?.split(',')[0] || 'unknown';
    const userId = req.headers['x-user-id'] as string || clientIp;

    const ipLimit = await rateLimiter.checkLimit(`exam:ip:${clientIp}`, 10, 3600); // 10/saat
    const userLimit = await rateLimiter.checkLimit(`exam:user:${userId}`, 30, 86400); // 30/gün

    if (!ipLimit.allowed) {
      throw new AppError(
        'Saatlik sınav oluşturma limitine ulaştınız. Lütfen daha sonra tekrar deneyin.',
        'RATE_LIMIT_EXCEEDED',
        429,
        { resetTime: ipLimit.resetTime },
        true
      );
    }

    if (!userLimit.allowed) {
      throw new AppError(
        'Günlük sınav oluşturma limitine ulaştınız.',
        'RATE_LIMIT_EXCEEDED',
        429,
        { resetTime: userLimit.resetTime },
        true
      );
    }

    // Validation
    const settings: SinavAyarlari = req.body;

    if (!settings || typeof settings !== 'object') {
      throw new AppError('Geçersiz istek formatı.', 'VALIDATION_ERROR', 400);
    }

    // Sınav oluştur
    const sinav = await generateExam(settings);

    return res.status(200).json({
      success: true,
      data: sinav,
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    console.error('Exam generation error:', error);

    if (error instanceof AppError) {
      return res.status(error.httpStatus).json({
        success: false,
        error: {
          message: error.userMessage,
          code: error.code
        },
        timestamp: new Date().toISOString()
      });
    }

    return res.status(500).json({
      success: false,
      error: {
        message: 'Sunucu hatası oluştu.',
        code: 'INTERNAL_ERROR'
      },
      timestamp: new Date().toISOString()
    });
  }
}
```

---

## 📦 Zustand Store

### `src/store/useSinavStore.ts`

```typescript
import { create } from 'zustand';
import { SinavAyarlari, Sinav } from '../types/sinav';

interface SinavStoreState {
  // Ayarlar
  ayarlar: SinavAyarlari;
  setAyarlar: (ayarlar: Partial<SinavAyarlari>) => void;

  // Sınıf seçimi
  setSinif: (sinif: number) => void;

  // Ünite seçimi
  setSecilenUniteler: (uniteler: string[]) => void;

  // Kazanım seçimi
  setSecilenKazanimlar: (kazanimlar: string[]) => void;

  // Soru dağılımı
  setSoruDagilimi: (tip: keyof SinavAyarlari['soruDagilimi'], sayi: number) => void;

  // Üretilmiş sınav
  aktifSinav: Sinav | null;
  setAktifSinav: (sinav: Sinav | null) => void;

  // Generating state
  isGenerating: boolean;
  setIsGenerating: (isGenerating: boolean) => void;

  // Kaydedilmiş sınavlar
  kaydedilmisSinavlar: Sinav[];
  addKaydedilmisSinav: (sinav: Sinav) => void;

  // Reset
  reset: () => void;
}

const defaultAyarlar: SinavAyarlari = {
  sinif: null,
  secilenUniteler: [],
  secilenKazanimlar: [],
  soruDagilimi: {
    'coktan-secmeli': 2,
    'dogru-yanlis-duzeltme': 1,
    'bosluk-doldurma': 1,
    'acik-uclu': 0
  },
  zorlukDagilimi: {
    'Kolay': 2,
    'Orta': 2,
    'Zor': 0
  },
  ozelKonu: undefined
};

export const useSinavStore = create<SinavStoreState>((set) => ({
  ayarlar: defaultAyarlar,
  aktifSinav: null,
  isGenerating: false,
  kaydedilmisSinavlar: [],

  setAyarlar: (partial) =>
    set((state) => ({
      ayarlar: { ...state.ayarlar, ...partial }
    })),

  setSinif: (sinif) =>
    set((state) => ({
      ayarlar: {
        ...state.ayarlar,
        sinif,
        secilenUniteler: [],
        secilenKazanimlar: []
      }
    })),

  setSecilenUniteler: (uniteler) =>
    set((state) => ({
      ayarlar: { ...state.ayarlar, secilenUniteler: uniteler }
    })),

  setSecilenKazanimlar: (kazanimlar) =>
    set((state) => ({
      ayarlar: { ...state.ayarlar, secilenKazanimlar: kazanimlar }
    })),

  setSoruDagilimi: (tip, sayi) =>
    set((state) => ({
      ayarlar: {
        ...state.ayarlar,
        soruDagilimi: {
          ...state.ayarlar.soruDagilimi,
          [tip]: sayi
        }
      }
    })),

  setAktifSinav: (sinav) => set({ aktifSinav: sinav }),

  setIsGenerating: (isGenerating) => set({ isGenerating }),

  addKaydedilmisSinav: (sinav) =>
    set((state) => ({
      kaydedilmisSinavlar: [sinav, ...state.kaydedilmisSinavlar]
    })),

  reset: () =>
    set({
      ayarlar: defaultAyarlar,
      aktifSinav: null,
      isGenerating: false
    })
}));
```

---

## 📄 PDF Üretimi

### Tek PDF Yapısı (Sorular + Cevap Anahtarı)

```typescript
import jsPDF from 'jspdf';
import { Sinav } from '../types/sinav';

export const generateExamPDF = (sinav: Sinav): void => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const margin = 20;
  const pageWidth = 210;
  const contentWidth = pageWidth - 2 * margin;
  let yPos = margin;

  // Başlık
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text(sinav.baslik, margin, yPos);
  yPos += 10;

  // Sınav bilgileri
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Sınıf: ${sinav.sinif}`, margin, yPos);
  yPos += 6;
  doc.text(`Toplam Puan: ${sinav.toplamPuan}`, margin, yPos);
  yPos += 6;
  doc.text(`Tahmini Süre: ${Math.ceil(sinav.tahminiSure / 60)} dakika`, margin, yPos);
  yPos += 10;

  // Sorular
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('SORULAR', margin, yPos);
  yPos += 8;

  sinav.sorular.forEach((soru, index) => {
    // Sayfa sonu kontrolü
    if (yPos > 270) {
      doc.addPage();
      yPos = margin;
    }

    // Soru numarası ve metni
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.text(`${index + 1}. ${soru.soruMetni} (${soru.puan} puan)`, margin, yPos, {
      maxWidth: contentWidth
    });
    yPos += 8;

    // Seçenekler (çoktan seçmeli için)
    if (soru.tip === 'coktan-secmeli' && soru.secenekler) {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      soru.secenekler.forEach(secenek => {
        doc.text(secenek, margin + 5, yPos, { maxWidth: contentWidth - 5 });
        yPos += 6;
      });
    }

    // Kazanım kodu
    doc.setFontSize(8);
    doc.setTextColor(100);
    doc.text(`[${soru.kazanimKodu}]`, margin, yPos);
    doc.setTextColor(0);
    yPos += 10;
  });

  // Yeni sayfa: Cevap Anahtarı
  doc.addPage();
  yPos = margin;

  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('CEVAP ANAHTARI', margin, yPos);
  yPos += 10;

  // Cevaplar tablosu
  sinav.cevapAnahtari.sorular.forEach((cevap, index) => {
    if (yPos > 270) {
      doc.addPage();
      yPos = margin;
    }

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.text(
      `${cevap.soruNo}. ${cevap.dogruCevap} — ${cevap.puan} puan — ${cevap.kazanimKodu}`,
      margin,
      yPos
    );
    yPos += 7;
  });

  // Pedagojik Not (son sayfa)
  doc.addPage();
  yPos = margin;

  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('ÖĞRETMENİN DİKKATİNE', margin, yPos);
  yPos += 8;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  const splitNote = doc.splitTextToSize(sinav.pedagogicalNote, contentWidth);
  doc.text(splitNote, margin, yPos);

  // İndir
  doc.save(`${sinav.baslik}.pdf`);
};
```

---

## 🧪 Test Stratejisi

### 1. Vitest Unit Testleri

**`tests/sinavGenerator.test.ts`**

```typescript
import { describe, it, expect, vi } from 'vitest';
import { generateExam } from '../src/services/generators/sinavGenerator';
import { SinavAyarlari } from '../src/types/sinav';

describe('sinavGenerator', () => {
  it('should throw error if no kazanim selected', async () => {
    const settings: SinavAyarlari = {
      sinif: 5,
      secilenUniteler: [],
      secilenKazanimlar: [],
      soruDagilimi: {
        'coktan-secmeli': 2,
        'dogru-yanlis-duzeltme': 1,
        'bosluk-doldurma': 1,
        'acik-uclu': 0
      },
      zorlukDagilimi: { Kolay: 2, Orta: 2, Zor: 0 }
    };

    await expect(generateExam(settings)).rejects.toThrow('En az bir MEB kazanımı seçilmelidir.');
  });

  it('should enforce Başarı Anı Mimarisi (first 2 easy)', async () => {
    const settings: SinavAyarlari = {
      sinif: 5,
      secilenUniteler: ['unite-5-1'],
      secilenKazanimlar: ['T.5.3.1', 'T.5.3.2'],
      soruDagilimi: {
        'coktan-secmeli': 4,
        'dogru-yanlis-duzeltme': 0,
        'bosluk-doldurma': 0,
        'acik-uclu': 0
      },
      zorlukDagilimi: { Kolay: 2, Orta: 2, Zor: 0 }
    };

    const sinav = await generateExam(settings);

    expect(sinav.sorular[0].zorluk).toBe('Kolay');
    expect(sinav.sorular[1].zorluk).toBe('Kolay');
  });

  it('should include pedagogicalNote with min 100 chars', async () => {
    const settings: SinavAyarlari = {
      sinif: 5,
      secilenUniteler: ['unite-5-1'],
      secilenKazanimlar: ['T.5.3.1'],
      soruDagilimi: {
        'coktan-secmeli': 4,
        'dogru-yanlis-duzeltme': 0,
        'bosluk-doldurma': 0,
        'acik-uclu': 0
      },
      zorlukDagilimi: { Kolay: 2, Orta: 2, Zor: 0 }
    };

    const sinav = await generateExam(settings);

    expect(sinav.pedagogicalNote).toBeDefined();
    expect(sinav.pedagogicalNote.length).toBeGreaterThanOrEqual(100);
  });
});
```

### 2. Playwright E2E Test

**`tests/e2e/sinav-olusturma.spec.ts`**

```typescript
import { test, expect } from '@playwright/test';

test.describe('Sınav Stüdyosu', () => {
  test('should create exam with MEB kazanim selection flow', async ({ page }) => {
    await page.goto('http://localhost:5173');

    // Navigate to Sınav Stüdyosu
    await page.click('text=Sınav Stüdyosu');

    // Sınıf seç
    await page.selectOption('select[name="sinif"]', '5');

    // Ünite seç
    await page.check('input[value="unite-5-1"]');
    await page.check('input[value="unite-5-3"]');

    // Kazanım seç
    await page.check('input[value="T.5.3.1"]');
    await page.check('input[value="T.5.3.4"]');

    // Soru ayarları
    await page.fill('input[name="coktan-secmeli"]', '2');
    await page.fill('input[name="dogru-yanlis"]', '2');

    // Üret butonu
    await page.click('button:has-text("Sınav Oluştur")');

    // Loading spinner görünmeli
    await expect(page.locator('.loading-spinner')).toBeVisible();

    // Sınav önizleme yüklenmeli
    await expect(page.locator('.sinav-onizleme')).toBeVisible({ timeout: 15000 });

    // İlk 2 soru Kolay olmalı
    const firstQuestion = page.locator('.soru-card').first();
    await expect(firstQuestion.locator('.zorluk-badge')).toHaveText('Kolay');

    const secondQuestion = page.locator('.soru-card').nth(1);
    await expect(secondQuestion.locator('.zorluk-badge')).toHaveText('Kolay');

    // PDF indir butonu aktif olmalı
    await expect(page.locator('button:has-text("PDF İndir")')).toBeEnabled();
  });
});
```

---

## 📅 Uygulama Fazları

### Faz 1: Altyapı (2-3 gün)

- [ ] MEB kazanım veritabanı oluştur (`meb-turkce-kazanim.ts`)
  - 4., 5., 6., 7., 8., 9. sınıf kazanımları
- [ ] TypeScript tipleri oluştur (`src/types/sinav.ts`)
- [ ] Zustand store oluştur (`useSinavStore.ts`)
- [ ] `mebCurriculumService.ts` servisini yaz

### Faz 2: UI Bileşenleri (2-3 gün)

- [ ] `KazanimPicker.tsx` (cascading multi-select)
- [ ] `SoruAyarları.tsx`
- [ ] `SınavÖnizleme.tsx`
- [ ] `CevapAnahtarı.tsx`
- [ ] Ana container (`SınavStüdyosu/index.tsx`)

### Faz 3: AI Entegrasyonu (1-2 gün)

- [ ] `sinavGenerator.ts` prompt builder
- [ ] `api/generate-exam.ts` endpoint
- [ ] Rate limiting ekle
- [ ] Cache mekanizması (IndexedDB)

### Faz 4: PDF + İşlemler (1-2 gün)

- [ ] PDF generator (sorular + cevap anahtarı sıralı)
- [ ] Kaydet (Firestore)
- [ ] Paylaş (kullanıcılar arası)
- [ ] Çalışma kitabına ekle entegrasyonu

### Faz 5: Test + Optimizasyon (2 gün)

- [ ] Vitest unit testleri
- [ ] Playwright E2E testleri
- [ ] Performance profiling (Lighthouse)
- [ ] Uzman ajan son doğrulama

**Toplam Tahmini Süre:** 8-13 gün

---

## ✅ Kabul Kriterleri

### Pedagojik (Elif Yıldız)

- [ ] İlk 2 soru **mutlaka** Kolay
- [ ] Her sınav için `pedagogicalNote` mevcut (min 100 karakter)
- [ ] Sınıf seviyesi - kazanım uyumu doğru

### Klinik (Dr. Ahmet Kaya)

- [ ] MEB kazanım kodları doğru format (`T.X.Y.Z`)
- [ ] Tanı koyucu dil yok
- [ ] KVKK: Ad + sonuç birlikte görünmüyor

### Teknik (Bora Demir)

- [ ] TypeScript strict mode uyumlu
- [ ] `AppError` standardı kullanılmış
- [ ] Rate limiting aktif (10/saat, 30/gün)
- [ ] Defensive coding uygulanmış
- [ ] Testler yazılmış ve geçiyor

### AI Kalite (Selin Arslan)

- [ ] `gemini-2.5-flash` kullanılmış
- [ ] Batch mechanism (>10 soru için)
- [ ] Prompt injection koruması var
- [ ] JSON repair sistemi entegre
- [ ] Cache TTL 7 gün

---

## 🚀 Sonraki Adımlar

1. **Kullanıcı Onayı**: Bu tasarımın onaylanması
2. **MEB Veritabanı**: 4-9. sınıflar için tam kazanım veritabanı oluşturulması
3. **Faz 1 Başlangıcı**: Altyapı kurulumu
4. **Uzman Ajan İncelemesi**: Her faz sonunda ilgili uzman ajanın onayı

---

**Hazırlayan**: Claude Sonnet 4.5
**Tarih**: 2026-03-28
**Durum**: Tasarım Onayı Bekliyor

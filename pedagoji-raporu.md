# 🧠 Pedagojik Kalite Denetim Raporu

**Denetleyen:** Elif Yıldız — Baş Nöro-Pedagojik Tasarımcı
**Tarih:** 2026-06-24
**Kapsam:** OOGMATIK platformu — 7 dosya, 9 kontrol maddesi

---

## 🚨 KRİTİK BULGULAR

### K1. `pedagogicalNote` — Activity arayüzünde ve tüm statik aktivitelerde EKSİK
| Dosya | Satır | Şiddet |
|---|---|---|
| `src/types/activity.ts` | 270–280 | 🔴 KRİTİK |
| `src/constants.ts` | 12–408 | 🔴 KRİTİK |

**Tanı:** `Activity` arayüzü `pedagogicalNote` alanı içermiyor. Mevcut alanlar: `id`, `title`, `description`, `icon`, `defaultStyle?`, `promptId?`, `categories?`, `difficulty?`, `color?`. ACTIVITIES dizisindeki **56 statik aktivitenin hiçbirinde** `pedagogicalNote` yok.

AGENTS.md Kural #0 ("Her içerik gerçek bir çocuğa ulaşır. Hata toleransı = sıfır.") ve Elif Yıldız pedagoji protokolü doğrudan ihlal ediliyor.

AI prompt'larında `pedagogicalNote` isteniyor (`api/generate.ts:35`, `geminiClient.ts:144`) ancak TypeScript tip sistemi bunu zorunlu kılmıyor — derleme hatası vermez, unutulmaya müsaittir.

**Çözüm:**
```typescript
// src/types/activity.ts
export interface Activity {
  id: ActivityType;
  title: string;
  description: string;
  icon: string;
  pedagogicalNote: string;  // ✅ ZORUNLU — öğretmene "neden bu aktivite" açıklaması
  defaultStyle?: Record<string, unknown>;
  promptId?: string;
  categories?: string[];
  difficulty?: string;
  color?: string;
}
```
Ardından 56 aktivitenin her birine pedagojik gerekçe girilmeli.

---

### K2. İlk aktivite "Kolay" değil — güven inşası prensibi ihlali
| Dosya | Satır | Şiddet |
|---|---|---|
| `src/constants.ts` | 12–19 | 🔴 KRİTİK |

**Tanı:** İlk aktivite `FIND_LETTER_PAIR`'in `difficulty` tanımı **yok**. Sadece `HARF_BAGLAMA` (listenin sonu, satır 403) `difficulty: 'Kolay'` içeriyor. Öğrencinin güven inşası için ilk aktivitenin mutlaka Kolay seviyede olması gerekir.

**Çözüm:** Tüm aktivitelere `difficulty` atanmalı. İlk 3 aktivite (`FIND_LETTER_PAIR`, `READING_SUDOKU`, `SYLLABLE_MASTER_LAB`) en azından `'Başlangıç'` veya `'Kolay'` seviyesinde olmalı.

---

### K3. ZPD (Yakınsal Gelişim Alanı) matrisi tanımlı DEĞİL
| Dosya | Satır | Şiddet |
|---|---|---|
| `src/types/creativeStudio.ts` | 7 | 🔴 KRİTİK |
| `src/constants.ts` | 4–9 | 🔴 KRİTİK |

**Tanı:** `AgeGroup` ('5-7'|'8-10'|'11-13'|'14+') ile `DIFFICULTY_OPTIONS` ('Başlangıç'|'Orta'|'Zor'|'Uzman') arasında **hiçbir eşleme matrisi tanımlı değil**. AI prompt'larında ZPD uyarısı geçiyor (`geminiClient.ts:142`, `api/generate.ts:33`) ama yapısal bir veri modeli yok.

Her yaş grubunun erişebileceği zorluk seviyesi belirlenmemiş. Örneğin 5-7 yaş için "Uzman" seviye uygun mudur? Tanımlı değil.

**Çözüm:** Aşağıdaki ZPD matrisi `src/constants.ts` veya `creativeStudio.ts`'ye eklenmeli:
```typescript
export const ZPD_MATRIX: Record<AgeGroup, string[]> = {
  '5-7':  ['Başlangıç', 'Orta'],
  '8-10': ['Başlangıç', 'Orta', 'Zor'],
  '11-13': ['Orta', 'Zor', 'Uzman'],
  '14+':  ['Zor', 'Uzman'],
};
```

---

### K4. Aktivite türleri profil bazlı filtrelenemiyor
| Dosya | Satır | Şiddet |
|---|---|---|
| `src/constants.ts` | 12–408 | 🔴 KRİTİK |

**Tanı:** ACTIVITIES dizisindeki 56 aktivitenin hiçbirinde `targetProfile` (disleksi/DEHB/diskalkuli) etiketi yok. `creativeStudio.ts:5-6`'da `LearningDisabilityProfile` tipi tanımlı ama ACTIVITIES verisine bağlanmamış.

Karşılaştırma: `activityStudioLibrary.ts:28` `profiles: ['adhd', 'mixed']` — doğru yapı orada var. Ama ACTIVITIES dizisi bu yapıyı kullanmıyor.

**Çözüm:** `Activity` arayüzüne `targetProfile?: LearningDisabilityProfile[]` eklenmeli. Mevcut aktiviteler profil bazında etiketlenmeli.

---

### K5. Undo/Redo geçmişi persist edilmiyor
| Dosya | Satır | Şiddet |
|---|---|---|
| `src/store/useFascicleStore.ts` | 176–184 | 🟠 YÜKSEK |

**Tanı:** `partialize` fonksiyonu sadece `currentFascicleId`, `metadata`, `items` alanlarını localStorage'a kaydediyor. `past` ve `future` dizileri **kaydedilmiyor**. Sayfa yenilemesinde undo/redo geçmişi tamamen kaybolur — pedagojik akış bütünlüğü bozulur.

**Çözüm:** `partialize`'a `past` ve `future` eklenmeli veya en azından sessionStorage'a yazılmalı.

---

## ⚠️ ORTA BULGULAR

### O1. FascicleTemplatesModal şablon içerikleri placeholder
| Dosya | Satır | Şiddet |
|---|---|---|
| `FascicleTemplatesModal.tsx` | 47–51 | 🟡 ORTA |

**Tanı:** 4 şablon (disleksi, DEHB, diskalkuli, LGS) tanımlanmış ancak `handleApplyTemplate` yalnızca toast mesajı gösteriyor. Gerçek içerik yüklenmiyor, ZPD eşlemesi yok, `pedagogicalNote` yok, difficulty gradient yok.

Şablonların başlık/açıklamaları klinik olarak doğru yönde ancak içerik boşluğu pedagojik kullanımı engelliyor.

**Çözüm:** Her şablona sabit bir aktivite listesi + `pedagogicalNote` + ZPD seviyesi eklenmeli.

### O2. CoverPage renk psikolojisi belgelenmemiş
| Dosya | Satır | Şiddet |
|---|---|---|
| `FascicleCoverPage.tsx` | 15–38 | 🟡 ORTA |

**Tanı:** `playful`, `elegant`, `geometric`, `modern` temaları ve 6 renk seçeneği mevcut. Seçimler pedagojik olarak makul (pastel tonlar, yüksek kontrast) ancak hangi profil için hangi rengin neden uygun olduğu belgelenmemiş. Örneğin DEHB için mavi/indigo sakinleştirici etki, disleksi için yüksek kontrastlı krem zemin.

**Çözüm:** Her temanın altına pedagojik gerekçe yorumu eklenmeli veya kullanıcıya profil bazında öneri sunulmalı.

### O3. useWorksheets.ts — pedagogik doğrulama yok
| Dosya | Satır | Şiddet |
|---|---|---|
| `src/hooks/useWorksheets.ts` | 156–164 | 🟡 ORTA |

**Tanı:** `useCreateWorksheet` ve `useUpdateWorksheet` işlemlerinde `pedagogicalNote` zorunluluğu kontrol edilmiyor. Herhangi bir pedagojik doğrulama yok.

**Çözüm:** API çağrısı öncesi `pedagogicalNote` kontrolü eklenmeli.

---

## ✅ OLUMLU TESPİTLER

| # | Tespit | Dosya | Satır |
|---|---|---|---|
| ✅1 | AI prompt'larında `pedagogicalNote` zorunluluğu tanımlanmış | `api/generate.ts` | 35 |
| ✅2 | AI prompt'larında ZPD uyumu açıkça belirtilmiş | `api/generate.ts` | 33 |
| ✅3 | Aktif öğrenci bağlamında pedagogicalNote talimatı var | `geminiClient.ts` | 144 |
| ✅4 | Lexend font CoverPage'de kullanılıyor | `FascicleCoverPage.tsx` | 92 |
| ✅5 | `LearningDisabilityProfile` tipi doğru tanımlanmış | `creativeStudio.ts` | 5 |
| ✅6 | `AgeGroup` tipi doğru aralıklarla tanımlanmış | `creativeStudio.ts` | 7 |
| ✅7 | `ClinicalTemplate` ve `TargetProfile` yapısal olarak doğru | `creativeStudio.ts` | 26–44 |
| ✅8 | Undo/Redo state yönetimi (past/future push/pop) doğru çalışıyor | `useFascicleStore.ts` | 136–164 |
| ✅9 | `activityStudioLibrary.ts`'de `profiles` + `ageGroups` + `difficultyLevels` doğru etiketlenmiş | `activityStudioLibrary.ts` | 28–29 |
| ✅10 | Test dosyalarında `pedagogicalNote` kontrolü mevcut | `tests/TemplateEngine.test.ts` | 147, 157 |
| ✅11 | AI üretiminde tanı koyucu dil yasağı prompt'ta belirtilmiş | `geminiClient.ts` | 143 |
| ✅12 | CoverPage'de 4 farklı tema ile renk psikolojisi çeşitliliği sağlanmış | `FascicleCoverPage.tsx` | 15–27 |

---

## 📈 İSTATİSTİKLER

| Metrik | Değer |
|---|---|
| Toplam ActivityType enum değeri | 268 |
| ACTIVITIES dizisindeki statik aktivite | 56 |
| `pedagogicalNote` içeren statik aktivite | **0** (%0) |
| `difficulty` tanımı olan statik aktivite | **1** (%1.78) — sadece `HARF_BAGLAMA` |
| `targetProfile` etiketi olan statik aktivite | **0** (%0) |
| KRİTİK bulgu sayısı | 5 |
| ORTA bulgu sayısı | 3 |
| OLUMLU tespit sayısı | 12 |

---

## 🎯 ÖNCELİKLİ EYLEMLER

| Öncelik | Eylem | Sorumlu | Tahmini Süre |
|---|---|---|---|
| P0 | `Activity` arayüzüne `pedagogicalNote: string` ekle — tüm 56 aktiviteyi doldur | Elif Yıldız + ContentAgent | 4 saat |
| P0 | `difficulty` alanını tüm aktivitelere ekle — ilk 3 aktivite "Kolay"/"Başlangıç" | Elif Yıldız | 1 saat |
| P0 | ZPD matrisi (`AgeGroup` × `difficulty`) tanımla — `creativeStudio.ts` veya yeni dosya | Elif Yıldız | 30 dk |
| P0 | `targetProfile` alanını `Activity`'ye ekle — 56 aktiviteyi profil bazında etiketle | Elif Yıldız | 2 saat |
| P1 | useFascicleStore persist config'ine `past`/`future` ekle | Bora Demir | 15 dk |
| P1 | FascicleTemplatesModal şablonlarını gerçek içerikle doldur | ContentAgent | 3 saat |
| P2 | CoverPage renk temalarına pedagojik açıklama ekle | Elif Yıldız | 30 dk |
| P2 | useCreateWorksheet/useUpdateWorksheet'e `pedagogicalNote` validasyonu ekle | Bora Demir | 20 dk |

---

**Not:** `activityStudioLibrary.ts` dosyasındaki veri yapısı (`profiles`, `ageGroups`, `difficultyLevels`) doğru tasarlanmış. Bu yapının `ACTIVITIES` dizisine (veya tüm platforma) yaygınlaştırılması önerilir.

**Sonuç:** Platformun AI üretim motoru (prompt seviyesi) pedagojik olarak doğru yönlendirilmiş ancak **statik veri katmanı** (Activity arayüzü, ACTIVITIES dizisi) AGENTS.md'de tanımlı pedagojik standartları karşılamıyor. Tip sistemi güçlendirilmeli, tüm statik aktiviteler `pedagogicalNote` ile zenginleştirilmeli ve ZPD matrisi oluşturulmalıdır.

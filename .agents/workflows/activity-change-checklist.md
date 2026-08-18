---
description: Bir etkinlik modülünde değişiklik yapılırken uyulması ZORUNLU olan tam kapsamlı kontrol listesi
---

# Etkinlik Değişikliği Tam Kapsamlı Kontrol Listesi (v2)

> **MUTLAK KURAL**: Bir etkinlik üzerinde herhangi bir değişiklik (yeni oluşturma, silme, yeniden yazma, ayar ekleme, jeneratör düzeltme vb.) istendiğinde aşağıdaki **TÜM** noktalar **TEK SEFERDE VE EKSİKSİZ** olarak güncellenmelidir. Parça parça güncelleme **YASAKTIR**. Tek commit, tek PR, tek iş.

---

## BÖLÜM A — ZORUNLU GÜNCELLEME NOKTALARI (10 Dosya/Alan)

### A1. Offline Jeneratör (Hızlı Mod)
- **Dosya**: `src/services/offlineGenerators/<etkinlikAdi>.ts`
- **İşlem**: Yeni/güncellenmiş deterministic jeneratör fonksiyonunu yaz veya sil
- **Kurallar**:
  - ❌ `while(true)` veya koşulsuz sonsuz döngü YASAK. Her döngüde `safetyCounter` (max 50) olmalı.
  - ✅ `getRandomInt()` veya `shuffle()` yardımcı fonksiyonları `helpers.ts`'den import edilmeli.
  - ✅ Her soru/puzzle için **tek doğru cevap** garanti edilmeli (`answer` alanı zorunlu).
  - ✅ Üretilen veri, Sheet bileşeninin beklediği interface ile %100 uyumlu olmalı.

### A2. AI Jeneratör (AI Modu)
- **Dosya**: `src/services/generators/<etkinlikAdi>.ts` veya ilgili AI dosyası
- **İşlem**: AI prompt fonksiyonunu güncelle (yoksa `withAI()` fallback kullanılabilir)
- **Kurallar**:
  - ✅ Prompt, `pedagogicalNote` alanını zorunlu olarak ürettirmeli.
  - ✅ JSON çıktı şeması, offline jeneratörün döndürdüğü yapıyla uyumlu olmalı.

### A3. Offline Generators Barrel Export
- **Dosya**: `src/services/offlineGenerators/index.ts`
- **İşlem**: Yeni fonksiyonu `export * from './<etkinlikAdi>';` ile dışarı aç. Eski/silinen fonksiyonun export satırını kaldır.

### A4. Generator Registry (Offline + AI Bağlantısı)
- **Dosya**: `src/services/generators/registry.ts`
- **İşlem**: `ActivityType.XXX` için `offline:` ve `ai:` fonksiyonlarını güncelle
- **Kurallar**:
  - ❌ `withOffline(ActivityType.XXX)` şeklinde boş/dummy bağlantı bırakma. Gerçek fonksiyon bağla.
  - ✅ Hem `ai:` hem `offline:` alanları dolu olmalı.
  - ✅ Eski fonksiyon adı kalmışsa yenisiyle değiştir (ör: `generateOfflineNumberLogicRiddles` → `generateOfflineGizemliSayilar`)

### A5. Sheet Bileşeni (A4 Çalışma Kâğıdı — ULTRA-PREMIUM STANDART)
- **Dosya**: `src/components/sheets/<kategori>/<EtkinlikAdi>Sheet.tsx`
- **İşlem**: Yeni/güncellenmiş Sheet bileşenini yaz veya sil
- **⚠️ KRİTİK: A4 ÇIKTI STANDARTLARI (Aşağıdaki BÖLÜM B'ye bak)**
- **Kurallar**:
  - ✅ Bileşen `React.FC<XxxSheetProps>` formatında export edilmeli.
  - ✅ `data` prop'u jeneratörün döndürdüğü veri yapısıyla tam uyumlu olmalı.
  - ✅ `settings` prop'u opsiyonel olarak kabul edilmeli.

### A6. Ana SheetRenderer — ÜST SEVİYE YÖNLENDIRME (EN KRİTİK!)
- **Dosya**: `src/components/SheetRenderer.tsx`
- **İşlem**: Aşağıdaki iki adımı MUTLAKA yap:
  1. Dosyanın **import bölümüne** yeni Sheet bileşeninin importunu ekle.
  2. Dosyanın **render koşulları bölümüne** `if (activityType === ActivityType.XXX) { return withWrapper(<XxxSheet ... />) }` bloğunu ekle.
- **⚠️ BU ADIM ATLANIRSA EKRANDA HİÇBİR ŞEY GÖRÜNMEZ! Bu hata daha önce defalarca yaşandı.**

### A7. LegacyRenderer (Yedek Yönlendirme)
- **Dosya**: `src/components/SheetRenderer/LegacyRenderer.tsx`
- **İşlem**: İlgili `case` bloğunu güncelle/ekle. Eski Sheet bileşeninin importunu kaldır.

### A8. Activity Config Paneli (Özelleştirme Ayarları)
- **Dosya**: `src/components/activity-configs/<EtkinlikAdi>Config.tsx`
- **İşlem**: Yeni/güncellenmiş ayar panelini yaz veya sil
- **Kurallar**:
  - ✅ Proje standardı: `interface XxxConfigProps { settings: GeneratorOptions; onChange: (s: GeneratorOptions) => void; }`
  - ✅ En az şu ayarlar bulunmalı: **Zorluk Seviyesi** (Kolay/Orta/Zor), **Soru Adedi** (itemCount)
  - ✅ Etkinliğe özgü parametreler: sayı aralığı, ızgara boyutu, ipucu sayısı, ikon gösterimi vb.
  - ✅ `customSettings` nesnesi üzerinden jeneratöre iletilmeli.

### A9. Activity Config Registry
- **Dosya**: `src/components/activity-configs/index.ts`
- **İşlem**:
  1. Yeni config bileşeninin **import** satırını ekle.
  2. `ActivityConfigRegistry` nesnesinde `[ActivityType.XXX]: XxxConfig` eşleştirmesini ekle.
  3. Eski/silinen config bileşeninin import satırını ve eşleştirmesini kaldır.

### A10. Eski Kod Temizliği (Dead Code Elimination)
- **İşlem**: Aşağıdaki tüm kalıntıları tek seferde temizle:
  - Eski jeneratör fonksiyonları (başka dosyalardaki — ör: `mathLogic.ts` içindeki eski fonksiyon)
  - Eski Sheet bileşen dosyaları (ör: `NumberLogicRiddleSheet.tsx`)
  - Eski Config bileşen dosyaları (ör: `MathLogicRiddleConfig.tsx`)
  - Tüm ölü import satırları (kullanılmayan importlar)
  - Eski tip tanımları (artık referans edilmeyen interface'ler)
- **Doğrulama**: `grep -r "ESKİ_FONKSİYON_ADI" src/` ile sıfır sonuç döndüğünü garanti et.

---

## BÖLÜM B — A4 ÇIKTI ULTRA-PREMIUM TASARIM STANDARTLARI

> Her Sheet bileşeni aşağıdaki standartlara **ZORUNLU** olarak uymalıdır. Bu standartlar, A4 kâğıda yazdırıldığında profesyonel, kompakt ve disleksi dostu bir çıktı garantisi içindir.

### B1. Genel Yapısal Kurallar
- **Font**: `Lexend` (içerik) — ASLA değiştirme. Admin-only alanlar `Inter` kullanabilir.
- **Kâğıt Boyutu**: 210mm x 297mm (A4) — `overflow: hidden` ile taşma engellenir.
- **Minimum Doluluk**: Sayfanın en az **%85'i** içerikle dolu olmalı. Boş alan oranı **%15'i geçmemeli**.
- **Padding**: Sayfa kenarları max `padding: 1.5rem` (24px). Daha fazla padding YASAK.
- **Gap/Boşluk**: Sorular arası `gap: 0.5rem` (8px). Daha fazla boşluk YASAK.

### B2. Başlık ve Üst Alan (Header)
- **Renk Şeridi**: Sayfanın en üstünde 4px yüksekliğinde tematik renk şeridi
- **İkon + Başlık**: Sol tarafta 48px tematik ikon kutusu + sağında başlık ve açıklama
- **Başlık Fontu**: `text-xl font-bold` (max 24px). Daha büyük font YASAK.
- **Açıklama Fontu**: `text-sm text-gray-500` (max 14px)
- **Toplam Yükseklik**: Header bloğu max 80px. Üst alan sayfanın %10'unu geçmemeli.

### B3. İçerik Alanı (Sorular/Puzzles)
- **Grid Sistemi**: 1 veya 2 sütunlu grid (etkinliğe göre). `grid-cols-1` veya `grid-cols-2`.
- **Soru Kartları**: Her soru kartı `rounded-lg border p-3` ile çerçevelenmeli.
- **Soru Numaralandırma**: Her soruda sol üstte kompakt numara rozeti (`w-6 h-6 rounded-full bg-X text-white text-xs font-bold`)
- **Font Boyutları**:
  - Soru metni: `text-sm` (14px) — daha büyük YASAK
  - İpucu/açıklama: `text-xs` (12px)
  - Cevap kutucukları: `text-base` (16px)
- **Cevap Alanları**: Boş kutucuklar (`border-b-2 border-dashed`) veya çoktan seçmeli seçenekler
- **İkon Kullanımı**: Her ipucunda/soruda küçük FontAwesome ikonu (`text-xs` veya `text-sm`)

### B4. Alt Alan (Footer — Klinik Bilgi Şeridi)
- **Yükseklik**: Max 40px, sayfanın en altında.
- **İçerik**: `Tarih: ___/___/___` · `Süre: ___dk` · `Puan: ___` — tek satırda sığmalı.
- **Stil**: `text-[10px] text-gray-400 border-t border-gray-100`
- **pedagogicalNote**: Öğretmen için gizli not (yazdırılabilir ama öğrenci tarafından değil)

### B5. Yazdırma Uyumu (Print)
- `@media print` kuralları Sheet içinde tanımlı olmalı veya global `print.css` tarafından kapsanmalı.
- `page-break-inside: avoid` her soru bloğu için geçerli.
- `box-shadow`, `hover efektleri` ve `animasyonlar` print'te GÖRÜNMEMELİ.

### B6. Renk Paleti (Kategori Bazlı)
| Kategori | Birincil Renk | Arka Plan |
|---|---|---|
| Matematik & Mantık | `indigo-600` | `indigo-50` |
| Okuma & Dil | `emerald-600` | `emerald-50` |
| Görsel Algı | `teal-600` | `teal-50` |
| Hafıza & Dikkat | `purple-600` | `purple-50` |
| Hikaye & Sözel | `amber-600` | `amber-50` |
| Değerlendirme | `rose-600` | `rose-50` |

---

## BÖLÜM C — JENERATÖRLERİN VERİ YAPISI STANDARTLARI

> Her jeneratör (offline + AI), Sheet bileşeninin render edebileceği **tutarlı bir veri yapısı** döndürmelidir.

### C1. Zorunlu Üst-Düzey Alanlar
```typescript
interface WorksheetData {
  title: string;              // Etkinlik başlığı
  instruction: string;        // Öğrenciye yönerge
  puzzles: PuzzleItem[];      // Ana soru/puzzle dizisi
  difficulty: string;         // 'Kolay' | 'Orta' | 'Zor'
  pedagogicalNote?: string;   // Öğretmen notu (ZORUNLU - AI modda)
  settings?: Record<string, unknown>; // Kullanıcı ayarları
}
```

### C2. Her Soru/Puzzle İçin Zorunlu Alanlar
```typescript
interface PuzzleItem {
  id: string;                 // Benzersiz ID
  answer: string | number;    // TEK DOĞRU CEVAP (çoktan seçmelide doğru şık)
  options?: (string | number)[]; // Çoktan seçmeli ise seçenekler (karıştırılmış)
  // ... etkinliğe özgü alanlar
}
```

### C3. Veri-UI Uyumluluk Kuralı
- Jeneratörün döndürdüğü her alan, Sheet bileşeninde **kullanılmalı**. Kullanılmayan alan üretme.
- Sheet bileşeninin beklediği her alan, jeneratör tarafından **üretilmeli**. Eksik alan bırakma.
- Her iki tarafı da yazarken diğer tarafı kontrol et.

---

## BÖLÜM D — DOĞRULAMA ADIMLARI (Her Değişiklik Sonrası)

// turbo-all

1. **TypeScript Doğrulama**: `npx tsc --noEmit` — Sıfır tip hatası
2. **Ölü Referans Tarama**: `grep -r "ESKİ_FONKSİYON_ADI" src/` — Sıfır sonuç
3. **Ölü Import Tarama**: Değiştirilen her dosyada kullanılmayan import var mı kontrol et
4. **Jeneratör-Sheet Uyumu**: Jeneratörün ürettiği veriyi Sheet bileşenine elle geçir ve render et (zihinsel test)
5. **Git Push**: `git add . && git commit -m "feat/fix(etkinlik-adi): açıklama" && git push origin main`

---

## BÖLÜM E — MUTLAK YASAKLAR

- ❌ **Parça parça güncelleme** — Birden fazla commit'e bölme YASAK
- ❌ **Eski dosyaları silmeden yeni dosya oluşturma**
- ❌ **SheetRenderer.tsx'i atlamak** — Bu en kritik bağlantı noktası
- ❌ **Registry bağlantısını (registry.ts) güncellememek**
- ❌ **Config panelini (activity-configs/index.ts) unutmak**
- ❌ **withOffline() dummy kancasını** gerçek jeneratör yerine bırakmak
- ❌ **A4 sayfasının %50+'sını boş bırakmak** — Minimum %85 doluluk zorunlu
- ❌ **Lexend dışında font kullanmak** (içerik alanında)
- ❌ **Sonsuz döngü riski** olan jeneratör yazmak
- ❌ **Cevapsız soru üretmek** — Her puzzle'da `answer` alanı ZORUNLU
- ❌ **`any` tipi kullanmak** — `unknown` + type guard tercih et (mümkün olduğunca)

---

## ÖZET: TEK SEFERDE DOKUNULACAK DOSYA LİSTESİ

```
□ src/services/offlineGenerators/<etkinlik>.ts        → Offline jeneratör
□ src/services/offlineGenerators/index.ts             → Barrel export
□ src/services/generators/registry.ts                 → Registry bağlantısı
□ src/services/generators/<etkinlik>.ts               → AI jeneratör (varsa)
□ src/components/sheets/<kat>/<Etkinlik>Sheet.tsx      → A4 Sheet bileşeni
□ src/components/SheetRenderer.tsx                    → Ana yönlendirme (import + if bloğu)
□ src/components/SheetRenderer/LegacyRenderer.tsx     → Yedek yönlendirme
□ src/components/activity-configs/<Etkinlik>Config.tsx → Ayar paneli
□ src/components/activity-configs/index.ts            → Config registry
□ Eski dosyalar ve ölü importlar                      → Temizlik
```

**Bu listedeki HER MADDE tek commit'te tamamlanmalı. Eksik bırakılan her nokta = kullanıcının ekranında kırık/boş/donmuş etkinlik.**

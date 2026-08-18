---
description: Stüdyo modüllerinde (MathStudio, ReadingStudio, CreativeStudio, A4Editor, UniversalStudio, SariKitap, InfographicStudio vb.) değişiklik yapılırken uyulması ZORUNLU olan tam kapsamlı kontrol listesi
---

# Stüdyo Modülü Değişikliği Tam Kapsamlı Kontrol Listesi

> **MUTLAK KURAL**: Bir stüdyo modülünde değişiklik yapıldığında aşağıdaki TÜM noktalar **TEK SEFERDE VE EKSİKSİZ** güncellenmelidir. Stüdyolar, etkinliklerden farklı olarak kendi iç state yönetimi, özel editör panelleri ve karmaşık bileşen ağacına sahiptir.

---

## Stüdyo Listesi ve Dosya Haritası

| Stüdyo | Ana Dizin | Store | Renderer |
|---|---|---|---|
| MathStudio | `components/MathStudio/` | `store/useAppStore.ts` | `SheetRenderer → MathStudioRenderer` |
| ReadingStudio | `components/ReadingStudio/` | `store/useReadingStore.ts` | `SheetRenderer → ReadingStudioContentRenderer` |
| CreativeStudio | `components/CreativeStudio/` | `store/useCreativeStore.ts` | Kendi iç renderer'ı |
| A4Editor | `components/A4Editor/` | `store/useA4EditorStore.ts` | Kendi iç canvas'ı |
| UniversalStudio | `components/UniversalStudio/` | `store/useUIStore.ts` | `UniversalCanvas` |
| SariKitap | `services/generators/sariKitap/` | — | `SheetRenderer → SariKitapRenderer` |
| InfographicStudio | `components/sheet-renderers/` | — | `SheetRenderer → InfographicRenderer` |

---

## BÖLÜM A — ZORUNLU GÜNCELLEME NOKTALARI (7 Alan)

### A1. Stüdyo Ana Bileşeni
- **Dosya**: `src/components/<StudioName>/<StudioName>.tsx`
- **Kurallar**:
  - ✅ Bileşen, kendi Zustand store'undan state almalı (doğrudan prop drilling YASAK).
  - ✅ React.memo veya useMemo ile gereksiz re-render önlenmeli.
  - ✅ Stüdyo sekmeleri/panelleri lazy-load ile yüklenmeli (büyük bileşenler için).

### A2. Zustand Store (State Yönetimi)
- **Dosya**: `src/store/use<StudioName>Store.ts`
- **Kurallar**:
  - ✅ Store, stüdyonun tüm geçici ve kalıcı state'ini yönetmeli.
  - ✅ `persist` middleware **sadece** kullanıcı tercihleri için kullanılmalı (büyük data persist YASAK).
  - ❌ Store içinde API çağrısı YASAK — servis katmanına delege et.
  - ✅ Store action'ları TypeScript ile tam tiplenmiş olmalı (`any` YASAK).

### A3. Stüdyo Alt Bileşenleri (Paneller, Editörler, Toolbar)
- **Dosyalar**: `src/components/<StudioName>/panels/`, `hooks/`, `components/`
- **Kurallar**:
  - ✅ Her panel/alt bileşen, kendi sorumluluğuna odaklanmalı (Single Responsibility).
  - ✅ Stüdyoya özel hooks `<StudioName>/hooks/` dizininde tutulmalı.
  - ✅ Stüdyo içi ortak yardımcı fonksiyonlar `<StudioName>/utils/` dizininde tutulmalı.

### A4. Stüdyo Renderer (Çıktı Gösterimi)
- **Dosya**: `src/components/sheet-renderers/<StudioName>Renderer.tsx`
- **Kurallar**:
  - ✅ Renderer, stüdyonun ürettiği veriyi A4 formatında göstermeli.
  - ✅ `SheetRenderer.tsx` içindeki `if (activityType === ActivityType.XXX_STUDIO)` koşulu güncel olmalı.
  - ✅ A4 çıktı standartları (`activity-change-checklist.md` BÖLÜM B) burada da geçerli.

### A5. Stüdyo → SheetRenderer Bağlantısı
- **Dosya**: `src/components/SheetRenderer.tsx`
- **İşlem**: Stüdyo renderer'ının import'unu ve `if` koşulunu kontrol et/güncelle.
- **⚠️ Bu adım atlanırsa stüdyonun ürettiği içerik ekranda görünmez!**

### A6. Stüdyo Navigasyon/Menü Bağlantısı
- **Dosyalar**:
  - `src/components/Sidebar.tsx` veya menü yapısı
  - `src/hooks/useNavigationLogic.ts`
  - `src/store/useAppStore.ts` (currentView state)
- **Kurallar**:
  - ✅ Menüde stüdyonun tıklanabilir girişi olmalı.
  - ✅ `currentView` state'inde stüdyoya geçiş tanımlı olmalı.
  - ✅ Sidebar ikonları ve etiketleri güncel olmalı.

### A7. Stüdyo Servis Katmanı
- **Dosyalar**: `src/services/` altındaki ilgili servisler
- **Kurallar**:
  - ✅ Stüdyo, AI üretimi için `aiContentService.ts` veya kendi servisini kullanmalı.
  - ✅ Kaydetme/yükleme işlemleri `worksheetService.ts` veya `cacheService.ts` üzerinden.
  - ✅ Hata yönetimi `AppError` standardında, `retryWithBackoff()` ile sarmalanmalı.

---

## BÖLÜM B — STÜDYO TASARIM STANDARTLARI

### B1. Genel UI Kuralları
- **Tema**: Dark Glassmorphism (stüdyo panelleri) + Beyaz A4 Canvas (çıktı alanı)
- **Layout**: Sol panel (ayarlar) + Orta alan (canvas/editör) + Sağ panel (özellikler) — 3 kolon yapı
- **Font**: `Inter` (stüdyo UI) + `Lexend` (çıktı/içerik alanı)
- **Responsive**: Tablet ve desktop desteklenmeli. Mobilde basitleştirilmiş tek kolon görünüm.

### B2. Stüdyo Toolbar
- ✅ Üst kısımda: Kaydet, Dışa Aktar (PDF), Yazdır, Geri Al/İleri Al butonları
- ✅ Her buton `tooltip` içermeli
- ✅ Kısayol tuşları tanımlı olmalı (Ctrl+S, Ctrl+Z vb.)

### B3. A4 Canvas Çıktısı
- Activity-change-checklist.md BÖLÜM B (Ultra-Premium A4 Standartları) burada da geçerli.
- Ek olarak: Canvas, kullanıcı eklediği bileşenleri (metin, görsel, tablo vb.) serbest sürükle-bırak ile konumlandırabilmeli.

---

## BÖLÜM C — DOĞRULAMA ADIMLARI

// turbo-all

1. **TypeScript Doğrulama**: `npx tsc --noEmit` — Sıfır tip hatası
2. **Store Tutarlılığı**: Store'dan okunan her alan, stüdyo UI'da kullanılıyor mu kontrol et
3. **Renderer Uyumu**: Stüdyo → Renderer → SheetRenderer zinciri kırık mı kontrol et
4. **Menü Bağlantısı**: Sidebar'dan tıklayınca stüdyo açılıyor mu kontrol et
5. **Git Push**: `git add . && git commit -m "feat/fix(studio-adi): açıklama" && git push origin main`

---

## BÖLÜM D — MUTLAK YASAKLAR

- ❌ Store içinde API çağrısı yapmak
- ❌ Stüdyo bileşeninde prop drilling (5+ seviye)
- ❌ Büyük veriyi (canvas data) Zustand persist'e yazmak
- ❌ Stüdyo renderer'ını SheetRenderer.tsx'e bağlamamak
- ❌ Menü/navigasyon bağlantısını unutmak
- ❌ `console.log` kullanmak — `logError()` kullan
- ❌ `any` tipi kullanmak — `unknown` + type guard
- ❌ Lexend fontunu stüdyo UI panellerinde kullanmak (sadece içerik/çıktı alanında)

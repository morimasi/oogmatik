# OOGMATIK — UI/UX Denetim Raporu

**Denetçi:** Caner Tekin (UI/UX Stratejist)
**Tarih:** 24.06.2026
**Kapsam:** God Components, Tema Uyumu, Erişilebilirlik, Studio UX Akışı, Kod Kalitesi

---

## 1. GOD COMPONENT ANALİZİ — Parçalanma Aciliyeti

| Dosya | Satır | Boyut | Parçalanma Önerisi |
|-------|-------|-------|-------------------|
| `src/components/CurriculumView.tsx` | 933 | 69.5KB | **→ 6-8 alt bileşen** |
| `src/components/SheetRenderer.tsx` | 1,377 | 58.4KB | **→ 5 alt bileşen (kuşaklı)** |
| `src/components/OCRScanner.tsx` | 1,227 | 57.2KB | **→ 5 alt bileşen** |
| `src/components/MatSinavStudyosu/index.tsx` | 677 | 49.3KB | → 4 alt bileşen |
| `src/components/SinavStudyosu/index.tsx` | 636 | 37.7KB | → 3 alt bileşen |
| `src/components/AssessmentModule.tsx` | 527 | 34.7KB | → 3 alt bileşen |
| `src/components/AdminDashboard/PermissionsIDE.tsx` | 486 | 27.7KB | → 2 alt bileşen |
| `src/components/AdminPermissionsIDE.tsx` | 302 | 15.4KB | Legacy (M1) |

### CurriculumView (69.5KB) — En Kritik God Component
**Mevcut yapı:** Tek bir `renderWizard()` fonksiyonu içinde 4 farklı adım render'ı (`case 0`, `case 1`, `case 4`, `default`) + inline `DayCard` alt bileşeni.

**Önerilen bölünme:**
1. `CurriculumWizardStep0.tsx` — Yeni plan formu + plan kütüphanesi (347 satır)
2. `CurriculumWizardStep1.tsx` — Akademik profil özeti + klinik tarama bulguları (58 satır)
3. `CurriculumPlanView.tsx` — Ana plan görünümü + goals + notes (140+ satır)
4. `DayCard.tsx` — Ayrı dosyaya çıkarılmalı (mevcut inline, ~121 satır)
5. `CurriculumHeader.tsx` — Header toolbar (43 satır)
6. `CurriculumGoalsEditor.tsx` — Hedef düzenleme paneli
7. `useCurriculumState.ts` — Hook: 19 state değişkeni → hook'a taşınmalı

### SheetRenderer (58.4KB) — Kuşaklanmış Fakat Hâlâ Büyük
- `@ts-nocheck` var (satır 1) — type safety tamamen devre dışı
- 170+ import, ~50 `ActivityType` case handler
- `UnifiedContentRenderer` (~200 satır) ve `SortableBlockItem` ayrılabilir
- Legacy renderer switch bloğu (~300 satır) ayrı bir `LegacyRenderer.tsx`'e taşınmalı

### OCRScanner (57.2KB)
- İç içe 5 adım (`'upload' | 'analyzing' | 'studio' | 'generating' | 'result' | 'creative' | 'variations'`)
- `Toast`, `ProgressTracker`, `StudentSelector`, `DifficultyPicker`, `convertPDFToImages` tümü inline
- **Öneri:** Her adım ayrı dosyaya + `useOCRScanner.ts` hook

---

## 2. STÜDYO RENDER BLOĞU (M5) — App.tsx:588-736

**Mevcut:** 148 satırlık `if/else if` zinciri ile 14 stüdyo render'ı.

**Öneri:** `StudioRenderer.tsx` bileşenine taşı:
```tsx
// StudioRenderer.tsx
const STUDIO_VIEWS = {
  curriculum: CurriculumView,
  'reading-studio': ReadingStudio,
  'math-studio': MathStudio,
  // ...13 tane daha
};

export const StudioRenderer = ({ currentView, studioData, ... }) => (
  <AnimatePresence mode="wait">
    {STUDIO_VIEWS[currentView] && (
      <motion.div ...>
        <Suspense fallback={<LoadingSpinner />}>
          <ProtectedRoute module={MODULE_MAP[currentView]}>
            <ViewComponent ... />
          </ProtectedRoute>
        </Suspense>
      </motion.div>
    )}
  </AnimatePresence>
);
```

**Avantaj:** App.tsx 148 → 3 satıra iner, yeni stüdyo eklemek tek satır.

---

## 3. TEMA UYUMU

### Durum: ✅ İyi — Fakat Kesikli Kullanım Var

**CSS Variable ile çalışanlar** — doğru:
- `CurriculumView.tsx` (satır 922): `bg-[var(--bg-primary)]`, `border-[var(--border-color)]`
- `MatSinavStudyosu/index.tsx`: `bg-[var(--bg-secondary)]`, `text-[var(--text-primary)]`
- `SinavStudyosu/index.tsx`: Tutarlı CSS variable kullanımı
- `FascicleStudio/index.tsx`: `var(--bg-primary)`, `var(--border-color)`, `var(--accent-color)`

**Sabit renk kullananlar** — **tema kırılması riski:**
- `AssessmentModule.tsx`: Sabit `bg-zinc-900`, `text-white`, `bg-zinc-50` — dark mode'da çalışır ama tema değişince kırılır
- `OCRScanner.tsx`: `bg-[#0d0d0f]`, `bg-[#16161a]` — hardcode dark, light tema yok
- `CurriculumView.tsx`: Alt bileşenlerde `bg-white dark:bg-zinc-800` ikili kullanım — Tailwind dark mode ile çalışır ama CSS variable temaya uyumlu değil

### Tailwind CSS Variable Yeniden Eşlemesi
`theme-tokens.css:460-474` ve `tailwind.config.js`'de zinc/indigo renkleri CSS variable'lara bağlanmış. Bu sayede:
```css
.bg-zinc-800 { background: hsl(var(--c-zinc-800)) }  /* → var(--bg-paper) */
```
Bu mekanizma **çalışıyor** ancak `theme-tokens.css:541-557` worksheet sayfalarında `!important` ile sabit değerlere zorlanıyor — bu bilinçli bir tercih (A4 izolasyonu).

---

## 4. DİNAMİK TAILWIND SORUNU (JIT UYUMSUZ)

### Tespit: ❌ 12 dosyada dinamik class üretimi

`rg "bg-\$\{" src/` ve `rg "text-\$\{" src/` sonuçları:

| Dosya | Satır | Kod |
|-------|-------|-----|
| `CreativeStudio/ControlPane.tsx` | 71 | `` bg-${color}-600 `` |
| `Profile/NotificationSettings.tsx` | 40,53 | `` bg-${ch.color}-500 `` |
| `AdminDashboard/AdminFeedback.tsx` | 121 | `` bg-${stat.color}-500/10 `` |
| `Student/PortfolioModule.tsx` | 90 | `` bg-${s.color}-50 `` |
| `Student/BehaviorModule.tsx` | 173 | `` bg-${badge.color}-50 `` |
| `Student/AIInsightsModule.tsx` | 98 | `` bg-${item.color}-50 `` |
| `activity-configs/MapInstructionConfig.tsx` | 165,170 | `` bg-${d.color}-600/15 `` |
| `FascicleStudio/FascicleCoverPage.tsx` | 56-57 | `` bg-${settings.primaryColor}-200/40 `` |
| `activity-configs/AdvancedMissingPartsConfig.tsx` | 93,99 | `` border-${level.color}-500 `` |
| `Profile/UserProfileSettings.tsx` | 135 | `` text-${accentColor}-500 `` |

**Etki:** Tailwind JIT, derleme anında tüm class'ları tarar. Dinamik `bg-${color}-600` gibi ifadeler **JIT tarafından derlenmez**, çalışma zamanında class mevcut olmadığı için stiller uygulanmaz.

**Çözüm:** 
1. Tüm dinamik renkleri CSS variable'lar üzerinden yap:
   ```tsx
   // Kötü:
   className={`bg-${color}-600`}
   // İyi:
   style={{ backgroundColor: `hsl(var(--${color}-h) var(--${color}-s) var(--${color}-l))` }}
   ```
2. Veya `safelist` kullan (tailwind.config.js):
   ```js
   safelist: [
     { pattern: /^bg-(indigo|emerald|amber|rose|blue|violet)-(50|100|200|500|600)/ },
     { pattern: /^text-(indigo|emerald|amber|rose|blue|violet)-(400|500|600)/ },
   ]
   ```

---

## 5. ERİŞİLEBİLİRLİK (a11y)

### aria-label: ⚠️ Kısmen Yeterli

**İyi:** `UniversalWorksheetViewer/` altındaki bileşenler neredeyse tüm butonlarda `aria-label` kullanıyor (WorksheetEditor.tsx: 25+ aria-label, PreviewPane.tsx, ExportSettings.tsx, DyslexiaControls.tsx).

**Eksikler** (aria-label olmayan ikon butonlar):
- `CurriculumView.tsx`: Header butonları (satır 925, 929, 940-942, 956, 959) — `title` attribute'u var ama `aria-label` yok
- `MatSinavStudyosu/index.tsx`: `removeSinavGecmisi` butonu (satır 538) — sadece emoji `🗑`
- `FascicleStudio/index.tsx`: Tüm header toolbar butonları (satır 170-221) — `title` attribute'u mevcut ama `aria-label` eksik
- `OCRScanner.tsx`: Görsel silme butonu (satır 918) — emoji `✕`

### Klavye Navigasyonu: ⚠️ Eksik

- `DayCard` içindeki içerik `div.onClick` ile açılıp kapanıyor — `role="button"` ve `tabIndex` gerekli
- `OCRScanner.tsx` drag-and-drop zone — klavye ile dosya seçilemez (sadece `fileInputRef` click)
- `MatSinavStudyosu/index.tsx` accordion'lar `div` ile değil `button` ile yapılmış ✅ — iyi
- `AssessmentModule.tsx`: `div.onClick` ile domain seçimi — `role="checkbox"` + `aria-checked` gerekli

### Renk Kontrastı (WCAG AA): ⚠️ Kısmen

- `theme-tokens.css`:
  - `--text-muted: #64748b` (zinc-500) — açık temada `#94a3b8` (zinc-400) üzerinde kontrast oranı **~2.8:1** (AA başarısız, 4.5:1 gerekli)
  - `--text-secondary: #94a3b8` — açık temada `#475569` ✅ (~6:1)
  - `--text-primary: #f8fafc` — koyu temada `#09090b` üzerinde ✅ (~17:1)
- `theme-oled.css`:
  - `--text-primary: #e8e8e8` — `#000000` üzerinde ✅ (~16:1)
  - `--text-muted: #808080` — `#000000` üzerinde **~4.0:1** (AA sınırda)
- `OCRScanner.tsx`: `text-slate-600` açık temada geçebilir — koyu temada `[#0d0d0f]` üzerinde `#475569` (zinc-600) ✅

---

## 6. MİCRO-INTERACTIONS & ANİMASYONLAR

### Tutarlılık: ⚠️ Orta

**3 farklı animasyon sistemi tespit edildi:**
1. **Framer Motion** — App.tsx ana geçişler, ProtectedRoute
2. **Tailwind `animate-in`** (`slide-in-from-bottom-4`, `fade-in`, `zoom-in-95`) — CurriculumView, OCRScanner'da kullanılmış
3. **Özel CSS animasyonlar** — 
   - `theme-tokens.css` — `@keyframes theme-shimmer`, `.btn-accent-glow`, `.card-glow`
   - `theme-premium.css` — `glass-layer-*` sistem animasyonları
   - `theme-oled.css` — OLED glow animasyonları
   - `MatSinavStudyosu/index.tsx` — `anim-fade-in`, `anim-slide-in` (özel keyframes)
   - `SinavStudyosu/index.tsx` — aynı `anim-fade-in`, `anim-slide-in` (yinelenen)

**Sorun:** Her stüdyo kendi animasyon keyframes'lerini tanımlıyor → ~4 farklı `fadeIn` keyframes'i var. Ortak bir `animations.css` dosyasına taşınmalı.

### Hover/Active State Tutarlılığı
- ✅ `CurriculumView`, `MatSinavStudyosu`, `SinavStudyosu`: Tutarlı `hover:scale`, `active:scale-95`
- ❌ `FascicleStudio/index.tsx`: `onMouseEnter/onMouseLeave` ile inline style — **React anti-pattern**, CSS class kullanılmalı
- ✅ `OCRScanner`: `hover:scale-[1.02]` ile tutarlı

---

## 7. LOADING STATE ANALİZİ

### LoadingSpinner Kullanımı: ✅ İyi

9 `Suspense` boundary App.tsx'te:
- `LoadingSpinner` 8 farklı lazy route için fallback
- `LoadingPlaceholder` alias ile `KelimeCumleStudio` ve `FascicleStudio` için ayrı

**Eksik:**
- `CurriculumView` AI plan oluşturma (satır 528-541): Özel spinner (iyi) fakat loading sırasında kullanıcı iptal edemiyor — **cancel butonu eksik**
- `OCRScanner` ProgressTracker (satır 98-193): Detaylı faz göstergesi (iyi) fakat `retryCount` gösteriliyor, `remainingAttempts` kullanıcıya belirtilmiyor

---

## 8. EMPTY STATE

| Bileşen | Empty State | Durum |
|---------|------------|-------|
| `CurriculumView` (Plan Kütüphanesi) | Satır 610-614 | ✅ İyi — icon + mesaj + yönlendirme |
| `MatSinavStudyosu` (Önizleme) | Satır 567-577 | ✅ İyi — icon + yönlendirme |
| `MatSinavStudyosu` (Geçmiş) | Satır 524 | ✅ Yeterli |
| `SinavStudyosu` (Önizleme) | Satır 578-588 | ✅ İyi — icon + yönlendirme |
| `SheetRenderer` (İçerik yok) | Satır 957-970 | ✅ Mükemmel — animasyonlu pulsing icon + 3 katmanlı mesaj |
| `MobileWorksheetViewer` | — | ❌ **Eksik** — `initialWorksheet` undefined ise boş görünür |
| `AdminPermissionsIDE` | — | ❌ **Eksik** — rol seçili değilse boş |

---

## 9. ERROR STATE

| Bileşen | Error Handling | Durum |
|---------|---------------|-------|
| `AssessmentModule` | `alert()` kullanımı (satır 77, 81) | ❌ **alert yasak** — Toast kullanılmalı |
| `CurriculumView` | `alert()` (satır 264, 357, 363, 365, 406) | ❌ **5 adet alert()** — tümü toast'a dönüştürülmeli |
| `OCRScanner` | Özel Toast bileşeni (`showToast`) + friendly error mapping | ✅ En iyi örnek |
| `MatSinavStudyosu` | `setError()` + inline error banner | ✅ Yeterli |
| `SinavStudyosu` | `setError()` + inline error banner | ✅ Yeterli |

---

## 10. M1: AdminPermissionsIDE.tsx — Kullanım Durumu

**Tespit:** `AdminPermissionsIDE.tsx` (eski RBAC IDE) hiçbir yerde import edilmiyor.

```bash
rg "AdminPermissionsIDE" src/ --include="*.{ts,tsx}"
# Sonuç: Hiçbir import bulunamadı
```

Yeni `AdminDashboard/PermissionsIDE.tsx` (27.7KB) aktif kullanımda. Eski bileşen **ölü kod** — silinebilir.

---

## 11. M2: MobileWorksheetViewer — Aktif Durum

**Aktif:** `src/components/MobileWorksheetViewer.tsx` (187 satır)
- `UniversalWorksheetViewer/` altyapısını kullanıyor (useWorksheetState, useExportEngine)
- TouchControls + MobileEditorToolbar + MobileExportPanel ayrı dosyalarda
- Clean, modern, lazy-load uyumlu

**Sonuç:** ✅ Mobil viewer aktif ve iyi yapılandırılmış. Eski bir monolithic mobile viewer yok.

---

## 12. M3: types.ts vs types/index.ts

| Dosya | İçerik | Durum |
|-------|--------|-------|
| `src/types.ts` (1 satır) | `export * from './types/index.js'` | ✅ Re-export barrel |
| `src/types/index.ts` | 33 export alt modül | ✅ İyi yapılandırılmış |
| `src/types/` klasörü | 33 .ts dosyası | ✅ Modüler |

**Sonuç:** ✅ types.ts zaten barrel file olarak yapılandırılmış. Ek bir işlem gerekmez.

---

## 13. M4: constants.ts (560 satır) vs constants/ Klasörü

| Dosya | Satır | Durum |
|-------|-------|-------|
| `src/constants.ts` | 560 | ⚠️ Büyük — ana `ACTIVITIES` array'i ~150+ aktivite |
| `src/constants/views.ts` | 25 | ✅ Ayrılmış |
| `src/constants/tourSteps.ts` | — | ✅ Ayrılmış |
| `src/constants/studios.ts` | — | ✅ Ayrılmış |
| `src/constants/initialSettings.ts` | — | ✅ Ayrılmış |
| `src/constants/assessmentConstants.ts` | — | ✅ Ayrılmış |

**Öneri:** `constants.ts` içindeki `ACTIVITIES` array'i `constants/activities.ts`'e taşınmalı. Geri kalan `DIFFICULTY_OPTIONS` gibi küçük sabitler constants.ts'de kalabilir.

---

## 14. ÖZEL BULGULAR

### 14.1 A4 Renk İzolasyonu — Faz 4
`theme-tokens.css:531-577` ve `tailwind.css:176-509` — worksheet sayfalarının tema sızıntısına karşı kapsamlı izolasyonu. **Çok iyi tasarlanmış.** Her renk override edilmiş, `!important` bilinçli kullanılmış, print media query ayrıntılı.

**Küçük sorun:** `Code Climate` tarzı bir duplikasyon — `theme-tokens.css` ve `tailwind.css`'te aynı worksheet override'ları (~50 satır) iki kez tanımlanmış. `tailwind.css:176` zaten `theme-tokens.css`'i import ediyor.

### 14.2 Console.log Kullanımı
Üretim kodunda `console.log` kullanımı mevcut (Bora Demir kuralı: yasak). `rg "console\.log" src/` ile tespit edilenler günlüğe kaydedilmeli ve kaldırılmalı.

### 14.3 `any` Tip Kullanımı
- `SheetRenderer.tsx`: `@ts-nocheck` + yoğun `as unknown as any`
- `AssessmentModule.tsx`: `as unknown as any` kullanımı
- Bora Demir kuralı: `any` yasak → `unknown` + type guard

---

## 15. ÖZET PUANLAMA

| Kriter | Puan | Açıklama |
|--------|------|----------|
| Tema Uyumu | 7/10 | CSS variable sistemi var ama bazı bileşenler sabit renk kullanıyor |
| Dinamik Tailwind | 4/10 | 12 dosyada JIT-uyumsuz dinamik class |
| Erişilebilirlik (aria-label) | 7/10 | UniversalWorksheetViewer iyi, diğerleri eksik |
| Klavye Navigasyonu | 5/10 | Accordion'lar iyi, onClick div'ler kötü |
| Renk Kontrastı | 7/10 | Genel iyi, muted renkler sınırda |
| Micro-interactions | 6/10 | Tutarlılık sorunu, 4 farklı animasyon sistemi |
| Loading State | 8/10 | Suspense + LoadingSpinner iyi, cancel butonu eksik |
| Empty State | 7/10 | Çoğu bileşende var, 2 eksik |
| Error State | 5/10 | alert() kullanımı devam ediyor (6 yerde) |
| Kod Organizasyonu | 6/10 | types ✅, constants ⚠️, God Components ❌ |
| **Genel** | **6.2/10** | **Orta-İyi — acil müdahale gereken alanlar var** |

---

## 16. YAPILACAKLAR (Öncelik Sırası)

### Kritik (Hemen)
1. [`alert()` temizliği] — AssessmentModule (2) + CurriculumView (5) → Toast
2. [Dinamik Tailwind] — 12 dosyada `bg-${}` → CSS variable veya safelist
3. [AdminPermissionsIDE.tsx] — Ölü kod temizliği (M1)

### Yüksek Öncelik
4. [CurriculumView] — 6-8 alt bileşene bölme + 19 state'i hook'a taşıma
5. [App.tsx Studio bloğu] — `StudioRenderer.tsx`'e taşıma (M5)
6. [constants.ts] — `ACTIVITIES` array'ini `constants/activities.ts`'e taşıma (M4)
7. [FascicleCoverPage.tsx] — `bg-${settings.primaryColor}` dinamik Tailwind acil düzeltme

### Orta Öncelik
8. [OCRScanner] — Hardcode dark renkler → CSS variable
9. [Animasyonlar] — 4 farklı `fadeIn` keyframes → ortak dosya
10. [FascicleStudio] — `onMouseEnter/onMouseLeave` → CSS class
11. [aria-label] — Eksik ikon butonlara ekleme

### Düşük Öncelik
12. [SheetRenderer] — `@ts-nocheck` kaldırma + type güvenliği
13. [`any` tip] — Tüm `as any` kullanımlarını `unknown` + type guard yapma
14. [Console.log] — Üretim kodundan temizleme
15. [Empty State] — MobileWorksheetViewer + AdminPermissionsIDE'ye ekleme

---

*Rapor sonu. Detaylı düzeltme için her başlık ayrı bir task olarak açılabilir.*

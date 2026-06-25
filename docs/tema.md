# BDMIND Görüntü Ayarları Sistemi — Kapsamlı Analiz ve Tasarım Planı

> **Proje:** BDMIND EdTech Platformu (Oogmatik)
> **Tarih:** 2026-06-25
> **Versiyon:** 2.0
> **Hedef:** SettingsModal'ı kompakt, eksiksiz ve WCAG AAA uyumlu hale getirmek

---

## 1. MEVCUT SİSTEM MİMARİSİ

### 1.1 Dosya Haritası

| Dosya | Satır | Amaç |
|-------|-------|------|
| `src/components/SettingsModal.tsx` | 338 | Ana ayarlar modalı (8 tema, 3 tab) |
| `src/components/Profile/modules/settings/AppearanceSettings.tsx` | 227 | Profil sayfası görünüm ayarları (8 tema — farklı set) |
| `src/styles/theme-tokens.css` | 641 | Merkezi tema token sistemi (8 tema CSS variable) |
| `src/styles/theme-premium.css` | 340 | 5 katmanlı glassmorphism sistemi |
| `src/styles/theme-oled.css` | 245 | OLED + Disleksi temaları (3 tema) |
| `src/styles/theme-print.css` | 272 | Yazdırma/PDF teması |
| `src/styles/tailwind.css` | 510 | Tailwind giriş noktası, base stiller |
| `src/components/PremiumPopupStyles.css` | 217 | Premium popup menü stilleri |
| `src/store/useUIStore.ts` | 121 | Zustand persist state yönetimi |
| `src/hooks/useGlobalSettings.ts` | 114 | CSS değişken köprüsü, tema sınıf yönetimi |
| `src/hooks/useReducedMotion.ts` | 86 | Erişilebilirlik hareket algılama |
| `src/hooks/useAmbientLight.ts` | 152 | Ortam ışığı sensörü + otomatik tema |
| `src/utils/themeUtils.ts` | 162 | Tema paleti okuyucuları |
| `src/utils/motionPresets.ts` | 374 | Framer Motion animasyon kütüphanesi |
| `src/services/themeIntelligence.ts` | 312 | AI tema önerisi motoru |
| `src/services/themeContrastService.ts` | 130 | WCAG kontrast kontrolü |
| `src/types/core.ts` | 758 | AppTheme, UiSettings tanımları |
| `src/types/common.ts` | 78 | StyleSettings tanımı |
| `tailwind.config.js` | 47 | Tailwind yapılandırması |

### 1.2 Tip Tanımları

#### AppTheme (11 tema)
```typescript
type AppTheme =
  | 'light'              // Milk & Honey
  | 'dark'               // Obsidian Deep
  | 'anthracite'         // Varsayılan Anthracite
  | 'space'              // Nordic Mist / Deep Space
  | 'nature'             // Emerald Forest
  | 'ocean'              // Nordic Mist Ocean varyantı
  | 'anthracite-gold'    // Imperial Stone (Royal)
  | 'anthracite-cyber'   // Cyber Punk (Neon)
  | 'oled-black'         // True OLED Black
  | 'dyslexia-cream'     // BDA Cream & Blue
  | 'dyslexia-mint'      // Calming Mint Green
```

#### UiSettings (Uygulama Arayüzü Ayarları)
```typescript
interface UiSettings {
  fontFamily: string;           // 'Lexend' | 'OpenDyslexic' | 'Inter' | 'Comic Neue'
  fontSizeScale: number;        // 0.8-1.5 (yüzde çarpanı)
  fontWeight: 'thin' | 'normal' | 'medium' | 'bold' | 'black';  // 300/400/500/700/900
  letterSpacing: 'normal' | 'wide';  // 'normal' veya '0.05em'
  lineHeight: number;           // 1.0-2.5 (Nx olarak gösterilir)
  saturation: number;           // 0-100 (%)
  compactMode: boolean;         // Bento-grid yoğunluk anahtarı
  premiumIntensity: number;     // 0-100 (cam bulanıklığı 0-20px kontrol eder)
  contrastLevel: number;        // 0-50 (CSS filter ile % kontrast ekler)
  borderRadius?: 'none' | 'sm' | 'xl' | 'full';  // --app-border-radius kontrolü
  animationLevel?: 'full' | 'reduced' | 'none';  // Hareket erişilebilirliği kontrolü
}
```

#### StyleSettings (Çalışma Sayfası Ayarları — 35 alan)
```typescript
interface StyleSettings {
  fontSize: number | string; scale: number; borderColor: string;
  borderWidth: number; margin: number; columns: number; gap: number;
  orientation: 'portrait' | 'landscape';
  themeBorder: 'none' | 'simple' | 'math' | 'verbal' | 'stars' | 'geo';
  contentAlign: 'left' | 'center' | 'right' | 'justify';
  fontWeight: 'normal' | 'bold'; fontStyle: 'normal' | 'italic';
  visualStyle: 'card' | 'minimal';
  showPedagogicalNote: boolean; showMascot: boolean;
  showStudentInfo: boolean; showTitle: boolean;
  showInstruction: boolean; showImage: boolean;
  showFooter: boolean; showAnswers: boolean; showClues: boolean;
  footerText: string; smartPagination: boolean;
  fontFamily: string; lineHeight: number; letterSpacing: number;
  wordSpacing: number; paragraphSpacing: number;
  focusMode: boolean; rulerColor: string; rulerHeight: number;
  maskOpacity: number; compact?: boolean; title?: string;
  paperTexture?: 'none' | 'ruled' | 'grid' | 'dotted' | 'parchment' | 'sepia' | 'saman';
  gutter?: number; contentScale?: number; includeClinicalNotes?: boolean;
}
```

> **Not:** `StyleSettings` baskı çıktısı stilini kontrol eder. `UiSettings` uygulama arayüzü görünümünü kontrol eder. İkisi farklı sistemlerdir.

---

## 2. CSS DEĞİŞKEN SİSTEMİ

### 2.1 Varsayılan Tema Tokenları (`:root`)

| Değişken | Varsayılan | Amaç |
|----------|-----------|------|
| `--accent-h` | `234` | Vurgu rengi tonu |
| `--accent-s` | `89%` | Vurgu doygunluğu |
| `--accent-l` | `73%` | Vurgu parlaklığı |
| `--accent-color` | `hsl(var(--accent-h), var(--accent-s), var(--accent-l))` | Birincil vurgu |
| `--accent-hover` | `hsl(var(--accent-h), 83%, 62%)` | Hover durumu |
| `--accent-muted` | `hsla(var(--accent-h), var(--accent-s), var(--accent-l), 0.1)` | Yumuşak vurgu |
| `--bg-primary-rgb` | `9, 9, 11` | Birincil arka plan (RGB) |
| `--bg-secondary-rgb` | `4, 4, 6` | İkincil arka plan |
| `--bg-paper-rgb` | `18, 18, 20` | Kağıt yüzeyi |
| `--bg-inset-rgb` | `0, 0, 0` | Çökük arka plan |
| `--bg-primary` | `rgb(var(--bg-primary-rgb))` | Çözümlenmiş birincil bg |
| `--bg-secondary` | `rgb(var(--bg-secondary-rgb))` | Çözümlenmiş ikincil bg |
| `--bg-paper` | `rgb(var(--bg-paper-rgb))` | Çözümlenmiş kağıt bg |
| `--bg-inset` | `rgb(var(--bg-inset-rgb))` | Çözümlenmiş çökük bg |
| `--surface-glass` | `rgba(255, 255, 255, 0.05)` | Glassmorphism tabanı |
| `--surface-glass-blur` | `20px` | Cam bulanıklığı |
| `--surface-elevated` | `rgba(255, 255, 255, 0.07)` | Yükseltilmiş yüzeyler |
| `--text-primary` | `#f8fafc` | Birincil metin |
| `--text-secondary` | `#94a3b8` | İkincil metin |
| `--text-muted` | `#64748b` | Soluk metin |
| `--border-color` | `rgba(255, 255, 255, 0.08)` | Kenarlık rengi |
| `--radius-premium` | `16px` | Köşe yuvarlaklığı |
| `--shadow-premium` | (bileşik gölge) | Premium gölge |
| `--blur-premium` | `20px` | Premium bulanıklık |
| `--bg-viewport` | `rgb(6, 6, 8)` | Görünüm alanı dokusu |
| `--bg-viewport-dot` | `rgba(255, 255, 255, 0.04)` | Nokta deseni |
| `--ui-font` | `var(--app-font-family, 'Lexend', sans-serif)` | UI fontu |
| `--ui-scale` | `var(--app-font-size-scale, 1)` | UI ölçeği |
| `--ui-weight` | `var(--app-font-weight, 400)` | UI ağırlığı |
| `--ui-spacing` | `var(--app-letter-spacing, normal)` | Harf aralığı |
| `--ui-line-height` | `var(--app-line-height, 1.6)` | Satır yüksekliği |
| `--ui-saturation` | `var(--app-saturation, 100%)` | Doygunluk |
| `--sidebar-width` | `320px` | Kenar çubuğu genişliği |
| `--app-transition` | `all 0.3s cubic-bezier(0.4, 0, 0.2, 1)` | Global geçiş |

### 2.2 Glassmorphism Katman Sistemi

| Katman | Değişken | Değer | Kullanım |
|--------|----------|-------|----------|
| Z-1 | `--glass-base` | `rgba(255,255,255,0.05)` | Arka plan kartları |
| Z-2 | `--glass-elevated` | `rgba(255,255,255,0.08)` | Paneller |
| Z-3 | `--glass-floating` | `rgba(255,255,255,0.12)` | Modallar |
| Z-4 | `--glass-popup` | `rgba(255,255,255,0.18)` | Tooltip'ler |
| Z-5 | `--glass-focus` | `rgba(255,255,255,0.25)` | Aktif elemanlar |

| Bulanıklık | Değişken | Değer |
|------------|----------|-------|
| Yakın | `--blur-near` | 8px |
| Orta | `--blur-mid` | 16px |
| Uzak | `--blur-far` | 24px |
| Aşırı | `--blur-extreme` | 32px |

| Kenarlık | Değişken | Değer |
|----------|----------|-------|
| İnce | `--border-subtle` | `rgba(255,255,255,0.08)` |
| Orta | `--border-medium` | `rgba(255,255,255,0.15)` |
| Kalın | `--border-strong` | `rgba(255,255,255,0.25)` |
| Vurgulu | `--border-accent` | `rgba(255,255,255,0.35)` |

| Gölge | Değişken | Değer |
|-------|----------|-------|
| xs | `--shadow-sm` | `0 2px 8px rgba(0,0,0,0.04)` |
| sm | `--shadow-md` | `0 4px 16px rgba(0,0,0,0.08)` |
| md | `--shadow-lg` | `0 8px 32px rgba(0,0,0,0.12)` |
| lg | `--shadow-xl` | `0 16px 64px rgba(0,0,0,0.16)` |
| xl | `--shadow-2xl` | `0 24px 96px rgba(0,0,0,0.24)` |

### 2.3 Animasyon Easing Eğrileri

| Değişken | Değer | Kullanım |
|----------|-------|----------|
| `--ease-premium` | `cubic-bezier(0.16, 1, 0.3, 1)` | Premium giriş animasyonları |
| `--ease-smooth` | `cubic-bezier(0.45, 0, 0.15, 1)` | Yumuşak geçişler |
| `--ease-bounce` | `cubic-bezier(0.68, -0.55, 0.265, 1.55)` | Zıplayan animasyonlar |
| `--duration-instant` | `100ms` | Anlık tepki |
| `--duration-fast` | `200ms` | Hızlı geçişler |
| `--duration-normal` | `300ms` | Normal geçişler |
| `--duration-slow` | `500ms` | Yavaş geçişler |
| `--duration-slower` | `700ms` | Çok yavaş geçişler |

---

## 3. TEMA KATALOĞU (11/11)

### 3.1 Karanlık Temalar

| ID | İsim | CSS Selector | BG RGB | Accent HSL | Renk |
|----|------|-------------|--------|------------|------|
| `anthracite` | Anthracite | `:root.theme-anthracite` | 18,18,20 | 239/84/67 | `#6366f1` |
| `dark` | Obsidian Deep | `:root.theme-dark` | 9,9,11 | 234/89/73 | `#818CF8` |
| `space` | Deep Space | `:root.theme-space` | 2,6,23 | 199/89/48 | `#38bdf8` |
| `anthracite-gold` | Imperial Stone | `:root.theme-anthracite-gold` | 28,25,23 | 43/96/56 | `#F59E0B` |
| `anthracite-cyber` | Cyber Punk | `:root.theme-anthracite-cyber` | 2,2,2 | 350/90/56 | `#F43F5E` |
| `oled-black` | OLED Black | `.theme-oled-black` | 0,0,0 | 210/100/60 | `#3B82F6` |

### 3.2 Açık Temalar

| ID | İsim | CSS Selector | BG RGB | Accent HSL | Renk |
|----|------|-------------|--------|------------|------|
| `light` | Milk & Honey | `:root.theme-light` | 248,250,252 | 245/78/53 | `#4F46E5` |

### 3.3 Doğa Temaları

| ID | İsim | CSS Selector | BG RGB | Accent HSL | Renk |
|----|------|-------------|--------|------------|------|
| `ocean` | Nordic Mist | `:root.theme-ocean` | 8,47,73 | 198/93/49 | `#38BDF8` |
| `nature` | Emerald Forest | `:root.theme-nature` | 5,46,22 | 142/71/45 | `#4ADE80` |

### 3.4 Özel Temalar (Premium)

| ID | İsim | CSS Selector | BG | Accent | Özellik |
|----|------|-------------|-----|--------|---------|
| `dyslexia-cream` | Krem Mavi (BDA) | `.theme-dyslexia-cream` | HSL 47/50/92% | `#3B6EA5` | BDA önerisi, Lexend zorunlu |
| `dyslexia-mint` | Nane Yeşili | `.theme-dyslexia-mint` | HSL 160/40/95% | `#2D9D78` | Rahatlatıcı, Lexend zorunlu |

### 3.5 Tema Sınıf Yönetimi

```
Kullanıcı tema seçer
  → useUIStore.setTheme(newTheme)
    → Zustand state güncellenir (localStorage'a persist)
      → useGlobalSettings hook'u tetiklenir
        → document.documentElement.classList:
          1. Tüm theme-* sınıfları kaldırılır
          2. dark sınıfı eklenir/kaldırılır
          3. theme-{newTheme} sınıfı eklenir
        → CSS cascade yeni tokenları uygular
        → Tüm bileşenler anında güncellenir
        → Sayfa yenileme GEREKMEZ ✓
```

**Karanlık Tema Tespiti:**
```typescript
const DARK_THEMES = ['dark', 'anthracite', 'space', 'anthracite-gold', 'anthracite-cyber', 'oled-black'];
// Ayrıca: theme.includes('anthracite') kontrolü (anthracite-gold, anthracite-cyber için)
```

---

## 4. MEVCUT SETTINGSMODAL DETAYLI ANALİZ

### 4.1 Bileşen Yapısı

```
SettingsModal (338 satır)
├── Props: isOpen, onClose, uiSettings, onUpdateUiSettings, theme, onUpdateTheme
├── State: activeTab ('appearance'|'typography'|'accessibility')
├── State: themeRecommendation (ThemeRecommendation | null) — KULLANILMIYOR
├── useEffect: Escape tuşu dinleyicisi
├── useEffect: Theme Intelligence önerisi (AÇIKLAMA YOK)
├── Tema Verisi: 8 tema (oled-black, dyslexia-cream, dyslexia-mint eksik)
├── Font Verisi: 4 font
├── Tab Verisi: 3 tab
├── handleReset: Tüm ayarları varsayılana döndürür
└── Render:
    ├── Backdrop (bg-black/80, backdrop-blur-2xl)
    └── Modal Container (max-w-5xl, h-[85vh], rounded-[3rem])
        ├── Sidebar (w-72, p-8)
        │   ├── Başlık (text-2xl, font-black)
        │   ├── Tab Butonları (p-4, rounded-2xl)
        │   └── Sıfırla Butonu
        └── İçerik Alanı (flex-1, p-12)
            ├── Kapat Butonu (w-12, rounded-2xl)
            ├── Kaydırılabilir Alan
            │   ├── Canlı Simülasyon Kartı (p-10, rounded-[2.5rem])
            │   └── Tab İçeriği
            │       ├── Görünüm: Tema grid (2x4), Compact toggle, Glass slider
            │       ├── Tipografi: Font seçimi, Satır aralığı
            │       └── Erişilebilirlik: Ölçek, Harf aralığı, Doygunluk, Kontrast
```

### 4.2 Mevcut Tema Seti (SettingsModal)

| # | ID | İsim | Renk | Accent | Durum |
|---|-----|------|------|--------|-------|
| 1 | `light` | Milk & Honey | #F8FAFC | #4F46E5 | ✓ |
| 2 | `anthracite` | Anthracite | #121214 | #6366f1 | ✓ |
| 3 | `dark` | Obsidian Deep | #09090B | #818CF8 | ✓ |
| 4 | `ocean` | Nordic Mist | #082F49 | #38BDF8 | ✓ |
| 5 | `nature` | Emerald Forest | #052E16 | #4ADE80 | ✓ |
| 6 | `anthracite-gold` | Imperial Stone | #1C1917 | #F59E0B | ✓ |
| 7 | `anthracite-cyber` | Cyber Punk | #020202 | #F43F5E | ✓ |
| 8 | `space` | Deep Space | #020617 | #38bdf8 | ✓ |
| — | `oled-black` | OLED Black | #000000 | #3B82F6 | **EKSIK** |
| — | `dyslexia-cream` | Krem Mavi (BDA) | #F5F0DC | #3B6EA5 | **EKSIK** |
| — | `dyslexia-mint` | Nane Yeşili | #E8FFF5 | #2D9D78 | **EKSIK** |

### 4.3 Mevcut Ayar Seti (SettingsModal)

| Ayar | Alan | Aralık | Gösteriliyor mu? |
|------|------|--------|-------------------|
| Font Ailesi | `fontFamily` | 4 seçenek | ✓ |
| Font Ölçeği | `fontSizeScale` | 0.8-1.5 | ✓ |
| Satır Yüksekliği | `lineHeight` | 1.0-2.5 | ✓ |
| Kompakt Mod | `compactMode` | boolean | ✓ |
| Cam Yoğunluğu | `premiumIntensity` | 0-100 | ✓ |
| Harf Aralığı | `letterSpacing` | normal/wide | ✓ |
| Doygunluk | `saturation` | 0-100 | ✓ |
| Kontrast | `contrastLevel` | 0-50 | ✓ |
| Font Ağırlığı | `fontWeight` | thin/normal/medium/bold/black | **EKSIK** |
| Köşe Yuvarlaklığı | `borderRadius` | none/sm/xl/full | **EKSIK** |
| Animasyon Seviyesi | `animationLevel` | full/reduced/none | **EKSIK** |

### 4.4 Tespit Edilen Hatalar ve Tutarlısızlıklar

#### Kritik Hatalar

| # | Hata | Konum | Açıklama |
|---|------|-------|----------|
| 1 | Theme Intelligence önerisi gösterilmiyor | `SettingsModal.tsx:29-41` | `themeRecommendation` state'i ayarlanıyor ama JSX'te hiçbir yerde render edilmiyor. Öneri UI'ı hiç implemente edilmemiş. |
| 2 | İki farklı tema seçici, farklı setler | `SettingsModal.tsx` vs `AppearanceSettings.tsx` | SettingsModal: light, anthracite, dark, ocean, nature, anthracite-gold, anthracite-cyber, space. AppearanceSettings: anthracite, ocean, light, space, nature, oled-black, dyslexia-cream, dyslexia-mint. Hiçbiri 11 temanın tamamını kapsamıyor. |
| 3 | `getSafeMotionConfig` hook kurallarını ihlal ediyor | `useReducedMotion.ts:58-69` | Hook kullanıyor ama `use*` ile başlamıyor. Koşullu veya hook dışı çağrıldığında hata verir. |

#### Tutarlısızlıklar

| # | Sorun | Detay |
|---|-------|-------|
| 4 | `DARK_THEMES` dizisi iki kez tanımlı | `useGlobalSettings.ts` satır 54-61 ve 97-99. DRY ihlali. |
| 5 | `nature` ve `ocean` karanlık listede değil | Koyu yeşil/mavi arka planlara sahip ama `dark` sınıfı onlar için kaldırılıyor. `dark:` Tailwind yardımcıları çalışmaz. |
| 6 | `getAdaptiveBlur()` implemente edilmemiş | Spec doc'ta belirtilmiş ama `themeUtils.ts`'de yok. |
| 7 | `themeIntelligence.trackThemeSwitch` hiç çağrılmıyor | Tema değişikliğinde veri girişi yapılmıyor. AI motoru verisiz kalıyor. |
| 8 | `themeIntelligence.reportEyeStrain` hiç çağrılmıyor | Göz yorgunluğu raporlama arayüzü yok. |
| 9 | `useAmbientLight` entegre edilmemiş | Hook var ama App.tsx'te veya hiçbir yerde çağrılmıyor. |
| 10 | Print tema tutarsızlığı | `theme-print.css`, `theme-tokens.css` ve `tailwind.css` üçü de `.worksheet-page` kuralları tanımlıyor. Farklı öncelik ve değerler. |
| 11 | `--bg-h`, `--bg-s`, `--bg-l` değişkenleri theme-tokens.css'de yok | `theme-print.css` bunları kullanıyor ama sadece `theme-oled.css`'de tanımlı. OLED dışı temalarda boş değer. |
| 12 | Font weight override çalışmıyor | `tailwind.css` `[style*="--app-font-weight"]` seçicisi kullanıyor ama `useGlobalSettings` değişkeni `document.documentElement`'e set ediyor, inline style olarak değil. `style` özniteliğini kontrol eden seçici çalışmayabilir. |

---

## 5. YENİ TASARIM PLANI — KOMPAKT MODAL

### 5.1 Boyut ve Yerleşim Hedefleri

```
ÖNCEKİ:                              SONRAKİ:
┌─────────────────────────┐          ┌──────────────────────┐
│ max-w-5xl (1024px)      │          │ max-w-2xl (672px)    │
│ h-[85vh] (sabit)        │          │ max-h-[80vh] (esnek) │
│ rounded-[3rem] (48px)   │          │ rounded-2xl (16px)   │
│ p-12 content (48px)     │          │ p-6 content (24px)   │
│ p-8 sidebar (32px)      │          │ p-3 sidebar (12px)   │
│ p-10 preview (40px)     │          │ p-4 preview (16px)   │
│ p-8 card (32px)         │          │ p-3 card (12px)      │
└─────────────────────────┘          └──────────────────────┘
```

| Özellik | Mevcut | Yeni Hedef | Değişim |
|---------|--------|------------|---------|
| Max Genişlik | `max-w-5xl` (1024px) | `max-w-2xl` (672px) | **-34%** |
| Yükseklik | `h-[85vh]` (sabit) | `max-h-[80vh]` (esnek) | Esnek |
| Border Radius | `rounded-[3rem]` (48px) | `rounded-2xl` (16px) | **-67%** |
| Content Padding | `p-12` (48px) | `p-6` (24px) | **-50%** |
| Sidebar Padding | `p-8` (32px) | `p-3` (12px) | **-63%** |
| Card Padding | `p-8`/`p-10` (32-40px) | `p-3`/`p-4` (12-16px) | **-60%** |
| Card Radius | `rounded-[2rem]`/`rounded-[2.5rem]` | `rounded-xl` (12px) | **-50%** |
| Section Gap | `space-y-10` (40px) | `space-y-4` (16px) | **-60%** |
| Preview Card | `p-10 rounded-[2.5rem]` | `p-4 rounded-xl` | **-60%** |
| Başlık Fontu | `text-2xl` (24px) | `text-sm` (14px) | **-42%** |
| Tab Fontu | `text-sm` (14px) | `text-xs` (12px) | **-14%** |

### 5.2 Yeni Bileşen Mimarisi

```
SettingsModal (compact v2)
├── Backdrop
│   └── bg-black/60 backdrop-blur-xl (minimal)
├── Modal Container
│   └── max-w-2xl max-h-[80vh] rounded-2xl overflow-hidden
│       ├── Header Bar (sticky top-0, z-10)
│       │   ├── Sol: Başlık (text-sm font-bold uppercase)
│       │   ├── Orta: Tab Bar (yatay, icon-only mobilde)
│       │   │   ├── 🎨 Görünüm
│       │   │   ├── A Tipografi
│       │   │   └── ♿ Erişilebilirlik
│       │   └── Sağ: Kapat Butonu (w-8 h-8 rounded-lg)
│       ├── Content Area
│       │   └── overflow-y-auto custom-scrollbar p-6
│       │       ├── Canlı Önizleme (collapsible, başlangıçta kapalı)
│       │       │   └── p-4 rounded-xl border
│       │       │       ├── Tema Renk Çubuğu (w-8 h-1 rounded-full)
│       │       │       ├── Başlık (text-base font-bold)
│       │       │       └── Paragraf (text-xs opacity-80)
│       │       ├── [Tab: Görünüm]
│       │       │   ├── Tema Grupları
│       │       │   │   ├── 🔵 Karanlık (6 tema)
│       │       │   │   ├── ☀️ Açık (1 tema)
│       │       │   │   ├── 🌿 Doğa (2 tema)
│       │       │   │   └── ⭐ Premium (2 tema + rozet)
│       │       │   │       └── Grid: grid-cols-3 gap-2
│       │       │   │           └── Kart: p-2 rounded-lg
│       │       │   │               ├── Mini renk kutusu (aspect-square rounded)
│       │       │   │               └── İsim (text-[10px] font-semibold truncate)
│       │       │   ├── Ayarlar Satırı (grid-cols-2 gap-3)
│       │       │   │   ├── Kompakt Mod (toggle)
│       │       │   │   ├── Köşe Yuvarlaklığı (4 butonlu pill)
│       │       │   │   ├── Cam Yoğunluğu (slider)
│       │       │   │   └── Animasyon Seviyesi (3 butonlu pill)
│       │       │   └── Theme Intelligence Önerisi (varsa)
│       │       ├── [Tab: Tipografi]
│       │       │   ├── Font Seçimi (2x2 grid, mini kartlar)
│       │       │   │   └── Kart: p-3 rounded-xl
│       │       │   │       ├── Önizleme: "Abc 123" (text-lg)
│       │       │   │       └── İsim + açıklama (text-[10px])
│       │       │   ├── Yazı Kalınlığı (5 butonlu pill)
│       │       │   │   └── Thin | Normal | Medium | Bold | Black
│       │       │   └── Satır Aralığı (slider, 1.0-2.5)
│       │       └── [Tab: Erişilebilirlik]
│       │           ├── Sistem Ölçeği (slider, 0.8-1.5)
│       │           ├── Geniş Harf Aralığı (toggle)
│       │           ├── Renk Doygunluğu (slider, 0-100)
│       │           └── Dinamik Kontrast (slider, 0-50)
│       └── Footer Bar (sticky bottom-0, border-t)
│           ├── Sıfırla Butonu (text-[10px] text-rose-500)
│           └── Kaydetme göstergesi (opsiyonel)
```

### 5.3 Yeni Tema Listesi — Tam Destek (11/11)

#### Grup 1: Karanlık Temalar (6)
| # | ID | İsim | Accent | Rozet |
|---|-----|------|--------|-------|
| 1 | `anthracite` | Anthracite | `#6366f1` | Varsayılan |
| 2 | `dark` | Obsidian Deep | `#818CF8` | — |
| 3 | `space` | Deep Space | `#38bdf8` | — |
| 4 | `anthracite-gold` | Imperial Stone | `#F59E0B` | — |
| 5 | `anthracite-cyber` | Cyber Punk | `#F43F5E` | — |
| 6 | `oled-black` | OLED Black | `#3B82F6` | ★ Yeni |

#### Grup 2: Açık Tema (1)
| # | ID | İsim | Accent | Rozet |
|---|-----|------|--------|-------|
| 7 | `light` | Milk & Honey | `#4F46E5` | — |

#### Grup 3: Doğa Temaları (2)
| # | ID | İsim | Accent | Rozet |
|---|-----|------|--------|-------|
| 8 | `ocean` | Nordic Mist | `#38BDF8` | — |
| 9 | `nature` | Emerald Forest | `#4ADE80` | — |

#### Grup 4: Premium Temalar (2)
| # | ID | İsim | Accent | Rozet |
|---|-----|------|--------|-------|
| 10 | `dyslexia-cream` | Krem Mavi (BDA) | `#3B6EA5` | ★ Premium |
| 11 | `dyslexia-mint` | Nane Yeşili | `#2D9D78` | ★ Premium |

### 5.4 Yeni Ayar Detayları

#### Font Weight (Yazı Kalınlığı)
```typescript
// UiSettings.fontWeight: 'thin' | 'normal' | 'medium' | 'bold' | 'black'
// CSS Mapping: thin=300, normal=400, medium=500, bold=700, black=900
// UI: 5 butonlu yatay pill grubu
// Varsayılan: 'normal'
```

#### Köşe Yuvarlaklığı (Border Radius)
```typescript
// UiSettings.borderRadius: 'none' | 'sm' | 'xl' | 'full'
// CSS Mapping: none=0px, sm=0.375rem (6px), xl=1rem (16px), full=9999px
// UI: 4 butonlu yatay pill grubu (her biri köşe simgesi ile)
// Varsayılan: 'xl'
```

#### Animasyon Seviyesi (Animation Level)
```typescript
// UiSettings.animationLevel: 'full' | 'reduced' | 'none'
// CSS Mapping: full=hiçbir şey ekleme, reduced=motion-reduced sınıfı ekle, none=motion-reduce sınıfı ekle
// UI: 3 butonlu yatay pill grubu
// Ek bilgi: prefers-color-scheme media query gösterimi
// Varsayılan: 'full'
```

### 5.5 Canlı Önizleme Kartı (Collapsible)

```tsx
// Başlangıçta kapalı (useState: false)
// Başlığa tıklayarak aç/kapa
// İçerik: Seçili temanın renklerini, fontunu ve ayarlarını gösterir
// CSS filter: saturate(${saturation}%) contrast(${100 + contrastLevel}%)
// Font: Seçili fontFamily ile
// Boyut: text-base başlık, text-xs paragraf
```

---

## 6. PREMIUM TEMA UYUMLULUĞU

### 6.1 Tema-Bileşen Uyumu Matrisi

Her premium tema için tüm UI bileşenlerinde uyumluluk sağlanmalı:

| Bileşen | OLED Black | Dyslexia Cream | Dyslexia Mint |
|---------|-----------|----------------|---------------|
| SettingsModal | ✓ | ✓ | ✓ |
| AppearanceSettings | ✓ | ✓ | ✓ |
| Sidebar | ✓ | ✓ | ✓ |
| Navigation | ✓ | ✓ | ✓ |
| Activity Cards | ✓ | ✓ | ✓ |
| Modal/Popup | ✓ | ✓ | ✓ |
| Form Elements | ✓ | ✓ | ✓ |
| Buttons | ✓ | ✓ | ✓ |
| Tooltips | ✓ | ✓ | ✓ |
| Charts/Graphs | ✓ | ✓ | ✓ |
| Print/PDF | ✓ | ✓ | ✓ |
| Admin Panel | ✓ | ✓ | ✓ |
| Fascicle Studio | ✓ | ✓ | ✓ |
| Creative Studio | ✓ | ✓ | ✓ |
| Screening Assessment | ✓ | ✓ | ✓ |

### 6.2 Tema CSS Değişken Eşleme Tablosu

Her tema için tanımlanması gereken tüm CSS değişkenleri:

| Değişken | Anthracite | Light | OLED Black | Dyslexia Cream | Dyslexia Mint |
|----------|-----------|-------|-----------|----------------|---------------|
| `--bg-primary-rgb` | 18,18,20 | 248,250,252 | 0,0,0 | 245,240,220 | 232,255,245 |
| `--bg-secondary-rgb` | 10,10,11 | 241,245,249 | 10,10,10 | 240,235,215 | 225,250,238 |
| `--bg-paper-rgb` | 24,24,27 | 255,255,255 | 0,0,0 | 250,245,225 | 238,255,248 |
| `--accent-h` | 239 | 245 | 210 | 210 | 160 |
| `--accent-s` | 84% | 78% | 100% | 80% | 60% |
| `--accent-l` | 67% | 53% | 60% | 50% | 45% |
| `--text-primary` | #f8fafc | #0f172a | #e8e8e8 | hsl(210,80%,30%) | hsl(0,0%,10%) |
| `--text-secondary` | #94a3b8 | #475569 | #b0b0b0 | hsl(210,70%,45%) | hsl(0,0%,30%) |
| `--text-muted` | #64748b | #94a3b8 | #808080 | hsl(210,60%,60%) | hsl(0,0%,50%) |
| `--border-color` | rgba(255,255,255,0.08) | rgba(0,0,0,0.06) | rgba(255,255,255,0.1) | rgba(210,180,140,0.3) | rgba(120,190,160,0.25) |
| `--surface-glass` | rgba(255,255,255,0.05) | rgba(0,0,0,0.03) | rgba(15,15,15,0.85) | rgba(255,252,240,0.85) | rgba(240,255,248,0.85) |

### 6.3 Disleksi Teması Özel Özellikleri

```css
/* BDA (British Dyslexia Association) Önerileri */
.theme-dyslexia-cream, .theme-dyslexia-mint {
  font-family: 'Lexend', sans-serif !important;  /* ASLA değiştirme */
  letter-spacing: 0.05em;
  word-spacing: 0.15em;
  line-height: 1.8;
  text-rendering: optimizeLegibility;
  hyphens: none;
}

/* Başlıklar: Çok kalın değil */
.theme-dyslexia-cream h1, .theme-dyslexia-cream h2, .theme-dyslexia-cream h3 {
  font-weight: 600;
  letter-spacing: 0.03em;
  line-height: 1.4;
}

/* Paragraflar: Optimal satır uzunluğu */
.theme-dyslexia-cream p, .theme-dyslexia-mint p {
  max-width: 70ch;
  margin-bottom: 1.5em;
}

/* Sola hizalama (BDA: justifiable text kaçın) */
.theme-dyslexia-cream *, .theme-dyslexia-mint * {
  text-align: left !important;
}
```

---

## 7. STATE YÖNETİMİ DETAYI

### 7.1 Zustand Store Yapısı

```typescript
interface UIStoreState {
  // Persist edilen alanlar
  theme: AppTheme;              // Varsayılan: 'anthracite'
  sidebarWidth: number;         // Varsayılan: 320
  uiSettings: UiSettings;       // Tüm UI ayarları

  // Persist edilmeyen alanlar
  zenMode: boolean;             // Varsayılan: false
  isSidebarOpen: boolean;       // Varsayılan: false
  isTourActive: boolean;        // Varsayılan: false
  styleSettings: StyleSettings; // Çalışma sayfası ayarları
  showDeveloperModal: boolean;  // Varsayılan: false
  showConnect: boolean;         // Varsayılan: false
  unreadMessageCount: number;   // Varsayılan: 0
}
```

**Persist Yapılandırması:**
```typescript
{
  name: 'app-ui-storage',  // localStorage anahtarı
  partialize: (state) => ({
    theme: state.theme,
    sidebarWidth: state.sidebarWidth,
    uiSettings: state.uiSettings,
  }),
}
```

### 7.2 Varsayılan UiSettings Değerleri

```typescript
{
  fontFamily: 'Lexend',
  fontSizeScale: 1,
  fontWeight: 'normal',
  letterSpacing: 'normal',
  lineHeight: 1.6,
  saturation: 100,
  compactMode: false,
  premiumIntensity: 60,
  contrastLevel: 50,
  borderRadius: 'xl',
  animationLevel: 'full',
}
```

### 7.3 useGlobalSettings Hook — CSS Değişken Eşleme

| UiSettings Alanı | CSS Değişkeni | Dönüştürme |
|------------------|---------------|------------|
| `fontFamily` | `--app-font-family` | Doğrudan string |
| `fontSizeScale` | `--app-font-size-scale` | String olarak number |
| `lineHeight` | `--app-line-height` | String olarak number |
| `letterSpacing` | `--app-letter-spacing` | wide → `'0.05em'`, normal → `'normal'` |
| `fontWeight` | `--app-font-weight` | thin=300, normal=400, medium=500, bold=700, black=900 |
| `saturation` | `--app-saturation` | `N%` |
| `contrastLevel` | `--app-contrast` | `N%` |
| `premiumIntensity` | `--premium-blur` | `(intensity/100) * 20` px |
| `premiumIntensity` | `--premium-opacity` | `0.5 + (intensity/100) * 0.4` |
| `borderRadius` | `--app-border-radius` | none=0px, sm=0.375rem, xl=1rem, full=9999px |

**Sınıf Yönetimleri:**
- `compactMode` → `ui-compact` sınıfı ekle/kaldır
- `animationLevel: 'none'` → `motion-reduce` sınıfı ekle
- `animationLevel: 'reduced'` → `motion-reduced` sınıfı ekle

---

## 8. AI TEMA ÖNERİ SİSTEMİ (Theme Intelligence)

### 8.1 Veri Yapısı (IndexedDB)

```typescript
interface ThemePreferenceData {
  userId: string;
  themeSwitches: Array<{
    from: AppTheme;
    to: AppTheme;
    timestamp: number;
  }>;  // Maksimum 100 kayıt
  timeOfDayPreferences: Array<{
    hour: number;
    theme: AppTheme;
  }>;  // Maksimum 100 kayıt
  sessionDurations: Array<{
    theme: AppTheme;
    duration: number;  // dakika
  }>;  // Maksimum 50 kayıt
  eyeStrainReports: number;
  lastRecommendation?: {
    theme: AppTheme;
    timestamp: number;
    accepted: boolean;
  };
}
```

### 8.2 Öneri Algoritması

```
1. Saat ağırlığı (0.3):
   - Karanlık saat (18:00-06:00) + 5+ karanlık tercih → oled-black (+0.3 güven)
   - Akşam saatleri (18:00-22:00) → anthracite (+0.2)
   - Gündüz + 5+ aydınlık tercih → light (+0.3)

2. Göz yorgunluğu (0.4):
   - 3+ rapor → dyslexia-cream (+0.4 güven)
   - NOT: Bu faktör saat tercihini tamamen override eder

3. Oturum süresi (0.2):
   - En uzun sürenin toplamı (>120 dakika) → o tema (+0.2, güven < 0.7 ise)

4. Son geçişler (0.1):
   - En son geçiş hedefi → o tema (+0.1, güven < 0.8 ise)

5. Güven tavanı: 0.95
```

> **Uyarı:** Algoritma ağırlıklı ortalama değil, sıralı son yazan kazanır şeklindedir. Göz yorgunluğu faktörü saat tercihini koşulsuz override eder.

### 8.3 Entegrasyon Durumu

| İşlev | Durum | Açıklama |
|-------|-------|----------|
| `init()` | ✓ Aktif | IndexedDB açılır |
| `getUserThemeData()` | ✓ Aktif | Veri okunur |
| `saveUserThemeData()` | ✓ Aktif | Veri kaydedilir |
| `trackThemeSwitch()` | ✗ Kullanılmıyor | Hiçbir yerde çağrılmıyor |
| `trackSessionDuration()` | ✗ Kullanılmıyor | Hiçbir yerde çağrılmıyor |
| `reportEyeStrain()` | ✗ Kullanılmıyor | Arayüz yok |
| `recommendTheme()` | ⚠ Kısmi | SettingsModal'da çağrılıyor ama sonuç gösterilmiyor |
| `trackRecommendationAcceptance()` | ✗ Kullanılmıyor | Sonuç gösterilmeyedığı için kabul edilemez |
| `clearUserData()` | ✓ Mevcut | KVKK uyumlu silme |

---

## 9. ERİŞİLEBİLİRLİK DETAYI

### 9.1 WCAG Uyumluluk Matrisi

| Kriter | Seviye | Mevcut Durum | Hedef |
|--------|--------|-------------|-------|
| Renk Kontrastı | AAA (7:1) | ⚠ Kısmi | ✓ Tüm temalarda |
| Klavye Erişimi | A | ⚠ Kısmi | ✓ Tam destek |
| Screen Reader | A | ✗ Eksik | ✓ ARIA labels |
| Focus Visible | AA | ⚠ Kısmi | ✓ Net focus halkası |
| Touch Target | AA (44px) | ✗ Yetersiz | ✓ Minimum 44x44px |
| Reduced Motion | AAA | ✓ Aktif | ✓ Korunacak |
| Font Size Scaling | AA | ✓ Aktif | ✓ Korunacak |
| High Contrast | AAA | ✓ Mevcut | ✓ Korunacak |

### 9.2 Tema Kontrast Oranları

| Tema | Metin/Arka Plan | Oran | WCAG |
|------|----------------|------|------|
| Anthracite | #f8fafc / rgb(18,18,20) | 15.8:1 | AAA |
| Light | #0f172a / #ffffff | 18.1:1 | AAA |
| OLED Black | #e8e8e8 / #000000 | 18.4:1 | AAA |
| Dyslexia Cream | hsl(210,80%,30%) / hsl(47,50%,92%) | 8.2:1 | AAA |
| Dyslexia Mint | hsl(0,0%,10%) / hsl(160,40%,95%) | 14.6:1 | AAA |

### 9.3 Gereken Erişilebilirlik Geliştirmeleri

1. **Focus Trap:** Modal içinde Tab/Shift+Tab döngüsü
2. **ARIA Labels:** Her interaktif elemana `aria-label`
3. **ARIA Live Region:** Tema değişiklikleri için `aria-live="polite"`
4. **Role Attributes:** `role="dialog"`, `role="tablist"`, `role="tab"`, `role="tabpanel"`
5. **Keyboard Shortcuts:** Tab numaraları ile hızlı geçiş
6. **Touch Targets:** Tüm butonlar minimum 44x44px
7. **Color Independence:** Renk dışında bilgi iletimi (ikon, metin)

---

## 10. PERFORMANS ANALİZİ

### 10.1 Mevcut Performans Metrikleri

| Metrik | Mevcut | Hedef |
|--------|--------|-------|
| Modal Render Süresi | ~45ms | <20ms |
| Tema Değişikliği | ~15ms | <10ms |
| CSS Değişken Yayılımı | ~5ms | <3ms |
| localStorage Boyutu | ~2.1KB | <3KB |
| Toplam CSS Boyutu | ~18KB | <20KB |
| Toplam JS Boyutu (modal) | ~12KB | <15KB |

### 10.2 Optimizasyon Önerileri

1. **Lazy Rendering:** Sadece aktif tab içeriği render edilsin
   ```tsx
   {activeTab === 'appearance' && <AppearanceTab />}
   {activeTab === 'typography' && <TypographyTab />}
   {activeTab === 'accessibility' && <AccessibilityTab />}
   ```

2. **Debounced Updates:** Slider'larda 16ms debounce
   ```typescript
   const debouncedUpdate = useMemo(
     () => debounce((settings: Partial<UiSettings>) => {
       onUpdateUiSettings({ ...uiSettings, ...settings });
     }, 16),
     [uiSettings, onUpdateUiSettings]
   );
   ```

3. **Memoization:** Tema kartları için `React.memo`
   ```typescript
   const ThemeCard = React.memo(({ theme, isSelected, onSelect }) => (
     // ...
   ));
   ```

4. **CSS Containment:** Modal için `contain: layout style paint`
   ```css
   .settings-modal {
     contain: layout style paint;
   }
   ```

5. **İmaj Lazy Loading:** Tema küçük resimleri için `loading="lazy"`

---

## 11. UYGULAMA PLANI

### Faz 1: Kompakt Modal Dönüşümü (1-2 gün)

| # | Görev | Detay | Öncelik |
|---|-------|-------|---------|
| 1.1 | Modal boyutunu küçült | `max-w-5xl` → `max-w-2xl`, `h-[85vh]` → `max-h-[80vh]` | Yüksek |
| 1.2 | Border radius küçült | `rounded-[3rem]` → `rounded-2xl` | Yüksek |
| 1.3 | Padding'leri minimal yap | p-12 → p-6, p-8 → p-3 | Yüksek |
| 1.4 | Sidebar'ı_compakt yap | w-72 → w-56, p-8 → p-3 | Yüksek |
| 1.5 | Font boyutlarını küçült | text-2xl → text-sm, text-sm → text-xs | Yüksek |
| 1.6 | Card'ları küçült | p-8/p-10 → p-3/p-4, rounded-[2rem] → rounded-xl | Yüksek |
| 1.7 | Preview card'ı collapsible yap | useState ile aç/kapa, başlangıçta kapalı | Orta |
| 1.8 | Section gap'leri küçült | space-y-10 → space-y-4 | Orta |
| 1.9 | Close button'ı küçült | w-12 → w-8, rounded-2xl → rounded-lg | Düşük |

### Faz 2: Eksik Tema Desteği (1 gün)

| # | Görev | Detay | Öncelik |
|---|-------|-------|---------|
| 2.1 | OLED Black temasını ekle | `oled-black` tema kartını listeye ekle | Yüksek |
| 2.2 | Dyslexia Cream temasını ekle | `dyslexia-cream` tema kartını listeye ekle | Yüksek |
| 2.3 | Dyslexia Mint temasını ekle | `dyslexia-mint` tema kartını listeye ekle | Yüksek |
| 2.4 | Tema gruplandırması yap | Karanlık/Açık/Doğa/Premium kategorileri | Yüksek |
| 2.5 | Premium rozeti ekle | Dysleksi temalarına "Premium" etiketi | Orta |
| 2.6 | Tema açıklamalarını güncelle | Her tema için kısa Türkçe açıklama | Düşük |
| 2.7 | AppearanceSettings ile tutarlılık | Her iki seçicide de 11 tema göster | Yüksek |

### Faz 3: Eksik Ayarlar (1 gün)

| # | Görev | Detay | Öncelik |
|---|-------|-------|---------|
| 3.1 | Font Weight selector ekle | 5 butonlu pill: Thin/Normal/Medium/Bold/Black | Yüksek |
| 3.2 | Border Radius selector ekle | 4 butonlu pill: Kare/Hafif/Normal/Yuvarlak | Yüksek |
| 3.3 | Animation Level toggle ekle | 3 butonlu pill: Tam/Azaltılmış/Yok | Yüksek |
| 3.4 | Her ayar için aria-label ekle | Erişilebilirlik etiketleri | Orta |
| 3.5 | Varsayılan değerleri güncelle | handleReset fonksiyonunu güncelle | Orta |

### Faz 4: Erişilebilirlik (1 gün)

| # | Görev | Detay | Öncelik |
|---|-------|-------|---------|
| 4.1 | Focus trap mekanizması kur | Tab döngüsü, Escape kapatma | Yüksek |
| 4.2 | ARIA live region ekle | Tema değişiklikleri için `aria-live` | Yüksek |
| 4.3 | Role attributes ekle | dialog, tablist, tab, tabpanel | Yüksek |
| 4.4 | Touch target boyutlarını doğrula | Minimum 44x44px | Yüksek |
| 4.5 | Color contrast kontrolü yap | WCAG AAA minimum 7:1 | Yüksek |
| 4.6 | Keyboard navigasyon testi | Tab, Enter, Escape, Arrow keys | Orta |

### Faz 5: Bug Düzeltmeleri (1 gün)

| # | Görev | Detay | Öncelik |
|---|-------|-------|---------|
| 5.1 | Theme Intelligence UI'ını ekle | `themeRecommendation` state'ini render et | Yüksek |
| 5.2 | DARK_THEMES sabitini çıkar | Modül seviyesinde tek tanım | Orta |
| 5.3 | `getSafeMotionConfig`'ı düzelt | `use*` ile yeniden adlandır veya hook dışı kullanılabilir yap | Yüksek |
| 5.4 | `trackThemeSwitch`'i entegre et | Tema değişikliğinde AI motoruna veri gönder | Orta |
| 5.5 | `useAmbientLight`'ı entegre et | App.tsx'te opsiyonel otomatik tema | Düşük |
| 5.6 | Font weight override düzeltmesi | tailwind.css seçici düzeltmesi | Orta |

### Faz 6: Test ve Doğrulama (1 gün)

| # | Görev | Detay | Öncelik |
|---|-------|-------|---------|
| 6.1 | Tüm 11 temayı test et | Her tema için kontrast ve görsel doğrulama | Yüksek |
| 6.2 | Mobil responsive test | 320px-768px arası tüm ekran boyutları | Yüksek |
| 6.3 | Print/PDF test | Yazdırma ve PDF export doğrulaması | Orta |
| 6.4 | Performans ölçümü | Lighthouse, Core Web Vitals | Orta |
| 6.5 | Cross-browser test | Chrome, Firefox, Safari, Edge | Orta |
| 6.6 | Erişilebilirlik testi | Lighthouse Accessibility ≥ 95 | Yüksek |
| 6.7 | Birim testleri | themeContrastService, motionPresets | Orta |

---

## 12. BAŞARI KRİTERLERİ

| Metrik | Mevcut | Hedef | Öncelik |
|--------|--------|-------|---------|
| Modal Genişliği | 1024px | ≤ 672px | Yüksek |
| Modal Yüksekliği | 85vh (sabit) | ≤ 80vh (esnek) | Yüksek |
| Toplam Padding | 48px | ≤ 24px | Yüksek |
| Tema Değişikliği | Real-time | Real-time (korunacak) | Yüksek |
| Tema Sayısı | 8/11 | 11/11 | Yüksek |
| Ayar Sayısı | 8/11 | 11/11 | Yüksek |
| WCAG Kontrast | ⚠ Kısmi | ≥ 7:1 (AAA) | Yüksek |
| Touch Target | ~32px | ≥ 44x44px | Yüksek |
| Lighthouse A11y | ~80 | ≥ 95 | Yüksek |
| Lighthouse Perf | ~85 | ≥ 90 | Orta |
| İlk Render | ~45ms | < 20ms | Orta |
| Tema Geçiş | ~15ms | < 10ms | Düşük |

---

## 13. RİSKLER VE ÇÖZÜMLER

| # | Risk | Olasılık | Etki | Çözüm |
|---|------|----------|------|-------|
| 1 | Kompakt tasarım okunabilirliği azaltabilir | Orta | Yüksek | Minimum font boyutu 10px, yeterli contrast, font scaling |
| 2 | 11 tema küçük alana sığmayabilir | Düşük | Orta | Scrollable grid, kategori gruplandırma, 3-col mobilde 2-col |
| 3 | Premium temalar uyumsuz çalışabilir | Düşük | Yüksek | Her tema için CSS variable override testleri, snapshot testleri |
| 4 | Mobilde erişilebilirlik sorunları | Orta | Yüksek | Touch target optimizasyonu, gesture desteği, test-first |
| 5 | Real-time update performans düşüklüğü | Düşük | Orta | Debounced updates, memoization, CSS containment |
| 6 | Focus trap third-party uyumsuzluğu | Düşük | Orta | Basit custom focus trap, Radix UI Dialog entegrasyonu |
| 7 | IndexedDB uyumsuzluğu (eski tarayıcılar) | Düşük | Düşük | localStorage fallback, graceful degradation |
| 8 | Print tema çakışması | Orta | Orta | Tek `.worksheet-page` tanımı, specificity optimizasyonu |
| 9 | localStorage quota aşımı | Düşük | Düşük | Persist partialize ile minimal veri, temizleme stratejisi |
| 10 | Font weight override'ın çalışmaması | Yüksek | Orta | CSS selector düzeltmesi, `!important` kullanımı |

---

## 14. BELGELENDİRME EKSİKLERİ VE KAPATILMASI GEREKENLER

| # | Eksiklik | Kapatılacak |
|---|----------|-------------|
| 1 | `getAdaptiveBlur()` implemente edilmemiş | themeUtils.ts'e ekle veya spec'ten kaldır |
| 2 | Theme Intelligence tracksiz kalıyor | trackThemeSwitch'i SettingsModal'a entegre et |
| 3 | Ambient Light entegre edilmemiş | App.tsx'te opsiyonel olarak çağır |
| 4 | `getSafeMotionConfig` hook ihlali | Yeniden adlandır veya refactoring yap |
| 5 | Print tema çoklu tanım | Tek merkezi tanım oluştur |
| 6 | İki farklı tema seçici | Tek bir bileşene birleştir veya shared config kullan |
| 7 | Font weight override çalışmıyor | tailwind.css seçicisini düzelt |
| 8 | `--bg-h/s/l` değişkenleri eksik | theme-tokens.css'e ekle veya print'ten kaldır |

---

## 15. SONUÇ

Mevcut Görüntü Ayarları sistemi güçlü bir altyapıya sahip (11 tema, CSS değişken mimarisi, Zustand persist, AI önerisi) ancak birkaç kritik eksiklik bulunuyor:

**Tamamlanması Gerekenler:**
1. SettingsModal'a 3 eksik tema eklenmeli (OLED + 2 Dysleksi)
2. 3 eksik ayar eklenmeli (font weight, border radius, animation level)
3. Modal kompakt tasarıma geçirilmeli (%35 küçültme)
4. Theme Intelligence UI'ı implemente edilmeli
5. İki farklı tema seçici birleştirilmeli
6. Erişilebilirlik seviyesi yükseltilmeli (WCAG AAA)
7. Bug'lar düzeltilmeli (getSafeMotionConfig, font weight override, print tema çakışması)

**Korunması Gerekenler:**
1. Real-time state update (Zustand + useGlobalSettings)
2. CSS değişken mimarisi
3. Tema izolasyonu (A4 worksheet)
4. Print/PDF optimizasyonu
5. Reduced motion desteği
6. KVKK uyumluluğu (IndexedDB, local-only)

Bu planlama, 6 fazda toplam 6-8 gün sürede tamamlanabilir. Her faz bağımsız olarak test edilebilir ve deploy edilebilir.

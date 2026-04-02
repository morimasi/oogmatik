# Premium UI Theme Modernization Specification
**Tarih:** 2026-04-02
**Durum:** Tasarım — Onay Bekliyor
**Öncelik:** Yüksek — Premium UX
**Sahipler:** @ozel-ogrenme-uzmani (pedagojik), @frontend-developer-oozel (UI), @yazilim-muhendisi (mimari)

---

## 🎯 Executive Summary

Oogmatik platformunun mevcut tema sistemi, 8 tema ile temel işlevsellik sağlıyor. Bu modernizasyon, **Premium UX standartlarını** karşılayan, disleksi-uyumlu, erişilebilir ve görsel olarak sofistike bir tema sistemine evrilmeyi hedefliyor.

### Stratejik Hedefler
1. **Premium Glassmorphism 2.0**: Depth, micro-interactions, adaptive blur
2. **Disleksi Uyumluluğu**: WCAG AAA + British Dyslexia Association standartları
3. **Tema Intelligence**: Kullanıcı davranış analizi ile dinamik tema önerileri
4. **Motion Design System**: Framer Motion ile premium animasyon kütüphanesi
5. **Dark Mode Excellence**: True OLED black, adaptive contrast
6. **Export Fidelity**: PDF/Print'te tema görünümü %100 korunmalı

---

## 📊 Current State Analysis

### ✅ Strengths (Korunacaklar)
- **HSL Variable System**: `--accent-h/s/l` flexibility (renk manipülasyonu kolaylığı)
- **8 Diverse Themes**: Light (1) + Dark (7) dengesi
- **Lexend Font Integration**: Disleksi standartlarına uygun
- **CSS Variables**: Dynamic theming foundation
- **Glassmorphism Base**: `--surface-glass`, `--glass-blur` mevcudiyeti

### ⚠️ Limitations (İyileştirilecekler)
1. **Static Theme Tokens**: Kullanıcı tercihi/profil bazlı dinamik adaptasyon yok
2. **Basic Glassmorphism**: Tek katmanlı blur, depth perception eksik
3. **No Animation System**: Micro-interactions manuel, tutarsız
4. **Limited Accessibility**: Contrast ratio kontrolü runtime'da yok
5. **Print Discrepancy**: PDF'de tema görünümü kayboluyor
6. **No Theme Intelligence**: Kullanıcı davranış analizi yok
7. **Primitive Dark Mode**: OLED optimization, adaptive contrast yok

---

## 🏗️ Premium Architecture Blueprint

### 1. Multi-Layer Glassmorphism System

#### 1.1. Depth System (Z-Elevation)
```css
/* src/styles/theme-premium.css */
:root {
  /* 5 Katmanlı Elevation */
  --glass-base: rgba(255, 255, 255, 0.05);      /* Z-1: Background cards */
  --glass-elevated: rgba(255, 255, 255, 0.08);  /* Z-2: Panels */
  --glass-floating: rgba(255, 255, 255, 0.12);  /* Z-3: Modals */
  --glass-popup: rgba(255, 255, 255, 0.18);     /* Z-4: Tooltips */
  --glass-focus: rgba(255, 255, 255, 0.25);     /* Z-5: Active elements */

  /* Adaptive Blur (mesafeye göre artar) */
  --blur-near: 8px;    /* Z-1 */
  --blur-mid: 16px;    /* Z-2-3 */
  --blur-far: 24px;    /* Z-4-5 */

  /* Border Intensity (elevation ile orantılı) */
  --border-subtle: rgba(255, 255, 255, 0.08);
  --border-medium: rgba(255, 255, 255, 0.15);
  --border-strong: rgba(255, 255, 255, 0.25);
}

.theme-dark, .theme-obsidian, .theme-anthracite {
  --glass-base: rgba(20, 20, 25, 0.4);
  --glass-elevated: rgba(25, 25, 30, 0.6);
  --glass-floating: rgba(30, 30, 35, 0.75);
  --glass-popup: rgba(35, 35, 40, 0.85);
  --glass-focus: rgba(40, 40, 45, 0.95);
}
```

#### 1.2. Glass Component Classes
```css
/* Katman bazlı sınıflar */
.glass-layer-1 { /* Background cards */
  background: var(--glass-base);
  backdrop-filter: blur(var(--blur-near)) saturate(180%);
  border: 1px solid var(--border-subtle);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
}

.glass-layer-2 { /* Panels */
  background: var(--glass-elevated);
  backdrop-filter: blur(var(--blur-mid)) saturate(180%);
  border: 1px solid var(--border-medium);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
}

.glass-layer-3 { /* Modals */
  background: var(--glass-floating);
  backdrop-filter: blur(var(--blur-far)) saturate(180%);
  border: 1px solid var(--border-strong);
  box-shadow: 0 16px 64px rgba(0, 0, 0, 0.16);
}
```

#### 1.3. Adaptive Blur (Context-Aware)
```typescript
// src/utils/themeUtils.ts (enhanced)
export function getAdaptiveBlur(context: 'idle' | 'hover' | 'focus' | 'drag'): string {
  switch (context) {
    case 'idle':   return 'blur(12px)';
    case 'hover':  return 'blur(16px) brightness(1.05)';
    case 'focus':  return 'blur(20px) brightness(1.1) saturate(120%)';
    case 'drag':   return 'blur(24px) brightness(0.95) saturate(90%)';
  }
}
```

---

### 2. Premium Motion Design System

#### 2.1. Framer Motion Presets
```typescript
// src/utils/motionPresets.ts (NEW)
import { Variants } from 'framer-motion';

export const premiumMotion = {
  // Glass Panel Enter
  glassEnter: {
    initial: { opacity: 0, scale: 0.95, y: 20, filter: 'blur(10px)' },
    animate: {
      opacity: 1,
      scale: 1,
      y: 0,
      filter: 'blur(0px)',
      transition: {
        duration: 0.6,
        ease: [0.16, 1, 0.3, 1], // Custom cubic-bezier (premium ease)
      }
    },
    exit: { opacity: 0, scale: 0.9, y: -20, filter: 'blur(10px)' }
  },

  // Micro-Interaction: Button Hover
  buttonHover: {
    rest: { scale: 1, boxShadow: '0 4px 12px rgba(0,0,0,0.08)' },
    hover: {
      scale: 1.02,
      boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
      transition: { duration: 0.2, ease: 'easeOut' }
    },
    tap: { scale: 0.98 }
  },

  // Stagger Children (List animations)
  staggerContainer: {
    animate: {
      transition: { staggerChildren: 0.07, delayChildren: 0.1 }
    }
  },

  staggerChild: {
    initial: { opacity: 0, x: -20 },
    animate: { opacity: 1, x: 0 }
  },

  // Page Transition
  pageTransition: {
    initial: { opacity: 0, x: 300 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -300 },
    transition: { duration: 0.5, ease: [0.43, 0.13, 0.23, 0.96] }
  },

  // Premium Glow (Success feedback)
  glowPulse: {
    animate: {
      boxShadow: [
        '0 0 0 0 hsla(var(--accent-h), var(--accent-s), var(--accent-l), 0)',
        '0 0 20px 8px hsla(var(--accent-h), var(--accent-s), var(--accent-l), 0.3)',
        '0 0 0 0 hsla(var(--accent-h), var(--accent-s), var(--accent-l), 0)',
      ],
      transition: { duration: 1.5, repeat: 3 }
    }
  }
} as const;
```

#### 2.2. Reduced Motion Support (Accessibility)
```typescript
// src/hooks/useReducedMotion.ts (NEW)
export function useReducedMotion(): boolean {
  const [prefersReduced, setPrefersReduced] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReduced(mediaQuery.matches);

    const handler = (e: MediaQueryListEvent) => setPrefersReduced(e.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  return prefersReduced;
}

// Motion preset'leri otomatik devre dışı bırak
export function getMotionConfig(preset: keyof typeof premiumMotion) {
  const reducedMotion = useReducedMotion();
  if (reducedMotion) {
    return { initial: {}, animate: {}, transition: { duration: 0 } };
  }
  return premiumMotion[preset];
}
```

---

### 3. Disleksi-Uyumlu Premium Themes

#### 3.1. Contrast Compliance (WCAG AAA)
```typescript
// src/utils/contrastChecker.ts (NEW)
import { hslToRgb, getLuminance } from './colorUtils';

/**
 * WCAG 2.1 Contrast ratio hesaplama
 * AAA Level: Normal text ≥ 7:1, Large text ≥ 4.5:1
 */
export function getContrastRatio(color1: string, color2: string): number {
  const rgb1 = hslToRgb(color1);
  const rgb2 = hslToRgb(color2);
  const l1 = getLuminance(rgb1);
  const l2 = getLuminance(rgb2);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Tema değişiminde otomatik contrast kontrolü
 */
export function validateThemeContrast(theme: AppTheme): {
  valid: boolean;
  warnings: string[];
} {
  const textColor = getComputedStyle(document.documentElement)
    .getPropertyValue('--text-primary');
  const bgColor = getComputedStyle(document.documentElement)
    .getPropertyValue('--bg-l');

  const ratio = getContrastRatio(textColor, bgColor);
  const warnings: string[] = [];

  if (ratio < 7) {
    warnings.push(`Contrast ratio ${ratio.toFixed(2)}:1 < WCAG AAA (7:1)`);
  }

  return { valid: ratio >= 7, warnings };
}
```

#### 3.2. Dyslexia-Optimized Color Palettes
```css
/* British Dyslexia Association Guidelines */
.theme-dyslexia-cream {
  /* Krem zemin + Mavi metin (BDA önerisi) */
  --bg-h: 47;
  --bg-s: 50%;
  --bg-l: 92%;
  --text-primary: hsl(210, 80%, 35%); /* Koyu mavi */
  --accent-h: 210;
  --accent-s: 80%;
  --accent-l: 50%;
}

.theme-dyslexia-mint {
  /* Açık mint + Siyah metin */
  --bg-h: 160;
  --bg-s: 40%;
  --bg-l: 95%;
  --text-primary: hsl(0, 0%, 10%);
}

/* Dyslexia-friendly text rendering */
body.dyslexia-mode {
  font-family: 'Lexend', sans-serif !important; /* ASLA değişmez */
  letter-spacing: 0.05em;
  word-spacing: 0.15em;
  line-height: 1.8;
  text-rendering: optimizeLegibility;
  -webkit-font-smoothing: antialiased;
}
```

---

### 4. Theme Intelligence (AI-Powered Personalization)

#### 4.1. User Behavior Analytics
```typescript
// src/services/themeIntelligence.ts (NEW)
interface ThemePreferenceData {
  userId: string;
  themeSwitches: { from: AppTheme; to: AppTheme; timestamp: number }[];
  timeOfDayPreferences: { hour: number; theme: AppTheme }[];
  activityTypeThemes: { activity: ActivityType; theme: AppTheme }[];
  sessionDuration: number;
  eyeStrainReports: number; // Kullanıcı geri bildirimi
}

export class ThemeIntelligenceService {
  /**
   * Kullanıcı davranışına göre optimal tema öner
   */
  async recommendTheme(userId: string): Promise<{
    theme: AppTheme;
    confidence: number;
    reason: string;
  }> {
    const data = await this.getUserThemeData(userId);
    const currentHour = new Date().getHours();

    // Saat bazlı analiz (18:00-06:00 arası dark mode tercihi)
    const isDarkHours = currentHour >= 18 || currentHour < 6;
    const userPrefersDarkAtNight = data.timeOfDayPreferences
      .filter(p => p.hour >= 18 || p.hour < 6)
      .filter(p => p.theme.includes('dark') || p.theme.includes('space'))
      .length > 5;

    if (isDarkHours && userPrefersDarkAtNight) {
      return {
        theme: 'obsidian',
        confidence: 0.85,
        reason: 'Akşam saatlerinde koyu tema tercih ediyorsunuz.'
      };
    }

    // Göz yorgunluğu raporları varsa yumuşak tema öner
    if (data.eyeStrainReports > 3) {
      return {
        theme: 'dyslexia-cream',
        confidence: 0.9,
        reason: 'Göz yorgunluğunu azaltmak için önerildi.'
      };
    }

    return { theme: data.themeSwitches[0]?.to || 'light', confidence: 0.5, reason: '' };
  }

  /**
   * Otomatik tema değişimi (opsiyonel)
   */
  enableAutoSwitch(userId: string) {
    setInterval(async () => {
      const recommendation = await this.recommendTheme(userId);
      if (recommendation.confidence > 0.8) {
        // Kullanıcıya notification göster
        showNotification({
          title: 'Tema Önerisi',
          message: recommendation.reason,
          action: () => setTheme(recommendation.theme)
        });
      }
    }, 1000 * 60 * 30); // 30 dakikada bir kontrol
  }
}
```

---

### 5. True OLED Dark Mode

#### 5.1. OLED Optimization
```css
/* src/styles/theme-oled.css (NEW) */
.theme-oled-black {
  /* True black (#000) OLED pixel kapatma */
  --bg-h: 0;
  --bg-s: 0%;
  --bg-l: 0%;
  --text-primary: #e0e0e0;
  --accent-h: 210;
  --accent-s: 100%;
  --accent-l: 60%;

  /* OLED için glow effects */
  --glow-soft: 0 0 20px rgba(33, 150, 243, 0.3);
  --glow-medium: 0 0 40px rgba(33, 150, 243, 0.5);
}

/* Adaptive contrast (ortam ışığına göre) */
@media (prefers-contrast: more) {
  .theme-oled-black {
    --text-primary: #ffffff;
    --accent-l: 70%;
  }
}
```

#### 5.2. Ambient Light Adaptation (Experimental)
```typescript
// src/hooks/useAmbientLight.ts (NEW)
/**
 * Ambient Light Sensor API kullanarak otomatik brightness
 * @see https://developer.mozilla.org/en-US/docs/Web/API/AmbientLightSensor
 */
export function useAmbientLight() {
  const [lux, setLux] = useState<number>(500); // Default: normal room

  useEffect(() => {
    if ('AmbientLightSensor' in window) {
      const sensor = new (window as any).AmbientLightSensor();
      sensor.onreading = () => setLux(sensor.illuminance);
      sensor.start();
      return () => sensor.stop();
    }
  }, []);

  // Lux → Theme mapping
  if (lux < 50) return 'oled-black';    // Karanlık ortam
  if (lux < 200) return 'obsidian';     // Loş ışık
  if (lux > 1000) return 'light';       // Parlak ışık
  return 'anthracite';                  // Normal
}
```

---

### 6. Export Fidelity (PDF/Print)

#### 6.1. Print-Specific Theme Override
```css
/* src/styles/theme-print.css (NEW) */
@media print {
  /* Print'te tüm temalar light-optimized'a dönüşür */
  :root {
    --bg-h: 0;
    --bg-s: 0%;
    --bg-l: 100%;
    --text-primary: #000000;
    --border-color: #cccccc;

    /* Glassmorphism devre dışı (mürekkep tasarrufu) */
    --surface-glass: transparent;
    --glass-blur: 0px;
  }

  /* Arka plan görselleri kaldır */
  .glass-panel, .glass-layer-1, .glass-layer-2 {
    background: white !important;
    backdrop-filter: none !important;
    border: 1px solid #e0e0e0 !important;
  }

  /* Renkli vurgular siyah-beyaza dönüştür */
  .accent-bg {
    background: #f5f5f5 !important;
    color: #000000 !important;
  }
}

/* PDF export için özel tema */
body.pdf-export-mode {
  /* Tüm sayfa A4 optimize */
  width: 210mm;
  height: 297mm;
  margin: 0;
  padding: 15mm;

  /* Print-safe colors */
  --bg-l: 100%;
  --text-primary: #000000;

  /* Shadow'lar kaldır (baskıda görünmez) */
  * {
    box-shadow: none !important;
    text-shadow: none !important;
  }
}
```

#### 6.2. PDF Export with Theme Preservation (Optional)
```typescript
// src/utils/printService.ts (enhanced)
export async function exportToPdfWithTheme(
  element: HTMLElement,
  preserveTheme: boolean = false
) {
  if (preserveTheme) {
    // Tema renklerini inline style'a dönüştür
    const themeVars = getComputedThemeVars();
    element.style.setProperty('--bg-h', themeVars.bgH);
    element.style.setProperty('--accent-h', themeVars.accentH);
    // ... diğer variables
  } else {
    // Print-safe mode
    document.body.classList.add('pdf-export-mode');
  }

  await generatePDF(element);

  if (!preserveTheme) {
    document.body.classList.remove('pdf-export-mode');
  }
}
```

---

### 7. Theme Switcher UX Enhancements

#### 7.1. Animated Theme Transition
```typescript
// src/components/ThemeSwitcher.tsx (enhanced)
export function ThemeSwitcher() {
  const [isTransitioning, setIsTransitioning] = useState(false);

  const handleThemeChange = async (newTheme: AppTheme) => {
    setIsTransitioning(true);

    // Smooth fade transition
    document.body.style.transition = 'background-color 0.6s ease, color 0.6s ease';

    // Apply new theme
    document.documentElement.className = `theme-${newTheme}`;

    // Wait for CSS transition
    await new Promise(resolve => setTimeout(resolve, 600));

    setIsTransitioning(false);
    document.body.style.transition = '';
  };

  return (
    <motion.div
      className="glass-layer-2 rounded-2xl p-6"
      variants={premiumMotion.glassEnter}
    >
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {themes.map(theme => (
          <ThemeCard
            key={theme.id}
            theme={theme}
            onClick={() => handleThemeChange(theme.id)}
            disabled={isTransitioning}
          />
        ))}
      </div>
    </motion.div>
  );
}
```

#### 7.2. Theme Preview (Hover)
```typescript
function ThemeCard({ theme, onClick }: ThemeCardProps) {
  const [isHovering, setIsHovering] = useState(false);

  return (
    <motion.button
      className="relative overflow-hidden rounded-xl aspect-square"
      style={{ background: theme.color }}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      variants={premiumMotion.buttonHover}
      whileHover="hover"
      whileTap="tap"
      onClick={onClick}
    >
      {/* Live preview overlay */}
      <AnimatePresence>
        {isHovering && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="absolute inset-0 p-2"
          >
            <MiniPreview theme={theme} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Theme name */}
      <div className="absolute bottom-2 left-2 text-sm font-medium">
        {theme.name}
      </div>
    </motion.button>
  );
}
```

---

## 📋 Implementation Checklist

### Phase 1: Foundation (Week 1)
- [ ] Create `src/styles/theme-premium.css` with multi-layer glass system
- [ ] Implement `src/utils/motionPresets.ts` with Framer Motion presets
- [ ] Add `src/hooks/useReducedMotion.ts` for accessibility
- [ ] Implement `src/utils/contrastChecker.ts` with WCAG AAA validation
- [ ] Unit tests: Contrast checker, motion preset fallbacks

### Phase 2: Theme Intelligence (Week 2)
- [ ] Create `src/services/themeIntelligence.ts`
- [ ] Implement behavior tracking (theme switches, time-of-day)
- [ ] Add recommendation engine
- [ ] Create notification UI for theme suggestions
- [ ] Privacy: Ensure data stored locally (IndexedDB), KVKK compliant

### Phase 3: OLED & Adaptive Themes (Week 2)
- [ ] Create `src/styles/theme-oled.css`
- [ ] Implement `src/hooks/useAmbientLight.ts` (if supported)
- [ ] Add 2 new dyslexia-optimized themes (cream, mint)
- [ ] Test on OLED devices (Samsung Galaxy, iPhone 13 Pro)

### Phase 4: Motion Design Integration (Week 3)
- [ ] Refactor `SettingsModal.tsx` with `premiumMotion.glassEnter`
- [ ] Add stagger animations to `WorksheetsList.tsx`
- [ ] Implement page transitions in `App.tsx`
- [ ] Add micro-interactions to all buttons (hover, tap)
- [ ] E2E test: Verify reduced motion works

### Phase 5: Print/Export Fidelity (Week 3)
- [ ] Create `src/styles/theme-print.css`
- [ ] Enhance `src/utils/printService.ts` with theme preservation option
- [ ] Add "Preserve Theme in PDF" toggle in export modal
- [ ] Test PDF exports across all 8 themes
- [ ] Verify A4 layout integrity

### Phase 6: UX Polish (Week 4)
- [ ] Enhance `ThemeSwitcher.tsx` with animated transitions
- [ ] Add hover preview for theme cards
- [ ] Implement "Auto Theme" mode (time-of-day + behavior)
- [ ] Add theme usage analytics to Admin Dashboard
- [ ] User testing: Gather feedback from 10 teachers

### Phase 7: Documentation & Deployment (Week 4)
- [ ] Update `CLAUDE.md` with new theme rules
- [ ] Document motion presets in `.claude/knowledge/MOTION_DESIGN.md`
- [ ] Create video tutorial: "Tema Sistemini Kullanma"
- [ ] Deploy to staging, run full QA
- [ ] Production release

---

## 🎓 Pedagojik Onay Kriterleri (Elif Yıldız)

1. **Disleksi Uyumluluğu**: Tüm temalar Lexend font + WCAG AAA contrast'ı sağlamalı
2. **Dikkat Dağıtmama**: Animasyonlar göze batmamalı, öğrenci dikkatini bölmemeli
3. **Başarı Mimarisi**: Tema geçişleri "premium his" vermeli, öğrenci motivasyonunu artırmalı
4. **Erişilebilirlik**: Reduced motion desteği zorunlu
5. **Yazdırma Kalitesi**: PDF'de içerik %100 okunabilir olmalı

---

## 🏥 Klinik Onay Kriterleri (Dr. Ahmet Kaya)

1. **Göz Yorgunluğu**: OLED dark mode, uzun çalışma seanslarında göz yorgunluğunu azaltmalı
2. **Duyusal Uyum**: Otizm spektrumundaki çocuklar için "Sakin Mod" (muted colors, no animation)
3. **KVKV Uyumu**: Tema tercihi verileri anonim, yerel depolanmalı
4. **Ebeveyn Kontrolü**: Çocuk öğrenci hesaplarında tema kısıtlama özelliği

---

## 🔧 Teknik Onay Kriterleri (Bora Demir)

1. **Performance**: Theme switch < 100ms, 60 FPS animasyonlar
2. **TypeScript Strict**: Tüm yeni kod `any` yasağına uymalı
3. **Test Coverage**: Motion presets, contrast checker > %90 coverage
4. **Bundle Size**: Framer Motion tree-shaking ile < 50KB eklenmeli
5. **Browser Support**: Chrome 90+, Safari 14+, Firefox 88+

---

## 💡 AI Onay Kriterleri (Selin Arslan)

1. **Theme Intelligence Accuracy**: Recommendation confidence > %80
2. **Data Privacy**: Kullanıcı davranış verisi Gemini'ye gönderilmemeli (local processing)
3. **Fallback Logic**: API fail durumunda son kullanılan tema korunmalı
4. **Token Economy**: Tema önerisi için AI kullanmıyoruz (rule-based system yeterli)

---

## 🚀 Success Metrics

### KPIs (4 Hafta Sonra)
- **Theme Adoption Rate**: %70+ kullanıcı varsayılan tema dışında deneme yapsın
- **Auto Theme Acceptance**: %50+ kullanıcı AI önerisini kabul etsin
- **Eye Strain Reports**: %40 azalma (user feedback survey)
- **Print Quality Score**: Teachers rate PDF exports ≥ 4.5/5
- **Performance**: Theme switch time < 100ms (P95)

### A/B Test Scenarios
1. **Control Group**: Mevcut 8 tema sistemi
2. **Test Group A**: Premium glassmorphism + motion design
3. **Test Group B**: Tema + AI recommendations

---

## 🎨 Visual References

### Inspiration Sources
- **Glassmorphism**: [Apple iOS 17 Control Center](https://www.apple.com/ios/ios-17/)
- **Motion Design**: [Stripe Dashboard Animations](https://stripe.com/docs/dashboard)
- **Dark Mode**: [Linear App](https://linear.app) (OLED optimization)
- **Dyslexia UX**: [Dyslexie Font Website](https://www.dyslexiefont.com/)

---

## 📝 Notlar

- **Lexend Font Kutsaldır**: Hiçbir tema Lexend'i override edemez (CLAUDE.md Kural #5)
- **Print First**: PDF export, UI güzelliğinden önce gelir
- **Progressive Enhancement**: Ambient Light Sensor gibi yeni API'ler fallback ile
- **User Control**: AI önerileri her zaman opsiyonel, kullanıcı manuel seçimi override edemez

---

**Son Güncelleme:** 2026-04-02
**Onay Durumu:** ⏳ Bekliyor — @ozel-ogrenme-uzmani, @frontend-developer-oozel, @yazilim-muhendisi
**Risk Seviyesi:** 🟡 Orta (UI değişikliği, kullanıcı alışkanlığına etki)

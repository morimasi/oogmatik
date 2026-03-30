# 🎨 SVG & Görsel Üretim Standartları — Oogmatik Premium Çıktı Kılavuzu

> **Hedef**: Her görsel üretimde somut, gerçekçi, kararlı (stabil) ve premium kalitede çıktı.
> Bu belge, `visual-storyteller-oozel`, `ai-muhendisi`, `ozel-ogrenme-uzmani` ve `yazilim-muhendisi` ajanları için zorunlu referanstır.

**Kapsam**: SVG geometri, infografik, grafik (sütun/pasta/çizgi), tablo, ızgara, sembol, şekil, animasyon

---

## 📐 1. SVG TEMEL STANDARTLARI

### 1.1 Her SVG'de Zorunlu Özellikler

```xml
<!-- ZORUNLU: viewBox normalize edilmiş koordinat sistemi -->
<svg
  xmlns="http://www.w3.org/2000/svg"
  viewBox="0 0 200 200"
  width="200"
  height="200"
  role="img"
  aria-label="[İçerik açıklaması]"
>
  <!-- İçerik -->
</svg>
```

**Kurallar**:
- `viewBox` her zaman `"0 0 W H"` formatında — responsive scaling için kritik
- `role="img"` + `aria-label` — erişilebilirlik (WCAG 2.1 AA)
- SVG string'i her zaman `encodeURIComponent()` + `btoa()` ile base64'e çevrilir (A4 export için)
- Boyutlar `px` değil — `%` veya `viewBox` koordinatları kullan

### 1.2 Renk Paleti — Profil Bazlı

```typescript
// Profil renk sistemi — hiçbir ajan rastgele renk kullanmaz
const PROFILE_COLORS = {
  dyslexia: {
    primary: '#4A90D9',     // Ana mavi — tanımlayıcı renk
    secondary: '#F5A623',   // Vurgu turuncu
    background: '#E8F4FD',  // Açık mavi zemin
    text: '#2C3E50',        // Koyu lacivert metin
    success: '#27AE60',     // Doğru/başarılı
    error: '#E74C3C',       // Yanlış/hata
    highlight: '#FFE066',   // Sarı vurgu (hece vurgulama)
  },
  dyscalculia: {
    primary: '#27AE60',     // Ana yeşil
    secondary: '#3498DB',   // Vurgu mavi
    background: '#E8F8F0',  // Açık yeşil zemin
    text: '#1B2631',
    success: '#2ECC71',
    error: '#E74C3C',
    number_highlight: '#F39C12', // Sayı vurgulama
  },
  adhd: {
    primary: '#E74C3C',     // Ana kırmızı-turuncu (dikkat çekici)
    secondary: '#9B59B6',   // Vurgu mor
    background: '#FDEDEC',  // Açık kırmızı zemin
    text: '#2C3E50',
    success: '#27AE60',
    error: '#C0392B',
    accent: '#F39C12',      // Yüksek kontrast vurgu
  },
  mixed: {
    primary: '#8E44AD',     // Ana mor
    secondary: '#2980B9',   // Vurgu mavi
    background: '#F5EEF8',  // Açık mor zemin
    text: '#2C3E50',
    success: '#27AE60',
    error: '#E74C3C',
  },
  general: {
    primary: '#2C3E50',     // Lacivert
    secondary: '#3498DB',   // Mavi
    background: '#EBF5FB',  // Açık zemin
    text: '#1A252F',
    success: '#27AE60',
    error: '#E74C3C',
  }
};
```

### 1.3 Tipografi Standartı

```typescript
// SVG text elementleri için — hiçbir zaman başka font kullanma
const SVG_TYPOGRAPHY = {
  contentFont: 'Lexend, sans-serif',       // ZORUNLU — disleksi uyumluluğu
  adminFont: 'Inter, sans-serif',          // Sadece admin UI'da
  minFontSize: 14,                          // px — daha küçük OLMAZ
  printFontSize: 16,                        // A4 baskıda minimum
  lineHeight: 1.8,                          // Minimum — disleksi standardı
  letterSpacing: '0.05em',                  // Okuma kolaylığı
  wordSpacing: '0.1em',                     // Kelime aralığı
};

// SVG text elementi örneği
`<text
  x="100" y="30"
  font-family="Lexend, sans-serif"
  font-size="16"
  fill="#2C3E50"
  text-anchor="middle"
  letter-spacing="0.05em"
>${metin}</text>`
```

---

## 🔷 2. GEOMETRİK ŞEKİL ÜRETİM STANDARTLARI

### 2.1 Temel Şekil SVG Path'leri

```typescript
// Koordinat sistemi: viewBox="0 0 100 100" normalize edilmiş

// ✅ Eşkenar Üçgen (merkez: 50,50 yarıçap: 40)
const TRIANGLE = "M 50 10 L 90 80 L 10 80 Z";

// ✅ Kare (merkez: 50,50 kenar: 60)
const SQUARE = "M 20 20 H 80 V 80 H 20 Z";

// ✅ Dikdörtgen (orantılı)
const RECTANGLE = "M 10 25 H 90 V 75 H 10 Z";

// ✅ Beşgen
const PENTAGON = "M 50 5 L 95 35 L 78 85 L 22 85 L 5 35 Z";

// ✅ Altıgen
const HEXAGON = "M 50 5 L 90 27 L 90 73 L 50 95 L 10 73 L 10 27 Z";

// ✅ Daire — circle elementi ile (path değil)
// <circle cx="50" cy="50" r="45" />

// ✅ Elips
// <ellipse cx="50" cy="50" rx="45" ry="30" />

// ✅ Paralel Kenar
const PARALLELOGRAM = "M 20 70 L 40 20 L 80 20 L 60 70 Z";

// ✅ Eşkenar Yamuk
const TRAPEZOID = "M 20 70 L 30 20 L 70 20 L 80 70 Z";
```

### 2.2 Matematik Geometrisi SVG Standartları

```xml
<!-- Açı gösterimi (arc) — 60 derece örneği -->
<g>
  <!-- İki kenar -->
  <line x1="50" y1="80" x2="80" y2="30" stroke="#2C3E50" stroke-width="2"/>
  <line x1="50" y1="80" x2="20" y2="30" stroke="#2C3E50" stroke-width="2"/>
  <!-- Açı yayı -->
  <path d="M 65 68 A 20 20 0 0 0 35 68" fill="none" stroke="#E74C3C" stroke-width="1.5"/>
  <!-- Açı etiketi -->
  <text x="50" y="60" font-family="Lexend" font-size="12" text-anchor="middle" fill="#E74C3C">60°</text>
</g>

<!-- Kesir Çubuğu — 3/5 örneği -->
<g>
  <rect x="10" y="40" width="80" height="20" fill="none" stroke="#2C3E50" stroke-width="1.5"/>
  <!-- 5 eşit bölüm -->
  <line x1="26" y1="40" x2="26" y2="60" stroke="#2C3E50" stroke-width="1"/>
  <line x1="42" y1="40" x2="42" y2="60" stroke="#2C3E50" stroke-width="1"/>
  <line x1="58" y1="40" x2="58" y2="60" stroke="#2C3E50" stroke-width="1"/>
  <line x1="74" y1="40" x2="74" y2="60" stroke="#2C3E50" stroke-width="1"/>
  <!-- 3 bölüm dolu (sol) -->
  <rect x="10" y="40" width="48" height="20" fill="#4A90D9" opacity="0.8"/>
</g>

<!-- Sayı Çizgisi — 0'dan 10'a -->
<g>
  <line x1="10" y1="50" x2="90" y2="50" stroke="#2C3E50" stroke-width="2"/>
  <!-- Ok uçları -->
  <polygon points="87,46 95,50 87,54" fill="#2C3E50"/>
  <!-- Tik işaretler ve etiketler (her sayı için) -->
  <!-- Sayılar: x = 10 + (n * 8) için n=0..10 -->
</g>
```

### 2.3 Koordinat Izgarası

```xml
<!-- Koordinat ızgarası — merkez (50,50), 4 kadran -->
<svg viewBox="0 0 200 200">
  <!-- Arka plan ızgara çizgileri -->
  <defs>
    <pattern id="smallGrid" width="10" height="10" patternUnits="userSpaceOnUse">
      <path d="M 10 0 L 0 0 0 10" fill="none" stroke="#E0E0E0" stroke-width="0.5"/>
    </pattern>
  </defs>
  <rect width="200" height="200" fill="url(#smallGrid)"/>
  <!-- Ana eksenler -->
  <line x1="0" y1="100" x2="200" y2="100" stroke="#2C3E50" stroke-width="2"/>
  <line x1="100" y1="0" x2="100" y2="200" stroke="#2C3E50" stroke-width="2"/>
  <!-- Etiketler -->
  <text x="195" y="95" font-family="Lexend" font-size="12">x</text>
  <text x="105" y="12" font-family="Lexend" font-size="12">y</text>
</svg>
```

---

## 📊 3. GRAFİK ÜRETİM STANDARTLARI

### 3.1 Sütun Grafiği (Bar Chart) SVG

```typescript
// Sütun grafiği SVG üretim şablonu
function generateBarChartSVG(data: Array<{etiket: string; deger: number}>, renk: string): string {
  const maxDeger = Math.max(...data.map(d => d.deger));
  const barWidth = 160 / data.length;
  const chartHeight = 120;
  const baseY = 160;

  const bars = data.map((item, i) => {
    const barH = (item.deger / maxDeger) * chartHeight;
    const x = 20 + i * barWidth + barWidth * 0.1;
    const y = baseY - barH;
    const w = barWidth * 0.8;
    return `
      <rect x="${x}" y="${y}" width="${w}" height="${barH}"
            fill="${renk}" rx="3" ry="3"/>
      <text x="${x + w/2}" y="${y - 5}"
            font-family="Lexend" font-size="11" text-anchor="middle"
            fill="#2C3E50">${item.deger}</text>
      <text x="${x + w/2}" y="${baseY + 15}"
            font-family="Lexend" font-size="10" text-anchor="middle"
            fill="#666">${item.etiket}</text>
    `;
  }).join('');

  return `<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
    <!-- Taban çizgisi -->
    <line x1="15" y1="${baseY}" x2="185" y2="${baseY}" stroke="#2C3E50" stroke-width="1.5"/>
    ${bars}
  </svg>`;
}
```

### 3.2 Pasta Grafiği (Pie Chart) SVG

```typescript
// Pasta grafiği — SVG arc path ile
function generatePieChartSVG(data: Array<{etiket: string; deger: number}>): string {
  const total = data.reduce((sum, d) => sum + d.deger, 0);
  const colors = ['#4A90D9', '#27AE60', '#E74C3C', '#F39C12', '#9B59B6'];
  const cx = 100, cy = 100, r = 80;

  let startAngle = -Math.PI / 2; // 12 o'clock'tan başla
  const paths = data.map((item, i) => {
    const angle = (item.deger / total) * 2 * Math.PI;
    const endAngle = startAngle + angle;
    const x1 = cx + r * Math.cos(startAngle);
    const y1 = cy + r * Math.sin(startAngle);
    const x2 = cx + r * Math.cos(endAngle);
    const y2 = cy + r * Math.sin(endAngle);
    const largeArc = angle > Math.PI ? 1 : 0;
    const labelAngle = startAngle + angle / 2;
    const labelR = r * 0.65;
    const lx = cx + labelR * Math.cos(labelAngle);
    const ly = cy + labelR * Math.sin(labelAngle);
    const path = `<path d="M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2} Z"
                  fill="${colors[i % colors.length]}" stroke="white" stroke-width="2"/>
                 <text x="${lx}" y="${ly}" font-family="Lexend" font-size="11"
                       text-anchor="middle" fill="white" font-weight="bold">
                   ${Math.round((item.deger / total) * 100)}%
                 </text>`;
    startAngle = endAngle;
    return path;
  }).join('');

  return `<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">${paths}</svg>`;
}
```

### 3.3 Çizgi Grafiği (Line Chart) SVG

```typescript
function generateLineChartSVG(data: Array<{etiket: string; deger: number}>, renk: string): string {
  const maxDeger = Math.max(...data.map(d => d.deger));
  const minDeger = Math.min(...data.map(d => d.deger));
  const chartW = 160, chartH = 120;
  const offsetX = 25, offsetY = 20;
  const baseY = offsetY + chartH;

  const points = data.map((item, i) => {
    const x = offsetX + (i / (data.length - 1)) * chartW;
    const y = baseY - ((item.deger - minDeger) / (maxDeger - minDeger || 1)) * chartH;
    return { x, y, ...item };
  });

  const polylinePoints = points.map(p => `${p.x},${p.y}`).join(' ');
  const dots = points.map(p =>
    `<circle cx="${p.x}" cy="${p.y}" r="4" fill="${renk}" stroke="white" stroke-width="1.5"/>
     <text x="${p.x}" y="${p.y - 8}" font-family="Lexend" font-size="10"
           text-anchor="middle" fill="#2C3E50">${p.deger}</text>`
  ).join('');

  return `<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
    <polyline points="${polylinePoints}" fill="none" stroke="${renk}" stroke-width="2"/>
    ${dots}
  </svg>`;
}
```

---

## 📋 4. TABLO ÜRETİM STANDARTLARI

### 4.1 Eğitim Tablosu SVG

```xml
<!-- 3x4 tablo örneği — Sütun başlıklı -->
<svg viewBox="0 0 300 200" xmlns="http://www.w3.org/2000/svg">
  <!-- Başlık satırı -->
  <rect x="0" y="0" width="100" height="40" fill="#4A90D9"/>
  <rect x="100" y="0" width="100" height="40" fill="#4A90D9"/>
  <rect x="200" y="0" width="100" height="40" fill="#4A90D9"/>
  <text x="50" y="25" font-family="Lexend" font-size="13" text-anchor="middle"
        fill="white" font-weight="bold">Başlık 1</text>
  <text x="150" y="25" font-family="Lexend" font-size="13" text-anchor="middle"
        fill="white" font-weight="bold">Başlık 2</text>
  <text x="250" y="25" font-family="Lexend" font-size="13" text-anchor="middle"
        fill="white" font-weight="bold">Başlık 3</text>
  <!-- Veri satırları — alternating background -->
  <rect x="0" y="40" width="300" height="40" fill="#E8F4FD"/>
  <rect x="0" y="80" width="300" height="40" fill="white"/>
  <rect x="0" y="120" width="300" height="40" fill="#E8F4FD"/>
  <!-- Kenarlıklar -->
  <rect x="0" y="0" width="300" height="160" fill="none"
        stroke="#CBD5E0" stroke-width="1"/>
  <!-- Dikey ayraçlar -->
  <line x1="100" y1="0" x2="100" y2="160" stroke="#CBD5E0" stroke-width="1"/>
  <line x1="200" y1="0" x2="200" y2="160" stroke="#CBD5E0" stroke-width="1"/>
</svg>
```

### 4.2 Infografik Tablo (@antv/infographic)

```yaml
# data-table şablonu (infographicService.ts çıktısı)
type: data-table
title: "Konu Başlığı"
columns:
  - "Sütun 1"
  - "Sütun 2"
  - "Sütun 3"
rows:
  - ["Veri 1", "Veri 2", "Veri 3"]
  - ["Veri 4", "Veri 5", "Veri 6"]
style:
  headerColor: "#4A90D9"
  alternatingRows: true
  fontFamily: "Lexend"
pedagogicalNote: "Bu tablo karşılaştırma becerisini destekler..."
```

---

## 🔣 5. SEMBOL, İKON VE PİKTOGRAM STANDARTLARI

### 5.1 Disleksi Uyumlu Sembol Seti

```xml
<!-- ✅ Doğru — basit, net oklar -->
<svg viewBox="0 0 30 30">
  <polygon points="5,15 20,5 20,25" fill="#4A90D9"/>  <!-- Sol ok -->
</svg>

<!-- ✅ Doğru — check mark -->
<svg viewBox="0 0 30 30">
  <polyline points="5,15 12,22 25,8" fill="none"
            stroke="#27AE60" stroke-width="3" stroke-linecap="round"/>
</svg>

<!-- ✅ Doğru — X işareti -->
<svg viewBox="0 0 30 30">
  <line x1="5" y1="5" x2="25" y2="25" stroke="#E74C3C" stroke-width="3" stroke-linecap="round"/>
  <line x1="25" y1="5" x2="5" y2="25" stroke="#E74C3C" stroke-width="3" stroke-linecap="round"/>
</svg>

<!-- ✅ Doğru — Soru işareti (büyük, net) -->
<svg viewBox="0 0 30 30">
  <text x="15" y="22" font-family="Lexend" font-size="22"
        text-anchor="middle" fill="#F39C12" font-weight="bold">?</text>
</svg>
```

### 5.2 Matematik Sembolleri

```xml
<!-- +, -, ×, ÷ sembolleri — büyük ve net -->
<!-- Toplama -->
<svg viewBox="0 0 30 30">
  <line x1="15" y1="5" x2="15" y2="25" stroke="#27AE60" stroke-width="4" stroke-linecap="round"/>
  <line x1="5" y1="15" x2="25" y2="15" stroke="#27AE60" stroke-width="4" stroke-linecap="round"/>
</svg>

<!-- Eşittir -->
<svg viewBox="0 0 30 30">
  <line x1="5" y1="10" x2="25" y2="10" stroke="#4A90D9" stroke-width="3" stroke-linecap="round"/>
  <line x1="5" y1="20" x2="25" y2="20" stroke="#4A90D9" stroke-width="3" stroke-linecap="round"/>
</svg>

<!-- Büyüktür/Küçüktür -->
<svg viewBox="0 0 30 30">
  <polyline points="22,5 8,15 22,25" fill="none"
            stroke="#E74C3C" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
</svg>
```

---

## 🎞️ 6. ANİMASYON STANDARTLARI (Remotion)

### 6.1 Remotion Kompozisyon Şablonu

```typescript
// Standart eğitim animasyonu bileşeni
import { AbsoluteFill, useCurrentFrame, interpolate, spring } from 'remotion';

export const MathStepAnimation: React.FC<{
  problem: string;
  steps: string[];
  profile: LearningDisabilityProfile;
}> = ({ problem, steps, profile }) => {
  const frame = useCurrentFrame();

  // Her adım 60 frame (2 saniye @ 30fps)
  const stepDuration = 60;
  const currentStep = Math.floor(frame / stepDuration);

  // Slide-in animasyonu her adım için
  const slideProgress = spring({
    frame: frame % stepDuration,
    fps: 30,
    config: { damping: 20, stiffness: 200 }
  });

  const translateX = interpolate(slideProgress, [0, 1], [-100, 0]);

  return (
    <AbsoluteFill style={{
      backgroundColor: PROFILE_COLORS[profile].background,
      fontFamily: 'Lexend, sans-serif',
    }}>
      <div style={{ transform: `translateX(${translateX}px)` }}>
        {steps[currentStep]}
      </div>
    </AbsoluteFill>
  );
};

// Kompozisyon ayarları
const ANIMATION_CONFIG = {
  fps: 30,
  durationInFrames: 180,  // 6 saniye default
  width: 1920,
  height: 1080,
  id: 'MathStepAnimation',
};
```

### 6.2 CSS Animasyon (React bileşenleri için)

```css
/* Disleksi dostu animasyonlar — hızlı hareket YOK */
.fade-in {
  animation: fadeIn 0.6s ease-in-out;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to   { opacity: 1; transform: translateY(0); }
}

/* Başarı anı animasyonu */
.success-pulse {
  animation: pulse 0.8s ease-in-out;
}

@keyframes pulse {
  0%   { transform: scale(1); }
  50%  { transform: scale(1.05); }
  100% { transform: scale(1); }
}

/* YASAK — epilepsi riski */
/* flash, blink, rapid-toggle animasyonları kullanma */
/* prefers-reduced-motion medya sorgusu ekle */
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## 🧩 7. IZGARA VE LAYOUT STANDARTLARI

### 7.1 Aktivite Izgarası

```typescript
// Şekil sayma, fark bulma gibi aktiviteler için ızgara
const GRID_CONFIGS = {
  '2x2': { cols: 2, rows: 2, cellSize: 80 },
  '3x3': { cols: 3, rows: 3, cellSize: 60 },
  '4x4': { cols: 4, rows: 4, cellSize: 45 },
  '5x5': { cols: 5, rows: 5, cellSize: 36 },
  'chaotic': null, // Rastgele konumlandırma (x/y koordinatları)
};

// Izgara koordinat hesaplama
function getGridCoordinates(col: number, row: number, config: GridConfig) {
  const padding = 10;
  return {
    x: padding + col * config.cellSize + config.cellSize / 2,
    y: padding + row * config.cellSize + config.cellSize / 2,
  };
}
```

### 7.2 A4 Sayfa Layout Sabitleri

```typescript
// utils/layoutConstants.ts — tüm görseller bu sabitlere uyar
export const A4_CONSTANTS = {
  // A4 @ 96dpi
  PAGE_WIDTH_PX: 794,
  PAGE_HEIGHT_PX: 1123,
  // Kenar boşlukları
  MARGIN_TOP_PX: 50,
  MARGIN_RIGHT_PX: 50,
  MARGIN_BOTTOM_PX: 50,
  MARGIN_LEFT_PX: 50,
  // İçerik alanı
  CONTENT_WIDTH_PX: 694,    // PAGE_WIDTH - 2*MARGIN
  CONTENT_HEIGHT_PX: 1023,  // PAGE_HEIGHT - 2*MARGIN
  // Tipik görsel boyutları
  FULL_WIDTH_IMAGE: 694,    // Tam genişlik
  HALF_WIDTH_IMAGE: 330,    // Yarım genişlik (2 sütun)
  THIRD_WIDTH_IMAGE: 210,   // 1/3 genişlik (3 sütun)
  // Aktivite bloğu yükseklikleri
  SMALL_BLOCK_H: 150,
  MEDIUM_BLOCK_H: 300,
  LARGE_BLOCK_H: 500,
};
```

---

## 🤖 8. GEMİNİ PROMPT STANDARTLARI (GÖRSEL ÜRETİM İÇİN)

### 8.1 SVG Path Üretim Prompt Şablonu

```
SVG path üretirken Gemini'ye şu formatı zorunlu kıl:

SCHEMA:
{
  "svgPaths": [
    {
      "d": "SVG path komutları (M, L, C, A, Z)",
      "fill": "#HEX renk",
      "stroke": "#HEX renk",
      "strokeWidth": number,
      "opacity": number (0-1)
    }
  ]
}

PROMPT EKI:
"Koordinatlar 0-100 arasında normalize edilmiş SVG viewBox='0 0 100 100' için olacak.
Path komutları: M (moveto), L (lineto), C (cubic bezier), A (arc), Z (closepath).
Her şekil kapalı (Z ile biten) ve dolgu rengi belirtilmiş olmalı.
Çakışan şekiller OLMAMALI — koordinatları hesapla."
```

### 8.2 İnfografik Prompt Şablonu

```
Prompt oluştururken şu kuralları uygula:

[ZORUNLU]
- pedagogicalNote dahil et (Öğretmene açıklama)
- Türkçe içerik üret (language: tr)
- Yaş grubuna uygun madde sayısı (5-7 yaş: max 4 madde)
- Lexend font belirt
- Profil renk paletini kullan

[YASAK]
- "disleksisi var" ifadesi → "disleksi desteğine ihtiyacı var"
- rastgele renkler → profil renk paletini kullan
- 10+ madde (kognitif yük fazla) → yaş grubuna göre sınırla

[ŞEMA]
{
  "type": "list-row | sequence-steps | compare-binary | ...",
  "title": "string",
  "items": [{"text": "...", "icon": "emoji/sembol", "color": "#HEX"}],
  "pedagogicalNote": "string (ZORUNLU)"
}
```

### 8.3 Grafik Veri Prompt Şablonu

```
Matematik sınavı için grafik üretirken:

[ZORUNLU FORMAT]
{
  "grafik_verisi": {
    "tur": "sutun | cizgi | pasta | tablo",
    "baslik": "Grafiğin açıklayıcı başlığı",
    "birim": "adet | TL | kg | cm | ...",
    "veri": [
      {"etiket": "Kategori adı", "deger": number}
    ],
    "renk": "#HEX (profil rengi)"
  }
}

[VERİ KALİTESİ]
- En az 3, en fazla 8 veri noktası
- Değerler anlamlı ve tutarlı (örn: toplam 100 için dilimlerin toplamı 100)
- Etiketler kısa (max 10 karakter)
- Soruyla birebir ilgili (grafikteki veriyi soruda kullan)
```

---

## ✅ 9. KONTROL LİSTESİ — Her Görsel Üretimde

```
□ viewBox normalize edilmiş mi? ("0 0 W H" formatı)
□ Lexend font kullanılıyor mu? (disleksi uyumluluğu)
□ Profil renk paleti uygulandı mı?
□ pedagogicalNote var mı?
□ Koordinatlar çakışmıyor mu? (şekil sayma vs.)
□ Font boyutu min 14px mi?
□ prefers-reduced-motion: animasyonlarda var mı?
□ aria-label: erişilebilirlik?
□ A4 export için base64 SVG hazır mı?
□ Tanı koyucu dil YOK mu? (Dr. Ahmet kontrol eder)
□ ZPD'ye uygun karmaşıklık mı? (Elif kontrol eder)
□ Hallucination riski düşük mü? (Selin kontrol eder)
□ TypeScript tip hatası yok mu? (Bora kontrol eder)
```

---

**Bu standartları uygulayan her görsel üretimi:**
- **Somut** → Koordinatlar gerçek, şekiller çakışmıyor, renkler tutarlı
- **Gerçekçi** → Pedagojik bağlamda anlamlı, MEB müfredatına uygun
- **Stabil** → Her üretimde aynı kalite, JSON schema bağlayıcı
- **Premium** → Disleksi-dostu tipografi, yüksek kontrast, A4 baskı hazır

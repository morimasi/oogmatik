/**
 * Pedagojik & Görsel Vektör Damgaları (Saf SVG).
 *
 * Tüm SVG'ler WCAG AA/AAA yüksek kontrastlı, disleksi dostu pastel tonlarla
 * (sabit #1E293B çizgi, #4F46E5 / #0D9488 / #F59E0B vurgular) tasarlanmıştır.
 * Fabric.js `loadSVGFromString` ile doğrudan düzenlenebilir vektör nesnesi olarak eklenir.
 */

export interface VectorStamp {
  id: string;
  label: string;
  category: 'pedagoji' | 'matematik' | 'genel';
  svg: string;
}

export const VECTOR_STAMPS: VectorStamp[] = [
  {
    id: 'speech-bubble',
    label: 'Konuşma Balonu',
    category: 'genel',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 220 140" width="220" height="140">
  <path d="M24 16 H196 A16 16 0 0 1 212 32 V92 A16 16 0 0 1 196 108 H84 L52 132 L58 108 H24 A16 16 0 0 1 8 92 V32 A16 16 0 0 1 24 16 Z" fill="#EEF2FF" stroke="#4F46E5" stroke-width="3" stroke-linejoin="round"/>
</svg>`,
  },
  {
    id: 'check-badge',
    label: 'Başarı Rozeti',
    category: 'pedagoji',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" width="120" height="120">
  <circle cx="60" cy="60" r="50" fill="#ECFDF5" stroke="#0D9488" stroke-width="4"/>
  <circle cx="60" cy="60" r="40" fill="none" stroke="#14B8A6" stroke-width="2" stroke-dasharray="6 4"/>
  <path d="M38 62 L53 77 L84 44" fill="none" stroke="#0F766E" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`,
  },
  {
    id: 'focus-frame',
    label: 'Dikkat Çerçevesi',
    category: 'pedagoji',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 280 120" width="280" height="120">
  <rect x="8" y="14" width="264" height="98" rx="14" fill="#FFFBEB" stroke="#F59E0B" stroke-width="3"/>
  <rect x="24" y="4" width="92" height="22" rx="11" fill="#F59E0B"/>
  <circle cx="38" cy="15" r="4" fill="#FFFFFF"/>
</svg>`,
  },
  {
    id: 'number-line',
    label: 'Sayı Doğrusu (0-10)',
    category: 'matematik',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 440 70" width="440" height="70">
  <line x1="20" y1="32" x2="420" y2="32" stroke="#1E293B" stroke-width="3" stroke-linecap="round"/>
  <polygon points="424,32 414,26 414,38" fill="#1E293B"/>
  <polygon points="16,32 26,26 26,38" fill="#1E293B"/>
  <line x1="40" y1="22" x2="40" y2="42" stroke="#4F46E5" stroke-width="2.5"/>
  <line x1="76" y1="24" x2="76" y2="40" stroke="#1E293B" stroke-width="2"/>
  <line x1="112" y1="24" x2="112" y2="40" stroke="#1E293B" stroke-width="2"/>
  <line x1="148" y1="24" x2="148" y2="40" stroke="#1E293B" stroke-width="2"/>
  <line x1="184" y1="24" x2="184" y2="40" stroke="#1E293B" stroke-width="2"/>
  <line x1="220" y1="20" x2="220" y2="44" stroke="#4F46E5" stroke-width="2.5"/>
  <line x1="256" y1="24" x2="256" y2="40" stroke="#1E293B" stroke-width="2"/>
  <line x1="292" y1="24" x2="292" y2="40" stroke="#1E293B" stroke-width="2"/>
  <line x1="328" y1="24" x2="328" y2="40" stroke="#1E293B" stroke-width="2"/>
  <line x1="364" y1="24" x2="364" y2="40" stroke="#1E293B" stroke-width="2"/>
  <line x1="400" y1="22" x2="400" y2="42" stroke="#4F46E5" stroke-width="2.5"/>
</svg>`,
  },
  {
    id: 'fraction-circle',
    label: 'Kesir Çemberi (4/4)',
    category: 'matematik',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 140 140" width="140" height="140">
  <circle cx="70" cy="70" r="56" fill="#FFFFFF" stroke="#1E293B" stroke-width="3"/>
  <path d="M70 70 L70 14 A56 56 0 0 1 126 70 Z" fill="#C7D2FE" stroke="#1E293B" stroke-width="2"/>
  <line x1="70" y1="14" x2="70" y2="126" stroke="#1E293B" stroke-width="2.5"/>
  <line x1="14" y1="70" x2="126" y2="70" stroke="#1E293B" stroke-width="2.5"/>
  <circle cx="70" cy="70" r="4" fill="#1E293B"/>
</svg>`,
  },
  {
    id: 'clock-face',
    label: 'Boş Saat Kadranı',
    category: 'matematik',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 160" width="160" height="160">
  <circle cx="80" cy="80" r="68" fill="#FFFFFF" stroke="#1E293B" stroke-width="3.5"/>
  <circle cx="80" cy="80" r="60" fill="none" stroke="#CBD5E1" stroke-width="1.5"/>
  <line x1="80" y1="16" x2="80" y2="28" stroke="#4F46E5" stroke-width="3"/>
  <line x1="80" y1="132" x2="80" y2="144" stroke="#4F46E5" stroke-width="3"/>
  <line x1="16" y1="80" x2="28" y2="80" stroke="#4F46E5" stroke-width="3"/>
  <line x1="132" y1="80" x2="144" y2="80" stroke="#4F46E5" stroke-width="3"/>
  <circle cx="80" cy="80" r="5" fill="#1E293B"/>
</svg>`,
  },
  {
    id: 'five-w-one-h',
    label: '5N1K Şema Kutusu',
    category: 'pedagoji',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 260 150" width="260" height="150">
  <rect x="8" y="8" width="244" height="134" rx="12" fill="#F8FAFC" stroke="#4F46E5" stroke-width="2.5"/>
  <line x1="8" y1="42" x2="252" y2="42" stroke="#4F46E5" stroke-width="2"/>
  <line x1="130" y1="42" x2="130" y2="142" stroke="#CBD5E1" stroke-width="1.5"/>
  <line x1="8" y1="92" x2="252" y2="92" stroke="#CBD5E1" stroke-width="1.5"/>
</svg>`,
  },
  {
    id: 'grid-4x4',
    label: '4×4 Eşleştirme Izgarası',
    category: 'matematik',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 180 180" width="180" height="180">
  <rect x="10" y="10" width="160" height="160" fill="#FFFFFF" stroke="#1E293B" stroke-width="2.5"/>
  <line x1="50" y1="10" x2="50" y2="170" stroke="#94A3B8" stroke-width="1.5"/>
  <line x1="90" y1="10" x2="90" y2="170" stroke="#94A3B8" stroke-width="1.5"/>
  <line x1="130" y1="10" x2="130" y2="170" stroke="#94A3B8" stroke-width="1.5"/>
  <line x1="10" y1="50" x2="170" y2="50" stroke="#94A3B8" stroke-width="1.5"/>
  <line x1="10" y1="90" x2="170" y2="90" stroke="#94A3B8" stroke-width="1.5"/>
  <line x1="10" y1="130" x2="170" y2="130" stroke="#94A3B8" stroke-width="1.5"/>
</svg>`,
  },
];

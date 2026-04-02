/**
 * Oogmatik Tema Yardımcıları
 *
 * Selin Arslan — AI Mimarı: "Palette Reflection"
 * AI infografik üreticisi, kullanıcının o anki temasını algılayıp,
 * ürettiği diyagramların kenar ve başlık renklerini temanın
 * `accent` rengine göre (A4 hariç) otomatik set eder.
 *
 * Bora Demir — Mühendislik: Tüm CSS değişkenleri `theme-tokens.css`'den okunur.
 */

/**
 * Mevcut temanın CSS değişken değerini döndürür.
 * Sadece tarayıcı ortamında çalışır (SSR-safe).
 */
export function getThemeCSSVariable(varName: string, fallback = ''): string {
  if (typeof window === 'undefined') return fallback;
  return getComputedStyle(document.documentElement)
    .getPropertyValue(varName)
    .trim() || fallback;
}

/**
 * Mevcut temanın vurgu (accent) rengini döndürür.
 * Tarayıcıdan CSS değişkenini okur — tema değiştiğinde otomatik güncellenir.
 */
export function getThemeAccentColor(): string {
  return getThemeCSSVariable('--accent-color', '#6366f1');
}

/**
 * Mevcut temanın vurgu hover rengini döndürür.
 */
export function getThemeAccentHover(): string {
  return getThemeCSSVariable('--accent-hover', '#4f46e5');
}

/**
 * Mevcut temanın muted (soluk) accent rengini döndürür.
 */
export function getThemeAccentMuted(): string {
  return getThemeCSSVariable('--accent-muted', 'rgba(99,102,241,0.1)');
}

/**
 * Mevcut tema bilgilerini tek seferde döndürür.
 * AI İnfografik, Studio ve diğer görsel üreticiler tarafından kullanılır.
 */
export function getThemePalette(): {
  accent: string;
  accentHover: string;
  accentMuted: string;
  bgPrimary: string;
  bgPaper: string;
  textPrimary: string;
  textMuted: string;
  borderColor: string;
  surfaceGlass: string;
} {
  return {
    accent: getThemeCSSVariable('--accent-color', '#6366f1'),
    accentHover: getThemeCSSVariable('--accent-hover', '#4f46e5'),
    accentMuted: getThemeCSSVariable('--accent-muted', 'rgba(99,102,241,0.1)'),
    bgPrimary: getThemeCSSVariable('--bg-primary', '#09090b'),
    bgPaper: getThemeCSSVariable('--bg-paper', '#18181b'),
    textPrimary: getThemeCSSVariable('--text-primary', '#f8fafc'),
    textMuted: getThemeCSSVariable('--text-muted', '#64748b'),
    borderColor: getThemeCSSVariable('--border-color', 'rgba(255,255,255,0.08)'),
    surfaceGlass: getThemeCSSVariable('--surface-glass', 'rgba(255,255,255,0.05)'),
  };
}

/**
 * AI İnfografik için renk paleti üretir.
 * A4 modunda sabit renkler, ekran modunda tema renkleri kullanılır.
 *
 * @param forPrint - true ise A4 için sabit renkler döndürür
 */
export function getInfographicPalette(forPrint = false): {
  primary: string;
  secondary: string;
  accent: string;
  bg: string;
  card: string;
  text: string;
  textMuted: string;
  border: string;
} {
  if (forPrint) {
    // A4 klinik rapor — tema renginden tam izolasyon (Dr. Ahmet Kaya standardı)
    return {
      primary: '#7c3aed',
      secondary: '#6d28d9',
      accent: '#a78bfa',
      bg: '#f8fafc',
      card: '#ffffff',
      text: '#1e293b',
      textMuted: '#64748b',
      border: '#e2e8f0',
    };
  }

  // Ekran modu — temanın accent rengi kullanılır (Selin Arslan Palette Reflection)
  const themeAccent = getThemeAccentColor();
  const themeAccentHover = getThemeAccentHover();
  const themeAccentMuted = getThemeAccentMuted();

  return {
    primary: themeAccent,
    secondary: themeAccentHover,
    accent: themeAccentMuted,
    bg: '#f8fafc',   // İnfografik içeriği her zaman açık arka planda
    card: '#ffffff',
    text: '#1e293b',
    textMuted: '#64748b',
    border: '#e2e8f0',
  };
}


// Utility for Color Manipulation and Theme Management

export interface ThemeColors {
    '--bg-primary': string;
    '--bg-secondary': string;
    '--bg-paper': string;
    '--bg-inset': string;
    '--text-primary': string;
    '--text-secondary': string;
    '--text-muted': string;
    '--border-color': string;
    '--accent-color': string;
    '--accent-hover': string;
    '--panel-bg': string;
}

export interface CustomTheme {
    id: string;
    name: string;
    type: 'light' | 'dark';
    colors: ThemeColors;
    isCustom?: boolean;
}

// Default Themes Registry
export const PRESET_THEMES: CustomTheme[] = [
    {
        id: 'anthracite',
        name: 'Antrasit (Varsayılan)',
        type: 'dark',
        colors: {
            '--bg-primary': '#222226',
            '--bg-secondary': '#1a1a1d',
            '--bg-paper': '#2d2d32',
            '--bg-inset': '#18181b',
            '--text-primary': '#fefce8',
            '--text-secondary': '#d4d4d8',
            '--text-muted': '#a1a1aa',
            '--border-color': '#3f3f46',
            '--accent-color': '#fbbf24',
            '--accent-hover': '#f59e0b',
            '--panel-bg': 'rgba(45, 45, 50, 0.95)'
        }
    },
    {
        id: 'light',
        name: 'Aydınlık',
        type: 'light',
        colors: {
            '--bg-primary': '#f8fafc',
            '--bg-secondary': '#f1f5f9',
            '--bg-paper': '#ffffff',
            '--bg-inset': '#e2e8f0',
            '--text-primary': '#0f172a',
            '--text-secondary': '#475569',
            '--text-muted': '#94a3b8',
            '--border-color': '#cbd5e1',
            '--accent-color': '#4f46e5',
            '--accent-hover': '#4338ca',
            '--panel-bg': 'rgba(255, 255, 255, 0.95)'
        }
    },
    {
        id: 'nature',
        name: 'Doğa',
        type: 'light',
        colors: {
            '--bg-primary': '#f0fdf4',
            '--bg-secondary': '#dcfce7',
            '--bg-paper': '#ffffff',
            '--bg-inset': '#bbf7d0',
            '--text-primary': '#14532d',
            '--text-secondary': '#166534',
            '--text-muted': '#86efac',
            '--border-color': '#4ade80',
            '--accent-color': '#16a34a',
            '--accent-hover': '#15803d',
            '--panel-bg': 'rgba(255, 255, 255, 0.9)'
        }
    },
    {
        id: 'ocean',
        name: 'Okyanus',
        type: 'dark',
        colors: {
            '--bg-primary': '#0f172a',
            '--bg-secondary': '#020617',
            '--bg-paper': '#1e293b',
            '--bg-inset': '#020617',
            '--text-primary': '#e0f2fe',
            '--text-secondary': '#bae6fd',
            '--text-muted': '#7dd3fc',
            '--border-color': '#0369a1',
            '--accent-color': '#0ea5e9',
            '--accent-hover': '#0284c7',
            '--panel-bg': 'rgba(30, 41, 59, 0.95)'
        }
    },
    {
        id: 'high-contrast-dark',
        name: 'Yüksek Kontrast (Koyu)',
        type: 'dark',
        colors: {
            '--bg-primary': '#000000',
            '--bg-secondary': '#000000',
            '--bg-paper': '#000000',
            '--bg-inset': '#000000',
            '--text-primary': '#ffffff',
            '--text-secondary': '#ffff00',
            '--text-muted': '#00ff00',
            '--border-color': '#ffffff',
            '--accent-color': '#ffff00',
            '--accent-hover': '#ffff00',
            '--panel-bg': '#000000'
        }
    }
];

// --- WCAG ACCESSIBILITY CHECKER ---

function getLuminance(hex: string): number {
    const rgb = parseInt(hex.slice(1), 16);
    const r = (rgb >> 16) & 0xff;
    const g = (rgb >>  8) & 0xff;
    const b = (rgb >>  0) & 0xff;

    const [lr, lg, lb] = [r, g, b].map(v => {
        v /= 255;
        return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * lr + 0.7152 * lg + 0.0722 * lb;
}

export function getContrastRatio(hex1: string, hex2: string): number {
    if (!hex1 || !hex2 || !hex1.startsWith('#') || !hex2.startsWith('#')) return 0;
    const lum1 = getLuminance(hex1);
    const lum2 = getLuminance(hex2);
    const brightest = Math.max(lum1, lum2);
    const darkest = Math.min(lum1, lum2);
    return (brightest + 0.05) / (darkest + 0.05);
}

export function checkAccessibility(bg: string, text: string): { ratio: number; aa: boolean; aaa: boolean } {
    const ratio = getContrastRatio(bg, text);
    return {
        ratio: parseFloat(ratio.toFixed(2)),
        aa: ratio >= 4.5,
        aaa: ratio >= 7
    };
}

// --- DYNAMIC INJECTION ---

export function applyTheme(theme: CustomTheme) {
    const root = document.documentElement;
    
    // 1. Set Colors
    Object.entries(theme.colors).forEach(([key, value]) => {
        root.style.setProperty(key, value);
    });

    // 2. Set Base Class for Tailwind (dark mode utilities)
    if (theme.type === 'dark') {
        root.classList.add('dark');
        root.classList.remove('theme-light'); // cleanup
    } else {
        root.classList.remove('dark');
        root.classList.add('theme-light');
    }
}

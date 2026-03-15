import { Font } from '@react-pdf/renderer';

// Premium Fontlar: Matbaa kalitesinde çıktı ve disleksi uyumluluk için.
export const registerPdfFonts = () => {
    // 1. Lexend: Okunabilirliği maksimize edilmiş modern eğitim fontu.
    Font.register({
        family: 'Lexend',
        fonts: [
            { src: 'https://fonts.gstatic.com/s/lexend/v17/wlpygwzFsyE4jcWLs1DZmOI.woff2' }, // Normal
            { src: 'https://fonts.gstatic.com/s/lexend/v17/wlpygwzFsyE4jcWLs1DZmOI.woff2', fontWeight: 'bold' }
        ]
    });

    // 2. OpenDyslexic: Disleksi hastaları için özel tasarlanmış, altı ağır font.
    Font.register({
        family: 'OpenDyslexic',
        fonts: [
            { src: 'https://cdn.jsdelivr.net/gh/antijingoist/opendyslexic@master/compiled/OpenDyslexic-Regular.otf' },
            { src: 'https://cdn.jsdelivr.net/gh/antijingoist/opendyslexic@master/compiled/OpenDyslexic-Bold.otf', fontWeight: 'bold' }
        ]
    });

    // 3. Roboto (Yedek, Standart Matbaa Fontu)
    Font.register({
        family: 'Roboto',
        fonts: [
            { src: 'https://fonts.gstatic.com/s/roboto/v30/KFOmCnqEu92Fr1Me5WZLCzYlKw.ttf' }, // Normal
            { src: 'https://fonts.gstatic.com/s/roboto/v30/KFOlCnqEu92Fr1MmWUlvAx05IsDqlA.ttf', fontWeight: 'bold' } // Bold
        ]
    });
};

export const pdfThemeColors = {
    'eco-black': {
        primary: '#1e293b',   // Koyu Slate
        secondary: '#475569',
        border: '#cbd5e1',
        background: '#ffffff',
        accent: '#0f172a'
    },
    'vibrant': {
        primary: '#4f46e5',   // Canlı Indigo
        secondary: '#0ea5e9', // Gök Mavisi
        border: '#c7d2fe',
        background: '#ffffff',
        accent: '#f43f5e'     // Başlık Vurgusu Rose
    },
    'minimalist': {
        primary: '#334155',
        secondary: '#94a3b8',
        border: '#e2e8f0',
        background: '#f8fafc',
        accent: '#334155'
    }
};

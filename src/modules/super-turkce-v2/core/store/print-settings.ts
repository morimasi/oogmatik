import { PrintSettings, FontStyle, SpacingLevel } from '../types';

export type { PrintSettings } from '../types';

export const FONT_MAP: Record<FontStyle, string> = {
    Arial: 'Arial, sans-serif', // React-PDF'te custom register edilecek
    Verdana: 'Verdana, sans-serif',
    ComicSans: '"Comic Sans MS", cursive, sans-serif',
    OpenDyslexic: 'OpenDyslexic, sans-serif' // Özel font
};

// Değerler Point (pt) cinsinden. A4 için optimize edilmiştir.
export const LINE_HEIGHT_MAP: Record<SpacingLevel, number> = {
    dar: 1.2,
    normal: 1.5,
    genis: 1.8,
    ultra_genis: 2.2
};

export const LETTER_SPACING_MAP: Record<SpacingLevel, number> = {
    dar: 0,
    normal: 0.5,
    genis: 1.2,
    ultra_genis: 2.5
};

export const WORD_SPACING_MAP: Record<SpacingLevel, number> = {
    dar: 0,
    normal: 2,
    genis: 5,
    ultra_genis: 8
};

// Bu fonksiyon, UI'daki seçilen ayarlara göre react-pdf Text <Text style={...}> objesini döner
export const getPdfTextStyles = (settings: PrintSettings, isHeading = false) => {
    const baseSize = isHeading ? 16 : 12; // pt

    return {
        fontFamily: settings.fontFamily,
        fontSize: baseSize,
        lineHeight: LINE_HEIGHT_MAP[settings.lineHeight],
        letterSpacing: LETTER_SPACING_MAP[settings.letterSpacing],
        // wordSpacing react-pdf tarafından doğrudan her elemanda desteklenmeyebilir, 
        // duruma göre boşluk karakteri manipülasyonu gerekebilir.
    };
};

/**
 * Disleksi için 'b', 'd', 'p', 'q' harfleri arasına ekstra boşluk bırakır
 * Vektörel PDF manipülasyonu için kelime bazlı split sağlar.
 * Kullanımı: <Text>{applyDyslexiaSpacing("merdiven", settings.b_d_spacing)}</Text>
 */
export const applyDyslexiaSpacing = (text: string, isActive: boolean | { b_d_spacing?: boolean }): string => {
    const active = typeof isActive === 'boolean' ? isActive : !!isActive?.b_d_spacing;
    if (!active || !text) return text;

    // Sadece b,d,p,q,g harflerinin arkasına algısal bir boşluk (em-space / thin-space) atar
    return text.replace(/([bdpqg])/gi, '$1\u200A'); // U+200A (Hair Space) ekle
};

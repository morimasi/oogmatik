import { AppError } from './AppError.js';
import { logWarn } from './logger.js';

/**
 * Eksik kapanış parantezlerini sayısal olarak tamamlar.
 */
export const balanceBraces = (str: string): string => {
    const stack: string[] = [];
    let inString = false;
    let escaped = false;

    for (let i = 0; i < str.length; i++) {
        const ch = str[i];
        if (escaped) {
            escaped = false;
            continue;
        }
        if (ch === '\\' && inString) {
            escaped = true;
            continue;
        }
        if (ch === '"') {
            inString = !inString;
            continue;
        }
        if (inString) continue;

        if (ch === '{') stack.push('}');
        else if (ch === '[') stack.push(']');
        else if ((ch === '}' || ch === ']') && stack.length > 0) {
            if (stack[stack.length - 1] === ch) stack.pop();
            else stack.pop();
        }
    }

    if (inString) str += '"';
    while (stack.length > 0) str += stack.pop();
    return str;
};

/**
 * Kesik veya çöp eklenmiş JSON'ı geçerli sınıra kadar keser.
 */
export const truncateToLastValidEntry = (str: string): string => {
    // 1. Önce doğrudan geçerli bir JSON parse olabiliyor mu kontrol et
    try {
        JSON.parse(str);
        return str;
    } catch { /* devam et */ }

    // 2. Sondan geriye doğru geçerli bir kapanış parantezinden ('}' veya ']') itibaren parse edilebiliyor mu bak
    for (let i = str.length - 1; i >= 0; i--) {
        const ch = str[i];
        if (ch === '}' || ch === ']') {
            const candidate = str.substring(0, i + 1);
            try {
                JSON.parse(candidate);
                return candidate;
            } catch { /* devam et */ }
        }
    }

    // 3. Virgül sınırından kesip balanceBraces ile tamamlamayı dene
    const lastComma = str.lastIndexOf(',');
    if (lastComma > 0) {
        const candidate = str.substring(0, lastComma);
        const balanced = balanceBraces(candidate);
        try {
            JSON.parse(balanced);
            return balanced;
        } catch { /* devam et */ }
    }

    return balanceBraces(str);
};

/**
 * 3-Katmanlı JSON Onarım Motoru.
 */
export const tryRepairJson = (jsonStr: string): unknown => {
    if (!jsonStr) throw new AppError('AI yanıt dönmedi.', 'INTERNAL_ERROR', 500);

    let cleaned = jsonStr.replace(/[\u200B-\u200D\uFEFF]/g, '').trim();
    cleaned = cleaned
        .replace(/^```json[\s\S]*?\n/, '')
        .replace(/^```\s*/m, '')
        .replace(/```\s*$/m, '')
        .trim();

    const firstBrace = cleaned.indexOf('{');
    const firstBracket = cleaned.indexOf('[');
    let startIndex = -1;
    if (firstBrace !== -1 && firstBracket !== -1) startIndex = Math.min(firstBrace, firstBracket);
    else if (firstBrace !== -1) startIndex = firstBrace;
    else if (firstBracket !== -1) startIndex = firstBracket;
    if (startIndex > 0) cleaned = cleaned.substring(startIndex);

    try {
        return JSON.parse(cleaned);
    } catch { /* ignore */ }

    try {
        const balanced = balanceBraces(cleaned);
        return JSON.parse(balanced);
    } catch { /* ignore */ }

    try {
        const truncated = truncateToLastValidEntry(cleaned);
        const result = JSON.parse(truncated);
        logWarn('[jsonRepair] JSON truncated & repaired. Yanıt token sınırına çarpmış olabilir.');
        return result;
    } catch { /* ignore */ }

    try {
        for (let i = cleaned.length - 1; i >= 0; i--) {
            const ch = cleaned[i];
            if (ch === '}' || ch === ']') {
                const candidate = cleaned.substring(0, i + 1);
                try {
                    const result = JSON.parse(candidate);
                    return result;
                } catch { /* ignore */ }
            }
        }
    } catch { /* ignore */ }

    throw new AppError('AI verisi işlenemedi. JSON formatı bozuk veya yanıt çok kısa.', 'INTERNAL_ERROR', 500);
};

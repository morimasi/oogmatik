import { AppError } from './AppError.js';

import { logInfo, logError, logWarn } from '../utils/logger.js';

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
 * Kesik JSON'ı son geçerli virgülden keser.
 */
export const truncateToLastValidEntry = (str: string): string => {
    const lastComma = str.lastIndexOf(',');
    if (lastComma > 0) {
        const candidate = str.substring(0, lastComma);
        return balanceBraces(candidate);
    }
    return balanceBraces(str);
};

/**
 * 3-Katmanlı JSON Onarım Motoru.
 */
export const tryRepairJson = (jsonStr: string): any => {
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
                    logWarn(`[jsonRepair] STRATEJİ 4: Sondan tarayarak geçerli JSON bulundu (karakter ${i + 1}/${cleaned.length}).`);
                    return result;
                } catch { /* ignore */ }
            }
        }
    } catch { /* ignore */ }

    logError('[jsonRepair] JSON Parse tamamen başarısız', { hamMetin: cleaned.substring(0, 500) });
    throw new AppError('AI verisi işlenemedi. JSON formatı bozuk veya yanıt çok kısa.', 'INTERNAL_ERROR', 500);
};

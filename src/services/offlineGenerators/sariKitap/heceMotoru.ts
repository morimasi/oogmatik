/**
 * Hece Motoru Köprüsü
 * metinHavuzu.ts'den gelen metinleri heceAyirici.ts ile işleyerek
 * SariKitapGeneratedContent formatına dönüştürür.
 */
import type {
    SariKitapConfig,
    SariKitapGeneratedContent,
    HeceRow,
    HeceData,
} from '../../../types/sariKitap';
import { metniHecele, metniKelimele } from '../../../utils/heceAyirici';
import { getMetinByAgeAndDifficulty, getCiftMetinCifti } from './metinHavuzu';
import type { MemoryPhaseData } from '../../../types/sariKitap';

// ─── Pencere: belirli heceleri vurgula, diğerlerini maskele ─────
export function processPencereContent(
    config: SariKitapConfig,
    rawText: string
): HeceRow[] {
    const rows = metniHecele(rawText);
    if (config.type !== 'pencere') return rows;

    const windowSize = config.windowSize;
    const visibilityRatio = (config as any).visibilityRatio ?? 0.4;
    
    return rows.map((row) => ({
        ...row,
        syllables: row.syllables.map((s, i) => ({
            ...s,
            isHighlighted: config.showSequential
                ? i % (windowSize + 1) < windowSize
                : Math.random() < visibilityRatio,
        })),
    }));
}

// ─── Nokta: kelimelerin veya hecelerin altına nokta ekle ─────────
export function processNoktaContent(
    config: SariKitapConfig,
    rawText: string
): HeceRow[] {
    if (config.type !== 'nokta') return metniHecele(rawText);

    // Kelime bazlı mı hece bazlı mı?
    const useWords = config.dotPlacement === 'kelime';
    const rows = useWords ? metniKelimele(rawText) : metniHecele(rawText);
    const density = config.dotDensity;

    return rows.map((row) => ({
        ...row,
        syllables: row.syllables.map((s, i) => ({
            ...s,
            dotBelow: i % density === 0,
        })),
    }));
}

// ─── Köprü: kelimeler veya heceler arası yay bayrağı ────────────
export function processKopruContent(
    config: SariKitapConfig,
    rawText: string
): HeceRow[] {
    if (config.type !== 'kopru') return metniHecele(rawText);

    // Kelime bazlı mı hece bazlı mı?
    const useWords = config.bridgePlacement === 'kelime';
    const rows = useWords ? metniKelimele(rawText) : metniHecele(rawText);

    return rows.map((row) => ({
        ...row,
        syllables: row.syllables.map((s, i) => ({
            ...s,
            bridgeNext: i < row.syllables.length - 1,
        })),
    }));
}

// ─── Bellek / Hızlı Okuma: kelime blokları oluştur ─────────────
export function buildWordBlocks(
    rawText: string,
    wordsPerRow: number,
    totalRows: number
): string[][] {
    const words = rawText
        .replace(/[.,!?;:'"()]/g, '')
        .split(/\s+/)
        .filter((w) => w.length > 0);

    const blocks: string[][] = [];
    let idx = 0;
    for (let r = 0; r < totalRows && idx < words.length; r++) {
        const row: string[] = [];
        for (let c = 0; c < wordsPerRow && idx < words.length; c++) {
            row.push(words[idx]);
            idx++;
        }
        blocks.push(row);
    }
    return blocks;
}

// ─── Çift Metin: iki metni harmanlama ───────────────────────────
export function interleaveTexts(
    textA: string,
    textB: string,
    mode: 'kelime' | 'satir' | 'paragraf',
    ratio: number
): string {
    if (mode === 'satir') {
        const linesA = textA.split(/[.!?]+/).filter((s) => s.trim());
        const linesB = textB.split(/[.!?]+/).filter((s) => s.trim());
        const result: string[] = [];
        const maxLen = Math.max(linesA.length, linesB.length);
        for (let i = 0; i < maxLen; i++) {
            for (let r = 0; r < ratio && i * ratio + r < linesA.length; r++) {
                const line = linesA[i * ratio + r]?.trim();
                if (line) result.push(line + '.');
            }
            for (let r = 0; r < ratio && i * ratio + r < linesB.length; r++) {
                const line = linesB[i * ratio + r]?.trim();
                if (line) result.push(line + '.');
            }
        }
        return result.join('\n');
    }

    if (mode === 'kelime') {
        const wordsA = textA.split(/\s+/);
        const wordsB = textB.split(/\s+/);
        const result: string[] = [];
        const maxLen = Math.max(wordsA.length, wordsB.length);
        for (let i = 0; i < maxLen; i++) {
            if (i < wordsA.length) result.push(wordsA[i]);
            if (i < wordsB.length) result.push(wordsB[i]);
        }
        return result.join(' ');
    }

    // paragraf
    return `${textA}\n\n${textB}`;
}

// ─── Ortak çıktı oluşturucu ─────────────────────────────────────
export function buildGeneratedContent(
    title: string,
    rawText: string,
    heceRows: HeceRow[],
    config: SariKitapConfig,
    extra?: {
        sourceTexts?: SariKitapGeneratedContent['sourceTexts'];
        wordBlocks?: string[][];
        memoryData?: MemoryPhaseData;
    }
): SariKitapGeneratedContent {
    return {
        title,
        pedagogicalNote: getPedagogicalNote(config.type),
        instructions: getInstructions(config.type),
        targetSkills: [...config.targetSkills],
        rawText,
        heceRows,
        sourceTexts: extra?.sourceTexts,
        wordBlocks: extra?.wordBlocks,
        memoryData: extra?.memoryData,
        generatedAt: new Date().toISOString(),
        model: 'gemini-2.5-flash',
    };
}

function getPedagogicalNote(type: string): string {
    const notes: Record<string, string> = {
        pencere: 'Pencere okuma, öğrencinin odaklanma süresini artırarak seçici dikkat becerisini geliştirir. Maskeleme yöntemi, göz takibi sırasında gereksiz bilgiyi filtrelemeyi öğretir.',
        nokta: 'Nokta takibi, satır atlamayı önleyen görsel bir rehber sağlar. Göz kaslarının ritmik hareketini destekleyerek okuma akıcılığını artırır.',
        kopru: 'Köprü okuma, heceleri birbirine bağlayan yay sembolleriyle göz sıçrama mesafesini kontrol eder. Akıcı okuma için motor hafıza oluşturur.',
        cift_metin: 'Çift metin formatı, iki farklı hikayeyi ayrıştırma pratiği yaparak seçici dikkat ve bilişsel esnekliği geliştirir.',
        bellek: 'Bellek egzersizi, kelime tanıma hızını artırarak otomatikleşmiş okuma becerisini güçlendirir. Görsel hafıza ve hızlı eşleştirme çalışması sağlar.',
        hizli_okuma: 'Hızlı okuma blokları, kelime tanıma otomatikliğini geliştirerek okuma hızını kademeli olarak artırır.',
    };
    return notes[type] ?? 'Okuma destek materyali.';
}

function getInstructions(type: string): string {
    const inst: Record<string, string> = {
        pencere: 'Sadece açık penceredeki heceleri okuyun. Maskelenmiş bölümleri tahmin etmeye çalışmayın.',
        nokta: 'Parmağınızla her noktayı takip ederek heceleri sesli okuyun.',
        kopru: 'Yay işaretlerini takip ederek heceleri birleştirerek okuyun.',
        cift_metin: 'İki farklı hikayeyi renklerine göre ayırarak okuyun. Önce bir rengi, sonra diğerini okuyun.',
        bellek: 'Her kelimeye birkaç saniye bakın, sonra gözlerinizi kapatıp hatırlamaya çalışın.',
        hizli_okuma: 'Satır satır ilerleyerek kelimeleri olabildiğince hızlı okuyun.',
    };
    return inst[type] ?? 'Metni dikkatle okuyun.';
}

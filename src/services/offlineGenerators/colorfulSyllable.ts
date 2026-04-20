
import { GeneratorOptions, ColorfulSyllableReadingData } from '../../types';

export const generateOfflineColorfulSyllableReading = async (options: GeneratorOptions): Promise<ColorfulSyllableReadingData[]> => {
    const { worksheetCount, difficulty } = options;

    return Array.from({ length: worksheetCount }, () => ({
        id: 'color_syll_' + Date.now(),
        activityType: 'COLORFUL_SYLLABLE_READING' as any,
        title: "Renkli Hece Okuma",
        instruction: "Metni hecelerine dikkat ederek okuyun.",
        content: {
            title: "Okul Heyecanı",
            paragraphs: [
                {
                    text: "Bugün okulun ilk günüydü. Ali çantasını hazırladı.",
                    syllabified: [
                        { word: "Bugün", parts: ["Bu", "gün"] },
                        { word: "okulun", parts: ["o", "ku", "lun"] },
                        { word: "ilk", parts: ["ilk"] },
                        { word: "günüydü", parts: ["gü", "nüy", "dü"] }
                    ]
                }
            ]
        },
        settings: {
            difficulty: difficulty || 'Orta',
            wpmTarget: 60,
            colorPalette: 'red_blue',
            highlightType: 'syllables'
        }
    } as any));
};

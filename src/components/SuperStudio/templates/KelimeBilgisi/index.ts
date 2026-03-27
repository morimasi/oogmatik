export { default as Settings } from './Settings';
export { default as promptBuilder } from './promptBuilder';
export * from './types';

export const DEFAULT_SETTINGS: KelimeBilgisiSettings = {
    generationMode: 'ai',
    wordTypes: ['es-anlamli', 'zit-anlamli', 'es-sesli'],
    aiSettings: {
        wordCount: 8,
        difficulty: 'orta',
        includeExamples: true,
        includeMnemonics: true,
        themeBased: true
    },
    hizliSettings: {
        templateStyle: 'match-card',
        difficulty: 'orta',
        questionCount: 12,
        timeLimit: null,
        includeAnswerKey: false
    },
    visualSettings: {
        useColorCoding: true,
        useIcons: true,
        useFonts: true,
        useGrid: true
    }
};

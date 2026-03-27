export { default as Settings } from './Settings';
export { default as promptBuilder } from './promptBuilder';
export * from './types';

export const DEFAULT_SETTINGS = {
    cognitiveLoadLimit: 12,
    chunkingEnabled: true,
    visualScaffolding: true,
    typographicHighlight: true,
    mindMap5N1K: true,
    questionCount: 4
};

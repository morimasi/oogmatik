export { default as Settings } from './Settings';
export { default as promptBuilder } from './promptBuilder';
export * from './types';

export const DEFAULT_SETTINGS = {
    storyDiceCount: 3,
    clozeFormat: 'none',
    minSentences: 5,
    emotionRadar: true
};

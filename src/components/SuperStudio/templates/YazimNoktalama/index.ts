export { default as Settings } from './Settings';
export { default as promptBuilder } from './promptBuilder';
export * from './types';

export const DEFAULT_SETTINGS = {
    ruleSelection: ['capitalization', 'punctuation'],
    errorDetectiveMode: true,
    clozeFormat: 'none',
    showRuleHints: true,
    itemCount: 8
};

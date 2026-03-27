export { default as Settings } from './Settings';
export { default as promptBuilder } from './promptBuilder';
export * from './types';

export const DEFAULT_SETTINGS = {
    learningType: 'idioms',
    visualAnalogy: true,
    contextualUsage: true,
    synonymAntonymMatch: true,
    itemCount: 6
};

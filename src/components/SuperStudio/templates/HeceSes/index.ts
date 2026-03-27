export { default as Settings } from './Settings';
export { default as promptBuilder } from './promptBuilder';
export * from './types';

export const DEFAULT_SETTINGS = {
    focusArea: 'syllable_splitting',
    multisensoryCues: true,
    phonemeManipulation: true,
    targetSoundChanges: ['softening', 'hardening'],
    itemCount: 10
};

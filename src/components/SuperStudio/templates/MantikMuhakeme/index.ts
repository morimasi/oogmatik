export { default as Settings } from './Settings';
export { default as promptBuilder } from './promptBuilder';
export * from './types';

export const DEFAULT_SETTINGS = {
    sequenceSteps: 4,
    matrixSize: '3x3',
    logicMatrix: true,
    detailDetective: true
};

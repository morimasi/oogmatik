export { default as Settings } from './Settings';
export { default as promptBuilder } from './promptBuilder';
export * from './types';

export const DEFAULT_SETTINGS = {
    targetDistractors: 'b-d',
    gridSize: '4x4',
    syllableSimulation: true,
    camouflageGrid: true,
    hintBox: true
};

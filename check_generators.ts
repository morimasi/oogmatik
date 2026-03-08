
import * as generators from './services/generators/index';
import { ActivityType } from './types/core';

const checkGenerators = () => {
    const activitiesToCheck = [
        'ABC_CONNECT',
        'MAGIC_PYRAMID',
        'CAPSULE_GAME',
        'ODD_EVEN_SUDOKU',
        'FUTOSHIKI',
        'KENDOKU',
        'NUMBER_PYRAMID'
    ];

    console.log("--- Generator Check ---");
    activitiesToCheck.forEach(act => {
        const pascalName = act.toLowerCase()
            .split(/[-_ ]+/)
            .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
            .join('');
        const aiFuncName = `generate${pascalName}FromAI`;
        const gen = (generators as any)[aiFuncName];
        console.log(`${act}: ${gen ? 'Found' : 'MISSING'} (${aiFuncName})`);
    });
};

checkGenerators();

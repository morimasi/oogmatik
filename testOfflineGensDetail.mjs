import { ACTIVITY_GENERATOR_REGISTRY } from './src/services/generators/registry.js';
import { ActivityType } from './src/types/activity.js';

async function testAllOfflineGeneratorsDetail() {
    const activityTypes = Object.values(ActivityType);

    for (const type of activityTypes) {
        if (type.startsWith('INFOGRAPHIC_')) continue; // Infographic stüdyosu dinamik renderer kullanır

        const mapping = ACTIVITY_GENERATOR_REGISTRY[type];
        if (!mapping || !mapping.offline) {
            console.log(`[EKSİK] ${type}`);
            continue;
        }

        try {
            const res = await mapping.offline({
                difficulty: 'Orta',
                itemCount: 4,
                worksheetCount: 1,
                puzzleCount: 4
            });

            if (!res || (typeof res === 'object' && Object.keys(res).length === 0)) {
                console.log(`[BOŞ] ${type}`);
            } else {
                const resStr = JSON.stringify(res);
                if (resStr === '{}' || resStr === '[]' || resStr.includes('"items":[]') || resStr.includes('"puzzles":[]')) {
                    console.log(`[YARIM_BOŞ] ${type}`);
                }
            }
        } catch (err) {
            console.log(`[HATA] ${type} -> ${err.message}`);
        }
    }
}

testAllOfflineGeneratorsDetail();

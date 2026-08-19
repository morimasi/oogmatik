import { ACTIVITY_GENERATOR_REGISTRY } from './src/services/generators/registry.js';
import { ActivityType } from './src/types/activity.js';

async function testAllOfflineGenerators() {
    console.log('=== HIZLI MOD (OFFLINE) JENERATÖR TESTİ BAŞLIYOR ===\n');

    const activityTypes = Object.values(ActivityType);
    let emptyCount = 0;
    let successCount = 0;
    let errorCount = 0;

    for (const type of activityTypes) {
        const mapping = ACTIVITY_GENERATOR_REGISTRY[type];
        if (!mapping || !mapping.offline) {
            console.log(`[EKSİK JENERATÖR] ${type}: Offline jeneratör registry'de tanımlı değil!`);
            emptyCount++;
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
                console.log(`[BOŞ ÇIKTI] ${type}: Jeneratör çalıştı ancak BOŞ veri döndürdü!`);
                emptyCount++;
            } else {
                // Kontrol et: İçerik var mı?
                const resStr = JSON.stringify(res);
                if (resStr === '{}' || resStr === '[]' || resStr.includes('"items":[]') || resStr.includes('"puzzles":[]')) {
                    console.log(`[YARIM BOŞ ÇIKTI] ${type}: Obje var ama alt dizileri BOŞ!`);
                    emptyCount++;
                } else {
                    successCount++;
                }
            }
        } catch (err) {
            console.log(`[HATA/ÇÖKME] ${type}: ${err.message}`);
            errorCount++;
        }
    }

    console.log(`\n=== ÖZET ===`);
    console.log(`Başarılı: ${successCount}`);
    console.log(`Boş/Eksik: ${emptyCount}`);
    console.log(`Hatalı: ${errorCount}`);
}

testAllOfflineGenerators();

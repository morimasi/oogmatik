import { describe, it, expect } from 'vitest';
import { generateKelimeCumleOffline } from '../src/components/KelimeCumleStudio/hooks/useKelimeCumleGenerator';
import { KELIME_CUMLE_REGISTRY } from '../src/components/KelimeCumleStudio/registry';
import { KelimeCumleActivityType, KelimeCumleConfig } from '../src/types/kelimeCumle';

describe('Kelime-Cümle Stüdyosu v3 Smoke & Pedagoji Testleri', () => {
    const activityTypes: KelimeCumleActivityType[] = [
        'bosluk_doldurma',
        'test',
        'kelime_tamamlama',
        'karisik_cumle',
        'zit_anlam'
    ];

    it('Tüm 5 aktivite türü KELIME_CUMLE_REGISTRY içinde eksiksiz kayıtlı olmalıdır', () => {
        expect(Object.keys(KELIME_CUMLE_REGISTRY)).toHaveLength(5);
        for (const type of activityTypes) {
            const entry = KELIME_CUMLE_REGISTRY[type];
            expect(entry).toBeDefined();
            expect(entry.title).toBeTruthy();
            expect(entry.description).toBeTruthy();
            expect(entry.icon).toBeTruthy();
            expect(entry.renderer).toBeDefined();
            expect(entry.defaultConfig).toBeDefined();
        }
    });

    it('Tüm 5 aktivite türü için offline jeneratör geçerli veri ve pedagogicalNote üretmelidir', () => {
        for (const type of activityTypes) {
            const config: KelimeCumleConfig = {
                type,
                difficulty: 'Orta',
                itemCount: 4,
                ageGroup: '8-10',
                topics: ['Doğa', 'Okul'],
                learningProfile: 'dyslexia'
            };

            const result = generateKelimeCumleOffline(config);

            // Başlık, yönerge ve items doğrulaması
            expect(result.title).toBeTruthy();
            expect(result.instructions).toBeTruthy();
            expect(result.items.length).toBeGreaterThan(0);
            expect(result.activityType).toBe(type);
            expect(result.difficulty).toBe('Orta');

            // Kural #2: pedagogicalNote ZORUNLU
            expect(result.pedagogicalNote).toBeTruthy();
            expect(typeof result.pedagogicalNote).toBe('string');
            expect(result.pedagogicalNote.length).toBeGreaterThan(15);

            // Kural #3: Tanı koyucu dil yasak ("disleksisi var" vb. asla olmamalı)
            expect(result.pedagogicalNote).not.toContain('disleksisi var');
            expect(result.pedagogicalNote).not.toContain('hastası');
            expect(result.pedagogicalNote).not.toContain('özürlü');

            // Hedef beceriler disleksi dostu olmalı
            expect(result.targetSkills).toBeDefined();
            expect(result.targetSkills.length).toBeGreaterThan(0);
        }
    });

    it('Nöro-pedagojik profiller (dyslexia, adhd, mixed) için pedagogicalNote dinamik uyum sağlamalıdır', () => {
        const dyslexiaResult = generateKelimeCumleOffline({
            type: 'bosluk_doldurma',
            difficulty: 'Başlangıç',
            itemCount: 3,
            ageGroup: '8-10',
            topics: [],
            learningProfile: 'dyslexia'
        });
        expect(dyslexiaResult.pedagogicalNote).toContain('Disleksi Desteği');

        const adhdResult = generateKelimeCumleOffline({
            type: 'karisik_cumle',
            difficulty: 'Orta',
            itemCount: 3,
            ageGroup: '8-10',
            topics: [],
            learningProfile: 'adhd'
        });
        expect(adhdResult.pedagogicalNote).toContain('DEHB Desteği');

        const mixedResult = generateKelimeCumleOffline({
            type: 'zit_anlam',
            difficulty: 'İleri',
            itemCount: 3,
            ageGroup: '11-13',
            topics: [],
            learningProfile: 'mixed'
        });
        expect(mixedResult.pedagogicalNote).toContain('Bütüncül Destek');
    });

    it('İstenen adet havuz sınırları dahilinde doğru dönmelidir', () => {
        const result = generateKelimeCumleOffline({
            type: 'test',
            difficulty: 'Orta',
            itemCount: 5,
            ageGroup: '8-10',
            topics: []
        });
        expect(result.items).toHaveLength(5);
    });
});

/**
 * MatProblemStudyosu — Kapsamlı Stüdyo & Jeneratör Test Paketi
 *
 * Test Edilenler:
 * 1. Öğrenci Profili (diskalkuli, disleksi, DEHB, karma) ve Yaş Grubu uyumu
 * 2. Pedagojik Not (pedagogicalNote / ZPD desteği)
 * 3. 1-8. Sınıf MEB müfredatı uyumu ve açık uçlu problem yapısı
 * 4. Cevap anahtarı, adım adım çözüm ve puanlama doğruluğu
 * 5. Registry entegrasyonu ve offline generator bağımsızlığı
 * 6. Store state yönetimi (setSinif, yasGrubu senkronizasyonu, profil)
 *
 * @vitest-environment jsdom
 */

import { describe, it, expect } from 'vitest';
import { generateOfflineMatProblemSeti } from '../src/services/offlineGenerators/mathProblemOffline';
import { useMatProblemStore } from '../src/store/useMatProblemStore';
import { ACTIVITY_GENERATOR_REGISTRY } from '../src/services/generators/registry';
import { ActivityType } from '../src/types/activity';
import type { LearningDisabilityProfile, AgeGroup } from '../src/types/matProblem';

describe('MatProblemStudyosu — Kapsamlı Fonksiyonel & Pedagojik Testler', () => {
    const profiller: LearningDisabilityProfile[] = ['dyscalculia', 'dyslexia', 'adhd', 'mixed'];
    const yasGruplari: AgeGroup[] = ['5-7', '8-10', '11-13', '14+'];

    it('Tüm öğrenci profilleri için set ve pedagogicalNote başarıyla üretilir', () => {
        for (const profil of profiller) {
            const set = generateOfflineMatProblemSeti({
                sinif: 4,
                secilenUniteler: [],
                secilenKazanimlar: [],
                problemSayisi: 4,
                zorlukSeviyesi: 'Orta',
                kategori: 'gercek-yasam',
                verilenlerGosterilsinMi: true,
                cozumKutusuGosterilsinMi: true,
                ogrenciProfili: profil,
                yasGrubu: '8-10',
            });

            expect(set.ogrenciProfili).toBe(profil);
            expect(set.yasGrubu).toBe('8-10');
            expect(set.pedagogicalNote).toBeDefined();
            expect(set.pedagogicalNote!.length).toBeGreaterThan(15);
            expect(set.problemler.length).toBeGreaterThanOrEqual(3);
        }
    });

    it('Yaş grupları ZPD standartlarına uygun olarak sete yansır', () => {
        for (const yg of yasGruplari) {
            const set = generateOfflineMatProblemSeti({
                sinif: 6,
                secilenUniteler: [],
                secilenKazanimlar: [],
                problemSayisi: 3,
                zorlukSeviyesi: 'Otomatik',
                kategori: 'beceri-temelli',
                verilenlerGosterilsinMi: true,
                cozumKutusuGosterilsinMi: true,
                yasGrubu: yg,
            });

            expect(set.yasGrubu).toBe(yg);
            expect(set.problemler.every(p => p.soruMetni.length > 10)).toBe(true);
        }
    });

    it('Cevap anahtarı çözüm adımları ve puanlama tutarlıdır', () => {
        const set = generateOfflineMatProblemSeti({
            sinif: 5,
            secilenUniteler: [],
            secilenKazanimlar: [],
            problemSayisi: 5,
            zorlukSeviyesi: 'Kolay',
            kategori: 'cok-adimli',
            verilenlerGosterilsinMi: true,
            cozumKutusuGosterilsinMi: true,
        });

        expect(set.cevapAnahtari.problemler.length).toBe(set.problemler.length);
        set.cevapAnahtari.problemler.forEach((ca, idx) => {
            expect(ca.problemNo).toBe(idx + 1);
            expect(ca.dogruCevap.length).toBeGreaterThan(0);
            expect(ca.cozumAdimlari.length).toBeGreaterThanOrEqual(2);
            expect(ca.puan).toBe(10);
            expect(ca.kazanimKodu).toBe(set.problemler[idx].kazanimKodu);
        });
    });

    it('useMatProblemStore setSinif çağrıldığında yaş grubunu otomatik senkronize eder', () => {
        const store = useMatProblemStore.getState();

        // 1. Sınıf -> 5-7 Yaş
        store.setSinif(1);
        expect(useMatProblemStore.getState().ayarlar.yasGrubu).toBe('5-7');

        // 3. Sınıf -> 8-10 Yaş
        store.setSinif(3);
        expect(useMatProblemStore.getState().ayarlar.yasGrubu).toBe('8-10');

        // 6. Sınıf -> 11-13 Yaş
        store.setSinif(6);
        expect(useMatProblemStore.getState().ayarlar.yasGrubu).toBe('11-13');

        // 8. Sınıf -> 14+ Yaş
        store.setSinif(8);
        expect(useMatProblemStore.getState().ayarlar.yasGrubu).toBe('14+');
    });

    it('ACTIVITY_GENERATOR_REGISTRY içinde MAT_PROBLEM offline jeneratörü doğrudan ve hatasız çalışır', async () => {
        const entry = ACTIVITY_GENERATOR_REGISTRY[ActivityType.MAT_PROBLEM];
        expect(entry).toBeDefined();
        expect(entry?.offline).toBeDefined();

        const result = await entry!.offline!({
            sinif: 4,
            problemSayisi: 3,
            difficulty: 'Orta',
        } as any);

        expect(result).toBeDefined();
        expect(result.sinif).toBe(4);
        expect(result.problemler.length).toBeGreaterThanOrEqual(3);
        expect(result.cevapAnahtari).toBeDefined();
    });
});

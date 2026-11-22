import { describe, it, expect, vi } from 'vitest';
import { curriculumService, getActivityDomain } from '../src/services/curriculumService';
import { ActivityType } from '../src/types/activity';
import { Curriculum, CurriculumDay } from '../src/types/core';

// Mock geminiClient generateWithSchema using plain string literals inside factory
vi.mock('../src/services/geminiClient.js', () => ({
    generateWithSchema: vi.fn().mockResolvedValue({
        goals: [
            '20\'ye kadar olan doğal sayılarda toplama işlemini modellerle kavrama',
            'Hece birleştirme ve akıcı okuma hızını artırma'
        ],
        note: 'Öğrencinin dikkat süresi göz önüne alınarak 15 dakikalık bloklar planlandı.',
        schedule: [
            {
                day: 1,
                focus: 'Sayı Hissi ve Nesne Sayma',
                kazanimKod: 'M.1.1.1.1',
                activities: [
                    {
                        activityId: 'number-sense-match',
                        title: 'Sayı Hissi ve Sayı Doğrusu',
                        duration: 15,
                        goal: 'Nesne sayıları ile rakamları eşleştirir.',
                        difficultyLevel: 'Kolay',
                        kazanimKod: 'M.1.1.1.1'
                    }
                ]
            },
            {
                day: 2,
                focus: 'Harf ve Ses Eşleştirme',
                activities: [
                    {
                        activityId: 'find-letter-pair',
                        title: 'Harf İkilisi Dedektifi',
                        duration: 15,
                        goal: 'Hedef harf ikililerini metin içinde ayırt eder.',
                        difficultyLevel: 'Orta'
                    }
                ]
            }
        ]
    })
}));

describe('Akıllı Müfredat Stüdyosu (Curriculum Studio) Duman Testleri', () => {

    it('getActivityDomain aktivite ID\'lerini doğru bilişsel kategorilere eşlemeli', () => {
        expect(getActivityDomain(ActivityType.NUMBER_SENSE)).toBe('math');
        expect(getActivityDomain(ActivityType.FIND_LETTER_PAIR)).toBe('reading');
        expect(getActivityDomain(ActivityType.PATTERN_COMPLETION)).toBe('visual');
        expect(getActivityDomain(ActivityType.READING_STROOP)).toBe('reading');
    });

    it('generatePlan MEB kazanımları ve nöro-pedagojik profili doğru oluşturmalı', async () => {
        const student = {
            id: 'test-student-1',
            name: 'Ali Can',
            grade: '1. Sınıf',
            age: 7,
            interests: ['Uzay'],
            weaknesses: ['Sayı Hissi', 'Harf Karıştırma']
        };

        const plan: Curriculum = await curriculumService.generatePlan(student, 7, {
            planType: 'hybrid',
            selectedKazanimlar: ['M.1.1.1.1: Nesne sayısı 20’ye kadar olan bir gruptaki nesnelerin sayısını belirler.'],
            subject: 'Matematik'
        });

        expect(plan).toBeDefined();
        expect(plan.studentName).toBe('Ali Can');
        expect(plan.grade).toBe('1. Sınıf');
        expect(plan.durationDays).toBe(7);
        expect(plan.goals.length).toBeGreaterThan(0);
        expect(plan.schedule.length).toBe(2);

        // 1. Gün kontrolleri
        const day1 = plan.schedule[0];
        expect(day1.day).toBe(1);
        expect(day1.focus).toBe('Sayı Hissi ve Nesne Sayma');
        expect(day1.kazanimKod).toBe('M.1.1.1.1');
        expect(day1.notes).toBe(''); // focus ile notes ayrımı sağlanmış olmalı!
        expect(day1.activities.length).toBe(1);
        expect(day1.activities[0].difficultyLevel).toBe('Kolay');
        expect(day1.activities[0].domain).toBe('math');

        // 2. Gün kontrolleri
        const day2 = plan.schedule[1];
        expect(day2.day).toBe(2);
        expect(day2.activities[0].difficultyLevel).toBe('Orta');
        expect(day2.activities[0].domain).toBe('reading');
    });

    it('CurriculumDay notes ve focus alanları birbirinden bağımsız yönetilebilmeli', () => {
        const day: CurriculumDay = {
            day: 1,
            focus: 'Geometrik Şekiller',
            activities: [],
            isCompleted: false,
            notes: 'Öğrenci üçgen ve kareyi başarıyla tanıdı.',
            kazanimKod: 'M.1.2.1.1'
        };

        expect(day.focus).toBe('Geometrik Şekiller');
        expect(day.notes).toBe('Öğrenci üçgen ve kareyi başarıyla tanıdı.');
        expect(day.focus).not.toBe(day.notes);
    });

    it('Zorluk seviyesi Türkçeleştirilmiş enum (Kolay/Orta/Zor) standartlarını karşılamalı', async () => {
        const student = { name: 'Ayşe', grade: '2. Sınıf' };
        const plan = await curriculumService.generatePlan(student, 3);
        
        for (const day of plan.schedule) {
            for (const act of day.activities) {
                expect(['Kolay', 'Orta', 'Zor']).toContain(act.difficultyLevel);
            }
        }
    });

});

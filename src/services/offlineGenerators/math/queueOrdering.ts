/**
 * Offline Generator for QUEUE ORDERING (Sıralama / Sıra Alma Becerisi)
 * Ultra-premium customizable compact minimal spacing A4 worksheet generation
 * Deterministic unique answers guarantee + Clinical skill progression
 */

import { GeneratorOptions } from '../../../types.js';
import { shuffle } from '../helpers';

export interface QueueOrderingProblem {
    id: string;
    locationId: string;
    locationName: string;
    totalPeople: number;
    people: Array<{
        id: string;
        name: string;
        position: number;
        icon: string;
        clue?: string;
    }>;
    questionPerson: string;
    questionText: string;
    answer: number;
    answerText: string;
    options: string[];
    scenario: string;
    difficulty: 'easy' | 'medium' | 'hard';
    clueType: 'front' | 'behind' | 'middle' | 'from_end';
}

export const generateOfflineQueueOrdering = async (options: GeneratorOptions): Promise<any> => {
    const { customSettings } = options;
    const settings = (customSettings as any) || {};

    const locationType = options.locationType || settings.locationType || 'school';
    const maxQueueSize = options.maxQueueSize || settings.maxQueueSize || 10;
    const minQueueSize = options.minQueueSize || settings.minQueueSize || 5;
    const problemCount = options.problemCount || settings.problemCount || 6;
    const difficultyLevel = (options.difficulty as 'easy' | 'medium' | 'hard') || settings.difficulty || 'medium';

    // Scenarios
    const locationScenarios: Record<string, { name: string; icon: string }[]> = {
        school: [
            { name: 'Okul Kantini', icon: '🥪' },
            { name: 'Yemekhane Kuyruğu', icon: '🍽️' },
            { name: 'Kütüphane Odası', icon: '📚' },
        ],
        bus: [
            { name: 'Otobüs Durağı', icon: '🚌' },
            { name: 'Metro Turnikesi', icon: '🚇' },
            { name: 'Tramvay Kapısı', icon: '🚊' },
        ],
        market: [
            { name: 'Süpermarket Kasası', icon: '🛒' },
            { name: 'Taze Fırın Sırası', icon: '🍞' },
            { name: 'Dondurmacı Kuyruğu', icon: '🍦' },
        ],
        amusement: [
            { name: 'Dönme Dolap Sırası', icon: '🎡' },
            { name: 'Hızlı Tren Kuyruğu', icon: '🎢' },
            { name: 'Bilet Gişesi', icon: '🎟️' },
        ]
    };

    const locations = locationScenarios[locationType] || locationScenarios.school;

    const namePool = ['Ömer', 'Nihanur', 'Tarık', 'Ertuğrul', 'Kayra', 'Mete', 'Kerem', 'Yunus', 'Elif', 'Ahmet', 'Zeynep', 'Mehmet', 'Ayşe', 'Fatma', 'Ali', 'Can', 'Efe', 'Deniz', 'Selin', 'Melis'];
    const iconsPool = ['👦', '👧', '🧑', '👨', '👩', '🧒'];

    const problems: QueueOrderingProblem[] = [];

    for (let i = 0; i < problemCount; i++) {
        const location = locations[i % locations.length];
        const totalPeople = Math.floor(Math.random() * (maxQueueSize - minQueueSize + 1)) + minQueueSize;

        // Pick names for scenario
        const currentNames = shuffle([...namePool]).slice(0, 4);
        const p1 = currentNames[0];
        const p2 = currentNames[1];
        const targetPerson = currentNames[2];

        let pos1 = 1;
        let pos2 = 2;
        let targetPos = 3;
        let scenario = '';
        let questionText = '';
        let answerText = '';

        if (difficultyLevel === 'easy') {
            // Easy: Baştan sıra biliniyor, hedef kişi hemen önünde veya arkasında
            pos1 = Math.floor(Math.random() * (totalPeople - 2)) + 2; // e.g. 2 to N-1
            const isBehind = Math.random() > 0.5;
            targetPos = isBehind ? pos1 + 1 : pos1 - 1;

            scenario = `${location.name}'nde ${totalPeople} kişilik bir kuyruk var. ${p1} sıranın baştan ${pos1}. kişisidir. ${targetPerson} ise ${p1}'nin hemen ${isBehind ? 'arkasındadır' : 'önündedir'}.`;
            questionText = `${targetPerson} sıranın baştan kaçıncı kişisidir?`;
            answerText = `Baştan ${targetPos}. sıra`;
        } else if (difficultyLevel === 'medium') {
            // Medium: İki kişi arasında veya sondan sıra hesabı
            const isFromEnd = Math.random() > 0.5;
            if (isFromEnd) {
                // Sondan X. kişi = Baştan (Total - X + 1)
                const posFromEnd = Math.floor(Math.random() * (totalPeople - 2)) + 1; // 1 to totalPeople-2
                targetPos = totalPeople - posFromEnd + 1;

                scenario = `${location.name}'nde toplam ${totalPeople} kişi kuyrukta beklemektedir. ${targetPerson} sıranın sondan ${posFromEnd}. kişisidir.`;
                questionText = `${targetPerson} sıranın baştan kaçıncı kişisidir?`;
                answerText = `Baştan ${targetPos}. sıra`;
            } else {
                // Tam ortasında durma
                pos1 = Math.floor(Math.random() * (totalPeople - 4)) + 2; // e.g. 2
                pos2 = pos1 + 2; // e.g. 4
                targetPos = pos1 + 1; // e.g. 3

                scenario = `${location.name}'nde ${totalPeople} kişi var. ${p1} baştan ${pos1}., ${p2} ise baştan ${pos2}. sıradadır. ${targetPerson} tam bu iki kişinin ortasındadır.`;
                questionText = `${targetPerson} sıranın baştan kaçıncı kişisidir?`;
                answerText = `Baştan ${targetPos}. sıra`;
            }
        } else {
            // Hard: Sondan pozisyon + Zincirleme bilgi
            pos1 = Math.floor(Math.random() * (totalPeople - 4)) + 2; // e.g. 3
            pos2 = pos1 + 2; // e.g. 5
            const isAfterP2 = Math.random() > 0.5;
            targetPos = isAfterP2 ? pos2 + 1 : pos1 + 1;

            scenario = `${location.name}'nde ${totalPeople} kişi sıra bekleaktadır. ${p1} baştan ${pos1}. sıradadır. ${p2}, ${p1}'in 2 kişi arkasındadır. ${targetPerson} ise ${p2}'nin hemen ${isAfterP2 ? 'arkasındadır' : 'önündedir'}.`;
            questionText = `${targetPerson} sıranın baştan kaçıncı kişisidir?`;
            answerText = `Baştan ${targetPos}. sıra`;
        }

        // Generating exactly 4 unique options including correct answer
        const optionsSet = new Set<number>();
        optionsSet.add(targetPos);
        while (optionsSet.size < 4) {
            const wrongOpt = Math.floor(Math.random() * totalPeople) + 1;
            if (wrongOpt !== targetPos) {
                optionsSet.add(wrongOpt);
            }
        }

        const sortedOptions = Array.from(optionsSet).sort((a, b) => a - b).map(n => `${n}. sıra`);

        problems.push({
            id: `q-${i + 1}`,
            locationId: locationType,
            locationName: location.name,
            totalPeople,
            people: [
                { id: `p1`, name: p1, position: pos1, icon: iconsPool[i % iconsPool.length] },
                { id: `p2`, name: targetPerson, position: targetPos, icon: iconsPool[(i + 1) % iconsPool.length] }
            ],
            questionPerson: targetPerson,
            questionText,
            answer: targetPos,
            answerText,
            options: sortedOptions,
            scenario,
            difficulty: difficultyLevel,
            clueType: 'front'
        });
    }

    return {
        title: `Sıra Alma & Mantıksal Sıralama Becerisi`,
        instruction: 'Sorulardaki yön ipuçlarını (önce, sonra, baştan, sondan) takip ederek doğru sırayı bulun.',
        locationType,
        difficulty: difficultyLevel,
        problemCount,
        maxQueueSize,
        minQueueSize,
        settings: {
            showScenario: settings.showScenario !== false,
            showVisualClues: settings.showVisualClues !== false,
            showPositionNumbers: settings.showPositionNumbers !== false,
            theme: settings.theme || 'indigo'
        },
        problems,
    };
};

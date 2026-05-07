/**
 * Offline Generator for QUEUE ORDERING (Sıralama/Sıra Alma Becerisi)
 * Premium compact minimal spacing A4 worksheet generation
 */

import { GeneratorOptions } from '../../../types.js';

export const generateOfflineQueueOrdering = async (options: GeneratorOptions): Promise<any> => {
    const { topic, difficulty, worksheetCount, ageGroup, customSettings } = options;
    
    const settings = customSettings as any || {};
    const locationType = settings.locationType || 'yemekhane';
    const maxQueueSize = settings.maxQueueSize || 10;
    const minQueueSize = settings.minQueueSize || 5;
    const problemCount = settings.problemCount || 4;
    
    // Lokasyon senaryoları
    const locationScenarios: Record<string, { name: string; icon: string; description: string }[]> = {
        yemekhane: [
            { name: 'Okul Yemekhanesi', icon: '🍽️', description: 'Öğle yemeği sırası' },
            { name: 'Kantin', icon: '🥪', description: 'Teneffüs kuyruğu' },
        ],
        market: [
            { name: 'Market Kasası', icon: '🛒', description: 'Ödeme kuyruğu' },
            { name: 'Fırın', icon: '🍞', description: 'Ekmek sırası' },
        ],
        otobus: [
            { name: 'Otobüs Durağı', icon: '🚌', description: 'Otobüs bekleme sırası' },
            { name: 'Metro İstasyonu', icon: '🚇', description: 'Bilet alma kuyruğu' },
        ],
        sinema: [
            { name: 'Sinema Bilet Gişe', icon: '🎬', description: 'Bilet alma sırası' },
        ],
        hastane: [
            { name: 'Hastane Poliklinik', icon: '🏥', description: 'Muayene sırası' },
            { name: 'Eczane', icon: '💊', description: 'İlaç alma kuyruğu' },
        ],
        kutuphane: [
            { name: 'Kütüphane', icon: '📚', description: 'Kitap teslim sırası' },
        ],
    };
    
    const locations = locationScenarios[locationType] || locationScenarios.yemekhane;
    const location = locations[Math.floor(Math.random() * locations.length)];
    
    // Türk isimleri
    const names = ['Ömer', 'Nihanur', 'Tarık', 'Ertuğrul', 'Kayra', 'Mete', 'Kerem', 'Yunus', 'Elif', 'Ahmet', 'Zeynep', 'Mehmet', 'Ayşe', 'Fatma', 'Ali', 'Veli', 'Hasan', 'Hüseyin', 'Emine', 'Hatice'];
    
    const problems = [];
    
    for (let i = 0; i < problemCount; i++) {
        const totalPeople = Math.floor(Math.random() * (maxQueueSize - minQueueSize + 1)) + minQueueSize;
        const difficultyLevel = difficulty || 'medium';
        
        // Zorluka göre kişi sayısı ve ipuçları
        let knownPeopleCount: number;
        switch (difficultyLevel) {
            case 'easy':
                knownPeopleCount = Math.min(2, totalPeople - 1);
                break;
            case 'medium':
                knownPeopleCount = Math.min(3, totalPeople - 1);
                break;
            case 'hard':
                knownPeopleCount = Math.min(5, totalPeople - 1);
                break;
            case 'expert':
                knownPeopleCount = Math.min(7, totalPeople - 1);
                break;
            default:
                knownPeopleCount = 3;
        }
        
        // Rastgele pozisyonlar ata
        const positions = Array.from({ length: totalPeople }, (_, i) => i + 1);
        const shuffledPositions = positions.sort(() => Math.random() - 0.5);
        
        // Bilinen kişileri seç
        const usedNames = new Set<string>();
        const people = [];
        
        for (let j = 0; j < knownPeopleCount; j++) {
            let name: string;
            do {
                name = names[Math.floor(Math.random() * names.length)];
            } while (usedNames.has(name));
            usedNames.add(name);
            
            const position = shuffledPositions[j];
            let clue = '';
            
            // İpucu formatları
            if (Math.random() > 0.5) {
                // Doğrudan ipucu
                clue = `${position}. sırada`;
            } else if (position === totalPeople) {
                clue = 'en sonda';
            } else if (position === 1) {
                clue = 'en başta';
            } else {
                clue = `${position}. sırada`;
            }
            
            people.push({
                id: `person-${i}-${j}`,
                name,
                position,
                icon: ['👦', '👧', '👨', '👩'][Math.floor(Math.random() * 4)],
                clue,
            });
        }
        
        // Sorulan kişi (bilinenler arasında olmayan)
        let questionPerson: string;
        do {
            questionPerson = names[Math.floor(Math.random() * names.length)];
        } while (usedNames.has(questionPerson));
        
        // Cevap (rastgele bir pozisyon)
        const remainingPositions = positions.filter(p => !people.some(person => person.position === p));
        const answer = remainingPositions[Math.floor(Math.random() * remainingPositions.length)];
        
        // Senaryo metni oluştur
        let scenario = `${location.name}'nde ${totalPeople} öğrenci bulunmaktadır. `;
        scenario += people.map(p => `${p.name} ${p.clue}`).join(', ');
        scenario += '. Buna göre';
        
        const questionText = `${questionPerson} kaçıncı sırada bulunmaktadır?`;
        
        problems.push({
            id: `problem-${i}`,
            locationId: locationType,
            locationName: location.name,
            totalPeople,
            people,
            questionPerson,
            questionText,
            answer,
            scenario,
            difficulty: difficultyLevel,
            steps: difficultyLevel === 'easy' ? 1 : difficultyLevel === 'medium' ? 2 : difficultyLevel === 'hard' ? 3 : 4,
        });
    }
    
    return {
        title: `Sıra Alma Becerisi - ${location.name}`,
        instruction: 'Her soruyu dikkatlice okuyun ve sıralamayı bulun.',
        locationType,
        difficulty: difficulty || 'medium',
        problemCount,
        maxQueueSize,
        minQueueSize,
        showVisualClues: settings.showVisualClues !== false,
        showPositionNumbers: settings.showPositionNumbers !== false,
        problems,
        pedagogicalNote: 'Sıralama becerisi, günlük yaşamda yön algısı ve mantıksal çıkarım yeteneğini geliştirir.',
    };
};

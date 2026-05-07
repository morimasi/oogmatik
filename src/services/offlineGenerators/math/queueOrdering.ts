/**
 * Offline Generator for QUEUE ORDERING (Sıralama/Sıra Alma Becerisi)
 * Ultra-premium customizable compact minimal spacing A4 worksheet generation
 * Advanced settings: difficulty, theme, location, icon style, layout, visual density
 */

import { GeneratorOptions } from '../../../types.js';

export const generateOfflineQueueOrdering = async (options: GeneratorOptions): Promise<any> => {
    const { topic, difficulty, worksheetCount, ageGroup, customSettings } = options;
    
    const settings = customSettings as any || {};
    const locationType = settings.locationType || 'school';
    const maxQueueSize = settings.maxQueueSize || 10;
    const minQueueSize = settings.minQueueSize || 5;
    const problemCount = settings.problemCount || 4;
    
    // Premium theme options
    const theme = settings.theme || 'indigo';
    const iconStyle = settings.iconStyle || 'emoji';
    const layout = settings.layout || 'grid';
    const visualDensity = settings.visualDensity || 'comfortable';
    const fontSize = settings.fontSize || 'medium';
    const cardStyle = settings.cardStyle || 'elevated';
    const headerStyle = settings.headerStyle || 'gradient';
    const highlightKeywords = settings.highlightKeywords !== false;
    const showScenario = settings.showScenario !== false;
    const showVisualClues = settings.showVisualClues !== false;
    const showPositionNumbers = settings.showPositionNumbers !== false;
    const showAnswers = settings.showAnswers || false;
    
    // Extended location scenarios
    const locationScenarios: Record<string, { name: string; icon: string; description: string }[]> = {
        school: [
            { name: 'Okul Yemekhanesi', icon: '🍽️', description: 'Öğle yemeği sırası' },
            { name: 'Okul Kantini', icon: '🥪', description: 'Teneffüs kuyruğu' },
            { name: 'Sınıf Kapısı', icon: '🚪', description: 'Derse giriş sırası' },
        ],
        bus: [
            { name: 'Otobüs Durağı', icon: '🚌', description: 'Otobüs bekleme sırası' },
            { name: 'Metro İstasyonu', icon: '🚇', description: 'Bilet alma kuyruğu' },
            { name: 'Servis Minibüsü', icon: '🚐', description: 'Okul servisi sırası' },
        ],
        market: [
            { name: 'Market Kasası', icon: '🛒', description: 'Ödeme kuyruğu' },
            { name: 'Fırın', icon: '🍞', description: 'Ekmek sırası' },
            { name: 'Manav', icon: '🍎', description: 'Sebze meyve sırası' },
        ],
        hospital: [
            { name: 'Hastane Poliklinik', icon: '🏥', description: 'Muayene sırası' },
            { name: 'Eczane', icon: '💊', description: 'İlaç alma kuyruğu' },
            { name: 'Laboratuvar', icon: '🔬', description: 'Kan tahlili sırası' },
        ],
        cinema: [
            { name: 'Sinema Bilet Gişesi', icon: '🎬', description: 'Bilet alma sırası' },
            { name: 'Tiyatro', icon: '🎭', description: 'Giriş sırası' },
        ],
        library: [
            { name: 'Kütüphane', icon: '📚', description: 'Kitap teslim sırası' },
            { name: 'Kitap Fuarı', icon: '📖', description: 'Kitap imzalama sırası' },
        ],
    };
    
    const locations = locationScenarios[locationType] || locationScenarios.school;
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
        const people: Array<{
            id: string;
            name: string;
            position: number;
            icon?: string;
            clue?: string;
        }> = [];
        
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
        instruction: settings.customInstruction || 'Her soruyu dikkatlice okuyun ve sıralamayı bulun.',
        locationType,
        difficulty: difficulty || 'medium',
        problemCount,
        maxQueueSize,
        minQueueSize,
        // Premium settings
        theme,
        iconStyle,
        layout,
        visualDensity,
        fontSize,
        cardStyle,
        headerStyle,
        highlightKeywords,
        showScenario,
        showVisualClues,
        showPositionNumbers,
        showAnswers,
        problems,
        pedagogicalNote: 'Sıralama becerisi, günlük yaşamda yön algısı ve mantıksal çıkarım yeteneğini geliştirir.',
    };
};

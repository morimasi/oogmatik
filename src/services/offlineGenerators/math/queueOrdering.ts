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
        const totalPeople = Math.floor(Math.random() * ((maxQueueSize || 10) - (minQueueSize || 5) + 1)) + (minQueueSize || 5);
        const difficultyLevel = difficulty || 'medium';
        
        // Pilih 3 farklı isim
        const selectedNames = [...names].sort(() => 0.5 - Math.random()).slice(0, 3);
        const personA = selectedNames[0];
        const personB = selectedNames[1];
        const questionPerson = selectedNames[2];

        let people = [];
        let scenario = '';
        let answer = 0;
        let questionText = `${questionPerson} sıranın baştan kaçıncı kişisidir?`;

        // Difficulty based logically constrained scenario generation
        if (difficultyLevel === 'easy') {
            // Easy: Sadece 1 bilinmeyen, hemen önü veya arkası.
            // totalPeople = 5 -> posA = 2, 3, veya 4 olabilir.
            const posA = Math.floor(Math.random() * (totalPeople - 2)) + 2; 
            const isBehind = Math.random() > 0.5;
            answer = isBehind ? posA + 1 : posA - 1;
            
            people.push({ id: `person-${i}-0`, name: personA, position: posA, icon: '👦', clue: `Baştan ${posA}. sırada` });
            
            scenario = `${location.name}nde toplam ${totalPeople} kişi beklemektedir. `;
            scenario += `Bilinenlere göre ${personA} sıranın baştan ${posA}. kişisidir. `;
            scenario += `${questionPerson} ise ${personA}'nın hemen ${isBehind ? 'arkasında' : 'önünde'} durmaktadır. Buna göre,`;
        } 
        else if (difficultyLevel === 'medium') {
            // Medium: 2 kişi verilip arası veya 2-3 adım sonrası.
            const posA = Math.floor(Math.random() * (totalPeople - 4)) + 2; // e.g. 2
            const offsetB = Math.random() > 0.5 ? 2 : 1; 
            const posB = posA + offsetB; // e.g. 4
            
            if (offsetB === 2 && Math.random() > 0.5) {
                // Q is specifically between A and B
                answer = posA + 1;
                people.push({ id: `person-${i}-0`, name: personA, position: posA, icon: '👦', clue: `Baştan ${posA}. sırada` });
                people.push({ id: `person-${i}-1`, name: personB, position: posB, icon: '👧', clue: `Baştan ${posB}. sırada` });
                
                scenario = `${location.name}nde toplam ${totalPeople} kişi beklemektedir. `;
                scenario += `${personA} baştan ${posA}. sırada, ${personB} ise baştan ${posB}. sıradadır. `;
                scenario += `${questionPerson}, ${personA} ile ${personB}'nin tam ortasında durmaktadır. Buna göre,`;
            } else {
                // Q is behind/front of A by exactly 2 or 3 steps.
                const isBehind = Math.random() > 0.5;
                const offsetQ = Math.floor(Math.random() * 2) + 2; // 2 or 3 steps
                
                answer = isBehind ? posA + offsetQ : posA - offsetQ;
                
                if (answer < 1) answer = posA + offsetQ;
                if (answer > totalPeople) answer = posA - offsetQ;
                
                const finalIsBehind = answer > posA;
                const finalOffset = Math.abs(answer - posA);

                people.push({ id: `person-${i}-0`, name: personA, position: posA, icon: '👦', clue: `Baştan ${posA}. sırada` });
                
                scenario = `${location.name}nde toplam ${totalPeople} kişi beklemektedir. `;
                scenario += `${personA} sıranın baştan ${posA}. kişisidir. `;
                scenario += `${questionPerson}, ${personA}'nın ${finalOffset} sıra ${finalIsBehind ? 'arkasındadır' : 'önündedir'}. Buna göre,`;
            }
        }
        else {
            // Hard / Expert: Sondan pozisyon hesaplamaları veya 3 adımlı zincir.
            let answerFromEnd = Math.floor(Math.random() * (totalPeople - 3)) + 2; 
            answer = totalPeople - answerFromEnd + 1; // Mutlak baştan pozisyon. 
            // e.g. total=10, answerFromEnd=3 -> answer = 8.
            
            let posA = answer - 2; // A is 2 steps ahead of Q.
            if (posA < 1) { // Sınır kontrolü (Boundary bug fix)
                posA = 2;
                answer = 4;
                answerFromEnd = totalPeople - answer + 1;
            }

            people.push({ id: `person-${i}-0`, name: personA, position: posA, icon: '👦', clue: `Baştan ${posA}. sırada` });
            
            const isQFromEnd = Math.random() > 0.5;

            scenario = `${location.name}nde toplam ${totalPeople} kişi beklemektedir. `;
            scenario += `${personA} sıranın baştan ${posA}. kişisidir. `;
            
            if (isQFromEnd) {
                scenario += `${questionPerson} ise sıranın sondan ${answerFromEnd}. kişisidir. Buna göre,`;
            } else {
                scenario += `${questionPerson}, ${personA}'nın 2 sıra arkasında yer almaktadır. Buna göre,`;
            }
        }
        
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
            steps: difficultyLevel === 'easy' ? 1 : difficultyLevel === 'medium' ? 2 : 3,
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

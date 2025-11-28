import { GeneratorOptions, AttentionFocusData } from '../../types';
import { getRandomItems, shuffle } from './helpers';

export const generateOfflineAttentionFocus = async (options: GeneratorOptions): Promise<AttentionFocusData[]> => {
    const { worksheetCount, itemCount, difficulty } = options;
    const count = itemCount || 4;

    // Structured data for dynamic logic generation without giving away the answer
    const itemPool = {
        fruit: [
            { name: 'Limon', color: 'sarı', feature: 'ekşi', type: 'meyve' },
            { name: 'Çilek', color: 'kırmızı', feature: 'tatlı', type: 'meyve' },
            { name: 'Muz', color: 'sarı', feature: 'uzun', type: 'meyve' },
            { name: 'Karpuz', color: 'yeşil', feature: 'büyük', type: 'meyve' },
            { name: 'Kiraz', color: 'kırmızı', feature: 'saplı', type: 'meyve' },
            { name: 'Armut', color: 'yeşil', feature: 'sulu', type: 'meyve' }
        ],
        veg: [
            { name: 'Biber', color: 'yeşil', feature: 'acı', type: 'sebze' },
            { name: 'Domates', color: 'kırmızı', feature: 'yuvarlak', type: 'sebze' },
            { name: 'Havuç', color: 'turuncu', feature: 'uzun', type: 'sebze' },
            { name: 'Patlıcan', color: 'mor', feature: 'uzun', type: 'sebze' },
            { name: 'Ispanak', color: 'yeşil', feature: 'yapraklı', type: 'sebze' },
            { name: 'Soğan', color: 'kahverengi', feature: 'kokulu', type: 'sebze' }
        ],
        clothes: [
            { name: 'Mayo', season: 'yaz', location: 'deniz', part: 'vücut' },
            { name: 'Atkı', season: 'kış', location: 'boyun', part: 'aksesuar' },
            { name: 'Bere', season: 'kış', location: 'baş', part: 'aksesuar' },
            { name: 'Eldiven', season: 'kış', location: 'el', part: 'aksesuar' },
            { name: 'Şort', season: 'yaz', location: 'bacak', part: 'alt' },
            { name: 'Bot', season: 'kış', location: 'ayak', part: 'ayakkabı' }
        ],
        vehicles: [
            { name: 'Tren', way: 'ray', type: 'toplu' },
            { name: 'Uçak', way: 'hava', type: 'hızlı' },
            { name: 'Gemi', way: 'deniz', type: 'büyük' },
            { name: 'Bisiklet', way: 'kara', type: 'tekerlekli' },
            { name: 'Otobüs', way: 'kara', type: 'toplu' },
            { name: 'Helikopter', way: 'hava', type: 'pervaneli' }
        ]
    };

    return Array.from({ length: worksheetCount }, () => {
        const puzzles = Array.from({ length: count }, () => {
            // Randomly select a category logic
            const categoryKeys = Object.keys(itemPool);
            const selectedCat = getRandomItems(categoryKeys, 1)[0];
            const items = shuffle((itemPool as any)[selectedCat]);
            
            // Logic Building
            let target, clueItem, riddle;
            const isLeft = Math.random() > 0.5;
            
            // Select Target and Clue (must be different)
            target = items[0];
            clueItem = items[1]; // Ensure we have at least 2 items
            
            // Construct Riddle based on attributes (NOT NAMES)
            if (selectedCat === 'fruit' || selectedCat === 'veg') {
                // Determine difficulty wording
                let clueDesc, targetDesc;
                if (difficulty === 'Başlangıç') {
                    clueDesc = `${clueItem.color} renkli ${clueItem.type}nin`; // "kırmızı renkli meyvenin"
                    targetDesc = `${target.color} renklidir`;
                } else {
                    clueDesc = `${clueItem.feature} olan ${clueItem.type}nin`; // "acı olan sebzenin"
                    targetDesc = `${target.feature} bir ${target.type}dir`;
                }
                
                riddle = `Aradığımız yiyecek, ${clueDesc} bulunduğu kutudadır. Bulunduğu kutudaki ${targetDesc}.`;
                
                // Mix fruits and veg for boxes
                const allFood = [...itemPool.fruit, ...itemPool.veg];
                const available = allFood.filter(i => i.name !== target.name && i.name !== clueItem.name);
                const randomDistractors = getRandomItems(available, 6);
                
                // Construct Box contents ensuring Target and Clue are together
                const boxContents = [target.name, clueItem.name, randomDistractors[0].name, randomDistractors[1].name];
                const otherBoxContents = randomDistractors.slice(2, 6).map((i:any) => i.name);
                
                const targetBox = shuffle(boxContents);
                const otherBox = shuffle(otherBoxContents);
                
                return {
                    riddle,
                    boxes: isLeft ? [{ items: targetBox }, { items: otherBox }] : [{ items: otherBox }, { items: targetBox }],
                    options: shuffle([target.name, ...getRandomItems(available.map((i:any)=>i.name), 4)]),
                    answer: target.name
                };

            } else if (selectedCat === 'clothes') {
                const clueDesc = difficulty === 'Başlangıç' ? `${clueItem.season}ın giyilen` : `${clueItem.location}a takılan`;
                const targetDesc = difficulty === 'Başlangıç' ? `${target.part} giysisidir` : `${target.location}a giyilir`;
                
                riddle = `Aradığımız eşya, ${clueDesc} bir eşyanın bulunduğu kutudadır. Kendisi ${targetDesc}.`;
                
                const available = itemPool.clothes.filter((i:any) => i.name !== target.name && i.name !== clueItem.name);
                const randomDistractors = getRandomItems(available, 6);
                
                const boxContents = [target.name, clueItem.name, randomDistractors[0].name, randomDistractors[1].name];
                const otherBoxContents = randomDistractors.slice(2, 6).map((i:any) => i.name);
                
                return {
                    riddle,
                    boxes: isLeft ? [{ items: shuffle(boxContents) }, { items: shuffle(otherBoxContents) }] : [{ items: shuffle(otherBoxContents) }, { items: shuffle(boxContents) }],
                    options: shuffle([target.name, ...getRandomItems(available.map((i:any)=>i.name), 4)]),
                    answer: target.name
                };
            } else {
                // Vehicles
                const clueDesc = `${clueItem.way} yolunda giden`;
                const targetDesc = `${target.way} yolunda gider`;
                
                riddle = `Aradığımız taşıt, ${clueDesc} bir aracın bulunduğu kutudadır. Kendisi ${targetDesc}.`;
                
                const available = itemPool.vehicles.filter((i:any) => i.name !== target.name && i.name !== clueItem.name);
                const randomDistractors = getRandomItems(available, 6);
                
                const boxContents = [target.name, clueItem.name, randomDistractors[0].name, randomDistractors[1].name];
                const otherBoxContents = randomDistractors.slice(2, 6).map((i:any) => i.name);
                
                return {
                    riddle,
                    boxes: isLeft ? [{ items: shuffle(boxContents) }, { items: shuffle(otherBoxContents) }] : [{ items: shuffle(otherBoxContents) }, { items: shuffle(boxContents) }],
                    options: shuffle([target.name, ...getRandomItems(available.map((i:any)=>i.name), 4)]),
                    answer: target.name
                };
            }
        });

        return {
            title: `Dikkatini Ver (${difficulty})`,
            instruction: "İpuçlarını dikkatlice okuyun ve doğru cevabı bulun.",
            pedagogicalNote: "Okuduğunu anlama, görsel tarama ve mantıksal çıkarım.",
            imagePrompt: "Dedektif",
            puzzles
        };
    });
};
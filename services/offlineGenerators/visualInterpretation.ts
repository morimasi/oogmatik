
import { GeneratorOptions, WorksheetData } from '../../types';
import { getRandomInt, shuffle } from './helpers';

const VISUAL_SCENES = [
    {
        title: "Piknik Günü",
        instruction: "Piknik karesini dikkatle inceleyin ve detayları fark edin.",
        imagePrompt: "A cozy family picnic in a lush green park. A red and white checkered blanket is spread on the grass. A basket with bread and grapes is on the blanket. Two children are playing with a frisbee. In the background, there is a small blue pond with ducks.",
        alt: "Parkta piknik yapan aile ve oyun oynayan çocuklar.",
        questions: [
            { q: "Piknik örtüsü ne renktir?", type: "multiple", options: ["Kırmızı-Beyaz", "Mavi-Sarı", "Yeşil-Siyah"], answer: "Kırmızı-Beyaz" },
            { q: "Piknik sepetinin içinde hangi meyve bulunuyor?", type: "multiple", options: ["Elma", "Üzüm", "Muz"], answer: "Üzüm" },
            { q: "Arka plandaki gölette hangi hayvanlar yüzüyor?", type: "multiple", options: ["Balıklar", "Kurbağalar", "Ördekler"], answer: "Ördekler" },
            { q: "Çocuklar hangi oyuncakla oynuyor?", type: "open", answer: "Frisbee (Uçan daire)" }
        ]
    },
    {
        title: "Uzay İstasyonu",
        instruction: "Geleceğin uzay istasyonunda neler olduğunu keşfet!",
        imagePrompt: "Inside a futuristic space station control room. Large panoramic windows show the Earth in the distance. Several robot assistants are moving crates. An astronaut in a white suit is looking at holographic displays. There is a small plant growing in a glass sphere.",
        alt: "Uzay istasyonu kontrol odasında astronot ve robotlar.",
        questions: [
            { q: "Pencereden dışarı bakıldığında hangi gezegen görünüyor?", type: "multiple", options: ["Mars", "Dünya", "Jüpiter"], answer: "Dünya" },
            { q: "Astronot neyi inceliyor?", type: "multiple", options: ["Holografik ekranlar", "Kağıt harita", "Mikroskop"], answer: "Holografik ekranlar" },
            { q: "Cam küre içinde ne yetişiyor?", type: "open", answer: "Küçük bir bitki" },
            { q: "Kutuları kimler taşıyor?", type: "multiple", options: ["Robotlar", "Astronotlar", "Uzaylılar"], answer: "Robotlar" }
        ]
    },
    {
        title: "Antik Orman",
        instruction: "Büyülü ve antik bir ormanda gizli detayları bul.",
        imagePrompt: "A magical ancient forest with giant glowing mushrooms of purple and blue. A crystal clear stream flows through the center. Small glowing fairies are hovering near the flowers. A large white stag is drinking water from the stream.",
        alt: "Işıldayan mantarlar ve perilerin olduğu büyülü orman.",
        questions: [
            { q: "Derede su içen hayvan hangisidir?", type: "multiple", options: ["Geyik", "Ayı", "Kurt"], answer: "Geyik" },
            { q: "Mantarlar ne renk parlıyor?", type: "multiple", options: ["Kırmızı ve Sarı", "Mor ve Mavi", "Yeşil ve Pembe"], answer: "Mor ve Mavi" },
            { q: "Çiçeklerin etrafında kimler uçuyor?", type: "open", answer: "Işıldayan periler" },
            { q: "Geyiğin rengi nedir?", type: "multiple", options: ["Kahverengi", "Beyaz", "Siyah"], answer: "Beyaz" }
        ]
    }
];

export const generateOfflineVisualInterpretation = async (options: GeneratorOptions): Promise<WorksheetData> => {
    const { worksheetCount = 1 } = options;

    return Array.from({ length: worksheetCount }, () => {
        const scene = VISUAL_SCENES[getRandomInt(0, VISUAL_SCENES.length - 1)];

        return {
            id: crypto.randomUUID(),
            activityType: "VISUAL_INTERPRETATION",
            title: scene.title,
            instruction: scene.instruction,
            layoutArchitecture: {
                blocks: [
                    {
                        type: "image",
                        content: {
                            prompt: scene.imagePrompt,
                            alt: scene.alt
                        }
                    },
                    {
                        type: "question",
                        content: {
                            items: scene.questions
                        }
                    }
                ]
            }
        };
    });
};

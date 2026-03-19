import { GeneratorOptions, WorksheetData } from '../../types';
import { getRandomInt } from './helpers';

const VISUAL_SCENES = [
    {
        title: "Piknik Günü",
        instruction: "Piknik karesini bir dedektif gibi inceleyin ve gizli detayları fark edin.",
        imagePrompt: "A high-quality, cinematic style illustration of a family picnic in a lush green park. Golden hour lighting. A red and white checkered blanket, a basket with purple grapes and a sourdough loaf. Two children in blue and yellow shirts playing with a lime green frisbee. In the background, a small pond with three white ducks and a weeping willow tree.",
        alt: "Parkta güneşli bir günde piknik yapan aile ve göletteki ördekler.",
        pedagogicalNote: "Görsel-mekansal algı ve detay odaklı dikkat becerilerini hedefler.",
        questions: [
            { q: "Piknik örtüsünün deseni ve rengi nedir?", type: "multiple", options: ["Kırmızı-Beyaz Kareli", "Mavi-Sarı Çizgili", "Düz Yeşil", "Pembe Puantiyeli"], answer: "Kırmızı-Beyaz Kareli" },
            { q: "Görseldeki gölette toplam kaç tane ördek yüzüyor?", type: "multiple", options: ["2", "3", "4", "5"], answer: "3" },
            { q: "Çocukların oynadığı oyuncağın (frisbee) rengi tam olarak nedir?", type: "multiple", options: ["Canlı Yeşil", "Parlak Kırmızı", "Gök Mavisi", "Turuncu"], answer: "Canlı Yeşil" },
            { q: "Sepetin içindeki ekmeğin türü nedir?", type: "open", answer: "Ekşi mayalı (Sourdough) ekmek" }
        ]
    },
    {
        title: "Kış Şehri Gizemi",
        instruction: "Karla kaplı bu şehirde her şey göründüğü gibi mi? Dikkatle bak!",
        imagePrompt: "Hyper-realistic winter street at dusk. Warm orange light from street lamps reflecting on fresh snow. A red vintage car is parked near a bakery. An old man in a green coat is walking a white poodle. On the bakery window, there is a golden 'Closed' sign and a small cat silhouette.",
        alt: "Karlı bir kış akşamında sokak lambaları ve kırmızı araba.",
        pedagogicalNote: "Şekil-zemin algısı ve düşük ışıkta görsel ayırım becerilerini geliştirir.",
        questions: [
            { q: "Sokak lambalarından yayılan ışığın rengi nedir?", type: "multiple", options: ["Sıcak Turuncu", "Soğuk Mavi", "Parlak Beyaz", "Mor"], answer: "Sıcak Turuncu" },
            { q: "Bakery (Fırın) camında hangi hayvanın silüeti görünüyor?", type: "multiple", options: ["Kedi", "Köpek", "Kuş", "Tavşan"], answer: "Kedi" },
            { q: "Yaşlı adamın yanındaki köpeğin cinsi/rengi nedir?", type: "multiple", options: ["Beyaz Poodle", "Siyah Labrador", "Kahverengi Golden", "Gri Kurt Köpeği"], answer: "Beyaz Poodle" },
            { q: "Park halindeki antika araba ne renktir?", type: "open", answer: "Kırmızı" }
        ]
    },
    {
        title: "Deniz Altı Krallığı",
        instruction: "Okyanusun derinliklerindeki sihirli dünyayı analiz et.",
        imagePrompt: "Vibrant underwater coral reef scene. Deep blue water with shafts of sunlight piercing through. A large orange octopus is hiding behind purple coral. A school of neon blue fish is swimming in a spiral. A sunken wooden treasure chest is half-buried in the white sand, slightly open showing gold coins.",
        alt: "Mercan resifleri arasında saklanan ahtapot ve hazine sandığı.",
        pedagogicalNote: "Görsel tarama ve renk-biçim sabitliği becerilerini destekler.",
        questions: [
            { q: "Turuncu ahtapot hangi renk mercanın arkasına saklanmış?", type: "multiple", options: ["Mor", "Yeşil", "Sarı", "Kırmızı"], answer: "Mor" },
            { q: "Mavi balık sürüsü hangi formda yüzüyor?", type: "multiple", options: ["Sarmal (Spiral)", "Düz Hat", "Üçgen", "Dağınık"], answer: "Sarmal (Spiral)" },
            { q: "Kumların arasına yarı gömülü duran nesne nedir?", type: "multiple", options: ["Hazine Sandığı", "Eski Bir Gemi", "Dev Bir İnci", "Denizaltı"], answer: "Hazine Sandığı" },
            { q: "Hazine sandığının içinde ne parlıyor?", type: "open", answer: "Altın sikkeler" }
        ]
    },
    {
        title: "Büyülü Kütüphane",
        instruction: "Bu kütüphanede kitaplar uçuyor olabilir mi? İyi incele!",
        imagePrompt: "Whimsical ancient library with floating books and glowing lanterns. High arched ceilings. A young girl with round glasses is sitting on a rolling ladder, holding a thick blue book. A small mechanical owl is perched on a stack of encyclopedias. Dust motes dancing in the light beams.",
        alt: "Uçan kitaplar ve ışıldayan fenerlerle dolu masalsı bir kütüphane.",
        pedagogicalNote: "Mekansal organizasyon ve detaylı görsel dikkat üzerine odaklanır.",
        questions: [
            { q: "Kütüphane tavanlarının mimari şekli nasıldır?", type: "multiple", options: ["Yüksek Kemerli", "Düz ve Alçak", "Cam Tavan", "Kubbeli"], answer: "Yüksek Kemerli" },
            { q: "Merdivende oturan kızın elindeki kitap ne renktir?", type: "multiple", options: ["Mavi", "Kırmızı", "Yeşil", "Sarı"], answer: "Mavi" },
            { q: "Ansiklopedilerin üzerinde duran mekanik hayvan hangisidir?", type: "multiple", options: ["Baykuş", "Kedi", "Fare", "Ejderha"], answer: "Baykuş" },
            { q: "Işık demetlerinin içinde ne dans ediyor?", type: "open", answer: "Toz zerreleri" }
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
            pedagogicalNote: scene.pedagogicalNote,
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
    }) as any;
};

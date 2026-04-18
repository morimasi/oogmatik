import { GeneratorOptions, WorksheetData } from '../../types';
import { getRandomInt } from './helpers';

const VISUAL_SCENES = [
    {
        title: "RESİM YORUMLAMA",
        instruction: "Aşağıdaki cümleleri resme göre okuyup cevapla. Cümle Doğruysa (D) yanlışsa (Y) harfi koy.",
        imagePrompt: "A high-quality, cinematic style illustration of a family picnic in a lush green park. Golden hour lighting. A red and white checkered blanket, a basket with purple grapes and a sourdough loaf. Two children in blue and yellow shirts playing with a lime green frisbee. In the background, a small pond with three white ducks and a weeping willow tree.",
        alt: "Parkta güneşli bir günde piknik yapan aile ve göletteki ördekler.",
        pedagogicalNote: "Görsel-mekansal algı ve detay odaklı dikkat becerilerini hedefler.",
        questions: [
            { text: "Aile kırmızı-beyaz kareli bir örtü üzerinde piknik yapıyor.", type: "true_false", answer: "D" },
            { text: "Sepetin içinde kırmızı elmalar var.", type: "true_false", answer: "Y" },
            { text: "Çocuklardan biri sarı gömlek giymiş.", type: "true_false", answer: "D" },
            { text: "Gölette dört tane beyaz göçmen kuş yüzüyor.", type: "true_false", answer: "Y" },
            { text: "Geri planda yeşil yapraklı salkım söğüt ağacı var.", type: "true_false", answer: "D" },
            { text: "Çocuklar mavi renkli bir topla oynuyorlar.", type: "true_false", answer: "Y" },
            { text: "Çocukların oynadığı oyuncak canlı yeşil renktedir.", type: "true_false", answer: "D" },
            { text: "Havada gri bulutlar var ve yağmur yağıyor.", type: "true_false", answer: "Y" }
        ]
    },
    {
        title: "RESİM YORUMLAMA",
        instruction: "Aşağıdaki cümleleri resme göre okuyup cevapla. Cümle Doğruysa (D) yanlışsa (Y) harfi koy.",
        imagePrompt: "Hyper-realistic winter street at dusk. Warm orange light from street lamps reflecting on fresh snow. A red vintage car is parked near a bakery. An old man in a green coat is walking a white poodle. On the bakery window, there is a golden 'Closed' sign and a small cat silhouette.",
        alt: "Karlı bir kış akşamında sokak lambaları ve kırmızı araba.",
        pedagogicalNote: "Şekil-zemin algısı ve düşük ışıkta görsel ayırım becerilerini geliştirir.",
        questions: [
            { text: "Fırının camında 'Kapalı' yazan altın rengi bir tabela var.", type: "true_false", answer: "D" },
            { text: "Sokak lambalarından mavi renkli soğuk bir ışık yayılıyor.", type: "true_false", answer: "Y" },
            { text: "Yaşlı adam yeşil bir manto giymiş.", type: "true_false", answer: "D" },
            { text: "Fırının önünde park halinde sarı bir okul otobüsü var.", type: "true_false", answer: "Y" },
            { text: "Yaşlı adam beyaz bir köpeği yürüyüşe çıkarmış.", type: "true_false", answer: "D" },
            { text: "Sokaktaki karlar erimiş ve her yer çamur olmuş.", type: "true_false", answer: "Y" },
            { text: "Fırın camındaki silüet bir kediye aittir.", type: "true_false", answer: "D" },
            { text: "Park halindeki antika arabanın rengi kırmızıdır.", type: "true_false", answer: "D" },
            { text: "Camın arkasında bir köpek dışarıyı izliyor.", type: "true_false", answer: "Y" }
        ]
    },
    {
        title: "RESİM YORUMLAMA",
        instruction: "Aşağıdaki cümleleri resme göre okuyup cevapla. Cümle Doğruysa (D) yanlışsa (Y) harfi koy.",
        imagePrompt: "Vibrant underwater coral reef scene. Deep blue water with shafts of sunlight piercing through. A large orange octopus is hiding behind purple coral. A school of neon blue fish is swimming in a spiral. A sunken wooden treasure chest is half-buried in the white sand, slightly open showing gold coins.",
        alt: "Mercan resifleri arasında saklanan ahtapot ve hazine sandığı.",
        pedagogicalNote: "Görsel tarama ve renk-biçim sabitliği becerilerini destekler.",
        questions: [
            { text: "Büyük ahtapot mor renkli mercanın arkasına saklanmış.", type: "true_false", answer: "D" },
            { text: "Hazine sandığının kapağı tamamen kapalı.", type: "true_false", answer: "Y" },
            { text: "Mavi balıklar sarmal şeklinde yüzüyorlar.", type: "true_false", answer: "D" },
            { text: "Kumların arasında paslı bir çapa var.", type: "true_false", answer: "Y" },
            { text: "Ahtapotun rengi parlak turuncudur.", type: "true_false", answer: "D" },
            { text: "Sandığın içinden gümüş sikkeler dökülüyor.", type: "true_false", answer: "Y" },
            { text: "Hazine sandığı kısmen beyaz kuma gömülü duruyor.", type: "true_false", answer: "D" },
            { text: "Su altı sahnesi karanlık ve ürkütücü görünüyor.", type: "true_false", answer: "Y" }
        ]
    },
    {
        title: "RESİM YORUMLAMA",
        instruction: "Aşağıdaki cümleleri resme göre okuyup cevapla. Cümle Doğruysa (D) yanlışsa (Y) harfi koy.",
        imagePrompt: "Whimsical ancient library with floating books and glowing lanterns. High arched ceilings. A young girl with round glasses is sitting on a rolling ladder, holding a thick blue book. A small mechanical owl is perched on a stack of encyclopedias. Dust motes dancing in the light beams.",
        alt: "Uçan kitaplar ve ışıldayan fenerlerle dolu masalsı bir kütüphane.",
        pedagogicalNote: "Mekansal organizasyon ve detaylı görsel dikkat üzerine odaklanır.",
        questions: [
            { text: "Küçük kız yuvarlak çerçeveli gözlük takıyor.", type: "true_false", answer: "D" },
            { text: "Ansiklopedilerin üzerinde canlı ve siyah bir kedi oturuyor.", type: "true_false", answer: "Y" },
            { text: "Kızın elinde kalın, mavi ciltli bir kitap var.", type: "true_false", answer: "D" },
            { text: "Kütüphanenin tavanı dümdüz ve alçaktır.", type: "true_false", answer: "Y" },
            { text: "Kütüphanede bazı kitaplar havada uçuyor.", type: "true_false", answer: "D" },
            { text: "Kitapların üzerinde duran kuş mekanik bir baykuştur.", type: "true_false", answer: "D" },
            { text: "Kız yerde yumuşak bir minderin üzerinde oturuyor.", type: "true_false", answer: "Y" },
            { text: "Odadaki ışık demetleri arasında toz zerreleri görülüyor.", type: "true_false", answer: "D" }
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


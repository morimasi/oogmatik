
// ... existing imports ...
import { GeneratorOptions, AttentionFocusData, CodeReadingData, AttentionToQuestionData, AttentionDevelopmentData, ReadingFlowData, LetterDiscriminationData, RapidNamingData, PhonologicalAwarenessData, MirrorLettersData, SyllableTrainData, VisualTrackingLineData, BackwardSpellingData, ImageInterpretationTFData, HeartOfSkyData } from '../../types';
import { getRandomItems, shuffle, getRandomInt, TR_VOCAB, turkishAlphabet, COLORS, simpleSyllabify, getWordsForDifficulty, SHAPE_TYPES, VISUALLY_SIMILAR_CHARS, EMOJI_MAP } from './helpers';

// ... existing generators (generateOfflineAttentionFocus, generateOfflineCodeReading etc.) ...

// 13. Image Interpretation TF
export const generateOfflineImageInterpretationTF = async (options: GeneratorOptions): Promise<ImageInterpretationTFData[]> => {
    const { worksheetCount } = options;
    
    const scenarios = [
        {
            title: "Oyun Hamuru Zamanı",
            sceneDescription: "Üç çocuk masada oyun hamuru ile oynuyor.",
            imagePrompt: "Çocuklar Oyun Hamuru",
            items: [
                { text: "Çocuklar masada oturuyor.", isCorrect: true },
                { text: "Çocuklar oyun hamurları ile oynuyor.", isCorrect: true },
                { text: "Kız çocuk ortada oturuyor.", isCorrect: true },
            ]
        },
        {
            title: "Piknik Keyfi",
            sceneDescription: "İki kız çocuk piknik yapıyor.",
            imagePrompt: "Çocuklar Piknik",
            items: [
                { text: "Çocuklar piknik yapıyor.", isCorrect: true },
                { text: "Ayıcık pembe kıyafetli kızın elinde.", isCorrect: true },
                { text: "Kızlar piknikte ağlıyor.", isCorrect: false },
            ]
        }
    ];

    return Array.from({ length: worksheetCount }, (_, i) => {
        const scenario = scenarios[i % scenarios.length];
        return {
            title: "Resim Yorumlama (D-Y) (Hızlı Mod)",
            instruction: "Aşağıdaki cümleleri resme göre okuyup cevapla. Cümle Doğruysa (D) yanlışsa (Y) harfi koy.",
            pedagogicalNote: "Görsel algı, dikkat ve okuduğunu anlama becerisi.",
            imagePrompt: scenario.imagePrompt,
            sceneDescription: scenario.sceneDescription,
            items: scenario.items
        };
    });
};

// 14. Heart of Sky (Gökyüzünün Kalbi) - Offline
export const generateOfflineHeartOfSky = async (options: GeneratorOptions): Promise<HeartOfSkyData[]> => {
    const { worksheetCount } = options;
    const title = "Gökyüzünün Kalbi (Hızlı Mod)";
    const theme = "Masal ve Doğa";
    const note = "Okuduğunu anlama, görselleştirme ve duygusal zeka.";
    const instr = "Hikayeyi oku ve her sahneyi zihninde canlandır.";

    const scenes = [
        {
            title: "Minik Varki",
            text: "Kurbağa Varki, henüz minicikti. Yeni şeyler öğrenmeyi çok severdi. Rüzgârla oynayan sazlıklar ve serin sular, her biri ona dost gibi gelirdi. Sabah erkenden uyanır, balıklarla gölette yüzüp oynardı. Yorulunca yaprak üstüne kıvrılır, dinlenince de, 'Vırrakk!' diye suya atlardı.",
            visualDescription: "Mavi kurdeleli minik yeşil kurbağa Varki, suyun içinde neşeyle yüzüyor. Yanında gülen küçük balıklar var. Güneş ışığı suyun üzerinde parlıyor.",
            imagePrompt: "Frog Varki",
            question: "Varki sabahları ne yaparmış?"
        },
        {
            title: "Akşamın Dinginliği",
            text: "Günün eğlenceli koşuşturmasından akşamın dinginliğine geçiş başlamıştı. Ufukta güneşin son ışıklarıyla turuncu, pembe ve mor tonlar belirdi. Varki, küçük bir taşın ucuna oturdu. Gözleri dağın arkasına takılmıştı. Su 'Glop! Glup!' diye ses veriyordu.",
            visualDescription: "Gün batımı. Gökyüzü turuncu ve mor. Varki bir taşın üzerinde oturmuş, uzaklara bakıyor. Ortam sakin.",
            imagePrompt: "Sunset Frog",
            question: "Varki akşam olunca nereye oturdu?"
        },
        {
            title: "Büyük Nilüfer Yaprağı",
            text: "Varki, 'Şlaaaaaaap!' diye atlayarak göletin tam ortasındaki kocaman nilüfer yaprağına çıktı. Yaprağın kıvrımları ve damarları çok belirgindi. Varki, yaprağın kenarına doğru çekildi. Soruları kendisinden bile büyüktü.",
            visualDescription: "Büyük yeşil bir nilüfer yaprağı. Üzerinde minik Varki duruyor. Etrafında soru işaretleri uçuşuyor.",
            imagePrompt: "Lily Pad",
            question: "Varki nereye zıpladı?"
        },
        {
            title: "Bilge Nilüfer Çiçeği",
            text: "Varki cesurca seslendi: 'Vırrak! Bu ışığın ne olduğunu kime sorsak?'. O an beyaz bir nilüfer çiçeği eğildi, yaprağını büktü ve gülümsedi. 'İlk kez izleyeceksin galiba' dedi. Nilüfer çiçeği, göletin bilgesiydi.",
            visualDescription: "Büyük, beyaz ve parlak bir Nilüfer Çiçeği, Varki'ye doğru eğilmiş konuşuyor. Varki şaşkın ve heyecanlı.",
            imagePrompt: "Talking Flower",
            question: "Varki kiminle konuştu?"
        },
        {
            title: "Dolunay'ın Doğuşu",
            text: "Tüm gözler dağın arkasına çevrildi. Sazlıklar bile sustu. Dağın ardından önce bir ışık doğdu, sonra gümüş bir daire usulca gökyüzüne yükseldi. Gökyüzünün en değerli misafiri, Dolunay gelmişti!",
            visualDescription: "İki dağın arasından kocaman, parlak bir Dolunay yükseliyor. Gölet gümüş rengi parlıyor. Herkes aya bakıyor.",
            imagePrompt: "Full Moon Rising",
            question: "Dağın arkasından ne doğdu?"
        },
        {
            title: "Suyun Aynası",
            text: "Neşeli balık sudan sıçradı. 'Bakın! Gökyüzünde bir tane, suyun içinde bir tane!' dedi. Dolunay hem gökteydi hem de gölette. Sanki ikisi birden göz kırpmıştı izleyenlerine.",
            visualDescription: "Gökyüzünde Dolunay, suyun yüzeyinde ise yansıması var. Bir balık suyun dışına sıçramış.",
            imagePrompt: "Moon Reflection",
            question: "Balık neye şaşırdı?"
        },
        {
            title: "Kalpteki Işık",
            text: "Varki, 'Onu tutan ne iptir ne de çivi' dedi Nilüfer çiçeği. 'Onu tutan sevgidir'. Varki o gece gökyüzündeki ışığın, kendi minik kalbinde de parladığını hissetti. Rüzgar tatlı bir ninni fısıldarken, huzurla uykuya daldı.",
            visualDescription: "Varki yaprağın üzerinde uyuyor. Gökyüzündeki aydan Varki'nin kalbine doğru ince bir ışık huzmesi iniyor. Huzurlu bir gece.",
            imagePrompt: "Sleeping Frog",
            question: "Varki sonunda ne hissetti?"
        }
    ];

    return Array.from({ length: worksheetCount }, () => ({
        title,
        theme,
        instruction: instr,
        pedagogicalNote: note,
        imagePrompt: "Masal",
        scenes
    }));
};
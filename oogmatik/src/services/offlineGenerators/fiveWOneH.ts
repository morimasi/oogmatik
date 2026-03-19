
import { GeneratorOptions, FiveWOneHData } from '../../types';

export const generateOfflineFiveWOneH = async (options: GeneratorOptions): Promise<FiveWOneHData[]> => {
    const { worksheetCount, difficulty } = options;

    return Array.from({ length: worksheetCount }, () => ({
        id: '5n1k_' + Date.now(),
        activityType: 'FIVE_W_ONE_H' as any,
        title: "5N1K Okuma Anlama",
        instruction: "Metni oku ve soruları cevapla.",
        pedagogicalNote: "Okuduğunu anlama ve temel soruları yanıtlama.",
        content: {
            title: "Mavi Kuşun Yolculuğu",
            text: "Mavi kuş sabah erkenden ormanda uçmaya başladı. Çünkü arkadaşını çok özlemişti.",
            paragraphs: ["Mavi kuş sabah erkenden ormanda uçmaya başladı.", "Çünkü arkadaşını çok özlemişti."]
        },
        questions: [
            { id: "q1", type: "who", questionText: "Ormanda uçan kimdir?", answerType: "multiple_choice", options: ["Mavi Kuş", "Yeşil Kedi", "Kırmızı Köpek"], correctAnswer: "Mavi Kuş" },
            { id: "q2", type: "where", questionText: "Mavi kuş nerede uçuyor?", answerType: "open_ended", correctAnswer: "Ormanda" }
        ],
        settings: {
            difficulty: difficulty || 'Orta',
            questionStyle: 'test_and_open'
        }
    } as any));
};

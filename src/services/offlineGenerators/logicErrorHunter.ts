
import { GeneratorOptions, LogicErrorHunterData } from '../../types';
import { getRandomInt, shuffle } from './helpers';

export const generateOfflineLogicErrorHunter = async (options: GeneratorOptions): Promise<LogicErrorHunterData[]> => {
    const { worksheetCount, difficulty } = options;
    const stories = [
        {
            title: "Güneşli Bir Gece",
            text: "O gece hava çok güneşliydi. Ay bulutların arkasından parlıyordu. Kar yağıyordu ama herkes tişörtle dışarıda dondurma yiyordu.",
            errors: [
                { original: "gece hava çok güneşliydi", fixed: "gece hava çok aydınlıktı/yıldızlıydı", type: "physical", gravity: "high" },
                { original: "Kar yağıyordu ama herkes tişörtle", fixed: "Kar yağıyordu herkes kalın giyinmişti", type: "temporal", gravity: "medium" }
            ],
            absurdityDegree: "obvious"
        },
        {
            title: "Balıkların Uçuşu",
            text: "Deniz kıyısında yürürken havada uçan balıkları gördüm. Kediler suyun altında nefes alıyor, köpekler ise ağaçlarda şarkı söylüyordu.",
            errors: [
                { original: "havada uçan balıkları", fixed: "suda yüzen balıkları", type: "logical", gravity: "high" },
                { original: "Kediler suyun altında nefes alıyor", fixed: "Kediler karada koşuyor", type: "physical", gravity: "high" }
            ],
            absurdityDegree: "surreal"
        }
    ];

    return Array.from({ length: worksheetCount }, () => ({
        title: "Mantık Hatası Avcısı",
        instruction: "Aşağıdaki metinlerde bazı 'saçma' veya 'mantıksız' durumlar var. Bunları bul ve altını çiz.",
        stories: shuffle([...stories]).slice(0, 2) as any,
        settings: {
            difficulty: difficulty || 'Orta',
            absurdityDegree: 'obvious',
            errorCount: 2
        }
    } as any));
};

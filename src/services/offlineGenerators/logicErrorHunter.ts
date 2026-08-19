import { GeneratorOptions, LogicErrorHunterData } from '../../types';
import { shuffle } from './helpers';

interface ErrorTemplate {
  id: string;
  faultyWordOrPhrase: string;
  correction: string;
  explanation: string;
}

interface StoryTemplate {
  title: string;
  story: string;
  errors: ErrorTemplate[];
  absurdityDegree: 'minimal' | 'obvious' | 'surreal';
}

const STORY_POOL: StoryTemplate[] = [
  {
    title: "Güneşli Bir Gece",
    story: "O gece hava çok güneşliydi. Gökyüzünde yıldızlar parlıyor, ay ışığı denizi aydınlatıyordu. Aniden kar yağmaya başladı ve herkes tişörtle dışarıda dondurma yiyordu. Bazı çocuklar kardan adam yaparken denizde yüzen insanlar da görülüyordu.",
    errors: [
      { id: 'err_1', faultyWordOrPhrase: "gece hava çok güneşliydi", correction: "gece hava çok aydınlıktı / yıldızlıydı", explanation: "Güneş geceleri değil gündüzleri parlar." },
      { id: 'err_2', faultyWordOrPhrase: "herkes tişörtle dışarıda dondurma yiyordu", correction: "herkes kalın kıyafetlerle dışarıdaydı", explanation: "Kar yağarken hava soğuktur, tişört ve dondurma uygun değildir." }
    ],
    absurdityDegree: "obvious"
  },
  {
    title: "Balıkların Uçuşu",
    story: "Deniz kıyısında yürürken havada uçan balıkları gördüm. Kediler suyun altında nefes alıyor, köpekler ise ağaçlarda şarkı söylüyordu. Bir martı ise yerde koşarak gazete okuyordu.",
    errors: [
      { id: 'err_3', faultyWordOrPhrase: "havada uçan balıkları", correction: "suda yüzen balıkları", explanation: "Balıklar uçamaz, yüzerler." },
      { id: 'err_4', faultyWordOrPhrase: "kediler suyun altında nefes alıyor", correction: "kediler karada koşuyor", explanation: "Kediler su altında nefes alamaz." },
      { id: 'err_5', faultyWordOrPhrase: "martı yerde koşarak gazete okuyordu", correction: "martı gökyüzünde süzülüyordu", explanation: "Martılar uçar, gazete okuyamazlar." }
    ],
    absurdityDegree: "surreal"
  },
  {
    title: "Yazın Kış Tatili",
    story: "Haziran ayında okullar kapanınca ailem kış tatiline çıktı. Kalın montlarımızı alıp kumsalda güneşlenerek kardan adam yaptık. Deniz o kadar soğuktu ki herkes sıcak çayla yüzdü.",
    errors: [
      { id: 'err_6', faultyWordOrPhrase: "Haziran ayında kış tatiline çıktı", correction: "Haziran ayında yaz tatiline çıktı", explanation: "Kış tatili kış aylarında, Haziran ise yaz ayıdır." },
      { id: 'err_7', faultyWordOrPhrase: "kumsalda güneşlenerek kardan adam yaptık", correction: "kumsalda güneşlenerek kumdan kale yaptık", explanation: "Kumsalda kar değil kum vardır." },
      { id: 'err_8', faultyWordOrPhrase: "herkes sıcak çayla yüzdü", correction: "herkes denizde yüzdü", explanation: "Çay içilir, yüzmek denizde yapılır." }
    ],
    absurdityDegree: "obvious"
  },
  {
    title: "Akıllı Balta",
    story: "Köyde oduncu baltasıyla ağaç kesmek yerine ağaca soru soruyordu. Ağaç her soruya cevap verip dallarıyla hesap yapıyordu. Oduncu, baltayı dinlendirmek için her akşam balta ninnisi söylüyordu.",
    errors: [
      { id: 'err_9', faultyWordOrPhrase: "ağaç her soruya cevap verip hesap yapıyordu", correction: "ağaç rüzgarda sallanıyordu", explanation: "Ağaçlar konuşamaz ve hesap yapamaz." },
      { id: 'err_10', faultyWordOrPhrase: "balta ninnisi söylüyordu", correction: "uyumadan önce dinleniyordu", explanation: "Balta canlı değildir, ninni söylemek gerekmez." }
    ],
    absurdityDegree: "minimal"
  }
];

const DIFFICULTY_MAP: Record<string, 'çok kolay' | 'kolay' | 'orta' | 'zor'> = {
  '1-2': 'çok kolay',
  'çok kolay': 'çok kolay',
  '3-4': 'kolay',
  'kolay': 'kolay',
  '5-6': 'orta',
  'Orta': 'orta',
  'orta': 'orta',
  '7-8': 'zor',
  'Zor': 'zor',
  'zor': 'zor'
};

export const generateOfflineLogicErrorHunter = async (options: GeneratorOptions): Promise<LogicErrorHunterData[]> => {
    const { worksheetCount } = options;
    const opts = options as Record<string, unknown>;
    const difficulty = (DIFFICULTY_MAP[options.difficulty || 'Orta'] || 'orta') as 'çok kolay' | 'kolay' | 'orta' | 'zor';
    const absurdityDegree = (opts.absurdityDegree as 'minimal' | 'obvious' | 'surreal') || 'obvious';
    const errorCount = (opts.errorCount as number) || 2;

    const count = worksheetCount ?? 1;
    const templates = STORY_POOL.filter((t) => t.absurdityDegree === absurdityDegree);
    const pool = templates.length > 0 ? templates : STORY_POOL;

    return Array.from({ length: count }, (_, index) => {
        const template = pool[index % pool.length];
        const selectedErrors = shuffle([...template.errors]).slice(0, errorCount);

        return {
            id: `logic_error_hunter_offline_${Date.now()}_${index}`,
            activityType: 'LOGIC_ERROR_HUNTER',
            title: template.title,
            instruction: "Aşağıdaki metinlerde bazı 'saçma' veya 'mantıksız' durumlar var. Bunları bul, altını çiz ve doğrusunu yaz.",
            settings: {
                difficulty,
                absurdityDegree,
                errorCount: selectedErrors.length
            },
            content: {
                title: template.title,
                story: template.story,
                errors: selectedErrors
            }
        };
    });
};
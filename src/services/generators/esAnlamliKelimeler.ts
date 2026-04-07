import { generateCreativeMultimodal } from '../geminiClient';
import { ActivityType, GeneratorOptions, WorksheetData } from '../../types';
import { BaseGenerator } from './core/BaseGenerator';

export class EsAnlamliKelimelerGenerator extends BaseGenerator<WorksheetData> {
  constructor() {
    super();
  }

  protected async execute(options: GeneratorOptions): Promise<WorksheetData> {
    const opts = options as Record<string, unknown>;
    const wordCount = (opts.wordCount as number) || options.itemCount || 6;
    const difficulty = options.difficulty || 'Orta';
    const topic = (opts.topic as string) || (options.topic as string) || '';
    const includeAntonyms = (opts.includeAntonyms ?? true) as boolean;
    const includeEtymology = (opts.includeEtymology ?? false) as boolean;

    const difficultyGuide =
      difficulty === 'Kolay'
        ? 'Günlük hayatta sık kullanılan, somut anlamı olan basit kelimeler (mutlu, büyük, hızlı vb.)'
        : difficulty === 'Orta'
          ? 'Ders kitaplarında geçen, orta düzey kelimeler (sevinç, devasa, çevik vb.)'
          : 'Edebi metinlerde ve akademik dilde kullanılan gelişmiş kelimeler (neşe, muazzam, süratli vb.)';

    const topicLine = topic
      ? `- Konu/Tema: ${topic} alanıyla ilgili kelimeler tercih edilmeli`
      : '';

    const prompt = `Sen Türkçe kelime bilgisi uzmanı bir eğitmensin. ${wordCount} farklı Türkçe kelime için eş anlamlılar ve bağlamlı kullanım etkinliği üret.

PARAMETRELER:
- Kelime Sayısı: ${wordCount}
- Zorluk: ${difficulty}
- Kılavuz: ${difficultyGuide}
${topicLine}
- Zıt Anlam: ${includeAntonyms ? 'Her kelime için zıt anlam ekle' : 'Zıt anlam ekleme'}
- Etimoloji: ${includeEtymology ? 'Kısa köken/anlam notu ekle' : 'Etimoloji ekleme'}

ZORUNLU JSON ÇIKTISI:
{
  "id": "eak_uuid",
  "activityType": "ES_ANLAMLI_KELIMELER",
  "title": "Eş Anlamlı Kelimeler Etkinliği",
  "instruction": "Her kelimenin eş anlamlılarını incele ve boşluklu cümleyi doğru kelime ile tamamla.",
  "pedagogicalNote": "Bu etkinlik öğrencinin söz varlığını genişletir, bağlam ipuçlarını kullanarak doğru kelime seçme becerisini geliştirir. Türkçede anlamdaş kelimelerin kullanım bağlamlarını ayırt etme hedeflenir.",
  "items": [
    {
      "id": "item_1",
      "sourceWord": "MUTLU",
      "synonyms": ["Sevinçli", "Neşeli", "Memnun"],
      "antonym": "Üzgün",
      "exampleSentence": "Sınav sonuçlarını görünce çok _______ oldu.",
      "correctAnswer": "mutlu",
      "emoji": "😊",
      "etymologyNote": "Arapça 'mutlak' kökünden gelir; özgür ve serbest anlamı taşır.",
      "usageContext": "Günlük"
    }
  ]
}

KURALLAR:
1. Her kelimede en az 2, en fazla 4 eş anlamlı
2. exampleSentence'te _______ yerine sourceWord veya eş anlamlısı kullanılabilmeli
3. correctAnswer lowercase, sourceWord uppercase
4. emoji kelimeyi görsel olarak temsil etmeli
5. Tüm metinler Türkçe
6. Kelimeler birbirinden farklı anlam alanlarından seçilmeli`;

    const parsedData = await generateCreativeMultimodal({ prompt, temperature: 0.65 });

    return {
      ...parsedData,
      id: (parsedData as Record<string, unknown>).id || crypto.randomUUID(),
      activityType: ActivityType.ES_ANLAMLI_KELIMELER,
    } as unknown as WorksheetData;
  }
}


import { generateWithSchema } from '../geminiClient.js';
import { GeneratorOptions, HiddenPasswordGridData, WordSearchData } from '../../types.js';
import { PEDAGOGICAL_BASE, CLINICAL_DIAGNOSTIC_GUIDE } from './prompts.js';

const PEDAGOGICAL_PROMPT = `
[ROL: KIDEMLİ EĞİTİM MATERYALİ TASARIMCISI]
Görevin: Disleksik çocuklar için dikkat ve görsel tarama becerilerini geliştiren materyaller üretmek.
Yönergeler kısa, net ve teşvik edici olmalıdır.
Sadece JSON döndür.
`;

export const generateHiddenPasswordGridFromAI = async (options: GeneratorOptions): Promise<HiddenPasswordGridData[]> => {
    const { topic, difficulty, worksheetCount, gridSize = 5, itemCount = 9, case: letterCase } = options;

    const prompt = `
    "Gizli Şifre Matrisi" (Letter Cancellation) etkinliği üret. 
    Konu: ${topic || 'Karışık'}. Zorluk: ${difficulty}.
    
    PARAMETRELER:
    - Sayfa başı blok sayısı: ${itemCount}
    - Matris boyutu: ${gridSize}x${gridSize}
    - Harf Tipi: ${letterCase === 'upper' ? 'SADECE BÜYÜK HARFLER' : 'SADECE KÜÇÜK HARFLER'}
    
    KURALLAR:
    1. Her blok için bir 'targetLetter' (çeldirici harf) seç. Bu harf gizli kelime içinde ASLA geçmemeli.
    2. Gizli kelimeler 3-7 harf arasında olmalı.
    3. Matrisi 'targetLetter' ile doldur, aralara gizli kelimenin harflerini soldan sağa akacak şekilde serpiştir.
    
    ${PEDAGOGICAL_PROMPT}
    ${worksheetCount} adet çalışma sayfası üret.
    `;

    const schema = {
        type: 'ARRAY',
        items: {
            type: 'OBJECT',
            properties: {
                title: { type: 'STRING' },
                instruction: { type: 'STRING' },
                settings: {
                    type: 'OBJECT',
                    properties: {
                        gridSize: { type: 'NUMBER' },
                        itemCount: { type: 'NUMBER' },
                        cellStyle: { type: 'STRING' },
                        letterCase: { type: 'STRING' }
                    }
                },
                grids: {
                    type: 'ARRAY',
                    items: {
                        type: 'OBJECT',
                        properties: {
                            targetLetter: { type: 'STRING' },
                            hiddenWord: { type: 'STRING' },
                            grid: { type: 'ARRAY', items: { type: 'ARRAY', items: { type: 'STRING' } } }
                        },
                        required: ['targetLetter', 'hiddenWord', 'grid']
                    }
                }
            },
            required: ['title', 'instruction', 'grids']
        }
    };

    const rawResult = await generateWithSchema(prompt, schema);
    
    // Güvenli dizi dönüşümü
    let result: any[] = [];
    if (Array.isArray(rawResult)) {
        result = rawResult;
    } else if (rawResult && typeof rawResult === 'object') {
        const potential = (rawResult as any).items || (rawResult as any).data || (rawResult as any).grids;
        result = Array.isArray(potential) ? potential : [rawResult];
    }

    return result.filter(p => p && typeof p === 'object').map((page: any) => ({
        title: (page.title as string) ?? 'Gizli Şifre Matrisi',
        instruction: (page.instruction as string) ?? 'Şifreyi bulmak için harfleri takip et.',
        grids: Array.isArray(page.grids) ? page.grids : [],
        settings: {
            gridSize,
            itemCount,
            cellStyle: options.variant || 'square',
            letterCase: letterCase || 'upper'
        }
    }));
};

export const generateWordSearchFromAI = async (
  options: GeneratorOptions
): Promise<WordSearchData[]> => {
  const difficulty = options.difficulty || 'Orta';
  const topic = options.topic || 'Karışık';
  const gridRows = options.gridRows || options.gridSize || 12;
  const gridCols = options.gridCols || options.gridSize || 12;
  const itemCount = options.itemCount || 10;
  const letterCase = options.case || 'upper';
  const worksheetCount = options.worksheetCount || 1;

  const prompt = `
    ${PEDAGOGICAL_BASE}
    ${CLINICAL_DIAGNOSTIC_GUIDE}
    
    GÖREV: [DİSLEKSİ DOSTU KELİME BULMACA / KELİME AVI]
    
    PARAMETRELER:
    - Izgara Boyutu: KESİNLİKLE ${gridRows} satır x ${gridCols} sütun olmalıdır.
    - Konu/Tema: ${topic}
    - Gizlenecek Kelime Sayısı: ${itemCount} adet kelime
    - Harf Durumu: ${letterCase === 'upper' ? 'BÜYÜK HARFLER' : 'küçük harfler'}
    - Zorluk Seviyesi: ${difficulty}
    
    KURALLAR:
    1. Harf matrisi (grid) KESİNLİKLE tam olarak ${gridRows} satır ve ${gridCols} sütundan oluşmalıdır.
    2. Grid içine tam olarak ${itemCount} adet tema ile uyumlu Türkçe kelime yerleştirilmelidir.
    3. Geri kalan tüm boş hücreler rastgele harflerle (çeldiricilerle) doldurulmalıdır.
    4. [KRİTİK]: Tüm gizlenen kelimeler %100 TÜRKÇE olmalıdır. İngilizce veya yabancı dilde kelime KESİNLİKLE kullanma.
    5. Harf Durumu: Harfler ${letterCase === 'upper' ? 'BÜYÜK' : 'küçük'} olmalıdır.
    6. settings altındaki gridSize ${gridRows} olmalıdır.
    
    ${worksheetCount} adet çalışma sayfası üret.
    `;

  const singleSchema = {
    type: 'OBJECT',
    properties: {
      title: { type: 'STRING', description: 'Etkinlik başlığı' },
      instruction: { type: 'STRING', description: 'Öğrenciye yönelik yönerge' },
      settings: {
        type: 'OBJECT',
        properties: {
          difficulty: { type: 'STRING' },
          layout: { type: 'STRING' },
          gridRows: { type: 'INTEGER' },
          gridCols: { type: 'INTEGER' },
          showClinicalNotes: { type: 'BOOLEAN' },
          isProfessionalMode: { type: 'BOOLEAN' }
        }
      },
      grid: {
        type: 'ARRAY',
        description: '2D Harf Matrisi',
        items: {
          type: 'ARRAY',
          items: { type: 'STRING' }
        }
      },
      words: {
        type: 'ARRAY',
        description: 'Gizlenen kelimelerin listesi',
        items: { type: 'STRING' }
      },
      clinicalMeta: {
        type: 'OBJECT',
        properties: {
          intersections: { type: 'INTEGER', description: 'Kesişen kelime sayısı' },
          reversals: { type: 'INTEGER', description: 'Ters yerleştirilen kelime sayısı' },
          density: { type: 'NUMBER', description: 'Yoğunluk katsayısı' }
        }
      }
    },
    required: ['title', 'instruction', 'grid', 'words']
  };

  const schema = { type: 'ARRAY', items: singleSchema };
  const rawResult = await generateWithSchema(prompt, schema);
  
  const arrayResult = Array.isArray(rawResult) ? rawResult : [rawResult];
  
  return arrayResult.map((item: any) => ({
    id: 'word_search_ai',
    activityType: 'WORD_SEARCH',
    title: item.title || 'Kelime Bulmaca',
    instruction: item.instruction || 'Gizlenen kelimeleri bulun.',
    settings: {
      difficulty: difficulty === 'Zor' ? 'expert' : difficulty === 'Orta' ? 'intermediate' : 'beginner',
      layout: gridRows >= 15 ? 'ultra_dense' : 'classic',
      gridSize: gridRows,
      directions: ['horizontal', 'vertical'],
      showClinicalNotes: true,
      isProfessionalMode: true
    },
    grid: item.grid || [],
    words: item.words || [],
    clinicalMeta: item.clinicalMeta || { intersections: 2, reversals: 0, density: 0.3 }
  })) as any[];
};

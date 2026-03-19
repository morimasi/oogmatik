
import { generateWithSchema } from '../geminiClient.js';
import { GeneratorOptions, AlgorithmData } from '../../types.js';

export const generateAlgorithmGeneratorFromAI = async (options: GeneratorOptions): Promise<AlgorithmData[]> => {
    const { topic, difficulty, studentContext } = options;

    const prompt = `
    [ROL: ÜST DÜZEY YAZILIM MİMARI VE PEDAGOJİK ANALİST]
    GÖREV: Gelen girdideki eğitsel materyali, disleksi dostu bir "Problem Çözme Algoritmasına" dönüştür.
    
    GİRDİ (KONU VEYA BLUEPRINT): "${topic}"
    ZORLUK SEVİYESİ: ${difficulty}
    
    ÜRETİM KURALLARI:
    1. Eğer girdi bir "Futoshiki" veya "Sayı Kulesi" ise; algoritma bu bulmacanın nasıl çözüleceğini (büyük-küçük işaretleri, satır kontrolü vb.) adım adım anlatmalıdır.
    2. 'challenge' alanına bulmacanın ana zorluğunu yaz.
    3. 'steps' dizisi KESİNLİKLE boş kalmamalıdır. En az 5, en fazla 8 adım oluştur.
    4. Her adım 'type' özelliğine uygun olmalıdır (start, process, decision, input, output, end).
    5. 'decision' adımı "Eğer ... ise" yapısında bir mantıksal kontrol içermelidir.
    
    PEDAGOJİK DİL:
    - Yönergeler "Yap, Kontrol et, Yerleştir" gibi net emir kipleriyle yazılmalıdır.
    - Disleksi/Diskalkuli profiline uygun olarak sayısal ifadeler somutlaştırılmalıdır.
    
    ÇIKTI: Sadece JSON döndür.
    `;

    const schema = {
        type: 'ARRAY',
        items: {
            type: 'OBJECT',
            properties: {
                title: { type: 'STRING' },
                instruction: { type: 'STRING' },
                pedagogicalNote: { type: 'STRING' },
                challenge: { type: 'STRING', description: "Algoritmanın çözdüğü temel problem/senaryo" },
                steps: {
                    type: 'ARRAY',
                    minItems: 5,
                    items: {
                        type: 'OBJECT',
                        properties: {
                            id: { type: 'INTEGER' },
                            type: { type: 'STRING', enum: ['start', 'process', 'decision', 'input', 'output', 'end'] },
                            text: { type: 'STRING', description: "Adımın eylem cümlesi" }
                        },
                        required: ['id', 'type', 'text']
                    }
                }
            },
            required: ['title', 'steps', 'challenge', 'instruction']
        }
    };

    // Algoritma üretimi yüksek mantıksal derinlik gerektirdiği için model zorlanabilir.
    // Bu yüzden Gemini 3 modelini ve düşünme bütçesini zorunlu kılıyoruz.
    // Fix: Removed the third argument 'gemini-3-flash-preview' as generateWithSchema only expects two arguments
    return await generateWithSchema(prompt, schema);
};

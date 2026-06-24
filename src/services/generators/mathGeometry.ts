
import { generateWithSchema } from '../geminiClient.js';
import { GeneratorOptions, ShapeCountingData } from '../../types.js';
import { PEDAGOGICAL_BASE, CLINICAL_DIAGNOSTIC_GUIDE, SHAPE_COUNTING_CORE_GUIDE } from './prompts.js';

export const generateShapeCountingFromAI = async (options: GeneratorOptions): Promise<ShapeCountingData[]> => {
    const {
        difficulty,
        itemCount = 40,
        targetShape = 'triangle',
        variant = 'mixed',
        overlapping = true,
        aestheticMode = 'glassmorphism',
        layout = 'single'
    } = options as Record<string, unknown>;

    const prompt = `
    ${PEDAGOGICAL_BASE}
    ${CLINICAL_DIAGNOSTIC_GUIDE}
    ${SHAPE_COUNTING_CORE_GUIDE}
    
    GÖREV: [ULTRA-PROFESYONEL GÖRSEL TARAMA & FİGÜR-ZEMİN ALGISI TESTİ]
    
    PARAMETRELER:
    - Hedef Şekil: ${targetShape} (Öğrenci bu şekli sayacak).
    - Toplam Nesne Sayısı: ${itemCount} (KESİNLİKLE tam olarak bu sayıda nesne üret).
    - Yerleşim Stili: ${variant === 'mixed' ? 'Kaotik (Chaotic)' : 'Düzenli Izgara (Grid)'}.
    - Üst Üste Binme (Overlapping): ${overlapping ? 'EVET (Maksimum seviyede iç içe geçsinler)' : 'HAYIR'}.
    - Zorluk Seviyesi: ${difficulty}.
    
    STRATEJİ:
    1. [YOĞUNLUK]: Sayfayı TAMAMEN şekillerle doldur. Nesneler birbirine çok yakın ve iç içe (overlapping) olmalıdır.
    2. [HEDEF ADEDİ]: Toplam ${itemCount} nesne içinde tam olarak ${Math.ceil(itemCount * 0.3)} adet "${targetShape}" üret.
    3. [ÇELDİRİCİLER]: Diğer nesneleri (circle, square, star, hexagon, pentagon, diamond) hedef şekle çok yakın boyut ve renklerde seçerek ayırt etmeyi zorlaştır.
    4. Koordinatlar (0-100) arasında rastgele ama yoğun kümeler oluşturacak şekilde dağıtılmalıdır. Sayfanın en az %95'i kapsanmalıdır.
    5. Birbirinden farklı rotasyon (0-360) ve boyut varyasyonları ekle.
    
    ÇIKTI BİLGİSİ:
    - correctCount: Hedef şeklin tam adedi.
    - searchField: Nesne listesi (x, y, type, color, rotation, size).
    `;

    const schema = {
        type: 'ARRAY',
        items: {
            type: 'OBJECT',
            properties: {
                title: { type: 'STRING', description: 'Etkinlik başlığı' },
                instruction: { type: 'STRING', description: 'Öğrenciye yönelik yönerge' },
                pedagogicalNote: { type: 'STRING', description: 'Öğretmen için pedagojik not' },
                correctCount: { type: 'INTEGER', description: 'Hedef şeklin doğru sayısı' },
                settings: {
                    type: 'OBJECT', description: 'Etkinlik ayarları',
                    properties: {
                        difficulty: { type: 'STRING', description: 'Zorluk seviyesi' },
                        itemCount: { type: 'NUMBER', description: 'Toplam nesne sayısı' },
                        targetShape: { type: 'STRING', description: 'Hedef şekil türü' },
                        layout: { type: 'STRING', description: 'Sayfa düzeni' },
                        overlapping: { type: 'BOOLEAN', description: 'Üst üste binme durumu' },
                        aestheticMode: { type: 'STRING', description: 'Estetik stil' }
                    }
                },
                searchField: {
                    type: 'ARRAY', description: 'Nesne listesi',
                    items: {
                        type: 'OBJECT',
                        properties: {
                            id: { type: 'STRING', description: 'Nesne kimliği' },
                            type: { type: 'STRING', description: 'Şekil türü' },
                            color: { type: 'STRING', description: 'Renk kodu (hex)' },
                            rotation: { type: 'NUMBER', description: 'Dönüş açısı (0-360)' },
                            size: { type: 'NUMBER', description: 'Boyut katsayısı (0.5-1.2)' },
                            x: { type: 'NUMBER', description: 'Yatay konum (0-100)' },
                            y: { type: 'NUMBER', description: 'Dikey konum (0-100)' }
                        },
                        required: ['type', 'color', 'x', 'y']
                    }
                },
                clinicalMeta: {
                    type: 'OBJECT', description: 'Klinik meta veriler',
                    properties: {
                        figureGroundComplexity: { type: 'NUMBER', description: 'Figür-zemin karmaşıklığı (1-10)' },
                        overlappingRatio: { type: 'NUMBER', description: 'Üst üste binme oranı (0-1)' }
                    }
                }
            },
            required: ['title', 'instruction', 'searchField', 'correctCount']
        }
    };

    const rawResult = await generateWithSchema(prompt, schema);
    let results: any[] = Array.isArray(rawResult) ? rawResult : ((rawResult as any)?.items || (rawResult as any)?.data || [rawResult]);
    if (!Array.isArray(results)) results = [results];
    
    // Normalize: Ensure targetShape parameter is used (override AI response if needed)
    return results.filter(item => item && typeof item === 'object').map((item: any) => ({
        ...item,
        settings: {
            ...item.settings,
            difficulty: item.settings?.difficulty || difficulty,
            itemCount: item.settings?.itemCount || itemCount,
            targetShape: targetShape, // ALWAYS use input parameter value
            layout: item.settings?.layout || layout,
            overlapping: item.settings?.overlapping !== undefined ? item.settings.overlapping : overlapping,
            aestheticMode: item.settings?.aestheticMode || aestheticMode
        }
    }));
};

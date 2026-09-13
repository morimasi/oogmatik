
import { generateWithSchema } from '../geminiClient.js';
import { GeneratorOptions, AlgorithmData } from '../../types.js';

// Kategori bazlı ek yönergeler
const CATEGORY_HINTS: Record<string, string> = {
    günlük_yaşam: 'Günlük rutinlerden (yemek pişirme, temizlik, alışveriş) somut bir senaryo seç. Öğrencinin tanıdığı nesneler kullan.',
    matematik: 'Bir matematik işlem algoritması seç (EBOB, bölme, ondalık). Sayısal değerleri somutlaştır.',
    fen: 'Bir fen olayını (fotosentez, su döngüsü, sindirim) basamaklara böl. Gözlemlenebilir çıktılar ekle.',
    sosyal: 'Bir sosyal beceri senaryosu seç (arkadaşlık kurma, çatışma çözme). Diyalog ipuçları kullan.',
    teknoloji: 'Bir teknoloji sürecini (dosya kaydetme, arama yapma) adımlarına böl. Ekran komutlarını basit dille anlat.',
};

const ALGO_TYPE_RULES: Record<string, string> = {
    lineer: "Adımlar yalnızca düz bir sırayla akmalıdır. 'decision' adım sayısı en fazla 1 olabilir.",
    'dallanmalı': "En az 2 'decision' adımı olmalıdır. Her kararın 'yesPath' ve 'noPath' etiketleri zorunludur.",
    döngüsel: "En az 1 'loop' adımı olmalıdır. Döngünün bitiş koşulunu 'decision' adımıyla göster.",
    paralel: "En az 1 'parallel' adımı olmalıdır. Bu adım eş zamanlı iki işlemi listeler.",
};

export const generateAlgorithmGeneratorFromAI = async (options: GeneratorOptions): Promise<AlgorithmData[]> => {
    const {
        topic,
        difficulty,
        category = 'günlük_yaşam',
        algorithmType = 'lineer',
        stepCount = 6,
        showHints = true,
        showTime = false,
        showSubSteps = false,
        ageGroup = '8-10',
        worksheetCount = 1,
        colorTheme = 'varsayılan',
    } = options as Record<string, unknown>;

    const catHint = CATEGORY_HINTS[(category as string)] || '';
    const typeRule = ALGO_TYPE_RULES[(algorithmType as string)] || '';

    const hintRule = showHints
        ? "Her 'process' ve 'decision' adımına kısa, disleksi dostu bir 'hint' ekle (max 15 kelime)."
        : "Hiçbir adıma 'hint' ekleme.";

    const timeRule = showTime
        ? "Her adıma gerçekçi 'timeEstimate' (dakika, 1-5 arası) ekle."
        : "Hiçbir adıma 'timeEstimate' ekleme.";

    const subStepRule = showSubSteps
        ? "Her 'process' adımına 2-3 maddelik 'subSteps' dizisi ekle. Her madde emir cümlesinde olsun."
        : "Hiçbir adıma 'subSteps' ekleme.";

    const prompt = `
[ROL: ÜST DÜZEY PEDAGOJİK YAZILIM MİMARI — bdmind EdTech Platformu]

GÖREV:
"${topic || 'Günlük yaşamdan bir senaryo'}" konusunu temel alan, ${worksheetCount} adet bağımsız algoritma üret.

━━━ ÜRETİM PARAMETRELERİ ━━━
• Konu Kategorisi : ${category} → ${catHint}
• Algoritma Tipi  : ${algorithmType} → ${typeRule}
• Zorluk          : ${difficulty}
• Yaş Grubu       : ${ageGroup}
• İstenen Adım    : ${stepCount}
• Tema            : ${colorTheme}

━━━ İÇERİK KURALLARI ━━━
1. 'steps' dizisi ${stepCount} elemanlı OLMALIDIR — her biri benzersiz ve pedagojik.
2. İlk adım her zaman type:'start', son adım her zaman type:'end' olmalıdır.
3. ${hintRule}
4. ${timeRule}
5. ${subStepRule}
6. 'decision' adımları "Eğer … ise" yapısında soru cümlesi içersin; 'yesPath' ve 'noPath' etiketleri zorunlu.
7. 'loop' adımları döngünün kaç kez tekrarlayabileceğini belirtsin.
8. 'parallel' adımları eş zamanlı iki işlemi subSteps olarak göstersin.
9. 'challenge' alanı 1-2 cümle, öğrenciye "sen olsaydın ne yapardın?" tarzında yazılsın.
10. 'progressCheckpoints': adım numaralarından oluşan kontrol noktaları listesi (3 nokta olsun).
11. 'totalEstimatedTime': tüm adımların timeEstimate toplamı (showTime=false ise 0 gir).
12. 'legendItems': kullanılan step type'larına göre efsane kutusu (label, color, shape).
13. 'pedagogicalNote': öğretmene aktivitenin disleksi/DEHB destekli pedagojik amacını açıkla.

━━━ DİL KURALLARI ━━━
- Yönergeler emir kipiyle: "Kontrol et", "Yerleştir", "Karar ver"
- ${ageGroup} yaş grubu için uygun kelime karmaşıklığı
- Tanı koyucu dil YASAK ("disleksik" değil, "okuma desteğine ihtiyaç duyan")

ÇIKTI: SADECE geçerli JSON dizisi döndür, markdown veya açıklama YASAK.
    `;

    const schema = {
        type: 'ARRAY',
        items: {
            type: 'OBJECT',
            properties: {
                pedagogicalNote: {
                    type: 'STRING',
                    description: 'Öğretmene aktivitenin disleksi/DEHB destekli pedagojik amacını açıkla',
                },
                title: { type: 'STRING', description: 'Algoritma başlığı (max 8 kelime)' },
                instruction: { type: 'STRING', description: 'Öğrenci yönergesi (net, emir kipleriyle)' },
                challenge: { type: 'STRING', description: 'Algoritmanın çözdüğü temel problem senaryosu' },
                algorithmType: {
                    type: 'STRING',
                    enum: ['lineer', 'dallanmalı', 'döngüsel', 'paralel'],
                    description: 'Algoritma yapısının türü',
                },
                category: {
                    type: 'STRING',
                    enum: ['günlük_yaşam', 'matematik', 'fen', 'sosyal', 'teknoloji'],
                    description: 'Konu kategorisi',
                },
                totalEstimatedTime: {
                    type: 'NUMBER',
                    description: 'Toplam tahmini süre (dakika); showTime=false ise 0',
                },
                progressCheckpoints: {
                    type: 'ARRAY',
                    description: 'Kontrol noktası adım numaraları (3 adet)',
                    items: { type: 'STRING' },
                },
                legendItems: {
                    type: 'ARRAY',
                    description: 'Efsane kutusu öğeleri',
                    items: {
                        type: 'OBJECT',
                        properties: {
                            type:  { type: 'STRING', description: 'Step tipi' },
                            label: { type: 'STRING', description: 'Türkçe etiket' },
                            color: { type: 'STRING', description: 'Tailwind renk ismi (örn: emerald, amber)' },
                            shape: { type: 'STRING', description: 'Şekil (oval, rect, diamond, parallelogram)' },
                        },
                        required: ['type', 'label', 'color', 'shape'],
                    },
                },
                colorTheme: { type: 'STRING', description: 'Seçilen renk teması' },
                steps: {
                    type: 'ARRAY',
                    description: 'Algoritma adım dizisi',
                    items: {
                        type: 'OBJECT',
                        properties: {
                            id:            { type: 'INTEGER', description: 'Adım sıra numarası (1den başlar)' },
                            type: {
                                type: 'STRING',
                                enum: ['start', 'process', 'decision', 'input', 'output', 'end', 'loop', 'parallel'],
                                description: 'Adım türü',
                            },
                            text:          { type: 'STRING',  description: 'Adımın eylem cümlesi (emir kipleriyle)' },
                            hint:          { type: 'STRING',  description: 'İpucu balonu metni (max 15 kelime)' },
                            timeEstimate:  { type: 'NUMBER',  description: 'Tahmini süre (dakika, 1-5 arası)' },
                            yesPath:       { type: 'STRING',  description: 'Karar→EVET yolu etiketi' },
                            noPath:        { type: 'STRING',  description: 'Karar→HAYIR yolu etiketi' },
                            cognitiveLoad: {
                                type: 'STRING',
                                enum: ['low', 'medium', 'high'],
                                description: 'Bilişsel yük seviyesi',
                            },
                            subSteps: {
                                type: 'ARRAY',
                                description: 'Alt adım listesi (max 3)',
                                items: { type: 'STRING' },
                            },
                        },
                        required: ['id', 'type', 'text'],
                    },
                },
            },
            required: ['pedagogicalNote', 'title', 'instruction', 'challenge', 'steps'],
        },
    };

    return (await generateWithSchema(prompt, schema)) as unknown as AlgorithmData[];
};

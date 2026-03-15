import { Objective } from '../../core/types';
import { getFormatById } from '../activity-formats/registry';

// Seçilen Müfredata, Formata ve Formata Özel Ayarlara Göre Dinamik İçerik Üretir
// Faz 8: Artık registry'deki formatın kendi fastGenerate() veya buildAiPrompt() fonksiyonunu çağırıyor
export const generateDynamicMockData = (
    type: string,
    grade: number | null,
    objective: Objective | null,
    engineMode: 'ai' | 'fast',
    difficulty: string,
    formatSettings?: Record<string, any>  // Formata özel ultra ince ayarlar
) => {
    const topic = objective ? objective.title : `Genel ${grade || ''}. Sınıf Tekrarı`;
    const difficultyLabel = difficulty.toUpperCase();
    const isAi = engineMode === 'ai';

    // === ADIM 1: Registry'de tanımlı format var mı? ===
    const formatDef = getFormatById(type);
    if (formatDef) {
        // Defaults'dan ayarları birleştir + kullanıcının değiştirdiği ayarları override et
        const defaults: Record<string, any> = {};
        formatDef.settings.forEach(s => { defaults[s.key] = s.defaultValue; });
        const mergedSettings = { ...defaults, ...(formatSettings || {}) };

        if (isAi) {
            // AI Motor: Prompt üret (Gemini bağlanınca bu prompt gönderilecek; şimdilik metadata döner)
            const aiPrompt = formatDef.buildAiPrompt(mergedSettings, grade, topic);
            return {
                _aiPrompt: aiPrompt,
                _engineMode: 'ai',
                _formatId: type,
                title: `✨ AI Üretimi: ${formatDef.label}`,
                content: `AI Motor bu içeriği şu prompt ile üretecek:\n"${aiPrompt.substring(0, 120)}..."`,
                text: aiPrompt,
            };
        } else {
            // Hızlı Motor: fastGenerate() ile ayar değerlerini kullanarak anında üret
            return formatDef.fastGenerate(mergedSettings, grade, topic);
        }
    }

    // === ADIM 2: Registry'de yoksa eski switch mantığına dön (geriye dönük uyumluluk) ===
    switch (type) {
        case '5N1K_NEWS':
            return {
                title: isAi ? `✨ ${grade}. SINIF AI HABER: Okyanusun Gizemleri` : `⚡ ${grade}. SINIF HABER: Başarıya Giden Yol`,
                content: `(${topic} odaklı) ${isAi ? 'AI' : 'Hızlı Motor'} ile üretildi. Zorluk: ${difficultyLabel}.`,
                questions: ['Kim / Ne?', 'Nerede?', 'Ne Zaman?']
            };

        case 'SUPER_TURKCE_MATCHING':
        case 'ESLESTIRME': {
            const leftList = [
                `Kazanım: ${topic.substring(0, 15)}... nedeniyle`,
                `Zorluk düzeyi ${difficultyLabel} olduğu için`,
                `${isAi ? 'Yapay Zeka' : 'Hızlı Motor'} ile üretildi`
            ];
            const rightList = ['hemen entegre edildi.', 'hızla çözüme ulaştık.', 'performans arttı.'];
            return { left: leftList, right: [...rightList].sort(() => Math.random() - 0.5) };
        }

        case 'MULTIPLE_CHOICE':
        case 'STANDART_TEST':
        case 'YENI_NESIL':
            return {
                question: `${grade}. Sınıf (${difficultyLabel}): "${topic}" konusuyla ilgili hangisi doğrudur?`,
                options: ['A) Birinci seçenek.', 'B) İkinci seçenek.', 'C) Üçüncü seçenek.', 'D) Dördüncü seçenek.']
            };

        case 'FILL_IN_THE_BLANKS':
        case 'BOSLUK_DOLDURMA':
            return {
                words: ['başarı', 'çalışmak', 'zeka', grade?.toString() || 'öğrenci'],
                sentences: [`"${topic}" hedefine ulaşmak için ____________ gereklidir.`]
            };

        default:
            return {
                text: `${type} formatı — Seviye: ${grade}. Sınıf | Mod: ${isAi ? 'AI ✨' : 'Hızlı ⚡'} | Konu: ${topic}`
            };
    }
};


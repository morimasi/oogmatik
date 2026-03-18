import { Objective } from '../../core/types';
import { getFormatById } from '../activity-formats/registry';
import { generateActivityWithGemini } from '../../core/ai/geminiClient';
import { useSuperTurkceStore } from '../../core/store';
import { auditActivityContent } from '../../core/ai/autoAuditor';

// Yardımcı Fonksiyon: Üretilen veriden kelimeleri ayıklayıp Kumbaraya atar
const harvestVocabulary = (data: any, topicContext: string) => {
  if (!data) return;
  const wordsToSave: string[] = [];

  // Formatlardan gelebilecek muhtemel kelime dizi key'leri
  if (Array.isArray(data.words)) wordsToSave.push(...data.words);
  if (Array.isArray(data.kelimeler)) wordsToSave.push(...data.kelimeler);
  if (Array.isArray(data.targetWords)) wordsToSave.push(...data.targetWords);

  wordsToSave.forEach((w) => {
    if (typeof w === 'string' && w.trim().length > 1) {
      useSuperTurkceStore.getState().addVocabularyWord(w.trim(), topicContext);
    } else if (typeof w === 'object' && w !== null && (w as any).word) {
      useSuperTurkceStore
        .getState()
        .addVocabularyWord((w as any).word, topicContext, (w as any).meaning);
    }
  });
};

// Seçilen Müfredata, Formata ve Formata Özel Ayarlara Göre Dinamik İçerik Üretir
// Faz 8+9: Hızlı modda senkron, AI modda asenkron Gemini API çalıştırır
export const generateDynamicMockData = async (
  type: string,
  grade: number | null,
  objective: Objective | null,
  engineMode: 'ai' | 'fast',
  difficulty: string,
  audience: 'normal' | 'hafif_disleksi' | 'derin_disleksi' = 'normal',
  formatSettings?: Record<string, any> // Formata özel ultra ince ayarlar
) => {
  const topic = objective ? objective.title : `Genel ${grade || ''}. Sınıf Tekrarı`;
  const difficultyLabel = difficulty.toUpperCase();
  const isAi = engineMode === 'ai';

  // === ADIM 1: Registry'de tanımlı format var mı? ===
  const formatDef = getFormatById(type);
  if (formatDef) {
    // Defaults'dan ayarları birleştir + kullanıcının değiştirdiği ayarları override et
    const defaults: Record<string, any> = {};
    formatDef.settings.forEach((s) => {
      defaults[s.key] = s.defaultValue;
    });
    const mergedSettings = { ...defaults, ...(formatSettings || {}) };

    if (isAi) {
      // AI Motor: Gemini API üzerinden gerçek üretim
      const aiPrompt = formatDef.buildAiPrompt(mergedSettings, grade, topic);
      try {
        const aiResult = await generateActivityWithGemini(
          aiPrompt,
          audience,
          type,
          formatDef.schema
        );

        // Çift Doğrulama (Dual-Pass Validation) - Pedagojik Denetmen
        const auditReport = auditActivityContent(aiResult, audience);
        if (!auditReport.isApproved) {
          console.warn(
            `[Denetmen Reddi] ${type} için AI çıktısı uygun değil, hızlı moda dönülüyor. Sebep:`,
            auditReport.warnings
          );
          return {
            ...formatDef.fastGenerate(mergedSettings, grade, topic),
            _error:
              'Yapay zeka çıktısı pedagojik denetimden geçemedi, hızlı motor fallback kullanıldı.',
            _auditWarnings: auditReport.warnings,
          };
        } else if (auditReport.warnings.length > 0) {
          console.warn(
            `[Denetmen Uyarısı] ${type} için üretilen içerikte uyarılar var:`,
            auditReport.warnings
          );
          aiResult._auditWarnings = auditReport.warnings;
        }

        // Faz 10: Yeni Üretilen Kelimeleri Kumbaraya At
        harvestVocabulary(aiResult, topic);
        return aiResult;
      } catch (error: any) {
        console.error('AI Üretim Hatası:', error);
        // Fallback olarak o sorunun Hızlı Mod çıktısını dön (sistem kilitlenmesin)
        return {
          ...formatDef.fastGenerate(mergedSettings, grade, topic),
          _error: 'AI üretim başarısız oldu, hızlı motor fallback kullanıldı.',
        };
      }
    } else {
      // Hızlı Motor: fastGenerate() ile ayar değerlerini kullanarak anında üret
      const fastData = formatDef.fastGenerate(mergedSettings, grade, topic);
      harvestVocabulary(fastData, topic);
      return fastData;
    }
  }

  // === ADIM 2: Registry'de yoksa eski switch mantığına dön (geriye dönük uyumluluk) ===
  switch (type) {
    case '5N1K_NEWS':
      return {
        title: isAi
          ? `✨ ${grade}. SINIF AI HABER: Okyanusun Gizemleri`
          : `⚡ ${grade}. SINIF HABER: Başarıya Giden Yol`,
        content: `(${topic} odaklı) ${isAi ? 'AI' : 'Hızlı Motor'} ile üretildi. Zorluk: ${difficultyLabel}.`,
        questions: ['Kim / Ne?', 'Nerede?', 'Ne Zaman?'],
      };

    case 'SUPER_TURKCE_MATCHING':
    case 'ESLESTIRME': {
      const leftList = [
        `Kazanım: ${topic.substring(0, 15)}... nedeniyle`,
        `Zorluk düzeyi ${difficultyLabel} olduğu için`,
        `${isAi ? 'Yapay Zeka' : 'Hızlı Motor'} ile üretildi`,
      ];
      const rightList = ['hemen entegre edildi.', 'hızla çözüme ulaştık.', 'performans arttı.'];
      return { left: leftList, right: [...rightList].sort(() => Math.random() - 0.5) };
    }

    case 'MULTIPLE_CHOICE':
    case 'STANDART_TEST':
    case 'YENI_NESIL':
      return {
        question: `${grade}. Sınıf (${difficultyLabel}): "${topic}" konusuyla ilgili hangisi doğrudur?`,
        options: [
          'A) Birinci seçenek.',
          'B) İkinci seçenek.',
          'C) Üçüncü seçenek.',
          'D) Dördüncü seçenek.',
        ],
      };

    case 'FILL_IN_THE_BLANKS':
    case 'BOSLUK_DOLDURMA':
      return {
        words: ['başarı', 'çalışmak', 'zeka', grade?.toString() || 'öğrenci'],
        sentences: [`"${topic}" hedefine ulaşmak için ____________ gereklidir.`],
      };

    default:
      return {
        text: `${type} formatı — Seviye: ${grade}. Sınıf | Mod: ${isAi ? 'AI ✨' : 'Hızlı ⚡'} | Konu: ${topic}`,
      };
  }
};

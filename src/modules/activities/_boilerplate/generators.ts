import { BoilerplateData, BoilerplateSettings } from './types';
import { geminiClient } from '../../../../services/geminiClient';
import { AppError } from '../../../../utils/AppError';

/**
 * 1. HIZLI MOD (OFFLINE GENERATOR)
 * API çağrısı yapmadan, yerel algoritmalarla anında içerik üretir.
 */
export const generateFastMode = async (settings: BoilerplateSettings): Promise<BoilerplateData> => {
  // TODO: offline logiciği buraya yazılacak.
  const items = Array.from({ length: settings.itemCount }, (_, i) => ({
    id: `item-${Date.now()}-${i}`,
    question: `Örnek Soru ${i + 1} (${settings.difficulty})`,
    answer: `Örnek Cevap`,
    visualHint: '🎯'
  }));

  return {
    id: `boilerplate_${Date.now()}`,
    activityType: 'CUSTOM_NEW_ACTIVITY',
    title: 'Yeni Etkinlik Şablonu (Hızlı Üretim)',
    instruction: 'Lütfen aşağıdaki soruları dikkatlice okuyup cevaplayınız.',
    settings,
    content: {
      items,
      storyIntro: 'Hızlı modda üretilmiş otomatik içerik.',
      pedagogicalNote: 'Bu etkinlik, öğrencinin temel dikkat ve algı becerilerini ölçümlemek için optimize edilmiştir.'
    }
  };
};

/**
 * 2. AI MOD (DEEP GENERATION)
 * Gemini AI kullanarak derinlemesine ve pedagojik kalitesi yüksek içerik üretir.
 */
export const generateDeepAIMode = async (
  settings: BoilerplateSettings, 
  studentProfile?: any // Öğrencinin gelişim profili
): Promise<BoilerplateData> => {
  
  const prompt = `Sen kıdemli bir özel eğitim uzmanısın.
Görev: Aşağıdaki formatta, ${settings.difficulty} zorluğunda, toplam ${settings.itemCount} adet maddeden oluşan disleksi dostu bir aktivite üret.

FORMAT:
{
  "title": "Etkinlik Başlığı",
  "instruction": "Öğrenci Yönergesi",
  "items": [
    { "id": "1", "question": "soru", "answer": "cevap", "visualHint": "ikon" }
  ],
  "pedagogicalNote": "Öğretmen için zpd analizi..."
}
  `;

  try {
    const aiResponse = await geminiClient.generateContent(prompt, { temperature: 0.7 });
    
    // AI yanıtını JSON objesine çevirme & güvenlik katmanı
    if (!aiResponse.success || !aiResponse.data) {
      throw new AppError('AI üretim yapamadı.', 'GENERATION_FAILED', 500);
    }
    
    const data = aiResponse.data;

    return {
      id: `boilerplate_ai_${Date.now()}`,
      activityType: 'CUSTOM_NEW_ACTIVITY',
      title: data.title || 'AI Destekli Yeni Etkinlik',
      instruction: data.instruction || 'Yönergeyi takip edin.',
      settings,
      content: {
        items: data.items || [],
        pedagogicalNote: data.pedagogicalNote || 'Pedagojik analiz onaylandı.'
      }
    };
  } catch (error) {
    throw new AppError('Derin AI üretimi sırasında hata oluştu.', 'DEEP_AI_FAILED', 500, error);
  }
};

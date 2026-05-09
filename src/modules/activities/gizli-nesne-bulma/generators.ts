import { HiddenPicturesData, HiddenPicturesSettings } from './types';
import { geminiClient } from '../../../services/geminiClient';
import { AppError } from '../../../utils/AppError';

// Rastgele ikon seti
const ICONS = ['🍎', '🔑', '✏️', '🧸', '🎈', '⭐', '🚗', '📚', '⚽', '🎸'];

/**
 * HIZLI MOD (Offline Generator)
 * API kullanmadan, karmaşık desen simülasyonu yapan statik veri üretir.
 */
export const generateFastMode = async (settings: HiddenPicturesSettings): Promise<HiddenPicturesData> => {
  const items = Array.from({ length: settings.hiddenItemCount }, (_, i) => ({
    id: `item_${Date.now()}_${i}`,
    name: `Gizli Nesne ${i + 1}`,
    icon: ICONS[i % ICONS.length],
  }));

  return {
    activityType: 'HIDDEN_PICTURES',
    title: `${settings.theme} Bulmacası`,
    instruction: 'Yandaki listede verilen nesneleri, karmaşık görselin içerisinde bulup işaretleyiniz.',
    settings,
    content: {
      itemsToFind: items,
      mainImagePrompt: 'OFFLINE_MODE_PLACEHOLDER_SVG',
      pedagogicalNote: 'Görsel tarama (Visual Scanning) ve şekil-zemin ilişkisini güçlendirir. Ketleme becerisi gerektirir.',
    }
  };
};

/**
 * AI MODU (Deep Generation)
 * Gemini'den spesifik tema ve gizli nesnelere sahip bir görsel haritası/promptu ister.
 */
export const generateDeepAIMode = async (
  settings: HiddenPicturesSettings,
  studentProfile?: any
): Promise<HiddenPicturesData> => {

  const prompt = `Sen kıdemli bir özel eğitim uzmanısın ve profesyonel bir çocuk dergisi (örn: Highlight) yazarısın.
Görev: "Gizli Nesne Bulma" etkinliği oluştur. Zorluk: ${settings.difficulty}. Nesne Sayısı: ${settings.hiddenItemCount}. Tema: ${settings.theme}.

Şu formattaki JSON yapısını kesin ve hatasız döndür:
{
  "title": "...",
  "instruction": "...",
  "itemsToFind": [
    { "id": "1", "name": "Kayıp Anahtar", "icon": "🔑" },
    ...
  ],
  "mainImagePrompt": "DALL-E veya Midjourney için, içerisinde bu nesnelerin saklandığı sahneyi anlatan yüksek detaylı bir görsel üretim promptu (ingilizce yazılı)",
  "pedagogicalNote": "Öğretmen için analiz"
}`;

  try {
    const aiResponse = await geminiClient.generateContent(prompt, { temperature: 0.8 });
    
    if (!aiResponse.success || !aiResponse.data) {
      throw new AppError('AI Gizli Nesne üretemedi.', 'GENERATION_FAILED', 500);
    }
    
    const data = aiResponse.data;

    return {
      activityType: 'HIDDEN_PICTURES',
      title: data.title || 'AI Destekli Gizli Nesne Bulma',
      instruction: data.instruction || 'Nesneleri resmin etrafında arayınız.',
      settings,
      content: {
        itemsToFind: data.itemsToFind || [],
        mainImagePrompt: data.mainImagePrompt || 'Karmaşık vektörel çizim.',
        pedagogicalNote: data.pedagogicalNote || 'Pedagojik analiz onaylandı.'
      }
    };
  } catch (error) {
    throw new AppError('AI nesne üretiminde hata oluştu.', 'DEEP_AI_FAILED', 500, error);
  }
};

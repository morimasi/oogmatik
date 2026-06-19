import { 
  FascicleItem, 
  FascicleMetadata, 
  FascicleDifficulty, 
  FascicleAiSuggestionRequest 
} from '../types/fascicle';
import { generateWithSchema, generateWithGemini } from './geminiClient';
import { logError } from '../utils/errorHandler';
import { AppError } from '../utils/AppError';

class FascicleAIEngine {
  /**
   * Çocuğun profiline ve eksik olduğu konulara (weakTopics) göre stüdyoda 
   * öğretmene hangi tür/içeriklerde sorular eklemesini tavsiye eder.
   */
  public async getSmartSuggestions(request: FascicleAiSuggestionRequest): Promise<string[]> {
    const prompt = `
      Sen bir Nöro-Pedagojik Eğitim Uzmanısın (Elif Yıldız rolündesin).
      Öğrenci Profili: ${request.studentProfile}
      Yaş Grubu: ${request.studentAge}
      Şu an Fasikülde: ${request.currentItemCount} sayfa var.
      Öğrencinin Zayıf Olduğu Gözlemlenen Alanlar: ${request.weakTopics.join(', ')}
      
      Bu durumdaki bir çocuğa fasiküle eklemek üzere 3 farklı eğitim/aktivite "başlığı veya türü" öner (Örnek: 'Geometrik Desen Seçiciliği Testi', '2 Heceli Okuma Parçası').
      Kısa, net tavsiyeler olsun.
    `;

    const schema = {
      type: 'OBJECT',
      properties: {
        suggestions: {
          type: 'ARRAY',
          description: '3 adet kısa, eyleme dökülebilir öneri metni',
          items: {
            type: 'STRING'
          }
        }
      },
      required: ['suggestions']
    };

    try {
      const resultObj = await generateWithSchema(prompt, schema) as { suggestions: string[] };
      return resultObj.suggestions || [];
    } catch (error) {
      logError(error, { context: "AI Smart Suggestion Hatası" });
      throw new AppError("Öneriler alınırken AI motorunda bir sorun yaşandı.", "AI_SUGGESTION_ERROR", 500);
    }
  }

  /**
   * Mevcut sayfaları (items) analiz ederek pedagojik "Kolaydan Zora" ilkesine göre
   * yeniden sıralama dizisini döndürür.
   */
  public async autoSortByDifficulty(items: FascicleItem[]): Promise<string[]> {
    if (!items || items.length < 2) return items.map(i => i.id);

    // AI'a göndermek için sadeleştirilmiş veriler
    const simplifiedItems = items.map(i => ({
      id: i.id,
      type: i.type,
      currentDifficulty: i.difficulty,
      pedagogicalNote: i.pedagogicalNote
    }));

    const prompt = `
      Elimde bir eğitim fasikülü sayfaları listesi var. Özel eğitimde "Başarı Hissi" yaşatmak (Self-Efficacy)
      için önce kolay ve motivesi yüksek, sonlara doğru kompleks sayfalar yerleştirilmelidir.
      
      Aşağıdaki sayfaları en kolayı ilk sıraya gecelek şekilde, pedagojik sıralamaya sok ve sadece 
      yeni düzene göre "id" dizisini ver.
      
      Mevcut Sayfalar JSON:
      ${JSON.stringify(simplifiedItems, null, 2)}
    `;

    const schema = {
      type: 'OBJECT',
      properties: {
        orderedIds: {
          type: 'ARRAY',
          description: 'Kolaydan zora doğru sayfa ID dizisi',
          items: {
            type: 'STRING'
          }
        }
      },
      required: ['orderedIds']
    };

    try {
      // @ts-ignore: Strict type mismatch with Gemini param
      const resultObj = await generateWithSchema(prompt, schema) as { orderedIds: string[] };
      // Fallback
      if (!resultObj.orderedIds || resultObj.orderedIds.length !== items.length) {
         return items.map(i => i.id);
      }
      return resultObj.orderedIds;
    } catch (error) {
      logError(error, { context: "AI Sorting Hatası" });
      return items.map(i => i.id); // Hata anında sıralamayı bozma
    }
  }

  /**
   * Tüm kitapçığın bir "Yönetici Özeti" metnini çıkararak Veli veya Öğretmene sunar.
   */
  public async generateExecutiveSummary(metadata: FascicleMetadata, items: FascicleItem[]): Promise<string> {
    const summaryInfoItems = items.map(i => ({
       type: i.type,
       difficulty: i.difficulty,
       focus: i.pedagogicalNote
    }));

    const prompt = `
      Fasikül Bilgileri:
      Başlık: ${metadata.title}
      Yaş Grubu: ${metadata.targetAgeGroup}
      Süre: ${metadata.estimatedDurationMin} dakika.
      İçerik Özetleri: ${JSON.stringify(summaryInfoItems)}
      
      Bu fasikül, özel eğitim öğrencisine verilecektir. 
      Veliye ve uygulama öğretmenine yönelik samimi, etiketlemeden uzak, motive edici 1 paragraflık "Yönetici Özeti" (Executive Summary) yaz. 
      Disleksi/DEHB gibi kelimeler kullanma "öğrenme süreci, dikkat gelişimi" gibi sözcükler seç.
    `;

    const schema = {
        type: 'OBJECT',
        properties: {
            summaryText: {
                type: 'STRING',
                description: '1 paragraflık veli/öğretmen özeti'
            }
        },
        required: ['summaryText']
    };

    try {
       const resultObj = await generateWithSchema(prompt, schema) as { summaryText: string };
       return resultObj.summaryText || 'Bu fasikül, öğrencinin bireysel becerilerini desteklemek için özenle hazırlanmıştır.';
    } catch(error) {
       logError(error, { context: "AI Executive Summary Hatası" });
       return 'Bu fasikül, öğrencinin bireysel becerilerini olumlu yönde desteklemek ve geliştirmek için özel bir seçki ile hazırlanmıştır.';
    }
  }
}

export const fascicleAIEngine = new FascicleAIEngine();

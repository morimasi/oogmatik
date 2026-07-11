import { 
  FascicleItem, 
  FascicleMetadata, 
  FascicleAiSuggestionRequest,
  AiCoverSuggestion
} from '../types/fascicle';
import { generateWithSchema, generateSvgCode } from './geminiClient';
import { logError } from '../utils/errorHandler';
import { AppError } from '../utils/AppError';

class FascicleAIEngine {
  /**
   * Çocuğun profiline ve eksik olduğu konulara (weakTopics) göre stüdyoda 
   * öğretmene hangi tür/içeriklerde sorular eklemesini tavsiye eder.
   */
  public async getSmartSuggestions(request: FascicleAiSuggestionRequest): Promise<string[]> {
    const prompt = `
      Sen bir Nöro-Pedagojik Eğitim Uzmanısın (Elif Yıldız rolündesin). [DEPLOY: 2025_07_v6]
      bdmind platformu: 10 modüllü AI eğitim sistemi (Süper Türkçe, Matematik, Sarı Kitap, Kelime Cümle, Görsel Stüdyo, Dikkat Stüdyosu, Fasikül, Dijital Arşiv, BEP, Dashboard).
      
      Öğrenci Profili: ${request.studentProfile}
      Yaş Grubu: ${request.studentAge}
      Şu an Fasikülde: ${request.currentItemCount} sayfa var.
      Öğrencinin Zayıf Olduğu Gözlemlenen Alanlar: ${request.weakTopics.join(', ')}
      
      Bu durumdaki bir çocuğa fasiküle eklemek üzere 3 farklı eğitim/aktivite "başlığı veya türü" öner. Mevcut stüdyolardaki aktivite türlerini kullan:
      - Türkçe: okuma parçası, 5N1K, dil bilgisi, morfoloji, yazma
      - Matematik: görsel problem, Futoshiki, Sudoku, şekil sayma, işlem
      - Sarı Kitap: Pencere, Nokta, Köprü, Bellek, Çift Metin, Hızlı Okuma
      - Kelime: boşluk doldurma, karışık cümle, zıt/eş anlamlı
      - Görsel: desen tamamlama, fark bulma, yönsel iz
      - Dikkat: Stroop, görsel/işitsel dikkat, seçici dikkat
      
      Kısa, net, eyleme dökülebilir tavsiyeler olsun. Örn: 'Geometrik Desen Seçiciliği Testi (Görsel Stüdyo)', '2 Heceli Okuma Parçası (Sarı Kitap - Pencere Tekniği)'.
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
    }));

    const prompt = `
      Elimde bir bdmind eğitim fasikülü sayfaları listesi var. Özel eğitimde "Başarı Hissi" yaşatmak (Self-Efficacy)
      için önce kolay ve motivesi yüksek, sonlara doğru kompleks sayfalar yerleştirilmelidir.
      
      Kullanılabilir zorluk seviyeleri: Başlangıç (güven inşası), Orta (beceri gelişimi), İleri (pekiştirme), Uzman (mastery).
      
      Aşağıdaki sayfaları en kolayı ilk sıraya gelecek şekilde, pedagojik sıralamaya sok ve sadece 
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
    }));

    const prompt = `
      bdmind Fasikül Özet Raporu:
      Başlık: ${metadata.title}
      Yaş Grubu: ${metadata.targetAgeGroup}
      Süre: ${metadata.estimatedDurationMin} dakika.
      İçerik Özetleri: ${JSON.stringify(summaryInfoItems)}
      
      Bu fasikül, özel eğitim öğrencisine verilecektir. bdmind platformunda hazırlanmıştır.
      Veliye ve uygulama öğretmenine yönelik samimi, etiketlemeden uzak, motive edici 1 paragraflık "Yönetici Özeti" (Executive Summary) yaz.
      Tanı koyucu dil KULLANMA: "öğrenme süreci, dikkat gelişimi, beceri inşası" gibi sözcükler seç. Öğrencinin güçlü yönlerine vurgu yap.
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

  /**
   * Fasikül içeriğini analiz ederek AI ile kapak tasarımı önerisi üretir.
   * Tema, renk paleti, alt başlık ve özel SVG dekorasyonları belirler.
   */
  public async generateCoverDesign(metadata: FascicleMetadata, items: FascicleItem[]): Promise<AiCoverSuggestion> {
    const activitySummary = items.map(i => ({
      type: i.type,
      difficulty: i.difficulty,
    }));

    const themeOptions = [
      { id: 'clouds', label: 'Rüya Gibi (Dreamy Clouds) — yumuşak bulutlar, pastel, huzurlu' },
      { id: 'doodles', label: 'Neşeli Çizgiler (Playful Doodles) — benekler, çizgiler, enerjik' },
      { id: 'garden', label: 'Doğa Bahçesi (Nature Garden) — yapraklar, dalgalar, doğal' },
      { id: 'dots', label: 'Eğlenceli Benekler (Creative Dots) — nokta desenleri, daireler' },
    ];

    const colorOptions = [
      { id: 'lavender', label: 'Lavanta (yumuşak mor)' },
      { id: 'mint', label: 'Nane (ferah yeşil)' },
      { id: 'peach', label: 'Şeftali (sıcak turuncu)' },
      { id: 'blush', label: 'Pembe (tatlı pembe)' },
      { id: 'sky', label: 'Gökyüzü (açık mavi)' },
      { id: 'buttercup', label: 'Çiçek (güneş sarısı)' },
    ];

    const prompt = `
      Sen bir Eğitim Tasarım Uzmanısın (Elif Yıldız). [DEPLOY: 2025_07_v6]
      bdmind platformu için fasikül kapak tasarımı seçiyorsun. Kapaklar A4 formatında basılır (html2canvas + foreignObjectRendering).
      Logo 144x144px (w-36 h-36) yer alır. Öğrenci bilgi alanı (ad, sınıf, tarih) ve filigran bulunur.

      FASİKÜL BİLGİLERİ:
      Başlık: "${metadata.title}"
      Açıklama: "${metadata.description || 'Belirtilmemiş'}"
      Yaş Grubu: ${metadata.targetAgeGroup}
      Tahmini Süre: ${metadata.estimatedDurationMin} dakika

      İÇERİK AKTİVİTELERİ:
      ${JSON.stringify(activitySummary, null, 2)}
      ${items.length} adet aktivite bulunuyor.

      GÖREV:
      1. İçerik türüne ve zorluk dağılımına EN UYGUN temayı seç.
      2. EN UYGUN renk paletini seç.
      3. İçerikle ilgili yaratıcı bir alt başlık (subtitle) yaz (maksimum 50 karakter, Türkçe).
      4. Kısaca neden bu tema ve rengi seçtiğini açıkla.

      Tema seçenekleri: ${JSON.stringify(themeOptions)}
      Renk seçenekleri: ${JSON.stringify(colorOptions)}
    `;

    const schema = {
      type: 'OBJECT',
      properties: {
        themeStyle: {
          type: 'STRING',
          description: 'Seçilen tema ID: clouds, doodles, garden, veya dots',
          enum: ['clouds', 'doodles', 'garden', 'dots'],
        },
        primaryColor: {
          type: 'STRING',
          description: 'Seçilen renk ID: lavender, mint, peach, blush, sky, veya buttercup',
          enum: ['lavender', 'mint', 'peach', 'blush', 'sky', 'buttercup'],
        },
        subtitle: {
          type: 'STRING',
          description: 'İçerikle ilgili yaratıcı alt başlık (maks 50 karakter, Türkçe)',
        },
        reasoning: {
          type: 'STRING',
          description: 'Kısaca neden bu seçimlerin yapıldığına dair açıklama',
        }
      },
      required: ['themeStyle', 'primaryColor', 'subtitle', 'reasoning']
    };

    try {
      const result = await generateWithSchema(prompt, schema) as {
        themeStyle: string;
        primaryColor: string;
        subtitle: string;
        reasoning: string;
      };

      const themeStyle = (['clouds', 'doodles', 'garden', 'dots'].includes(result.themeStyle) ? result.themeStyle : 'clouds') as AiCoverSuggestion['themeStyle'];
      const primaryColor = (['lavender', 'mint', 'peach', 'blush', 'sky', 'buttercup'].includes(result.primaryColor) ? result.primaryColor : 'lavender');

      const activityTypes = items.map(i => i.type).join(', ');
      const svgPrompt = `
        Özel eğitim fasikülü için içerikle uyumlu bir SVG dekorasyon seti tasarla.
        Fasikül içeriği: ${metadata.title} — ${result.subtitle}
        Aktivite türleri: ${activityTypes}
        
        Şu temada dekoratif SVG öğeleri oluştur: ${themeStyle}
        Renk paleti: ${primaryColor} (pastel ton)
        
        İstediğim SVG'ler:
        1. Dekoratif bir arka plan deseni (dots, stars, veya organik şekiller)
        2. 2-3 adet küçük dekoratif ikon/şekil (içerik türüne uygun: kitap, yıldız, kalp, çiçek, rakam, harf vb.)
        
        Tüm SVG'ler tek bir <svg> etiketi içinde, viewBox="0 0 800 600", pastel renklerde, şeffaf arka planlı olsun.
        SADECE geçerli SVG kodu döndür, başka hiçbir şey yazma.
      `;

      let svgDecorations = '';
      try {
        svgDecorations = await generateSvgCode(svgPrompt);
      } catch {
        svgDecorations = '';
      }

      return {
        themeStyle,
        primaryColor,
        subtitle: result.subtitle || metadata.title,
        svgDecorations,
      };
    } catch (error) {
      logError(error, { context: "AI Cover Generation Hatası" });
      return {
        themeStyle: 'clouds',
        primaryColor: 'lavender',
        subtitle: metadata.title || 'Özel Eğitim Fasikülü',
        svgDecorations: '',
      };
    }
  }
}

export const fascicleAIEngine = new FascicleAIEngine();

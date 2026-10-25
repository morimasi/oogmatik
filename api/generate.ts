import type { VercelRequest, VercelResponse } from '@vercel/node';
import {
  AppError,
  ValidationError,
  RateLimitError,
  InternalServerError,
  toAppError,
} from '../src/utils/AppError.js';
import { validateGenerateActivityRequest } from '../src/utils/schemas.js';
import { RateLimiter } from '../src/services/rateLimiter.js';
import { retryWithBackoff, logError } from '../src/utils/errorHandler.js';
import { QuotaExceededError } from '../src/utils/AppError.js';
import {
  validatePromptSecurity,
  sanitizePromptInput,
  quickThreatCheck,
  DEFAULT_MAX_LENGTH,
} from '../src/utils/promptSecurity.js';
import { corsMiddleware } from '../src/utils/cors.js';
import { tryRepairJson } from '../src/utils/jsonRepair.js';

// JSON onarım kodu src/utils/jsonRepair.ts dosyasına aktarıldı.

// Types are imported from @vercel/node above

const MASTER_MODEL = 'gemini-2.5-flash';

const SYSTEM_INSTRUCTION = `
Sen, Bursa Disleksi EduMind (bdmind / oogmatik) platformunun ordinaryüs eğitim mimarı, nöro-pedagoji, grafik sanatları ve baskı sistemleri otoritesisin. [DEPLOY: 2026_SWARM_v6_ELITE]
MİSYON: 4-8. sınıf seviyesinde, MEB 2025-2026 müfredatıyla %100 uyumlu, LGS/PISA standartlarında, sıfır bilişsel yüklü, A4 baskıya kusursuz oturan "Ultra-Premium" içerik, grafik ve çalışma kâğıtları üretmek.

## 👑 10 ORDINARYÜS LİDER UZMAN KONSEYİ
Tüm üretimler ve mimari kararlar bu 10 Ordinaryüs liderin ortak denetim ve onayından geçer:
1. **Prof. Dr. Görkem Çetin** (Ordinaryüs Baş Grafiker & Vektörel Görsel Mimarı):
   - 33 tip HD matematik/veri grafiği (GraphicRenderer.tsx), saf SVG ikon/şemaları (generateSvgCode), WCAG AA/AAA kontrast garantisi, disleksi dostu pastel paletler (#4F46E5, #0D9488, #E11D48, #F59E0B, #1E293B). Sıfır görsel gürültü.
2. **Prof. Dr. Zafer Aydın** (Ordinaryüs PDF & Baskı Sistemleri Başmühendisi):
   - PDFGenerator v2.0 (html2canvas + jsPDF), @react-pdf/renderer (buildFasciclePdf), sinavPdfGenerator (Latin-1 encode normalizer), theme-print.css (@media print mürekkep tasarrufu ve saf kontrast). A4 milimetrik yerleşim (210x297mm), 10-15mm kenar payı, asla sayfa taşması olmaması ve 11pt pedagojik not footer kuralı.
3. **Elif Yıldız** (Pedagoji Direktörü & Disleksi/Diskalkuli Eğitmeni):
   - Yakınsal Gelişim Alanı (ZPD), ilk soru daima kolay (güven inşası), pedagogicalNote zorunluluğu, Sarı Kitap 6 hızlı okuma tekniği (Pencere, Nokta, Köprü, Çift Metin, Bellek, Hızlı Okuma).
4. **Dr. Ahmet Kaya** (Klinik Direktör & Nöropsikiyatri Otoritesi):
   - Tanı koyucu dil mutlak yasak ("disleksisi var" yerine "disleksi desteğine ihtiyacı var"), SMART kriterli BEP hedefleri, MEB 573 KHK ve Özel Eğitim Yönetmeliği tam uyumu.
5. **Bora Demir** (Baş Sistem Mimarı & Backend Güvenlik Direktörü):
   - TypeScript strict mode: 'any' tipi mutlak yasak (unknown + type guard), merkezi AppError standardı, Token Bucket + Firestore Sync RateLimiter, Transactional integrity.
6. **Selin Arslan** (AI Mimarisi & Generative Orkestrasyon Lideri):
   - Model: gemini-2.5-flash (sabit), 3 katmanlı JSON onarım motoru (balanceBraces -> truncateToValid -> JSON.parse), prompt sanitization, batch generation (>10 için 5'erli chunk), DEHB dostu 5-7 dk mikro-döngüler.
7. **Emre Tan** (UI/UX Stratejisti & Bilişsel Ergonomi Mimarı):
   - Dark/Light Glassmorphism (backdrop-blur, ultra-ince border, 2.5rem radius), Zero Cognitive Load, kompakt A4 ekran-baskı görsel uyumu.
8. **Dr. Canan Kaya** (Veri Analisti, Psikometri & SMART Ölçme-Değerlendirme Lideri):
   - Bilişsel test bataryaları, SMART gelişim radarları, kümülatif analitik ve normatif karneleme.
9. **Doç. Dr. Leyla Korkmaz** (KVKK, Yasal Mevzuat & Prompt Injection Muhafızı):
   - KVKK Madde 6: Öğrenci adı, tanı ve skor asla birlikte görünmez/export edilmez. PDF metadata sanitizasyonu, prompt injection kalkanı.
10. **Kaan Arslan** (Sıfır Hata Denetçisi & QA / Derleme Otoritesi):
    - npx tsc --noEmit %100 sıfır derleme hatası güvencesi, Zod şema validasyonu, Vitest test suite'leri.

## 🏛️ OOGMATİK UYGULAMA PLATFORM MODÜLLERİ (TAM SİSTEM HAKİMİYETİ)
1. **Süper Türkçe Stüdyosu**: MEB kazanımlı okuma, yazma ve dil bilgisi etkinlikleri (5N1K, kelime oyunları, morfoloji, anlamsal bağdaştırıcı).
2. **Matematik Stüdyosu & Mat Sınav Stüdyosu**:
   - 33 tip HD Grafik Motoru (GraphicRenderer.tsx): Sıklık/çetele tabloları, sütun/çizgi/pasta/nesne grafikleri, 2D/3D geometri (üçgen, kare, prizma, silindir, koni, piramit), analitik koordinat sistemleri, sayı doğruları, kesir modelleri, Venn diyagramları, olasılık çarkı.
   - Görsel problemler, şekil sayma, uzamsal ilişkiler, işlem akıcılığı, Futoshiki, Sudoku, mantık problemleri.
3. **Sarı Kitap (Hızlı Okuma Motoru)**: Pencere, Nokta, Köprü, Çift Metin, Bellek, Hızlı Okuma — disleksi dostu 6 özel nöro-teknik.
4. **Kelime Cümle Stüdyosu**: Boşluk doldurma, karışık cümleler, zıt/eş anlamlı kelime tamamlama, yönsel kod okuma.
5. **Görsel & Mekânsal Stüdyo**: Desen tamamlama, simetri çizimi, ızgara çizimi, fark bulma, yönsel iz sürme, interaktif harita rehberi (Treasure, Turkey, World SVG).
6. **Dikkat Stüdyosu**: Stroop testi, görsel dikkat, işitsel dikkat, seçici dikkat, labirentler.
7. **Fasikül Sistemi & Fasikül Stüdyosu**: Premium kapak tasarımı (4 tema x 6 pastel palet), AI kapak üretimi, filigran, içindekiler tablosu, A4 baskı motoru.
8. **PDF & Baskı Motoru (PDFGenerator.ts & ExportEngine.ts)**:
   - html2canvas + jsPDF ile gerçek PDF üretimi (A4, Letter, Legal, Extreme).
   - Kalite ölçekleri: standard (1.5x), high (2.0x), print (3.0x - 300 DPI matbaa kalitesi).
   - theme-print.css ile mürekkep korumalı saf kontrast kâğıt çıktısı.
   - SafePDFMetadata ile KVKK Madde 6 koruması (öğrenci adı ve tanı asla PDF içine yazılmaz).
9. **Dijital Arşiv**: Şifreli kayıt, kategori filtreleme, arama, sıralama, paylaşım, PDF çıktı.
10. **BEP (Bireysel Eğitim Planı)**: MEB 573 KHK uyumlu, SMART hedefler, otomatik takip.
11. **Akademik Planlama & Dashboard**: Günlük akış, ilerleme takibi, veri analitiği.
12. **Screening Assessment (Bilişsel Değerlendirme)**: Test bataryaları, AI analiz, radar analitiği.
13. **Universal Worksheet Viewer & Batch Export**: Çoklu çalışma kâğıtlarını arka planda asenkron PDF/JSON/PNG olarak dışa aktarma.
14. **Activity Studio & Dynamic Factory**: 40+ Online AI ve 25+ Offline jeneratör fabrikası.
15. **Ad Studio (Tanıtım & İletişim)**: 18+ modül için çok dilli ve çok formatlı materyal tanıtım motoru.

## 📐 GRAFİK, ÇIKTI VE BASKI PROTOKOLLERİ (Prof. Dr. Görkem Çetin & Prof. Dr. Zafer Aydın Standartları)
1. **Sıfır Bilişsel Yük & Vektörel Netlik**: Üretilen tüm görsel öğeler, şekiller ve semboller saf SVG veya net geometrik yapılardan oluşur. Görsel parazit, aşırı karmaşık gölgeler ve kafa karıştırıcı süslemeler yasaktır.
2. **Renk Teorisi**: Disleksiye özel pastel kontrast (#4F46E5 çivit, #0D9488 turkuaz, #E11D48 gül kurusu, #F59E0B kehribar, #1E293B arduvaz).
3. **A4 Baskı Ergonomisi**: Sayfa marjinleri 10-15 mm arasında tutulmalı, metin ve soru blokları asla sayfa sınırından taşmamalıdır.
4. **Font Standardı**: Tüm metin, soru ve grafik etiketlerinde sadece disleksi dostu 'Lexend' fontu kullanılır.
5. **Saf SVG Formatı**: generateSvgCode çağrılarında SADECE ham <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"> kodu döndürülür, markdown çiti eklenmez.

## 🎯 PEDAGOJİK DNA & KESİN KURALLAR
1. Çıktı JSON objesinde mutlaka 'pedagogicalNote' alanını bulundur ve aktivitenin çocuğa pedagojik katkısını öğretmene/veliye açıkla.
2. Yanıtın SADECE geçerli bir JSON olmalıdır. Markdown, kod blokları veya ek açıklama KULLANMA.
3. Üretimden önce içeriğin pedagojik güvenliğini, görsel estetiğini ve müfredat kazanımını 10 lider uzman konseyinin süzgecinden geçir.
4. Yaş grubuna uygun kelime karmaşıklığı kullan: 5-7 (max 2 hece), 8-10 (max 3 hece), 11-13 (karmaşık), 14+ (akademik).
5. Tanı koyucu dil KESİNLİKLE KULLANILMAZ ("disleksisi var" yerine "disleksi desteğine ihtiyacı var").
6. Spiral Learning: Kolay -> Orta -> Zor progresyonu ile öğrenciye özgüven kazandır.
`;

const rateLimiter = new RateLimiter();

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS Security - Origin validation (NO WILDCARD!)
  // Muhendislik Direktoru Bora Demir: Wildcard (*) YASAK
  if (!corsMiddleware(req, res)) {
    // CORS failed or OPTIONS handled
    return;
  }

  if (req.method !== 'POST') {
    return handleError(res, new AppError('Sadece POST kabul edilir.', 'METHOD_NOT_ALLOWED', 405));
  }

  try {
    // 1. Basic Validation
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    const { prompt, schema, image, mimeType, userId, systemInstruction, model } = body;

    const validation = validateGenerateActivityRequest(body);
    if (!validation.valid) {
      logError(new ValidationError("Generate Payload Validation Warning/Error: " + JSON.stringify(validation.errors)));
      // Sadece prompt eksik veya hatali ise uretimi durdur, activityType vs. eksikse tolere et
      if (validation.errors.prompt || !prompt) {
        return handleError(res, new ValidationError(
          validation.errors.prompt || 'Prompt (Talimat) eksik veya geçersiz.',
          validation.errors
        ));
      }
    }

    // 2. Prompt Injection Security Check
    // AI Direktoru Selin Arslan: Her prompt AI'a gonderilmeden once guvenlik kontrolunden gecmeli
    const actualUserId = userId || (req.headers['x-user-id'] as string) || 'anonymous';
    const clientIp = (req.headers['x-forwarded-for'] as string)?.split(',')[0] ||
      (req.headers['x-real-ip'] as string) ||
      'unknown';

    // Quick threat check for fast rejection of obvious attacks
    if (quickThreatCheck(prompt)) {
      logError(new ValidationError('Prompt injection attempt detected (quick check)', {
        userId: actualUserId,
        ip: clientIp,
        prompt: prompt?.substring(0, 100),
      }));
    }

    // Full security validation
    // System-generated prompts (from promptBuilder) are trusted and use 'high' threshold.
    // Only block critical/high-level injection attempts (actual attacks), not false positives
    // from educational content patterns (e.g. pedagogical instructions).
    const securityResult = validatePromptSecurity(prompt, {
      maxLength: 15000,
      enableLogging: true,
      blockOnThreat: true,
      threatThreshold: 'high',
    }, {
      userId: actualUserId,
      ipAddress: clientIp,
    });

    if (!securityResult.isSafe) {
      const threatCategories = [...new Set(securityResult.threats.map(t => t.category))];
      logError(new ValidationError('Prompt injection blocked', {
        userId: actualUserId,
        ip: clientIp,
        threatCount: securityResult.threats.length,
        categories: threatCategories,
      }));

      return handleError(res, new ValidationError(
        'Guvenlik kontrolunden gecemeyen ifadeler tespit edildi. Lutfen talebinizi yeniden duzenleyin.',
        {
          code: 'PROMPT_INJECTION_DETECTED',
          threatCount: securityResult.threats.length,
        }
      ));
    }

    // Use sanitized prompt for AI call
    const sanitizedPrompt = securityResult.sanitizedInput;

    // 3. Rate Limiting
    const userTier = (req.headers['x-user-tier'] as string) || 'free';
    try {
      await rateLimiter.enforceLimit(actualUserId, userTier as any, 'apiGeneration');
    } catch (error) {
      if (error instanceof RateLimitError) return handleError(res, error);
      throw error;
    }

    // 4. API Key Havuzu (Rotation System)
    // Muhendislik Direktoru Bora Demir: VITE_ prefix browser'a expose eder!
    const baseApiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || process.env.API_KEY;
    const backupKey1 = process.env.GEMINI_API_KEY_2 || process.env.GEMINI_API_KEY_SECONDARY;
    const backupKey2 = process.env.GEMINI_API_KEY_3 || process.env.GEMINI_API_KEY_TERTIARY;

    // Geçerli olan tüm API keyleri bir havuza doldur
    const apiKeys = [baseApiKey, backupKey1, backupKey2].filter(Boolean) as string[];

    if (apiKeys.length === 0) {
      throw new InternalServerError('API Key bulunamadi (Sunucu Yapilandirma Hatasi).');
    }

    let currentKeyIndex = 0;

    // 5. AI Call with Direct REST API (No SDK)
    const result = await retryWithBackoff(
      async () => {
        let selectedModel = model || MASTER_MODEL;
        // Eski onbelleklenmis verilerden gelebilecek kullanim disi modelleri engelle
        if (selectedModel.includes('gemini-2.0') || selectedModel.includes('gemini-1.5') || selectedModel.includes('gemini-3')) {
          selectedModel = MASTER_MODEL;
        }
        // Denenecek güncel API anahtarını al
        const apiKey = apiKeys[currentKeyIndex];
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${selectedModel}:generateContent?key=${apiKey}`;

        const contents = [
          {
            role: 'user',
            parts: [] as any[],
          },
        ];

        // Image support
        if (image) {
          contents[0].parts.push({
            inlineData: {
              mimeType: mimeType || 'image/jpeg',
              data: image.replace(/^data:image\/(png|jpeg|jpg|webp);base64,/, ''),
            },
          });
        }

        // Insert system instruction into the user prompt to maintain AI behavior
        // IMPORTANT: Use sanitizedPrompt instead of raw prompt
        let combinedPrompt = `[SISTEM TALIMATI BASLANGICI]\n${systemInstruction || SYSTEM_INSTRUCTION}\n[SISTEM TALIMATI BITISI]\n\n[KULLANICI ISTEGI]:\n${sanitizedPrompt}`;

        // Schema'yi Google REST API'in icine nesne olarak basamadigimiz icin Prompt'a yillayalim.
        if (schema) {
          combinedPrompt += '\n\n[ZORUNLU JSON YAPISI (ZORUNLU ŞEMA)]:\nAşağıdaki JSON şemasına ve anahtar kelimelerine HARFİYEN UYMALISIN. Çıktı sadece geçerli bir JSON olmalı.\n' + JSON.stringify(schema, null, 2);
        }

        // Text prompt
        contents[0].parts.push({ text: combinedPrompt });

        // CRITICAL: We remove generationConfig and systemInstruction COMPLETELY
        // to ensure NO SNAKE_CASE fields are ever sent to Google API from this proxy.
        // Google will use the prompt-embedded instructions.
        const requestBody: Record<string, unknown> = {
          contents
        };

        const response = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(requestBody),
        });

        if (!response.ok) {
          const errJson = await response.json().catch(() => ({}));
          const errorMsg = errJson.error?.message || response.statusText;

          // 403 Forbidden / Project Denied / Quota dolumu: Bu anahtar kullanılamaz!
          if (response.status === 403 || errorMsg.includes('denied access')) {
            // Eğer hala elimizde denenebilecek başka bir API key varsa sıradakine geç
            if (currentKeyIndex < apiKeys.length - 1) {
              currentKeyIndex++;
              throw new InternalServerError(`[ROTATION] API Key ${currentKeyIndex} tükendi, bir sonrakine geçiliyor.`);
            }
            // Tüm havuz denendi ve hepsi bittiyse kalıcı hata fırlat
            throw new QuotaExceededError(
              `Tüm yedek AI sistemleri API kotasını aştı (${errorMsg}). Lütfen teknik ekibe başvurun.`
            );
          }

          // Klasik 429 Rate Limit
          if (response.status === 429 || errorMsg.includes('quota') || errorMsg.includes('Quota')) {
            // Eğer rate limit yediysek de beklemek yerine sıradaki anahtara geçmeyi deneyebiliriz.
            if (currentKeyIndex < apiKeys.length - 1) {
              currentKeyIndex++;
              throw new InternalServerError(`[ROTATION] Rate limit yendi, sıradaki API Key'e geçiliyor.`);
            }
            throw new RateLimitError(
              `Gemini API Kotası Dolu: ${errorMsg}. Lütfen birkaç saniye sonra yeniden deneyin.`,
              { retryAfter: 60 }
            );
          }

          throw new InternalServerError(
            `Gemini API Hatasi: ${errorMsg}`
          );
        }

        const data = await response.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text;

        if (!text) {
          throw new InternalServerError('AI yaniti bos donderdi.');
        }

        return { text };
      },
      { maxRetries: Math.max(apiKeys.length, 3) }
    );

    // 6. Success — JSON Repair Engine ile parse et
    res.setHeader('X-bdmind-Deploy', '2024-03-18-v4-MINIMAL');
    res.setHeader('X-Prompt-Security', 'validated');
    try {
      const parsed = tryRepairJson(result.text);
      return res.status(200).json(parsed);
    } catch {
      return res.status(200).json({ text: result.text });
    }
  } catch (error: unknown) {
    return handleError(res, toAppError(error));
  }
}

function handleError(res: VercelResponse, error: AppError) {
  logError(error);
  return res.status(error.httpStatus).json({
    error: { message: error.userMessage, code: error.code },
  });
}

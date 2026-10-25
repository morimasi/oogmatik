import { AppError } from '../utils/AppError.js';
import { logInfo, logError, logWarn } from '../utils/logger.js';
import { safeFetch } from '../utils/apiClient.js';
import { useStudentStore } from '../store/useStudentStore';
import { db, doc, setDoc, serverTimestamp } from '../services/firebaseClient.js';

export interface CreativeMultimodalResult {
  [key: string]: unknown;
  content?: unknown;
  items?: unknown;
  title?: string;
  id?: string;
  data?: unknown;
  text?: string;
  refined?: string;
  analysisPrompt?: string;
  blueprintPrompt?: string;
  analysis?: string;
  refinedPrompt?: string;
}


// Model Seçimi: Gemini 2.5 Flash — Performanslı ve güncel model
const MASTER_MODEL = 'gemini-2.5-flash';

// Define a simple JSON schema data generator for mocks during tests
function generateDummyDataFromSchema(schema: Record<string, unknown>): unknown {
  if (!schema) return {};
  if (schema.type === 'OBJECT' || schema.type === 'object') {
    const obj: Record<string, unknown> = {};
    if (schema.properties) {
      for (const [key, prop] of Object.entries(schema.properties as Record<string, unknown>)) {
        obj[key] = generateDummyDataFromSchema(prop as Record<string, unknown>);
      }
    }
    return obj;
  }
  if (schema.type === 'ARRAY' || schema.type === 'array') {
    return [generateDummyDataFromSchema(schema.items as Record<string, unknown>)];
  }
  if (schema.type === 'STRING' || schema.type === 'string') {
    if (schema.enum && (schema.enum as unknown[]).length > 0) return (schema.enum as unknown[])[0];
    return 'test string';
  }
  if (schema.type === 'NUMBER' || schema.type === 'number') {
    return 85;
  }
  if (schema.type === 'BOOLEAN' || schema.type === 'boolean') {
    return true;
  }
  return null;
}

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

// Pedagojik Analiz Tipleri
export interface MultimodalFile {
  data: string;
  mimeType: string;
}

/**
 * Simple wrapper for basic text generation
 */
export const generateWithGemini = async (prompt: string, systemInstruction?: string): Promise<string> => {
  const result = await generateCreativeMultimodal({
    prompt,
    systemInstruction: systemInstruction || SYSTEM_INSTRUCTION
  });
  if (typeof result === 'string') return result;
  if (typeof result === 'object' && result !== null && 'text' in result) {
    return String((result as Record<string, unknown>).text);
  }
  return JSON.stringify(result);
};

/**
 * REST API Proxy Tabanlı Gemini İstemcisi (Güvenli)
 * Selin Arslan: safeFetch entegrasyonu ile ultra-robust yapı.
 */
/**
 * Gemini API çağrısı — Retry logic ve rate limiting ile
 */
export interface StudentAIContext {
  name: string;
  grade: string;
  diagnosis?: string | string[];
}

export const generateCreativeMultimodal = async (params: {
  prompt: string;
  schema?: Record<string, unknown>;
  files?: MultimodalFile[];
  temperature?: number;
  topP?: number;
  thinkingBudget?: number;
  systemInstruction?: string;
  model?: string;
  skipStudentContext?: boolean; // Hız için öğrenci bağlamını ve uniqueness seed'i atlar
  studentContext?: StudentAIContext; // Doğrudan parametre olarak bağlam enjeksiyonu
}): Promise<CreativeMultimodalResult> => {
  if (typeof process !== 'undefined' && process.env.NODE_ENV === 'test') {
    if (params.schema) {
      return generateDummyDataFromSchema(params.schema) as CreativeMultimodalResult;
    }
    return { test: 'data', isValid: true } as CreativeMultimodalResult;
  }

  // API Proxy endpoint
  const url = '/api/generate';

  let safeModel = params.model || MASTER_MODEL;
  if (safeModel.includes('gemini-2.0') || safeModel.includes('gemini-3')) {
    safeModel = MASTER_MODEL;
  }

  const activeStudent = params.skipStudentContext ? null : (params.studentContext || (typeof window !== 'undefined' ? useStudentStore.getState().activeStudent : null));
  let finalPrompt = params.prompt;

  // GLOBAL BENZERSİZLİK MEKANİZMASI: Her isteğe rastgele bir tohum ve yaratıcılık talimatı ekle
  if (!params.skipStudentContext) {
    const uniquenessSeed = Math.random().toString(36).substring(2, 10) + Date.now().toString(36);
    finalPrompt += `

======================================
[GLOBAL UNIQENESS & CREATIVITY PROTOCOL - v2]
SEED: ${uniquenessSeed}
TALİMAT: Bu üretimde KESİNLİKLE daha önceki desenlerden kaçın. Yaratıcı, özgün ve şaşırtıcı içerikler kurgula. Klişelere düşme, her kelime seçiminde 'Benzersizlik' prensibine sadık kal.
======================================`;
  }

  if (activeStudent) {
    const diagStr = activeStudent.diagnosis && Array.isArray(activeStudent.diagnosis) && activeStudent.diagnosis.length > 0
      ? activeStudent.diagnosis.join(', ')
      : (typeof activeStudent.diagnosis === 'string' && activeStudent.diagnosis ? activeStudent.diagnosis : 'Genel Öğrenme Güçlüğü (Tanısız)');

    finalPrompt += `

======================================
[NÖRO-PEDAGOJİK VE KLİNİK BAĞLAM BİLDİRİMİ]
Hedef Öğrenci: ${activeStudent.name} (Sınıf: ${activeStudent.grade})
Performans / Tanı Profili: ${diagStr}
======================================
ZORUNLU UZMAN KURALLARI (İHLAL EDİLEMEZ):
1. ZPD UYUMU (Elif Yıldız): Kelime dağarcığı, konseptler ve zorluk derecesi KESİNLİKLE öğrencinin (${activeStudent.grade}) seviyesine uygun olarak, dikkat süresini aşmayacak sadelikte tasarlanacaktır.
2. KLİNİK VE YASAL DİL (Dr. Ahmet Kaya): Çıktının hiçbir yerinde "disleksisi olduğu için", "öğrenme güçlüğü" veya "uygun bir aktivite" gibi tanı koyucu/etiketleyici bir dil KESİNLİKLE KULLANILMAYACAKTIR.

Tüm içeriği bu spesifik bağlama göre optimize et!`;
  }

  const body: Record<string, unknown> = {
    prompt: finalPrompt,
    schema: params.schema,
    temperature: params.temperature ?? 0.1,
    topP: params.topP ?? 0.9,
    thinkingBudget: params.thinkingBudget ?? 512,
    systemInstruction: params.systemInstruction || SYSTEM_INSTRUCTION,
    model: safeModel,
  };

  if (params.files && params.files.length > 0) {
    const file = params.files[0];
    body.image = file.data.includes(',') ? file.data.split(',')[1] : file.data;
    body.mimeType = file.mimeType;
  }

  // Retry logic for rate limiting & high demand
  const maxAttempts = 3; // Azaltıldı: 5 → 3 (hız için)
  let lastError: unknown;

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      logInfo('Gemini API çekilmesi', { attempt: attempt + 1, model: safeModel });
      const data = await safeFetch<Record<string, unknown>>(url, {
        method: 'POST',
        body: JSON.stringify(body),
      });

      // Token usage tracking
      const usageData = data?.usageMetadata as { promptTokenCount?: number; candidatesTokenCount?: number; totalTokenCount?: number } | undefined;
      if (usageData) {
        logInfo('Gemini API token kullanımı', {
          promptTokens: usageData.promptTokenCount,
          candidateTokens: usageData.candidatesTokenCount,
          totalTokens: usageData.totalTokenCount,
          model: MASTER_MODEL
        });

        try {
          const tokenRef = doc(db, 'activity_stats', `ai-tokens-${Date.now()}`);
          await setDoc(tokenRef, {
            timestamp: serverTimestamp(),
            promptTokens: usageData.promptTokenCount,
            candidateTokens: usageData.candidatesTokenCount,
            totalTokens: usageData.totalTokenCount,
            model: MASTER_MODEL
          });
        } catch {
          // Sessizce geç - analytics kaydı kritik değil
        }
      }

      return data as CreativeMultimodalResult;
    } catch (error: unknown) {
      lastError = error;
      const errorMsg = error instanceof Error ? error.message : String(error);

      // Hata tipleri: Rate limit (429), High Demand/Service Unavailable (503), Gateway Timeout (504)
      const isRetryable =
        errorMsg.includes('quota') ||
        errorMsg.includes('429') ||
        errorMsg.includes('503') ||
        errorMsg.includes('demand') ||
        errorMsg.includes('overloaded') ||
        errorMsg.includes('504');

      if (isRetryable && attempt < maxAttempts - 1) {
        // Üssel bekleme (Exponential Backoff): 2s, 4s, 8s, 16s...
        const baseDelay = 2000;
        const retryAfter = baseDelay * Math.pow(2, attempt);

        logWarn('Gemini Geçici Hatası — Tekrar denenecek', {
          retryAfter: `${retryAfter}ms`,
          attempt: attempt + 1,
          error: errorMsg
        });

        await new Promise(resolve => setTimeout(resolve, retryAfter));
      } else {
        throw error;
      }
    }
  }

  // Tüm deneme başarısız
  logError('Gemini API Tüm Denemeler Başarısız', { error: lastError });
  throw lastError;
};

export const generateWithSchema = async (
  prompt: string,
  schema: Record<string, unknown>,
  params?: { temperature?: number; topP?: number; thinkingBudget?: number; skipStudentContext?: boolean }
) => {
  return await generateCreativeMultimodal({ prompt, schema, ...params });
};


// MIME Type Helper
export const detectMimeType = (
  base64: string
): 'image/jpeg' | 'image/png' | 'image/webp' | 'image/gif' => {
  const raw = base64.split(',')[1] || base64;
  const prefix = raw.substring(0, 8);
  try {
    const bytes = atob(prefix);
    const b0 = bytes.charCodeAt(0);
    const b1 = bytes.charCodeAt(1);
    if (b0 === 0xff && b1 === 0xd8) return 'image/jpeg';
    if (b0 === 0x89 && b1 === 0x50) return 'image/png';
    if (b0 === 0x52 && b1 === 0x49) return 'image/webp';
    if (b0 === 0x47 && b1 === 0x49) return 'image/gif';
  } catch {
    if (base64.includes('image/png')) return 'image/png';
  }
  return 'image/jpeg';
};

/**
 * Generates raw SVG code from a prompt using Gemini (Proxy üzerinden)
 */
export const generateSvgCode = async (prompt: string): Promise<string> => {
  const systemPrompt = `
    Sen Ordinaryüs Baş Grafiker, Vektör/SVG Mimarı Prof. Dr. Görkem Çetin'sin.
    GÖREV: Kullanıcının istediği konuya uygun, ultra-net, yüksek kontrastlı, disleksi dostu ve sıfır bilişsel yüklü bir SVG vektör ikonu veya şeması üret.
    KURALLAR:
    - SADECE ham <svg> kodunu döndür. Açıklama veya markdown ( \`\`\` ) KESİNLİKLE KULLANMA.
    - viewBox="0 0 100 100" ve xmlns="http://www.w3.org/2000/svg" özniteliklerini ekle.
    - Renk paleti: WCAG AA/AAA onaylı disleksi dostu tonlar (#4F46E5, #0D9488, #E11D48, #F59E0B, #1E293B).
    - Karmaşık filtrelerden kaçın, temiz 2-4px kenarlıklar (stroke) ve net renk dolguları (fill) kullan.
  `;

  try {
    const data = await safeFetch<Record<string, unknown>>('/api/generate', {
      method: 'POST',
      body: JSON.stringify({
        prompt,
        systemInstruction: systemPrompt,
        model: MASTER_MODEL,
      }),
    });

    let svgCode = typeof data === 'string' ? data : ((data.svg || data.code || '') as string);

    // Clean up
    svgCode = svgCode.replace(/\`\`\`svg/g, '').replace(/\`\`\`/g, '').trim();

    if (!svgCode.includes('<svg')) {
      throw new Error('Geçerli bir SVG üretilemedi');
    }

    return svgCode;
  } catch (error: unknown) {
    logError('SVG Generation Error (Prof. Dr. Görkem Çetin Fallback)', { error: error instanceof Error ? error.message : String(error) });
    return '<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" role="img"><rect width="90" height="90" x="5" y="5" rx="16" fill="#EEF2FF" stroke="#4F46E5" stroke-width="3"/><path d="M30 50 L45 65 L70 35" stroke="#4F46E5" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" fill="none"/></svg>';
  }
};

export const analyzeImage = async (image: string, prompt: string, schema: Record<string, unknown>) => {
  const mimeType = detectMimeType(image);
  return await generateCreativeMultimodal({
    prompt,
    schema,
    files: [{ data: image, mimeType }],
  });
};

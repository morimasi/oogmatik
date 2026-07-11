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
Sen, Bursa Disleksi EduMind (bdmind) platformunun "Nöro-Mimari" motorusun. [DEPLOY: 2025_07_v6]
GÖREVİN: Özel öğrenme güçlüğü yaşayan çocuklar için bilimsel temelli, MEB 2025-2026 uyumlu materyaller üretmek.

## OOGMATİK PLATFORM MODÜLLERİ
1. **Süper Türkçe Stüdyosu**: MEB kazanımlı okuma, yazma ve dil bilgisi etkinlikleri (5N1K, kelime oyunları, morfoloji)
2. **Matematik Stüdyosu**: Görsel problemler, şekil sayma, uzamsal ilişkiler, işlem akıcılığı, Futoshiki, Sudoku, mantık
3. **Sarı Kitap (Hızlı Okuma)**: Pencere, Nokta, Köprü, Çift Metin, Bellek, Hızlı Okuma — disleksi dostu 6 teknik
4. **Kelime Cümle Stüdyosu**: Boşluk doldurma, karışık cümleler, zıt/eş anlamlı kelime tamamlama
5. **Görsel Stüdyo**: Desen tamamlama, fark bulma, yönsel iz sürme, görsel yorumlama
6. **Dikkat Stüdyosu**: Stroop testi, görsel dikkat, işitsel dikkat, seçici dikkat
7. **Fasikül Sistemi**: Premium kapak tasarımı (4 tema × 6 pastel palet), AI kapak üretimi, öğrenci bilgi alanı, filigran, A4 baskı motoru (foreignObjectRendering aktif)
8. **Dijital Arşiv**: Kategori filtreleme, arama, sıralama, paylaşım, PDF çıktı
9. **BEP (Bireysel Eğitim Planı)**: MEB 573 KHK uyumlu, SMART hedefler, otomatik takip
10. **Akademik Planlama & Dashboard**: Günlük akış, ilerleme takibi, veri analitiği

## PEDAGOJİK PRENSİPLER (ZORUNLU)
1. Görseldeki tablo, ızgara ve hiyerarşik yapıları teknik bir BLUEPRINT olarak analiz et.
2. Klinik çeldiricileri (b-d karışıklığı, ayna etkisi vb.) üretimden önce MUHAKEME ET.
3. **Tanı Koyucu Dil YASAK**: "Disleksisi var" YERİNE "disleksi desteğine ihtiyacı olan öğrenci".
4. **Multisensory**: Görsel, kinestetik ve sözel öğeleri harmanla.
5. **Scaffolding**: Zor konularda bilgi notu/kural hatırlatması ekle.
6. **Spiral Learning**: Kolay → Orta → Zor progresyonu.
7. **Lexend Font Standardı**: b-d, p-q karışıklığına duyarlı.
8. **Bilişsel Yük Yönetimi**: DEHB'li öğrenciler için max 5-7 dk odaklanma süresi.
9. Çıktı her zaman geçerli bir JSON olmalıdır.
10. Yanıtında sadece saf JSON döndür, markdown, kod bloğu veya açıklama KULLANMA.
11. Her üretimde 'pedagogicalNote' alanını bulundur.
12. Yaş grubuna uygun kelime karmaşıklığı: 5-7 (2 hece), 8-10 (3 hece), 11-13 (karmaşık), 14+ (akademik).
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

  const activeStudent = params.skipStudentContext ? null : useStudentStore.getState().activeStudent;
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
    const diagStr = activeStudent.diagnosis && activeStudent.diagnosis.length > 0
      ? activeStudent.diagnosis.join(', ')
      : 'Genel Öğrenme Güçlüğü (Tanısız)';
      
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
    Sen bir SVG uzmanısın. Kullanıcının istediği konuya uygun, basit, yüksek kontrastlı ve disleksi dostu bir SVG ikonu üret.
    KURALLAR:
    - SADECE ham <svg> kodunu döndür. Açıklama veya markdown ( \`\`\` ) kullanma.
    - Görsel 100x100 viewbox içinde olmalı.
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

    let svgCode = typeof data === 'string' ? data : (data.svg || data.code || '') as string;

    // Clean up
    svgCode = svgCode.replace(/```svg/g, '').replace(/```/g, '').trim();

    if (!svgCode.includes('<svg')) {
      throw new Error('Geçerli bir SVG üretilemedi');
    }

    return svgCode;
  } catch (error: unknown) {
    logError('SVG Generation Error', { error: error instanceof Error ? error.message : String(error) });
    return '<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><circle cx="50" cy="50" r="40" stroke="#000" stroke-width="4" fill="none"/></svg>';
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

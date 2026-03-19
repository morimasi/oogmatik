// Model Seçimi: Gemini 2.0 Flash — Performanslı ve güncel model
const MASTER_MODEL = 'gemini-2.5-flash';

// ============================================================
// JSON ONARIM MOTORU (3 Katmanlı Strateji)
// ============================================================

/**
 * KATMAN 1: Eksik kapanış parantezlerini sayısal olarak tamamlar.
 * Örnek: { "a": [1, 2 → { "a": [1, 2]}
 */
const balanceBraces = (str: string): string => {
  // Önce string içlerindeki parantezleri yoksay
  const stack: string[] = [];
  let inString = false;
  let escaped = false;

  for (let i = 0; i < str.length; i++) {
    const ch = str[i];
    if (escaped) {
      escaped = false;
      continue;
    }
    if (ch === '\\' && inString) {
      escaped = true;
      continue;
    }
    if (ch === '"') {
      inString = !inString;
      continue;
    }
    if (inString) continue;

    if (ch === '{') stack.push('}');
    else if (ch === '[') stack.push(']');
    else if ((ch === '}' || ch === ']') && stack.length > 0) {
      if (stack[stack.length - 1] === ch) stack.pop();
      else stack.pop(); // yanlış kapanış → tüket (tolerans)
    }
  }

  // Açık string varsa kapat
  if (inString) str += '"';
  // Kalan açık parantezleri ters sırayla kapat
  while (stack.length > 0) str += stack.pop();
  return str;
};

/**
 * KATMAN 2: Kesik JSON'ı son geçerli virgülden keser.
 * Örnek: { "a": 1, "b": { → { "a": 1 }
 */
const truncateToLastValidEntry = (str: string): string => {
  // Son tam virgülü bul ve oradan kes
  const lastComma = str.lastIndexOf(',');
  if (lastComma > 0) {
    const candidate = str.substring(0, lastComma);
    return balanceBraces(candidate);
  }
  return balanceBraces(str);
};

/**
 * KATMAN 3: Ana JSON Onarıcı
 * Sırasıyla 3 strateji uygular; birincisi başarısız olursa sonrakine geçer.
 */
const tryRepairJson = (jsonStr: string): any => {
  if (!jsonStr) throw new Error('AI yanıt dönmedi.');

  // 1. Görünmez karakterleri ve markdown bloklarını temizle
  let cleaned = jsonStr.replace(/[\u200B-\u200D\uFEFF]/g, '').trim();
  cleaned = cleaned
    .replace(/^```json[\s\S]*?\n/, '') // başındaki ```json ... satırını sil
    .replace(/^```\s*/m, '') // başındaki ``` sil
    .replace(/```\s*$/m, '') // sonundaki ``` sil
    .trim();

  // JSON başlangıcını bul (bazen model önüne açıklama ekler)
  const firstBrace = cleaned.indexOf('{');
  const firstBracket = cleaned.indexOf('[');
  let startIndex = -1;
  if (firstBrace !== -1 && firstBracket !== -1) startIndex = Math.min(firstBrace, firstBracket);
  else if (firstBrace !== -1) startIndex = firstBrace;
  else if (firstBracket !== -1) startIndex = firstBracket;
  if (startIndex > 0) cleaned = cleaned.substring(startIndex);

  // STRATEJİ 1: Direkt parse
  try {
    return JSON.parse(cleaned);
  } catch (_e1) {
    /* devam */
  }

  // STRATEJİ 2: Eksik parantezleri tamamlayarak parse
  try {
    const balanced = balanceBraces(cleaned);
    return JSON.parse(balanced);
  } catch (_e2) {
    /* devam */
  }

  // STRATEJİ 3: Son geçerli girişe kadar kes, sonra tamamla
  try {
    const truncated = truncateToLastValidEntry(cleaned);
    const result = JSON.parse(truncated);
    console.warn(
      '[GeminiClient] JSON truncated & repaired. Yanıt token sınırına çarpmış olabilir.'
    );
    return result;
  } catch (_e3) {
    /* tüm stratejiler başarısız */
  }

  // Tüm stratejiler başarısız → orijinal ham metni logla
  console.error(
    '[GeminiClient] JSON Parse tamamen başarısız. Ham metin:',
    cleaned.substring(0, 500)
  );
  throw new Error('AI verisi işlenemedi. JSON formatı bozuk veya yanıt çok kısa.');
};

const SYSTEM_INSTRUCTION = `
Sen, Bursa Disleksi AI platformunun "Nöro-Mimari" motorusun.
GÖREVİN: Özel öğrenme güçlüğü yaşayan çocuklar için bilimsel temelli materyalleri klonlamak ve üretmek.

PRENSİPLER:
1. Görseldeki tablo, ızgara ve hiyerarşik yapıları teknik bir BLUEPRINT olarak analiz et.
2. Klinik çeldiricileri (b-d karışıklığı, ayna etkisi vb.) üretimden önce MUHAKEME ET.
3. Çıktı her zaman geçerli bir JSON olmalıdır.
4. Yanıtında sadece saf JSON döndür, markdown kullanma.
`;

const PEDAGOGICAL_AUDITOR_INSTRUCTION = `
Sen, "Özel Öğrenme Güçlüğü (Disleksi)" alanında uzmanlaşmış kıdemli bir PEDAGOG ve KLİNİK PSİKOLOGSUN.
GÖREVİN: Sana verilen eğitim materyali verisini (JSON) analiz etmek ve dislektik bireyler için uygunluğunu puanlamak.

DENETİM KRİTERLERİ:
1. Negatif Dil: "-me, -ma" ekleri veya "yapma, etme" gibi olumsuz emir kipleri var mı? (Dislektik beyin olumsuzu işlemekte zorlanır).
2. Karmaşıklık: Yönergeler çok mu uzun? (Kısa işleyen bellek yükü).
3. Görsel Yük: Ekran çok mu kalabalık?
4. Hedef Odaklılık: Aktivite tek bir beceriye mi odaklanıyor?

ÇIKTI FORMATI (JSON):
{
    "score": 0-100 arası sayı,
    "verdict": "Mükemmel" | "İyi" | "Riskli" | "Kritik",
    "analysis": [
        { "type": "success" | "warning" | "error", "message": "Tespit edilen durum", "suggestion": "Öneri" }
    ]
}
`;

// Pedagojik Analiz Tipleri
export interface MultimodalFile {
  data: string;
  mimeType: string;
}

/**
 * AI PEDAGOG: İçerik Denetimi Yapar (Proxy üzerinden)
 */
export const evaluateContent = async (content: any) => {
  const url = `/api/generate`;

  const prompt = `
    [ANALİZ EDİLECEK İÇERİK]
    ${JSON.stringify(content)}
    
    Lütfen yukarıdaki materyali disleksi dostu tasarım ilkelerine göre acımasızca eleştir ve puanla.
    `;

  const schema = {
    type: 'OBJECT',
    properties: {
      score: { type: 'NUMBER' },
      verdict: { type: 'STRING', enum: ['Mükemmel', 'İyi', 'Riskli', 'Kritik'] },
      analysis: {
        type: 'ARRAY',
        items: {
          type: 'OBJECT',
          properties: {
            type: { type: 'STRING', enum: ['success', 'warning', 'error'] },
            message: { type: 'STRING' },
            suggestion: { type: 'STRING' },
          },
          required: ['type', 'message', 'suggestion'],
        },
      },
    },
    required: ['score', 'verdict', 'analysis'],
  };

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        prompt,
        systemInstruction: PEDAGOGICAL_AUDITOR_INSTRUCTION,
        schema,
        model: MASTER_MODEL,
      }),
    });

    if (!response.ok) return null;
    const data = await response.json();
    return data;
  } catch (e) {
    console.error('Pedagojik analiz hatası:', e);
    return null;
  }
};

/**
 * REST API Proxy Tabanlı Gemini İstemcisi (Güvenli)
 */
export const generateCreativeMultimodal = async (params: {
  prompt: string;
  schema?: any;
  files?: MultimodalFile[];
  temperature?: number;
  thinkingBudget?: number;
  systemInstruction?: string;
  model?: string;
}) => {
  // API Proxy endpoint
  const url = '/api/generate';

  let safeModel = params.model || MASTER_MODEL;
  if (safeModel.includes('gemini-2.0') || safeModel.includes('gemini-3')) {
    safeModel = MASTER_MODEL;
  }

  const body: any = {
    prompt: params.prompt,
    schema: params.schema,
    temperature: params.temperature ?? 0.1,
    systemInstruction: params.systemInstruction || SYSTEM_INSTRUCTION,
    model: safeModel,
  };

  // Multimodal veri hazırlığı (Proxy'nin beklediği formatta)
  if (params.files && params.files.length > 0) {
    const file = params.files[0]; // Proxy şu an tek resim destekliyor
    body.image = file.data.includes(',') ? file.data.split(',')[1] : file.data;
    body.mimeType = file.mimeType;
  }

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errData = await response
        .json()
        .catch(() => ({ error: { message: 'Bilinmeyen hata' } }));
      throw new Error(errData.error?.message || `API Hatası (${response.status})`);
    }

    const data = await response.json();
    return data; // Proxy zaten JSON parse edilmiş veriyi döndürür
  } catch (error: any) {
    console.error('Gemini Proxy İstek Hatası:', error);
    throw error;
  }
};

export const generateWithSchema = async (prompt: string, schema: any) => {
  return await generateCreativeMultimodal({ prompt, schema });
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
    - Tasarım minimalist, net çizgili ve dolgulu olmalı.
    - Arka plan şeffaf olmalı.
    - Renk paleti: #000000 (siyah) veya #4f46e5 (indigo) kullan.
  `;

  try {
    const url = `/api/generate`;

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        prompt,
        systemInstruction: systemPrompt,
        model: MASTER_MODEL,
      }),
    });

    if (!response.ok) throw new Error('Gemini SVG generation failed');

    const data = await response.json();
    // SVG durumunda proxy json dönemezse veya string dönerse handle et
    let svgCode = typeof data === 'string' ? data : data.svg || data.code || '';

    // Clean up markdown if AI accidentally included it
    svgCode = svgCode
      .replace(/```svg/g, '')
      .replace(/```/g, '')
      .trim();

    if (!svgCode.includes('<svg')) {
      throw new Error('Geçerli bir SVG üretilemedi');
    }

    return svgCode;
  } catch (error) {
    console.error('SVG Generation Error:', error);
    // Generic fallback SVG (a simple circle)
    return '<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><circle cx="50" cy="50" r="40" stroke="#000" stroke-width="4" fill="none"/></svg>';
  }
};

export const analyzeImage = async (image: string, prompt: string, schema: any) => {
  const mimeType = detectMimeType(image);
  return await generateCreativeMultimodal({
    prompt,
    schema,
    files: [{ data: image, mimeType }],
  });
};

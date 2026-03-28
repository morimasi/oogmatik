import { AppError } from '../utils/AppError';
/**
 * infographicService.ts
 * @antv/infographic için AI destekli infografik syntax üreticisi.
 * Selin Arslan (AI Mühendisi) onaylı: Gemini 2.5 Flash kullanır.
 */

const API_URL = '/api/generate';

export interface InfographicRequest {
  topic: string;
  ageGroup: '5-7' | '8-10' | '11-13' | '14+';
  profile: 'dyslexia' | 'dyscalculia' | 'adhd' | 'mixed' | 'general';
  templateHint?: string;
  language?: 'tr' | 'en';
}

export interface InfographicResult {
  syntax: string;
  title: string;
  pedagogicalNote: string;
  templateType: string;
}

/**
 * Kullanıcı girişini sanitize eder (max 2000 karakter).
 */
function sanitizeInput(input: string): string {
  return input.slice(0, 2000).replace(/[<>]/g, '');
}

/**
 * Yaş grubuna uygun içerik sınırları
 */
function getAgeConstraints(ageGroup: InfographicRequest['ageGroup']): string {
  const map: Record<string, string> = {
    '5-7': 'Çok basit, 3-4 madde, kısa kelimeler, büyük fontlar önerilir',
    '8-10': 'Basit, 4-6 madde, günlük yaşam kavramları',
    '11-13': 'Orta düzey, 5-7 madde, soyut düşünce başlangıcı',
    '14+': 'İleri düzey, 6-8 madde, analitik içerik',
  };
  return map[ageGroup] ?? map['8-10'];
}

/**
 * Öğrenme profiline uygun yönergeler
 */
function getProfileGuidelines(profile: InfographicRequest['profile']): string {
  const map: Record<string, string> = {
    dyslexia: 'Kısa cümleler, fonetik farkındalık destekli, renk kodlaması tercih et',
    dyscalculia: 'Görsel sayı temsilleri, adım adım süreçler, somut örnekler',
    adhd: 'Çarpıcı başlıklar, kısa madde metinleri, görsel çeşitlilik, yüksek kontrast',
    mixed: 'Hem görsel hem sözel destek, az metin, sembol kullanımı',
    general: 'Standart pedagojik yaklaşım, açık ve anlaşılır dil',
  };
  return map[profile] ?? map['general'];
}

/**
 * @antv/infographic syntax formatı için AI prompt'u oluşturur.
 * Template'ler: list-row, sequence-steps, compare-binary, hierarchy-mindmap vb.
 */
function buildPrompt(req: InfographicRequest): string {
  const ageConstraint = getAgeConstraints(req.ageGroup);
  const profileGuideline = getProfileGuidelines(req.profile);
  const lang = req.language ?? 'tr';

  // templateHint varsa hangi format kullanılacağını belirt
  const templateHintSection = req.templateHint
    ? `\nTEMPLATE TERCİHİ: Kullanıcı "${req.templateHint}" formatını tercih ediyor — uygunsa bu formatı seç.\n`
    : '';

  return `Sen MEB 2024-2025 müfredatına uygun, özel öğrenme güçlüğü yaşayan çocuklar için içerik üreten bir özel eğitim uzmanı ve görsel içerik tasarımcısısın.
"${sanitizeInput(req.topic)}" konusu için @antv/infographic kütüphanesinin SADECE aşağıdaki belirtilen declarative syntax formatında eğitici bir infografik oluştur.
${templateHintSection}
HEDEF KİTLE:
- Yaş grubu: ${req.ageGroup} (${ageConstraint})
- Öğrenme profili: ${req.profile} — ${profileGuideline}
- Dil: ${lang === 'tr' ? 'Türkçe' : 'İngilizce'}

@ANTV/INFOGRAPHIC SYNTAX KURALLARI (KESİNLİKLE UYULMASI ZORUNLU):
Syntax'ın İLK SATIRI daima "infographic <template-tipi>" ile başlamalıdır.
Girintiler için 2 boşluk kullan (TAB değil).

Aşağıdaki formatlardan birini seç (konuya en uygun olanı):

1. Adım Sırası (sequence-steps): Süreç/prosedür için
infographic sequence-steps
title Başlık
data
  steps
    - label 1. Adım
      desc Açıklama
    - label 2. Adım
      desc Açıklama

2. Liste (list-row): Kavramlar/bilgiler için
infographic list-row-simple-horizontal-arrow
title Başlık
data
  lists
    - label Kavram 1
      desc Açıklama
    - label Kavram 2
      desc Açıklama

3. Karşılaştırma (compare-binary): İki kavramı karşılaştırmak için
infographic compare-binary-horizontal
title Başlık
data
  left
    title Sol Başlık
    items
      - Madde 1
      - Madde 2
  right
    title Sağ Başlık
    items
      - Madde 1
      - Madde 2

4. Hiyerarşi (hierarchy-structure): Kavramsal harita için
infographic hierarchy-structure
title Başlık
data
  root
    label Ana Kavram
    children
      - label Alt Kavram 1
      - label Alt Kavram 2

5. Zaman Çizelgesi (sequence-timeline): Tarihsel/kronolojik için
infographic sequence-timeline
title Başlık
data
  events
    - date Tarih/Dönem
      title Olay
      desc Açıklama

ÖNEMLİ KURALLAR:
- pedagogicalNote alanını MUTLAKA ekle (150+ kelime, öğretmene "neden bu format seçildi", "hangi pedagojik beceriyi destekler", "MEB müfredatı ile bağlantısı" açıklaması)
- Klinik tanı koyucu dil kullanma: "disleksisi var" değil → "disleksi desteğine ihtiyacı var"
- İçeriği ${ageConstraint.split(',')[0]} ilkesine göre sınırla
- Türkçe başlık ve açıklamalar kullan
- title değeri konuyu özetleyen kısa bir cümle olsun
- JSON FORMATINI (KV) KESİNLİKLE KULLANMA. 
- YANITINI SADECE AŞAĞIDAKİ XML ETİKETLERİ (TAG) ARASINA YAZ.

YANIT FORMATI (XML TAGS):
<TITLE>
İnfografik başlığı
</TITLE>
<SYNTAX>
infographic <template>
title <başlık>
data
  ...
</SYNTAX>
<PEDAGOGY>
Bu infografik formatı seçildi çünkü... [150+ kelime]
</PEDAGOGY>
<TEMPLATE>
kullanılan template adı (örn: compare-binary-horizontal)
</TEMPLATE>`;
}

/**
 * Gemini AI ile @antv/infographic syntax üretir.
 * Bora Demir standardı: AppError formatı, retry yok (tek seferlik UI).
 */
export async function generateInfographicSyntax(
  req: InfographicRequest
): Promise<InfographicResult> {
  const prompt = buildPrompt(req);

  const response = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    // XML döndürmesini zorladığımız için JSON şema şartını (schema payload) API'ye göndermiyoruz.
    // Ancak api/generate'in default sistem komutu (JSON zorunluluğu) ile çakışmaması için XML'yi emreden bir systemInstruction geçiyoruz.
    body: JSON.stringify({
      prompt,
      systemInstruction:
        'SADECE benden istenen XML formatında yanıt dön. Kesinlikle JSON yapısı KULLANMA ve markdown (```) işaretleri EKLEME.',
    }),
  });

  if (!response.ok) {
    const errorData = await response
      .json()
      .catch(() => ({ error: { message: 'Bilinmeyen hata' } }));
    throw new AppError(
      errorData.error?.message ??
        `AI servisi yanıt vermedi (${response.status}, 'INTERNAL_ERROR', 500)`
    );
  }

  // /api/generate endpoint'ine XML döndürteceğimiz için JSON parse FAİL edecek ve { text: "..." } fallback dönecek.
  const raw = (await response.json()) as Record<string, unknown>;
  const rawText = ((raw?.data as Record<string, unknown>)?.text as string) ?? (raw?.text as string);
  // 1. İhtimal: Vercel tryRepairJson başarılı olup JSON olarak döndürdüyse (Eğer AI tüm kurallara rağmen yine JSON verdiyse)
  let data: Partial<InfographicResult> | null = null;
  const potentialData = (raw?.data ?? raw) as Partial<InfographicResult>;

  if (potentialData?.syntax && typeof potentialData.syntax === 'string') {
    data = potentialData;
  } else if (rawText && typeof rawText === 'string') {
    // 2. İhtimal: (Gerçek Planımız) API'miz XML text'i JSON sanıp parse edememiş ve { text: '...' } olarak düz şekilde döndürmüşse
    // XML Tag Ayıklama Motoru Devreye Girer
    const titleMatch = rawText.match(/<TITLE>([\s\S]*?)<\/TITLE>/i);
    const syntaxMatch = rawText.match(/<SYNTAX>([\s\S]*?)<\/SYNTAX>/i);
    const pedMatch = rawText.match(/<PEDAGOGY>([\s\S]*?)<\/PEDAGOGY>/i);
    const tempMatch = rawText.match(/<TEMPLATE>([\s\S]*?)<\/TEMPLATE>/i);

    if (syntaxMatch) {
      data = {
        title: titleMatch ? titleMatch[1].trim() : req.topic,
        syntax: syntaxMatch[1].trim(),
        pedagogicalNote: pedMatch ? pedMatch[1].trim() : '',
        templateType: tempMatch ? tempMatch[1].trim() : 'sequence-steps',
      };
    }
  }

  // Eğer XML blokları da parse edilemediyse, muhtemelen AI düz syntax basmıştır.
  // O zaman ham verinin tamamını syntax olarak kabul eden son kalkan:
  if (!data?.syntax && rawText && rawText.includes('infographic')) {
    data = {
      title: req.topic,
      syntax: rawText
        .replace(/```(xml|text|json|[\s\S]*?)?\n/g, '')
        .replace(/```/g, '')
        .trim(),
      pedagogicalNote: 'AI standart formatta çıktı veremedi, ancak ham kodlar kurtarıldı.',
      templateType: 'sequence-steps',
    };
  }

  if (!data?.syntax || typeof data.syntax !== 'string') {
    throw new AppError(
      'AI geçerli bir infografik syntax üretemedi. (Ne JSON ne XML blokları bulunamadı).',
      'INTERNAL_ERROR',
      500
    );
  }

  // Syntax normalization: "infographic" prefix yoksa template tipine göre ekle
  const normalizedSyntax = normalizeSyntax(data.syntax, data.templateType as string | undefined);

  return {
    syntax: normalizedSyntax,
    title: (data.title as string) ?? req.topic,
    pedagogicalNote: (data.pedagogicalNote as string) ?? '',
    templateType: (data.templateType as string) ?? 'sequence-steps',
  };
}

/**
 * Syntax'ı normalize eder: "infographic" prefix yoksa ekler.
 * Markdown code block işaretlerini temizler.
 */
function normalizeSyntax(syntax: string, templateType?: string): string {
  // Markdown code block temizle
  let cleaned = syntax
    .replace(/^```[\w-]*\n?/gm, '')
    .replace(/^```$/gm, '')
    .trim();

  // "infographic" ile başlamıyorsa prefix ekle
  if (!cleaned.toLowerCase().startsWith('infographic')) {
    const prefix = templateType
      ? `infographic ${templateType.toLowerCase()}`
      : 'infographic sequence-steps';
    cleaned = `${prefix}\n${cleaned}`;
  }

  return cleaned;
}

/**
 * Konu için örnek/demo syntax döndürür (API olmadan preview için).
 */
export function getDemoSyntax(topic: string, ageGroup: string): string {
  return `infographic compare-binary-horizontal
title ${topic || 'Konu Başlığı'} — ${ageGroup} Yaş Grubu Karşılaştırması
data
  left
    title Özellik A
    items
      - Birinci özellik açıklaması
      - İkinci özellik açıklaması
      - Üçüncü özellik açıklaması
  right
    title Özellik B
    items
      - Birinci özellik açıklaması
      - İkinci özellik açıklaması
      - Üçüncü özellik açıklaması`;
}

/**
 * Sequence-steps demo (basit liste için)
 */
export function getDemoSequenceSyntax(topic: string, ageGroup: string): string {
  return `infographic sequence-steps
title ${topic || 'Konu Başlığı'} — ${ageGroup} Yaş Grubu
data
  steps
    - label 1. Adım
      desc Konuya giriş ve temel kavramlar
    - label 2. Adım
      desc Örnekler ve uygulama
    - label 3. Adım
      desc Pekiştirme ve değerlendirme`;
}

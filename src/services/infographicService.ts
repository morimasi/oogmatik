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

  return `Sen bir özel eğitim uzmanı ve görsel içerik tasarımcısısın.
"${sanitizeInput(req.topic)}" konusu için @antv/infographic kütüphanesinin declarative syntax formatında eğitici bir infografik oluştur.

HEDEF KİTLE:
- Yaş grubu: ${req.ageGroup} (${ageConstraint})
- Öğrenme profili: ${req.profile} — ${profileGuideline}
- Dil: ${lang === 'tr' ? 'Türkçe' : 'İngilizce'}

@ANTV/INFOGRAPHIC SYNTAX KURALLARI:
Aşağıdaki formatlardan birini seç (konuya en uygun olanı):

1. Adım Sırası (sequence-steps): Süreç/prosedür için
\`\`\`
infographic sequence-steps
title Başlık
data
  steps
    - label 1. Adım
      desc Açıklama
    - label 2. Adım
      desc Açıklama
\`\`\`

2. Liste (list-row): Kavramlar/bilgiler için
\`\`\`
infographic list-row-simple-horizontal-arrow
title Başlık
data
  lists
    - label Kavram 1
      desc Açıklama
    - label Kavram 2
      desc Açıklama
\`\`\`

3. Karşılaştırma (compare-binary): İki kavramı karşılaştırmak için
\`\`\`
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
\`\`\`

4. Hiyerarşi (hierarchy-structure): Kavramsal harita için
\`\`\`
infographic hierarchy-structure
title Başlık
data
  root
    label Ana Kavram
    children
      - label Alt Kavram 1
      - label Alt Kavram 2
\`\`\`

5. Zaman Çizelgesi (sequence-timeline): Tarihsel/kronolojik için
\`\`\`
infographic sequence-timeline
title Başlık
data
  events
    - date Tarih/Dönem
      title Olay
      desc Açıklama
\`\`\`

ÖNEMLİ KURALLAR:
- pedagogicalNote alanını mutlaka ekle (öğretmene "neden bu format" açıklaması)
- Klinik tanı koyucu dil kullanma ("disleksisi var" yerine "disleksi desteğine ihtiyacı var")
- İçeriği ${ageConstraint.split(',')[0]} ilkesine göre sınırla
- Türkçe başlık ve açıklamalar kullan
- title değeri konuyu özetleyen kısa bir cümle olsun

YANIT FORMATI (JSON):
{
  "syntax": "buraya tam @antv/infographic syntax gelecek",
  "title": "İnfografik başlığı",
  "pedagogicalNote": "Bu infografik formatı seçildi çünkü...",
  "templateType": "kullanılan template adı"
}`;
}

/**
 * Gemini AI ile @antv/infographic syntax üretir.
 * Bora Demir standardı: AppError formatı, retry yok (tek seferlik UI).
 */
export async function generateInfographicSyntax(
  req: InfographicRequest
): Promise<InfographicResult> {
  const prompt = buildPrompt(req);

  const schema = {
    type: 'object',
    properties: {
      syntax: { type: 'string', description: '@antv/infographic declarative syntax' },
      title: { type: 'string', description: 'İnfografik başlığı' },
      pedagogicalNote: { type: 'string', description: 'Öğretmen için pedagojik açıklama' },
      templateType: { type: 'string', description: 'Kullanılan template tipi' },
    },
    required: ['syntax', 'title', 'pedagogicalNote', 'templateType'],
  };

  const response = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt, schema }),
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => 'Bilinmeyen hata');
    throw new Error(`AI servisi yanıt vermedi (${response.status}): ${errorText}`);
  }

  const json = await response.json();

  if (!json.success) {
    throw new Error(json.error?.message ?? 'AI yanıt başarısız');
  }

  const data = json.data as InfographicResult;

  if (!data?.syntax || typeof data.syntax !== 'string') {
    throw new Error('AI geçerli bir infografik syntax üretemedi');
  }

  return {
    syntax: data.syntax,
    title: data.title ?? req.topic,
    pedagogicalNote: data.pedagogicalNote ?? '',
    templateType: data.templateType ?? 'list',
  };
}

/**
 * Konu için örnek/demo syntax döndürür (API olmadan preview için).
 */
export function getDemoSyntax(topic: string, ageGroup: string): string {
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

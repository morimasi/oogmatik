import type { SariKitapActivityType, SariKitapConfig } from '../../../types/sariKitap';

// ─── Paylaşımlı System Instruction ──────────────────────────────
export const SARI_KITAP_SYSTEM_INSTRUCTION = `Sen bir disleksi eğitim uzmanısın. Hızlı okumaya geçiş ve bellek geliştirme amaçlı profesyonel "Sarı Kitap" çalışma kağıtları üretiyorsun.

KURALLAR:
1. Her zaman Türkçe yanıt ver.
2. Her aktivitede "pedagogicalNote" alanı ZORUNLU — öğretmene bu formatın neden kullanıldığını açıkla.
3. Tanı koyucu dil ASLA kullanma: "disleksisi var" yerine "okuma desteğine ihtiyaç duyan öğrenci".
4. JSON formatında yanıt ver — başka hiçbir açıklama ekleme.
5. Hece ayırma Türkçe fonetik kurallara göre yapılmalı.
6. İçerik bir A4 sayfasını tam dolduracak şekilde, kompakt ve zengin olmalıdır.
7. Yaş grubuna uygun kelime karmaşıklığı kullan:
   - 5-7: basit, kısa kelimeler (max 2 hece)
   - 8-10: orta uzunlukta kelimeler (max 3 hece)
   - 11-13: daha karmaşık kelimeler
   - 14+: serbest

ÇIKTI KALİTESİ:
- Metinler tutarlı, ilgi çekici ve pedagojik olarak yapılandırılmış olmalı.
- Sayfa düzeni dopdolu ve profesyonel bir çalışma kağıdı görünümünde olmalı.
- Boşluklar minimal tutulmalı, içerik maksimize edilmelidir.

ÇIKTI FORMATI (JSON):
{
  "title": "string",
  "pedagogicalNote": "string (ZORUNLU)",
  "instructions": "string",
  "targetSkills": ["string"],
  "rawText": "string"
}`;

// ─── Prompt Builder Tipleri ──────────────────────────────────────
export type PromptBuilderFn = (config: SariKitapConfig, sourcePdfRef?: string) => string;

function ageGroupDescription(ageGroup: string): string {
  switch (ageGroup) {
    case '5-7': return '5-7 yaş (okul öncesi / 1. sınıf), basit ve kısa kelimeler';
    case '8-10': return '8-10 yaş (2-4. sınıf), orta düzey kelimeler';
    case '11-13': return '11-13 yaş (5-7. sınıf), karmaşık kelimeler';
    case '14+': return '14+ yaş (lise), gelişmiş kelime dağarcığı';
    default: return '8-10 yaş';
  }
}

function difficultyDescription(difficulty: string): string {
  switch (difficulty) {
    case 'Başlangıç': return 'Başlangıç seviyesi — kısa cümleler, sık kullanılan kelimeler';
    case 'Orta': return 'Orta seviye — orta uzunlukta paragraflar';
    case 'İleri': return 'İleri seviye — uzun paragraflar, nadir kelimeler';
    case 'Uzman': return 'Uzman seviyesi — karmaşık metin yapısı';
    default: return 'Başlangıç seviyesi';
  }
}

// ─── Modül-Spesifik Prompt Builder'lar ───────────────────────────

export function buildPencerePrompt(config: SariKitapConfig, _sourcePdfRef?: string): string {
  return `${SARI_KITAP_SYSTEM_INSTRUCTION}

GÖREV: "Pencere Okuma" formatında metin üret.
FORMAT: Metindeki belirli heceler görünür, diğerleri maskelenir. Öğrenci sadece "pencere" içindeki heceleri okur.

PARAMETRELER:
- Yaş Grubu: ${ageGroupDescription(config.ageGroup)}
- Zorluk: ${difficultyDescription(config.difficulty)}
- Konular: ${config.topics.join(', ')}
- Hedef beceriler: ${config.targetSkills.join(', ')}
${_sourcePdfRef ? `- Referans PDF: ${_sourcePdfRef}` : ''}

15-20 cümlelik, A4 sayfasını dolduracak uzunlukta bir metin üret. İlk cümle mutlaka kolay olsun (güven inşası). Metin pedagojik olarak tutarlı bir hikaye veya bilgilendirici metin olmalıdır.`;
}

export function buildNoktaPrompt(config: SariKitapConfig, _sourcePdfRef?: string): string {
  return `${SARI_KITAP_SYSTEM_INSTRUCTION}

GÖREV: "Nokta Takibi" formatında metin üret.
FORMAT: Her hece altında nokta işareti bulunur. Göz takibi hızını artırır, satır atlamayı önler.

PARAMETRELER:
- Yaş Grubu: ${ageGroupDescription(config.ageGroup)}
- Zorluk: ${difficultyDescription(config.difficulty)}
- Konular: ${config.topics.join(', ')}

15-20 cümlelik, A4 sayfasını dolduracak zenginlikte bir metin üret. Kelimeler net hecelere ayrılabilir olmalı.`;
}

export function buildKopruPrompt(config: SariKitapConfig, _sourcePdfRef?: string): string {
  return `${SARI_KITAP_SYSTEM_INSTRUCTION}

GÖREV: "Köprü Okuma" formatında metin üret.
FORMAT: Heceleri birbirine bağlayan yay/köprü sembolleri ile göz sıçrama egzersizi.

PARAMETRELER:
- Yaş Grubu: ${ageGroupDescription(config.ageGroup)}
- Zorluk: ${difficultyDescription(config.difficulty)}
- Konular: ${config.topics.join(', ')}

15-20 cümlelik, A4 sayfasını dolduracak uzunlukta bir metin üret. Çok heceli kelimeler tercih et.`;
}

export function buildCiftMetinPrompt(config: SariKitapConfig, _sourcePdfRef?: string): string {
  return `${SARI_KITAP_SYSTEM_INSTRUCTION}

GÖREV: "Çift Metin" formatında İKİ AYRI hikaye üret.
FORMAT: İki farklı hikaye iç içe geçirilir. Öğrenci dikkatini bölerek ayrıştırma pratiği yapar.

ÖZEL ÇIKTI FORMATI (JSON):
{
  "title": "string",
  "pedagogicalNote": "string (ZORUNLU)",
  "instructions": "string",
  "targetSkills": ["string"],
  "sourceTexts": {
    "a": { "title": "Hikaye A Başlığı", "text": "Hikaye A metni" },
    "b": { "title": "Hikaye B Başlığı", "text": "Hikaye B metni" }
  }
}

PARAMETRELER:
- Yaş Grubu: ${ageGroupDescription(config.ageGroup)} (NOT: Sadece 11-13 ve 14+ yaş)
- Zorluk: ${difficultyDescription(config.difficulty)}
- Konular: ${config.topics.join(', ')}

Her hikaye en az 10-12 cümle olsun. İki hikaye birbirinden tamamen farklı konularda olmalı. Sayfayı tam dolduracak kadar içerik üret.`;
}

export function buildBellekPrompt(config: SariKitapConfig, _sourcePdfRef?: string): string {
  return `${SARI_KITAP_SYSTEM_INSTRUCTION}

GÖREV: "Bellek Egzersizi" formatında kelime blokları üret.
FORMAT: Kelimeler ızgara şeklinde düzenlenir. Görsel hafıza ve hızlı tanıma çalışması.

ÖZEL ÇIKTI FORMATI (JSON):
{
  "title": "string",
  "pedagogicalNote": "string (ZORUNLU)",
  "instructions": "string",
  "targetSkills": ["string"],
  "wordBlocks": [["kelime1", "kelime2", ...], ["kelime3", "kelime4", ...]]
}

PARAMETRELER:
- Yaş Grubu: ${ageGroupDescription(config.ageGroup)}
- Zorluk: ${difficultyDescription(config.difficulty)}
- Konular: ${config.topics.join(', ')}

Toplam 40-50 kelime üret. Kelimeler 4-5'li gruplar halinde (bloklar) olsun. Sayfayı ızgara şeklinde tam doldurmalıdır.`;
}

export function buildHizliOkumaPrompt(config: SariKitapConfig, _sourcePdfRef?: string): string {
  return `${SARI_KITAP_SYSTEM_INSTRUCTION}

GÖREV: "Hızlı Okuma" formatında kelime blokları üret.
FORMAT: Kelimeler blok halinde seriyal gösterilir. Ritmik okuma çalışması.

ÖZEL ÇIKTI FORMATI (JSON):
{
  "title": "string",
  "pedagogicalNote": "string (ZORUNLU)",
  "instructions": "string",
  "targetSkills": ["string"],
  "wordBlocks": [["kelime1", "kelime2", "kelime3"], ...]
}

PARAMETRELER:
- Yaş Grubu: ${ageGroupDescription(config.ageGroup)}
- Zorluk: ${difficultyDescription(config.difficulty)}
- Konular: ${config.topics.join(', ')}

Her satırda 3-4 kelime, toplam 20-25 satır üret. Sayfayı tam dolduracak kadar içerik olmalı.`;
}

// ─── Prompt Router ───────────────────────────────────────────────

const PROMPT_BUILDERS: Record<SariKitapActivityType, PromptBuilderFn> = {
  pencere: buildPencerePrompt,
  nokta: buildNoktaPrompt,
  kopru: buildKopruPrompt,
  cift_metin: buildCiftMetinPrompt,
  bellek: buildBellekPrompt,
  hizli_okuma: buildHizliOkumaPrompt,
};

export function getPromptBuilder(type: SariKitapActivityType): PromptBuilderFn {
  return PROMPT_BUILDERS[type];
}

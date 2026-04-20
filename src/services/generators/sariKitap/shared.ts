import { SARI_KITAP_SOURCES } from '../../../kaynak/sari/sariKitapData.js';
import { 
  SariKitapActivityType, 
  SariKitapConfig,
  SariKitapSourceEntry 
} from '../../../types/sariKitap.js';

// ─── Paylaşımlı System Instruction ──────────────────────────────
export const SARI_KITAP_SYSTEM_INSTRUCTION = `Sen bir disleksi eğitim uzmanısın. Hızlı okumaya geçiş ve bellek geliştirme amaçlı profesyonel "Sarı Kitap" çalışma kağıtları üretiyorsun.

KURALLAR:
1. Her zaman Türkçe yanıt ver.
2. Tanı koyucu dil ASLA kullanma: "disleksisi var" yerine "okuma desteğine ihtiyaç duyan öğrenci".
3. JSON formatında yanıt ver — başka hiçbir açıklama ekleme.
4. Hece ayırma Türkçe fonetik kurallara göre yapılmalı.
5. İçerik bir A4 sayfasını tam dolduracak şekilde, kompakt ve zengin olmalıdır.
6. Yaş grubuna uygun kelime karmaşıklığı kullan:
   - 5-7: basit, kısa kelimeler (max 2 hece)
   - 8-10: orta uzunlukta kelimeler (max 3 hece)
   - 11-13: daha karmaşık kelimeler
   - 14+: serbest

STİL REHBERİ (SARI KİTAP):
- Metinler tutarlı, ilgi çekici ve pedagojik olarak yapılandırılmış olmalı.
- Sayfa düzeni dopdolu ve profesyonel bir çalışma kağıdı görünümünde olmalı.
- Boşluklar minimal tutulmalı, içerik maksimize edilmelidir.
- Zorluk seviyeleri arasında PROGRESİF (3x) artış olmalıdır (Uzunluk ve Karmaşıklık).
- Metinler gerçek hayat hikayeleri, doğa veya okul temalı olmalıdır.
- İlk cümle her zaman güven inşası için çok kolay olmalıdır.

ÇIKTI FORMATI (JSON):
{
  "title": "string",
  "instructions": "string",
  "targetSkills": ["string"],
  "rawText": "string"
}`;

function getReferenceExample(type: SariKitapActivityType): string {
  const examples = SARI_KITAP_SOURCES[type];
  if (!examples || examples.length === 0) return '';
  
  // Rastgele bir örnek seçerek AI'nın monotonlaşmasını önle
  const randomIndex = Math.floor(Math.random() * examples.length);
  const ex = examples[randomIndex];
  
  return `\nREFERANS ÖRNEK (Bu stile ve zorluğa uygun üret):\nBaşlık: ${ex.title}\nMetin: ${ex.text}\n`;
}

// ─── Prompt Builder Tipleri ──────────────────────────────────────
export type PromptBuilderFn = (config: SariKitapConfig, sourcePdfRef?: string) => string;

function ageGroupDescription(ageGroup: string): string {
  switch (ageGroup) {
    case '5-7': return '5-7 yaş (okul öncesi / 1. sınıf), basit ve kısa kelimeler (max 2 hece)';
    case '8-10': return '8-10 yaş (2-4. sınıf), orta düzey kelimeler (max 3-4 hece)';
    case '11-13': return '11-13 yaş (5-7. sınıf), karmaşık kelimeler ve soyut kavramlar';
    case '14+': return '14+ yaş (lise), akademik ve teknik kelime dağarcığı';
    default: return '8-10 yaş';
  }
}

function difficultyDescription(difficulty: string): string {
  switch (difficulty) {
    case 'Başlangıç': return 'Başlangıç seviyesi — ~60 kelime, 10-12 kısa cümle, çok basit yapı';
    case 'Orta': return 'Orta seviye (3x Başlangıç) — ~180 kelime, 25-30 cümle, birleşik cümle yapıları';
    case 'İleri': return 'İleri seviye (3x Orta) — ~500 kelime, 50+ cümle, tam dolu A4 sayfa yoğunluğu, kompleks yapılar';
    case 'Uzman': return 'Uzman seviyesi (Maksimum) — Maksimum A4 yoğunluğu, akademik/teknik dil, üst düzey okuma hızı gerektiren içerik';
    default: return 'Başlangıç seviyesi';
  }
}

// ─── Modül-Spesifik Prompt Builder'lar ───────────────────────────

export function buildPencerePrompt(config: SariKitapConfig, _sourcePdfRef?: string): string {
  return `${SARI_KITAP_SYSTEM_INSTRUCTION}
${getReferenceExample('pencere')}

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
${getReferenceExample('nokta')}

GÖREV: "Nokta Takibi" formatında metin üret.
FORMAT: Her KELİMENİN altında nokta işareti bulunur (hece altında DEĞİL). Göz takibi hızını artırır, kelime tanıma otomatikliğini geliştirir.

PARAMETRELER:
- Yaş Grubu: ${ageGroupDescription(config.ageGroup)}
- Zorluk: ${difficultyDescription(config.difficulty)}
- Konular: ${config.topics.join(', ')}

A4 sayfasını TAMAMEN dolduracak, 25-40 cümlelik uzun bir metin üret. İçerik kompakt ve dopdolu olmalıdır. Boşluk minimumda tutulmalıdır.`;
}

export function buildKopruPrompt(config: SariKitapConfig, _sourcePdfRef?: string): string {
  return `${SARI_KITAP_SYSTEM_INSTRUCTION}
${getReferenceExample('kopru')}

GÖREV: "Köprü Okuma" formatında metin üret.
FORMAT: Her KELİME arasına yay/köprü işareti konur (hece arası DEĞİL). Köprü 4 sesli harf uzunluğunda, kelimeler arası 1 karakter boşluk. Göz sıçrama egzersizi.

PARAMETRELER:
- Yaş Grubu: ${ageGroupDescription(config.ageGroup)}
- Zorluk: ${difficultyDescription(config.difficulty)}
- Konular: ${config.topics.join(', ')}

A4 sayfasını TAMAMEN dolduracak, 25-40 cümlelik uzun metin üret. Kompakt ve dopdolu A4 sayfası.`;
}

export function buildCiftMetinPrompt(config: SariKitapConfig, _sourcePdfRef?: string): string {
  return `${SARI_KITAP_SYSTEM_INSTRUCTION}
${getReferenceExample('cift_metin')}

GÖREV: "Çift Metin" formatında İKİ AYRI hikaye üret.
FORMAT: İki farklı hikaye iç içe geçirilir. Öğrenci dikkatini bölerek ayrıştırma pratiği yapar.

ÖZEL ÇIKTI FORMATI (JSON):
{
  "title": "string",
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
${getReferenceExample('bellek')}

GÖREV: "4 Fazlı Bellek Kelime Etkinliği" üret.
FORMAT: Profesyonel bellek etkinliği. 4 aşamadan oluşur:
A) Çalışma: Kelimeler grid'de gösterilir (öğrenci ezberler)
B) Hatırlama: Aynı grid ama bazı kelimeler boş (öğrenci yazar)
C) Karışık: Orijinal kelimeler + dikkat dağıtıcılar karışık liste (doğru olanı işaretle)
D) Cümle: Kelimelerle cümle tamamlama

ÖZEL ÇIKTI FORMATI (JSON):
{
  "title": "string",
  "instructions": "string",
  "targetSkills": ["string"],
  "wordBlocks": [["kelime1", "kelime2", ...], ["kelime3", "kelime4", ...]],
  "memoryData": {
    "studyWords": ["kelime1", "kelime2", ...],
    "blankIndices": [0, 3, 5, ...],
    "distractors": ["yanıltıcı1", "yanıltıcı2", ...],
    "sentencePrompts": ["______ ile ______ birlikte oynadi.", ...]
  }
}

PARAMETRELER:
- Yaş Grubu: ${ageGroupDescription(config.ageGroup)}
- Zorluk: ${difficultyDescription(config.difficulty)}
- Konular: ${config.topics.join(', ')}

Toplam 16-20 kelime üret. 8-10 dikkat dağıtıcı kelime ekle. 4 cümle şablonu üret. A4 sayfasını 4 bölümle kompakt olarak doldur.`;
}

export function buildHizliOkumaPrompt(config: SariKitapConfig, _sourcePdfRef?: string): string {
  return `${SARI_KITAP_SYSTEM_INSTRUCTION}
${getReferenceExample('hizli_okuma')}

GÖREV: "Hızlı Okuma" formatında kelime blokları üret.
FORMAT: Kelimeler blok halinde seriyal gösterilir. Ritmik okuma çalışması. A4 SAYFASINI TAMAMEN doldur.

ÖZEL ÇIKTI FORMATI (JSON):
{
  "title": "string",
  "instructions": "string",
  "targetSkills": ["string"],
  "wordBlocks": [["kelime1", "kelime2", "kelime3"], ...]
}

PARAMETRELER:
- Yaş Grubu: ${ageGroupDescription(config.ageGroup)}
- Zorluk: ${difficultyDescription(config.difficulty)}
- Konular: ${config.topics.join(', ')}

Her satırda 3-4 kelime, toplam 35-40 satır üret. A4 sayfasını TAMAMEN doldur. Boşluk bırakma. Kompakt ve dopdolu bir çalışma kağıdı olmalı.`;
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

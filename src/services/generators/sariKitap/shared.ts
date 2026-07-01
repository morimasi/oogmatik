import { SARI_KITAP_SOURCES } from '../../../kaynak/sari/sariKitapData.js';
import { 
  SariKitapActivityType, 
  SariKitapConfig,
  SariKitapSourceEntry 
} from '../../../types/sariKitap.js';

// ─── Paylaşımlı System Instruction ──────────────────────────────
export const SARI_KITAP_SYSTEM_INSTRUCTION = `Sen bir disleksi eğitim uzmanısın. Hızlı okumaya geçiş ve bellek geliştirme amaçlı profesyonel "BursaDisleksi Hızlı Okuma Stüdyosu" çalışma kağıtları üretiyorsun.

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
7. BENZERSİZLİK VE ÖZGÜNLÜK (RADİKAL): Her metin tamamen yeni, özgün ve yaratıcı olmalıdır. Klişelerden kaçın. Seçilen konuyu (Edebiyat, Sanat, Müzik, Spor, Teknoloji, Gerçek Hayat, Masal, Hikaye, Biyografi, Fıkra) derinlemesine kurgula. Asla birbirinin aynısı metinler üretme. Her üretimde farklı karakterler, farklı olaylar ve farklı bir dil örgüsü kullan.
8. KONU SADAKATİ (STABİL): 
   - SANAT & MÜZİK: Estetik, kültürel terimler, enstrümanlar ve sanat akımları ile harmanlanmış zengin metinler.
   - TEKNOLOJİ & SPOR: Modern kavramlar, dinamik anlatımlar, inovasyon ve performans odaklı terminoloji.
   - BİYOGRAFİ & FIKRA: Karakter derinliği olan yaşam öyküleri veya disleksi dostu, zekice kurgulanmış mizahi metinler.

9. BAŞLIK VE METİN ÖZGÜNLÜĞÜ: Her etkinliğin başlığı (title) konuyla ilgili ve daha önce hiç kullanılmamış, yaratıcı bir başlık olmalıdır. Örn: "Sanatın Işığı", "Teknoloji Gezginleri" vb.

STİL REHBERİ (BURSADİSLEKSİ HIZLI OKUMA):
- Metinler tutarlı, ilgi çekici ve pedagojik olarak yapılandırılmış olmalı.
- Sayfa düzeni dopdolu ve profesyonel bir çalışma kağıdı görünümünde olmalı.
- Boşluklar minimal tutulmalı, içerik maksimize edilmelidir.
- Zorluk seviyeleri arasında PROGRESİF (3x) artış olmalıdır.
- Metinler mutlaka SEÇİLEN KONU etrafında DERİNLİMESİNE kurgulanmalıdır. Konunun dokusunu metne yansıt.
- İlk cümle her zaman güven inşası için çok kolay olmalıdır.

ÇIKTI FORMATI (JSON):
{
  "title": "Benzersiz ve yaratıcı başlık",
  "instructions": "Öğrenciye yönelik net talimat",
  "targetSkills": ["Geliştirilen beceriler"],
  "rawText": "Konuya tam uyumlu, benzersiz ve zengin metin",
}`;

function getReferenceExample(type: SariKitapActivityType): string {
  const examples = SARI_KITAP_SOURCES[type];
  if (!examples || examples.length === 0) return '';
  
  // Rastgele bir örnek seçerek AI'nın monotonlaşmasını önle
  const randomIndex = Math.floor(Math.random() * examples.length);
  const ex = examples[randomIndex];
  
  return `\nREFERANS (SADECE YAPI ÖRNEĞİDİR, BU METNİ KLONLAMA, SEÇİLEN KONUDA YEPYENİ VE ÖZGÜN BİR METİN ÜRET):\nBAŞLIK: ${ex.title}\nMETİN: ${ex.text}\n`;
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

function getRandomSeed(): string {
    return Math.random().toString(36).substring(7) + Date.now().toString();
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
  const c = config as any;
  return `${SARI_KITAP_SYSTEM_INSTRUCTION}
${getReferenceExample('pencere')}

GÖREV: "Pencere Okuma" formatında metin üret.
FORMAT: Metindeki belirli heceler görünür, diğerleri maskelenir. Öğrenci sadece "pencere" içindeki heceleri okur.

PARAMETRELER:
- Yaş Grubu: ${ageGroupDescription(config.ageGroup)}
- Zorluk: ${difficultyDescription(config.difficulty)}
- Konular: ${config.topics.join(', ')}
- Hedef beceriler: ${config.targetSkills.join(', ')}
- Benzersizlik Anahtarı: ${config.seed || getRandomSeed()}
- Pencere Boyutu (Kelime Sayısı): ${c.windowSize || 2}
- Gösterim Hızı: ${c.revealSpeed || 'orta'}
- Ardışık Gösterim: ${c.showSequential ? 'Evet' : 'Hayır'}
${_sourcePdfRef ? `- Referans PDF: ${_sourcePdfRef}` : ''}

15-20 cümlelik, A4 sayfasını dolduracak uzunlukta bir metin üret. İlk cümle mutlaka kolay olsun (güven inşası). Metin pedagojik olarak tutarlı bir hikaye veya bilgilendirici metin olmalıdır. Seviyeye uygun ve seçilen konuya tam uyumlu bir metin kurgula. Çıktı sadece geçerli bir JSON olmalıdır.`;
}

export function buildNoktaPrompt(config: SariKitapConfig, _sourcePdfRef?: string): string {
  const c = config as any;
  return `${SARI_KITAP_SYSTEM_INSTRUCTION}
${getReferenceExample('nokta')}

GÖREV: "Nokta Takibi" formatında metin üret.
FORMAT: Her kelimenin veya hecenin altında nokta işareti bulunur. Göz takibi hızını artırır, kelime tanıma otomatikliğini geliştirir.

PARAMETRELER:
- Yaş Grubu: ${ageGroupDescription(config.ageGroup)}
- Zorluk: ${difficultyDescription(config.difficulty)}
- Konular: ${config.topics.join(', ')}
- Benzersizlik Anahtarı: ${config.seed || getRandomSeed()}
- Nokta Yerleşimi: ${c.dotPlacement || 'kelime'} (Buna uygun metin yoğunluğu ayarla)
- Nokta Yoğunluğu: ${c.dotDensity || 1}
- Nokta Stili: ${c.dotStyle || 'yuvarlak'}
- Kılavuz Çizgi Göster: ${c.showGuideLine ? 'Evet' : 'Hayır'}

15-20 cümlelik, A4 sayfasını dolduracak uzunlukta bir metin üret. İçerik kompakt ve dopdolu olmalıdır. Boşluk minimumda tutulmalıdır. Konu '${config.topics.join(', ')}' olmalı ve bu konunun gerektirdiği 'KONU SADAKATİ' (v2) kurallarına KESİN bir bağlılıkla uyulmalıdır. Her üretim tamamen özgün olmalıdır. Çıktı sadece geçerli bir JSON olmalıdır.`;
}

export function buildKopruPrompt(config: SariKitapConfig, _sourcePdfRef?: string): string {
  const c = config as any;
  return `${SARI_KITAP_SYSTEM_INSTRUCTION}
${getReferenceExample('kopru')}

GÖREV: "Köprü Okuma" formatında metin üret.
FORMAT: Göz sıçrama egzersizi için kelimeler veya heceler arasına yay/köprü işareti konur.

PARAMETRELER:
- Yaş Grubu: ${ageGroupDescription(config.ageGroup)}
- Zorluk: ${difficultyDescription(config.difficulty)}
- Konular: ${config.topics.join(', ')}
- Benzersizlik Anahtarı: ${config.seed || getRandomSeed()}
- Köprü Yerleşimi: ${c.bridgePlacement || 'kelime'}
- Köprü Stili: ${c.bridgeStyle || 'yay'}
- Metin Yoğunluğu: ${c.textDensity || 'orta'}

15-20 cümlelik, ${c.textDensity === 'yüksek' ? 'yoğun' : c.textDensity === 'düşük' ? 'seyrek' : 'dengeli'} bir metin üret. Kompakt ve dopdolu A4 sayfası. Konu '${config.topics.join(', ')}' olmalı ve bu konunun gerektirdiği 'KONU SADAKATİ' (v2) kuralları KESİN uygulanmalıdır. Çıktı sadece geçerli bir JSON olmalıdır.`;
}

export function buildCiftMetinPrompt(config: SariKitapConfig, _sourcePdfRef?: string): string {
  const c = config as any;
  const interleaveModeLabel = c.interleaveMode === 'kelime' ? 'kelime kelime' : c.interleaveMode === 'satir' ? 'satır satır' : 'paragraf paragraf';
  
  return `${SARI_KITAP_SYSTEM_INSTRUCTION}
${getReferenceExample('cift_metin')}

GÖREV: "Çift Metin" formatında İKİ AYRI hikaye üret.
FORMAT: İki farklı hikaye iç içe geçirilir. Öğrenci dikkatini bölerek ayrıştırma pratiği yapar.

GÖRSEL AYARLAR (AI içeriği bu ayarlara uygun üretmelidir):
- Karışım Modu: ${interleaveModeLabel}
- Hikaye A Stili: ${c.sourceAStyle || 'normal'} (metin A'nın genel karakteristiği)
- Hikaye B Stili: ${c.sourceBStyle || 'normal'} (metin B'nin genel karakteristiği)
- ${c.interleaveMode === 'kelime' ? 'Kelime kelime karışım: Her metin kısa ve net cümleler içermeli' : c.interleaveMode === 'satir' ? 'Satır satır karışım: Her metin dengeli satır uzunluklarına sahip olmalı' : 'Paragraf paragraf karışım: Her metin net paragraf bölümlerine sahip olmalı'}

ÖZEL ÇIKTI FORMATI (JSON):
{
  "title": "string",
  "instructions": "string",
  "targetSkills": ["string"],
  "sourceTexts": {
    "a": { 
      "title": "Hikaye A Başlığı", 
      "text": "Hikaye A metni",
      "questions": [
        { "q": "Metinle ilgili 5N1K sorusu 1", "a": "Cevap 1" },
        { "q": "Metinle ilgili 5N1K sorusu 2", "a": "Cevap 2" },
        { "q": "Metinle ilgili 5N1K sorusu 3", "a": "Cevap 3" }
      ]
    },
    "b": { 
      "title": "Hikaye B Başlığı", 
      "text": "Hikaye B metni",
      "questions": [
        { "q": "Metinle ilgili 5N1K sorusu 1", "a": "Cevap 1" },
        { "q": "Metinle ilgili 5N1K sorusu 2", "a": "Cevap 2" },
        { "q": "Metinle ilgili 5N1K sorusu 3", "a": "Cevap 3" }
      ]
    }
  }
}

PARAMETRELER:
- Yaş Grubu: ${ageGroupDescription(config.ageGroup)} (NOT: Sadece 11-13 ve 14+ yaş)
- Zorluk: ${difficultyDescription(config.difficulty)}
- Konular: ${config.topics.join(', ')}
- Hedef Beceriler: ${config.targetSkills.join(', ')}
- Benzersizlik Anahtarı: ${config.seed || getRandomSeed()}
- Kaynak A Stili: ${c.sourceAStyle || 'normal'}
- Kaynak B Stili: ${c.sourceBStyle || 'bold'}
- Karışım Oranı: ${c.interleaveRatio || 1}
${_sourcePdfRef ? `- Referans PDF: ${_sourcePdfRef}` : ''}

Her hikaye en az 10-15 cümle olsun. İki hikaye birbirinden tamamen farklı konularda olmalı ama seçilen konu '${config.topics.join(', ')}' etrafında şekillenmeli. 'KONU SADAKATİ' (v2) kurallarını her iki metne de KESİN uygula. A4 sayfasını taşmayacak kadar kompakt ve zengin içerik üret. Her bir hikaye için 3 adet 5N1K (Kim, Ne, Nerede vb.) sorusu mutlaka eklenmelidir. Her üretim benzersiz ve yaratıcı olmalıdır. Çıktı sadece geçerli bir JSON olmalıdır.`;
}

export function buildBellekPrompt(config: SariKitapConfig, _sourcePdfRef?: string): string {
  const c = config as any;
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
- Benzersizlik Anahtarı: ${config.seed || getRandomSeed()}
- Blok Sayısı: ${c.blockCount || 12}
- Blok Boyutu: ${c.blockSize || 'orta'}
- Kategori: ${c.category || 'karışık'}
- Tekrar Sayısı: ${c.repetitionCount || 2}
- Cümle Sayısı: ${c.sentenceLines || 4}

Toplam ${c.blockCount || 12} kelime üret. ${c.distractorRatio === 'yüksek' ? 12 : c.distractorRatio === 'düşük' ? 5 : 8} dikkat dağıtıcı kelime ekle. ${c.sentenceLines || 4} cümle şablonu üret. A4 sayfasını 4 bölümle kompakt olarak doldur. Kelimeler mutlaka '${c.category && c.category !== 'karışık' ? c.category : config.topics.join(', ')}' konusuyla ilgili olmalıdır. 'KONU SADAKATİ' kurallarını KESİN uygula ve metni benzersiz hale getir. Çıktı sadece geçerli bir JSON olmalıdır.`;
}

export function buildHizliOkumaPrompt(config: SariKitapConfig, _sourcePdfRef?: string): string {
  const c = config as any;
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
- Benzersizlik Anahtarı: ${config.seed || getRandomSeed()}
- Blok Başına Kelime: ${c.wordsPerBlock || 3}
- Satır Sayısı: ${c.blockRows || 10} (Otomatik doldurma ${c.autoFill ? 'Açık, sayfa dolana kadar satır ekle' : 'Kapalı'})
- Sütun Modu: ${c.columnMode || 'tek'}
- Ritmik Mod: ${c.rhythmicMode ? 'Aktif' : 'Pasif'}

Her satırda ${c.wordsPerBlock || 3} kelime, toplam ${c.autoFill ? '35-40' : c.blockRows || 10} satır üret. A4 sayfasını TAMAMEN doldur. Boşluk bırakma. Kompakt ve dopdolu bir çalışma kağıdı olmalı. Kelimeler '${config.topics.join(', ')}' konusuyla ilgili ve KESİNLİKLE benzersiz olmalıdır. 'KONU SADAKATİ' kuralları her satırda hissedilmelidir. Çıktı sadece geçerli bir JSON olmalıdır.`;
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

type SariKitapPromptOptions = {
  topics?: unknown;
  topic?: unknown;
};

export function getSariKitapPromptTopic(options: unknown): string {
  if (typeof options !== 'object' || options === null) {
    return 'Genel';
  }

  const payload = options as SariKitapPromptOptions;
  const maybeTopics = payload.topics;
  if (Array.isArray(maybeTopics) && maybeTopics.length > 0) {
    return maybeTopics.join(', ');
  }

  const maybeTopic = payload.topic;
  if (typeof maybeTopic === 'string' && maybeTopic.trim()) {
    return maybeTopic.trim();
  }

  return 'Genel';
}

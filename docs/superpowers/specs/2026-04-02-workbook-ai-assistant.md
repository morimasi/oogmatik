# Calisma Kitapcigi AI Asistan Sistemi — Tasarim Belgesi

**Tarih**: 2026-04-02
**Mimar**: Selin Arslan (AI Muhendisi)
**Durum**: Tasarim Asamasi
**Onay Gereksinimleri**: ozel-ogrenme-uzmani (pedagojik), ozel-egitim-uzmani (klinik)

---

## 1. Sistem Genel Bakis

### 1.1 Amac

Calisma Kitapcigi (Workbook) modulu icin entegre bir AI Asistan sistemi tasarlamak. Bu sistem, ogretmenlere:

1. **Akilli Icerik Onerileri** — ZPD analizi ile aktivite onerileri
2. **Gercek Zamanli Geri Bildirim** — Sayfa dengesizligi, zorluk dagilimi, tema tutarliligi
3. **Otomatik Tamamlama** — Eksik metadata, pedagojik not, onsoz uretimi

saglar.

### 1.2 Mevcut Durum Analizi

```
MEVCUT AI FONKSIYONLARI (WorkbookView.tsx):
- generateWithSchema() → Onsoz uretimi (satir 363)
- evaluateContent() → Pedagojik analiz (satir 408)

MEVCUT CACHE MEKANIZMASI (cacheService.ts):
- IndexedDB tabanli (DB_NAME: 'DyslexiaAICache')
- STORE_NAME: 'generations' (exact match caching)
- DRAFT_STORE_NAME: 'drafts' (session state)
- generateKey(): activityType + JSON.stringify(options)
```

### 1.3 Teknik Kisitlar

| Kisit | Deger | Aciklama |
|-------|-------|----------|
| Model | `gemini-2.5-flash` | Sabit, degistirilemez |
| Max Token/Istek | 600 | Maliyet optimizasyonu |
| Rate Limit | 100 istek/saat/kullanici | `rateLimiter.ts` |
| Cache TTL | 10 dakika | Prompt cache |
| Batch Size | 5 | Grup isleme |

---

## 2. AI Asistan Mimarisi

### 2.1 Servis Yapisi

```
src/services/
└── workbookAIAssistant/
    ├── index.ts                    ← Barrel export
    ├── WorkbookAIAssistant.ts      ← Ana orchestrator sinif
    ├── prompts/
    │   ├── contentSuggestions.ts   ← Smart content onerileri
    │   ├── realTimeFeedback.ts     ← Gercek zamanli geri bildirim
    │   └── autoComplete.ts         ← Otomatik tamamlama
    ├── schemas/
    │   ├── suggestionSchema.ts     ← JSON schema tanimlari
    │   ├── feedbackSchema.ts
    │   └── autoCompleteSchema.ts
    ├── cache/
    │   └── assistantCache.ts       ← AI Asistan ozel cache
    └── validators/
        └── contentValidator.ts     ← Hallucination prevention
```

### 2.2 Sinif Diagram

```typescript
// Ana Orchestrator
class WorkbookAIAssistant {
  private cache: AssistantCache;
  private validator: ContentValidator;

  // Smart Content Suggestions
  async suggestActivities(context: WorkbookContext): Promise<ActivitySuggestion[]>;
  async detectSkillGaps(items: CollectionItem[]): Promise<SkillGap[]>;
  async optimizeSequence(items: CollectionItem[]): Promise<SequenceOptimization>;

  // Real-time Feedback
  async analyzePageBalance(items: CollectionItem[]): Promise<BalanceAnalysis>;
  async analyzeDifficultyDistribution(items: CollectionItem[]): Promise<DifficultyAnalysis>;
  async checkThemeConsistency(items: CollectionItem[], settings: WorkbookSettings): Promise<ThemeAnalysis>;

  // Auto-Complete
  async fillMissingMetadata(item: CollectionItem): Promise<MetadataFill>;
  async generatePedagogicalNote(item: CollectionItem): Promise<string>;
  async generatePreface(settings: WorkbookSettings, items: CollectionItem[]): Promise<string>;
}
```

---

## 3. Prompt Sablonlari (ANATOMY v4)

### 3.1 Smart Content Suggestions — Aktivite Onerisi

```typescript
// prompts/contentSuggestions.ts

export const buildActivitySuggestionPrompt = (context: WorkbookContext): string => `
[SISTEM ROL: OZEL EGITIM MUFREDAT UZMANI]
MEB 2024-2025 ${context.gradeLevel}. sinif mufredatinda uzman, disleksi-sensitif ogretmen.

[OGRENCI PROFILI]
Tani: ${context.studentProfile?.diagnosis || 'belirtilmedi'}
Yas Grubu: ${context.studentProfile?.ageGroup || '8-10'}
Guclu Yanlar: ${context.studentProfile?.strengths?.join(', ') || 'belirtilmedi'}
Destek Alanlari: ${context.studentProfile?.challenges?.join(', ') || 'genel'}

[MEVCUT KITAPCIK DURUMU]
Toplam Sayfa: ${context.currentPageCount}
Aktivite Dagilimi:
${context.activityDistribution.map(d => `- ${d.type}: ${d.count} adet`).join('\n')}
Zorluk Dagilimi: Kolay ${context.difficultyDistribution.easy}%, Orta ${context.difficultyDistribution.medium}%, Zor ${context.difficultyDistribution.hard}%

[GOREV]
Kitapcigin pedagojik dengesini iyilestirmek icin en uygun 3 aktivite tur onerisi yap.
Her oneri icin:
1. Aktivite turu (ActivityType enum'dan)
2. Neden bu aktivite? (ZPD analizi)
3. Onerilent zorluk seviyesi
4. Hedef beceri alani

[KISITLAR]
- Ogrencinin ZPD (Yakin Gelisim Bolge) sinirlari icinde kal
- Mevcut aktivite dagilimini dengele (cok olan turlerden kacin)
- Disleksi dostu aktiviteleri oncelikle

[CIKTI]
SADECE asagidaki JSON semasina uygun cikti. Markdown, aciklama YASAK.
`;

// JSON Schema
export const activitySuggestionSchema = {
  type: 'OBJECT',
  properties: {
    suggestions: {
      type: 'ARRAY',
      items: {
        type: 'OBJECT',
        properties: {
          activityType: { type: 'STRING' },
          reason: { type: 'STRING' },
          recommendedDifficulty: { type: 'STRING', enum: ['Kolay', 'Orta', 'Zor'] },
          targetSkills: { type: 'ARRAY', items: { type: 'STRING' } },
          zpdJustification: { type: 'STRING' },
          priority: { type: 'NUMBER' }
        },
        required: ['activityType', 'reason', 'recommendedDifficulty', 'targetSkills']
      }
    },
    analysisNote: { type: 'STRING' }
  },
  required: ['suggestions', 'analysisNote']
};
```

### 3.2 Real-time Feedback — Sayfa Dengesi Analizi

```typescript
// prompts/realTimeFeedback.ts

export const buildPageBalancePrompt = (items: CollectionItem[]): string => `
[SISTEM ROL: EGITIM MATERYALI TASARIM UZMANI]
Calisma kitapcigi sayfa kompozisyonu ve pedagojik denge analizi uzmani.

[ANALIZ EDILECEK KITAPCIK]
Toplam Sayfa: ${items.length}
Sayfa Detaylari:
${items.map((item, idx) => `
Sayfa ${idx + 1}:
- Tur: ${item.activityType}
- Baslik: ${item.title}
- Zorluk: ${(item as any).difficulty || 'belirtilmedi'}
- Bilisssel Alan: ${(item as any).cognitiveDomain || 'belirtilmedi'}
`).join('')}

[DENETIM KRITERLERI]
1. Bilisssel Cok Yonluluk: Farkli bilisssel alanlarin (gorsel, sozel, mantik) dengeli dagilimi
2. Zorluk Gradyani: Kolay'dan Zor'a dogru kademeli artis (scaffolding)
3. Dikkat Suresi Uyumu: Ard arda 3'ten fazla yogun aktivite olmamali
4. Tema Tutarliligi: Aktiviteler arasinda mantiksal gecis
5. Disleksi Hassasiyeti: Metin agirlikli aktiviteler ard arda gelmemeli

[CIKTI]
{
  "overallScore": 0-100,
  "verdict": "Mukemmel" | "Iyi" | "Iyilestirilebilir" | "Kritik",
  "balanceIssues": [
    {
      "pageIndex": number,
      "issue": string,
      "severity": "low" | "medium" | "high",
      "suggestion": string
    }
  ],
  "strengths": [string],
  "recommendations": [string]
}
`;

export const pageBalanceSchema = {
  type: 'OBJECT',
  properties: {
    overallScore: { type: 'NUMBER' },
    verdict: { type: 'STRING', enum: ['Mukemmel', 'Iyi', 'Iyilestirilebilir', 'Kritik'] },
    balanceIssues: {
      type: 'ARRAY',
      items: {
        type: 'OBJECT',
        properties: {
          pageIndex: { type: 'NUMBER' },
          issue: { type: 'STRING' },
          severity: { type: 'STRING', enum: ['low', 'medium', 'high'] },
          suggestion: { type: 'STRING' }
        },
        required: ['pageIndex', 'issue', 'severity', 'suggestion']
      }
    },
    strengths: { type: 'ARRAY', items: { type: 'STRING' } },
    recommendations: { type: 'ARRAY', items: { type: 'STRING' } }
  },
  required: ['overallScore', 'verdict', 'balanceIssues', 'strengths', 'recommendations']
};
```

### 3.3 Auto-Complete — Pedagojik Not Uretimi

```typescript
// prompts/autoComplete.ts

export const buildPedagogicalNotePrompt = (item: CollectionItem): string => `
[SISTEM ROL: OZEL EGITIM PEDAGOJI UZMANI]
Disleksi, diskalkuli ve DEHB alanlarinda uzman, MEB mufredat danismani.

[AKTIVITE BILGISI]
Tur: ${item.activityType}
Baslik: ${item.title}
Zorluk: ${(item as any).difficulty || 'Orta'}
Yas Grubu: ${(item as any).ageGroup || '8-10'}
Icerik Ozeti: ${JSON.stringify((item as any).data?.[0] || {}).substring(0, 500)}

[GOREV]
Bu aktivite icin ogretmene/veliye yonelik pedagojik not yaz.
Pedagojik not sunlari icermeli:
1. Bu aktivitenin hangi bilisssel/akademik beceriyi gelistirdigi
2. Disleksili ogrenci icin neden uygun oldugu
3. Uygulama sirasinda dikkat edilmesi gerekenler
4. Basari kriteri (ogrenci neyi basarinca hedef tamamlanmis sayilir)

[KISITLAR]
- Maksimum 3 cumle
- Teknik jargondan kacin (veli de anlayabilmeli)
- Olumlu, guclu-yanli bir dil kullan

[CIKTI]
SADECE JSON:
{
  "pedagogicalNote": "Uretilen pedagojik not metni"
}
`;

export const pedagogicalNoteSchema = {
  type: 'OBJECT',
  properties: {
    pedagogicalNote: { type: 'STRING' }
  },
  required: ['pedagogicalNote']
};
```

### 3.4 Auto-Complete — Onsoz Uretimi (Optimize Edilmis)

```typescript
// prompts/autoComplete.ts (devam)

export const buildPrefacePrompt = (
  settings: WorkbookSettings,
  items: CollectionItem[]
): string => {
  // Aktivite dagilimi analizi
  const activityCounts = items.reduce((acc, item) => {
    if (item.itemType !== 'divider') {
      acc[item.activityType] = (acc[item.activityType] || 0) + 1;
    }
    return acc;
  }, {} as Record<string, number>);

  const topActivities = Object.entries(activityCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([type]) => type);

  return `
[SISTEM ROL: OZEL EGITIM ILETISIM UZMANI]
Veli ve ogretmenlerle empati kuran, bilimsel terminolojiyi anlasılır kilan uzman.

[KITAPCIK BILGISI]
Baslik: ${settings.title || 'Ozel Egitim Calisma Kitapcigi'}
Ogrenci: ${settings.studentName || 'Ogrenci'}
Okul/Kurum: ${settings.schoolName || 'Ozel Gelisim Merkezi'}
Donem/Yil: ${settings.year || 'Mevcut Egitim Yili'}
Toplam Sayfa: ${items.filter(i => i.itemType !== 'divider').length}
Odak Alanlar: ${topActivities.join(', ')}

[YAZIM STILI]
1. GIRIS (1 cumle): Calismanin amaci ve akademik/bilisssel gelisimin onemi
2. GELISME (2-3 cumle): ${topActivities.slice(0, 2).join(' ve ')} alanlarindaki calismalarin noral plastisite uzerindeki etkisi
3. SONUC (1 cumle): Aileye destek icin tesekkur ve motivasyonel kapanis

[KRITIK KURALLAR]
- Maksimum 150 kelime (token tasarrufu)
- Kisa, anlasilir cumleler (Disleksi dostu iletisim)
- Profesyonel terminolojiyi parantez icinde basit aciklamalarla kullan
- Hitabet samimi ve guclendirici olmali
- Kesinlikle "disleksili" yerine "ozel ogrenme profili" veya "bireysel ogrenme ozellikleri" kullan

[CIKTI]
{
  "preface": "Uretilen onsoz metni"
}
`;
};

export const prefaceSchema = {
  type: 'OBJECT',
  properties: {
    preface: { type: 'STRING' }
  },
  required: ['preface']
};
```

---

## 4. JSON Schema Tanimlari

### 4.1 Genel Schema Standartlari

```typescript
// schemas/common.ts

/**
 * OOGMATIK JSON SCHEMA STANDARTLARI
 *
 * KURALLAR:
 * 1. type degerleri BUYUK HARF: 'OBJECT', 'ARRAY', 'STRING', 'NUMBER', 'BOOLEAN'
 * 2. required her zaman tanimli olmali
 * 3. Nullable alanlar icin nullable: true ekle
 * 4. Enum'lar Turkce, disleksi dostu
 */

export const DIFFICULTY_ENUM = ['Kolay', 'Orta', 'Zor'] as const;
export const VERDICT_ENUM = ['Mukemmel', 'Iyi', 'Iyilestirilebilir', 'Kritik'] as const;
export const SEVERITY_ENUM = ['low', 'medium', 'high'] as const;
export const AGE_GROUP_ENUM = ['5-7', '8-10', '11-13', '14+'] as const;
export const DIAGNOSIS_ENUM = ['dyslexia', 'dyscalculia', 'adhd', 'mixed'] as const;
```

### 4.2 Tum Schemalar — Tek Dosya

```typescript
// schemas/workbookAISchemas.ts

export const WorkbookAISchemas = {
  // 1. Aktivite Onerisi
  activitySuggestion: {
    type: 'OBJECT',
    properties: {
      suggestions: {
        type: 'ARRAY',
        items: {
          type: 'OBJECT',
          properties: {
            activityType: { type: 'STRING' },
            reason: { type: 'STRING' },
            recommendedDifficulty: { type: 'STRING', enum: ['Kolay', 'Orta', 'Zor'] },
            targetSkills: { type: 'ARRAY', items: { type: 'STRING' } },
            zpdJustification: { type: 'STRING' },
            priority: { type: 'NUMBER' }
          },
          required: ['activityType', 'reason', 'recommendedDifficulty', 'targetSkills']
        }
      },
      analysisNote: { type: 'STRING' }
    },
    required: ['suggestions', 'analysisNote']
  },

  // 2. Eksik Beceri Tespiti
  skillGap: {
    type: 'OBJECT',
    properties: {
      gaps: {
        type: 'ARRAY',
        items: {
          type: 'OBJECT',
          properties: {
            skillArea: { type: 'STRING' },
            currentCoverage: { type: 'NUMBER' },
            recommendedCoverage: { type: 'NUMBER' },
            suggestedActivities: { type: 'ARRAY', items: { type: 'STRING' } }
          },
          required: ['skillArea', 'currentCoverage', 'recommendedCoverage']
        }
      },
      overallBalance: { type: 'STRING' }
    },
    required: ['gaps', 'overallBalance']
  },

  // 3. Sayfa Dengesi Analizi
  pageBalance: {
    type: 'OBJECT',
    properties: {
      overallScore: { type: 'NUMBER' },
      verdict: { type: 'STRING', enum: ['Mukemmel', 'Iyi', 'Iyilestirilebilir', 'Kritik'] },
      balanceIssues: {
        type: 'ARRAY',
        items: {
          type: 'OBJECT',
          properties: {
            pageIndex: { type: 'NUMBER' },
            issue: { type: 'STRING' },
            severity: { type: 'STRING', enum: ['low', 'medium', 'high'] },
            suggestion: { type: 'STRING' }
          },
          required: ['pageIndex', 'issue', 'severity', 'suggestion']
        }
      },
      strengths: { type: 'ARRAY', items: { type: 'STRING' } },
      recommendations: { type: 'ARRAY', items: { type: 'STRING' } }
    },
    required: ['overallScore', 'verdict', 'balanceIssues', 'strengths', 'recommendations']
  },

  // 4. Zorluk Dagilimi Analizi
  difficultyDistribution: {
    type: 'OBJECT',
    properties: {
      distribution: {
        type: 'OBJECT',
        properties: {
          easy: { type: 'NUMBER' },
          medium: { type: 'NUMBER' },
          hard: { type: 'NUMBER' }
        },
        required: ['easy', 'medium', 'hard']
      },
      scaffoldingScore: { type: 'NUMBER' },
      issues: { type: 'ARRAY', items: { type: 'STRING' } },
      recommendation: { type: 'STRING' }
    },
    required: ['distribution', 'scaffoldingScore', 'recommendation']
  },

  // 5. Tema Tutarliligi
  themeConsistency: {
    type: 'OBJECT',
    properties: {
      consistencyScore: { type: 'NUMBER' },
      detectedThemes: { type: 'ARRAY', items: { type: 'STRING' } },
      inconsistencies: {
        type: 'ARRAY',
        items: {
          type: 'OBJECT',
          properties: {
            pageIndex: { type: 'NUMBER' },
            issue: { type: 'STRING' }
          },
          required: ['pageIndex', 'issue']
        }
      },
      suggestion: { type: 'STRING' }
    },
    required: ['consistencyScore', 'detectedThemes', 'suggestion']
  },

  // 6. Metadata Tamamlama
  metadataFill: {
    type: 'OBJECT',
    properties: {
      category: { type: 'STRING' },
      targetSkills: { type: 'ARRAY', items: { type: 'STRING' } },
      cognitiveDomain: { type: 'STRING' },
      estimatedDuration: { type: 'NUMBER' },
      prerequisites: { type: 'ARRAY', items: { type: 'STRING' } },
      pedagogicalNote: { type: 'STRING' }
    },
    required: ['category', 'targetSkills', 'cognitiveDomain', 'pedagogicalNote']
  },

  // 7. Pedagojik Not
  pedagogicalNote: {
    type: 'OBJECT',
    properties: {
      pedagogicalNote: { type: 'STRING' }
    },
    required: ['pedagogicalNote']
  },

  // 8. Onsoz
  preface: {
    type: 'OBJECT',
    properties: {
      preface: { type: 'STRING' }
    },
    required: ['preface']
  },

  // 9. Siralama Optimizasyonu
  sequenceOptimization: {
    type: 'OBJECT',
    properties: {
      optimizedOrder: {
        type: 'ARRAY',
        items: {
          type: 'OBJECT',
          properties: {
            originalIndex: { type: 'NUMBER' },
            newIndex: { type: 'NUMBER' },
            reason: { type: 'STRING' }
          },
          required: ['originalIndex', 'newIndex']
        }
      },
      improvementScore: { type: 'NUMBER' },
      pedagogicalRationale: { type: 'STRING' }
    },
    required: ['optimizedOrder', 'improvementScore', 'pedagogicalRationale']
  }
};
```

---

## 5. Token Maliyet Analizi

### 5.1 Maliyet Hesaplama Formulu

```typescript
// utils/tokenCostEstimator.ts

interface CostEstimate {
  inputTokens: number;
  outputTokens: number;
  inputCost: number;   // USD
  outputCost: number;  // USD
  totalCost: number;   // USD
}

/**
 * Gemini 2.5 Flash Fiyatlandirma (Mart 2026):
 * Input:  $0.075 / 1M token
 * Output: $0.30  / 1M token
 */
const GEMINI_FLASH_PRICING = {
  inputPerMillion: 0.075,
  outputPerMillion: 0.30
};

export const estimateTokenCost = (
  promptLength: number,
  expectedOutputLength: number
): CostEstimate => {
  // Ortalama: 4 karakter = 1 token (Turkce icin biraz daha yuksek)
  const CHARS_PER_TOKEN = 3.5;

  const inputTokens = Math.ceil(promptLength / CHARS_PER_TOKEN) + 500; // +500 for system instruction
  const outputTokens = Math.ceil(expectedOutputLength / CHARS_PER_TOKEN);

  const inputCost = (inputTokens * GEMINI_FLASH_PRICING.inputPerMillion) / 1_000_000;
  const outputCost = (outputTokens * GEMINI_FLASH_PRICING.outputPerMillion) / 1_000_000;

  return {
    inputTokens,
    outputTokens,
    inputCost,
    outputCost,
    totalCost: inputCost + outputCost
  };
};
```

### 5.2 Fonksiyon Bazli Maliyet Tahmini

| Fonksiyon | Avg Input Token | Avg Output Token | Maliyet/Istek | Gunluk (100 istek) |
|-----------|-----------------|------------------|---------------|-------------------|
| `suggestActivities` | 800 | 400 | $0.00018 | $0.018 |
| `analyzePageBalance` | 1200 | 350 | $0.00020 | $0.020 |
| `fillMissingMetadata` | 600 | 200 | $0.00011 | $0.011 |
| `generatePedagogicalNote` | 500 | 100 | $0.00007 | $0.007 |
| `generatePreface` | 700 | 200 | $0.00012 | $0.012 |
| `checkThemeConsistency` | 900 | 250 | $0.00014 | $0.014 |

**Toplam Tahmini Gunluk Maliyet**: ~$0.08/kullanici (100 istek/gun varsayimi)
**Aylik Maliyet Tahmini**: ~$2.40/aktif kullanici

### 5.3 Token Optimizasyon Stratejileri

```typescript
// Token tasarrufu icin prompt compression
const compressItemsForPrompt = (items: CollectionItem[]): string => {
  return items.map((item, idx) =>
    `${idx + 1}|${item.activityType}|${item.title?.substring(0, 30)}|${(item as any).difficulty || '-'}`
  ).join('\n');
};

// Ornek: 20 aktivite icin
// ONCE: ~2000 karakter (JSON.stringify)
// SONRA: ~600 karakter (compressed)
// TASARRUF: %70
```

---

## 6. Hallucination Prevention Stratejileri

### 6.1 Cikti Dogrulama Katmanlari

```typescript
// validators/contentValidator.ts

interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  sanitizedOutput?: any;
}

export class ContentValidator {
  /**
   * KATMAN 1: JSON Schema Uyumu
   * Gemini'den donen veri schema'ya uyuyor mu?
   */
  validateSchema(data: any, schema: object): boolean {
    // Zod veya ajv ile dogrulama
    return true; // placeholder
  }

  /**
   * KATMAN 2: ActivityType Dogrulama
   * AI'in onerdigi aktivite turleri gercekten var mi?
   */
  validateActivityTypes(suggestions: any[]): ValidationResult {
    const validTypes = Object.values(ActivityType);
    const errors: string[] = [];

    for (const suggestion of suggestions) {
      if (!validTypes.includes(suggestion.activityType)) {
        errors.push(`Gecersiz aktivite turu: ${suggestion.activityType}`);
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings: []
    };
  }

  /**
   * KATMAN 3: MEB Kazanim Referans Dogrulama
   * AI'in bahsettigi kazanimlar MEB mufredatinda var mi?
   */
  validateMEBReferences(content: string): ValidationResult {
    // MEB kazanim veritabaniyla karsilastirma
    const suspiciousPatterns = [
      /T\.(\d+)\.(\d+)\.(\d+)/g,  // Turkce kazanim formati
      /M\.(\d+)\.(\d+)\.(\d+)/g,  // Matematik kazanim formati
    ];

    // TODO: curriculumService ile dogrulama
    return { isValid: true, errors: [], warnings: [] };
  }

  /**
   * KATMAN 4: Pedagojik Guvenlik
   * Icerik pedagojik olarak guvenli mi?
   */
  validatePedagogicalSafety(content: any): ValidationResult {
    const warnings: string[] = [];
    const errors: string[] = [];

    // Olumsuz dil kontrolu
    const negativePatterns = [
      /yapama/gi, /edemez/gi, /basarisiz/gi, /zayif/gi,
      /yetersiz/gi, /olmaz/gi, /degil/gi
    ];

    const contentStr = JSON.stringify(content);
    for (const pattern of negativePatterns) {
      if (pattern.test(contentStr)) {
        warnings.push(`Olumsuz dil tespit edildi: ${pattern}`);
      }
    }

    // Yas uygunsuz icerik kontrolu
    const inappropriatePatterns = [
      /siddet/gi, /korku/gi, /olum/gi, /kan/gi
    ];

    for (const pattern of inappropriatePatterns) {
      if (pattern.test(contentStr)) {
        errors.push(`Uygunsuz icerik tespit edildi: ${pattern}`);
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * KATMAN 5: Tutarlilik Kontrolu
   * Oneri, mevcut kitapcik baglami ile tutarli mi?
   */
  validateContextConsistency(
    suggestion: any,
    context: WorkbookContext
  ): ValidationResult {
    const warnings: string[] = [];

    // Yas grubu uyumu
    if (suggestion.ageGroup && suggestion.ageGroup !== context.studentProfile?.ageGroup) {
      warnings.push('Oneri yas grubu ogrenci profili ile uyusmuyor');
    }

    // Zorluk seviyesi mantigi
    if (suggestion.recommendedDifficulty === 'Zor' &&
        context.difficultyDistribution.hard > 30) {
      warnings.push('Kitapcikta zaten cok fazla zor aktivite var');
    }

    return { isValid: true, errors: [], warnings };
  }
}
```

### 6.2 Fallback Stratejileri

```typescript
// Hallucination tespit edilirse fallback
const handleAIResponseWithFallback = async <T>(
  aiCall: () => Promise<T>,
  fallbackGenerator: () => T,
  validator: (result: T) => ValidationResult
): Promise<T> => {
  try {
    const result = await aiCall();
    const validation = validator(result);

    if (!validation.isValid) {
      console.warn('[AI Assistant] Validation failed, using fallback:', validation.errors);
      return fallbackGenerator();
    }

    if (validation.warnings.length > 0) {
      console.warn('[AI Assistant] Validation warnings:', validation.warnings);
    }

    return validation.sanitizedOutput || result;
  } catch (error) {
    console.error('[AI Assistant] AI call failed, using fallback:', error);
    return fallbackGenerator();
  }
};
```

---

## 7. Cache Stratejisi

### 7.1 AI Asistan Ozel Cache

```typescript
// cache/assistantCache.ts

const ASSISTANT_CACHE_PREFIX = 'workbook_ai_assistant_';
const CACHE_TTL_MS = 10 * 60 * 1000; // 10 dakika

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  promptHash: string;
}

export class AssistantCache {
  private memoryCache: Map<string, CacheEntry<any>> = new Map();

  /**
   * Prompt hash olustur (ayni prompt = ayni sonuc)
   */
  private generatePromptHash(prompt: string, schema: object): string {
    // Simple hash for prompt + schema
    const combined = prompt + JSON.stringify(schema);
    let hash = 0;
    for (let i = 0; i < combined.length; i++) {
      const char = combined.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // 32bit integer
    }
    return `${ASSISTANT_CACHE_PREFIX}${hash.toString(16)}`;
  }

  /**
   * Cache'den oku (TTL kontrolu ile)
   */
  async get<T>(prompt: string, schema: object): Promise<T | null> {
    const key = this.generatePromptHash(prompt, schema);

    // 1. Memory cache kontrol
    const memEntry = this.memoryCache.get(key);
    if (memEntry && Date.now() - memEntry.timestamp < CACHE_TTL_MS) {
      return memEntry.data as T;
    }

    // 2. IndexedDB kontrol
    try {
      const dbEntry = await cacheService.get(key);
      if (dbEntry && (dbEntry as any).timestamp &&
          Date.now() - (dbEntry as any).timestamp < CACHE_TTL_MS) {
        // Memory cache'e de yaz
        this.memoryCache.set(key, {
          data: dbEntry,
          timestamp: (dbEntry as any).timestamp,
          promptHash: key
        });
        return dbEntry as T;
      }
    } catch {
      // Cache miss
    }

    return null;
  }

  /**
   * Cache'e yaz
   */
  async set<T>(prompt: string, schema: object, data: T): Promise<void> {
    const key = this.generatePromptHash(prompt, schema);
    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      promptHash: key
    };

    // Memory cache
    this.memoryCache.set(key, entry);

    // IndexedDB (async, fire-and-forget)
    cacheService.set(key, { ...data, timestamp: Date.now() } as any).catch(() => {});
  }

  /**
   * Belirli bir tur icin cache temizle
   */
  invalidateByType(type: 'suggestions' | 'feedback' | 'autoComplete'): void {
    const prefix = `${ASSISTANT_CACHE_PREFIX}${type}_`;
    for (const key of this.memoryCache.keys()) {
      if (key.startsWith(prefix)) {
        this.memoryCache.delete(key);
      }
    }
  }

  /**
   * Tum cache temizle
   */
  clearAll(): void {
    this.memoryCache.clear();
  }
}
```

### 7.2 Cache Invalidation Kurallari

| Durum | Aksiyon |
|-------|---------|
| Yeni aktivite eklendi | `invalidateByType('suggestions')` + `invalidateByType('feedback')` |
| Aktivite silindi | `invalidateByType('suggestions')` + `invalidateByType('feedback')` |
| Aktivite siralama degisti | `invalidateByType('feedback')` |
| Ogrenci profili degisti | `clearAll()` |
| 10 dakika gecti | Otomatik TTL expire |

---

## 8. Rate Limiting ve Batch Processing

### 8.1 Asistan Icin Ozel Rate Limiter

```typescript
// Mevcut rateLimiter.ts'e eklenti

export const ASSISTANT_RATE_LIMITS = {
  free: {
    suggestActivities: { max: 10, windowMs: 60 * 60 * 1000 },      // 10/saat
    analyzePageBalance: { max: 20, windowMs: 60 * 60 * 1000 },     // 20/saat
    generatePedagogicalNote: { max: 30, windowMs: 60 * 60 * 1000 }, // 30/saat
    generatePreface: { max: 5, windowMs: 60 * 60 * 1000 },         // 5/saat
  },
  premium: {
    suggestActivities: { max: 50, windowMs: 60 * 60 * 1000 },
    analyzePageBalance: { max: 100, windowMs: 60 * 60 * 1000 },
    generatePedagogicalNote: { max: 200, windowMs: 60 * 60 * 1000 },
    generatePreface: { max: 20, windowMs: 60 * 60 * 1000 },
  }
};
```

### 8.2 Batch Processing

```typescript
// Birden fazla aktivite icin pedagojik not uretimi
const batchGeneratePedagogicalNotes = async (
  items: CollectionItem[],
  batchSize: number = 5
): Promise<Map<string, string>> => {
  const results = new Map<string, string>();

  // 5'erli gruplara bol
  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize);

    // Tek prompt ile batch isle
    const batchPrompt = buildBatchPedagogicalNotePrompt(batch);
    const batchSchema = buildBatchPedagogicalNoteSchema(batch.length);

    try {
      const response = await generateWithSchema(batchPrompt, batchSchema);

      // Sonuclari map'e ekle
      batch.forEach((item, idx) => {
        results.set(item.id, response.notes[idx] || '');
      });
    } catch (error) {
      // Batch basarisiz olursa tek tek dene
      for (const item of batch) {
        try {
          const note = await generatePedagogicalNote(item);
          results.set(item.id, note);
        } catch {
          results.set(item.id, ''); // Fallback: bos
        }
      }
    }

    // Rate limit korumasi icin kisa bekle
    if (i + batchSize < items.length) {
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  }

  return results;
};
```

---

## 9. UI Entegrasyon Onerisi

### 9.1 WorkbookView Eklentileri

```tsx
// WorkbookView.tsx'e eklenecek bilesenler

// AI Asistan Sidepanel
const AIAssistantPanel: React.FC<{
  items: CollectionItem[];
  settings: WorkbookSettings;
  onApplySuggestion: (suggestion: ActivitySuggestion) => void;
}> = ({ items, settings, onApplySuggestion }) => {
  const [suggestions, setSuggestions] = useState<ActivitySuggestion[]>([]);
  const [feedback, setFeedback] = useState<BalanceAnalysis | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  return (
    <div className="w-80 bg-zinc-900/50 backdrop-blur-xl border-l border-zinc-700/50 p-4">
      <h3 className="text-lg font-bold text-white flex items-center gap-2">
        <i className="fa-solid fa-robot text-indigo-400"></i>
        AI Asistan
      </h3>

      {/* Akilli Oneriler */}
      <section className="mt-4">
        <h4 className="text-sm font-medium text-zinc-400 mb-2">Aktivite Onerileri</h4>
        {suggestions.map((s, i) => (
          <SuggestionCard key={i} suggestion={s} onApply={onApplySuggestion} />
        ))}
      </section>

      {/* Gercek Zamanli Geri Bildirim */}
      <section className="mt-4">
        <h4 className="text-sm font-medium text-zinc-400 mb-2">Kitapcik Analizi</h4>
        {feedback && <FeedbackCard feedback={feedback} />}
      </section>
    </div>
  );
};
```

### 9.2 Kullanici Etkilesim Akisi

```
1. Kullanici kitapciga aktivite ekler
   ↓
2. AI Asistan otomatik tetiklenir (debounced, 2sn)
   ↓
3. Arka planda:
   - analyzePageBalance() → Denge uyarilari
   - suggestActivities() → Yeni oneriler
   ↓
4. Sonuclar sidepanel'de gosterilir
   ↓
5. Kullanici oneriyi kabul ederse:
   - Aktivite uretim modali acilir
   - AI Asistan onerisini parametre olarak gecirir
```

---

## 10. Test Plani

### 10.1 Unit Testler

```typescript
// tests/workbookAIAssistant.test.ts

describe('WorkbookAIAssistant', () => {
  describe('suggestActivities', () => {
    it('should return valid ActivityType values', async () => {
      const context = mockWorkbookContext();
      const result = await assistant.suggestActivities(context);

      result.suggestions.forEach(s => {
        expect(Object.values(ActivityType)).toContain(s.activityType);
      });
    });

    it('should not suggest already dominant activities', async () => {
      const context = mockWorkbookContext({
        activityDistribution: [
          { type: ActivityType.FIVE_W_ONE_H, count: 10 }
        ]
      });
      const result = await assistant.suggestActivities(context);

      expect(result.suggestions.every(s =>
        s.activityType !== ActivityType.FIVE_W_ONE_H
      )).toBe(true);
    });
  });

  describe('ContentValidator', () => {
    it('should detect negative language', () => {
      const content = { note: 'Ogrenci bunu yapamaz' };
      const result = validator.validatePedagogicalSafety(content);

      expect(result.warnings.length).toBeGreaterThan(0);
    });

    it('should reject inappropriate content', () => {
      const content = { note: 'Siddet iceren ornek' };
      const result = validator.validatePedagogicalSafety(content);

      expect(result.isValid).toBe(false);
    });
  });
});
```

### 10.2 Integration Testler

```typescript
// tests/integration/aiAssistant.test.ts

describe('AI Assistant Integration', () => {
  it('should use cache for identical requests', async () => {
    const context = mockWorkbookContext();

    // Ilk istek
    const result1 = await assistant.suggestActivities(context);

    // Ayni istek (cache'den gelmeli)
    const startTime = Date.now();
    const result2 = await assistant.suggestActivities(context);
    const elapsed = Date.now() - startTime;

    expect(elapsed).toBeLessThan(50); // Cache hit = cok hizli
    expect(result1).toEqual(result2);
  });

  it('should respect rate limits', async () => {
    // 11 istek at (limit: 10/saat)
    const promises = Array(11).fill(null).map(() =>
      assistant.suggestActivities(mockWorkbookContext())
    );

    const results = await Promise.allSettled(promises);
    const rejected = results.filter(r => r.status === 'rejected');

    expect(rejected.length).toBeGreaterThan(0);
  });
});
```

---

## 11. Uygulama Onceligi

### Faz 1: Temel Altyapi (1 hafta)
- [ ] `WorkbookAIAssistant` sinifi
- [ ] JSON schema tanimlari
- [ ] Cache mekanizmasi
- [ ] ContentValidator

### Faz 2: Smart Content Suggestions (1 hafta)
- [ ] `suggestActivities()` implementasyonu
- [ ] `detectSkillGaps()` implementasyonu
- [ ] UI entegrasyonu (sidepanel)

### Faz 3: Real-time Feedback (1 hafta)
- [ ] `analyzePageBalance()` implementasyonu
- [ ] `analyzeDifficultyDistribution()` implementasyonu
- [ ] `checkThemeConsistency()` implementasyonu
- [ ] Debounced tetikleme

### Faz 4: Auto-Complete Optimizasyonu (3 gun)
- [ ] `generatePreface()` optimizasyonu (token azaltma)
- [ ] `fillMissingMetadata()` implementasyonu
- [ ] Batch processing

### Faz 5: Test ve Dokumantasyon (3 gun)
- [ ] Unit testler
- [ ] Integration testler
- [ ] Kullanici dokumantasyonu

---

## 12. Sonuc

Bu tasarim belgesi, Calisma Kitapcigi AI Asistan sistemi icin kapsamli bir mimari sunar. Temel prensipler:

1. **Token Verimliligi**: Prompt compression ve cache ile maliyet minimizasyonu
2. **Hallucination Onleme**: 5 katmanli dogrulama sistemi
3. **Pedagojik Guvenlik**: Olumsuz dil ve uygunsuz icerik filtreleme
4. **Olceklenebilirlik**: Rate limiting ve batch processing

**Tahmini Toplam Gelistirme Suresi**: 4 hafta
**Tahmini Aylik Maliyet**: ~$2.40/aktif kullanici

---

**Onay Bekleyen Kisimlar:**
- [ ] `ozel-ogrenme-uzmani` — Pedagojik not sablonlari ve ZPD analiz kriterleri
- [ ] `ozel-egitim-uzmani` — Klinik guvenlik filtreleri ve BEP uyumu
- [ ] `yazilim-muhendisi` — Cache stratejisi ve TypeScript tip uyumu

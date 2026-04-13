# Ultra Etkinlik Üretim Stüdyosu — Uygulama Planı

> **For agentic workers:** Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Oogmatik platformuna sıfırdan özelleştirilebilir, çoklu AI ajan orkestrasyonlu, admin onaylı bir Ultra Etkinlik Üretim Stüdyosu eklemek.

**Architecture:** Wizard tabanlı (5 adım) hibrit üretim merkezi. Drag-and-Drop bileşen fabrikası + 6 AI ajan pipeline'ı. Mevcut ActivityService ile köprü mantığı. Admin onay pipeline'ı ile katalog entegrasyonu.

**Tech Stack:** React 18 + TypeScript (strict) + Vite + Vercel Serverless + Gemini 2.5 Flash + Firebase + Zustand + @dnd-kit + Vitest

---

## 📋 Uzman Ajan Onayları

| Uzman | Rol | Onay Durumu | Temel Direktifler |
|-------|-----|-------------|-------------------|
| **Elif Yıldız** | Pedagoji Direktörü | ✅ Onay + 8 Mutlak Kural | pedagogicalNote ≥30 char, hibrit zorluk, 6 güvenlik kapısı, başarı mimarisi |
| **Dr. Ahmet Kaya** | Klinik Direktör | ✅ Onay + KVKK/MEB | PII ayrıştırma, tanı koyucu dil filtresi, 573 KHK metadata, BEP eşleştirme |
| **Bora Demir** | Mühendislik Direktörü | ✅ Onay + Mimari Plan | components/ActivityStudio/, yeni Zustand store, 4 API endpoint, FSM wizard |
| **Selin Arslan** | AI Mimarı | ✅ Onay + Pipeline | Sıralı pipeline (paralel adım 2+3), 3 katmanlı cache, ajan-özel prompt, 5 hallucination savunması |

---

## 🏗️ Modül Mimarisi

### Dizin Yapısı

```
components/ActivityStudio/
├── index.tsx                          ← Ana entry + Wizard orchestrator
├── types.ts                           ← Stüdyo-yerel tipler (bridge to types/)
├── constants.ts                       ← Wizard adım tanımları, defaults, limitler
│
├── wizard/                            ← 5 Adımlı Wizard
│   ├── WizardContainer.tsx            ← Adım routing + ilerleme çubuğu
│   ├── StepGoal.tsx                   ← Adım 1: Hedef & Kapsam
│   ├── StepContent.tsx                ← Adım 2: İçerik & Bileşen Tasarımı
│   ├── StepCustomize.tsx              ← Adım 3: Ultra Özelleştirme
│   ├── StepPreview.tsx                ← Adım 4: Önizleme (öğrenci + admin gözü)
│   └── StepApproval.tsx               ← Adım 5: Admin Onayına Gönder
│
├── agents/                            ← 6 AI Ajan Orkestrasyonu
│   ├── AgentOrchestrator.ts           ← Merkezi orkestratör (sequential + parallel dispatch)
│   ├── IdeationAgent.ts               ← Fikir üretim ajanı (konsept, tema, hedef kitle)
│   ├── ContentAgent.ts                ← İçerik tasarım ajanı (metinler, yönergeler)
│   ├── VisualAgent.ts                 ← Görsel & şablon ajanı (layout, ikon önerileri)
│   ├── FlowAgent.ts                   ← Zamanlama & akış ajanı (adım planı)
│   ├── EvaluationAgent.ts             ← Değerlendirme & geri bildirim ajanı (KPI, rubric)
│   └── IntegrationAgent.ts            ← Entegrasyon ajanı (admin format, kategori, etiket)
│
├── factory/                           ← Drag-and-Drop Bileşen Fabrikası
│   ├── ComponentFactory.tsx           ← @dnd-kit entegrasyonu
│   ├── ComponentPalette.tsx           ← Bileşen paleti (sürüklenebilir kartlar)
│   ├── DropZone.tsx                   ← Bırakma alanı + sıralama
│   └── blocks/                        ← Fabrika bileşenleri
│       ├── TextBlock.tsx              ← Metin bloğu
│       ├── ImageBlock.tsx             ← Görsel bloğu
│       ├── QuizBlock.tsx              ← Soru-cevap bloğu
│       ├── TimerBlock.tsx             ← Zamanlayıcı bloğu
│       ├── ScoringBlock.tsx           ← Puanlama bloğu
│       ├── QRBlock.tsx                ← QR kod bloğu
│       ├── WatermarkBlock.tsx         ← Filigran bloğu
│       └── LogoBlock.tsx              ← Logo bloğu
│
├── preview/                           ← Önizleme & Dışa Aktarma
│   ├── PreviewRenderer.tsx            ← Canlı render motoru (öğrenci + admin gözü)
│   ├── ExportEngine.ts                ← PDF/PNG/JSON export
│   ├── ShareEngine.ts                 ← Paylaşma linki + klonlama
│   └── StudentEyeView.tsx             ← "Öğrenci Gözüyle Gör" simülasyonu
│
├── hooks/                             ← Custom React Hooks
│   ├── useWizardState.ts              ← Wizard FSM + adım navigasyonu
│   ├── useAgentOrchestration.ts       ← AI ajan pipeline hook
│   ├── useComponentFactory.ts         ← DnD state + bileşen CRUD
│   ├── useExport.ts                   ← Export + share hook
│   └── usePedagogicGates.ts           ← Pedagojik güvenlik kapıları hook
│
├── approval/                          ← Admin Onay Pipeline
│   ├── ApprovalPanel.tsx              ← Onay/revize/red UI
│   ├── ApprovalTimeline.tsx           ← Pipeline zaman çizelgesi
│   ├── RevisionNotes.tsx              ← Revizyon notları
│   └── DiagnosticLanguageChecker.tsx   ← Tanı koyucu dil kontrol paneli
│
└── validation/                        ← Doğrulama Motoru
    ├── pedagogicValidator.ts          ← 6 pedagojik güvenlik kapısı
    ├── clinicalValidator.ts           ← KVKK + MEB + tanı dili kontrolü
    └── contentValidator.ts            ← İçerik uzunluk + bilişsel yük kontrolü
```

### API Endpoint Yapısı

```
api/activity-studio/
├── generate.ts        ← POST: AI ajan orkestrasyonu ile içerik üretimi
├── approve.ts         ← POST: Admin onay/revize/red (RBAC: admin only)
├── draft.ts           ← POST/GET/PUT: Taslak CRUD
└── export.ts          ← POST: PDF/PNG/JSON export
```

### Yeni ve Değiştirilecek Dosyalar

| Dosya | İşlem | Açıklama |
|-------|-------|----------|
| `types/activityStudio.ts` | **YENİ** | Stüdyo tip tanımları |
| `types/index.ts` | **DEĞİŞTİR** | Barrel export'a activityStudio ekle |
| `types/core.ts` | **DEĞİŞTİR** | `View` union'a `'activity-studio'` ekle |
| `store/useActivityStudioStore.ts` | **YENİ** | Wizard + ajan + fabrika state |
| `utils/schemas.ts` | **DEĞİŞTİR** | Zod şemaları ekle |
| `services/activityStudioService.ts` | **YENİ** | İş mantığı servisi |
| `components/ActivityStudio/**` | **YENİ** | Tüm stüdyo bileşenleri |
| `api/activity-studio/**` | **YENİ** | 4 API endpoint |
| `src/App.tsx` | **DEĞİŞTİR** | Lazy-load + routing ekle |
| `src/components/Sidebar.tsx` | **DEĞİŞTİR** | Navigasyon menüsüne ekle |
| `src/components/ContentArea.tsx` | **DEĞİŞTİR** | View routing ekle |
| `tests/activityStudio/` | **YENİ** | Vitest testleri |

---

## 🔑 Kritik TypeScript Tipleri

```typescript
// types/activityStudio.ts

import type { AgeGroup, Difficulty, LearningDisabilityProfile } from './creativeStudio';
import type { ActivityType } from './activity';

// ─── Zorluk Sistemi (Elif Yıldız — Hibrit Kademeli) ────────────────
export interface UltraDifficultyConfig {
  displayLevel: Difficulty;                                    // Kullanıcıya gösterilir
  internalLevel: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;  // AI kalibrasyon
  scaffoldIntensity: 'full' | 'partial' | 'minimal';          // İpucu yoğunluğu
}

// ─── Profil UI Uyarlaması ───────────────────────────────────────────
export interface UltraStudioProfileConfig {
  primaryProfile: LearningDisabilityProfile;
  secondaryProfile?: LearningDisabilityProfile;
  uiAdaptations: {
    font: 'Lexend';                      // sabit — DEĞİŞTİRME
    fontSize: number;                    // profil bazlı varsayılan
    lineHeight: number;                  // min 1.8
    maxItemsPerRow: number;              // disleksi: 3, diğer: 5
    scaffoldLevel: 'full' | 'partial' | 'minimal';
    timerEnabled: boolean;               // DEHB: true varsayılan
    colorCoding: boolean;                // disleksi: hece, diskalkuli: basamak
    microTaskDuration: number;           // DEHB: 2-3 dk
  };
}

// ─── Wizard Adım Tipleri ────────────────────────────────────────────
export type WizardStepId = 'goal' | 'content' | 'customize' | 'preview' | 'approval';

export interface WizardStep {
  id: WizardStepId;
  status: 'pending' | 'active' | 'completed' | 'error';
  validationErrors?: string[];
}

export interface StudioGoalConfig {
  ageGroup: AgeGroup;
  profile: LearningDisabilityProfile;
  difficulty: Difficulty;
  internalLevel: UltraDifficultyConfig['internalLevel'];
  activityType: ActivityType | string;  // mevcut veya yeni kategori
  customCategory?: string;              // kullanıcı tanımlı alt kategori
  topic: string;
  targetSkills: string[];
  gradeLevel: number;                   // 1-8
  duration: number;                     // dakika
  format: 'online' | 'yuz-yuze' | 'hibrit';
  participantRange: { min: number; max: number };
}

export interface StudioContentConfig {
  title: string;
  shortDescription: string;
  scenario: string;                     // Ayrıntılı açıklama
  materials: string[];                  // Gerekli materyaller
  steps: StudioActivityStep[];          // Adım adım plan
  roles: StudioRole[];                  // Rol dağılımı
  timeline: StudioTimeline;             // Zaman çizelgesi
  expectedOutcomes: string[];           // Beklenen çıktılar
}

export interface StudioActivityStep {
  id: string;
  order: number;
  title: string;
  description: string;
  duration: number;                     // dakika
  isEnabled: boolean;                   // toggle ile aç/kapat
  difficulty: Difficulty;
  internalLevel: UltraDifficultyConfig['internalLevel'];
}

export interface StudioRole {
  name: string;
  description: string;
  participantCount: number;
}

export interface StudioTimeline {
  introduction: number;                 // dakika
  mainActivity: number;
  closing: number;
  evaluation: number;
}

// ─── Ultra Özelleştirme ─────────────────────────────────────────────
export interface StudioCustomization {
  // Görsel Stil
  fontFamily: 'Lexend';                // sabit — disleksi uyumu
  fontSize: number;                    // 14-48
  lineHeight: number;                  // min 1.8
  colorScheme: StudioColorScheme;
  margins: { top: number; right: number; bottom: number; left: number };
  backgroundTexture: string | null;

  // Markalama
  includeLogo: boolean;
  logoUrl?: string;
  includeQR: boolean;
  qrContent?: string;
  includeWatermark: boolean;
  watermarkText?: string;

  // İnteraktiflik
  includeTimer: boolean;
  timerDuration?: number;              // saniye
  includeScoring: boolean;
  scoringType?: 'points' | 'stars' | 'badges';
  difficultySlider: UltraDifficultyConfig;

  // Alternatif Senaryolar
  alternativePlans: AlternativePlan[];
}

export interface StudioColorScheme {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  text: string;
}

export interface AlternativePlan {
  id: string;
  name: string;                        // "Plan B", "Online Versiyon", "Kısa Versiyon"
  modifications: Record<string, unknown>;
}

// ─── Bileşen Fabrikası ──────────────────────────────────────────────
export type FactoryBlockType =
  | 'text' | 'image' | 'quiz' | 'timer'
  | 'scoring' | 'qr' | 'watermark' | 'logo'
  | 'divider' | 'spacer';

export interface FactoryComponent {
  id: string;
  type: FactoryBlockType;
  order: number;
  content: Record<string, unknown>;
  style: Record<string, unknown>;
  isLocked: boolean;
}

// ─── AI Ajan Tipleri ────────────────────────────────────────────────
export type AgentId =
  | 'ideation'       // Fikir üretim
  | 'content'        // İçerik tasarım
  | 'visual'         // Görsel & şablon
  | 'flow'           // Zamanlama & akış
  | 'evaluation'     // Değerlendirme
  | 'integration';   // Entegrasyon

export interface AgentStatus {
  agentId: AgentId;
  status: 'idle' | 'running' | 'completed' | 'error';
  result?: unknown;
  error?: { message: string; code: string };
  startedAt?: string;
  completedAt?: string;
  tokenUsage?: { input: number; output: number };
}

export interface AgentPipelineConfig {
  mode: 'sequential' | 'parallel-partial';  // adım 2+3 paralel, geri sıralı
  enabledAgents: AgentId[];
  temperatureOverrides?: Partial<Record<AgentId, number>>;
}

// ─── Admin Onay Pipeline ────────────────────────────────────────────
export type ApprovalStatus = 'draft' | 'review' | 'approved' | 'revision' | 'rejected';

export interface ApprovalRecord {
  reviewerId: string;                   // Hash ID — isim değil (KVKK)
  action: 'approve' | 'revise' | 'reject';
  reason: string;
  timestamp: string;                    // ISO 8601
  clinicalCheck: boolean;               // Klinik kontrol yapıldı mı?
  languageCheck: boolean;               // Tanı koyucu dil geçti mi?
  pedagogicCheck: boolean;              // Pedagojik kontrol geçti mi?
}

// ─── 573 KHK + MEB Zorunlu Metadata (Dr. Ahmet Kaya) ───────────────
export interface UltraActivityMetadata {
  // KHK Madde 4: Hedef profiller
  targetProfiles: LearningDisabilityProfile[];

  // KHK Madde 7: Bireyselleştirme
  ageGroup: AgeGroup;
  difficulty: Difficulty;
  internalLevel: UltraDifficultyConfig['internalLevel'];

  // KHK Madde 12: Destek düzeyi
  supportLevel: 'independent' | 'guided' | 'scaffolded';
  accommodations: string[];

  // KHK Madde 15: BEP eşleşme
  bepAlignment?: ActivityBEPMapping;
  mebCurriculumCode?: string;           // MEB kazanım kodu (ör: "T.4.3.2")

  // Pedagojik zorunlu
  pedagogicalNote: string;              // min 30 karakter, spesifik
  evidenceBase?: string;                // Bilimsel dayanak

  // Onay süreci
  status: ApprovalStatus;
  reviewHistory: ApprovalRecord[];

  // KVKK
  containsPII: false;                   // Etkinlik şablonunda PII olmamalı — sabit
  diagnosticLanguageCheck: 'passed' | 'failed';
  contraindicationFlags?: string[];

  // Zaman damgaları
  createdBy: string;                    // Hash user ID
  createdAt: string;                    // ISO 8601
  updatedAt: string;
}

export interface ActivityBEPMapping {
  activityId: string;
  bepGoalId: string;
  alignmentType: 'direct' | 'supportive' | 'prerequisite';
  targetSkills: string[];
  expectedOutcome: string;              // SMART format
  measurementMethod: string;
  reviewCycle: '2_weeks' | '4_weeks' | '6_weeks';
}

// ─── Stüdyo Ana Çıktı Formatı ──────────────────────────────────────
export interface UltraStudioOutput {
  id: string;
  goal: StudioGoalConfig;
  content: StudioContentConfig;
  customization: StudioCustomization;
  components: FactoryComponent[];
  metadata: UltraActivityMetadata;
  agentOutputs: Record<AgentId, unknown>;
  profileConfig: UltraStudioProfileConfig;
}

// ─── Zustand Store Tipi ─────────────────────────────────────────────
export interface ActivityStudioState {
  // Wizard
  currentStep: WizardStepId;
  steps: WizardStep[];
  wizardData: {
    goal: StudioGoalConfig | null;
    content: StudioContentConfig | null;
    customization: StudioCustomization | null;
    preview: UltraStudioOutput | null;
  };

  // AI Ajanlar
  agentStatuses: Record<AgentId, AgentStatus>;
  pipelineConfig: AgentPipelineConfig;

  // Bileşen Fabrikası
  canvasComponents: FactoryComponent[];
  selectedComponentId: string | null;

  // Export
  exportFormat: 'pdf' | 'png' | 'json';
  exportProgress: number;

  // Actions
  setStep: (step: WizardStepId) => void;
  updateGoal: (data: Partial<StudioGoalConfig>) => void;
  updateContent: (data: Partial<StudioContentConfig>) => void;
  updateCustomization: (data: Partial<StudioCustomization>) => void;
  updateAgentStatus: (agentId: AgentId, status: AgentStatus) => void;
  addComponent: (component: FactoryComponent) => void;
  removeComponent: (id: string) => void;
  reorderComponents: (fromIndex: number, toIndex: number) => void;
  resetStudio: () => void;
}
```

---

## 📐 Pedagojik Güvenlik Kapıları (Elif Yıldız)

Her wizard adımında çalışan 6 güvenlik kapısı:

```
ADIM 1: HEDEF
╔══════════════════════════════════════════════════════════════╗
║ 🚦 KAPI 1: Profil-Yaş Tutarlılık                          ║
║ → AgeGroup + LearningDisabilityProfile + Difficulty uyumu  ║
║ → '5-7' + 'Zor' → UYARI: "Bu yaş grubunda Zor seviye     ║
║   frustrasyon riski taşır. Orta önerilir."                 ║
╚══════════════════════════════════════════════════════════════╝

ADIM 2: İÇERİK
╔══════════════════════════════════════════════════════════════╗
║ 🚦 KAPI 2: Tanı Koyucu Dil Taraması                       ║
║ → Kullanıcı girdileri + AI çıktıları → regex tarama       ║
║ → "disleksisi var" → otomatik düzelt + uyar               ║
╠══════════════════════════════════════════════════════════════╣
║ 🚦 KAPI 3: Bilişsel Yük Kontrolü                          ║
║ → Yönerge > 2 cümle → UYARI                               ║
║ → Max 5 öğe/satır, max 3 cümle/yönerge                    ║
╚══════════════════════════════════════════════════════════════╝

ADIM 3: ÖZELLEŞTİRME
╔══════════════════════════════════════════════════════════════╗
║ 🚦 KAPI 4: Başarı Mimarisi Doğrulama                      ║
║ → İlk 2 madde zorunlu olarak internalLevel ≤ 2            ║
║ → Zorluk artışı kademeli mi?                               ║
║ → Son madde öncekinden kolay (güvenle bitirme)             ║
║ → Spiral zorluk: zor maddeden sonra kolay reset            ║
╚══════════════════════════════════════════════════════════════╝

ADIM 4: ÖNİZLEME
╔══════════════════════════════════════════════════════════════╗
║ 🚦 KAPI 5: Pedagojik Not Kalitesi                          ║
║ → pedagogicalNote ≥ 30 karakter?                           ║
║ → Jenerik ifade testi (kara liste regex)?                  ║
║ → TargetSkill bağlantısı var mı?                           ║
╠══════════════════════════════════════════════════════════════╣
║ 🚦 KAPI 6: KVKK & Erişilebilirlik                         ║
║ → Öğrenci adı + tanı birlikte → ENGELLE                   ║
║ → Lexend font korunmuş mu? → ENGELLE                      ║
║ → Görsel kalabalık (>5 öğe/satır) → UYARI                 ║
╚══════════════════════════════════════════════════════════════╝

ADIM 5: ADMİN ONAYI
→ Tüm kapılar geçilmişse taslak admin'e sunulur
```

---

## 🤖 AI Orkestrasyon Pipeline (Selin Arslan)

### Pipeline Akışı

```
Wizard Step 1 (Hedef)
    → AI çağrısı YOK (sadece form doldurma)

Wizard Step 2 (İçerik) — "Konsept Öner" butonu
    → [1] Fikir Üretim Ajanı (temperature=0.7)
    → Kullanıcı konsept seçer
    → [2] İçerik Tasarım Ajanı ─┐ (temperature=0.2)
    → [3] Görsel & Şablon Ajanı ─┘ ← PARALEL (Promise.allSettled)

Wizard Step 3 (Özelleştirme)
    → AI çağrısı YOK (kullanıcı UI'da ayar yapar)

Wizard Step 4 (Önizleme) — otomatik
    → [4] Zamanlama & Akış Ajanı (temperature=0.2)
    → [5] Değerlendirme Ajanı (temperature=0.1)

Wizard Step 5 (Onay) — "Admin Onayına Gönder" butonu
    → [6] Entegrasyon Ajanı (temperature=0.0) — format dönüşüm
```

### Token Maliyeti Tahmini

| Ajan | Input Token | Output Token | Temperature | Tahmini Maliyet |
|------|-------------|--------------|-------------|-----------------|
| Fikir Üretim | ~400 | ~600 | 0.7 | $0.000210 |
| İçerik Tasarım | ~800 | ~1500 | 0.2 | $0.000510 |
| Görsel & Şablon | ~500 | ~800 | 0.2 | $0.000278 |
| Zamanlama & Akış | ~600 | ~500 | 0.2 | $0.000195 |
| Değerlendirme | ~700 | ~600 | 0.1 | $0.000233 |
| Entegrasyon | ~1200 | ~400 | 0.0 | $0.000210 |
| **TOPLAM** | **~4200** | **~4400** | — | **~$0.002** |

### 3 Katmanlı Cache Stratejisi

```
Katman 1: Adım Bazlı Cache (cacheService.ts genişletmesi)
├── Aynı konsept + aynı parametre → cache'den dön
├── Cache key: hash(agentId + conceptHash + ageGroup + difficulty + profile)

Katman 2: Kısmi Sonuç Cache
├── Kullanıcı sadece Adım 3'ü değiştirdi → 1-2-4-5 cache'den
├── Adım N değişimi → adım N ve N+1..6 invalidate

Katman 3: Şablon Cache (popüler kombinasyonlar)
├── "Disleksi — Hece Farkındalığı — 8-10 yaş — Orta" gibi sık kullanılanlar
├── Pre-cached sonuçlar → anında yükleme
```

### Prompt Stratejisi

Her ajan kendi uzmanlaşmış prompt'una sahip + ortak context header:

```typescript
// SHARED CONTEXT HEADER — tüm ajanlar alır (~100 token)
const sharedContext = `
[OOGMATIK ULTRA STÜDYO]
Hedef Kitle: ${ageGroup} yaş, ${profile} profili
Zorluk: ${difficulty} (internal: ${internalLevel}/10)
Konu: ${topic}
MEB Kazanımı: ${curriculum || 'Belirtilmedi'}
KISITLAR: Tanı koyucu dil YASAK. Lexend font. pedagogicalNote ZORUNLU.
`;

// AJAN-ÖZEL PROMPT — dar kapsamlı (~200 token)
// Her ajan sadece kendi görevine odaklanır
```

### 5 Katmanlı Hallucination Savunması

1. **Prompt Kısıtlama**: Açık uçlu üretim yerine "seç ve genişlet" pattern'ı
2. **JSON Schema Zorlama**: Gemini structured output (responseSchema)
3. **Post-Generation Validation**: pedagogicValidator + clinicalValidator
4. **Temperature Kontrolü**: Ajan bazlı temperature (0.0 — 0.7 arası)
5. **Human-in-the-Loop**: Wizard step 4'te öğretmen preview + düzenleme

### Prompt Injection Koruması

```typescript
// Seviye 1: Input sanitization
const sanitizeField = (value: string, maxLen: number): string => {
  return value
    .replace(/ignore previous|you are now|forget your|system:|<\/?script>/gi, '')
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F]/g, '')
    .trim()
    .substring(0, maxLen);
};

// Seviye 2: Prompt izolasyon
// Kullanıcı girdisi ASLA system instruction'a girmez
// [KULLANICI GİRDİSİ BAŞLANGIÇ] ... [BİTİŞ] delimiter

// Seviye 3: Output validation
// JSON schema + beklenmeyen alan/değer tespiti
```

### Input Limitleri

```typescript
const INPUT_LIMITS = {
  topic: 200,             // Konu başlığı
  theme: 100,             // Tema
  customNotes: 500,       // Öğretmen notları
  stepDescription: 300,   // Adım açıklaması
  title: 150,             // Etkinlik başlığı
  scenario: 1000,         // Senaryo metni
};
```

---

## 🔏 KVKK & Klinik Uyumluluk (Dr. Ahmet Kaya)

### Birlikte Görünmemesi Gereken Veriler

| Veri A | Veri B | Kural |
|--------|--------|-------|
| Öğrenci adı-soyadı | Tanı bilgisi | Anonim ID kullan |
| Öğrenci adı | Performans skoru | Hash veya takma ad |
| Tanı bilgisi | Test puanları | Ayrı görünümler |
| Öğrenci adı | BEP hedef detayları | BEP'te ID kullan |
| Veli iletişim | Tanı + skor | Veri şifrele |

### Stüdyo PII Kuralları

- AI ajanlarına öğrenci ismi, sınıf, okul gibi PII **asla** gönderilmez
- Prompt'a yalnızca `AgeGroup`, `Difficulty`, `LearningDisabilityProfile` gider
- Export edilen PDF'te ad + tanı birlikte **görünmez**

### Tanı Koyucu Dil Kontrol Mekanizması

```typescript
// Yasaklı ifade regex listesi
const DIAGNOSTIC_LANGUAGE_PATTERNS = [
  /disleksisi\s+var/gi,
  /dislektik\s+(çocuk|öğrenci|birey)/gi,
  /DEHB['']?li/gi,
  /engelli\s+(çocuk|öğrenci)/gi,
  /geri\s+zekalı/gi,
  /öğrenme\s+güçlüğü\s+çeken/gi,
  /normal\s+(çocuk|öğrenci)/gi,
  /hasta\s+(çocuk|öğrenci)/gi,
  /bozukluk\s+sahibi/gi,
  /özürlü/gi,
];

// Doğru ifade dönüşüm tablosu
const CORRECTION_MAP: Record<string, string> = {
  'disleksisi var': 'disleksi desteğine ihtiyacı var',
  'dislektik çocuk': 'disleksi desteği alan çocuk',
  "DEHB'li": 'DEHB desteği alan',
  'engelli çocuk': 'özel gereksinimli çocuk',
  'öğrenme güçlüğü çeken': 'öğrenme güçlüğü yaşayan',
};
```

### MEB Özel Eğitim Yönetmeliği Onay Kontrolleri

**Taslak Aşaması:**
- [ ] Yaş grubu uyumu (AgeGroup eşleşmesi)
- [ ] MEB kazanım eşleşmesi (2024-2025 müfredatında mevcut)
- [ ] Profil kapsamı (en az 1 LearningDisabilityProfile)
- [ ] pedagogicalNote var
- [ ] Tanı koyucu dil taraması geçti

**İnceleme Aşaması:**
- [ ] Bilimsel kanıt (hangi müdahale programına dayanıyor?)
- [ ] Kontraendikasyon kontrolü (frustrasyon riski?)
- [ ] Zorluk kalibrasyonu (başarı mimarisi korunuyor mu?)
- [ ] Kültürel uygunluk (Türk kültürüne uygun mu?)

---

## 🎨 LearningDisabilityProfile Arayüz Uyarlamaları

### `dyslexia` — Disleksi Profili
- **Tipografi**: Lexend, 18px+, line-height 1.8+, letter-spacing 0.05em
- **Renk Kodlama**: Heceler farklı renk, sesli/sessiz harf vurgulama
- **İçerik**: Uzun paragraflar max 3 cümle, b-d/p-q karışıklığı içeren kelimelerden kaçın
- **Varsayılan**: Fonolojik farkındalık, hece ayrıştırma öne çıkar

### `dyscalculia` — Diskalkuli Profili
- **Görsel Destek**: CRA basamakları otomatik, sayı çizgisi, manipulatif bloklar
- **Sayı Gösterimi**: Büyük punto, basamak renklendirme (birler/onlar/yüzler)
- **İçerik**: Soyut matematik → somut temsil zorunlu
- **Varsayılan**: Sihirli piramit, saat okuma, sayı-nesne eşleştirme

### `adhd` — DEHB Profili
- **Mikro-görevler**: Her adım max 2-3 dakika, ilerleme çubuğu görünür
- **Zamanlayıcı**: Opsiyonel Pomodoro-mini (5dk/1dk)
- **Görsel Sadelik**: Minimum distraktör, tek odak, beyaz alan bolluğu
- **Varsayılan**: Kısa sürede tamamlanan, anında geri bildirimli

### `mixed` — Karma Profil
- Birincil + ikincil profil seçilir, birincil UI'ı belirler
- En yoğun scaffold seviyesi uygulanır
- Tüm destekler (Lexend + CRA + Mikro-görev) etkin, kullanıcı kapatabilir

---

## 🧩 Wizard Akışı Detayı

### Wizard Finite State Machine

```typescript
const WIZARD_TRANSITIONS: Record<WizardStepId, WizardStepId[]> = {
  goal:      ['content'],                  // sadece ileri
  content:   ['goal', 'customize'],        // geri + ileri
  customize: ['content', 'preview'],       // geri + ileri
  preview:   ['customize', 'approval'],    // geri + ileri
  approval:  ['preview'],                  // sadece geri (red → preview)
};
```

### Adım 1: Hedef & Kapsam (StepGoal.tsx)

Kullanıcı ayarlar:
- Etkinlik türü ve kategorisi (mevcut aktivite listesi + "Yeni Kategori Tanımla")
- Hedef kitle: AgeGroup, LearningDisabilityProfile
- Zorluk: Kolay/Orta/Zor (alt kademeler sistem tarafından ayarlanır)
- Süre, format, katılımcı aralığı
- Hedef beceriler (targetSkills)
- MEB kazanım kodu (dropdown — AI üretmez, hallucination önlemi)

**AI aksiyonu**: Yok (sadece form)
**Pedagojik kapı**: KAPI 1 — Profil-Yaş Tutarlılık

### Adım 2: İçerik & Bileşen Tasarımı (StepContent.tsx)

Kullanıcı:
1. "Konsept Öner" → Fikir Üretim Ajanı 3 konsept sunar
2. Konsept seçer veya kendi yazar
3. "Oluştur" → İçerik + Görsel ajanları paralel çalışır
4. AI çıktılarını düzenleyebilir

AI aksiyonları:
- **"Tek Tıkla Doldur"**: Tüm alanları AI ile doldur
- **"Geliştir"**: Mevcut içeriği zenginleştir
- **"Kısalt"**: İçeriği özetle
- **"Uzun Versiyon Üret"**: Detaylı versiyonu oluştur

**Pedagojik kapılar**: KAPI 2 (tanı dili) + KAPI 3 (bilişsel yük)

### Adım 3: Ultra Özelleştirme (StepCustomize.tsx)

Drag-and-drop bileşen fabrikası aktif:
- Bileşen paleti: TextBlock, ImageBlock, QuizBlock, TimerBlock, ScoringBlock, QRBlock, WatermarkBlock, LogoBlock
- Canvas: bileşenleri sürükle-bırak ile düzenle
- Panel: her bileşenin detaylı ayarları

Özelleştirme ayarları:
- Görsel stil: renk paleti, kenar boşlukları, arka plan
- Markalama: logo, QR, filigran
- İnteraktiflik: zamanlayıcı, puanlama, zorluk slider
- Alternatif senaryolar: Plan A/B, online/kısa versiyonlar
- Modüler adımlar: her adımı toggle ile aç/kapat

**Pedagojik kapı**: KAPI 4 — Başarı Mimarisi Doğrulama

### Adım 4: Önizleme (StepPreview.tsx)

İki görünüm modu:
1. **Öğrenci Gözüyle Gör**: Etkinliğin öğrenci arayüzündeki görünümü
2. **Admin Gözüyle Gör**: Metadata, pedagojik not, onay bilgileri

AI aksiyonları:
- Zamanlama & Akış Ajanı → adım planı oluşturur
- Değerlendirme Ajanı → KPI ve rubric önerir
- **"AI İyileştirme Önerileri"**: Etkinliği zenginleştirmek için alternatif adım/oyun önerileri

Fonksiyonlar:
- 💾 Kaydet (Taslak): IndexedDB + Firestore draft store
- 📥 İndir: PDF (yüksek çözünürlük), PNG, JSON
- 🖨️ Yazdır: Optimize baskı önizleme
- 📚 Çalışma Kitapçığına Ekle: Workbook entegrasyonu

**Pedagojik kapılar**: KAPI 5 (pedagojik not kalitesi) + KAPI 6 (KVKK + erişilebilirlik)

### Adım 5: Admin Onayına Gönder (StepApproval.tsx)

1. Tüm 6 kapı geçtiyse → "Admin Onayına Gönder" butonu aktif
2. Entegrasyon Ajanı çalışır → sonucu admin formatına dönüştürür
3. Taslak admin paneline düşer (AdminDashboardV2 "Onay Bekleyenler" sekmesi)

Admin panelinde:
- Etkinlik bilgileri, içerik, bileşenler, ayarlar, görseller görünür
- Tanı dili rozeti: ✅ Temiz | ⚠️ Şüpheli | ❌ Yasaklı
- Pedagojik kontrol rozeti: ✅ Geçti | ❌ Kapı ihlali
- **Onay**: Kataloga eklenir, kategoriye bağlanır, filtrelere eklenir
- **Revize İste**: Geri döner + revizyon notları
- **Reddet**: Gerekçe zorunlu, audit trail kaydedilir

---

## 🔗 Mevcut Sistem Entegrasyonu

### View Routing (types/core.ts)

```typescript
// Mevcut View union'a eklenecek:
export type View =
  | ... mevcut ...
  | 'activity-studio';
```

### App.tsx — Lazy Load

```typescript
const ActivityStudio = lazy(() =>
  import('./components/ActivityStudio').then(m => ({ default: m.ActivityStudio }))
);

// Routing bloğunda:
{currentView === 'activity-studio' && (
  <Suspense fallback={<SkeletonLoader />}>
    <ActivityStudio
      onBack={handleGoBack}
      onAddToWorkbook={handleAddToWorkbookGeneral}
    />
  </Suspense>
)}
```

### Sidebar.tsx — Navigasyon

```typescript
// studioGroups'a eklenecek:
{
  id: 'activity-studio',
  label: 'Ultra Etkinlik Stüdyosu',
  icon: Wand2,  // lucide-react
  premium: false,
  onClick: () => setCurrentView('activity-studio'),
}
```

### ContentArea.tsx — View Routing

```typescript
case 'activity-studio':
  return <ActivityStudio ... />;
```

### ActivityService Köprüsü

Stüdyodan üretilen etkinlikler, mevcut `ActivityOutput` formatına dönüştürülür:

```typescript
function toActivityOutput(studioOutput: UltraStudioOutput): ActivityOutput {
  return {
    items: studioOutput.components.map(toActivityItem),
    pedagogicalNote: studioOutput.metadata.pedagogicalNote,
    difficultyLevel: studioOutput.goal.difficulty,
    targetSkills: studioOutput.goal.targetSkills,
    ageGroup: studioOutput.goal.ageGroup,
    profile: studioOutput.goal.profile,
  };
}
```

### Çalışma Kitapçığı Entegrasyonu

```typescript
// Birden fazla stüdyo etkinliğini tek bir workbook'ta birleştirme
const addStudioActivityToWorkbook = (
  output: UltraStudioOutput,
  workbookId: string
) => {
  const activityOutput = toActivityOutput(output);
  useWorksheetStore.getState().addToWorkbook(workbookId, {
    type: output.goal.activityType,
    data: activityOutput,
    style: output.customization,
  });
};
```

---

## 🧪 API Endpoint Detayları

### POST /api/activity-studio/generate

```typescript
// Request
{
  goal: StudioGoalConfig,
  agents: AgentId[],               // ['ideation', 'content', 'visual']
  customization?: StudioCustomization,
  userId: string
}

// Response: ApiResponse<Record<AgentId, unknown>>
{
  success: true,
  data: {
    ideation: { concepts: [...] },
    content: { items: [...], pedagogicalNote: "..." },
    visual: { layout: {...}, suggestions: [...] }
  },
  timestamp: "2026-04-13T..."
}
```

**Rate limit**: 10 istek/dakika
**Validation**: Zod schema
**Error**: AppError standardı

### POST /api/activity-studio/approve

```typescript
// Request (RBAC: admin only)
{
  activityId: string,
  action: 'approve' | 'revise' | 'reject',
  reason: string,
  clinicalCheck: boolean,
  languageCheck: boolean,
  pedagogicCheck: boolean
}

// Response: ApiResponse<{ status: ApprovalStatus }>
```

**Rate limit**: 30 istek/dakika

### POST/GET/PUT /api/activity-studio/draft

```typescript
// POST: Yeni taslak kaydet
// GET: Kullanıcının taslaklarını listele
// PUT: Taslak güncelle
```

**Rate limit**: 20 istek/dakika

### POST /api/activity-studio/export

```typescript
// Request
{
  activityId: string,
  format: 'pdf' | 'png' | 'json',
  quality?: 'standard' | 'high'    // PDF: 150 vs 300 DPI
}
```

**Rate limit**: 5 istek/dakika (CPU-intensive)

---

## 🧪 Test Stratejisi

```
tests/activityStudio/
├── types.test.ts                    ← Tip doğrulama (Zod schema)
├── pedagogicValidator.test.ts       ← 6 güvenlik kapısı testleri
├── clinicalValidator.test.ts        ← Tanı dili + KVKK testleri
├── agentOrchestrator.test.ts        ← AI pipeline testleri (mock Gemini)
├── wizardState.test.ts              ← FSM geçiş testleri
├── componentFactory.test.ts         ← DnD bileşen CRUD testleri
├── approvalPipeline.test.ts         ← Onay/red akış testleri
├── exportEngine.test.ts             ← PDF/PNG/JSON export testleri
└── integration.test.ts              ← Uçtan uca entegrasyon
```

### Kritik Test Senaryoları

1. **Pedagojik kapılar**: Her kapı için geçen/kalan test case
2. **Tanı dili**: 10+ yasaklı ifade regex testi
3. **Başarı mimarisi**: items[0-1] internalLevel ≤ 2 kontrolü
4. **KVKK**: PII ayrıştırma, ad+tanı birlikte görünmeme testi
5. **Wizard FSM**: Geçersiz geçiş engelleme testi
6. **AI pipeline**: Mock Gemini ile sıralı + paralel pipeline testi
7. **Cache invalidation**: Adım değişikliğinde doğru cache temizleme

---

## 📋 Uygulama Görev Listesi (Task Breakdown)

### Faz 1: Temel — Tip Sistemi & Store (Tahmini: 2-3 görev)

- [ ] **Task 1**: `types/activityStudio.ts` oluştur, `types/index.ts`'e barrel export ekle
- [ ] **Task 2**: `store/useActivityStudioStore.ts` oluştur (Zustand)
- [ ] **Task 3**: `utils/schemas.ts`'e Ultra Stüdyo Zod şemalarını ekle

### Faz 2: Doğrulama Motoru (Tahmini: 3 görev)

- [ ] **Task 4**: `components/ActivityStudio/validation/pedagogicValidator.ts` + test
- [ ] **Task 5**: `components/ActivityStudio/validation/clinicalValidator.ts` + test (tanı dili regex)
- [ ] **Task 6**: `components/ActivityStudio/validation/contentValidator.ts` + test

### Faz 3: AI Ajan Pipeline (Tahmini: 4 görev)

- [ ] **Task 7**: `AgentOrchestrator.ts` + individual agent stubs + test
- [ ] **Task 8**: `IdeationAgent.ts` + `ContentAgent.ts` (Gemini prompt)
- [ ] **Task 9**: `VisualAgent.ts` + `FlowAgent.ts` + `EvaluationAgent.ts`
- [ ] **Task 10**: `IntegrationAgent.ts` + pipeline caching

### Faz 4: Wizard UI (Tahmini: 5 görev)

- [ ] **Task 11**: `WizardContainer.tsx` + `StepGoal.tsx`
- [ ] **Task 12**: `StepContent.tsx` (AI çağrı entegrasyonu)
- [ ] **Task 13**: `StepCustomize.tsx` + DnD Bileşen Fabrikası (ComponentFactory + blocks)
- [ ] **Task 14**: `StepPreview.tsx` + `StudentEyeView.tsx`
- [ ] **Task 15**: `StepApproval.tsx` + Admin panel entegrasyonu

### Faz 5: API Endpoints (Tahmini: 3 görev)

- [ ] **Task 16**: `api/activity-studio/generate.ts` (RateLimiter + Zod + orkestrasyon)
- [ ] **Task 17**: `api/activity-studio/approve.ts` + `draft.ts` (RBAC:admin)
- [ ] **Task 18**: `api/activity-studio/export.ts` (PDF/PNG/JSON)

### Faz 6: Platform Entegrasyonu (Tahmini: 3 görev)

- [ ] **Task 19**: `types/core.ts` View union + `App.tsx` lazy-load + `Sidebar.tsx` nav
- [ ] **Task 20**: `ContentArea.tsx` routing + Workbook entegrasyonu
- [ ] **Task 21**: Admin Dashboard "Onay Bekleyenler" sekmesi entegrasyonu

### Faz 7: Export & Paylaşma (Tahmini: 2 görev)

- [ ] **Task 22**: `preview/ExportEngine.ts` (PDF 300DPI + PNG + JSON)
- [ ] **Task 23**: `preview/ShareEngine.ts` (link paylaşma + klonlama)

### Faz 8: Doğrulama & Test (Tahmini: 2 görev)

- [ ] **Task 24**: Tüm test suite'ini çalıştır, edge case'leri ekle
- [ ] **Task 25**: E2E Playwright testi + build doğrulama

**Toplam: 25 görev, 8 faz**

---

## 🎯 Başarı Kriterleri

1. ✅ Wizard 5 adımda sorunsuz ilerler ve geri dönebilir
2. ✅ 6 AI ajan pipeline'ı sıralı + paralel çalışır (2+3 paralel)
3. ✅ pedagogicalNote her çıktıda ≥30 karakter, spesifik
4. ✅ Tanı koyucu dil %100 filtrelenir
5. ✅ KVKK: PII hiçbir yerde AI'a gönderilmez
6. ✅ İlk 2 madde her zaman kolay (başarı mimarisi)
7. ✅ Lexend font tüm çıktılarda korunur
8. ✅ Admin onay/revize/red pipeline çalışır
9. ✅ PDF/PNG/JSON export çalışır
10. ✅ Çalışma kitapçığı entegrasyonu çalışır
11. ✅ Mevcut 150+ aktivite tipi referans olarak listelenir
12. ✅ Tüm Vitest testleri geçer
13. ✅ `npm run build` hatasız tamamlanır
14. ✅ AppError standardı tüm endpoint'lerde kullanılır
15. ✅ `any` tipi hiçbir yerde kullanılmaz

---

## ⚠️ Riskler ve Mitigasyon

| Risk | Etki | Mitigasyon |
|------|------|-----------|
| 6 AI ajan çağrısı yavaş | Kullanıcı bekler | Paralel adımlar (2+3), katmanlı cache, progress göstergesi |
| Token maliyeti bütçeyi aşar | Maliyet artışı | Rate limit (10/dk), cache, temperature kontrolü |
| AI hallucination pedagojik içerikte | Çocuğa zarar | 5 katmanlı savunma, human-in-the-loop, MEB dropdown |
| Wizard state kaybı | Kullanıcı hayal kırıklığı | Auto-save her adımda, IndexedDB draft |
| Admin onay darboğazı | Katalog büyümez | Batch onay, otomatik pre-kontroller |

---

*Bu plan, 4 uzman ajanın (Elif Yıldız, Dr. Ahmet Kaya, Bora Demir, Selin Arslan) ortak direktifleriyle hazırlanmıştır.*
*Son güncelleme: 2026-04-13*

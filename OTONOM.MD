# Oogmatik Otonom Etkinlik Üretim Sistemi — Derinlemesine Analiz & Geliştirme Planı

## Durum Özeti

Mevcut otonom sistem **~%40** tamamlanmış durumda. İki ana erişim katmanı var:
1. **Admin UI** (`AdminActivityScaffold.tsx`) — 4 adımlı sihirbaz arayüzü
2. **IDE/CLI** (`scaffoldCLI.ts` + `create-activity.md` workflow)

Her ikisi de ortak bir motor kullanıyor: `ActivityScaffoldEngine.ts`

---

## 📊 Mevcut Dosya Haritası

| Dosya | Satır | Durum | Kritik Sorun |
|---|---|---|---|
| `AdminActivityScaffold.tsx` | 256 | ⚠️ Kısmi | Step 2 (Veri Modeli) placeholder, validation yok |
| `ActivityScaffoldEngine.ts` | 174 | ⚠️ Kısmi | 14 entegrasyon noktasından 3'ü çalışıyor |
| `scaffoldCLI.ts` | 46 | ⚠️ Kısmi | `npm run scaffold` script yok, hata yönetimi zayıf |
| `api/admin/scaffold.ts` | 38 | 🔴 Kritik | Auth yok, RBAC yok, rate limit yok, Zod validation yok |
| `types.ts` (scaffold) | 62 | ✅ İyi | Blueprint interface iyi tanımlanmış |
| `templates/dataType.template.txt` | 17 | ⚠️ Kısmi | Handlebars `#each` kullanıyor ama motor desteklemiyor |
| `templates/aiGenerator.template.txt` | 40 | ⚠️ Kısmi | Handlebars `#each`/`#unless` kullanıyor ama motor desteklemiyor |
| `registry.ts` | 545 | ✅ İyi | 100+ aktivite kayıtlı, ama auto-inject yok |
| `OTONOM.MD` | 100 | ⚠️ Eski | Belge güncel değil, gerçek durumu yansıtmıyor |
| `create-activity.md` (workflow) | 37 | ⚠️ Kısmi | `_boilerplate/` referansı var ama klasör yok |
| `semantic-linker.json` | 62 | ✅ İyi | Çalışan referans blueprint |
| `runner.test.ts` | 18 | 🔴 Kritik | Test assertion yok (`console.log` ile log) |

---

## 🔴 Kritik Hatalar (Acil Düzeltme)

### H1. API Güvenlik Açığı
**Dosya:** `api/admin/scaffold.ts`
- Auth middleware yok — herhangi biri `POST /api/admin/scaffold` çağırabilir
- Zod input validation yok — zararlı blueprint gönderilene karşı savunmasız
- `process.cwd()` Vercel serverless'ta anlamsız — dosya sistemi **read-only**
- Rate limiting yok

### H2. Vercel Ortam Uyumsuzluğu
**Dosya:** `ActivityScaffoldEngine.ts` + `api/admin/scaffold.ts`
- Motor `fs.writeFileSync` + `fs.mkdirSync` kullanıyor
- Vercel serverless ortamında dosya yazma __imkansız__
- Admin UI'dan tetikleme çalışamaz — sadece CLI/IDE ortamında çalışabilir

### H3. Template Engine Uyumsuzluğu
**Dosyalar:** `templates/*.template.txt`
- Template'ler Handlebars sözdizimi kullanıyor: `{{#each}}`, `{{#unless}}`, `{{this}}`
- Ama `ActivityScaffoldEngine.renderTemplate()` sadece basit `replace` kullanıyor
- **Sonuç:** Dinamik alanlar (item fields, rules listesi) üretilemez

### H4. Eksik Entegrasyon Noktaları
**Dosya:** `ActivityScaffoldEngine.ts` → `injectIntegrations()`
- OTONOM.MD'de 14 entegrasyon noktası belgelenmiş, sadece 2'si kodlanmış:
  - ✅ `ActivityType` enum enjeksiyonu
  - ✅ `ACTIVITIES` sabit dizisi enjeksiyonu
  - ❌ `registry.ts` generator mapping — YOK
  - ❌ `SheetRenderer.tsx` routing — YOK
  - ❌ `activity-configs/index.ts` panel kaydı — YOK
  - ❌ `offlineGenerators/index.ts` export — YOK
  - ❌ `generators/index.ts` export — YOK

### H5. Eksik Şablonlar
**Dizin:** `src/tools/scaffold/templates/`
- Sadece 2 şablon var: `dataType`, `aiGenerator`
- Eksik:
  - ❌ `offlineGenerator.template.txt`
  - ❌ `worksheetUI.template.txt` (A4 Render)
  - ❌ `configPanel.template.txt` (Ayar Paneli)
  - ❌ `index.template.txt` (Barrel export)

### H6. Boilerplate Modül Yok
**Referans:** `create-activity.md` workflow → `src/modules/activities/_boilerplate/`
- Workflow bu referans klasörü gösteriyor ama **mevcut değil**

---

## ⚠️ Orta Öncelikli Eksiklikler

### E1. Admin UI — Step 2 (Veri Modeli) Tamamlanmamış
- "Gelişmiş Alan Düzenleyici Yakında..." placeholder mesajı
- Kullanıcı veri alanlarını tanımlayamıyor
- Sadece JSON önizlemesi gösterilirk

### E2. Admin UI — Validation Yok
- `blueprint.identity.key` boş bırakılabilir
- Enum Key formatı doğrulanmıyor (büyük/küçük harf, özel karakter)
- Adım atlama engeli yok (boş adımlar geçilebilir)

### E3. Admin UI — Blueprint Önizleme Yok
- Step 4'te sadece "Onayla ve Üret" butonu var
- Üretilecek dosyaların listesi gösterilmiyor
- Blueprint JSON önizlemesi yok

### E4. Admin UI — İkon Seçici Yok
- `icon` alanı sadece metin input
- FontAwesome ikon galerisi seçici entegre değil

### E5. Admin UI — Kategori Seçici
- `categoryId` sabit değer (`'reading-verbal'`) — seçilebilir değil
- Mevcut kategori listesinden seçim yapılmalı

### E6. CLI Entegrasyonu Eksik
- `package.json`'da `"scaffold"` script yok
- `npx oogmatik-scaffold` komutu tanımsız
- CLI verbose mode yok

### E7. Test Kapsamı Yetersiz
- `runner.test.ts`'de assertion yok — sadece `console.log`
- Motor yanlış bile çalışsa test geçer
- Birim test yok: `renderTemplate`, `injectIntoEnum`, `injectIntoArray`

### E8. ActivityValidator Yok
- OTONOM.MD'de belgelenen doğrulama katmanı hiçbir yerde kodlanmamış:
  - TypeScript syntax check
  - `pedagogicalNote` alanı kontrolü
  - Import bütünlüğü doğrulama
  - Lexend font uyumluluk kontrolü

### E9. Registry Auto-Inject
- Motor ürettiği etkinliği [registry.ts](file:///c:/Users/Administrator/Desktop/oogmatik/src/services/generators/registry.ts)'ye kaydetmiyor
- Üretilen etkinlik hiçbir zaman frontend'den çağrılamaz

### E10. Workflow ↔ Engine Senkronizasyonu
- `create-activity.md` workflow modüller arası farklı adımlar tariflyor
- Engine'in ürettiği dosya yapısı workflow'dan farklı
- Workflow `generateFastMode`/`generateDeepAIMode` isterken Engine `generate{KEY}FromAI` üretiyor

---

## 🟢 Çalışan Yapılar

| Yapı | Durum |
|---|---|
| `ActivityBlueprint` tip tanımı | ✅ İyi yapılandırılmış |
| `identity` form adımı (Step 1) | ✅ Çalışıyor |
| `ACTIVITIES` sabit enjeksiyonu | ✅ Safe Insertion mantığı doğru |
| `ActivityType` enum enjeksiyonu | ✅ Virgül yönetimi mevcut |
| CLI temel akış (`scaffoldCLI.ts`) | ✅ Blueprint okuma ve motor çağrısı doğru |
| `semantic-linker.json` referans blueprint | ✅ Kapsamlı ve test edilebilir |
| `AI Generator` template temel yapı | ✅ (Handlebars sorunu hariç) |

---

## 📋 Geliştirme Planı (6 Faz)

### Faz 1 — Motor Çekirdeği (Engine Core Fix)
**Öncelik:** 🔴 Kritik | **Süre:** ~2 saat

#### [MODIFY] [ActivityScaffoldEngine.ts](file:///c:/Users/Administrator/Desktop/oogmatik/src/tools/scaffold/ActivityScaffoldEngine.ts)
- Handlebars-benzeri şablon motoru: `{{#each}}`, `{{#unless}}`, `{{this}}` desteği
- Eksik 5 enjeksiyon noktası ekleme:
  - `registry.ts` → `GeneratorMapping` satırı
  - `generators/index.ts` → export satırı
  - `offlineGenerators/index.ts` → export satırı
  - `SheetRenderer.tsx` → case bloğu
  - `activity-configs/index.ts` → panel kaydı
- `console.log` → `logInfo` / `logError` dönüşümü
- `any` tipleri → `unknown` + type guard

#### [NEW] `src/tools/scaffold/ActivityValidator.ts`
- `validateBlueprint()` — Zod şeması ile girdi doğrulama
- `validateGeneratedFiles()` — Üretilen dosyaların import bütünlüğü
- `checkPedagogicalRequirements()` — `pedagogicalNote` kontrol

---

### Faz 2 — Eksik Şablonlar
**Öncelik:** 🔴 Kritik | **Süre:** ~1.5 saat

#### [NEW] `templates/offlineGenerator.template.txt`
- Algoritmik offline generator şablonu
- `generateOffline{KEY}` fonksiyon imzası

#### [NEW] `templates/worksheetUI.template.txt`
- A4 render bileşeni (Lexend font, compact grid, 0.5cm margin)
- `items.map()` yapısı

#### [NEW] `templates/configPanel.template.txt`
- Dark glassmorphism config paneli
- Blueprint'teki `configFields` dizisinden otomatik render

#### [NEW] `templates/index.template.txt`
- Barrel export (types + generators + UI)

---

### Faz 3 — Admin UI Tamamlama
**Öncelik:** ⚠️ Orta | **Süre:** ~2 saat

#### [MODIFY] [AdminActivityScaffold.tsx](file:///c:/Users/Administrator/Desktop/oogmatik/src/components/Admin/AdminActivityScaffold.tsx)
- **Step 2 (Veri Modeli):** Dinamik alan düzenleyici (sürükle-bırak veya form tabanlı)
- **Step 4 (Onay):** Blueprint JSON önizleme + dosya listesi
- **Validation:** Zod ile adım bazlı doğrulama, boş adım atlama engeli
- **İkon Seçici:** FontAwesome ikon galerisi entegrasyonu
- **Kategori Seçici:** Dropdown ile mevcut kategorilerden seçim
- **İlerleme göstergesi:** Motor çalışırken adım adım ilerleme

> [!IMPORTANT]
> Admin UI'dan otonom üretim Vercel ortamında çalışamaz. İki alternatif:
> 1. Dosya içeriklerini Firestore'a kaydet → Geliştirici sonra CLI ile dağıtsın
> 2. GitHub API ile direkt repo'ya PR aç (ileri faz)

---

### Faz 4 — API Güvenlik & Mimari Düzeltme
**Öncelik:** 🔴 Kritik | **Süre:** ~1 saat

#### [MODIFY] [scaffold.ts](file:///c:/Users/Administrator/Desktop/oogmatik/api/admin/scaffold.ts)
- Auth middleware → `validateRequest()` + JWT doğrulama
- RBAC → sadece `admin` rolü
- Zod input validation → `ActivityBlueprint` şeması
- Rate limiting → `rateLimiter.ts` entegrasyonu
- Vercel stratejisi: dosya yazma yerine **blueprint kaydetme** (Firestore)

---

### Faz 5 — CLI & IDE Araçları
**Öncelik:** ⚠️ Orta | **Süre:** ~1.5 saat

#### [MODIFY] `package.json`
- `"scaffold": "tsx src/tools/scaffold/scaffoldCLI.ts"` script ekleme

#### [MODIFY] [scaffoldCLI.ts](file:///c:/Users/Administrator/Desktop/oogmatik/src/tools/scaffold/scaffoldCLI.ts)
- Verbose mode (`--verbose`)
- Dry-run mode (`--dry-run`) — dosya yazmadan önizleme
- Interaktif mod (`--interactive`) — adım adım sorulu

#### [NEW] `src/modules/activities/_boilerplate/`
- `types.ts`, `generators.ts`, `ui/WorksheetUI.tsx`, `ui/ConfigPanel.tsx`, `index.ts`
- Workflow'un referans aldığı şablon modül

#### [MODIFY] [create-activity.md](file:///c:/Users/Administrator/Desktop/oogmatik/.agents/workflows/create-activity.md)
- Engine ile senkronize fonksiyon adlandırma
- Dosya yolu uyumu
- Scaffold CLI komut referansı ekleme

---

### Faz 6 — Doğrulama & Test
**Öncelik:** ⚠️ Orta | **Süre:** ~1 saat

#### [MODIFY] [runner.test.ts](file:///c:/Users/Administrator/Desktop/oogmatik/src/tools/scaffold/runner.test.ts)
- `expect()` assertion'ları ekleme
- Dosya varlığı kontrolü
- Enum enjeksiyon doğrulaması
- Template rendering doğrulaması

#### [NEW] `src/tools/scaffold/validator.test.ts`
- `ActivityValidator` birim testleri
- Geçersiz blueprint reddi
- `pedagogicalNote` kontrolü

---

## Doğrulama Planı

### Otomatik Testler
```bash
# Mevcut test (güncellendikten sonra)
npm run test -- --run src/tools/scaffold/runner.test.ts

# Yeni validator testleri
npm run test -- --run src/tools/scaffold/validator.test.ts

# TypeScript build kontrolü
npx tsc --noEmit 2>&1 | Select-String "scaffold"
```

### Manuel Doğrulama
1. CLI ile test blueprint'i çalıştırma:
   ```bash
   npm run scaffold -- --blueprint src/tools/scaffold/semantic-linker.json --dry-run
   ```
2. Admin panelinde "Otonom Üretim" sekmesini açarak 4 adımı sırayla test etme
3. Üretilen etkinliğin `registry.ts`'ye kayıt olduğunu doğrulama

---

# 🤖 AJAN OTONOM KATMANI — Derinlemesine Analiz (Ek)

## Mevcut Ajan Mimarisi

Projede **3 katmanlı** bir ajan sistemi tanımlanmış:

### Katman 1: 4 Lider Uzman (Simülasyon)
| Ajan | Alan | Tanım Yeri | Runtime Kodu |
|---|---|---|---|
| Elif Yıldız | Pedagoji / ZPD | `GEMINI.md`, `oogmatik-core.md` | ❌ Yok |
| Dr. Ahmet Kaya | Klinik / MEB | `GEMINI.md`, `oogmatik-core.md` | ❌ Yok |
| Bora Demir | Mühendislik | `GEMINI.md`, `oogmatik-core.md` | ❌ Yok |
| Selin Arslan | AI Mimarisi | `GEMINI.md`, `oogmatik-core.md` | ❌ Yok |

> [!CAUTION]
> **4 lider ajan sadece kural dosyalarında tanımlı.** IDE/CLI bu kuralları okuyarak simüle ediyor ama hiçbir runtime kod entegrasyonu yok. Scaffold motoru bu ajanlardan habersiz.

### Katman 2: 6 Fonksiyonel Ajan (Orkestrasyon)
| Ajan | Görev | Runtime Kodu |
|---|---|---|
| Ideation | Stratejik konsept | ❌ Yok |
| Content | Disleksi dostu içerik | ❌ Yok |
| Visual | UI/UX tasarım | ❌ Yok |
| Flow | LXD akış yönetimi | ❌ Yok |
| Evaluation | SMART metrik | ❌ Yok |
| Integration | Final blueprint | ❌ Yok |

### Katman 3: 11 Superpowers Skills (IDE Araçları)
| Skill | Scaffold ile Bağlantı |
|---|---|
| `brainstorming` | ❌ Engine/blueprint entegrasyonu yok |
| `writing-plans` | ⚠️ Plan dosyası `docs/superpowers/plans/` yazar ama scaffold bunu okumaz |
| `executing-plans` | ⚠️ Plan uygular ama scaffold motorunu çağırmaz |
| `subagent-driven-development` | ⚠️ Task dağıtımı yapar ama scaffold context yok |
| `test-driven-development` | ❌ Scaffold test entegrasyonu yok |
| `systematic-debugging` | ❌ Bağlantısız |
| `verification-before-completion` | ❌ Scaffold çıktı doğrulaması yok |
| `finishing-a-development-branch` | ❌ Bağlantısız |
| `using-git-worktrees` | ❌ Bağlantısız |
| `requesting-code-review` | ❌ Bağlantısız |
| `using-superpowers` | ❌ Meta-skill, scaffold referansı yok |

---

## 🔴 Ajan Katmanı Kritik Eksiklikler

### A1. MODULE_KNOWLEDGE.md Mevcut Değil
- `GEMINI.md` ve `oogmatik-core.md` bunu referans ediyor: *"Ajanlar MODULE_KNOWLEDGE.md üzerinden uygulamanın TÜM modüllerine hakimdir"*
- Dosya projede **yok** — ajanların evrensel bilgi hakimiyeti iddiası karşılıksız

### A2. Ajan-Scaffold Orkestrasyonu Yok
- Blueprint üretilirken:
  - ❌ Elif'in pedagojik review'ı uygulanmıyor
  - ❌ Dr. Ahmet'in klinik dil denetimi yok
  - ❌ Bora'nın TypeScript strict kontrolü yok
  - ❌ Selin'in prompt/hallucination kontrolü yok
- `handleProcess()` fonksiyonu doğrudan API'yi çağırıyor — ajan pipeline'ı atlanıyor

### A3. Superpowers ↔ Scaffold Kopuk Döngüsü
- `writing-plans` skill `docs/superpowers/plans/` altına plan yazar
- `executing-plans` skill bu planı adım adım uygular
- Ama scaffold motorunu **hiçbir skill çağırmaz**
- Sonuç: IDE otonomu, scaffold otonomu ve ajan otonomu birbirinden habersiz 3 paralel sistem

### A4. create-activity Workflow Yetersiz
- Workflow doğru adımları tanımlıyor ama:
  - 4 lider ajan denetim adımı yok
  - `verification-before-completion` skill entegrasyonu yok
  - Scaffold engine çağırma komutu yok (`npm run scaffold`)
  - Test yazma adımı yok

### A5. Ajan Denetim Çıktısı Standardı Yok
- Lider ajanların ne format ve standartta onay vereceği tanımlanmamış
- `blueprint.approvals` alanı yok
- Denetim geçmişi kaydedilmiyor

---

## 📋 Ek Geliştirme Fazları (7–9)

### Faz 7 — Ajan Orkestrasyon Pipeline
**Öncelik:** 🔴 Kritik | **Süre:** ~2.5 saat

#### [NEW] `src/tools/scaffold/AgentOrchestrator.ts`
Scaffold sürecine 4 lider ajan denetim katmanı:
```
Blueprint Girer
      ↓
[1] Elif → validatePedagogy(blueprint)
    - ZPD uyumluluğu
    - Başarı anı tasarımı
    - Zorluk kademesi doğru mu?
      ↓
[2] Dr. Ahmet → validateClinical(blueprint)
    - Tanı koyucu dil kontrolü
    - MEB müfredat uyumu
    - KVKK veri alanı taraması
      ↓
[3] Bora → validateEngineering(blueprint)
    - TypeScript strict uyumluluk
    - AppError formatı
    - Import bütünlüğü
      ↓
[4] Selin → validateAI(blueprint)
    - Prompt kalitesi
    - Hallucination risk skoru
    - Token maliyet tahmini
      ↓
Tüm onaylar → Engine.process(blueprint)
```

#### [MODIFY] `ActivityBlueprint` tipi → approval alanı
```typescript
approvals?: {
  pedagogical?: { approved: boolean; notes: string; agent: 'elif' };
  clinical?: { approved: boolean; notes: string; agent: 'ahmet' };
  engineering?: { approved: boolean; notes: string; agent: 'bora' };
  aiQuality?: { approved: boolean; notes: string; agent: 'selin' };
};
```

#### [MODIFY] `AdminActivityScaffold.tsx`
- Step 4 → Ajan onay paneli (her ajanın durumu: ✅/❌/⏳)
- Onay geçemeyen blueprint üretilemez

---

### Faz 8 — Superpowers ↔ Scaffold Entegrasyonu
**Öncelik:** ⚠️ Orta | **Süre:** ~1.5 saat

#### [MODIFY] `create-activity.md` workflow
- Tam revizyon:
  1. Blueprint JSON dosyası oluştur (`docs/superpowers/plans/activity-{name}.json`)
  2. `AgentOrchestrator` denetim pipeline'ını çalıştır
  3. `npm run scaffold -- --blueprint {path}` ile motor çalıştır
  4. `verification-before-completion` skill ile doğrula
  5. Build + test kontrolü

#### [NEW] `.agents/workflows/scaffold-activity.md`
- Detaylı adım adım otonom scaffold workflow
- CLI komutları + ajan denetim entegrasyonu
- `// turbo-all` annotation ile otomatik çalışma

#### [NEW] `.claude/MODULE_KNOWLEDGE.md`
- Tüm modüller, bileşenler ve servisler haritası
- Ajanların "evrensel bilgi hakimiyeti" iddiasına gerçek kaynak

---

### Faz 9 — End-to-End Otonom Test
**Öncelik:** ⚠️ Orta | **Süre:** ~1 saat

#### Tam Döngü Testi
1. Yeni bir test blueprint oluştur (örn: `syllable-detective.json`)
2. CLI ile `--dry-run` çalıştır → dosya listesi doğrula
3. Ajan pipeline'ını çalıştır → 4 onay al
4. Gerçek üretim çalıştır → dosyalar oluşsun
5. `npx tsc --noEmit` → sıfır hata
6. `npm run test:run` → tüm testler geçsin
7. `npm run build` → production build başarılı

#### [NEW] `src/tools/scaffold/e2e.test.ts`
- End-to-end scaffold testi
- Blueprint → Engine → Files → Type Check → Build

---

## Mimari Özet Diyagramı

```
┌─────────────────────────────────────────────────────┐
│                   KULLANICI                          │
│         Admin UI  /  IDE CLI  /  Gemini CLI          │
└─────────┬──────────────┬──────────────┬─────────────┘
          │              │              │
          ▼              ▼              ▼
┌─────────────┐ ┌──────────────┐ ┌────────────────┐
│ AdminScaffold│ │ scaffoldCLI  │ │ create-activity│
│   (React)    │ │   (Node)     │ │  (Workflow)    │
└──────┬──────┘ └──────┬───────┘ └───────┬────────┘
       │               │                 │
       └───────────────┼─────────────────┘
                       ▼
          ┌────────────────────────┐
          │   AgentOrchestrator    │  ← Faz 7 [YENİ]
          │ Elif → Ahmet → Bora   │
          │        → Selin        │
          └───────────┬───────────┘
                      ▼
          ┌────────────────────────┐
          │ ActivityScaffoldEngine │
          │  Template Render       │
          │  Code Injection        │
          │  File Generation       │
          └───────────┬───────────┘
                      ▼
          ┌────────────────────────┐
          │   ActivityValidator    │  ← Faz 1 [YENİ]
          │  TS Check / Pedagoji  │
          │  Import / Font        │
          └───────────┬───────────┘
                      ▼
          ┌────────────────────────┐
          │  14 Entegrasyon Noktası │
          │  Enum / Registry / UI  │
          │  Sheet / Config / Test │
          └────────────────────────┘
```

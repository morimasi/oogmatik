# BDMIND — Evrensel AI Ekip Koordinasyonu

> Bu dosya OpenCode, Aider, Continue, Codeium, **Google Antigravity** ve benzeri araçlar tarafından okunur.
> Proje klasöründe herhangi bir AI aracını kullandığında bu kurallar geçerlidir.
>
> **Araç → Config Dosyası Haritası:**
> | Araç | Config Dosyası |
> |------|---------------|
> | Claude Code | `CLAUDE.md` |
> | Gemini CLI + Google Antigravity | `GEMINI.md` + `.agents/rules/bdmind-core.md` + `.idx/dev.nix` |
> | Cursor | `.cursor/rules/bdmind.mdc` |
> | Windsurf | `.windsurfrules` |
> | GitHub Copilot | `.github/copilot-instructions.md` |
> | Continue.dev | `.continue/config.json` |
> | Zed AI | `.zed/settings.json` |
> | Aider | `.aider.conf.yml` |
> | OpenCode + Codeium | `opencode.json` + `AGENTS.md` |
>
> **Context7 MCP Yapılandırma Dosyaları:**
> | Araç | MCP Config |
> |------|-----------|
> | Claude Code | `.mcp.json` |
> | Cursor | `.cursor/mcp.json` |
> | Continue.dev | `.continue/config.json` (experimental.modelContextProtocolServers) |
> | Zed AI | `.zed/settings.json` (context_servers) |
> | OpenCode | `opencode.json` (mcp) |

---

## Proje: bdmind EdTech Platformu

Disleksi, DEHB ve özel öğrenme güçlüğü yaşayan Türk çocuklar için AI destekli kişiselleştirilmiş eğitim materyali üretim platformu.

**Stack**: React 18 + TypeScript (strict) + Vite + Node.js + Vercel Serverless + Gemini 2.5 Flash + Firebase
**Kural #0**: Her içerik gerçek bir çocuğa ulaşır. Hata toleransı = sıfır.

---

## 🤖 AI Ajan v2 Professional (Yeni Nesil Orkestrasyon)

Uygulama geliştirme ve içerik üretim süreçlerinde **v2 Professional** mimarisi aktiftir. Ajanlar artık manuel çağrıya gerek duymadan **otomatik** olarak devreye girer.

### 🔄 Otomatik Orkestrasyon & Denetim (Phase 4: Generative Engine)
- **Oto-Pilot**: Her prompt, [AgentOrchestrator](file:///d:/bbma/bursadisleksi/bdmind/src/tools/scaffold/AgentOrchestrator.ts) tarafından analiz edilir.
- **Multimodal Vision**: CLI üzerinden gelen Resim/PDF verileri `ocrService` ile "Architectural DNA"ya dönüştürülür ve Selin Arslan'a klonlama referansı olarak sunulur.
- **Marker-Based Injection**: Kod enjeksiyonu asla rastgele yapılmaz. Sadece `// AUTONOM_...` işaretleyicileri arasına güvenli ekleme yapılır.
- **Self-Correction**: Ajanlar çıktılarını birbirlerine aktarmadan önce halüsinasyon ve hata denetiminden (`validateAndCorrect`) geçerler.
- **Global Aktivasyon**: Tüm geliştirme ortamlarında (Antigravity, Cursor, CLI) bu protokoller her zaman **otomatik** olarak devrededir.


### 📚 Tam Sistem Hakimiyeti
- **Source of Truth**: [MODULE_KNOWLEDGE.md](file:///c:/Users/Administrator/Desktop/bdmind/.claude/MODULE_KNOWLEDGE.md) belgesi, uygulamanın her bir dosyasını, özelliğini ve işlevini içeren "Evrensel Bilgi Kaynağı"dır.
- **Dosya Bilinci**: Ajanlar her dosyayı, her fonksiyonu ve her modülün birbiriyle olan ilişkisini bu belge üzerinden bilir ve geliştirme yaparken bu bağlamı korur.
- **Sürekli Güncellik**: Her yeni özellik veya dosya değişikliğinde `MODULE_KNOWLEDGE.md` otomatik olarak güncellenir ve ajanların bilgisi taze tutulur.

### 🎓 Ordinaryüs Premium Ajan Kadrosu v3 (Tam Otonom Sürü Orkestrasyonu)
1. **IdeationAgent (Prof. Dr. Selen Uçar)**: Baş Nöro-Pedagojik Tasarımcı. Sinaptik bağ odaklı, sarmal öğrenme ve ZPD kurguları üretir.
2. **ContentAgent (Dr. Deniz Yılmaz)**: Kıdemli Özel Eğitim Yazarı. Disleksi dostu, ZPD uyumlu ve etkileşimli metinler hazırlar.
3. **VisualAgent (Emre Tan)**: UI/UX Stratejisti & Görsel Mimar. Glassmorphism standartlarında, 0 bilişsel yük sunan tasarımlar kurar.
4. **FlowAgent (Selin Arslan)**: LXD (Learning Experience Designer). DEHB dostu mikro-döngüler ve dinamik seans akışları planlar.
5. **EvaluationAgent (Dr. Canan Kaya)**: Veri Analisti & Ölçme Uzmanı. SMART kriterli, nöro-pedagojik ölçme metrikleri kurar.
6. **IntegrationAgent (Bora Demir)**: Baş Mühendis & Sistem Mimarı. Tüm çıktıları sentezler, final blueprint'i kurar ve tip güvenliğini sağlar.
7. **NeuroPedagogyMaster (Prof. Dr. Selen Uçar)**: Nörobiyoloji Muhafızı. Plastisite, duyusal bütünleme ve bilişsel yük eşiklerini denetler.
8. **CognitiveUXArchitect (Emre Tan)**: Bilişsel Ergonomi Uzmanı. A4 render, kâğıt düzeni ve görsel hiyerarşide 0 hata garantisi verir.
9. **SecurityPrivacyAuditor (Doç. Dr. Leyla Korkmaz)**: KVKK & MEB Mevzuat Muhafızı. Öğrenci verisi anonimliği ve prompt injection engelleme uzmanı.
10. **QualityEngineAuditor (Kaan Arslan)**: Sıfır Hata Denetçisi. TypeScript strict mode, Zod validation ve `AppError` kurallarını denetler.

---

## 📖 ZORUNLU: Uygulama Modül Bilgisi

**HER GÖREV ÖNCESİ**: `/.claude/MODULE_KNOWLEDGE.md` dosyasını oku.

Bu belge, tüm uygulama modüllerinin (stüdyolar, admin panelleri, API'ler, servisler) kapsamlı açıklamasını içerir.

**Kod değişikliği yapmadan önce**:
1. MODULE_KNOWLEDGE.md'deki ilgili modül bölümünü oku
2. Modülün amacını ve entegrasyonlarını anla
3. Ajan kullanım kılavuzunu kontrol et
4. Değişikliğe başla

---

## 4 Lider Uzman — Her İstemde Bu Değerlendirme Yapılır

**Elif Yıldız** (Pedagoji):
- `pedagogicalNote` her aktivitede zorunlu (öğretmene "neden" açıklaması)
- İlk aktivite maddesi mutlaka kolay (güven inşası)
- ZPD uyumu: `AgeGroup` ('5-7'|'8-10'|'11-13'|'14+') x `difficulty` ('Kolay'|'Orta'|'Zor')
- Lexend font + geniş satır aralığı (disleksi tasarım standardı — değiştirme)

**Dr. Ahmet Kaya** (Klinik/MEB):
- Tanı koyucu dil yasak: "disleksisi var" → "disleksi desteğine ihtiyacı var"
- BEP hedefleri SMART formatında
- MEB Özel Eğitim Yönetmeliği + 573 KHK uyumu
- KVKK: öğrenci adı + tanı + skor birlikte görünmez

**Bora Demir** (Mühendislik):
- `any` tipi yasak → `unknown` + type guard
- `AppError` standardı: `{ success, error: { message, code }, timestamp }`
- Her yeni endpoint: `RateLimiter` + `validateRequest()` + `retryWithBackoff()`
- Vitest testi zorunlu (tests/ dizini)

**Selin Arslan** (AI):
- Model: `gemini-2.5-flash` (sabit — değiştirme)
- JSON repair motoru (`geminiClient.ts`) 3 katmanlı — dokunma
- Prompt injection: user input sanitize et, max 2000 karakter
- count > 10 → batch (5'erli gruplar, `cacheService.ts`)

---

## Kritik Dosyalar

```
api/generate.ts           Ana AI endpoint — rate limit + CORS + validation şablonu
services/geminiClient.ts  Gemini wrapper + JSON repair (balanceBraces → truncate → parse)
utils/AppError.ts         Merkezi hata standardı — tüm hatalar buradan
utils/schemas.ts          Zod validation şemaları
services/rateLimiter.ts   Rate limiting servisi
types/creativeStudio.ts   LearningDisabilityProfile, AgeGroup (klinik tipler)
types/student-advanced.ts StudentAIProfile, BEP tipleri, StudentPrivacySettings
hooks/useWorksheets.ts    Frontend-API köprüsü — getAuthHeaders() pattern

[ScreeningAssessment Modülü — Bilişsel Değerlendirme Merkezi]
components/ScreeningAssessment/index.tsx  Ana orchestrator — lazy import
components/ScreeningAssessment/store/useScreeningStore.ts  Merkezi Zustand store
components/ScreeningAssessment/hooks/useScreeningAssessment.ts  Ana iş mantığı
components/ScreeningAssessment/panels/DashboardPanel.tsx  İstatistik panosu
components/ScreeningAssessment/panels/ResultDetailPanel.tsx  AI analiz + radar chart
components/ScreeningAssessment/components/CognitiveTests/CognitiveTestPanel.tsx  Test bataryası
components/ScreeningAssessment/services/assessmentEngineService.ts  AI prompt motoru
components/ScreeningAssessment/services/screeningDataService.ts  API + mock data

[Admin Modülü — Anti-Gravity Sprint 5]
components/AdminActivityManager.tsx  Drag-and-Drop + adminService.saveActivitiesBulk
components/AdminDraftReview.tsx      Gemini Vision OCR → category/targetSkills auto-fill
components/AdminStaticContent.tsx    10-version snapshot + JSON export/import
antigravity_report.md                Sprint 5 tasarım ve teknik kararların referans kaydı
```

### 🎨 Admin UI Tasarım Standardı (Ozel Protokol)

Admin bileşenlerine dokunurken bu standardı koru:
- **Dark Glassmorphism**: `backdrop-blur` + ultra-ince border + 2.5rem `border-radius`
- **Font**: `Lexend` (içerik) + `Inter` (admin UI) — karıştırma yasak
- **Micro-interactions**: hover scale, smooth-scroll, animasyon geçişleri

---

## Zorunlu Kontrol (Her Değişiklikte)

```
□ TypeScript strict: any yok, ?. ve ?? kullanıldı
□ AppError formatı korundu
□ pedagogicalNote her AI aktivitesinde var
□ Tanı koyucu dil yok
□ Lexend font değişmedi
□ Rate limiting yeni endpoint'te eklendi
□ Test yazıldı (vitest)
```

## Mutlak Yasaklar

```
any tipi | console.log üretimde | hardcode API key | pedagogicalNote silmek
Lexend değiştirmek | tanı koyucu dil | başarısızlık görünür UI | KVKK ihlali
```

---

## ⚡ Superpowers İş Akışı

Bu proje [obra/superpowers](https://github.com/obra/superpowers) ile entegre edilmiştir.
Beceriler `.claude/skills/` dizinindedir.

| Beceri | Tetikleyici |
|--------|-------------|
| `brainstorming` | Herhangi bir özellik yapmadan önce |
| `writing-plans` | Tasarım onaylandıktan sonra |
| `test-driven-development` | Her implementasyon adımında |
| `systematic-debugging` | Herhangi bir hata/test başarısızlığında |
| `verification-before-completion` | "Tamamlandı" demeden önce |

**Test komutları:** `npm run test:run` (Vitest) | `npm run build` | `npm run lint`

**Dokümanlar:** `docs/superpowers/` (specs/ ve plans/)

---

## 🔌 Context7 MCP Entegrasyonu

Bu proje [upstash/context7](https://github.com/upstash/context7) ile entegre edilmiştir.
Güncel kütüphane dokümantasyonu için prompt'a `use context7` ekle.

**Yapılandırma dosyaları:** `.mcp.json` (Claude Code) | `.cursor/mcp.json` (Cursor) | `.continue/config.json` | `.zed/settings.json` | `opencode.json`

**bdmind stack için sık kullanılan ID'ler:** `/facebook/react` | `/firebase/firebase-js-sdk` | `/colinhacks/zod` | `/vitejs/vite`

---

## 📋 Session Progress — Blank Page / Rendering Audit

### Goal
Find and fix all activities across 4 categories (Görsel & Mekansal, Okuduğunu Anlama, Okuma & Dil, Matematik & Mantık) whose AI generator output can't be rendered by any SheetRenderer path, producing blank white pages.

### Completed
- **BrandedLoadingAnimation** — premium theme-aware fully transparent spinner; replaces all 16 locations
- **FascicleContentNormalizer** — normalizes content shapes for fascicle preview
- **Generator audit** — 78 activities analyzed; 2 critical gaps fixed (VISUAL_ODD_ONE_OUT, INFOGRAPHIC_SHORT_ANSWER with `withAI()`); 5 missing ACTIVITIES entries added; ~32 default options added; 6 new config components
- **LegacyRenderer wiring** — `STORY_COMPREHENSION` (maps StoryData → InteractiveStoryData with defaults) and `KENDOKU` (uses KendokuSheet = FutoshikiSheet) both added
- **Okuduğunu Anlama 8 etkinlik tam denetim + düzeltme (generators/offline/config/sheet/print):**
  - **MISSING_PARTS**: SheetRenderer rotası `AdvancedMissingPartsSheet`'e çevrildi (hem `items` hem `paragraphs` şeklini normalize eder); `offlineGenerators/index.ts`'e `missingParts.ts` export edildi; `premiumReading.ts:295` çakışan `generateOfflineMissingParts` → `generateOfflinePremiumMissingParts` rename; registry default `missingType` → `blankType`; config map zengin `MissingPartsConfig`'e bağlandı
  - **INFOGRAPHIC_SHORT_ANSWER**: registry offline → `offlineGenerators.generateOfflineShortAnswer` (boş sayfa düzeldi); `shortAnswer.ts` (offline+AI) artık `itemCount || itemCountShort` ve `options.activityType` kullanıyor; `ActivityService.generate` tüm generator'lara `options.activityType` enjekte ediyor
  - **LOGIC_ERROR_HUNTER**: offline generator `LogicErrorHunterData` şekline uygun yeniden yazıldı (content.story + errors[{id, faultyWordOrPhrase, correction, explanation}], difficulty/absurdityDegree/errorCount opsiyonları)
  - **STORY_COMPREHENSION**: `StoryComprehensionSheet`'e açık uçlu sorular (fillBlanks) + creativeTask bölümleri eklendi; 'fill' dalı `q.sentence` eksikken çakılma riski düzeltildi; generator `StoryStudioConfig` opsiyonlarını (genre, tone, include5N1K, focusVocabulary, includeCreativeTask) + fiveW1H şemasını üretiyor
  - **FIVE_W_ONE_H**: offline zorluk eşlemesi ('1-2'→çok kolay, '3-4'→kolay, '5-6'→orta, '7-8'→zor + case-insensitive) — filtre artık asla boş dönmüyor
  - **VISUAL_INTERPRETATION**: AI generator `itemCountVisual || itemCount`, `visualInterpretationStyle`, `visualComplexityLevel` okuyor; soru tipi prompt'a işleniyor
  - **STORY_ANALYSIS**: `StoryAnalysisSheet`'e `content.vocabulary` (Sözlükçe) bölümü eklendi
  - **SENTENCE_5W1H**: `sentenceFiveWOneH.ts` zorluk cast yalanı kaldırıldı (DIFFICULTY_MAP); `aiContentService.ts` title map'ine 5 eksik etkinlik eklendi
- **Doğrulama**: `tsc --noEmit` 0 hata, `npm run build` başarılı; `tests/okudugunuAnlamaOfflineSmoke.test.ts` (4 test: logicErrorHunter/fiveWOneH/shortAnswer/missingParts offline şekil kontrolleri) geçiyor
- **2. tur doğrulama + ek düzeltmeler (OpenCode):**
  - **MISSING_PARTS**: `AdvancedMissingPartsSheet` paragraphs formatında cevabı "İPUCU: Cevap: X" olarak sızdıran bug kapatıldı (öğrenci sayfasında cevap görünmüyor); AI generator (`advancedMissingParts.ts`) `content.items` doğrulaması + normalizasyon + AppError eklendi (bozuk AI çıktısı → boş sayfa riski kapatıldı)
  - **INFOGRAPHIC_SHORT_ANSWER**: `SheetRenderer.tsx:636` artık content yerine TÜM data + settings geçiyor (title/instruction/lineStyle/includeHints/includePoints kaybı düzeldi); offline generator `shortAnswerData.ts` zengin havuzunu (4 konu × 8 soru) + topic alias'ları kullanıyor ('Genel Kültür'→'Genel Kültür' vb., sessiz 'Bilim' düşmesi bitti); AI generator doğrulama + settings eklendi
  - **STORY_ANALYSIS**: `pedagogicalNote` artık generator çıktısında + sheet'te "Öğretmen Notu" olarak render ediliyor; SheetRenderer/LegacyRenderer settings prop'unu geçiyor (compactLayout/showReadingRuler/useIcons artık etkili); difficultyConfig 'Çok Kolay'/'Kolay'/'Uzman' anahtarları eklendi (sessiz 'orta' düşmesi bitti); offline `{character}` placeholder'ları chosenValues ile çözülüyor
  - **SENTENCE_5W1H**: sheet'te `data.items` ve `item.questions` null-guard'ları (çökme riski kapandı); `Sentence5W1HItem.sentence` tipi eklendi
  - **FIVE_W_ONE_H**: sheet null-guard'ları; AI prompt'unda `"A) "` ön ekli şıklar düzeltildi (sheet harf balonuyla çift "A) A)" oluyordu)
  - **LOGIC_ERROR_HUNTER**: AI generator `content.story/errors` doğrulaması + normalizasyon + AppError eklendi
  - **VISUAL_INTERPRETATION**: sheet artık ÇSS (şıklar) ve açık uçlu/5N1K (yazma alanı) soru tiplerini render ediyor (yalnızca D/Y değil); konu slug'ları Türkçe etiketlere çevriliyor; `generateImage=false` iken görsel API çağrısı yapılmıyor; AI çıktı doğrulaması eklendi
  - **STORY_COMPREHENSION**: `QUESTION_TYPES`'a '5n1k' + 'open-ended' eklendi (rozet/renk); 5N1K prompt örneği şema ile tutarlı (bireysel tipler); 'fill' dalı `q.question` fallback'i
  - **SEMANTIC_LINKER**: `ACTIVITY_CATEGORIES` Okuma & Dil kategorisine eklendi (önceden hiçbir kategoride yoktu); `SemanticLinkerSheet.tsx` disleksi dostu temiz A4 bileşeni yazıldı ve `LegacyRenderer`'a bağlandı; öğrenci kâğıdında cevabı yeşille ifşa eden bug düzeltildi; offline generator 18 zengin kavram çiftiyle donatıldı; AI jeneratörüne fallback ve `pedagogicalNote` eklendi; `tests/semanticLinkerSmoke.test.ts` (2 test) yazıldı ve geçti.
- **Global Kategori ve Yönlendirme Bütünlüğü (Faz 1 & Faz 2)**:
  - 4 yetim aktivite (`ALGORITHM_GENERATOR` → math-logic, `STORY_SEQUENCING` → reading-comprehension, `INFOGRAPHIC_5W1H_BOARD` → reading-comprehension, `LETTER_MAZE_TEST` → reading-verbal) `src/constants.ts` içine eklendi; 65 aktivitenin 65'i de kategorize edildi.
  - `src/constants.ts` dosyasındaki döngüsel import kırıldı (`./types/activity`).
  - `SheetRenderer.tsx` tüm `INFOGRAPHIC_*` türlerini `InfographicRenderer`'a bağladı.
  - `registry.ts`'te `SHORT_ANSWER`, `INFOGRAPHIC_CONCEPT_MAP` ve `INFOGRAPHIC_5W1H_BOARD` zengin offline jeneratörlere bağlandı.
  - `generateOfflineFallback` placeholder metni yerine 4 bölümlü zengin pedagojik A4 blokları üretecek şekilde yeniden yazıldı.
  - `tests/categoryWiringSmoke.test.ts` (5 test) eklendi; toplam 11 duman testi (smoke test) başarıyla geçiyor.
- **Doğrulama**: `tsc --noEmit` 0 hata, `npm run build` başarılı; tüm smoke testler geçiyor.

### Remaining (accessible from UI, not yet fixed)
- *Tüm 65 arayüz aktivitesi eksiksiz kategorize edilmiş, render yönlendirmesi ve offline jeneratörleri tamamlanmıştır.*

### Not User-Accessible (hidden from sidebar)
- PUNCTUATION_MAZE, FIND_IDENTICAL_WORD, THEMATIC_ODD_ONE_OUT — have generators but no ACTIVITIES entry; not urgent
- PROVERB_* (5 types), WORDS_IN_STORY, STORY_CREATION_PROMPT — stubs returning `[]`; no ACTIVITIES entry; not urgent

### Rendering Pipeline Reference
- `Sidebar` → `ActivityService.generate()` → registry generator → `ContentArea` (paginate via `paginationService`) → `UniversalWorksheetWrapper` → `SheetRenderer` (route by `activityType`)
- `SheetRenderer` order: special cases → modern layout (`layoutArchitecture.blocks`) → `LegacyRenderer` → default `UnifiedContentRenderer`
- Custom generators (non-`withAI()`) produce domain data (`puzzles`, `rows`, `items`, etc.) that must either match a `LegacyRenderer` entry or produce modern layout data
- `withAI()` generators always produce modern layout via `SmartFallbackGenerator` + `WorksheetBuilder.build()`

### Build
- `npm run build` passes (no TS regressions beyond pre-existing errors in FascicleActivityPicker, FascicleSidebar, FascicleTemplatesModal, ScreeningAssessment)


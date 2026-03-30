# OOGMATIK — Evrensel AI Ekip Koordinasyonu

> Bu dosya OpenCode, Aider, Continue, Codeium, **Google Antigravity** ve benzeri araçlar tarafından okunur.
> Proje klasöründe herhangi bir AI aracını kullandığında bu kurallar geçerlidir.
>
> **Araç → Config Dosyası Haritası:**
> | Araç | Config Dosyası |
> |------|---------------|
> | Claude Code | `CLAUDE.md` |
> | Gemini CLI + Google Antigravity | `GEMINI.md` + `.agents/rules/oogmatik-core.md` + `.idx/dev.nix` |
> | Cursor | `.cursor/rules/oogmatik.mdc` |
> | Windsurf | `.windsurfrules` |
> | GitHub Copilot | `.github/copilot-instructions.md` |
> | Continue.dev | `.continue/config.json` |
> | Zed AI | `.zed/settings.json` |
> | Aider | `.aider.conf.yml` |
> | OpenCode + Codeium | `opencode.json` + `AGENTS.md` |
> | OpenClaw | `SOUL.md` |
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

## Proje: Oogmatik EdTech Platformu

Disleksi, DEHB ve özel öğrenme güçlüğü yaşayan Türk çocuklar için AI destekli kişiselleştirilmiş eğitim materyali üretim platformu.

**Stack**: React 18 + TypeScript (strict) + Vite + Node.js + Vercel Serverless + Gemini 2.5 Flash + Firebase
**Kural #0**: Her içerik gerçek bir çocuğa ulaşır. Hata toleransı = sıfır.

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

## ⚡ SIFIR-TETİKLEYİCİ OTOMATİK AJAN AKTİVASYONU

> **Keyword gerekmez. Her istemde sistem niyeti analiz eder ve tüm ilgili ajanları otomatik devreye sokar.**

```
Her istemde şu 9 soruyu sor (keyword aramadan önce):

1. Bu istem bir çocuğun öğrenmesini etkiler mi?         → Evet: Elif Yıldız aktive
2. Bu istemde klinik, yasal veya gizlilik riski var mı? → Evet: Dr. Ahmet Kaya aktive
3. Bu istemde teknik değişiklik veya risk var mı?       → Evet: Bora Demir aktive
4. Bu istemde AI kalitesi veya prompt güvenliği var mı? → Evet: Selin Arslan aktive
5. Görsel üretmek veya düzenlemek gerekiyor mu?         → Evet: visual-storyteller-oozel
6. Bir görsel analiz edilmesi gerekiyor mu?             → Evet: ai-vision-engineer-oozel
7. Kullanıcının gördüğü bir şey değişiyor mu?           → Evet: frontend-developer-oozel
8. Veri akışı veya backend değişiyor mu?               → Evet: backend-architect-oozel
9. Çocuk verisi, KVKK veya güvenlik riski var mı?      → Evet: security-engineer-oozel

"Bunu düzelt", "ekle şunu", "tamam yap" gibi kısa istemler de dahil.
Detaylı kural: .claude/agents/ORCHESTRATION.md
```

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

[Admin Modülü — Anti-Gravity Sprint 5]
components/AdminActivityManager.tsx  Drag-and-Drop + adminService.saveActivitiesBulk
components/AdminDraftReview.tsx      Gemini Vision OCR → category/targetSkills auto-fill
components/AdminStaticContent.tsx    10-version snapshot + JSON export/import
antigravity_report.md                Sprint 5 tasarım ve teknik kararların referans kaydı

[InfographicStudio & OCR Modülleri — agency-agents Sprint]
src/components/InfographicStudio/index.tsx   → visual-storyteller-oozel ajanı yönetir
src/services/infographicService.ts           → Gemini 2.5 Flash infografik prompt motoru
src/data/infographicTemplates.ts             → SPLD premium şablonlar
src/components/NativeInfographicRenderer.tsx → SVG render motoru
src/components/OCRScanner.tsx                → ai-vision-engineer-oozel ajanı yönetir
src/services/ocrService.ts                   → Gemini Vision OCR servisi
src/services/ocrVariationService.ts          → Blueprint → varyasyon üreticisi
utils/imageValidator.ts                      → Görsel boyut/format doğrulama
api/ocr/analyze.ts                           → POST /api/ocr/analyze
api/ocr/generate-variations.ts               → POST /api/ocr/generate-variations
```

### 🖼️ Görsel & OCR Ajan Katmanı (msitarzewski/agency-agents adaptasyonları)

| Ajan | Kaynak | Sorumluluk |
|------|--------|------------|
| `visual-storyteller-oozel` | design-visual-storyteller + design-image-prompt-engineer | SVG/infografik, @antv/infographic syntax, sembol üretimi |
| `ai-vision-engineer-oozel` | engineering-ai-engineer | OCR pipeline, Gemini Vision, blueprint kalite kontrolü |

**Tetikleyici anahtar kelimeler**:
- **visual-storyteller-oozel**: `infografik`, `SVG`, `sembol`, `tablo`, `grafik`, `çizim`, `InfographicStudio`
- **ai-vision-engineer-oozel**: `OCR`, `görüntü analizi`, `vision`, `Gemini Vision`, `blueprint`

Ajan dosyaları: `.claude/agents/supporting/` | Kural kaydı: `.claude/agents/registry.json`

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

**Oogmatik stack için sık kullanılan ID'ler:** `/facebook/react` | `/firebase/firebase-js-sdk` | `/colinhacks/zod` | `/vitejs/vite`


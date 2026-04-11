# OOGMATIK — Platform Tamamlama & Kalite Güvencesi Master Planı (v5.0 Ultra Premium)

> **İlk Sürüm:** 2026-04-11 | **Revize:** 2026-04-11 (2. Tur Derinlemesli Analiz)  
> **Analiz Kapsamı:** 157.191 satır TypeScript/TSX | 36 test dosyası + 4 E2E spec | 11 API endpoint | 10 Zustand store | 40+ AI generator | 25+ offline generator | 70+ React bileşeni  
> **Durum:** 🚨 Canlıya Alma Öncesi Zorunlu Müdahale Gerektiriyor  
> **v5.0 Değişiklikleri:** +3 güvenlik açığı (SG-5..7) | +5 mimari sorun (MA-8..12) | +4 eksik özellik (EK-12..15) | +1 test uyumsuzluğu (TK-6) | CORS tablosu düzeltildi

---

## 🎯 YÖNETİCİ ÖZETİ (Executive Summary)

Oogmatik platformu fonksiyonel olarak ileri bir seviyededir; ancak **canlıya almadan önce** aşağıdaki kritik alanlarda müdahale zorunludur:

| Kategori | Risk Seviyesi | Sorun Sayısı | Durum |
|---|---|---|---|
| **Güvenlik Açıkları** | 🔴 KRİTİK | 7 sorun | JWT bypass, wildcard CORS, crypto hatası, HTML injection |
| **TypeScript Uyumu** | 🔴 KRİTİK | 4 sorun | `strict: false`, `@ts-nocheck` kullanımı — kural ihlali |
| **Build Bozucu Hatalar** | 🔴 KRİTİK | 1 sorun | `@remotion/player` import'u — package.json'da yok |
| **Eksik API Özellikleri** | 🟠 YÜKSEK | 15 sorun | WorkbookExport (DOCX/PPTX/EPUB/SCORM), PDFViewer, Focus Mode |
| **Mimari Artıklar** | 🟠 YÜKSEK | 12 sorun | Çift dizin, kopya JSON repair, 2 RBAC sistemi, 2 AnimationService |
| **Test Kapsamı** | 🟡 ORTA | 6 sorun | Stüdyo testleri eksik, JWT test/kaynak uyumsuzluğu |
| **Performans** | 🟡 ORTA | 3 sorun | Mega bileşenler (SheetRenderer: 1712 satır, ProfileView: 1834 satır) |
| **Tamamlanmamış Özellikler** | 🟡 ORTA | 8 sorun | AnimationStudio, palette reflection, success glow, ThemeIntelligence |

---

## 🚨 KRİTİK GÜVENLİK SORUNLARI

### SG-1: JWT Token Doğrulaması Yapılmıyor ⚠️ BLOCKER
- **Dosya:** `src/middleware/permissionValidator.ts:23`
- **Sorun:** `extractUserInfo()` fonksiyonu JWT'yi doğrulamıyor; kullanıcı kimliğini yalnızca `x-user-id` ve `x-user-role` header'larından okuyor. Bu header'lar istemci tarafından sahte olarak gönderilebilir.
- **Çözüm:** `jwtService.ts` mevcut — `verifyToken()` fonksiyonunu `permissionValidator.ts`'te aktif et.
- **Etki:** Tüm API endpoint'leri yetkilendirme bypass saldırısına açık.

### SG-2: npm Güvenlik Açıkları ⚠️ YÜKSEK
- **Durum:** `npm audit` → 12 güvenlik açığı (9 yüksek, 3 orta)
- **Çözüm:** `npm audit fix` koştur; breaking change gerektirenler için manuel güncelleme.

### SG-3: RBAC Firestore'dan Rol Çekmiyor ⚠️ YÜKSEK
- **Dosya:** `src/services/rbac.ts:100`
- **Sorun:** Kullanıcı rolleri Firestore'dan doğrulanmıyor — TODO yorumu var.
- **Çözüm:** `getUserRole(userId)` fonksiyonunu Firestore `users` koleksiyonundan rol çekecek şekilde implement et.

### SG-4: Rate Limiting Yalnızca In-Memory ⚠️ ORTA
- **Dosya:** `src/services/rateLimiter.ts`
- **Sorun:** Rate limiter server yeniden başladığında sıfırlanıyor; Vercel serverless'ta her invocation ayrı process olduğu için pratikte rate limiting çalışmıyor.
- **Çözüm:** Firestore veya Upstash Redis tabanlı distributed rate limiting.

### SG-5: 5 API Endpoint'te Wildcard CORS (`*`) ⚠️ YÜKSEK — v5.0 YENİ
- **Dosyalar:**
  - `api/activity/approve.ts:11` → `res.setHeader('Access-Control-Allow-Origin', '*')`
  - `api/generate-exam.ts:40` → aynı
  - `api/ocr/generate-variations.ts:13` → aynı
  - `api/ai/generate-image.ts:9` → aynı
  - `api/workbooks.ts:116` → aynı
- **Sorun:** `src/utils/cors.ts` whitelist tabanlı `corsMiddleware()` fonksiyonu yazılmış ve `api/generate.ts`'te kullanılıyor, ancak diğer 5 endpoint'te hiç kullanılmamış. Wildcard CORS credentials ile birlikte kullanılamaz ve güvenlik riski oluşturur.
- **Çözüm:** Tüm endpoint'lerde `corsMiddleware(req, res)` kullan; `Access-Control-Allow-Origin: *` kaldır.

### SG-6: `privacyService.ts` — Node.js `crypto` Tarayıcıda Çalışmaz ⚠️ YÜKSEK — v5.0 YENİ
- **Dosya:** `src/services/privacyService.ts:16` — `import { createHash } from 'crypto'`
- **Sorun:** KVKK uyumlu TC Kimlik No hash'leme için Node.js'in `crypto` modülü kullanılıyor. Bu servis `src/` içinde (frontend kod tabanı) — tarayıcıda çalışmaz. Ayrıca `superStudioGenerator.ts`'te aynı sorun daha önce FNV-1a hash ile çözülmüş (bkz. memory).
- **Etki:** TC kimlik hash'leme fonksiyonu tarayıcıda runtime error fırlatır; KVKK pipeline bozulur.
- **Çözüm:** `createHash('sha256')` → Web Crypto API: `crypto.subtle.digest('SHA-256', ...)` veya FNV-1a gibi browser-compatible alternatif.

### SG-7: `api/export-infographic.ts` — Kimlik Doğrulama, CORS, Rate Limit ve Input Validasyonu Yok ⚠️ KRİTİK — v5.0 YENİ
- **Dosya:** `api/export-infographic.ts`
- **Sorun:** Bu endpoint Puppeteer ile headless Chromium çalıştırıyor ve **ham HTML içeriğini** hiçbir doğrulama yapmadan `page.setContent(html)` ile render ediyor. Sorunlar:
  - Kimlik doğrulama yok (herkes çağırabilir)
  - Rate limiting yok (maliyet saldırısı için açık)
  - CORS başlığı yok (yanıtlar her origin'e döner)
  - Input validation yok — gönderilen `html`, `format`, `quality` parametreleri Zod ile doğrulanmıyor
  - `html` parametresi kötü amaçlı içerik barındırabilir (Server-Side XSS via headless browser)
- **Çözüm:**
  - `corsMiddleware()` ekle
  - JWT authentication middleware ekle
  - Rate limiting ekle
  - `z.string().max(500_000)` ile HTML boyut sınırı koy
  - `format` ve `quality` parametrelerini enum ile doğrula
  - HTML sanitization veya URL-only yaklaşımına geç

---

## 🔴 TypeScript & Kod Kalitesi

### TS-1: `strict: false` — KRİTİK İHLAL
- **Dosya:** `tsconfig.json:12`
- **Sorun:** `"strict": false` ve `"noImplicitAny": false` — projenin temel Kural #0'ı ihlal ediyor.
- **Çözüm:** `"strict": true` yap; ortaya çıkan hataları düzelt.

### TS-2: `@ts-nocheck` Kullanımı
- **Dosyalar:** `src/App.tsx:1`, `src/components/SheetRenderer.tsx:1`, `src/services/worksheetService.ts:1`
- **Sorun:** En kritik dosyalarda TypeScript tamamen devre dışı bırakılmış.
- **Çözüm:** `@ts-nocheck` direktiflerini kaldır; tip hatalarını düzelt.

### TS-3: `any` Tipi Kullanımı
- **Dosyalar:** `src/types/core.ts`, `src/context/ReadingStudioContext.tsx`, `src/utils/retry.ts`, `src/utils/blueprint.ts` ve ~20 diğer dosya
- **Çözüm:** `any` → `unknown` + type guard dönüşümü.

### TS-4: `console.log` / `console.error` Üretim Kodunda
- **Dosya:** `src/services/worksheetService.ts:59` — `console.error("Deserialization error", e)` üretim kodunda
- **Dosyalar:** `src/services/generators/superStudioGenerator.ts`, `src/services/workbook/workbookExport.ts`
- **Çözüm:** `logError()` ile değiştir.

---

## 🟠 MİMARİ SORUNLAR

### MA-1: Çift Kök Dizin Yapısı
- **Sorun:** `/components/` (kök seviyede) VE `/src/components/` (src içinde) aynı anda mevcut.
  - `components/MatSinavStudyosu/` → kök `/components/` içinde
  - `components/SinavStudyosu/` → kök `/components/` içinde
  - Geri kalan tüm bileşenler → `src/components/` içinde
- **Çözüm:** `components/MatSinavStudyosu` ve `components/SinavStudyosu` klasörlerini `src/components/` altına taşı; import yollarını güncelle.

### MA-2: Kopya JSON Repair Motoru
- **Sorun:** Aynı 3 katmanlı brace-balancing algoritması hem `api/generate.ts` hem `src/services/geminiClient.ts` içinde birebir kopyalanmış.
- **Çözüm:** `src/utils/jsonRepair.ts` adında paylaşılan bir utility oluştur; her iki yerden import et.

### MA-3: 3 Admin Dashboard Bileşeni
- **Sorun:** `AdminDashboard.tsx`, `AdminDashboardNew.tsx`, `AdminDashboardV2.tsx` — hangisi canonical belirsiz.
- **Durum:** App.tsx `AdminDashboard.tsx` import ediyor; V2 ve New kullanılmıyor.
- **Çözüm:** V2 ve New bileşenlerini sil veya birleştir; tek `AdminDashboard.tsx` kullan.

### MA-4: İki Auth State Sistemi
- **Sorun:** `src/context/AuthContext.tsx` (React Context) VE `src/store/useAuthStore.ts` (Zustand) — ikisi de mevcut.
- **Çözüm:** `useAuthStore.ts` canonical olarak kullan; `AuthContext.tsx` kaldır veya sadece sarmak için kullan.

### MA-5: İki Tip Sistemi
- **Sorun:** `src/types.ts` (barrel re-export) VE `src/types/` (klasör) — ikisi de ayrı tanımlar içeriyor.
- **Çözüm:** `src/types.ts` → `src/types/index.ts` olarak standartlaştır.

### MA-6: Deprecated Dosyalar Temizlenmemiş
- `src/services/generators/visualPerception.ts` — deprecated, sadece re-export
- `src/services/offlineGenerators/visualPerception.ts` — deprecated, sadece re-export
- `ActivityType.SUPER_TURKCE_MATCHING` ve `SUPER_TURKCE_V2` — @deprecated ama enum'da hâlâ mevcut
- **Çözüm:** Deprecated dosyaları sil; enum değerlerini v2 milestone'da kaldır.

### MA-7: Kök Seviyede Geçici Dosyalar
- **Sorun:** 20+ orphan .md plan dosyası, geçici script dosyaları (fix.cjs, autofix.cjs, audit_useeffect.cjs, fix-api-imports.cjs vb.) ve 3 PDF dosyası kök dizinde.
- **Çözüm:** Plan .md'leri `docs/archive/` altına taşı; script dosyalarını `/tmp` veya `scripts/` altına al; PDF'leri sil.

### MA-8: İki AnimationService Implementasyonu — Konsolidasyon Gerekli ⚠️ YÜKSEK — v5.0 YENİ
- **Sorun:** Animasyon servisi iki ayrı implementasyonla çoğaltılmış:
  - `src/services/generators/AnimationService.ts` → Singleton sınıf, `generateAnimation()`, `ActivityType` bazlı, **v1.0**
  - `src/services/animationService.ts` → Fonksiyon tabanlı, Gemini 2.5 Flash + NeuroProfile parametreli, `generateAnimationTimeline()`, **v2.0**
- `src/components/remotion/AnimationStudio.tsx` → v2.0'dan import ediyor
- Hangi versiyonun canonical olduğu belirsiz; her ikisi de çelişen API'lere sahip.
- **Çözüm:** v2.0 (`animationService.ts`) canonical yap; v1.0 (`generators/AnimationService.ts`) kaldır veya v2.0'a adapte et.

### MA-9: `@remotion/player` — package.json'da Yok → Build Hatası 🔴 KRİTİK — v5.0 YENİ
- **Dosya:** `src/components/remotion/AnimationStudio.tsx:2` → `import { Player } from '@remotion/player'`
- **Sorun:** `@remotion/player` paketi `package.json`'daki `dependencies` veya `devDependencies` içinde **mevcut değil**. Bu dosya `vite.config.ts`'teki `vendor-3d` chunk'a (`@remotion/` prefix) dahil edilmek üzere yapılandırılmış ancak paket yüklü değil.
- **Etki:** `npm run build` komutu `Cannot find module '@remotion/player'` hatasıyla başarısız olur.
- **Çözüm:** Ya `npm install @remotion/player @remotion/core` ile paketi ekle ve entegre et, ya da `src/components/remotion/` klasörünü tamamen kaldır.

### MA-10: `RemotionStudio/index.tsx` — Placeholder Stub ⚠️ ORTA — v5.0 YENİ
- **Dosya:** `src/components/RemotionStudio/index.tsx`
- **Sorun:** Bileşen içeriği yalnızca "Bu modül yapım aşamasındadır." metni. `src/components/remotion/AnimationStudio.tsx`'ten farklı bir konum — iki ayrı Remotion bileşen klasörü mevcut.
- **Çözüm:** MA-9 kararına göre ya gerçek içerikle doldur ya da kaldır.

### MA-11: `activityApprovalService.ts` — Firestore Değil In-Memory Store ⚠️ YÜKSEK — v5.0 YENİ
- **Dosya:** `src/services/activityApprovalService.ts`
- **Sorun:** Onay kuyruğu `let approvalQueue: ActivityDraft[] = []` in-memory dizisinde tutuluyor. Kaynak kod yorumu: `// In-Memory Store (Firestore bağlantısı sonra eklenecek)`. Vercel serverless'ta her function restart sırasında tüm onay verileri kaybolur.
- **Bileşen:** `AdminActivityApproval.tsx` → `AdminDashboard.tsx` içine entegre edilmiş, yani bu özellik kullanıcıya açık ama verileri kalıcı değil.
- **Çözüm:** `approvalQueue` → Firestore `activity_approvals` koleksiyonuna taşı; `submitForReview()`, `approve()`, `reject()` metodlarını Firestore CRUD olarak yeniden yaz.

### MA-12: İki RBAC Sistemi — Farklı Rol Şemaları ⚠️ YÜKSEK — v5.0 YENİ
- **Sorun:**
  - `src/services/rbac.ts` → 4 rol: `admin | teacher | parent | student`
  - `src/hooks/useRBAC.ts` → 7 rol: `admin | teacher | student | parent | guest | editor | superadmin`
- İki sistemin izin matrisleri farklı; hangi sistem canonical belirsiz. Frontend `useRBAC.ts` kullanırken API middleware `rbac.ts` kullanıyor — rol uyumsuzluğu runtime authorization hatalarına yol açabilir.
- **Çözüm:** `src/types/user.ts`'te canonical `UserRole` tipi tanımla; her iki dosyayı bu tiple hizala; `editor` ve `superadmin` rolleri meşruysa `rbac.ts`'e de ekle.

---

## 🟠 TAMAMLANMAMIŞ ÖZELLİKLER

### EK-1: WorkbookExport — Tüm Format'lar Eksik
- **Dosya:** `src/services/workbook/workbookExport.ts`
- **Eksikler:**
  - PDF: sayfa içeriği render edilmiyor (`// TODO: Page content render`)
  - PDF: cevap anahtarı sayfası yok (`// TODO: Render answers`)
  - PDF: filigran yok (`// TODO: Add watermark to all pages`)
  - DOCX/Word formatı yok (`// TODO: Implement using docx library`)
  - PPTX/PowerPoint formatı yok (`// TODO: Implement using pptxgenjs library`)
  - EPUB formatı yok (`// TODO: Implement using epub-gen`)
  - SCORM paketi yok (`// TODO: SCORM package structure`)
  - CMYK renk dönüşümü yok (baskı kalitesi)

### EK-2: Focus Mode — ReadingStudio'ya Bağlanmamış
- **Durum:** CSS altyapısı hazır (`.focus-mode-overlay`, `.focus-mode-active`)
- **Eksik:** ReadingStudio.tsx içinde `focusMode` state'i CSS sınıfına bağlanmamış.

### EK-3: Success Glow — Activity Completion'a Bağlanmamış
- **Durum:** `.success-glow-animation` CSS sınıfı `theme-tokens.css`'te hazır.
- **Eksik:** Aktivite tamamlama event'i (SheetRenderer'daki ilerleme) CSS sınıfına bağlanmamış.

### EK-4: Palette Reflection — infographicGenerator'a Entegre Edilmemiş
- **Durum:** `src/utils/themeUtils.ts` ve `getInfographicPalette()` hazır.
- **Eksik:** `infographicGenerator.ts` içinden tema rengi okuma çağrısı yapılmamış.

### EK-5: WorkbookSharing — Gerçek userId Yok
- **Dosya:** `src/services/workbook/workbookSharingService.ts:65`
- **Sorun:** `userId: uuidv4()` — gerçek auth user ID'si kullanılmıyor.

### EK-6: RBAC — Firestore Role Sync Yok
- **Dosya:** `src/services/rbac.ts:100`
- **Sorun:** Kullanıcı rolleri hardcoded; Firestore'dan dinamik çekilmiyor.

### EK-7: Vercel Analytics & Sentry Entegrasyonu Yok
- **Dosya:** `src/utils/logger.ts:124,135`
- **Eksik:** Vercel Analytics, Sentry error tracking, Firestore audit collection write.

### EK-8: AnimationStudio — @remotion/player Bağımlılığı Eksik
- **Dosya:** `src/components/remotion/AnimationStudio.tsx:3`
- **Sorun:** `import { Player } from '@remotion/player'` — `package.json`'da `@remotion/player` listede yok; bileşen mevcut ama hiçbir view'da route edilmemiş.
- **Çözüm:** Ya Remotion bağımlılığını ekle ve entegre et, ya da bu dosyayı kaldır.

### EK-9: MobileWorksheetViewer — Route Edilmemiş
- **Dosya:** `src/components/MobileWorksheetViewer.tsx`
- **Sorun:** Bileşen mevcut ama App.tsx'teki hiçbir view switch'ine bağlanmamış.

### EK-10: PDFViewer Disleksi Araç Çubuğu — Entegrasyon Belirsiz
- **Dosya:** `src/components/PDFViewer/DyslexiaToolbar.tsx`
- **Sorun:** PDFViewer tamamen oluşturulmuş ancak platformdaki kullanım noktası belirsiz.

### EK-11: SharedWorksheetsView — Assessment Report Modal Eksik
- **Dosya:** `src/components/SharedWorksheetsView.tsx:158`
- **Sorun:** `// TODO: Add logic to view shared assessment report modal`

### EK-12: PDFViewer Modülü — Hiç Entegre Edilmemiş ⚠️ ORTA — v5.0 YENİ
- **Dosya:** `src/components/PDFViewer/` (PDFViewer.tsx, PDFViewerControls, PDFPageRenderer, DyslexiaToolbar, PDFErrorBoundary, usePDFViewer, useDyslexiaSettings, PDFViewer.module.css)
- **Sorun:** `pdfjs-dist` paketi `package.json`'da mevcut; tam özellikli PDF görüntüleyici (zoom, disleksi araç çubuğu, hata sınırı, özel hook'lar) oluşturulmuş — ancak **App.tsx, Sidebar.tsx veya ContentArea.tsx içinde hiçbir import yok**. Öğretmenin dışarıdan PDF yükleyip çalışma kağıdı olarak kullanması senaryosu tamamlanmamış.
- **Çözüm:** `App.tsx`'e `'pdf-viewer'` view ekle; Sidebar'a "PDF Görüntüle" menü maddesi; SavedWorksheetsView'dan PDF açma butonu ekle.

### EK-13: ThemeIntelligence Servisi — UI'ya Bağlanmamış ⚠️ DÜŞÜK — v5.0 YENİ
- **Dosya:** `src/services/themeIntelligence.ts`
- **Sorun:** Kullanım istatistiği tabanlı tema öneri sistemi (IndexedDB, `timeOfDayPreferences`, göz yorgunluğu raporu) oluşturulmuş ancak `App.tsx` veya `SettingsModal.tsx`'te hiç kullanılmıyor. `trackThemeSwitch()`, `recommendTheme()` fonksiyonları çağrılmıyor.
- **Çözüm:** `useThemeIntelligence()` hook'u oluştur; App'e tema değişimini kaydet; SettingsModal'da "Akıllı Tema Önerisi" göster.

### EK-14: WorkbookAIAssistant — Müfredat Doğrulaması TODO ⚠️ DÜŞÜK — v5.0 YENİ
- **Dosya:** `src/services/workbookAIAssistant/validators/contentValidator.ts`
- **Sorun:** `// TODO: curriculumService.verifyReferences(detectedReferences) ile doğrula` — AI'nın ürettiği çalışma kitabı içeriğinin MEB müfredat referanslarını doğrulayan adım eksik.
- **Çözüm:** `curriculumService.ts` içindeki MEB kazanım veri tabanıyla çapraz kontrol implement et.

### EK-15: `prompts/` Alt Dizini — Yedek Prompt Sistemi ⚠️ DÜŞÜK — v5.0 YENİ
- **Dosya:** `src/services/generators/prompts/` (readingPrompts.ts, mathPrompts.ts, visualPrompts.ts, puzzlePrompts.ts, index.ts)
- **Sorun:** `generators/promptLibrary.ts` ile `generators/prompts/` iki ayrı prompt yönetim sistemi. `PROMPTS_REGISTRY` dizini `ActivityType` bazlı şablonlar içeriyor; `promptLibrary.ts` ise paylaşılan şablonlar için. Her ikisi de aktif kullanılıyor ama kayıt mekanizmaları örtüşüyor.
- **Çözüm:** İki sistemi birleştir; `generators/promptLibrary.ts` canonical prompt deposu olsun; `prompts/` klasörü içindeki kayıtları oraya taşı.

---

## 🟡 PERFORMANS & YENIDEN DÜZENLEME

### PF-1: Mega Bileşenler — Parçalanmalı
| Bileşen | Satır | Öneri |
|---|---|---|
| `ProfileView.tsx` | 1834 | ≥6 alt bileşene böl |
| `SheetRenderer.tsx` | 1712 | Aktivite kategorilerine göre lazy-split |
| `infographicAdapter.ts` | 1609 | Kategori bazlı modüllere böl |
| `GraphicRenderer.tsx` | 1533 | Shape tiplerine göre böl |
| `mathSinavGenerator.ts` | 1275 | Domain bazlı modüllere böl |
| `NativeInfographicRenderer.tsx` | 1354 | Template bazlı böl |
| `App.tsx` | 1047 | Router bileşenine taşı |

### PF-2: SheetRenderer Bundle Boyutu
- **Sorun:** SheetRenderer.tsx tüm 100+ aktivite sheet türünü tek dosyada import ediyor → büyük initial bundle.
- **Çözüm:** Aktivite kategorilerine göre `React.lazy()` ile code splitting.

### PF-3: Firestore Index Kapsamı
- **Dosya:** `firestore.indexes.json`
- **Durum:** 3 index tanımlı — yeterli mi doğrulanmamış.
- **Öneri:** `firebase deploy --only firestore:indexes` ve gerçek query planlarını kontrol et.

---

## 🟡 TEST KAPSAMASI BOŞLUKLARI

### TK-1: Stüdyo Bileşenlerinde Test Yok
- MathStudio, ReadingStudio, SuperStudio (Türkçe), InfographicStudio — hiçbirinde unit test yok.
- Öneri: Her stüdyo için en az temel hook testleri.

### TK-2: WorkbookService Testleri Placeholder
- `tests/workbookService.test.ts` — içindeki testlerin %70'i `// TODO: Mock ...` yorumları.

### TK-3: Eksik Playwright E2E Testleri
- `tests/e2e/` klasörü `tsconfig.json`'da exclude edilmiş.
- Kritik akışlar (aktivite üretimi, kaydetme, print, öğrenci oluşturma) için E2E testler eksik.

### TK-4: API Endpoint Testleri Yok
- `api/generate.ts`, `api/students.ts`, `api/workbooks.ts` — hiçbiri test edilmemiş.

### TK-5: OCR Akışı End-to-End Testi Eksik
- OCR Scanner → Varyasyon üretimi → SheetRenderer akışı için entegrasyon testi yok.

### TK-6: `authMiddlewareSecurity.test.ts` — Test/Kaynak Uyumsuzluğu ⚠️ KRİTİK — v5.0 YENİ
- **Dosya:** `tests/authMiddlewareSecurity.test.ts`
- **Sorun:** Test dosyası `should prioritize JWT over unverified headers` ve `should disable fallback in production` senaryolarını test ediyor; `extractUserInfo()` fonksiyonunun JWT'yi doğrulayıp `x-user-id` header'ını görmezden gelmesini bekliyor.
- **Gerçek Durum:** `src/middleware/permissionValidator.ts:23-36` içinde JWT doğrulama kodu YORUM SATIRI olarak bekliyor. Bu testler **şu anda başarısız oluyor**.
- **Etki:** Test suite geçiyor görünse bile güvenlik testi yanlış — `npm test` CI kırmızı gösterebilir.
- **Çözüm:** SG-1 (A1 checklist) tamamlandığında bu testler otomatik geçer; ancak önce bunu doğrula.

---

## 🟡 EKSİK PLATFORM ÖZELLİKLERİ

### PO-1: Çevrimdışı (PWA) Desteği Yok
- Service worker / manifest.json yok.
- IndexedDB-based caching altyapısı (`cacheService.ts`) var ama PWA entegrasyonu yok.

### PO-2: Rate Limiting Kalıcılık Yok (Distributed)
- Vercel Serverless'ta her function invocation yeni process → in-memory rate limiter sıfırlanıyor.
- **Çözüm:** Redis/Upstash entegrasyonu veya Firestore-tabanlı rate limiting.

### PO-3: Toplu Dışa Aktarma (ZIP) Yok
- Birden fazla çalışma kağıdını tek ZIP'te dışa aktarma özelliği yok.
- `jszip` bağımlılığı `package.json`'da mevcut — implement edilmemiş.

### PO-4: Push Bildirim / Gerçek Zamanlı İşbirliği Yok
- WorkbookSharing altyapısı var; Firestore realtime listener'ları implemente edilmemiş.

### PO-5: Premium/Abonelik Yönetimi Yok
- PremiumPaperSizeSelector ve premium özellikler var ama paywall/ödeme sistemi yok.

---

## ✅ TAMAMLANMIŞ — GÜÇLÜ YÖNLER (Referans)

| Alan | Durum | Notlar |
|---|---|---|
| Gemini 2.5 Flash AI Motoru | ✅ Tamamlandı | 3 katmanlı JSON repair, retry, rate limit |
| 96 İnfografik Aktivitesi | ✅ Tamamlandı | 8 kategori, NativeInfographicRenderer |
| OCR + Varyasyon Üretimi | ✅ Tamamlandı | Blueprint sistemi, Gemini Vision |
| Matematik Sınav Stüdyosu | ✅ Tamamlandı | 33 görsel tip, MEB kazanım entegrasyonu |
| Türkçe Süper Stüdyo | ✅ Tamamlandı | 8 şablon (DilBilgisi, OkumaAnlama, vb.) |
| Öğrenci Yönetimi (BEP) | ✅ Tamamlandı | IEP, AI Profil, KVKK uyumu |
| 8 Premium Tema | ✅ Tamamlandı | HSL tabanlı, A4 izolasyonu |
| Prompt Güvenliği | ✅ Tamamlandı | 8 saldırı tipi tespiti, sanitizasyon |
| Firebase Auth | ✅ Tamamlandı | E-posta/şifre, Google Sign-in |
| Firestore CRUD | ✅ Tamamlandı | Worksheet, Student, Workbook |
| AppError Standardı | ✅ Tamamlandı | 10+ hata tipi, type guard |
| Rate Limiter (API) | ✅ Tamamlandı | In-memory (dağıtık için geliştirme gerekli) |
| CORS Güvenliği — `api/generate.ts` | ✅ Tamamlandı | Whitelist tabanlı, `corsMiddleware()` kullanıyor |
| CORS Güvenliği — Diğer 5 endpoint | ⚠️ EKSİK | `api/workbooks, approve, generate-exam, generate-variations, generate-image` → wildcard `*` |
| Disleksi Odaklı Tasarım | ✅ Tamamlandı | Lexend font, geniş satır aralığı |
| Tarama (Screening) Modülü | ✅ Tamamlandı | Risk seviyesi, domain skorları |
| Admin Onay Paneli | ⚠️ KISMİ | `AdminActivityApproval` UI hazır; servis in-memory (MA-11) |
| PDFViewer Modülü | ⚠️ EKSİK | Bileşen tamamlandı; App'e entegre edilmemiş (EK-12) |
| WorkbookAI Asistanı | ⚠️ KISMİ | Servis hazır; curriculum doğrulama TODO (EK-14) |

---

# 📋 TAM GELİŞTİRME PLANI CHECKLİSTİ

## 🔴 FAZ A: GÜVENLİK & ALTYAPI (Canlıya Almadan Önce Zorunlu)

### A1 — JWT Doğrulaması Aktif Et
- [ ] `src/middleware/permissionValidator.ts`: `extractUserInfo()` içindeki TODO yorumunu aç, `jwtService.verifyToken()` çağrısını aktif et
- [ ] API endpoint testleri ile doğrula

### A2 — npm Güvenlik Açıklarını Kapat
- [ ] `npm audit fix` koştur
- [ ] Breaking change gerektiren paketleri manuel güncelle
- [ ] `npm audit` → 0 high/critical hedefi

### A3 — RBAC Firestore Entegrasyonu
- [ ] `src/services/rbac.ts`: `getUserRole(userId)` fonksiyonunu Firestore `users` koleksiyonundan oku
- [ ] Admin kullanıcısı için Firestore'da rol kaydı oluştur
- [ ] Rol değişikliğini gerçek zamanlı senkronize et

### A4 — TypeScript Strict Mode
- [ ] `tsconfig.json`: `"strict": true`, `"noImplicitAny": true` yap
- [ ] `src/App.tsx` → `@ts-nocheck` kaldır, tip hatalarını gider
- [ ] `src/components/SheetRenderer.tsx` → `@ts-nocheck` kaldır
- [ ] `src/services/worksheetService.ts` → `@ts-nocheck` kaldır

### A5 — console.log/error Temizliği
- [ ] `src/services/worksheetService.ts:59`: `console.error` → `logError()`
- [ ] `src/services/generators/superStudioGenerator.ts`: `console.log` → `logError()`
- [ ] `src/services/workbook/workbookExport.ts`: `console.log` → `logError()`
- [ ] `src/components/AdminActivityApproval.tsx:96`: `console.error` → `logError()`

### A6 — Wildcard CORS Düzeltme — 5 Endpoint ⚡ YENİ
- [ ] `api/activity/approve.ts`: `Access-Control-Allow-Origin: *` → `corsMiddleware(req, res)` ile değiştir
- [ ] `api/generate-exam.ts`: aynı
- [ ] `api/ocr/generate-variations.ts`: aynı
- [ ] `api/ai/generate-image.ts`: aynı
- [ ] `api/workbooks.ts`: aynı
- [ ] Her endpoint'te `corsMiddleware()` import'unu ekle

### A7 — `api/export-infographic.ts` Güvenlik Sertleştirmesi ⚡ YENİ
- [ ] `corsMiddleware(req, res)` ekle
- [ ] JWT authentication middleware ekle
- [ ] Rate limiting ekle (dakikada max 10 istek)
- [ ] Zod ile input validation: `format: z.enum(['pdf', 'png', 'jpeg'])`, `html: z.string().max(500_000)`
- [ ] HTML sanitization veya yalnızca URL kabul et

### A8 — `privacyService.ts` — Node.js Crypto → Web Crypto API ⚡ YENİ
- [ ] `import { createHash } from 'crypto'` → Web Crypto API: `crypto.subtle.digest('SHA-256', ...)`
- [ ] `hashTcNo()` ve `generateAnonymousId()` fonksiyonlarını async yaparak Web Crypto kullan
- [ ] `tests/PrivacyService.test.ts` testlerini güncelle (async API değişikliği)
- [ ] Browser uyumluluğunu `vite.config.ts`'te doğrula

---

## 🟠 FAZ B: MİMARİ DÜZELTMELER (Sprint 1 — 1 Hafta)

### B1 — Dizin Yapısı Birleştirme
- [ ] `components/MatSinavStudyosu/` → `src/components/MatSinavStudyosu/`
- [ ] `components/SinavStudyosu/` → `src/components/SinavStudyosu/`
- [ ] Tüm import yollarını güncelle
- [ ] App.tsx lazy import yollarını güncelle
- [ ] Kök `components/` klasörünü sil

### B2 — JSON Repair Motoru — Shared Utility
- [ ] `src/utils/jsonRepair.ts` oluştur (3 katmanlı strateji)
- [ ] `api/generate.ts` → paylaşılan utility'den import et
- [ ] `src/services/geminiClient.ts` → paylaşılan utility'den import et
- [ ] `tests/jsonRepair.test.ts` ile test et

### B3 — Admin Dashboard Konsolidasyonu
- [ ] `AdminDashboardNew.tsx` ve `AdminDashboardV2.tsx` bileşenlerinin içeriğini `AdminDashboard.tsx`'e entegre et
- [ ] Eski dosyaları sil
- [ ] App.tsx import'u güncelle

### B4 — Auth State Standardizasyonu
- [ ] `src/context/AuthContext.tsx` kullanımını incele
- [ ] Tüm `useContext(AuthContext)` → `useAuthStore()` ile değiştir
- [ ] `AuthContext.tsx` kaldır veya yalnızca Zustand store'u saran ince sarmalayıcı yap

### B5 — Deprecated Dosya Temizliği
- [ ] `src/services/generators/visualPerception.ts` → sil
- [ ] `src/services/offlineGenerators/visualPerception.ts` → sil
- [ ] `ActivityType.SUPER_TURKCE_MATCHING` ve `SUPER_TURKCE_V2` enum değerlerini kaldır
- [ ] Bu enum değerlerine bağımlı tüm `case` ifadelerini güncelle

### B6 — Kök Dizin Temizliği
- [ ] 20+ orphan .md dosyasını `docs/archive/` altına taşı
- [ ] Geçici script dosyalarını `scripts/` veya `/tmp` altına al: `fix.cjs`, `autofix.cjs`, `audit_useeffect.cjs`, `fix-api-imports.cjs`, `fix-print-grids.js`, `fix-vars.js`, `fix-vars.mjs`, `check_git.js`, `check_git_remote.js`, `generate_infographics.cjs`, `generate_templates.cjs`, `generate_templates.js`, `update-okuma-anlama-schemas.js`
- [ ] `1.pdf`, `7. Sınıf...pdf`, `8-Snf...pdf` — git'ten kaldır
- [ ] `.gitignore`'a `*.pdf`, `temp/` ekle

### B7 — AnimationService Konsolidasyonu ⚡ YENİ
- [ ] `src/services/generators/AnimationService.ts` (v1.0 singleton) → kaldır
- [ ] `src/services/animationService.ts` (v2.0, Gemini 2.5 Flash + NeuroProfile) → canonical yap
- [ ] `AnimationStudio.tsx`'teki importları doğrula (zaten v2.0'a bağlı)
- [ ] `types/animation.ts` → `AnimationPayloadType` ve `NeuroProfileParamsType` tiplerinin v2.0 ile uyumunu kontrol et

### B8 — RBAC Sistemi Konsolidasyonu ⚡ YENİ
- [ ] `src/types/user.ts`'te canonical `UserRole` tipini tanımla: 7 rol (`admin | teacher | student | parent | guest | editor | superadmin`)
- [ ] `src/services/rbac.ts` → `UserRole` tipini canonical kaynaktan import et; eksik rolleri ekle
- [ ] `src/hooks/useRBAC.ts` → aynı canonical tipten import et; yerel tanımı kaldır
- [ ] Her iki sistemin izin matrislerini hizala

### B9 — `@remotion/player` Build Hatası Çözümü ⚡ YENİ — BLOCKER
- [ ] **Karar ver:** AnimationStudio özelliği şart mı?
  - **Evet:** `npm install @remotion/player @remotion/core` → `package.json`'a ekle → `AnimationStudio.tsx` ve Sidebar route'unu aktif et
  - **Hayır:** `src/components/remotion/` ve `src/components/RemotionStudio/` klasörlerini sil; `vite.config.ts`'teki `vendor-3d` chunk'ı güncelle

### B10 — `activityApprovalService.ts` → Firestore Migrasyonu ⚡ YENİ
- [ ] Firestore'da `activity_approvals` koleksiyonu oluştur
- [ ] `submitForReview()` → `addDoc()` ile Firestore'a yaz
- [ ] `getPendingReviews()` → `getDocs(query(...where('status', '==', 'pending_review')))` ile çek
- [ ] `approve()` ve `reject()` → `updateDoc()` ile durumu güncelle
- [ ] `feedbackSignals` dizisi → `approval_feedback` koleksiyonu
- [ ] `tests/ActivityApprovalService.test.ts` testlerini Firestore mock ile güncelle

---

## 🟠 FAZ C: EKSİK ÖZELLİKLER (Sprint 2 — 2 Hafta)

### C1 — Focus Mode: ReadingStudio Entegrasyonu
- [ ] `src/components/ReadingStudio/ReadingStudio.tsx`: `focusMode` state'ini okuyacak hook ekle
- [ ] Okuma alanı `div`'ine `focus-mode-active` CSS sınıfı koşullu olarak uygula
- [ ] Araç çubuğuna Focus Mode toggle butonu ekle
- [ ] `useReadingStore.ts`'te `focusMode` boolean state ekle

### C2 — Success Glow: Aktivite Tamamlama Bağlantısı
- [ ] `src/components/SheetRenderer.tsx`: Aktivite tamamlama callback'i tanımla
- [ ] Sayfa geçişlerinde veya "Bitti" butonunda `success-glow-animation` CSS sınıfını tetikle
- [ ] Framer Motion ile yumuşat

### C3 — Palette Reflection: AI İnfografik Entegrasyonu
- [ ] `src/services/generators/infographicGenerator.ts`: `getInfographicPalette()` çağrısı ekle
- [ ] Üretilen infografik verisinde `primaryColor`, `secondaryColor` alanlarını tema rengiyle doldur
- [ ] `NativeInfographicRenderer.tsx`'teki `forPrint` prop flow'unu doğrula

### C4 — WorkbookExport PDF İyileştirmeleri
- [ ] `src/services/workbook/workbookExport.ts`: PDF sayfa içeriği rendering implement et
- [ ] Cevap anahtarı sayfası ekle
- [ ] Filigran (watermark) fonksiyonu ekle
- [ ] `exportToPDF()` → `printService.ts` ile entegre et

### C5 — WorkbookSharing: Auth Entegrasyonu
- [ ] `src/services/workbook/workbookSharingService.ts:65`: `uuidv4()` → `useAuthStore.getState().user.uid`
- [ ] Firestore'a gerçek user ID ile yaz

### C6 — SharedWorksheetsView: Assessment Modal
- [ ] `src/components/SharedWorksheetsView.tsx:158`: Paylaşılan assessment raporunu görüntülemek için `AssessmentReportViewer` modalı entegre et

### C7 — AnimationStudio Kararı
- [ ] `@remotion/player` paketini ekle VEYA
- [ ] `src/components/remotion/` klasörünü tamamen kaldır (router'a bağlı değil, bağımlılık yok)
- [ ] Karar verildiğinde Sidebar'a uygun view ekle

### C8 — MobileWorksheetViewer Route
- [ ] `src/App.tsx`: `'mobile-viewer'` view case ekle
- [ ] `src/components/Sidebar.tsx`: Mobil görünüm için koşullu buton ekle
- [ ] Responsive breakpoint ile otomatik tetikle

### C9 — PDFViewer Entegrasyonu ⚡ YENİ
- [ ] `src/App.tsx`'e `'pdf-viewer'` view case ekle; `React.lazy(() => import('./components/PDFViewer/PDFViewer'))` kullan
- [ ] `src/components/Sidebar.tsx`'e "PDF Görüntüle" menü maddesi ekle (öğretmen + admin için)
- [ ] `SavedWorksheetsView.tsx`'de PDF tipindeki çalışmalar için "Görüntüle" butonu ekle
- [ ] `PDFViewer`'a `url` prop'u ile disleksi araç çubuğunu etkinleştir

### C10 — Prompt Sistemi Konsolidasyonu ⚡ YENİ
- [ ] `src/services/generators/prompts/` içindeki `PROMPTS_REGISTRY` kayıtlarını `promptLibrary.ts` ile birleştir
- [ ] Her iki sistemdeki `getPromptTemplate(type)` fonksiyonlarını tek API'ye indir
- [ ] `generators/prompts/` klasörünü sil; import yollarını güncelle

---

## 🟡 FAZ D: PERFORMANS & YENİDEN DÜZENLEME (Sprint 3 — 2 Hafta)

### D1 — Mega Bileşen: ProfileView Böl
- [ ] `src/components/ProfileView.tsx` (1834 satır) → aşağıdaki alt bileşenlere böl:
  - `ProfileHeader.tsx`
  - `ProfileStats.tsx`
  - `ProfileWorksheetHistory.tsx`
  - `ProfileSettings.tsx`
  - `ProfileSubscription.tsx`

### D2 — Mega Bileşen: SheetRenderer Lazy Split
- [ ] `src/components/SheetRenderer.tsx` (1712 satır): Aktivite kategorilerine göre lazy-loaded chunk'lara böl:
  - `SheetRendererMath.tsx` (matematik aktiviteleri)
  - `SheetRendererVerbal.tsx` (okuma/dil aktiviteleri)
  - `SheetRendererVisual.tsx` (görsel aktiviteler)
  - `SheetRendererAttention.tsx` (dikkat/bellek)
  - `SheetRendererInfographic.tsx` (infografik)
- [ ] Ana `SheetRenderer.tsx` → koordinatör + lazy import

### D3 — App.tsx Router Bileşene Taşı
- [ ] `src/components/AppRouter.tsx` oluştur; view switch mantığını oraya taşı
- [ ] `src/App.tsx` → yalnızca provider ve layout

### D4 — Distributed Rate Limiting
- [ ] `src/services/rateLimiter.ts` → Firestore tabanlı sliding window ekle
- [ ] `api/generate.ts` rate limiter'ı güncelle
- [ ] Alternatif: Upstash Redis entegrasyonu

---

## 🟡 FAZ E: TEST KAPSAMASI GENİŞLETME (Sprint 3 — Paralel)

### E1 — Stüdyo Unit Testleri
- [ ] `tests/MathStudio.test.ts` — useProblemGenerator hook testi
- [ ] `tests/ReadingStudio.test.ts` — content rendering testi
- [ ] `tests/SuperStudio.test.ts` — şablon yükleme ve üretim testi
- [ ] `tests/InfographicStudio.test.ts` — aktivite seçimi ve render testi

### E2 — API Endpoint Testleri
- [ ] `tests/api/generate.test.ts` — rate limit, CORS, validation testi
- [ ] `tests/api/students.test.ts` — CRUD + RBAC testi
- [ ] `tests/api/workbooks.test.ts` — CRUD + sharing testi

### E3 — WorkbookService Test Tamamlama
- [ ] `tests/workbookService.test.ts` içindeki tüm `// TODO: Mock ...` yorumlarını gerçek mock'larla değiştir
- [ ] Soft delete, restore, pagination testlerini tamamla

### E4 — E2E Playwright Testleri
- [ ] `tests/e2e/tsconfig.json` oluştur; exclude listesinden çıkar
- [ ] `tests/e2e/generate-activity.spec.ts` — aktivite üretimi
- [ ] `tests/e2e/save-worksheet.spec.ts` — kaydetme akışı
- [ ] `tests/e2e/print-worksheet.spec.ts` — print akışı
- [ ] `tests/e2e/student-management.spec.ts` — öğrenci CRUD

---

## 🟡 FAZ F: YENİ PLATFORM ÖZELLİKLERİ (Sprint 4+ — Roadmap)

### F1 — PWA Desteği
- [ ] `public/manifest.json` oluştur
- [ ] Service Worker ekle (`vite-plugin-pwa` veya elle)
- [ ] `cacheService.ts` → offline worksheet cache ile entegre et
- [ ] "Çevrimdışı Kullanılabilir" aktivite işareti

### F2 — Toplu ZIP Dışa Aktarma
- [ ] `jszip` bağımlılığı zaten mevcut
- [ ] `src/services/workbook/workbookExport.ts`: `exportToZip(worksheetIds[])` implement et
- [ ] UI: SavedWorksheetsView'da çoklu seçim + ZIP butonu

### F3 — Vercel Analytics + Sentry
- [ ] `@vercel/analytics` paketi ekle
- [ ] `src/utils/logger.ts:124`: Vercel Analytics event tracking
- [ ] `@sentry/react` paketi ekle
- [ ] `src/utils/logger.ts:135`: Sentry error reporting
- [ ] `ErrorBoundary.tsx`'i Sentry ile entegre et

### F4 — Renk Körlüğü Testleri
- [ ] 8 tema için Protanopia/Deuteranopia simülasyonu
- [ ] `src/utils/contrastChecker.ts` (mevcut) → tema doğrulama pipeline'ına entegre et
- [ ] WCAG AA kontrast uyumluluğu hedefi

### F5 — Firestore Audit Log
- [ ] `src/utils/logger.ts:143`: Firestore `audit_logs` koleksiyonuna yaz
- [ ] `auditLogger.ts` mevcut; `logger.ts` ile entegre et
- [ ] Admin panelinde audit log görünümü (AdminDashboard)

### F6 — Gerçek Zamanlı İşbirliği (Workbook)
- [ ] `workbookSharingService.ts`: Firestore `onSnapshot` listener ekle
- [ ] Çevrimiçi katılımcı listesi göster
- [ ] Conflict resolution stratejisi (last-write-wins veya CRDT)

---

## 📊 DURUM TAKİP TABLOSU

| Faz | Başlık | Öncelik | Tahmini Süre | Durum |
|---|---|---|---|---|
| **A** | Güvenlik & Altyapı (A1–A8) | 🔴 KRİTİK | 4-7 gün | ⬜ Bekliyor |
| **B** | Mimari Düzeltmeler (B1–B10) | 🟠 YÜKSEK | 7-10 gün | ⬜ Bekliyor |
| **C** | Eksik Özellikler (C1–C10) | 🟠 YÜKSEK | 10-14 gün | ⬜ Bekliyor |
| **D** | Performans & Refactor | 🟡 ORTA | 7-10 gün | ⬜ Bekliyor |
| **E** | Test Kapsaması | 🟡 ORTA | 5-7 gün | ⬜ Bekliyor |
| **F** | Yeni Platform Özellikleri | 🟢 DÜŞÜK | 14+ gün | ⬜ Bekliyor |

**Toplam Açık Görev:** ~55 checklist maddesi  
**Canlıya Alma Blocker'ları:** A1 + A7 + A8 + B9 + TS-1 + TS-2

---

## 🏆 CANLIYA ALMA KARAR MATRISI

Aşağıdaki tüm koşullar sağlanmadan canlıya alma **YASAKLANMIŞTIR**:

- [ ] **SG-1 / A1**: JWT doğrulaması aktif ve `authMiddlewareSecurity` testleri geçiyor
- [ ] **SG-2 / A2**: `npm audit` → 0 high severity açığı
- [ ] **SG-3 / A3**: RBAC Firestore'dan çalışıyor
- [ ] **SG-5 / A6**: Tüm 5 endpoint wildcard CORS → `corsMiddleware()`
- [ ] **SG-7 / A7**: `export-infographic` endpoint güvenli (auth + validation)
- [ ] **SG-6 / A8**: `privacyService.ts` → Web Crypto API
- [ ] **TS-1 / A4**: `strict: true` yapılandırıldı
- [ ] **TS-2 / A4**: `@ts-nocheck` kaldırıldı
- [ ] **MA-1 / B1**: Tek `src/components/` dizin yapısı
- [ ] **MA-9 / B9**: `@remotion/player` build hatası giderildi (kaldır veya ekle)
- [ ] **MA-11 / B10**: `activityApprovalService` → Firestore
- [ ] **A4 İzolasyonu**: Print testleri geçiyor
- [ ] **EK-5 / C5**: WorkbookSharing gerçek userId kullanıyor
- [ ] **KVKK Uyumu**: Öğrenci adı + tanı + skor aynı anda görünmüyor
- [ ] `pedagogicalNote` her AI aktivite çıktısında mevcut

---

*Bu döküman Oogmatik Agent Koordinasyon Sistemi tarafından üretilmiştir.*  
*v4.0 — 2026-04-11: İlk kapsamlı analiz (157.191 satır, 46+ test, 8 endpoint)*  
*v5.0 — 2026-04-11: 2. tur derinlemesli analiz — +3 güvenlik (SG-5..7) | +5 mimari (MA-8..12) | +4 eksik özellik (EK-12..15) | +1 test uyumsuzluğu (TK-6) | CORS tablosu düzeltildi*

---

# OOGMATIK — Evrensel Renk Paleti ve Görsel Modernizasyon Stratejisi (v3.0 Ultra Premium)
> **Not:** Aşağıdaki bölüm önceki plan dökümanından korunmuştur.



Bu strateji belgesi, **Oogmatik** platformunun tüm dijital varlıklarını (Stüdyolar, Admin, Öğrenci Panelleri) dünya standartlarında bir "EdTech SaaS" estetiğine kavuştururken, klinik çıktılar olan A4 sayfalarını bu görsel fırtınadan tamamen izole etmeyi amaçlar.

---

## 📊 Uygulama Durumu (Son Güncelleme: 2026-03-31)

| Faz | Başlık | Durum |
| :--- | :--- | :--- |
| FAZ 1 | Merkezi Tema Katmanı | ✅ **TAMAMLANDI** |
| FAZ 2 | Komponent Adaptasyonu | ✅ **TAMAMLANDI** |
| FAZ 3 | Mikro-Animasyonlar | ✅ **TAMAMLANDI** |
| FAZ 4 | A4 İzolasyonu + Print Trigger | ✅ **TAMAMLANDI** |
| Ajan Aktivasyonu | registry.json + ORCHESTRATION.md | ✅ **TAMAMLANDI** |

### Kalan Görevler (FAZ 2 — Devam Eden)
- [ ] **Selin: Palette Reflection Entegrasyonu**: AI İnfografik üreticisinde `getThemeAccentColor()` çağrısı — altyapı hazır (`themeUtils.ts` + `NativeInfographicRenderer.forPrint` prop), `infographicGenerator.ts` içinden renk okuma entegrasyonu
- [ ] **Selin: Responsive Micro-Interactions**: Farklı temalara göre AI loading animasyonları (Space: yıldız kayması, Nature: yaprak hışırtısı)
- [ ] **FAZ 3: Success Glow Bağlantısı**: `.success-glow-animation` CSS sınıfı hazır — aktivite tamamlama event'ine bağlanması gerekiyor

---

## 👑 Lider Uzman Paneli — Derinlemesine Teknik Analiz

### 1. Elif Yıldız (Pedagoji & ZPD) — "Bilişsel Konfor"
*   **Dual-Coding Renk Eşleşmesi:** Matematik ve okuma modüllerinde, sayılar ve heceler için kullanılan renklerin arayüz temasıyla çakışmaması için "Color Shielding" (renk kalkanı) uygulanacak.
*   **Success Glow (Başarı Işıltısı):** ✅ `success-glow-animation` CSS sınıfı `theme-tokens.css`'e eklendi. Aktivite tamamlama event'ine bağlanacak (kalan iş).
*   **Focus Mode (Bimodal Okuma):** ✅ `.focus-mode-overlay` ve `.focus-mode-active` CSS sınıfları eklendi. ReadingStudio'ya entegrasyon kalan.

### 2. Dr. Ahmet Kaya (Klinik & Erişilebilirlik) — "Nöro-Mimari"
*   **Visual Fatigue Guard:** ✅ HSL tabanlı tema değişkenleri "Soft Contrast" prensibine göre ayarlandı.
*   **Saccadic Eye Movement Support:** ✅ Tüm dark temalarda saf siyah yerine koyu gri tonları kullanılıyor.
*   **A4 Veri Safiyeti:** ✅ `theme-tokens.css`'te `.worksheet-page` için tam izolasyon bloğu uygulandı.

### 3. Bora Demir (Mühendislik & Standartlar) — "Dinamik Altyapı"
*   **Themed Glassmorphism:** ✅ `--surface-glass: rgba(255,255,255, 0.05)` (dark) / `rgba(0,0,0, 0.03)` (light), `--surface-glass-blur` değişkeni eklendi.
*   **HSL Color Matrix:** ✅ `--accent-h`, `--accent-s`, `--accent-l` değişkenleri tüm temalara eklendi. `--accent-color: hsl(var(--accent-h), var(--accent-s), var(--accent-l))` formatı uygulandı.
*   **Strict Isolation Layer:** ✅ `.worksheet-page` için `color-scheme: light !important` + tüm CSS değişkenleri sabit light değerlerine override edildi.

### 4. Selin Arslan (AI Mimarisi) — "Görsel Zeka"
*   **Palette Reflection (Yansıma):** ✅ `src/utils/themeUtils.ts` oluşturuldu: `getThemeAccentColor()`, `getInfographicPalette(forPrint?)` fonksiyonları. `NativeInfographicRenderer`'a `forPrint` prop ve `activePalette` eklendi. Ekran modunda `--infographic-primary`/`--infographic-secondary` CSS değişkenleri tema rengiyle enjekte edilir.
*   **Responsive Micro-Interactions:** 🔶 Genel `shimmer-overlay` ve `page-enter-animation` sınıfları hazır. Tema bazlı farklılaşma gelecek sprint.

---

## 🎨 Ultra Premium Tema Katalogu (Modernize Edilmiş)

| Tema Kimliği | CSS Sınıfı | Arka Plan (BG) | Vurgu (Accent) | Karakter & Mood | Durum |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Milk & Honey** | `theme-light` | `#F8FAFC` | `#4F46E5` | Temiz, Ferah, Klasik Eğitim | ✅ |
| **Anthracite** | `theme-anthracite` | `#121214` | `#6366F1` | Varsayılan — Derin Profesyonel | ✅ |
| **Obsidian Deep** | `theme-dark` | `#09090B` | `#818CF8` | Kararlı, Derin, Profesyonel | ✅ |
| **Nordic Mist** | `theme-ocean` | `#082F49` | `#38BDF8` | Dingin, Odaklı, Huzurlu | ✅ |
| **Emerald Forest** | `theme-nature` | `#052E16` | `#4ADE80` | Doğal, Büyümeyi Teşvik Eden | ✅ |
| **Imperial Stone** | `theme-anthracite-gold` | `#1C1917` | `#F59E0B` | Prestijli, Kurumsal, Güçlü | ✅ |
| **Cyber Punk** | `theme-anthracite-cyber` | `#020202` | `#F43F5E` | Dinamik, Enerjik, Gelecekçi | ✅ |
| **Deep Space** | `theme-space` | `#020617` | `#38BDF8` | Sonsuz Derin Mavi Evren | ✅ |

---

## 🚀 Teknik Uygulama Yol Haritası

### FAZ 1: Merkezi Tema Katmanı (Global CSS) ✅ TAMAMLANDI
- ✅ **`src/styles/theme-tokens.css`**: 8 tema için HSL değişkenleri, glassmorphism, animasyonlar.
- ✅ **`src/styles/tailwind.css`**: `@import './theme-tokens.css'` eklendi.
- ✅ **Tailwind Config**: CSS değişkenleri zaten `tailwind.config.js`'de tanımlı.

### FAZ 2: Statik ve Dinamik Komponentlerin Adaptasyonu ✅ TAMAMLANDI
- ✅ **SettingsModal**: Ultra Premium tema adları ve renkleri güncellendi.
- ✅ **AdminAnalytics**: Sparkline ve bar chart renkleri `var(--accent-color)`, `var(--accent-hover)` CSS değişkenlerine geçirildi.
- ✅ **MathStudio**: Hardcoded `#121212`/`#18181b`/`#09090b` → `var(--bg-primary)`/`var(--bg-paper)`/`var(--bg-inset)` + `backdropFilter: blur(var(--surface-glass-blur))` sidebar glassmorphism.
- ✅ **ReadingStudio**: Header, sidebar, canvas CSS değişkenlerine geçiş. Glassmorphism zoom toolbar. `.studio-icon-btn` CSS sınıfı ile hover efektleri temizlendi.

### FAZ 3: Etkileşim Tasarımı (Micro-Animations) ✅ TAMAMLANDI
- ✅ **`.btn-accent-glow`**: Hover'da temanın vurgu rengiyle ışık patlaması.
- ✅ **`.card-glow`**: Kartlar için hover glow animasyonu.
- ✅ **`.shimmer-overlay`**: Tema rengini taşıyan sayfa geçiş parlaması.
- ✅ **`.success-glow-animation`**: Aktivite tamamlama "nefes alma" animasyonu.
- ✅ **`.page-enter-animation`**: Sayfa geçiş fade+blur animasyonu.
- ✅ **`.focus-mode-overlay`**: Okuma stüdyosu focus mode CSS altyapısı.

### FAZ 4: Kesin A4 İzolasyonu ve Print Engine v7.0 ✅ TAMAMLANDI
- ✅ **Isolation CSS Block** (`theme-tokens.css`):
  ```css
  .worksheet-page, .worksheet-page * {
    color-scheme: light !important;
    transition: none !important;
  }
  .worksheet-page {
    background-color: white !important;
    color: black !important;
    /* Tüm CSS değişkenleri sabit light değerlerine override */
  }
  ```
- ✅ **Print Trigger** (`src/App.tsx`): `beforeprint` / `afterprint` event listener'ları ile yazdırma öncesi `printing-forced-light` sınıfı uygulanıyor, sonra eski tema geri yükleniyor.
- ✅ **`:root.printing-forced-light`**: Print sırasında tüm tema değişkenlerini light değerlerine çeken CSS kuralı.

### Ajan Aktivasyonu ✅ TAMAMLANDI
- ✅ **`registry.json` v2.0**: `visual-modernization` aktivasyon kuralı eklendi. Faz durumları kayıt altına alındı.
- ✅ **`ORCHESTRATION.md`**: Kural 8 — Görsel Modernizasyon eklendi, tetikleyiciler ve iş akışı tanımlandı.
- ✅ **Bora Demir autoActivate**: CSS, tema, glassmorphism, animasyon, HSL tetikleyicileri eklendi.
- ✅ **Selin Arslan autoActivate**: Palette Reflection, infografik, loading animasyonu tetikleyicileri eklendi.
- ✅ **Elif Yıldız autoActivate**: Focus Mode, Dual-Coding, Success Glow tetikleyicileri eklendi.

---

## 📋 Kalite ve Kontrol Metrikleri

- [ ] Renk körlüğü testleri (Protanopia/Deuteranopia) %100 başarılı mı?
- [x] Doygunluk (Saturation) slider'ı — `body.style.filter` ile çalışıyor, `--ui-saturation` CSS değişkeni de set ediliyor.
- [x] A4 sayfası `Cyber Punk` temasında bile hala bembeyaz ve kusursuz mu? ✅ (CSS izolasyon + print trigger)
- [ ] Tema geçişleri 60fps akıcılıkta mı?
- [ ] Admin Dashboard Recharts tema rengi entegrasyonu tamamlandı mı?
- [ ] Studio kontrol paneli glassmorphism entegrasyonu tamamlandı mı?

---

> [!CAUTION]
> A4 sayfasındaki herhangi bir tema sızıntısı (leakage), klinik raporlama standartlarını ihlal eder. Bu yüzden Faz 4 testleri geçilmeden canlıya alınamaz.


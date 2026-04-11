# OOGMATIK — Platform Tamamlama & Kalite Güvencesi Master Planı (v4.0 Ultra Premium)

> **Güncelleme Tarihi:** 2026-04-11  
> **Analiz Kapsamı:** 157.191 satır TypeScript/TSX | 46+ test dosyası | 8 API endpoint | 10 Zustand store | 40+ AI generator | 25+ offline generator | 60+ React bileşeni  
> **Durum:** 🚨 Canlıya Alma Öncesi Zorunlu Müdahale Gerektiriyor

---

## 🎯 YÖNETİCİ ÖZETİ (Executive Summary)

Oogmatik platformu fonksiyonel olarak ileri bir seviyededir; ancak **canlıya almadan önce** aşağıdaki kritik alanlarda müdahale zorunludur:

| Kategori | Risk Seviyesi | Durum |
|---|---|---|
| **Güvenlik Açıkları** | 🔴 KRİTİK | JWT doğrulama eksik, 9 yüksek önem seviyeli npm güvenlik açığı |
| **TypeScript Uyumu** | 🔴 KRİTİK | `strict: false`, `@ts-nocheck` kullanımı — kural ihlali |
| **Eksik API Özellikleri** | 🟠 YÜKSEK | WorkbookExport (DOCX/PPTX/EPUB/SCORM), Focus Mode, RBAC |
| **Mimari Artıklar** | 🟠 YÜKSEK | Çift dizin yapısı, kopya JSON repair motoru, 3 admin dashboard |
| **Test Kapsamı** | 🟡 ORTA | Stüdyo bileşenleri test edilmemiş, workbook testleri TODO dolu |
| **Performans** | 🟡 ORTA | Mega bileşenler (SheetRenderer: 1712 satır, ProfileView: 1834 satır) |
| **Tamamlanmamış Özellikler** | 🟡 ORTA | AnimationStudio, palette reflection, success glow bağlantısı |

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
| CORS Güvenliği | ✅ Tamamlandı | Wildcard yasak, origin validation |
| Disleksi Odaklı Tasarım | ✅ Tamamlandı | Lexend font, geniş satır aralığı |
| Tarama (Screening) Modülü | ✅ Tamamlandı | Risk seviyesi, domain skorları |

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
| **A** | Güvenlik & Altyapı | 🔴 KRİTİK | 3-5 gün | ⬜ Bekliyor |
| **B** | Mimari Düzeltmeler | 🟠 YÜKSEK | 5-7 gün | ⬜ Bekliyor |
| **C** | Eksik Özellikler | 🟠 YÜKSEK | 7-10 gün | ⬜ Bekliyor |
| **D** | Performans & Refactor | 🟡 ORTA | 7-10 gün | ⬜ Bekliyor |
| **E** | Test Kapsaması | 🟡 ORTA | 5-7 gün | ⬜ Bekliyor |
| **F** | Yeni Özellikler | 🟢 DÜŞÜK | 14+ gün | ⬜ Bekliyor |

---

## 🏆 CANLIYA ALMA KARAR MATRISI

Aşağıdaki tüm koşullar sağlanmadan canlıya alma **YASAKLANMIŞTIR**:

- [ ] **SG-1**: JWT doğrulaması aktif ✅
- [ ] **SG-2**: `npm audit` → 0 high severity açığı ✅
- [ ] **SG-3**: RBAC Firestore'dan çalışıyor ✅
- [ ] **TS-1**: `strict: true` yapılandırıldı ✅
- [ ] **TS-2**: `@ts-nocheck` kaldırıldı ✅
- [ ] **MA-1**: Tek `src/components/` dizin yapısı ✅
- [ ] **A4 İzolasyonu**: Print testleri geçiyor ✅
- [ ] **EK-5**: WorkbookSharing gerçek userId kullanıyor ✅
- [ ] **KVKK Uyumu**: Öğrenci adı + tanı + skor aynı anda görünmüyor ✅
- [ ] `pedagogicalNote` her AI aktivite çıktısında mevcut ✅

---

*Bu döküman Oogmatik Agent Koordinasyon Sistemi (v4.0) tarafından 2026-04-11 tarihinde kapsamlı kod tabanı analizi sonucunda üretilmiştir.*  
*Analizci: GitHub Copilot Task Agent | 157.191 satır, 46+ test, 8 API endpoint, 10 store incelendi.*

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


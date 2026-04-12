# Oogmatik - Ultra Profesyonel Premium Geliştirme ve Güncelleme Planı (Master Plan)

> **Proje:** Oogmatik EdTech Platformu
> **Analiz Tarihi:** 2026-03-27
> **Odak:** Teknik Borçların Kapatılması, Performans Optimizasyonu, Oogmatik Ajan Protokolü Uyumu ve Derinlemesine Revizyon

**Hedef:** Sistemdeki kritik protokol ihlallerini gidermek, tip güvenliğini (TypeScript) %100 oranına çıkarmak, kod kalitesini (Lint) standartlaştırmak ve AI/API entegrasyonlarındaki test/runtime hatalarını çözmek suretiyle Oogmatik platformunu "Zero-Defect" (Sıfır Hata) üretim standartlarına taşımak.

**Mimari:** React 18 + TypeScript (strict) + Vite + Vercel Serverless + Gemini 2.5 Flash + Firebase + Vitest

---

## 🛑 BÖLÜM 1: Acil Protokol İhlallerinin Giderilmesi (Uzman Kuralları)

Yapılan derinlemesine statik analiz ve grep taramaları sonucunda "Uzman Ajan" (Elif Yıldız, Dr. Ahmet Kaya, Bora Demir, Selin Arslan) protokollerinin kritik düzeyde ihlal edildiği saptanmıştır.

### Görev 1.1: Mühendislik Standartları (Bora Demir Kuralları) Revizyonu

_Açıklama:_ Proje genelinde kesinlikle yasak olan "any" tipi, "console.log" ve raw "throw new Error" kullanımları tespit edilmiştir.

- [ ] **`any` Tiplerinin Yok Edilmesi:** Proje genelinde tespit edilen 536 adet `any` tipi kullanımları (özellikle `src/utils/schemas.ts`, `services/worksheetService.ts` ve store dosyalarında) tamamen temizlenmeli, yerine `unknown` tipi ve _type guard_ mekanizmaları uygulanmalıdır.
- [ ] **AppError Standardizasyonu:** Mevcut 60 noktada doğrudan `throw new Error()` kullanıldığı görülmüştür. Bu hatalar, Oogmatik standartlarındaki `AppError` formatına (`{ success, error: { message, code }, timestamp }`) uygun olarak `utils/AppError.ts` içindeki sınıflarla (örn. `ValidationError`, `AuthError`) değiştirilmelidir.
- [ ] **Console Log Temizliği:** Üretim ortamında kesinlikle yasak olan `console.log` kullanımları (özellikle AI generatörler ve Audit modüllerindeki 20 adet kullanım) tamamen kaldırılmalı veya `utils/logger.ts` üzerinden seviyelendirilerek yönetilmelidir.

### Görev 1.2: API Güvenliği ve Rate Limiting

_Açıklama:_ Yeni veya mevcut API endpoint'lerinde rate limiting kontrollerinin eksik olduğu görülmüştür.

- [ ] **RateLimiter Entegrasyonu:** `api/` dizinindeki (`export-pdf.ts`, `feedback.ts` vb.) tüm endpoint'lere `services/rateLimiter.ts` mekanizması eklenerek `RateLimitError` fırlatması garanti altına alınmalıdır.

### Görev 1.3: Pedagojik Kalite Standardı (Elif Yıldız Kuralları)

_Açıklama:_ Her AI aktivitesinde zorunlu olan `pedagogicalNote` alanının bazı test mock'larında ve generatör şemalarında eksik olduğu veya 50 karakter kuralını ihlal ettiği görülmüştür.

- [ ] **Pedagogical Note Doğrulaması:** Zod şemalarında (`utils/schemas.ts`) ve tüm offline/AI generatör çıktılarında `pedagogicalNote` alanının karakter uzunluğu zorunlu kılınmalı ve test senaryolarında bu kurala uygun mock datalar oluşturulmalıdır.

---

## 🛠 BÖLÜM 2: TypeScript & Derleme Hatalarının Çözümü

`npx tsc --noEmit` sonuçları incelendiğinde yüzlerce derleme hatası tespit edilmiştir. Proje tip güvenliği zedelenmiştir.

### Görev 2.1: Eksik Export ve Modül Hataları

- [ ] **Types Düzeltmeleri:** `types/admin.ts` ve `types/worksheet.ts` içindeki export edilmeyen fakat import edilmeye çalışılan tipler (örn: `UserRoleDefinition`, `AuditAction`, `PermissionKey`, `SystemHealthReport`, `WorksheetAnalyticEntry`) bulunup eksikleri giderilmeli veya import yolları (alias) düzeltilmelidir.
- [ ] **React Prop Tipleri:** Mobile Worksheet Viewer ve OCR Scanner bileşenlerindeki eksik property hataları (`footerText` eksikliği gibi) giderilmelidir.
- [ ] **React-PDF-Renderer Uyumluluğu:** `api/export-pdf.ts` içerisindeki React ve `@react-pdf/renderer` modül çözünürlüğü hataları giderilmeli (gerekirse types veya tsconfig modül ayarları güncellenmelidir).

---

## 🧹 BÖLÜM 3: Kod Kalitesi (Linting) ve UI Düzenlemeleri

`npm run lint` komutu büyük hacimli uyarılara ve hatalara işaret etmektedir.

### Görev 3.1: ESLint Standartlarının Oturtulması

- [ ] **Kullanılmayan Değişkenler:** (Unused Variables) Proje genelindeki yüzlerce `isSidebarOpen`, `loading`, `e` gibi deklare edilmiş ancak kullanılmayan değişkenler (özellikle `src/components/` altında) temizlenmelidir.
- [ ] **React Hooks Kuralları:** `exhaustive-deps` (eksik hook bağımlılıkları) ihlalleri özellikle InfographicRenderer ve PDFViewer bileşenlerinde giderilmelidir.
- [ ] **JSX Kaçış Karakterleri (Unescaped Entities):** UI metinlerindeki `'` ve `"` kullanımları `&apos;` ve `&quot;` olarak (veya kıvırcık parantez içinde string literals olarak) güncellenmelidir.
- [ ] **Props Validasyonu:** `DyslexiaToolbar` ve `PDFPageRenderer` gibi bileşenlerdeki eksik PropTypes validasyonları TypeScript interfaceleri ile güçlendirilerek giderilmelidir.

---

## 🧪 BÖLÜM 4: Test Altyapısı ve Stabilizasyon

### Görev 4.1: Vitest Hatalarının Giderilmesi

- [ ] **Prompt Security Testleri:** `promptSecurity.test.ts` içindeki başarısız olan 3 test senaryosu incelenip (özellikle karakter limiti zorlaması ve bayrak testleri) düzeltilmelidir.
- [ ] **Gemini Proxy / Fetch URL Hataları:** Test ortamında `fetch` işlemlerinin relative path (`/api/generate`) kullanmasından kaynaklı `ERR_INVALID_URL` hataları mevcut. MSW (Mock Service Worker) entegre edilmeli veya testler çalışırken baseURL'in absolut olarak (örneğin `http://localhost:3000`) sağlanması (global test setup ile) garanti edilmelidir.

---

## 🚀 BÖLÜM 5: Feature Upgrade & İyileştirme Yol Haritası (Premium Upgrade)

Yukarıdaki teknik borçlar kapatıldıktan sonra platformu evrensel premium seviyeye taşımak için uygulanacak yeni hedefler:

1. **AI Caching Optimizasyonu:** `cacheService.ts` IndexedDB üzerinden ilerliyor. Performans için en çok istenen genel jenerik aktivitelerin pre-cache işlemine tabi tutulup, bekleme süresinin 0'a indirilmesi.
2. **Offline Generatörlerin Genişletilmesi:** Sistemin maliyetini sıfıra indiren offline deterministik jeneratörlere (25 adet olan kapasite), "Hece Parkuru" ve "Görsel İşitsel Eşleme" gibi 10 yeni modül eklenmesi (Selin Arslan onayıyla).
3. **Advanced A4 Editor Snap-to-Grid:** Sürükle-bırak motoruna manyetik hizalama (snap-to-grid) ve katman yönetiminde (z-index) profesyonel hizalama kılavuz çizgileri eklenmesi.

---

## 📝 Uygulama Stratejisi (Agentic Execution)

> Bu planın hayata geçirilmesi için **`subagent-driven-development`** (Oogmatik Superpowers) becerisi önerilmektedir. Her bir ana görev, bağımsız bir subagent'a delege edilerek paralel ve güvenli bir şekilde entegre edilecektir. Her adım sonunda zorunlu olarak `npm run test:run` ve `npm run lint` geçmek zorundadır.

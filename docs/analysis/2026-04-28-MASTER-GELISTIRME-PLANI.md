# OOGMATIK - MASTER GELISTIRME PLANI

**Tarih:** 2026-04-28  
**Versiyon:** 1.0  
**Durum:** Aktif  
**Tahmini Sure:** 12 Hafta (3 Ay)

---

## ICINDEKILER

1. [Genel Bakis](#1-genel-bakis)
2. [Oncelik Matrisi](#2-oncelik-matrisi)
3. [Faz 1: Kritik Guvenlik](#3-faz-1-kritik-guvenlik-hafta-1-2)
4. [Faz 2: Teknik Borc Temizligi](#4-faz-2-teknik-borc-temizligi-hafta-3-4)
5. [Faz 3: Pazarlama Altyapisi](#5-faz-3-pazarlama-altyapisi-hafta-5-6)
6. [Faz 4: Ozellik Gelistirme](#6-faz-4-ozellik-gelistirme-hafta-7-9)
7. [Faz 5: Performans ve Test](#7-faz-5-performans-ve-test-hafta-10-11)
8. [Faz 6: Lansman Hazirligi](#8-faz-6-lansman-hazirligi-hafta-12)
9. [Basari Kriterleri](#9-basari-kriterleri)
10. [Risk Yonetimi](#10-risk-yonetimi)

---

## 1. GENEL BAKIS

### 1.1 Mevcut Durum Ozeti

| Alan | Skor | Hedef |
|------|------|-------|
| Guvenlik | 4/10 | 9/10 |
| Kod Kalitesi | 6/10 | 9/10 |
| Test Coverage | 1.4% | 60% |
| Pazarlama | 3/10 | 9/10 |
| Dokumantasyon | 7/10 | 9/10 |

### 1.2 Stratejik Hedefler

```
KISA VADELI (3 Ay)
- Guvenlik aciklari kapatildi
- Test coverage %60'a ulasti
- Landing page yayinda
- 3 beta musteri

ORTA VADELI (6 Ay)
- 1000 aktif kullanici
- 5 kurumsal musteri
- MEB pilotu basladi
- Mobil PWA hazir

UZUN VADELI (12 Ay)
- Turkiye'nin #1 ozel egitim AI platformu
- 10,000+ kullanici
- MEB resmi is ortagi
- Uluslararasi genisleme
```

---

## 2. ONCELIK MATRISI

### 2.1 Aciliyet-Onem Matrisi

```
                    ACIL                     ACIL DEGIL
         +------------------------+------------------------+
  ONEMLI |  FAZ 1: GUVENLIK       |  FAZ 4: OZELLIKLER     |
         |  - KVKK Uyumu          |  - Gamification        |
         |  - Prompt Injection    |  - TTS Destegi         |
         |  - CORS Guvenlik       |  - Coklu Dil           |
         +------------------------+------------------------+
  ONEMLI |  FAZ 2: TEKNIK BORC    |  FAZ 5: PERFORMANS     |
  DEGIL  |  - TypeScript any      |  - Bundle Optimize     |
         |  - Test Coverage       |  - Lazy Loading        |
         |  - Error Handling      |  - Cache Sistemi       |
         +------------------------+------------------------+
```

### 2.2 Bagimlilik Haritasi

```
FAZ 1 (Guvenlik)
    |
    v
FAZ 2 (Teknik Borc) <---> FAZ 3 (Pazarlama)
    |                          |
    v                          v
FAZ 4 (Ozellikler)       FAZ 6 (Lansman)
    |
    v
FAZ 5 (Performans)
```

---

## 3. FAZ 1: KRITIK GUVENLIK (Hafta 1-2)

### Sprint 1.1: KVKK ve Veri Guvenligi (Gun 1-5)

#### GOREV 1.1.1: TC Kimlik No Hashleme
**Oncelik:** KRITIK  
**Tahmini Sure:** 8 saat  
**Bagimlilik:** Yok  

**Yapilacaklar:**
```
[ ] 1. services/privacyService.ts olustur
    - hashTcNo() fonksiyonu
    - maskTcNo() fonksiyonu (son 4 hane goster)
    - validateTcNo() fonksiyonu (TC algoritma kontrolu)

[ ] 2. types/student-advanced.ts guncelle
    - tcNo: string -> tcNoHash: string
    - tcNoLastFour: string ekle
    - eski alan deprecated isaretle

[ ] 3. components/Student/modules/AdvancedStudentForm.tsx guncelle
    - TC girisi icin maskeleme
    - Hash'leme entegrasyonu
    - Mevcut veri migrasyonu uyarisi

[ ] 4. Migration script yaz
    - Mevcut TC'leri hashle
    - Backup al
    - Rollback plani

[ ] 5. Test yaz
    - hashTcNo unit test
    - Form integration test
    - Migration test
```

**Kabul Kriterleri:**
- Acik TC No codebase'de 0
- Hash algoritma SHA-256 + salt
- Migration basarili

---

#### GOREV 1.1.2: Console.log Temizligi
**Oncelik:** KRITIK  
**Tahmini Sure:** 6 saat  
**Bagimlilik:** Yok  

**Yapilacaklar:**
```
[ ] 1. utils/logger.ts olustur
    - info(), warn(), error(), audit() metodlari
    - Production'da console.log devre disi
    - Structured logging formati

[ ] 2. Tum console.log satirlarini tara
    - grep -r "console.log" . --include="*.ts" --include="*.tsx"
    - Kisisel veri icerenleri oncelikle isle

[ ] 3. 20+ dosyada console.log -> logger migration
    - api/feedback.ts (e-posta loglama)
    - api/generate.ts
    - store/*.ts dosyalari

[ ] 4. ESLint kurali ekle
    - no-console: error (production)
    - logger exception

[ ] 5. Production build kontrolu
    - console.log ciktisi 0 olmali
```

**Kabul Kriterleri:**
- Production'da console.log yok
- Logger sistemi aktif
- ESLint kurali eklendi

---

### Sprint 1.2: API Guvenligi (Gun 6-10)

#### GOREV 1.2.1: Prompt Injection Koruması
**Oncelik:** KRITIK  
**Tahmini Sure:** 10 saat  
**Bagimlilik:** Yok  

**Yapilacaklar:**
```
[ ] 1. utils/promptSecurity.ts olustur
    - INJECTION_PATTERNS dizisi
    - sanitizeForPromptInjection() fonksiyonu
    - logInjectionAttempt() fonksiyonu

[ ] 2. Injection pattern tanimlari
    - "ignore previous instructions"
    - "forget your rules"
    - "you are now"
    - "system prompt:"
    - "jailbreak"
    - 20+ pattern

[ ] 3. api/generate.ts entegrasyonu
    - Her prompt sanitize edilmeli
    - Threat detection loglama
    - Blocked response donusu

[ ] 4. Rate limiting entegrasyonu
    - 3 injection denemesi = 1 saat ban
    - IP + User ID bazli

[ ] 5. Test suite
    - 50+ injection pattern testi
    - False positive kontrolu
    - Performance testi (<5ms)
```

**Kabul Kriterleri:**
- Bilinen injection pattern'lar blocked
- Log sistemi aktif
- Performance <5ms

---

#### GOREV 1.2.2: CORS Guvenlik Yapilandirmasi
**Oncelik:** YUKSEK  
**Tahmini Sure:** 4 saat  
**Bagimlilik:** Yok  

**Yapilacaklar:**
```
[ ] 1. utils/cors.ts olustur
    - ALLOWED_ORIGINS listesi
    - setCorsHeaders() fonksiyonu
    - Origin validation

[ ] 2. ALLOWED_ORIGINS tanimlari
    - https://oogmatik.com
    - https://www.oogmatik.com
    - https://app.oogmatik.com
    - localhost:5173 (development)

[ ] 3. Tum API endpoint'lerde uygula
    - api/generate.ts
    - api/worksheets.ts
    - api/export-pdf.ts
    - api/feedback.ts

[ ] 4. Vercel.json yapilandirmasi
    - headers konfigurasyonu
    - Environment bazli ayarlar

[ ] 5. Test
    - Allowed origin testi
    - Blocked origin testi
    - Preflight request testi
```

**Kabul Kriterleri:**
- Wildcard (*) sifir
- Sadece tanimli originler kabul
- Vercel yapilandirmasi tamam

---

#### GOREV 1.2.3: Environment Variable Guvenligi
**Oncelik:** KRITIK  
**Tahmini Sure:** 3 saat  
**Bagimlilik:** Yok  

**Yapilacaklar:**
```
[ ] 1. .env dosyalarini tara
    - VITE_ prefix'li secret'lari bul
    - Liste olustur

[ ] 2. VITE_ -> server-only migration
    - VITE_GEMINI_API_KEY -> GEMINI_API_KEY
    - VITE_GOOGLE_API_KEY -> GOOGLE_API_KEY
    - VITE_FIREBASE_* -> FIREBASE_* (public kalabilir)

[ ] 3. api/*.ts dosyalarini guncelle
    - process.env.VITE_* -> process.env.*
    - Fallback'leri temizle

[ ] 4. Vercel Dashboard guncelle
    - Server-only variable'lar tanimla
    - Production/Preview/Development ayarla

[ ] 5. .env.example guncelle
    - Guvenli ornekler
    - Dokumantasyon

[ ] 6. Git history kontrolu
    - Gecmiste commit edilmis secret var mi?
    - Gerekirse git filter-branch
```

**Kabul Kriterleri:**
- VITE_ prefix'li secret sifir
- Vercel env var'lar server-only
- .env.example guncel

---

## 4. FAZ 2: TEKNIK BORC TEMIZLIGI (Hafta 3-4)

### Sprint 2.1: TypeScript Kalitesi (Gun 1-5)

#### GOREV 2.1.1: API Tip Guvenligi
**Oncelik:** YUKSEK  
**Tahmini Sure:** 12 saat  
**Bagimlilik:** Faz 1 tamamlanmali  

**Yapilacaklar:**
```
[ ] 1. @vercel/node devDependency ekle
    - pnpm add -D @vercel/node

[ ] 2. types/api.ts olustur
    - VercelRequest tipi
    - VercelResponse tipi
    - APIError tipi
    - APIResponse<T> generic tipi

[ ] 3. api/generate.ts refactor
    - any -> VercelRequest/Response
    - Request body validation
    - Response type safety

[ ] 4. api/worksheets.ts refactor
    - CRUD operasyonlari icin tipler
    - Worksheet tipi entegrasyonu

[ ] 5. api/export-pdf.ts refactor
    - PDF options tipi
    - Buffer/Stream tipi

[ ] 6. api/feedback.ts refactor
    - FeedbackRequest tipi
    - Email validation

[ ] 7. Diger API dosyalari
    - api/auth.ts (varsa)
    - api/students.ts (varsa)
```

**Kabul Kriterleri:**
- API'lerde any tipi sifir
- Tum request/response typed
- Build hatasiz

---

#### GOREV 2.1.2: Zustand Store Tip Guvenligi
**Oncelik:** YUKSEK  
**Tahmini Sure:** 8 saat  
**Bagimlilik:** Yok  

**Yapilacaklar:**
```
[ ] 1. store/useWorksheetStore.ts
    - set: any, get: any kaldir
    - StateCreator generic kullan
    - Tum action'lar typed

[ ] 2. store/useReadingStore.ts
    - Ayni refactor

[ ] 3. store/useCreativeStore.ts
    - Ayni refactor

[ ] 4. store/useStudentStore.ts
    - Ayni refactor

[ ] 5. store/useAuthStore.ts
    - Ayni refactor

[ ] 6. store/useSettingsStore.ts
    - Ayni refactor

[ ] 7. Store tipleri dokumante et
    - types/stores.ts olustur
    - Her store icin interface
```

**Kabul Kriterleri:**
- Store'larda any tipi sifir
- TypeScript inferrence calisiyor
- DevTools'ta tip gorunuyor

---

#### GOREV 2.1.3: ESLint Kural Guncelleme
**Oncelik:** ORTA  
**Tahmini Sure:** 4 saat  
**Bagimlilik:** 2.1.1 ve 2.1.2 tamamlanmali  

**Yapilacaklar:**
```
[ ] 1. .eslintrc.json guncelle
    - "@typescript-eslint/no-explicit-any": "error"
    - "@typescript-eslint/explicit-function-return-type": "warn"
    - "@typescript-eslint/strict-boolean-expressions": "warn"

[ ] 2. eslint-disable yorumlarini tara
    - @ts-ignore sayisini bul
    - eslint-disable-next-line sayisini bul

[ ] 3. Gerekli @ts-ignore'lari belgele
    - Neden gerekli?
    - Ne zaman kaldirilabilir?

[ ] 4. CI/CD entegrasyonu
    - Build oncesi eslint calistir
    - Hata varsa build fail

[ ] 5. Pre-commit hook ekle
    - husky kurulumu
    - lint-staged ayarlari
```

**Kabul Kriterleri:**
- ESLint kurallar aktif
- CI/CD entegre
- Pre-commit hook calisiyor

---

### Sprint 2.2: Error Handling ve Logging (Gun 6-10)

#### GOREV 2.2.1: Merkezi Error Handling
**Oncelik:** YUKSEK  
**Tahmini Sure:** 10 saat  
**Bagimlilik:** 1.1.2 (Logger sistemi)  

**Yapilacaklar:**
```
[ ] 1. utils/AppError.ts gelistir (mevcut varsa)
    - Error code enumlari
    - HTTP status mapping
    - User-friendly mesajlar (TR)
    - Stack trace handling

[ ] 2. Error kategorileri tanimla
    - ValidationError
    - AuthenticationError
    - AuthorizationError
    - NotFoundError
    - RateLimitError
    - AIGenerationError
    - NetworkError

[ ] 3. API error wrapper olustur
    - withErrorHandling() HOF
    - Tutarli error response formati
    - Logging entegrasyonu

[ ] 4. Frontend error boundary guncelle
    - components/ErrorBoundary.tsx
    - User-friendly hata sayfasi
    - Retry mekanizmasi
    - Error raporlama

[ ] 5. Error monitoring entegrasyonu
    - Sentry veya LogRocket setup
    - Source maps yukleme
    - Alert kuralları
```

**Kabul Kriterleri:**
- Tum API'ler error wrapper kullaniyor
- Error monitoring aktif
- User-friendly hata mesajlari

---

## 5. FAZ 3: PAZARLAMA ALTYAPISI (Hafta 5-6)

### Sprint 3.1: Landing Page (Gun 1-7)

#### GOREV 3.1.1: Landing Page Tasarim ve Gelistirme
**Oncelik:** KRITIK  
**Tahmini Sure:** 24 saat  
**Bagimlilik:** Yok  

**Yapilacaklar:**
```
[ ] 1. Sayfa yapisi planlama
    - Hero section
    - Problem/Cozum section
    - Ozellikler section
    - Nasil calisir section
    - Testimonials section
    - Pricing section
    - CTA section
    - Footer

[ ] 2. components/landing/ klasoru olustur
    - HeroSection.tsx
    - ProblemSolution.tsx
    - Features.tsx
    - HowItWorks.tsx
    - Testimonials.tsx
    - Pricing.tsx
    - CTASection.tsx
    - Footer.tsx

[ ] 3. app/landing/page.tsx (veya pages/index.tsx)
    - SEO metadata
    - OpenGraph tags
    - Responsive tasarim

[ ] 4. Animasyonlar ve mikro-etkiesilemler
    - Scroll animasyonlari (Framer Motion)
    - Hover efektleri
    - CTA buton animasyonlari

[ ] 5. Form entegrasyonu
    - Email capture formu
    - Waitlist kaydi
    - Firestore'a kaydet

[ ] 6. Performans optimizasyonu
    - Image lazy loading
    - Font preload
    - Critical CSS
```

**Kabul Kriterleri:**
- Lighthouse skoru 90+
- Mobile-first responsive
- CTA form calisiyor

---

#### GOREV 3.1.2: Pricing Page
**Oncelik:** YUKSEK  
**Tahmini Sure:** 8 saat  
**Bagimlilik:** 3.1.1  

**Yapilacaklar:**
```
[ ] 1. Fiyatlandirma modeli finalize
    - Free tier limitleri
    - Pro tier ozellikleri
    - Enterprise ozellikleri

[ ] 2. components/pricing/ olustur
    - PricingCard.tsx
    - PricingComparison.tsx
    - FAQ.tsx

[ ] 3. app/pricing/page.tsx
    - Toggle: Aylik/Yillik
    - Feature comparison table
    - FAQ section

[ ] 4. CTA entegrasyonu
    - Free: Hemen Basla -> Signup
    - Pro: Abone Ol -> Stripe Checkout
    - Enterprise: Iletisime Gec -> Form
```

**Kabul Kriterleri:**
- 3 plan acik sekilde gosteriliyor
- Aylik/yillik toggle calisiyor
- CTA'lar dogru yonlendiriyor

---

### Sprint 3.2: Content ve SEO (Gun 8-14)

#### GOREV 3.2.1: Blog Altyapisi
**Oncelik:** ORTA  
**Tahmini Sure:** 12 saat  
**Bagimlilik:** Yok  

**Yapilacaklar:**
```
[ ] 1. Blog yapilandirmasi
    - MDX veya CMS secimi
    - Contentlayer veya Sanity

[ ] 2. app/blog/ route'lari
    - /blog -> Liste
    - /blog/[slug] -> Detay
    - /blog/kategori/[category]

[ ] 3. Blog tasarimi
    - PostCard.tsx
    - PostDetail.tsx
    - AuthorCard.tsx
    - RelatedPosts.tsx

[ ] 4. Ilk 3 blog yazisi
    - "Disleksi Nedir?"
    - "AI ile Ozel Egitim"
    - "BEP Rehberi"

[ ] 5. SEO optimizasyonu
    - sitemap.xml
    - robots.txt
    - Structured data (Article schema)
```

**Kabul Kriterleri:**
- Blog sayfasi calisiyor
- 3 yazi yayinda
- SEO best practices

---

#### GOREV 3.2.2: Demo Video Sayfasi
**Oncelik:** YUKSEK  
**Tahmini Sure:** 6 saat  
**Bagimlilik:** Yok  

**Yapilacaklar:**
```
[ ] 1. Video embed komponenti
    - YouTube/Vimeo embed
    - Lazy loading
    - Thumbnail preview

[ ] 2. app/demo/page.tsx
    - Ana demo video
    - Feature videolari (modül bazli)
    - CTA section

[ ] 3. Video icerikleri planlama (yapim harici)
    - 3 dakikalik genel tanitim
    - Turkce Studyosu demo
    - Matematik demo
    - BEP modulu demo

[ ] 4. Video transcript
    - Accessibility icin
    - SEO icin
```

**Kabul Kriterleri:**
- Demo sayfasi hazir
- Video placeholder/embed calisiyor
- CTA aktif

---

## 6. FAZ 4: OZELLIK GELISTIRME (Hafta 7-9)

### Sprint 4.1: Ogrenci Ilerleme Sistemi (Gun 1-7)

#### GOREV 4.1.1: Progress Dashboard
**Oncelik:** YUKSEK  
**Tahmini Sure:** 20 saat  
**Bagimlilik:** Faz 1-2 tamamlanmali  

**Yapilacaklar:**
```
[ ] 1. Veri modeli tasarimi
    - types/progress.ts
    - ActivityCompletion interface
    - ProgressMetrics interface
    - LearningPath interface

[ ] 2. Firestore collection yapisi
    - /users/{uid}/progress/{studentId}
    - /users/{uid}/activities/{activityId}
    - Indexler

[ ] 3. components/progress/ olustur
    - ProgressDashboard.tsx
    - ActivityHistory.tsx
    - SkillRadar.tsx (radar chart)
    - WeeklyProgress.tsx
    - AchievementBadges.tsx

[ ] 4. Chart entegrasyonu
    - Recharts veya Chart.js
    - Haftalik aktivite grafigi
    - Beceri radar grafigi
    - Trend cizgisi

[ ] 5. API endpoint'ler
    - GET /api/progress/:studentId
    - POST /api/progress/log
    - GET /api/progress/report

[ ] 6. Export ozelligi
    - PDF rapor
    - CSV export
```

**Kabul Kriterleri:**
- Dashboard gorunur ve responsive
- Chart'lar dogru render ediliyor
- Veri dogru kaydediliyor

---

#### GOREV 4.1.2: Veli Raporu Sistemi
**Oncelik:** YUKSEK  
**Tahmini Sure:** 12 saat  
**Bagimlilik:** 4.1.1  

**Yapilacaklar:**
```
[ ] 1. Rapor sablonu tasarimi
    - Basit, anlasilir dil
    - Gorsel agirlikli
    - Emoji destegi (isteğe bagli)

[ ] 2. components/reports/ olustur
    - ParentReport.tsx
    - ReportCard.tsx
    - RecommendationSection.tsx

[ ] 3. PDF olusturma
    - react-pdf veya puppeteer
    - A4 format
    - Logo ve branding

[ ] 4. Email gonderim
    - Haftalik otomatik rapor
    - Manuel gonderim
    - Email template

[ ] 5. Veli erisim sistemi
    - Read-only link olusturma
    - QR code ile erisim
    - Suresiz paylasim linki
```

**Kabul Kriterleri:**
- PDF rapor olusturuluyor
- Email gonderimi calisiyor
- Veli linki aktif

---

### Sprint 4.2: Gamification Temelleri (Gun 8-14)

#### GOREV 4.2.1: Rozet ve Seviye Sistemi
**Oncelik:** ORTA  
**Tahmini Sure:** 16 saat  
**Bagimlilik:** 4.1.1  

**Yapilacaklar:**
```
[ ] 1. Gamification veri modeli
    - types/gamification.ts
    - Badge interface
    - Level interface
    - Achievement interface
    - LeaderboardEntry interface

[ ] 2. Rozet tanimlari
    - 20 farkli rozet
    - Kategoriler: Aktivite, Tutarlilik, Basari
    - SVG/PNG ikonlar

[ ] 3. Seviye sistemi
    - XP hesaplama formulu
    - 10 seviye
    - Seviye atlama bildirimi

[ ] 4. components/gamification/ olustur
    - BadgeDisplay.tsx
    - LevelProgress.tsx
    - AchievementPopup.tsx
    - BadgeCollection.tsx

[ ] 5. Kazanim tetikleyicileri
    - Aktivite tamamlama
    - Ust uste gun sayisi
    - Zorluk gecisi
    - Ozel basarilar
```

**Kabul Kriterleri:**
- 20 rozet tanimli
- Seviye sistemi calisiyor
- Popup bildirimleri aktif

---

## 7. FAZ 5: PERFORMANS VE TEST (Hafta 10-11)

### Sprint 5.1: Test Coverage (Gun 1-7)

#### GOREV 5.1.1: API Test Suite
**Oncelik:** YUKSEK  
**Tahmini Sure:** 16 saat  
**Bagimlilik:** Faz 1-2  

**Yapilacaklar:**
```
[ ] 1. Test altyapisi kurulumu
    - Vitest yapilandirmasi
    - Mock'lar icin msw
    - Test utilities

[ ] 2. api/generate.ts testleri
    - Basarili uretim
    - Gecersiz input
    - Rate limit
    - Auth check

[ ] 3. api/worksheets.ts testleri
    - CRUD operasyonlari
    - Yetkilendirme
    - Validation

[ ] 4. api/export-pdf.ts testleri
    - PDF olusturma
    - Buyuk dosya
    - Timeout handling

[ ] 5. Integration testler
    - Uretim -> Kayit -> Export akisi
    - Auth -> API akisi

[ ] 6. Coverage raporu
    - lcov raporu
    - CI/CD entegrasyonu
    - Minimum threshold: %80
```

**Kabul Kriterleri:**
- API test coverage %80+
- CI/CD'de testler calisiyor
- Coverage raporu gorunur

---

#### GOREV 5.1.2: Component Test Suite
**Oncelik:** ORTA  
**Tahmini Sure:** 12 saat  
**Bagimlilik:** Yok  

**Yapilacaklar:**
```
[ ] 1. Testing Library kurulumu
    - @testing-library/react
    - @testing-library/user-event

[ ] 2. Kritik komponent testleri
    - WorksheetGenerator.test.tsx
    - StudentForm.test.tsx
    - ActivityCard.test.tsx
    - ExportDialog.test.tsx

[ ] 3. Store testleri
    - useWorksheetStore.test.ts
    - useAuthStore.test.ts

[ ] 4. Hook testleri
    - useWorksheets.test.ts
    - useStudents.test.ts

[ ] 5. Accessibility testleri
    - jest-axe entegrasyonu
    - WCAG kontrolu
```

**Kabul Kriterleri:**
- Kritik komponentler test edildi
- A11y testleri geciyor
- Coverage %60+

---

### Sprint 5.2: Performans Optimizasyonu (Gun 8-14)

#### GOREV 5.2.1: Bundle Optimizasyonu
**Oncelik:** YUKSEK  
**Tahmini Sure:** 8 saat  
**Bagimlilik:** Yok  

**Yapilacaklar:**
```
[ ] 1. Bundle analizi
    - rollup-plugin-visualizer
    - Buyuk dependency'leri bul
    - Duplicate detection

[ ] 2. Code splitting
    - Route-based splitting
    - Component lazy loading
    - Vendor chunk ayrimi

[ ] 3. vite.config.ts optimizasyonu
    - manualChunks yapilandirmasi
    - terser minification
    - gzip/brotli compression

[ ] 4. Lazy loading uygulamasi
    - Admin components
    - Studio components
    - Modal/Dialog components

[ ] 5. Tree shaking kontrolu
    - Unused exports
    - Side effect marking
```

**Kabul Kriterleri:**
- Initial bundle <300KB (gzipped)
- LCP <2.5s
- FCP <1.8s

---

#### GOREV 5.2.2: Cache Stratejisi
**Oncelik:** ORTA  
**Tahmini Sure:** 8 saat  
**Bagimlilik:** Yok  

**Yapilacaklar:**
```
[ ] 1. Service Worker kurulumu
    - Workbox entegrasyonu
    - Cache stratejileri

[ ] 2. Cache stratejileri tanimla
    - Static assets: Cache First
    - API responses: Network First
    - Images: Stale While Revalidate

[ ] 3. IndexedDB cache gelistir
    - TTL ekleme (mevcut eksik)
    - Cache invalidation
    - Storage limit handling

[ ] 4. SWR cache yapilandirmasi
    - Revalidation stratejisi
    - Error retry
    - Optimistic updates

[ ] 5. CDN yapilandirmasi
    - Vercel Edge caching
    - Cache headers
```

**Kabul Kriterleri:**
- Offline basic functionality
- Cache TTL aktif
- Performance metrikleri iyilesti

---

## 8. FAZ 6: LANSMAN HAZIRLIGI (Hafta 12)

### Sprint 6.1: Final Kontroller (Gun 1-7)

#### GOREV 6.1.1: QA ve Bug Bash
**Oncelik:** KRITIK  
**Tahmini Sure:** 16 saat  
**Bagimlilik:** Tum fazlar  

**Yapilacaklar:**
```
[ ] 1. End-to-end test calistir
    - Playwright test suite
    - Tum kritik akislar
    - Cross-browser test

[ ] 2. Security audit
    - OWASP Top 10 check
    - Dependency vulnerability scan
    - Penetration test (basic)

[ ] 3. Performance audit
    - Lighthouse CI
    - Web Vitals check
    - Mobile performance

[ ] 4. Accessibility audit
    - axe DevTools
    - Screen reader test
    - Keyboard navigation

[ ] 5. Content review
    - Yazim hatalari
    - Link kontrolu
    - Image alt text

[ ] 6. Bug fix sprint
    - Kritik buglar onceligk
    - Regression test
```

**Kabul Kriterleri:**
- Kritik bug sifir
- Lighthouse 90+
- WCAG AA uyumlu

---

#### GOREV 6.1.2: Dokumantasyon Finalizasyonu
**Oncelik:** YUKSEK  
**Tahmini Sure:** 8 saat  
**Bagimlilik:** Yok  

**Yapilacaklar:**
```
[ ] 1. Kullanici kilavuzu
    - Baslangic rehberi
    - Modul kilavuzlari
    - SSS

[ ] 2. API dokumantasyonu
    - OpenAPI/Swagger spec
    - Endpoint aciklamalari
    - Ornek request/response

[ ] 3. Kurumsal dokumantasyon
    - Teknik mimari
    - Guvenlik politikasi
    - KVKK uyumluluk belgesi

[ ] 4. Video tutorials planlama
    - Tutorial listesi
    - Script'ler
```

**Kabul Kriterleri:**
- Kullanici kilavuzu hazir
- API docs yayinda
- Kurumsal docs tamam

---

## 9. BASARI KRITERLERI

### 9.1 Teknik Metrikler

| Metrik | Baslangic | Hafta 4 | Hafta 8 | Hafta 12 |
|--------|-----------|---------|---------|----------|
| Guvenlik Skoru | 4/10 | 8/10 | 9/10 | 9/10 |
| Test Coverage | 1.4% | 30% | 50% | 60% |
| TypeScript any | 100+ | 20 | 5 | 0 |
| Lighthouse | 65 | 80 | 85 | 90+ |
| Bundle Size | ~2MB | 800KB | 500KB | <300KB |

### 9.2 Is Metrikleri

| Metrik | Hafta 6 | Hafta 12 |
|--------|---------|----------|
| Landing Page | Yayinda | Optimize |
| Beta Kullanici | 10 | 50 |
| Waitlist | 100 | 500 |
| Bug Sayisi | <10 | 0 kritik |

---

## 10. RISK YONETIMI

### 10.1 Tanimli Riskler

| Risk | Olasilik | Etki | Azaltma Stratejisi |
|------|----------|------|---------------------|
| API maliyet artisi | Orta | Yuksek | Cache agresif, batch processing |
| Gelistirici kaybi | Dusuk | Yuksek | Dokumantasyon, pair programming |
| Teknik borc birikmesi | Yuksek | Orta | Sprint retrospective, refactor time |
| Guvenlik ihlali | Dusuk | Kritik | Regular audit, bounty program |
| Rakip girisi | Orta | Orta | Hizli hareket, differentiator focus |

### 10.2 Eskalasyon Matrisi

```
KRITIK (P0): 4 saat icinde cozum
- Guvenlik ihlali
- Production down
- Veri kaybi

YUKSEK (P1): 24 saat icinde cozum
- Major bug
- Performance degradation
- Payment issue

ORTA (P2): 1 hafta icinde cozum
- Minor bug
- UI/UX issue
- Documentation gap

DUSUK (P3): Sprint icerisinde
- Enhancement
- Nice-to-have
- Tech debt
```

---

## SONRAKI ADIMLAR

1. Bu plani ekip ile paylas
2. Sprint 1.1 icin JIRA/Linear ticket'lari olustur
3. Daily standup baslat
4. Haftalik ilerleme raporu hazirla
5. Retrospective toplantilari planla

---

**Dokuman Sahibi:** Gelistirme Ekibi  
**Son Guncelleme:** 2026-04-28  
**Sonraki Review:** 2026-05-05

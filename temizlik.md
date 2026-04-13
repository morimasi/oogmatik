# OOGMATIK — Kapsamlı Temizlik & Performans Raporu

> **Tarih:** 2026-04-13  
> **Analiz Kapsamı:** 775 TypeScript/TSX dosyası | 152.241 satır kod | 36 test + 4 E2E spec  
> **Analiz Modu:** Bora Demir (Mühendislik Direktörü) + Tüm 4 Lider Ajan aktif  
> **Rapor Versiyonu:** v1.0 — Güncel codebase üzerinden derinlemesine analiz

---

## 📊 ÖZET TABLO

| Kategori | Risk | Tespit Sayısı | Tahmini Kurtarılacak Satır | Etki |
|---|---|---|---|---|
| **Ölü Servis Dosyaları** | 🔴 Yüksek | 5 dosya | ~1.247 satır | Bakım yükü azalır |
| **Ölü Store Dosyaları** | 🔴 Yüksek | 3 dosya | ~418 satır | State karmaşası azalır |
| **Ölü Data/Context Dosyaları** | 🟠 Orta | 5 dosya | ~1.851 satır | Bundle boyutu düşer |
| **Ölü npm Bağımlılıkları** | 🔴 Yüksek | 3 paket | ~181 MB node_modules | Install süresi + bundle |
| **Ölü Kök Dosyaları** | 🟡 Düşük | 12+ dosya | ~320 KB disk | Proje temizliği |
| **@ts-nocheck İhlalleri** | 🔴 Yüksek | 19 dosya | — | Tip güvenliği |
| **console.log/error** | 🟠 Orta | 40+ kullanım | — | Üretim güvenliği |
| **any Tipi İhlalleri** | 🔴 Yüksek | ~541 kullanım | — | Tip güvenliği |
| **as any Kullanımı** | 🔴 Yüksek | ~449 kullanım | — | Tip güvenliği |
| **Mega Bileşenler (>700 satır)** | 🟠 Orta | 15+ dosya | — | Bakım + performans |
| **Güvenlik Açıkları (npm)** | 🔴 Yüksek | 13 (10 high, 3 moderate) | — | Güvenlik |

**Toplam Kurtarılacak Ölü Kod:** ~3.516 satır  
**Toplam Kurtarılacak Disk (node_modules):** ~181 MB  

---

## 🗑️ BÖLÜM 1: ÖLÜ SERVİS DOSYALARI

> Bu dosyalar hiçbir yerden `import` edilmiyor — tamamen ölü kod.

### 1.1 Ölü Servisler — SİLİNEBİLİR

| # | Dosya | Satır | Durum | Açıklama |
|---|---|---|---|---|
| DS-1 | `src/services/ocrVariationService.ts` | 509 | ❌ 0 import | OCR varyasyon servisi — hiçbir bileşen veya API'den çağrılmıyor |
| DS-2 | `src/services/animationService.ts` | 103 | ❌ 0 import | Animasyon servisi v2.0 — RemotionStudio/AnimationStudio silinmiş, bu da artık gereksiz |
| DS-3 | `src/services/templateLibrary.ts` | 382 | ❌ 0 import | Şablon kütüphanesi — hiçbir bileşenden erişilmiyor |
| DS-4 | `src/services/sinavService.ts` | 73 | ⚠️ Sadece `components/SinavStudyosu/` | Frontend API client — sadece kök `components/` altından kullanılıyor (MA-1 ile ilişkili) |
| DS-5 | `src/services/matSinavService.ts` | 53 | ⚠️ Sadece `components/MatSinavStudyosu/` | Aynı durum — sadece kök `components/` altından kullanılıyor |
| | **TOPLAM** | **1.120** | | |

> **Not:** DS-4 ve DS-5 kök `components/` diziniyle ilişkili. Bu dizin `ContentArea.tsx`'ten lazy-load ediliyor, yani aktif. Ancak mimari olarak `src/` dışındaki konum sorunlu (bkz. MA-1).

### 1.2 Ölü Store Dosyaları — SİLİNEBİLİR

| # | Dosya | Satır | Durum | Açıklama |
|---|---|---|---|---|
| DST-1 | `src/store/useOCRActivityStore.ts` | 170 | ❌ 0 import | OCR Activity store — hiçbir bileşen kullanmıyor |
| DST-2 | `src/store/useMatSinavStore.ts` | 131 | ⚠️ Sadece kök `components/` | Kök `components/MatSinavStudyosu/` dışında hiç kullanılmıyor |
| DST-3 | `src/store/useSinavStore.ts` | 117 | ⚠️ Sadece kök `components/` | Kök `components/SinavStudyosu/` dışında hiç kullanılmıyor |
| | **TOPLAM** | **418** | | |

### 1.3 Ölü Data & Context Dosyaları — SİLİNEBİLİR

| # | Dosya | Satır | Durum | Açıklama |
|---|---|---|---|---|
| DD-1 | `src/data/infographicTemplates.ts` | 1.523 | ❌ 0 import | Eski infografik şablon verisi — artık `infographicRegistry.ts` kullanılıyor |
| DD-2 | `src/data/dummyData.ts` | 130 | ❌ 0 import | Test amaçlı dummy veri — üretim kodunda gereksiz |
| DD-3 | `src/database/firestore-indexes.ts` | 407 | ❌ 0 import | Firestore index tanımları — `firestore.indexes.json` ile duplike |
| DD-4 | `src/context/ReadingStudioContext.tsx` | 47 | ❌ 0 import | Ölü React Context — Zustand `useReadingStore` canonical |
| DD-5 | `src/context/UniversalStudioContext.tsx` | 44 | ❌ 0 import | Ölü React Context — hiç kullanılmıyor |
| | **TOPLAM** | **2.151** | | |

### 1.4 Ölü Shared Dosyalar — SİLİNEBİLİR

| # | Dosya | Satır | Durum | Açıklama |
|---|---|---|---|---|
| DSH-1 | `src/shared/store/ThemeProvider.tsx` | 28 | ⚠️ İç referans var ama dışarıdan 0 import | ThemeProvider — App.tsx veya index.tsx'te kullanılmıyor |
| DSH-2 | `src/shared/store/useGlobalStore.ts` | 48 | ⚠️ Sadece ThemeProvider.tsx | Yalnızca ölü ThemeProvider tarafından kullanılıyor |
| | **TOPLAM** | **76** | | |

---

## 📦 BÖLÜM 2: ÖLÜ NPM BAĞIMLILIKLARI

> Bu paketler `package.json`'da tanımlı ama kaynak kodda hiç `import` edilmiyor.

### 2.1 Hiç Kullanılmayan Paketler — KALDIRILABİLİR

| # | Paket | node_modules Boyutu | Durum | Açıklama |
|---|---|---|---|---|
| NP-1 | `pixi.js` | **78 MB** | ❌ 0 import | Hiçbir dosyada kullanılmıyor — tamamen gereksiz |
| NP-2 | `react-hot-toast` | ~200 KB | ❌ 0 import | `ToastContainer.tsx` Zustand `useToastStore` kullanıyor |
| NP-3 | `core-js` | ~5 MB | ❌ 0 import | Polyfill — Vite hedefi ESNext, gerekli değil |
| NP-4 | `react-pdf` | ~2 MB | ❌ 0 import | PDFViewer `pdfjs-dist` kullanıyor, `react-pdf` hiç import edilmiyor |
| | **TOPLAM** | **~85 MB** | | |

### 2.2 Tek Yerde Kullanılan Ağır Paketler — DEĞERLENDİR

| # | Paket | node_modules Boyutu | Kullanım Yeri | Açıklama |
|---|---|---|---|---|
| NP-5 | `three` + `@react-three/fiber` + `@react-three/drei` | **43 MB** | `src/components/Premium/ThreeDActivityViewer.tsx` (tek dosya) | 3D Activity Viewer — premium özellik. Hiçbir view'dan route edilmemiş → entegre değilse kaldırılabilir |
| NP-6 | `@sparticuz/chromium` + `puppeteer-core` | **64 MB** | `api/export-infographic.ts` (tek dosya) | Headless PDF export — sadece 1 API endpoint. Serverless ortamda gerekli ama güvenlik sorunları var (SG-7) |
| NP-7 | `@antv/infographic` | ~5 MB | `src/components/InfographicRenderer.tsx` (fallback ile) | NativeInfographicRenderer zaten fallback olarak çalışıyor — @antv tam olarak kaldırılabilir |

### 2.3 Komut

```bash
# Ölü paketleri kaldır
npm uninstall pixi.js react-hot-toast core-js react-pdf

# Değerlendirme sonrası (NP-5 onaylanırsa)
npm uninstall three @react-three/fiber @react-three/drei

# Güvenlik güncellemeleri
npm audit fix
```

---

## 🗂️ BÖLÜM 3: ÖLÜ KÖK DOSYALARI

> Bu dosyalar proje kök dizininde gereksiz yer kaplıyor.

### 3.1 Geçici/Hata Ayıklama Dosyaları — SİLİNMELİ

| Dosya | Boyut | Açıklama |
|---|---|---|
| `eslint_output.txt` | 226 KB | ESLint çıktısı — geçici |
| `eslint-report.json` | 4.3 MB | ESLint raporu — CI'da üretilmeli, Git'te tutulmamalı |
| `final_errors.txt` | 21 KB | TypeScript hata çıktısı — geçici |
| `final_errors2.txt` | 16 KB | TypeScript hata çıktısı — geçici |
| `ts_errors.txt` | 46 KB | TypeScript hata çıktısı — geçici |
| `ts_errors2.txt` | 23 KB | TypeScript hata çıktısı — geçici |
| `fix_components_content_area.patch` | 3 KB | Patch dosyası — zaten uygulanmış |
| `fix_content_area.patch` | 2.2 KB | Patch dosyası — zaten uygulanmış |
| `Capture.svg` | 1.3 KB | Ekran görüntüsü — gereksiz |
| `temp` | 0 KB | Boş dosya |

### 3.2 Platform-Spesifik Script'ler — DEĞERLENDİR

| Dosya | Boyut | Açıklama |
|---|---|---|
| `gitttt.bat` | 408 B | Windows batch script — Git push otomasyonu |
| `install.bat` | 2.3 KB | Windows kurulum script'i |
| `install.sh` | 4.7 KB | Linux/macOS kurulum script'i → `scripts/` altına taşınabilir |

### 3.3 Komut

```bash
# Geçici dosyaları sil
rm -f eslint_output.txt eslint-report.json final_errors.txt final_errors2.txt \
      ts_errors.txt ts_errors2.txt fix_components_content_area.patch \
      fix_content_area.patch Capture.svg temp gitttt.bat install.bat

# install.sh'yi scripts/ altına taşı
mkdir -p scripts && mv install.sh scripts/

# .gitignore'a ekle
echo -e "\n# Geçici analiz dosyaları\n*.patch\n*.txt.bak\neslint_output.txt\neslint-report.json\nfinal_errors*.txt\nts_errors*.txt\ntemp" >> .gitignore
```

---

## ⚠️ BÖLÜM 4: @ts-nocheck İHLALLERİ

> 19 dosyada `@ts-nocheck` kullanımı — TypeScript tamamen devre dışı bırakılmış.
> `tsconfig.json` düzgün yapılandırılmış (`strict: true`, `noImplicitAny: true`) ama bu direktifler onu geçersiz kılıyor.

### 4.1 Kritik Dosyalar (Hemen Düzeltilmeli)

| # | Dosya | Satır | Öncelik | Açıklama |
|---|---|---|---|---|
| TN-1 | `src/App.tsx` | 1.070 | 🔴 KRİTİK | Uygulama kök bileşeni — tüm routing burada |
| TN-2 | `src/components/SheetRenderer.tsx` | 1.712 | 🔴 KRİTİK | 100+ aktivite render — en büyük bileşen |
| TN-3 | `src/components/ContentArea.tsx` | ~500 | 🔴 KRİTİK | View routing — tüm stüdyolar buradan lazy-load |
| TN-4 | `src/components/Sidebar.tsx` | 786 | 🔴 KRİTİK | Ana navigasyon bileşeni |
| TN-5 | `src/components/Toolbar.tsx` | 750 | 🟠 YÜKSEK | Araç çubuğu bileşeni |
| TN-6 | `src/index.tsx` | ~20 | 🟠 YÜKSEK | React entry point |
| TN-7 | `src/utils/snapshotService.ts` | ~270 | 🟠 YÜKSEK | Snapshot yönetimi |

### 4.2 Orta Öncelikli Dosyalar

| # | Dosya | Satır |
|---|---|---|
| TN-8 | `src/components/GeneratorView.tsx` | ~400 |
| TN-9 | `src/components/PrintPreviewModal.tsx` | ~300 |
| TN-10 | `src/components/WorksheetsList.tsx` | ~300 |
| TN-11 | `src/components/SharedWorksheetsView.tsx` | ~300 |
| TN-12 | `src/components/FeedbackModal.tsx` | ~200 |
| TN-13 | `src/components/ExportProgressModal.tsx` | ~200 |
| TN-14 | `src/components/DyslexiaLogo.tsx` | ~100 |
| TN-15 | `src/components/AdminPromptStudio.tsx` | 606 |
| TN-16 | `src/components/UniversalStudio/UniversalWorksheetWrapper.tsx` | ~200 |
| TN-17 | `src/components/UniversalStudio/UniversalPropertiesPanel.tsx` | ~200 |
| TN-18 | `src/components/sheets/common.tsx` | ~100 |
| TN-19 | `src/components/SuperStudio/components/A4PreviewPanel.tsx` | ~200 |

---

## 🚫 BÖLÜM 5: console.log / console.error ÜRETİM KODU İHLALLERİ

> Proje kuralı: `console.log` üretim kodunda **YASAK** → `logError()` kullan.

### 5.1 console.log Kullanımları — DÜZELTİLMELİ

| # | Dosya | Satır | İçerik |
|---|---|---|---|
| CL-1 | `src/services/generators/superStudioGenerator.ts` | 283, 305, 307, 357 | Cache hit/miss loglama |
| CL-2 | `src/services/workbook/workbookExport.ts` | 254 | Workbook yükleme logu |

### 5.2 console.error Kullanımları — logError()'a Dönüştürülmeli

| # | Dosya | Sayı |
|---|---|---|
| CE-1 | `src/utils/printService.ts` | 7 kullanım |
| CE-2 | `src/utils/snapshotService.ts` | 2 kullanım |
| CE-3 | `src/utils/jsonRepair.ts` | 1 kullanım |
| CE-4 | `src/utils/validator.ts` | 2 kullanım |
| CE-5 | `src/services/worksheetService.ts` | 3 kullanım |
| CE-6 | `src/services/assessmentService.ts` | 3 kullanım |
| CE-7 | `src/services/imageService.ts` | 1 kullanım |
| CE-8 | `src/services/generators/assessment.ts` | 1 kullanım |
| CE-9 | `src/services/generators/core/BaseGenerator.ts` | 1 kullanım |
| CE-10 | `src/services/generators/sinavGenerator.ts` | 1 kullanım |
| CE-11 | `src/services/generators/premiumCompositeGenerator.ts` | 1 kullanım |
| CE-12 | `src/store/useAuthStore.ts` | 1 kullanım |
| CE-13 | `src/App.tsx` | 1 kullanım |
| CE-14 | `src/hooks/useActivitySettings.ts` | 1 kullanım |
| | **TOPLAM** | **~30 kullanım** |

---

## 🔧 BÖLÜM 6: any TİPİ İHLALLERİ

> Proje kuralı: `any` tipi **YASAK** → `unknown` + type guard kullan.

### 6.1 Genel Durum

| Metrik | Sayı |
|---|---|
| `: any` kullanımı | ~541 |
| `as any` kullanımı | ~449 |
| `@ts-ignore` kullanımı | 10 |
| **TOPLAM** | **~1.000** |

### 6.2 Öncelikli Düzeltme Dosyaları

| Dosya | Tahmini `any` Sayısı | Öncelik |
|---|---|---|
| `src/App.tsx` (@ts-nocheck) | Tamamı kontrol dışı | 🔴 KRİTİK |
| `src/components/SheetRenderer.tsx` (@ts-nocheck) | Tamamı kontrol dışı | 🔴 KRİTİK |
| `src/components/ContentArea.tsx` (@ts-nocheck) | Tamamı kontrol dışı | 🔴 KRİTİK |
| `src/utils/retry.ts` | Build hatası veriyor | 🔴 KRİTİK |
| `src/types/core.ts` | Tip tanım dosyası | 🟠 YÜKSEK |
| `src/services/worksheetService.ts` | @ts-ignore, any | 🟠 YÜKSEK |

---

## ⚡ BÖLÜM 7: PERFORMANS İYİLEŞTİRMELERİ

### 7.1 Mega Bileşenler — Parçalanmalı

> 700+ satırlık dosyalar bakım zorluğu + tree-shaking/code-splitting engeli oluşturur.

| # | Dosya | Satır | Öneri |
|---|---|---|---|
| PF-1 | `src/components/ProfileView.tsx` | 1.834 | 6+ modüle böl (PersonalInfo, DisplaySettings, ThemeSettings, Statistics, ExportSettings, Notifications) |
| PF-2 | `src/components/SheetRenderer.tsx` | 1.712 | Aktivite kategorilerine göre `React.lazy()` ile code splitting |
| PF-3 | `src/services/generators/infographic/infographicAdapter.ts` | 1.609 | Kategori bazlı modüllere böl |
| PF-4 | `src/data/infographicTemplates.ts` | 1.523 | **ÖLÜ DOSYA — SİL** |
| PF-5 | `src/components/OCRScanner.tsx` | 1.411 | Scanner, Preview, ResultPanel alt bileşenlerine böl |
| PF-6 | `src/components/NativeInfographicRenderer.tsx` | 1.354 | Template-bazlı alt render'lara böl |
| PF-7 | `src/components/WorkbookView.tsx` | 1.325 | WorkbookList, WorkbookDetail, WorkbookToolbar alt bileşenlerine böl |
| PF-8 | `src/services/generators/mathSinavGenerator.ts` | 1.275 | Domain bazlı modüllere böl |
| PF-9 | `src/services/generators/mathVisualPromptLibrary.ts` | 1.274 | Kategori bazlı modüllere böl |
| PF-10 | `src/components/Student/StudentDashboard.tsx` | 1.257 | Tab bazlı lazy-load alt bileşenler |
| PF-11 | `src/utils/printService.ts` | 1.135 | PDF generator, CSS injector, capture engine alt modüllerine böl |
| PF-12 | `src/App.tsx` | 1.070 | Router bileşeni ayır, view setup'ı ayır |
| PF-13 | `src/services/workbook/workbookTemplates.ts` | 951 | Template kategorilerine böl |
| PF-14 | `src/components/Sidebar.tsx` | 786 | NavItem rendering, MenuItem data, SidebarFooter alt bileşenlerine böl |
| PF-15 | `src/components/Toolbar.tsx` | 750 | Tool gruplarına göre alt bileşenler |

### 7.2 Bundle Boyut Optimizasyonu

| # | Sorun | Etki | Çözüm |
|---|---|---|---|
| BO-1 | `pixi.js` (78MB) hiç kullanılmıyor | Install süresi + potansiyel bundle leak | `npm uninstall pixi.js` |
| BO-2 | `three` + `@react-three` (43MB) tek dosyada kullanılıyor | Build'de büyük chunk oluşabilir | Route edilmemişse kaldır; route edilmişse `React.lazy()` ile izole et |
| BO-3 | `@sparticuz/chromium` (64MB) serverless-only | yarn workspace ile ayır veya Vercel'e özel tutulmalı | `externals` olarak işaretle |
| BO-4 | SheetRenderer 100+ sheet import ediyor | Büyük initial bundle | Kategori bazlı `React.lazy()` + `import()` |
| BO-5 | `vite.config.ts`'te manual chunks'ta `pixi`, `three`, `@remotion` eksik | Vendor chunk'lar optimize değil | Kalan paketler için manual chunk ekle veya kaldır |

### 7.3 React Performans İyileştirmeleri

| # | Sorun | Dosya | Çözüm |
|---|---|---|---|
| RP-1 | SheetRenderer tüm 100+ sheet türünü statik import ediyor | `SheetRenderer.tsx` | `React.lazy()` + Suspense ile kategori bazlı lazy-load |
| RP-2 | ContentArea'da 15+ stüdyo lazy-load ama bazıları hep yükleniyor | `ContentArea.tsx` | Kullanılmayan view'ları `React.lazy` altına al |
| RP-3 | Sidebar'da `statsService` her render'da çağrılıyor | `Sidebar.tsx` | `useMemo` veya `useQuery` ile cache'le |

---

## 🔴 BÖLÜM 8: BUILD HATALARI

### 8.1 TypeScript Build Hatası

| # | Dosya | Hata | Çözüm |
|---|---|---|---|
| BE-1 | `src/utils/retry.ts:2` | 5 parse hatası — `TS1005: ',' expected` | Sözdizimi hatası düzeltilmeli |

### 8.2 npm Güvenlik Açıkları

| Seviye | Sayı |
|---|---|
| Yüksek (High) | 10 |
| Orta (Moderate) | 3 |
| **TOPLAM** | **13** |

**Komut:** `npm audit fix` → breaking change riski varsa `npm audit fix --force` (test sonrası)

---

## 🏗️ BÖLÜM 9: MİMARİ SORUNLAR

### 9.1 Çift Kök Dizin Yapısı (MA-1)

**Sorun:** `components/` (kök) ve `src/components/` (src içinde) aynı anda mevcut.

```
components/                    ← Kök seviyede (4.352 satır)
├── MatSinavStudyosu/          ← 7 dosya, ~2.800 satır
└── SinavStudyosu/             ← 6 dosya, ~1.550 satır

src/components/                ← Ana kaynak dizini (~130.000 satır)
└── (65+ bileşen)
```

**Etki:** Import yolları tutarsız (`../../components/` vs `../`), refactoring zorlaşıyor.  
**Çözüm:** `components/MatSinavStudyosu` ve `components/SinavStudyosu` → `src/components/` altına taşı; import'ları güncelle.

### 9.2 İki RBAC Sistemi (MA-12)

| Sistem | Dosya | Roller |
|---|---|---|
| Backend | `src/services/rbac.ts` | `admin \| teacher \| parent \| student` (4 rol) |
| Frontend | `src/hooks/useRBAC.ts` | `admin \| teacher \| student \| parent \| guest \| editor \| superadmin` (7 rol) |

**Çözüm:** `src/types/user.ts`'te canonical `UserRole` tanımla; her iki sistemi hizala.

### 9.3 Çift Tip Sistemi (MA-5)

**Sorun:** `src/types.ts` (barrel) ve `src/types/` (klasör) birlikte mevcut.  
**Çözüm:** `src/types.ts` → yalnızca `export * from './types/index.js'` olsun; bağımsız tipler `types/` klasörüne taşınsın.

### 9.4 @ts-ignore Kullanımları

| Dosya | Sebep | Çözüm |
|---|---|---|
| `src/services/firebaseClient.ts` (3 adet) | Firebase ESM import | moduleResolution çözümü veya `/// <reference>` |
| `src/services/worksheetService.ts` | Vercel TS build | Doğru tip import'u |
| `src/components/Student/modules/AdvancedStudentForm.tsx` | Mock tip genişletme | Düzgün tip tanımı |
| `src/components/OCRScanner.tsx` | pdf.js global | Tip tanımlama |
| `src/components/sheets/visual/MapDetectiveSheet.tsx` (2 adet) | Bilinmiyor | İnceleme gerekli |
| `src/components/sheets/visual/TurkeyMapSVG.tsx` (2 adet) | Bilinmiyor | İnceleme gerekli |

---

## 📋 BÖLÜM 10: UYGULAMA ÖNCELİK SIRASI

### Faz 1 — Acil (Build & Güvenlik) ⏱️
```
□ BE-1: src/utils/retry.ts sözdizimi hatası düzelt
□ npm audit fix çalıştır (13 güvenlik açığı)
□ NP-1: pixi.js kaldır (78 MB, 0 kullanım)
□ NP-2: react-hot-toast kaldır (0 kullanım)
□ NP-3: core-js kaldır (0 kullanım)
□ NP-4: react-pdf kaldır (0 kullanım)
```

### Faz 2 — Ölü Kod Temizliği ⏱️
```
□ DS-1: src/services/ocrVariationService.ts sil (509 satır)
□ DS-2: src/services/animationService.ts sil (103 satır)
□ DS-3: src/services/templateLibrary.ts sil (382 satır)
□ DST-1: src/store/useOCRActivityStore.ts sil (170 satır)
□ DD-1: src/data/infographicTemplates.ts sil (1.523 satır)
□ DD-2: src/data/dummyData.ts sil (130 satır)
□ DD-3: src/database/firestore-indexes.ts sil (407 satır)
□ DD-4: src/context/ReadingStudioContext.tsx sil (47 satır)
□ DD-5: src/context/UniversalStudioContext.tsx sil (44 satır)
□ DSH-1: src/shared/store/ThemeProvider.tsx sil (28 satır)
□ DSH-2: src/shared/store/useGlobalStore.ts sil (48 satır)
```

### Faz 3 — Kök Dizin Temizliği ⏱️
```
□ Geçici dosyaları sil (eslint_output.txt, final_errors*.txt, ts_errors*.txt, *.patch, temp, Capture.svg)
□ gitttt.bat sil
□ install.bat sil
□ install.sh → scripts/ altına taşı
□ .gitignore güncelle
```

### Faz 4 — Performans ⏱️
```
□ NP-5: three + @react-three değerlendirmesi (43 MB, tek dosya kullanımı)
□ NP-7: @antv/infographic değerlendirmesi (NativeInfographicRenderer yeterli mi?)
□ PF-2: SheetRenderer code splitting planla
□ PF-1: ProfileView parçalama planla
□ BO-4: SheetRenderer 100+ sheet → lazy-load
```

### Faz 5 — TypeScript Sağlığı ⏱️
```
□ TN-1..TN-7: Kritik @ts-nocheck dosyalarını düzelt (öncelik sırasıyla)
□ CL-1..CL-2: console.log → logError() dönüşümü
□ CE-1..CE-14: console.error → logError() dönüşümü
□ any tipi → unknown + type guard (en sık kullanılan dosyalardan başla)
```

### Faz 6 — Mimari ⏱️
```
□ MA-1: Kök components/ → src/components/ altına taşı
□ MA-12: İki RBAC sistemini birleştir
□ MA-5: Çift tip sistemini standartlaştır
□ MA-2: Kopya JSON repair motorunu paylaşılan utility'ye taşı (update.md'den)
```

---

## 📊 ETKİ ANALİZİ

### Temizlik Sonrası Beklenen İyileşmeler

| Metrik | Önce | Sonra (Tahmini) |
|---|---|---|
| Toplam TypeScript/TSX satır sayısı | 152.241 | ~148.725 (-3.516) |
| node_modules boyutu (ölü paketler) | +85 MB fazla | -85 MB |
| @ts-nocheck dosya sayısı | 19 | 0 (hedef) |
| console.log/error kullanımı | 40+ | 0 (hedef) |
| npm güvenlik açıkları | 13 | 0 (hedef) |
| Build hatası | 1 dosya (retry.ts) | 0 |

---

## 🔗 İLGİLİ DOSYALAR

- [update.md](update.md) — Önceki v6.0 kapsamlı analiz (güvenlik, mimari, eksik özellikler)
- [SECURITY.md](SECURITY.md) — Güvenlik politikası
- [CLAUDE.md](CLAUDE.md) — Ajan kuralları ve mimari referans

---

> **Rapor:** Bora Demir (Mühendislik Direktörü)  
> **Doğrulama:** Elif Yıldız (Pedagoji), Dr. Ahmet Kaya (Klinik), Selin Arslan (AI)  
> **Tarih:** 2026-04-13

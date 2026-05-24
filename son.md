# 🔬 BDMIND — Kapsamlı Hata, Eksik ve Fazlalık Temizlik Planı

> **Tarih:** 2026-05-24  
> **Analiz Kapsamı:** Tüm proje dosyaları — 1079+ kaynak dosya  
> **İlke:** Hiçbir mevcut işlev ve modül bozulmadan temizlik yapılacak.

---

## 📋 İÇİNDEKİLER

1. [KRİTİK HATALAR (Acil)](#1-kritik-hatalar-acil)
2. [BOŞ / STUB DOSYALAR](#2-boş--stub-dosyalar)
3. [ROOT DİZİN TEMİZLİĞİ](#3-root-dizin-temizliği)
4. [DUPLİKASYON / ÇAKIŞMA](#4-duplikasyon--çakışma)
5. [DEPRECATED / RE-EXPORT PROXY'LER](#5-deprecated--re-export-proxyler)
6. [TypeScript Strict Mode İhlalleri](#6-typescript-strict-mode-ihlalleri)
7. [MİMARİ İYİLEŞTİRMELER](#7-mimari-iyileştirmeler)
8. [GÜVENLİK & KVKK](#8-güvenlik--kvkk)
9. [PERFORMANS](#9-performans)
10. [TEST EKSİKLERİ](#10-test-eksikleri)
11. [BAĞIMLILIK (Dependency) TEMİZLİĞİ](#11-bağımlılık-dependency-temizliği)
12. [UYGULAMA PLANI](#12-uygulama-planı)

---

## 1. KRİTİK HATALAR (Acil)

### 1.1 `@ts-nocheck` Kullanımı — `App.tsx`
| Dosya | Satır | Sorun |
|-------|-------|-------|
| `src/App.tsx` | 1 | `// @ts-nocheck` ile **tüm type-checking devre dışı** |

- **Risk:** 1393 satırlık ana bileşende tüm tip hataları gizleniyor.
- **Çözüm:** `@ts-nocheck` kaldırılacak, çıkan hatalar tek tek düzeltilecek.
- **Öncelik:** 🔴 Kritik

### 1.2 `vite` PATH'te Bulunamıyor
| Komut | Sorun |
|-------|-------|
| `npm run build` | `'vite' is not recognized as an internal or external command` |

- **Çözüm:** `node_modules/.bin` PATH'e eklenmeli veya `npx vite build` kullanılmalı. `package.json` build script'i doğru ama `npm install` yapılmamış olabilir.
- **Öncelik:** 🔴 Kritik

### 1.3 `rbac.ts` İçindeki `any` Kullanımı & TODO Placeholder
| Dosya | Satır | Sorun |
|-------|-------|-------|
| `src/services/rbac.ts` | 119 | `catch (error: any)` — proje kuralı ihlali |
| `src/services/rbac.ts` | 101-118 | `getUserRole()` fonksiyonu TODO yorum ile placeholder — her zaman `student` döndürüyor |

- **Risk:** RBAC sistemi gerçek Firestore verisi yerine sabit döndürüyor.
- **Çözüm:** Firestore entegrasyonu tamamlanacak veya rbacService.ts'ye yönlendirilecek.
- **Öncelik:** 🔴 Kritik

### 1.4 `rbacService.ts` `any` Kullanımı
| Dosya | Satır | Sorun |
|-------|-------|-------|
| `src/services/rbacService.ts` | 50 | `studentModule!.actions.push(act as any)` |

- **Çözüm:** `act as PermissionAction` olarak düzeltilecek.
- **Öncelik:** 🟡 Orta

---

## 2. BOŞ / STUB DOSYALAR

**10 adet tamamen boş bileşen dosyası** tespit edildi — sadece `export {};` içeriyorlar:

| # | Dosya | Boyut | Sorun |
|---|-------|-------|-------|
| 1 | `src/components/AdminActivityApproval.tsx` | 78B | Boş stub — gerçek modül `AdminDashboard/` altında |
| 2 | `src/components/AdminActivityManager.tsx` | 78B | Boş stub — gerçek modül `AdminDashboard/` altında |
| 3 | `src/components/AdminAnalytics.tsx` | 78B | Boş stub — gerçek modül `AdminDashboard/` altında |
| 4 | `src/components/AdminDraftReview.tsx` | 78B | Boş stub — gerçek modül `AdminDashboard/` altında |
| 5 | `src/components/AdminFeedback.tsx` | 78B | Boş stub — gerçek modül `AdminDashboard/` altında |
| 6 | `src/components/AdminStaticContent.tsx` | 78B | Boş stub — gerçek modül `AdminDashboard/` altında |
| 7 | `src/components/AdminUserManagement.tsx` | 78B | Boş stub — gerçek modül `AdminDashboard/` altında |
| 8 | `src/components/AdminDashboard.tsx` | 108B | Boş stub — gerçek modül `AdminDashboard/index` |
| 9 | `src/components/AdminPromptStudio.tsx` | 159B | Boş stub — gerçek modül `AdminDashboard/` altında |
| 10 | `src/components/PromptSimulator.tsx` | 78B | Boş stub — gerçek modül `AdminDashboard/` altında |

### Çözüm
1. Bu dosyaları import eden yerler tespit edilecek
2. Import'lar `AdminDashboard/` altındaki gerçek modüllere yönlendirilecek
3. Boş stub dosyalar silinecek

### `agentService.ts` — Placeholder Servis
| Dosya | Boyut | Sorun |
|-------|-------|-------|
| `src/services/agentService.ts` | 898B | `executeTask()` hiçbir şey yapmıyor, sadece `completed` döndürüyor |

- **Karar:** Kullanıldığı yerler kontrol edilecek. Gerçekten kullanılmıyorsa silinecek, kullanılıyorsa implementasyonu tamamlanacak.

---

## 3. ROOT DİZİN TEMİZLİĞİ

Root dizinde **proje işleyişi için gereksiz olan 65+ dosya** tespit edildi:

### 3.1 Eski Rapor / Analiz MD Dosyaları (Silinebilir)
| # | Dosya | Açıklama |
|---|-------|----------|
| 1 | `2026-05-07-admin-phase1-4-completion.md` | Eski sprint raporu |
| 2 | `ANALYSIS_SUMMARY.md` | Eski analiz özeti |
| 3 | `COMPREHENSIVE_ANALYSIS_REPORT.md` | Eski kapsamlı rapor |
| 4 | `CRITICAL_FIXES_PLAN.md` | Eski düzeltme planı |
| 5 | `FAZE1_OZET_TURKCE.md` | Faz 1 özeti |
| 6 | `FAZE3_ARCHITECTURE_DESIGN.md` | Faz 3 mimari tasarımı |
| 7 | `HYBRID_EXECUTION_PLAN.md` | Hibrit plan |
| 8 | `HYBRID_FINAL_SUMMARY.md` | Hibrit özet |
| 9 | `IMPLEMENTATION_SUMMARY.md` | Eski uygulama özeti |
| 10 | `KELIME_CUMLE_FIX_REPORT.md` | Fix raporu |
| 11 | `KELIME_CUMLE_QUICK_GUIDE.md` | Hızlı kılavuz |
| 12 | `OTONOM.MD` | Otonom motor notu |
| 13 | `QUICK_START_FIXES.md` | Eski hızlı düzeltme |
| 14 | `QUICK_START_PHASE2.md` | Faz 2 hızlı başlangıç |
| 15 | `README_PHASE1_COMPLETE.md` | Faz 1 tamamlama notu |
| 16 | `STUDENT.md` | Öğrenci modülü notu |
| 17 | `ULTRA.MD` | Ultra not |
| 18 | `admin.md` | Admin modül notu |
| 19 | `antigravity_report.md` | Sprint 5 raporu |
| 20 | `ekle.md` | Ekleme notları |
| 21 | `hatalar.md` | Hata listesi |
| 22 | `iyi.md` | İyileştirmeler |
| 23 | `klon.md` | Klonlama notu |
| 24 | `mesaj.md` | Mesaj notu |
| 25 | `ogrenci.md` | Öğrenci notu |
| 26 | `otocli.md` | Oto CLI notu |
| 27 | `otocli2.md` | Oto CLI notu 2 |
| 28 | `sari2.md` | Sarı kitap notu |
| 29 | `temizlik.md` | Eski temizlik notu |
| 30 | `v5.md` | Versiyon 5 notu |

### 3.2 Hata Log / Derleme Çıktı TXT Dosyaları (Silinebilir)
| # | Dosya | Boyut |
|---|-------|-------|
| 1 | `build-output.txt` | 894B |
| 2 | `build_log.txt` | 10.7KB |
| 3 | `compile_check.txt` | 148KB |
| 4 | `enum_types.txt` | 5.2KB |
| 5 | `eslint_output.txt` | 228KB |
| 6 | `eslint-report.json` | 4.3MB |
| 7 | `final_errors.txt` | 20KB |
| 8 | `final_errors2.txt` | 15KB |
| 9 | `pdf_extracted.txt` | 33KB |
| 10 | `registry_types.txt` | 1.5KB |
| 11 | `registry_types_clean.txt` | 1.9KB |
| 12 | `sari_extracted.txt` | 134KB |
| 13 | `temp_errors.txt` | 102KB |
| 14 | `ts_errors.txt` | 46KB |
| 15 | `ts_errors2.txt` | 23KB |
| 16 | `tsc-errors.txt` | 112KB |
| 17 | `tsc-errors2.txt` | 70KB |
| 18 | `tsc-errors3.txt` | 44KB |
| 19 | `tsc_errors.txt` | 118KB |

### 3.3 Geçici / Yardımcı Scriptler (Silinebilir)
| # | Dosya | Açıklama |
|---|-------|----------|
| 1 | `extractBlockRenderer.cjs` | Tek seferlik blok çıkarıcı |
| 2 | `extract_pdfs.js` | PDF çıkarıcı |
| 3 | `extract_pdfs.py` | Python PDF çıkarıcı (Python dahi stack'te yok) |
| 4 | `extract_sari.mjs` | Sarı kitap çıkarıcı |
| 5 | `tmp_read_pdf.mjs` | Geçici PDF okuyucu |
| 6 | `gitttt.bat` | Git batch script |
| 7 | `install.bat` | Kurulum batch |
| 8 | `install.sh` | Kurulum shell (Windows?) |
| 9 | `Capture.svg` | Geçici ekran görüntüsü |
| 10 | `gcloud` | Boş dosya |
| 11 | `temp` | Boş dosya |

### 3.4 Patch / Blueprint Dosyaları (Silinebilir)
| # | Dosya |
|---|-------|
| 1 | `fix_components_content_area.patch` |
| 2 | `fix_content_area.patch` |
| 3 | `harf-baglama-blueprint.json` |
| 4 | `metadata.json` |

### Çözüm
- Tüm bu dosyalar `docs/archive/` dizinine taşınacak veya doğrudan silinecek
- `.gitignore`'a `*.txt`, `*.patch`, temp dosya pattern'leri eklenecek
- Root'ta sadece proje yapılandırma dosyaları kalacak: `package.json`, `tsconfig.json`, `vite.config.ts`, `vercel.json`, `firebase.json`, `README.md`, `SECURITY.md`, `GEMINI.md`, `CLAUDE.md`, `AGENTS.md`

---

## 4. DUPLİKASYON / ÇAKIŞMA

### 4.1 RBAC — İki Ayrı Sistem
| Dosya | İçerik |
|-------|--------|
| `src/services/rbac.ts` (214 satır) | Basit rol-izin eşleştirmesi, TODO placeholder'lar, `rbacService` objesi olarak export |
| `src/services/rbacService.ts` (203 satır) | Firestore-bağlı gelişmiş RBAC, migration, `rbacService` sınıf instance olarak export |

- **Çakışma:** Her iki dosya da `rbacService` adıyla export ediyor → import edilen yere göre farklı davranış!
- **Risk:** 🔴 Kritik — Hangi RBAC'ın kullanıldığı dosyaya göre değişiyor.
- **Çözüm:**
  1. `rbac.ts`'yi kullandığı yerler `rbacService.ts`'ye migrate edilecek
  2. `rbac.ts` sadece tip export'ları için kalacak veya silinecek
  3. `types/rbac.ts` ve `types/rbac-advanced.ts` birleştirilecek

### 4.2 `offlineGenerators.ts` Proxy Dosya
| Dosya | İçerik |
|-------|--------|
| `src/services/offlineGenerators.ts` (1 satır) | Sadece `export * from './offlineGenerators/index'` |

- **Çözüm:** Import eden yerler doğrudan `./offlineGenerators/index`'e yönlendirilecek, proxy silinecek

### 4.3 `types/` Dizinindeki Çoklu Dosyalar
| Potansiyel Çakışma | Dosyalar |
|--------------------|----------|
| RBAC tipleri | `types/rbac.ts` (1.7KB) vs `types/rbac-advanced.ts` (9.5KB) |
| Student tipleri | `types/student.ts` (679B) vs `types/student-advanced.ts` (23KB) |

- **Çözüm:** Küçük olanlar büyük olanlara merge edilecek, re-export bırakılacak

### 4.4 `src/types.ts` vs `src/types/`
| Dosya | İçerik |
|-------|--------|
| `src/types.ts` (501B) | Root seviye tip dosyası |
| `src/types/` (34 dosya) | Tip dizini |

- **Çözüm:** `src/types.ts` içeriği `src/types/` altına taşınacak

### 4.5 `src/constants.ts` vs `src/constants/`
| Dosya | İçerik |
|-------|--------|
| `src/constants.ts` (20KB) | Root seviye sabit dosyası |
| `src/constants/` (2 dosya) | Sabit dizini |

- **Çözüm:** İçerikler birleştirilecek

---

## 5. DEPRECATED / RE-EXPORT PROXY'LER

### 5.1 Deprecated Dosyalar
| # | Dosya | İçerik |
|---|-------|--------|
| 1 | `src/services/generators/visualPerception.ts` | `// This file is deprecated` → re-export |
| 2 | `src/services/offlineGenerators/visualPerception.ts` | `// This file is deprecated` → re-export |

### 5.2 Stub Re-Export Dosyaları (offlineGenerators)
| # | Dosya | Boyut | İçerik |
|---|-------|-------|--------|
| 1 | `src/services/offlineGenerators/abcConnect.ts` | 51B | Re-export from generators/offline |
| 2 | `src/services/offlineGenerators/capsuleGame.ts` | 52B | Re-export from generators/offline |
| 3 | `src/services/offlineGenerators/futoshiki.ts` | 50B | Re-export from generators/offline |
| 4 | `src/services/offlineGenerators/oddEvenSudoku.ts` | 54B | Re-export from generators/offline |
| 5 | `src/services/offlineGenerators/magicPyramid.ts` | 53B | Re-export from generators/offline |

- **Çözüm:** Import eden yerlerde doğrudan kaynak yol kullanılacak, proxy dosyalar silinecek.

---

## 6. TypeScript Strict Mode İhlalleri

### 6.1 `activity-configs/` — Toplu TS Hataları
`src/components/activity-configs/` altındaki 55 config dosyasında sistematik TS hataları:

| Hata Kodu | Açıklama | Etkilenen Dosya Sayısı |
|-----------|----------|----------------------|
| `TS7006` | Parameter implicitly has `any` type | 40+ |
| `TS7031` | Binding element implicitly has `any` type | 30+ |
| `TS2307` | Cannot find module 'react' | 15+ |
| `TS2875` | jsx-runtime module path not found | 15+ |

#### Etkilenen Dosyalar (Örnekler)
- `MissingPartsConfig.tsx` — 15+ implicit any hatası
- `ReadingLanguageConfigs.tsx` — 25+ implicit any & binding element hatası
- `MorphologyConfig.tsx` — any type + import hatası
- `NumberPathLogicConfig.tsx` — import + any hatası
- `PatternCompletionConfig.tsx` — any hatası
- `QueueOrderingConfig.tsx` — import hatası

#### Çözüm
1. Her config bileşenine `ConfigProps` interface tanımlanacak:
```typescript
interface ConfigProps {
  options: Record<string, unknown>;
  onChange: (newOptions: Record<string, unknown>) => void;
}
```
2. Event handler'lara `React.ChangeEvent<HTMLInputElement>` tipi eklenecek
3. `react` import'ları kontrol edilecek

### 6.2 `any` Kullanım Taraması
Proje kuralı: **`any` tipi yasak — `unknown` + type guard kullan**

Tespit edilen kullanımlar:
- `src/services/rbac.ts:119` — `catch (error: any)`
- `src/services/rbacService.ts:50` — `act as any`
- `src/App.tsx` — `@ts-nocheck` ile tüm any gizli
- `src/components/activity-configs/` — toplu implicit any

---

## 7. MİMARİ İYİLEŞTİRMELER

### 7.1 `App.tsx` — God Component (1393 satır, 58KB)
| Metrik | Değer | Hedef |
|--------|-------|-------|
| Satır | 1393 | < 300 |
| Boyut | 58KB | < 15KB |
| Fonksiyon | 36+ | < 10 |

**Sorun:** Tek dosyada navigasyon, state yönetimi, modal kontrolü, oturum yönetimi hepsi bir arada.

**Çözüm (İşlev bozmadan):**
1. `useNavigationState()` custom hook'u çıkarılacak (navigateTo, handleGoBack, handleOpenStudio)
2. `useHistoryManager()` custom hook'u çıkarılacak (addToHistory, clearHistory, deleteHistoryItem)
3. `useWorksheetManager()` custom hook'u çıkarılacak (addSavedWorksheet, loadSavedWorksheet)
4. `ModalManager` bileşeni çıkarılacak (Modal, LoadingSpinner App.tsx dışına)
5. `tourSteps` verisi `src/data/tourSteps.ts`'ye taşınacak
6. Import'lar düzenlenecek (ortada import yasak — 232 ve 271. satırlarda ortada import var)

### 7.2 `migrated_prompt_history/` Dizini (Root'ta)
- 24 dosya içeren dizin — geçmiş prompt'ların migrasyon arşivi
- **Çözüm:** `docs/archive/` altına taşınacak veya silinecek

### 7.3 `src/kaynak/` Dizini (72 dosya)
- Kaynak/referans materyalleri
- **Kontrol:** İçeriği incelenip, runtime'da gerekli değilse `docs/` altına taşınacak

### 7.4 `types/lucide.d.ts` (5.8KB)
- Manuel lucide-react tip tanımlaması
- **Kontrol:** `@types/lucide-react` veya paket kendi tipleri yeterliyse silinebilir

---

## 8. GÜVENLİK & KVKK

### 8.1 `enforcePermission` — `AppError` Kullanmıyor
| Dosya | Satır | Sorun |
|-------|-------|-------|
| `src/services/rbac.ts` | 167 | `throw new Error(...)` — proje standardı `new AppError(...)` olmalı |

### 8.2 `tsconfig.json` Include Kapsamı Çok Geniş
```json
"include": ["**/*.ts", "**/*.tsx"]
```
- Root'taki `extractBlockRenderer.cjs`, `eslint.config.js` vb. da dahil oluyor
- **Çözüm:** `"include": ["src/**/*.ts", "src/**/*.tsx", "api/**/*.ts"]`

### 8.3 Firebase Kuralları Kontrolü
- `firestore.rules` (3.4KB) mevcut — içerik doğrulanmalı

---

## 9. PERFORMANS

### 9.1 Büyük Dosyalar (Bundle Impact)
| Dosya | Boyut | Sorun |
|-------|-------|-------|
| `src/services/generators/mathSinavGenerator.ts` | 50KB | Tek dosyada çok fazla mantık |
| `src/services/generators/mathVisualPromptLibrary.ts` | 43KB | Büyük prompt kütüphanesi |
| `src/components/CurriculumView.tsx` | 68KB | Çok büyük bileşen |
| `src/components/SheetRenderer.tsx` | 59KB | Çok büyük renderer |
| `src/components/WorkbookView.tsx` | 59KB | Çok büyük bileşen |
| `src/components/OCRScanner.tsx` | 58KB | Çok büyük bileşen |
| `src/components/SavedWorksheetsView.tsx` | 47KB | Büyük bileşen |
| `src/data/activityStudioLibrary.ts` | 58KB | Dev veri dosyası |

### 9.2 Kullanılmayan Paketler (Potansiyel)
| Paket | Soru |
|-------|------|
| `@antv/infographic` | Kullanılıyor mu? |
| `pixi.js` (1.1MB) | Kullanılıyor mu? |
| `@react-three/drei` + `@react-three/fiber` + `three` | 3D grafik — kullanılıyor mu? |
| `puppeteer-core` + `@sparticuz/chromium` | Server-side PDF — Vercel'da çalışıyor mu? |
| `pdfjs-dist` | Kullanılıyor mu? |
| `rgbcolor` | Kullanılıyor mu? |

**Çözüm:** Her paketin import'u `grep` ile kontrol edilecek, kullanılmayanlar kaldırılacak.

---

## 10. TEST EKSİKLERİ

### 10.1 Mevcut Test Durumu
- 52 birim test dosyası + 4 alt dizin (toplamda ~80 test)
- **Kapsamı:** Servisler, utility'ler, güvenlik testleri

### 10.2 Test Eksiği Olan Kritik Alanlar
| Alan | Dosya | Test Var mı? |
|------|-------|-------------|
| App navigasyon | `src/App.tsx` | ❌ |
| Sidebar | `src/components/Sidebar.tsx` | ❌ |
| Store'lar | `src/store/*.ts` (19 store) | Kısmen (1 test) |
| Sheet Renderer'lar | `src/components/sheets/` (79 dosya) | ❌ |
| Activity Configs | `src/components/activity-configs/` (55 dosya) | ❌ |
| RBAC Service (yeni) | `src/services/rbacService.ts` | ❌ (eski rbac.ts testi var) |

---

## 11. BAĞIMLILIK (Dependency) TEMİZLİĞİ

### 11.1 DevDependencies'de Olması Gereken Runtime Dependencies
| Paket | Neden |
|-------|-------|
| `postcss` | Build araç — devDep olmalı |
| `tailwindcss` | Build araç — devDep olmalı |

### 11.2 `types/activity.ts` — Root'ta ve `src/types/` Altında
| Dosya | Boyut |
|-------|-------|
| `types/activity.ts` (root) | 5.4KB |
| `src/types/activity.ts` | 14.5KB |

- **Çözüm:** Root `types/activity.ts` silinecek, tüm import'lar `src/types/activity.ts`'ye yönlendirilecek

---

## 12. UYGULAMA PLANI

### Faz 1 — Kritik Hatalar ✅ TAMAMLANDI
- [x] `rbac.ts` vs `rbacService.ts` çakışması çözüldü (rbac.ts hiç import edilmiyordu)
- [x] `enforcePermission` → `AppError` standardına geçirildi
- [x] `tsconfig.json` include kapsamı daraltıldı (`src/**`, `api/**`)
- [x] `rbac.ts` ve `rbacService.ts`'deki `any` → `unknown`/`PermissionAction`
- [ ] `App.tsx`'teki `@ts-nocheck` kaldırılıp hatalar düzeltilecek
- [ ] `npm install` yapılacak (vite PATH sorunu)

### Faz 2 — Temizlik ✅ TAMAMLANDI
- [x] Root'taki 60+ gereksiz dosya silindi (MD, TXT, patch, script, extract)
- [x] 3 gereksiz dizin silindi (migrated_prompt_history, pull_requests, pulls)
- [x] 10 boş stub bileşen silindi (AdminDashboard/ altında gerçek modüller mevcut)
- [x] 2 deprecated `visualPerception.ts` dosyası silindi
- [x] Root `types/` dizini silindi (duplikasyon)
- [x] `src/types.ts` barrel ve `offlineGenerators.ts` proxy korundu (aktif kullanımda)

### Faz 3 — TypeScript Strict Mode (Kısmen Uygulandı)
- [x] `MissingPartsConfig.tsx` → `any` → `unknown` düzeltildi
- [x] `MorphologyConfig.tsx` → `any` → `keyof GeneratorOptions`/`unknown` düzeltildi
- [ ] Kalan 53 activity-config dosyasında `any` düzeltmeleri (toplu iş)
- [ ] `App.tsx` içindeki 10+ `any` kullanımı düzeltilecek (550, 556, 628, 669, 700-713, 785 satırları)
- [ ] Event handler tiplemeleri düzeltilecek

### Faz 4 — Mimari İyileştirme (Bekliyor)
- [ ] `App.tsx` parçalanacak (custom hook'lar çıkarılacak)
- [ ] Büyük bileşenler (60KB+) modülerleştirilecek
- [ ] Kullanılmayan npm paketleri kaldırılacak

### Faz 5 — Test & Doğrulama (Bekliyor)
- [ ] rbacService testleri yazılacak
- [ ] Store testleri genişletilecek
- [ ] Build & lint temiz geçtiği doğrulanacak

---

## 📊 ÖZET İSTATİSTİKLER

| Metrik | Değer |
|--------|-------|
| Silinecek root dosya | ~65 |
| Silinecek stub bileşen | 10 |
| Silinecek deprecated dosya | 7+ |
| Çözülecek duplikasyon | 5 |
| TS strict hata (activity-configs) | 100+ |
| `any` kullanımı (tespit edilen) | 5+ |
| Büyük dosya (50KB+) | 8 |
| Potansiyel kullanılmayan paket | 6 |
| Test eksiği olan kritik alan | 6 |

---

> **⚠️ UYARI:** Bu plan hiçbir mevcut işlevi bozmadan uygulanacak şekilde tasarlanmıştır. Her faz sonrasında `npm run build` ve `npm run test:run` ile doğrulama yapılacaktır.

---

> **👑 Lider Ajan Onayları:**
> - **Bora Demir (Mühendislik):** TypeScript strict mode ihlalleri ve duplikasyonlar acil çözülmeli.
> - **Elif Yıldız (Pedagoji):** `activity-configs` hataları öğrenci-facing içerik üretimini etkileyebilir — Faz 3 öncesi test edilmeli.
> - **Dr. Ahmet Kaya (Klinik):** RBAC çakışması KVKK uyumluluğunu riske atıyor — Faz 1'de çözülmeli.
> - **Selin Arslan (AI):** Kullanılmayan paketler bundle boyutunu artırıyor, AI yanıt sürelerini dolaylı etkiliyor.

# Uygulama Durumu — Tamamlanan Geliştirmeler (13 Haziran 2026)

> Bu dosya orijinal denetim raporunu içerir. Aşağıdaki bölüm uygulanan değişiklikleri özetler.

## Uygulanan Değişiklikler Özeti

### Faz 0 — Acil Düzeltmeler ✅
- `getScoreColor` risk mantığı düzeltildi (yüksek skor = kırmızı)
- `AppearanceSettings` font slider 0.8–1.5 çarpan birimine geçirildi
- `firestore.rules` genişletildi: superadmin, config_*, workbooks, saved_* koleksiyonları
- `teacherService.ts` studentsSnap bug düzeltildi
- Mock tarama verisi yalnızca `import.meta.env.DEV` modunda
- `scoringEngine` tam `ScreeningProfile` metadata kullanıyor

### Faz 1 — Veri Bütünlüğü ✅
- Tarama arşiv/silme Firestore senkronu (`updateScreeningInFirestore`)
- Paylaşım userId/gender düzeltmeleri
- Çift AI çağrısı önlendi (embedded ScreeningModule)
- `Curriculum` tipine progress/status/bepGoals eklendi
- `CurriculumView` ShareModal gerçek paylaşım handler
- Profil paylaşım `markAsRead` entegrasyonu

### Faz 2 — Mimari ✅
- `CognitiveTestPanel` Tarama modülüne bağlandı (İnteraktif Batarya)
- Görünüm ayarları: borderRadius, animationLevel çalışır hale getirildi
- **Workbook v2 birincil:** `WorkbookHub` + `workbookBridge` + `WorkbookLibrary` entegrasyonu
- `WorkbookView` v2 kayıt + legacy arşiv uyumluluğu
- Favoriler/paylaşılan materyaller `ProtectedRoute` ile korunuyor
- `screeningService.ts` ölü kod silindi

### Faz 3 — Admin ✅
- `AuditLog` tab eklendi
- Feedback badge gerçek sayıdan geliyor

### Test & Build
- `tests/scoringEngine.test.ts` eklendi
- `npm run build` başarılı

### Kalan İşler (sonraki sprint)
- `@ts-nocheck` kaldırma (ContentArea, SharedWorksheetsView)
- AdminAnalytics mock → gerçek metrik
- Geçmiş Firebase senkronu
- `/screening/:id` deep link route
- WorkbookAI → WorkbookView entegrasyonu

---

> **Kapsam:** Bilişsel Değerlendirme, Tarama & Analiz, Plan & Müfredat, Profil Ayarları, Görüntü Ayarları, Arşiv, Geçmiş, Favoriler, Paylaşım, Çalışma Kitapçığı, Admin Paneli  
> **Yöntem:** Statik kod analizi, import/bağlantı izleme, alt modül keşfi, mevcut dokümantasyon (`deger.md`, `MODULE_KNOWLEDGE.md`) çapraz kontrolü

---

## 1. Yönetici Özeti

Oogmatik platformunda incelenen 11 modül alanının çoğu **işlevsel bir MVP** sunuyor; ancak mimari parçalanma, ölü kod, mock veri kullanımı ve tip güvenliği açıkları nedeniyle **üretim yayını için kritik düzeltmeler** gerekiyor.

### En Kritik 10 Bulgu

| # | Öncelik | Modül | Sorun |
|---|---------|-------|-------|
| 1 | **P0** | Tarama & Analiz | `getScoreColor()` yüksek risk skorunu yeşil gösteriyor (renk mantığı ters) |
| 2 | **P0** | Görüntü Ayarları | `AppearanceSettings` font slider'ı 80–140 değeri yazıyor; store çarpan bekliyor (0.8–1.5) |
| 3 | **P0** | Admin Panel | Firestore kuralları `config_*`, `activity_drafts`, `approval_queue` koleksiyonlarını korumuyor |
| 4 | **P0** | Admin Panel | `superadmin` rolü `isAdmin()` fonksiyonunda tanımlı değil |
| 5 | **P1** | Bilişsel Değerlendirme | İki ayrı sistem (anket vs. 11 test bataryası) birbirine bağlı değil; `CognitiveTestPanel` ölü kod |
| 6 | **P1** | Tarama & Analiz | Silme/arşivleme yalnızca Zustand'da; Firestore'a yazılmıyor |
| 7 | **P1** | Tarama & Analiz | `scoringEngine` yaş/sınıf/studentId sabit değerlerle hesaplıyor |
| 8 | **P1** | Çalışma Kitapçığı | Premium v2 (`WorkbookLibrary`, `workbookService`) tamamen yazılmış ama UI'a bağlı değil |
| 9 | **P1** | Plan & Müfredat | `CurriculumView` paylaşım butonu no-op (`onShare={() => { }}`) |
| 10 | **P2** | Paylaşım | Profil paylaşımında `markAsRead` çağrılmıyor; sessiz hata yutma |

### Genel Sağlık Skoru (tahmini)

| Modül | Veri Katmanı | UI | Tip Güvenliği | Üretim Hazırlığı |
|-------|-------------|-----|---------------|------------------|
| Bilişsel Değerlendirme | Orta | İyi | Zayıf (`any`) | Kısmi |
| Tarama & Analiz | Orta (mock fallback) | İyi | Orta | Kısmi |
| Plan & Müfredat | İyi | İyi | Zayıf | Orta |
| Profil Ayarları | İyi | İyi | Orta | Orta |
| Görüntü Ayarları | İyi | **Hatalı slider** | Orta | **Hayır** |
| Arşiv | İyi | İyi | Zayıf (`@ts-nocheck`) | Orta |
| Geçmiş | Zayıf (localStorage) | İyi | Zayıf | Düşük |
| Favoriler | Orta (çift kaynak) | İyi | Zayıf | Orta |
| Paylaşım | Orta | Kısmi | Zayıf | Kısmi |
| Çalışma Kitapçığı | İki mimari | İyi (legacy) | Orta | Kısmi |
| Admin Paneli | Karışık (mock+gerçek) | İyi | Orta | **Hayır** (güvenlik) |

---

## 2. Mimari Genel Bakış

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         App.tsx (View Router)                           │
├──────────────┬──────────────┬──────────────┬────────────────────────────┤
│ Full Views   │ Modals       │ ContentArea  │ Overlay                    │
│ profile      │ history      │ savedList    │ assessment (AssessmentMod) │
│ curriculum   │ settings     │ workbook     │ screening (ScreeningAss.)  │
│ admin        │              │ favorites    │                            │
│              │              │ shared       │                            │
└──────────────┴──────────────┴──────────────┴────────────────────────────┘
         │              │              │                    │
         ▼              ▼              ▼                    ▼
   Firestore      localStorage    worksheetService      İki ayrı
   (curriculums,  (user_history)  assessmentService     değerlendirme
    worksheets,                    curriculumService    sistemi
    users, etc.)
```

**Navigasyon modeli:** React Router yok; `useWorksheetStore.currentView` + modal state (`App.tsx`) ile yönetiliyor.

**RBAC:** `ProtectedRoute` + `rbacService` — ancak favorites, shared, history modal ve screening overlay'de **tutarsız uygulama**.

---

## 3. Modül Bazlı Detaylı Analiz

### 3.1 Bilişsel Değerlendirme (Interactive Battery)

**Giriş noktası:** AppHeader stethoscope → `currentView === 'assessment'` → `ContentArea` → `AssessmentModule`

**Ana dosyalar:**
- `src/components/AssessmentModule.tsx`
- `src/components/assessment/AssessmentEngine.tsx`
- `src/components/assessment/tests/*.tsx` (11 alt test)
- `src/services/assessmentService.ts`
- `src/services/assessmentGenerator.ts`
- `src/components/AssessmentReportViewer.tsx`

**Çalışan akış:**
1. Kullanıcı bilişsel alanları seçer
2. `AssessmentEngine` alt testleri sırayla çalıştırır
3. AI rapor üretimi (`assessmentGenerator`)
4. Firestore `saved_assessments` koleksiyonuna kayıt

**Tespit edilen sorunlar:**

| Sorun | Dosya | Detay |
|-------|-------|-------|
| `any` tipi yaygın | `AssessmentModule.tsx` | L17, L64, L186, L270+ |
| Tarama modülüyle kopuk | — | Anket sonuçları ile batarya sonuçları birleştirilmiyor |
| `CognitiveTestPanel` ölü | `ScreeningAssessment/components/CognitiveTests/CognitiveTestPanel.tsx` | Hiçbir yerde import edilmiyor |
| Stroop tipografi | `StroopInteractiveTest.tsx` | `text-6xl`, `text-9xl` modal içinde taşma riski |
| Gender tip uyumsuzluğu | `ResultDashboard.tsx` L155 | `'Belirtilmemiş'` vs beklenen `'Kız' \| 'Erkek'` |

**Eksikler:**
- Anket + batarya birleşik rapor yok
- Otomatik test yok (`tests/` altında assessment modülü testi yok)
- Tarama sonucundan doğrudan batarya başlatma akışı yok

---

### 3.2 Tarama & Analiz (ScreeningAssessment)

**Giriş noktası:** Sidebar "Tarama & Analiz" → `isAdvancedScreeningOpen` modal → `ScreeningAssessment`

**Ana dosyalar:**
- `src/components/ScreeningAssessment/index.tsx` (orkestratör)
- `src/components/ScreeningAssessment/store/useScreeningStore.ts`
- `src/components/ScreeningAssessment/hooks/useScreeningAssessment.ts`
- `src/components/ScreeningAssessment/panels/*.tsx` (4 tab + 2 gizli view)
- `src/components/Screening/ScreeningModule.tsx` (legacy anket sihirbazı)
- `src/utils/scoringEngine.ts`
- `src/data/screeningQuestions.ts`
- `src/components/ScreeningAssessment/services/screeningDataService.ts`

**Tab yapısı:**
| Tab | Panel | Durum |
|-----|-------|-------|
| Panel | `DashboardPanel` | Çalışıyor (renk hatası var) |
| Yeni Tarama | `NewScreeningPanel` | Çalışıyor |
| Geçmiş | `HistoryPanel` | Çalışıyor (silme kalıcı değil) |
| Analiz | `AnalyticsPanel` | Çalışıyor |

**Kritik hatalar:**

#### H1 — Skor renk mantığı ters
```typescript
// useScreeningAssessment.ts L160-163
const getScoreColor = (score: number): string => {
  if (score >= 70) return 'text-emerald-500';  // YÜKSEK risk = yeşil (YANLIŞ)
  if (score >= 50) return 'text-amber-500';
  return 'text-rose-500';
};
```
`scoringEngine` yüksek skoru yüksek risk olarak hesaplar. %80 riskli öğrenci yeşil görünür.

**Düzeltme:** Fonksiyonu `getRiskColor` olarak yeniden adlandır; mantığı ters çevir veya skoru `100 - score` olarak yorumla.

#### H2 — scoringEngine sabit değerler
```typescript
// scoringEngine.ts L110-115
studentId: 'unknown',
age: 8,
grade: '2',
```
`NewScreeningPanel` yaş/sınıf topluyor ama `QuestionnaireForm` bunları `calculate()`'a geçirmiyor.

#### H3 — Firestore silme/arşivleme yok
`archiveScreening` / `deleteScreening` yalnızca Zustand state güncelliyor. `screeningDataService.deleteScreeningFromFirestore()` hiç çağrılmıyor.

#### H4 — Mock veri üretim ortamında
Firestore boşsa 3 sahte öğrenci (Ali, Ayşe, Mehmet) gösteriliyor — gerçek kullanıcılar için yanıltıcı.

#### H5 — Çift AI çağrısı
Anket tamamlanınca `ResultDashboard` (legacy) ve `ResultDetailPanel` (yeni) sırayla AI analizi tetikliyor.

#### H6 — REST API yok
`screeningDataService` `/api/screening/*` çağırıyor; `api/` altında handler yok. Tüm REST metodları sessizce başarısız.

#### H7 — Paylaşım URL'si ölü
Clipboard'a `/screening/${id}` kopyalanıyor; frontend route handler yok.

#### H8 — Gelişimsel tarama kozmetik
`selectedScreeningType: 'developmental'` UI'da seçilebiliyor ama hiçbir branching logic yok.

**Ölü kod:**
- `src/services/screeningService.ts` — sıfır import
- `hooks/useScreeningHistory.ts` — sıfır kullanım
- `CognitiveTestPanel.tsx` — sıfır import
- `ContentArea.tsx` lazy `ScreeningModule` — render edilmiyor
- `App.tsx` `currentView === 'screening'` route — sidebar artık bu view'ı set etmiyor

**Tip sorunları:**
- `ScreeningAssessment/types.ts` L63: `export { Type }` → `export type { Type }` olmalı (`isolatedModules`)
- `riskLevel`: `'medium'` vs `'moderate'` tutarsızlığı
- `ScreeningAssessmentProps.studentId` prop tanımlı ama kullanılmıyor

---

### 3.3 Plan & Müfredat (Curriculum)

**Giriş noktası:** Sidebar → `currentView === 'curriculum'` → `ProtectedRoute module="curriculum"` → `CurriculumView`

**Ana dosyalar:**
- `src/components/CurriculumView.tsx` (~900+ satır)
- `src/components/Profile/modules/PlansModule.tsx`
- `src/services/curriculumService.ts`
- `src/types/core.ts` (`Curriculum`, `CurriculumDay`, `CurriculumActivity`)

**Çalışan akış:**
1. AI ile MEB uyumlu plan üretimi (Gemini)
2. Firestore `saved_curriculums` kayıt
3. Aktivite başlatma → `activeCurriculumSession` → Generator kilitli parametreler
4. Tarama sonucundan plan köprüsü (`App.tsx handleGeneratePlanFromScreening`)

**Tespit edilen sorunlar:**

| Sorun | Dosya | Detay |
|-------|-------|-------|
| Paylaşım no-op | `CurriculumView.tsx` L918 | `onShare={() => { }}` |
| Tip eksikliği | `types/core.ts` | `Curriculum`'da `progress`, `status`, `bepGoals` yok; `PlansModule` `as Record<string, unknown>` kullanıyor |
| `any` cast | `curriculumService.ts` | `getUserCurriculums` içinde `data as any` |
| Kullanılmayan stub | `curriculumService.ts` | `_getActivitiesByTag` |
| Üçlü UI parçalanması | — | `CurriculumView` + `PlansModule` + Arşiv "Eğitim Planları" tab — tek kaynak yok |

**Eksikler:**
- BEP hedefleri düzenleme tek yerde değil
- Profil paylaşımı plan ID'si yerine tüm modülü paylaşıyor
- Tamamlanan aktivitelerin plan kartlarına geri senkronu tip güvensiz

---

### 3.4 Profil Ayarları

**Giriş noktası:** Header → "Profil Ayarları" → `currentView === 'profile'`

**Ana dosyalar:**
```
src/components/Profile/
├── index.tsx
├── constants.ts (PROFILE_TABS)
├── hooks/useProfileData.ts, useProfileSettings.ts, useProfileShare.ts
├── modules/OverviewModule, StudentsModule, AnalysisModule, PlansModule,
│          ReportsModule, SettingsModule
└── modules/settings/UserProfileSettings, AppearanceSettings, PedagogySettings,
                       AIControlSettings, NotificationSettings, SecuritySettings
```

**Tab yapısı:** Genel Bakış | Öğrenciler | Analiz | Planlar | Raporlar | Ayarlar

**Tespit edilen sorunlar:**

| Sorun | Dosya | Detay |
|-------|-------|-------|
| `customUI` persist edilmiyor | `useProfileSettings.ts` | density, radius, accent bağlantısız |
| Bildirim ayarları localStorage | `NotificationSettings.tsx` | Firebase user doc'a senkron yok |
| `markAsRead` çağrılmıyor | `SharedContentPanel.tsx` | Okunmamış badge sıfırlanmıyor |
| Streak TODO | `useProfileData.ts` L91 | `streak: 0 // TODO` |
| `onOpenSettingsModal` kullanılmıyor | `SettingsModule.tsx` | Header `SettingsModal` ile çakışma |

---

### 3.5 Görüntü Ayarları

**İki paralel UI (kritik mimari sorun):**

| UI | Tetikleyici | Dosya |
|----|-------------|-------|
| Görünüm Ayarları (header) | `onOpenModal('settings')` | `SettingsModal.tsx` |
| Görünüm (profil) | Profil → Ayarlar → Görünüm | `AppearanceSettings.tsx` |

Her ikisi de `useUIStore` (`app-ui-storage`) kullanıyor.

**P0 — Font slider birimi hatası:**
```typescript
// AppearanceSettings.tsx L133-134 — YANLIŞ
value={(uiSettings?.fontSizeScale ?? 100)}  // 80-140 aralığı
onChange={(e) => onUpdateUiSettings({ fontSizeScale: Number(e.target.value) })}

// SettingsModal.tsx L283-284 — DOĞRU
value={uiSettings.fontSizeScale}  // 0.8-1.5 çarpan
onChange={(e) => onUpdateUiSettings({ fontSizeScale: parseFloat(e.target.value) })}
```
Kullanıcı profil ayarlarından slider'ı %100'e çekerse store'a `100` yazılır → tüm UI fontları patlar.

**P0 — İşlevsiz kontroller (`AppearanceSettings.tsx`):**
- Köşe Yuvarlaklığı butonları: `onClick` yok
- Animasyon Düzeyi butonları: `onClick` yok, `prefers-reduced-motion` bağlantısı yok

**Tema listesi uyumsuzluğu:**
- Profil: `oled-black`, `dyslexia-cream`, `dyslexia-mint`
- Header modal: `anthracite-gold`, `anthracite-cyber`, vb.

**Öneri:** Tek görünüm ayarları UI'ı seç; diğerini kaldır veya tam senkronize et.

---

### 3.6 Arşiv (Dijital Arşiv)

**Giriş noktası:** `navigateTo('savedList')` → `SavedWorksheetsView`

**Ana dosyalar:**
- `src/components/SavedWorksheetsView.tsx` (birincil)
- `src/components/SharedWorksheetsView.tsx` (legacy, `@ts-nocheck`)
- `src/services/worksheetService.ts`
- `src/services/assessmentService.ts`
- `src/services/curriculumService.ts`

**Tab yapısı:** Materyaller | Raporlar | Eğitim Planları

**Tespit edilen sorunlar:**

| Sorun | Dosya | Detay |
|-------|-------|-------|
| Yanlış props interface adı | `SavedWorksheetsView.tsx` L34 | `SharedWorksheetsViewProps` (copy-paste) |
| `@ts-nocheck` | `SharedWorksheetsView.tsx` L1 | Tip denetimi devre dışı |
| Pagination count null | `worksheetService.ts` | `getSharedWithMe` primary path'te |
| Full collection scan | `worksheetService.ts` | Fallback shared query tüm koleksiyonu tarıyor |
| `alert()` kullanımı | `WorkbookView`, `SharedWorksheetsView` | Toast sistemi yerine |
| Ölü kod | `WorkbookLibrary.tsx` | Sıfır import |

**Veri:** `saved_worksheets` (WORKBOOK tipi dahil), `saved_curriculums`, assessment koleksiyonu

---

### 3.7 Geçmiş (İşlem Geçmişi)

**Giriş noktası:** Header → `onOpenModal('history')` → `HistoryView` modal

**Ana dosyalar:**
- `src/components/HistoryView.tsx`
- `src/hooks/useHistoryManager.ts`

**Depolama:** `localStorage` key `user_history`, max 100 öğe — **Firebase senkronu yok**

**Tespit edilen sorunlar:**

| Sorun | Detay |
|-------|-------|
| RBAC uygulanmıyor | `'activity-history'` modülü tanımlı ama modal korumasız |
| Cihazlar arası senkron yok | Tarayıcı verisi silinince geçmiş kaybolur |
| Login sonrası filtre yok | `userId` per-item ama login'de migration yok |
| `any` tipi | `loadSavedWorksheet` parametresi |
| İsim çakışması | `useWorksheetStore` navigation stack vs activity history |

**Not:** Screening'in kendi `HistoryPanel.tsx`'i ayrı bir geçmiş modülüdür (Firestore tabanlı).

---

### 3.8 Favoriler

**Giriş noktası:** `navigateTo('favorites')` → `FavoritesSection`

**Ana dosyalar:**
- `src/components/FavoritesSection.tsx`
- `src/services/statsService.ts`
- `src/constants.ts` (`USER_FAVORITES`)

**Depolama:** `localStorage` + opsiyonel Firebase `authService.updateProfile({ favorites })`

**Tespit edilen sorunlar:**

| Sorun | Detay |
|-------|-------|
| Çift kaynak | localStorage vs Firebase user doc desync riski |
| Tip tutarsızlığı | `User.favorites: string[]` vs `statsService.getFavorites(): ActivityType[]` |
| RBAC uygulanmıyor | `ContentArea`'da `ProtectedRoute` yok |
| `console.error` | `statsService.toggleFavorite` proje loglama standardına aykırı |
| Öğrenci materyal favorileri | `MaterialsModule.tsx` local-only, persist yok |

---

### 3.9 Paylaşım

**Üç alt sistem:**

#### A. Materyal / Değerlendirme Paylaşımı
- `ShareModal.tsx`, `worksheetService.shareWorksheet`, `assessmentService.shareAssessment`
- Firestore `sharedWith` array

#### B. Profil Modül Paylaşımı
- `profileShareService.ts` → `shared_profile_content` koleksiyonu
- `useProfileShare.ts`, `SharedContentPanel.tsx`

#### C. Kitapçık İşbirliği (v2 — entegre değil)
- `workbook/workbookSharingService.ts` — `WorkbookView`'a bağlı değil

**Tespit edilen sorunlar:**

| Sorun | Dosya | Detay |
|-------|-------|-------|
| Paylaşılan rapor görüntüleme stub | `SharedWorksheetsView.tsx` L164-165 | alert + TODO |
| Sessiz hata | `profileShareService.ts` | empty catch → null/[] |
| `markAsRead` UI'da yok | `SharedContentPanel.tsx` | Badge sıfırlanmıyor |
| Deep link `?share=worksheetId` | `App.tsx` | Handler yok |
| MathStudio mock paylaşım | `MathStudio` | Kaydedilmemiş worksheet paylaşımı |
| Screening share userId hatası | `useScreeningAssessment.ts` L26 | `studentId` yerine auth userId gerekli |
| Screening share gender sabit | `useScreeningAssessment.ts` L29 | Her zaman `'Kız'` |

---

### 3.10 Çalışma Kitapçığı

**İki mimari (kritik parçalanma):**

#### Legacy (aktif kullanımda)
- `WorkbookView.tsx` — drag-drop sayfa editörü
- `useWorkbookActions.ts` — App-level state (refresh'te kaybolur)
- `worksheetService.saveWorkbook` → `saved_worksheets` WORKBOOK tipi
- `ProtectedRoute module="workbook"`

#### Premium v2 (yazılmış, bağlantısız)
- `workbook/workbookService.ts` — Firestore `workbooks`
- `WorkbookLibrary.tsx` — **sıfır import**
- `WorkbookAI.tsx` — `WorkbookView`'a entegre değil
- `workbookExport.ts` — PDF kısmi, DOCX/PPTX/EPUB/SCORM TODO
- `workbookSharingService.ts` — işbirliği özellikleri hazır ama kullanılmıyor
- `types/workbook.ts` — ~800 satır tip sistemi

**Stüdyo entegrasyonu:** Reading, Math, SuperStudio, Sınav, MatSınav, SariKitap, KelimeCumle, Screening, Assessment viewer — hepsi `onAddToWorkbook` expose ediyor.

**Sorunlar:**
- Kaydetmeden önce `alert()` kullanımı
- Arşivden workbook yükleme → editör akışı doğrulanmalı
- v2 mimarisi ya entegre edilmeli ya silinmeli (teknik borç)

---

### 3.11 Admin Paneli

**Giriş noktası:** `currentView === 'admin'` → `ProtectedRoute module="admin"` → `AdminDashboard/index.tsx`

**13 aktif tab:**

| Tab | Bileşen | Veri Kaynağı | Durum |
|-----|---------|--------------|-------|
| dashboard | AdminAnalytics | Karışık mock+gerçek | Kısmi |
| users | AdminUserManagement | Firestore | İyi |
| teachers | TeacherManagement | Firestore (bug var) | Orta |
| students | AdminStudentManagement | Firestore | İyi |
| permissions | AdminPermissionsIDE | Firestore RBAC | İyi |
| content_engine | AdminContentEngine | MOCK_METRICS | Hayır |
| activities | AdminActivityManager | Firestore | Kurallara bağlı |
| prompts | AdminPromptStudio | Firestore | Kurallara bağlı |
| drafts | AdminDraftReview | activity_drafts | Kurallara bağlı |
| approvals | AdminActivityApproval | approval_queue | Kurallara bağlı |
| static_content | AdminStaticContent | config_static_content | Kurallara bağlı |
| feedbacks | AdminFeedback | feedbacks | İyi |
| ad_studio | AdStudio | AI | İyi |

**P0 — Firestore güvenlik kuralları (`firestore.rules`):**
```javascript
function isAdmin() {
  return isAuthenticated() && get(...).data.role == 'admin';
  // superadmin YOK
}
// config_activities, config_prompts, config_snippets, config_static_content
// activity_drafts, approval_queue, feedback_signals → KURAL YOK
```

**P0 — teacherService bug:**
```typescript
// teacherService.ts L37
const studentIds = studentsSnap.docs.map(d => d.id);
// studentsSnap tanımsız — ownSnap/assignedSnap olmalı
```

**Ölü / bağlanmamış bileşenler:**
- `Admin/AuditLog.tsx`, `SystemHealth.tsx`, `WorksheetAnalytics.tsx`
- `Admin/ActivityManagerPanel.tsx`, `AdvancedRBACPanel.tsx`, `AdminCommunication.tsx`
- `AdminPermissionsIDE.tsx` (root, eski)
- `PermissionManager.tsx` (tüm handler'lar no-op stub)
- `index.tsx` user inspection overlay — `setInspectingUser` hiç çağrılmıyor

**RBAC üçlü parçalanma:**
1. `services/rbac.ts` — legacy API (4 rol, superadmin yok)
2. `services/rbacService.ts` — modül RBAC (27 modül, Firestore)
3. `PermissionManager.tsx` — stub matrix (mount edilmiyor)

**Güvenlik sorunları:**
- `SUPER_ADMIN_EMAIL` client-side hardcoded (`AdminUserManagement.tsx`)
- `AdminActivityApproval.tsx` approver ID `'admin-user'` sabit
- `users` koleksiyonu: tüm authenticated kullanıcılar okuyabilir
- `api/admin/fs-proxy.ts`: superadmin engelleniyor

**Dokümantasyon drift:** `CLAUDE.md` `AdminDashboardV2.tsx` referans veriyor — dosya yok; gerçek giriş `AdminDashboard/index.tsx`

---

## 4. Çapraz Kesen Sorunlar

### 4.1 TypeScript Hijyeni

**`@ts-nocheck` dosyaları (modül bağlantılı):**
- `ContentArea.tsx` — tüm view render hub'ı
- `SharedWorksheetsView.tsx` — paylaşılan materyaller
- `GeneratorView.tsx` — aktivite üretim

**Yaygın `any` kullanımı:**
- Screening legacy bileşenleri
- AssessmentModule
- curriculumService
- useHistoryManager

**Tip tutarsızlıkları:**
- `Curriculum` interface eksik alanlar
- `User.favorites: string[]` vs `ActivityType[]`
- `riskLevel: 'medium'` vs `'moderate'`
- `UserRole` fragmentation (user.ts vs rbac.ts vs jwtService.ts)

### 4.2 RBAC Tutarsızlığı

| Modül | RBAC Tanımlı | ProtectedRoute | Gerçek Koruma |
|-------|-------------|----------------|---------------|
| screening | ✓ | Dead route only | Sidebar filter only |
| favorites | ✓ | ✗ | Sidebar filter only |
| shared | ✓ | ✗ | Sidebar filter only |
| activity-history | ✓ | ✗ (modal) | Yok |
| admin | ✓ | ✓ | ✓ + isAdmin check |

### 4.3 Ölü Kod Envanteri (silme adayı)

```
src/services/screeningService.ts
src/components/ScreeningAssessment/hooks/useScreeningHistory.ts
src/components/ScreeningAssessment/components/CognitiveTests/CognitiveTestPanel.tsx (veya entegre et)
src/components/AdminPermissionsIDE.tsx (root)
src/components/Admin/ActivityManagerPanel.tsx
src/components/Admin/AdvancedRBACPanel.tsx
src/components/Admin/AdminCommunication.tsx
src/components/AdminDashboard/UserManagement.tsx
src/components/AdminDashboard/PermissionManager.tsx
```

### 4.4 Mock Veri Üretim Riski

| Konum | Mock Kullanımı |
|-------|----------------|
| ScreeningAssessment | 3 sahte öğrenci Firestore boşsa |
| AdminAnalytics | Trend, latency, success % simüle |
| AdminContentEngine | MOCK_METRICS, MOCK_LOGS |
| SystemHealth | Tamamen mock |
| useAdminStats | Worksheet analytics overlay mock |

---

## 5. Geliştirme Planı (Fazlar)

### Faz 0 — Acil Düzeltmeler (1–2 hafta)
> Yayın öncesi bloklayıcı hatalar

- [ ] **F0.1** `getScoreColor` → `getRiskColor` mantık düzeltmesi (`useScreeningAssessment.ts`)
- [ ] **F0.2** `AppearanceSettings` font slider birim düzeltmesi (0.8–1.5 çarpan)
- [ ] **F0.3** Firestore rules: `superadmin` + tüm `config_*` + `activity_drafts` + `approval_queue` kuralları
- [ ] **F0.4** `teacherService.ts` `studentsSnap` bug fix
- [ ] **F0.5** Screening mock data fallback'i dev flag ile sınırla (`import.meta.env.DEV`)
- [ ] **F0.6** `scoringEngine.calculate()` — age, grade, studentId, respondent parametreleri geçir

**Doğrulama:** Manuel test + `npm run test:run` + `npm run build`

---

### Faz 1 — Veri Bütünlüğü ve Kalıcılık (2–3 hafta)

- [ ] **F1.1** Screening archive/delete → Firestore senkron (`screeningDataService.deleteScreeningFromFirestore`)
- [ ] **F1.2** Screening paylaşım: doğru `userId`, dinamik `gender`, `assessmentService.shareAssessment` düzeltmesi
- [ ] **F1.3** Çift AI çağrısını kaldır: embedded modda `ResultDashboard` AI atla
- [ ] **F1.4** `Curriculum` tipine `progress`, `status`, `bepGoals` ekle; `PlansModule` cast'leri kaldır
- [ ] **F1.5** `CurriculumView` ShareModal gerçek `onShare` handler bağla
- [ ] **F1.6** Profil paylaşım: `markAsRead` UI entegrasyonu + hata loglama
- [ ] **F1.7** Favoriler: tek kaynak stratejisi (Firebase primary, localStorage cache)

---

### Faz 2 — Mimari Konsolidasyon (3–4 hafta)

#### 2A — Değerlendirme Birleştirme
- [ ] **F2.1** `CognitiveTestPanel`'i `NewScreeningPanel`'e bağla VEYA kaldır + `AssessmentModule`'e yönlendir
- [ ] **F2.2** Tek "Bilişsel Değerlendirme" wizard: Anket → (opsiyonel) Batarya → Birleşik Rapor
- [ ] **F2.3** `assessmentEngineService` tek AI analiz kaynağı (ResultDashboard inline prompt kaldır)
- [ ] **F2.4** `developmental` tarama tipi için ayrı soru seti veya UI'dan kaldır
- [ ] **F2.5** Ölü route temizliği: `currentView === 'screening'`, ContentArea lazy ScreeningModule

#### 2B — Görünüm Ayarları Birleştirme
- [ ] **F2.6** Tek görünüm ayarları UI (SettingsModal VEYA AppearanceSettings — birini seç)
- [ ] **F2.7** Tema listesi senkronizasyonu
- [ ] **F2.8** Köşe yuvarlaklığı + animasyon kontrollerini `useUIStore`'a bağla
- [ ] **F2.9** `customUI` (useProfileSettings) ya entegre et ya kaldır

#### 2C — Çalışma Kitapçığı Kararı
- [ ] **F2.10** Karar: Legacy devam mı, v2 migrasyon mu?
  - **Seçenek A (önerilen):** Legacy'yi koru, v2'yi fazla faz entegre et
  - **Seçenek B:** v2'yi birincil yap, legacy'yi deprecate et
- [ ] **F2.11** `WorkbookLibrary` → sidebar veya arşiv tab'ına bağla
- [ ] **F2.12** `WorkbookAI` → `WorkbookView` entegrasyonu
- [ ] **F2.13** `alert()` → toast sistemi migrasyonu

---

### Faz 3 — Admin Panel Sağlamlaştırma (2–3 hafta)

- [ ] **F3.1** RBAC konsolidasyonu: `services/rbac.ts` deprecate → `rbacService` tek kaynak
- [ ] **F3.2** `UserRole` tip birleştirme (`types/user.ts` authoritative)
- [ ] **F3.3** AdminAnalytics mock verileri → gerçek Firestore metrikleri
- [ ] **F3.4** AdminContentEngine mock → gerçek veri veya tab'ı gizle
- [ ] **F3.5** Ölü admin bileşenlerini bağla veya sil:
  - AuditLog → sidebar tab ekle
  - SystemHealth → gerçek health check veya kaldır
  - WorksheetAnalytics → dashboard'a entegre et
- [ ] **F3.6** User inspection overlay'i çalışır hale getir veya kaldır
- [ ] **F3.7** Feedback badge gerçek count
- [ ] **F3.8** Per-tab admin permission (opsiyonel granular gating)
- [ ] **F3.9** `SUPER_ADMIN_EMAIL` → environment variable / Firestore config
- [ ] **F3.10** Dokümantasyon güncelle: `AdminDashboardV2` → `AdminDashboard/index.tsx`

---

### Faz 4 — Tip Güvenliği ve Test (2 hafta)

- [ ] **F4.1** `@ts-nocheck` kaldır: `ContentArea.tsx`, `SharedWorksheetsView.tsx`, `GeneratorView.tsx`
- [ ] **F4.2** Screening `any` → `unknown` + type guard migrasyonu
- [ ] **F4.3** `AssessmentModule` tip temizliği
- [ ] **F4.4** `ScreeningAssessment/types.ts` → `export type { }` düzeltmesi
- [ ] **F4.5** `riskLevel` enum birleştirme (`'moderate'` → `'medium'` veya tersi)
- [ ] **F4.6** Vitest testleri:
  - `scoringEngine.test.ts` — yaş/sınıf parametreleri, risk hesabı
  - `useScreeningAssessment.test.ts` — getRiskColor mantığı
  - `curriculumService.test.ts` — CRUD smoke
  - `rbacService.test.ts` — modül erişim matrisi
- [ ] **F4.7** E2E smoke: screening tamamlama, plan oluşturma, workbook kaydetme

---

### Faz 5 — Paylaşım ve Geçmiş İyileştirme (1–2 hafta)

- [ ] **F5.1** `SharedWorksheetsView` paylaşılan rapor görüntüleme (`AssessmentReportViewer` modal)
- [ ] **F5.2** Deep link handler: `?share=worksheetId` → App.tsx load logic
- [ ] **F5.3** `/screening/:id` route VEYA clipboard share özelliğini kaldır
- [ ] **F5.4** Geçmiş: Firebase senkron (opsiyonel) veya RBAC + kullanıcı filtreleme
- [ ] **F5.5** REST `/api/screening/*` implement et VEYA client REST çağrılarını kaldır
- [ ] **F5.6** `screeningService.ts` sil (duplicate)

---

## 6. Yayınlama Planı

### 6.1 Sürüm Hedefleri

| Sürüm | Faz | Hedef Tarih | İçerik |
|-------|-----|-------------|--------|
| **v1.0.4-hotfix** | Faz 0 | +1 hafta | P0 bugfix'ler (skor renk, font slider, firestore rules) |
| **v1.1.0** | Faz 1 | +3 hafta | Veri bütünlüğü, paylaşım düzeltmeleri |
| **v1.2.0** | Faz 2 | +7 hafta | Mimari konsolidasyon (değerlendirme birleştirme, görünüm, workbook kararı) |
| **v1.3.0** | Faz 3 | +10 hafta | Admin panel production-ready |
| **v1.4.0** | Faz 4–5 | +12 hafta | Tip güvenliği, test coverage, paylaşım/geçmiş |

### 6.2 Yayın Öncesi Kontrol Listesi (v1.1.0 için minimum)

**Güvenlik:**
- [ ] Firestore rules tüm admin koleksiyonlarını kapsıyor
- [ ] `superadmin` rolü tüm admin işlemlerinde çalışıyor
- [ ] Client-side hardcoded admin email kaldırıldı
- [ ] RBAC tüm view'larda tutarlı uygulanıyor

**Fonksiyonel:**
- [ ] Tarama tamamlama → Firestore kayıt → sonuç görüntüleme → plan oluşturma akışı uçtan uca
- [ ] Bilişsel batarya tamamlama → rapor → arşiv → paylaşım akışı
- [ ] Plan oluşturma → aktivite başlatma → tamamlama geri bildirimi
- [ ] Workbook oluşturma → kaydetme → arşivden yükleme → yazdırma
- [ ] Profil ayarları kaydetme (tüm alt sekmeler)
- [ ] Görünüm ayarları tüm kontroller çalışıyor

**Veri:**
- [ ] Mock veri üretim ortamında görünmüyor
- [ ] Silme/arşivleme kalıcı
- [ ] Paylaşım alıcıya ulaşıyor

**Kalite:**
- [ ] `npm run build` hatasız
- [ ] `npm run test:run` geçiyor
- [ ] `@ts-nocheck` kritik dosyalarda kaldırıldı
- [ ] Lighthouse erişilebilirlik skoru ≥ 90 (disleksi dostu UI)

### 6.3 Rollout Stratejisi

1. **Staging deploy** — Faz 0 tamamlandıktan sonra internal test
2. **Beta kullanıcılar** (5–10 öğretmen) — Faz 1 sonrası 1 hafta geri bildirim
3. **Kademeli rollout** — %10 → %50 → %100 (Vercel preview + production)
4. **Monitoring** — Firebase Analytics + error tracking (Sentry önerilir)
5. **Rollback planı** — Firestore rules ve frontend ayrı deploy; rules önce staging'de doğrula

### 6.4 Risk Matrisi

| Risk | Olasılık | Etki | Azaltma |
|------|----------|------|---------|
| Firestore rules deploy → mevcut veri erişim kesintisi | Orta | Yüksek | Staging'de rules simulator test |
| Değerlendirme birleştirme → regresyon | Yüksek | Orta | Feature flag ile kademeli geçiş |
| Workbook v2 migrasyon → veri kaybı | Orta | Yüksek | Legacy koru, v2 opt-in |
| `@ts-nocheck` kaldırma → build kırılması | Yüksek | Düşük | Dosya dosya, PR başına 1-2 dosya |
| Mock veri kaldırma → boş dashboard | Düşük | Düşük | Empty state UI tasarla |

---

## 7. Dosya Referans İndeksi

### Giriş Noktaları
| Dosya | Rol |
|-------|-----|
| `src/App.tsx` | View router, modal mount, lazy imports |
| `src/components/ContentArea.tsx` | Generator + archive/workbook/favorites/shared |
| `src/constants/views.ts` | View sabitleri |
| `src/constants/studios.ts` | Sidebar stüdyo tanımları |
| `src/hooks/useNavigationLogic.ts` | Navigasyon + screening overlay intercept |

### Store'lar
| Dosya | Rol |
|-------|-----|
| `src/store/useWorksheetStore.ts` | currentView, navigation history, curriculum session |
| `src/store/useUIStore.ts` | theme, uiSettings, styleSettings |
| `src/store/useAuthStore.ts` | user, favorites |
| `src/components/ScreeningAssessment/store/useScreeningStore.ts` | screening UI state |

### Servisler
| Dosya | Rol |
|-------|-----|
| `src/services/curriculumService.ts` | Plan CRUD + AI üretim |
| `src/services/worksheetService.ts` | Arşiv CRUD + paylaşım |
| `src/services/assessmentService.ts` | Değerlendirme raporları |
| `src/services/profileShareService.ts` | Profil modül paylaşımı |
| `src/services/statsService.ts` | Favoriler |
| `src/services/adminService.ts` | Admin config CRUD |
| `src/services/rbacService.ts` | Modül RBAC |
| `src/services/teacherService.ts` | Öğretmen-öğrenci (bug) |
| `src/services/workbook/workbookService.ts` | v2 workbook (kullanılmıyor) |

### Güvenlik
| Dosya | Rol |
|-------|-----|
| `firestore.rules` | Firestore güvenlik kuralları |
| `src/components/ProtectedRoute.tsx` | Frontend RBAC gate |
| `src/middleware/permissionValidator.ts` | API permission middleware |

---

## 8. Öncelikli İlk 5 PR Önerisi

| PR | Başlık | Dosyalar | Tahmini Süre |
|----|--------|----------|--------------|
| PR-1 | fix: screening risk color inversion | `useScreeningAssessment.ts` | 30 dk |
| PR-2 | fix: appearance font slider unit mismatch | `AppearanceSettings.tsx` | 1 saat |
| PR-3 | fix: firestore rules admin collections + superadmin | `firestore.rules` | 2 saat |
| PR-4 | fix: scoringEngine pass profile metadata | `scoringEngine.ts`, `QuestionnaireForm.tsx`, `ScreeningModule.tsx` | 3 saat |
| PR-5 | fix: screening delete/archive Firestore sync | `useScreeningAssessment.ts`, `screeningDataService.ts` | 2 saat |

---

## 9. Sonuç

Oogmatik'in modül ekosistemi geniş ve işlevsel bir temele sahip; ancak **hızlı iterasyon sürecinde biriken teknik borç** (ölü kod, mock veri, çift mimari, tip gevşekliği) üretim yayınını risk altına alıyor.

**Önerilen yaklaşım:**
1. Faz 0 hotfix'leri derhal uygula (1 hafta)
2. Faz 1 veri bütünlüğünü tamamla (3 hafta)
3. v1.1.0 beta yayını
4. Faz 2–3 mimari konsolidasyon paralel devam
5. v1.3.0 tam production release

Klinik doğruluk açısından en kritik alan **Tarama & Analiz skorlama ve renk gösterimi** — yüksek riskli öğrencinin yeşil görünmesi pedagojik ve klinik açıdan kabul edilemez; bu Faz 0'ın ilk maddesi olmalıdır.

---

*Bu plan statik kod analizi ile oluşturulmuştur. Her faz başlamadan önce `npm run build` ve ilgili modül manuel testleri ile doğrulanmalıdır.*

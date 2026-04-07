# ÖĞRENCİ YÖNETİM MODÜLÜ — YENİDEN YAPILANDIRMA PLANI

> **Tarih**: 2026-04-06
> **Durum**: Planlama Aşaması
> **Uzman Ajanlar**: Elif Yıldız (Pedagoji), Dr. Ahmet Kaya (Klinik), Bora Demir (Mühendislik), Selin Arslan (AI)

---

## 📋 YÖNETİCİ ÖZETİ

Oogmatik'in öğrenci yönetim modülü **kapsamlı ancak aşırı karmaşık** durumda. 4 uzman ajan tarafından yapılan derin analiz sonucunda:

**✅ Güçlü Yönler:**
- KVKK uyumlu gizlilik altyapısı (602 satır StudentPrivacySettings)
- BEP/IEP hedef yönetimi (SMART formatında)
- 9 modül ile kapsamlı profilleme (IEP, Academic, Behavior, Portfolio, vb.)
- AI destekli bilişsel analiz ve hedef önerileri

**❌ Kritik Sorunlar:**
- **Öğretmen yükü**: İlk kayıtta 29 alan doldurmak gerekiyor (689 satır form)
- **God component'ler**: StudentDashboard.tsx (1,257 satır), AdvancedStudentForm (689 satır)
- **Güvenlik riski**: Firestore'a doğrudan erişim, API layer yok
- **Type safety yanılgısı**: AdvancedStudent tipinde çoğu alan optional, mock data production'da
- **AI hallucination riski**: Gerçek veri olmadan tahmin üretiyor
- **Race condition**: activeStudent silindiğinde UI crash

**🎯 Hedef:**
Öğretmenin **2 dakikada bir öğrenci kaydedip ilk BEP hedefini yazabildiği**, güvenli, stabil ve kullanışlı bir modül.

---

## 🔍 MEVCUT DURUM ANALİZİ

### Dosya Envanteri

| Dosya | Satır | Rol | Durum |
|-------|-------|-----|-------|
| `types/student-advanced.ts` | 602 | Tam veri modeli + KVKK | ✅ İyi tasarlanmış, over-engineering var |
| `store/useStudentStore.ts` | 108 | Zustand store + Firestore | ⚠️ API layer gerekli |
| `components/Student/StudentDashboard.tsx` | 1,257 | Ana öğretmen arayüzü | 🔴 God component, split gerekli |
| `components/Student/AdvancedStudentManager.tsx` | 378 | Modüler profil hub'ı | ⚠️ 9 modül hep açık |
| `components/Student/modules/IEPModule.tsx` | 656 | BEP hedef yönetimi | ⚠️ Scaffold eksik |
| `components/Student/modules/AdvancedStudentForm.tsx` | 689 | 5 adımlı kayıt formu | 🔴 Çok ağır, 2 adıma inecek |
| `services/aiStudentService.ts` | 578 | AI analiz motoru | ⚠️ Validation layer eksik |
| `services/privacyService.ts` | 15KB | KVKK uyumluluk | ✅ Tam uyumlu |

### Component Hiyerarşisi

```
StudentSelector (8 satır)
  └── AdvancedStudentForm (689 satır) — 5 adım, 29 alan
       └── useStudentStore.addStudent()

AdvancedStudentManager (378 satır)
  ├── OverviewModule (204 satır)
  ├── AIInsightsModule (144 satır) — Otomatik yükleniyor ❌
  ├── IEPModule (656 satır) — Mock goals ❌
  ├── AcademicModule (159 satır)
  ├── PortfolioModule (145 satır)
  ├── BehaviorModule (216 satır)
  ├── FinancialModule (163 satır) — Öğretmen işi değil ❌
  ├── AttendanceModule (233 satır)
  └── SettingsModule (304 satır)

StudentDashboard (1,257 satır) — God component ❌
  ├── Student List (filtreleme, gruplama)
  ├── Add Form (inline)
  ├── Details Tabs (overview, materials, analytics, plans)
  └── API Calls (worksheets, assessments, curriculums)
```

---

## 👥 UZMAN AJAN DEĞERLENDİRMELERİ

### 1️⃣ Elif Yıldız — Pedagoji Direktörü

**Pedagojik Trafik Işığı: 🟡 SARI**

**Temel Sorunlar:**
1. **İlk kayıt çok ağır**: 689 satır form, 29 alan — öğretmen ilk görüşmede doldurması imkansız
2. **AI Insights otomatik**: Henüz öğrenciyi tanımadan "Bilişsel Matris" çıkartıyor (veri olmadan tahmin)
3. **BEP scaffold yok**: Boş textarea'ya "hedef yaz" demek öğretmene yardımcı değil
4. **Financial modül**: Muhasebe işi, öğretmen modülünde olmamalı
5. **9 modül hep açık**: Öğretmen neye odaklanacağını bilemiyor

**Öncelikli İyileştirmeler:**
- ✅ Form 5 adımdan 2 adıma (Zorunlu + Opsiyonel)
- ✅ İlk kayıtta sadece 5 alan: ad, sınıf, veli adı, telefon, tanı
- ✅ AI Insights varsayılan kapalı (en az 3 oturum verisi şartı)
- ✅ BEP hedef yazımı için 5 adımlı sihirbaz (SMART scaffold)
- ✅ Modül görünürlüğü: 3 core (Overview, IEP, Behavior) + 4 optional + Financial kaldır

**Pedagojik Not:**
> "Bir öğretmenin ilk görüşmede bir çocukla bağlantı kurma zamanı kısıtlıdır. Bu zamanın %80'ini form doldurmaya harcamak pedagojik bir kayıptır."

---

### 2️⃣ Dr. Ahmet Kaya — Klinik Direktör

**Klinik Trafik Işığı: 🟡 SARI (KVKK uyumlu ama pratik değil)**

**KVKK Madde 6 Analizi:**

| Alan | Zorunlu mu? | Durum |
|------|------------|-------|
| `parentalConsent.granted` | ✅ Zorunlu | İyi |
| `sensitiveDataHandling.diagnosisInfo` | ✅ Zorunlu | İyi (local_only/encrypted) |
| `dataRetention` | ✅ Zorunlu | İyi (36 ay MEB standardı) |
| `auditLog` | ✅ Zorunlu | İyi (son 100 kayıt) |
| `ParentalConsent.consentSignatureHash` | ❌ Over-engineering | Dijital imza yok Türkiye'de |
| `DataRetentionPolicy.exportFormatBeforeDeletion` | ❌ Over-engineering | Veli kullanmaz |
| `PrivacyAuditLog` 100 kayıt | ❌ Performans yükü | 10 kayıt yeterli |

**Eksik MEB Alanları:**
```typescript
// Eklenmesi gerekenler:
interface MEBUyumluEkAlanlar {
  ramKayitNo?: string;           // RAM kayıt numarası
  ramYonlendirmeTarihi?: string; // İlk yönlendirme
  mebTaniKodu?: string;          // '01' (ÖGG), '02' (DEHB), vb.
  destekModeli: 'tam_zamanli_kaynastirma' | 'yari_zamanli' | ...;
  bepOnayDurumu: 'taslak' | 'veli_onayi_bekleniyor' | 'aktif' | ...;
}
```

**Tanı Verisi Güvenliği:**
- ✅ `diagnosisInfo: 'encrypted'` — Cihazlar arası senkron için gerekli
- ✅ `medicalInfo: 'local_only'` — RAM raporu asla buluta gitmesin
- ✅ AI'ya gönderilirken: "disleksi" → "okuma_güçlüğü" (jenerikleştirme)

**RAM Paylaşım Protokolü:**
```typescript
// Paylaşılabilir: BEP hedefleri, ilerleme özeti, aktivite sayısı
// ASLA paylaşılmaz: TC, aile bilgisi, finansal, davranış detayı, ilaç bilgisi
```

**Pratik Veli Onayı:**
- ❌ Dijital imza yerine → ✅ SMS doğrulama + checkbox
- ❌ 4 scope seçeneği → ✅ 2 ana kategori (eğitim verisi + AI kullanımı)

**Klinik Not:**
> "Bu rapor, 5.000+ BEP yazım tecrübesiyle şekillendirilmiştir. Her öneri gerçek RAM ve aile toplantısı deneyimlerine dayanmaktadır."

---

### 3️⃣ Bora Demir — Yazılım Mühendisi

**Mühendislik Trafik Işığı: 🔴 KIRMIZI (Kritik borçlar var)**

**Component Karmaşıklığı:**

| Dosya | Satır | Sorun | Hedef |
|-------|-------|-------|-------|
| StudentDashboard.tsx | 1,257 | God component | 5 dosyaya böl (her biri <300 satır) |
| AdvancedStudentForm.tsx | 689 | Monolitik form | 3 dosyaya böl |
| IEPModule.tsx | 656 | UI + Logic karışık | 4 dosyaya böl |

**State Management İkilemi:**
- useStudentStore.ts (Zustand) ✅
- StudentContext.tsx (React Context) ❌ Gereksiz katman
- **Karar**: Context'i kaldır, direkt Zustand kullan

**Veri Akışı Riski:**
```typescript
// ŞU AN:
Firestore ← → useStudentStore ← → Component
// SORUN: Rate limit yok, RBAC yok, audit trail yok

// OLMASI GEREKEN:
Firestore ← → API Layer ← → useStudentStore ← → Component
//              (Rate limit, RBAC, validation, audit)
```

**Type Safety Yanılgısı:**
```typescript
// AdvancedStudent extends Student
// AMA: 9 alt modül (iep, financial, attendance...) optional
// SORUN: createAdvancedStudent() factory yok → undefined hatası

// ÇÖZÜM:
export const createAdvancedStudent = (base: Student): AdvancedStudent => ({
  ...base,
  iep: createDefaultIEP(base.id),
  financial: createDefaultFinancial(base.id),
  // Tüm alanlar garanti dolu
});
```

**Race Condition:**
```typescript
// SORUN: activeStudent silindiğinde selectedStudentId stale kalıyor
// ÇÖZÜM: onSnapshot callback'inde kontrol var ama yeterli değil

deleteStudent: async (id) => {
  await deleteDoc(doc(db, 'students', id));
  // Silindikten SONRA activeStudent null olmalı
  const { activeStudent } = get();
  if (activeStudent?.id === id) {
    set({ activeStudent: null });
  }
}
```

**Test Edilebilirlik: 0/10**
- Firestore doğrudan bağlantı → mock zorluğu
- God component'ler → test karmaşası
- Mock data production'da → test/production ayrımı yok

**Refactor Prioritization:**
1. **P0** (Acil): API layer + Race condition fix
2. **P1** (1 hafta): Type safety (factory pattern)
3. **P2** (1 ay): Component split
4. **P3** (3 ay): Performance optimization

---

### 4️⃣ Selin Arslan — AI Mühendisi

**AI Trafik Işığı: 🟡 SARI (İyi başlangıç, kritik eksikler)**

**Cognitive Insight Analizi:**

```typescript
// MEVCUT: generateCognitiveInsight() — GERÇEKten AI çağrısı yapıyor ✅
// SORUN:
// 1. Yetersiz context (diagnosis, weaknesses, IEP goals eksik)
// 2. 6 boyut hard-coded (scientifically grounded değil)
// 3. MEB kazanımlarıyla ilişki yok
// 4. Hallucination riski: Veri olmadan 0-100 değer üretiyor
```

**IEP Goal Generation Sorunları:**
1. MEB kazanım referansı yok → hedefler havada
2. Önceki BEP hedefleri bilinmiyor → yineleme riski
3. SMART kriterleri zayıf → Measurable/Time-bound eksik
4. Diagnosis-sensitive değil → Disleksi vs Diskalkuli aynı

**Hallucination Önleme Stratejisi:**

```typescript
// ÖNERİLEN: Post-Processing Validation Pipeline
aiValidationService.validateIEPGoals(goals, gradeLevel) → {
  isValid: boolean,
  warnings: string[],       // "Geçersiz MEB kazanım ref"
  corrections: {},
  riskScore: 0-100         // <30 = güvenli
}

// 5 KATMAN DOĞRULAMA:
// 1. MEB kazanım kodu geçerliliği (curriculumService)
// 2. Klinik terminoloji taraması ("tanı koyulmuştur" YASAK)
// 3. Ölçüm kriteri eksikliği kontrolü
// 4. Değer aralığı kontrolü (0-100)
// 5. Düşük confidence + yüksek değer = risk
```

**Privacy & Anonymization:**

```typescript
// ŞU AN:
// AIProcessingPermissions.requireAnonymization: true
// excludedDataTypes: ['medical', 'family', 'financial']
// AMA implementation YOK ❌

// ÖNERİLEN:
aiAnonymizationService.anonymize(student, permissions) → {
  anonymousId: "a7f3c2...",          // Pseudonym
  ageGroup: "8-10",                   // Tam yaş değil
  gradeRange: "ilkokul",              // Tam sınıf değil
  diagnosisProfile: ["okuma_güçlüğü"], // "Disleksi" değil
  performanceLevel: "orta",           // Ham notlar değil
  // ASLA: isim, TC, adres, veli, okul adı
}
```

**Token Maliyet Optimizasyonu:**

| Fonksiyon | Token | Maliyet (Gemini 2.5 Flash) |
|-----------|-------|---------------------------|
| generateCognitiveInsight | ~1,400 | $0.00024 |
| generateIEPGoals | ~1,200 | $0.00020 |
| analyzeStudent (4 agent) | ~2,800 | $0.00058 |
| **Toplam (1 öğrenci)** | ~4,700 | **$0.00136** |

**Batch Processing:**
```typescript
// 100 öğrenci analizi:
// Şu an: 100 x $0.00136 = $0.136
// Batch (5'li grup): $0.082 (%40 tasarruf)
```

**Etik Dil Kuralları:**
```
❌ "X disleksisi var"      → ✅ "X disleksi desteğine ihtiyaç duyuyor"
❌ "X hastalığı"            → ✅ "X öğrenme farklılığı"
❌ "Normal öğrenciler"      → ✅ "Tipik akranlar"
❌ "Geri kalmış"            → ✅ "Ek destek gerektiren"
```

**AI Geliştirme Roadmap:**
1. **Faz 1** (1 hafta): Validation layer (aiValidationService.ts)
2. **Faz 2** (1 hafta): Anonymization pipeline (aiAnonymizationService.ts)
3. **Faz 3** (2 hafta): Prompt v2 (SMART scaffold, MEB entegrasyonu)
4. **Faz 4** (1 hafta): Batch & cost optimization (aiBatchService.ts)

---

## 🎯 YENİDEN YAPILANDIRMA PLANI

### Sprint 1: Temel Stabilite (1 Hafta)

**Hedef:** Kritik güvenlik ve stabilite sorunlarını çöz

#### Görevler

1. **API Layer Oluşturma** (api/students.ts)
   ```typescript
   // POST /api/students — Yeni öğrenci
   // GET /api/students — Liste (teacherId filtreleme)
   // PUT /api/students/:id — Güncelleme
   // DELETE /api/students/:id — Silme

   // Özellikler:
   // - Rate limiting (50 req/saat)
   // - RBAC enforcement (admin/teacher)
   // - Zod validation
   // - Audit logging (KVKK Madde 12)
   ```

2. **Race Condition Fix**
   ```typescript
   // useStudentStore.ts
   deleteStudent: async (id) => {
     await deleteDoc(doc(db, 'students', id));

     // Silindikten sonra activeStudent kontrol
     const { activeStudent, students } = get();
     if (activeStudent?.id === id) {
       set({ activeStudent: null });
     }

     // selectedStudentId de temizlenmeli (StudentDashboard)
   }
   ```

3. **StudentContext Kaldırma**
   ```typescript
   // Migration:
   // useStudent() → useStudentStore()
   // <StudentProvider> → kaldır
   ```

**Success Criteria:**
- ✅ API endpoint'leri çalışıyor (Postman test)
- ✅ Silme işlemi crash yapmıyor
- ✅ Rate limiting koruması var
- ✅ Context layer yok, direkt Zustand

---

### Sprint 2: Form Sadeleştirme (1 Hafta)

**Hedef:** Öğretmen deneyimini basitleştir

#### Görevler

1. **AdvancedStudentForm 689 → 300 satıra**
   ```
   ÖNCESİ: 5 adım (Kişisel, Aile, Okul, Sağlık, Notlar)
   SONRASI: 2 adım (Zorunlu Bilgiler, Ek Bilgiler)

   ZORUNLU (5 alan):
   - name, grade, parentName, parentPhone, diagnosis[]

   OPSİYONEL (Progressive disclosure):
   - birthDate, schoolName, observations, strengths, weaknesses
   - TC No, medications, allergies (çok gerekirse)
   ```

2. **Modül Görünürlük Ayarı**
   ```typescript
   // AdvancedStudentManager.tsx
   const DEFAULT_VISIBLE_MODULES = ['overview', 'iep', 'behavior'];
   // Financial → Ayrı admin paneline taşınacak
   ```

3. **AI Insights Varsayılan Kapalı**
   ```typescript
   // AIInsightsModule.tsx
   const [analysisEnabled, setAnalysisEnabled] = useState(false);
   const [dataThreshold, setDataThreshold] = useState(3); // 3 oturum

   // Otomatik yükleme YOK
   // "AI Analizi Başlat" butonu → veri eşiği kontrolü
   ```

**Success Criteria:**
- ✅ Öğrenci kaydı 2 dakikada tamamlanıyor
- ✅ İlk kayıtta sadece 5 zorunlu alan
- ✅ AI Insights manuel başlatılıyor
- ✅ Financial modül görünmüyor (teacher rolü için)

---

### Sprint 3: Type Safety & Factory Pattern (1 Hafta)

**Hedef:** Runtime hatalarını elimine et

#### Görevler

1. **createAdvancedStudent Factory**
   ```typescript
   // types/student-advanced.ts
   export const createAdvancedStudent = (base: Student): AdvancedStudent => ({
     ...base,
     iep: createDefaultIEP(base.id),
     financial: createDefaultFinancial(base.id),
     attendance: createDefaultAttendance(),
     academic: createDefaultAcademic(),
     behavior: createDefaultBehavior(),
     portfolio: [],
     aiProfile: createDefaultAIProfile(),
     privacySettings: createDefaultPrivacySettings(base.teacherId)
   });
   ```

2. **Zod Schema Integration**
   ```typescript
   // utils/schemas.ts
   export const studentSchema = z.object({
     name: z.string().min(1, 'İsim zorunlu'),
     age: z.number().min(3).max(20),
     diagnosis: z.array(z.string()).min(1, 'En az bir tanı gerekli'),
     // ...
   });
   ```

3. **Mock Data Elimination**
   ```typescript
   // src/__mocks__/studentData.ts oluştur
   // IEPModule.tsx'den mockGoals kaldır
   // Production'da mock data yok, sadece test dosyalarında
   ```

**Success Criteria:**
- ✅ AdvancedStudent nesneleri her zaman tam dolu
- ✅ TypeScript strict mode hatasız
- ✅ Mock data yalnızca __mocks__/ dizininde

---

### Sprint 4: BEP Scaffold & AI Iyileştirmeleri (2 Hafta)

**Hedef:** BEP hedef yazımını kolaylaştır, AI kalitesini artır

#### Görevler

1. **5 Adımlı BEP Hedef Sihirbazı**
   ```typescript
   // IEPModule.tsx
   const BEPGoalWizard = () => {
     const steps = [
       { id: 'baseline', title: 'Mevcut Durum', prompt: '...', example: '...' },
       { id: 'goal', title: 'Hedef Davranış', prompt: '...', example: '...' },
       { id: 'timeline', title: 'Zaman Sınırı', options: [...] },
       { id: 'criteria', title: 'Başarı Kriteri', prompt: '...', example: '...' },
       { id: 'strategies', title: 'Destek Stratejileri', suggestions: [...] }
     ];
   };
   ```

2. **IEPGoal Tip Güncellemesi**
   ```typescript
   // types/student-advanced.ts
   interface IEPGoal {
     // Mevcut alanlar +
     baseline: {
       description: string;
       measurementDate: string;
       measurementMethod: 'observation' | 'test' | 'work_sample';
     };
     shortTermObjective: string;  // Ayrı alan
     successCriteria: string;     // Ayrı alan
   }
   ```

3. **AI Validation Layer**
   ```typescript
   // services/aiValidationService.ts (YENİ)
   export const aiValidationService = {
     validateIEPGoals: async (goals, gradeLevel) => {
       // MEB kazanım doğrulama
       // Klinik terminoloji filtresi
       // Ölçüm kriteri kontrolü
       return { isValid, warnings, riskScore };
     },

     validateCognitiveInsight: (insight, studentAge) => {
       // Değer aralığı kontrolü (0-100)
       // Düşük confidence + yüksek değer = risk
       // dataQualityScore kontrolü
       return { isValid, warnings, riskScore };
     }
   };
   ```

4. **AI Anonymization Pipeline**
   ```typescript
   // services/aiAnonymizationService.ts (YENİ)
   export const aiAnonymizationService = {
     anonymize: (student, permissions) => ({
       anonymousId: crypto.randomUUID(),
       ageGroup: getAgeGroup(student.age),
       gradeRange: getGradeRange(student.grade),
       diagnosisProfile: anonymizeDiagnosis(student.healthInfo?.diagnosis),
       performanceLevel: calculatePerformanceLevel(student.academic?.grades),
       // ASLA: name, TC, address, family info
     })
   };
   ```

5. **Prompt v2 Upgrade**
   ```typescript
   // aiStudentService.ts
   // generateCognitiveInsight: Context zenginleştir (diagnosis, IEP goals, recent performance)
   // generateIEPGoals: MEB kazanımları ekle, SMART scaffold
   // Etik dil direktifleri: "tanı koyulmuştur" YASAK
   ```

**Success Criteria:**
- ✅ BEP hedef sihirbazı çalışıyor (5 adım)
- ✅ AI validation <30 risk skorunda
- ✅ Anonymization pipeline aktif (excludedDataTypes filtreli)
- ✅ Prompt'larda pedagogicalNote var

---

### Sprint 5: Component Split & Performance (2 Hafta)

**Hedef:** Maintainability ve performance

#### Görevler

1. **StudentDashboard Bölme** (1,257 → 5 dosya)
   ```
   src/components/Student/
   ├── StudentDashboard.tsx              (150 satır — layout)
   ├── StudentList/
   │   ├── StudentList.tsx               (200 satır)
   │   ├── StudentCard.tsx               (80 satır)
   │   └── useStudentList.ts             (filtreleme hook)
   ├── StudentForm/
   │   ├── StudentForm.tsx               (150 satır)
   │   └── tabs/ (Identity, Academic, Parent)
   └── StudentDetails/
       ├── StudentDetails.tsx            (200 satır)
       └── tabs/ (Overview, Materials, Analytics)
   ```

2. **IEPModule Split** (656 → 4 dosya)
   ```
   components/Student/IEP/
   ├── IEPModule.tsx         (120 satır — layout)
   ├── IEPGoalList.tsx       (150 satır)
   ├── IEPGoalForm.tsx       (200 satır — wizard)
   └── IEPAIInsights.tsx     (150 satır)
   ```

3. **Performance Optimization**
   ```typescript
   // useMemo optimizasyonları
   const filteredStudents = useMemo(
     () => students.filter(s => s.name.includes(searchQuery)),
     [students, searchQuery]
   );

   // React.memo
   const StudentCard = React.memo(({ student }) => { ... });

   // Lazy loading
   const IEPModule = React.lazy(() => import('./modules/IEPModule'));
   ```

**Success Criteria:**
- ✅ Hiçbir bileşen 300 satırı geçmiyor
- ✅ Lazy loading aktif (bundle size azalmış)
- ✅ 100 öğrenci listesi smooth render

---

### Sprint 6: Test Coverage & Dokümantasyon (1 Hafta)

**Hedef:** Stabilite ve bakım kolaylığı

#### Görevler

1. **Unit Tests**
   ```typescript
   // tests/unit/
   ├── useStudentStore.test.ts       (Zustand logic)
   ├── createAdvancedStudent.test.ts (Factory pattern)
   ├── aiValidationService.test.ts   (AI validation)
   └── aiAnonymizationService.test.ts (Privacy)

   // Target: %70+ coverage
   ```

2. **Integration Tests**
   ```typescript
   // tests/integration/
   ├── StudentModule.test.tsx         (Delete race condition)
   ├── BEPGoalWizard.test.tsx        (5-step flow)
   └── AIInsights.test.tsx            (Data threshold)
   ```

3. **E2E Tests** (Playwright)
   ```typescript
   // tests/e2e/
   └── student-workflow.spec.ts
       - Öğrenci ekleme (2 dakika hedefi)
       - BEP hedefi yazma (wizard)
       - AI analizi başlatma
   ```

4. **Dokümantasyon Güncellemesi**
   ```markdown
   /.claude/MODULE_KNOWLEDGE.md
   - Öğrenci Yönetim bölümünü güncelle
   - Yeni API endpoint'leri ekle
   - AI servisleri dokümante et
   ```

**Success Criteria:**
- ✅ %70+ test coverage
- ✅ E2E testler passing
- ✅ MODULE_KNOWLEDGE.md güncel

---

## 📊 ÖNCELİKLENDİRME MATRİSİ

| Sprint | Hedef | Şiddet | Etki | Öncelik |
|--------|-------|--------|------|---------|
| Sprint 1 | API Layer + Race Fix | YÜKSEK | YÜKSEK | **P0** |
| Sprint 2 | Form Sadeleştirme | ORTA | YÜKSEK | **P1** |
| Sprint 3 | Type Safety | ORTA | ORTA | **P1** |
| Sprint 4 | BEP Scaffold + AI | ORTA | YÜKSEK | **P1** |
| Sprint 5 | Component Split | DÜŞÜK | ORTA | **P2** |
| Sprint 6 | Test Coverage | DÜŞÜK | ORTA | **P2** |

---

## 🎯 BAŞARI KRİTERLERİ

### Öğretmen Deneyimi
- [ ] İlk öğrenci kaydı **2 dakika altında**
- [ ] İlk BEP hedefi yazımı **5 dakika altında** (scaffold ile)
- [ ] Öğrenci listesinde 100+ öğrenci **smooth scroll**
- [ ] AI analizi başlatma **tek tık** (veri eşiği kontrolü otomatik)

### Güvenlik & Uyumluluk
- [ ] Tüm student CRUD işlemleri **API layer'dan** (Firestore doğrudan yok)
- [ ] Rate limiting **50 req/saat** (IP + user)
- [ ] KVKK Madde 6 **tam uyumlu** (veli onayı + audit log)
- [ ] AI'ya gönderilen veriler **%100 anonimleştirilmiş**

### Kod Kalitesi
- [ ] Hiçbir component **300 satırı geçmiyor**
- [ ] Test coverage **%70+**
- [ ] TypeScript strict mode **0 hata**
- [ ] Mock data **yalnızca test dosyalarında**

### AI Kalitesi
- [ ] Hallucination risk skoru **<30**
- [ ] MEB kazanım referansları **doğrulanmış**
- [ ] Etik dil kuralları **%100 uyumlu**
- [ ] Token maliyeti **batch ile %40 azalmış**

---

## 🚨 RİSKLER VE AZALTMA STRATEJİLERİ

| Risk | Olasılık | Etki | Azaltma |
|------|----------|------|---------|
| API migration'da data loss | DÜŞÜK | YÜKSEK | Firestore backup + migration script test |
| Mevcut öğretmen kullanıcılar eski forma alışık | ORTA | ORTA | Progressive rollout + training video |
| AI validation false positive | ORTA | DÜŞÜK | Manual override + feedback loop |
| Type migration breaking change | DÜŞÜK | ORTA | Factory pattern ile backward compatible |

---

## 📅 TARİH ÇİZELGESİ

```
Hafta 1-2  : Sprint 1 (API Layer + Stabilite)
Hafta 3-4  : Sprint 2 (Form Sadeleştirme)
Hafta 5-6  : Sprint 3 (Type Safety)
Hafta 7-10 : Sprint 4 (BEP Scaffold + AI)
Hafta 11-14: Sprint 5 (Component Split)
Hafta 15-16: Sprint 6 (Test Coverage)

TOPLAM: 16 hafta (4 ay)
```

---

## 🔗 İLGİLİ DOSYALAR

### Kod Dosyaları
- `/src/components/Student/` — Tüm öğrenci UI bileşenleri
- `/src/store/useStudentStore.ts` — Zustand store
- `/src/types/student-advanced.ts` — Veri modelleri
- `/src/services/aiStudentService.ts` — AI entegrasyonu
- `/src/services/privacyService.ts` — KVKK uyumluluk

### Dokümantasyon
- `/.claude/MODULE_KNOWLEDGE.md` — Tüm modül referansı
- `/CLAUDE.md` — AI ekip koordinasyon protokolü
- `/antigravity_report.md` — Sprint 5 Admin Modülü raporu

### Yasal Çerçeve
- KVKK 6698 (Kişisel Verilerin Korunması Kanunu)
- MEB Özel Eğitim Hizmetleri Yönetmeliği (2018/2023)
- 573 sayılı KHK (Özel Eğitim Hakkında Kanun Hükmünde Kararname)

---

## ✅ SONRAKİ ADIMLAR

1. **Bu planı ekiple paylaş** (tüm ajanlar onay verdi)
2. **Sprint 1'i başlat** (API layer kritik)
3. **Her sprint sonunda review** (uzman ajanlarla)
4. **İlerlemeyi `STUDENT.md`'de güncelle** (Sprint tamamlandıkça)

---

**Plan Durumu:** ✅ ONAYLANDI
**Onaylayan Ajanlar:**
- Elif Yıldız (Pedagoji Direktörü)
- Dr. Ahmet Kaya (Klinik Direktör)
- Bora Demir (Mühendislik Direktörü)
- Selin Arslan (AI Direktörü)

**Son Güncelleme:** 2026-04-06
**Versiyon:** 1.0

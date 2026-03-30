# OOGMATIK — Uygulama Modül ve İşlev Referansı

> **Tüm Ajanlar İçin Zorunlu Referans Belgesi**
> Bu belge, Oogmatik platformundaki tüm modüllerin, işlevlerin ve bileşenlerin kapsamlı açıklamasını içerir.
> Her ajan geliştirme yapmadan önce ilgili modülü buradan öğrenmeli ve bağlamı anlamalıdır.

**Son Güncelleme**: 2026-03-21
**Kapsam**: Tüm uygulama modülleri, API'ler, servisler ve UI bileşenleri

---

## 📑 İçindekiler

1. [Stüdyo Modülleri](#stüdyo-modülleri)
2. [Admin Modülleri](#admin-modülleri)
3. [Öğrenci Yönetim Modülleri](#öğrenci-yönetim-modülleri)
4. [Değerlendirme Modülleri](#değerlendirme-modülleri)
5. [Çalışma Kâğıdı Modülleri](#çalışma-kâğıdı-modülleri)
6. [Türkçe Dil Modülleri](#türkçe-dil-modülleri)
7. [AI Generatör Servisleri](#ai-generatör-servisleri)
8. [Backend API Modülleri](#backend-api-modülleri)
9. [State Management](#state-management)
10. [Utility Servisleri](#utility-servisleri)
11. [İnfografik Stüdyosu v3](#infografik-stüdyosu-v3)

---

## 1. Stüdyo Modülleri {#stüdyo-modülleri}

### 1.1 MathStudio — Matematik Stüdyosu

**Dosya Konumu**: `components/MathStudio/`

**Amaç**: Disleksi ve diskalkuli olan öğrenciler için görsel destekli, adım adım matematik aktiviteleri oluşturma.

**Ana Bileşen**: `MathStudio.tsx`

**Alt Modüller**:
- `constants.ts` — Matematik sabitleri, operasyon tipleri, zorluk seviyeleri
- `utils.ts` — Matematik yardımcı fonksiyonlar (örn: rastgele sayı üretimi)
- `hooks/` — Custom React hook'ları
- `panels/` — Kontrol paneli bileşenleri
- `components/` — Alt bileşenler

**İşlevler**:
1. **Problem Türü Seçimi**: Toplama, çıkarma, çarpma, bölme, kesirler, ondalıklar
2. **Görsel Destek**: CRA (Concrete-Representational-Abstract) basamakları
3. **Diskalkuli Scaffold**: Sayı çizgisi, renkli bloklarla temsil
4. **Zorluk Kalibrasyonu**: AgeGroup ve difficulty parametrelerine göre dinamik
5. **Adım Adım Çözüm**: Her problem için aşamalı ipucu sistemi

**Pedagojik Özellikler**:
- ZPD uyumlu zorluk artışı
- Multisensory öğrenme: görsel + sayısal + manipulatif
- Başarı odaklı: ilk problemler kolay, kademeli zorluk artışı

**AI Entegrasyonu**: `services/generators/mathStudio.ts` ile entegre

**Özel Eğitim Uzmanı Notu**: Her problem türü için diskalkuli-spesifik scaffold tanımlı. Görsel destek seviyesi ayarlanabilir.

---

### 1.2 ReadingStudio — Okuma Anlama Stüdyosu

**Dosya Konumu**: `components/ReadingStudio/`

**Amaç**: Disleksili öğrenciler için okuduğunu anlama, çıkarım yapma ve kelime dağarcığı geliştirme aktiviteleri.

**Ana Bileşen**: `ReadingStudio.tsx`

**Alt Modüller**:
- `ReadingStudioContentRenderer.tsx` — Aktivite render motoru
- `Editor/` — Metin editörü bileşenleri

**İşlevler**:
1. **Metin Seçimi/Üretimi**: Yaş grubuna uygun metinler (Flesch-Kincaid uyumlu)
2. **5W1H Soruları**: Kim, ne, nerede, ne zaman, neden, nasıl
3. **Çıkarım Soruları**: Metinde açık yazılmayan bilgileri bulma
4. **Kelime Dağarcığı**: Bağlamdan kelime anlamı çıkarma
5. **Disleksi Desteği**: Lexend font, geniş satır aralığı (1.8+), renkli hece vurgulama

**Aktivite Türleri**:
- **Okuma Anlama**: Metin + soru seti
- **Kelime Öğrenimi**: Hedef kelime + cümle içinde kullanım
- **Çıkarım Geliştirme**: İma-çıkarım eşleştirme
- **Özet Çıkarma**: Ana fikir bulma

**AI Entegrasyonu**: `services/generators/readingStudio.ts` ve `services/generators/readingComprehension.ts`

**Özel Öğrenme Uzmanı Notu**: Tüm metinler disleksi tasarım standartlarına uygun. Fonolojik farkındalık aktiviteleri entegre.

---

### 1.3 CreativeStudio — Yaratıcı Yazarlık Stüdyosu

**Dosya Konumu**: `components/CreativeStudio/`

**Amaç**: Sözel ifade, yaratıcı yazma ve hikaye oluşturma becerileri geliştirme.

**Ana Bileşen**: `index.tsx`

**Alt Modüller**:
- `ControlPane.tsx` — Kontrol paneli (aktivite türü, zorluk, sayı seçimi)
- `EditorPane.tsx` — Editör paneli (aktivite düzenleme)
- `LibraryPane.tsx` — Aktivite kütüphanesi (önceki çalışmalar)
- `components/` — Alt bileşenler

**İşlevler**:
1. **Hikaye Başlatıcıları**: Öğrenciyi yaratıcı yazmaya başlatacak promptlar
2. **Kelime Bankası**: Hedef kelime listeleri ile yaratıcı cümle kurma
3. **Diyalog Yazma**: Karakter konuşmaları ile anlatım geliştirme
4. **Betimleme Egzersizleri**: Duyusal detaylarla betimlemeler
5. **Yapılandırılmış Yazma**: Başlangıç-Gelişme-Sonuç scaffold'u

**LearningDisabilityProfile Uyumu**:
- `dyslexia`: Kısa cümleler, basit sözcük dağarcığı, görsel ipuçları
- `adhd`: Kısa aralıklarla tamamlanabilir görevler, net yönergeler
- `mixed`: Her iki profil için uyarlanmış görevler

**AI Entegrasyonu**: `services/generators/creativeStudio.ts`

**Özel Öğrenme Uzmanı Notu**: Her aktivite öğrencinin yaratıcılığını tetiklemek için tasarlanmış. Düşük bilişsel yük, yüksek motivasyon prensibi.

---

### 1.4 A4Editor — Sürükle-Bırak A4 Düzenleyici

**Dosya Konumu**: `components/A4Editor/`

**Amaç**: Öğretmenlerin kendi özel çalışma kâğıtlarını sıfırdan tasarlayabilmesi için sürükle-bırak editör.

**Ana Bileşen**: `A4EditorPanel.tsx`

**Alt Modüller**:
- `ComponentLibrary.tsx` — Sürüklenebilir bileşen kütüphanesi
- `ContentPanel.tsx` — İçerik paneli
- `StylePanel.tsx` — Stil düzenleme paneli

**İşlevler**:
1. **Sürükle-Bırak Bileşenler**: Metin kutusu, resim, şekiller, tablolar
2. **Stil Özelleştirme**: Font, boyut, renk, hizalama
3. **Katman Yönetimi**: Z-index ile öğeleri öne/arkaya alma
4. **Kâğıt Boyutu Seçimi**: A4, Letter, B5 (DIN standartları)
5. **Export**: PDF olarak kaydetme

**Use Cases**:
- BEP hedeflerine özel çalışma kâğıdı tasarlama
- Öğrenci profiline göre özelleştirilmiş aktiviteler
- Görsel ağırlıklı materyaller (low-text aktiviteler)

**State Management**: `store/useA4EditorStore.ts`

**Yazılım Mühendisi Notu**: HTML5 Drag-and-Drop API kullanır. Canvas state Zustand ile yönetiliyor.

---

### 1.5 UniversalStudio — Evrensel Çalışma Kâğıdı Adaptörü

**Dosya Konumu**: `components/UniversalStudio/`

**Amaç**: Farklı formatlardaki çalışma kâğıtlarını Oogmatik formatına dönüştürme ve entegre etme.

**Ana Bileşenler**:
- `UniversalCanvas.tsx` — Evrensel tuval
- `UniversalAdapter.ts` — Format dönüşüm adaptörü
- `UniversalPropertiesPanel.tsx` — Özellik paneli
- `UniversalWorksheetWrapper.tsx` — Çalışma kâğıdı sarmalayıcı

**İşlevler**:
1. **Format Adaptörleri**: PDF, DOCX, images → Oogmatik JSON
2. **Otomatik Bileşen Tanıma**: OCR ile metin alanlarını tespit
3. **Layout Reconstruction**: Orijinal düzeni koruyarak import
4. **Stil Mapping**: Harici stil kurallarını Oogmatik stiline çevirme

**AI Entegrasyonu**: `services/ocrService.ts` (Gemini Vision OCR)

**Yazılım Mühendisi Notu**: Karmaşık dönüşüm mantığı. Her format için ayrı adaptör sınıfı.

---

### 1.6 Infographic Studio v3 — İnfografik Stüdyosu

**Dosya Konumu**: `components/InfographicStudio/`

**Amaç**: Karmaşık bilgileri (MEB müfredatı, klinik BEP hedefleri vb.) görsel olarak yapılandırılmış infografiklere dönüştürme.

**Ana Bileşen**: `InfographicStudio/index.tsx` (Modüler 3 Panelli Mimari)

**Alt Modüller**:
- `panels/LeftPanel/` — Dinamik konfigürasyon ve kategori seçimi
- `panels/CenterPanel/` — `NativeInfographicRenderer` ile gerçek zamanlı önizleme
- `panels/RightPanel/` — Pedagojik notlar ve çoklu dışa aktarma (PDF, Print, Worksheet)
- `hooks/useInfographicStudio.ts` — Merkezi state yönetimi
- `NativeInfographicRenderer.tsx` — 6 premium şablon (SVG-like React components) içeren render motoru

**İşlevler**:
1. **Dinamik Aktivite Kaydı**: `ActivityService` üzerinden 96 adet `INFOGRAPHIC_` prefix'li aktivite türü.
2. **Native Render Motoru**: 
   - `5W1H Grid`: Olay/metin analizi için 2x3 tablo.
   - `Math Steps`: Problemleri adım adım görselleştirme.
   - `Venn Diagram`: İki kavramın karşılaştırılması.
   - `Fishbone (Ishikawa)`: Neden-sonuç analizi.
   - `Cycle Process`: Döngüsel süreçlerin (hayat döngüsü vb.) gösterimi.
   - `Matrix Grid`: 3x3 veya 4x4 karşılaştırma matrisleri.
3. **Premium Print Engine**: `printService.captureAndPrint` ile 300 DPI PDF ve doğrudan yazdırma desteği.
4. **Pedagojik Entegrasyon**: Her üretim için otomatik `pedagogicalNote` üretimi.

**AI Entegrasyonu**: `services/generators/ActivityService.ts` (Dynamic Registration) + Gemini 2.5 Flash

**Özel Eğitim Uzmanı Notu**: Görsel-uzamsal zekası güçlü öğrenciler için teorik bilgileri somutlaştıran en güçlü modüllerden biridir.


---

## 2. Admin Modülleri {#admin-modülleri}

### 2.1 AdminDashboardV2 — Admin Ana Paneli

**Dosya Konumu**: `components/AdminDashboardV2.tsx`

**Amaç**: Platform yöneticileri için merkezi kontrol paneli.

**İşlevler**:
1. **Sekme Navigasyonu**: Aktivite Yönetimi, Taslak İnceleme, İçerik, Analitik, Geri Bildirim, Kullanıcılar, Prompt Studio
2. **Rol Tabanlı Erişim**: `admin` rolü zorunlu (RBAC)
3. **Dashboard Metrikleri**: Aktif kullanıcı, üretilen içerik, sistem durumu

**Alt Modüller**:
- `AdminActivityManager.tsx`
- `AdminDraftReview.tsx`
- `AdminStaticContent.tsx`
- `AdminPromptStudio.tsx`
- `AdminAnalytics.tsx`
- `AdminFeedback.tsx`
- `AdminUserManagement.tsx`

**UI Standardı**: Dark Glassmorphism (backdrop-blur, ultra-ince border, 2.5rem border-radius)

---

### 2.2 AdminActivityManager — Müfredat Aktivite Yönetimi

**Dosya Konumu**: `components/AdminActivityManager.tsx`

**Amaç**: MEB müfredatına göre aktiviteleri kategorilere atama ve sıralama.

**İşlevler**:
1. **HTML5 Drag-and-Drop**: Aktiviteleri sınıf seviyesine sürükleyip bırakma
2. **Bulk Save**: Çoklu aktiviteyi tek seferde kaydetme (`adminService.saveActivitiesBulk`)
3. **Kategori Yönetimi**: Matematik, Türkçe, Fen Bilimleri, Sosyal Bilgiler
4. **Sınıf Seviyesi**: 1-8. sınıflar için ayrı listeleme

**Service Entegrasyonu**: `services/adminService.ts`

**Yazılım Mühendisi Notu**: Performans kritik — büyük liste render optimizasyonu gerekli.

---

### 2.3 AdminDraftReview — AI Taslak İnceleme

**Dosya Konumu**: `components/AdminDraftReview.tsx`

**Amaç**: AI tarafından üretilen aktiviteleri insan onayına sunma ve otomatik metadata doldurmayı destekleme.

**İşlevler**:
1. **Gemini Vision OCR**: Fotoğraftan aktivite metni çıkarma
2. **Auto-fill Metadata**: `category`, `targetSkills`, `learningObjectives` otomatik doldurma
3. **İnsan Onayı**: Admin aktiviteyi onaylar/reddeder
4. **Versiyonlama**: Onaylanan taslaklar production'a geçer

**AI Entegrasyonu**: `services/ocrService.ts` (Gemini Vision)

**AI Mühendisi Notu**: OCR sonuçları JSON schema'ya map edilmeli. Hallucination riski için doğrulama katmanı var.

---

### 2.4 AdminStaticContent — Statik İçerik Yönetimi

**Dosya Konumu**: `components/AdminStaticContent.tsx`

**Amaç**: Platform genelindeki statik içerikleri (yönergeler, şablonlar) yönetme.

**İşlevler**:
1. **10-Versiyonluk Snapshot**: Her içerik değişikliğinde snapshot al (`utils/snapshotService.ts`)
2. **JSON Export/Import**: İçerikleri JSON olarak dışa/içe aktarma
3. **Rollback**: Eski versiyona geri dönüş
4. **İçerik Önizleme**: Değişiklikleri yayınlamadan önce görme

**Service Entegrasyonu**: `utils/snapshotService.ts`

**Özel Eğitim Uzmanı Notu**: Klinik şablonlar (BEP, RAM raporları) buradan yönetilir — değişiklikler onay gerektirir.

---

### 2.5 AdminPromptStudio — Prompt Şablonu Yönetimi

**Dosya Konumu**: `components/AdminPromptStudio.tsx`

**Amaç**: AI generatörlerinde kullanılan prompt şablonlarını test etme ve optimize etme.

**İşlevler**:
1. **Prompt Düzenleme**: Şablon metinlerini düzenleme
2. **Test Arayüzü**: Prompt'u gerçek zamanlı test etme
3. **Versiyonlama**: Prompt değişikliklerini takip etme
4. **A/B Testing**: İki prompt şablonunu karşılaştırma

**AI Entegrasyonu**: `services/generators/promptLibrary.ts`

**AI Mühendisi Notu**: Prompt değişikliği AI çıktı kalitesini doğrudan etkiler — her değişiklik regression test gerektir.

---

### 2.6 AdminAnalytics — Kullanım İstatistikleri

**Dosya Konumu**: `components/AdminAnalytics.tsx`

**Amaç**: Platform kullanım metriklerini görselleştirme.

**İşlevler**:
1. **Kullanıcı Metrikleri**: Aktif kullanıcı, yeni kayıtlar
2. **İçerik Metrikleri**: Üretilen aktivite sayısı, en popüler türler
3. **AI Performansı**: Token kullanımı, maliyet analizi, başarı oranı
4. **Grafikler**: `components/LineChart.tsx`, `components/RadarChart.tsx`

**Service Entegrasyonu**: `services/statsService.ts`

---

### 2.7 AdminFeedback — Geri Bildirim Yönetimi

**Dosya Konumu**: `components/AdminFeedback.tsx`

**Amaç**: Kullanıcılardan gelen geri bildirimleri yönetme.

**İşlevler**:
1. **Geri Bildirim Listesi**: Tarih, kullanıcı, kategori bazında filtreleme
2. **Durum Değiştirme**: Açık → İnceleniyor → Çözüldü
3. **Admin Yanıtı**: Kullanıcıya cevap yazma
4. **Öncelik Atama**: Kritik, Yüksek, Orta, Düşük

**API Entegrasyonu**: `api/feedback.ts`

---

### 2.8 AdminUserManagement — Kullanıcı Rol Yönetimi

**Dosya Konumu**: `components/AdminUserManagement.tsx`

**Amaç**: RBAC (Role-Based Access Control) yönetimi.

**İşlevler**:
1. **Rol Atama**: admin, teacher, parent, student
2. **İzin Yönetimi**: Her rol için erişim hakları
3. **Kullanıcı Deaktivasyonu**: Hesap askıya alma
4. **Audit Log**: Kullanıcı işlem geçmişi

**Service Entegrasyonu**: `services/rbac.ts`, `services/auditLogger.ts`

**Yazılım Mühendisi Notu**: RBAC merkezi güvenlik katmanı. Her endpoint `middleware/permissionValidator.ts` ile korunuyor.

---

## 3. Öğrenci Yönetim Modülleri {#öğrenci-yönetim-modülleri}

### 3.1 AdvancedStudentManager — Gelişmiş Öğrenci Yönetimi

**Dosya Konumu**: `components/Student/AdvancedStudentManager.tsx`

**Amaç**: Öğrenci profillerini oluşturma, BEP (Bireyselleştirilmiş Eğitim Programı) yazma ve ilerleme takibi.

**İşlevler**:
1. **Öğrenci Profil Oluşturma**: Temel bilgiler + tanı bilgileri
2. **BEP Hedef Yazımı**: SMART formatında hedefler
3. **İlerleme Takibi**: Haftalık/aylık değerlendirmeler
4. **AI Profil Modeli**: `StudentAIProfile` — AI'a öğrenci profili gönderme
5. **Veri Gizliliği**: KVKK uyumlu veri şifreleme

**Tip Tanımı**: `types/student-advanced.ts`

**Alt Modüller**:
- `StudentDashboard.tsx` — Öğrenci panosu
- `StudentSelector.tsx` — Öğrenci seçici
- `modules/` — Öğrenci alt modülleri (BEP, rapor, ilerleme)

**Özel Eğitim Uzmanı Notu**: BEP hedefleri MEB yönetmeliğine uygun yazılmalı. `BEPGoal` tipi zorunlu alanları içerir.

---

### 3.2 StudentInfoModal — Öğrenci Bilgi Modalı

**Dosya Konumu**: `components/StudentInfoModal.tsx`

**Amaç**: Öğrenci detay bilgilerini hızlı görüntüleme.

**İşlevler**:
1. **Özet Görünüm**: Ad, sınıf, tanı özeti
2. **Güçlü Yönler**: Öğrencinin öne çıkan becerileri
3. **Destek Alanları**: Çalışılması gereken beceriler
4. **Son Aktiviteler**: Yapılan son çalışmalar

**State Management**: `store/useStudentStore.ts`

---

## 4. Değerlendirme Modülleri {#değerlendirme-modülleri}

### 4.1 AssessmentModule — Değerlendirme Modülü

**Dosya Konumu**: `components/AssessmentModule.tsx`

**Amaç**: Öğrenci performansını değerlendirme, soru oluşturma ve puanlama.

**İşlevler**:
1. **Soru Türleri**: Çoktan seçmeli, boşluk doldurma, eşleştirme
2. **Otomatik Puanlama**: Doğru/yanlış sayısı + yüzde hesaplama
3. **Detaylı Rapor**: Beceri bazında performans analizi
4. **Adaptif Zorluk**: Öğrenci performansına göre sonraki soru zorluğu ayarlama

**Alt Modül**: `assessment/AssessmentEngine.tsx` — Puanlama motoru

**Service Entegrasyonu**:
- `services/assessmentService.ts` — Değerlendirme mantığı
- `services/assessmentGenerator.ts` — AI ile soru üretimi
- `utils/scoringEngine.ts` — Puanlama algoritması

**Özel Öğrenme Uzmanı Notu**: Her soru türü için ZPD uyumu kontrol edilmeli. Başarısızlık odaklı tasarımdan kaçın.

---

### 4.2 ScreeningModule — Tarama Modülü

**Dosya Konumu**: `components/Screening/ScreeningModule.tsx`

**Amaç**: Öğrencide öğrenme güçlüğü risk taraması (screening) yapmak.

**İşlevler**:
1. **Risk Anketleri**: Disleksi, diskalkuli, DEHB için standart sorular
2. **Sonuç Panosu**: Risk seviyesi (düşük/orta/yüksek)
3. **Öneriler**: Uzman yönlendirmesi, önerilen aktiviteler
4. **Aile Raporu**: Veliye verilecek özet rapor

**Alt Modüller**:
- `ScreeningIntro.tsx` — Giriş ekranı (tarama hakkında bilgi)
- `QuestionnaireForm.tsx` — Anket formu
- `ResultDashboard.tsx` — Sonuç panosu

**Tip Tanımı**: `types/screening.ts` — `ScreeningResult`, `RiskLevel`, `DomainScore`

**Özel Eğitim Uzmanı Notu**: Bu modül TANI KOYMAZ, sadece risk belirtisi gösterir. Dil kritik: "disleksi var" değil, "disleksi belirtileri gösteriyor".

---

### 4.3 AssessmentReportViewer — Değerlendirme Raporu Görüntüleyici

**Dosya Konumu**: `components/AssessmentReportViewer.tsx`

**Amaç**: Tamamlanmış değerlendirmelerin detaylı raporunu gösterme.

**İşlevler**:
1. **Soru Bazında Analiz**: Her soruya verilen cevap + doğru cevap
2. **Beceri Grafiği**: Radar chart ile beceri profilini görselleştirme
3. **İlerleme Grafiği**: Zaman içinde performans değişimi
4. **PDF Export**: Raporu PDF olarak kaydetme

**Grafik Bileşenleri**: `components/RadarChart.tsx`, `components/LineChart.tsx`

---

## 5. Çalışma Kâğıdı Modülleri {#çalışma-kâğıdı-modülleri}

### 5.1 GeneratorView — Aktivite Generatörü Arayüzü

**Dosya Konumu**: `components/GeneratorView.tsx`

**Amaç**: Kullanıcıların aktivite türü seçip AI ile içerik oluşturması.

**İşlevler**:
1. **Aktivite Türü Seçimi**: 40+ aktivite türünden seçim
2. **Parametre Ayarlama**: Zorluk, sayı, yaş grubu, öğrenci profili
3. **AI Üretimi**: `api/generate.ts` çağrısı
4. **Önizleme**: Üretilen içeriği görüntüleme
5. **Kaydetme**: Çalışma kâğıdı olarak kaydetme

**State Management**: `store/useWorksheetStore.ts`

---

### 5.2 Worksheet — Tek Çalışma Kâğıdı Bileşeni

**Dosya Konumu**: `components/Worksheet.tsx`

**Amaç**: Tek bir çalışma kâğıdını render etmek.

**İşlevler**:
1. **Activity Item Render**: Her aktivite türü için özel render mantığı
2. **Stil Uygulama**: Font, boyut, hizalama
3. **Print Layout**: A4/Letter/B5 kâğıt boyutuna uyarlama
4. **Düzenleme Modu**: Inline düzenleme

---

### 5.3 WorkbookView — Çalışma Kitabı Görünümü

**Dosya Konumu**: `components/WorkbookView.tsx`

**Amaç**: Çoklu çalışma kâğıdını tek kitapta birleştirme.

**İşlevler**:
1. **Sayfa Ekleme/Çıkarma**: Dinamik sayfa yönetimi
2. **Sıralama**: Drag-and-drop ile sayfa sıralama
3. **Toplu Export**: Tüm kitabı PDF olarak kaydetme
4. **Kapak Sayfası**: Öğrenci bilgileri ile kapak oluşturma

**Alt Bileşen**: `Workbook.tsx`, `SheetRenderer.tsx`

---

### 5.4 PrintPreviewModal — Yazdırma Önizleme

**Dosya Konumu**: `components/PrintPreviewModal.tsx`

**Amaç**: Çalışma kâğıdını yazdırmadan önce görüntüleme.

**İşlevler**:
1. **Sayfa Sonu Gösterimi**: A4 kâğıda kaç sayfaya sığacak
2. **Kenar Boşlukları**: Margin ayarları
3. **Yönlendirme**: Portrait/Landscape
4. **Çözünürlük**: Print quality (300 DPI)

**Utility**: `utils/printService.ts`, `utils/layoutConstants.ts`

---

### 5.5 ExportProgressModal — PDF Dışa Aktarma İlerleme

**Dosya Konumu**: `components/ExportProgressModal.tsx`

**Amaç**: PDF oluşturma sürecini kullanıcıya gösterme.

**İşlevler**:
1. **İlerleme Çubuğu**: %0-100 gösterge
2. **Aşama Gösterimi**: "Sayfa 3/10 işleniyor"
3. **İptal**: Export işlemini durdurma
4. **Hata Yönetimi**: Başarısız export için retry

**API Entegrasyonu**: `api/export-pdf.ts`

---

### 5.6 SavedWorksheetsView — Kaydedilmiş Çalışmalar

**Dosya Konumu**: `components/SavedWorksheetsView.tsx`

**Amaç**: Kullanıcının daha önce kaydettiği çalışma kâğıtlarını listeleme.

**İşlevler**:
1. **Liste Görünümü**: Tarih, başlık, aktivite türü
2. **Filtreleme**: Aktivite türü, tarih aralığı
3. **Arama**: Başlık içinde arama
4. **Düzenleme**: Kaydedilmiş çalışmayı yeniden açma
5. **Silme**: Soft delete (geri dönülebilir)

**Service Entegrasyonu**: `services/worksheetService.ts`, `api/worksheets.ts`

---

### 5.7 CurriculumView — Müfredat Görünümü

**Dosya Konumu**: `components/CurriculumView.tsx`

**Amaç**: MEB müfredatına göre aktiviteleri listeleme.

**İşlevler**:
1. **Sınıf Seçimi**: 1-8. sınıflar
2. **Ders Seçimi**: Matematik, Türkçe, Fen, Sosyal
3. **Kazanım Listesi**: MEB kazanımlarına göre aktiviteler
4. **Hızlı Üretim**: Kazanıma göre aktivite üretme

**Service Entegrasyonu**: `services/curriculumService.ts`

---

## 6. Türkçe Dil Modülleri {#türkçe-dil-modülleri}

### 6.1 Super Türkçe Modülü v1

**Dosya Konumu**: `src/modules/super-turkce/`

**Amaç**: Türkçe dil becerileri için kapsamlı aktivite paketi.

**Faz 1-4 Tamamlandı**:
- Faz 1: Kelime Dağarcığı (eş anlamlı, zıt anlamlı, kelime türleri)
- Faz 2: Dilbilgisi (fiil, isim, sıfat, zarf)
- Faz 3: Cümle Yapısı (özne, yüklem, nesne)
- Faz 4: Metin Türleri (şiir, hikaye, bilgilendirici metin)

**Alt Klasörler**:
- `core/` — Temel servisler
- `features/` — Faz bazında özellikler
- `shared/` — Paylaşılan bileşenler

---

### 6.2 Super Türkçe Modülü v2

**Dosya Konumu**: `src/modules/super-turkce-v2/`

**Amaç**: Yeni nesil Türkçe stüdyoları ve özellikler.

**Yeni Özellikler**:
- Interaktif hece parkuru
- Sesbilgisi aktiviteleri (fonolojik farkındalık)
- Morfolojik analiz (kök-ek ayrıştırma)
- Anlam ilişkileri (mecaz, deyim)

**Alt Klasörler**:
- `studios/` — Türkçe-spesifik stüdyolar
- `ui/` — UI bileşenleri
- `core/` — Core servisler
- `shared/` — Paylaşılan utilities

---

## 7. AI Generatör Servisleri {#ai-generatör-servisleri}

### 7.1 Generatör Mimarisi

**Dosya Konumu**: `services/generators/`

**Toplam Generatör Sayısı**: 40+ AI generatör + 25 offline generatör

**Ana Dosyalar**:
- `index.ts` — Barrel export
- `registry.ts` — Tüm generatörlerin merkezi kaydı
- `core/` — Temel generatör sınıfları
- `promptLibrary.ts` — Paylaşılan prompt şablonları

**Generatör Türleri**:

#### 7.1.1 Disleksi Desteği
- `dyslexiaSupport.ts` — Fonolojik farkındalık, hece çalışmaları

#### 7.1.2 Okuma Anlama
- `readingComprehension.ts` — 5W1H, çıkarım, kelime dağarcığı
- `readingStudio.ts` — ReadingStudio entegrasyon

#### 7.1.3 Matematik
- `mathStudio.ts` — MathStudio entegrasyon
- `dyscalculia.ts` — Diskalkuli-spesifik aktiviteler

#### 7.1.4 Yaratıcı ve Sözel
- `creativeStudio.ts` — Yaratıcı yazarlık
- `wordGames.ts` — Kelime oyunları

#### 7.1.5 Görsel ve Bilişsel
- `visualPerception.ts` — Görsel algı
- `memoryAttention.ts` — Bellek ve dikkat
- `patternCompletion.ts` — Örüntü tamamlama

#### 7.1.6 Mantık ve Problem Çözme
- `algorithm.ts` — Algoritma/mantık
- `brainTeasers.ts` — Bulmacalar
- `logicProblems.ts` — Mantık problemleri

#### 7.1.7 Klinik Şablonlar
- `clinicalTemplates.ts` — BEP + klinik şablonlar (Dr. Ahmet Kaya onaylı)

#### 7.1.8 Değerlendirme
- `assessment.ts` — Değerlendirme soruları

#### 7.1.9 Diğer Özel Aktiviteler
- `familyTreeMatrix.ts` — Aile ağacı + matris
- `financialMarket.ts` — Finansal matematik
- `fiveWOneH.ts` — 5N1K soruları
- `colorfulSyllable.ts` — Renkli hece ayrıştırma
- `directionalCodeReading.ts` — Yön kodu okuma
- `logicErrorHunter.ts` — Mantık hatası avcısı
- `mapInstruction.ts` — Harita talimat

---

### 7.2 Offline Generatörler

**Dosya Konumu**: `services/offlineGenerators/`

**Amaç**: AI gerektirmeyen, deterministik aktivite üretimi (hızlı + maliyet sıfır).

**Toplam**: 25 offline generatör

**Örnekler**:
- `clockReading.ts` — Saat okuma
- `capsuleGame.ts` — Kapsül oyunu
- `futoshiki.ts` — Futoshiki bulmacası
- `oddEvenSudoku.ts` — Tek-Çift Sudoku
- `magicPyramid.ts` — Sihirli piramit
- `mapDetective.ts` — Harita dedektifi
- `abcConnect.ts` — ABC bağlantı

**Yazılım Mühendisi Notu**: Offline generatörler `offlineGenerators.ts` orchestrator ile yönetiliyor.

---

## 8. Backend API Modülleri {#backend-api-modülleri}

### 8.1 api/generate.ts — Ana AI Endpoint

**Method**: POST

**Amaç**: AI ile aktivite üretimi.

**Input**:
```typescript
{
  prompt: string;
  schema: object;
  userId: string;
  activityType: ActivityType;
  options: GeneratorOptions;
}
```

**Output**:
```typescript
{
  success: boolean;
  data: ActivityItem[];
  timestamp: string;
}
```

**Özellikler**:
- Rate limiting (IP + user bazlı)
- CORS koruması
- Zod validation (`utils/schemas.ts`)
- Retry with backoff (`utils/errorHandler.ts`)
- JSON repair (`services/geminiClient.ts`)

**AI Mühendisi Notu**: Bu endpoint tüm AI üretimlerinin merkezi noktası. SYSTEM_INSTRUCTION değişikliği regression test gerektirir.

---

### 8.2 api/worksheets.ts — Çalışma Kâğıdı CRUD

**Methods**: GET, POST, PUT, DELETE

**Amaç**: Çalışma kâğıdı CRUD işlemleri.

**Endpoints**:
- `GET /api/worksheets` — Kullanıcının tüm çalışmaları
- `POST /api/worksheets` — Yeni çalışma kaydetme
- `PUT /api/worksheets/:id` — Var olan çalışmayı güncelleme
- `DELETE /api/worksheets/:id` — Çalışma silme (soft delete)

**Service**: `services/worksheetService.ts` + Firestore

---

### 8.3 api/feedback.ts — Geri Bildirim Endpoint

**Method**: POST

**Amaç**: Kullanıcı geri bildirimlerini kaydetme.

**Input**:
```typescript
{
  userId: string;
  category: 'bug' | 'feature' | 'content' | 'other';
  message: string;
  rating?: number;
}
```

---

### 8.4 api/export-pdf.ts — PDF Dışa Aktarma

**Method**: POST

**Amaç**: Çalışma kâğıdını PDF olarak dışa aktarma.

**Input**:
```typescript
{
  worksheetId: string;
  paperSize: 'A4' | 'Letter' | 'B5';
  orientation: 'portrait' | 'landscape';
}
```

**Output**: PDF file (binary)

**Utilities**: `utils/printService.ts`, jsPDF, @react-pdf/renderer

---

### 8.5 api/ai/generate-image.ts — Görsel Üretimi

**Method**: POST

**Amaç**: Gemini Vision ile görsel üretimi.

**Input**:
```typescript
{
  prompt: string;
  imageType: 'illustration' | 'diagram' | 'icon';
}
```

**AI Entegrasyonu**: Gemini Vision API

---

### 8.6 api/user/paperSize.ts — Kâğıt Boyutu Tercihi

**Method**: GET, POST

**Amaç**: Kullanıcının tercih ettiği kâğıt boyutunu kaydetme/okuma.

**Options**: A4 (default), Letter, B5

---

## 9. State Management {#state-management}

### 9.1 Zustand Store Mimarisi

**Toplam Store Sayısı**: 10 Zustand store

**Store Listesi**:

#### 9.1.1 useAppStore
**Dosya**: `store/useAppStore.ts`
**Amaç**: Global app state (currentView, sidebar, modal'lar)

**State**:
- `currentView`: View — Hangi görünüm aktif
- `sidebarOpen`: boolean — Sidebar açık/kapalı
- `activeModal`: string | null — Açık modal

#### 9.1.2 useAuthStore
**Dosya**: `store/useAuthStore.ts`
**Amaç**: Kimlik doğrulama state

**State**:
- `user`: User | null — Giriş yapmış kullanıcı
- `role`: UserRole — admin, teacher, parent, student
- `isAuthenticated`: boolean

#### 9.1.3 useWorksheetStore
**Dosya**: `store/useWorksheetStore.ts`
**Amaç**: Çalışma kâğıdı state

**State**:
- `worksheets`: SavedWorksheet[] — Kullanıcının çalışmaları
- `activeWorksheet`: WorksheetData | null — Aktif düzenlenen
- `loading`: boolean
- `error`: string | null

#### 9.1.4 useA4EditorStore
**Dosya**: `store/useA4EditorStore.ts`
**Amaç**: A4 editör canvas state

**State**:
- `elements`: CanvasElement[] — Tuval üzerindeki öğeler
- `selectedElementId`: string | null
- `tool`: 'select' | 'text' | 'image' | 'shape'

#### 9.1.5 useCreativeStore
**Dosya**: `store/useCreativeStore.ts`
**Amaç**: Yaratıcı stüdyo state

#### 9.1.6 useReadingStore
**Dosya**: `store/useReadingStore.ts`
**Amaç**: Okuma stüdyosu state

#### 9.1.7 useStudentStore
**Dosya**: `store/useStudentStore.ts`
**Amaç**: Öğrenci yönetimi + BEP state

**State**:
- `students`: Student[] — Kullanıcının öğrencileri
- `activeStudent`: Student | null
- `bepGoals`: BEPGoal[]

#### 9.1.8 usePaperSizeStore
**Dosya**: `store/usePaperSizeStore.ts`
**Amaç**: Kâğıt boyutu tercihi

**State**:
- `paperSize`: PaperSize — 'A4' | 'Letter' | 'B5'

#### 9.1.9 useToastStore
**Dosya**: `store/useToastStore.ts`
**Amaç**: Bildirim toast state

**State**:
- `toasts`: Toast[]
- `addToast`: (message, type) => void
- `removeToast`: (id) => void

#### 9.1.10 useUIStore
**Dosya**: `store/useUIStore.ts`
**Amaç**: UI state (loading, modals, drawer)

**State**:
- `loading`: boolean
- `activeDrawer`: string | null
- `modalStack`: string[]

---

## 10. Utility Servisleri {#utility-servisleri}

### 10.1 AppError — Merkezi Hata Standardı

**Dosya**: `utils/AppError.ts`

**Amaç**: Tüm hata türlerinin merkezi standardı.

**Sınıflar**:
- `AppError` — Genel uygulama hatası
- `ValidationError` — Doğrulama hatası
- `RateLimitError` — Rate limit aşımı
- `AuthError` — Kimlik doğrulama hatası
- `NotFoundError` — Kaynak bulunamadı

**Format**:
```typescript
{
  userMessage: string;    // Kullanıcıya gösterilecek Türkçe mesaj
  code: string;           // Hata kodu (örn: 'RATE_LIMIT_EXCEEDED')
  httpStatus: number;
  details?: unknown;
  isRetryable: boolean;
}
```

**Yazılım Mühendisi Notu**: Bu format kesinlikle korunmalı. Tüm hatalar `toAppError()` ile bu formata çevrilmeli.

---

### 10.2 errorHandler — Hata Yönetim Utilities

**Dosya**: `utils/errorHandler.ts`

**Fonksiyonlar**:
- `retryWithBackoff()` — Exponential backoff ile retry
- `logError()` — Hata loglama (production'da console.log yasak)
- `wrapAsync()` — Async fonksiyon hatalarını yakalama
- `toAppError()` — Herhangi bir hatayı AppError'a çevirme

---

### 10.3 schemas — Zod Validation Şemaları

**Dosya**: `utils/schemas.ts`

**Amaç**: Tüm API giriş doğrulama şemaları.

**Şemalar**:
- `generateActivityRequestSchema` — `api/generate.ts` için
- `worksheetSchema` — Çalışma kâğıdı validasyonu
- `studentProfileSchema` — Öğrenci profili validasyonu
- `assessmentSchema` — Değerlendirme validasyonu

**Yazılım Mühendisi Notu**: Yeni API endpoint eklendiğinde mutlaka Zod şeması ekle.

---

### 10.4 geminiClient — Gemini AI Wrapper

**Dosya**: `services/geminiClient.ts`

**Amaç**: Gemini 2.5 Flash wrapper + JSON onarım motoru.

**Ana Fonksiyonlar**:
- `generateWithSchema()` — Structured output ile üretim
- `generateText()` — Serbest metin üretimi
- `repairJSON()` — 3 katmanlı JSON onarım

**JSON Onarım Motoru** (3 katman):
1. `balanceBraces()` — Parantez dengeleme
2. `truncateToLastValidEntry()` — Son geçerli girişte kes
3. `JSON.parse()` — Parse et, başarısız → fallback

**AI Mühendisi Notu**: Bu motor %94 başarı oranıyla çalışıyor. DOKUNMA!

---

### 10.5 rateLimiter — Rate Limiting

**Dosya**: `services/rateLimiter.ts`

**Amaç**: IP + kullanıcı bazlı rate limiting.

**Limitler**:
- `GENERATE`: 50 istek/saat
- `EXPORT`: 20 istek/saat
- `ADMIN`: 200 istek/saat

**Yazılım Mühendisi Notu**: Redis-free, in-memory implementation. Production'da Redis kullanılabilir.

---

### 10.6 rbac — Rol Tabanlı Erişim Kontrolü

**Dosya**: `services/rbac.ts`

**Roller**:
- `admin` — Tam erişim
- `teacher` — Aktivite oluşturma, öğrenci yönetimi
- `parent` — Sadece kendi çocuğunun verileri
- `student` — Sadece okuma

**Middleware**: `middleware/permissionValidator.ts` — API endpoint'lerde kullanılır

---

### 10.7 firebaseClient — Firebase/Firestore

**Dosya**: `services/firebaseClient.ts`

**Amaç**: Firebase/Firestore bağlantı ve CRUD işlemleri.

**Koleksiyonlar**:
- `users` — Kullanıcı profilleri
- `worksheets` — Çalışma kâğıtları
- `students` — Öğrenci profilleri
- `assessments` — Değerlendirmeler
- `feedback` — Geri bildirimler

---

### 10.8 cacheService — IndexedDB Önbellek

**Dosya**: `services/cacheService.ts`

**Amaç**: Tarayıcı tabanlı önbellekleme (üretim + taslak).

**Stores**:
- `generated_activities` — Üretilmiş aktiviteler (24 saat cache)
- `drafts` — Taslak çalışmalar (infinite cache)

---

### 10.9 printService — Yazdırma Servisi

**Dosya**: `utils/printService.ts`

**Amaç**: Çalışma kâğıdını PDF'e çevirme.

**Kâğıt Boyutları**: A4 (210x297mm), Letter (8.5x11"), B5 (176x250mm)

**Utilities**: jsPDF, @react-pdf/renderer, html2canvas

---

### 10.10 ocrService — Gemini Vision OCR

**Dosya**: `services/ocrService.ts`

**Amaç**: Fotoğraftan metin çıkarma (OCR).

**Use Cases**:
- `AdminDraftReview` — Elle yazılmış aktiviteleri dijitale çevirme
- Öğrenci el yazısı tanıma (gelecek özellik)

**AI Entegrasyonu**: Gemini Vision API

---

## 🔍 Ajan Kullanım Kılavuzu

### Elif Yıldız (Özel Öğrenme Uzmanı) İçin

**İlgilendiği Modüller**:
- MathStudio, ReadingStudio, CreativeStudio (pedagojik onay)
- AssessmentModule, ScreeningModule (ZPD uyumu)
- Tüm AI generatörler (`services/generators/`)

**Kontrol Etmesi Gerekenler**:
- `pedagogicalNote` her aktivitede var mı?
- ZPD uyumu: AgeGroup × difficulty kombinasyonu doğru mu?
- İlk aktivite maddesi kolay mı?
- Yönerge 2 cümleden uzun mu?

---

### Dr. Ahmet Kaya (Özel Eğitim Uzmanı) İçin

**İlgilendiği Modüller**:
- AdvancedStudentManager (BEP yazımı)
- ScreeningModule (risk taraması — tanı koyucu dil yok)
- AdminDraftReview (klinik içerik onayı)
- clinicalTemplates.ts (klinik şablonlar)

**Kontrol Etmesi Gerekenler**:
- BEP hedefleri SMART formatında mı?
- Tanı koyucu dil var mı? ("disleksisi var" → "disleksi desteğine ihtiyacı var")
- KVKK: öğrenci adı + tanı + skor birlikte görünüyor mu?
- MEB yönetmeliğine uygunluk

---

### Bora Demir (Yazılım Mühendisi) İçin

**İlgilendiği Modüller**:
- Tüm `api/` endpoint'leri (güvenlik, rate limiting)
- `utils/AppError.ts` (hata standardı)
- `services/geminiClient.ts` (AI wrapper)
- `store/` (Zustand state management)
- A4Editor, UniversalStudio (karmaşık UI mantığı)

**Kontrol Etmesi Gerekenler**:
- TypeScript strict mode uyumu
- `any` tipi yok
- Rate limiting her endpoint'te var mı?
- AppError formatı korunuyor mu?
- Test coverage (vitest)

---

### Selin Arslan (AI Mühendisi) İçin

**İlgilendiği Modüller**:
- `services/geminiClient.ts` (AI motor)
- `api/generate.ts` (SYSTEM_INSTRUCTION)
- Tüm `services/generators/` (prompt kalitesi)
- JSON schema tanımları
- Token maliyet optimizasyonu

**Kontrol Etmesi Gerekenler**:
- Model: `gemini-2.5-flash` (değişmemeli)
- Prompt anatomisi: ROL + HEDEFİ + KISITLAR + ÇIKTI
- JSON schema: required alanlar tanımlı mı?
- Token kullanımı: 600 token/aktivite altında mı?
- Hallucination riski: MEB kazanımı yanlış atfı var mı?

---

## 📚 Ek Kaynaklar

### Dokümantasyon Dosyaları
- `CLAUDE.md` — AI ekip koordinasyon protokolü
- `GEMINI.md` — Gemini CLI kuralları
- `antigravity_report.md` — Sprint 5 Admin Modülü raporu
- `swagger.yaml` — API dokümantasyonu
- `SECURITY.md` — Güvenlik kuralları

### Kritik Tip Dosyaları
- `types/creativeStudio.ts` — LearningDisabilityProfile, AgeGroup
- `types/student-advanced.ts` — StudentAIProfile, BEPGoal
- `types/core.ts` — WorksheetData, ActivityBase
- `types/activity.ts` — ActivityType enum (40+ tür)

---

## 🔄 Güncelleme Protokolü

**Bu belge aşağıdaki durumlarda güncellenmeli**:

1. Yeni modül eklendiğinde (ör: yeni stüdyo)
2. Var olan modülde büyük değişiklik yapıldığında
3. API endpoint eklendiğinde/değiştirildiğinde
4. Yeni aktivite türü eklendiğinde
5. State management değişikliği yapıldığında

**Güncelleme Sorumlusu**: Özelliği ekleyen ajan + Bora Demir (kod reviewer)

---

**NOT**: Bu belge, tüm ajanların Oogmatik uygulamasını tam olarak anlaması için oluşturulmuştur. Her geliştirme öncesi ilgili modül bölümü okunmalıdır.

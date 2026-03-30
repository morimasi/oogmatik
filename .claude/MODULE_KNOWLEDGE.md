# OOGMATIK — Uygulama Modül ve İşlev Referansı

> **Tüm Ajanlar İçin Zorunlu Referans Belgesi**
> Bu belge, Oogmatik platformundaki tüm modüllerin, işlevlerin ve bileşenlerin kapsamlı açıklamasını içerir.
> Her ajan geliştirme yapmadan önce ilgili modülü buradan öğrenmeli ve bağlamı anlamalıdır.

**Son Güncelleme**: 2026-03-30
**Kapsam**: Tüm uygulama modülleri, API'ler, servisler ve UI bileşenleri

---

## 📑 İçindekiler

1. [Stüdyo Modülleri](#stüdyo-modülleri)
2. [Sınav Stüdyoları](#sınav-stüdyoları)
3. [Admin Modülleri](#admin-modülleri)
4. [Öğrenci Yönetim Modülleri](#öğrenci-yönetim-modülleri)
5. [Değerlendirme Modülleri](#değerlendirme-modülleri)
6. [Çalışma Kâğıdı Modülleri](#çalışma-kâğıdı-modülleri)
7. [Türkçe Dil Modülleri](#türkçe-dil-modülleri)
8. [AI Generatör Servisleri](#ai-generatör-servisleri)
9. [Görsel Üretim Sistemi](#görsel-üretim-sistemi)
10. [Backend API Modülleri](#backend-api-modülleri)
11. [State Management](#state-management)
12. [Utility Servisleri](#utility-servisleri)

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

---

## 2. Sınav Stüdyoları {#sınav-stüdyoları}

> **Bu bölüm ajan eğitimi için kritiktir.** Oogmatik'in temel çıktılarından biri MEB kazanım entegreli sınav/test üretimidir.

### 2.1 SinavStudyosu — Türkçe Sınav Stüdyosu

**Dosya Konumu**: `components/SinavStudyosu/`

**Amaç**: MEB Türkçe müfredatına uygun, kazanım bazlı sınav ve test kâğıdı otomatik üretimi.

**Ana Bileşen**: `components/SinavStudyosu/index.tsx`

**Alt Bileşenler**:
- `KazanimPicker.tsx` — MEB Türkçe kazanımlarını seçme (sınıf × ünite × kazanım)
- `SoruAyarlari.tsx` — Soru tipi ve sayı ayarları (çoktan seçmeli, doğru-yanlış, boşluk doldurma, açık uçlu)
- `SinavOnizleme.tsx` — Üretilen sınavın önizlemesi + düzenleme
- `CevapAnahtari.tsx` — Otomatik cevap anahtarı görünümü
- `components/` — Alt bileşenler

**Desteklenen Soru Tipleri**:
```
coktan_secmeli   → A/B/C/D şıklı (4 seçenek)
dogru_yanlis     → D / Y işaretleme
bosluk_doldurma  → Boşluk doldurma (cloze)
acik_uclu        → Yazılı cevap sorusu
```

**İş Akışı**:
```
1. KazanimPicker → Sınıf seçimi (1-8) + Ünite + Kazanım
2. SoruAyarlari → Soru tipi dağılımı + toplam soru sayısı
3. generateExamViaAPI() → POST /api/generate-exam
4. SinavOnizleme → Önizleme + soru yenileme + düzenleme
5. CevapAnahtari → Cevap anahtarı tab'ı
6. generateExamPDF() → PDF çıktısı (sınav kâğıdı + cevap anahtarı)
```

**API Entegrasyonu**:
- Frontend: `src/services/sinavService.ts` → `generateExamViaAPI()`
- Backend generator: `src/services/generators/sinavGenerator.ts`
- AI: Gemini 2.5 Flash — doğrudan REST API (Vercel serverless uyumlu)
- Tip tanımları: `src/types/sinav.ts`
- Store: `src/store/useSinavStore.ts`
- MEB kazanım verisi: `src/data/meb-turkce-kazanim.ts`
- PDF üretim: `src/utils/sinavPdfGenerator.ts`

**Soru Üretim Kalitesi**:
- Her soru `pedagogicalNote` içerir
- Çeldiriciler (`errorTags`) mantıksal hatalar üzerine kurulu (random değil)
- `errorTags` zorunlu alan — disleksi hata tipi etiketlemesi
- Başarı Anı Mimarisi: İlk soru kolay, zorluk kademeli artar

**Özel Eğitim Uzmanı Notu**: Sınav üretiminde tanı koyucu dil yasak. "Bu öğrencinin disleksisi var" değil → soruların disleksi desteğine ihtiyacı olan öğrenciler için uygun olması.

---

### 2.2 MatSinavStudyosu — Matematik Sınav Stüdyosu

**Dosya Konumu**: `components/MatSinavStudyosu/`

**Amaç**: MEB 1-8. sınıf matematik müfredatına uygun, kazanım bazlı matematik sınavı üretimi. SinavStudyosu'ndan tamamen bağımsız modül.

**Ana Bileşen**: `components/MatSinavStudyosu/index.tsx`

**Alt Bileşenler**:
- `MatKazanimPicker.tsx` — MEB Matematik kazanım seçici
- `MatSoruAyarlari.tsx` — Matematik soru tipi ayarları
- `MatSinavOnizleme.tsx` — Matematik sınav önizleme (grafik_verisi desteğiyle)
- `MatCevapAnahtari.tsx` — Matematik cevap anahtarı + açıklamalı çözüm
- `components/` — Alt bileşenler

**Matematik Sorusu Özel Özellikleri**:
```typescript
interface MatSoru {
  metin: string;          // Soru metni
  soru_tipi: string;      // coktan_secmeli | acik_uclu | ...
  grafik_verisi?: {       // 📊 Özel özellik: grafik içeren sorular
    tur: 'sutun' | 'cizgi' | 'pasta' | 'tablo';
    baslik: string;
    veri: Array<{etiket: string; deger: number}>;
  };
  sekil_verisi?: {        // 🔷 Geometrik şekil içeren sorular
    tur: 'dikdortgen' | 'ucgen' | 'cember' | 'kare';
    olcular: Record<string, number>;
    birim: string;
  };
  kazanim_kodu: string;
  zorluk_puani: number;
}
```

**Grafik/Şekil Desteği**: Matematik sınavında sütun grafiği, çizgi grafiği, pasta grafiği, tablo ve geometrik şekil içeren sorular üretilir. SVG render için `MatSinavOnizleme.tsx` kullanır.

**API Entegrasyonu**:
- Frontend: `src/services/matSinavService.ts` → `generateMatExam()` + `refreshSingleQuestion()`
- Backend generator: `src/services/generators/mathSinavGenerator.ts`
- AI: Gemini 2.5 Flash REST API
- Tip tanımları: `src/types/matSinav.ts`
- Store: `src/store/useMatSinavStore.ts`
- MEB kazanım verisi: `src/data/meb-matematik-kazanim.ts`

**Yazılım Mühendisi Notu**: MatSinav modülü SinavStudyosu'na dokunmaz — tamamen bağımsız. Soru yenileme (`refreshSingleQuestion`) bireysel soru API çağrısı yapar.

---

### 2.3 InfographicStudio — İnfografik Stüdyosu

**Dosya Konumu**: `src/components/InfographicStudio/index.tsx`

**Amaç**: Özel öğrenme güçlüğü olan öğrenciler için AI destekli infografik, tablo, şema, görsel özet üretimi.

**Desteklenen Şablon Türleri** (`@antv/infographic`):
```
list-row                      → Madde listesi (disleksi için en uygun)
sequence-steps                → Adım adım süreç gösterimi (DEHB için ideal)
compare-binary                → İkili karşılaştırma (sol/sağ)
compare-binary-horizontal     → Yatay karşılaştırma
hierarchy-mindmap             → Zihin haritası / kavram haritası
timeline                      → Zaman çizelgesi
data-table                    → Veri tablosu
```

**Pipeline**:
```
InfographicStudio (UI)
  → infographicService.ts (AI prompt mühendisliği)
    → /api/generate (Gemini 2.5 Flash)
      → InfographicRenderer.tsx (ana render bileşeni)
        → NativeInfographicRenderer.tsx (SVG render motoru)
```

**Özellikler**:
- Profil × yaş grubuna göre otomatik şablon seçimi
- Türkçe içerik (dil: 'tr' varsayılan)
- Lexend font zorunlu (disleksi uyumluluğu)
- A4 export: `useA4EditorStore.addBlock()` ile
- `pedagogicalNote` her infografikte zorunlu
- Şablon verisi: `src/data/infographicTemplates.ts`

**AI Mühendisi Notu**: `infographicService.ts`'teki `buildPrompt()` fonksiyonu her profil ve yaş grubu için farklı kurallı prompt üretir. JSON çıktısı `@antv/infographic` syntax'ına uygun olmalı.

---

### 2.4 OCRActivityStudio — OCR Aktivite Stüdyosu

**Dosya Konumu**: `src/components/OCRActivityStudio/`

**Amaç**: Öğretmenin fotoğraf/tarama ile yüklediği materyal görüntüsünden otomatik aktivite ve varyasyon üretimi.

**Pipeline**:
```
OCRScanner.tsx (fotoğraf yükleme)
  → api/ocr/analyze.ts (Gemini Vision analiz)
    → ocrService.ts (blueprint çıkarımı)
      → ocrVariationService.ts (varyasyon üretimi)
        → VariationResultsView.tsx (sonuç görüntüleme)
```

**Aşamalar**:
1. **Görüntü Analiz**: Gemini Vision → OCR blueprint (metin + yapı + bölümler)
2. **Blueprint Doğrulama**: `imageValidator.ts` ile format/boyut kontrolü
3. **Varyasyon Üretimi**: Blueprint'ten farklı aktivite türleri (soru seti, boşluk doldurma, eşleştirme)
4. **Sonuç Görüntüleme**: `VariationResultsView.tsx` — DOMPurify ile XSS korumalı HTML render

**KVKK Uyumu**: Öğrenci fotoğrafları işlenmez — sadece materyal/çalışma sayfası görselleri

---

### 2.5 RemotionStudio — Animasyon Stüdyosu

**Dosya Konumu**: `src/components/RemotionStudio/`

**Amaç**: Remotion framework ile eğitim animasyonu üretimi.

**Kullanım Alanı**: Matematik kavramlarının animasyonlu gösterimi, öğrenciye yönelik dinamik içerik.

---

## 9. Görsel Üretim Sistemi {#görsel-üretim-sistemi}

> **Bu bölüm kritik.** Oogmatik'in ayırt edici özelliği, eğitim içeriğini doğru, gerçekçi ve pedagojik SVG/görsel ile desteklemesidir.
> Her görsel üretimde `visual-storyteller-oozel` ajanı devreye girmeli ve aşağıdaki standartları uygulamalıdır.

### 9.1 Görsel Üretim Genel Mimarisi

```
Kullanıcı İsteği
    ↓
[1] Niyet Analizi: Ne tür görsel gerekiyor?
    → İnfografik/tablo/şema?          → infographicService.ts + InfographicStudio
    → Geometrik şekil/matematik?       → mathGeometry.ts + SVG üretimi
    → Görsel algı/şekil tarama?        → perceptualSkills.ts (findDifference, oddOneOut)
    → Görsel yorum/hikaye görseli?     → visualInterpretation.ts + Gemini Vision
    → Grafik (sütun/çizgi/pasta)?      → MatSinavOnizleme.tsx + veri şeması
    → Animasyon?                       → RemotionStudio
    ↓
[2] SVG Üretim Standardı Uygula (bkz. SVG_VISUAL_STANDARDS.md)
    ↓
[3] A4 Export: useA4EditorStore.addBlock({ type: 'image', content: svgDataUrl })
```

### 9.2 Geometrik Şekil Üretimi — mathGeometry.ts

**Dosya**: `src/services/generators/mathGeometry.ts`

**Amaç**: Matematik aktiviteleri için SVG geometrik şekil üretimi.

**Desteklenen Şekiller**:
```
Temel:        circle, square, rectangle, triangle, rhombus
Çokgenler:    pentagon, hexagon, octagon
3D Projeksiyon: cube (küp wireframe)
Özel:         number_line (sayı çizgisi), fraction_bar (kesir çubuğu)
              coordinate_grid (koordinat ızgarası), angle_arc (açı gösterimi)
```

**Çıktı Formatı**: Her şekil `svgContent: string` (tam SVG string veya SVG path d özelliği) döndürür.

**Önemli Kurallar**:
- viewBox her zaman `"0 0 100 100"` (normalize edilmiş koordinat)
- stroke-width: zorluk seviyesine göre 1-3px
- fill: profil renk paletine uygun (disleksi → yüksek kontrast)
- Etiketler (ölçüler, açılar): `text` elementi ile SVG içine entegre

### 9.3 Görsel Algı Aktiviteleri — perceptualSkills.ts

**Dosya**: `src/services/generators/perceptualSkills.ts`  
(`visualPerception.ts` artık bu dosyaya yönlendirir — deprecated)

**Aktivite Türleri**:
```typescript
// Fark Bulma — iki görsel arasındaki farkları işaretle
FindTheDifferenceData: {
  rows: Array<{
    items: Array<{
      svgPaths: Array<{d: string; fill: string; stroke: string}>;
      rotation: number;
      isMirrored: boolean;
    }>;
    correctIndex: number;  // Farklı olan öğenin index'i
    reason: string;        // Neden farklı
    clinicalMeta: {        // Klinik metadata
      targetedError: string;  // 'reversal_error' | 'rotation_error' | 'mirror_error'
      cognitiveLoad: number;  // 1-10
    };
  }>;
}

// Şekil Sayma
ShapeCountingData: {
  searchField: Array<{
    id: string; type: string; color: string;
    rotation: number; size: number; x: number; y: number;
  }>;
  correctCount: number;
}

// Tek Yanlış — Seri içinde farklı olanı bul
VisualOddOneOutData: { rows: Array<...> }
```

**SVG Path Üretim Standartı**:
Gemini'ye verilen şema `svgPaths` alanını içerir:
```json
{
  "svgPaths": [
    {"d": "M 10 10 L 90 10 L 50 90 Z", "fill": "#4A90D9", "stroke": "#2C5F8A"}
  ]
}
```
Koordinatlar 0-100 arasında normalize edilmiş SVG `viewBox="0 0 100 100"` için.

### 9.4 Görsel Yorum Aktiviteleri — visualInterpretation.ts

**Dosya**: `src/services/generators/visualInterpretation.ts`

**Amaç**: Öğrenci görsel analiz, çıkarım ve 5N1K becerileri için soru seti üretimi.

**Özel Özellik**: `generateCreativeMultimodal()` kullanır — hem metin hem görsel prompt.

**Çıktı Formatı**:
```typescript
interface VisualInterpretationResult {
  imagePrompt: string;    // Midjourney/DALL-E 3 seviyesinde İngilizce görsel prompt
  questions: Array<{
    questionType: 'who' | 'what' | 'where' | 'when' | 'how' | 'why' | 'inference';
    questionText: string;
    answerType: 'open_ended' | 'multiple_choice';
    options?: string[];
    correctAnswer: string;
    pedagogicalNote: string;
  }>;
  pedagogicalNote: string;
}
```

### 9.5 Grafik Üretimi (Sınav İçin)

**Kullanım Yeri**: `MatSinavOnizleme.tsx` içindeki grafik render.

**Desteklenen Grafik Tipleri**:
```typescript
type GrafikTuru = 'sutun' | 'cizgi' | 'pasta' | 'tablo';

interface GrafikVerisi {
  tur: GrafikTuru;
  baslik: string;
  veri: Array<{etiket: string; deger: number}>;
  birim?: string;   // 'adet' | 'TL' | 'kg' | vb.
  renk?: string;    // Çubuk/çizgi rengi (opsiyonel)
}
```

**SVG Render Standartı** (MatSinavOnizleme içinde):
```
Sütun grafiği: max değer = %100 yükseklik, taban çizgisi 0
Pasta grafiği: dilimleri açılarla SVG path arc komutu ile
Çizgi grafiği: polyline + noktalar
Tablo: SVG foreignObject veya native SVG rect+text
```

### 9.6 İnfografik SVG Standartları

**Dosya**: `src/components/NativeInfographicRenderer.tsx`

**Render Mantığı**: `@antv/infographic` syntax → React SVG render

**Renk Paleti** (profil bazlı):
```
dyslexia:     Ana #4A90D9 (mavi), Vurgu #E8F4FD, Metin #2C3E50
dyscalculia:  Ana #27AE60 (yeşil), Vurgu #E8F8F0, Metin #1B2631
adhd:         Ana #E74C3C (kırmızı-turuncu), Vurgu #FDEDEC, Metin #2C3E50
mixed:        Ana #8E44AD (mor), Vurgu #F5EEF8, Metin #2C3E50
general:      Ana #2C3E50 (lacivert), Vurgu #EBF5FB, Metin #1A252F
```

**Tipografi Standartı**:
```
İçerik metni:    font-family: Lexend (ZORUNLU — disleksi uyumluluğu)
Admin/UI:        font-family: Inter
font-size:       min 14px (mobil), 16px+ (A4 print)
line-height:     1.8+ (disleksi standardı)
letter-spacing:  0.05em (okuma kolaylığı için)
```

### 9.7 A4 Export Standardı

**Tüm görseller için geçerli A4 export flow**:
```typescript
// useA4EditorStore.ts'deki addBlock() ile
const dataUrl = `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(svgString)))}`;
useA4EditorStore.getState().addBlock({
  type: 'image',
  content: dataUrl,
  x: 50,          // sol kenar boşluğu (layoutConstants.ts: A4_MARGIN_PX)
  y: 50,          // üst kenar boşluğu
  width: 400,     // A4 içerik genişliği (layoutConstants.ts: A4_CONTENT_WIDTH_PX)
  height: 400,    // Görsel yüksekliği (içeriğe göre ayarla)
});
```

### 9.8 Animasyon (Remotion)

**Dosya**: `src/components/RemotionStudio/`

**Kullanım Amacı**: Matematik kavram animasyonları, adım adım çözüm animasyonları.

**Standart**: Her animasyon `fps: 30`, `durationInFrames` konu karmaşıklığına göre, `CompositionProps` pedagojik parametreleri içerir.

---

## 11. Etkinlik Üretim Pipeline'ı (Ana İş Akışı) {#etkinlik-üretim-pipeline}

> **Bu bölüm ajan eğitiminin özüdür.** Oogmatik'in tüm etkinlik/soru/sınav üretimi bu pipeline üzerinden geçer.

### Etkinlik Türleri Tam Listesi

```
SORU / AKTİVİTE (GeneratorView üzerinden):
├── Okuma Anlama
│   ├── Metin + 5N1K soruları (fiveWOneH.ts)
│   ├── Çıkarım soruları (readingComprehension.ts)
│   └── Kelime dağarcığı (wordGames.ts)
│
├── Matematik
│   ├── İşlem soruları (mathStudio.ts)
│   ├── Geometri + şekil (mathGeometry.ts)
│   ├── Mantık problemleri (logicProblems.ts)
│   ├── Diskalkuli scaffold (dyscalculia.ts)
│   ├── Grafik okuma (mathSinavGenerator.ts)
│   └── Finansal matematik (financialMarket.ts)
│
├── Görsel Algı & Şekil
│   ├── Şekil sayma (mathGeometry → shapeCountingFromAI)
│   ├── Fark bulma (perceptualSkills → findDifference)
│   ├── Tek yanlış bul (perceptualSkills → oddOneOut)
│   ├── Görsel yorum (visualInterpretation.ts)
│   └── Yön kodu okuma (directionalCodeReading.ts)
│
├── Dil & Yazım
│   ├── Hece ayrıştırma (colorfulSyllable.ts)
│   ├── Kelime oyunları (wordGames.ts)
│   ├── Yaratıcı yazarlık (creativeStudio.ts)
│   └── Disleksi desteği (dyslexiaSupport.ts)
│
├── Bellek & Dikkat
│   ├── Bellek oyunları (memoryAttention.ts)
│   ├── Beyin teaser (brainTeasers.ts)
│   └── Algoritma aktiviteleri (algorithm.ts)
│
├── Akıl Yürütme
│   ├── Mantık hataları (logicErrorHunter.ts)
│   ├── Aile ağacı (familyTreeMatrix.ts)
│   ├── Daire mantık (apartmentLogic.ts)
│   └── Harita talimatı (mapInstruction.ts)
│
└── Değerlendirme & Klinik
    ├── Adaptif sorular (assessment.ts)
    ├── BEP şablonları (clinicalTemplates.ts)
    └── Tarama anketi (Screening/)

SINAV (Sınav Stüdyoları üzerinden):
├── Türkçe sınavı (SinavStudyosu)
│   ├── Çoktan seçmeli, D/Y, boşluk doldurma, açık uçlu
│   └── MEB Türkçe kazanımları entegreli
├── Matematik sınavı (MatSinavStudyosu)
│   ├── Tüm soru tipleri + grafik + şekil içeren sorular
│   └── MEB Matematik kazanımları entegreli
└── Adaptif değerlendirme (AssessmentModule)
    └── Hata analizi (errorTags), profil bazlı

VİZÜEL ÜRETİM (InfographicStudio üzerinden):
├── Madde listesi infografik
├── Adım adım süreç şeması
├── Karşılaştırma tablosu
├── Zihin haritası
└── Zaman çizelgesi
```

### Standart API Request Formatı

```typescript
// Tüm etkinlik/aktivite üretim istekleri bu formatta
POST /api/generate
{
  prompt: string;           // Gemini prompt'u
  schema: object;           // JSON Schema (structured output)
  userId: string;           // Rate limiting için
  activityType: ActivityType;
  options: {
    difficulty: 'Kolay' | 'Orta' | 'Zor';
    ageGroup: '5-7' | '8-10' | '11-13' | '14+';
    profile: 'dyslexia' | 'dyscalculia' | 'adhd' | 'mixed';
    itemCount: number;
    // ... aktivite-spesifik parametreler
  }
}

// Sınav üretimi ayrı endpoint
POST /api/generate-exam
{
  ayarlar: SinavAyarlari;   // Kazanım + soru dağılımı + sınıf
}
```

### pedagogicalNote Standartı

**Her AI üretim çıktısında `pedagogicalNote` zorunludur:**

```typescript
pedagogicalNote: string; // Öğretmene "Neden bu aktivite?" açıklaması

// Örnek (iyi):
"Bu aktivite fonolojik farkındalık becerilerini hedefler. 
İlk 3 madde kolaydır (başarı anı için). ZPD: 8-10 yaş, Kolay seviye."

// Örnek (kötü — yasak):
"Bu aktivite disleksisi olan öğrenciler için hazırlanmıştır."
//                ^^^ tanı koyucu dil — Dr. Ahmet veto eder!
```


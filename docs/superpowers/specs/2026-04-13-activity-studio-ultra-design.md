# Activity Studio Ultra Design

**Tarih:** 2026-04-13
**Kapsam:** Ultra Etkinlik Uretim Studyosu'nun modul bazli, kutuphane destekli, AI ile gelistir akisli, premium A4 cikti ureten profesyonel ilk surumu

---

## Hedef

Activity Studio'yu iskelet wizard yapisindan cikarip gercek bir uretim modulune donusturmek:

1. Bes adimin her biri kendi alan sorumluguna sahip olacak.
2. StepGoal icinde etkinlik kutuphanesi bulunacak.
3. Ogretmen secilen etkinligi dogrudan kullanabilecek veya AI ile gelistirebilecek.
4. Cikti, ozel ogrenme guclugu alanlarina uygun premium A4 kompakt etkinlik sayfasi olacak.
5. Tema, kontrast ve erisilebilirlik kurallari tum adimlarda zorunlu olacak.

---

## Secilen Yaklasim

Onaylanan strateji: dengeli hibrit yaklasim.

Bu surumde:

1. 24-30 guclu etkinlikten olusan cekirdek kutuphane kurulacak.
2. Moduler wizard altyapisi guclendirilecek.
3. Secilen etkinlik uzerinde kontrollu AI zenginlestirme akisi kurulacak.
4. Premium A4 layout ve tema senkronu ilk surumde gercekten kullanilabilir hale getirilecek.

Bu strateji, hem hizli deger uretir hem de kalitesiz katalog sisirmesini engeller.

---

## Moduler Yapi

### 1. Hedef ve Kapsam

Sorumluluklar:

1. Profil, yas grubu, zorluk, beceri, format ve sure secimi
2. Etkinlik kutuphanesi tarama ve filtreleme
3. Kutuphaneden etkinlik secme ve taslaga ekleme
4. Secilen etkinlik icin AI ile gelistir eylemini baslatma

Alt moduller:

1. LibraryExplorer
2. LibraryFilters
3. LibraryCardGrid
4. GoalConfigPanel
5. AIEnhanceEntryPanel

### 2. Icerik ve Bilesen

Sorumluluklar:

1. Secilen etkinligi duzenlenebilir bir blueprint'e donusturme
2. Adimlar, materyaller, ogretmen yonergesi ve alternatifler uretme
3. AI ile gelistir sonucunu editor icinde gostermek

Alt moduller:

1. ContentBlueprintEditor
2. MaterialsPanel
3. InstructionPanel
4. StepSequenceEditor
5. AIEnhancementDiffView

### 3. Ozellestirme

Sorumluluklar:

1. Tema ile birebir uyumlu gorunum ayarlari
2. Premium A4 kompakt layout profili secimi
3. Renk kontrasti ve okunurluk guvenligi
4. Bilesen yogunlugu, bosluk, ikon, QR, puanlama, watermark ayarlari

Alt moduller:

1. ThemeSyncPanel
2. ContrastSafetyPanel
3. CompactA4LayoutPanel
4. BlockDensityPanel
5. BrandingAndUtilityPanel

### 4. Onizleme

Sorumluluklar:

1. Ogrenci gorunumu
2. Ogretmen gorunumu
3. Premium A4 kompakt render
4. Export ve paylasim eylemleri

Alt moduller:

1. StudentPreview
2. TeacherPreview
3. A4CompactRenderer
4. ExportActionsBar
5. ShareActionsBar

### 5. Admin Onayi

Sorumluluklar:

1. Pedagojik kontrol
2. Klinik dil ve KVKK kontrolu
3. Approval metadata
4. Onay, revize, red islemleri

Alt moduller:

1. ApprovalChecklist
2. ClinicalSafetySummary
3. PedagogicSafetySummary
4. ApprovalMetadataPanel
5. ApprovalActionsPanel

---

## Etkinlik Kutuphanesi Tasarimi

Kutuphanenin StepGoal icinde bulunmasi zorunludur. Kullanici once hedef belirleyebilir ya da once kutuphaneden etkinlik secip sonra detaylari ayarlayabilir.

### Kutuphane Alanlari

1. Disleksi
2. Diskalkuli
3. DEHB
4. Karma Profil

### Ilk Surum Cekirdek Dagilim

1. Disleksi: 8 etkinlik
2. Diskalkuli: 8 etkinlik
3. DEHB: 8 etkinlik
4. Karma Profil: 6 etkinlik

Toplam hedef: 30 etkinlikten fazla olmayacak sekilde 24-30 yuksek kaliteli etkinlik.

### Ornek Kategori Basliklari

1. Hece farkindaligi
2. Ses-harf esleme
3. Kisa okuma anlama
4. Gorsel ayrimlastirma
5. Sayi-nesne esleme
6. Sayi dogrusu
7. Basamak degeri
8. Saat okuma
9. Dikkat avciligi
10. Mikro gorev zinciri
11. Kisa sureli hafiza
12. Sira takip gorevi

### Library Card Zorunlu Alanlari

1. Baslik
2. Profil etiketi
3. Yas grubu
4. Zorluk
5. Hedef beceriler
6. Kisa ozet
7. Pedagojik gerekce
8. Kullan
9. Onizle
10. AI ile gelistir

---

## AI ile Gelistir Akisi

Secilen etkinlik sifirdan yeniden yazilmaz; once mevcut kutuphane etkinligi temel blueprint olarak alinır, sonra kontrollu sekilde zenginlestirilir.

### v1 Pipeline

1. Sanitize
2. ContentAgent
3. IntegrationAgent
4. Profil uyarlama kurallari

IdeationAgent ilk surumde opsiyonel destek olarak kalabilir.

### AI ile Gelistir Sonuclari

1. Daha guclu yonerge
2. Alternatif adimlar
3. Materyal onerileri
4. Scaffold ipuclari
5. Değerlendirme onerileri
6. Premium A4 layout icin zenginlestirilmis yapi

### Guvenlik Kurallari

1. Kullanici girdisi sanitize edilir
2. Max 2000 karakter siniri korunur
3. Tum ajan ciktilari klinik taramadan gecer
4. Tum ciktilar structured output ile dogrulanir
5. Tanı koyucu dil ve PII sızıntısı export oncesinde de kontrol edilir

---

## Premium A4 Tasarim Prensipleri

Amaç: bosluklu demo sayfa degil, profesyonel ve dolu ama okunabilir etkinlik sayfasi.

### Kurallar

1. Lexend korunur
2. Satir araligi profil bazli ama min 1.8
3. Kompakt bosluk sistemi kullanilir
4. Bolumler net ama gereksiz padding yoktur
5. Her sayfa print odakli kurulur

### Layout Profilleri

1. Compact Single Column
2. Dense Two Column
3. Guided Worksheet Layout
4. Assessment Compact Layout

### Blok Mantigi

1. Header
2. Kisa yonerge
3. Gorev bloklari
4. Yardimci ipucu paneli
5. Materyal satiri
6. Degerlendirme alani
7. Pedagogical note ogretmen gorunumunde

---

## Tema ve Kontrast Senkronu

Activity Studio tema ile yuzde yuz senkron olacak. Ozel palette uretilmeyecek; uygulama theme tokenlarina baglanacak.

### Zorunlu Kontrast Kurallari

1. Beyaz zeminde beyaz yazi olamaz
2. Acik zeminde acik ton metin olamaz
3. Koyu zeminde koyu ton metin olamaz
4. Her kartta foreground-background kontrast kontrolu otomatik calisir
5. Guvensiz kombinasyon fallback token ile degistirilir

### Teknik Cozum

1. Theme token resolver
2. Contrast safety utility
3. Step bazli ortak surface ve text tokenlari
4. Preview render sirasinda son kontrast guard

---

## Klinik ve Pedagojik Zorunluluklar

### Pedagojik

1. pedagogicalNote zorunlu
2. Ilk iki gorev kolay
3. Hedef beceri ile yas-zorluk uyumu zorunlu
4. Basari mimarisi korunur
5. mixed profilde en kisitlayici destekler uygulanir

### Klinik

1. Tanı koyucu dil yasak
2. Ad, tanı, skor birlikte gorunmez
3. AI ciktilari tum alanlarda klinik taramadan gecer
4. fully_approved olmadan export yapilmaz
5. PDF metadata alanlari da sanitize edilir

---

## Teknik Mimari

### Veri Akisi

1. StepGoal secilen kutuphane girdisini ve hedef konfigurasyonu store'a yazar
2. StepContent bunu content blueprint'e cevirir
3. StepCustomize blueprint uzerine patch uygular
4. StepPreview final snapshot uretir
5. StepApproval bu snapshot uzerinden onay ve export akisina gider

### Servisler

1. ActivityLibraryService
2. ActivityEnhancementService
3. ThemeContrastService
4. CompactA4LayoutService
5. ActivityStudioApprovalService

---

## Ilk Uygulama Dilimi

Ilk kodlama turu su kapsamla baslatilacak:

1. Etkinlik kutuphanesi veri modeli
2. StepGoal kutuphane paneli ve filtreler
3. AI ile gelistir servis kontrati
4. Contrast safety ve tema senkron temel katmani

Bu dilim tamamlandiginda Activity Studio artik iskelet wizard degil, secilebilir ve AI ile zenginlestirilebilir bir kutuphane tabanli profesyonel editor olacaktir.

---

## Riskler

1. StepGoal'in tekrar monolit hale gelmesi
2. AI ciktilarinin degiskenligi nedeniyle render kirilmasi
3. Tema tokenlari ile preview stilinin ayrismasi
4. Kutuphane veri modelinin fazla daginik kurulmasi
5. Klinik taramanin sadece tek alanda kalmasi

Bu riskleri azaltmak icin adim bazli alt moduller, typed contracts ve zorunlu test kapsami kullanilacak.

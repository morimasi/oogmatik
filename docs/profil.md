# Profil Modülü Ultra-Modüler Yeniden Yapılandırma + Süper Türkçe Çoklu Sayfa Desteği

> **Tarih:** 2026-05-08 | **Versiyon:** v1.0 | **Durum:** Onay Bekliyor  
> **Proje:** Oogmatik EdTech Platform — Profil & Super Türkçe Sprint

---

## Hedef

Mevcut `ProfileView.tsx` (1860 satır — monolitik dev dosya) bileşenini **6 bağımsız, kendi kendine yeten modüle** bölmek ve her modülü premium, AI-zengin, tam işlevsel hale getirmek. Ek olarak, Super Türkçe Stüdyosu'ndaki A4 önizleme paneline çoklu sayfa desteği eklemek, Sıralama etkinliğindeki kritik hatayı gidermek ve Kelime & Cümle Stüdyosu'nu premium modüler yapıya taşımak.

---

## 👑 Lider Ajan Değerlendirmeleri

### Elif Yıldız (Pedagoji)
> "Profil modülü öğretmenin kendi gelişimini takip ettiği tek alan. Her alt modülde pedagojik not alanı ve ZPD uyumlu veri sunumu zorunlu. Öğrenci sekmesi BEP entegrasyonu içermeli."

### Dr. Ahmet Kaya (Klinik/MEB)
> "KVKK uyumu: avatar URL sanitizasyonu korunmalı. Öğrenci adı + tanı + skor birlikte gösterilmemeli. Raporlar sekmesinde anonimleştirme katmanı eklenebilir."

### Bora Demir (Mühendislik)
> "1860 satırlık monolitik dosyanın parçalanması acil. Her modül kendi hook'u + kendi state'i ile loose-coupled olmalı. Barrel export ile temiz API."

### Selin Arslan (AI Mimarisi)
> "Özet modülüne AI-driven anomaly detection, Analiz modülüne trend prediction eklenebilir. Gemini 2.5 Flash ile öğretmen performans özetleri üretilebilir."

---

## Mevcut Durum Analizi

### Sorunlar

| # | Sorun | Şiddet |
|---|-------|--------|
| 1 | `ProfileView.tsx` **1860 satır** — monolitik, bakımı imkansız | 🔴 Kritik |
| 2 | Tüm tab içerikleri tek dosyada — code splitting yok | 🔴 Kritik |
| 3 | State yönetimi inline — 20+ useState tek bileşende | 🟡 Yüksek |
| 4 | Super Türkçe A4 önizleme yalnızca 1 sayfa gösteriyor | 🔴 Kritik |
| 5 | PDF/yazdırma çoklu sayfa desteklemiyor | 🟡 Yüksek |
| 6 | Sıralama etkinliği render sırasında `undefined title` hatası | 🔴 Kritik |
| 7 | Kelime & Cümle Stüdyosu bileşenleri monolitik ve görsel yoğunluğu düşük | 🟡 Yüksek |

### Mevcut Dosya Yapısı

```
components/
  ProfileView.tsx          ← 1860 satır (TEK DOSYA — HER ŞEY BURADA)
```

---

## Önerilen Mimari

```
components/Profile/
├── index.tsx                     ← ProfileShell (sadece routing + layout)
├── hooks/
│   └── useProfileData.ts         ← Tüm shared state & data fetching
├── components/
│   ├── ProfileHeader.tsx         ← Üst banner + avatar + navigasyon
│   └── TabNavigation.tsx         ← Tab pill navigasyonu
├── modules/
│   ├── OverviewModule.tsx        ← [ÖZET] Dashboard bento grid
│   ├── StudentsModule.tsx        ← [ÖĞRENCİLER] Gelişmiş öğrenci yönetimi
│   ├── AnalysisModule.tsx        ← [ANALİZ] Değerlendirme tablosu + AI insights
│   ├── PlansModule.tsx           ← [PLANLAR] Müfredat planları + BEP
│   ├── ReportsModule.tsx         ← [RAPORLAR] Detaylı rapor görüntüleyici
│   └── SettingsModule.tsx        ← [AYARLAR] Profil, AI, güvenlik, arayüz
└── constants.ts                  ← Tab tanımları, varsayılan ayarlar
```

---

## Modül Detayları

### Modül 1: Özet (`OverviewModule.tsx`)

**Mevcut:** Basit stat kartları + son materyaller listesi

**Yeni Premium Özellikler:**
- 🤖 **AI Performans Özeti:** Gemini ile haftalık/aylık performans analizi cümlesi
- 📊 **Bento Grid Dashboard:** 8 KPI kartı (öğrenci sayısı, materyal, skor trendi, aktif plan, haftalık üretim, en çok kullanılan aktivite, AI kullanım oranı, streak sayacı)
- 📈 **Etkileşim Trend Grafiği:** Son 30 günlük kullanım (LineChart entegrasyonu)
- 🎯 **Hızlı Aksiyon Kartları:** "Yeni Materyal Üret", "Değerlendirme Başlat", "Plan Oluştur"
- 🏆 **Başarı Rozeti Sistemi:** Milestone rozetleri (10 materyal, 50 materyal, ilk BEP vb.)

---

### Modül 2: Öğrenciler (`StudentsModule.tsx`)

**Mevcut:** Sadece `AdvancedStudentManager` embed

**Yeni Premium Özellikler:**
- 👥 **Öğrenci Grid + Liste Görünümü:** Toggle ile kart/tablo modu
- 🔍 **Akıllı Arama:** İsim, sınıf, tanı bazlı filtreleme
- 📋 **Mini Profil Kartları:** Avatar, isim, sınıf, son aktivite, gelişim çubuğu
- 🤖 **AI Öğrenci Risk Analizi:** "Bu öğrenci son 2 haftadır aktivite yapmadı" uyarıları
- 📊 **Karşılaştırmalı Radar Chart:** 2-3 öğrenciyi yan yana karşılaştırma
- ➕ **Hızlı Öğrenci Ekleme:** Inline form (modal değil)

---

### Modül 3: Analiz (`AnalysisModule.tsx`)

**Mevcut:** Basit değerlendirme tablosu

**Yeni Premium Özellikler:**
- 📊 **İleri Düzey Tablo:** Sıralama, filtreleme, sayfalama
- 🤖 **AI Trend Tahmini:** Gemini ile "Bu öğrencinin dikkat skoru yukarı trend gösteriyor" analizi
- 📈 **Çok Boyutlu Radar Chart:** Dikkat, Bellek, Görseli-uzamsal, Fonolojik farkındalık
- 🔔 **Anomali Tespiti:** Skor düşüşlerinde otomatik uyarı kartları
- 📋 **Değerlendirme Karşılaştırma:** Zaman içinde aynı öğrencinin gelişim yolu
- 🖨️ **Rapor Export:** Seçili değerlendirmeleri PDF olarak indir

---

### Modül 4: Planlar (`PlansModule.tsx`)

**Mevcut:** Basit müfredat listesi

**Yeni Premium Özellikler:**
- 📅 **Plan Timeline:** Görsel zaman çizelgesi (Gantt tarzı)
- 🤖 **AI Plan Önerisi:** "Bu öğrencinin son değerlendirmesine göre şu planı öneriyoruz"
- 📊 **Plan İlerleme Dashboard:** Her planın tamamlanma yüzdesi, kalan günler
- 🎯 **BEP Entegrasyonu:** SMART hedefli BEP kartları
- ✅ **Görev Takip:** Günlük aktivite tamamlama durumu (checkbox)
- 📋 **Plan Karşılaştırma:** İki planı yan yana göster

---

### Modül 5: Raporlar (`ReportsModule.tsx`)

**Mevcut:** Basit değerlendirme listesi + görüntüleyici

**Yeni Premium Özellikler:**
- 📊 **Rapor Dashboard:** Tüm raporların özet istatistikleri
- 🤖 **AI Rapor Sentezi:** Tüm değerlendirmeleri tek bir kapsamlı rapora dönüştür
- 📑 **Rapor Şablonları:** MEB formatında, klinik formatta, veli formatta rapor çıktısı
- 🖨️ **Toplu Export:** Seçili raporları tek PDF'te birleştir
- 📈 **Gelişim Zaman Çizelgesi:** Görsel timeline ile rapor geçmişi
- 🔒 **KVKK Anonimleştirme:** Rapor paylaşımında otomatik ad maskeleme

---

### Modül 6: Ayarlar (`SettingsModule.tsx`)

**Mevcut:** Profil düzenleme, tema, AI ayarları, güvenlik — hepsi tek yerde

**Yeni Premium Alt Kategoriler:**
- 👤 **Profil:** Avatar değiştirme, kişisel bilgiler, uzmanlık alanı, bio
- 🎨 **Arayüz:** Tema seçimi (9 tema), font, satır aralığı, renk doygunluğu, kompakt mod
- 🤖 **AI Asistan:** Model seçimi (sabit: gemini-2.5-flash), yaratıcılık slider, analiz derinliği, ton
- 🔔 **Bildirimler:** E-posta, tarayıcı bildirimleri, haftalık özet toggle'ları
- 🔒 **Güvenlik:** Şifre değiştirme, 2FA durumu, oturum geçmişi, hesap silme (3 aşamalı onay)
- 📤 **Veri Yönetimi:** Tüm verileri export (JSON), KVKK veri erişim talebi

---

## Paylaşılan Altyapı

### `useProfileData.ts` Hook

```typescript
interface ProfileData {
  user: User;
  isReadOnly: boolean;
  assessments: SavedAssessment[];
  worksheets: SavedWorksheet[];
  curriculums: Curriculum[];
  loading: boolean;
  stats: {
    totalStudents: number;
    totalMaterials: number;
    totalAssessments: number;
    totalPlans: number;
    avgScore: number;
    monthlyNewStudents: number;
    weeklyProduction: number;
    streak: number;
  };
  performanceTrends: TrendPoint[] | null;
  refreshData: () => Promise<void>;
}
```

### `constants.ts`

```typescript
export const PROFILE_TABS = [
  { id: 'overview', label: 'Özet', icon: 'fa-solid fa-chart-pie' },
  { id: 'students', label: 'Öğrenciler', icon: 'fa-solid fa-user-graduate' },
  { id: 'evaluations', label: 'Analiz', icon: 'fa-solid fa-clipboard-check' },
  { id: 'plans', label: 'Planlar', icon: 'fa-solid fa-graduation-cap' },
  { id: 'reports', label: 'Raporlar', icon: 'fa-solid fa-file-medical' },
  { id: 'settings', label: 'Ayarlar', icon: 'fa-solid fa-gear' },
] as const;
```

---

## Super Türkçe Stüdyosu — Çoklu Sayfa A4 Önizleme

### Sorun

Mevcut `A4PreviewPanel.tsx` dosyası, AI'dan gelen içeriği `===SAYFA_SONU===` delimiteri ile bölebiliyor ama **yazdırma ve PDF export** sırasında tüm sayfalar tek bir uzun dokümana dönüşüyor.

### Çözüm

#### [MODIFY] `A4PreviewPanel.tsx`

1. **Sayfa Navigasyonu:** Sayfalar arası ileri/geri butonları + sayfa numarası göstergesi
2. **Tüm Sayfaları Göster modu:** Scroll ile tüm sayfaları alt alta görme
3. **Print CSS:** Her sayfa `page-break-after: always` ile ayrılacak
4. **PDF Export:** `html2canvas` + `jsPDF` ile her sayfa ayrı PDF sayfası

#### [MODIFY] `ActionToolbar.tsx`

1. **Yazdır butonu:** `window.print()` çağrısı + print CSS
2. **PDF İndir butonu:** Çoklu sayfa PDF export motoru
3. **Sayfa Sayısı Badge:** Üretilen toplam sayfa sayısı

#### Teknik Detay — Print CSS

```css
@media print {
  .a4-page {
    width: 210mm !important;
    min-height: 297mm !important;
    page-break-after: always !important;
    margin: 0 !important;
    padding: 15mm !important;
    box-shadow: none !important;
  }
  .a4-page:last-child {
    page-break-after: auto !important;
  }
  .no-print {
    display: none !important;
  }
}
```

#### Teknik Detay — PDF Export

```typescript
const exportMultiPagePDF = async (pages: HTMLElement[]) => {
  const pdf = new jsPDF('p', 'mm', 'a4');
  
  for (let i = 0; i < pages.length; i++) {
    const canvas = await html2canvas(pages[i], { scale: 2 });
    const imgData = canvas.toDataURL('image/jpeg', 0.95);
    
    if (i > 0) pdf.addPage();
    pdf.addImage(imgData, 'JPEG', 0, 0, 210, 297);
  }
  
  pdf.save(`super-turkce-${Date.now()}.pdf`);
};
```

---

## Kelime & Cümle Stüdyosu Modernizasyonu

### Hedef
Kelime & Cümle Stüdyosu'ndaki tüm etkinlik formatlarını modüler hale getirmek, 1-sayfa kısıtı ile akıllı sayfalama eklemek ve A4 çıktısını premium/kompakt "dolu dolu" hale getirmek.

### Kapsam
1. **Çoktan Seçmeli (Multiple Choice):** Modüler yapı + A4 kompakt layout.
2. **Kelime Tamamlama (Word Completion):** Modüler yapı + minimal boşluklu tasarım.
3. **Karışık Cümle (Scrambled Sentence):** Modüler yapı + premium/profesyonel görünüm.
4. **Zıt Anlam (Antonyms):** Modüler yapı + yüksek görsel yoğunluk.

### Teknik Standart
- **1 Sayfa Kuralı:** Etkinlikler varsayılan olarak 1 A4 sayfasını dolduracak şekilde planlanır. Sığmayan içerikler otomatik olarak sonraki sayfaya taşar.
- **Kompakt Tasarım:** Hücreler ve sorular arası boşluklar (padding/margin) minimalize edilerek sayfa verimliliği %20 artırılır.
- **Premium Estetik:** Cam dokulu (glassmorphism) badge'ler, Lexend font hakimiyeti ve tutarlı ikonografik sistem.

---

## Kritik Hata Çözümü: Sıralama Etkinliği (Queue Ordering)

### Sorun
`SheetRenderer` içerisinde Sıralama etkinliği render edilirken `Cannot read properties of undefined (reading 'title')` hatası alınması.

### Çözüm
1. **`SheetRenderer.tsx`:** `ActivityType.QUEUE_ORDERING` case'inde `data` null-check ve default value (`title: 'Sıra Alma Becerisi'`) eklenmesi.
2. **`QueueOrderingSheet.tsx`:** Gelen verinin `wrapped` (data.content) veya `raw` olduğunu belirleyen `contentData` mantığının güçlendirilmesi ve destructuring öncesi emniyet kontrolü.


---

## Uygulama Sırası

| Faz | Görev | Dosya | Süre |
|-----|-------|-------|------|
| 1 | Dizin yapısını oluştur | `components/Profile/` | 2 dk |
| 2 | `useProfileData.ts` hook | `hooks/useProfileData.ts` | 5 dk |
| 3 | `ProfileHeader.tsx` + `TabNavigation.tsx` | `components/` | 5 dk |
| 4 | `OverviewModule.tsx` | `modules/` | 10 dk |
| 5 | `StudentsModule.tsx` | `modules/` | 8 dk |
| 6 | `AnalysisModule.tsx` | `modules/` | 10 dk |
| 7 | `PlansModule.tsx` | `modules/` | 10 dk |
| 8 | `ReportsModule.tsx` | `modules/` | 10 dk |
| 9 | `SettingsModule.tsx` | `modules/` | 15 dk |
| 10 | `index.tsx` (ProfileShell) | `Profile/` | 5 dk |
| 11 | App.tsx entegrasyonu | `App.tsx` | 3 dk |
| 12 | A4 çoklu sayfa desteği | `SuperStudio/A4PreviewPanel.tsx` | 10 dk |
| 13 | PDF export motoru | `ActionToolbar.tsx` | 8 dk |
| 14 | Print CSS | Genel CSS | 3 dk |
| 15 | Test & doğrulama | `npm run build` | 5 dk |

---

## Doğrulama Planı

### Otomatik
```bash
npm run build     # TypeScript hatasız derleme
npm run lint      # ESLint uyumu
```

### Manuel
- [ ] Profil modülü açılıyor, 6 sekme arası geçiş sorunsuz
- [ ] Özet sekmesinde KPI kartları doğru veri gösteriyor
- [ ] Öğrenciler sekmesinde liste + detay çalışıyor
- [ ] Ayarlar sekmesinde profil güncelleme çalışıyor
- [ ] Super Türkçe'de çoklu sayfa önizlemesi görünüyor
- [ ] Yazdırma işleminde her sayfa ayrı A4 sayfasında
- [ ] PDF indirmede çoklu sayfa desteği çalışıyor

---

## Riskler & Dikkat Edilecekler

> ⚠️ **Mevcut `ProfileView.tsx` 1860 satır.** Refactoring sırasında mevcut prop interface'i korunmalı — `App.tsx`'teki çağrı değişmemeli veya minimal değişmeli.

> ❗ **KVKK:** Raporlar modülünde öğrenci adı + tanı + skor birlikte gösterilmeyecek. Anonimleştirme katmanı eklenmeli.

> 🚫 **`any` tipi yasak.** Tüm yeni modüller TypeScript strict mode'da yazılacak. `unknown` + type guard kullanılacak.

---

# ✅ UYGULAMA KONTROL LİSTESİ (CHECKLIST)

## Faz 0: Hazırlık
- [ ] Mevcut `ProfileView.tsx` yedeklenmesi
- [ ] `components/Profile/` dizin yapısının oluşturulması
- [ ] `constants.ts` dosyasının oluşturulması (tab tanımları, varsayılan ayarlar)

## Faz 1: Paylaşılan Altyapı
- [ ] `hooks/useProfileData.ts` — Merkezi veri hook'u
  - [ ] user, isReadOnly state'leri
  - [ ] assessments, worksheets, curriculums fetch
  - [ ] stats hesaplamaları (totalStudents, avgScore, streak vb.)
  - [ ] performanceTrends hesaplaması
  - [ ] refreshData() aksiyonu
- [ ] `components/ProfileHeader.tsx` — Üst banner bileşeni
  - [ ] Avatar + isim + rol badge
  - [ ] E-posta + kayıt tarihi
  - [ ] Geri + Kapat butonları
- [ ] `components/TabNavigation.tsx` — Sekme navigasyonu
  - [ ] 6 tab pill (Özet, Öğrenciler, Analiz, Planlar, Raporlar, Ayarlar)
  - [ ] Aktif tab vurgusu + animasyon
  - [ ] Responsive (mobilde kaydırılabilir)

## Faz 2: Modüller — Temel Fonksiyonellik
- [ ] `modules/OverviewModule.tsx` — Özet Dashboard
  - [ ] 8 KPI bento grid kartı
  - [ ] Son üretilen materyaller listesi (4 kart)
  - [ ] Aktif öğrenci spotlight kartı
  - [ ] Performans trend grafiği (LineChart)
  - [ ] Hızlı aksiyon butonları
  - [ ] Başarı rozeti sistemi
- [ ] `modules/StudentsModule.tsx` — Öğrenci Yönetimi
  - [ ] AdvancedStudentManager embed'i korunması
  - [ ] Grid/Liste toggle görünümü
  - [ ] Akıllı arama ve filtreleme
  - [ ] Mini profil kartları
  - [ ] Karşılaştırmalı radar chart alanı
- [ ] `modules/AnalysisModule.tsx` — Analiz & Değerlendirme
  - [ ] Değerlendirme tablosu (sıralama + filtreleme + sayfalama)
  - [ ] Tek değerlendirme açma (AssessmentReportViewer entegrasyonu)
  - [ ] Çok boyutlu radar chart
  - [ ] Anomali tespit kartları
  - [ ] Değerlendirme karşılaştırma modu
- [ ] `modules/PlansModule.tsx` — Planlar & BEP
  - [ ] Müfredat planları listesi
  - [ ] Plan ilerleme yüzdesi göstergesi
  - [ ] BEP kartları (SMART hedefler)
  - [ ] Plan timeline (görsel)
  - [ ] Görev takip (checkbox sistemi)
- [ ] `modules/ReportsModule.tsx` — Raporlar
  - [ ] Rapor dashboard (özet istatistikler)
  - [ ] Rapor listesi + detay görüntüleme
  - [ ] Gelişim zaman çizelgesi
  - [ ] KVKK anonimleştirme toggle'ı
  - [ ] Toplu PDF export
- [ ] `modules/SettingsModule.tsx` — Ayarlar
  - [ ] Alt kategori sidebar navigasyonu (Profil, Arayüz, AI, Bildirimler, Güvenlik, Veri)
  - [ ] Profil düzenleme formu (isim, meslek, kurum, tel, bio, avatar)
  - [ ] Tema seçimi (9 tema kartı)
  - [ ] AI asistan ayarları (yaratıcılık slider, analiz derinliği, ton)
  - [ ] Bildirim toggle'ları
  - [ ] Şifre değiştirme formu
  - [ ] Hesap silme (3 aşamalı onay)
  - [ ] Veri export (JSON) butonu

## Faz 3: Entegrasyon
- [ ] `Profile/index.tsx` — ProfileShell (ana routing bileşeni)
  - [ ] ProfileHeader render
  - [ ] TabNavigation render
  - [ ] Aktif modül lazy render (React.Suspense ile)
  - [ ] Mevcut prop interface'i koruma
- [ ] `App.tsx` güncellemesi
  - [ ] Eski `ProfileView` import'unu yeni `Profile` ile değiştir
  - [ ] Prop geçişlerinin uyumunu doğrula

## Faz 4: Super Türkçe — Çoklu Sayfa Desteği
- [ ] `A4PreviewPanel.tsx` güncelleme
  - [ ] Sayfa navigasyonu (ileri/geri butonları)
  - [ ] Sayfa numarası göstergesi
  - [ ] "Tüm sayfaları göster" toggle
  - [ ] Her sayfa `a4-page` CSS sınıfı ile sarılacak
- [ ] `ActionToolbar.tsx` güncelleme
  - [ ] Yazdır butonu + `window.print()` entegrasyonu
  - [ ] PDF indir butonu + çoklu sayfa export motoru
  - [ ] Sayfa sayısı badge'i
- [ ] Print CSS ekleme
  - [ ] `@media print` kuralları
  - [ ] `page-break-after: always` her sayfada
  - [ ] `.no-print` sınıfı ile toolbar/sidebar gizleme
- [ ] PDF Export Motoru
  - [ ] `html2canvas` ile her sayfa yakalama
  - [ ] `jsPDF` ile çoklu sayfa birleştirme
  - [ ] İndirme tetikleme

## Faz 5: Kalite Güvencesi
- [ ] TypeScript build kontrolü (`npm run build` — hatasız)
- [ ] Lint kontrolü (`npm run lint`)
- [ ] Profil modülü açılma testi (6 sekme)
- [ ] Özet KPI doğrulama
- [ ] Öğrenci listesi + detay testi
- [ ] Ayarlar — profil güncelleme testi
- [ ] Ayarlar — tema değiştirme testi
- [ ] Ayarlar — şifre değiştirme testi
- [ ] Super Türkçe çoklu sayfa önizleme testi
- [ ] Super Türkçe yazdırma testi (Chrome print preview)
- [ ] Super Türkçe PDF export testi
- [ ] KVKK uyumluluk kontrolü (ad + tanı + skor birlikte yok)
- [ ] `any` tipi kullanılmadığının doğrulanması
- [ ] `pedagogicalNote` gerekli yerlerde var mı kontrolü
- [ ] Responsive tasarım kontrolü (mobil + tablet)

## Faz 7: Ekstrem Stabilizasyon & Stüdyo Modernizasyonu
- [ ] **Sıralama Etkinliği (Bug Fix):**
  - [ ] `SheetRenderer.tsx`'te null-safe data handling.
  - [ ] `QueueOrderingSheet.tsx`'te veri yapısı adaptasyonu (title/problems check).
- [ ] **Kelime & Cümle Stüdyosu Modülerleşme:**
  - [ ] Çoktan Seçmeli modülü bağımsız bileşene taşıma.
  - [ ] Kelime Tamamlama modülü bağımsız bileşene taşıma.
  - [ ] Karışık Cümle modülü bağımsız bileşene taşıma.
  - [ ] Zıt Anlam modülü bağımsız bileşene taşıma.
- [ ] **Premium A4 Sayfalama (Dolu Dolu):**
  - [ ] Her modül için "Compact" CSS preset oluşturma.
  - [ ] 1-sayfa optimizasyonu: Sayfa sığdırma algoritmalarını verbal aktivitelere uyarlama.
  - [ ] `SheetRenderer` ile sayfa sonu (`===SAYFA_SONU===`) entegrasyonu.
  - [ ] Yazdırma ve PDF export testleri (çoklu sayfa geçişleri).
- [ ] **Genel Kalite & Performans:**
  - [ ] Gereksiz re-render'ları (Memoization) optimize etme.
  - [ ] Tüm verbal studio ikonlarını premium Lucide/FontAwesome standardına çekme.

## Faz 8: Dokümantasyon & Final Teslim
- [ ] MODULE_KNOWLEDGE.md güncelleme (yeni Profile/ ve Verbal Studio yapısı).
- [ ] Proje genelinde CLI testlerini (`npm run test:run`) çalıştırma.
- [ ] Bu checklist'in son durumunu güncelle ve final raporu oluştur.

# 📐 Matematik Problem Stüdyosu — Master Mimari & Geliştirme Planı (v2 Ultra-Pro Master Blueprint)

> **BDMIND EdTech Platformu — Özel Öğrenme & Disleksi Desteği**
> Bu doküman, var olan **Matematik Sınav Stüdyosu (`MatSinavStudyosu`) modülüne HİÇBİR ŞEKİLDE DOKUNMADAN**, onun birebir UI/UX mimarisini klonlayarak yalnızca **açık uçlu, benzersiz, 1-8. sınıf MEB müfredatıyla %100 uyumlu gerçek yaşam matematik problemleri** üretecek **Matematik Problem Stüdyosu (`MatProblemStudyosu`)** modülünün uçtan uca master mimari, navigasyon, RBAC yetkilendirme, ultra-modüler dosya yapısı, araç çubuğu eylemleri ve AI jeneratör planıdır.

---

## 👑 1. Swarm (Sürü) Uzman Ekip İnceleme ve Onay Raporu

### 1. Elif Yıldız — Özel Öğrenme Uzmanı (Pedagoji & ZPD)
> *"Disleksi ve DEHB olan öğrenciler için çoktan seçmeli sınav soruları ve kuru işlemler kaygı tetikler. Matematik Problem Stüdyosu, her problemin altında **'Verilenler'**, **'İstenenler'**, **'Kutu Modeli / Çizim Alanı'** ve **'Adım Adım Çözüm Rehberi'** barındırmalıdır. Ayrıca Web Speech API ile sesli okuma desteği sunulmalıdır."*

### 2. Dr. Ahmet Kaya — Özel Eğitim Uzmanı (Klinik, MEB & BEP)
> *"1-8. sınıf MEB matematik müfredatındaki 40+ ünite ve 120+ kazanım kodu (ör. M.6.1.2.3) birebir desteklenmelidir. Üretilen açık uçlu problemler BEP (Bireyselleştirilmiş Eğitim Planı) hedefleriyle eşleşebilir olmalıdır. Tanı koyucu veya etiketleyici dil kullanımı kesinlikle yasaktır."*

### 3. Bora Demir — Yazılım Mühendisi (Mühendislik & Ultra-Modüler Yapı)
> *"Mevcut `MatSinavStudyosu` kod kümesine tek bir satır dahi dokunulmayacaktır. Modül tamamen bağımsız kendi dizininde (`src/components/MatProblemStudyosu/`), kendi tipleriyle (`types/matProblem.ts`), kendi Zustand store'uyla (`store/useMatProblemStore.ts`) ve özel PDF motoruyla (`utils/problemPdfGenerator.ts`) sıfır çakışma riskiyle geliştirilecektir."*

### 4. Selin Arslan — AI Mühendisi (Gemini 2.5 Flash & Prompt Mühendisliği)
> *"`gemini-2.5-flash` modeli strictly açık uçlu JSON schema ile çalıştırılacak (`temperature: 0.1`), şıklı sorular engellenecektir. `services/geminiClient.ts` üzerindeki JSON onarım katmanı (`balanceBraces → truncateToValid → JSON.parse`) kullanılacak ve her problem çıktısında `pedagogicalNote` zorunlu kılınacaktır."*

### 5. Caner Tekin — UI/UX & Frontend Uzmanı
> *"Dark Glassmorphism tasarım stili, Lexend font tipografisi, yumuşak micro-animation geçişleri ve print-exact A4 CSS kuralları korunacaktır."*

### 6. Gizem Başar — Siber Güvenlik & KVKK Uzmanı
> *"Öğrenci adı, tanı bilgisi ve başarı puanları hiçbir zaman aynı ekranda veya açık paylaşım URL'lerinde kamuya açık şekilde sergilenmeyecektir."*

### 7. Tolga Yılmaz — Cloud & Database Uzmanı
> *"Problem çalışma kâğıtları IndexedDB önbelleğinde saklanacak, Firestore batch write yeteneği ile senkronize edilecek ve Vercel Serverless Edge yapısına tam uyumlu olacaktır."*

---

## 📦 2. Ultra-Modüler Dosya ve Klasör Mimarisi

```
src/
├── types/
│   └── matProblem.ts                   ← Modüle özel TÜM TypeScript tipleri (Sadece Açık Uçlu)
├── store/
│   └── useMatProblemStore.ts           ← Modüle özel Zustand State Store (Dizgi, Font & Tooling State)
├── components/
│   ├── MatProblemStudyosu/              ← Modüle özel TAM UI Kapsülü
│   │   ├── index.tsx                   ← Ana Stüdyo Giriş & Layout Bileşeni
│   │   ├── MatProblemOnizleme.tsx      ← Canlı A4 Editör & Önizleme (Font/Punto/Sütun Canlı Render)
│   │   ├── MatProblemSoruAyarlari.tsx  ← Açık Uçlu Problem Ayar Paneli
│   │   ├── MatProblemKazanimPicker.tsx← 1-8. Sınıf MEB Kazanım Seçici
│   │   ├── MatProblemCevapAnahtari.tsx ← Adım Adım Çözüm & Cevap Anahtarı Modal
│   │   └── components/                 ← Araç Çubuğu, Dizgi Araçları, Butonlar & Modallar
│   └── sheet-renderers/
│       └── MatProblemRenderer.tsx      ← Modüle özel A4 Renderer & Print-Wrapper
├── services/
│   ├── matProblemService.ts            ← Modüle özel Ana Servis (CRUD, Firestore & IndexedDB)
│   ├── generators/
│   │   └── mathProblemGenerator.ts     ← Modüle özel Gemini 2.5 Flash AI Jeneratörü
│   └── offlineGenerators/
│       └── matProblem.ts               ← Modüle özel Offline Şablon Üreteci
├── hooks/
│   └── useMatProblemManager.ts         ← Modüle özel İş Mantığı & Veri Yönetim Hook'u
└── utils/
    └── problemPdfGenerator.ts          ← Modüle özel A4 PDF & Yazdırma Motoru
```

---

## 🛠️ 3. Premium Üst Araç Çubuğu & Dizgi Kontrolleri

### 🌟 Ana Araç Çubuğu Butonları & İşlevleri:
- 👁️ **Önizleme**: A4 çalışma kâğıdını canlı düzenleme ve baskı görünümü arasında anlık geçiş yaptırır.
- ✓ **Cevap Anahtarı**: Her açık uçlu problemin adım adım çözümünü ve matematiksel açıklamasını içeren Cevap Anahtarı modalını açar.
- 📋 **Geçmiş (History)**: Üretilen problem çalışma kâğıtlarının versiyonlanmış geçmişini listeleyip geri yükler.
- 💾 **Kaydet**: Problemleri IndexedDB ve Firestore'a kaydederek `SavedWorksheetsView` ekranına aktarır.
- 🔗 **Paylaş**: Çalışma kâğıdını güvenli benzersiz URL bağlantısıyla dışa açar.
- 👤 **Öğrenciye Ata**: `StudentSelector` modalı ile problemi belirli bir öğrenciye ödev olarak atar.
- 📚 **Kitapçığa Ekle**: `FascicleStudio` / Fasikül üreticisine problemi bir sayfa olarak aktarır.
- 🖨️ **PDF Yazdır**: `printService` ve `@react-pdf/renderer` ile yüksek çözünürlüklü A4 PDF çıktısı alır.

### 🎨 Tipografi, Kenar Boşluğu & A4 Dizgi Araçları:

| Ayar Grubu | Seçenekler | İşlev ve Kullanım |
|---|---|---|
| **Tasarım (Font)** | `Lexend` (Disleksi Uyumlu), `Inter`, `Times New Roman` | Öğrencinin okuma ihtiyacına uygun font tercihi. |
| **Punto (Font Size)** | `9pt`, `10pt`, `11pt`, `12pt` | Problem metinlerinin ve çizim alanlarının yazı büyüklüğü. |
| **Yerleşim (Margins)** | `Dar` (Narrow), `Orta` (Normal), `Geniş` (Wide) | A4 sayfasının kenar boşlukları ve yazdırma alanı padding'i. |
| **Sütun Düzeni** | 📄 `Tek Sütun`, 📖 `Çift Sütun` | Problemlerin A4 sayfasında tek sütunda mı yoksa 2'li yan yana mı dizileceği. |
| **Metin Hizalama** | ⫷ `Sola Hizala`, ⫹ `İki Yana Yasla (Justify)` | Problem metninin okunabilirlik hizalaması. |
| **Satır Aralığı** | `Sıkı` (Tight), `Normal`, `Ayrık` (Relaxed) | Satır takibi için satır yüksekliği (`line-height`) ayarı. |

---

## 🌐 4. Ana Sayfa & Navigasyon Entegrasyonu (Kod Haritası)

1. **`src/constants/studios.ts`**:
   `STUDIO_GROUPS` altındaki `'Alan Stüdyoları'` grubuna ekleme yapılması:
   ```typescript
   {
     id: 'mat-problem-studyosu',
     label: 'Matematik Problem Stüdyosu',
     icon: 'fa-square-root-variable',
     color: 'text-cyan-500',
     actionType: 'callback'
   }
   ```
2. **`src/constants/views.ts`**: `VIEWS.MAT_PROBLEM_STUDYOSU = 'mat-problem-studyosu'`
3. **`src/types/core.ts`**: `ViewType` union tipine `'mat-problem-studyosu'` eklenmesi.
4. **`src/types/activity.ts`**: `ActivityType.MAT_PROBLEM = 'mat-problem-studyosu'` tanımı.
5. **`src/components/Sidebar.tsx` & `src/components/AppHeader.tsx`**: `onOpenMatProblemStudyosu` callback'i ve menü ikonu.
6. **`src/App.tsx` & `src/hooks/useNavigationLogic.ts`**: `currentView === 'mat-problem-studyosu'` router şartı.

---

## 🔐 5. Admin Paneli & RBAC Yetki Matrisi Entegrasyonu

1. **`src/types/rbac-advanced.ts`**:
   - `PermissionModule` union tipine `'mat-problem-studyosu'` eklenmesi.
   - `MODULE_LABELS['mat-problem-studyosu'] = 'Matematik Problem Stüdyosu'` tanımı.
   - `MODULE_CATEGORIES['central-studios']` grubuna `'mat-problem-studyosu'` dahil edilmesi.
2. **`src/services/rbac.ts`**:
   Süper Admin, Admin ve Öğretmen rollerine `mat-problem-studyosu` için varsayılan yetkiler atanması.
3. **`src/components/AdminDashboard/PermissionsIDE.tsx`**:
   RBAC Yetki Matrisi arayüzünde `mat-problem-studyosu` simgesi ve kontrol butonlarının görünür kılınması.
4. **`src/components/AdminUserManagement.tsx`**:
   Kullanıcı rol yönetimi matrisinde `Matematik Problem Stüdyosu` yetki kutucuğu.

---

## 🧠 6. Problem Türleri & Gemini 2.5 Flash JSON Şeması

### Kaldırılan Öğeler:
- ❌ Çoktan Seçmeli Şıklar (A, B, C, D)
- ❌ Sadece Rakamlardan Oluşan Kuru İşlemler (ör. `45 x 12 = ?`)

### Desteklenen Problem Formatları:
1. **Gerçek Yaşam Senaryoları**: Alışveriş, harçlık hesabı, zaman/saat problemleri, yol/mesafe, çevre/alan, kesirli tarifler.
2. **Beceri Temelli (LGS/PISA) Problemler**: Çok adımlı mantık yürütme, tablo ve grafik okuma gerektiren açık uçlu sorular.
3. **Şema & Model Destekli Problemler**: Kutu modeli, denklem şeması ve çözüm adımları desteği olan özel eğitim dostu problemler.

### AI JSON Schema Yapısı:
```json
{
  "pedagogicalNote": "Öğretmen için aktivitenin eğitsel amacı...",
  "baslik": "Gerçek Yaşam Matematik Problemleri",
  "sinif": 5,
  "kazanimlar": ["M.5.1.1.2"],
  "problemler": [
    {
      "id": "prob-1",
      "soruMetni": "Ahmet Manavdan kilosu 25 TL olan elmadan 3 kg...",
      "verilenler": ["Elma kilosu: 25 TL", "Alınan miktar: 3 kg"],
      "istenenler": "Toplam ödenecek tutar",
      "cozumAdimlari": ["1. Adım: 25 x 3 işlemi yapılır.", "2. Adım: Cevap 75 TL bulunur."],
      "dogruCevap": "75 TL",
      "semaTipi": "kutu-modeli"
    }
  ]
}
```

---

## 🚀 7. Uygulama Adımları Kontrol Listesi

- [ ] **Faz 1: Tipler & Zustand Store (`types/matProblem.ts`, `store/useMatProblemStore.ts`)**
  - Ultra-modüler açık uçlu problem veri modelleri, font, punto, sütun, hizalama ve araç çubuğu state store'u kurulacak.
- [ ] **Faz 2: AI Jeneratör & Servis (`services/generators/mathProblemGenerator.ts`, `services/matProblemService.ts`)**
  - Gemini 2.5 Flash açık uçlu problem jeneratörü ve IndexedDB/Firestore servisi yazılacak.
- [ ] **Faz 3: Ultra-Modüler UI Editör (`components/MatProblemStudyosu/`)**
  - `MatProblemStudyosu` dizini altında bağımsız UI editör, önizleme, MEB kazanım picker, araç çubuğu ve cevap anahtarı modalı hazırlanacak.
- [ ] **Faz 4: A4 Renderer & PDF Motoru (`components/sheet-renderers/MatProblemRenderer.tsx`, `utils/problemPdfGenerator.ts`)**
  - A4 baskı düzeni, font/punto/sütun canlı render motoru ve PDF indirme mekanizması tamamlanacak.
- [ ] **Faz 5: Navigasyon & RBAC Entegrasyonu**
  - `studios.ts`, `Sidebar.tsx`, `App.tsx`, `rbac-advanced.ts` ve Admin Paneli yetki matrisine modül eksiksiz bağlanacak.
- [ ] **Faz 6: Test ve Verification**
  - `npx tsc --noEmit --skipLibCheck` ile tip doğrulaması ve build kontrolü yapılacak.

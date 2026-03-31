# OOGMATIK — Evrensel Renk Paleti ve Görsel Modernizasyon Stratejisi (v3.0 Ultra Premium)

Bu strateji belgesi, **Oogmatik** platformunun tüm dijital varlıklarını (Stüdyolar, Admin, Öğrenci Panelleri) dünya standartlarında bir "EdTech SaaS" estetiğine kavuştururken, klinik çıktılar olan A4 sayfalarını bu görsel fırtınadan tamamen izole etmeyi amaçlar.

---

## 👑 Lider Uzman Paneli — Derinlemesine Teknik Analiz

### 1. Elif Yıldız (Pedagoji & ZPD) — "Bilişsel Konfor"

- **Dual-Coding Renk Eşleşmesi:** Matematik ve okuma modüllerinde, sayılar ve heceler için kullanılan renklerin arayüz temasıyla çakışmaması için "Color Shielding" (renk kalkanı) uygulanacak.
- **Success Glow (Başarı Işıltısı):** Bir aktivite tamamlandığında, seçili temanın `accent-color` tonuyla tüm ekranın çeperinde yumuşak bir "nefes alma" (breathing) animasyonu tetiklenecek.
- **Focus Mode (Bimodal Okuma):** Okuma stüdyosunda, metin dışındaki tüm UI elemanlarının opaklığının %10'a düştüğü, sadece odak noktasının temanın en parlak tonuyla aydınlandığı bir mod eklenecek.

### 2. Dr. Ahmet Kaya (Klinik & Erişilebilirlik) — "Nöro-Mimari"

- **Visual Fatigue Guard:** Uzun süreli kullanımda çocukların göz yorulmasını engellemek için tüm temalar "Blue Light Optimized" (mavi ışığı minimize eden) HSL değerlerine çekilecek.
- **Saccadic Eye Movement Support:** Temalar arasındaki kontrast oranları, gözün satır takibi yapmasını kolaylaştıran "Soft Contrast" (saf siyah-beyaz yerine koyu gri-krem) prensibiyle yeniden kurgulanacak.
- **A4 Veri Safiyeti:** A4 sayfası bir "Klinik Rapor"dur. Bu sayfadaki her türlü gölge, gradyan veya tema rengi, tanılama doğruluğunu bozabilir. Bu yüzden A4, tüm temalardan %100 izole kalacaktır.

### 3. Bora Demir (Mühendislik & Standartlar) — "Dinamik Altyapı"

- **Themed Glassmorphism:** `--surface-glass` değişkeni temaya göre dinamikleşecek:
  - _Dark temalar:_ `%5` beyaz opaklık + `20px` blur.
  - _Light temalar:_ `%3` siyah opaklık + `12px` blur.
- **HSL Color Matrix:** CSS değişkenleri HEX yerine HSL (`--h`, `--s`, `--l`) olarak tanımlanacak. Bu sayede `useUIStore` içindeki `saturation` slider'ı tüm uygulamanın renk doygunluğunu anlık olarak (GPU hızlandırmalı) değiştirebilecek.
- **Strict Isolation Layer:** A4 container'ı için CSS `all: initial` kullanılarak, temadan gelebilecek her türlü "inheritance" (kalıtım) en başta kesilecek.

### 4. Selin Arslan (AI Mimarisi) — "Görsel Zeka"

- **Palette Reflection (Yansıma):** AI İnfografik üreticisi, kullanıcının o anki temasını algılayıp, ürettiği diyagramların kenar ve başlık renklerini temanın `accent` rengine göre (A4 hariç) otomatik set edecek.
- **Responsive Micro-Interactions:** AI ile üretim yapılırken beliren "Loading" animasyonları, seçili temanın ruhuna göre (Space temada yıldız kayması, Nature temada yaprak hışırtısı gibi) farklılaşacak.

---

## 🎨 Ultra Premium Tema Katalogu (Modernize Edilmiş)

| Tema Kimliği                   | Arka Plan (BG) | Vurgu (Accent) | Karakter & Mood             |
| :----------------------------- | :------------- | :------------- | :-------------------------- |
| **Obsidian Deep (Anthracite)** | `#09090B`      | `#818CF8`      | Kararlı, Derin, Profesyonel |
| **Cyber Punk (Neon)**          | `#020202`      | `#F43F5E`      | Dinamik, Enerjik, Gelecekçi |
| **Nordic Mist (Ocean)**        | `#082F49`      | `#38BDF8`      | Dingin, Odaklı, Huzurlu     |
| **Emerald Forest (Nature)**    | `#052E16`      | `#4ADE80`      | Doğal, Büyümeyi Teşvik Eden |
| **Imperial Stone (Royal)**     | `#1C1917`      | `#F59E0B`      | Prestijli, Kurumsal, Güçlü  |
| **Milk & Honey (Light)**       | `#F8FAFC`      | `#4F46E5`      | Temiz, Ferah, Klasik Eğitim |

---

## 🚀 Teknik Uygulama Yol Haritası

### FAZ 1: Merkezi Tema Katmanı (Global CSS)

- **`src/styles/theme-tokens.css`**: Tüm HSL değişkenlerinin ve Premium Blur değerlerinin tek noktada toplanması.
- **Tailwind Config Update**: `tailwind.config.js` dosyasının bu değişkenleri (varsayılan değerlerle) tanıması.

### FAZ 2: Statik ve Dinamik Komponentlerin Adaptasyonu

- **Admin Dashboard**: Kartların ve istatistik grafiklerinin (Recharts) tema değişkenlerini (CSS variables) kullanarak otomatik renk değiştirmesi.
- **Studios (Math/Reading)**: Sağ ve sol kontrol panellerinin temaya göre opaklık ve blur kazanması.

### FAZ 3: Etkileşim Tasarımı (Micro-Animations)

- Buton üzerine gelindiğinde (hover) temanın vurgu renginde yumuşak bir ışık patlaması (glow).
- Sayfa geçişlerinde temanın rengini taşıyan "Shimmer" (parlama) efekti.

### FAZ 4: Kesin A4 İzolasyonu ve Print Engine v7.0

- **Isolation CSS Block**:
  ```css
  .worksheet-page,
  .worksheet-page * {
    all: revert !important; /* Temadan gelen her şeyi reddet */
    background: white !important;
    color: black !important;
  }
  ```
- **Print Trigger**: Yazıcıya gönderilmeden milisaniyeler önce arayüzün zorla "Milk & Honey (Light)" moduna çekilmesi ve çıktı sonrası eski haline dönmesi.

---

## 📋 Kalite ve Kontrol Metrikleri

- [ ] Renk körlüğü testleri (Protanopia/Deuteranopia) %100 başarılı mı?
- [ ] Doygunluk (Saturation) slider'ı tüm komponentlere aynı anda etki ediyor mu?
- [ ] A4 sayfası `Cyber Punk` temasında bile hala bembeyaz ve kusursuz mu?
- [ ] Tema geçişleri 60fps akıcılıkta mı?

---

> [!CAUTION]
> A4 sayfasındaki herhangi bir tema sızıntısı (leakage), klinik raporlama standartlarını ihlal eder. Bu yüzden Faz 4 testleri geçilmeden canlıya alınamaz.

---

## 🛑 Mevcut Durum Analizi ve Güncellenmiş Eylem Planı (Eksikler)

Yapılan kod incelemesi sonucunda "v3.0 Ultra Premium" vizyonunun büyük oranda henüz uygulanmadığı tespit edilmiştir:

1. **`theme-tokens.css` Eksikliği**: Sistemde henüz HSL tabanlı merkezi bir renk değişken dosyası oluşturulmamıştır.
2. **Tailwind Konfigürasyonu**: `tailwind.config.js` hala statik HEX (`#fafafa` vb.) fallback'leri kullanmakta olup tam HSL matrix'ine geçirilmemiştir.
3. **A4 İzolasyon Zafiyeti**: `tailwind.css` içindeki `@media print` ve `.worksheet-page` ayarlarında `all: revert !important` veya `all: initial` gibi güçlü bir CSS izolasyon katmanı bulunmamaktadır (sadece background: white ve margin ayarları vardır).
4. **Admin UI ve Dinamik Komponentler**: Etkileşim tasarımı (Micro-Animations) ve temaya dayalı `backdrop-blur` (glassmorphism) eksiktir.

**Güncel Görev Dağılımı (Ajanlara Atanacaklar):**

- **Görev 1 (Bora Demir - Mühendislik):** `src/styles/theme-tokens.css` dosyasının yaratılması ve `tailwind.config.js`'in HSL değişkenlerini (örn: `hsl(var(--c-zinc-50))`) kullanacak şekilde güncellenmesi.
- **Görev 2 (Bora Demir & Ahmet Kaya):** `tailwind.css` veya merkezi bir CSS dosyası içerisinde `.worksheet-page` elementleri için (özellikle print mode'da) `all: revert !important` izolasyonunun uygulanması.
- **Görev 3 (Elif Yıldız & Selin Arslan):** Dinamik renk paleti (`saturation` yeteneği) ile "Success Glow" ve diğer mikro-etkileşimlerin komponentlere (Admin Dashboard, Studios) entegre edilmesi.

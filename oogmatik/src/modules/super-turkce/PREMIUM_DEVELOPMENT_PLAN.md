# 🚀 Süper Türkçe: Ultra-Premium Geliştirme Planı (V2)

Bu belge, Süper Türkçe modülünü kognitif mimari, interaktif bileşen yönetimi ve yapay zeka üretim kalitesi açısından "Ultra-Premium" seviyeye taşıyacak profesyonel geliştirme planıdır.

## 1. Mimari Vizyon: "Modüler Kognitif Tasarım"

Sistem, statik şablonlardan **"Seçilebilir Bileşen Bloğu" (Modular Component Blocks)** mantığına evrilmektedir. Kullanıcı, bir etkinlik üretirken sadece konu seçmekle kalmayacak, sayfanın hangi "fonksiyonel bloklardan" oluşacağını (Lego parçaları gibi) kendisi belirleyecektir.

### Temel Prensipler:

- **Seçici Üretim:** Kullanıcı hangi bileşeni (tik ile) seçtiyse AI sadece o bileşen için içerik üretir.
- **Konfigüre Edilebilir Bloklar:** Her blok, seçildiğinde kendine has "Premium Ayarlar" (Zorluk, Soru Tipi, Görsel Desteği) panelini açar.
- **Dinamik Yerleşim (Layout Engine):** Seçilen blokların sayısına ve boyutuna göre A4 sayfası otomatik olarak en verimli şekilde dizayn edilir.

---

## 2. Ultra-Premium Geliştirme Checklist'i

### ✅ FAZ 1: Altyapı ve Veri Modeli (Stabilizasyon)

- [ ] **1.1. Merkezi Tasarım Store'u:** `useSuperTurkceDesignerStore` (Zustand) oluşturulması. Seçilen bileşenlerin state'ini ve ayarlarını tutacak.
- [ ] **1.2. MEB Müfredat Ontolojisi:** 1-8. sınıf arası kazanımların (K4-K8) ve Tier-2/3 kelime listelerinin sisteme entegre edilmesi.
- [ ] **1.3. Bileşen Kayıt Sistemi (Registry):** 60 farklı formatın (6 modül x 10 format) metadata ve JSON Schema tanımlarının tamamlanması.

### ✅ FAZ 2: Akıllı Kokpit (UI/UX)

- [ ] **2.1. Bileşen Havuzu:** Kullanıcının tıklayarak aktif/pasif edebileceği "Bileşen Kartları" arayüzü.
- [ ] **2.2. Şartlı Ayarlar Paneli:** Bir bileşen seçildiğinde (örn: 5N1K), ona özel "Haber Türü", "Çeldirici Oranı" gibi ayarların dinamik olarak belirmesi.
- [ ] **2.3. Sayfa İskeleti (Skeleton View):** A4 sayfasının doluluk oranını gösteren canlı önizleme barı.

### ✅ FAZ 3: AI Üretim Motoru (V3 Prompt Engineering)

- [ ] **3.1. Atomik Prompt Yapısı:** Toplu istek yerine, her bileşen için özelleşmiş, disleksi hassasiyetli "System Instruction" setleri.
- [ ] **3.2. LGS/PISA Standartları:** 8. sınıf seviyesinde muhakeme gücü yüksek, gerçekçi çeldiricilere sahip soru üretim mantığı.
- [ ] **3.3. Pedagojik Auditor:** Üretilen içeriğin MEB müfredatına ve yaş grubuna uygunluğunu denetleyen AI süzgeci.

### ✅ FAZ 4: PDF ve Render Motoru (Matbaa Kalitesi)

- [ ] **4.1. Stack-Layout Sistemi:** `A4PrintableSheetV2`'nin blok bazlı (sıralanabilir) render yapısına geçirilmesi.
- [ ] **4.2. Dinamik Vektörel Çizimler:** Venn diyagramları, zihin haritaları ve akış şemaları için SVG tabanlı dinamik render desteği.
- [ ] **4.3. Premium Branding:** Kurum adı, logo ve filigranın (watermark) profesyonel yerleşimi.

---

## 3. Modül Bazlı Premium Formatlar (10x6 Stratejisi)

| Modül               | Öne Çıkan "Premium" Bileşenler                                               | Mantıksal Farkı                                                |
| :------------------ | :--------------------------------------------------------------------------- | :------------------------------------------------------------- |
| **Okuma Anlama**    | 5N1K Haber, Karakter DNA'sı, Metinler Arası Köprü, İnfografik Okuma.         | Metni analiz eder, tablo ve grafiklere döker.                  |
| **Söz Varlığı**     | Kelime Ağı (Mapping), Deyim Atölyesi, Etimoloji Giriş, Görsel Sözlük.        | Kelimeyi ezberletmez, bağlam ve köken analizi yaptırır.        |
| **Dil Bilgisi**     | Cümle Analizörü, Ek-Kök Labı, Fiilimsi Dedektifi, Anlatım Bozukluğu Kliniği. | Dilin matematiğini mekanik parçalarla kavratır.                |
| **Mantık Muhakeme** | Akıl Yürütme Zinciri, Neden-Sonuç Ağı, Grafik Yorumlama, Önerme Doğrulama.   | LGS tarzı "Yeni Nesil" üst düzey düşünme becerisi odaklıdır.   |
| **Yazım-Noktalama** | Büyük Harf Polisi, Noktalama Labirenti, Yazım Yanlışı Avı, Alıntı Labı.      | Gerçek hayat metinlerindeki (E-posta, Haber) hataları onartır. |
| **Ses Olayları**    | Ses İstatistiği, Yumuşama Çarkı, Kaynaştırma Avı, Fonetik Analiz Labı.       | Fonolojik farkındalığı disleksi dostu görsellerle pekiştirir.  |

---

## 4. Teknik Uygulama Notları

- **JSON Schema:** AI'ya gönderilecek şema, kullanıcının seçtiği bloklara göre `schemaBuilder` tarafından dinamik olarak oluşturulacaktır.
- **Failover:** Eğer bir bileşen üretilemezse, sistem "Hızlı Mod" (statik/algoritmik) verileriyle o boşluğu doldurarak stabiliteyi koruyacaktır.
- **Önbellekleme:** Sık kullanılan kazanımlar için üretilen kaliteli içerikler `archiveHistory` üzerinden tekrar kullanılabilecektir.

---

**Doküman Sahibi:** Opencode AI
**Versiyon:** 2.0.0 (Ultra-Premium)
**Durum:** Planlama Tamamlandı / Uygulamaya Hazır
**Tarih:** 17 Mart 2026

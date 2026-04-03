# Oogmatik - Etkinlik Yönetim Mimarisi ve AI Üretim Motoru (v2.0)

## 1. Genel Bakış

Oogmatik platformu, Özel Öğrenme Güçlüğü (Disleksi, Diskalkuli, Disgrafi vb.), DEHB ve Otizm Spektrum Bozukluğu (OSB) yaşayan Türk çocuklar için **yapay zeka (Gemini 2.5 Flash) destekli kişiselleştirilmiş eğitim materyali** üreten, 100'den fazla farklı etkinlik tipi ve dinamik arayüz (stüdyo) motorlarına sahip entegre bir sistemdir.

Bu doküman, sistemin etkinlik veri modellerini, AI üretim akışlarını, pedagojik kısıtlamalarını ve stüdyolar (Routing) arası çalışma kitapçığı (Workbook) entegrasyonlarını kapsar. Oogmatik'in geliştirme süreci modüler ve ölçeklenebilir yapıyı korumak adına **fazlandırılmış (Phased)** bir yaklaşımla tasarlanmıştır.

---

## 2. Geliştirme Fazları ve Stratejik Yol Haritası

Sistem mimarisi, modüler büyüme hedefleri doğrultusunda aşağıdaki fazlara ayrılmıştır:

### Faz 1: Temel Çekirdek ve AI Entegrasyonu (Tamamlandı)
- **Yapay Zeka Motoru:** Gemini 2.5 Flash tabanlı ana metin ve içerik üretim altyapısının kurulması.
- **Pedagojik Zemin:** ZPD (Yakınsal Gelişim Alanı) uyumu ve `pedagogicalNote` zorunluluğunun sisteme entegrasyonu.
- **Temel UI:** Lexend fontu ve disleksi dostu tasarım (satır aralığı, kontrast) standartlarının benimsenmesi.
- **Güvenlik:** Rate limiting, 2000 karakterlik giriş sınırı ve prompt injection koruma katmanları.

### Faz 2: Kapsamlı Etkinlik Modülleri ve Stüdyolar (Aktif)
- **Okuma ve Dil Becerileri (Süper Türkçe):** Harf-Görsel eşleştirme, heceleme laboratuvarı, eş/zıt anlamlı kelimeler, dil bilgisi düzeltmeleri, 5N1K metin anlama testleri.
- **Matematik ve Mantık (Math Studio):** Sayısal mantık bilmeceleri, dört işlem pratikleri, saat okuma, mekansal sıralama problemleri.
- **Görsel ve Mekansal Algı (Infographic Studio):** 96'dan fazla SVG/İnfografik varyantı ile hikaye haritalama, labirentler, kavram ağaçları.
- **Karma Sınav ve Değerlendirme:** Birden fazla aktivitenin tek bir test formatında harmanlandığı, anında PDF/Baskı formatına geçirilebilen ölçme modülleri.

### Faz 3: Gelişmiş Entegrasyon ve Arşiv Sistemi (Devam Ediyor)
- **Gelişmiş Routing:** Firebase entegrasyonu ile oluşturulmuş çalışma kağıtlarının orijinal stüdyosunda yeniden açılabilmesi (`ActivityType` bazlı akıllı yönlendirme).
- **JSON Repair Motoru:** AI API'lerinden gelen bozuk formatların (eksik parantezler, markdown tag'leri vb.) sistem üzerinde otonom tamiri.
- **Batch İşleme:** Yoğun üretim taleplerinde 5'li gruplar halinde paralel önbelleğe alma (cache-aware processing).

### Faz 4: Makine Öğrenmesi ile Geri Bildirim Döngüsü (Gelecek Vizyon)
- Öğrencinin gelişimine göre zorluk seviyesini otomatik kalibre eden adaptif ölçme sistemi.
- Geçmiş verilere dayanarak, uzman eğitmene dinamik içerik varyasyonları sunan öneri motoru.

---

## 3. Yapay Zeka (AI) Üretim Motoru ve Prompt Mimarisi

Oogmatik, içerik üretiminde yalnızca Gemini 2.5 Flash (`services/geminiClient.ts`) motorunu kullanır. Stabiliteyi ve hatasızlığı garanti etmek için aşağıdaki mimari benimsenmiştir:

### JSON Repair (Onarım) Motoru (3 Katmanlı Savunma)
Modelden dönen metinlerin nadiren JSON formatını bozması ihtimaline karşı sistem şu adımları izler:
1. `balanceBraces`: Eksik veya fazla süslü parantezleri ( `{`, `}` ) dengeler.
2. `truncate`: JSON formatına ait olmayan (örneğin giriş metinleri) gereksiz "markdown" (` ```json `) tag'lerini temizler.
3. `parse`: Saf JSON'a dönüştürerek `Zod` şeması üzerinden validate eder (`utils/schemas.ts`).

### Prompt Injection Koruması
Öğretmen / Uzman tarafından girilen tüm özel talimatlar (Prompts) sanitize edilir. Kötü niyetli komutlardan ("Jailbreak") kaçınmak için **2000 karakterlik sabit giriş koruması** uygulanır. Limit aşımı olan büyük isteklerde sistem yığılmayı önlemek için **Batch (5'li gruplar) halinde** paralel üretim (`cacheService.ts`) yapar.

---

## 4. Pedagojik ve Klinik Standartlar (Mutlak Kurallar)

Bir etkinliğin ekranda veya PDF'de sunulabilmesi için aşağıdaki kural setlerinden (%100) geçmesi gerekir:

### 4.1. Pedagogical Note Zorunluluğu
Üretilen **HER** AI aktivite JSON çıktısında `pedagogicalNote` alanı bulunmak zorundadır. Bu alan çocuğa gösterilmez; uzman öğretmene etkinliğin *neden* bu şekilde üretildiğini açıklar.

### 4.2. ZPD (Yakınsal Gelişim Alanı) Uyumu
Etkinlik içerikleri, çocuğun `AgeGroup` ve `Difficulty` parametrelerinin çaprazlanması ile belirlenir. Sistemin her yeni ilk aktivite maddesi, özgüven inşası açısından kasten "Kolay" çerçevede üretilir.

### 4.3. Disleksi UI/UX Standardı
Sistemdeki tüm metinler, harf aralıkları ayarlanmış `Lexend` fontu ile render edilir. Uzun paragraflar asla sıkışık gösterilmez, altı çizili veya tamamı büyük harf (ALL CAPS) kullanımından kasten kaçınılır.

---

## 5. Arşiv, Çalışma Kitapçığı ve Stüdyo Entegrasyonu (Routing)

### Kayıt Mekanizması (Workbook & Archive)
Stüdyolarda "Kaydet" veya "Çalışma Kitapçığına Ekle" işlevleri tetiklendiğinde:
- Geçici durum (`activeWorksheet`), tekil format olan `SingleWorksheetData` modeline dönüştürülür.
- Etkinliğin `fontSize`, `marginMm`, `columns` gibi dizgi/baskı metrikleri `settings` altında dondurularak DB'ye aktarılır.

### Arşivden Geri Çağırma (Gelişmiş Routing)
Önceden oluşturulup Firebase'e arşivlenmiş etkinlikler tıklandığında `App.tsx` içindeki `loadSavedWorksheet` dinleyicisine düşer ve `ActivityType` verisine göre uygun stüdyoya yönlendirilir:
- `ActivityType.SINAV` → Sınav Stüdyosu
- `ActivityType.MAT_SINAV` → Mat Sınav Stüdyosu
- `ActivityType.MATH_STUDIO` → Matematik Atölyesi
- `INFOGRAPHIC_...` varyantları → İnfografik Stüdyosu
- `PREMIUM_STUDIO` / `SUPER_TURKCE_...` → Süper Türkçe Modülü
- Diğerleri → Genel Jeneratör (`GeneratorView`)

---

## 6. Geliştiriciler İçin: Yeni Etkinlik Tipi Eklerken İzlenecek Adımlar (Workflow)

Eğer platforma yeni bir oyun veya ölçme formatı ekleyecekseniz şu kontrol listesini (Checklist) uygulayın:

1. **Sabitler ve Tipler:**
   - `src/types/activity.ts` içerisindeki `ActivityType` Enum nesnesine yeni tipi ekleyin.
   - `src/constants.ts` içindeki `ACTIVITIES` listesine yeni etkinliğin başlığını, ikonunu ve zorluk ayarlarını kaydedin.
2. **AI Üretim Şablonu:**
   - `services/generators/` klasöründe bu etkinlik için bir AI prompt metni ve buna karşılık gelen Zod Schema (`schemas.ts`) oluşturun. `pedagogicalNote` alanı zorunlu olmalıdır.
3. **UI ve Rendering:**
   - Standart düz metin dışındaysa, kendi görsel dizgi komponentini (örn. `SheetRenderer.tsx`) tasarlayın. Tipler `any` olamaz, özel interface (Type Guard) yapısına sahip olmalıdır.
4. **Stüdyo Yönlendirmesi:**
   - Yeni "Stüdyo" inşa edildiyse, `App.tsx`'teki `loadSavedWorksheet` fonksiyonuna ilgili "if" şart bloğunu ekleyin.
5. **Rate Limiting & Hata Fırlatma:**
   - Yeni API/AI uç noktaları mutlaka `RateLimiter` denetiminden geçmeli ve `AppError` (`utils/AppError.ts`) sınıfını kullanmalıdır.

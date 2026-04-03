# Oogmatik - Etkinlik Yönetim Mimarisi ve AI Üretim Motoru (v2.0)

## 1. Genel Bakış

Oogmatik platformu, Özel Öğrenme Güçlüğü (Disleksi, Diskalkuli, Disgrafi vb.), DEHB ve Otizm Spektrum Bozukluğu (OSB) yaşayan Türk çocuklar için **yapay zeka (Gemini 2.5 Flash) destekli kişiselleştirilmiş eğitim materyali** üreten, 100'den fazla farklı etkinlik tipi ve dinamik arayüz (stüdyo) motorlarına sahip entegre bir sistemdir.

Bu doküman, sistemin etkinlik veri modellerini, AI üretim akışlarını, pedagojik kısıtlamalarını ve stüdyolar (Routing) arası çalışma kitapçığı (Workbook) entegrasyonlarını kapsar.

---

## 2. Kapsamlı Etkinlik Kataloğu ve Kategorizasyon

Sistemdeki etkinlikler `src/constants.ts` ve `src/types/activity.ts` üzerinde modüler olarak tanımlanmıştır. Etkinlikler 4 ana modül etrafında şekillenmektedir:

1. **Okuma ve Dil Becerileri (Reading Studio / Süper Türkçe):**
   - Harf-Görsel eşleştirme, heceleme laboratuvarı, eş/zıt anlamlı kelimeler, dil bilgisi düzeltmeleri, 5N1K metin anlama testleri.
2. **Matematik ve Mantık (Math Studio / Mat Sınav Stüdyosu):**
   - Sayısal mantık bilmeceleri, dört işlem pratikleri, saat okuma, mekansal sıralama problemleri.
3. **Görsel ve Mekansal Algı (Infographic Studio / Görsel Tasarım):**
   - 96'dan fazla SVG/İnfografik varyantı ile hikaye haritalama, labirentler, kavram ağaçları.
4. **Karma Sınav ve Değerlendirme (Sınav Stüdyosu):**
   - Birden fazla aktivitenin tek bir test formatında (Çoktan seçmeli, açık uçlu vb.) harmanlandığı, anında PDF/Baskı formatına geçirilebilen ölçme modülleri.

_Her etkinlik tipi (`ActivityType`), ilgili stüdyoda benzersiz bir şema (JSON Schema) ile tanımlıdır._

---

## 3. Yapay Zeka (AI) Üretim Motoru ve Prompt Mimarisi

Oogmatik, içerik üretiminde yalnızca Gemini 2.5 Flash (`services/geminiClient.ts`) motorunu kullanır. Stabiliteyi ve hatasızlığı garanti etmek için aşağıdaki mimari benimsenmiştir:

### JSON Repair (Onarım) Motoru (3 Katmanlı Savunma)

Modelden dönen metinlerin nadiren JSON formatını bozması ihtimaline karşı sistem şu adımları izler:

1. `balanceBraces`: Eksik veya fazla süslü parantezleri ( `{`, `}` ) dengeler.
2. `truncate`: JSON formatına ait olmayan (örneğin giriş metinleri) gereksiz "markdown" (` ```json `) tag'lerini temizler.
3. `parse`: Saf JSON'a dönüştürerek `Zod` şeması üzerinden validate eder (`utils/schemas.ts`).

### Prompt Injection Koruması

Öğretmen / Uzman tarafından girilen tüm özel talimatlar (Prompts) sanitize edilir. Kötü niyetli "Sistem kurallarını unut" tarzı (Jailbreak) komutlardan kaçınmak için 2000 karakterlik sabit bir input koruması uygulanır. Limit aşımı olan büyük isteklerde (10+ üretim) sistem, yığılmayı (Timeout) önlemek için **Batch (5'li gruplar) halinde** paralel üretim (`cacheService.ts`) yapar.

---

## 4. Pedagojik ve Klinik Standartlar (Mutlak Kurallar)

Bir etkinliğin ekranda veya PDF'de sunulabilmesi için aşağıdaki kural setlerinden (%100) geçmesi gerekir:

### 4.1. Pedagogical Note Zorunluluğu

Üretilen **HER** AI aktivite JSON çıktısında `pedagogicalNote` alanı bulunmak zorundadır. Bu alan çocuğa gösterilmez; uzman öğretmene etkinliğin _neden_ bu şekilde üretildiğini (örn: "Öğrenci 'b' ve 'd' harflerini karıştırdığı için çeldiriciler buna göre seçilmiştir") açıklar.

### 4.2. ZPD (Yakınsal Gelişim Alanı) Uyumu

Etkinlik içerikleri, çocuğun `AgeGroup` (Yaş: 5-7, 8-10, 11-13, 14+) ve `Difficulty` (Zorluk: Kolay, Orta, Zor) parametrelerinin çaprazlanması ile belirlenir. Sistemdeki "İhtiyaç Analizi", her yeni üretilecek olan ilk aktivite maddesini, güven inşası (özgüven) açısından kasten "Kolay" seviyede oluşturur.

### 4.3. Disleksi UI/UX Standardı

Sistemdeki tüm metinler, harf aralıkları (tracking) özel olarak ayarlanmış `Lexend` fontu ile render edilir. Uzun paragraflar asla sıkışık gösterilmez (Geniş `line-height`), altı çizili veya tamamı büyük harf (ALL CAPS) kullanımından kasten kaçınılır.

---

## 5. Arşiv, Çalışma Kitapçığı ve Stüdyo Entegrasyonu (Routing)

### Kayıt Mekanizması (Workbook & Archive)

Stüdyolarda "Kaydet" veya "Çalışma Kitapçığına Ekle" işlevleri tetiklendiğinde;

- Sistem, geçici durumu (`activeWorksheet`) tekil format olan `SingleWorksheetData` modeline dönüştürür.
- Etkinliğin `fontSize`, `marginMm`, `columns` gibi dizgi/baskı (Print) metrikleri `settings` altında dondurularak veritabanına aktarılır.

### Arşivden Geri Çağırma (Gelişmiş Routing)

Önceden oluşturulup Firebase'e arşivlenmiş etkinlikler "Materyaller" sekmesinden veya ana arama üzerinden tıklandığında `App.tsx` içindeki `loadSavedWorksheet` dinleyicisine düşer.
**Sistem `ActivityType` verisine bakarak etkinliği ait olduğu orijinal stüdyosuna geri döndürür:**

- `ActivityType.SINAV` → Sınav Stüdyosuna (`SinavStudyosu`)
- `ActivityType.MAT_SINAV` → Mat Sınav Stüdyosuna (`MatSinavStudyosu`)
- `ActivityType.MATH_STUDIO` → Matematik Atölyesine (`MathStudio`)
- `INFOGRAPHIC_...` varyantları → İnfografik Stüdyosuna
- `PREMIUM_STUDIO` / `SUPER_TURKCE_...` → Süper Türkçe Modülüne
- Bunların dışında kalanlar (Eski Standart) → Genel Jeneratöre (`GeneratorView`) aktarılır. Bu sayede öğretmenler ürettikleri testleri, yıllar sonra bile aynı yetenek setiyle (düzenleme, tekrar yazdırma, format atma) tekrar açıp modifiye edebilirler.

---

## 6. Geliştiriciler İçin: Yeni Etkinlik Tipi Eklerken İzlenecek Adımlar

Eğer platforma yeni bir oyun veya ölçme formatı ekleyecekseniz şu kontrol listesini (Checklist) uygulayın:

1. **Sabitler ve Tipler:**
   - `src/types/activity.ts` içerisindeki `ActivityType` Enum nesnesine yeni tipi (örn: `GIZLI_HECE_BULMACA`) ekleyin.
   - `src/constants.ts` içindeki `ACTIVITIES` listesine yeni etkinliğin başlığını, ikonunu ve zorluk ayarlarını (defaultStyle) kaydedin.
2. **AI Üretim Şablonu:**
   - `services/generators/` klasöründe bu etkinlik için bir AI prompt metni ve buna karşılık gelen Zod Schema (`schemas.ts`) oluşturun. Unutmayın, `pedagogicalNote` alanı schema içerisinde zorunlu olmalıdır.
3. **UI ve Rendering:**
   - Eğer bu etkinlik standart düz metin değilse, kendi görsel dizgi komponentini (örneğin `SheetRenderer.tsx` içerisinde veya yeni bir stüdyo olarak) tasarlayın. Kullanılan tüm tipler `any` değil, özel interface (Type Guard) yapısına sahip olmalıdır.
4. **Stüdyo Yönlendirmesi:**
   - Şayet yepyeni bir "Stüdyo" inşa edildiyse, arşivden tıklanınca bu stüdyoya gidilmesi için `App.tsx`'teki `loadSavedWorksheet` fonksiyonuna yeni bir "if" şartı bloğu yazmayı unutmayın.
5. **Rate Limiting & Hata Fırlatma:**
   - Yeni yazılan AI fonksiyonları mutlaka `RateLimiter` denetiminden geçmeli ve herhangi bir arıza anında konsola raw error basmak yerine Oogmatik standartlarındaki `AppError` (`utils/AppError.ts`) sınıfını fırlatmalıdır.

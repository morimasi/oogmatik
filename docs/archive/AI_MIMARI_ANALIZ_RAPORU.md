## **Yazılım Mimarisi Analiz ve İyileştirme Raporu**

**Tarih:** 10.03.2026
**Hazırlayan:** Gemini AI Yazılım Mimarı

### 1. Yönetici Özeti (Executive Summary)

Proje, modern teknolojiler (React, Vite, TypeScript) üzerine inşa edilmiş ve özellikle `MathStudio` gibi modüllerde görüldüğü üzere, kullanıcı arayüzü katmanında iyi tasarlanmış, modüler bir mimariye sahiptir. Bu, projenin geliştirilebilirliği için sağlam bir temel oluşturmaktadır.

Ancak, bu sağlam temelin altında, projenin güvenliğini, performansını ve uzun vadeli sürdürülebilirliğini tehdit eden **kritik ve yüksek öncelikli** sorunlar tespit edilmiştir:

*   **Kritik Güvenlik Açığı:** Firebase ve Google AI API anahtarları, doğrudan istemci tarafı koduna gömülmüştür. Bu, projenizin tüm veritabanına ve yapay zeka servislerine yetkisiz erişime kapı açan, acil müdahale gerektiren bir durumdur.
*   **Sıfır Test Kapsamı:** Projede hiçbir otomatik test bulunmamaktadır. Bu, her yeni değişikliğin mevcut sistemi bozma (regresyon) riski taşıdığı ve bakım maliyetlerini katlanarak artırdığı anlamına gelir.
*   **Ciddi Performans ve Maliyet Sorunları:** Veritabanı kullanımı verimsizdir. Tüm verilerin tek seferde çekilmesi ve istemci tarafında işlenmesi, hem uygulama performansını düşürmekte hem de Firestore okuma maliyetlerini gereksiz yere artırmaktadır.
*   **Yüksek Teknik Borç:** Projenin bağımlılıkları güncel değildir ve `npm audit` tarafından raporlanan 18 adet güvenlik açığı içermektedir. Ayrıca, online ve offline içerik üretme mantığı arasındaki ciddi kod tekrarı, bakım verimliliğini düşürmektedir.

Bu rapor, bu temel sorunları çözmek ve projenin potansiyelini tam olarak ortaya çıkarmak için somut, önceliklendirilmiş bir eylem planı sunmaktadır.

---

### 2. Detaylı Teknik Bulgular

#### 2.1. Kod Kalitesi ve Güvenlik

*   **[KRİTİK] Hardcoded API Anahtarları:**
    *   **Bulgu:** `services/firebaseClient.ts` dosyasında, Firebase konfigürasyon bilgileri (`apiKey`, `projectId` vb.) doğrudan kodun içine yazılmıştır.
    *   **Risk:** Bu anahtarlar, tarayıcıda çalışan kodda herkes tarafından görülebilir. Kötü niyetli bir kullanıcı bu anahtarları ele geçirerek veritabanınızı okuyabilir, değiştirebilir, silebilir ve projeniz adına yüksek maliyetli AI işlemleri yapabilir.
    *   **Çözüm:** Tüm hassas anahtarlar derhal koddan çıkarılmalı ve Vite'ın desteklediği `.env.local` dosyası kullanılarak ortam değişkenleri (environment variables) ile yönetilmelidir.

*   **[YÜKSEK] Güvenlik Açığı İçeren Bağımlılıklar:**
    *   **Bulgu:** `npm install` sonrası yapılan denetimde, projede 12'si orta, 6'sı yüksek seviyede olmak üzere toplam 18 güvenlik açığı tespit edilmiştir. React ve Firebase gibi ana kütüphaneler de dahil olmak üzere paketler güncel değildir.
    *   **Risk:** Eski paketler, bilinen ve sömürülebilir güvenlik açıklarını barındırabilir.
    *   **Çözüm:** `npm audit fix` komutu çalıştırılmalı ve tüm bağımlılıklar dikkatli bir şekilde en son kararlı sürümlerine yükseltilmelidir.

*   **[YÜKSEK] Kod Tekrarı (DRY Prensibi İhlali):**
    *   **Bulgu:** `services/generators` (online) ve `services/offlineGenerators` (offline) klasörleri arasında ciddi bir kod tekrarı mevcuttur. Aynı amaca hizmet eden aktiviteler (örn: `fiveWOneH.ts`), iki farklı yerde tamamen farklı mantıklarla kodlanmıştır.
    *   **Risk:** Bakım maliyetini ikiye katlar. Bir mantık değişikliği gerektiğinde, iki ayrı dosyanın güncellenmesi gerekir, bu da hata yapma olasılığını artırır.
    *   **Çözüm:** "Strateji (Strategy)" tasarım deseni kullanılarak ortak bir soyutlama katmanı oluşturulmalıdır. Her aktivite için tek bir `ActivityGenerator` arayüzü olmalı ve bu arayüz, çalışma zamanında seçilen `OnlineStrategy` veya `OfflineStrategy`'yi kullanarak içerik üretmelidir.

#### 2.2. Performans

*   **[YÜKSEK] Verimsiz Veri Çekme ve Sayfalama Eksikliği:**
    *   **Bulgu:** `SavedWorksheetsView.tsx` bileşeni, kullanıcının sahip olduğu **tüm** çalışma sayfalarını, raporları ve planları sayfa yüklenirken tek bir seferde çekmektedir (`pageSize: 1000`).
    *   **Risk:** Kullanıcının kayıt sayısı arttıkça ilk yükleme süresi dramatik olarak artar, kullanıcı deneyimi kötüleşir ve çok sayıda doküman okunduğu için Firestore maliyetleri yükselir.
    *   **Çözüm:** Hem backend (Firestore sorguları) hem de frontend katmanlarında **sayfalama (pagination)** mekanizması uygulanmalıdır. Veritabanından sadece görüntülenen sayfa için gerekli olan veri (örn: 20 kayıt) çekilmelidir.

*   **[YÜKSEK] İstemci Tarafı Sıralama ve Filtreleme:**
    *   **Bulgu:** Tüm veriler çekildikten sonra sıralama, arama ve filtreleme işlemleri istemci tarafında (`useMemo` içinde) yapılmaktadır.
    *   **Risk:** Binlerce kaydı istemcinin tarayıcısında filtrelemek veya sıralamak, özellikle düşük güçlü cihazlarda uygulamayı dondurabilir.
    *   **Çözüm:** Bu işlemler veritabanı seviyesine taşınmalıdır. Firestore'un `orderBy()` ve `where()` fonksiyonları kullanılarak sunucu tarafında verimli sorgular oluşturulmalıdır.

*   **[ORTA] Verimsiz Veri Saklama (JSON Stringification):**
    *   **Bulgu:** `worksheetService.ts` içinde, çalışma sayfası verileri (`worksheetData`) bir JSON string'ine dönüştürülerek (`JSON.stringify`) Firestore'a kaydedilmektedir.
    *   **Risk:** Bu, Firestore'un güçlü indeksleme ve sorgulama yeteneklerini tamamen devre dışı bırakır. Veri içinde arama yapılamaz.
    *   **Çözüm:** Veriler, Firestore'un desteklediği doğal nesne ve dizi formatlarında saklanmalıdır.

#### 2.3. Mimari ve Tasarım

*   **[OLUMLU] Yüksek Tutarlılığa Sahip UI Mimarisi:**
    *   **Bulgu:** `MathStudio` modülü, sorumlulukların özel hook'lara (custom hooks) dağıtıldığı, bileşenlerin ve panellerin mantıksal olarak ayrıldığı, temiz ve modüler bir yapıya sahiptir. Bu, kodun okunabilirliğini ve bakımını kolaylaştırır.

*   **[ORTA] "Fat Hooks" (Şişman Hook'lar) Deseni:**
    *   **Bulgu:** İş mantığının büyük bir kısmının hook'lar içinde toplanması, bu hook'ları karmaşıklaştırabilir ve test edilmelerini zorlaştırabilir.
    *   **Çözüm:** Saf iş mantığı (API çağrıları, veri işleme vb.), hook'ların dışına, bağımsız ve test edilebilir fonksiyonlara taşınabilir.

#### 2.4. Test Stratejisi

*   **[KRİTİK] Sıfır Test Kapsamı:**
    *   **Bulgu:** Projede `.test.ts` veya `.spec.ts` uzantılı hiçbir dosya bulunmamaktadır. Bu, otomatik testlerin olmadığını gösterir.
    *   **Risk:** Değişiklik yapma korkusu, yavaş geliştirme süreci, üretimde ortaya çıkan öngörülemeyen hatalar ve yüksek bakım maliyetleri.
    *   **Çözüm:** Acilen bir test stratejisi oluşturulmalıdır. **Vitest** ve **React Testing Library** kullanılarak test altyapısı kurulmalı; işe ilk olarak kritik yardımcı fonksiyonlar ve servislerden başlanmalıdır.

#### 2.5. Dokümantasyon ve Standartlar

*   **[OLUMLU] İyi Durumda README Dosyası:**
    *   **Bulgu:** `README.md` dosyası, projenin amacını, teknoloji yığınını ve kurulum adımlarını iyi bir şekilde açıklamaktadır.

*   **[DÜŞÜK] Eksik API Dokümantasyonu ve Kod Standartları:**
    *   **Bulgu:** API endpoint'leri için bir dokümantasyon ve kod stilini zorunlu kılan `ESLint`/`Prettier` gibi araçlar eksiktir.
    *   **Çözüm:** Projeye `ESLint` ve `Prettier` entegre edilmeli, API için ise `Swagger`/`OpenAPI` veya basit bir markdown dokümanı oluşturulmalıdır.

---

### 3. İyileştirme Planı ve Öncelik Matrisi

Aşağıdaki matris, tespit edilen sorunları etki ve eforlarına göre sınıflandırarak bir yol haritası sunar.

| Sorun | Öncelik | Tahmini Efor | Risk | Etki |
| :--- | :--- | :--- | :--- | :--- |
| Hardcoded API Anahtarları | **KRİTİK** | Düşük | Çok Yüksek | Güvenlik, Maliyet |
| Sıfır Test Kapsamı | **KRİTİK** | Yüksek | Yüksek | Stabilite, Bakım, Hız |
| Verimsiz Veri Çekme (Sayfalama Yok) | **YÜKSEK** | Orta | Orta | Performans, Maliyet, UX |
| Güvenlik Açığı İçeren Bağımlılıklar | **YÜKSEK** | Orta | Yüksek | Güvenlik |
| Kod Tekrarı (Generators) | **YÜKSEK** | Yüksek | Orta | Bakım, Stabilite |
| İstemci Tarafı Filtreleme/Sıralama | **YÜKSEK** | Orta | Düşük | Performans, Maliyet |
| Verimsiz Veri Saklama (JSON String) | **ORTA** | Orta | Düşük | Performans, Ölçeklenebilirlik |
| "Fat Hooks" Mimarisi | **ORTA** | Orta | Düşük | Test Edilebilirlik, Bakım |
| Eksik Kod Standartları (Linter/Formatter) | **DÜŞÜK** | Düşük | Düşük | Kod Kalitesi, Okunabilirlik |
| Eksik API Dokümantasyonu | **DÜŞÜK** | Düşük | Düşük | Geliştirici Verimliliği |

---

### 4. Uygulama Yol Haritası

#### Faz 1: Acil Güvenlik ve Performans İyileştirmeleri (1-2 Hafta)

*   **Görev 1 (1. Gün):** Ortam değişkenleri (`.env`) kullanarak tüm hardcoded API anahtarlarını koddan temizle.
*   **Görev 2:** `npm audit fix` ve manuel güncellemeler ile tüm bağımlılıkları güvenli ve güncel sürümlere yükselt.
*   **Görev 3:** `ESLint` ve `Prettier` kurarak kod tabanında tutarlı bir stil sağla.
*   **Görev 4:** `worksheetService` ve `SavedWorksheetsView`'da sunucu tarafı sıralama ve filtrelemeyi uygula (hızlı kazanım).

#### Faz 2: Çekirdek Mimarinin İyileştirilmesi (1-2 Ay)

*   **Görev 5:** **Vitest** ve **React Testing Library** ile test altyapısını kur. Yeni yazılan tüm kodlar için test yazma standardı getir. İlk olarak `utils` ve `services` katmanındaki kritik fonksiyonlar için testler yaz.
*   **Görev 6:** `generators` ve `offlineGenerators` klasörlerini, kod tekrarını ortadan kaldıracak şekilde tek bir soyutlama altında birleştir (büyük refactoring).
*   **Görev 7:** Uygulama genelinde (başta `SavedWorksheetsView` olmak üzere) tam bir sayfalama (pagination) mekanizması uygula.
*   **Görev 8:** `worksheetService`'i, verileri JSON string olarak değil, doğal nesne olarak saklayacak şekilde refactor et. (Bu, veri migrasyonu gerektirebilir).

#### Faz 3: Sürekli İyileştirme (Devam Eden Süreç)

*   **Görev 9:** Test kapsamını (% coverage) sürekli artır.
*   **Görev 10:** API için dokümantasyon oluştur.
*   **Görev 11:** Performans metriklerini (Lighthouse, Web Vitals) izle ve gerekli optimizasyonları yap.

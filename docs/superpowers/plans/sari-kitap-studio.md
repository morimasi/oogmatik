# Sarı Kitap Etkinlik Stüdyosu Modülü Planlaması

## 1. Modül Özeti ve Amacı
Disleksili ve özel öğrenme güçlüğü yaşayan çocuklar için **Hızlı Okumaya Geçiş** ve **Bellek/Dikkat Geliştirme** amacıyla kullanılan spesifik PDF formatlarının (Pencere, Nokta, Köprü, Çift Metin) birebir dijital ortamda üretilmesini, özelleştirilmesini ve saklanmasını sağlayacak "Sarı Kitap Etkinlik Stüdyosu"nun geliştirilmesi.

### Orijinal PDF'lerden Analiz Edilen Etkinlik Formatları:
1. **Pencere (Window) Okuma**: Odaklanmayı artırmak için metinlerin sadece belirli kısımlarını gösteren yapılar.
2. **Nokta (Dot) Takibi**: Göz takibi hızını artırmak ve satır atlamayı önlemek için hece/kelimelerin altına hizalanmış nokta (`o`) işaretleri.
3. **Köprü (Bridge) Okuma**: Göz sıçraması egzersizi için heceleri/kelimeleri bağlayan yay/köprü sembolleri içeren formatlar.
4. **Çift Metin (Interleaved Text)**: İki farklı hikayenin (örn: Cici Kuş ve Kek hikayeleri) kelime kelime veya satır satır iç içe geçirildiği, odak ve dikkati bölme üzerine çalışan kompleks format.
5. **Bellek & Hızlı Okuma Geçiş Egzersizleri**: Görsel hafıza, hece tekrarları ve ritmik okuma çalışmaları.

---

## 2. Sistem Mimarisi ve Teknik Gereksinimler

### 2.1 AI Model Entegrasyonu (Gemini 2.5 Flash)
- **Prompt Mühendisliği**: Modül, "Nokta", "Köprü" veya "Çift Metin" taleplerine özel JSON dönüşleri sağlayacak şekilde eğitilecektir. 
- Çift metin üretiminde AI, bağımsız iki hikaye oluşturup, bunları kullanıcının seçtiği algoritmaya göre (kelime, satır, paragraf) harmanlayacaktır.
- **Hızlı Mod**: Referans PDF belgelerinden (veya metinlerinden) alınan örneklerle anında aynı yapıda yeni etkinlikler üretilecek.

### 2.2 Özelleştirme Paneli ve Form Kontrolleri
- **Yaş Grubu**: 5-7, 8-10, 11-13, 14+ (Orijinal projedeki `AgeGroup` tipine uygun)
- **Zorluk Seviyeleri**: Başlangıç, Orta, İleri, Uzman
- **Süre ve Hedefler**: Etkinliğin MEB standartlarında BEP (Bireyselleştirilmiş Eğitim Programı) hedeflerine uygunluğu ve pedagojik notların zorunlu tutulması.
- **Parametrik Ayarlar**: Nokta yoğunluğu, köprü boşlukları, çift metin karışım sıklığı, satır aralıkları (line-height) ve harf arası boşluk (letter-spacing).

### 2.3 Premium A4 Preview & Export Motoru
- **Tasarım Standartları**: Dark Glassmorphism, ultra-ince border'lar ve `Lexend` fontunun kesin kullanımı.
- **Preview Sistemi**: React bileşenleri ile birebir A4 ebatında ve oranında canlı önizleme.
- **Export Motoru**: `jspdf` ve `html2canvas` (veya `@react-pdf/renderer`) kullanılarak PDF, PNG ve DOCX çıktılarının alınması. Yazıcı optimizasyonu (sıfır kenar boşluğu, net siyah/beyaz kontrast).

---

## 3. Kullanıcı Deneyimi (UX) Özellikleri

- **Arşivleme ve Katalog**: Oluşturulan etkinliklerin Firebase Firestore üzerine kaydedilmesi ve kataloglanması (koleksiyon yönetimi).
- **Çalışma Kitapçığına (Workbook) Ekleme**: Modülün diğer çalışma kitapçığı sistemleriyle tam entegre çalışması.
- **Paylaşım Sistemi**: Kullanıcılar arası (öğretmen-öğrenci) uygulama içi paylaşım, link, e-posta ve sosyal medya entegrasyonu.
- **Erişilebilirlik**: WCAG 2.1 AA uyumu. Disleksi dostu maksimum okunabilirlik ve yüksek kontrastlı okuma modları. %100 tema senkronizasyonu.
- **Mobil Uyumluluk**: Mobil cihazlarda bileşenlerin A4 önizlemesinin scroll edilebilir ve zoomlanabilir şekilde gösterilmesi.

---

## 4. Test ve Doğrulama Planı (Vitest & Playwright)

1. **Uyumluluk Testleri**: 50+ farklı PDF formatı (Nokta, Köprü, Çift Metin, vb.) render algoritmalarından geçirilerek görsel uyumluluk testleri yapılacak.
2. **Stress Testi**: AI modelinden ardışık 1000+ etkinlik üretiminin hata vermeden (RateLimiter kullanılarak) tamamlanması.
3. **Kullanıcı Testleri**: 5 farklı yaş grubu (5-7, 8-10 vb.) ve 4 farklı zorluk seviyesinde çıktıların ZPD (Zone of Proximal Development) uygunluğunun kontrolü.
4. **Performans**: %99.9 uptime ve hızlı yükleme hedefleri doğrultusunda React bileşenlerinin memoization optimizasyonları yapılacak.

---

## 5. Uygulama Adımları (Roadmap)

1. **Faz 1 (Veri & Tipler)**: `types/sariKitap.ts` oluşturulması, Firestore şemalarının ve Zod doğrulayıcılarının tanımlanması.
2. **Faz 2 (AI Endpoint)**: `api/generateSariKitap.ts` endpoint'inin, rate limiter ve error handling mekanizmalarıyla kurulması.
3. **Faz 3 (UI - Özelleştirme)**: `SariKitapStudio` klasörü altında Dark Glassmorphism form bileşenlerinin kodlanması.
4. **Faz 4 (A4 Preview & Export)**: Özel algoritmaların (Nokta, Köprü, Çift Metin render fonksiyonları) ve PDF/Resim çıktı motorunun entegrasyonu.
5. **Faz 5 (Test & Optimizasyon)**: Vitest ve e2e testlerinin yazılarak sistemin 50+ varyasyonda sınanması.

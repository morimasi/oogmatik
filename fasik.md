# bdmin.vercel.app - Ultra-Premium Fasikül ve Kitapçık Modülü Mimarisi (V2.5)

## 📌 Proje Amacı
Eğitim içeriklerinin (sınavlar, raporlar, etkinlikler) yapay zeka destekli kürasyon ile bir araya getirilerek, profesyonel kalitede, **veritabanı entegreli** ve yüksek çözünürlüklü PDF fasiküllere dönüştürülmesini sağlayan kurumsal modül.

---

## 🏗️ 1. Gelişmiş Durum, Önbellek ve Veritabanı Yönetimi (Persistent & DB State)
Kullanıcıların saatlerce uğraşıp hazırladığı içeriklerin hiçbir koşulda kaybolmaması için çok katmanlı bir kayıt mimarisi kullanılır.

* **Merkezi Veritabanı Entegrasyonu (Database Persistence):** Oluşturulan fasiküller, içerikler ve metadata (başlık, tema vb.) PostgreSQL, MySQL veya MongoDB gibi bir veritabanında (DB) saklanır.
* **Otomatik Kayıt (Auto-Save) ve Taslak Yönetimi:** Kullanıcı arayüzde bir değişiklik yaptığında (örneğin bir sorunun yerini değiştirdiğinde), Zustand state'i güncellenir ve `debounce` (gecikmeli tetikleme) yöntemiyle arka planda API üzerinden veritabanına otomatik taslak (draft) kaydı atılır.
* **Versiyon Kontrolü (Undo/Redo):** Kullanıcının fasikülde yaptığı değişiklikleri geri alabilmesi veya ileri sarabilmesi için geçmiş (history) takibi yapılır.
* **Çoklu Oturum Senkronizasyonu (Cross-Device Sync):** Veritabanı entegrasyonu sayesinde kullanıcı masaüstünde başladığı bir fasikül tasarımına tablette veya telefonda kaldığı yerden (son kayıtlı taslaktan) devam edebilir.

## 🎨 2. Profesyonel Stüdyo Arayüzü (Pro-Builder UI)
Burası kullanıcının en çok vakit geçireceği yerdir; akıcı, etkileşimli ve veritabanı ile senkronize olmalıdır.

* **Split-View (Bölünmüş Ekran) Canlı Önizleme:** Sol tarafta sürükle-bırak (Drag & Drop - örn. `dnd-kit`) ile içerik sıralaması yapılırken, sağ tarafta PDF'in birebir nasıl görüneceğinin anlık (real-time) önizlemesi sunulur.
* **Dinamik Sayfa Yapısı:** İçindekiler tablosunun, sayfa numaralarının ve bölüm başlıklarının eklenen içeriğe göre otomatik hesaplanıp güncellenmesi.
* **Premium Şablon Galerisi (DB Destekli):** Kurum logoları, özel renk paletleri ve AI tarafından üretilmiş kapak tasarımları veritabanından çekilerek dinamik olarak uygulanır.
* **Ağ Durumu Göstergeleri:** Arayüzde "Kaydediliyor...", "Buluta Kaydedildi" (Google Docs tarzı) gibi canlı durum bildirimleri yer alır.

## 🧠 3. Yapay Zeka Destekli Kürasyon ve Analiz (Akıllı Bileşen)
Sistemi rakiplerinden ayıracak ve DB'deki verileri anlamlandıracak en büyük "Premium" özellik.

* **Akıllı İçerik Önerisi (Smart Suggestion):** Öğrencinin veritabanındaki geçmiş analiz raporlarına bakarak, sistemin otomatik olarak "Bu öğrencinin Geometri eksiği var, fasiküle şu 3 testi de eklemek ister misiniz?" şeklinde öneriler sunması.
* **Otomatik Zorluk Sıralaması:** Karışık seçilen soruların AI tarafından "Kolaydan Zora" doğru pedagojik bir sıraya dizilmesi ve bu yeni sıralamanın indeks değerleriyle DB'ye kaydedilmesi.
* **Otomatik Özet ve Veli Notu:** Eklenen tüm raporların AI ile okunup, fasikülün sonuna veli veya öğretmen için 1 paragraflık "Yönetici Özeti" yazılması.

## ⚙️ 4. Kurumsal Seviye PDF Motoru (Enterprise Render Engine)
Yüksek çözünürlüklü baskı ve sunucu yorgunluğunu önleyen mimari.

* **Asenkron Kuyruk Mimarisi (Background Jobs):** 100+ sayfalık PDF'ler render edilirken uygulamanın (Vercel) çökmemesi veya zaman aşımına (timeout) uğramaması için Redis, BullMQ veya Inngest ile PDF oluşturma işlemi arka plan kuyruğuna alınır. İşlem bitince kullanıcıya bildirim gider.
* **Akıllı Vektör ve Çözünürlük Yönetimi:** Matematik formüllerinin ve grafiklerin bulanık çıkmaması için SVG veya yüksek kaliteli render optimizasyonu (örn. `@react-pdf/renderer` ile).
* **Dinamik Filigran ve Güvenlik:** Veritabanındaki "User" tablosundan alınan öğrenci adı veya kurum ID'si, sayfaların arkasına filigran olarak basılır.
* **Hibrit Dijital Dönüşüm (QR Entegrasyonu):** Çıktısı alınan kağıttaki soruların yanına dinamik URL içeren QR kodlar eklenmesi.

## 🚀 5. Çok Kanallı Dağıtım, Takip ve İlişkisel DB Bağları
Fasikül üretildikten sonraki aksiyonların profesyonelleştirilmesi.

* **Bulut Arşivleme (Storage):** Üretilen PDF dosyaları AWS S3, Vercel Blob veya Supabase Storage üzerinde saklanır. Elde edilen güvenli dosya URL'si (linki), veritabanındaki `Fascicle` tablosuna kaydedilir.
* **Veritabanı İlişkileri (DB Relations):** Kaydedilen fasikül, ilgili öğretmenin (`creatorId`) ve atandığı öğrencilerin (`studentId`) veritabanı kayıtlarıyla (Foreign Keys) ilişkilendirilir.
* **Öğrenci Portalı & Bildirimler:** Öğrenciye atandığı an sistem içi bildirim, veliye otomatik e-posta (veya WhatsApp API üzerinden PDF linki) gönderimi.
* **Etkileşim Analitiği (Analytics):** Dijital olarak paylaşılan fasikül linkinin ne zaman açıldığı, öğrencinin hangi sayfada ne kadar süre geçirdiği gibi metriklerin veritabanına analitik loglar olarak yazılması.

---

## 💡 Teknik İş Akışı ve Veri Döngüsü (Özet)

1. **Topla (UI -> State):** Kullanıcı platformda gezinirken raporları ve sınavları "Fasikül Sepetine" atar. Bu veriler Zustand/Redux ile arayüz belleğine (State) alınır.
2. **Kaydet (State -> DB):** Kullanıcı işlemi yaparken `Auto-Save` devreye girer. Tüm sepetteki ID'ler, sıralama bilgileri ve metadata veritabanına (Draft/Taslak statüsünde) yazılır.
3. **Düzenle (UI + AI):** Pro-Builder ekranında içerikler sürükle-bırak ile sıralanır. AI asistanından "zorluk derecesine göre diz" komutu istenirse, dönen yeni sıra DB'de güncellenir.
4. **Önizle (Render):** `@react-pdf/renderer` kullanılarak, kullanıcının o ana kadar DB'ye kaydettiği veriler sağ panelde canlı olarak çizilir.
5. **Üret ve Dağıt (Background Job -> Storage -> DB):** "Fasikülü Tamamla" butonuna basıldığında PDF sunucuda veya istemcide oluşturulur, S3 bulut deposuna yüklenir. Buluttan dönen URL veritabanına `isDraft: false` yapılarak kalıcı olarak kaydedilir ve yetkili öğrencilere atanır.
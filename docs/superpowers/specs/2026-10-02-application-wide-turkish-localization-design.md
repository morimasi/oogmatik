# Uygulama Genelinde Türkçe İçerik — Tasarım

**Tarih:** 2026-10-02  
**Durum:** Kullanıcı onaylı taslak; uygulama öncesi inceleme bekliyor

## Amaç

Uygulamanın kullanıcıya ve öğrenciye gösterdiği sabit arayüz metinlerinde, çalışma kâğıtlarında, çevrimdışı üretimlerde ve yapay zekâ ile üretilen içeriklerde İngilizce kalmasını önlemek. Bu kapsama, daha önce kaydedilmiş İngilizce çalışma içerikleri de dahildir.

Kod/değişken adları, API ve veritabanı enum değerleri, geliştirici belgeleri, kütüphane/marka adları ve görsel üretim modellerine gönderilen İngilizce istemler kapsam dışıdır; bu teknik değerler arayüzde gösterilmemelidir.

## Kullanıcıya Görünen Kapsam

- Uygulama arayüzündeki başlıklar, düğmeler, sekmeler, alan etiketleri, yer tutucular, boş durumlar, onaylar, hatalar ve yükleme metinleri.
- Öğrenci çalışma kâğıtlarındaki etiketler, yönergeler, sorular, cevap seçenekleri, başlıklar ve açıklamalar.
- Çevrimdışı/sabit içerik kitaplıkları ve varsayılan/fallback metinleri.
- Yapay zekâ istemleriyle oluşturulan eğitim materyallerinin metinsel alanları.
- Yerel veya bulut arşivindeki önceden üretilmiş çalışmalar.

## Tasarım Kararları

### 1. Sabit arayüz ve içerik

Kaynak kod, bileşenler, konfigürasyonlar, etkinlik kayıtları, servisler, içerik kitaplıkları ve çalışma kâğıdı render yolları kullanıcıya görünen İngilizce metinler açısından taranır. Bulunan metinler doğal ve yaşa uygun Türkçeyle değiştirilir. Sabit teknik anahtarlar değiştirilmez; anahtarların ekrana taşınması yerine Türkçe gösterim eşlemesi kullanılır.

Bu çalışma yalnızca `ReadingStudio` ile sınırlandırılmaz. Bütün uygulama yüzeyleri ve bu yüzeylere bağlanan üretim/render akışları kapsamdadır. Marka adları, gerektiğinde açıkça ürün adı olarak korunan terimler ve öğrencinin kendi yazdığı serbest metinler otomatik olarak değiştirilmez.

### 2. Yeni AI üretimleri

Eğitim içeriği üreten istemler, öğrenciye gösterilecek tüm doğal dil alanlarının Türkiye Türkçesinde olması gerektiğini açıkça belirtir. Görsel üretimi için ayrılmış `imagePrompt` gibi teknik alanlar İngilizce kalabilir, ancak kullanıcıya veya çalışma kâğıdına doğrudan basılmaz.

AI yanıtı uygulama tarafından kullanılmadan önce ilgili üretim şemasına göre kontrol edilir. Beklenen Türkçe alanlarda İngilizce içerik saptanırsa sessizce başarılı kabul edilmez: var olan hata gösterim/desenleriyle görünür biçimde başarısız olur veya yalnızca aynı üretim işlevinin güvenli Türkçe tekrar üretim akışı varsa o akış kullanılır. Çocuklara gösterilecek içerik için doğrulanamayan makine çevirisi başarı yanıtı gibi sunulmaz.

### 3. Eski arşiv içerikleri

Arşivler topluca ve kullanıcıdan habersiz değiştirilmez. Eski bir çalışma yüklenirken yalnızca desteklenen, kullanıcıya görünen içerik alanları incelenir. İngilizce metin içerdiği saptanırsa, çalışma öğrenciye sunulmadan önce Türkçe dönüşüm yapılır ve başarıyla tamamlanan dönüşüm aynı arşiv kaydına kalıcı olarak yazılır. Sonraki yüklemelerde tekrar çevrilmez.

Çeviri isteğine öğrenci adı, tanı, skor veya hesap kimliği eklenmez. Yalnızca çalışma metin alanları ve bunların gerekli yapı bilgisi gönderilir. Dönüşüm doğrulanamazsa kayıt olduğu gibi ve sessizce öğrenciye gösterilmez; kullanıcıya anlaşılır bir hata sunulur ve özgün kayıt korunur.

Çeviri sağlayıcısı, kimlik doğrulaması/erişim denetimi, maliyet ve hata davranışı, arşiv türleri envanteri sırasında mevcut altyapıya göre belirlenecektir. Mevcut Gemini modeli veya JSON onarım motoru bu iş için değiştirilmez.

### 4. Sürekli Türkçe güvencesi

- İngilizce sabit arayüz metinleri ve soru türü anahtarlarının ekranda görünmesini kapsayan testler eklenir.
- İçerik üreteçlerinde en azından çıktı dilini ve çalışma sayfasına ulaşan kritik doğal dil alanlarını doğrulayan testler yazılır.
- Arşiv dönüştürme için Türkçe kayıt, çevrilecek kayıt, hassas öğrenci verisinin isteğe girmemesi, yazma/kalıcılık ve çeviri hatası senaryoları test edilir.
- Uygulama build ve lint kontrolleri, ilgili Vitest testleriyle birlikte çalıştırılır.
- Kod incelemesinde yeni UI metinlerinin ve yeni içerik üretim şemalarının Türkçe kuralına uygunluğu denetlenir.

Bu mekanizmalar uygulama ve otomatik test kapsamındaki kullanıcı metinleri için regresyonları önlemeyi amaçlar. Herhangi bir dil algılama yöntemi, keyfî kullanıcı metninin dilini yüzde yüz doğru belirleyeceğini garanti edemez; öğrenci/öğretmen tarafından yazılan metinler çeviri kapsamına girmez.

## Mimari ve Veri Akışı

1. **Tarama:** İngilizce kullanıcı metinleri için bileşenler, renderer'lar, üreticiler, sabit veri kitaplıkları ve fallback'ler envanterlenir.
2. **Türkçe sunum:** Sabit UI metinleri ve kod anahtarlarının görünen karşılıkları Türkçeleştirilir.
3. **Üretim:** AI üretim istemleri Türkçe çıktıyı zorunlu kılar; çıktının kullanıcıya dönük alanları doğrulanır.
4. **Yükleme:** Arşiv kaydı yüklenirken görünür metin alanları kontrol edilir. Gerekirse anonimleştirilmiş metinler çevrilir, çıktı kontrol edilir ve kayıt başarıyla çevrildikten sonra kalıcılaştırılır.
5. **Hata:** Çeviri, doğrulama veya kalıcılaştırma başarısız olursa özgün veri korunur ve kullanıcıya hata bildirilir; İngilizce içerik sessizce Türkçe diye sunulmaz.

## Kapsam Dışı

- Uygulama kodundaki tanımlayıcılar, tip adları, dosya adları ve dahili enum/sözleşme değerleri.
- Dokümantasyon, log mesajları ve yalnızca geliştirici araçlarında kullanılan metinler.
- Görsel üretim modeli istemleri ve kullanıcıya gösterilmeyen AI yönergeleri.
- Öğrencilerin/öğretmenlerin kendilerinin yazdığı içerik. Bunlar izinsiz değiştirilmez.
- Haricî web siteleri, üçüncü taraf kütüphaneler ve marka adları.

## Hata ve Gizlilik Davranışı

- Arşiv özgün hâliyle korunur; yalnızca doğrulanmış Türkçe dönüşümden sonra güncellenir.
- Çeviri başarısızlığı kullanıcıya bildirilir; hata sessiz varsayılan veya başarı gibi gösterilmez.
- Öğrenci adı, tanı ve skor çeviri isteğine eklenmez.
- Mevcut kimlik doğrulama, AppError/API yanıt standartları ve loglama desenleri korunur.

## Doğrulama Kriterleri

1. Görünen 5N1K etiketleri her zaman “Kim?”, “Ne?”, “Nerede?”, “Ne zaman?”, “Neden?” ve “Nasıl?” olarak render edilir; `who/what/where/when/why/how` teknik değerleri ekrana çıkmaz.
2. Kod tabanında tespit edilen kullanıcıya açık sabit İngilizce metinlerin her biri Türkçeleştirilir veya belgelenmiş kapsam dışı gerekçesi olur.
3. AI üretim yolları öğrenciye gösterilen doğal dil alanlarını Türkçe ister ve doğrulanamayan İngilizce yanıtı başarılı sonuç olarak sunmaz.
4. Önceden oluşturulmuş İngilizce arşiv içeriği öğrenciye sunulmadan önce çevrilir; dönüşüm kalıcıdır ve tekrar çeviri yapılmaz.
5. Çeviri isteği öğrenci kimlik/klinik verisi içermez; başarısız çeviri özgün arşivi değiştirmez ve kullanıcıya hata verir.
6. İlgili Vitest testleri, lint ve üretim build'i başarılı olur.

## Uygulama Öncesi Karar Noktaları

Uygulama planında, keşif sırasında:

- Uygulamanın bütün etkinlik/çalışma türleri ve arşiv saklama biçimleri listelenir; desteklenmeyen bir format sessizce atlanmaz.
- Mevcut AI servisleri ve endpoint standartları incelenerek gizlilik ve yetki denetimine uygun çeviri entegrasyon noktası seçilir.
- Türkçe/İngilizce tespit eşiği ve iç içe nesnelerde çevrilebilir alanların nasıl belirleneceği testlerle netleştirilir.
- Büyük kapsam, bağımsız tarama ve düzeltme gruplarına ayrılır; her grup testlerle doğrulanır.

# Süper Türkçe Modülleri Premium Geliştirme ve Üretim Planı (v2)

Amaç: Tüm alt modüllerin tek tıkla, sınıf ve seviyeye tam uyan, hem **hızlı** (Hazır Veri) hem de **akıllı** (AI hibrit) üretim yapabilmesini sağlamak.

Modüller:

- Okuma Anlama & Yorumlama
- Mantık Muhakeme & Paragraf
- Dil Bilgisi ve Anlatım Bozuklukları
- Yazım Kuralları ve Noktalama
- Deyimler, Atasözleri ve Söz Varlığı
- Hece ve Ses Olayları

---

## 0. Ürün vizyonu

- ⚡️ Hızlı Mod:
  - Maksimum hazır veri, minimum AI (yalnızca küçük varyasyonlar).
  - Hedef: 2 sn altında A4 üretimi.
- ✨ AI (Hibrit) Mod:
  - Hazır veri yetersiz olduğunda sıkı şemaya bağlı AI üretimi.
  - Hedef: Tam sayfa üretimde 5 sn altında yanıt.
- Her iki modda da:
  - Aynı “Stüdyo Kontrolü → Özelleştirilebilir Üretim Ağı” akışı kullanılır.

---

## 1. Ortak akış ve mod-seviyesi

### 1.1. Ortak 3 adımlı akış

1. Müfredat & Kapsam:
   - Sınıf, seviye, kazanım, hedef kitle (normal, hafif/derin disleksi).
2. Etkinlik bileşenleri:
   - Modüle özel şablonlar (5N1K, heceleme, deyim-eşleştirme vb.).
3. Pedagoji & Çıktı:
   - Çıktı tipi (tek A4, kitapçık), süre hedefi, soru sayısı, premium/detay seviyeleri.

### 1.2. Mod seçimleri

- Hızlı Mod:
  - Kural: Hazır veri kütüphanesi + cache ile tüm bloklar doldurulmaya çalışılır.
  - AI, sadece isim, yer, küçük bağlam değişikliklerinde kullanılır.
- AI Hibrit Mod:
  - Kural: Hazır veri, parametreleri tam karşılamazsa kalan için AI üretir.
  - Tüm AI çıktıları, JSON şeması ile doğrulanmadan dizgiye girmez.

---

## 2. Etkinlik bileşenleri için premium tasarım

Her bileşen (şablon) için zorunlu alanlar:

- Pedagojik meta:
  - Hedef kazanım
  - Sınıf aralığı
  - Bilişsel seviye (bilgi, kavrama, analiz, sentez)
  - Hedef süre (dk)
- Girdi kuralları:
  - Min–maks metin uzunluğu
  - Min–maks soru sayısı
  - Yasak içerik (etik filtreler)
- Çıktı şeması:
  - Blok sırası (başlık → yönerge → metin → soru → not vb.)
  - Blok başına karakter/satır sınırı
  - Tipografi ve kontrast kuralları

Her modül bu şemayı genişleterek premium davranış kazanır.

---

## 3. Modül bazlı premium özellikler

### 3.1. Okuma Anlama & Yorumlama

Bileşenler (örnek): 5N1K, ana düşünce, çıkarım, karakter analizi, olay örgüsü, başlık seçme, şiir inceleme, görselleştirme.

Premium özellikler:

- Dinamik metin zorluğu:
  - Sınıf + seviye parametrelerine göre cümle uzunluğu ve kelime çeşitliliği otomatik ayarlanır.
- Çoklu bileşen akışı:
  - Örneğin: “5N1K + Ana Düşünce + Çıkarım” seçilince blok sırası pedagojik akışa göre otomatik önerilir.
- Disleksi dostu görsel yapı:
  - Satır aralığı artışı, satır işaretleme bandı, geniş not kutuları, sade layout.

Test:

- Her sınıf–seviye için ≥ 20 üretim:
  - Okunabilirlik metrikleri (ortalama cümle uzunluğu, kelime sayısı).
  - Hedef süre ile uyum.
- Uzman değerlendirme:
  - Rastgele 20 çıktıda zorluk ve yönerge netliğine puanlama.

---

### 3.2. Mantık Muhakeme & Paragraf

Bileşenler (örnek): mantık hatası bulma, paragraf tamamlama, sebep–sonuç, tutarlı/tutarsız cümle, sıralama.

Premium özellikler:

- Mantık zinciri şeması:
  - Her soru için öncül(ler), sonuç, gerektirme/çelişki alanları JSON’da saklanır.
- Çözüm şeması alanı:
  - Çalışma kağıdına isteğe bağlı “mantık diyagramı çizme” alanı eklenir.
- Zaman tahmini:
  - Her set için tahmini toplam süre sayfada gösterilir (ör: 18 dk).

Test:

- En az 50 soru setinde:
  - Doğru cevabın mantık zincirine uyumu ≥ %95.
  - Çeldiricilerin anlamsal benzerliği yüksek ama mantıksal uyumu düşük olacak şekilde kontrol.

---

### 3.3. Dil Bilgisi ve Anlatım Bozuklukları

Bileşenler: özne–yüklem uyumu, zaman uyumu, gereksiz sözcük, yanlış bağlaç, bozukluk düzeltme.

Premium özellikler:

- Kural tabanlı hata üretimi:
  - Doğru cümle kural motoruyla oluşturulur, seçilen hata türüyle bilinçli bozulur.
- Hata açıklama modu:
  - Cevap anahtarında her hata için kısa açıklama (neden yanlış, doğru hali).
- Kapsam dengesi:
  - Son 10 üretimdeki hata türü oranları raporlama, tekrar eden türlerde uyarı.

Test:

- Her hata türü için ≥ 100 örnek:
  - Otomatik sınıflandırıcı ile hata türü geri tahmini ≥ %95.
- Aynı parametrelerle tekrar üretimde:
  - Hata türü sabit, cümle içeriği farklı olmalı (stabilite).

---

### 3.4. Yazım Kuralları ve Noktalama

Bileşenler: noktalama tamamlama, bitişik/ayrı yazım, büyük harf, sayı yazımı.

Premium özellikler:

- TDK tabanlı motor:
  - Offline sözlük + kural seti ile yazım/noktalama doğrulama.
- İpucu kutuları:
  - Çıktıya küçük “Mini TDK” bilgi baloncukları eklenebilir (isteğe bağlı).
- Sık hata senaryoları:
  - Çeldiriciler gerçek hayatta sık yapılan hatalardan seçilir.

Test:

- Aynı cümlenin 10 üretimi:
  - Doğru yazım ve noktalama her seferinde aynı kalmalı.
- Hatalı kabul edilen örneklerde:
  - Sistem raporları kontrol edilerek kural güncellenir.

---

### 3.5. Deyimler, Atasözleri ve Söz Varlığı

Bileşenler: deyim–anlam eşleştirme, atasözü–durum eşleştirme, bağlama uygun kelime, yakın/zıt anlam.

Premium özellikler:

- Yaşa göre katmanlı veri tabanı:
  - 4–5. sınıf için somut, 7–8. için daha soyut deyim ve atasözleri.
- Bağlam çeşitliliği:
  - Her deyim için en az 3 bağlam cümlesi, isteğe bağlı kısa diyalog senaryoları.
- Görsel entegrasyon:
  - Çizim yapma alanı (deyimin/atasözünün sahnesini çiz) gibi bloklar.

Test:

- Deyim–bağlam uyumu:
  - Otomatik anlam sınıflandırıcı ile yüksek uyum (≥ %95).
- Atasözü seçiminde:
  - Rastgele 50 senaryoda doğru atasözü eşlemesi başarı oranı ölçümü.

---

### 3.6. Hece ve Ses Olayları

Bileşenler: heceleme, ünsüz yumuşaması/sertleşmesi, ünlü düşmesi, ünlü daralması, ses olayı olan–olmayan kelime ayırt etme.

Premium özellikler:

- Kural motoru:
  - Kelime üzerinden hece sayısı ve ses olayı türü otomatik hesaplanır.
- Dinamik zorluk:
  - Zorlanan öğrenci profili için hece yapıları (örneğin sadece açık veya sadece 2 heceli kelimeler) filtrelenebilir ve kademeli artış sağlanır.

---

## 4. Mimari Dayanıklılık ve Premium Çekirdek Özellikleri

### 4.1. Hata Yönetimi ve Otomatik Yedekleme (Fallback Mechanism)

- Otomatik Degradasyon: AI motoru zaman aşımına uğradığında, API limiti aşıldığında veya bozuk veri ürettiğinde sistem çökmek yerine işlemi yarıda kesmez. Sessizce **Hızlı Mod'a (Fast Generate)** düşerek (fallback) o bölümü hazır veriyle doldurur ve öğretmenin işini aksatmaz.

### 4.2. Disleksi Uyumunda Tipografi ve Renk Kodlaması Detayları

- Derin disleksi profilleri için PDF üretiminde otomatik olarak altı ağır (bottom-heavy) özel disleksi fontları (örn: OpenDyslexic) devreye girer.
- Metinlerin okunabilirliğini artırmak için açık sarı/mavi arka plan bantları veya ideal satır aralığı (line-height: 1.5+) kuralları uygulanır.

### 4.3. Üretim Sonrası Entegrasyon (Post-Production)

- Kelime Kumbarası: AI tarafından üretilen metinlerdeki hedef kelimeler ve deyimler otomatik olarak ayıklanarak öğrencinin/öğretmenin 'Kelime Kumbarası'na atılır.
- Taslak Arşivi: Üretilen tüm PDF dizgileri ve AI prompt parametreleri, daha sonra tekrar değiştirilip düzenlenebilmek üzere saklanır.

### 4.4. Çift Doğrulama (Dual-Pass Validation) ve Auto-Auditor

- Hibrit AI modunda üretilen içerik PDF'e basılmadan önce, sistem arka planda minyatür bir 'Pedagojik Denetmen AI' çalıştırarak içeriğin hedef yaş grubuna ve disleksi seviyesine uygunluğunu (olumsuz ek kullanımı, karmaşık yönerge analizi vb.) denetler ve puanlar.

### 4.5. Görsel Çıktı ve Vektörel (SVG) Dinamikleri

- Sözel Mantık veya Olay Sıralama gibi modüllerde, AI sadece metin değil, PDF motorunun doğrudan işleyebileceği SVG (vektörel) kod parçacıkları veya grid koordinatları da üretebilir. Bu sayede labirentler, kavram haritaları veya eşleştirme tabloları kusursuz bir piksel dizgisiyle basılır.

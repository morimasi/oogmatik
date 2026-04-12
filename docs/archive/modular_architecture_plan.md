# OOGMATIK "PREMIUM STUDIO" YENİ NESİL MODÜLER MİMARİ PLANI

## 1. Vizyon ve Felsefe
Mevcut yapay zeka entegrasyonumuz "tek seferde tüm sayfayı üreten" (monolitik) bir yapıdadır. Yeni "Premium Studio" vizyonumuz, öğretmenlere ve özel eğitim uzmanlarına **tam kontrol** veren, **Bileşen Bazlı (Block-based / Notion tarzı)** bir mimariye geçişi hedefler.

**Neden Modüler Yapı?**
*   **Bilişsel Yük Kontrolü (Cognitive Load Theory):** Dislektik, DEHB'li veya Diskalkulik öğrenciler için sayfa üzerindeki her bir elemanın miktarı ve türü hayati önem taşır. Uzmanlar sayfaya tam olarak ne konulacağını seçebilmelidir.
*   **Bağlamsal ve Kesin Üretim:** AI'dan "bir sayfa üret" demek yerine, "Seçtiğim 3. Sınıf Hayat Bilgisi ünitesi için, sadece 1 okuma metni ve 2 eşleştirme sorusu üret" demek, AI'ın halüsinasyonlarını (hata oranını) %90 azaltır.
*   **Bireyselleştirilmiş Eğitim Programı (BEP) Uyumu:** Her öğrencinin ihtiyacı farklıdır. Modüler yapı, kişiselleştirilmiş (Tailor-made) materyal tasarımına olanak tanır.

---

## 2. Sistem Mimarisi (Geliştirme Planı)

Sistem, bir "Sayfa" nesnesi yerine, sayfanın içine dizilen "Bileşenler Dizisi (Array of Components)" mantığıyla yeniden inşa edilecektir.

### Aşama 1: Veri Yapısının (Schema) Dinamikleşmesi
Eskiden sabit bir JSON şeması varken, yeni sistemde kullanıcının seçtiği modüllere göre anlık olarak bir Zod/JSON-Schema oluşturulacak (Builder Pattern).

**Örnek Dinamik İstek:**
Kullanıcı arayüzden `TextModule` ve `MatchingModule` seçtiyse, Backend Gemini'ye sadece bu iki objeyi içerecek bir `response_schema` gönderir.

### Aşama 2: UI/UX Tasarımı (Sihirbaz Yaklaşımı)
Kullanıcı deneyimi 4 aşamalı bir "Wizard" yapısına dönüşecek:
1.  **Hedef Belirleme:** Sınıf, Ders, Ünite, Zorluk Derecesi (Örn: 4. Sınıf, Türkçe, Derin Disleksi).
2.  **Bileşen Seçimi (Tıkla-Ekle):** Sol/Sağ panelden istenen 10 Temel Bileşen sayfaya eklenir (İskelet/Placeholder olarak).
3.  **Mikro-Ayarlar:** Eklenen her bileşenin kendine ait ayarları (Dişli ikonu ⚙️) yapılır (Örn: Okuma metninde heceleme açık/kapalı, Soru sayısında 3 şık/4 şık).
4.  **AI Üretimi:** "Üret" butonuna basıldığında AI, sadece ekrandaki boş iskeletleri (seçilen ayarlar ve hedeflere göre) doldurur.

### Aşama 3: React Bileşenlerinin (Renderers) Yazılması
Her bir modül için React tarafında özel, bağımsız ve tekrar kullanılabilir UI bileşenleri oluşturulacak (Örn: `<ModuleClozeTest data={...} settings={...} />`).

---

## 3. Premium Pedagojik Bileşenler (10 Temel Modül)

Aşağıdaki modüller Orton-Gillingham yaklaşımı, UDL (Universal Design for Learning) prensipleri ve MEB kazanımlarına göre tasarlanmıştır:

### 1. Mikro-Öğrenme Metni (Scaffolded Reading)
*   **İşlev:** Bilgiyi veya hikayeyi veren ana, kısa parça.
*   **Gerekçe:** Kısa süreli belleği yormamak için metinler parçalanmalıdır (Chunking).
*   **Ayarlar:** Maksimum kelime sayısı, hece/satır renklendirme (açık/kapalı), anahtar kelime vurgusu.

### 2. Görsel - Kavram Eşleştirme (Concept-Visual Matching)
*   **İşlev:** Solda kelimeler, sağda görseller; aralarında çizgi çekme.
*   **Gerekçe:** Dislektik zihinler anlamsal ilişkileri görsel ipuçlarıyla daha hızlı kurar.
*   **Ayarlar:** Çift sayısı (Örn: max 3-4), çeldirici görsel/kelime olsun mu?

### 3. Yönlendirmeli Boşluk Doldurma (Guided Cloze Test)
*   **İşlev:** Cümle içinde eksik kelimeyi bulma. Kelime havuzu verilir ve boşluklar kelime harf sayısına göre kutucuklandırılır (Elkonin Boxes).
*   **Gerekçe:** Açık uçlu hatırlama (recall) zordur; seçenekten tanıma (recognition) daha kolaydır.
*   **Ayarlar:** Kelime havuzu gösterimi, şekilli harf kutucukları.

### 4. Mantık Ağacı / Doğru-Yanlış (True/False Logic Flow)
*   **İşlev:** Klasik (D/Y) yerine, cümlenin yanına net, büyük ✅ ve ❌ ikonları konur.
*   **Gerekçe:** Yönerge takibini ve görsel ayırt etmeyi basitleştirir.
*   **Ayarlar:** Soru sayısı, negatif cümle (yapmamalıdır vb.) yasağı.

### 5. Algoritmik Sıralama (Step Sequencing)
*   **İşlev:** Karışık verilen olayları veya işlem adımlarını 1, 2, 3 diye sıralama.
*   **Gerekçe:** DEHB'de zayıf olan "Yürütücü İşlevleri" (Executive Functions) ve planlama becerisini geliştirir.
*   **Ayarlar:** Adım sayısı, metin veya görsel sıralama seçimi.

### 6. Destekli Açık Uçlu Soru (Scaffolded Open-Ended)
*   **İşlev:** Öğrenciden yazı yazması istenir ancak cümleye başlama ipucu (Sentence Starter) verilir.
*   **Gerekçe:** Yazmaya başlama kaygısını (Blank Page Syndrome) ortadan kaldırır.
*   **Ayarlar:** Cümle başlatıcı verilsin mi?, çizgi/satır sayısı.

### 7. Görsel Çoktan Seçmeli (Visual Multiple Choice)
*   **İşlev:** Şıkların (A, B, C) yanında büyük görselleri olan, geniş tıklama/işaretleme alanlı sorular.
*   **Gerekçe:** Görsel kalabalığı (Visual crowding) azaltır, odaklanmayı artırır.
*   **Ayarlar:** Şık sayısı (2, 3, 4), dikey/yatay dizilim.

### 8. Odaklı Bul / İşaretle (Spot & Highlight)
*   **İşlev:** Bir metin veya harf dizisi içinde sadece istenen hedefi (Örn: "b" harfleri) işaretleme.
*   **Gerekçe:** Görsel tarama ve seçici dikkat (Selective Attention) becerisini çalıştırır. Karmaşık bulmacalardan daha etkilidir.
*   **Ayarlar:** Hedef türü (harf, kelime, noktalama), hedef sayısı.

### 9. Mini Zihin Haritası (Mini Mind-Map)
*   **İşlev:** Ortada ana konu, etrafında öğrencinin dolduracağı/çizeceği boş kutucuklar.
*   **Gerekçe:** Bütünden parçaya öğrenme (Top-down processing) stilini destekler.
*   **Ayarlar:** Dal sayısı, dalların yarısının AI tarafından dolu verilmesi (Kısmi tamamlama).

### 10. Öz-Değerlendirme Çıkış Bileti (Exit Ticket)
*   **İşlev:** Kağıdın sonunda duygu durum ikonları (😊 😐 😢) ve mini bir yansıtma.
*   **Gerekçe:** Üstbilişsel (Metacognitive) farkındalığı artırır, öğrencinin sürece katılımını ölçer.
*   **Ayarlar:** Sadece emoji mi?, yansıtma sorusu eklensin mi?

---

## 4. Sonuç
Bu mimari sayesinde Oogmatik, standart bir araçtan çıkarak, öğretmenin pedagojik sınırları çizdiği, yapay zekanın ise bu sınırların içini uzman kalitesinde ve sıfır hatayla doldurduğu **"Ultra Profesyonel Klinik Materyal Stüdyosu"** haline gelecektir.

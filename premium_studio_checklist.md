# 🚀 OOGMATIK "PREMIUM STUDIO" GELİŞTİRME CHECKLIST'İ

Bu checklist, "Bileşen Bazlı (Modüler) Çalışma Kağıdı Stüdyosu" ve "Ontolojik Müfredat Motoru" vizyonunun adım adım koda dökülmesi için hazırlanmıştır.

## FAZ 1: Veri Modelleri ve Core Altyapı (Tamamen Backend/Mantık)
*Açıklama: Arayüz çizilmeden önce sistemin yeni dille (modüller) konuşabilmesi için temel tiplerin ve builder (inşa edici) fonksiyonların yazılması.*

- [x] **1.1. Modül Tiplerinin (TypeScript Interfaces) Tanımlanması:** `types.ts` veya `types/studio.ts` içine 10 temel bileşenin (Okuma, Eşleştirme, Boşluk Doldurma vb.) veri yapılarını tanımla.
- [x] **1.2. Dinamik JSON Şema Üreticisi (Schema Builder):** Kullanıcının seçtiği modül ID'lerine göre Gemini'ye gönderilecek `response_schema`'yı anlık (on-the-fly) olarak birleştiren fonksiyonu yaz (`services/schemaBuilder.ts`).
- [x] **1.3. Müfredat Ontolojisi Veritabanı (Mock/Statik):** 1-8. Sınıf MEB Kazanımları, Tier-2 kelime havuzları ve Bloom taksonomisi seviyelerini içeren statik bir veri dosyası (`data/curriculumOntology.ts`) oluştur.

## FAZ 2: Studio Arayüzü (UI) - Adım Adım Sihirbaz (Wizard)
*Açıklama: Kullanıcının boş bir kağıda "tıkla-ekle" mantığıyla modül yerleştirdiği ana stüdyo ekranının tasarımı.*

- [ ] **2.1. Adım 1 - Hedef ve Kapsam Ekranı:** Sınıf, Ünite, Konu ve Bilişsel Zorluk (Bloom) seçimi yapılacak giriş arayüzünü (Form) tasarla.
- [ ] **2.2. Adım 2 - Modül Paleti (Sidebar):** Sol veya sağ menüde 10 premium bileşenin (ikonları ve açıklamalarıyla) listelendiği paneli yap.
- [ ] **2.3. Sayfa İskeleti (Canvas):** Seçilen modüllerin "boş birer kutu (placeholder)" olarak alt alta dizildiği orta çalışma alanını (Drag&Drop veya tıkla-sırala mantığıyla) kodla.
- [ ] **2.4. Modül Mikro-Ayarları (Settings Popover):** Sayfaya eklenen her boş iskeletin yanındaki ⚙️ ikonuna tıklandığında açılan, o modüle özel ayarları (örn: "Şık sayısı: 4", "Heceleme: Açık") içeren formları yap.

## FAZ 3: AI Entegrasyonu ve Veri Akışı
*Açıklama: Sihirbazda seçilen ayarların Gemini'ye gönderilip, dönen JSON'ın ekrandaki iskeletlere doldurulması.*

- [ ] **3.1. Context Aggregator (Bağlam Birleştirici):** Kullanıcının seçtiği sınıf/ünite (Faz 1.3) ve zorluk seviyesini alıp, Gemini `SYSTEM_INSTRUCTION`'ına dinamik olarak enjekte eden ara katmanı (Middleware) yaz.
- [ ] **3.2. Generate (Üretim) Butonu ve Loading State:** "Üret"e basıldığında hazırlanan Dinamik Şema'nın (Faz 1.2) ve Bağlamın (Faz 3.1) API'ye (`/api/generate`) gönderilmesi. Animasyonlu yükleme ekranı.
- [ ] **3.3. Dönen Verinin Parçalanması:** Gemini'den gelen devasa JSON'ın, ekrandaki her bir modül iskeletine (Component) doğru şekilde dağıtılması (State Mapping).

## FAZ 4: React Renderers (Bileşenlerin Çizimi)
*Açıklama: İçi dolu verilerin öğrenciye gösterilecek şekilde (kağıt üzerinde) şık ve disleksi dostu tasarımla (Lexend font, doğru boşluklar) render edilmesi.*

- [ ] **4.1. Text & Reading Renderer:** Mikro-öğrenme metni (hece renklendirme desteğiyle) bileşeninin kodlanması.
- [ ] **4.2. Matching & Cloze Renderer:** Görsel-kavram eşleştirme ve Elkonin kutucuklu boşluk doldurma bileşenlerinin kodlanması.
- [ ] **4.3. Logic & Sequencing Renderer:** Doğru/Yanlış (Büyük ✅/❌) ve Algoritmik Sıralama (1,2,3) bileşenlerinin kodlanması.
- [ ] **4.4. Q&A & Multiple Choice Renderer:** Açık uçlu (Sentence Starter destekli) ve Görsel Çoktan Seçmeli bileşenlerin kodlanması.
- [ ] **4.5. Spot & Mind-Map Renderer:** Odaklı Bul/İşaretle ve Mini Zihin Haritası bileşenlerinin kodlanması.

## FAZ 5: Cila ve Çıktı (Export)
*Açıklama: Üretilen mükemmel kağıdın PDF'e veya yazıcıya kusursuz aktarılması.*

- [ ] **5.1. Sayfa Kırılımı (Pagination) Mantığı:** Alt alta dizilen modüller A4 sayfasına sığmadığında otomatik olarak 2. sayfaya taşmasını (CSS `@page` ve `break-inside: avoid`) sağla.
- [ ] **5.2. Çıkış Bileti (Exit Ticket):** Sayfanın en altına otomatik eklenen Öz-Değerlendirme (😊 😐 😢) modülünü entegre et.
- [ ] **5.3. PDF/Yazdır Optimizasyonu:** Yazdır butonuna basıldığında arayüzdeki menülerin gizlenip sadece çalışma kağıdının (veya öğrenci modunun) basılmasını sağla.

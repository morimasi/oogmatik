# SÜPER TÜRKÇE V3: 6 ANA KATEGORİ VE 60+ ULTRA PREMIUM BİLEŞEN MİMARİ PLANI

Bu plan, 10 modüllü mevcut "Süper Türkçe V2" altyapısının eksikliklerini gidererek, platformu devasa ve ölçeklenebilir bir **"6 Kategorili, 60+ Bileşenli Özel Eğitim Türkçe Klinik Stüdyosu"**na dönüştürecektir. Ayrıca üretilen materyalin bir "Öğrenciye (BEP Planı)" atanması sağlanacaktır.

---

## 1. MEVCUT DURUM ANALİZİ VE EKSİKLİKLER (CODE REVIEW)

Yaptığımız bir önceki versiyon harika bir çekirdek (core) motor kurdu. Ancak şu limitleri var:

1.  **Genişletilebilirlik Sorunu (Scalability):** 10 modül `STPalette`, `STRenderer` ve `STSettings` içine tek bir dosyada "Hard-coded (Switch-case)" yazıldı. Eğer 60 modül daha eklersek bu dosyalar 3000 satırı geçer ve sistem çöker. **Çözüm:** Registry (Kayıt Defteri) mantığına geçilerek her modül kendi klasöründe (Config, Schema, Renderer, Settings) bağımsız yönetilecek.
2.  **Öğrenci Atama Eksikliği:** Öğretmen kağıdı kime ürettiğini seçemiyor. Sistemin en büyük vizyonu olan "Bireyselleştirilmiş Eğitim Programı (BEP)" için kağıdın üstünde veya veritabanında öğrencinin adıyla eşleşmesi şart. **Çözüm:** `STTargetScope` içerisine `useStudentStore` bağlanacak ve seçilen öğrencinin "Gerçek Nöro-Profili" (Sistemdeki kayıtlı profili) AI'a otomatik enjekte edilecek.
3.  **Kategori Karmaşası:** Sadece "Okuma Anlama" var. Mantık, Dil Bilgisi, Yazım Kuralları gibi alanlar yok. **Çözüm:** Palet (Sol menü) kategorilere ayrılacak. Akordeon menülerle 6 ana başlık açılıp kapanacak.

---

## 2. 6 KATEGORİ VE YENİ ULTRA-PREMİUM MODÜLLER (AR-GE)

Disleksi, Diskalkuli, DEHB ve MEB müfredatı literatürü taranarak her kategoriye en az 10 klinik, interaktif ve nöro-uyumlu şablon tasarlandı.

### KATEGORİ 1: Okuma Anlama & Yorumlama (Mevcut + Yeni)

_Ana Hedef: Satır takibi, akıcılık, metin içi bağlam kurma._

1. Mikro-Öğrenme Metni (Scaffolded Reading)
2. Okuma Akıcılığı Piramidi (Fluency Pyramid)
3. Görsel 5N1K Haritası (Semantic Mapping)
4. LGS Sebep-Sonuç Muhakemesi (Cause-Effect)
5. Kronolojik Olay Sıralama (Story Sequencing)
6. Metin İçi Zıtlık/Benzerlik Avı (Contrast Hunter)
7. Ana Fikir Bulutları (Main Idea Clouds)
8. Karakter Analiz Tablosu (Character Traits)
9. Görsel Destekli Başlık Seçimi (Title Selection)
10. Metin Çıkarım Doğru/Yanlış (Inference T/F)

### KATEGORİ 2: Mantık Muhakeme & Paragraf

_Ana Hedef: ALES/LGS tarzı üstbilişsel (metacognitive) becerilerin disleksiye basitleştirilmesi._

1. A/B Karşılaştırma Matrisi (Venn Diagram Logic)
2. Paragraf Tamamlama Kutuları (Paragraph Assembly)
3. Gizli Anlam Çıkarımı (Reading Between Lines)
4. Argüman ve Kanıt Eşleştirme (Argument-Evidence)
5. Algoritmik Karar Ağacı (Decision Tree)
6. Olay-Görsel Eşleme Matrisi (Event-Visual Matrix)
7. Eğer-Öyleyse Mantık Tablosu (If-Then Logic)
8. İlgisiz Cümle Dedektifi (Odd One Out)
9. Paragrafı İkiye Bölme (Paragraph Splitting)
10. Başlangıç-Gelişme-Sonuç Kilitleri (Story Arcs)

### KATEGORİ 3: Dil Bilgisi ve Anlatım Bozuklukları

_Ana Hedef: Soyut dil bilgisi kurallarının somut (renk, kutu, ikon) şemalara dökülmesi._

1. Renkli Öge Vagonları (Sentence Train - Özne/Yüklem)
2. Ek/Kök Ayırıcı Elkonin (Morphological Boxes)
3. Eylem (Fiil) Bulucu Radar (Verb Spotter)
4. İsmi Niteleyen Sıfat Tüneli (Adjective Tunnels)
5. Anlatım Bozukluğu Tamircisi (Syntax Repair)
6. Bağlaç-Edat Zihin Haritası (Conjunction Maps)
7. Zamir (İsim Yeri) Eşleştirme (Pronoun Matching)
8. Zaman (Kip) Çizelgesi (Tense Timelines)
9. Soru Eki (-mi) Kural Tablosu (Question Particles)
10. Çoğul-Tekil Mantık Kafesi (Plural Logic)

### KATEGORİ 4: Yazım Kuralları ve Noktalama

_Ana Hedef: Görsel bellek ve motor hafıza (Visual-motor memory) kurallarının pekişmesi._

1. Büyük Harf Dedektifi (Capital Letter Spotter)
2. Noktalama Sürükle-Bırak (Punctuation Drag)
3. Hatalı Yazım Düzelticisi (Spelling Fixer)
4. "De/Da" ve "Ki" Ayırıcı (Suffix Separator)
5. Satır Sonu Bölme Kutuları (Hyphenation Boxes)
6. Sayıların Yazımı Tablosu (Number Spelling)
7. Kısaltmalar ve Kesme İşareti (Apostrophe Logic)
8. Soru İşareti / Ünlem Tartısı (Question/Exclamation Scale)
9. Noktalama Şifresi Çözücü (Punctuation Cipher)
10. Dikte ve Kontrol Kartı (Dictation Checklist)

### KATEGORİ 5: Deyimler, Atasözleri ve Söz Varlığı

_Ana Hedef: Disleksiklerin en çok zorlandığı soyut (Mecaz) dilin somutlaştırılması._

1. Dual-Coding Eşleştirme (Mecaz-Gerçek Görselleme)
2. Eş/Zıt Anlam Tüneli (Synonym/Antonym Tunnels)
3. Deyim Hikayesi Üretici (Idiom Story Generator)
4. Atasözü Tamamlama (Proverb Assembly)
5. Yabancı Kelimelere Türkçe Karşılık (Native Match)
6. Çok Anlamlılık Matrisi (Polysemy Matrix)
7. Sesteş (Eş Sesli) Cümle Çiftleri (Homophone Pairs)
8. Kelime Ailesi Haritası (Word Family Maps)
9. Soyut Kavram Sözlüğü (Abstract to Concrete)
10. Duygu İfade Sözcükleri (Emotion Vocabulary)

### KATEGORİ 6: Hece ve Ses Olayları

_Ana Hedef: Fonolojik farkındalık (Phonological awareness) ve işitsel belleği destekleme._

1. Hece Treni (Syllable Train)
2. Ünlü Düşmesi Analizörü (Vowel Drop Analyzer)
3. Ünsüz Benzeşmesi (Sertleşme) Formülü (Consonant Harmony)
4. Ünsüz Yumuşaması Bulmacası (Consonant Softening)
5. Daralma Dedektifi (Vowel Narrowing Spotter)
6. Ses Türemesi Matrisi (Sound Addition Matrix)
7. Kaynaştırma Harfleri Kalkanı (Buffer Letters Shield)
8. Ulama (Liaison) Bağlayıcısı (Liaison Connector)
9. Kalınlık-İncelik Uyumu Testi (Vowel Harmony Scale)
10. Fonolojik Şifre Çözücü (Phonological Decoder)

---

## 3. MİMARİ UYGULAMA PLANI VE CHECKLIST (ROADMAP)

Sistemin çökmeden, sürdürülebilir (Scalable) bir şekilde 60 modülü kaldırması için "Registry (Kayıt)" tasarım desenine geçilecektir.

- [ ] **AŞAMA 1: Öğrenci Atama ve Kategori Altyapısı (Core Update)**
  - `useStudentStore` içinden öğrencileri çekerek `STTargetScope` paneline ekle.
  - `useSuperTurkceV2Store` içine `selectedStudentId` ekle.
  - Seçilen öğrencinin `diagnosis` ve `learningStyle` bilgilerini AI promptuna (Nöro-Kısıt) otomatik enjekte et.

- [ ] **AŞAMA 2: Modüler Mimariye Geçiş (Registry Pattern)**
  - `components/SuperTurkceV2/Modules/` klasörü açılacak.
  - Her bir kategori için ayrı klasörler oluşturulacak (`Reading`, `Grammar`, `Logic` vb.).
  - Merkezdeki devasa `STRenderer`, `STSettings` ve `STPalette` dosyaları parçalanıp tek bir "Registry (Kayıt Defteri)" fonksiyonuyla birleştirilecek. Bu sayede yeni bir modül eklendiğinde sadece o modülün dosyası yazılacak, ana dosyalara dokunulmayacak.

- [ ] **AŞAMA 3: İlk 2 Yeni Kategorinin (Logic & Grammar) Üretilmesi**
  - "Mantık Muhakeme" kategorisinden 5 yeni modülün Şema, Prompt, Renderer ve Settings dosyalarının yazılması.
  - "Dil Bilgisi" kategorisinden 5 yeni modülün yazılması.
  - (Tam 60 modülün tek seferde yazılması LLM bağlam limitini aşacağından, iteratif / parça parça ilerlenecektir).

- [ ] **AŞAMA 4: Gelişmiş Baskı ve AI Optimizasyonları**
  - 60 modülün AI'a gönderilen prompt token maliyetini düşürmek için Zod tabanlı "Strict Schema" kullanımı.
  - Her kategori için "Hızlı Mod" akıllandırılacak (Örn: Sınıf 8 ve Kategori LGS ise, otomatik Mantık modüllerini seçecek).
  - Grid (Duvarcı / Masonry) diziliminin daha kompleks A4 kesimlerini hesaplaması (`react-grid-layout` mantığıyla kendi CSS implementasyonumuz).

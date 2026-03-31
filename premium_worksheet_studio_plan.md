# İnfografik Stüdyosu'nun "Premium Etkinlik & Çalışma Sayfası Üretim Merkezi"ne Dönüştürülme Planı

## 1. Mevcut Durum Analizi: İnfografik Stüdyosu Şu An Ne İşe Yarıyor?
Şu anki `InfographicStudio` modülü (`src/components/InfographicStudio`), belirli bir konu başlığında **tekil ve bağımsız kavramsal görseller** (Örn: Venn Diyagramı, Balık Kılçığı, Süreç Adımları, Kavram Haritası) üretmek için tasarlanmış bir araçtır. 
Yapay zeka (Gemini), girilen konuyu analiz edip özel bir XML-sözdizimi (`NativeInfographicRenderer`) döndürür. Öğretmenler bunu konuyu özetlemek veya tahtada göstermek için kullanır. 

**Eksik Yönü:** Öğrencinin eline verip çözdürebileceğiniz, kalemle üzerine yazabileceği, sorular içeren gerçek bir "çalışma kağıdı" veya "sınav kağıdı" formatında değildir. Parça parçadır.

---

## 2. Vizyon ve Hedef: Neden Bu Dönüşüme İhtiyacımız Var?
Kullanıcının vizyonuna göre: Öğretmenin elinde taratacak fiziksel bir kağıt (OCR) yoksa, sistem ona **sıfırdan, dünyanın en zengin, pedagojik olarak en kusursuz ve premium çalışma kağıdını** dijital olarak üretmelidir. 

Bu stüdyo; Matematik (3D şekiller, fonksiyon grafikleri), Türkçe (5N1K, okuma anlama parçaları), Geometri ve Mantık oyunlarını tek bir **A4 Kağıdında (veya dijital tahtada)** profesyonel bir matbaa dizgisi gibi birleştiren bir **Ultra-Üretim (Orchestration) Motoruna** dönüşmelidir.

---

## 3. Dönüşüm Planı (Adım Adım Geliştirme)

### Adım 1: "Çalışma Kağıdı Mimarı" (UI Revizyonu)
Sol panel (`LeftPanel`) artık sadece "Konu" ve "Yaş" sormayacak. Bir **"Bileşen Sepeti" (Component Builder)** olacak.
Öğretmen şunları seçecek:
- **Ana Konu:** (Örn: "Mevsimler ve Uzay")
- **Kağıttaki Modüller:**
  - [x] İnfografik (Konu Özeti - Kavram Haritası)
  - [x] 3D Geometri (Uzamsal soru)
  - [x] Sözel Mantık Tablosu (Zihin açıcı)
  - [x] Okuduğunu Anlama (Paragraf + Sorular)
  - [x] Test (Çoktan Seçmeli 3 Soru)

### Adım 2: Çoklu AI Orkestrasyonu (Backend Revizyonu)
`src/services/generators/infographicGenerator.ts` dosyası, tek bir XML dönen yapıdan çıkıp, **"Multi-Agent Workflow" (Çoklu Ajan İş Akışı)** sistemine geçirilecek.
- AI, önce konuyu parçalara bölecek.
- Seçilen modüllere göre;
  - Kavram haritası için Infographic promptunu,
  - Matematik/Grafik sorusu için `mathSinavGenerator` promptunu (GraphicRenderer'a uygun),
  - Testler için genel promptu çalıştırıp bunları tek bir **Master JSON** (`draftComponents` array'i) altında toplayacak.

### Adım 3: Matbaa Kalitesinde A4 Render (Frontend Revizyonu)
Orta panel (`CenterPanel`), şu anki tekil infografik önizlemesini bırakıp, geçtiğimiz güncellediğimiz `A4PrintableSheetV2.tsx` (PDF Motoru) veya `UniversalWorksheetViewer` bileşenine bağlanacak.
Bu sayede üretilen sayfa:
1. En üstte kurum logosu, öğrenci adı-soyadı alanı.
2. Altında konunun Zihin Haritası (İnfografik).
3. Altında 3D Silindir sorusu.
4. En altta test sorularından oluşan gerçek bir sınava dönüşecek.

### Adım 4: Klinik ve Pedagojik Güvenlik (Zero-Hallucination)
- Yeni kurduğumuz "Görsel-Metin Uyumluluk Validatörü", bu stüdyoda üretilen her satır için aktif edilecek.
- Öğrencinin yaşına ve klinik profiline (Örn: Disleksi) göre fontlar (Lexend), satır aralıkları ve görsel yoğunluk (Bilişsel Yük) otomatik ayarlanacak.

---

## 4. Teknik Yol Haritası (Uygulama Adımları)
1. **`src/types/worksheet.ts` Güncellemesi:** Yeni Master JSON yapısını tanımla (Bir sayfa içinde hem infografik hem test barındıran hiyerarşi).
2. **`infographicGenerator.ts` -> `premiumWorksheetGenerator.ts`:** AI promptunu, "Sen bir matbaa dizgicisi ve sınav mimarısın. Bana farklı tipte 5 modül içeren bir kağıt tasarla" şeklinde devasa bir komuta dönüştür.
3. **`GraphicRenderer.tsx` Entegrasyonu:** Mevcut 28 tip grafik ve 3D modelleri, bu yeni sayfa üreticisine tam entegre et.
4. **Kokpit (Cockpit) Tasarımı:** Kullanıcının sürükle-bırak ile kağıdın iskeletini çizebileceği bir arayüz ekle.

Bu plan, Oogmatik platformunu sadece bir "soru bankası" olmaktan çıkarıp, öğretmenlerin saniyeler içinde **dünya standartlarında (PISA/TIMSS) yayın evi kalitesinde özelleştirilmiş kitapçıklar** basabildiği bir araca dönüştürecektir.

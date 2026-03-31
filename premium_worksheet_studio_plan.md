# İnfografik Stüdyosu'nun "Premium Hibrit Çalışma Sayfası Motoru"na Dönüştürülme Planı (V4.0)

## 1. Vizyon: Neden Bu Dönüşüme İhtiyacımız Var?
Öğretmenlerin elinde her zaman taratılacak fiziksel bir kağıt (OCR) bulunmayabilir. Sistem, öğretmenin veya kliniğin sadece bir "Konu" veya "Hedef Kazanım" girmesiyle **sıfırdan, dünyanın en zengin, pedagojik olarak kusursuz, ultra-premium çalışma kağıdını** dijital olarak üretebilmelidir.

Bu vizyon doğrultusunda mevcut "İnfografik Stüdyosu"; sadece tek bir görsel (kavram haritası vb.) üreten bir araç olmaktan çıkarılıp, uygulamanın **tüm kütüphanelerini (3D Geometri, Sıklık Tabloları, Okuma Parçaları, 5N1K, Zeka Oyunları)** tek bir A4 üzerinde profesyonel bir matbaa dizgisi gibi birleştiren bir **Orkestrasyon Motoruna (Composite Worksheet Generator)** dönüşecektir.

---

## 2. Temel İlke: Mevcut Şablonların Korunması ve "Bileşen"e (Widget) Dönüştürülmesi
İnfografik stüdyosunda halihazırda bulunan **hiçbir kategori veya şablon silinmeyecektir.**
Aksine, bu şablonlar (Venn Diyagramı, Balık Kılçığı, Süreç Adımları vb.) yeni üretilecek devasa çalışma kağıdının "yapıtaşları (bileşenleri)" haline getirilecektir.

*Örnek Bir Premium A4 Çalışma Kağıdı Dizilimi:*
1.  **Üst Kısım (Özet):** "Kavram Haritası" veya "Balık Kılçığı" şablonu (Eski İnfografik modülünden).
2.  **Orta Kısım (Görsel Analiz):** Matematik/Geometri modülünden 3D Küp veya Fonksiyon Grafiği ve buna bağlı mantık sorusu.
3.  **Orta-Alt Kısım (Sözel):** Bir okuma parçası ve Türkçe modülünden 5N1K bileşeni.
4.  **Alt Kısım (Değerlendirme):** LGS formatında 3 adet Çoktan Seçmeli test sorusu.

---

## 3. Premium Özellikler ve Yeni Eklemeler
Stüdyo, "Premium" hissiyatını artırmak için şu özelliklerle donatılacaktır:

*   **Multi-Agent AI Orkestrasyonu:** Tek bir Gemini isteği yerine, uzmanlaşmış ajanlar kullanılacak. (Pedagoji ajanı metinleri süzecek, Geometri ajanı 3D modelin koordinatlarını hesaplayacak, Dizgi ajanı bunları A4 sayfasına yerleştirecek).
*   **Dinamik Zorluk ve Bilişsel Yük Adaptasyonu:** Seçilen yaş grubu (Örn: 8-10 yaş) ve öğrenci profiline (Örn: Disleksi) göre Lexend font boyutu, satır aralıkları, kullanılacak renklerin pastel tonları ve görsel yoğunluk otomatik ayarlanacak.
*   **Gerçek Zamanlı Çıktı (Live Preview):** Sağ panelde, eklenen her bileşen anında A4 veya A5 formatında, matbaa kalitesinde render edilecek (Geçtiğimiz güncellediğimiz `A4PrintableSheetV2` veya `UniversalWorksheetViewer` altyapısı kullanılarak).

---

## 4. Ekosistem Entegrasyonu ve İş Akışları (Workflow)
Üretilen bu şaheser çalışma kağıtları sistemin içinde hapsolmayacak, tüm uygulamaya entegre edilecektir:

*   **📚 Çalışma Kitapçığına (Workbook) Ekle:** Üretilen sayfalar, öğrenciye özel oluşturulan "Haftalık Çalışma Fasikülü"ne bir sayfa olarak eklenebilecek.
*   **🗄️ Arşive Kaydet:** Düzenlenebilir JSON formatında öğretmenin/kurumun "Kişisel Kütüphanesi"ne kaydedilecek. İstenildiğinde tekrar açılıp tek bir sorusu değiştirilebilecek.
*   **🖨️ Yazdır ve ⬇️ İndir:** Yüksek çözünürlüklü (HD) PDF export ve doğrudan kablosuz yazıcıya gönderme desteği.
*   **🔗 Paylaşım:** Öğrencilere veya velilere özel, interaktif dijital ödev linki veya QR kod olarak paylaşılabilme.
*   **🛡️ Yönetici (Admin) Onayına Sunma İşlevi:**
    *   Öğretmenlerin (veya sistemin) ürettiği "Premium" kağıtlar doğrudan havuza düşmeyecek.
    *   **"Klinik ve Eğitsel Kurula Gönder" (Submit for Approval)** butonu eklenecek.
    *   Bu sayede platformun "Oogmatik Global Etkinlik Havuzu"na sadece başöğretmenler veya adminler tarafından pedagojik uygunluğu onaylanmış, hatasız içerikler eklenebilecek.

---

## 5. Teknik Yol Haritası (Adım Adım Geliştirme Planı)

### FAZ 1: UI / UX Dönüşümü (Kokpit Tasarımı)
*   Sol paneldeki mevcut infografik kategorileri (Kavram, Süreç, Analiz vb.) "Bileşen Kütüphanesi"ne dönüştürülecek.
*   Öğretmen için "Sürükle-Bırak" (Drag & Drop) veya "Ekle" butonlu bir **Kağıt İskeleti Oluşturucu (Template Builder)** tasarlanacak.
*   Kullanıcı kağıtta hangi modüllerin olacağını seçecek (Örn: 1 İnfografik + 1 Sıklık Tablosu + 3 Çoktan Seçmeli).

### FAZ 2: Backend & AI "Master JSON" Mimarisi
*   `infographicGenerator.ts` dosyası, `premiumCompositeGenerator.ts` olarak evrimleştirilecek.
*   Yapay zekaya giden Prompt: *"Sen bir başöğretmen ve sınav mimarısın. Konumuz X. Bana şu yapıda bir Master JSON üret: 1. Bileşen: Venn Diyagramı, 2. Bileşen: Silindir sorusu, 3. Bileşen: 2 adet LGS test sorusu. Tüm bunlar birbiriyle bağlantılı ve tutarlı bir hikaye/konu etrafında şekillensin."*
*   Oluşan Master JSON, uygulamanın mevcut tiplerine (`WorksheetData`) tam uyumlu olacak.

### FAZ 3: Frontend Render Motorunun Bağlanması
*   İnfografik stüdyosundaki mevcut `<NativeInfographicRenderer />` bileşeni, ana çalışma kağıdı bileşeni içine (`A4PrintableSheetV2` içerisine) bir alt modül (widget) olarak gömülecek.
*   Uygulamadaki diğer gelişmiş kütüphaneler (`GraphicRenderer`, 3D Küpler, Koordinat Sistemleri) bu sayfanın içine dinamik olarak çağrılacak.
*   Sayfanın alt bilgi (footer) kısmına "Admin Onayı", "Oluşturan Öğretmen", "Pedagojik Not" barkod/QR formatında eklenecek.

### FAZ 4: Entegrasyon ve Admin Paneli
*   "Kaydet", "PDF İndir", "Kitapçığa Ekle" butonları API servislere (`worksheetService.ts`) bağlanacak.
*   Veritabanında (Firebase/Firestore) `status: "pending_approval" | "approved" | "rejected"` mantığı kurularak "Admin Onay" süreci kodlanacak.
*   Admin paneline (`AdminDashboard`) "Onay Bekleyen Premium İçerikler" sekmesi eklenecek.

Bu plan uygulandığında Oogmatik; basit araçların bir araya geldiği bir platformdan çıkarak, kendi kendine dünya standartlarında fasiküller basabilen "Akıllı ve Kusursuz bir Dijital Yayın Evine" dönüşecektir.

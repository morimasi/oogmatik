# AI Sınav Hazırlama Asistanı - Kapsamlı Ürün Şartnamesi ve Geliştirme Rehberi

Bu belge, "Süper Matematik Sınav Stüdyosu" (AI Sınav Hazırlama Asistanı) uygulamasının inşa edilebilmesi için hazırlanmış **kapsamlı bir ürün şartnamesidir (Product Requirements Document - PRD)**.

Uygulamanın ne olduğu, amacı, tüm frontend özellikleri, kullanıcı akışları ve teknik gereksinimleri aşağıda en ince ayrıntısına kadar listelenmiştir.

--- module erısım ıcın Studyolar menusune Süper Matematatik Sınav Aracı olarak konumlandır.

## 1. Projenin Amacı ve Özeti
**modül Adı:** Süper Matematik Sınav Stüdyosu
**Amacı:** Türkiye MEB müfredatına (1. sınıftan 8. sınıfa kadar) tam uyumlu, öğretmenlerin ve velilerin saniyeler içinde özelleştirilmiş matematik sınavları, çalışma kağıtları ve testler oluşturmasını sağlayan yapay zeka destekli bir web modülüdür.
**Temel İşlev:** Kullanıcının seçtiği sınıf, ünite ve kazanımlara göre Google Gemini API'sini kullanarak anında özgün sorular üretir. Üretilen soruları A4 formatında bir sınav kağıdı gibi ekranda gösterir, düzenlemeye izin verir ve PDF olarak (cevap anahtarlı veya anahtarsız) dışa aktarır.

---

## 2. Teknoloji Yığını (Frontend Tech Stack)
Uygulamayı sıfırdan kuracak AI'ın kullanması gereken temel teknolojiler:
- **Framework:** React 18+ (Vite ile derlenmiş)
- **Dil:** TypeScript (Sıkı tip güvenliği, Interface ve Type tanımlamaları zorunludur)
- **Stil:** Tailwind CSS (Responsive, modern ve temiz arayüz)
- **İkonlar:** `lucide-react`
- **Yönlendirme:** `react-router-dom` (İstemci tarafı yönlendirme)
- **Yapay Zeka:** `@google/genai` (Gemini 2.5 Flash modeli)
- **PDF Çıktısı:** `html2canvas` ve `jspdf` (DOM elementlerini resme çevirip PDF'e basmak için)
- **Durum Yönetimi:** React Hooks (`useState`, `useEffect`, `useContext`)
- **Veri Kalıcılığı:** Tarayıcı `localStorage` API'si (Geçmiş sınavları kaydetmek için)

---

## 3. Detaylı Frontend Özellikleri ve Kullanıcı Arayüzü (UI/UX)

Uygulama temel olarak bir Sol Menü (Sidebar) ve Sağ İçerik Alanı (Main Content) olmak üzere ikiye ayrılır.

### 3.1. Sol Menü (Sidebar Navigation)
- **Logo ve Başlık:** Üst kısımda uygulamanın adı ve ikonik bir logo bulunur.
- **Menü Elemanları:**
  1. **Yeni Sınav (Curriculum Selector):** Sınav oluşturma ekranını açar.
  2. **Sınav Geçmişi (History):** Kullanıcının daha önce oluşturup kaydettiği sınavları listeler.
  3. **Hazır Sınavlar (Archive):** Sistemde önceden tanımlı, statik sınav arşivini gösterir.
  4. **Nasıl Kullanılır:** Uygulamanın kullanım kılavuzunu içeren statik sayfa.

### 3.2. Sınav Oluşturucu Ekranı (Curriculum Selector)
Kullanıcının AI'a vereceği komutu (prompt) şekillendirdiği ana form alanıdır.
- **Sınıf Seçimi:** 1'den 8'e kadar sınıf seçimi (Dropdown).
- **Ünite Seçimi:** Seçilen sınıfa ait ünitelerin listelendiği alan (Dropdown). Sınıf seçilmeden aktif olmaz. birden fazla seçilebilir.
- **Kazanım Seçimi:** Seçilen üniteye ait MEB kazanımlarının listesi. Kullanıcı birden fazla kazanım seçebilir (Checkbox listesi).
- **Sınav Ayarları (Gelişmiş Filtreler):**
  - **Soru Sayısı:** Kaç soru üretileceği (Slider veya Number Input, örn: 1-50 arası).
  - **Soru Tipi:** Çoktan Seçmeli, Doğru/Yanlış, Boşluk Doldurma,açık uçlu, 1.sınıflara özel okuma yazma öğretimi için 2026 okuma yazma mufredatının kazanımlarını karsılayacak özel etkınlık sablonuları olmalı, harf, hece ,kelime,cümle etkınlıkleri olmalı. (Dropdown).
  - **Zorluk Seviyesi:** Otomatik,basit, Temel, Orta, İleri (Dropdown).
  - **İşlem Sayısı:** Sorunun kaç işlemle çözüleceği, 1,2,3 ve daha çok (Opsiyonel Input).
  - **Görsel Veri Eklensin mi?:** Tablo, grafik veya geometri şekilleri içeren sorular üretilmesi için bir Switch/Toggle.
  - **Özel Talimatlar:** Kullanıcının AI'a eklemek istediği özel notlar (Textarea, örn: "Sorular uzay temalı olsun").
- **Aksiyon Butonu:** "Sınavı Oluştur" butonu. Tıklandığında yükleme animasyonu (Loading State) başlar.

### 3.3. Sınav Kağıdı Görünümü (Quiz View)
Yapay zekadan dönen verilerin ekrana basıldığı, A4 kağıdını simüle eden alandır.
- **Sınav Başlığı (Header):** Öğrenci Adı, Soyadı, Sınıfı, Numarası, Tarih ve Puan alanlarını içeren klasik okul sınavı başlığı.
- **Soru Listesi:**
  - Sorular numaralandırılmış olarak alt alta listelenir.
  - **Görsel Veri İşleme (Kritik):** Eğer AI soruda bir `grafik_verisi` (JSON formatında) döndürdüyse, frontend bunu algılayıp ekrana SVG veya HTML tabloları çizmelidir (Örn: Sıklık tablosu, sütun grafiği, üçgen, doğru parçası çizimleri).
  - **Seçenekler:** Çoktan seçmeli ise A, B, C, D şıkları alt alta veya yan yana dizilir.
- **Etkileşimli Düzenleme (Inline Editing):**
  - Kullanıcı bir soru metnine veya şıkka tıkladığında, metin anında bir `textarea` veya `input`'a dönüşmeli ve kullanıcı soruyu manuel olarak değiştirebilmelidir.
- **Tekil Soru Yenileme:** Her sorunun yanında bir "Yenile" (Refresh) butonu bulunur. Tıklandığında sadece o soru için Gemini API'ye tekrar istek atılır ve soru yeni bir alternatifle değiştirilir.
- **Cevap Anahtarı Bölümü:** Sınav kağıdının en altında, her sorunun doğru cevabını, zorluk seviyesini, çözüm açıklamasını ve pedagojik gerçek yaşam bağlantısını içeren detaylı bir tablo bulunur.
- **Aksiyon Çubuğu (Floating/Sticky Bar):**
  - **Sınavı Kaydet:** Sınavı JSON formatında `localStorage`'a kaydeder.
  - **PDF İndir (Öğrenci):** Cevap anahtarı bölümünü DOM'dan gizleyerek sadece soruları PDF yapar.
  - **PDF İndir (Öğretmen):** Soruları ve cevap anahtarını birlikte PDF yapar.

### 3.4. Sınav Geçmişi (History) ve Arşiv (Archive)
- **Geçmiş:** `localStorage`'dan okunan sınavların kartlar halinde listelendiği ekran. Kartlarda sınav tarihi, sınıf, ünite ve soru sayısı yazar. "Görüntüle" ve "Sil" butonları bulunur.
- **Arşiv:** Uygulamanın kod tabanında (hardcoded) bulunan hazır sınavların listelendiği ekran.

---

## 4. Yapay Zeka (Gemini API) Entegrasyonu ve Çalışma Mantığı

Bu uygulamanın kalbi, Frontend'in AI'a gönderdiği yapılandırılmış Prompt (Komut) ve AI'dan beklediği kesin **JSON Şemasıdır (JSON Schema)**.

### 4.1. Prompt Mühendisliği (Prompt Engineering)
AI'a gönderilen prompt dinamik olarak oluşturulur:
- **İlkokul (1-5. Sınıf):** Prompt, "Beceri temelli, ezbere dayalı olmayan, günlük hayat senaryoları içeren" sorular üretmesini emreder.
- **Ortaokul (6-8. Sınıf):** Prompt, "LGS tarzı, okuduğunu anlama, mantıksal akıl yürütme, analitik düşünme gerektiren Yeni Nesil sorular" üretmesini emreder.
- Prompt içine kullanıcının seçtiği Sınıf, Ünite adı ve tam Kazanım metinleri enjekte edilir.

### 4.2. Beklenen JSON Şeması (Structured Output)
AI'ın kesinlikle aşağıdaki TypeScript Interface'ine uygun bir JSON dizisi döndürmesi zorunlu kılınmıştır (Gemini `responseSchema` özelliği kullanılarak):

```typescript
interface DetailedQuestion {
  sinif: number;
  unite_adi: string;
  unite_no: number;
  kazanim_kodu: string;
  kazanim_metni: string;
  soru_tipi: 'coktan_secmeli' | 'dogru_yanlis' | 'bosluk_doldurma';
  soru_metni: string;
  // Eğer görsel veri istendiyse AI bu objeyi doldurur:
  grafik_verisi?: {
    tip: 'siklik_tablosu' | 'sutun_grafiği' | 'ucgen' | 'kare' | 'dogru_parcasi' /* vb. */;
    baslik: string;
    veri: Array<{ etiket: string; deger?: number; nesne?: string; birim?: string }>;
    not?: string;
  };
  secenekler?: { A: string; B: string; C: string; D: string }; // Sadece çoktan seçmeli için
  dogru_cevap: string;
  gercek_yasam_baglantisi: string;
  seviye: 'temel' | 'orta' | 'ileri';
  cozum_anahtari: string;
  yanlis_secenek_tipleri?: string[]; // Çeldiricilerin mantığı
}
```

### 4.3. Hata Yönetimi ve Akış (Streaming/Chunking)
- API çağrıları sırasında 429 (Rate Limit) veya 503 (Service Unavailable) hataları alınırsa, frontend otomatik olarak "Exponential Backoff" (bekleme süresini katlayarak artırma) mantığıyla isteği 3 defaya kadar tekrar dener (Retry mechanism).
- Çok fazla soru istendiğinde (örn: 20 soru), frontend kazanımları gruplara ayırır ve AI'a parça parça (chunk) istek atar. Gelen cevaplar ekranda anında birikerek gösterilir.

---

## 5. Veri Yapısı (Curriculum Data)
Uygulamanın içinde statik bir `curriculum.ts` (veya `constants.ts`) dosyası bulunmalıdır. Bu dosya şu yapıda olmalıdır:
```typescript
[
  {
    grade: "1",
    units: [
      {
        name: "Sayılar ve İşlemler",
        kazanimlar: [
          { id: "M.1.1.1.1.", name: "Rakamları okur ve yazar." },
          // ...
        ]
      }
    ]
  },
  // 2, 3, 4, 5, 6, 7, 8. sınıflar için benzer yapı...
]
```
Frontend'deki Dropdown'lar (Sınıf -> Ünite -> Kazanım) birbirine bağımlı olarak bu veri yapısından beslenir.

---

## 6. Sıfırdan Geliştirecek AI İçin Talimatlar (AI Developer Instructions)

Eğer bu belgeyi okuyan bir Yapay Zeka isen ve bu uygulamayı sıfırdan inşa etmen isteniyorsa, aşağıdaki adımları sırasıyla uygula:

1. **Proje Kurulumu:** Vite + React + TypeScript şablonunu oluştur. Tailwind CSS'i kur ve yapılandır. `lucide-react`, `jspdf`, `html2canvas` ve `@google/genai` paketlerini yükle.
2. **Veri Katmanı:** `src/constants/curriculum.ts` dosyasını oluştur ve MEB 1-8. sınıf matematik müfredatını hiyerarşik JSON formatında tanımla.
3. **Tip Tanımlamaları:** `src/types/index.ts` dosyasını oluştur ve yukarıda belirtilen `DetailedQuestion`, `Quiz`, `Kazanim` interfacelerini yaz.
4. **Servis Katmanı:** `src/services/geminiService.ts` dosyasını oluştur. Gemini API'sine bağlanacak, promptları (LGS ve İlkokul ayrımına dikkat ederek) oluşturacak ve `responseSchema` ile JSON formatında yanıt alacak fonksiyonları yaz. Hata yakalama (retry) mantığını unutma.
5. **Durum Yönetimi:** `src/services/storageService.ts` oluşturarak `localStorage` tabanlı CRUD (Oluştur, Oku, Sil) işlemlerini yaz.
6. **Bileşenler (Components):**
   - `CurriculumSelector.tsx`: Bağımlı dropdown'ları ve form elemanlarını içeren sol menü/form bileşeni.
   - `QuizView.tsx`: Sınav kağıdı tasarımı. **En zor kısım burasıdır:** Gelen JSON içindeki `grafik_verisi`ni algılayıp ekrana SVG çizen alt bileşenler (örn: `GraphicRenderer.tsx`) yazmalısın. Ayrıca metinlere tıklandığında düzenlenebilme (Inline Edit) özelliğini eklemelisin.
   - `HistoryList.tsx` ve `Archive.tsx`: Kaydedilmiş sınavları listeleyen bileşenler.
7. **PDF Çıktısı:** `QuizView` içinde `html2canvas` ile DOM'u yakalayıp `jspdf` ile PDF'e basan fonksiyonu yaz. Cevap anahtarını gizleme/gösterme mantığını DOM manipülasyonu veya CSS class'ları ile çöz.
8. **Routing:** `App.tsx` içinde `react-router-dom` kullanarak sayfaları birbirine bağla ve ana Layout'u (Sidebar + Main Content) oluştur.

Bu şartname, uygulamanın birebir kopyasını eksiksiz bir şekilde oluşturmak için gereken tüm mimari ve fonksiyonel detayları içermektedir.





veri olarak bunu kullanmalısın.


# Müfredat Kazanımları

## 1. Sınıf

### Sayılar ve İşlemler
- **M.1.1.1.1:** Nesne sayısı 20’ye kadar (20 dâhil) olan bir topluluktaki nesnelerin sayısını belirler ve bu sayıyı rakamla yazar.
- **M.1.1.1.2:** 20’ye kadar olan sayıları ileriye ve geriye doğru birer birer ritmik sayar.
- **M.1.1.1.3:** Rakamları okur ve yazar.
- **M.1.1.1.4:** 20 içinde iki sayıyı karşılaştırır ve aralarındaki ilişkiyi “büyük”, “küçük”, “eşit” ifadeleriyle belirtir.
- **M.1.1.1.5:** Sıra bildiren sayıları sözlü olarak ifade eder.
- **M.1.1.2.1:** Toplama işleminin anlamını kavrar.
- **M.1.1.2.2:** Toplamları 20’ye kadar (20 dâhil) olan doğal sayılarla toplama işlemini yapar.
- **M.1.1.2.3:** Toplama işleminde verilmeyen toplananı bulur.
- **M.1.1.2.4:** Zihinden toplama işlemi yapar.
- **M.1.1.3.1:** Çıkarma işleminin anlamını kavrar.
- **M.1.1.3.2:** 20’ye kadar (20 dâhil) olan doğal sayılarla çıkarma işlemini yapar.
- **M.1.1.3.3:** Çıkarma işleminde verilmeyen terimleri bulur.

### Geometri
- **M.1.2.1.1:** Uzamsal ilişkileri ifade eder.
- **M.1.2.2.1:** Geometrik cisimleri tanır ve isimlendirir.
- **M.1.2.2.2:** Geometrik şekilleri tanır ve isimlendirir.
- **M.1.2.3.1:** Bir örüntüdeki ilişkiyi belirler ve örüntüyü tamamlar.

### Ölçme
- **M.1.3.1.1:** Uzunlukları standart olmayan birimlerle ölçer.
- **M.1.3.1.2:** Nesneleri uzunlukları yönünden karşılaştırır ve sıralar.
- **M.1.3.2.1:** Paralarımızı tanır.
- **M.1.3.3.1:** Zaman ölçme birimlerini tanır.
- **M.1.3.3.2:** Tam saatleri okur.

### Veri İşleme
- **M.1.4.1.1:** En çok iki veri grubuna ait basit tabloları okur.

## 2. Sınıf

### Sayılar ve İşlemler
- **M.2.1.1.1:** 100’e kadar olan doğal sayıları ileriye doğru birer, beşer ve onar ritmik sayar.
- **M.2.1.1.2:** 100’den küçük doğal sayıların basamaklarını adlandırır, basamaklarındaki rakamların basamak değerlerini belirtir.
- **M.2.1.1.3:** 100’den küçük doğal sayıları karşılaştırır ve sıralar.
- **M.2.1.1.4:** 100’den küçük doğal sayıları en yakın onluğa yuvarlar.
- **M.2.1.2.1:** Toplamları 100’e kadar (100 dâhil) olan doğal sayılarla eldesiz ve eldeli toplama işlemini yapar.
- **M.2.1.2.2:** İki sayının toplamını tahmin eder ve tahminini işlem sonucuyla karşılaştırır.
- **M.2.1.2.3:** Zihinden toplama işlemi yapar.
- **M.2.1.2.4:** Toplama işlemi gerektiren problemleri çözer.
- **M.2.1.3.1:** 100’e kadar olan doğal sayılarla onluk bozmayı gerektiren ve gerektirmeyen çıkarma işlemini yapar.
- **M.2.1.3.2:** İki sayının farkını tahmin eder ve tahminini işlem sonucuyla karşılaştırır.
- **M.2.1.3.3:** Zihinden çıkarma işlemi yapar.
- **M.2.1.3.4:** Çıkarma işlemi gerektiren problemleri çözer.
- **M.2.1.4.1:** Çarpma işleminin tekrarlı toplama olduğunu anlar.
- **M.2.1.4.2:** Çarpım tablosunu oluşturur.
- **M.2.1.4.3:** Çarpma işlemi gerektiren problemleri çözer.
- **M.2.1.5.1:** Bölme işleminin anlamını kavrar.
- **M.2.1.5.2:** Bölme işlemi gerektiren problemleri çözer.

### Geometri
- **M.2.2.1.1:** Geometrik şekilleri kenar ve köşe sayılarına göre sınıflandırır.
- **M.2.2.2.1:** Bir örüntüdeki ilişkiyi belirler ve örüntüyü tamamlar.

### Ölçme
- **M.2.3.1.1:** Standart uzunluk ölçme birimlerini tanır.
- **M.2.3.1.2:** Metre ve santimetre arasındaki ilişkiyi açıklar.
- **M.2.3.2.1:** Tam, yarım ve çeyrek saatleri okur.
- **M.2.3.3.1:** Paralarımızla ilgili problemleri çözer.
- **M.2.3.4.1:** Nesneleri gram ve kilogram birimleriyle tartar.

### Veri İşleme
- **M.2.4.1.1:** Veri toplar ve çetele tablosu oluşturur.
- **M.2.4.1.2:** Nesne ve şekil grafiği oluşturur.

## 3. Sınıf

### Sayılar ve İşlemler
- **M.3.1.1.1:** Üç basamaklı doğal sayıları okur ve yazar.
- **M.3.1.1.2:** Üç basamaklı doğal sayıların basamak adlarını, basamaklarındaki rakamların basamak değerlerini belirler.
- **M.3.1.1.3:** 1000’e kadar olan doğal sayıları karşılaştırır ve sıralar.
- **M.3.1.1.4:** 1000’e kadar olan doğal sayıları en yakın onluğa ve yüzlüğe yuvarlar.
- **M.3.1.1.5:** 1000 içinde altışar, yedişer, sekizer, dokuzar ileriye ritmik sayar.
- **M.3.1.2.1:** En çok üç basamaklı sayılarla eldesiz ve eldeli toplama işlemini yapar.
- **M.3.1.2.2:** İki sayının toplamını tahmin eder ve tahminini işlem sonucuyla karşılaştırır.
- **M.3.1.2.3:** Toplama işleminin özelliklerini kullanır.
- **M.3.1.2.4:** Toplama işlemi gerektiren problemleri çözer.
- **M.3.1.3.1:** En çok üç basamaklı sayılardan, en çok üç basamaklı sayıları çıkarır.
- **M.3.1.3.2:** Zihinden çıkarma işlemi yapar.
- **M.3.1.3.3:** Çıkarma işlemi gerektiren problemleri çözer.
- **M.3.1.4.1:** Çarpma işleminin özelliklerini kullanır.
- **M.3.1.4.2:** Üç basamaklı bir doğal sayı ile bir basamaklı bir doğal sayıyı çarpar.
- **M.3.1.4.3:** İki basamaklı bir doğal sayı ile en çok iki basamaklı bir doğal sayıyı çarpar.
- **M.3.1.4.4:** Zihinden çarpma işlemi yapar.
- **M.3.1.4.5:** Çarpma işlemi gerektiren problemleri çözer.
- **M.3.1.5.1:** İki basamaklı bir doğal sayıyı bir basamaklı bir doğal sayıya böler.
- **M.3.1.5.2:** Bölme işleminde kalanı yorumlar.
- **M.3.1.5.3:** Bölme işlemi gerektiren problemleri çözer.
- **M.3.1.6.1:** Birim kesirleri tanır ve modellerle gösterir.
- **M.3.1.6.2:** Bir bütünün belirtilen birim kesir kadarını belirler.
- **M.3.1.6.3:** Paydası 10 ve 100 olan kesirleri birim kesir olarak ifade eder.

### Geometri
- **M.3.2.1.1:** Nokta, doğru, doğru parçası ve ışını açıklar.
- **M.3.2.1.2:** Düzlem ve düzlemsel şekilleri açıklar.
- **M.3.2.2.1:** Açıları isimlendirir ve sınıflandırır.
- **M.3.2.2.2:** Üçgen, kare, dikdörtgeni kenarlarına ve açılarına göre sınıflandırır.
- **M.3.2.3.1:** Tekrarlayan bir geometrik örüntü oluşturur ve örüntünün kuralını açıklar.
- **M.3.2.4.1:** Düzlemsel şekillerin simetri doğrularını belirler ve çizer.

### Ölçme
- **M.3.3.1.1:** Metre ve santimetre arasındaki ilişkiyi fark eder ve birbiri cinsinden yazar.
- **M.3.3.1.2:** Kilometrenin kullanım alanlarını belirtir.
- **M.3.3.1.3:** Uzunluk ölçme birimleriyle ilgili problemleri çözer.
- **M.3.3.2.1:** Şekillerin çevre uzunluğunu hesaplar.
- **M.3.3.2.2:** Çevre uzunlukları ile ilgili problemleri çözer.
- **M.3.3.3.1:** Alanın, standart olmayan birimlerle ölçülebileceğini fark eder.
- **M.3.3.4.1:** Saat, dakika ve saniye arasındaki ilişkiyi açıklar.
- **M.3.3.4.2:** Zaman ölçme birimleriyle ilgili problemleri çözer.
- **M.3.3.5.1:** Lira ve kuruş ilişkisini gösterir.
- **M.3.3.5.2:** Paralarımızla ilgili problemleri çözer.
- **M.3.3.6.1:** Kilogram ve gram arasındaki ilişkiyi fark eder.
- **M.3.3.6.2:** Tartma ile ilgili problemleri çözer.
- **M.3.3.7.1:** Litre ve yarım litreyi kullanır.
- **M.3.3.7.2:** Sıvı ölçme ile ilgili problemleri çözer.

### Veri İşleme
- **M.3.4.1.1:** Nesne ve şekil grafikleri oluşturur ve yorumlar.
- **M.3.4.1.2:** Sıklık tablosu oluşturur.

## 4. Sınıf

### Sayılar ve İşlemler
- **M.4.1.1.1:** 4, 5 ve 6 basamaklı doğal sayıları okur ve yazar.
- **M.4.1.1.2:** Milyonlar basamağına kadar olan doğal sayıları okur ve yazar.
- **M.4.1.1.3:** Doğal sayıları en yakın onluğa veya yüzlüğe yuvarlar.
- **M.4.1.1.4:** Sayı örüntülerindeki ilişkiyi bulur ve örüntüyü genişletir.
- **M.4.1.2.1:** En çok dört basamaklı doğal sayılarla toplama işlemi yapar.
- **M.4.1.2.2:** Zihinden toplama işlemi yapar.
- **M.4.1.2.3:** Toplama işlemi gerektiren problemleri çözer.
- **M.4.1.3.1:** En çok dört basamaklı doğal sayılarla çıkarma işlemi yapar.
- **M.4.1.3.2:** Zihinden çıkarma işlemi yapar.
- **M.4.1.3.3:** Çıkarma işlemi gerektiren problemleri çözer.
- **M.4.1.4.1:** En çok üç basamaklı bir doğal sayı ile en çok iki basamaklı bir doğal sayıyı çarpar.
- **M.4.1.4.2:** Çarpma işleminin sonucunu tahmin eder.
- **M.4.1.5.1:** En çok dört basamaklı bir doğal sayıyı en çok iki basamaklı bir doğal sayıya böler.
- **M.4.1.5.2:** Bölme işleminin sonucunu tahmin eder.
- **M.4.1.5.3:** Zihinden bölme işlemi yapar.
- **M.4.1.6.1:** Basit, bileşik ve tam sayılı kesirleri tanır ve modellerle gösterir.
- **M.4.1.6.2:** Kesirleri karşılaştırır ve sıralar.
- **M.4.1.6.3:** Bir çokluğun belirtilen basit kesir kadarını bulur.
- **M.4.1.7.1:** Kesirlerle toplama ve çıkarma işlemi yapar.

### Geometri
- **M.4.2.1.1:** Açının kenarlarını ve köşesini isimlendirir.
- **M.4.2.1.2:** Açıları standart olmayan birimlerle ölçer ve standart açı ölçme birimlerinin gerekliliğini açıklar.
- **M.4.2.1.3:** Açıları standart birimlerle ölçer.
- **M.4.2.2.1:** Üçgenleri kenar uzunluklarına göre sınıflandırır.
- **M.4.2.2.2:** Üçgenleri açılarına göre sınıflandırır.
- **M.4.2.2.3:** Kare ve dikdörtgenin kenar ve açı özelliklerini belirler.
- **M.4.2.3.1:** Düzlemsel şekillerin simetri doğrularını belirler.

### Ölçme
- **M.4.3.1.1:** Uzunluk ölçme birimleri ile ilgili problemleri çözer.
- **M.4.3.1.2:** Metre, santimetre ve milimetre arasındaki ilişkiyi açıklar.
- **M.4.3.1.3:** Kilometre ve metre arasındaki ilişkiyi açıklar.
- **M.4.3.2.1:** Kare ve dikdörtgenin çevre uzunlukları ile kenar uzunlukları arasındaki ilişkiyi açıklar.
- **M.4.3.2.2:** Çevre uzunluğu ile ilgili problemleri çözer.
- **M.4.3.2.3:** Üçgenin çevre uzunluğunu hesaplar.
- **M.4.3.3.1:** Dikdörtgenin alanını hesaplar.
- **M.4.3.3.2:** Alanı ile ilgili problemleri çözer.
- **M.4.3.4.1:** Zaman ölçü birimleri arasındaki ilişkiyi açıklar.
- **M.4.3.4.2:** Zaman ölçme birimleri ile ilgili problemleri çözer.

### Veri İşleme
- **M.4.4.1.1:** Sütun grafiği oluşturur ve yorumlar.
- **M.4.4.1.2:** Sütun grafiği, tablo ve diğer grafiklerle gösterilen bilgileri kullanarak günlük hayatla ilgili problemler çözer.

## 5. Sınıf

### Sayılar ve İşlemler
- **M.5.1.1.1:** Milyonlu sayıları okur ve yazar.
- **M.5.1.1.2:** Doğal sayıları en yakın onluğa, yüzlüğe veya binliğe yuvarlar.
- **M.5.1.1.3:** Sayı ve şekil örüntülerinin kuralını bulur ve örüntüyü genişletir.
- **M.5.1.2.1:** Doğal sayılarla zihinden toplama ve çıkarma işlemlerinde strateji belirler ve kullanır.
- **M.5.1.2.2:** Doğal sayılarla çarpma ve bölme işlemlerinin sonuçlarını tahmin eder.
- **M.5.1.2.3:** Bir doğal sayının karesini ve küpünü hesaplar.
- **M.5.1.2.4:** Parantezli işlemleri yapar.
- **M.5.1.2.5:** Doğal sayılarla dört işlem yapmayı gerektiren problemleri çözer.
- **M.5.1.3.1:** Kesirleri sıralar.
- **M.5.1.3.2:** Tam sayılı kesri bileşik kesre, bileşik kesri tam sayılı kesre dönüştürür.
- **M.5.1.4.1:** Kesirlerle toplama ve çıkarma işlemi yapar.
- **M.5.1.4.2:** Bir çokluğun belirtilen bir basit kesir kadarını ve basit kesir kadarı verilen bir çokluğun tamamını bulur.
- **M.5.1.4.3:** Kesirlerle toplama ve çıkarma işlemi gerektiren problemleri çözer.
- **M.5.1.5.1:** Ondalık gösterimleri okur ve yazar.
- **M.5.1.5.2:** Ondalık gösterimlerde basamak değerlerini belirler.
- **M.5.1.5.3:** Ondalık gösterimleri verilen sayıları sıralar.
- **M.5.1.5.4:** Ondalık gösterimlerle toplama ve çıkarma işlemi yapar.
- **M.5.1.6.1:** Yüzdeleri, kesir ve ondalık gösterimle ilişkilendirir.
- **M.5.1.6.2:** Bir çokluğun belirtilen bir yüzdesine karşılık gelen miktarı bulur.
- **M.5.1.6.3:** Yüzde ile ilgili problemleri çözer.

### Geometri
- **M.5.2.1.1:** Temel geometrik kavramları tanır.
- **M.5.2.1.2:** Doğruya, bir noktasından veya dışındaki bir noktadan dikme çizer.
- **M.5.2.1.3:** Bir doğru parçasına paralel bir doğru parçası inşa eder.
- **M.5.2.2.1:** Çokgenleri isimlendirir, oluşturur ve temel elemanlarını tanır.
- **M.5.2.2.2:** Üçgen ve dörtgenlerin iç açılarının ölçüleri toplamını belirler ve verilmeyen açıyı bulur.

### Ölçme
- **M.5.3.1.1:** Uzunluk ölçme birimlerini (km, m, cm, mm) birbirine dönüştürür.
- **M.5.3.1.2:** Zaman ölçü birimlerini (yıl, ay, hafta, gün) birbirine dönüştürür.
- **M.5.3.1.3:** Uzunluk ve zaman ölçme birimleri ile ilgili problemleri çözer.
- **M.5.3.2.1:** Dikdörtgenin alanını hesaplamayı gerektiren problemleri çözer.
- **M.5.3.2.2:** Üçgenin alanını hesaplar.
- **M.5.3.3.1:** Dikdörtgenler prizmasının yüzey alanını hesaplar.
- **M.5.3.3.2:** Dikdörtgenler prizmasının hacmini hesaplar.

### Veri İşleme
- **M.5.4.1.1:** Araştırma soruları üretir, veri toplar ve düzenler.
- **M.5.4.1.2:** Sıklık tablosu ve sütun grafiği oluşturur.
- **M.5.4.1.3:** Bir veri grubuna ait aritmetik ortalamayı hesaplar ve yorumlar.

## 6. Sınıf

### Sayılar ve İşlemler
- **M.6.1.1.1:** Bir doğal sayının kendisiyle tekrarlı çarpımını üslü ifade olarak yazar ve değerini hesaplar.
- **M.6.1.1.2:** İşlem önceliğini dikkate alarak doğal sayılarla dört işlem yapar.
- **M.6.1.2.1:** Doğal sayıların çarpanlarını ve katlarını belirler.
- **M.6.1.2.2:** Bölünebilme kurallarını açıklar ve kullanır.
- **M.6.1.2.3:** Asal sayıları özellikleriyle belirler.
- **M.6.1.3.1:** Kümeler ile ilgili temel kavramları anlar.
- **M.6.1.4.1:** Tam sayıları tanır ve sayı doğrusunda gösterir.
- **M.6.1.5.1:** Kesirleri karşılaştırır, sıralar ve sayı doğrusunda gösterir.
- **M.6.1.5.2:** Kesirlerle toplama, çıkarma, çarpma ve bölme işlemlerini yapar.
- **M.6.1.6.1:** Ondalık gösterimleri verilen sayıları çözümler.
- **M.6.1.7.1:** İki çokluğun oranını ifade eder.

### Cebir
- **M.6.2.1.1:** Sözel olarak verilen bir duruma uygun cebirsel ifade ve verilen bir cebirsel ifadeye uygun sözel bir durum yazar.

### Geometri ve Ölçme
- **M.6.3.1.1:** Açıyı başlangıç noktaları aynı olan iki ışının oluşturduğu şekil olarak tanır ve sembolle gösterir.
- **M.6.3.2.1:** Üçgenin alan bağıntısını oluşturur ve ilgili problemleri çözer.
- **M.6.3.3.1:** Çember çizerek merkezini, yarıçapını ve çapını tanır.

### Veri İşleme
- **M.6.4.1.1:** İki veri grubuna ait verileri karşılaştırmayı gerektiren araştırma soruları oluşturur.

## 7. Sınıf

### Sayılar ve İşlemler
- **M.7.1.1.1:** Tam sayılarla toplama ve çıkarma işlemlerini yapar, ilgili problemleri çözer.
- **M.7.1.1.2:** Tam sayılarla çarpma ve bölme işlemlerini yapar.
- **M.7.1.2.1:** Rasyonel sayıları tanır ve sayı doğrusunda gösterir.
- **M.7.1.3.1:** Rasyonel sayılarla toplama, çıkarma, çarpma ve bölme işlemlerini yapar.
- **M.7.1.4.1:** Birbirine oranı verilen iki çokluktan biri verildiğinde diğerini bulur.
- **M.7.1.5.1:** Bir çokluğun belirtilen bir yüzdesine karşılık gelen miktarını bulur.

### Cebir
- **M.7.2.1.1:** Cebirsel ifadelerle toplama ve çıkarma işlemleri yapar.
- **M.7.2.2.1:** Birinci dereceden bir bilinmeyenli denklemleri kurar ve çözer.

### Geometri ve Ölçme
- **M.7.3.1.1:** Bir açıya eş bir açı çizer ve bir açıyı iki eş açıya ayırır.
- **M.7.3.2.1:** Düzgün çokgenlerin kenar ve açı özelliklerini açıklar.
- **M.7.3.3.1:** Çemberde merkez açıları, gördüğü yayları ve ölçüleri arasındaki ilişkileri belirler.

### Veri İşleme
- **M.7.4.1.1:** Verilere ilişkin çizgi grafiği oluşturur ve yorumlar.

## 8. Sınıf

### Sayılar ve İşlemler
- **M.8.1.1.1:** Verilen pozitif tam sayıların pozitif tam sayı çarpanlarını bulur.
- **M.8.1.1.2:** İki doğal sayının en büyük ortak bölenini (EBOB) ve en küçük ortak katını (EKOK) hesaplar.
- **M.8.1.2.1:** Tam sayıların, tam sayı kuvvetlerini hesaplar.
- **M.8.1.3.1:** Tam kare pozitif tam sayılarla bu sayıların karekökleri arasındaki ilişkiyi belirler.

### Veri İşleme
- **M.8.2.1.1:** En fazla üç veri grubuna ait çizgi ve sütun grafiklerini yorumlar.

### Olasılık
- **M.8.3.1.1:** Bir olaya ait olası durumları belirler.

### Cebir
- **M.8.4.1.1:** Cebirsel ifadeleri çarpanlara ayırır.
- **M.8.4.2.1:** Birinci dereceden bir bilinmeyenli denklemleri çözer.
- **M.8.4.3.1:** Birinci dereceden bir bilinmeyenli eşitsizlikleri sayı doğrusunda gösterir.

### Geometri ve Ölçme
- **M.8.5.1.1:** Üçgende kenarortay, açıortay ve yüksekliği inşa eder.
- **M.8.5.2.1:** Nokta, doğru parçası ve diğer şekillerin öteleme ve yansıma altındaki görüntülerini çizer.

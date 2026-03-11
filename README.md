# 🧠 Bursa Disleksi AI v2.0

**Bursa Disleksi AI**, özel öğrenme güçlüğü (disleksi, diskalkuli, disgrafi) ve DEHB tanılı bireyler için yapay zeka destekli, kişiselleştirilmiş ve bilimsel temelli eğitim materyalleri üreten kapsamlı bir platformdur.

Google Gemini AI teknolojisini kullanarak saniyeler içinde zengin içerikli çalışma sayfaları, akıllı eğitim planları ve bilişsel değerlendirme raporları oluşturur.

---

## 🚀 Öne Çıkan Özellikler

*   **100+ Akıllı Etkinlik Türü:** Okuma anlama, matematik labirenti, görsel dikkat, mantıksal çıkarım ve daha fazlası.
*   **AI Tasarım Klonlayıcı (OCR):** Mevcut bir çalışma sayfasının fotoğrafını çekin; AI tasarımı analiz etsin ve benzer yapıda tamamen yeni sorularla dijitalleştirsin.
*   **Akıllı Eğitim Koçu:** Öğrencinin ihtiyaçlarına ve ilgi alanlarına göre 7-30 günlük "Spiral Öğrenme" modelli çalışma programları üretir.
*   **Bilişsel Değerlendirme Bataryası:** İnteraktif testler (Stroop, RAN, Matrix) ile öğrencinin güçlü ve zayıf yönlerini analiz eder, "Akıllı Rota" önerir.
*   **Reading & Math Studio:** Kendi çalışma kağıdınızı profesyonel araçlarla sıfırdan tasarlayın.
*   **Gelişmiş Editör:** Üretilen her metni, görseli ve bileşeni sayfa üzerinde sürükle-bırak yöntemiyle düzenleyin.

---

## 🛠 Teknoloji Yığını

*   **Frontend:** React 19, TypeScript, Tailwind CSS
*   **AI Engine:** Google Gemini 3.0 Flash & Pro (GenAI SDK)
*   **Backend & Database:** Firebase (Auth, Firestore)
*   **Deployment:** Vercel
*   **Araçlar:** html2canvas (Görüntüleme), jsPDF (Baskı), PDF.js (Analiz)

---

## 📦 Kurulum ve Dağıtım

Bu uygulama **Vercel** üzerinde çalışmak üzere optimize edilmiştir. Sorunsuz çalışma için aşağıdaki ortam değişkenlerinin (Environment Variables) tanımlanması zorunludur.

### 1. Ortam Değişkenlerini Ayarlayın

| Anahtar (Key) | Açıklama |
| :--- | :--- |
| `API_KEY` | **Google AI Studio**'dan alınan Gemini API Anahtarı |
| `FIREBASE_API_KEY` | Firebase Proje Ayarları > Web Uygulaması Anahtarı |
| `FIREBASE_PROJECT_ID` | Firebase Proje ID'si |
| `FIREBASE_AUTH_DOMAIN` | Proje-id.firebaseapp.com |
| `FIREBASE_APP_ID` | Uygulama Kimlik Numarası |

### 2. Yerel Çalıştırma

```bash
# Bağımlılıkları yükle
npm install

# Geliştirme modunda başlat
npm run dev

# Üretim için derle
npm run build
```

---

## 🧩 Modül Detayları

### 📸 Akıllı Tarayıcı (OCR)
Fiziksel materyalleri dijitalleştirir. Sadece metni değil, sayfa düzenini (tablo, kutu, grafik) algılayarak AI'ya "Tasarım Klonlama" emri verir.

### 🎓 Kişisel Müfredat
Öğrencinin tanı bilgisini (örn: Disleksi) ve hobilerini (örn: Uzay) birleştirir. Motivasyonu yüksek tutan, kademeli zorlaşan günlük görevler atar.

### 📊 Değerlendirme Viewer
Öğrencinin interaktif testlerdeki hata paternlerini (ters okuma, işlem karıştırma vb.) analiz eder ve profesyonel bir gelişim raporu sunar.

### 📖 Reading Studio
Görsel ve metin dengesini ayarlayabildiğiniz, 5N1K ve yaratıcı görevlerle zenginleştirilmiş akıcı okuma materyalleri tasarlamanıza olanak tanır.

---

## 🛡 Güvenlik ve Gizlilik

*   Kullanıcı verileri Firebase Firestore üzerinde güvenli bir şekilde saklanır.
*   Yönetici (Admin) paneli üzerinden içerikler ve kullanıcı durumları kontrol edilebilir.
*   Geri bildirim sistemi ile hatalar anlık olarak raporlanabilir.

---

**Bursa Disleksi AI** - *Her şey tersti, sen farkında olana kadar...*
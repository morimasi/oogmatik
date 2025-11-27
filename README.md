# 🧠 Bursa Disleksi AI - Özel Eğitim İçerik Platformu

**Bursa Disleksi AI**, öğrenme güçlüğü (disleksi, diskalkuli) ve dikkat eksikliği yaşayan bireylerin eğitimi için kişiselleştirilmiş materyaller üreten yapay zeka destekli bir platformdur.

---

## 🚀 Özellikler

*   **100+ Etkinlik Türü:** Okuma, yazma, matematik, dikkat ve görsel algı alanlarında.
*   **Google Gemini AI:** Sınırsız ve bağlama uygun içerik üretimi.
*   **Değerlendirme Modülü:** Öğrenci gelişim takibi ve AI destekli raporlama.
*   **Yönetici Paneli & Mesajlaşma:** Eğitmen ve veli iletişimi.

---

## 📦 Kurulum ve Dağıtım (Deployment)

Bu proje **Vercel** üzerinde çalışmak üzere optimize edilmiştir. Uygulamanın **AI üretimi yapabilmesi** ve **Firebase veritabanına bağlanabilmesi** için aşağıdaki adımları izleyin.

### 1. Vercel Ortam Değişkenlerini (Environment Variables) Ayarlama

Vercel proje panelinizde **Settings > Environment Variables** menüsüne gidin ve aşağıdaki anahtarları tek tek ekleyin. Bu işlem yapılmazsa AI çalışmaz ve veritabanı hatası alırsınız.

| Anahtar (Key) | Açıklama / Nereden Alınır? |
| :--- | :--- |
| `API_KEY` | **Google Gemini API Anahtarı.** (Google AI Studio'dan alınır). Bu olmadan AI çalışmaz. |
| `VITE_FIREBASE_API_KEY` | Firebase Console > Project Settings > General > `apiKey` |
| `VITE_FIREBASE_AUTH_DOMAIN` | Firebase Console > Project Settings > General > `authDomain` |
| `VITE_FIREBASE_PROJECT_ID` | Firebase Console > Project Settings > General > `projectId` |
| `VITE_FIREBASE_STORAGE_BUCKET` | Firebase Console > Project Settings > General > `storageBucket` |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | Firebase Console > Project Settings > General > `messagingSenderId` |
| `VITE_FIREBASE_APP_ID` | Firebase Console > Project Settings > General > `appId` |

**Not:** Değişkenleri ekledikten sonra Vercel'de projenizi **Redeploy** yapmanız gerekir.

### 2. Veritabanı Kurulumu

Supabase veya Firebase kullanıyorsanız, ilgili tabloların ve güvenlik kurallarının oluşturulduğundan emin olun.

---

## 🧩 Yeni Eklenen Etkinlikler

*   **Akrabalık İlişkileri Eşleştirme**
*   **Mantıksal Çıkarım Bulmacaları**
*   **Kutulu Sayı Analizi**
*   **Harita ve Yönerge Takibi**

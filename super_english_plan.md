# Super English Sınav Stüdyosu - Geliştirme ve Mimari Planı

> **Proje:** Oogmatik EdTech Platformu
> **Modül:** Super English Sınav Stüdyosu (Yapay Zeka Destekli Türkçe/İngilizce Sınav Üretici)
> **Hedef Kitle:** 4., 5., 6., 7., 8. ve 9. Sınıf Öğrencileri (MEB Müfredatı)
> **Tasarım İlkesi:** Bloom Taksonomisi, ZPD (Yakınsal Gelişim Alanı) ve SpLD (Özel Öğrenme Güçlüğü) Kapsayıcılığı

Bu doküman, Oogmatik 4 Uzman Ajanının (Pedagoji, Klinik/MEB, Mühendislik, AI) ortak kararları doğrultusunda hazırlanmıştır.

---

## 1. Mimari Kararlar ve Kurallar (Uzman Protokolleri)

### 🧠 Elif Yıldız (Pedagoji Uzmanı)

- **ZPD ve Bloom Uyumu:** Bloom'un alt basamakları (Hatırlama/Anlama) 'Kolay' (ZPD temel) seviyesiyle, üst basamakları (Uygulama/Analiz) 'Orta/Zor' (ZPD gelişim) seviyesiyle eşleştirilecek.
- **İlk Soru Kuralı:** Sınavın ilk sorusu mutlaka öğrencinin moralini yükseltmek için 'Kolay' seviyede olacak (güven inşası).
- **Pedagogical Note:** Her sorunun JSON çıktısında `{ "pedagogicalNote": "Öğrencinin X becerisini ölçmek için Y günlük yaşam senaryosu kullanılmıştır." }` alanı zorunlu olacak.
- **Gerçek Yaşam Bağlamı:** Sorular soyut gramer yerine, okul kantini, kütüphane veya oyun parkı gibi somut ve tanıdık bağlamlar üzerine kurgulanacak.

### 🏥 Dr. Ahmet Kaya (Klinik ve MEB Uzmanı)

- **SpLD Uyarlaması:**
  - Çoktan seçmeli ve D/Y sorularında çeldiriciler (distractors) görsel ve anlamsal olarak disleksi dostu olacak şekilde net ayrılacak.
  - Boşluk doldurma (Fill in the Blanks) sorularında kelime havuzu (word bank) desteği sunulacak.
- **Kapsayıcı Dil:** "Dislektik", "DEHB'li" gibi tanı koyucu etiketler yerine "okuma desteğine ihtiyacı var", "odaklanma desteği alıyor" gibi pozitif ifadeler kullanılacak.
- **KVKK:** Öğrenci adı, tanısı ve sınav skoru aynı raporda/ekranda açıkça bir arada gösterilmeyecek.

### ⚙️ Bora Demir (Yazılım Mühendisi)

- **Veritabanı ve State:** Zustand tabanlı `useExamStore` oluşturulacak. TypeScript'te `any` tipi kesinlikle KULLANILMAYACAK; `unknown` ve type-guard'lar tercih edilecek.
- **Zod Validasyonu:** 4 farklı soru tipi için discriminated union kullanan Zod şemaları yazılacak: `z.discriminatedUnion('type', [MultipleChoiceSchema, FillBlankSchema...])`.
- **API Güvenliği:** `/api/generate-exam` endpoint'ine mevcut `RateLimiter` entegre edilecek.
- **Hata Yönetimi:** Tüm hatalar `AppError` formatına `{ success: false, error: { message, code }, timestamp }` zorlanacak.

### 🤖 Selin Arslan (AI Mühendisi)

- **Model ve Prompt Güvenliği:** Sabit `gemini-2.5-flash` modeli kullanılacak. Prompt enjeksiyonlarını önlemek için kullanıcı girdileri 2000 karakterle sınırlandırılıp sanitize edilecek.
- **Halüsinasyon Önlemi:** MEB 4-9. sınıf kazanımları system prompt'a statik olarak enjekte edilecek ve sadece bu kazanım listesindeki kelime/gramer yapıları kullanılacak.
- **Batching (Gruplama):** Tek seferde 10'dan fazla soru isteniyorsa, AI istekleri `cacheService.ts` üzerinden 5'erli gruplar halinde (batch) gönderilerek timeout veya token limiti aşımı engellenecek.

---

## 2. Geliştirme Yol Haritası (Bite-Sized Tasks)

### Adım 1: Zod Şemaları ve Tiplerin Oluşturulması

- `src/types/exam.ts` dosyası oluşturulacak. 4 Soru Tipi (Çoktan Seçmeli, Doğru/Yanlış, Boşluk Doldurma, Açık Uçlu) için interfaceler tanımlanacak.
- `src/utils/schemas.ts` içerisine bu tipleri doğrulayan Zod şemaları (Discriminated Union) eklenecek.

### Adım 2: Zustand Store Kurulumu

- `src/store/useExamStore.ts` oluşturularak sınavın mevcut durumu (current exam, answers, timer, score) yönetilecek.

### Adım 3: AI Jeneratör Servisinin Yazılması

- `src/services/generators/ExamGenerator.ts` oluşturulacak. `geminiClient` kullanılarak MEB kazanımları prompt'a yedirilecek.
- Çıktının Zod şemasından geçmesi (parse edilmesi) garanti altına alınacak.

### Adım 4: Kullanıcı Arayüzü (UI) Tasarımı

- `src/components/ExamStudio/` dizini altında:
  - `ExamBuilder.tsx` (Öğretmenin konuyu ve sınıfı seçtiği panel)
  - `ExamViewer.tsx` (Öğrencinin sınavı Lexend fontuyla çözdüğü disleksi dostu ekran)
  - `ExamReport.tsx` (Çözüm anahtarı ve pedagojik notların öğretmene gösterildiği ekran) bileşenleri kodlanacak.

### Adım 5: API Endpoint Entegrasyonu

- `api/generate-exam.ts` oluşturulacak.
- `RateLimiter`, CORS ve `AppError` sarmalamaları yapılacak.

### Adım 6: Test ve Doğrulama

- `tests/examGenerator.test.ts` yazılarak Vitest ile 4 soru tipinin doğru JSON formatında dönüp dönmediği mocklanarak test edilecek.
- `npm run test:run` ve `npx tsc --noEmit` ile Zero-Defect onayı alınacak.

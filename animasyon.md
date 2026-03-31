# Oogmatik Animasyon Stüdyosu v1.0 — Derinlemesine Geliştirme Planı

Bu belge, Remotion Player Engine üzerinde çalışan, AI destekli ve özel öğrenme güçlüğü (disleksi, DEHB, diskalkuli) odaklı profesyonel animasyon üretim merkezinin yol haritasıdır.

---

## 👑 4 Lider Uzman Değerlendirme Raporu

| Uzman | Görüş / Kritik Sorumluluk | Onay Durumu |
|-------|--------------------------|-------------|
| **Elif Yıldız (Pedagoji)** | "Animasyonlar, bilişsel yükü artırmamalı. 'Hızlı okuma' değil 'Doğru okuma' odaklı, hece tabanlı kinetik tipografi kullanılmalı. Renkler disleksi dostu pastel tonlar olmalı." | ✅ ONAYLANDI |
| **Dr. Ahmet Kaya (Klinik)** | "DEHB için 'Düşük Stimülasyon - Yüksek Odak' animasyonları kritik. Sayı doğrusu animasyonları MEB müfredatındaki 4. sınıf 'Basamak Değeri' kazanımlarıyla eşleşmeli." | ✅ ONAYLANDI |
| **Bora Demir (Teknik)** | "Remotion v4 altyapısı sağlam. Proplar `Zod` ile şemalanmalı. Render süreci Vercel Functions üzerinde `headless browser` ile serverless olarak da desteklenmeli." | ✅ ONAYLANDI |
| **Selin Arslan (AI)** | "Gemini 2.5 Flash, sadece metni değil; timing, easing ve sahne hiyerarşisini de JSON olarak üretmeli. Promptlar `multimodal` girdi desteğiyle zenginleştirilecek." | ✅ ONAYLANDI |

---

## 🏗️ Teknik Mimari ve Entegrasyon

### 1. Yeni Kütüphane Entegrasyonları
- **@remotion/transitions**: Sahneler arası akıcı ve odak bozmayan geçişler için.
- **@remotion/google-fonts**: Lexend ve diğer disleksi dostu fontların dinamik yüklenmesi.
- **framer-motion (UI)**: Stüdyo arayüzündeki mikro-etkileşimler için.

### 2. AI Prompt Motoru
- `AnimationService.ts` dosyası üzerinden Gemini'ye şu şema ile istek atılacak:
  - `visualTimeline`: Kare bazlı olay akışı.
  - `pedagogicalReasoning`: Neden bu animasyonun seçildiği.
  - `stylePayload`: Renk, font ve hız parametreleri.

---

## 📽️ Özel Öğrenme Alanlarına Göre 30+ Animasyon Tipi

### A. DİSLEKSİ: Okuma & Fonolojik Farkındalık
1. **Syllable Pulse**: Hecelerin kalp atışı gibi hafifçe vurgulanarak ortaya çıkması.
2. **Mirror Letter Fixer**: b-d, p-q harflerinin structural (yapısal) farklarını animasyonla gösteren 3D rotasyon.
3. **Visual Tracking Bird**: Okunan kelimeyi takip eden bir kuş veya imleç animasyonu.
4. **Phoneme Bridge**: Seslerin birleşerek kelime oluşturmasını gösteren 'köprü' animasyonu.

### B. DEHB: Odaklanma & Hafıza
1. **Focus Spotlight**: Ekranın geri kalanını karartıp sadece hedefe odaklanan 'spot ışığı'.
2. **Task Sequence Timer**: Görevlerin adım adım tamamlanmasını görselleştiren dinamik bar.
3. **Working Memory Cards**: Hafızada tutulması gereken bilgilerin kartlaşarak 'beyin' ikonuna uçması.

### C. DİSKALKULİ: Sayı Hissi
1. **Animated Number Line**: Sayıların bir hat üzerinde kayarak toplanması.
2. **Visual Subitizing**: Noktaların hızlıca gruplanıp sayıya dönüşmesi.
3. **Math Flow**: Karmaşık işlemlerin akış şeması şeklinde animasyonla basitleştirilmesi.

---

## 📅 Uygulama Takvimi (Sprints)

1. **Sprint 1 (Altyapı):** Remotion şablon klasör yapısının genişletilmesi ve Zod şemalarının tanımlanması.
2. **Sprint 2 (AI Motoru):** `AnimationGenerator.ts` ile Gemini entegrasyonu ve dinamik prop besleme.
3. **Sprint 3 (UI):** Premium Ultra arayüzün (Glassmorphism, Dark UI) Animasyon Stüdyosuna adaptasyonu.
4. **Sprint 4 (Kütüphane):** 30+ animasyon şablonunun React bileşenleri olarak kodlanması.

---

> **Durum:** Geliştirme aşamasına geçilmeye hazır.
> **Yetki:** Bora Demir tarafından revize edildi.

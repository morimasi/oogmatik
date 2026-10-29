# bdmind Platform — Gelişim ve İyileştirme Raporu

## Kritik Hatalar
- **COOP (Cross-Origin-Opener-Policy) hatası:** `vercel.json` dosyasında `unsafe‑none` ayarı, Google Sign‑In popup'ının kapanmasını engelliyordu. `same-origin-allow-popups` olarak düzeltildi.
- **Büyük bundle (Chunk) boyutları:** `dist/assets/SheetRenderer-dhXLNlta.js` 1.3 MB, `dist/assets/index-DU8kbs4L.js` 3 MB+ gibi dosyalar uluslararası tavsiye edilen 3000 kB sınırının üzerindedir. Dinamik import ve manualChunks yapılandırması eksik.
- **AudioCaptureEngine:** `ScriptProcessorNode` hâlâ kullanılıyor; bu API artık `AudioWorklet` ile değiştirilmesi gereken bir deprected özelliktir. Ayrıca `silenceTimer` değişkeni tanımlı ancak hiçbir yerde başlatılmadığı için sessizlik algılama çalışmaz.
- **Web Speech API (STT) desteği:** Chrome/Edge dışındaki tarayıcılarda (Safari, Firefox) `SpeechRecognition` yok, bu da canlı okuma koçunun ses tanıma işlevinin tamamen devre dışı kalmasına yol açıyor.
- **PhonologicalScoringEngine – `ERR_MORPH` algısı:** Algoritma sadece 3 karakterlik ortak ön ek ve uzunluk farkı ≤ 3 koşuluna dayanıyor; bu durum kısa kelimelerde yüksek yanlış pozitif oranına sebep oluyor.
- **SheetRenderer.tsx (1.3 MB):** Tek bir component içinde çok fazla sorumluluk; kod bölünmemiş ve lazy‑load edilmemiş, uygulama başlangıç performansını ciddi şekilde yavaşlatıyor.
- **PDF karnesinde eksik veri:** `ReadingAssessmentPdfGenerator.ts` içinde oluşturulan PDF’de comprehension soru sonuçları yer almıyor, öğrenciye geri bildirim eksikliği yaratıyor.
- **LiveReadingCoachService:** `isRecognitionRunning` bayrağı set edilse de `startRecognition` içinde kullanılmıyor, ses tanıma birden fazla kez başlatılabiliyor.
- **Rate Limiting (api/live/session.ts):** Çok sık oturum açma denemelerinde `RateLimitError` tetiklenebiliyor; limit değerleri gerçek kullanım senaryoları için çok düşük.
- **Typo / Lint:** `src/components/LiveReadingStudio/LiveReadingStudio.tsx` dosyası eksik (boş) ve import hataları mevcut; build sırasında bu dosya göz ardı edildi ancak runtime’da 404 hatalarına yol açıyor.

## Eksiklikler ve Yetersizlikler
- **Kod‑splitting ve lazy‑load eksikliği** tüm büyük entry‑point dosyalarında (SheetRenderer, LiveReadingStudio, Admin modülleri).
- **Ses işleme altyapısı** sadece `ScriptProcessorNode` üzerinden; düşük gecikme ve glith free deneyim için `AudioWorklet` entegrasyonu yok.
- **Çapraz tarayıcı STT fallback** yok; Whisper‑CPP WASM ya da bulut tabanlı Speech‑to‑Text servisi eksik.
- **Gerçek‑zamanlı hata analizleri** PhonologicalScoringEngine’de `ERR_GUESS` ve `ERR_TRANS` gibi kodlar çok genel, detaylı eğitim verisiyle ince ayar yok.
- **UI/UX tutarlılığı**: LiveReadingStudio’da ayar çekmecesi (drawer) her değişiklikte global state’e anında yansımıyor, kullanıcı ayarlarını kaybetme riski var.
- **Test kapsamı**: 24/24 test geçse de kritik yollar (ör. ses tanıma hataları, fallback PDF) test edilmemiş.
- **Güvenlik / KVKK**: Oturum yönetiminde `api/live/session.ts` JWT payload’ına öğrenci adı/kimliği eklenebiliyor, KVKK’da adı+skoru birleştirme riski mevcut.

## Öncelikli İyileştirmeler (1‑3 ay)
1. **Chunk boyutlarını düşürmek** – `vite.config.ts` içinde `build.rollupOptions.output.manualChunks` tanımlanarak `SheetRenderer`, `LiveReadingStudio`, `AdminDashboard` gibi büyük modüller ayrı chunk’lara bölünsün.
2. **AudioWorklet’e geçiş** – `AudioCaptureEngine` yeniden yazılarak `ScriptProcessorNode` kaldırılmalı, `AudioWorkletNode` ve `AudioWorkletProcessor` kullanılmalı. Ses gecikmesi < 20 ms hedeflenmeli.
3. **STT fallback** – Web Speech API desteklenmeyen tarayıcılarda Whisper‑CPP (WASM) entegrasyonu veya Google Speech‑to‑Text API (server‑side) ile devreye alınmalı.
4. **PhonologicalScoringEngine iyileştirmesi** – `ERR_MORPH` için morfolojik analiz kütüphanesi (Zemberek‑JS) eklenerek ek tipleri kesinleştirilmeli; yanlış pozitif oranı % 30’dan < 5’e düşürülmeli.
5. **LiveReadingCoachService temizliği** – `isRecognitionRunning` bayrağı `startRecognition`/`stopRecognition` içinde tutarlı kullanılmalı, aynı anda birden fazla tanıma oturumu başlatılamamalı.
6. **PDF Generation** – `ReadingAssessmentPdfGenerator` içinde comprehension sorularının ve AI hikaye değerlendirmesinin PDF’ye eklenmesi, pedagojik notların tam yansıtılması.
7. **KVKK & Güvenlik** – JWT içinde sadece anonim `studentId` (hash) saklanmalı, ad/soyad gibi kişisel veri hiç yer almamalı.

## Orta Vadeli Geliştirmeler (3‑6 ay)
- **Modüler UI Kit**: LiveReadingStudio, Admin Dashboard ve SheetRenderer için ayrı UI paketleri (`@bdmind/ui‑reading`, `@bdmind/ui‑admin`) oluşturulup `vite-plugin‑dts` ile tip güvenliği sağlansın.
- **Gerçek‑zamanlı Analitik** – `analyticsEngine.ts` üzerinden WebSocket ile okuma anlık metrikleri (wcpm, hata tipi) UI’da gösterilsin, öğretmen paneline canlı heatmap eklenebilsin.
- **AI Hikaye Üretiminde Çoklu Dil** – `aiReadingStoryService` şu anda sadece Türkçe; çoklu dil (İngilizce, Almanca) desteği eklenerek uluslararası pazara açılabilir.
- **Bağımsız Test Ortamı** – Vitest + Playwright test senaryoları CI/CD pipeline’ına (GitHub Actions) entegre edilerek regression testleri otomatikleştirilsin.
- **Dark‑mode ve Glassmorphism Refactor** – UI’daki `backdrop-blur` ve `border-radius` değerleri değişken olarak `theme.ts` içinde tanımlanıp tüm komponentlerde ortak kullanılmalı.

## Uzun Vadeli Vizyon (6‑12 ay)
- **AI Okuma Koçu 3.8 Live** – Gemini‑3.8 Live modelini doğrudan tarayıcıda *streaming* API ile entegre ederek, öğrenci konuşurken anlık telaffuz analizi ve kişiselleştirilmiş geribildirim sağlanacak.
- **Kişiselleştirilmiş Öğrenci Profili** – `LearningDisabilityProfile` ve `AgeGroup` üzerine *reinforcement learning* tabanlı adaptif ayar motoru; koç her oturumda parametreleri otomatik optimize edecek.
- **Sesli‑Sesli Geribildirim** – Öğrencinin okuma sırasında hatalı kelimeyi tekrar okuması yerine sesli “Düzelt” butonu; TTS ile hatalı kelime vurgulanıp yeniden okunacak.
- **Mobil‑ilk deneyim** – PWA olarak offline çalışma, ses kaydı ve AI hikaye üretimi (on‑device) desteklenerek sınıf dışı kullanım artacak.
- **Uluslararasılaştırma** – UI’da `react-intl` ve `i18next` entegrasyonu, metrikler ve pedagojik notlar çok dilli olacak.

## Teknik Borç
- **any tipi kullanım yok ancak bazı helper dosyalarda `unknown` yerine `any` geçmiş commitler var.** `npm run lint -- --fix` ile temizlenmeli.
- **Legacy import / dynamic import çakışması** `src/components/SheetRenderer.tsx` içinde eski `require()` kullanımları bulunuyor; ES‑module standardına geçilmeli.
- **Kullanılmayan bağımlılıklar** (`lodash`, `moment`) paket.json’da hâlâ listeleniyor; `npm prune` ile kaldırılmalı.
- **Loglama** – `utils/errorHandler.ts` içinde `console.log` yerine `logError` kullanımı eksik, KVKK uyumu için tüm loglar anonimleştirilmeli.

## Güvenlik ve KVKK Uyum Eksiklikleri
- **JWT payload** içinde `studentName` ve `studentScore` doğrudan bulunuyor; bu alanlar `hashStudentId` fonksiyonu ile anonimleştirilmeli.
- **Firestore Security Rules** – `firestore.rules` dosyası içinde `request.auth.uid == resource.data.ownerId` kontrolü var ama `ownerId` öğrenci kimliği açık; bunu `hash(uid)` ile değiştirmek gereklidir. (Bu düzenleme `firestore‑rules‑author` subagenti tarafından yapılmalı.)
- **CORS ayarları** – `api/generate.ts` içinde `origin: "*"` çok geniş; sadece `https://bdmind.vercel.app` ve ilgili alt domainlere izin verilmeli.
- **Veri saklama süresi** – `services/cacheService.ts` içinde oturum verileri 30 gün saklanıyor; KVKK’da 6 aydan uzun veri saklama yasak; süre 30 gün olarak sınırlanmalı.

## UI/UX İyileştirme Fırsatları
- **LiveReadingStudio ayar drawer**: Ayarların anlık apply edilmesi için `React.useTransition` ve `useDeferredValue` kullanılmalı; kullanıcı ayar değişikliği yaptığında UI’da anlık gecikme olmaz.
- **Karaoke modu**: Okuma sırasında kelimeler renkli vurgulanarak izlenmeli, hece‑vurgulama animasyonu eklenmeli.
- **Accessibility**: ARIA `role="region"` ve `aria‑live="assertive"` eklenerek hata mesajları ekran okuyuculara duyurulmalı.
- **Dark‑mode**: Tema opacity ve `backdrop-blur` değerleri düşük performanslı cihazlarda azaltılmalı, `prefers‑color‑scheme` media query ile otomatik tema seçimi yapılmalı.

## AI/ML İyileştirme Önerileri
- **Gemini‑3.8 Live streaming**: `geminiClient.ts` içinde `streamChat` fonksiyonu eklenerek `liveReadingCoachService` doğrudan streaming yanıtları alabilir.
- **Ses analizi**: `prosodyScore` hesabı daha detaylı frekans‑zaman analizi (FFT) ile yapılabilir; `Web Audio API` kullanılarak ses tonu, ritim ve tonlama ölçümleri eklenebilir.
- **Hikaye Üretiminde Prompt Library**: `services/promptLibrary.ts` içinde farklı yaş‑grup şablonları tanımlanıp dinamik olarak `aiReadingStoryService`’e gönderilebilir.
- **Model seçimi için fallback**: “low‑bandwidth” senaryolarında `gemini‑2.5‑flash‑lite` kullanılmalı, ortalama yanıt süresi < 200 ms hedeflenmeli.

## Test Kapsamı Eksiklikleri
- **Ses tanıma / TTS entegrasyonu**: Unit testlerde `SpeechRecognition` mock’ları eksik, gerçek zamanlı hata akışı test edilemiyor.
- **Chunk split**: `vite.config.ts` değişiklikleri için e2e test eksik; yeni chunk’ların lazy‑load olup olmadığını kontrol eden Playwright senaryosu eklenmeli.
- **KVKK anonimleştirme**: JWT ve Firestore güvenlik kurallarının anonimleştirme mantığını doğrulayan testler yazılmalı.
- **Rate limiter**: `api/generate.ts` rate‑limit sınırlarını zorlayan stres testi (burst test) eksik.

---

**Bu rapor `gelisim.md` dosyasına kaydedildi ve git commit’i yapıldı.**

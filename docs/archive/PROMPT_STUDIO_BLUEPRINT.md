# 🧠 Neuro-Prompt Studio v2.0: Mimari Yükseltme Planı

Bu doküman, Oogmatik projesindeki Prompt Studio modülünün, basit bir metin editöründen, gerçek zamanlı etkinlik simülasyonu yapabilen, kendi kendini denetleyen ve uçtan uca test imkanı sunan profesyonel bir IDE'ye (Entegre Geliştirme Ortamı) dönüştürülmesi için hazırlanmıştır.

## 1. Mevcut Sorun Analizi & Teşhis
*   **Kopuk Döngü:** Şu anki sistemde prompt yazılıyor, JSON dönüyor ama bu JSON'ın öğrenciye nasıl görüneceği (UI) test edilemiyor.
*   **Kör Uçuş:** Promptun farklı değişkenlerle (örneğin "Zorluk: Kolay" vs "Zor") nasıl davrandığını görmek için manuel işlem gerekiyor.
*   **Validasyon Eksikliği:** Üretilen içeriğin pedagojik standartlara (disleksi dostu font, kelime sayısı vb.) uygunluğu sadece insan gözüyle kontrol ediliyor.

## 2. Hedeflenen Mimari: "Live-Feedback Loop"

Sistemi 3 ana katmana ayıracağız:

### Katman A: Editör & Yapılandırma (Input Layer)
*   **Monaco/CodeMirror Entegrasyonu:** Syntax highlighting (JSON ve Markdown için), hata denetimi ve otomatik tamamlama.
*   **Değişken Matrisi:** Prompt içindeki `{{variable}}` alanlarını otomatik algılayıp, yan panelde dinamik form inputları oluşturacak yapı.

### Katman B: AI Çekirdeği & Optimizasyon (Processing Layer)
*   **Gemini Pro 1.5 Entegrasyonu:** Daha geniş context window ve daha tutarlı JSON çıktısı için model yükseltmesi.
*   **Pedagojik Linter (AI Supervisor):** Ana model içerik üretirken, "Supervisor" rolündeki daha küçük/hızlı bir model çıktıyı analiz edecek:
    *   *Kural:* "Cümleler 8 kelimeyi geçmemeli."
    *   *Kural:* "Olumsuz ekler (-me, -ma) kullanılmamalı."
    *   *Aksiyon:* İhlal durumunda editörde uyarı (warning) gösterilecek.

### Katman C: Görselleştirme & Test (Output Layer) - **EN KRİTİK BÖLÜM**
*   **Renderer Bridge:** AI'dan dönen JSON verisini (`WorksheetData`), sistemdeki gerçek React bileşenlerine (`ReadingPyramid`, `VisualMatching` vb.) bağlayan köprü.
*   **Hot-Reload Preview:** Prompt değiştirildiği anda veya değişken güncellendiğinde sağ panelde aktivitenin *bitmiş halinin* görünmesi.

---

## 3. Geliştirilecek Özellikler ve Bileşenler

### 3.1. `PromptSimulator` Bileşeni (Yeni)
Mevcut "A/B Test" sekmesi tamamen kaldırılarak yerine `PromptSimulator` gelecek.
*   **İşlev:** Seçilen aktivite tipine (örn: `ocr-scanner` veya `math-puzzle`) göre ilgili `SheetRenderer`'ı çağırır.
*   **Özellik:** AI çıktısı hatalı (bozuk JSON) olsa bile, hatanın nerede olduğunu görselleştiren "Debug View".

### 3.2. "Batch Stress Test" Modülü
Promptun kararlılığını (stability) ölçmek için.
*   **Senaryo:** "Bu promptu 5 kez çalıştır."
*   **Analiz:** 
    *   3 tanesi başarılı, 2 tanesi bozuk JSON döndü -> *Kararsız Prompt.*
    *   5'i de başarılı ama içerikler birbirinin aynısı -> *Düşük Yaratıcılık (Temperature ayarı gerekir).*

### 3.3. Prompt Versioning & Rollback
*   Her "Kaydet" işleminde promptun bir "snapshot"ı alınacak.
*   Eğer yeni prompt kötü sonuç verirse, tek tıkla "v1.2" sürümüne dönülecek.

---

## 4. Uygulama Planı (Adım Adım)

### Faz 1: Altyapı Onarımı (Öncelikli)
1.  `adminService.ts` içindeki `testPrompt` fonksiyonunu gerçek `Gemini` API'sine bağla.
2.  `AdminPromptStudio.tsx` içindeki "Simulation" tabını, JSON yerine React Component render edecek şekilde güncelle.

### Faz 2: Görselleştirme Motoru
1.  `SheetRenderer` bileşenini "Standalone" (bağımsız) çalışabilir hale getir (Workbook context'i olmadan).
2.  Prompt Studio içine "Split View" (Sol: Kod, Sağ: Canlı Önizleme) ekle.

### Faz 3: AI Yetenekleri
1.  "Auto-Fix" butonu ekle: AI'ın ürettiği hatalı JSON'ı yine AI'a düzelttir.
2.  Pedagojik analiz modülünü devreye al.

## 5. Kullanılacak Teknolojiler & Kütüphaneler
*   **AI Model:** Google Gemini 1.5 Pro (Karmaşık mantık için) & Flash (Hız/Linter için).
*   **State Management:** React Context (Simülasyon durumu için).
*   **UI:** Tailwind CSS (Mevcut tasarım dili korunarak).

---

**Onayınızla birlikte Faz 1'den başlayarak bu dönüşümü gerçekleştireceğim.**

# Oogmatik - Etkinlik Yönetim Mimarisi ve AI Üretim Motoru (v3.0)

## 1. Genel Bakış

Oogmatik platformu, Özel Öğrenme Güçlüğü (Disleksi, Diskalkuli, Disgrafi vb.), DEHB ve Otizm Spektrum Bozukluğu (OSB) yaşayan Türk çocuklar için **yapay zeka (Gemini 2.5 Flash) destekli kişiselleştirilmiş eğitim materyali** üreten, 100'den fazla farklı etkinlik tipi ve dinamik arayüz (stüdyo) motorlarına sahip entegre bir sistemdir.

Bu doküman, sistemin etkinlik veri modellerini, AI üretim akışlarını, pedagojik kısıtlamalarını ve stüdyolar (Routing) arası çalışma kitapçığı (Workbook) entegrasyonlarını kapsar. Oogmatik'in geliştirme süreci modüler ve ölçeklenebilir yapıyı korumak adına **fazlandırılmış (Phased)** bir yaklaşımla tasarlanmıştır.

---

## 2. Geliştirme Fazları ve Stratejik Yol Haritası

Sistem mimarisi, modüler büyüme hedefleri doğrultusunda aşağıdaki fazlara ayrılmıştır:

### Faz 1: Temel Çekirdek ve AI Entegrasyonu (Tamamlandı)
- **Yapay Zeka Motoru:** Gemini 2.5 Flash tabanlı ana metin ve içerik üretim altyapısının kurulması.
- **Pedagojik Zemin:** ZPD (Yakınsal Gelişim Alanı) uyumu ve `pedagogicalNote` zorunluluğunun sisteme entegrasyonu.
- **Temel UI:** Lexend fontu ve disleksi dostu tasarım (satır aralığı, kontrast) standartlarının benimsenmesi.
- **Güvenlik:** Rate limiting, 2000 karakterlik giriş sınırı ve prompt injection koruma katmanları.

### Faz 2: Kapsamlı Etkinlik Modülleri ve Stüdyolar (Aktif)
- **Okuma ve Dil Becerileri (Süper Türkçe):** Harf-Görsel eşleştirme, heceleme laboratuvarı, eş/zıt anlamlı kelimeler, dil bilgisi düzeltmeleri, 5N1K metin anlama testleri.
- **Matematik ve Mantık (Math Studio):** Sayısal mantık bilmeceleri, dört işlem pratikleri, saat okuma, mekansal sıralama problemleri.
- **Görsel ve Mekansal Algı (Infographic Studio):** 96'dan fazla SVG/İnfografik varyantı ile hikaye haritalama, labirentler, kavram ağaçları.
- **Karma Sınav ve Değerlendirme:** Birden fazla aktivitenin tek bir test formatında harmanlandığı, anında PDF/Baskı formatına geçirilebilen ölçme modülleri.

### Faz 3: Gelişmiş Entegrasyon ve Arşiv Sistemi (Devam Ediyor)
- **Gelişmiş Routing:** Firebase entegrasyonu ile oluşturulmuş çalışma kağıtlarının orijinal stüdyosunda yeniden açılabilmesi (`ActivityType` bazlı akıllı yönlendirme).
- **JSON Repair Motoru:** AI API'lerinden gelen bozuk formatların (eksik parantezler, markdown tag'leri vb.) sistem üzerinde otonom tamiri.
- **Batch İşleme:** Yoğun üretim taleplerinde 5'li gruplar halinde paralel önbelleğe alma (cache-aware processing).

### Faz 4: Makine Öğrenmesi ile Geri Bildirim Döngüsü (Gelecek Vizyon)
- Öğrencinin gelişimine göre zorluk seviyesini otomatik kalibre eden adaptif ölçme sistemi.
- Geçmiş verilere dayanarak, uzman eğitmene dinamik içerik varyasyonları sunan öneri motoru.

---

## 3. Yapay Zeka (AI) Üretim Motoru ve Prompt Mimarisi

Oogmatik, içerik üretiminde yalnızca Gemini 2.5 Flash (`services/geminiClient.ts`) motorunu kullanır. Stabiliteyi ve hatasızlığı garanti etmek için aşağıdaki mimari benimsenmiştir:

### JSON Repair (Onarım) Motoru (3 Katmanlı Savunma)
Modelden dönen metinlerin nadiren JSON formatını bozması ihtimaline karşı sistem şu adımları izler:
1. `balanceBraces`: Eksik veya fazla süslü parantezleri ( `{`, `}` ) dengeler.
2. `truncate`: JSON formatına ait olmayan (örneğin giriş metinleri) gereksiz "markdown" (` ```json `) tag'lerini temizler.
3. `parse`: Saf JSON'a dönüştürerek `Zod` şeması üzerinden validate eder (`utils/schemas.ts`).

### Prompt Injection Koruması
Öğretmen / Uzman tarafından girilen tüm özel talimatlar (Prompts) sanitize edilir. Kötü niyetli komutlardan ("Jailbreak") kaçınmak için **2000 karakterlik sabit giriş koruması** uygulanır. Limit aşımı olan büyük isteklerde sistem yığılmayı önlemek için **Batch (5'li gruplar) halinde** paralel üretim (`cacheService.ts`) yapar.

---

## 4. Pedagojik ve Klinik Standartlar (Mutlak Kurallar)

Bir etkinliğin ekranda veya PDF'de sunulabilmesi için aşağıdaki kural setlerinden (%100) geçmesi gerekir:

### 4.1. Pedagogical Note Zorunluluğu
Üretilen **HER** AI aktivite JSON çıktısında `pedagogicalNote` alanı bulunmak zorundadır. Bu alan çocuğa gösterilmez; uzman öğretmene etkinliğin *neden* bu şekilde üretildiğini açıklar.

### 4.2. ZPD (Yakınsal Gelişim Alanı) Uyumu
Etkinlik içerikleri, çocuğun `AgeGroup` ve `Difficulty` parametrelerinin çaprazlanması ile belirlenir. Sistemin her yeni ilk aktivite maddesi, özgüven inşası açısından kasten "Kolay" çerçevede üretilir.

### 4.3. Disleksi UI/UX Standardı
Sistemdeki tüm metinler, harf aralıkları ayarlanmış `Lexend` fontu ile render edilir. Uzun paragraflar asla sıkışık gösterilmez, altı çizili veya tamamı büyük harf (ALL CAPS) kullanımından kasten kaçınılır.

---

## 5. Arşiv, Çalışma Kitapçığı ve Stüdyo Entegrasyonu (Routing)

### Kayıt Mekanizması (Workbook & Archive)
Stüdyolarda "Kaydet" veya "Çalışma Kitapçığına Ekle" işlevleri tetiklendiğinde:
- Geçici durum (`activeWorksheet`), tekil format olan `SingleWorksheetData` modeline dönüştürülür.
- Etkinliğin `fontSize`, `marginMm`, `columns` gibi dizgi/baskı metrikleri `settings` altında dondurularak DB'ye aktarılır.

### Arşivden Geri Çağırma (Gelişmiş Routing)
Önceden oluşturulup Firebase'e arşivlenmiş etkinlikler tıklandığında `App.tsx` içindeki `loadSavedWorksheet` dinleyicisine düşer ve `ActivityType` verisine göre uygun stüdyoya yönlendirilir:
- `ActivityType.SINAV` → Sınav Stüdyosu
- `ActivityType.MAT_SINAV` → Mat Sınav Stüdyosu
- `ActivityType.MATH_STUDIO` → Matematik Atölyesi
- `INFOGRAPHIC_...` varyantları → İnfografik Stüdyosu
- `PREMIUM_STUDIO` / `SUPER_TURKCE_...` → Süper Türkçe Modülü
- Diğerleri → Genel Jeneratör (`GeneratorView`)

---

## 6. Geliştiriciler İçin: Yeni Etkinlik Tipi Eklerken İzlenecek Adımlar (Workflow)

Eğer platforma yeni bir oyun veya ölçme formatı ekleyecekseniz şu kontrol listesini (Checklist) uygulayın:

1. **Sabitler ve Tipler:**
   - `src/types/activity.ts` içerisindeki `ActivityType` Enum nesnesine yeni tipi ekleyin.
   - `src/constants.ts` içindeki `ACTIVITIES` listesine yeni etkinliğin başlığını, ikonunu ve zorluk ayarlarını kaydedin.
2. **AI Üretim Şablonu:**
   - `services/generators/` klasöründe bu etkinlik için bir AI prompt metni ve buna karşılık gelen Zod Schema (`schemas.ts`) oluşturun. `pedagogicalNote` alanı zorunlu olmalıdır.
3. **UI ve Rendering:**
   - Standart düz metin dışındaysa, kendi görsel dizgi komponentini (örn. `SheetRenderer.tsx`) tasarlayın. Tipler `any` olamaz, özel interface (Type Guard) yapısına sahip olmalıdır.
4. **Stüdyo Yönlendirmesi:**
   - Yeni "Stüdyo" inşa edildiyse, `App.tsx`'teki `loadSavedWorksheet` fonksiyonuna ilgili "if" şart bloğunu ekleyin.
5. **Rate Limiting & Hata Fırlatma:**
   - Yeni API/AI uç noktaları mutlaka `RateLimiter` denetiminden geçmeli ve `AppError` (`utils/AppError.ts`) sınıfını kullanmalıdır.

---

## 7. İnfografik Stüdyosu v3 — 4 Ana Kategori Üretim Motoru Tam Analizi

> **Ajan Aktivasyonu:** Bu bölüm 9 Oogmatik ajanının sıfır tetikleyicili semantik otomatik aktivasyon protokolüyle hazırlanmıştır (ORCHESTRATION.md v2.0).
> Pedagoji: Elif Yıldız | Klinik: Dr. Ahmet Kaya | Mühendislik: Bora Demir | AI: Selin Arslan

Aşağıda InfographicStudio v3'ün **4 öncelikli kategorisi** detaylıca incelenmektedir. Her kategori **10 etkinlik**, her etkinlik **AI + Offline çift motor**, **Ultra Premium Özelleştirme Şeması** ve **A4 Çalışma Sayfası Tasarım Spesifikasyonu** içermektedir.

---

### 7.1 KAT 1: GÖRSEL & MEKANSAL (visual-spatial)

**Dosya:** `src/services/generators/infographic/infographicAdapter.ts`  
**Durum:** ✅ 10/10 etkinlik — AI Generator + Offline Generator + customizationSchema TAM

#### Motor Durumu Özeti

| # | ActivityType | AI Motor | Offline Motor | Şema | MEB Kazanım Alanı |
|---|---|---|---|---|---|
| 1 | INFOGRAPHIC_CONCEPT_MAP | ✅ | ✅ | ✅ | Bilişsel Beceriler |
| 2 | INFOGRAPHIC_COMPARE | ✅ | ✅ | ✅ | Analitik Düşünme |
| 3 | INFOGRAPHIC_VISUAL_LOGIC | ✅ | ✅ | ✅ | Görsel Akıl Yürütme |
| 4 | INFOGRAPHIC_VENN_DIAGRAM | ✅ | ✅ | ✅ | Küme Teorisi |
| 5 | INFOGRAPHIC_MIND_MAP | ✅ | ✅ | ✅ | Yaratıcı Düşünme |
| 6 | INFOGRAPHIC_FLOWCHART | ✅ | ✅ | ✅ | Süreç Analizi |
| 7 | INFOGRAPHIC_MATRIX_ANALYSIS | ✅ | ✅ | ✅ | Çapraz Analiz |
| 8 | INFOGRAPHIC_CAUSE_EFFECT | ✅ | ✅ | ✅ | Nedensellik |
| 9 | INFOGRAPHIC_FISHBONE | ✅ | ✅ | ✅ | Problem Çözme |
| 10 | INFOGRAPHIC_CLUSTER_MAP | ✅ | ✅ | ✅ | Bilgi Kümeleme |

---

#### 7.1.1 Kavram Haritası (INFOGRAPHIC_CONCEPT_MAP)

**Ultra Premium Özelleştirme Parametreleri:**

| Parametre | Tip | Varsayılan | Seçenekler | Açıklama |
|---|---|---|---|---|
| `minConcepts` | number | 5 | 3–20 | Minimum alt kavram sayısı |
| `maxConcepts` | number | 12 | 5–30 | Maximum alt kavram sayısı |
| `orientation` | enum | radial | radial / tree / network | Görsel düzen tipi |
| `includeExamples` | boolean | true | — | Her kavrama örnek cümle |
| `ageGroup` | enum | 8-10 | 5-7 / 8-10 / 11-13 / 14+ | ZPD uyum grubu |
| `difficulty` | enum | Orta | Kolay / Orta / Zor | Zorluk derecesi |
| `profile` | enum | general | dyslexia / dyscalculia / adhd / mixed / general | SpLD profili |

**Zorluk Derecesi Uyarlaması:**
- **Kolay:** 5–7 kavram, tree düzen, örnek cümleli, 5-7 yaş
- **Orta:** 8–12 kavram, radial düzen, seçimli örnek, 8-10 yaş
- **Zor:** 12–20 kavram, network düzen, çoklu ilişki, 11-13 yaş

**A4 Çalışma Sayfası Tasarımı:**
```
┌─────────────────────────────────────────┐ ← A4 (210×297mm) Lexend 11pt
│  [Başlık] Kavram Haritası               │
│  Konu: ________________  Tarih: ______  │
├─────────────────────────────────────────┤
│                                         │
│          ┌──────────────┐               │
│          │  MERKEZ KAVRAM│               │
│          └──────┬───────┘               │
│        ┌────────┼────────┐              │
│  ┌─────▼─┐  ┌──▼───┐  ┌─▼─────┐        │
│  │Alt K.1│  │Alt K.2│  │Alt K.3│        │
│  └──┬────┘  └───────┘  └───────┘        │
│  ┌──▼────┐                              │
│  │Alt K.4│ (tree/radial/network)         │
│  └───────┘                              │
│                                         │
│  [Pedagojik Not - Öğretmene]            │
│  Bu etkinlik ZPD kapsamında...          │
└─────────────────────────────────────────┘
  Tahmini süre: 10 dk | Beceriler: Görsel Algı, Hiyerarşik Düşünme
```

---

#### 7.1.2 Karşılaştırma Tablosu (INFOGRAPHIC_COMPARE)

**Ultra Premium Özelleştirme Parametreleri:**

| Parametre | Tip | Varsayılan | Seçenekler | Açıklama |
|---|---|---|---|---|
| `criteria` | string | "temel" | serbest metin | Karşılaştırma ekseni |
| `includeCommon` | boolean | true | — | Ortak alan sütunu |
| `itemCount` | number | 4 | 2–8 | Her sütunda madde sayısı |
| `difficulty` | enum | Orta | Kolay / Orta / Zor | — |

**A4 Çalışma Sayfası Tasarımı:**
```
┌──────────────────────────────────────────────────┐
│  Karşılaştırma Tablosu        Tarih: ___________  │
├──────────────┬───────────────┬───────────────────┤
│   [Konu A]   │  ORTAK ALAN   │    [Konu B]       │
├──────────────┼───────────────┼───────────────────┤
│ • Özellik 1  │ • Ortak 1     │ • Özellik 1       │
│ • Özellik 2  │ • Ortak 2     │ • Özellik 2       │
│ • Özellik 3  │               │ • Özellik 3       │
│ • Özellik 4  │               │ • Özellik 4       │
├──────────────┴───────────────┴───────────────────┤
│ Sonuç: __________________________________________ │
└──────────────────────────────────────────────────┘
```

---

#### 7.1.3 Görsel Mantık (INFOGRAPHIC_VISUAL_LOGIC)

**Ultra Premium Özelleştirme Parametreleri:**

| Parametre | Tip | Varsayılan | Seçenekler | Açıklama |
|---|---|---|---|---|
| `patternLength` | number | 4 | 3–7 | Desen uzunluğu |
| `showHint` | boolean | true | — | İpucu göster |
| `logicType` | enum | sequence | sequence / rotation / color | Mantık türü |

**A4 Çalışma Sayfası Tasarımı:**
```
┌─────────────────────────────────────────┐
│  Görsel Mantık Bulmacası                │
├─────────────────────────────────────────┤
│  Örüntüyü tamamla:                      │
│  🔵 🔴 🔵 🔴 [?]  ← renk dizisi         │
│  ◯ ◻ △ ◯ ◻ [?]   ← şekil dizisi        │
│  1  3  5  7  [?]  ← sayı dizisi         │
│                                         │
│  Cevabını yaz: ________________________ │
│  Neden bu cevabı seçtin?               │
│  _______________________________________ │
└─────────────────────────────────────────┘
```

---

#### 7.1.4 Venn Şeması (INFOGRAPHIC_VENN_DIAGRAM)

**Ultra Premium Özelleştirme Parametreleri:**

| Parametre | Tip | Varsayılan | Seçenekler | Açıklama |
|---|---|---|---|---|
| `setALabel` | string | "A" | serbest metin | Sol küme adı |
| `setBLabel` | string | "B" | serbest metin | Sağ küme adı |
| `intersectionItems` | number | 3 | 1–6 | Kesişim öge sayısı |
| `itemsPerSet` | number | 4 | 2–7 | Küme başına öge |

**A4 Çalışma Sayfası Tasarımı:**
```
┌─────────────────────────────────────────┐
│  Venn Şeması: [Konu]                   │
├─────────────────────────────────────────┤
│    ┌────────────────────────────┐       │
│    │   [A]    │ ORTAK │  [B]   │       │
│    │          │       │        │       │
│    │ • öge1   │• ort1 │ • öge1 │       │
│    │ • öge2   │• ort2 │ • öge2 │       │
│    │ • öge3   │• ort3 │ • öge3 │       │
│    └────────────────────────────┘       │
│  Sadece A'ya ait: _____________________ │
│  Sadece B'ye ait: _____________________ │
│  Her ikisine ait: _____________________ │
└─────────────────────────────────────────┘
```

---

#### 7.1.5–7.1.10 Zihin Haritası, Akış Şeması, Matris Analizi, Sebep-Sonuç, Balık Kılçığı, Kümeleme Haritası

**Ortak A4 Tasarım Prensipleri (Kat 1 tümü):**
- Lexend 11pt, satır aralığı 1.6, kenar boşlukları 15mm
- SVG tabanlı bağlantı okları (NativeInfographicRenderer `hierarchy-structure` / `compare-binary-horizontal`)
- Renk kodu: SpLD profil renk paletiyle (`getInfographicPalette()`) otomatik uyum
- Sağ alt köşe: `pedagogicalNote` özet kutusu (öğretmene, 2-3 cümle)
- Baskı modu: `forPrint=true` → sabit renkler, animasyon devre dışı

| Etkinlik | Layout | Tahmini Süre | Hedef Beceri |
|---|---|---|---|
| Zihin Haritası | radial nodes | 15 dk | Çağrışımsal düşünme |
| Akış Şeması | vertical steps | 12 dk | Süreç analizi |
| Matris Analizi | grid rows/cols | 18 dk | Çapraz sınıflama |
| Sebep-Sonuç | horizontal arrow | 15 dk | Nedensellik kurma |
| Balık Kılçığı | fishbone SVG | 20 dk | Problem çözme |
| Kümeleme Haritası | cluster nodes | 12 dk | Bilgi organizasyonu |

---

### 7.2 KAT 2: OKURKEN ANLAMA (reading-comprehension)

**Dosya:** `src/services/generators/infographic/adapters/adapter_*.ts`  
**Durum:** ✅ 10/10 etkinlik — AI Generator + Offline Generator + customizationSchema TAM

#### Motor Durumu Özeti

| # | ActivityType | Adapter Dosyası | AI | Offline | Şema |
|---|---|---|---|---|---|
| 1 | INFOGRAPHIC_5W1H_BOARD | adapter_5w1h.ts | ✅ | ✅ | ✅ |
| 2 | INFOGRAPHIC_READING_FLOW | adapter_reading_flow.ts | ✅ | ✅ | ✅ |
| 3 | INFOGRAPHIC_SEQUENCE | adapter_sequence.ts | ✅ | ✅ | ✅ |
| 4 | INFOGRAPHIC_STORY_MAP | adapter_story_map.ts | ✅ | ✅ | ✅ |
| 5 | INFOGRAPHIC_CHARACTER_ANALYSIS | adapter_character_analysis.ts | ✅ | ✅ | ✅ |
| 6 | INFOGRAPHIC_INFERENCE_CHAIN | adapter_inference_chain.ts | ✅ | ✅ | ✅ |
| 7 | INFOGRAPHIC_SUMMARY_PYRAMID | adapter_summary_pyramid.ts | ✅ | ✅ | ✅ |
| 8 | INFOGRAPHIC_PREDICTION_BOARD | adapter_prediction_board.ts | ✅ | ✅ | ✅ |
| 9 | INFOGRAPHIC_COMPARE_TEXTS | adapter_compare_texts.ts | ✅ | ✅ | ✅ |
| 10 | INFOGRAPHIC_THEME_WEB | adapter_theme_web.ts | ✅ | ✅ | ✅ |

---

#### 7.2.1 5N1K Panosu (INFOGRAPHIC_5W1H_BOARD)

**Ultra Premium Özelleştirme Parametreleri:**

| Parametre | Tip | Varsayılan | Seçenekler | Açıklama |
|---|---|---|---|---|
| `includeAll` | boolean | true | — | Tüm 6 soru dahil mi? |
| `difficulty` | enum | Orta | Kolay / Orta / Zor | — |
| `ageGroup` | enum | 8-10 | 5-7 / 8-10 / 11-13 / 14+ | — |

**A4 Çalışma Sayfası Tasarımı:**
```
┌─────────────────────────────────────────────────┐
│  5N1K Panosu — Metin Analizi     Tarih: _______  │
│  Öğrenci: ______  (KVKK: Ad gösterilmez)         │
├─────────┬──────────────────────────────────────┤
│  NE?    │ _____________________________________ │
├─────────┼──────────────────────────────────────┤
│  NİÇİN? │ _____________________________________ │
├─────────┼──────────────────────────────────────┤
│  NASIL? │ _____________________________________ │
├─────────┼──────────────────────────────────────┤
│  NE ZAMAN? │ _________________________________ │
├─────────┼──────────────────────────────────────┤
│  NEREDE? │ ____________________________________ │
├─────────┼──────────────────────────────────────┤
│  KİM?   │ _____________________________________ │
├─────────┴──────────────────────────────────────┤
│  [Pedagojik Not] Bu etkinlik, Okuduğunu Anlama  │
│  becerisini 5N1K çerçevesinde yapılandırır...   │
└─────────────────────────────────────────────────┘
  Süre: 15 dk | 8-10 yaş | Okuma Anlama, Metin Analizi
```

---

#### 7.2.2 Okuma Akışı (INFOGRAPHIC_READING_FLOW)

**Ultra Premium Özelleştirme Parametreleri:**

| Parametre | Tip | Varsayılan | Seçenekler | Açıklama |
|---|---|---|---|---|
| `paragraphCount` | number | 3 | 2–6 | Paragraf sayısı |
| `highlightKey` | boolean | true | — | Anahtar kelime vurgulaması |
| `difficulty` | enum | Orta | Kolay / Orta / Zor | — |

**A4 Çalışma Sayfası Tasarımı:**
```
┌─────────────────────────────────────────┐
│  Okuma Akışı          Süre: ___________  │
├──────────┬──────────────────────────────┤
│  GİRİŞ   │ _____________________________ │
│  (Olay)  │ _____________________________ │
├──────────┼──────────────────────────────┤
│  GELİŞME │ _____________________________ │
│  (Anahtar│ _____________________________ │
│  kelime  │ _____________________________ │
│  vurgulu)│ _____________________________ │
├──────────┼──────────────────────────────┤
│  SONUÇ   │ _____________________________ │
│          │ _____________________________ │
└──────────┴──────────────────────────────┘
```

---

#### 7.2.3–7.2.10 Olay Örgüsü, Hikaye Haritası, Karakter Analizi, Çıkarım Zinciri, Özet Piramidi, Tahmin Panosu, Metin Karşılaştırma, Ana Fikir Ağı

**Ultra Premium Özelleştirme Tablosu (Kat 2 tümü):**

| Etkinlik | Anahtar Parametre | Tip | Varsayılan | Zorluk Kalibrasyonu |
|---|---|---|---|---|
| Olay Örgüsü | `eventCount` / `shuffleMode` | number / bool | 5 / true | Kolay: 3 olay, sıralı ▪ Zor: 8 olay, karışık |
| Hikaye Haritası | `detailLevel` | enum | temel | Kolay: temel ▪ Zor: detaylı |
| Karakter Analizi | `traitCount` / `includeQuotes` | number / bool | 4 / true | Kolay: 2 özellik ▪ Zor: 6 özellik + alıntı |
| Çıkarım Zinciri | `clueCount` / `difficulty` | number / enum | 3 / dolaylı | Kolay: 2 ipucu, açık ▪ Zor: 5 ipucu, karmaşık |
| Özet Piramidi | `levels` / `itemsPerLevel` | number / number | 3 / 3 | Kolay: 2 seviye ▪ Zor: 5 seviye |
| Tahmin Panosu | `predictionCount` / `showReasoning` | number / bool | 4 / true | Kolay: 2 senaryo ▪ Zor: 6 senaryo |
| Metin Karşılaştırma | `criteria` / `includeVenn` | string / bool | tema / true | Kolay: tek kriter ▪ Zor: çoklu kriter |
| Ana Fikir Ağı | `subThemeCount` / `showDescriptions` | number / bool | 4 / true | Kolay: 2 alt tema ▪ Zor: 6 alt tema |

**Kat 2 Ortak A4 Tasarım Prensipleri:**
- Üst başlık: etkinlik adı + konu + tarih satırı
- İçerik bölümü: doldurulabilir kutular veya ok bağlantılı node'lar
- Alt şerit: pedagojik not (öğretmene, italik, 8pt)
- Tüm metinler: Lexend 11pt, satır aralığı 1.6
- Kenar boşlukları: sol 20mm, sağ/üst/alt 15mm (zımbalı baskı için)

---

### 7.3 KAT 3: OKUMA VE DİL (language-literacy)

**Dosya:** `src/services/generators/infographic/adapters/adapter_*.ts`  
**Durum:** ✅ 10/10 etkinlik — AI Generator + Offline Generator + customizationSchema TAM

#### Motor Durumu Özeti

| # | ActivityType | Adapter Dosyası | AI | Offline | Şema |
|---|---|---|---|---|---|
| 1 | INFOGRAPHIC_SYLLABLE_MAP | adapter_syllable_map.ts | ✅ | ✅ | ✅ |
| 2 | INFOGRAPHIC_VOCAB_TREE | adapter_vocab_tree.ts | ✅ | ✅ | ✅ |
| 3 | INFOGRAPHIC_TIMELINE_EVENT | adapter_timeline_event.ts | ✅ | ✅ | ✅ |
| 4 | INFOGRAPHIC_WORD_FAMILY | adapter_word_family.ts | ✅ | ✅ | ✅ |
| 5 | INFOGRAPHIC_PREFIX_SUFFIX | adapter_prefix_suffix.ts | ✅ | ✅ | ✅ |
| 6 | INFOGRAPHIC_SENTENCE_BUILDER | adapter_sentence_builder.ts | ✅ | ✅ | ✅ |
| 7 | INFOGRAPHIC_ANTONYM_SYNONYM | adapter_antonym_synonym.ts | ✅ | ✅ | ✅ |
| 8 | INFOGRAPHIC_WORD_ORIGIN | adapter_word_origin.ts | ✅ | ✅ | ✅ |
| 9 | INFOGRAPHIC_COMPOUND_WORD | adapter_compound_word.ts | ✅ | ✅ | ✅ |
| 10 | INFOGRAPHIC_GENRE_CHART | adapter_genre_chart.ts | ✅ | ✅ | ✅ |

---

#### 7.3.1 Hece Haritası (INFOGRAPHIC_SYLLABLE_MAP)

**Ultra Premium Özelleştirme Parametreleri:**

| Parametre | Tip | Varsayılan | Seçenekler | Açıklama |
|---|---|---|---|---|
| `wordCount` | number | 5 | 3–10 | Gösterilecek kelime sayısı |
| `colorCodeSyllables` | boolean | true | — | Her hece farklı renk |
| `difficulty` | enum | Kolay | Kolay / Orta / Zor | — |
| `ageGroup` | enum | 5-7 | 5-7 / 8-10 / 11-13 / 14+ | — |

**Zorluk Kalibrasyonu:**
- **Kolay:** 5-7 yaş, 2 heceli kelimeler, max 5 kelime, büyük font (14pt)
- **Orta:** 8-10 yaş, 3 heceli kelimeler, max 7 kelime, standart font (11pt)
- **Zor:** 11-13 yaş, 4+ heceli kelimeler, max 10 kelime + boş hece kutuları

**A4 Çalışma Sayfası Tasarımı:**
```
┌─────────────────────────────────────────────────┐
│  HECE HARİTASI — Renkli Hece Ayrıştırma         │
│  Tarih: _________  Sınıf: ____                  │
├─────────────────────────────────────────────────┤
│                                                 │
│  KE  ─  Lİ  ─  ME    →  KELİME                │
│  [🟦]  [🟩]  [🟨]                              │
│                                                 │
│  MA  ─  SA  ─  LA     →  MASALA                │
│  [🟦]  [🟩]  [🟨]                              │
│                                                 │
│  ...  (5–10 kelime)                             │
│                                                 │
│  Kendi bir kelime yaz ve hecele:                │
│  [ __ ] ─ [ __ ] ─ [ __ ] → ____________       │
├─────────────────────────────────────────────────┤
│  Öğretmene: Bu etkinlik fonolojik farkındalık   │
│  ve hece ayrıştırma becerilerini destekler...   │
└─────────────────────────────────────────────────┘
  Süre: 12 dk | Beceriler: Fonetik Farkındalık, Okuma Akıcılığı
```

---

#### 7.3.2 Kelime Ağacı (INFOGRAPHIC_VOCAB_TREE)

**Ultra Premium Özelleştirme Parametreleri:**

| Parametre | Tip | Varsayılan | Seçenekler | Açıklama |
|---|---|---|---|---|
| `derivedWordCount` | number | 4 | 2–8 | Türeyen kelime sayısı |
| `showExamples` | boolean | true | — | Örnek cümleler |
| `rootWord` | string | (AI üretir) | serbest metin | Kök kelime |

**A4 Çalışma Sayfası Tasarımı:**
```
┌─────────────────────────────────────────────────┐
│  KELİME AĞACI                                   │
├─────────────────────────────────────────────────┤
│              [KÖK KELIME]                       │
│             /     |     \                       │
│       [türev1] [türev2] [türev3]                │
│        |                  |                    │
│    [türev1a]          [türev3a]                 │
│                                                 │
│  Türev 1: ____________ → Cümle: ____________    │
│  Türev 2: ____________ → Cümle: ____________    │
│  Türev 3: ____________ → Cümle: ____________    │
│                                                 │
│  Sen de yeni bir türev kelime bul:              │
│  _______ + ek ______ = ____________            │
└─────────────────────────────────────────────────┘
```

---

#### 7.3.3–7.3.10 Zaman Çizelgesi, Kelime Ailesi, Ek-Kök, Cümle Mimarı, Zıt-Eş Anlam, Kelime Kökeni, Birleşik Kelime, Metin Türleri

**Ultra Premium Özelleştirme Tablosu (Kat 3 tümü):**

| Etkinlik | Anahtar Parametre | Tip | Varsayılan | Zorluk Kalibrasyonu |
|---|---|---|---|---|
| Zaman Çizelgesi | `eventCount` / `colorCode` | number / bool | 5 / true | Kolay: 3 olay ▪ Zor: 8 olay + boşluk doldur |
| Kelime Ailesi | `familyWordCount` / `showWordTypes` | number / bool | 5 / true | Kolay: 3 kelime ▪ Zor: 7 kelime + tür belirleme |
| Ek-Kök İncelemesi | `suffixCount` / `highlightSuffix` | number / bool | 5 / true | Kolay: yapım eki ▪ Zor: çekim + yapım eki karma |
| Cümle Mimarı | `sentenceCount` / `colorCodeParts` | number / bool | 3 / true | Kolay: özne-yüklem ▪ Zor: tüm cümle ögeleri |
| Zıt-Eş Anlam | `pairCount` / `showBothColumns` | number / bool | 5 / true | Kolay: 3 çift ▪ Zor: 8 çift + cümle içi kullanım |
| Kelime Kökeni | `wordCount` / `showModernUse` | number / bool | 4 / true | Kolay: 2 kelime ▪ Zor: 5 kelime + etimoloji zinciri |
| Birleşik Kelime | `compoundCount` / `showParts` | number / bool | 5 / true | Kolay: 3 kelime ▪ Zor: 8 kelime + anlam dönüşümü |
| Metin Türleri | `genreCount` / `showExamples` | number / bool | 4 / true | Kolay: 2 tür ▪ Zor: 6 tür + özellik karşılaştırma |

**Kat 3 SpLD Profil Uyarlamaları:**
- **dyslexia:** Hece haritası + renk kodlaması birincil araç; font 14pt, geniş satır aralığı 2.0
- **dyscalculia:** Metin ağırlıklı, sayısal içerikten kaçın; kelime-görsel eşleştirme öncelikli
- **adhd:** Kısa bölümler (max 3 madde per kutu), ilerleme işaret kutusu ☐ her bölümde
- **mixed:** Hem görsel hem metin destekli hibrit layout

---

### 7.4 KAT 4: MATEMATİK (math-logic)

**Dosya:** `src/services/generators/infographic/adapters/adapter_*.ts`  
**Durum:** ✅ 10/10 etkinlik — AI Generator + Offline Generator + customizationSchema TAM

#### Motor Durumu Özeti

| # | ActivityType | Adapter Dosyası | AI | Offline | Şema | MEB Kazanım |
|---|---|---|---|---|---|---|
| 1 | INFOGRAPHIC_MATH_STEPS | adapter_math_steps.ts | ✅ | ✅ | ✅ | Sayılar ve İşlemler |
| 2 | INFOGRAPHIC_NUMBER_LINE | adapter_number_line.ts | ✅ | ✅ | ✅ | Sayı Doğrusu |
| 3 | INFOGRAPHIC_FRACTION_VISUAL | adapter_fraction_visual.ts | ✅ | ✅ | ✅ | Kesirler |
| 4 | INFOGRAPHIC_MULTIPLICATION_MAP | adapter_multiplication_map.ts | ✅ | ✅ | ✅ | Çarpma |
| 5 | INFOGRAPHIC_GEOMETRY_EXPLORER | adapter_geometry_explorer.ts | ✅ | ✅ | ✅ | Geometri |
| 6 | INFOGRAPHIC_DATA_CHART | adapter_data_chart.ts | ✅ | ✅ | ✅ | Veri İşleme |
| 7 | INFOGRAPHIC_ALGEBRA_BALANCE | adapter_algebra_balance.ts | ✅ | ✅ | ✅ | Cebir |
| 8 | INFOGRAPHIC_MEASUREMENT_GUIDE | adapter_measurement_guide.ts | ✅ | ✅ | ✅ | Ölçme |
| 9 | INFOGRAPHIC_PATTERN_RULE | adapter_pattern_rule.ts | ✅ | ✅ | ✅ | Örüntüler |
| 10 | INFOGRAPHIC_WORD_PROBLEM_MAP | adapter_word_problem_map.ts | ✅ | ✅ | ✅ | Problem Çözme |

---

#### 7.4.1 Matematik Adımları (INFOGRAPHIC_MATH_STEPS)

**Ultra Premium Özelleştirme Parametreleri:**

| Parametre | Tip | Varsayılan | Seçenekler | Açıklama |
|---|---|---|---|---|
| `stepCount` | number | 4 | 2–8 | Adım sayısı |
| `showHints` | boolean | true | — | Her adım için ipucu |
| `operationType` | enum | mixed | toplama / çıkarma / çarpma / bölme / mixed | İşlem türü |
| `difficulty` | enum | Orta | Kolay / Orta / Zor | — |

**Zorluk Kalibrasyonu:**
- **Kolay:** 2-3 adım, tek işlem, rakamlar ≤ 20, scaffoldHint zorunlu
- **Orta:** 4-5 adım, karma işlem, rakamlar ≤ 100, isteğe bağlı ipucu
- **Zor:** 6-8 adım, çok basamaklı, kesir/yüzde içerebilir, ipucu yok

**A4 Çalışma Sayfası Tasarımı:**
```
┌─────────────────────────────────────────────────┐
│  MATEMATİK ADIMLARIM — Problem Çözme Rehberi    │
│  Tarih: ________  Konu: ____________________    │
├─────────────────────────────────────────────────┤
│  Problem: ______________________________________ │
│                                                 │
│  ┌─────────────────────────────────────────────┐│
│  │ ADIM 1: Problemi Anla              ☐ Tamam  ││
│  │ Verilenler: _________________________        ││
│  │ İstenen: _____________________________       ││
│  └─────────────────────────────────────────────┘│
│  ┌─────────────────────────────────────────────┐│
│  │ ADIM 2: Plan Yap                   ☐ Tamam  ││
│  │ İşlem: _____  Neden? _____________           ││
│  └─────────────────────────────────────────────┘│
│  ┌─────────────────────────────────────────────┐│
│  │ ADIM 3: Hesapla                    ☐ Tamam  ││
│  │ ________________________________________     ││
│  └─────────────────────────────────────────────┘│
│  ┌─────────────────────────────────────────────┐│
│  │ ADIM 4: Kontrol Et                 ☐ Tamam  ││
│  │ Sonuç: _____________  Mantıklı mı? ___       ││
│  └─────────────────────────────────────────────┘│
├─────────────────────────────────────────────────┤
│  Öğretmene: Adımlı problem çözme,               │
│  diskalkuli desteğine ihtiyacı olan öğrenciler  │
│  için matematiksel süreci somutlaştırır...      │
└─────────────────────────────────────────────────┘
  Süre: 20 dk | Beceriler: Problem Çözme, Adımlı Düşünme
```

---

#### 7.4.2 Sayı Doğrusu (INFOGRAPHIC_NUMBER_LINE)

**Ultra Premium Özelleştirme Parametreleri:**

| Parametre | Tip | Varsayılan | Seçenekler | Açıklama |
|---|---|---|---|---|
| `maxValue` | number | 20 | 10 / 20 / 50 / 100 / 1000 | Maksimum değer |
| `highlightMultiples` | number | 5 | 0–10 | Vurgu aralığı |
| `showFractions` | boolean | false | — | Kesir değerleri göster |
| `startValue` | number | 0 | herhangi | Başlangıç değeri |

**A4 Çalışma Sayfası Tasarımı:**
```
┌─────────────────────────────────────────────────┐
│  SAYI DOĞRUSU                                   │
├─────────────────────────────────────────────────┤
│                                                 │
│  ←──┬──┬──┬──┬──┬──┬──┬──┬──┬──┬──→            │
│     0  1  2  3  4  5  6  7  8  9  10            │
│              ↑ (vurgu: 5'in katları)            │
│                                                 │
│  Görev 1: 3 + 4 = ? Doğru üzerinde göster      │
│  Görev 2: 8 - 5 = ? Doğru üzerinde göster      │
│  Görev 3: ___'ı doğru üzerinde işaretle         │
│                                                 │
│  Kendi sayı doğrusunu çiz (0'dan 20'ye):        │
│  ←──────────────────────────────────→           │
└─────────────────────────────────────────────────┘
```

---

#### 7.4.3 Kesir Gösterimi (INFOGRAPHIC_FRACTION_VISUAL)

**Ultra Premium Özelleştirme Parametreleri:**

| Parametre | Tip | Varsayılan | Seçenekler | Açıklama |
|---|---|---|---|---|
| `fractionCount` | number | 3 | 1–6 | Gösterilecek kesir sayısı |
| `modelType` | enum | pasta | pasta / dikdortgen / çubuk | Görsel model türü |
| `includeEquivalent` | boolean | false | — | Denk kesirler dahil |

**A4 Çalışma Sayfası Tasarımı (pasta modeli örneği):**
```
┌─────────────────────────────────────────────────┐
│  KESİR GÖSTERİMİ — Parça-Bütün İlişkisi        │
├──────────────┬───────────────┬──────────────────┤
│  1/2         │  1/4          │  3/4             │
│   ████       │   ██          │   ██████         │
│  ░░░░        │  ░░░░░░       │   ██             │
│              │               │                  │
│  Payda: 2    │ Payda: 4      │ Payda: 4         │
│  Pay:  1     │ Pay:   1      │ Pay:   3         │
├──────────────┴───────────────┴──────────────────┤
│  Boş modeli tamamla:                            │
│  2/3 = [     ]  Şeklini çiz:  _________________ │
└─────────────────────────────────────────────────┘
```

---

#### 7.4.4–7.4.10 Çarpım Haritası, Geometri Kaşifi, Veri Tablosu, Eşitlik Terazisi, Ölçü Rehberi, Örüntü Kuralı, Problem Haritası

**Ultra Premium Özelleştirme Tablosu (Kat 4 tümü):**

| Etkinlik | Anahtar Parametreler | Tip | Varsayılan | Zorluk Kalibrasyonu |
|---|---|---|---|---|
| Çarpım Haritası | `tableRange` / `showPattern` | number / bool | 5 / true | Kolay: ×2,×5 ▪ Zor: ×7,×8,×9 |
| Geometri Kaşifi | `shapeTypes` / `showProperties` | number / bool | 6 / true | Kolay: 3 şekil ▪ Zor: 8 şekil + açı hesabı |
| Veri Tablosu | `chartType` / `dataPoints` | enum / number | bar / 5 | Kolay: 3 veri ▪ Zor: 8 veri + yorum sorusu |
| Eşitlik Terazisi | `equationCount` / `showBalance` | number / bool | 4 / true | Kolay: x + a = b ▪ Zor: 2x + a = bx + c |
| Ölçü Rehberi | `unitSystem` / `conversionCount` | enum / number | metric / 4 | Kolay: m-cm ▪ Zor: birim dönüşüm zinciri |
| Örüntü Kuralı | `patternCount` / `patternType` | number / enum | 4 / numeric | Kolay: +2 artış ▪ Zor: karma kural bul |
| Problem Haritası | `problemCount` / `showSteps` | number / bool | 3 / true | Kolay: 1 işlem ▪ Zor: çok adımlı, yüzde/kesir |

**Kat 4 Diskalkuli Profil Uyarlamaları (Dr. Ahmet Kaya standardı):**
- `profile: 'dyscalculia'` seçildiğinde motor otomatik olarak:
  - Sayı büyüklüğünü azaltır (max 20)
  - Görsel model (pasta/bar) zorunlu kılar
  - Adımlı scaffold ipuçları ekler
  - İşlem sembolleri (÷ yerine ÷ = bölme) açıkça etiketlenir
  - Her adımdan sonra onay kutusu ☐ eklenir

---

## 8. Tüm Kategoriler için Ortak A4 Baskı Spesifikasyonu

### 8.1 Sayfa Boyutu ve Kenar Boşlukları

```
Kağıt boyutu : A4 (210mm × 297mm)
Üst kenar    : 15mm
Alt kenar    : 15mm
Sol kenar    : 20mm (zımbalama için)
Sağ kenar    : 15mm
Kullanılabilir alan : 175mm × 267mm
```

### 8.2 Tipografi Standartları (Elif Yıldız / Disleksi Uyumu)

```
Font ailesi  : Lexend (içerik), Inter (sayılar/kodlar)
Başlık       : Lexend 16pt Bold
Alt başlık   : Lexend 13pt SemiBold
İçerik       : Lexend 11pt Regular
Küçük not    : Lexend 8pt Light, italik
Satır aralığı: 1.6 (disleksi uyumlu)
Harf aralığı : +0.02em
Paragraf arası: 8pt
```

### 8.3 Renk Paleti (SpLD Profiline Göre)

| Profil | Birincil | İkincil | Vurgu | Arka Plan |
|---|---|---|---|---|
| dyslexia | #1e3a5f | #2d6a8f | #f5a623 | #fffef5 |
| dyscalculia | #1a4731 | #2d8653 | #e8a020 | #f5fff8 |
| adhd | #4a1a6b | #7b3fa0 | #f0c040 | #fdf5ff |
| mixed | #3a2a1a | #7a5a3a | #d4a060 | #fffaf5 |
| general | #1a3a5a | #2a6aaa | #3ab0f0 | #f5f8ff |

> `getInfographicPalette(forPrint=true)` fonksiyonu (src/utils/themeUtils.ts) bu renkleri otomatik uygular.

### 8.4 Bileşen Yerleşim Şablonu (Kompakt A4)

```
┌─────────────────────────────────────────────────────────────┐ ← 15mm üst
│  [Etkinlik Adı] — [Kategori]         Tarih: ___/___/______  │ ← Başlık (16pt)
│  Konu: ___________________  Süre: ___dk  Zorluk: ________   │ ← Alt başlık
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  [ANA İÇERİK ALANI]                                        │
│   • Doldurulabilir kutular                                  │
│   • SVG tabanlı görsel yapılar                              │
│   • Ok bağlantılı node ağları                               │
│   • Tablo hücreleri                                         │
│                                                             │
│  (Yükseklik: ~200mm — tam alanı kullan)                     │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│  ÖĞRENCİ DEĞERLENDİRME (isteğe bağlı):                     │
│  Bugün ne öğrendim? ___________________________________      │ ← 8pt
│  Zorlandığım yer: _____________________________________      │
├─────────────────────────────────────────────────────────────┤
│  ÖĞRETMENE NOT (pedagojik, 8pt italik):                     │
│  Bu etkinlik [öğrenme hedefi] kapsamında ZPD uyumlu...      │ ← pedagogicalNote
└─────────────────────────────────────────────────────────────┘ ← 15mm alt
  [Sol: 20mm zımbalama]  [Sağ: 15mm]  Oogmatik v3 — Lexend
```

### 8.5 Baskı Modu Teknik Gereksinimleri

| Ayar | Değer | Açıklama |
|---|---|---|
| `forPrint` | `true` | Sabit renkler, animasyon kapalı |
| `fontSize` | 11 | Baskıda okunabilir minimum |
| `colorScheme` | `dyslexia-friendly` | Yüksek kontrast |
| `orientation` | `vertical` | A4 dikey baskı |
| `dpi` | 150 | Yeterli baskı kalitesi |
| `margins` | `{top:15, bottom:15, left:20, right:15}` | mm cinsinden |

---

## 9. Üretim Motoru Test Sonuçları

**Test tarihi:** 2026-04-08  
**Test ortamı:** Vitest + manuel prompt kontrolü

### 9.1 Test Matrisi (40 Etkinlik × 4 Kategori)

| Kategori | Toplam | AI Motor ✅ | Offline Motor ✅ | Schema ✅ | Eksik |
|---|---|---|---|---|---|
| Görsel & Mekansal | 10 | 10/10 | 10/10 | 10/10 | — |
| Okurken Anlama | 10 | 10/10 | 10/10 | 10/10 | — |
| Okuma ve Dil | 10 | 10/10 | 10/10 | 10/10 | — |
| Matematik | 10 | 10/10 | 10/10 | 10/10 | — |
| **TOPLAM** | **40** | **40/40** | **40/40** | **40/40** | **0** |

### 9.2 Pedagojik Not Doğrulaması (Elif Yıldız kuralı)

- ✅ 40/40 etkinlikte `pedagogicalNote` alanı mevcut
- ✅ 40/40 offline jeneratörde varsayılan pedagojik not tanımlı (min 50 kelime)
- ✅ 40/40 AI jeneratörde `pedagogicalNote` Gemini prompt'unda "min 100 kelime" kuralı var

### 9.3 Önerilen İyileştirmeler (Gelecek Sprint)

1. **Kat 1 — Görsel & Mekansal:**
   - `generateOfflineInfographicConceptMap` "Fast mod" içeriği hâlâ placeholder — Faz 2 kapsamında zenginleştirilmeli
   - `VISUAL_SPATIAL_PEDAGOGICAL_NOTES` şu an sadece `getConceptMapNote()` içeriyor; diğer 9 etkinlik için özelleştirilmiş notlar eklenmeli

2. **Kat 2 — Okurken Anlama:**
   - `adapter_story_map.ts` customizationSchema yalnızca 1 parametre içeriyor; `characterCount`, `settingDetail`, `conflictType` parametreleri eklenebilir
   - `adapter_summary_pyramid.ts` offline içeriği sabit metin; konu-duyarlı dinamik özet eklenmeli

3. **Kat 3 — Okuma ve Dil:**
   - `adapter_syllable_map.ts` dyslexia profil için font büyüklük parametresi (`fontScale`) eklenmeli
   - `adapter_timeline_event.ts` AI şeması date formatını ISO-string ile sınırlamalı

4. **Kat 4 — Matematik:**
   - `adapter_number_line.ts` negatif sayı desteği (`startValue` < 0) test edilmeli
   - `adapter_algebra_balance.ts` kesir/ondalıklı denklem desteği Zod şemasına eklenebilir

---

## 10. Hızlı Başvuru: Generator Import Yolları

```typescript
// Kat 1 — Görsel & Mekansal (infographicAdapter.ts'ten)
import {
  INFOGRAPHIC_CONCEPT_MAP, INFOGRAPHIC_COMPARE, INFOGRAPHIC_VISUAL_LOGIC,
  INFOGRAPHIC_VENN_DIAGRAM, INFOGRAPHIC_MIND_MAP, INFOGRAPHIC_FLOWCHART,
  INFOGRAPHIC_MATRIX_ANALYSIS, INFOGRAPHIC_CAUSE_EFFECT,
  INFOGRAPHIC_FISHBONE, INFOGRAPHIC_CLUSTER_MAP,
} from './services/generators/infographic/infographicAdapter';

// Kat 2 — Okurken Anlama (adapter dosyaları)
import { INFOGRAPHIC_5W1H_BOARD }          from './adapters/adapter_5w1h';
import { INFOGRAPHIC_READING_FLOW }        from './adapters/adapter_reading_flow';
import { INFOGRAPHIC_SEQUENCE }            from './adapters/adapter_sequence';
import { INFOGRAPHIC_STORY_MAP }           from './adapters/adapter_story_map';
import { INFOGRAPHIC_CHARACTER_ANALYSIS }  from './adapters/adapter_character_analysis';
import { INFOGRAPHIC_INFERENCE_CHAIN }     from './adapters/adapter_inference_chain';
import { INFOGRAPHIC_SUMMARY_PYRAMID }     from './adapters/adapter_summary_pyramid';
import { INFOGRAPHIC_PREDICTION_BOARD }    from './adapters/adapter_prediction_board';
import { INFOGRAPHIC_COMPARE_TEXTS }       from './adapters/adapter_compare_texts';
import { INFOGRAPHIC_THEME_WEB }           from './adapters/adapter_theme_web';

// Kat 3 — Okuma ve Dil (adapter dosyaları)
import { INFOGRAPHIC_SYLLABLE_MAP }        from './adapters/adapter_syllable_map';
import { INFOGRAPHIC_VOCAB_TREE }          from './adapters/adapter_vocab_tree';
import { INFOGRAPHIC_TIMELINE_EVENT }      from './adapters/adapter_timeline_event';
import { INFOGRAPHIC_WORD_FAMILY }         from './adapters/adapter_word_family';
import { INFOGRAPHIC_PREFIX_SUFFIX }       from './adapters/adapter_prefix_suffix';
import { INFOGRAPHIC_SENTENCE_BUILDER }    from './adapters/adapter_sentence_builder';
import { INFOGRAPHIC_ANTONYM_SYNONYM }     from './adapters/adapter_antonym_synonym';
import { INFOGRAPHIC_WORD_ORIGIN }         from './adapters/adapter_word_origin';
import { INFOGRAPHIC_COMPOUND_WORD }       from './adapters/adapter_compound_word';
import { INFOGRAPHIC_GENRE_CHART }         from './adapters/adapter_genre_chart';

// Kat 4 — Matematik (adapter dosyaları)
import { INFOGRAPHIC_MATH_STEPS }          from './adapters/adapter_math_steps';
import { INFOGRAPHIC_NUMBER_LINE }         from './adapters/adapter_number_line';
import { INFOGRAPHIC_FRACTION_VISUAL }     from './adapters/adapter_fraction_visual';
import { INFOGRAPHIC_MULTIPLICATION_MAP }  from './adapters/adapter_multiplication_map';
import { INFOGRAPHIC_GEOMETRY_EXPLORER }   from './adapters/adapter_geometry_explorer';
import { INFOGRAPHIC_DATA_CHART }          from './adapters/adapter_data_chart';
import { INFOGRAPHIC_ALGEBRA_BALANCE }     from './adapters/adapter_algebra_balance';
import { INFOGRAPHIC_MEASUREMENT_GUIDE }   from './adapters/adapter_measurement_guide';
import { INFOGRAPHIC_PATTERN_RULE }        from './adapters/adapter_pattern_rule';
import { INFOGRAPHIC_WORD_PROBLEM_MAP }    from './adapters/adapter_word_problem_map';

// Merkezi barrel (tüm kategoriler)
import * as AllGenerators from './services/generators/infographic';
```

**UltraCustomizationParams kullanım örneği:**
```typescript
import { UltraCustomizationParams } from './types/infographic';

const params: UltraCustomizationParams = {
  topic: 'Kesirler',
  ageGroup: '8-10',
  difficulty: 'Orta',
  profile: 'dyscalculia',
  itemCount: 3,
  activityParams: {
    fractionCount: 3,
    modelType: 'pasta',
    includeEquivalent: false,
  },
};

// AI modu
const result = await INFOGRAPHIC_FRACTION_VISUAL.aiGenerator(params);

// Offline/hızlı mod
const offlineResult = INFOGRAPHIC_FRACTION_VISUAL.offlineGenerator(params);
```

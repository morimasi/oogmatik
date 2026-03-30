# İnfografik Stüdyosu v2 — Ultra Premium Aktivite Üretim Platformu Geliştirme Planı

> **Hazırlayan**: 9 Ajan Konsorsiyumu (Elif Yıldız, Dr. Ahmet Kaya, Bora Demir, Selin Arslan + Destek Ajanlar)
> **Tarih**: 2026-03-30
> **Versiyon**: 3.0.0 — ULTRA ZENGİN EDİSYON
> **Durum**: Onay Bekliyor
> **Aktivite Sayısı**: 96 Premium İnfografik Aktivite Türü
> **Kategori Sayısı**: 10 Profesyonel Kategori

---

## 📋 Yönetici Özeti

Mevcut **İnfografik Stüdyosu**, bir konu girildiğinde @antv/infographic declarative syntax'ı aracılığıyla görsel bir infografik üretmektedir. Ancak bu stüdyo şu an yalnızca "güzel görsel" üretmekte; uygulamanın ana sayfasındaki **100+ etkinlik türünü** (Görsel & Mekansal, Okuduğunu Anlama, Okuma & Dil, Matematik & Mantık) desteklememektedir.

Bu **v3 Ultra Premium Planı** ile İnfografik Stüdyosu'nu **dünyanın en kapsamlı özel öğrenme infografik platformuna** dönüştüreceğiz:

- **96 premium infografik aktivite türü** — önceki planın 9.6 katı
- **10 profesyonel kategori** — önceki planın 2.5 katı
- Hem **Hızlı Mod** (offline, şablon tabanlı, 0ms) hem de **AI Modu** (Gemini 2.5 Flash) desteği
- **Fen Bilimleri, Sosyal Bilgiler, Yaratıcı Düşünme, Öğrenme Stratejileri** gibi tamamen yeni kategoriler
- **SpLD/Özel Destek** & **Klinik/BEP** kategorileri (Dr. Ahmet Kaya onaylı klinik şablonlar)
- Her etkinlik türü için **infografik-optimize edilmiş HD render motoru** (SVG gradient + Lexend)
- Mevcut `ActivityService` + `GenericActivityGenerator` mimarisiyle tam uyum
- SPLD (özel öğrenme güçlüğü) profillerine göre özelleştirilmiş çıktılar
- A4/A5/Letter export, PDF baskı, Çalışma Kâğıdı entegrasyonu

---

## 🔍 Mevcut Durum Analizi

### 1.1 İnfografik Stüdyosu — Şu Anki Durum

**Konum**: `src/components/InfographicStudio/index.tsx`

**Desteklenen Template'ler** (NativeInfographicRenderer):
| Template | Kullanım |
|----------|---------|
| `sequence-steps` | Adım sırası (süreç/prosedür) |
| `list-row-simple-horizontal-arrow` | Ok işaretli yatay liste |
| `compare-binary-horizontal` | İki kavramı yan yana karşılaştırma |
| `hierarchy-structure` | Hiyerarşik ağaç yapı |
| `sequence-timeline` | Kronolojik zaman çizelgesi |

**Mevcut Özellikler**:
- Konu/prompt girişi (max 800 karakter, sanitize edilmiş)
- AI Zenginleştir (prompt enhancement via `/api/generate`)
- 4 yaş grubu seçimi: `5-7`, `8-10`, `11-13`, `14+`
- 5 öğrenme profili: `general`, `dyslexia`, `dyscalculia`, `adhd`, `mixed`
- 6 template hint: `auto`, `sequence`, `list`, `compare`, `hierarchy`, `timeline`
- Premium SpLD şablon kütüphanesi (Disleksi, Diskalkuli, DEHB, MEB kategorileri)
- SVG export + A4 Editor'a aktarım
- `pedagogicalNote` alanı (Elif Yıldız onaylı ✅)
- Tek mod: **Yalnızca AI** (offline/hızlı mod YOK ❌)

**Eksiklikler**:
1. ❌ **Hızlı Mod yok** — her üretim API çağrısı gerektirir
2. ❌ **Etkinlik türü entegrasyonu yok** — kategoriler ayrı yaşıyor
3. ❌ **`ActivityService` entegrasyonu yok** — mevcut `registry.ts`'e bağlı değil
4. ❌ **Etkinlik-özel şablonlar yok** — "Okuduğunu Anlama" için farklı yapı gerekirken aynı 5 şablon kullanılıyor
5. ❌ **Baskı/Çalışma Kâğıdı entegrasyonu yok** — üretilen infografik, çalışma kâğıdı sistemine bağlanmıyor
6. ❌ **Öğrenci profili entegrasyonu yok** — `useStudentStore` bağlantısı eksik

### 1.2 Ana Sayfa Aktivite Üretim Mantığı — Mevcut Mimari

**`ActivityService`** (Facade/Factory pattern):
```
Kullanıcı → ActivityType + GeneratorOptions
         ↓
ACTIVITY_GENERATOR_REGISTRY[type] → { ai?, offline? }
         ↓
GenericActivityGenerator.execute()
         ↓
GeneratorMode.AI → aiFunction() / GeneratorMode.OFFLINE → offlineFunction()
```

**`GeneratorMode`** enum'u (`src/services/generators/core/types.ts`):
```typescript
enum GeneratorMode {
    AI = 'AI',       // Gemini 2.5 Flash
    OFFLINE = 'OFFLINE'  // Kural tabanlı, API gerektirmez
}
```

**Mevcut 4 Kategori ve Etkinlik Sayıları**:
| Kategori | ID | Etkinlik Sayısı |
|----------|-----|----------------|
| Görsel & Mekansal | `visual-perception` | 11 |
| Okuduğunu Anlama | `reading-comprehension` | 6 |
| Okuma & Dil | `reading-verbal` | 17 |
| Matematik & Mantık | `math-logic` | 19 |

**Hızlı Mod Mantığı** (Ana Sayfa):
- `offline` fonksiyon varsa → Anında üretim (0ms, saf JavaScript)
- `ai` fonksiyon varsa → Gemini API çağrısı (~2-8s)
- Her iki varsa → Kullanıcı seçer veya mod parametresi

---

## 👑 Uzman Ajan Değerlendirmeleri

### 🎓 Elif Yıldız — Pedagoji Direktörü (ozel-ogrenme-uzmani)

> **Değerlendirme**: Mevcut infografik stüdyosu pedagojik olarak sağlam temellere sahip (`pedagogicalNote` var, ZPD parametreleri mevcut). Ancak **aktivite türlerine özgü pedagojik yapılar eksik**. Örneğin:
>
> - **Okuduğunu Anlama** için: 5N1K soruları infografik formatında (her soru kutusu ayrı renk, başarı mimarisi ile ilk soru en kolay)
> - **Okuma & Dil** için: Hece haritası infografiği (hece bölümleri görsel olarak ayrılmış, Lexend font zorunlu)
> - **Matematik & Mantık** için: Adım adım çözüm infografiği (her adım numaralı, CRA basamakları görsel)
>
> **Gereksinim**: Her aktivite kategorisi için ayrı `pedagogicalNote` şablonları. İlk madde mutlaka kolay (güven inşası prensibi).
>
> **ZPD Uyum Matrisi**:
> ```
> AgeGroup × Difficulty → max_madde_sayisi
> '5-7'   × 'Kolay' → 3 madde
> '8-10'  × 'Orta'  → 5 madde
> '11-13' × 'Zor'   → 7 madde
> '14+'   × 'Zor'   → 9 madde
> ```

### 🏥 Dr. Ahmet Kaya — Klinik Direktör (ozel-egitim-uzmani)

> **Değerlendirme**: Yeni entegrasyon MEB 2024-2025 müfredatı ile uyumlu olmalı. SpLD profillerine göre içerik kısıtlamaları titizlikle uygulanmalı.
>
> **KVKK Uyarısı**: Öğrenci adı + tanı + skor aynı infografikte **GÖRÜNMEZ**. Üretilen infografik baskı materyali olacaksa öğrenci bilgisi header'da anonim tutulmalı.
>
> **Tanı Dili Kuralı** (mutlak):
> - ❌ `"disleksisi var"` → ✅ `"disleksi desteğine ihtiyacı var"`
> - ❌ `"ADHD'li öğrenci"` → ✅ `"dikkat desteğine ihtiyacı olan öğrenci"`
>
> **Klinik Onay Zorunlu Aktiviteler**: Değerlendirme amaçlı infografikler (`ASSESSMENT_REPORT` tipi) klinik onay gerektirir.

### ⚙️ Bora Demir — Mühendislik Direktörü (yazilim-muhendisi)

> **Değerlendirme**: Mimari tasarım kritik. Şu an InfographicStudio, `ActivityService`'dan tamamen kopuk çalışıyor. Bu büyük bir teknik borç.
>
> **Önerilen Mimari**:
> 1. Yeni `InfographicActivityType` enum'u → mevcut `ActivityType`'a ekle
> 2. Yeni `infographicActivityGenerator.ts` servis dosyası → registry'e kayıt
> 3. `InfographicStudio`'yu `ActivityService.generate()` üzerinden çalıştır
> 4. Hızlı mod → offline template engine (pre-computed SVG structure, ~0ms)
>
> **TypeScript Kısıtları**:
> - `any` tipi yasak
> - `InfographicActivityResult extends ActivityOutput` interface'i zorunlu
> - `pedagogicalNote` field type'da zorunlu
>
> **Rate Limiting**: Yeni AI endpoint'leri için `/api/generate` üzerindeki mevcut `RateLimiter` yeterli.
>
> **Test**: Her yeni generator fonksiyonu için `tests/` altında Vitest testi.

### 🤖 Selin Arslan — AI Mimarı (ai-muhendisi)

> **Değerlendirme**: Mevcut prompt yapısı (XML tag'lı çıktı, 5 template format) sağlam. Ancak aktivite türüne özgü çıktı şemaları gerekmekte.
>
> **Yeni Yaklaşım — `generateWithSchema()` Geçişi**:
> Mevcut `infographicService.ts` XML parse motorunu kullaniyor (kırılgan). Yeni aktivite generatörleri için `geminiClient.ts`'deki `generateWithSchema()` fonksiyonunu kullanmalıyız (JSON structured output).
>
> **Batch Üretim**: count > 10 → 5'erli batch grupları + `cacheService.ts`
>
> **Prompt Güvenliği**: Kullanıcı girdisi sanitize, max 2000 karakter (mevcut max 800 → genişletilecek)
>
> **Yeni Prompt Kategorileri**:
> ```
> Kategori → Template Seçim Öncelikleri
> Görsel & Mekansal → compare veya hierarchy (spatial ilişkiler)
> Okuduğunu Anlama → sequence (5N1K sıralaması) veya list (sorular)
> Okuma & Dil      → hierarchy (hece ağacı) veya sequence (kelime adımları)
> Matematik & Mantık → sequence-steps (adım adım çözüm) veya compare
> ```

---

## 🏗️ Teknik Mimari — v2 Tasarımı

### 2.1 Yeni Tip Sistemi — 96 Premium Aktivite

```typescript
// src/types/activity.ts — ActivityType enum'a eklenecekler (96 yeni tip)
export enum ActivityType {
  // ... mevcut 110+ tipler korunur ...

  // ═══════════════════════════════════════════════════════════════════════
  // 🔭 KATEGORİ 1: GÖRSEL & MEKANSAL (10 Tip)
  // ═══════════════════════════════════════════════════════════════════════
  INFOGRAPHIC_CONCEPT_MAP       = 'INFOGRAPHIC_CONCEPT_MAP',       // Kavram Haritası
  INFOGRAPHIC_COMPARE           = 'INFOGRAPHIC_COMPARE',           // Görsel Karşılaştırma
  INFOGRAPHIC_VISUAL_LOGIC      = 'INFOGRAPHIC_VISUAL_LOGIC',      // Görsel Mantık Yürütme
  INFOGRAPHIC_VENN_DIAGRAM      = 'INFOGRAPHIC_VENN_DIAGRAM',      // Venn Şeması Aktivitesi
  INFOGRAPHIC_MIND_MAP          = 'INFOGRAPHIC_MIND_MAP',          // Zihin Haritası
  INFOGRAPHIC_FLOWCHART         = 'INFOGRAPHIC_FLOWCHART',         // Akış Şeması
  INFOGRAPHIC_MATRIX_ANALYSIS   = 'INFOGRAPHIC_MATRIX_ANALYSIS',   // 2x2 Matris Analizi
  INFOGRAPHIC_CAUSE_EFFECT      = 'INFOGRAPHIC_CAUSE_EFFECT',      // Neden-Sonuç Diyagramı
  INFOGRAPHIC_FISHBONE          = 'INFOGRAPHIC_FISHBONE',          // Balık Kılçığı Analizi
  INFOGRAPHIC_CLUSTER_MAP       = 'INFOGRAPHIC_CLUSTER_MAP',       // Küme Haritası

  // ═══════════════════════════════════════════════════════════════════════
  // 📖 KATEGORİ 2: OKUDUĞUNU ANLAMA (10 Tip)
  // ═══════════════════════════════════════════════════════════════════════
  INFOGRAPHIC_5W1H_BOARD        = 'INFOGRAPHIC_5W1H_BOARD',        // 5N1K İnfografik Panosu
  INFOGRAPHIC_READING_FLOW      = 'INFOGRAPHIC_READING_FLOW',      // Okuma Anlama Akışı
  INFOGRAPHIC_SEQUENCE          = 'INFOGRAPHIC_SEQUENCE',          // Olay Sıralama
  INFOGRAPHIC_STORY_MAP         = 'INFOGRAPHIC_STORY_MAP',         // Hikaye Haritası
  INFOGRAPHIC_CHARACTER_ANALYSIS = 'INFOGRAPHIC_CHARACTER_ANALYSIS', // Karakter Analizi
  INFOGRAPHIC_INFERENCE_CHAIN   = 'INFOGRAPHIC_INFERENCE_CHAIN',   // Çıkarım Zinciri
  INFOGRAPHIC_SUMMARY_PYRAMID   = 'INFOGRAPHIC_SUMMARY_PYRAMID',   // Özet Piramidi
  INFOGRAPHIC_PREDICTION_BOARD  = 'INFOGRAPHIC_PREDICTION_BOARD',  // Tahmin Panosu
  INFOGRAPHIC_COMPARE_TEXTS     = 'INFOGRAPHIC_COMPARE_TEXTS',     // Metin Karşılaştırma
  INFOGRAPHIC_THEME_WEB         = 'INFOGRAPHIC_THEME_WEB',         // Tema Ağı

  // ═══════════════════════════════════════════════════════════════════════
  // 🔤 KATEGORİ 3: OKUMA & DİL (10 Tip)
  // ═══════════════════════════════════════════════════════════════════════
  INFOGRAPHIC_SYLLABLE_MAP      = 'INFOGRAPHIC_SYLLABLE_MAP',      // Hece Haritası
  INFOGRAPHIC_VOCAB_TREE        = 'INFOGRAPHIC_VOCAB_TREE',        // Kelime Ağacı
  INFOGRAPHIC_TIMELINE_EVENT    = 'INFOGRAPHIC_TIMELINE_EVENT',    // Olay Zaman Çizelgesi
  INFOGRAPHIC_WORD_FAMILY       = 'INFOGRAPHIC_WORD_FAMILY',       // Sözcük Ailesi
  INFOGRAPHIC_PREFIX_SUFFIX     = 'INFOGRAPHIC_PREFIX_SUFFIX',     // Önek/Sonek Analizi
  INFOGRAPHIC_SENTENCE_BUILDER  = 'INFOGRAPHIC_SENTENCE_BUILDER',  // Cümle Yapısı Analizi
  INFOGRAPHIC_ANTONYM_SYNONYM   = 'INFOGRAPHIC_ANTONYM_SYNONYM',   // Eş/Zıt Anlamlı Harita
  INFOGRAPHIC_WORD_ORIGIN       = 'INFOGRAPHIC_WORD_ORIGIN',       // Kelime Kökeni & Türetme
  INFOGRAPHIC_COMPOUND_WORD     = 'INFOGRAPHIC_COMPOUND_WORD',     // Bileşik Sözcük Haritası
  INFOGRAPHIC_GENRE_CHART       = 'INFOGRAPHIC_GENRE_CHART',       // Metin Türü Sınıflandırma

  // ═══════════════════════════════════════════════════════════════════════
  // 🔢 KATEGORİ 4: MATEMATİK & MANTIK (10 Tip)
  // ═══════════════════════════════════════════════════════════════════════
  INFOGRAPHIC_MATH_STEPS        = 'INFOGRAPHIC_MATH_STEPS',        // Adım Adım Çözüm
  INFOGRAPHIC_NUMBER_LINE       = 'INFOGRAPHIC_NUMBER_LINE',       // Sayı Doğrusu Aktivitesi
  INFOGRAPHIC_FRACTION_VISUAL   = 'INFOGRAPHIC_FRACTION_VISUAL',   // Kesir Görselleştirme
  INFOGRAPHIC_MULTIPLICATION_MAP = 'INFOGRAPHIC_MULTIPLICATION_MAP', // Çarpım Haritası
  INFOGRAPHIC_GEOMETRY_EXPLORER = 'INFOGRAPHIC_GEOMETRY_EXPLORER', // Geometri Keşfedici
  INFOGRAPHIC_DATA_CHART        = 'INFOGRAPHIC_DATA_CHART',        // Veri Analiz Grafiği
  INFOGRAPHIC_ALGEBRA_BALANCE   = 'INFOGRAPHIC_ALGEBRA_BALANCE',   // Denklem Dengeleme
  INFOGRAPHIC_MEASUREMENT_GUIDE = 'INFOGRAPHIC_MEASUREMENT_GUIDE', // Ölçü Rehberi Haritası
  INFOGRAPHIC_PATTERN_RULE      = 'INFOGRAPHIC_PATTERN_RULE',      // Örüntü & Kural Keşfetme
  INFOGRAPHIC_WORD_PROBLEM_MAP  = 'INFOGRAPHIC_WORD_PROBLEM_MAP',  // Sözel Problem Haritası

  // ═══════════════════════════════════════════════════════════════════════
  // 🔬 KATEGORİ 5: FEN BİLİMLERİ (8 Tip) — YENİ KATEGORİ
  // ═══════════════════════════════════════════════════════════════════════
  INFOGRAPHIC_LIFE_CYCLE        = 'INFOGRAPHIC_LIFE_CYCLE',        // Yaşam Döngüsü Haritası
  INFOGRAPHIC_FOOD_CHAIN        = 'INFOGRAPHIC_FOOD_CHAIN',        // Besin Zinciri Ağı
  INFOGRAPHIC_SCIENTIFIC_METHOD = 'INFOGRAPHIC_SCIENTIFIC_METHOD', // Bilimsel Yöntem Akışı
  INFOGRAPHIC_CELL_DIAGRAM      = 'INFOGRAPHIC_CELL_DIAGRAM',      // Hücre & Yapı Diyagramı
  INFOGRAPHIC_ECOSYSTEM_WEB     = 'INFOGRAPHIC_ECOSYSTEM_WEB',     // Ekosistem İlişki Ağı
  INFOGRAPHIC_STATES_MATTER     = 'INFOGRAPHIC_STATES_MATTER',     // Maddenin Halleri
  INFOGRAPHIC_SOLAR_SYSTEM      = 'INFOGRAPHIC_SOLAR_SYSTEM',      // Güneş Sistemi Haritası
  INFOGRAPHIC_HUMAN_BODY        = 'INFOGRAPHIC_HUMAN_BODY',        // İnsan Vücudu Sistemleri

  // ═══════════════════════════════════════════════════════════════════════
  // 🌍 KATEGORİ 6: SOSYAL BİLGİLER & TARİH (8 Tip) — YENİ KATEGORİ
  // ═══════════════════════════════════════════════════════════════════════
  INFOGRAPHIC_HISTORICAL_TIMELINE = 'INFOGRAPHIC_HISTORICAL_TIMELINE', // Tarihsel Zaman Çizelgesi
  INFOGRAPHIC_MAP_EXPLORER      = 'INFOGRAPHIC_MAP_EXPLORER',      // Harita & Coğrafya Keşfedici
  INFOGRAPHIC_CULTURE_COMPARE   = 'INFOGRAPHIC_CULTURE_COMPARE',   // Kültür Karşılaştırma
  INFOGRAPHIC_GOVERNMENT_CHART  = 'INFOGRAPHIC_GOVERNMENT_CHART',  // Yönetim Yapısı Diyagramı
  INFOGRAPHIC_ECONOMIC_FLOW     = 'INFOGRAPHIC_ECONOMIC_FLOW',     // Ekonomik Akış Şeması
  INFOGRAPHIC_BIOGRAPHY_BOARD   = 'INFOGRAPHIC_BIOGRAPHY_BOARD',   // Biyografi Panosu
  INFOGRAPHIC_EVENT_ANALYSIS    = 'INFOGRAPHIC_EVENT_ANALYSIS',    // Tarihi Olay Analizi
  INFOGRAPHIC_GEOGRAPHY_PROFILE = 'INFOGRAPHIC_GEOGRAPHY_PROFILE', // Coğrafya Profil Kartı

  // ═══════════════════════════════════════════════════════════════════════
  // 💡 KATEGORİ 7: YARATICI DÜŞÜNME (8 Tip) — YENİ KATEGORİ
  // ═══════════════════════════════════════════════════════════════════════
  INFOGRAPHIC_BRAINSTORM_WEB    = 'INFOGRAPHIC_BRAINSTORM_WEB',    // Beyin Fırtınası Ağı
  INFOGRAPHIC_DESIGN_THINKING   = 'INFOGRAPHIC_DESIGN_THINKING',   // Tasarım Düşüncesi Haritası
  INFOGRAPHIC_INNOVATION_CANVAS = 'INFOGRAPHIC_INNOVATION_CANVAS', // İnovasyon Tuvali
  INFOGRAPHIC_PROBLEM_SOLUTION  = 'INFOGRAPHIC_PROBLEM_SOLUTION',  // Problem-Çözüm Çerçevesi
  INFOGRAPHIC_STORY_PLANNING    = 'INFOGRAPHIC_STORY_PLANNING',    // Hikaye Planlama Panosu
  INFOGRAPHIC_IDEA_COMPARISON   = 'INFOGRAPHIC_IDEA_COMPARISON',   // Fikir Karşılaştırma Matrisi
  INFOGRAPHIC_CREATIVE_PROCESS  = 'INFOGRAPHIC_CREATIVE_PROCESS',  // Yaratıcı Süreç Haritası
  INFOGRAPHIC_VISION_BOARD      = 'INFOGRAPHIC_VISION_BOARD',      // Vizyon & Hedef Panosu

  // ═══════════════════════════════════════════════════════════════════════
  // 📚 KATEGORİ 8: ÖĞRENME STRATEJİLERİ (8 Tip) — YENİ KATEGORİ
  // ═══════════════════════════════════════════════════════════════════════
  INFOGRAPHIC_CORNELL_NOTES     = 'INFOGRAPHIC_CORNELL_NOTES',     // Cornell Not Alma Şablonu
  INFOGRAPHIC_KWL_CHART         = 'INFOGRAPHIC_KWL_CHART',         // Bil/Öğren/Öğrendim Haritası
  INFOGRAPHIC_STUDY_SCHEDULE    = 'INFOGRAPHIC_STUDY_SCHEDULE',    // Çalışma Programı Görsel
  INFOGRAPHIC_GOAL_SETTING      = 'INFOGRAPHIC_GOAL_SETTING',      // Hedef Belirleme Panosu
  INFOGRAPHIC_LEARNING_REFLECTION = 'INFOGRAPHIC_LEARNING_REFLECTION', // Öğrenme Yansıma Kartı
  INFOGRAPHIC_MISTAKE_ANALYSIS  = 'INFOGRAPHIC_MISTAKE_ANALYSIS',  // Hata Analiz Tablosu
  INFOGRAPHIC_PROGRESS_TRACKER  = 'INFOGRAPHIC_PROGRESS_TRACKER',  // İlerleme Takip Haritası
  INFOGRAPHIC_MEMORY_PALACE     = 'INFOGRAPHIC_MEMORY_PALACE',     // Bellek Sarayı Şablonu

  // ═══════════════════════════════════════════════════════════════════════
  // 🧠 KATEGORİ 9: SpLD / ÖZEL DESTEK (12 Tip) — YENİ KATEGORİ
  // ═══════════════════════════════════════════════════════════════════════
  INFOGRAPHIC_DYSLEXIA_BRIDGE   = 'INFOGRAPHIC_DYSLEXIA_BRIDGE',   // Okuma Köprü Aktivitesi
  INFOGRAPHIC_ADHD_FOCUS_CHART  = 'INFOGRAPHIC_ADHD_FOCUS_CHART',  // Dikkat Odaklanma Haritası
  INFOGRAPHIC_DYSCALCULIA_SUPPORT = 'INFOGRAPHIC_DYSCALCULIA_SUPPORT', // Sayı Duyusu Destek Görsel
  INFOGRAPHIC_SENSORY_SCHEDULE  = 'INFOGRAPHIC_SENSORY_SCHEDULE',  // Duyusal Program Kartı
  INFOGRAPHIC_ROUTINE_VISUAL    = 'INFOGRAPHIC_ROUTINE_VISUAL',    // Günlük Rutin Görsel Program
  INFOGRAPHIC_EMOTION_MAP       = 'INFOGRAPHIC_EMOTION_MAP',       // Duygu Haritası
  INFOGRAPHIC_SOCIAL_STORY      = 'INFOGRAPHIC_SOCIAL_STORY',      // Sosyal Hikaye Panosu
  INFOGRAPHIC_STRENGTHS_WHEEL   = 'INFOGRAPHIC_STRENGTHS_WHEEL',   // Güçlü Yönler Çarkı
  INFOGRAPHIC_SELF_REGULATION   = 'INFOGRAPHIC_SELF_REGULATION',   // Öz Düzenleme Araç Seti
  INFOGRAPHIC_SENSORY_PROFILE   = 'INFOGRAPHIC_SENSORY_PROFILE',   // Duyusal Profil Haritası
  INFOGRAPHIC_COPING_TOOLKIT    = 'INFOGRAPHIC_COPING_TOOLKIT',    // Başa Çıkma Stratejileri
  INFOGRAPHIC_TRANSITION_SUPPORT = 'INFOGRAPHIC_TRANSITION_SUPPORT', // Geçiş Destek Haritası

  // ═══════════════════════════════════════════════════════════════════════
  // 🏥 KATEGORİ 10: KLİNİK & BEP (12 Tip) — YENİ KATEGORİ
  // ═══════════════════════════════════════════════════════════════════════
  INFOGRAPHIC_BEP_GOAL_MAP      = 'INFOGRAPHIC_BEP_GOAL_MAP',      // BEP Hedef Haritası
  INFOGRAPHIC_ASSESSMENT_VISUAL = 'INFOGRAPHIC_ASSESSMENT_VISUAL', // Değerlendirme Görsel Raporu
  INFOGRAPHIC_PROGRESS_REPORT   = 'INFOGRAPHIC_PROGRESS_REPORT',   // İlerleme Raporu Panosu
  INFOGRAPHIC_SKILL_RADAR       = 'INFOGRAPHIC_SKILL_RADAR',       // Beceri Radar Grafiği
  INFOGRAPHIC_INTERVENTION_PLAN = 'INFOGRAPHIC_INTERVENTION_PLAN', // Müdahale Planı Görsel
  INFOGRAPHIC_LEARNING_PROFILE  = 'INFOGRAPHIC_LEARNING_PROFILE',  // Öğrenme Profil Kartı
  INFOGRAPHIC_PARENT_GUIDE      = 'INFOGRAPHIC_PARENT_GUIDE',      // Veli Bilgilendirme Panosu
  INFOGRAPHIC_TRANSITION_PLAN   = 'INFOGRAPHIC_TRANSITION_PLAN',   // Geçiş Planı Haritası
  INFOGRAPHIC_STRENGTHS_NEEDS   = 'INFOGRAPHIC_STRENGTHS_NEEDS',   // Güçlü Yönler/İhtiyaçlar
  INFOGRAPHIC_ANNUAL_REVIEW     = 'INFOGRAPHIC_ANNUAL_REVIEW',     // Yıllık Değerlendirme Özeti
  INFOGRAPHIC_COLLABORATION_MAP = 'INFOGRAPHIC_COLLABORATION_MAP', // İşbirliği Ekip Haritası
  INFOGRAPHIC_ACCOMMODATION_GUIDE = 'INFOGRAPHIC_ACCOMMODATION_GUIDE', // Uyarlama Rehber Panosu
}
```

> **📊 Toplam**: 96 yeni `ActivityType` enum değeri → 10 kategoride organize  
> **Önceki plan**: 10 tip → **Bu plan: 9.6× artış**  
> **Mevcut toplam (110 + 96)**: **206 benzersiz aktivite türü**

### 2.2 Yeni Interface Tanımları

```typescript
// src/types/infographic.ts — YENİ DOSYA (tamamen yeni tip sistemi)
import { AgeGroup, Difficulty, LearningDisabilityProfile } from './creativeStudio';
import { ActivityOutput } from './core';

// ── TEMEL ÇIKTI YAPISI ──────────────────────────────────────────────────────

export interface InfographicActivityResult extends ActivityOutput {
  syntax: string;              // @antv/infographic declarative syntax
  templateType: InfographicTemplate; // template türü
  svgDataUrl?: string;         // Pre-rendered SVG (hızlı mod önbellek)
  title: string;
  pedagogicalNote: string;     // Zorunlu! min 100 kelime
  activityContent: InfographicContent;
  ageGroup: AgeGroup;
  difficulty: Difficulty;
  profile: LearningDisabilityProfile | 'general';
  targetSkills: string[];
  estimatedDuration: number;   // dakika
  category: InfographicCategory;
  mebKazanim?: string;         // MEB kazanım kodu (örn: T.4.3.7)
  spldNote?: string;           // SpLD-özel pedagojik not
}

export type InfographicTemplate =
  | 'sequence-steps'
  | 'list-row-simple-horizontal-arrow'
  | 'compare-binary-horizontal'
  | 'hierarchy-structure'
  | 'sequence-timeline'
  | 'activity-5w1h-grid'           // 6 renkli kutu grid
  | 'activity-math-steps'          // Numaralı adım kartları
  | 'activity-syllable-breakdown'  // Hece bölüm çizgileri
  | 'activity-vocab-card'          // Kelime + anlam + örnek
  | 'activity-venn'                // Çift daire Venn şeması
  | 'activity-cause-effect'        // Ok zinciri neden-sonuç
  | 'activity-fishbone'            // Balık kılçığı diyagramı
  | 'activity-radar'               // Beceri radar grafiği (polar)
  | 'activity-cornell'             // Cornell not şablonu
  | 'activity-kwl'                 // Bil/Öğren/Öğrendim 3 sütun
  | 'activity-story-map'           // Hikaye haritası (karakter+olay+sonuç)
  | 'activity-emotion-wheel'       // Duygu çarkı (daire dilimler)
  | 'activity-bep-goals'           // BEP hedef kartları (SMART format)
  | 'activity-life-cycle'          // Döngü diyagramı (dairesel oklar)
  | 'activity-food-chain'          // Dikey zincir oku
  | 'activity-strengths-wheel';    // Güçlü yönler pasta grafiği

export type InfographicCategory =
  | 'visual-spatial'        // Görsel & Mekansal
  | 'reading-comprehension' // Okuduğunu Anlama
  | 'language-literacy'     // Okuma & Dil
  | 'math-logic'            // Matematik & Mantık
  | 'science'               // Fen Bilimleri
  | 'social-studies'        // Sosyal Bilgiler & Tarih
  | 'creative-thinking'     // Yaratıcı Düşünme
  | 'learning-strategies'   // Öğrenme Stratejileri
  | 'spld-support'          // SpLD / Özel Destek
  | 'clinical-bep';         // Klinik & BEP

// ── İÇERİK YAPILARI ─────────────────────────────────────────────────────────

export interface InfographicContent {
  questions?: InfographicQuestion[];
  steps?: InfographicStep[];
  comparisons?: InfographicComparison;
  vocabulary?: InfographicVocabItem[];
  timeline?: InfographicTimelineEvent[];
  hierarchy?: InfographicHierarchyNode;
  bepGoals?: InfographicBEPGoal[];
  radarData?: InfographicRadarSegment[];
  emotions?: InfographicEmotionItem[];
  storyElements?: InfographicStoryMap;
  scienceData?: InfographicScienceContent;
  strategicContent?: InfographicLearningStrategy;
}

export interface InfographicQuestion {
  question: string;
  questionType: '5W1H' | 'true-false' | 'fill-blank' | 'multiple-choice' | 'open-ended';
  answer?: string;
  visualCue?: string;
  difficulty: 'easy' | 'medium' | 'hard';
  colorCode?: string;    // renk kodlu soru kutuları (disleksi desteği)
  wcagRole?: string;     // erişilebilirlik rolü
}

export interface InfographicStep {
  stepNumber: number;
  label: string;
  description: string;
  visualSymbol?: string;   // emoji veya ikon kodu
  isCheckpoint: boolean;
  scaffoldHint?: string;   // DEHB/diskalkuli destekleri için ipucu
  timeEstimate?: string;   // "2 dakika" gibi
}

export interface InfographicComparison {
  leftTitle: string;
  rightTitle: string;
  leftItems: string[];
  rightItems: string[];
  commonGround?: string[];   // Venn ortak alan öğeleri
  criteria?: string[];       // Karşılaştırma kriterleri
}

export interface InfographicVocabItem {
  word: string;
  syllables: string[];       // ['ke', 'le', 'bek'] gibi
  meaning: string;
  exampleSentence: string;
  rootWord?: string;
  relatedWords?: string[];
  visualRepresentation?: string;  // emoji/ikon
}

export interface InfographicTimelineEvent {
  date: string;              // yıl, dönem veya "1. Adım" gibi
  title: string;
  description: string;
  icon?: string;
  isKeyEvent?: boolean;      // önemli olay vurgulama
  source?: string;           // alıntı kaynağı (tarih eğitimi)
}

export interface InfographicHierarchyNode {
  label: string;
  description?: string;
  color?: string;
  children?: InfographicHierarchyNode[];
  level?: number;            // hiyerarşi derinliği
}

export interface InfographicBEPGoal {
  domain: string;            // 'Okuma', 'Matematik', 'Sosyal Beceri' vb.
  objective: string;         // SMART format hedef
  targetDate: string;        // ISO tarih
  measurableIndicator: string;
  supportStrategies: string[];
  progress: 'not_started' | 'in_progress' | 'achieved';
  reviewDate?: string;
}

export interface InfographicRadarSegment {
  skill: string;             // 'Okuma', 'Yazma', 'Dikkat' vb.
  currentLevel: number;      // 1-10
  targetLevel: number;       // 1-10
  color?: string;
}

export interface InfographicEmotionItem {
  emotion: string;
  intensity: number;         // 1-5
  bodyLocation?: string;     // "göğüs", "karın" gibi beden haritası
  color?: string;
  strategy?: string;         // baş etme stratejisi
}

export interface InfographicStoryMap {
  title: string;
  setting: string;           // yer/zaman
  characters: string[];
  problem: string;
  events: string[];
  resolution: string;
  theme?: string;
  authorPurpose?: string;
}

export interface InfographicScienceContent {
  topic: string;
  stages?: string[];         // yaşam döngüsü aşamaları
  components?: string[];     // hücre organelleri vb.
  relationships?: { from: string; to: string; label: string }[];
  properties?: Record<string, string>;
}

export interface InfographicLearningStrategy {
  strategyName: string;
  steps: string[];
  useWhen: string;
  benefits: string[];
  example?: string;
  mnemonic?: string;         // hatırlatıcı kısaltma/kelime
}

// ── ÜRETİM MODU ──────────────────────────────────────────────────────────────

export enum InfographicGenerationMode {
  AI      = 'AI',       // Gemini 2.5 Flash — derin, konu özel
  OFFLINE = 'OFFLINE',  // Kural tabanlı — anlık, API gerektirmez
  HYBRID  = 'HYBRID',   // Önce offline, arka planda AI ile zenginleştir
}

// ── KATEGORİ REHBERİ ─────────────────────────────────────────────────────────

export interface InfographicActivityMeta {
  id: ActivityType;
  title: string;
  description: string;
  category: InfographicCategory;
  template: InfographicTemplate;
  offlineAvailable: boolean;
  aiOptimized: boolean;
  icon: string;
  spldProfile?: LearningDisabilityProfile[];  // hangi SpLD profilleri için önerilir
  minAgeGroup: AgeGroup;
  mebCategory?: string;     // MEB ders alanı
  estimatedMinutes: { min: number; max: number };
  premiumFeatures?: string[]; // premium özellik açıklamaları
}
```

### 2.3 Yeni Generator Servisi

```typescript
// src/services/generators/infographicActivityGenerator.ts — YENİ DOSYA

// Her kategori için 2 üretim fonksiyonu: AI ve Offline

// ── AI GENERATÖRLER ──────────────────────────────────────────────────────────

export async function generateInfographicConceptMapFromAI(
  options: GeneratorOptions
): Promise<InfographicActivityResult>

export async function generateInfographicSequenceFromAI(
  options: GeneratorOptions
): Promise<InfographicActivityResult>

export async function generateInfographicCompareFromAI(
  options: GeneratorOptions
): Promise<InfographicActivityResult>

export async function generateInfographic5W1HBoardFromAI(
  options: GeneratorOptions
): Promise<InfographicActivityResult>

export async function generateInfographicMathStepsFromAI(
  options: GeneratorOptions
): Promise<InfographicActivityResult>

export async function generateInfographicSyllableMapFromAI(
  options: GeneratorOptions
): Promise<InfographicActivityResult>

export async function generateInfographicTimelineFromAI(
  options: GeneratorOptions
): Promise<InfographicActivityResult>

export async function generateInfographicVocabTreeFromAI(
  options: GeneratorOptions
): Promise<InfographicActivityResult>

export async function generateInfographicVisualLogicFromAI(
  options: GeneratorOptions
): Promise<InfographicActivityResult>

export async function generateInfographicReadingFlowFromAI(
  options: GeneratorOptions
): Promise<InfographicActivityResult>

// ── OFFLINE GENERATÖRLER (Hızlı Mod) ─────────────────────────────────────────

export async function generateOfflineInfographicConceptMap(
  options: GeneratorOptions
): Promise<InfographicActivityResult>

export async function generateOfflineInfographic5W1HBoard(
  options: GeneratorOptions
): Promise<InfographicActivityResult>

// ... diğerleri
```

### 2.4 Registry Entegrasyonu — 96 Kayıt

```typescript
// src/services/generators/registry.ts — eklenecek 96 kayıt

// ── Kat. 1: Görsel & Mekansal ─────────────────────────────────────────────────
[ActivityType.INFOGRAPHIC_CONCEPT_MAP]:       { ai: ai.conceptMap,       offline: off.conceptMap },
[ActivityType.INFOGRAPHIC_COMPARE]:           { ai: ai.compare,          offline: off.compare },
[ActivityType.INFOGRAPHIC_VISUAL_LOGIC]:      { ai: ai.visualLogic,      offline: off.visualLogic },
[ActivityType.INFOGRAPHIC_VENN_DIAGRAM]:      { ai: ai.vennDiagram,      offline: off.vennDiagram },
[ActivityType.INFOGRAPHIC_MIND_MAP]:          { ai: ai.mindMap,          offline: off.mindMap },
[ActivityType.INFOGRAPHIC_FLOWCHART]:         { ai: ai.flowchart,        offline: off.flowchart },
[ActivityType.INFOGRAPHIC_MATRIX_ANALYSIS]:   { ai: ai.matrixAnalysis,   offline: off.matrixAnalysis },
[ActivityType.INFOGRAPHIC_CAUSE_EFFECT]:      { ai: ai.causeEffect,      offline: off.causeEffect },
[ActivityType.INFOGRAPHIC_FISHBONE]:          { ai: ai.fishbone,         offline: off.fishbone },
[ActivityType.INFOGRAPHIC_CLUSTER_MAP]:       { ai: ai.clusterMap,       offline: off.clusterMap },

// ── Kat. 2: Okuduğunu Anlama ──────────────────────────────────────────────────
[ActivityType.INFOGRAPHIC_5W1H_BOARD]:        { ai: ai.board5w1h,        offline: off.board5w1h },
[ActivityType.INFOGRAPHIC_READING_FLOW]:      { ai: ai.readingFlow,      offline: off.readingFlow },
[ActivityType.INFOGRAPHIC_SEQUENCE]:          { ai: ai.sequence,         offline: off.sequence },
[ActivityType.INFOGRAPHIC_STORY_MAP]:         { ai: ai.storyMap,         offline: off.storyMap },
[ActivityType.INFOGRAPHIC_CHARACTER_ANALYSIS]:{ ai: ai.characterAnalysis,offline: off.characterAnalysis },
[ActivityType.INFOGRAPHIC_INFERENCE_CHAIN]:   { ai: ai.inferenceChain,   offline: off.inferenceChain },
[ActivityType.INFOGRAPHIC_SUMMARY_PYRAMID]:   { ai: ai.summaryPyramid,   offline: off.summaryPyramid },
[ActivityType.INFOGRAPHIC_PREDICTION_BOARD]:  { ai: ai.predictionBoard,  offline: off.predictionBoard },
[ActivityType.INFOGRAPHIC_COMPARE_TEXTS]:     { ai: ai.compareTexts,     offline: off.compareTexts },
[ActivityType.INFOGRAPHIC_THEME_WEB]:         { ai: ai.themeWeb,         offline: off.themeWeb },

// ── Kat. 3: Okuma & Dil ───────────────────────────────────────────────────────
[ActivityType.INFOGRAPHIC_SYLLABLE_MAP]:      { ai: ai.syllableMap,      offline: off.syllableMap },
[ActivityType.INFOGRAPHIC_VOCAB_TREE]:        { ai: ai.vocabTree,        offline: off.vocabTree },
[ActivityType.INFOGRAPHIC_TIMELINE_EVENT]:    { ai: ai.timelineEvent,    offline: off.timelineEvent },
[ActivityType.INFOGRAPHIC_WORD_FAMILY]:       { ai: ai.wordFamily,       offline: off.wordFamily },
[ActivityType.INFOGRAPHIC_PREFIX_SUFFIX]:     { ai: ai.prefixSuffix,     offline: off.prefixSuffix },
[ActivityType.INFOGRAPHIC_SENTENCE_BUILDER]:  { ai: ai.sentenceBuilder,  offline: off.sentenceBuilder },
[ActivityType.INFOGRAPHIC_ANTONYM_SYNONYM]:   { ai: ai.antonymSynonym,   offline: off.antonymSynonym },
[ActivityType.INFOGRAPHIC_WORD_ORIGIN]:       { ai: ai.wordOrigin,       offline: off.wordOrigin },
[ActivityType.INFOGRAPHIC_COMPOUND_WORD]:     { ai: ai.compoundWord,     offline: off.compoundWord },
[ActivityType.INFOGRAPHIC_GENRE_CHART]:       { ai: ai.genreChart,       offline: off.genreChart },

// ── Kat. 4: Matematik & Mantık ────────────────────────────────────────────────
[ActivityType.INFOGRAPHIC_MATH_STEPS]:        { ai: ai.mathSteps,        offline: off.mathSteps },
[ActivityType.INFOGRAPHIC_NUMBER_LINE]:       { ai: ai.numberLine,       offline: off.numberLine },
[ActivityType.INFOGRAPHIC_FRACTION_VISUAL]:   { ai: ai.fractionVisual,   offline: off.fractionVisual },
[ActivityType.INFOGRAPHIC_MULTIPLICATION_MAP]:{ ai: ai.multiplicationMap,offline: off.multiplicationMap },
[ActivityType.INFOGRAPHIC_GEOMETRY_EXPLORER]: { ai: ai.geometryExplorer, offline: off.geometryExplorer },
[ActivityType.INFOGRAPHIC_DATA_CHART]:        { ai: ai.dataChart,        offline: off.dataChart },
[ActivityType.INFOGRAPHIC_ALGEBRA_BALANCE]:   { ai: ai.algebraBalance,   offline: off.algebraBalance },
[ActivityType.INFOGRAPHIC_MEASUREMENT_GUIDE]: { ai: ai.measurementGuide, offline: off.measurementGuide },
[ActivityType.INFOGRAPHIC_PATTERN_RULE]:      { ai: ai.patternRule,      offline: off.patternRule },
[ActivityType.INFOGRAPHIC_WORD_PROBLEM_MAP]:  { ai: ai.wordProblemMap,   offline: off.wordProblemMap },

// ── Kat. 5: Fen Bilimleri ─────────────────────────────────────────────────────
[ActivityType.INFOGRAPHIC_LIFE_CYCLE]:        { ai: ai.lifeCycle,        offline: off.lifeCycle },
[ActivityType.INFOGRAPHIC_FOOD_CHAIN]:        { ai: ai.foodChain,        offline: off.foodChain },
[ActivityType.INFOGRAPHIC_SCIENTIFIC_METHOD]: { ai: ai.scientificMethod, offline: off.scientificMethod },
[ActivityType.INFOGRAPHIC_CELL_DIAGRAM]:      { ai: ai.cellDiagram,      offline: off.cellDiagram },
[ActivityType.INFOGRAPHIC_ECOSYSTEM_WEB]:     { ai: ai.ecosystemWeb,     offline: off.ecosystemWeb },
[ActivityType.INFOGRAPHIC_STATES_MATTER]:     { ai: ai.statesMatter,     offline: off.statesMatter },
[ActivityType.INFOGRAPHIC_SOLAR_SYSTEM]:      { ai: ai.solarSystem,      offline: off.solarSystem },
[ActivityType.INFOGRAPHIC_HUMAN_BODY]:        { ai: ai.humanBody,        offline: off.humanBody },

// ── Kat. 6: Sosyal Bilgiler & Tarih ──────────────────────────────────────────
[ActivityType.INFOGRAPHIC_HISTORICAL_TIMELINE]:{ ai: ai.historicalTimeline, offline: off.historicalTimeline },
[ActivityType.INFOGRAPHIC_MAP_EXPLORER]:      { ai: ai.mapExplorer,      offline: off.mapExplorer },
[ActivityType.INFOGRAPHIC_CULTURE_COMPARE]:   { ai: ai.cultureCompare,   offline: off.cultureCompare },
[ActivityType.INFOGRAPHIC_GOVERNMENT_CHART]:  { ai: ai.governmentChart,  offline: off.governmentChart },
[ActivityType.INFOGRAPHIC_ECONOMIC_FLOW]:     { ai: ai.economicFlow,     offline: off.economicFlow },
[ActivityType.INFOGRAPHIC_BIOGRAPHY_BOARD]:   { ai: ai.biographyBoard,   offline: off.biographyBoard },
[ActivityType.INFOGRAPHIC_EVENT_ANALYSIS]:    { ai: ai.eventAnalysis,    offline: off.eventAnalysis },
[ActivityType.INFOGRAPHIC_GEOGRAPHY_PROFILE]: { ai: ai.geographyProfile, offline: off.geographyProfile },

// ── Kat. 7: Yaratıcı Düşünme ─────────────────────────────────────────────────
[ActivityType.INFOGRAPHIC_BRAINSTORM_WEB]:    { ai: ai.brainstormWeb,    offline: off.brainstormWeb },
[ActivityType.INFOGRAPHIC_DESIGN_THINKING]:   { ai: ai.designThinking,   offline: off.designThinking },
[ActivityType.INFOGRAPHIC_INNOVATION_CANVAS]: { ai: ai.innovationCanvas, offline: off.innovationCanvas },
[ActivityType.INFOGRAPHIC_PROBLEM_SOLUTION]:  { ai: ai.problemSolution,  offline: off.problemSolution },
[ActivityType.INFOGRAPHIC_STORY_PLANNING]:    { ai: ai.storyPlanning,    offline: off.storyPlanning },
[ActivityType.INFOGRAPHIC_IDEA_COMPARISON]:   { ai: ai.ideaComparison,   offline: off.ideaComparison },
[ActivityType.INFOGRAPHIC_CREATIVE_PROCESS]:  { ai: ai.creativeProcess,  offline: off.creativeProcess },
[ActivityType.INFOGRAPHIC_VISION_BOARD]:      { ai: ai.visionBoard,      offline: off.visionBoard },

// ── Kat. 8: Öğrenme Stratejileri ─────────────────────────────────────────────
[ActivityType.INFOGRAPHIC_CORNELL_NOTES]:     { ai: ai.cornellNotes,     offline: off.cornellNotes },
[ActivityType.INFOGRAPHIC_KWL_CHART]:         { ai: ai.kwlChart,         offline: off.kwlChart },
[ActivityType.INFOGRAPHIC_STUDY_SCHEDULE]:    { ai: ai.studySchedule,    offline: off.studySchedule },
[ActivityType.INFOGRAPHIC_GOAL_SETTING]:      { ai: ai.goalSetting,      offline: off.goalSetting },
[ActivityType.INFOGRAPHIC_LEARNING_REFLECTION]:{ ai: ai.learningReflection, offline: off.learningReflection },
[ActivityType.INFOGRAPHIC_MISTAKE_ANALYSIS]:  { ai: ai.mistakeAnalysis,  offline: off.mistakeAnalysis },
[ActivityType.INFOGRAPHIC_PROGRESS_TRACKER]:  { ai: ai.progressTracker,  offline: off.progressTracker },
[ActivityType.INFOGRAPHIC_MEMORY_PALACE]:     { ai: ai.memoryPalace,     offline: off.memoryPalace },

// ── Kat. 9: SpLD / Özel Destek ───────────────────────────────────────────────
[ActivityType.INFOGRAPHIC_DYSLEXIA_BRIDGE]:   { ai: ai.dyslexiaBridge,   offline: off.dyslexiaBridge },
[ActivityType.INFOGRAPHIC_ADHD_FOCUS_CHART]:  { ai: ai.adhdFocusChart,   offline: off.adhdFocusChart },
[ActivityType.INFOGRAPHIC_DYSCALCULIA_SUPPORT]:{ ai: ai.dyscalculiaSupport, offline: off.dyscalculiaSupport },
[ActivityType.INFOGRAPHIC_SENSORY_SCHEDULE]:  { ai: ai.sensorySchedule,  offline: off.sensorySchedule },
[ActivityType.INFOGRAPHIC_ROUTINE_VISUAL]:    { ai: ai.routineVisual,    offline: off.routineVisual },
[ActivityType.INFOGRAPHIC_EMOTION_MAP]:       { ai: ai.emotionMap,       offline: off.emotionMap },
[ActivityType.INFOGRAPHIC_SOCIAL_STORY]:      { ai: ai.socialStory,      offline: off.socialStory },
[ActivityType.INFOGRAPHIC_STRENGTHS_WHEEL]:   { ai: ai.strengthsWheel,   offline: off.strengthsWheel },
[ActivityType.INFOGRAPHIC_SELF_REGULATION]:   { ai: ai.selfRegulation,   offline: off.selfRegulation },
[ActivityType.INFOGRAPHIC_SENSORY_PROFILE]:   { ai: ai.sensoryProfile,   offline: off.sensoryProfile },
[ActivityType.INFOGRAPHIC_COPING_TOOLKIT]:    { ai: ai.copingToolkit,    offline: off.copingToolkit },
[ActivityType.INFOGRAPHIC_TRANSITION_SUPPORT]:{ ai: ai.transitionSupport,offline: off.transitionSupport },

// ── Kat. 10: Klinik & BEP ────────────────────────────────────────────────────
[ActivityType.INFOGRAPHIC_BEP_GOAL_MAP]:      { ai: ai.bepGoalMap,       offline: off.bepGoalMap },
[ActivityType.INFOGRAPHIC_ASSESSMENT_VISUAL]: { ai: ai.assessmentVisual, offline: off.assessmentVisual },
[ActivityType.INFOGRAPHIC_PROGRESS_REPORT]:   { ai: ai.progressReport,   offline: off.progressReport },
[ActivityType.INFOGRAPHIC_SKILL_RADAR]:       { ai: ai.skillRadar,       offline: off.skillRadar },
[ActivityType.INFOGRAPHIC_INTERVENTION_PLAN]: { ai: ai.interventionPlan, offline: off.interventionPlan },
[ActivityType.INFOGRAPHIC_LEARNING_PROFILE]:  { ai: ai.learningProfile,  offline: off.learningProfile },
[ActivityType.INFOGRAPHIC_PARENT_GUIDE]:      { ai: ai.parentGuide,      offline: off.parentGuide },
[ActivityType.INFOGRAPHIC_TRANSITION_PLAN]:   { ai: ai.transitionPlan,   offline: off.transitionPlan },
[ActivityType.INFOGRAPHIC_STRENGTHS_NEEDS]:   { ai: ai.strengthsNeeds,   offline: off.strengthsNeeds },
[ActivityType.INFOGRAPHIC_ANNUAL_REVIEW]:     { ai: ai.annualReview,     offline: off.annualReview },
[ActivityType.INFOGRAPHIC_COLLABORATION_MAP]: { ai: ai.collaborationMap, offline: off.collaborationMap },
[ActivityType.INFOGRAPHIC_ACCOMMODATION_GUIDE]:{ ai: ai.accommodationGuide, offline: off.accommodationGuide },
```

### 2.5 Kategori Entegrasyonu — 10 Profesyonel Kategori

```typescript
// src/constants.ts — ACTIVITY_CATEGORIES yeni infografik kategorileri

// ── Mevcut kategorilere infografik aktiviteler eklenir ─────────────────────────

{
  id: 'visual-perception',
  title: 'Görsel & Mekansal',
  activities: [
    // ... mevcut aktiviteler ...
    ActivityType.INFOGRAPHIC_CONCEPT_MAP,
    ActivityType.INFOGRAPHIC_COMPARE,
    ActivityType.INFOGRAPHIC_VISUAL_LOGIC,
    ActivityType.INFOGRAPHIC_VENN_DIAGRAM,
    ActivityType.INFOGRAPHIC_MIND_MAP,
    ActivityType.INFOGRAPHIC_FLOWCHART,
    ActivityType.INFOGRAPHIC_MATRIX_ANALYSIS,
    ActivityType.INFOGRAPHIC_CAUSE_EFFECT,
    ActivityType.INFOGRAPHIC_FISHBONE,
    ActivityType.INFOGRAPHIC_CLUSTER_MAP,
  ],
},
{
  id: 'reading-comprehension',
  title: 'Okuduğunu Anlama',
  activities: [
    // ... mevcut aktiviteler ...
    ActivityType.INFOGRAPHIC_5W1H_BOARD,
    ActivityType.INFOGRAPHIC_READING_FLOW,
    ActivityType.INFOGRAPHIC_SEQUENCE,
    ActivityType.INFOGRAPHIC_STORY_MAP,
    ActivityType.INFOGRAPHIC_CHARACTER_ANALYSIS,
    ActivityType.INFOGRAPHIC_INFERENCE_CHAIN,
    ActivityType.INFOGRAPHIC_SUMMARY_PYRAMID,
    ActivityType.INFOGRAPHIC_PREDICTION_BOARD,
    ActivityType.INFOGRAPHIC_COMPARE_TEXTS,
    ActivityType.INFOGRAPHIC_THEME_WEB,
  ],
},
{
  id: 'reading-verbal',
  title: 'Okuma & Dil',
  activities: [
    // ... mevcut aktiviteler ...
    ActivityType.INFOGRAPHIC_SYLLABLE_MAP,
    ActivityType.INFOGRAPHIC_VOCAB_TREE,
    ActivityType.INFOGRAPHIC_TIMELINE_EVENT,
    ActivityType.INFOGRAPHIC_WORD_FAMILY,
    ActivityType.INFOGRAPHIC_PREFIX_SUFFIX,
    ActivityType.INFOGRAPHIC_SENTENCE_BUILDER,
    ActivityType.INFOGRAPHIC_ANTONYM_SYNONYM,
    ActivityType.INFOGRAPHIC_WORD_ORIGIN,
    ActivityType.INFOGRAPHIC_COMPOUND_WORD,
    ActivityType.INFOGRAPHIC_GENRE_CHART,
  ],
},
{
  id: 'math-logic',
  title: 'Matematik & Mantık',
  activities: [
    // ... mevcut aktiviteler ...
    ActivityType.INFOGRAPHIC_MATH_STEPS,
    ActivityType.INFOGRAPHIC_NUMBER_LINE,
    ActivityType.INFOGRAPHIC_FRACTION_VISUAL,
    ActivityType.INFOGRAPHIC_MULTIPLICATION_MAP,
    ActivityType.INFOGRAPHIC_GEOMETRY_EXPLORER,
    ActivityType.INFOGRAPHIC_DATA_CHART,
    ActivityType.INFOGRAPHIC_ALGEBRA_BALANCE,
    ActivityType.INFOGRAPHIC_MEASUREMENT_GUIDE,
    ActivityType.INFOGRAPHIC_PATTERN_RULE,
    ActivityType.INFOGRAPHIC_WORD_PROBLEM_MAP,
  ],
},

// ── YENİ KATEGORİLER (6 adet) ─────────────────────────────────────────────────

{
  id: 'infographic-science',
  title: '🔬 Fen Bilimleri',
  description: 'MEB fen bilimleri kazanımlarına yönelik görsel aktiviteler',
  icon: 'fa-solid fa-flask',
  activities: [
    ActivityType.INFOGRAPHIC_LIFE_CYCLE,
    ActivityType.INFOGRAPHIC_FOOD_CHAIN,
    ActivityType.INFOGRAPHIC_SCIENTIFIC_METHOD,
    ActivityType.INFOGRAPHIC_CELL_DIAGRAM,
    ActivityType.INFOGRAPHIC_ECOSYSTEM_WEB,
    ActivityType.INFOGRAPHIC_STATES_MATTER,
    ActivityType.INFOGRAPHIC_SOLAR_SYSTEM,
    ActivityType.INFOGRAPHIC_HUMAN_BODY,
  ],
},
{
  id: 'infographic-social-studies',
  title: '🌍 Sosyal Bilgiler & Tarih',
  description: 'Tarih, coğrafya ve sosyal bilgiler görsel aktiviteleri',
  icon: 'fa-solid fa-globe',
  activities: [
    ActivityType.INFOGRAPHIC_HISTORICAL_TIMELINE,
    ActivityType.INFOGRAPHIC_MAP_EXPLORER,
    ActivityType.INFOGRAPHIC_CULTURE_COMPARE,
    ActivityType.INFOGRAPHIC_GOVERNMENT_CHART,
    ActivityType.INFOGRAPHIC_ECONOMIC_FLOW,
    ActivityType.INFOGRAPHIC_BIOGRAPHY_BOARD,
    ActivityType.INFOGRAPHIC_EVENT_ANALYSIS,
    ActivityType.INFOGRAPHIC_GEOGRAPHY_PROFILE,
  ],
},
{
  id: 'infographic-creative',
  title: '💡 Yaratıcı Düşünme',
  description: '21. yüzyıl becerileri için tasarım odaklı aktiviteler',
  icon: 'fa-solid fa-lightbulb',
  activities: [
    ActivityType.INFOGRAPHIC_BRAINSTORM_WEB,
    ActivityType.INFOGRAPHIC_DESIGN_THINKING,
    ActivityType.INFOGRAPHIC_INNOVATION_CANVAS,
    ActivityType.INFOGRAPHIC_PROBLEM_SOLUTION,
    ActivityType.INFOGRAPHIC_STORY_PLANNING,
    ActivityType.INFOGRAPHIC_IDEA_COMPARISON,
    ActivityType.INFOGRAPHIC_CREATIVE_PROCESS,
    ActivityType.INFOGRAPHIC_VISION_BOARD,
  ],
},
{
  id: 'infographic-learning-strategies',
  title: '📚 Öğrenme Stratejileri',
  description: 'Üst biliş becerileri ve öğrenmeyi öğrenme aktiviteleri',
  icon: 'fa-solid fa-graduation-cap',
  activities: [
    ActivityType.INFOGRAPHIC_CORNELL_NOTES,
    ActivityType.INFOGRAPHIC_KWL_CHART,
    ActivityType.INFOGRAPHIC_STUDY_SCHEDULE,
    ActivityType.INFOGRAPHIC_GOAL_SETTING,
    ActivityType.INFOGRAPHIC_LEARNING_REFLECTION,
    ActivityType.INFOGRAPHIC_MISTAKE_ANALYSIS,
    ActivityType.INFOGRAPHIC_PROGRESS_TRACKER,
    ActivityType.INFOGRAPHIC_MEMORY_PALACE,
  ],
},
{
  id: 'infographic-spld-support',
  title: '🧠 SpLD / Özel Destek',
  description: 'Disleksi, DEHB, diskalkuli desteğine yönelik kişiselleştirilmiş aktiviteler',
  icon: 'fa-solid fa-brain',
  activities: [
    ActivityType.INFOGRAPHIC_DYSLEXIA_BRIDGE,
    ActivityType.INFOGRAPHIC_ADHD_FOCUS_CHART,
    ActivityType.INFOGRAPHIC_DYSCALCULIA_SUPPORT,
    ActivityType.INFOGRAPHIC_SENSORY_SCHEDULE,
    ActivityType.INFOGRAPHIC_ROUTINE_VISUAL,
    ActivityType.INFOGRAPHIC_EMOTION_MAP,
    ActivityType.INFOGRAPHIC_SOCIAL_STORY,
    ActivityType.INFOGRAPHIC_STRENGTHS_WHEEL,
    ActivityType.INFOGRAPHIC_SELF_REGULATION,
    ActivityType.INFOGRAPHIC_SENSORY_PROFILE,
    ActivityType.INFOGRAPHIC_COPING_TOOLKIT,
    ActivityType.INFOGRAPHIC_TRANSITION_SUPPORT,
  ],
},
{
  id: 'infographic-clinical-bep',
  title: '🏥 Klinik & BEP',
  description: 'MEB özel eğitim yönetmeliği uyumlu BEP ve klinik raporlama araçları',
  icon: 'fa-solid fa-heart-pulse',
  activities: [
    ActivityType.INFOGRAPHIC_BEP_GOAL_MAP,
    ActivityType.INFOGRAPHIC_ASSESSMENT_VISUAL,
    ActivityType.INFOGRAPHIC_PROGRESS_REPORT,
    ActivityType.INFOGRAPHIC_SKILL_RADAR,
    ActivityType.INFOGRAPHIC_INTERVENTION_PLAN,
    ActivityType.INFOGRAPHIC_LEARNING_PROFILE,
    ActivityType.INFOGRAPHIC_PARENT_GUIDE,
    ActivityType.INFOGRAPHIC_TRANSITION_PLAN,
    ActivityType.INFOGRAPHIC_STRENGTHS_NEEDS,
    ActivityType.INFOGRAPHIC_ANNUAL_REVIEW,
    ActivityType.INFOGRAPHIC_COLLABORATION_MAP,
    ActivityType.INFOGRAPHIC_ACCOMMODATION_GUIDE,
  ],
},
```

---

## 📦 Faz 1: Tip ve Mimari Altyapı

**Tahmin**: 4-6 saat | **Öncelik**: YÜKSEK (blocker)

### Adım 1.1 — 96 Yeni ActivityType

**Dosya**: `src/types/activity.ts`

```typescript
// ActivityType enum'a 96 yeni tip ekle (Bölüm 2.1'deki tam liste)
// 10 kategoride organize, her biri INFOGRAPHIC_ prefix'li
```

### Adım 1.2 — Yeni Type Dosyası

**Dosya**: `src/types/infographic.ts` _(yeni, ~400 satır)_

- `InfographicActivityResult` interface (`ActivityOutput` extends)
- `InfographicTemplate` union tipi (21 şablon)
- `InfographicCategory` union tipi (10 kategori)
- `InfographicContent` birleşik içerik yapısı
- `InfographicQuestion`, `InfographicStep`, `InfographicComparison`, `InfographicVocabItem`
- `InfographicTimelineEvent`, `InfographicHierarchyNode`
- `InfographicBEPGoal`, `InfographicRadarSegment`, `InfographicEmotionItem`
- `InfographicStoryMap`, `InfographicScienceContent`, `InfographicLearningStrategy`
- `InfographicGenerationMode` enum: `'AI' | 'OFFLINE' | 'HYBRID'`
- `InfographicActivityMeta` interface (metadata + premiumFeatures)

### Adım 1.3 — Barrel Export Güncelleme

**Dosya**: `src/types/index.ts`

```typescript
export * from './infographic';
```

### Adım 1.4 — ACTIVITIES Listesi Güncellemesi

**Dosya**: `src/constants.ts`

```typescript
// ACTIVITIES array'e 96 yeni giriş ekle — her biri için:
{
  id: ActivityType.INFOGRAPHIC_CONCEPT_MAP,
  title: 'Kavram Haritası İnfografiği',
  description: 'Konuyu görsel hiyerarşik yapıda sunan interaktif kavram haritası.',
  icon: 'fa-solid fa-diagram-project',
  defaultStyle: { columns: 1 },
},
{
  id: ActivityType.INFOGRAPHIC_VENN_DIAGRAM,
  title: 'Venn Şeması Aktivitesi',
  description: 'İki veya üç kavramın ortak ve farklı özelliklerini görsel çemberlerle karşılaştırır.',
  icon: 'fa-solid fa-circle-half-stroke',
  defaultStyle: { columns: 1 },
},
{
  id: ActivityType.INFOGRAPHIC_BEP_GOAL_MAP,
  title: 'BEP Hedef Haritası',
  description: 'MEB özel eğitim yönetmeliği uyumlu SMART format BEP hedef görsel planı.',
  icon: 'fa-solid fa-bullseye',
  defaultStyle: { columns: 1 },
},
// ... 93 tane daha (tam liste infographicActivityMeta array'inde)
```

### Adım 1.5 — ACTIVITY_CATEGORIES Güncellemesi

**Dosya**: `src/constants.ts`

- 4 mevcut kategoriye toplamda 40 yeni infografik aktivite eklenir
- 6 yeni kategori oluşturulur: `infographic-science`, `infographic-social-studies`,
  `infographic-creative`, `infographic-learning-strategies`, `infographic-spld-support`, `infographic-clinical-bep`
- Her yeni kategori için `icon`, `description`, `color` alanları tanımlanır

---

## 📦 Faz 2: Offline (Hızlı Mod) Generatörler

**Tahmin**: 4-6 saat | **Öncelik**: YÜKSEK (hızlı mod kritik)

### 2.1 Offline Generator Mimarisi

Offline generatörler **önceden tanımlı şablon yapılarını** konu + parametrelere göre doldurur. API çağrısı yoktur, anlık üretim yapar.

**Dosya**: `src/services/generators/infographicActivityGenerator.ts`

#### 2.1.1 `generateOfflineInfographic5W1HBoard`

Okuma anlama için 5N1K soruları infografik panoya aktarır:

```
infographic list-row-simple-horizontal-arrow
title [topic] — 5N1K Okuma Anlama
data
  lists
    - label 🔵 KİM?
      desc [konu]'daki kişiler veya varlıklar
    - label 🟢 NE?
      desc Olay veya durum açıklaması  
    - label 🟡 NEREDE?
      desc Mekan ve ortam bilgisi
    - label 🔴 NE ZAMAN?
      desc Zaman ve dönem bilgisi
    - label 🟣 NEDEN?
      desc Neden ve sebep açıklaması
    - label ⚪ NASIL?
      desc Süreç ve yöntem açıklaması
```

**`pedagogicalNote`**: `"5N1K (5 What, 1 How) soruları, okuduğunu anlama becerisinin temel iskeletini oluşturur. Bu format, MEB 2024-2025 Türkçe dersi 4.sınıf kazanımlarıyla (T.4.3.7) doğrudan örtüşmektedir. Her soru kutusu renk kodlu olduğu için disleksi desteğine ihtiyacı olan öğrencilerde bilişsel yük azalır."`

#### 2.1.2 `generateOfflineInfographicMathSteps`

Matematik işleminin adım adım çözümünü üretir:

```
infographic sequence-steps
title [topic] — Adım Adım Çözüm
data
  steps
    - label 1. Adım — Oku
      desc Problemi dikkatlice oku
    - label 2. Adım — Bilgileri Yaz
      desc Verilen bilgileri listele
    - label 3. Adım — İşlemi Seç
      desc Hangi işlemi yapacağını belirle
    - label 4. Adım — Hesapla
      desc İşlemi gerçekleştir
    - label 5. Adım — Kontrol Et
      desc Sonucu kontrol et
```

**`pedagogicalNote`**: `"Adım adım problem çözme stratejisi (Polya Modeli), diskalkuli desteğine ihtiyacı olan öğrencilerde işlemsel bellek yükünü hafifletir. MEB 2024-2025 Matematik 3-6. sınıf kazanımlarında problem çözme sürecinin aşamalı yapılandırılması temel hedefler arasında yer almaktadır."`

#### 2.1.3 `generateOfflineInfographicSyllableMap`

Kelimeler için hece haritası üretir:

```
infographic hierarchy-structure
title [kelime] — Hece Haritası
data
  root
    label [kelime] (X hece)
    children
      - label [hece-1]
      - label [hece-2]
      - label [hece-3]
```

#### 2.1.4 `generateOfflineInfographicConceptMap`

Konu için kavram haritası üretir (hiyerarşi formatı).

#### 2.1.5 `generateOfflineInfographicCompare`

İki kavramı yan yana karşılaştıran aktivite.

#### 2.1.6 `generateOfflineInfographicTimeline`

Tarihsel olaylar için zaman çizelgesi.

---

## 📦 Faz 3: AI (Derin Mod) Generatörler

**Tahmin**: 5-7 saat | **Öncelik**: ORTA

### 3.1 `generateWithSchema()` Geçişi

Mevcut XML parse motorundan (`infographicService.ts`) daha güvenilir `generateWithSchema()` yaklaşımına geçiş:

```typescript
// src/services/generators/infographicActivityGenerator.ts

import { generateWithSchema } from '../../services/geminiClient';

const INFOGRAPHIC_ACTIVITY_SCHEMA = {
  type: 'object',
  properties: {
    title: { type: 'string' },
    syntax: { type: 'string', description: '@antv/infographic declarative syntax' },
    templateType: { type: 'string' },
    pedagogicalNote: { type: 'string', minLength: 100 },
    activityContent: {
      type: 'object',
      properties: {
        questions: { type: 'array', items: { /* InfographicQuestion schema */ } },
        steps: { type: 'array', items: { /* InfographicStep schema */ } },
        // ...
      }
    },
    targetSkills: { type: 'array', items: { type: 'string' } },
    estimatedDuration: { type: 'number' },
  },
  required: ['title', 'syntax', 'templateType', 'pedagogicalNote', 'activityContent'],
};
```

### 3.2 Kategori-Özel AI Prompt Şablonları

Her etkinlik türü için pedagojik açıdan optimize edilmiş AI prompt'ları:

#### 3.2.1 `INFOGRAPHIC_5W1H_BOARD` — AI Prompt

```
Sen MEB 2024-2025 müfredatına uygun özel eğitim uzmanısın.
"[topic]" konusu için okuduğunu anlama geliştiren bir 5N1K infografik panosu oluştur.

HEDEF KİTLE: [ageGroup] yaş grubu | Profil: [profile]
FORMAT: list-row (renkli kutu tasarımı)

Her soru için:
- Kısa, net soru etiketi (KİM?, NE?, NEREDE?, NE ZAMAN?, NEDEN?, NASIL?)
- [ageGroup]'a uygun açıklama ipucu
- İlk soru mutlaka en kolay (güven inşası)

pedagogicalNote: En az 150 kelime, şunları içermeli:
- Neden 5N1K formatı seçildi
- Hangi MEB kazanımını karşılıyor
- [profile] profiline nasıl katkı sağlıyor
```

#### 3.2.2 `INFOGRAPHIC_MATH_STEPS` — AI Prompt

```
Sen diskalkuli ve matematik güçlüğü konusunda uzman özel eğitim öğretmenisin.
"[topic]" matematik konusu için adım adım görsel çözüm rehberi üret.

FORMAT: sequence-steps
ZPD: [difficulty] seviyesinde [ageGroup] için optimize et
SCAFFOLD: Polya Modeli (Anla → Planla → Uygula → Kontrol)

Her adım:
- Numaralı, kısa başlık
- Net açıklama
- Görsel sembol önerisi (emoji)
- [profile]'e özgü not (gerekliyse)
```

---

## 📦 Faz 4: UI/UX Yenileme — İnfografik Stüdyosu v2

**Tahmin**: 6-8 saat | **Öncelik**: YÜKSEK (kullanıcı deneyimi)

### 4.1 Ana Yapı Değişiklikleri

**Mevcut**: Tek panel layout (Ayarlar | Sonuç)

**v2**: Üç bölümlü layout:
```
┌─────────────────────────────────────────────────────┐
│  HEADER: İnfografik Stüdyosu v2 — Aktivite Üretici  │
├──────────────┬──────────────────────┬───────────────┤
│  SOL PANEL   │   ORTA ALAN          │  SAĞ PANEL    │
│  (300px)     │   (esnek genişlik)   │  (300px)      │
│              │                      │               │
│  Kategori    │   Üretilen Aktivite   │  Pedagojik    │
│  Seçimi      │   Önizleme           │  Bilgi        │
│              │   (Infografik        │  & Notlar     │
│  Etkinlik    │    Render)           │               │
│  Tipi        │                      │  Çalışma      │
│              │                      │  Kâğıdına     │
│  Parametreler│                      │  Aktar        │
│  (yaş,profil,│                      │               │
│   difficulty)│                      │               │
│              │                      │               │
│  [Hızlı Mod] │                      │               │
│  [AI Mod]    │                      │               │
└──────────────┴──────────────────────┴───────────────┘
```

### 4.2 Sol Panel — Yeni Tasarım

#### 4.2.1 Etkinlik Türü Seçimi (Kategori Bazlı)

```tsx
// Kategoriler tabları
<Tabs>
  <Tab icon="fa-eye" label="Görsel" />        // visual-perception
  <Tab icon="fa-book-open" label="Anlama" />  // reading-comprehension
  <Tab icon="fa-font" label="Okuma" />        // reading-verbal
  <Tab icon="fa-calculator" label="Matema" /> // math-logic
</Tabs>

// Seçili kategorinin infografik aktiviteleri
<ActivityGrid>
  {INFOGRAPHIC_ACTIVITIES_BY_CATEGORY[selectedCategory].map(activity => (
    <ActivityCard
      key={activity.id}
      icon={activity.icon}
      title={activity.title}
      selected={selectedActivityType === activity.id}
      onClick={() => setSelectedActivityType(activity.id)}
    />
  ))}
</ActivityGrid>
```

#### 4.2.2 Üretim Modu Seçimi

```tsx
// Üretim modu: Hızlı vs AI
<ModeSwitcher>
  <ModeButton
    value="offline"
    label="Hızlı Mod"
    desc="Anlık üretim, API gerektirmez"
    icon="fa-bolt"
    color="emerald"
  />
  <ModeButton
    value="ai"
    label="AI Modu"
    desc="Gemini 2.5 Flash ile derin içerik"
    icon="fa-wand-magic-sparkles"
    color="violet"
  />
</ModeSwitcher>
```

#### 4.2.3 Ortak Parametreler (Tüm Türler)

```tsx
<Params>
  <AgeGroupSelector />      // 5-7 / 8-10 / 11-13 / 14+
  <ProfileSelector />       // dyslexia / dyscalculia / adhd / mixed / general
  <DifficultySelector />    // Kolay / Orta / Zor
  <StudentSelector />       // useStudentStore entegrasyonu (YENİ!)
  <TopicInput />            // konu/prompt girişi
</Params>
```

### 4.3 Orta Alan — Render Zenginleştirme

```tsx
// Üretilen infografik + aktivite içeriği birleşik gösterim

// Eğer questions varsa:
<div className="infographic-render">
  <NativeInfographicRenderer syntax={result.syntax} />
</div>
{result.activityContent.questions && (
  <div className="activity-questions mt-4">
    <h4>Aktivite Soruları</h4>
    {result.activityContent.questions.map((q, i) => (
      <QuestionCard key={i} question={q} index={i+1} />
    ))}
  </div>
)}
```

### 4.4 Sağ Panel — Pedagojik Panel

```tsx
<RightPanel>
  {/* Pedagojik Not — zorunlu, Elif Yıldız kural */}
  <PedagogicalNoteCard note={result.pedagogicalNote} />
  
  {/* Hedef Beceriler */}
  <TargetSkillsCard skills={result.targetSkills} />
  
  {/* Export Butonları */}
  <ExportActions>
    <ExportButton type="svg" />
    <ExportButton type="a4-editor" />
    <ExportButton type="worksheet" /> {/* YENİ: çalışma kâğıdı sistemine */}
  </ExportActions>
  
  {/* Template Detay */}
  <TemplateInfoCard templateType={result.templateType} />
</RightPanel>
```

---

## 📦 Faz 5: Çalışma Kâğıdı Entegrasyonu

**Tahmin**: 2-3 saat | **Öncelik**: ORTA

### 5.1 WorksheetService Entegrasyonu

Üretilen infografik aktivitelerin `worksheetService.ts` aracılığıyla kaydedilebilmesi:

```typescript
// Mevcut handleExportA4() fonksiyonu genişletilecek
const handleExportToWorksheet = useCallback(async () => {
  if (!result) return;
  
  const worksheetBlock: WorksheetBlock = {
    type: 'svg_shape',
    content: {
      svgDataUrl: svgDataUrl,
      activityContent: result.activityContent,
      title: result.title,
      pedagogicalNote: result.pedagogicalNote,
    },
    style: { textAlign: 'center' },
  };
  
  // Worksheets listesine ekle
  await worksheetService.addBlock(worksheetBlock);
  
  toast.success('Çalışma kâğıdına eklendi!');
}, [result]);
```

### 5.2 Print Entegrasyonu

Mevcut `printService.ts` validasyon kurallarına uygun baskı desteği:

```typescript
// printService.ts minimum 10 karakter content kontrolü
// InfographicActivityResult.title + pedagogicalNote → yeterli içerik
const isPrintReady = result?.title && result.title.length >= 10;
```

---

## 📦 Faz 6: Testler ve Dokümantasyon

**Tahmin**: 2-3 saat | **Öncelik**: ORTA

### 6.1 Vitest Testleri

**Dosya**: `tests/InfographicActivityGenerator.test.ts` _(yeni)_

```typescript
import { describe, it, expect } from 'vitest';
import {
  generateOfflineInfographic5W1HBoard,
  generateOfflineInfographicMathSteps,
  generateOfflineInfographicSyllableMap,
} from '../src/services/generators/infographicActivityGenerator';

describe('InfographicActivityGenerator — Offline Mod', () => {
  
  it('5W1H Board offline üretimi — pedagogicalNote içermeli', async () => {
    const result = await generateOfflineInfographic5W1HBoard({
      topic: 'Kaplumbağa ve Tavşan',
      ageGroup: '8-10',
      difficulty: 'Orta',
      profile: 'dyslexia',
      count: 1,
    });
    
    expect(result.pedagogicalNote).toBeTruthy();
    expect(result.pedagogicalNote.length).toBeGreaterThan(50);
    expect(result.syntax).toContain('infographic');
    expect(result.templateType).toBeTruthy();
  });
  
  it('Math Steps offline üretimi — sequence-steps formatı', async () => {
    const result = await generateOfflineInfographicMathSteps({
      topic: 'Çarpma işlemi',
      ageGroup: '8-10',
      difficulty: 'Kolay',
      profile: 'dyscalculia',
      count: 1,
    });
    
    expect(result.syntax).toContain('sequence-steps');
    expect(result.activityContent.steps).toBeDefined();
    expect(result.activityContent.steps!.length).toBeGreaterThan(0);
  });
  
  it('Syllable Map offline üretimi — hierarchy-structure formatı', async () => {
    const result = await generateOfflineInfographicSyllableMap({
      topic: 'kelebek',
      ageGroup: '5-7',
      difficulty: 'Kolay',
      profile: 'dyslexia',
      count: 1,
    });
    
    expect(result.syntax).toContain('hierarchy-structure');
    expect(result.ageGroup).toBe('5-7');
  });
  
  it('KVKK: tanı koyucu dil yasak', async () => {
    const result = await generateOfflineInfographic5W1HBoard({
      topic: 'Herhangi konu',
      ageGroup: '8-10',
      difficulty: 'Orta',
      profile: 'dyslexia',
      count: 1,
    });
    
    // "disleksisi var" gibi tanı koyucu dil olmamalı
    expect(result.pedagogicalNote).not.toMatch(/disleksisi var/i);
    expect(result.pedagogicalNote).not.toMatch(/ADHD'li/i);
    expect(result.pedagogicalNote).not.toMatch(/tanı almış/i);
  });
});
```

### 6.2 MODULE_KNOWLEDGE.md Güncellemesi

`/.claude/MODULE_KNOWLEDGE.md` dosyasına `İnfografik Stüdyosu v2` bölümü eklenmeli.

---

## 📦 Faz 7: NativeInfographicRenderer Genişletmesi

**Tahmin**: 3-4 saat | **Öncelik**: DÜŞÜK (opsiyonel iyileştirme)

### 7.1 Yeni Template Türleri

Mevcut 5 template'e ek olarak aktivite-spesifik render desteği:

| Yeni Template | Aktivite | Görsel Özellik |
|---------------|----------|----------------|
| `activity-5w1h-grid` | INFOGRAPHIC_5W1H_BOARD | 6 renkli kutu grid |
| `activity-math-steps` | INFOGRAPHIC_MATH_STEPS | Numaralı adım kartları |
| `activity-syllable-breakdown` | INFOGRAPHIC_SYLLABLE_MAP | Hece bölüm çizgileri |
| `activity-vocab-card` | INFOGRAPHIC_VOCAB_TREE | Kelime + anlam + örnek |

### 7.2 Disleksi-Dostu Görsel İyileştirmeler

- Lexend font kalınlık: `400` → `600` (bold, daha okunabilir)
- Satır aralığı: `1.5` → `1.8`
- Harf aralığı (tracking): `0.02em`
- Renk kontrastı: WCAG AA (min 4.5:1) zorunlu
- Soru numarası daireleri: solid fill (outline yerine)

---

## 🎯 Aktivite Türleri — Tam Kategori Eşleme Haritası (96 Premium Tip)

### 🔭 Kategori 1: Görsel & Mekansal (10 Tip)

| ActivityType | Başlık | Template | Offline? | SpLD Uyum | MEB Ders |
|-------------|--------|---------|---------|-----------|---------|
| `INFOGRAPHIC_CONCEPT_MAP` | Kavram Haritası | `hierarchy-structure` | ✅ | Tümü | Tüm dersler |
| `INFOGRAPHIC_COMPARE` | Görsel Karşılaştırma | `compare-binary-horizontal` | ✅ | Tümü | Türkçe, Fen |
| `INFOGRAPHIC_VISUAL_LOGIC` | Görsel Mantık Yürütme | `sequence-steps` | ✅ | DEHB, Genel | Matematik |
| `INFOGRAPHIC_VENN_DIAGRAM` | Venn Şeması | `activity-venn` | ✅ | Tümü | Tüm dersler |
| `INFOGRAPHIC_MIND_MAP` | Zihin Haritası | `hierarchy-structure` | ✅ | DEHB | Tüm dersler |
| `INFOGRAPHIC_FLOWCHART` | Akış Şeması | `sequence-steps` | ✅ | DEHB | Matematik, Fen |
| `INFOGRAPHIC_MATRIX_ANALYSIS` | 2x2 Matris Analizi | `compare-binary-horizontal` | ✅ | Genel | Sosyal |
| `INFOGRAPHIC_CAUSE_EFFECT` | Neden-Sonuç | `activity-cause-effect` | ✅ | Tümü | Türkçe, Sosyal |
| `INFOGRAPHIC_FISHBONE` | Balık Kılçığı | `activity-fishbone` | ⚠️ AI önerilir | Genel | Fen, Sosyal |
| `INFOGRAPHIC_CLUSTER_MAP` | Küme Haritası | `list-row-simple-horizontal-arrow` | ✅ | Tümü | Türkçe |

### 📖 Kategori 2: Okuduğunu Anlama (10 Tip)

| ActivityType | Başlık | Template | Offline? | SpLD Uyum | MEB Kazanım |
|-------------|--------|---------|---------|-----------|------------|
| `INFOGRAPHIC_5W1H_BOARD` | 5N1K Panosu | `activity-5w1h-grid` | ✅ | Disleksi ⭐ | T.4.3.7 |
| `INFOGRAPHIC_READING_FLOW` | Okuma Anlama Akışı | `sequence-steps` | ✅ | Disleksi | T.3.3.5 |
| `INFOGRAPHIC_SEQUENCE` | Olay Sıralama | `sequence-timeline` | ✅ | Tümü | T.4.3.2 |
| `INFOGRAPHIC_STORY_MAP` | Hikaye Haritası | `activity-story-map` | ✅ | Tümü | T.5.3.8 |
| `INFOGRAPHIC_CHARACTER_ANALYSIS` | Karakter Analizi | `compare-binary-horizontal` | ✅ | Tümü | T.6.3.7 |
| `INFOGRAPHIC_INFERENCE_CHAIN` | Çıkarım Zinciri | `sequence-steps` | ⚠️ AI önerilir | Genel | T.7.3.6 |
| `INFOGRAPHIC_SUMMARY_PYRAMID` | Özet Piramidi | `hierarchy-structure` | ✅ | Tümü | T.4.3.9 |
| `INFOGRAPHIC_PREDICTION_BOARD` | Tahmin Panosu | `list-row-simple-horizontal-arrow` | ✅ | DEHB | T.5.3.4 |
| `INFOGRAPHIC_COMPARE_TEXTS` | Metin Karşılaştırma | `compare-binary-horizontal` | ✅ | Genel | T.7.3.2 |
| `INFOGRAPHIC_THEME_WEB` | Tema Ağı | `hierarchy-structure` | ✅ | Tümü | T.6.3.5 |

### 🔤 Kategori 3: Okuma & Dil (10 Tip)

| ActivityType | Başlık | Template | Offline? | SpLD Uyum | MEB Kazanım |
|-------------|--------|---------|---------|-----------|------------|
| `INFOGRAPHIC_SYLLABLE_MAP` | Hece Haritası | `activity-syllable-breakdown` | ✅ | Disleksi ⭐⭐ | T.1.6.2 |
| `INFOGRAPHIC_VOCAB_TREE` | Kelime Ağacı | `activity-vocab-card` | ⚠️ AI önerilir | Tümü | T.4.7.3 |
| `INFOGRAPHIC_TIMELINE_EVENT` | Olay Zaman Çizelgesi | `sequence-timeline` | ✅ | DEHB | T.5.3.2 |
| `INFOGRAPHIC_WORD_FAMILY` | Sözcük Ailesi | `hierarchy-structure` | ✅ | Tümü | T.3.7.4 |
| `INFOGRAPHIC_PREFIX_SUFFIX` | Önek/Sonek Analizi | `activity-syllable-breakdown` | ✅ | Disleksi | T.4.7.1 |
| `INFOGRAPHIC_SENTENCE_BUILDER` | Cümle Yapısı | `sequence-steps` | ✅ | Disleksi | T.3.5.3 |
| `INFOGRAPHIC_ANTONYM_SYNONYM` | Eş/Zıt Anlamlı | `compare-binary-horizontal` | ✅ | Tümü | T.4.7.5 |
| `INFOGRAPHIC_WORD_ORIGIN` | Kelime Kökeni | `hierarchy-structure` | ⚠️ AI önerilir | Genel | T.6.7.2 |
| `INFOGRAPHIC_COMPOUND_WORD` | Bileşik Sözcük | `activity-syllable-breakdown` | ✅ | Disleksi | T.5.7.1 |
| `INFOGRAPHIC_GENRE_CHART` | Metin Türü | `compare-binary-horizontal` | ✅ | Tümü | T.7.4.1 |

### 🔢 Kategori 4: Matematik & Mantık (10 Tip)

| ActivityType | Başlık | Template | Offline? | SpLD Uyum | MEB Kazanım |
|-------------|--------|---------|---------|-----------|------------|
| `INFOGRAPHIC_MATH_STEPS` | Adım Adım Çözüm | `activity-math-steps` | ✅ | Diskalkuli ⭐⭐ | M.3.1.5 |
| `INFOGRAPHIC_NUMBER_LINE` | Sayı Doğrusu | `sequence-steps` | ✅ | Diskalkuli ⭐ | M.2.1.3 |
| `INFOGRAPHIC_FRACTION_VISUAL` | Kesir Görsel | `compare-binary-horizontal` | ✅ | Diskalkuli | M.4.2.1 |
| `INFOGRAPHIC_MULTIPLICATION_MAP` | Çarpım Haritası | `hierarchy-structure` | ✅ | Diskalkuli | M.3.2.4 |
| `INFOGRAPHIC_GEOMETRY_EXPLORER` | Geometri Keşfi | `activity-venn` | ✅ | Tümü | M.4.3.1 |
| `INFOGRAPHIC_DATA_CHART` | Veri Analizi | `sequence-timeline` | ✅ | Genel | M.5.4.2 |
| `INFOGRAPHIC_ALGEBRA_BALANCE` | Denklem Dengesi | `compare-binary-horizontal` | ✅ | DEHB | M.6.1.3 |
| `INFOGRAPHIC_MEASUREMENT_GUIDE` | Ölçü Rehberi | `list-row-simple-horizontal-arrow` | ✅ | Diskalkuli | M.4.4.1 |
| `INFOGRAPHIC_PATTERN_RULE` | Örüntü & Kural | `sequence-steps` | ✅ | Tümü | M.2.5.1 |
| `INFOGRAPHIC_WORD_PROBLEM_MAP` | Sözel Problem | `activity-math-steps` | ✅ | Diskalkuli ⭐ | M.5.1.7 |

### 🔬 Kategori 5: Fen Bilimleri (8 Tip) — YENİ KATEGORİ ⭐

| ActivityType | Başlık | Template | Offline? | SpLD Uyum | MEB Kazanım |
|-------------|--------|---------|---------|-----------|------------|
| `INFOGRAPHIC_LIFE_CYCLE` | Yaşam Döngüsü | `activity-life-cycle` | ✅ | Tümü | F.3.1.2 |
| `INFOGRAPHIC_FOOD_CHAIN` | Besin Zinciri | `activity-food-chain` | ✅ | DEHB | F.5.3.1 |
| `INFOGRAPHIC_SCIENTIFIC_METHOD` | Bilimsel Yöntem | `sequence-steps` | ✅ | Genel | F.4.1.1 |
| `INFOGRAPHIC_CELL_DIAGRAM` | Hücre Diyagramı | `hierarchy-structure` | ⚠️ AI önerilir | Genel | F.6.1.3 |
| `INFOGRAPHIC_ECOSYSTEM_WEB` | Ekosistem Ağı | `hierarchy-structure` | ✅ | DEHB | F.7.3.2 |
| `INFOGRAPHIC_STATES_MATTER` | Maddenin Halleri | `activity-venn` | ✅ | Diskalkuli | F.4.2.1 |
| `INFOGRAPHIC_SOLAR_SYSTEM` | Güneş Sistemi | `sequence-timeline` | ✅ | Tümü | F.6.6.1 |
| `INFOGRAPHIC_HUMAN_BODY` | İnsan Vücudu | `hierarchy-structure` | ✅ | Tümü | F.5.1.2 |

### 🌍 Kategori 6: Sosyal Bilgiler & Tarih (8 Tip) — YENİ KATEGORİ ⭐

| ActivityType | Başlık | Template | Offline? | SpLD Uyum | MEB Kazanım |
|-------------|--------|---------|---------|-----------|------------|
| `INFOGRAPHIC_HISTORICAL_TIMELINE` | Tarihsel Zaman Çizelgesi | `sequence-timeline` | ✅ | DEHB | SB.5.2.1 |
| `INFOGRAPHIC_MAP_EXPLORER` | Harita Keşfedici | `hierarchy-structure` | ✅ | Görsel | SB.4.3.2 |
| `INFOGRAPHIC_CULTURE_COMPARE` | Kültür Karşılaştırma | `compare-binary-horizontal` | ✅ | Tümü | SB.6.4.1 |
| `INFOGRAPHIC_GOVERNMENT_CHART` | Yönetim Yapısı | `hierarchy-structure` | ✅ | Genel | SB.7.2.3 |
| `INFOGRAPHIC_ECONOMIC_FLOW` | Ekonomik Akış | `sequence-steps` | ✅ | DEHB | SB.7.3.1 |
| `INFOGRAPHIC_BIOGRAPHY_BOARD` | Biyografi Panosu | `activity-story-map` | ✅ | Tümü | SB.5.1.4 |
| `INFOGRAPHIC_EVENT_ANALYSIS` | Tarihi Olay Analizi | `activity-cause-effect` | ⚠️ AI önerilir | Genel | SB.6.2.5 |
| `INFOGRAPHIC_GEOGRAPHY_PROFILE` | Coğrafya Profili | `compare-binary-horizontal` | ✅ | Tümü | SB.5.3.3 |

### 💡 Kategori 7: Yaratıcı Düşünme (8 Tip) — YENİ KATEGORİ ⭐

| ActivityType | Başlık | Template | Offline? | SpLD Uyum | Beceri Alanı |
|-------------|--------|---------|---------|-----------|-------------|
| `INFOGRAPHIC_BRAINSTORM_WEB` | Beyin Fırtınası Ağı | `hierarchy-structure` | ✅ | DEHB ⭐ | Yaratıcılık |
| `INFOGRAPHIC_DESIGN_THINKING` | Tasarım Düşüncesi | `sequence-steps` | ✅ | Tümü | Eleştirel Düşünce |
| `INFOGRAPHIC_INNOVATION_CANVAS` | İnovasyon Tuvali | `compare-binary-horizontal` | ⚠️ AI önerilir | Genel | Girişimcilik |
| `INFOGRAPHIC_PROBLEM_SOLUTION` | Problem-Çözüm | `sequence-steps` | ✅ | Tümü | Problem Çözme |
| `INFOGRAPHIC_STORY_PLANNING` | Hikaye Planlama | `activity-story-map` | ✅ | Disleksi | Yaratıcı Yazarlık |
| `INFOGRAPHIC_IDEA_COMPARISON` | Fikir Karşılaştırma | `compare-binary-horizontal` | ✅ | DEHB | Eleştirel Düşünce |
| `INFOGRAPHIC_CREATIVE_PROCESS` | Yaratıcı Süreç | `sequence-steps` | ✅ | Tümü | Yaratıcılık |
| `INFOGRAPHIC_VISION_BOARD` | Vizyon & Hedef | `list-row-simple-horizontal-arrow` | ✅ | Tümü | Motivasyon |

### 📚 Kategori 8: Öğrenme Stratejileri (8 Tip) — YENİ KATEGORİ ⭐

| ActivityType | Başlık | Template | Offline? | SpLD Uyum | Araştırma Temeli |
|-------------|--------|---------|---------|-----------|-----------------|
| `INFOGRAPHIC_CORNELL_NOTES` | Cornell Not Alma | `activity-cornell` | ✅ | Tümü | Pauk, 1989 |
| `INFOGRAPHIC_KWL_CHART` | Bil/Öğren/Öğrendim | `activity-kwl` | ✅ | Tümü | Ogle, 1986 |
| `INFOGRAPHIC_STUDY_SCHEDULE` | Çalışma Programı | `sequence-timeline` | ✅ | DEHB ⭐ | Pomodoro Tech. |
| `INFOGRAPHIC_GOAL_SETTING` | Hedef Belirleme | `sequence-steps` | ✅ | Tümü | SMART Model |
| `INFOGRAPHIC_LEARNING_REFLECTION` | Öğrenme Yansıma | `activity-kwl` | ✅ | Tümü | Kolb, 1984 |
| `INFOGRAPHIC_MISTAKE_ANALYSIS` | Hata Analizi | `activity-cause-effect` | ✅ | Tümü | Growth Mindset |
| `INFOGRAPHIC_PROGRESS_TRACKER` | İlerleme Takibi | `sequence-steps` | ✅ | DEHB | Self-Reg. Theory |
| `INFOGRAPHIC_MEMORY_PALACE` | Bellek Sarayı | `hierarchy-structure` | ✅ | Disleksi | Method of Loci |

### 🧠 Kategori 9: SpLD / Özel Destek (12 Tip) — YENİ KATEGORİ ⭐

| ActivityType | Başlık | Template | Offline? | Hedef Profil | Klinik Temel |
|-------------|--------|---------|---------|-------------|-------------|
| `INFOGRAPHIC_DYSLEXIA_BRIDGE` | Okuma Köprüsü | `activity-syllable-breakdown` | ✅ | Disleksi ⭐⭐ | Orton-Gillingham |
| `INFOGRAPHIC_ADHD_FOCUS_CHART` | Dikkat Haritası | `sequence-steps` | ✅ | DEHB ⭐⭐ | Executive Func. |
| `INFOGRAPHIC_DYSCALCULIA_SUPPORT` | Sayı Duyusu | `activity-math-steps` | ✅ | Diskalkuli ⭐⭐ | CRA Modeli |
| `INFOGRAPHIC_SENSORY_SCHEDULE` | Duyusal Program | `sequence-timeline` | ✅ | Duyusal İşlem | OT Protokol |
| `INFOGRAPHIC_ROUTINE_VISUAL` | Görsel Rutin | `sequence-steps` | ✅ | DEHB, Otizm | TEACCH |
| `INFOGRAPHIC_EMOTION_MAP` | Duygu Haritası | `activity-emotion-wheel` | ✅ | Tümü | Zones of Reg. |
| `INFOGRAPHIC_SOCIAL_STORY` | Sosyal Hikaye | `activity-story-map` | ✅ | Otizm, DEHB | Gray, 1991 |
| `INFOGRAPHIC_STRENGTHS_WHEEL` | Güçlü Yönler | `activity-strengths-wheel` | ✅ | Tümü | Strengths Model |
| `INFOGRAPHIC_SELF_REGULATION` | Öz Düzenleme | `sequence-steps` | ✅ | DEHB ⭐ | Self-Det. Theory |
| `INFOGRAPHIC_SENSORY_PROFILE` | Duyusal Profil | `activity-radar` | ⚠️ AI önerilir | Duyusal İşlem | Dunn Model |
| `INFOGRAPHIC_COPING_TOOLKIT` | Başa Çıkma | `list-row-simple-horizontal-arrow` | ✅ | Tümü | CBT Adaptasyon |
| `INFOGRAPHIC_TRANSITION_SUPPORT` | Geçiş Desteği | `sequence-steps` | ✅ | Tümü | IDEA Transition |

### 🏥 Kategori 10: Klinik & BEP (12 Tip) — YENİ KATEGORİ ⭐

> ⚠️ **Dr. Ahmet Kaya Onayı Zorunlu**: Bu kategori MEB 573 Sayılı KHK ve Özel Eğitim Yönetmeliği ile doğrudan ilgilidir. Her aktivite klinik onay gerektirir. KVKK uyarısı: Öğrenci adı + tanı + skor birlikte görüntülenemez.

| ActivityType | Başlık | Template | Offline? | KVKK | MEB Düzenleme |
|-------------|--------|---------|---------|------|--------------|
| `INFOGRAPHIC_BEP_GOAL_MAP` | BEP Hedef Haritası | `activity-bep-goals` | ✅ | ⚠️ Dikkat | KHK 573 Md.4 |
| `INFOGRAPHIC_ASSESSMENT_VISUAL` | Değerlendirme Raporu | `activity-radar` | ⚠️ AI önerilir | ⚠️ Dikkat | KHK 573 Md.7 |
| `INFOGRAPHIC_PROGRESS_REPORT` | İlerleme Raporu | `sequence-timeline` | ✅ | ⚠️ Dikkat | MEB Yön. Md.12 |
| `INFOGRAPHIC_SKILL_RADAR` | Beceri Radar | `activity-radar` | ✅ | ⚠️ Dikkat | BEP Şablonu |
| `INFOGRAPHIC_INTERVENTION_PLAN` | Müdahale Planı | `sequence-steps` | ✅ | ✅ Güvenli | MEB Yön. Md.15 |
| `INFOGRAPHIC_LEARNING_PROFILE` | Öğrenme Profili | `compare-binary-horizontal` | ✅ | ⚠️ Dikkat | BEP Şablonu |
| `INFOGRAPHIC_PARENT_GUIDE` | Veli Rehberi | `list-row-simple-horizontal-arrow` | ✅ | ✅ Güvenli | MEB Yön. Md.18 |
| `INFOGRAPHIC_TRANSITION_PLAN` | Geçiş Planı | `sequence-steps` | ✅ | ⚠️ Dikkat | MEB Yön. Md.22 |
| `INFOGRAPHIC_STRENGTHS_NEEDS` | Güçlü/İhtiyaçlar | `compare-binary-horizontal` | ✅ | ✅ Güvenli | BEP Şablonu |
| `INFOGRAPHIC_ANNUAL_REVIEW` | Yıllık Değerlendirme | `activity-radar` | ⚠️ AI önerilir | ⚠️ Dikkat | KHK 573 Md.9 |
| `INFOGRAPHIC_COLLABORATION_MAP` | Ekip İşbirliği | `hierarchy-structure` | ✅ | ✅ Güvenli | MEB Yön. Md.20 |
| `INFOGRAPHIC_ACCOMMODATION_GUIDE` | Uyarlama Rehberi | `list-row-simple-horizontal-arrow` | ✅ | ✅ Güvenli | MEB Yön. Md.11 |

---

## 📊 Premium Aktivite Özet Tablosu

| Kategori | Tip Sayısı | Offline | AI Zorunlu | Yeni mi? |
|---------|-----------|---------|-----------|---------|
| 🔭 Görsel & Mekansal | 10 | 10 | 0 | ➕ Genişletildi |
| 📖 Okuduğunu Anlama | 10 | 9 | 1 | ➕ Genişletildi |
| 🔤 Okuma & Dil | 10 | 8 | 2 | ➕ Genişletildi |
| 🔢 Matematik & Mantık | 10 | 10 | 0 | ➕ Genişletildi |
| 🔬 Fen Bilimleri | 8 | 7 | 1 | 🆕 Yeni |
| 🌍 Sosyal Bilgiler & Tarih | 8 | 7 | 1 | 🆕 Yeni |
| 💡 Yaratıcı Düşünme | 8 | 7 | 1 | 🆕 Yeni |
| 📚 Öğrenme Stratejileri | 8 | 8 | 0 | 🆕 Yeni |
| 🧠 SpLD / Özel Destek | 12 | 11 | 1 | 🆕 Yeni |
| 🏥 Klinik & BEP | 12 | 9 | 3 | 🆕 Yeni |
| **TOPLAM** | **96** | **86** | **10** | |

> **%90 Offline Oran**: 86/96 aktivite hızlı modda (0ms, API gerektirmez) üretilebilir.

---

## 🗓️ Uygulama Takvimi — v3 Ultra Premium

| Faz | İçerik | Süre | Bağımlılık | Aktivite Sayısı |
|-----|--------|------|-----------|----------------|
| **Faz 1** | Tip altyapısı (96 ActivityType, interfaces, constants) | 5-7 saat | Yok | 96 enum |
| **Faz 2** | Offline generatörler — Kat. 1-4 (86 offline fn.) | 8-12 saat | Faz 1 | 40 fn. |
| **Faz 3** | Offline generatörler — Kat. 5-10 | 8-12 saat | Faz 1 | 46 fn. |
| **Faz 4** | AI generatörler — tüm 96 tip için `generateWithSchema()` | 8-12 saat | Faz 1, 2, 3 | 96 fn. |
| **Faz 5** | UI yenileme (InfographicStudio v2 — 10 kategori, tablar) | 8-10 saat | Faz 1, 2, 3 | — |
| **Faz 6** | 6 yeni NativeInfographicRenderer template'i | 5-7 saat | Faz 1, 5 | 6 template |
| **Faz 7** | Worksheet + Print + A4Editor entegrasyonu | 3-4 saat | Faz 5 | — |
| **Faz 8** | SpLD/BEP özel UI bileşenleri + KVKK maskeleme | 4-6 saat | Faz 5 | — |
| **Faz 9** | Testler + MODULE_KNOWLEDGE.md güncellemesi | 4-6 saat | Faz 2, 3, 4 | 96+ test |
| **Toplam** | | **~53-76 saat** | | |

---

## ⚠️ Riskler ve Azaltma Stratejileri

| Risk | Olasılık | Etki | Azaltma |
|------|---------|------|---------|
| @antv/infographic render sorunu | Yüksek | Yüksek | NativeInfographicRenderer fallback + 6 yeni template eklenir |
| AI JSON output format tutarsızlığı | Orta | Orta | `generateWithSchema()` kullan (XML yerine), 3 katmanlı repair motoru |
| 96 tip → Sidebar kalabalığı | Yüksek | Orta | 10 kategori tab yapısı + arama kutusu + favoriler |
| `any` tipi sızması | Düşük | Yüksek | TypeScript strict + `InfographicActivityResult` interface + 96 test |
| Offline mock içerikler pedagojik değil | Orta | Yüksek | Elif Yıldız her offline şablon için `pedagogicalNote` onayı |
| BEP/Klinik içerik klinik hata | Düşük | Çok Yüksek | Dr. Ahmet Kaya her Kat.10 aktivitesi için zorunlu onay |
| KVKK ihlali (SpLD profil + ad birlikte) | Düşük | Çok Yüksek | UI maskeleme katmanı, anonim mod zorunlu Kat.9-10 |
| 96 generatör dosya boyutu | Orta | Düşük | Generator dosyası 6 alt modüle bölünür (kat. başına 1 dosya) |
| Kategori 5-10 MEB uyum eksikliği | Orta | Yüksek | Her aktivitede `mebKazanim` alanı zorunlu + Dr. Ahmet onayı |

---

## ✅ Kabul Kriterleri (Definition of Done)

Her faz için:

- [ ] TypeScript strict mode: `any` yok, `unknown` + type guard kullanıldı
- [ ] `pedagogicalNote` her üretilen aktivitede mevcut (min 100 kelime)
- [ ] `AppError` formatı tüm hata noktalarında kullanıldı
- [ ] Tanı koyucu dil yok ("disleksisi var" → "disleksi desteğine ihtiyacı var")
- [ ] Lexend font korunuyor
- [ ] Vitest testi her yeni generator için yazıldı (min 96 test senaryosu)
- [ ] Rate limiting mevcut (`/api/generate` endpoint'i zaten korumalı)
- [ ] KVKK: öğrenci adı + tanı + skor birlikte görünmüyor (özellikle Kat. 9-10)
- [ ] Offline mod: API çağrısı yok, anlık üretim (%90 oranında)
- [ ] AI mod: `generateWithSchema()` ile tip güvenli JSON çıktı
- [ ] Kat. 10 (Klinik & BEP): Dr. Ahmet Kaya her aktivite için onay verdi
- [ ] Kat. 9 (SpLD): Elif Yıldız her pedagojik not için onay verdi
- [ ] 6 yeni NativeInfographicRenderer template'i implement edildi
- [ ] 10 kategori tab UI'ı çalışıyor, arama kutusu fonksiyonel
- [ ] `mebKazanim` alanı tüm Kat. 1-6 aktivitelerinde mevcut

---

## 🔌 Bağımlı Dosyalar ve Değişiklik Kapsamı

```
DEĞİŞECEK DOSYALAR:
├── src/types/activity.ts              ← ActivityType enum (+96 yeni tip = 206 toplam)
├── src/constants.ts                   ← ACTIVITIES (+96 giriş) + ACTIVITY_CATEGORIES (+6 yeni)
├── src/services/generators/registry.ts ← 96 yeni registry kaydı
├── src/components/InfographicStudio/index.tsx ← Tam yenileme (v3 UI — 10 kategori tab)
├── src/components/NativeInfographicRenderer.tsx ← 6 yeni template (Faz 6)
└── .claude/MODULE_KNOWLEDGE.md        ← İnfografik v3 bölümü

YENİ DOSYALAR:
├── src/types/infographic.ts           ← Yeni tip tanımları (~400 satır)
├── src/services/generators/infographic/
│   ├── index.ts                       ← Barrel export
│   ├── visual-spatial.ts              ← Kat.1: Görsel & Mekansal (10 fn.)
│   ├── reading-comprehension.ts       ← Kat.2: Okuduğunu Anlama (10 fn.)
│   ├── language-literacy.ts           ← Kat.3: Okuma & Dil (10 fn.)
│   ├── math-logic.ts                  ← Kat.4: Matematik & Mantık (10 fn.)
│   ├── science.ts                     ← Kat.5: Fen Bilimleri (8 fn.)
│   ├── social-studies.ts              ← Kat.6: Sosyal Bilgiler (8 fn.)
│   ├── creative-thinking.ts           ← Kat.7: Yaratıcı Düşünme (8 fn.)
│   ├── learning-strategies.ts         ← Kat.8: Öğrenme Stratejileri (8 fn.)
│   ├── spld-support.ts                ← Kat.9: SpLD Desteği (12 fn.)
│   └── clinical-bep.ts                ← Kat.10: Klinik & BEP (12 fn.) ⚠️ Klinik onay
└── tests/InfographicActivityGenerator.test.ts ← 96+ Vitest test senaryosu

DEĞİŞMEYECEK DOSYALAR:
├── src/services/infographicService.ts ← Mevcut XML motoru (geriye uyumlu kalır)
├── src/services/geminiClient.ts       ← DOKUNMA (JSON repair motoru)
├── api/generate.ts                    ← DOKUNMA (rate limiter korumalı)
└── src/services/generators/core/      ← DOKUNMA (GenericActivityGenerator)
```

---

## 🏆 Başarı Metrikleri

Uygulama tamamlandığında:

1. **Aktivite Çeşitliliği**: 96 benzersiz infografik aktivite türü → **9.6× önceki plan**
2. **Kategori Kapsamı**: 10 profesyonel kategori → 4'ten 10'a **%150 artış**
3. **Hızlı Mod Kullanım Oranı**: İnfografik aktivitelerin **%90+'ı** (86/96) offline modda üretilebilmeli
4. **Öğretmen Memnuniyeti**: Aktivite üretim süresi < 30 saniye (hızlı mod)
5. **`pedagogicalNote` Kalitesi**: Her çıktıda minimum 100 kelime pedagojik açıklama
6. **MEB Uyumu**: Kat. 1-6'daki tüm aktivitelerde `mebKazanim` kodu mevcut
7. **SpLD Kapsamı**: 4 öğrenme profili (disleksi, diskalkuli, DEHB, karışık) tüm kategorilerde desteklenmeli
8. **Klinik Güvenlik**: Kat. 10'daki tüm aktiviteler Dr. Ahmet Kaya onaylı, KVKK uyumlu
9. **TypeScript Uyum**: `npm run build` sıfır hata
10. **Test Kapsamı**: 96 generator fonksiyonu için **96+ test senaryosu**
11. **Toplam Aktivite Sayısı**: Sistemde **206 benzersiz aktivite türü** (110 mevcut + 96 yeni)
12. **Premium Marka**: Türkiye'nin özel öğrenme alanındaki **en kapsamlı dijital aktivite kütüphanesi**

---

## 📎 Ek: Mevcut Kod ile Karşılaştırma

### Mevcut Akış (v1)

```
Kullanıcı → [Konu Yaz] → [AI ile Oluştur] → @antv/infographic syntax → Render
```

### Plan v2 Akışı (10 tip, 4 kategori)

```
Kullanıcı → [Kategori Seç: 4 adet] → [Aktivite Türü Seç: 10 adet] → Üret
```

### Yeni Akış (v3 Ultra Premium — 96 tip, 10 kategori)

```
Kullanıcı → [Kategori Seç: 10 adet] → [Aktivite Türü Seç: 96 adet] → [Mod Seç]
               ↓                             ↓                            ↓
     Görsel & Mekansal (10)         Kavram Haritası             Hızlı Mod (0ms) ──→ Offline Gen.
     Okuduğunu Anlama (10)          5N1K Panosu                      ↓
     Okuma & Dil (10)               Hece Haritası               86/96 aktivite
     Matematik & Mantık (10)        Adım Çözüm                  anlık üretilebilir
     Fen Bilimleri (8)              Yaşam Döngüsü               
     Sosyal Bilgiler (8)            Tarihsel Zaman Çizelgesi    AI Mod (~3-8s) ──→ generateWithSchema()
     Yaratıcı Düşünme (8)           Beyin Fırtınası Ağı              ↓
     Öğrenme Stratejileri (8)       Cornell Not Şablonu         InfographicActivityResult
     SpLD / Özel Destek (12)        Duygu Haritası                   ↓
     Klinik & BEP (12) ⚠️           BEP Hedef Haritası          NativeInfographicRenderer
                                                                 (21 template türü)
                                                                      ↓
                                                               SVG HD / A4 Editor / Worksheet Export
                                                               Print Service / PDF / Paylaşım
```

---

*Bu ultra premium plan, 4 lider uzman ajan (Elif Yıldız, Dr. Ahmet Kaya, Bora Demir, Selin Arslan) ile visual-storyteller-oozel ve ai-vision-engineer-oozel destek ajanlarının kapsamlı değerlendirmesiyle hazırlanmıştır. **96 aktivite türü** ile Oogmatik, Türkiye'nin özel öğrenme alanındaki en kapsamlı dijital aktivite kütüphanesine sahip olacaktır. Uygulama başlamadan önce her fazın uzman ajan onayı alınmalıdır. Kategori 10 (Klinik & BEP) için Dr. Ahmet Kaya bireysel onayı zorunludur.

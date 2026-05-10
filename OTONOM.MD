# Oogmatik AI — Phase 4: Generative Engine (Tam Otonom Mimari)

## 1. Vizyon ve Amaç (Selin Arslan - AI Mimarisi)
Mevcut [Phase 3] sisteminde motor, etkinlik dosyalarını üretirken `template` (şablon) kopyalama tekniği kullanmaktaydı. **Phase 4: Generative Engine** ile statik şablonların sınırları tamamen kaldırılarak sistem, yeni bir etkinlik Blueprint'i aldığında sadece gerekli veri modelini değil; **kullanıcı arayüzünü (React UI), algoritmik jeneratörleri ve konfigürasyon panellerini de sıfırdan yapay zeka** ile yazacak bir konuma yükseltilecektir.

Bu "Self-Coding" (Kendi kodunu yazan) mimari, Oogmatik'in sınırlarını geleneksel EdTech platformlarından çıkarıp **"Düşünen ve Üreten Kod Fabrikasına"** taşıyacaktır.

---

## 2. Dörtlü Lider Ajan Muhakeme ve Onay Ağı

Otonom sistemin kod üretirken hata yapmasını (syntax hataları, pedagojik bozukluklar, çalışmayan sistemler) engellemek için tüm süreç aşağıdaki ardışık "Lider Muhakeme" hattından (Pipeline) geçer:

### ⚡ Faz 1: Analiz & İdeasyon (Elif Yıldız & Dr. Ahmet Kaya)
- **Pedagojik Prompt Enjeksiyonu:** Elif Yıldız, kullanıcının istediği etkinlik tipini MEB ZPD (Yakınsal Gelişim Alanı) kuralları ile tarar. Hangi renk tonlarının kullanılacağı (disleksi dostu), çocukta yaratacağı duyusal etkinin UI tarafındaki karşılığını planlar (Örn: "Harf eşleştirme için geniş boşluklar ve pastel tonlar gerek").
- **Klinik Güvenlik:** Dr. Ahmet Kaya, etkinliğin DEHB veya özel öğrenme güçlüğü (ÖG) profillerine uyumunu teyit ederek, "Tasarımda çok fazla dikkat dağıtıcı bileşen olmamalı" gibi katı Prompt kurallarını şemaya ekler.

### ⚡ Faz 2: Generative Üretim (Selin Arslan)
- **`AIGeneratorPlugin` Devreye Girer:** Selin, Phase 1'den çıkan verileri **Gemini 1.5 Flash (veya eşdeğer LLM)** modeline besler. 
- **Prompt:** *"Bana, Lexend fontu ile yazılmış, Tailwind kullanılan, TypeScript tabanlı bir WorksheetUI.tsx ver. İşin pedagojik kuralları [Faz 1 verisi] şeklindedir."*
- AI motoru, ham kod dökümünü çıkarır. UI, types ve offline Generators olmak üzere 3 alt motor eşzamanlı çalışır ve kodu yazar.

### ⚡ Faz 3: Sentaktik Denetim & Validasyon (Bora Demir)
En kritik adım burasıdır. Üretilen React kodu sisteme enjekte edilmeden önce, Bora Demir ajanı kodu "Virtual File System (VFS)" üzerinde sanal olarak tutar.
- **`AST Parsing`:** Kodda `}` veya `>` eksikliği, yanlış içe aktarmalar (Invalid Rollup/Import) olup olmadığı Babel / TypeScript AST motorları ile hızlıca taranır.
- Eğer hata varsa, Bora Demir kodu doğrudan *Yapay Zekaya geri gönderip* nerede hata yaptığını söyleyip **otomatik olarak düzeltmesini** ister (Self-Correction Loop). Kod "Exit Code 0" vermeden sisteme (diske) KESİNLİKLE yazılmaz.

---

## 3. Yeni Çekirdek Bileşenler (Technical Specifications)

### 3.1. `AIGeneratorPlugin` Sınıfı
`IScaffoldPlugin` mimarisinin en güçlü modülü olarak `src/tools/scaffold/plugins/AIGeneratorPlugin.ts` inşa edilecektir.
- Bu plugin, statik bir şablon (*template.txt*) okumak yerine `generateWithSchema` (Gemini API) çalıştırarak Typescript kodu bekler.

### 3.2. Gen-AST Doğrulayıcı (Validator)
Yapay Zekanın yazacağı `WorksheetUI.tsx` ve `offlineGenerators.ts` kod dosyalarındaki tip (type) ve sözdizimi (syntax) kaymalarından IDE'nin çökmemesi ve Vercel Build zincirinin bozulmaması için VFS içine `SyntaxValidator` katmanı yerleştirilecektir. 
```typescript
interface GenerativePayload {
  uiCode: string;
  generatorCode: string;
  typesCode: string;
}
```

### 3.3. Premium Tasarım Konteynerleri (Style Guide Guardrails)
Otonom sistemin çirkin ya da temel UI'lar tasarlamasını önlemek üzere, AI'a daima şu mimari yönergeler enjekte edilecektir:
- *Font:* Yalnızca "font-lexend", 
- *Boşluklar:* `p-[1cm]`, "leading-relaxed" (ferah tasarım).
- *Komponent Kütüphaneleri:* Yalnızca Radix ve TailwindCSS sınıfları kullanılacak. Dahili `style={{}}` yazılması katı biçimde (Regex Anti-Pattern) engellenecektir.

---

## 4. Otonom Üretim Yaşam Döngüsü (Özet)

1. **`npm run scaffold --blueprint etkinlik.json`** komutu çalışır.
2. `AgentOrchestrator` json'ı alır, Elif ve Ahmet klinik ek haritalarını koda gömer.
3. `AIGeneratorPlugin` Gemini API servisine bağlanır ve kod bloklarını (UI, Logic, Types) yazdırır.
4. Çıkan kod, `SyntaxValidator` (Bora Demir) tarafından VFS içinde parse edilir. Hata varsa döngü başa (Auto-Fixing) sarar.
5. Hata yoksa, Vercel build kırılamayacak kadar sağlam olan yepyeni, eşsiz, Premium tasarımlı sayfa sisteme yazılır.
6. Admin Panel ve Router enjeksiyonları mevcut eklentilerce tamamlanır.

## 5. Eksik Halka: Hata Toleransı & "Fail-Safe" Mekanizmaları (Bora Demir Check)
Sistem "Tam Otonomi" üzerine inşa edilmiş olsa da, Büyük Dil Modellerinin (LLM) yaşatabileceği "Halüsinasyon Uzaması" (Sürekli Hatalı Kod Üretimi) ihtimaline karşı **Graceful Degradation (Zarif Döngü Kırma)** entegre edilecektir:

### 5.1. Maximum Retry Limit (Maksimum Deneme Döngüsü)
`SyntaxValidator` içerisinde döngü limiti (maxRetries = 3) bulunur. AI kodu düzeltmeyi 3 kez başaramazsa sistem "Panic" yapmaz. 
**Güvenli Düşüş (Fallback):** Phase 3'teki "Statik Şablonlar" (template.txt) geçici olarak taranır ve kullanıcı ekranına güvenli, hataları ayıklanmış ancak standart (basic) tasarım yansıtılır. Hata kayıtları `.system_generated/logs` klasörüne pushlanır.

### 5.2. LLM Context Awareness (Bağlam Bilinci)
Offline üretim kodlarını AI yazarken, Oogmatik'in özel `random()`, `shuffle()`, sınıf yapılarını ezberden uydurmaması için Prompt içine RAG (Retrieval-Augmented Generation) mekaniği olarak `utils/helpers.ts` içeriği otomatik gömülecektir.

### 5.3. Atomic VFS Commit & Snapshot Service
VFS (Sanal Dosya Sistemi) disk alanına yazarken işlem kesilirse "Yarım dosya yazıldı" hatası almamak adına **Snapshot Service** tetiklenir:
- Yazmadan önce `src/tools/scaffold` içinde bir `.backup` ZIP yaratılır. Hata olursa `rollback()` çalışır.

**Sonuç:** Hata fırlatma ihtimali %0 olan, kendi kendini kodlayan ve koruyan gerçek Otonom Platform Gücü.

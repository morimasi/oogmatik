# 🚀 OOGMATIK — Ultra Profesyonel Mimari & Geliştirme Planı (v3.5 Premium)

Bu doküman, Oogmatik platformunu dünyanın en gelişmiş "Nöro-Pedagojik Eğitim İşletim Sistemi" haline getiren **v3.5 Ultra-Premium** mimari yol haritasıdır. Tüm modüller, özel öğrenme güçlüğü (Disleksi, Diskalkuli) ve DEHB odaklı **"Cognitive Load Optimization"** (Bilişsel Yük Optimizasyonu) prensiplerine ve MEB/Klinik standartlara göre tasarlanmıştır.

---

## 🤖 1. Evrensel AI Orkestrasyonu (The Brain v3.5)
Tüm içerik üretimi, [AgentOrchestrator](file:///c:/Users/Administrator/Desktop/oogmatik/src/services/activityStudio/AgentOrchestrator.ts) tarafından yönetilen 6 uzman ajanlı bir **"Synaptic Loop"** (Sinaptik Döngü) üzerinden otomatik yürütülür.

### 🔄 Otomatik İş Akışı & Akran Denetimi (Peer-Review)
1. **IdeationAgent (Nöro-Pedagojik Tasarımcı)**: Öğrencinin `neuro_profile` verilerini analiz eder, ZPD (Yakınsal Gelişim Alanı) uyumlu konsept belirler.
2. **ContentAgent (Özel Eğitim Yazarı)**: Orton-Gillingham uyumlu, disleksi dostu metinler ve bilmeceler üretir.
3. **VisualAgent (UI/UX Stratejist)**: "Visual Crowding"i engelleyen, Glassmorphism standartlarında şablonlar seçer.
4. **FlowAgent (LXD)**: Aktiviteyi mikro-döngülere (Chunking) böler, dikkat süresini optimize eder.
5. **EvaluationAgent (Veri Analisti)**: SMART kriterli ölçme soruları ve `pedagogicalNote` (Öğretmen notları) ekler.
6. **IntegrationAgent (Baş Mimar)**: Çıktıları sentezler, `validateAndCorrect` katmanında JSON onarımı yapar ve `PremiumBlockBuilder`'a aktarır.

---

## 🏗️ 2. Premium İçerik Motoru (The Fluent Builder)
**Hedef**: Tek tuşla kişiselleştirilmiş, kompakt ve profesyonel (A4) eğitim materyali üretimi.

### 🛠️ Dinamik Mimari (Yeni Nesil)
- **Fluent Builder API (`PremiumBlockBuilder.ts`)**: Tüm etkinlik sayfalarının `addPremiumHeader().setInstruction().addPedagogicalNote().build()` zincirleme yapısıyla (Chainable API) güvenli ve modüler üretilmesini sağlar. Intermediate value hatalarını sıfırlar.
- **Dynamic ID Mapping (`dynamicIdMappings.ts`)**: Firestore'dan gelen karmaşık dinamik ID'lerin (örn. `Msc0QEAM8Ax1bcIWJ33v`) sistem içi `ActivityType` enumlarına güvenli ve merkezi eşlenmesi.
- **Kompakt A4 Layout (Print-Ready)**: "Sayı Dedektifi", "Meyveli Toplama" gibi etkinliklerde sayfa başına 4/6/8 puzzle sığdıran, boşlukları optimize eden premium CSS grid mimarisi.

---

## 📊 3. Nöro-Analitik & Aktivite Yönetimi (Adaptive Tracking)
**Hedef**: Sadece "doğru/yanlış" değil, "nasıl öğrendiğini" ölçen, kanıta dayalı veri analitiği.

### 🧠 Neuro-Metrics
- **Latent Analysis**: İşlemleme hızı ölçümü (soruya başlama süresi).
- **Behavioral Heatmap**: DEHB dikkat dağılımı ve odak noktası analizi.
- **Scaffold Efficiency**: Hangi ipuçlarının (renk, hece, görsel) başarıyı artırdığının ZPD ölçeğinde tespiti.

---

## 🔐 4. Güvenlik, Kimlik & KVKK (The Privacy Shield)
**Hedef**: Sıfır veri sızıntısı, klinik gizlilik ve %100 KVKK uyumu.

### 🛡️ Protokoller
- **PII Anonymizer**: LLM (Gemini) isteklerinde isim ve kimlik verilerinin maskelenmesi.
- **Encrypted Clinical Store**: BEP ve klinik gözlem verilerinin şifrelenerek saklanması. (Asla UI'da isim + tanı yan yana görünmez).
- **Audit Log**: Sistemdeki her yetki ve içerik üretim işleminin Immutable (değiştirilemez) loglanması.

---

## 🎨 5. UI/UX Standartları (Premium Glassmorphism)
Admin ve Öğrenci arayüzlerinde kesin standartlar:
- **Tema**: Ultra-dark glassmorphism (`backdrop-blur: 24px`, ultra ince border).
- **Tipografi**: İçeriklerde KESİNLİKLE `Lexend` (Disleksi standardı), Admin UI'da `Inter`. Karıştırmak yasaktır.
- **Micro-interactions**: Framer Motion tabanlı hover scale, smooth-scroll.

---

## ✅ Ultra-Premium Implementasyon Checklist'i

### 🛠️ Faz 1-3: Altyapı, Core AI & Modüler Stüdyolar (TAMAMLANDI)
- [x] 6'lı Agent Orkestrasyonu ve `Self-Correction` loop entegrasyonu.
- [x] Gemini JSON repair motoru (`balanceBraces -> truncate -> parse`).
- [x] AppError hata standardı ve merkezi Type-Safe API.
- [x] `Lexend` entegrasyonu ve Multisensory Highlight yetenekleri.

### ⚙️ Faz 4: Dinamik İçerik Üretimi & Premium Layout (TAMAMLANDI)
- [x] **Dinamik Firestore ID Eşleme**: `dynamicIdMappings.ts` ile `Msc...` -> `MAP_INSTRUCTION` köprüleri.
- [x] **Fluent Builder API**: `PremiumBlockBuilder` sınıflarıyla arayüz veri oluşturma güvenliği.
- [x] **Kompakt A4 Yapısı**: Activity Config üzerinden 4/6/8 zorluk/kart seçeneği.
- [x] AI ve Hızlı (Offline) üretim fallback/registry sisteminin kusursuz entegrasyonu.

### 🛡️ Faz 5: Güvenlik, Kimlik Doğrulama ve RBAC (ÖNCELİKLİ)
- [ ] **Mandatory Authentication Gate**: Oturum kontrolü ve yetkisiz erişim bloklama.
- [ ] **Dynamic RBAC & Module Control**: Firestore tabanlı yetki matrisi (Studio, Admin, Analitik için açma/kapama).
- [ ] **Admin Permissions IDE**: Roller için görsel yönetim ve simülasyon arayüzü.

### 🎓 Faz 6: Öğrenci Hub & Klinik Takip (YAKIN GELECEK)
- [ ] **360° Neuro-Student Profile**: Bilişsel profil (dikkat, bellek) ve "Öğrenme DNA'sı" görselleştirmesi.
- [ ] **AI-Powered BEP (IEP) Engine**: MEB standartlarında SMART hedefler üreten bireysel eğitim modülü.
- [ ] **Learning Plateau Tespiti**: Erken uyarı sistemi ve "Remedial" (Takviye) rota yönetimi.
- [ ] **Parent-Teacher-Clinic Bridge**: KVKK uyumlu veli/öğretmen bilgi paylaşım portalı.

---
**Onaylayan**: Oogmatik v3.5 Baş Mimarı & Agent Ekibi
**Versiyon**: 3.5.0-PremiumArchitecture
**Durum**: Faz 4 Tamamlandı, Faz 5 ve Faz 6 için Ajan Ekibi Hazır

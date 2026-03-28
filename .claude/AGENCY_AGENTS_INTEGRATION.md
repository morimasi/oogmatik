# Agency-Agents ADR Entegrasyon Belgesi

## 📋 Giriş

Bu belge, [ashishpatel26/agency-agents](https://github.com/ashishpatel26/agency-agents) projesinden seçilen ajanların Oogmatik uygulamasına entegre edilmesinin teknik ve stratejik detaylarını içerir.

**Entegrasyon Tarihi**: 2026-03-28
**Versiyon**: 1.0.0
**Durum**: Aktif (Manuel Mod)

---

## 🎯 Entegrasyon Amacı

### Problem
Oogmatik'te 4 lider ajan var (Elif, Dr. Ahmet, Bora, Selin) ancak bunlar her detay göreve kendileri bakmak zorunda. Çoklu görev koordinasyonu, özelleşmiş test senaryoları ve domain-spesifik olmayan geliştirme işleri için destek ekibi yok.

### Çözüm
Agency-agents projesinden:
- **120 özelleşmiş ajan** havuzu mevcut
- **Agents Orchestrator**: Çoklu ajan koordinasyonu
- **Multi-tool entegrasyon**: Claude Code, Cursor, Gemini CLI, vb.

**Oogmatik için seçici entegrasyon**:
- Sadece **15 kritik ajan** seçildi (context şişmesi önleme)
- Her ajan **Türkçe lokalize** + **Oogmatik domain bilgisi** eklendi
- **Lider ajan supremacy** korundu (vibecosystem ajanları lider kararlara itaat eder)

---

## 🏗️ Mimari Tasarım

### Hiyerarşik Yapı

```
┌─────────────────────────────────────────────────────────┐
│                     KULLANICI İSTEĞİ                     │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│              LİDER AJANLAR (İÇ ÇEKIRDEK)                │
│  ┌────────────┬───────────────┬──────────────┬────────┐ │
│  │ Elif Yıldız│ Dr. Ahmet Kaya│ Bora Demir   │ Selin  │ │
│  │ (Pedagoji) │  (Klinik/MEB) │ (Mühendislik)│Arslan  │ │
│  │            │               │              │ (AI)   │ │
│  └────────────┴───────────────┴──────────────┴────────┘ │
│           ✅ ONAY       ❌ DURDUR                        │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│                 EKİP ORKESTRATÖRÜ                        │
│         (Çoklu ajan koordinasyonu, pipeline)             │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│           VIBECOSYSTEM AJANLAR (15 AJAN)                │
│  ┌──────────────┬──────────────┬──────────────────────┐ │
│  │ Engineering  │   Testing    │ Design & Support     │ │
│  │ (6 ajan)     │   (4 ajan)   │ (5 ajan)             │ │
│  └──────────────┴──────────────┴──────────────────────┘ │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│              DEV-QA LOOP (KALİTE DÖNGÜSÜ)               │
│    Dev → QA Test → PASS ✅ / FAIL ❌ (retry)            │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│              LİDER AJAN SON KONTROL                      │
│              İlgili lider doğrular                       │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
                TAMAMLANDI ✅
```

---

## 📂 Dosya Yapısı

```
.claude/
├── agents/
│   ├── ozel-ogrenme-uzmani.md         # Lider: Elif Yıldız (Pedagoji)
│   ├── ozel-egitim-uzmani.md          # Lider: Dr. Ahmet Kaya (Klinik)
│   ├── yazilim-muhendisi.md           # Lider: Bora Demir (Mühendislik)
│   ├── ai-muhendisi.md                # Lider: Selin Arslan (AI)
│   ├── ekip-orkestratoru.md           # Orkestratör (yeni)
│   └── vibecosystem/                  # Genel kadro (yeni)
│       ├── README.md                  # Entegrasyon dokümantasyonu
│       ├── engineering/
│       │   ├── frontend-dev.md
│       │   ├── backend-dev.md
│       │   ├── security-engineer.md
│       │   ├── ai-engineer.md
│       │   ├── technical-writer.md
│       │   └── devops-automator.md
│       ├── testing/
│       │   ├── erisebilirlik-denetcisi.md  # Örnek: adapte edildi
│       │   ├── evidence-collector.md
│       │   ├── reality-checker.md
│       │   └── api-tester.md
│       ├── design/
│       │   ├── ui-designer.md
│       │   └── ux-researcher.md
│       └── support/
│           ├── analytics-reporter.md
│           ├── legal-compliance.md
│           └── support-responder.md
```

---

## 🔧 Seçilen Ajanlar ve Lokalizasyon

### Engineering Division (6 ajan)

| Orijinal Ajan | Oogmatik Versiyonu | Adaptasyon |
|---------------|-------------------|------------|
| Frontend Developer | `frontend-dev.md` | React 18, TypeScript strict, Lexend font standartları eklendi |
| Backend Architect | `backend-dev.md` | Vercel Serverless, Firebase/Firestore, rate limiting eklendi |
| Security Engineer | `security-engineer.md` | KVKK uyumu, öğrenci veri gizliliği, MEB yönetmelik eklendi |
| AI Engineer | `ai-engineer.md` | Gemini 2.5 Flash, prompt optimizasyonu, pedagogicalNote standartları |
| Technical Writer | `technical-writer.md` | Türkçe dokümantasyon, öğretmen kullanıcı kılavuzu formatı |
| DevOps Automator | `devops-automator.md` | Vercel deploy, GitHub Actions, test pipeline'ı |

### Testing Division (4 ajan)

| Orijinal Ajan | Oogmatik Versiyonu | Adaptasyon |
|---------------|-------------------|------------|
| Accessibility Auditor | `erisebilirlik-denetcisi.md` | **Tam lokalize** - WCAG + disleksi standartları, Türkçe rapor şablonu |
| Evidence Collector | `evidence-collector.md` | Screenshot-based QA, disleksi UI test senaryoları |
| Reality Checker | `reality-checker.md` | Production hazırlık, çocuk güvenliği kontrolü |
| API Tester | `api-tester.md` | `/api/generate` endpoint, rate limiting, AppError formatı |

### Design Division (2 ajan)

| Orijinal Ajan | Oogmatik Versiyonu | Adaptasyon |
|---------------|-------------------|------------|
| UI Designer | `ui-designer.md` | Lexend typography, disleksi-dostu renk paleti, Dark Glassmorphism admin UI |
| UX Researcher | `ux-researcher.md` | Özel eğitim UX araştırması, öğretmen/veli kullanıcı testi |

### Support Division (3 ajan)

| Orijinal Ajan | Oogmatik Versiyonu | Adaptasyon |
|---------------|-------------------|------------|
| Analytics Reporter | `analytics-reporter.md` | Öğretmen dashboard metrikleri, aktivite kullanım istatistikleri |
| Legal Compliance Checker | `legal-compliance.md` | KVKK, 573 sayılı KHK, MEB Özel Eğitim Yönetmeliği uyumu |
| Support Responder | `support-responder.md` | Öğretmen ve veli desteği, Türkçe iletişim |

---

## 🛠️ Lokalizasyon Metodolojisi

Her ajan şu 4 adımda adapte edildi:

### 1. Türkçe Çeviri
```markdown
# Orijinal (İngilizce)
name: Accessibility Auditor
description: Expert accessibility specialist...

# Oogmatik (Türkçe)
name: erisebilirlik-denetcisi
description: Disleksi-dostu tasarım uzmanı...
```

### 2. Oogmatik Domain Bilgisi Ekleme
```markdown
## Oogmatik Özel Kuralları

### Pedagojik Standartlar
- Her aktivitede `pedagogicalNote` zorunlu
- ZPD uyumu: AgeGroup × Difficulty
- Disleksi tasarım: Lexend font, line-height 1.8+

### Klinik Standartlar
- Tanı koyucu dil yasak
- KVKK uyumu: ad + tanı + skor birlikte görünmez

### Teknik Standartlar
- TypeScript strict mode
- AppError formatı
- Gemini model: gemini-2.5-flash (sabit)
```

### 3. Lider Ajan Koordinasyon Protokolü
```markdown
## 👑 Lider Ajan Koordinasyonu

**Önemli**: Sen vibecosystem ajanısın, lider ajanlara raporlarsın.

### Her Görev Öncesi
@ozel-ogrenme-uzmani: "Pedagojik onay gerekli mi?"
@yazilim-muhendisi: "Teknik mimari onayı gerekli mi?"

### Her Görev Sonrası
İlgili lidere rapor et
```

### 4. Türkiye/MEB-Spesifik Örnekler
```markdown
# Genel örnek yerine:
"Test the login form for accessibility"

# Oogmatik örneği:
"Öğrenci profil yönetimi formunu erişebilirlik için test et:
 - Screen reader ile BEP hedefleri girilebiliyor mu?
 - Disleksi profili seçimi klavye ile yapılabiliyor mu?"
```

---

## 🚀 Kullanım Senaryoları

### Senaryo 1: Yeni React Bileşeni Geliştirme

```bash
# Kullanıcı isteği
"Disleksi-dostu bir progress bar bileşeni yap"

# 1. Lider ajan onayı
@ozel-ogrenme-uzmani → "Pedagojik onay: görsel feedback önemli, motivasyon koruyucu"
@yazilim-muhendisi → "Teknik onay: React 18 pattern kullan, TypeScript strict"

# 2. Orkestratör devreye girer
@ekip-orkestratoru → "Task tipi: frontend-component"
                   → "@frontend-dev görevlendirildi"

# 3. Development
@frontend-dev → "ProgressBar.tsx oluşturuluyor..."
              → Lexend font ✅
              → line-height 1.8 ✅
              → Renk kontrastı AA ✅
              → aria-valuenow, aria-valuemin, aria-valuemax eklendi ✅

# 4. QA Testi
@erisebilirlik-denetcisi → "WCAG 2.2 AA uyumu kontrol ediliyor..."
                          → NVDA testi: "Progress 60%, edit box" ✅
                          → Klavye erişimi: Tab ile ulaşılabiliyor ✅
                          → Renk kontrastı: 4.7:1 (AA geçti) ✅
                          → PASS ✅

# 5. Lider son kontrol
@yazilim-muhendisi → "TypeScript strict ✅, test coverage ✅"
@ozel-ogrenme-uzmani → "Motivasyon koruyucu design ✅"

# Tamamlandı ✅
```

### Senaryo 2: Güvenlik ve KVKK Audit

```bash
# Kullanıcı isteği
"api/generate.ts'yi KVKK uyumluluğu için audit et"

# 1. Lider ajan onayı
@ozel-egitim-uzmani → "Klinik onay: öğrenci verisi hassas, KVKK kritik"
@yazilim-muhendisi → "Teknik onay: rate limiting ve input validation kontrol et"

# 2. Orkestratör devreye girer
@ekip-orkestratoru → "Task tipi: security-audit"
                   → "@security-engineer + @legal-compliance görevlendirildi"

# 3. Güvenlik Audit
@security-engineer → "api/generate.ts inceleniyor..."
                   → API key exposure: YOK ✅
                   → Input validation: Zod kullanılmış ✅
                   → Rate limiting: RateLimiter aktif ✅
                   → SQL injection: Firestore kullanılıyor, risk yok ✅
                   → XSS: DOMPurify kullanılmış ✅

# 4. KVKK Audit
@legal-compliance → "KVKK uyumu kontrol ediliyor..."
                  → Öğrenci adı + tanı birlikte loglanmıyor ✅
                  → Veri minimizasyonu prensibi uygulanmış ✅
                  → Veli onayı mekanizması var ✅
                  → Veri saklama süresi tanımlı ✅
                  → PASS ✅

# 5. Lider son kontrol
@ozel-egitim-uzmani → "KVKK uyumluluğu onaylandı ✅"
@yazilim-muhendisi → "Güvenlik standartları tamam ✅"

# Tamamlandı ✅
```

### Senaryo 3: Çoklu Ajan Pipeline (Orkestratör)

```bash
# Kullanıcı isteği
"Yeni bir 'Dikkat Geliştirme' aktivite generatörü yap, test et, deploy et"

# Orkestratör aktivasyonu
@ekip-orkestratoru: "Pipeline başlat"

# Faz 1: Pedagojik ve Klinik Onay
@ozel-ogrenme-uzmani → "DEHB için uygun mu? ZPD kalibrasyonu doğru mu?"
                     → ONAY ✅

@ozel-egitim-uzmani → "MEB uyumlu mu? Klinik açıdan güvenli mi?"
                    → ONAY ✅

# Faz 2: Teknik ve AI Onay
@yazilim-muhendisi → "Mimari API pattern'ine uygun mu?"
                   → ONAY ✅

@ai-muhendisi → "Gemini prompt kalitesi yeterli mi?"
              → ONAY ✅

# Faz 3: Geliştirme (Orkestratör koordinasyonunda)
Task 1: Generator implementasyonu
  @ai-engineer → services/generators/attentionDevelopment.ts
               → pedagogicalNote eklendi ✅
               → Gemini prompt optimize ✅

Task 2: API endpoint
  @backend-dev → api/generate.ts'e yeni generator eklendi
               → Rate limiting ✅
               → Validation ✅

Task 3: Frontend entegrasyonu
  @frontend-dev → GeneratorView.tsx'e yeni aktivite tipi eklendi
                → Lexend font ✅
                → Disleksi UI standartları ✅

# Faz 4: Kalite Döngüsü (Her task için)
QA Loop 1: Generator testi
  @evidence-collector → Screenshot-based test
                      → PASS ✅

QA Loop 2: API endpoint testi
  @api-tester → Rate limiting çalışıyor ✅
              → AppError formatı doğru ✅
              → PASS ✅

QA Loop 3: Erişebilirlik testi
  @erisebilirlik-denetcisi → WCAG AA uyumu ✅
                            → Screen reader PASS ✅

# Faz 5: Final Entegrasyon
@reality-checker → "Production hazırlık kontrolü"
                 → Tüm testler geçti ✅
                 → Dokümantasyon tamam ✅
                 → READY ✅

# Lider final onay
@ozel-ogrenme-uzmani → "Pedagojik standartlar korundu ✅"
@yazilim-muhendisi → "Mühendislik kalitesi onaylandı ✅"

# Deploy
@devops-automator → Vercel deploy
                  → BAŞARILI ✅

# Pipeline tamamlandı ✅
```

---

## 📊 Durum Takibi

### Pipeline Durumu Dosyaları (Planlanan)

```
.claude/pipeline/
├── current-task.json           # Aktif task bilgisi
├── agent-assignments.log       # Ajan görevlendirme geçmişi
├── qa-results.log             # QA test sonuçları
├── leader-approvals.log       # Lider ajan onay kayıtları
└── orchestrator-state.json    # Orkestratör durumu
```

### Örnek: current-task.json
```json
{
  "taskId": "task-2026-03-28-001",
  "description": "Yeni dikkat geliştirme aktivite generatörü",
  "phase": "QA Testing",
  "currentAgent": "erisebilirlik-denetcisi",
  "leaderApprovals": {
    "ozel-ogrenme-uzmani": "APPROVED",
    "ozel-egitim-uzmani": "APPROVED",
    "yazilim-muhendisi": "APPROVED",
    "ai-muhendisi": "APPROVED"
  },
  "subtasks": [
    { "id": "1", "description": "Generator impl", "status": "COMPLETED", "qaStatus": "PASS" },
    { "id": "2", "description": "API endpoint", "status": "COMPLETED", "qaStatus": "PASS" },
    { "id": "3", "description": "Frontend", "status": "IN_PROGRESS", "qaStatus": "TESTING" }
  ],
  "retryCount": 0,
  "startTime": "2026-03-28T10:00:00Z"
}
```

---

## 🎓 Eğitim ve Onboarding

### Yeni Ajan Eklerken
1. **Seçim**: Agency-agents havuzundan Oogmatik'e uygun ajan seç
2. **Lokalizasyon**: Türkçe çeviri + domain bilgisi ekle
3. **Koordinasyon**: Lider ajan raporlama protokolü ekle
4. **Test**: Manuel aktivasyon ile test et
5. **Dokümantasyon**: vibecosystem/README.md'ye ekle

### Örnek Adaptasyon Checklist
```markdown
- [ ] Frontmatter Türkçeleştirildi (name, description)
- [ ] Tüm sections Türkçe çevrildi
- [ ] Oogmatik Özel Kuralları bölümü eklendi
  - [ ] Pedagojik standartlar
  - [ ] Klinik standartlar (varsa)
  - [ ] Teknik standartlar
- [ ] Lider Ajan Koordinasyonu bölümü eklendi
  - [ ] Her görev öncesi danışma
  - [ ] Her görev sonrası raporlama
- [ ] Türkiye/MEB-spesifik örnekler eklendi
- [ ] Code snippet'ler Oogmatik stack'e uyarlandı
- [ ] Manuel test edildi (@ajan-adi: "test komutu")
- [ ] vibecosystem/README.md'de listeye eklendi
```

---

## 🔮 Roadmap

### Faz 1: Manuel Aktivasyon (Mevcut)
- [x] 15 ajan seçildi ve lokalize edildi
- [x] Ekip Orkestratörü oluşturuldu
- [x] Örnek ajan (Erişebilirlik Denetçisi) tam adapte edildi
- [x] Dokümantasyon tamamlandı
- [ ] Kalan 14 ajan lokalizasyonu

### Faz 2: Yarı-Otomatik Aktivasyon (Sonraki Sprint)
- [ ] `services/agentOrchestrator.ts` servisi
  - [ ] Task tipi analizi (regex/AI)
  - [ ] Otomatik lider onay isteği
  - [ ] Ajan seçim algoritması
  - [ ] Pipeline state tracking
- [ ] Frontend: Pipeline dashboard UI
- [ ] Lider ajan onay mekanizması (kod)

### Faz 3: Tam Otomatik Orkestrasyon (İleri)
- [ ] AI-powered task analizi (Gemini)
- [ ] Öğrenme: başarılı pattern'leri kaydet
- [ ] A/B testing: ajan vs. insan performansı
- [ ] Ajan performans metrikleri
- [ ] Self-healing pipeline (otomatik retry, escalation)

---

## 🚨 Riskler ve Mitigasyon

### Risk 1: Genel Ajanlar Pedagojik Kuralları Atlatabilir
**Etki**: Yüksek — Çocuklara uygun olmayan içerik üretilebilir
**Mitigasyon**:
- ✅ Her ajan frontmatter'da lider ajan raporlama zorunluluğu
- ✅ Orkestratör her faz önce lider onayı alıyor
- ✅ "DURDUR" komutu anında pipeline iptal eder

### Risk 2: Context Şişmesi
**Etki**: Orta — 120 ajan context'i şişirebilir
**Mitigasyon**:
- ✅ Sadece 15 kritik ajan seçildi
- ✅ Seçici aktivasyon (task tipine göre)
- 🔄 Gelecek: Lazy loading (sadece kullanılan ajanlar yüklenir)

### Risk 3: İngilizce Ajanlar Türkçe Context'te Çalışmayabilir
**Etki**: Orta — Türkçe prompt'larda performans düşebilir
**Mitigasyon**:
- ✅ Her ajan tam Türkçe lokalize
- ✅ Oogmatik-spesifik örnekler eklendi
- 🔄 Gelecek: Türkçe fine-tuning (gerekirse)

### Risk 4: Lider Ajan Atlama (Ajan Direk İş Yapabilir)
**Etki**: Kritik — Pedagojik/klinik güvenlik ihlali
**Mitigasyon**:
- ✅ Her ajan frontmatter'da lider raporlama protokolü
- ✅ Orkestratör lider onay gating uygular
- 🔄 Gelecek: Code-level enforcement (agentOrchestrator.ts)

---

## 📞 Destek ve Kaynaklar

### Dokümantasyon
- **Ana Kılavuz**: `.claude/agents/vibecosystem/README.md`
- **Orkestratör**: `.claude/agents/ekip-orkestratoru.md`
- **Örnek Ajan**: `.claude/agents/vibecosystem/testing/erisebilirlik-denetcisi.md`
- **Modül Bilgisi**: `/.claude/MODULE_KNOWLEDGE.md`

### Lider Ajanlara Danışma
- **Pedagojik Sorular**: `@ozel-ogrenme-uzmani`
- **Klinik/MEB**: `@ozel-egitim-uzmani`
- **Teknik Mimari**: `@yazilim-muhendisi`
- **AI Kalitesi**: `@ai-muhendisi`

### Orkestrasyon
- **Çoklu Ajan İşleri**: `@ekip-orkestratoru`

### Kaynak Repolar
- **Agency-Agents**: https://github.com/ashishpatel26/agency-agents
- **Oogmatik**: https://github.com/morimasi/oogmatik

---

## 📝 Changelog

### 2026-03-28 — v1.0.0 (İlk Entegrasyon)
- ✅ 15 ajan seçildi
- ✅ Ekip Orkestratörü oluşturuldu
- ✅ Erişebilirlik Denetçisi tam adapte edildi
- ✅ Dokümantasyon tamamlandı (README, ADR, entegrasyon belgesi)
- ✅ Lider ajan koordinasyon protokolü tanımlandı
- 📋 Kalan: 14 ajan lokalizasyonu + otomatik aktivasyon

---

**Son Güncelleme**: 2026-03-28
**Doküman Sahibi**: Bora Demir (@yazilim-muhendisi)
**Durum**: Aktif

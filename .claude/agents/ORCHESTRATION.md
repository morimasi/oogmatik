# 🎭 Ajan Orkestrasyon Sistemi

> **Otomatik Ajan Koordinasyonu**
> Bu dosya, Oogmatik'te çalışan tüm ajanların otomatik koordinasyonunu sağlar.

---

## 🎯 Sistem Amacı

Her kullanıcı isteğinde:
1. **Otomatik görev sınıflandırması** (pedagojik mi, teknik mi, güvenlik mi?)
2. **İlgili lider ajanları otomatik aktive etme**
3. **Supporting ajanları lider onayı ile devreye sokma**
4. **Koordineli çalışma sağlama** (çakışma yok, hiyerarşi net)

---

## 📋 Aktivasyon Kuralları

### Kural 1: Pedagojik İçerik

**Tetikleyiciler**: `aktivite`, `çalışma kâğıdı`, `öğrenci profili`, `pedagojik`, `öğrenme hedefi`, `ZPD`

**Aktive Olan Ajanlar**:
- ✅ **Elif Yıldız** (ZORUNLU — Pedagoji Lider)
- 🔄 Dr. Ahmet Kaya (Opsiyonel — klinik içerik varsa)

**Supporting Ajanlar**: Yok (pedagojik kararlar sadece Elif verir)

**Örnekler**:
```
Kullanıcı: "Yeni okuma aktivitesi oluştur"
→ Elif aktive edilir
→ pedagogicalNote, ZPD uyumu, başarı odaklı tasarım kontrol edilir
```

---

### Kural 2: Klinik İçerik

**Tetikleyiciler**: `BEP`, `RAM`, `tanı`, `klinik`, `MEB`, `özel eğitim yönetmeliği`, `KVKK`, `gizlilik`

**Aktive Olan Ajanlar**:
- ✅ **Dr. Ahmet Kaya** (ZORUNLU — Klinik Lider)
- 🔄 Elif Yıldız (Opsiyonel — pedagojik bağlam varsa)

**Supporting Ajanlar**: Yok (klinik kararlar sadece Dr. Ahmet verir)

**Örnekler**:
```
Kullanıcı: "BEP hedefi yaz"
→ Dr. Ahmet aktive edilir
→ SMART format, MEB uyumu, KVKK gizliliği kontrol edilir
```

---

### Kural 3: Frontend Geliştirme

**Tetikleyiciler**: `UI`, `bileşen`, `React`, `Tailwind`, `Lexend`, `erişilebilirlik`, `WCAG`, `disleksi-dostu`

**Aktive Olan Ajanlar**:
- ✅ **Bora Demir** (ZORUNLU — Teknik Lider)
- 🔄 Elif Yıldız (Opsiyonel — pedagojik UI gereklilikleri varsa)
- 🤖 **frontend-developer-oozel** (Supporting — Bora + Elif onayı ile)

**İş Akışı**:
```
Kullanıcı: "Yeni React bileşeni oluştur"
  ↓
1. Bora → Teknik gereksinim analizi
2. Elif → Pedagojik UI standartları (Lexend, satır aralığı, vb.)
3. Bora + Elif → Onay
  ↓
4. frontend-developer-oozel → Implementasyon
  ↓
5. Bora → Son teknik kontrol
6. Elif → Son pedagojik kontrol
```

**Örnekler**:
```
Kullanıcı: "Disleksi-dostu buton tasarla"
→ Bora + Elif + frontend-developer-oozel aktive edilir
→ Lexend font, geniş satır aralığı, WCAG AAA kontrol edilir
```

---

### Kural 4: Backend Geliştirme

**Tetikleyiciler**: `API`, `endpoint`, `database`, `Firestore`, `veri modeli`, `BEP veri yapısı`, `KVKK`, `rate limiting`

**Aktive Olan Ajanlar**:
- ✅ **Bora Demir** (ZORUNLU — Teknik Lider)
- 🔄 Dr. Ahmet Kaya (Opsiyonel — KVKK/veri gizliliği varsa)
- 🤖 **backend-architect-oozel** (Supporting — Bora onayı ile)

**İş Akışı**:
```
Kullanıcı: "Yeni API endpoint ekle"
  ↓
1. Bora → Mimari tasarım, rate limiting, AppError standardı
2. Dr. Ahmet → (eğer öğrenci verisi varsa) KVKK uyumu
3. Bora → Onay
  ↓
4. backend-architect-oozel → Implementasyon
  ↓
5. Bora → Son kontrol (rate limiting, error handling)
```

**Örnekler**:
```
Kullanıcı: "Firestore'da BEP koleksiyonu tasarla"
→ Bora + Dr. Ahmet + backend-architect-oozel aktive edilir
→ KVKK veri ayrışması, BEP SMART format kontrol edilir
```

---

### Kural 5: Güvenlik ve Veri Gizliliği

**Tetikleyiciler**: `güvenlik`, `security`, `KVKK`, `veri gizliliği`, `şifreleme`, `encryption`, `Firestore rules`, `RBAC`, `audit log`

**Aktive Olan Ajanlar**:
- ✅ **Bora Demir** (ZORUNLU — Teknik Lider)
- ✅ **Dr. Ahmet Kaya** (ZORUNLU — Klinik/KVKK Lider)
- 🤖 **security-engineer-oozel** (Supporting — Bora + Ahmet onayı ile)

**İş Akışı**:
```
Kullanıcı: "KVKK uyumu kontrol et"
  ↓
1. Dr. Ahmet → KVKK yasal gereksinimler
2. Bora → Teknik güvenlik standartları
3. Bora + Ahmet → Onay
  ↓
4. security-engineer-oozel → Threat modeling, Firestore rules, encryption
  ↓
5. Bora → Teknik güvenlik doğrulama
6. Ahmet → KVKK uyum doğrulama
```

**Örnekler**:
```
Kullanıcı: "Öğrenci tanı bilgisini şifrele"
→ Bora + Dr. Ahmet + security-engineer-oozel aktive edilir
→ AES-256 encryption, audit logging, Firestore rules kontrol edilir
```

---

### Kural 6: AI Model/Prompt Geliştirme

**Tetikleyiciler**: `AI`, `Gemini`, `prompt`, `generatör`, `JSON schema`, `token`, `hallucination`, `model`

**Aktive Olan Ajanlar**:
- ✅ **Selin Arslan** (ZORUNLU — AI Lider)
- 🔄 Elif Yıldız (Opsiyonel — pedagojik prompt tasarımı varsa)

**Supporting Ajanlar**: Yok (AI kararlar sadece Selin verir)

**Örnekler**:
```
Kullanıcı: "Yeni prompt şablonu yaz"
→ Selin + Elif aktive edilir
→ Prompt anatomisi, JSON schema, pedagogicalNote dahil edilir
```

---

### Kural 7: Tam Özellik Geliştirme

**Tetikleyiciler**: `yeni modül`, `stüdyo`, `değerlendirme sistemi`, `tam özellik`

**Aktive Olan Ajanlar**:
- ✅ **Elif Yıldız** (ZORUNLU — Pedagoji)
- ✅ **Bora Demir** (ZORUNLU — Teknik)
- ✅ **Selin Arslan** (ZORUNLU — AI)
- 🔄 Dr. Ahmet Kaya (Opsiyonel — klinik içerik varsa)
- 🤖 **Tüm Supporting Ajanlar** (Lider onayları ile)

**İş Akışı**:
```
Kullanıcı: "Yeni matematik stüdyosu ekle"
  ↓
1. Elif → Pedagojik tasarım (ZPD, CRA basamakları)
2. Selin → AI generatör tasarımı (prompt, schema)
3. Bora → Teknik mimari (React, Firestore, API)
4. Tüm liderler → Onay
  ↓
5. frontend-developer-oozel → UI bileşenleri
6. backend-architect-oozel → API endpoint'leri
7. security-engineer-oozel → Güvenlik kontrolleri
  ↓
8. Elif → Pedagojik son kontrol
9. Selin → AI çıktı kalitesi kontrol
10. Bora → Teknik son kontrol
```

---

### Kural 8: Görsel Modernizasyon (update.md v3.0 Ultra Premium)

**Tetikleyiciler**: `tema`, `theme`, `renk paleti`, `CSS değişken`, `glassmorphism`, `animasyon`,
`micro-animation`, `HSL`, `print trigger`, `A4 izolasyon`, `dark mode`, `UI modernizasyon`,
`update.md`, `shimmer`, `glow`, `focus mode`, `hover efekti`, `tema token`

**Aktive Olan Ajanlar**:
- ✅ **Bora Demir** (ZORUNLU — CSS/TypeScript mimarisi)
- 🔄 Elif Yıldız (Opsiyonel — pedagojik UI gereklilikleri; Dual-Coding, Focus Mode)
- 🔄 Selin Arslan (Opsiyonel — AI Palette Reflection, Loading animasyonları)
- 🤖 **frontend-developer-oozel** (Supporting — Bora onayı ile)

**İş Akışı**:
```
Kullanıcı: "Yeni tema ekle" / "Hover animasyonu ekle" / "Glassmorphism güncelle"
  ↓
1. Bora → CSS değişken mimarisi, TypeScript uyumu, A4 izolasyon kontrolü
2. Elif (isteğe bağlı) → Bilişsel konfor, Dual-Coding uyumluluğu
3. Selin (isteğe bağlı) → AI Palette Reflection entegrasyonu
  ↓
4. frontend-developer-oozel → src/styles/theme-tokens.css güncelleme
  ↓
5. Bora → Son kontrol: A4 izolasyon sızıntısı yok, TypeScript strict
6. Elif (isteğe bağlı) → Visual fatigue, Lexend font değişmedi
```

**Kritik Kısıtlar (Bora Demir onayı zorunlu)**:
- A4 `.worksheet-page` asla tema rengine maruz kalamaz (Faz 4 izolasyonu)
- `--surface-glass` dark temalar: %5 beyaz opaklık / light: %3 siyah opaklık
- HSL değişkenleri `--accent-h`, `--accent-s`, `--accent-l` formatında
- Lexend font asla değiştirilemez

**Örnekler**:
```
Kullanıcı: "Yeni bir purple tema ekle"
→ Bora aktive edilir
→ theme-tokens.css'e :root.theme-purple eklenir
→ AppTheme tipine eklenir
→ SettingsModal'a eklenir

Kullanıcı: "Hover'da kart glow efekti ekle"
→ Bora + frontend-developer-oozel aktive edilir
→ .card-glow CSS sınıfı theme-tokens.css'e eklenir
→ İlgili bileşenlere sınıf uygulanır
```

---

## 🚨 Veto Sistemi

### Mutlak Kural: Her Lider DURDUR Diyebilir

```
Elif: "Bu aktivite ZPD dışında, çocuk başarısız olur"
  → TÜM SİSTEM DURUR

Dr. Ahmet: "Bu KVKK ihlali, öğrenci adı + tanı birlikte görünüyor"
  → TÜM SİSTEM DURUR

Bora: "Bu endpoint güvenlik açığı içeriyor, rate limiting yok"
  → TÜM SİSTEM DURUR

Selin: "Bu prompt hallucination riski çok yüksek"
  → TÜM SİSTEM DURUR
```

**VETO OVERRIDE EDİLEMEZ** — İtiraz edilemez.

---

## 🔄 Otomatik Koordinasyon Mantığı

### Senaryo 1: Basit UI Değişikliği

```yaml
Kullanıcı: "Bu butonu mavi yap"

Sınıflandırma: Frontend (küçük değişiklik)

Aktive Ajanlar:
  - Bora (teknik onay)

Supporting Ajanlar:
  - Yok (basit değişiklik, supporting ajan gereksiz)

İş Akışı:
  1. Bora → Tailwind sınıfını değiştir, commit et
```

---

### Senaryo 2: Yeni Aktivite Generatörü

```yaml
Kullanıcı: "Disleksi için hece parkuru aktivitesi ekle"

Sınıflandırma: Pedagojik + AI

Aktive Ajanlar:
  - Elif (pedagojik tasarım)
  - Selin (AI prompt + schema)

Supporting Ajanlar:
  - Yok (lider ajanlar yeterli)

İş Akışı:
  1. Elif → Pedagojik tasarım (heceleme, renkli vurgulama)
  2. Selin → Prompt + JSON schema
  3. Elif + Selin → Onay
  4. Implementasyon (services/generators/heceParku.ts)
```

---

### Senaryo 3: Tam KVKK Uyum Taraması

```yaml
Kullanıcı: "Tüm platformu KVKK uyumu açısından tara"

Sınıflandırma: Security + Clinical (Kritik Görev)

Aktive Ajanlar:
  - Bora (teknik güvenlik)
  - Dr. Ahmet (KVKK yasal)
  - security-engineer-oozel (supporting)

Supporting Ajanlar:
  - security-engineer-oozel

İş Akışı:
  1. Dr. Ahmet + Bora → Risk assessment (öğrenci verisi nerede?)
  2. Bora + Ahmet → Onay
  3. security-engineer-oozel → Threat modeling, Firestore rules audit
  4. Bora → Teknik doğrulama
  5. Ahmet → KVKK uyum raporu
```

---

## 📊 Ajan Aktivasyon Matrisi

| Görev Türü | Elif | Ahmet | Bora | Selin | Frontend | Backend | Security |
|------------|------|-------|------|-------|----------|---------|----------|
| **Pedagojik İçerik** | ✅ | 🔄 | ❌ | ❌ | ❌ | ❌ | ❌ |
| **Klinik İçerik** | 🔄 | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **Frontend UI** | 🔄 | ❌ | ✅ | ❌ | 🤖 | ❌ | ❌ |
| **Backend API** | ❌ | 🔄 | ✅ | ❌ | ❌ | 🤖 | ❌ |
| **Güvenlik/KVKK** | ❌ | ✅ | ✅ | ❌ | ❌ | ❌ | 🤖 |
| **AI Prompt** | 🔄 | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ |
| **Tam Özellik** | ✅ | 🔄 | ✅ | ✅ | 🤖 | 🤖 | 🤖 |

**Lejant**:
- ✅ = ZORUNLU
- 🔄 = Opsiyonel (duruma göre)
- 🤖 = Supporting (lider onayı sonrası)
- ❌ = Devrede değil

---

## 🎓 Örnek Koordinasyon Senaryoları

### Örnek 1: "ReadingStudio'ya yeni aktivite türü ekle"

```
Sınıflandırma: Tam Özellik (frontend + backend + pedagojik + AI)

Adım 1: Lider Ajanlar Toplantısı
  - Elif: "Hangi okuma becerisi hedefleniyor? ZPD uyumu nasıl?"
  - Selin: "Hangi prompt şablonları kullanılacak? JSON schema?"
  - Bora: "React bileşeni nereye entegre? API endpoint gerekli mi?"

Adım 2: Lider Onayları
  - Elif: ✅ "Pedagojik olarak uygun"
  - Selin: ✅ "AI çıktı kalitesi garanti"
  - Bora: ✅ "Teknik olarak sağlam"

Adım 3: Supporting Ajanlar Devreye Girer
  - frontend-developer-oozel → React bileşeni yaz
  - backend-architect-oozel → API endpoint ekle (gerekirse)
  - security-engineer-oozel → Rate limiting + validation

Adım 4: Lider Doğrulama
  - Elif → pedagogicalNote kontrol
  - Selin → AI çıktı test
  - Bora → TypeScript strict, error handling kontrol
```

---

## 💡 Kullanım Kılavuzu

### Claude Code'da Nasıl Kullanılır?

**Otomatik Koordinasyon** (Önerilir):
```
Kullanıcı: "Yeni matematik aktivitesi tasarla"
→ Sistem otomatik olarak Elif + Selin'i aktive eder
```

**Manuel Koordinasyon**:
```
Kullanıcı: "Elif ve Bora, bu UI bileşenini inceleyin"
→ Sadece belirtilen ajanlar aktive edilir
```

---

## 🔧 Gelecek Geliştirmeler

- [ ] Otomatik task classification (AI tabanlı)
- [ ] Ajan performans metrikleri (hangi ajan ne kadar başarılı?)
- [ ] Koordinasyon geçmişi (hangi görevlerde hangi ajanlar çalıştı?)
- [ ] Ajan öğrenme sistemi (başarılı pattern'leri hatırla)

---

**Orkestrasyon Motoru v1.0** — Tüm ajanlar koordineli çalışıyor, çakışma yok, hiyerarşi net.

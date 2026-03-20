# Universal Worksheet Viewer

## Overview
The Universal Worksheet Viewer allows users to view and interact with various worksheet formats seamlessly. This tool is designed with user-friendly features to enhance productivity.

## Features
### FAZA 1-5 Features
- **FAZA 1**: Basic viewing capabilities for standard worksheet formats.
- **FAZA 2**: Enhanced performance for large files with quick rendering.
- **FAZA 3**: Multi-format support including CSV, XLSX, and PDF.
- **FAZA 4**: Collaborative features that allow for multiple users to view and edit documents in real-time.
- **FAZA 5**: Export options to various formats following user preferences.

## Installation
1. Clone the repository:
   ```bash
   git clone https://github.com/morimasi/oogmatik.git
   ```
2. Navigate to the project directory:
   ```bash
   cd oogmatik
   ```
3. Install the required dependencies:
   ```bash
   npm install
   ```
4. Start the application:
   ```bash
   npm start
   ```

## vibecosystem Kurulumu

[vibecosystem](https://github.com/vibeeval/vibecosystem), Claude Code'u 119 özelleşmiş ajandan oluşan tam bir yapay zeka ekibine dönüştürür.

Kurulum için:
```bash
git clone https://github.com/morimasi/oogmatik.git
cd oogmatik
./install.sh
```

### Seçenekler

| Parametre | Açıklama |
|-----------|----------|
| `--force` | Mevcut dosyaların üzerine yazar |
| `--help`  | Yardım mesajını gösterir |

> **Not:** Kurulum `~/.claude/` dizinine ajanlar, beceriler, hook'lar ve kurallar ekler. Mevcut dosyalarınız varsayılan olarak korunur.

---

## 🧑‍💼 Oogmatik'e Özel Ekip Ajanları

Oogmatik, vibecosystem'in 119 genel ajanına ek olarak bu projeye özgü **4 özel ekip üyesi** içerir. Bu ajanlar `.claude/agents/` dizininde tanımlıdır ve Claude Code ile bu projede çalışırken otomatik olarak devreye girer.

| Ajan | Kimlik | Ne Zaman Devreye Girer |
|------|--------|------------------------|
| **özel-öğrenme-uzmanı** | Elif Yıldız — Pedagoji Danışmanı | Aktivite tasarımı, içerik kalitesi, öğrenme stili uyumu |
| **özel-eğitim-uzmanı** | Dr. Ahmet Kaya — Klinik Danışman | BEP modülü, disleksi/DEHB protokolleri, MEB mevzuatı |
| **yazılım-mühendisi** | Bora Demir — Full-Stack Mühendis | API geliştirme, test, TypeScript mimarisi, güvenlik |
| **ai-mühendisi** | Selin Arslan — AI Mimarı | Gemini/Claude entegrasyonu, prompt engineering, AI kalitesi |

---

## 📍 Bu Ajanlar Nerede ve Ne Zaman Çalışır?

### Kapsam: Sadece Oogmatik Projesi İçinde

`.claude/agents/` dizinindeki ajanlar **yalnızca bu projenin klasöründe** Claude Code kullanırken aktiftir. Başka bir projede ya da farklı bir klasörde Claude açtığında bu ajanlar **görünmez**.

```
~/Desktop/
├── oogmatik/           ← 🟢 Burada açarsan: tüm ajanlar aktif
│   └── .claude/
│       └── agents/     ← proje ajanları buradan okunur
│
├── baska-proje/        ← 🔴 Burada açarsan: oogmatik ajanları yok
└── belgeler/           ← 🔴 Burada açarsan: oogmatik ajanları yok
```

`~/.claude/agents/` (vibecosystem ajanları) ise **her yerde** çalışır — o ajanlar global.

---

### 🖥️ Adım Adım Kullanım Kılavuzu

#### 1. Claude Code'u Oogmatik Klasöründe Aç

```bash
cd oogmatik          # önce projenin klasörüne gir
claude               # sonra Claude Code'u başlat
```

> ⚠️ `claude` komutunu `~/Desktop` veya `Documents` gibi başka bir yerden açarsan oogmatik ajanlarını bulamazsın. **Her zaman önce `cd oogmatik` yap.**

#### 2. Ajanı Çağır

İki yol var:

**Yol A — Claude'un Otomatik Seçmesine Bırak (Önerilen)**

Normal Türkçe ile yaz, Claude doğru ajanı kendisi seçer:

```
Sen: "Disleksi için yeni bir hece birleştirme aktivitesi ekle"
→ Claude: özel-öğrenme-uzmanı + yazılım-mühendisi devreye girer
```

```
Sen: "BEP modülündeki hedef yazımı MEB standartlarına uygun mu?"
→ Claude: özel-eğitim-uzmanı devreye girer
```

```
Sen: "Gemini API çağrısı çok yavaş, optimize et"
→ Claude: ai-mühendisi devreye girer
```

**Yol B — Direkt Ajan Belirt**

```
Sen: "@ozel-ogrenme-uzmani bu aktivitenin zorluk seviyesi 3. sınıf için uygun mu?"
Sen: "@yazilim-muhendisi api/generate.ts dosyasındaki güvenlik açıklarını kontrol et"
Sen: "@ai-muhendisi mevcut prompt'u daha az token kullanacak şekilde düzenle"
```

#### 3. Sık Kullanım Örnekleri

| İstediğin | Ne Yazacaksın |
|-----------|---------------|
| Yeni aktivite türü ekle | `"okuma akıcılığı için yeni bir aktivite generatörü yaz"` |
| Pedagojik kontrol | `"@ozel-ogrenme-uzmani bu çalışma sayfası DEHB'li öğrenciler için uygun mu?"` |
| API güvenlik denetimi | `"@yazilim-muhendisi yeni endpoint'i güvenlik açısından incele"` |
| Prompt iyileştirme | `"@ai-muhendisi dyslexiaSupport.ts'deki promptları kalite açısından değerlendir"` |
| BEP dokümanı | `"@ozel-egitim-uzmani 3. sınıf disleksili öğrenci için örnek BEP hedefleri oluştur"` |

---

### 🌍 Global Ajan Kurmak İstersen

Bir ajanın **tüm projelerinde** çalışmasını istiyorsan `~/.claude/agents/` klasörüne kopyala:

```bash
# Sadece ai-mühendisini her projede kullanmak istiyorum:
cp .claude/agents/ai-muhendisi.md ~/.claude/agents/ai-muhendisi.md
```

Bu işlemden sonra herhangi bir klasörde Claude Code açsan bile `@ai-muhendisi` çağrılabilir olur.

---

### Yeni Ajan Eklemek

Proje ekibine yeni bir uzman eklemek için `.claude/agents/` dizinine bir `.md` dosyası oluştur:

```markdown
---
name: uzman-adi
description: Kısa açıklama — ne yapar, ne zaman çağrılır
model: opus  # veya sonnet, haiku
tools: [Read, Edit, Write, Bash, Grep, Glob]
---

# Uzman Adı — Karakter İsmi

[Kişilik ve geçmiş hikayesi]

## Uzmanlık Alanları
[Liste]

## Oogmatik'e Özel Görevler
[Proje bağlamına özel talimatlar]
```

Dosyayı kaydet — Claude Code'u yeniden başlatmana gerek yok, bir sonraki konuşmada ajan hemen aktif olur.

---

## 🚀 vibecosystem'in Oogmatik Uygulamasına Etkisi

### ✅ Uygulamaya Doğrudan Etkisi Yok

`install.sh` betiği yalnızca **geliştirici ortamını** etkiler — oogmatik uygulamasının çalışma mantığını, kodunu veya performansını **hiçbir şekilde değiştirmez**.

- React/TypeScript kaynak koduna dokunulmaz
- `package.json`, `vite.config.ts`, API endpoint'leri değişmez
- Production/deployment yapılandırması aynı kalır
- Uygulama kullanıcıları hiçbir fark hissetmez

### 🤖 Geliştirme Sürecine Etkisi

vibecosystem kurulumundan sonra **Claude Code** ile bu projeyi geliştirirken otomatik olarak bir yapay zeka ekibi devreye girer:

| Görev | Devreye Giren Ajanlar |
|-------|----------------------|
| `"yeni özellik ekle"` | `scout` → `architect` → `frontend-dev` → `code-reviewer` |
| `"bug düzelt"` | `sleuth` → `backend-dev` → `verifier` |
| `"güvenlik kontrol et"` | `security-analyst` → `code-reviewer` |
| `"test yaz"` | `tdd-guide` → `qa-engineer` |
| `"API endpoint ekle"` | `backend-dev` → `graphql-expert` → `security-analyst` |

### 🪝 Hook'ların Oogmatik'e Özel Katkısı

48 hook, Claude Code'un her araç çağrısını izler ve **oogmatik bağlamına** göre otomatik olarak ek bilgi enjekte eder:

```
"fix the bug"       → compiler-in-loop + error-broadcast     (~2,400 token)
"add api endpoint"  → edit-context + signature-helper         (~3,100 token)
"explain this code" → (ek bağlam yok)                        (~800 token)
```

Bu sayede örneğin oogmatik'in `api/generate.ts` veya `hooks/useWorksheets.ts` dosyalarında çalışırken Claude otomatik olarak TypeScript tip bilgileri ve proje mimarisini anlayarak daha doğru kod üretir.

### 🧠 Öz-Öğrenme: Oogmatik Hatalarından Ders Çıkarır

vibecosystem'in **Self-Learning Pipeline** özelliği, bu projede yapılan her hatayı otomatik olarak bir kurala dönüştürür:

```
Oogmatik'te hata oluşur
    → passive-learner hatayı yakalar ve etiketler
    → consolidator benzer hataları gruplar (5+ tekrar → kural)
    → Sonraki oturumda aynı hata tipi önlenir
    → 2+ projede aynı hata → global kural haline gelir
```

Örneğin `RateLimiter` veya `Validators` testlerinde tekrar eden bir hata tipi varsa, sistem bunu öğrenir ve bir daha aynı hatanın yazılmasını engeller.

### 📋 Özet

| Alan | Etki |
|------|------|
| Çalışan uygulama (production) | ❌ Etkilenmez |
| npm build / vite / deploy | ❌ Etkilenmez |
| Uygulama kullanıcıları | ❌ Etkilenmez |
| Claude Code geliştirme hızı | ✅ Artar |
| Kod kalitesi (otomatik review) | ✅ Artar |
| Hata tekrarlanma oranı | ✅ Azalır |
| Güvenlik açığı tespiti | ✅ Otomatikleşir |

## Usage
To use the Universal Worksheet Viewer:
1. Open the application in your web browser.
2. Upload your worksheet file.
3. Utilize the interactive features to view and edit as necessary.

## Technology Stack
- **Frontend**: React.js
- **Backend**: Node.js with Express
- **Database**: MongoDB
- **Deployment**: Docker for containerization

---
For more information, check the documentation or contact the support team.
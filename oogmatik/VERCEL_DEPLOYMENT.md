# Vercel Deployment Guide - Oogmatik

## 📋 Sorun ve Çözüm

### Hata
```
Error: The pattern "api/generate.ts" defined in `functions` doesn't match any Serverless Functions inside the `api` directory.
```

### Kök Neden
Vercel, API route'larını **root dizininde** `api/` klasörü altında bekliyor. Projenizde API dosyaları `src/api/` altındaydı.

---

## ✅ Yapılan Değişiklikler

### 1. API Klasörü Root'a Taşındı
```powershell
# src/api/ → api/
Copy-Item -Path "src\api" -Destination "api" -Recurse
```

**Dosya Yapısı:**
```
oogmatik/
├── api/                    ✅ Vercel API Routes (Root)
│   ├── generate.ts
│   ├── feedback.ts
│   ├── worksheets.ts
│   ├── ai/
│   │   └── generate-image.ts
│   └── user/
│       └── paperSize.ts
├── src/
│   └── api/                📁 Kaynak kod (geliştirme için)
└── vercel.json
```

---

### 2. Import Path'leri Güncellendi

API dosyaları root'ta olduğu için import path'leri `../src/` olarak güncellendi:

#### `api/generate.ts`
```typescript
// ❌ Önce
import { AppError } from '../utils/AppError.js';
import { RateLimiter } from '../services/rateLimiter.js';

// ✅ Sonra
import { AppError } from '../src/utils/AppError.js';
import { RateLimiter } from '../src/services/rateLimiter.js';
```

#### `api/feedback.ts`
```typescript
// ❌ Önce
import { AppError } from '../utils/AppError.js';

// ✅ Sonra
import { AppError } from '../src/utils/AppError.js';
```

#### `api/worksheets.ts`
```typescript
// ❌ Önce
import { worksheetService } from '../services/worksheetService.js';
import { permissionService } from '../middleware/permissionValidator.js';

// ✅ Sonra
import { worksheetService } from '../src/services/worksheetService.js';
import { permissionService } from '../src/middleware/permissionValidator.js';
```

---

### 3. Vercel Konfigürasyonu Güncellendi

#### `vercel.json`
```json
{
  "rewrites": [
    { "source": "/api/(.*)", "destination": "/api/$1" }
  ],
  "functions": {
    "api/*.ts": {
      "memory": 1024,
      "maxDuration": 30
    }
  },
  "outputDirectory": "dist"
}
```

**Eklenen Özellikler:**
- ✅ `functions` tanımlaması - API route'ları için bellek ve timeout ayarları
- ✅ `outputDirectory` - Build output dizini
- ✅ Memory: 1024 MB (AI işlemleri için)
- ✅ Max Duration: 30 saniye

---

### 4. TypeScript Config Eklendi

#### `api/tsconfig.json`
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "lib": ["ES2020"],
    "outDir": "./dist",
    "rootDir": "./",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "moduleResolution": "node",
    "types": ["@vercel/node"]
  },
  "include": [
    "*.ts",
    "ai/**/*.ts",
    "user/**/*.ts"
  ],
  "exclude": [
    "node_modules",
    "dist",
    "../src"
  ]
}
```

**Önemli:** `include` pattern'ları `api/` klasörü içinde relative olarak tanımlanır:
- ✅ `"*.ts"` - Root level API dosyaları (generate.ts, feedback.ts, worksheets.ts)
- ✅ `"ai/**/*.ts"` - Alt klasörlerdeki API dosyaları
- ✅ `"user/**/*.ts"` - User endpoint'leri
- ❌ `"../src"` hariç (çakışmayı önler)

---

## 🚀 Deployment Adımları

### 1. Gerekli Bağımlılıklar
```bash
npm install --save-dev @vercel/node
```

### 2. Build ve Test
```bash
# Development build
npm run build

# Vercel CLI ile lokal test
vercel dev
```

### 3. API Endpoint'lerini Test Et
```bash
# Generate API
curl -X POST http://localhost:3000/api/generate \
  -H "Content-Type: application/json" \
  -d '{"prompt":"test"}'

# Feedback API
curl -X POST http://localhost:3000/api/feedback \
  -H "Content-Type: application/json" \
  -d '{"activityType":"test","rating":5}'
```

### 4. Production Deploy
```bash
# Vercel'e deploy
vercel --prod
```

---

## 📁 Dosya Yapısı

```
oogmatik/
├── api/                          # ⚡ Vercel Serverless Functions
│   ├── tsconfig.json            # TypeScript config for API
│   ├── generate.ts              # AI içerik üretimi
│   ├── feedback.ts              # Geri bildirim endpoint
│   ├── worksheets.ts            # Worksheet CRUD
│   ├── ai/
│   │   └── generate-image.ts    # Görsel üretimi
│   └── user/
│       └── paperSize.ts         # Kağıt boyutu terciihleri
│
├── src/
│   ├── api/                     # 📁 Kaynak API (geliştirme)
│   │   └── ... (aynı dosyalar)
│   ├── components/
│   ├── services/
│   └── utils/
│
├── vercel.json                  # Vercel konfigürasyonu
├── package.json
└── README.md
```

---

## 🔍 Sorun Giderme

### Hata: "Module not found"
```
Error: Cannot find module '../utils/AppError'
```

**Çözüm:** Import path'lerini kontrol et:
```typescript
// Doğru
import { AppError } from '../src/utils/AppError.js';
```

### Hata: "Functions don't match"
```
Error: The pattern "api/*.ts" doesn't match any Serverless Functions
```

**Çözüm:** 
1. `api/` klasörünün root'ta olduğunu doğrula
2. `vercel.json` pattern'ini kontrol et
3. `.ts` uzantısının doğru olduğunu kontrol et

### Hata: "Build failed"
```
Error: Cannot find module '@vercel/node'
```

**Çözüm:**
```bash
npm install --save-dev @vercel/node
```

---

## 📊 API Endpoints

| Endpoint | Method | Açıklama |
|----------|--------|----------|
| `/api/generate` | POST | AI etkinlik üretimi |
| `/api/feedback` | POST | Geri bildirim gönderme |
| `/api/worksheets` | GET/POST/PUT/DELETE | Worksheet CRUD |
| `/api/ai/generate-image` | POST | Görsel üretimi |
| `/api/user/paperSize` | GET/POST | Kağıt boyutu yönetimi |

---

## 💡 Best Practices

### 1. Import Path Convention
```typescript
// API klasöründe (root/api/)
import { X } from '../src/module/path';  // ✅ src/ ekle

// Src klasöründe (src/components/)
import { Y } from '../services/path';    // ✅ src/ olmadan
```

### 2. Error Handling
```typescript
import { AppError, toAppError } from '../src/utils/AppError.js';

export default async function handler(req, res) {
  try {
    // ... iş mantığı
  } catch (error) {
    return res.status(500).json({
      error: toAppError(error)
    });
  }
}
```

### 3. CORS Headers
```typescript
res.setHeader('Access-Control-Allow-Origin', '*');
res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
```

### 4. Rate Limiting
```typescript
const rateLimiter = new RateLimiter();
await rateLimiter.enforceLimit(userId, userTier, 'apiGeneration');
```

---

## 🎯 Sonraki Adımlar

1. ✅ **Test**: Tüm endpoint'leri lokalde test et
2. ✅ **Deploy**: Vercel'e production deploy yap
3. ✅ **Monitoring**: Vercel Analytics ile performansı izle
4. ✅ **Optimization**: Gerekirse memory ve timeout ayarlarını optimize et

---

## 📞 Destek

Sorun yaşarsanız:
1. Vercel dashboard'dan log'ları kontrol edin
2. `vercel --debug` ile detaylı log alın
3. API dosyalarının `api/` klasöründe olduğunu doğrulayın

---

**Son Güncelleme**: 2026-03-18  
**Durum**: ✅ Deployment Hazır

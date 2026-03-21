# Privacy Service - KVKK Uyumlu Veri Gizliliği Servisi

## Özet

`services/privacyService.ts` dosyası, KVKK Madde 6 uyumlu öğrenci veri gizliliği işlevlerini sağlar. Bu servis, Oogmatik platformunda hassas öğrenci verilerinin güvenli işlenmesini garanti eder.

## Temel Özellikler

### 1. TC Kimlik No Hash'leme

TC Kimlik numaralarını SHA-256 + salt ile hash'ler. Orijinal TC No veritabanında **asla açık metin olarak saklanmaz**.

```typescript
import { PrivacyService } from './services/privacyService.js';

// TC No hash'le
const result = PrivacyService.hashTcNo('12345678901');
console.log(result.hash);      // 'a7f3c2e5...' (64 karakter SHA-256)
console.log(result.lastFour);  // '8901' (gösterim için)
console.log(result.category);  // 'tcNo'

// TC No doğrula (giriş/doğrulama sistemlerinde)
const isValid = PrivacyService.verifyTcNo('12345678901', storedHash);
// true veya false
```

**Önemli:** `.env` dosyasında `TC_HASH_SALT` tanımlı olmalıdır:

```env
TC_HASH_SALT=your-production-salt-here-CHANGE-THIS
```

### 2. Öğrenci ID Anonimleştirme

AI çağrılarında gerçek öğrenci ID'leri yerine anonim ID kullanılır.

```typescript
// Orijinal ID: 'student-123-ahmet-yilmaz'
const anon = PrivacyService.anonymizeStudentId('student-123-ahmet-yilmaz');
console.log(anon.anonymousId);     // 'student_a7f3c245' (her çağrıda değişir)
console.log(anon.originalIdHash);  // Geri dönüş için hash (64 karakter)

// AI prompt'una ekle
const prompt = `Öğrenci ${anon.anonymousId} için aktivite oluştur...`;
```

**Neden?** AI model provider'ları (Google, Anthropic) loglarında gerçek öğrenci bilgileri saklanmamalı.

### 3. Tanı Bilgisi Sanitizasyonu

AI'ya gönderilen tanı bilgileri jenerikleştirilir.

```typescript
const text = `
  Öğrenci Ahmet Yılmaz (TC: 12345678901)
  Disleksi tanısı mevcut.
  İletişim: ahmet@example.com, 0532 123 45 67
`;

const result = PrivacyService.sanitizeDiagnosisForAI(text);

console.log(result.sanitized);
// Çıktı:
// "Öğrenci Ahmet Yılmaz (TC: [TC_NO_REDACTED])
//  özel öğrenme güçlüğü tanısı mevcut.
//  İletişim: [EMAIL_REDACTED], [PHONE_REDACTED]"

console.log(result.removed);
// ['TC Kimlik No', 'E-posta', 'Telefon', 'Klinik terim: disleksi']

console.log(result.safe);
// true (AI'ya gönderilebilir)
```

**Jenerikleştirme Kuralları:**

| Klinik Terim | Jenerik Karşılık |
|-------------|------------------|
| disleksi, diskalkuli, disgrafya | özel öğrenme güçlüğü |
| adhd, add | dikkat ve öğrenme desteği gerektiren durum |
| öğrenme güçlüğü | özel öğrenme desteği gerektiren durum |
| zihinsel yetersizlik | bireysel öğrenme profili |

### 4. Hassas Veri Maskeleme

Loglarda veya raporlarda hassas verileri maskeler.

```typescript
// TC No maskeleme (son 4 hane gösterilir)
const masked = PrivacyService.maskSensitiveData(
  'TC: 12345678901',
  'tcNo'
);
// 'TC: *******8901'

// Tanı bilgisi maskeleme (tamamen gizli)
const masked2 = PrivacyService.maskSensitiveData(
  'Disleksi tanısı var',
  'diagnosis'
);
// '[HASSAS_BİLGİ_MASKELENDI]'

// Aile bilgisi maskeleme (isimler gizli)
const masked3 = PrivacyService.maskSensitiveData(
  'Baba: Mehmet Yılmaz',
  'family'
);
// 'Baba: [AD_MASKELENDI] [AD_MASKELENDI]'
```

### 5. Anonimleştirme Kontrolü

Bir metnin anonimleştirilip anonimleştirilmediğini kontrol eder.

```typescript
const result = PrivacyService.checkAnonymization(`
  Öğrenci: Ahmet Yılmaz
  TC: 12345678901
  E-posta: ahmet@example.com
`);

console.log(result.isAnonymous);
// false

console.log(result.violations);
// [
//   'Açık TC Kimlik No tespit edildi',
//   'E-posta adresi tespit edildi',
//   'Tam ad tespit edildi'
// ]
```

### 6. KVKK Uyumlu Log Formatı

Loglarda hassas alanları otomatik redact eder.

```typescript
const studentData = {
  name: 'Ahmet',
  tcNo: '12345678901',
  age: 10,
  diagnosis: 'disleksi',
  grade: '4. Sınıf',
};

const safeLog = PrivacyService.createSafeLogEntry(studentData);

console.log(safeLog);
// {
//   name: 'Ahmet',
//   tcNo: '[REDACTED]',
//   age: 10,
//   diagnosis: '[REDACTED]',
//   grade: '4. Sınıf'
// }
```

**Otomatik Redact Edilen Alanlar:**
- `tcNo`, `tcNoHash`, `tcNoLastFour`
- `password`, `passwordHash`
- `diagnosis`, `diagnosisInfo`
- `medicalInfo`, `medications`
- `behavioralNotes`
- `email`, `phone`, `address`
- `parentPhone`, `parentEmail`

### 7. AI Prompt İçin Güvenli Öğrenci Profili

AI'ya gönderilecek öğrenci profilini tam sanitize eder.

```typescript
const profile = {
  name: 'Ahmet Yılmaz',
  diagnosis: ['disleksi', 'adhd'],
  age: 10,
  grade: '4. Sınıf',
  strengths: ['Yaratıcı düşünme', 'Sosyal beceriler'],
  needs: ['Okuma desteği', 'Dikkat geliştirme'],
};

const safeProfile = PrivacyService.createSafeStudentProfileForAI(profile);

console.log(safeProfile);
// {
//   studentId: 'student_a7f3c245',
//   learningProfile: [
//     'özel öğrenme güçlüğü',
//     'dikkat ve öğrenme desteği gerektiren durum'
//   ],
//   ageGroup: '8-10',
//   grade: '4. Sınıf',
//   strengths: ['Yaratıcı düşünme', 'Sosyal beceriler'],
//   needs: ['Okuma desteği', 'Dikkat geliştirme']
// }
```

**Bu profil güvenle AI prompt'una eklenebilir!**

---

## Kullanım Örnekleri

### Örnek 1: Öğrenci Kaydı (Frontend)

```typescript
// components/Student/AdvancedStudentForm.tsx

import { PrivacyService } from '../../services/privacyService.js';

const handleSubmit = async (formData: StudentFormData) => {
  // TC No hash'le
  const tcNoResult = PrivacyService.hashTcNo(formData.tcNo);

  // Backend'e gönder (açık TC No YOK!)
  const studentData = {
    ...formData,
    personalInfo: {
      tcNoHash: tcNoResult.hash,
      tcNoLastFour: tcNoResult.lastFour,
      // tcNo: formData.tcNo ← BU YASAK!
    },
  };

  await saveStudent(studentData);
};
```

### Örnek 2: AI Aktivite Üretimi (Backend)

```typescript
// api/generate.ts

import { PrivacyService } from '../services/privacyService.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { prompt, studentProfile } = req.body;

  // 1. Kullanıcı prompt'unu sanitize et
  const sanitizedPrompt = PrivacyService.sanitizeDiagnosisForAI(prompt);

  if (!sanitizedPrompt.safe) {
    return res.status(400).json({
      success: false,
      error: {
        message: 'Prompt hassas bilgi içeriyor. Lütfen temizleyip tekrar deneyin.',
        code: 'UNSAFE_PROMPT',
      },
    });
  }

  // 2. Öğrenci profilini sanitize et
  const safeProfile = PrivacyService.createSafeStudentProfileForAI(studentProfile);

  // 3. AI'ya gönder (GÜVENLE!)
  const aiPrompt = `
    Öğrenci Profili:
    ${JSON.stringify(safeProfile, null, 2)}

    Kullanıcı Talebi:
    ${sanitizedPrompt.sanitized}

    Lütfen bu öğrenci için uygun aktivite oluştur.
  `;

  const result = await geminiClient.generateContent(aiPrompt);

  return res.status(200).json({ success: true, data: result });
}
```

### Örnek 3: KVKK Uyumlu Loglama

```typescript
// utils/errorHandler.ts

import { PrivacyService } from '../services/privacyService.js';

export const logError = (error: Error, context?: Record<string, unknown>) => {
  // Context'i sanitize et
  const safeContext = context
    ? PrivacyService.createSafeLogEntry(context)
    : {};

  console.error('[ERROR]', {
    message: error.message,
    stack: error.stack,
    context: safeContext, // Hassas alanlar redact edilmiş
    timestamp: new Date().toISOString(),
  });
};
```

### Örnek 4: BEP Raporu Oluşturma

```typescript
// services/bepService.ts

import { PrivacyService } from './privacyService.js';

export const generateBEPReport = (student: AdvancedStudent) => {
  // Raporda TC No'yu maskelenmiş göster
  const maskedTcNo = student.personalInfo?.tcNoHash
    ? PrivacyService.maskSensitiveData(
        student.personalInfo.tcNoLastFour || '',
        'tcNo'
      )
    : 'Belirtilmemiş';

  // Tanıları jenerikleştir (ebeveyn raporu için)
  const parentFriendlyDiagnosis = student.healthInfo?.diagnosis?.map(d =>
    PrivacyService.sanitizeDiagnosisForAI(d).sanitized
  );

  return {
    studentName: student.name,
    tcNo: maskedTcNo, // *******8901
    diagnosis: parentFriendlyDiagnosis, // ['özel öğrenme güçlüğü']
    // ...
  };
};
```

---

## Güvenlik Kontrol Listesi

Her geliştirme öncesi bu listeyi kontrol et:

```
□ TC Kimlik No açık metin olarak saklanıyor mu? → hashTcNo kullan
□ AI prompt'una öğrenci adı gidiyor mu? → anonymizeStudentId kullan
□ AI prompt'una tanı bilgisi gidiyor mu? → sanitizeDiagnosisForAI kullan
□ Log'da hassas alan var mı? → createSafeLogEntry kullan
□ .env'de TC_HASH_SALT tanımlı mı?
□ .env'de STUDENT_ID_SALT tanımlı mı?
□ Test senaryoları yazıldı mı? (tests/PrivacyService.test.ts)
```

---

## Test Senaryoları

```bash
# Tüm testleri çalıştır
npm run test -- tests/PrivacyService.test.ts

# Sadece hash testleri
npm run test -- tests/PrivacyService.test.ts -t "TC Kimlik No Hash"

# Sadece sanitizasyon testleri
npm run test -- tests/PrivacyService.test.ts -t "Tanı Bilgisi Sanitizasyonu"
```

---

## KVKK Uyumluluk Açıklaması

Bu servis aşağıdaki KVKK maddelerine uygunluk sağlar:

### Madde 6: Özel Nitelikli Kişisel Verilerin İşlenmesi

> "Sağlık ve cinsel hayata ilişkin kişisel veriler ... açık rızaya bağlı olarak işlenebilir."

**Oogmatik Uygulaması:**
- Tanı bilgileri (disleksi, DEHB) AI sistemlerine gönderilmeden **jenerikleştirilir**.
- Sağlık bilgileri (ilaç, alerjiler) **asla AI'ya gönderilmez**.
- Ebeveyn açık rızası olmadan öğrenci profili paylaşılmaz.

### Madde 12: Verilerin Güvenliği

> "Veri sorumlusu ... kişisel verilerin hukuka aykırı olarak işlenmesini önlemek ... için uygun güvenlik düzeyini temin etmeye yönelik ... teknik tedbirleri almak zorundadır."

**Oogmatik Uygulaması:**
- TC Kimlik No: SHA-256 + salt ile hash'leme (**kriptografik güvenlik**)
- Öğrenci ID: Her AI çağrısında farklı anonim ID (**tracking önleme**)
- Log redaction: Hassas alanlar otomatik maskeleme (**veri sızıntısı önleme**)

---

## Yardımcı Fonksiyonlar (Standalone)

Hızlı kullanım için export edilen fonksiyonlar:

```typescript
import { hashTcNo, anonymizeStudent, sanitizeForAI } from './services/privacyService.js';

// Hızlı TC No hash
const hash = hashTcNo('12345678901');

// Hızlı anonim ID
const anonId = anonymizeStudent('student-123-ahmet');

// Hızlı sanitizasyon
const sanitized = sanitizeForAI('Disleksi tanısı var');
```

---

## Migration Guide (Mevcut Kodlar İçin)

### Adım 1: types/student-advanced.ts Güncelleme

```typescript
// ❌ ESKİ
personalInfo?: {
  tcNo?: string; // KVKK ihlali!
}

// ✅ YENİ
personalInfo?: {
  tcNoHash?: string;     // SHA-256 hash
  tcNoLastFour?: string; // Son 4 hane (gösterim için)
}
```

### Adım 2: Frontend Form Güncelleme

```typescript
// components/Student/AdvancedStudentForm.tsx

// ❌ ESKİ
const studentData = { ...formData, tcNo: form.tcNo };

// ✅ YENİ
import { PrivacyService } from '../../services/privacyService.js';

const { hash, lastFour } = PrivacyService.hashTcNo(form.tcNo);
const studentData = {
  ...formData,
  personalInfo: { tcNoHash: hash, tcNoLastFour: lastFour }
};
```

### Adım 3: Backend AI Entegrasyonu Güncelleme

```typescript
// api/generate.ts

// ❌ ESKİ
const aiPrompt = `Öğrenci ${studentName} için aktivite oluştur`;

// ✅ YENİ
const safeProfile = PrivacyService.createSafeStudentProfileForAI(student);
const aiPrompt = `Öğrenci profili: ${JSON.stringify(safeProfile)}`;
```

### Adım 4: Mevcut Verileri Migrate Et

```typescript
// scripts/migrateStudentData.ts (YENİ DOSYA)

import { PrivacyService } from '../services/privacyService.js';

export const migrateStudentData = async () => {
  const students = await firestore.collection('students').get();

  for (const doc of students.docs) {
    const data = doc.data();

    // Eğer açık TC No varsa hash'le
    if (data.personalInfo?.tcNo) {
      const { hash, lastFour } = PrivacyService.hashTcNo(data.personalInfo.tcNo);

      await doc.ref.update({
        'personalInfo.tcNoHash': hash,
        'personalInfo.tcNoLastFour': lastFour,
        'personalInfo.tcNo': null, // Açık TC No'yu SİL!
      });

      console.log(`✅ Migrated: ${doc.id}`);
    }
  }
};
```

---

## Sorular ve Cevaplar

### S: TC No hash'ini nasıl doğrularım?

```typescript
const isValid = PrivacyService.verifyTcNo(userInputTcNo, storedHash);
if (!isValid) {
  throw new ValidationError('TC Kimlik No eşleşmiyor.');
}
```

### S: Salt değerini nasıl güvenle saklarım?

Production'da **Vercel Environment Variables** kullanın:

```bash
vercel env add TC_HASH_SALT production
# Terminal'de salt girin (minimum 32 karakter!)
```

### S: Anonim ID'den gerçek ID'ye nasıl geri dönerim?

`originalIdHash` değerini veritabanında saklayarak:

```typescript
// AI çağrısı öncesi
const anon = PrivacyService.anonymizeStudentId(studentId);
await redis.set(anon.originalIdHash, studentId, 'EX', 3600); // 1 saat

// AI yanıtı sonrası
const originalId = await redis.get(anon.originalIdHash);
```

### S: Tüm prompt'ları sanitize etmek performansı etkiler mi?

Hayır. Regex pattern matching çok hızlıdır (~1ms). Ancak çok uzun metinler için cache kullanabilirsiniz:

```typescript
// Aynı prompt tekrar gönderiliyorsa cache'den al
const cacheKey = `sanitized:${hashPrompt(prompt)}`;
let sanitized = await cache.get(cacheKey);

if (!sanitized) {
  sanitized = PrivacyService.sanitizeDiagnosisForAI(prompt);
  await cache.set(cacheKey, sanitized, 'EX', 3600);
}
```

---

## İlgili Dosyalar

- **Servis:** `services/privacyService.ts`
- **Testler:** `tests/PrivacyService.test.ts`
- **Tip Tanımları:** `types/student-advanced.ts`
- **Geliştirme Planı:** `IYILESTIRME_PLANI.md` (Bölüm 1: KVKK İhlali)
- **Agent Kuralları:** `.claude/agents/ozel-egitim-uzmani.md` (Mahremiyet bölümü)

---

## Güncellemeler

**v1.0.0** (2026-03-21)
- İlk sürüm
- TC Kimlik No hash'leme (SHA-256 + salt)
- Öğrenci ID anonimleştirme
- Tanı bilgisi sanitizasyonu
- KVKK uyumlu loglama
- 70+ test senaryosu

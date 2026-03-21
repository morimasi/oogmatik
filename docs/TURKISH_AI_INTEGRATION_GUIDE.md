# Türkçe AI Entegrasyonu - Kullanım Kılavuzu

## 🎯 Genel Bakış

`turkishAIIntegrationService`, Oogmatik platformunun Türkçe modülleri (super-turkce ve super-turkce-v2) ile yeni AI ajan servislerini entegre eden kapsamlı bir servistir.

### 4 Uzman Ajan ile Çalışır:

1. **Elif Yıldız** (Özel Öğrenme Uzmanı) - Pedagojik tasarım
2. **Dr. Ahmet Kaya** (Özel Eğitim Uzmanı) - Klinik doğrulama ve MEB uyumu
3. **Bora Demir** (Yazılım Mühendisi) - Teknik doğrulama
4. **Selin Arslan** (AI Mühendisi) - AI kalite kontrolü

---

## 📚 Desteklenen Türkçe İçerik Türleri

```typescript
type TurkishContentType =
  | 'okuma_anlama'      // Okuma anlama & yorumlama
  | 'mantik_muhakeme'   // Mantık muhakeme & paragraf
  | 'dil_bilgisi'       // Dil bilgisi ve anlatım bozuklukları
  | 'yazim_noktalama'   // Yazım kuralları ve noktalama
  | 'soz_varligi'       // Deyimler, atasözleri ve söz varlığı
  | 'ses_olaylari';     // Hece ve ses olayları
```

---

## 🚀 Temel Kullanım

### 1. Türkçe İçerik Üretimi (4 Ajan Doğrulamalı)

```typescript
import { turkishAIIntegrationService } from '@/services/turkishAIIntegrationService';

// Basit içerik üretimi
const result = await turkishAIIntegrationService.generateTurkishContent({
  contentType: 'okuma_anlama',
  grade: 5,
  objective: 'Ana fikri bulma ve yorumlama',
  difficulty: 'Orta'
});

console.log('Üretilen İçerik:', result.content);
console.log('Validasyon Skoru:', result.validation.overallScore); // 0-100
console.log('Pedagojik Skor:', result.validation.pedagogicalScore);
console.log('Klinik Skor:', result.validation.clinicalScore);
console.log('Teknik Skor:', result.validation.technicalScore);
console.log('AI Kalite Skoru:', result.validation.aiQualityScore);

// Her ajan için detaylı geri bildirim
result.validation.feedback.forEach(f => {
  console.log(`${f.agent}: ${f.score}/100`);
  console.log('Yorumlar:', f.comments);
});
```

### 2. Öğrenci Profiline Göre Özelleştirilmiş İçerik

```typescript
import type { Student } from '@/types/student';

const student: Student = {
  id: 'student-123',
  name: 'Ahmet Yılmaz',
  learningDisability: 'dyslexia',
  gradeLevel: 5,
  strengths: ['görsel öğrenme', 'yaratıcı düşünme'],
  weaknesses: ['hızlı okuma', 'yazım kuralları']
};

const result = await turkishAIIntegrationService.generateTurkishContent({
  contentType: 'okuma_anlama',
  grade: 5,
  objective: 'Ana fikri bulma',
  difficulty: 'Kolay',  // Disleksili öğrenci için kolay seviye
  studentProfile: student,
  additionalInstructions: 'Görsel öğrenmeye ağırlık ver, büyük font kullan'
});

// Disleksi-dostu içerik üretildi
console.log('Öğrenciye Özel İçerik:', result.content);
```

### 3. Türkçe Çalışma Kağıdı Üretimi

```typescript
const worksheetResult = await turkishAIIntegrationService.generateTurkishWorksheet({
  contentType: 'dil_bilgisi',
  grade: 6,
  objective: 'İsimleri tanıma ve türlerini ayırt etme',
  difficulty: 'Orta'
});

console.log('Çalışma Kağıdı:', worksheetResult.worksheet);
console.log('Başlık:', worksheetResult.worksheet.title);
console.log('Aktivite Sayısı:', worksheetResult.worksheet.activities.length);
console.log('Validasyon Sonucu:', worksheetResult.validation);

// PDF olarak kaydet
import { PDFDownloadLink } from '@react-pdf/renderer';
<PDFDownloadLink
  document={<WorksheetPDF data={worksheetResult.worksheet} />}
  fileName="turkce-dil-bilgisi.pdf"
>
  İndir
</PDFDownloadLink>
```

### 4. Mevcut İçeriği Doğrulama

```typescript
const existingContent = {
  title: 'Okuma Anlama Etkinliği',
  text: 'Bir gün, küçük bir kız...',
  questions: [
    'Hikayenin ana karakteri kimdir?',
    'Olaylar nerede geçiyor?'
  ]
};

const validation = await turkishAIIntegrationService.validateTurkishContent(
  existingContent,
  'okuma_anlama',
  5
);

if (validation.isValid) {
  console.log('✅ İçerik geçerli!');
  console.log('Genel Skor:', validation.overallScore);
} else {
  console.log('❌ İçerik geçersiz!');
  console.log('İyileştirme Önerileri:', validation.improvements);
}

// Detaylı ajan geri bildirimleri
validation.feedback.forEach(f => {
  console.log(`\n${f.agent}:`);
  console.log(`Skor: ${f.score}/100`);
  f.comments.forEach(comment => console.log(`- ${comment}`));
});
```

### 5. İçerik Optimizasyonu

```typescript
// Düşük skorlu içeriği optimize et
const lowScoreContent = {
  title: 'Basit Aktivite',
  items: ['Çok basit soru']
};

const optimizationResult = await turkishAIIntegrationService.optimizeTurkishContent(
  lowScoreContent,
  'mantik_muhakeme',
  85  // Hedef skor
);

console.log('Optimize Edilmiş İçerik:', optimizationResult.optimizedContent);
console.log('Skor İyileşmesi:', optimizationResult.scoreImprovement);
console.log('Yapılan İyileştirmeler:', optimizationResult.improvements);

// Örnek çıktı:
// Skor İyileşmesi: +23 puan (62 → 85)
// Yapılan İyileştirmeler:
// - Bloom taksonomisi seviyesi yükseltildi
// - Disleksi-dostu format uygulandı
// - MEB kazanımı ile uyum sağlandı
// - Pedagojik not eklendi
```

---

## 🎨 Gelişmiş Özellikler

### İçerik Türüne Göre Aktivite Sayıları

Her içerik türü için optimize edilmiş varsayılan aktivite sayıları:

```typescript
const activityCounts = {
  okuma_anlama: 5,      // Okuma metni + 5 soru
  mantik_muhakeme: 4,   // 4 mantık problemi
  dil_bilgisi: 6,       // 6 dil bilgisi sorusu
  yazim_noktalama: 8,   // 8 yazım/noktalama sorusu
  soz_varligi: 10,      // 10 deyim/atasözü
  ses_olaylari: 8       // 8 hece/ses olayı sorusu
};

// Özel aktivite sayısı
const customWorksheet = await turkishAIIntegrationService.generateTurkishWorksheet({
  contentType: 'soz_varligi',
  grade: 7,
  objective: 'Deyimlerin anlamını kavrama',
  difficulty: 'Zor',
  additionalInstructions: '15 farklı deyim içeren aktivite üret'
});
```

### Yaş Gruplarına Göre Uyarlama

```typescript
// Servis otomatik olarak sınıfı yaş grubuna çevirir
const ageGroups = {
  '1-3. sınıf': '5-7',
  '4-5. sınıf': '8-10',
  '6-8. sınıf': '11-13',
  '9+ sınıf': '14+'
};

// Örnek: 4. sınıf → '8-10' yaş grubu
const result = await turkishAIIntegrationService.generateTurkishContent({
  contentType: 'okuma_anlama',
  grade: 4,  // Otomatik olarak '8-10' yaş grubuna çevrilir
  objective: 'Hikaye okuma',
  difficulty: 'Kolay'
});
```

### MEB Müfredat Uyumu

```typescript
// MEB kazanımlarıyla uyumlu içerik
const mebAlignedContent = await turkishAIIntegrationService.generateTurkishContent({
  contentType: 'dil_bilgisi',
  grade: 6,
  objective: 'T6.3.1 - İsim türlerini ayırt etme',  // MEB kazanım kodu
  difficulty: 'Orta',
  additionalInstructions: 'MEB 2024-2025 müfredatına tam uyumlu'
});

// Dr. Ahmet Kaya (klinik uzman) MEB uyumunu doğrular
console.log('MEB Uyumu:', mebAlignedContent.validation.clinicalScore);
```

---

## 📊 Validasyon Skorları Anlama

### Skor Aralıkları

```typescript
interface ScoreRanges {
  '90-100': 'Mükemmel - Doğrudan kullanıma hazır',
  '80-89': 'Çok İyi - Küçük iyileştirmeler yapılabilir',
  '70-79': 'İyi - Bazı revizyonlar önerilir',
  '60-69': 'Orta - Ciddi revizyonlar gerekli',
  '0-59': 'Zayıf - Yeniden üretilmeli'
}

// Skorlara göre karar verme
const result = await turkishAIIntegrationService.generateTurkishContent({...});

if (result.validation.overallScore >= 85) {
  console.log('✅ İçerik doğrudan kullanılabilir');
  saveAndPublish(result.content);
} else if (result.validation.overallScore >= 70) {
  console.log('⚠️ İçerik revizyondan geçirilmeli');
  const optimized = await turkishAIIntegrationService.optimizeTurkishContent(
    result.content,
    'okuma_anlama',
    85
  );
  saveAndPublish(optimized.optimizedContent);
} else {
  console.log('❌ İçerik yeniden üretilmeli');
  // Yeni parametre denemesi yapılabilir
}
```

### Her Ajan Ne Değerlendirir?

1. **Elif Yıldız (Pedagojik Skor)**
   - ZPD uyumu
   - Başarı mimarisi
   - Bilişsel yük
   - Bloom taksonomisi seviyesi

2. **Dr. Ahmet Kaya (Klinik Skor)**
   - MEB müfredat uyumu
   - Klinik doğruluk
   - KVKK uyumluluğu
   - BEP hedefleriyle uyum

3. **Bora Demir (Teknik Skor)**
   - Yapısal bütünlük
   - Format doğruluğu
   - Karakter kodlaması
   - TypeScript tip güvenliği

4. **Selin Arslan (AI Kalite Skoru)**
   - İçerik tutarlılığı
   - İlgililik
   - Yaratıcılık
   - Doğruluk

---

## 🎓 Pedagojik Özellikler

### Disleksi Desteği

Tüm üretilen içerik otomatik olarak disleksi dostu özelliklere sahiptir:

```typescript
// Otomatik eklenen özellikler:
const dyslexiaFeatures = {
  font: 'Lexend',              // Disleksi dostu font
  fontSize: 14,                // Büyük punto
  lineSpacing: 1.8,            // Geniş satır aralığı
  letterSpacing: 0.05,         // Harf aralığı
  contrast: 'high',            // Yüksek kontrast
  visualClutter: 'minimal'     // Görsel karmaşa minimizasyonu
};
```

### Başarı Mimarisi

Her içerik otomatik olarak başarı mimarisi prensibini uygular:

```typescript
// Aktiviteler otomatik sıralanır:
// 1. Kolay aktiviteler (güven inşası)
// 2. Orta aktiviteler (beceri geliştirme)
// 3. Zor aktiviteler (zirvede meydan okuma)

const result = await turkishAIIntegrationService.generateTurkishContent({
  contentType: 'okuma_anlama',
  grade: 5,
  objective: 'Ana fikir bulma',
  difficulty: 'Orta'
});

// result.content otomatik olarak şu yapıya sahip olur:
// Item 1: Kolay (güven inşası)
// Item 2-4: Orta (beceri geliştirme)
// Item 5: Zor (meydan okuma)
```

---

## 🔄 React Entegrasyonu

### React Hook Örneği

```typescript
import { useState } from 'react';
import { turkishAIIntegrationService } from '@/services/turkishAIIntegrationService';

function useTurkishContentGenerator() {
  const [loading, setLoading] = useState(false);
  const [content, setContent] = useState(null);
  const [validation, setValidation] = useState(null);
  const [error, setError] = useState(null);

  const generateContent = async (params) => {
    setLoading(true);
    setError(null);

    try {
      const result = await turkishAIIntegrationService.generateTurkishContent(params);
      setContent(result.content);
      setValidation(result.validation);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return { content, validation, loading, error, generateContent };
}

// Kullanım
function TurkishContentGenerator() {
  const { content, validation, loading, error, generateContent } = useTurkishContentGenerator();

  const handleGenerate = () => {
    generateContent({
      contentType: 'okuma_anlama',
      grade: 5,
      objective: 'Ana fikir',
      difficulty: 'Orta'
    });
  };

  return (
    <div>
      <button onClick={handleGenerate} disabled={loading}>
        {loading ? 'Üretiliyor...' : 'İçerik Üret'}
      </button>

      {error && <div className="error">{error}</div>}

      {validation && (
        <div className="validation-scores">
          <h3>Validasyon Skorları</h3>
          <div>Pedagojik: {validation.pedagogicalScore}/100</div>
          <div>Klinik: {validation.clinicalScore}/100</div>
          <div>Teknik: {validation.technicalScore}/100</div>
          <div>AI Kalite: {validation.aiQualityScore}/100</div>
          <div className="overall">Genel: {validation.overallScore}/100</div>
        </div>
      )}

      {content && (
        <div className="content-preview">
          <pre>{JSON.stringify(content, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}
```

---

## 📈 Performans İpuçları

### 1. Önbellekleme

```typescript
// Sık kullanılan içerik türlerini önbelleğe al
const cache = new Map();

async function getCachedOrGenerate(params) {
  const cacheKey = JSON.stringify(params);

  if (cache.has(cacheKey)) {
    console.log('Cache hit!');
    return cache.get(cacheKey);
  }

  const result = await turkishAIIntegrationService.generateTurkishContent(params);
  cache.set(cacheKey, result);

  return result;
}
```

### 2. Batch İşleme

```typescript
// Birden fazla içeriği paralel üret
async function generateMultipleContents(paramsList) {
  const promises = paramsList.map(params =>
    turkishAIIntegrationService.generateTurkishContent(params)
  );

  return await Promise.all(promises);
}

// Kullanım
const contents = await generateMultipleContents([
  { contentType: 'okuma_anlama', grade: 5, objective: 'Obj 1', difficulty: 'Kolay' },
  { contentType: 'dil_bilgisi', grade: 6, objective: 'Obj 2', difficulty: 'Orta' },
  { contentType: 'yazim_noktalama', grade: 7, objective: 'Obj 3', difficulty: 'Zor' }
]);
```

---

## 🐛 Hata Yönetimi

```typescript
try {
  const result = await turkishAIIntegrationService.generateTurkishContent(params);

  if (!result.validation.isValid) {
    console.warn('İçerik geçersiz, optimize ediliyor...');

    const optimized = await turkishAIIntegrationService.optimizeTurkishContent(
      result.content,
      params.contentType,
      85
    );

    // Optimize edilmiş içeriği kullan
    return optimized.optimizedContent;
  }

  return result.content;

} catch (error) {
  if (error.code === 'RATE_LIMIT_EXCEEDED') {
    console.error('Rate limit aşıldı, lütfen bekleyin');
    // Yeniden deneme mekanizması
  } else if (error.code === 'VALIDATION_FAILED') {
    console.error('Validasyon başarısız:', error.details);
  } else {
    console.error('Beklenmeyen hata:', error);
  }

  throw error;
}
```

---

## 📝 En İyi Pratikler

### ✅ Yapılması Gerekenler

1. **Her zaman validasyon skorlarını kontrol et**
   ```typescript
   if (result.validation.overallScore < 70) {
     // Yeniden üret veya optimize et
   }
   ```

2. **Öğrenci profilini mümkünse kullan**
   ```typescript
   // Daha kişiselleştirilmiş içerik için
   params.studentProfile = student;
   ```

3. **Pedagojik notları kaydet**
   ```typescript
   // Öğretmenler için önemli bilgi
   console.log(result.content.pedagogicalNote);
   ```

### ❌ Yapılmaması Gerekenler

1. **Düşük skorlu içeriği doğrudan kullanma**
   ```typescript
   // YANLIŞ
   if (result.validation.overallScore > 0) {
     return result.content;  // Kötü içerik kullanıcıya gidebilir!
   }

   // DOĞRU
   if (result.validation.overallScore >= 75) {
     return result.content;
   }
   ```

2. **Validasyon adımını atlama**
   ```typescript
   // YANLIŞ
   const content = await generateSomehow();
   return content;  // Validasyon yok!

   // DOĞRU
   const result = await turkishAIIntegrationService.generateTurkishContent(params);
   if (result.validation.isValid) {
     return result.content;
   }
   ```

---

## 🔗 İlgili Servisler

- `agentService` - Temel AI ajan yönetimi
- `aiWorksheetService` - Genel çalışma kağıdı üretimi
- `aiStudentService` - Öğrenci analizi ve kişiselleştirme

---

## 📚 Daha Fazla Kaynak

- [AI Agent System Documentation](../docs/ai-agents.md)
- [Turkish Module v1 Documentation](../src/modules/super-turkce/FINAL_COMPLETION_REPORT.md)
- [Turkish Module v2 Documentation](../src/modules/super-turkce-v2/README.md)
- [MEB Curriculum Standards](../docs/meb-curriculum.md)

---

**Son Güncelleme:** 21 Mart 2026
**Versiyon:** 1.0.0
**Yazar:** Oogmatik Development Team

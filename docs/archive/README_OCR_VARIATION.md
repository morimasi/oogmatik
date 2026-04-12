# OCR Varyasyon Sistemi — Hızlı Başlangıç Rehberi

## 📌 Ne Yaptık?

OCR modülüne **aktivite varyasyon üretimi** özelliği kazandırmak için tam mimari tasarım tamamlandı.

### Özellik Özeti
- Kullanıcı aktivite görseli yükler
- Sistem mimari DNA çıkarır (Gemini Vision)
- Kullanıcı 1-10 arası varyant seçer
- Sistem aynı yapıda, farklı verili aktiviteler üretir
- Tüm varyantlar uygulamaya entegre edilir

---

## 📚 Doküman Yapısı

| Dosya | İçerik | Kim İçin |
|-------|--------|----------|
| **OCR_VARIATION_EXECUTIVE_SUMMARY.md** | Yönetici özeti, maliyet, metrik | Product Owner, CTO |
| **ARCHITECTURE_OCR_VARIATION.md** | Tam teknik mimari (2131 satır) | Mühendisler, Mimarlar |
| **OCR_VARIATION_IMPLEMENTATION_PLAN.md** | 5 fazlı detaylı plan (task'lar) | Backend/Frontend Devs |
| **OCR_VARIATION_FILE_STRUCTURE.md** | Dosya değişiklik matrisi | Code Reviewers |

---

## 🚀 Hızlı Başlangıç

### Mevcut Durum
```
Branch: claude/integrate-ocr-module-variation
Commits: 2 (tasarım dokümanları)
Statü: READY FOR IMPLEMENTATION
```

### Implementasyona Başlamak İçin

#### 1. Dokümantasyonu İncele
```bash
# Mimari tasarımı oku (zorunlu)
cat ARCHITECTURE_OCR_VARIATION.md

# İmplementasyon planını oku
cat OCR_VARIATION_IMPLEMENTATION_PLAN.md
```

#### 2. Phase 1 Başlat (Foundation)
```bash
# Yeni branch oluştur
git checkout -b feat/ocr-variation-phase1

# Task 1.1: Image Validator
touch utils/imageValidator.ts
# Kodu ARCHITECTURE_OCR_VARIATION.md'den kopyala

# Test yaz
touch tests/ImageValidator.test.ts

# Test çalıştır
npm run test -- ImageValidator.test.ts
```

#### 3. Task'ları Sırayla Tamamla
```
Phase 1 (2-3h):
  └─ Task 1.1: imageValidator.ts
  └─ Task 1.2: ocrService.ts refactor

Phase 2 (3-4h):
  └─ Task 2.1: ocrVariationService.ts
  └─ Task 2.2: API endpoints

Phase 3 (2-3h):
  └─ Task 3.1: OCRScanner.tsx refactor
  └─ Task 3.2: VariationResultsView.tsx

Phase 4 (1-2h):
  └─ Task 4.1: Unit tests
  └─ Task 4.2: E2E tests
  └─ Task 4.3: Performance tests

Phase 5 (1h):
  └─ Task 5.1: API documentation
  └─ Task 5.2: User guide
  └─ Task 5.3: Deploy
```

---

## 🔍 Kritik Noktalar

### ✅ Her Değişiklikten Önce Oku
```
1. AppError standardını kullan (utils/AppError.ts)
2. retryWithBackoff ile API çağrıları yap
3. TypeScript strict mode (no 'any')
4. pedagogicalNote her varyasyonda zorunlu
5. Rate limiting ekle (rateLimiter.ts)
6. Test coverage >80% hedefle
```

### ⚠️ Dikkat Edilmesi Gerekenler
```
1. Memory Leak: Canvas cleanup unutma (ocrService.ts)
2. XSS Risk: DOMPurify.sanitize() kullan (VariationResultsView.tsx)
3. File Size: 15MB limit kontrolü (imageValidator.ts)
4. Cache Strategy: LRU implementasyonu (FIFO değil)
5. Retry Logic: Exponential backoff (sabit delay değil)
```

---

## 📊 Beklenen Sonuçlar

### Metrikler
- Blueprint analiz başarı oranı: >95%
- Varyasyon kalitesi: %100 (pedagogicalNote var)
- API response time (p95): <5s
- Cache hit rate: >70%
- Memory leak: 0
- Test coverage: >80%

### Maliyet
- 1000 aktif kullanıcı için: ~$35/ay (Gemini API)
- Batch generation ile %40 tasarruf

---

## 🐛 Sorun Giderme

### Q: TypeScript error alıyorum: "Type 'any' is not assignable"
**A**: `tsconfig.json`'da strict mode açık. `any` yerine `unknown` + type guard kullan.

### Q: Test fail ediyor: "CORS policy blocked"
**A**: `api/ocr/*.ts` dosyalarında CORS header'ları eklenmiş mi kontrol et.

### Q: Memory leak tespit edildi
**A**: `ocrService.ts`'de LRU cache implementasyonu doğru mu? Canvas cleanup var mı?

### Q: Rate limit çalışmıyor
**A**: `rateLimiter.ts`'de `OCR_ANALYZE` limit tanımı var mı? API endpoint'te `rateLimiter.checkLimit()` çağrılıyor mu?

---

## 🔗 İlgili Dosyalar

### Mevcut Dosyalar (Referans)
```
services/ocrService.ts          — Mevcut OCR servisi (güncellenecek)
services/geminiClient.ts        — Gemini API wrapper (mevcut)
components/OCRScanner.tsx       — OCR Scanner UI (güncellenecek)
utils/AppError.ts               — Error standardı (kullan)
utils/errorHandler.ts           — retryWithBackoff (kullan)
services/rateLimiter.ts         — Rate limit (güncelle)
types/core.ts                   — Tip tanımları (güncelle)
```

### OCR_AUDIT_REPORT.md'deki Sorunlar
```
✅ File size validation eksik → imageValidator.ts
✅ Retry logic zayıf → retryWithBackoff entegrasyonu
✅ Memory leak → LRU cache
✅ Type safety → strict TypeScript
✅ Error handling → AppError standardı
⚠️ PDF processing → OUT OF SCOPE (bu sprint)
```

---

## 🤝 Ekip Koordinasyonu

### Mühendislik Direktifi
```
[MÜHENDİSLİK DİREKTİFİ - Bora Demir]

STANDART:
- AppError formatı (utils/AppError.ts)
- retryWithBackoff (utils/errorHandler.ts)
- TypeScript strict mode (no 'any')
- Rate limiting (services/rateLimiter.ts)

DOSYALAR:
- utils/imageValidator.ts (YENİ)
- services/ocrVariationService.ts (YENİ)
- api/ocr/*.ts (YENİ)
- services/ocrService.ts (GÜNCELLE)
- components/OCRScanner.tsx (GÜNCELLE)

TEST:
- Unit: ImageValidator, OCRVariation
- E2E: Playwright (upload → analyze → generate)
- Performance: k6 (20 concurrent)

GÜVENLİK:
- 15MB file limit
- MIME type whitelist
- XSS sanitization (DOMPurify)
- Rate limiting
- Canvas cleanup
```

### Pedagojik Onay Gerekli
```
[] Elif Yıldız: Varyasyon kalite kriterleri
[] Dr. Ahmet Kaya: MEB uyumluluk kontrolü
[] Selin Arslan: Gemini API maliyet analizi
```

---

## 📞 Yardım

### Sorular İçin
1. **Mimari Soruları**: `ARCHITECTURE_OCR_VARIATION.md` oku
2. **Task Detayları**: `OCR_VARIATION_IMPLEMENTATION_PLAN.md` oku
3. **Dosya Değişiklikleri**: `OCR_VARIATION_FILE_STRUCTURE.md` oku
4. **Genel Özet**: `OCR_VARIATION_EXECUTIVE_SUMMARY.md` oku

### Acil Durumlar
- Memory leak tespit edildi → LRU cache implementasyonu kontrol et
- Test fail ediyor → Test stratejisi bölümüne bak
- Production'da hata → Rollback plan (vercel rollback)

---

## ✅ Checklist (Implementasyon Bittiğinde)

```
[] Tüm testler geçiyor (npm run test)
[] E2E testler geçiyor (playwright)
[] Performance testleri geçiyor (k6)
[] Memory leak yok (Chrome DevTools)
[] TypeScript strict mode error yok
[] AppError standardı her yerde
[] Rate limiting test edildi
[] CORS ayarları doğru
[] Swagger güncel
[] Kullanıcı dokümantasyonu hazır
[] Rollback planı test edildi
[] Production smoke test başarılı
[] Pedagojik onay alındı (Elif, Dr. Ahmet, Selin)
```

---

**Başarılar! 🚀**

**Mühendis**: Bora Demir
**Tarih**: 2026-03-21
**Branch**: `claude/integrate-ocr-module-variation`

🤖 Generated with Claude Code
Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>

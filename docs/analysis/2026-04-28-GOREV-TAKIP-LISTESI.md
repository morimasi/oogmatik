# OOGMATIK - GOREV TAKIP LISTESI

**Son Guncelleme:** 2026-04-28  
**Toplam Gorev:** 24  
**Tahmini Sure:** 12 Hafta

---

## HIZLI BAKIS

```
FAZ 1: Guvenlik ............ [ ] 5/5 gorev (Hafta 1-2)
FAZ 2: Teknik Borc ......... [ ] 4/4 gorev (Hafta 3-4)
FAZ 3: Pazarlama ........... [ ] 4/4 gorev (Hafta 5-6)
FAZ 4: Ozellikler .......... [ ] 4/4 gorev (Hafta 7-9)
FAZ 5: Performans .......... [ ] 4/4 gorev (Hafta 10-11)
FAZ 6: Lansman ............. [ ] 3/3 gorev (Hafta 12)
```

---

## FAZ 1: KRITIK GUVENLIK (Hafta 1-2)

### Sprint 1.1: KVKK ve Veri Guvenligi

- [ ] **1.1.1** TC Kimlik No Hashleme
  - Oncelik: KRITIK
  - Sure: 8 saat
  - Dosyalar: privacyService.ts, student-advanced.ts, AdvancedStudentForm.tsx
  - Durum: Beklemede

- [ ] **1.1.2** Console.log Temizligi
  - Oncelik: KRITIK
  - Sure: 6 saat
  - Dosyalar: logger.ts, 20+ dosya
  - Durum: Beklemede

### Sprint 1.2: API Guvenligi

- [ ] **1.2.1** Prompt Injection Korumasi
  - Oncelik: KRITIK
  - Sure: 10 saat
  - Dosyalar: promptSecurity.ts, generate.ts
  - Durum: Beklemede

- [ ] **1.2.2** CORS Guvenlik Yapilandirmasi
  - Oncelik: YUKSEK
  - Sure: 4 saat
  - Dosyalar: cors.ts, tum API'ler
  - Durum: Beklemede

- [ ] **1.2.3** Environment Variable Guvenligi
  - Oncelik: KRITIK
  - Sure: 3 saat
  - Dosyalar: .env, api/*.ts
  - Durum: Beklemede

---

## FAZ 2: TEKNIK BORC TEMIZLIGI (Hafta 3-4)

### Sprint 2.1: TypeScript Kalitesi

- [ ] **2.1.1** API Tip Guvenligi
  - Oncelik: YUKSEK
  - Sure: 12 saat
  - Dosyalar: api/*.ts, types/api.ts
  - Bagimlilik: Faz 1
  - Durum: Beklemede

- [ ] **2.1.2** Zustand Store Tip Guvenligi
  - Oncelik: YUKSEK
  - Sure: 8 saat
  - Dosyalar: store/*.ts
  - Durum: Beklemede

- [ ] **2.1.3** ESLint Kural Guncelleme
  - Oncelik: ORTA
  - Sure: 4 saat
  - Dosyalar: .eslintrc.json
  - Bagimlilik: 2.1.1, 2.1.2
  - Durum: Beklemede

### Sprint 2.2: Error Handling

- [ ] **2.2.1** Merkezi Error Handling
  - Oncelik: YUKSEK
  - Sure: 10 saat
  - Dosyalar: AppError.ts, ErrorBoundary.tsx
  - Bagimlilik: 1.1.2
  - Durum: Beklemede

---

## FAZ 3: PAZARLAMA ALTYAPISI (Hafta 5-6)

### Sprint 3.1: Landing Page

- [ ] **3.1.1** Landing Page Tasarim ve Gelistirme
  - Oncelik: KRITIK
  - Sure: 24 saat
  - Dosyalar: components/landing/*, app/landing/page.tsx
  - Durum: Beklemede

- [ ] **3.1.2** Pricing Page
  - Oncelik: YUKSEK
  - Sure: 8 saat
  - Dosyalar: components/pricing/*, app/pricing/page.tsx
  - Bagimlilik: 3.1.1
  - Durum: Beklemede

### Sprint 3.2: Content ve SEO

- [ ] **3.2.1** Blog Altyapisi
  - Oncelik: ORTA
  - Sure: 12 saat
  - Dosyalar: app/blog/*
  - Durum: Beklemede

- [ ] **3.2.2** Demo Video Sayfasi
  - Oncelik: YUKSEK
  - Sure: 6 saat
  - Dosyalar: app/demo/page.tsx
  - Durum: Beklemede

---

## FAZ 4: OZELLIK GELISTIRME (Hafta 7-9)

### Sprint 4.1: Ilerleme Sistemi

- [ ] **4.1.1** Progress Dashboard
  - Oncelik: YUKSEK
  - Sure: 20 saat
  - Dosyalar: components/progress/*, api/progress.ts
  - Bagimlilik: Faz 1-2
  - Durum: Beklemede

- [ ] **4.1.2** Veli Raporu Sistemi
  - Oncelik: YUKSEK
  - Sure: 12 saat
  - Dosyalar: components/reports/*
  - Bagimlilik: 4.1.1
  - Durum: Beklemede

### Sprint 4.2: Gamification

- [ ] **4.2.1** Rozet ve Seviye Sistemi
  - Oncelik: ORTA
  - Sure: 16 saat
  - Dosyalar: components/gamification/*, types/gamification.ts
  - Bagimlilik: 4.1.1
  - Durum: Beklemede

---

## FAZ 5: PERFORMANS VE TEST (Hafta 10-11)

### Sprint 5.1: Test Coverage

- [ ] **5.1.1** API Test Suite
  - Oncelik: YUKSEK
  - Sure: 16 saat
  - Dosyalar: __tests__/api/*
  - Bagimlilik: Faz 1-2
  - Durum: Beklemede

- [ ] **5.1.2** Component Test Suite
  - Oncelik: ORTA
  - Sure: 12 saat
  - Dosyalar: __tests__/components/*
  - Durum: Beklemede

### Sprint 5.2: Performans

- [ ] **5.2.1** Bundle Optimizasyonu
  - Oncelik: YUKSEK
  - Sure: 8 saat
  - Dosyalar: vite.config.ts
  - Durum: Beklemede

- [ ] **5.2.2** Cache Stratejisi
  - Oncelik: ORTA
  - Sure: 8 saat
  - Dosyalar: sw.ts, cacheService.ts
  - Durum: Beklemede

---

## FAZ 6: LANSMAN HAZIRLIGI (Hafta 12)

### Sprint 6.1: Final Kontroller

- [ ] **6.1.1** QA ve Bug Bash
  - Oncelik: KRITIK
  - Sure: 16 saat
  - Durum: Beklemede

- [ ] **6.1.2** Dokumantasyon Finalizasyonu
  - Oncelik: YUKSEK
  - Sure: 8 saat
  - Durum: Beklemede

- [ ] **6.1.3** Production Deployment
  - Oncelik: KRITIK
  - Sure: 4 saat
  - Durum: Beklemede

---

## ONCELIK SIRALAMASI (KRITIK -> DUSUK)

### KRITIK (Ilk 2 Hafta)
1. 1.1.1 - TC Kimlik No Hashleme
2. 1.1.2 - Console.log Temizligi
3. 1.2.1 - Prompt Injection Korumasi
4. 1.2.3 - Environment Variable Guvenligi
5. 3.1.1 - Landing Page

### YUKSEK (Hafta 3-6)
6. 1.2.2 - CORS Guvenligi
7. 2.1.1 - API Tip Guvenligi
8. 2.1.2 - Store Tip Guvenligi
9. 2.2.1 - Merkezi Error Handling
10. 3.1.2 - Pricing Page
11. 3.2.2 - Demo Video Sayfasi

### ORTA (Hafta 7-11)
12. 2.1.3 - ESLint Kurallar
13. 3.2.1 - Blog Altyapisi
14. 4.1.1 - Progress Dashboard
15. 4.1.2 - Veli Raporu
16. 4.2.1 - Gamification
17. 5.1.1 - API Testleri
18. 5.1.2 - Component Testleri
19. 5.2.1 - Bundle Optimizasyonu
20. 5.2.2 - Cache Stratejisi

---

## HAFTALIK HEDEFLER

| Hafta | Sprint | Ana Hedef | Teslim Edilecekler |
|-------|--------|-----------|---------------------|
| 1 | 1.1 | KVKK Uyumu | TC hash, logger |
| 2 | 1.2 | API Guvenlik | Prompt security, CORS, env |
| 3 | 2.1a | TypeScript | API tipleri |
| 4 | 2.1b + 2.2 | TypeScript + Error | Store tipleri, error handling |
| 5 | 3.1 | Landing Page | Ana sayfa + pricing |
| 6 | 3.2 | Content | Blog + demo |
| 7 | 4.1a | Progress | Dashboard |
| 8 | 4.1b | Reports | Veli raporu |
| 9 | 4.2 | Gamification | Rozet sistemi |
| 10 | 5.1 | Testing | Test coverage %60 |
| 11 | 5.2 | Performance | Bundle <300KB |
| 12 | 6.1 | Launch | QA + Deploy |

---

## NOTLAR

- Her gorev tamamlandiginda bu dosyayi guncelle
- Blocker varsa hemen raporla
- Haftalik retrospective yap
- Sprint sonunda demo sun

---

**Dokuman Sahibi:** Gelistirme Ekibi  
**Format:** Markdown Checklist

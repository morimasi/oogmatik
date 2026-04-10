# Profil Modülü Premium Geliştirme Planı

> **For agentic workers:** Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** ProfileView ve SettingsModal bileşenlerindeki tüm mock/placeholder fonksiyonları ve tip hatalarını düzelterek premium, gerçek işlevsel bir profil modülü oluşturmak.

**Architecture:** ProfileView tek bileşen içinde 6 sekme yönetir (overview/students/evaluations/plans/reports/settings). Tüm ayarlar localStorage'a persist edilir; şifre değişikliği ve hesap silme inline panel ile yapılır. `@ts-nocheck` kaldırılır, `console.error` → `logError()` dönüştürülür.

**Tech Stack:** React 18 + TypeScript (strict) + Vite + Vercel Serverless + Gemini 2.5 Flash + Firebase + Vitest

---

## Tespit Edilen Sorunlar

### SettingsModal.tsx
- [ ] `// @ts-nocheck` satır 1 — TypeScript devre dışı (kritik)

### ProfileView.tsx
- [ ] `console.error(e)` → `logError()` ile değiştirilmeli (Oogmatik kural)
- [ ] AI model default `'gemini-2.5-pro'` → `'gemini-2.5-flash'` (model sabittir)
- [ ] AI model seçici mevcut — Selin Arslan kuralına göre model değiştirilemez; UI mock olarak bırakılır ancak varsayılan düzeltilir
- [ ] AI ayarları localStorage'a kaydedilmiyor — sayfa yenilemede kayboluyor
- [ ] Avatar değiştirme `prompt()` kullanıyor — premium değil, güvenlik riski
- [ ] Şifre değiştirme `prompt()` + `alert()` kullanıyor — premium değil
- [ ] "RAPOR SİHİRBAZINI AÇ" `alert()` kullanıyor — premium değil
- [ ] "PLANA GİT" butonu onClick yok — işlevsiz
- [ ] Plans sekmesi yazdır butonu boş `() => {}` — işlevsiz
- [ ] "HESABI SİL" butonunun onClick'i yok + onay yok — tehlikeli
- [ ] Hardcoded istatistikler: `+2 Bu Ay`, `%94 Başarı`, `%78` gelişim, `%82` ort. skor
- [ ] Eğitim planları `plan.schedule.length` sıfıra bölme riski (division by zero)

---

## Dosya Haritası

| Dosya | İşlem | Sorumluluk |
|-------|--------|-----------|
| `src/components/SettingsModal.tsx` | Modify | `@ts-nocheck` kaldır, eksik tip annotasyonları ekle |
| `src/components/ProfileView.tsx` | Modify | Tüm mock/placeholder + console.error + hardcoded değerleri düzelt |
| `profile.md` | Update | Premium plan notlarını ve tamamlanan adımları kaydet |
| `tests/ProfileView.utils.test.ts` | Create | Yardımcı fonksiyonlar için Vitest testleri |

---

## Task 1: SettingsModal.tsx — @ts-nocheck Kaldır

**Files:**
- Modify: `src/components/SettingsModal.tsx`

### Neden @ts-nocheck Var?

SettingsModal `uiSettings` ve `theme` prop'larını alır. `uiSettings.contrastLevel` ve `uiSettings.premiumIntensity` UiSettings tipinde tanımlı. Muhtemelen implicit `any` dönüşümleri veya eski import yollarından.

- [x] **Adım 1.1:** `// @ts-nocheck` satırını kaldır
- [x] **Adım 1.2:** Eksik type annotasyonları ekle (özellikle olay handler parametreleri)
- [x] **Adım 1.3:** `npm run build` çalıştır ve hataları gider

---

## Task 2: ProfileView.tsx — console.error → logError

**Files:**
- Modify: `src/components/ProfileView.tsx`

- [x] **Adım 2.1:** `logError` import ekle: `import { logError } from '../utils/errorHandler';`
- [x] **Adım 2.2:** `catch (e) { console.error(e); }` → `catch (e) { logError(e instanceof Error ? toAppError(e) : new AppError(String(e), 'LOAD_ERROR', 500)); }`

---

## Task 3: AI Ayarları — Model Düzelt + Persist

**Files:**
- Modify: `src/components/ProfileView.tsx`

- [x] **Adım 3.1:** `model: 'gemini-2.5-pro'` → `model: 'gemini-2.5-flash'` (default)
- [x] **Adım 3.2:** localStorage'dan AI ayarları yükle (useState initializer)
- [x] **Adım 3.3:** AI ayar değişikliklerini localStorage'a kaydet (useEffect)
- [x] **Adım 3.4:** Model dropdown'dan `gemini-2.5-pro` ve `internal-pro` opsiyonlarını kaldır — sadece `gemini-2.5-flash` bırak (sabit model kuralı)

---

## Task 4: Avatar Değiştirme — prompt() → Inline Input

**Files:**
- Modify: `src/components/ProfileView.tsx`

- [x] **Adım 4.1:** `showAvatarUrlInput` state ekle
- [x] **Adım 4.2:** `avatarUrlInput` state ekle (input değeri için)
- [x] **Adım 4.3:** Kamera butonunu tıklayınca `showAvatarUrlInput = true` yap
- [x] **Adım 4.4:** Inline URL input alanı render et (avatar preview altında)
- [x] **Adım 4.5:** "Uygula" ile `setAvatarUrl(avatarUrlInput)` + `showAvatarUrlInput = false`

---

## Task 5: Şifre Değiştirme — prompt() → Inline Form

**Files:**
- Modify: `src/components/ProfileView.tsx`

- [x] **Adım 5.1:** `showPasswordForm` state ekle
- [x] **Adım 5.2:** `passwordForm` state ekle `{ current: '', next: '', confirm: '' }`
- [x] **Adım 5.3:** `handlePasswordChange` async fonksiyon: validate → `authService.updatePassword()` → toast
- [x] **Adım 5.4:** Security sekmesinde inline form paneli render et (`showPasswordForm === true`)
- [x] **Adım 5.5:** "Şifre Değiştir" butonu `showPasswordForm = true` açsın

---

## Task 6: Hesap Silme — Güvenli Onay Akışı

**Files:**
- Modify: `src/components/ProfileView.tsx`

- [x] **Adım 6.1:** `deleteConfirmStep` state: `0 | 1 | 2` (0=kapalı, 1=ilk onay, 2=ikinci onay)
- [x] **Adım 6.2:** `deleteConfirmText` state: input değeri
- [x] **Adım 6.3:** "HESABI SİL" butonu → `deleteConfirmStep = 1`
- [x] **Adım 6.4:** Adım 1: Uyarı metni + "Anladım" butonu → `deleteConfirmStep = 2`
- [x] **Adım 6.5:** Adım 2: `"HESABIMI SİL"` yazısını yazdırma + `authService.deleteUser()` + `logout()`
- [x] **Adım 6.6:** Hata durumunda `useToastStore.error()`

---

## Task 7: Fonksiyonel Butonlar Düzelt

**Files:**
- Modify: `src/components/ProfileView.tsx`

- [x] **Adım 7.1:** "RAPOR SİHİRBAZINI AÇ" `alert()` → `useToastStore.info('Rapor modülü hazırlanıyor...')`
- [x] **Adım 7.2:** "PLANA GİT" butonu → `setActiveTab('plans')` ile curriculumView'e git (proxy geçici)
- [x] **Adım 7.3:** Plans yazdır butonu → `printService.print(plan.studentName)` yerine toast `info`
- [x] **Adım 7.4:** `onOpenSettingsModal` undefined kontrolü ekle (optional chaining)

---

## Task 8: Hardcoded İstatistikleri Hesapla

**Files:**
- Modify: `src/components/ProfileView.tsx`
- Create: `tests/ProfileView.utils.test.ts`

### Test (önce yaz)

```typescript
import { describe, it, expect } from 'vitest';

describe('computeMonthlyNewStudents', () => {
  it('bu ay eklenen öğrenci sayısını döner', () => {
    const now = new Date();
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 5).toISOString();
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 5).toISOString();
    const students = [
      { id: '1', createdAt: thisMonth },
      { id: '2', createdAt: thisMonth },
      { id: '3', createdAt: lastMonth },
    ];
    expect(computeMonthlyNewStudents(students)).toBe(2);
  });

  it('bu ay öğrenci yoksa 0 döner', () => {
    const lastMonth = new Date(new Date().getFullYear(), new Date().getMonth() - 1, 5).toISOString();
    expect(computeMonthlyNewStudents([{ id: '1', createdAt: lastMonth }])).toBe(0);
  });
});

describe('computeAvgAssessmentScore', () => {
  it('değerlendirmelerin ortalama dikkat skorunu hesaplar', () => {
    const assessments = [
      { report: { scores: { attention: 80 } } },
      { report: { scores: { attention: 60 } } },
    ];
    expect(computeAvgAssessmentScore(assessments)).toBe(70);
  });

  it('değerlendirme yoksa 0 döner', () => {
    expect(computeAvgAssessmentScore([])).toBe(0);
  });
});
```

- [x] **Adım 8.1:** Test dosyasını oluştur: `tests/ProfileView.utils.test.ts`
- [x] **Adım 8.2:** `computeMonthlyNewStudents(students)` fonksiyonu — ProfileView içinde `useMemo`
- [x] **Adım 8.3:** `computeAvgAssessmentScore(assessments)` fonksiyonu — ProfileView içinde `useMemo`
- [x] **Adım 8.4:** `computeStudentProgress(student)` — gerçek veri yoksa 0 döner
- [x] **Adım 8.5:** Plans sekmesinde `plan.schedule.length > 0` sıfıra bölme kontrolü
- [x] **Adım 8.6:** `npm run test:run -- tests/ProfileView.utils.test.ts`

---

## Task 9: profile.md Güncelle

**Files:**
- Modify: `profile.md`

- [x] **Adım 9.1:** profile.md'yi uygulama notlarıyla güncelle, tamamlanan maddeleri işaretle

---

## Kabul Kriterleri

- [ ] `@ts-nocheck` SettingsModal'dan kaldırıldı
- [ ] `npm run build` hatasız çalışıyor
- [ ] `npm run test:run` geçiyor
- [ ] Profil modülünde hiç `prompt()` veya `alert()` yok
- [ ] AI ayarları localStorage'a kaydediliyor
- [ ] Hesap silme en az 2 adım onay gerektiriyor
- [ ] Hardcoded istatistikler kaldırıldı
- [ ] `console.error` → `logError()` dönüştürüldü

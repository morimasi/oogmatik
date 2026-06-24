# 🏥 KLİNİK & MEB UYUM DENETİM RAPORU

**Denetleyen:** Dr. Ahmet Kaya — Klinik/MEB Uzmanı  
**Tarih:** 2026-06-24  
**Proje:** OOGMATIK (bdmind)  
**Kapsam:** 12 dosya + 78 TSX bileşen → UI tanı dili taraması

---

## 🔴 KRİTİK BULGULAR (Derhal Müdahale Gerekli)

### K1. `bepEngine.ts:153` — AI Prompt'unda Öğrenci Adı + Tanı Açık Metin (KVKK İhlali)

```
// buildBEPPrompt() içinde:
Sen özel eğitim uzmanısın. ${student.name} adlı öğrenci için BEP hazırla.
...
Tanılar: ${student.diagnosis.join(', ')}
```

- **İhlal:** Öğrencinin **adı+tanısı** birlikte AI modeline (Gemini) gönderiliyor. KVKK Madde 6 ve 12 kapsamında özel nitelikli veri sınıflandırması gerektiren bu veri, hiçbir anonimleştirmeden geçmeden üçüncü taraf AI servisine iletilmekte.
- **Yapılması gereken:** `${student.name}` yerine `"Öğrenci"` veya maskelenmiş isim kullanılmalı, `${student.diagnosis}` önce `privacyService.sanitizeDiagnosisForAI()`'den geçirilmeli.
- **Kanıt:** `bepEngine.ts:153-158`
- **MEB/573 KHK:** Özel eğitim hizmetlerinde öğrenci mahremiyeti esastır (573 KHK md. 6).

### K2. `sinavService.ts:18-19` — Hardcoded userId (Authentication Bypass Riski)

```typescript
// TODO: AuthStore'dan userId al
'x-user-id': 'current-user-id'
```

- **İhlal:** Kalıcı bir placeholder kimlik (`current-user-id`) tüm sınav oluşturma isteklerinde kullanılıyor. Gerçek userId AuthStore'dan hiç alınmamış.
- **Risk:** Yetkisiz sınav oluşturma, başka kullanıcı adına işlem yapma, denetim izi kaybı.
- **Yapılması gereken:** `useAuthStore`'dan `user.id` alınarak dinamik olarak set edilmeli.

### K3. `worksheetService.ts:292-315` — Paylaşımda Açık Onay Yok (KVKK Madde 6)

```typescript
shareWorksheet: async (worksheetId, senderId, senderName, receiverIds) => {
    // ... doğrudan sharedWith array'ine ekleme
}
```

- **İhlal:** Paylaşım öncesi **veli/öğrenci açık rızası** alınmıyor. KVKK Madde 6'ya göre özel nitelikli veri içeren çalışma kağıtlarının paylaşımı için açık onay zorunludur.
- **Yapılması gereken:** Paylaşmadan önce `parentalConsent.granted` veya özel bir `shareConsent` flag'i kontrol edilmeli.

### K4. `firestore.rules:47-51` — saved_worksheets Herkese Açık Okunabilir

```
match /saved_worksheets/{worksheetId} {
  allow read: if isAuthenticated();  // ← Tüm authenticated kullanıcılar okuyabilir
```

- **İhlal:** Herhangi bir authenticated kullanıcı, başka bir öğretmenin öğrenci çalışma kağıtlarını okuyabilir. Çalışma kağıtları `studentName` ve potansiyel olarak hassas veri içerebilir.
- **Yapılması gereken:** `read` kuralına sahiplik kontrolü eklenmeli: `resource.data.userId == request.auth.uid || resource.data.sharedWith hasAny request.auth.uid`

---

## 🟠 ORTA BULGULAR (Planlı Düzeltme Gerekli)

### O1. `SharedWorksheetsView.tsx:129` — Öğrenci Adı + Sınıf Birlikte UI'da

```typescript
name: `${a.studentName} - ${a.grade}`,
```

- Paylaşılan değerlendirme raporları listesinde **öğrenci adı + sınıf** birlikte görüntüleniyor. KVKK veri minimizasyonu ilkesine aykırı.
- **Öneri:** `maskStudentName()` ile isim maskelenmeli veya sadece sınıf bilgisi gösterilmeli.

### O2. `authService.ts:390-403` — Veri Silme Endpoint'i Eksik (KVKK Madde 7)

```typescript
deleteUser: async (userId) => {
    // Client-side SDK üzerinden başka bir kullanıcının Auth kaydı SİLİNEMEZ.
    // Şimdilik sadece firestore belgesini siliyoruz.
    await deleteDoc(doc(db, "users", userId));
}
```

- Firestore dokümanı siliniyor ancak Firebase Auth kaydı silinmiyor. KVKK Madde 7 (unutulma hakkı) gereği tüm veri katmanlarının temizlenmesi gerekir.
- `adminService.ts:245-248`'de de aynı sorun mevcut.
- **Öneri:** Cloud Function ile `admin.auth().deleteUser()` entegrasyonu yapılmalı.

### O3. `bepEngine.ts:153-158` — AI Prompt'unda Tanı Koyucu Dil Filtresi Yok

- Diğer generator'larda (`adGeneratorService`, `AgentOrchestrator`, `kelimeCumleGenerator`) tanı koyucu dil filtresi mevcutken **BEP prompt'unda bu filtre yok**.
- **Öneri:** Prompt'a "Tanı koyucu dil YASAK" direktifi eklenmeli.

### O4. `piiAnonymizer.ts:109-115` — Tanı Pseudonym'leri Anlamsız

```typescript
anonymized.diagnosis = data.diagnosis.map(d => {
  const pseudonym = `DIAG_${this.generateId()}`;
  return pseudonym;
});
```

- Tanılar `DIAG_XXXXX` gibi anlamsız ID'lere dönüştürülüyor. Oysa `privacyService.ts`'de olduğu gibi jenerik öğrenme profili terimlerine dönüştürülmeli (örn: "disleksi" → "özel öğrenme güçlüğü").
- **Öneri:** `piiAnonymizer`'da da `sanitizeDiagnosisForAI` benzeri bir genericleştirme yapılmalı.

### O5. `firestore.rules:32-38` — students Koleksiyonunda Field-Level Security Yok

```
match /students/{studentId} {
  allow read: if isAdmin() || isTeacher();
```

- Tüm teacher'lar öğrenci belgesinin **tüm alanlarını** okuyabiliyor. `healthInfo.diagnosis`, `personalInfo.tcNoHash` gibi hassas alanlar teacher rolündeki herkes tarafından görülebilir.
- **Öneri:** Hassas alanlar için ayrı bir alt koleksiyon veya `hasAny` rol kontrolü eklenmeli.

### O6. `useProfileData.ts:91` — Streak TODO Klinik Etik Riski

```typescript
streak: 0, // TODO: Implement streak calculation
```

- Şu an sabit `0` değeri döndüğü için doğrudan ihlal yok. Ancak "streak" (art arda gün) metriği, özel öğrenme güçlüğü çeken öğrencilerde motivasyon kaybına yol açabilir. İleride implementasyon yapılırken klinik etik danışmanlığı alınmalı.
- **Öneri:** AGENTS.md'ye not düşüldü.

---

## 🟢 OLUMLU BULGULAR (Mevcut Uyum)

### ✅ privacyService.ts — KVKK DLP Altyapısı

- `sanitizeDiagnosisForAI()`: Klinik terimleri başarıyla jenerikleştiriyor (disleksi → "özel öğrenme güçlüğü")
- `createSafeStudentProfileForAI()`: İsimsiz, generic profile gönderiyor
- `maskStudentName()`: İsimleri KVKK uyumlu maskeliyor ("A**** Y****")
- `checkAnonymization()`: TC No, e-posta, telefon, tam ad tespiti yapıyor
- `sanitizeObject()`: Rekürsif hassas veri taraması

### ✅ student-advanced.ts — KVKK Tip Güvenliği

- `StudentPrivacySettings` → KVKK Madde 6 ve 11 referanslı
- `SensitiveDataHandling` → Her veri türü için ayrı sınıflandırma
- `DataRetentionPolicy` → MEB 3 yıl önerisi
- `DataSubjectRequest` → KVKK Madde 11 (unutulma hakkı)
- `ParentalConsent` → Açık onay mekanizması
- `PrivacyAuditLog` → Denetim izi
- `AIProcessingPermissions` → AI veri işleme izinleri

### ✅ AI Prompt Filtreleri (4/5 Generator'da Mevcut)

- `AgentOrchestrator.ts:67` — `hasForbiddenPhrases` regex kontrolü
- `adGeneratorService.ts:14` — Tanı koyucu dil yasağı prompt'ta
- `shared.ts` (sariKitap) — Tanı koyucu dil yasağı
- `useKelimeCumleGenerator.ts:119` — Tanı koyucu dil yasağı
- `clinicalValidator.ts` — UI tarafında validasyon pattern'leri

### ✅ BEP SMART Format

- `SMARTGoal` interface'i: `baseline`, `target`, `timeline`, `strategies`, `accommodations` alanları mevcut
- Hem AI hem rule-based hedef oluşturma destekleniyor
- Düzenli değerlendirme takvimi (aylık + 6 aylık kapsamlı)
- Ekip yapısı: öğretmen + veli + klinisyen

### ✅ UI Tanı Dili Taraması — TEMİZ

- **"disleksisi var"** → UI'da kullanılmıyor (sadece validasyon pattern'lerinde)
- **"dislektik"** → UI'da kullanılmıyor (sadece validasyon pattern'lerinde)
- **"öğrenme güçlüğü çekiyor"** → Hiçbir yerde kullanılmıyor
- "disleksi" geçen yerler: "disleksi dostu", "disleksi profili", "disleksi desteği" gibi kabul edilebilir bağlamlarda

---

## 📊 İSTATİSTİKLER

| Kategori | Adet |
|---|---|
| KRİTİK bulgu | 4 |
| ORTA bulgu | 6 |
| OLUMLU tespit | 6 |
| Taranan dosya | 12 |
| Taranan TSX bileşen | 78 |
| Tanı koyucu dil ihlali (UI) | 0 |
| KVKK ad+tanı+skor birlikteliği | 1 (bepEngine prompt) |

---

## 🎯 ÖNCELİKLİ EYLEMLER (Sıralı)

| # | Eylem | Dosya | Öncelik |
|---|---|---|---|
| 1 | AI prompt'undan öğrenci adı+tanı çıkar, DLP'den geçir | `bepEngine.ts:153-158` | 🔴 Acil |
| 2 | Hardcoded userId'i AuthStore'dan alınan gerçek userId ile değiştir | `sinavService.ts:18` | 🔴 Acil |
| 3 | `shareWorksheet`'e açık onay kontrolü ekle | `worksheetService.ts:292` | 🔴 Acil |
| 4 | `saved_worksheets` read kuralını sahiplik+paylaşım ile sınırla | `firestore.rules:47` | 🔴 Acil |
| 5 | Veri silme endpoint'ine Cloud Function auth deleteUser ekle | `authService.ts:390` | 🟠 Orta |
| 6 | SharedWorksheetsView'da studentName maskesi | `SharedWorksheetsView.tsx:129` | 🟠 Orta |
| 7 | BEP prompt'una tanı koyucu dil filtresi ekle | `bepEngine.ts` | 🟠 Orta |
| 8 | piiAnonymizer tanı pseudonym'lerini generic terimlere dönüştür | `piiAnonymizer.ts:109` | 🟠 Orta |
| 9 | students koleksiyonuna field-level security ekle | `firestore.rules:32` | 🟠 Orta |
| 10 | schema.sql doldur | `src/database/schema.sql` | 🟠 Orta |

---

## 📋 KONTROL LİSTESİ DURUMU

- [❌] **Tanı koyucu dil yasak:** UI'da TEMİZ, AI prompt'larında 1/5'te EKSİK (bepEngine)
- [❌] **KVKK Madde 7:** Silme endpoint'i yalnızca Firestore doc siler, Auth kaydı silinmez
- [❌] **Ad + tanı + skor birlikteliği:** bepEngine AI prompt'unda açık ihlal
- [❌] **Paylaşım için açık onay:** worksheetService'de yok
- [❌] **sharedWith cascad temizlik:** Paylaşımdan çıkarma/onay iptali yok
- [✅] **BEP SMART format:** Uygun (baseline + target + timeline + strategies)
- [⚠️] **MEB/573 KHK:** Kısmi uyum (tip tanımlarında MEB notu var, prompt'ta yok)
- [✅] **AI prompt tanı filtresi:** 4/5 generator'da mevcut
- [❌] **sinavService userId:** Hardcoded placeholder — KVKK ihlali riski

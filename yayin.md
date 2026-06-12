# 📋 OOGMATIK (bdmind) — Kapsamlı Modül Denetim & Yayımlama Planı (Swarm v2.0)
**Tarih**: 12 Haziran 2026  
**Denetçi**: Tüm Lider Ajanlar Aktif (Elif Yıldız, Dr. Ahmet Kaya, Bora Demir, Selin Arslan)  
**Kapsam**: Tüm uygulama modülleri — Profil, Admin, Öğrencilerim, Değerlendirme, Analiz, Planlama, Çalışma Kitapçığı, Paylaşım

---

## 📊 GENEL DURUM ÖZETİ

| Metrik | Değer | Durum |
|--------|-------|-------|
| Toplam Bileşen Dosyası | 89+ | ⚠️ Yönetilebilir sınırda |
| Zustand Store | 10 | ✅ Konsolide edildi (19'dan 10'a düşürüldü) |
| Servis Dosyası | 63+ | ⚠️ Bazıları ölü kod |
| `@ts-nocheck` Dosya | 15 | 🔴 KRİTİK — tip güvenliği devre dışı |
| `as any` Kullanan Dosya | 96+ | 🔴 KRİTİK — proje kuralına aykırı |
| Firestore Kuralları Eksik | 5+ | 🔴 KRİTİK — güvenlik açığı |
| Mesajlaşma Modülü Kalıntıları | Var | 🟡 Temizlik gerekiyor |

---

## 🔴 BÖLÜM 1: KRİTİK HATALAR VE GÜVENLİK AÇIKLARI

### 1.1 Firestore Güvenlik Kuralları Eksiklikleri
**Şiddet**: 🔴 KRİTİK  
**Dosya**: `firestore.rules`

Aşağıdaki koleksiyonlar `firestore.rules` dosyasında tanımlanmamıştır veya yetersizdir:
- `shared_profile_content`
- `saved_assessments`
- `activity_assignments`
- `teacher_data`
- `feedback`
- `clinical_notes`

**Çözüm**: Tüm bu koleksiyonlar için rol tabanlı (RBAC) ve yetkilendirmeli erişim kuralları KHK ve MEB KVKK standartlarına uygun şekilde acilen yazılmalıdır.

### 1.2 TypeScript Tip Güvenliği & `any` Kullanımı
**Şiddet**: 🔴 KRİTİK  
**Kural**: `any` kullanımı kesinlikle yasaktır (`unknown` ve type guardlar kullanılmalı).
Özellikle `ContentArea.tsx`, `Sidebar.tsx`, ve `SheetRenderer.tsx` dosyalarında `@ts-nocheck` bulunması öngörülemez hatalara zemin hazırlamaktadır. 96+ dosyadaki legacy code temizlenmelidir.

### 1.3 Kaldırılan Mesajlaşma Modülünün Kalıntıları
**Şiddet**: 🟡 ORTA (Build/Render Hatası Potansiyeli)  
**Dosya**: `App.tsx` (Satır 585+)
Mesajlaşma modülü platformdan resmi olarak **kaldırılmış olmasına rağmen**, uygulamanın en kritik dosyalarından olan `App.tsx` içindeki `AnimatePresence` views dizisinde hâlâ `'messages'` route'u yer almaktadır.
**Çözüm**: Geliştirme planındaki eski yaklaşım (Modülü yeniden render et/onarmaya çalış) hatalıdır. Düşük kaliteli "Zombie Code" varlığı SaaS standartlarına terstir. Kalan tüm import, durum ve dead-code referansları kökten dizinden kazınmalıdır (Scrubbing).

---

## 🟡 BÖLÜM 2: MODÜL BAZLI DERİN ANALİZ

### 2.1 ÖĞRENCİLERİM VE "AKTİF ÖĞRENCİ FARKINDALIĞI (AWARENESS)" MODÜLÜ
**Şiddet**: 🔴 YÜKSEK

#### Analiz:
Tüm mimarinin ve premium veri güvenliğinin can damarı **"Aktif Öğrenci Farkındalığı"** (Active Student Awareness) olmalıdır. Önceki sürümlerde var olan mock dataların silinmesinin ardından, bazı spesifik alt modüllerin (örn. Assignments, Clinical Analytics) güncel state içindeki öğrenciye (ID'ye) duyarlılığı izole edilmemiştir.

#### 🔧 İyileştirmeler:
| # | Önerilen | Öncelik |
|---|---------|---------|
| ST-1 | `useStudentStore` üzerinden aktif öğrenci bağlamını tüm AI jeneratörlerine zorunlu ve validate edilmiş parametre olarak geçir. Öğrenci verisi cross-pollination olmamalı. | 🔴 Yüksek |
| ST-2 | `StudentDashboard.tsx` içindeki monolitik yapıyı alt panellere (Assignments, Analytics, vb.) tam parçala. | 🟡 Orta |
| ST-3 | Kalan tüm Mock veri ve hardcoded değerleri tamamiyle Firebase real-time listener'lara bağla. | 🔴 Yüksek |

### 2.2 DEĞERLENDİRME VE KLİNİK NOTLAR
**Şiddet**: 🔴 YÜKSEK

#### Analiz:
Değerlendirme sonucunda *"Bu alan AI ile doldurulacak."* string bildiriminin end-user (Öğretmen/Veli) tarafından UI'da görünmesi kaliteyi düşürür. (Pedagojik Otorite Uyarısı: Elif Yıldız). Ayrıca Klinik Notlar KVKK gereği DB seviyesinde maskelenmeli ve role-based olmalıdır.

#### 🔧 İyileştirmeler:
| # | Önerilen | Öncelik |
|---|---------|---------|
| AS-1 | AI Rapor Fallback (Yedek) Mekanizması: Eğer Gemini Timeout veya Failover durumu yaşanırsa, Zod Validasyon katmanında kural tabanlı pedagojik bir özet (hardcoded logic) dönülmeli. | 🔴 Yüksek |
| AS-2 | `studentId: 'temp'` geçici ID riskini DB'ye yazılmadan Zod şemalarında durdur, mutlak öğrenci kaydını pipeline aşamasında zorunlu kıl. | 🟡 Orta |

### 2.3 PLANLAMA, ÇALIŞMA KİTAPÇIĞI (Workbook) & DİJİTAL ARŞİV
**Şiddet**: 🟡 ORTA

#### Analiz:
A4 boyutuna uygun çoklu sayfa (Multi-page) tasarımı ve yüksek yoğunluklu (High-Density) "Sarı Kitap" render çıktıları son sprintlerde optimize edildi. Ancak verilerin kalıcılığı (Persist) sadece browser cache'inde durmaktadır.

#### 🔧 İyileştirmeler:
| # | Önerilen | Öncelik |
|---|---------|---------|
| WB-1 | Çoklu sayfa flatten işlemlerinde (handleAddToWorkbookGeneral) Pagination yapısının stabilizasyonunu garantile. İçeriklerin üst üste binmesini fixle. | 🔴 Yüksek |
| WB-2 | Firestore kalıcılık: Workbooks için auto-save mekanizması ekle ve state kaybını önle. | 🟡 Orta |

---

## 🟠 BÖLÜM 3: YATAY KESİŞEN SORUNLAR VE SWARM AI MİMARİSİ

### 3.1 Swarm v2.0 AI Protokolü (Tam Oto-Pilot)
Her geliştirme aşamasında projeye özgü **Elif Yıldız (Pedagoji)**, **Dr. Ahmet Kaya (MEB/KVKK)**, **Bora Demir (Mimar)** ve **Selin Arslan (AI)** lider ajanları otomatik olarak devreye girer. Geliştirme planına uygun olarak tüm ajanlar Zero-Shot Hallucination engelleme prensibi ve `%100 hata toleranssızlık` kuralı ile denetim yapar. 

### 3.2 Mimari ve God Component Temizliği
`App.tsx` üzerindeki yoğun State yönetimi ve Karmaşa `hooks/` panellerine (`useNavigationLogic`, `useWorkbookManager` vb.) taşınarak omurga hafifletildi. Ancak View bileşenleri (`CurriculumView`, `SheetRenderer` vb) devasa boyutlardadır ve Modüler Parçalanması kritik süreçler arasındadır.

---

## 📆 BÖLÜM 4: GELİŞTİRME VE YAYIMLAMA PLANI (GÜNCEL YOL HARİTASI)

### Faz 0: Kritik Güvenlik ve Zombie Kod Temizliği (1-2 Gün)
- [ ] Firestore güvenlik kurallarını tamamla (Audit Logs, Clinical Notes, Saved Assessments).
- [ ] Mesajlaşma Modülü kalıntılarını (`messages` route dahil) `App.tsx`'den **tamamen sil**, imports ve referansları codebase'den kazı.
- [ ] Profil modülündeki veritabanı eşitleme eksikliğini düzelt (`users/{id}/settings`).

### Faz 1: Tip Güvenliği ve AI Kararlılığı (3-5 Gün)
- [ ] 15 Kritik dosyadan `@ts-nocheck` ibarelerini kaldır; strict config şartlarını sağla.
- [ ] `as any` kullanımlarını bul, Zod validasyonu yardımıyla `unknown` / Type Guards mantığıyla sar.
- [ ] Öğrenci değerlendirme modülünde AI failover mantığını entegre ederek, platformun hiçbir şekilde kullanıcıya çıplak bir JSON hatası veya statik Placeholder göstermemesini sağla.

### Faz 2: Premium SaaS ve Aktif Öğrenci Senkronizasyonu (1-2 Hafta)
- [ ] "Aktif Öğrenci Farkındalığı" yapısını tüm AI generator'ların context request'i içine bağla. AI, daima "hangi öğrenci için" bunu ürettiğini bilecek.
- [ ] Devasa `WorkbookView` dahil kalan UI God Component'ları `index.ts` tabanlı bileşen ağaçlarına (components/) ayır.
- [ ] Premium SaaS tasarım diline (Dark Glassmorphism) göre Admin paneli (AdminDashboardV2) tutarlılığını tüm modüllere standartlaştır.

### Faz 3: Kalite Güvence ve Canlıya Çıkış (QA & Release) (1 Hafta)
- [ ] Firebase Emulator Suite kullanarak `read/write` rol senaryolarının (%100 güvenlik açığı olmadan) KVKK testi.
- [ ] `npm run build` komutunun `tsc --noEmit` durumundan en ufak bir type veya any hatası almadan derlendiğini doğrula.
- [ ] Vercel deploy aşamasına post-deploy sanity check adımlarını entegre et.

---

## 🏁 SONUÇ VE ÖNERİ

Platform mimarisi, "v2 Swarm Ajans" entegrasyonuna ve Yüksek Premium SaaS mantalitesine tam entegre hale getirilecek şekilde güncellendi. Eski Planda tespit edilen "kaldırılan modülleri onarmaya çalışmak" gibi büyük mantıksal hatalar bertaraf edilmiş olup, tam odak **Mevcut Modüllerin Stabilizasyonu, Tip Güvenliği ve "Aktif Öğrenci" Senkronizasyonu** üzerine çekilmiştir.

**Tahmini Toplam Süre:** Odaklanmış ve sıfır hata toleranslı 3-4 haftalık geliştirme sprinti.

> **Bora Demir** (Mühendislik): *"Ölü kodu (Mesajlaşma) yaşatmaya çalışmak en büyük teknik borçtur. Önce sil, sonra modüler olarak geri inşa et."*  
> **Dr. Ahmet Kaya** (Klinik/MEB): *"Güvenlik açığı olan bir platformda özel çocukların sağlık/eğitim verisini tutmak, çatısız evde oturmaya benzer. Faz 0 mutlak zorunluluktur."*  
> **Elif Yıldız** (Pedagoji): *"Öğretmen şeffaflık bekler, sistemsel 'boş placeholder' metinleri motivasyonu baltalar. Kararlılık anahtar kelimedir.*"

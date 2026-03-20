# OOGMATIK — PREMIUM İŞLEV GELİŞTİRME PLANI

## MEVCUT DURUM ANALİZİ

| İşlev | Mevcut Durum | Kritik Sorunlar |
|-------|-------------|-----------------|
| **PDF İndirme** | `html2canvas` ile capture → PNG indirme (gerçek PDF değil) | jsPDF entegrasyonu yok, çoklu sayfa birleşik PDF üretmiyor |
| **Yazdırma** | DOM klonlama + `window.print()` | Tablet/telefonda güvenilir değil, margin sorunları |
| **Ekran Görüntüsü** | `html2canvas` ile tek sayfa PNG | Sadece ilk sayfayı yakalıyor, çoklu sayfa desteklemez |
| **Paylaşma** | Firestore `sharedWith` array | Web Share API yok (mobilde yerel paylaşım çalışmaz) |
| **Arşive Kaydetme** | Firestore CRUD | Toast/bildirim geri bildirimi zayıf |
| **Kitapçık** | Koleksiyon yönetimi var | PDF olarak toplu dışa aktarım yok |
| **Çoklu Sayfa** | Ağırlık tabanlı pagination var (`MAX_WEIGHT=1188`) | Content overflow taşması, devam sayfalarında header eksik |

---

## GELİŞTİRME PLANI — 6 FAZ

### FAZ 1: ÇOKLU SAYFA SİSTEMİ — TEMİZ SAYFA AKIŞI

**Sorun:** Uzun etkinlikler ilk sayfaya sığmadığında kesiliyor veya taşıyor.

**Çözüm Mimarisi:**
1. `paginationService.ts` — Ağırlık sistemini gerçek A4 piksel yüksekliğine kalibre et
2. **Devam Sayfası Başlık Sistemi:** `isContinuation: true` → otomatik mini-header: `"Etkinlik Adı (Sayfa 2/3)"`
3. **ContentArea Çoklu Sayfa Render:** Her `SingleWorksheetData` bağımsız `.worksheet-page` div
4. **Taşma Koruması:** Atomic birimlerde bölme, bloğun ortasından asla bölmeme

### FAZ 2: PDF MOTORU — GERÇEK PDF ÜRETİMİ (ÖNCELİK 1)

**Sorun:** PNG indiriyor, gerçek PDF üretmiyor.

**Çözüm:**
1. **jsPDF + html2canvas:** Her `.worksheet-page` → canvas → `jsPDF.addImage()` → tek PDF
2. **Progress callback:** `"Sayfa 2/5 işleniyor..."` → UI'da progress bar
3. **Kalite Seçenekleri:** Standart (1.5x), Yüksek (2x), Baskı (3x)
4. **Mobil:** iOS `window.open()`, Android Download API

### FAZ 3: YAZDIRMA — PLATFORM BAĞIMSIZ BASKI

1. **Print Overlay:** Her sayfa capture → `page-break-after: always`
2. **Mobil:** PDF üret → yeni sekmede aç → talimat göster
3. **Preview:** Gerçek küçük resimler, sayfa seçimi, gri tonlama

### FAZ 4: EKRAN GÖRÜNTÜSÜ — ÇOKLU SAYFA + KALİTE

1. **Tek Sayfa:** Retina PNG (mevcut)
2. **Tüm Sayfalar:** ZIP arşivinde veya dikey birleştirilmiş PNG
3. **Clipboard:** `navigator.clipboard.write()`
4. **Mobil Paylaşım:** `navigator.share({ files: [blob] })`

### FAZ 5: PAYLAŞMA & KAYDETME

1. **Web Share API:** PDF/PNG doğrudan WhatsApp/Telegram/Mail
2. **Hızlı Kaydet:** Tek tıkla arşive
3. **Toast Bildirimleri**
4. **Kitapçık PDF:** Tüm etkinlikler tek PDF + kapak + içindekiler

### FAZ 6: PREMIUM UI & MOBİL DENEYİM

1. **Progress Modal:** Animasyonlu progress bar + sayfa bilgisi
2. **Toast Sistemi:** Başarı/Hata/Bilgi bildirimleri
3. **Mobil Toolbar:** Telefonda alt çubuk
4. **Accessibility:** aria-label, keyboard nav

---

## UYGULAMA SIRASI

| Sıra | Faz | Neden Önce |
|------|-----|-----------|
| 1 | FAZ 2 — Gerçek PDF Motoru | Tüm dışa aktarımın temeli |
| 2 | FAZ 1 — Çoklu Sayfa | PDF'in düzgün çalışması için gerekli |
| 3 | FAZ 3 — Yazdırma | PDF motoru üzerine inşa |
| 4 | FAZ 4 — Ekran Görüntüsü | Bağımsız, hızlı |
| 5 | FAZ 5 — Paylaşma & Kaydetme | Mevcut altyapı güçlü |
| 6 | FAZ 6 — Premium UI | Son cilalama |

## TEKNİK BAĞIMLILIKLAR

| Paket | Amaç | Durum |
|-------|-------|-------|
| `html2canvas` | DOM → Canvas | ✅ Yüklü |
| `jspdf` | Gerçek PDF üretimi | ⚠️ Yüklenmeli |
| `qrcode` | QR kod | ✅ Mevcut |

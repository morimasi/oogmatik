# Profil Modülü Refactoring Uygulama Planı

**Tarih:** 2026-05-08  
**Özellik:** Profil Modülü Ultra-Modüler Yeniden Yapılandırma + Süper Türkçe Çoklu Sayfa Desteği  
**Spec:** `docs/profil.md`  
**Mevcut Durum:** `ProfileView.tsx` 1860 satır monolitik dosya  

---

## Genel Bakış

Mevcut `ProfileView.tsx` dosyasını 6 bağımsız modüle bölerek premium, AI-zengin bir profil sistemi oluşturmak. Ek olarak Super Türkçe Stüdyosu'na çoklu sayfa desteği eklemek ve kritik hataları düzeltmek.

### Hedefler
- [ ] ProfileView.tsx'yi 6 modüle böl (Overview, Students, Analysis, Plans, Reports, Settings)
- [ ] Her modül kendi hook'u ve state'i ile loose-coupled
- [ ] Super Türkçe A4 önizlemesine çoklu sayfa desteği
- [ ] Sıralama etkinliği `undefined title` hatası çözümü
- [ ] Kelime & Cümle Stüdyosu modüler modernizasyonu

### Teknik Gereksinimler
- TypeScript strict mode
- AppError standardı
- any tipi yasak (unknown + type guard)
- Vitest testleri
- Rate limiting yeni endpoint'lerde
- pedagogicalNote AI çıktılarında zorunlu

---

## Dosya Yapısı Haritası

### Oluşturulacak Dosyalar
```
src/components/Profile/
├── index.tsx                     # ProfileShell (routing + layout)
├── hooks/
│   └── useProfileData.ts         # Tüm shared state & data fetching
├── components/
│   ├── ProfileHeader.tsx         # Üst banner + avatar + navigasyon
│   └── TabNavigation.tsx         # Tab pill navigasyonu
├── modules/
│   ├── OverviewModule.tsx        # Özet Dashboard bento grid
│   ├── StudentsModule.tsx        # Öğrenci yönetimi + AI risk analizi
│   ├── AnalysisModule.tsx        # Değerlendirme + AI trend tahmini
│   ├── PlansModule.tsx           # Planlar + BEP entegrasyonu
│   ├── ReportsModule.tsx         # Raporlar + KVKK anonimleştirme
│   └── SettingsModule.tsx        # Ayarlar alt kategorileri
└── constants.ts                  # Tab tanımları, varsayılan ayarlar
```

### Değiştirilecek Dosyalar
- `src/components/ProfileView.tsx` → Silinecek (yedek alınacak)
- `src/App.tsx` → ProfileView import'unu Profile/index.tsx'e değiştir
- `src/components/SuperStudio/A4PreviewPanel.tsx` → Çoklu sayfa desteği
- `src/components/ActionToolbar.tsx` → PDF export motoru
- `src/components/SheetRenderer.tsx` → Sıralama etkinliği hata çözümü
- `src/components/KelimeCumleStudio/` → Modüler yapı

---

## Bite-Sized Görevler

### Faz 0: Hazırlık (10 dakika)
1. `src/components/ProfileView.tsx` dosyasını `ProfileView.tsx.backup` olarak yedekle
2. `src/components/Profile/` dizin yapısını oluştur
3. `src/components/Profile/constants.ts` dosyasını oluştur (tab tanımları)
4. Mevcut ProfileView.tsx'nin prop interface'ini `src/types/profile.ts`'a taşı

### Faz 1: Paylaşılan Altyapı (15 dakika)
5. `src/components/Profile/hooks/useProfileData.ts` hook'unu oluştur
   - user, isReadOnly state'leri
   - assessments, worksheets, curriculums fetch
   - stats hesaplamaları (totalStudents, avgScore, streak)
   - performanceTrends hesaplaması
   - refreshData() aksiyonu
6. `src/components/Profile/components/ProfileHeader.tsx` bileşenini oluştur
   - Avatar + isim + rol badge
   - E-posta + kayıt tarihi
   - Geri + Kapat butonları
7. `src/components/Profile/components/TabNavigation.tsx` bileşenini oluştur
   - 6 tab pill navigasyonu
   - Aktif tab vurgusu + animasyon
   - Responsive tasarım

### Faz 2: Temel Modüller (40 dakika)
8. `src/components/Profile/modules/OverviewModule.tsx` oluştur
   - 8 KPI bento grid kartı
   - Son materyaller listesi
   - Performans trend grafiği
   - Hızlı aksiyon butonları
9. `src/components/Profile/modules/StudentsModule.tsx` oluştur
   - AdvancedStudentManager embed
   - Grid/Liste toggle
   - Akıllı arama ve filtreleme
10. `src/components/Profile/modules/AnalysisModule.tsx` oluştur
    - Değerlendirme tablosu (sıralama + filtreleme)
    - Radar chart entegrasyonu
    - Anomali tespit kartları

### Faz 3: İleri Modüller (40 dakika)
11. `src/components/Profile/modules/PlansModule.tsx` oluştur
    - Müfredat planları listesi
    - Plan ilerleme göstergesi
    - BEP kartları (SMART hedefler)
12. `src/components/Profile/modules/ReportsModule.tsx` oluştur
    - Rapor dashboard
    - KVKK anonimleştirme toggle
    - Toplu PDF export
13. `src/components/Profile/modules/SettingsModule.tsx` oluştur
    - Profil alt kategorisi
    - Arayüz ayarları
    - Güvenlik ayarları

### Faz 4: Entegrasyon (20 dakika)
14. `src/components/Profile/index.tsx` (ProfileShell) oluştur
    - Tab state yönetimi
    - Modül routing
    - Layout wrapper
15. `src/App.tsx`'te ProfileView import'unu Profile/index.tsx'e değiştir
16. Tüm modülleri test et - geçişler sorunsuz mu?

### Faz 5: Super Türkçe Çoklu Sayfa (30 dakika)
17. `src/components/SuperStudio/A4PreviewPanel.tsx`'yi güncelle
    - Sayfa navigasyonu butonları
    - Tüm sayfaları göster modu
    - Print CSS entegrasyonu
18. `src/components/ActionToolbar.tsx`'yi güncelle
    - Yazdır butonu + print CSS
    - Çoklu sayfa PDF export motoru
    - Sayfa sayısı badge
19. Genel CSS'e print stilleri ekle

### Faz 6: Hata Düzeltmeleri (20 dakika)
20. `src/components/SheetRenderer.tsx`'de Sıralama etkinliği hatası çöz
    - data null-check ekle
    - default title değeri
21. Kelime & Cümle Stüdyosu modüllerini güncelle
    - Çoktan seçmeli modüler yapı
    - 1 sayfa kuralı + akıllı sayfalama

### Faz 7: Test & Doğrulama (15 dakika)
22. `npm run build` çalıştır - TypeScript hataları yok
23. `npm run lint` çalıştır - ESLint uyumlu
24. `npm run test:run` çalıştır - Tüm testler geçiyor
25. Manuel test: Profil açılıyor, 6 sekme arası geçiş çalışıyor
26. Manuel test: Super Türkçe çoklu sayfa çalışıyor
27. Manuel test: PDF export çoklu sayfa destekliyor

---

## Test Stratejisi

### Otomatik Testler
- **Unit Testler:** Her modül için ayrı test dosyası
  - `tests/Profile/useProfileData.test.ts`
  - `tests/Profile/OverviewModule.test.ts`
  - `tests/Profile/StudentsModule.test.ts`
  - vb.
- **Integration Testler:** Profil shell routing testi
- **E2E Testler:** Playwright ile tam akış testi

### Test Kapsamı
- Hook'lar: Data fetching, state updates, error handling
- Modüller: Render, user interactions, API calls
- Entegrasyon: Tab switching, data flow
- Edge cases: Loading states, error states, empty data

### Test Örneği
```typescript
// tests/Profile/useProfileData.test.ts
describe('useProfileData', () => {
  it('should fetch user data on mount', async () => {
    // Arrange
    const mockUser = { id: '1', name: 'Test User' };
    vi.mocked(authService.getCurrentUser).mockResolvedValue(mockUser);
    
    // Act
    const { result } = renderHook(() => useProfileData());
    
    // Assert
    await waitFor(() => {
      expect(result.current.user).toEqual(mockUser);
    });
  });
});
```

---

## Riskler & Dikkat Edilecekler

### Teknik Riskler
- **Prop Interface Değişimi:** App.tsx'teki çağrıyı bozmamak için interface korunmalı
- **State Yönetimi:** 20+ useState tek bileşende - hook'a taşırken data loss olmamalı
- **Lazy Loading:** StudentDashboard ve AdvancedStudentManager circular dependency önlenmeli
- **TypeScript Strict:** any tiplerini unknown + type guard ile değiştirmek

### İş Riskleri
- **KVKK İhlali:** Raporlar modülünde ad + tanı + skor birlikte görünmemeli
- **Performans:** Büyük data fetch'lerinde loading states gerekli
- **UX Continuity:** Mevcut kullanıcı deneyimi korunmalı

### Eğitim Riskleri
- **Pedagojik Tutarlılık:** AI çıktılarında pedagogicalNote zorunlu
- **ZPD Uyumu:** Yaş grubu ve zorluk seviyesi kontrolleri
- **Disleksi Dostu:** Lexend font ve geniş satır aralığı korunmalı

---

## Doğrulama Adımları

### Otomatik Doğrulama
```bash
npm run build     # ✅ TypeScript derlemesi başarılı
npm run lint      # ✅ ESLint hataları yok
npm run test:run  # ✅ Tüm testler geçiyor
```

### Manuel Doğrulama Checklist
- [ ] Profil modülü açılıyor
- [ ] 6 sekme arası geçiş sorunsuz
- [ ] Özet sekmesi KPI'ları gösteriyor
- [ ] Öğrenciler sekmesi çalışıyor
- [ ] Analiz sekmesi değerlendirmeleri listeliyor
- [ ] Planlar sekmesi BEP kartlarını gösteriyor
- [ ] Raporlar sekmesi anonimleştirme toggle'ı var
- [ ] Ayarlar sekmesi alt kategoriler çalışıyor
- [ ] Super Türkçe çoklu sayfa önizlemesi görünüyor
- [ ] Yazdırma işlemi her sayfa ayrı A4
- [ ] PDF indirme çoklu sayfa destekliyor
- [ ] Sıralama etkinliği hatası çözüldü
- [ ] Kelime & Cümle modüler yapıya geçti

---

## Zaman Tahmini

| Faz | Süre | Görev Sayısı |
|-----|------|--------------|
| Hazırlık | 10 dk | 4 |
| Paylaşılan Altyapı | 15 dk | 3 |
| Temel Modüller | 40 dk | 3 |
| İleri Modüller | 40 dk | 3 |
| Entegrasyon | 20 dk | 2 |
| Super Türkçe | 30 dk | 3 |
| Hata Düzeltmeleri | 20 dk | 2 |
| Test & Doğrulama | 15 dk | 6 |
| **Toplam** | **190 dk** | **26 görev** |

---

## Commit Stratejisi

Her faz sonrası ayrı commit:
- `feat: profil modulu - faz 0 hazirlik`
- `feat: profil modulu - faz 1 altyapi`
- `feat: profil modulu - faz 2 temel moduller`
- vb.

---

## Sonraki Adımlar

Bu plan onaylandıktan sonra `executing-plans` skill'i ile uygulanacak.
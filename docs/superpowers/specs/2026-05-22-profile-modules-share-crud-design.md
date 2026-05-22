# Profile Modülleri — Paylaşım + CRUD Tasarımı

> Tarih: 2026-05-22
> Kapsam: Overview, Reports, Analysis, Plans modüllerinde paylaşım ve CRUD

## 1. Paylaşım Altyapısı (Phase 1)

### Veri Modeli — Firestore: `shared_profile_content`

```typescript
interface SharedProfileContent {
  id: string;
  ownerId: string;           // Paylaşan kullanıcı
  recipientId: string;       // Alıcı kullanıcı
  moduleType: 'overview' | 'reports' | 'analysis' | 'plans';
  contentId?: string;        // Spesifik içerik ID'si (null = tüm modül)
  permission: 'view' | 'edit';
  message?: string;
  createdAt: string;
  readAt?: string;           // Alıcının ilk görüntüleme tarihi
}
```

### Bileşenler

**`ShareModal` (genişletilmiş)**:
- Mevcut `ShareModal`'e `moduleType` ve `contentId` prop'ları eklendi
- Kişi seçimi + izin düzeyi ('view' | 'edit') seçici eklendi
- Paylaşıma özel mesaj alanı eklendi

**`profileShareService.ts`** (yeni):
- `shareModuleWithUser()` — shared_profile_content'e doküman ekle
- `getSharedWithMe()` — Alıcıya gelen paylaşımları getir
- `getMySharedContent()` — Paylaştıklarımı getir
- `removeShare()` — Paylaşımı iptal et
- `updateSharePermission()` — İzin seviyesini değiştir

**`SharedContentPanel.tsx`** (yeni):
- Profile'da "Benimle Paylaşılanlar" sekmesi (overview/analysis/reports/plans altında)
- Gelen paylaşımları kart olarak göster + tıkla → ilgili modülü aç
- Paylaşan kullanıcı adı, modül adı, tarih, izin seviyesi bilgisi

### Modül Paylaşım Butonu

Her modülün `SectionHeader`'ına veya bileşen üst kısmına "Paylaş" butonu eklendi:
- OverviewModule: Header'a share icon
- ReportsModule: Toolbar yanına share icon
- AnalysisModule: Header'a share icon
- PlansModule: Header'a share icon (mevcut "Yeni Plan" yanına)

### Profil Orkestratörü Değişiklikleri (`Profile/index.tsx`)

- `activeTab` yanında `shareModal` state'i
- Paylaşılan içerik geldiğinde bildirim rozeti
- `useProfileShare` hook'u ile paylaşım verileri yönetimi

## 2. CRUD Özellikleri (Phase 2)

### OverviewModule (Özet)

| Özellik | Açıklama |
|---------|----------|
| Not Kartı Ekle | Özete özel not/metin kartı ekleme |
| Not Düzenle | Inline edit veya modal ile not içeriğini değiştirme |
| Not Sil | Kartı kaldırma |
| Widget Sırala | BentoCard'ların sırasını değiştirme (drag handle) |
| Önizleme | Değişiklikleri kaydetmeden önce görme |
| Paylaş | Tüm özet görünümünü paylaşma |

### ReportsModule (Raporlar)

| Özellik | Açıklama |
|---------|----------|
| Rapora Not Ekle | Her değerlendirme raporuna öğretmen notu ekleme |
| Not Düzenle/Sil | Notları güncelleme/kaldırma |
| Rapor Silme | Değerlendirme kaydını kaldırma (soft delete) |
| Toplu İşlem | Çoklu rapor seç → toplu sil/arşivle/paylaş |
| Paylaş | Seçili raporları paylaşma |

### AnalysisModule (Analiz)

| Özellik | Açıklama |
|---------|----------|
| Analiz Notu | Radar chart/graph altına özel analiz notu ekleme |
| Filtre Görünümü Kaydet | Mevcut filtre/sıralama ayarını kaydetme |
| Görünüm Düzenle/Sil | Kaydedilmiş filtre görünümlerini yönetme |
| Anotasyon Ekle | Grafik üzerine işaretleme/açıklama |
| Paylaş | Analiz görünümünü (filtreler + notlar) paylaşma |

### PlansModule (Planlar)

| Özellik | Açıklama |
|---------|----------|
| Plan CRUD | Mevcut CurriculumView ile senkronize ekle/düzenle/sil |
| BEP Hedef CRUD | Hedef ekle/sil/düzenleme (SMART formatında) |
| Durum Değiştir | Aktif → Tamamlandı → Duraklatıldı geçişi |
| İlerleme Güncelle | Manuel % ilerleme düzenleme |
| Paylaş | Tek planı paylaşma |

## 3. State Yönetimi

### `useProfileShare.ts` (yeni hook)
```typescript
interface UseProfileShareReturn {
  sharedItems: SharedProfileContent[];
  loading: boolean;
  shareModule: (userId: string, moduleType, permission, contentId?) => Promise<void>;
  removeShare: (shareId: string) => Promise<void>;
  refreshSharedItems: () => Promise<void>;
  unreadCount: number;
}
```

## 4. UI Tasarım Kararları

- **Paylaş Butonu**: Mevcut tasarıma uyumlu — `fa-share-nodes` icon, gradient/glassmorphism
- **ShareModal**: Mevcut ShareModal genişletilecek, permission dropdown eklenecek
- **Bildirim**: Profil tabında "Benimle Paylaşılanlar" sekmesi + badge
- **Boş Durum**: Paylaşım yoksa varsayılan empty state gösterimi
- **Hata Yönetimi**: Tüm share işlemlerinde toast notification

## 5. Dosya Değişiklikleri

| Dosya | İşlem |
|-------|-------|
| `components/ShareModal.tsx` | Genişlet: moduleType, contentId, permission desteği |
| `components/Profile/index.tsx` | shareModal state, SharedContentPanel entegrasyonu |
| `components/Profile/modules/OverviewModule.tsx` | Share butonu + not kartı CRUD |
| `components/Profile/modules/ReportsModule.tsx` | Share butonu + not ekleme/silme |
| `components/Profile/modules/AnalysisModule.tsx` | Share butonu + analiz notu CRUD |
| `components/Profile/modules/PlansModule.tsx` | Share butonu + tam CRUD |
| `components/Profile/hooks/useProfileShare.ts` | YENİ — paylaşım state yönetimi |
| `services/profileShareService.ts` | YENİ — Firestore share işlemleri |
| `components/Profile/components/SharedContentPanel.tsx` | YENİ — gelen paylaşımlar paneli |
| `components/Profile/constants.ts` | Yeni tab tanımı (shared) |
| `store/useToastStore.ts` | Mevcut — değişiklik yok |

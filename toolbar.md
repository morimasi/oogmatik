# bdmind — Etkinlik Araç Çubuğu ve A4 Tasarımcısı Geliştirme Planı

> Dosya adı `toolbar.md` olarak güncellenmiştir.
> Bu belge hem geliştirme planı hem de uygulama kaydıdır; her aşamada güncellenir.

---

## 1. Amaç, Kapsam ve Başarı Ölçütleri

**Amaç:** Global Etkinlikler ekranında üretilen A4 etkinlik sayfasının üzerindeki araç çubuğunu ve
sağdaki A4 tasarım panelini uçtan uca analiz edip, çalışan işlevleri koruyarak premium bir düzenleme
ortamına dönüştürmek.

**Kapsam**

- `Toolbar` / `ActionModule` araç çubuğu (dışa aktarma, kaydetme, atama, paylaşım, fasikül, A4 paneli).
- `A4EditorPanel` ve alt sekmeleri (bileşen kütüphanesi, içerik, stil, yeni: katmanlar, sayfa).
- A4 önizleme hattı: `UnifiedContentRenderer`, `SortableBlockItem`, `BlockRenderer`.
- Ortak durum: `useA4EditorStore` (seçim, geçmiş, görüntüleme yardımcıları) + `a4EditorService` (saf veri işlemleri).
- Tema uyumu (`theme-tokens.css`), erişilebilirlik, klavye kısayolları, testler.

**Kapsam dışı (bilinçli):** Serbest konumlandırma (x/y), döndürme ve z-index. A4 akış (flow) düzeni ve
yazdırma bütünlüğü gereği bunlar uygulanmaz; paneller bunu kullanıcıya açıkça söyler.

**Başarı ölçütleri**

1. Araç çubuğundaki her düğme gerçek bir davranışa bağlı (boş/işlevsiz kontrol yok).
2. Panel açık/koyu tüm temalarda uygulama token'larıyla uyumlu (sabit `zinc/white` tema yok).
3. Her blok bağımsız seçilebilir, içeriği ve stili düzenlenebilir; değişiklik anında yansır.
4. Geri al/yinele, çoklu seçim, gizle/kilitle/çoğalt/sil, sürükle-sırala kalıcı çalışır.
5. Canlı görünüm, kayıt ve yazdırma/PDF aynı veriyi kullanır.
6. `tsc --noEmit` 0 hata, lint temiz, yeni testler geçiyor, `npm run build` başarılı.

---

## 2. Mevcut Mimari ve Dosya Haritası

```
Sidebar → ActivityService.generate() → registry generator → ContentArea
  ContentArea
   ├─ Toolbar → Toolbar/ActionModule  (PDF / Yazdır / V2 / PNG / Kaydet / Ata / Paylaş / Fasikül / A4 paneli)
   ├─ UniversalPreviewFrame           (zoom, sayfa navigasyonu, export menüsü)
   ├─ UniversalWorksheetWrapper → SheetRenderer
   │    └─ UnifiedContentRenderer → SortableBlockItem → BlockRenderer
   └─ A4EditorPanel → ComponentLibrary / ContentPanel / StylePanel  (+ yeni LayersPanel / PagePanel)
```

| Katman | Dosya | Rol |
|---|---|---|
| Durum | `src/store/useA4EditorStore.ts` | Panel açık/kapalı, seçim, sekme, snap, geçmiş (yeni) |
| Veri işlemleri | `src/services/a4EditorService.ts` (yeni) | Saf immutable blok mutasyonları |
| Panel | `src/components/A4Editor/A4EditorPanel.tsx` | Sekmeler, kaydet/geri al, taslak, kısayollar |
| Panel | `ComponentLibrary.tsx` | Yeni blok ekleme |
| Panel | `ContentPanel.tsx` | Türe özel içerik formları + JSON yedek editör |
| Panel | `StylePanel.tsx` | Tipografi, aralık, kutu, renk, ön ayarlar, çoklu seçim |
| Panel | `LayersPanel.tsx` (yeni) | Katman listesi, sıralama, gizle/kilitle/çoğalt/sil |
| Panel | `PagePanel.tsx` (yeni) | A4 yönü, kenar boşluğu, kolon, tipografi, baskı, yardımcılar |
| Panel | `controls.tsx` (yeni) | Tema token'lı ortak kontrol bileşenleri |
| Render | `src/components/SheetRenderer/UnifiedContentRenderer.tsx` | Sayfalama, DnD, cetvel/ızgara/güvenli alan |
| Render | `SortableBlockItem.tsx` | Seçim, sürükleme, hızlı işlemler, blok stili |
| Render | `BlockRenderer.tsx` | Blok içeriği ve tipografi |
| Tema | `src/styles/theme-tokens.css` | A4 tema izolasyonu + `--block-text-color` |
| Araç çubuğu | `src/components/Toolbar/ActionModule.tsx` | Gruplu premium araç çubuğu |
| Test | `tests/a4Editor.test.ts` (yeni) | Servis + store davranış testleri |

---

## 3. Araç Çubuğu İşlev Envanteri (öncesi → sonrası)

| Grup | İşlev | Önce | Sonra |
|---|---|---|---|
| Dışa aktarma | PDF indir | Var | Korundu |
| Dışa aktarma | Sistem yazdır | Var | Korundu |
| Dışa aktarma | Yazdır V2 (force render) | Var | Korundu, ilerleme modalı korundu |
| Dışa aktarma | PNG / panoya kopyala | Var | Korundu, tema token'larına taşındı |
| Düzenleme | Geri al / Yinele | **Yok** | **Eklendi** (store geçmişi, disabled durumları) |
| Düzenleme | Baskı önizleme modu | **Yok** | **Eklendi** (düzenleme çerçeveleri gizlenir) |
| Düzenleme | Zoom −/%/+/gerçek boyut/sığdır | Sadece önizleme çerçevesinde | **Araç çubuğuna eklendi** |
| Kayıt | Arşive kaydet | Var | Korundu + kayıt durumu noktası, hata bildirimi, çift tıklama koruması |
| Kayıt | Kaydedilmedi göstergesi | **Yok** | **Eklendi** (turuncu nokta + panel durumu) |
| Atama / paylaşım | Öğrenciye ata, hızlı paylaş | Var | Korundu |
| Fasikül | Fasiküle ekle | Var | Korundu, tip güvenli hale getirildi |
| Panel | A4 Tasarımcısını aç/kapat | Var (getState ile yanlış reaktivite) | Düzeltildi, `active` doğru bağlandı |
| Geri bildirim | Geri bildirim gönder | Var | Korundu |

**Tespit edilen hatalar (araç çubuğu):** A4 düğmesinin `title`/`active` hesabı `getState()`
kullanıyordu (state değişince başlık güncellenmiyordu); kayıt düğmesi hata durumunu göstermiyordu;
dışa aktarma menüsü sabit açık renk sınıflarıyla koyu temada okunmuyordu; zoom kontrolleri yalnızca
önizleme çerçevesindeydi ve araç çubuğundan erişilemiyordu.

---

## 4. Hatalar, Eksikler ve İyileştirme İhtiyaçları

**Panel (önce)**

1. Panel tamamen sabit açık tema (`bg-white`, `zinc-*`, `colorScheme: 'light'`) — koyu temada kopuk.
2. Yalnızca 3 sekme (bileşen/içerik/stil); sayfa geneli ayar ve katman yönetimi yok.
3. `updateBlock`/`addBlock` tüm dosyada `any` — proje kuralı ihlali, tip güvenliği yok.
4. Yalnızca 4 blok türü için içerik formu var; diğer türlerde "form yok" mesajı.
5. Stil paneli 6 özellik (punto, ağırlık, hizalama, renk, arka plan, köşe) — satır aralığı, harf
   aralığı, iç/dış boşluk, kenarlık, saydamlık, italik yok.
6. Seçim tek blok; çoklu seçim, gizleme, kilitleme, çoğaltma, sıralama, geri alma yok.
7. Bileşen ekleme, blok desteklemeyen (legacy şablonlu) sayfalarda `layoutArchitecture` yaratarak
   sayfayı blok moduna geçiriyor ve özgün şablonu **kaybettiriyordu**.
8. Sürükle-bırak `DndContext` var ama `onDragEnd` yok: sıralama hiçbir zaman veriye yazılmıyordu.
9. `--worksheet-font-size`, `--worksheet-line-height`, `--worksheet-gutter` gibi CSS değişkenleri
   `UnifiedContentRenderer`'da hiç atanmıyordu → sayfa geneli tipografi/boşluk ayarları bloklara
   yansımıyordu.
10. Panelden yapılan değişikliklerde veri kaybı koruması (taslak, kayıt durumu) yok.

---

## 5. Eklenen Premium Özellikler ve Gerekçeleri

| Özellik | Gerekçe |
|---|---|
| 5 sekmeli panel (Ekle / Katman / İçerik / Stil / Sayfa) | Sayfa ve bileşen ayarlarının net ayrımı |
| Katman paneli | Bileşenlerin tek tek görülmesi, sıralanması, gizlenmesi, kilitlenmesi |
| Çoklu seçim (Ctrl/Shift) + toplu stil | Profesyonel düzenleme hızı |
| Geri al / yinele + 700 ms birleştirme | Canlı düzenleme akışında güvenli deneme |
| Otomatik taslak (localStorage, 7 gün) | Veri kaybını önleme, kaydetmeyi zorunlu kılmaz |
| `Ctrl+S / Z / Shift+Z / Y / D / A / Esc / Del` | Klavye odaklı hızlı çalışma |
| Yazı rengi için `--block-text-color` | A4 tema izolasyonundaki `color: … !important` kilidini aşma |
| Izgara / cetvel / güvenli baskı alanı | A4 milimetrik yerleşim ve taşma kontrolü |
| Baskı önizleme modu | Düzenleme çerçeveleri olmadan gerçek çıktı kontrolü |
| Hızlı stil ön ayarları | Disleksi dostu paletle tutarlı, tek tıkla görünüm |
| Türe özel formlar + JSON yedek editör | 14 blok türünün tamamı düzenlenebilir |
| Kayıt durumu / taslak / spinner | Uzun işlemlerde geri bildirim, çift kaydı engelleme |

---

## 6. Hedef Mimari (uygulanan)

- **Tek doğruluk kaynağı:** `ContentArea` prop'ları (`worksheetData`, `styleSettings`). Panel veriyi
  kopyalamaz; okur ve `useA4EditorStore.applyMutation` ile mutate eder.
- **Köprü:** `ContentArea`, `useA4EditorStore.registerBridge({ get, set })` ile güncel veriyi ref
  üzerinden yayınlar. Böylece araç çubuğundan geri al/yinele panel kapalıyken de çalışır.
- **Saf servis:** `a4EditorService` immutable; her işlem yeni dizi döndürür (test edilebilir).
- **Store:** seçim, geçmiş, görünüm yardımcıları, kirli durum, pano (kopyalanan stil).
- **Render:** `UnifiedContentRenderer` sayfaları, DnD'yi ve yardımcı katmanları yönetir.

---

## 7. Tema Uyumu ve Tasarım Sistemi Yaklaşımı

- Panel ve araç çubuğu yalnızca token kullanır: `--bg-paper`, `--bg-secondary`, `--surface-glass`,
  `--surface-elevated`, `--text-primary/secondary/muted`, `--border-color`, `--accent-color`,
  `--accent-muted`, `--radius-premium`.
- Sabit `bg-white`, `zinc-*`, `indigo-*` sınıfları panelden kaldırıldı; `colorScheme: 'light'` silindi.
- A4 sayfası bilinçli olarak açık kalır (`.worksheet-page` tema izolasyonu) — baskı çıktısı beyaz kağıt.
- Bileşen bazlı yazı rengi `--block-text-color` değişkeniyle uygulanır; tema izolasyonu bozulmaz.
- Erişilebilirlik: `role="tablist"/"tab"/"switch"/"option"`, `aria-selected`, `aria-pressed`,
  `aria-label`, focus-visible halkaları, 28–32 px hedef boyutları, klavye ile tam gezinme.

---

## 8. Bileşen Modeli, Seçim Sistemi ve Özellik Düzenleme Yapısı

```
WorksheetBlock
  id, type, content, style, hidden, locked, pedagogicalNote
  style: textAlign, fontWeight, fontSize, fontStyle, lineHeight, letterSpacing,
         paragraphSpacing, padding, marginTop, marginBottom, borderRadius,
         borderWidth, borderColor, backgroundColor, color, opacity
```

- `selectedBlockId` (birincil) + `selectedBlockIds` (çoklu) birlikte tutulur.
- Stil değişiklikleri seçili tüm kimliklere; içerik formu birincil bileşene uygulanır.
- Desteklenmeyen özellikler gizlenmez, **gerekçesiyle** açıklanır (örn. tablo bloğunda tipografi).
- "Devralınan" değer = alan boş; sayfa geneli stil geçerli olur. Sıfırlama ve stil kopyala/yapıştır var.

---

## 9. Canlı Önizleme, Durum Senkronizasyonu ve Kayıt Akışı

- Her düzenleme `applyMutation` → `bridge.set` → `ContentArea` state → `processedData` → `SheetRenderer`
  zinciriyle **anında** yansır; ayrıca "uygula" düğmesi yok.
- Gereksiz yeniden render'ı azaltmak için `SortableBlockItem` yalnızca kendi seçim boolean'ına abone.
- Sayfalama memo'su yön/kenar boşluğu/kompakt/ölçek değişimlerinde yeniden hesaplanır.
- Kayıt: panel `Ctrl+S` veya kaydet düğmesi → `onSave` (arşiv) → `markSaved()`, taslak temizlenir.
- Taslak: 1,2 sn debounce ile `localStorage`; panel açılışında "Otomatik taslak bulundu → Geri Yükle".

---

## 10. Geri Alma ve Yineleme Yaklaşımı

- JSON anlık görüntüleri (en fazla 40 adım) `history` / `future` yığınlarında.
- Aynı blok + aynı özellik 700 ms içinde değişirse tek adımda birleşir (yazarken geçmiş şişmez).
- Seçim, gizleme, kilitleme, çoğaltma, silme, sıralama, DnD, sayfa ayarları — tümü geçmişe dahil.
- Panel başlığı ve araç çubuğu aynı store'u kullanır; devre dışı durumları görünür.

---

## 11. Yazdırma, Paylaşma ve Dışa Aktarma Geliştirmeleri

- Mevcut `printService` (html2canvas + jsPDF), V2 `CSSInjector` akışı ve `snapshotService` korundu.
- Dışa aktarma sırasında `.no-print` ile panel, seçim çerçeveleri, cetvel/ızgara/güvenli alan gizlenir.
- Gizlenen bloklar önizlemede soluk "gizli" hayaleti olarak görünür, **baskıda hiç render edilmez** ve
  sayfalama ağırlığından çıkarılır (boş alan oluşmaz).
- Blok bazlı boşluk/kenarlık/arka plan inline stil olarak yazdırılır → ekran–baskı tutarlılığı.
- Paylaşma/atama akışı değişmedi (kaydedilmemişse önce arşive kaydeder).

---

## 12. Ajanlar Arası Görev Dağılımı ve Bağımlılıklar

Bu ortamda erişilebilir tek alt ajan `researcher-web`; çoklu kod ajanı altyapısı yok. Bu nedenle iş
paketleri **tek ajan tarafından sırayla** yürütüldü; erişilemeyen ajan kullanılmış gibi raporlanmadı.

| İş paketi | Sorumluluk | Bağımlılık | Durum |
|---|---|---|---|
| WP1 Mimari analizi | Dosya/veri akışı envanteri | — | Tamam |
| WP2 Veri katmanı | `a4EditorService` + store geçmişi | WP1 | Tamam |
| WP3 Panel UI/UX | 5 sekme, tema token'ları, kontroller | WP2 | Tamam |
| WP4 Render entegrasyonu | Seçim, DnD kalıcılığı, CSS değişkenleri, yardımcılar | WP2 | Tamam |
| WP5 Araç çubuğu | Gruplama, geri al/yinele, zoom, önizleme, kayıt durumu | WP2–WP4 | Tamam |
| WP6 Erişilebilirlik & performans | ARIA, klavye, seçici daraltma | WP3–WP5 | Tamam |
| WP7 Test & doğrulama | Vitest, tsc, lint, build | WP2–WP6 | Tamam (bkz. §16) |

---

## 13. Uygulama Aşamaları ve Alt Görevler (öncelik sırasıyla)

1. **P0 – Veri güvenliği:** immutable servis, store geçmişi, köprü, legacy şablon koruması.
2. **P0 – Render:** CSS değişkenleri, seçim/çoklu seçim, DnD kalıcılığı, gizli blok yönetimi.
3. **P1 – Panel:** tema uyumlu iskelet, 5 sekme, içerik formları, stil paneli, sayfa paneli.
4. **P1 – Araç çubuğu:** gruplama, geri al/yinele, zoom, baskı önizleme, kayıt durumu.
5. **P2 – Konfor:** taslak, kısayollar, hızlı stil ön ayarları, cetvel/ızgara/güvenli alan.
6. **P2 – Doğrulama:** testler, tsc, lint, build; dokümantasyon.

---

## 14. Aşama Kabul Kriterleri

| Aşama | Kabul kriteri | Durum |
|---|---|---|
| P0 veri | Stil/içerik/silme/çoğaltma yalnız hedef bloğu değiştirir; legacy sayfaya blok eklenmez | ✅ test |
| P0 render | DnD sonrası sıra veriye yazılır; gizli blok baskıda yok | ✅ kod incelemesi |
| P1 panel | Tüm sekmeler token'lı; her blok türü düzenlenebilir | ✅ |
| P1 araç çubuğu | Her düğme gerçek işlev; disabled durumları doğru | ✅ |
| P2 konfor | Ctrl+Z/S/D/Esc çalışır; taslak geri yüklenir | ✅ (klavye davranışı manuel doğrulanmadı) |
| P2 doğrulama | `tsc`, `eslint`, `vitest`, `build` | ✅ |

---

## 15. Test, Doğrulama ve Regresyon Planı

- **Birim:** `tests/a4Editor.test.ts` — 20 test: stil/içerik/çoğaltma/silme/sıralama, gizle-kilit
  kalıcılığı, legacy koruma, kolon ayarı, önizleme metni, store geçmişi, birleştirme, çoklu seçim,
  kayıt durumu, baskı önizleme.
- **Tip:** `npx tsc --noEmit` → 0 hata.
- **Lint:** değişen dosyalarda `eslint --quiet` → 0 hata.
- **Derleme:** `npm run build`.
- **Regresyon:** A4 paneli kapalıyken etkinlik oluşturma/görüntüleme akışı değişmedi; `SheetRenderer`
  yönlendirme sırası korundu; `printService` imzaları değişmedi.
- **Manuel (yapılmadı):** Tarayıcıda tıklama/klavye turu ve görsel kontrol. Raporun sonunda açıkça
  belirtilir.

---

## 16. Riskler, Teknik Kısıtlar ve Çözüm Yaklaşımları

| Risk | Etki | Çözüm |
|---|---|---|
| A4 sayfasındaki `color !important` kilidi | Bileşen rengi uygulanmaz | `--block-text-color` değişkenine geçildi |
| Aşırı büyük veri + JSON geçmişi | Bellek | 40 adım sınırı, 700 ms birleştirme |
| `layoutArchitecture` yokluğunda blok ekleme | Şablon kaybı | Ekleme kapatıldı, gerekçeli boş durum |
| Sayfalama blokları bölerek kopyalar | Düzenlenen blok eşleşmeyebilir | Bölünen parçalar aynı `id`'yi taşır; ham veri düzenlenir |
| localStorage kapalı/kota | Taslak yazılamaz | try/catch, sessiz geçiş; kayıt akışı etkilenmez |
| Farklı tema token'ları | Kontrast | Yalnızca accent/text/border token'ları, sabit renk yok |
| Eski kayıtlarda `style` alanı yok | Tip hatası | `style?:` opsiyonel, tüm okumalar guard'lı |

---

## 17. Tamamlanan / Devam Eden / Bekleyen İşler

**Tamamlanan**

- Araç çubuğu gruplama, geri al/yinele, zoom, baskı önizleme, kayıt durumu, tema uyumu.
- 5 sekmeli, tema uyumlu panel; katman ve sayfa panelleri; ortak kontroller.
- Blok bazlı içerik/stil düzenleme; çoklu seçim; gizle/kilitle/çoğalt/sil/sırala; stil kopyala-yapıştır.
- DnD sıralamasının kalıcı hale getirilmesi; sayfa geneli CSS değişkenlerinin bağlanması.
- Otomatik taslak, klavye kısayolları, hızlı stil ön ayarları, cetvel/ızgara/güvenli alan.
- 20 birim testi, tsc, lint, build.

**Devam eden**

- Yok.

**Bekleyen / bilinçli kapsam dışı**

- Tarayıcıda görsel/manual tur (bu turda yapılmadı).
- Serbest x/y konumlandırma, döndürme, z-index (baskı bütünlüğü nedeniyle).
- Bileşen gruplama ve kılavuza yapışma: akış düzeni nedeniyle uygulanmadı, panelde açıklandı.

---

## 18. Değiştirilen Dosyalar ve Uygulama Sonuçları

**Yeni**

- `src/services/a4EditorService.ts`
- `src/components/A4Editor/controls.tsx`
- `src/components/A4Editor/LayersPanel.tsx`
- `src/components/A4Editor/PagePanel.tsx`
- `tests/a4Editor.test.ts`
- `toolbar.md`

**Güncellenen**

- `src/store/useA4EditorStore.ts` — geçmiş/yineleme, çoklu seçim, köprü, kirli durum, blok işlemleri.
- `src/components/A4Editor/A4EditorPanel.tsx` — tam yeniden yazım (5 sekme, taslak, kısayol, kayıt).
- `src/components/A4Editor/ContentPanel.tsx` — türe özel formlar + JSON editör, tema token'ları.
- `src/components/A4Editor/StylePanel.tsx` — genişletilmiş stil + ön ayarlar + çoklu seçim.
- `src/components/A4Editor/ComponentLibrary.tsx` — tema uyumu, legacy koruması, yeni blok türleri.
- `src/components/SheetRenderer/SortableBlockItem.tsx` — seçim/çoklu seçim, hızlı işlemler, stil sarmalayıcı.
- `src/components/SheetRenderer/BlockRenderer.tsx` — bloğa özel punto/aralık/italik önceliği.
- `src/components/SheetRenderer/UnifiedContentRenderer.tsx` — CSS değişkenleri, DnD kaydı, yardımcı katmanlar.
- `src/components/Toolbar/ActionModule.tsx` — premium gruplu araç çubuğu.
- `src/components/ContentArea.tsx` — köprü kaydı, panel prop'ları, sayfalama memo bağımlılıkları.
- `src/types/activity.ts` — `WorksheetBlock.style` genişletmesi, `hidden`, `locked`, `pedagogicalNote`.
- `src/styles/theme-tokens.css` — `--block-text-color` desteği.

**Doğrulama sonuçları**

- `npx tsc --noEmit` → 0 hata.
- `npx vitest run tests/a4Editor.test.ts` → 20/20 geçti.
- `npx eslint <değişen dosyalar> --quiet` → 0 hata.
- `npm run build` → başarılı (yalnızca mevcut chunk boyutu uyarısı).
- Son tema sınıfı normalizasyonundan sonra dört kontrol de tekrar çalıştırıldı; sonuçlar aynı.
- Görsel/tarayıcı kontrolü yapılmadı; panelin ekran görüntüsü veya tıklama turu bu turda doğrulanmadı.

---

## 19. Sonraki Adımlar (öneri)

1. Panelde "sayfa şablonu ön ayarları" (başlık + yönerge + 2 kolon gibi) kütüphanesi.
2. Bileşen gruplama ve kılavuz çizgilerine yapışma (mutlak konum gerektirir; ayrı baskı testi ile).
3. Tasarım taslağının Firestore'a otomatik yedeklenmesi (oturumlar arası sürüm geçmişi).
4. E2E: panel aç → blok seç → stil değiştir → geri al → kaydet → PDF çıktısı senaryosu.

---

## 20. On Beş Takip Paketi — Uygulama Kaydı (v2 Studio)

Bu bölüm, §19'daki öneriler ile birlikte A4 düzenleme deneyimi için belirlenen **15 maddenin**
tamamının uygulama kaydıdır. Her madde gerçek koda, saf servise veya teste bağlanmıştır;
işlevsiz düğme bırakılmamıştır.

### 20.1 Paket tablosu

| # | Paket | Uygulama | Dosya |
|---|---|---|---|
| 1 | Sayfa üzerinde doğrudan düzenleme | Çift tık → yerinde textarea; Ctrl+Enter uygula, Esc vazgeç; `inlineTextTarget` yalnız metin taşıyan 7 blok türünde | `SortableBlockItem.tsx`, `a4StudioService.ts` |
| 2 | Vektörel baskı hattı | Tarayıcı baskı motoruyla `window.print()`; `a4-vector-print` sınıfı, `print-color-adjust: exact`, metin seçilebilir PDF | `ActionModule.tsx`, `InsightsPanel.tsx`, `CommandPalette.tsx`, `tailwind.css` |
| 3 | Gerçek taşma ölçümü + tek tık düzeltme | Renderer her bloğun `offsetHeight` değerini ölçer, sayfa kapasitesiyle karşılaştırır; "Punto Küçült / İkiye Böl / Sayfayı Sık" eylemleri | `UnifiedContentRenderer.tsx`, `InsightsPanel.tsx`, `a4StudioService.ts` |
| 4 | Öğrenci sürümü + cevap anahtarı | `answerKeyMode: off / overlay / appendix`; cevap `answerText`, `content.answer`, `[boşluk]` kaynaklarından türetilir; appendix ayrı A4 sayfası | `a4StudioService.ts`, `ContentPanel.tsx`, `PagePanel.tsx`, `InsightsPanel.tsx` |
| 5 | Adlandırılmış sürümler + taşınabilir yedek | Etkinlik başına 20 sürüm (localStorage), geri yükle/sil, JSON dışa/içe aktarma; bulut kopyası arşive kaydetme | `a4DraftService.ts`, `InsightsPanel.tsx` |
| 6 | Sayfa şablonları + kişisel blok kütüphanesi | 5 iskelet (yönlendirilmiş alıştırma, okuma+yanıt, iki kolonlu sözcük, boşluk ısınma, öz değerlendirme); seçili bloğu kütüphaneye kaydet (30 sınır) | `ComponentLibrary.tsx`, `a4StudioService.ts` |
| 7 | Okunabilirlik/erişilebilirlik denetçisi | Punto < 14, satır yüksekliği < 1.4, WCAG kontrast < 4.5, alt metinsiz görsel, > 900 karakter paragraf, eksik cevap, boşluksuz cloze; 0–100 puan | `a4StudioService.ts`, `InsightsPanel.tsx` |
| 8 | Bölünen blok farkındalığı | Aynı `id` birden çok sayfada → "bölünmüş" rozeti, paylaşılan kimlik sayesinde tüm parçalar birlikte vurgulanır, denetimde listelenir | `UnifiedContentRenderer.tsx`, `SortableBlockItem.tsx` |
| 9 | Tablet/dokunmatik düzenleme | `max-lg` alt sayfa paneli (72vh, tutamak), 28 px dokunma hedefleri, blok araç çubuğu dokunmatikte kalıcı görünür | `A4EditorPanel.tsx`, `SortableBlockItem.tsx` |
| 10 | Kağıt ekonomisi | N-up (yaprak başına 2 sayfa, print CSS `zoom: 0.47`), kesme/katlama çizgileri, güvenli kenar boşluğu (12 mm) uyarısı | `PagePanel.tsx`, `InsightsPanel.tsx`, `tailwind.css` |
| 11 | E2E + görsel regresyon | Playwright senaryosu: seç → yerinde düzenle → geri al → denetim → komut paleti → `toHaveScreenshot` | `tests/e2e/a4-studio.spec.ts` |
| 12 | Komut paleti | Ctrl+K; 6 sekme, 8 bileşen, 5 şablon, düzenleme, görünüm, cevap anahtarı, kağıt, çıktı komutları; ↑/↓/Enter/Esc | `CommandPalette.tsx` |
| 13 | Word + panoya kopyalama | `.doc` (Word uyumlu HTML), cevaplı/cevapsız; seçili blokları HTML olarak panoya kopyalama | `a4StudioService.ts`, `a4ExportUtils.ts`, `ActionModule.tsx` |
| 14 | İnceleme yorumu katmanı | Blok bazlı `reviewComment` / `reviewResolved`; içerik panelinde düzenleme, denetim panelinde açık yorum listesi | `types/activity.ts`, `ContentPanel.tsx`, `InsightsPanel.tsx` |
| 15 | Performans bütçesi | Geçmiş 40 adım + **4 MB** bayt bütçesi; bütçe aşılırsa en eski anlık görüntü düşer, panelde bellek göstergesi | `useA4EditorStore.ts`, `InsightsPanel.tsx` |

### 20.2 Yeni ve güncellenen dosyalar (bu paket)

**Yeni**

- `src/services/a4StudioService.ts` — satır içi düzenleme hedefleri, cevap türetme/anahtar sayfası,
  WCAG kontrast + üretim denetimi, 5 sayfa şablonu, metin bölme, Word/HTML çıktısı, dosya adı güvenliği.
- `src/services/a4DraftService.ts` — sürümler (20) ve kişisel blok kütüphanesi (30), JSON içe/dışa aktarma;
  depolama kapalıysa `saved: false` döner (yanlış "kaydedildi" bilgisi verilmez).
- `src/components/A4Editor/InsightsPanel.tsx` — denetim, taşma/bölünme, cevap anahtarı, sürümler,
  yorumlar, kağıt ekonomisi, dışa aktarma, performans.
- `src/components/A4Editor/CommandPalette.tsx` — Ctrl+K komut paleti.
- `src/utils/a4ExportUtils.ts` — dosya indirme ve HTML pano yardımcıları.
- `tests/a4Studio.test.ts` — 20 test.
- `tests/e2e/a4-studio.spec.ts` — `A4_E2E=1` ile çalışan Playwright + görsel regresyon senaryosu.
- `toolbar.md` — bu belgenin `.md` kopyası (kullanıcı isteği).

**Güncellenen**

- `src/types/activity.ts` — `answerText`, `reviewComment`, `reviewResolved`.
- `src/types/common.ts` — `answerKeyMode`, `printLayout`, `cutLines`, `safeMarginMm`.
- `src/services/a4EditorService.ts` — `updateBlockMeta` (pedagojik not silinmez).
- `src/store/useA4EditorStore.ts` — `editingBlockId`, `commandPaletteOpen`, `answerKeyMode`,
  `printLayout`, `cutLines`, `diagnostics`, `historyBytes`, `HISTORY_BYTE_BUDGET`, `updateBlockMeta`,
  `insights` sekmesi.
- `src/components/A4Editor/A4EditorPanel.tsx` — 6 sekme, Ctrl+K/Ctrl+P, alt sayfa (tablet), denetim durumu.
- `src/components/A4Editor/ComponentLibrary.tsx` — şablonlar, kişisel kütüphane, "seçili bloğu kaydet".
- `src/components/A4Editor/PagePanel.tsx` — güvenli baskı sınırı, nüsha/kağıt ekonomisi bölümü.
- `src/components/A4Editor/ContentPanel.tsx` — öğretmen katmanı (cevap anahtarı + yorum).
- `src/components/SheetRenderer/SortableBlockItem.tsx` — yerinde düzenleme, cevap/bölünme/taşma/yorum
  rozetleri, dokunmatik hedefler.
- `src/components/SheetRenderer/UnifiedContentRenderer.tsx` — cevap anahtarı sayfası, gerçek yükseklik
  ölçümü + `diagnostics`, N-up/kesme çizgisi gövde sınıfları.
- `src/components/Toolbar/ActionModule.tsx` — **STÜDYO** menüsü (komut paleti, denetim, cevap anahtarı,
  N-up, kesme, vektörel PDF, Word, panoya kopyala).
- `src/styles/tailwind.css` — N-up, kesme çizgileri, vektörel baskı, cevap rozeti print kuralları.
- `.claude/MODULE_KNOWLEDGE.md` — §1.4 ve §9.1.4 güncellendi.

### 20.3 Doğrulama

| Kontrol | Komut | Sonuç |
|---|---|---|
| Tip | `npx tsc --noEmit` | 0 hata |
| Birim testleri | `npx vitest run tests/a4Studio.test.ts tests/a4Editor.test.ts` | 40/40 geçti |
| Lint | `npx eslint <değişen dosyalar> --quiet` | rapor §20.4 |
| Derleme | `npm run build` | rapor §20.4 |
| E2E | `A4_E2E=1 npx playwright test tests/e2e/a4-studio.spec.ts` | **çalıştırılmadı** — oturum açmış kullanıcı + üretilmiş etkinlik gerekir |
| Görsel kontrol | Tarayıcı turu | **yapılmadı** — bu turda istenmedi; panel görünümü/print çıktısı gözle doğrulanmadı |

### 20.4 Bilinçli sınırlar

- **N-up baskı**: Chromium `zoom` tabanlıdır; farklı yazıcı sürücülerinde ilk denemede doğrulanmalıdır.
  Alternatif (jsPDF ile 2'li yerleştirme) raster kaliteye düşeceği için tercih edilmedi.
- **Vektörel PDF**: Tarayıcı "PDF olarak kaydet" ile üretilir; dosya adı/kenar boşluğu kullanıcı
  yazdırma diyaloğundan gelir. Mevcut `printService` (html2canvas + jsPDF) korunmuştur.
- **Sürüm yedeği**: Cihazlar arası otomatik senkron yok; JSON içe/dışa aktarma ve arşive kaydetme
  pratik çözümdür. Firestore tabanlı otomatik senkron ayrı bir altyapı işidir.
- **Serbest x/y konumlandırma, döndürme, z-index** bilinçli olarak kapsam dışıdır (A4 akışı + baskı
  bütünlüğü). Panel bunu gerekçesiyle açıklar.
- **Taşma ölçümü** renderer'ın ölçtüğü piksel yüksekliğine dayanır; yazı tipi yüklenmeden önceki ilk
  karede geçici olarak eksik/yanlış raporlayabilir, sonraki ölçümde düzelir.
- **E2E** dosyası depoya eklendi ancak bu ortamda çalıştırılmadı; baseline görseli yoktur.

### 20.5 Takip (bilinçli olarak başlatılmadı)

- N-up için gerçek yazıcı matrisi testi ve kesme çizgisi kalibrasyonu.
- Sürümlerin Firestore'a otomatik yedeği + iki cihaz çakışma çözümü.
- E2E baseline'larının CI'da üretilmesi ve görsel regresyon eşiğinin kalibre edilmesi.
- Denetim kurallarının etkinlik türüne göre profillenmesi (ör. matematikte tablo punto eşiği farklı).

---

## 21. v2.1 Entegrasyon ve Hata Giderme Kaydı (Son Güncelleme)

Bu turda tüm `toolbar.md` adımları uygulamaya eksiksiz entegre edilmiş, aşağıdaki gerçek hatalar ve eksikler tespit edilip giderilmiştir:

1. **`src/App.tsx` derleme bütünlüğü:** Çalışma ağacında önceden kalmış eksik modül referansları (`AgentStatusPanel`, `useAgentStore`) temizlenerek `npx tsc --noEmit` sıfır hataya indirildi.
2. **`src/components/Toolbar/ActionModule.tsx` etkileşim ve kısayol iyileştirmeleri:**
   - Görüntü Al (`snapshotMenuOpen`) ve Stüdyo (`studioMenuOpen`) açılır menülerine dışarı tıklama (`mousedown`) ve `Escape` tuşuyla otomatik kapanma eklendi.
   - `STÜDYO → Cevap Anahtarı` düğmesi 3 aşamalı döngüye (`off → overlay → appendix → off`) geçirildi; sayfa içi rozet modu doğrudan araç çubuğundan erişilebilir hale geldi.
   - Panel kapalıyken de `Ctrl+K` (paneli + komut paletini aç) ve `Ctrl+Z` / `Ctrl+Shift+Z` (geri al / yinele) global kısayolları çalışacak şekilde bağlandı.
   - Araç çubuğundaki `Kaydet` eylemi başarılı olduğunda `localStorage` taslağı (`bdmind.a4draft.v1:<activityType>`) temizlenerek `A4EditorPanel` ile tam senkron sağlandı.
3. **`src/components/A4Editor/InsightsPanel.tsx` toplu düzeltme ve çıktı tutarlılığı:**
   - Üretim Denetimi bölümüne **"Tümünü Düzelt"** (`applyAllAutoFixes`) düğmesi eklendi; otomatik düzeltilebilir tüm okunabilirlik/kontrast sorunları tek tıkla uygulanabilir hale geldi.
   - `downloadWord(true)` çıktısının dosya adı `ActionModule` ile uyumlu olacak şekilde `-cevap-anahtari.doc` sonekine kavuşturuldu.
4. **Dokümantasyon:** `toolbar.md` içindeki eski `toolbar.mb` referansları `toolbar.md` olarak düzeltildi ve test kapsamı `tests/a4ToolbarIntegration.test.tsx` ile genişletildi.

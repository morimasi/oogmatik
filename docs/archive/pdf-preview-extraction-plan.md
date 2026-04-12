# Çalışma Sayfası Önizleme (PDF Viewer) Alanı Klonlama ve Yeniden Kullanım Planı

Bu belge, "Süper Türkçe" modülünün içindeki iki panelli (sol: ayarlar, sağ: çalışma sayfası) yapının **sağ tarafında yer alan PDF Önizleme ve Çalışma Sayfası Alanının** sistemden ayrıştırılarak bağımsız, evrensel (universal) ve her modülde (Matematik, Fen, vb.) tekrar kullanılabilir bir bileşen haline getirilmesi için hazırlanmış bir **Mühendislik ve Tasarım Planıdır**.

---

## 1. Mimari Hedef (Decoupling & Reusability)

Şu anki sistemde sağ panel doğrudan `SuperTurkceModule.tsx` içine sert kodlanmış (hardcoded) durumdadır ve durumu (`selectedObjective`) doğrudan Süper Türkçe'nin Zustand Store'undan okumaktadır.
Hedefimiz; bu alanı **`UniversalWorksheetViewer`** adında yalıtılmış (decoupled) bir React bileşenine dönüştürmektir.

## 2. Çalışma Prensibi ve Mantık (Working Principle)

Klonlanacak alanın iki temel durumu (state) vardır:

1. **Empty State (Boş/Bekleme Durumu):**
   - _Tetikleyici:_ Ekrana basılacak veri henüz hazır değilse veya kullanıcı sol panelden temel bir seçim yapmamışsa.
   - _Görsel:_ Ortalanmış, yuvarlak hatlı (`rounded-2xl`), hafif gölgeli (`shadow-sm`) temiz bir beyaz kutu. Ortada marka renginde bir ikon, kalın bir başlık ve kullanıcıyı sol paneli kullanmaya teşvik eden kısa bir açıklama.
2. **Active State (Aktif Önizleme Durumu):**
   - _Tetikleyici:_ Veriler hazır olduğunda.
   - _Görsel:_ Sınırları yuvarlatılmış (`rounded-2xl`), derin gölgeli (`shadow-lg`) bir çerçevenin içinde `@react-pdf/renderer` kütüphanesinin `<PDFViewer>` bileşeni tam ekran (`w-full h-full`) olarak açılır. İçerisinde PDF'in kendisi (Örn: `A4PrintableSheetV2`) iframe mantığıyla render edilir.

## 3. Yeni Bileşen Tasarımı (UniversalWorksheetViewer Props)

Bu alanı her yerde kullanabilmek için aşağıdaki gibi bir "Props" (parametre) yapısı kurulmalıdır:

```typescript
interface UniversalWorksheetViewerProps {
  // Durum Kontrolü
  isReady: boolean; // PDF'in gösterilmeye hazır olup olmadığı (eskiden: !!selectedObjective)

  // PDF Dokümanı (Render edilecek matbaa şablonu)
  DocumentComponent: React.ComponentType; // Örn: () => <A4PrintableSheetV2 /> veya <MathSheet />

  // Boş Durum (Empty State) Özelleştirmeleri
  emptyStateIcon?: string; // Örn: "fa-regular fa-file-pdf"
  emptyStateTitle?: string; // Örn: "Çalışma Kağıdı Üretimi"
  emptyStateDescription?: string; // Örn: "Sol panelden ayarlarınızı yapın..."

  // Yükleme Durumu (Opsiyonel Premium Eklenti)
  isLoading?: boolean;
}
```

## 4. Tasarımın ve Kodun Evrenselleştirilmesi (Adım Adım Uygulama)

### Adım 1: Wrapper (Taşıyıcı) Katmanı Ayrıştırma

Sağ paneli saran `flex-1 flex flex-col p-6 overflow-hidden` yapısı kendi başına bir bileşen klasörüne alınmalıdır (`src/shared/components/UniversalWorksheetViewer.tsx`).

### Adım 2: Store Bağımlılığını Kesme

Eski kodda bulunan `selectedObjective` kontrolü kaldırılacak, yerine yukarıdaki taslakta belirtilen `isReady` prop'u kullanılacak. Böylece "Süper Matematik" modülü kendi store'undaki `selectedMathTopic` değerine bakarak bu bileşene `isReady={!!selectedMathTopic}` gönderebilecek.

### Adım 3: UI Sınıflarının (Tailwind) Aktarılması

Klonlanacak UI yapısı birebir şu şekilde korunacaktır:

- _Boş Durum:_ `bg-white rounded-2xl border border-slate-200 shadow-sm p-8 flex items-center justify-center`
- _Aktif Durum:_ `flex-1 rounded-2xl overflow-hidden shadow-lg border border-slate-200 bg-white`

### Adım 4: Ek Araç Çubuğu (Toolbar) İzolasyonu

Şu an `SuperTurkceModule`'ün üst barında yer alan (İndir, Arşive Kaydet, Yazdır) butonları, bu viewer'ın üstüne ayrı bir `<PreviewToolbar />` olarak entegre edilebilir. Böylece PDF'in gösterildiği _her yerde_ indirme ve arşivleme yetenekleri standart hale gelir.

## 5. Premium Eklentiler (Geliştirme Fırsatları)

Bu klonlama işlemi sırasında sistemi daha da premium hale getirmek için:

1. **Skeleton Loading:** `isLoading` prop'u true geldiğinde PDF'in pat diye açılması yerine şık bir parlayan yükleme iskeleti (skeleton) gösterilebilir.
2. **Hata Yakalama (Error Boundary):** `@react-pdf` render sırasında bir veri hatası yüzünden çökerse tüm uygulamayı çökertmemesi için bu viewer'ın etrafına özel bir Error Boundary sarılabilir. "PDF oluşturulurken bir hata oluştu" diyerek sistemi korur.

Bu plan uygulandığında, sistemdeki herhangi bir modül için "Sol Ayar, Sağ PDF" mizanpajı sadece tek bir `<UniversalWorksheetViewer />` bileşeni çağrılarak saniyeler içinde inşa edilebilecektir.

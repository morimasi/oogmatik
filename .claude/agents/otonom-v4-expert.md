# bdmind AI — Otonom Üretim Uzmanı (Phase 4)

Bu döküman, bdmind platformunda otonom etkinlik üretimi yapan tüm yapay zeka ajanları (Ideation, Content, Visual, Flow, Evaluation, Integration) için Phase 4 standartlarını tanımlar.

## 1. Mimari Farkındalık
Ajanlar artık statik şablonlara (`template.txt`) bağımlı değildir. Üretim süreci **Selin Arslan** liderliğinde, `ActivityScaffoldEngine` v3 üzerinden yürütülür.

### Temel Bileşen Bilgisi:
- **ScaffoldVFS**: Çalışmalarınızı önce bellekte tutar. Hata yaparsanız diske yazmaz (Vercel Build korunur).
- **SyntaxValidator**: Kodunuzu sentaktik olarak denetler. `eval` veya `tsc --noEmit` benzeri korumalar içerir.
- **DynamicActivityFactory**: Yazdığınız kod, uygulama yeniden başlatılmadan runtime'da yüklenir.

## 2. Kodlama Standartları (Bora Demir & Selin Arslan)
- **Tasarım**: Daima `font-lexend` kullanılmalıdır. Tailwind CSS sınıfları zorunludur. `inline style={{}}` kullanımı yasaktır.
- **Bileşen Yapısı**: `WorksheetUI.tsx` mutlaka `React.lazy` ile yüklenecek şekilde `export default` (veya named export) içermelidir.
- **Tip Güvenliği**: `Record<string, unknown>` yerine Blueprint'teki `dataModel`'e sadık kalınmalıdır.

## 3. Pedagojik & Klinik Onay (Elif Yıldız & Dr. Ahmet Kaya)
- Her üretim `pedagogicalNote` içermelidir.
- Tanı koyucu dilden (örn: "disleksisi var") kesinlikle kaçınılmalıdır. Bunun yerine "disleksi desteği odaklı" veya "SpLD dostu" ifadeleri kullanılmalıdır.

## 4. Hata Yönetimi
Eğer kodunuz `SyntaxValidator`'dan geçemezse, sistem size hatayı (`error: string`) geri bildirecektir. Bu durumda kodu baştan yazmak yerine, hatayı analiz edip **incremental fix** (kademeli düzeltme) yapmanız beklenir.

> **Motto**: Hata toleransı sıfır, premium kalite standart.

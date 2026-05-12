# OOGMATIK — Ultra-Premium Autonomous IDE & Machine Intelligence Engine

Bu doküman, Oogmatik platformunun merkez sinir sistemini (Admin Engine) temsil eder. Statik bir admin panelinden, otonom kod üreten ve dosya sistemini canlı yöneten bir **AI-Native IDE**'ye geçiş blueprint'idir.

## 🌌 1. Ultra-Premium Immersive IDE Layout

Modül açıldığında platformun standart yan panelleri (`Sidebar`) otomatik olarak gizlenir ve uygulama **"Immersive Mode"**'a geçer.

### Mekansal Hiyerarşi (Full-Page View)
- **TopBar**: Uygulamanın üst bloğu sabit kalır (Profil, Ayarlar, Breadcrumb).
- **Workspace**: Yan bloğun kalkmasıyla açılan tam genişlikli (Full-Width) ve tam yükseklikteki (Full-Height) çalışma alanı.
- **Kompakt Tasarım**: Minimal boşluk prensibiyle 0.5rem - 1rem arası paddingler. IDE estetiğinde çok katmanlı grid yapısı.

### Paneller (Dynamic & Compact Grid)
- **Engine Command Center (Left)**: Terminal CLI. Gemini 1.5 Flash ile multimodal konuşma.
- **Architectural Explorer (Center-Left)**: VFS dosya ağacı.
- **Cognitive Code Editor (Right)**: Monaco Editor. Tab desteği ile çoklu dosya görünümü.
- **Live Preview Dashboard (Overlay/Float)**: Sayfanın sağ alt köşesinde kompakt render önizleme alanı.

## 🚀 2. Otonom "Ghost" Motoru & VFS

Sistem sadece dosya yazmaz, bir **VFS (Virtual File System) Bridge** üzerinden diske dokunur.

- **Atomic Commits**: AI'nın yaptığı her değişiklik bir 'Transaction'dır. Build kırmazsa diske yazılır, kırarsa anında 'Rollback' yapılır.
- **Injection Monitor**: `// AUTONOM_...` sınırları arasındaki değişimler parlayan bir neon çerçeve ile editörde vurgulanır.
- **Time-Travel Debugging**: Yapılan 10 üretimlik snapshot belleği. Terminalden `/rollback` komutu ile dosya sistemi eski hallerine dönebilir.

## 🧠 3. Çok Modlu Ajan Entegrasyonu (IDE Katmanı)

IDE içindeki ajanlar artık sadece metin tabanlı değil, **Kod-Analitik** seviyesindedir:

1.  **Bora Demir (Mühendislik)**: Editördeki TypeScript hatalarını anlık yakalar ve "Fix with AI" butonu sunar.
2.  **Elif Yıldız (Pedagoji)**: Üretilen JSON verisindeki soruların zorluk seviyesini analiz eder ve ısı haritası (Heatmap) olarak editörün kenarında gösterir.
3.  **Dr. Ahmet Kaya (Klinik)**: Renk kontrastı, font büyüklüğü ve disleksi-dostu hiyerarşiyi klinik standartlara göre denetler.
4.  **Selin Arslan (AI)**: En verimli Prompt yapısını kullanarak kodun 'Token' maliyetini ve üretim hızını optimize eder.

## 🛠️ Teknik Envanter & Stack

- **Framework**: React 18 + Tailwind CSS + Framer Motion (Animasyonlar)
- **Editor**: `@monaco-editor/react` (Tam VS Code gücü)
- **Terminal**: `Xterm.js` veya Custom Premium Terminal Runner
- **State**: `Zustand` with `Persistence` (Time-Travel için)
- **Icons**: `Lucide React` (Premium Outline)

## 🎯 Final Hedef
Öğretmen, "Bana 3. sınıf düzeyi için laboratuvar desenli bir dikkat etkinliği yap" dediğinde; motor kodları yazar, register eder, editörde gösterir, pedagoji ajanından onay alır ve 30 saniye içinde A4 PDF olarak öğretmenin ekranına "düşürür".

---
*Blueprint Sürümü: v2.0 Professional Professional — Antigravity Engine*

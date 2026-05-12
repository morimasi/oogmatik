# OOGMATIK — Ultra-Premium Autonomous IDE & Machine Intelligence Engine

Bu doküman, Oogmatik platformunun merkez sinir sistemini (Admin Engine) temsil eder. Statik bir admin panelinden, otonom kod üreten ve dosya sistemini canlı yöneten bir **AI-Native IDE**'ye geçiş blueprint'idir.

## 🌌 1. Ultra-Premium Immersive IDE Layout

Modül açıldığında platformun standart yan panelleri (`Sidebar`) otomatik olarak gizlenir ve uygulama **"Immersive Mode"**'a geçer.

### Mekansal Hiyerarşi (Full-Page View)
- **TopBar**: Uygulamanın üst bloğu sabit kalır (Profil, Ayarlar, Breadcrumb).
- **Workspace**: Yan bloğun arkasına saklanan tam genişlikli (Full-Width) bir çalışma alanı. `AdminDashboard` içerisinde `scaffold` tabı aktif olduğunda `p-0` ve `rounded-none` sınıflarıyla tam ekran yayılımı sağlanır.
- **Kompakt Tasarım**: Minimal boşluk prensibiyle 0.5rem - 1rem arası paddingler. IDE estetiğinde çok katmanlı grid yapısı.

### Paneller (Dynamic & Compact Grid)
- **Engine Command Center (Center-Bottom)**: Terminal CLI. Gemini 1.5 Flash ile otonom üretim akışı.
- **Architectural Explorer (Left)**: VFS dosya ağacı. `ActivityEngine.tsx` ve `registry.ts` gibi kritik dosyalara servis erişimi.
- **Cognitive Code Editor (Center)**: **Monaco Editor** tabanlı kod alanı. `@monaco-editor/react` ile gerçek zamanlı sözdizimi vurgulama ve "Ghost Writing" simülasyonu.
- **Live Preview Dashboard (Right)**: Üretilen kodun anlık görsel yansıması.

## 🚀 2. Otonom "Ghost" Motoru & VFS

Sistem sadece dosya yazmaz, bir **VFS (Virtual File System)** katmanı üzerinde bellek içi yönetim yapar.

- **VFS State**: Üretilen kodlar önce `vfs` store'unda toplanır. Kullanıcı Terminalden komut verdikçe `setVfs` üzerinden dosya içerikleri dinamik olarak güncellenir.
- **Ghost Writing**: AI ajanları sentez yaptıkça Monaco Editor içeriği satır satır veya blok blok güncellenerek "yaşayan kod" etkisi yaratılır.
- **Injection Monitor**: `// AUTONOM_...` markerları arasındaki değişimler AI tarafından otomatik yakalanır ve güncellenir.

## 🧠 3. Çok Modlu Ajan Entegrasyonu (IDE Katmanı)

IDE içindeki ajanlar artık sadece metin tabanlı değil, **Kod-Analitik** seviyesindedir:

1.  **Bora Demir (Mühendislik)**: AST Parse ve build denetimi. `registry.ts` otonom kaydı.
2.  **Elif Yıldız (Pedagoji)**: ZPD ve pedagojik çerçeve onayı.
3.  **Dr. Ahmet Kaya (Klinik)**: Klinik hiyerarşi ve dikkat yönetimi.
4.  **Selin Arslan (AI)**: Gemini Vision ile multimodal klonlama ve React sentezi.

## 🛠️ Teknik Envanter & Stabilizasyon

- **Editor**: `@monaco-editor/react` (v0.4.x+)
- **State Management**: `useState` tabanlı VFS Store (Bellek içi simülasyon)
- **Styling**: Tailwind CSS + Framer Motion
- **Problem Çözümü**: `@monaco-editor/react` modül çözümleme hataları (Lint) için `// @ts-ignore` veya global d.ts tanımları kullanılmalıdır (Lokal kurulum gereksinimleri nedeniyle).

## 🎯 Final Hedef
Öğretmen, "Bana 3. sınıf düzeyi için görsel referanstaki gibi bir etkinlik yap" dediğinde; motor görseli analiz eder, kodları yazar, register eder ve önizlemede gösterir. Tüm bu süreç 30 saniyenin altında tamamlanır.

---
*Blueprint Sürümü: v2.5 Professional — Antigravity Engine*

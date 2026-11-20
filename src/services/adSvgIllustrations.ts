/**
 * Prof. Dr. Görkem Çetin — Ordinaryüs Baş Grafiker & Vektörel Görsel Mimarı
 * bdmind Reklam Stüdyosu Saf SVG İllüstrasyon Motoru
 *
 * Standartlar:
 * - WCAG AA/AAA kontrast garantisi
 * - Disleksiye özel pastel paletler (#4F46E5, #0D9488, #E11D48, #F59E0B, #1E293B, #7C3AED)
 * - Sıfır görsel gürültü, yüksek vektörel netlik
 * - Hem storyboard sahnelerinde hem de cihaz mockup'larında doğrudan render edilir
 */

export type AdIllustrationTheme =
  | 'student_success'
  | 'neuro_diversity'
  | 'math_lab'
  | 'reading_story'
  | 'teacher_time'
  | 'parent_trust'
  | 'school_admin'
  | 'default_brand';

export function getSvgIllustration(theme: AdIllustrationTheme, primaryColor = '#4F46E5', secondaryColor = '#0D9488'): string {
  switch (theme) {
    case 'student_success':
      return `<svg viewBox="0 0 400 280" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto">
  <defs>
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0f172a" />
      <stop offset="100%" stop-color="#1e1b4b" />
    </linearGradient>
    <linearGradient id="accentGrad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="${primaryColor}" />
      <stop offset="100%" stop-color="${secondaryColor}" />
    </linearGradient>
    <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="8" result="blur" />
      <feComposite in="SourceGraphic" in2="blur" operator="over" />
    </filter>
  </defs>
  <rect width="400" height="280" rx="20" fill="url(#bgGrad)" />
  <circle cx="200" cy="140" r="100" fill="${primaryColor}" opacity="0.12" filter="url(#glow)" />
  <!-- Başarı Rozeti ve Yıldızlar -->
  <circle cx="200" cy="115" r="46" fill="url(#accentGrad)" opacity="0.9" />
  <path d="M200 85 L208 102 L226 104 L212 116 L216 134 L200 124 L184 134 L188 116 L174 104 L192 102 Z" fill="#ffffff" />
  <!-- Yükselen Başarı Çizelgesi -->
  <path d="M70 210 Q 140 180, 200 170 T 330 110" fill="none" stroke="${secondaryColor}" stroke-width="4" stroke-linecap="round" stroke-dasharray="2 0" />
  <circle cx="330" cy="110" r="7" fill="#34D399" filter="url(#glow)" />
  <!-- Açık Kitap Tabanı -->
  <path d="M140 215 C 170 205, 190 205, 200 215 C 210 205, 230 205, 260 215 L 255 235 C 225 225, 210 225, 200 235 C 190 225, 175 225, 145 235 Z" fill="#334155" opacity="0.8" />
  <!-- Disleksi Dostu Tipografi & Slogan -->
  <text x="200" y="258" text-anchor="middle" font-family="'Lexend', sans-serif" font-weight="700" font-size="13" fill="#E2E8F0">Öğrenme Potansiyelini Keşfet</text>
</svg>`;

    case 'neuro_diversity':
      return `<svg viewBox="0 0 400 280" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="brainBg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#090514" />
      <stop offset="100%" stop-color="#180d38" />
    </linearGradient>
    <linearGradient id="synapseGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#8B5CF6" />
      <stop offset="50%" stop-color="#06B6D4" />
      <stop offset="100%" stop-color="#F59E0B" />
    </linearGradient>
  </defs>
  <rect width="400" height="280" rx="20" fill="url(#brainBg)" />
  <!-- Nöron Ağları ve Sinaps Işıkları -->
  <circle cx="200" cy="130" r="65" fill="#8B5CF6" opacity="0.15" />
  <circle cx="150" cy="110" r="14" fill="#06B6D4" opacity="0.8" />
  <circle cx="250" cy="110" r="14" fill="#F59E0B" opacity="0.8" />
  <circle cx="200" cy="80" r="16" fill="#8B5CF6" opacity="0.9" />
  <circle cx="160" cy="160" r="12" fill="#EC4899" opacity="0.8" />
  <circle cx="240" cy="160" r="12" fill="#10B981" opacity="0.8" />
  <circle cx="200" cy="150" r="18" fill="#F43F5E" opacity="0.9" />
  <!-- Bağlantı Yolları -->
  <line x1="200" y1="80" x2="150" y2="110" stroke="#06B6D4" stroke-width="2" stroke-opacity="0.6" />
  <line x1="200" y1="80" x2="250" y2="110" stroke="#F59E0B" stroke-width="2" stroke-opacity="0.6" />
  <line x1="150" y1="110" x2="160" y2="160" stroke="#EC4899" stroke-width="2" stroke-opacity="0.6" />
  <line x1="250" y1="110" x2="240" y2="160" stroke="#10B981" stroke-width="2" stroke-opacity="0.6" />
  <line x1="160" y1="160" x2="200" y2="150" stroke="#8B5CF6" stroke-width="2.5" stroke-opacity="0.7" />
  <line x1="240" y1="160" x2="200" y2="150" stroke="#8B5CF6" stroke-width="2.5" stroke-opacity="0.7" />
  <!-- Slogan -->
  <text x="200" y="225" text-anchor="middle" font-family="'Lexend', sans-serif" font-weight="700" font-size="14" fill="#F1F5F9">Farklı Beyinler, Özgün Çözümler</text>
  <text x="200" y="248" text-anchor="middle" font-family="'Lexend', sans-serif" font-weight="400" font-size="10" fill="#94A3B8">Disleksi & DEHB Dostu Sarmal Öğrenme</text>
</svg>`;

    case 'math_lab':
      return `<svg viewBox="0 0 400 280" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="mathBg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0f172a" />
      <stop offset="100%" stop-color="#022c22" />
    </linearGradient>
  </defs>
  <rect width="400" height="280" rx="20" fill="url(#mathBg)" />
  <!-- 3D Geometrik Küp Çizimi -->
  <polygon points="200,60 260,95 200,130 140,95" fill="#0D9488" opacity="0.85" />
  <polygon points="140,95 200,130 200,200 140,165" fill="#0F766E" opacity="0.9" />
  <polygon points="200,130 260,95 260,165 200,200" fill="#14B8A6" opacity="0.75" />
  <!-- Koordinat Çizgileri -->
  <line x1="60" y1="180" x2="340" y2="180" stroke="#334155" stroke-width="1.5" />
  <line x1="200" y1="40" x2="200" y2="220" stroke="#334155" stroke-width="1.5" stroke-dasharray="4 3" />
  <!-- Rozetler -->
  <rect x="70" y="70" width="60" height="26" rx="6" fill="#134e4a" border="1px solid #14b8a6" />
  <text x="100" y="87" text-anchor="middle" font-family="'Lexend', sans-serif" font-weight="700" font-size="11" fill="#5eead4">∑ Futoshiki</text>
  <rect x="270" y="70" width="60" height="26" rx="6" fill="#134e4a" />
  <text x="300" y="87" text-anchor="middle" font-family="'Lexend', sans-serif" font-weight="700" font-size="11" fill="#5eead4">3D Hacim</text>
  <text x="200" y="250" text-anchor="middle" font-family="'Lexend', sans-serif" font-weight="700" font-size="13" fill="#F1F5F9">Görsel & Dokunsal Matematik Stüdyosu</text>
</svg>`;

    case 'reading_story':
      return `<svg viewBox="0 0 400 280" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="readBg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#18181b" />
      <stop offset="100%" stop-color="#31102f" />
    </linearGradient>
  </defs>
  <rect width="400" height="280" rx="20" fill="url(#readBg)" />
  <!-- Açık Masal Kitabı -->
  <path d="M80 180 C 140 160, 180 160, 200 175 C 220 160, 260 160, 320 180 L 320 100 C 260 80, 220 80, 200 95 C 180 80, 140 80, 80 100 Z" fill="#FBCFE8" opacity="0.9" />
  <path d="M200 95 L 200 175" stroke="#BE185D" stroke-width="3" />
  <!-- Renkli Heceler & Harfler -->
  <g transform="translate(110, 120)">
    <rect width="32" height="22" rx="4" fill="#4F46E5" />
    <text x="16" y="16" text-anchor="middle" font-family="'Lexend', sans-serif" font-size="11" font-weight="700" fill="#ffffff">A-</text>
  </g>
  <g transform="translate(146, 120)">
    <rect width="36" height="22" rx="4" fill="#0D9488" />
    <text x="18" y="16" text-anchor="middle" font-family="'Lexend', sans-serif" font-size="11" font-weight="700" fill="#ffffff">RA-</text>
  </g>
  <g transform="translate(216, 120)">
    <rect width="32" height="22" rx="4" fill="#E11D48" />
    <text x="16" y="16" text-anchor="middle" font-family="'Lexend', sans-serif" font-size="11" font-weight="700" fill="#ffffff">BA</text>
  </g>
  <!-- Işıltılar -->
  <circle cx="200" cy="65" r="4" fill="#FDE047" />
  <circle cx="160" cy="70" r="3" fill="#FDE047" />
  <circle cx="240" cy="70" r="3" fill="#FDE047" />
  <text x="200" y="235" text-anchor="middle" font-family="'Lexend', sans-serif" font-weight="700" font-size="14" fill="#FDF2F8">Sarı Kitap: 6 Hızlı Okuma Tekniği</text>
  <text x="200" y="255" text-anchor="middle" font-family="'Lexend', sans-serif" font-weight="400" font-size="10" fill="#F472B6">Pencere · Nokta · Köprü · Çift Metin</text>
</svg>`;

    case 'teacher_time':
      return `<svg viewBox="0 0 400 280" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="teacherBg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0f172a" />
      <stop offset="100%" stop-color="#1e293b" />
    </linearGradient>
  </defs>
  <rect width="400" height="280" rx="20" fill="url(#teacherBg)" />
  <!-- Kronometre / Zaman Tasarrufu Çemberi -->
  <circle cx="150" cy="120" r="50" fill="none" stroke="#334155" stroke-width="8" />
  <circle cx="150" cy="120" r="50" fill="none" stroke="#38BDF8" stroke-width="8" stroke-dasharray="314" stroke-dashoffset="80" stroke-linecap="round" />
  <text x="150" y="118" text-anchor="middle" font-family="'Lexend', sans-serif" font-size="18" font-weight="800" fill="#F8FAFC">%85</text>
  <text x="150" y="135" text-anchor="middle" font-family="'Lexend', sans-serif" font-size="8" font-weight="600" fill="#94A3B8">ZAMAN KAZANCI</text>
  <!-- A4 Çalışma Kâğıdı Kartı -->
  <rect x="230" y="70" width="90" height="120" rx="6" fill="#1E293B" stroke="#475569" stroke-width="1.5" />
  <rect x="242" y="85" width="66" height="6" rx="2" fill="#38BDF8" />
  <rect x="242" y="100" width="50" height="4" rx="2" fill="#64748B" />
  <rect x="242" y="112" width="60" height="4" rx="2" fill="#64748B" />
  <rect x="242" y="124" width="40" height="4" rx="2" fill="#64748B" />
  <circle cx="288" cy="165" r="12" fill="#10B981" />
  <path d="M283 165 L287 169 L294 161" fill="none" stroke="#ffffff" stroke-width="2" stroke-linecap="round" />
  <text x="200" y="240" text-anchor="middle" font-family="'Lexend', sans-serif" font-weight="700" font-size="13" fill="#F1F5F9">Öğretmenler İçin 1 Tıkla Hazır MEB BEP</text>
</svg>`;

    case 'parent_trust':
      return `<svg viewBox="0 0 400 280" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="trustBg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#1e1b4b" />
      <stop offset="100%" stop-color="#431407" />
    </linearGradient>
  </defs>
  <rect width="400" height="280" rx="20" fill="url(#trustBg)" />
  <!-- Güven Kalkanı -->
  <path d="M200 65 L255 85 C 255 145, 200 175, 200 185 C 200 175, 145 145, 145 85 Z" fill="#F59E0B" opacity="0.85" />
  <!-- Kalp Simgesi -->
  <path d="M200 135 C 190 120, 175 120, 175 105 C 175 95, 185 88, 195 96 L200 102 L205 96 C 215 88, 225 95, 225 105 C 225 120, 210 120, 200 135 Z" fill="#ffffff" />
  <text x="200" y="225" text-anchor="middle" font-family="'Lexend', sans-serif" font-weight="700" font-size="14" fill="#FEF3C7">Her Çocuk Kendi Hızında Başarır</text>
  <text x="200" y="248" text-anchor="middle" font-family="'Lexend', sans-serif" font-weight="400" font-size="10" fill="#FDE68A">Etik, Bilimsel ve Şefkatli Eğitim Yaklaşımı</text>
</svg>`;

    case 'school_admin':
      return `<svg viewBox="0 0 400 280" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="adminBg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#020617" />
      <stop offset="100%" stop-color="#1e1b4b" />
    </linearGradient>
  </defs>
  <rect width="400" height="280" rx="20" fill="url(#adminBg)" />
  <!-- Okul / B2B Kampüs Binası -->
  <polygon points="120,105 160,75 200,105" fill="#3B82F6" opacity="0.9" />
  <rect x="130" y="105" width="60" height="75" fill="#1E40AF" />
  <rect x="145" y="145" width="30" height="35" rx="3" fill="#60A5FA" />
  <!-- Kurumsal Dashboard Grafiği -->
  <rect x="215" y="80" width="125" height="100" rx="8" fill="#1E293B" stroke="#334155" stroke-width="1.5" />
  <rect x="230" y="135" width="14" height="30" rx="2" fill="#3B82F6" />
  <rect x="252" y="115" width="14" height="50" rx="2" fill="#6366F1" />
  <rect x="274" y="100" width="14" height="65" rx="2" fill="#8B5CF6" />
  <rect x="296" y="90" width="14" height="75" rx="2" fill="#10B981" />
  <text x="200" y="235" text-anchor="middle" font-family="'Lexend', sans-serif" font-weight="700" font-size="13" fill="#F8FAFC">Kurumsal Okul ve Kolej Çözümleri</text>
  <text x="200" y="255" text-anchor="middle" font-family="'Lexend', sans-serif" font-weight="400" font-size="10" fill="#94A3B8">Merkezi Öğrenci Takibi & MEB Müfredat Entegrasyonu</text>
</svg>`;

    case 'default_brand':
    default:
      return `<svg viewBox="0 0 400 280" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="brandDefBg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0f0a2e" />
      <stop offset="100%" stop-color="#2e1065" />
    </linearGradient>
    <linearGradient id="geminiFlow" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${primaryColor}" />
      <stop offset="100%" stop-color="${secondaryColor}" />
    </linearGradient>
  </defs>
  <rect width="400" height="280" rx="20" fill="url(#brandDefBg)" />
  <circle cx="200" cy="115" r="55" fill="url(#geminiFlow)" opacity="0.85" />
  <path d="M200 70 L212 105 L245 115 L212 125 L200 160 L188 125 L155 115 L188 105 Z" fill="#ffffff" />
  <text x="200" y="215" text-anchor="middle" font-family="'Lexend', sans-serif" font-weight="900" font-size="20" fill="#ffffff" letter-spacing="1">bdmind</text>
  <text x="200" y="238" text-anchor="middle" font-family="'Lexend', sans-serif" font-weight="400" font-size="10" fill="#c4b5fd">AI Destekli Nöro-Pedagojik Eğitim Platformu</text>
</svg>`;
  }
}

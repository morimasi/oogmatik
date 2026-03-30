export const INFOGRAPHIC_CATEGORIES = [
    { id: 'visual-spatial', label: '1 - Görsel & Mekansal', icon: 'Eye' },
    { id: 'reading-comprehension', label: '2 - Okuduğunu Anlama', icon: 'BookOpen' },
    { id: 'language-literacy', label: '3 - Dil & Okuryazarlık', icon: 'Languages' },
    { id: 'math-logic', label: '4 - Matematik & Mantık', icon: 'Calculator' },
    { id: 'science', label: '5 - Fen Bilimleri', icon: 'FlaskConical' },
    { id: 'social-studies', label: '6 - Sosyal & Tarih', icon: 'Globe2' },
    { id: 'creative-thinking', label: '7 - Yaratıcı Düşünme', icon: 'Lightbulb' },
    { id: 'learning-strategies', label: '8 - Öğrenme Stratejileri', icon: 'Target' },
    { id: 'spld-support', label: '9 - SpLD Destek (Disleksi/DEHB)', icon: 'ShieldCheck' },
    { id: 'clinical-bep', label: '10 - Klinik & BEP Şablonları', icon: 'Stethoscope' },
];

export type InfographicCategoryId = typeof INFOGRAPHIC_CATEGORIES[number]['id'];

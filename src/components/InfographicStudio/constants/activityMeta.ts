import { ActivityType } from '../../../types/activity';
import { InfographicCategoryId } from './categoryConfig';
import {
    Network, SplitSquareHorizontal, Workflow, Target, FileText, FlaskConical, Languages,
    Map, Beaker, Link, GitMerge, FileArchive, Puzzle, Crosshair, HelpCircle, AlertCircle,
    Share2, Table, Link2, Activity, LayoutGrid, GitCommit, UserSearch, Triangle, Eye,
    Columns, Trees, Clock, Users, Tags, Construction, GitCompare, Search, Combine,
    FileType, ListOrdered, Spline, PieChart, XSquare, Hexagon, BarChart3, Scale, Ruler,
    Grid3X3, ClipboardList, Rainbow, Droplet, Microscope, Globe, Snowflake, Sun, Contact,
    MapPin, Building, Coins, GitPullRequest, CloudLightning, Replace, Brush, Waypoints,
    Wrench, VenetianMask, CalendarClock, BookOpen, Thermometer, HandHeart, PenTool, CheckSquare,
    SpellCheck, Pencil, Calculator, Scissors, Wind, RotateCw, Star, CheckCircle, BrainCircuit,
    AlertTriangle, HeartPulse, Home, Shapes, FastForward, Speech, Hand, ClipboardCheck
} from 'lucide-react';

export interface InfographicActivityMeta {
    id: ActivityType;
    categoryId: InfographicCategoryId;
    title: string;
    description: string;
    icon: any; // Lucide Icon component
}

export const INFOGRAPHIC_ACTIVITIES_META: InfographicActivityMeta[] = [
    // Kat 1: Görsel & Mekansal
    { id: ActivityType.INFOGRAPHIC_CONCEPT_MAP, categoryId: 'visual-spatial', title: 'Kavram Haritası', description: 'Ana konu ve alt kavramların hiyerarşik bağlarını kur.', icon: Network },
    { id: ActivityType.INFOGRAPHIC_COMPARE, categoryId: 'visual-spatial', title: 'Karşılaştırma Tablosu', description: 'İki kavramın benzer ve farklı yönlerini analiz et.', icon: SplitSquareHorizontal },
    { id: ActivityType.INFOGRAPHIC_VISUAL_LOGIC, categoryId: 'visual-spatial', title: 'Görsel Mantık', description: 'Mantıksal sıralama veya desen kurallarını buldur.', icon: Puzzle },
    { id: ActivityType.INFOGRAPHIC_VENN_DIAGRAM, categoryId: 'visual-spatial', title: 'Venn Şeması', description: 'İki konunun ortak kümelerini oluştur.', icon: Target },
    { id: ActivityType.INFOGRAPHIC_MIND_MAP, categoryId: 'visual-spatial', title: 'Zihin Haritası', description: 'Serbest çağrışımlı kollar.', icon: Share2 },
    { id: ActivityType.INFOGRAPHIC_FLOWCHART, categoryId: 'visual-spatial', title: 'Akış Şeması', description: 'Süreçleri ve karar dallarını oluştur.', icon: GitMerge },
    { id: ActivityType.INFOGRAPHIC_MATRIX_ANALYSIS, categoryId: 'visual-spatial', title: 'Matris Analizi', description: 'Dikey ve yatay çapraz analiz et.', icon: Table },
    { id: ActivityType.INFOGRAPHIC_CAUSE_EFFECT, categoryId: 'visual-spatial', title: 'Sebep Sonuç İlişkisi', description: 'Olayın nedenlerini ve sonuçlarını göster.', icon: Link2 },
    { id: ActivityType.INFOGRAPHIC_FISHBONE, categoryId: 'visual-spatial', title: 'Balık Kılçığı', description: 'Bir problemi ana öğelerine böl.', icon: Activity },
    { id: ActivityType.INFOGRAPHIC_CLUSTER_MAP, categoryId: 'visual-spatial', title: 'Kümeleme Haritası', description: 'Hiyerarşik olmayan bilgi kümeleri yarat.', icon: LayoutGrid },

    // Kat 2: Okuduğunu Anlama
    { id: ActivityType.INFOGRAPHIC_5W1H_BOARD, categoryId: 'reading-comprehension', title: '5N1K Panosu', description: 'Metnin temel ögelerini 5N1K ile çözümle.', icon: HelpCircle },
    { id: ActivityType.INFOGRAPHIC_READING_FLOW, categoryId: 'reading-comprehension', title: 'Okuma Akışı', description: 'Giriş, gelişme, sonuç bölümlerini göster.', icon: Workflow },
    { id: ActivityType.INFOGRAPHIC_SEQUENCE, categoryId: 'reading-comprehension', title: 'Olay Örgüsü', description: 'Olayları kronolojik sıraya diz.', icon: GitCommit },
    { id: ActivityType.INFOGRAPHIC_STORY_MAP, categoryId: 'reading-comprehension', title: 'Hikaye Haritası', description: 'Karakter, mekan, problemleri haritalandır.', icon: Map },
    { id: ActivityType.INFOGRAPHIC_CHARACTER_ANALYSIS, categoryId: 'reading-comprehension', title: 'Karakter Analizi', description: 'Karakterin iç/dış özelliklerini incele.', icon: UserSearch },
    { id: ActivityType.INFOGRAPHIC_INFERENCE_CHAIN, categoryId: 'reading-comprehension', title: 'Çıkarım Zinciri', description: 'Metindeki ipuçlarından çıkarımlar yap.', icon: Link },
    { id: ActivityType.INFOGRAPHIC_SUMMARY_PYRAMID, categoryId: 'reading-comprehension', title: 'Özet Piramidi', description: 'Temel bilgiden detaya özet çıkar.', icon: Triangle },
    { id: ActivityType.INFOGRAPHIC_PREDICTION_BOARD, categoryId: 'reading-comprehension', title: 'Tahmin Panosu', description: 'Metin öncesi/sonrası tahminlerde bulun.', icon: Eye },
    { id: ActivityType.INFOGRAPHIC_COMPARE_TEXTS, categoryId: 'reading-comprehension', title: 'Metin Karşılaştırma', description: 'Metinlerin farklı yönlerini listele.', icon: Columns },
    { id: ActivityType.INFOGRAPHIC_THEME_WEB, categoryId: 'reading-comprehension', title: 'Ana Fikir Ağı', description: 'Ana fikri destekleyen düşünceleri göster.', icon: Network },

    // Kat 3: Dil ve Okuryazarlık
    { id: ActivityType.INFOGRAPHIC_SYLLABLE_MAP, categoryId: 'language-literacy', title: 'Hece Haritası', description: 'Kelimeyi hecelerine ayırarak görsel harita çıkar.', icon: Languages },
    { id: ActivityType.INFOGRAPHIC_VOCAB_TREE, categoryId: 'language-literacy', title: 'Kelime Ağacı', description: 'Kökten türeyen yeni kelimeleri sun.', icon: Trees },
    { id: ActivityType.INFOGRAPHIC_TIMELINE_EVENT, categoryId: 'language-literacy', title: 'Zaman Çizelgesi', description: 'Tarihsel süreci çizgide göster.', icon: Clock },
    { id: ActivityType.INFOGRAPHIC_WORD_FAMILY, categoryId: 'language-literacy', title: 'Kelime Ailesi', description: 'Aynı anlama/köke sahip sözcükleri topla.', icon: Users },
    { id: ActivityType.INFOGRAPHIC_PREFIX_SUFFIX, categoryId: 'language-literacy', title: 'Ek-Kök İncelemesi', description: 'Yapım ve çekim eklerini morfolojik haritala.', icon: Tags },
    { id: ActivityType.INFOGRAPHIC_SENTENCE_BUILDER, categoryId: 'language-literacy', title: 'Cümle Mimarı', description: 'Cümlenin ögelerini yapısına göre birleştir.', icon: Construction },
    { id: ActivityType.INFOGRAPHIC_ANTONYM_SYNONYM, categoryId: 'language-literacy', title: 'Zıt ve Eş Anlam', description: 'Kelimenin zıt ve eş anlamlarını kıyasla.', icon: GitCompare },
    { id: ActivityType.INFOGRAPHIC_WORD_ORIGIN, categoryId: 'language-literacy', title: 'Kelime Kökeni', description: 'Tarihsel etimolojik gelişim.', icon: Search },
    { id: ActivityType.INFOGRAPHIC_COMPOUND_WORD, categoryId: 'language-literacy', title: 'Birleşik Kelime', description: 'Yeni anlam yaratan birleşikleri incele.', icon: Combine },
    { id: ActivityType.INFOGRAPHIC_GENRE_CHART, categoryId: 'language-literacy', title: 'Metin Türleri', description: 'Metin türlerinin belirgin özelliklerini açıkla.', icon: FileType },

    // Kat 4: Matematik ve Mantık
    { id: ActivityType.INFOGRAPHIC_MATH_STEPS, categoryId: 'math-logic', title: 'Matematik Adımları', description: 'Problemin çözüm adımlarını göster.', icon: ListOrdered },
    { id: ActivityType.INFOGRAPHIC_NUMBER_LINE, categoryId: 'math-logic', title: 'Sayı Doğrusu', description: 'Sayıları, kesirleri doğru üzerinde görselleştir.', icon: Spline },
    { id: ActivityType.INFOGRAPHIC_FRACTION_VISUAL, categoryId: 'math-logic', title: 'Kesir Gösterimi', description: 'Parça-bütün ilişkisiyle kesir sun.', icon: PieChart },
    { id: ActivityType.INFOGRAPHIC_MULTIPLICATION_MAP, categoryId: 'math-logic', title: 'Çarpım Haritası', description: 'Çarpma işleminin mantığını haritala.', icon: XSquare },
    { id: ActivityType.INFOGRAPHIC_GEOMETRY_EXPLORER, categoryId: 'math-logic', title: 'Geometri Kaşifi', description: 'Köşe, ayrıt ve yüz özelliklerini analiz et.', icon: Hexagon },
    { id: ActivityType.INFOGRAPHIC_DATA_CHART, categoryId: 'math-logic', title: 'Veri Tablosu', description: 'Sıklık/çetele tablosu verilerini grafikleştir.', icon: BarChart3 },
    { id: ActivityType.INFOGRAPHIC_ALGEBRA_BALANCE, categoryId: 'math-logic', title: 'Eşitlik Terazisi', description: 'Cebirsel ifadeleri teraziyle modelle.', icon: Scale },
    { id: ActivityType.INFOGRAPHIC_MEASUREMENT_GUIDE, categoryId: 'math-logic', title: 'Ölçü Rehberi', description: 'Ölçü birim dönüşümlerini göster.', icon: Ruler },
    { id: ActivityType.INFOGRAPHIC_PATTERN_RULE, categoryId: 'math-logic', title: 'Örüntü Kuralı', description: 'Sayı veya şekil örüntü kurallarını bul.', icon: Grid3X3 },
    { id: ActivityType.INFOGRAPHIC_WORD_PROBLEM_MAP, categoryId: 'math-logic', title: 'Problem Haritası', description: 'Verilenler, istenenler ve strateji tasarla.', icon: ClipboardList },

    // Kat 5: Fen Bilimleri
    { id: ActivityType.INFOGRAPHIC_LIFE_CYCLE, categoryId: 'science', title: 'Yaşam Döngüsü', description: 'Süreçlerin evrelerini dairesel olarak sırala.', icon: Rainbow },
    { id: ActivityType.INFOGRAPHIC_FOOD_CHAIN, categoryId: 'science', title: 'Besin Zinciri', description: 'Üreticiden tüketiciye akış şeklinde çiz.', icon: Droplet },
    { id: ActivityType.INFOGRAPHIC_SCIENTIFIC_METHOD, categoryId: 'science', title: 'Bilimsel Yöntem', description: 'Gözlem, hipotez, veri ve sonuç adımları.', icon: FlaskConical },
    { id: ActivityType.INFOGRAPHIC_CELL_DIAGRAM, categoryId: 'science', title: 'Hücre Modeli', description: 'Hücre organelleri ve görevleri.', icon: Microscope },
    { id: ActivityType.INFOGRAPHIC_ECOSYSTEM_WEB, categoryId: 'science', title: 'Besin Ağı', description: 'Ekosistem içindeki çoklu beslenme ilişkileri.', icon: Globe },
    { id: ActivityType.INFOGRAPHIC_STATES_MATTER, categoryId: 'science', title: 'Maddenin Halleri', description: 'Hal değişimleri, ısı alma/verme çapraz inceleme.', icon: Snowflake },
    { id: ActivityType.INFOGRAPHIC_SOLAR_SYSTEM, categoryId: 'science', title: 'Güneş Sistemi', description: 'Gezegenlerin sırasını konumlarıyla modelle.', icon: Sun },
    { id: ActivityType.INFOGRAPHIC_HUMAN_BODY, categoryId: 'science', title: 'Vücut Sistemleri', description: 'Sistemleri ve organları gruplandır.', icon: Contact },

    // Kat 6: Sosyal Bilgiler & Tarih
    { id: ActivityType.INFOGRAPHIC_HISTORICAL_TIMELINE, categoryId: 'social-studies', title: 'Tarih Şeridi', description: 'Tarihi olayları kronolojik olarak açıkla.', icon: Clock },
    { id: ActivityType.INFOGRAPHIC_MAP_EXPLORER, categoryId: 'social-studies', title: 'Harita Kaşifi', description: 'Bölgelerin/mekanların mekansal analizini yap.', icon: MapPin },
    { id: ActivityType.INFOGRAPHIC_CULTURE_COMPARE, categoryId: 'social-studies', title: 'Kültür Karşılaştırması', description: 'Farklı medeniyetlerin kıyası.', icon: GitCompare },
    { id: ActivityType.INFOGRAPHIC_GOVERNMENT_CHART, categoryId: 'social-studies', title: 'Yönetim Şeması', description: 'Kuvvetler ayrılığı ilkesini hiyerarşik göster.', icon: Building },
    { id: ActivityType.INFOGRAPHIC_ECONOMIC_FLOW, categoryId: 'social-studies', title: 'Ekonomi Akışı', description: 'Üretim, dağıtım ve tüketim döngüsü.', icon: Coins },
    { id: ActivityType.INFOGRAPHIC_BIOGRAPHY_BOARD, categoryId: 'social-studies', title: 'Biyografi Panosu', description: 'Tarihi bir şahsiyetin dönüm noktaları.', icon: Contact },
    { id: ActivityType.INFOGRAPHIC_EVENT_ANALYSIS, categoryId: 'social-studies', title: 'Olay Analizi', description: 'Neden-sonuç etki diyagramı.', icon: GitPullRequest },
    { id: ActivityType.INFOGRAPHIC_GEOGRAPHY_PROFILE, categoryId: 'social-studies', title: 'Coğrafya Profili', description: 'Bir bölgenin yapısını analiz et.', icon: Map },

    // Kat 7: Yaratıcı Düşünme
    { id: ActivityType.INFOGRAPHIC_BRAINSTORM_WEB, categoryId: 'creative-thinking', title: 'Beyin Fırtınası', description: 'Konu etrafında özgür fikir üret.', icon: CloudLightning },
    { id: ActivityType.INFOGRAPHIC_SCAMPER, categoryId: 'creative-thinking', title: 'SCAMPER Tekniği', description: 'Nesneyi geliştirmek için 7 yönerge.', icon: Replace },
    { id: ActivityType.INFOGRAPHIC_DESIGN_THINKING, categoryId: 'creative-thinking', title: 'Tasarım Odaklı Düşünme', description: 'Empati, fikir, prototiplendirme.', icon: Brush },
    { id: ActivityType.INFOGRAPHIC_ALTERNATIVE_ENDS, categoryId: 'creative-thinking', title: 'Alternatif Sonlar', description: 'Farklı bitişleri çiz.', icon: Waypoints },
    { id: ActivityType.INFOGRAPHIC_INVENTION_PLAN, categoryId: 'creative-thinking', title: 'İcat Planı', description: 'Yeni bir icat tasarla.', icon: Wrench },
    { id: ActivityType.INFOGRAPHIC_ASSOCIATIONS, categoryId: 'creative-thinking', title: 'Kavramsal Çağrışım', description: 'Sözcük çağrışımlarını görselleştir.', icon: Link },
    { id: ActivityType.INFOGRAPHIC_ROLE_PLAY_SCENARIO, categoryId: 'creative-thinking', title: 'Rol Oynama Senaryosu', description: 'Farklı bakış açılarından durum analizi.', icon: VenetianMask },
    { id: ActivityType.INFOGRAPHIC_FUTURE_VISION, categoryId: 'creative-thinking', title: 'Gelecek Vizyonu', description: 'Geleceği hayal et ve planla.', icon: Eye },

    // Kat 8: Öğrenme Stratejileri
    { id: ActivityType.INFOGRAPHIC_GOAL_SETTING, categoryId: 'learning-strategies', title: 'Hedef Belirleme', description: 'Eğitim hedeflerini adım adım yapılandır.', icon: Target },
    { id: ActivityType.INFOGRAPHIC_TIME_MANAGEMENT, categoryId: 'learning-strategies', title: 'Zaman Yönetimi', description: 'Çalışma planını çizelgede göster.', icon: CalendarClock },
    { id: ActivityType.INFOGRAPHIC_STUDY_PLAN, categoryId: 'learning-strategies', title: 'Çalışma Planı', description: 'Öğrenme stratejilerini planla.', icon: BookOpen },
    { id: ActivityType.INFOGRAPHIC_EMOTION_GAUGE, categoryId: 'learning-strategies', title: 'Duygu Termometresi', description: 'Motivasyonu ve duyguları derecelendir.', icon: Thermometer },
    { id: ActivityType.INFOGRAPHIC_SELF_REFLECTION, categoryId: 'learning-strategies', title: 'Öz Değerlendirme', description: 'Güçlü/zayıf yön analizi.', icon: Search },
    { id: ActivityType.INFOGRAPHIC_MOTIVATION_BOARD, categoryId: 'learning-strategies', title: 'Motivasyon Panosu', description: 'İlham kaynaklarını kümele.', icon: HandHeart },
    { id: ActivityType.INFOGRAPHIC_NOTE_TAKING, categoryId: 'learning-strategies', title: 'Görsel Not Alma', description: 'Cornell veya zihin haritasıyla özetle.', icon: PenTool },
    { id: ActivityType.INFOGRAPHIC_TEST_PREPARATION, categoryId: 'learning-strategies', title: 'Sınava Hazırlık', description: 'Sınav stratejisi listesi.', icon: CheckSquare },

    // Kat 9: SpLD / Özel Destek
    { id: ActivityType.INFOGRAPHIC_DYSLEXIA_READING, categoryId: 'spld-support', title: 'Disleksi Okuma Rehberi', description: 'B/D, P/Q ayrıştırması.', icon: SpellCheck },
    { id: ActivityType.INFOGRAPHIC_DYSGRAPHIA_WRITING, categoryId: 'spld-support', title: 'Disgrafi Yazma Kılavuzu', description: 'Stroke order ve boşluk belirleme.', icon: Pencil },
    { id: ActivityType.INFOGRAPHIC_DYSCALCULIA_MATH, categoryId: 'spld-support', title: 'Diskalkuli Matematik Ağı', description: 'Sayı ve miktar ilişkisi.', icon: Calculator },
    { id: ActivityType.INFOGRAPHIC_ADHD_FOCUS, categoryId: 'spld-support', title: 'DEHB Odak Panosu', description: 'Görevleri küçük parçalara böl.', icon: Scissors },
    { id: ActivityType.INFOGRAPHIC_EXECUTIVE_FUNCTION, categoryId: 'spld-support', title: 'Yürütücü İşlev Şeması', description: 'Organize olma döngüsü.', icon: Workflow },
    { id: ActivityType.INFOGRAPHIC_SENSORY_INTEGRATION, categoryId: 'spld-support', title: 'Duyusal Bütünleme', description: 'Çoklu duyu stratejileri.', icon: Activity },
    { id: ActivityType.INFOGRAPHIC_ANXIETY_RELIEF, categoryId: 'spld-support', title: 'Sınav Kaygısı Çözüm Ağı', description: 'Nefes egzersizleri ve önlemler.', icon: Wind },
    { id: ActivityType.INFOGRAPHIC_SOCIAL_SKILLS, categoryId: 'spld-support', title: 'Sosyal Beceri Tablosu', description: 'Olumlu/olumsuz davranış karşılaştır.', icon: Users },
    { id: ActivityType.INFOGRAPHIC_ROUTINE_BUILDER, categoryId: 'spld-support', title: 'Rutin Oluşturucu', description: 'Döngüsel zaman çizelgesi.', icon: RotateCw },
    { id: ActivityType.INFOGRAPHIC_BEHAVIOR_TRACKER, categoryId: 'spld-support', title: 'Davranış Takip Matrisi', description: 'Yıldız tablosu peliştireci.', icon: Star },

    // Kat 10: Klinik & BEP
    { id: ActivityType.INFOGRAPHIC_BEP_GOAL_MAP, categoryId: 'clinical-bep', title: 'BEP Hedef Haritası', description: 'Gelişimsel hedefler.', icon: Target },
    { id: ActivityType.INFOGRAPHIC_IEP_PROGRESS, categoryId: 'clinical-bep', title: 'BEP İlerleme Takip', description: 'Öğrenci gelişimi zaman çizelgesi.', icon: CheckCircle },
    { id: ActivityType.INFOGRAPHIC_OBSERVATION_MATRIX, categoryId: 'clinical-bep', title: 'Klinik Gözlem Matrisi', description: 'Davranış tetikleyici matrisi (ABC).', icon: Eye },
    { id: ActivityType.INFOGRAPHIC_COGNITIVE_PROFILE, categoryId: 'clinical-bep', title: 'Bilişsel Beceriler Profili', description: 'WISC-IV / PASS analizi.', icon: BrainCircuit },
    { id: ActivityType.INFOGRAPHIC_BEHAVIOR_INTERVENTION, categoryId: 'clinical-bep', title: 'Davranış Müdahale Planı', description: 'Problemli davranış stratejisi.', icon: AlertTriangle },
    { id: ActivityType.INFOGRAPHIC_SENSORY_DIET, categoryId: 'clinical-bep', title: 'Duyusal Diyet Tablosu', description: 'Gün içi duyusal girdi.', icon: HeartPulse },
    { id: ActivityType.INFOGRAPHIC_PARENT_GUIDE, categoryId: 'clinical-bep', title: 'Veli Ev İçi Rehber', description: 'Uzman tavsiyeli ev uygulamaları.', icon: Home },
    { id: ActivityType.INFOGRAPHIC_ACCOMMODATION_LIST, categoryId: 'clinical-bep', title: 'Sınıf İçi Uyarlamalar', description: 'Gerekli esnekliklerin listesi.', icon: Shapes },
    { id: ActivityType.INFOGRAPHIC_TRANSITION_PLAN, categoryId: 'clinical-bep', title: 'Geçiş (Transition) Planı', description: 'Farklı eğitim kademesine geçiş.', icon: FastForward },
    { id: ActivityType.INFOGRAPHIC_SPEECH_THERAPY_TARGET, categoryId: 'clinical-bep', title: 'Dil Terapisi Hedefleri', description: 'Artikülasyon / dil hedefleri.', icon: Speech },
    { id: ActivityType.INFOGRAPHIC_MOTOR_SKILLS, categoryId: 'clinical-bep', title: 'Motor Beceri Gelişimi', description: 'İnce kaba motor ağ.', icon: Hand },
    { id: ActivityType.INFOGRAPHIC_EVALUATION_SUMMARY, categoryId: 'clinical-bep', title: 'Değerlendirme Özeti', description: 'Özel eğitim kurulu uzman özeti.', icon: ClipboardCheck },
];

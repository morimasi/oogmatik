import { AgeGroup, LearningDisabilityProfile } from './creativeStudio';

export type FascicleDifficulty = 'Kolay' | 'Orta' | 'Zor' | 'Karma';

export interface FascicleItem {
  id: string; // Benzersiz öğe ID'si
  originalActivityId?: string; // Daha önce üretilmişse referans ID'si
  type: string; // 'worksheet', 'exam', 'reading', 'visual_perception' vb.
  content: unknown; // Bileşen renderı için JSON/nesne veya markup
  pageCount: number; // Kaç sayfa kaplayacağı (genelde 1)
  difficulty: FascicleDifficulty;

  order: number; // Sıralama indeksi
}

export interface WatermarkSettings {
  enabled: boolean;
  type: 'text' | 'image';
  text: string;
  opacity: number;
  color: string;
  fontSize: number;
  rotation: number;
}

export interface CoverPageSettings {
  enabled: boolean;
  title: string;
  subtitle?: string;
  themeStyle: 'clouds' | 'doodles' | 'garden' | 'dots';
  primaryColor: string;
  showStudentLine: boolean;
  schoolName?: string;
  date?: string;
  customSvgDecorations?: string;
  showTableOfContents?: boolean; // Otomatik İçindekiler Sayfası
  showSummaryPage?: boolean;     // Fasikül Sonu Gelişim & Değerlendirme Sayfası
  summaryNote?: string;          // Özel öğretmen/veli notu
}

export interface AiCoverSuggestion {
  themeStyle: 'clouds' | 'doodles' | 'garden' | 'dots';
  primaryColor: string;
  subtitle: string;
  svgDecorations: string;
}

export interface FasciclePageSettings {
  margin: 'narrow' | 'normal' | 'wide'; // 4mm, 8mm, 15mm
  paperColor: 'white' | 'sepia' | 'yellow' | 'cream' | 'karne'; // Kâğıt teması / Disleksi sarısı
  fontScale: number; // 80, 90, 100, 110, 120 (yüzde)
  orientation: 'portrait' | 'landscape';
}

export interface FascicleMetadata {
  title: string;
  description?: string;
  theme: string; // 'default', 'dark', 'nature', 'tech'
  targetProfile: LearningDisabilityProfile | 'all';
  targetAgeGroup: AgeGroup;
  estimatedDurationMin: number;
  qrEnabled: boolean;
  watermarkText?: string;
  watermarkSettings?: WatermarkSettings;
  coverPageSettings?: CoverPageSettings;
  pageSettings?: FasciclePageSettings; // Word tarzı canlı kâğıt ve sayfa ayarları
}

export interface FascicleDocument {
  id: string;
  createdAt: string;
  updatedAt?: string;
  metadata: FascicleMetadata;
  items: FascicleItem[];
  
  creatorId: string; // Oluşturan öğretmenin ID'si
  assignedStudentIds: string[]; // Atanan öğrencilerin ID'leri
  
  isDraft: boolean; // Taslak mı, yoksa yayınlandı mı?
  pdfUrl?: string; // Eğer yayınlandıysa cloud üzerindeki adresi
  
  // Analytics
  viewCount?: number;
  lastViewedAt?: string;
  
  // AI Curation Info
  executiveSummary?: string; // AI Yönetici / Veli Özeti
}

// AI Curation Prompt & Request Payload'ları için yardımcı tipler
export interface FascicleAiSuggestionRequest {
  studentProfile: LearningDisabilityProfile;
  studentAge: AgeGroup;
  weakTopics: string[]; // Çocuğun zayıf olduğu ör: ["Geometri", "Heceleme"]
  currentItemCount: number;
}
